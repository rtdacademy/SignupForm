/**
 * Timezone utility functions to handle Edmonton timezone conversions
 * for dates stored as YYYY-MM-DD strings in Firebase
 */

// Edmonton timezone identifier
const EDMONTON_TIMEZONE = 'America/Edmonton';

/**
 * Convert a date string to a Date object
 * This interprets the date as midnight in Edmonton timezone
 * 
 * @param {string} dateString - Date in YYYY-MM-DD format or ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)
 * @returns {Date} Date object representing midnight in Edmonton on the specified date
 */
export const toEdmontonDate = (dateString) => {
  if (!dateString) return null;
  
  // Check if the string is in ISO format (contains T)
  if (dateString.includes('T')) {
    // For ISO string format (like "2026-01-19T07:00:00.000Z"), use the Date constructor directly
    return new Date(dateString);
  } else {
    // For YYYY-MM-DD format
    const [year, month, day] = dateString.split('-').map(Number);
    
    // Create a date at the specified day with time set to midnight
    const date = new Date(year, month - 1, day, 0, 0, 0, 0);
    return date;
  }
};

/**
 * Format a Date object to YYYY-MM-DD string
 * Uses the date components from the local timezone
 * 
 * @param {Date} date - Date object
 * @returns {string} Date string in YYYY-MM-DD format
 */
