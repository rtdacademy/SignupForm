/**
 * Lesson Access Control Utilities
 * 
 * Handles sequential lesson unlocking logic for Firebase courses.
 * Simplified to use pre-calculated Gradebook.items data.
 */

import { shouldBypassAllRestrictions } from './authUtils';
import { getLessonOverride, getOverrideReason } from './staffOverrides';

/**
 * Determines if sequential access is enabled for a course
 * @param {Object} progressionRequirements - Progression requirements from course config
 * @returns {boolean} - Whether sequential access is required
 */
export const isSequentialAccessEnabled = (progressionRequirements) => {
  return progressionRequirements?.enabled === true;
};

/**
 * Gets the accessibility status for all lessons in a course
 * Simplified to use pre-calculated Gradebook.items data
 * @param {Object} courseStructure - Course structure with units and items
 * @param {Object} course - Full course object with Gradebook
 * @param {Object} options - Additional options like developer bypass and staff overrides
 * @returns {Object} - Map of itemId to accessibility info
 */
export const getLessonAccessibility = (courseStructure, course, options = {}) => {
  const accessibility = {};
  const { isDeveloperBypass = false, staffOverrides = {}, progressionExemptions = {} } = options;
  
  // Get progression requirements from the correct location
  const progressionRequirements = course?.courseDetails?.['course-config']?.progressionRequirements;
  
  const allItems = getAllCourseItems(courseStructure);
  
  // If sequential access is not enabled, all lessons are accessible (except dev/staff overrides)
  if (!isSequentialAccessEnabled(progressionRequirements)) {
    allItems.forEach(item => {
      // Check for progression exemption first (even when sequential not enabled, for consistency)
      if (progressionExemptions[item.itemId]) {
        accessibility[item.itemId] = {
          accessible: true,
          reason: 'Prerequisites waived by teacher',
          isExempted: true
        };
        return;
      }
      
      // Check for staff override
      const override = getLessonOverride(staffOverrides, item.itemId);
      if (override) {
        accessibility[item.itemId] = {
          accessible: override.accessible,
          reason: getOverrideReason(override),
          isStaffOverride: true
        };
        return;
      }

      // Check visibility overrides
      const visibility = progressionRequirements?.visibility?.[item.itemId];
      if (visibility === 'never') {
        accessibility[item.itemId] = {
          accessible: false,
          reason: 'Never visible',
          isNeverVisible: true
        };
        return;
      }

      // Check if lesson is in development
      if (item.inDevelopment === true && !isDeveloperBypass) {
        accessibility[item.itemId] = {
          accessible: false,
          reason: 'This lesson is currently being developed'
        };
      } else {
        accessibility[item.itemId] = {
          accessible: true,
          reason: item.inDevelopment === true && isDeveloperBypass 
            ? 'In development - Developer access granted' 
            : 'Sequential access not required'
        };
      }
    });
    return accessibility;
  }
  
  // Sort items by their sequence/order for sequential access
  const sortedItems = allItems.sort((a, b) => {
    const aUnit = findItemUnit(courseStructure, a.itemId);
    const bUnit = findItemUnit(courseStructure, b.itemId);
    
    if (aUnit.sequence !== bUnit.sequence) {
      return (aUnit.sequence || 0) - (bUnit.sequence || 0);
    }
    return (a.sequence || 0) - (b.sequence || 0);
  });
  
  // First lesson is always accessible (unless overridden)
  if (sortedItems.length > 0) {
    const firstItem = sortedItems[0];
    const override = getLessonOverride(staffOverrides, firstItem.itemId);
    
    if (override) {
      accessibility[firstItem.itemId] = {
        accessible: override.accessible,
        reason: getOverrideReason(override),
        isStaffOverride: true
      };
    } else {
      const visibility = progressionRequirements?.visibility?.[firstItem.itemId];
      if (visibility === 'never') {
        accessibility[firstItem.itemId] = {
          accessible: false,
          reason: 'Never visible',
          isNeverVisible: true
        };
      } else if (visibility === 'always') {
        accessibility[firstItem.itemId] = {
          accessible: true,
          reason: 'Always visible',
          isShowAlways: true
        };
      } else {
        accessibility[firstItem.itemId] = {
          accessible: true,
          reason: 'First lesson'
        };
      }
    }
  }
  
  // Check each subsequent lesson based on previous lesson completion
  for (let i = 1; i < sortedItems.length; i++) {
    const currentItem = sortedItems[i];
    const previousItem = sortedItems[i - 1];
    
    // Check for progression exemption first (teacher waived prerequisites)
    if (progressionExemptions[currentItem.itemId]) {
      accessibility[currentItem.itemId] = {
        accessible: true,
        reason: 'Prerequisites waived by teacher',
        isExempted: true
      };
      continue;
    }
    
    // Check for staff override
    const override = getLessonOverride(staffOverrides, currentItem.itemId);
    if (override) {
      accessibility[currentItem.itemId] = {
        accessible: override.accessible,
        reason: getOverrideReason(override),
        isStaffOverride: true
      };
      continue;
    }
    
    // Check visibility overrides
    const visibility = progressionRequirements?.visibility?.[currentItem.itemId];
    if (visibility === 'never') {
      accessibility[currentItem.itemId] = {
        accessible: false,
        reason: 'Never visible',
        isNeverVisible: true
      };
      continue;
    }

    if (visibility === 'always') {
      accessibility[currentItem.itemId] = {
        accessible: true,
        reason: 'Always visible',
        isShowAlways: true
      };
      continue;
    }
    
    // Check if current lesson is in development
    if (currentItem.inDevelopment === true && !isDeveloperBypass) {
      accessibility[currentItem.itemId] = {
        accessible: false,
        reason: 'This lesson is currently being developed'
      };
      continue;
    }
    
    // Check if previous lesson is completed using simplified logic
    const isPreviousCompleted = checkItemCompletion(
      previousItem.itemId,
      course,
      progressionRequirements
    );
    
    // Generate detailed reason for locked lessons
    let detailedReason = isPreviousCompleted 
      ? 'Previous lesson completed'
      : `Complete "${previousItem.title}" to unlock`;
    
    if (!isPreviousCompleted && progressionRequirements?.enabled) {
      const previousItemData = course?.Gradebook?.items?.[previousItem.itemId];
      const itemType = getItemType(previousItem.itemId, course);
      const criteria = getCompletionCriteria(previousItem.itemId, itemType, progressionRequirements);
      
      if (itemType === 'lesson' && previousItemData) {
        const currentPercentage = Math.round(previousItemData.percentage || 0);
        const requiredPercentage = criteria.minimumPercentage || 50;
        
        if (criteria.requireAllQuestions) {
          detailedReason = `Need ${requiredPercentage}% score + all questions in "${previousItem.title}" (currently ${currentPercentage}%, ${previousItemData.attempted}/${previousItemData.totalQuestions} questions)`;
        } else {
          detailedReason = `Need ${requiredPercentage}% score in "${previousItem.title}" (currently ${currentPercentage}%)`;
        }
      } else if (['assignment', 'exam', 'quiz'].includes(itemType)) {
        detailedReason = `Complete ${criteria.sessionsRequired || 1} session(s) of "${previousItem.title}" to unlock`;
      } else if (itemType === 'lab') {
        detailedReason = `Submit all required work for "${previousItem.title}" to unlock`;
      }
    }
    
    // Special handling for lessons in development
    if (currentItem.inDevelopment === true && isDeveloperBypass) {
      detailedReason = 'In development - Developer access granted';
    }
    
    accessibility[currentItem.itemId] = {
      accessible: isPreviousCompleted,
      reason: detailedReason,
      requiredPercentage: progressionRequirements?.enabled ? 
        (getCompletionCriteria(previousItem.itemId, getItemType(previousItem.itemId, course), progressionRequirements).minimumPercentage || null) : null
    };
  }
  
  return accessibility;
};

