const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_13_correct_errors_assessment = createStandardMultipleChoice({
  questionId: 'course3_13_correct_errors_assessment',
  question: 'What is the first step in identifying accounting errors?',
  options: [
    'Compare the trial balance totals for debits and credits',
    'Rewrite all journal entries',
    'Prepare new financial statements',
    'Close all accounts'
  ],
  correctAnswer: 'Compare the trial balance totals for debits and credits',
  explanation: 'If debits and credits don\'t balance in the trial balance, it indicates an error that needs investigation.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'analysis'
  }
});