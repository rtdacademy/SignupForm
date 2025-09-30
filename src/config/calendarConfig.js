// src/config/calendarConfig.js

/**
 * SINGLE SOURCE OF TRUTH FOR ALL CALENDAR, DATES, AND ACADEMIC CONFIGURATION
 *
 * This file consolidates:
 * - Important dates by school year
 * - Calendar events and holidays
 * - Term/semester dates
 * - Academic calendar information
 *
 * Each school year runs from September to August
 * All dates are interpreted in Alberta timezone (Mountain Time)
 */

import { toEdmontonDate } from '../utils/timeZoneUtils';

// =============================================================================
// CURRENT SCHOOL YEAR
// =============================================================================
// UPDATE THIS VALUE AT THE START OF EACH SCHOOL YEAR
export const CURRENT_SCHOOL_YEAR = '25/26';

// =============================================================================
// TERM/SEMESTER CONFIGURATION
// =============================================================================
export const TERMS = {
  semester1: {
    name: 'Semester 1',
    startDate: 'September 1',
    endDate: 'January 31',
    startMonth: 9, // For programmatic use
    startDay: 1,
    endMonth: 1,
    endDay: 31
  },
  semester2: {
    name: 'Semester 2',
    startDate: 'February 1',
    endDate: 'June 19',
    startMonth: 2,
    startDay: 1,
    endMonth: 6,
    endDay: 19
  },
  summer: {
    name: 'Summer School',
    startDate: 'July 1',
    endDate: 'August 31',
    startMonth: 7,
    startDay: 1,
    endMonth: 8,
    endDay: 31
  }
};

// =============================================================================
// IMPORTANT DATES BY SCHOOL YEAR
// =============================================================================
// Use YYYY-MM-DD format - dates will be correctly interpreted as Alberta timezone
const IMPORTANT_DATES = {
  '24/25': {
    schoolYearDisplay: '2024-2025',
    registrationOpen: toEdmontonDate('2025-09-29'),
    septemberCount: toEdmontonDate('2024-09-29'),
    term1RegistrationDeadline: toEdmontonDate('2024-09-29'),
    term1CountDay: toEdmontonDate('2024-09-30'),
    term1End: toEdmontonDate('2025-01-31'),
    term2RegistrationDeadline: toEdmontonDate('2025-04-15'),
    term2HomeEducationDeadline: toEdmontonDate('2025-02-28'),
    term2End: toEdmontonDate('2025-06-19'),
    term2PasiDeadline: toEdmontonDate('2025-06-19'),
    summerStart: toEdmontonDate('2024-07-01'),
    summerEnd: toEdmontonDate('2024-08-31'),
  },
  '25/26': {
    schoolYearDisplay: '2025-2026',
    registrationOpen: toEdmontonDate('2025-09-29'),
    septemberCount: toEdmontonDate('2025-09-29'),
    term1RegistrationDeadline: toEdmontonDate('2025-09-29'),
    term1CountDay: toEdmontonDate('2025-09-30'),
    term1End: toEdmontonDate('2026-01-31'),
    term2RegistrationDeadline: toEdmontonDate('2026-04-15'),
    term2HomeEducationDeadline: toEdmontonDate('2026-02-28'),
    term2End: toEdmontonDate('2026-06-19'),
    term2PasiDeadline: toEdmontonDate('2026-06-19'),
    summerStart: toEdmontonDate('2025-07-01'),
    summerEnd: toEdmontonDate('2025-08-31'),
  },
  '26/27': {
    schoolYearDisplay: '2026-2027',
    registrationOpen: toEdmontonDate('2025-09-29'),
    septemberCount: toEdmontonDate('2026-09-29'),
    term1RegistrationDeadline: toEdmontonDate('2026-09-29'),
    term1CountDay: toEdmontonDate('2026-09-30'),
    term1End: toEdmontonDate('2027-01-31'),
    term2RegistrationDeadline: toEdmontonDate('2027-04-15'),
    term2HomeEducationDeadline: toEdmontonDate('2027-02-28'),
    term2End: toEdmontonDate('2027-06-19'),
    term2PasiDeadline: toEdmontonDate('2027-06-19'),
    summerStart: toEdmontonDate('2026-07-01'),
    summerEnd: toEdmontonDate('2026-08-31'),
  },
  '27/28': {
    schoolYearDisplay: '2027-2028',
    registrationOpen: toEdmontonDate('2025-09-29'),
    septemberCount: toEdmontonDate('2027-09-29'),
    term1RegistrationDeadline: toEdmontonDate('2027-09-29'),
    term1CountDay: toEdmontonDate('2027-09-30'),
    term1End: toEdmontonDate('2028-01-31'),
    term2RegistrationDeadline: toEdmontonDate('2028-04-15'),
    term2HomeEducationDeadline: toEdmontonDate('2028-02-28'),
    term2End: toEdmontonDate('2028-06-19'),
    term2PasiDeadline: toEdmontonDate('2028-06-19'),
    summerStart: toEdmontonDate('2027-07-01'),
    summerEnd: toEdmontonDate('2027-08-31'),
  }
};

