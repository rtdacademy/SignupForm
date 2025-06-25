const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

exports.course3_08_accounting_equation_assessment = createStandardMultipleChoice({
  questionId: 'course3_08_accounting_equation_assessment',
  question: 'If a business has $50,000 in assets and $20,000 in liabilities, what is the owner\'s equity?',
  options: [
    '$30,000',
    '$70,000',
    '$50,000',
    '$20,000'
  ],
  correctAnswer: '$30,000',
  explanation: 'Using the accounting equation: Assets ($50,000) = Liabilities ($20,000) + Owner\'s Equity. Therefore, Owner\'s Equity = $50,000 - $20,000 = $30,000.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'application'
  }
});