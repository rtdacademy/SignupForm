const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

const questions = [
  // Question 1
  {
    questionText: "Why does rubbing a conductor not produce a static charge whereas rubbing an insulator can produce a static charge?",
    options: [
      { id: 'a', text: 'Conductors have fewer electrons than insulators', feedback: 'Incorrect. The number of electrons is not the determining factor.' },
      { id: 'b', text: 'In conductors, electrons can move freely and redistribute, neutralizing any charge buildup', feedback: 'Correct! Free electrons in conductors redistribute quickly, preventing static charge accumulation.' },
      { id: 'c', text: 'Insulators have stronger atomic bonds than conductors', feedback: 'Incorrect. While insulators do have stronger bonds, this is not the complete explanation for static charge.' },
      { id: 'd', text: 'Conductors are always grounded', feedback: 'Incorrect. Conductors are not always grounded, but they still don\'t hold static charge due to electron mobility.' }
    ],
    correctOptionId: 'b',
    explanation: 'In conductors, electrons are free to move throughout the material. When charge is added by rubbing, these free electrons quickly redistribute to neutralize any local charge imbalance. In insulators, electrons are bound to their atoms and cannot move freely, so charge remains localized where it was deposited.',
    difficulty: 'intermediate',
    tags: ['conductors', 'insulators', 'static-charge', 'electron-mobility']
  },
  
  // Question 2
  {
    questionText: "What is the net charge on a metal sphere having a deficit of 1.0 × 10¹² electrons?",
    options: [
      { id: 'a', text: '+1.6 × 10⁻⁷ C', feedback: 'Correct! Each electron has charge -1.6 × 10⁻¹⁹ C, so a deficit of 1.0 × 10¹² electrons gives +1.6 × 10⁻⁷ C.' },
      { id: 'b', text: '-1.6 × 10⁻⁷ C', feedback: 'Incorrect. A deficit of electrons means the sphere has lost electrons and is positively charged.' },
      { id: 'c', text: '+1.6 × 10⁻¹⁹ C', feedback: 'Incorrect. This is the charge of a single electron. You need to multiply by the number of missing electrons.' },
      { id: 'd', text: '+6.25 × 10⁶ C', feedback: 'Incorrect. Check your calculation: (1.0 × 10¹²) × (1.6 × 10⁻¹⁹) = 1.6 × 10⁻⁷ C.' }
    ],
    correctOptionId: 'a',
    explanation: 'A deficit of electrons means the sphere has lost electrons and is positively charged. Charge = (number of electrons) × (elementary charge) = (1.0 × 10¹²) × (1.6 × 10⁻¹⁹ C) = +1.6 × 10⁻⁷ C.',
    difficulty: 'intermediate',
    tags: ['charge-calculation', 'elementary-charge', 'electrons']
  },
  
  // Question 3
  {
    questionText: "A positively charged rod is brought near an electroscope that is already charged. If the leaves spread further apart, what kind of charge does the electroscope have?",
    options: [
      { id: 'a', text: 'Positive charge', feedback: 'Correct! Like charges repel, so the positive rod induces further separation of positive charges in the electroscope.' },
      { id: 'b', text: 'Negative charge', feedback: 'Incorrect. If the electroscope were negatively charged, the positive rod would attract the charges and the leaves would come together.' },
      { id: 'c', text: 'No charge', feedback: 'Incorrect. A neutral electroscope would show induced charges but not increased separation.' },
      { id: 'd', text: 'Cannot be determined', feedback: 'Incorrect. The increased separation clearly indicates the electroscope has the same type of charge as the rod.' }
    ],
    correctOptionId: 'a',
    explanation: 'When the positively charged rod approaches, if the electroscope leaves spread further apart, it means the electroscope already has positive charge. The positive rod repels the positive charges in the electroscope, causing greater separation of the leaves.',
    difficulty: 'intermediate',
    tags: ['electroscope', 'charge-induction', 'like-charges-repel']
  },
  
  // Question 4
  {
    questionText: "Given a solid metal sphere and a hollow metal sphere, each with the same radius, which will hold the greater charge?",
    options: [
      { id: 'a', text: 'The solid sphere', feedback: 'Incorrect. The charge distribution depends only on the surface area, not the internal structure.' },
      { id: 'b', text: 'The hollow sphere', feedback: 'Incorrect. Both spheres have the same surface area and will hold the same charge.' },
      { id: 'c', text: 'Both will hold the same charge', feedback: 'Correct! Charge distributes only on the outer surface of conductors, so both spheres have identical charge capacity.' },
      { id: 'd', text: 'It depends on the material', feedback: 'Incorrect. For the same conducting material and radius, both spheres will hold identical charge.' }
    ],
    correctOptionId: 'c',
    explanation: 'In conductors, charge distributes only on the outer surface due to electrostatic repulsion. Since both spheres have the same radius, they have identical surface areas and therefore identical charge capacity. The fact that one is hollow does not affect this.',
    difficulty: 'intermediate',
    tags: ['conductors', 'charge-distribution', 'surface-charge']
  },
  
  // Question 5
  {
    questionText: "A metal sphere with an excess of 7.75 × 10¹⁹ protons is touched to another identical neutral metal sphere. What is the final charge on each sphere?",
    options: [
      { id: 'a', text: '6.2 μC each', feedback: 'Correct! The charge distributes equally: Q = (7.75 × 10¹⁹ × 1.6 × 10⁻¹⁹)/2 = 6.2 μC per sphere.' },
      { id: 'b', text: '12.4 μC each', feedback: 'Incorrect. The total charge is shared equally between the two spheres, so each gets half.' },
      { id: 'c', text: '3.1 μC each', feedback: 'Incorrect. Check your calculation: total charge is 12.4 μC, shared equally gives 6.2 μC each.' },
      { id: 'd', text: '0 C each', feedback: 'Incorrect. The spheres share the charge but do not neutralize completely.' }
    ],
    correctOptionId: 'a',
    explanation: 'When two identical conducting spheres touch, charge distributes equally between them. Total charge = (7.75 × 10¹⁹) × (1.6 × 10⁻¹⁹ C) = 12.4 μC. Each sphere gets 12.4 μC ÷ 2 = 6.2 μC.',
    difficulty: 'intermediate',
    tags: ['charge-sharing', 'conductors', 'charge-calculation']
  },
  
  // Question 6
  {
    questionText: "Describe two ways to give a neutral electroscope a positive charge, using only a piece of silk and a glass rod. Could the same materials be used to give it a negative charge?",
    options: [
      { id: 'a', text: 'Charging by contact and induction; No, glass always becomes positive', feedback: 'Correct! Contact: rub glass with silk, touch electroscope. Induction: bring charged glass near, ground electroscope, remove ground. Glass-silk always produces positive glass.' },
      { id: 'b', text: 'Only by contact; Yes, by reversing the materials', feedback: 'Incorrect. Both contact and induction work, and the triboelectric series determines which material becomes positive.' },
      { id: 'c', text: 'Only by induction; Yes, by using silk instead of glass', feedback: 'Incorrect. Both methods work, but silk becomes negative when rubbed with glass, not positive.' },
      { id: 'd', text: 'Grounding and contact; Yes, depending on humidity', feedback: 'Incorrect. Grounding would discharge the electroscope, and humidity doesn\'t change the triboelectric series.' }
    ],
    correctOptionId: 'a',
    explanation: 'Two methods: (1) Contact: Rub glass with silk (glass becomes +), touch electroscope with glass. (2) Induction: Bring + glass near electroscope, briefly ground the electroscope while glass is near, remove ground then glass. Glass-silk combination always makes glass positive due to the triboelectric series.',
    difficulty: 'advanced',
    tags: ['charging-methods', 'induction', 'contact-charging', 'triboelectric-series']
  },
  
  // Question 7
  {
    questionText: "Calculate the electric force between two point charges of -4.00 μC and -3.00 μC when they are 2.00 cm apart.",
    options: [
      { id: 'a', text: '270 N repulsion', feedback: 'Correct! F = k|q₁q₂|/r² = (9×10⁹)(4×10⁻⁶)(3×10⁻⁶)/(0.02)² = 270 N repulsion (like charges).' },
      { id: 'b', text: '270 N attraction', feedback: 'Incorrect. Both charges are negative (like charges), so they repel each other.' },
      { id: 'c', text: '27 N repulsion', feedback: 'Incorrect. Check your calculation: F = (9×10⁹)(12×10⁻¹²)/(4×10⁻⁴) = 270 N.' },
      { id: 'd', text: '2700 N repulsion', feedback: 'Incorrect. Check your unit conversion: 2.00 cm = 0.02 m, so r² = 4×10⁻⁴ m².' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Coulomb\'s Law: F = k|q₁q₂|/r² = (9.0×10⁹ N⋅m²/C²)(4.00×10⁻⁶ C)(3.00×10⁻⁶ C)/(0.0200 m)² = (9.0×10⁹)(12×10⁻¹²)/(4×10⁻⁴) = 270 N. Since both charges are negative, they repel.',
    difficulty: 'intermediate',
    tags: ['coulombs-law', 'electric-force', 'like-charges-repel', 'calculations']
  },
  
  // Question 8
  {
    questionText: "Two point charged objects produce an electric force of 0.0620 N on each other. What is the electric force if the distance between them increases three times and one of the charges is doubled?",
    options: [
      { id: 'a', text: '0.0138 N', feedback: 'Correct! F₂ = F₁ × (2) × (1/3)² = 0.0620 × 2 × (1/9) = 0.0138 N.' },
      { id: 'b', text: '0.372 N', feedback: 'Incorrect. Remember that force is inversely proportional to the square of distance.' },
      { id: 'c', text: '0.00688 N', feedback: 'Incorrect. You forgot to account for doubling one of the charges.' },
      { id: 'd', text: '0.558 N', feedback: 'Incorrect. Check your calculation: the distance factor is (1/3)² = 1/9, not 1/3.' }
    ],
    correctOptionId: 'a',
    explanation: 'From Coulomb\'s Law: F ∝ q₁q₂/r². New force = Original force × (charge factor) × (distance factor) = 0.0620 N × (2) × (1/3)² = 0.0620 × 2 × (1/9) = 0.0138 N.',
    difficulty: 'advanced',
    tags: ['coulombs-law', 'proportional-relationships', 'electric-force']
  },
  
  // Question 9
  {
    questionText: "Two point charges produce a repulsive force of 0.0340 N when placed 0.100 m apart. What is the charge on each point charge if the magnitude of the larger charge is three times the magnitude of the smaller charge?",
    options: [
      { id: 'a', text: '0.112 μC and 0.336 μC', feedback: 'Correct! Let q₁ = q, q₂ = 3q. Then F = k(3q²)/r², so q = √(Fr²/3k) = 1.12×10⁻⁷ C = 0.112 μC, 3q = 0.336 μC.' },
      { id: 'b', text: '0.194 μC and 0.583 μC', feedback: 'Incorrect. Check your setup: if q₂ = 3q₁, then F = 3kq₁²/r², not kq₁²/r².' },
      { id: 'c', text: '0.0613 μC and 0.184 μC', feedback: 'Incorrect. You may have used the wrong relationship. Remember q₂ = 3q₁, so F = k(q₁)(3q₁)/r² = 3kq₁²/r².' },
      { id: 'd', text: '0.335 μC and 1.01 μC', feedback: 'Incorrect. Check your calculation: q₁ = √(0.0340 × 0.01)/(3 × 9×10⁹) = 1.12×10⁻⁷ C.' }
    ],
    correctOptionId: 'a',
    explanation: 'Let smaller charge = q, larger charge = 3q. Using F = kq₁q₂/r²: 0.0340 = (9×10⁹)(q)(3q)/(0.100)² = (27×10⁹)q²/0.01. Solving: q² = (0.0340 × 0.01)/(27×10⁹) = 1.26×10⁻¹⁴, so q = 1.12×10⁻⁷ C = 0.112 μC and 3q = 0.336 μC.',
    difficulty: 'advanced',
    tags: ['coulombs-law', 'charge-calculation', 'algebraic-manipulation']
  },
  
  // Question 10
  {
    questionText: "Two small spheres, each with a mass of 2.00 × 10⁻⁵ kg are horizontally placed 0.350 m apart. One sphere has a charge of 2.00 μC and is fixed in position. The other sphere has a charge of 3.00 μC and is free to move. What is the initial acceleration of the second sphere?",
    options: [
      { id: 'a', text: '2.2 × 10⁴ m/s²', feedback: 'Correct! F = k q₁q₂/r² = 0.44 N, then a = F/m = 0.44 N/(2.00×10⁻⁵ kg) = 2.2×10⁴ m/s².' },
      { id: 'b', text: '4.4 × 10⁴ m/s²', feedback: 'Incorrect. Check your force calculation: F = (9×10⁹)(2×10⁻⁶)(3×10⁻⁶)/(0.35)² = 0.44 N.' },
      { id: 'c', text: '1.1 × 10⁴ m/s²', feedback: 'Incorrect. You may have used the wrong mass or made an error in the force calculation.' },
      { id: 'd', text: '8.8 × 10⁴ m/s²', feedback: 'Incorrect. Double-check both your force calculation and Newton\'s second law application.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find the electric force: F = kq₁q₂/r² = (9.0×10⁹)(2.00×10⁻⁶)(3.00×10⁻⁶)/(0.350)² = (54×10⁻³)/(0.1225) = 0.441 N. Then use Newton\'s second law: a = F/m = 0.441 N/(2.00×10⁻⁵ kg) = 2.2×10⁴ m/s².',
    difficulty: 'advanced',
    tags: ['coulombs-law', 'newtons-second-law', 'acceleration', 'electric-force']
  }
];

// Export the handlers directly for Firebase Functions
exports.course2_28_l1314_question1 = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question2 = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question3 = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question4 = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question5 = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question6 = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question7 = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question8 = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question9 = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

exports.course2_28_l1314_question10 = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 3,
  pointsValue: 1
});

// Export assessment configurations for master function
const assessmentConfigs = {
  'course2_28_l1314_question1': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question2': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question3': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question4': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question5': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question6': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question7': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question8': {
    questions: [questions[7]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question9': {
    questions: [questions[8]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_28_l1314_question10': {
    questions: [questions[9]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;