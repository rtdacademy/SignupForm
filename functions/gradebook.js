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

const { onValueCreated, onValueUpdated } = require('firebase-functions/v2/database');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { 
  updateGradebookItem, 
  initializeGradebook, 
  getCourseConfig,
  trackLessonAccess,
  validateGradebookStructure,
  GRADEBOOK_PATHS
} = require('./shared/utilities/database-utils');

/**
 * Trigger: Update gradebook when a new assessment grade is added
 * Listens to: /students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}
 */
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
    
    // Check if this is a staff member
    const isStaff = studentKey.includes('@rtdacademy.com') || studentKey.includes('staff');
    
    // Initialize gradebook if it doesn't exist
    const gradebookPath = `${isStaff ? 'staff_testing' : 'students'}/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing gradebook for student');
      await initializeGradebook(studentKey, courseId, isStaff);
    }
    
    // Update gradebook item
    await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig, isStaff);
    
    console.log(`✅ Gradebook updated successfully for ${assessmentId}`);
    
  } catch (error) {
    console.error('Error updating gradebook:', error);
    // Don't throw error to avoid function retries
  }
});

/**
 * Trigger: Update gradebook when assessment grades are updated
 * Listens to: /students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}
 */
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
    
    // Check if this is a staff member
    const isStaff = studentKey.includes('@rtdacademy.com') || studentKey.includes('staff');
    
    // Update gradebook item
    await updateGradebookItem(studentKey, courseId, assessmentId, newScore, itemConfig, isStaff);
    
    console.log(`✅ Gradebook updated successfully for ${assessmentId} (score changed)`);
    
  } catch (error) {
    console.error('Error updating gradebook on change:', error);
  }
});

/**
 * Trigger: Update gradebook when staff test grades are added
 * Listens to: /staff_testing/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}
 */
exports.updateStaffGradebook = onValueCreated({
  ref: '/staff_testing/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, assessmentId } = event.params;
  const score = event.data.val();
  
  console.log(`🧪 Staff gradebook trigger: ${studentKey}/${courseId}/${assessmentId} = ${score}`);
  
  // Skip if score is null (deletion)
  if (score === null || score === undefined) {
    console.log('Score is null/undefined, skipping staff gradebook update');
    return;
  }
  
  try {
    // The updateGradebookItem function now handles all item configuration lookup
    // using the course-config.json gradebook structure.
    const itemConfig = {
      title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      // All other configuration will be determined from course-config.json
    };
    
    // Initialize gradebook if needed
    const gradebookPath = `staff_testing/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing staff gradebook');
      await initializeGradebook(studentKey, courseId, true);
    }
    
    // Update gradebook item (isStaff = true)
    await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig, true);
    
    console.log(`✅ Staff gradebook updated successfully for ${assessmentId}`);
    
  } catch (error) {
    console.error('Error updating staff gradebook:', error);
  }
});

/**
 * Callable function: Track lesson access from frontend
 */
exports.trackLessonAccess = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // Debug logging
    console.log('📧 trackLessonAccess received data:', data);
    console.log('📧 trackLessonAccess context auth:', context.auth?.token?.email);
    
    // Extract parameters
    const actualData = data.data || data;
    const { courseId, lessonId, lessonInfo, studentEmail: dataStudentEmail } = actualData;
    
    // Get user info - check both data and auth context
    let studentEmail = dataStudentEmail || data.studentEmail;
    if (!studentEmail && context.auth?.token?.email) {
      studentEmail = context.auth.token.email;
    }
    
    console.log('📧 Final studentEmail:', studentEmail);
    
    if (!studentEmail) {
      throw new Error('No student email provided');
    }
    
    if (!courseId || !lessonId) {
      throw new Error('Missing required parameters: courseId, lessonId');
    }
    
    // Sanitize email for database key
    const studentKey = studentEmail.replace(/\./g, '_').replace(/@/g, ',');
    const isStaff = studentEmail.includes('@rtdacademy.com');
    
    // Track lesson access
    await trackLessonAccess(studentKey, courseId, lessonId, lessonInfo, isStaff);
    
    console.log(`📚 Tracked lesson access via callable function: ${lessonId}`);
    
    return { 
      success: true, 
      message: 'Lesson access tracked successfully' 
    };
    
  } catch (error) {
    console.error('Error in trackLessonAccess callable function:', error);
    throw new Error(`Failed to track lesson access: ${error.message}`);
  }
});

/**
 * Callable function: Get gradebook summary for a student
 */
