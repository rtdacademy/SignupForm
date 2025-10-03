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

// Import school year configurations
import schoolYear_2024_25 from './schoolYears/2024-25';
import schoolYear_2025_26 from './schoolYears/2025-26';
import schoolYear_2026_27 from './schoolYears/2026-27';
import schoolYear_2027_28 from './schoolYears/2027-28';

// =============================================================================
// CURRENT SCHOOL YEAR
// =============================================================================
// UPDATE THESE VALUES AT THE START OF EACH SCHOOL YEAR
export const CURRENT_SCHOOL_YEAR = '25/26';
export const NEXT_SCHOOL_YEAR = '26/27';

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
// Built from imported school year configurations
const IMPORTANT_DATES = {
  '24/25': schoolYear_2024_25.importantDates,
  '25/26': schoolYear_2025_26.importantDates,
  '26/27': schoolYear_2026_27.importantDates,
  '27/28': schoolYear_2027_28.importantDates
};

/**
 * Gets the current school year in YY/YY format
 * @returns {string} Current school year (e.g., '24/25')
 */
export const getCurrentSchoolYear = () => {
  return CURRENT_SCHOOL_YEAR;
};

/**
 * Gets the next school year in YY/YY format
 * @returns {string} Next school year (e.g., '26/27')
 */
