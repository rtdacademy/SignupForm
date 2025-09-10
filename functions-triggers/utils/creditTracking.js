const admin = require('firebase-admin');

// Course IDs that are exempt from credit limits
const EXEMPT_COURSE_IDS = [4, 6]; // COM1255 and INF2020

// Stripe instance - will be initialized on first use
let stripeInstance = null;

/**
 * Get or initialize Stripe instance
 */
function getStripe() {
  if (!stripeInstance) {
    // Use the STRIPE_SECRET_KEY from environment (secrets in v2 functions)
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('Stripe secret key not configured - ensure STRIPE_SECRET_KEY is set in secrets');
    }
    stripeInstance = require('stripe')(stripeKey);
  }
  return stripeInstance;
}

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
 * Fetch payment status directly from Stripe
 * @param {Object} paymentData - Payment data from database containing IDs
 * @returns {Object} Fresh payment status from Stripe
 */
async function fetchPaymentStatusFromStripe(paymentData) {
  if (!paymentData) return null;
  
  try {
    const stripe = getStripe();
    
    // Handle subscription payments
    if (paymentData.subscription_id) {
      const subscriptionId = paymentData.subscription_id;
      
      // Fetch subscription details
      let subscription;
      let subscriptionExists = true;
      try {
        subscription = await stripe.subscriptions.retrieve(subscriptionId);
      } catch (error) {
        if (error.code === 'resource_missing' || error.statusCode === 404) {
          // Subscription doesn't exist in Stripe
          console.log(`Subscription ${subscriptionId} not found in Stripe`);
          subscriptionExists = false;
        } else {
          throw error;
        }
      }
      
      // Try to fetch invoices even if subscription doesn't exist
      let invoices;
      let invoicesExist = true;
      try {
        invoices = await stripe.invoices.list({
          subscription: subscriptionId,
          limit: 100,
          expand: ['data.charge'] // Expand charge data for more details
        });
      } catch (error) {
        console.log(`Error fetching invoices for subscription ${subscriptionId}:`, error.message);
        invoicesExist = false;
      }
      
      // If no subscription and no invoices exist in Stripe, return no_payment status
      if (!subscriptionExists && (!invoicesExist || !invoices?.data?.length)) {
        return {
          isPaid: false,
          status: 'no_payment',
          status_detailed: 'sub_no_stripe',
          paymentType: 'subscription',
          paymentCount: 0,
          invoices: [],
          subscription_id: subscriptionId,
          error: 'Subscription and invoices not found in Stripe',
          lastUpdated: Date.now()
        };
      }
      
      // Filter for truly paid invoices (not draft, not void, not uncollectible)
      // According to Stripe docs, only 'paid' status with amount_paid > 0 counts
      const paidInvoices = invoices?.data?.filter(inv => {
        // Must have 'paid' status
        if (inv.status !== 'paid') return false;
        
        // Must have actual payment amount (not $0 invoices)
        if (!inv.amount_paid || inv.amount_paid <= 0) return false;
        
        // Must not be a test/draft that somehow got marked paid
        if (inv.billing_reason === 'manual' && !inv.charge) return false;
        
        return true;
      }) || [];
      
      // Sort by payment date
      paidInvoices.sort((a, b) => {
        const aDate = a.status_transitions?.paid_at || a.created || 0;
        const bDate = b.status_transitions?.paid_at || b.created || 0;
        return bDate - aDate;
      });
      
      const paymentCount = paidInvoices.length;
      
      // ALL subscriptions are 3-month plans - no need to check type
      console.log(`Subscription ${subscriptionId}: ${paymentCount} paid invoices found`);
      
      // Determine status based on payment count
      // Simple logic: ALL subscriptions need exactly 3 payments to be complete
      let status;
      let status_detailed;
      
      if (paymentCount >= 3) {
        // Fully paid after 3 successful payments
        status = 'paid';
        status_detailed = 'sub_complete';
      } else if (paymentCount === 0) {
        // No payments at all
        if (subscription?.status === 'canceled') {
          status = 'canceled_unpaid'; // Canceled without any payment
          status_detailed = 'sub_canceled_0';
        } else {
          status = 'incomplete'; // Waiting for first payment
          status_detailed = 'sub_incomplete';
        }
      } else if (paymentCount < 3) {
        // Has 1 or 2 payments
        if (subscription?.status === 'canceled') {
          // Canceled before completing all 3 payments
          status = `canceled_partial_${paymentCount}`; // e.g., 'canceled_partial_2' for 2 payments
          status_detailed = `sub_canceled_${paymentCount}`;
        } else if (subscription?.status === 'past_due') {
          status = 'past_due'; // Payment failed, still trying
          status_detailed = `sub_past_due_${paymentCount}`;
        } else {
          status = 'active'; // Still collecting remaining payments
          status_detailed = `sub_active_${paymentCount}`;
        }
      }
      
      return {
        isPaid: status === 'paid' || (status === 'active' && paymentCount > 0),
        status: status,
        status_detailed: status_detailed,
        paymentType: 'subscription',
        paymentCount: paymentCount,
        invoices: paidInvoices.map(inv => ({
          id: inv.id,
          amount_paid: inv.amount_paid,
          paid_at: inv.status_transitions?.paid_at || inv.created,
          hosted_invoice_url: inv.hosted_invoice_url,
          invoice_pdf: inv.invoice_pdf
        })),
        subscription_id: subscriptionId,
        customer_id: subscription?.customer || paymentData.customer_id,
        lastUpdated: Date.now()
      };
    }
    
    // Handle one-time payments
    if (paymentData.payment_id) {
      // payment_id could be either a PaymentIntent ID or a Charge ID
      let paymentInfo = null;
      
      try {
        // Try as PaymentIntent first
        if (paymentData.payment_id.startsWith('pi_')) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentData.payment_id);
          paymentInfo = {
            isPaid: paymentIntent.status === 'succeeded',
            status: paymentIntent.status === 'succeeded' ? 'paid' : paymentIntent.status,
            status_detailed: paymentIntent.status === 'succeeded' ? 'one_time_paid' : 'one_time_unpaid',
            amount_paid: paymentIntent.amount,
            created: paymentIntent.created * 1000
          };
        } 
        // Try as Charge
        else if (paymentData.payment_id.startsWith('ch_')) {
          const charge = await stripe.charges.retrieve(paymentData.payment_id);
          paymentInfo = {
            isPaid: charge.status === 'succeeded' && charge.paid,
            status: charge.paid ? 'paid' : 'unpaid',
            status_detailed: charge.paid ? 'one_time_paid' : 'one_time_unpaid',
            amount_paid: charge.amount,
            receipt_url: charge.receipt_url,
            created: charge.created * 1000
          };
        }
      } catch (error) {
        if (error.code === 'resource_missing' || error.statusCode === 404) {
          // Payment doesn't exist in Stripe
          console.log(`Payment ${paymentData.payment_id} not found in Stripe`);
          return {
            isPaid: false,
            status: 'no_payment',
            status_detailed: 'one_time_no_stripe',
            paymentType: 'one_time',
            payment_id: paymentData.payment_id,
            error: 'Payment not found in Stripe',
            lastUpdated: Date.now()
          };
        }
        throw error;
      }
      
      if (paymentInfo) {
        return {
          ...paymentInfo,
          paymentType: 'one_time',
          payment_id: paymentData.payment_id,
          customer_id: paymentData.customer_id,
          lastUpdated: Date.now()
        };
      }
    }
    
    // If only customer_id is available, check for any payments
    if (paymentData.customer_id && !paymentData.subscription_id && !paymentData.payment_id) {
      // This is a fallback - ideally we should have more specific IDs
      console.log(`Only customer_id available for payment check: ${paymentData.customer_id}`);
      return null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching payment status from Stripe:', error);
    // Return null to fall back to database data
    return null;
  }
}

