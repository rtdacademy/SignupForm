

const questions = [
  // Question 1 - Electric Field from Point Charge
  {
    questionText: "What is the electric field strength at a distance of 6.0 cm from a point charge of 2.0 μC?",
    options: [
      { id: 'a', text: '2.5 × 10⁶ N/C', feedback: 'Incorrect. Check your calculation using E = kq/r².' },
      { id: 'b', text: '5.0 × 10⁶ N/C', feedback: 'Correct! E = kq/r² = (9.0 × 10⁹)(2.0 × 10⁻⁶)/(0.06)² = 5.0 × 10⁶ N/C.' },
      { id: 'c', text: '1.0 × 10⁷ N/C', feedback: 'Incorrect. You may have made an error with the distance conversion.' },
      { id: 'd', text: '3.0 × 10⁵ N/C', feedback: 'Incorrect. Check your powers of ten in the calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using E = kq/r² where k = 9.0 × 10⁹ N·m²/C², q = 2.0 × 10⁻⁶ C, and r = 0.06 m, we get E = 5.0 × 10⁶ N/C.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'point-charge', 'coulombs-law']
  },

  // Question 2 - Sphere with Excess Electrons
  {
    questionText: "2.4 × 10²⁰ excess electrons are loaded onto the surface of a sphere with a diameter of 4.0 cm. What is the electric field intensity at a distance of 16 cm from the surface of the sphere? (Hint: What assumption is made to calculate the electric field of a sphere?)",
    options: [
      { id: 'a', text: '5.5 × 10¹² N/C', feedback: 'Incorrect. Remember to measure from the center of the sphere, not the surface.' },
      { id: 'b', text: '1.1 × 10¹³ N/C', feedback: 'Correct! The sphere acts as a point charge. Distance from center = 18 cm.' },
      { id: 'c', text: '2.2 × 10¹³ N/C', feedback: 'Incorrect. Check your distance calculation from the center.' },
      { id: 'd', text: '8.8 × 10¹² N/C', feedback: 'Incorrect. Did you calculate the total charge correctly?' }
    ],
    correctOptionId: 'b',
    explanation: 'For a charged sphere, we treat it as a point charge at the center. Total charge q = ne = (2.4 × 10²⁰)(1.6 × 10⁻¹⁹) = 38.4 C. Distance from center = 2 cm (radius) + 16 cm = 18 cm = 0.18 m. E = kq/r² = 1.1 × 10¹³ N/C.',
    difficulty: 'advanced',
    tags: ['electric-field', 'charged-sphere', 'electrons']
  },

  // Question 3 - Electric Field from Force
  {
    questionText: "A –40 μC charge is placed into an electric field where it experiences an attractive force of 0.80 N. What is the electric field strength at that point?",
    options: [
      { id: 'a', text: '1.0 × 10⁴ N/C', feedback: 'Incorrect. Remember E = F/q, use the magnitude of charge.' },
      { id: 'b', text: '2.0 × 10⁴ N/C', feedback: 'Correct! E = F/|q| = 0.80/(40 × 10⁻⁶) = 2.0 × 10⁴ N/C.' },
      { id: 'c', text: '3.2 × 10⁴ N/C', feedback: 'Incorrect. Check your calculation of F/q.' },
      { id: 'd', text: '5.0 × 10³ N/C', feedback: 'Incorrect. Make sure to use the correct charge value.' }
    ],
    correctOptionId: 'b',
    explanation: 'Electric field strength E = F/|q| where F = 0.80 N and |q| = 40 × 10⁻⁶ C. Therefore E = 0.80/(40 × 10⁻⁶) = 2.0 × 10⁴ N/C.',
    difficulty: 'beginner',
    tags: ['electric-field', 'force', 'charge']
  },

  // Question 4 - Proton Acceleration
  {
    questionText: "A proton is placed into an electric field near a positively charged sphere. If the electric field strength at the point where the proton is placed is 25 N/C directed away from the sphere, what is the acceleration of the proton?",
    options: [
      { id: 'a', text: '+2.4 × 10⁹ m/s²', feedback: 'Correct! a = qE/m = (1.6 × 10⁻¹⁹)(25)/(1.67 × 10⁻²⁷) = 2.4 × 10⁹ m/s².' },
      { id: 'b', text: '-2.4 × 10⁹ m/s²', feedback: 'Incorrect. Positive proton in field away from positive sphere accelerates outward (+).' },
      { id: 'c', text: '+4.8 × 10⁹ m/s²', feedback: 'Incorrect. Check your calculation of qE/m.' },
      { id: 'd', text: '+1.2 × 10⁹ m/s²', feedback: 'Incorrect. Verify the proton mass value used.' }
    ],
    correctOptionId: 'a',
    explanation: 'Force on proton F = qE = (1.6 × 10⁻¹⁹ C)(25 N/C). Acceleration a = F/m = qE/m = (1.6 × 10⁻¹⁹)(25)/(1.67 × 10⁻²⁷) = 2.4 × 10⁹ m/s². Direction is positive (away from sphere).',
    difficulty: 'intermediate',
    tags: ['electric-field', 'proton', 'acceleration']
  },

  // Question 5 - Work and Potential Difference
  {
    questionText: "If 50 J of work is required to move a 0.50 C charge in an electric field, what is the potential difference between the two points?",
    options: [
      { id: 'a', text: '25 V', feedback: 'Incorrect. V = W/q, check your calculation.' },
      { id: 'b', text: '50 V', feedback: 'Incorrect. Remember to divide work by charge.' },
      { id: 'c', text: '100 V', feedback: 'Correct! V = W/q = 50 J / 0.50 C = 100 V.' },
      { id: 'd', text: '200 V', feedback: 'Incorrect. Check your division of work by charge.' }
    ],
    correctOptionId: 'c',
    explanation: 'Potential difference V = W/q where W = 50 J and q = 0.50 C. Therefore V = 50/0.50 = 100 V.',
    difficulty: 'beginner',
    tags: ['potential-difference', 'work', 'electric-potential']
  },

  // Question 6 - Electron Speed from Potential
  {
    questionText: "If an electron starting from rest falls through a potential difference of 500 V, what is its final speed?",
    options: [
      { id: 'a', text: '6.65 × 10⁶ m/s', feedback: 'Incorrect. Check your calculation using energy conservation.' },
      { id: 'b', text: '1.33 × 10⁷ m/s', feedback: 'Correct! Using ½mv² = qV, v = √(2qV/m) = 1.33 × 10⁷ m/s.' },
      { id: 'c', text: '2.66 × 10⁷ m/s', feedback: 'Incorrect. You may have forgotten the factor of 2 in the formula.' },
      { id: 'd', text: '9.4 × 10⁶ m/s', feedback: 'Incorrect. Verify the electron mass and charge values.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using energy conservation: KE = qV, so ½mv² = qV. Solving for v: v = √(2qV/m) = √(2 × 1.6 × 10⁻¹⁹ × 500 / 9.11 × 10⁻³¹) = 1.33 × 10⁷ m/s.',
    difficulty: 'intermediate',
    tags: ['kinetic-energy', 'potential-difference', 'electron']
  },

  // Question 7 - Aluminum Nucleus Acceleration
  {
    questionText: "A completely ionized aluminium nucleus (i.e. all of the electrons have been stripped from the atom) is accelerated through a 0.25 MV potential difference. What is its final speed?",
    options: [
      { id: 'a', text: '2.4 × 10⁶ m/s', feedback: 'Incorrect. Al has 13 protons, so q = 13e.' },
      { id: 'b', text: '3.6 × 10⁶ m/s', feedback: 'Incorrect. Check the mass of aluminum nucleus.' },
      { id: 'c', text: '4.8 × 10⁶ m/s', feedback: 'Correct! Using v = √(2qV/m) with q = 13e and m = 27u.' },
      { id: 'd', text: '6.0 × 10⁶ m/s', feedback: 'Incorrect. Verify your calculation with correct values.' }
    ],
    correctOptionId: 'c',
    explanation: 'Al³⁺ has charge q = 13e = 13(1.6 × 10⁻¹⁹) C. Mass m = 27u = 27(1.66 × 10⁻²⁷) kg. Using v = √(2qV/m) = √(2 × 13 × 1.6 × 10⁻¹⁹ × 0.25 × 10⁶ / (27 × 1.66 × 10⁻²⁷)) = 4.8 × 10⁶ m/s.',
    difficulty: 'advanced',
    tags: ['ionized-atom', 'acceleration', 'potential-difference']
  },

  // Question 8 - Parallel Plates Acceleration
  {
    questionText: "A potential difference of 8000 V is applied across two vertical parallel plates set 5.0 mm apart. What is the acceleration of a proton placed in the field?",
    options: [
      { id: 'a', text: '7.65 × 10¹³ m/s²', feedback: 'Incorrect. First find E = V/d, then a = qE/m.' },
      { id: 'b', text: '1.53 × 10¹⁴ m/s²', feedback: 'Correct! E = V/d = 1.6 × 10⁶ N/C, a = qE/m = 1.53 × 10¹⁴ m/s².' },
      { id: 'c', text: '3.06 × 10¹⁴ m/s²', feedback: 'Incorrect. Check your calculation of electric field.' },
      { id: 'd', text: '9.18 × 10¹³ m/s²', feedback: 'Incorrect. Verify the distance conversion to meters.' }
    ],
    correctOptionId: 'b',
    explanation: 'E = V/d = 8000 V / 0.005 m = 1.6 × 10⁶ N/C. For a proton: a = qE/m = (1.6 × 10⁻¹⁹)(1.6 × 10⁶)/(1.67 × 10⁻²⁷) = 1.53 × 10¹⁴ m/s².',
    difficulty: 'intermediate',
    tags: ['parallel-plates', 'acceleration', 'electric-field']
  },

  // Question 9 - Work Parallel to Plates
  {
    questionText: "A proton is placed in an electric field between two parallel plates set 6.0 cm apart with a potential difference of 75 V across the plates. How much work is done if the proton is moved 3.0 cm parallel to the plates?",
    options: [
      { id: 'a', text: '0 J', feedback: 'Correct! Moving parallel to plates means no change in potential, so W = 0.' },
      { id: 'b', text: '2.0 × 10⁻¹⁸ J', feedback: 'Incorrect. Movement parallel to plates involves no potential change.' },
      { id: 'c', text: '4.0 × 10⁻¹⁸ J', feedback: 'Incorrect. Consider the direction of movement relative to field.' },
      { id: 'd', text: '6.0 × 10⁻¹⁸ J', feedback: 'Incorrect. Parallel movement means constant potential.' }
    ],
    correctOptionId: 'a',
    explanation: 'When moving parallel to the plates, the charge stays at the same potential. Since there is no change in potential, no work is done: W = qΔV = q(0) = 0.',
    difficulty: 'intermediate',
    tags: ['parallel-plates', 'work', 'equipotential']
  },

  // Question 10 - Work Perpendicular to Plates
  {
    questionText: "A proton is placed in an electric field between two parallel plates set 6.0 cm apart with a potential difference of 75 V across the plates. How much work is done against the electric field if the proton is moved 3.0 cm perpendicular to the plates?",
    options: [
      { id: 'a', text: '3.0 × 10⁻¹⁸ J', feedback: 'Incorrect. Calculate the potential change over 3.0 cm.' },
      { id: 'b', text: '4.5 × 10⁻¹⁸ J', feedback: 'Incorrect. Check your calculation of fractional potential change.' },
      { id: 'c', text: '6.0 × 10⁻¹⁸ J', feedback: 'Correct! ΔV = (3.0/6.0) × 75 = 37.5 V, W = qΔV = 6.0 × 10⁻¹⁸ J.' },
      { id: 'd', text: '1.2 × 10⁻¹⁷ J', feedback: 'Incorrect. You may have used the full voltage instead of partial.' }
    ],
    correctOptionId: 'c',
    explanation: 'Moving 3.0 cm out of 6.0 cm total distance means experiencing half the total voltage: ΔV = (3.0/6.0) × 75 V = 37.5 V. Work = qΔV = (1.6 × 10⁻¹⁹ C)(37.5 V) = 6.0 × 10⁻¹⁸ J.',
    difficulty: 'intermediate',
    tags: ['parallel-plates', 'work', 'potential-difference']
  },

  // Question 11 - Oil Drop with Upward Acceleration
  {
    questionText: "An oil drop whose mass is 5.70 × 10⁻¹⁶ kg accelerates upward at a rate of 2.90 m/s² when placed between two horizontal parallel plates that are 3.50 cm apart. If the potential difference between the plates is 7.92 × 10² V, how many electrons are on the drop?",
    options: [
      { id: 'a', text: '1e⁻', feedback: 'Incorrect. The net force must overcome gravity and provide acceleration.' },
      { id: 'b', text: '2e⁻', feedback: 'Correct! Using F_net = ma = qE - mg, solving gives q = 2e.' },
      { id: 'c', text: '3e⁻', feedback: 'Incorrect. Check your force balance equation.' },
      { id: 'd', text: '4e⁻', feedback: 'Incorrect. Verify your calculation of required charge.' }
    ],
    correctOptionId: 'b',
    explanation: 'E = V/d = 792/0.035 = 22,629 N/C. For upward acceleration: qE - mg = ma, so q = m(g + a)/E = (5.70 × 10⁻¹⁶)(9.8 + 2.9)/22,629 = 3.2 × 10⁻¹⁹ C = 2e.',
    difficulty: 'advanced',
    tags: ['millikan', 'oil-drop', 'force-balance']
  },

  // Question 12 - Millikan Oil Drop Stationary
  {
    questionText: "In a Millikan oil drop experiment a student sprayed oil droplets between two horizontal plates that were 4.0 cm apart. The student adjusted the potential difference between the plates to 4.6 × 10³ V so that one of the drops became stationary. If the mass of the drop was 5.63 × 10⁻¹⁵ kg, what was the magnitude of the charge on this oil drop?",
    options: [
      { id: 'a', text: '3.2 × 10⁻¹⁹ C', feedback: 'Incorrect. For stationary drop: qE = mg.' },
      { id: 'b', text: '4.8 × 10⁻¹⁹ C', feedback: 'Correct! q = mgd/V = (5.63 × 10⁻¹⁵)(9.8)(0.04)/4600 = 4.8 × 10⁻¹⁹ C.' },
      { id: 'c', text: '6.4 × 10⁻¹⁹ C', feedback: 'Incorrect. Check your force balance for stationary condition.' },
      { id: 'd', text: '8.0 × 10⁻¹⁹ C', feedback: 'Incorrect. Verify your calculation with correct values.' }
    ],
    correctOptionId: 'b',
    explanation: 'For stationary drop: qE = mg. Since E = V/d, we have q = mgd/V = (5.63 × 10⁻¹⁵ kg)(9.8 m/s²)(0.04 m)/(4600 V) = 4.8 × 10⁻¹⁹ C = 3e.',
    difficulty: 'advanced',
    tags: ['millikan', 'oil-drop', 'equilibrium']
  }
];



// Export assessment configurations for master function
const assessmentConfigs = {
  'course2_34_l1518_question1': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question2': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question3': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question4': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question5': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question6': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question7': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question8': {
    questions: [questions[7]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question9': {
    questions: [questions[8]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question10': {
    questions: [questions[9]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question11': {
    questions: [questions[10]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  },
  'course2_34_l1518_question12': {
    questions: [questions[11]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;