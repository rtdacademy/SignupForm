// src/config/importantDates.js

/**
 * Important dates configuration for school operations
 * Each school year runs from September to August
 * All dates are interpreted in Alberta timezone (Mountain Time)
 */

import { toEdmontonDate } from '../utils/timeZoneUtils';

// Important dates by school year
// Use YYYY-MM-DD format - dates will be correctly interpreted as Alberta timezone
const IMPORTANT_DATES = {
  '24/25': {
    registrationOpen: toEdmontonDate('2024-01-01'),
    septemberCount: toEdmontonDate('2024-09-29'),
    // Add more dates as needed:
    // registrationClose: toEdmontonDate('2024-10-15'),
    // semesterOneEnd: toEdmontonDate('2025-01-31'),
    // semesterTwoStart: toEdmontonDate('2025-02-01'),
    // schoolYearEnd: toEdmontonDate('2025-06-30'),
  },
  '25/26': {
    registrationOpen: toEdmontonDate('2025-01-01'),
    septemberCount: toEdmontonDate('2025-09-29'),
    // Future dates can be added here
  },
  '26/27': {
    registrationOpen: toEdmontonDate('2026-01-01'),
    septemberCount: toEdmontonDate('2026-09-29'),
    // Future dates can be added here
  },
  '27/28': {
    registrationOpen: toEdmontonDate('2027-01-01'),
    septemberCount: toEdmontonDate('2027-09-29'),
    // Future dates can be added here
  }
};

/**
 * Gets the current school year in YY/YY format
 * @returns {string} Current school year (e.g., '24/25')
 */
export const getCurrentSchoolYear = () => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1; // 1-12

  // School year starts in September
  let startYear = currentMonth >= 9 ? currentYear : currentYear - 1;
  
  return `${startYear.toString().substr(-2)}/${(startYear + 1).toString().substr(-2)}`;
};

/**
 * Gets important dates for a specific school year
 * @param {string} schoolYear - School year in YY/YY format (e.g., '24/25')
 * @returns {Object} Object containing all important dates for that year
 */
export const getImportantDatesForYear = (schoolYear) => {
  return IMPORTANT_DATES[schoolYear] || {};
};

/**
 * Gets all important dates across all configured years
 * @returns {Object} All important dates organized by school year
 */
export const getAllImportantDates = () => {
  return IMPORTANT_DATES;
};

/**
 * Gets the most recent September count date
 * @param {Object} options - Options object
 * @param {Date} options.referenceDate - Reference date to compare against (defaults to today)
 * @param {boolean} options.includeUpcoming - Whether to include upcoming dates (defaults to true)
 * @returns {Object|null} Object with date and schoolYear, or null if none found
 */
export const getMostRecentSeptemberCount = (options = {}) => {
  const { 
    referenceDate = new Date(), 
    includeUpcoming = true 
  } = options;

  let mostRecentDate = null;
  let mostRecentYear = null;

  Object.entries(IMPORTANT_DATES).forEach(([year, dates]) => {
    if (dates.septemberCount) {
      const isPast = dates.septemberCount <= referenceDate;
      
      // Include this date if it's past, or if we're including upcoming dates
      if (isPast || includeUpcoming) {
        if (!mostRecentDate || dates.septemberCount > mostRecentDate) {
          mostRecentDate = dates.septemberCount;
          mostRecentYear = year;
        }
      }
    }
  });

  return mostRecentDate ? {
    date: mostRecentDate,
    schoolYear: mostRecentYear
  } : null;
};

/**
 * Gets the September count date for a specific school year
 * @param {string} schoolYear - School year in YY/YY format (e.g., '24/25')
 * @returns {Date|null} September count date or null if not found
 */
export const getSeptemberCountForYear = (schoolYear) => {
  const dates = getImportantDatesForYear(schoolYear);
  return dates.septemberCount || null;
};

/**
 * Gets the active September count date based on options
 * @param {Object} options - Options object
 * @param {string} options.preferredYear - Preferred school year to use (overrides automatic selection)
 * @param {boolean} options.useCurrentYear - Force use of current school year
 * @returns {Object} Object with date, schoolYear, and isOverridden flag
 */
