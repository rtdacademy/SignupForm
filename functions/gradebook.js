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





