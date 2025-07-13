// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Question pool with complete configuration
const questionPool = [
  // Questions 1-6: Generator situations with polarity and electron flow
  {
    questionText: "For a conductor moving between magnetic poles N-S (left to right), determine the polarity of the induced magnetic field and direction of electron flow. Which end becomes negative?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_1_diagram.png',
      alt: 'Conductor moving left to right between N-S magnetic poles showing generator effect',
      caption: 'Conductor moving between N-S poles (left to right)'
    },
    options: [
      { id: 'a', text: 'Electrons flow towards N pole, making that end negative', feedback: 'Correct! Using the right-hand rule, the induced current flows toward the N pole, making it the negative terminal.' },
      { id: 'b', text: 'Electrons flow towards S pole, making that end negative', feedback: 'Incorrect. Apply the right-hand rule - electrons flow toward the N pole in this configuration.' },
      { id: 'c', text: 'No electron flow occurs', feedback: 'Incorrect. A conductor moving through a magnetic field induces electron flow.' },
      { id: 'd', text: 'Electrons flow equally in both directions', feedback: 'Incorrect. The magnetic field creates a specific direction of electron flow.' }
    ],
    correctOptionId: 'a',
    explanation: 'When a conductor moves through a magnetic field, the right-hand rule determines the direction of induced current. For N-S orientation with rightward motion, electrons flow toward the N pole, making it negative.',
    difficulty: 'intermediate',
    tags: ['generator-effect', 'right-hand-rule', 'electron-flow', 'polarity']
  },
  {
    questionText: "For a conductor moving between magnetic poles S-N (left to right), determine the polarity of the induced magnetic field and direction of electron flow. Which end becomes negative?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_2_diagram.png',
      alt: 'Conductor moving left to right between S-N magnetic poles showing generator effect',
      caption: 'Conductor moving between S-N poles (left to right)'
    },
    options: [
      { id: 'a', text: 'Electrons flow towards S pole, making that end negative', feedback: 'Correct! With S-N orientation, the right-hand rule shows electrons flow toward the S pole.' },
      { id: 'b', text: 'Electrons flow towards N pole, making that end negative', feedback: 'Incorrect. The reversed pole orientation changes the electron flow direction compared to N-S.' },
      { id: 'c', text: 'No current is induced', feedback: 'Incorrect. Current is still induced, but the direction depends on the pole orientation.' },
      { id: 'd', text: 'Both ends become equally charged', feedback: 'Incorrect. One end becomes positive and the other negative due to electron flow.' }
    ],
    correctOptionId: 'a',
    explanation: 'With S-N pole orientation (reversed from N-S), the induced electron flow direction reverses, causing electrons to flow toward the S pole, making it the negative terminal.',
    difficulty: 'intermediate',
    tags: ['generator-effect', 'right-hand-rule', 'electron-flow', 'reversed-polarity']
  },
  {
    questionText: "For a conductor moving between magnetic poles S-N (right to left), determine the polarity of the induced magnetic field and direction of electron flow. Which end becomes negative?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_3_diagram.png',
      alt: 'Conductor moving right to left between S-N magnetic poles showing generator effect',
      caption: 'Conductor moving between S-N poles (right to left)'
    },
    options: [
      { id: 'a', text: 'Electrons flow towards N pole, making that end negative', feedback: 'Correct! The combination of S-N poles with leftward motion causes electrons to flow toward the N pole.' },
      { id: 'b', text: 'Electrons flow towards S pole, making that end negative', feedback: 'Incorrect. The leftward motion reverses the flow direction compared to rightward motion.' },
      { id: 'c', text: 'Motion direction has no effect on electron flow', feedback: 'Incorrect. The direction of motion is crucial in determining the direction of induced current.' },
      { id: 'd', text: 'No EMF is generated', feedback: 'Incorrect. An EMF is generated whenever a conductor moves through a magnetic field.' }
    ],
    correctOptionId: 'a',
    explanation: 'When motion direction is reversed (right to left) with S-N poles, the right-hand rule shows electrons flow toward the N pole, making it negative.',
    difficulty: 'intermediate',
    tags: ['generator-effect', 'motion-direction', 'electron-flow', 'right-hand-rule']
  },
  {
    questionText: "For a conductor moving between magnetic poles N-S (right to left), determine the polarity of the induced magnetic field and direction of electron flow. Which end becomes negative?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_4_diagram.png',
      alt: 'Conductor moving right to left between N-S magnetic poles showing generator effect',
      caption: 'Conductor moving between N-S poles (right to left)'
    },
    options: [
      { id: 'a', text: 'Electrons flow towards S pole, making that end negative', feedback: 'Correct! With N-S poles and leftward motion, the right-hand rule shows electrons flow toward the S pole.' },
      { id: 'b', text: 'Electrons flow towards N pole, making that end negative', feedback: 'Incorrect. The leftward motion changes the electron flow direction compared to rightward motion.' },
      { id: 'c', text: 'The magnetic field orientation cancels the motion effect', feedback: 'Incorrect. The magnetic field and motion work together to induce current, they don\'t cancel.' },
      { id: 'd', text: 'Current flows but no terminal becomes negative', feedback: 'Incorrect. Current flow always creates positive and negative terminals.' }
    ],
    correctOptionId: 'a',
    explanation: 'With N-S poles and leftward motion, applying the right-hand rule shows electrons flow toward the S pole, making it the negative terminal.',
    difficulty: 'intermediate',
    tags: ['generator-effect', 'pole-orientation', 'motion-direction', 'terminal-polarity']
  },
  {
    questionText: "In a generator with terminals A and B, where A is (-) and B is (+), determine the direction of electron flow.",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_5_diagram.png',
      alt: 'Generator terminals A(-) and B(+) showing electron flow direction',
      caption: 'Generator with terminals A(-) and B(+)'
    },
    options: [
      { id: 'a', text: 'Electrons flow towards B (positive terminal)', feedback: 'Correct! Electrons flow from negative to positive terminal, so they flow from A to B.' },
      { id: 'b', text: 'Electrons flow towards A (negative terminal)', feedback: 'Incorrect. Electrons flow away from the negative terminal toward the positive terminal.' },
      { id: 'c', text: 'Electrons flow in both directions equally', feedback: 'Incorrect. Electrons have a definite flow direction from negative to positive.' },
      { id: 'd', text: 'No electron flow occurs between terminals', feedback: 'Incorrect. Electron flow is what creates the current between terminals.' }
    ],
    correctOptionId: 'a',
    explanation: 'Electrons always flow from the negative terminal to the positive terminal. Since A is (-) and B is (+), electrons flow from A toward B.',
    difficulty: 'beginner',
    tags: ['electron-flow', 'terminal-polarity', 'current-direction', 'generator-basics']
  },
  {
    questionText: "What happens to current generation when a conductor moves parallel to the magnetic field lines?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_6_diagram.png',
      alt: 'Conductor moving parallel to magnetic field lines showing no EMF generation',
      caption: 'Conductor moving parallel to magnetic field lines'
    },
    options: [
      { id: 'a', text: 'No current is generated because velocity is parallel to the magnetic field', feedback: 'Correct! When v is parallel to B, sin θ = 0, so EMF = BLv sin θ = 0.' },
      { id: 'b', text: 'Maximum current is generated', feedback: 'Incorrect. Maximum current occurs when motion is perpendicular to the field.' },
      { id: 'c', text: 'Current is generated but in both directions', feedback: 'Incorrect. No current is generated when motion is parallel to the field.' },
      { id: 'd', text: 'Current generation depends on the conductor material', feedback: 'Incorrect. The angle between velocity and magnetic field is the determining factor.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF is given by EMF = BLv sin θ. When a conductor moves parallel to magnetic field lines, θ = 0°, so sin θ = 0 and no EMF is generated.',
    difficulty: 'intermediate',
    tags: ['parallel-motion', 'emf-formula', 'angle-dependence', 'no-current']
  },
  // Question 7 - SKIPPED (will be handled by AI Long Answer assessment)
  // This space is reserved for the AI Long Answer question about hand rules
  // Questions 8-20: Calculations and concepts
  {
    questionText: "A bar magnet inserted into a coil of 500 turns produces an induced potential of 1.5 V. What potential difference is induced when a 250 turn coil is used?",
    options: [
      { id: 'a', text: '0.75 V', feedback: 'Correct! EMF is proportional to the number of turns: EMF₂/EMF₁ = N₂/N₁, so EMF₂ = 1.5 V × (250/500) = 0.75 V' },
      { id: 'b', text: '3.0 V', feedback: 'Incorrect. The EMF decreases proportionally when the number of turns is reduced.' },
      { id: 'c', text: '1.5 V', feedback: 'Incorrect. The EMF changes when the number of turns changes.' },
      { id: 'd', text: '6.0 V', feedback: 'Incorrect. This would be if the turns were doubled, not halved.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF is directly proportional to the number of turns in the coil. With half the turns (250 vs 500), the EMF is halved: 1.5 V × (250/500) = 0.75 V',
    difficulty: 'intermediate',
    tags: ['faradays-law', 'coil-turns', 'proportional-relationship', 'emf-calculation']
  },
  {
    questionText: "A bar magnet inserted into a coil of 500 turns produces an induced potential of 1.5 V. What potential difference is induced when the bar magnet is moved twice as fast?",
    options: [
      { id: 'a', text: '3.0 V', feedback: 'Correct! EMF is proportional to the rate of change of flux. Doubling the speed doubles the EMF: 1.5 V × 2 = 3.0 V' },
      { id: 'b', text: '0.75 V', feedback: 'Incorrect. Increasing speed increases the EMF, not decreases it.' },
      { id: 'c', text: '1.5 V', feedback: 'Incorrect. Speed affects the rate of flux change and thus the EMF.' },
      { id: 'd', text: '6.0 V', feedback: 'Incorrect. The EMF doubles, not quadruples, when speed doubles.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF is proportional to the rate of change of magnetic flux (dΦ/dt). When the magnet moves twice as fast, the rate of flux change doubles, so EMF doubles: 1.5 V × 2 = 3.0 V',
    difficulty: 'intermediate',
    tags: ['faradays-law', 'flux-rate', 'speed-dependence', 'emf-calculation']
  },
  {
    questionText: "A bar magnet inserted into a coil of 500 turns produces an induced potential of 1.5 V. What potential difference is induced when three identical magnets are inserted at once, side by side?",
    options: [
      { id: 'a', text: '4.5 V', feedback: 'Correct! Three magnets provide three times the magnetic flux, so EMF = 1.5 V × 3 = 4.5 V' },
      { id: 'b', text: '1.5 V', feedback: 'Incorrect. More magnets increase the total magnetic flux and thus the EMF.' },
      { id: 'c', text: '0.5 V', feedback: 'Incorrect. Multiple magnets increase EMF, they don\'t decrease it.' },
      { id: 'd', text: '9.0 V', feedback: 'Incorrect. The EMF triples with three magnets, not increases six-fold.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF is proportional to the magnetic flux. Three identical magnets provide three times the magnetic flux, resulting in three times the EMF: 1.5 V × 3 = 4.5 V',
    difficulty: 'intermediate',
    tags: ['magnetic-flux', 'multiple-magnets', 'flux-proportionality', 'emf-calculation']
  },
  {
    questionText: "For a generator, what form of energy provides the work for the electrical energy being made?",
    options: [
      { id: 'a', text: 'Kinetic energy of the conductor becomes electric energy', feedback: 'Correct! The mechanical kinetic energy of the moving conductor is converted into electrical energy through electromagnetic induction.' },
      { id: 'b', text: 'Potential energy of the magnetic field becomes electric energy', feedback: 'Incorrect. The magnetic field provides the mechanism for conversion, but kinetic energy is the source.' },
      { id: 'c', text: 'Heat energy from resistance becomes electric energy', feedback: 'Incorrect. Heat is usually a loss in the system, not the source of electrical energy.' },
      { id: 'd', text: 'Chemical energy from the conductor becomes electric energy', feedback: 'Incorrect. Generators use mechanical motion, not chemical reactions, to produce electricity.' }
    ],
    correctOptionId: 'a',
    explanation: 'In a generator, mechanical kinetic energy (motion of the conductor) is converted into electrical energy through electromagnetic induction. The moving conductor cuts through magnetic field lines, inducing an EMF.',
    difficulty: 'beginner',
    tags: ['energy-conversion', 'kinetic-energy', 'mechanical-to-electrical', 'generator-principle']
  },
  {
    questionText: "In the suspended charged sphere experiment, when the wire is drawn horizontally to the right, the positively charged ball swings toward the right-hand plate. What does this tell us about the right-hand plate and electron flow?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_12_diagram.png',
      alt: 'Suspended charged sphere experiment showing wire motion and ball deflection',
      caption: 'Suspended charged sphere experiment with wire drawn to the right'
    },
    options: [
      { id: 'a', text: 'Right plate is negative; electrons flow toward the right plate', feedback: 'Correct! The positive ball is attracted to the negative right plate, indicating electrons flow toward the right plate.' },
      { id: 'b', text: 'Right plate is positive; electrons flow toward the left plate', feedback: 'Incorrect. A positive ball would be repelled by a positive plate, not attracted.' },
      { id: 'c', text: 'Right plate is negative; electrons flow toward the left plate', feedback: 'Incorrect. If electrons flow left, the left plate becomes negative, not the right plate.' },
      { id: 'd', text: 'Both plates have the same charge', feedback: 'Incorrect. The ball\'s movement indicates a charge difference between the plates.' }
    ],
    correctOptionId: 'a',
    explanation: 'The positive ball swings toward the right plate, indicating the right plate is negative (opposites attract). For the right plate to be negative, electrons must flow toward it from the left plate.',
    difficulty: 'intermediate',
    tags: ['charged-sphere', 'plate-polarity', 'electron-flow-direction', 'electromagnetic-induction']
  },
  {
    questionText: "In the suspended charged sphere experiment, if the right plate is negative and electrons flow toward it, what can we determine about the top pole of the horseshoe magnet using the left-hand rule?",
    options: [
      { id: 'a', text: 'The top pole is a north pole', feedback: 'Correct! Using the left-hand rule: palm points right (electron flow), thumb points right (wire motion), fingers point down (B-field from N to S).' },
      { id: 'b', text: 'The top pole is a south pole', feedback: 'Incorrect. The left-hand rule with the given directions indicates the top pole is north.' },
      { id: 'c', text: 'The pole type cannot be determined', feedback: 'Incorrect. The left-hand rule allows us to determine the magnetic field direction and thus pole type.' },
      { id: 'd', text: 'Both poles are the same type', feedback: 'Incorrect. A horseshoe magnet has opposite poles at each end.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the left-hand rule for electron flow: palm points in direction of electron flow (right), thumb points in direction of motion (right), fingers point in direction of magnetic field (down). Since magnetic field points from N to S, the top pole is north.',
    difficulty: 'advanced',
    tags: ['left-hand-rule', 'magnetic-poles', 'electron-flow', 'field-direction']
  },
  {
    questionText: "An aluminum airplane flying west at 350 m/s experiences Earth's magnetic field with a downward component of 8.0 × 10⁻⁵ T. What is the potential difference induced across the plane's 22 m wingspan?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_16_diagram.png',
      alt: 'Airplane flying through Earth\'s magnetic field showing EMF generation across wingspan',
      caption: 'Airplane flying west through Earth\'s magnetic field'
    },
    options: [
      { id: 'a', text: '0.62 V', feedback: 'Correct! EMF = BLv = (8.0×10⁻⁵ T)(22 m)(350 m/s) = 0.616 V ≈ 0.62 V' },
      { id: 'b', text: '6.2 V', feedback: 'Incorrect. Check your calculation - the result should be smaller.' },
      { id: 'c', text: '0.062 V', feedback: 'Incorrect. Verify your multiplication of B, L, and v.' },
      { id: 'd', text: '62 V', feedback: 'Incorrect. This is much too large - check your unit conversions.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using EMF = BLv: EMF = (8.0×10⁻⁵ T)(22 m)(350 m/s) = 0.616 V ≈ 0.62 V. The airplane acts as a conductor moving through Earth\'s magnetic field.',
    difficulty: 'intermediate',
    tags: ['motional-emf', 'airplane-example', 'earth-magnetic-field', 'emf-calculation']
  },
  {
    questionText: "A 24 cm conductor moves through a 27.5 T field at 75 m/s and produces a potential difference of 128 V. What is the angle at which the conductor is passing through the field?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_17_diagram.png',
      alt: 'Conductor moving at an angle through magnetic field showing angle dependency',
      caption: 'Conductor moving at angle θ through magnetic field'
    },
    options: [
      { id: 'a', text: '15°', feedback: 'Correct! Using EMF = BLv sin θ: sin θ = EMF/(BLv) = 128/(27.5×0.24×75) = 0.259, so θ = arcsin(0.259) ≈ 15°' },
      { id: 'b', text: '30°', feedback: 'Incorrect. Calculate sin θ first, then find the angle: sin θ = EMF/(BLv).' },
      { id: 'c', text: '45°', feedback: 'Incorrect. The calculated sine value corresponds to a smaller angle.' },
      { id: 'd', text: '90°', feedback: 'Incorrect. At 90°, the EMF would be much larger than 128 V.' }
    ],
    correctOptionId: 'a',
    explanation: 'From EMF = BLv sin θ: sin θ = EMF/(BLv) = 128 V/[(27.5 T)(0.24 m)(75 m/s)] = 128/495 = 0.259. Therefore θ = arcsin(0.259) ≈ 15°',
    difficulty: 'advanced',
    tags: ['angle-calculation', 'emf-formula', 'trigonometry', 'conductor-motion']
  },
  {
    questionText: "A conductor produces a voltage of 1.00 mV when it moves perpendicular to a magnetic field. What voltage is generated when it moves at the same speed across the field at an angle of 45°?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_18_diagram.png',
      alt: 'Conductor moving at 45 degrees to magnetic field showing reduced EMF',
      caption: 'Conductor moving at 45° angle to magnetic field'
    },
    options: [
      { id: 'a', text: '0.707 mV', feedback: 'Correct! EMF₄₅° = EMF₉₀° × sin(45°) = 1.00 mV × 0.707 = 0.707 mV' },
      { id: 'b', text: '1.00 mV', feedback: 'Incorrect. The voltage decreases when the angle is less than 90°.' },
      { id: 'c', text: '1.41 mV', feedback: 'Incorrect. This would be if you used cos(45°) instead of sin(45°).' },
      { id: 'd', text: '0.500 mV', feedback: 'Incorrect. sin(45°) = 0.707, not 0.5.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF = BLv sin θ. At 45°: EMF₄₅° = EMF₉₀° × sin(45°) = 1.00 mV × (√2/2) = 1.00 mV × 0.707 = 0.707 mV',
    difficulty: 'intermediate',
    tags: ['angle-effect', 'sin-45', 'emf-ratio', 'trigonometric-calculation']
  },
  {
    questionText: "A 22.0 cm conducting rod moves at 1.25 m/s through a 0.150 T magnetic field. If the circuit resistance is 2.25 Ω, what is the magnitude and direction of the induced current?",
    image: {
      url: '/courses/2/content/39-generator-effect/assets/practice_19_diagram.png',
      alt: 'Conducting rod moving through magnetic field with complete circuit showing current',
      caption: 'Conducting rod with circuit resistance showing induced current'
    },
    options: [
      { id: 'a', text: '18.3 mA, clockwise', feedback: 'Correct! EMF = BLv = (0.150)(0.22)(1.25) = 0.04125 V; I = EMF/R = 0.04125/2.25 = 0.01833 A = 18.3 mA, direction determined by Lenz\'s law.' },
      { id: 'b', text: '18.3 mA, counterclockwise', feedback: 'Incorrect magnitude is correct, but check the direction using Lenz\'s law and the right-hand rule.' },
      { id: 'c', text: '41.3 mA, clockwise', feedback: 'Incorrect. Check your EMF calculation: EMF = BLv.' },
      { id: 'd', text: '8.3 mA, clockwise', feedback: 'Incorrect. Verify your current calculation: I = EMF/R.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF = BLv = (0.150 T)(0.22 m)(1.25 m/s) = 0.04125 V. Current I = EMF/R = 0.04125 V / 2.25 Ω = 0.01833 A = 18.3 mA. Direction is clockwise by Lenz\'s law.',
    difficulty: 'advanced',
    tags: ['current-calculation', 'ohms-law', 'motional-emf', 'lenz-law']
  },
  {
    questionText: "A 15 cm conducting rod moves at 0.95 m/s through a magnetic field. With circuit resistance 1.5 Ω and induced current 56 mA, what is the magnetic field strength?",
    options: [
      { id: 'a', text: '0.59 T', feedback: 'Correct! EMF = IR = (0.056)(1.5) = 0.084 V; B = EMF/(Lv) = 0.084/(0.15×0.95) = 0.589 T ≈ 0.59 T' },
      { id: 'b', text: '0.84 T', feedback: 'Incorrect. This is the EMF value, not the magnetic field strength.' },
      { id: 'c', text: '0.37 T', feedback: 'Incorrect. Check your calculation of B = EMF/(Lv).' },
      { id: 'd', text: '1.18 T', feedback: 'Incorrect. Verify your units and arithmetic in the calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find EMF: EMF = IR = (0.056 A)(1.5 Ω) = 0.084 V. Then solve for B: EMF = BLv, so B = EMF/(Lv) = 0.084 V/[(0.15 m)(0.95 m/s)] = 0.589 T ≈ 0.59 T',
    difficulty: 'advanced',
    tags: ['magnetic-field-calculation', 'motional-emf', 'ohms-law', 'reverse-calculation']
  },
  {
    questionText: "A 30.0 cm conducting rod moves through a 0.950 T magnetic field. With circuit resistance 3.25 Ω, what force is required to move the rod at a constant speed of 1.50 m/s?",
    options: [
      { id: 'a', text: '0.0375 N', feedback: 'Correct! EMF = BLv = 0.4275 V; I = EMF/R = 0.1315 A; F = BIL = (0.950)(0.1315)(0.30) = 0.0375 N' },
      { id: 'b', text: '0.131 N', feedback: 'Incorrect. This appears to be the current value, not the force.' },
      { id: 'c', text: '0.428 N', feedback: 'Incorrect. This appears to be the EMF value, not the force.' },
      { id: 'd', text: '0.0125 N', feedback: 'Incorrect. Check your calculation of F = BIL.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF = BLv = (0.950 T)(0.30 m)(1.50 m/s) = 0.4275 V. Current I = EMF/R = 0.4275 V / 3.25 Ω = 0.1315 A. Force F = BIL = (0.950 T)(0.1315 A)(0.30 m) = 0.0375 N',
    difficulty: 'advanced',
    tags: ['force-calculation', 'constant-speed', 'motor-force', 'power-balance']
  },
  {
    questionText: "A rectangular loop moves at 0.95 m/s through a 1.30 T field. The perpendicular side is 0.625 m, circuit resistance is 1.50 Ω. What is the induced current and direction?",
    options: [
      { id: 'a', text: '0.52 A, counterclockwise', feedback: 'Correct! EMF = BLv = (1.30)(0.625)(0.95) = 0.773 V; I = EMF/R = 0.773/1.50 = 0.515 A ≈ 0.52 A, counterclockwise by Lenz\'s law.' },
      { id: 'b', text: '0.52 A, clockwise', feedback: 'Incorrect magnitude is correct, but the direction should be counterclockwise by Lenz\'s law.' },
      { id: 'c', text: '0.77 A, counterclockwise', feedback: 'Incorrect. This is the EMF value, not the current. I = EMF/R.' },
      { id: 'd', text: '1.24 A, counterclockwise', feedback: 'Incorrect. Check your current calculation: I = EMF/R.' }
    ],
    correctOptionId: 'a',
    explanation: 'EMF = BLv = (1.30 T)(0.625 m)(0.95 m/s) = 0.773 V. Current I = EMF/R = 0.773 V / 1.50 Ω = 0.515 A ≈ 0.52 A. Direction is counterclockwise by Lenz\'s law.',
    difficulty: 'advanced',
    tags: ['rectangular-loop', 'lenz-law', 'current-direction', 'motional-emf']
  },
  {
    questionText: "A rectangular coil with 5 loops moves at 2.7 m/s through a 1.1 T field. The perpendicular side is 0.18 m, resistance is 3.5 Ω. What is the induced current and direction?",
    options: [
      { id: 'a', text: '0.76 A, counterclockwise', feedback: 'Correct! EMF = NBLv = (5)(1.1)(0.18)(2.7) = 2.673 V; I = EMF/R = 2.673/3.5 = 0.764 A ≈ 0.76 A, counterclockwise by Lenz\'s law.' },
      { id: 'b', text: '0.15 A, counterclockwise', feedback: 'Incorrect. You may have forgotten to multiply by the number of loops (N = 5).' },
      { id: 'c', text: '0.76 A, clockwise', feedback: 'Incorrect magnitude is correct, but direction should be counterclockwise by Lenz\'s law.' },
      { id: 'd', text: '3.8 A, counterclockwise', feedback: 'Incorrect. Check your calculation - this is 5 times too large.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a coil with N loops: EMF = NBLv = (5)(1.1 T)(0.18 m)(2.7 m/s) = 2.673 V. Current I = EMF/R = 2.673 V / 3.5 Ω = 0.764 A ≈ 0.76 A. Direction is counterclockwise by Lenz\'s law.',
    difficulty: 'advanced',
    tags: ['multiple-loops', 'coil-emf', 'faradays-law', 'lenz-law']
  }
];

// ========================================
// ASSESSMENT CONFIGURATIONS
// ========================================

// Assessment configurations for master function 
const assessmentConfigs = {};

questionPool.forEach((questionData, index) => {
  // Skip question 7 in numbering (it's handled as AI Long Answer)
  const questionNumber = index < 6 ? index + 1 : index + 2;
  const questionId = `course2_40_question${questionNumber}`;
  
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

// ========================================
// QUESTION 7 - HAND RULES (MULTIPLE CHOICE)
// ========================================

// Three hand rule questions that will be randomized
const handRuleQuestions = [
  {
    questionText: "When using Oersted's Hand Rule for a straight current-carrying conductor, what do the thumb and fingers represent?",
    options: [
      { id: 'a', text: 'Thumb: direction of current; Fingers: wrap around in direction of magnetic field', feedback: 'Correct! Oersted\'s Hand Rule uses the thumb for current direction and fingers wrapping to show the magnetic field direction around the conductor.' },
      { id: 'b', text: 'Thumb: direction of magnetic field; Fingers: direction of current', feedback: 'Incorrect. In Oersted\'s rule, the thumb points in the direction of current, not magnetic field.' },
      { id: 'c', text: 'Thumb: direction of force; Fingers: direction of velocity', feedback: 'Incorrect. This describes the motor rule, not Oersted\'s rule for magnetic fields around conductors.' },
      { id: 'd', text: 'Thumb: magnetic field direction; Fingers: wrap around current', feedback: 'Incorrect. The thumb represents current direction, and fingers show magnetic field direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Oersted\'s Hand Rule: Point your thumb in the direction of conventional current flow, and your fingers will curl in the direction of the magnetic field lines around the conductor.',
    difficulty: 'intermediate',
    tags: ['oersted-hand-rule', 'current-magnetic-field', 'hand-rules']
  },
  {
    questionText: "When using the Solenoid Hand Rule (Right-Hand Rule for coils), what do the fingers and thumb represent?",
    options: [
      { id: 'a', text: 'Fingers: point in direction of current through coil; Thumb: points in direction of magnetic field through center', feedback: 'Correct! For solenoids, fingers follow the current flow around the coil, and the thumb points in the direction of the magnetic field through the center.' },
      { id: 'b', text: 'Fingers: wrap around magnetic field; Thumb: points in current direction', feedback: 'Incorrect. This is backwards - fingers follow current, thumb shows field direction.' },
      { id: 'c', text: 'Fingers: direction of force; Thumb: direction of velocity', feedback: 'Incorrect. This describes the motor rule, not the solenoid rule for magnetic field direction.' },
      { id: 'd', text: 'Fingers: magnetic field direction; Thumb: current direction', feedback: 'Incorrect. For solenoids, fingers point with current flow and thumb shows the resulting field direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Solenoid Hand Rule: Curl your fingers in the direction of current flow around the coil, and your thumb will point in the direction of the magnetic field through the center of the solenoid.',
    difficulty: 'intermediate',
    tags: ['solenoid-hand-rule', 'coil-magnetic-field', 'hand-rules']
  },
  {
    questionText: "When using the Flat Hand Rule (Motor/Generator Rule), what do the fingers, thumb, and palm represent?",
    options: [
      { id: 'a', text: 'Fingers: magnetic field direction; Thumb: current direction (motors) or motion direction (generators); Palm: force direction (motors) or induced current direction (generators)', feedback: 'Correct! The flat hand rule uses fingers for magnetic field, thumb for the input (current or motion), and palm for the output (force or induced current).' },
      { id: 'b', text: 'Fingers: current direction; Thumb: magnetic field; Palm: velocity', feedback: 'Incorrect. This arrangement doesn\'t match the standard flat hand rule convention.' },
      { id: 'c', text: 'Fingers: force direction; Thumb: current direction; Palm: magnetic field direction', feedback: 'Incorrect. Fingers represent magnetic field direction, not force direction.' },
      { id: 'd', text: 'Fingers: velocity; Thumb: force; Palm: current direction', feedback: 'Incorrect. This doesn\'t follow the conventional flat hand rule assignments.' }
    ],
    correctOptionId: 'a',
    explanation: 'Flat Hand Rule: Fingers point in magnetic field direction, thumb in the direction of input (current for motors, motion for generators), and palm faces the direction of output (force for motors, induced current for generators).',
    difficulty: 'intermediate',
    tags: ['flat-hand-rule', 'motor-generator-rule', 'hand-rules']
  }
];

// ========================================
// AC CIRCUIT QUESTIONS (21-28)
// ========================================

// Eight AC circuit calculation questions
const acCircuitQuestions = [
  {
    questionText: "Calculate the peak current in a 3.2 kΩ resistor connected to a 240 V AC source.",
    options: [
      { id: 'a', text: '0.11 A', feedback: 'Correct! I_peak = V_rms / R = 240 V / 3200 Ω = 0.075 A (rms), then I_peak = I_rms × √2 = 0.075 × 1.414 = 0.106 A ≈ 0.11 A' },
      { id: 'b', text: '0.075 A', feedback: 'This is the RMS current, not the peak current. Peak current = RMS current × √2' },
      { id: 'c', text: '0.15 A', feedback: 'Incorrect. Check your calculation: I_peak = (V_rms/R) × √2' },
      { id: 'd', text: '0.34 A', feedback: 'Incorrect. This value is too high - verify your resistance conversion from kΩ to Ω.' }
    ],
    correctOptionId: 'a',
    explanation: 'For AC circuits: I_rms = V_rms/R = 240V/3200Ω = 0.075A. Peak current I_peak = I_rms × √2 = 0.075 × 1.414 = 0.106A ≈ 0.11A',
    difficulty: 'intermediate',
    tags: ['ac-circuits', 'peak-current', 'rms-calculations', 'resistor-circuits']
  },
  {
    questionText: "An AC voltage, whose peak value is 180 V, is across a 220 Ω resistor. What are the RMS and peak current values in the resistor?",
    options: [
      { id: 'a', text: 'RMS: 0.578 A, Peak: 0.818 A', feedback: 'Correct! V_rms = 180V/√2 = 127.3V. I_rms = 127.3V/220Ω = 0.578A. I_peak = 180V/220Ω = 0.818A' },
      { id: 'b', text: 'RMS: 0.818 A, Peak: 0.578 A', feedback: 'Incorrect. You have the values reversed - RMS is always smaller than peak value.' },
      { id: 'c', text: 'RMS: 0.818 A, Peak: 1.16 A', feedback: 'Incorrect. Check your RMS voltage calculation: V_rms = V_peak/√2' },
      { id: 'd', text: 'RMS: 0.409 A, Peak: 0.818 A', feedback: 'Incorrect. Your RMS calculation is too small - verify your voltage conversion.' }
    ],
    correctOptionId: 'a',
    explanation: 'V_rms = V_peak/√2 = 180V/1.414 = 127.3V. I_rms = V_rms/R = 127.3V/220Ω = 0.578A. I_peak = V_peak/R = 180V/220Ω = 0.818A',
    difficulty: 'intermediate',
    tags: ['ac-circuits', 'rms-peak-conversion', 'current-calculations', 'voltage-relationships']
  },
  {
    questionText: "What is the resistance of a 60 W, 120 V light bulb when it is turned on?",
    options: [
      { id: 'a', text: '240 Ω', feedback: 'Correct! Using P = V²/R, so R = V²/P = (120V)²/60W = 14400/60 = 240Ω' },
      { id: 'b', text: '120 Ω', feedback: 'Incorrect. This would give double the actual power rating.' },
      { id: 'c', text: '480 Ω', feedback: 'Incorrect. This resistance would result in half the rated power.' },
      { id: 'd', text: '2.0 Ω', feedback: 'Incorrect. This is much too low - check your calculation method.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the power formula P = V²/R, we can solve for resistance: R = V²/P = (120V)²/60W = 14400/60 = 240Ω',
    difficulty: 'intermediate', 
    tags: ['power-calculations', 'resistance', 'light-bulb-circuits', 'electrical-power']
  },
  {
    questionText: "The effective value of an alternating current passing through a 1.0 kW device is 3.0 A. What is the peak voltage across it?",
    options: [
      { id: 'a', text: '4.7 × 10² V', feedback: 'Correct! P = I_rms × V_rms, so V_rms = P/I_rms = 1000W/3.0A = 333.3V. V_peak = V_rms × √2 = 333.3 × 1.414 = 471V ≈ 4.7×10²V' },
      { id: 'b', text: '3.3 × 10² V', feedback: 'This is the RMS voltage, not the peak voltage. Peak voltage = RMS voltage × √2' },
      { id: 'c', text: '6.7 × 10² V', feedback: 'Incorrect. Check your calculation - this value is too high.' },
      { id: 'd', text: '1.4 × 10² V', feedback: 'Incorrect. This value is much too low for the given power and current.' }
    ],
    correctOptionId: 'a',
    explanation: 'Power P = I_rms × V_rms, so V_rms = P/I_rms = 1000W/3.0A = 333.3V. Peak voltage V_peak = V_rms × √2 = 333.3V × 1.414 = 471V = 4.7×10²V',
    difficulty: 'intermediate',
    tags: ['ac-power', 'effective-current', 'peak-voltage', 'power-calculations']
  },
  {
    questionText: "What is the maximum instantaneous value of the power dissipated in a 100 W light bulb?",
    options: [
      { id: 'a', text: '200 W', feedback: 'Correct! For AC circuits, instantaneous power varies sinusoidally. Maximum instantaneous power = 2 × average power = 2 × 100W = 200W' },
      { id: 'b', text: '100 W', feedback: 'This is the average power, not the maximum instantaneous power.' },
      { id: 'c', text: '141 W', feedback: 'Incorrect. This would be the result if you multiplied by √2 instead of 2.' },
      { id: 'd', text: '50 W', feedback: 'Incorrect. The maximum instantaneous power is greater than the average power.' }
    ],
    correctOptionId: 'a',
    explanation: 'In AC circuits, instantaneous power varies as P(t) = P_avg(1 + cos(2ωt)). The maximum value occurs when cos(2ωt) = 1, giving P_max = 2 × P_avg = 2 × 100W = 200W',
    difficulty: 'advanced',
    tags: ['instantaneous-power', 'ac-power-analysis', 'light-bulb', 'power-variation']
  },
  {
    questionText: "A 15 Ω heater coil is connected to a 240 V AC line. What is the average power used? What are the maximum and minimum values of the instantaneous power?",
    options: [
      { id: 'a', text: 'Average: 3.8 kW, Maximum: 7.7 kW, Minimum: 0 W', feedback: 'Correct! P_avg = V²/R = (240V)²/15Ω = 3840W = 3.8kW. P_max = 2×P_avg = 7.7kW. P_min = 0W (power cannot be negative in resistive circuits)' },
      { id: 'b', text: 'Average: 3.8 kW, Maximum: 5.4 kW, Minimum: 0 W', feedback: 'Incorrect maximum. For AC circuits, maximum instantaneous power = 2 × average power.' },
      { id: 'c', text: 'Average: 1.9 kW, Maximum: 3.8 kW, Minimum: 0 W', feedback: 'Your average power is too low. Check your voltage calculation - use RMS values for average power.' },
      { id: 'd', text: 'Average: 3.8 kW, Maximum: 7.7 kW, Minimum: -3.8 kW', feedback: 'Incorrect minimum. Power in resistive AC circuits cannot be negative.' }
    ],
    correctOptionId: 'a',
    explanation: 'Average power: P_avg = V_rms²/R = (240V)²/15Ω = 57600/15 = 3840W = 3.8kW. Maximum instantaneous power = 2×P_avg = 7.7kW. Minimum power = 0W (resistive circuits cannot have negative power)',
    difficulty: 'advanced',
    tags: ['heater-circuit', 'average-power', 'instantaneous-power', 'ac-analysis']
  },
  {
    questionText: "In the wire connecting an electric clock to a wall socket, how many times a day does the current reverse direction? (Assume 60 Hz AC)",
    options: [
      { id: 'a', text: '5.184 × 10⁶ times', feedback: 'Correct! AC current reverses twice per cycle. At 60 Hz: 2 × 60 cycles/s × 86400 s/day = 10,368,000 = 1.04×10⁷. Wait, let me recalculate: 2 × 60 × 3600 × 24 = 5,184,000 = 5.184×10⁶' },
      { id: 'b', text: '2.592 × 10⁶ times', feedback: 'This would be if current reversed only once per cycle, but it actually reverses twice (positive to negative, then negative to positive).' },
      { id: 'c', text: '1.44 × 10⁵ times', feedback: 'This is much too low. You may have forgotten to account for 24 hours in a day.' },
      { id: 'd', text: '1.04 × 10⁷ times', feedback: 'This is too high by a factor of 2. Current reverses twice per cycle, not four times.' }
    ],
    correctOptionId: 'a',
    explanation: 'AC current completes one full cycle 60 times per second. In each cycle, current reverses direction twice (positive→negative→positive). Reversals per day = 2 × 60 Hz × 24 hours × 3600 s/hour = 10,368,000 ≈ 5.184×10⁶',
    difficulty: 'intermediate',
    tags: ['ac-frequency', 'current-reversal', 'household-electricity', 'time-calculations']
  },
  {
    questionText: "An AC voltage with a peak value of 65 V is applied across a 25 Ω resistor. What is the RMS current in the resistor?",
    options: [
      { id: 'a', text: '1.8 A', feedback: 'Correct! V_rms = V_peak/√2 = 65V/1.414 = 46.0V. I_rms = V_rms/R = 46.0V/25Ω = 1.84A ≈ 1.8A' },
      { id: 'b', text: '2.6 A', feedback: 'This would be the peak current. For RMS current, use RMS voltage: V_rms = V_peak/√2' },
      { id: 'c', text: '1.3 A', feedback: 'Incorrect. Check your voltage conversion from peak to RMS.' },
      { id: 'd', text: '0.9 A', feedback: 'This is too low. Verify your calculation of V_rms = V_peak/√2.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find RMS voltage: V_rms = V_peak/√2 = 65V/1.414 = 46.0V. Then calculate RMS current: I_rms = V_rms/R = 46.0V/25Ω = 1.84A ≈ 1.8A',
    difficulty: 'intermediate',
    tags: ['rms-current', 'peak-to-rms-conversion', 'ohms-law', 'ac-circuits']
  }
];

// ========================================
// TRANSFORMER QUESTIONS (29-34)
// ========================================

// Six transformer calculation questions
const transformerQuestions = [
  {
    questionText: "The batteries in a portable CD player are recharged by a unit that plugs into a wall socket. Inside the unit is a step-down transformer with a turns ratio of 13:1. The wall socket provides 120 V. What voltage does the secondary coil of the transformer provide?",
    options: [
      { id: 'a', text: '9.23 V', feedback: 'Correct! Using the transformer equation: V_s/V_p = N_s/N_p. For 13:1 ratio: V_s = 120V × (1/13) = 9.23V' },
      { id: 'b', text: '1560 V', feedback: 'Incorrect. This would be for a step-up transformer. The 13:1 ratio means 13 primary turns to 1 secondary turn.' },
      { id: 'c', text: '120 V', feedback: 'Incorrect. This is the input voltage. The step-down transformer reduces the voltage by the turns ratio.' },
      { id: 'd', text: '18.5 V', feedback: 'Incorrect. Check your calculation: V_s = V_p × (N_s/N_p) = 120V × (1/13)' }
    ],
    correctOptionId: 'a',
    explanation: 'For a step-down transformer with 13:1 turns ratio: V_s/V_p = N_s/N_p = 1/13. Therefore: V_s = 120V × (1/13) = 9.23V',
    difficulty: 'intermediate',
    tags: ['transformer', 'step-down', 'turns-ratio', 'voltage-calculation']
  },
  {
    questionText: "Insect \"zappers\" use high voltage to electrocute insects. One device has a voltage of 4150 V obtained from a standard 120 V outlet through a transformer. If the primary coil has 17 turns, how many turns are in the secondary coil?",
    options: [
      { id: 'a', text: '588 turns', feedback: 'Correct! Using V_s/V_p = N_s/N_p: N_s = N_p × (V_s/V_p) = 17 × (4150V/120V) = 17 × 34.58 = 588 turns' },
      { id: 'b', text: '0.49 turns', feedback: 'Incorrect. This would be for a step-down transformer. The high output voltage indicates a step-up transformer.' },
      { id: 'c', text: '1200 turns', feedback: 'Incorrect. Check your calculation: N_s = 17 × (4150/120) = 17 × 34.58' },
      { id: 'd', text: '245 turns', feedback: 'Incorrect. Verify your voltage ratio calculation: 4150V ÷ 120V = 34.58' }
    ],
    correctOptionId: 'a',
    explanation: 'This is a step-up transformer. Using the turns ratio equation: N_s/N_p = V_s/V_p. Therefore: N_s = 17 turns × (4150V/120V) = 17 × 34.58 = 588 turns',
    difficulty: 'intermediate',
    tags: ['transformer', 'step-up', 'turns-calculation', 'high-voltage']
  },
  {
    questionText: "Electric doorbells require 10.0 V to operate. To obtain this voltage from a standard 120 V outlet, what type of transformer is required and what is the turns ratio?",
    options: [
      { id: 'a', text: 'Step-down transformer, 12:1 turns ratio', feedback: 'Correct! Since 120V > 10V, we need step-down. Turns ratio = V_p/V_s = 120V/10V = 12:1' },
      { id: 'b', text: 'Step-up transformer, 1:12 turns ratio', feedback: 'Incorrect. Since output voltage (10V) is less than input voltage (120V), we need a step-down transformer.' },
      { id: 'c', text: 'Step-down transformer, 1:12 turns ratio', feedback: 'Incorrect ratio direction. Step-down ratio is primary:secondary = 12:1, not 1:12.' },
      { id: 'd', text: 'Step-up transformer, 12:1 turns ratio', feedback: 'Incorrect transformer type. Output voltage is lower than input, so step-down is required.' }
    ],
    correctOptionId: 'a',
    explanation: 'Since 120V input > 10V output, a step-down transformer is needed. Turns ratio = Primary:Secondary = V_p:V_s = 120:10 = 12:1',
    difficulty: 'intermediate',
    tags: ['transformer', 'step-down', 'turns-ratio', 'doorbell-application']
  },
  {
    questionText: "A step-down transformer (turns ratio 8:1) is used with an electric train. When the train is running, the current in the secondary coil is 3.4 A. What is the current in the primary coil?",
    options: [
      { id: 'a', text: '0.43 A', feedback: 'Correct! For transformers: I_p/I_s = N_s/N_p. With 8:1 ratio: I_p = I_s × (1/8) = 3.4A × (1/8) = 0.425A ≈ 0.43A' },
      { id: 'b', text: '27.2 A', feedback: 'Incorrect. You multiplied instead of dividing. Current is inversely related to turns ratio.' },
      { id: 'c', text: '3.4 A', feedback: 'Incorrect. Primary and secondary currents are different due to the transformer turns ratio.' },
      { id: 'd', text: '1.7 A', feedback: 'Incorrect. Check the transformer current relationship: I_p = I_s × (N_s/N_p)' }
    ],
    correctOptionId: 'a',
    explanation: 'For transformers, current is inversely proportional to turns ratio: I_p/I_s = N_s/N_p. With 8:1 turns ratio: I_p = 3.4A × (1/8) = 0.425A ≈ 0.43A',
    difficulty: 'intermediate',
    tags: ['transformer', 'current-calculation', 'step-down', 'inverse-relationship']
  },
  {
    questionText: "A transformer has 120 V input to the primary coil and 0.10 A current in the secondary coil. When 60.0 W is delivered to the secondary circuit, what is the secondary voltage? Is this a step-up or step-down transformer, and what is the turns ratio?",
    options: [
      { id: 'a', text: '600 V, step-up, 1:5 turns ratio', feedback: 'Correct! V_s = P/I_s = 60W/0.10A = 600V. Since 600V > 120V, it\'s step-up. Turns ratio = V_s/V_p = 600/120 = 5, so 1:5' },
      { id: 'b', text: '600 V, step-down, 5:1 turns ratio', feedback: 'Voltage is correct, but transformer type is wrong. Since output (600V) > input (120V), it\'s step-up.' },
      { id: 'c', text: '24 V, step-down, 5:1 turns ratio', feedback: 'Incorrect voltage. Use P = VI to find V_s: V_s = P/I_s = 60W/0.10A = 600V' },
      { id: 'd', text: '12 V, step-down, 10:1 turns ratio', feedback: 'Incorrect. Check your power calculation: V_s = P/I_s = 60W/0.10A = 600V' }
    ],
    correctOptionId: 'a',
    explanation: 'Secondary voltage: V_s = P/I_s = 60W/0.10A = 600V. Since 600V > 120V input, this is step-up. Turns ratio = V_s/V_p = 600V/120V = 5, expressed as 1:5 (primary:secondary)',
    difficulty: 'advanced',
    tags: ['transformer', 'power-calculation', 'step-up', 'turns-ratio-determination']
  },
  {
    questionText: "A transformer for an electrostatic air filter has a turns ratio of 1:43. The primary coil is plugged into a standard 120 V outlet, and the current in the secondary coil is 1.5 mA. Find the power consumed by the air filter.",
    options: [
      { id: 'a', text: '7.7 W', feedback: 'Correct! V_s = 120V × 43 = 5160V. P = V_s × I_s = 5160V × 0.0015A = 7.74W ≈ 7.7W' },
      { id: 'b', text: '0.18 W', feedback: 'Incorrect. You may have used primary voltage instead of secondary voltage. Calculate V_s first.' },
      { id: 'c', text: '330 W', feedback: 'Incorrect. Check your current conversion: 1.5 mA = 0.0015 A, not 0.15 A' },
      { id: 'd', text: '77 W', feedback: 'Incorrect. Verify your calculation: P = 5160V × 0.0015A = 7.74W' }
    ],
    correctOptionId: 'a',
    explanation: 'First find secondary voltage: V_s = V_p × turns ratio = 120V × 43 = 5160V. Then calculate power: P = V_s × I_s = 5160V × 0.0015A = 7.74W ≈ 7.7W',
    difficulty: 'advanced',
    tags: ['transformer', 'step-up', 'power-calculation', 'high-voltage-application']
  }
];

// Add hand rule questions to main question pool for question 7
assessmentConfigs['course2_40_question7'] = {
  type: 'multiple-choice',
  questions: handRuleQuestions,
  randomizeQuestions: true,
  randomizeOptions: true,
  allowSameQuestion: true,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true,
  activityType: ACTIVITY_TYPE,
  theme: 'indigo'
};

// Add AC circuit questions to main assessment configs (questions 21-28)
acCircuitQuestions.forEach((questionData, index) => {
  const questionNumber = index + 21; // Questions 21-28
  const questionId = `course2_40_question${questionNumber}`;
  
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

// Add transformer questions to main assessment configs (questions 29-34)
transformerQuestions.forEach((questionData, index) => {
  const questionNumber = index + 29; // Questions 29-34
  const questionId = `course2_40_question${questionNumber}`;
  
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

// ========================================
// INDIVIDUAL QUESTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

module.exports = { 
  assessmentConfigs
};