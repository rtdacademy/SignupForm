/**
 * Gradebook Cloud Functions
 * Real-time gradebook updates when assessments are completed
 * 
 * NEW APPROACH (2025): Uses course-config.json as single source of truth
 * Benefits:
 * - Developers only maintain question points in course-config.json
 * - All totals (item, category, course) calculated automatically
 * - No more pattern matching or hardcoded point values
 * - Consistent between frontend gradebook display and backend updates
 * - Easier maintenance and fewer errors
 */

const { onValueWritten } = require('firebase-functions/v2/database');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('./utils');
const { 
  updateGradebookItem, 
  initializeGradebook, 
  getCourseConfig,
  trackLessonAccess,
  validateGradebookStructure,
  cleanupLegacyAssessments,
  recalculateFullGradebook,
  GRADEBOOK_PATHS
} = require('./shared/utilities/database-utils');

/*
 * LEGACY TRIGGER - DISABLED
 * This trigger is disabled because it conflicts with our new assessment-specific triggers.
 * The new system has better coverage:
 * - updateGradebookOnSessionComplete handles session-based assessments
 * - updateGradebookOnAssessmentComplete handles non-session assessments
 * 
 * Trigger: Update gradebook when a new assessment grade is added
 * Listens to: /students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}

exports.updateStudentGradebook = onValueCreated({
  ref: '/students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, assessmentId } = event.params;
  const score = event.data.val();
  
  console.log(`🎓 Gradebook trigger: ${studentKey}/${courseId}/${assessmentId} = ${score}`);
  
  // Skip if score is null (deletion)
  if (score === null || score === undefined) {
    console.log('Score is null/undefined, skipping gradebook update');
    return;
  }
  
  try {
    // The updateGradebookItem function now handles all item configuration lookup
    // using the course-config.json gradebook structure. We just need to pass
    // a minimal legacy itemConfig for backward compatibility.
    const itemConfig = {
      title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      // All other configuration will be determined from course-config.json
    };
    
    // Initialize gradebook if it doesn't exist
    const gradebookPath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing gradebook for student');
      await initializeGradebook(studentKey, courseId);
    }
    
    // Update gradebook item
    await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig);
    
    console.log(`✅ Gradebook updated successfully for ${assessmentId}`);
    
  } catch (error) {
    console.error('Error updating gradebook:', error);
    // Don't throw error to avoid function retries
  }
});
*/

/*
 * LEGACY TRIGGER - DISABLED  
 * This trigger is disabled because it conflicts with our new assessment-specific triggers.
 * The new system has better coverage and avoids double-triggering.
 * 
 * Trigger: Update gradebook when assessment grades are updated
 * Listens to: /students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}

exports.updateStudentGradebookOnChange = onValueUpdated({
  ref: '/students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, assessmentId } = event.params;
  const newScore = event.data.after.val();
  const oldScore = event.data.before.val();
  
  console.log(`🔄 Gradebook update trigger: ${studentKey}/${courseId}/${assessmentId} = ${oldScore} → ${newScore}`);
  
  // Skip if score is null (deletion) or unchanged
  if (newScore === null || newScore === undefined || newScore === oldScore) {
    console.log('Score is null/undefined or unchanged, skipping gradebook update');
    return;
  }
  
  try {
    // The updateGradebookItem function now handles all item configuration lookup
    // using the course-config.json gradebook structure.
    const itemConfig = {
      title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      // All other configuration will be determined from course-config.json
    };
    
    // Instead of updating just this item, recalculate the entire gradebook
    // This ensures all grades stay in sync and handles complex scenarios properly
    console.log(`🔄 Recalculating entire gradebook for ${studentKey}/${courseId}`);
    
    await recalculateFullGradebook(studentKey, courseId);
    
    console.log(`✅ Full gradebook recalculated successfully (triggered by ${assessmentId})`);
    
  } catch (error) {
    console.error('Error updating gradebook on change:', error);
  }
});
*/

/**
 * Trigger: Update gradebook when exam session results are finalized
 * Listens to: /students/{studentKey}/courses/{courseId}/ExamSessions/{sessionId}/finalResults/percentage
 * This handles session-based scoring (assignments, exams, quizzes with multiple attempts)
 * 
 * UPDATED: Now uses onValueWritten to catch both session creation AND updates
 * This ensures teacher sessions trigger gradebook recalculation when first created
 */
