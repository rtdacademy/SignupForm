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
  