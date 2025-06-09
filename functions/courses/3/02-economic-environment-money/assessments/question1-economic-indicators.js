const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');
const { ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS } = require('../fallback-questions');

// Course 3 - Lesson 2: The Economic Environment and Your Money
// Question 1: Economic Indicators
exports.course3_02_economic_environment_question1 = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about economic indicators and their impact on personal finances for Grade 11-12 students.
    
    Focus on:
    - Basic economic indicators (GDP, unemployment rate, inflation rate, interest rates)
    - Simple definitions and what they measure
    - Direct impacts on everyday financial situations
    - Real-world examples students can relate to
    
    The question should test understanding of what economic indicators are and how they generally affect people's finances.`,
    
    intermediate: `Create an intermediate-level multiple choice question about economic indicators and personal finance for Grade 11-12 students.
    
    Focus on:
    - Understanding relationships between different economic indicators
    - How changes in indicators affect personal financial decisions
    - Practical implications for students and families
    - Reading and interpreting economic data
    
    Include realistic scenarios showing how economic indicators impact personal finances.`,
    
    advanced: `Create an advanced multiple choice question about economic indicators and strategic financial planning for Grade 11-12 students.
    
    Focus on:
    - Complex relationships between multiple economic indicators
    - Using economic data to make informed financial decisions
    - Predicting economic trends and their personal finance implications
    - Strategic responses to economic indicator changes
    
    Present scenarios requiring analysis of multiple economic indicators and their combined effects.`
  },
  
  activityType: 'lesson',
  katexFormatting: true,
  
  // Assessment settings
  maxAttempts: 999,
  pointsValue: 5,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'blue',
  
  // Difficulty settings
  allowDifficultySelection: false,
  defaultDifficulty: 'intermediate',
  
  // Course metadata
  subject: 'Financial Literacy',
  gradeLevel: '11-12',
  topic: 'Economic Indicators and Personal Finance',
  learningObjectives: [
    'Explain how economic indicators affect personal finances',
    'Identify key economic indicators and their meanings',
    'Analyze the impact of economic data on financial decisions',
    'Understand relationships between different economic measures'
  ],
  
  // Fallback questions
  fallbackQuestions: ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});