/**
 * Lesson Access Control Utilities
 * 
 * Handles sequential lesson unlocking logic for Firebase courses.
 * Used specifically for Course 4's sequential progression requirements.
 */

import { shouldBypassAllRestrictions } from './authUtils';

/**
 * Determines if sequential access is enabled for a course
 * @param {Object} courseStructure - Course structure configuration
 * @param {Object} courseGradebook - Full course gradebook object (optional, for new settings)
 * @returns {boolean} - Whether sequential access is required
 */
export const isSequentialAccessEnabled = (courseStructure, courseGradebook = null) => {
  // Check new globalSettings approach first (preferred)
  if (courseGradebook?.courseConfig?.globalSettings?.requireSequentialProgress === true) {
    return true;
  }
  
  // Fallback to legacy navigation settings
  const navigation = courseStructure?.courseStructure?.navigation || courseStructure?.navigation;
  return navigation?.allowSkipAhead === false && navigation?.requireCompletion === true;
};

/**
 * Gets the accessibility status for all lessons in a course using assessment-based unlocking
 * @param {Object} courseStructure - Course structure with units and items
 * @param {Object} assessmentData - Student assessment/gradebook data (read from Firebase)
 * @param {Object} courseGradebook - Full course gradebook object with config and courseStructureItems
 * @returns {Object} - Map of itemId to accessibility info
 */
export const getLessonAccessibility = (courseStructure, assessmentData = {}, courseGradebook = null) => {
  const accessibility = {};
  
  // If sequential access is not enabled, all lessons are accessible
  if (!isSequentialAccessEnabled(courseStructure, courseGradebook)) {
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
    const isPreviousCompleted = hasCompletedAssessments(previousItem.itemId, assessmentData, courseGradebook);
    
    // Get required percentage info for better error messages
    let requiredPercentage = null;
    let detailedReason = isPreviousCompleted 
      ? 'Previous lesson assessments completed'
      : `Complete assessments in "${previousItem.title}" to unlock`;
    
    if (!isPreviousCompleted && courseGradebook?.courseConfig?.progressionRequirements?.enabled) {
      const progressionRequirements = courseGradebook.courseConfig.progressionRequirements;
      const lessonOverride = progressionRequirements.lessonOverrides?.[previousItem.itemId];
      requiredPercentage = lessonOverride?.minimumPercentage || progressionRequirements.defaultMinimumPercentage || 80;
      
      const courseStructureItems = courseGradebook.courseStructureItems || {};
      const previousLessonData = courseStructureItems[previousItem.itemId];
      const currentPercentage = previousLessonData?.percentage || 0;
      
      detailedReason = `Need ${requiredPercentage}% in "${previousItem.title}" (currently ${currentPercentage}%)`;
    }
    
    accessibility[currentItem.itemId] = {
      accessible: isPreviousCompleted,
      reason: detailedReason,
      requiredPercentage: requiredPercentage
    };
  }
  
  return accessibility;
};

/**
 * Checks if a lesson has completed assessments with minimum percentage requirements
 * @param {string} lessonId - The lesson item ID
 * @param {Object} assessmentData - Assessment/gradebook data from Firebase
 * @param {Object} courseGradebook - Full course gradebook object with config and courseStructureItems
 * @returns {boolean} - Whether the lesson meets completion requirements
 */
export const hasCompletedAssessments = (lessonId, assessmentData, courseGradebook = null) => {
  // If no course gradebook provided, fall back to legacy completion checking
  if (!courseGradebook) {
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  const courseConfig = courseGradebook.courseConfig;
  const progressionRequirements = courseConfig?.progressionRequirements;
  
  // If percentage-based progression is not enabled, use basic completion check
  if (!progressionRequirements?.enabled) {
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  // Check if lesson data exists in courseStructureItems (aggregated lesson data)
  const courseStructureItems = courseGradebook.courseStructureItems || {};
  const lessonData = courseStructureItems[lessonId];
  
  if (!lessonData) {
    // If no lesson data, fall back to basic check
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  // Get the minimum percentage required for this lesson
  const lessonOverride = progressionRequirements.lessonOverrides?.[lessonId];
  const requiredPercentage = lessonOverride?.minimumPercentage || progressionRequirements.defaultMinimumPercentage || 80;
  
  // Check if lesson percentage meets or exceeds the requirement
  const lessonPercentage = lessonData.percentage || 0;
  const meetsRequirement = lessonPercentage >= requiredPercentage;
  
  // Log for debugging
  console.log(`📊 Lesson ${lessonId}: ${lessonPercentage}% (required: ${requiredPercentage}%) - ${meetsRequirement ? 'UNLOCKED' : 'LOCKED'}`);
  
  return meetsRequirement;
};

/**
 * Legacy completion checking (for backward compatibility)
 * @param {string} lessonId - The lesson item ID
 * @param {Object} assessmentData - Assessment/gradebook data from Firebase
 * @returns {boolean} - Whether the lesson has basic completion
 */
const hasBasicCompletionCheck = (lessonId, assessmentData) => {
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
 * @param {Object} courseGradebook - Full course gradebook object
 * @returns {string|null} - ItemId of next accessible lesson, or null
 */
export const getNextAccessibleLesson = (courseStructure, assessmentData, courseGradebook = null) => {
  const accessibility = getLessonAccessibility(courseStructure, assessmentData, courseGradebook);
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
 * @param {Object} courseGradebook - Full course gradebook object
 * @returns {string|null} - ItemId of highest accessible lesson
 */
export const getHighestAccessibleLesson = (courseStructure, assessmentData, courseGradebook = null) => {
  const accessibility = getLessonAccessibility(courseStructure, assessmentData, courseGradebook);
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
 * Checks if a lesson should be accessible to staff/developers (legacy function)
 * @deprecated Use shouldBypassAllRestrictions from authUtils instead
 * @param {boolean} isStaffView - Whether user has staff privileges
 * @param {boolean} devMode - Whether dev mode is enabled
 * @returns {boolean} - Whether to bypass access restrictions
 */
export const shouldBypassAccessControl = (isStaffView, devMode) => {
  return isStaffView === true || devMode === true;
};

/**
 * Enhanced bypass check that includes developer authorization
 * @param {boolean} isStaffView - Whether user has staff privileges
 * @param {boolean} devMode - Whether dev mode is enabled
 * @param {Object} currentUser - The authenticated user object
 * @param {Object} course - The course object containing courseDetails
 * @returns {boolean} - Whether to bypass access restrictions
 */
export const shouldBypassAccessControlEnhanced = (isStaffView, devMode, currentUser, course) => {
  return shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course);
};