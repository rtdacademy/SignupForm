/**
 * Assessment Functions for Core Concepts Lesson
 * Course: 100
 * Content: 02-core-concepts
 * 
 * This file demonstrates how to use the modular assessment system.
 * Function naming convention: COURSEID_FOLDERNAME_FUNCTIONTYPE
 * 
 * IMPORTANT: Replace 100 with your actual course ID when creating a real course.
 */

// Import modular assessment types from shared directory
const { createAIMultipleChoice } = require('../shared/assessment-types/ai-multiple-choice');

// Import course-specific fallback questions
const { FALLBACK_QUESTIONS } = require('./fallback-questions');

//==============================================================================
// AI Multiple Choice Question Handler
// Function name: course100_02_core_concepts_aiQuestion
//==============================================================================

/**
 * AI-powered multiple choice assessment for core concepts
 * This uses the shared AI multiple choice module with course-specific configuration
 */
exports.course100_02_core_concepts_aiQuestion = createAIMultipleChoice({
  // Course-specific prompts that override the defaults
  prompts: {
    beginner: `Create a multiple-choice question about basic core concepts in this subject area. 
    Focus on fundamental definitions, basic relationships between concepts, and foundational understanding.
    Make sure the question is accessible to students who are just beginning to learn about these topics.
    The question should test recognition and basic comprehension rather than complex application.`,
    
    intermediate: `Create a multiple-choice question that tests understanding of how core concepts 
    work together and can be applied. Focus on relationships between different concepts, 
    practical applications, and scenarios where students must demonstrate understanding 
    rather than just memorization. This should be appropriate for students who have learned 
    the basics and are ready to apply their knowledge.`,
    
    advanced: `Create a complex multiple-choice question that requires deep analysis and synthesis 
    of core concepts. Focus on challenging scenarios, edge cases, implications of the concepts 
    in complex situations, or evaluation of different approaches. This should challenge students 
    who have mastered the fundamentals and are ready for sophisticated application and analysis.`
  },
  
  // Assessment settings (these override global defaults)
  maxAttempts: 3,           // Allow 3 attempts for this lesson
  pointsValue: 5,           // Worth 5 points (overrides course default)
  showFeedback: true,       // Show detailed feedback after each attempt
  
  // AI generation settings (optional overrides)
  aiSettings: {
    temperature: 0.8,       // Slightly more creative than default
    topP: 0.9,             // Allow more varied responses
    topK: 50               // Consider more token options
  },
  
  // Course-specific fallback questions
  fallbackQuestions: FALLBACK_QUESTIONS,
  
  // Cloud function configuration (optional overrides)
  timeout: 90,              // Allow extra time for AI generation
  memory: '1GiB',          // Use more memory for complex AI operations
  region: 'us-central1'     // Specify region
});

//==============================================================================
// Example: Standard Multiple Choice (for comparison)
// Function name: course100_02_core_concepts_multipleChoice
//==============================================================================

/**
 * Traditional predefined multiple choice assessment
 * This shows how you can still create custom assessments alongside the modular ones
 */

const { onCall } = require('firebase-functions/v2/https');
const { 
  extractParameters, 
  initializeCourseIfNeeded, 
  getServerTimestamp, 
  getDatabaseRef 
} = require('../shared/utilities/database-utils');

// Predefined questions database
const PREDEFINED_QUESTIONS = {
  'q1_foundations': {
    questionText: "Which of the following best describes the relationship between the first and second core concepts?",
    options: [
      { id: 'a', text: 'They are completely independent of each other' },
      { id: 'b', text: 'The second concept builds upon the first' },
      { id: 'c', text: 'They contradict each other' },
      { id: 'd', text: 'Only one of them is important' }
    ],
    correctOptionId: 'b',
    explanation: 'The second core concept builds upon and extends the first, creating a comprehensive framework for understanding the subject.',
    optionFeedback: {
      'a': 'Incorrect. The core concepts are interconnected and build upon each other.',
      'b': 'Correct! The second concept builds upon and extends the first.',
      'c': 'Incorrect. The concepts complement rather than contradict each other.',
      'd': 'Incorrect. Both concepts are equally important to understanding the framework.'
    },
    pointsValue: 3,
    maxAttempts: 2
  }
};

