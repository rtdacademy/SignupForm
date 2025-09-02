/**
 * True/False Assessment Module
 * This module provides a factory function to create true/false assessments
 * Simplified version of multiple choice optimized for binary true/false questions
 * 
 * ARCHITECTURE:
 * =============
 * This backend module works in conjunction with the frontend component:
 * - Frontend: src/FirebaseCourses/components/assessments/StandardTrueFalseQuestion/index.js
 * - Backend: This module creates cloud functions that the frontend calls
 * - Configuration: Set parameters in course-specific files
 * 
 * WORKFLOW:
 * =========
 * 1. Configure this module in your course assessment file
 * 2. Deploy the cloud function
 * 3. Frontend component calls your cloud function to generate/evaluate questions
 * 4. Students interact with true/false questions through the frontend UI
 * 
 * USAGE:
 * ======
 * 
 * ```javascript
 * const { createTrueFalse } = require('../shared/assessment-types/true-false');
 * 
 * exports.yourFunctionName = createTrueFalse({
 *   // Configuration object - see ACCEPTED PARAMETERS below
 * });
 * ```
 * 
 * ACCEPTED PARAMETERS:
 * ===================
 * 
 * Core Configuration:
 * - questions: {Array<Object>} - Pool of true/false questions (required)
 *   Each question should have:
 *   - questionText: {string} - The statement to evaluate as true or false
 *   - correctAnswer: {boolean} - Whether the statement is true or false
 *   - explanation: {string} - Explanation of why the answer is correct
 *   - feedback: {Object} - Feedback for each answer choice:
 *     - true: {string} - Feedback when student selects true
 *     - false: {string} - Feedback when student selects false
 *   - difficulty: {string} - Difficulty level ('beginner', 'intermediate', 'advanced')
 *   - tags: {Array<string>} - Optional tags for categorization
 *   - image: {Object} - Optional image (url, alt, caption)
 * 
 * Selection Settings:
 * - randomizeQuestions: {boolean} - Pick random question from pool (default: true)
 * - allowSameQuestion: {boolean} - Allow repeating same question (default: false)
 * - difficultyFilter: {string} - Only select questions of specific difficulty
 * - tagFilter: {Array<string>} - Only select questions with specific tags
 * 
 * Activity Settings:
 * - activityType: {string} - Type of activity ('lesson', 'assignment', 'exam', 'lab')
 * - maxAttempts: {number} - Maximum attempts allowed (default: from course config)
 * - pointsValue: {number} - Points awarded for correct answer (default: 1)
 * - showFeedback: {boolean} - Whether to show detailed feedback (default: true)
 * - theme: {string} - Color theme ('blue', 'green', 'purple', 'amber')
 * 
 * EXAMPLE USAGE:
 * ==============
 * 
 * ```javascript
 * exports.course4_true_false_example = createTrueFalse({
 *   questions: [
 *     {
 *       questionText: "The speed of light in a vacuum is constant regardless of the observer's motion.",
 *       correctAnswer: true,
 *       explanation: "According to Einstein's special relativity, the speed of light in a vacuum is always c = 299,792,458 m/s for all observers.",
 *       feedback: {
 *         true: "Correct! This is one of the fundamental postulates of special relativity.",
 *         false: "Incorrect. The speed of light in a vacuum is constant for all observers."
 *       },
 *       difficulty: 'intermediate',
 *       tags: ['physics', 'relativity']
 *     },
 *     {
 *       questionText: "Water freezes at 100°C at standard atmospheric pressure.",
 *       correctAnswer: false,
 *       explanation: "Water freezes at 0°C (32°F) at standard atmospheric pressure. 100°C is the boiling point of water.",
 *       feedback: {
 *         true: "Incorrect. Water freezes at 0°C, not 100°C.",
 *         false: "Correct! Water freezes at 0°C and boils at 100°C at standard pressure."
 *       },
 *       difficulty: 'beginner',
 *       tags: ['physics', 'thermodynamics']
 *     }
 *   ],
 *   activityType: 'lesson',
 *   maxAttempts: 3,
 *   pointsValue: 1,
 *   theme: 'blue',
 *   randomizeQuestions: true
 * });
 * ```
 */

const { onCall } = require('firebase-functions/v2/https');
const { loadConfig } = require('../utilities/config-loader');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef, updateGradebookItem, getCourseConfig } = require('../utilities/database-utils');
const { storeSubmission, createMultipleChoiceSubmissionRecord } = require('../utilities/submission-storage');

