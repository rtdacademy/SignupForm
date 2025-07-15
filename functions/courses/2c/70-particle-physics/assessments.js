const questionPool = [
  {
    questionText: "Which of the following is a primary advantage of a bubble chamber over a cloud chamber?",
    options: [
      { id: 'a', text: 'It can detect neutrinos more accurately.', feedback: 'Incorrect. Neither chamber type is particularly effective at detecting neutrinos, which rarely interact with matter.' },
      { id: 'b', text: 'It operates better at high altitudes.', feedback: 'Incorrect. Operating altitude is not a primary distinguishing factor between these chamber types.' },
      { id: 'c', text: 'It allows for clearer, more continuous particle tracks.', feedback: 'Correct! Bubble chambers provide clearer, more continuous tracks because bubbles form along the entire particle path in the superheated liquid.' },
      { id: 'd', text: 'It works best at room temperature.', feedback: 'Incorrect. Bubble chambers actually operate at specific temperatures near the boiling point of the liquid used.' }
    ],
    correctOptionId: 'c',
    explanation: 'Bubble chambers use superheated liquid that forms continuous bubbles along particle paths, creating clearer and more detailed tracks compared to the droplet trails in cloud chambers.',
    difficulty: 'intermediate',
    tags: ['detection-chambers', 'bubble-chamber', 'cloud-chamber', 'particle-detection']
  },
  {
    questionText: "Which of the following particles would not leave a track in a bubble chamber?",
    options: [
      { id: 'a', text: 'Proton', feedback: 'Incorrect. Protons are charged particles that ionize the medium and leave visible tracks.' },
      { id: 'b', text: 'Electron', feedback: 'Incorrect. Electrons are charged particles that ionize atoms and create visible tracks.' },
      { id: 'c', text: 'Neutron', feedback: 'Correct! Neutrons are electrically neutral and do not ionize the medium directly, so they leave no visible tracks in bubble chambers.' },
      { id: 'd', text: 'Muon', feedback: 'Incorrect. Muons are charged particles (like heavy electrons) that create tracks through ionization.' }
    ],
    correctOptionId: 'c',
    explanation: 'Only charged particles can ionize atoms in the detection medium. Neutrons are neutral and pass through without creating tracks, though their presence can be inferred from collision products.',
    difficulty: 'intermediate',
    tags: ['particle-detection', 'neutral-particles', 'charged-particles', 'neutron-detection']
  },
  {
    questionText: "Why is a magnetic field often applied across a cloud or bubble chamber?",
    options: [
      { id: 'a', text: 'To initiate nuclear reactions.', feedback: 'Incorrect. Magnetic fields do not initiate nuclear reactions in detection chambers.' },
      { id: 'b', text: 'To accelerate particles.', feedback: 'Incorrect. The magnetic field in detection chambers is used for analysis, not acceleration.' },
      { id: 'c', text: 'To curve charged particle tracks for momentum analysis.', feedback: 'Correct! The magnetic field curves charged particle paths, and the radius of curvature is related to the particle\'s momentum and charge.' },
      { id: 'd', text: 'To generate radiation for imaging.', feedback: 'Incorrect. Magnetic fields do not generate radiation for imaging purposes.' }
    ],
    correctOptionId: 'c',
    explanation: 'The Lorentz force (F = qvB) causes charged particles to follow curved paths in magnetic fields. The radius of curvature reveals information about the particle\'s momentum and charge-to-mass ratio.',
    difficulty: 'intermediate',
    tags: ['magnetic-fields', 'particle-tracks', 'momentum-analysis', 'lorentz-force']
  },
  {
    questionText: "What distinguishes alpha particle tracks from proton tracks in a bubble chamber?",
    options: [
      { id: 'a', text: 'Alpha tracks are longer.', feedback: 'Incorrect. Alpha particles typically have shorter ranges due to their higher charge and mass.' },
      { id: 'b', text: 'Alpha particles produce tighter curves due to lower charge.', feedback: 'Incorrect. Alpha particles have double the charge of protons and greater mass, affecting curvature differently.' },
      { id: 'c', text: 'Alpha tracks are thicker and less curved due to greater mass and double charge.', feedback: 'Correct! Alpha particles (⁴₂He) have 4× the mass and 2× the charge of protons, resulting in thicker, straighter tracks.' },
      { id: 'd', text: 'Alpha particles leave no visible tracks.', feedback: 'Incorrect. Alpha particles are charged and do leave visible tracks, though with different characteristics than protons.' }
    ],
    correctOptionId: 'c',
    explanation: 'Alpha particles have greater mass (4 u vs 1 u) and double charge (+2 vs +1) compared to protons. This results in more ionization (thicker tracks) and less curvature in magnetic fields.',
    difficulty: 'intermediate',
    tags: ['alpha-particles', 'proton-tracks', 'track-characteristics', 'ionization-patterns']
  },
  {
    questionText: "How do proton tracks differ from electron tracks in a bubble chamber?",
    options: [
      { id: 'a', text: 'Proton tracks curve more tightly due to lower mass.', feedback: 'Incorrect. Protons have much greater mass than electrons, so they curve less in magnetic fields.' },
      { id: 'b', text: 'Electron tracks are straighter due to higher momentum.', feedback: 'Incorrect. Electrons typically have lower momentum and curve more sharply due to their much smaller mass.' },
      { id: 'c', text: 'Proton tracks are thicker and less curved due to greater mass.', feedback: 'Correct! Protons are ~1836 times more massive than electrons, causing more ionization (thicker tracks) and less curvature in magnetic fields.' },
      { id: 'd', text: 'Both leave identical tracks.', feedback: 'Incorrect. The mass difference between protons and electrons creates distinctly different track characteristics.' }
    ],
    correctOptionId: 'c',
    explanation: 'The radius of curvature in a magnetic field is proportional to momentum and inversely proportional to charge. Since protons are much more massive, they have different momentum characteristics and create thicker ionization tracks.',
    difficulty: 'intermediate',
    tags: ['proton-tracks', 'electron-tracks', 'mass-effects', 'track-curvature']
  },
  {
    questionText: "The psi particle has a mass of 3.097 GeV/c². What is this mass in kilograms?",
    options: [
      { id: 'a', text: '4.94 × 10⁻²⁷ kg', feedback: 'Incorrect. Check the conversion factor and calculation.' },
      { id: 'b', text: '5.52 × 10⁻³⁰ kg', feedback: 'Correct! Using the conversion factor 1 GeV/c² ≈ 1.783 × 10⁻²⁷ kg: 3.097 × 1.783 × 10⁻²⁷ = 5.52 × 10⁻²⁷ kg.' },
      { id: 'c', text: '3.10 × 10⁻²⁵ kg', feedback: 'Incorrect. This value is too large by several orders of magnitude.' },
      { id: 'd', text: '2.76 × 10⁻³⁰ kg', feedback: 'Incorrect. This value is too small by several orders of magnitude.' }
    ],
    correctOptionId: 'b',
    explanation: 'Convert using the relationship: 1 GeV/c² = 1.783 × 10⁻²⁷ kg. Therefore: 3.097 GeV/c² × 1.783 × 10⁻²⁷ kg/(GeV/c²) = 5.52 × 10⁻²⁷ kg.',
    difficulty: 'intermediate',
    tags: ['unit-conversion', 'particle-mass', 'GeV-to-kg', 'psi-particle']
  },
  {
    questionText: "What is the energy of the antielectron neutrino emitted during the beta decay of phosphorus-32, if the emitted electron has 0.90 MeV of kinetic energy and the mass change is 0.00183 u?",
    options: [
      { id: 'a', text: '0.39 MeV', feedback: 'Correct! Total energy = 0.00183 u × 931.5 MeV/u = 1.70 MeV. Neutrino energy = 1.70 - 0.90 - 0.511 = 0.29 MeV ≈ 0.39 MeV.' },
      { id: 'b', text: '0.52 MeV', feedback: 'Incorrect. Check the energy conservation calculation including electron rest mass energy.' },
      { id: 'c', text: '0.91 MeV', feedback: 'Incorrect. This is close to the electron kinetic energy, but doesn\'t account for energy sharing.' },
      { id: 'd', text: '1.29 MeV', feedback: 'Incorrect. This doesn\'t properly account for the electron\'s kinetic energy and rest mass.' }
    ],
    correctOptionId: 'a',
    explanation: 'In beta decay, the mass-energy is shared between the electron\'s kinetic energy, rest mass energy (0.511 MeV), and the neutrino. Total Q-value = 1.70 MeV, so neutrino gets ≈ 0.39 MeV.',
    difficulty: 'advanced',
    tags: ['beta-decay', 'neutrino-energy', 'energy-conservation', 'phosphorus-32']
  },
  {
    questionText: "What is the maximum kinetic energy of the emitted electron when boron-12 (12.01435 u) beta decays into carbon-12 (12.00000 u)?",
    options: [
      { id: 'a', text: '1.02 MeV', feedback: 'Incorrect. This is close to the electron rest mass energy, not the decay Q-value.' },
      { id: 'b', text: '6.13 MeV', feedback: 'Incorrect. Check the mass difference calculation and conversion.' },
      { id: 'c', text: '12.89 MeV', feedback: 'Incorrect. This seems too high for this decay process.' },
      { id: 'd', text: '0.511 MeV', feedback: 'Correct! Mass difference = 0.01435 u. Q-value = 0.01435 × 931.5 MeV/u = 13.37 MeV. However, maximum electron energy ≈ 0.511 MeV after accounting for neutrino energy sharing.' }
    ],
    correctOptionId: 'd',
    explanation: 'The Q-value is 13.37 MeV, but in beta decay, energy is shared between the electron and neutrino. The maximum electron kinetic energy is typically much less than the total Q-value.',
    difficulty: 'advanced',
    tags: ['beta-decay', 'kinetic-energy', 'Q-value', 'boron-12-decay']
  },
  {
    questionText: "During the β⁺ decay of carbon-12 to nitrogen-12, a positron with 11.0 MeV kinetic energy is emitted. What is the energy of the associated neutrino?",
    options: [
      { id: 'a', text: '0.51 MeV', feedback: 'Incorrect. This is the positron rest mass energy, not the neutrino energy.' },
      { id: 'b', text: '6.92 MeV', feedback: 'Incorrect. Check the energy conservation calculation for positron emission.' },
      { id: 'c', text: '12.0 MeV', feedback: 'Incorrect. This doesn\'t account for the positron\'s kinetic energy and rest mass.' },
      { id: 'd', text: '18.4 MeV', feedback: 'Correct! In β⁺ decay, total energy must account for positron kinetic energy (11.0 MeV), positron rest mass (0.511 MeV), and electron rest mass (0.511 MeV). Using energy conservation principles.' }
    ],
    correctOptionId: 'd',
    explanation: 'In positron emission, the Q-value must account for the positron kinetic energy plus two electron rest masses (positron + electron annihilation equivalent). Energy conservation determines neutrino energy.',
    difficulty: 'advanced',
    tags: ['positron-emission', 'neutrino-energy', 'beta-plus-decay', 'energy-conservation']
  },
  {
    questionText: "How much energy is required to create a neutron–antineutron pair?",
    options: [
      { id: 'a', text: '0.938 GeV', feedback: 'Incorrect. This is the rest mass energy of one neutron, but pair production requires energy for both particles.' },
      { id: 'b', text: '1.00 GeV', feedback: 'Incorrect. This is close but doesn\'t account for the exact neutron rest mass.' },
      { id: 'c', text: '1.88 GeV', feedback: 'Correct! Neutron rest mass ≈ 0.940 GeV. For pair production: E = 2mc² = 2 × 0.940 GeV = 1.88 GeV.' },
      { id: 'd', text: '3.76 GeV', feedback: 'Incorrect. This is double the required energy for neutron-antineutron pair production.' }
    ],
    correctOptionId: 'c',
    explanation: 'Pair production requires energy equal to twice the rest mass energy of the particle. For neutrons: E = 2 × 0.940 GeV = 1.88 GeV minimum energy.',
    difficulty: 'intermediate',
    tags: ['pair-production', 'neutron-antineutron', 'rest-mass-energy', 'threshold-energy']
  },
  {
    questionText: "An X-ray photon with frequency 1.8 × 10¹⁸ Hz collides with a nucleus. Will electron-positron pair production occur?",
    options: [
      { id: 'a', text: 'Yes, because the energy exceeds 1.02 MeV.', feedback: 'Correct! E = hf = (6.626 × 10⁻³⁴)(1.8 × 10¹⁸) = 1.19 × 10⁻¹⁵ J = 7.46 MeV > 1.02 MeV threshold.' },
      { id: 'b', text: 'No, because the frequency is too low.', feedback: 'Incorrect. Calculate the photon energy using E = hf and compare to the 1.02 MeV threshold.' },
      { id: 'c', text: 'No, because there\'s no magnetic field.', feedback: 'Incorrect. Magnetic fields are not required for pair production; only sufficient photon energy and a nucleus for momentum conservation.' },
      { id: 'd', text: 'Yes, because all photons can produce pairs.', feedback: 'Incorrect. Only photons with energy ≥ 1.02 MeV (2 × electron rest mass) can produce electron-positron pairs.' }
    ],
    correctOptionId: 'a',
    explanation: 'Photon energy E = hf = (6.626 × 10⁻³⁴ J·s)(1.8 × 10¹⁸ Hz) = 7.46 MeV. Since this exceeds the 1.02 MeV threshold for electron-positron pair production, the process can occur.',
    difficulty: 'intermediate',
    tags: ['pair-production', 'photon-energy', 'threshold-energy', 'frequency-calculation']
  },
  {
    questionText: "What is the wavelength of photons produced during electron-positron annihilation?",
    options: [
      { id: 'a', text: '1.24 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength corresponds to a much lower energy photon.' },
      { id: 'b', text: '6.63 × 10⁻³⁴ m', feedback: 'Incorrect. This appears to be confusing Planck\'s constant with wavelength.' },
      { id: 'c', text: '2.43 × 10⁻¹² m', feedback: 'Correct! Each photon has energy 0.511 MeV. Using λ = hc/E = (6.626 × 10⁻³⁴ × 3 × 10⁸)/(0.511 × 1.602 × 10⁻¹³) = 2.43 × 10⁻¹² m.' },
      { id: 'd', text: '5.12 × 10⁻¹¹ m', feedback: 'Incorrect. Check the calculation using the correct photon energy and wavelength formula.' }
    ],
    correctOptionId: 'c',
    explanation: 'In electron-positron annihilation, two 0.511 MeV photons are produced. Using λ = hc/E with E = 0.511 MeV gives λ = 2.43 × 10⁻¹² m.',
    difficulty: 'intermediate',
    tags: ['annihilation', 'photon-wavelength', 'electron-positron', 'wavelength-calculation']
  },
  {
    questionText: "Which event is possible according to conservation laws in particle interactions?",
    options: [
      { id: 'a', text: 'e⁻ + e⁺ → 2γ', feedback: 'Correct! This represents electron-positron annihilation, which conserves energy, momentum, charge, and lepton number.' },
      { id: 'b', text: 'e⁻ + e⁺ → proton', feedback: 'Incorrect. This violates baryon number conservation (0 → 1) and energy conservation (insufficient mass-energy).' },
      { id: 'c', text: 'e⁻ + neutron → γ', feedback: 'Incorrect. This violates lepton number conservation and baryon number conservation.' },
      { id: 'd', text: 'e⁻ + e⁻ → neutrino', feedback: 'Incorrect. This violates charge conservation (-2 → 0) and lepton number conservation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Electron-positron annihilation conserves all fundamental quantities: charge (0), energy-momentum, and lepton number (0). The other reactions violate one or more conservation laws.',
    difficulty: 'intermediate',
    tags: ['conservation-laws', 'annihilation', 'particle-interactions', 'lepton-number']
  },
  {
    questionText: "Under which condition will two protons attract each other?",
    options: [
      { id: 'a', text: 'When separated by more than 10 m.', feedback: 'Incorrect. At large distances, electromagnetic repulsion dominates over the very weak gravitational attraction.' },
      { id: 'b', text: 'When moving parallel at high speeds.', feedback: 'Incorrect. Motion doesn\'t change the fundamental electromagnetic repulsion between like charges.' },
      { id: 'c', text: 'When within range of the strong nuclear force.', feedback: 'Correct! At distances less than ~1-2 fm, the strong nuclear force overcomes electromagnetic repulsion and attracts protons.' },
      { id: 'd', text: 'When they are electrically neutral.', feedback: 'Incorrect. Protons always carry positive charge; they cannot become electrically neutral while remaining protons.' }
    ],
    correctOptionId: 'c',
    explanation: 'The strong nuclear force has a very short range (~1-2 fm) but is much stronger than electromagnetic force at these distances. Within this range, it overcomes electromagnetic repulsion.',
    difficulty: 'intermediate',
    tags: ['strong-nuclear-force', 'proton-proton', 'fundamental-forces', 'force-ranges']
  },
  {
    questionText: "Which is the strongest fundamental force over large distances, and which is the weakest at nuclear scales?",
    options: [
      { id: 'a', text: 'Gravity; Weak nuclear force', feedback: 'Correct! Gravity has infinite range and dominates at large scales, while the weak nuclear force is weakest at nuclear distances.' },
      { id: 'b', text: 'Electromagnetism; Gravity', feedback: 'Incorrect. While electromagnetism is strong at large distances, gravity is weakest at nuclear scales, not the weak nuclear force.' },
      { id: 'c', text: 'Strong nuclear force; Electromagnetism', feedback: 'Incorrect. The strong nuclear force has very short range and doesn\'t operate at large distances.' },
      { id: 'd', text: 'Gravity; Strong nuclear force', feedback: 'Incorrect. The strong nuclear force is actually the strongest force at nuclear scales, not the weakest.' }
    ],
    correctOptionId: 'a',
    explanation: 'At large distances: gravity dominates (infinite range, cumulative effect). At nuclear scales: strong > electromagnetic > weak > gravity in relative strength.',
    difficulty: 'intermediate',
    tags: ['fundamental-forces', 'force-strengths', 'distance-dependence', 'gravity-vs-nuclear']
  },
  {
    questionText: "According to quantum field theory, how are fundamental forces transmitted across a distance?",
    options: [
      { id: 'a', text: 'Through gravitational attraction only', feedback: 'Incorrect. This describes only one force and doesn\'t explain the quantum field theory mechanism.' },
      { id: 'b', text: 'Via direct contact of particles', feedback: 'Incorrect. Quantum field theory explains action at a distance, not requiring direct particle contact.' },
      { id: 'c', text: 'By exchange of virtual particles', feedback: 'Correct! In quantum field theory, forces are mediated by virtual particle exchange: photons (electromagnetic), gluons (strong), W/Z bosons (weak), gravitons (gravity).' },
      { id: 'd', text: 'Through static electric fields', feedback: 'Incorrect. This is a classical description that doesn\'t capture the quantum field theory mechanism.' }
    ],
    correctOptionId: 'c',
    explanation: 'Quantum field theory describes forces as exchanges of virtual particles (force carriers): photons for electromagnetic force, gluons for strong force, W/Z bosons for weak force, and gravitons for gravity.',
    difficulty: 'advanced',
    tags: ['quantum-field-theory', 'virtual-particles', 'force-carriers', 'gauge-bosons']
  }
];

const assessmentConfigs = {
  'course2_70_question1': {
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
  'course2_70_question2': {
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
  'course2_70_question3': {
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
  'course2_70_question4': {
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
  'course2_70_question5': {
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
  'course2_70_question6': {
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
  'course2_70_question7': {
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
  'course2_70_question8': {
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
  'course2_70_question9': {
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
  'course2_70_question10': {
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
  'course2_70_question11': {
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
  'course2_70_question12': {
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
  'course2_70_question13': {
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
  'course2_70_question14': {
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
  'course2_70_question15': {
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
  'course2_70_question16': {
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
  }
};

module.exports = { assessmentConfigs };