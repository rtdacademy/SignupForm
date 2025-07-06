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
const { sanitizeEmail } = require('./utils');
const { 
  updateGradebookItem, 
  initializeGradebook, 
  getCourseConfig,
  trackLessonAccess,
  validateGradebookStructure,
  cleanupLegacyAssessments,
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
    
    // Update gradebook item
    await updateGradebookItem(studentKey, courseId, assessmentId, newScore, itemConfig);
    
    console.log(`✅ Gradebook updated successfully for ${assessmentId} (score changed)`);
    
  } catch (error) {
    console.error('Error updating gradebook on change:', error);
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
    const { courseId, studentEmail } = data.data || data;
    
    // Get user email from data or auth context
    const userEmail = studentEmail || context.auth?.token?.email;
    
    if (!userEmail || !courseId) {
      throw new Error('Missing required parameters: courseId, userEmail');
    }
    
    // Sanitize email for database key
    const studentKey = sanitizeEmail(userEmail);
    
    console.log(`🔍 Validating gradebook structure for ${userEmail} in course ${courseId}`);
    
    // Call the validation function
    const validationResult = await validateGradebookStructure(studentKey, courseId);
    
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

