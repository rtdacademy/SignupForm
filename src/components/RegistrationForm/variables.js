// variables.js

export const courseSharepointIDs = {
  "Math 10C": 2,
  "Math 10-4": 3,
  "Math 31 (Calculus)": 23,
  "Math 15": 24,
  "Math 20-1": 25,
  "Math 10-3": 26,
  "Math 20-2": 30,
  "Math 20-3": 31,
  "Math 20-4": 32,
  "Math 30-1": 33,
  "Math 30-3": 34,
  "Math 30-2": 35,
  "Coding": 41
};

export const courseCredits = {
  "Math 10C": 5,
  "Math 10-4": 5,
  "Math 31 (Calculus)": 5,
  "Math 15": 3,
  "Math 20-1": 5,
  "Math 10-3": 5,
  "Math 20-2": 5,
  "Math 20-3": 5,
  "Math 20-4": 5,
  "Math 30-1": 5,
  "Math 30-3": 5,
  "Math 30-2": 5,
  "Coding": 0 // Coding is a flat rate, not per credit
};

export const pricing = {
  adultStudentPerCredit: 100,
  internationalStudentPerCredit: 100,
  depositAmount: 50,
  codingAdultStudentFlatRate: 300,
  codingInternationalStudentFlatRate: 300,
  codingAdultStudentPartialRefund: 200,
  codingInternationalStudentPartialRefund: 200,
  paymentPlanFee: 60, // New field for payment plan fee
  paypalProcessingFee: 15
};

// Calculate full tuition based on credits and partial refund
Object.keys(courseCredits).forEach(course => {
  if (course !== "Coding") {
    const adultFullTuition = courseCredits[course] * pricing.adultStudentPerCredit;
    const internationalFullTuition = courseCredits[course] * pricing.internationalStudentPerCredit;

    pricing[`adultStudentFullTuition_${course}`] = adultFullTuition;
    pricing[`adultStudentPaymentPlanTuition_${course}`] = adultFullTuition + pricing.paymentPlanFee;
    pricing[`internationalStudentFullTuition_${course}`] = internationalFullTuition;
    pricing[`internationalStudentPaymentPlanTuition_${course}`] = internationalFullTuition + pricing.paymentPlanFee;
    pricing[`adultStudentPartialRefund_${course}`] = Math.round((adultFullTuition * 2/3) * 100) / 100;
    pricing[`internationalStudentPartialRefund_${course}`] = Math.round((internationalFullTuition * 2/3) * 100) / 100;
  }
});

// Environment-specific subscription plans
const sandboxPlans = {
  "TwoMonthAdultTuition": {
    planId: "P-52F43221EY787380SM24SZQI",
    description: "Two Month Adult Tuition: 2 payments of 280.00 CAD each, with the first payment now and the second in one month.",
    setupFee: "0.00 CAD",
    price: "280.00 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 2,
    studentType: "Adult"
  },
  "ThreeMonthAdultTuition": {
    planId: "P-55B49397RW297144NM24S25I",
    description: "Three Month Adult Tuition: 3 payments of 186.67 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "186.67 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult"
  }
  // Add other sandbox plans here
};

const productionPlans = {
  "TwoMonthAdultTuition": {
    planId: "YOUR_PRODUCTION_PLAN_ID_HERE",
    description: "Two Month Adult Tuition: 2 payments of 280.00 CAD each, with the first payment now and the second in one month.",
    setupFee: "0.00 CAD",
    price: "280.00 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 2,
    studentType: "Adult"
  },
  "ThreeMonthAdultTuition": {
    planId: "YOUR_PRODUCTION_PLAN_ID_HERE",
    description: "Three Month Adult Tuition: 3 payments of 186.67 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "186.67 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult"
  }
  // Add other production plans here
};

export const subscriptionPlans = process.env.REACT_APP_PAYPAL_ENV === 'sandbox' ? sandboxPlans : productionPlans;