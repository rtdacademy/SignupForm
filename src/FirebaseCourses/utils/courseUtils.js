/**
 * Utility functions for Firebase courses
 */

// Cache for course configs to avoid repeated fetches
const configCache = new Map();

/**
 * Load course configuration from the functions directory
 * @param {String} courseId - ID of the course
 * @returns {Promise<Object|null>} The course configuration or null if not found
 */
export const loadCourseConfig = async (courseId) => {
  // Check cache first
  if (configCache.has(courseId)) {
    return configCache.get(courseId);
  }

  // Legacy function - courses-config directory no longer exists
  // Configurations are now loaded from Firebase database
  console.warn(`loadCourseConfig called for course ${courseId} - returning null (legacy method, use Firebase database instead)`);
  configCache.set(courseId, null);
  return null;
};

/**
 * Find an item in course config by content path
 * @param {Object} courseConfig - The course configuration object
 * @param {String} contentPath - The content path (e.g., "01-physics-20-review")
 * @returns {Object|null} The found item with estimatedTime or null
 */
export const findItemByContentPath = (courseConfig, contentPath) => {
  if (!courseConfig?.courseStructure?.units || !contentPath) {
    return null;
  }

  for (const unit of courseConfig.courseStructure.units) {
    if (!unit.items) continue;
    
    const item = unit.items.find(item => item.contentPath === contentPath);
    if (item) return item;
  }
  
  return null;
};

/**
 * Get estimated time for a lesson by content path
 * @param {String} courseId - ID of the course
 * @param {String} contentPath - The content path (e.g., "01-physics-20-review")
 * @returns {Promise<Number|null>} Estimated time in minutes or null if not found
 */
export const getEstimatedTime = async (courseId, contentPath) => {
  try {
    const config = await loadCourseConfig(courseId);
    if (!config) return null;
    
    const item = findItemByContentPath(config, contentPath);
    return item?.estimatedTime || null;
  } catch (error) {
    console.error(`Failed to get estimated time for ${contentPath}:`, error);
    return null;
  }
};

/**
 * Format estimated time for display
 * @param {Number} minutes - Time in minutes
 * @returns {String} Formatted time string (e.g., "120 minutes")
 */
export const formatEstimatedTime = (minutes) => {
  if (!minutes || minutes <= 0) return '';
  
  return `${minutes} minutes`;
};

/**
 * Flattens a course structure into a single array of all items
 * @param {Array} units - Array of course units
 * @returns {Array} Flattened array of all course items
 */
export const flattenCourseItems = (units = []) => {
  const items = [];
  units.forEach(unit => {
    if (unit.items && Array.isArray(unit.items)) {
      items.push(...unit.items);
    }
  });
  return items;
};

/**
 * Find an item in the course structure by ID
 * @param {Array} units - Array of course units
 * @param {String} itemId - ID of the item to find
 * @returns {Object|null} The found item or null
 */
export const findCourseItemById = (units, itemId) => {
  if (!units || !itemId) return null;
  
  for (const unit of units) {
    if (!unit.items) continue;
    
    const item = unit.items.find(item => item.itemId === itemId);
    if (item) return item;
  }
  
  return null;
};

/**
 * Find which unit contains a specific item
 * @param {Array} units - Array of course units
 * @param {String} itemId - ID of the item to find
 * @returns {Object|null} The unit containing the item or null
 */
export const findUnitByItemId = (units, itemId) => {
  if (!units || !itemId) return null;
  
  return units.find(unit => 
    unit.items && unit.items.some(item => item.itemId === itemId)
  );
};

/**
 * Get the next item in sequence across all units
 * @param {Array} units - Array of course units
 * @param {String} currentItemId - ID of the current item
 * @returns {Object|null} The next item or null if at the end
 */
export const getNextItem = (units, currentItemId) => {
  if (!units || !currentItemId) return null;
  
  // Flatten all items and sort by sequence
  const allItems = flattenCourseItems(units).sort((a, b) => {
    const aSeq = a.sequence || 0;
    const bSeq = b.sequence || 0;
    return aSeq - bSeq;
  });
  
  const currentIndex = allItems.findIndex(item => item.itemId === currentItemId);
  if (currentIndex === -1 || currentIndex === allItems.length - 1) {
    return null;
  }
  
  return allItems[currentIndex + 1];
};

/**
 * Get the previous item in sequence across all units
 * @param {Array} units - Array of course units 
 * @param {String} currentItemId - ID of the current item
 * @returns {Object|null} The previous item or null if at the beginning
 */
