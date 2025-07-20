const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_11_petty_cash_assessment = createStandardMultipleChoice({
  questionId: 'course3_11_petty_cash_assessment',
  question: 'What is the purpose of a petty cash fund?',
  options: [
    'To handle small, routine cash payments',
    'To store large amounts of cash',
    'To replace the need for a bank account',
    'To pay employee salaries'
  ],
  correctAnswer: 'To handle small, routine cash payments',
  explanation: 'Petty cash funds are used for small, frequent expenses like office supplies or minor repairs.',
  metadata: {
    difficulty: 'beginner',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});