exports.getGradebookSummary = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 30,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    const { courseId, studentEmail } = data.data || data;
    
    // Use authenticated user email if not provided
    const userEmail = studentEmail || context.auth?.token?.email;
    
    if (!userEmail || !courseId) {
      throw new Error('Missing required parameters: courseId, userEmail');
    }
    
    // Sanitize email
    const studentKey = userEmail.replace(/\./g, '_').replace(/@/g, ',');
    const isStaff = userEmail.includes('@rtdacademy.com');
    
    // Get gradebook data
    const basePath = isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Gradebook`
                              : `students/${studentKey}/courses/${courseId}/Gradebook`;
    
    const gradebookRef = admin.database().ref(basePath);
    const snapshot = await gradebookRef.once('value');
    
    if (!snapshot.exists()) {
      // Initialize gradebook if it doesn't exist
      await initializeGradebook(studentKey, courseId, isStaff);
      
      // Get the initialized data
      const newSnapshot = await gradebookRef.once('value');
      return newSnapshot.val();
    }
    
    return snapshot.val();
    
  } catch (error) {
    console.error('Error getting gradebook summary:', error);
    throw new Error(`Failed to get gradebook summary: ${error.message}`);
  }
});

/**
 * NEW: Trigger on assessment attempts (not just grades)
 * This captures all student activity including failed attempts
 * Listens to: /students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/timestamp
 */
exports.updateGradebookOnAssessmentAttempt = onValueUpdated({
  ref: '/students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/timestamp',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, assessmentId } = event.params;
  
  console.log(`📝 Assessment attempt trigger: ${studentKey}/${courseId}/${assessmentId}`);
  
  try {
    // Get the full assessment data
    const assessmentPath = `/students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`;
    const assessmentRef = admin.database().ref(assessmentPath);
    const assessmentSnapshot = await assessmentRef.once('value');
    const assessmentData = assessmentSnapshot.val();
    
    if (!assessmentData) {
      console.log('No assessment data found, skipping');
      return;
    }
    
    // Calculate score based on assessment data
    let score = 0;
    if (assessmentData.lastSubmission?.isCorrect) {
      score = assessmentData.pointsValue || 0;
    }
    
    console.log(`📊 Assessment ${assessmentId}: attempts=${assessmentData.attempts}, score=${score}/${assessmentData.pointsValue}`);
    
    // Check if this is a staff member
    const isStaff = studentKey.includes('@rtdacademy.com') || studentKey.includes('staff');
    
    // Initialize gradebook if it doesn't exist
    const gradebookPath = `${isStaff ? 'staff_testing' : 'students'}/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing gradebook for student');
      await initializeGradebook(studentKey, courseId, isStaff);
    }
    
    // Create item config from assessment data
    const itemConfig = {
      title: assessmentData.questionText?.substring(0, 50) + '...' || assessmentId,
      type: assessmentData.activityType || 'lesson',
      pointsValue: assessmentData.pointsValue || 0,
      attempts: assessmentData.attempts || 0,
      status: assessmentData.status || 'attempted'
    };
    
    // Update gradebook item
    await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig, isStaff);
    
    console.log(`✅ Gradebook updated from assessment attempt: ${assessmentId}`);
    
  } catch (error) {
    console.error('Error updating gradebook from assessment attempt:', error);
    // Don't throw error to avoid function retries
  }
});

/**
 * NEW: Trigger on staff assessment attempts
 * Listens to: /staff_testing/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/timestamp
 */
exports.updateStaffGradebookOnAssessmentAttempt = onValueUpdated({
  ref: '/staff_testing/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/timestamp',
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60
}, async (event) => {
  const { studentKey, courseId, assessmentId } = event.params;
  
  console.log(`🧪 Staff assessment attempt trigger: ${studentKey}/${courseId}/${assessmentId}`);
  
  try {
    // Get the full assessment data
    const assessmentPath = `/staff_testing/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`;
    const assessmentRef = admin.database().ref(assessmentPath);
    const assessmentSnapshot = await assessmentRef.once('value');
    const assessmentData = assessmentSnapshot.val();
    
    if (!assessmentData) {
      console.log('No staff assessment data found, skipping');
      return;
    }
    
    // Calculate score based on assessment data
    let score = 0;
    if (assessmentData.lastSubmission?.isCorrect) {
      score = assessmentData.pointsValue || 0;
    }
    
    console.log(`📊 Staff Assessment ${assessmentId}: attempts=${assessmentData.attempts}, score=${score}/${assessmentData.pointsValue}`);
    
    // Initialize gradebook if it doesn't exist
    const gradebookPath = `staff_testing/${studentKey}/courses/${courseId}/Gradebook`;
    const gradebookRef = admin.database().ref(gradebookPath);
    const gradebookSnapshot = await gradebookRef.once('value');
    
    if (!gradebookSnapshot.exists()) {
      console.log('Initializing staff gradebook');
      await initializeGradebook(studentKey, courseId, true);
    }
    
    // Create item config from assessment data
    const itemConfig = {
      title: assessmentData.questionText?.substring(0, 50) + '...' || assessmentId,
      type: assessmentData.activityType || 'lesson',
      pointsValue: assessmentData.pointsValue || 0,
      attempts: assessmentData.attempts || 0,
      status: assessmentData.status || 'attempted'
    };
    
    // Update gradebook item (isStaff = true)
    await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig, true);
    
    console.log(`✅ Staff gradebook updated from assessment attempt: ${assessmentId}`);
    
  } catch (error) {
    console.error('Error updating staff gradebook from assessment attempt:', error);
    // Don't throw error to avoid function retries
  }
});

