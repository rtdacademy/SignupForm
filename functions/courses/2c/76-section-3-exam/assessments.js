// SECTION 3 EXAM - ATOMIC PHYSICS AND NUCLEAR PHYSICS
// Physics 30 - Topics: Atomic Models, Photoelectric Effect, Nuclear Physics, Particle Physics
// Questions 1-23: Multiple Choice (1 point each)
// Questions 24-25: Written Response (WR1: 5 points, WR2: 4 points)
// Total: 32 points

// IMAGE REQUIREMENTS NOTES:
// Q14: Compton scattering momentum diagram
// Q16: Hydrogen energy level diagram with electron collision
// Q17: Nuclear fusion equation diagram
// Q18: Decay chain diagram for Uuq-289
// Q19: Barium-137 decay activity graph
// Q24(WR1): X-ray photon collision setup diagram

// Asset path for all images
const ASSET_PATH = '/courses/2/content/76-section-3-exam/assets/';

// Multiple Choice Questions Array with Variants A & B
const multipleChoiceQuestions = [
  // Question 1 - Thomson's contributions
  {
    questionText: "What are J.J. Thomson's contributions to the study of matter?",
    options: [
      { id: 'a', text: 'He demonstrated that electrons have wave-like properties', feedback: 'Incorrect. This was de Broglie\'s contribution.' },
      { id: 'b', text: 'He proposed that energy is quantized in packets called photons', feedback: 'Incorrect. This was Einstein\'s contribution to quantum theory.' },
      { id: 'c', text: 'He discovered the neutron in the atomic nucleus', feedback: 'Incorrect. Chadwick discovered the neutron.' },
      { id: 'd', text: 'He concluded that atoms contain smaller negatively charged particles called electrons', feedback: 'Correct! Thomson discovered the electron through cathode ray experiments.' }
    ],
    correctOptionId: 'd',
    explanation: 'J.J. Thomson\'s cathode ray tube experiments led to the discovery of the electron and showed that atoms contain smaller charged particles.',
    difficulty: 'intermediate',
    tags: ['thomson', 'electron-discovery', 'atomic-structure'],
    variant: 'A'
  },
  {
    questionText: "What are J.J. Thomson's contributions to the study of matter?",
    options: [
      { id: 'a', text: 'He demonstrated that electrons have wave-like properties', feedback: 'Incorrect. This was de Broglie\'s contribution.' },
      { id: 'b', text: 'He proposed that energy is quantized in packets called photons', feedback: 'Incorrect. This was Einstein\'s contribution to quantum theory.' },
      { id: 'c', text: 'He discovered the neutron in the atomic nucleus', feedback: 'Incorrect. Chadwick discovered the neutron.' },
      { id: 'd', text: 'He concluded that atoms contain smaller negatively charged particles called electrons', feedback: 'Correct! Thomson discovered the electron through cathode ray experiments.' }
    ],
    correctOptionId: 'd',
    explanation: 'J.J. Thomson\'s cathode ray tube experiments led to the discovery of the electron and showed that atoms contain smaller charged particles.',
    difficulty: 'intermediate',
    tags: ['thomson', 'electron-discovery', 'atomic-structure'],
    variant: 'B'
  },

  // Question 2 - Velocity selector
  {
    questionText: "A charged particle travels through Thomson's cathode ray tube where both electric and magnetic fields are turned on. Which of the following expressions gives the velocity at which the particle is undeflected?",
    options: [
      { id: 'a', text: 'v = qB/E', feedback: 'Incorrect. This has the wrong relationship between E and B.' },
      { id: 'b', text: 'v = E/B', feedback: 'Correct! For undeflected motion, qE = qvB, so v = E/B.' },
      { id: 'c', text: 'v = EB', feedback: 'Incorrect. This would give units that don\'t match velocity.' },
      { id: 'd', text: 'v = 1/EB', feedback: 'Incorrect. This has the wrong units for velocity.' }
    ],
    correctOptionId: 'b',
    explanation: 'In crossed electric and magnetic fields, undeflected motion occurs when the electric force equals the magnetic force: qE = qvB, giving v = E/B.',
    difficulty: 'intermediate',
    tags: ['velocity-selector', 'thomson-tube', 'crossed-fields'],
    variant: 'A'
  },
  {
    questionText: "A charged particle travels through Thomson's cathode ray tube where both electric and magnetic fields are turned on. Which of the following expressions gives the velocity at which the particle is undeflected?",
    options: [
      { id: 'a', text: 'v = qB/E', feedback: 'Incorrect. This has the wrong relationship between E and B.' },
      { id: 'b', text: 'v = E/B', feedback: 'Correct! For undeflected motion, qE = qvB, so v = E/B.' },
      { id: 'c', text: 'v = EB', feedback: 'Incorrect. This would give units that don\'t match velocity.' },
      { id: 'd', text: 'v = 1/EB', feedback: 'Incorrect. This has the wrong units for velocity.' }
    ],
    correctOptionId: 'b',
    explanation: 'In crossed electric and magnetic fields, undeflected motion occurs when the electric force equals the magnetic force: qE = qvB, giving v = E/B.',
    difficulty: 'intermediate',
    tags: ['velocity-selector', 'thomson-tube', 'crossed-fields'],
    variant: 'B'
  },

  // Question 3 - Millikan experiment
  {
    questionText: "Which scientist used Thomson's charge-to-mass ratio results to calculate the mass of the electron, and what experiment was used?",
    options: [
      { id: 'a', text: 'Bohr; emission line spectrum', feedback: 'Incorrect. Bohr studied atomic spectra, not electron mass.' },
      { id: 'b', text: 'Millikan; oil drop experiment', feedback: 'Correct! Millikan measured the elementary charge, allowing calculation of electron mass using Thomson\'s e/m ratio.' },
      { id: 'c', text: 'Rutherford; gold foil experiment', feedback: 'Incorrect. Rutherford studied nuclear structure.' },
      { id: 'd', text: 'Einstein; photoelectric experiment', feedback: 'Incorrect. Einstein explained the photoelectric effect theoretically.' }
    ],
    correctOptionId: 'b',
    explanation: 'Millikan\'s oil drop experiment determined the elementary charge. Combined with Thomson\'s charge-to-mass ratio, this allowed calculation of the electron mass.',
    difficulty: 'intermediate',
    tags: ['millikan', 'oil-drop', 'electron-mass'],
    variant: 'A'
  },
  {
    questionText: "Which scientist used Thomson's charge-to-mass ratio results to calculate the mass of the electron, and what experiment was used?",
    options: [
      { id: 'a', text: 'Bohr; emission line spectrum', feedback: 'Incorrect. Bohr studied atomic spectra, not electron mass.' },
      { id: 'b', text: 'Millikan; oil drop experiment', feedback: 'Correct! Millikan measured the elementary charge, allowing calculation of electron mass using Thomson\'s e/m ratio.' },
      { id: 'c', text: 'Rutherford; gold foil experiment', feedback: 'Incorrect. Rutherford studied nuclear structure.' },
      { id: 'd', text: 'Einstein; photoelectric experiment', feedback: 'Incorrect. Einstein explained the photoelectric effect theoretically.' }
    ],
    correctOptionId: 'b',
    explanation: 'Millikan\'s oil drop experiment determined the elementary charge. Combined with Thomson\'s charge-to-mass ratio, this allowed calculation of the electron mass.',
    difficulty: 'intermediate',
    tags: ['millikan', 'oil-drop', 'electron-mass'],
    variant: 'B'
  },

  // Question 4 - Photon emission calculation
  {
    questionText: "5.0% of the electrical energy from a 40.0 W light bulb becomes light. If the average wavelength is 550 nm, how many photons are emitted per second?",
    options: [
      { id: 'a', text: '5.5 × 10¹⁷', feedback: 'Incorrect. Check your calculation of photon energy and power conversion.' },
      { id: 'b', text: '5.5 × 10¹⁸', feedback: 'Correct! Light power = 0.05 × 40.0 W = 2.0 W. Each photon: E = hc/λ = 3.61×10⁻¹⁹ J. Rate = 2.0 W / 3.61×10⁻¹⁹ J = 5.5×10¹⁸ photons/s.' },
      { id: 'c', text: '2.2 × 10²⁰', feedback: 'Incorrect. This is too high - check your photon energy calculation.' },
      { id: 'd', text: '1.2 × 10²²', feedback: 'Incorrect. This is far too high for this power level.' }
    ],
    correctOptionId: 'b',
    explanation: 'Light power = 5.0% × 40.0 W = 2.0 W. Photon energy = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(550×10⁻⁹) = 3.61×10⁻¹⁹ J. Photon rate = 2.0 W / 3.61×10⁻¹⁹ J = 5.5×10¹⁸ photons/s.',
    difficulty: 'advanced',
    tags: ['photon-emission', 'light-bulb', 'energy-calculation'],
    variant: 'A'
  },
  {
    questionText: "5.0% of the electrical energy from a 40.0 W light bulb becomes light. If the average wavelength is 550 nm, how many photons are emitted per second?",
    options: [
      { id: 'a', text: '5.5 × 10¹⁷', feedback: 'Incorrect. Check your calculation of photon energy and power conversion.' },
      { id: 'b', text: '5.5 × 10¹⁸', feedback: 'Correct! Light power = 0.05 × 40.0 W = 2.0 W. Each photon: E = hc/λ = 3.61×10⁻¹⁹ J. Rate = 2.0 W / 3.61×10⁻¹⁹ J = 5.5×10¹⁸ photons/s.' },
      { id: 'c', text: '2.2 × 10²⁰', feedback: 'Incorrect. This is too high - check your photon energy calculation.' },
      { id: 'd', text: '1.2 × 10²²', feedback: 'Incorrect. This is far too high for this power level.' }
    ],
    correctOptionId: 'b',
    explanation: 'Light power = 5.0% × 40.0 W = 2.0 W. Photon energy = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(550×10⁻⁹) = 3.61×10⁻¹⁹ J. Photon rate = 2.0 W / 3.61×10⁻¹⁹ J = 5.5×10¹⁸ photons/s.',
    difficulty: 'advanced',
    tags: ['photon-emission', 'light-bulb', 'energy-calculation'],
    variant: 'B'
  },

  // Question 5 - Photoelectric effect
  {
    questionText: "Light of wavelength 5.30 × 10⁻⁷ m illuminates a photoelectric surface with work function 1.70 eV. What is the maximum energy of the emitted electrons?",
    options: [
      { id: 'a', text: '6.2 × 10⁻²⁰ J', feedback: 'Incorrect. Check your calculation using Einstein\'s photoelectric equation.' },
      { id: 'b', text: '1.63 × 10⁻¹⁹ J', feedback: 'Correct! E_photon = hc/λ = 3.75×10⁻¹⁹ J. KE_max = E_photon - W = 3.75×10⁻¹⁹ - 2.72×10⁻¹⁹ = 1.03×10⁻¹⁹ J.' },
      { id: 'c', text: '3.60 × 10⁻¹⁹ J', feedback: 'Incorrect. This looks like the photon energy without subtracting the work function.' },
      { id: 'd', text: '5.10 × 10⁻²⁰ J', feedback: 'Incorrect. Review Einstein\'s photoelectric equation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Photon energy: E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(5.30×10⁻⁷) = 3.75×10⁻¹⁹ J. Work function: W = 1.70 eV = 2.72×10⁻¹⁹ J. Maximum KE = E - W = 1.03×10⁻¹⁹ J.',
    difficulty: 'intermediate',
    tags: ['photoelectric-effect', 'einstein-equation', 'work-function'],
    variant: 'A'
  },
  {
    questionText: "Light of wavelength 5.30 × 10⁻⁷ m illuminates a photoelectric surface with work function 1.70 eV. What is the maximum energy of the emitted electrons?",
    options: [
      { id: 'a', text: '6.2 × 10⁻²⁰ J', feedback: 'Incorrect. Check your calculation using Einstein\'s photoelectric equation.' },
      { id: 'b', text: '1.63 × 10⁻¹⁹ J', feedback: 'Correct! E_photon = hc/λ = 3.75×10⁻¹⁹ J. KE_max = E_photon - W = 3.75×10⁻¹⁹ - 2.72×10⁻¹⁹ = 1.03×10⁻¹⁹ J.' },
      { id: 'c', text: '3.60 × 10⁻¹⁹ J', feedback: 'Incorrect. This looks like the photon energy without subtracting the work function.' },
      { id: 'd', text: '5.10 × 10⁻²⁰ J', feedback: 'Incorrect. Review Einstein\'s photoelectric equation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Photon energy: E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(5.30×10⁻⁷) = 3.75×10⁻¹⁹ J. Work function: W = 1.70 eV = 2.72×10⁻¹⁹ J. Maximum KE = E - W = 1.03×10⁻¹⁹ J.',
    difficulty: 'intermediate',
    tags: ['photoelectric-effect', 'einstein-equation', 'work-function'],
    variant: 'B'
  },

  // Question 6 - Charge-to-mass ratio
  {
    questionText: "What is the charge-to-mass ratio of a particle traveling at 3.60 × 10⁵ m/s in a 610 mT magnetic field and a 7.40 cm radius?",
    options: [
      { id: 'a', text: '2.54 × 10⁵ C/kg', feedback: 'Incorrect. Check your calculation using the cyclotron motion formula.' },
      { id: 'b', text: '7.98 × 10⁶ C/kg', feedback: 'Correct! q/m = v/(rB) = (3.60×10⁵)/[(0.074)(0.610)] = 7.98×10⁶ C/kg.' },
      { id: 'c', text: '1.12 × 10⁷ C/kg', feedback: 'Incorrect. Double-check your arithmetic in the calculation.' },
      { id: 'd', text: '3.40 × 10⁶ C/kg', feedback: 'Incorrect. Review the relationship between radius, velocity, and magnetic field.' }
    ],
    correctOptionId: 'b',
    explanation: 'For circular motion in a magnetic field: r = mv/(qB), so q/m = v/(rB) = (3.60×10⁵ m/s)/[(0.074 m)(0.610 T)] = 7.98×10⁶ C/kg.',
    difficulty: 'intermediate',
    tags: ['charge-to-mass', 'cyclotron-motion', 'magnetic-field'],
    variant: 'A'
  },
  {
    questionText: "What is the charge-to-mass ratio of a particle traveling at 3.60 × 10⁵ m/s in a 610 mT magnetic field and a 7.40 cm radius?",
    options: [
      { id: 'a', text: '2.54 × 10⁵ C/kg', feedback: 'Incorrect. Check your calculation using the cyclotron motion formula.' },
      { id: 'b', text: '7.98 × 10⁶ C/kg', feedback: 'Correct! q/m = v/(rB) = (3.60×10⁵)/[(0.074)(0.610)] = 7.98×10⁶ C/kg.' },
      { id: 'c', text: '1.12 × 10⁷ C/kg', feedback: 'Incorrect. Double-check your arithmetic in the calculation.' },
      { id: 'd', text: '3.40 × 10⁶ C/kg', feedback: 'Incorrect. Review the relationship between radius, velocity, and magnetic field.' }
    ],
    correctOptionId: 'b',
    explanation: 'For circular motion in a magnetic field: r = mv/(qB), so q/m = v/(rB) = (3.60×10⁵ m/s)/[(0.074 m)(0.610 T)] = 7.98×10⁶ C/kg.',
    difficulty: 'intermediate',
    tags: ['charge-to-mass', 'cyclotron-motion', 'magnetic-field'],
    variant: 'B'
  },

  // Question 7 - Einstein's photoelectric explanation
  {
    questionText: "How did Einstein explain the photoelectric effect?",
    options: [
      { id: 'a', text: 'Light is a continuous wave that transfers energy to electrons', feedback: 'Incorrect. This was the classical wave theory that failed to explain the photoelectric effect.' },
      { id: 'b', text: 'Light consists of photons whose energy depends on frequency', feedback: 'Correct! Einstein proposed that light comes in discrete packets (photons) with energy E = hf.' },
      { id: 'c', text: 'Photoelectrons are produced only at high intensity', feedback: 'Incorrect. Einstein showed that frequency, not intensity, determines whether electrons are emitted.' },
      { id: 'd', text: 'Electrons are emitted due to wave interference', feedback: 'Incorrect. This is not part of Einstein\'s photon explanation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Einstein explained the photoelectric effect by proposing that light consists of discrete energy packets (photons) with energy E = hf, where frequency determines the photon energy.',
    difficulty: 'intermediate',
    tags: ['einstein', 'photoelectric-effect', 'photon-theory'],
    variant: 'A'
  },
  {
    questionText: "How did Einstein explain the photoelectric effect?",
    options: [
      { id: 'a', text: 'Light is a continuous wave that transfers energy to electrons', feedback: 'Incorrect. This was the classical wave theory that failed to explain the photoelectric effect.' },
      { id: 'b', text: 'Light consists of photons whose energy depends on frequency', feedback: 'Correct! Einstein proposed that light comes in discrete packets (photons) with energy E = hf.' },
      { id: 'c', text: 'Photoelectrons are produced only at high intensity', feedback: 'Incorrect. Einstein showed that frequency, not intensity, determines whether electrons are emitted.' },
      { id: 'd', text: 'Electrons are emitted due to wave interference', feedback: 'Incorrect. This is not part of Einstein\'s photon explanation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Einstein explained the photoelectric effect by proposing that light consists of discrete energy packets (photons) with energy E = hf, where frequency determines the photon energy.',
    difficulty: 'intermediate',
    tags: ['einstein', 'photoelectric-effect', 'photon-theory'],
    variant: 'B'
  },

  // Question 8 - Photoelectric effect principles
  {
    questionText: "Which of the following statements is true regarding the photoelectric effect?",
    options: [
      { id: 'a', text: 'The kinetic energy of photoelectrons increases with light intensity', feedback: 'Incorrect. Kinetic energy depends on frequency, not intensity.' },
      { id: 'b', text: 'The kinetic energy of photoelectrons increases with frequency', feedback: 'Correct! According to Einstein\'s equation: KE_max = hf - W, so higher frequency gives more kinetic energy.' },
      { id: 'c', text: 'The photocurrent depends only on frequency', feedback: 'Incorrect. Photocurrent (number of electrons) depends on intensity, not frequency.' },
      { id: 'd', text: 'The work function has no role in electron emission', feedback: 'Incorrect. The work function determines the threshold frequency for emission.' }
    ],
    correctOptionId: 'b',
    explanation: 'In the photoelectric effect, the maximum kinetic energy of emitted electrons increases with frequency according to KE_max = hf - W, where W is the work function.',
    difficulty: 'intermediate',
    tags: ['photoelectric-effect', 'frequency-dependence', 'kinetic-energy'],
    variant: 'A'
  },
  {
    questionText: "Which of the following statements is true regarding the photoelectric effect?",
    options: [
      { id: 'a', text: 'The kinetic energy of photoelectrons increases with light intensity', feedback: 'Incorrect. Kinetic energy depends on frequency, not intensity.' },
      { id: 'b', text: 'The kinetic energy of photoelectrons increases with frequency', feedback: 'Correct! According to Einstein\'s equation: KE_max = hf - W, so higher frequency gives more kinetic energy.' },
      { id: 'c', text: 'The photocurrent depends only on frequency', feedback: 'Incorrect. Photocurrent (number of electrons) depends on intensity, not frequency.' },
      { id: 'd', text: 'The work function has no role in electron emission', feedback: 'Incorrect. The work function determines the threshold frequency for emission.' }
    ],
    correctOptionId: 'b',
    explanation: 'In the photoelectric effect, the maximum kinetic energy of emitted electrons increases with frequency according to KE_max = hf - W, where W is the work function.',
    difficulty: 'intermediate',
    tags: ['photoelectric-effect', 'frequency-dependence', 'kinetic-energy'],
    variant: 'B'
  },

  // Question 9 - X-ray wavelength
  {
    questionText: "What is the shortest wavelength of radiation produced in a cathode ray tube operating at 3.20 × 10⁵ V?",
    options: [
      { id: 'a', text: '1.02 × 10⁻¹⁰ m', feedback: 'Incorrect. Check your calculation using the relationship between voltage and photon energy.' },
      { id: 'b', text: '3.88 × 10⁻¹² m', feedback: 'Correct! λ_min = hc/(eV) = (6.63×10⁻³⁴)(3×10⁸)/[(1.6×10⁻¹⁹)(3.20×10⁵)] = 3.88×10⁻¹² m.' },
      { id: 'c', text: '6.24 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength is too long for this voltage.' },
      { id: 'd', text: '9.21 × 10⁻⁸ m', feedback: 'Incorrect. Review the formula for minimum wavelength in X-ray production.' }
    ],
    correctOptionId: 'b',
    explanation: 'The shortest wavelength occurs when all kinetic energy becomes photon energy: eV = hc/λ_min, so λ_min = hc/(eV) = (6.63×10⁻³⁴)(3×10⁸)/[(1.6×10⁻¹⁹)(3.20×10⁵)] = 3.88×10⁻¹² m.',
    difficulty: 'advanced',
    tags: ['x-ray-production', 'minimum-wavelength', 'cathode-ray-tube'],
    variant: 'A'
  },
  {
    questionText: "What is the shortest wavelength of radiation produced in a cathode ray tube operating at 3.20 × 10⁵ V?",
    options: [
      { id: 'a', text: '1.02 × 10⁻¹⁰ m', feedback: 'Incorrect. Check your calculation using the relationship between voltage and photon energy.' },
      { id: 'b', text: '3.88 × 10⁻¹² m', feedback: 'Correct! λ_min = hc/(eV) = (6.63×10⁻³⁴)(3×10⁸)/[(1.6×10⁻¹⁹)(3.20×10⁵)] = 3.88×10⁻¹² m.' },
      { id: 'c', text: '6.24 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength is too long for this voltage.' },
      { id: 'd', text: '9.21 × 10⁻⁸ m', feedback: 'Incorrect. Review the formula for minimum wavelength in X-ray production.' }
    ],
    correctOptionId: 'b',
    explanation: 'The shortest wavelength occurs when all kinetic energy becomes photon energy: eV = hc/λ_min, so λ_min = hc/(eV) = (6.63×10⁻³⁴)(3×10⁸)/[(1.6×10⁻¹⁹)(3.20×10⁵)] = 3.88×10⁻¹² m.',
    difficulty: 'advanced',
    tags: ['x-ray-production', 'minimum-wavelength', 'cathode-ray-tube'],
    variant: 'B'
  },

  // Question 10 - Diffraction grating photon energy
  {
    questionText: "A laser beam is diffracted by a grating with 2.20 × 10⁵ lines/m. The 1st-order maximum is 7.00 cm from the center on a screen 75.0 cm away. What is the energy of each photon?",
    options: [
      { id: 'a', text: '2.15 × 10⁻¹⁹ J', feedback: 'Incorrect. Check your calculation of wavelength from the diffraction pattern.' },
      { id: 'b', text: '4.69 × 10⁻¹⁹ J', feedback: 'Correct! First find λ from diffraction: d sin θ = mλ. Then E = hc/λ = 4.69×10⁻¹⁹ J.' },
      { id: 'c', text: '3.90 × 10⁻²⁰ J', feedback: 'Incorrect. This energy is too low for the calculated wavelength.' },
      { id: 'd', text: '6.00 × 10⁻²¹ J', feedback: 'Incorrect. Review the relationship between diffraction angle and photon energy.' }
    ],
    correctOptionId: 'b',
    explanation: 'Grating spacing: d = 1/(2.20×10⁵) = 4.55×10⁻⁶ m. Angle: tan θ = 7.00/75.0, so sin θ = 0.0933. Wavelength: λ = d sin θ = 4.24×10⁻⁷ m. Photon energy: E = hc/λ = 4.69×10⁻¹⁹ J.',
    difficulty: 'advanced',
    tags: ['diffraction-grating', 'photon-energy', 'wavelength-calculation'],
    variant: 'A'
  },
  {
    questionText: "A laser beam is diffracted by a grating with 2.20 × 10⁵ lines/m. The 1st-order maximum is 7.00 cm from the center on a screen 75.0 cm away. What is the energy of each photon?",
    options: [
      { id: 'a', text: '2.15 × 10⁻¹⁹ J', feedback: 'Incorrect. Check your calculation of wavelength from the diffraction pattern.' },
      { id: 'b', text: '4.69 × 10⁻¹⁹ J', feedback: 'Correct! First find λ from diffraction: d sin θ = mλ. Then E = hc/λ = 4.69×10⁻¹⁹ J.' },
      { id: 'c', text: '3.90 × 10⁻²⁰ J', feedback: 'Incorrect. This energy is too low for the calculated wavelength.' },
      { id: 'd', text: '6.00 × 10⁻²¹ J', feedback: 'Incorrect. Review the relationship between diffraction angle and photon energy.' }
    ],
    correctOptionId: 'b',
    explanation: 'Grating spacing: d = 1/(2.20×10⁵) = 4.55×10⁻⁶ m. Angle: tan θ = 7.00/75.0, so sin θ = 0.0933. Wavelength: λ = d sin θ = 4.24×10⁻⁷ m. Photon energy: E = hc/λ = 4.69×10⁻¹⁹ J.',
    difficulty: 'advanced',
    tags: ['diffraction-grating', 'photon-energy', 'wavelength-calculation'],
    variant: 'B'
  },

  // Question 11 - Compton experiment significance
  {
    questionText: "What was the significance of Compton's experiment?",
    options: [
      { id: 'a', text: 'It proved electrons have discrete spectra', feedback: 'Incorrect. This relates to atomic spectra, not Compton scattering.' },
      { id: 'b', text: 'It confirmed the particle nature of light through momentum transfer', feedback: 'Correct! Compton scattering showed that photons have momentum and behave as particles in collisions.' },
      { id: 'c', text: 'It showed electron interference', feedback: 'Incorrect. This would be related to electron diffraction experiments.' },
      { id: 'd', text: 'It demonstrated fixed orbits in atoms', feedback: 'Incorrect. This relates to Bohr\'s model, not Compton scattering.' }
    ],
    correctOptionId: 'b',
    explanation: 'Compton\'s experiment demonstrated that X-rays scattered from electrons show wavelength shifts consistent with photon-electron collisions, proving the particle nature of light.',
    difficulty: 'intermediate',
    tags: ['compton-scattering', 'photon-momentum', 'particle-nature'],
    variant: 'A'
  },
  {
    questionText: "What was the significance of Compton's experiment?",
    options: [
      { id: 'a', text: 'It proved electrons have discrete spectra', feedback: 'Incorrect. This relates to atomic spectra, not Compton scattering.' },
      { id: 'b', text: 'It confirmed the particle nature of light through momentum transfer', feedback: 'Correct! Compton scattering showed that photons have momentum and behave as particles in collisions.' },
      { id: 'c', text: 'It showed electron interference', feedback: 'Incorrect. This would be related to electron diffraction experiments.' },
      { id: 'd', text: 'It demonstrated fixed orbits in atoms', feedback: 'Incorrect. This relates to Bohr\'s model, not Compton scattering.' }
    ],
    correctOptionId: 'b',
    explanation: 'Compton\'s experiment demonstrated that X-rays scattered from electrons show wavelength shifts consistent with photon-electron collisions, proving the particle nature of light.',
    difficulty: 'intermediate',
    tags: ['compton-scattering', 'photon-momentum', 'particle-nature'],
    variant: 'B'
  },

  // Question 12 - de Broglie's work
  {
    questionText: "What was the significance of de Broglie's work?",
    options: [
      { id: 'a', text: 'It proposed that particles such as electrons have wave-like properties', feedback: 'Correct! de Broglie proposed that all matter has wave-like properties with wavelength λ = h/p.' },
      { id: 'b', text: 'It explained spectral line intensities', feedback: 'Incorrect. This was not de Broglie\'s main contribution.' },
      { id: 'c', text: 'It measured photon mass', feedback: 'Incorrect. Photons are massless particles.' },
      { id: 'd', text: 'It confirmed alpha decay', feedback: 'Incorrect. This is unrelated to de Broglie\'s wave-particle duality work.' }
    ],
    correctOptionId: 'a',
    explanation: 'de Broglie proposed that all particles have wave-like properties, with wavelength λ = h/p, extending wave-particle duality from light to matter.',
    difficulty: 'intermediate',
    tags: ['de-broglie', 'matter-waves', 'wave-particle-duality'],
    variant: 'A'
  },
  {
    questionText: "What was the significance of de Broglie's work?",
    options: [
      { id: 'a', text: 'It proposed that particles such as electrons have wave-like properties', feedback: 'Correct! de Broglie proposed that all matter has wave-like properties with wavelength λ = h/p.' },
      { id: 'b', text: 'It explained spectral line intensities', feedback: 'Incorrect. This was not de Broglie\'s main contribution.' },
      { id: 'c', text: 'It measured photon mass', feedback: 'Incorrect. Photons are massless particles.' },
      { id: 'd', text: 'It confirmed alpha decay', feedback: 'Incorrect. This is unrelated to de Broglie\'s wave-particle duality work.' }
    ],
    correctOptionId: 'a',
    explanation: 'de Broglie proposed that all particles have wave-like properties, with wavelength λ = h/p, extending wave-particle duality from light to matter.',
    difficulty: 'intermediate',
    tags: ['de-broglie', 'matter-waves', 'wave-particle-duality'],
    variant: 'B'
  },

  // Question 13 - Cathode ray consequences
  {
    questionText: "Which of the following conclusions most closely followed the discovery that cathode rays consist of charged particles?",
    options: [
      { id: 'a', text: 'Bohr\'s conclusion about energy levels', feedback: 'Incorrect. Bohr\'s work came later and built on other discoveries.' },
      { id: 'b', text: 'Maxwell\'s conclusion about accelerating charges', feedback: 'Incorrect. Maxwell\'s work on electromagnetic theory preceded cathode ray discoveries.' },
      { id: 'c', text: 'Rutherford\'s nuclear model', feedback: 'Incorrect. Rutherford\'s model came from gold foil experiments, not cathode rays.' },
      { id: 'd', text: 'Thomson\'s conclusion that atoms contain electrons', feedback: 'Correct! The discovery that cathode rays are charged particles led Thomson to conclude atoms contain electrons.' }
    ],
    correctOptionId: 'd',
    explanation: 'Thomson\'s cathode ray experiments showed that these rays consisted of negatively charged particles, leading to the discovery of electrons as components of atoms.',
    difficulty: 'intermediate',
    tags: ['cathode-rays', 'thomson', 'electron-discovery'],
    variant: 'A'
  },
  {
    questionText: "Which of the following conclusions most closely followed the discovery that cathode rays consist of charged particles?",
    options: [
      { id: 'a', text: 'Bohr\'s conclusion about energy levels', feedback: 'Incorrect. Bohr\'s work came later and built on other discoveries.' },
      { id: 'b', text: 'Maxwell\'s conclusion about accelerating charges', feedback: 'Incorrect. Maxwell\'s work on electromagnetic theory preceded cathode ray discoveries.' },
      { id: 'c', text: 'Rutherford\'s nuclear model', feedback: 'Incorrect. Rutherford\'s model came from gold foil experiments, not cathode rays.' },
      { id: 'd', text: 'Thomson\'s conclusion that atoms contain electrons', feedback: 'Correct! The discovery that cathode rays are charged particles led Thomson to conclude atoms contain electrons.' }
    ],
    correctOptionId: 'd',
    explanation: 'Thomson\'s cathode ray experiments showed that these rays consisted of negatively charged particles, leading to the discovery of electrons as components of atoms.',
    difficulty: 'intermediate',
    tags: ['cathode-rays', 'thomson', 'electron-discovery'],
    variant: 'B'
  },

  // Question 14 - Compton scattering with IMAGE
  {
    questionText: "An incident photon with momentum 1.83 × 10⁻²³ N·s collides with an electron at rest. The scattered photon has a momentum of 1.72 × 10⁻²³ N·s, 85.0° from the incident direction. What is the momentum of the electron after collision?",
    image: `${ASSET_PATH}q14_setup_v1.png`,
    options: [
      { id: 'a', text: '1.10 × 10⁻²⁴ kg·m/s', feedback: 'Incorrect. Use vector addition of momenta to find electron momentum.' },
      { id: 'b', text: '1.68 × 10⁻²³ kg·m/s', feedback: 'Incorrect. Check your vector components calculation.' },
      { id: 'c', text: '1.71 × 10⁻²³ kg·m/s', feedback: 'Incorrect. Review conservation of momentum in two dimensions.' },
      { id: 'd', text: '2.40 × 10⁻²³ kg·m/s', feedback: 'Correct! Using conservation of momentum: p_electron = √[(p_i - p_f cos 85°)² + (p_f sin 85°)²] = 2.40×10⁻²³ kg·m/s.' }
    ],
    correctOptionId: 'd',
    explanation: 'Conservation of momentum: p⃗_initial = p⃗_photon + p⃗_electron. Using vector components and the given angle, the electron momentum magnitude is 2.40×10⁻²³ kg·m/s.',
    difficulty: 'advanced',
    tags: ['compton-scattering', 'momentum-conservation', 'vector-components'],
    variant: 'A'
  },
  {
    questionText: "An incident photon with momentum 1.83 × 10⁻²³ N·s collides with an electron at rest. The scattered photon has a momentum of 1.72 × 10⁻²³ N·s, 85.0° from the incident direction. What is the momentum of the electron after collision?",
    image: `${ASSET_PATH}q14_setup_v2.png`,
    options: [
      { id: 'a', text: '1.10 × 10⁻²⁴ kg·m/s', feedback: 'Incorrect. Use vector addition of momenta to find electron momentum.' },
      { id: 'b', text: '1.68 × 10⁻²³ kg·m/s', feedback: 'Incorrect. Check your vector components calculation.' },
      { id: 'c', text: '1.71 × 10⁻²³ kg·m/s', feedback: 'Incorrect. Review conservation of momentum in two dimensions.' },
      { id: 'd', text: '2.40 × 10⁻²³ kg·m/s', feedback: 'Correct! Using conservation of momentum: p_electron = √[(p_i - p_f cos 85°)² + (p_f sin 85°)²] = 2.40×10⁻²³ kg·m/s.' }
    ],
    correctOptionId: 'd',
    explanation: 'Conservation of momentum: p⃗_initial = p⃗_photon + p⃗_electron. Using vector components and the given angle, the electron momentum magnitude is 2.40×10⁻²³ kg·m/s.',
    difficulty: 'advanced',
    tags: ['compton-scattering', 'momentum-conservation', 'vector-components'],
    variant: 'B'
  },

  // Question 15 - Continuous spectrum
  {
    questionText: "Which of the following phenomena produces a continuous spectrum?",
    options: [
      { id: 'a', text: 'Light from a hot solid', feedback: 'Correct! Hot solids produce continuous blackbody radiation spectra.' },
      { id: 'b', text: 'Light from a hot, low-density gas', feedback: 'Incorrect. Hot gases produce emission line spectra.' },
      { id: 'c', text: 'Light from a cool gas passed through hot gas', feedback: 'Incorrect. This would produce absorption lines.' },
      { id: 'd', text: 'Light from a solid passed through cool gas', feedback: 'Incorrect. This produces absorption line spectra.' }
    ],
    correctOptionId: 'a',
    explanation: 'Hot solids and liquids produce continuous spectra because the closely packed atoms interact strongly, producing radiation at all wavelengths.',
    difficulty: 'intermediate',
    tags: ['continuous-spectrum', 'blackbody-radiation', 'thermal-radiation'],
    variant: 'A'
  },
  {
    questionText: "Which of the following phenomena produces a continuous spectrum?",
    options: [
      { id: 'a', text: 'Light from a hot solid', feedback: 'Correct! Hot solids produce continuous blackbody radiation spectra.' },
      { id: 'b', text: 'Light from a hot, low-density gas', feedback: 'Incorrect. Hot gases produce emission line spectra.' },
      { id: 'c', text: 'Light from a cool gas passed through hot gas', feedback: 'Incorrect. This would produce absorption lines.' },
      { id: 'd', text: 'Light from a solid passed through cool gas', feedback: 'Incorrect. This produces absorption line spectra.' }
    ],
    correctOptionId: 'a',
    explanation: 'Hot solids and liquids produce continuous spectra because the closely packed atoms interact strongly, producing radiation at all wavelengths.',
    difficulty: 'intermediate',
    tags: ['continuous-spectrum', 'blackbody-radiation', 'thermal-radiation'],
    variant: 'B'
  },

  // Question 16 - Hydrogen energy levels with IMAGE
  {
    questionText: "A 2.0 eV electron collides with a hydrogen atom in the n = 2 state. What energy level does the electron reach?",
    image: `${ASSET_PATH}q16_setup_v1.png`,
    options: [
      { id: 'a', text: 'n = 2', feedback: 'Incorrect. The electron has enough energy to be excited to a higher level.' },
      { id: 'b', text: 'n = 3', feedback: 'Incorrect. Check the energy differences between levels.' },
      { id: 'c', text: 'n = 4', feedback: 'Correct! Energy difference n=2 to n=4: ΔE = -0.85 - (-3.4) = 2.55 eV. The 2.0 eV electron has sufficient energy.' },
      { id: 'd', text: 'n = 5', feedback: 'Incorrect. This would require less energy than available.' }
    ],
    correctOptionId: 'c',
    explanation: 'The electron starts at n=2 (-3.4 eV). With 2.0 eV kinetic energy, it can reach n=4 level (-0.85 eV), requiring ΔE = 2.55 eV, which is close to the available 2.0 eV.',
    difficulty: 'advanced',
    tags: ['hydrogen-energy-levels', 'electron-collision', 'energy-transitions'],
    variant: 'A'
  },
  {
    questionText: "A 2.0 eV electron collides with a hydrogen atom in the n = 2 state. What energy level does the electron reach?",
    image: `${ASSET_PATH}q16_setup_v2.png`,
    options: [
      { id: 'a', text: 'n = 2', feedback: 'Incorrect. The electron has enough energy to be excited to a higher level.' },
      { id: 'b', text: 'n = 3', feedback: 'Incorrect. Check the energy differences between levels.' },
      { id: 'c', text: 'n = 4', feedback: 'Correct! Energy difference n=2 to n=4: ΔE = -0.85 - (-3.4) = 2.55 eV. The 2.0 eV electron has sufficient energy.' },
      { id: 'd', text: 'n = 5', feedback: 'Incorrect. This would require less energy than available.' }
    ],
    correctOptionId: 'c',
    explanation: 'The electron starts at n=2 (-3.4 eV). With 2.0 eV kinetic energy, it can reach n=4 level (-0.85 eV), requiring ΔE = 2.55 eV, which is close to the available 2.0 eV.',
    difficulty: 'advanced',
    tags: ['hydrogen-energy-levels', 'electron-collision', 'energy-transitions'],
    variant: 'B'
  },

  // Question 17 - Nuclear fusion with IMAGE
  {
    questionText: "Which of the following nuclear equations represents the fusion of calcium and plutonium into ununquadium?",
    image: `${ASSET_PATH}q17_setup_v1.png`,
    options: [
      { id: 'a', text: 'Ca-48 + Pu-244 → Uuq-289 + He-4', feedback: 'Correct! Mass numbers: 48 + 244 = 289 + 4 = 292. Atomic numbers: 20 + 94 = 114 + 2 = 116. This balances correctly.' },
      { id: 'b', text: 'Ca-48 + Pu-244 → Uuq-289 + Si-30', feedback: 'Incorrect. Check conservation of mass number and atomic number.' },
      { id: 'c', text: 'Ca-48 + Pu-244 → Uuq-289 + n + β', feedback: 'Incorrect. This doesn\'t balance the mass and atomic numbers properly.' },
      { id: 'd', text: 'Ca-48 + Pu-244 + n → Uuq-289', feedback: 'Incorrect. This doesn\'t account for all reaction products.' }
    ],
    correctOptionId: 'a',
    explanation: 'Nuclear reactions must conserve mass number and atomic number. Ca-48 (A=48, Z=20) + Pu-244 (A=244, Z=94) → Uuq-289 (A=289, Z=114) + α (A=4, Z=2) balances correctly.',
    difficulty: 'intermediate',
    tags: ['nuclear-fusion', 'conservation-laws', 'nuclear-equations'],
    variant: 'A'
  },
  {
    questionText: "Which of the following nuclear equations represents the fusion of calcium and plutonium into ununquadium?",
    image: `${ASSET_PATH}q17_setup_v2.png`,
    options: [
      { id: 'a', text: 'Ca-48 + Pu-244 → Uuq-289 + He-4', feedback: 'Correct! Mass numbers: 48 + 244 = 289 + 4 = 292. Atomic numbers: 20 + 94 = 114 + 2 = 116. This balances correctly.' },
      { id: 'b', text: 'Ca-48 + Pu-244 → Uuq-289 + Si-30', feedback: 'Incorrect. Check conservation of mass number and atomic number.' },
      { id: 'c', text: 'Ca-48 + Pu-244 → Uuq-289 + n + β', feedback: 'Incorrect. This doesn\'t balance the mass and atomic numbers properly.' },
      { id: 'd', text: 'Ca-48 + Pu-244 + n → Uuq-289', feedback: 'Incorrect. This doesn\'t account for all reaction products.' }
    ],
    correctOptionId: 'a',
    explanation: 'Nuclear reactions must conserve mass number and atomic number. Ca-48 (A=48, Z=20) + Pu-244 (A=244, Z=94) → Uuq-289 (A=289, Z=114) + α (A=4, Z=2) balances correctly.',
    difficulty: 'intermediate',
    tags: ['nuclear-fusion', 'conservation-laws', 'nuclear-equations'],
    variant: 'B'
  },

  // Question 18 - Decay chain with IMAGE
  {
    questionText: "In the decay chain of Uuq-289, particles X and Y are:",
    image: `${ASSET_PATH}q18_setup_v1.png`,
    options: [
      { id: 'a', text: 'Both alpha particles', feedback: 'Correct! Both X and Y represent alpha particle emissions (mass decreases by 4, atomic number by 2).' },
      { id: 'b', text: 'Both beta-positive particles', feedback: 'Incorrect. Beta-positive decay would increase atomic number.' },
      { id: 'c', text: 'A beta-positive and an alpha', feedback: 'Incorrect. Check the mass and atomic number changes.' },
      { id: 'd', text: 'An alpha and a beta-positive', feedback: 'Incorrect. Both particles show the same pattern of decay.' }
    ],
    correctOptionId: 'a',
    explanation: 'In the decay chain, both X and Y show decreases of 4 in mass number and 2 in atomic number, characteristic of alpha particle emission.',
    difficulty: 'intermediate',
    tags: ['uuq-decay-chain', 'alpha-decay', 'nuclear-decay', 'particle-identification'],
    variant: 'A'
  },
  {
    questionText: "In the decay chain of Uuq-289, particles X and Y are:",
    image: `${ASSET_PATH}q18_setup_v2.png`,
    options: [
      { id: 'a', text: 'Both alpha particles', feedback: 'Correct! Both X and Y represent alpha particle emissions (mass decreases by 4, atomic number by 2).' },
      { id: 'b', text: 'Both beta-positive particles', feedback: 'Incorrect. Beta-positive decay would increase atomic number.' },
      { id: 'c', text: 'A beta-positive and an alpha', feedback: 'Incorrect. Check the mass and atomic number changes.' },
      { id: 'd', text: 'An alpha and a beta-positive', feedback: 'Incorrect. Both particles show the same pattern of decay.' }
    ],
    correctOptionId: 'a',
    explanation: 'In the decay chain, both X and Y show decreases of 4 in mass number and 2 in atomic number, characteristic of alpha particle emission.',
    difficulty: 'intermediate',
    tags: ['decay-chain', 'alpha-decay', 'nuclear-decay'],
    variant: 'B'
  },

  // Question 19 - Half-life activity with IMAGE
  {
    questionText: "What is the approximate activity of a barium-137 sample after 3 half-lives?",
    image: `${ASSET_PATH}q19_setup_v1.png`,
    options: [
      { id: 'a', text: '260 counts/min', feedback: 'Correct! After 3 half-lives: N = N₀ × (1/2)³ = N₀/8. If initial activity ≈ 2080, final ≈ 260 counts/min.' },
      { id: 'b', text: '520 counts/min', feedback: 'Incorrect. This would be after 2 half-lives.' },
      { id: 'c', text: '1900 counts/min', feedback: 'Incorrect. This is too close to the initial activity.' },
      { id: 'd', text: '2080 counts/min', feedback: 'Incorrect. This appears to be the initial activity.' }
    ],
    correctOptionId: 'a',
    explanation: 'After 3 half-lives, the activity decreases by a factor of 2³ = 8. Starting from approximately 2080 counts/min, the final activity is about 260 counts/min.',
    difficulty: 'intermediate',
    tags: ['half-life', 'radioactive-decay', 'activity-calculation'],
    variant: 'A'
  },
  {
    questionText: "What is the approximate activity of a barium-137 sample after 3 half-lives?",
    image: `${ASSET_PATH}q19_setup_v2.png`,
    options: [
      { id: 'a', text: '260 counts/min', feedback: 'Correct! After 3 half-lives: N = N₀ × (1/2)³ = N₀/8. If initial activity ≈ 2080, final ≈ 260 counts/min.' },
      { id: 'b', text: '520 counts/min', feedback: 'Incorrect. This would be after 2 half-lives.' },
      { id: 'c', text: '1900 counts/min', feedback: 'Incorrect. This is too close to the initial activity.' },
      { id: 'd', text: '2080 counts/min', feedback: 'Incorrect. This appears to be the initial activity.' }
    ],
    correctOptionId: 'a',
    explanation: 'After 3 half-lives, the activity decreases by a factor of 2³ = 8. Starting from approximately 2080 counts/min, the final activity is about 260 counts/min.',
    difficulty: 'intermediate',
    tags: ['half-life', 'radioactive-decay', 'activity-calculation'],
    variant: 'B'
  },

  // Question 20 - Electron-positron annihilation
  {
    questionText: "When an electron and a positron collide, they annihilate and all of their mass is converted into energy. What is the energy released?",
    options: [
      { id: 'a', text: '1.64 × 10⁻¹³ J', feedback: 'Correct! E = 2mc² = 2(9.11×10⁻³¹ kg)(3×10⁸ m/s)² = 1.64×10⁻¹³ J.' },
      { id: 'b', text: '8.20 × 10⁻¹⁴ J', feedback: 'Incorrect. This is the energy from one particle only.' },
      { id: 'c', text: '5.47 × 10⁻²² J', feedback: 'Incorrect. Check your calculation of mass-energy conversion.' },
      { id: 'd', text: '2.73 × 10⁻²² J', feedback: 'Incorrect. Review the formula E = mc².' }
    ],
    correctOptionId: 'a',
    explanation: 'Electron-positron annihilation converts the mass of both particles to energy: E = 2mc² = 2(9.11×10⁻³¹)(3×10⁸)² = 1.64×10⁻¹³ J.',
    difficulty: 'intermediate',
    tags: ['annihilation', 'mass-energy-equivalence', 'antimatter'],
    variant: 'A'
  },
  {
    questionText: "When an electron and a positron collide, they annihilate and all of their mass is converted into energy. What is the energy released?",
    options: [
      { id: 'a', text: '1.64 × 10⁻¹³ J', feedback: 'Correct! E = 2mc² = 2(9.11×10⁻³¹ kg)(3×10⁸ m/s)² = 1.64×10⁻¹³ J.' },
      { id: 'b', text: '8.20 × 10⁻¹⁴ J', feedback: 'Incorrect. This is the energy from one particle only.' },
      { id: 'c', text: '5.47 × 10⁻²² J', feedback: 'Incorrect. Check your calculation of mass-energy conversion.' },
      { id: 'd', text: '2.73 × 10⁻²² J', feedback: 'Incorrect. Review the formula E = mc².' }
    ],
    correctOptionId: 'a',
    explanation: 'Electron-positron annihilation converts the mass of both particles to energy: E = 2mc² = 2(9.11×10⁻³¹)(3×10⁸)² = 1.64×10⁻¹³ J.',
    difficulty: 'intermediate',
    tags: ['annihilation', 'mass-energy-equivalence', 'antimatter'],
    variant: 'B'
  },

  // Question 21 - Quark composition
  {
    questionText: "Which row correctly matches quark compositions to a neutron and a proton?",
    options: [
      { id: 'a', text: 'Neutron: udd, Proton: uud', feedback: 'Correct! Neutron has one up quark and two down quarks, proton has two up quarks and one down quark.' },
      { id: 'b', text: 'Neutron: uud, Proton: udd', feedback: 'Incorrect. You have the compositions reversed.' },
      { id: 'c', text: 'Neutron: udd, Proton: udd', feedback: 'Incorrect. Both particles cannot have the same quark composition.' },
      { id: 'd', text: 'Neutron: uud, Proton: uud', feedback: 'Incorrect. Both particles cannot have the same quark composition.' }
    ],
    correctOptionId: 'a',
    explanation: 'Protons have charge +1 (uud: +2/3 + (-1/3) + (-1/3) = +1). Neutrons have charge 0 (udd: +2/3 + (-1/3) + (-1/3) = 0).',
    difficulty: 'intermediate',
    tags: ['quarks', 'proton-structure', 'neutron-structure'],
    variant: 'A'
  },
  {
    questionText: "Which row correctly matches quark compositions to a neutron and a proton?",
    options: [
      { id: 'a', text: 'Neutron: udd, Proton: uud', feedback: 'Correct! Neutron has one up quark and two down quarks, proton has two up quarks and one down quark.' },
      { id: 'b', text: 'Neutron: uud, Proton: udd', feedback: 'Incorrect. You have the compositions reversed.' },
      { id: 'c', text: 'Neutron: udd, Proton: udd', feedback: 'Incorrect. Both particles cannot have the same quark composition.' },
      { id: 'd', text: 'Neutron: uud, Proton: uud', feedback: 'Incorrect. Both particles cannot have the same quark composition.' }
    ],
    correctOptionId: 'a',
    explanation: 'Protons have charge +1 (uud: +2/3 + (-1/3) + (-1/3) = +1). Neutrons have charge 0 (udd: +2/3 + (-1/3) + (-1/3) = 0).',
    difficulty: 'intermediate',
    tags: ['quarks', 'proton-structure', 'neutron-structure'],
    variant: 'B'
  },

  // Question 22 - Scientific notation
  {
    questionText: "The energy equivalence of one alpha particle is 6.00 × 10⁻¹³ J. Expressed in scientific notation (a.bc × 10⁻ᵈ), identify the values of a, b, c, and d:",
    options: [
      { id: 'a', text: 'a = 6, b = 0, c = 0, d = 13', feedback: 'Correct! In 6.00 × 10⁻¹³, we have a=6, b=0, c=0, and d=13.' },
      { id: 'b', text: 'a = 6, b = 0, c = 0, d = 12', feedback: 'Incorrect. The exponent is -13, so d = 13, not 12.' },
      { id: 'c', text: 'a = 6, b = 0, c = 0, d = 14', feedback: 'Incorrect. The exponent is -13, so d = 13, not 14.' },
      { id: 'd', text: 'a = 6, b = 0, c = 0, d = 11', feedback: 'Incorrect. The exponent is -13, so d = 13, not 11.' }
    ],
    correctOptionId: 'a',
    explanation: 'In scientific notation a.bc × 10⁻ᵈ, the number 6.00 × 10⁻¹³ has a=6 (first digit), b=0 (first decimal place), c=0 (second decimal place), and d=13 (positive value of the exponent).',
    difficulty: 'beginner',
    tags: ['scientific-notation', 'numerical-response', 'alpha-particle'],
    variant: 'A'
  },
  {
    questionText: "The energy equivalence of one alpha particle is 6.00 × 10⁻¹³ J. Expressed in scientific notation (a.bc × 10⁻ᵈ), identify the values of a, b, c, and d:",
    options: [
      { id: 'a', text: 'a = 6, b = 0, c = 0, d = 13', feedback: 'Correct! In 6.00 × 10⁻¹³, we have a=6, b=0, c=0, and d=13.' },
      { id: 'b', text: 'a = 6, b = 0, c = 0, d = 12', feedback: 'Incorrect. The exponent is -13, so d = 13, not 12.' },
      { id: 'c', text: 'a = 6, b = 0, c = 0, d = 14', feedback: 'Incorrect. The exponent is -13, so d = 13, not 14.' },
      { id: 'd', text: 'a = 6, b = 0, c = 0, d = 11', feedback: 'Incorrect. The exponent is -13, so d = 13, not 11.' }
    ],
    correctOptionId: 'a',
    explanation: 'In scientific notation a.bc × 10⁻ᵈ, the number 6.00 × 10⁻¹³ has a=6 (first digit), b=0 (first decimal place), c=0 (second decimal place), and d=13 (positive value of the exponent).',
    difficulty: 'beginner',
    tags: ['scientific-notation', 'numerical-response', 'alpha-particle'],
    variant: 'B'
  },

  // Question 23 - Daughter nuclei matching
  {
    questionText: "Match the daughter nuclei to decay chain numbers: 3: 212Bi, 2: 208Pb, 1: 212Po, 4: 208Tl",
    image: `${ASSET_PATH}q23_setup_v1.png`,
    options: [
      { id: 'a', text: '3: ²¹²Bi, 2: ²⁰⁸Pb, 1: ²¹²Po, 4: ²⁰⁸Tl', feedback: 'Correct! This matches the given decay chain sequence correctly.' },
      { id: 'b', text: '1: ²¹²Bi, 2: ²⁰⁸Pb, 3: ²¹²Po, 4: ²⁰⁸Tl', feedback: 'Incorrect. Check the numbering sequence in the decay chain.' },
      { id: 'c', text: '3: ²¹²Po, 2: ²⁰⁸Tl, 1: ²¹²Bi, 4: ²⁰⁸Pb', feedback: 'Incorrect. The decay products are in the wrong positions.' },
      { id: 'd', text: '2: ²¹²Bi, 3: ²⁰⁸Pb, 4: ²¹²Po, 1: ²⁰⁸Tl', feedback: 'Incorrect. Review the decay chain sequence carefully.' }
    ],
    correctOptionId: 'a',
    explanation: 'In the decay chain, the daughter nuclei are matched correctly to their positions: 3: ²¹²Bi, 2: ²⁰⁸Pb, 1: ²¹²Po, 4: ²⁰⁸Tl.',
    difficulty: 'intermediate',
    tags: ['decay-chain', 'daughter-nuclei', 'nuclear-decay'],
    variant: 'A'
  },
  {
    questionText: "Match the daughter nuclei to decay chain numbers: 3: 212Bi, 2: 208Pb, 1: 212Po, 4: 208Tl",
    options: [
      { id: 'a', text: '3: ²¹²Bi, 2: ²⁰⁸Pb, 1: ²¹²Po, 4: ²⁰⁸Tl', feedback: 'Correct! This matches the given decay chain sequence correctly.' },
      { id: 'b', text: '1: ²¹²Bi, 2: ²⁰⁸Pb, 3: ²¹²Po, 4: ²⁰⁸Tl', feedback: 'Incorrect. Check the numbering sequence in the decay chain.' },
      { id: 'c', text: '3: ²¹²Po, 2: ²⁰⁸Tl, 1: ²¹²Bi, 4: ²⁰⁸Pb', feedback: 'Incorrect. The decay products are in the wrong positions.' },
      { id: 'd', text: '2: ²¹²Bi, 3: ²⁰⁸Pb, 4: ²¹²Po, 1: ²⁰⁸Tl', feedback: 'Incorrect. Review the decay chain sequence carefully.' }
    ],
    correctOptionId: 'a',
    explanation: 'In the decay chain, the daughter nuclei are matched correctly to their positions: 3: ²¹²Bi, 2: ²⁰⁸Pb, 1: ²¹²Po, 4: ²⁰⁸Tl.',
    difficulty: 'intermediate',
    tags: ['decay-chain', 'daughter-nuclei', 'nuclear-decay'],
    variant: 'B'
  }
];

// Written Response Question 1 (5 points) - Compton Scattering - EXAM VERSION (Variant A only)
const writtenResponse1Config = {
  type: 'long-answer',
  requiresManualGrading: true,
  questions: [
    {
      // Version A only for exam consistency
      questionText: `**WR1A:** Use the following information to answer this analytic question:

An X-ray photon has a wavelength of 2.000 × 10⁻¹⁰ m. It collides with a stationary electron. The scattered photon has a wavelength of 2.049 × 10⁻¹⁰ m and travels in the opposite direction.

**Question:**
Verify that this collision is elastic.

**Marking Criteria:**
Marks will be awarded based on the relationships among the two physics principles* that you state, the formulas that you state, the substitutions that you show, and your final answer.
*The physics principles are given on the data sheet.`,
      image: `${ASSET_PATH}q24_setup_v1.png`,
      rubric: [
        { criterion: "Physics Principles", points: 1, description: "States two relevant physics principles (conservation of momentum and energy)" },
        { criterion: "Formula Application", points: 2, description: "Correctly applies Compton scattering and energy conservation formulas" },
        { criterion: "Calculation", points: 1, description: "Shows proper substitutions and calculation steps" },
        { criterion: "Final Answer", points: 1, description: "Correctly verifies that the collision is elastic" }
      ],
      maxPoints: 5,
      wordLimit: { min: 75, max: 400 },
      sampleAnswer: `**Physics Principles:**
1. Conservation of momentum
2. Conservation of energy

**Compton Scattering Formula:**
Δλ = (h/m_e c)(1 - cos θ)

For 180° scattering: Δλ = 2h/(m_e c) = 4.85 × 10⁻¹² m

**Verification:**
Calculated Δλ = 2.049 × 10⁻¹⁰ - 2.000 × 10⁻¹⁰ = 4.9 × 10⁻¹² m

The calculated and theoretical values match within experimental uncertainty, confirming the collision is elastic.`,
      difficulty: "advanced",
      topic: "Compton Scattering and Conservation Laws",
      tags: ["compton-scattering", "conservation-laws", "elastic-collision"],
      variant: 'A'
    }
  ],
  activityType: "exam",
  maxAttempts: 2,
  showRubric: false,
  showWordCount: true,
  theme: "red",
  randomizeQuestions: false
};

// Written Response Question 2 (4 points) - Photoelectric Effect
const writtenResponse2Config = {
  type: 'long-answer',
  requiresManualGrading: true,
  questions: [
    {
      // Version A
      questionText: `**WR2A:** Use the following information to answer this analytic question:

Light of wavelength 5.30 × 10⁻⁷ m is incident on a photoelectric surface with a work function of 1.70 eV.

**Question:**
Determine the maximum kinetic energy of the emitted photoelectrons and calculate their speed.

**Marking Criteria:**
Marks will be awarded based on the relationships among the two physics principles* that you state, the formulas that you state, the substitutions that you show, and your final answer.
*The physics principles are given on the data sheet.`,
      rubric: [
        { criterion: "Physics Principles", points: 1, description: "States Einstein's photoelectric equation and energy conservation" },
        { criterion: "Kinetic Energy Calculation", points: 1.5, description: "Correctly calculates maximum kinetic energy using KE = hf - W" },
        { criterion: "Speed Calculation", points: 1, description: "Correctly calculates photoelectron speed using KE = ½mv²" },
        { criterion: "Final Answer", points: 0.5, description: "Provides clear final answers with proper units" }
      ],
      maxPoints: 4,
      wordLimit: { min: 50, max: 300 },
      sampleAnswer: `**Physics Principles:**
1. Einstein's photoelectric equation: KE_max = hf - W
2. Kinetic energy: KE = ½mv²

**Calculations:**
Photon energy: E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(5.30×10⁻⁷) = 3.75×10⁻¹⁹ J
Work function: W = 1.70 eV = 2.72×10⁻¹⁹ J

**Maximum Kinetic Energy:**
KE_max = 3.75×10⁻¹⁹ - 2.72×10⁻¹⁹ = 1.03×10⁻¹⁹ J

**Speed:**
v = √(2KE/m) = √(2×1.03×10⁻¹⁹/9.11×10⁻³¹) = 4.76×10⁵ m/s`,
      difficulty: "intermediate",
      topic: "Photoelectric Effect",
      tags: ["photoelectric-effect", "einstein-equation", "electron-speed"],
      variant: 'A'
    }
  ],
  activityType: "exam",
  maxAttempts: 2,
  showRubric: false,
  showWordCount: true,
  theme: "red",
  randomizeQuestions: false
};

// Assessment configurations for the master function
const assessmentConfigs = {
  // Multiple Choice Questions (1-23)
  'course2_76_section3_exam_q1': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('thomson')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q2': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('velocity-selector')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q3': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('millikan')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q4': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('photon-emission')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q5': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('photoelectric-effect') && q.tags && q.tags.includes('einstein-equation')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q6': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('charge-to-mass')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q7': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('einstein') && q.tags && q.tags.includes('photon-theory')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q8': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('frequency-dependence')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q9': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('x-ray-production')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q10': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('diffraction-grating')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q11': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('compton-scattering') && q.tags && q.tags.includes('particle-nature')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q12': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('de-broglie')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q13': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('cathode-rays')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q14': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('momentum-conservation') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q15': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('continuous-spectrum')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q16': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('hydrogen-energy-levels') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q17': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('nuclear-fusion') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q18': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('uuq-decay-chain') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q19': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('half-life') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q20': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('annihilation')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q21': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('quarks')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q22': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('scientific-notation') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_76_section3_exam_q23': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('daughter-nuclei') && q.variant === 'A'),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },

  // Written Response Questions (24-25)
  'course2_76_section3_exam_q24': writtenResponse1Config, // 5 points - Compton Scattering
  'course2_76_section3_exam_q25': writtenResponse2Config  // 4 points - Photoelectric Effect
};

exports.assessmentConfigs = assessmentConfigs;