export const getActiveSeptemberCount = (options = {}) => {
  const { preferredYear, useCurrentYear } = options;

  // If a specific year is preferred, use that
  if (preferredYear) {
    const date = getSeptemberCountForYear(preferredYear);
    if (date) {
      return {
        date,
        schoolYear: preferredYear,
        isOverridden: true
      };
    }
  }

  // If current year is requested, use that
  if (useCurrentYear) {
    const currentYear = getCurrentSchoolYear();
    const date = getSeptemberCountForYear(currentYear);
    if (date) {
      return {
        date,
        schoolYear: currentYear,
        isOverridden: false
      };
    }
  }

  // Otherwise, get the most recent (including upcoming)
  const mostRecent = getMostRecentSeptemberCount();
  return mostRecent ? {
    ...mostRecent,
    isOverridden: false
  } : null;
};

/**
 * Formats a date for display
 * @param {Date} date - Date to format
 * @param {Object} options - Formatting options (passed to toLocaleDateString)
 * @returns {string} Formatted date string
 */
export const formatImportantDate = (date, options = {}) => {
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Gets all September count dates sorted by date
 * @returns {Array} Array of objects with date and schoolYear, sorted by date
 */
export const getAllSeptemberCountDates = () => {
  const dates = [];
  
  Object.entries(IMPORTANT_DATES).forEach(([year, yearDates]) => {
    if (yearDates.septemberCount) {
      dates.push({
        date: yearDates.septemberCount,
        schoolYear: year
      });
    }
  });
  
  // Sort by date (earliest first)
  return dates.sort((a, b) => a.date - b.date);
};

/**
 * Checks if a September count date has passed for a given school year
 * @param {string} schoolYear - School year in YY/YY format
 * @param {Date} referenceDate - Reference date to compare against (defaults to today)
 * @returns {boolean} True if the date has passed
 */
export const hasSeptemberCountPassed = (schoolYear, referenceDate = new Date()) => {
  const countDate = getSeptemberCountForYear(schoolYear);
  return countDate ? referenceDate > countDate : false;
};

/**
 * Gets the registration open date for a specific school year
 * @param {string} schoolYear - School year in YY/YY format (e.g., '24/25')
 * @returns {Date|null} Registration open date or null if not found
 */
export const getRegistrationOpenDateForYear = (schoolYear) => {
  const dates = getImportantDatesForYear(schoolYear);
  return dates.registrationOpen || null;
};

/**
 * Checks if registration is open for a given school year
 * @param {string} schoolYear - School year in YY/YY format
 * @param {Date} referenceDate - Reference date to compare against (defaults to today)
 * @returns {boolean} True if registration is open
 */
export const isRegistrationOpen = (schoolYear, referenceDate = new Date()) => {
  const openDate = getRegistrationOpenDateForYear(schoolYear);
  return openDate ? referenceDate >= openDate : false;
};

/**
 * Gets the school year that registration is currently open for
 * @param {Date} referenceDate - Reference date to compare against (defaults to today)
 * @returns {string|null} School year that registration is open for, or null if none
 */
export const getOpenRegistrationSchoolYear = (referenceDate = new Date()) => {
  const allDates = getAllSeptemberCountDates();
  
  // Check each school year to see if registration is open and September count hasn't passed
  for (const {schoolYear} of allDates) {
    const registrationOpen = isRegistrationOpen(schoolYear, referenceDate);
    const septemberCountPassed = hasSeptemberCountPassed(schoolYear, referenceDate);
    
    if (registrationOpen && !septemberCountPassed) {
      return schoolYear;
    }
  }
  
  return null;
};

/**
 * Gets all school years that currently have open registration
 * @param {Date} referenceDate - Reference date to compare against (defaults to today)
 * @returns {Array} Array of school years with open registration
 */
export const getAllOpenRegistrationSchoolYears = (referenceDate = new Date()) => {
  const allDates = getAllSeptemberCountDates();
  const openYears = [];
  
  for (const {schoolYear} of allDates) {
    const registrationOpen = isRegistrationOpen(schoolYear, referenceDate);
    const septemberCountPassed = hasSeptemberCountPassed(schoolYear, referenceDate);
    
    if (registrationOpen && !septemberCountPassed) {
      openYears.push(schoolYear);
    }
  }
  
  return openYears.sort();
};

// Export individual dates for direct access if needed
export { IMPORTANT_DATES };

// Default export with all utilities
export default {
  getCurrentSchoolYear,
  getImportantDatesForYear,
  getAllImportantDates,
  getMostRecentSeptemberCount,
  getSeptemberCountForYear,
  getActiveSeptemberCount,
  formatImportantDate,
  getAllSeptemberCountDates,
  hasSeptemberCountPassed,
  getRegistrationOpenDateForYear,
  isRegistrationOpen,
  getOpenRegistrationSchoolYear,
  getAllOpenRegistrationSchoolYears,
  IMPORTANT_DATES
};