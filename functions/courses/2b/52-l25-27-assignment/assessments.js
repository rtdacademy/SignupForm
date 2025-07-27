
// Question pools for L25-27 Assignment - Cathode Rays and Rutherford's Model
const questionPools = {
  // Group 1: Cathode Ray Theory and Atomic Model
  group1: [
    {
      questionText: "One immediate result of the discovery of cathode ray particles was that the theory of the atom was revised to a theory that hypothesized that:",
      options: [
        { id: 'a', text: 'An atom is an indivisible sphere', feedback: 'Incorrect. The discovery of cathode rays showed that atoms contain subatomic particles.' },
        { id: 'b', text: 'Electrons exists in probability clouds', feedback: 'Incorrect. Probability clouds are part of the quantum mechanical model, developed much later.' },
        { id: 'c', text: 'An atom is mostly made up of empty space', feedback: 'Incorrect. This conclusion came from Rutherford\'s gold foil experiment, not cathode ray experiments.' },
        { id: 'd', text: 'An atom contains negatively charged particles', feedback: 'Correct! The discovery of cathode rays (electrons) showed that atoms contain negatively charged particles.' }
      ],
      correctOptionId: 'd',
      explanation: 'The discovery of cathode rays provided evidence that atoms contain negatively charged particles (electrons), contradicting the earlier model of atoms as indivisible spheres.',
      difficulty: 'intermediate',
      tags: ['cathode-rays', 'atomic-theory', 'electrons']
    },
    {
      questionText: "Rutherford's planetary model of the atom was an improvement over previous models because it was able to explain the:",
      options: [
        { id: 'a', text: 'scattering of alpha particles incident on a thin gold foil', feedback: 'Correct! The planetary model was developed to explain the results of Rutherford\'s gold foil experiment.' },
        { id: 'b', text: 'existence of energy levels within atoms', feedback: 'Incorrect. Energy levels were explained by Bohr\'s model, not Rutherford\'s.' },
        { id: 'c', text: 'line spectra of hydrogen', feedback: 'Incorrect. Line spectra were explained by Bohr\'s model with quantized energy levels.' },
        { id: 'd', text: 'existence of atoms', feedback: 'Incorrect. The existence of atoms was established before Rutherford\'s model.' }
      ],
      correctOptionId: 'a',
      explanation: 'Rutherford\'s planetary model was specifically developed to explain the unexpected large-angle scattering of alpha particles observed in his gold foil experiment.',
      difficulty: 'intermediate',
      tags: ['rutherford-model', 'alpha-scattering', 'gold-foil']
    },
    {
      questionText: "One of the reasons that Rutherford's planetary model of the atom has been modified is that observations of the atom do not support the theory of electrons orbiting the nucleus in a manner similar to planets orbiting a star. However, according to Maxwell's theory of electromagnetic radiation, such an orbiting electron should emit electromagnetic radiation because:",
      options: [
        { id: 'a', text: 'the electron is travelling at uniform speed', feedback: 'Incorrect. Uniform speed alone does not cause electromagnetic radiation.' },
        { id: 'b', text: 'the electron is accelerating toward the nucleus', feedback: 'Correct! According to Maxwell\'s theory, accelerating charges emit electromagnetic radiation, and circular motion involves acceleration.' },
        { id: 'c', text: 'there is an electrostatic force of repulsion between the orbiting electrons', feedback: 'Incorrect. This describes electron-electron repulsion, not the reason for electromagnetic radiation.' },
        { id: 'd', text: 'there is an alternating electromagnetic dipole as the electron switches sides of the nucleus', feedback: 'Incorrect. This does not accurately describe the electromagnetic radiation from accelerating charges.' }
      ],
      correctOptionId: 'b',
      explanation: 'According to Maxwell\'s electromagnetic theory, any accelerating charge emits electromagnetic radiation. An orbiting electron undergoes centripetal acceleration, so it should continuously emit radiation and spiral into the nucleus.',
      difficulty: 'advanced',
      tags: ['maxwell-theory', 'electromagnetic-radiation', 'electron-orbits']
    }
  ],

  // Group 2: Quantitative Cathode Ray Calculations
  group2: [
    {
      questionText: "A cathode ray passes undeflected through perpendicular electric and magnetic fields. If the electric field strength is 2.5×10⁴ V/m and the magnetic field strength is 5.0×10⁻² T, what is the speed of the cathode ray particle?",
      options: [
        { id: 'a', text: '1.25×10⁵ m/s', feedback: 'Incorrect. Check your calculation using v = E/B.' },
        { id: 'b', text: '5.0×10⁵ m/s', feedback: 'Correct! For undeflected motion: v = E/B = (2.5×10⁴)/(5.0×10⁻²) = 5.0×10⁵ m/s.' },
        { id: 'c', text: '2.5×10⁵ m/s', feedback: 'Incorrect. You may have made an error in the division.' },
        { id: 'd', text: '1.0×10⁶ m/s', feedback: 'Incorrect. Double-check your calculation of E/B.' }
      ],
      correctOptionId: 'b',
      explanation: 'For a charged particle to pass undeflected through perpendicular electric and magnetic fields, the electric and magnetic forces must balance: qE = qvB, so v = E/B = 2.5×10⁴ / 5.0×10⁻² = 5.0×10⁵ m/s.',
      difficulty: 'advanced',
      tags: ['cathode-rays', 'velocity-selector', 'electric-field', 'magnetic-field']
    },
    {
      questionText: "The velocity of a particle in a cathode ray tube is measured as 3.0×10⁷ m/s, and the particle enters a magnetic field of 1.5×10⁻² T. If the radius of curvature of the path is 2.0 cm, what is the charge-to-mass ratio q/m?",
      options: [
        { id: 'a', text: '1.0×10⁸ C/kg', feedback: 'Correct! q/m = v²/(rB²) = (3.0×10⁷)²/[(0.02)(1.5×10⁻²)²] = 1.0×10⁸ C/kg.' },
        { id: 'b', text: '2.3×10⁷ C/kg', feedback: 'Incorrect. Check your calculation and ensure you\'re using the correct formula.' },
        { id: 'c', text: '3.0×10⁹ C/kg', feedback: 'Incorrect. You may have made an error with the radius conversion or calculation.' },
        { id: 'd', text: '1.2×10⁶ C/kg', feedback: 'Incorrect. Double-check your calculation of v²/(rB²).' }
      ],
      correctOptionId: 'a',
      explanation: 'For a charged particle in a magnetic field: qvB = mv²/r, so q/m = v²/(rB²) = (3.0×10⁷)²/[(0.02)(1.5×10⁻²)²] = 9×10¹⁴/(0.02×2.25×10⁻⁴) = 1.0×10⁸ C/kg.',
      difficulty: 'advanced',
      tags: ['charge-to-mass-ratio', 'magnetic-field', 'circular-motion']
    },
    {
      questionText: "A particle of mass 3.0×10⁻¹⁵ kg has a charge-to-mass ratio of 2.0×10⁵ C/kg. What is the particle's charge?",
      options: [
        { id: 'a', text: '1.5×10⁻²⁰ C', feedback: 'Incorrect. Check your multiplication: q = (q/m) × m.' },
        { id: 'b', text: '6.0×10⁻¹⁰ C', feedback: 'Correct! q = (q/m) × m = (2.0×10⁵) × (3.0×10⁻¹⁵) = 6.0×10⁻¹⁰ C.' },
        { id: 'c', text: '2.5×10⁻⁵ C', feedback: 'Incorrect. You may have made an error in the calculation.' },
        { id: 'd', text: '3.0×10⁻⁸ C', feedback: 'Incorrect. Double-check your multiplication of (q/m) × m.' }
      ],
      correctOptionId: 'b',
      explanation: 'To find charge from charge-to-mass ratio: q = (q/m) × m = (2.0×10⁵ C/kg) × (3.0×10⁻¹⁵ kg) = 6.0×10⁻¹⁰ C.',
      difficulty: 'intermediate',
      tags: ['charge-calculation', 'charge-to-mass-ratio']
    },
    {
      questionText: "An alpha particle travels through perpendicular electric and magnetic fields without being deflected. If the particle's speed is 6.0×10⁵ m/s and the magnetic field is 0.180 T, what is the electric field strength?",
      options: [
        { id: 'a', text: '1.08×10⁵ V/m', feedback: 'Correct! E = vB = (6.0×10⁵)(0.180) = 1.08×10⁵ V/m.' },
        { id: 'b', text: '3.33×10⁴ V/m', feedback: 'Incorrect. This would be if you divided v by B instead of multiplying.' },
        { id: 'c', text: '2.40×10⁵ V/m', feedback: 'Incorrect. Check your calculation of v × B.' },
        { id: 'd', text: '1.08×10⁴ V/m', feedback: 'Incorrect. You may have made an error in the multiplication.' }
      ],
      correctOptionId: 'a',
      explanation: 'For undeflected motion through perpendicular fields: qE = qvB, so E = vB = (6.0×10⁵ m/s)(0.180 T) = 1.08×10⁵ V/m.',
      difficulty: 'intermediate',
      tags: ['alpha-particles', 'electric-field', 'magnetic-field', 'velocity-selector']
    }
  ],

  // Group 3: Rutherford's Experiment and Atomic Structure
  group3: [
    {
      questionText: "The analysis of the observations from the Rutherford alpha particle scattering experiment lead to a model of the atom in which the _i_ is on the order of 10⁻¹⁰ m in diameter, the _ii_ is on the order of 10⁻¹⁵ m in diameter, and the majority of the _iii_ of the atom is in the nucleus.",
      options: [
        { id: 'a', text: 'Atom, nucleus, charge', feedback: 'Incorrect. While the size relationships are correct, most of the atom\'s charge is not in the nucleus.' },
        { id: 'b', text: 'Nucleus, atom, charge', feedback: 'Incorrect. The size relationships are reversed.' },
        { id: 'c', text: 'Atom, nucleus, mass', feedback: 'Correct! The atom is ~10⁻¹⁰ m, the nucleus is ~10⁻¹⁵ m, and most of the atom\'s mass is in the nucleus.' },
        { id: 'd', text: 'Nucleus, atom, mass', feedback: 'Incorrect. The size relationships are reversed.' }
      ],
      correctOptionId: 'c',
      explanation: 'Rutherford\'s experiment revealed that atoms are mostly empty space with a tiny, dense nucleus. The atom has a diameter of ~10⁻¹⁰ m, the nucleus ~10⁻¹⁵ m, and most of the atom\'s mass is concentrated in the nucleus.',
      difficulty: 'intermediate',
      tags: ['rutherford-experiment', 'atomic-structure', 'nuclear-size']
    },
    {
      questionText: "In Rutherford's experiment, illustrated above, the type of radiation directed toward the metal foil was _i_ and the experiment provided evidence that the atom contained _ii_. Based on the observations made using the detection screen, Rutherford concluded that the atom had _iii_.",
      options: [
        { id: 'a', text: 'alpha particles; a small, dense, positively charged nucleus; mostly empty space', feedback: 'Correct! Alpha particles were used, and the large-angle scattering showed a small, dense, positive nucleus in mostly empty space.' },
        { id: 'b', text: 'alpha particles; electrons in stable, circular orbits; quantized energy levels', feedback: 'Incorrect. The experiment showed nuclear structure, not electron orbits or energy levels.' },
        { id: 'c', text: 'gamma rays; a small, dense, positively charged nucleus; mostly empty space', feedback: 'Incorrect. Alpha particles, not gamma rays, were used in the experiment.' },
        { id: 'd', text: 'gamma rays; electrons in stable, circular orbits; quantized energy levels', feedback: 'Incorrect. Wrong radiation type and conclusions.' }
      ],
      correctOptionId: 'a',
      explanation: 'Rutherford used alpha particles in his gold foil experiment. The unexpected large-angle scattering provided evidence for a small, dense, positively charged nucleus and showed that atoms are mostly empty space.',
      difficulty: 'intermediate',
      tags: ['rutherford-experiment', 'alpha-particles', 'nuclear-structure']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (3 questions)
  ...questionPools.group1,
  
  // Group 2 questions (4 questions) 
  ...questionPools.group2,
  
  // Group 3 questions (2 questions)
  ...questionPools.group3
];

// Export assessment configurations for master function
const assessmentConfigs = {};

for (let i = 1; i <= 9; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_52_l2527_question${i}`;
  
  assessmentConfigs[questionId] = {
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: 'assignment', 
    maxAttempts: 3,
    pointsValue: 1,
    timeLimit: 60 // 60 minutes for 9 questions
  };
}

// Export assessmentConfigs
exports.assessmentConfigs = assessmentConfigs;