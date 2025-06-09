// Course 3 - Lesson 2: The Economic Environment and Your Money
// Index file that exports all assessment questions

// Import all individual question files
const { course3_02_economic_environment_question1 } = require('./assessments/question1-economic-indicators');
const { course3_02_economic_environment_question2 } = require('./assessments/question2-inflation');
const { course3_02_economic_environment_question3 } = require('./assessments/question3-interest-rates');
const { course3_02_economic_environment_question4 } = require('./assessments/question4-economic-cycles');
const { course3_02_economic_environment_longAnswer } = require('./assessments/long-answer-economic-analysis');
const { course3_02_economic_environment_shortAnswer } = require('./assessments/short-answer-decision-making');

// Re-export all questions
module.exports = {
  course3_02_economic_environment_question1,
  course3_02_economic_environment_question2,
  course3_02_economic_environment_question3,
  course3_02_economic_environment_question4,
  course3_02_economic_environment_longAnswer,
  course3_02_economic_environment_shortAnswer
};