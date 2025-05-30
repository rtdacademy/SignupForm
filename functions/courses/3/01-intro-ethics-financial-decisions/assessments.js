const { createAIMultipleChoice } = require('../../../shared/assessment-types/ai-multiple-choice');
const { ETHICS_FALLBACK_QUESTIONS } = require('./fallback-questions');

// Course 3 - Lesson 1: Introduction and Ethics in Financial Decision Making
exports.course3_01_intro_ethics_financial_decisions_aiQuestion = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about ethics in financial decision-making for Grade 11-12 students.
    
    Focus on:
    - Basic ethical principles in finance (honesty, fairness, responsibility, transparency)
    - Simple ethical dilemmas in personal finance
    - Introduction to financial literacy concepts
    
    The question should test understanding of ethical concepts without requiring advanced financial knowledge.
    Make it relatable to teenage students' experiences.`,
    
    intermediate: `Create an intermediate-level multiple choice question about ethics in financial decision-making for Grade 11-12 students.
    
    Focus on:
    - Applying ethical frameworks to financial scenarios
    - Analyzing stakeholder impacts of financial decisions
    - Balancing personal benefit with ethical considerations
    - Common ethical challenges in personal finance
    
    Include a realistic scenario that requires ethical reasoning.`,
    
    advanced: `Create an advanced multiple choice question about ethics in financial decision-making for Grade 11-12 students.
    
    Focus on:
    - Complex ethical dilemmas involving multiple stakeholders
    - Long-term consequences of financial decisions
    - Ethical implications of investment choices
    - Balancing competing ethical principles
    
    Present a challenging scenario that requires sophisticated ethical analysis.`
  },
  
  activityType: 'lesson',
  katexFormatting: false,  // No complex math needed for ethics questions
  
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
  topic: 'Ethics in Financial Decision Making',
  learningObjectives: [
    'Define financial literacy and its importance',
    'Identify key ethical principles in financial decision-making',
    'Recognize common ethical dilemmas in personal finance',
    'Apply ethical frameworks to financial scenarios'
  ],
  
  // Fallback questions
  fallbackQuestions: ETHICS_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});