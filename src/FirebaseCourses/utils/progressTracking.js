import { getDatabase, ref, set, get } from 'firebase/database';

/**
 * Updates a student's progress on a course item
 * @param {String} userEmailKey - The sanitized email key of the user
 * @param {Number|String} courseId - The ID of the course
 * @param {String} itemId - The ID of the course item (lesson, assignment, etc.)
 * @param {Object} progressData - Data to save for the progress
 * @returns {Promise} Promise that resolves when data is saved
 */
export const updateItemProgress = async (userEmailKey, courseId, itemId, progressData) => {
  if (!userEmailKey || !courseId || !itemId) {
    throw new Error('Missing required parameters for progress update');
  }
  
  const db = getDatabase();
  const progressRef = ref(db, `students/${userEmailKey}/courses/${courseId}/progress/${itemId}`);
  
  // Merge with existing data rather than overwrite
  const snapshot = await get(progressRef);
  const existingData = snapshot.exists() ? snapshot.val() : {};
  
  return set(progressRef, {
    ...existingData,
    ...progressData,
    updatedAt: new Date().toISOString(),
  });
};

/**
 * Marks a course item as started
 * @param {String} userEmailKey - The sanitized email key of the user
 * @param {Number|String} courseId - The ID of the course
 * @param {String} itemId - The ID of the course item
 * @returns {Promise} Promise that resolves when data is saved
 */
export const markItemStarted = (userEmailKey, courseId, itemId) => {
  return updateItemProgress(userEmailKey, courseId, itemId, {
    started: true,
    startedAt: new Date().toISOString(),
  });
};

/**
 * Marks a course item as completed
 * @param {String} userEmailKey - The sanitized email key of the user
 * @param {Number|String} courseId - The ID of the course
 * @param {String} itemId - The ID of the course item
 * @returns {Promise} Promise that resolves when data is saved
 */
export const markItemCompleted = (userEmailKey, courseId, itemId) => {
  return updateItemProgress(userEmailKey, courseId, itemId, {
    started: true, // Ensure it's marked as started
    completed: true,
    completedAt: new Date().toISOString(),
  });
};

/**
 * Records a student's assessment results
 * @param {String} userEmailKey - The sanitized email key of the user
 * @param {Number|String} courseId - The ID of the course
 * @param {String} itemId - The ID of the assessment item
 * @param {Object} assessmentData - Assessment results data
 * @returns {Promise} Promise that resolves when data is saved
 */
export const saveAssessmentResults = async (userEmailKey, courseId, itemId, assessmentData) => {
  if (!userEmailKey || !courseId || !itemId || !assessmentData) {
    throw new Error('Missing required parameters for assessment results');
  }
  
  const db = getDatabase();
  const gradebookRef = ref(db, `students/${userEmailKey}/courses/${courseId}/gradebook/${itemId}`);
  
  const { score, maxScore = 100, answers = {}, feedback = '', timeSpent = 0 } = assessmentData;
  
  // Get existing attempts data if any
  const snapshot = await get(gradebookRef);
  const existingData = snapshot.exists() ? snapshot.val() : {};
  const previousAttempts = existingData.attempts || 0;
  
  // Store the current attempt data in an array of attempts
  const attemptData = {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    answers,
    feedback,
    timeSpent,
    completedAt: new Date().toISOString(),
  };
  
  // Update with new data
  return set(gradebookRef, {
    ...existingData,
    score: (score / maxScore) * 100, // Store the percentage score for easier calculations
    bestScore: Math.max((score / maxScore) * 100, existingData.bestScore || 0),
    attempts: previousAttempts + 1,
    lastAttemptAt: new Date().toISOString(),
    attemptHistory: [
      ...(existingData.attemptHistory || []),
      attemptData
    ]
  });
};

/**
 * Gets a student's course progress
 * @param {String} userEmailKey - The sanitized email key of the user
 * @param {Number|String} courseId - The ID of the course
 * @returns {Promise<Object>} Promise that resolves with progress data
 */
export const getCourseProgress = async (userEmailKey, courseId) => {
  if (!userEmailKey || !courseId) {
    throw new Error('Missing required parameters for getting course progress');
  }
  
  const db = getDatabase();
  const progressRef = ref(db, `students/${userEmailKey}/courses/${courseId}/progress`);
  
  const snapshot = await get(progressRef);
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Gets a student's course grades
 * @param {String} userEmailKey - The sanitized email key of the user
 * @param {Number|String} courseId - The ID of the course
 * @returns {Promise<Object>} Promise that resolves with grades data
 */
export const getCourseGrades = async (userEmailKey, courseId) => {
  if (!userEmailKey || !courseId) {
    throw new Error('Missing required parameters for getting course grades');
  }
  
  const db = getDatabase();
  const gradesRef = ref(db, `students/${userEmailKey}/courses/${courseId}/gradebook`);
  
  const snapshot = await get(gradesRef);
  return snapshot.exists() ? snapshot.val() : {};
};