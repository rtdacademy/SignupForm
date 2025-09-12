import { differenceInMonths, parseISO } from 'date-fns';
import { calculateAge } from './timeZoneUtils';
import { FUNDING_RATES } from '../config/HomeEducation';

/**
 * Determines which school year we're registering for based on current date
 * @returns {Object} Object with registrationYear and schoolYearString
 */
export const getRegistrationSchoolYear = () => {
  const now = new Date();
  const currentMonth = now.getMonth() + 1; // 1-12
  const currentYear = now.getFullYear();
  
  // Determine the registration school year
  // If it's Sept-Dec, we're typically registering for NEXT school year
  // If it's Jan-Aug, we're registering for the upcoming school year (Sept start)
  let registrationYear;
  if (currentMonth >= 9) {
    // Sept-Dec: registering for next school year
    registrationYear = currentYear + 1;
  } else {
    // Jan-Aug: registering for upcoming Sept
    registrationYear = currentYear;
  }
  
  const schoolYearString = `${registrationYear}/${(registrationYear + 1).toString().slice(-2)}`;
  
  return {
    registrationYear,
    schoolYearString, // e.g., "2025/26"
    septemberFirst: new Date(registrationYear, 8, 1), // Sept 1 of registration year
    december31: new Date(registrationYear, 11, 31) // Dec 31 of registration year
  };
};

/**
 * Checks if a student is eligible for kindergarten
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {number} registrationYear - The year of registration
 * @returns {boolean} True if eligible for kindergarten
 */
export const isKindergartenEligible = (birthday, registrationYear = null) => {
  if (!birthday) return false;
  
  const { septemberFirst, december31 } = registrationYear 
    ? {
        septemberFirst: new Date(registrationYear, 8, 1),
        december31: new Date(registrationYear, 11, 31)
      }
    : getRegistrationSchoolYear();
  
  const age = calculateAge(birthday, septemberFirst);
  const turningFiveByDec31 = calculateAge(birthday, december31) >= 5;
  
  // Must turn 5 by Dec 31 AND be under 6 as of Sept 1
  return turningFiveByDec31 && age < 6;
};

/**
 * Checks if a student is too young for funding
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {number} registrationYear - The year of registration
 * @returns {boolean} True if too young for funding
 */
export const isTooYoungForFunding = (birthday, registrationYear = null) => {
  if (!birthday) return false;
  
  const { septemberFirst, december31 } = registrationYear 
    ? {
        septemberFirst: new Date(registrationYear, 8, 1),
        december31: new Date(registrationYear, 11, 31)
      }
    : getRegistrationSchoolYear();
  
  const turningFiveByDec31 = calculateAge(birthday, december31) >= 5;
  
  // Too young if they don't turn 5 by Dec 31
  return !turningFiveByDec31;
};

/**
 * Checks if a student is too old for funding (20 or older as of Sept 1)
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {number} registrationYear - The year of registration
 * @returns {boolean} True if too old for funding
 */
export const isTooOldForFunding = (birthday, registrationYear = null) => {
  if (!birthday) return false;
  
  const { septemberFirst } = registrationYear 
    ? { septemberFirst: new Date(registrationYear, 8, 1) }
    : getRegistrationSchoolYear();
  
  const age = calculateAge(birthday, septemberFirst);
  
  // Too old if 20 or older as of Sept 1
  return age >= 20;
};

/**
 * Estimates grade level based on age
 * @param {number} age - Age as of September 1st
 * @returns {string} Estimated grade level
 */
export const estimateGradeLevel = (age) => {
  if (age < 5) return null;
  if (age === 5) return 'K';
  
  // Grade 1 starts at age 6, Grade 12 at age 17
  const estimatedGrade = Math.min(12, Math.max(1, age - 5));
  return estimatedGrade.toString();
};

/**
 * Gets funding amount based on age category
 * @param {string} ageCategory - The age category ('kindergarten', 'grades_1_12', etc.)
 * @returns {number} Funding amount in dollars
 */
export const getFundingAmount = (ageCategory) => {
  switch (ageCategory) {
    case 'kindergarten':
      return FUNDING_RATES.KINDERGARTEN.amount;
    case 'grades_1_12':
      return FUNDING_RATES.GRADES_1_TO_12.amount;
    default:
      return 0;
  }
};

/**
 * Main function to determine funding eligibility based on student's age
 * @param {string} birthday - Student's birthday in YYYY-MM-DD format
 * @param {string} schoolYear - Optional school year in format "YY/YY" (e.g., "25/26")
 * @returns {Object} Object containing eligibility info
 */
