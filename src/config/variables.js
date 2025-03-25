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
  "Coding": 3
};

export const pricing = {
  adultStudentPerCredit: 120,
  internationalStudentPerCredit: 120,
  depositAmount: 50,
  paymentPlanFee: 40, // New field for payment plan fee
  paypalProcessingFee: 15,
  partialRefundPercentage: 2/3
};

export const refundPeriods = {
  fullRefundDays: 7,  // Number of days for full refund
  partialRefundDays: 30  // Number of days for partial refund
};

// Calculate full tuition based on credits and partial refund
Object.keys(courseCredits).forEach(course => {
  const adultFullTuition = courseCredits[course] * pricing.adultStudentPerCredit;
  const internationalFullTuition = courseCredits[course] * pricing.internationalStudentPerCredit;

  pricing[`adultStudentFullTuition_${course}`] = adultFullTuition;
  pricing[`adultStudentPaymentPlanTuition_${course}`] = adultFullTuition + pricing.paymentPlanFee;
  pricing[`internationalStudentFullTuition_${course}`] = internationalFullTuition;
  pricing[`internationalStudentPaymentPlanTuition_${course}`] = internationalFullTuition + pricing.paymentPlanFee;
  pricing[`adultStudentPartialRefund_${course}`] = Math.round((adultFullTuition * pricing.partialRefundPercentage) * 100) / 100;
  pricing[`internationalStudentPartialRefund_${course}`] = Math.round((internationalFullTuition * pricing.partialRefundPercentage) * 100) / 100;
});

// Environment-specific subscription plans
const sandboxPlans = {
  "ThreeMonthAdultTuition": {
    planId: "P-55B49397RW297144NM24S25I",
    name: "3-Month Payment Plan",
    description: "3 payments of $213.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "213.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult Student",
    credits: 5
  },

  "ThreeMonthAdultTuition3Credits": {
    planId: "P-ADULT3CREDIT_SANDBOX",
    name: "3-Month Payment Plan (3 Credits)",
    description: "3 payments of $133.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "133.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult Student",
    credits: 3
  },
  "ThreeMonthInternationalTuition": {
    planId: "P-1U83118095155151VM26POYI",
    name: "3-Month Payment Plan",
    description: "3 payments of $213.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "213.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "International Student",
    credits: 5
  },
  "ThreeMonthInternationalTuition3Credits": { 
    planId: "P-INTERNATIONAL3CREDIT_SANDBOX", 
    name: "3-Month Payment Plan (3 Credits)",
    description: "3 payments of $133.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "133.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "International Student",
    credits: 3
  },
  // Add other sandbox plans here
};

const productionPlans = {
  "ThreeMonthAdultTuition": {
    planId: "P-26466898G0759344AM3DBZSQ",
    name: "3-Month Payment Plan",
    description: "3 payments of price: $213.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "213.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult Student",
    credits: 5
  },
  "ThreeMonthAdultTuition3Credits": {
    planId: "P-7RE56263SX886284GM3DB4AY",
    name: "3-Month Payment Plan (3 Credits)",
    description: "3 payments of $133.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "133.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult Student",
    credits: 3
  },
  "ThreeMonthInternationalTuition": {
    planId: "P-90L10029W4647961FM3DB57Y",
    name: "3-Month Payment Plan",
    description: "3 payments of $213.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "213.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "International Student",
    credits: 5
  },
  "ThreeMonthInternationalTuition3Credits": {
    planId: "P-18U8766234756931RM3DB6WA", 
    name: "3-Month Payment Plan (3 Credits)",
    description: "3 payments of $133.33 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "133.33 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "International Student",
    credits: 3
  },
  // New test plan
  /*
  "TestAdultThreeMonthPlan": {
    planId: "P-8YM3473233730690VM3DDFYQ",
    name: "Test 3-Month Payment Plan ($1)",
    description: "3 payments of $1.00 CAD each, with the first payment now and subsequent payments each month.",
    setupFee: "0.00 CAD",
    price: "1.00 CAD",
    billingCycle: "Every 1 month",
    numberOfBillingCycles: 3,
    studentType: "Adult Student",
    credits: 5  // You can adjust this as needed
    
  }, 
  */
  // Add other production plans here
};

export const subscriptionPlans = process.env.REACT_APP_PAYPAL_ENV === 'sandbox' ? sandboxPlans : productionPlans;


// Student Type Information (in questionair to determine student type)
export const studentTypeInfo = {
  'Non-Primary': "Non-Primary Students are school-aged students that have a primary registration at another high school in Alberta. You may take up to 10 credits per school year for free.",
  'Home Education': "Home Education Students are school-aged students whose education is parent-directed and overseen by a school board as part of a Home Education Program. You may take up to 10 credits per school year for free.",
  'Summer School': "Summer School Students are School-aged Alberta students intending to complete their course in July or August. Courses are free for students under 20 before September of the current school year.",
  'Adult Student': `Adult Students include Canadian citizens and permanent residents who do not qualify for other categories. This includes students under 20 for whom our school does not receive grant funding, and out-of-province Canadian students. Fees are $${pricing.adultStudentPerCredit} per credit.`,
  'International Student': `International Students include students who are not Canadian citizens or permanent residents. Fees are $${pricing.internationalStudentPerCredit} per credit (special introductory rate).`
};