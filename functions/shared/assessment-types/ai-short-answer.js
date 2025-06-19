/**
 * Reusable AI Short Answer Assessment Module
 * This module provides a factory function to create AI-powered short answer assessments
 * Course developers can import this and configure it with their specific prompts and settings
 * 
 * ARCHITECTURE:
 * =============
 * This backend module works in conjunction with the frontend component:
 * - Frontend: src/FirebaseCourses/components/assessments/AIShortAnswerQuestion/index.js
 * - Backend: This module creates cloud functions that the frontend calls
 * - Configuration: Set parameters in course-specific files like functions/courses/3/02-economic-environment-money/assessments.js
 * 
 * The frontend component automatically handles:
 * - Displaying questions with word limits
 * - Student answer submission with basic text input
 * - AI-powered evaluation and scoring (correct/incorrect)
 * - Brief feedback display
 * - AI chat integration with answer context
 * 
 * WORKFLOW:
 * =========
 * 1. Configure this module in your course assessment file
 * 2. Deploy the cloud function
 * 3. Frontend component calls your cloud function to generate questions
 * 4. Students write short answers (typically 20-100 words)
 * 5. AI evaluates answers for correctness
 * 6. Students receive immediate feedback
 * 
 * USAGE:
 * ======
 * 
 * ```javascript
 * const { createAIShortAnswer } = require('../../../shared/assessment-types/ai-short-answer');
 * 
 * exports.yourFunctionName = createAIShortAnswer({
 *   // Configuration object - see ACCEPTED PARAMETERS below
 * });
 * ```
 * 
 * ACCEPTED PARAMETERS:
 * ===================
 * 
 * Core Configuration:
 * - prompt: {string} - Single prompt for generating questions
 * OR
 * - prompts: {Object} - Legacy prompts object (backward compatibility)
 *   - beginner: {string} - Prompt for beginner-level questions
 *   - intermediate: {string} - Prompt for intermediate-level questions
 *   - advanced: {string} - Prompt for advanced-level questions
 * 
 * Answer Settings:
 * - expectedAnswers: {Array<string>} - List of acceptable answers
 * - keyWords: {Array<string>} - Key words that should appear in correct answers
 * - pointsValue: {number} - Points awarded for correct answer (default: 1)
 * 
 * Word Limits:
 * - wordLimits: {Object} - Word count constraints
 *   - min: {number} - Minimum words (default: 5)
 *   - max: {number} - Maximum words (default: 100)
 * 
 * Activity Settings:
 * - activityType: {string} - Type of activity ('lesson', 'assignment', 'exam', 'lab')
 * - maxAttempts: {number} - Maximum attempts allowed (default: from course config)
 * - showHints: {boolean} - Whether to enable hints (default: false)
 * - showWordCount: {boolean} - Whether to show word count (default: true)
 * - theme: {string} - Color theme ('blue', 'green', 'purple', 'amber')
 * - allowDifficultySelection: {boolean} - Allow students to select difficulty
 * 
 * AI Chat Settings:
 * - enableAIChat: {boolean} - Whether to show AI chat button for students
 * - aiChatContext: {string} - Additional context about the question to help AI tutors
 * 
 * AI Generation Settings:
 * - aiSettings: {Object} - AI generation parameters
 *   - temperature: {number} - AI creativity (0-1, default: 0.7)
 *   - topP: {number} - Nucleus sampling (0-1, default: 0.8)
 *   - topK: {number} - Top-K sampling (default: 40)
 * 
 * Content Settings:
 * - katexFormatting: {boolean} - Enable LaTeX math formatting (default: true)
 * - subject: {string} - Subject name for context
 * - gradeLevel: {number} - Grade level for context
 * - topic: {string} - Topic name for context
 * - learningObjectives: {Array<string>} - Learning objectives for context
 * 
 * Fallback Questions:
 * - fallbackQuestions: {Array<Object>} - Backup questions if AI generation fails
 *   Each fallback question should have:
 *   - questionText: {string}
 *   - expectedAnswer: {string}
 *   - sampleAnswer: {string}
 *   - acceptableAnswers: {Array<string>}
 *   - wordLimit: {Object} - {min, max}
 *   - difficulty: {string}
 * 
 * EXAMPLE USAGE:
 * ==============
 * 
 * ```javascript
 * // New single prompt format (recommended)
 * exports.course3_economics_shortAnswer = createAIShortAnswer({
 *   prompt: "Create a short answer question about inflation's impact on purchasing power...",
 *   pointsValue: 2,
 *   wordLimits: { min: 10, max: 50 },
 *   // ... other settings
 * });
 * 
 * // Legacy multi-difficulty format (still supported)
 * exports.course3_economics_shortAnswer_legacy = createAIShortAnswer({
 *   prompts: {
 *     beginner: "Create a beginner short answer question about inflation...",
 *     intermediate: "Create an intermediate short answer question...",
 *     advanced: "Create an advanced short answer question..."
 *   },
 *   activityType: 'lesson',
 *   pointsValue: 3,
 *   wordLimits: { min: 20, max: 80 },
 *   enableAIChat: true,
 *   aiChatContext: "This question tests understanding of economic concepts.",
 *   katexFormatting: false,
 *   maxAttempts: 3,
 *   theme: 'blue',
 *   subject: 'Financial Literacy',
 *   gradeLevel: 11,
 *   topic: 'Inflation and Economics',
 *   fallbackQuestions: [
 *     {
 *       questionText: "Explain how inflation affects your purchasing power.",
 *       expectedAnswer: "Inflation reduces purchasing power because prices increase faster than income",
 *       sampleAnswer: "Inflation reduces purchasing power because when prices rise faster than income, you can buy fewer goods and services with the same amount of money.",
 *       acceptableAnswers: ["reduces purchasing power", "decreases buying power", "prices rise faster than income"],
 *       wordLimit: { min: 20, max: 80 },
 *       difficulty: 'intermediate'
 *     }
 *   ]
 * });
 * ```
 */

