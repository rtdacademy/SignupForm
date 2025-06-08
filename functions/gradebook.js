/**
 * Gradebook Cloud Functions
 * Real-time gradebook updates when assessments are completed
 */

const { onValueCreated, onValueUpdated } = require('firebase-functions/v2/database');
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { 
  updateGradebookItem, 
  initializeGradebook, 
  getCourseConfig,
  trackLessonAccess,
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
    // Get course config to determine activity type and max score
    const courseConfig = await getCourseConfig(courseId);
    
    // Try to determine item type from assessment ID pattern
    let activityType = 'lesson'; // default
    if (assessmentId.includes('assignment') || assessmentId.includes('homework')) {
      activityType = 'assignment';
    } else if (assessmentId.includes('exam') || assessmentId.includes('test')) {
      activityType = 'exam';
    } else if (assessmentId.includes('lab') || assessmentId.includes('laboratory')) {
      activityType = 'lab';
    } else if (assessmentId.includes('project')) {
      activityType = 'project';
    }
    
    // Get max score from course config
    const activityConfig = courseConfig.activityTypes?.[activityType] || {};
    const maxScore = activityConfig.pointValue || score;
    
    // Create item configuration
    const itemConfig = {
      title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      type: activityType,
      unitId: 'unknown', // Will be filled in by lesson tracking
      pointsValue: maxScore,
      maxScore: maxScore,
      weight: 0 // Individual items don't have weights, categories do
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
    // Get course config
    const courseConfig = await getCourseConfig(courseId);
    
    // Determine item type from assessment ID pattern
    let activityType = 'lesson';
    if (assessmentId.includes('assignment') || assessmentId.includes('homework')) {
      activityType = 'assignment';
    } else if (assessmentId.includes('exam') || assessmentId.includes('test')) {
      activityType = 'exam';
    } else if (assessmentId.includes('lab') || assessmentId.includes('laboratory')) {
      activityType = 'lab';
    } else if (assessmentId.includes('project')) {
      activityType = 'project';
    }
    
    // Get max score from course config
    const activityConfig = courseConfig.activityTypes?.[activityType] || {};
    const maxScore = activityConfig.pointValue || newScore;
    
    // Create item configuration
    const itemConfig = {
      title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      type: activityType,
      unitId: 'unknown',
      pointsValue: maxScore,
      maxScore: maxScore,
      weight: 0
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
    // Get course config
    const courseConfig = await getCourseConfig(courseId);
    
    // Determine activity type
    let activityType = 'lesson';
    if (assessmentId.includes('assignment') || assessmentId.includes('homework')) {
      activityType = 'assignment';
    } else if (assessmentId.includes('exam') || assessmentId.includes('test')) {
      activityType = 'exam';
    } else if (assessmentId.includes('lab') || assessmentId.includes('laboratory')) {
      activityType = 'lab';
    } else if (assessmentId.includes('project')) {
      activityType = 'project';
    }
    
    // Get max score from course config
    const activityConfig = courseConfig.activityTypes?.[activityType] || {};
    const maxScore = activityConfig.pointValue || score;
    
    // Create item configuration
    const itemConfig = {
      title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      type: activityType,
      unitId: 'unknown',
      pointsValue: maxScore,
      maxScore: maxScore,
      weight: 0
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
    // Extract parameters
    const { courseId, lessonId, lessonInfo } = data.data || data;
    
    // Get user info
    let studentEmail = data.studentEmail;
    if (!studentEmail && context.auth?.token?.email) {
      studentEmail = context.auth.token.email;
    }
    
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
    
    // Get course config
    const courseConfig = await getCourseConfig(courseId);
    
    // Clear existing gradebook items
    const itemsPath = `${isStaff ? 'staff_testing' : 'students'}/${studentKey}/courses/${courseId}/Gradebook/items`;
    const itemsRef = admin.database().ref(itemsPath);
    await itemsRef.remove();
    
    // Recalculate each grade
    for (const [assessmentId, score] of Object.entries(grades)) {
      // Determine activity type
      let activityType = 'lesson';
      if (assessmentId.includes('assignment') || assessmentId.includes('homework')) {
        activityType = 'assignment';
      } else if (assessmentId.includes('exam') || assessmentId.includes('test')) {
        activityType = 'exam';
      } else if (assessmentId.includes('lab') || assessmentId.includes('laboratory')) {
        activityType = 'lab';
      } else if (assessmentId.includes('project')) {
        activityType = 'project';
      }
      
      // Get max score from course config
      const activityConfig = courseConfig.activityTypes?.[activityType] || {};
      const maxScore = activityConfig.pointValue || score;
      
      // Create item configuration
      const itemConfig = {
        title: assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
        type: activityType,
        unitId: 'unknown',
        pointsValue: maxScore,
        maxScore: maxScore,
        weight: 0
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