/**
 * Simplified function to check if an item meets completion requirements
 * Uses pre-calculated Gradebook.items data
 * @param {string} itemId - The item ID to check
 * @param {Object} course - Full course object with Gradebook
 * @param {Object} progressionRequirements - Progression requirements config
 * @returns {boolean} - Whether the item is completed
 */
export const checkItemCompletion = (itemId, course, progressionRequirements) => {
  // Check manual completion status first
  const gradebookItem = course?.Gradebook?.items?.[itemId];
  
  if (!gradebookItem) {
    return false;
  }
  
  // If manually marked as completed, it's complete
  if (gradebookItem.status === 'completed' || 
      gradebookItem.status === 'manually_graded' ||
      gradebookItem.completed === true) {
    return true;
  }
  
  // If progression requirements not enabled, any attempt counts as complete
  if (!progressionRequirements?.enabled) {
    return gradebookItem.attempted > 0 || gradebookItem.percentage > 0;
  }
  
  // Get item type and criteria
  const itemType = getItemType(itemId, course);
  const criteria = getCompletionCriteria(itemId, itemType, progressionRequirements);
  
  // Check based on item type
  if (itemType === 'lesson') {
    const minimumPercentage = criteria.minimumPercentage ?? 50;
    const meetsQuestions = !criteria.requireAllQuestions || 
                          gradebookItem.attempted >= gradebookItem.totalQuestions;
    
    // If minimum percentage is 0, only check that all questions are attempted
    if (minimumPercentage === 0 && criteria.requireAllQuestions) {
      return meetsQuestions;
    }
    
    // Otherwise check both percentage and questions
    const meetsPercentage = gradebookItem.percentage >= minimumPercentage;
    return meetsPercentage && meetsQuestions;
  }
  
  // For assignments, exams, quizzes - check session completion
  if (['assignment', 'exam', 'quiz'].includes(itemType)) {
    return checkSessionCompletion(itemId, course, criteria);
  }
  
  // For labs - check submission
  if (itemType === 'lab') {
    return checkLabSubmission(itemId, course, criteria);
  }
  
  // Default fallback
  return gradebookItem.percentage >= 50;
};