const { onCall } = require('firebase-functions/v2/https');
const { z } = require('zod');
const { loadConfig } = require('../utilities/config-loader');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef, updateGradebookItem, getCourseConfig } = require('../utilities/database-utils');
const { storeSubmission, createShortAnswerSubmissionRecord } = require('../utilities/submission-storage');
const { 
  AIShortAnswerQuestionSchema, 
  AIShortAnswerEvaluationSchema,
  ShortAnswerFunctionParametersSchema 
} = require('../schemas/assessment-schemas');
const { applyPromptModules } = require('../prompt-modules');
const { initializeAI, getTaskSettings, isAPIKeyAvailable } = require('../../utils/aiModels');

// Initialize AI instance if we have an API key
let ai = null;
if (isAPIKeyAvailable()) {
  try {
    ai = initializeAI('gemini-2.0-flash');
    console.log("✅ AI initialized successfully for short answer assessments");
  } catch (error) {
    console.error("❌ Failed to initialize AI in short answer:", error);
  }
} else {
  console.log("GEMINI_API_KEY not found in environment - AI generation will use fallback questions");
}

/**
 * Uses Genkit with structured outputs to generate a short answer question
 * @param {Object} config - Configuration object with prompts and settings
 * @param {string} topic - The question topic
 * @param {string} difficulty - The difficulty level (beginner, intermediate, advanced)
 * @param {Array} fallbackQuestions - Course-specific fallback questions
 * @returns {Promise<Object>} Generated question with expected answer and sample answer
 */