/**
 * Determine payment status based on trial period and schedule dates
 * @param {string} created - ISO date string when course was created
 * @param {string} scheduleStartDate - ISO date string when course starts
 * @param {number} trialPeriodDays - Number of trial days (default 10)
 * @returns {string} Payment status detailed value
 */
function determineTrialPaymentStatus(created, scheduleStartDate, trialPeriodDays = 10) {
  const now = new Date();
  const createdDate = new Date(created);
  const trialEndDate = new Date(createdDate);
  trialEndDate.setDate(trialEndDate.getDate() + trialPeriodDays);
  const startDate = new Date(scheduleStartDate);
  
  // Check if we're still in trial period
  if (now <= trialEndDate) {
    return 'trial_period';
  } 
  // Check if trial ended but course hasn't started
  else if (now < startDate) {
    return 'unpaid_before_start_date';
  } 
  // Trial ended and course has started
  else {
    return 'unpaid';
  }
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
        status_detailed: 'manual_override',
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
  let paymentData = snapshot.val();
  
  // If we have payment data with Stripe IDs, fetch fresh data from Stripe
  if (paymentData && (paymentData.subscription_id || paymentData.payment_id)) {
    const stripeData = await fetchPaymentStatusFromStripe(paymentData);
    
    if (stripeData) {
      // Update database with fresh Stripe data
      const updates = {
        status: stripeData.status,
        status_detailed: stripeData.status_detailed,
        last_updated: stripeData.lastUpdated,
        last_stripe_sync: stripeData.lastUpdated
      };
      
      // Add subscription-specific fields
      if (stripeData.paymentType === 'subscription') {
        updates.payment_count = stripeData.paymentCount;
        updates.invoices = stripeData.invoices;
        updates.successful_invoice_ids = stripeData.invoices.map(inv => inv.id);
        
        // ALL subscriptions are 3-month plans
        // Mark as paid if 3 payments completed
        if (stripeData.paymentCount >= 3) {
          updates.status = 'paid';
          updates.final_payment_count = stripeData.paymentCount;
          updates.completed_at = Date.now();
          
          console.log(`Marking subscription ${paymentData.subscription_id} as fully paid with ${stripeData.paymentCount} payments`);
        } else if (stripeData.status) {
          // Use the status from Stripe (could be canceled_partial_1, canceled_partial_2, etc.)
          updates.status = stripeData.status;
        }
      }
      
      // Add one-time payment fields
      if (stripeData.paymentType === 'one_time') {
        updates.amount_paid = stripeData.amount_paid;
        if (stripeData.receipt_url) {
          updates.receipt_url = stripeData.receipt_url;
        }
      }
      
      // Update the database with fresh data
      await paymentRef.update(updates);
      
      // Also update the student's payment_status node
      const studentPaymentStatusRef = db.ref(`students/${studentEmailKey}/courses/${courseId}/payment_status`);
      await studentPaymentStatusRef.update({
        status: stripeData.status,
        status_detailed: stripeData.status_detailed,
        last_checked: stripeData.lastUpdated,
        payment_count: stripeData.paymentCount || null,
        last_stripe_sync: stripeData.lastUpdated
      });
      
      // Use fresh Stripe data for the return value
      paymentData = { ...paymentData, ...updates };
    }
  }
  
  // For per-course payment students (Adult/International), validate payment type
  if (studentType && isPerCoursePaymentStudent(studentType)) {
    // Only accept per-course payments for Adult/International students
    // Ignore credit-based payments from when they might have been a different student type
    if (paymentData?.type === 'credits') {
      // Check for trial period for unpaid Adult/International students
      const summaryKey = `${studentEmailKey}_${courseId}`;
      const summaryRef = db.ref(`studentCourseSummaries/${summaryKey}`);
      const summarySnapshot = await summaryRef.once('value');
      const summaryData = summarySnapshot.val();
      
      let detailedStatus = 'unpaid';
      if (summaryData?.Created && summaryData?.ScheduleStartDate) {
        detailedStatus = determineTrialPaymentStatus(
          summaryData.Created,
          summaryData.ScheduleStartDate,
          10 // Trial period days
        );
      }
      
      return {
        isPaid: false,
        paymentType: null,
        status: 'unpaid',
        status_detailed: detailedStatus,
        paymentMethod: null,
        lastUpdated: null
      };
    }
    // Accept per-course payments
    if (paymentData?.type === 'per_course' && paymentData?.status === 'paid') {
      return {
        isPaid: true,
        paymentType: 'per_course',
        status: 'paid',
        status_detailed: paymentData?.status_detailed || 'paid',
        paymentMethod: paymentData?.payment_method || null,
        lastUpdated: paymentData?.last_updated || null
      };
    }
    
    // No payment data found - check for trial period
    const summaryKey = `${studentEmailKey}_${courseId}`;
    const summaryRef = db.ref(`studentCourseSummaries/${summaryKey}`);
    const summarySnapshot = await summaryRef.once('value');
    const summaryData = summarySnapshot.val();
    
    let detailedStatus = 'unpaid';
    if (summaryData?.Created && summaryData?.ScheduleStartDate) {
      detailedStatus = determineTrialPaymentStatus(
        summaryData.Created,
        summaryData.ScheduleStartDate,
        10 // Trial period days
      );
    }
    
    // Return unpaid with appropriate trial status
    return {
      isPaid: false,
      paymentType: null,
      status: 'unpaid',
      status_detailed: detailedStatus,
      paymentMethod: null,
      lastUpdated: null
    };
  }
  
  // For credit-based students or when student type not provided, return payment data as-is
  // But still check for trial periods if no payment data exists
  if (!paymentData || (!paymentData.status && !paymentData.status_detailed)) {
    // Try to get student type and check if they should have trial period
    const summaryKey = `${studentEmailKey}_${courseId}`;
    const summaryRef = db.ref(`studentCourseSummaries/${summaryKey}`);
    const summarySnapshot = await summaryRef.once('value');
    const summaryData = summarySnapshot.val();
    
    // Check if this is an Adult/International student without payment
    if (summaryData?.StudentType_Value === 'Adult Student' || 
        summaryData?.StudentType_Value === 'International Student') {
      let detailedStatus = 'unpaid';
      if (summaryData?.Created && summaryData?.ScheduleStartDate) {
        detailedStatus = determineTrialPaymentStatus(
          summaryData.Created,
          summaryData.ScheduleStartDate,
          10 // Trial period days
        );
      }
      
      return {
        isPaid: false,
        paymentType: null,
        status: 'unpaid',
        status_detailed: detailedStatus,
        paymentMethod: null,
        lastUpdated: null
      };
    }
  }
  
  return {
    isPaid: paymentData?.status === 'paid' || paymentData?.status === 'active',
    paymentType: paymentData?.type || null,
    status: paymentData?.status || 'unpaid',
    status_detailed: paymentData?.status_detailed || paymentData?.status || 'unpaid',
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
        paymentStatusDetailed: paymentStatus.status_detailed,
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
 * Update payment status in studentCourseSummaries for a specific course
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} courseId - Course ID
 * @param {string} studentType - Student type
 * @param {Object} creditData - Credit tracking data for the student
 */
async function updateStudentCourseSummaryPaymentStatus(studentEmailKey, courseId, studentType, creditData) {
  const db = admin.database();
  
  // Determine the payment status based on student type and credit data
  let status = 'free';
  let status_detailed = 'credit_free'; // Default detailed status
  let details = {
    studentType,
    lastUpdated: admin.database.ServerValue.TIMESTAMP
  };
  let creditsSummary = null;
  
  // Check if this is a per-course payment student (Adult or International)
  if (isPerCoursePaymentStudent(studentType)) {
    // Per-course payment model
    details.paymentModel = 'per_course';
    
    // Check if this specific course is in the credit data
    if (creditData?.courses && creditData.courses[courseId]) {
      const courseInfo = creditData.courses[courseId];
      
      if (courseInfo.isPaid) {
        status = courseInfo.carriedOver ? 'carried_over' : 'paid';
        // Set detailed status based on payment type
        if (courseInfo.carriedOver) {
          status_detailed = 'carried_over';
        } else if (courseInfo.paymentStatusDetailed) {
          // Use the detailed status if available
          status_detailed = courseInfo.paymentStatusDetailed;
        } else if (courseInfo.paymentType === 'subscription') {
          // Fallback: For subscription, check the actual payment status
          const paymentStatus = courseInfo.paymentStatus;
          if (paymentStatus === 'paid') {
            status_detailed = 'sub_complete';
          } else if (paymentStatus?.startsWith('active')) {
            // Extract payment count from status like 'active' 
            // Since we don't have count in the creditData, default to active_1
            status_detailed = 'sub_active_1';
          } else if (paymentStatus?.includes('canceled_partial')) {
            const match = paymentStatus.match(/canceled_partial_(\d+)/);
            status_detailed = match ? `sub_canceled_${match[1]}` : 'sub_canceled_1';
          } else {
            status_detailed = 'sub_complete'; // Default for paid subscriptions
          }
        } else {
          status_detailed = 'one_time_paid';
        }
        details.coursePaid = true;
        details.paymentMethod = courseInfo.paymentType || 'unknown';
        
        if (courseInfo.carriedOver) {
          details.carriedOverFrom = courseInfo.carriedOver.from;
        }
      } else {
        status = 'requires_payment';
        // Preserve the detailed status from the course data if available
        // But also check if we need to preserve trial period statuses
        if (courseInfo.paymentStatusDetailed) {
          status_detailed = courseInfo.paymentStatusDetailed;
        } else {
          // For Adult/International students, check current database for trial statuses
          const summaryKey = `${studentEmailKey}_${courseId}`;
          const currentStatusRef = db.ref(`studentCourseSummaries/${summaryKey}/payment_status_detailed`);
          const currentStatusSnapshot = await currentStatusRef.once('value');
          const currentDetailedStatus = currentStatusSnapshot.val();
          
          // Preserve trial period statuses if they exist
          if (currentDetailedStatus === 'trial_period' || 
              currentDetailedStatus === 'unpaid_before_start_date') {
            status_detailed = currentDetailedStatus;
          } else {
            status_detailed = courseInfo.paymentStatus || 'unpaid';
          }
        }
        details.coursePaid = false;
        details.requiresPayment = true;
      }
    } else {
      // Course not found in tracking, check for trial period status
      // For Adult/International students, we need to preserve trial period statuses
      status = 'requires_payment';
      
      // Check if we should determine trial period status
      if (isPerCoursePaymentStudent(studentType)) {
        // Get the current detailed status from the database to preserve trial statuses
        const summaryKey = `${studentEmailKey}_${courseId}`;
        const currentStatusRef = db.ref(`studentCourseSummaries/${summaryKey}/payment_status_detailed`);
        const currentStatusSnapshot = await currentStatusRef.once('value');
        const currentDetailedStatus = currentStatusSnapshot.val();
        
        // Preserve trial period statuses if they exist
        if (currentDetailedStatus === 'trial_period' || 
            currentDetailedStatus === 'unpaid_before_start_date') {
          status_detailed = currentDetailedStatus;
        } else {
          // Otherwise default to unpaid or requires_payment
          status_detailed = 'unpaid';
        }
      } else {
        status_detailed = 'requires_payment';
      }
      
      details.coursePaid = false;
      details.requiresPayment = true;
    }
    
    // Check for overrides
    if (creditData?.hasOverrides) {
      details.hasOverrides = true;
      if (creditData.overridesApplied) {
        const courseOverride = creditData.overridesApplied.find(o => o.courseId === courseId);
        if (courseOverride) {
          status = 'override';
          status_detailed = 'manual_override';
          details.overrideDetails = courseOverride.details;
        }
      }
    }
    
  } else if (creditData) {
    // Credit-based payment model (Non-Primary, Home Education, etc.)
    details.paymentModel = 'credit_based';
    
    // Always add creditsSummary for Non-Primary and Home Education students
    if (studentType === 'Non-Primary' || studentType === 'Home Education') {
      creditsSummary = {
        totalCredits: creditData.totalCredits || 0,
        nonExemptCredits: creditData.nonExemptCredits || 0,
        exemptCredits: creditData.exemptCredits || 0,
        freeCreditsLimit: creditData.freeCreditsLimit || 0,
        creditsUsed: creditData.nonExemptCredits || 0,
        creditsRemaining: Math.max(0, (creditData.freeCreditsLimit || 0) - (creditData.nonExemptCredits || 0)),
        totalPaidCredits: creditData.totalPaidCredits || 0
      };
    }
    
    // Check if course is exempt
    const courseIdInt = parseInt(courseId);
    if (isExemptCourse(courseIdInt)) {
      status = 'free';
      status_detailed = 'exempt';
      details.isExempt = true;
    } else {
      // Get course payment details
      const coursePaymentDetails = creditData.coursePaymentDetails?.[courseId];
      
      if (coursePaymentDetails) {
        if (coursePaymentDetails.requiresPayment) {
          // Check if student has paid credits
          const totalPaidCredits = creditData.totalPaidCredits || 0;
          const creditsRequired = coursePaymentDetails.creditsRequiredToUnlock || 0;
          
          if (totalPaidCredits >= creditsRequired) {
            status = 'paid';
            status_detailed = 'credit_paid';
            details.creditsRequired = creditsRequired;
            details.creditsPaid = totalPaidCredits;
          } else if (totalPaidCredits > 0) {
            status = 'partial';
            status_detailed = 'credit_partial';
            details.creditsRequired = creditsRequired;
            details.creditsPaid = totalPaidCredits;
            details.creditsNeeded = creditsRequired - totalPaidCredits;
          } else {
            status = 'requires_payment';
            status_detailed = 'credit_requires_payment';
            details.creditsRequired = creditsRequired;
            details.requiresPayment = true;
          }
        } else {
          status = 'free';
          status_detailed = 'credit_free';
          details.withinFreeLimit = true;
        }
      } else {
        // Default to free if no payment details
        status = 'free';
        status_detailed = 'credit_free';
      }
      
      // Add credit usage details
      if (creditData.freeCreditsLimit !== undefined) {
        details.freeCreditsLimit = creditData.freeCreditsLimit;
        details.creditsUsed = creditData.nonExemptCredits || 0;
        details.creditsRemaining = Math.max(0, creditData.remainingFreeCredits || 0);
      }
      
      // Check for credit limit overrides
      if (creditData.hasOverrides && creditData.creditsOverrideDetails) {
        details.hasOverrides = true;
        details.overrideDetails = creditData.creditsOverrideDetails;
        if (creditData.additionalFreeCredits > 0) {
          if (status === 'requires_payment') {
            status = 'override';
            status_detailed = 'credit_override';
          }
        }
      }
    }
  } else {
    // No credit data available, default to free
    details.paymentModel = 'free';
  }
  
  // Build the summary key
  const summaryKey = `${studentEmailKey}_${courseId}`;
  
  // Update the payment status in studentCourseSummaries
  // Set payment_status as a string and details/creditsSummary as separate fields
  const updates = {};
  updates[`studentCourseSummaries/${summaryKey}/payment_status`] = status;
  updates[`studentCourseSummaries/${summaryKey}/payment_status_detailed`] = status_detailed;
  updates[`studentCourseSummaries/${summaryKey}/payment_details`] = details;
  
  // Add creditsSummary as a separate field if it exists (for Non-Primary and Home Education)
  if (creditsSummary) {
    updates[`studentCourseSummaries/${summaryKey}/credits_summary`] = creditsSummary;
  }
  
  await db.ref().update(updates);
  
  // Return the structured data
  return {
    status,
    status_detailed,
    details,
    ...(creditsSummary && { creditsSummary })
  };
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
    const creditData = await updateCreditTracking(studentEmailKey, schoolYear, studentType, coursesByType[studentType]);
    
    // Update payment status for each course
    for (const courseId of coursesByType[studentType]) {
      await updateStudentCourseSummaryPaymentStatus(studentEmailKey, courseId, studentType, creditData);
    }
    
    return creditData;
  }
  
  // Otherwise, update all types found
  const results = {};
  for (const [type, courseIds] of Object.entries(coursesByType)) {
    if (type !== 'Unknown') {
      results[type] = await updateCreditTracking(studentEmailKey, schoolYear, type, courseIds);
      
      // Update payment status for each course of this type
      for (const courseId of courseIds) {
        await updateStudentCourseSummaryPaymentStatus(studentEmailKey, courseId, type, results[type]);
      }
    }
  }
  
  return results;
}

/**
 * Update payment status for trial period courses
 * Used by scheduled function to update statuses based on trial period
 * @param {string} studentEmailKey - Sanitized email key
 * @param {string} courseId - Course ID
 * @param {string} newStatus - New payment status detailed value
 * @returns {Promise<boolean>} Success indicator
 */
async function updateTrialPaymentStatus(studentEmailKey, courseId, newStatus) {
  const db = admin.database();
  const summaryKey = `${studentEmailKey}_${courseId}`;
  
  try {
    const updates = {};
    updates[`studentCourseSummaries/${summaryKey}/payment_status_detailed`] = newStatus;
    updates[`studentCourseSummaries/${summaryKey}/payment_details/lastTrialCheck`] = admin.database.ServerValue.TIMESTAMP;
    
    await db.ref().update(updates);
    
    console.log(`✅ Updated trial payment status for ${summaryKey} to ${newStatus}`);
    return true;
  } catch (error) {
    console.error(`❌ Error updating trial payment status for ${summaryKey}:`, error);
    return false;
  }
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
  updateStudentCourseSummaryPaymentStatus,
  updateTrialPaymentStatus,
  getStudentCredits,
  canRegisterForFree,
  recalculateCredits,
  processCreditPayment
};