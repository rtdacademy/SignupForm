// filepath: functions/courses/PHY30/content/lessons/IntroToPhysics.js
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getServerTimestamp } = require('../../../../utils');

/**
 * Extracts and validates required parameters from the function call
 * @param {Object} data - The data object from the function call
 * @param {Object} context - The context object from the function call
 * @returns {Object} Extracted and validated parameters
 */
function extractParameters(data, context) {
  if (!data || !data.studentKey || !data.courseId || !data.assessmentId || !data.operation) {
    throw new Error('Missing required parameters');
  }

  return {
    studentKey: data.studentKey,
    courseId: data.courseId,
    assessmentId: data.assessmentId,
    operation: data.operation,
    answer: data.answer,
    seed: data.seed
  };
}

/**
 * Initializes course structure for a student if it doesn't exist
 */
async function initializeCourseIfNeeded(studentKey, courseId) {
  const safeCoursePath = String(courseId);
  const courseRef = admin.database().ref(`students/${studentKey}/courses/${safeCoursePath}`);

  try {
    const courseSnapshot = await courseRef.once('value');
    if (!courseSnapshot.exists()) {
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
  }
}

// Question variants for Physics introduction
const multipleChoiceQuestionVariants = [
  {
    id: "basic_concepts",
    questionText: "Which fundamental concept is NOT considered one of the basic quantities in physics?",
    options: [
      { id: "a", text: "Mass" },
      { id: "b", text: "Time" },
      { id: "c", text: "Energy" },
      { id: "d", text: "Length" }
    ],
    correctOptionId: "c",
    explanation: "Mass, time, and length are the three basic quantities in physics (MLT). Energy is a derived quantity that can be expressed in terms of these basic quantities."
  },
  {
    id: "scientific_method",
    questionText: "What is the correct sequence of steps in the scientific method?",
    options: [
      { id: "a", text: "Hypothesis → Observation → Experiment → Conclusion" },
      { id: "b", text: "Observation → Hypothesis → Experiment → Conclusion" },
      { id: "c", text: "Experiment → Observation → Hypothesis → Conclusion" },
      { id: "d", text: "Conclusion → Hypothesis → Experiment → Observation" }
    ],
    correctOptionId: "b",
    explanation: "The scientific method begins with observation of a phenomenon, followed by forming a hypothesis, testing it through experiments, and drawing conclusions."
  },
  {
    id: "vectors",
    questionText: "Which of the following is NOT a vector quantity?",
    options: [
      { id: "a", text: "Velocity" },
      { id: "b", text: "Temperature" },
      { id: "c", text: "Acceleration" }, 
      { id: "d", text: "Force" }
    ],
    correctOptionId: "b",
    explanation: "Temperature is a scalar quantity because it only has magnitude. Velocity, acceleration, and force are all vector quantities because they have both magnitude and direction."
  },
  {
    id: "si_units",
    questionText: "In SI units, which of these is equivalent to one Newton?",
    options: [
      { id: "a", text: "kg⋅m/s" },
      { id: "b", text: "kg⋅m/s²" },
      { id: "c", text: "kg⋅m²/s" },
      { id: "d", text: "kg/m⋅s" }
    ],
    correctOptionId: "b",
    explanation: "One Newton is equal to kg⋅m/s², representing the force needed to accelerate one kilogram of mass at one meter per second squared."
  }
];

/**
 * Generates a dynamic physics calculation question
 * @param {number} seed Random seed for consistent generation
 * @param {Object} options Generation options
 */
function generateDynamicQuestion(seed, options = {}) {
  // Use seed to generate consistent random numbers
  const rng = createSeededRandom(seed);
  
  // Generate velocity values between 2 and 10 m/s
  const velocity = Math.round((rng() * 8 + 2) * 10) / 10;
  const time = Math.round((rng() * 4 + 1) * 10) / 10;
  
  const distance = velocity * time;

  return {
    questionText: `An object travels at a constant velocity of ${velocity} m/s for ${time} seconds. Calculate the distance traveled in meters.`,
    parameters: {
      velocity,
      time
    },
    solution: distance,
    tolerance: 0.1, // Allow for small rounding differences
    units: 'm'
  };
}

/**
 * Creates a seeded random number generator
 */
function createSeededRandom(seed) {
  const mask = 0xffffffff;
  let m_w = (123456789 + seed) & mask;
  let m_z = (987654321 - seed) & mask;

  return function() {
    m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;
    m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;

    let result = ((m_z << 16) + (m_w & 65535)) >>> 0;
    result /= 4294967296;
    return result;
  }
}

/**
 * Handler for intro physics questions
 */
exports.default = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  enforceAppCheck: false
}, async (data, context) => {
  const params = extractParameters(data, context);

  await initializeCourseIfNeeded(params.studentKey, params.courseId);

  const assessmentRef = admin.database()
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);

  if (params.operation === 'generate') {
    try {
      // Check if this is a dynamic question or multiple choice
      const isDynamic = params.assessmentId.includes('dynamic');
      
      if (isDynamic) {
        const seed = params.seed || Date.now();
        const question = generateDynamicQuestion(seed);
        
        await assessmentRef.set({
          ...question,
          seed,
          attemptsRemaining: 3,
          pointsValue: 1
        });
        
        return { 
          success: true,
          question: {
            questionText: question.questionText,
            parameters: question.parameters,
            units: question.units
          }
        };
      } else {
        // Multiple choice question generation
        const previousVariantIdsSnapshot = await assessmentRef.child('previousVariantIds').once('value');
        const previousVariantIds = previousVariantIdsSnapshot.val() || [];
  
        const unusedVariants = multipleChoiceQuestionVariants.filter(v => !previousVariantIds.includes(v.id));
        const selectedVariant = unusedVariants.length > 0 
          ? unusedVariants[Math.floor(Math.random() * unusedVariants.length)]
          : multipleChoiceQuestionVariants[Math.floor(Math.random() * multipleChoiceQuestionVariants.length)];
  
        const question = {
          ...selectedVariant,
          variantId: selectedVariant.id,
          previousVariantIds: [...previousVariantIds, selectedVariant.id],
          attemptsRemaining: 3,
          pointsValue: 1
        };
  
        await assessmentRef.set(question);
        return { success: true, question };
      }
    } catch (error) {
      console.error('Error generating question:', error);
      throw new Error('Failed to generate question');
    }
  } else if (params.operation === 'submit') {
    try {
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      const attemptsRemaining = assessmentData.attemptsRemaining || 0;
      if (attemptsRemaining <= 0) {
        return { success: false, error: 'No attempts remaining' };
      }

      let isCorrect;
      let explanation;
      
      // Handle dynamic vs multiple choice questions differently
      if (assessmentData.solution !== undefined) {
        // Dynamic question evaluation
        const studentAnswer = parseFloat(params.answer);
        if (isNaN(studentAnswer)) {
          throw new Error('Invalid answer format');
        }
        
        isCorrect = Math.abs(studentAnswer - assessmentData.solution) <= assessmentData.tolerance;
        explanation = isCorrect
          ? `Correct! The object travels ${assessmentData.solution} meters.`
          : `Not quite. Try again by multiplying velocity (${assessmentData.parameters.velocity} m/s) by time (${assessmentData.parameters.time} s).`;
      } else {
        // Multiple choice evaluation
        isCorrect = params.answer === assessmentData.correctOptionId;
        explanation = assessmentData.explanation;
      }

      const result = {
        isCorrect,
        attemptsRemaining: attemptsRemaining - 1,
        explanation
      };

      await assessmentRef.update({
        attemptsRemaining: result.attemptsRemaining,
        lastAttempt: {
          answer: params.answer,
          timestamp: getServerTimestamp()
        }
      });

      if (result.isCorrect) {
        const gradeRef = admin.database()
          .ref(`students/${params.studentKey}/courses/${params.courseId}/Grades/assessments/${params.assessmentId}`);
        const pointsValue = assessmentData.pointsValue || 1;
        await gradeRef.set(pointsValue);
      }

      return { success: true, result };
    } catch (error) {
      console.error('Error submitting answer:', error);
      throw new Error('Failed to submit answer');
    }
  }

  throw new Error('Invalid operation');
});