async function generateAIShortAnswerQuestion(config, topic, difficulty = 'intermediate', fallbackQuestions = []) {
  try {
    // Check if API key is available
    if (!isAPIKeyAvailable()) {
      console.warn("No Gemini API key found. Using fallback question instead.");
      return getFallbackShortAnswerQuestion(difficulty, fallbackQuestions, config);
    }

    // Handle both new single prompt format and legacy multi-difficulty format
    let promptTemplate;

    if (config.prompt) {
      // New single prompt format - use the provided prompt
      promptTemplate = config.prompt;
      console.log("Using new single prompt format");
    } else if (config.prompts) {
      // Legacy multi-difficulty format
      const prompts = config.prompts || {};
      promptTemplate = prompts[difficulty] || prompts.intermediate || 
        `Create a short answer question about ${topic} at ${difficulty} level.`;
      console.log(`Using legacy multi-difficulty format for ${difficulty} level`);
    } else {
      // Neither format is properly configured
      console.error("Invalid configuration: Must provide either 'prompt' or 'prompts'");
      return getFallbackShortAnswerQuestion(difficulty, fallbackQuestions, config);
    }
    
    // Apply conditional prompt modules as system instructions
    const systemInstructions = applyPromptModules(config);
    
    const wordLimits = config.wordLimits || { min: 5, max: 100 };
    
    // Create clean prompt content focused on the task
    const promptText = `${promptTemplate}

    REQUIREMENTS:
    1. Create a question that can be answered in ${wordLimits.min}-${wordLimits.max} words
    2. The question should have a clear, factual answer that can be evaluated objectively
    3. Provide an expected answer that captures the key concepts
    4. Write a sample answer that demonstrates the expected response
    5. The question should test understanding, not just memorization
    6. IMPORTANT: Students will be required to write answers between ${wordLimits.min} and ${wordLimits.max} words
    
    Focus on creating questions where the correctness can be determined by checking for key concepts and accurate information.`;
    
    console.log("Generating AI short answer question with structured output using Genkit");
    
    try {
      // Get optimized settings for assessment generation
      const taskSettings = getTaskSettings('assessment');
      
      // Use Genkit's structured output with our Zod schema
      const generateOptions = {
        prompt: promptText,
        output: { 
          schema: AIShortAnswerQuestionSchema
        },
        config: {
          temperature: config.aiSettings?.temperature || taskSettings.temperature,
          topP: config.aiSettings?.topP || taskSettings.topP,
          topK: config.aiSettings?.topK || taskSettings.topK
        }
      };
      
      // Add system instructions if we have prompt modules enabled
      if (systemInstructions && systemInstructions.trim().length > 0) {
        generateOptions.system = systemInstructions;
      }
      
      const { output } = await ai.generate(generateOptions);
      
      if (output == null) {
        console.error("Genkit returned null output for AI short answer question generation");
        throw new Error("Response doesn't satisfy schema.");
      }
      
      // Enforce configured word limits
      output.wordLimit = wordLimits;
      
      console.log("Successfully generated AI short answer question:", 
        output.questionText.substring(0, 50) + "...");
      
      return {
        ...output,
        generatedBy: 'ai'
      };
      
    } catch (err) {
      console.error("Error with Genkit AI generation:", err.message);
      console.log("Falling back to predefined question due to AI generation error");
      return getFallbackShortAnswerQuestion(difficulty, fallbackQuestions, config);
    }
  } catch (error) {
    console.error("Error generating AI short answer question:", error);
    return getFallbackShortAnswerQuestion(difficulty, fallbackQuestions, config);
  }
}

/**
 * Gets a fallback short answer question from course-specific fallbacks or defaults
 * @param {string} difficulty - The difficulty level
 * @param {Array} fallbackQuestions - Course-specific fallback questions
 * @param {Object} config - Configuration object
 * @returns {Object} A fallback question
 */
function getFallbackShortAnswerQuestion(difficulty = 'intermediate', fallbackQuestions = [], config = {}) {
  // First try course-specific fallbacks
  const filteredFallbacks = fallbackQuestions.filter(q => q.difficulty === difficulty);
  const availableFallbacks = filteredFallbacks.length > 0 ? filteredFallbacks : 
    fallbackQuestions.filter(q => q.difficulty === 'intermediate');
  
  if (availableFallbacks.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableFallbacks.length);
    const selectedQuestion = availableFallbacks[randomIndex];
    
    return {
      ...selectedQuestion,
      generatedBy: 'fallback'
    };
  }
  
  // Default question if no fallbacks available
  const wordLimits = config.wordLimits || { min: 5, max: 100 };
  
  return {
    questionText: "This is a placeholder short answer question. Please provide course-specific fallback questions.",
    expectedAnswer: "This is a placeholder expected answer.",
    sampleAnswer: "This is a placeholder sample answer. Course developers should provide fallback questions with proper sample answers.",
    wordLimit: wordLimits,
    generatedBy: 'placeholder'
  };
}

/**
 * Uses Genkit to evaluate a student's short answer against the expected answer
 * @param {Object} question - The question object with expected answer
 * @param {string} studentAnswer - The student's answer
 * @param {string} expectedAnswer - The expected answer
 * @param {Object} evaluationGuidance - Course-specific evaluation guidance
 * @returns {Promise<Object>} Evaluation result with correctness and feedback
 */
