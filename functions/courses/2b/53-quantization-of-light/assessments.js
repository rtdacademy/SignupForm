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
    questionText: "What is the energy of a radio wave photon with a frequency of 100.7 MHz? (Answer in Joules)",
    options: [
      { id: 'a', text: '6.67 × 10⁻²⁶ J', feedback: 'Correct! Using E = hf = (6.626 × 10⁻³⁴ J·s)(100.7 × 10⁶ Hz) = 6.67 × 10⁻²⁶ J' },
      { id: 'b', text: '1.01 × 10⁻¹⁹ J', feedback: 'Incorrect. This value is too high for a radio wave photon energy.' },
      { id: 'c', text: '3.03 × 10⁻²⁴ J', feedback: 'Incorrect. This calculation error likely comes from using the wrong power of 10.' },
      { id: 'd', text: '4.17 × 10⁻⁷ J', feedback: 'Incorrect. This value is far too high for electromagnetic radiation energy.' }
    ],
    correctOptionId: 'a',
    explanation: 'The energy of a photon is given by E = hf, where h is Planck\'s constant (6.626 × 10⁻³⁴ J·s) and f is the frequency. For 100.7 MHz: E = (6.626 × 10⁻³⁴)(100.7 × 10⁶) = 6.67 × 10⁻²⁶ J',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'planck-constant', 'frequency', 'radio-waves']
  },
  {
    questionText: "What is the energy of a radio wave photon with a frequency of 100.7 MHz? (Answer in electron volts)",
    options: [
      { id: 'a', text: '1.01 × 10⁻⁶ eV', feedback: 'Incorrect. This conversion factor is wrong.' },
      { id: 'b', text: '6.67 × 10⁻²⁶ eV', feedback: 'Incorrect. This is the energy in Joules, not electron volts.' },
      { id: 'c', text: '4.17 × 10⁻⁷ eV', feedback: 'Correct! Converting from Joules: (6.67 × 10⁻²⁶ J) ÷ (1.602 × 10⁻¹⁹ J/eV) = 4.17 × 10⁻⁷ eV' },
      { id: 'd', text: '2.50 × 10⁻¹⁹ eV', feedback: 'Incorrect. This calculation error likely comes from improper unit conversion.' }
    ],
    correctOptionId: 'c',
    explanation: 'To convert from Joules to electron volts, divide by the conversion factor 1.602 × 10⁻¹⁹ J/eV. So (6.67 × 10⁻²⁶ J) ÷ (1.602 × 10⁻¹⁹ J/eV) = 4.17 × 10⁻⁷ eV',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'unit-conversion', 'electron-volts', 'energy-calculations']
  },
  {
    questionText: "What is the energy of a blue light photon with a wavelength of 450 nm?",
    options: [
      { id: 'a', text: '2.77 × 10⁻¹⁹ J', feedback: 'Incorrect. This calculation likely used the wrong wavelength value.' },
      { id: 'b', text: '4.42 × 10⁻¹⁹ J', feedback: 'Correct! Using E = hc/λ = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s) / (450 × 10⁻⁹ m) = 4.42 × 10⁻¹⁹ J' },
      { id: 'c', text: '6.63 × 10⁻³⁴ J', feedback: 'Incorrect. This is Planck\'s constant, not the photon energy.' },
      { id: 'd', text: '1.33 × 10⁻¹⁸ J', feedback: 'Incorrect. This value is too high for visible light photon energy.' }
    ],
    correctOptionId: 'b',
    explanation: 'For photon energy using wavelength: E = hc/λ, where h is Planck\'s constant, c is the speed of light, and λ is wavelength. E = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s) / (450 × 10⁻⁹ m) = 4.42 × 10⁻¹⁹ J',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'wavelength', 'visible-light', 'blue-light']
  },
  {
    questionText: "A quantum of EMR has an energy of 1.0 MeV. What is its frequency?",
    options: [
      { id: 'a', text: '1.6 × 10⁻¹⁹ Hz', feedback: 'Incorrect. This is the conversion factor for electron volts to Joules, not frequency.' },
      { id: 'b', text: '3.0 × 10¹⁷ Hz', feedback: 'Incorrect. This calculation error likely comes from using the wrong energy conversion.' },
      { id: 'c', text: '2.4 × 10²⁰ Hz', feedback: 'Correct! Converting 1.0 MeV to Joules: (1.0 × 10⁶ eV)(1.602 × 10⁻¹⁹ J/eV) = 1.602 × 10⁻¹³ J, then f = E/h = 2.4 × 10²⁰ Hz' },
      { id: 'd', text: '5.0 × 10⁻⁷ Hz', feedback: 'Incorrect. This frequency is far too low for such high-energy radiation.' }
    ],
    correctOptionId: 'c',
    explanation: 'First convert 1.0 MeV to Joules: (1.0 × 10⁶ eV)(1.602 × 10⁻¹⁹ J/eV) = 1.602 × 10⁻¹³ J. Then use f = E/h = (1.602 × 10⁻¹³ J) / (6.626 × 10⁻³⁴ J·s) = 2.4 × 10²⁰ Hz',
    difficulty: 'advanced',
    tags: ['frequency-calculation', 'mev-conversion', 'high-energy-radiation', 'quantum-energy']
  },
  {
    questionText: "A quantum of EMR has an energy of 1.0 MeV. What type of electromagnetic radiation is this?",
    options: [
      { id: 'a', text: 'Microwave', feedback: 'Incorrect. Microwaves have energies in the range of 10⁻⁶ to 10⁻³ eV, much lower than 1.0 MeV.' },
      { id: 'b', text: 'Infrared', feedback: 'Incorrect. Infrared radiation has energies in the range of 10⁻³ to 1.5 eV, much lower than 1.0 MeV.' },
      { id: 'c', text: 'Ultraviolet', feedback: 'Incorrect. UV radiation has energies in the range of 3 to 100 eV, still much lower than 1.0 MeV.' },
      { id: 'd', text: 'Gamma ray', feedback: 'Correct! Gamma rays have energies of 100 keV and above. 1.0 MeV = 1000 keV, which is definitely in the gamma ray range.' }
    ],
    correctOptionId: 'd',
    explanation: 'Electromagnetic radiation with energy of 1.0 MeV (1 million electron volts) is in the gamma ray range. Gamma rays typically have energies above 100 keV, making 1.0 MeV clearly a gamma ray photon.',
    difficulty: 'intermediate',
    tags: ['electromagnetic-spectrum', 'gamma-rays', 'energy-ranges', 'radiation-types']
  },
  {
    questionText: "A red neon laser has a wavelength of 632.8 nm and a power output of 1.50 mW. How many photons does it emit per second?",
    options: [
      { id: 'a', text: '7.39 × 10²³', feedback: 'Incorrect. This number is far too high and approaches Avogadro\'s number.' },
      { id: 'b', text: '4.77 × 10¹⁵', feedback: 'Correct! First find photon energy: E = hc/λ = 3.14 × 10⁻¹⁹ J. Then N = P/E = (1.50 × 10⁻³ W)/(3.14 × 10⁻¹⁹ J) = 4.77 × 10¹⁵ photons/s' },
      { id: 'c', text: '2.95 × 10¹⁸', feedback: 'Incorrect. This calculation error likely comes from using the wrong power or energy values.' },
      { id: 'd', text: '9.11 × 10⁷', feedback: 'Incorrect. This number is too small for a milliwatt laser output.' }
    ],
    correctOptionId: 'b',
    explanation: 'First calculate the energy per photon: E = hc/λ = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s)/(632.8 × 10⁻⁹ m) = 3.14 × 10⁻¹⁹ J. Then find the number of photons per second: N = P/E = (1.50 × 10⁻³ W)/(3.14 × 10⁻¹⁹ J) = 4.77 × 10¹⁵ photons/s',
    difficulty: 'advanced',
    tags: ['laser-physics', 'photon-rate', 'power-calculations', 'red-light']
  },
  {
    questionText: "A 50-watt light bulb is 5.0% efficient at producing light with an average wavelength of 500 nm. How many photons are released per second?",
    options: [
      { id: 'a', text: '6.3 × 10¹⁸', feedback: 'Correct! Light power = 50 W × 0.05 = 2.5 W. Photon energy = hc/λ = 3.97 × 10⁻¹⁹ J. N = P/E = 2.5 W / 3.97 × 10⁻¹⁹ J = 6.3 × 10¹⁸ photons/s' },
      { id: 'b', text: '3.2 × 10¹⁶', feedback: 'Incorrect. This calculation likely forgot to account for the 5% efficiency.' },
      { id: 'c', text: '9.4 × 10²⁰', feedback: 'Incorrect. This number is too high and suggests a calculation error.' },
      { id: 'd', text: '2.7 × 10¹⁵', feedback: 'Incorrect. This number is too low for a 50-watt bulb, even at 5% efficiency.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find the light power: 50 W × 0.05 = 2.5 W. Then calculate photon energy: E = hc/λ = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s)/(500 × 10⁻⁹ m) = 3.97 × 10⁻¹⁹ J. Finally: N = P/E = 2.5 W / 3.97 × 10⁻¹⁹ J = 6.3 × 10¹⁸ photons/s',
    difficulty: 'advanced',
    tags: ['light-bulb-efficiency', 'photon-rate', 'visible-light', 'power-efficiency']
  },
  {
    questionText: "Why doesn't red light affect photographic film during darkroom processing?",
    options: [
      { id: 'a', text: 'Red light has high energy and is blocked by the film', feedback: 'Incorrect. Red light actually has relatively low energy among visible light.' },
      { id: 'b', text: 'Red light is outside the visible spectrum', feedback: 'Incorrect. Red light is part of the visible spectrum, at the low-energy end.' },
      { id: 'c', text: 'Red light has low energy and doesn\'t expose the film', feedback: 'Correct! Red light photons have insufficient energy to trigger the chemical reactions in photographic film emulsion.' },
      { id: 'd', text: 'Red light neutralizes the film\'s charge', feedback: 'Incorrect. Red light doesn\'t neutralize charges; it simply lacks enough energy to expose the film.' }
    ],
    correctOptionId: 'c',
    explanation: 'Red light has the lowest energy among visible light wavelengths. Its photons don\'t have enough energy to trigger the chemical reactions in photographic film emulsion that would cause exposure. This is why red light can be used safely in darkrooms.',
    difficulty: 'beginner',
    tags: ['red-light', 'photographic-film', 'low-energy-photons', 'darkroom-processing']
  },
  {
    questionText: "What can we say about the temperatures of reddish, bluish, and whitish-yellow stars?",
    options: [
      { id: 'a', text: 'Blue stars are cooler than red stars', feedback: 'Incorrect. This is backwards - blue stars are actually much hotter than red stars.' },
      { id: 'b', text: 'Red stars are the hottest', feedback: 'Incorrect. Red stars are the coolest among visible stars.' },
      { id: 'c', text: 'Whitish-yellow stars are the coolest', feedback: 'Incorrect. Whitish-yellow stars like our Sun are intermediate in temperature.' },
      { id: 'd', text: 'Blue stars are the hottest, red stars are the coolest', feedback: 'Correct! Higher temperature objects emit higher energy photons. Blue light has higher energy than red light, so blue stars are hotter than red stars.' }
    ],
    correctOptionId: 'd',
    explanation: 'According to blackbody radiation and Wien\'s displacement law, hotter objects emit light with shorter wavelengths (higher energy). Blue light has shorter wavelength than red light, so blue stars are hotter than red stars. The sequence from hottest to coolest is: blue → white → yellow → red.',
    difficulty: 'intermediate',
    tags: ['stellar-temperature', 'blackbody-radiation', 'wien-displacement-law', 'star-colors']
  },
  {
    questionText: "If all objects radiate energy, why can't we see them in the dark?",
    options: [
      { id: 'a', text: 'They do not emit visible light', feedback: 'Correct! Objects at room temperature emit infrared radiation, not visible light. Our eyes can only detect visible light wavelengths.' },
      { id: 'b', text: 'They absorb all radiation', feedback: 'Incorrect. All objects above absolute zero emit electromagnetic radiation according to their temperature.' },
      { id: 'c', text: 'Their energy is stored as potential energy', feedback: 'Incorrect. Thermal energy is continuously radiated away as electromagnetic radiation.' },
      { id: 'd', text: 'Radiation is only emitted at absolute zero', feedback: 'Incorrect. This is backwards - objects only stop radiating at absolute zero.' }
    ],
    correctOptionId: 'a',
    explanation: 'All objects above absolute zero emit electromagnetic radiation, but the wavelength depends on temperature. Objects at room temperature emit primarily infrared radiation, which our eyes cannot detect. We can only see objects that emit or reflect visible light.',
    difficulty: 'beginner',
    tags: ['thermal-radiation', 'infrared-radiation', 'visible-light', 'blackbody-radiation']
  },
  {
    questionText: "What do we mean by a \"particle\"?",
    options: [
      { id: 'a', text: 'A disturbance in a field', feedback: 'Incorrect. This describes a wave phenomenon, not a particle.' },
      { id: 'b', text: 'A continuous wave', feedback: 'Incorrect. This describes wave behavior, which is opposite to particle behavior.' },
      { id: 'c', text: 'A discrete packet of energy or mass', feedback: 'Correct! A particle is a localized, discrete entity with definite properties like mass, charge, and momentum.' },
      { id: 'd', text: 'A region of space with no matter', feedback: 'Incorrect. This describes a vacuum, not a particle.' }
    ],
    correctOptionId: 'c',
    explanation: 'In physics, a particle is a discrete, localized entity with definite properties such as mass, charge, and momentum. Unlike waves, particles have definite boundaries and can be counted as individual units.',
    difficulty: 'beginner',
    tags: ['particle-definition', 'discrete-energy', 'quantum-mechanics', 'wave-particle-duality']
  },
  {
    questionText: "What do we mean by a \"wave\"?",
    options: [
      { id: 'a', text: 'A high-speed particle', feedback: 'Incorrect. This describes particle motion, not wave behavior.' },
      { id: 'b', text: 'A repetitive oscillation that carries energy', feedback: 'Correct! A wave is a repetitive disturbance that propagates through space or a medium, carrying energy without carrying matter.' },
      { id: 'c', text: 'A small nucleus', feedback: 'Incorrect. A nucleus is a particle, not a wave.' },
      { id: 'd', text: 'A bundle of particles', feedback: 'Incorrect. This describes a collection of particles, not wave behavior.' }
    ],
    correctOptionId: 'b',
    explanation: 'A wave is a repetitive disturbance or oscillation that propagates through space or a medium, carrying energy from one location to another without transporting matter. Examples include sound waves, light waves, and water waves.',
    difficulty: 'beginner',
    tags: ['wave-definition', 'oscillation', 'energy-transfer', 'wave-particle-duality']
  },
  {
    questionText: "What are key differences between electrons and photons?",
    options: [
      { id: 'a', text: 'Electrons have mass; photons do not', feedback: 'Correct! Electrons have rest mass (9.109 × 10⁻³¹ kg) while photons are massless particles that always travel at the speed of light.' },
      { id: 'b', text: 'Photons orbit nuclei; electrons don\'t', feedback: 'Incorrect. This is backwards - electrons orbit nuclei in atoms, while photons are emitted and absorbed by atoms.' },
      { id: 'c', text: 'Photons are negatively charged; electrons are neutral', feedback: 'Incorrect. This is backwards - electrons are negatively charged while photons are electrically neutral.' },
      { id: 'd', text: 'Electrons travel at the speed of light; photons do not', feedback: 'Incorrect. This is backwards - photons always travel at the speed of light while electrons travel at various speeds less than c.' }
    ],
    correctOptionId: 'a',
    explanation: 'The key difference is that electrons have rest mass while photons are massless. This means electrons can be at rest or move at various speeds, while photons always travel at the speed of light and cannot be at rest.',
    difficulty: 'intermediate',
    tags: ['electron-properties', 'photon-properties', 'mass-energy', 'fundamental-particles']
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
  'course2_53_question1': {
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
  'course2_53_question2': {
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
  'course2_53_question3': {
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
  'course2_53_question4': {
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
  'course2_53_question5': {
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
  'course2_53_question6': {
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
  'course2_53_question7': {
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
  'course2_53_question8': {
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
  'course2_53_question9': {
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
  'course2_53_question10': {
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
  'course2_53_question11': {
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
  'course2_53_question12': {
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
  'course2_53_question13': {
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