const { createAIMultipleChoice } = require('../../shared/assessment-types/ai-multiple-choice');
const { ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS } = require('../fallback-questions');

// Question 3: Interest Rate Strategy and Financial Planning
exports.course3_02_economic_environment_question3 = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about interest rates and their impact on personal finances for Grade 11-12 students.
    
    Focus on:
    - Basic understanding of what interest rates are
    - How interest rates affect saving and borrowing
    - Simple examples of interest rate impacts
    - When high vs. low interest rates are good or bad for consumers
    
    Use clear examples like savings accounts, loans, or credit cards to illustrate concepts.`,
    
    intermediate: `Create an intermediate-level multiple choice question about interest rate strategy and financial planning for Grade 11-12 students.
    
    Focus on:
    - Strategic responses to interest rate changes
    - How to adjust financial behavior based on interest rate environment
    - Timing decisions around major purchases or refinancing
    - Balancing saving and borrowing strategies
    
    Include realistic scenarios requiring students to choose appropriate strategies for different interest rate conditions.`,
    
    advanced: `Create an advanced multiple choice question about interest rate strategy and comprehensive financial planning for Grade 11-12 students.
    
    Focus on:
    - Complex financial strategies across different interest rate cycles
    - Long-term planning considering interest rate volatility
    - Trade-offs between different financial strategies
    - Portfolio adjustments based on interest rate expectations
    
    Present sophisticated scenarios requiring analysis of multiple financial strategies and their timing.`
  },
  
  activityType: 'lesson',
  katexFormatting: true,
  
  // Assessment settings
  maxAttempts: 999,
  pointsValue: 5,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Difficulty settings
  allowDifficultySelection: false,
  defaultDifficulty: 'intermediate',
  
  // Course metadata
  subject: 'Financial Literacy',
  gradeLevel: '11-12',
  topic: 'Interest Rate Strategy and Financial Planning',
  learningObjectives: [
    'Analyze how interest rates impact saving and borrowing decisions',
    'Identify strategies to protect finances during economic changes',
    'Develop appropriate responses to interest rate changes',
    'Understand timing of financial decisions based on interest rates'
  ],
  
  // Fallback questions
  fallbackQuestions: ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});