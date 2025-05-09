/**
 * Firebase utilities for course data management and progress tracking
 */
import { getDatabase, ref, set, get, update, onValue, off } from 'firebase/database';

/**
 * Generates the database path for a student's course data
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @param {String} subPath - Optional sub-path within the course data
 * @returns {String} The full database path
 */
export const getCoursePath = (userEmailKey, courseId, subPath = null) => {
  const basePath = `students/${userEmailKey}/courses/${courseId}`;
  return subPath ? `${basePath}/${subPath}` : basePath;
};

/**
 * Saves course progress for a specific item
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @param {String} itemId - ID of the course item
 * @param {Object} progressData - Progress data to save
 * @returns {Promise} Promise that resolves when data is saved
 */
export const saveItemProgress = async (userEmailKey, courseId, itemId, progressData) => {
  if (!userEmailKey || !courseId || !itemId) {
    throw new Error('Missing required parameters');
  }
  
  const db = getDatabase();
  const progressPath = getCoursePath(userEmailKey, courseId, `progress/${itemId}`);
  const progressRef = ref(db, progressPath);
  
  // Get existing data to merge with new data
  const snapshot = await get(progressRef);
  const existingData = snapshot.exists() ? snapshot.val() : {};
  
  // Merge data and add timestamp
  const updatedData = {
    ...existingData,
    ...progressData,
    updatedAt: new Date().toISOString()
  };
  
  return set(progressRef, updatedData);
};

/**
 * Marks an item as started
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID 
 * @param {String} itemId - ID of the course item
 * @returns {Promise} Promise that resolves when data is saved
 */
export const markItemStarted = (userEmailKey, courseId, itemId) => {
  return saveItemProgress(userEmailKey, courseId, itemId, {
    started: true,
    startedAt: new Date().toISOString()
  });
};

/**
 * Marks an item as completed
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @param {String} itemId - ID of the course item
 * @returns {Promise} Promise that resolves when data is saved
 */
export const markItemCompleted = (userEmailKey, courseId, itemId) => {
  return saveItemProgress(userEmailKey, courseId, itemId, {
    started: true,
    completed: true,
    completedAt: new Date().toISOString()
  });
};

/**
 * Saves assessment results (e.g., quiz or exam scores)
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @param {String} itemId - ID of the assessment item
 * @param {Object} assessmentData - Assessment results data
 * @returns {Promise} Promise that resolves when data is saved
 */
export const saveAssessmentResults = async (userEmailKey, courseId, itemId, assessmentData) => {
  if (!userEmailKey || !courseId || !itemId || !assessmentData) {
    throw new Error('Missing required parameters');
  }
  
  const db = getDatabase();
  const gradebookPath = getCoursePath(userEmailKey, courseId, `gradebook/${itemId}`);
  const gradebookRef = ref(db, gradebookPath);
  
  // Extract assessment data
  const { score, maxScore = 100, answers = {}, feedback = '', timeSpent = 0 } = assessmentData;
  
  // Get existing data to determine attempt number
  const snapshot = await get(gradebookRef);
  const existingData = snapshot.exists() ? snapshot.val() : {};
  const previousAttempts = existingData.attempts || 0;
  
  // Create attempt data
  const attemptData = {
    score,
    maxScore,
    percentage: (score / maxScore) * 100,
    answers,
    feedback,
    timeSpent,
    completedAt: new Date().toISOString()
  };
  
  // Update gradebook with new attempt
  return set(gradebookRef, {
    ...existingData,
    score: (score / maxScore) * 100,
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
 * Fetches all progress data for a course
 * @param {String} userEmailKey - Sanitized email key of the user 
 * @param {Number|String} courseId - Course ID
 * @returns {Promise<Object>} Promise resolving to progress data
 */
export const getCourseProgress = async (userEmailKey, courseId) => {
  if (!userEmailKey || !courseId) {
    throw new Error('Missing required parameters');
  }
  
  const db = getDatabase();
  const progressPath = getCoursePath(userEmailKey, courseId, 'progress');
  const progressRef = ref(db, progressPath);
  
  const snapshot = await get(progressRef);
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Fetches all grade data for a course
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @returns {Promise<Object>} Promise resolving to grade data
 */
export const getCourseGrades = async (userEmailKey, courseId) => {
  if (!userEmailKey || !courseId) {
    throw new Error('Missing required parameters');
  }
  
  const db = getDatabase();
  const gradesPath = getCoursePath(userEmailKey, courseId, 'gradebook');
  const gradesRef = ref(db, gradesPath);
  
  const snapshot = await get(gradesRef);
  return snapshot.exists() ? snapshot.val() : {};
};

/**
 * Sets up a real-time listener for course progress
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function to remove the listener
 */
export const subscribeToCourseProgress = (userEmailKey, courseId, callback) => {
  if (!userEmailKey || !courseId || !callback) {
    throw new Error('Missing required parameters');
  }
  
  const db = getDatabase();
  const progressPath = getCoursePath(userEmailKey, courseId, 'progress');
  const progressRef = ref(db, progressPath);
  
  // Set up the listener
  onValue(progressRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : {};
    callback(data);
  });
  
  // Return unsubscribe function
  return () => off(progressRef);
};

/**
 * Sets up a real-time listener for course grades
 * @param {String} userEmailKey - Sanitized email key of the user
 * @param {Number|String} courseId - Course ID
 * @param {Function} callback - Callback function to handle updates
 * @returns {Function} Unsubscribe function to remove the listener
 */
export const subscribeToCourseGrades = (userEmailKey, courseId, callback) => {
  if (!userEmailKey || !courseId || !callback) {
    throw new Error('Missing required parameters');
  }
  
  const db = getDatabase();
  const gradesPath = getCoursePath(userEmailKey, courseId, 'gradebook');
  const gradesRef = ref(db, gradesPath);
  
  // Set up the listener
  onValue(gradesRef, (snapshot) => {
    const data = snapshot.exists() ? snapshot.val() : {};
    callback(data);
  });
  
  // Return unsubscribe function
  return () => off(gradesRef);
};

export default {
  getCoursePath,
  saveItemProgress,
  markItemStarted,
  markItemCompleted,
  saveAssessmentResults,
  getCourseProgress,
  getCourseGrades,
  subscribeToCourseProgress,
  subscribeToCourseGrades
};