/**
 * Core handler for True/False questions
 * This function can be used directly or wrapped in createTrueFalse
 */
class TrueFalseCore {
  constructor(config) {
    this.config = {
      ...config,
      // Default settings
      randomizeQuestions: config.randomizeQuestions !== false,
      allowSameQuestion: config.allowSameQuestion || false,
      showFeedback: config.showFeedback !== false,
      pointsValue: config.pointsValue || 1,
      maxAttempts: config.maxAttempts || 999,
      theme: config.theme || 'purple'
    };
  }

  /**
   * Selects a question from the pool based on configuration
   */
  selectQuestion(difficulty = null, usedQuestionIds = []) {
    if (!this.config.questions || !Array.isArray(this.config.questions) || this.config.questions.length === 0) {
      throw new Error('No questions provided in configuration');
    }

    let availableQuestions = [...this.config.questions];

    // Filter by difficulty if specified
    if (this.config.difficultyFilter || difficulty) {
      const targetDifficulty = this.config.difficultyFilter || difficulty;
      const filteredByDifficulty = availableQuestions.filter(q => q.difficulty === targetDifficulty);
      if (filteredByDifficulty.length > 0) {
        availableQuestions = filteredByDifficulty;
      }
    }

    // Filter by tags if specified
    if (this.config.tagFilter && Array.isArray(this.config.tagFilter) && this.config.tagFilter.length > 0) {
      const filteredByTags = availableQuestions.filter(q => 
        q.tags && q.tags.some(tag => this.config.tagFilter.includes(tag))
      );
      if (filteredByTags.length > 0) {
        availableQuestions = filteredByTags;
      }
    }

    // Filter out used questions if not allowing same question
    if (!this.config.allowSameQuestion && usedQuestionIds.length > 0) {
      availableQuestions = availableQuestions.filter((q, index) => 
        !usedQuestionIds.includes(`q_${index}`)
      );
    }

    // If no questions left after filtering, reset to full pool
    if (availableQuestions.length === 0) {
      availableQuestions = [...this.config.questions];
    }

    // Select a random question if randomization is enabled
    if (this.config.randomizeQuestions) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      const selectedQuestion = availableQuestions[randomIndex];
      
      // Find the original index for tracking
      const originalIndex = this.config.questions.findIndex(q => q === selectedQuestion);
      
      return {
        ...selectedQuestion,
        questionId: `q_${originalIndex}`
      };
    } else {
      // Return questions in order
      return {
        ...availableQuestions[0],
        questionId: `q_${this.config.questions.indexOf(availableQuestions[0])}`
      };
    }
  }

  /**
   * Generates a new question for the student
   */
  async generateQuestion(params) {
    const { 
      studentEmail, 
      userId, 
      courseId, 
      assessmentId,
      difficulty,
      isStaff 
    } = params;

    // Get student's previous attempts
    const sanitizedEmail = studentEmail.replace(/\./g, ',');
    const assessmentRef = getDatabaseRef('studentAssessment', sanitizedEmail, courseId, assessmentId, isStaff);
    
    let assessmentData = null;
    try {
      const snapshot = await assessmentRef.once('value');
      assessmentData = snapshot.val();
    } catch (error) {
      console.log('No existing assessment data, creating new');
    }

    // Check attempt limits
    const currentAttempts = assessmentData?.attempts || 0;
    if (currentAttempts >= this.config.maxAttempts) {
      throw new Error(`Maximum attempts (${this.config.maxAttempts}) reached for this assessment`);
    }

    // Get list of used questions
    const usedQuestionIds = assessmentData?.usedQuestions || [];

    // Select a question
    const question = this.selectQuestion(difficulty, usedQuestionIds);

    // Create the question data for the database
    const questionData = {
      questionText: question.questionText,
      correctAnswer: question.correctAnswer,
      type: 'true-false',
      difficulty: question.difficulty || 'intermediate',
      tags: question.tags || [],
      attempts: currentAttempts,
      maxAttempts: this.config.maxAttempts,
      pointsValue: this.config.pointsValue,
      status: 'active',
      timestamp: getServerTimestamp(),
      settings: {
        theme: this.config.theme,
        showFeedback: this.config.showFeedback,
        activityType: this.config.activityType || 'lesson'
      }
    };

    // Add image if present
    if (question.image) {
      questionData.image = question.image;
    }

    // Update used questions list
    const updatedUsedQuestions = [...usedQuestionIds];
    if (!updatedUsedQuestions.includes(question.questionId)) {
      updatedUsedQuestions.push(question.questionId);
    }

    // Save to database
    const updates = {
      ...questionData,
      usedQuestions: updatedUsedQuestions
    };

    await assessmentRef.update(updates);

    return {
      success: true,
      questionData: questionData
    };
  }

  /**
   * Evaluates a student's answer
   */
  async evaluateAnswer(params) {
    const { 
      studentEmail, 
      userId, 
      courseId, 
      assessmentId,
      answer,
      isStaff 
    } = params;

    if (answer === null || answer === undefined) {
      throw new Error('Answer is required for evaluation');
    }

    // Get current assessment data
    const sanitizedEmail = studentEmail.replace(/\./g, ',');
    const assessmentRef = getDatabaseRef('studentAssessment', sanitizedEmail, courseId, assessmentId, isStaff);
    
    const snapshot = await assessmentRef.once('value');
    const assessmentData = snapshot.val();

    if (!assessmentData) {
      throw new Error('No assessment found. Please generate a question first.');
    }

    // Check attempt limits
    const currentAttempts = assessmentData.attempts || 0;
    if (currentAttempts >= this.config.maxAttempts) {
      throw new Error(`Maximum attempts (${this.config.maxAttempts}) reached for this assessment`);
    }

    // Evaluate the answer
    const isCorrect = answer === assessmentData.correctAnswer;
    const pointsEarned = isCorrect ? this.config.pointsValue : 0;

    // Find the original question to get feedback
    const originalQuestion = this.config.questions.find(q => 
      q.questionText === assessmentData.questionText
    );

    // Get feedback based on the answer
    let feedback = '';
    if (originalQuestion && originalQuestion.feedback) {
      // Support both formats: {correct/incorrect} and {true/false}
      if (originalQuestion.feedback.correct !== undefined) {
        feedback = isCorrect ? originalQuestion.feedback.correct : originalQuestion.feedback.incorrect;
      } else if (originalQuestion.feedback.true !== undefined) {
        feedback = answer ? originalQuestion.feedback.true : originalQuestion.feedback.false;
      } else {
        // If feedback is a single string, use it
        feedback = typeof originalQuestion.feedback === 'string' ? originalQuestion.feedback : '';
      }
      // If feedback is explicitly empty, keep it empty (for acknowledgment checkboxes)
      if (feedback === '') {
        feedback = '';
      }
    } else {
      // Default feedback if not provided in config
      feedback = isCorrect ? 'Correct!' : 'Incorrect. Try again.';
    }
    
    // Don't add default feedback if it was explicitly set to empty
    if (feedback === undefined || feedback === null) {
      feedback = isCorrect ? 'Correct!' : 'Incorrect. Try again.';
    }

    // Create submission record
    const submission = {
      answer: answer,
      isCorrect: isCorrect,
      correctAnswer: assessmentData.correctAnswer,
      feedback: feedback,
      pointsEarned: pointsEarned,
      timestamp: getServerTimestamp()
    };
    
    // Only add explanation if it exists (Firebase doesn't accept undefined values)
    if (originalQuestion && originalQuestion.explanation) {
      submission.explanation = originalQuestion.explanation;
    }

    // Update assessment with new attempt
    const updatedAttempts = currentAttempts + 1;
    const updates = {
      attempts: updatedAttempts,
      lastSubmission: submission,
      status: isCorrect ? 'completed' : 'attempted',
      correctOverall: isCorrect || assessmentData.correctOverall || false
    };

    await assessmentRef.update(updates);

    // CRITICAL: Update grade in /Grades/assessments/ to trigger gradebook recalculation
    // This follows the same pattern as standard-multiple-choice.js
    const gradeRef = getDatabaseRef('studentGrade', sanitizedEmail, courseId, assessmentId, isStaff);
    
    // Calculate current attempt score
    const currentScore = isCorrect ? pointsEarned : 0;
    
    // Implement best score policy - never allow grade to decrease
    let shouldUpdateGrade = false;
    let finalScore = currentScore;
    
    try {
      const existingGradeSnapshot = await gradeRef.once('value');
      const existingGrade = existingGradeSnapshot.val();
      
      if (existingGrade === null || existingGrade === undefined) {
        // First attempt - always save (even if 0)
        shouldUpdateGrade = true;
        console.log(`First attempt: saving grade ${currentScore}/${pointsEarned}`);
      } else if (currentScore > existingGrade) {
        // Better score - save the improvement
        shouldUpdateGrade = true;
        finalScore = currentScore;
        console.log(`Improved score: ${existingGrade} → ${currentScore}`);
      } else {
        // Same or worse score - keep existing grade (never allow grade to decrease)
        shouldUpdateGrade = false;
        finalScore = existingGrade;
        console.log(`Score not improved: keeping existing grade ${existingGrade} (attempted: ${currentScore})`);
      }
    } catch (error) {
      console.error('Error checking existing grade:', error);
      // If we can't read existing grade, save current score
      shouldUpdateGrade = true;
    }
    
    // Update grade record if needed
    if (shouldUpdateGrade) {
      await gradeRef.set(finalScore);
      console.log(`✅ Grade updated in /Grades/assessments/${assessmentId}: ${finalScore}`);
    }
    
    // Update grade metadata for audit trail
    const gradeMetadataRef = getDatabaseRef('gradeMetadata', sanitizedEmail, courseId, assessmentId, isStaff);
    
    try {
      // Get existing metadata to preserve history
      const existingMetadataSnapshot = await gradeMetadataRef.once('value');
      const existingMetadata = existingMetadataSnapshot.val() || {};
      
      // Build grade history entry
      const historyEntry = {
        score: currentScore,
        timestamp: getServerTimestamp(),
        attempt: updatedAttempts,
        isCorrect: isCorrect,
        answer: answer
      };
      
      // Preserve existing history and add new entry
      const gradeHistory = existingMetadata.gradeHistory || [];
      gradeHistory.push(historyEntry);
      
      const gradeMetadata = {
        bestScore: finalScore,
        currentScore: currentScore,
        achievedAt: shouldUpdateGrade ? getServerTimestamp() : (existingMetadata.achievedAt || getServerTimestamp()),
        achievedOnAttempt: shouldUpdateGrade ? updatedAttempts : (existingMetadata.achievedOnAttempt || updatedAttempts),
        sourceAssessmentId: assessmentId,
        sourceActivityType: assessmentData.settings?.activityType || 'lesson',
        totalAttempts: updatedAttempts,
        pointsValue: pointsEarned,
        lastAttemptAt: getServerTimestamp(),
        gradeHistory: gradeHistory.slice(-10) // Keep last 10 attempts
      };
      
      await gradeMetadataRef.set(gradeMetadata);
      console.log(`📝 Grade metadata updated for ${assessmentId}`);
    } catch (error) {
      console.error('Failed to update grade metadata:', error);
      // Don't fail the whole operation if metadata update fails
    }

    // Note: updateGradebookItem is now a no-op, but we keep it for backward compatibility
    // The real gradebook update will be triggered by the database trigger watching /Grades/assessments/
    if (isCorrect) {
      try {
        await updateGradebookItem(
          sanitizedEmail,
          courseId,
          assessmentId,
          finalScore
        );
      } catch (error) {
        console.error('Failed to call updateGradebookItem:', error);
      }
    }

    return {
      success: true,
      result: submission,
      attemptsMade: updatedAttempts,
      gradeUpdated: shouldUpdateGrade,
      finalScore: finalScore
    };
  }

  /**
   * Main handler function
   */
  async handle(params) {
    const { operation } = params;

    switch (operation) {
      case 'generate':
        return await this.generateQuestion(params);
      
      case 'evaluate':
        return await this.evaluateAnswer(params);
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

/**
 * Factory function to create a true/false cloud function
 * @param {Object} config - Configuration object for the true/false assessment
 * @returns {Function} Cloud function handler
 */
function createTrueFalse(config) {
  const core = new TrueFalseCore(config);
  
  return onCall({
    memory: config.memory || '256MiB',
    cpu: config.cpu || 1,
    region: config.region || 'us-central1',
    timeoutSeconds: config.timeout || 60,
    enforceAppCheck: false,
  }, async (request) => {
    try {
      const data = request.data;
      return await core.handle(data);
    } catch (error) {
      console.error('True/False assessment error:', error);
      throw error;
    }
  });
}

/**
 * Static handler that can be used directly with universal_assessments
 */
class TrueFalseCoreStatic {
  static async handle(params, config) {
    const core = new TrueFalseCore(config);
    return await core.handle(params);
  }
}

module.exports = {
  createTrueFalse,
  TrueFalseCore: TrueFalseCoreStatic
};