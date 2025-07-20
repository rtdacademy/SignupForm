const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_04_budgeting_assessment = createStandardMultipleChoice({
  questionId: 'course3_04_budgeting_assessment',
  question: 'What is the primary purpose of creating a personal budget?',
  options: [
    'To track income and expenses and plan for financial goals',
    'To restrict all spending',
    'To make more money',
    'To avoid paying taxes'
  ],
  correctAnswer: 'To track income and expenses and plan for financial goals',
  explanation: 'A budget helps you understand where your money goes and plan for both short-term needs and long-term financial goals.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});