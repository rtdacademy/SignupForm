/**
 * Assessment Functions for Keyboarding Final Assessment
 * Course: 6 
 * Content: 03_keyboarding_final_assessment
 * 
 * This module provides the final typing assessment
 * using the direct score system.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

/**
 * Assessment Configurations for Universal Assessment Function
 */
const assessmentConfigs = {
  
  // Final typing assessment using direct score
  'course6_03_final_typing_assessment': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 60000, // 60 seconds minimum for final assessment
    minimumInteractions: 100, // At least 100 keystrokes for final
    passingCriteria: {
      minWpm: 18,  // Reduced WPM requirement for final assessment
      minAccuracy: 80  // Higher accuracy requirement
    },
    metadata: {
      title: 'Final Typing Assessment',
      description: 'Complete a comprehensive typing test with sentences to demonstrate proficiency',
      category: 'final_assessment',
      points: 1,  // Worth 1 point as requested
      activityType: ACTIVITY_TYPE
    }
  }
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};