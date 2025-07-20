

// Question pools for L22-24 Assignment - Electromagnetic Induction
const questionPools = {
  // Group 1: Lenz's Law and Induced Current Direction
  group1: [
    {
      questionText: "Determine the direction of the induced current for the following coil. Is A positive or negative?",
      image: {
        url: '/courses/2/content/44-l22-24-assignment/assets/question 1.png',
        alt: 'Coil with terminals A and B in changing magnetic field',
        caption: 'Coil experiencing a changing magnetic flux'
      },
      options: [
        { id: 'a', text: 'A is positive, current flows from A to B', feedback: 'Incorrect. Apply Lenz\'s law to determine the correct direction.' },
        { id: 'b', text: 'A is negative, current flows from B to A', feedback: 'Correct! The current flows from B to A, making A negative according to Lenz\'s law.' },
        { id: 'c', text: 'A is neutral, no current flows', feedback: 'Incorrect. A changing magnetic field induces current in the coil.' },
        { id: 'd', text: 'The polarity alternates rapidly', feedback: 'Incorrect. For a given change in magnetic field, the induced current has a definite direction.' }
      ],
      correctOptionId: 'b',
      explanation: 'According to Lenz\'s law, the induced current flows in a direction to oppose the change in magnetic flux. The current flows from B to A, making A negative.',
      difficulty: 'intermediate',
      tags: ['lenz-law', 'induced-current', 'electromagnetic-induction']
    },
    {
      questionText: "Which end of the conductor will become negative? What is the direction of current flow?",
      image: {
        url: '/courses/2/content/44-l22-24-assignment/assets/question_2.png',
        alt: 'Conductor with ends A and B moving through magnetic field',
        caption: 'Conductor moving through a magnetic field'
      },
      options: [
        { id: 'a', text: 'A is negative, electrons flow from A to B', feedback: 'Incorrect. Consider the direction of the magnetic field and motion.' },
        { id: 'b', text: 'A is negative, electrons flow from B to A', feedback: 'Correct! The electrons flow from B to A, making A negative.' },
        { id: 'c', text: 'B is negative, electrons flow from A to B', feedback: 'Incorrect. Check the application of the right-hand rule for motional EMF.' },
        { id: 'd', text: 'B is negative, electrons flow from B to A', feedback: 'Incorrect. The direction of electron flow is opposite to this.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the right-hand rule for motional EMF, electrons accumulate at end A, making it negative. Current (electron flow) goes from B to A.',
      difficulty: 'intermediate',
      tags: ['motional-emf', 'electron-flow', 'conductor']
    },
    {
      questionText: "Which end of the conductor will become negative?",
      image: {
        url: '/courses/2/content/44-l22-24-assignment/assets/question_3.png',
        alt: 'Vertical conductor moving through horizontal magnetic field',
        caption: 'Conductor moving through a magnetic field'
      },
      options: [
        { id: 'a', text: 'The top becomes negative', feedback: 'Incorrect. Apply the right-hand rule for motional EMF.' },
        { id: 'b', text: 'The bottom becomes negative', feedback: 'Correct! The electrons flow from top to bottom, making the bottom negative.' },
        { id: 'c', text: 'Both ends remain neutral', feedback: 'Incorrect. Moving a conductor through a magnetic field induces charge separation.' },
        { id: 'd', text: 'The ends alternate polarity', feedback: 'Incorrect. For steady motion, the charge separation is constant.' }
      ],
      correctOptionId: 'b',
      explanation: 'When the conductor moves through the magnetic field, electrons flow from top to bottom due to the magnetic force, making the bottom end negative.',
      difficulty: 'intermediate',
      tags: ['motional-emf', 'charge-separation', 'magnetic-force']
    }
  ],

  // Group 2: Quantitative EMF and Current Calculations
  group2: [
    {
      questionText: "The conducting rod in the diagram is 15 cm long and is moving at a speed of 4.0 m/s perpendicular to a 0.30 T magnetic field. The conducting rod slides across two wires which forms a circuit. If the resistance in the circuit is 4.0 Ω, what is the magnitude and direction of the current through the circuit?",
      image: {
        url: '/courses/2/content/44-l22-24-assignment/assets/question_4.png',
        alt: 'Conducting rod sliding on rails forming a circuit in magnetic field',
        caption: 'Conducting rod moving on rails with resistance in circuit'
      },
      options: [
        { id: 'a', text: '0.045 A counterclockwise', feedback: 'Incorrect. Check the direction using Lenz\'s law.' },
        { id: 'b', text: '0.045 A clockwise', feedback: 'Correct! EMF = BLv = 0.30 × 0.15 × 4.0 = 0.18 V. I = V/R = 0.18/4.0 = 0.045 A clockwise.' },
        { id: 'c', text: '0.18 A clockwise', feedback: 'Incorrect. This is the EMF value, not the current. Remember to divide by resistance.' },
        { id: 'd', text: '0.09 A clockwise', feedback: 'Incorrect. Check your calculation: I = EMF/R = 0.18/4.0 = 0.045 A.' }
      ],
      correctOptionId: 'b',
      explanation: 'EMF = BLv = 0.30 T × 0.15 m × 4.0 m/s = 0.18 V. Current I = EMF/R = 0.18 V / 4.0 Ω = 0.045 A. Direction is clockwise by Lenz\'s law.',
      difficulty: 'advanced',
      tags: ['motional-emf', 'current-calculation', 'ohms-law']
    },
    {
      questionText: "An AC generator producing an effective voltage of 20 V is placed in parallel with 6.0 Ω and 3.0 Ω resistors. What is the average power dissipated in the 6.0 Ω resistor?",
      options: [
        { id: 'a', text: '133.3 W', feedback: 'Incorrect. This would be the power if the resistors were in series.' },
        { id: 'b', text: '66.7 W', feedback: 'Correct! In parallel, each resistor has 20 V across it. P = V²/R = (20)²/6.0 = 400/6.0 = 66.7 W.' },
        { id: 'c', text: '33.3 W', feedback: 'Incorrect. Check your calculation of P = V²/R for the 6.0 Ω resistor.' },
        { id: 'd', text: '200 W', feedback: 'Incorrect. This is not the correct calculation for average power.' }
      ],
      correctOptionId: 'b',
      explanation: 'In parallel circuits, each resistor experiences the full voltage. P = V²/R = (20 V)²/(6.0 Ω) = 400/6.0 = 66.7 W.',
      difficulty: 'advanced',
      tags: ['ac-generator', 'parallel-circuits', 'power-calculation']
    }
  ],

  // Group 3: Electromagnetic Radiation and Wave Properties
  group3: [
    {
      questionText: "Why are radio waves, visible light waves, X-rays, etc. referred to as electromagnetic radiation?",
      options: [
        { id: 'a', text: 'They all travel at the speed of light', feedback: 'Partially correct, but this doesn\'t explain why they\'re called electromagnetic.' },
        { id: 'b', text: 'They consist of oscillating electric and magnetic fields', feedback: 'Correct! Electromagnetic radiation consists of oscillating electric and magnetic fields perpendicular to each other and to the direction of propagation.' },
        { id: 'c', text: 'They all have the same frequency', feedback: 'Incorrect. Different types of electromagnetic radiation have different frequencies.' },
        { id: 'd', text: 'They all require a medium to travel through', feedback: 'Incorrect. Electromagnetic waves can travel through vacuum.' }
      ],
      correctOptionId: 'b',
      explanation: 'Electromagnetic radiation consists of oscillating electric and magnetic fields that are perpendicular to each other and to the direction of wave propagation.',
      difficulty: 'intermediate',
      tags: ['electromagnetic-radiation', 'wave-properties', 'electric-fields', 'magnetic-fields']
    },
    {
      questionText: "Ultraviolet light has a wavelength of 11.0 nm in air. What is its wavelength in glass (n = 1.52)?",
      options: [
        { id: 'a', text: '16.7 nm', feedback: 'Incorrect. The wavelength decreases in a denser medium, not increases.' },
        { id: 'b', text: '7.24 nm', feedback: 'Correct! λ = λ₀/n = 11.0 nm / 1.52 = 7.24 nm. Wavelength decreases in a denser medium.' },
        { id: 'c', text: '11.0 nm', feedback: 'Incorrect. The wavelength changes when light enters a different medium.' },
        { id: 'd', text: '5.5 nm', feedback: 'Incorrect. Check your calculation: λ = λ₀/n = 11.0/1.52 = 7.24 nm.' }
      ],
      correctOptionId: 'b',
      explanation: 'When light enters a denser medium, its wavelength decreases: λ = λ₀/n = 11.0 nm / 1.52 = 7.24 nm.',
      difficulty: 'advanced',
      tags: ['refraction', 'wavelength', 'refractive-index', 'ultraviolet']
    },
    {
      questionText: "A student produced an interference pattern using microwaves by placing a double slit in front of a microwave generator. If the slits are 5.00 cm apart and the antinodes of the pattern are 14.5 cm apart at a distance of 1.50 m from the slits, what is the frequency of the microwaves?",
      options: [
        { id: 'a', text: '3.45 × 10⁹ Hz', feedback: 'Incorrect. Check your calculation using the double-slit formula and wave equation.' },
        { id: 'b', text: '6.03 × 10⁹ Hz', feedback: 'Correct! λ = dΔx/L = (0.05)(0.145)/1.50 = 0.00483 m. f = c/λ = 3×10⁸/0.00483 = 6.03×10⁹ Hz.' },
        { id: 'c', text: '1.21 × 10¹⁰ Hz', feedback: 'Incorrect. Double-check your wavelength calculation from the interference pattern.' },
        { id: 'd', text: '2.07 × 10⁹ Hz', feedback: 'Incorrect. Verify your application of the double-slit interference formula.' }
      ],
      correctOptionId: 'b',
      explanation: 'First find wavelength: λ = dΔx/L = (0.05 m)(0.145 m)/(1.50 m) = 0.00483 m. Then frequency: f = c/λ = 3×10⁸ m/s / 0.00483 m = 6.03×10⁹ Hz.',
      difficulty: 'advanced',
      tags: ['double-slit', 'interference', 'microwaves', 'frequency-calculation']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (3 questions)
  ...questionPools.group1,
  
  // Group 2 questions (2 questions) 
  ...questionPools.group2,
  
  // Group 3 questions (3 questions)
  ...questionPools.group3
];

// Create assessment configurations for the master function (8 total)
const assessmentConfigs = {};

for (let i = 1; i <= 8; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_44_l2224_question${i}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questions[questionIndex]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 3,
    showFeedback: true,
    activityType: 'assignment',
    theme: 'blue'
  };
}

module.exports = { assessmentConfigs };