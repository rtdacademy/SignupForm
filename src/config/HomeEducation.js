// Home Education Configuration - Values that may change year to year
// RTD Connect - Alberta Home Education Portal

// Funding Rates (per student, per year)
export const FUNDING_RATES = {
  GRADES_1_TO_12: {
    amount: 901,
    description: "Grades 1-12 funding per student per year",
    formatted: "$901"
  },
  KINDERGARTEN: {
    amount: 450.50,
    description: "Kindergarten funding per student per year", 
    formatted: "$450.50"
  }
};

// Academic Performance Stats
export const ACADEMIC_STATS = {
  HOME_EDUCATION_DIPLOMA_AVERAGE: {
    percentage: 74,
    description: "Home educated students diploma exam average"
  },
  PROVINCIAL_DIPLOMA_AVERAGE: {
    percentage: 67,
    description: "Alberta provincial diploma exam average"
  }
};

// Contact Information
export const CONTACT_INFO = {
  MAIN: {
    email: 'connect@rtdacademy.com',
    phone: '(403) 555-0123',
    location: 'Calgary, Alberta'
  }
};

// Portal Statistics
export const PORTAL_STATS = {
  COMMUNITY_PARTNERS: {
    count: '100+',
    description: 'Community Partners'
  }
};

export default {
  FUNDING_RATES,
  ACADEMIC_STATS,
  CONTACT_INFO,
  PORTAL_STATS
};