export const getPreviousItem = (units, currentItemId) => {
  if (!units || !currentItemId) return null;
  
  // Flatten all items and sort by sequence
  const allItems = flattenCourseItems(units).sort((a, b) => {
    const aSeq = a.sequence || 0;
    const bSeq = b.sequence || 0;
    return aSeq - bSeq;
  });
  
  const currentIndex = allItems.findIndex(item => item.itemId === currentItemId);
  if (currentIndex <= 0) {
    return null;
  }
  
  return allItems[currentIndex - 1];
};

/**
 * Calculate overall and unit-specific progress based on completed items
 * @param {Array} units - Course units
 * @param {Object} progress - Progress object mapping itemIds to completion data
 * @returns {Object} Progress statistics
 */
export const calculateProgress = (units, progress = {}) => {
  if (!units || units.length === 0) {
    return { overall: 0, units: {} };
  }
  
  const allItems = flattenCourseItems(units);
  const completedItems = allItems.filter(item => progress[item.itemId]?.completed).length;
  const overallPercentage = Math.round((completedItems / allItems.length) * 100);
  
  // Calculate progress for each unit
  const unitProgress = {};
  units.forEach(unit => {
    if (!unit.items || unit.items.length === 0) {
      unitProgress[unit.unitId] = { completed: 0, total: 0, percentage: 0 };
      return;
    }
    
    const unitItems = unit.items;
    const unitCompletedItems = unitItems.filter(item => progress[item.itemId]?.completed).length;
    const unitPercentage = Math.round((unitCompletedItems / unitItems.length) * 100);
    
    unitProgress[unit.unitId] = {
      completed: unitCompletedItems,
      total: unitItems.length,
      percentage: unitPercentage
    };
  });
  
  return {
    overall: overallPercentage,
    completed: completedItems,
    total: allItems.length,
    units: unitProgress
  };
};

/**
 * Calculate the weighted grade for a course based on completed assessments
 * @param {Array} units - Course units
 * @param {Object} grades - Grade data for items
 * @param {Object} weights - Weights configuration for different item types
 * @returns {Object} Calculated grade information
 */
export const calculateGrade = (units, grades = {}, weights = {}) => {
  if (!units || units.length === 0 || !weights) {
    return { overall: 0, byType: {} };
  }
  
  const allItems = flattenCourseItems(units);
  
  // Group items by type
  const itemsByType = {};
  allItems.forEach(item => {
    if (!itemsByType[item.type]) {
      itemsByType[item.type] = [];
    }
    itemsByType[item.type].push(item);
  });
  
  // Calculate grades by type
  const gradesByType = {};
  let overallWeightedScore = 0;
  let totalAppliedWeight = 0;
  
  Object.entries(weights).forEach(([type, typeWeight]) => {
    const typeItems = itemsByType[type] || [];
    
    if (typeItems.length > 0) {
      const gradedItems = typeItems.filter(item => grades[item.itemId]?.score !== undefined);
      
      if (gradedItems.length > 0) {
        let typeScore = 0;
        let typeWeight = 0;
        
        gradedItems.forEach(item => {
          const itemGrade = grades[item.itemId]?.score || 0;
          const itemWeight = item.weight || 1;
          typeScore += itemGrade * itemWeight;
          typeWeight += itemWeight;
        });
        
        const typeAverage = typeWeight > 0 ? typeScore / typeWeight : 0;
        gradesByType[type] = {
          average: Math.round(typeAverage),
          completed: gradedItems.length,
          total: typeItems.length
        };
        
        // Contribute to overall weighted score
        overallWeightedScore += typeAverage * (weights[type] || 0);
        totalAppliedWeight += weights[type] || 0;
      } else {
        gradesByType[type] = { average: 0, completed: 0, total: typeItems.length };
      }
    }
  });
  
  // Calculate overall grade
  const overallGrade = totalAppliedWeight > 0 
    ? Math.round(overallWeightedScore / totalAppliedWeight) 
    : 0;
  
  return {
    overall: overallGrade,
    byType: gradesByType,
    letterGrade: getLetterGrade(overallGrade)
  };
};

/**
 * Convert a numerical grade to a letter grade
 * @param {Number} grade - Numerical grade (0-100)
 * @returns {String} Letter grade
 */
const getLetterGrade = (grade) => {
  if (grade >= 90) return 'A';
  if (grade >= 80) return 'B';
  if (grade >= 70) return 'C';
  if (grade >= 60) return 'D';
  return 'F';
};

export default {
  loadCourseConfig,
  findItemByContentPath,
  getEstimatedTime,
  formatEstimatedTime,
  flattenCourseItems,
  findCourseItemById,
  findUnitByItemId,
  getNextItem,
  getPreviousItem,
  calculateProgress,
  calculateGrade
};