export const getNextSchoolYear = () => {
  return NEXT_SCHOOL_YEAR;
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
 * Gets the Intent to Register period dates for a school year
 * @param {string} schoolYear - School year in YY/YY format
 * @returns {Object|null} Object with start and end dates, or null if not configured
 */
export const getIntentToRegisterPeriod = (schoolYear) => {
  const dates = getImportantDatesForYear(schoolYear);
  return dates.intentToRegisterPeriod || null;
};

/**
 * Checks if we're in the Intent to Register period for the current school year
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {boolean} True if in intent period
 */
export const isInIntentToRegisterPeriod = (referenceDate = new Date()) => {
  const currentYear = getCurrentSchoolYear();
  const dates = getImportantDatesForYear(currentYear);

  if (!dates.intentToRegisterPeriod) return false;

  const { start, end } = dates.intentToRegisterPeriod;
  return referenceDate >= start && referenceDate <= end;
};

/**
 * Gets the current registration phase and capabilities
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object} Phase information with capabilities
 */
export const getRegistrationPhase = (referenceDate = new Date()) => {
  const currentYear = getCurrentSchoolYear();
  const nextYear = getNextSchoolYear();

  const currentYearOpen = isRegistrationOpen(currentYear, referenceDate);
  const currentYearCountPassed = hasSeptemberCountPassed(currentYear, referenceDate);
  const nextYearOpen = isRegistrationOpen(nextYear, referenceDate);
  const inIntentPeriod = isInIntentToRegisterPeriod(referenceDate);

  // Current year registration is open (before Sept count)
  if (currentYearOpen && !currentYearCountPassed) {
    return {
      phase: 'current-year-open',
      schoolYear: currentYear,
      targetYear: currentYear,
      canSubmitNotificationForm: true,
      canSubmitIntentForm: false,
      canSelectFacilitator: 'funded',
      message: `Registration open for ${currentYear} school year`,
      nextRegistrationDate: null
    };
  }

  // In Intent to Register period (after current Sept count, before next year opens)
  if (inIntentPeriod && !nextYearOpen) {
    const intentPeriod = getIntentToRegisterPeriod(currentYear);
    const nextYearRegistrationDate = getRegistrationOpenDateForYear(nextYear);
    return {
      phase: 'intent-period',
      schoolYear: currentYear,
      targetYear: nextYear,
      canSubmitNotificationForm: false,
      canSubmitIntentForm: true,
      canSelectFacilitator: 'intent',
      message: `Intent to Register period for ${nextYear} school year`,
      periodEnd: intentPeriod?.end,
      nextRegistrationDate: nextYearRegistrationDate
    };
  }

  // Next year registration is open
  if (nextYearOpen) {
    const nextYearCountPassed = hasSeptemberCountPassed(nextYear, referenceDate);
    if (!nextYearCountPassed) {
      return {
        phase: 'next-year-open',
        schoolYear: nextYear,
        targetYear: nextYear,
        canSubmitNotificationForm: true,
        canSubmitIntentForm: false,
        canSelectFacilitator: 'funded',
        message: `Registration open for ${nextYear} school year`,
        nextRegistrationDate: null
      };
    }
  }

  // Fallback - registration closed, no intent period active
  const nextYearRegistrationDate = getRegistrationOpenDateForYear(nextYear);
  return {
    phase: 'closed',
    schoolYear: currentYear,
    targetYear: nextYear,
    canSubmitNotificationForm: false,
    canSubmitIntentForm: false,
    canSelectFacilitator: false,
    message: 'Registration is currently closed',
    nextRegistrationDate: nextYearRegistrationDate
  };
};

/**
 * Gets the target year for new registrations
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {string} School year that new families should target
 */
export const getRegistrationTargetYear = (referenceDate = new Date()) => {
  const phase = getRegistrationPhase(referenceDate);
  return phase.targetYear || phase.schoolYear;
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

/**
 * Gets calendar events for a specific school year
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Array} Array of calendar events
 */
export const getCalendarEventsForYear = (schoolYear) => {
  const configs = {
    '24/25': schoolYear_2024_25,
    '25/26': schoolYear_2025_26,
    '26/27': schoolYear_2026_27,
    '27/28': schoolYear_2027_28
  };

  return configs[schoolYear]?.calendarEvents || [];
};

/**
 * Gets all calendar events across all school years
 * @returns {Array} Array of all calendar events
 */
export const getAllCalendarEvents = () => {
  return [
    ...schoolYear_2024_25.calendarEvents,
    ...schoolYear_2025_26.calendarEvents,
    ...schoolYear_2026_27.calendarEvents,
    ...schoolYear_2027_28.calendarEvents
  ];
};

/**
 * Gets calendar events for the current school year
 * @returns {Array} Array of calendar events for current year
 */
export const getCurrentSchoolYearEvents = () => {
  return getCalendarEventsForYear(CURRENT_SCHOOL_YEAR);
};

/**
 * Gets event type configuration
 * @param {string} schoolYear - School year in YY/YY format (defaults to current)
 * @returns {Object} Event types configuration
 */
export const getEventTypes = (schoolYear = CURRENT_SCHOOL_YEAR) => {
  const configs = {
    '24/25': schoolYear_2024_25,
    '25/26': schoolYear_2025_26,
    '26/27': schoolYear_2026_27,
    '27/28': schoolYear_2027_28
  };

  return configs[schoolYear]?.eventTypes || schoolYear_2025_26.eventTypes;
};

// =============================================================================
// DYNAMIC REGISTRATION PERIOD HELPERS
// =============================================================================

/**
 * Determines the current registration period (Term 1, Term 2, or Summer)
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object} Object with period, schoolYear, and details
 */
export const getCurrentRegistrationPeriod = (referenceDate = new Date()) => {
  const currentYear = getCurrentSchoolYear();
  const dates = getImportantDatesForYear(currentYear);

  // Check if we're in Summer period (July 1 - August 31)
  if (dates.summerStart && dates.summerEnd) {
    if (referenceDate >= dates.summerStart && referenceDate <= dates.summerEnd) {
      return {
        period: 'summer',
        schoolYear: currentYear,
        name: 'Summer School',
        startDate: dates.summerStart,
        endDate: dates.summerEnd,
        registrationDeadline: dates.summerRegistrationDeadline || null
      };
    }
  }

  // Check if we're before Term 1 deadline (Term 1 registration period)
  if (dates.term1RegistrationDeadline && referenceDate <= dates.term1RegistrationDeadline) {
    return {
      period: 'term1',
      schoolYear: currentYear,
      name: 'Term 1',
      startDate: dates.registrationOpen || null,
      endDate: dates.term1End || null,
      registrationDeadline: dates.term1RegistrationDeadline,
      countDay: dates.term1CountDay || null
    };
  }

  // Check if we're in Term 2 period (after Term 1 deadline, before Term 2 end)
  if (dates.term2End && referenceDate <= dates.term2End) {
    return {
      period: 'term2',
      schoolYear: currentYear,
      name: 'Term 2',
      startDate: dates.term1End ? new Date(dates.term1End.getTime() + 86400000) : null, // Day after Term 1 ends
      endDate: dates.term2End,
      registrationDeadlines: {
        homeEducation: dates.term2HomeEducationDeadline || null,
        nonPrimary: dates.term2RegistrationDeadline || null
      }
    };
  }

  // If we're past Term 2 but before summer, we're between terms
  return {
    period: 'between-terms',
    schoolYear: currentYear,
    name: 'Between Terms',
    nextPeriodStart: dates.summerStart || null
  };
};

/**
 * Gets active registration deadlines based on the current period and student type
 * @param {string} studentType - 'homeEducation' or 'nonPrimary' (optional, returns both if not specified)
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object} Object with deadline information
 */
export const getActiveDeadlines = (studentType = null, referenceDate = new Date()) => {
  const currentPeriod = getCurrentRegistrationPeriod(referenceDate);
  const dates = getImportantDatesForYear(currentPeriod.schoolYear);

  switch (currentPeriod.period) {
    case 'term1':
      return {
        period: 'term1',
        deadline: dates.term1RegistrationDeadline,
        label: 'Term 1 Registration Deadline',
        appliesTo: 'all',
        isPast: referenceDate > dates.term1RegistrationDeadline
      };

    case 'term2':
      const deadlines = [];

      if (studentType === 'homeEducation' || !studentType) {
        const heDeadline = dates.term2HomeEducationDeadline;
        if (heDeadline) {
          deadlines.push({
            type: 'homeEducation',
            deadline: heDeadline,
            label: 'Term 2 Home Education Deadline',
            isPast: referenceDate > heDeadline
          });
        }
      }

      if (studentType === 'nonPrimary' || !studentType) {
        const npDeadline = dates.term2RegistrationDeadline;
        if (npDeadline) {
          deadlines.push({
            type: 'nonPrimary',
            deadline: npDeadline,
            label: 'Term 2 Non-Primary Deadline',
            isPast: referenceDate > npDeadline
          });
        }
      }

      return {
        period: 'term2',
        deadlines,
        hasMultiple: deadlines.length > 1
      };

    case 'summer':
      return {
        period: 'summer',
        deadline: dates.summerRegistrationDeadline,
        label: 'Summer School Registration Deadline',
        appliesTo: 'all',
        isPast: dates.summerRegistrationDeadline ? referenceDate > dates.summerRegistrationDeadline : false
      };

    default:
      return {
        period: currentPeriod.period,
        deadline: null,
        label: 'No active registration deadline',
        appliesTo: 'none',
        isPast: true
      };
  }
};

/**
 * Gets the next upcoming deadline across all periods
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object|null} Next deadline information or null if none found
 */
export const getNextDeadline = (referenceDate = new Date()) => {
  const currentYear = getCurrentSchoolYear();
  const nextYear = getNextSchoolYear();

  const allDates = [
    ...Object.entries(getImportantDatesForYear(currentYear)),
    ...Object.entries(getImportantDatesForYear(nextYear))
  ];

  // Filter for deadline dates that are in the future
  const futureDeadlines = allDates
    .filter(([key, value]) => {
      return (
        value instanceof Date &&
        value > referenceDate &&
        (key.includes('Deadline') || key.includes('deadline'))
      );
    })
    .map(([key, date]) => {
      // Create readable labels
      let label = key
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase())
        .trim();

      return { key, date, label };
    })
    .sort((a, b) => a.date - b.date);

  return futureDeadlines.length > 0 ? futureDeadlines[0] : null;
};

/**
 * Gets registration status for display on the website
 * @param {Date} referenceDate - Reference date (defaults to today)
 * @returns {Object} Status information for display
 */
export const getRegistrationStatus = (referenceDate = new Date()) => {
  const currentYear = getCurrentSchoolYear();
  const currentPeriod = getCurrentRegistrationPeriod(referenceDate);
  const activeDeadlines = getActiveDeadlines(null, referenceDate);
  const nextDeadline = getNextDeadline(referenceDate);

  // Format school year display
  const yearParts = currentYear.split('/');
  const schoolYearDisplay = `20${yearParts[0]}-20${yearParts[1]}`;

  return {
    schoolYear: currentYear,
    schoolYearDisplay,
    currentPeriod: currentPeriod.period,
    periodName: currentPeriod.name,
    activeDeadlines,
    nextDeadline,
    isRegistrationOpen: currentPeriod.period !== 'between-terms',
    message: getRegistrationMessage(currentPeriod, activeDeadlines, referenceDate)
  };
};

/**
 * Helper to generate user-friendly registration messages
 * @param {Object} currentPeriod - Current period information
 * @param {Object} activeDeadlines - Active deadline information
 * @param {Date} referenceDate - Reference date
 * @returns {string} User-friendly message
 */
const getRegistrationMessage = (currentPeriod, activeDeadlines, referenceDate) => {
  switch (currentPeriod.period) {
    case 'term1':
      if (activeDeadlines.isPast) {
        return 'Term 1 registration deadline has passed';
      }
      return `Registration open for Term 1`;

    case 'term2':
      const activeTerm2 = activeDeadlines.deadlines.filter(d => !d.isPast);
      if (activeTerm2.length === 0) {
        return 'Term 2 registration deadlines have passed';
      }
      if (activeTerm2.length === 1) {
        return `Registration open for Term 2 (${activeTerm2[0].type === 'homeEducation' ? 'Home Education' : 'Non-Primary'})`;
      }
      return 'Registration open for Term 2';

    case 'summer':
      if (activeDeadlines.isPast) {
        return 'Summer school registration deadline has passed';
      }
      return 'Registration open for Summer School';

    case 'between-terms':
      return 'Registration currently closed';

    default:
      return 'Check registration deadlines';
  }
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
  getNextSchoolYear,
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
  getIntentToRegisterPeriod,
  isInIntentToRegisterPeriod,
  getRegistrationPhase,
  getRegistrationTargetYear,
  getActiveRegistrationYear,
  parseTermDate,
  getTermStartDate,
  getTermEndDate,
  getFormattedImportantDates,

  // Calendar event utilities
  getCalendarEventsForYear,
  getAllCalendarEvents,
  getCurrentSchoolYearEvents,
  getEventTypes,

  // Dynamic registration period helpers
  getCurrentRegistrationPeriod,
  getActiveDeadlines,
  getNextDeadline,
  getRegistrationStatus
};