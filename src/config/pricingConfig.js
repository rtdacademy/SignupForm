// src/config/pricingConfig.js

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
      monthlyPayment: 366.67,
      oneTimePrice: 1000,
      rejoinFee: 100,
      subscriptionLengthMonths: 3,
      subscriptionTotal: 1100,
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