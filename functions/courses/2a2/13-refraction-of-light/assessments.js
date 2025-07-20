//const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Refraction Knowledge Check Questions
const questions = [
  // Question 1: Refractive Index of Plastic
  {
    questionText: "The speed of light in a certain plastic is 2.0 × 10⁸ m/s. What is the refractive index of the plastic?",
    options: [
      { id: 'a', text: '0.67', feedback: 'Incorrect. Remember that n = c/v, where c is the speed of light in vacuum.' },
      { id: 'b', text: '1.0', feedback: 'Incorrect. A refractive index of 1.0 means the speed is the same as in vacuum.' },
      { id: 'c', text: '1.5', feedback: 'Correct! n = c/v = (3.0 × 10⁸ m/s) / (2.0 × 10⁸ m/s) = 1.5' },
      { id: 'd', text: '2.0', feedback: 'Incorrect. Check your calculation - you may have inverted the formula.' }
    ],
    correctOptionId: 'c',
    explanation: 'The refractive index n = c/v = (3.0 × 10⁸ m/s) / (2.0 × 10⁸ m/s) = 1.5. The plastic slows light to 2/3 of its vacuum speed.',
    difficulty: 'intermediate',
    tags: ['refraction', 'refractive-index', 'speed-of-light']
  },

  // Question 2: Speed of Violet and Red Light in Crown Glass
  {
    questionText: "The index of refraction of crown glass for violet light is 1.53 and for red light 1.52. Assuming that the velocity of light in a vacuum is 3.00 × 10⁸ m/s, what are the speeds of violet light and red light in crown glass?",
    options: [
      { id: 'a', text: 'Violet: 1.96 × 10⁸ m/s, Red: 1.97 × 10⁸ m/s', feedback: 'Correct! Violet light travels slower due to higher refractive index.' },
      { id: 'b', text: 'Violet: 1.97 × 10⁸ m/s, Red: 1.96 × 10⁸ m/s', feedback: 'Incorrect. Higher refractive index means slower speed.' },
      { id: 'c', text: 'Violet: 2.04 × 10⁸ m/s, Red: 2.03 × 10⁸ m/s', feedback: 'Incorrect. Light travels slower in glass than in vacuum.' },
      { id: 'd', text: 'Both: 1.96 × 10⁸ m/s', feedback: 'Incorrect. Different colors have different refractive indices and speeds.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using v = c/n: For violet: v = 3.00 × 10⁸ / 1.53 = 1.96 × 10⁸ m/s. For red: v = 3.00 × 10⁸ / 1.52 = 1.97 × 10⁸ m/s. This dispersion causes rainbows!',
    difficulty: 'intermediate',
    tags: ['refraction', 'dispersion', 'crown-glass']
  },

  // Question 3: Angles of Reflection and Refraction
  {
    questionText: "A beam of light strikes the surface of water with an incident angle of 60°. Some of the light reflects off the water and some refracts into the water. If water has an index of refraction of 1.33, determine the angles of reflection and refraction.",
    options: [
      { id: 'a', text: 'Reflection: 30°, Refraction: 41°', feedback: 'Incorrect. The angle of reflection equals the angle of incidence.' },
      { id: 'b', text: 'Reflection: 60°, Refraction: 41°', feedback: 'Correct! Reflection angle = incident angle. Refraction angle from Snell\'s law.' },
      { id: 'c', text: 'Reflection: 60°, Refraction: 49°', feedback: 'Incorrect. Check your Snell\'s law calculation.' },
      { id: 'd', text: 'Reflection: 41°, Refraction: 60°', feedback: 'Incorrect. You have the angles reversed.' }
    ],
    correctOptionId: 'b',
    explanation: 'By the law of reflection, θᵣ = θᵢ = 60°. Using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂), so 1.0 × sin(60°) = 1.33 × sin(θ₂). Solving: θ₂ = 41°.',
    difficulty: 'intermediate',
    tags: ['reflection', 'refraction', 'Snells-law']
  },

  // Question 4: Air to Glass Refraction
  {
    questionText: "A wave travelling from air to glass (n = 1.52) has an angle of incidence of 30°. What is the angle of refraction?",
    options: [
      { id: 'a', text: '15°', feedback: 'Incorrect. Check your Snell\'s law calculation.' },
      { id: 'b', text: '19°', feedback: 'Correct! Using Snell\'s law: sin(θ₂) = sin(30°) / 1.52 = 0.329, so θ₂ = 19°.' },
      { id: 'c', text: '25°', feedback: 'Incorrect. Remember to use the correct refractive indices.' },
      { id: 'd', text: '45°', feedback: 'Incorrect. Light bends toward the normal when entering a denser medium.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂). For air to glass: 1.0 × sin(30°) = 1.52 × sin(θ₂). Solving: sin(θ₂) = 0.5 / 1.52 = 0.329, so θ₂ = arcsin(0.329) = 19°.',
    difficulty: 'intermediate',
    tags: ['refraction', 'Snells-law', 'air-to-glass']
  },

  // Question 5: Finding Index of Refraction
  {
    questionText: "If the angle of incidence is 20° and the angle of refraction is 10°, what is the index of refraction of the material if the wave started in air?",
    options: [
      { id: 'a', text: '1.50', feedback: 'Incorrect. Check your calculation using Snell\'s law.' },
      { id: 'b', text: '1.73', feedback: 'Incorrect. Make sure you\'re using the correct angles in Snell\'s law.' },
      { id: 'c', text: '1.97', feedback: 'Correct! n₂ = n₁sin(θ₁)/sin(θ₂) = sin(20°)/sin(10°) = 0.342/0.174 = 1.97' },
      { id: 'd', text: '2.24', feedback: 'Incorrect. Review your trigonometric calculations.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂). For air (n₁ = 1): sin(20°) = n₂ × sin(10°). Solving: n₂ = sin(20°) / sin(10°) = 0.342 / 0.174 = 1.97.',
    difficulty: 'intermediate',
    tags: ['refraction', 'refractive-index', 'Snells-law']
  },

  // Question 6: Wavelength in Water
  {
    questionText: "What is the wavelength of light in water if the wavelength in air is 570 nm? (nwater = 1.33)",
    options: [
      { id: 'a', text: '380 nm', feedback: 'Incorrect. Check your calculation of wavelength in the medium.' },
      { id: 'b', text: '429 nm', feedback: 'Correct! λwater = λair / n = 570 nm / 1.33 = 429 nm' },
      { id: 'c', text: '570 nm', feedback: 'Incorrect. Wavelength changes when light enters a different medium.' },
      { id: 'd', text: '758 nm', feedback: 'Incorrect. Wavelength decreases in a denser medium, not increases.' }
    ],
    correctOptionId: 'b',
    explanation: 'When light enters a denser medium, its wavelength decreases by a factor of n. λmedium = λvacuum / n = 570 nm / 1.33 = 429 nm. The frequency remains constant.',
    difficulty: 'intermediate',
    tags: ['refraction', 'wavelength', 'water']
  },

  // Question 7: Multi-layer Refraction
  {
    questionText: "A ray of light enters from air to water and then into glass. The angle of incidence from air is 55°. Find the angle of refraction in glass. (nwater = 1.33, nglass = 1.50)",
    options: [
      { id: 'a', text: '28°', feedback: 'Incorrect. You need to apply Snell\'s law twice through both interfaces.' },
      { id: 'b', text: '33°', feedback: 'Correct! First find angle in water, then use that for water-glass interface.' },
      { id: 'c', text: '38°', feedback: 'Incorrect. Make sure to use the correct refractive indices at each interface.' },
      { id: 'd', text: '42°', feedback: 'Incorrect. Remember that Snell\'s law applies at each interface separately.' }
    ],
    correctOptionId: 'b',
    explanation: 'Apply Snell\'s law twice. Air to water: sin(55°) = 1.33 × sin(θwater), so θwater = 38.0°. Water to glass: 1.33 × sin(38.0°) = 1.50 × sin(θglass), so θglass = 33°.',
    difficulty: 'advanced',
    tags: ['refraction', 'multiple-layers', 'Snells-law']
  }
];

// Assessment configurations for the master function
const assessmentConfigs = {
  'course2_13_refraction_kc_q1': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_refraction_kc_q2': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_refraction_kc_q3': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_refraction_kc_q4': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_refraction_kc_q5': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_refraction_kc_q6': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_refraction_kc_q7': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 2
  },
  'course2_13_slideshow_q1': {
    questions: [{
      questionText: "A light ray passes from air into glass at an angle of 45°. If the glass has a refractive index of 1.5, what happens to the light ray?",
      options: [
        { id: 'a', text: 'It bends away from the normal and travels at the same speed', feedback: 'Incorrect. Light bends toward the normal when entering a denser medium.' },
        { id: 'b', text: 'It bends toward the normal and slows down', feedback: 'Correct! Light bends toward the normal and travels slower in the denser glass.' },
        { id: 'c', text: 'It travels straight through without bending', feedback: 'Incorrect. Light only travels straight when hitting the interface at 0° (perpendicular).' },
        { id: 'd', text: 'It reflects completely back into the air', feedback: 'Incorrect. Total internal reflection only occurs when going from dense to less dense medium.' }
      ],
      correctOptionId: 'b',
      explanation: 'When light enters a denser medium like glass, it bends toward the normal according to Snell\'s law and travels slower due to the higher refractive index.',
      difficulty: 'intermediate',
      tags: ['refraction', 'Snells-law', 'dense-medium']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 2
  },
  'course2_13_slideshow_q2': {
    questions: [{
      questionText: "In a prism, white light separates into different colors because:",
      options: [
        { id: 'a', text: 'Different colors have different refractive indices in the glass', feedback: 'Correct! This phenomenon is called dispersion - each color has a slightly different refractive index.' },
        { id: 'b', text: 'The prism adds color to the white light', feedback: 'Incorrect. The prism doesn\'t add colors; it separates the colors already present in white light.' },
        { id: 'c', text: 'All colors bend by exactly the same amount', feedback: 'Incorrect. If all colors bent the same amount, they would not separate.' },
        { id: 'd', text: 'Only red and blue light can pass through glass', feedback: 'Incorrect. All visible colors can pass through glass, just at different angles.' }
      ],
      correctOptionId: 'a',
      explanation: 'Dispersion occurs because different wavelengths (colors) of light have slightly different refractive indices in the glass, causing them to bend by different amounts and separate.',
      difficulty: 'intermediate',
      tags: ['dispersion', 'prism', 'refractive-index']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 2
  },
  'course2_13_critical_q1': {
    questions: [{
      questionText: "The critical angle from rock salt into air is 40.5°. What is the index of refraction for rock salt?",
      options: [
        { id: 'a', text: '1.24', feedback: 'Incorrect. Check your calculation using sin(θc) = n₂/n₁.' },
        { id: 'b', text: '1.54', feedback: 'Correct! Using sin(θc) = n₂/n₁, we get n₁ = n₂/sin(θc) = 1.00/sin(40.5°) = 1.54' },
        { id: 'c', text: '1.84', feedback: 'Incorrect. Make sure you\'re using the correct formula for critical angle.' },
        { id: 'd', text: '2.04', feedback: 'Incorrect. Review the relationship between critical angle and refractive index.' }
      ],
      correctOptionId: 'b',
      explanation: 'At the critical angle, sin(θc) = n₂/n₁. Since light goes from rock salt to air: sin(40.5°) = 1.00/n₁. Therefore, n₁ = 1.00/sin(40.5°) = 1.00/0.649 = 1.54.',
      difficulty: 'intermediate',
      tags: ['critical-angle', 'refractive-index', 'rock-salt']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 2
  },
  'course2_13_critical_q2': {
    questions: [{
      questionText: "The critical angle for a certain liquid-air surface is 61°. What is the liquid's index of refraction?",
      options: [
        { id: 'a', text: '1.04', feedback: 'Incorrect. Check your trigonometric calculation.' },
        { id: 'b', text: '1.14', feedback: 'Correct! Using sin(θc) = n₂/n₁, we get n₁ = 1.00/sin(61°) = 1.00/0.875 = 1.14' },
        { id: 'c', text: '1.34', feedback: 'Incorrect. Make sure you\'re using the correct angle in your calculation.' },
        { id: 'd', text: '1.44', feedback: 'Incorrect. Review the critical angle formula.' }
      ],
      correctOptionId: 'b',
      explanation: 'At the critical angle, sin(θc) = n₂/n₁. For liquid to air: sin(61°) = 1.00/n₁. Therefore, n₁ = 1.00/sin(61°) = 1.00/0.875 = 1.14.',
      difficulty: 'intermediate',
      tags: ['critical-angle', 'refractive-index', 'liquid']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 2
  },
  'course2_13_critical_q3': {
    questions: [{
      questionText: "The refractive indices of diamond and crown glass are 2.5 and 1.5 respectively. What is the critical angle between diamond and glass?",
      options: [
        { id: 'a', text: '27°', feedback: 'Incorrect. Check your calculation using sin(θc) = n₂/n₁.' },
        { id: 'b', text: '37°', feedback: 'Correct! Using sin(θc) = n₂/n₁ = 1.5/2.5 = 0.6, so θc = arcsin(0.6) = 37°' },
        { id: 'c', text: '47°', feedback: 'Incorrect. Make sure you\'re using the correct ratio of refractive indices.' },
        { id: 'd', text: '57°', feedback: 'Incorrect. Review which refractive index goes in the numerator and denominator.' }
      ],
      correctOptionId: 'b',
      explanation: 'For diamond to glass interface: sin(θc) = n_glass/n_diamond = 1.5/2.5 = 0.6. Therefore, θc = arcsin(0.6) = 37°. Light must travel from the denser medium (diamond) to the less dense medium (glass).',
      difficulty: 'intermediate',
      tags: ['critical-angle', 'diamond', 'crown-glass']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 2
  }
};

exports.assessmentConfigs = assessmentConfigs;

