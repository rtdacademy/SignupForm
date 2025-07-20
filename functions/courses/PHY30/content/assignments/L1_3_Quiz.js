/**
 * Cloud Functions for L1-3 Quiz Assignment - PHY30
 * Handles physics fundamentals questions including kinematics and forces
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getServerTimestamp, getAssessmentSettings } = require('../../../../utils');
const { sanitizeEmail } = require('../../../../utils/sanitizeEmail');

//==============================================================================
// Multiple Choice Question Functions
//==============================================================================

/**
 * Generate physics fundamentals multiple choice question variants
 * @param {number} seed - Deterministic seed for randomization
 * @param {Array} previousVariantIds - Previously used variants to avoid
 * @returns {Object} Generated question object
 */
function generatePhysicsMultipleChoice(seed, previousVariantIds = []) {
  // Question variants focusing on physics fundamentals
  const questionVariants = [
    {
      id: 'physics_nature_1',
      questionText: 'What is the primary purpose of physics as a science?',
      options: [
        { id: 'a', text: 'To memorize formulas and equations', feedback: 'Incorrect. While formulas are important tools, they are not the primary purpose of physics.' },
        { id: 'b', text: 'To understand and describe the fundamental laws governing natural phenomena', feedback: 'Correct! Physics seeks to understand the fundamental principles that govern how the universe works.' },
        { id: 'c', text: 'To build advanced technology only', feedback: 'Incorrect. While physics enables technology, its primary purpose is broader understanding.' },
        { id: 'd', text: 'To solve mathematical problems', feedback: 'Incorrect. Mathematics is a tool used in physics, but understanding nature is the main goal.' }
      ],
      correctOptionId: 'b',
      explanation: 'Physics is the fundamental science that seeks to understand how the universe works, from the smallest particles to the largest structures.',
      topic: 'nature_of_physics'
    },
    {
      id: 'kinematics_basic_1',
      questionText: 'A car travels 100 meters in 20 seconds at constant velocity. What is its velocity?',
      options: [
        { id: 'a', text: '2000 m/s', feedback: 'Incorrect. Check your calculation: velocity = distance ÷ time.' },
        { id: 'b', text: '5 m/s', feedback: 'Correct! Velocity = distance ÷ time = 100 m ÷ 20 s = 5 m/s.' },
        { id: 'c', text: '120 m/s', feedback: 'Incorrect. You may have added distance and time instead of dividing.' },
        { id: 'd', text: '80 m/s', feedback: 'Incorrect. You may have subtracted time from distance.' }
      ],
      correctOptionId: 'b',
      explanation: 'Velocity is calculated by dividing the displacement by the time taken: v = Δx/Δt',
      topic: 'kinematics_basic'
    },
    {
      id: 'forces_newton1_1',
      questionText: 'According to Newton\'s First Law, an object at rest will:',
      options: [
        { id: 'a', text: 'Always start moving eventually', feedback: 'Incorrect. Objects at rest tend to stay at rest unless acted upon by a force.' },
        { id: 'b', text: 'Remain at rest unless acted upon by an unbalanced force', feedback: 'Correct! This is the law of inertia - objects resist changes in their state of motion.' },
        { id: 'c', text: 'Accelerate slowly on its own', feedback: 'Incorrect. Objects do not accelerate without a net force acting on them.' },
        { id: 'd', text: 'Move in a circle', feedback: 'Incorrect. Circular motion requires a centripetal force.' }
      ],
      correctOptionId: 'b',
      explanation: 'Newton\'s First Law states that objects at rest stay at rest, and objects in motion stay in motion with the same speed and in the same direction, unless acted upon by an unbalanced force.',
      topic: 'newtons_laws'
    }
  ];

  // Use seed to select and randomize question
  const random = new (require('seedrandom'))(seed);
  
  // Filter out previously used variants
  const availableVariants = questionVariants.filter(q => !previousVariantIds.includes(q.id));
  const variantsToUse = availableVariants.length > 0 ? availableVariants : questionVariants;
  
  // Select variant
  const selectedVariant = variantsToUse[Math.floor(random() * variantsToUse.length)];
  
  // Randomize option order using Fisher-Yates shuffle
  const shuffledOptions = [...selectedVariant.options];
  for (let i = shuffledOptions.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
  }

  return {
    ...selectedVariant,
    options: shuffledOptions,
    variantId: selectedVariant.id,
    timestamp: Date.now()
  };
}

/**
 * Evaluate multiple choice answer
 * @param {Object} question - The question object
 * @param {string} studentAnswer - Student's selected option ID
 * @returns {Object} Evaluation result
 */
function evaluatePhysicsMultipleChoice(question, studentAnswer) {
  const isCorrect = studentAnswer === question.correctOptionId;
  const selectedOption = question.options.find(opt => opt.id === studentAnswer);
  
  return {
    isCorrect,
    correctOptionId: question.correctOptionId,
    explanation: question.explanation,
    feedback: selectedOption ? selectedOption.feedback : 'Please select an answer.'
  };
}

//==============================================================================
// Dynamic Question Functions  
//==============================================================================

