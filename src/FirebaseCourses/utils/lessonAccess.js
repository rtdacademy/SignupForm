/**
 * Lesson Access Control Utilities
 * 
 * Handles sequential lesson unlocking logic for Firebase courses.
 * Used specifically for Course 4's sequential progression requirements.
 */

/**
 * Determines if sequential access is enabled for a course
 * @param {Object} courseStructure - Course structure configuration
 * @returns {boolean} - Whether sequential access is required
 */
export const isSequentialAccessEnabled = (courseStructure) => {
  const navigation = courseStructure?.courseStructure?.navigation || courseStructure?.navigation;
  return navigation?.allowSkipAhead === false && navigation?.requireCompletion === true;
};

/**
 * Gets the accessibility status for all lessons in a course using assessment-based unlocking
 * @param {Object} courseStructure - Course structure with units and items
 * @param {Object} assessmentData - Student assessment/gradebook data (read from Firebase)
 * @returns {Object} - Map of itemId to accessibility info
 */
export const getLessonAccessibility = (courseStructure, assessmentData = {}) => {
  const accessibility = {};
  
  // If sequential access is not enabled, all lessons are accessible
  if (!isSequentialAccessEnabled(courseStructure)) {
    const allItems = getAllCourseItems(courseStructure);
    allItems.forEach(item => {
      accessibility[item.itemId] = {
        accessible: true,
        reason: 'Sequential access not required'
      };
    });
    return accessibility;
  }
  
  const allItems = getAllCourseItems(courseStructure);
  
  // Sort items by their sequence/order
  const sortedItems = allItems.sort((a, b) => {
    const aUnit = findItemUnit(courseStructure, a.itemId);
    const bUnit = findItemUnit(courseStructure, b.itemId);
    
    // First sort by unit sequence, then by item sequence within unit
    if (aUnit.sequence !== bUnit.sequence) {
      return (aUnit.sequence || 0) - (bUnit.sequence || 0);
    }
    return (a.sequence || 0) - (b.sequence || 0);
  });
  
  // First lesson is always accessible
  if (sortedItems.length > 0) {
    accessibility[sortedItems[0].itemId] = {
      accessible: true,
      reason: 'First lesson'
    };
  }
  
  // Check each subsequent lesson based on assessment completion
  for (let i = 1; i < sortedItems.length; i++) {
    const currentItem = sortedItems[i];
    const previousItem = sortedItems[i - 1];
    
    // Check if previous lesson has assessment attempts/completion
    const isPreviousCompleted = hasCompletedAssessments(previousItem.itemId, assessmentData);
    
    accessibility[currentItem.itemId] = {
      accessible: isPreviousCompleted,
      reason: isPreviousCompleted 
        ? 'Previous lesson assessments completed'
        : `Complete assessments in "${previousItem.title}" to unlock`
    };
  }
  
  return accessibility;
};

/**
 * Checks if a lesson has completed assessments (knowledge checks)
 * @param {string} lessonId - The lesson item ID
 * @param {Object} assessmentData - Assessment/gradebook data from Firebase
 * @returns {boolean} - Whether the lesson has completed assessments
 */
export const hasCompletedAssessments = (lessonId, assessmentData) => {
  // Check multiple possible data sources for assessment completion
  
  // Method 1: Check if lesson has any assessment attempts
  if (assessmentData[lessonId]?.attempts > 0) {
    return true;
  }
  
  // Method 2: Check if lesson has any score recorded
  if (assessmentData[lessonId]?.score > 0) {
    return true;
  }
  
  // Method 3: Check for assessment attempts in gradebook items
  if (assessmentData[lessonId]?.attemptHistory?.length > 0) {
    return true;
  }
  
  // Method 4: Look for any assessment keys that might be related to this lesson
  const lessonAssessmentKeys = Object.keys(assessmentData).filter(key => 
    key.includes(lessonId) || key.includes(lessonId.replace('lesson_', ''))
  );
  
  if (lessonAssessmentKeys.length > 0) {
    return lessonAssessmentKeys.some(key => 
      assessmentData[key]?.attempts > 0 || assessmentData[key]?.score > 0
    );
  }
  
  return false;
};

/**
 * Gets the next accessible lesson for a student
 * @param {Object} courseStructure - Course structure
 * @param {Object} assessmentData - Student assessment data
 * @returns {string|null} - ItemId of next accessible lesson, or null
 */
export const getNextAccessibleLesson = (courseStructure, assessmentData) => {
  const accessibility = getLessonAccessibility(courseStructure, assessmentData);
  const allItems = getAllCourseItems(courseStructure);
  
  // Find the first accessible lesson
  for (const item of allItems) {
    if (accessibility[item.itemId]?.accessible) {
      return item.itemId;
    }
  }
  
  return null;
};

/**
 * Gets the highest unlocked lesson (furthest accessible lesson)
 * @param {Object} courseStructure - Course structure
 * @param {Object} assessmentData - Student assessment data
 * @returns {string|null} - ItemId of highest accessible lesson
 */
export const getHighestAccessibleLesson = (courseStructure, assessmentData) => {
  const accessibility = getLessonAccessibility(courseStructure, assessmentData);
  const allItems = getAllCourseItems(courseStructure);
  
  // Sort items and find the last accessible one
  const sortedItems = allItems.sort((a, b) => {
    const aUnit = findItemUnit(courseStructure, a.itemId);
    const bUnit = findItemUnit(courseStructure, b.itemId);
    
    if (aUnit.sequence !== bUnit.sequence) {
      return (aUnit.sequence || 0) - (bUnit.sequence || 0);
    }
    return (a.sequence || 0) - (b.sequence || 0);
  });
  
  let highestAccessible = null;
  for (const item of sortedItems) {
    if (accessibility[item.itemId]?.accessible) {
      highestAccessible = item.itemId;
    } else {
      break; // Once we hit an inaccessible lesson, stop
    }
  }
  
  return highestAccessible;
};

/**
 * Helper function to get all course items from structure
 * @param {Object} courseStructure - Course structure
 * @returns {Array} - Flattened array of all course items
 */
const getAllCourseItems = (courseStructure) => {
  const items = [];
  const units = courseStructure?.courseStructure?.units || courseStructure?.units || [];
  
  units.forEach(unit => {
    if (unit.items && Array.isArray(unit.items)) {
      items.push(...unit.items);
    }
  });
  
  return items;
};

/**
 * Helper function to find which unit contains an item
 * @param {Object} courseStructure - Course structure
 * @param {string} itemId - Item ID to find
 * @returns {Object} - Unit containing the item
 */
const findItemUnit = (courseStructure, itemId) => {
  const units = courseStructure?.courseStructure?.units || courseStructure?.units || [];
  
  for (const unit of units) {
    if (unit.items && unit.items.some(item => item.itemId === itemId)) {
      return unit;
    }
  }
  
  return { sequence: 0 }; // Default fallback
};

/**
 * Checks if a lesson should be accessible to staff/developers
 * @param {boolean} isStaffView - Whether user has staff privileges
 * @param {boolean} devMode - Whether dev mode is enabled
 * @returns {boolean} - Whether to bypass access restrictions
 */
export const shouldBypassAccessControl = (isStaffView, devMode) => {
  return isStaffView === true || devMode === true;
};