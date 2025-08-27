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
    questionText: "What kind of particle was emitted by the radioactive source in Rutherford's experiment?",
    options: [
      { id: 'a', text: 'Beta particles', feedback: 'Incorrect. Beta particles are electrons or positrons, not what Rutherford used.' },
      { id: 'b', text: 'Gamma rays', feedback: 'Incorrect. Gamma rays are electromagnetic radiation, not particles with mass.' },
      { id: 'c', text: 'Alpha particles', feedback: 'Correct! Rutherford used alpha particles (helium nuclei) from a radioactive source.' },
      { id: 'd', text: 'Electrons', feedback: 'Incorrect. Electrons are too light and would not provide the penetrating power needed.' }
    ],
    correctOptionId: 'c',
    explanation: 'Rutherford used alpha particles (helium nuclei, 2 protons + 2 neutrons) because they are heavy, positively charged, and have enough energy to penetrate matter while being detectible.',
    difficulty: 'beginner',
    tags: ['rutherford-experiment', 'alpha-particles', 'radioactivity']
  },
  {
    questionText: "What was the target material used in Rutherford's scattering experiment?",
    options: [
      { id: 'a', text: 'Lead foil', feedback: 'Incorrect. Lead is too heavy and dense for this experiment.' },
      { id: 'b', text: 'Gold foil', feedback: 'Correct! Gold foil was used because it could be made extremely thin while remaining intact.' },
      { id: 'c', text: 'Zinc foil', feedback: 'Incorrect. Zinc was not used as the target material.' },
      { id: 'd', text: 'Aluminum foil', feedback: 'Incorrect. Aluminum was not used in Rutherford\'s original experiment.' }
    ],
    correctOptionId: 'b',
    explanation: 'Gold foil was chosen because gold is malleable and can be hammered into extremely thin sheets (only a few atoms thick) while maintaining structural integrity.',
    difficulty: 'beginner',
    tags: ['rutherford-experiment', 'gold-foil', 'experimental-setup']
  },
  {
    questionText: "Why was gold chosen for Rutherford's experiment?",
    options: [
      { id: 'a', text: 'It was magnetic', feedback: 'Incorrect. Gold is not magnetic (it\'s diamagnetic).' },
      { id: 'b', text: 'It emits alpha particles', feedback: 'Incorrect. Gold is not radioactive and doesn\'t emit alpha particles.' },
      { id: 'c', text: 'It\'s soft and can be made very thin', feedback: 'Correct! Gold\'s malleability allows it to be hammered into extremely thin foils.' },
      { id: 'd', text: 'It\'s radioactive', feedback: 'Incorrect. Gold is not naturally radioactive.' }
    ],
    correctOptionId: 'c',
    explanation: 'Gold was chosen because it is highly malleable and can be hammered into extremely thin foils (only a few atoms thick) without breaking, making it ideal for scattering experiments.',
    difficulty: 'intermediate',
    tags: ['gold-properties', 'experimental-design', 'material-selection']
  },
  {
    questionText: "What did most alpha particles do when fired at the gold foil?",
    options: [
      { id: 'a', text: 'Bounced off the surface', feedback: 'Incorrect. Very few alpha particles bounced back.' },
      { id: 'b', text: 'Deflected at large angles', feedback: 'Incorrect. Only a small fraction were deflected at large angles.' },
      { id: 'c', text: 'Passed straight through', feedback: 'Correct! Most alpha particles passed through the foil undeflected, showing atoms are mostly empty space.' },
      { id: 'd', text: 'Got absorbed by electrons', feedback: 'Incorrect. Electrons are too light to absorb alpha particles.' }
    ],
    correctOptionId: 'c',
    explanation: 'Most alpha particles passed straight through the gold foil without deflection, which was surprising and led to the conclusion that atoms are mostly empty space.',
    difficulty: 'intermediate',
    tags: ['alpha-particle-behavior', 'experimental-results', 'atomic-structure']
  },
  {
    questionText: "Why did Rutherford say that a head-on deflection of an alpha particle was so surprising?",
    options: [
      { id: 'a', text: 'Because it proved gold was unstable', feedback: 'Incorrect. The deflection didn\'t prove gold was unstable.' },
      { id: 'b', text: 'Because electrons should have absorbed the particle', feedback: 'Incorrect. Electrons are too light to absorb alpha particles.' },
      { id: 'c', text: 'Because the alpha particle should have passed through without deflection', feedback: 'Correct! According to the "plum pudding" model, there should be no concentrated positive charge to deflect alpha particles.' },
      { id: 'd', text: 'Because the gold nucleus was supposed to be negative', feedback: 'Incorrect. The nucleus is positively charged.' }
    ],
    correctOptionId: 'c',
    explanation: 'Rutherford was surprised because the prevailing "plum pudding" model predicted that positive charge was spread out, so alpha particles should pass through without significant deflection.',
    difficulty: 'intermediate',
    tags: ['plum-pudding-model', 'experimental-surprise', 'theoretical-prediction']
  },
  {
    questionText: "What was the role of the zinc sulfide screen in the experiment?",
    options: [
      { id: 'a', text: 'To deflect particles', feedback: 'Incorrect. The screen doesn\'t deflect particles.' },
      { id: 'b', text: 'To absorb radiation', feedback: 'Incorrect. The screen\'s purpose is detection, not absorption.' },
      { id: 'c', text: 'To accelerate the particles', feedback: 'Incorrect. The screen doesn\'t accelerate particles.' },
      { id: 'd', text: 'To detect the particles\' impacts by glowing', feedback: 'Correct! Zinc sulfide is a scintillator that glows when struck by alpha particles, allowing detection.' }
    ],
    correctOptionId: 'd',
    explanation: 'The zinc sulfide screen acts as a scintillator - it emits light when struck by alpha particles, allowing researchers to detect and count the particles at different angles.',
    difficulty: 'intermediate',
    tags: ['detection-method', 'scintillation', 'experimental-apparatus']
  },
  {
    questionText: "Why do most alpha particles pass through gold foil without deflection?",
    options: [
      { id: 'a', text: 'Because they are electrically neutral', feedback: 'Incorrect. Alpha particles are positively charged (2+ charge).' },
      { id: 'b', text: 'Because atoms are mostly empty space', feedback: 'Correct! The experiment showed that atoms are mostly empty space with a tiny, dense nucleus.' },
      { id: 'c', text: 'Because electrons repel them', feedback: 'Incorrect. Electrons would attract alpha particles, not repel them.' },
      { id: 'd', text: 'Because gold is a light metal', feedback: 'Incorrect. Gold is actually a heavy metal.' }
    ],
    correctOptionId: 'b',
    explanation: 'Most alpha particles pass through undeflected because atoms are mostly empty space. The nucleus occupies a tiny fraction of the atom\'s volume.',
    difficulty: 'intermediate',
    tags: ['atomic-structure', 'empty-space', 'nuclear-model']
  },
  {
    questionText: "Where are most of the atom's mass and all its positive charge concentrated, according to Rutherford?",
    options: [
      { id: 'a', text: 'In the electron cloud', feedback: 'Incorrect. Electrons have very little mass and are negatively charged.' },
      { id: 'b', text: 'Evenly throughout the atom', feedback: 'Incorrect. This describes the "plum pudding" model, which Rutherford disproved.' },
      { id: 'c', text: 'In the nucleus', feedback: 'Correct! Rutherford concluded that mass and positive charge are concentrated in a tiny, dense nucleus.' },
      { id: 'd', text: 'In orbitals', feedback: 'Incorrect. Orbitals contain electrons, not most of the mass or positive charge.' }
    ],
    correctOptionId: 'c',
    explanation: 'Rutherford\'s model places all positive charge and most of the atom\'s mass in a tiny, dense nucleus at the center of the atom.',
    difficulty: 'intermediate',
    tags: ['nuclear-model', 'mass-distribution', 'charge-distribution']
  },
  {
    questionText: "What did Rutherford conclude about the size of the nucleus relative to the atom?",
    options: [
      { id: 'a', text: 'The nucleus is about half the atom\'s size', feedback: 'Incorrect. The nucleus is much smaller than this.' },
      { id: 'b', text: 'The nucleus is slightly smaller than the electron cloud', feedback: 'Incorrect. The nucleus is much smaller than the electron cloud.' },
      { id: 'c', text: 'The nucleus is incredibly small compared to the atom', feedback: 'Correct! The nucleus is about 1/100,000th the size of the atom.' },
      { id: 'd', text: 'The nucleus and the atom are roughly equal in volume', feedback: 'Incorrect. The nucleus occupies a tiny fraction of the atom\'s volume.' }
    ],
    correctOptionId: 'c',
    explanation: 'Rutherford concluded that the nucleus is incredibly small compared to the atom - about 1/100,000th the diameter, meaning the atom is mostly empty space.',
    difficulty: 'intermediate',
    tags: ['nuclear-size', 'atomic-scale', 'proportions']
  },
  {
    questionText: "What was one major flaw in Rutherford's atomic model?",
    options: [
      { id: 'a', text: 'It didn\'t account for the neutron', feedback: 'Incorrect. While true, this wasn\'t the major theoretical flaw.' },
      { id: 'b', text: 'It couldn\'t explain why protons repel electrons', feedback: 'Incorrect. Protons attract electrons, not repel them.' },
      { id: 'c', text: 'It couldn\'t explain atomic mass', feedback: 'Incorrect. The model could explain atomic mass through the nucleus.' },
      { id: 'd', text: 'It predicted electrons would spiral into the nucleus due to radiating energy', feedback: 'Correct! According to classical physics, accelerating charges radiate energy, so orbiting electrons should spiral into the nucleus.' }
    ],
    correctOptionId: 'd',
    explanation: 'The major flaw was that according to classical electromagnetic theory, orbiting electrons should continuously radiate energy and spiral into the nucleus, making atoms unstable.',
    difficulty: 'advanced',
    tags: ['model-limitations', 'classical-physics', 'energy-radiation']
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
  'course2_51_question1': {
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
  'course2_51_question2': {
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
  'course2_51_question3': {
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
  'course2_51_question4': {
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
  'course2_51_question5': {
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
  'course2_51_question6': {
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
  'course2_51_question7': {
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
  'course2_51_question8': {
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
  'course2_51_question9': {
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
  'course2_51_question10': {
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