/**
 * Generate physics calculation problems
 * @param {number} seed - Deterministic seed for randomization
 * @param {Object} options - Generation options
 * @returns {Object} Generated physics problem
 */
function generatePhysicsCalculation(seed, options = {}) {
  const { difficulty = 'intermediate' } = options;
  const random = new (require('seedrandom'))(seed);
  
  // Problem types based on difficulty
  const problemTypes = {
    beginner: ['velocity_basic', 'distance_time'],
    intermediate: ['acceleration', 'force_basic'],
    advanced: ['projectile_basic', 'energy_basic']
  };
  
  const availableTypes = problemTypes[difficulty] || problemTypes.intermediate;
  const problemType = availableTypes[Math.floor(random() * availableTypes.length)];
  
  let problem;
  
  switch (problemType) {
    case 'velocity_basic':
      const distance = Math.floor(random() * 200 + 50); // 50-250m
      const time = Math.floor(random() * 20 + 5); // 5-25s
      problem = {
        questionText: `A cyclist travels ${distance} meters in ${time} seconds at constant velocity. Calculate the velocity in m/s. (Round to 1 decimal place)`,
        parameters: { distance, time },
        solution: Math.round((distance / time) * 10) / 10,
        units: 'm/s',
        tolerance: 0.1
      };
      break;
      
    case 'acceleration':
      const initialVel = Math.floor(random() * 20); // 0-20 m/s
      const finalVel = Math.floor(random() * 30 + initialVel + 5); // higher than initial
      const timeAccel = Math.floor(random() * 10 + 2); // 2-12s
      const acceleration = Math.round(((finalVel - initialVel) / timeAccel) * 10) / 10;
      problem = {
        questionText: `A car accelerates from ${initialVel} m/s to ${finalVel} m/s in ${timeAccel} seconds. Calculate the acceleration in m/s². (Round to 1 decimal place)`,
        parameters: { initialVel, finalVel, timeAccel },
        solution: acceleration,
        units: 'm/s²',
        tolerance: 0.1
      };
      break;
      
    case 'force_basic':
      const mass = Math.floor(random() * 50 + 10); // 10-60 kg
      const accel = Math.floor(random() * 8 + 2); // 2-10 m/s²
      const force = mass * accel;
      problem = {
        questionText: `Calculate the net force required to accelerate a ${mass} kg object at ${accel} m/s². Use Newton's Second Law (F = ma).`,
        parameters: { mass, accel },
        solution: force,
        units: 'N',
        tolerance: 0.5
      };
      break;
      
    default:
      // Default to velocity calculation
      const dist = 100;
      const t = 20;
      problem = {
        questionText: `Calculate the velocity of an object that travels ${dist} meters in ${t} seconds.`,
        parameters: { distance: dist, time: t },
        solution: dist / t,
        units: 'm/s',
        tolerance: 0.1
      };
  }
  
  return {
    ...problem,
    problemType,
    difficulty,
    timestamp: Date.now()
  };
}

/**
 * Evaluate dynamic physics answer
 * @param {Object} question - The question object with solution
 * @param {any} studentAnswer - Student's numerical answer
 * @returns {Object} Evaluation result
 */
function evaluatePhysicsCalculation(question, studentAnswer) {
  const numericAnswer = Number(studentAnswer);
  
  if (isNaN(numericAnswer)) {
    return {
      isCorrect: false,
      correctAnswer: question.solution,
      feedback: 'Your answer must be a number.'
    };
  }
  
  const isCorrect = Math.abs(numericAnswer - question.solution) <= (question.tolerance || 0.1);
  
  return {
    isCorrect,
    correctAnswer: `${question.solution} ${question.units}`,
    feedback: isCorrect 
      ? `Correct! The answer is ${question.solution} ${question.units}.`
      : `Incorrect. The correct answer is ${question.solution} ${question.units}. Check your calculation and try again.`
  };
}

//==============================================================================
// Parameter Extraction and Validation
//==============================================================================

/**
 * Extract and validate parameters from the cloud function call
 */
function extractParameters(data, context) {
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  const userId = context.auth.uid;
  const studentEmail = context.auth.token.email || data.studentEmail;
  
  if (!studentEmail) {
    throw new Error('Student email is required');
  }

  const studentKey = sanitizeEmail(studentEmail);
  
  const requiredParams = ['courseId', 'assessmentId', 'operation'];
  for (const param of requiredParams) {
    if (!data[param]) {
      throw new Error(`Missing required parameter: ${param}`);
    }
  }

  return {
    ...data,
    userId,
    studentEmail,
    studentKey
  };
}

//==============================================================================
// Multiple Choice Handler
//==============================================================================