export const toDateString = (date) => {
  if (!date) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date for display
 * 
 * @param {string|Date} date - Date string in YYYY-MM-DD format or Date object
 * @returns {string} Formatted date string
 */
export const formatDateForDisplay = (date) => {
  if (!date) return '';
  
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? toEdmontonDate(date) : date;
  
  // Format with month name
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return dateObj.toLocaleDateString('en-US', options);
};

/**
 * Check if a date is in summer (July or August)
 *
 * @param {string|Date} date - Date string in YYYY-MM-DD format or Date object
 * @returns {boolean} True if the date is in July or August
 */
export const isDateInSummer = (date) => {
  if (!date) return false;
  
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? toEdmontonDate(date) : date;
  
  const month = dateObj.getMonth();
  return month === 6 || month === 7; // July (6) or August (7)
};

/**
 * Calculate age based on birth date
 *
 * @param {string|Date} birthDate - Birth date string in YYYY-MM-DD format or Date object
 * @param {Date} referenceDate - Date to calculate age at (defaults to current date)
 * @returns {number} Age in years
 */
export const calculateAge = (birthDate, referenceDate = new Date()) => {
  if (!birthDate) return 0;
  
  // Convert string to Date if necessary
  const birthDateObj = typeof birthDate === 'string' ? toEdmontonDate(birthDate) : birthDate;
  
  let age = referenceDate.getFullYear() - birthDateObj.getFullYear();
  const m = referenceDate.getMonth() - birthDateObj.getMonth();
  
  if (m < 0 || (m === 0 && referenceDate.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if two dates cross a school year boundary (July/August to September)
 *
 * @param {string|Date} startDate - Start date string in YYYY-MM-DD format or Date object
 * @param {string|Date} endDate - End date string in YYYY-MM-DD format or Date object
 * @returns {boolean} True if the dates cross a school year boundary
 */
export const crossesSchoolYearBoundary = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  // Convert strings to Date objects if necessary
  const startDateObj = typeof startDate === 'string' ? toEdmontonDate(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? toEdmontonDate(endDate) : endDate;
  
  // If start date is in summer (July or August)
  if (startDateObj.getMonth() === 6 || startDateObj.getMonth() === 7) {
    // And end date is in September or later of the same calendar year
    if (endDateObj.getMonth() >= 8 && endDateObj.getFullYear() === startDateObj.getFullYear()) {
      return true;
    }
  }
  
  return false;
};

/**
 * Calculate duration between two dates as a user-friendly string
 *
 * @param {string|Date} startDate - Start date string in YYYY-MM-DD format or Date object
 * @param {string|Date} endDate - End date string in YYYY-MM-DD format or Date object
 * @returns {string} Duration as a string (e.g. "3 months and 5 days")
 */
export const calculateDuration = (startDate, endDate) => {
  if (!startDate || !endDate) return '';
  
  // Convert strings to Date objects if necessary
  const startDateObj = typeof startDate === 'string' ? toEdmontonDate(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? toEdmontonDate(endDate) : endDate;
  
  const diffTime = Math.abs(endDateObj - startDateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const months = Math.floor(diffDays / 30);
  const remainingDays = diffDays % 30;
  
  let duration = '';
  if (months > 0) {
    duration += `${months} month${months > 1 ? 's' : ''}`;
    if (remainingDays > 0) {
      duration += ` and ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
  } else {
    duration = `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  }
  
  return duration;
};

/**
 * Calculate the minimum completion date based on start date and minimum completion months
 * 
 * @param {string|Date} startDate - Start date string in YYYY-MM-DD format or Date object
 * @param {number} minCompletionMonths - Minimum number of months required to complete the course
 * @returns {Date} Date object representing the minimum completion date
 */
export const getMinCompletionDate = (startDate, minCompletionMonths) => {
  if (!startDate || minCompletionMonths === undefined || minCompletionMonths === null) return null;
  
  // Convert string to Date if necessary
  const startDateObj = typeof startDate === 'string' ? toEdmontonDate(startDate) : startDate;
  
  // Calculate whole months and remaining days
  const wholeMonths = Math.floor(minCompletionMonths);
  const fractionalMonths = minCompletionMonths - wholeMonths;
  const daysInFractionalMonth = Math.ceil(fractionalMonths * 30); // Approximate 30 days per month
  
  // Create a new date by adding months and days
  const minEndDate = new Date(startDateObj);
  minEndDate.setMonth(minEndDate.getMonth() + wholeMonths);
  minEndDate.setDate(minEndDate.getDate() + daysInFractionalMonth);
  
  return minEndDate;
};

/**
 * Calculate the recommended completion date based on start date and recommended completion months
 * 
 * @param {string|Date} startDate - Start date string in YYYY-MM-DD format or Date object
 * @param {number} recommendedCompletionMonths - Recommended number of months to complete the course
 * @returns {Date} Date object representing the recommended completion date
 */
export const getRecommendedCompletionDate = (startDate, recommendedCompletionMonths) => {
  if (!startDate || recommendedCompletionMonths === undefined || recommendedCompletionMonths === null) return null;
  
  // Convert string to Date if necessary
  const startDateObj = typeof startDate === 'string' ? toEdmontonDate(startDate) : startDate;
  
  // Calculate whole months and remaining days
  const wholeMonths = Math.floor(recommendedCompletionMonths);
  const fractionalMonths = recommendedCompletionMonths - wholeMonths;
  const daysInFractionalMonth = Math.ceil(fractionalMonths * 30); // Approximate 30 days per month
  
  // Create a new date by adding months and days
  const recommendedEndDate = new Date(startDateObj);
  recommendedEndDate.setMonth(recommendedEndDate.getMonth() + wholeMonths);
  recommendedEndDate.setDate(recommendedEndDate.getDate() + daysInFractionalMonth);
  
  return recommendedEndDate;
};

/**
 * Get a date that is one month after the input date
 *
 * @param {string|Date} date - Date string in YYYY-MM-DD format or Date object
 * @returns {Date} Date object one month after the input date
 */
export const getMinEndDate = (date) => {
  if (!date) return null;
  
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? toEdmontonDate(date) : date;
  
  const result = new Date(dateObj);
  result.setMonth(result.getMonth() + 1);
  return result;
};

/**
 * Calculate hours per week based on start date, end date, and total hours
 *
 * @param {string|Date} startDate - Start date string in YYYY-MM-DD format or Date object
 * @param {string|Date} endDate - End date string in YYYY-MM-DD format or Date object
 * @param {number} totalHours - Total hours to be spent
 * @returns {string} Hours per week as a string with one decimal place
 */
export const calculateHoursPerWeek = (startDate, endDate, totalHours) => {
  if (!startDate || !endDate || !totalHours) return null;
  
  // Convert strings to Date objects if necessary
  const startDateObj = typeof startDate === 'string' ? toEdmontonDate(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? toEdmontonDate(endDate) : endDate;
  
  const diffTime = Math.abs(endDateObj - startDateObj);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffWeeks = diffDays / 7;
  
  const hoursPerWeek = totalHours / diffWeeks;
  return hoursPerWeek.toFixed(1); // Round to 1 decimal place
};

/**
 * Format a diploma date object for display
 *
 * @param {Object} dateObj - Object containing diploma date information
 * @returns {string} Formatted diploma date string
 */
export const formatDiplomaDate = (dateObj) => {
  if (!dateObj || !dateObj.date) return '';
  
  const date = toEdmontonDate(dateObj.date);
  return `${dateObj.month} ${date.getFullYear()} (${dateObj.displayDate})`;
};

/**
 * Check if a date range is valid based on constraints
 * 
 * @param {string|Date} startDate - Start date string in YYYY-MM-DD format or Date object
 * @param {string|Date} endDate - End date string in YYYY-MM-DD format or Date object
 * @param {Object} constraints - Object containing date range constraints
 * @param {Date} [constraints.minStartDate] - Minimum allowed start date
 * @param {Date} [constraints.maxStartDate] - Maximum allowed start date
 * @param {Date} [constraints.minEndDate] - Minimum allowed end date
 * @param {Date} [constraints.maxEndDate] - Maximum allowed end date
 * @param {number} [constraints.minCompletionMonths] - Minimum number of months required between start and end
 * @returns {Object} Object with validity status and error message if invalid
 */
export const validateDateRange = (startDate, endDate, constraints) => {
  if (!startDate || !endDate) {
    return { isValid: false, message: 'Both start and end dates are required' };
  }
  
  // Convert strings to Date objects if necessary
  const startDateObj = typeof startDate === 'string' ? toEdmontonDate(startDate) : startDate;
  const endDateObj = typeof endDate === 'string' ? toEdmontonDate(endDate) : endDate;
  
  // Check start date minimum
  if (constraints.minStartDate && startDateObj < constraints.minStartDate) {
    return {
      isValid: false,
      message: `Start date must be on or after ${formatDateForDisplay(constraints.minStartDate)}`
    };
  }
  
  // Check start date maximum
  if (constraints.maxStartDate && startDateObj > constraints.maxStartDate) {
    return {
      isValid: false,
      message: `Start date must be on or before ${formatDateForDisplay(constraints.maxStartDate)}`
    };
  }
  
  // Check end date minimum
  if (constraints.minEndDate && endDateObj < constraints.minEndDate) {
    return {
      isValid: false,
      message: `End date must be on or after ${formatDateForDisplay(constraints.minEndDate)}`
    };
  }
  
  // Check end date maximum
  if (constraints.maxEndDate && endDateObj > constraints.maxEndDate) {
    return {
      isValid: false,
      message: `End date must be on or before ${formatDateForDisplay(constraints.maxEndDate)}`
    };
  }
  
  // Check minimum completion period if specified
  if (constraints.minCompletionMonths) {
    const minCompletionDate = getMinCompletionDate(startDateObj, constraints.minCompletionMonths);
    if (endDateObj < minCompletionDate) {
      return {
        isValid: false,
        message: `This course requires a minimum of ${constraints.minCompletionMonths} months to complete. The earliest completion date is ${formatDateForDisplay(minCompletionDate)}`
      };
    }
  }
  
  // If we get here, the date range is valid
  return { isValid: true };
};