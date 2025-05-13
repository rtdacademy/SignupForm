/**
 * Cloud functions for the Introduction to E-Learning lesson
 * This file contains all assessment functions for the lesson including:
 * 1. Multiple choice question about E-Learning benefits
 * 2. Dynamic math questions for practice
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('../../../utils.js');

//==============================================================================
// Shared Utilities
//==============================================================================

/**
 * Fetch assessment settings from the database, with a prioritized structure:
 * 1. Check course structure: /courses/{courseId}/courseDetails/courseStructure/structure/.../assessments/
 * 2. Fall back to assessment settings: /courses/{courseId}/assessmentSettings/
 * 3. Fall back to hardcoded default settings
 * 
 * @param {string} courseId - The course ID
 * @param {string} assessmentId - The assessment ID to find in the course structure
 * @param {string} questionType - The type of question (multipleChoice, dynamic, etc.)
 * @param {string} contentType - The type of content (lesson, assignment, exam)
 * @returns {Promise<Object>} The assessment settings
 */
async function getAssessmentSettings(courseId, assessmentId, questionType = null, contentType = 'lesson') {
  try {
    // For homework-style questions, always use these default settings
    const defaultSettings = {
      maxAttempts: 9999, // Using a very large number instead of Infinity (Firebase doesn't support Infinity)
      pointsValue: 1,
      showFeedback: true,
      randomizeOptions: true,
      showRegenerate: false
    };

    // For homework-style questions, don't bother querying the database
    // Just use our hardcoded settings directly

    console.log(`Using hardcoded homework-style settings for ${assessmentId}`);

    // Add a timestamp for when these settings were fetched
    const settings = {
      ...defaultSettings,
      fetchedAt: Date.now()
    };

    console.log(`Assessment settings for ${assessmentId} (${questionType} in ${contentType}):`, settings);
    return settings;
  } catch (error) {
    console.error("Error with assessment settings:", error);
    // Return default settings in case of an error
    return {
      maxAttempts: 9999, // Using a very large number instead of Infinity
      pointsValue: 1,
      showFeedback: true,
      randomizeOptions: true,
      showRegenerate: false
    };
  }
}

/**
 * Creates a simple seeded random number generator
 * @param {string} seed - The seed to use for random generation
 * @returns {function} A function that returns a deterministic random number between 0 and 1
 */
