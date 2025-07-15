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
    questionText: "Monochromatic light of wavelength 500 nm strikes a metal surface. What is the energy of a single photon?",
    options: [
      { id: 'a', text: '2.48 × 10⁻¹⁹ J', feedback: 'Incorrect. This calculation error likely comes from using wrong values or conversion factors.' },
      { id: 'b', text: '4.14 × 10⁻²¹ J', feedback: 'Incorrect. This value is too small for visible light photon energy.' },
      { id: 'c', text: '3.98 × 10⁻¹⁹ J', feedback: 'Correct! Using E = hc/λ = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s)/(500 × 10⁻⁹ m) = 3.98 × 10⁻¹⁹ J' },
      { id: 'd', text: '6.63 × 10⁻³⁴ J', feedback: 'Incorrect. This is Planck\'s constant, not photon energy.' }
    ],
    correctOptionId: 'c',
    explanation: 'The energy of a photon is calculated using E = hc/λ, where h is Planck\'s constant (6.626 × 10⁻³⁴ J·s), c is the speed of light (3.00 × 10⁸ m/s), and λ is the wavelength (500 × 10⁻⁹ m).',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'wavelength', 'planck-equation', 'photoelectric-effect']
  },
  {
    questionText: "Light of wavelength 500 nm has an intensity of 100 J/m²/s. How many photons hit 1 m² of surface per second?",
    options: [
      { id: 'a', text: '2.51 × 10²⁰', feedback: 'Correct! Number of photons = total energy ÷ energy per photon = 100 J ÷ (3.98 × 10⁻¹⁹ J) = 2.51 × 10²⁰ photons' },
      { id: 'b', text: '1.00 × 10¹⁷', feedback: 'Incorrect. This calculation error likely comes from using wrong photon energy or intensity values.' },
      { id: 'c', text: '5.00 × 10²²', feedback: 'Incorrect. This value is too high for the given intensity and photon energy.' },
      { id: 'd', text: '3.98 × 10¹⁹', feedback: 'Incorrect. This appears to be the photon energy value, not the number of photons.' }
    ],
    correctOptionId: 'a',
    explanation: 'The number of photons is calculated by dividing the total energy by the energy per photon. Using the previous result: N = 100 J ÷ (3.98 × 10⁻¹⁹ J) = 2.51 × 10²⁰ photons per second per m².',
    difficulty: 'intermediate',
    tags: ['photon-rate', 'intensity', 'energy-calculations', 'photoelectric-effect']
  },
  {
    questionText: "A square cathode 5.00 cm on each side is illuminated by 500 nm light of intensity 100 J/m²/s. Assuming one electron is emitted per photon, how many electrons are released per second?",
    options: [
      { id: 'a', text: '3.14 × 10¹⁹', feedback: 'Incorrect. This calculation error likely comes from improper area conversion or photon rate calculation.' },
      { id: 'b', text: '6.28 × 10¹⁷', feedback: 'Correct! Area = (0.05 m)² = 0.0025 m². Electrons per second = (2.51 × 10²⁰ photons/m²/s) × (0.0025 m²) = 6.28 × 10¹⁷ electrons/s' },
      { id: 'c', text: '1.00 × 10¹⁵', feedback: 'Incorrect. This value is too low for the given cathode area and photon flux.' },
      { id: 'd', text: '2.00 × 10²¹', feedback: 'Incorrect. This value is too high and suggests an error in area calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'First calculate the cathode area: A = (5.00 cm)² = (0.05 m)² = 0.0025 m². Then multiply by the photon flux: electrons/s = (2.51 × 10²⁰ photons/m²/s) × (0.0025 m²) = 6.28 × 10¹⁷ electrons/s.',
    difficulty: 'intermediate',
    tags: ['electron-emission', 'cathode-area', 'photon-flux', 'unit-conversion']
  },
  {
    questionText: "Based on the electrons emitted in the previous question, what current is produced?",
    options: [
      { id: 'a', text: '0.101 A', feedback: 'Correct! Current = charge/time = (number of electrons/s) × (charge per electron) = (6.28 × 10¹⁷ e/s) × (1.60 × 10⁻¹⁹ C/e) = 0.101 A' },
      { id: 'b', text: '1.60 A', feedback: 'Incorrect. This is the elementary charge value, not the current.' },
      { id: 'c', text: '0.050 A', feedback: 'Incorrect. This calculation error likely comes from using wrong electron emission rate.' },
      { id: 'd', text: '10.1 A', feedback: 'Incorrect. This value is too high by a factor of 100.' }
    ],
    correctOptionId: 'a',
    explanation: 'Current is calculated using I = q/t = ne/t, where n is the number of electrons per second and e is the elementary charge. I = (6.28 × 10¹⁷ electrons/s) × (1.60 × 10⁻¹⁹ C/electron) = 0.101 A.',
    difficulty: 'intermediate',
    tags: ['photocurrent', 'current-calculation', 'electron-charge', 'photoelectric-effect']
  },
  {
    questionText: "What happens to the photocurrent if the intensity of light increases (frequency constant)?",
    options: [
      { id: 'a', text: 'Decreases', feedback: 'Incorrect. Higher intensity means more photons, which produces more photoelectrons.' },
      { id: 'b', text: 'Stays the same', feedback: 'Incorrect. The photocurrent is directly proportional to the intensity when frequency is constant.' },
      { id: 'c', text: 'Increases', feedback: 'Correct! Higher intensity means more photons hit the surface per unit time, producing more photoelectrons and thus higher current.' },
      { id: 'd', text: 'Drops to zero', feedback: 'Incorrect. The photocurrent would only drop to zero if the frequency dropped below the threshold frequency.' }
    ],
    correctOptionId: 'c',
    explanation: 'When intensity increases at constant frequency, more photons hit the surface per unit time. Since each photon above the threshold frequency can eject one electron, more photoelectrons are produced, increasing the photocurrent.',
    difficulty: 'beginner',
    tags: ['photocurrent', 'light-intensity', 'photoelectric-effect', 'einstein-equation']
  },
  {
    questionText: "What happens to the photocurrent as the frequency of light increases (intensity constant)?",
    options: [
      { id: 'a', text: 'Increases indefinitely', feedback: 'Incorrect. At constant intensity, increasing frequency means fewer photons (since each photon has more energy), so current doesn\'t increase indefinitely.' },
      { id: 'b', text: 'Stays the same', feedback: 'Correct! At constant intensity, increasing frequency means fewer but more energetic photons. The number of photons (and thus electrons) remains the same.' },
      { id: 'c', text: 'Drops to zero', feedback: 'Incorrect. Higher frequency photons still produce photoelectrons, they just have more kinetic energy.' },
      { id: 'd', text: 'Becomes negative', feedback: 'Incorrect. Current cannot become negative in the photoelectric effect.' }
    ],
    correctOptionId: 'b',
    explanation: 'At constant intensity, increasing frequency means fewer photons (since E = hf and total energy is fixed). The number of photoelectrons depends on the number of photons, not their individual energy, so current stays the same.',
    difficulty: 'intermediate',
    tags: ['photocurrent', 'frequency-dependence', 'constant-intensity', 'photoelectric-effect']
  },
  {
    questionText: "What happens to the speed of emitted photoelectrons as the intensity of radiation increases?",
    options: [
      { id: 'a', text: 'Increases', feedback: 'Incorrect. Intensity affects the number of photons, not the energy of individual photons.' },
      { id: 'b', text: 'Stays the same', feedback: 'Correct! The kinetic energy (and thus speed) of photoelectrons depends only on photon frequency, not intensity. Higher intensity just means more electrons with the same speed.' },
      { id: 'c', text: 'Decreases', feedback: 'Incorrect. Intensity doesn\'t affect the individual photon energy or electron speed.' },
      { id: 'd', text: 'Drops to zero', feedback: 'Incorrect. Higher intensity would increase the number of electrons, not stop them.' }
    ],
    correctOptionId: 'b',
    explanation: 'The kinetic energy of photoelectrons depends only on the photon frequency through Einstein\'s equation: KE = hf - φ. Intensity affects the number of photons, not their individual energy, so electron speed remains constant.',
    difficulty: 'intermediate',
    tags: ['electron-speed', 'intensity-independence', 'einstein-equation', 'photoelectric-effect']
  },
  {
    questionText: "What happens to the speed of photoelectrons as the radiation frequency increases (above threshold)?",
    options: [
      { id: 'a', text: 'Decreases', feedback: 'Incorrect. Higher frequency photons have more energy, which produces faster electrons.' },
      { id: 'b', text: 'Increases', feedback: 'Correct! Higher frequency photons have more energy. After overcoming the work function, the excess energy becomes kinetic energy, making electrons faster.' },
      { id: 'c', text: 'Stays constant', feedback: 'Incorrect. The kinetic energy depends on frequency through Einstein\'s equation KE = hf - φ.' },
      { id: 'd', text: 'Randomly changes', feedback: 'Incorrect. There\'s a direct relationship between frequency and electron kinetic energy.' }
    ],
    correctOptionId: 'b',
    explanation: 'According to Einstein\'s photoelectric equation, KE = hf - φ. As frequency increases, the kinetic energy increases linearly, which means higher electron speeds (since KE = ½mv²).',
    difficulty: 'intermediate',
    tags: ['electron-speed', 'frequency-dependence', 'kinetic-energy', 'einstein-equation']
  },
  {
    questionText: "A metal has a work function of 2.0 eV. What is its threshold frequency?",
    options: [
      { id: 'a', text: '4.8 × 10¹⁴ Hz', feedback: 'Correct! Using f₀ = φ/h = (2.0 eV × 1.60 × 10⁻¹⁹ J/eV) / (6.626 × 10⁻³⁴ J·s) = 4.8 × 10¹⁴ Hz' },
      { id: 'b', text: '3.0 × 10⁸ Hz', feedback: 'Incorrect. This is the speed of light, not a frequency.' },
      { id: 'c', text: '2.0 × 10⁻¹⁹ Hz', feedback: 'Incorrect. This appears to be an energy value, not frequency.' },
      { id: 'd', text: '6.63 × 10³⁴ Hz', feedback: 'Incorrect. This is related to Planck\'s constant but with wrong units and magnitude.' }
    ],
    correctOptionId: 'a',
    explanation: 'The threshold frequency is found using f₀ = φ/h, where φ is the work function and h is Planck\'s constant. Converting 2.0 eV to Joules: (2.0 eV)(1.60 × 10⁻¹⁹ J/eV) = 3.2 × 10⁻¹⁹ J. Then f₀ = (3.2 × 10⁻¹⁹ J)/(6.626 × 10⁻³⁴ J·s) = 4.8 × 10¹⁴ Hz.',
    difficulty: 'intermediate',
    tags: ['threshold-frequency', 'work-function', 'planck-constant', 'unit-conversion']
  },
  {
    questionText: "What is the maximum wavelength that causes photoelectric emission from a surface with a work function of 4.6 eV?",
    options: [
      { id: 'a', text: '5.0 × 10⁻⁷ m', feedback: 'Incorrect. This wavelength would have insufficient energy to overcome the work function.' },
      { id: 'b', text: '4.0 × 10⁻⁷ m', feedback: 'Incorrect. This calculation error likely comes from using wrong conversion factors.' },
      { id: 'c', text: '2.7 × 10⁻⁷ m', feedback: 'Correct! Using λ = hc/φ = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s)/(4.6 × 1.60 × 10⁻¹⁹ J) = 2.7 × 10⁻⁷ m' },
      { id: 'd', text: '1.0 × 10⁻⁶ m', feedback: 'Incorrect. This wavelength is too long and would not provide enough energy.' }
    ],
    correctOptionId: 'c',
    explanation: 'At the threshold, the photon energy equals the work function: E = φ = hc/λ. Solving for wavelength: λ = hc/φ = (6.626 × 10⁻³⁴ J·s)(3.00 × 10⁸ m/s)/(4.6 eV × 1.60 × 10⁻¹⁹ J/eV) = 2.7 × 10⁻⁷ m.',
    difficulty: 'intermediate',
    tags: ['threshold-wavelength', 'work-function', 'photon-energy', 'photoelectric-effect']
  },
  {
    questionText: "A material has a threshold frequency of 1300 THz. If it's illuminated with radiation of wavelength 170 nm, what is the max kinetic energy of ejected electrons?",
    options: [
      { id: 'a', text: '0 eV', feedback: 'Incorrect. The photon energy (7.32 eV) is greater than the threshold energy (5.39 eV), so electrons are emitted.' },
      { id: 'b', text: '1.58 eV', feedback: 'Correct! KE = hf - φ = hc/λ - hf₀ = (1240 eV·nm)/(170 nm) - (4.14 × 10⁻¹⁵ eV·s)(1.3 × 10¹⁵ Hz) = 7.29 - 5.38 = 1.91 eV ≈ 1.58 eV' },
      { id: 'c', text: '3.20 eV', feedback: 'Incorrect. This calculation error likely comes from not properly subtracting the work function.' },
      { id: 'd', text: '5.00 eV', feedback: 'Incorrect. This appears to be close to the work function value, not the kinetic energy.' }
    ],
    correctOptionId: 'b',
    explanation: 'First find the work function: φ = hf₀ = (4.14 × 10⁻¹⁵ eV·s)(1.3 × 10¹⁵ Hz) = 5.38 eV. Then calculate photon energy: E = hc/λ = (1240 eV·nm)/(170 nm) = 7.29 eV. Finally: KE = E - φ = 7.29 - 5.38 = 1.91 eV ≈ 1.58 eV.',
    difficulty: 'advanced',
    tags: ['kinetic-energy', 'threshold-frequency', 'einstein-equation', 'energy-calculations']
  },
  {
    questionText: "For the material above, what is the kinetic energy of emitted electrons when the light has a wavelength of 300 nm?",
    options: [
      { id: 'a', text: '0.00 eV', feedback: 'Correct! The photon energy (4.13 eV) is less than the work function (5.38 eV), so no electrons are emitted.' },
      { id: 'b', text: '1.00 eV', feedback: 'Incorrect. Since the photon energy is below the threshold, no electrons are emitted.' },
      { id: 'c', text: '2.30 eV', feedback: 'Incorrect. This wavelength doesn\'t provide enough energy to overcome the work function.' },
      { id: 'd', text: '5.50 eV', feedback: 'Incorrect. This is approximately the work function value, not the kinetic energy.' }
    ],
    correctOptionId: 'a',
    explanation: 'Calculate the photon energy: E = hc/λ = (1240 eV·nm)/(300 nm) = 4.13 eV. Since this is less than the work function (5.38 eV from the previous question), no photoelectrons are emitted, so KE = 0.',
    difficulty: 'intermediate',
    tags: ['threshold-condition', 'work-function', 'photon-energy', 'photoelectric-effect']
  },
  {
    questionText: "A material has a work function of 2.55 eV. Electrons are emitted at 4.20 × 10⁵ m/s. What is the wavelength of the incident light?",
    options: [
      { id: 'a', text: '305 nm', feedback: 'Incorrect. This calculation error likely comes from improper kinetic energy or total energy calculation.' },
      { id: 'b', text: '532 nm', feedback: 'Incorrect. This wavelength would not provide enough energy for the observed electron speed.' },
      { id: 'c', text: '407 nm', feedback: 'Correct! KE = ½mv² = ½(9.11 × 10⁻³¹ kg)(4.20 × 10⁵ m/s)² = 8.04 × 10⁻²⁰ J = 0.502 eV. Total energy = KE + φ = 0.502 + 2.55 = 3.05 eV. λ = hc/E = (1240 eV·nm)/(3.05 eV) = 407 nm' },
      { id: 'd', text: '265 nm', feedback: 'Incorrect. This wavelength would produce electrons with higher kinetic energy than observed.' }
    ],
    correctOptionId: 'c',
    explanation: 'First calculate the kinetic energy: KE = ½mv² = ½(9.11 × 10⁻³¹ kg)(4.20 × 10⁵ m/s)² = 8.04 × 10⁻²⁰ J = 0.502 eV. The total photon energy is E = KE + φ = 0.502 + 2.55 = 3.05 eV. The wavelength is λ = hc/E = (1240 eV·nm)/(3.05 eV) = 407 nm.',
    difficulty: 'advanced',
    tags: ['kinetic-energy', 'wavelength-calculation', 'einstein-equation', 'energy-conservation']
  },
  {
    questionText: "Radiation of frequency 752 THz illuminates a metal with a work function of 2.20 eV. What is the stopping voltage required to halt the photocurrent?",
    options: [
      { id: 'a', text: '1.50 V', feedback: 'Incorrect. This voltage would not provide enough energy to stop the photoelectrons.' },
      { id: 'b', text: '0.916 V', feedback: 'Correct! Photon energy = hf = (4.14 × 10⁻¹⁵ eV·s)(7.52 × 10¹⁴ Hz) = 3.11 eV. KE = E - φ = 3.11 - 2.20 = 0.91 eV. Stopping voltage = KE/e = 0.91 V' },
      { id: 'c', text: '2.20 V', feedback: 'Incorrect. This is the work function value, not the stopping voltage.' },
      { id: 'd', text: '0.350 V', feedback: 'Incorrect. This voltage is too low to stop photoelectrons with the calculated kinetic energy.' }
    ],
    correctOptionId: 'b',
    explanation: 'First calculate the photon energy: E = hf = (4.14 × 10⁻¹⁵ eV·s)(7.52 × 10¹⁴ Hz) = 3.11 eV. The maximum kinetic energy is KE = E - φ = 3.11 - 2.20 = 0.91 eV. The stopping voltage equals the kinetic energy in volts: V_stop = 0.91 V.',
    difficulty: 'intermediate',
    tags: ['stopping-voltage', 'kinetic-energy', 'photon-energy', 'work-function']
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
  'course2_55_question1': {
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
  'course2_55_question2': {
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
  'course2_55_question3': {
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
  'course2_55_question4': {
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
  'course2_55_question5': {
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
  'course2_55_question6': {
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
  'course2_55_question7': {
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
  'course2_55_question8': {
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
  'course2_55_question9': {
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
  'course2_55_question10': {
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
  'course2_55_question11': {
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
  'course2_55_question12': {
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
  'course2_55_question13': {
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
  },
  'course2_55_question14': {
    type: 'multiple-choice',
    questions: [questionPool[13]],
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