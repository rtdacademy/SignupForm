/**
 * Standard Long Answer Assessment Module
 * This module provides a factory function to create standard long answer assessments
 * Course developers can import this and configure it with their specific question pools
 * 
 * ARCHITECTURE:
 * =============
 * This backend module works in conjunction with the frontend component:
 * - Frontend: src/FirebaseCourses/components/assessments/StandardLongAnswerQuestion/index.js
 * - Backend: This module creates cloud functions that the frontend calls
 * - Configuration: Set parameters in course-specific files like functions/courses/2/02-momentum-one-dimension/assessments.js
 * 
 * The frontend component automatically handles:
 * - Displaying questions with rubrics selected from the pool
 * - Student answer submission with rich text support via SimpleQuillEditor
 * - Progress tracking and attempt management
 * - Manual grading workflow (no AI evaluation)
 * 
 * WORKFLOW:
 * =========
 * 1. Configure this module in your course assessment file
 * 2. Deploy the cloud function
 * 3. Frontend component calls your cloud function to generate questions
 * 4. Students write answers using the rich text editor
 * 5. Answers are saved for manual grading by instructors
 * 
 * USAGE:
 * ======
 * 
 * ```javascript
 * const { createStandardLongAnswer } = require('../shared/assessment-types/standard-long-answer');
 * 
 * exports.yourFunctionName = createStandardLongAnswer({
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
 *   - rubric: {Array<Object>} - Array of rubric criteria objects
 *     Each criterion should have: {criterion, points, description}
 *   - maxPoints: {number} - Total points for the question
 *   - wordLimit: {Object} - Word count constraints {min, max}
 *   - sampleAnswer: {string} - Sample answer for instructor reference
 *   - difficulty: {string} - Difficulty level ('beginner', 'intermediate', 'advanced')
 *   - topic: {string} - Topic for categorization
 *   - tags: {Array<string>} - Optional tags for categorization
 * 
 * Selection Settings:
 * - randomizeQuestions: {boolean} - Pick random question from pool (default: true)
 * - allowSameQuestion: {boolean} - Allow repeating same question in regenerations (default: false)
 * - difficultyFilter: {string} - Only select questions of specific difficulty (optional)
 * - tagFilter: {Array<string>} - Only select questions with specific tags (optional)
 * 
 * Word Limits (defaults can be overridden per question):
 * - wordLimits: {Object} - Default word count constraints
 *   - min: {number} - Minimum words (default: 100)
 *   - max: {number} - Maximum words (default: 500)
 * 
 * Activity Settings:
 * - activityType: {string} - Type of activity ('lesson', 'assignment', 'exam', 'lab')
 * - maxAttempts: {number} - Maximum attempts allowed (default: 1 for long answer)
 * - showRubric: {boolean} - Whether to show rubric to students (default: true)
 * - showWordCount: {boolean} - Whether to show word count (default: true)
 * - theme: {string} - Color theme ('blue', 'green', 'purple', 'amber')
 * - allowDifficultySelection: {boolean} - Allow students to select difficulty
 * - enableManualGrading: {boolean} - Enable manual grading workflow (default: true)
 * 
 * Cloud Function Settings:
 * - region: {string} - Firebase function region (default: 'us-central1')
 * - timeout: {number} - Function timeout in seconds (default: 60)
 * - memory: {string} - Memory allocation (default: '512MiB')
 * 
 * EXAMPLE USAGE:
 * ==============
 * 
 * ```javascript
 * exports.course2_momentum_standardLongAnswer = createStandardLongAnswer({
 *   questions: [
 *     {
 *       questionText: "Explain the principle of conservation of momentum with real-world examples.",
 *       rubric: [
 *         { criterion: "Definition", points: 3, description: "Correctly defines momentum and conservation" },
 *         { criterion: "Examples", points: 4, description: "Provides 2-3 relevant real-world examples" },
 *         { criterion: "Clarity", points: 3, description: "Clear and well-organized explanation" }
 *       ],
 *       maxPoints: 10,
 *       wordLimit: { min: 150, max: 400 },
 *       sampleAnswer: "Momentum is defined as mass times velocity...",
 *       difficulty: 'intermediate',
 *       topic: 'Momentum Conservation',
 *       tags: ['momentum', 'conservation-laws']
 *     }
 *   ],
 *   activityType: 'assignment',
 *   maxAttempts: 1,
 *   showRubric: true,
 *   showWordCount: true,
 *   theme: 'blue',
 *   randomizeQuestions: true
 * });
 * ```
 */