exports.handleMultipleChoiceQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  enforceAppCheck: false,
}, async (data, context) => {
  const params = extractParameters(data, context);
  
  const assessmentRef = admin.database()
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);

  if (params.operation === 'generate') {
    try {
      const assessmentSnapshot = await assessmentRef.once('value');
      const existingData = assessmentSnapshot.val();
      
      // Get assessment settings
      const settings = await getAssessmentSettings(params.courseId, 'multipleChoice', 'assignments');
      
      const previousVariantIds = existingData?.previousVariantIds || [];
      const question = generatePhysicsMultipleChoice(Date.now(), previousVariantIds);
      
      await assessmentRef.set({
        timestamp: getServerTimestamp(),
        questionText: question.questionText,
        options: question.options,
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
        variantId: question.variantId,
        attempts: 0,
        status: 'active',
        maxAttempts: settings.maxAttempts || 3,
        pointsValue: settings.pointsValue || 2,
        previousVariantIds: [...previousVariantIds, question.variantId],
        topic: question.topic,
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
      console.error('Error generating multiple choice question:', error);
      throw new Error('Error generating question: ' + error.message);
    }
  }
  else if (params.operation === 'evaluate') {
    try {
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      if (assessmentData.attempts >= assessmentData.maxAttempts) {
        return {
          success: false,
          error: 'Maximum attempts exceeded',
          attemptsRemaining: 0
        };
      }

      const regeneratedQuestion = generatePhysicsMultipleChoice(
        assessmentData.timestamp, 
        assessmentData.previousVariantIds || []
      );
      
      // Find the variant that matches our stored data
      if (regeneratedQuestion.variantId !== assessmentData.variantId) {
        // Regenerate with correct parameters to match stored question
        const storedQuestion = {
          questionText: assessmentData.questionText,
          options: assessmentData.options,
          correctOptionId: assessmentData.correctOptionId,
          explanation: assessmentData.explanation,
          variantId: assessmentData.variantId
        };
        regeneratedQuestion = storedQuestion;
      }

      const result = evaluatePhysicsMultipleChoice(regeneratedQuestion, params.answer);
      const updatedAttempts = (assessmentData.attempts || 0) + 1;
      const attemptsRemaining = assessmentData.maxAttempts - updatedAttempts;

      const submission = {
        timestamp: getServerTimestamp(),
        answer: params.answer,
        isCorrect: result.isCorrect,
        attemptNumber: updatedAttempts,
        variantId: assessmentData.variantId
      };

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

      if (!assessmentData.submissions) {
        updates.submissions = {};
      }
      updates[`submissions/${updatedAttempts}`] = submission;

      await assessmentRef.update(updates);

      return {
        success: true,
        result: result,
        attemptsRemaining: attemptsRemaining,
        attemptsMade: updatedAttempts
      };
    } catch (error) {
      console.error('Error evaluating multiple choice answer:', error);
      throw new Error('Error evaluating answer: ' + error.message);
    }
  }

  throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
});

//==============================================================================
// Dynamic Question Handler
//==============================================================================

exports.handleDynamicQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  enforceAppCheck: false,
}, async (data, context) => {
  const params = extractParameters(data, context);
  
  const assessmentRef = admin.database()
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);

  if (params.operation === 'generate') {
    try {
      const settings = await getAssessmentSettings(params.courseId, 'dynamic', 'assignments');
      const difficulty = params.difficulty || 'intermediate';
      
      const question = generatePhysicsCalculation(Date.now(), { difficulty });
      
      await assessmentRef.set({
        timestamp: getServerTimestamp(),
        questionText: question.questionText,
        parameters: question.parameters,
        solution: question.solution,
        units: question.units,
        tolerance: question.tolerance,
        problemType: question.problemType,
        difficulty: difficulty,
        attempts: 0,
        status: 'active',
        maxAttempts: settings.maxAttempts || 5,
        pointsValue: settings.pointsValue || 3,
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
      console.error('Error generating dynamic question:', error);
      throw new Error('Error generating dynamic question: ' + error.message);
    }
  }
  else if (params.operation === 'evaluate') {
    try {
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();
      
      if (!assessmentData) {
        throw new Error('Assessment not found');
      }
      
      if (assessmentData.attempts >= assessmentData.maxAttempts) {
        return {
          success: false,
          error: 'Maximum attempts exceeded',
          attemptsRemaining: 0
        };
      }
      
      const regeneratedQuestion = {
        solution: assessmentData.solution,
        units: assessmentData.units,
        tolerance: assessmentData.tolerance,
        problemType: assessmentData.problemType
      };
      
      const result = evaluatePhysicsCalculation(regeneratedQuestion, params.answer);
      const updatedAttempts = (assessmentData.attempts || 0) + 1;
      const attemptsRemaining = assessmentData.maxAttempts - updatedAttempts;
      
      const submission = {
        timestamp: getServerTimestamp(),
        answer: params.answer,
        isCorrect: result.isCorrect,
        attemptNumber: updatedAttempts
      };
      
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
      
      if (!assessmentData.submissions) {
        updates.submissions = {};
      }
      updates[`submissions/${updatedAttempts}`] = submission;
      
      await assessmentRef.update(updates);
      
      return {
        success: true,
        result: result,
        attemptsRemaining: attemptsRemaining,
        attemptsMade: updatedAttempts
      };
    } catch (error) {
      console.error('Error evaluating dynamic answer:', error);
      throw new Error('Error evaluating dynamic answer: ' + error.message);
    }
  }
  
  throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
});
