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
    questionText: "What is the de Broglie wavelength of an electron traveling at 1.23 × 10⁶ m/s?",
    options: [
      { id: 'a', text: '1.82 × 10⁻⁷ m', feedback: 'Incorrect. This wavelength is too large for an electron at this speed.' },
      { id: 'b', text: '5.92 × 10⁻¹⁰ m', feedback: 'Correct! Using λ = h/(mv) = (6.63×10⁻³⁴)/[(9.11×10⁻³¹)(1.23×10⁶)] = 5.92×10⁻¹⁰ m.' },
      { id: 'c', text: '9.11 × 10⁻³¹ m', feedback: 'Incorrect. This is the electron mass value, not a wavelength.' },
      { id: 'd', text: '3.32 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength does not match the calculated value for this speed.' }
    ],
    correctOptionId: 'b',
    explanation: 'The de Broglie wavelength is calculated using λ = h/p = h/(mv). Substituting the values: λ = (6.63×10⁻³⁴ J·s)/[(9.11×10⁻³¹ kg)(1.23×10⁶ m/s)] = 5.92×10⁻¹⁰ m.',
    difficulty: 'intermediate',
    tags: ['de-broglie-wavelength', 'electron-motion', 'wave-particle-duality', 'momentum-wavelength']
  },
  {
    questionText: "What is the wavelength associated with an electron that has a kinetic energy of 1.14 × 10⁻¹⁵ J?",
    options: [
      { id: 'a', text: '2.0 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength is too large for the given kinetic energy.' },
      { id: 'b', text: '3.3 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength does not correspond to the calculated momentum.' },
      { id: 'c', text: '1.45 × 10⁻¹¹ m', feedback: 'Correct! First find velocity from KE: v = √(2KE/m) = 1.58×10⁷ m/s. Then λ = h/(mv) = 1.45×10⁻¹¹ m.' },
      { id: 'd', text: '5.6 × 10⁻¹² m', feedback: 'Incorrect. This wavelength is too small for the given energy.' }
    ],
    correctOptionId: 'c',
    explanation: 'First find the electron velocity from kinetic energy: KE = ½mv², so v = √(2KE/m) = √(2×1.14×10⁻¹⁵/9.11×10⁻³¹) = 1.58×10⁷ m/s. Then λ = h/(mv) = (6.63×10⁻³⁴)/[(9.11×10⁻³¹)(1.58×10⁷)] = 1.45×10⁻¹¹ m.',
    difficulty: 'intermediate',
    tags: ['kinetic-energy', 'de-broglie-wavelength', 'energy-to-wavelength', 'electron-properties']
  },
  {
    questionText: "If the de Broglie wavelength of an electron is 2.0 × 10⁻¹⁰ m, what is the smallest allowable orbital radius for this electron?",
    options: [
      { id: 'a', text: '5.3 × 10⁻¹¹ m', feedback: 'Incorrect. This is the first Bohr radius, but not calculated from the given wavelength.' },
      { id: 'b', text: '3.2 × 10⁻¹¹ m', feedback: 'Correct! Using the condition that nλ = 2πr, for n=1: r = λ/(2π) = (2.0×10⁻¹⁰)/(2π) = 3.2×10⁻¹¹ m.' },
      { id: 'c', text: '1.0 × 10⁻¹⁰ m', feedback: 'Incorrect. This value is too large for the smallest allowable radius.' },
      { id: 'd', text: '9.1 × 10⁻³¹ m', feedback: 'Incorrect. This appears to be the electron mass value, not a radius.' }
    ],
    correctOptionId: 'b',
    explanation: 'For a standing wave in a circular orbit, the condition is nλ = 2πr, where n is an integer. For the smallest allowable orbit (n = 1): r = λ/(2π) = (2.0×10⁻¹⁰ m)/(2π) = 3.2×10⁻¹¹ m.',
    difficulty: 'intermediate',
    tags: ['standing-wave-condition', 'orbital-radius', 'quantized-orbits', 'wave-mechanics']
  },
  {
    questionText: "An atom has an ionization energy of 35.7 eV. What is the smallest allowable orbital radius for an electron in this atom?",
    options: [
      { id: 'a', text: '3.27 × 10⁻¹¹ m', feedback: 'Correct! Using the relationship between ionization energy and orbital radius: r = ke²/(2×Ionization Energy) gives r = 3.27×10⁻¹¹ m.' },
      { id: 'b', text: '5.30 × 10⁻¹¹ m', feedback: 'Incorrect. This is the first Bohr radius for hydrogen, but this atom has different ionization energy.' },
      { id: 'c', text: '1.00 × 10⁻¹⁰ m', feedback: 'Incorrect. This radius is too large for the given ionization energy.' },
      { id: 'd', text: '2.18 × 10⁻¹⁰ m', feedback: 'Incorrect. This radius does not correspond to the given ionization energy.' }
    ],
    correctOptionId: 'a',
    explanation: 'The ionization energy is related to the orbital radius by: Ionization Energy = ke²/(2r). Solving for r: r = ke²/(2×Ionization Energy) = (8.99×10⁹ × (1.6×10⁻¹⁹)²)/(2 × 35.7 × 1.6×10⁻¹⁹) = 3.27×10⁻¹¹ m.',
    difficulty: 'advanced',
    tags: ['ionization-energy', 'orbital-radius', 'atomic-structure', 'energy-radius-relationship']
  },
  {
    questionText: "A 0.20 kg billiard ball moves with a speed of 1.0 m/s. What is its de Broglie wavelength?",
    options: [
      { id: 'a', text: '1.66 × 10⁻³⁴ m', feedback: 'Incorrect. This value does not match the calculation for the given mass and velocity.' },
      { id: 'b', text: '6.63 × 10⁻³⁴ m', feedback: 'Incorrect. This appears to be Planck\'s constant value, not the wavelength.' },
      { id: 'c', text: '3.3 × 10⁻³³ m', feedback: 'Incorrect. This wavelength is too large for the calculated momentum.' },
      { id: 'd', text: '3.3 × 10⁻³³ m', feedback: 'Correct! Using λ = h/(mv) = (6.63×10⁻³⁴)/[(0.20)(1.0)] = 3.3×10⁻³³ m. This extremely small wavelength shows why quantum effects are negligible for macroscopic objects.' }
    ],
    correctOptionId: 'd',
    explanation: 'The de Broglie wavelength is λ = h/(mv) = (6.63×10⁻³⁴ J·s)/[(0.20 kg)(1.0 m/s)] = 3.3×10⁻³³ m. This incredibly small wavelength demonstrates why we don\'t observe wave properties in everyday macroscopic objects.',
    difficulty: 'beginner',
    tags: ['macroscopic-objects', 'de-broglie-wavelength', 'classical-vs-quantum', 'billiard-ball']
  },
  {
    questionText: "An electron is accelerated from rest through a potential difference of 100 V. What is the de Broglie wavelength associated with the electron?",
    options: [
      { id: 'a', text: '1.23 × 10⁻¹⁰ m', feedback: 'Correct! Energy gained: E = eV = 100 eV. Using E = p²/(2m), then λ = h/p = h/√(2mE) = 1.23×10⁻¹⁰ m.' },
      { id: 'b', text: '3.32 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength corresponds to a different energy or potential difference.' },
      { id: 'c', text: '9.11 × 10⁻³¹ m', feedback: 'Incorrect. This is the electron mass value, not a wavelength.' },
      { id: 'd', text: '2.18 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength is too large for the given potential difference.' }
    ],
    correctOptionId: 'a',
    explanation: 'The electron gains energy E = eV = 100 eV = 1.6×10⁻¹⁷ J. Using the relationship E = p²/(2m), we get p = √(2mE). Then λ = h/p = h/√(2mE) = (6.63×10⁻³⁴)/√(2×9.11×10⁻³¹×1.6×10⁻¹⁷) = 1.23×10⁻¹⁰ m.',
    difficulty: 'intermediate',
    tags: ['electron-acceleration', 'potential-difference', 'energy-to-wavelength', 'accelerated-particles']
  },
  {
    questionText: "According to the Bohr model, what is the de Broglie wavelength of an electron in the first Bohr orbit of hydrogen (v = 2.19 × 10⁶ m/s)?",
    options: [
      { id: 'a', text: '5.30 × 10⁻¹¹ m', feedback: 'Incorrect. This is the radius of the first Bohr orbit, not the wavelength.' },
      { id: 'b', text: '1.23 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength does not match the calculation for the given velocity.' },
      { id: 'c', text: '3.32 × 10⁻¹⁰ m', feedback: 'Correct! Using λ = h/(mv) = (6.63×10⁻³⁴)/[(9.11×10⁻³¹)(2.19×10⁶)] = 3.32×10⁻¹⁰ m.' },
      { id: 'd', text: '1.60 × 10⁻¹⁹ m', feedback: 'Incorrect. This appears to be the elementary charge value, not a wavelength.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using the de Broglie wavelength formula: λ = h/(mv) = (6.63×10⁻³⁴ J·s)/[(9.11×10⁻³¹ kg)(2.19×10⁶ m/s)] = 3.32×10⁻¹⁰ m.',
    difficulty: 'intermediate',
    tags: ['bohr-model', 'hydrogen-atom', 'electron-velocity', 'first-orbit']
  },
  {
    questionText: "How does the de Broglie wavelength of an electron in the first Bohr orbit compare with the circumference of the orbit (r = 5.3 × 10⁻¹¹ m)?",
    options: [
      { id: 'a', text: 'The wavelength is shorter than the orbit', feedback: 'Incorrect. The wavelength and orbit circumference have a specific quantized relationship.' },
      { id: 'b', text: 'The wavelength is twice the radius', feedback: 'Incorrect. This does not describe the correct relationship.' },
      { id: 'c', text: 'The orbit circumference equals the electron\'s de Broglie wavelength', feedback: 'Correct! Circumference = 2πr = 2π(5.3×10⁻¹¹) = 3.33×10⁻¹⁰ m, which equals the de Broglie wavelength. This shows nλ = 2πr with n = 1.' },
      { id: 'd', text: 'The wavelength is unrelated to the orbit size', feedback: 'Incorrect. The quantization condition directly relates wavelength to orbit size.' }
    ],
    correctOptionId: 'c',
    explanation: 'The circumference of the first Bohr orbit is 2πr = 2π(5.3×10⁻¹¹ m) = 3.33×10⁻¹⁰ m. This exactly equals the de Broglie wavelength (3.32×10⁻¹⁰ m), demonstrating the standing wave condition nλ = 2πr with n = 1.',
    difficulty: 'advanced',
    tags: ['bohr-orbit-circumference', 'standing-wave-condition', 'quantization', 'wave-particle-connection']
  },
  {
    questionText: "In a Young's double-slit experiment with electrons, two slits are separated by 2.0 × 10⁻⁶ m. First-order fringes appear at an angle of 1.6 × 10⁻⁴ degrees. What is the wavelength of the electrons?",
    options: [
      { id: 'a', text: '1.23 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength does not match the calculated value from the interference pattern.' },
      { id: 'b', text: '5.60 × 10⁻¹² m', feedback: 'Correct! Using dsinθ = nλ for first order (n=1): λ = dsinθ = (2.0×10⁻⁶)sin(1.6×10⁻⁴°) = 5.60×10⁻¹² m.' },
      { id: 'c', text: '3.32 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength is too large for the given interference conditions.' },
      { id: 'd', text: '2.0 × 10⁻⁶ m', feedback: 'Incorrect. This is the slit separation distance, not the wavelength.' }
    ],
    correctOptionId: 'b',
    explanation: 'For Young\'s double-slit experiment, the condition for constructive interference is dsinθ = nλ. For first-order fringes (n = 1): λ = dsinθ = (2.0×10⁻⁶ m) × sin(1.6×10⁻⁴°) = (2.0×10⁻⁶) × (2.8×10⁻⁶) = 5.60×10⁻¹² m.',
    difficulty: 'advanced',
    tags: ['double-slit-experiment', 'electron-interference', 'wavelength-calculation', 'interference-pattern']
  },
  {
    questionText: "What is the momentum of electrons used in the same Young's double-slit experiment (λ = 5.6 × 10⁻¹² m)?",
    options: [
      { id: 'a', text: '1.20 × 10⁻²² kg·m/s', feedback: 'Correct! Using p = h/λ = (6.63×10⁻³⁴)/(5.6×10⁻¹²) = 1.20×10⁻²² kg·m/s.' },
      { id: 'b', text: '9.11 × 10⁻³¹ kg·m/s', feedback: 'Incorrect. This is the electron mass value, not momentum.' },
      { id: 'c', text: '2.18 × 10⁻¹⁸ kg·m/s', feedback: 'Incorrect. This momentum is too large for the given wavelength.' },
      { id: 'd', text: '6.63 × 10⁻³⁴ kg·m/s', feedback: 'Incorrect. This is Planck\'s constant value, not momentum.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the de Broglie relation p = h/λ: p = (6.63×10⁻³⁴ J·s)/(5.6×10⁻¹² m) = 1.20×10⁻²² kg·m/s.',
    difficulty: 'intermediate',
    tags: ['momentum-calculation', 'de-broglie-relation', 'electron-momentum', 'wavelength-to-momentum']
  },
  {
    questionText: "What is the kinetic energy of the electrons in the double-slit experiment (λ = 5.6 × 10⁻¹² m)?",
    options: [
      { id: 'a', text: '7.7 × 10⁻¹⁵ J', feedback: 'Correct! First find momentum: p = h/λ = 1.20×10⁻²² kg·m/s. Then KE = p²/(2m) = (1.20×10⁻²²)²/(2×9.11×10⁻³¹) = 7.7×10⁻¹⁵ J.' },
      { id: 'b', text: '1.6 × 10⁻¹⁹ J', feedback: 'Incorrect. This appears to be the elementary charge value, not kinetic energy.' },
      { id: 'c', text: '9.1 × 10⁻³¹ J', feedback: 'Incorrect. This is the electron mass value, not energy.' },
      { id: 'd', text: '1.1 × 10⁻¹³ J', feedback: 'Incorrect. This energy is too large for the calculated momentum.' }
    ],
    correctOptionId: 'a',
    explanation: 'First calculate momentum: p = h/λ = 1.20×10⁻²² kg·m/s. Then find kinetic energy: KE = p²/(2m) = (1.20×10⁻²²)²/(2×9.11×10⁻³¹) = 7.7×10⁻¹⁵ J.',
    difficulty: 'advanced',
    tags: ['kinetic-energy-calculation', 'momentum-to-energy', 'electron-energy', 'double-slit-particles']
  },
  {
    questionText: "What does the double-slit experiment demonstrate about the nature of light?",
    options: [
      { id: 'a', text: 'Light behaves strictly as a wave', feedback: 'Incorrect. Light shows both wave and particle properties depending on the experimental setup.' },
      { id: 'b', text: 'Light behaves strictly as a particle', feedback: 'Incorrect. The interference pattern clearly demonstrates wave behavior.' },
      { id: 'c', text: 'Light shows both wave and particle properties', feedback: 'Correct! The double-slit experiment demonstrates wave-particle duality: interference shows wave nature, while individual detections show particle nature.' },
      { id: 'd', text: 'Light only shows interference when using lasers', feedback: 'Incorrect. Interference occurs with any coherent light source, not just lasers.' }
    ],
    correctOptionId: 'c',
    explanation: 'The double-slit experiment is a cornerstone demonstration of wave-particle duality. The interference pattern shows wave behavior (constructive and destructive interference), while the detection of individual photons or particles shows particle behavior. Both aspects are fundamental to quantum mechanics.',
    difficulty: 'intermediate',
    tags: ['wave-particle-duality', 'double-slit-experiment', 'light-nature', 'quantum-mechanics']
  },
  {
    questionText: "Which statement is most accurate about the results of the double-slit experiment with electrons?",
    options: [
      { id: 'a', text: 'The results apply only to electrons', feedback: 'Incorrect. Wave-particle duality applies to all matter and radiation.' },
      { id: 'b', text: 'The results apply to photons and other particles', feedback: 'Correct! Wave-particle duality is a universal quantum mechanical principle that applies to all particles: electrons, photons, neutrons, atoms, and even molecules.' },
      { id: 'c', text: 'The results contradict wave-particle duality', feedback: 'Incorrect. The results actually confirm and demonstrate wave-particle duality.' },
      { id: 'd', text: 'The experiment disproves the quantum model', feedback: 'Incorrect. The experiment actually supports and validates quantum mechanical principles.' }
    ],
    correctOptionId: 'b',
    explanation: 'The double-slit experiment with electrons demonstrates that wave-particle duality is not limited to light but applies to all quantum objects. Similar interference patterns have been observed with neutrons, atoms, and even large molecules, confirming the universal nature of quantum mechanics.',
    difficulty: 'intermediate',
    tags: ['universal-wave-particle-duality', 'quantum-mechanics', 'all-particles', 'experimental-validation']
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
  'course2_62_question1': {
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
  'course2_62_question2': {
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
  'course2_62_question3': {
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
  'course2_62_question4': {
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
  'course2_62_question5': {
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
  'course2_62_question6': {
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
  'course2_62_question7': {
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
  'course2_62_question8': {
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
  'course2_62_question9': {
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
  'course2_62_question10': {
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
  'course2_62_question11': {
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
  'course2_62_question12': {
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
  },
  'course2_62_question13': {
    type: 'multiple-choice',
    questions: [questionPool[12]],
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