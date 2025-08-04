/**
 * Lesson Access Control Utilities
 * 
 * Handles sequential lesson unlocking logic for Firebase courses.
 * Used specifically for Course 4's sequential progression requirements.
 */

import { shouldBypassAllRestrictions } from './authUtils';
import { getLessonOverride, getOverrideReason } from './staffOverrides';

/**
 * Determines if sequential access is enabled for a course
 * @param {Object} courseStructure - Course structure configuration
 * @param {Object} courseGradebook - Full course gradebook object (optional, for new settings)
 * @returns {boolean} - Whether sequential access is required
 */
export const isSequentialAccessEnabled = (courseStructure, courseGradebook = null) => {
  // Check new globalSettings approach first (preferred)
  if (courseGradebook?.courseDetails?.['course-config']?.globalSettings?.requireSequentialProgress === true) {
    return true;
  }
  
  // Fallback to legacy navigation settings
  const navigation = courseStructure?.courseStructure?.navigation || courseStructure?.navigation;
  return navigation?.allowSkipAhead === false && navigation?.requireCompletion === true;
};

/**
 * Gets the accessibility status for all lessons in a course using assessment-based unlocking
 * Updated to work with the new data structure: itemStructure and Grades.assessments
 * @param {Object} courseStructure - Course structure with units and items
 * @param {Object} assessmentData - Student assessment/gradebook data (read from Firebase) - legacy fallback
 * @param {Object} courseGradebook - Full course gradebook object with config and courseStructureItems
 * @param {Object} options - Additional options like developer bypass and staff overrides
 * @returns {Object} - Map of itemId to accessibility info
 */
