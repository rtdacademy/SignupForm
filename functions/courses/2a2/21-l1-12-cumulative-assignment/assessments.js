const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

const questions = [
  // Question 1: Momentum collision
  {
    questionText: "A 2575 kg van runs into the back of a 825 kg car that was at rest. They move off together at 8.5 m/s. What was the initial speed of the van?",
    options: [
      { id: 'a', text: '11 m/s', feedback: 'Correct! Using conservation of momentum: m₁v₁ + m₂v₂ = (m₁ + m₂)vf. Solving: 2575v₁ + 825(0) = (2575 + 825)(8.5), giving v₁ = 11 m/s.' },
      { id: 'b', text: '8.5 m/s', feedback: 'Incorrect. This is the final velocity, not the initial velocity of the van.' },
      { id: 'c', text: '13.2 m/s', feedback: 'Incorrect. Check your calculation using conservation of momentum.' },
      { id: 'd', text: '9.7 m/s', feedback: 'Incorrect. Make sure to use the total mass in the final momentum calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using conservation of momentum: m₁v₁ + m₂v₂ = (m₁ + m₂)vf. Since the car was at rest: 2575v₁ + 0 = (2575 + 825)(8.5) = 28,900. Therefore v₁ = 28,900/2575 = 11 m/s.',
    difficulty: 'intermediate',
    tags: ['momentum', 'collision', 'conservation']
  },
  {
    questionText: "A mass of 50 kg travelling north at 45 m/s collides with a mass of 60 kg travelling west at 50 m/s. If they stick together on contact, what is the resulting velocity of the combined masses?",
    options: [
      { id: 'a', text: '34.1 m/s at 37° N of W', feedback: 'Correct! Using vector momentum conservation: p_north = 2250 kg·m/s, p_west = 3000 kg·m/s. Magnitude = √(2250² + 3000²)/110 = 34.1 m/s. Angle = tan⁻¹(2250/3000) = 37° N of W.' },
      { id: 'b', text: '47.5 m/s at 37° N of W', feedback: 'Incorrect. This is the total momentum magnitude, not the velocity. Remember to divide by total mass.' },
      { id: 'c', text: '34.1 m/s at 53° N of W', feedback: 'Incorrect. Check your angle calculation using tan⁻¹(north component/west component).' },
      { id: 'd', text: '29.8 m/s at 37° N of W', feedback: 'Incorrect. Check your momentum component calculations.' }
    ],
    correctOptionId: 'a',
    explanation: 'Momentum components: North = 50×45 = 2250 kg·m/s, West = 60×50 = 3000 kg·m/s. Total mass = 110 kg. Velocity components: vN = 2250/110 = 20.45 m/s, vW = 3000/110 = 27.27 m/s. Magnitude = √(20.45² + 27.27²) = 34.1 m/s. Angle = tan⁻¹(20.45/27.27) = 37° N of W.',
    difficulty: 'advanced',
    tags: ['momentum', 'two-dimensions', 'vector']
  },
  {
    questionText: "What is the size of the image of a person that is 1.75 m tall and is standing 8 m from a pinhole camera that is 20 cm long?",
    options: [
      { id: 'a', text: '4.4 cm', feedback: 'Correct! Using similar triangles: hᵢ/hₒ = dᵢ/dₒ. So hᵢ = (1.75 m)(0.20 m)/(8 m) = 0.044 m = 4.4 cm.' },
      { id: 'b', text: '2.2 cm', feedback: 'Incorrect. Check your calculation using the pinhole camera formula.' },
      { id: 'c', text: '8.8 cm', feedback: 'Incorrect. Make sure you\'re using the correct units in your calculation.' },
      { id: 'd', text: '3.5 cm', feedback: 'Incorrect. Use the ratio of image distance to object distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a pinhole camera, similar triangles apply: hᵢ/hₒ = dᵢ/dₒ. Where hᵢ = image height, hₒ = object height (1.75 m), dᵢ = camera length (0.20 m), dₒ = object distance (8 m). Therefore: hᵢ = (1.75)(0.20)/8 = 0.044 m = 4.4 cm.',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'similar-triangles', 'optics']
  },
  {
    questionText: "Two mirrors meet at a 135° angle. If light rays strike one mirror at 40°, at what angle do they leave the second mirror?",
    options: [
      { id: 'a', text: '5°', feedback: 'Correct! The deviation angle is 2(180° - α) = 2(180° - 135°) = 90°. Since the ray enters at 40° to the normal, it leaves at 90° - 40° - 45° = 5° to the normal.' },
      { id: 'b', text: '40°', feedback: 'Incorrect. The angle changes due to the mirror geometry.' },
      { id: 'c', text: '45°', feedback: 'Incorrect. This would be true for perpendicular mirrors, but these meet at 135°.' },
      { id: 'd', text: '85°', feedback: 'Incorrect. Check the geometry of the two-mirror system.' }
    ],
    correctOptionId: 'a',
    explanation: 'For two plane mirrors at angle α, the total deviation is 2(180° - α). Here: deviation = 2(180° - 135°) = 90°. The ray reflects off the first mirror at 40°, then off the second. The exit angle can be calculated using geometry: 5° to the normal.',
    difficulty: 'advanced',
    tags: ['reflection', 'two-mirrors', 'geometry']
  },
  {
    questionText: "An external rearview car mirror is convex with a radius of curvature of 16.0 m. Determine the location of the image and its magnification for an object 10.0 m from the mirror.",
    options: [
      { id: 'a', text: '–4.44 m, 0.44', feedback: 'Correct! For convex mirror: f = -R/2 = -8.0 m. Using 1/f = 1/dₒ + 1/dᵢ: 1/(-8) = 1/10 + 1/dᵢ, giving dᵢ = -4.44 m. Magnification m = -dᵢ/dₒ = 4.44/10 = 0.44.' },
      { id: 'b', text: '4.44 m, 0.44', feedback: 'Incorrect. The image distance should be negative for a convex mirror (virtual image).' },
      { id: 'c', text: '–4.44 m, –0.44', feedback: 'Incorrect. The magnification should be positive for an upright image in a convex mirror.' },
      { id: 'd', text: '–8.0 m, 0.80', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a convex mirror: f = -R/2 = -16.0/2 = -8.0 m. Using mirror equation: 1/f = 1/dₒ + 1/dᵢ. Substituting: 1/(-8) = 1/10 + 1/dᵢ. Solving: 1/dᵢ = -1/8 - 1/10 = -9/40, so dᵢ = -4.44 m. Magnification: m = -dᵢ/dₒ = -(-4.44)/10 = 0.44.',
    difficulty: 'advanced',
    tags: ['convex-mirror', 'mirror-equation', 'magnification']
  },
  {
    questionText: "A beam of light is emitted 8.0 cm beneath the surface of a liquid and strikes the surface 7.0 cm from the point directly above the source. If total internal reflection occurs, what is the index of refraction of the liquid?",
    options: [
      { id: 'a', text: '1.52', feedback: 'Correct! At the critical angle: sin(θc) = 1/n. The angle is θc = tan⁻¹(7.0/8.0) = 41.2°. Therefore n = 1/sin(41.2°) = 1.52.' },
      { id: 'b', text: '1.33', feedback: 'Incorrect. This is the refractive index of water, but the calculation gives a different value.' },
      { id: 'c', text: '1.41', feedback: 'Incorrect. Check your trigonometry and critical angle calculation.' },
      { id: 'd', text: '1.67', feedback: 'Incorrect. Make sure you\'re using the correct angle in the critical angle formula.' }
    ],
    correctOptionId: 'a',
    explanation: 'The critical angle occurs when light just begins to undergo total internal reflection. The angle to the normal is θc = tan⁻¹(7.0/8.0) = 41.2°. At the critical angle: sin(θc) = n₂/n₁ = 1/n (where n₂ = 1 for air). Therefore: n = 1/sin(41.2°) = 1/0.658 = 1.52.',
    difficulty: 'advanced',
    tags: ['total-internal-reflection', 'critical-angle', 'refractive-index']
  },
  {
    questionText: "A slide containing two slits 0.10 mm apart is 3.20 m from the viewing screen. Light of wavelength 500 nm falls on the slits from a distant source. How far from the centre line will the 9th bright fringe be? How many bright fringes are possible?",
    options: [
      { id: 'a', text: '0.144 m, 200', feedback: 'Correct! Distance to 9th fringe: y = nλL/d = 9×500×10⁻⁹×3.20/0.10×10⁻³ = 0.144 m. Maximum fringes: nmax = d/λ = 0.10×10⁻³/500×10⁻⁹ = 200.' },
      { id: 'b', text: '0.016 m, 200', feedback: 'Incorrect. This would be the first bright fringe distance. Multiply by 9 for the 9th fringe.' },
      { id: 'c', text: '0.144 m, 100', feedback: 'Incorrect. Check your calculation for the maximum number of fringes.' },
      { id: 'd', text: '0.288 m, 200', feedback: 'Incorrect. Check your calculation for the fringe position.' }
    ],
    correctOptionId: 'a',
    explanation: 'For Young\'s double slit: y = nλL/d. For 9th bright fringe: y = 9×500×10⁻⁹×3.20/0.10×10⁻³ = 0.144 m. Maximum number of bright fringes occurs when sin θ = 1, so nmax = d/λ = 0.10×10⁻³/500×10⁻⁹ = 200 fringes on each side of center.',
    difficulty: 'advanced',
    tags: ['double-slit', 'interference', 'wavelength']
  },
  {
    questionText: "In Young's experiment, the two slits are 0.04 mm apart and the screen is located 2.0 m away. The third order bright fringe is displaced 8.3 cm from the central fringe. What is the frequency of the monochromatic light?",
    options: [
      { id: 'a', text: '5.4 × 10¹⁴ Hz', feedback: 'Correct! From y = nλL/d: λ = yd/nL = (0.083)(0.04×10⁻³)/(3)(2.0) = 5.53×10⁻⁷ m. Then f = c/λ = 3×10⁸/5.53×10⁻⁷ = 5.4×10¹⁴ Hz.' },
      { id: 'b', text: '3.6 × 10¹⁴ Hz', feedback: 'Incorrect. Check your wavelength calculation from the fringe position data.' },
      { id: 'c', text: '6.2 × 10¹⁴ Hz', feedback: 'Incorrect. Make sure you\'re using the correct fringe order (n = 3).' },
      { id: 'd', text: '4.8 × 10¹⁴ Hz', feedback: 'Incorrect. Verify your calculation of frequency from wavelength.' }
    ],
    correctOptionId: 'a',
    explanation: 'From double-slit formula: y = nλL/d. Solving for wavelength: λ = yd/(nL) = (0.083 m)(0.04×10⁻³ m)/[(3)(2.0 m)] = 5.53×10⁻⁷ m. Frequency: f = c/λ = 3.00×10⁸/5.53×10⁻⁷ = 5.4×10¹⁴ Hz.',
    difficulty: 'advanced',
    tags: ['double-slit', 'frequency', 'wavelength-calculation']
  },
  {
    questionText: "At what angle is the third maximum for 700 nm light going through a 2000 line/cm diffraction grating?",
    options: [
      { id: 'a', text: '24.8°', feedback: 'Correct! Grating spacing d = 1/(2000 lines/cm) = 5.0×10⁻⁶ m. Using dsinθ = nλ: sinθ = nλ/d = 3×700×10⁻⁹/5.0×10⁻⁶ = 0.42. Therefore θ = 24.8°.' },
      { id: 'b', text: '8.1°', feedback: 'Incorrect. This would be the first maximum. Remember to use n = 3 for the third maximum.' },
      { id: 'c', text: '41.8°', feedback: 'Incorrect. Check your calculation of the grating spacing.' },
      { id: 'd', text: '16.3°', feedback: 'Incorrect. This would be the second maximum.' }
    ],
    correctOptionId: 'a',
    explanation: 'Grating spacing: d = 1/(2000 lines/cm) = 1/(2×10⁵ lines/m) = 5.0×10⁻⁶ m. For diffraction grating: dsinθ = nλ. For third maximum (n = 3): sinθ = 3×700×10⁻⁹/5.0×10⁻⁶ = 0.42. Therefore θ = sin⁻¹(0.42) = 24.8°.',
    difficulty: 'intermediate',
    tags: ['diffraction-grating', 'interference', 'angle-calculation']
  },
  {
    questionText: "In an interference experiment, red light with a wavelength of 6.00 × 10⁻⁷ m passes through a diffraction grating. On a screen 1.50 m away, the distance to the second antinode is 0.463 m. How many lines/cm have been etched into the diffraction grating?",
    options: [
      { id: 'a', text: '2.57 × 10³ lines/cm', feedback: 'Correct! From geometry: sinθ = y/√(L² + y²) = 0.463/√(1.50² + 0.463²) = 0.294. Using dsinθ = nλ with n = 2: d = 2λ/sinθ = 2×6.00×10⁻⁷/0.294 = 4.08×10⁻⁶ m. Lines/cm = 1/d = 2450 lines/cm ≈ 2.57×10³ lines/cm.' },
      { id: 'b', text: '1.67 × 10³ lines/cm', feedback: 'Incorrect. Make sure you\'re using n = 2 for the second antinode.' },
      { id: 'c', text: '3.85 × 10³ lines/cm', feedback: 'Incorrect. Check your angle calculation using the correct geometry.' },
      { id: 'd', text: '1.25 × 10³ lines/cm', feedback: 'Incorrect. Verify your wavelength and distance values in the calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find the angle: sinθ = y/√(L² + y²) = 0.463/√(1.50² + 0.463²) = 0.294. For second antinode (n = 2): dsinθ = nλ, so d = nλ/sinθ = 2×6.00×10⁻⁷/0.294 = 4.08×10⁻⁶ m. Lines per meter = 1/d = 245,000 lines/m = 2450 lines/cm = 2.57×10³ lines/cm.',
    difficulty: 'advanced',
    tags: ['diffraction-grating', 'lines-per-cm', 'geometry']
  }
];

// Export the handlers for Firebase Functions
exports.course2_21_l112_question1 = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question2 = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question3 = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question4 = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question5 = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question6 = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question7 = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question8 = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question9 = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_21_l112_question10 = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});