exports.updateGradebookOnSessionComplete = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}/ExamSessions/{sessionId}/finalResults/percentage',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, sessionId } = event.params;
  const newPercentage = event.data.after.val();
  const oldPercentage = event.data.before.exists() ? event.data.before.val() : null;
  
  console.log(`🎯 Session gradebook trigger: ${studentKey}/${courseId}/${sessionId} = ${oldPercentage} → ${newPercentage}%`);
  
  // Handle session deletion - we need to recalculate gradebook when sessions are deleted
  if (newPercentage === null || newPercentage === undefined) {
    console.log('🗑️ Session percentage deleted - need to recalculate gradebook to fall back to next best session');
    
    // For deletions, we need to extract the examItemId from the sessionId since session data is gone
    // sessionId format: exam_assignment_l1_4_000kyle,e,brown13@gmail,com_1754081936413
    if (!sessionId.startsWith('exam_')) {
      console.log('Cannot extract examItemId from sessionId for deletion, skipping gradebook update');
      return;
    }
    
    // Extract examItemId by removing 'exam_' prefix and timestamp suffix
    // Strategy: Remove 'exam_' prefix, then remove the last part after the final underscore (timestamp)
    const withoutExamPrefix = sessionId.substring(5); // Remove 'exam_'
    const lastUnderscoreIndex = withoutExamPrefix.lastIndexOf('_');
    const examItemId = lastUnderscoreIndex > 0 ? 
      withoutExamPrefix.substring(0, lastUnderscoreIndex) : 
      withoutExamPrefix;
    
    console.log(`🔄 Recalculating gradebook after session deletion for ${examItemId}`);
    
    try {
      await recalculateFullGradebook(studentKey, courseId);
      console.log(`✅ Gradebook recalculated after session deletion (${examItemId})`);
    } catch (error) {
      console.error('Error recalculating gradebook after session deletion:', error);
    }
    return;
  }
  
  // Skip if percentage unchanged (but allow initial creation when before doesn't exist)
  if (event.data.before.exists() && newPercentage === oldPercentage) {
    console.log('Percentage unchanged, skipping gradebook update');
    return;
  }
  
  try {
    // Get the full session data to extract examItemId and finalResults
    const sessionRef = admin.database().ref(`students/${studentKey}/courses/${courseId}/ExamSessions/${sessionId}`);
    const sessionSnapshot = await sessionRef.once('value');
    const sessionData = sessionSnapshot.val();
    
    if (!sessionData || !sessionData.examItemId || !sessionData.finalResults) {
      console.log('Session data incomplete, skipping gradebook update');
      return;
    }
    
    const { examItemId, finalResults } = sessionData;
    const { score, percentage, maxScore, totalQuestions } = finalResults;
    
    // Determine if this is a creation or update for better logging
    const isCreation = !event.data.before.exists();
    const isTeacherSession = sessionData.isTeacherCreated === true;
    const sessionType = isTeacherSession ? 'TEACHER' : 'STUDENT';
    const operation = isCreation ? 'CREATED' : 'UPDATED';
    
    console.log(`📊 ${sessionType} SESSION ${operation}: ${examItemId} = ${score}/${maxScore} (${percentage}%)`);
    if (isTeacherSession) {
      console.log(`👨‍🏫 Teacher session details: useAsManualGrade=${sessionData.useAsManualGrade}, teacherEmail=${sessionData.teacherEmail}`);
    }
    
    // Create item config for session-based assessment
    const itemConfig = {
      title: examItemId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      isSessionBased: true,
      sessionId: sessionId,
      sessionData: {
        percentage,
        totalQuestions,
        maxScore,
        strategy: sessionData.scoringStrategy || 'takeHighest'
      }
    };
    
    // Initialize gradebook if it doesn't exist
    const gradebookPath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing gradebook for student');
      await initializeGradebook(studentKey, courseId);
    }
    
    // Instead of updating just this item, recalculate the entire gradebook
    // This ensures all grades stay in sync and handles multiple attempts properly
    console.log(`🔄 Recalculating entire gradebook for ${studentKey}/${courseId} (triggered by session ${sessionId})`);
    
    await recalculateFullGradebook(studentKey, courseId, sessionId);
    
    console.log(`✅ Full gradebook recalculated successfully (triggered by ${examItemId})`);
    
  } catch (error) {
    console.error('Error updating gradebook from session:', error);
  }
});

