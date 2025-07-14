// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Question pool with complete configuration
const questionPool = [
  {
    questionText: "0.020 J of work is done on a charge of 80 μC as it jumps across a spark gap in the spark plug of a car. What was the potential difference across the gap?",
    options: [
      { id: 'a', text: '250 V', feedback: 'Correct! V = W/q = 0.020 J / (80 × 10⁻⁶ C) = 250 V' },
      { id: 'b', text: '125 V', feedback: 'Incorrect. Check your calculation - make sure to convert μC to C correctly.' },
      { id: 'c', text: '400 V', feedback: 'Incorrect. You may have made an error in the unit conversion or calculation.' },
      { id: 'd', text: '1600 V', feedback: 'Incorrect. This would be the result if you forgot to convert μC to C.' }
    ],
    correctOptionId: 'a',
    explanation: 'Potential difference V = W/q = 0.020 J / (80 × 10⁻⁶ C) = 250 V. This relationship comes from the definition of electric potential.',
    difficulty: 'intermediate',
    tags: ['calculations', 'potential-difference', 'work-energy']
  },
  {
    questionText: "What maximum speed will an alpha particle reach if it moves from rest through a potential difference of 6500 V?",
    options: [
      { id: 'a', text: '7.9 × 10⁵ m/s', feedback: 'Correct! Using qV = ½mv², v = √(2qV/m) = √(2×2e×6500V/6.64×10⁻²⁷kg)' },
      { id: 'b', text: '3.9 × 10⁵ m/s', feedback: 'Incorrect. Check that you used the correct charge for an alpha particle (2e).' },
      { id: 'c', text: '1.1 × 10⁶ m/s', feedback: 'Incorrect. Verify your calculation of kinetic energy conversion.' },
      { id: 'd', text: '5.6 × 10⁵ m/s', feedback: 'Incorrect. Make sure you used the correct mass for an alpha particle.' }
    ],
    correctOptionId: 'a',
    explanation: 'For an alpha particle: q = 2e = 3.2×10⁻¹⁹ C, m = 6.64×10⁻²⁷ kg. Using qV = ½mv²: v = √(2qV/m) = √(2×3.2×10⁻¹⁹×6500/6.64×10⁻²⁷) = 7.9×10⁵ m/s',
    difficulty: 'advanced',
    tags: ['calculations', 'kinetic-energy', 'alpha-particle']
  },
  {
    questionText: "How much kinetic energy does a completely ionized fluorine nucleus have when it is accelerated by a potential difference of 0.60 MV? (Note: completely ionized means all electrons stripped away, so charge equals number of protons)",
    options: [
      { id: 'a', text: '8.64 × 10⁻¹³ J', feedback: 'Correct! KE = qV = (9e)(0.60×10⁶V) = 9×1.60×10⁻¹⁹×0.60×10⁶ = 8.64×10⁻¹³ J' },
      { id: 'b', text: '9.6 × 10⁻¹⁴ J', feedback: 'Incorrect. This would be for a single proton charge (1e), not fluorine (9e).' },
      { id: 'c', text: '1.44 × 10⁻¹² J', feedback: 'Incorrect. Check your calculation of the charge multiplication.' },
      { id: 'd', text: '5.76 × 10⁻¹³ J', feedback: 'Incorrect. Verify that you used 9 protons for fluorine.' }
    ],
    correctOptionId: 'a',
    explanation: 'Fluorine has 9 protons, so completely ionized F has charge q = 9e = 9×1.60×10⁻¹⁹ C. KE = qV = 9×1.60×10⁻¹⁹×0.60×10⁶ = 8.64×10⁻¹³ J',
    difficulty: 'advanced',
    tags: ['calculations', 'kinetic-energy', 'ionization']
  },
  {
    questionText: "An alpha particle is accelerated to 1/10th the speed of light. What minimum potential difference is required to do this?",
    options: [
      { id: 'a', text: '9.35 MV', feedback: 'Correct! Using qV = ½mv²: V = mv²/2q with v = c/10 = 3.0×10⁷ m/s' },
      { id: 'b', text: '4.68 MV', feedback: 'Incorrect. Check that you used the correct charge for an alpha particle (2e).' },
      { id: 'c', text: '18.7 MV', feedback: 'Incorrect. You may have used the wrong charge or made a calculation error.' },
      { id: 'd', text: '2.34 MV', feedback: 'Incorrect. Verify your kinetic energy calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'For alpha particle: q = 2e, m = 6.64×10⁻²⁷ kg, v = c/10 = 3.0×10⁷ m/s. V = mv²/2q = (6.64×10⁻²⁷)(3.0×10⁷)²/2(3.2×10⁻¹⁹) = 9.35×10⁶ V = 9.35 MV',
    difficulty: 'advanced',
    tags: ['calculations', 'potential-difference', 'relativistic']
  },
  {
    questionText: "Assuming that it started from rest, what is the momentum of a proton after it has gone through a potential difference of 20.0 kV?",
    options: [
      { id: 'a', text: '3.27 × 10⁻²¹ kg⋅m/s', feedback: 'Correct! p = mv = m√(2qV/m) = √(2mqV) = √(2×1.67×10⁻²⁷×1.6×10⁻¹⁹×20000)' },
      { id: 'b', text: '1.64 × 10⁻²¹ kg⋅m/s', feedback: 'Incorrect. Check your calculation - you may have missed a factor of 2.' },
      { id: 'c', text: '6.54 × 10⁻²¹ kg⋅m/s', feedback: 'Incorrect. Verify your momentum formula derivation.' },
      { id: 'd', text: '2.31 × 10⁻²¹ kg⋅m/s', feedback: 'Incorrect. Double-check your values for proton mass and charge.' }
    ],
    correctOptionId: 'a',
    explanation: 'From qV = ½mv², we get v = √(2qV/m). Momentum p = mv = m√(2qV/m) = √(2mqV) = √(2×1.67×10⁻²⁷×1.6×10⁻¹⁹×20000) = 3.27×10⁻²¹ kg⋅m/s',
    difficulty: 'advanced',
    tags: ['calculations', 'momentum', 'proton']
  },
  {
    questionText: "An electron is released from rest adjacent to the negative plate in a parallel plate apparatus. A potential difference of 500 V is maintained between the plates, and they are in a vacuum. With what speed does the electron collide with the positive plate?",
    options: [
      { id: 'a', text: '1.3 × 10⁷ m/s', feedback: 'Correct! v = √(2eV/m) = √(2×1.6×10⁻¹⁹×500/9.11×10⁻³¹) = 1.3×10⁷ m/s' },
      { id: 'b', text: '6.5 × 10⁶ m/s', feedback: 'Incorrect. Check your calculation - you may have made an error with the square root.' },
      { id: 'c', text: '2.6 × 10⁷ m/s', feedback: 'Incorrect. Verify that you used the correct electron mass.' },
      { id: 'd', text: '9.4 × 10⁶ m/s', feedback: 'Incorrect. Double-check your energy conversion calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using conservation of energy: eV = ½mv². Solving for v: v = √(2eV/m) = √(2×1.6×10⁻¹⁹×500/9.11×10⁻³¹) = 1.3×10⁷ m/s',
    difficulty: 'intermediate',
    tags: ['calculations', 'electron', 'parallel-plates']
  }
];

// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Assessment configurations for master function 
const assessmentConfigs = {
  'course2_30_question1': {
    type: 'multiple-choice',
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
  'course2_30_question2': {
    type: 'multiple-choice',
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
  'course2_30_question3': {
    type: 'multiple-choice',
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
  'course2_30_question4': {
    type: 'multiple-choice',
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
  'course2_30_question5': {
    type: 'multiple-choice',
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
  'course2_30_question6': {
    type: 'multiple-choice',
    questions: [questionPool[5]],
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

module.exports = { 
  assessmentConfigs
};