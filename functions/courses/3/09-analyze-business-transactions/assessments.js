const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_09_business_transactions_assessment = createStandardMultipleChoice({
  questionId: 'course3_09_business_transactions_assessment',
  question: 'When analyzing a business transaction, what must always remain in balance?',
  options: [
    'The accounting equation (Assets = Liabilities + Owner\'s Equity)',
    'Cash inflows and outflows',
    'Revenue and expenses',
    'Debits and credits only'
  ],
  correctAnswer: 'The accounting equation (Assets = Liabilities + Owner\'s Equity)',
  explanation: 'Every business transaction must maintain the balance of the fundamental accounting equation.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});