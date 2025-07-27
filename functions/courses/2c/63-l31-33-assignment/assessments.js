// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'assignment';

// Question pools for L31-33 Assignment - Wave-Particle Duality and Atomic Energy Levels
const questionPools = {
  // Group 1: Wave-Particle Duality and de Broglie Wavelength
  group1: [
    {
      questionText: "An electron is accelerated from rest through a potential difference of 150V. What is the de Broglie wavelength of this electron?",
      options: [
        { id: 'a', text: '1.0 × 10⁻¹⁰ m', feedback: 'Correct! Using λ = h/p and p = √(2meV), λ = h/√(2meV) = 6.63×10⁻³⁴/√(2×9.11×10⁻³¹×1.6×10⁻¹⁹×150) = 1.0×10⁻¹⁰ m.' },
        { id: 'b', text: '2.5 × 10⁻¹⁰ m', feedback: 'Incorrect. Check your calculation of the momentum and de Broglie wavelength formula.' },
        { id: 'c', text: '5.0 × 10⁻¹¹ m', feedback: 'Incorrect. This wavelength is too short for the given potential difference.' },
        { id: 'd', text: '3.2 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength is too long for a 150V accelerated electron.' }
      ],
      correctOptionId: 'a',
      explanation: 'For an electron accelerated through potential V: KE = eV = ½mv², so p = √(2meV). The de Broglie wavelength is λ = h/p = h/√(2meV) = 6.63×10⁻³⁴/√(2×9.11×10⁻³¹×1.6×10⁻¹⁹×150) = 1.0×10⁻¹⁰ m.',
      difficulty: 'advanced',
      tags: ['de-broglie-wavelength', 'electron-acceleration', 'wave-particle-duality']
    },
    {
      questionText: "In the photoelectric effect, when the frequency of incident light is doubled, what happens to the maximum kinetic energy of the emitted photoelectrons?",
      options: [
        { id: 'a', text: 'It doubles', feedback: 'Incorrect. The relationship is not directly proportional due to the work function.' },
        { id: 'b', text: 'It increases by hf', feedback: 'Correct! KEmax = hf - φ. When frequency doubles to 2f, KEmax = h(2f) - φ = 2hf - φ = (hf - φ) + hf, so it increases by hf.' },
        { id: 'c', text: 'It quadruples', feedback: 'Incorrect. The kinetic energy does not have a quadratic relationship with frequency.' },
        { id: 'd', text: 'It remains the same', feedback: 'Incorrect. Higher frequency photons provide more energy to the electrons.' }
      ],
      correctOptionId: 'b',
      explanation: 'In the photoelectric effect: KEmax = hf - φ. When frequency doubles: KEmax(new) = h(2f) - φ = 2hf - φ. The increase is: KEmax(new) - KEmax(old) = (2hf - φ) - (hf - φ) = hf.',
      difficulty: 'intermediate',
      tags: ['photoelectric-effect', 'photon-frequency', 'kinetic-energy']
    },
    {
      questionText: "Which experimental observation provided the strongest evidence for the wave nature of electrons?",
      options: [
        { id: 'a', text: 'Electron diffraction patterns', feedback: 'Correct! Electron diffraction through crystals produces interference patterns, which is definitive evidence of wave behavior.' },
        { id: 'b', text: 'Photoelectric effect', feedback: 'Incorrect. The photoelectric effect demonstrates the particle nature of light, not the wave nature of electrons.' },
        { id: 'c', text: 'Cathode ray deflection', feedback: 'Incorrect. Cathode ray deflection shows electrons have charge and mass (particle properties).' },
        { id: 'd', text: 'Compton scattering', feedback: 'Incorrect. Compton scattering demonstrates the particle nature of photons, not the wave nature of electrons.' }
      ],
      correctOptionId: 'a',
      explanation: 'Electron diffraction experiments, such as those by Davisson and Germer, showed that electrons produce interference patterns when scattered by crystal lattices, providing direct evidence of their wave nature.',
      difficulty: 'intermediate',
      tags: ['electron-diffraction', 'wave-nature', 'interference-patterns']
    }
  ],

  // Group 2: Atomic Energy Transitions and Calculations
  group2: [
    {
      questionText: "An electron in a hydrogen atom makes a transition from n=4 to n=2. What is the energy of the emitted photon?",
      options: [
        { id: 'a', text: '2.55 eV', feedback: 'Correct! E = 13.6 eV × (1/n₁² - 1/n₂²) = 13.6 × (1/4 - 1/16) = 13.6 × (3/16) = 2.55 eV.' },
        { id: 'b', text: '3.40 eV', feedback: 'Incorrect. This would be the n=3 to n=2 transition energy.' },
        { id: 'c', text: '0.85 eV', feedback: 'Incorrect. This is the n=4 to n=3 transition energy.' },
        { id: 'd', text: '10.2 eV', feedback: 'Incorrect. This would be the n=4 to n=1 transition energy.' }
      ],
      correctOptionId: 'a',
      explanation: 'For hydrogen transitions: E = 13.6 eV × (1/n₁² - 1/n₂²) where n₁ = final state, n₂ = initial state. E = 13.6 × (1/2² - 1/4²) = 13.6 × (1/4 - 1/16) = 13.6 × (3/16) = 2.55 eV.',
      difficulty: 'intermediate',
      tags: ['hydrogen-transitions', 'energy-levels', 'photon-emission']
    },
    {
      questionText: "What is the ionization energy required to remove an electron from the ground state of a hydrogen atom?",
      options: [
        { id: 'a', text: '10.2 eV', feedback: 'Incorrect. This is not the ionization energy from ground state.' },
        { id: 'b', text: '3.4 eV', feedback: 'Incorrect. This is the energy for a specific transition, not ionization.' },
        { id: 'c', text: '13.6 eV', feedback: 'Correct! The ionization energy from ground state (n=1) is 13.6 eV, representing the binding energy of the electron.' },
        { id: 'd', text: '27.2 eV', feedback: 'Incorrect. This would be twice the ionization energy.' }
      ],
      correctOptionId: 'c',
      explanation: 'The ionization energy from the ground state (n=1) of hydrogen is 13.6 eV. This represents the energy needed to completely remove the electron from the atom (n=1 to n=∞).',
      difficulty: 'beginner',
      tags: ['ionization-energy', 'hydrogen-atom', 'ground-state']
    },
    {
      questionText: "If an X-ray photon has a momentum of 3.32 × 10⁻²⁴ kg⋅m/s, what is its energy?",
      options: [
        { id: 'a', text: '9.96 × 10⁻¹⁶ J', feedback: 'Correct! E = pc = (3.32×10⁻²⁴)(3.00×10⁸) = 9.96×10⁻¹⁶ J.' },
        { id: 'b', text: '1.11 × 10⁻³¹ J', feedback: 'Incorrect. This would be if you divided momentum by the speed of light instead of multiplying.' },
        { id: 'c', text: '6.63 × 10⁻³⁴ J', feedback: 'Incorrect. This is Planck\'s constant, not the energy of this photon.' },
        { id: 'd', text: '3.32 × 10⁻²⁴ J', feedback: 'Incorrect. This is the momentum value, not the energy.' }
      ],
      correctOptionId: 'a',
      explanation: 'For a photon, E = pc where p is momentum and c is the speed of light. E = (3.32×10⁻²⁴ kg⋅m/s)(3.00×10⁸ m/s) = 9.96×10⁻¹⁶ J.',
      difficulty: 'intermediate',
      tags: ['photon-energy', 'momentum-energy-relation', 'x-ray-photons']
    }
  ],

  // Group 3: Advanced Quantum Concepts and Wave-Particle Demonstrations
  group3: [
    {
      questionText: "In the double-slit experiment with electrons, what happens when detectors are placed at the slits to determine which slit each electron passes through?",
      options: [
        { id: 'a', text: 'The interference pattern becomes more pronounced', feedback: 'Incorrect. Measurement actually destroys the interference pattern.' },
        { id: 'b', text: 'The interference pattern disappears', feedback: 'Correct! When the path is measured, the wave function collapses and electrons behave as particles, eliminating interference.' },
        { id: 'c', text: 'Only some electrons create interference', feedback: 'Incorrect. All electrons are affected by the measurement.' },
        { id: 'd', text: 'The pattern shifts but remains intact', feedback: 'Incorrect. The measurement fundamentally changes the quantum behavior.' }
      ],
      correctOptionId: 'b',
      explanation: 'This demonstrates the complementarity principle: when we measure which slit the electron passes through, we gain "which-path" information but lose the wave interference pattern. The act of measurement collapses the wave function.',
      difficulty: 'advanced',
      tags: ['double-slit-experiment', 'wave-particle-duality', 'quantum-measurement']
    },
    {
      questionText: "According to de Broglie's hypothesis, which particles would have the longest wavelength?",
      options: [
        { id: 'a', text: 'Fast-moving electrons', feedback: 'Incorrect. Higher momentum means shorter wavelength according to λ = h/p.' },
        { id: 'b', text: 'Slow-moving protons', feedback: 'Incorrect. Protons have much larger mass than electrons, so even slow ones have significant momentum.' },
        { id: 'c', text: 'Slow-moving electrons', feedback: 'Correct! Since λ = h/p, and p = mv, particles with smallest momentum (low mass and low velocity) have the longest wavelength.' },
        { id: 'd', text: 'Photons', feedback: 'Incorrect. While photons have wave properties, the question asks about particles with mass.' }
      ],
      correctOptionId: 'c',
      explanation: 'The de Broglie wavelength λ = h/p = h/(mv). For the longest wavelength, we need the smallest momentum, which means the smallest mass and velocity. Slow-moving electrons have both small mass and low velocity.',
      difficulty: 'intermediate',
      tags: ['de-broglie-wavelength', 'particle-momentum', 'wave-properties']
    },
    {
      questionText: "The uncertainty principle states that the more precisely we know the position of a particle, the less precisely we can know its:",
      options: [
        { id: 'a', text: 'Energy', feedback: 'Incorrect. While there is an energy-time uncertainty relation, this question refers to the position-momentum uncertainty principle.' },
        { id: 'b', text: 'Momentum', feedback: 'Correct! Heisenberg\'s uncertainty principle states that Δx × Δp ≥ ℏ/2, relating position and momentum uncertainties.' },
        { id: 'c', text: 'Mass', feedback: 'Incorrect. Mass is an intrinsic property of particles and is not subject to this uncertainty relation.' },
        { id: 'd', text: 'Charge', feedback: 'Incorrect. Electric charge is a conserved quantity and not subject to quantum uncertainty in this context.' }
      ],
      correctOptionId: 'b',
      explanation: 'Heisenberg\'s uncertainty principle states that the product of uncertainties in position and momentum must be greater than or equal to ℏ/2: Δx × Δp ≥ ℏ/2.',
      difficulty: 'beginner',
      tags: ['uncertainty-principle', 'heisenberg', 'quantum-mechanics']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (3 questions)
  ...questionPools.group1,
  
  // Group 2 questions (3 questions) 
  ...questionPools.group2,
  
  // Group 3 questions (3 questions)
  ...questionPools.group3
];

// Assessment configurations for master function
const assessmentConfigs = {};

for (let i = 1; i <= 9; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_63_l3133_question${i}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 3,
    pointsValue: 1,
    timeLimit: 60 // 60 minutes for 9 questions
  };
}

// Export only assessment configurations for master function
exports.assessmentConfigs = assessmentConfigs;
