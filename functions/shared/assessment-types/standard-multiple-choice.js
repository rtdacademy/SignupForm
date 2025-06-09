/**
 * Standard Multiple Choice Assessment Module
 * This module provides a factory function to create standard multiple choice assessments
 * Course developers can import this and configure it with their specific question pools
 * 
 * ARCHITECTURE:
 * =============
 * This backend module works in conjunction with the frontend component:
 * - Frontend: src/FirebaseCourses/components/assessments/StandardMultipleChoiceQuestion/index.js
 * - Backend: This module creates cloud functions that the frontend calls
 * - Configuration: Set parameters in course-specific files like functions/courses/3/02-economic-environment-money/assessments.js
 * 
 * The frontend component automatically handles:
 * - Displaying questions selected from the pool
 * - Student answer submission and evaluation
 * - Progress tracking and attempt management
 * - Theme and UI customization based on your configuration
 * 
 * WORKFLOW:
 * =========
 * 1. Configure this module in your course assessment file (functions/courses/[courseId]/[content]/assessments.js)
 * 2. Deploy the cloud function
 * 3. Frontend component calls your cloud function to generate/evaluate questions
 * 4. Students interact with questions through the frontend UI
 * 5. All configuration (question pools, themes, etc.) is controlled server-side for security
 * 
 * USAGE:
 * ======
 * 
 * To use this module in your course assessment file:
 * 
 * ```javascript
 * const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');
 * 
 * exports.yourFunctionName = createStandardMultipleChoice({
 *   // Configuration object - see ACCEPTED PARAMETERS below
 * });
 * ```
 * 
 * ACCEPTED PARAMETERS:
 * ===================
 * 
 * Core Configuration:
 * - questions: {Array<Object>} - Pool of questions to randomly select from (required)
 *   Each question should have:
 *   - questionText: {string} - The question text
 *   - options: {Array<Object>} - Array of {id, text, feedback} objects
 *   - correctOptionId: {string} - ID of correct option ('a', 'b', 'c', or 'd')
 *   - explanation: {string} - Explanation of the correct answer
 *   - difficulty: {string} - Difficulty level ('beginner', 'intermediate', 'advanced')
 *   - tags: {Array<string>} - Optional tags for categorization
 * 
 * Selection Settings:
 * - randomizeQuestions: {boolean} - Pick random question from pool (default: true)
 * - randomizeOptions: {boolean} - Shuffle answer options (default: true)
 * - allowSameQuestion: {boolean} - Allow repeating same question in regenerations (default: false)
 * - difficultyFilter: {string} - Only select questions of specific difficulty (optional)
 * - tagFilter: {Array<string>} - Only select questions with specific tags (optional)
 * 
 * Activity Settings:
 * - activityType: {string} - Type of activity ('lesson', 'assignment', 'exam', 'lab')
 * - maxAttempts: {number} - Maximum attempts allowed (default: from course config)
 * - pointsValue: {number} - Points awarded for correct answer (default: 2)
 * - showFeedback: {boolean} - Whether to show detailed feedback (default: true)
 * - enableHints: {boolean} - Whether to enable hints (default: true)
 * - attemptPenalty: {number} - Points deducted per attempt (default: 0)
 * - theme: {string} - Color theme ('blue', 'green', 'purple', 'amber')
 * - allowDifficultySelection: {boolean} - Allow students to select difficulty (default: false)
 * - defaultDifficulty: {string} - Default difficulty level ('beginner', 'intermediate', 'advanced')
 * 
 * Cloud Function Settings:
 * - region: {string} - Firebase function region (default: 'us-central1')
 * - timeout: {number} - Function timeout in seconds (default: 60)
 * - memory: {string} - Memory allocation (default: '256MiB')
 * 
 * EXAMPLE USAGE:
 * ==============
 * 
 * ```javascript
 * exports.course3_economics_standard = createStandardMultipleChoice({
 *   questions: [
 *     {
 *       questionText: "What happens to your purchasing power when inflation increases?",
 *       options: [
 *         { id: 'a', text: 'It increases', feedback: 'Incorrect. Inflation reduces purchasing power.' },
 *         { id: 'b', text: 'It decreases', feedback: 'Correct! Inflation means prices rise, so your money buys less.' },
 *         { id: 'c', text: 'It stays the same', feedback: 'Incorrect. Inflation always affects purchasing power.' },
 *         { id: 'd', text: 'It becomes unpredictable', feedback: 'Incorrect. The effect is predictable - it decreases.' }
 *       ],
 *       correctOptionId: 'b',
 *       explanation: 'Inflation is a general increase in prices, which means each dollar buys fewer goods and services over time.',
 *       difficulty: 'intermediate',
 *       tags: ['inflation', 'purchasing-power']
 *     }
 *   ],
 *   activityType: 'lesson',
 *   maxAttempts: 3,
 *   pointsValue: 2,
 *   theme: 'blue',
 *   randomizeQuestions: true,
 *   randomizeOptions: true,
 *   allowSameQuestion: false
 * });
 * ```
 */