/**
 * Get the type of an item from course config
 * @param {string} itemId - The item ID
 * @param {Object} course - Course object with config
 * @returns {string} - Item type (lesson, assignment, exam, quiz, lab)
 */
const getItemType = (itemId, course) => {
  const itemStructure = course?.courseDetails?.['course-config']?.gradebook?.itemStructure;
  const itemConfig = itemStructure?.[itemId];
  return itemConfig?.type || 'lesson';
};

/**
 * Get completion criteria for an item
 * @param {string} itemId - The item ID
 * @param {string} itemType - Type of the item
 * @param {Object} progressionRequirements - Progression requirements config
 * @returns {Object} - Completion criteria for the item
 */
const getCompletionCriteria = (itemId, itemType, progressionRequirements) => {
  const lessonOverride = progressionRequirements?.lessonOverrides?.[itemId];
  const defaultCriteria = progressionRequirements?.defaultCriteria?.[itemType] || 
                          progressionRequirements?.defaultCriteria || {};
  
  if (itemType === 'lesson') {
    return {
      minimumPercentage: lessonOverride?.minimumPercentage ?? 
                        defaultCriteria.minimumPercentage ?? 50,
      requireAllQuestions: lessonOverride?.requireAllQuestions ?? 
                          defaultCriteria.requireAllQuestions ?? false
    };
  } else if (['assignment', 'exam', 'quiz'].includes(itemType)) {
    return {
      sessionsRequired: lessonOverride?.sessionsRequired ?? 
                       defaultCriteria.sessionsRequired ?? 1
    };
  } else if (itemType === 'lab') {
    return {
      requiresSubmission: lessonOverride?.requiresSubmission ?? 
                         defaultCriteria.requiresSubmission ?? true
    };
  }
  
  return defaultCriteria;
};

/**
 * Check session-based completion for assignments/exams/quizzes
 * @param {string} itemId - The item ID
 * @param {Object} course - Course object with ExamSessions
 * @param {Object} criteria - Completion criteria
 * @returns {boolean} - Whether sessions requirement is met
 */
const checkSessionCompletion = (itemId, course, criteria) => {
  const sessionsRequired = criteria.sessionsRequired || 1;
  const examSessions = course?.ExamSessions || {};
  
  const completedSessions = Object.values(examSessions).filter(session => {
    return session?.examItemId === itemId && session?.status === 'completed';
  });
  
  return completedSessions.length >= sessionsRequired;
};

/**
 * Check lab submission completion
 * @param {string} itemId - The lab item ID
 * @param {Object} course - Course object with Assessments
 * @param {Object} criteria - Completion criteria
 * @returns {boolean} - Whether lab submission requirement is met
 */
const checkLabSubmission = (itemId, course, criteria) => {
  if (!criteria.requiresSubmission) {
    return true;
  }
  
  const itemStructure = course?.courseDetails?.['course-config']?.gradebook?.itemStructure;
  const labConfig = itemStructure?.[itemId];
  
  if (!labConfig?.questions) {
    return false;
  }
  
  const assessments = course?.Assessments || {};
  
  // Check if all lab questions have submissions
  return labConfig.questions.every(question => {
    return assessments.hasOwnProperty(question.questionId);
  });
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
  
  return { sequence: 0 };
};

/**
 * Legacy function maintained for backward compatibility
 * @deprecated Use checkItemCompletion instead
 */
export const hasCompletedAssessments = (lessonId, assessmentData, courseGradebook = null, progressionRequirements = null) => {
  // Redirect to new simplified function if we have course data
  if (courseGradebook) {
    return checkItemCompletion(lessonId, courseGradebook, progressionRequirements);
  }
  
  // Legacy fallback for old code
  return assessmentData?.[lessonId]?.attempts > 0 || 
         assessmentData?.[lessonId]?.score > 0;
};

/**
 * Gets the next accessible lesson for a student
 * @param {Object} courseStructure - Course structure
 * @param {Object} course - Full course object
 * @param {Object} options - Options including staff overrides
 * @returns {string|null} - ItemId of next accessible lesson
 */
