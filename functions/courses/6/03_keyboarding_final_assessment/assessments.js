/**
 * Assessment Functions for Keyboarding Final Assessment
 * Course: 6 
 * Content: 03_keyboarding_final_assessment
 * 
 * This module provides assessments for this quiz
 * using the shared assessment system.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'quiz';

// Default settings for this activity type
const activityDefaults = {
  theme: 'amber',
  maxAttempts: 3,
  pointsValue: 1
};


// Question pool 1: Final Speed Test
const questionPool1 = [
  {
    questionText: "[Add question text here]",
    options: [
      { 
        id: 'a', 
        text: '[Option A text]', 
        feedback: '[Feedback for option A]' 
      },
      { 
        id: 'b', 
        text: '[Option B text]', 
        feedback: '[Feedback for option B]' 
      },
      { 
        id: 'c', 
        text: '[Option C text]', 
        feedback: '[Feedback for option C]' 
      },
      { 
        id: 'd', 
        text: '[Option D text]', 
        feedback: '[Feedback for option D]' 
      }
    ],
    correctOptionId: 'a', // Change to correct option
    explanation: '[Detailed explanation of the correct answer]',
    difficulty: 'intermediate',
    tags: ['topic1', 'topic2']
  },
  // Add more questions to this pool as needed
];

// Question pool 2: Final Accuracy Test
const questionPool2 = [
  {
    questionText: "[Add question text here]",
    options: [
      { 
        id: 'a', 
        text: '[Option A text]', 
        feedback: '[Feedback for option A]' 
      },
      { 
        id: 'b', 
        text: '[Option B text]', 
        feedback: '[Feedback for option B]' 
      },
      { 
        id: 'c', 
        text: '[Option C text]', 
        feedback: '[Feedback for option C]' 
      },
      { 
        id: 'd', 
        text: '[Option D text]', 
        feedback: '[Feedback for option D]' 
      }
    ],
    correctOptionId: 'a', // Change to correct option
    explanation: '[Detailed explanation of the correct answer]',
    difficulty: 'intermediate',
    tags: ['topic1', 'topic2']
  },
  // Add more questions to this pool as needed
];

/**
 * Assessment Configurations for Universal Assessment Function
 */
const assessmentConfigs = {
  'inf2020_03_final_speed': {
    type: 'multiple-choice',
    questions: questionPool1,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 3,
    pointsValue: 5,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'General',
    gradeLevel: 'Multi-Grade',
    topic: 'Final Speed Test',
    learningObjectives: [
      '[Learning objective 1]',
      '[Learning objective 2]',
      '[Learning objective 3]'
    ]
  },
  'inf2020_03_final_accuracy': {
    type: 'multiple-choice',
    questions: questionPool2,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 3,
    pointsValue: 5,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'General',
    gradeLevel: 'Multi-Grade',
    topic: 'Final Accuracy Test',
    learningObjectives: [
      '[Learning objective 1]',
      '[Learning objective 2]',
      '[Learning objective 3]'
    ]
  },
  
  // Final typing assessment using direct score
  'course6_03_final_typing_assessment': {
    type: 'direct-score',
    allowDirectScoring: true,
    requiresVerification: false,
    minimumInteractionTime: 60000, // 60 seconds minimum for final assessment
    minimumInteractions: 100, // At least 100 keystrokes for final
    passingCriteria: {
      minWpm: 25,  // Higher requirement for final assessment
      minAccuracy: 80  // Higher accuracy requirement
    },
    metadata: {
      title: 'Final Typing Assessment',
      description: 'Complete a comprehensive typing test with sentences to demonstrate proficiency',
      category: 'final_assessment',
      points: 10,  // Worth more points as final assessment
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