// Payment configuration for different student types and credit purchases

export const PAYMENT_CONFIG = {
  // Course-based payment options (for adult and international students)
  coursePaymentOptions: {
    adultStudents: {
      trialPeriodDays: 10, // 10-day free trial for adult students
      onetime: {
        id: 'price_1QNT5yFQ2LFjAOXoBBSx1W5a',
        name: 'One-time Payment',
        amount: 650,
        description: 'Pay full amount upfront and save $50',
        currency: 'CAD'
      },
      subscription: {
        id: 'price_1QNT5nFQ2LFjAOXoa9eGZork',
        name: 'Monthly Payments',
        amount: 233.33,
        total: 700,
        description: '3 monthly payments of $233.33',
        currency: 'CAD'
      }
    },
    internationalStudents: {
      trialPeriodDays: 10, // 10-day free trial for international students
      onetime: {
        id: 'price_1QNT5yFQ2LFjAOXoBBSx1W5a', // Update with actual Stripe price ID
        name: 'One-time Payment',
        amount: 650,
        description: 'Pay full amount upfront and save $50',
        currency: 'CAD'
      },
      subscription: {
        id: 'price_1QNT5nFQ2LFjAOXoa9eGZork', // Update with actual Stripe price ID
        name: 'Monthly Payments',
        amount: 233.33,
        total: 700,
        description: '3 monthly payments of $233.33',
        currency: 'CAD'
      }
    }
  },
  
  // Credit-based payment configuration
  creditPricing: {
    stripePriceId: 'price_1S3lLkFQ2LFjAOXovvmvl89E', // Price per credit
    priceInCents: 10000, // $100 in cents
    currency: 'CAD'
  }
};

// Helper function to get payment options for a specific student type
export const getPaymentOptionsForStudentType = (studentType) => {
  // Normalize the student type (remove 'Students' suffix if present)
  const normalizedType = studentType.replace('Students', 'Students');
  return PAYMENT_CONFIG.coursePaymentOptions[normalizedType] || 
         PAYMENT_CONFIG.coursePaymentOptions.adultStudents; // Default to adult pricing
};

// Helper function to get credit pricing
export const getCreditPricing = () => {
  return PAYMENT_CONFIG.creditPricing;
};

// Helper function to get trial period days for a student type
export const getTrialPeriodDays = (studentType) => {
  // Normalize the student type (handle both 'adultStudents' and 'Adult Student' formats)
  const normalizedType = studentType.replace(' Student', 'Students')
    .replace('Students', 'Students')
    .replace(' ', '')
    .charAt(0).toLowerCase() + studentType.replace(' Student', 'Students').replace(' ', '').slice(1);
  
  return PAYMENT_CONFIG.coursePaymentOptions[normalizedType]?.trialPeriodDays || 0;
};

// Helper function to format currency
export const formatPrice = (amount, currency = 'CAD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

export default PAYMENT_CONFIG;