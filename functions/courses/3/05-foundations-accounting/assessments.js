const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_05_foundations_assessment = createStandardMultipleChoice({
  questionId: 'course3_05_foundations_assessment',
  question: 'What is the fundamental accounting equation?',
  options: [
    'Assets = Liabilities + Owner\'s Equity',
    'Revenue = Expenses + Profit',
    'Cash = Assets - Liabilities',
    'Income = Revenue - Expenses'
  ],
  correctAnswer: 'Assets = Liabilities + Owner\'s Equity',
  explanation: 'The fundamental accounting equation shows that assets must equal the sum of liabilities and owner\'s equity, forming the basis of double-entry bookkeeping.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'knowledge'
  }
});