const admin = require('firebase-admin');

// Course IDs that are exempt from credit limits
const EXEMPT_COURSE_IDS = [4, 6]; // COM1255 and INF2020

// Cache for course credits to avoid repeated database lookups
const courseCreditsCache = new Map();

// Cache for pricing config to avoid repeated database lookups
const pricingConfigCache = new Map();

/**
 * Format school year for database key (e.g., "25/26" → "25_26")
 */
function formatSchoolYear(year) {
  if (!year) return null;
  return year.replace('/', '_');
}

/**
 * Clear the course credits cache
 * Useful when course credits are updated in the database
 */
function clearCreditsCache() {
  courseCreditsCache.clear();
  pricingConfigCache.clear();
}

/**
 * Sanitize student type for database paths and config keys
 * Converts to camelCase to match pricing node structure
 * @param {string} studentType - Raw student type (e.g., "Non-Primary", "Home Education")
 * @returns {string} Sanitized type (e.g., "nonPrimaryStudents", "homeEducationStudents")
 */
function sanitizeStudentType(studentType) {
  if (!studentType) return null;
  
  // Map display names to pricing node keys
  const typeMapping = {
    'Non-Primary': 'nonPrimaryStudents',
    'Home Education': 'homeEducationStudents',
    'Summer School': 'summerSchoolStudents',
    'Adult Student': 'adultStudents',
    'International Student': 'internationalStudents'
  };
  
  return typeMapping[studentType] || studentType.replace(/\s+/g, '_').toLowerCase() + 'Students';
}

/**
 * Get pricing config for a specific student type
 * @param {string} studentType - The student type
 * @returns {Object} Pricing configuration
 */
async function getPricingConfig(studentType) {
  const sanitizedType = sanitizeStudentType(studentType);
  
  if (!sanitizedType) return null;
  
  // Check cache first
  if (pricingConfigCache.has(sanitizedType)) {
    return pricingConfigCache.get(sanitizedType);
  }
  
  try {
    const db = admin.database();
    const configRef = db.ref(`pricing/${sanitizedType}`);
    const snapshot = await configRef.once('value');
    const config = snapshot.val() || {};
    
    // Add default credit tracking values if not present
    const defaultConfig = {
      freeCreditsLimit: null,  // null means no limit
      costPerCredit: 0,
      requiresPaymentAfterLimit: false,
      ...config
    };
    
    // Special handling for Non-Primary and Home Education
    if (sanitizedType === 'nonPrimaryStudents' || sanitizedType === 'homeEducationStudents') {
      defaultConfig.freeCreditsLimit = config.freeCreditsLimit || 10;
      defaultConfig.costPerCredit = config.costPerCredit || 100;
      defaultConfig.requiresPaymentAfterLimit = true;
    }
    
    // Cache the result
    pricingConfigCache.set(sanitizedType, defaultConfig);
    
    return defaultConfig;
  } catch (error) {
    console.error(`Error fetching pricing config for ${sanitizedType}:`, error);
    return null;
  }
}

/**
 * Get credits for a specific course from database
 * Uses cache to avoid repeated lookups
 */
async function getCourseCredits(courseId) {
  const id = parseInt(courseId);
  
  // Check cache first
  if (courseCreditsCache.has(id)) {
    return courseCreditsCache.get(id);
  }
  
  try {
    const db = admin.database();
    const creditRef = db.ref(`courses/${id}/courseCredits`);
    const snapshot = await creditRef.once('value');
    const credits = snapshot.val() || 0;
    
    // Cache the result
    courseCreditsCache.set(id, credits);
    
    return credits;
  } catch (error) {
    console.error(`Error fetching credits for course ${id}:`, error);
    return 0;
  }
}

/**
 * Check if a course is exempt from credit limits
 */
function isExemptCourse(courseId) {
  const id = parseInt(courseId);
  return EXEMPT_COURSE_IDS.includes(id);
}

/**
 * Calculate credit totals for a student in a specific school year
 * @param {Object} courses - Object with courseId as keys
 * @returns {Object} Credit summary
 */
async function calculateCreditTotals(courses) {
  let nonExemptCredits = 0;
  let exemptCredits = 0;
  
  for (const [courseId, courseData] of Object.entries(courses)) {
    // Skip if this is not a course entry (could be a summary field)
    if (isNaN(parseInt(courseId))) continue;
    
    const credits = await getCourseCredits(courseId);
    
    if (isExemptCourse(courseId)) {
      exemptCredits += credits;
    } else {
      nonExemptCredits += credits;
    }
  }
  
  return {
    nonExemptCredits,
    exemptCredits,
    totalCredits: nonExemptCredits + exemptCredits,
    freeCreditsUsed: Math.min(nonExemptCredits, 10),
    paidCreditsRequired: Math.max(0, nonExemptCredits - 10)
  };
}