const { onCall } = require('firebase-functions/v2/https');
const { loadConfig } = require('../utilities/config-loader');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef, updateGradebookItem, getCourseConfig } = require('../utilities/database-utils');
const { storeSubmission, createMultipleChoiceSubmissionRecord } = require('../utilities/submission-storage');

/**
 * Shuffles an array in place
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Selects a question from the pool based on configuration
 * @param {Object} config - Configuration object with questions and settings
 * @param {string} difficulty - The requested difficulty level
 * @param {Array} usedQuestionIds - Array of question IDs already used (to avoid repetition)
 * @returns {Object} Selected question
 */
function selectQuestionFromPool(config, difficulty = 'intermediate', usedQuestionIds = []) {
  if (!config.questions || !Array.isArray(config.questions) || config.questions.length === 0) {
    throw new Error('No questions provided in configuration');
  }

  let availableQuestions = [...config.questions];

  // Filter by difficulty if specified
  if (config.difficultyFilter || difficulty) {
    const targetDifficulty = config.difficultyFilter || difficulty;
    const filteredByDifficulty = availableQuestions.filter(q => q.difficulty === targetDifficulty);
    if (filteredByDifficulty.length > 0) {
      availableQuestions = filteredByDifficulty;
    }
    // If no questions match the difficulty, use all questions as fallback
  }

  // Filter by tags if specified
  if (config.tagFilter && Array.isArray(config.tagFilter) && config.tagFilter.length > 0) {
    const filteredByTags = availableQuestions.filter(q => 
      q.tags && Array.isArray(q.tags) && 
      config.tagFilter.some(tag => q.tags.includes(tag))
    );
    if (filteredByTags.length > 0) {
      availableQuestions = filteredByTags;
    }
    // If no questions match the tags, use current pool as fallback
  }

  // Filter out used questions if allowSameQuestion is false
  if (config.allowSameQuestion === false && usedQuestionIds.length > 0) {
    const unusedQuestions = availableQuestions.filter((q, index) => 
      !usedQuestionIds.includes(index.toString()) && !usedQuestionIds.includes(q.id)
    );
    if (unusedQuestions.length > 0) {
      availableQuestions = unusedQuestions;
    }
    // If all questions have been used, reset and use all questions
  }

  // Select random question from available pool
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];

  // Find the original index for tracking used questions
  const originalIndex = config.questions.findIndex(q => q === selectedQuestion);

  // Clone the question and shuffle options if requested
  const question = {
    ...selectedQuestion,
    options: config.randomizeOptions !== false ? 
      shuffleArray([...selectedQuestion.options]) : 
      [...selectedQuestion.options],
    originalIndex: originalIndex,
    selectedFrom: 'pool'
  };

  return question;
}

/**
 * Evaluates the student's answer to the selected question
 * @param {Object} question - The question object with correctOptionId and options
 * @param {string} studentAnswer - The student's selected option ID
 * @returns {Object} Result of the evaluation
 */
