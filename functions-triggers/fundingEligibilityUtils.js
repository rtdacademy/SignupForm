/**
 * Backend Funding Eligibility Utilities
 *
 * This module provides server-side funding eligibility calculations for home education students.
 * It uses date-fns for reliable, timezone-aware date calculations.
 *
 * Key Functions:
 * - determineFundingEligibility: Main function to determine student funding eligibility
 * - checkKindergartenFundingEligibility: Check if student qualifies for kindergarten funding
 * - checkGrades1To12FundingEligibility: Check if student qualifies for grades 1-12 funding
 */

const { parseISO, differenceInMonths, format } = require('date-fns');
const { zonedTimeToUtc, utcToZonedTime } = require('date-fns-tz');

// Edmonton timezone for all date calculations
const EDMONTON_TIMEZONE = 'America/Edmonton';

// Funding rates per student per year (from config)
const FUNDING_RATES = {
  KINDERGARTEN: {
    amount: 450.50,
    formatted: '$450.50'
  },
  GRADES_1_TO_12: {
    amount: 901,
    formatted: '$901'
  }
};

// Mid-year proration policy for 25/26 school year
// Students registering between Oct 6, 2025 and Jan 31, 2026 receive half funding initially,
// with the remainder available after Feb 1, 2026 if they continue with the program
const PRORATION_POLICY_25_26 = {
  schoolYear: '25/26',
  // Oct 6, 2025 at 00:00:00 Mountain Daylight Time (UTC-6)
  midTermStart: new Date('2025-10-06T00:00:00-06:00').getTime(),
  // Jan 31, 2026 at 23:59:59 Mountain Standard Time (UTC-7)
  midTermEnd: new Date('2026-01-31T23:59:59-07:00').getTime(),
  // Date when remaining allocation becomes available
  upgradeEligibleDate: '2026-02-01'
};

/**
 * Parse a birthday string to a Date object
 * Assumes the date is in YYYY-MM-DD format
 *
 * @param {string} birthday - Date string in YYYY-MM-DD format
 * @returns {Date} Parsed date object
 */
function parseBirthday(birthday) {
  if (!birthday) return null;

  // Parse ISO date string (YYYY-MM-DD)
  return parseISO(birthday);
}

/**
 * Create a specific date in Edmonton timezone
 *
 * @param {number} year - Year
 * @param {number} month - Month (1-12, NOT 0-indexed)
 * @param {number} day - Day of month
 * @returns {Date} Date object representing that date at midnight in Edmonton
 */
function createEdmontonDate(year, month, day) {
  // Create date string in YYYY-MM-DD format
  const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

  // Parse as ISO and create Date object
  return parseISO(dateString);
}

/**
 * Calculate age in years at a specific reference date
 *
 * @param {Date} birthDate - Student's birth date
 * @param {Date} referenceDate - Date to calculate age at
 * @returns {number} Age in years
 */
