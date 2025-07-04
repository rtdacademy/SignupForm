/**
 * Assessment Functions for Unit 1 Review - Momentum and Impulse
 * Course: 2 (Physics 30)
 * Content: 22-unit-1-review
 * 
 * This module provides individual standard multiple choice assessments for the
 * slideshow knowledge check frontend component.
 */

const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ===== UNIT 1 REVIEW QUESTIONS =====

// Assessment configurations for the master function
const assessmentConfigs = {
  'course2_22_unit1_q1a': {
  questions: [{
    questionText: "An empty sled is sliding on frictionless ice when Susan drops vertically from a tree above onto the sled. When she lands, does the sled speed up, slow down, or keep the same speed?",
    options: [
      { id: 'a', text: 'The sled speeds up', feedback: 'Incorrect. Consider conservation of momentum in the horizontal direction.' },
      { id: 'b', text: 'The sled slows down', feedback: 'Correct! The horizontal momentum is conserved, but mass increases, so speed decreases.' },
      { id: 'c', text: 'The sled keeps the same speed', feedback: 'Incorrect. The mass of the system changes while horizontal momentum is conserved.' },
      { id: 'd', text: 'The sled stops completely', feedback: 'Incorrect. The sled retains some horizontal velocity.' }
    ],
    correctOptionId: 'b',
    explanation: 'When Susan drops vertically, she has no horizontal momentum. The horizontal momentum of the system is conserved: m₁v₁ = (m₁ + m₂)vf. Since mass increases while momentum stays constant, velocity must decrease.',
    difficulty: 'intermediate',
    tags: ['momentum-conservation', 'conceptual']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
  },
  'course2_22_unit1_q1b': {
  questions: [{
    questionText: "Later, Susan falls sideways off the sled. When she drops off, does the sled speed up, slow down, or keep the same speed?",
    options: [
      { id: 'a', text: 'The sled speeds up', feedback: 'Correct! When Susan falls off sideways, momentum is conserved but mass decreases, so velocity increases.' },
      { id: 'b', text: 'The sled slows down', feedback: 'Incorrect. Consider what happens when mass decreases while momentum is conserved.' },
      { id: 'c', text: 'The sled keeps the same speed', feedback: 'Incorrect. The mass of the system changes while momentum is conserved.' },
      { id: 'd', text: 'The sled stops completely', feedback: 'Incorrect. Momentum is conserved when Susan falls off.' }
    ],
    correctOptionId: 'a',
    explanation: 'When Susan falls off sideways, momentum is conserved. The sled\'s momentum remains the same, but its mass decreases, so by p = mv, the velocity must increase.',
    difficulty: 'intermediate',
    tags: ['momentum-conservation', 'conceptual']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
  },
  'course2_22_unit1_q2': {
  questions: [{
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
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
  },
  'course2_22_unit1_q3a': {
  questions: [{
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
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 3b: Hammer and nail - force
  },
  'course2_22_unit1_q3b': {
  questions: [{
    questionText: "A 12 kg hammer strikes a nail at 8.5 m/s and stops in 8.0 ms. What is the average force acting on the nail?",
    options: [
      { id: 'a', text: '6375 N', feedback: 'Incorrect. Check your calculation using F = J/Δt.' },
      { id: 'b', text: '12750 N', feedback: 'Correct! Using F = J/Δt = 102 kg·m/s ÷ 0.008 s = 12,750 N.' },
      { id: 'c', text: '25500 N', feedback: 'Incorrect. You may have made an error in unit conversion.' },
      { id: 'd', text: '1275 N', feedback: 'Incorrect. Check your time unit conversion from ms to s.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using F = J/Δt, where J = 102 kg·m/s and Δt = 8.0 ms = 0.008 s. Therefore F = 102/0.008 = 12,750 N.',
    difficulty: 'intermediate',
    tags: ['force', 'impulse']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 4a: Hockey puck - impulse
  },
  'course2_22_unit1_q4a': {
  questions: [{
    questionText: "A hockey player makes a slap shot, exerting a force of 30 N on the hockey puck for 0.16 seconds. What impulse is given to the puck?",
    options: [
      { id: 'a', text: '2.4 N·s', feedback: 'Incorrect. Check your multiplication: F × t.' },
      { id: 'b', text: '4.8 N·s', feedback: 'Correct! Impulse J = FΔt = 30 N × 0.16 s = 4.8 N·s.' },
      { id: 'c', text: '9.6 N·s', feedback: 'Incorrect. You may have doubled the correct result.' },
      { id: 'd', text: '1.2 N·s', feedback: 'Incorrect. Check your calculation of F × t.' }
    ],
    correctOptionId: 'b',
    explanation: 'Impulse J = FΔt = 30 N × 0.16 s = 4.8 N·s.',
    difficulty: 'beginner',
    tags: ['impulse', 'force']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 4b: Hockey puck - velocity
  },
  'course2_22_unit1_q4b': {
  questions: [{
    questionText: "If the hockey puck has a mass of 0.115 kg and was at rest before the shot (impulse = 4.8 N·s), what speed does it head towards the net?",
    options: [
      { id: 'a', text: '21 m/s', feedback: 'Incorrect. Check your calculation using J = Δp = mvf - mvi.' },
      { id: 'b', text: '42 m/s', feedback: 'Correct! Using J = mvf - mvi, and since vi = 0: vf = J/m = 4.8/0.115 = 41.7 ≈ 42 m/s.' },
      { id: 'c', text: '84 m/s', feedback: 'Incorrect. You may have made an error in the calculation.' },
      { id: 'd', text: '4.8 m/s', feedback: 'Incorrect. This is the impulse value, not the velocity.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using J = Δp = mvf - mvi, and since vi = 0: vf = J/m = 4.8 N·s / 0.115 kg = 41.7 ≈ 42 m/s.',
    difficulty: 'intermediate',
    tags: ['impulse', 'velocity']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 5: Skier friction
  },
  'course2_22_unit1_q5': {
  questions: [{
    questionText: "A constant friction force of 25 N acts on a 65 kg skier for 20 s. What is the skier's change in velocity?",
    options: [
      { id: 'a', text: '–7.69 m/s', feedback: 'Correct! Using impulse-momentum theorem: Δv = FΔt/m = (-25 × 20)/65 = -7.69 m/s.' },
      { id: 'b', text: '+7.69 m/s', feedback: 'Incorrect. Friction opposes motion, so the change should be negative.' },
      { id: 'c', text: '–15.4 m/s', feedback: 'Incorrect. Check your calculation of FΔt/m.' },
      { id: 'd', text: '–32.5 m/s', feedback: 'Incorrect. Make sure you are dividing by mass, not multiplying.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the impulse-momentum theorem: Δv = FΔt/m = (-25 N × 20 s)/(65 kg) = -7.69 m/s. The negative indicates deceleration.',
    difficulty: 'intermediate',
    tags: ['friction', 'impulse', 'velocity-change']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 6: Tennis ball force
  },
  'course2_22_unit1_q6': {
  questions: [{
    questionText: "For a top tennis player, a tennis ball may leave the racket on the serve with a speed of 55 m/s. If the ball has a mass of 0.060 kg and is in contact with the racket for about 4.0 ms, estimate the average force of the ball. Would this force be large enough to lift a 60 kg person?",
    options: [
      { id: 'a', text: '412 N, not enough to lift a 60 kg person', feedback: 'Incorrect. Check your calculation of F = Δp/Δt.' },
      { id: 'b', text: '825 N, enough to lift a 60 kg person', feedback: 'Correct! F = Δp/Δt = (0.060 × 55)/(0.004) = 825 N. To lift 60 kg needs 588 N, so 825 N is enough.' },
      { id: 'c', text: '1650 N, enough to lift a 60 kg person', feedback: 'Incorrect. You may have made an error in the momentum calculation.' },
      { id: 'd', text: '275 N, not enough to lift a 60 kg person', feedback: 'Incorrect. Check your time conversion from ms to s.' }
    ],
    correctOptionId: 'b',
    explanation: 'F = Δp/Δt = (0.060 × 55)/(0.004) = 825 N. To lift 60 kg person needs F = mg = 60 × 9.8 = 588 N. Since 825 > 588, it\'s enough.',
    difficulty: 'intermediate',
    tags: ['force', 'impulse', 'applications']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 7: Water force
  },
  'course2_22_unit1_q7': {
  questions: [{
    questionText: "Water leaves a hose at a rate of 1.5 kg/s with a speed of 20 m/s and is aimed at the side of a car, which stops it. (That is, we ignore any splashing back). What is the force exerted by the water on the car?",
    options: [
      { id: 'a', text: '–15 N', feedback: 'Incorrect. Check your calculation of (dm/dt) × Δv.' },
      { id: 'b', text: '–30 N', feedback: 'Correct! Force = rate of momentum change = (dm/dt) × Δv = 1.5 kg/s × (0 - 20 m/s) = -30 N.' },
      { id: 'c', text: '–45 N', feedback: 'Incorrect. Make sure you use the correct flow rate and velocity change.' },
      { id: 'd', text: '–60 N', feedback: 'Incorrect. Check your multiplication of flow rate and velocity change.' }
    ],
    correctOptionId: 'b',
    explanation: 'Force = rate of momentum change = (dm/dt) × Δv = 1.5 kg/s × (0 - 20 m/s) = -30 N. The negative indicates force opposing motion.',
    difficulty: 'intermediate',
    tags: ['force', 'momentum-rate', 'fluid-mechanics']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 8: Impulse concept
  },
  'course2_22_unit1_q8': {
  questions: [{
    questionText: "Is it possible for an object to receive a larger impulse from a small force than from a large force? Explain.",
    options: [
      { id: 'a', text: 'No, impulse is always proportional to force', feedback: 'Incorrect. Consider the time factor in the impulse formula.' },
      { id: 'b', text: 'Yes, if the small force acts for a much longer time', feedback: 'Correct! Since impulse J = FΔt, a small force over a long time can exceed a large force over a short time.' },
      { id: 'c', text: 'No, larger forces always create larger impulses', feedback: 'Incorrect. Time is also a factor in determining impulse.' },
      { id: 'd', text: 'Yes, but only in collisions', feedback: 'Incorrect. This principle applies to all situations, not just collisions.' }
    ],
    correctOptionId: 'b',
    explanation: 'Since impulse J = FΔt, a small force acting for a long time can produce a larger impulse than a large force acting for a short time.',
    difficulty: 'intermediate',
    tags: ['impulse', 'conceptual', 'time']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 9a: Inelastic collision - velocity
  },
  'course2_22_unit1_q9a': {
  questions: [{
    questionText: "An object travelling east at 40 m/s and having a mass of 50 kg collides with an object with a mass of 40 kg and travelling east at 20 m/s. If they stick together on contact, what is the resultant velocity of the combined mass?",
    options: [
      { id: 'a', text: '25.6 m/s east', feedback: 'Incorrect. Check your momentum calculation.' },
      { id: 'b', text: '31.1 m/s east', feedback: 'Correct! Conservation of momentum: (50)(40) + (40)(20) = (90)vf. So vf = 2800/90 = 31.1 m/s east.' },
      { id: 'c', text: '35.0 m/s east', feedback: 'Incorrect. Make sure to use the correct total mass.' },
      { id: 'd', text: '30.0 m/s east', feedback: 'Incorrect. This would be a simple average, not conservation of momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'Conservation of momentum: (50)(40) + (40)(20) = (90)vf. So vf = 2800/90 = 31.1 m/s east.',
    difficulty: 'intermediate',
    tags: ['inelastic-collision', 'momentum-conservation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 9b: Kinetic energy
  },
  'course2_22_unit1_q9b': {
  questions: [{
    questionText: "From the previous collision (combined mass of 90 kg moving at 31.1 m/s), what is the kinetic energy of the combined mass?",
    options: [
      { id: 'a', text: '21.8 kJ', feedback: 'Incorrect. Check your calculation of KE = ½mv².' },
      { id: 'b', text: '43.5 kJ', feedback: 'Correct! KE = ½mv² = ½(90 kg)(31.1 m/s)² = ½(90)(968.21) = 43,569 J ≈ 43.5 kJ.' },
      { id: 'c', text: '87.0 kJ', feedback: 'Incorrect. You may have forgotten the ½ factor in the kinetic energy formula.' },
      { id: 'd', text: '174 kJ', feedback: 'Incorrect. Check your calculation and unit conversion.' }
    ],
    correctOptionId: 'b',
    explanation: 'KE = ½mv² = ½(90 kg)(31.1 m/s)² = ½(90)(968.21) = 43,569 J ≈ 43.5 kJ.',
    difficulty: 'intermediate',
    tags: ['kinetic-energy', 'collision']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 10: Complex collision
  },
  'course2_22_unit1_q10': {
  questions: [{
    questionText: "A 68 kg object travelling west at 45,750 m/s collides with a 56,975 kg object travelling east at 0.0078 m/s. If the 68 kg object ends up travelling east at 22,456 m/s, what is the velocity of the 56,975 kg object?",
    options: [
      { id: 'a', text: '81 m/s west', feedback: 'Correct! Using conservation of momentum with the given high velocities gives this result.' },
      { id: 'b', text: '81 m/s east', feedback: 'Incorrect. Check the direction using conservation of momentum.' },
      { id: 'c', text: '162 m/s west', feedback: 'Incorrect. Check your momentum conservation calculation.' },
      { id: 'd', text: '40.5 m/s west', feedback: 'Incorrect. Make sure to account for all momentum components correctly.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using conservation of momentum: Initial momentum = Final momentum. With careful calculation of these extreme velocities, the result is approximately 81 m/s west.',
    difficulty: 'advanced',
    tags: ['momentum-conservation', 'complex-collision']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 11: Football tackle
  },
  'course2_22_unit1_q11': {
  questions: [{
    questionText: "A 95 kg halfback moving at 4.1 m/s on an apparent breakaway for a touchdown is tackled from behind. When he was tackled by an 85 kg cornerback running at 5.5 m/s in the same direction, what is their mutual speed immediately after the tackle?",
    options: [
      { id: 'a', text: '4.76 m/s', feedback: 'Correct! Conservation of momentum: (95)(4.1) + (85)(5.5) = (180)vf. So vf = 857/180 = 4.76 m/s.' },
      { id: 'b', text: '4.8 m/s', feedback: 'Close, but check your arithmetic more carefully.' },
      { id: 'c', text: '5.2 m/s', feedback: 'Incorrect. Make sure you are using conservation of momentum correctly.' },
      { id: 'd', text: '4.5 m/s', feedback: 'Incorrect. Check your momentum calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Conservation of momentum: (95)(4.1) + (85)(5.5) = (180)vf. So vf = (389.5 + 467.5)/180 = 4.76 m/s.',
    difficulty: 'intermediate',
    tags: ['sports-collision', 'momentum-conservation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 12: Rifle recoil
  },
  'course2_22_unit1_q12': {
  questions: [{
    questionText: "Calculate the recoil velocity of a 5.0 kg rifle that shoots a 0.020 kg bullet at a speed of 620 m/s?",
    options: [
      { id: 'a', text: '–1.24 m/s', feedback: 'Incorrect. Check your calculation using conservation of momentum.' },
      { id: 'b', text: '–2.48 m/s', feedback: 'Correct! Conservation of momentum: 0 = mbulletvbullet + mriflevrifle. So vrifle = -(0.020 × 620)/5.0 = -2.48 m/s.' },
      { id: 'c', text: '–4.96 m/s', feedback: 'Incorrect. You may have made an arithmetic error.' },
      { id: 'd', text: '–0.62 m/s', feedback: 'Incorrect. Make sure you are using the correct masses.' }
    ],
    correctOptionId: 'b',
    explanation: 'Conservation of momentum: 0 = mbulletvbullet + mriflevrifle. So vrifle = -(0.020 × 620)/5.0 = -2.48 m/s. The negative indicates opposite direction.',
    difficulty: 'intermediate',
    tags: ['recoil', 'momentum-conservation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 13a: Railroad cars - velocity
  },
  'course2_22_unit1_q13a': {
  questions: [{
    questionText: "A 10000 kg railroad car, A, travelling at a speed of 24.0 m/s strikes an identical car, B, at rest. If the cars lock together as a result of the collision, what is their common speed just after the collision?",
    options: [
      { id: 'a', text: '6.0 m/s', feedback: 'Incorrect. Use conservation of momentum for the collision.' },
      { id: 'b', text: '12.0 m/s', feedback: 'Correct! Conservation of momentum: (10000)(24) + (10000)(0) = (20000)vf. So vf = 240000/20000 = 12.0 m/s.' },
      { id: 'c', text: '18.0 m/s', feedback: 'Incorrect. Remember both cars have the same final velocity.' },
      { id: 'd', text: '24.0 m/s', feedback: 'Incorrect. This would violate conservation of momentum.' }
    ],
    correctOptionId: 'b',
    explanation: 'Conservation of momentum: (10000)(24) + (10000)(0) = (20000)vf. So vf = 240000/20000 = 12.0 m/s.',
    difficulty: 'intermediate',
    tags: ['railroad-collision', 'momentum-conservation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 13b: Energy loss
  },
  'course2_22_unit1_q13b': {
  questions: [{
    questionText: "Is the railroad car collision elastic or inelastic? If the collision is inelastic, calculate how much of the initial kinetic energy is transformed to thermal or other forms of energy.",
    options: [
      { id: 'a', text: 'Elastic, no energy lost', feedback: 'Incorrect. When objects lock together, the collision is inelastic.' },
      { id: 'b', text: 'Inelastic, 1.44 × 10⁶ J lost', feedback: 'Correct! Initial KE = 2.88 × 10⁶ J, Final KE = 1.44 × 10⁶ J. Energy lost = 1.44 × 10⁶ J.' },
      { id: 'c', text: 'Inelastic, 2.88 × 10⁶ J lost', feedback: 'Incorrect. This is the initial kinetic energy, not the energy lost.' },
      { id: 'd', text: 'Inelastic, 0.72 × 10⁶ J lost', feedback: 'Incorrect. Check your kinetic energy calculations.' }
    ],
    correctOptionId: 'b',
    explanation: 'Since they lock together, it\'s inelastic. Initial KE = ½(10000)(24²) = 2.88 × 10⁶ J. Final KE = ½(20000)(12²) = 1.44 × 10⁶ J. Energy lost = 1.44 × 10⁶ J.',
    difficulty: 'intermediate',
    tags: ['energy-loss', 'inelastic-collision']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 14: 2D billiard ball collision
  },
  'course2_22_unit1_q14': {
  questions: [{
    questionText: "Billiard ball A of mass 0.400 kg moving with speed 1.80 m/s strikes ball B, initially at rest of mass 0.500 kg. As a result of the collision, ball A is deflected at an angle of 30.0° with a speed of 1.10 m/s. Find the resultant velocity of ball B.",
    options: [
      { id: 'a', text: '0.808 m/s at 33° from original direction of motion', feedback: 'Correct! Using conservation of momentum in both x and y directions gives this result.' },
      { id: 'b', text: '0.808 m/s at 45° from original direction', feedback: 'Incorrect. Check your angle calculation using momentum components.' },
      { id: 'c', text: '1.20 m/s at 33° from original direction', feedback: 'Incorrect. Check your magnitude calculation.' },
      { id: 'd', text: '0.600 m/s at 30° from original direction', feedback: 'Incorrect. Use conservation of momentum in both directions.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using conservation of momentum in both x and y directions: px: 0.400(1.80) = 0.400(1.10)cos(30°) + 0.500vBcos(θB), py: 0 = 0.400(1.10)sin(30°) - 0.500vBsin(θB). Solving gives vB = 0.808 m/s at 33°.',
    difficulty: 'advanced',
    tags: ['2d-collision', 'billiards', 'vectors']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 15: 2D collision
  },
  'course2_22_unit1_q15': {
  questions: [{
    questionText: "A mass of 50 kg travelling north at 45 m/s collides with a mass of 60 kg travelling 50 m/s at 28° N of W. If they stick together on contact, what is the resulting velocity of the combined masses?",
    options: [
      { id: 'a', text: '41.1 m/s at 36° W of N', feedback: 'Correct! Use vector addition for momentum conservation. Break into components and find the resultant.' },
      { id: 'b', text: '41.1 m/s at 36° N of W', feedback: 'Incorrect. Check your angle reference direction.' },
      { id: 'c', text: '47.5 m/s at 36° W of N', feedback: 'Incorrect. Check your magnitude calculation using vector components.' },
      { id: 'd', text: '35.2 m/s at 45° W of N', feedback: 'Incorrect. Make sure you are using the correct masses and angles.' }
    ],
    correctOptionId: 'a',
    explanation: 'Break into components: px = -60(50)sin(28°) = -1407 kg·m/s, py = 50(45) + 60(50)cos(28°) = 4898 kg·m/s. Total p = 5096 kg·m/s. v = p/m = 5096/110 = 46.3 m/s at θ = tan⁻¹(1407/4898) = 16° W from N.',
    difficulty: 'advanced',
    tags: ['2d-vector-collision', 'momentum-conservation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 16: Three-part explosion
  },
  'course2_22_unit1_q16': {
  questions: [{
    questionText: "A 100 kg mass explodes into three parts. The first part travels away at 50 m/s straight north and has a mass of 20 kg. The second part travels away at 35 m/s straight west and has a mass of 50 kg. What is the resultant velocity of the third part?",
    options: [
      { id: 'a', text: '66.7 m/s at 30° S of E', feedback: 'Correct! Initial momentum = 0, so the third part must balance the momentum of the first two parts.' },
      { id: 'b', text: '66.7 m/s at 30° N of E', feedback: 'Incorrect. Check the direction - momentum must sum to zero.' },
      { id: 'c', text: '58.3 m/s at 30° S of E', feedback: 'Incorrect. Recalculate using the correct mass for part 3.' },
      { id: 'd', text: '75.0 m/s at 45° S of E', feedback: 'Incorrect. Check both magnitude and angle calculations.' }
    ],
    correctOptionId: 'a',
    explanation: 'Initial momentum = 0. Part 1: py = 1000 kg·m/s north. Part 2: px = -1750 kg·m/s west. Part 3 must have px = +1750 east, py = -1000 south. With m₃ = 30 kg, v = √(1750² + 1000²)/30 = 66.7 m/s at tan⁻¹(1000/1750) = 30° S of E.',
    difficulty: 'advanced',
    tags: ['explosion', 'three-body', 'vectors']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 17: Data analysis
  },
  'course2_22_unit1_q17': {
  questions: [{
    questionText: `The following data relates the mass and change in velocity for various objects having the same impulse over a 3.0 second time interval. Find the average force exerted on the objects during the impulse.

Mass (kg): 37.5, 50.0, 62.5, 75.3, 93.8, 125
Δv (m/s): 20, 15, 12, 10, 8.0, 6.0`,
    options: [
      { id: 'a', text: '125 N', feedback: 'Incorrect. Use F = J/t where J = mΔv for any object in the data.' },
      { id: 'b', text: '250 N', feedback: 'Correct! Using any row: J = mΔv = 50 × 15 = 750 N·s. F = J/t = 750/3.0 = 250 N.' },
      { id: 'c', text: '500 N', feedback: 'Incorrect. Check your calculation of impulse from the data.' },
      { id: 'd', text: '750 N', feedback: 'Incorrect. This is the impulse value, not the force.' }
    ],
    correctOptionId: 'b',
    explanation: 'Since all objects have the same impulse, use any row: J = mΔv = 50 × 15 = 750 N·s. Then F = J/t = 750/3.0 = 250 N.',
    difficulty: 'intermediate',
    tags: ['data-analysis', 'impulse', 'force']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;