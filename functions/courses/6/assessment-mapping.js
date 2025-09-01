/**
 * Assessment Mapping for Course 6 (Keyboarding)
 * 
 * This file maps assessment IDs to their corresponding file paths.
 * Used by the universal assessment function to dynamically load assessment configurations.
 * 
 * Format: 'assessmentId': 'relative/path/to/assessments'
 * Note: Paths are relative to the /functions/courses/6/ directory
 */

module.exports = {
  // Lesson 01: Typing Basics and Hand Position
  'inf2020_01_hand_position': '01_keyboarding_basics/assessments',
  'inf2020_01_typing_technique': '01_keyboarding_basics/assessments',

  // Lesson 02: Typing Practice and Speed Building
  'inf2020_02_speed_test': '02_keyboarding_practice/assessments',
  'inf2020_02_accuracy_test': '02_keyboarding_practice/assessments',

  // Quiz 03: Keyboarding Final Assessment
  'inf2020_03_final_speed': '03_keyboarding_final_assessment/assessments',
  'inf2020_03_final_accuracy': '03_keyboarding_final_assessment/assessments',

};