/**
 * Trigger: Update gradebook when non-session assessment scores are recorded
 * Listens to: /students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}
 * This handles individual question-based assessments (lessons, reviews, practice)
 * 
 * UPDATED: Now uses onValueWritten to catch both score creation AND updates
 * This ensures gradebook gets initialized when the first lesson question is answered
 */
exports.updateGradebookOnAssessmentScore = onValueWritten({
  ref: '/students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, assessmentId } = event.params;
  const newScore = event.data.after.val();
  const oldScore = event.data.before.exists() ? event.data.before.val() : null;
  
  console.log(`📝 Assessment score trigger: ${studentKey}/${courseId}/${assessmentId} = ${oldScore} → ${newScore}`);
  
  // Skip if score is null or unchanged (but allow initial creation when before doesn't exist)
  if (newScore === null || newScore === undefined || (event.data.before.exists() && newScore === oldScore)) {
    console.log('Score is null/undefined or unchanged, skipping gradebook update');
    return;
  }
  
  try {
    // Look up the activityType from the Assessments data
    const assessmentRef = admin.database().ref(`students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`);
    const assessmentSnapshot = await assessmentRef.once('value');
    const assessmentData = assessmentSnapshot.val();
    
    if (!assessmentData) {
      console.log(`No assessment data found for ${assessmentId}, skipping gradebook update`);
      return;
    }
    
    const activityType = assessmentData.activityType;
    console.log(`🔍 Assessment activityType: ${activityType}`);
    
    // Skip if this is a session-based assessment (handled by session trigger)
    if (activityType === 'assignment' || activityType === 'exam' || activityType === 'quiz') {
      console.log(`Skipping gradebook update - ${activityType} is session-based`);
      return;
    }
    
    // This is a non-session assessment (lesson, review, practice, etc.)
    console.log(`🔄 Recalculating gradebook for non-session assessment: ${activityType}`);
    
    // Initialize gradebook if it doesn't exist
    const gradebookPath = `students/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing gradebook for student');
      await initializeGradebook(studentKey, courseId);
    }
    
    // Recalculate entire gradebook to ensure sync
    await recalculateFullGradebook(studentKey, courseId);
    
    console.log(`✅ Gradebook recalculated successfully (triggered by ${activityType}: ${assessmentId})`);
    
  } catch (error) {
    console.error('Error updating gradebook from assessment score:', error);
  }
});

/**
 * Trigger: Recalculate all student gradebooks when progression requirements change
 * Listens to: /courses/{courseId}/course-config/progressionRequirements
 * This ensures progression percentages update immediately when requirements change
 */
exports.updateGradebooksOnProgressionChange = onValueWritten({
  ref: '/courses/{courseId}/course-config/progressionRequirements',
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 240
}, async (event) => {
  const { courseId } = event.params;
  const newRequirements = event.data.after.val();
  const oldRequirements = event.data.before.exists() ? event.data.before.val() : null;
  
  console.log(`📊 Progression requirements changed for course ${courseId}`);
  
  // Skip if requirements were deleted
  if (!newRequirements) {
    console.log('Progression requirements deleted, skipping gradebook update');
    return;
  }
  
  // Skip if requirements haven't actually changed (avoid infinite loops)
  if (JSON.stringify(newRequirements) === JSON.stringify(oldRequirements)) {
    console.log('Progression requirements unchanged, skipping gradebook update');
    return;
  }
  
  try {
    // Query studentCourseSummaries efficiently by CourseID (optimized approach)
    const summariesRef = admin.database().ref('studentCourseSummaries');
    const summariesSnapshot = await summariesRef
      .orderByChild('CourseID')
      .equalTo(parseInt(courseId))
      .once('value');
    
    const summaries = summariesSnapshot.val() || {};
    
    if (Object.keys(summaries).length === 0) {
      console.log(`No students found enrolled in course ${courseId}`);
      return;
    }
    
    // Process students in parallel batches
    const studentBatches = [];
    const batchSize = 30; // Larger batches for v2 functions
    let currentBatch = [];
    let studentCount = 0;
    
    for (const [summaryKey, summaryData] of Object.entries(summaries)) {
      const studentEmail = summaryData.StudentEmail;
      if (!studentEmail) continue;
      
      const studentKey = sanitizeEmail(studentEmail);
      studentCount++;
      
      currentBatch.push({ studentKey, courseId });
      
      if (currentBatch.length >= batchSize) {
        studentBatches.push([...currentBatch]);
        currentBatch = [];
      }
    }
    
    // Add remaining students
    if (currentBatch.length > 0) {
      studentBatches.push(currentBatch);
    }
    
    console.log(`📊 Found ${studentCount} students in ${studentBatches.length} batches for course ${courseId}`);
    
    // Process batches in parallel
    for (const [batchIndex, batch] of studentBatches.entries()) {
      console.log(`🔄 Processing batch ${batchIndex + 1}/${studentBatches.length} (${batch.length} students)`);
      
      const batchPromises = batch.map(student =>
        recalculateFullGradebook(student.studentKey, student.courseId).catch(err => {
          console.error(`Failed to recalculate gradebook for ${student.studentKey}:`, err);
          return null; // Don't fail the entire batch
        })
      );
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (batchIndex < studentBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log(`✅ Updated gradebooks for ${studentCount} students in course ${courseId} after progression requirements change`);
    
  } catch (error) {
    console.error('Error updating gradebooks after progression change:', error);
  }
});

/**
 * Trigger: Recalculate all student gradebooks when course structure changes
 * Listens to: /courses/{courseId}/course-config/courseStructure
 * This ensures gradebook items match the latest course structure
 */
exports.updateGradebooksOnStructureChange = onValueWritten({
  ref: '/courses/{courseId}/course-config/courseStructure',
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 240
}, async (event) => {
  const { courseId } = event.params;
  const newStructure = event.data.after.val();
  const oldStructure = event.data.before.exists() ? event.data.before.val() : null;
  
  console.log(`🏗️ Course structure changed for course ${courseId}`);
  
  // Skip if structure was deleted
  if (!newStructure) {
    console.log('Course structure deleted, skipping gradebook update');
    return;
  }
  
  // Skip if structure hasn't actually changed (avoid infinite loops)
  if (JSON.stringify(newStructure) === JSON.stringify(oldStructure)) {
    console.log('Course structure unchanged, skipping gradebook update');
    return;
  }
  
  try {
    // Query studentCourseSummaries efficiently by CourseID (optimized approach)
    const summariesRef = admin.database().ref('studentCourseSummaries');
    const summariesSnapshot = await summariesRef
      .orderByChild('CourseID')
      .equalTo(parseInt(courseId))
      .once('value');
    
    const summaries = summariesSnapshot.val() || {};
    
    if (Object.keys(summaries).length === 0) {
      console.log(`No students found enrolled in course ${courseId}`);
      return;
    }
    
    // Process students in parallel batches
    const studentBatches = [];
    const batchSize = 30; // Larger batches for v2 functions
    let currentBatch = [];
    let studentCount = 0;
    
    for (const [summaryKey, summaryData] of Object.entries(summaries)) {
      const studentEmail = summaryData.StudentEmail;
      if (!studentEmail) continue;
      
      const studentKey = sanitizeEmail(studentEmail);
      studentCount++;
      
      currentBatch.push({ studentKey, courseId });
      
      if (currentBatch.length >= batchSize) {
        studentBatches.push([...currentBatch]);
        currentBatch = [];
      }
    }
    
    // Add remaining students
    if (currentBatch.length > 0) {
      studentBatches.push(currentBatch);
    }
    
    console.log(`📊 Found ${studentCount} students in ${studentBatches.length} batches for course ${courseId}`);
    
    // Process batches in parallel
    for (const [batchIndex, batch] of studentBatches.entries()) {
      console.log(`🔄 Processing batch ${batchIndex + 1}/${studentBatches.length} (${batch.length} students)`);
      
      const batchPromises = batch.map(student =>
        recalculateFullGradebook(student.studentKey, student.courseId).catch(err => {
          console.error(`Failed to recalculate gradebook for ${student.studentKey}:`, err);
          return null; // Don't fail the entire batch
        })
      );
      
      await Promise.all(batchPromises);
      
      // Small delay between batches
      if (batchIndex < studentBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    console.log(`✅ Updated gradebooks for ${studentCount} students in course ${courseId} after structure change`);
    
  } catch (error) {
    console.error('Error updating gradebooks after structure change:', error);
  }
});

/**
 * Callable Function: Optimized Gradebook Recalculation for All Students in a Course
 * Uses studentCourseSummaries for efficient querying of enrolled students
 * Processes students in parallel batches leveraging Firebase v2's concurrency capabilities
 */
exports.recalculateCourseGradebooksOptimized = onCall({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 300,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  try {
    console.log('🚀 Optimized bulk gradebook recalculation requested');
    
    // Validate request data
    const { courseId } = request.data;
    
    if (!courseId) {
      throw new HttpsError('invalid-argument', 'Missing required parameter: courseId');
    }
    
    // Authenticate that the caller is a teacher/staff member
    const { auth } = request;
    if (!auth || !auth.token) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const teacherEmail = auth.token.email;
    
    // Check if the authenticated user is a staff member
    if (!teacherEmail || !teacherEmail.toLowerCase().endsWith('@rtdacademy.com')) {
      throw new HttpsError('permission-denied', 'Only staff members can recalculate gradebooks');
    }
    
    console.log(`👨‍🏫 Staff member ${teacherEmail} requesting optimized gradebook recalculation for course ${courseId}`);
    
    // Query studentCourseSummaries efficiently by CourseID
    const summariesRef = admin.database().ref('studentCourseSummaries');
    const summariesSnapshot = await summariesRef
      .orderByChild('CourseID')
      .equalTo(parseInt(courseId))
      .once('value');
    
    const summaries = summariesSnapshot.val() || {};
    
    if (Object.keys(summaries).length === 0) {
      console.log(`No students found enrolled in course ${courseId}`);
      return {
        success: true,
        message: `No students found in course ${courseId}`,
        timestamp: Date.now(),
        courseId: courseId,
        teacherEmail: teacherEmail,
        stats: {
          totalStudents: 0,
          successful: 0,
          failed: 0
        }
      };
    }
    
    // Extract student information
    const studentBatches = [];
    const studentEmails = [];
    const batchSize = 30; // Leverage v2's concurrency (80 default per instance)
    let currentBatch = [];
    
    for (const [summaryKey, summaryData] of Object.entries(summaries)) {
      const studentEmail = summaryData.StudentEmail;
      if (!studentEmail) {
        console.warn(`Missing StudentEmail in summary ${summaryKey}`);
        continue;
      }
      
      studentEmails.push(studentEmail);
      const studentKey = sanitizeEmail(studentEmail);
      
      currentBatch.push({
        studentKey,
        studentEmail,
        courseId: courseId
      });
      
      // Create batches of 30 students
      if (currentBatch.length >= batchSize) {
        studentBatches.push([...currentBatch]);
        currentBatch = [];
      }
    }
    
    // Add any remaining students to the last batch
    if (currentBatch.length > 0) {
      studentBatches.push(currentBatch);
    }
    
    console.log(`📊 Found ${studentEmails.length} students in ${studentBatches.length} batches`);
    
    // Process batches with true parallel execution
    const allResults = [];
    let processedCount = 0;
    
    for (const [batchIndex, batch] of studentBatches.entries()) {
      console.log(`🔄 Processing batch ${batchIndex + 1}/${studentBatches.length} with ${batch.length} students`);
      
      // Process all students in this batch in parallel
      const batchPromises = batch.map(student => 
        recalculateFullGradebook(student.studentKey, student.courseId)
          .then(() => {
            processedCount++;
            if (processedCount % 10 === 0) {
              console.log(`Progress: ${processedCount}/${studentEmails.length} students processed`);
            }
            return { success: true, studentKey: student.studentKey, studentEmail: student.studentEmail };
          })
          .catch(err => {
            console.error(`Failed to recalculate gradebook for ${student.studentKey}:`, err.message);
            return { success: false, studentKey: student.studentKey, studentEmail: student.studentEmail, error: err.message };
          })
      );
      
      // Wait for this batch to complete before starting the next
      const batchResults = await Promise.all(batchPromises);
      allResults.push(...batchResults);
      
      // Small delay between batches to prevent overwhelming the database
      if (batchIndex < studentBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    
    // Calculate statistics
    const successCount = allResults.filter(r => r.success).length;
    const failureCount = allResults.filter(r => !r.success).length;
    const failedStudents = allResults.filter(r => !r.success).map(r => r.studentEmail);
    
    console.log(`✅ Optimized bulk gradebook recalculation completed: ${successCount} successful, ${failureCount} failed out of ${studentEmails.length} total`);
    
    // Return success response
    return {
      success: true,
      message: `Gradebooks recalculated for ${successCount} students in course ${courseId}`,
      timestamp: Date.now(),
      courseId: courseId,
      teacherEmail: teacherEmail,
      stats: {
        totalStudents: studentEmails.length,
        successful: successCount,
        failed: failureCount,
        batchesProcessed: studentBatches.length,
        batchSize: batchSize
      },
      studentEmails: studentEmails.slice(0, 10), // Return first 10 for verification
      failedStudents: failedStudents.length > 0 ? failedStudents : undefined,
      totalStudentCount: studentEmails.length
    };
    
  } catch (error) {
    console.error('❌ Error in optimized bulk gradebook recalculation:', error);
    
    // Re-throw HttpsError instances as-is
    if (error instanceof HttpsError) {
      throw error;
    }
    
    // Wrap other errors as internal errors
    throw new HttpsError('internal', `Failed to recalculate course gradebooks: ${error.message}`);
  }
});

/**
 * Callable Function: Manual Gradebook Recalculation
 * Allows teachers to manually trigger a full gradebook recalculation for a student
 * This helps resolve data inconsistencies or outdated calculations
 */
exports.recalculateStudentGradebook = onCall({
  region: 'us-central1',
  memory: '512MiB',
  timeoutSeconds: 120,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  try {
    console.log('🔄 Manual gradebook recalculation requested');
    
    // Validate request data
    const { studentEmail, courseId } = request.data;
    
    if (!studentEmail || !courseId) {
      throw new HttpsError('invalid-argument', 'Missing required parameters: studentEmail and courseId');
    }
    
    // Authenticate that the caller is a teacher/staff member
    const { auth } = request;
    if (!auth || !auth.token) {
      throw new HttpsError('unauthenticated', 'Authentication required');
    }
    
    const teacherEmail = auth.token.email;
    
    // Check if the authenticated user is a staff member (ends with @rtdacademy.com)
    if (!teacherEmail || !teacherEmail.toLowerCase().endsWith('@rtdacademy.com')) {
      throw new HttpsError('permission-denied', 'Only staff members can recalculate gradebooks');
    }
    
    console.log(`👨‍🏫 Staff member ${teacherEmail} requesting gradebook recalculation for ${studentEmail} in course ${courseId}`);
    
    // Sanitize the student email for database path
    const studentKey = sanitizeEmail(studentEmail);
    
    // Verify that the student course exists
    const studentCourseRef = admin.database().ref(`students/${studentKey}/courses/${courseId}`);
    const studentCourseSnapshot = await studentCourseRef.once('value');
    
    if (!studentCourseSnapshot.exists()) {
      throw new HttpsError('not-found', `Student ${studentEmail} is not enrolled in course ${courseId}`);
    }
    
    // Trigger the recalculation using the existing utility function
    console.log(`🔄 Starting gradebook recalculation for ${studentKey}/${courseId}`);
    await recalculateFullGradebook(studentKey, courseId);
    
    console.log(`✅ Gradebook recalculation completed successfully for ${studentEmail} in course ${courseId}`);
    
    // Return success response
    return {
      success: true,
      message: 'Gradebook recalculated successfully',
      timestamp: Date.now(),
      studentEmail: studentEmail,
      courseId: courseId,
      teacherEmail: teacherEmail
    };
    
  } catch (error) {
    console.error('❌ Error in manual gradebook recalculation:', error);
    
    // Re-throw HttpsError instances as-is
    if (error instanceof HttpsError) {
      throw error;
    }
    
    // Wrap other errors as internal errors
    throw new HttpsError('internal', `Failed to recalculate gradebook: ${error.message}`);
  }
});





