const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'assignment';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// Question pools for L28-30 Assignment - Quantum Theory and Photoelectric Effect
const questionPools = {
  // Group 1: Quantum Energy and Photon Properties
  group1: [
    {
      questionText: "What is the energy of a quantum of radiation that has a frequency of 3.45 × 10¹⁴ Hz?",
      options: [
        { id: 'a', text: '1.52 × 10⁻²⁰ J', feedback: 'Incorrect. This value is too small for the given frequency.' },
        { id: 'b', text: '3.45 × 10⁻¹⁴ J', feedback: 'Incorrect. This is just the frequency value, not the energy calculation.' },
        { id: 'c', text: '2.29 × 10⁻¹⁹ J', feedback: 'Correct! E = hf = (6.63×10⁻³⁴)(3.45×10¹⁴) = 2.29×10⁻¹⁹ J.' },
        { id: 'd', text: '6.63 × 10⁻³⁴ J', feedback: 'Incorrect. This is Planck\'s constant, not the energy of the photon.' }
      ],
      correctOptionId: 'c',
      explanation: 'The energy of a quantum of radiation is given by E = hf, where h = 6.63×10⁻³⁴ J·s and f = 3.45×10¹⁴ Hz. E = (6.63×10⁻³⁴)(3.45×10¹⁴) = 2.29×10⁻¹⁹ J.',
      difficulty: 'intermediate',
      tags: ['quantum-energy', 'planck-equation', 'photon-frequency']
    },
    {
      questionText: "A photon has an energy of 5.0 eV. What is its wavelength?",
      options: [
        { id: 'a', text: '6.63 × 10⁻³⁴ m', feedback: 'Incorrect. This is Planck\'s constant, not a wavelength.' },
        { id: 'b', text: '2.5 × 10⁻⁷ m', feedback: 'Correct! λ = hc/E = 1240 eV·nm / 5.0 eV = 248 nm = 2.48×10⁻⁷ m ≈ 2.5×10⁻⁷ m.' },
        { id: 'c', text: '3.1 × 10⁻⁶ m', feedback: 'Incorrect. This wavelength is too long for a 5.0 eV photon.' },
        { id: 'd', text: '4.0 × 10⁻⁸ m', feedback: 'Incorrect. Check your calculation using λ = hc/E.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the relationship λ = hc/E and the convenient formula λ(nm) = 1240/E(eV): λ = 1240/5.0 = 248 nm = 2.48×10⁻⁷ m ≈ 2.5×10⁻⁷ m.',
      difficulty: 'intermediate',
      tags: ['photon-wavelength', 'energy-wavelength', 'electron-volts']
    }
  ],

  // Group 2: Work Function and Photoelectric Effect
  group2: [
    {
      questionText: "A metal surface has a threshold frequency of 400 THz. What is the work function of the metal?",
      options: [
        { id: 'a', text: '6.63×10⁻³⁴ J', feedback: 'Incorrect. This is Planck\'s constant, not the work function.' },
        { id: 'b', text: '1.60×10⁻¹⁹ J', feedback: 'Incorrect. This is the charge of an electron, not the work function.' },
        { id: 'c', text: '2.65×10⁻¹⁹ J', feedback: 'Correct! φ = hf = (6.63×10⁻³⁴)(400×10¹²) = 2.65×10⁻¹⁹ J.' },
        { id: 'd', text: '4.00×10⁻¹⁴ J', feedback: 'Incorrect. This value is far too large for a work function.' }
      ],
      correctOptionId: 'c',
      explanation: 'The work function is φ = hf, where f is the threshold frequency. φ = (6.63×10⁻³⁴ J·s)(400×10¹² Hz) = 2.65×10⁻¹⁹ J.',
      difficulty: 'intermediate',
      tags: ['work-function', 'threshold-frequency', 'photoelectric-effect']
    },
    {
      questionText: "A metal has a threshold frequency of 400 THz. If the surface is illuminated with light of wavelength 500 nm, what is the speed of the escaping photoelectrons?",
      options: [
        { id: 'a', text: '3.00×10⁸ m/s', feedback: 'Incorrect. This is the speed of light, not the speed of photoelectrons.' },
        { id: 'b', text: '0 m/s', feedback: 'Incorrect. The photon energy exceeds the work function, so electrons will be emitted.' },
        { id: 'c', text: '5.40×10⁵ m/s', feedback: 'Correct! Photon energy = 2.48 eV, work function = 1.66 eV, KE = 0.82 eV, v = √(2KE/m) = 5.40×10⁵ m/s.' },
        { id: 'd', text: '1.60×10⁷ m/s', feedback: 'Incorrect. This speed is too high for the given energy difference.' }
      ],
      correctOptionId: 'c',
      explanation: 'First find photon energy: E = hc/λ = 1240 eV·nm/500 nm = 2.48 eV. Work function: φ = 1.66 eV. Kinetic energy: KE = E - φ = 0.82 eV = 1.31×10⁻¹⁹ J. Speed: v = √(2KE/m) = √(2×1.31×10⁻¹⁹/9.11×10⁻³¹) = 5.40×10⁵ m/s.',
      difficulty: 'advanced',
      tags: ['photoelectric-effect', 'kinetic-energy', 'electron-speed']
    },
    {
      questionText: "A metal with a threshold frequency of 400 THz is illuminated by light of wavelength 500 nm. What is the stopping voltage required to halt the photoelectrons?",
      options: [
        { id: 'a', text: '2.00 V', feedback: 'Incorrect. This voltage is too high for the calculated kinetic energy.' },
        { id: 'b', text: '0.829 V', feedback: 'Correct! KE = 0.829 eV, so stopping voltage = KE/e = 0.829 V.' },
        { id: 'c', text: '1.50 V', feedback: 'Incorrect. Check your calculation of the kinetic energy difference.' },
        { id: 'd', text: '0.400 V', feedback: 'Incorrect. This would be too low to stop the photoelectrons.' }
      ],
      correctOptionId: 'b',
      explanation: 'Photon energy = 2.48 eV, work function = 1.66 eV. Maximum kinetic energy = 2.48 - 1.66 = 0.82 eV. Stopping voltage = KE/e = 0.82 V ≈ 0.829 V.',
      difficulty: 'advanced',
      tags: ['stopping-voltage', 'photoelectric-effect', 'kinetic-energy']
    }
  ],

  // Group 3: Frank-Hertz Experiment and Energy Levels
  group3: [
    {
      questionText: "Based on the Frank-Hertz experiment data for Lichtium, what energy level transitions are most clearly indicated?",
      options: [
        { id: 'a', text: '4.0 eV and 6.0 eV', feedback: 'Incorrect. These values don\'t consistently explain the energy loss patterns.' },
        { id: 'b', text: '3.0 eV, 2.0 eV, and 1.0 eV', feedback: 'Correct! The consistent drops in output energy follow losses of 1.0, 2.0, and 3.0 eV, indicating these excitation levels.' },
        { id: 'c', text: '8.0 eV and 5.5 eV', feedback: 'Incorrect. These are input energies, not the energy level transitions.' },
        { id: 'd', text: '0.5 eV and 6.5 eV', feedback: 'Incorrect. These don\'t explain the systematic energy loss patterns.' }
      ],
      correctOptionId: 'b',
      explanation: 'Looking at the data, when input energy increases, output energy consistently drops by multiples of 1.0 eV, 2.0 eV, and 3.0 eV. This indicates atomic energy levels at these values above ground state.',
      difficulty: 'advanced',
      tags: ['frank-hertz', 'energy-levels', 'atomic-excitation']
    },
    {
      questionText: "Using the energy level transitions identified in the experiment (1.0 eV, 2.0 eV, 3.0 eV, and 5.0 eV above ground), which of the following wavelengths would be absorbed by Lichtium atoms?",
      options: [
        { id: 'a', text: '248 nm, 177 nm, 155 nm', feedback: 'Correct! Using λ = 1240/E(eV): For 5.0 eV → 248 nm, 7.0 eV → 177 nm, 8.0 eV → 155 nm.' },
        { id: 'b', text: '500 nm, 350 nm, 210 nm', feedback: 'Incorrect. These wavelengths correspond to much lower photon energies.' },
        { id: 'c', text: '100 nm, 220 nm, 310 nm', feedback: 'Incorrect. Check your wavelength calculations using λ = hc/E.' },
        { id: 'd', text: '620 nm, 400 nm, 300 nm', feedback: 'Incorrect. These wavelengths are too long for the given energy levels.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using λ = 1240/E(eV): For transitions to 5.0 eV level: λ = 1240/5.0 = 248 nm. For 7.0 eV: λ = 1240/7.0 = 177 nm. For 8.0 eV: λ = 1240/8.0 = 155 nm.',
      difficulty: 'advanced',
      tags: ['absorption-wavelengths', 'energy-wavelength', 'atomic-transitions']
    },
    {
      questionText: "If an atom of Lichtium is excited to the fourth energy level (5.0 eV), how many distinct photon wavelengths can it emit as it returns to ground state?",
      options: [
        { id: 'a', text: '4', feedback: 'Incorrect. This counts only direct transitions to ground state.' },
        { id: 'b', text: '6', feedback: 'Incorrect. This doesn\'t account for all possible transitions between levels.' },
        { id: 'c', text: '10', feedback: 'Correct! With 5 levels (0, 1, 2, 3, 5 eV), the number of possible downward transitions = n(n-1)/2 = 5×4/2 = 10.' },
        { id: 'd', text: '8', feedback: 'Incorrect. This doesn\'t include all possible transition combinations.' }
      ],
      correctOptionId: 'c',
      explanation: 'With energy levels at 0, 1.0, 2.0, 3.0, and 5.0 eV (5 levels total), each excited level can transition to any lower level. The total number of possible downward transitions is n(n-1)/2 = 5×4/2 = 10 distinct wavelengths.',
      difficulty: 'advanced',
      tags: ['emission-spectra', 'energy-transitions', 'spectral-lines']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (2 questions)
  ...questionPools.group1,
  
  // Group 2 questions (3 questions) 
  ...questionPools.group2,
  
  // Group 3 questions (3 questions)
  ...questionPools.group3
];

// Assessment configurations for master function
const assessmentConfigs = {};

for (let i = 1; i <= 8; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_59_l2830_question${i}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 3,
    pointsValue: 1,
    timeLimit: 60, // 60 minutes for 8 questions
    theme: activityDefaults.theme || 'green'
  };
}

// Export only assessment configurations for master function
module.exports = { assessmentConfigs };