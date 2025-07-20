// L1-38 Cumulative Assignment - Comprehensive Physics 30 Review
// 120-minute assessment covering all major topics from the course

const questions = [
  // Part A: Non-Nature of the Atom (Questions 1-8)
  
  // Question 1: Momentum Conservation
  {
    questionText: "A 1200 kg car moving at 20 m/s collides and sticks with a 900 kg car at rest. What is their final velocity after the collision?",
    options: [
      { id: 'a', text: '8.0 m/s', feedback: 'Incorrect. Check your momentum conservation calculation: m₁v₁ + m₂v₂ = (m₁ + m₂)vf' },
      { id: 'b', text: '11.4 m/s', feedback: 'Correct! Using momentum conservation: (1200)(20) + (900)(0) = (2100)vf, so vf = 24000/2100 = 11.4 m/s' },
      { id: 'c', text: '13.3 m/s', feedback: 'Incorrect. Remember that the second car is initially at rest (v₂ = 0).' },
      { id: 'd', text: '16.2 m/s', feedback: 'Incorrect. Make sure to add both masses in the final momentum calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'In a perfectly inelastic collision, momentum is conserved: m₁v₁ + m₂v₂ = (m₁ + m₂)vf. Here: (1200 kg)(20 m/s) + (900 kg)(0) = (2100 kg)vf, giving vf = 11.4 m/s.',
    difficulty: 'intermediate',
    tags: ['momentum', 'conservation', 'inelastic-collision', 'mechanics']
  },

  // Question 2: Units of Impulse
  {
    questionText: "Which of the following is not a valid unit for impulse?",
    options: [
      { id: 'a', text: 'N·s', feedback: 'Incorrect. N·s is a valid unit for impulse (force × time).' },
      { id: 'b', text: 'kg·m/s', feedback: 'Incorrect. kg·m/s is momentum, which equals impulse by the impulse-momentum theorem.' },
      { id: 'c', text: 'J', feedback: 'Correct! Joule (J) is a unit of energy (N·m), not impulse. Impulse is force × time, not force × distance.' },
      { id: 'd', text: '(kg·m)/s', feedback: 'Incorrect. This is equivalent to kg·m/s, which is a valid unit for impulse.' }
    ],
    correctOptionId: 'c',
    explanation: 'Impulse = Force × Time = N·s = kg·m/s² × s = kg·m/s. Joule (J) = N·m is energy, not impulse.',
    difficulty: 'beginner',
    tags: ['impulse', 'units', 'dimensional-analysis']
  },

  // Question 3: Refraction
  {
    questionText: "A light ray traveling in air strikes a glass surface (n = 1.5) at 60°. What is the angle of refraction?",
    options: [
      { id: 'a', text: '35.3°', feedback: 'Correct! Using Snell\'s Law: n₁sin(θ₁) = n₂sin(θ₂), so sin(θ₂) = sin(60°)/1.5 = 0.577, θ₂ = 35.3°' },
      { id: 'b', text: '22.0°', feedback: 'Incorrect. Check your Snell\'s Law calculation: (1)sin(60°) = (1.5)sin(θ₂).' },
      { id: 'c', text: '40.5°', feedback: 'Incorrect. Remember that light bends toward the normal when entering a denser medium.' },
      { id: 'd', text: '25.4°', feedback: 'Incorrect. Make sure you\'re using the correct values in Snell\'s Law.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Snell\'s Law: n₁sin(θ₁) = n₂sin(θ₂). With n₁ = 1 (air), θ₁ = 60°, n₂ = 1.5: sin(θ₂) = sin(60°)/1.5 = 0.866/1.5 = 0.577, so θ₂ = 35.3°.',
    difficulty: 'intermediate',
    tags: ['refraction', 'snells-law', 'optics']
  },

  // Question 4: Dispersion
  {
    questionText: "Which wave phenomenon causes the splitting of white light into a spectrum when passing through a prism?",
    options: [
      { id: 'a', text: 'Reflection', feedback: 'Incorrect. Reflection bounces light back; it doesn\'t separate colors.' },
      { id: 'b', text: 'Interference', feedback: 'Incorrect. Interference creates patterns but doesn\'t separate white light into colors.' },
      { id: 'c', text: 'Refraction', feedback: 'Correct! Different wavelengths refract at different angles due to dispersion, separating white light into its spectrum.' },
      { id: 'd', text: 'Polarization', feedback: 'Incorrect. Polarization filters light waves by orientation, not wavelength.' }
    ],
    correctOptionId: 'c',
    explanation: 'Dispersion occurs during refraction because the refractive index varies with wavelength. Different colors bend by different amounts, separating white light into its spectrum.',
    difficulty: 'beginner',
    tags: ['dispersion', 'refraction', 'prism', 'spectrum']
  },

  // Question 5: Magnetic Force on Current
  {
    questionText: "A force of 0.75 N acts on a wire of 0.5 m in a 0.60 T magnetic field. What is the current in the wire?",
    options: [
      { id: 'a', text: '2.5 A', feedback: 'Correct! Using F = BIL: I = F/(BL) = 0.75 N/(0.60 T × 0.5 m) = 2.5 A' },
      { id: 'b', text: '3.0 A', feedback: 'Incorrect. Check your calculation of F = BIL.' },
      { id: 'c', text: '5.0 A', feedback: 'Incorrect. Use F = BIL: I = F/(BL) = 0.75/(0.60 × 0.5).' },
      { id: 'd', text: '6.25 A', feedback: 'Incorrect. Make sure you\'re dividing F by the product of B and L.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a current-carrying wire in a magnetic field: F = BIL sin(θ). Assuming perpendicular (θ = 90°): I = F/(BL) = 0.75 N/(0.60 T × 0.5 m) = 2.5 A.',
    difficulty: 'intermediate',
    tags: ['magnetic-force', 'current', 'motor-effect']
  },

  // Question 6: Electric Field
  {
    questionText: "What is the electric field strength 2.0 m from a 6.0 μC point charge?",
    options: [
      { id: 'a', text: '2.7 × 10³ N/C', feedback: 'Incorrect. E = kq/r² = (9×10⁹)(6×10⁻⁶)/(2²).' },
      { id: 'b', text: '1.35 × 10⁴ N/C', feedback: 'Incorrect. This is half the correct value - check your calculation.' },
      { id: 'c', text: '1.35 × 10⁴ N/C', feedback: 'Correct! E = kq/r² = (9×10⁹ N·m²/C²)(6×10⁻⁶ C)/(4 m²) = 1.35×10⁴ N/C' },
      { id: 'd', text: '5.4 × 10⁴ N/C', feedback: 'Incorrect. Make sure to square the distance in the denominator.' }
    ],
    correctOptionId: 'c',
    explanation: 'Electric field from a point charge: E = kq/r² = (9.0×10⁹ N·m²/C²)(6.0×10⁻⁶ C)/(2.0 m)² = 54×10³/4 = 1.35×10⁴ N/C.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'point-charge', 'coulombs-law']
  },

  // Question 7: Convex Mirror
  {
    questionText: "A convex mirror has a focal length of -12 cm. If an object is placed 24 cm in front of it, what is the image distance?",
    options: [
      { id: 'a', text: '-8.0 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di: 1/(-12) = 1/24 + 1/di, so di = -8.0 cm' },
      { id: 'b', text: '-6.0 cm', feedback: 'Incorrect. Check your mirror equation calculation: 1/f = 1/do + 1/di.' },
      { id: 'c', text: '6.0 cm', feedback: 'Incorrect. Convex mirrors always produce virtual images (negative di).' },
      { id: 'd', text: '8.0 cm', feedback: 'Incorrect. The image distance should be negative for a convex mirror.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the mirror equation: 1/f = 1/do + 1/di. With f = -12 cm, do = 24 cm: 1/(-12) = 1/24 + 1/di. Solving: 1/di = -1/12 - 1/24 = -3/24 = -1/8, so di = -8.0 cm.',
    difficulty: 'intermediate',
    tags: ['convex-mirror', 'optics', 'mirror-equation']
  },

  // Question 8: Diffraction Grating
  {
    questionText: "A diffraction grating has 6.00 × 10⁵ lines/m. What is the angle of the first order maximum for light of 500 nm?",
    options: [
      { id: 'a', text: '17.5°', feedback: 'Correct! d = 1/(6×10⁵) = 1.67×10⁻⁶ m. Using d sin θ = mλ: sin θ = (1)(500×10⁻⁹)/(1.67×10⁻⁶) = 0.30, θ = 17.5°' },
      { id: 'b', text: '14.5°', feedback: 'Incorrect. Check your calculation of the grating spacing d = 1/N.' },
      { id: 'c', text: '20.8°', feedback: 'Incorrect. Make sure you\'re using m = 1 for first order.' },
      { id: 'd', text: '30.0°', feedback: 'Incorrect. This would give sin θ = 0.5, which is too large for this grating.' }
    ],
    correctOptionId: 'a',
    explanation: 'Grating spacing: d = 1/(6.00×10⁵) = 1.67×10⁻⁶ m. For first order (m = 1): d sin θ = mλ, so sin θ = (1)(500×10⁻⁹ m)/(1.67×10⁻⁶ m) = 0.30, θ = 17.5°.',
    difficulty: 'advanced',
    tags: ['diffraction-grating', 'interference', 'optics']
  },

  // Part B: Nature of the Atom (Questions 9-20)

  // Question 9: Quantum Model
  {
    questionText: "Which scientist first proposed the quantum model of the atom?",
    options: [
      { id: 'a', text: 'Rutherford', feedback: 'Incorrect. Rutherford proposed the nuclear model with electrons orbiting the nucleus.' },
      { id: 'b', text: 'Schrödinger', feedback: 'Incorrect. Schrödinger developed the wave equation for quantum mechanics, building on Bohr\'s work.' },
      { id: 'c', text: 'Bohr', feedback: 'Correct! Niels Bohr first proposed quantized energy levels in atoms in 1913.' },
      { id: 'd', text: 'Heisenberg', feedback: 'Incorrect. Heisenberg formulated the uncertainty principle, not the first quantum model.' }
    ],
    correctOptionId: 'c',
    explanation: 'Niels Bohr proposed the first quantum model of the atom in 1913, introducing the concept of quantized electron orbits and energy levels.',
    difficulty: 'beginner',
    tags: ['bohr-model', 'quantum-theory', 'atomic-models']
  },

  // Question 10: de Broglie Wavelength
  {
    questionText: "The de Broglie wavelength of a particle is inversely proportional to its:",
    options: [
      { id: 'a', text: 'Speed', feedback: 'Incorrect. λ = h/p, and p = mv, so wavelength depends on momentum, not just speed.' },
      { id: 'b', text: 'Momentum', feedback: 'Correct! The de Broglie wavelength λ = h/p, where p is momentum.' },
      { id: 'c', text: 'Energy', feedback: 'Incorrect. While related to energy, the direct relationship is with momentum.' },
      { id: 'd', text: 'Charge', feedback: 'Incorrect. de Broglie wavelength doesn\'t depend on charge.' }
    ],
    correctOptionId: 'b',
    explanation: 'The de Broglie wavelength is given by λ = h/p, where h is Planck\'s constant and p is momentum. This shows inverse proportionality to momentum.',
    difficulty: 'intermediate',
    tags: ['de-broglie', 'wave-particle-duality', 'quantum-mechanics']
  },

  // Question 11: Photon Energy
  {
    questionText: "A photon with a wavelength of 550 nm has what approximate energy?",
    options: [
      { id: 'a', text: '3.6 × 10⁻¹⁹ J', feedback: 'Correct! E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(550×10⁻⁹) = 3.6×10⁻¹⁹ J' },
      { id: 'b', text: '4.5 × 10⁻¹⁹ J', feedback: 'Incorrect. Check your calculation: E = hc/λ.' },
      { id: 'c', text: '5.4 × 10⁻¹⁹ J', feedback: 'Incorrect. This is too high for 550 nm visible light.' },
      { id: 'd', text: '6.6 × 10⁻¹⁹ J', feedback: 'Incorrect. This would be for shorter wavelength (higher energy) light.' }
    ],
    correctOptionId: 'a',
    explanation: 'Photon energy: E = hf = hc/λ = (6.63×10⁻³⁴ J·s)(3.00×10⁸ m/s)/(550×10⁻⁹ m) = 3.6×10⁻¹⁹ J.',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'planck-equation', 'electromagnetic-radiation']
  },

  // Question 12: Pauli Exclusion Principle
  {
    questionText: "What does the Pauli Exclusion Principle state?",
    options: [
      { id: 'a', text: 'Electrons cannot move in quantized orbits', feedback: 'Incorrect. This contradicts Bohr\'s model; Pauli\'s principle is about quantum numbers.' },
      { id: 'b', text: 'No two electrons can have the same four quantum numbers', feedback: 'Correct! Each electron in an atom must have a unique set of quantum numbers.' },
      { id: 'c', text: 'All orbitals must be filled before pairing electrons', feedback: 'Incorrect. This describes Hund\'s rule, not Pauli exclusion.' },
      { id: 'd', text: 'Electrons behave both as particles and waves', feedback: 'Incorrect. This is wave-particle duality, not Pauli exclusion.' }
    ],
    correctOptionId: 'b',
    explanation: 'The Pauli Exclusion Principle states that no two electrons in an atom can have identical sets of all four quantum numbers (n, l, ml, ms).',
    difficulty: 'intermediate',
    tags: ['pauli-exclusion', 'quantum-numbers', 'atomic-structure']
  },

  // Question 13: Photoelectric Effect
  {
    questionText: "The photoelectric effect shows that:",
    options: [
      { id: 'a', text: 'Light cannot travel in a vacuum', feedback: 'Incorrect. Light does travel in vacuum; this isn\'t related to the photoelectric effect.' },
      { id: 'b', text: 'Light intensity affects photoelectron energy', feedback: 'Incorrect. Intensity affects the number of electrons, not their energy.' },
      { id: 'c', text: 'Light behaves only as a wave', feedback: 'Incorrect. The photoelectric effect actually demonstrates particle behavior.' },
      { id: 'd', text: 'Photon energy depends on light frequency', feedback: 'Correct! The photoelectric effect proved E = hf, showing light\'s particle nature.' }
    ],
    correctOptionId: 'd',
    explanation: 'The photoelectric effect demonstrated that light energy comes in discrete packets (photons) with energy E = hf, dependent only on frequency, not intensity.',
    difficulty: 'intermediate',
    tags: ['photoelectric-effect', 'photons', 'quantum-theory']
  },

  // Question 14: Photoelectric Energy
  {
    questionText: "A photon with energy 3.1 eV hits a surface with a work function of 2.2 eV. What is the kinetic energy of the ejected electron?",
    options: [
      { id: 'a', text: '0.9 eV', feedback: 'Correct! KEmax = Ephoton - Φ = 3.1 eV - 2.2 eV = 0.9 eV' },
      { id: 'b', text: '1.3 eV', feedback: 'Incorrect. Subtract the work function from the photon energy.' },
      { id: 'c', text: '2.2 eV', feedback: 'Incorrect. This is the work function, not the kinetic energy.' },
      { id: 'd', text: '3.1 eV', feedback: 'Incorrect. Some energy is used to overcome the work function.' }
    ],
    correctOptionId: 'a',
    explanation: 'Einstein\'s photoelectric equation: KEmax = hf - Φ = Ephoton - Φ = 3.1 eV - 2.2 eV = 0.9 eV.',
    difficulty: 'intermediate',
    tags: ['photoelectric-effect', 'work-function', 'energy-conservation']
  },

  // Question 15: Photon Recoil
  {
    questionText: "A stationary hydrogen atom emits a 486 nm photon. What is its recoil speed?",
    options: [
      { id: 'a', text: '0.43 m/s', feedback: 'Incorrect. Use conservation of momentum: p_photon = p_atom.' },
      { id: 'b', text: '0.68 m/s', feedback: 'Incorrect. Check your calculation of photon momentum p = h/λ.' },
      { id: 'c', text: '0.82 m/s', feedback: 'Correct! p = h/λ = 6.63×10⁻³⁴/(486×10⁻⁹) = 1.36×10⁻²⁷ kg·m/s. v = p/m = 1.36×10⁻²⁷/(1.67×10⁻²⁷) = 0.82 m/s' },
      { id: 'd', text: '1.12 m/s', feedback: 'Incorrect. Make sure to use the mass of a hydrogen atom.' }
    ],
    correctOptionId: 'c',
    explanation: 'Photon momentum: p = h/λ = 6.63×10⁻³⁴/(486×10⁻⁹) = 1.36×10⁻²⁷ kg·m/s. By conservation of momentum: v = p/m_H = 1.36×10⁻²⁷/(1.67×10⁻²⁷) = 0.82 m/s.',
    difficulty: 'advanced',
    tags: ['photon-momentum', 'conservation-laws', 'recoil']
  },

  // Question 16: Quantum Numbers
  {
    questionText: "The quantum number l represents:",
    options: [
      { id: 'a', text: 'Energy level', feedback: 'Incorrect. The principal quantum number n represents energy level.' },
      { id: 'b', text: 'Electron spin', feedback: 'Incorrect. The spin quantum number ms represents electron spin.' },
      { id: 'c', text: 'Orbital shape', feedback: 'Correct! The azimuthal quantum number l determines orbital shape (s, p, d, f).' },
      { id: 'd', text: 'Orbital orientation', feedback: 'Incorrect. The magnetic quantum number ml represents orbital orientation.' }
    ],
    correctOptionId: 'c',
    explanation: 'The azimuthal (angular momentum) quantum number l determines the shape of the orbital: l = 0 (s), l = 1 (p), l = 2 (d), l = 3 (f).',
    difficulty: 'intermediate',
    tags: ['quantum-numbers', 'atomic-orbitals', 'electron-configuration']
  },

  // Question 17: Nuclear Reaction
  {
    questionText: "When a neutron strikes a boron-11 nucleus, a daughter nucleus and an alpha particle are produced. What is the daughter nucleus?",
    options: [
      { id: 'a', text: 'Lithium-7', feedback: 'Incorrect. Check conservation: ¹₀n + ¹¹₅B → ? + ⁴₂He. Mass: 1 + 11 = A + 4, so A = 8' },
      { id: 'b', text: 'Nitrogen-14', feedback: 'Incorrect. This would violate conservation of charge and mass number.' },
      { id: 'c', text: 'Lithium-8', feedback: 'Correct! ¹₀n + ¹¹₅B → ⁸₃Li + ⁴₂He. Mass: 12 = 8 + 4 ✓, Charge: 5 = 3 + 2 ✓' },
      { id: 'd', text: 'Helium-3', feedback: 'Incorrect. The problem states an alpha particle (He-4) is produced.' }
    ],
    correctOptionId: 'c',
    explanation: 'Nuclear reaction: ¹₀n + ¹¹₅B → X + ⁴₂He. Conservation of mass number: 1 + 11 = A + 4, so A = 8. Conservation of charge: 0 + 5 = Z + 2, so Z = 3. Therefore X = ⁸₃Li.',
    difficulty: 'intermediate',
    tags: ['nuclear-reactions', 'conservation-laws', 'boron-neutron-capture']
  },

  // Question 18: Half-Life
  {
    questionText: "Iodine-131 has a half-life of 8.0 days. How long will it take for a 128 g sample to decay to 16 g?",
    options: [
      { id: 'a', text: '8.0 days', feedback: 'Incorrect. This is only one half-life: 128 g → 64 g.' },
      { id: 'b', text: '16.0 days', feedback: 'Incorrect. This is two half-lives: 128 g → 64 g → 32 g.' },
      { id: 'c', text: '24.0 days', feedback: 'Correct! 128 g → 64 g → 32 g → 16 g is 3 half-lives = 3 × 8.0 = 24.0 days' },
      { id: 'd', text: '32.0 days', feedback: 'Incorrect. Count the half-lives: 128/16 = 8 = 2³, so 3 half-lives.' }
    ],
    correctOptionId: 'c',
    explanation: 'Number of half-lives: 128 g → 64 g → 32 g → 16 g = 3 half-lives. Time = 3 × 8.0 days = 24.0 days. Or: 16 = 128(1/2)ⁿ, so n = 3.',
    difficulty: 'intermediate',
    tags: ['radioactive-decay', 'half-life', 'iodine-131']
  },

  // Question 19: Mass-Energy Conversion
  {
    questionText: "The omega-minus particle has a mass of 1.672 GeV/c². What is this mass in kilograms?",
    options: [
      { id: 'a', text: '2.98 × 10⁻²⁷ kg', feedback: 'Correct! Using 1 GeV/c² = 1.783 × 10⁻²⁷ kg: 1.672 × 1.783 × 10⁻²⁷ = 2.98 × 10⁻²⁷ kg' },
      { id: 'b', text: '4.53 × 10⁻³⁰ kg', feedback: 'Incorrect. This is too small by a factor of ~1000.' },
      { id: 'c', text: '2.98 × 10⁻³⁰ kg', feedback: 'Incorrect. Check your conversion factor for GeV/c² to kg.' },
      { id: 'd', text: '5.72 × 10⁻²⁷ kg', feedback: 'Incorrect. This is about twice the correct value.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the conversion factor 1 GeV/c² = 1.783 × 10⁻²⁷ kg: mass = 1.672 GeV/c² × 1.783 × 10⁻²⁷ kg/(GeV/c²) = 2.98 × 10⁻²⁷ kg.',
    difficulty: 'advanced',
    tags: ['mass-energy', 'particle-physics', 'unit-conversion', 'omega-particle']
  },

  // Question 20: Quark Composition
  {
    questionText: "What is the electric charge of a particle composed of one up quark, one down quark, and one strange quark (uds)?",
    options: [
      { id: 'a', text: '–1', feedback: 'Incorrect. Add the quark charges: (+2/3) + (-1/3) + (-1/3).' },
      { id: 'b', text: '0', feedback: 'Correct! Charges: up (+2/3) + down (-1/3) + strange (-1/3) = +2/3 - 2/3 = 0' },
      { id: 'c', text: '+1', feedback: 'Incorrect. This would be uud (two ups, one down) = proton.' },
      { id: 'd', text: '+2', feedback: 'Incorrect. No combination of three quarks can give charge +2.' }
    ],
    correctOptionId: 'b',
    explanation: 'Quark charges: up = +2/3, down = -1/3, strange = -1/3. Total charge = (+2/3) + (-1/3) + (-1/3) = 0. This is a neutral baryon (Λ⁰).',
    difficulty: 'advanced',
    tags: ['quarks', 'particle-physics', 'electric-charge', 'baryons']
  }
];

// Export assessment configurations for master function
const assessmentConfigs = {
  // Part A: Non-Nature of the Atom
  'course2_73_l138_question1': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question2': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question3': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question4': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question5': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question6': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question7': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question8': {
    questions: [questions[7]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  
  // Part B: Nature of the Atom
  'course2_73_l138_question9': {
    questions: [questions[8]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question10': {
    questions: [questions[9]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question11': {
    questions: [questions[10]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question12': {
    questions: [questions[11]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question13': {
    questions: [questions[12]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question14': {
    questions: [questions[13]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question15': {
    questions: [questions[14]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question16': {
    questions: [questions[15]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question17': {
    questions: [questions[16]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question18': {
    questions: [questions[17]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question19': {
    questions: [questions[18]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_73_l138_question20': {
    questions: [questions[19]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;