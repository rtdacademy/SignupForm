/**
 * Assessment Functions for Unit 1 Assignment: Data Analysis Project
 * Course: 5 
 * Content: 04_data_science_unit1_assignment
 * 
 * This module provides assessments for this assignment
 * using the shared assessment system.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'assignment';

// Default settings for this activity type
const activityDefaults = {
  theme: 'blue',
  maxAttempts: 3,
  pointsValue: 1
};


// Question pool 1: Data Exploration
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

// Question pool 2: Statistical Analysis
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
  'course5_04_assignment_data_exploration': {
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
    topic: 'Data Exploration',
    learningObjectives: [
      '[Learning objective 1]',
      '[Learning objective 2]',
      '[Learning objective 3]'
    ]
  },
  'course5_04_assignment_analysis': {
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
    topic: 'Statistical Analysis',
    learningObjectives: [
      '[Learning objective 1]',
      '[Learning objective 2]',
      '[Learning objective 3]'
    ]
  },
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};