function evaluateStandardQuestionAnswer(question, studentAnswer) {
  // Check if the selected answer is one of the valid options
  if (!question.options.some(opt => opt.id === studentAnswer)) {
    return {
      isCorrect: false,
      correctOptionId: question.correctOptionId,
      feedback: "Invalid answer selection",
      explanation: question.explanation
    };
  }

  const isCorrect = studentAnswer === question.correctOptionId;
  
  // Get the appropriate feedback based on selected option
  const selectedOption = question.options.find(opt => opt.id === studentAnswer);
  const feedback = selectedOption ? selectedOption.feedback : "";
  
  return {
    isCorrect,
    correctOptionId: question.correctOptionId,
    feedback: feedback || (isCorrect ? "Correct!" : "Incorrect."),
    explanation: question.explanation
  };
}

/**
 * Infers activity type from assessment ID patterns
 * @param {string} assessmentId - The assessment identifier
 * @returns {string} The inferred activity type
 */
function inferActivityTypeFromAssessmentId(assessmentId) {
  if (!assessmentId) return 'lesson';
  
  const id = assessmentId.toLowerCase();
  
  if (id.includes('assignment') || id.includes('homework') || id.includes('hw')) {
    return 'assignment';
  } else if (id.includes('exam') || id.includes('test') || id.includes('final')) {
    return 'exam';
  } else if (id.includes('lab') || id.includes('laboratory') || id.includes('experiment')) {
    return 'lab';
  } else {
    return 'lesson';
  }
}

/**
 * Core business logic for Standard Multiple Choice assessments
 * This can be called directly by other systems without Firebase wrapper
 */
class StandardMultipleChoiceCore {
  constructor(config = {}) {
    this.config = config;
  }

