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
 * Get Firebase UID from student email key by querying the users node
 * Efficient with proper index on sanitizedEmail field
 * @param {string} studentEmailKey - Sanitized email key
 * @returns {Promise<string|null>} UID or null if user not found
 */
async function getUidFromStudentKey(studentEmailKey) {
  try {
    if (!studentEmailKey) return null;
    
    const db = admin.database();
    
    // Query users node by sanitizedEmail field (requires index)
    const usersSnapshot = await db.ref('users')
      .orderByChild('sanitizedEmail')
      .equalTo(studentEmailKey)
      .limitToFirst(1) // Only get the first match
      .once('value');
    
    if (!usersSnapshot.exists()) {
      console.log(`No user found with sanitizedEmail: ${studentEmailKey}`);
      return null;
    }
    
    // Get the first (and should be only) matching user
    const userData = usersSnapshot.val();
    const userKey = Object.keys(userData)[0];
    const user = userData[userKey];
    
    // Return the uid field from the user record
    return user.uid || userKey; // Use userKey as fallback since it's typically the UID
  } catch (error) {
    console.error(`Error getting UID for student key ${studentEmailKey}:`, error);
    return null;
  }
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
 * Check if a student type pays per course instead of per credit
 * @param {string} studentType - The student type to check
 * @returns {boolean} True if student pays per course
 */
function isPerCoursePaymentStudent(studentType) {
  return studentType === 'Adult Student' || studentType === 'International Student';
}

/**
 * Check if a course has a payment override
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} courseId - Course ID
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentType - Student type
 * @returns {Object} Override information or null
 */
async function checkCoursePaymentOverride(studentEmailKey, courseId, schoolYear, studentType) {
  const db = admin.database();
  const schoolYearKey = formatSchoolYear(schoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  
  try {
    const overrideRef = db.ref(`students/${studentEmailKey}/profile/creditOverrides/${schoolYearKey}/${sanitizedType}/courseOverrides/${courseId}`);
    const snapshot = await overrideRef.once('value');
    const override = snapshot.val();
    
    if (!override) return null;
    
    // No expiration checking needed - overrides are school year specific
    return override;
  } catch (error) {
    console.error(`Error checking course payment override for ${studentEmailKey}, course ${courseId}:`, error);
    return null;
  }
}

/**
 * Check if a student has additional free credits override
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentType - Student type
 * @returns {number} Additional free credits (0 if no override)
 */
async function checkCreditLimitOverride(studentEmailKey, schoolYear, studentType) {
  const db = admin.database();
  const schoolYearKey = formatSchoolYear(schoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  
  try {
    const overrideRef = db.ref(`students/${studentEmailKey}/profile/creditOverrides/${schoolYearKey}/${sanitizedType}/creditAdjustments`);
    const snapshot = await overrideRef.once('value');
    const adjustments = snapshot.val();
    
    if (!adjustments) return 0;
    
    // No expiration checking needed - overrides are school year specific
    return adjustments.additionalFreeCredits || 0;
  } catch (error) {
    console.error(`Error checking credit limit override for ${studentEmailKey}:`, error);
    return 0;
  }
}

/**
 * Get effective free credits limit including overrides
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year
 * @param {string} studentType - Student type
 * @param {number} baseFreeCredits - Base free credits from pricing config
 * @returns {number} Total free credits including overrides
 */
async function getEffectiveFreeCreditsLimit(studentEmailKey, schoolYear, studentType, baseFreeCredits) {
  const additionalCredits = await checkCreditLimitOverride(studentEmailKey, schoolYear, studentType);
  return (baseFreeCredits || 0) + additionalCredits;
}

/**
 * Check payment status for a specific course
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} courseId - Course ID
 * @param {string} schoolYear - School year (optional, for override checking)
 * @param {string} studentType - Student type (optional, for override checking)
 * @returns {Object} Payment status information
 */
async function checkCoursePaymentStatus(studentEmailKey, courseId, schoolYear = null, studentType = null) {
  const db = admin.database();
  
  // First check for manual override if school year and student type are provided
  if (schoolYear && studentType) {
    const override = await checkCoursePaymentOverride(studentEmailKey, courseId, schoolYear, studentType);
    if (override && override.isPaid) {
      return {
        isPaid: true,
        paymentType: 'manual_override',
        status: 'paid',
        paymentMethod: 'override',
        lastUpdated: override.overriddenAt,
        overrideDetails: {
          reason: override.reason,
          overriddenBy: override.overriddenBy,
          overriddenAt: override.overriddenAt,
          schoolYear: override.schoolYear || schoolYear
        }
      };
    }
  }
  
  // Check the payments node where Stripe stores payment data
  const paymentRef = db.ref(`payments/${studentEmailKey}/courses/${courseId}`);
  const snapshot = await paymentRef.once('value');
  const paymentData = snapshot.val();
  
  return {
    isPaid: paymentData?.status === 'paid' || paymentData?.status === 'active',
    paymentType: paymentData?.type || null,
    status: paymentData?.status || 'unpaid',
    paymentMethod: paymentData?.payment_method || null,
    lastUpdated: paymentData?.last_updated || null
  };
}

/**
 * Check if a course has been paid in previous school years and carry over payment status
 * Only applies to Adult and International students who pay per course
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} courseId - Course ID to check
 * @param {string} currentSchoolYear - Current school year (e.g., "25/26")
 * @param {string} studentType - Student type (must be Adult or International)
 * @returns {Object} Carryover information including payment status and metadata
 */
async function checkAndCarryOverCoursePayment(studentEmailKey, courseId, currentSchoolYear, studentType) {
  // Only process for per-course payment students
  if (!isPerCoursePaymentStudent(studentType)) {
    return {
      shouldCarryOver: false,
      isPaid: false
    };
  }
  
  const db = admin.database();
  const currentYearKey = formatSchoolYear(currentSchoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  
  try {
    // Get all credit tracking data for this student's profile
    const profileCreditsRef = db.ref(`students/${studentEmailKey}/profile/creditsPerStudent`);
    const snapshot = await profileCreditsRef.once('value');
    const allCreditsData = snapshot.val() || {};
    
    // Track found paid courses from previous years
    let paidInPreviousYear = null;
    let originalSchoolYear = null;
    
    // Search through all school years for this course
    for (const [yearKey, yearData] of Object.entries(allCreditsData)) {
      // Skip current year
      if (yearKey === currentYearKey) continue;
      
      // Check if this student type has data for this year
      if (yearData[sanitizedType]?.courses?.[courseId]) {
        const courseData = yearData[sanitizedType].courses[courseId];
        
        // Check if the course was paid in this year
        if (courseData.isPaid) {
          // Prefer the earliest paid year as the original
          if (!paidInPreviousYear || yearKey < originalSchoolYear) {
            paidInPreviousYear = courseData;
            originalSchoolYear = yearKey;
          }
        }
      }
    }
    
    // If we found a paid course in a previous year, return carryover info
    if (paidInPreviousYear && originalSchoolYear) {
      return {
        shouldCarryOver: true,
        isPaid: true,
        carriedOver: {
          from: originalSchoolYear.replace('_', '/'), // Convert back to display format
          carriedAt: admin.database.ServerValue.TIMESTAMP,
          originalCourseId: parseInt(courseId)
        },
        originalSchoolYearKey: originalSchoolYear,
        originalCourseData: paidInPreviousYear
      };
    }
    
    // No paid course found in previous years
    return {
      shouldCarryOver: false,
      isPaid: false
    };
    
  } catch (error) {
    console.error(`Error checking course carryover for ${studentEmailKey}, course ${courseId}:`, error);
    return {
      shouldCarryOver: false,
      isPaid: false,
      error: error.message
    };
  }
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
 * @param {string} schoolYear - School year for paid credits lookup
 * @param {string} studentType - Student type for paid credits lookup
 * @returns {Object} Object with courseId as key and payment details as value
 */
async function identifyCoursesRequiringPayment(studentEmailKey, courseIds, freeCreditsLimit, schoolYear, studentType) {
  const db = admin.database();
  const coursesWithData = [];
  
  // Get paid credits for this student/year/type from profile
  const schoolYearKey = formatSchoolYear(schoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  let totalPaidCredits = 0;
  
  if (schoolYearKey && sanitizedType) {
    const paidCreditsRef = db.ref(`students/${studentEmailKey}/profile/creditsPaid/${schoolYearKey}/${sanitizedType}`);
    const paidCreditsSnapshot = await paidCreditsRef.once('value');
    totalPaidCredits = paidCreditsSnapshot.val() || 0;
  }
  
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
  
  // Get effective free credits limit including overrides
  const effectiveFreeCreditsLimit = await getEffectiveFreeCreditsLimit(
    studentEmailKey, 
    schoolYear, 
    studentType, 
    freeCreditsLimit
  );
  
  // Calculate effective limit including paid credits and overrides
  const effectiveLimit = effectiveFreeCreditsLimit + totalPaidCredits;
  
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
      
      if (freeCreditsLimit && creditsAfterThisCourse > effectiveLimit) {
        // This course exceeds the effective limit (free + paid)
        let creditsRequiredToUnlock = 0;
        
        if (creditsBeforeThisCourse >= effectiveLimit) {
          // Already over limit, need to pay for all credits of this course
          creditsRequiredToUnlock = course.credits;
        } else {
          // Partially over limit, only pay for the excess
          creditsRequiredToUnlock = creditsAfterThisCourse - effectiveLimit;
        }
        
        paymentDetails[course.courseId] = {
          requiresPayment: true,
          creditsRequiredToUnlock: creditsRequiredToUnlock
        };
      } else {
        // This course is within the effective limit
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
  
  // Get the UID for this student
  const uid = await getUidFromStudentKey(studentEmailKey);
  
  // Check if this is a per-course payment student (Adult or International)
  if (isPerCoursePaymentStudent(studentType)) {
    // Handle per-course payment students differently
    const courseData = {};
    let paidCourses = 0;
    let unpaidCourses = 0;
    const carryoverUpdates = {}; // Track updates for original courses
    const overridesApplied = []; // Track which overrides were applied
    
    // Check payment status for each course
    for (const courseId of courseIds) {
      // First check if this course has been paid in a previous year
      const carryoverInfo = await checkAndCarryOverCoursePayment(
        studentEmailKey, 
        courseId, 
        schoolYear, 
        studentType
      );
      
      let paymentStatus;
      let coursePaymentData;
      
      if (carryoverInfo.shouldCarryOver && carryoverInfo.isPaid) {
        // Course was paid in a previous year - carry over the payment
        paymentStatus = {
          isPaid: true,
          status: 'paid',
          paymentType: 'carried_over',
          paymentMethod: 'carryover',
          lastUpdated: admin.database.ServerValue.TIMESTAMP
        };
        
        // Prepare update for the original course entry
        const origYearKey = carryoverInfo.originalSchoolYearKey;
        
        // We need to fetch existing carriedTo array and update it
        const origProfilePath = `students/${studentEmailKey}/profile/creditsPerStudent/${origYearKey}/${sanitizedType}/courses/${courseId}/original/carriedTo`;
        const origAdminPath = `creditsPerStudent/${origYearKey}/${sanitizedType}/${studentEmailKey}/courses/${courseId}/original/carriedTo`;
        
        // Get existing carriedTo array
        const existingRef = db.ref(origProfilePath);
        const existingSnapshot = await existingRef.once('value');
        const existingCarriedTo = existingSnapshot.val() || [];
        
        // Add current year if not already present
        const carriedToArray = Array.isArray(existingCarriedTo) ? existingCarriedTo : [];
        const currentYearDisplay = schoolYear; // Use display format (e.g., "25/26")
        if (!carriedToArray.includes(currentYearDisplay)) {
          carriedToArray.push(currentYearDisplay);
        }
        
        // Update both locations with the original metadata
        carryoverUpdates[origProfilePath] = carriedToArray;
        carryoverUpdates[origAdminPath] = carriedToArray;
        carryoverUpdates[`${origProfilePath.replace('/carriedTo', '/lastCarriedAt')}`] = admin.database.ServerValue.TIMESTAMP;
        carryoverUpdates[`${origAdminPath.replace('/carriedTo', '/lastCarriedAt')}`] = admin.database.ServerValue.TIMESTAMP;
        
        coursePaymentData = {
          ...carryoverInfo.carriedOver
        };
      } else {
        // Check current payment status with override support
        paymentStatus = await checkCoursePaymentStatus(studentEmailKey, courseId, schoolYear, studentType);
        coursePaymentData = null;
        
        // Track if an override was applied
        if (paymentStatus.overrideDetails) {
          overridesApplied.push({
            courseId,
            type: 'payment',
            details: paymentStatus.overrideDetails
          });
        }
      }
      
      // Get course name from database
      const courseRef = db.ref(`students/${studentEmailKey}/courses/${courseId}/CourseName/Value`);
      const courseNameSnapshot = await courseRef.once('value');
      const courseName = courseNameSnapshot.val() || `Course ${courseId}`;
      
      courseData[courseId] = {
        courseName,
        paymentStatus: paymentStatus.status,
        paymentType: paymentStatus.paymentType,
        isPaid: paymentStatus.isPaid,
        lastChecked: paymentStatus.lastUpdated || null,
        ...(coursePaymentData && { carriedOver: coursePaymentData })
      };
      
      if (paymentStatus.isPaid) {
        paidCourses++;
      } else {
        unpaidCourses++;
      }
    }
    
    // Build the data structure for per-course payment students
    const perCourseData = {
      courses: courseData,
      studentType,
      uid: uid || null,
      totalCourses: courseIds.length,
      paidCourses,
      unpaidCourses,
      requiresPayment: unpaidCourses > 0,
      hasOverrides: overridesApplied.length > 0,
      ...(overridesApplied.length > 0 && { overridesApplied }),
      lastUpdated: admin.database.ServerValue.TIMESTAMP
    };
    
    // Update database with per-course payment structure
    const updates = {};
    
    // Original location for admin queries
    updates[`creditsPerStudent/${schoolYearKey}/${sanitizedType}/${studentEmailKey}`] = perCourseData;
    
    // Duplicate in student profile for easy student retrieval
    updates[`students/${studentEmailKey}/profile/creditsPerStudent/${schoolYearKey}/${sanitizedType}`] = perCourseData;
    
    // Update individual course RequiresPayment flags based on payment status
    for (const [courseId, courseInfo] of Object.entries(courseData)) {
      updates[`students/${studentEmailKey}/courses/${courseId}/RequiresPayment`] = {
        Id: 1,
        Value: !courseInfo.isPaid
      };
      // For per-course payment, no credits to unlock - it's binary paid/unpaid
      updates[`students/${studentEmailKey}/courses/${courseId}/CreditsRequiredToUnlock`] = {
        Id: 1,
        Value: 0
      };
    }
    
    // Add carryover updates for original courses
    Object.assign(updates, carryoverUpdates);
    
    await db.ref().update(updates);
    
    return perCourseData;
    
  } else {
    // Original credit-based logic for Non-Primary, Home Education, etc.
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
    
    // Check for credit limit overrides
    const additionalFreeCredits = await checkCreditLimitOverride(studentEmailKey, schoolYear, studentType);
    const effectiveFreeCreditsLimit = (pricingConfig?.freeCreditsLimit || 0) + additionalFreeCredits;
    
    // Track if credit override was applied
    const hasCreditsOverride = additionalFreeCredits > 0;
    const creditsOverrideDetails = hasCreditsOverride ? {
      additionalFreeCredits,
      originalLimit: pricingConfig?.freeCreditsLimit || 0,
      effectiveLimit: effectiveFreeCreditsLimit
    } : null;
    
    // Identify courses requiring payment if there's a limit
    let coursesRequiringPayment = [];
    let coursePaymentDetails = {};
    let totalCreditsRequiringPayment = 0;
    
    if (effectiveFreeCreditsLimit > 0) {
      // Pass the base limit to the function (it will apply overrides internally)
      coursePaymentDetails = await identifyCoursesRequiringPayment(
        studentEmailKey, 
        courseIds, 
        pricingConfig?.freeCreditsLimit || 0,
        schoolYear,
        studentType
      );
      
      // Extract courses that require payment and sum total credits needed
      for (const [courseId, details] of Object.entries(coursePaymentDetails)) {
        if (details.requiresPayment) {
          coursesRequiringPayment.push(parseInt(courseId));
          totalCreditsRequiringPayment += details.creditsRequiredToUnlock;
        }
      }
    }
    
    // Get paid credits for this student/year/type from profile
    const paidCreditsRef = db.ref(`students/${studentEmailKey}/profile/creditsPaid/${schoolYearKey}/${sanitizedType}`);
    const paidCreditsSnapshot = await paidCreditsRef.once('value');
    const totalPaidCredits = paidCreditsSnapshot.val() || 0;
    
    // Calculate effective paid credits required (after accounting for what's already paid and overrides)
    const effectivePaidCreditsRequired = Math.max(0, totals.nonExemptCredits - effectiveFreeCreditsLimit - totalPaidCredits);
    
    // Add summary fields with pricing info
    Object.assign(creditData, {
      ...totals,
      studentType,
      uid: uid || null,
      freeCreditsLimit: effectiveFreeCreditsLimit,
      baseFreeCreditsLimit: pricingConfig?.freeCreditsLimit || null,
      additionalFreeCredits: additionalFreeCredits,
      totalPaidCredits: totalPaidCredits,
      remainingFreeCredits: effectiveFreeCreditsLimit ? 
        Math.max(0, (effectiveFreeCreditsLimit - totals.nonExemptCredits)) : null,
      paidCreditsRequired: effectivePaidCreditsRequired,
      requiresPayment: effectivePaidCreditsRequired > 0,
      coursesRequiringPayment: coursesRequiringPayment,
      coursePaymentDetails: coursePaymentDetails,
      totalCreditsRequiringPayment: Math.max(0, totalCreditsRequiringPayment - totalPaidCredits),
      hasOverrides: hasCreditsOverride,
      ...(hasCreditsOverride && { creditsOverrideDetails }),
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

/**
 * Process a credit payment and update tracking
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} schoolYear - School year (e.g., "25/26")
 * @param {string} studentType - Student type
 * @param {number} creditsPurchased - Number of credits purchased
 * @param {Object} paymentDetails - Payment details from Stripe
 */
async function processCreditPayment(studentEmailKey, schoolYear, studentType, creditsPurchased, paymentDetails) {
  const db = admin.database();
  const schoolYearKey = formatSchoolYear(schoolYear);
  const sanitizedType = sanitizeStudentType(studentType);
  
  if (!schoolYearKey || !sanitizedType) {
    throw new Error('Invalid school year or student type');
  }
  
  const updates = {};
  
  // Update paid credits total in profile
  const paidCreditsPath = `students/${studentEmailKey}/profile/creditsPaid/${schoolYearKey}/${sanitizedType}`;
  const currentPaidRef = db.ref(paidCreditsPath);
  const currentPaidSnapshot = await currentPaidRef.once('value');
  const currentPaidCredits = currentPaidSnapshot.val() || 0;
  
  updates[paidCreditsPath] = currentPaidCredits + creditsPurchased;
  
  // Record the payment transaction in profile
  const paymentId = db.ref().push().key;
  updates[`students/${studentEmailKey}/profile/creditPayments/${paymentId}`] = {
    ...paymentDetails,
    creditsPurchased,
    schoolYear,
    studentType,
    timestamp: admin.database.ServerValue.TIMESTAMP
  };
  
  // Apply updates
  await db.ref().update(updates);
  
  // Trigger a recalculation to update all credit tracking
  await db.ref(`creditRecalculations/${studentEmailKey}/trigger`).set(Date.now());
  
  console.log(`✅ Processed credit payment for ${studentEmailKey}: ${creditsPurchased} credits for ${schoolYear} ${studentType}`);
  
  return {
    success: true,
    totalPaidCredits: currentPaidCredits + creditsPurchased,
    paymentId
  };
}

module.exports = {
  EXEMPT_COURSE_IDS,
  formatSchoolYear,
  getUidFromStudentKey,
  clearCreditsCache,
  sanitizeStudentType,
  isPerCoursePaymentStudent,
  checkCoursePaymentOverride,
  checkCreditLimitOverride,
  getEffectiveFreeCreditsLimit,
  checkCoursePaymentStatus,
  checkAndCarryOverCoursePayment,
  getPricingConfig,
  getCourseCredits,
  isExemptCourse,
  calculateCreditTotals,
  identifyCoursesRequiringPayment,
  updateCreditTracking,
  getStudentCredits,
  canRegisterForFree,
  recalculateCredits,
  processCreditPayment
};