export const determineFundingEligibility = (birthday, schoolYear = null) => {
  if (!birthday) {
    return { 
      fundingEligible: true, // Default to eligible if no birthday yet
      fundingAmount: 0,
      ageCategory: 'unknown',
      message: null,
      grade: null,
      ageDetails: null
    };
  }

  let registrationYear, septemberFirst, december31;
  
  if (schoolYear) {
    // Parse the provided school year (e.g., "25/26" -> 2025)
    const [startYear] = schoolYear.split('/');
    registrationYear = 2000 + parseInt(startYear);
    septemberFirst = new Date(registrationYear, 8, 1); // Sept 1
    december31 = new Date(registrationYear, 11, 31); // Dec 31
  } else {
    // Fallback to guessing based on current date (existing behavior)
    const result = getRegistrationSchoolYear();
    registrationYear = result.registrationYear;
    septemberFirst = result.septemberFirst;
    december31 = result.december31;
  }
  
  // Calculate age as of September 1st
  const age = calculateAge(birthday, septemberFirst);
  const birthDate = parseISO(birthday);
  
  // Calculate detailed ages for audit trail
  const ageOnSept1 = {
    years: Math.floor(age),
    months: Math.floor((age % 1) * 12),
    days: Math.floor(((age % 1) * 12 % 1) * 30)
  };
  
  const ageOnDec31Value = calculateAge(birthday, december31);
  const ageOnDec31 = {
    years: Math.floor(ageOnDec31Value),
    months: Math.floor((ageOnDec31Value % 1) * 12),
    days: Math.floor(((ageOnDec31Value % 1) * 12 % 1) * 30)
  };
  
  // Check if student turns 5 by December 31st of the registration school year
  const turningFiveByDec31 = ageOnDec31Value >= 5;
  
  // Kindergarten: Must turn 5 by December 31st AND be under 6 years old as of September 1st
  // According to Alberta Education guidelines
  if (turningFiveByDec31 && age < 6) {
    // If they're already 5 as of September 1st, they're definitely eligible
    if (age >= 5) {
      return {
        fundingEligible: true,
        fundingAmount: FUNDING_RATES.KINDERGARTEN.amount,
        ageCategory: 'kindergarten',
        message: `This student is kindergarten age and eligible for ${FUNDING_RATES.KINDERGARTEN.formatted} in funding.`,
        grade: 'K',
        ageDetails: {
          ageOnSept1,
          ageOnDec31,
          septemberFirst: septemberFirst.toISOString().split('T')[0],
          december31: december31.toISOString().split('T')[0]
        }
      };
    }
    
    // If they're 4 but will turn 5 by Dec 31, check if they're at least 4 years 8 months
    // Use date-fns for accurate month calculation
    const ageInMonths = differenceInMonths(septemberFirst, birthDate);
    
    if (ageInMonths >= 56) { // 4 years 8 months = 56 months
      return {
        fundingEligible: true,
        fundingAmount: FUNDING_RATES.KINDERGARTEN.amount,
        ageCategory: 'kindergarten',
        message: `This student is kindergarten age and eligible for ${FUNDING_RATES.KINDERGARTEN.formatted} in funding.`,
        grade: 'K',
        ageDetails: {
          ageOnSept1,
          ageOnDec31,
          septemberFirst: septemberFirst.toISOString().split('T')[0],
          december31: december31.toISOString().split('T')[0]
        }
      };
    }
    
    // Too young even though they turn 5 by Dec 31 (under 4 years 8 months)
    return {
      fundingEligible: false,
      fundingAmount: 0,
      ageCategory: 'too_young',
      message: `This student must be at least 4 years 8 months old by September 1, ${registrationYear} to be eligible for kindergarten funding.`,
      grade: null,
      ageDetails: {
        ageOnSept1,
        ageOnDec31,
        septemberFirst: septemberFirst.toISOString().split('T')[0],
        december31: december31.toISOString().split('T')[0]
      }
    };
  }
  
  // Too young: Doesn't turn 5 by Dec 31
  if (!turningFiveByDec31) {
    return {
      fundingEligible: false,
      fundingAmount: 0,
      ageCategory: 'too_young',
      message: `This student is too young for funding. Kindergarten students must turn 5 by December 31, ${registrationYear}. They can still be added but will not receive funding.`,
      grade: null,
      ageDetails: {
        ageOnSept1,
        ageOnDec31,
        septemberFirst: septemberFirst.toISOString().split('T')[0],
        december31: december31.toISOString().split('T')[0]
      }
    };
  }
  
  // Too old: 20 years or older as of September 1st
  // Note: Students who turn 20 on September 2nd or later are still eligible
  if (age >= 20) {
    return {
      fundingEligible: false,
      fundingAmount: 0,
      ageCategory: 'too_old',
      message: `This student is too old for funding (20 or older as of September 1, ${registrationYear}). They can still be added but will not receive funding.`,
      grade: '12', // Default to grade 12 for older students
      ageDetails: {
        ageOnSept1,
        ageOnDec31,
        septemberFirst: septemberFirst.toISOString().split('T')[0],
        december31: december31.toISOString().split('T')[0]
      }
    };
  }
  
  // Grades 1-12: Ages 6 to 19 as of September 1st
  if (age >= 6 && age <= 19) {
    const estimatedGrade = estimateGradeLevel(age);
    
    return {
      fundingEligible: true,
      fundingAmount: FUNDING_RATES.GRADES_1_TO_12.amount,
      ageCategory: 'grades_1_12',
      message: null, // No special message for normal funding
      grade: estimatedGrade,
      ageDetails: {
        ageOnSept1,
        ageOnDec31,
        septemberFirst: septemberFirst.toISOString().split('T')[0],
        december31: december31.toISOString().split('T')[0]
      }
    };
  }
  
  // Default case for edge cases
  return {
    fundingEligible: false,
    fundingAmount: 0,
    ageCategory: 'unknown',
    message: `This student does not meet the age requirements for funding.`,
    grade: null,
    ageDetails: {
      ageOnSept1,
      ageOnDec31,
      septemberFirst: septemberFirst.toISOString().split('T')[0],
      december31: december31.toISOString().split('T')[0]
    }
  };
};

/**
 * Gets a formatted message about funding eligibility
 * @param {Object} eligibilityInfo - The result from determineFundingEligibility
 * @returns {string} A user-friendly message about funding status
 */
export const getFundingStatusMessage = (eligibilityInfo) => {
  if (!eligibilityInfo) return '';
  
  if (eligibilityInfo.message) {
    return eligibilityInfo.message;
  }
  
  if (eligibilityInfo.fundingEligible) {
    const amount = eligibilityInfo.fundingAmount;
    const formatted = new Intl.NumberFormat('en-CA', { 
      style: 'currency', 
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
    
    return `This student is eligible for ${formatted} in funding.`;
  }
  
  return 'This student is not eligible for funding.';
};