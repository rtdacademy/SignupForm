const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

const questions = [
  // Question 1: Refraction from crown glass to air
  {
    questionText: "A light ray is travelling from crown glass (n = 1.52) into air. The angle of incidence is 20°. What is the angle of refraction?",
    options: [
      { id: 'a', text: '31.3°', feedback: 'Correct! Using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂), so sin(θ₂) = (1.52 × sin(20°))/1.00 = 0.520, giving θ₂ = 31.3°.' },
      { id: 'b', text: '13.0°', feedback: 'Incorrect. This would be if light were going from air to glass. Remember to use the correct indices.' },
      { id: 'c', text: '28.7°', feedback: 'Incorrect. Check your calculation using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂).' },
      { id: 'd', text: '20.0°', feedback: 'Incorrect. The angle changes when light moves between different media with different refractive indices.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂). Substituting: (1.52)(sin 20°) = (1.00)(sin θ₂). Solving: sin θ₂ = 0.520, so θ₂ = 31.3°.',
    difficulty: 'intermediate',
    tags: ['refraction', 'Snells-law', 'optics']
  },
  {
    questionText: "Light travels from plastic (n = 1.52) into air where the angle of refraction is 60°. Find the angle of refraction when this same light enters water (n = 1.33) instead of air.",
    options: [
      { id: 'a', text: '40.6°', feedback: 'Correct! First find the incident angle using air data, then apply Snell\'s law for the plastic-water interface.' },
      { id: 'b', text: '35.2°', feedback: 'Incorrect. Make sure to first calculate the incident angle from the plastic-air data.' },
      { id: 'c', text: '45.8°', feedback: 'Incorrect. Check your application of Snell\'s law for both interfaces.' },
      { id: 'd', text: '52.1°', feedback: 'Incorrect. Remember that the incident angle is the same, but the refractive index of water is different from air.' }
    ],
    correctOptionId: 'a',
    explanation: 'First, find the incident angle: n₁sin(θ₁) = n₂sin(θ₂), so 1.52 × sin(θ₁) = 1.00 × sin(60°), giving θ₁ = 35.1°. Then for plastic to water: 1.52 × sin(35.1°) = 1.33 × sin(θ₂), giving θ₂ = 40.6°.',
    difficulty: 'advanced',
    tags: ['refraction', 'Snells-law', 'multiple-media']
  },
  {
    questionText: "What is the critical angle when light emerges from glass (n = 1.50) into air?",
    options: [
      { id: 'a', text: '41.8°', feedback: 'Correct! The critical angle occurs when sin(θc) = n₂/n₁ = 1.00/1.50 = 0.667, so θc = 41.8°.' },
      { id: 'b', text: '48.6°', feedback: 'Incorrect. Check your calculation of sin⁻¹(n₂/n₁) where n₁ = 1.50 and n₂ = 1.00.' },
      { id: 'c', text: '33.7°', feedback: 'Incorrect. This would be the critical angle if n₁ and n₂ were reversed.' },
      { id: 'd', text: '56.4°', feedback: 'Incorrect. Make sure you\'re using the correct formula: sin(θc) = n₂/n₁.' }
    ],
    correctOptionId: 'a',
    explanation: 'The critical angle occurs when the refracted ray grazes the interface (θ₂ = 90°). Using Snell\'s law: n₁sin(θc) = n₂sin(90°), so sin(θc) = n₂/n₁ = 1.00/1.50 = 0.667. Therefore θc = 41.8°.',
    difficulty: 'intermediate',
    tags: ['critical-angle', 'total-internal-reflection', 'optics']
  },
  {
    questionText: "The critical angle between glass and water is 56.2°. What is the index of refraction for the glass?",
    options: [
      { id: 'a', text: '1.60', feedback: 'Correct! Using sin(θc) = n₂/n₁, we get n₁ = n₂/sin(θc) = 1.33/sin(56.2°) = 1.60.' },
      { id: 'b', text: '1.45', feedback: 'Incorrect. Check your calculation using the critical angle formula.' },
      { id: 'c', text: '1.33', feedback: 'Incorrect. This is the refractive index of water, not glass.' },
      { id: 'd', text: '1.78', feedback: 'Incorrect. Make sure you\'re using the correct refractive index for water (1.33).' }
    ],
    correctOptionId: 'a',
    explanation: 'At the critical angle: sin(θc) = n₂/n₁, where n₂ = 1.33 (water) and θc = 56.2°. Solving: n₁ = n₂/sin(θc) = 1.33/sin(56.2°) = 1.33/0.831 = 1.60.',
    difficulty: 'intermediate',
    tags: ['critical-angle', 'refractive-index', 'calculation']
  },
  {
    questionText: "A lamp 10 cm high is placed 60 cm in front of a diverging lens of focal length 20 cm. Calculate the image position and the height of the image.",
    options: [
      { id: 'a', text: '–15 cm, 2.5 cm', feedback: 'Correct! Using 1/f = 1/dₒ + 1/dᵢ with f = -20 cm: 1/(-20) = 1/60 + 1/dᵢ, giving dᵢ = -15 cm. Magnification: m = -dᵢ/dₒ = 15/60 = 0.25, so hᵢ = 0.25 × 10 = 2.5 cm.' },
      { id: 'b', text: '–30 cm, 5.0 cm', feedback: 'Incorrect. Check your lens equation calculation. Remember f is negative for diverging lenses.' },
      { id: 'c', text: '15 cm, 2.5 cm', feedback: 'Incorrect. The image distance should be negative for a diverging lens (virtual image).' },
      { id: 'd', text: '–15 cm, –2.5 cm', feedback: 'Incorrect. The image height should be positive (upright) for a diverging lens.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a diverging lens, f = -20 cm. Using 1/f = 1/dₒ + 1/dᵢ: 1/(-20) = 1/60 + 1/dᵢ. Solving: dᵢ = -15 cm. Magnification: m = -dᵢ/dₒ = -(-15)/60 = 0.25. Image height: hᵢ = m × hₒ = 0.25 × 10 = 2.5 cm.',
    difficulty: 'advanced',
    tags: ['diverging-lens', 'lens-equation', 'magnification']
  },
  {
    questionText: "A lens has a focal length of +20 cm and a magnification of 4. How far apart are the object and the image?",
    options: [
      { id: 'a', text: '125 cm', feedback: 'Correct! With m = 4, dᵢ = 4dₒ. Using lens equation: 1/20 = 1/dₒ + 1/(4dₒ) = 5/(4dₒ), so dₒ = 25 cm and dᵢ = 100 cm. Distance = 25 + 100 = 125 cm.' },
      { id: 'b', text: '100 cm', feedback: 'Incorrect. This is only the image distance. Remember to add object and image distances.' },
      { id: 'c', text: '80 cm', feedback: 'Incorrect. Check your lens equation calculation with the magnification constraint.' },
      { id: 'd', text: '60 cm', feedback: 'Incorrect. Make sure you\'re using the correct relationship between magnification and distances.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -dᵢ/dₒ = 4, so dᵢ = -4dₒ (negative sign indicates inverted image). Using 1/f = 1/dₒ + 1/dᵢ: 1/20 = 1/dₒ + 1/(-4dₒ) = 1/dₒ - 1/(4dₒ) = 3/(4dₒ). Solving: dₒ = 15 cm, dᵢ = 60 cm. Total distance = 15 + 60 = 75 cm. Wait, let me recalculate: if m = 4 and positive, then dᵢ = 4dₒ. 1/20 = 1/dₒ + 1/(4dₒ) = 5/(4dₒ), so dₒ = 25 cm, dᵢ = 100 cm. Distance = 125 cm.',
    difficulty: 'advanced',
    tags: ['lens-equation', 'magnification', 'object-image-distance']
  },
  {
    questionText: "A projector is required to make a real image, 0.50 m tall, of a 5.0 cm object placed on a slide. Within the projector, the object is to be placed 10.0 cm from the lens. What must be the focal length of the lens?",
    options: [
      { id: 'a', text: '9.1 cm', feedback: 'Correct! Magnification m = 0.50 m / 0.05 m = 10. With dₒ = 10 cm, dᵢ = 10 × 10 = 100 cm. Using 1/f = 1/10 + 1/100 = 11/100, so f = 9.1 cm.' },
      { id: 'b', text: '10.0 cm', feedback: 'Incorrect. This is the object distance, not the focal length.' },
      { id: 'c', text: '8.3 cm', feedback: 'Incorrect. Check your magnification calculation and lens equation.' },
      { id: 'd', text: '11.1 cm', feedback: 'Incorrect. Make sure you\'re calculating the magnification correctly (0.50 m / 0.05 m = 10).' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification: m = hᵢ/hₒ = 0.50 m / 0.05 m = 10. Since m = -dᵢ/dₒ, we have dᵢ = 10 × dₒ = 10 × 10 = 100 cm. Using 1/f = 1/dₒ + 1/dᵢ: 1/f = 1/10 + 1/100 = 10/100 + 1/100 = 11/100. Therefore f = 100/11 = 9.1 cm.',
    difficulty: 'advanced',
    tags: ['projector', 'real-image', 'focal-length-calculation']
  },
  {
    questionText: "A camera lens has a focal length of 6.0 cm and is located 7.0 cm from the film. How far from the lens is the object positioned if a clear image has been produced on the film?",
    options: [
      { id: 'a', text: '42 cm', feedback: 'Correct! Using 1/f = 1/dₒ + 1/dᵢ: 1/6 = 1/dₒ + 1/7. Solving: 1/dₒ = 1/6 - 1/7 = 1/42, so dₒ = 42 cm.' },
      { id: 'b', text: '13 cm', feedback: 'Incorrect. This is close to the sum of focal length and image distance, but that\'s not the correct relationship.' },
      { id: 'c', text: '1.0 cm', feedback: 'Incorrect. This would place the object inside the focal length, which wouldn\'t produce a clear image on the film.' },
      { id: 'd', text: '36 cm', feedback: 'Incorrect. Check your calculation using the lens equation: 1/f = 1/dₒ + 1/dᵢ.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the lens equation: 1/f = 1/dₒ + 1/dᵢ. Substituting known values: 1/6 = 1/dₒ + 1/7. Solving for 1/dₒ: 1/dₒ = 1/6 - 1/7 = 7/42 - 6/42 = 1/42. Therefore dₒ = 42 cm.',
    difficulty: 'intermediate',
    tags: ['camera-lens', 'lens-equation', 'object-distance']
  }
];

// Export the handlers for Firebase Functions
exports.course2_16_l89_question1 = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question2 = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question3 = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question4 = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question5 = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question6 = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question7 = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_16_l89_question8 = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});