/**
 * Gets the current school year in YY/YY format
 * @returns {string} Current school year (e.g., '24/25')
 */
export const getCurrentSchoolYear = () => {
  return CURRENT_SCHOOL_YEAR;
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

/**
 * Gets the active registration year for display purposes
 * This ensures families can always see their current year's registration,
 * even after the September count has passed
 * @param {Date} referenceDate - Reference date to compare against (defaults to today)
 * @returns {string} The school year to display for registration
 */
export const getActiveRegistrationYear = (referenceDate = new Date()) => {
  // First check if there's an open registration year
  const openYear = getOpenRegistrationSchoolYear(referenceDate);
  if (openYear) {
    return openYear;
  }

  // If no registration is open, return the current school year
  // This ensures families can still see their submitted forms for the current year
  return getCurrentSchoolYear();
};

/**
 * Parse a text date like "September 1" into a Date object for a given year
 * @param {string} dateString - Date string like "September 1"
 * @param {number} year - The year to use
 * @returns {Date|null} Date object or null if parsing fails
 */
export const parseTermDate = (dateString, year) => {
  const months = {
    'January': 0, 'February': 1, 'March': 2, 'April': 3,
    'May': 4, 'June': 5, 'July': 6, 'August': 7,
    'September': 8, 'October': 9, 'November': 10, 'December': 11
  };

  const parts = dateString.split(' ');
  if (parts.length === 2) {
    const month = months[parts[0]];
    const day = parseInt(parts[1]);
    if (month !== undefined && !isNaN(day)) {
      return new Date(year, month, day);
    }
  }
  return null;
};

/**
 * Gets the term start Date object for a given year
 * @param {number} termNumber - 1 for semester1, 2 for semester2
 * @param {number} year - The year
 * @returns {Date|null}
 */
export const getTermStartDate = (termNumber, year) => {
  const term = termNumber === 1 ? TERMS.semester1 : TERMS.semester2;
  return parseTermDate(term.startDate, year);
};

/**
 * Gets the term end Date object for a given year
 * @param {number} termNumber - 1 for semester1, 2 for semester2
 * @param {number} year - The year (use the END year of the school year)
 * @returns {Date|null}
 */
export const getTermEndDate = (termNumber, year) => {
  const term = termNumber === 1 ? TERMS.semester1 : TERMS.semester2;
  return parseTermDate(term.endDate, year);
};

/**
 * Gets all important dates formatted for display
 * @param {string} schoolYear - School year in YY/YY format
 * @returns {Array} Array of date objects with labels
 */
export const getFormattedImportantDates = (schoolYear) => {
  const dates = getImportantDatesForYear(schoolYear);
  if (!dates) return [];

  const formatted = [];

  if (dates.term1RegistrationDeadline) {
    formatted.push({
      label: 'Term 1 Registration Deadline',
      date: dates.term1RegistrationDeadline,
      type: 'deadline',
      display: formatImportantDate(dates.term1RegistrationDeadline)
    });
  }

  if (dates.term1CountDay) {
    formatted.push({
      label: 'Term 1 Count Day',
      date: dates.term1CountDay,
      type: 'count',
      display: formatImportantDate(dates.term1CountDay)
    });
  }

  if (dates.term1End) {
    formatted.push({
      label: 'Term 1 End Date',
      date: dates.term1End,
      type: 'end',
      display: formatImportantDate(dates.term1End)
    });
  }

  if (dates.term2HomeEducationDeadline) {
    formatted.push({
      label: 'Home Education Term 2 Registration Deadline',
      date: dates.term2HomeEducationDeadline,
      type: 'deadline',
      display: formatImportantDate(dates.term2HomeEducationDeadline)
    });
  }

  if (dates.term2RegistrationDeadline) {
    formatted.push({
      label: 'Term 2 Registration Deadline',
      date: dates.term2RegistrationDeadline,
      type: 'deadline',
      display: formatImportantDate(dates.term2RegistrationDeadline)
    });
  }

  if (dates.term2End) {
    formatted.push({
      label: 'Term 2 End Date',
      date: dates.term2End,
      type: 'end',
      display: formatImportantDate(dates.term2End)
    });
  }

  if (dates.summerStart) {
    formatted.push({
      label: 'Summer School Starts',
      date: dates.summerStart,
      type: 'start',
      display: formatImportantDate(dates.summerStart)
    });
  }

  if (dates.summerEnd) {
    formatted.push({
      label: 'Summer School Ends',
      date: dates.summerEnd,
      type: 'end',
      display: formatImportantDate(dates.summerEnd)
    });
  }

  return formatted.sort((a, b) => a.date - b.date);
};

// Export individual dates for direct access if needed
export { IMPORTANT_DATES };

// Default export with all utilities
export default {
  // Configuration exports
  TERMS,
  IMPORTANT_DATES,

  // Date utilities
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
  getActiveRegistrationYear,
  parseTermDate,
  getTermStartDate,
  getTermEndDate,
  getFormattedImportantDates
};