/**
 * Authentication and authorization utility functions for Firebase courses
 */

/**
 * Checks if the current user is authorized as a developer/admin for the course
 * @param {Object} currentUser - The authenticated user object
 * @param {Object} course - The course object containing courseDetails
 * @returns {boolean} - True if user is authorized as developer/admin
 */
export const isUserAuthorizedDeveloper = (currentUser, course) => {
  if (!currentUser?.email || !course?.courseDetails?.allowedEmails) {
    return false;
  }
  
  const userEmail = currentUser.email.toLowerCase();
  const allowedEmails = course.courseDetails.allowedEmails;
  
  // Check if user email is in the allowed emails array
  return allowedEmails.some(email => 
    email.toLowerCase() === userEmail
  );
};

/**
 * Checks if a user should bypass access restrictions (combines staff view, dev mode, and developer authorization)
 * @param {boolean} isStaffView - Whether the user is in staff view mode
 * @param {boolean} devMode - Whether the user is in developer mode
 * @param {Object} currentUser - The authenticated user object
 * @param {Object} course - The course object containing courseDetails
 * @returns {boolean} - True if user should bypass restrictions
 */
export const shouldBypassAllRestrictions = (isStaffView, devMode, currentUser, course) => {
  // Original staff/dev bypass
  if (isStaffView || devMode) {
    return true;
  }
  
  // New developer authorization bypass
  return isUserAuthorizedDeveloper(currentUser, course);
};

/**
 * Gets a descriptive reason for why restrictions are bypassed
 * @param {boolean} isStaffView - Whether the user is in staff view mode
 * @param {boolean} devMode - Whether the user is in developer mode
 * @param {Object} currentUser - The authenticated user object
 * @param {Object} course - The course object containing courseDetails
 * @returns {string} - Description of bypass reason
 */
export const getBypassReason = (isStaffView, devMode, currentUser, course) => {
  if (isStaffView) return 'Staff view mode';
  if (devMode) return 'Developer mode';
  if (isUserAuthorizedDeveloper(currentUser, course)) return 'Authorized developer';
  return 'Access control bypassed';
};