const { onCall } = require('firebase-functions/v2/https');
const { loadConfig } = require('../utilities/config-loader');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef, updateGradebookItem, getCourseConfig } = require('../utilities/database-utils');
const { storeSubmission, createLongAnswerSubmissionRecord } = require('../utilities/submission-storage');

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
    const unusedQuestions = availableQuestions.filter((q, index) => {
      const questionId = q.id || index.toString();
      return !usedQuestionIds.includes(questionId);
    });
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

  // Clone the question and add metadata
  const question = {
    ...selectedQuestion,
    originalIndex: originalIndex,
    selectedFrom: 'pool',
    generatedBy: 'standard'
  };

  // Apply default word limits if not specified in the question
  if (!question.wordLimit && config.wordLimits) {
    question.wordLimit = config.wordLimits;
  }

  // Ensure we have a word limit
  if (!question.wordLimit) {
    question.wordLimit = { min: 100, max: 500 };
  }

  return question;
}

/**
 * Infers activity type from assessment ID patterns
 * @param {string} assessmentId - The assessment identifier
 * @returns {string} The inferred activity type
 */
function inferActivityTypeFromAssessmentId(assessmentId) {
  if (!assessmentId) return 'assignment';
  
  const id = assessmentId.toLowerCase();
  
  if (id.includes('assignment') || id.includes('homework') || id.includes('hw')) {
    return 'assignment';
  } else if (id.includes('exam') || id.includes('test') || id.includes('final')) {
    return 'exam';
  } else if (id.includes('lab') || id.includes('laboratory') || id.includes('experiment')) {
    return 'lab';
  } else if (id.includes('lesson') || id.includes('practice')) {
    return 'lesson';
  } else {
    return 'assignment'; // Default for long answer
  }
}

/**
 * Core business logic for Standard Long Answer assessments
 * This can be called directly by other systems without Firebase wrapper
 */
class StandardLongAnswerCore {
  constructor(config = {}) {
    this.config = config;
  }

