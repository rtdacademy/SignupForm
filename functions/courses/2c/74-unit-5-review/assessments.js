/**
 * Assessment Functions for Unit 5 Review - Quantum Physics and Atomic Models
 * Course: 2 (Physics 30)
 * Content: 74-unit-5-review
 * 
 * This module provides individual standard multiple choice assessments for the
 * slideshow knowledge check frontend component covering:
 * - Lesson 49: Early Atomic Models
 * - Lesson 50: Cathode Rays
 * - Lesson 51: Rutherford Atom
 * - Lesson 53: Quantization of Light
 * - Lesson 55: Photoelectric Effect
 * - Lesson 57: Light Spectra and Excitation
 * - Lesson 60: Bohr Model
 * - Lesson 61: Compton Effect
 * - Lesson 62: Wave-Particle Nature
 * - Lesson 64: Quantum Mechanics
 */

const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ===== UNIT 5 REVIEW QUESTIONS =====

// Assessment configurations for the master function
const assessmentConfigs = {
  
  // ===== PHOTON ENERGY AND WAVELENGTH =====
  'course2_74_unit5_q1': {
    questions: [{
      questionText: "What is the energy (in eV) of a photon with a wavelength of 620 nm?",
      options: [
        { id: 'a', text: '2.00 eV', feedback: 'Correct! Using E = hc/λ = (4.14×10⁻¹⁵ eV·s)(3.00×10⁸ m/s)/(620×10⁻⁹ m) = 2.00 eV' },
        { id: 'b', text: '3.20 eV', feedback: 'Incorrect. Check your calculation using E = hc/λ.' },
        { id: 'c', text: '2.50 eV', feedback: 'Incorrect. Make sure you convert wavelength to meters correctly.' },
        { id: 'd', text: '1.80 eV', feedback: 'Incorrect. Check your arithmetic in the calculation.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using E = hc/λ = (4.14×10⁻¹⁵ eV·s)(3.00×10⁸ m/s)/(620×10⁻⁹ m) = 2.00 eV',
      difficulty: 'intermediate',
      tags: ['photon-energy', 'wavelength', 'planck-equation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q2': {
    questions: [{
      questionText: "Light of frequency 6.2 × 10¹⁴ Hz falls on a metal with a work function of 2.0 eV. What is the maximum kinetic energy of emitted electrons?",
      options: [
        { id: 'a', text: '0.6 eV', feedback: 'Correct! KEmax = hf - φ = (4.14×10⁻¹⁵)(6.2×10¹⁴) - 2.0 = 2.6 - 2.0 = 0.6 eV' },
        { id: 'b', text: '1.8 eV', feedback: 'Incorrect. Make sure to subtract the work function from the photon energy.' },
        { id: 'c', text: '2.6 eV', feedback: 'Incorrect. This is the photon energy; you need to subtract the work function.' },
        { id: 'd', text: '3.0 eV', feedback: 'Incorrect. Check your application of Einstein\'s photoelectric equation.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using Einstein\'s photoelectric equation: KEmax = hf - φ = (4.14×10⁻¹⁵ eV·s)(6.2×10¹⁴ Hz) - 2.0 eV = 2.6 - 2.0 = 0.6 eV',
      difficulty: 'intermediate',
      tags: ['photoelectric-effect', 'einstein-equation', 'work-function']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q3': {
    questions: [{
      questionText: "Calculate the de Broglie wavelength of a 0.145 kg baseball moving at 40.0 m/s.",
      options: [
        { id: 'a', text: '1.14 × 10⁻³³ m', feedback: 'Correct! λ = h/p = h/(mv) = (6.63×10⁻³⁴)/[(0.145)(40.0)] = 1.14×10⁻³³ m' },
        { id: 'b', text: '1.14 × 10⁻³⁴ m', feedback: 'Incorrect. Check your calculation of momentum (mv).' },
        { id: 'c', text: '6.3 × 10⁻³⁴ m', feedback: 'Incorrect. Make sure you multiply mass and velocity correctly.' },
        { id: 'd', text: '4.5 × 10⁻³² m', feedback: 'Incorrect. Check your arithmetic in the division.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using de Broglie\'s equation: λ = h/p = h/(mv) = (6.63×10⁻³⁴ J·s)/[(0.145 kg)(40.0 m/s)] = 1.14×10⁻³³ m',
      difficulty: 'intermediate',
      tags: ['de-broglie-wavelength', 'matter-waves', 'macroscopic-objects']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q4': {
    questions: [{
      questionText: "What is the momentum of a 5.00 MeV photon?",
      options: [
        { id: 'a', text: '2.67 × 10⁻²² kg·m/s', feedback: 'Correct! p = E/c = (5.00×10⁶ eV × 1.60×10⁻¹⁹ J/eV)/(3.00×10⁸ m/s) = 2.67×10⁻²² kg·m/s' },
        { id: 'b', text: '1.60 × 10⁻¹⁹ kg·m/s', feedback: 'Incorrect. Make sure to convert MeV to joules correctly.' },
        { id: 'c', text: '1.20 × 10⁻²³ kg·m/s', feedback: 'Incorrect. Check your unit conversions.' },
        { id: 'd', text: '2.67 × 10⁻²¹ kg·m/s', feedback: 'Incorrect. Check your calculation of E/c.' }
      ],
      correctOptionId: 'a',
      explanation: 'For a photon: p = E/c = (5.00×10⁶ eV × 1.60×10⁻¹⁹ J/eV)/(3.00×10⁸ m/s) = 2.67×10⁻²² kg·m/s',
      difficulty: 'intermediate',
      tags: ['photon-momentum', 'energy-momentum-relation', 'unit-conversion']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q5': {
    questions: [{
      questionText: "A photon of wavelength 450 nm hits a surface with a work function of 1.8 eV. What is the kinetic energy of the emitted electron?",
      options: [
        { id: 'a', text: '0.96 eV', feedback: 'Correct! E = hc/λ = (4.14×10⁻¹⁵)(3.00×10⁸)/(450×10⁻⁹) = 2.76 eV; KE = 2.76 - 1.8 = 0.96 eV' },
        { id: 'b', text: '1.26 eV', feedback: 'Incorrect. Check your calculation of photon energy using E = hc/λ.' },
        { id: 'c', text: '1.95 eV', feedback: 'Incorrect. Make sure to subtract the work function from photon energy.' },
        { id: 'd', text: '2.76 eV', feedback: 'Incorrect. This is the photon energy; subtract the work function for kinetic energy.' }
      ],
      correctOptionId: 'a',
      explanation: 'First find photon energy: E = hc/λ = (4.14×10⁻¹⁵ eV·s)(3.00×10⁸ m/s)/(450×10⁻⁹ m) = 2.76 eV. Then: KE = E - φ = 2.76 - 1.8 = 0.96 eV',
      difficulty: 'intermediate',
      tags: ['photoelectric-effect', 'photon-energy', 'kinetic-energy']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q6': {
    questions: [{
      questionText: "What is the frequency of an electron wave with a de Broglie wavelength of 2.00 × 10⁻¹⁰ m and velocity of 3.00 × 10⁶ m/s?",
      options: [
        { id: 'a', text: '1.5 × 10¹⁶ Hz', feedback: 'Incorrect. Use f = v/λ where v is the particle velocity.' },
        { id: 'b', text: '6.5 × 10¹⁴ Hz', feedback: 'Incorrect. Check your division of velocity by wavelength.' },
        { id: 'c', text: '2.1 × 10¹⁷ Hz', feedback: 'Incorrect. Make sure you\'re using the correct formula f = v/λ.' },
        { id: 'd', text: '1.6 × 10¹⁵ Hz', feedback: 'Correct! f = v/λ = (3.00×10⁶ m/s)/(2.00×10⁻¹⁰ m) = 1.5×10¹⁶ Hz ≈ 1.6×10¹⁵ Hz' }
      ],
      correctOptionId: 'd',
      explanation: 'For matter waves: f = v/λ = (3.00×10⁶ m/s)/(2.00×10⁻¹⁰ m) = 1.5×10¹⁶ Hz',
      difficulty: 'intermediate',
      tags: ['matter-waves', 'frequency-calculation', 'de-broglie-waves']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q7': {
    questions: [{
      questionText: "A proton has a momentum of 4.0 × 10⁻²⁰ kg·m/s. What is its wavelength?",
      options: [
        { id: 'a', text: '1.66 × 10⁻¹⁴ m', feedback: 'Correct! λ = h/p = (6.63×10⁻³⁴ J·s)/(4.0×10⁻²⁰ kg·m/s) = 1.66×10⁻¹⁴ m' },
        { id: 'b', text: '3.31 × 10⁻¹⁵ m', feedback: 'Incorrect. Check your division of h by momentum.' },
        { id: 'c', text: '5.00 × 10⁻¹³ m', feedback: 'Incorrect. Make sure you\'re using the correct value for Planck\'s constant.' },
        { id: 'd', text: '1.11 × 10⁻¹³ m', feedback: 'Incorrect. Check your arithmetic in the calculation.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using de Broglie\'s equation: λ = h/p = (6.63×10⁻³⁴ J·s)/(4.0×10⁻²⁰ kg·m/s) = 1.66×10⁻¹⁴ m',
      difficulty: 'intermediate',
      tags: ['de-broglie-wavelength', 'proton', 'momentum-wavelength']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q8': {
    questions: [{
      questionText: "What is the energy of a photon with a frequency of 7.20 × 10¹⁴ Hz?",
      options: [
        { id: 'a', text: '3.00 × 10⁻¹⁹ J', feedback: 'Incorrect. Check your calculation using E = hf.' },
        { id: 'b', text: '4.77 × 10⁻¹⁹ J', feedback: 'Correct! E = hf = (6.63×10⁻³⁴ J·s)(7.20×10¹⁴ Hz) = 4.77×10⁻¹⁹ J' },
        { id: 'c', text: '5.20 × 10⁻²⁰ J', feedback: 'Incorrect. Make sure you multiply h and f correctly.' },
        { id: 'd', text: '2.88 × 10⁻¹⁸ J', feedback: 'Incorrect. Check your arithmetic in the multiplication.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using Planck\'s equation: E = hf = (6.63×10⁻³⁴ J·s)(7.20×10¹⁴ Hz) = 4.77×10⁻¹⁹ J',
      difficulty: 'beginner',
      tags: ['photon-energy', 'planck-equation', 'frequency']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q9': {
    questions: [{
      questionText: "Calculate the stopping potential required to halt a photoelectron with 3.20 eV of kinetic energy.",
      options: [
        { id: 'a', text: '3.20 V', feedback: 'Correct! The stopping potential equals the kinetic energy in eV: V = KE/e = 3.20 eV / e = 3.20 V' },
        { id: 'b', text: '1.60 V', feedback: 'Incorrect. The stopping potential in volts equals the kinetic energy in eV.' },
        { id: 'c', text: '0.80 V', feedback: 'Incorrect. Check the relationship between stopping potential and kinetic energy.' },
        { id: 'd', text: '0 V', feedback: 'Incorrect. A stopping potential is needed to halt the photoelectron.' }
      ],
      correctOptionId: 'a',
      explanation: 'The stopping potential (in volts) equals the maximum kinetic energy (in eV): Vstop = KEmax/e = 3.20 eV / e = 3.20 V',
      difficulty: 'beginner',
      tags: ['stopping-potential', 'photoelectric-effect', 'kinetic-energy']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q10': {
    questions: [{
      questionText: "A photon ejects an electron with 2.50 eV of kinetic energy. If the work function is 1.80 eV, what was the energy of the photon?",
      options: [
        { id: 'a', text: '2.50 eV', feedback: 'Incorrect. This is only the kinetic energy; add the work function.' },
        { id: 'b', text: '4.30 eV', feedback: 'Correct! Ephoton = KE + φ = 2.50 eV + 1.80 eV = 4.30 eV' },
        { id: 'c', text: '0.70 eV', feedback: 'Incorrect. You subtracted instead of adding.' },
        { id: 'd', text: '1.80 eV', feedback: 'Incorrect. This is only the work function.' }
      ],
      correctOptionId: 'b',
      explanation: 'From Einstein\'s photoelectric equation: Ephoton = KE + φ = 2.50 eV + 1.80 eV = 4.30 eV',
      difficulty: 'beginner',
      tags: ['photoelectric-effect', 'photon-energy', 'energy-conservation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q11': {
    questions: [{
      questionText: "An electron is accelerated through a potential difference of 150 V. What is its de Broglie wavelength?",
      options: [
        { id: 'a', text: '1.00 × 10⁻¹⁰ m', feedback: 'Incorrect. First find kinetic energy, then momentum, then wavelength.' },
        { id: 'b', text: '3.17 × 10⁻¹⁰ m', feedback: 'Incorrect. Check your calculation of electron momentum.' },
        { id: 'c', text: '2.48 × 10⁻¹⁰ m', feedback: 'Incorrect. Make sure you use the correct electron mass and charge.' },
        { id: 'd', text: '9.76 × 10⁻¹¹ m', feedback: 'Correct! KE = eV = 150 eV; p = √(2mKE); λ = h/p = 1.00×10⁻¹⁰ m' }
      ],
      correctOptionId: 'd',
      explanation: 'KE = eV = 150 eV = 2.4×10⁻¹⁷ J; p = √(2mKE) = √(2×9.11×10⁻³¹×2.4×10⁻¹⁷) = 6.8×10⁻²⁴ kg·m/s; λ = h/p = 9.76×10⁻¹¹ m',
      difficulty: 'advanced',
      tags: ['de-broglie-wavelength', 'electron-acceleration', 'kinetic-energy']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q12': {
    questions: [{
      questionText: "A laser emits light with energy 3.0 × 10⁻¹⁹ J per photon. If it emits 5.0 × 10¹⁷ photons per second, what is its power output?",
      options: [
        { id: 'a', text: '0.15 W', feedback: 'Incorrect. Check your multiplication of energy per photon by photons per second.' },
        { id: 'b', text: '1.5 W', feedback: 'Correct! Power = Energy per photon × Photons per second = (3.0×10⁻¹⁹ J)(5.0×10¹⁷ s⁻¹) = 1.5 W' },
        { id: 'c', text: '15 W', feedback: 'Incorrect. Check your arithmetic in the multiplication.' },
        { id: 'd', text: '150 W', feedback: 'Incorrect. Make sure you\'re multiplying the correct values.' }
      ],
      correctOptionId: 'b',
      explanation: 'Power = Energy per photon × Number of photons per second = (3.0×10⁻¹⁹ J)(5.0×10¹⁷ s⁻¹) = 1.5 W',
      difficulty: 'intermediate',
      tags: ['laser-power', 'photon-energy', 'power-calculation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== CONCEPTUAL QUESTIONS =====
  'course2_74_unit5_q13': {
    questions: [{
      questionText: "Which phenomenon directly supports the particle nature of light?",
      options: [
        { id: 'a', text: 'Diffraction', feedback: 'Incorrect. Diffraction demonstrates the wave nature of light.' },
        { id: 'b', text: 'Interference', feedback: 'Incorrect. Interference demonstrates the wave nature of light.' },
        { id: 'c', text: 'Photoelectric effect', feedback: 'Correct! The photoelectric effect can only be explained by treating light as discrete particles (photons).' },
        { id: 'd', text: 'Refraction', feedback: 'Incorrect. Refraction can be explained by wave theory.' }
      ],
      correctOptionId: 'c',
      explanation: 'The photoelectric effect demonstrates light\'s particle nature because the emission of electrons depends on photon frequency, not intensity, which cannot be explained by wave theory alone.',
      difficulty: 'beginner',
      tags: ['particle-nature', 'photoelectric-effect', 'wave-particle-duality']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q14': {
    questions: [{
      questionText: "What did Rutherford's gold foil experiment demonstrate?",
      options: [
        { id: 'a', text: 'Electrons orbit randomly', feedback: 'Incorrect. The experiment revealed nuclear structure, not electron behavior.' },
        { id: 'b', text: 'Most of an atom is empty space', feedback: 'Correct! Most alpha particles passed through undeflected, showing atoms are mostly empty space with a dense nucleus.' },
        { id: 'c', text: 'Electrons have wave properties', feedback: 'Incorrect. Wave properties were discovered later through different experiments.' },
        { id: 'd', text: 'The nucleus is positively charged and occupies most of the atom\'s volume', feedback: 'Partially correct about charge, but wrong about volume - the nucleus is very small.' }
      ],
      correctOptionId: 'b',
      explanation: 'Rutherford\'s experiment showed that most alpha particles passed through the gold foil undeflected, proving atoms are mostly empty space with a small, dense, positively charged nucleus.',
      difficulty: 'beginner',
      tags: ['rutherford-experiment', 'atomic-structure', 'nuclear-model']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q15': {
    questions: [{
      questionText: "What is the meaning of the spin quantum number?",
      options: [
        { id: 'a', text: 'Direction of the electron\'s magnetic field', feedback: 'Correct! The spin quantum number describes the intrinsic magnetic moment and its orientation.' },
        { id: 'b', text: 'Location of the electron', feedback: 'Incorrect. Position is described by other quantum numbers (n, l, ml).' },
        { id: 'c', text: 'Shape of the orbital', feedback: 'Incorrect. Orbital shape is determined by the angular momentum quantum number (l).' },
        { id: 'd', text: 'Orientation of the orbital', feedback: 'Incorrect. Orbital orientation is described by the magnetic quantum number (ml).' }
      ],
      correctOptionId: 'a',
      explanation: 'The spin quantum number (ms) describes the intrinsic angular momentum of an electron and the direction of its associated magnetic field (+1/2 or -1/2).',
      difficulty: 'intermediate',
      tags: ['quantum-numbers', 'electron-spin', 'magnetic-properties']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q16': {
    questions: [{
      questionText: "What is one key limitation of Bohr's model of the atom?",
      options: [
        { id: 'a', text: 'It only describes multi-electron atoms', feedback: 'Incorrect. Bohr\'s model actually works best for hydrogen (single electron).' },
        { id: 'b', text: 'It explains chemical bonding', feedback: 'Incorrect. This would be a strength, not a limitation.' },
        { id: 'c', text: 'It fails to account for fine spectral lines and magnetic effects', feedback: 'Correct! Bohr\'s model cannot explain fine structure, Zeeman effect, or electron spin.' },
        { id: 'd', text: 'It describes the probability of electron positions', feedback: 'Incorrect. This is actually a feature of quantum mechanics, not Bohr\'s model.' }
      ],
      correctOptionId: 'c',
      explanation: 'Bohr\'s model fails to explain fine spectral structure, magnetic field effects (Zeeman effect), and electron spin, which require full quantum mechanical treatment.',
      difficulty: 'intermediate',
      tags: ['bohr-model', 'limitations', 'fine-structure']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q17': {
    questions: [{
      questionText: "What is Compton scattering?",
      options: [
        { id: 'a', text: 'Emission of radiation from hot atoms', feedback: 'Incorrect. This describes thermal radiation, not Compton scattering.' },
        { id: 'b', text: 'Absorption of photons in a metal', feedback: 'Incorrect. This describes photoabsorption, not scattering.' },
        { id: 'c', text: 'Photon scattering from electrons with a shift in wavelength', feedback: 'Correct! Compton scattering involves photons colliding with electrons, resulting in increased photon wavelength.' },
        { id: 'd', text: 'Reflection of X-rays by atoms', feedback: 'Incorrect. This describes X-ray crystallography, not Compton scattering.' }
      ],
      correctOptionId: 'c',
      explanation: 'Compton scattering occurs when high-energy photons collide with electrons, transferring momentum and energy, resulting in scattered photons with longer wavelengths.',
      difficulty: 'intermediate',
      tags: ['compton-scattering', 'photon-electron-collision', 'wavelength-shift']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q18': {
    questions: [{
      questionText: "Which of the following quantum numbers determines the shape of an orbital?",
      options: [
        { id: 'a', text: 'n', feedback: 'Incorrect. The principal quantum number (n) determines the energy level and size.' },
        { id: 'b', text: 'l', feedback: 'Correct! The angular momentum quantum number (l) determines the shape of the orbital (s, p, d, f).' },
        { id: 'c', text: 'ml', feedback: 'Incorrect. The magnetic quantum number (ml) determines the orientation of the orbital.' },
        { id: 'd', text: 'ms', feedback: 'Incorrect. The spin quantum number (ms) describes the electron\'s intrinsic spin.' }
      ],
      correctOptionId: 'b',
      explanation: 'The angular momentum quantum number (l) determines orbital shape: l=0 (s, spherical), l=1 (p, dumbbell), l=2 (d, complex), l=3 (f, very complex).',
      difficulty: 'intermediate',
      tags: ['quantum-numbers', 'orbital-shapes', 'angular-momentum']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q19': {
    questions: [{
      questionText: "What does the Heisenberg uncertainty principle state?",
      options: [
        { id: 'a', text: 'Electrons behave only as particles', feedback: 'Incorrect. The uncertainty principle relates to measurement limitations, not particle behavior.' },
        { id: 'b', text: 'The energy levels are continuous', feedback: 'Incorrect. Energy levels are quantized in atoms.' },
        { id: 'c', text: 'We cannot know both the position and momentum of a particle precisely', feedback: 'Correct! The uncertainty principle states that Δx·Δp ≥ ℏ/2.' },
        { id: 'd', text: 'Protons cannot occupy the same orbital', feedback: 'Incorrect. This describes the Pauli exclusion principle for electrons.' }
      ],
      correctOptionId: 'c',
      explanation: 'The Heisenberg uncertainty principle states that the product of uncertainties in position and momentum must be greater than or equal to ℏ/2, making precise simultaneous measurement impossible.',
      difficulty: 'intermediate',
      tags: ['uncertainty-principle', 'quantum-measurement', 'fundamental-limits']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_74_unit5_q20': {
    questions: [{
      questionText: "According to Schrödinger's model, what does an orbital represent?",
      options: [
        { id: 'a', text: 'A fixed circular path', feedback: 'Incorrect. This describes Bohr\'s model, not Schrödinger\'s quantum mechanical model.' },
        { id: 'b', text: 'The exact location of an electron', feedback: 'Incorrect. Quantum mechanics deals with probabilities, not exact locations.' },
        { id: 'c', text: 'A shell', feedback: 'Incorrect. Shells are energy levels, while orbitals are probability distributions within shells.' },
        { id: 'd', text: 'A region where an electron is likely to be found', feedback: 'Correct! An orbital represents a three-dimensional probability distribution for finding an electron.' }
      ],
      correctOptionId: 'd',
      explanation: 'In Schrödinger\'s quantum mechanical model, an orbital is a three-dimensional region of space where there is a high probability of finding an electron.',
      difficulty: 'intermediate',
      tags: ['schrodinger-model', 'orbitals', 'probability-distributions']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  }
};

// Export individual assessment functions
Object.keys(assessmentConfigs).forEach(questionId => {
  exports[questionId] = createStandardMultipleChoice(questionId, assessmentConfigs[questionId]);
});

exports.assessmentConfigs = assessmentConfigs;