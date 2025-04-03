// src/utils/sanitizeEmail.js

/**
 * Sanitizes an email address by:
 * 1. Converting to lowercase.
 * 2. Removing any whitespace.
 * 3. Replacing periods '.' with commas ','.
 * 
 * This ensures a consistent format for using emails as database keys.
 * 
 * @param {string} email - The email address to sanitize.
 * @returns {string} - The sanitized email address.
 */
export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return '';
  return email
    .toLowerCase() // Convert to lowercase
    .replace(/\s+/g, '') // Remove all whitespace
    .replace(/\./g, ','); // Replace '.' with ','
};

/**
 * Compares two email addresses for equality by:
 * 1. Sanitizing both emails using the sanitizeEmail function.
 * 2. Comparing the sanitized versions.
 * 
 * This ensures that emails match regardless of case differences or whitespace.
 * 
 * @param {string} email1 - The first email address to compare.
 * @param {string} email2 - The second email address to compare.
 * @returns {boolean} - Returns true if emails are equivalent after sanitization, else false.
 */
export const compareEmails = (email1, email2) => {
  return sanitizeEmail(email1) === sanitizeEmail(email2);
};

/**
 * Extracts the studentKey and courseId from a composite studentSummaryKey.
 * The studentSummaryKey follows the format: {studentKey}_{courseId}
 * 
 * This function properly handles cases where the studentKey itself contains underscores,
 * such as email addresses like "john_doe@example.com".
 * 
 * @param {string} compositeKey - The composite key in format {studentKey}_{courseId}
 * @returns {Object} - An object with studentKey and courseId properties
 */
export const parseStudentSummaryKey = (compositeKey) => {
  if (typeof compositeKey !== 'string') {
    return { studentKey: '', courseId: '' };
  }

  // Find the last underscore in the string to correctly split student key and course ID
  const lastUnderscoreIndex = compositeKey.lastIndexOf('_');
  
  // If no underscore found, return the whole string as studentKey
  if (lastUnderscoreIndex === -1) {
    return { studentKey: compositeKey, courseId: '' };
  }
  
  // Extract studentKey and courseId
  const studentKey = compositeKey.substring(0, lastUnderscoreIndex);
  const courseId = compositeKey.substring(lastUnderscoreIndex + 1);
  
  return { studentKey, courseId };
};