  async handleGenerate(params) {
    // Load and merge configurations
    const globalConfig = await loadConfig();
    
    // Use hardcoded activity type from config or infer from assessment ID
    const activityType = this.config.activityType || inferActivityTypeFromAssessmentId(params.assessmentId) || 'assignment';
    
    console.log(`Using activity type: ${activityType} (Source: ${this.config.activityType ? 'hardcoded' : 'inferred'})`);
    
    // Get activity-specific configuration
    const activityConfig = this.config.activityTypes?.[activityType] || this.config.activityTypes?.assignment || {};
    
    // Get long answer specific settings from activity config
    const longAnswerDefaults = activityConfig.longAnswer || {};
    
    const config = {
      ...globalConfig.questionTypes?.longAnswer?.standard || {},
      ...activityConfig,
      ...longAnswerDefaults,
      ...this.config
    };

    // Initialize course if needed
    await initializeCourseIfNeeded(params.studentKey, params.courseId, params.isStaff);

    // Reference to the assessment in the database
    const assessmentRef = getDatabaseRef('studentAssessment', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    console.log(`Database path: ${params.isStaff ? 'staff_testing' : 'students'}/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);

    // Check if this is a regeneration or a new assessment
    const existingAssessmentSnapshot = await assessmentRef.once('value');
    const existingAssessment = existingAssessmentSnapshot.val();
    const isRegeneration = !!existingAssessment;
    
    // Get used question IDs to avoid repetition
    let usedQuestionIds = [];
    if (existingAssessment?.usedQuestionIds) {
      usedQuestionIds = existingAssessment.usedQuestionIds;
    }
    
    // Initialize the attempts counter
    let currentAttempts = 0;
    if (existingAssessment) {
      currentAttempts = existingAssessment.attempts || 0;
    }
    
    console.log(`This is a ${isRegeneration ? 'regeneration' : 'new question'} request. Current attempts: ${currentAttempts}`);
    
    // Determine max attempts - default to 1 for long answer
    let maxAttempts = config.maxAttempts || activityConfig.maxAttempts || 1;
    
    console.log(`Max attempts allowed: ${maxAttempts}`);
    
    // Verify the student hasn't exceeded the max attempts
    if (isRegeneration && currentAttempts >= maxAttempts) {
      console.log(`Security check: Student has exceeded max attempts (${currentAttempts}/${maxAttempts})`);
      throw new Error(`Maximum attempts (${maxAttempts}) reached for this assessment.`);
    }
    
    // Select a question from the pool
    console.log(`Selecting standard long answer question, difficulty: ${params.difficulty}`);
    const question = selectQuestionFromPool(
      config,
      params.difficulty,
      usedQuestionIds
    );
    
    // Track this question as used
    const questionId = question.id || question.originalIndex?.toString() || '0';
    if (!usedQuestionIds.includes(questionId)) {
      usedQuestionIds.push(questionId);
    }
    
    // Create the final question data object to save
    const questionData = {
      timestamp: getServerTimestamp(),
      questionText: question.questionText,
      rubric: question.rubric,
      maxPoints: question.maxPoints,
      wordLimit: question.wordLimit,
      topic: question.topic || params.topic,
      subject: config.subject || 'Course Subject',
      difficulty: question.difficulty || params.difficulty || 'intermediate',
      generatedBy: 'standard',
      attempts: currentAttempts,
      status: 'active',
      maxAttempts: maxAttempts,
      activityType: activityType,
      usedQuestionIds: usedQuestionIds,
      enableManualGrading: config.enableManualGrading !== false,
      settings: {
        showRubric: config.showRubric !== false,
        showWordCount: config.showWordCount !== false,
        allowDifficultySelection: config.allowDifficultySelection || false,
        theme: config.theme || activityConfig.theme || 'purple',
      }
    };
    
    // Store public question data in the database (student-accessible)
    await assessmentRef.set(questionData);

    // Store the secure data separately (server-side only)
    const secureRef = getDatabaseRef('secureAssessment', params.courseId, params.assessmentId, params.studentKey);
    
    await secureRef.set({
      sampleAnswer: question.sampleAnswer || '',
      questionPool: config.questions?.map((q, idx) => ({ 
        id: q.id || idx.toString(), 
        topic: q.topic,
        difficulty: q.difficulty 
      })) || [],
      timestamp: getServerTimestamp()
    });

    return {
      success: true,
      questionGenerated: true,
      assessmentId: params.assessmentId,
      generatedBy: 'standard'
    };
  }

  async handleSave(params) {
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
    
    // Check max attempts
    const maxAttempts = assessmentData.maxAttempts || 1;
    const currentAttempts = assessmentData.attempts || 0;
    
    // For save operation, we don't increment attempts yet
    // Only increment on final submission
    if (currentAttempts >= maxAttempts && params.operation === 'submit') {
      console.log(`Security check: Student has exceeded max attempts (${currentAttempts}/${maxAttempts})`);
      return {
        success: false,
        error: 'Maximum attempts exceeded',
        attemptsRemaining: 0
      };
    }

    // Validate answer length
    const wordCount = params.answer.trim().split(/\s+/).filter(word => word.length > 0).length;
    const wordLimit = assessmentData.wordLimit || { min: 100, max: 500 };
    
    if (params.operation === 'submit') {
      // Only enforce word limits on final submission
      if (wordCount < (wordLimit.min || 0)) {
        throw new Error(`Answer too short. Minimum ${wordLimit.min} words required, you wrote ${wordCount} words.`);
      }
      
      if (wordCount > (wordLimit.max || 5000)) {
        throw new Error(`Answer too long. Maximum ${wordLimit.max} words allowed, you wrote ${wordCount} words.`);
      }
    }

    // Determine if this is a save or submit operation
    const isSubmit = params.operation === 'submit';
    
    // Increment attempts only on submit
    let updatedAttempts = currentAttempts;
    if (isSubmit) {
      updatedAttempts = currentAttempts + 1;
      console.log(`Incrementing attempts from ${currentAttempts} to ${updatedAttempts}`);
    }
    
    const attemptsRemaining = maxAttempts - updatedAttempts;

    // Create submission record for storage
    const submissionRecord = {
      assessmentId: params.assessmentId,
      courseId: params.courseId,
      studentKey: params.studentKey,
      studentEmail: params.studentEmail,
      userId: params.userId,
      timestamp: getServerTimestamp(),
      attemptNumber: isSubmit ? updatedAttempts : currentAttempts,
      answer: params.answer,
      wordCount: wordCount,
      questionData: {
        questionText: assessmentData.questionText,
        rubric: assessmentData.rubric,
        maxPoints: assessmentData.maxPoints,
        topic: assessmentData.topic,
        difficulty: assessmentData.difficulty
      },
      status: isSubmit ? 'submitted' : 'draft',
      requiresManualGrading: true
    };

    // Store detailed submission in Cloud Storage
    let submissionPath = null;
    try {
      submissionPath = await storeSubmission(submissionRecord);
    } catch (storageError) {
      console.warn(`⚠️ Failed to store submission in Cloud Storage: ${storageError.message}`);
      // Continue with assessment - storage failure shouldn't block student progress
    }

    // Update assessment data in the database
    const updates = {
      attempts: updatedAttempts,
      status: isSubmit ? 'submitted' : 'draft',
      lastSaved: getServerTimestamp(),
      lastSubmission: {
        timestamp: getServerTimestamp(),
        answer: params.answer.substring(0, 200) + (params.answer.length > 200 ? '...' : ''), // Truncated for database
        wordCount: wordCount,
        isSubmitted: isSubmit,
        submissionPath: submissionPath
      }
    };

    // Update the assessment
    await assessmentRef.update(updates);

    // If this is a final submission, update grade record (placeholder score)
    if (isSubmit) {
      const gradeRef = getDatabaseRef('studentGrade', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
      
      // For standard long answer, we store a placeholder indicating submission
      // Actual grade will be added by instructor
      await gradeRef.set({
        submitted: true,
        submittedAt: getServerTimestamp(),
        pendingGrading: true,
        maxPoints: assessmentData.maxPoints
      });

      // Update gradebook with submission status
      try {
        const courseConfig = await getCourseConfig(params.courseId);
        
        const { findCourseStructureItem } = require('../utilities/database-utils');
        const courseStructureItem = await findCourseStructureItem(params.courseId, params.assessmentId);
        
        const activityType = assessmentData.activityType || courseStructureItem?.type || 'assignment';
        
        const itemConfig = {
          title: courseStructureItem?.title || params.assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
          type: activityType,
          unitId: courseStructureItem?.unitId || 'unknown',
          courseStructureItemId: courseStructureItem?.itemId,
          pointsValue: assessmentData.maxPoints,
          maxScore: assessmentData.maxPoints,
          weight: courseStructureItem?.weight || 0,
          required: courseStructureItem?.required !== false,
          estimatedTime: courseStructureItem?.estimatedTime || 0,
          pendingGrading: true
        };

        // Update gradebook item with pending status
        await updateGradebookItem(params.studentKey, params.courseId, params.assessmentId, 0, itemConfig, params.isStaff);
        
        console.log(`✅ Gradebook updated with submission status for ${params.assessmentId}`);
      } catch (gradebookError) {
        console.warn(`⚠️ Failed to update gradebook for ${params.assessmentId}:`, gradebookError.message);
      }
    }

    return {
      success: true,
      saved: true,
      submitted: isSubmit,
      attemptsRemaining: attemptsRemaining,
      attemptsMade: updatedAttempts,
      wordCount: wordCount,
      requiresManualGrading: true,
      message: isSubmit ? 
        'Your answer has been submitted for grading.' : 
        'Your answer has been saved as a draft.'
    };
  }

  // Alias for backward compatibility
  async handleEvaluate(params) {
    // Standard long answer doesn't have automatic evaluation
    // This redirects to handleSave with submit operation
    return this.handleSave({ ...params, operation: 'submit' });
  }
}

/**
 * Factory function to create a Standard Long Answer assessment handler
 * @param {Object} courseConfig - Course-specific configuration
 * @returns {Function} Cloud function handler
 */
function createStandardLongAnswer(courseConfig = {}) {
  return onCall({
    region: courseConfig.region || 'us-central1',
    timeoutSeconds: courseConfig.timeout || 60,
    memory: courseConfig.memory || '512MiB',
    enforceAppCheck: false,
  }, async (request) => {
    const data = request.data;
    const context = request;
    
    // Extract and validate parameters
    const params = extractParameters(data, context);
    
    // Create core handler instance
    const coreHandler = new StandardLongAnswerCore(courseConfig);

    // Handle question generation operation
    if (params.operation === 'generate') {
      try {
        return await coreHandler.handleGenerate(params);
      } catch (error) {
        console.error("Error generating standard long answer question:", error);
        throw new Error('Error generating question: ' + error.message);
      }
    }
    // Handle answer save/submit operation
    else if (params.operation === 'save' || params.operation === 'submit' || params.operation === 'evaluate') {
      try {
        // Map evaluate to submit for backward compatibility
        if (params.operation === 'evaluate') {
          params.operation = 'submit';
        }
        return await coreHandler.handleSave(params);
      } catch (error) {
        console.error("Error saving answer:", error);
        throw new Error('Error saving answer: ' + error.message);
      }
    }

    // Invalid operation
    throw new Error('Invalid operation. Supported operations are "generate", "save", and "submit".');
  });
}

module.exports = {
  createStandardLongAnswer,
  StandardLongAnswerCore
};