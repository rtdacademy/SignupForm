// Cloud function creation imports removed since we only export data configs now
// Removed dependency on config file - settings are now handled directly in assessment configurations

// Question pools for each group - allows randomization while maintaining grouping
const questionPools = {
  // Group 1: Static Electricity and Charging Methods
  group1: [
    {
      questionText: "How could a neutral insulated metal conductor be given a negative charge using a negatively charged rod?",
      options: [
        { id: 'a', text: 'Touch the conductor with the rod directly', feedback: 'Correct! Direct contact transfers electrons from the negatively charged rod to the conductor.' },
        { id: 'b', text: 'Bring the rod near without touching, then ground the conductor', feedback: 'Incorrect. This would actually give the conductor a positive charge through induction.' },
        { id: 'c', text: 'Heat the conductor while the rod is nearby', feedback: 'Incorrect. Heating alone does not transfer charge from the rod.' },
        { id: 'd', text: 'Rub the conductor with the rod', feedback: 'Incorrect. Rubbing conductors does not effectively transfer charge.' }
      ],
      correctOptionId: 'a',
      explanation: 'To give a conductor a negative charge using a negatively charged rod, direct contact is needed. Electrons from the rod transfer to the conductor, leaving it with excess negative charge.',
      difficulty: 'intermediate',
      tags: ['static-electricity', 'charging-methods', 'conduction']
    },
    {
      questionText: "How could a neutral insulated metal conductor be given a negative charge using a positively charged rod?",
      options: [
        { id: 'a', text: 'Touch the conductor directly with the rod', feedback: 'Incorrect. This would remove electrons and make the conductor positive.' },
        { id: 'b', text: 'Bring the rod near, ground the conductor, then remove ground and rod', feedback: 'Correct! Induction process: rod attracts electrons to near side, ground allows more electrons to flow in, removing ground traps excess electrons.' },
        { id: 'c', text: 'Rub the conductor with the rod', feedback: 'Incorrect. Rubbing conductors does not effectively transfer charge.' },
        { id: 'd', text: 'Heat the conductor while the rod is nearby', feedback: 'Incorrect. Heat alone does not cause charge transfer.' }
      ],
      correctOptionId: 'b',
      explanation: 'Charging by induction with a positive rod: 1) Rod attracts electrons to near side, 2) Ground the far side to allow more electrons to flow in, 3) Remove ground first, then rod, trapping excess electrons.',
      difficulty: 'advanced',
      tags: ['static-electricity', 'charging-methods', 'induction']
    },
    {
      questionText: "Why does rubbing a conductor not produce a static charge whereas rubbing an insulator can produce a static charge?",
      options: [
        { id: 'a', text: 'Conductors are too heavy to be charged', feedback: 'Incorrect. Mass has no direct relationship to charging ability.' },
        { id: 'b', text: 'In conductors, electrons can move freely and redistribute, while in insulators electrons are bound and stay where transferred', feedback: 'Correct! Free electrons in conductors redistribute quickly, while bound electrons in insulators remain where placed by friction.' },
        { id: 'c', text: 'Conductors repel all charges', feedback: 'Incorrect. Conductors can hold charge when insulated properly.' },
        { id: 'd', text: 'Insulators have more electrons than conductors', feedback: 'Incorrect. The number of electrons depends on the material, not its electrical properties.' }
      ],
      correctOptionId: 'b',
      explanation: 'Conductors have free electrons that quickly redistribute throughout the material, neutralizing any local charge buildup. Insulators have bound electrons that stay where friction places them, maintaining static charge.',
      difficulty: 'intermediate',
      tags: ['static-electricity', 'conductors', 'insulators']
    }
  ],

  // Group 2: Electroscope and Charge Distribution
  group2: [
    {
      questionText: "If a negatively charged rod is brought near the knob of a positively charged electroscope, what will happen to the separation between the leaves?",
      options: [
        { id: 'a', text: 'The leaves will move closer together', feedback: 'Correct! The negative rod attracts positive charges toward the knob, reducing positive charge on the leaves, so they move closer together.' },
        { id: 'b', text: 'The leaves will spread further apart', feedback: 'Incorrect. Attracting positive charge away from the leaves reduces repulsion between them.' },
        { id: 'c', text: 'The leaves will not change position', feedback: 'Incorrect. The electric field from the rod will redistribute charges in the electroscope.' },
        { id: 'd', text: 'The leaves will oscillate back and forth', feedback: 'Incorrect. The leaves will reach a new equilibrium position.' }
      ],
      correctOptionId: 'a',
      explanation: 'The negatively charged rod attracts the positive charges toward the knob, leaving fewer positive charges on the leaves. With less repulsion between them, the leaves move closer together.',
      difficulty: 'intermediate',
      tags: ['electroscope', 'charge-distribution', 'induction']
    },
    {
      questionText: "A positively charged rod is brought near an electroscope that is already charged. If the leaves spread further apart, what kind of charge does the electroscope have?",
      options: [
        { id: 'a', text: 'Negative charge', feedback: 'Incorrect. If the electroscope were negative, the positive rod would attract charge toward the knob, reducing leaf separation.' },
        { id: 'b', text: 'Positive charge', feedback: 'Correct! The positive rod repels positive charges from the knob toward the leaves, increasing their separation.' },
        { id: 'c', text: 'No charge (neutral)', feedback: 'Incorrect. A neutral electroscope would show charge separation by induction, but not increased spreading of already-separated leaves.' },
        { id: 'd', text: 'Both positive and negative charges equally', feedback: 'Incorrect. This describes a neutral object, not a charged electroscope.' }
      ],
      correctOptionId: 'b',
      explanation: 'If the leaves spread further when a positive rod approaches, the electroscope must be positively charged. The rod repels positive charges away from the knob toward the leaves, increasing their repulsion.',
      difficulty: 'intermediate',
      tags: ['electroscope', 'charge-identification', 'repulsion']
    },
    {
      questionText: "Given a solid metal sphere and a hollow metal sphere, each with the same radius, which will hold the greater charge?",
      options: [
        { id: 'a', text: 'The solid sphere', feedback: 'Incorrect. The internal material does not affect the surface charge distribution.' },
        { id: 'b', text: 'The hollow sphere', feedback: 'Incorrect. Being hollow does not increase charge capacity.' },
        { id: 'c', text: 'Both will hold the same charge', feedback: 'Correct! For conductors, all charge resides on the outer surface. Having the same radius and surface area, they have identical charge capacity.' },
        { id: 'd', text: 'Neither can hold any charge', feedback: 'Incorrect. Both conducting spheres can hold charge on their surfaces.' }
      ],
      correctOptionId: 'c',
      explanation: 'In conductors, all excess charge resides on the outer surface due to electrostatic repulsion. Since both spheres have the same radius and surface area, they have identical maximum charge capacity.',
      difficulty: 'advanced',
      tags: ['conductors', 'charge-distribution', 'surface-charge']
    }
  ],

  // Group 3: Collision and Momentum Problems
  group3: [
    {
      questionText: "A fullback with a mass of 95 kg running at 8.2 m/s collides with a 128 kg defensive tackle moving in the opposite direction. They end up with zero speed. How fast must the tackle have been moving?",
      options: [
        { id: 'a', text: '6.1 m/s in the same direction as the fullback', feedback: 'Incorrect. If moving in the same direction, the total momentum would not be zero.' },
        { id: 'b', text: '6.1 m/s in the opposite direction to the fullback', feedback: 'Correct! Using conservation of momentum: (95)(8.2) + (128)(-v) = 0, solving gives v = 6.1 m/s opposite direction.' },
        { id: 'c', text: '8.2 m/s in the opposite direction', feedback: 'Incorrect. This would result in the tackle having more momentum than the fullback.' },
        { id: 'd', text: '4.3 m/s in the opposite direction', feedback: 'Incorrect. Check the momentum conservation calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using conservation of momentum: m₁v₁ + m₂v₂ = 0. So (95 kg)(8.2 m/s) + (128 kg)(-v) = 0. Solving: v = (95 × 8.2)/128 = 6.1 m/s opposite to fullback.',
      difficulty: 'intermediate',
      tags: ['momentum', 'collision', 'conservation']
    },
    {
      questionText: "A 2575 kg van runs into the back of a 825 kg compact car that was at rest. They move off together at 8.5 m/s. What was the initial speed of the van?",
      options: [
        { id: 'a', text: '8.5 m/s', feedback: 'Incorrect. This is their final speed together, not the van\'s initial speed.' },
        { id: 'b', text: '11 m/s', feedback: 'Correct! Using conservation of momentum: (2575)(v) + (825)(0) = (2575 + 825)(8.5), solving gives v = 11 m/s.' },
        { id: 'c', text: '14 m/s', feedback: 'Incorrect. This would result in too much final momentum.' },
        { id: 'd', text: '6.4 m/s', feedback: 'Incorrect. Check the momentum conservation calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'For a perfectly inelastic collision: m₁v₁ = (m₁ + m₂)vf. So (2575)v = (2575 + 825)(8.5) = 28,900. Therefore v = 28,900/2575 = 11 m/s.',
      difficulty: 'intermediate',
      tags: ['momentum', 'inelastic-collision', 'conservation']
    },
    {
      questionText: "A hockey puck mass 0.115 kg moving at 35 m/s strikes an octopus thrown onto the ice by a fan. The octopus has a mass of 0.465 kg. The puck and octopus slide off together. Find their speed.",
      options: [
        { id: 'a', text: '35 m/s', feedback: 'Incorrect. The combined mass is much larger than the puck alone.' },
        { id: 'b', text: '6.9 m/s', feedback: 'Correct! Using conservation of momentum: (0.115)(35) = (0.115 + 0.465)v, solving gives v = 6.9 m/s.' },
        { id: 'c', text: '14 m/s', feedback: 'Incorrect. This doesn\'t account for the increased total mass.' },
        { id: 'd', text: '3.5 m/s', feedback: 'Incorrect. Check the momentum conservation calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'For perfectly inelastic collision: m₁v₁ = (m₁ + m₂)vf. So (0.115)(35) = (0.115 + 0.465)v = (0.58)v. Therefore v = 4.025/0.58 = 6.9 m/s.',
      difficulty: 'intermediate',
      tags: ['momentum', 'inelastic-collision', 'conservation']
    },
    {
      questionText: "A plastic ball of mass 0.20 kg moves at +0.30 m/s. It collides with a second ball of mass 0.10 kg moving at +0.10 m/s. After collision, the 0.10 kg ball moves at +0.26 m/s. What is the new speed of the 0.20 kg ball?",
      options: [
        { id: 'a', text: '0.30 m/s', feedback: 'Incorrect. The collision changes both velocities.' },
        { id: 'b', text: '0.22 m/s', feedback: 'Correct! Using conservation of momentum: (0.20)(0.30) + (0.10)(0.10) = (0.20)v + (0.10)(0.26), solving gives v = 0.22 m/s.' },
        { id: 'c', text: '0.18 m/s', feedback: 'Incorrect. Check the momentum conservation calculation.' },
        { id: 'd', text: '0.26 m/s', feedback: 'Incorrect. This is the final velocity of the smaller ball.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using momentum conservation: (0.20)(0.30) + (0.10)(0.10) = (0.20)v + (0.10)(0.26). So 0.06 + 0.01 = 0.20v + 0.026. Therefore 0.07 = 0.20v + 0.026, giving v = 0.22 m/s.',
      difficulty: 'intermediate',
      tags: ['momentum', 'elastic-collision', 'conservation']
    },
    {
      questionText: "A 68 kg object travelling west at 45,750 m/s collides with a 56,975 kg object travelling east at 0.0078 m/s. If the 68 kg object ends up travelling east at 22,456 m/s, what is the velocity of the 56,975 kg object?",
      options: [
        { id: 'a', text: '81 m/s east', feedback: 'Incorrect. Check the direction and momentum conservation.' },
        { id: 'b', text: '81 m/s west', feedback: 'Correct! Using momentum conservation with careful attention to directions and solving for the final velocity of the larger object.' },
        { id: 'c', text: '162 m/s west', feedback: 'Incorrect. Check the momentum conservation calculation.' },
        { id: 'd', text: '40 m/s east', feedback: 'Incorrect. The momentum change requires a larger velocity change.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using momentum conservation (taking east as positive): (68)(-45,750) + (56,975)(0.0078) = (68)(22,456) + (56,975)v. Solving: -3,111,000 + 444 = 1,527,008 + 56,975v. Therefore v = -81 m/s (81 m/s west).',
      difficulty: 'advanced',
      tags: ['momentum', 'collision', 'vector-direction']
    }
  ],

  // Group 4: Two-Dimensional Collisions
  group4: [
    {
      questionText: "A 550 kg object travelling east at 55.5 m/s collides with a 345 kg object travelling east at 5.5 m/s. If the 345 kg object ends up travelling at 23.5 m/s at 39° N of E, what is the resultant velocity of the 550 kg object?",
      options: [
        { id: 'a', text: '48.6 m/s at 11° S of E', feedback: 'Correct! Using vector momentum conservation in both x and y directions to solve for the final velocity components of the 550 kg object.' },
        { id: 'b', text: '50.0 m/s due east', feedback: 'Incorrect. The collision imparts momentum in the y-direction as well.' },
        { id: 'c', text: '45.2 m/s at 15° N of E', feedback: 'Incorrect. Check the vector momentum conservation calculations.' },
        { id: 'd', text: '52.3 m/s at 8° S of E', feedback: 'Incorrect. Verify the momentum conservation in both x and y directions.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using momentum conservation in 2D: x-direction: (550)(55.5) + (345)(5.5) = (550)vₓ + (345)(23.5)cos(39°). y-direction: 0 = (550)vᵧ + (345)(23.5)sin(39°). Solving gives velocity components that result in 48.6 m/s at 11° S of E.',
      difficulty: 'advanced',
      tags: ['momentum', '2d-collision', 'vector-components']
    },
    {
      questionText: "A mass of 50 kg travelling south at 50 m/s collides with a mass of 50 kg at rest. The 50 kg mass originally at rest ends up travelling at 40 m/s at 30° S of W. What is the resulting velocity of the incoming 50 kg mass?",
      options: [
        { id: 'a', text: '40 m/s due south', feedback: 'Incorrect. The collision changes the direction of the incoming mass.' },
        { id: 'b', text: '45.7 m/s at 41° S of E', feedback: 'Correct! Using vector momentum conservation to find the final velocity components of the originally moving mass.' },
        { id: 'c', text: '50 m/s at 30° S of E', feedback: 'Incorrect. The speed changes due to the collision.' },
        { id: 'd', text: '35 m/s at 45° S of E', feedback: 'Incorrect. Check the vector momentum conservation calculations.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using momentum conservation in 2D: x-direction: 0 = (50)vₓ + (50)(40)cos(210°). y-direction: (50)(-50) = (50)vᵧ + (50)(40)sin(210°). Solving gives velocity components that result in 45.7 m/s at 41° S of E.',
      difficulty: 'advanced',
      tags: ['momentum', '2d-collision', 'vector-analysis']
    }
  ],

  // Group 5: Electric Field Data Analysis
  group5: [
    {
      questionText: `**Data Analysis Problem:**

The following data was collected to calculate the constant, k, in the equation E = kq/r² where E is the electric field strength, q is the charge generating the field, and r is the distance from the charge. The charge used for this experiment was 2.0 × 10⁻³ C.

| Distance - r (m) | E (× 10⁷ N/C) |
|------------------|---------------|
| 0.20             | 45            |
| 0.40             | 11            |
| 0.60             | 5.0           |
| 0.80             | 2.8           |
| 1.0              | 1.8           |

Using a suitable graphing technique, what is the value of k?`,
      options: [
        { id: 'a', text: '8.5 × 10⁹ N·m²/C²', feedback: 'Incorrect. Check your graphing technique and calculation.' },
        { id: 'b', text: '9.0 × 10⁹ N·m²/C²', feedback: 'Correct! Plotting E vs 1/r² gives a straight line with slope = kq. From the data, slope ≈ 1.8 × 10⁷, so k = slope/q = 1.8 × 10⁷/(2.0 × 10⁻³) = 9.0 × 10⁹ N·m²/C².' },
        { id: 'c', text: '1.8 × 10⁷ N·m²/C²', feedback: 'Incorrect. This is the slope value, not the constant k.' },
        { id: 'd', text: '4.5 × 10⁹ N·m²/C²', feedback: 'Incorrect. Check your calculation of k from the slope.' }
      ],
      correctOptionId: 'b',
      explanation: 'To find k, plot E vs 1/r². This linearizes the relationship E = kq/r². The slope of this line equals kq. From the data, the slope ≈ 1.8 × 10⁷ N·m²/C. Therefore k = slope/q = (1.8 × 10⁷)/(2.0 × 10⁻³) = 9.0 × 10⁹ N·m²/C².',
      difficulty: 'advanced',
      tags: ['data-analysis', 'electric-field', 'graphing', 'coulombs-constant']
    }
  ],

  // Group 6: Light and Electromagnetic Radiation
  group6: [
    {
      questionText: "If the Earth's radius of orbit around the sun is 1.49 × 10¹¹ m, how long does it take for sunlight to reach the Earth?",
      options: [
        { id: 'a', text: '298 s', feedback: 'Incorrect. Check your calculation using the speed of light.' },
        { id: 'b', text: '497 s', feedback: 'Correct! Time = distance/speed = (1.49 × 10¹¹ m)/(3.0 × 10⁸ m/s) = 497 s.' },
        { id: 'c', text: '745 s', feedback: 'Incorrect. Verify the speed of light value used.' },
        { id: 'd', text: '149 s', feedback: 'Incorrect. Check your powers of ten in the calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using time = distance/speed, where distance = 1.49 × 10¹¹ m and speed of light = 3.0 × 10⁸ m/s. Time = (1.49 × 10¹¹)/(3.0 × 10⁸) = 497 seconds.',
      difficulty: 'beginner',
      tags: ['light-speed', 'electromagnetic-radiation', 'astronomy']
    },
    {
      questionText: "A hidden surveillance camera is mounted on a wall 2.5 m above the floor. It \"sees\" by looking into a mirror on the opposite wall which is 3.5 m away. The mirror starts 1.0 m up from the floor and is 1.0 m high. How much floor does the camera actually see?",
      options: [
        { id: 'a', text: '0.75 m', feedback: 'Incorrect. Check your ray tracing geometry.' },
        { id: 'b', text: '1.17 m', feedback: 'Correct! Using similar triangles and ray tracing principles to determine the field of view reflected by the mirror.' },
        { id: 'c', text: '1.5 m', feedback: 'Incorrect. The mirror height limits the field of view.' },
        { id: 'd', text: '2.0 m', feedback: 'Incorrect. This doesn\'t account for the geometry of reflection.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using ray tracing: the camera sees the floor via reflection. The top of the mirror (at 2.0 m) and camera (at 2.5 m) determine one ray, the bottom of the mirror (at 1.0 m) determines another. Using similar triangles with the geometry gives a floor viewing distance of 1.17 m.',
      difficulty: 'advanced',
      tags: ['optics', 'reflection', 'geometry', 'ray-tracing']
    }
  ],

  // Group 7: Mirrors and Image Formation
  group7: [
    {
      questionText: "An object located in front of a concave mirror with a radius of curvature of 180 cm produced an erect image that is two times the size of the object. What is the object distance?",
      options: [
        { id: 'a', text: '30 cm', feedback: 'Incorrect. Check your mirror equation calculation.' },
        { id: 'b', text: '45 cm', feedback: 'Correct! For an erect image with magnification +2, using 1/f = 1/dₒ + 1/dᵢ and m = -dᵢ/dₒ = +2, with f = R/2 = 90 cm, gives dₒ = 45 cm.' },
        { id: 'c', text: '60 cm', feedback: 'Incorrect. An erect image in a concave mirror requires the object to be closer than the focal point.' },
        { id: 'd', text: '90 cm', feedback: 'Incorrect. This is the focal length, not the object distance.' }
      ],
      correctOptionId: 'b',
      explanation: 'For a concave mirror: f = R/2 = 90 cm. For erect image with magnification m = +2: m = -dᵢ/dₒ = +2, so dᵢ = -2dₒ. Using mirror equation: 1/90 = 1/dₒ + 1/(-2dₒ) = 1/dₒ - 1/(2dₒ) = 1/(2dₒ). Therefore dₒ = 45 cm.',
      difficulty: 'advanced',
      tags: ['concave-mirror', 'image-formation', 'magnification']
    },
    {
      questionText: "An object which is 5 cm tall is placed 14 cm in front of a concave mirror which has a radius of 10 cm. What is the image distance?",
      options: [
        { id: 'a', text: '5.4 cm', feedback: 'Incorrect. Check your focal length calculation first.' },
        { id: 'b', text: '7.8 cm', feedback: 'Correct! With f = R/2 = 5 cm, using 1/f = 1/dₒ + 1/dᵢ: 1/5 = 1/14 + 1/dᵢ, solving gives dᵢ = 7.8 cm.' },
        { id: 'c', text: '10 cm', feedback: 'Incorrect. This is the radius, not the image distance.' },
        { id: 'd', text: '14 cm', feedback: 'Incorrect. This is the object distance, not the image distance.' }
      ],
      correctOptionId: 'b',
      explanation: 'For concave mirror: f = R/2 = 10/2 = 5 cm. Using mirror equation: 1/f = 1/dₒ + 1/dᵢ. So 1/5 = 1/14 + 1/dᵢ. Solving: 1/dᵢ = 1/5 - 1/14 = (14-5)/(5×14) = 9/70. Therefore dᵢ = 70/9 = 7.8 cm.',
      difficulty: 'intermediate',
      tags: ['concave-mirror', 'mirror-equation', 'image-distance']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (3 questions)
  ...questionPools.group1,
  
  // Group 2 questions (3 questions) 
  ...questionPools.group2,
  
  // Group 3 questions (5 questions)
  ...questionPools.group3,
  
  // Group 4 questions (2 questions)
  ...questionPools.group4,
  
  // Group 5 questions (1 question)
  ...questionPools.group5,
  
  // Group 6 questions (2 questions)
  ...questionPools.group6,
  
  // Group 7 questions (2 questions) 
  ...questionPools.group7
];

// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Assessment configurations for master function 
const assessmentConfigs = {};

for (let i = 1; i <= 15; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_35_l118_question${i}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questions[questionIndex]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 1,
    showFeedback: true,
    activityType: ACTIVITY_TYPE,
    theme: 'purple'
  };
}

module.exports = { assessmentConfigs };