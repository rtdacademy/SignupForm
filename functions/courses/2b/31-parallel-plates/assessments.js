// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// Removed dependency on config file - settings are now handled directly in assessment configurations

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
    questionText: "What is the electric field intensity between two large parallel plates 2.0 cm apart, if a potential difference of 450 V is maintained between them?",
    options: [
      { id: 'a', text: '2.3 × 10⁴ N/C', feedback: 'Correct! E = V/d = 450 V / 0.020 m = 2.25 × 10⁴ N/C ≈ 2.3 × 10⁴ N/C' },
      { id: 'b', text: '9.0 × 10³ N/C', feedback: 'Incorrect. Check your unit conversion - make sure to convert cm to m.' },
      { id: 'c', text: '4.5 × 10⁵ N/C', feedback: 'Incorrect. You may have forgotten to convert cm to m in the denominator.' },
      { id: 'd', text: '1.1 × 10⁴ N/C', feedback: 'Incorrect. Verify your calculation of V/d.' }
    ],
    correctOptionId: 'a',
    explanation: 'For parallel plates: E = V/d = 450 V / 0.020 m = 22,500 N/C = 2.25 × 10⁴ N/C. This rounds to 2.3 × 10⁴ N/C.',
    difficulty: 'intermediate',
    tags: ['calculations', 'electric-field', 'parallel-plates']
  },
  {
    questionText: "What potential difference applied between two parallel plates will produce an electric field strength of 2.5 × 10³ N/C, if the plates are 8.0 cm apart?",
    options: [
      { id: 'a', text: '2.0 × 10² V', feedback: 'Correct! V = Ed = (2.5 × 10³ N/C)(0.080 m) = 200 V = 2.0 × 10² V' },
      { id: 'b', text: '3.1 × 10¹ V', feedback: 'Incorrect. Check that you converted cm to m correctly.' },
      { id: 'c', text: '2.0 × 10⁴ V', feedback: 'Incorrect. You may have used cm instead of m in your calculation.' },
      { id: 'd', text: '1.6 × 10² V', feedback: 'Incorrect. Verify your multiplication of E × d.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using V = Ed: V = (2.5 × 10³ N/C)(0.080 m) = 200 V = 2.0 × 10² V. Remember to convert cm to m.',
    difficulty: 'intermediate',
    tags: ['calculations', 'potential-difference', 'parallel-plates']
  },
  {
    questionText: "How far apart are two parallel plates if a potential difference of 600 V produces an electric field intensity of 1.2 × 10⁴ N/C between them?",
    options: [
      { id: 'a', text: '5.0 × 10⁻² m', feedback: 'Correct! d = V/E = 600 V / (1.2 × 10⁴ N/C) = 0.050 m = 5.0 × 10⁻² m' },
      { id: 'b', text: '7.2 × 10⁶ m', feedback: 'Incorrect. Check your division - you may have multiplied instead.' },
      { id: 'c', text: '2.0 × 10⁻² m', feedback: 'Incorrect. Verify your calculation of V/E.' },
      { id: 'd', text: '1.2 × 10⁻² m', feedback: 'Incorrect. Double-check your arithmetic.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using d = V/E: d = 600 V / (1.2 × 10⁴ N/C) = 0.050 m = 5.0 × 10⁻² m = 5.0 cm.',
    difficulty: 'intermediate',
    tags: ['calculations', 'distance', 'parallel-plates']
  },
  {
    questionText: "An oil drop, of mass 2.6 × 10⁻¹⁵ kg, is suspended between two parallel plates 0.50 cm apart, and remains stationary when the potential difference between the plates is 270 V. What is the charge on the oil drop?",
    options: [
      { id: 'a', text: '4.7 × 10⁻¹⁹ C (3 electrons)', feedback: 'Correct! For equilibrium: qE = mg, so q = mg/E = mgd/V = (2.6×10⁻¹⁵×9.8×0.005)/270 ≈ 4.7×10⁻¹⁹ C' },
      { id: 'b', text: '1.6 × 10⁻¹⁹ C (1 electron)', feedback: 'Incorrect. Check your calculation - you may have made an error with the mass or distance.' },
      { id: 'c', text: '9.4 × 10⁻¹⁹ C (6 electrons)', feedback: 'Incorrect. Verify your equilibrium force calculation.' },
      { id: 'd', text: '3.1 × 10⁻¹⁹ C (2 electrons)', feedback: 'Incorrect. Double-check your unit conversions.' }
    ],
    correctOptionId: 'a',
    explanation: 'At equilibrium: qE = mg. Since E = V/d: q = mgd/V = (2.6×10⁻¹⁵ kg)(9.8 m/s²)(0.005 m)/(270 V) = 4.7×10⁻¹⁹ C. This equals 3 electron charges.',
    difficulty: 'advanced',
    tags: ['calculations', 'equilibrium', 'millikan-oil-drop']
  },
  {
    questionText: "A metallic Ping-Pong ball, of mass 0.10 g, has a charge of 5.0 × 10⁻⁶ C. What potential difference, across a large parallel plate apparatus of separation 25 cm, would be required to keep the ball stationary?",
    options: [
      { id: 'a', text: '49 V', feedback: 'Correct! For equilibrium: V = mgd/q = (1.0×10⁻⁴×9.8×0.25)/(5.0×10⁻⁶) = 49 V' },
      { id: 'b', text: '196 V', feedback: 'Incorrect. Check your unit conversion for the mass (0.10 g = 1.0×10⁻⁴ kg).' },
      { id: 'c', text: '12 V', feedback: 'Incorrect. Verify your calculation of mgd/q.' },
      { id: 'd', text: '98 V', feedback: 'Incorrect. Double-check your arithmetic.' }
    ],
    correctOptionId: 'a',
    explanation: 'For equilibrium: qE = mg, so qV/d = mg. Therefore: V = mgd/q = (1.0×10⁻⁴ kg)(9.8 m/s²)(0.25 m)/(5.0×10⁻⁶ C) = 49 V.',
    difficulty: 'intermediate',
    tags: ['calculations', 'equilibrium', 'charged-object']
  },
  {
    questionText: "An oil drop weighs 3.84 × 10⁻¹⁵ N. If it is suspended between two horizontal parallel plates where the electric field strength is 1.20 × 10⁴ N/C, what is the magnitude of the charge on the oil drop?",
    options: [
      { id: 'a', text: '3.2 × 10⁻¹⁹ C (2 electrons)', feedback: 'Correct! q = mg/E = (3.84×10⁻¹⁵ N)/(1.20×10⁴ N/C) = 3.2×10⁻¹⁹ C = 2e⁻' },
      { id: 'b', text: '1.6 × 10⁻¹⁹ C (1 electron)', feedback: 'Incorrect. Check your division - the weight is given, so you don\'t need to multiply by g.' },
      { id: 'c', text: '4.8 × 10⁻¹⁹ C (3 electrons)', feedback: 'Incorrect. Verify your calculation of weight/field strength.' },
      { id: 'd', text: '6.4 × 10⁻¹⁹ C (4 electrons)', feedback: 'Incorrect. Double-check your arithmetic.' }
    ],
    correctOptionId: 'a',
    explanation: 'At equilibrium: qE = Weight. So q = Weight/E = (3.84×10⁻¹⁵ N)/(1.20×10⁴ N/C) = 3.2×10⁻¹⁹ C. This equals 2 electron charges.',
    difficulty: 'intermediate',
    tags: ['calculations', 'equilibrium', 'weight-given']
  },
  {
    questionText: "An oil drop whose mass is 3.50 × 10⁻¹⁵ kg accelerates downward at a rate of 2.50 m/s² when placed between two horizontal parallel plates that are 1.00 cm apart. If the top plate is positive and the potential difference is 5.38 × 10² V, how many excess electrons does the oil drop carry?",
    options: [
      { id: 'a', text: '3 electrons (4.76 × 10⁻¹⁹ C)', feedback: 'Correct! Net force = ma = mg - qE. Solving: q = (mg - ma)/E = m(g-a)d/V = 4.76×10⁻¹⁹ C = 3e⁻' },
      { id: 'b', text: '2 electrons (3.20 × 10⁻¹⁹ C)', feedback: 'Incorrect. Remember to account for both gravity and electric force in the net force.' },
      { id: 'c', text: '4 electrons (6.40 × 10⁻¹⁹ C)', feedback: 'Incorrect. Check your calculation of the net force equation.' },
      { id: 'd', text: '1 electron (1.60 × 10⁻¹⁹ C)', feedback: 'Incorrect. Make sure you\'re using the correct direction for forces.' }
    ],
    correctOptionId: 'a',
    explanation: 'Net force down: ma = mg - qE (electric force up). So q = m(g-a)/E = m(g-a)d/V = (3.50×10⁻¹⁵)(9.8-2.5)(0.01)/(538) = 4.76×10⁻¹⁹ C = 3 electrons.',
    difficulty: 'advanced',
    tags: ['calculations', 'acceleration', 'net-force']
  },
  {
    questionText: "An oil drop with one electron of charge and a mass of 9.36 × 10⁻¹⁵ kg accelerates upward at 5.20 m/s² toward the positive plate when released. If the plates are set 15.0 mm apart, what is the potential difference applied across the plates?",
    options: [
      { id: 'a', text: '1.32 × 10⁴ V', feedback: 'Correct! Net force up: ma = qE - mg. So V = m(a+g)d/q = (9.36×10⁻¹⁵)(5.2+9.8)(0.015)/(1.6×10⁻¹⁹) = 13,200 V' },
      { id: 'b', text: '6.60 × 10³ V', feedback: 'Incorrect. Make sure you add both acceleration and gravity in the force equation.' },
      { id: 'c', text: '2.64 × 10⁴ V', feedback: 'Incorrect. Check your calculation of the net force direction.' },
      { id: 'd', text: '4.62 × 10³ V', feedback: 'Incorrect. Verify your unit conversions and arithmetic.' }
    ],
    correctOptionId: 'a',
    explanation: 'Net force up: ma = qE - mg (electric force up, gravity down). So qE = m(a+g), and V = m(a+g)d/q = (9.36×10⁻¹⁵)(5.2+9.8)(0.015)/(1.6×10⁻¹⁹) = 1.32×10⁴ V.',
    difficulty: 'advanced',
    tags: ['calculations', 'upward-acceleration', 'single-electron']
  },
  {
    questionText: "An oil drop with a mass of 7.20 × 10⁻¹⁶ kg is moving upward at a constant speed of 2.50 m/s between two horizontal parallel plates. If the electric field strength between these plates is 2.20 × 10⁴ V/m, what is the magnitude of the charge on the oil drop?",
    options: [
      { id: 'a', text: '3.20 × 10⁻¹⁹ C', feedback: 'Correct! At constant velocity: qE = mg, so q = mg/E = (7.20×10⁻¹⁶×9.8)/(2.20×10⁴) = 3.20×10⁻¹⁹ C' },
      { id: 'b', text: '1.60 × 10⁻¹⁹ C', feedback: 'Incorrect. Check your mass value - make sure you\'re using the correct exponent.' },
      { id: 'c', text: '6.40 × 10⁻¹⁹ C', feedback: 'Incorrect. Verify your calculation of mg/E.' },
      { id: 'd', text: '4.80 × 10⁻¹⁹ C', feedback: 'Incorrect. Double-check your arithmetic.' }
    ],
    correctOptionId: 'a',
    explanation: 'At constant velocity (equilibrium): qE = mg. So q = mg/E = (7.20×10⁻¹⁶ kg)(9.8 m/s²)/(2.20×10⁴ N/C) = 3.20×10⁻¹⁹ C.',
    difficulty: 'intermediate',
    tags: ['calculations', 'constant-velocity', 'equilibrium']
  },
  {
    questionText: "The electric field strength between two parallel plates set 20 mm apart is 1.00 × 10⁵ N/C. The potential at the negative plate is -1000 volts. If a proton is released from rest midway between the plates, with what speed will it reach the negative plate?",
    options: [
      { id: 'a', text: '4.4 × 10⁵ m/s', feedback: 'Correct! The proton travels 10 mm with qE = ma. Using kinematics: v² = 2ad where a = qE/m, gives v = 4.4×10⁵ m/s' },
      { id: 'b', text: '2.2 × 10⁵ m/s', feedback: 'Incorrect. Check that you used the correct distance (half the plate separation).' },
      { id: 'c', text: '6.2 × 10⁵ m/s', feedback: 'Incorrect. Verify your calculation of the acceleration from F = qE.' },
      { id: 'd', text: '3.1 × 10⁵ m/s', feedback: 'Incorrect. Make sure you\'re using the kinematic equation v² = 2ad correctly.' }
    ],
    correctOptionId: 'a',
    explanation: 'Force on proton: F = qE = (1.6×10⁻¹⁹)(1.00×10⁵) = 1.6×10⁻¹⁴ N. Acceleration: a = F/m = 9.6×10¹³ m/s². Distance: d = 0.01 m. Using v² = 2ad: v = √(2×9.6×10¹³×0.01) = 4.4×10⁵ m/s.',
    difficulty: 'advanced',
    tags: ['calculations', 'kinematics', 'proton-motion']
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
  'course2_31_question1': {
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
  'course2_31_question2': {
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
  'course2_31_question3': {
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
  'course2_31_question4': {
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
  'course2_31_question5': {
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
  'course2_31_question6': {
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
  'course2_31_question7': {
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
  'course2_31_question8': {
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
  'course2_31_question9': {
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
  'course2_31_question10': {
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
  }
};

module.exports = { 
  assessmentConfigs
};