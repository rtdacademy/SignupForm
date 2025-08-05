/**
 * Attempt Limits Utilities
 * 
 * Simple utilities for getting attempt limits from the new attemptLimits configuration
 * No fallbacks - direct lookup only
 */

/**
 * Find the assessment type for a given assessment ID in the course structure
 * @param {Object} courseConfig - Full course configuration object
 * @param {string} assessmentId - The assessment/item ID to find
 * @returns {string|null} The assessment type (assignment, exam, quiz, lab, lesson) or null if not found
 */
function findAssessmentTypeInCourseStructure(courseConfig, assessmentId) {
  if (!courseConfig?.courseStructure?.units || !assessmentId) {
    console.log(`⚠️ Missing courseStructure or assessmentId: ${assessmentId}`);
    return null;
  }

  console.log(`🔍 Searching for assessmentId: "${assessmentId}" in course structure`);

  // Search through all units and items
  for (const unit of courseConfig.courseStructure.units) {
    if (!unit.items) continue;
    
    for (const item of unit.items) {
      console.log(`🔍 Checking item: "${item.itemId}" (type: ${item.type}) against "${assessmentId}"`);
      if (item.itemId === assessmentId) {
        console.log(`✅ Found assessment ${assessmentId} with type: ${item.type}`);
        return item.type;
      }
    }
  }

  // Debug: Show all available itemIds
  const allItemIds = courseConfig.courseStructure.units.flatMap(unit => 
    unit.items?.map(item => item.itemId) || []
  );
  console.log(`❌ Assessment ${assessmentId} not found in course structure`);
  console.log(`📋 Available itemIds:`, allItemIds);
  
  return null;
}

/**
 * Get the attempt limit for a specific assessment from the attemptLimits configuration
 * @param {Object} courseConfig - Full course configuration object
 * @param {string} assessmentId - The assessment/item ID
 * @returns {number|null} The attempt limit or null if not found
 */
function getAttemptLimitForAssessment(courseConfig, assessmentId) {
  console.log(`🔍 getAttemptLimitForAssessment called with assessmentId: "${assessmentId}"`);
  
  if (!courseConfig?.attemptLimits) {
    console.log(`⚠️ No attemptLimits configuration found in course config`);
    console.log(`📋 Available config keys:`, courseConfig ? Object.keys(courseConfig) : 'no config');
    return null;
  }

  console.log(`📋 Available attemptLimits:`, courseConfig.attemptLimits);

  // Find the assessment type first
  const assessmentType = findAssessmentTypeInCourseStructure(courseConfig, assessmentId);
  if (!assessmentType) {
    console.log(`⚠️ Cannot determine assessment type for ${assessmentId}`);
    return null;
  }

  // Get the attempt limit for this type
  const attemptLimit = courseConfig.attemptLimits[assessmentType];
  console.log(`🔍 Looking up attemptLimits["${assessmentType}"] = ${attemptLimit}`);
  
  if (attemptLimit === undefined || attemptLimit === null) {
    console.log(`⚠️ No attempt limit configured for assessment type: ${assessmentType}`);
    return null;
  }

  console.log(`📋 Using attempt limit ${attemptLimit} for ${assessmentId} (type: ${assessmentType})`);
  return attemptLimit;
}

module.exports = {
  findAssessmentTypeInCourseStructure,
  getAttemptLimitForAssessment
};