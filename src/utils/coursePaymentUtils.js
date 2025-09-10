// Utility functions for checking course payment status using the centralized credit tracking system
import { getTrialPeriodDays } from '../config/paymentConfig';

/**
 * Get the current school year in YY_YY format
 */
export const getCurrentSchoolYear = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const startYear = month >= 9 ? year : year - 1;
  return `${startYear.toString().substr(-2)}/${(startYear + 1).toString().substr(-2)}`.replace('/', '_');
};

/**
 * Map display student type names to sanitized database keys
 */
const getStudentTypeKey = (studentType) => {
  const typeMapping = {
    'Non-Primary': 'nonPrimaryStudents',
    'Home Education': 'homeEducationStudents',
    'Summer School': 'summerSchoolStudents',
    'Adult Student': 'adultStudents',
    'International Student': 'internationalStudents'
  };
  return typeMapping[studentType] || null;
};

/**
 * Calculate trial period status for a course
 * @param {Object} course - The course object with Created field
 * @param {string} studentType - The student type
 * @returns {Object} - Trial status information
 */
export const calculateTrialStatus = (course, studentType) => {
  // Only check trial for adult and international students
  if (studentType !== 'Adult Student' && studentType !== 'International Student') {
    return { isInTrial: false, trialDaysRemaining: 0, trialEndDate: null };
  }

  // Get trial period days from config
  const trialDays = getTrialPeriodDays(studentType);
  
  if (!trialDays || trialDays === 0) {
    return { isInTrial: false, trialDaysRemaining: 0, trialEndDate: null };
  }

  // Get course creation date
  const createdDate = course.Created ? new Date(course.Created) : null;
  
  if (!createdDate) {
    // If no creation date, assume course was just created (start trial)
    const now = new Date();
    const trialEndDate = new Date(now.getTime() + (trialDays * 24 * 60 * 60 * 1000));
    
    return {
      isInTrial: true,
      trialDaysRemaining: trialDays,
      trialEndDate: trialEndDate.toISOString()
    };
  }

  // Calculate trial end date
  // Parse the ISO string and add trial days worth of milliseconds
  const createdTime = new Date(createdDate).getTime();
  const trialDurationMs = trialDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
  const trialEndTime = createdTime + trialDurationMs;
  const trialEndDate = new Date(trialEndTime);

  // Get current time for comparison
  const now = new Date();
  const nowTime = now.getTime();
  
  // Check if we're still in trial period
  const isInTrial = nowTime < trialEndTime;
  
  // Calculate days remaining
  // Use floor + 1 to ensure "last day" shows as 1 day remaining, not 0
  const msRemaining = trialEndTime - nowTime;
  const daysRemaining = isInTrial 
    ? Math.max(1, Math.ceil(msRemaining / (1000 * 60 * 60 * 24)))
    : 0;

  return {
    isInTrial,
    trialDaysRemaining: daysRemaining,
    trialEndDate: trialEndDate.toISOString(),
    trialExpired: !isInTrial && createdDate !== null
  };
};

/**
 * Check if a course is unlocked (payment complete or not required)
 * @param {Object} course - The course object
 * @param {Object} profile - The student profile with creditsPerStudent data
 * @returns {boolean} - True if course is unlocked, false if payment required
 */
export const isCourseUnlocked = (course, profile) => {
  // Always unlock required courses
  if (course.isRequiredCourse) {
    return true;
  }

  // If no profile or credit data, default to unlocked
  if (!profile?.creditsPerStudent) {
    return true;
  }

  const schoolYear = getCurrentSchoolYear();
  const studentType = course.StudentType?.Value;
  const courseId = course.CourseID || course.id;

  // If no student type, default to unlocked
  if (!studentType) {
    return true;
  }

  const sanitizedType = getStudentTypeKey(studentType);
  
  // If student type doesn't map to payment system, default to unlocked
  if (!sanitizedType) {
    return true;
  }

  const creditData = profile.creditsPerStudent[schoolYear]?.[sanitizedType];
  
  // If no credit data for this year/type, default to unlocked
  if (!creditData) {
    return true;
  }

  // For credit-based payment systems (Non-Primary, Home Education, Summer School)
  if (sanitizedType === 'nonPrimaryStudents' || 
      sanitizedType === 'homeEducationStudents' || 
      sanitizedType === 'summerSchoolStudents') {
    
    // Check if this specific course requires payment
    const coursePaymentDetails = creditData.coursePaymentDetails?.[courseId];
    
    // If no payment details for this course, it's unlocked
    if (!coursePaymentDetails) {
      return true;
    }
    
    // Course is locked if it requires payment
    return !coursePaymentDetails.requiresPayment;
  }

  // For course-based payment systems (Adult, International)
  if (sanitizedType === 'adultStudents' || sanitizedType === 'internationalStudents') {
    // First check if course is in trial period
    const trialStatus = calculateTrialStatus(course, studentType);
    if (trialStatus.isInTrial) {
      return true; // Unlock during trial period
    }
    
    // Check if this specific course is paid
    const coursePaymentData = creditData.courses?.[courseId];
    
    // If no payment data for this course, default to locked (payment required)
    if (!coursePaymentData) {
      return false;
    }
    
    // Course is unlocked if it's paid
    return coursePaymentData.isPaid === true;
  }

  // Default to unlocked for any unhandled cases
  return true;
};

/**
 * Get payment status details for a course
 * @param {Object} course - The course object
 * @param {Object} profile - The student profile with creditsPerStudent data
 * @returns {Object} - Payment status details
 */
export const getCoursePaymentStatus = (course, profile) => {
  const isUnlocked = isCourseUnlocked(course, profile);
  const schoolYear = getCurrentSchoolYear();
  const studentType = course.StudentType?.Value;
  const courseId = course.CourseID || course.id;
  const sanitizedType = getStudentTypeKey(studentType);
  
  if (!sanitizedType || !profile?.creditsPerStudent?.[schoolYear]?.[sanitizedType]) {
    return {
      isUnlocked: true,
      requiresPayment: false,
      paymentType: null
    };
  }

  const creditData = profile.creditsPerStudent[schoolYear][sanitizedType];

  // For credit-based systems
  if (sanitizedType === 'nonPrimaryStudents' || 
      sanitizedType === 'homeEducationStudents' || 
      sanitizedType === 'summerSchoolStudents') {
    
    const coursePaymentDetails = creditData.coursePaymentDetails?.[courseId];
    return {
      isUnlocked,
      requiresPayment: coursePaymentDetails?.requiresPayment || false,
      paymentType: 'credit',
      creditsRequired: coursePaymentDetails?.creditsRequiredToUnlock || 0
    };
  }

  // For course-based systems
  if (sanitizedType === 'adultStudents' || sanitizedType === 'internationalStudents') {
    const coursePaymentData = creditData.courses?.[courseId];
    const trialStatus = calculateTrialStatus(course, studentType);
    
    return {
      isUnlocked,
      requiresPayment: !coursePaymentData?.isPaid && !trialStatus.isInTrial,
      paymentType: 'course',
      paymentStatus: coursePaymentData?.paymentStatus || 'unpaid',
      paymentMethod: coursePaymentData?.paymentType || null,
      // Add trial information
      isInTrial: trialStatus.isInTrial,
      trialDaysRemaining: trialStatus.trialDaysRemaining,
      trialEndDate: trialStatus.trialEndDate,
      trialExpired: trialStatus.trialExpired
    };
  }

  return {
    isUnlocked: true,
    requiresPayment: false,
    paymentType: null
  };
};