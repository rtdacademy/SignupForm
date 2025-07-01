const { createAIMultipleChoice } = require('shared/assessment-types/ai-multiple-choice');
const { ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS } = require('../fallback-questions');

// Question 2: Inflation and Purchasing Power
exports.course3_02_economic_environment_question2 = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about inflation and purchasing power for Grade 11-12 students.
    
    Focus on:
    - Basic definition of inflation and purchasing power
    - Simple examples of how inflation affects everyday purchases
    - Why inflation matters for personal finances
    - Real-world scenarios students can understand
    
    Use concrete examples like the cost of common items (coffee, gas, movie tickets) to illustrate concepts.`,
    
    intermediate: `Create an intermediate-level multiple choice question about inflation and purchasing power for Grade 11-12 students.
    
    Focus on:
    - How inflation affects purchasing power with specific examples
    - Calculating the impact of inflation over time
    - Different types of inflation and their causes
    - Strategies to protect against inflation
    
    Include realistic scenarios with specific percentages or calculations showing inflation's impact.`,
    
    advanced: `Create an advanced multiple choice question about inflation, purchasing power, and financial strategy for Grade 11-12 students.
    
    Focus on:
    - Complex inflation scenarios with multiple variables
    - Long-term effects of inflation on financial planning
    - Comparing different inflation protection strategies
    - Analysis of inflation's impact on different types of investments
    
    Present challenging scenarios requiring sophisticated understanding of inflation's effects.`
  },
  
  activityType: 'lesson',
  katexFormatting: true,
  
  // Assessment settings
  maxAttempts: 999,
  pointsValue: 5,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'orange',
  
  // Difficulty settings
  allowDifficultySelection: false,
  defaultDifficulty: 'intermediate',
  
  // Course metadata
  subject: 'Financial Literacy',
  gradeLevel: '11-12',
  topic: 'Inflation and Purchasing Power',
  learningObjectives: [
    'Understand the relationship between inflation and purchasing power',
    'Calculate the impact of inflation over time',
    'Identify strategies to protect against inflation',
    'Recognize different types and causes of inflation'
  ],
  
  // Fallback questions
  fallbackQuestions: ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});