export const getLessonAccessibility = (courseStructure, assessmentData = {}, courseGradebook = null, options = {}) => {
  const accessibility = {};
  const { isDeveloperBypass = false, staffOverrides = {}, progressionRequirements = null } = options;
  
  // If sequential access is not enabled, check for development status and staff overrides
  if (!isSequentialAccessEnabled(courseStructure, courseGradebook)) {
    const allItems = getAllCourseItems(courseStructure);
    allItems.forEach(item => {
      // Check for staff override first
      const override = getLessonOverride(staffOverrides, item.itemId);
      if (override) {
        accessibility[item.itemId] = {
          accessible: override.accessible,
          reason: getOverrideReason(override),
          isStaffOverride: true
        };
        return;
      }

      // Check visibility overrides - highest priority restriction
      const visibility = progressionRequirements?.visibility?.[item.itemId];
      if (visibility === 'never') {
        accessibility[item.itemId] = {
          accessible: false,
          reason: 'Never visible',
          isNeverVisible: true
        };
        return;
      }

      // Check if lesson is in development and user is not a developer
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
  
  // First lesson is always accessible (unless staff override says otherwise)
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
  
  // Check each subsequent lesson based on assessment completion
  for (let i = 1; i < sortedItems.length; i++) {
    const currentItem = sortedItems[i];
    const previousItem = sortedItems[i - 1];
    
    // Check for staff override first - staff overrides take precedence over all other rules
    const override = getLessonOverride(staffOverrides, currentItem.itemId);
    if (override) {
      accessibility[currentItem.itemId] = {
        accessible: override.accessible,
        reason: getOverrideReason(override),
        isStaffOverride: true
      };
      continue;
    }
    
    // Check visibility overrides - highest priority restriction (even above staff overrides)
    const visibility = progressionRequirements?.visibility?.[currentItem.itemId];
    if (visibility === 'never') {
      accessibility[currentItem.itemId] = {
        accessible: false,
        reason: 'Never visible',
        isNeverVisible: true
      };
      continue;
    }

    // Check always visible bypass - second highest priority after staff overrides
    if (visibility === 'always') {
      accessibility[currentItem.itemId] = {
        accessible: true,
        reason: 'Always visible',
        isShowAlways: true
      };
      continue;
    }
    
    // Check if current lesson is in development and user is not a developer
    if (currentItem.inDevelopment === true && !isDeveloperBypass) {
      accessibility[currentItem.itemId] = {
        accessible: false,
        reason: 'This lesson is currently being developed'
      };
      continue;
    }
    
    // Check if previous lesson has assessment attempts/completion
    // Pass actual grades for more accurate checking and new progression requirements
    const actualGrades = courseGradebook?.grades?.assessments || {};
    const isPreviousCompleted = hasCompletedAssessments(previousItem.itemId, assessmentData, {
      ...courseGradebook,
      grades: { assessments: actualGrades }
    }, progressionRequirements);
    
    
    // Get required criteria info for better error messages
    let requiredPercentage = null;
    let detailedReason = isPreviousCompleted 
      ? 'Previous lesson assessments completed'
      : `Complete assessments in "${previousItem.title}" to unlock`;
    
    if (!isPreviousCompleted && progressionRequirements?.enabled) {
      // Get item structure to determine type of previous item
      const itemStructure = courseGradebook?.courseDetails?.['course-config']?.gradebook?.itemStructure;
      const previousItemConfig = itemStructure?.[previousItem.itemId];
      const previousItemType = previousItemConfig?.type || 'lesson';
      
      // Get criteria for previous lesson based on type and overrides
      const lessonOverride = progressionRequirements.lessonOverrides?.[previousItem.itemId];
      const defaultCriteria = progressionRequirements.defaultCriteria?.[previousItemType] || {};
      
      let criteria = {};
      
      if (previousItemType === 'lesson') {
        criteria = {
          minimumPercentage: lessonOverride?.minimumPercentage ?? defaultCriteria.minimumPercentage ?? 50,
          requireAllQuestions: lessonOverride?.requireAllQuestions ?? defaultCriteria.requireAllQuestions ?? false
        };
      } else if (['assignment', 'exam', 'quiz'].includes(previousItemType)) {
        criteria = {
          sessionsRequired: lessonOverride?.sessionsRequired ?? defaultCriteria.sessionsRequired ?? 1
        };
      } else if (previousItemType === 'lab') {
        criteria = {
          requiresSubmission: lessonOverride?.requiresSubmission ?? defaultCriteria.requiresSubmission ?? true
        };
      }
      
      // Generate detailed reason based on item type and criteria
      if (previousItemType === 'lesson') {
        requiredPercentage = criteria.minimumPercentage;
        
        // Calculate current percentage using new data structure
        let currentPercentage = 0;
        if (previousItemConfig && actualGrades) {
          let totalScore = 0;
          let totalPossible = 0;
          
          previousItemConfig.questions?.forEach(question => {
            const questionId = question.questionId;
            const maxPoints = question.points || 1;
            const actualGrade = actualGrades[questionId] || 0;
            
            totalPossible += maxPoints;
            if (actualGrades.hasOwnProperty(questionId)) {
              totalScore += actualGrade;
            }
          });
          
          currentPercentage = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        }
        
        // Generate lesson-specific reason
        let requirementParts = [];
        if (criteria.minimumPercentage > 0) {
          requirementParts.push(`${criteria.minimumPercentage}% score`);
        }
        if (criteria.requireAllQuestions) {
          requirementParts.push('all questions');
        }
        
        const requirementText = requirementParts.length > 0 
          ? requirementParts.join(' + ')
          : 'completion';
        
        if (criteria.minimumPercentage > 0) {
          detailedReason = `Need ${requirementText} in "${previousItem.title}" (currently ${currentPercentage}%)`;
        } else {
          detailedReason = `Answer ${requirementText} in "${previousItem.title}" to unlock`;
        }
      } else if (['assignment', 'exam', 'quiz'].includes(previousItemType)) {
        detailedReason = `Complete ${criteria.sessionsRequired} session${criteria.sessionsRequired > 1 ? 's' : ''} of "${previousItem.title}" to unlock`;
      } else if (previousItemType === 'lab') {
        detailedReason = `Submit all required work for "${previousItem.title}" to unlock`;
      }
    }
    
    // Special handling for lessons in development that are accessible to developers
    if (currentItem.inDevelopment === true && isDeveloperBypass) {
      detailedReason = 'In development - Developer access granted';
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
 * Checks if a lesson has completed assessments with flexible progression requirements
 * Uses the new reliable data sources: itemStructure and Grades.assessments
 * @param {string} lessonId - The lesson item ID
 * @param {Object} assessmentData - Assessment/gradebook data from Firebase (legacy, used for fallback)
 * @param {Object} courseGradebook - Full course gradebook object with config and courseStructureItems
 * @returns {boolean} - Whether the lesson meets completion requirements
 */
export const hasCompletedAssessments = (lessonId, assessmentData, courseGradebook = null, progressionRequirements = null) => {
  // If no course gradebook provided, fall back to legacy completion checking
  if (!courseGradebook) {
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  // Check for manual completion status first (overrides score-based completion)
  const courseStructureItem = courseGradebook?.courseStructureItems?.[lessonId];
  const gradebookItem = courseGradebook?.items?.[lessonId];
  
  // If manually graded or explicitly marked as completed, consider it complete
  if (courseStructureItem?.completed || 
      gradebookItem?.status === 'completed' || 
      gradebookItem?.status === 'manually_graded') {
    return true;
  }
  
  const courseConfig = courseGradebook.courseDetails?.['course-config'];
  
  // If progression requirements are not enabled, use basic completion check
  if (!progressionRequirements?.enabled) {
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  // Use new data sources for reliable calculations
  const itemStructure = courseGradebook?.courseDetails?.['course-config']?.gradebook?.itemStructure;
  const actualGrades = courseGradebook.grades?.assessments || {}; // course.Grades.assessments
  
  if (!itemStructure || !actualGrades) {
    console.warn('Missing required data structures for lesson access checking:', {
      hasItemStructure: !!itemStructure,
      hasActualGrades: !!actualGrades,
      lessonId
    });
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  if (!itemStructure || !actualGrades) {
    console.warn('Missing required data structures for lesson access checking:', {
      hasItemStructure: !!itemStructure,
      hasActualGrades: !!actualGrades,
      lessonId
    });
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  // Use itemId directly (should already be in underscore format)
  const lessonConfig = itemStructure[lessonId];
  
  if (!lessonConfig) {
    return hasBasicCompletionCheck(lessonId, assessmentData);
  }
  
  // Get item type to determine completion logic
  const itemType = lessonConfig.type || 'lesson';
  
  // Get progression criteria for this item (with fallback to defaults)
  const lessonOverride = progressionRequirements.lessonOverrides?.[lessonId];
  const defaultCriteria = progressionRequirements.defaultCriteria?.[itemType] || {};
  
  // Handle different item types
  if (itemType === 'lesson') {
    return checkLessonCompletion(lessonId, lessonConfig, actualGrades, lessonOverride, defaultCriteria);
  } else if (['assignment', 'exam', 'quiz'].includes(itemType)) {
    return checkSessionCompletion(lessonId, courseGradebook, lessonOverride, defaultCriteria);
  } else if (itemType === 'lab') {
    return checkLabCompletion(lessonId, lessonConfig, courseGradebook, lessonOverride, defaultCriteria);
  }
  
  // Fallback for unknown types
  return hasBasicCompletionCheck(lessonId, assessmentData);
};

/**
 * Check lesson completion for type: 'lesson'
 * @param {string} lessonId - The lesson item ID
 * @param {Object} lessonConfig - The lesson configuration from itemStructure
 * @param {Object} actualGrades - course.Grades.assessments
 * @param {Object} lessonOverride - Override criteria for this lesson
 * @param {Object} defaultCriteria - Default criteria for lessons
 * @returns {boolean} - Whether the lesson meets completion requirements
 */
const checkLessonCompletion = (lessonId, lessonConfig, actualGrades, lessonOverride, defaultCriteria) => {
  if (!lessonConfig.questions) {
    return false;
  }
  
  // Get criteria for this lesson
  const criteria = {
    minimumPercentage: lessonOverride?.minimumPercentage ?? defaultCriteria.minimumPercentage ?? 50,
    requireAllQuestions: lessonOverride?.requireAllQuestions ?? defaultCriteria.requireAllQuestions ?? false
  };
  
  // Calculate lesson score using actual grades
  let totalScore = 0;
  let totalPossible = 0;
  let attemptedQuestions = 0;
  const totalQuestions = lessonConfig.questions.length;
  
  lessonConfig.questions.forEach(question => {
    const questionId = question.questionId;
    const maxPoints = question.points || 1;
    const actualGrade = actualGrades[questionId] || 0;
    
    totalPossible += maxPoints;
    
    // If grade exists (even if 0), student has attempted
    if (actualGrades.hasOwnProperty(questionId)) {
      attemptedQuestions += 1;
      totalScore += actualGrade;
    }
  });
  
  const lessonPercentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  const meetsPercentageRequirement = lessonPercentage >= criteria.minimumPercentage;
  
  // Check question completion requirements
  let meetsQuestionRequirement = true;
  
  if (criteria.requireAllQuestions) {
    // Must answer ALL questions
    meetsQuestionRequirement = attemptedQuestions >= totalQuestions;
  }
  
  // Must meet ALL criteria (AND logic)
  return meetsPercentageRequirement && meetsQuestionRequirement;
};

/**
 * Check session completion for type: 'assignment', 'exam', 'quiz'
 * @param {string} itemId - The assessment item ID
 * @param {Object} courseGradebook - Course gradebook with ExamSessions
 * @param {Object} lessonOverride - Override criteria for this item
 * @param {Object} defaultCriteria - Default criteria for this item type
 * @returns {boolean} - Whether the required number of sessions are completed
 */
const checkSessionCompletion = (itemId, courseGradebook, lessonOverride, defaultCriteria) => {
  const criteria = {
    sessionsRequired: lessonOverride?.sessionsRequired ?? defaultCriteria.sessionsRequired ?? 1
  };
  
  // Get ExamSessions from course data (located at root level)
  const examSessions = courseGradebook?.ExamSessions || {};
  
  // Find sessions for this assessment (itemId should already be in correct format)
  const completedSessions = Object.values(examSessions).filter(session => {
    return session?.examItemId === itemId && session?.status === 'completed';
  });
  
  return completedSessions.length >= criteria.sessionsRequired;
};

/**
 * Check lab completion for type: 'lab'
 * @param {string} itemId - The lab item ID
 * @param {Object} lessonConfig - The lab configuration from itemStructure
 * @param {Object} courseGradebook - Course gradebook with assessments
 * @param {Object} lessonOverride - Override criteria for this lab
 * @param {Object} defaultCriteria - Default criteria for labs
 * @returns {boolean} - Whether the lab submission requirements are met
 */
const checkLabCompletion = (itemId, lessonConfig, courseGradebook, lessonOverride, defaultCriteria) => {
  const criteria = {
    requiresSubmission: lessonOverride?.requiresSubmission ?? defaultCriteria.requiresSubmission ?? true
  };
  
  if (!criteria.requiresSubmission) {
    return true; // If no submission required, consider it complete
  }
  
  if (!lessonConfig.questions) {
    return false;
  }
  
  // Get assessments from course data (located at root level)
  const assessments = courseGradebook?.Assessments || {};
  
  // Check if all lab questions have submissions
  const allQuestionsSubmitted = lessonConfig.questions.every(question => {
    const questionId = question.questionId;
    const hasSubmission = assessments.hasOwnProperty(questionId);
    
    if (!hasSubmission) {
      console.log(`Lab completion check: ${itemId} - Question ${questionId} not found in assessments`);
      console.log('Available assessments:', Object.keys(assessments));
    }
    
    return hasSubmission;
  });
  
  console.log(`Lab completion result for ${itemId}: ${allQuestionsSubmitted}`);
  return allQuestionsSubmitted;
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
 * @param {Object} options - Options including staff overrides
 * @returns {string|null} - ItemId of next accessible lesson, or null
 */
export const getNextAccessibleLesson = (courseStructure, assessmentData, courseGradebook = null, options = {}) => {
  const accessibility = getLessonAccessibility(courseStructure, assessmentData, courseGradebook, options);
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
 * @param {Object} options - Options including staff overrides
 * @returns {string|null} - ItemId of highest accessible lesson
 */
export const getHighestAccessibleLesson = (courseStructure, assessmentData, courseGradebook = null, options = {}) => {
  const accessibility = getLessonAccessibility(courseStructure, assessmentData, courseGradebook, options);
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

/**
 * Gets the total number of questions for a lesson from course config
 * Updated to use the new itemStructure data format
 * @param {string} lessonId - The lesson item ID
 * @param {Object} courseConfig - Course configuration object
 * @returns {number} - Total number of questions in the lesson
 */
const getTotalQuestionsForLesson = (lessonId, courseConfig) => {
  const gradebookStructure = courseConfig?.gradebook?.itemStructure;
  if (!gradebookStructure) {
    return 0;
  }
  
  // Use lessonId directly (should already be in correct format)
  const lessonStructure = gradebookStructure[lessonId];
  
  if (!lessonStructure || !lessonStructure.questions) {
    return 0;
  }
  
  return lessonStructure.questions.length;
};

/**
 * Gets the number of attempted questions for a lesson from assessment data
 * Updated to use course.Grades.assessments instead of pattern matching
 * @param {string} lessonId - The lesson item ID
 * @param {Object} assessmentData - Assessment/gradebook data from Firebase (legacy - may not have actual grades)
 * @param {Object} courseConfig - Course configuration with itemStructure
 * @param {Object} actualGrades - course.Grades.assessments object
 * @returns {number} - Number of questions attempted (with at least one attempt)
 */
const getAttemptedQuestionsForLesson = (lessonId, assessmentData, courseConfig = null, actualGrades = null) => {
  // If we have the new data structure, use it
  if (courseConfig && actualGrades) {
    const gradebookStructure = courseConfig?.gradebook?.itemStructure;
    if (!gradebookStructure) {
      return 0;
    }
    
    // Use lessonId directly (should already be in correct format)
    const lessonStructure = gradebookStructure[lessonId];
    
    if (!lessonStructure || !lessonStructure.questions) {
      return 0;
    }
    
    // Count questions that have been attempted (grade exists, even if 0)
    let attemptedCount = 0;
    lessonStructure.questions.forEach(question => {
      const questionId = question.questionId;
      if (actualGrades.hasOwnProperty(questionId)) {
        attemptedCount++;
      }
    });
    
    return attemptedCount;
  }
  
  // Fallback to legacy pattern matching approach
  if (!assessmentData) {
    return 0;
  }
  
  // Find all assessment keys that belong to this lesson
  const lessonQuestionKeys = Object.keys(assessmentData).filter(key => {
    // Match patterns like "course4_01_welcome_rtd_academy_knowledge_check"
    // where lessonId is "lesson_welcome_rtd_academy"
    const lessonPart = lessonId.replace('lesson_', '').replace('exam_', '');
    return key.includes(lessonPart);
  });
  
  // Count questions that have been attempted (have attempts > 0 or score > 0)
  let attemptedCount = 0;
  lessonQuestionKeys.forEach(key => {
    const questionData = assessmentData[key];
    if (questionData && (questionData.attempts > 0 || questionData.score > 0)) {
      attemptedCount++;
    }
  });
  
  return attemptedCount;
};