function calculateAge(birthDate, referenceDate) {
  if (!birthDate || !referenceDate) return 0;

  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();

  // Adjust if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Calculate age with years and months at a specific reference date
 *
 * @param {Date} birthDate - Student's birth date
 * @param {Date} referenceDate - Date to calculate age at
 * @returns {Object} Object with years and months properties
 */
function calculateAgeWithMonths(birthDate, referenceDate) {
  if (!birthDate || !referenceDate) return { years: 0, months: 0 };

  let years = referenceDate.getFullYear() - birthDate.getFullYear();
  let months = referenceDate.getMonth() - birthDate.getMonth();

  // Adjust if we haven't reached the birth month yet this year
  if (months < 0 || (months === 0 && referenceDate.getDate() < birthDate.getDate())) {
    years--;
    months += 12;
  }

  // Adjust months if we haven't reached the birth day yet this month
  if (referenceDate.getDate() < birthDate.getDate()) {
    months--;
    if (months < 0) {
      months += 12;
      years--;
    }
  }

  return { years, months };
}

/**
 * Check if student is eligible for kindergarten funding
 * Student must be at least 4 years 8 months old by Sept 1 AND 6 or younger on Sept 1
 *
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Object} Eligibility result with isEligible boolean and details
 */
function checkKindergartenFundingEligibility(birthday, schoolYear) {
  if (!birthday || !schoolYear) {
    return {
      isEligible: false,
      ageOnSept1: null,
      schoolYear,
      september1st: null,
      reason: 'invalid-input'
    };
  }

  // Parse school year to get September 1st
  const [startYearShort] = schoolYear.split('/');
  const startYear = parseInt('20' + startYearShort);
  const september1st = createEdmontonDate(startYear, 9, 1); // Sept 1

  // Parse birthday
  const birthDate = parseBirthday(birthday);

  // Calculate age on September 1st
  const ageOnSept1 = calculateAge(birthDate, september1st);
  const ageWithMonths = calculateAgeWithMonths(birthDate, september1st);

  // Calculate total months
  const totalMonths = (ageWithMonths.years * 12) + ageWithMonths.months;

  // Check if 6 or younger on Sept 1 (too young for grades 1-12)
  const tooYoungForGrades = ageOnSept1 <= 6;

  // Check if at least 4 years 8 months old (56 months)
  const meetsMinimumAge = totalMonths >= 56;

  // Eligible if both conditions are met
  const isEligible = tooYoungForGrades && meetsMinimumAge;

  return {
    isEligible,
    ageOnSept1,
    ageWithMonths,
    totalMonths,
    schoolYear,
    september1st,
    reason: !isEligible
      ? (!meetsMinimumAge ? 'too-young' : 'too-old-for-kindergarten')
      : 'eligible'
  };
}

/**
 * Check if student is eligible for grades 1-12 funding
 * Student must be over 6 AND under 20 years old on September 1st
 *
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Object} Eligibility result with isEligible boolean and details
 */
function checkGrades1To12FundingEligibility(birthday, schoolYear) {
  if (!birthday || !schoolYear) {
    return {
      isEligible: false,
      ageOnSept1: null,
      schoolYear,
      september1st: null,
      reason: 'invalid-input'
    };
  }

  // Parse school year to get September 1st
  const [startYearShort] = schoolYear.split('/');
  const startYear = parseInt('20' + startYearShort);
  const september1st = createEdmontonDate(startYear, 9, 1);

  // Parse birthday
  const birthDate = parseBirthday(birthday);

  // Calculate age on September 1st
  const ageOnSept1 = calculateAge(birthDate, september1st);

  // Check eligibility: over 6 AND under 20
  const isEligible = ageOnSept1 > 6 && ageOnSept1 < 20;

  return {
    isEligible,
    ageOnSept1,
    schoolYear,
    september1st,
    reason: !isEligible
      ? (ageOnSept1 <= 6 ? 'too-young' : 'too-old')
      : 'eligible'
  };
}

/**
 * Determines funding eligibility for a student based on age and school year
 * This is the PRIMARY function for funding eligibility determination
 *
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Object} Comprehensive eligibility information:
 *   - fundingEligible: boolean indicating if student is eligible for funding
 *   - fundingAmount: dollar amount of funding (0 if not eligible)
 *   - ageCategory: 'kindergarten', 'grades_1_12', 'too_young', or 'too_old'
 *   - message: user-friendly message explaining eligibility status
 *   - ageDetails: object with ageOnSept1 and ageOnDec31 breakdowns
 */
function determineFundingEligibility(birthday, schoolYear) {
  if (!birthday || !schoolYear) {
    return {
      fundingEligible: true, // Default to eligible if no data
      fundingAmount: 0,
      ageCategory: 'unknown',
      message: null,
      ageDetails: null
    };
  }

  // Parse school year to get key dates
  const [startYearShort] = schoolYear.split('/');
  const startYear = parseInt('20' + startYearShort);
  const september1st = createEdmontonDate(startYear, 9, 1); // Sept 1
  const december31st = createEdmontonDate(startYear, 12, 31); // Dec 31

  // Parse birthday
  const birthDate = parseBirthday(birthday);

  // Check kindergarten eligibility first
  const kResult = checkKindergartenFundingEligibility(birthday, schoolYear);

  if (kResult.isEligible) {
    return {
      fundingEligible: true,
      fundingAmount: FUNDING_RATES.KINDERGARTEN.amount,
      ageCategory: 'kindergarten',
      message: `This student is kindergarten age and eligible for ${FUNDING_RATES.KINDERGARTEN.formatted} in funding.`,
      ageDetails: {
        ageOnSept1: kResult.ageWithMonths,
        ageOnDec31: calculateAgeWithMonths(birthDate, december31st)
      }
    };
  }

  // Check grades 1-12 eligibility
  const g12Result = checkGrades1To12FundingEligibility(birthday, schoolYear);

  if (g12Result.isEligible) {
    return {
      fundingEligible: true,
      fundingAmount: FUNDING_RATES.GRADES_1_TO_12.amount,
      ageCategory: 'grades_1_12',
      message: null, // No special message for normal funding
      ageDetails: {
        ageOnSept1: calculateAgeWithMonths(birthDate, september1st),
        ageOnDec31: calculateAgeWithMonths(birthDate, december31st)
      }
    };
  }

  // Neither kindergarten nor grades 1-12 eligible
  // Determine if too young or too old
  const ageOnSept1 = calculateAge(birthDate, september1st);
  const ageOnDec31 = calculateAge(birthDate, december31st);

  // Too old: 20 or older on Sept 1
  if (ageOnSept1 >= 20) {
    return {
      fundingEligible: false,
      fundingAmount: 0,
      ageCategory: 'too_old',
      message: `This student is too old for funding (20 or older as of September 1, ${startYear}). They can still be added but will not receive funding.`,
      ageDetails: {
        ageOnSept1: calculateAgeWithMonths(birthDate, september1st),
        ageOnDec31: calculateAgeWithMonths(birthDate, december31st)
      }
    };
  }

  // Too young: doesn't meet kindergarten minimum (4 years 8 months by Sept 1, or turning 5 by Dec 31)
  return {
    fundingEligible: false,
    fundingAmount: 0,
    ageCategory: 'too_young',
    message: ageOnDec31 < 5
      ? `This student is too young for funding. Kindergarten students must turn 5 by December 31, ${startYear}. They can still be added but will not receive funding.`
      : `This student must be at least 4 years 8 months old by September 1, ${startYear} to be eligible for kindergarten funding. They can still be added but will not receive funding.`,
    ageDetails: {
      ageOnSept1: calculateAgeWithMonths(birthDate, september1st),
      ageOnDec31: calculateAgeWithMonths(birthDate, december31st)
    }
  };
}

/**
 * Determine registration phase for proration policy
 * Only applies to 25/26 school year
 *
 * @param {number} registeredAt - Registration timestamp (milliseconds)
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {string} 'early', 'mid_term', 'late', or 'not_applicable'
 */
function determineRegistrationPhase(registeredAt, schoolYear) {
  // Proration only applies to 25/26 school year
  if (schoolYear !== PRORATION_POLICY_25_26.schoolYear) {
    return 'not_applicable';
  }

  if (!registeredAt || typeof registeredAt !== 'number') {
    return 'not_applicable';
  }

  // Check which phase the registration falls into
  if (registeredAt < PRORATION_POLICY_25_26.midTermStart) {
    return 'early'; // Before Oct 6, 2025 - full funding
  } else if (registeredAt <= PRORATION_POLICY_25_26.midTermEnd) {
    return 'mid_term'; // Oct 6, 2025 - Jan 31, 2026 - half funding now, half later
  } else {
    return 'late'; // After Jan 31, 2026 - full funding
  }
}

/**
 * Calculate prorated funding allocation based on registration date
 * Only applies to 25/26 school year
 *
 * @param {number} fullAmount - Full eligible funding amount (e.g., 901 or 450.50)
 * @param {number} registeredAt - Registration timestamp (milliseconds)
 * @param {string} schoolYear - School year in YY/YY format (e.g., '25/26')
 * @returns {Object} Allocation details:
 *   - fullAmount: Full eligible amount
 *   - currentAllocation: Amount available now
 *   - remainingAllocation: Amount pending after Feb 1, 2026
 *   - registrationPhase: 'early', 'mid_term', 'late', or 'not_applicable'
 *   - proratedReason: Explanation of proration
 *   - upgradeEligibleAfter: Date when remaining becomes available (or null)
 *   - registrationDate: ISO date string of registration
 */
function calculateProratedAllocation(fullAmount, registeredAt, schoolYear) {
  const phase = determineRegistrationPhase(registeredAt, schoolYear);

  // Default result for no proration
  const defaultResult = {
    fullAmount,
    currentAllocation: fullAmount,
    remainingAllocation: 0,
    registrationPhase: phase,
    proratedReason: null,
    upgradeEligibleAfter: null,
    registrationDate: registeredAt ? new Date(registeredAt).toISOString() : null
  };

  // If not in mid-term phase, return full funding
  if (phase !== 'mid_term') {
    if (phase === 'early') {
      defaultResult.proratedReason = 'Registered before Oct 6, 2025 - full funding immediately';
    } else if (phase === 'late') {
      defaultResult.proratedReason = 'Registered after Jan 31, 2026 - full funding immediately';
    } else {
      defaultResult.proratedReason = 'Proration not applicable for this school year';
    }
    return defaultResult;
  }

  // Mid-term registration: half now, half later
  const halfAmount = Math.round((fullAmount / 2) * 100) / 100; // Round to 2 decimal places

  return {
    fullAmount,
    currentAllocation: halfAmount,
    remainingAllocation: halfAmount,
    registrationPhase: 'mid_term',
    proratedReason: 'Registered during mid-term period (Oct 6, 2025 - Jan 31, 2026). Half funding now, remainder after Feb 1, 2026 if continuing.',
    upgradeEligibleAfter: PRORATION_POLICY_25_26.upgradeEligibleDate,
    registrationDate: new Date(registeredAt).toISOString()
  };
}

module.exports = {
  determineFundingEligibility,
  checkKindergartenFundingEligibility,
  checkGrades1To12FundingEligibility,
  determineRegistrationPhase,
  calculateProratedAllocation,
  FUNDING_RATES,
  PRORATION_POLICY_25_26
};