/**
 * Callable function: Recalculate gradebook for a student (admin only)
 */
exports.recalculateGradebook = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // Check if user is authenticated and is staff
    if (!context.auth || !context.auth.token.email.includes('@rtdacademy.com')) {
      throw new Error('Unauthorized: Admin access required');
    }
    
    const { courseId, studentEmail } = data.data || data;
    
    if (!studentEmail || !courseId) {
      throw new Error('Missing required parameters: courseId, studentEmail');
    }
    
    // Sanitize email
    const studentKey = studentEmail.replace(/\./g, '_').replace(/@/g, ',');
    const isStaff = studentEmail.includes('@rtdacademy.com');
    
    // Get all assessment grades
    const gradesPath = `${isStaff ? 'staff_testing' : 'students'}/${studentKey}/courses/${courseId}/Grades/assessments`;
    const gradesRef = admin.database().ref(gradesPath);
    const gradesSnapshot = await gradesRef.once('value');
    const grades = gradesSnapshot.val() || {};
    
    // Clear existing gradebook items
    const itemsPath = `${isStaff ? 'staff_testing' : 'students'}/${studentKey}/courses/${courseId}/Gradebook/items`;
    const itemsRef = admin.database().ref(itemsPath);
    await itemsRef.remove();
    
    // Recalculate each grade using the new course config approach
    for (const [assessmentId, score] of Object.entries(grades)) {
      // Simple item configuration - the updateGradebookItem function will handle the lookup
      const itemConfig = {
        title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
        // All other configuration will be determined from course-config.json
      };
      
      // Update gradebook item without triggering recalculation
      await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig, isStaff);
    }
    
    console.log(`🔄 Recalculated gradebook for ${studentEmail} in course ${courseId}`);
    
    return { 
      success: true, 
      message: `Recalculated gradebook for ${Object.keys(grades).length} assessments`,
      itemsProcessed: Object.keys(grades).length
    };
    
  } catch (error) {
    console.error('Error recalculating gradebook:', error);
    throw new Error(`Failed to recalculate gradebook: ${error.message}`);
  }
});

/**
 * Cloud Function: Validate gradebook structure for Firebase courses
 * Called from frontend when students access Firebase courses
 * Ensures gradebook is complete and matches course-config.json structure
 */
exports.validateGradebookStructure = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // Authentication check
    if (!context.auth) {
      throw new Error('User must be authenticated');
    }

    const { courseId, studentEmail } = data.data || data;
    const userEmail = studentEmail || context.auth.token.email;
    
    if (!userEmail || !courseId) {
      throw new Error('Missing required parameters: courseId, userEmail');
    }
    
    // Sanitize email for database key
    const studentKey = userEmail.replace(/\./g, '_').replace(/@/g, ',');
    const isStaff = userEmail.includes('@rtdacademy.com');
    
    console.log(`🔍 Validating gradebook structure for ${userEmail} in course ${courseId}`);
    
    // Call the validation function
    const validationResult = await validateGradebookStructure(studentKey, courseId, isStaff);
    
    console.log(`✅ Gradebook validation completed for course ${courseId}:`, {
      isValid: validationResult.isValid,
      missingItems: validationResult.missingItems?.length || 0,
      missingCategories: validationResult.missingCategories?.length || 0,
      wasRebuilt: validationResult.wasRebuilt
    });
    
    return {
      success: true,
      isValid: validationResult.isValid,
      missingItems: validationResult.missingItems,
      missingCategories: validationResult.missingCategories,
      wasRebuilt: validationResult.wasRebuilt,
      message: validationResult.isValid 
        ? 'Gradebook structure is valid' 
        : 'Gradebook structure was updated to match course configuration'
    };
    
  } catch (error) {
    console.error('Error validating gradebook structure:', error);
    throw new Error(`Failed to validate gradebook structure: ${error.message}`);
  }
});