
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
    questionText: "In the early 1900s, which three subatomic particles were believed to be the fundamental building blocks of matter, and which one is still considered fundamental today?",
    options: [
      { id: 'a', text: 'Proton, neutron, electron – only the electron is still fundamental', feedback: 'Correct! The electron is still considered a fundamental particle, while protons and neutrons are composed of quarks.' },
      { id: 'b', text: 'Proton, neutron, meson – only the neutron is still fundamental', feedback: 'Incorrect. Neutrons are composed of quarks and are not fundamental particles.' },
      { id: 'c', text: 'Electron, photon, proton – only the photon is still fundamental', feedback: 'Incorrect. While photons are fundamental, electrons are also fundamental particles.' },
      { id: 'd', text: 'Quark, electron, neutrino – all are still considered fundamental', feedback: 'Incorrect. Quarks were not known in the early 1900s.' }
    ],
    correctOptionId: 'a',
    explanation: 'In the early 1900s, protons, neutrons, and electrons were thought to be fundamental. Today, we know that only the electron remains fundamental, as protons and neutrons are composed of quarks.',
    difficulty: 'intermediate',
    tags: ['historical', 'fundamental-particles', 'quarks']
  },
  {
    questionText: "Why was the quark theory originally proposed?",
    options: [
      { id: 'a', text: 'To explain atomic orbitals using electromagnetic forces', feedback: 'Incorrect. Atomic orbitals are explained by quantum mechanics and electromagnetic forces.' },
      { id: 'b', text: 'To describe beta decay more accurately', feedback: 'Incorrect. Beta decay was explained by the weak nuclear force and neutrinos.' },
      { id: 'c', text: 'To explain the large number of hadrons observed in particle accelerators', feedback: 'Correct! The discovery of many hadrons in particle accelerators led to the need for a simpler organizational scheme, leading to quark theory.' },
      { id: 'd', text: 'To account for differences between electrons and neutrinos', feedback: 'Incorrect. These are both leptons and their differences were understood without quark theory.' }
    ],
    correctOptionId: 'c',
    explanation: 'Quark theory was proposed to explain the "zoo" of hadrons discovered in particle accelerators. The large number of particles suggested they were not all fundamental but composed of simpler constituents.',
    difficulty: 'intermediate',
    tags: ['historical', 'hadrons', 'particle-accelerators']
  },
  {
    questionText: "Which of the following is a key reason the Standard Model now includes six quarks instead of the three proposed by Gell-Mann and Zweig?",
    options: [
      { id: 'a', text: 'Each quark splits into two more quarks under high energy', feedback: 'Incorrect. Quarks do not split into more quarks under high energy.' },
      { id: 'b', text: 'Observations of new particles that could only be explained with additional quarks', feedback: 'Correct! The discovery of new particles required additional quark types to explain their properties and composition.' },
      { id: 'c', text: 'The discovery of gluons required more quark types', feedback: 'Incorrect. Gluons are force carriers and do not require additional quark types.' },
      { id: 'd', text: 'The proton was found to contain six quarks', feedback: 'Incorrect. A proton contains three quarks (uud).' }
    ],
    correctOptionId: 'b',
    explanation: 'New particles discovered in experiments could only be explained by introducing additional quark types beyond the original three, leading to the six-quark model.',
    difficulty: 'intermediate',
    tags: ['standard-model', 'quark-types', 'particle-discovery']
  },
  {
    questionText: "Which major difference distinguishes leptons from hadrons?",
    options: [
      { id: 'a', text: 'Leptons have mass, hadrons do not', feedback: 'Incorrect. Both leptons and hadrons can have mass.' },
      { id: 'b', text: 'Hadrons are involved in electromagnetic interactions, leptons are not', feedback: 'Incorrect. Both can participate in electromagnetic interactions if they are charged.' },
      { id: 'c', text: 'Leptons do not experience the strong nuclear force, but hadrons do', feedback: 'Correct! Leptons are not affected by the strong nuclear force, while hadrons are composed of quarks that experience the strong force.' },
      { id: 'd', text: 'Leptons are always charged, while hadrons are neutral', feedback: 'Incorrect. Some leptons (neutrinos) are neutral, and some hadrons (protons) are charged.' }
    ],
    correctOptionId: 'c',
    explanation: 'The key distinction is that leptons do not experience the strong nuclear force, while hadrons do because they are composed of quarks.',
    difficulty: 'intermediate',
    tags: ['leptons', 'hadrons', 'strong-force']
  },
  {
    questionText: "What differentiates mesons from baryons?",
    options: [
      { id: 'a', text: 'Mesons are composed of quark-antiquark pairs; baryons have three quarks', feedback: 'Correct! Mesons consist of a quark and an antiquark, while baryons are made of three quarks.' },
      { id: 'b', text: 'Mesons are heavier than baryons', feedback: 'Incorrect. Mass is not the distinguishing factor between mesons and baryons.' },
      { id: 'c', text: 'Baryons decay more quickly than mesons', feedback: 'Incorrect. Decay rates vary and are not the primary distinction.' },
      { id: 'd', text: 'Mesons are made of electrons and positrons', feedback: 'Incorrect. Mesons are made of quarks and antiquarks, not leptons.' }
    ],
    correctOptionId: 'a',
    explanation: 'Mesons are hadrons composed of one quark and one antiquark, while baryons are hadrons composed of three quarks.',
    difficulty: 'intermediate',
    tags: ['mesons', 'baryons', 'quark-composition']
  },
  {
    questionText: "How are fermions different from bosons?",
    options: [
      { id: 'a', text: 'Fermions are massless; bosons have mass', feedback: 'Incorrect. Both fermions and bosons can have mass.' },
      { id: 'b', text: 'Fermions obey the exclusion principle; bosons do not', feedback: 'Correct! Fermions obey the Pauli exclusion principle, while bosons do not and can occupy the same quantum state.' },
      { id: 'c', text: 'Fermions are all charged; bosons are neutral', feedback: 'Incorrect. Charge is not the distinguishing factor between fermions and bosons.' },
      { id: 'd', text: 'Fermions mediate forces; bosons make up matter', feedback: 'Incorrect. This is backwards - bosons typically mediate forces while fermions make up matter.' }
    ],
    correctOptionId: 'b',
    explanation: 'Fermions obey the Pauli exclusion principle (no two can occupy the same quantum state), while bosons do not have this restriction.',
    difficulty: 'intermediate',
    tags: ['fermions', 'bosons', 'exclusion-principle']
  },
  {
    questionText: "What experimental evidence suggests that protons contain smaller constituents?",
    options: [
      { id: 'a', text: 'Rutherford\'s gold foil experiment', feedback: 'Incorrect. This experiment revealed the nuclear structure of atoms, not the internal structure of protons.' },
      { id: 'b', text: 'Observations from cathode ray tubes', feedback: 'Incorrect. These experiments led to the discovery of electrons.' },
      { id: 'c', text: 'Deep inelastic scattering experiments with high-energy electrons', feedback: 'Correct! Deep inelastic scattering experiments at SLAC revealed that protons have internal structure, providing evidence for quarks.' },
      { id: 'd', text: 'Nuclear fission of uranium', feedback: 'Incorrect. Nuclear fission involves splitting atomic nuclei, not probing proton structure.' }
    ],
    correctOptionId: 'c',
    explanation: 'Deep inelastic scattering experiments with high-energy electrons at SLAC in the 1960s provided the first direct evidence that protons have internal structure.',
    difficulty: 'intermediate',
    tags: ['experimental-evidence', 'deep-inelastic-scattering', 'proton-structure']
  },
  {
    questionText: "Why are extremely high-energy particles needed to study nucleon structure?",
    options: [
      { id: 'a', text: 'They can overcome the gravitational attraction of nucleons', feedback: 'Incorrect. Gravity is negligible at the subatomic scale.' },
      { id: 'b', text: 'Only high-energy particles are charged', feedback: 'Incorrect. Particles of all energies can be charged or neutral.' },
      { id: 'c', text: 'The structure of nucleons is only visible under high pressure', feedback: 'Incorrect. Pressure is not the determining factor for resolving nucleon structure.' },
      { id: 'd', text: 'Shorter wavelengths are needed to resolve very small structures', feedback: 'Correct! Higher energy particles have shorter de Broglie wavelengths, allowing them to resolve smaller structures within nucleons.' }
    ],
    correctOptionId: 'd',
    explanation: 'According to de Broglie\'s relation, higher energy particles have shorter wavelengths, which are necessary to resolve the very small structures within nucleons.',
    difficulty: 'advanced',
    tags: ['de-broglie-wavelength', 'resolution', 'high-energy-physics']
  },
  {
    questionText: "Why is it likely impossible to observe an individual quark?",
    options: [
      { id: 'a', text: 'Quarks have no charge and are invisible to detectors', feedback: 'Incorrect. Quarks do have fractional electric charges.' },
      { id: 'b', text: 'Quarks always pair with leptons', feedback: 'Incorrect. Quarks do not pair with leptons.' },
      { id: 'c', text: 'The strong force increases with separation, confining quarks within particles', feedback: 'Correct! Color confinement means the strong force increases with distance, making it impossible to isolate individual quarks.' },
      { id: 'd', text: 'Quarks only exist in high-pressure plasmas', feedback: 'Incorrect. Quarks exist in normal hadrons under ordinary conditions.' }
    ],
    correctOptionId: 'c',
    explanation: 'Color confinement means that the strong force between quarks increases with distance, making it impossible to separate quarks and observe them individually.',
    difficulty: 'advanced',
    tags: ['color-confinement', 'strong-force', 'quark-isolation']
  },
  {
    questionText: "How does the quark composition of a neutron compare to that of a proton?",
    options: [
      { id: 'a', text: 'Neutron: uud; Proton: udd', feedback: 'Incorrect. You have the compositions reversed.' },
      { id: 'b', text: 'Neutron: udd; Proton: uud', feedback: 'Correct! A neutron is composed of one up and two down quarks (udd), while a proton has two up and one down quark (uud).' },
      { id: 'c', text: 'Neutron: sss; Proton: uus', feedback: 'Incorrect. Neither neutrons nor protons contain strange quarks in their basic composition.' },
      { id: 'd', text: 'Neutron: dds; Proton: ddu', feedback: 'Incorrect. This includes strange quarks which are not part of the basic nucleon composition.' }
    ],
    correctOptionId: 'b',
    explanation: 'A proton has two up quarks and one down quark (uud), while a neutron has one up quark and two down quarks (udd).',
    difficulty: 'intermediate',
    tags: ['nucleon-composition', 'up-quark', 'down-quark']
  },
  {
    questionText: "Which of the following correctly describes the quark composition of mesons?",
    options: [
      { id: 'a', text: 'Three quarks', feedback: 'Incorrect. Three quarks form baryons, not mesons.' },
      { id: 'b', text: 'Two quarks', feedback: 'Incorrect. While close, mesons specifically contain one quark and one antiquark.' },
      { id: 'c', text: 'One quark and one lepton', feedback: 'Incorrect. Mesons do not contain leptons.' },
      { id: 'd', text: 'One quark and one antiquark', feedback: 'Correct! Mesons are composed of one quark and one antiquark.' }
    ],
    correctOptionId: 'd',
    explanation: 'Mesons are hadrons composed of one quark and one antiquark, distinguishing them from baryons which have three quarks.',
    difficulty: 'intermediate',
    tags: ['meson-composition', 'quark-antiquark', 'hadrons']
  },
  {
    questionText: "Which of the following reactions best represents the beta decay of a neutron using quark theory?",
    options: [
      { id: 'a', text: 'u → d + W⁺', feedback: 'Incorrect. This would increase the positive charge, not decrease it.' },
      { id: 'b', text: 'd → u + W⁻', feedback: 'Correct! In beta decay, a down quark in the neutron converts to an up quark, emitting a W⁻ boson.' },
      { id: 'c', text: 's → u + W⁺', feedback: 'Incorrect. Strange quarks are not involved in neutron beta decay.' },
      { id: 'd', text: 'u → s + W⁻', feedback: 'Incorrect. This involves strange quarks which are not part of basic neutron decay.' }
    ],
    correctOptionId: 'b',
    explanation: 'In neutron beta decay, one of the down quarks converts to an up quark via the weak force, changing the neutron (udd) into a proton (uud).',
    difficulty: 'advanced',
    tags: ['beta-decay', 'weak-force', 'quark-transformation']
  },
  {
    questionText: "Is the following beta decay reaction possible: μ⁺ → e⁺ + νₑ + ν_μ̄ ?",
    options: [
      { id: 'a', text: 'Yes, charge and lepton numbers are conserved', feedback: 'Incorrect. While charge is conserved, lepton family number is violated.' },
      { id: 'b', text: 'No, total energy is not conserved', feedback: 'Incorrect. Energy conservation is not the issue here.' },
      { id: 'c', text: 'No, lepton family number is violated', feedback: 'Correct! This reaction violates lepton family number conservation - electron and muon lepton numbers must be conserved separately.' },
      { id: 'd', text: 'Yes, but only in vacuum', feedback: 'Incorrect. The environment does not affect lepton number conservation laws.' }
    ],
    correctOptionId: 'c',
    explanation: 'This reaction violates lepton family number conservation. Electron lepton number and muon lepton number must be conserved separately in particle interactions.',
    difficulty: 'advanced',
    tags: ['lepton-conservation', 'muon-decay', 'conservation-laws']
  },
  {
    questionText: "Why is it convenient to use units like MeV/c² for particle masses?",
    options: [
      { id: 'a', text: 'They simplify equations involving force', feedback: 'Incorrect. These units are primarily about mass-energy relationships, not force.' },
      { id: 'b', text: 'These are the base SI units for subatomic masses', feedback: 'Incorrect. MeV/c² is not a base SI unit.' },
      { id: 'c', text: 'Mass-energy equivalence makes it easier to calculate energy directly', feedback: 'Correct! Using MeV/c² allows direct calculation of rest energy (E = mc²) since the energy is simply the mass value in MeV.' },
      { id: 'd', text: 'Because the speed of light is different for each particle', feedback: 'Incorrect. The speed of light is a universal constant.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using MeV/c² for mass allows direct calculation of rest energy using E = mc², since the energy in MeV equals the mass value when c = 1.',
    difficulty: 'intermediate',
    tags: ['mass-energy-equivalence', 'units', 'relativity']
  },
  {
    questionText: "Which experiment provided strong evidence for the existence of quarks?",
    options: [
      { id: 'a', text: 'Double-slit experiment', feedback: 'Incorrect. This experiment demonstrates wave-particle duality, not quark structure.' },
      { id: 'b', text: 'Millikan oil drop experiment', feedback: 'Incorrect. This experiment measured the charge of an electron.' },
      { id: 'c', text: 'Deep inelastic electron scattering at SLAC', feedback: 'Correct! These experiments in the late 1960s provided the first strong evidence for point-like constituents within protons and neutrons.' },
      { id: 'd', text: 'Rutherford alpha particle scattering', feedback: 'Incorrect. This experiment revealed nuclear structure but not quark structure.' }
    ],
    correctOptionId: 'c',
    explanation: 'Deep inelastic electron scattering experiments at SLAC provided the first compelling evidence for quarks by revealing point-like structures within nucleons.',
    difficulty: 'intermediate',
    tags: ['experimental-evidence', 'SLAC', 'quark-discovery']
  },
  {
    questionText: "Why was the sixth quark hypothesized before it was discovered?",
    options: [
      { id: 'a', text: 'To balance the atomic mass in heavy nuclei', feedback: 'Incorrect. The sixth quark is not needed to explain atomic masses.' },
      { id: 'b', text: 'To explain anomalies in cosmic ray scattering', feedback: 'Incorrect. Cosmic ray anomalies did not drive the prediction of the sixth quark.' },
      { id: 'c', text: 'To maintain symmetry in the Standard Model', feedback: 'Correct! The sixth quark (top) was predicted to complete the symmetry between quarks and leptons in the Standard Model.' },
      { id: 'd', text: 'To account for the size of the electron', feedback: 'Incorrect. Electron properties do not require additional quarks.' }
    ],
    correctOptionId: 'c',
    explanation: 'The top quark was predicted to maintain the symmetry between the number of quarks and leptons in the Standard Model, with six of each type.',
    difficulty: 'advanced',
    tags: ['standard-model-symmetry', 'top-quark', 'theoretical-prediction']
  },
  {
    questionText: "What is the name of the sixth quark, and why did its discovery require a large accelerator?",
    options: [
      { id: 'a', text: 'Top quark; it has a very large mass requiring high energy collisions', feedback: 'Correct! The top quark is extremely massive (about 173 GeV/c²), requiring very high-energy collisions to create it.' },
      { id: 'b', text: 'Strange quark; it is very unstable and needs vacuum conditions', feedback: 'Incorrect. The strange quark was the third quark discovered, not the sixth.' },
      { id: 'c', text: 'Charm quark; it decays too quickly to detect', feedback: 'Incorrect. The charm quark was the fourth quark discovered, not the sixth.' },
      { id: 'd', text: 'Bottom quark; it only forms in neutron stars', feedback: 'Incorrect. The bottom quark was the fifth quark discovered, and it does not require neutron star conditions.' }
    ],
    correctOptionId: 'a',
    explanation: 'The top quark is the sixth and most massive quark, requiring extremely high-energy collisions (like those at the Tevatron) to produce it.',
    difficulty: 'advanced',
    tags: ['top-quark', 'mass', 'high-energy-physics']
  },
  {
    questionText: "What is the electric charge of a particle made of two up quarks and one strange quark (uus)?",
    options: [
      { id: 'a', text: '+1', feedback: 'Correct! Two up quarks (+2/3 each) and one strange quark (-1/3) give: 2/3 + 2/3 - 1/3 = +1.' },
      { id: 'b', text: '0', feedback: 'Incorrect. Check your calculation of the quark charges.' },
      { id: 'c', text: '+2', feedback: 'Incorrect. Remember that strange quarks have -1/3 charge, not +1/3.' },
      { id: 'd', text: '–1', feedback: 'Incorrect. You may have confused the sign of the strange quark charge.' }
    ],
    correctOptionId: 'a',
    explanation: 'Up quarks have +2/3 charge and strange quarks have -1/3 charge. So: (+2/3) + (+2/3) + (-1/3) = +4/3 - 1/3 = +3/3 = +1.',
    difficulty: 'intermediate',
    tags: ['quark-charges', 'calculations', 'charge-conservation']
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
  'course2_71_question1': {
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
  'course2_71_question2': {
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
  'course2_71_question3': {
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
  'course2_71_question4': {
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
  'course2_71_question5': {
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
  'course2_71_question6': {
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
  'course2_71_question7': {
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
  'course2_71_question8': {
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
  'course2_71_question9': {
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
  'course2_71_question10': {
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
  'course2_71_question11': {
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
  'course2_71_question12': {
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
  'course2_71_question13': {
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
  'course2_71_question14': {
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
  'course2_71_question15': {
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
  },
  'course2_71_question16': {
    type: 'multiple-choice',
    questions: [questionPool[15]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_71_question17': {
    type: 'multiple-choice',
    questions: [questionPool[16]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_71_question18': {
    type: 'multiple-choice',
    questions: [questionPool[17]],
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

