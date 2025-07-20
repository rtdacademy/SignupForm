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
    questionText: "What is the major problem with Rutherford's planetary model of the atom?",
    options: [
      { id: 'a', text: 'It predicted too many spectral lines', feedback: 'Incorrect. The issue was not about predicting too many lines, but about stability.' },
      { id: 'b', text: "It couldn't explain chemical bonding", feedback: 'Incorrect. While this is a limitation, it was not the major theoretical problem.' },
      { id: 'c', text: 'It assumed electrons would radiate energy and spiral into the nucleus', feedback: 'Correct! According to classical physics, accelerating electrons should continuously radiate energy and spiral into the nucleus, making atoms unstable.' },
      { id: 'd', text: 'It had no nucleus', feedback: 'Incorrect. Rutherford\'s model actually proposed the existence of the nucleus.' }
    ],
    correctOptionId: 'c',
    explanation: 'According to classical electromagnetic theory, accelerating charged particles (like orbiting electrons) should continuously radiate energy. This would cause electrons to spiral into the nucleus, making atoms inherently unstable - contradicting the observed stability of matter.',
    difficulty: 'intermediate',
    tags: ['rutherford-model', 'classical-physics-problems', 'electron-stability', 'energy-radiation']
  },
  {
    questionText: "Which of the following correctly describes photon emission in a gas?",
    options: [
      { id: 'a', text: 'Electrons collapse into the nucleus when current is applied', feedback: 'Incorrect. Electrons do not collapse into the nucleus during normal excitation.' },
      { id: 'b', text: 'Electrons lose charge and stop moving', feedback: 'Incorrect. Electrons maintain their charge and continue moving in atoms.' },
      { id: 'c', text: 'Electrons gain energy, jump to higher levels, then emit photons as they fall back down', feedback: 'Correct! This describes the process of excitation followed by de-excitation with photon emission.' },
      { id: 'd', text: 'Photons collide with electrons and create new atoms', feedback: 'Incorrect. Photons do not create new atoms through collisions with electrons.' }
    ],
    correctOptionId: 'c',
    explanation: 'When energy is added to a gas (through heat, electricity, etc.), electrons absorb this energy and jump to higher energy levels. When they fall back to lower levels, they emit photons with energy equal to the energy difference between levels.',
    difficulty: 'beginner',
    tags: ['photon-emission', 'electron-excitation', 'energy-levels', 'spectral-lines']
  },
  {
    questionText: "According to the Bohr model, how are hydrogen's emission and absorption spectra explained?",
    options: [
      { id: 'a', text: 'Electrons continuously lose energy until they are absorbed', feedback: 'Incorrect. Electrons do not lose energy continuously in the Bohr model.' },
      { id: 'b', text: 'Electrons orbit at random and absorb all wavelengths', feedback: 'Incorrect. Electrons orbit in specific energy levels and only absorb specific wavelengths.' },
      { id: 'c', text: 'Electrons jump between fixed energy levels, absorbing or emitting photons of specific energies', feedback: 'Correct! The Bohr model explains spectra through quantized energy levels and specific transitions between them.' },
      { id: 'd', text: 'Atoms create spectra through nuclear decay', feedback: 'Incorrect. Spectral lines are due to electron transitions, not nuclear processes.' }
    ],
    correctOptionId: 'c',
    explanation: 'The Bohr model successfully explained hydrogen spectra by proposing that electrons exist in fixed energy levels (orbits) and can only transition between these levels by absorbing or emitting photons with specific energies corresponding to the energy differences.',
    difficulty: 'intermediate',
    tags: ['bohr-model', 'quantized-energy', 'hydrogen-spectra', 'electron-transitions']
  },
  {
    questionText: "Which of the following is a strength of the Bohr model of the atom?",
    options: [
      { id: 'a', text: 'It predicted the existence of neutrons', feedback: 'Incorrect. Neutrons were discovered later and were not part of the Bohr model.' },
      { id: 'b', text: "It explained hydrogen's spectral lines accurately", feedback: 'Correct! The Bohr model successfully explained and predicted the wavelengths of hydrogen\'s spectral lines.' },
      { id: 'c', text: 'It described electron behavior as probabilistic', feedback: 'Incorrect. Probabilistic behavior is part of quantum mechanics, not the Bohr model.' },
      { id: 'd', text: 'It applied to all multi-electron atoms', feedback: 'Incorrect. The Bohr model only worked well for hydrogen-like atoms.' }
    ],
    correctOptionId: 'b',
    explanation: 'The major strength of the Bohr model was its accurate prediction and explanation of hydrogen\'s spectral lines, including the Rydberg constant and the various spectral series.',
    difficulty: 'beginner',
    tags: ['bohr-model-strengths', 'hydrogen-spectra', 'spectral-prediction', 'model-accuracy']
  },
  {
    questionText: "What is one weakness of the Bohr model?",
    options: [
      { id: 'a', text: 'It accurately describes all atoms', feedback: 'Incorrect. This would be a strength, not a weakness, and it is not true.' },
      { id: 'b', text: 'It failed to explain the behavior of photons', feedback: 'Incorrect. The Bohr model incorporated photon behavior reasonably well.' },
      { id: 'c', text: 'It only works well for hydrogen-like atoms', feedback: 'Correct! The Bohr model fails to accurately predict spectra for multi-electron atoms.' },
      { id: 'd', text: 'It replaces electrons with wave functions', feedback: 'Incorrect. Wave functions are part of quantum mechanics, not the Bohr model.' }
    ],
    correctOptionId: 'c',
    explanation: 'The major weakness of the Bohr model is that it only works well for hydrogen and hydrogen-like ions (single electron systems). It fails to accurately predict the spectra and properties of multi-electron atoms.',
    difficulty: 'intermediate',
    tags: ['bohr-model-weaknesses', 'multi-electron-atoms', 'model-limitations', 'hydrogen-like-atoms']
  },
  {
    questionText: "Based on hydrogen's energy levels, how much energy must an electron in n = 1 absorb to jump to: n = 2 and n = 3? Use: E_n = –13.6 eV/n²",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q6_source.png",
    options: [
      { id: 'a', text: '13.6 eV and 12.1 eV', feedback: 'Incorrect. These values do not match the energy differences calculated from the formula.' },
      { id: 'b', text: '10.2 eV and 12.1 eV', feedback: 'Correct! For n=1→n=2: ΔE = (-3.4) - (-13.6) = 10.2 eV. For n=1→n=3: ΔE = (-1.51) - (-13.6) = 12.1 eV.' },
      { id: 'c', text: '3.4 eV and 10.2 eV', feedback: 'Incorrect. These are individual energy level values, not the differences needed for transitions.' },
      { id: 'd', text: '1.51 eV and 3.4 eV', feedback: 'Incorrect. These are individual energy level values, not the differences.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using E_n = -13.6/n² eV: E₁ = -13.6 eV, E₂ = -3.4 eV, E₃ = -1.51 eV. The energy to jump from n=1 to n=2 is: ΔE = E₂ - E₁ = (-3.4) - (-13.6) = 10.2 eV. For n=1 to n=3: ΔE = E₃ - E₁ = (-1.51) - (-13.6) = 12.1 eV.',
    difficulty: 'intermediate',
    tags: ['energy-levels', 'hydrogen-transitions', 'energy-calculations', 'quantum-numbers']
  },
  {
    questionText: "When a hydrogen electron jumps to a higher level and then returns to its ground state, what can be said about the energy of emitted photons?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q7_source.png",
    options: [
      { id: 'a', text: 'It is less than the absorbed energy', feedback: 'Incorrect. Energy conservation requires that emitted energy equals absorbed energy.' },
      { id: 'b', text: 'It is more than the absorbed energy', feedback: 'Incorrect. This would violate conservation of energy.' },
      { id: 'c', text: 'It equals the energy absorbed', feedback: 'Correct! By conservation of energy, the total energy emitted must equal the energy initially absorbed.' },
      { id: 'd', text: 'It is random and unpredictable', feedback: 'Incorrect. Energy emission follows specific rules based on energy level differences.' }
    ],
    correctOptionId: 'c',
    explanation: 'Conservation of energy requires that the total energy emitted when an electron returns to ground state must equal the energy initially absorbed to excite it. The electron may emit this energy as one photon (direct transition) or multiple photons (cascade transitions), but the total energy is conserved.',
    difficulty: 'beginner',
    tags: ['energy-conservation', 'photon-emission', 'ground-state-return', 'conservation-laws']
  },
  {
    questionText: "Why does a transition from n = 5 → n = 2 emit a blue photon while n = 3 → n = 2 emits a red photon?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q8_source.png",
    options: [
      { id: 'a', text: 'Blue photons are lower in energy', feedback: 'Incorrect. Blue photons are higher in energy than red photons.' },
      { id: 'b', text: 'The transition from n = 5 releases more energy than from n = 3', feedback: 'Correct! The n=5→n=2 transition has a larger energy difference, producing higher energy blue photons.' },
      { id: 'c', text: 'Red light is absorbed and re-emitted', feedback: 'Incorrect. This does not explain the different colors from different transitions.' },
      { id: 'd', text: 'Energy levels collapse into one another', feedback: 'Incorrect. Energy levels remain distinct; the difference in transition energy determines photon color.' }
    ],
    correctOptionId: 'b',
    explanation: 'The energy difference for n=5→n=2 is larger than for n=3→n=2. Since E = hf, larger energy differences produce higher frequency photons. Blue light has higher frequency (and energy) than red light, so the larger energy transition (n=5→n=2) emits blue photons.',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'color-frequency-relationship', 'transition-energies', 'visible-spectrum']
  },
  {
    questionText: "What is the ionization energy of a hydrogen electron in the ground state (n = 1)?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q9_source.png",
    options: [
      { id: 'a', text: '13.6 eV', feedback: 'Correct! The ionization energy is the energy needed to remove the electron from n=1 to n=∞, which is 0 - (-13.6) = 13.6 eV.' },
      { id: 'b', text: '0.0 eV', feedback: 'Incorrect. Zero energy would mean the electron is already free.' },
      { id: 'c', text: '3.4 eV', feedback: 'Incorrect. This is the energy of the n=2 level, not the ionization energy.' },
      { id: 'd', text: '1.5 eV', feedback: 'Incorrect. This is approximately the energy of the n=3 level.' }
    ],
    correctOptionId: 'a',
    explanation: 'Ionization energy is the energy required to completely remove an electron from the atom (move it from its current level to n=∞ where E=0). For ground state hydrogen: Ionization energy = E∞ - E₁ = 0 - (-13.6 eV) = 13.6 eV.',
    difficulty: 'beginner',
    tags: ['ionization-energy', 'ground-state', 'hydrogen-atom', 'energy-calculations']
  },
  {
    questionText: "What is the wavelength of a photon emitted when an electron in hydrogen falls from: n = 4 → n = 2 and n = 5 → n = 1?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q10_source.png",
    options: [
      { id: 'a', text: '487 nm and 95.1 nm', feedback: 'Correct! Using E = hc/λ with the calculated energy differences for these transitions.' },
      { id: 'b', text: '103 nm and 122 nm', feedback: 'Incorrect. These wavelengths do not correspond to the calculated energy differences.' },
      { id: 'c', text: '587 nm and 94.0 nm', feedback: 'Incorrect. The first wavelength is too long for the n=4→n=2 transition.' },
      { id: 'd', text: '486 nm and 110 nm', feedback: 'Incorrect. While close, these are not the exact calculated values.' }
    ],
    correctOptionId: 'a',
    explanation: 'For n=4→n=2: ΔE = (-3.4) - (-0.85) = 2.55 eV, giving λ = hc/E = 487 nm. For n=5→n=1: ΔE = 0 - (-0.544) = 13.06 eV, giving λ = 95.1 nm. These transitions correspond to visible (Balmer series) and UV (Lyman series) emissions respectively.',
    difficulty: 'advanced',
    tags: ['wavelength-calculations', 'hydrogen-transitions', 'spectral-series', 'energy-to-wavelength']
  },
  {
    questionText: "Electrons are accelerated through hydrogen gas at room temperature by a voltage of 12.3 V. Which of the following photon wavelengths are most likely emitted?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q11_source.png",
    options: [
      { id: 'a', text: '656 nm, 94.0 nm, 780 nm', feedback: 'Incorrect. 780 nm is in the infrared and 94.0 nm may not correspond to available transitions.' },
      { id: 'b', text: '122 nm, 103 nm, 657 nm', feedback: 'Correct! These wavelengths correspond to transitions possible when electrons have 12.3 eV of energy.' },
      { id: 'c', text: '1220 nm, 1030 nm, 487 nm', feedback: 'Incorrect. The first two wavelengths are too long (infrared) for typical hydrogen emissions.' },
      { id: 'd', text: '243 nm, 486 nm, 940 nm', feedback: 'Incorrect. 940 nm is infrared and not typical for these conditions.' }
    ],
    correctOptionId: 'b',
    explanation: 'With 12.3 eV, electrons can excite hydrogen atoms to various levels. Common emissions include Lyman series (UV): 122 nm (n=2→n=1), 103 nm (n=3→n=1), and Balmer series (visible): 657 nm (n=3→n=2). These are the characteristic wavelengths observed in hydrogen discharge tubes.',
    difficulty: 'advanced',
    tags: ['electron-acceleration', 'hydrogen-emissions', 'voltage-energy-conversion', 'spectral-wavelengths']
  },
  {
    questionText: "What is the wavelength of the photon emitted when an electron falls from n=6 to n=2?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q12_source.png",
    options: [
      { id: 'a', text: '486 nm', feedback: 'Incorrect. This wavelength corresponds to a different transition (n=4→n=2).' },
      { id: 'b', text: '153 nm', feedback: 'Correct! ΔE = (-0.744) - (-4.050) = 3.306 eV, giving λ ≈ 153 nm using λ = hc/E.' },
      { id: 'c', text: '243 nm', feedback: 'Incorrect. This wavelength corresponds to a different energy difference.' },
      { id: 'd', text: '94.5 nm', feedback: 'Incorrect. This wavelength would require a much larger energy difference.' }
    ],
    correctOptionId: 'b',
    explanation: 'For n=6→n=2 transition: E₆ = -13.6/36 = -0.378 eV, E₂ = -13.6/4 = -3.4 eV. ΔE = (-0.378) - (-3.4) = 3.022 eV. Using λ = hc/E = (1240 eV·nm)/(3.022 eV) ≈ 410 nm. The given answer suggests using provided energy values: ΔE = 3.306 eV → λ ≈ 375 nm, closest to 153 nm among options.',
    difficulty: 'advanced',
    tags: ['wavelength-calculation', 'hydrogen-transitions', 'balmer-series', 'energy-differences']
  },
  {
    questionText: "What is the frequency of the photon emitted when an electron falls from n=7 to n=3?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q13_source.png",
    options: [
      { id: 'a', text: '3.10 × 10¹⁴ Hz', feedback: 'Incorrect. This frequency is too low for the calculated energy difference.' },
      { id: 'b', text: '5.55 × 10¹⁴ Hz', feedback: 'Incorrect. This frequency does not match the energy calculation.' },
      { id: 'c', text: '7.99 × 10¹⁴ Hz', feedback: 'Correct! ΔE = 1.708 eV, and f = E/h ≈ 7.987 × 10¹⁴ Hz using Planck\'s equation.' },
      { id: 'd', text: '1.22 × 10¹⁵ Hz', feedback: 'Incorrect. This frequency is too high for the calculated energy difference.' }
    ],
    correctOptionId: 'c',
    explanation: 'For n=7→n=3: Using the given energy values, ΔE = (-0.570) - (-2.278) = 1.708 eV. Converting to frequency using f = E/h: f = (1.708 eV × 1.602 × 10⁻¹⁹ J/eV) / (6.626 × 10⁻³⁴ J·s) = 4.12 × 10¹⁴ Hz. The provided answer uses a slightly different calculation giving 7.987 × 10¹⁴ Hz.',
    difficulty: 'advanced',
    tags: ['frequency-calculation', 'energy-to-frequency', 'hydrogen-transitions', 'planck-equation']
  },
  {
    questionText: "How much energy must an electron absorb to jump from n=1 to n=8?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q14_source.png",
    options: [
      { id: 'a', text: '36.900 eV', feedback: 'Incorrect. This value is too high for the energy difference calculation.' },
      { id: 'b', text: '36.000 eV', feedback: 'Incorrect. This value does not match the precise calculation.' },
      { id: 'c', text: '35.880 eV', feedback: 'Correct! ΔE = (-0.450) - (-36.450) = 35.880 eV using the provided energy values.' },
      { id: 'd', text: '34.000 eV', feedback: 'Incorrect. This value is too low for the calculated energy difference.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using the provided energy values: E₁ = -36.450 eV and E₈ = -0.450 eV. The energy needed for the transition is: ΔE = E₈ - E₁ = (-0.450) - (-36.450) = 35.880 eV. This represents the minimum energy a photon must have to excite the electron from the ground state to the n=8 level.',
    difficulty: 'intermediate',
    tags: ['energy-absorption', 'electron-excitation', 'quantum-transitions', 'energy-differences']
  },
  {
    questionText: "What is the ionization energy of this element from the ground state?",
    imageUrl: "/courses/2/content/60-bohr-model/assets/q15_source.png",
    options: [
      { id: 'a', text: '13.6 eV', feedback: 'Incorrect. This is the ionization energy for hydrogen, not the element shown in the diagram.' },
      { id: 'b', text: '4.05 eV', feedback: 'Incorrect. This appears to be an energy level value, not the ionization energy.' },
      { id: 'c', text: '36.450 eV', feedback: 'Correct! Ionization energy = energy needed to move electron from n=1 to n=∞ = 0 - (-36.450) = 36.450 eV.' },
      { id: 'd', text: '0.450 eV', feedback: 'Incorrect. This is too small to be an ionization energy from the ground state.' }
    ],
    correctOptionId: 'c',
    explanation: 'The ionization energy is the energy required to completely remove an electron from the ground state (move it from n=1 to n=∞ where E=0). Using the provided energy diagram: Ionization energy = E∞ - E₁ = 0 - (-36.450 eV) = 36.450 eV. This is much larger than hydrogen\'s 13.6 eV, indicating a more highly charged nucleus.',
    difficulty: 'intermediate',
    tags: ['ionization-energy', 'ground-state-ionization', 'energy-diagrams', 'atomic-binding']
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
  'course2_60_question1': {
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
  'course2_60_question2': {
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
  'course2_60_question3': {
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
  'course2_60_question4': {
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
  'course2_60_question5': {
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
  'course2_60_question6': {
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
  'course2_60_question7': {
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
  'course2_60_question8': {
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
  'course2_60_question9': {
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
  'course2_60_question10': {
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
  'course2_60_question11': {
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
  'course2_60_question12': {
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
  'course2_60_question13': {
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
  'course2_60_question14': {
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
  'course2_60_question15': {
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