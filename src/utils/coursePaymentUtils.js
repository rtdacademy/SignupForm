// Utility functions for checking course payment status using the centralized credit tracking system

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
    return {
      isUnlocked,
      requiresPayment: !coursePaymentData?.isPaid,
      paymentType: 'course',
      paymentStatus: coursePaymentData?.paymentStatus || 'unpaid',
      paymentMethod: coursePaymentData?.paymentType || null
    };
  }

  return {
    isUnlocked: true,
    requiresPayment: false,
    paymentType: null
  };
};