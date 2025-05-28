const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef } = require('../../../../shared/utilities/database-utils');

const assessments = {
  assessment1: {
    type: 'ai-multiple-choice',
    handler: createAIMultipleChoice({
      systemPrompt: `You are an assessment generator for Lesson 25 - Early Atomic Models in The Nature of the Atom.`,
      userPrompt: `Generate a multiple choice question about Lesson 25 - Early Atomic Models concepts.`,
      temperature: 0.7,
      courseId: 2
    })
  }
};

module.exports = { assessments };
