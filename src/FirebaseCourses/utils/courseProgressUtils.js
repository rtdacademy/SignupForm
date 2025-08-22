/**
 * Course Progress Utilities
 * 
 * Simplified progress calculation functions that use server-calculated gradebook data
 * from cloud functions as the authoritative source, combined with progression requirements.
 */

/**
 * Calculate overall course progress based on cloud function calculated gradebook data
 * @param {Object} course - The course object containing Gradebook and courseDetails
 * @param {Array} allCourseItems - Array of all course items from course structure
 * @returns {Object} - Progress statistics including completion percentage and counts
 */
export const calculateCourseProgress = (course, allCourseItems = []) => {
  if (!course?.Gradebook || !allCourseItems.length) {
    return {
      total: 0,
      completed: 0,
      completionPercentage: 0
    };
  }

  const gradebook = course.Gradebook;
  const progressionRequirements = course.courseDetails?.['course-config']?.progressionRequirements || {};

  let completedCount = 0;
  const total = allCourseItems.length;

  // Check each course item for completion
  allCourseItems.forEach(courseItem => {
    if (checkItemCompletion(courseItem.itemId, gradebook, progressionRequirements)) {
      completedCount++;
    }
  });

  const completionPercentage = total > 0 ? (completedCount / total) * 100 : 0;

  return {
    total,
    completed: completedCount,
    completionPercentage
  };
};

/**
 * Check if a specific course item meets completion requirements
 * @param {string} itemId - The item ID to check
 * @param {Object} gradebook - The gradebook object from cloud functions
 * @param {Object} progressionRequirements - Progression requirements configuration
 * @returns {boolean} - Whether the item is completed
 */
export const checkItemCompletion = (itemId, gradebook, progressionRequirements = {}) => {
  if (!gradebook || !itemId) {
    return false;
  }

  // Check server-calculated completion status first
  const gradebookItem = gradebook.items?.[itemId];
  if (gradebookItem?.completed || gradebookItem?.status === 'completed') {
    return true;
  }

  // Check cloud function calculated category data
  const categories = gradebook.categories || {};
  
  // Find which category this item belongs to by checking the items array in each category
  let itemCategory = null;
  let itemData = null;
  
  Object.entries(categories).forEach(([categoryType, categoryData]) => {
    if (categoryData.items) {
      const foundItem = categoryData.items.find(item => item.itemId === itemId);
      if (foundItem) {
        itemCategory = categoryType;
        itemData = foundItem;
      }
    }
  });

  if (!itemData) {
    return false;
  }

  // Use progression requirements to determine completion
  const itemOverride = progressionRequirements.lessonOverrides?.[itemId];
  const defaultCriteria = progressionRequirements.defaultCriteria?.[itemCategory] || {};
  
  const minimumPercentage = itemOverride?.minimumPercentage ?? defaultCriteria.minimumPercentage ?? 50;
  const requireAllQuestions = itemOverride?.requireAllQuestions ?? defaultCriteria.requireAllQuestions ?? false;

  // Check completion based on requirements
  if (requireAllQuestions) {
    // Must attempt all questions AND meet minimum score
    const completionRate = itemData.totalQuestions > 0 ? (itemData.attempted / itemData.totalQuestions) * 100 : 0;
    return completionRate >= 100 && itemData.percentage >= minimumPercentage;
  } else {
    // Only need to meet minimum score
    return itemData.percentage >= minimumPercentage;
  }
};

/**
 * Get progress statistics for navigation display
 * @param {Object} course - The course object
 * @param {Array} allCourseItems - Array of all course items
 * @returns {Object} - Progress object suitable for navigation component
 */
export const getNavigationProgress = (course, allCourseItems = []) => {
  if (!course?.Gradebook || !allCourseItems.length) {
    return {};
  }

  const gradebook = course.Gradebook;
  const progressionRequirements = course.courseDetails?.['course-config']?.progressionRequirements || {};
  const progress = {};

  // Process each course item
  allCourseItems.forEach(courseItem => {
    if (checkItemCompletion(courseItem.itemId, gradebook, progressionRequirements)) {
      const gradebookItem = gradebook.items?.[courseItem.itemId];
      
      progress[courseItem.itemId] = {
        completed: true,
        completedAt: gradebookItem?.completedAt || new Date().toISOString(),
        score: gradebookItem?.score || 0,
        maxScore: gradebookItem?.maxScore || 0,
        percentage: gradebookItem?.percentage || 0
      };
    }
  });

  return progress;
};

/**
 * Get detailed course statistics from cloud function calculated data
 * @param {Object} course - The course object containing Gradebook
 * @returns {Object} - Detailed statistics by category
 */
export const getCourseStats = (course) => {
  if (!course?.Gradebook?.categories) {
    return {};
  }

  const categories = course.Gradebook.categories;
  const stats = {};

  Object.entries(categories).forEach(([categoryType, categoryData]) => {
    stats[categoryType] = {
      score: categoryData.score || 0,
      total: categoryData.total || 0,
      percentage: categoryData.percentage || 0,
      itemCount: categoryData.itemCount || 0,
      completedCount: categoryData.completedCount || 0,
      attemptedCount: categoryData.attemptedCount || 0,
      completionPercentage: categoryData.completedCount > 0 && categoryData.itemCount > 0 
        ? (categoryData.completedCount / categoryData.itemCount) * 100 
        : 0
    };
  });

  return stats;
};

/**
 * Check if gradebook data is available and valid
 * @param {Object} course - The course object
 * @returns {boolean} - Whether gradebook data is available
 */
export const hasValidGradebookData = (course) => {
  return !!(course?.Gradebook?.categories && course?.Gradebook?.overall && course?.Gradebook?.items);
};

/**
 * Get lesson score data from cloud function calculated gradebook
 * @param {string} itemId - The item ID to get score for
 * @param {Object} course - The course object
 * @returns {Object} - Score data including percentage, score, total, etc.
 */
export const getLessonScore = (itemId, course) => {
  if (!course?.Gradebook?.items) {
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false
    };
  }

  // Try original itemId first
  let item = course.Gradebook.items[itemId];
  
  // If not found, try converting hyphens to underscores (common format difference)
  if (!item && itemId.includes('-')) {
    const underscoreItemId = itemId.replace(/-/g, '_');
    item = course.Gradebook.items[underscoreItemId];
  }
  
  // If still not found, try converting underscores to hyphens
  if (!item && itemId.includes('_')) {
    const hyphenItemId = itemId.replace(/_/g, '-');
    item = course.Gradebook.items[hyphenItemId];
  }
  
  if (!item) {
    return {
      score: 0,
      total: 0,
      percentage: 0,
      attempted: 0,
      totalQuestions: 0,
      valid: false
    };
  }

  return {
    score: item.score || 0,
    total: item.total || 0,
    percentage: item.percentage || 0,
    attempted: item.attempted || 0,
    totalQuestions: item.totalQuestions || item.total || 0, // Use total as fallback for totalQuestions
    valid: true
  };
};