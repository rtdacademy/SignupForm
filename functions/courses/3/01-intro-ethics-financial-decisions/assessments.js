const { createAIMultipleChoice } = require('../shared/assessment-types/ai-multiple-choice');
const { ETHICS_FALLBACK_QUESTIONS } = require('./fallback-questions');

// Course 3 - Lesson 1: Introduction and Ethics in Financial Decision Making
// Question 1: Financial Literacy Fundamentals
exports.course3_01_intro_ethics_question1 = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about financial literacy fundamentals for Grade 11-12 students.
    
    Focus on:
    - Definition and importance of financial literacy
    - Core components of financial literacy (budgeting, investing, banking, risk management)
    - Basic financial vocabulary and concepts
    - Why financial literacy matters for young people
    
    The question should test understanding of foundational financial literacy concepts.
    Make it relatable to teenage students starting their financial journey.`,
    
    intermediate: `Create an intermediate-level multiple choice question about financial literacy fundamentals for Grade 11-12 students.
    
    Focus on:
    - Components of financial literacy and their interconnections
    - Practical applications of financial literacy skills
    - Benefits of being financially literate
    - Real-world scenarios where financial literacy is important
    
    Include a realistic scenario that demonstrates the value of financial literacy.`,
    
    advanced: `Create an advanced multiple choice question about financial literacy fundamentals for Grade 11-12 students.
    
    Focus on:
    - Complex relationships between different areas of financial literacy
    - Long-term impact of financial literacy on life outcomes
    - Analysis of financial literacy gaps and their consequences
    - Critical evaluation of financial literacy in different contexts
    
    Present a challenging scenario that requires deep understanding of financial literacy concepts.`
  },
  
  activityType: 'lesson',
  katexFormatting: false,
  
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
  topic: 'Financial Literacy Fundamentals',
  learningObjectives: [
    'Define financial literacy and its importance',
    'Identify core components of financial literacy',
    'Understand the value of financial education',
    'Recognize applications of financial literacy skills'
  ],
  
  // Fallback questions
  fallbackQuestions: ETHICS_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});

// Question 2: Ethical Decision Making in Finance
exports.course3_01_intro_ethics_question2 = createAIMultipleChoice({
  prompts: {
    beginner: `Create a beginner-level multiple choice question about ethical decision making in personal finance for Grade 11-12 students.
    
    Focus on:
    - Basic ethical principles in finance (honesty, fairness, responsibility, transparency)
    - Simple ethical dilemmas in personal finance
    - Right vs. wrong in financial situations
    - Impact of financial decisions on others
    
    The question should test understanding of basic financial ethics without requiring advanced knowledge.
    Use scenarios that teenagers might actually encounter.`,
    
    intermediate: `Create an intermediate-level multiple choice question about ethical decision making in personal finance for Grade 11-12 students.
    
    Focus on:
    - Applying ethical frameworks to financial scenarios
    - Analyzing stakeholder impacts of financial decisions
    - Balancing personal benefit with ethical considerations
    - Common ethical challenges in personal finance
    
    Include a realistic scenario that requires ethical reasoning and consideration of multiple perspectives.`,
    
    advanced: `Create an advanced multiple choice question about ethical decision making in personal finance for Grade 11-12 students.
    
    Focus on:
    - Complex ethical dilemmas involving multiple stakeholders
    - Long-term consequences of financial decisions
    - Ethical implications of different financial choices
    - Balancing competing ethical principles
    
    Present a challenging scenario that requires sophisticated ethical analysis and moral reasoning.`
  },
  
  activityType: 'lesson',
  katexFormatting: false,
  
  // Assessment settings
  maxAttempts: 999,
  pointsValue: 5,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Difficulty settings
  allowDifficultySelection: false,
  defaultDifficulty: 'intermediate',
  
  // Course metadata
  subject: 'Financial Literacy',
  gradeLevel: '11-12',
  topic: 'Ethical Decision Making in Finance',
  learningObjectives: [
    'Identify key ethical principles in financial decision-making',
    'Recognize common ethical dilemmas in personal finance',
    'Apply ethical frameworks to financial scenarios',
    'Consider stakeholder impacts in financial decisions'
  ],
  
  // Fallback questions
  fallbackQuestions: ETHICS_FALLBACK_QUESTIONS,
  
  // Cloud function settings
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});