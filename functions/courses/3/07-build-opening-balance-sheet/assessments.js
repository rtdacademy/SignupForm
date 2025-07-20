const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_07_opening_balance_assessment = createStandardMultipleChoice({
  questionId: 'course3_07_opening_balance_assessment',
  question: 'What does an opening balance sheet show?',
  options: [
    'The financial position of a business at the start of an accounting period',
    'The profits earned during a specific period',
    'The cash flow for the month',
    'The expenses incurred during operations'
  ],
  correctAnswer: 'The financial position of a business at the start of an accounting period',
  explanation: 'An opening balance sheet provides a snapshot of assets, liabilities, and equity at the beginning of an accounting period.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});