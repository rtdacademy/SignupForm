const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

exports.course3_14_trial_balance_assessment = createStandardMultipleChoice({
  questionId: 'course3_14_trial_balance_assessment',
  question: 'What does a trial balance verify?',
  options: [
    'That total debits equal total credits',
    'That the business is profitable',
    'That all bills have been paid',
    'That assets exceed liabilities'
  ],
  correctAnswer: 'That total debits equal total credits',
  explanation: 'A trial balance ensures the accounting equation is balanced and that debits equal credits.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});
EOF < /dev/null
