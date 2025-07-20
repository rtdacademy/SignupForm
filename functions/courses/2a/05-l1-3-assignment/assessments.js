const questions = [
  // Lesson 1 Questions
  {
    questionText: "A 0.25 kg ball travelling east at 4.5 m/s collides with a 0.30 kg steel ball travelling west at 5.0 m/s. After the collision the 0.30 kg ball is travelling east with a speed of 0.40 m/s. What is the final velocity of the 0.25 kg ball?",
    options: [
      { id: 'a', text: '1.98 m/s east', feedback: 'Incorrect. Check the direction - the ball changes direction after the collision.' },
      { id: 'b', text: '1.98 m/s west', feedback: 'Correct! Using conservation of momentum, the 0.25 kg ball moves west after the collision.' },
      { id: 'c', text: '2.45 m/s east', feedback: 'Incorrect. Remember to account for the direction change and use conservation of momentum.' },
      { id: 'd', text: '2.45 m/s west', feedback: 'Incorrect. Check your calculation using m₁v₁ᵢ + m₂v₂ᵢ = m₁v₁f + m₂v₂f.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using conservation of momentum: (0.25)(4.5) + (0.30)(-5.0) = (0.25)(v₁f) + (0.30)(0.40). Solving: 1.125 - 1.5 = 0.25v₁f + 0.12, which gives v₁f = -1.98 m/s (west).',
    difficulty: 'intermediate',
    tags: ['momentum', 'collision', 'one-dimension']
  },
  {
    questionText: "A freight train is being assembled in a switching yard. Boxcar #1 has a mass of 6.4 x 10⁴ kg and moves with a velocity of +0.80 m/s. Boxcar #2, with a mass of 9.2 x 10⁴ kg and a velocity of +1.2 m/s, overtakes Boxcar #1 and couples with it. Neglecting friction, find the common velocity of the two cars after they have coupled.",
    options: [
      { id: 'a', text: '+0.90 m/s', feedback: 'Incorrect. Make sure you are using the correct masses in your calculation.' },
      { id: 'b', text: '+1.0 m/s', feedback: 'Correct! This is a perfectly inelastic collision where the cars stick together.' },
      { id: 'c', text: '+1.1 m/s', feedback: 'Incorrect. Remember to use the total mass in the denominator.' },
      { id: 'd', text: '+0.95 m/s', feedback: 'Incorrect. Check your arithmetic when calculating total momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'For a perfectly inelastic collision: m₁v₁ + m₂v₂ = (m₁ + m₂)vf. Substituting: (6.4×10⁴)(0.80) + (9.2×10⁴)(1.2) = (15.6×10⁴)vf. This gives vf = +1.0 m/s.',
    difficulty: 'intermediate',
    tags: ['momentum', 'inelastic-collision', 'coupling']
  },
  {
    questionText: "Starting from rest, two skaters \"push off\" against each other on smooth, level ice. One is a woman (m = 54 kg) and the other is a man (m = 88 kg). After pushing off, the woman moves away with a velocity of +2.5 m/s. Find the recoil velocity of the man.",
    options: [
      { id: 'a', text: '-1.5 m/s', feedback: 'Correct! The negative sign indicates the man moves in the opposite direction to the woman.' },
      { id: 'b', text: '+1.5 m/s', feedback: 'Incorrect. The man must move in the opposite direction to conserve momentum.' },
      { id: 'c', text: '-2.0 m/s', feedback: 'Incorrect. Check your calculation using the mass ratio.' },
      { id: 'd', text: '-1.0 m/s', feedback: 'Incorrect. Make sure you are using the correct masses in your calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Starting from rest, total initial momentum is zero. By conservation of momentum: 0 = m₁v₁ + m₂v₂. So (54)(2.5) + (88)(v₂) = 0, giving v₂ = -1.5 m/s.',
    difficulty: 'beginner',
    tags: ['momentum', 'recoil', 'conservation']
  },

  // Lesson 2 Questions
  {
    questionText: "A 4.0 kg object is traveling south at 2.8 m/s when it collides with a 6.0 kg object traveling east at 3.0 m/s. If the two objects collide and stick together, what is the final velocity of the masses?",
    options: [
      { id: 'a', text: '2.1 m/s [32° E of S]', feedback: 'Incorrect. Check your angle calculation using the momentum components.' },
      { id: 'b', text: '2.1 m/s [58° E of S]', feedback: 'Correct! This is found using vector addition of momentum components.' },
      { id: 'c', text: '1.8 m/s [58° E of S]', feedback: 'Incorrect. Make sure you calculated the magnitude correctly.' },
      { id: 'd', text: '2.1 m/s [58° S of E]', feedback: 'Incorrect. Be careful with angle reference - the angle is measured from south.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using vector momentum: px = (6.0)(3.0) = 18 kg·m/s east, py = (4.0)(-2.8) = -11.2 kg·m/s south. Total mass = 10 kg. vx = 1.8 m/s, vy = -1.12 m/s. Magnitude = 2.1 m/s, angle = tan⁻¹(1.8/1.12) = 58° E of S.',
    difficulty: 'intermediate',
    tags: ['momentum', 'two-dimensions', 'vector']
  },
  {
    questionText: "A 100 kg mass traveling west at 25 m/s collides with an 80 kg mass traveling east at 20 m/s. After an inelastic collision, the 100 kg mass moves away at 9.5 m/s at 28° south of west. What is the final velocity of the 80 kg mass?",
    options: [
      { id: 'a', text: '5.63 m/s [7.8° W of N]', feedback: 'Correct! This is found by applying conservation of momentum in both x and y directions.' },
      { id: 'b', text: '5.63 m/s [7.8° N of W]', feedback: 'Incorrect. Check your angle reference - the primary direction is north.' },
      { id: 'c', text: '6.20 m/s [7.8° W of N]', feedback: 'Incorrect. Recalculate the magnitude using both momentum components.' },
      { id: 'd', text: '5.63 m/s [82.2° N of W]', feedback: 'Incorrect. This is the complement of the correct angle.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using conservation of momentum in x and y directions separately. Initial: px = -2500 + 1600 = -900 kg·m/s. Final for 100 kg: px = -838 kg·m/s, py = -447 kg·m/s. Solving for 80 kg mass gives 5.63 m/s at 7.8° W of N.',
    difficulty: 'advanced',
    tags: ['momentum', 'two-dimensions', 'angles']
  },
  {
    questionText: "A Canada Day rocket (mass = 25.0 kg) is moving at a speed of 50.0 m/s to the right. The rocket suddenly breaks into two pieces (11.0 kg and 14.0 kg) and they fly away from each other. If the velocity of the 11.0 kg piece is 77.8 m/s @ 30° to the horizontal, what is the velocity of the 14.0 kg piece?",
    options: [
      { id: 'a', text: '47.5 m/s @ 40.1° below the horizontal', feedback: 'Correct! Conservation of momentum in both components gives this result.' },
      { id: 'b', text: '47.5 m/s @ 40.1° above the horizontal', feedback: 'Incorrect. Check the y-component - it should be negative (downward).' },
      { id: 'c', text: '52.3 m/s @ 40.1° below the horizontal', feedback: 'Incorrect. Recalculate the magnitude using both momentum components.' },
      { id: 'd', text: '47.5 m/s @ 49.9° below the horizontal', feedback: 'Incorrect. Check your angle calculation using arctan.' }
    ],
    correctOptionId: 'a',
    explanation: 'Initial momentum: px = 1250 kg·m/s, py = 0. For 11 kg piece: px = 674 kg·m/s, py = 428 kg·m/s. For 14 kg piece: px = 576 kg·m/s, py = -428 kg·m/s. This gives v = 47.5 m/s at 40.1° below horizontal.',
    difficulty: 'advanced',
    tags: ['momentum', 'explosion', 'two-dimensions']
  },

  // Lesson 3 Questions
  {
    questionText: "A 2.5 kg object is initially moving north at 5.00 m/s. If it is brought to a stop in 0.75 s, what is the impulse?",
    options: [
      { id: 'a', text: '12.5 N·s south', feedback: 'Correct! Impulse equals change in momentum, and the direction is opposite to initial motion.' },
      { id: 'b', text: '12.5 N·s north', feedback: 'Incorrect. The impulse must be opposite to the initial motion to stop the object.' },
      { id: 'c', text: '9.38 N·s south', feedback: 'Incorrect. Use impulse = Δp = m(vf - vi), not force × time.' },
      { id: 'd', text: '16.7 N·s south', feedback: 'Incorrect. Check your calculation of the change in momentum.' }
    ],
    correctOptionId: 'a',
    explanation: 'Impulse = Δp = m(vf - vi) = 2.5(0 - 5.00) = -12.5 kg·m/s = 12.5 N·s south. The negative indicates the impulse is opposite to the initial motion.',
    difficulty: 'beginner',
    tags: ['impulse', 'momentum-change']
  },
  {
    questionText: "A 75 kg person falls from a height of 2.0 m and lands on a bed. What is the momentum just before landing, and what is the impulse delivered by the bed to stop the person? (Use g = 9.8 m/s²)",
    options: [
      { id: 'a', text: 'Momentum: 469 kg·m/s downward, Impulse: 469 N·s upward', feedback: 'Correct! The bed delivers an upward impulse equal in magnitude to the downward momentum.' },
      { id: 'b', text: 'Momentum: 469 kg·m/s downward, Impulse: 469 N·s downward', feedback: 'Incorrect. The impulse must be upward to stop downward motion.' },
      { id: 'c', text: 'Momentum: 1470 kg·m/s downward, Impulse: 1470 N·s upward', feedback: 'Incorrect. Check your velocity calculation using v² = 2gh.' },
      { id: 'd', text: 'Momentum: 235 kg·m/s downward, Impulse: 235 N·s upward', feedback: 'Incorrect. Recalculate the velocity from the fall height.' }
    ],
    correctOptionId: 'a',
    explanation: 'Velocity before landing: v = √(2gh) = √(2×9.8×2.0) = 6.26 m/s. Momentum = mv = 75×6.26 = 469 kg·m/s downward. To stop, impulse = 469 N·s upward. Units: N·s = kg·m/s.',
    difficulty: 'intermediate',
    tags: ['impulse', 'free-fall', 'momentum']
  },

  // Conceptual Questions
  {
    questionText: "Which of the following quantities is conserved in the absence of external forces?",
    options: [
      { id: 'a', text: 'Kinetic energy', feedback: 'Incorrect. Kinetic energy is only conserved in elastic collisions.' },
      { id: 'b', text: 'Potential energy', feedback: 'Incorrect. Potential energy can convert to other forms.' },
      { id: 'c', text: 'Momentum', feedback: 'Correct! Momentum is always conserved in isolated systems.' },
      { id: 'd', text: 'Impulse', feedback: 'Incorrect. Impulse is the change in momentum, not a conserved quantity.' }
    ],
    correctOptionId: 'c',
    explanation: 'Momentum is always conserved in the absence of external forces. This is a fundamental law of physics that applies to all isolated systems.',
    difficulty: 'beginner',
    tags: ['conservation', 'momentum', 'conceptual']
  },
  {
    questionText: "A large truck and a small car collide head-on and stick together. Which has the greater change in momentum?",
    options: [
      { id: 'a', text: 'The truck', feedback: 'Incorrect. Newton\'s third law requires equal and opposite momentum changes.' },
      { id: 'b', text: 'The car', feedback: 'Incorrect. The momentum changes must be equal in magnitude.' },
      { id: 'c', text: 'Both have equal change in momentum', feedback: 'Correct! By Newton\'s third law, the momentum changes are equal and opposite.' },
      { id: 'd', text: 'It depends on their speeds', feedback: 'Incorrect. The momentum changes are always equal regardless of initial speeds.' }
    ],
    correctOptionId: 'c',
    explanation: 'By Newton\'s third law, the forces between the truck and car are equal and opposite. Since impulse = FΔt, and they experience forces for the same time, their momentum changes are equal and opposite.',
    difficulty: 'intermediate',
    tags: ['momentum', 'collision', 'Newton-third-law']
  },
  {
    questionText: "The area under a force-time graph represents...",
    options: [
      { id: 'a', text: 'Acceleration', feedback: 'Incorrect. Acceleration is related to force divided by mass.' },
      { id: 'b', text: 'Velocity', feedback: 'Incorrect. Velocity is not directly given by a force-time graph.' },
      { id: 'c', text: 'Impulse', feedback: 'Correct! Impulse = ∫F dt, which is the area under the F-t curve.' },
      { id: 'd', text: 'Momentum', feedback: 'Incorrect. The area gives impulse, which equals the change in momentum.' }
    ],
    correctOptionId: 'c',
    explanation: 'Impulse is defined as J = ∫F dt, which mathematically represents the area under a force-time graph. This impulse equals the change in momentum.',
    difficulty: 'intermediate',
    tags: ['impulse', 'graphs', 'conceptual']
  },
  {
    questionText: "If the momentum of an object doubles, what must have happened to either its mass or velocity?",
    options: [
      { id: 'a', text: 'Mass or velocity was halved', feedback: 'Incorrect. This would decrease momentum, not increase it.' },
      { id: 'b', text: 'Mass and velocity both doubled', feedback: 'Incorrect. This would quadruple the momentum (p = mv).' },
      { id: 'c', text: 'Either mass or velocity doubled', feedback: 'Correct! Since p = mv, doubling either m or v doubles the momentum.' },
      { id: 'd', text: 'Mass or velocity stayed the same', feedback: 'Incorrect. The momentum cannot double if both mass and velocity remain constant.' }
    ],
    correctOptionId: 'c',
    explanation: 'Since momentum p = mv, if p doubles, then either m doubled (with v constant), v doubled (with m constant), or some combination where the product mv doubles.',
    difficulty: 'beginner',
    tags: ['momentum', 'relationships', 'conceptual']
  }
];

// Only export assessment configurations for master function
const assessmentConfigs = {
  'course2_05_l13_question1': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question2': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question3': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question4': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question5': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question6': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question7': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question8': {
    questions: [questions[7]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question9': {
    questions: [questions[8]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question10': {
    questions: [questions[9]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question11': {
    questions: [questions[10]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_05_l13_question12': {
    questions: [questions[11]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;
