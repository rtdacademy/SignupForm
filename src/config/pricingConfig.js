// src/config/pricingConfig.js

// =============================================================================
// GENERAL PRICING CONFIGURATION
// =============================================================================
export const PRICING = {
  pricePerExtraCredit: 100, // Cost per credit beyond free limits
  distanceEducationGrant: 650, // DE grant per student per year
  rtdConnectReimbursement: {
    grades1to12: 901, // Annual reimbursement for grades 1-12
    kindergarten: 450 // Annual reimbursement for kindergarten
  },
  adultStudent: {
    oneTimePrice: 650, // One-time payment for adult students
    monthlyPayment: 233.33, // Monthly payment amount
    monthlyPaymentMonths: 3, // Number of months for payment plan
    monthlyPaymentTotal: 700, // Total cost for monthly payment plan
    trialPeriodDays: 7, // Trial period length
    gracePeriodDays: 10, // Days behind schedule before lockout
    rejoinFee: 100 // Fee to reset schedule after lockout
  }
};

// =============================================================================
// CREDITS CONFIGURATION
// =============================================================================
export const CREDITS = {
  maxPerYear: 10, // Maximum free credits during school year
  maxSummer: 10, // Maximum free credits during summer
  maxTotalPerYear: 20 // Total possible free credits (school year + summer)
};

// =============================================================================
// AGES AND GRADES CONFIGURATION
// =============================================================================
export const AGES_GRADES = {
  adultStudentMinAge: 20, // Age cutoff for adult students
  ageVerificationDate: 'September 1', // Date to check age for student type
  highSchoolStart: 10, // First high school grade
  highSchoolEnd: 12, // Last high school grade
  elementaryStart: 1, // First elementary grade
  kindergarten: 'K' // Kindergarten designation
};

// =============================================================================
// STUDENT TYPE SPECIFIC PRICING
// =============================================================================
const pricingConfig = {
    adultStudents: {
      lockoutAfterDays: 10,
      monthlyPayment: 233.33,
      oneTimePrice: 650,
      rejoinFee: 100,
      subscriptionLengthMonths: 3,
      subscriptionTotal: 700,
      trialPeriodDays: 7
    },
    homeEducationStudents: {
      lockoutAfterDays: 10,
      rejoinFee: 80
    },
    internationalStudents: {
      lockoutAfterDays: 10,
      monthlyPayment: 233.33,
      oneTimePrice: 650,
      rejoinFee: 100,
      subscriptionLengthMonths: 3,
      subscriptionTotal: 700,
      trialPeriodDays: 7
    },
    nonPrimaryStudents: {
      lockoutAfterDays: 10,
      rejoinFee: 80
    }
  };
  
  // Helper functions to access pricing information
  export const getPricingForStudentType = (studentType) => {
    return pricingConfig[studentType] || null;
  };
  
  export const getMonthlyPayment = (studentType) => {
    return pricingConfig[studentType]?.monthlyPayment || null;
  };
  
  export const getOneTimePrice = (studentType) => {
    return pricingConfig[studentType]?.oneTimePrice || null;
  };
  
  export const getRejoinFee = (studentType) => {
    return pricingConfig[studentType]?.rejoinFee || null;
  };
  
  export const getLockoutDays = (studentType) => {
    return pricingConfig[studentType]?.lockoutAfterDays || null;
  };
  
  export const getTrialPeriodDays = (studentType) => {
    return pricingConfig[studentType]?.trialPeriodDays || null;
  };
  
  // Export the entire config object as well
  export default pricingConfig;