/**
 * Identify which courses require payment and how many credits are needed
 * @param {string} studentEmailKey - Sanitized email key
 * @param {Array} courseIds - Array of course IDs
 * @param {number} freeCreditsLimit - Free credits limit for student type
 * @returns {Object} Object with courseId as key and payment details as value
 */
async function identifyCoursesRequiringPayment(studentEmailKey, courseIds, freeCreditsLimit) {
  const db = admin.database();
  const coursesWithData = [];
  
  // Get course data including creation time and credits
  for (const courseId of courseIds) {
    const courseRef = db.ref(`students/${studentEmailKey}/courses/${courseId}`);
    const snapshot = await courseRef.once('value');
    const courseData = snapshot.val();
    
    if (courseData && courseData.Created) {
      const credits = await getCourseCredits(courseId);
      coursesWithData.push({
        courseId: parseInt(courseId),
        created: new Date(courseData.Created).getTime(),
        credits: credits,
        isExempt: isExemptCourse(courseId)
      });
    }
  }
  
  // Sort courses by creation time (earliest first)
  coursesWithData.sort((a, b) => a.created - b.created);
  
  // Track payment requirements for each course
  const paymentDetails = {};
  let nonExemptCreditsAccumulated = 0;
  
  for (const course of coursesWithData) {
    // Exempt courses never require payment
    if (course.isExempt) {
      paymentDetails[course.courseId] = {
        requiresPayment: false,
        creditsRequiredToUnlock: 0
      };
    } else {
      // Calculate how many credits need to be paid for this course
      const creditsBeforeThisCourse = nonExemptCreditsAccumulated;
      const creditsAfterThisCourse = nonExemptCreditsAccumulated + course.credits;
      
      if (freeCreditsLimit && creditsAfterThisCourse > freeCreditsLimit) {
        // This course exceeds the limit
        let creditsRequiredToUnlock = 0;
        
        if (creditsBeforeThisCourse >= freeCreditsLimit) {
          // Already over limit, need to pay for all credits of this course
          creditsRequiredToUnlock = course.credits;
        } else {
          // Partially over limit, only pay for the excess
          creditsRequiredToUnlock = creditsAfterThisCourse - freeCreditsLimit;
        }
        
        paymentDetails[course.courseId] = {
          requiresPayment: true,
          creditsRequiredToUnlock: creditsRequiredToUnlock
        };
      } else {
        // This course is within the free limit
        paymentDetails[course.courseId] = {
          requiresPayment: false,
          creditsRequiredToUnlock: 0
        };
      }
      
      nonExemptCreditsAccumulated = creditsAfterThisCourse;
    }
  }
  
  return paymentDetails;
}

/**
 * Update credit tracking for a student in a specific school year and type
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentType - Student type (e.g., "Non-Primary")
 * @param {Array} courseIds - Array of course IDs to track
 */
