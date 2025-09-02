/**
 * Assessment Functions for Typing Basics and Hand Position
 * Course: 6 
 * Content: 01_keyboarding_basics
 * 
 * This module provides typing exploration assessments for this lesson
 * using interactive typing practice activities.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type
const activityDefaults = {
  theme: 'purple',
  maxAttempts: 999,
  pointsValue: 1
};

// Typing exploration exercises for home row practice
const homeRowExercises = [
  {
    text: "asdf jkl; asdf jkl;",
    instructions: "Type the home row keys. Place your fingers on the home row and type each letter.",
    difficulty: 'beginner',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
  },
  {
    text: "aaa sss ddd fff jjj kkk lll ;;;",
    instructions: "Practice each home row key three times. Focus on using the correct finger.",
    difficulty: 'beginner',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';']
  },
  {
    text: "sad lad ask fall",
    instructions: "Type these simple words using only home row keys.",
    difficulty: 'beginner',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l']
  },
  {
    text: "flask salad falls",
    instructions: "Type these longer words. Keep your fingers on the home row.",
    difficulty: 'intermediate',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l']
  },
  {
    text: "dad had a sad lad",
    instructions: "Type this sentence. Use the space bar with your thumb.",
    difficulty: 'intermediate',
    focusKeys: ['a', 's', 'd', 'f', 'h', 'l', ' ']
  }
];

// Finger position exercises
const fingerPositionExercises = [
  {
    text: "fff jjj fff jjj",
    instructions: "Practice with your index fingers on F and J. Feel the raised bumps on these keys.",
    difficulty: 'beginner',
    focusKeys: ['f', 'j']
  },
  {
    text: "ddd kkk ddd kkk",
    instructions: "Use your middle fingers for D and K.",
    difficulty: 'beginner',
    focusKeys: ['d', 'k']
  },
  {
    text: "sss lll sss lll",
    instructions: "Use your ring fingers for S and L.",
    difficulty: 'beginner',
    focusKeys: ['s', 'l']
  },
  {
    text: "aaa ;;; aaa ;;;",
    instructions: "Use your pinky fingers for A and semicolon.",
    difficulty: 'beginner',
    focusKeys: ['a', ';']
  },
  {
    text: "qaz wsx edc rfv",
    instructions: "Explore the keys above and below the home row with your left hand.",
    difficulty: 'intermediate',
    focusKeys: ['q', 'a', 'z', 'w', 's', 'x', 'e', 'd', 'c', 'r', 'f', 'v']
  },
  {
    text: "tgb yhn ujm ik,",
    instructions: "Explore the keys above and below the home row with your right hand.",
    difficulty: 'intermediate',
    focusKeys: ['t', 'g', 'b', 'y', 'h', 'n', 'u', 'j', 'm', 'i', 'k', ',']
  }
];

/**
 * Assessment Configurations for Universal Assessment Function
 * Note: These are configured for typing practice rather than multiple-choice
 */
const assessmentConfigs = {
  'inf2020_01_hand_position': {
    type: 'typing-practice',
    exercises: homeRowExercises,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'Keyboarding',
    gradeLevel: 'Multi-Grade',
    topic: 'Home Row Key Exploration',
    learningObjectives: [
      'Identify and locate the home row keys on the keyboard',
      'Place fingers correctly on the home row position',
      'Type simple words using home row keys with proper finger placement'
    ],
    settings: {
      showKeyboard: true,
      showFingerGuides: true,
      allowBackspace: true,
      trackAccuracy: false, // Don't penalize errors during exploration
      trackSpeed: false, // Focus on learning, not speed
      explorationMode: true // Allow free typing between exercises
    }
  },
  'inf2020_01_typing_technique': {
    type: 'typing-practice',
    exercises: fingerPositionExercises,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'Keyboarding',
    gradeLevel: 'Multi-Grade',
    topic: 'Finger Position Practice',
    learningObjectives: [
      'Use the correct finger for each key on the keyboard',
      'Maintain proper hand position while typing',
      'Develop muscle memory for key locations'
    ],
    settings: {
      showKeyboard: true,
      showFingerGuides: true,
      highlightNextKey: true,
      allowBackspace: true,
      trackAccuracy: true,
      trackSpeed: false,
      minAccuracyToPass: 70,
      explorationMode: true
    }
  },
  'inf2020_01_free_exploration': {
    type: 'typing-exploration',
    activityType: ACTIVITY_TYPE,
    maxAttempts: 999,
    pointsValue: 0, // No points for free exploration
    showFeedback: false,
    enableHints: true,
    enableAIChat: true,
    theme: activityDefaults.theme,
    subject: 'Keyboarding',
    gradeLevel: 'Multi-Grade',
    topic: 'Free Keyboard Exploration',
    learningObjectives: [
      'Explore the keyboard layout at your own pace',
      'Discover key locations through hands-on practice',
      'Build confidence with keyboard navigation'
    ],
    settings: {
      freeTypingMode: true,
      showKeyboard: true,
      showFingerGuides: true,
      showKeyHistory: true,
      maxKeyHistory: 20,
      allowAllKeys: true,
      noTimeLimit: true,
      noTextPrompt: true,
      instructions: "Type anything you want! Explore the keyboard and see what happens when you press different keys."
    }
  }
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};
