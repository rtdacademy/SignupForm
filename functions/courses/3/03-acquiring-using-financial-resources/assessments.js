const { createStandardMultipleChoice } = require('shared/assessment-types/standard-multiple-choice');

exports.course3_03_financial_resources_assessment = createStandardMultipleChoice({
  questionId: 'course3_03_financial_resources_assessment',
  question: 'What is the most important factor when acquiring financial resources?',
  options: [
    'Understanding different types of financial resources available',
    'Always choosing the cheapest option',
    'Getting money as quickly as possible',
    'Avoiding all forms of debt'
  ],
  correctAnswer: 'Understanding different types of financial resources available',
  explanation: 'Understanding the different types of financial resources helps you make informed decisions about which options best fit your needs and circumstances.',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});