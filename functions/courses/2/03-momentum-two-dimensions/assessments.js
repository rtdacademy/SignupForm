const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef } = require('../../../../shared/utilities/database-utils');

const assessments = {
  assessment1: {
    type: 'ai-multiple-choice',
    handler: createAIMultipleChoice({
      systemPrompt: `You are an assessment generator for Lesson 2 - Momentum in Two Dimensions in Momentum & Impulse.`,
      userPrompt: `Generate a multiple choice question about Lesson 2 - Momentum in Two Dimensions concepts.`,
      temperature: 0.7,
      courseId: 2
    })
  }
};

module.exports = { assessments };
