const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_06_accounting_system_assessment = createStandardMultipleChoice({
  questionId: 'course3_06_accounting_system_assessment',
  question: 'What is the first step in setting up an accounting system?',
  options: [
    'Identifying the chart of accounts needed for the business',
    'Recording the first transaction',
    'Calculating profit and loss',
    'Preparing financial statements'
  ],
  correctAnswer: 'Identifying the chart of accounts needed for the business',
  explanation: 'The chart of accounts provides the foundation for organizing and categorizing all business transactions.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});