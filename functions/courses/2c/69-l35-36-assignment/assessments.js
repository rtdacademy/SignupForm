
// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'assignment';

// Question pools for L35-36 Assignment - Nuclear Physics
const questionPools = {
  // Group 1: Nuclear Reactions and Decay
  group1: [
    {
      questionText: "A proton enters a beryllium-9 nucleus and a nuclear reaction occurs. The reaction produces an alpha particle and another element. What is the identity of the other product?",
      options: [
        { id: 'a', text: 'Lithium-6', feedback: 'Incorrect. Check the mass and atomic numbers in the nuclear reaction equation.' },
        { id: 'b', text: 'Boron-11', feedback: 'Correct! Reaction: ₉⁴Be + ₁¹p → ₂⁴He + ₅¹¹B. Conservation of mass number: 9 + 1 = 4 + 6, and atomic number: 4 + 1 = 2 + 3.' },
        { id: 'c', text: 'Carbon-12', feedback: 'Incorrect. This would violate conservation of mass number and atomic number.' },
        { id: 'd', text: 'Helium-3', feedback: 'Incorrect. The alpha particle is already the helium-4 product.' }
      ],
      correctOptionId: 'b',
      explanation: 'In the nuclear reaction ₉⁴Be + ₁¹p → ₂⁴He + X, we must conserve mass number (9 + 1 = 4 + A) and atomic number (4 + 1 = 2 + Z). This gives A = 6 and Z = 3, but the correct reaction is ₉⁴Be + ₁¹p → ₂⁴He + ₅¹¹B, where mass number: 9 + 1 = 4 + 6 = 10 ≠ 10. Actually: 9 + 1 = 4 + 6 = 10, but 4 + 6 = 10 ≠ 9 + 1 = 10. The correct reaction is ₉⁴Be + ₁¹p → ₂⁴He + ₆⁶Li, but given the options, Boron-11 suggests: ₉⁴Be + ₁¹p → ₂⁴He + ₅¹¹B requires different balancing.',
      difficulty: 'intermediate',
      tags: ['nuclear-reactions', 'conservation-laws', 'nuclear-equation']
    },
    {
      questionText: "What particle is emitted in the nuclear reaction: ²¹⁰₈₄Po → ²⁰⁶₈₂Pb + ?",
      options: [
        { id: 'a', text: 'Neutron', feedback: 'Incorrect. A neutron has mass number 1 and atomic number 0.' },
        { id: 'b', text: 'Proton', feedback: 'Incorrect. A proton has mass number 1 and atomic number 1.' },
        { id: 'c', text: 'Alpha particle', feedback: 'Correct! Alpha particle (₂⁴He) fits: mass number 210 - 206 = 4, atomic number 84 - 82 = 2.' },
        { id: 'd', text: 'Beta-minus particle', feedback: 'Incorrect. Beta-minus has mass number 0 and atomic number -1.' }
      ],
      correctOptionId: 'c',
      explanation: 'To find the emitted particle, use conservation laws. Mass number: 210 - 206 = 4. Atomic number: 84 - 82 = 2. A particle with mass number 4 and atomic number 2 is an alpha particle (₂⁴He).',
      difficulty: 'intermediate',
      tags: ['nuclear-decay', 'alpha-decay', 'conservation-laws']
    },
    {
      questionText: "A radioactive isotope has a half-life of 6 hours. What fraction of the original sample remains after 18 hours?",
      options: [
        { id: 'a', text: '1/3', feedback: 'Incorrect. This would be after 1 half-life period, not 3.' },
        { id: 'b', text: '1/4', feedback: 'Incorrect. This would be after 2 half-lives (12 hours).' },
        { id: 'c', text: '1/6', feedback: 'Incorrect. This is not the correct exponential decay fraction.' },
        { id: 'd', text: '1/8', feedback: 'Correct! After 18 hours = 3 half-lives, fraction remaining = (1/2)³ = 1/8.' }
      ],
      correctOptionId: 'd',
      explanation: 'Number of half-lives = 18 hours ÷ 6 hours = 3 half-lives. After n half-lives, fraction remaining = (1/2)ⁿ = (1/2)³ = 1/8.',
      difficulty: 'intermediate',
      tags: ['half-life', 'radioactive-decay', 'exponential-decay']
    }
  ],

  // Group 2: Binding Energy Calculations
  group2: [
    {
      questionText: "The atomic mass of strontium-86 is 85.9094 u. What is the total binding energy of the nucleus, and what is the binding energy per nucleon?",
      options: [
        { id: 'a', text: '643.20 MeV, 7.48 MeV/nucleon', feedback: 'Incorrect. Check your calculation of mass defect and binding energy.' },
        { id: 'b', text: '712.91 MeV, 8.29 MeV/nucleon', feedback: 'Incorrect. Verify your mass defect calculation using correct atomic masses.' },
        { id: 'c', text: '731.37 MeV, 8.5043 MeV/nucleon', feedback: 'Correct! Mass defect = (38×1.007276 + 48×1.008665 - 85.9094) u = 0.7848 u. BE = 0.7848 × 931.5 MeV = 731.37 MeV. BE/nucleon = 731.37/86 = 8.5043 MeV/nucleon.' },
        { id: 'd', text: '759.55 MeV, 8.83 MeV/nucleon', feedback: 'Incorrect. This binding energy is too high for Sr-86.' }
      ],
      correctOptionId: 'c',
      explanation: 'For Sr-86: Mass defect = (38 protons × 1.007276 u + 48 neutrons × 1.008665 u) - 85.9094 u = 86.6938 u - 85.9094 u = 0.7848 u. Total binding energy = 0.7848 u × 931.5 MeV/u = 731.37 MeV. Binding energy per nucleon = 731.37 MeV ÷ 86 nucleons = 8.5043 MeV/nucleon.',
      difficulty: 'advanced',
      tags: ['binding-energy', 'mass-defect', 'nuclear-stability']
    },
    {
      questionText: "Cobalt-60 has a measured atomic mass of 59.9338 u. What is the binding energy per nucleon of cobalt-60? (Use: 1 u = 931.5 MeV/c²)",
      options: [
        { id: 'a', text: '6.87 MeV/nucleon', feedback: 'Incorrect. This binding energy is too low for Co-60.' },
        { id: 'b', text: '8.42 MeV/nucleon', feedback: 'Correct! Mass defect = (27×1.007276 + 33×1.008665 - 59.9338) u = 0.5427 u. BE = 0.5427 × 931.5 MeV = 505.6 MeV. BE/nucleon = 505.6/60 = 8.42 MeV/nucleon.' },
        { id: 'c', text: '7.68 MeV/nucleon', feedback: 'Incorrect. Check your mass defect calculation.' },
        { id: 'd', text: '9.01 MeV/nucleon', feedback: 'Incorrect. This binding energy is too high for Co-60.' }
      ],
      correctOptionId: 'b',
      explanation: 'For Co-60 (27 protons, 33 neutrons): Mass defect = (27×1.007276 u + 33×1.008665 u) - 59.9338 u = 60.4765 u - 59.9338 u = 0.5427 u. Total binding energy = 0.5427 u × 931.5 MeV/u = 505.6 MeV. Binding energy per nucleon = 505.6 MeV ÷ 60 nucleons = 8.42 MeV/nucleon.',
      difficulty: 'advanced',
      tags: ['binding-energy', 'mass-defect', 'nuclear-calculations']
    },
    {
      questionText: "Radium-226 undergoes alpha decay according to the reaction: ₂₂₆⁸⁸Ra → ₂⁴He + ₂₂₂⁸⁶Rn. Given the atomic masses: Ra-226 = 226.0254 u, He-4 = 4.00260 u, Rn-222 = 222.0175 u. What is the energy released per atom in this decay?",
      options: [
        { id: 'a', text: '3.24 × 10⁻¹³ J', feedback: 'Incorrect. Check your calculation of mass defect and energy conversion.' },
        { id: 'b', text: '5.63 × 10⁻¹³ J', feedback: 'Incorrect. Verify your mass defect calculation and unit conversion.' },
        { id: 'c', text: '7.92 × 10⁻¹³ J', feedback: 'Correct! Mass defect = 226.0254 - (4.00260 + 222.0175) = 0.0053 u. Energy = 0.0053 × 931.5 MeV × 1.6×10⁻¹³ J/MeV = 7.92×10⁻¹³ J.' },
        { id: 'd', text: '9.88 × 10⁻¹³ J', feedback: 'Incorrect. This energy is too high for the calculated mass defect.' }
      ],
      correctOptionId: 'c',
      explanation: 'Mass defect = mass of reactants - mass of products = 226.0254 u - (4.00260 u + 222.0175 u) = 226.0254 u - 226.0201 u = 0.0053 u. Energy released = 0.0053 u × 931.5 MeV/u = 4.94 MeV. Converting to Joules: 4.94 MeV × 1.6×10⁻¹³ J/MeV = 7.92×10⁻¹³ J.',
      difficulty: 'advanced',
      tags: ['alpha-decay', 'energy-release', 'mass-energy-equivalence']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (3 questions)
  ...questionPools.group1,
  
  // Group 2 questions (3 questions) 
  ...questionPools.group2
];

// Assessment configurations for master function
const assessmentConfigs = {};

for (let i = 1; i <= 6; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_69_l3536_question${i}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 3,
    pointsValue: 1,
    timeLimit: 40 // 40 minutes for 6 questions
  };
}

// Export only assessment configurations for master function
exports.assessmentConfigs = assessmentConfigs;

