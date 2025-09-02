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
  'course6_01_keyboarding_basics': '01_keyboarding_basics/assessments',

  
  // Direct score assessments for each typing category
  'course6_02_keyboarding_beginner': '02_keyboarding_practice/assessments',
  'course6_02_keyboarding_homerow': '02_keyboarding_practice/assessments',
  'course6_02_keyboarding_numbers': '02_keyboarding_practice/assessments',
  'course6_02_keyboarding_math': '02_keyboarding_practice/assessments',
  'course6_02_keyboarding_sentences': '02_keyboarding_practice/assessments',

  // Quiz 03: Keyboarding Final Assessment
  'course6_03_final_typing_assessment': '03_keyboarding_final_assessment/assessments',

};
