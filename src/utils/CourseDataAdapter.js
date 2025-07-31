/**
 * Course Data Adapter
 * Transforms new courseStructure format to match existing YourWay Schedule format
 * Enables backward compatibility while supporting enhanced features
 */

/**
 * Detects if course data is in the new format
 * @param {Object} courseData - Course data to check
 * @returns {boolean} - True if new format detected
 */
export const isNewCourseFormat = (courseData) => {
  // New format has courseStructure with units containing enhanced metadata
  return courseData && 
         courseData.courseStructure && 
         courseData.courseStructure.units &&
         typeof courseData.courseStructure.units === 'object';
};

/**
 * Transforms new course structure format to existing YourWay format
 * @param {Object} newFormatData - Course data in new format
 * @param {string} courseId - Course ID
 * @returns {Object} - Course data compatible with existing YourWay components
 */
export const adaptNewFormatToYourWay = (newFormatData, courseId) => {
  const courseStructure = newFormatData.courseStructure;
  
  if (!courseStructure || !courseStructure.units) {
    console.warn('Invalid new format course data:', newFormatData);
    return null;
  }

  // Transform units from object to array format
  const adaptedUnits = Object.entries(courseStructure.units).map(([unitId, unit]) => {
    // Transform items from object to array format
    const adaptedItems = unit.items ? Object.entries(unit.items).map(([itemKey, item]) => ({
      // Preserve original item properties
      ...item,
      // Add YourWay-compatible fields
      itemId: item.itemId || itemKey,
      unitName: unit.name || unit.title,
      // Transform type to match existing expectations
      type: item.type || 'lesson',
      // Preserve multiplier or default to 1
      multiplier: item.multiplier !== undefined ? item.multiplier : 1,
      // Add estimated minutes if available
      estimatedMinutes: item.estimatedMinutes || 0,
      // Preserve any existing scheduled date
      date: item.scheduledDate || item.date,
      // Add sequence number if available
      sequence: item.sequence || item.order || 0,
      // Preserve weight for gradebook integration
      weight: item.weight || 0,
      // Add gradebook index if available
      gradebookIndex: item.gradebookIndex,
      // Preserve LTI information
      lti: item.lti,
      // Add notes if available
      notes: item.notes || item.description,
      // Preserve marking information
      hasMarking: item.hasMarking || false
    })) : [];

    return {
      // Preserve original unit properties
      ...unit,
      // Ensure consistent unit structure
      unitId: unitId,
      name: unit.name || unit.title || `Unit ${unitId}`,
      items: adaptedItems,
      // Preserve section information
      section: unit.section || '',
      // Preserve sequence
      sequence: unit.sequence || unit.order || 0
    };
  });

  // Sort units by sequence
  adaptedUnits.sort((a, b) => (a.sequence || 0) - (b.sequence || 0));

  // Create adapted course object compatible with existing YourWay system
  const adaptedCourse = {
    id: courseId,
    // Use course metadata if available
    Title: courseStructure.courseTitle || 
           courseStructure.title || 
           newFormatData.Course?.Value || 
           `Course ${courseId}`,
    // Preserve course properties from the new format
    DiplomaCourse: courseStructure.diplomaCourse || newFormatData.DiplomaCourse || 'No',
    NumberOfHours: courseStructure.numberOfHours || newFormatData.NumberOfHours || 110,
    grade: courseStructure.grade || newFormatData.grade,
    Active: 'Current', // Assume active since it's in student data
    // Include units in the expected format
    units: adaptedUnits,
    // Preserve diploma-related data
    diplomaTimes: courseStructure.diplomaTimes || newFormatData.diplomaTimes,
    minCompletionMonths: courseStructure.minCompletionMonths || newFormatData.minCompletionMonths,
    recommendedCompletionMonths: courseStructure.recommendedCompletionMonths || newFormatData.recommendedCompletionMonths,
    // Add metadata to indicate this is adapted from new format
    _isAdaptedFromNewFormat: true,
    _originalCourseStructure: courseStructure
  };

  return adaptedCourse;
};

/**
 * Transforms existing course format for compatibility (passthrough)
 * @param {Object} traditionalData - Course data in traditional format
 * @returns {Object} - Course data (unchanged)
 */
export const adaptTraditionalFormat = (traditionalData) => {
  // Traditional format is already compatible, just add metadata
  return {
    ...traditionalData,
    _isAdaptedFromNewFormat: false
  };
};

/**
 * Main adapter function that handles both formats
 * @param {Object} courseData - Course data in any format
 * @param {string} courseId - Course ID
 * @returns {Object} - Course data compatible with YourWay components
 */
export const adaptCourseData = (courseData, courseId) => {
  if (!courseData) {
    console.warn('No course data provided to adapter');
    return null;
  }

  if (isNewCourseFormat(courseData)) {
    console.log('Adapting new format course structure for YourWay compatibility');
    return adaptNewFormatToYourWay(courseData, courseId);
  } else {
    console.log('Using traditional course format');
    return adaptTraditionalFormat(courseData);
  }
};

/**
 * Extracts schedule data that's compatible with both formats
 * @param {Object} scheduleData - Generated schedule data
 * @param {Object} originalCourseData - Original course data (for format detection)
 * @returns {Object} - Schedule data with format-specific enhancements
 */
export const enhanceScheduleForFormat = (scheduleData, originalCourseData) => {
  if (!scheduleData) return scheduleData;

  const enhanced = { ...scheduleData };

  // Add format indicator
  enhanced._sourceFormat = isNewCourseFormat(originalCourseData) ? 'new' : 'traditional';

  // If new format, add enhanced metadata to each item
  if (enhanced._sourceFormat === 'new') {
    enhanced.units = enhanced.units.map(unit => ({
      ...unit,
      items: unit.items.map(item => ({
        ...item,
        // Preserve itemId for database updates
        itemId: item.itemId,
        // Add content path if available
        contentPath: item.contentPath,
        // Preserve learning objectives
        learningObjectives: item.learningObjectives,
        // Add unit reference
        unitId: unit.unitId
      }))
    }));
  }

  // Add creation metadata
  enhanced.createdAt = new Date().toISOString();
  enhanced.createdBy = 'YourWay Schedule Builder';

  return enhanced;
};

/**
 * Utility to check if a course supports the new enhanced features
 * @param {Object} courseData - Adapted course data
 * @returns {boolean} - True if enhanced features are available
 */
export const supportsEnhancedFeatures = (courseData) => {
  return courseData && courseData._isAdaptedFromNewFormat === true;
};