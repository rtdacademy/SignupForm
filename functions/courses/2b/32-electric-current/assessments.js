const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Question pool with complete configuration
const questionPool = [
  {
    questionText: "Calculate the amount of current through an electric toaster if it takes 900 C of charge to toast two slices of bread in 1.5 min.",
    options: [
      { id: 'a', text: '10 A', feedback: 'Correct! I = Q/t = 900 C / (1.5 × 60 s) = 900 C / 90 s = 10 A' },
      { id: 'b', text: '6.0 A', feedback: 'Incorrect. Make sure to convert 1.5 minutes to seconds (90 s).' },
      { id: 'c', text: '15 A', feedback: 'Incorrect. Check your time conversion - 1.5 min = 90 s, not 60 s.' },
      { id: 'd', text: '600 A', feedback: 'Incorrect. You may have forgotten to convert minutes to seconds.' }
    ],
    correctOptionId: 'a',
    explanation: 'Current I = Q/t = 900 C / (1.5 × 60 s) = 900 C / 90 s = 10 A. Remember to convert time to seconds.',
    difficulty: 'intermediate',
    tags: ['calculations', 'current', 'charge-time']
  },
  {
    questionText: "A light bulb with a current of 0.80 A is left burning for 20 min. How much electric charge passes through the filament of the bulb?",
    options: [
      { id: 'a', text: '9.6 × 10² C', feedback: 'Correct! Q = It = (0.80 A)(20 × 60 s) = (0.80 A)(1200 s) = 960 C = 9.6 × 10² C' },
      { id: 'b', text: '16 C', feedback: 'Incorrect. Make sure to convert 20 minutes to seconds (1200 s).' },
      { id: 'c', text: '4.0 × 10¹ C', feedback: 'Incorrect. Check your time conversion and calculation.' },
      { id: 'd', text: '1.9 × 10³ C', feedback: 'Incorrect. Verify your multiplication of current and time.' }
    ],
    correctOptionId: 'a',
    explanation: 'Charge Q = It = (0.80 A)(20 × 60 s) = (0.80 A)(1200 s) = 960 C = 9.6 × 10² C',
    difficulty: 'intermediate',
    tags: ['calculations', 'charge', 'current-time']
  },
  {
    questionText: "A gold-leaf electroscope with 1.25 × 10¹⁰ excess electrons is grounded and discharges completely in 0.50 s. Calculate the average current through the grounding wire.",
    options: [
      { id: 'a', text: '4.0 × 10⁻⁹ A', feedback: 'Correct! Q = Ne = (1.25×10¹⁰)(1.6×10⁻¹⁹) = 2.0×10⁻⁹ C, I = Q/t = 2.0×10⁻⁹/0.50 = 4.0×10⁻⁹ A' },
      { id: 'b', text: '2.0 × 10⁻⁹ A', feedback: 'Incorrect. This is the total charge, but you need to divide by time to get current.' },
      { id: 'c', text: '8.0 × 10⁻⁹ A', feedback: 'Incorrect. Check your calculation of charge from number of electrons.' },
      { id: 'd', text: '2.5 × 10¹⁰ A', feedback: 'Incorrect. You may have forgotten to multiply by electron charge.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find charge: Q = Ne = (1.25×10¹⁰)(1.6×10⁻¹⁹ C) = 2.0×10⁻⁹ C. Then current: I = Q/t = 2.0×10⁻⁹ C / 0.50 s = 4.0×10⁻⁹ A',
    difficulty: 'advanced',
    tags: ['calculations', 'electrons', 'discharge-current']
  },
  {
    questionText: "A small electric motor draws a current of 0.40 A. How long will it take for 8.0 C of charge to pass through it?",
    options: [
      { id: 'a', text: '20 s', feedback: 'Correct! t = Q/I = 8.0 C / 0.40 A = 20 s' },
      { id: 'b', text: '3.2 s', feedback: 'Incorrect. This would be if you multiplied instead of divided.' },
      { id: 'c', text: '50 s', feedback: 'Incorrect. Check your division calculation.' },
      { id: 'd', text: '0.05 s', feedback: 'Incorrect. Make sure you\'re using the correct formula: t = Q/I.' }
    ],
    correctOptionId: 'a',
    explanation: 'Time t = Q/I = 8.0 C / 0.40 A = 20 s. This comes from rearranging I = Q/t.',
    difficulty: 'intermediate',
    tags: ['calculations', 'time', 'current-charge']
  },
  {
    questionText: "How many electrons pass through a light bulb in each second if the bulb has a current of 0.50 A through it?",
    options: [
      { id: 'a', text: '3.1 × 10¹⁸', feedback: 'Correct! N = Q/e = It/e = (0.50 A)(1 s)/(1.6×10⁻¹⁹ C) = 3.125×10¹⁸ ≈ 3.1×10¹⁸ electrons' },
      { id: 'b', text: '8.0 × 10⁻²⁰', feedback: 'Incorrect. This would be if you multiplied by electron charge instead of dividing.' },
      { id: 'c', text: '1.6 × 10¹⁹', feedback: 'Incorrect. Check your calculation - you may have used the wrong value.' },
      { id: 'd', text: '5.0 × 10¹⁷', feedback: 'Incorrect. Verify your division of current by electron charge.' }
    ],
    correctOptionId: 'a',
    explanation: 'Number of electrons N = Q/e = It/e = (0.50 A)(1 s)/(1.6×10⁻¹⁹ C/electron) = 3.125×10¹⁸ ≈ 3.1×10¹⁸ electrons per second',
    difficulty: 'advanced',
    tags: ['calculations', 'electrons-per-second', 'current']
  },
  {
    questionText: "A portable radio is connected to a 9.0 V battery and draws a current of 25 mA. What is the resistance of the radio?",
    options: [
      { id: 'a', text: '3.6 × 10² Ω', feedback: 'Correct! R = V/I = 9.0 V / (25×10⁻³ A) = 9.0 V / 0.025 A = 360 Ω = 3.6×10² Ω' },
      { id: 'b', text: '2.8 × 10⁻³ Ω', feedback: 'Incorrect. This would be if you divided I by V instead of V by I.' },
      { id: 'c', text: '0.23 × 10³ Ω', feedback: 'Incorrect. Check your conversion of mA to A (25 mA = 0.025 A).' },
      { id: 'd', text: '2.3 × 10² Ω', feedback: 'Incorrect. Verify your calculation of voltage divided by current.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Ohm\'s Law: R = V/I = 9.0 V / (25×10⁻³ A) = 9.0 V / 0.025 A = 360 Ω = 3.6×10² Ω',
    difficulty: 'intermediate',
    tags: ['calculations', 'ohms-law', 'resistance']
  },
  {
    questionText: "An electric clothes dryer is connected to a 230 V source of electric potential. If it has a resistance of 9.2 Ω, calculate the current it draws.",
    options: [
      { id: 'a', text: '25 A', feedback: 'Correct! I = V/R = 230 V / 9.2 Ω = 25 A' },
      { id: 'b', text: '2116 A', feedback: 'Incorrect. This would be if you multiplied V × R instead of dividing V by R.' },
      { id: 'c', text: '0.040 A', feedback: 'Incorrect. This would be if you divided R by V instead of V by R.' },
      { id: 'd', text: '221 A', feedback: 'Incorrect. Check your division calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Ohm\'s Law: I = V/R = 230 V / 9.2 Ω = 25 A',
    difficulty: 'intermediate',
    tags: ['calculations', 'ohms-law', 'current']
  },
  {
    questionText: "A large tube in a television set has a resistance of 5.0 × 10⁴ Ω and draws a current of 160 mA. What is the potential difference across the tube?",
    options: [
      { id: 'a', text: '8.0 × 10³ V', feedback: 'Correct! V = IR = (160×10⁻³ A)(5.0×10⁴ Ω) = (0.16 A)(50000 Ω) = 8000 V = 8.0×10³ V' },
      { id: 'b', text: '3.1 × 10⁵ V', feedback: 'Incorrect. Check your conversion of mA to A (160 mA = 0.16 A).' },
      { id: 'c', text: '3.2 × 10⁻³ V', feedback: 'Incorrect. This would be if you divided R by I instead of multiplying I × R.' },
      { id: 'd', text: '8.0 × 10⁶ V', feedback: 'Incorrect. Verify your multiplication and unit conversion.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Ohm\'s Law: V = IR = (160×10⁻³ A)(5.0×10⁴ Ω) = (0.16 A)(50000 Ω) = 8000 V = 8.0×10³ V',
    difficulty: 'intermediate',
    tags: ['calculations', 'ohms-law', 'voltage']
  },
  {
    questionText: "An electric toaster has a resistance of 12 Ω. What current will it draw from a 120 V supply?",
    options: [
      { id: 'a', text: '10 A', feedback: 'Correct! I = V/R = 120 V / 12 Ω = 10 A' },
      { id: 'b', text: '1440 A', feedback: 'Incorrect. This would be if you multiplied V × R instead of dividing V by R.' },
      { id: 'c', text: '0.10 A', feedback: 'Incorrect. This would be if you divided R by V instead of V by R.' },
      { id: 'd', text: '132 A', feedback: 'Incorrect. This would be if you added V + R instead of using Ohm\'s Law.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Ohm\'s Law: I = V/R = 120 V / 12 Ω = 10 A',
    difficulty: 'basic',
    tags: ['calculations', 'ohms-law', 'current']
  },
  {
    questionText: "What potential difference is required to produce a current of 8.0 A in a load having a resistance of 64 Ω?",
    options: [
      { id: 'a', text: '5.1 × 10² V', feedback: 'Correct! V = IR = (8.0 A)(64 Ω) = 512 V = 5.1×10² V' },
      { id: 'b', text: '8.0 V', feedback: 'Incorrect. This would be if you divided R by I instead of multiplying I × R.' },
      { id: 'c', text: '0.125 V', feedback: 'Incorrect. This would be if you divided I by R instead of multiplying I × R.' },
      { id: 'd', text: '72 V', feedback: 'Incorrect. This would be if you added I + R instead of using Ohm\'s Law.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Ohm\'s Law: V = IR = (8.0 A)(64 Ω) = 512 V = 5.1×10² V',
    difficulty: 'intermediate',
    tags: ['calculations', 'ohms-law', 'voltage']
  },
  {
    questionText: "What is the difference between \"conventional current\" and \"electron flow\"?",
    options: [
      { id: 'a', text: 'Conventional current flows from positive to negative terminal; electron flow goes from negative to positive terminal', feedback: 'Correct! Conventional current is defined as positive charge flow (+ to -), while electrons actually flow in the opposite direction (- to +).' },
      { id: 'b', text: 'Conventional current flows from negative to positive terminal; electron flow goes from positive to negative terminal', feedback: 'Incorrect. This is backwards - conventional current is defined as flowing from positive to negative.' },
      { id: 'c', text: 'They are exactly the same - both flow from positive to negative terminal', feedback: 'Incorrect. They flow in opposite directions due to the historical definition of current direction.' },
      { id: 'd', text: 'Conventional current only exists in AC circuits; electron flow only exists in DC circuits', feedback: 'Incorrect. Both concepts apply to all electrical circuits - it\'s about the direction of charge flow.' }
    ],
    correctOptionId: 'a',
    explanation: 'Conventional current was defined historically as the flow of positive charge from positive to negative terminal. However, electrons (negative charges) actually flow from negative to positive terminal. Both conventions give the same mathematical results.',
    difficulty: 'intermediate',
    tags: ['concepts', 'current-direction', 'electron-flow']
  }
];

// Individual question exports for SlideshowKnowledgeCheck
exports.course2_32_question1 = createStandardMultipleChoice({
  questions: [questionPool[0]], // Toaster current calculation
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question2 = createStandardMultipleChoice({
  questions: [questionPool[1]], // Light bulb charge
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question3 = createStandardMultipleChoice({
  questions: [questionPool[2]], // Electroscope discharge current
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question4 = createStandardMultipleChoice({
  questions: [questionPool[3]], // Motor time calculation
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question5 = createStandardMultipleChoice({
  questions: [questionPool[4]], // Electrons per second
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question6 = createStandardMultipleChoice({
  questions: [questionPool[5]], // Radio resistance
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question7 = createStandardMultipleChoice({
  questions: [questionPool[6]], // Clothes dryer current
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question8 = createStandardMultipleChoice({
  questions: [questionPool[7]], // TV tube voltage
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question9 = createStandardMultipleChoice({
  questions: [questionPool[8]], // Toaster current from voltage
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question10 = createStandardMultipleChoice({
  questions: [questionPool[9]], // Load voltage requirement
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

exports.course2_32_question11 = createStandardMultipleChoice({
  questions: [questionPool[10]], // Conventional current vs electron flow
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: 'lesson',
  theme: 'indigo'
});

// Assessment configurations for master function 
const assessmentConfigs = {
  'course2_32_question1': {
    questions: [questionPool[0]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question2': {
    questions: [questionPool[1]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question3': {
    questions: [questionPool[2]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question4': {
    questions: [questionPool[3]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question5': {
    questions: [questionPool[4]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question6': {
    questions: [questionPool[5]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question7': {
    questions: [questionPool[6]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question8': {
    questions: [questionPool[7]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question9': {
    questions: [questionPool[8]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question10': {
    questions: [questionPool[9]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_32_question11': {
    questions: [questionPool[10]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  }
};

// Export for master function
exports.assessmentConfigs = assessmentConfigs;