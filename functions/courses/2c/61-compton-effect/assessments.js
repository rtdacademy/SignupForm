// Cloud function creation imports removed since we only export data configs now
// Removed dependency on config file - settings are now handled directly in assessment configurations

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Question pool with complete configuration
const questionPool = [
  {
    questionText: "Electrons are accelerated through a potential difference of 11.1 kV. What is the minimum wavelength of the radiation produced when they are stopped? What region of the spectrum does this fall into?",
    options: [
      { id: 'a', text: '6.60 × 10⁻⁹ m, visible spectrum', feedback: 'Incorrect. This wavelength is too long and corresponds to visible light, not X-rays.' },
      { id: 'b', text: '3.21 × 10⁻⁸ m, ultraviolet', feedback: 'Incorrect. This wavelength is in the UV range, but the calculated value is smaller.' },
      { id: 'c', text: '1.12 × 10⁻¹⁰ m, X-ray', feedback: 'Correct! Using λ_min = hc/eV = (6.63×10⁻³⁴ × 3×10⁸)/(1.6×10⁻¹⁹ × 11100) = 1.12×10⁻¹⁰ m, which is in the X-ray region.' },
      { id: 'd', text: '4.00 × 10⁻⁶ m, infrared', feedback: 'Incorrect. This wavelength is much too long and corresponds to infrared radiation.' }
    ],
    correctOptionId: 'c',
    explanation: 'The minimum wavelength occurs when all kinetic energy is converted to photon energy. Using λ_min = hc/eV where V = 11.1 kV, we get λ_min = 1.12×10⁻¹⁰ m, which falls in the X-ray region of the electromagnetic spectrum.',
    difficulty: 'intermediate',
    tags: ['x-ray-production', 'minimum-wavelength', 'electromagnetic-spectrum', 'energy-conversion']
  },
  {
    questionText: "X-rays with a wavelength of 0.370 nm are produced in an X-ray tube. What is the potential difference used in operating the tube?",
    options: [
      { id: 'a', text: '2.17 × 10³ V', feedback: 'Incorrect. This voltage is too low to produce X-rays of this wavelength.' },
      { id: 'b', text: '3.36 × 10³ V', feedback: 'Correct! Using V = hc/(eλ) = (6.63×10⁻³⁴ × 3×10⁸)/(1.6×10⁻¹⁹ × 0.370×10⁻⁹) = 3.36×10³ V.' },
      { id: 'c', text: '1.10 × 10⁴ V', feedback: 'Incorrect. This voltage is too high for the given wavelength.' },
      { id: 'd', text: '7.15 × 10⁴ V', feedback: 'Incorrect. This voltage is much too high for the given wavelength.' }
    ],
    correctOptionId: 'b',
    explanation: 'The potential difference determines the maximum photon energy. Using E = eV = hc/λ, we can solve for V: V = hc/(eλ) = 3.36×10³ V.',
    difficulty: 'intermediate',
    tags: ['x-ray-tube', 'potential-difference', 'wavelength-energy-relationship', 'photon-energy']
  },
  {
    questionText: "An electron traveling at 5.2 × 10⁴ m/s strikes a dense metal target and comes to rest. What is the frequency of the emitted photon?",
    options: [
      { id: 'a', text: '2.40 × 10¹⁴ Hz', feedback: 'Incorrect. This frequency is too high for the given electron speed.' },
      { id: 'b', text: '6.63 × 10¹³ Hz', feedback: 'Incorrect. This frequency does not match the kinetic energy calculation.' },
      { id: 'c', text: '1.9 × 10¹² Hz', feedback: 'Correct! KE = ½mv² = ½(9.11×10⁻³¹)(5.2×10⁴)² = 1.23×10⁻²¹ J. Using E = hf, f = E/h = 1.9×10¹² Hz.' },
      { id: 'd', text: '9.1 × 10⁻³¹ Hz', feedback: 'Incorrect. This value is much too small and appears to be the electron mass value.' }
    ],
    correctOptionId: 'c',
    explanation: 'When the electron comes to rest, all its kinetic energy is converted to photon energy. KE = ½mv² = 1.23×10⁻²¹ J. Using E = hf, the frequency is f = E/h = 1.9×10¹² Hz.',
    difficulty: 'intermediate',
    tags: ['kinetic-energy-conversion', 'electron-collision', 'photon-frequency', 'energy-conservation']
  },
  {
    questionText: "In a classroom CRT demonstration, electrons are accelerated using a 50 kV potential difference. What is the frequency of the emitted radiation, and is it dangerous?",
    options: [
      { id: 'a', text: '3.0 × 10⁸ Hz, and no', feedback: 'Incorrect. This frequency is far too low and would not be dangerous.' },
      { id: 'b', text: '1.2 × 10¹⁹ Hz, and yes', feedback: 'Correct! E = eV = (1.6×10⁻¹⁹)(50×10³) = 8×10⁻¹⁵ J. f = E/h = 1.2×10¹⁹ Hz. This is high-energy X-ray radiation, which is dangerous.' },
      { id: 'c', text: '6.6 × 10⁻³⁴ Hz, and no', feedback: 'Incorrect. This frequency is impossibly low (Planck constant value).' },
      { id: 'd', text: '2.1 × 10¹⁶ Hz, and yes', feedback: 'Incorrect. While this would be dangerous, the frequency calculation is wrong.' }
    ],
    correctOptionId: 'b',
    explanation: 'The electron energy E = eV = 8×10⁻¹⁵ J corresponds to f = E/h = 1.2×10¹⁹ Hz. This is high-energy X-ray radiation that can penetrate tissue and is dangerous without proper shielding.',
    difficulty: 'intermediate',
    tags: ['crt-radiation', 'high-voltage-acceleration', 'radiation-safety', 'x-ray-danger']
  },
  {
    questionText: "An alpha particle is accelerated through a potential difference of 320 kV and strikes a tungsten barrier. What is the wavelength of the emitted radiation?",
    options: [
      { id: 'a', text: '1.94 × 10⁻¹² m', feedback: 'Correct! For an alpha particle (q = 2e), E = qV = 2eV = 2(1.6×10⁻¹⁹)(320×10³) = 1.024×10⁻¹³ J. λ = hc/E = 1.94×10⁻¹² m.' },
      { id: 'b', text: '6.60 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength is too long for the high energy involved.' },
      { id: 'c', text: '3.21 × 10⁻¹⁴ m', feedback: 'Incorrect. This wavelength is too short for the calculated energy.' },
      { id: 'd', text: '2.20 × 10⁻¹⁰ m', feedback: 'Incorrect. This wavelength does not match the energy calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'An alpha particle has charge q = 2e. The energy gained is E = qV = 2eV = 1.024×10⁻¹³ J. Using λ = hc/E gives λ = 1.94×10⁻¹² m.',
    difficulty: 'advanced',
    tags: ['alpha-particle', 'charged-particle-acceleration', 'wavelength-calculation', 'tungsten-target']
  },
  {
    questionText: "A current of 5.0 μA lasts for 4.2 μs as electrons strike a metal target. If the total beam energy is 1.4 × 10⁻¹¹ J, what is the average wavelength of the photons generated?",
    options: [
      { id: 'a', text: '1.9 × 10⁻⁶ m', feedback: 'Correct! Number of electrons = (5.0×10⁻⁶ × 4.2×10⁻⁶)/(1.6×10⁻¹⁹) = 1.31×10⁸. Energy per photon = (1.4×10⁻¹¹)/(1.31×10⁸) = 1.07×10⁻¹⁹ J. λ = hc/E = 1.9×10⁻⁶ m.' },
      { id: 'b', text: '3.0 × 10⁻⁷ m', feedback: 'Incorrect. This wavelength does not match the calculated average photon energy.' },
      { id: 'c', text: '6.6 × 10⁻¹¹ m', feedback: 'Incorrect. This wavelength is too short for the calculated energy.' },
      { id: 'd', text: '4.0 × 10⁻⁴ m', feedback: 'Incorrect. This wavelength is much too long for X-ray production.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find the number of electrons: N = It/e = (5.0×10⁻⁶ × 4.2×10⁻⁶)/(1.6×10⁻¹⁹) = 1.31×10⁸. Average photon energy = Total energy/N = 1.07×10⁻¹⁹ J. Then λ = hc/E = 1.9×10⁻⁶ m.',
    difficulty: 'advanced',
    tags: ['electron-beam', 'current-calculation', 'average-wavelength', 'photon-statistics']
  },
  {
    questionText: "In any elastic collision, what two quantities are conserved?",
    options: [
      { id: 'a', text: 'Mass and charge', feedback: 'Incorrect. While these may be conserved, they are not the defining conservation laws for elastic collisions.' },
      { id: 'b', text: 'Kinetic energy and speed', feedback: 'Incorrect. Speed is not conserved in collisions, and while kinetic energy is conserved in elastic collisions, this is not the most fundamental pair.' },
      { id: 'c', text: 'Momentum and energy', feedback: 'Correct! In elastic collisions, both total momentum and total energy (including kinetic energy) are conserved. These are fundamental conservation laws.' },
      { id: 'd', text: 'Force and temperature', feedback: 'Incorrect. Neither force nor temperature are conserved quantities in collisions.' }
    ],
    correctOptionId: 'c',
    explanation: 'Elastic collisions are defined by the conservation of both momentum and energy. Total momentum is always conserved in isolated systems, and in elastic collisions, kinetic energy is also conserved (no energy lost to heat, sound, etc.).',
    difficulty: 'beginner',
    tags: ['elastic-collision', 'conservation-laws', 'momentum-conservation', 'energy-conservation']
  },
  {
    questionText: "How did Compton explain that photons have momentum if they have no mass?",
    options: [
      { id: 'a', text: 'He claimed they actually have mass', feedback: 'Incorrect. Compton did not claim photons have rest mass.' },
      { id: 'b', text: 'He used relativity to show that photons have momentum due to energy', feedback: 'Correct! Using Einstein\'s mass-energy relation E = mc² and p = mc for massless particles gives p = E/c, so photons carry momentum proportional to their energy.' },
      { id: 'c', text: 'He said photons push electrons using static force', feedback: 'Incorrect. This does not explain momentum transfer in a relativistic context.' },
      { id: 'd', text: 'He assumed photons steal momentum from electrons', feedback: 'Incorrect. This does not provide a fundamental explanation for photon momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'Compton used Einstein\'s relativity to show that even massless particles can have momentum. For photons, E = pc (since m = 0), so p = E/c = hf/c = h/λ. This explains how photons can transfer momentum despite having no rest mass.',
    difficulty: 'intermediate',
    tags: ['photon-momentum', 'special-relativity', 'mass-energy-relation', 'compton-theory']
  },
  {
    questionText: "What is the mass equivalent of a photon?",
    options: [
      { id: 'a', text: 'Zero mass, infinite momentum', feedback: 'Incorrect. Photons have zero rest mass and finite momentum.' },
      { id: 'b', text: 'Photons have mass only in motion', feedback: 'Incorrect. Photons always travel at the speed of light and have zero rest mass.' },
      { id: 'c', text: 'Photons have no rest mass', feedback: 'Correct! Photons have zero rest mass (m₀ = 0) but carry energy and momentum. They always travel at the speed of light.' },
      { id: 'd', text: 'Photons are massive in nuclei only', feedback: 'Incorrect. Photons are always massless regardless of their environment.' }
    ],
    correctOptionId: 'c',
    explanation: 'Photons are massless particles (rest mass = 0). They always travel at the speed of light and carry energy E = hf and momentum p = h/λ. Their energy gives them an effective "relativistic mass" E/c², but their rest mass is always zero.',
    difficulty: 'intermediate',
    tags: ['photon-mass', 'rest-mass', 'relativistic-mass', 'massless-particles']
  },
  {
    questionText: "Why does Compton scattering show that it is impossible to \"see\" an electron without disturbing it?",
    options: [
      { id: 'a', text: 'Electrons reflect photons perfectly', feedback: 'Incorrect. Electrons do not reflect photons perfectly; they scatter them with energy transfer.' },
      { id: 'b', text: 'The scattering proves electrons don\'t emit light', feedback: 'Incorrect. This does not address the disturbance caused by observation.' },
      { id: 'c', text: 'Photons transfer momentum when interacting with electrons, altering their path', feedback: 'Correct! To "see" an electron, photons must interact with it. This interaction transfers momentum and energy, inevitably changing the electron\'s motion.' },
      { id: 'd', text: 'Electrons are too small to interact with light', feedback: 'Incorrect. Electrons do interact with light, which is precisely what Compton scattering demonstrates.' }
    ],
    correctOptionId: 'c',
    explanation: 'Compton scattering demonstrates the quantum measurement problem: to observe an electron, photons must interact with it, and this interaction necessarily transfers momentum and energy, disturbing the electron\'s original state. This is a fundamental principle of quantum mechanics.',
    difficulty: 'advanced',
    tags: ['quantum-measurement', 'observer-effect', 'momentum-transfer', 'quantum-mechanics']
  },
  {
    questionText: "What is the momentum of a photon with a frequency of 9.65 × 10¹⁴ Hz?",
    options: [
      { id: 'a', text: '3.00 × 10⁻¹⁹ kg·m/s', feedback: 'Incorrect. This value does not match the calculation using p = hf/c.' },
      { id: 'b', text: '6.63 × 10⁻³⁴ kg·m/s', feedback: 'Incorrect. This appears to be Planck\'s constant value, not momentum.' },
      { id: 'c', text: '2.13 × 10⁻²⁷ kg·m/s', feedback: 'Correct! Using p = hf/c = (6.63×10⁻³⁴ × 9.65×10¹⁴)/(3×10⁸) = 2.13×10⁻²⁷ kg·m/s.' },
      { id: 'd', text: '9.11 × 10⁻³¹ kg·m/s', feedback: 'Incorrect. This appears to be the electron mass value, not photon momentum.' }
    ],
    correctOptionId: 'c',
    explanation: 'For a photon, momentum p = E/c = hf/c. Substituting the values: p = (6.63×10⁻³⁴ J·s × 9.65×10¹⁴ Hz)/(3×10⁸ m/s) = 2.13×10⁻²⁷ kg·m/s.',
    difficulty: 'intermediate',
    tags: ['photon-momentum-calculation', 'frequency-momentum-relation', 'de-broglie-relation', 'quantum-mechanics']
  },
  {
    questionText: "A photon has an energy of 225 keV. What is its momentum?",
    options: [
      { id: 'a', text: '2.00 × 10⁻²² kg·m/s', feedback: 'Incorrect. This value does not match the energy-momentum calculation.' },
      { id: 'b', text: '1.20 × 10⁻²² kg·m/s', feedback: 'Correct! E = 225 keV = 225×10³×1.6×10⁻¹⁹ = 3.6×10⁻¹⁴ J. Using p = E/c = (3.6×10⁻¹⁴)/(3×10⁸) = 1.20×10⁻²² kg·m/s.' },
      { id: 'c', text: '3.00 × 10⁻²¹ kg·m/s', feedback: 'Incorrect. This momentum is too large for the given energy.' },
      { id: 'd', text: '9.11 × 10⁻³¹ kg·m/s', feedback: 'Incorrect. This appears to be the electron mass value, not photon momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'First convert energy to Joules: E = 225 keV = 225×10³×1.6×10⁻¹⁹ J = 3.6×10⁻¹⁴ J. For a photon, p = E/c = (3.6×10⁻¹⁴ J)/(3×10⁸ m/s) = 1.20×10⁻²² kg·m/s.',
    difficulty: 'intermediate',
    tags: ['energy-momentum-relation', 'unit-conversion', 'keV-to-joules', 'photon-properties']
  },
  {
    questionText: "A photon with a wavelength of 2.00 × 10⁻¹¹ m collides with a stationary electron. The electron moves off at 2.90 × 10⁷ m/s. What is the wavelength and angle of the scattered photon?",
    options: [
      { id: 'a', text: '2.08 × 10⁻¹¹ m, 48.0°', feedback: 'Correct! Using conservation of energy and momentum in Compton scattering equations with the given initial wavelength and final electron speed.' },
      { id: 'b', text: '1.94 × 10⁻¹¹ m, 60.0°', feedback: 'Incorrect. These values do not satisfy the conservation laws for the given conditions.' },
      { id: 'c', text: '1.20 × 10⁻¹² m, 90.0°', feedback: 'Incorrect. The wavelength is too short and the angle does not match the momentum analysis.' },
      { id: 'd', text: '2.30 × 10⁻¹¹ m, 0.0°', feedback: 'Incorrect. A scattering angle of 0° would mean no collision occurred.' }
    ],
    correctOptionId: 'a',
    explanation: 'This requires solving the Compton scattering equations using conservation of energy and momentum. Given the initial photon wavelength and final electron speed, the scattered photon wavelength and angle can be calculated to be 2.08×10⁻¹¹ m and 48.0°.',
    difficulty: 'advanced',
    tags: ['compton-scattering', 'collision-analysis', 'conservation-laws', 'wavelength-shift']
  },
  {
    questionText: "A photon with a wavelength of 2.300 × 10⁻¹¹ m collides with a stationary electron. If the scattered photon has a frequency of 1.154 × 10¹⁹ Hz, what is the resulting speed of the electron?",
    options: [
      { id: 'a', text: '9.11 × 10⁻³¹ m/s', feedback: 'Incorrect. This appears to be the electron mass value, not a speed.' },
      { id: 'b', text: '1.20 × 10⁷ m/s', feedback: 'Incorrect. This speed is too low for the energy transfer calculated.' },
      { id: 'c', text: '4.68 × 10⁷ m/s', feedback: 'Correct! Using conservation of energy: Initial photon energy - Final photon energy = Electron kinetic energy. This gives the electron speed of 4.68×10⁷ m/s.' },
      { id: 'd', text: '3.00 × 10⁸ m/s', feedback: 'Incorrect. This is the speed of light, which no massive particle can reach.' }
    ],
    correctOptionId: 'c',
    explanation: 'Initial photon energy: E₁ = hc/λ = hc/(2.300×10⁻¹¹). Final photon energy: E₂ = hf = h(1.154×10¹⁹). The difference equals the electron\'s kinetic energy: ½mv² = E₁ - E₂. Solving gives v = 4.68×10⁷ m/s.',
    difficulty: 'advanced',
    tags: ['energy-conservation', 'electron-recoil', 'kinetic-energy-calculation', 'compton-effect']
  },
  {
    questionText: "An x-ray scatters from a stationary electron at an angle of 120°. What is the change in the wavelength of the x-ray?",
    options: [
      { id: 'a', text: '3.64 × 10⁻¹² m', feedback: 'Correct! Using the Compton wavelength shift formula: Δλ = (h/mₑc)(1 - cos θ) = (2.43×10⁻¹² m)(1 - cos 120°) = 3.64×10⁻¹² m.' },
      { id: 'b', text: '1.20 × 10⁻¹¹ m', feedback: 'Incorrect. This value is too large for the calculated wavelength shift.' },
      { id: 'c', text: '6.63 × 10⁻³⁴ m', feedback: 'Incorrect. This appears to be Planck\'s constant value, not a wavelength.' },
      { id: 'd', text: '9.45 × 10⁻¹⁷ m', feedback: 'Incorrect. This wavelength change is much too small.' }
    ],
    correctOptionId: 'a',
    explanation: 'The Compton wavelength shift is given by Δλ = (h/mₑc)(1 - cos θ), where h/mₑc = 2.43×10⁻¹² m is the Compton wavelength. For θ = 120°: Δλ = 2.43×10⁻¹² × (1 - cos 120°) = 2.43×10⁻¹² × 1.5 = 3.64×10⁻¹² m.',
    difficulty: 'intermediate',
    tags: ['compton-wavelength-shift', 'scattering-angle', 'compton-formula', 'wavelength-change']
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
  'course2_61_question1': {
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
  'course2_61_question2': {
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
  'course2_61_question3': {
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
  'course2_61_question4': {
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
  'course2_61_question5': {
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
  'course2_61_question6': {
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
  'course2_61_question7': {
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
  'course2_61_question8': {
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
  'course2_61_question9': {
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
  'course2_61_question10': {
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
  'course2_61_question11': {
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
  'course2_61_question12': {
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
  'course2_61_question13': {
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
  'course2_61_question14': {
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
  },
  'course2_61_question15': {
    type: 'multiple-choice',
    questions: [questionPool[14]],
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