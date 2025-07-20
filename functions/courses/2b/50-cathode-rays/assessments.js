// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

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
    questionText: "What is the expression for the speed of a cathode ray particle passing straight through perpendicular electric and magnetic fields?",
    options: [
      { id: 'a', text: 'v = qE/B', feedback: 'Incorrect. This includes charge q unnecessarily - the charge cancels out in the equilibrium condition.' },
      { id: 'b', text: 'v = E/B', feedback: 'Correct! For undeflected motion through perpendicular fields, qE = qvB, so v = E/B.' },
      { id: 'c', text: 'v = B/E', feedback: 'Incorrect. This is the reciprocal of the correct expression.' },
      { id: 'd', text: 'v = 1/(EB)', feedback: 'Incorrect. This is dimensionally incorrect and not the equilibrium condition.' }
    ],
    correctOptionId: 'b',
    explanation: 'When a charged particle moves undeflected through perpendicular electric and magnetic fields, the electric force (qE) equals the magnetic force (qvB). Setting them equal: qE = qvB, the charges cancel giving v = E/B.',
    difficulty: 'intermediate',
    tags: ['velocity-selector', 'electric-field', 'magnetic-field', 'equilibrium']
  },
  {
    questionText: "What is the expression to find the charge-to-mass ratio q/m of a cathode ray particle?",
    options: [
      { id: 'a', text: 'q/m = v/(rB)', feedback: 'Incorrect. This is missing the electric field component needed for the complete derivation.' },
      { id: 'b', text: 'q/m = E/(rB²)', feedback: 'Incorrect. This has incorrect powers of the magnetic field.' },
      { id: 'c', text: 'q/m = v²/(rB)', feedback: 'Incorrect. The velocity should not be squared in this expression.' },
      { id: 'd', text: 'q/m = E/(vB²)', feedback: 'Correct! From the magnetic force equation and velocity selector, q/m = E/(vB²).' }
    ],
    correctOptionId: 'd',
    explanation: 'The charge-to-mass ratio is derived from combining the velocity selector (v = E/B) with the magnetic force equation (qvB = mv²/r). This gives q/m = E/(vB²).',
    difficulty: 'advanced',
    tags: ['charge-to-mass-ratio', 'derivation', 'thomson-method']
  },
  {
    questionText: "Cathode ray particles move at 4.0 × 10⁷ m/s through a magnetic field of 1.0 × 10⁻⁴ T. The capacitor plates are 2.0 cm apart. What is the potential difference across the plates?",
    options: [
      { id: 'a', text: '20 V', feedback: 'Incorrect. Check your unit conversion - did you convert cm to meters?' },
      { id: 'b', text: '40 V', feedback: 'Incorrect. You may have made an error in the calculation or unit conversion.' },
      { id: 'c', text: '80 V', feedback: 'Correct! E = vB = (4.0 × 10⁷)(1.0 × 10⁻⁴) = 4000 V/m. V = Ed = 4000 × 0.02 = 80 V.' },
      { id: 'd', text: '160 V', feedback: 'Incorrect. You may have doubled the result or made an error in the electric field calculation.' }
    ],
    correctOptionId: 'c',
    explanation: 'For undeflected motion: E = vB = (4.0 × 10⁷ m/s)(1.0 × 10⁻⁴ T) = 4000 V/m. The potential difference is V = Ed = 4000 V/m × 0.02 m = 80 V.',
    difficulty: 'intermediate',
    tags: ['potential-difference', 'electric-field', 'unit-conversion']
  },
  {
    questionText: "If alpha particles travel at 5.0 × 10⁷ m/s through a 2.0 T magnetic field, what is the radius of deflection?",
    options: [
      { id: 'a', text: '0.26 m', feedback: 'Incorrect. You may have used the wrong mass or charge for alpha particles.' },
      { id: 'b', text: '0.39 m', feedback: 'Incorrect. Check your values for alpha particle mass and charge.' },
      { id: 'c', text: '0.52 m', feedback: 'Correct! r = mv/(qB) = (6.64 × 10⁻²⁷ kg)(5.0 × 10⁷ m/s)/((3.2 × 10⁻¹⁹ C)(2.0 T)) = 0.52 m.' },
      { id: 'd', text: '1.04 m', feedback: 'Incorrect. You may have used the wrong charge (perhaps electron charge instead of 2e).' }
    ],
    correctOptionId: 'c',
    explanation: 'For an alpha particle: m = 6.64 × 10⁻²⁷ kg, q = 2e = 3.2 × 10⁻¹⁹ C. Using r = mv/(qB): r = (6.64 × 10⁻²⁷)(5.0 × 10⁷)/((3.2 × 10⁻¹⁹)(2.0)) = 0.52 m.',
    difficulty: 'intermediate',
    tags: ['radius-of-curvature', 'alpha-particles', 'magnetic-deflection']
  },
  {
    questionText: "A particle has a charge-to-mass ratio of 1.5 × 10⁵ C/kg and mass 2.0 × 10⁻¹⁵ kg. What is the charge?",
    options: [
      { id: 'a', text: '3.0 × 10⁻²⁰ C', feedback: 'Incorrect. Check your multiplication of scientific notation.' },
      { id: 'b', text: '1.3 × 10⁻¹⁰ C', feedback: 'Incorrect. This appears to be an error in scientific notation calculation.' },
      { id: 'c', text: '3.0 × 10⁻¹⁰ C', feedback: 'Correct! q = (q/m) × m = (1.5 × 10⁵ C/kg) × (2.0 × 10⁻¹⁵ kg) = 3.0 × 10⁻¹⁰ C.' },
      { id: 'd', text: '7.5 × 10⁻⁵ C', feedback: 'Incorrect. You may have made an error in handling the scientific notation.' }
    ],
    correctOptionId: 'c',
    explanation: 'Charge = (charge-to-mass ratio) × mass = (1.5 × 10⁵ C/kg) × (2.0 × 10⁻¹⁵ kg) = 3.0 × 10⁻¹⁰ C.',
    difficulty: 'beginner',
    tags: ['charge-calculation', 'scientific-notation', 'charge-to-mass-ratio']
  },
  {
    questionText: "A proton travels at 5.60 × 10⁵ m/s in a circular arc of radius 7.50 mm. What is the magnetic field strength?",
    options: [
      { id: 'a', text: '0.0779 T', feedback: 'Incorrect. Did you forget to convert mm to meters?' },
      { id: 'b', text: '0.779 T', feedback: 'Correct! B = mv/(qr) = (1.67 × 10⁻²⁷ kg)(5.60 × 10⁵ m/s)/((1.60 × 10⁻¹⁹ C)(7.50 × 10⁻³ m)) = 0.779 T.' },
      { id: 'c', text: '7.79 T', feedback: 'Incorrect. You may have made an error in unit conversion or calculation.' },
      { id: 'd', text: '1.56 T', feedback: 'Incorrect. Check your calculation and make sure you used the radius, not diameter.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using B = mv/(qr): B = (1.67 × 10⁻²⁷ kg)(5.60 × 10⁵ m/s)/((1.60 × 10⁻¹⁹ C)(7.50 × 10⁻³ m)) = 0.779 T. Remember to convert mm to meters.',
    difficulty: 'intermediate',
    tags: ['magnetic-field', 'circular-motion', 'unit-conversion', 'proton']
  },
  {
    questionText: "Alpha particles are undeflected in perpendicular magnetic and electric fields. If v = 7.50 × 10⁵ m/s and B = 0.220 T, what is the electric field strength?",
    options: [
      { id: 'a', text: '2.93 × 10⁴ V/m', feedback: 'Incorrect. You may have inverted the relationship or made a calculation error.' },
      { id: 'b', text: '1.65 × 10⁵ V/m', feedback: 'Correct! For undeflected motion: E = vB = (7.50 × 10⁵ m/s)(0.220 T) = 1.65 × 10⁵ V/m.' },
      { id: 'c', text: '3.41 × 10⁶ V/m', feedback: 'Incorrect. This is too large - check your scientific notation.' },
      { id: 'd', text: '5.92 × 10³ V/m', feedback: 'Incorrect. You may have used the wrong relationship or made a calculation error.' }
    ],
    correctOptionId: 'b',
    explanation: 'For undeflected motion through perpendicular electric and magnetic fields: E = vB = (7.50 × 10⁵ m/s)(0.220 T) = 1.65 × 10⁵ V/m.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'velocity-selector', 'alpha-particles', 'equilibrium']
  },
  {
    questionText: "Alpha particles curve in a magnetic field of 0.360 T with a radius of 8.20 cm. What is their energy?",
    options: [
      { id: 'a', text: '3.35 × 10⁻¹⁵ J', feedback: 'Incorrect. You may have made an error in the energy calculation or unit conversion.' },
      { id: 'b', text: '6.71 × 10⁻¹⁵ J', feedback: 'Correct! First find v from r = mv/(qB), then use E = ½mv². E = 6.71 × 10⁻¹⁵ J.' },
      { id: 'c', text: '1.12 × 10⁻¹³ J', feedback: 'Incorrect. This is too large - check your velocity calculation.' },
      { id: 'd', text: '8.20 × 10⁻¹⁷ J', feedback: 'Incorrect. You may have used the radius value incorrectly in your calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'First find velocity: v = qBr/m = (3.2 × 10⁻¹⁹ C)(0.360 T)(0.082 m)/(6.64 × 10⁻²⁷ kg) = 1.42 × 10⁶ m/s. Then: E = ½mv² = ½(6.64 × 10⁻²⁷)(1.42 × 10⁶)² = 6.71 × 10⁻¹⁵ J.',
    difficulty: 'advanced',
    tags: ['kinetic-energy', 'velocity-calculation', 'magnetic-deflection', 'alpha-particles']
  },
  {
    questionText: "An electron accelerates from rest to 4.75 × 10⁷ m/s. What is the potential difference in the cathode ray tube?",
    options: [
      { id: 'a', text: '4.91 kV', feedback: 'Incorrect. Check your kinetic energy calculation or conversion to kilovolts.' },
      { id: 'b', text: '6.42 kV', feedback: 'Correct! KE = ½mv² = qV, so V = mv²/(2q) = (9.11 × 10⁻³¹)(4.75 × 10⁷)²/(2 × 1.60 × 10⁻¹⁹) = 6.42 kV.' },
      { id: 'c', text: '2.25 kV', feedback: 'Incorrect. You may have made an error in the energy calculation.' },
      { id: 'd', text: '1.16 kV', feedback: 'Incorrect. This is too small - check your calculation and unit conversion.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using energy conservation: KE = qV, so V = KE/q = ½mv²/q = (9.11 × 10⁻³¹ kg)(4.75 × 10⁷ m/s)²/(2 × 1.60 × 10⁻¹⁹ C) = 6424 V = 6.42 kV.',
    difficulty: 'intermediate',
    tags: ['acceleration-voltage', 'kinetic-energy', 'electron', 'cathode-ray-tube']
  },
  {
    questionText: "Electrons accelerated by 1.40 kV enter a magnetic field of 0.0220 T. What is the radius of their arc?",
    options: [
      { id: 'a', text: '1.12 mm', feedback: 'Incorrect. You may have made an error in the velocity calculation from the accelerating voltage.' },
      { id: 'b', text: '3.10 mm', feedback: 'Incorrect. Check your conversion from voltage to kinetic energy.' },
      { id: 'c', text: '5.74 mm', feedback: 'Correct! First find v from qV = ½mv², then use r = mv/(qB). r = 5.74 mm.' },
      { id: 'd', text: '9.88 mm', feedback: 'Incorrect. You may have made an error in the radius calculation.' }
    ],
    correctOptionId: 'c',
    explanation: 'First find velocity: qV = ½mv², so v = √(2qV/m) = √(2 × 1.60 × 10⁻¹⁹ × 1400 / 9.11 × 10⁻³¹) = 2.22 × 10⁷ m/s. Then: r = mv/(qB) = (9.11 × 10⁻³¹)(2.22 × 10⁷)/((1.60 × 10⁻¹⁹)(0.0220)) = 5.74 × 10⁻³ m = 5.74 mm.',
    difficulty: 'advanced',
    tags: ['radius-calculation', 'acceleration-voltage', 'magnetic-deflection', 'electron']
  },
  {
    questionText: "A 40 g mass is suspended between plates 4.0 cm apart in a Millikan oil drop apparatus. What potential difference is needed to suspend it if it holds 6 excess electrons?",
    options: [
      { id: 'a', text: '8.21 × 10¹⁵ V', feedback: 'Incorrect. You may have made an error in the charge calculation.' },
      { id: 'b', text: '1.63 × 10¹⁶ V', feedback: 'Correct! For equilibrium: qE = mg, so V = mgd/q = (40 × 10⁻³ × 9.8 × 0.04)/(6 × 1.60 × 10⁻¹⁹) = 1.63 × 10¹⁶ V.' },
      { id: 'c', text: '6.90 × 10¹³ V', feedback: 'Incorrect. Check your mass unit conversion and charge calculation.' },
      { id: 'd', text: '3.27 × 10¹⁴ V', feedback: 'Incorrect. You may have used the wrong charge value.' }
    ],
    correctOptionId: 'b',
    explanation: 'For equilibrium: qE = mg, so E = mg/q and V = Ed = mgd/q. With q = 6e = 6 × 1.60 × 10⁻¹⁹ C, m = 40 × 10⁻³ kg: V = (40 × 10⁻³)(9.8)(0.04)/(6 × 1.60 × 10⁻¹⁹) = 1.63 × 10¹⁶ V.',
    difficulty: 'advanced',
    tags: ['millikan-oil-drop', 'equilibrium', 'quantized-charge', 'electric-field']
  },
  {
    questionText: "An oil drop with 5 electrons and mass of 3.0 pg accelerates upward at 3.0 m/s² in an electric field between plates 3.0 cm apart. What is the required potential difference?",
    options: [
      { id: 'a', text: '1.4 × 10² V', feedback: 'Incorrect. You may have made an error in the mass unit conversion.' },
      { id: 'b', text: '1.4 × 10³ V', feedback: 'Correct! Net force = ma = qE - mg, so V = (ma + mg)d/q = 1.4 × 10³ V.' },
      { id: 'c', text: '1.4 × 10⁴ V', feedback: 'Incorrect. Check your calculation of the net force and field.' },
      { id: 'd', text: '1.4 × 10⁵ V', feedback: 'Incorrect. This is too large - check your mass conversion from pg to kg.' }
    ],
    correctOptionId: 'b',
    explanation: 'Net upward force = ma = qE - mg, so qE = ma + mg. Therefore V = (ma + mg)d/q. With m = 3.0 × 10⁻¹⁵ kg, q = 5e = 8.0 × 10⁻¹⁹ C: V = ((3.0 × 10⁻¹⁵)(3.0) + (3.0 × 10⁻¹⁵)(9.8)) × 0.03/(8.0 × 10⁻¹⁹) = 1.4 × 10³ V.',
    difficulty: 'advanced',
    tags: ['millikan-oil-drop', 'acceleration', 'electric-field', 'unit-conversion']
  }
];

// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Assessment configurations for master function (keeping for compatibility)
const assessmentConfigs = {
  'course2_50_question1': {
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
  'course2_50_question2': {
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
  'course2_50_question3': {
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
  'course2_50_question4': {
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
  'course2_50_question5': {
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
  'course2_50_question6': {
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
  },
  'course2_50_question7': {
    type: 'multiple-choice',
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
  'course2_50_question8': {
    type: 'multiple-choice',
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
  'course2_50_question9': {
    type: 'multiple-choice',
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
  'course2_50_question10': {
    type: 'multiple-choice',
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
  'course2_50_question11': {
    type: 'multiple-choice',
    questions: [questionPool[10]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_50_question12': {
    type: 'multiple-choice',
    questions: [questionPool[11]],
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