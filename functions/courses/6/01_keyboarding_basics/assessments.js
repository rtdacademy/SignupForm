/**
 * Assessment Functions for Typing Basics and Hand Position
 * Course: 6 
 * Content: 01_keyboarding_basics
 * 
 * This module provides a simple true/false assessment for lesson completion
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type
const activityDefaults = {
  theme: 'blue',
  maxAttempts: 999,
  pointsValue: 1
};

/**
 * Assessment Configurations for Universal Assessment Function
 */
const assessmentConfigs = {
  'course6_01_keyboarding_basics': {
    type: 'true-false',
    activityType: ACTIVITY_TYPE,
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: false,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'Keyboarding',
    gradeLevel: 'Multi-Grade',
    topic: 'Lesson Completion',
    learningObjectives: [
      'Confirm understanding of touch typing fundamentals',
      'Acknowledge completion of keyboard basics lesson'
    ],
    questions: [
      {
        id: 'q1',
        questionText: 'I have read and understood the Touch Typing Fundamentals lesson, including proper hand position, home row keys, and finger placement techniques.',
        correctAnswer: true,
        feedback: {
          correct: '',  // Empty string - no feedback needed for acknowledgment
          incorrect: ''  // Empty string - they can just check the box again
        }
        // Removed explanation since it's not needed for a simple acknowledgment
      }
    ],
    settings: {
      shuffleQuestions: false,
      questionsPerAttempt: 1,
      displayStyle: 'buttons'
    }
  }
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};