async function evaluateAIShortAnswer(question, studentAnswer, expectedAnswer, evaluationGuidance = {}) {
  try {
    if (!isAPIKeyAvailable()) {
      console.warn("No Gemini API key found. Using fallback evaluation.");
      return getFallbackShortAnswerEvaluation(question, studentAnswer);
    }

    // Count words in student answer
    const wordCount = studentAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // Create evaluation prompt
    const evaluationPrompt = `Evaluate this student's short answer for correctness.

QUESTION: ${question.questionText}

EXPECTED ANSWER: ${expectedAnswer}

STUDENT ANSWER (${wordCount} words):
${studentAnswer}

EVALUATION CRITERIA:
- Award full points if the student demonstrates understanding of the key concepts
- Award partial credit if the answer is partially correct but missing important elements
- Award no points if the answer is incorrect or demonstrates misunderstanding
- Consider acceptable variations in wording as long as the meaning is correct
- Focus on accuracy of content, not perfect wording

SCORING:
- Be generous with partial credit for answers that show understanding
- Look for the key concepts from the expected answer
- Consider synonyms and alternative phrasings as correct
- Award points even if the writing style differs from the expected answer

Provide specific feedback explaining why the answer is correct, partially correct, or incorrect.
Keep feedback under 300 characters and be encouraging while being instructive.`;

    // Build system instructions with course-specific guidance
    let systemInstructions = `You are an expert ${question.subject || 'subject'} teacher evaluating student work on ${question.topic || 'the topic'}.
Focus on understanding rather than exact wording.
Be fair and generous while maintaining academic standards.
Look for evidence of comprehension even if the expression is imperfect.`;
    
    // Add common mistakes to watch for
    if (evaluationGuidance.commonMistakes && evaluationGuidance.commonMistakes.length > 0) {
      systemInstructions += `\n\nCommon student mistakes to watch for:\n${evaluationGuidance.commonMistakes.map(m => `- ${m}`).join('\n')}`;
    }
    
    // Add difficulty-specific scoring notes
    if (evaluationGuidance.scoringNotes && question.difficulty && evaluationGuidance.scoringNotes[question.difficulty]) {
      systemInstructions += `\n\nScoring guidance for ${question.difficulty} level: ${evaluationGuidance.scoringNotes[question.difficulty]}`;
    }
    
    // Add scoring reminder if present
    if (evaluationGuidance.scoringReminder) {
      systemInstructions += `\n\n${evaluationGuidance.scoringReminder}`;
    }
    
    systemInstructions += `\n${applyPromptModules({ katexFormatting: true })}`;

    console.log("Evaluating student short answer with AI");

    // Get optimized settings for evaluation (very deterministic)
    const evaluationSettings = getTaskSettings('evaluation');

    // Use Genkit's structured output for evaluation
    const { output } = await ai.generate({
      prompt: evaluationPrompt,
      system: systemInstructions,
      output: { 
        schema: AIShortAnswerEvaluationSchema
      },
      config: evaluationSettings
    });

    if (!output) {
      throw new Error("AI evaluation returned no output");
    }

    // Ensure maxScore matches the question's point value
    const maxScore = question.maxPoints || 1;
    output.maxScore = maxScore;
    
    // Cap score if it exceeds maximum
    if (output.score > maxScore) {
      console.warn(`Score (${output.score}) exceeds max points (${maxScore}). Capping to maximum.`);
      output.score = maxScore;
    }

    // Calculate percentage
    output.percentage = Math.round((output.score / maxScore) * 100);

    console.log(`AI evaluation complete: ${output.score}/${maxScore} (${output.percentage}%) - ${output.isCorrect ? 'Correct' : 'Incorrect'}`);

    return output;

  } catch (error) {
    console.error("Error evaluating short answer with AI:", error);
    console.error("Error details:", error.message);
    
    return getFallbackShortAnswerEvaluation(question, studentAnswer);
  }
}

/**
 * Provides a simple fallback evaluation when AI is unavailable
 * @param {Object} question - The question object
 * @param {string} studentAnswer - The student's answer
 * @returns {Object} Basic evaluation result
 */
