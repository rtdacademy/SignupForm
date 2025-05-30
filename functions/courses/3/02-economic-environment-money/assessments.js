const { createAIMultipleChoice } = require('../../../shared/assessment-types/ai-multiple-choice');
const { ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS } = require('./fallback-questions');

// Course 3 - Lesson 2: The Economic Environment and Your Money
exports.course3_02_economic_environment_money_aiQuestion = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about how economic factors affect personal finances for Grade 11-12 students.
    
    Focus on:
    - Basic economic indicators (GDP, unemployment, inflation, interest rates)
    - Simple cause-and-effect relationships
    - Direct impacts on everyday financial situations
    - Real-world examples students can relate to
    
    Keep explanations clear and avoid complex economic jargon.`,
    
    intermediate: `Create an intermediate-level multiple choice question about the economic environment and personal finance for Grade 11-12 students.
    
    Focus on:
    - How inflation affects purchasing power with concrete examples
    - Interest rate impacts on saving and borrowing decisions
    - Economic cycles and personal financial planning
    - Practical strategies for different economic conditions
    
    Include realistic scenarios with specific numbers or percentages where appropriate.`,
    
    advanced: `Create an advanced multiple choice question about economic factors and personal financial strategy for Grade 11-12 students.
    
    Focus on:
    - Complex relationships between multiple economic indicators
    - Strategic financial responses to economic changes
    - Long-term planning considering economic cycles
    - Trade-offs between different financial strategies
    
    Present nuanced scenarios requiring analysis of multiple economic factors.`
  },
  
  activityType: 'lesson',
  katexFormatting: true,  // Enable for percentage calculations and financial formulas
  
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
  topic: 'Economic Environment and Personal Finance',
  learningObjectives: [
    'Explain how economic indicators affect personal finances',
    'Understand the relationship between inflation and purchasing power',
    'Analyze how interest rates impact saving and borrowing decisions',
    'Identify strategies to protect finances during economic changes'
  ],
  
  // Fallback questions
  fallbackQuestions: ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});