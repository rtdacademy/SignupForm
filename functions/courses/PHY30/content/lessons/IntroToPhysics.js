// filepath: functions/courses/PHY30/content/lessons/IntroToPhysics.js
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { getServerTimestamp, sanitizeEmail } = require('../../../../utils');

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
    studentEmail,
    userId,
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
    console.log("Using UID from auth context:", finalUserId);
  }

  // Validate required parameters
  if (!courseId || !assessmentId || !operation || !finalStudentEmail) {
    console.error("Missing required parameters:", {
      courseId,
      assessmentId,
      operation,
      studentEmail: finalStudentEmail,
      userId: finalUserId
    });
    throw new Error('Missing required parameters: courseId, assessmentId, operation, and studentEmail are required');
  }

  // Convert email to safe key for database
  const studentKey = sanitizeEmail(finalStudentEmail);

  return {
    studentKey,
    studentEmail: finalStudentEmail,
    userId: finalUserId,
    courseId,
    assessmentId,
    operation,
    answer,
    seed
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
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);  if (params.operation === 'generate') {
    try {
      // Generate dynamic physics question
      const seed = params.seed || Date.now();
      const question = generateDynamicQuestion(seed);
      
      await assessmentRef.set({
        timestamp: getServerTimestamp(),
        questionText: question.questionText,
        parameters: question.parameters,
        units: question.units,
        solution: question.solution,
        tolerance: question.tolerance,
        seed,
        attempts: 0,
        status: 'active',
        maxAttempts: 5,
        pointsValue: 1,
        settings: {
          showRegenerate: true,
          showFeedback: true
        }
      });
      
      return { 
        success: true,
        questionGenerated: true,
        assessmentId: params.assessmentId,
        questionText: question.questionText,
        parameters: question.parameters,
        units: question.units
      };
    } catch (error) {
      console.error('Error generating question:', error);
      throw new Error('Failed to generate question');
    }  } else if (params.operation === 'evaluate') {
    try {
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      const attemptsRemaining = assessmentData.maxAttempts - (assessmentData.attempts || 0);
      if (attemptsRemaining <= 0) {
        return { success: false, error: 'No attempts remaining' };
      }

      // Dynamic question evaluation
      const studentAnswer = parseFloat(params.answer);
      if (isNaN(studentAnswer)) {
        throw new Error('Invalid answer format');
      }
      
      const isCorrect = Math.abs(studentAnswer - assessmentData.solution) <= assessmentData.tolerance;
      const explanation = isCorrect
        ? `Correct! The object travels ${assessmentData.solution} meters.`
        : `Not quite. Try again by multiplying velocity (${assessmentData.parameters.velocity} m/s) by time (${assessmentData.parameters.time} s).`;

      const result = {
        isCorrect,
        attemptsRemaining: attemptsRemaining - 1,
        explanation
      };

      await assessmentRef.update({
        attempts: (assessmentData.attempts || 0) + 1,
        lastAttempt: {
          answer: params.answer,
          timestamp: getServerTimestamp(),
          isCorrect
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
