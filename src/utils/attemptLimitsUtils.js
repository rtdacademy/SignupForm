/**
 * Frontend Attempt Limits Utilities
 * 
 * Simple utilities for getting attempt limits from the new attemptLimits configuration
 * Frontend version - no fallbacks, direct lookup only
 */

/**
 * Find the assessment type for a given assessment ID in the course structure
 * @param {Object} courseConfig - Full course configuration object (from course.courseDetails["course-config"])
 * @param {string} assessmentId - The assessment/item ID to find
 * @returns {string|null} The assessment type (assignment, exam, quiz, lab, lesson) or null if not found
 */
export const findAssessmentTypeInCourseStructure = (courseConfig, assessmentId) => {
  if (!courseConfig?.courseStructure?.units || !assessmentId) {
    console.log(`⚠️ Missing courseStructure or assessmentId: ${assessmentId}`);
    return null;
  }

  // Search through all units and items
  for (const unit of courseConfig.courseStructure.units) {
    if (!unit.items) continue;
    
    for (const item of unit.items) {
      if (item.itemId === assessmentId) {
        console.log(`✅ Found assessment ${assessmentId} with type: ${item.type}`);
        return item.type;
      }
    }
  }

  console.log(`⚠️ Assessment ${assessmentId} not found in course structure`);
  return null;
};

/**
 * Get the attempt limit for a specific assessment from the attemptLimits configuration
 * @param {Object} courseConfig - Full course configuration object (from course.courseDetails["course-config"])
 * @param {string} assessmentId - The assessment/item ID
 * @returns {number|null} The attempt limit or null if not found
 */
export const getAttemptLimitForAssessment = (courseConfig, assessmentId) => {
  if (!courseConfig?.attemptLimits) {
    console.log(`⚠️ No attemptLimits configuration found in course config`);
    return null;
  }

  // Find the assessment type first
  const assessmentType = findAssessmentTypeInCourseStructure(courseConfig, assessmentId);
  if (!assessmentType) {
    console.log(`⚠️ Cannot determine assessment type for ${assessmentId}`);
    return null;
  }

  // Get the attempt limit for this type
  const attemptLimit = courseConfig.attemptLimits[assessmentType];
  if (attemptLimit === undefined || attemptLimit === null) {
    console.log(`⚠️ No attempt limit configured for assessment type: ${assessmentType}`);
    return null;
  }

  console.log(`📋 Using attempt limit ${attemptLimit} for ${assessmentId} (type: ${assessmentType})`);
  return attemptLimit;
};