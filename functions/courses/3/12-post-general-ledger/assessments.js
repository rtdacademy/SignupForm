const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_12_general_ledger_assessment = createStandardMultipleChoice({
  questionId: 'course3_12_general_ledger_assessment',
  question: 'What is the purpose of posting to the general ledger?',
  options: [
    'To transfer journal entries to individual account records',
    'To create the original journal entries',
    'To prepare financial statements directly',
    'To calculate daily cash balances'
  ],
  correctAnswer: 'To transfer journal entries to individual account records',
  explanation: 'Posting transfers information from the journal to individual accounts in the ledger, organizing transactions by account.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});