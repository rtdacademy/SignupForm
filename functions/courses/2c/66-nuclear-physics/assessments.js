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
    questionText: "When a proton strikes a sodium-20 nucleus, a daughter nucleus and an alpha particle are produced. What is the daughter nucleus?",
    options: [
      { id: 'a', text: 'Neon-18', feedback: 'Correct! The reaction is ²⁰Na + ¹H → ¹⁸Ne + ⁴He. Charge is conserved (11+1=10+2) and mass number is conserved (20+1=18+4).' },
      { id: 'b', text: 'Magnesium-23', feedback: 'Incorrect. This would not conserve charge or mass number in the reaction.' },
      { id: 'c', text: 'Fluorine-18', feedback: 'Incorrect. While the mass number is correct, the charge would not be conserved (11+1≠9+2).' },
      { id: 'd', text: 'Oxygen-16', feedback: 'Incorrect. Neither charge nor mass number would be conserved with this product.' }
    ],
    correctOptionId: 'a',
    explanation: 'In nuclear reactions, both charge (atomic number) and mass number must be conserved. Starting with Na-20 (Z=11, A=20) + proton (Z=1, A=1), we get total Z=12, A=21. With an alpha particle product (Z=2, A=4), the daughter must have Z=10, A=17, which is Neon-18.',
    difficulty: 'intermediate',
    tags: ['nuclear-reactions', 'conservation-laws', 'transmutation', 'alpha-particles']
  },
  {
    questionText: "What is the missing product in the following artificial transmutation? ¹H + ²⁷Al → ⁴He + ?",
    options: [
      { id: 'a', text: '²⁴Na', feedback: 'Incorrect. Sodium-24 would have Z=11, but conservation requires Z=12.' },
      { id: 'b', text: '³⁰P', feedback: 'Incorrect. This would not conserve mass number (1+27≠4+30).' },
      { id: 'c', text: '²⁴Mg', feedback: 'Correct! Conservation of charge: 1+13=2+12 ✓, Conservation of mass: 1+27=4+24 ✓' },
      { id: 'd', text: '²⁸Si', feedback: 'Incorrect. While charge is conserved (1+13=2+14), mass number is not (1+27≠4+28).' }
    ],
    correctOptionId: 'c',
    explanation: 'Using conservation laws: Charge conservation: 1+13 = 2+Z, so Z=12 (Magnesium). Mass conservation: 1+27 = 4+A, so A=24. The product is ²⁴Mg.',
    difficulty: 'intermediate',
    tags: ['artificial-transmutation', 'conservation-laws', 'nuclear-equations', 'aluminum-reactions']
  },
  {
    questionText: "Singly charged ions travel at 4.20×10⁵ m/s through a velocity selector with perpendicular fields. The magnetic field is 0.0400 T, and the plates are 1.50 cm apart. What is the required potential difference across the plates?",
    options: [
      { id: 'a', text: '63 V', feedback: 'Incorrect. This appears to use incorrect field relationships.' },
      { id: 'b', text: '105 V', feedback: 'Incorrect. Check the relationship between velocity, fields, and plate separation.' },
      { id: 'c', text: '252 V', feedback: 'Correct! For undeflected motion: v = E/B, so E = vB = (4.20×10⁵)(0.0400) = 16,800 V/m. With d = 0.0150 m: V = Ed = 252 V.' },
      { id: 'd', text: '320 V', feedback: 'Incorrect. This value is too large for the given parameters.' }
    ],
    correctOptionId: 'c',
    explanation: 'In a velocity selector, ions pass undeflected when qE = qvB, so v = E/B. Given v and B, we find E = vB = (4.20×10⁵ m/s)(0.0400 T) = 16,800 V/m. The potential difference is V = Ed = (16,800 V/m)(0.0150 m) = 252 V.',
    difficulty: 'intermediate',
    tags: ['velocity-selector', 'electric-field', 'magnetic-field', 'ion-motion']
  },
  {
    questionText: "Ions move in a circular path of radius 8.13 mm in a 0.250 T magnetic field. If they passed undeflected through a velocity selector with E = 7000 V/m, what is the mass of each ion?",
    options: [
      { id: 'a', text: '7.15×10⁻²⁷ kg', feedback: 'Incorrect. This mass is too small for the given parameters.' },
      { id: 'b', text: '1.16×10⁻²⁶ kg', feedback: 'Correct! From velocity selector: v = E/B = 7000/0.250 = 28,000 m/s. From circular motion: m = qBr/v = (1.60×10⁻¹⁹)(0.250)(0.00813)/28,000 = 1.16×10⁻²⁶ kg.' },
      { id: 'c', text: '5.94×10⁻²⁶ kg', feedback: 'Incorrect. This mass is too large; check the calculation steps.' },
      { id: 'd', text: '2.35×10⁻²⁵ kg', feedback: 'Incorrect. This is an order of magnitude too large.' }
    ],
    correctOptionId: 'b',
    explanation: 'From the velocity selector: v = E/B = 7000/0.250 = 28,000 m/s. For circular motion in a magnetic field: r = mv/(qB), so m = qBr/v = (1.60×10⁻¹⁹ C)(0.250 T)(0.00813 m)/(28,000 m/s) = 1.16×10⁻²⁶ kg.',
    difficulty: 'advanced',
    tags: ['mass-spectrometry', 'circular-motion', 'velocity-selector', 'ion-mass']
  },
  {
    questionText: "A singly charged carbon ion travels in a circular path with radius 11.3 cm in a 0.300 T magnetic field. The velocity selector has B = 0.300 T and E = 7.50×10⁴ V/m. What is the mass number of the isotope?",
    options: [
      { id: 'a', text: '12', feedback: 'Incorrect. Carbon-12 would have a different radius for these conditions.' },
      { id: 'b', text: '13', feedback: 'Correct! v = E/B = 7.50×10⁴/0.300 = 2.50×10⁵ m/s. m = qBr/v = (1.60×10⁻¹⁹)(0.300)(0.113)/(2.50×10⁵) = 2.17×10⁻²⁶ kg = 13.0 u.' },
      { id: 'c', text: '14', feedback: 'Incorrect. Carbon-14 would be too heavy and have a larger radius.' },
      { id: 'd', text: '15', feedback: 'Incorrect. This mass number is too large for carbon isotopes.' }
    ],
    correctOptionId: 'b',
    explanation: 'From velocity selector: v = E/B = 7.50×10⁴/0.300 = 2.50×10⁵ m/s. From circular motion: m = qBr/v = (1.60×10⁻¹⁹)(0.300)(0.113)/(2.50×10⁵) = 2.17×10⁻²⁶ kg. Converting: m = 2.17×10⁻²⁶/(1.66×10⁻²⁷) = 13.0 u, so this is Carbon-13.',
    difficulty: 'advanced',
    tags: ['isotope-identification', 'mass-spectrometry', 'carbon-isotopes', 'circular-motion']
  },
  {
    questionText: "The measured atomic mass of cobalt-59 is 58.9332 u. What is its mass defect in atomic mass units (u)?",
    options: [
      { id: 'a', text: '–0.3941 u', feedback: 'Incorrect. This value is too small for the mass defect.' },
      { id: 'b', text: '–0.5405 u', feedback: 'Correct! Co-59 has 27 protons and 32 neutrons. Expected mass = 27(1.00728) + 32(1.00867) = 59.4737 u. Mass defect = 58.9332 – 59.4737 = –0.5405 u.' },
      { id: 'c', text: '–1.0102 u', feedback: 'Incorrect. This mass defect is too large for cobalt-59.' },
      { id: 'd', text: '–0.7832 u', feedback: 'Incorrect. Check the calculation of protons and neutrons masses.' }
    ],
    correctOptionId: 'b',
    explanation: 'Cobalt-59 has 27 protons and 32 neutrons. Expected mass = 27(1.00728 u) + 32(1.00867 u) = 27.1966 + 32.2774 = 59.4737 u. Mass defect = actual – expected = 58.9332 – 59.4737 = –0.5405 u.',
    difficulty: 'intermediate',
    tags: ['mass-defect', 'nuclear-binding', 'cobalt-59', 'atomic-mass']
  },
  {
    questionText: "Chlorine-35 (75.77% abundance, 34.96885 u) and chlorine-37 (24.23% abundance, 36.96590 u) are naturally occurring isotopes. What is the average atomic mass of chlorine?",
    options: [
      { id: 'a', text: '35.21 u', feedback: 'Incorrect. This value is too low; check the weighted average calculation.' },
      { id: 'b', text: '35.63 u', feedback: 'Incorrect. This value is too high for the given abundances.' },
      { id: 'c', text: '35.45 u', feedback: 'Correct! Average = (0.7577)(34.96885) + (0.2423)(36.96590) = 26.496 + 8.957 = 35.453 u ≈ 35.45 u.' },
      { id: 'd', text: '35.87 u', feedback: 'Incorrect. This value is much too high for the weighted average.' }
    ],
    correctOptionId: 'c',
    explanation: 'Weighted average = (abundance₁ × mass₁) + (abundance₂ × mass₂) = (0.7577 × 34.96885) + (0.2423 × 36.96590) = 26.496 + 8.957 = 35.453 u ≈ 35.45 u.',
    difficulty: 'beginner',
    tags: ['isotope-abundance', 'weighted-average', 'chlorine-isotopes', 'atomic-mass']
  },
  {
    questionText: "What is the total binding energy of lithium-7 if its atomic mass is 7.0160 u?",
    options: [
      { id: 'a', text: '–22.45 MeV', feedback: 'Incorrect. This binding energy is too small for lithium-7.' },
      { id: 'b', text: '–37.82 MeV', feedback: 'Correct! Li-7 has 3 protons and 4 neutrons. Mass defect = 7.0160 – [3(1.00728) + 4(1.00867)] = –0.04051 u. BE = (0.04051)(931.5 MeV/u) = –37.82 MeV.' },
      { id: 'c', text: '–19.34 MeV', feedback: 'Incorrect. This value is too small; check the mass defect calculation.' },
      { id: 'd', text: '–42.08 MeV', feedback: 'Incorrect. This binding energy is too large for lithium-7.' }
    ],
    correctOptionId: 'b',
    explanation: 'Li-7 has 3 protons and 4 neutrons. Expected mass = 3(1.00728) + 4(1.00867) = 7.05652 u. Mass defect = 7.0160 – 7.05652 = –0.04052 u. Binding energy = (0.04052 u)(931.5 MeV/u) = –37.82 MeV.',
    difficulty: 'intermediate',
    tags: ['binding-energy', 'lithium-7', 'mass-defect', 'nuclear-stability']
  },
  {
    questionText: "Radium-226 has an atomic mass of 226.0254 u. What is its binding energy per nucleon?",
    imageUrl: "/courses/2/content/66-nuclear-physics/assets/q09_binding_curve.png",
    options: [
      { id: 'a', text: '–6.124 MeV/nucleon', feedback: 'Incorrect. This value is too small for a heavy nucleus like radium.' },
      { id: 'b', text: '–7.483 MeV/nucleon', feedback: 'Correct! Ra-226: 88 protons, 138 neutrons. Mass defect = –1.8651 u. BE = (1.8651)(931.5) = –1691 MeV. Per nucleon: –1691/226 = –7.483 MeV/nucleon.' },
      { id: 'c', text: '–8.203 MeV/nucleon', feedback: 'Incorrect. This is closer to iron-56, which has maximum binding energy per nucleon.' },
      { id: 'd', text: '–7.921 MeV/nucleon', feedback: 'Incorrect. This value is too large for radium-226.' }
    ],
    correctOptionId: 'b',
    explanation: 'Ra-226 has 88 protons and 138 neutrons. Expected mass = 88(1.00728) + 138(1.00867) = 227.8906 u. Mass defect = 226.0254 – 227.8906 = –1.8652 u. BE = (1.8652)(931.5 MeV/u) = –1738 MeV. Per nucleon: –1738/226 = –7.483 MeV/nucleon.',
    difficulty: 'advanced',
    tags: ['binding-energy-per-nucleon', 'radium-226', 'nuclear-stability', 'heavy-nuclei']
  },
  {
    questionText: "The Sun emits energy at a rate of 4.0×10²⁶ J/s. If this energy comes from mass conversion, what is the Sun's mass loss rate?",
    options: [
      { id: 'a', text: '1.1×10⁸ kg/s', feedback: 'Incorrect. This is an order of magnitude too small.' },
      { id: 'b', text: '4.4×10⁹ kg/s', feedback: 'Correct! Using E = mc²: m = E/c² = (4.0×10²⁶ J/s)/(3.0×10⁸ m/s)² = 4.4×10⁹ kg/s.' },
      { id: 'c', text: '9.8×10⁶ kg/s', feedback: 'Incorrect. This is much too small for the Sun\'s power output.' },
      { id: 'd', text: '5.6×10⁷ kg/s', feedback: 'Incorrect. This underestimates the mass-energy conversion rate.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using Einstein\'s mass-energy relation E = mc², we can find the mass loss rate: dm/dt = P/c² = (4.0×10²⁶ W)/(3.0×10⁸ m/s)² = (4.0×10²⁶)/(9.0×10¹⁶) = 4.4×10⁹ kg/s.',
    difficulty: 'intermediate',
    tags: ['mass-energy-equivalence', 'solar-fusion', 'einstein-equation', 'sun-physics']
  },
  {
    questionText: "If the Hiroshima bomb released 8.0×10¹³ J, and each uranium-235 atom released 3.2×10⁻⁸ J, how many atoms underwent fission?",
    options: [
      { id: 'a', text: '2.0×10²⁰', feedback: 'Incorrect. This is too few atoms for the given energy release.' },
      { id: 'b', text: '2.5×10²¹', feedback: 'Correct! Number of atoms = Total energy / Energy per atom = (8.0×10¹³ J)/(3.2×10⁻⁸ J) = 2.5×10²¹ atoms.' },
      { id: 'c', text: '4.0×10²²', feedback: 'Incorrect. This is an order of magnitude too large.' },
      { id: 'd', text: '1.5×10²¹', feedback: 'Incorrect. Check the division calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Number of fission events = Total energy released / Energy per fission = (8.0×10¹³ J)/(3.2×10⁻⁸ J/atom) = 2.5×10²¹ atoms.',
    difficulty: 'beginner',
    tags: ['nuclear-fission', 'atomic-bomb', 'energy-calculations', 'uranium-235']
  },
  {
    questionText: "If the Hiroshima bomb released 8.0×10¹³ J, what was the mass of uranium-235 converted to energy?",
    options: [
      { id: 'a', text: '0.89 g', feedback: 'Incorrect. This is too small for the given energy release.' },
      { id: 'b', text: '2.3 g', feedback: 'Incorrect. This is still too small; check the E = mc² calculation.' },
      { id: 'c', text: '8.9 g', feedback: 'Incorrect. This appears to use an error in the calculation.' },
      { id: 'd', text: '0.89 g', feedback: 'Correct! Using E = mc²: m = E/c² = (8.0×10¹³ J)/(3.0×10⁸ m/s)² = 8.9×10⁻⁴ kg = 0.89 g.' }
    ],
    correctOptionId: 'd',
    explanation: 'Using Einstein\'s equation E = mc²: m = E/c² = (8.0×10¹³ J)/(3.0×10⁸ m/s)² = (8.0×10¹³)/(9.0×10¹⁶) = 8.9×10⁻⁴ kg = 0.89 g.',
    difficulty: 'intermediate',
    tags: ['mass-energy-conversion', 'atomic-bomb', 'einstein-equation', 'fission-energy']
  },
  {
    questionText: "What is the energy released by the fission reaction: ²³⁵U + ¹n → ¹⁴⁰Xe + ⁹⁴Sr + 2¹n? Given masses: U-235 = 235.043925 u, n = 1.00867 u, Xe-140 = 139.92161 u, Sr-94 = 93.915367 u",
    imageUrl: "/courses/2/content/66-nuclear-physics/assets/q13_fission_diagram.png",
    options: [
      { id: 'a', text: '1.85×10⁻¹¹ J', feedback: 'Incorrect. This energy is too small for a fission reaction.' },
      { id: 'b', text: '2.96×10⁻¹¹ J', feedback: 'Correct! Mass defect = 235.043925 + 1.00867 – 139.92161 – 93.915367 – 2(1.00867) = 0.19821 u. E = (0.19821 u)(931.5 MeV/u)(1.60×10⁻¹³ J/MeV) = 2.96×10⁻¹¹ J.' },
      { id: 'c', text: '3.45×10⁻¹² J', feedback: 'Incorrect. This is an order of magnitude too small.' },
      { id: 'd', text: '4.72×10⁻¹² J', feedback: 'Incorrect. This underestimates the fission energy release.' }
    ],
    correctOptionId: 'b',
    explanation: 'Mass defect = reactants – products = (235.043925 + 1.00867) – (139.92161 + 93.915367 + 2×1.00867) = 0.19821 u. Energy = (0.19821 u)(931.5 MeV/u)(1.60×10⁻¹³ J/MeV) = 2.96×10⁻¹¹ J.',
    difficulty: 'advanced',
    tags: ['nuclear-fission', 'energy-calculation', 'uranium-235', 'mass-defect']
  },
  {
    questionText: "What is the energy released in the reaction: ³He + ³He → ⁴He + 2¹H? Given masses: He-3 = 3.01603 u, He-4 = 4.00260 u, H-1 = 1.00728 u",
    options: [
      { id: 'a', text: '2.23×10⁻¹² J', feedback: 'Correct! Mass defect = 2(3.01603) – 4.00260 – 2(1.00728) = 0.01498 u. E = (0.01498 u)(931.5 MeV/u)(1.60×10⁻¹³ J/MeV) = 2.23×10⁻¹² J.' },
      { id: 'b', text: '3.64×10⁻¹³ J', feedback: 'Incorrect. This is too small for a helium fusion reaction.' },
      { id: 'c', text: '1.76×10⁻¹¹ J', feedback: 'Incorrect. This overestimates the energy release.' },
      { id: 'd', text: '8.42×10⁻¹³ J', feedback: 'Incorrect. Check the mass defect calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Mass defect = reactants – products = 2(3.01603) – (4.00260 + 2×1.00728) = 6.03206 – 6.01716 = 0.01490 u. Energy = (0.01490 u)(931.5 MeV/u)(1.60×10⁻¹³ J/MeV) = 2.23×10⁻¹² J.',
    difficulty: 'advanced',
    tags: ['nuclear-fusion', 'helium-fusion', 'stellar-reactions', 'energy-calculation']
  },
  {
    questionText: "A nuclear power plant generates 3.0×10⁹ W of power. Over one year, what is the change in mass of the nuclear fuel?",
    options: [
      { id: 'a', text: '0.5 kg', feedback: 'Incorrect. This underestimates the mass conversion over a year.' },
      { id: 'b', text: '1.1 kg', feedback: 'Correct! Energy per year = Pt = (3.0×10⁹ W)(365×24×3600 s) = 9.46×10¹⁶ J. Mass = E/c² = 9.46×10¹⁶/(9×10¹⁶) = 1.05 kg ≈ 1.1 kg.' },
      { id: 'c', text: '2.6 kg', feedback: 'Incorrect. This overestimates the mass-energy conversion.' },
      { id: 'd', text: '4.9 kg', feedback: 'Incorrect. This is much too large for the given power output.' }
    ],
    correctOptionId: 'b',
    explanation: 'Energy per year = Power × time = (3.0×10⁹ W)(365 days × 24 hours × 3600 s) = 9.46×10¹⁶ J. Using E = mc²: m = E/c² = 9.46×10¹⁶/(3.0×10⁸)² = 1.05 kg ≈ 1.1 kg.',
    difficulty: 'intermediate',
    tags: ['nuclear-power', 'mass-energy-conversion', 'reactor-physics', 'annual-calculations']
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
  'course2_66_question1': {
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
  'course2_66_question2': {
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
  'course2_66_question3': {
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
  'course2_66_question4': {
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
  'course2_66_question5': {
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
  'course2_66_question6': {
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
  'course2_66_question7': {
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
  'course2_66_question8': {
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
  'course2_66_question9': {
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
  'course2_66_question10': {
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
  'course2_66_question11': {
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
  'course2_66_question12': {
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
  'course2_66_question13': {
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
  'course2_66_question14': {
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
  'course2_66_question15': {
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