function getFallbackShortAnswerEvaluation(question, studentAnswer) {
  const wordCount = studentAnswer.trim().split(/\s+/).filter(word => word.length > 0).length;
  const hasAnswer = wordCount >= (question.wordLimit?.min || 5);
  const meetsMaxLength = wordCount <= (question.wordLimit?.max || 1000);
  
  // Simple scoring based on word count
  let score = 0;
  let isCorrect = false;
  const maxScore = question.maxPoints || 1;
  
  if (hasAnswer && meetsMaxLength) {
    score = Math.floor(maxScore * 0.5); // Give 50% credit for attempting
    isCorrect = false; // Can't determine correctness without AI
  }
  
  // Create informative fallback feedback
  let feedback = "Your answer has been recorded. ";
  if (!hasAnswer) {
    feedback = `Your answer is below the minimum word count (${wordCount}/${question.wordLimit?.min || 5} words). `;
  } else if (!meetsMaxLength) {
    feedback = `Your answer exceeds the maximum word count (${wordCount}/${question.wordLimit?.max || 100} words). `;
  }
  feedback += "AI evaluation is temporarily unavailable. Your instructor will review your submission.";
  
  return {
    isCorrect: isCorrect,
    score: score,
    maxScore: maxScore,
    percentage: Math.round((score / maxScore) * 100),
    feedback: feedback,
    keyPointsFound: [],
    keyPointsMissing: []
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
  } else if (id.includes('lesson') || id.includes('practice')) {
    return 'lesson';
  } else {
    return 'lesson'; // Default for short answer (more practice-oriented)
  }
}

/**
 * Core business logic for AI Short Answer assessments
 * This can be called directly by other systems without Firebase wrapper
 */
class AIShortAnswerCore {
  constructor(config = {}) {
    this.config = config;
  }

