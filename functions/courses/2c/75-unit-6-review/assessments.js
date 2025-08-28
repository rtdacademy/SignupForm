/**
 * Assessment Functions for Unit 6 Review - Nuclear Physics and Particle Physics
 * Course: 2 (Physics 30)
 * Content: 75-unit-6-review
 * 
 * This module provides individual standard multiple choice assessments for the
 * slideshow knowledge check frontend component covering:
 * - Lesson 66: Nuclear Physics
 * - Lesson 67: Radioactivity
 * - Lesson 68: Lab Half-Life
 * - Lesson 70: Particle Physics
 * - Lesson 71: Quarks
 */

// Removed dependency on config file - settings are now handled directly in assessment configurations

// ===== UNIT 6 REVIEW QUESTIONS =====

// Assessment configurations for the master function
const assessmentConfigs = {
  
  // ===== NUCLEAR REACTIONS AND TRANSMUTATIONS =====
  'course2_75_unit6_q1': {
    questions: [{
      questionText: "A proton collides with an oxygen-17 nucleus, resulting in the emission of an alpha particle. What is the daughter nucleus?",
      options: [
        { id: 'a', text: 'Nitrogen-13', feedback: 'Incorrect. Check conservation of both mass number and atomic number.' },
        { id: 'b', text: 'Carbon-13', feedback: 'Incorrect. This would not conserve atomic number (8+1≠6+2).' },
        { id: 'c', text: 'Fluorine-17', feedback: 'Incorrect. This would not conserve mass number (17+1≠17+4).' },
        { id: 'd', text: 'Nitrogen-14', feedback: 'Correct! ¹⁷O + ¹H → ⁴He + ¹⁴N. Conservation: mass (17+1=4+14) and charge (8+1=2+7)' }
      ],
      correctOptionId: 'd',
      explanation: 'Nuclear reactions must conserve both mass number and atomic number. Starting with ¹⁷O (A=17, Z=8) + ¹H (A=1, Z=1), total A=18, Z=9. With alpha particle (A=4, Z=2), daughter has A=14, Z=7, which is ¹⁴N.',
      difficulty: 'intermediate',
      tags: ['nuclear-reactions', 'conservation-laws', 'transmutation', 'alpha-decay']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q2': {
    questions: [{
      questionText: "In the nuclear reaction: ¹H + ¹⁹F → ⁴He + ?, what is the missing product?",
      options: [
        { id: 'a', text: '¹⁶N', feedback: 'Incorrect. Check the conservation of mass number (1+19≠4+16).' },
        { id: 'b', text: '¹⁶O', feedback: 'Correct! Conservation: mass (1+19=4+16) and charge (1+9=2+8)' },
        { id: 'c', text: '¹⁵N', feedback: 'Incorrect. While charge is conserved (1+9=2+7), mass is not (1+19≠4+15).' },
        { id: 'd', text: '¹⁴C', feedback: 'Incorrect. Neither mass nor charge would be conserved.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using conservation laws: Mass conservation: 1+19 = 4+A, so A=16. Charge conservation: 1+9 = 2+Z, so Z=8. The product is ¹⁶O (oxygen-16).',
      difficulty: 'intermediate',
      tags: ['nuclear-equations', 'conservation-laws', 'fluorine-reactions']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== MASS SPECTROMETRY =====
  'course2_75_unit6_q3': {
    questions: [{
      questionText: "Ions travel at 3.60×10⁵ m/s through a velocity selector. If the magnetic field is 0.0500 T and the electric plates are 1.25 cm apart, what potential difference is required for the ions to pass undeflected?",
      options: [
        { id: 'a', text: '225 V', feedback: 'Correct! V = vBd = (3.60×10⁵)(0.0500)(0.0125) = 225 V' },
        { id: 'b', text: '450 V', feedback: 'Incorrect. Check your calculation - you may have doubled the result.' },
        { id: 'c', text: '180 V', feedback: 'Incorrect. Make sure you convert plate separation to meters correctly.' },
        { id: 'd', text: '312 V', feedback: 'Incorrect. Check your arithmetic in the multiplication.' }
      ],
      correctOptionId: 'a',
      explanation: 'In a velocity selector, for undeflected motion: qE = qvB, so E = vB. With E = V/d, we get V = vBd = (3.60×10⁵ m/s)(0.0500 T)(0.0125 m) = 225 V',
      difficulty: 'intermediate',
      tags: ['velocity-selector', 'mass-spectrometry', 'electromagnetic-fields']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q4': {
    questions: [{
      questionText: "In a mass spectrometer, a singly charged ion moves in a circle of radius 10.2 mm within a 0.300 T magnetic field. If the electric field in the velocity selector is 6000 V/m, what is the mass of the ion?",
      options: [
        { id: 'a', text: '8.53×10⁻²⁷ kg', feedback: 'Incorrect. Check your calculation of velocity from the electric field.' },
        { id: 'b', text: '1.14×10⁻²⁶ kg', feedback: 'Correct! v = E/B = 6000/0.300 = 2×10⁴ m/s; m = qBr/v = (1.60×10⁻¹⁹)(0.300)(0.0102)/(2×10⁴) = 1.14×10⁻²⁶ kg' },
        { id: 'c', text: '2.01×10⁻²⁶ kg', feedback: 'Incorrect. Check your unit conversion for the radius.' },
        { id: 'd', text: '9.27×10⁻²⁷ kg', feedback: 'Incorrect. Make sure you use the correct velocity calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'First find velocity: v = E/B = 6000/0.300 = 2×10⁴ m/s. In magnetic field: r = mv/qB, so m = qBr/v = (1.60×10⁻¹⁹)(0.300)(0.0102)/(2×10⁴) = 1.14×10⁻²⁶ kg',
      difficulty: 'advanced',
      tags: ['mass-spectrometry', 'circular-motion', 'magnetic-fields', 'ion-mass']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== NUCLEAR BINDING ENERGY =====
  'course2_75_unit6_q5': {
    questions: [{
      questionText: "The measured atomic mass of nickel-58 is 57.9353 u. What is the mass defect of the atom?",
      options: [
        { id: 'a', text: '−0.505 u', feedback: 'Incorrect. Check your calculation of the expected mass from constituent particles.' },
        { id: 'b', text: '−0.652 u', feedback: 'Incorrect. Make sure you account for electron masses correctly.' },
        { id: 'c', text: '−0.481 u', feedback: 'Correct! Expected mass = 28×1.0078 + 30×1.0087 + 28×0.00055 = 58.4164 u; Mass defect = 57.9353 - 58.4164 = −0.481 u' },
        { id: 'd', text: '−0.592 u', feedback: 'Incorrect. Check your values for proton, neutron, and electron masses.' }
      ],
      correctOptionId: 'c',
      explanation: 'Ni-58 has 28 protons, 30 neutrons, 28 electrons. Expected mass = 28(1.0078) + 30(1.0087) + 28(0.00055) = 58.4164 u. Mass defect = 57.9353 - 58.4164 = −0.481 u',
      difficulty: 'advanced',
      tags: ['mass-defect', 'binding-energy', 'nuclear-mass', 'atomic-mass-units']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== ISOTOPE NOTATION =====
  'course2_75_unit6_q6': {
    questions: [{
      questionText: "What is the correct isotope notation and composition for carbon-14?",
      options: [
        { id: 'a', text: '6 protons, 8 neutrons, ¹⁴C', feedback: 'Correct! Carbon has atomic number 6 (6 protons). Mass number 14 - 6 protons = 8 neutrons. Notation: ¹⁴C' },
        { id: 'b', text: '8 protons, 6 neutrons, ¹⁴C', feedback: 'Incorrect. Carbon always has 6 protons (atomic number 6), not 8.' },
        { id: 'c', text: '6 protons, 6 neutrons, ¹²C', feedback: 'Incorrect. This describes carbon-12, not carbon-14.' },
        { id: 'd', text: '14 protons, 6 neutrons, ¹⁴C', feedback: 'Incorrect. The 14 is the mass number (protons + neutrons), not the number of protons.' }
      ],
      correctOptionId: 'a',
      explanation: 'Carbon has atomic number 6, so it always has 6 protons. For carbon-14, the mass number is 14, so neutrons = 14 - 6 = 8. The correct notation is ¹⁴C.',
      difficulty: 'beginner',
      tags: ['isotope-notation', 'atomic-number', 'mass-number', 'carbon-isotopes']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== RADIOACTIVE DECAY =====
  'course2_75_unit6_q7': {
    questions: [{
      questionText: "What particle is emitted in this decay: ²¹⁰Po → ²⁰⁶Pb + ?",
      options: [
        { id: 'a', text: 'Alpha particle', feedback: 'Correct! Mass decreases by 4 (210-206=4) and atomic number decreases by 2 (84-82=2), indicating alpha decay (⁴He)' },
        { id: 'b', text: 'Neutron', feedback: 'Incorrect. Neutron emission would decrease mass by 1 but not change atomic number.' },
        { id: 'c', text: 'Beta-minus', feedback: 'Incorrect. Beta-minus decay increases atomic number by 1 while keeping mass constant.' },
        { id: 'd', text: 'Proton', feedback: 'Incorrect. Proton emission would decrease both mass and atomic number by 1.' }
      ],
      correctOptionId: 'a',
      explanation: 'In this decay, mass number decreases by 4 (210→206) and atomic number decreases by 2 (84→82). This matches alpha particle emission (⁴₂He or ⁴₂α).',
      difficulty: 'intermediate',
      tags: ['radioactive-decay', 'alpha-decay', 'polonium', 'nuclear-equations']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== HALF-LIFE CALCULATIONS =====
  'course2_75_unit6_q8': {
    questions: [{
      questionText: "The half-life of iodine-131 is 8.0 days. How much of a 160 g sample remains after 24.0 days?",
      options: [
        { id: 'a', text: '40 g', feedback: 'Incorrect. This represents 2 half-lives, not 3.' },
        { id: 'b', text: '20 g', feedback: 'Correct! 24.0 days = 3 half-lives. After 3 half-lives: 160 g → 80 g → 40 g → 20 g' },
        { id: 'c', text: '10 g', feedback: 'Incorrect. This would be after 4 half-lives (32 days).' },
        { id: 'd', text: '80 g', feedback: 'Incorrect. This represents only 1 half-life (8 days).' }
      ],
      correctOptionId: 'b',
      explanation: 'Number of half-lives = 24.0 days ÷ 8.0 days = 3. After each half-life, amount halves: 160 g → 80 g → 40 g → 20 g',
      difficulty: 'intermediate',
      tags: ['half-life', 'radioactive-decay', 'exponential-decay', 'iodine-131']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q9': {
    questions: [{
      questionText: "A radioactive isotope has a half-life of 6 hours. How long will it take for a 48 g sample to reduce to 6 g?",
      options: [
        { id: 'a', text: '12 hours', feedback: 'Incorrect. This represents 2 half-lives: 48 g → 24 g → 12 g.' },
        { id: 'b', text: '18 hours', feedback: 'Correct! 48 g → 24 g → 12 g → 6 g requires 3 half-lives = 3 × 6 hours = 18 hours' },
        { id: 'c', text: '24 hours', feedback: 'Incorrect. This would be 4 half-lives, reducing to 3 g.' },
        { id: 'd', text: '6 hours', feedback: 'Incorrect. This is only 1 half-life, reducing to 24 g.' }
      ],
      correctOptionId: 'b',
      explanation: 'To go from 48 g to 6 g: 48 → 24 → 12 → 6. This requires 3 half-lives. Time = 3 × 6 hours = 18 hours',
      difficulty: 'intermediate',
      tags: ['half-life', 'decay-time', 'exponential-decay', 'sample-reduction']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== NUCLEAR FISSION =====
  'course2_75_unit6_q10': {
    questions: [{
      questionText: "In a fission reaction, uranium-238 absorbs a neutron and produces barium-141, krypton-92, and three neutrons. What is the missing equation product?",
      options: [
        { id: 'a', text: '⁵He', feedback: 'Incorrect. Check the conservation laws - no additional particle is needed.' },
        { id: 'b', text: '¹⁴¹Ba', feedback: 'Incorrect. Barium-141 is already listed as a product.' },
        { id: 'c', text: '⁹²Kr', feedback: 'Incorrect. Krypton-92 is already listed as a product.' },
        { id: 'd', text: 'The reaction is already balanced', feedback: 'Correct! Mass: 238+1=141+92+3×1=239✓; Charge: 92+0=56+36+0=92✓' }
      ],
      correctOptionId: 'd',
      explanation: 'Check conservation: Mass number: 238+1 = 141+92+3(1) = 239 ✓. Atomic number: 92+0 = 56+36+0 = 92 ✓. The equation is already balanced.',
      difficulty: 'intermediate',
      tags: ['nuclear-fission', 'conservation-laws', 'uranium-fission', 'nuclear-equations']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== PARTICLE DETECTION =====
  'course2_75_unit6_q11': {
    questions: [{
      questionText: "Why do neutrons not leave tracks in a bubble chamber?",
      options: [
        { id: 'a', text: 'They are unstable particles', feedback: 'Incorrect. Stability does not determine track visibility in bubble chambers.' },
        { id: 'b', text: 'They decay into protons instantly', feedback: 'Incorrect. Free neutron half-life is about 15 minutes, not instant.' },
        { id: 'c', text: 'They have no charge', feedback: 'Correct! Only charged particles ionize the medium and create visible tracks. Neutrons are neutral.' },
        { id: 'd', text: 'Their mass is too large', feedback: 'Incorrect. Mass does not prevent track formation - charge is the determining factor.' }
      ],
      correctOptionId: 'c',
      explanation: 'Bubble chambers detect particles through ionization of the medium. Only charged particles can ionize atoms and create bubble tracks. Neutrons are electrically neutral and pass through without ionizing.',
      difficulty: 'intermediate',
      tags: ['particle-detection', 'bubble-chamber', 'neutral-particles', 'ionization']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q12': {
    questions: [{
      questionText: "In a bubble chamber, what distinguishes a muon track from an electron track?",
      options: [
        { id: 'a', text: 'The muon track is thicker and curves less', feedback: 'Correct! Muons are heavier than electrons, so they have more momentum and curve less in magnetic fields, creating thicker, straighter tracks.' },
        { id: 'b', text: 'The muon track is thinner', feedback: 'Incorrect. Heavier particles typically create thicker tracks due to greater ionization.' },
        { id: 'c', text: 'The electron track is longer', feedback: 'Incorrect. Track length depends on energy, not just particle type.' },
        { id: 'd', text: 'The muon emits gamma radiation', feedback: 'Incorrect. Both particles are charged leptons; gamma emission is not the distinguishing factor.' }
      ],
      correctOptionId: 'a',
      explanation: 'Muons have about 200 times the mass of electrons. In a magnetic field, their greater momentum makes them curve less sharply, and their higher mass causes more ionization, creating thicker tracks.',
      difficulty: 'intermediate',
      tags: ['particle-tracks', 'muons', 'electrons', 'bubble-chamber-analysis']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== PAIR PRODUCTION =====
  'course2_75_unit6_q13': {
    questions: [{
      questionText: "An X-ray photon has energy 2.5 MeV. Can it result in electron–positron pair production?",
      options: [
        { id: 'a', text: 'No, not enough energy', feedback: 'Incorrect. 2.5 MeV exceeds the threshold energy for pair production.' },
        { id: 'b', text: 'Yes, exceeds 1.02 MeV threshold', feedback: 'Correct! Pair production requires minimum 2mₑc² = 2(0.511 MeV) = 1.022 MeV. 2.5 MeV exceeds this threshold.' },
        { id: 'c', text: 'Only if a neutron is present', feedback: 'Incorrect. Pair production requires a nucleus nearby for momentum conservation, not specifically a neutron.' },
        { id: 'd', text: 'Only with a magnetic field', feedback: 'Incorrect. Magnetic fields are not required for pair production.' }
      ],
      correctOptionId: 'b',
      explanation: 'Pair production requires minimum energy of 2mₑc² = 2(0.511 MeV) = 1.022 MeV to create an electron-positron pair. Since 2.5 MeV > 1.022 MeV, pair production is possible.',
      difficulty: 'intermediate',
      tags: ['pair-production', 'threshold-energy', 'photon-energy', 'electron-positron']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q14': {
    questions: [{
      questionText: "What is the total energy required to produce a proton-antiproton pair?",
      options: [
        { id: 'a', text: '0.938 GeV', feedback: 'Incorrect. This is the rest mass energy of one proton, but you need energy for both particles.' },
        { id: 'b', text: '1.876 GeV', feedback: 'Correct! Threshold energy = 2mₚc² = 2(0.938 GeV) = 1.876 GeV for proton-antiproton pair' },
        { id: 'c', text: '1.022 MeV', feedback: 'Incorrect. This is the threshold for electron-positron pair production.' },
        { id: 'd', text: '2.44 GeV', feedback: 'Incorrect. Check the rest mass energy of a proton.' }
      ],
      correctOptionId: 'b',
      explanation: 'Proton-antiproton pair production requires energy equal to twice the proton rest mass: 2mₚc² = 2(0.938 GeV) = 1.876 GeV',
      difficulty: 'intermediate',
      tags: ['pair-production', 'proton-antiproton', 'threshold-energy', 'rest-mass-energy']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q15': {
    questions: [{
      questionText: "What is the wavelength of photons from electron–positron annihilation?",
      options: [
        { id: 'a', text: '2.43×10⁻¹² m', feedback: 'Correct! Each photon has energy 0.511 MeV. λ = hc/E = (4.14×10⁻¹⁵ eV·s)(3×10⁸ m/s)/(0.511×10⁶ eV) = 2.43×10⁻¹² m' },
        { id: 'b', text: '6.63×10⁻³⁴ m', feedback: 'Incorrect. This is Planck\'s constant, not a wavelength.' },
        { id: 'c', text: '1.02×10⁻⁹ m', feedback: 'Incorrect. Check your calculation using λ = hc/E.' },
        { id: 'd', text: '4.51×10⁻¹¹ m', feedback: 'Incorrect. Make sure you use the correct photon energy (0.511 MeV).' }
      ],
      correctOptionId: 'a',
      explanation: 'Electron-positron annihilation produces two 0.511 MeV photons. Using λ = hc/E = (4.14×10⁻¹⁵ eV·s)(3×10⁸ m/s)/(0.511×10⁶ eV) = 2.43×10⁻¹² m',
      difficulty: 'advanced',
      tags: ['annihilation', 'photon-wavelength', 'electron-positron', 'gamma-rays']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== QUARK COMPOSITION =====
  'course2_75_unit6_q16': {
    questions: [{
      questionText: "What is the quark composition of a neutron?",
      options: [
        { id: 'a', text: 'uud', feedback: 'Incorrect. This is the quark composition of a proton.' },
        { id: 'b', text: 'uus', feedback: 'Incorrect. This would include a strange quark, which is not in ordinary matter.' },
        { id: 'c', text: 'udd', feedback: 'Correct! A neutron consists of one up quark (charge +2/3) and two down quarks (charge -1/3 each). Total charge: +2/3 + 2(-1/3) = 0' },
        { id: 'd', text: 'ddu', feedback: 'Incorrect. While this has the same quarks as a neutron, the conventional order is udd.' }
      ],
      correctOptionId: 'c',
      explanation: 'A neutron has zero charge and consists of one up quark (+2/3 charge) and two down quarks (-1/3 charge each): udd. Total charge = +2/3 + (-1/3) + (-1/3) = 0',
      difficulty: 'intermediate',
      tags: ['quark-composition', 'neutron', 'fundamental-particles', 'charge-conservation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_75_unit6_q17': {
    questions: [{
      questionText: "What is the quark composition of a neutral pion (π⁰)?",
      options: [
        { id: 'a', text: 'up + anti-up', feedback: 'Correct! A neutral pion is a meson composed of an up quark and an anti-up quark (u + ū), giving zero charge and other quantum numbers.' },
        { id: 'b', text: 'down + anti-up', feedback: 'Incorrect. This would be a charged pion (π⁻), not neutral.' },
        { id: 'c', text: 'strange + anti-strange', feedback: 'Incorrect. This would be a different neutral meson, not a pion.' },
        { id: 'd', text: 'up + down', feedback: 'Incorrect. This lacks an antiquark and would not be a meson.' }
      ],
      correctOptionId: 'a',
      explanation: 'The neutral pion (π⁰) is a meson composed of an up quark and its antiparticle (anti-up): u + ū. This gives zero net charge and makes it truly neutral.',
      difficulty: 'intermediate',
      tags: ['meson-composition', 'neutral-pion', 'quark-antiquark', 'particle-physics']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== FUNDAMENTAL FORCES =====
  'course2_75_unit6_q18': {
    questions: [{
      questionText: "Which force confines quarks within protons and neutrons?",
      options: [
        { id: 'a', text: 'Electromagnetic', feedback: 'Incorrect. Electromagnetic force affects charged particles but is not responsible for quark confinement.' },
        { id: 'b', text: 'Gravitational', feedback: 'Incorrect. Gravitational force is far too weak to confine quarks.' },
        { id: 'c', text: 'Strong nuclear force', feedback: 'Correct! The strong nuclear force (mediated by gluons) confines quarks within hadrons like protons and neutrons.' },
        { id: 'd', text: 'Weak nuclear force', feedback: 'Incorrect. The weak force is responsible for certain decays, not quark confinement.' }
      ],
      correctOptionId: 'c',
      explanation: 'The strong nuclear force, mediated by gluons, is responsible for binding quarks together within hadrons. This force has the unique property of increasing with distance, making quark confinement possible.',
      difficulty: 'intermediate',
      tags: ['strong-force', 'quark-confinement', 'fundamental-forces', 'gluons']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== QUARK DISCOVERY =====
  'course2_75_unit6_q19': {
    questions: [{
      questionText: "Why was the top quark difficult to discover?",
      options: [
        { id: 'a', text: 'It doesn\'t interact electromagnetically', feedback: 'Incorrect. The top quark does have electric charge and interacts electromagnetically.' },
        { id: 'b', text: 'It exists only in neutron stars', feedback: 'Incorrect. Top quarks can be created in high-energy particle collisions.' },
        { id: 'c', text: 'It has a very large mass requiring high-energy collisions', feedback: 'Correct! The top quark has a mass of about 173 GeV/c², requiring extremely high-energy collisions to produce.' },
        { id: 'd', text: 'It was neutral and undetectable', feedback: 'Incorrect. The top quark has electric charge +2/3 and can be detected.' }
      ],
      correctOptionId: 'c',
      explanation: 'The top quark has an enormous mass of about 173 GeV/c² (similar to a gold nucleus), requiring extremely high-energy particle accelerators to create the conditions necessary for its production and detection.',
      difficulty: 'intermediate',
      tags: ['top-quark', 'particle-discovery', 'high-energy-physics', 'quark-masses']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== BETA DECAY =====
  'course2_75_unit6_q20': {
    questions: [{
      questionText: "In the beta-minus decay of a neutron, which quark transformation occurs?",
      options: [
        { id: 'a', text: 'u → d', feedback: 'Incorrect. This transformation would decrease positive charge, not increase it.' },
        { id: 'b', text: 's → u', feedback: 'Incorrect. Strange quarks are not involved in neutron beta decay.' },
        { id: 'c', text: 'd → u', feedback: 'Correct! In beta-minus decay, a down quark transforms to an up quark: d → u + e⁻ + ν̄ₑ' },
        { id: 'd', text: 'c → t', feedback: 'Incorrect. Charm and top quarks are not involved in ordinary beta decay.' }
      ],
      correctOptionId: 'c',
      explanation: 'In neutron beta-minus decay (n → p + e⁻ + ν̄ₑ), a down quark in the neutron transforms into an up quark: d → u + e⁻ + ν̄ₑ. This changes the neutron (udd) into a proton (uud).',
      difficulty: 'intermediate',
      tags: ['beta-decay', 'quark-transformation', 'weak-force', 'neutron-decay']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;