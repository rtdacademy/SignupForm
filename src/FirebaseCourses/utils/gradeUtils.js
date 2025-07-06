/**
 * Utility functions for handling grades and course progress
 */

/**
 * Calculate weighted grade based on assessment type weights
 * @param {Object} grades - Object containing grade data for each assessment
 * @param {Object} weights - Course weights (e.g., {assignment: 0.3, exam: 0.4, lesson: 0.3})
 * @param {Array} courseItems - Array of course items with their types and individual weights
 * @returns {Number} - Final calculated grade as a percentage
 */
export const calculateWeightedGrade = (grades, weights, courseItems) => {
  if (!grades || !weights || !courseItems) {
    return null;
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  // Group items by type
  const itemsByType = {};
  
  courseItems.forEach(item => {
    if (!itemsByType[item.type]) {
      itemsByType[item.type] = [];
    }
    itemsByType[item.type].push(item);
  });
  
  // Calculate weighted score for each type
  Object.entries(weights).forEach(([type, typeWeight]) => {
    const typeItems = itemsByType[type] || [];
    
    if (typeItems.length > 0) {
      let typeScore = 0;
      let typeItemsWithGrades = 0;
      
      typeItems.forEach(item => {
        const grade = grades[item.itemId];
        if (grade && typeof grade.score === 'number') {
          typeScore += grade.score * (item.weight || 1);
          typeItemsWithGrades += (item.weight || 1);
        }
      });
      
      if (typeItemsWithGrades > 0) {
        const averageTypeScore = typeScore / typeItemsWithGrades;
        totalWeightedScore += averageTypeScore * typeWeight;
        totalWeight += typeWeight;
      }
    }
  });
  
  if (totalWeight === 0) {
    return 0;
  }
  
  return Math.round((totalWeightedScore / totalWeight) * 100) / 100;
};

/**
 * Get the letter grade corresponding to a numerical grade
 * @param {Number} grade - Numerical grade as a percentage
 * @returns {String} - Letter grade
 */
export const getLetterGrade = (grade) => {
  if (grade === null || grade === undefined) {
    return 'N/A';
  }
  
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
};

/**
 * Format a numerical grade for display
 * @param {Number} grade - Numerical grade
 * @param {Boolean} includePercent - Whether to include % symbol
 * @returns {String} - Formatted grade
 */
export const formatGrade = (grade, includePercent = true) => {
  if (grade === null || grade === undefined) {
    return 'Not Graded';
  }
  
  const roundedGrade = Math.round(grade * 10) / 10;
  return includePercent ? `${roundedGrade}%` : roundedGrade.toString();
};

/**
 * Format a numerical score for display with 1 decimal place only if not a whole number
 * @param {Number} score - Numerical score
 * @returns {String} - Formatted score (e.g., "85" or "85.5")
 */
export const formatScore = (score) => {
  if (score === null || score === undefined || isNaN(score)) {
    return '0';
  }
  
  const numScore = Number(score);
  
  // If it's a whole number, return without decimal
  if (numScore === Math.floor(numScore)) {
    return numScore.toString();
  }
  
  // If it has decimals, round to 1 decimal place
  return (Math.round(numScore * 10) / 10).toString();
};

/**
 * Calculate progress percentage based on completed items
 * @param {Object} progress - Progress object with item IDs as keys
 * @param {Array} courseItems - Full list of course items
 * @returns {Number} - Progress percentage from 0-100
 */
export const calculateProgressPercentage = (progress, courseItems) => {
  if (!progress || !courseItems || courseItems.length === 0) {
    return 0;
  }
  
  // Count all items
  const totalItems = courseItems.length;
  
  // Count completed items
  const completedItems = courseItems.filter(item => {
    return progress[item.itemId]?.completed === true;
  }).length;
  
  return Math.round((completedItems / totalItems) * 100);
};

/**
 * Check if a unit is completed
 * @param {Object} unit - Unit object
 * @param {Object} progress - Progress object
 * @returns {Boolean} - True if all items in unit are completed
 */
export const isUnitCompleted = (unit, progress) => {
  if (!unit || !unit.items || !progress) {
    return false;
  }
  
  return unit.items.every(item => progress[item.itemId]?.completed === true);
};

/**
 * Get a status label for an assessment based on progress and grade
 * @param {String} itemId - Assessment ID
 * @param {Object} progress - Progress data
 * @param {Object} grades - Grades data
 * @returns {String} - Status label ("Completed", "In Progress", etc.)
 */
export const getAssessmentStatus = (itemId, progress, grades) => {
  if (!itemId || !progress) {
    return 'Not Started';
  }
  
  const itemProgress = progress[itemId];
  const itemGrade = grades?.[itemId];
  
  if (itemProgress?.completed) {
    if (itemGrade) {
      return 'Graded';
    }
    return 'Completed';
  }
  
  if (itemProgress?.started) {
    return 'In Progress';
  }
  
  return 'Not Started';
};