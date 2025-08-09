// Home Education Configuration - Values that may change year to year
// RTD Connect - Alberta Home Education Portal

// Tagline
export const TAGLINE = "Rooted in Relationship • Thriving in Freedom • Dynamic by Design";

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

// Contact Information
export const CONTACT_INFO = {
  MAIN: {
    email: 'connect@rtdacademy.com',
    phone: '(403) 555-0123',
    location: 'Calgary, Alberta'
  }
};

// Reimbursement Settings
export const REIMBURSEMENT_SETTINGS = {
  RECEIPT_UPLOAD_DEADLINE: {
    month: 5, // June (0-indexed, so 5 = June)
    day: 30,
    description: 'Deadline for submitting receipts for current school year',
    formatted: 'June 30th'
  }
};

export default {
  TAGLINE,
  FUNDING_RATES,
  CONTACT_INFO,
  REIMBURSEMENT_SETTINGS
};