  async handleGenerate(params) {
    // Load and merge configurations
    const globalConfig = await loadConfig();
    
    // SECURITY: Use hardcoded activity type from course config (cannot be manipulated by client)
    // Priority: courseConfig.activityType (hardcoded) > inferred from assessmentId > fallback to lesson
    const activityType = this.config.activityType || inferActivityTypeFromAssessmentId(params.assessmentId) || 'lesson';
    
    // Log the activity type being used for debugging
    console.log(`Using activity type: ${activityType} (Source: ${this.config.activityType ? 'hardcoded' : 'inferred'})`);
    
    // Get activity-specific configuration
    const activityConfig = this.config.activityTypes?.[activityType] || this.config.activityTypes?.lesson || {};
    
    const config = {
      ...globalConfig.questionTypes?.multipleChoice?.standard || {},
      ...activityConfig,
      ...this.config
    };

    // Initialize course if needed
    await initializeCourseIfNeeded(params.studentKey, params.courseId, params.isStaff);

    // Reference to the assessment in the database
    const assessmentRef = getDatabaseRef('studentAssessment', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    const dbPath = params.isStaff 
      ? `staff_testing/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`
      : `students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`;
    console.log(`Database path: ${dbPath}`);

    // Check if this is a regeneration or a new assessment
    const existingAssessmentSnapshot = await assessmentRef.once('value');
    const existingAssessment = existingAssessmentSnapshot.val();
    const isRegeneration = !!existingAssessment;
    
    // Initialize the attempts counter
    let currentAttempts = 0;
    let usedQuestionIds = [];
    if (existingAssessment) {
      currentAttempts = existingAssessment.attempts || 0;
      usedQuestionIds = existingAssessment.usedQuestionIds || [];
    }
    
    console.log(`This is a ${isRegeneration ? 'regeneration' : 'new question'} request. Current attempts: ${currentAttempts}`);
    
    // Look up course settings to get max attempts
    const courseRef = getDatabaseRef('courseAssessment', params.courseId, params.assessmentId);
    const courseAssessmentSnapshot = await courseRef.once('value');
    const courseAssessmentData = courseAssessmentSnapshot.val();
    
    // Determine max attempts from hierarchy: courseConfig > activityConfig > courseAssessmentData > defaults
    let maxAttempts = config.maxAttempts || activityConfig.maxAttempts || 9999;
    if (courseAssessmentData && courseAssessmentData.maxAttempts) {
      maxAttempts = courseAssessmentData.maxAttempts;
    }
    
    console.log(`Max attempts configuration: courseConfig=${config.maxAttempts}, activityConfig=${activityConfig.maxAttempts}, final=${maxAttempts}`);
    console.log(`Max attempts allowed: ${maxAttempts}`);
    
    // Verify the student hasn't exceeded the max attempts
    if (isRegeneration && currentAttempts >= maxAttempts) {
      console.log(`Security check: Student has exceeded max attempts (${currentAttempts}/${maxAttempts})`);
      throw new Error(`Maximum attempts (${maxAttempts}) reached for this assessment. No more regenerations allowed.`);
    }
    
    // Select question from pool
    console.log(`Selecting question from pool for topic: ${params.topic}, difficulty: ${params.difficulty}`);
    const question = selectQuestionFromPool(
      config,
      params.difficulty,
      usedQuestionIds
    );
    
    // Update used questions list
    const newUsedQuestionIds = [...usedQuestionIds];
    if (question.originalIndex !== undefined && !newUsedQuestionIds.includes(question.originalIndex.toString())) {
      newUsedQuestionIds.push(question.originalIndex.toString());
    }
    
    // Create the final question data object to save
    const questionData = {
      timestamp: getServerTimestamp(),
      questionText: question.questionText,
      options: question.options.map(opt => ({ id: opt.id, text: opt.text })),
      topic: params.topic,
      difficulty: question.difficulty || params.difficulty,
      generatedBy: 'standard',
      attempts: currentAttempts,
      status: 'active',
      maxAttempts: maxAttempts,
      activityType: activityType,
      pointsValue: config.pointsValue || activityConfig.pointValue || 2,
      attemptPenalty: config.attemptPenalty || activityConfig.attemptPenalty || 0,
      usedQuestionIds: newUsedQuestionIds,
      selectedQuestionIndex: question.originalIndex,
      settings: {
        showFeedback: config.showFeedback !== false && activityConfig.showDetailedFeedback !== false,
        enableHints: config.enableHints !== false && activityConfig.enableHints !== false,
        allowDifficultySelection: config.allowDifficultySelection || activityConfig.allowDifficultySelection || false,
        theme: config.theme || activityConfig.theme || 'purple',
        defaultDifficulty: config.defaultDifficulty || activityConfig.defaultDifficulty || 'intermediate',
        randomizeQuestions: config.randomizeQuestions !== false,
        randomizeOptions: config.randomizeOptions !== false,
        allowSameQuestion: config.allowSameQuestion === true
      }
    };
    
    // Store public question data in the database (student-accessible)
    await assessmentRef.set(questionData);

    // Store the secure data in a completely separate database node (server-side only)
    const secureRef = getDatabaseRef('secureAssessment', params.courseId, params.assessmentId, params.studentKey);
    
    await secureRef.set({
      correctOptionId: question.correctOptionId,
      explanation: question.explanation,
      // Store option feedback for each ID
      optionFeedback: question.options.reduce((obj, opt) => {
        obj[opt.id] = opt.feedback || "";
        return obj;
      }, {}),
      selectedQuestionIndex: question.originalIndex,
      timestamp: getServerTimestamp()
    });

    return {
      success: true,
      questionGenerated: true,
      assessmentId: params.assessmentId,
      generatedBy: 'standard',
      selectedQuestionIndex: question.originalIndex
    };
  }

  async handleEvaluate(params) {
    // Initialize course if needed
    await initializeCourseIfNeeded(params.studentKey, params.courseId, params.isStaff);

    // Reference to the assessment in the database
    const assessmentRef = getDatabaseRef('studentAssessment', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    
    // Get the existing question data
    const assessmentSnapshot = await assessmentRef.once('value');
    const assessmentData = assessmentSnapshot.val();

    if (!assessmentData) {
      throw new Error('Assessment not found');
    }
    
    // Verify max attempts from course settings
    const courseRef = getDatabaseRef('courseAssessment', params.courseId, params.assessmentId);
    const courseAssessmentSnapshot = await courseRef.once('value');
    const courseAssessmentData = courseAssessmentSnapshot.val();
    
    // Use course-specific max attempts if available, otherwise use assessment value
    const maxAttemptsFromSettings = (courseAssessmentData && courseAssessmentData.maxAttempts) ? 
      courseAssessmentData.maxAttempts : assessmentData.maxAttempts;
      
    // Security check: Always use the smaller value between saved assessment maxAttempts and 
    // course settings maxAttempts to prevent manipulation
    const secureMaxAttempts = Math.min(
      assessmentData.maxAttempts || 9999,
      maxAttemptsFromSettings || 9999
    );
    
    console.log(`Secure max attempts check: Assessment has ${assessmentData.attempts} attempts. ` + 
      `Max allowed attempts: ${secureMaxAttempts} ` + 
      `(Assessment value: ${assessmentData.maxAttempts}, Course settings value: ${maxAttemptsFromSettings})`);

    // Check if the student has exceeded the max attempts
    if (assessmentData.attempts >= secureMaxAttempts) {
      console.log(`Security check: Student has exceeded verified max attempts (${assessmentData.attempts}/${secureMaxAttempts})`);
      return {
        success: false,
        error: 'Maximum attempts exceeded',
        attemptsRemaining: 0
      };
    }

    // Get the secure data
    const secureRef = getDatabaseRef('secureAssessment', params.courseId, params.assessmentId, params.studentKey);
    const secureSnapshot = await secureRef.once('value');
    const secureData = secureSnapshot.val();

    if (!secureData || !secureData.correctOptionId) {
      throw new Error('Secure assessment data not found');
    }

    // Reconstruct the complete question for evaluation
    const completeQuestion = {
      questionText: assessmentData.questionText,
      options: assessmentData.options.map(opt => ({
        id: opt.id,
        text: opt.text,
        feedback: secureData.optionFeedback ? secureData.optionFeedback[opt.id] : ""
      })),
      correctOptionId: secureData.correctOptionId,
      explanation: secureData.explanation
    };

    // Evaluate the answer
    const result = evaluateStandardQuestionAnswer(completeQuestion, params.answer);

    // Increment the attempts counter 
    let updatedAttempts = (assessmentData.attempts || 0) + 1;
    console.log(`Incrementing attempts from ${assessmentData.attempts || 0} to ${updatedAttempts} on answer submission`);
    
    // Use secure maxAttempts value from earlier validation
    const attemptsRemaining = secureMaxAttempts - updatedAttempts;

    // Create comprehensive submission record for Cloud Storage
    const submissionRecord = createMultipleChoiceSubmissionRecord(
      params,
      assessmentData,
      result,
      updatedAttempts
    );

    // Store detailed submission in Cloud Storage
    let submissionPath = null;
    try {
      submissionPath = await storeSubmission(submissionRecord);
    } catch (storageError) {
      console.warn(`⚠️ Failed to store submission in Cloud Storage: ${storageError.message}`);
      // Continue with assessment - storage failure shouldn't block student progress
    }

    // Check if this question was previously marked correct overall
    const wasCorrectOverall = assessmentData.correctOverall || false;

    // Update assessment data in the database (minimal data, just tracking)
    const updates = {
      attempts: updatedAttempts,
      status: result.isCorrect ? 'completed' : (attemptsRemaining > 0 ? 'attempted' : 'failed'),
      // Track whether the question has ever been answered correctly
      correctOverall: wasCorrectOverall || result.isCorrect,
      lastSubmission: {
        timestamp: getServerTimestamp(),
        answer: params.answer,
        isCorrect: result.isCorrect,
        feedback: result.feedback,
        correctOptionId: result.correctOptionId,
        submissionPath: submissionPath // Reference to Cloud Storage file
      }
    };

    // Update the assessment
    await assessmentRef.update(updates);

    // Always update grade record, but use best score policy
    const gradeRef = getDatabaseRef('studentGrade', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    
    // Get existing grade to implement "best score" policy
    const existingGradeSnapshot = await gradeRef.once('value');
    const existingGrade = existingGradeSnapshot.val();
    
    // Calculate current attempt score
    const pointsValue = assessmentData.pointsValue || 2;
    const currentScore = result.isCorrect ? pointsValue : 0;
    
    // Determine if we should update the grade record
    let shouldUpdateGrade = false;
    let finalScore = currentScore;
    
    if (existingGrade === null || existingGrade === undefined) {
      // First attempt - always save (even if 0)
      shouldUpdateGrade = true;
      console.log(`First attempt: saving grade ${currentScore}/${pointsValue}`);
    } else if (currentScore > existingGrade) {
      // Better score - save the improvement
      shouldUpdateGrade = true;
      finalScore = currentScore;
      console.log(`Improved score: ${existingGrade} → ${currentScore}`);
    } else {
      // Same or worse score - keep existing grade
      shouldUpdateGrade = false;
      finalScore = existingGrade;
      console.log(`Score not improved: keeping existing grade ${existingGrade} (attempted: ${currentScore})`);
    }

    // Update grade record if needed
    if (shouldUpdateGrade) {
      await gradeRef.set(finalScore);

      // Update gradebook with the new/updated score
      try {
        // Get course config for gradebook integration
        const courseConfig = await getCourseConfig(params.courseId);
        
        // Find course structure item for better integration
        const { findCourseStructureItem } = require('../utilities/database-utils');
        const courseStructureItem = await findCourseStructureItem(params.courseId, params.assessmentId);
        
        // Determine activity type from assessment data or course structure
        const activityType = assessmentData.activityType || courseStructureItem?.type || 'lesson';
        
        // Create item configuration for gradebook
        const itemConfig = {
          title: courseStructureItem?.title || params.assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
          type: activityType,
          unitId: courseStructureItem?.unitId || 'unknown',
          courseStructureItemId: courseStructureItem?.itemId,
          pointsValue: pointsValue,
          maxScore: pointsValue,
          weight: courseStructureItem?.weight || 0,
          required: courseStructureItem?.required !== false,
          estimatedTime: courseStructureItem?.estimatedTime || 0
        };

        // Update gradebook item
        await updateGradebookItem(params.studentKey, params.courseId, params.assessmentId, finalScore, itemConfig, params.isStaff);
        
        console.log(`✅ Gradebook updated for assessment ${params.assessmentId} with score ${finalScore} (Course Structure Item: ${courseStructureItem?.itemId || 'unknown'})`);
      } catch (gradebookError) {
        console.warn(`⚠️ Failed to update gradebook for ${params.assessmentId}:`, gradebookError.message);
        // Don't throw error - gradebook failure shouldn't block assessment completion
      }
    } else {
      console.log(`📊 Grade not updated (no improvement), but gradebook already reflects best score: ${finalScore}`);
    }

    // Clean up secure data if assessment is completed or all attempts exhausted
    if (result.isCorrect || attemptsRemaining <= 0) {
      try {
        await secureRef.remove();
        console.log(`🗑️ Cleaned up secure assessment data for ${result.isCorrect ? 'completed' : 'failed'} assessment: ${params.assessmentId}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to cleanup secure data for ${params.assessmentId}:`, cleanupError.message);
        // Don't throw error - cleanup failure shouldn't affect the assessment result
      }
    }

    return {
      success: true,
      result: result,
      attemptsRemaining: attemptsRemaining,
      attemptsMade: updatedAttempts
    };
  }
}

/**
 * Factory function to create a Standard Multiple Choice assessment handler
 * @param {Object} courseConfig - Course-specific configuration
 * @returns {Function} Cloud function handler
 */
function createStandardMultipleChoice(courseConfig = {}) {
  return onCall({
    region: courseConfig.region || 'us-central1',
    timeoutSeconds: courseConfig.timeout || 60,
    memory: courseConfig.memory || '256MiB',
    enforceAppCheck: false,
  }, async (request) => {
    const data = request.data;
    const context = request;
    // Extract and validate parameters
    const params = extractParameters(data, context);
    
    // Create core handler instance
    const coreHandler = new StandardMultipleChoiceCore(courseConfig);

    // Handle question generation operation
    if (params.operation === 'generate') {
      try {
        return await coreHandler.handleGenerate(params);
      } catch (error) {
        console.error("Error generating standard question:", error);
        throw new Error('Error generating question: ' + error.message);
      }
    }
    // Handle answer evaluation operation
    else if (params.operation === 'evaluate') {
      try {
        return await coreHandler.handleEvaluate(params);
      } catch (error) {
        console.error("Error evaluating answer:", error);
        throw new Error('Error evaluating answer: ' + error.message);
      }
    }

    // If the operation is neither generate nor evaluate
    throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
  });
}

module.exports = {
  createStandardMultipleChoice,
  StandardMultipleChoiceCore
};