async function updateCreditTracking(studentEmailKey, schoolYear, studentType, courseIds) {
  const db = admin.database();
  const schoolYearKey = formatSchoolYear(schoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  
  if (!schoolYearKey) {
    console.error('Invalid school year format:', schoolYear);
    return null;
  }
  
  if (!sanitizedType) {
    console.error('Invalid student type:', studentType);
    return null;
  }
  
  const creditData = {};
  
  // Add each course with its credits
  for (const courseId of courseIds) {
    const credits = await getCourseCredits(courseId);
    if (credits > 0) {
      creditData[courseId] = credits;
    }
  }
  
  // Calculate totals
  const totals = await calculateCreditTotals(creditData);
  
  // Get pricing config for this student type
  const pricingConfig = await getPricingConfig(studentType);
  
  // Identify courses requiring payment if there's a limit
  let coursesRequiringPayment = [];
  let coursePaymentDetails = {};
  let totalCreditsRequiringPayment = 0;
  
  if (pricingConfig?.freeCreditsLimit) {
    coursePaymentDetails = await identifyCoursesRequiringPayment(
      studentEmailKey, 
      courseIds, 
      pricingConfig.freeCreditsLimit
    );
    
    // Extract courses that require payment and sum total credits needed
    for (const [courseId, details] of Object.entries(coursePaymentDetails)) {
      if (details.requiresPayment) {
        coursesRequiringPayment.push(parseInt(courseId));
        totalCreditsRequiringPayment += details.creditsRequiredToUnlock;
      }
    }
  }
  
  // Add summary fields with pricing info
  Object.assign(creditData, {
    ...totals,
    studentType,
    freeCreditsLimit: pricingConfig?.freeCreditsLimit || null,
    remainingFreeCredits: pricingConfig?.freeCreditsLimit ? 
      Math.max(0, (pricingConfig.freeCreditsLimit - totals.nonExemptCredits)) : null,
    requiresPayment: pricingConfig?.requiresPaymentAfterLimit && 
      totals.nonExemptCredits > (pricingConfig?.freeCreditsLimit || 0),
    coursesRequiringPayment: coursesRequiringPayment,
    coursePaymentDetails: coursePaymentDetails,
    totalCreditsRequiringPayment: totalCreditsRequiringPayment,
    lastUpdated: admin.database.ServerValue.TIMESTAMP
  });
  
  // Update database with new path structure in both locations
  const updates = {};
  
  // Original location for admin queries
  updates[`creditsPerStudent/${schoolYearKey}/${sanitizedType}/${studentEmailKey}`] = creditData;
  
  // Duplicate in student profile for easy student retrieval
  updates[`students/${studentEmailKey}/profile/creditsPerStudent/${schoolYearKey}/${sanitizedType}`] = creditData;
  
  // Update individual course RequiresPayment flags and CreditsRequiredToUnlock
  for (const [courseId, details] of Object.entries(coursePaymentDetails)) {
    updates[`students/${studentEmailKey}/courses/${courseId}/RequiresPayment`] = {
      Id: 1,
      Value: details.requiresPayment
    };
    updates[`students/${studentEmailKey}/courses/${courseId}/CreditsRequiredToUnlock`] = {
      Id: 1,
      Value: details.creditsRequiredToUnlock
    };
  }
  
  await db.ref().update(updates);
  
  return creditData;
}

/**
 * Get current credit usage for a student
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentType - Student type (e.g., "Non-Primary")
 * @param {boolean} fromProfile - Whether to read from student profile (default: false)
 */
async function getStudentCredits(studentEmailKey, schoolYear, studentType, fromProfile = false) {
  const db = admin.database();
  const schoolYearKey = formatSchoolYear(schoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  
  if (!schoolYearKey || !sanitizedType) {
    return null;
  }
  
  // Choose path based on fromProfile flag
  const path = fromProfile 
    ? `students/${studentEmailKey}/profile/creditsPerStudent/${schoolYearKey}/${sanitizedType}`
    : `creditsPerStudent/${schoolYearKey}/${sanitizedType}/${studentEmailKey}`;
  
  const creditRef = db.ref(path);
  const snapshot = await creditRef.once('value');
  
  return snapshot.val();
}

/**
 * Check if student can register for free credits
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year
 * @param {string} studentType - Student type
 * @param {number} additionalCredits - Credits for course being registered
 */
async function canRegisterForFree(studentEmailKey, schoolYear, studentType, additionalCredits = 0) {
  const currentCredits = await getStudentCredits(studentEmailKey, schoolYear, studentType);
  const currentNonExempt = currentCredits?.nonExemptCredits || 0;
  
  const pricingConfig = await getPricingConfig(studentType);
  const limit = pricingConfig?.freeCreditsLimit;
  
  // If no limit set, they can always register for free
  if (limit === null || limit === undefined) {
    return true;
  }
  
  return (currentNonExempt + additionalCredits) <= limit;
}

/**
 * Recalculate credits for a student based on their active courses
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year
 * @param {string} studentType - Student type (optional, will be determined from courses if not provided)
 */
async function recalculateCredits(studentEmailKey, schoolYear, studentType = null) {
  const db = admin.database();
  
  // Get all courses for this student in this school year
  const coursesRef = db.ref(`students/${studentEmailKey}/courses`);
  const snapshot = await coursesRef.once('value');
  const courses = snapshot.val() || {};
  
  // Group courses by student type for this school year
  const coursesByType = {};
  
  for (const [courseId, courseData] of Object.entries(courses)) {
    const courseSchoolYear = courseData?.School_x0020_Year?.Value;
    const status = courseData?.ActiveFutureArchived?.Value;
    const courseStudentType = courseData?.StudentType?.Value;
    
    // Include if it's the right school year and has an active-like status
    if (courseSchoolYear === schoolYear && 
        (status === 'Active' || status === 'Registration' || status === 'Future')) {
      
      const typeKey = courseStudentType || 'Unknown';
      if (!coursesByType[typeKey]) {
        coursesByType[typeKey] = [];
      }
      coursesByType[typeKey].push(courseId);
    }
  }
  
  // If specific student type requested, only update that
  if (studentType && coursesByType[studentType]) {
    return await updateCreditTracking(studentEmailKey, schoolYear, studentType, coursesByType[studentType]);
  }
  
  // Otherwise, update all types found
  const results = {};
  for (const [type, courseIds] of Object.entries(coursesByType)) {
    if (type !== 'Unknown') {
      results[type] = await updateCreditTracking(studentEmailKey, schoolYear, type, courseIds);
    }
  }
  
  return results;
}

module.exports = {
  EXEMPT_COURSE_IDS,
  formatSchoolYear,
  clearCreditsCache,
  sanitizeStudentType,
  getPricingConfig,
  getCourseCredits,
  isExemptCourse,
  calculateCreditTotals,
  identifyCoursesRequiringPayment,
  updateCreditTracking,
  getStudentCredits,
  canRegisterForFree,
  recalculateCredits
};