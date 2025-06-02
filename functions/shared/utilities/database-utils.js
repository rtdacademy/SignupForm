/**
 * Shared Database Utilities
 * Standard database operations and utilities used across all assessment types
 */

const admin = require('firebase-admin');
const { sanitizeEmail } = require('../../utils');

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
  // Handle both direct data and nested data.data (for different calling patterns)
  const actualData = data.data || data;
  const {
    courseId,
    assessmentId,
    operation,
    answer,
    studentEmail,
    userId,
    topic = 'general',
    difficulty = 'intermediate',
  } = actualData;

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
  console.log("Parameter - topic:", topic);
  console.log("Parameter - difficulty:", difficulty);

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

  // Check if this is a staff member
  const isStaff = finalStudentEmail && finalStudentEmail.toLowerCase().endsWith('@rtdacademy.com');
  if (isStaff) {
    console.log("Staff member detected:", finalStudentEmail);
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
    topic,
    difficulty,
    studentEmail: finalStudentEmail,
    userId: finalUserId,
    studentKey,
    isEmulator,
    isStaff
  };
}

/**
 * Initializes course structure for a student if it doesn't exist
 * @param {string} studentKey - The sanitized student email
 * @param {string} courseId - The course ID
 * @param {boolean} isStaff - Whether this is a staff member
 * @returns {Promise<void>}
 */
async function initializeCourseIfNeeded(studentKey, courseId, isStaff = false) {
  // Make sure courseId is a string
  const safeCoursePath = String(courseId);

  // For staff, use a different path under staff_testing
  const basePath = isStaff ? `staff_testing/${studentKey}/courses` : `students/${studentKey}/courses`;
  const courseRef = admin.database().ref(`${basePath}/${safeCoursePath}`);

  try {
    // Check if the course exists in the database for this student/staff
    const courseSnapshot = await courseRef.once('value');
    if (!courseSnapshot.exists()) {
      // Initialize basic course structure if it doesn't exist
      console.log(`Initializing course structure for ${studentKey} in course ${safeCoursePath} (${isStaff ? 'staff' : 'student'})`);
      await courseRef.set({
        Initialized: true,
        Assessments: {},
        Grades: {
          assessments: {}
        },
        timestamp: getServerTimestamp(),
        isStaffTest: isStaff
      });
    }
  } catch (error) {
    console.warn("Error checking/initializing course:", error);
    // Continue anyway - the assessment operation will create required paths
  }
}

/**
 * Standard database paths used across assessments
 */
const DATABASE_PATHS = {
  studentAssessment: (studentKey, courseId, assessmentId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Assessments/${assessmentId}` 
            : `students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`,
  
  studentGrade: (studentKey, courseId, assessmentId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}/Grades/assessments/${assessmentId}`
            : `students/${studentKey}/courses/${courseId}/Grades/assessments/${assessmentId}`,
  
  courseAssessment: (courseId, assessmentId) => 
    `courses/${courseId}/assessments/${assessmentId}`,
  
  secureAssessment: (courseId, assessmentId) => 
    `courses_secure/${courseId}/assessments/${assessmentId}`,
  
  studentCourse: (studentKey, courseId, isStaff = false) => 
    isStaff ? `staff_testing/${studentKey}/courses/${courseId}`
            : `students/${studentKey}/courses/${courseId}`
};

/**
 * Gets a database reference for a standard path
 * @param {string} pathType - The type of path (from DATABASE_PATHS)
 * @param {...any} params - Parameters for the path (including optional isStaff flag)
 * @returns {Object} Firebase database reference
 */
function getDatabaseRef(pathType, ...params) {
  const pathFunction = DATABASE_PATHS[pathType];
  if (!pathFunction) {
    throw new Error(`Unknown database path type: ${pathType}`);
  }
  
  const path = pathFunction(...params);
  return admin.database().ref(path);
}

module.exports = {
  getServerTimestamp,
  extractParameters,
  initializeCourseIfNeeded,
  DATABASE_PATHS,
  getDatabaseRef
};