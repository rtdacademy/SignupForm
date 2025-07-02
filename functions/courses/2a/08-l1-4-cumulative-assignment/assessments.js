const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

const questions = [
  // Question 1 - Sled and Susan Problem
  {
    questionText: "An empty sled is sliding on frictionless ice when Susan drops vertically from a tree above onto the sled. When she lands, what happens to the sled's speed?",
    options: [
      { id: 'a', text: 'The sled speeds up', feedback: 'Incorrect. Consider conservation of momentum in the horizontal direction.' },
      { id: 'b', text: 'The sled slows down', feedback: 'Correct! The horizontal momentum is conserved, but mass increases, so speed decreases.' },
      { id: 'c', text: 'The sled keeps the same speed', feedback: 'Incorrect. The mass of the system changes while horizontal momentum is conserved.' },
      { id: 'd', text: 'The sled stops completely', feedback: 'Incorrect. The sled retains some horizontal velocity.' }
    ],
    correctOptionId: 'b',
    explanation: 'When Susan drops vertically, she has no horizontal momentum. The horizontal momentum of the system is conserved: m₁v₁ = (m₁ + m₂)vf. Since mass increases, velocity must decrease.',
    difficulty: 'intermediate',
    tags: ['momentum-conservation', 'conceptual']
  },

  // Question 2 - Baseball Hitting Distance
  {
    questionText: "Why can a batter hit a pitched baseball further than a ball tossed in the air by the batter?",
    options: [
      { id: 'a', text: 'The pitched ball has more mass', feedback: 'Incorrect. The mass of the baseball is the same in both cases.' },
      { id: 'b', text: 'The bat moves faster for pitched balls', feedback: 'Incorrect. The bat speed depends on the batter, not the pitch.' },
      { id: 'c', text: 'The relative velocity between bat and ball is greater for a pitched ball', feedback: 'Correct! The pitched ball approaches with high speed, increasing the collision velocity.' },
      { id: 'd', text: 'Gravity affects tossed balls more', feedback: 'Incorrect. Gravity affects both balls equally during the collision.' }
    ],
    correctOptionId: 'c',
    explanation: 'A pitched ball approaches at high speed (e.g., 90 mph), while a tossed ball has minimal speed. The relative velocity at impact is much greater with the pitch, resulting in greater momentum transfer and distance.',
    difficulty: 'intermediate',
    tags: ['collision', 'relative-velocity']
  },

  // Question 3 - Hammer and Nail (Part a: Impulse)
  {
    questionText: "A 12 kg hammer strikes a nail at a velocity of 8.5 m/s and comes to rest in a time interval of 8.0 ms. What is the impulse imparted to the nail?",
    options: [
      { id: 'a', text: '51 kg·m/s', feedback: 'Incorrect. Check your calculation of the change in momentum.' },
      { id: 'b', text: '102 kg·m/s', feedback: 'Correct! Impulse = Δp = m(vf - vi) = 12(0 - 8.5) = -102 kg·m/s (magnitude 102).' },
      { id: 'c', text: '204 kg·m/s', feedback: 'Incorrect. You may have doubled the result incorrectly.' },
      { id: 'd', text: '8.5 kg·m/s', feedback: 'Incorrect. Remember to multiply by the mass.' }
    ],
    correctOptionId: 'b',
    explanation: 'Impulse equals change in momentum: J = Δp = m(vf - vi) = 12 kg × (0 - 8.5 m/s) = -102 kg·m/s. The magnitude is 102 kg·m/s.',
    difficulty: 'beginner',
    tags: ['impulse', 'momentum-change']
  },

  // Question 4 - Hockey Puck (Part b: Final velocity)
  {
    questionText: "A hockey player exerts a force of 30 N on a 0.115 kg puck for 0.16 s. If the puck was initially at rest, what is its final speed?",
    options: [
      { id: 'a', text: '21 m/s', feedback: 'Incorrect. Check your calculation using J = Ft and p = mv.' },
      { id: 'b', text: '42 m/s', feedback: 'Correct! J = Ft = 30 × 0.16 = 4.8 N·s, then v = J/m = 4.8/0.115 = 42 m/s.' },
      { id: 'c', text: '84 m/s', feedback: 'Incorrect. You may have made an error in the calculation.' },
      { id: 'd', text: '4.8 m/s', feedback: 'Incorrect. This is the impulse value, not the velocity.' }
    ],
    correctOptionId: 'b',
    explanation: 'First find impulse: J = Ft = 30 N × 0.16 s = 4.8 N·s. Since J = Δp = mvf - mvi and vi = 0, we get vf = J/m = 4.8/0.115 = 41.7 ≈ 42 m/s.',
    difficulty: 'intermediate',
    tags: ['impulse', 'force', 'velocity']
  },

  // Question 5 - Skier Friction
  {
    questionText: "A constant friction force of 25 N acts on a 65 kg skier for 20 s. What is the skier's change in velocity?",
    options: [
      { id: 'a', text: '-7.69 m/s', feedback: 'Correct! Using impulse-momentum theorem: Δv = Ft/m = (-25 × 20)/65 = -7.69 m/s.' },
      { id: 'b', text: '+7.69 m/s', feedback: 'Incorrect. Friction opposes motion, so the change should be negative.' },
      { id: 'c', text: '-15.4 m/s', feedback: 'Incorrect. Check your calculation of Ft/m.' },
      { id: 'd', text: '-32.5 m/s', feedback: 'Incorrect. Make sure you are dividing by mass, not multiplying.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the impulse-momentum theorem: J = FΔt = Δp = mΔv. Therefore, Δv = FΔt/m = (-25 N × 20 s)/(65 kg) = -7.69 m/s. The negative indicates deceleration.',
    difficulty: 'intermediate',
    tags: ['friction', 'impulse', 'velocity-change']
  },

  // Question 6 - Inelastic Collision (Question 9)
  {
    questionText: "A 50 kg object traveling east at 40 m/s collides and sticks with a 40 kg object traveling east at 20 m/s. What is their final velocity?",
    options: [
      { id: 'a', text: '25.6 m/s east', feedback: 'Incorrect. Check your momentum calculation.' },
      { id: 'b', text: '31.1 m/s east', feedback: 'Correct! p_total = 50(40) + 40(20) = 2800 kg·m/s, vf = 2800/90 = 31.1 m/s.' },
      { id: 'c', text: '35.0 m/s east', feedback: 'Incorrect. Make sure to use the correct total mass.' },
      { id: 'd', text: '30.0 m/s east', feedback: 'Incorrect. This would be a simple average, not conservation of momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'For perfectly inelastic collision: m₁v₁ + m₂v₂ = (m₁ + m₂)vf. So (50)(40) + (40)(20) = (90)vf, giving vf = 2800/90 = 31.1 m/s east.',
    difficulty: 'intermediate',
    tags: ['inelastic-collision', 'momentum-conservation']
  },

  // Question 7 - Rifle Recoil
  {
    questionText: "Calculate the recoil velocity of a 5.0 kg rifle that shoots a 0.020 kg bullet at a speed of 620 m/s.",
    options: [
      { id: 'a', text: '-1.24 m/s', feedback: 'Incorrect. Check your calculation using conservation of momentum.' },
      { id: 'b', text: '-2.48 m/s', feedback: 'Correct! Using momentum conservation: 0 = mbvb + mrvr, so vr = -(0.020 × 620)/5.0 = -2.48 m/s.' },
      { id: 'c', text: '-4.96 m/s', feedback: 'Incorrect. You may have made an arithmetic error.' },
      { id: 'd', text: '-0.62 m/s', feedback: 'Incorrect. Make sure you are using the correct masses.' }
    ],
    correctOptionId: 'b',
    explanation: 'Conservation of momentum: initial momentum = 0. Final: mbulletvbullet + mriflevrifle = 0. So vrifle = -(mbulletvbullet)/mrifle = -(0.020 × 620)/5.0 = -2.48 m/s.',
    difficulty: 'intermediate',
    tags: ['recoil', 'momentum-conservation']
  },

  // Question 8 - Railroad Car Collision (Part a)
  {
    questionText: "A 10,000 kg railroad car traveling at 24.0 m/s strikes an identical car at rest. If the cars lock together, what is their common speed?",
    options: [
      { id: 'a', text: '6.0 m/s', feedback: 'Incorrect. Use conservation of momentum for the collision.' },
      { id: 'b', text: '12.0 m/s', feedback: 'Correct! Momentum before = 10000(24) = 240000. After: 20000v, so v = 12.0 m/s.' },
      { id: 'c', text: '18.0 m/s', feedback: 'Incorrect. Remember both cars have the same final velocity.' },
      { id: 'd', text: '24.0 m/s', feedback: 'Incorrect. This would violate conservation of momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'Conservation of momentum: m₁v₁ᵢ + m₂v₂ᵢ = (m₁ + m₂)vf. So 10000(24) + 10000(0) = 20000vf, giving vf = 240000/20000 = 12.0 m/s.',
    difficulty: 'intermediate',
    tags: ['perfectly-inelastic', 'railroad-cars']
  },

  // Question 9 - Three-Part Explosion
  {
    questionText: "A 100 kg mass explodes into three parts. Part 1 (20 kg) goes north at 50 m/s, part 2 (50 kg) goes west at 35 m/s. If part 3 has mass 30 kg, what is its velocity?",
    options: [
      { id: 'a', text: '66.7 m/s at 30° S of E', feedback: 'Correct! Using momentum conservation in x and y directions gives this result.' },
      { id: 'b', text: '66.7 m/s at 30° N of E', feedback: 'Incorrect. Check the direction - momentum must sum to zero.' },
      { id: 'c', text: '58.3 m/s at 30° S of E', feedback: 'Incorrect. Recalculate using the correct mass for part 3.' },
      { id: 'd', text: '75.0 m/s at 45° S of E', feedback: 'Incorrect. Check both magnitude and angle calculations.' }
    ],
    correctOptionId: 'a',
    explanation: 'Initial momentum = 0. Part 1: py = 1000 kg·m/s north. Part 2: px = -1750 kg·m/s west. Part 3 must have px = +1750 east, py = -1000 south. With m₃ = 30 kg, v = 66.7 m/s at 30° S of E.',
    difficulty: 'advanced',
    tags: ['explosion', 'two-dimensions', 'vectors']
  },

  // Question 10 - Force-Impulse Data Analysis (Question 17)
  {
    questionText: `**Instructions:** The following data relates the mass and change in velocity for various objects having the same impulse over a 3.0 second time interval.

| Mass (kg) | Δv (m/s) |
|-----------|----------|
| 37.5      | 20       |
| 50.0      | 15       |
| 62.5      | 12       |
| 75.3      | 10       |
| 93.8      | 8.0      |
| 125       | 6.0      |

**💡 Hint:** All objects experience the same impulse J = mΔv = FΔt

Find the average force exerted on the objects during the impulse.`,
    options: [
      { id: 'a', text: '125 N', feedback: 'Incorrect. Use F = J/t where J = mΔv for any object in the table.' },
      { id: 'b', text: '250 N', feedback: 'Correct! Using any row: J = mΔv = 50 × 15 = 750 N·s. F = J/t = 750/3.0 = 250 N.' },
      { id: 'c', text: '500 N', feedback: 'Incorrect. Check your calculation of impulse from the table data.' },
      { id: 'd', text: '750 N', feedback: 'Incorrect. This is the impulse value, not the force.' }
    ],
    correctOptionId: 'b',
    explanation: 'Since all objects have the same impulse, use any row to calculate: J = mΔv. Using the 50 kg object: J = 50 × 15 = 750 N·s. Then F = J/t = 750/3.0 = 250 N. You can verify this with any other row.',
    difficulty: 'intermediate',
    tags: ['data-analysis', 'impulse', 'force']
  }
];

// Export the handlers directly for Firebase Functions
exports.course2_08_l14_question1 = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question2 = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question3 = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question4 = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question5 = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question6 = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question7 = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question8 = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question9 = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_08_l14_question10 = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});