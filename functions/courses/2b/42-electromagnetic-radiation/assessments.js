
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ========================================
// ELECTROMAGNETIC RADIATION QUESTIONS
// ========================================

// Twenty electromagnetic radiation questions covering theory and calculations
const emrQuestions = [
  {
    questionText: "What is the fundamental origin of all electromagnetic radiation (EMR)?",
    options: [
      { id: 'a', text: 'Charged particles at rest', feedback: 'Incorrect. Stationary charges do not produce electromagnetic radiation.' },
      { id: 'b', text: 'Oscillating or accelerating electric charges', feedback: 'Correct! All EMR originates from charged particles that are oscillating or accelerating.' },
      { id: 'c', text: 'Strong gravitational fields', feedback: 'Incorrect. Gravitational fields do not directly produce electromagnetic radiation.' },
      { id: 'd', text: 'Heat conduction in metals', feedback: 'Incorrect. Heat conduction is energy transfer through matter, not EMR production.' }
    ],
    correctOptionId: 'b',
    explanation: 'All electromagnetic radiation is produced by oscillating or accelerating electric charges. This includes radio antennas, atomic oscillations, and electron transitions.',
    difficulty: 'intermediate',
    tags: ['emr-origin', 'charged-particles', 'electromagnetic-theory']
  },
  {
    questionText: "If a charge undergoes simple harmonic oscillations, what is the frequency of the EMR it produces?",
    options: [
      { id: 'a', text: 'It depends on the amplitude', feedback: 'Incorrect. The frequency of EMR depends on the oscillation frequency, not amplitude.' },
      { id: 'b', text: 'Half the frequency of the oscillation', feedback: 'Incorrect. The EMR frequency matches the charge oscillation frequency.' },
      { id: 'c', text: 'Same as the frequency of oscillation', feedback: 'Correct! The EMR produced has the same frequency as the oscillating charge.' },
      { id: 'd', text: 'Double the frequency of the oscillation', feedback: 'Incorrect. The frequencies are equal, not doubled.' }
    ],
    correctOptionId: 'c',
    explanation: 'When a charge oscillates at a certain frequency, it produces electromagnetic radiation at exactly the same frequency.',
    difficulty: 'intermediate',
    tags: ['frequency', 'oscillation', 'harmonic-motion']
  },
  {
    questionText: "What is the speed of all electromagnetic radiation (EMR) in a vacuum?",
    options: [
      { id: 'a', text: '3.00 × 10⁵ m/s', feedback: 'Incorrect. This is 1/1000 of the actual speed of light.' },
      { id: 'b', text: '1.50 × 10⁸ m/s', feedback: 'Incorrect. This is half the speed of light.' },
      { id: 'c', text: '3.00 × 10⁸ m/s', feedback: 'Correct! All EMR travels at the speed of light (c = 3.00 × 10⁸ m/s) in a vacuum.' },
      { id: 'd', text: '1.00 × 10⁶ m/s', feedback: 'Incorrect. This is much too slow for electromagnetic radiation.' }
    ],
    correctOptionId: 'c',
    explanation: 'All electromagnetic radiation (radio waves, light, X-rays, etc.) travels at the speed of light c = 3.00 × 10⁸ m/s in a vacuum.',
    difficulty: 'beginner',
    tags: ['speed-of-light', 'vacuum', 'fundamental-constants']
  },
  {
    questionText: "Why are radio waves, visible light, and X-rays all called electromagnetic radiation?",
    options: [
      { id: 'a', text: 'They all have the same frequency', feedback: 'Incorrect. These have very different frequencies but are all EMR.' },
      { id: 'b', text: 'They are all produced by nuclear decay', feedback: 'Incorrect. Only gamma rays are typically produced by nuclear decay.' },
      { id: 'c', text: 'They consist of oscillating electric and magnetic fields', feedback: 'Correct! All EMR consists of oscillating electric and magnetic fields traveling together.' },
      { id: 'd', text: 'They are all visible to the human eye', feedback: 'Incorrect. Only visible light can be seen by humans.' }
    ],
    correctOptionId: 'c',
    explanation: 'All electromagnetic radiation consists of oscillating electric and magnetic fields that are perpendicular to each other and travel at the speed of light.',
    difficulty: 'intermediate',
    tags: ['electromagnetic-fields', 'wave-nature', 'em-spectrum']
  },
  {
    questionText: "Which type of EMR is produced by transitions of inner electrons?",
    options: [
      { id: 'a', text: 'Radio waves', feedback: 'Incorrect. Radio waves are produced by oscillating currents in antennas.' },
      { id: 'b', text: 'Visible light', feedback: 'Incorrect. Visible light is produced by outer electron transitions.' },
      { id: 'c', text: 'X-rays', feedback: 'Correct! X-rays are produced when inner electrons transition between energy levels.' },
      { id: 'd', text: 'Gamma rays', feedback: 'Incorrect. Gamma rays are produced by nuclear transitions, not electron transitions.' }
    ],
    correctOptionId: 'c',
    explanation: 'X-rays are produced when inner electrons in atoms transition between energy levels. The large energy differences produce high-frequency X-ray photons.',
    difficulty: 'intermediate',
    tags: ['x-rays', 'electron-transitions', 'atomic-physics']
  },
  {
    questionText: "As the frequency of an EM wave increases, its wavelength:",
    options: [
      { id: 'a', text: 'Increases', feedback: 'Incorrect. Frequency and wavelength are inversely related.' },
      { id: 'b', text: 'Stays the same', feedback: 'Incorrect. Wavelength changes when frequency changes.' },
      { id: 'c', text: 'Decreases', feedback: 'Correct! As frequency increases, wavelength decreases since c = fλ.' },
      { id: 'd', text: 'Doubles', feedback: 'Incorrect. There is an inverse relationship, not a doubling relationship.' }
    ],
    correctOptionId: 'c',
    explanation: 'From the equation c = fλ, since the speed of light is constant, frequency and wavelength are inversely proportional.',
    difficulty: 'beginner',
    tags: ['frequency-wavelength', 'wave-equation', 'inverse-relationship']
  },
  {
    questionText: "Which type of wave penetrates the human body more easily?",
    options: [
      { id: 'a', text: 'Radio waves', feedback: 'Incorrect. Radio waves have low penetration through tissue.' },
      { id: 'b', text: 'Visible light', feedback: 'Incorrect. Visible light cannot penetrate deep into tissue.' },
      { id: 'c', text: 'X-rays', feedback: 'Incorrect. X-rays penetrate well but not as much as gamma rays.' },
      { id: 'd', text: 'Gamma rays', feedback: 'Correct! Gamma rays have the highest penetrating power due to their very high energy.' }
    ],
    correctOptionId: 'd',
    explanation: 'Gamma rays have the highest energy and frequency in the electromagnetic spectrum, giving them the greatest penetrating power through matter.',
    difficulty: 'intermediate',
    tags: ['penetration', 'gamma-rays', 'medical-physics']
  },
  {
    questionText: "How do microwaves cook your food?",
    options: [
      { id: 'a', text: 'They heat the metal parts of food', feedback: 'Incorrect. Microwaves should not be used with metal objects.' },
      { id: 'b', text: 'They cause water molecules to rotate and heat up', feedback: 'Correct! Microwaves cause polar water molecules to rotate rapidly, generating heat through friction.' },
      { id: 'c', text: 'They excite atomic nuclei', feedback: 'Incorrect. Microwaves do not have enough energy to affect nuclei.' },
      { id: 'd', text: 'They ionize the food molecules', feedback: 'Incorrect. Microwaves are non-ionizing radiation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Microwaves work by causing polar molecules (especially water) to rotate rapidly. This molecular motion generates heat that cooks the food.',
    difficulty: 'intermediate',
    tags: ['microwaves', 'molecular-rotation', 'practical-applications']
  },
  {
    questionText: "To see people at night using a camera, which type of light should the camera detect?",
    options: [
      { id: 'a', text: 'Ultraviolet', feedback: 'Incorrect. UV light is not naturally emitted by warm objects at body temperature.' },
      { id: 'b', text: 'Infrared', feedback: 'Correct! All warm objects emit infrared radiation, making IR cameras perfect for night vision.' },
      { id: 'c', text: 'X-rays', feedback: 'Incorrect. X-rays are not naturally emitted by human bodies in detectable amounts.' },
      { id: 'd', text: 'Gamma rays', feedback: 'Incorrect. Gamma rays are not emitted by human bodies.' }
    ],
    correctOptionId: 'b',
    explanation: 'Human bodies emit infrared radiation due to their temperature. Infrared cameras can detect this thermal radiation for night vision.',
    difficulty: 'intermediate',
    tags: ['infrared', 'thermal-radiation', 'night-vision']
  },
  {
    questionText: "What type of light are honey bees most sensitive to?",
    options: [
      { id: 'a', text: 'Infrared light', feedback: 'Incorrect. Bees cannot see infrared light.' },
      { id: 'b', text: 'X-rays', feedback: 'Incorrect. No living organisms can see X-rays.' },
      { id: 'c', text: 'Ultraviolet light', feedback: 'Correct! Honey bees can see ultraviolet light and use it to locate flowers with UV patterns.' },
      { id: 'd', text: 'Gamma rays', feedback: 'Incorrect. Gamma rays would be harmful, not useful for vision.' }
    ],
    correctOptionId: 'c',
    explanation: 'Honey bees have vision that extends into the ultraviolet range. Many flowers have UV patterns that guide bees to nectar.',
    difficulty: 'intermediate',
    tags: ['ultraviolet', 'bee-vision', 'biological-applications']
  },
  {
    questionText: "What is the frequency of a 1.8 cm microwave?",
    options: [
      { id: 'a', text: '3.00 × 10⁹ Hz', feedback: 'Incorrect. Check your calculation: f = c/λ = (3.00×10⁸)/(0.018)' },
      { id: 'b', text: '1.67 × 10¹⁰ Hz', feedback: 'Correct! f = c/λ = (3.00×10⁸ m/s)/(0.018 m) = 1.67×10¹⁰ Hz' },
      { id: 'c', text: '1.7 × 10¹⁰ Hz', feedback: 'Very close! The more precise answer is 1.67×10¹⁰ Hz.' },
      { id: 'd', text: '3.0 × 10¹¹ Hz', feedback: 'Incorrect. This frequency is too high for the given wavelength.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using f = c/λ: f = (3.00×10⁸ m/s)/(0.018 m) = 1.67×10¹⁰ Hz. This is in the microwave range.',
    difficulty: 'intermediate',
    tags: ['frequency-calculation', 'microwaves', 'wave-equation']
  },
  {
    questionText: "What is the wavelength of a 3.2 × 10¹⁰ Hz radar signal?",
    options: [
      { id: 'a', text: '9.4 mm', feedback: 'Correct! λ = c/f = (3.00×10⁸)/(3.2×10¹⁰) = 0.009375 m = 9.4 mm' },
      { id: 'b', text: '12 mm', feedback: 'Incorrect. Check your calculation: λ = c/f' },
      { id: 'c', text: '6.8 mm', feedback: 'Incorrect. Verify your division: 3.00×10⁸ ÷ 3.2×10¹⁰' },
      { id: 'd', text: '1.2 cm', feedback: 'Incorrect. This wavelength is too large for the given frequency.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using λ = c/f: λ = (3.00×10⁸ m/s)/(3.2×10¹⁰ Hz) = 0.009375 m = 9.4 mm',
    difficulty: 'intermediate',
    tags: ['wavelength-calculation', 'radar', 'microwave-frequency']
  },
  {
    questionText: "What is the distance between adjacent maxima of magnetic field strength in the wave from a 60 Hz power line?",
    options: [
      { id: 'a', text: '5.0 × 10⁶ m', feedback: 'Correct! λ = c/f = (3.00×10⁸)/(60) = 5.0×10⁶ m. This is the wavelength of 60 Hz EMR.' },
      { id: 'b', text: '3.0 × 10⁵ m', feedback: 'Incorrect. This is 1/10 of the correct wavelength.' },
      { id: 'c', text: '6.2 × 10⁶ m', feedback: 'Incorrect. Check your calculation with f = 60 Hz.' },
      { id: 'd', text: '1.2 × 10⁷ m', feedback: 'Incorrect. This wavelength is too large.' }
    ],
    correctOptionId: 'a',
    explanation: 'The distance between adjacent maxima equals the wavelength: λ = c/f = (3.00×10⁸ m/s)/(60 Hz) = 5.0×10⁶ m',
    difficulty: 'intermediate',
    tags: ['power-line-frequency', 'wavelength', 'field-maxima']
  },
  {
    questionText: "What is the frequency of red light with a wavelength of 650 nm?",
    options: [
      { id: 'a', text: '3.1 × 10¹⁴ Hz', feedback: 'Incorrect. Check your wavelength conversion: 650 nm = 6.50×10⁻⁷ m' },
      { id: 'b', text: '4.6 × 10¹⁴ Hz', feedback: 'Correct! f = c/λ = (3.00×10⁸)/(6.50×10⁻⁷) = 4.6×10¹⁴ Hz' },
      { id: 'c', text: '5.8 × 10¹⁴ Hz', feedback: 'Incorrect. This frequency is too high for red light.' },
      { id: 'd', text: '6.3 × 10¹⁴ Hz', feedback: 'Incorrect. This frequency corresponds to shorter wavelength light.' }
    ],
    correctOptionId: 'b',
    explanation: 'Converting: 650 nm = 6.50×10⁻⁷ m. Then f = c/λ = (3.00×10⁸)/(6.50×10⁻⁷) = 4.6×10¹⁴ Hz',
    difficulty: 'intermediate',
    tags: ['visible-light', 'frequency-calculation', 'nanometer-conversion']
  },
  {
    questionText: "How much sooner will a fan in Montreal hear a Grey Cup play compared to a fan 6000 km away via satellite (36000 km up)?",
    options: [
      { id: 'a', text: '0.12 s', feedback: 'Incorrect. Calculate the total satellite distance: up + down + horizontal.' },
      { id: 'b', text: '0.20 s', feedback: 'Incorrect. The satellite path is longer than just the 6000 km horizontal distance.' },
      { id: 'c', text: '0.24 s', feedback: 'Correct! Satellite distance ≈ 78000 km total. Time difference = (78000-6000)×10³/(3×10⁸) = 0.24 s' },
      { id: 'd', text: '0.36 s', feedback: 'Incorrect. This time difference is too large.' }
    ],
    correctOptionId: 'c',
    explanation: 'Satellite path: 36000 km up + 6000 km across + 36000 km down = 78000 km. Time difference = (78000-6000)×10³ m / (3×10⁸ m/s) = 0.24 s',
    difficulty: 'advanced',
    tags: ['satellite-communication', 'time-delay', 'practical-applications']
  },
  {
    questionText: "What is the wavelength of EMR with a period of 5.65 × 10⁻¹¹ s?",
    options: [
      { id: 'a', text: '0.0170 m', feedback: 'Correct! f = 1/T = 1/(5.65×10⁻¹¹) = 1.77×10¹⁰ Hz. λ = c/f = (3×10⁸)/(1.77×10¹⁰) = 0.0170 m' },
      { id: 'b', text: '0.0058 m', feedback: 'Incorrect. Check your frequency calculation: f = 1/T first.' },
      { id: 'c', text: '1.20 m', feedback: 'Incorrect. This wavelength is much too large for the given period.' },
      { id: 'd', text: '0.089 m', feedback: 'Incorrect. Verify your calculation steps.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find frequency: f = 1/T = 1/(5.65×10⁻¹¹ s) = 1.77×10¹⁰ Hz. Then λ = c/f = (3.00×10⁸)/(1.77×10¹⁰) = 0.0170 m',
    difficulty: 'intermediate',
    tags: ['period-frequency', 'wavelength-calculation', 'microwave-range']
  },
  {
    questionText: "What is the wavelength of UV light (11.0 nm in air) when it passes into glass (n = 1.52)?",
    options: [
      { id: 'a', text: '9.6 nm', feedback: 'Incorrect. Use λ_medium = λ_vacuum/n for the calculation.' },
      { id: 'b', text: '8.5 nm', feedback: 'Incorrect. Check your division: 11.0/1.52' },
      { id: 'c', text: '7.24 nm', feedback: 'Correct! λ_glass = λ_air/n = 11.0 nm/1.52 = 7.24 nm' },
      { id: 'd', text: '6.2 nm', feedback: 'Incorrect. This wavelength is too small.' }
    ],
    correctOptionId: 'c',
    explanation: 'When light enters a medium, its wavelength changes: λ_medium = λ_vacuum/n = 11.0 nm/1.52 = 7.24 nm',
    difficulty: 'intermediate',
    tags: ['refraction', 'wavelength-change', 'refractive-index']
  },
  {
    questionText: "What is the period of EMR (λ = 7.30 × 10⁻⁸ m) in Lucite (n = 1.50)?",
    options: [
      { id: 'a', text: '4.89 × 10⁻¹⁶ s', feedback: 'Incorrect. The period depends on frequency, which doesn\'t change in the medium.' },
      { id: 'b', text: '3.12 × 10⁻¹⁶ s', feedback: 'Incorrect. Remember that frequency (and period) remain constant in different media.' },
      { id: 'c', text: '2.43 × 10⁻¹⁶ s', feedback: 'Correct! First find vacuum wavelength: λ₀ = λ×n = 7.30×10⁻⁸×1.50 = 1.095×10⁻⁷ m. Then f = c/λ₀, T = 1/f = 2.43×10⁻¹⁶ s' },
      { id: 'd', text: '1.68 × 10⁻¹⁶ s', feedback: 'Incorrect. Check your calculation of the vacuum wavelength first.' }
    ],
    correctOptionId: 'c',
    explanation: 'First find vacuum wavelength: λ₀ = λ_medium × n = 7.30×10⁻⁸ × 1.50 = 1.095×10⁻⁷ m. Then f = c/λ₀ = 2.74×10¹⁵ Hz, so T = 1/f = 2.43×10⁻¹⁶ s',
    difficulty: 'advanced',
    tags: ['period-calculation', 'refractive-index', 'frequency-invariance']
  },
  {
    questionText: "A double-slit microwave interference experiment has slits 5.00 cm apart and a pattern 14.5 cm wide at 1.50 cm distance. What is the microwave frequency?",
    options: [
      { id: 'a', text: '3.25 × 10⁹ Hz', feedback: 'Incorrect. Check your interference pattern analysis and wavelength calculation.' },
      { id: 'b', text: '6.03 × 10⁹ Hz', feedback: 'Correct! Using double-slit formula and given geometry, λ ≈ 0.0497 m, so f = c/λ = 6.03×10⁹ Hz' },
      { id: 'c', text: '9.01 × 10⁹ Hz', feedback: 'Incorrect. This frequency is too high for the calculated wavelength.' },
      { id: 'd', text: '1.24 × 10¹⁰ Hz', feedback: 'Incorrect. Verify your double-slit interference calculations.' }
    ],
    correctOptionId: 'b',
    explanation: 'From double-slit interference: the pattern width and geometry give λ ≈ 0.0497 m. Then f = c/λ = (3×10⁸)/(0.0497) = 6.03×10⁹ Hz',
    difficulty: 'advanced',
    tags: ['double-slit', 'interference', 'microwave-experiment']
  },
  {
    questionText: "Hydrogen in space emits signals at wavelengths of 1.35 cm and 18 cm. What are the frequencies and part of the EM spectrum?",
    options: [
      { id: 'a', text: '2.22 × 10¹⁰ Hz and 1.7 × 10⁹ Hz, microwaves', feedback: 'Correct! f₁ = c/λ₁ = 3×10⁸/0.0135 = 2.22×10¹⁰ Hz; f₂ = 3×10⁸/0.18 = 1.67×10⁹ Hz. Both are microwaves.' },
      { id: 'b', text: '2.22 × 10⁹ Hz and 1.7 × 10⁸ Hz, radio waves', feedback: 'Incorrect. Your frequency calculations are off by a factor of 10.' },
      { id: 'c', text: '1.35 × 10¹⁰ Hz and 18 × 10⁹ Hz, gamma rays', feedback: 'Incorrect. These are not the correct frequency calculations, and the spectrum classification is wrong.' },
      { id: 'd', text: '1.7 × 10¹⁰ Hz and 2.22 × 10⁹ Hz, X-rays', feedback: 'Incorrect. You have the frequencies reversed and wrong spectrum classification.' }
    ],
    correctOptionId: 'a',
    explanation: 'f₁ = c/λ₁ = (3×10⁸ m/s)/(0.0135 m) = 2.22×10¹⁰ Hz; f₂ = (3×10⁸)/(0.18) = 1.67×10⁹ Hz. Both frequencies fall in the microwave range.',
    difficulty: 'advanced',
    tags: ['hydrogen-emission', 'space-astronomy', 'frequency-calculation', 'spectrum-classification']
  }
];

// ========================================
// ASSESSMENT CONFIGURATIONS
// ========================================

const assessmentConfigs = {};

// Add EMR questions to main assessment configs (questions 1-20)
emrQuestions.forEach((questionData, index) => {
  const questionNumber = index + 1; // Questions 1-20
  const questionId = `course2_42_question${questionNumber}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questionData],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: ACTIVITY_TYPE,
    theme: 'indigo'
  };
});

module.exports = { 
  assessmentConfigs
};