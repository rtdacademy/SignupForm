const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_10_journalize_assessment = createStandardMultipleChoice({
  questionId: 'course3_10_journalize_assessment',
  question: 'What is the purpose of journalizing transactions?',
  options: [
    'To record transactions in chronological order with debits and credits',
    'To calculate the final profit',
    'To prepare financial statements',
    'To determine tax obligations'
  ],
  correctAnswer: 'To record transactions in chronological order with debits and credits',
  explanation: 'Journalizing creates a chronological record of all business transactions using the double-entry system.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});