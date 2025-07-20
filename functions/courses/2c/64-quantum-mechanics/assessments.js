
// Question pool for quantum mechanics lesson
const questionPool = [
  {
    questionText: "What is the condition for a standing wave to exist?",
    options: [
      { id: 'a', text: 'The wave must be traveling in one direction only', feedback: 'Incorrect. Standing waves require interference between waves traveling in opposite directions.' },
      { id: 'b', text: 'The wavelength must be an integer multiple of the circumference', feedback: 'Incorrect. This describes the quantization condition, not the standing wave condition.' },
      { id: 'c', text: 'The wave must undergo constructive and destructive interference', feedback: 'Correct! Standing waves form when two waves of equal amplitude and frequency traveling in opposite directions interfere, creating nodes and antinodes.' },
      { id: 'd', text: 'The wave must have a very high frequency', feedback: 'Incorrect. Frequency does not determine whether a standing wave can form.' }
    ],
    correctOptionId: 'c',
    explanation: 'Standing waves form when two waves of equal amplitude and frequency traveling in opposite directions interfere constructively and destructively at fixed points, creating stationary nodes and antinodes.',
    difficulty: 'intermediate',
    tags: ['standing-waves', 'wave-interference', 'quantum-mechanics']
  },
  {
    questionText: "Which statement best describes the relationship between classical and quantum mechanics?",
    options: [
      { id: 'a', text: 'Classical mechanics is completely wrong and should be abandoned', feedback: 'Incorrect. Classical mechanics is still valid and useful for macroscopic objects.' },
      { id: 'b', text: 'Quantum mechanics applies only to very small particles', feedback: 'Incorrect. Quantum mechanics is universal, but its effects are only noticeable at small scales.' },
      { id: 'c', text: 'Classical mechanics is a limiting case of quantum mechanics for large objects', feedback: 'Correct! Classical mechanics emerges from quantum mechanics when dealing with large objects where quantum effects become negligible.' },
      { id: 'd', text: 'Quantum and classical mechanics are completely unrelated theories', feedback: 'Incorrect. Classical mechanics is actually a limiting case of the more fundamental quantum mechanics.' }
    ],
    correctOptionId: 'c',
    explanation: 'Classical mechanics is a limiting case of quantum mechanics. When dealing with large objects, the quantum effects become negligible and classical mechanics provides an excellent approximation.',
    difficulty: 'intermediate',
    tags: ['classical-vs-quantum', 'correspondence-principle', 'quantum-mechanics']
  },
  {
    questionText: "What does the uncertainty principle state about position and momentum?",
    options: [
      { id: 'a', text: 'Both position and momentum can be measured exactly at the same time', feedback: 'Incorrect. The uncertainty principle states that position and momentum cannot both be measured exactly simultaneously.' },
      { id: 'b', text: 'The product of uncertainties in position and momentum has a minimum value', feedback: 'Correct! The uncertainty principle states that Δx × Δp ≥ ℏ/2, where ℏ is the reduced Planck constant.' },
      { id: 'c', text: 'Position is more fundamental than momentum', feedback: 'Incorrect. Neither position nor momentum is more fundamental; they are complementary observables.' },
      { id: 'd', text: 'Uncertainty only applies to quantum particles, not classical objects', feedback: 'Incorrect. The uncertainty principle is universal, but its effects are only noticeable for quantum-scale objects.' }
    ],
    correctOptionId: 'b',
    explanation: 'The Heisenberg uncertainty principle states that the product of uncertainties in position and momentum must be greater than or equal to ℏ/2, where ℏ = h/(2π).',
    difficulty: 'advanced',
    tags: ['uncertainty-principle', 'heisenberg', 'quantum-mechanics']
  },
  {
    questionText: "Which concept is central to the wave-particle duality of matter?",
    options: [
      { id: 'a', text: 'All matter behaves only as particles', feedback: 'Incorrect. Matter exhibits both wave and particle properties depending on the experimental setup.' },
      { id: 'b', text: 'All matter behaves only as waves', feedback: 'Incorrect. Matter exhibits both wave and particle properties depending on the experimental setup.' },
      { id: 'c', text: 'Matter can exhibit both wave and particle properties depending on the observation', feedback: 'Correct! Wave-particle duality means that matter can exhibit wave-like properties (interference, diffraction) or particle-like properties (localized interactions) depending on how it is observed.' },
      { id: 'd', text: 'Only electromagnetic radiation exhibits wave-particle duality', feedback: 'Incorrect. All matter, including particles like electrons and atoms, exhibits wave-particle duality.' }
    ],
    correctOptionId: 'c',
    explanation: 'Wave-particle duality is a fundamental concept in quantum mechanics stating that all matter can exhibit both wave-like and particle-like properties depending on the experimental setup and observation method.',
    difficulty: 'intermediate',
    tags: ['wave-particle-duality', 'quantum-mechanics', 'complementarity']
  },
  {
    questionText: "What does a quantum mechanical orbital represent?",
    options: [
      { id: 'a', text: 'The exact path of an electron around the nucleus', feedback: 'Incorrect. Quantum mechanics shows that electrons do not have definite paths or orbits.' },
      { id: 'b', text: 'A region where there is a high probability of finding an electron', feedback: 'Correct! A quantum mechanical orbital represents a three-dimensional region around the nucleus where there is a high probability of finding an electron.' },
      { id: 'c', text: 'The speed of an electron in an atom', feedback: 'Incorrect. Orbitals describe spatial probability distributions, not velocities.' },
      { id: 'd', text: 'The energy level of an electron only', feedback: 'Incorrect. While orbitals are associated with energy levels, they primarily describe spatial probability distributions.' }
    ],
    correctOptionId: 'b',
    explanation: 'In quantum mechanics, an orbital is a mathematical function that describes the probability of finding an electron in a particular region of space around the nucleus.',
    difficulty: 'intermediate',
    tags: ['quantum-orbitals', 'electron-probability', 'quantum-mechanics']
  },
  {
    questionText: "What is the significance of quantized energy levels in atoms?",
    options: [
      { id: 'a', text: 'Electrons can have any energy value', feedback: 'Incorrect. Energy levels in atoms are quantized, meaning electrons can only have specific, discrete energy values.' },
      { id: 'b', text: 'Electrons can only exist at specific, discrete energy levels', feedback: 'Correct! Quantization means that electrons in atoms can only exist at specific energy levels, not at intermediate values.' },
      { id: 'c', text: 'Energy levels are continuous like a ramp', feedback: 'Incorrect. Energy levels are discrete, not continuous.' },
      { id: 'd', text: 'Quantization only applies to hydrogen atoms', feedback: 'Incorrect. Energy level quantization is a universal feature of all atoms.' }
    ],
    correctOptionId: 'b',
    explanation: 'Energy quantization is a fundamental feature of quantum mechanics where electrons in atoms can only exist at specific, discrete energy levels, not at intermediate values.',
    difficulty: 'intermediate',
    tags: ['energy-quantization', 'atomic-structure', 'quantum-mechanics']
  }
];

const assessmentConfigs = {
  'course2_64_question1': {
    type: 'multiple-choice',
    questions: [questionPool[0]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'purple'
  },
  'course2_64_question2': {
    type: 'multiple-choice',
    questions: [questionPool[1]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'purple'
  },
  'course2_64_question3': {
    type: 'multiple-choice',
    questions: [questionPool[2]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'purple'
  },
  'course2_64_question4': {
    type: 'multiple-choice',
    questions: [questionPool[3]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'purple'
  },
  'course2_64_question5': {
    type: 'multiple-choice',
    questions: [questionPool[4]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'purple'
  },
  'course2_64_question6': {
    type: 'multiple-choice',
    questions: [questionPool[5]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'purple'
  }
};

module.exports = { assessmentConfigs };

