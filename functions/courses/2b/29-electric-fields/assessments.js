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
    questionText: "Why do we use a very small test charge to detect and measure the electric field?",
    options: [
      { id: 'a', text: 'A small test charge would not interfere with the electric field being mapped', feedback: 'Correct! A small test charge minimizes disturbance to the field being measured.' },
      { id: 'b', text: 'Small charges are easier to move around', feedback: 'Incorrect. While this may be true, it\'s not the primary reason.' },
      { id: 'c', text: 'Small charges have stronger electric fields', feedback: 'Incorrect. Smaller charges actually have weaker fields.' },
      { id: 'd', text: 'Small charges are cheaper to produce', feedback: 'Incorrect. Cost is not a factor in this physics principle.' }
    ],
    correctOptionId: 'a',
    explanation: 'We use small test charges because they don\'t significantly disturb the electric field we\'re trying to measure. A large charge would create its own strong field that would alter the field being mapped.',
    difficulty: 'beginner',
    tags: ['conceptual', 'test-charge', 'field-measurement']
  },
  {
    questionText: "A metal sphere with a diameter of 10 cm has a charge distribution of 1.09085 × 10¹⁸ electrons/cm² on its surface. What is the electric field strength at a distance of 25 cm from the surface of the sphere?",
    options: [
      { id: 'a', text: '5.5 × 10¹² N/C', feedback: 'Correct! Using E = kQ/r² with proper charge and distance calculations.' },
      { id: 'b', text: '2.2 × 10¹² N/C', feedback: 'Incorrect. Check your distance calculation - remember to measure from the center.' },
      { id: 'c', text: '1.1 × 10¹³ N/C', feedback: 'Incorrect. Make sure you\'re using the correct total charge.' },
      { id: 'd', text: '3.3 × 10¹¹ N/C', feedback: 'Incorrect. Review your calculation of the total charge on the sphere.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find the total charge using surface area and charge density, then use E = kQ/r² where r is measured from the sphere\'s center (30 cm total).',
    difficulty: 'advanced',
    tags: ['calculations', 'sphere', 'charge-distribution']
  },
  {
    questionText: "A small test charge of +1.0 μC experiences an electric force of 6.0 × 10⁻⁶ N to the right. What is the electric field at that point?",
    options: [
      { id: 'a', text: '6.0 N/C to the right', feedback: 'Correct! E = F/q = (6.0 × 10⁻⁶ N)/(1.0 × 10⁻⁶ C) = 6.0 N/C' },
      { id: 'b', text: '6.0 × 10⁻¹² N/C to the right', feedback: 'Incorrect. Check your division - the exponents should cancel.' },
      { id: 'c', text: '1.0 N/C to the right', feedback: 'Incorrect. Make sure you\'re dividing force by charge correctly.' },
      { id: 'd', text: '6.0 × 10⁶ N/C to the right', feedback: 'Incorrect. Review the relationship E = F/q and your unit conversions.' }
    ],
    correctOptionId: 'a',
    explanation: 'The electric field E = F/q. Since F = 6.0 × 10⁻⁶ N and q = 1.0 × 10⁻⁶ C, E = 6.0 N/C in the direction of the force (right).',
    difficulty: 'intermediate',
    tags: ['calculations', 'field-from-force', 'test-charge']
  },
  {
    questionText: "A small test charge of +1.0 μC experiences an electric force of 6.0 × 10⁻⁶ N to the right. What force would be exerted on a charge of -7.2 × 10⁻⁴ C located at the same point?",
    options: [
      { id: 'a', text: '4.3 × 10⁻³ N to the left', feedback: 'Correct! F = qE = (-7.2 × 10⁻⁴ C)(6.0 N/C) = -4.3 × 10⁻³ N' },
      { id: 'b', text: '4.3 × 10⁻³ N to the right', feedback: 'Incorrect. Remember that negative charges experience force opposite to the field direction.' },
      { id: 'c', text: '7.2 × 10⁻³ N to the left', feedback: 'Incorrect. Check your calculation of F = qE.' },
      { id: 'd', text: '2.2 × 10⁻³ N to the left', feedback: 'Incorrect. Make sure you\'re using the correct values in F = qE.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find E = 6.0 N/C from the test charge. Then F = qE = (-7.2 × 10⁻⁴ C)(6.0 N/C) = -4.3 × 10⁻³ N. The negative sign indicates the force is opposite to the field (left).',
    difficulty: 'intermediate',
    tags: ['calculations', 'force-on-charge', 'negative-charge']
  },
  {
    questionText: "What is the magnitude and direction of the electric field 1.5 m to the right of a positive point charge of magnitude 8.0 × 10⁻³ C?",
    options: [
      { id: 'a', text: '3.2 × 10⁷ N/C to the right', feedback: 'Correct! E = kQ/r² = (9.0 × 10⁹)(8.0 × 10⁻³)/(1.5)² = 3.2 × 10⁷ N/C' },
      { id: 'b', text: '3.2 × 10⁷ N/C to the left', feedback: 'Incorrect. Electric field points away from positive charges.' },
      { id: 'c', text: '4.8 × 10⁷ N/C to the right', feedback: 'Incorrect. Check your calculation - make sure to square the distance.' },
      { id: 'd', text: '2.1 × 10⁷ N/C to the right', feedback: 'Incorrect. Verify you\'re using the correct values in E = kQ/r².' }
    ],
    correctOptionId: 'a',
    explanation: 'For a positive point charge, E = kQ/r² pointing away from the charge. E = (9.0 × 10⁹ N·m²/C²)(8.0 × 10⁻³ C)/(1.5 m)² = 3.2 × 10⁷ N/C to the right.',
    difficulty: 'intermediate',
    tags: ['calculations', 'point-charge', 'field-direction']
  },
  {
    questionText: "q₁ = -20 μC is located at the origin. q₂ = +8.0 μC is 60 cm east of q₁. What is the electric field at point X, which is 30 cm east of q₂?",
    options: [
      { id: 'a', text: '5.8 × 10⁵ N/C to the right', feedback: 'Correct! E = E₁ + E₂ where both fields point right at X.' },
      { id: 'b', text: '5.8 × 10⁵ N/C to the left', feedback: 'Incorrect. Check the direction of fields from each charge at point X.' },
      { id: 'c', text: '2.9 × 10⁵ N/C to the right', feedback: 'Incorrect. Make sure to calculate fields from both charges.' },
      { id: 'd', text: '8.7 × 10⁵ N/C to the right', feedback: 'Incorrect. Check your distance calculations from each charge to point X.' }
    ],
    correctOptionId: 'a',
    explanation: 'At X: E₁ from q₁ (90 cm away) points right, E₂ from q₂ (30 cm away) points right. E_total = kq₁/(0.9)² + kq₂/(0.3)² = 5.8 × 10⁵ N/C right.',
    difficulty: 'advanced',
    tags: ['calculations', 'multiple-charges', 'superposition']
  },
  {
    questionText: "An electron in an electric field experiences an acceleration of +4.39 × 10¹⁴ m/s². What is the magnitude and direction of the electric field?",
    options: [
      { id: 'a', text: '2.50 × 10³ N/C opposite to acceleration', feedback: 'Correct! E = ma/q = (9.11 × 10⁻³¹ kg)(4.39 × 10¹⁴ m/s²)/(1.60 × 10⁻¹⁹ C)' },
      { id: 'b', text: '2.50 × 10³ N/C in direction of acceleration', feedback: 'Incorrect. Remember electrons are negatively charged.' },
      { id: 'c', text: '7.02 × 10⁻⁶ N/C opposite to acceleration', feedback: 'Incorrect. Check your calculation of E = ma/|q|.' },
      { id: 'd', text: '1.25 × 10³ N/C opposite to acceleration', feedback: 'Incorrect. Make sure you\'re using the correct electron mass and charge.' }
    ],
    correctOptionId: 'a',
    explanation: 'F = ma = qE, so E = ma/q. For an electron: E = (9.11 × 10⁻³¹ kg)(4.39 × 10¹⁴ m/s²)/(−1.60 × 10⁻¹⁹ C) = −2.50 × 10³ N/C. The field is opposite to the acceleration.',
    difficulty: 'advanced',
    tags: ['calculations', 'electron', 'acceleration']
  },
  {
    questionText: "Calculate the electric field at the center of a 35 cm square if one corner has a +38.0 μC charge and the other three have -24.0 μC charges.",
    options: [
      { id: 'a', text: '9.10 × 10⁶ N/C away from the +38.0 μC charge', feedback: 'Correct! The net field points diagonally away from the positive charge.' },
      { id: 'b', text: '9.10 × 10⁶ N/C toward the +38.0 μC charge', feedback: 'Incorrect. Check the direction - field points away from positive charges.' },
      { id: 'c', text: '4.55 × 10⁶ N/C away from the +38.0 μC charge', feedback: 'Incorrect. Make sure to properly add the vector components.' },
      { id: 'd', text: '1.82 × 10⁷ N/C away from the +38.0 μC charge', feedback: 'Incorrect. The distance from corner to center is r = a/√2, not a.' }
    ],
    correctOptionId: 'a',
    explanation: 'Distance from corner to center: r = 0.35/√2 m. Use superposition and symmetry. The three negative charges create a net field toward the positive charge corner. Combined with the positive charge field, the net field is 9.10 × 10⁶ N/C away from the positive charge.',
    difficulty: 'advanced',
    tags: ['calculations', 'square-configuration', 'vector-addition']
  },
  {
    questionText: "What is the electric field at the center of a hollow metal sphere with radius 2.5 cm if there are 2.0 × 10¹⁵ excess electrons on its surface?",
    options: [
      { id: 'a', text: '0 N/C', feedback: 'Correct! Inside a conducting sphere, the electric field is always zero.' },
      { id: 'b', text: '4.6 × 10⁸ N/C radially inward', feedback: 'Incorrect. This would be the field outside, but inside a conductor E = 0.' },
      { id: 'c', text: '4.6 × 10⁸ N/C radially outward', feedback: 'Incorrect. Remember the field inside a conductor is always zero.' },
      { id: 'd', text: '2.3 × 10⁸ N/C radially inward', feedback: 'Incorrect. The field inside any conductor in electrostatic equilibrium is zero.' }
    ],
    correctOptionId: 'a',
    explanation: 'Inside a conducting sphere in electrostatic equilibrium, the electric field is always zero, regardless of the charge on the surface. This is a fundamental property of conductors.',
    difficulty: 'intermediate',
    tags: ['conceptual', 'conductor', 'hollow-sphere']
  },
  {
    questionText: "An alpha particle (q = +2e, m = 6.64 × 10⁻²⁷ kg) is suspended at rest in a uniform electric field. What is the electric field intensity?",
    options: [
      { id: 'a', text: '2.03 × 10⁻⁷ N/C upward', feedback: 'Correct! E = mg/q = (6.64 × 10⁻²⁷ kg)(9.8 m/s²)/(3.2 × 10⁻¹⁹ C)' },
      { id: 'b', text: '2.03 × 10⁻⁷ N/C downward', feedback: 'Incorrect. The field must point upward to balance gravity on a positive charge.' },
      { id: 'c', text: '4.06 × 10⁻⁷ N/C upward', feedback: 'Incorrect. Remember an alpha particle has charge +2e, not +e.' },
      { id: 'd', text: '1.02 × 10⁻⁷ N/C upward', feedback: 'Incorrect. Check your calculation - make sure to use q = 2e for an alpha particle.' }
    ],
    correctOptionId: 'a',
    explanation: 'For equilibrium: qE = mg. So E = mg/q = (6.64 × 10⁻²⁷ kg)(9.8 m/s²)/(2 × 1.6 × 10⁻¹⁹ C) = 2.03 × 10⁻⁷ N/C upward.',
    difficulty: 'advanced',
    tags: ['calculations', 'equilibrium', 'alpha-particle']
  },
  {
    questionText: "Earth has a weak electric field of 150 N/C pointing toward its center. What is the magnitude of Earth's electric charge? Is it positive or negative?",
    options: [
      { id: 'a', text: '6.77 × 10⁵ C, negative', feedback: 'Correct! Q = Er²/k, and inward field means negative charge.' },
      { id: 'b', text: '6.77 × 10⁵ C, positive', feedback: 'Incorrect. An inward-pointing field indicates negative charge.' },
      { id: 'c', text: '3.39 × 10⁵ C, negative', feedback: 'Incorrect. Check your calculation using Earth\'s radius.' },
      { id: 'd', text: '1.35 × 10⁶ C, negative', feedback: 'Incorrect. Make sure you\'re using the correct value for Earth\'s radius.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using E = kQ/r²: Q = Er²/k = (150 N/C)(6.37 × 10⁶ m)²/(9.0 × 10⁹ N·m²/C²) = 6.77 × 10⁵ C. The inward field indicates negative charge.',
    difficulty: 'advanced',
    tags: ['calculations', 'earth', 'field-direction']
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
  'course2_29_question1': {
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
  'course2_29_question2': {
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
  'course2_29_question3': {
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
  'course2_29_question4': {
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
  'course2_29_question5': {
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
  'course2_29_question6': {
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
  'course2_29_question7': {
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
  'course2_29_question8': {
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
  'course2_29_question9': {
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
  'course2_29_question10': {
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
  'course2_29_question11': {
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
  }
};

module.exports = { 
  assessmentConfigs
};