exports.course100_02_core_concepts_multipleChoice = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
}, async (data, context) => {
  // Use shared parameter extraction
  const params = extractParameters(data, context);
  
  // Initialize course if needed
  await initializeCourseIfNeeded(params.studentKey, params.courseId);
  
  // Get database references using shared utilities
  const assessmentRef = getDatabaseRef('studentAssessment', params.studentKey, params.courseId, params.assessmentId);
  const secureRef = getDatabaseRef('secureAssessment', params.courseId, params.assessmentId, params.studentKey);

  if (params.operation === 'generate') {
    const questionData = PREDEFINED_QUESTIONS[params.assessmentId];
    if (!questionData) {
      throw new Error(`Question not found: ${params.assessmentId}`);
    }

    // Save public question data
    await assessmentRef.set({
      timestamp: getServerTimestamp(),
      questionText: questionData.questionText,
      options: questionData.options,
      attempts: 0,
      maxAttempts: questionData.maxAttempts,
      pointsValue: questionData.pointsValue,
      status: 'active',
      settings: {
        showFeedback: true
      }
    });

    // Save secure data
    await secureRef.set({
      correctOptionId: questionData.correctOptionId,
      explanation: questionData.explanation,
      optionFeedback: questionData.optionFeedback,
      timestamp: getServerTimestamp()
    });

    return { success: true, questionGenerated: true, assessmentId: params.assessmentId };
  }
  
  if (params.operation === 'evaluate') {
    const assessmentSnapshot = await assessmentRef.once('value');
    const assessmentData = assessmentSnapshot.val();
    
    const secureSnapshot = await secureRef.once('value');
    const secureData = secureSnapshot.val();

    if (!assessmentData || !secureData) {
      throw new Error('Assessment data not found');
    }

    const isCorrect = params.answer === secureData.correctOptionId;
    const attempts = (assessmentData.attempts || 0) + 1;
    const attemptsRemaining = assessmentData.maxAttempts - attempts;
    
    // Update assessment
    await assessmentRef.update({
      attempts,
      lastSubmission: {
        answer: params.answer,
        isCorrect,
        timestamp: getServerTimestamp(),
        feedback: secureData.optionFeedback[params.answer] || (isCorrect ? 'Correct!' : 'Incorrect.'),
        correctOptionId: secureData.correctOptionId
      },
      status: isCorrect ? 'completed' : 
              attempts >= assessmentData.maxAttempts ? 'failed' : 'attempted',
      correctOverall: assessmentData.correctOverall || isCorrect
    });

    // Record grade if correct (and not already recorded)
    if (isCorrect && !assessmentData.correctOverall) {
      const gradeRef = getDatabaseRef('studentGrade', params.studentKey, params.courseId, params.assessmentId);
      await gradeRef.set(assessmentData.pointsValue);
    }

    return {
      success: true,
      result: {
        isCorrect,
        correctOptionId: secureData.correctOptionId,
        feedback: secureData.optionFeedback[params.answer] || (isCorrect ? 'Correct!' : 'Incorrect.'),
        explanation: secureData.explanation
      },
      attemptsRemaining: Math.max(0, attemptsRemaining),
      attemptsMade: attempts
    };
  }

  throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
});

//==============================================================================
// Function Export Summary
//==============================================================================

/**
 * Functions exported from this module:
 * 
 * 1. course100_02_core_concepts_aiQuestion
 *    - AI-powered multiple choice using shared module
 *    - Customized prompts and fallback questions
 *    - 3 attempts, 5 points, enhanced AI settings
 * 
 * 2. course100_02_core_concepts_multipleChoice  
 *    - Traditional predefined multiple choice
 *    - Custom implementation for specific needs
 *    - 2 attempts, 3 points, predefined questions
 * 
 * To add more assessments:
 * 1. Import additional assessment types from shared/assessment-types/
 * 2. Configure with course-specific settings
 * 3. Add fallback questions to fallback-questions.js
 * 4. Export with proper naming convention
 * 
 * Remember to register these functions in your main functions/index.js file!
 */