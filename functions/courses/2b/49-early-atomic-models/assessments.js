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
    questionText: "What were the four classical elements according to Aristotle's theory of matter?",
    options: [
      { id: 'a', text: 'Earth, metal, water, fire', feedback: 'Incorrect. Metal was not one of the four classical elements.' },
      { id: 'b', text: 'Earth, air, water, fire', feedback: 'Correct! Aristotle believed all matter was composed of these four fundamental elements.' },
      { id: 'c', text: 'Hydrogen, oxygen, carbon, nitrogen', feedback: 'Incorrect. These are modern chemical elements, not classical elements.' },
      { id: 'd', text: 'Ether, flame, wind, ice', feedback: 'Incorrect. These were not the four classical elements according to Aristotle.' }
    ],
    correctOptionId: 'b',
    explanation: 'Aristotle\'s theory of matter was based on four classical elements: earth, air, water, and fire. He believed all matter was composed of combinations of these elements.',
    difficulty: 'beginner',
    tags: ['aristotle', 'classical-elements', 'ancient-theories']
  },
  {
    questionText: "What was the philosopher's stone believed to do in alchemy?",
    options: [
      { id: 'a', text: 'Turn metals into liquids', feedback: 'Incorrect. The philosopher\'s stone was not about changing physical states.' },
      { id: 'b', text: 'Control gravity', feedback: 'Incorrect. Gravity was not a concept alchemists worked with.' },
      { id: 'c', text: 'Transmute materials into gold', feedback: 'Correct! The philosopher\'s stone was believed to transform base metals into gold.' },
      { id: 'd', text: 'Act as a power source for machines', feedback: 'Incorrect. Alchemists were not focused on mechanical power sources.' }
    ],
    correctOptionId: 'c',
    explanation: 'The philosopher\'s stone was the ultimate goal of alchemy - a substance that could transmute base metals into gold and grant eternal life.',
    difficulty: 'intermediate',
    tags: ['alchemy', 'philosophers-stone', 'transmutation']
  },
  {
    questionText: "Which scientist is considered the father of chemistry for formulating the postulates of chemical philosophy?",
    options: [
      { id: 'a', text: 'Dmitri Mendeleev', feedback: 'Incorrect. Mendeleev created the periodic table but came later.' },
      { id: 'b', text: 'Julius Meyer', feedback: 'Incorrect. Meyer worked on atomic masses but was not the father of chemistry.' },
      { id: 'c', text: 'John Dalton', feedback: 'Correct! Dalton formulated the atomic theory and postulates of chemical philosophy.' },
      { id: 'd', text: 'Antoine Lavoisier', feedback: 'Incorrect. Lavoisier was important but Dalton is considered the father of chemistry.' }
    ],
    correctOptionId: 'c',
    explanation: 'John Dalton is considered the father of chemistry because he formulated the atomic theory and postulates that form the foundation of modern chemistry.',
    difficulty: 'intermediate',
    tags: ['dalton', 'atomic-theory', 'chemistry-history']
  },
  {
    questionText: "According to Dalton, how are atoms of different elements distinguished?",
    options: [
      { id: 'a', text: 'By their energy levels', feedback: 'Incorrect. Energy levels were not part of Dalton\'s atomic theory.' },
      { id: 'b', text: 'By their radioactive properties', feedback: 'Incorrect. Radioactivity was not discovered until much later.' },
      { id: 'c', text: 'By their size and mass', feedback: 'Correct! Dalton believed atoms of different elements had different sizes and masses.' },
      { id: 'd', text: 'By their shape and color', feedback: 'Incorrect. Shape and color were not part of Dalton\'s atomic theory.' }
    ],
    correctOptionId: 'c',
    explanation: 'Dalton\'s atomic theory stated that atoms of different elements are distinguished by their different sizes and masses.',
    difficulty: 'intermediate',
    tags: ['dalton', 'atomic-theory', 'atomic-properties']
  },
  {
    questionText: "What trend did Julius Meyer discover when plotting atomic size versus atomic mass?",
    options: [
      { id: 'a', text: 'Elements were randomly distributed', feedback: 'Incorrect. Meyer found a clear pattern, not random distribution.' },
      { id: 'b', text: 'A repeating pattern of chemical properties emerged', feedback: 'Correct! Meyer discovered the periodic nature of chemical properties.' },
      { id: 'c', text: 'Atomic size decreased uniformly', feedback: 'Incorrect. The relationship was periodic, not uniformly decreasing.' },
      { id: 'd', text: 'Metals always came after non-metals', feedback: 'Incorrect. This was not Meyer\'s discovery.' }
    ],
    correctOptionId: 'b',
    explanation: 'Julius Meyer discovered that when elements were arranged by atomic mass, their chemical properties showed a repeating pattern - the basis of periodicity.',
    difficulty: 'intermediate',
    tags: ['meyer', 'periodic-properties', 'atomic-mass']
  },
  {
    questionText: "What was Mendeleev's greatest contribution to chemistry?",
    options: [
      { id: 'a', text: 'He measured atomic weights precisely', feedback: 'Incorrect. While important, this was not his greatest contribution.' },
      { id: 'b', text: 'He proposed the structure of the atom', feedback: 'Incorrect. Atomic structure was discovered later by others.' },
      { id: 'c', text: 'He created a periodic table and predicted missing elements', feedback: 'Correct! Mendeleev\'s periodic table and predictions were revolutionary.' },
      { id: 'd', text: 'He discovered protons and neutrons', feedback: 'Incorrect. Subatomic particles were discovered much later.' }
    ],
    correctOptionId: 'c',
    explanation: 'Mendeleev\'s greatest contribution was creating the periodic table and boldly predicting the properties of undiscovered elements.',
    difficulty: 'intermediate',
    tags: ['mendeleev', 'periodic-table', 'predictions']
  },
  {
    questionText: "What error existed in Mendeleev's periodic table?",
    options: [
      { id: 'a', text: 'It didn\'t account for isotopes', feedback: 'Incorrect. Isotopes were not known at the time.' },
      { id: 'b', text: 'It was based on atomic number', feedback: 'Incorrect. It was based on atomic mass, not atomic number.' },
      { id: 'c', text: 'It listed metals before nonmetals', feedback: 'Incorrect. This was not an error in the table.' },
      { id: 'd', text: 'Some elements did not follow increasing atomic mass', feedback: 'Correct! Some elements had to be placed out of atomic mass order to fit their properties.' }
    ],
    correctOptionId: 'd',
    explanation: 'Mendeleev\'s table had some elements out of atomic mass order because he prioritized chemical properties over strict mass ordering.',
    difficulty: 'advanced',
    tags: ['mendeleev', 'periodic-table', 'atomic-mass-problems']
  },
  {
    questionText: "How did Henry Moseley improve the periodic table?",
    options: [
      { id: 'a', text: 'By arranging elements by density', feedback: 'Incorrect. Density was not Moseley\'s organizing principle.' },
      { id: 'b', text: 'By introducing the concept of atomic number', feedback: 'Correct! Moseley discovered atomic numbers and reorganized the table accordingly.' },
      { id: 'c', text: 'By adding the noble gases', feedback: 'Incorrect. Noble gases were discovered before Moseley\'s work.' },
      { id: 'd', text: 'By including isotopes', feedback: 'Incorrect. Isotopes were not the focus of Moseley\'s periodic table work.' }
    ],
    correctOptionId: 'b',
    explanation: 'Henry Moseley discovered atomic numbers (number of protons) and showed that elements should be arranged by atomic number, not atomic mass.',
    difficulty: 'intermediate',
    tags: ['moseley', 'atomic-number', 'periodic-table']
  },
  {
    questionText: "What is the primary difference between classical and modern physics as seen after 1896?",
    options: [
      { id: 'a', text: 'Classical physics involved magic and myth', feedback: 'Incorrect. Classical physics was still scientific, not magical.' },
      { id: 'b', text: 'Modern physics ignored experimentation', feedback: 'Incorrect. Modern physics relies heavily on experimentation.' },
      { id: 'c', text: 'Classical physics assumed a predictable universe; modern physics revealed uncertainty', feedback: 'Correct! Classical physics was deterministic; modern physics introduced quantum uncertainty.' },
      { id: 'd', text: 'Classical physics only applied to chemistry', feedback: 'Incorrect. Classical physics applied to all physical phenomena.' }
    ],
    correctOptionId: 'c',
    explanation: 'The key difference is that classical physics assumed a completely predictable universe, while modern physics (quantum mechanics) revealed fundamental uncertainty.',
    difficulty: 'advanced',
    tags: ['classical-physics', 'modern-physics', 'uncertainty']
  },
  {
    questionText: "What do the scientific methods of Descartes and Bacon have in common?",
    options: [
      { id: 'a', text: 'They rejected evidence and focused on belief', feedback: 'Incorrect. Both philosophers valued evidence in their methods.' },
      { id: 'b', text: 'They emphasized religious explanation of natural phenomena', feedback: 'Incorrect. They focused on rational and empirical approaches.' },
      { id: 'c', text: 'They relied on reason, observation, and systematic testing', feedback: 'Correct! Both emphasized systematic, rational approaches to understanding nature.' },
      { id: 'd', text: 'They were based on mystical experiences', feedback: 'Incorrect. Both rejected mystical approaches in favor of systematic methods.' }
    ],
    correctOptionId: 'c',
    explanation: 'Both Descartes and Bacon developed systematic methods based on reason, observation, and testing - forming the foundation of modern scientific method.',
    difficulty: 'intermediate',
    tags: ['descartes', 'bacon', 'scientific-method']
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
  'course2_49_question1': {
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
  'course2_49_question2': {
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
  'course2_49_question3': {
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
  'course2_49_question4': {
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
  'course2_49_question5': {
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
  'course2_49_question6': {
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
  'course2_49_question7': {
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
  'course2_49_question8': {
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
  'course2_49_question9': {
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
  'course2_49_question10': {
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