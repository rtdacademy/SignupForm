const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef } = require('../../../../shared/utilities/database-utils');

const assessments = {
  assessment1: {
    type: 'ai-multiple-choice',
    handler: createAIMultipleChoice({
      systemPrompt: `You are an assessment generator for Lesson 35 - Nuclear Physics in Nuclear Physics.`,
      userPrompt: `Generate a multiple choice question about Lesson 35 - Nuclear Physics concepts.`,
      temperature: 0.7,
      courseId: 2
    })
  }
};

module.exports = { assessments };