export const getNextAccessibleLesson = (courseStructure, course, options = {}) => {
  const accessibility = getLessonAccessibility(courseStructure, course, options);
  const allItems = getAllCourseItems(courseStructure);
  
  for (const item of allItems) {
    if (accessibility[item.itemId]?.accessible) {
      return item.itemId;
    }
  }
  
  return null;
};

/**
 * Gets the highest unlocked lesson
 * @param {Object} courseStructure - Course structure
 * @param {Object} course - Full course object
 * @param {Object} options - Options including staff overrides
 * @returns {string|null} - ItemId of highest accessible lesson
 */
export const getHighestAccessibleLesson = (courseStructure, course, options = {}) => {
  const accessibility = getLessonAccessibility(courseStructure, course, options);
  const allItems = getAllCourseItems(courseStructure);
  
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
      break;
    }
  }
  
  return highestAccessible;
};

/**
 * Gets the next lesson in the course structure after the current lesson
 * @param {Object} courseStructure - Course structure
 * @param {string} currentItemId - Current lesson's item ID
 * @returns {Object|null} - Next lesson info or null if none exists
 */
export const getNextLessonInfo = (courseStructure, currentItemId) => {
  if (!courseStructure || !currentItemId) return null;
  
  const allItems = getAllCourseItems(courseStructure);
  const currentIndex = allItems.findIndex(item => item.itemId === currentItemId);
  
  if (currentIndex === -1 || currentIndex === allItems.length - 1) {
    return null; // Current item not found or is the last item
  }
  
  const nextItem = allItems[currentIndex + 1];
  const nextUnit = findItemUnit(courseStructure, nextItem.itemId);
  
  return {
    itemId: nextItem.itemId,
    title: nextItem.title,
    type: nextItem.type,
    unitTitle: nextUnit?.title || nextUnit?.name,
    unitIndex: nextUnit?.index || 0
  };
};

/**
 * Checks if the current lesson is fully completed
 * @param {string} itemId - The lesson item ID
 * @param {Object} course - Full course object with Gradebook
 * @returns {boolean} - Whether the lesson is completed
 */
export const isLessonFullyCompleted = (itemId, course) => {
  if (!itemId || !course?.Gradebook?.items) return false;
  
  const gradebookItem = course.Gradebook.items[itemId];
  if (!gradebookItem) return false;
  
  // Check multiple completion indicators
  const isCompleted = gradebookItem.completed === true || 
                     gradebookItem.status === 'completed' ||
                     gradebookItem.status === 'manually_graded';
  
  // Also check if all questions are attempted
  const allQuestionsAttempted = gradebookItem.totalQuestions > 0 && 
                                gradebookItem.attempted >= gradebookItem.totalQuestions;
  
  // Check if meets percentage requirements
  const progressionRequirements = course?.courseDetails?.['course-config']?.progressionRequirements;
  if (progressionRequirements?.enabled) {
    const itemType = getItemType(itemId, course);
    const criteria = getCompletionCriteria(itemId, itemType, progressionRequirements);
    
    if (itemType === 'lesson') {
      const meetsPercentage = gradebookItem.percentage >= (criteria.minimumPercentage || 50);
      const meetsQuestions = !criteria.requireAllQuestions || allQuestionsAttempted;
      return isCompleted && meetsPercentage && meetsQuestions;
    }
  }
  
  return isCompleted && allQuestionsAttempted;
};

/**
 * Gets complete next lesson information including accessibility
 * @param {Object} courseStructure - Course structure
 * @param {string} currentItemId - Current lesson's item ID
 * @param {Object} course - Full course object
 * @param {Object} options - Options for accessibility check
 * @returns {Object|null} - Complete next lesson info with accessibility status
 */
export const getNextLessonWithAccessibility = (courseStructure, currentItemId, course, options = {}) => {
  const nextLessonInfo = getNextLessonInfo(courseStructure, currentItemId);
  if (!nextLessonInfo) return null;
  
  const accessibility = getLessonAccessibility(courseStructure, course, options);
  const nextLessonAccess = accessibility[nextLessonInfo.itemId];
  
  return {
    ...nextLessonInfo,
    accessible: nextLessonAccess?.accessible || false,
    reason: nextLessonAccess?.reason || 'Unknown'
  };
};

/**
 * Legacy functions maintained for backward compatibility
 */
export const shouldBypassAccessControl = (isStaffView, devMode) => {
  return isStaffView === true || devMode === true;
};

export const shouldBypassAccessControlEnhanced = (isStaffView, devMode, currentUser, course) => {
  return shouldBypassAllRestrictions(isStaffView, devMode, currentUser, course);
};