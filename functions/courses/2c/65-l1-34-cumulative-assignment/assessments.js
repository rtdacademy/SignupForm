const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Question pools for L1-34 Cumulative Assignment - Mixed Units and Nature of the Atom
const questionPools = {
  // Group 1: Mixed Units (Questions 1-10) - Momentum, Optics, and Electromagnetism
  group1: [
    {
      questionText: "Two people apply a net force of 840 N to push a stalled car for 5.0 s. What is the final momentum gained by the car?",
      options: [
        { id: 'a', text: '4.2 × 10³ kg·m/s', feedback: 'Correct! Using impulse-momentum theorem: Δp = FΔt = (840 N)(5.0 s) = 4200 kg·m/s = 4.2 × 10³ kg·m/s.' },
        { id: 'b', text: '1.7 × 10³ kg·m/s', feedback: 'Incorrect. Check your calculation using Δp = FΔt.' },
        { id: 'c', text: '6.7 × 10³ kg·m/s', feedback: 'Incorrect. You may have made an error in the multiplication.' },
        { id: 'd', text: '8.4 × 10³ kg·m/s', feedback: 'Incorrect. This would be if you doubled the correct answer.' }
      ],
      correctOptionId: 'a',
      explanation: 'The impulse-momentum theorem states that impulse equals change in momentum: Δp = FΔt = (840 N)(5.0 s) = 4200 kg·m/s = 4.2 × 10³ kg·m/s.',
      difficulty: 'intermediate',
      tags: ['momentum', 'impulse', 'force-time']
    },
    {
      questionText: "A 0.75 kg object is acted on by a force-time graph for 4.0 seconds. What is the final velocity if the impulse equals 12 N·s?",
      options: [
        { id: 'a', text: '9.0 m/s', feedback: 'Incorrect. Check your calculation using Δp = mΔv.' },
        { id: 'b', text: '12 m/s', feedback: 'Incorrect. This is the impulse value, not the velocity.' },
        { id: 'c', text: '16 m/s', feedback: 'Correct! Using Δp = mΔv: 12 N·s = (0.75 kg)(Δv), so Δv = 12/0.75 = 16 m/s.' },
        { id: 'd', text: '18 m/s', feedback: 'Incorrect. Double-check your division calculation.' }
      ],
      correctOptionId: 'c',
      explanation: 'Impulse equals change in momentum: Δp = mΔv. Given impulse = 12 N·s and m = 0.75 kg: 12 = 0.75 × Δv, so Δv = 12/0.75 = 16 m/s.',
      difficulty: 'intermediate',
      tags: ['impulse', 'momentum', 'velocity']
    },
    {
      questionText: "What is the index of refraction of a liquid in which the speed of light is 1.85 × 10⁸ m/s?",
      options: [
        { id: 'a', text: '1.29', feedback: 'Incorrect. Check your calculation using n = c/v.' },
        { id: 'b', text: '1.45', feedback: 'Incorrect. Verify your division calculation.' },
        { id: 'c', text: '1.52', feedback: 'Incorrect. Double-check the speed of light value used.' },
        { id: 'd', text: '1.62', feedback: 'Correct! n = c/v = (3.00×10⁸)/(1.85×10⁸) = 1.62.' }
      ],
      correctOptionId: 'd',
      explanation: 'The index of refraction is n = c/v where c is the speed of light in vacuum (3.00×10⁸ m/s) and v is the speed in the medium: n = (3.00×10⁸)/(1.85×10⁸) = 1.62.',
      difficulty: 'intermediate',
      tags: ['refraction', 'index-of-refraction', 'optics']
    },
    {
      questionText: "Which experiment provided definitive evidence that light behaves as a wave?",
      options: [
        { id: 'a', text: "Michelson's speed of light experiment", feedback: 'Incorrect. This measured the speed of light but did not demonstrate wave behavior.' },
        { id: 'b', text: "Rutherford's gold foil experiment", feedback: 'Incorrect. This experiment studied atomic structure, not light wave properties.' },
        { id: 'c', text: "Young's double-slit experiment", feedback: 'Correct! Young\'s double-slit experiment demonstrated interference patterns, providing definitive evidence for the wave nature of light.' },
        { id: 'd', text: "Millikan's oil drop experiment", feedback: 'Incorrect. This experiment measured the charge of an electron.' }
      ],
      correctOptionId: 'c',
      explanation: 'Young\'s double-slit experiment demonstrated interference patterns when light passed through two slits, providing definitive evidence that light behaves as a wave.',
      difficulty: 'beginner',
      tags: ['wave-optics', 'interference', 'young-experiment']
    },
    {
      questionText: "Red light (λ = 644 nm) shines through a double slit with a separation of 1.0 mm. If the bright bands are spaced 0.54 mm apart, how far is the screen from the slits?",
      options: [
        { id: 'a', text: '0.45 m', feedback: 'Incorrect. Check your calculation using the double-slit formula.' },
        { id: 'b', text: '0.54 m', feedback: 'Incorrect. This is the fringe spacing, not the screen distance.' },
        { id: 'c', text: '0.64 m', feedback: 'Incorrect. Verify your calculation with the correct formula.' },
        { id: 'd', text: '0.84 m', feedback: 'Correct! Using y = λL/d: L = yd/λ = (0.54×10⁻³)(1.0×10⁻³)/(644×10⁻⁹) = 0.84 m.' }
      ],
      correctOptionId: 'd',
      explanation: 'For double-slit interference: y = λL/d. Solving for L: L = yd/λ = (0.54×10⁻³ m)(1.0×10⁻³ m)/(644×10⁻⁹ m) = 0.84 m.',
      difficulty: 'advanced',
      tags: ['double-slit', 'interference', 'wavelength-calculation']
    },
    {
      questionText: "A 30 cm tall object is placed 16 cm in front of a converging mirror with a focal length of 12 cm. What is the height of the image?",
      options: [
        { id: 'a', text: '-60 cm', feedback: 'Incorrect. Check your calculation of the image distance first.' },
        { id: 'b', text: '-75 cm', feedback: 'Incorrect. Verify your use of the mirror equation and magnification formula.' },
        { id: 'c', text: '-90 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di gives di = 48 cm. Magnification = -di/do = -48/16 = -3. Height = (-3)(30) = -90 cm.' },
        { id: 'd', text: '-96 cm', feedback: 'Incorrect. Double-check your image distance calculation.' }
      ],
      correctOptionId: 'c',
      explanation: 'Using the mirror equation: 1/f = 1/do + 1/di → 1/12 = 1/16 + 1/di → di = 48 cm. Magnification = -di/do = -48/16 = -3. Image height = M × object height = (-3)(30 cm) = -90 cm.',
      difficulty: 'advanced',
      tags: ['mirrors', 'magnification', 'optics']
    },
    {
      questionText: "What is Coulomb's Law?",
      options: [
        { id: 'a', text: 'F = qE', feedback: 'Incorrect. This is the force on a charge in an electric field, not Coulomb\'s Law.' },
        { id: 'b', text: 'F = ma', feedback: 'Incorrect. This is Newton\'s second law, not Coulomb\'s Law.' },
        { id: 'c', text: 'F = k(q₁q₂)/r²', feedback: 'Correct! Coulomb\'s Law states that the force between two point charges is F = k(q₁q₂)/r².' },
        { id: 'd', text: 'F = BIL', feedback: 'Incorrect. This is the force on a current-carrying conductor in a magnetic field.' }
      ],
      correctOptionId: 'c',
      explanation: 'Coulomb\'s Law describes the electrostatic force between two point charges: F = k(q₁q₂)/r², where k is Coulomb\'s constant, q₁ and q₂ are the charges, and r is the distance between them.',
      difficulty: 'beginner',
      tags: ['coulomb-law', 'electrostatics', 'force']
    },
    {
      questionText: "Which of the following defines electrical current and its SI unit?",
      options: [
        { id: 'a', text: 'The rate of charge flow; measured in volts', feedback: 'Incorrect. Current is measured in amperes, not volts.' },
        { id: 'b', text: 'The amount of energy per unit charge; measured in ohms', feedback: 'Incorrect. This describes voltage, and ohms measure resistance.' },
        { id: 'c', text: 'The rate of charge flow; measured in amperes', feedback: 'Correct! Electric current is the rate of charge flow, measured in amperes (A).' },
        { id: 'd', text: 'The amount of charge per coulomb; measured in newtons', feedback: 'Incorrect. This definition doesn\'t make physical sense.' }
      ],
      correctOptionId: 'c',
      explanation: 'Electric current is defined as the rate of charge flow (I = Q/t), and its SI unit is the ampere (A), where 1 ampere = 1 coulomb per second.',
      difficulty: 'beginner',
      tags: ['electric-current', 'amperes', 'charge-flow']
    },
    {
      questionText: "What does Faraday's Law state about electromagnetic induction?",
      options: [
        { id: 'a', text: 'The induced current is proportional to the wire\'s resistance.', feedback: 'Incorrect. This relates to Ohm\'s law, not Faraday\'s law.' },
        { id: 'b', text: 'A change in electric field induces a magnetic field.', feedback: 'Incorrect. This is part of Maxwell\'s equations but not Faraday\'s law specifically.' },
        { id: 'c', text: 'The induced voltage is proportional to the rate of change of magnetic flux.', feedback: 'Correct! Faraday\'s law states that ε = -dΦ/dt, where the induced EMF is proportional to the rate of change of magnetic flux.' },
        { id: 'd', text: 'Magnetic poles always appear in pairs.', feedback: 'Incorrect. This describes the non-existence of magnetic monopoles.' }
      ],
      correctOptionId: 'c',
      explanation: 'Faraday\'s law of electromagnetic induction states that the induced electromotive force (EMF) is equal to the negative rate of change of magnetic flux: ε = -dΦ/dt.',
      difficulty: 'intermediate',
      tags: ['faraday-law', 'electromagnetic-induction', 'magnetic-flux']
    },
    {
      questionText: "An electron travels west at 3.52 × 10⁵ m/s through a magnetic field of 0.280 T directed out of the page. What is the magnetic force acting on the electron?",
      options: [
        { id: 'a', text: '2.71 × 10⁻¹⁴ N north', feedback: 'Incorrect. Check your calculation and direction using F = qvB and the right-hand rule.' },
        { id: 'b', text: '1.58 × 10⁻¹⁴ N south', feedback: 'Correct! F = |q|vB = (1.6×10⁻¹⁹)(3.52×10⁵)(0.280) = 1.58×10⁻¹⁴ N. Using right-hand rule for negative charge: south.' },
        { id: 'c', text: '9.87 × 10⁻¹³ N south', feedback: 'Incorrect. This force magnitude is too large.' },
        { id: 'd', text: '3.52 × 10⁻¹⁴ N north', feedback: 'Incorrect. Check your calculation of the force magnitude.' }
      ],
      correctOptionId: 'b',
      explanation: 'F = |q|vB = (1.6×10⁻¹⁹ C)(3.52×10⁵ m/s)(0.280 T) = 1.58×10⁻¹⁴ N. Using the right-hand rule for a negative charge moving west in a field out of the page gives a force directed south.',
      difficulty: 'advanced',
      tags: ['magnetic-force', 'lorentz-force', 'right-hand-rule']
    }
  ],

  // Group 2: Nature of the Atom (Questions 11-20) - Atomic Theory and Quantum Physics
  group2: [
    {
      questionText: "What was J.J. Thomson's major contribution to atomic theory?",
      options: [
        { id: 'a', text: 'Discovery of the neutron', feedback: 'Incorrect. The neutron was discovered by James Chadwick.' },
        { id: 'b', text: 'Discovery of the atomic nucleus', feedback: 'Incorrect. The nucleus was discovered by Ernest Rutherford.' },
        { id: 'c', text: 'Measurement of the mass of the proton', feedback: 'Incorrect. This was not Thomson\'s primary contribution.' },
        { id: 'd', text: 'Discovery of the electron and the charge-to-mass ratio', feedback: 'Correct! Thomson discovered the electron through cathode ray experiments and measured its charge-to-mass ratio.' }
      ],
      correctOptionId: 'd',
      explanation: 'J.J. Thomson\'s cathode ray tube experiments led to the discovery of the electron and the measurement of its charge-to-mass ratio, proving that atoms contain negatively charged subatomic particles.',
      difficulty: 'beginner',
      tags: ['thomson', 'electron-discovery', 'atomic-history']
    },
    {
      questionText: "Light of wavelength 5.30 × 10⁻⁷ m strikes a photoelectric surface with a work function of 1.70 eV. What is the maximum energy of the emitted electrons?",
      options: [
        { id: 'a', text: '1.03 × 10⁻¹⁹ J', feedback: 'Correct! Photon energy = hc/λ = 3.75×10⁻¹⁹ J = 2.34 eV. KEmax = E - φ = 2.34 - 1.70 = 0.64 eV = 1.03×10⁻¹⁹ J.' },
        { id: 'b', text: '3.40 × 10⁻¹⁹ J', feedback: 'Incorrect. This would be if you didn\'t subtract the work function.' },
        { id: 'c', text: '1.70 × 10⁻¹⁹ J', feedback: 'Incorrect. This is the work function value, not the kinetic energy.' },
        { id: 'd', text: '2.53 × 10⁻¹⁹ J', feedback: 'Incorrect. Check your calculation of photon energy and work function subtraction.' }
      ],
      correctOptionId: 'a',
      explanation: 'Photon energy: E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(5.30×10⁻⁷) = 3.75×10⁻¹⁹ J = 2.34 eV. Maximum kinetic energy: KEmax = E - φ = 2.34 - 1.70 = 0.64 eV = 1.03×10⁻¹⁹ J.',
      difficulty: 'advanced',
      tags: ['photoelectric-effect', 'work-function', 'kinetic-energy']
    },
    {
      questionText: "Radiation with frequency 7.52 × 10¹⁴ Hz strikes a photoelectric surface with a work function of 2.20 eV. What stopping voltage is required to halt the current?",
      options: [
        { id: 'a', text: '0.451 V', feedback: 'Incorrect. Check your calculation of photon energy and kinetic energy.' },
        { id: 'b', text: '0.913 V', feedback: 'Correct! E = hf = (6.63×10⁻³⁴)(7.52×10¹⁴) = 4.98×10⁻¹⁹ J = 3.11 eV. KEmax = 3.11 - 2.20 = 0.91 eV. Stopping voltage = 0.91 V.' },
        { id: 'c', text: '1.67 V', feedback: 'Incorrect. You may have made an error in converting energy units.' },
        { id: 'd', text: '2.20 V', feedback: 'Incorrect. This is the work function, not the stopping voltage.' }
      ],
      correctOptionId: 'b',
      explanation: 'Photon energy: E = hf = (6.63×10⁻³⁴)(7.52×10¹⁴) = 4.98×10⁻¹⁹ J = 3.11 eV. Maximum kinetic energy: KEmax = E - φ = 3.11 - 2.20 = 0.91 eV. Stopping voltage equals the maximum kinetic energy in eV: 0.91 V.',
      difficulty: 'advanced',
      tags: ['photoelectric-effect', 'stopping-voltage', 'photon-energy']
    },
    {
      questionText: "What is the momentum of a 6.0 MeV proton?",
      options: [
        { id: 'a', text: '2.01 × 10⁻²⁰ kg·m/s', feedback: 'Incorrect. Check your relativistic momentum calculation.' },
        { id: 'b', text: '3.3 × 10⁻²⁰ kg·m/s', feedback: 'Correct! For a 6.0 MeV proton, using relativistic momentum calculation gives p ≈ 3.3×10⁻²⁰ kg·m/s.' },
        { id: 'c', text: '5.7 × 10⁻²⁰ kg·m/s', feedback: 'Incorrect. This momentum is too high for a 6.0 MeV proton.' },
        { id: 'd', text: '7.2 × 10⁻²⁰ kg·m/s', feedback: 'Incorrect. This value is too large.' }
      ],
      correctOptionId: 'b',
      explanation: 'For a 6.0 MeV proton (rest mass energy = 938 MeV), this is non-relativistic. Using p = √(2mE): p = √(2 × 1.67×10⁻²⁷ kg × 6.0×1.6×10⁻¹³ J) ≈ 3.3×10⁻²⁰ kg·m/s.',
      difficulty: 'advanced',
      tags: ['proton-momentum', 'particle-physics', 'energy-momentum']
    },
    {
      questionText: "A particle moves at 3.60 × 10⁵ m/s and follows a 7.40 cm arc in a 610 mT magnetic field. What is its charge-to-mass ratio?",
      options: [
        { id: 'a', text: '4.05 × 10⁶ C/kg', feedback: 'Incorrect. Check your calculation using the circular motion formula.' },
        { id: 'b', text: '6.19 × 10⁶ C/kg', feedback: 'Incorrect. Verify your use of the radius and magnetic field values.' },
        { id: 'c', text: '7.98 × 10⁶ C/kg', feedback: 'Correct! Using q/m = v/(rB) = (3.60×10⁵)/[(0.074)(0.610)] = 7.98×10⁶ C/kg.' },
        { id: 'd', text: '9.24 × 10⁶ C/kg', feedback: 'Incorrect. Double-check your calculation.' }
      ],
      correctOptionId: 'c',
      explanation: 'For circular motion in a magnetic field: qvB = mv²/r, so q/m = v/(rB) = (3.60×10⁵ m/s)/[(0.074 m)(0.610 T)] = 7.98×10⁶ C/kg.',
      difficulty: 'advanced',
      tags: ['charge-to-mass-ratio', 'circular-motion', 'magnetic-field']
    },
    {
      questionText: "A proton travels in a circle of radius 0.30 m in a 0.75 T magnetic field. What is its momentum?",
      options: [
        { id: 'a', text: '1.13 × 10⁻²⁰ kg·m/s', feedback: 'Incorrect. Check your calculation using p = qrB.' },
        { id: 'b', text: '2.50 × 10⁻²⁰ kg·m/s', feedback: 'Incorrect. Verify your use of the proton charge.' },
        { id: 'c', text: '3.60 × 10⁻²⁰ kg·m/s', feedback: 'Correct! p = qrB = (1.6×10⁻¹⁹)(0.30)(0.75) = 3.60×10⁻²⁰ kg·m/s.' },
        { id: 'd', text: '4.75 × 10⁻²⁰ kg·m/s', feedback: 'Incorrect. This value is too high.' }
      ],
      correctOptionId: 'c',
      explanation: 'For a charged particle in a magnetic field: p = mv = qrB. For a proton: p = (1.6×10⁻¹⁹ C)(0.30 m)(0.75 T) = 3.60×10⁻²⁰ kg·m/s.',
      difficulty: 'intermediate',
      tags: ['proton-momentum', 'magnetic-field', 'circular-motion']
    },
    {
      questionText: "What is Planck's quantum hypothesis?",
      options: [
        { id: 'a', text: 'Energy is emitted in continuous waves', feedback: 'Incorrect. This describes classical wave theory, not Planck\'s quantum hypothesis.' },
        { id: 'b', text: 'Light behaves only as a particle', feedback: 'Incorrect. Planck\'s hypothesis was about energy quantization, not exclusively particle behavior.' },
        { id: 'c', text: 'Matter waves have frequency', feedback: 'Incorrect. This relates to de Broglie\'s matter wave hypothesis.' },
        { id: 'd', text: 'Energy is emitted or absorbed in discrete packets called quanta', feedback: 'Correct! Planck\'s quantum hypothesis states that energy is quantized in discrete packets (quanta) with E = hf.' }
      ],
      correctOptionId: 'd',
      explanation: 'Planck\'s quantum hypothesis proposed that energy is not continuous but comes in discrete packets called quanta, with each quantum having energy E = hf, where h is Planck\'s constant and f is frequency.',
      difficulty: 'beginner',
      tags: ['planck-hypothesis', 'quantum-theory', 'energy-quantization']
    },
    {
      questionText: "A 2.0 W helium-neon laser emits light of wavelength 633 nm. How many photons are emitted per second?",
      options: [
        { id: 'a', text: '2.7 × 10⁸ photons/s', feedback: 'Incorrect. Check your calculation of photon energy and photon rate.' },
        { id: 'b', text: '4.5 × 10⁸ photons/s', feedback: 'Incorrect. Verify your calculation steps.' },
        { id: 'c', text: '6.4 × 10¹⁸ photons/s', feedback: 'Correct! Photon energy = hc/λ = 3.14×10⁻¹⁹ J. Photon rate = Power/Energy = 2.0/(3.14×10⁻¹⁹) = 6.4×10¹⁸ photons/s.' },
        { id: 'd', text: '8.9 × 10⁸ photons/s', feedback: 'Incorrect. This rate is far too low for a 2.0 W laser.' }
      ],
      correctOptionId: 'c',
      explanation: 'Photon energy: E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(633×10⁻⁹) = 3.14×10⁻¹⁹ J. Photon emission rate = Power/Photon energy = 2.0 W / 3.14×10⁻¹⁹ J = 6.4×10¹⁸ photons/s.',
      difficulty: 'advanced',
      tags: ['photon-emission', 'laser-physics', 'quantum-energy']
    },
    {
      questionText: "If an electron is emitted with a kinetic energy of 11.0 eV, what stopping voltage is required to halt it?",
      options: [
        { id: 'a', text: '2.2 V', feedback: 'Incorrect. The stopping voltage should equal the kinetic energy in eV.' },
        { id: 'b', text: '5.5 V', feedback: 'Incorrect. This is half the correct value.' },
        { id: 'c', text: '9.6 V', feedback: 'Incorrect. Check the relationship between kinetic energy and stopping voltage.' },
        { id: 'd', text: '11.0 V', feedback: 'Correct! The stopping voltage equals the kinetic energy in electron volts: 11.0 V.' }
      ],
      correctOptionId: 'd',
      explanation: 'The stopping voltage required to halt an electron equals its kinetic energy expressed in electron volts. Since KE = 11.0 eV, the stopping voltage = 11.0 V.',
      difficulty: 'beginner',
      tags: ['stopping-voltage', 'electron-energy', 'photoelectric-effect']
    },
    {
      questionText: "A spectral line has a wavelength of 523 nm. What is the energy of the electron transition that produces this line?",
      options: [
        { id: 'a', text: '2.12 eV', feedback: 'Incorrect. Check your calculation using E = hc/λ.' },
        { id: 'b', text: '2.38 eV', feedback: 'Correct! E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(523×10⁻⁹) = 3.8×10⁻¹⁹ J = 2.38 eV.' },
        { id: 'c', text: '2.91 eV', feedback: 'Incorrect. Verify your wavelength conversion and calculation.' },
        { id: 'd', text: '3.10 eV', feedback: 'Incorrect. This energy is too high for 523 nm light.' }
      ],
      correctOptionId: 'b',
      explanation: 'The energy of a photon is E = hc/λ = (6.63×10⁻³⁴)(3×10⁸)/(523×10⁻⁹) = 3.8×10⁻¹⁹ J. Converting to eV: E = 3.8×10⁻¹⁹ / 1.6×10⁻¹⁹ = 2.38 eV.',
      difficulty: 'intermediate',
      tags: ['spectral-lines', 'photon-energy', 'wavelength-energy']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (10 questions - Mixed Units)
  ...questionPools.group1,
  
  // Group 2 questions (10 questions - Nature of the Atom) 
  ...questionPools.group2
];

// Export individual handlers for each question (20 total)
const questionHandlers = {};
const assessmentConfigs = {};

for (let i = 1; i <= 20; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_65_l134_question${i}`;
  
  questionHandlers[questionId] = createStandardMultipleChoice({
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1,
    timeLimit: 120 // 120 minutes for 20 questions
  });
  
  assessmentConfigs[questionId] = {
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: 'assignment', 
    maxAttempts: 3,
    pointsValue: 1,
    timeLimit: 120 // 120 minutes for 20 questions
  };
}

// Export all question handlers
module.exports = { ...questionHandlers, assessmentConfigs };