  async handleGenerate(params) {
    // Load and merge configurations
    const globalConfig = await loadConfig();
    
    // SECURITY: Use hardcoded activity type from course config
    const activityType = this.config.activityType || inferActivityTypeFromAssessmentId(params.assessmentId) || 'lesson';
    
    console.log(`Using activity type: ${activityType} (Source: ${this.config.activityType ? 'hardcoded' : 'inferred'})`);
    
    // Get activity-specific configuration
    const activityConfig = this.config.activityTypes?.[activityType] || this.config.activityTypes?.lesson || {};
    
    // Get short answer specific settings from activity config
    const shortAnswerDefaults = activityConfig.shortAnswer || {};
    
    const config = {
      ...globalConfig.questionTypes?.shortAnswer?.ai_generated || {},
      ...activityConfig,
      ...shortAnswerDefaults, // Apply short answer defaults from course config
      ...this.config // Allow courseConfig to override if needed
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
    
    // Initialize the attempts counter
    let currentAttempts = 0;
    if (existingAssessment) {
      currentAttempts = existingAssessment.attempts || 0;
    }
    
    console.log(`This is a ${isRegeneration ? 'regeneration' : 'new question'} request. Current attempts: ${currentAttempts}`);
    
    // Determine max attempts - typically higher for short answer practice
    let maxAttempts = config.maxAttempts || activityConfig.maxAttempts || 5; // Default 5 for short answer
    
    console.log(`Max attempts allowed: ${maxAttempts}`);
    
    // Verify the student hasn't exceeded the max attempts
    if (isRegeneration && currentAttempts >= maxAttempts) {
      console.log(`Security check: Student has exceeded max attempts (${currentAttempts}/${maxAttempts})`);
      throw new Error(`Maximum attempts (${maxAttempts}) reached for this assessment.`);
    }
    
    // Generate the AI short answer question
    console.log(`Generating AI short answer question on topic: ${params.topic}, difficulty: ${params.difficulty}`);
    const question = await generateAIShortAnswerQuestion(
      config,
      params.topic,
      params.difficulty,
      this.config.fallbackQuestions || []
    );
    
    // Create the final question data object to save
    const questionData = {
      timestamp: getServerTimestamp(),
      questionText: question.questionText,
      expectedAnswer: question.expectedAnswer,
      maxPoints: config.pointsValue || 1,
      wordLimit: question.wordLimit || config.wordLimits || { min: 5, max: 100 },
      topic: params.topic,
      subject: config.subject || 'General',
      difficulty: params.difficulty,
      generatedBy: question.generatedBy || 'ai',
      attempts: currentAttempts,
      status: 'active',
      maxAttempts: maxAttempts,
      activityType: activityType,
      settings: {
        showHints: config.showHints === true || activityConfig.enableHints === true,
        showWordCount: config.showWordCount !== undefined ? config.showWordCount : (shortAnswerDefaults.showWordCount !== undefined ? shortAnswerDefaults.showWordCount : true),
        allowDifficultySelection: config.allowDifficultySelection || activityConfig.allowDifficultySelection || false,
        theme: config.theme || activityConfig.theme || 'blue',
      }
    };

    // Only add AI chat properties if AI chat is enabled
    if (config.enableAIChat === true) {
      questionData.enableAIChat = true;
      if (config.aiChatContext) {
        questionData.aiChatContext = config.aiChatContext;
      }
    }
    
    // Store public question data in the database (student-accessible)
    await assessmentRef.set(questionData);

    // Store the secure data separately (server-side only)
    const secureRef = getDatabaseRef('secureAssessment', params.courseId, params.assessmentId, params.studentKey);
    
    await secureRef.set({
      expectedAnswer: question.expectedAnswer,
      sampleAnswer: question.sampleAnswer,
      acceptableAnswers: question.acceptableAnswers || [],
      hints: question.hints || [],
      timestamp: getServerTimestamp()
    });

    return {
      success: true,
      questionGenerated: true,
      assessmentId: params.assessmentId,
      generatedBy: question.generatedBy
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
    
    // Check max attempts - but allow the current attempt to be evaluated
    const maxAttempts = assessmentData.maxAttempts || 5;
    const currentAttempts = assessmentData.attempts || 0;
    
    // Only reject if they've ALREADY submitted the maximum number of times
    if (currentAttempts > maxAttempts) {
      console.log(`Security check: Student has exceeded max attempts (${currentAttempts}/${maxAttempts})`);
      return {
        success: false,
        error: 'Maximum attempts exceeded',
        attemptsRemaining: 0
      };
    }
    
    console.log(`Processing attempt ${currentAttempts + 1} of ${maxAttempts}`);

    // Get the secure data
    const secureRef = getDatabaseRef('secureAssessment', params.courseId, params.assessmentId, params.studentKey);
    const secureSnapshot = await secureRef.once('value');
    const secureData = secureSnapshot.val();

    if (!secureData || !secureData.expectedAnswer) {
      throw new Error('Secure assessment data not found');
    }

    // Validate answer length
    const wordCount = params.answer.trim().split(/\s+/).filter(word => word.length > 0).length;
    const wordLimit = assessmentData.wordLimit || { min: 5, max: 100 };
    
    if (wordCount < (wordLimit.min || 0)) {
      throw new Error(`Answer too short. Minimum ${wordLimit.min} words required, you wrote ${wordCount} words.`);
    }
    
    if (wordCount > (wordLimit.max || 1000)) {
      throw new Error(`Answer too long. Maximum ${wordLimit.max} words allowed, you wrote ${wordCount} words.`);
    }

    // Evaluate the answer using AI with course-specific guidance
    const evaluation = await evaluateAIShortAnswer(
      assessmentData,
      params.answer,
      secureData.expectedAnswer,
      this.config.evaluationGuidance || {}
    );

    // Increment attempts
    let updatedAttempts = currentAttempts + 1;
    console.log(`Incrementing attempts from ${currentAttempts} to ${updatedAttempts}`);
    
    const attemptsRemaining = maxAttempts - updatedAttempts;

    // Create comprehensive submission record for Cloud Storage
    const submissionRecord = createShortAnswerSubmissionRecord(
      params,
      assessmentData,
      evaluation,
      updatedAttempts,
      wordCount
    );

    // Store detailed submission in Cloud Storage
    let submissionPath = null;
    try {
      submissionPath = await storeSubmission(submissionRecord);
    } catch (storageError) {
      console.warn(`⚠️ Failed to store submission in Cloud Storage: ${storageError.message}`);
      // Continue with assessment - storage failure shouldn't block student progress
    }

    // Update assessment data in the database (minimal data, just tracking)
    const updates = {
      attempts: updatedAttempts,
      status: evaluation.isCorrect ? 'completed' : (attemptsRemaining > 0 ? 'attempted' : 'failed'),
      lastSubmission: {
        timestamp: getServerTimestamp(),
        answer: params.answer.substring(0, 200) + (params.answer.length > 200 ? '...' : ''), // Truncated for database
        wordCount: wordCount,
        isCorrect: evaluation.isCorrect,
        score: evaluation.score,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        submissionPath: submissionPath // Reference to Cloud Storage file
      }
    };

    // Update the assessment
    await assessmentRef.update(updates);

    // Always update grade record using best score policy
    const gradeRef = getDatabaseRef('studentGrade', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    
    // Get existing grade to implement "best score" policy
    const existingGradeSnapshot = await gradeRef.once('value');
    const existingGrade = existingGradeSnapshot.val();
    
    // Calculate current attempt score
    const currentScore = evaluation.score;
    const maxPossible = evaluation.maxScore;
    
    // Determine if we should update the grade record
    let shouldUpdateGrade = false;
    let finalScore = currentScore;
    
    if (existingGrade === null || existingGrade === undefined) {
      // First attempt - always save (even if 0)
      shouldUpdateGrade = true;
      console.log(`First attempt: saving grade ${currentScore}/${maxPossible}`);
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
          pointsValue: assessmentData.maxPoints || evaluation.maxScore,
          maxScore: assessmentData.maxPoints || evaluation.maxScore,
          weight: courseStructureItem?.weight || 0,
          required: courseStructureItem?.required !== false,
          estimatedTime: courseStructureItem?.estimatedTime || 0
        };

        // Update gradebook item
        await updateGradebookItem(params.studentKey, params.courseId, params.assessmentId, finalScore, itemConfig, params.isStaff);
        
        console.log(`✅ Gradebook updated for short answer assessment ${params.assessmentId} with score ${finalScore} (Course Structure Item: ${courseStructureItem?.itemId || 'unknown'})`);
      } catch (gradebookError) {
        console.warn(`⚠️ Failed to update gradebook for ${params.assessmentId}:`, gradebookError.message);
        // Don't throw error - gradebook failure shouldn't block assessment completion
      }
    } else {
      console.log(`📊 Grade not updated (no improvement), but gradebook already reflects best score: ${finalScore}`);
    }

    // Clean up secure data if assessment is completed or all attempts exhausted
    const isCompleted = evaluation.isCorrect; // Short answer considers any correct answer as completed
    if (isCompleted || attemptsRemaining <= 0) {
      try {
        await secureRef.remove();
        console.log(`🗑️ Cleaned up secure assessment data for ${isCompleted ? 'completed' : 'failed'} short answer assessment: ${params.assessmentId}`);
      } catch (cleanupError) {
        console.warn(`⚠️ Failed to cleanup secure data for ${params.assessmentId}:`, cleanupError.message);
        // Don't throw error - cleanup failure shouldn't affect the assessment result
      }
    }

    return {
      success: true,
      result: evaluation,
      attemptsRemaining: attemptsRemaining,
      attemptsMade: updatedAttempts
    };
  }
}

/**
 * Factory function to create an AI Short Answer assessment handler
 * @param {Object} courseConfig - Course-specific configuration
 * @returns {Function} Cloud function handler
 */
function createAIShortAnswer(courseConfig = {}) {
  return onCall({
    region: courseConfig.region || 'us-central1',
    timeoutSeconds: courseConfig.timeout || 90, // Shorter timeout than long answer
    memory: courseConfig.memory || '512MiB', // Less memory needed
    enforceAppCheck: false,
  }, async (request) => {
    const data = request.data;
    const context = request;
    // Extract and validate parameters
    const params = extractParameters(data, context);
    
    // Create core handler instance
    const coreHandler = new AIShortAnswerCore(courseConfig);

    // Handle question generation operation
    if (params.operation === 'generate') {
      try {
        return await coreHandler.handleGenerate(params);
      } catch (error) {
        console.error("Error generating AI short answer question:", error);
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

    // Invalid operation
    throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
  });
}

module.exports = {
  createAIShortAnswer,
  AIShortAnswerCore
};