function createSeededRandom(seed) {
  // Simple seeded random function
  return function() {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
}

/**
 * Shuffles an array using the provided random number generator
 * @param {Array} array - The array to shuffle
 * @param {function} rng - Random number generator function
 * @returns {Array} The shuffled array
 */
function shuffleArray(array, rng) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Gets a safe server timestamp that works in both production and emulator environments
 * @returns {any} Server timestamp or Date.now() fallback
 */
function getServerTimestamp() {
  try {
    // Try to use ServerValue.TIMESTAMP if available
    if (admin.database && admin.database.ServerValue && admin.database.ServerValue.TIMESTAMP) {
      return admin.database.ServerValue.TIMESTAMP;
    } else {
      // Fall back to Date.now() if ServerValue is not available
      console.log("ServerValue.TIMESTAMP not available, using Date.now() instead");
      return Date.now();
    }
  } catch (error) {
    console.log("Error accessing ServerValue.TIMESTAMP, using Date.now() instead:", error);
    return Date.now();
  }
}

/**
 * Extracts and validates required parameters from the function call
 * @param {Object} data - The data object from the function call
 * @param {Object} context - The context object from the function call
 * @returns {Object} Extracted and validated parameters
 */
function extractParameters(data, context) {
  // Extract the data from the request correctly
  const {
    courseId,
    assessmentId,
    operation,
    answer,
    seed,
    questionType = 'addition',
    difficulty = 'beginner',
    studentEmail,
    userId,
    previousVariantIds = [],  // Add previousVariantIds parameter
  } = data.data || {};

  // Log the received data for debugging
  console.log("Data received by function:", data);

  // Only log simple authentication status - avoid stringifying the entire context
  const authStatus = context?.auth ? "Authenticated" : "Not authenticated";
  console.log("Function received context:", authStatus);

  // Get authentication info
  let finalStudentEmail = studentEmail;
  let finalUserId = userId;

  // If we have authentication context but no studentEmail in the data, use the auth email
  if (context?.auth?.token?.email && !finalStudentEmail) {
    finalStudentEmail = context.auth.token.email;
    console.log("Using email from auth context:", finalStudentEmail);
  }

  // If we have authentication context but no userId in the data, use the auth uid
  if (context?.auth?.uid && !finalUserId) {
    finalUserId = context.auth.uid;
    console.log("Using uid from auth context:", finalUserId);
  }

  // Log each important parameter individually for debugging
  console.log("Parameter - operation:", operation);
  console.log("Parameter - courseId:", courseId);
  console.log("Parameter - assessmentId:", assessmentId);
  console.log("Parameter - studentEmail:", finalStudentEmail);
  console.log("Parameter - userId:", finalUserId);

  if (questionType) {
    console.log("Parameter - questionType:", questionType);
  }

  if (difficulty) {
    console.log("Parameter - difficulty:", difficulty);
  }

  // Log previousVariantIds if present
  if (previousVariantIds && previousVariantIds.length > 0) {
    console.log("Parameter - previousVariantIds:", previousVariantIds);
  }

  // Check if required operation parameters are present
  if (!operation) {
    throw new Error("Missing required parameter: operation");
  }

  if (!courseId) {
    throw new Error("Missing required parameter: courseId");
  }

  if (!assessmentId) {
    throw new Error("Missing required parameter: assessmentId");
  }

  // Get the proper studentKey
  let studentKey;

  // Check if we're running in the emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  // Simplified approach that prioritizes studentEmail parameter over context.auth
  // This works better for emulator testing while still maintaining security in production
  if (finalStudentEmail) {
    studentKey = sanitizeEmail(finalStudentEmail);
    console.log(`Using provided student email: ${finalStudentEmail}, sanitized to: ${studentKey}`);
  } else if (context.auth && context.auth.token && context.auth.token.email) {
    const email = context.auth.token.email;
    studentKey = sanitizeEmail(email);
    console.log(`Using authenticated user email: ${email}`);
  } else {
    // Fallback for emulator or missing authentication - use test account
    console.log("Using test account - this should only happen in development");
    studentKey = "test-student";
  }

  return {
    courseId,
    assessmentId,
    operation,
    answer,
    seed: seed || Date.now(),
    questionType,
    difficulty,
    studentEmail: finalStudentEmail,
    userId: finalUserId,
    studentKey,
    isEmulator,
    previousVariantIds: Array.isArray(previousVariantIds) ? previousVariantIds : [] // Ensure it's an array
  };
}

/**
 * Initializes course structure for a student if it doesn't exist
 * @param {string} studentKey - The sanitized student email
 * @param {string} courseId - The course ID
 * @returns {Promise<void>}
 */
async function initializeCourseIfNeeded(studentKey, courseId) {
  // Make sure courseId is a string
  const safeCoursePath = String(courseId);

  // Check if the student's course path exists - if not, we might need to initialize it
  const courseRef = admin.database().ref(`students/${studentKey}/courses/${safeCoursePath}`);

  try {
    // Check if the course exists in the database for this student
    const courseSnapshot = await courseRef.once('value');
    if (!courseSnapshot.exists()) {
      // Initialize basic course structure if it doesn't exist
      console.log(`Initializing course structure for ${studentKey} in course ${safeCoursePath}`);
      await courseRef.set({
        Initialized: true,
        Assessments: {},
        Grades: {
          assessments: {}
        },
        timestamp: getServerTimestamp()
      });
    }
  } catch (error) {
    console.warn("Error checking/initializing course:", error);
    // Continue anyway - the assessment operation will create required paths
  }
}

//==============================================================================
// Multiple Choice Question Functions
//==============================================================================

// Question variants for the E-Learning questions
// Each variant has a different question, but similar difficulty level
const multipleChoiceQuestionVariants = [
  // Variant 1: Benefits of E-Learning
  {
    id: "benefits",
    questionText: "Which of the following is NOT typically considered a benefit of E-Learning?",
    options: [
      { id: "a", text: "Learning at your own pace" },
      { id: "b", text: "Access to educational resources from anywhere" },
      { id: "c", text: "Reduced need for self-discipline" },
      { id: "d", text: "Immediate feedback on assessments" }
    ],
    correctOptionId: "c",
    explanation: "E-Learning actually requires more self-discipline than traditional classroom learning since students must manage their own time and learning schedule without direct supervision."
  },
  // Variant 2: Challenges of E-Learning
  {
    id: "challenges",
    questionText: "Which of the following is a common challenge in E-Learning?",
    options: [
      { id: "a", text: "Having too much face-to-face interaction" },
      { id: "b", text: "Requiring strong self-discipline and time management" },
      { id: "c", text: "Limited access to learning materials" },
      { id: "d", text: "Inability to receive feedback on assessments" }
    ],
    correctOptionId: "b",
    explanation: "E-Learning requires strong self-discipline and time management skills since there is typically less external structure and immediate accountability than in traditional classroom settings."
  },
  // Variant 3: E-Learning Technologies
  {
    id: "technologies",
    questionText: "Which of the following is NOT typically a component of modern E-Learning platforms?",
    options: [
      { id: "a", text: "Discussion forums" },
      { id: "b", text: "Video lectures" },
      { id: "c", text: "Automatic attendance tracking via webcam" },
      { id: "d", text: "Interactive quizzes" }
    ],
    correctOptionId: "c",
    explanation: "While some platforms may have optional webcam features, automatic attendance tracking via webcam is not a standard component of most E-Learning platforms due to privacy concerns and technical limitations."
  },
  // Variant 4: E-Learning Effectiveness
  {
    id: "effectiveness",
    questionText: "According to research, which factor is MOST important for E-Learning success?",
    options: [
      { id: "a", text: "Having the latest technology devices" },
      { id: "b", text: "Student self-motivation and engagement" },
      { id: "c", text: "Frequent live video sessions" },
      { id: "d", text: "Complex multimedia presentations" }
    ],
    correctOptionId: "b",
    explanation: "Research consistently shows that student self-motivation and engagement are the strongest predictors of success in online learning environments, more important than technology, presentation style, or synchronous interaction."
  },
  // Variant 5: E-Learning History
  {
    id: "history",
    questionText: "Which statement about the history of E-Learning is FALSE?",
    options: [
      { id: "a", text: "E-Learning concepts existed before the internet" },
      { id: "b", text: "E-Learning began in the 21st century with smartphones" },
      { id: "c", text: "Distance education has roots in correspondence courses" },
      { id: "d", text: "Early computer-based training emerged in the 1960s" }
    ],
    correctOptionId: "b",
    explanation: "E-Learning predates smartphones and the 21st century. The concepts of distance education began with correspondence courses in the 19th century, and computer-based training emerged in the 1960s. The development of the internet in the 1990s greatly expanded E-Learning possibilities."
  }
];

/**
 * Selects a question variant based on the seed and ensures it's different from previous variants
 * @param {number} seed - Deterministic seed for selecting a variant
 * @param {string[]} previousVariantIds - Array of previously used variant IDs to avoid
 * @returns {Object} Selected question variant
 */
function selectQuestionVariant(seed, previousVariantIds = []) {
  // Create a deterministic random number generator based on the seed
  const rng = createSeededRandom(seed.toString());

  // Filter out previously used variants if possible
  const availableVariants = previousVariantIds.length < multipleChoiceQuestionVariants.length - 1 ?
    multipleChoiceQuestionVariants.filter(v => !previousVariantIds.includes(v.id)) :
    multipleChoiceQuestionVariants;

  // Select a random variant from available ones
  const variantIndex = Math.floor(rng() * availableVariants.length);
  return availableVariants[variantIndex];
}

/**
 * Generates a multiple choice question with randomized option order based on the seed
 * @param {number} seed - Deterministic seed for randomizing options
 * @param {string[]} previousVariantIds - Array of previously used variant IDs to avoid
 * @returns {Object} Generated question with options in random order but consistent for the same seed
 */
function generateMultipleChoiceQuestion(seed, previousVariantIds = []) {
  // Create a deterministic random number generator based on the seed
  const rng = createSeededRandom(seed.toString());

  // Select a question variant based on the seed, avoiding previously used variants if possible
  const selectedVariant = selectQuestionVariant(seed, previousVariantIds);

  // Shuffle options using the seeded random number generator
  const shuffledOptions = shuffleArray([...selectedVariant.options], rng);

  // Find the new position of the correct answer
  const correctOption = shuffledOptions.find(option => option.id === selectedVariant.correctOptionId);
  const newCorrectId = correctOption.id;

  // Log the variant selection process for debugging
  console.log(`Selected variant ID: ${selectedVariant.id}, Previously used variants: ${JSON.stringify(previousVariantIds)}`);

  return {
    questionText: selectedVariant.questionText,
    options: shuffledOptions,
    correctOptionId: newCorrectId,
    explanation: selectedVariant.explanation,
    seed: seed,
    variantId: selectedVariant.id // This is used to track which variants have been seen
  };
}

/**
 * Evaluates the student's answer to the multiple choice question
 * @param {Object} question - The question object with correctOptionId
 * @param {string} studentAnswer - The student's selected option ID
 * @returns {Object} Result of the evaluation
 */
function evaluateMultipleChoiceAnswer(question, studentAnswer) {
  const isCorrect = studentAnswer === question.correctOptionId;
  
  return {
    isCorrect,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    feedback: isCorrect ? 
      "Correct! E-Learning requires more self-discipline than traditional classroom learning." : 
      `Incorrect. ${question.explanation}`
  };
}

//==============================================================================
// Dynamic Math Question Functions
//==============================================================================

/**
 * Generates a dynamic addition problem with parameters based on the seed
 * @param {number} seed - Deterministic seed for generating parameters
 * @param {Object} options - Configuration options for question generation
 * @returns {Object} Generated question with parameters and solution
 */
function generateAdditionQuestion(seed, options = {}) {
  const difficulty = options.difficulty || 'beginner';
  const rng = createSeededRandom(seed.toString());
  
  // Generate parameters based on difficulty
  let num1, num2;
  
  switch(difficulty) {
    case 'beginner':
      num1 = Math.floor(rng() * 10) + 1;  // 1-10
      num2 = Math.floor(rng() * 10) + 1;  // 1-10
      break;
    case 'intermediate':
      num1 = Math.floor(rng() * 90) + 10; // 10-99
      num2 = Math.floor(rng() * 90) + 10; // 10-99
      break;
    case 'advanced':
      num1 = Math.floor(rng() * 900) + 100; // 100-999
      num2 = Math.floor(rng() * 900) + 100; // 100-999
      break;
    default:
      num1 = Math.floor(rng() * 10) + 1;  // 1-10
      num2 = Math.floor(rng() * 10) + 1;  // 1-10
  }
  
  // Calculate the correct answer
  const answer = num1 + num2;
  
  // Create the question text
  const questionText = `What is the sum of ${num1} and ${num2}?`;
  
  return {
    parameters: {
      num1,
      num2,
      difficulty
    },
    questionText,
    solution: answer,
    seed
  };
}

/**
 * Generates a dynamic multiplication problem with parameters based on the seed
 * @param {number} seed - Deterministic seed for generating parameters
 * @param {Object} options - Configuration options for question generation
 * @returns {Object} Generated question with parameters and solution
 */
function generateMultiplicationQuestion(seed, options = {}) {
  const difficulty = options.difficulty || 'beginner';
  const rng = createSeededRandom(seed.toString());
  
  // Generate parameters based on difficulty
  let num1, num2;
  
  switch(difficulty) {
    case 'beginner':
      num1 = Math.floor(rng() * 10) + 1;  // 1-10
      num2 = Math.floor(rng() * 10) + 1;  // 1-10
      break;
    case 'intermediate':
      num1 = Math.floor(rng() * 10) + 1;    // 1-10
      num2 = Math.floor(rng() * 90) + 10;   // 10-99
      break;
    case 'advanced':
      num1 = Math.floor(rng() * 90) + 10;   // 10-99
      num2 = Math.floor(rng() * 90) + 10;   // 10-99
      break;
    default:
      num1 = Math.floor(rng() * 10) + 1;  // 1-10
      num2 = Math.floor(rng() * 10) + 1;  // 1-10
  }
  
  // Calculate the correct answer
  const answer = num1 * num2;
  
  // Create the question text
  const questionText = `What is the product of ${num1} and ${num2}?`;
  
  return {
    parameters: {
      num1,
      num2,
      difficulty
    },
    questionText,
    solution: answer,
    seed
  };
}

/**
 * Evaluates the student's answer to a dynamic math question
 * @param {Object} question - The question object with solution
 * @param {any} studentAnswer - The student's submitted answer
 * @returns {Object} Result of the evaluation
 */
function evaluateDynamicAnswer(question, studentAnswer) {
  // Convert answer to number for comparison
  const numericAnswer = Number(studentAnswer);
  
  // Check if the answer is a valid number
  if (isNaN(numericAnswer)) {
    return {
      isCorrect: false,
      correctAnswer: question.solution,
      feedback: "Your answer must be a number."
    };
  }
  
  const isCorrect = numericAnswer === question.solution;
  
  return {
    isCorrect,
    correctAnswer: question.solution,
    feedback: isCorrect ? 
      `Correct! ${question.parameters.num1} ${question.questionType === 'addition' ? '+' : '×'} ${question.parameters.num2} = ${question.solution}` : 
      `Incorrect. The correct answer is ${question.solution}.`
  };
}

//==============================================================================
// Cloud Function Handlers
//==============================================================================

/**
 * Handler for the multiple choice question about E-Learning benefits
 */
exports.handleMultipleChoiceQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  // Don't enforce app check in emulator mode
  enforceAppCheck: false,
}, async (data, context) => {
  // Extract and validate parameters
  const params = extractParameters(data, context);

  // Initialize course if needed
  await initializeCourseIfNeeded(params.studentKey, params.courseId);

  // Reference to the assessment in the database
  const assessmentRef = admin.database()
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);
  console.log(`Database path: students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);

  // Handle question generation operation
  if (params.operation === 'generate') {
    try {
      // Get previously used variant IDs if they exist
      const previousVariantIds = params.previousVariantIds || [];
      console.log("Previous variant IDs:", previousVariantIds);

      // Generate a question, avoiding previously used variants if possible
      const question = generateMultipleChoiceQuestion(params.seed, previousVariantIds);

      // Get assessment settings from the database - use the assessmentId to find in course structure
      const settings = await getAssessmentSettings(params.courseId, params.assessmentId, 'multipleChoice', 'lesson');

      // Store question data in the database without the correct answer
      await assessmentRef.set({
        timestamp: getServerTimestamp(),
        questionText: question.questionText,
        options: question.options.map(opt => ({ id: opt.id, text: opt.text })), // Strip any additional data
        seed: params.seed,
        variantId: question.variantId, // Store the variant ID for tracking
        attempts: 0,
        status: 'active',
        maxAttempts: settings.maxAttempts || 3,
        pointsValue: settings.pointsValue || 1,
        settings: {
          randomizeOptions: settings.randomizeOptions !== false,
          showFeedback: settings.showFeedback !== false
        }
      });

      return {
        success: true,
        questionGenerated: true,
        assessmentId: params.assessmentId,
        variantId: question.variantId
      };
    } catch (error) {
      console.error("Error generating question:", error);
      throw new Error('Error generating question: ' + error.message);
    }
  }
  // Handle answer evaluation operation
  else if (params.operation === 'evaluate') {
    try {
      // Get the existing question data
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      // Check if the student has exceeded the max attempts
      if (assessmentData.attempts >= assessmentData.maxAttempts) {
        return {
          success: false,
          error: 'Maximum attempts exceeded',
          attemptsRemaining: 0
        };
      }

      // Get previously used variant IDs if they exist
      const previousVariantIds = params.previousVariantIds || [];

      // Regenerate the question with the stored seed to get the correct answer
      const regeneratedQuestion = generateMultipleChoiceQuestion(assessmentData.seed, previousVariantIds);

      // Evaluate the answer
      const result = evaluateMultipleChoiceAnswer(regeneratedQuestion, params.answer);

      // Increment the attempts counter
      const updatedAttempts = (assessmentData.attempts || 0) + 1;
      const attemptsRemaining = assessmentData.maxAttempts - updatedAttempts;

      // Prepare the submission record
      const submission = {
        timestamp: getServerTimestamp(),
        answer: params.answer,
        isCorrect: result.isCorrect,
        attemptNumber: updatedAttempts,
        variantId: assessmentData.variantId || regeneratedQuestion.variantId
      };

      // Check if this question was previously marked correct overall
      const wasCorrectOverall = assessmentData.correctOverall || false;

      // Update assessment data in the database
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
          correctOptionId: result.correctOptionId, // Include correct answer for feedback
        }
      };

      // Add submission to the history
      await assessmentRef.child('submissions').push(submission);

      // Update the assessment
      await assessmentRef.update(updates);

      // Update the grade if the answer is correct AND we haven't previously recorded a correct grade
      if (result.isCorrect && !wasCorrectOverall) {
        const gradeRef = admin.database()
          .ref(`students/${params.studentKey}/courses/${params.courseId}/Grades/assessments/${params.assessmentId}`);

        console.log(`Grade path: students/${params.studentKey}/courses/${params.courseId}/Grades/assessments/${params.assessmentId}`);

        // Calculate score based on the pointsValue from settings
        // Use the database-defined points value
        const pointsValue = assessmentData.pointsValue || 1;

        // For homework-style questions, don't penalize for attempts - full points for getting it correct
        const finalScore = pointsValue;

        await gradeRef.set(finalScore);
      }
      // If incorrect and student has attempts remaining, prepare data for potentially generating a new variant
      else if (!result.isCorrect && attemptsRemaining > 0) {
        // Add the current variant ID to result for tracking
        result.currentVariantId = assessmentData.variantId || regeneratedQuestion.variantId;

        // Track which variants have been seen for future reference
        if (result.currentVariantId && !previousVariantIds.includes(result.currentVariantId)) {
          result.previousVariantIds = [...previousVariantIds, result.currentVariantId];
        } else {
          result.previousVariantIds = previousVariantIds;
        }
      }

      return {
        success: true,
        result: result,
        attemptsRemaining: attemptsRemaining,
        attemptsMade: updatedAttempts
      };
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw new Error('Error evaluating answer: ' + error.message);
    }
  }

  // If the operation is neither generate nor evaluate
  throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
});

/**
 * Handler for dynamic math questions (addition and multiplication)
 */
exports.handleDynamicQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  // Don't enforce app check in emulator mode
  enforceAppCheck: false,
}, async (data, context) => {
  // Extract and validate parameters
  const params = extractParameters(data, context);
  
  // Initialize course if needed
  await initializeCourseIfNeeded(params.studentKey, params.courseId);
  
  // Reference to the assessment in the database
  const assessmentRef = admin.database()
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);
  console.log(`Database path: students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);
  
  // Handle question generation operation
  if (params.operation === 'generate') {
    try {
      // Get assessment settings from the database using the assessmentId
      const settings = await getAssessmentSettings(params.courseId, params.assessmentId, 'dynamic', 'lesson');
      
      // Get difficulty from course structure if available, otherwise use the parameter or default
      const difficulty = settings.difficulty || params.difficulty || 'beginner';
      
      // Generate the question based on type
      let question;
      if (params.questionType === 'multiplication') {
        question = generateMultiplicationQuestion(params.seed, { difficulty });
      } else {
        question = generateAdditionQuestion(params.seed, { difficulty });
      }
      
      // Add question type to the question object
      question.questionType = params.questionType;
      
      // Store question data in the database without the solution
      await assessmentRef.set({
        timestamp: getServerTimestamp(),
        questionText: question.questionText,
        parameters: question.parameters,
        questionType: params.questionType,
        seed: params.seed,
        attempts: 0,
        status: 'active',
        maxAttempts: settings.maxAttempts || 5,
        pointsValue: settings.pointsValue || 2,
        difficulty: difficulty,
        settings: {
          showRegenerate: settings.showRegenerate !== false,
          showFeedback: settings.showFeedback !== false
        }
      });
      
      return {
        success: true,
        questionGenerated: true,
        assessmentId: params.assessmentId,
        questionText: question.questionText
      };
    } catch (error) {
      console.error("Error generating dynamic question:", error);
      throw new Error('Error generating dynamic question: ' + error.message);
    }
  } 
  // Handle answer evaluation operation
  else if (params.operation === 'evaluate') {
    try {
      // Get the existing question data
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();
      
      if (!assessmentData) {
        throw new Error('Assessment not found');
      }
      
      // Check if the student has exceeded the max attempts
      if (assessmentData.attempts >= assessmentData.maxAttempts) {
        return {
          success: false,
          error: 'Maximum attempts exceeded',
          attemptsRemaining: 0
        };
      }
      
      // Regenerate the question with the stored seed to get the solution
      let regeneratedQuestion;
      if (assessmentData.questionType === 'multiplication') {
        regeneratedQuestion = generateMultiplicationQuestion(assessmentData.seed, { 
          difficulty: assessmentData.difficulty 
        });
      } else {
        regeneratedQuestion = generateAdditionQuestion(assessmentData.seed, { 
          difficulty: assessmentData.difficulty 
        });
      }
      
      // Add question type to the regenerated question
      regeneratedQuestion.questionType = assessmentData.questionType;
      
      // Evaluate the answer
      const result = evaluateDynamicAnswer(regeneratedQuestion, params.answer);
      
      // Increment the attempts counter
      const updatedAttempts = (assessmentData.attempts || 0) + 1;
      const attemptsRemaining = assessmentData.maxAttempts - updatedAttempts;
      
      // Prepare the submission record
      const submission = {
        timestamp: getServerTimestamp(),
        answer: params.answer,
        isCorrect: result.isCorrect,
        attemptNumber: updatedAttempts
      };
      
      // Update assessment data in the database
      const updates = {
        attempts: updatedAttempts,
        status: result.isCorrect ? 'completed' : (attemptsRemaining > 0 ? 'attempted' : 'failed'),
        lastSubmission: {
          timestamp: getServerTimestamp(),
          answer: params.answer,
          isCorrect: result.isCorrect,
          feedback: result.feedback
        }
      };
      
      // Add submission to the history
      await assessmentRef.child('submissions').push(submission);
      
      // Update the assessment
      await assessmentRef.update(updates);
      
      // Update the grade if the answer is correct
      if (result.isCorrect) {
        const gradeRef = admin.database()
          .ref(`students/${params.studentKey}/courses/${params.courseId}/Grades/assessments/${params.assessmentId}`);

        console.log(`Grade path: students/${params.studentKey}/courses/${params.courseId}/Grades/assessments/${params.assessmentId}`);

        // Calculate score based on the pointsValue from settings
        // Use the database-defined points value
        const basePointsValue = assessmentData.pointsValue || 2;
        
        // Apply difficulty multiplier if available
        let difficultyMultiplier = 1.0;
        try {
          // First, try to get the difficulty multiplier from the course structure settings for this specific assessment
          const courseStructurePath = `/courses/${params.courseId}/courseDetails/courseStructure/structure`;
          const courseStructureRef = admin.database().ref(courseStructurePath);
          const courseStructureSnapshot = await courseStructureRef.once('value');
          const courseStructure = courseStructureSnapshot.val();
          
          let assessmentConfig = null;
          
          // Search through the course structure for the assessment
          if (courseStructure && Array.isArray(courseStructure)) {
            for (const unit of courseStructure) {
              if (unit.items && Array.isArray(unit.items)) {
                for (const item of unit.items) {
                  if (item.assessments && Array.isArray(item.assessments)) {
                    const matchingAssessment = item.assessments.find(a => a.id === params.assessmentId);
                    if (matchingAssessment && matchingAssessment.parameters && matchingAssessment.parameters.difficulty) {
                      assessmentConfig = matchingAssessment;
                      break;
                    }
                  }
                }
                if (assessmentConfig) break;
              }
            }
          }
          
          // If found in course structure, use that difficulty multiplier
          if (assessmentConfig && assessmentConfig.parameters && assessmentConfig.parameters.difficultyMultiplier) {
            difficultyMultiplier = assessmentConfig.parameters.difficultyMultiplier;
          } else {
            // If not found in course structure, try from the assessmentSettings path
            const difficultySettingsRef = admin.database()
              .ref(`/courses/${params.courseId}/assessmentSettings/questionTypes/dynamic/difficulties/${assessmentData.difficulty}`);
            const difficultySnapshot = await difficultySettingsRef.once('value');
            const difficultySettings = difficultySnapshot.val();
            
            if (difficultySettings && difficultySettings.pointsMultiplier) {
              difficultyMultiplier = difficultySettings.pointsMultiplier;
            } else {
              // Apply default multipliers based on difficulty
              if (assessmentData.difficulty === 'intermediate') difficultyMultiplier = 1.5;
              if (assessmentData.difficulty === 'advanced') difficultyMultiplier = 2.0;
            }
          }
        } catch (error) {
          console.warn("Error getting difficulty multiplier:", error);
        }
        
        // Calculate final score with difficulty multiplier
        const finalScore = basePointsValue * difficultyMultiplier;
        
        await gradeRef.set(finalScore);
        
        // If they want to try again with a new problem and showRegenerate is enabled
        const showRegenerate = assessmentData.settings?.showRegenerate !== false && 
                              assessmentData.showRegenerate !== false;
                              
        if (attemptsRemaining > 0 && showRegenerate) {
          // Generate a new problem with a new seed
          const newSeed = Date.now();
          
          // Store new question for the next attempt
          const newQuestion = assessmentData.questionType === 'multiplication' 
            ? generateMultiplicationQuestion(newSeed, { difficulty: assessmentData.difficulty })
            : generateAdditionQuestion(newSeed, { difficulty: assessmentData.difficulty });
          
          // Update with new question
          await assessmentRef.update({
            questionText: newQuestion.questionText,
            parameters: newQuestion.parameters,
            seed: newSeed,
            attempts: 0, // Reset attempts for the new question
            status: 'active',
            newQuestionGenerated: true,
            timestamp: getServerTimestamp()
          });
          
          result.newQuestion = {
            questionText: newQuestion.questionText,
            generated: true
          };
        }
      }
      
      return {
        success: true,
        result: result,
        attemptsRemaining: attemptsRemaining,
        attemptsMade: updatedAttempts
      };
    } catch (error) {
      console.error("Error evaluating answer for dynamic question:", error);
      throw new Error('Error evaluating dynamic answer: ' + error.message);
    }
  }
  
  // If the operation is neither generate nor evaluate
  throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
});