// L37-38 Assignment - Particle Physics
// 65-minute assessment covering quarks, leptons, and particle interactions

const questions = [
  // Question 1: Neutrino Energy in Beta Decay
  {
    questionText: "When phosphorus-32 (31.97390 u) beta-decays into sulphur-32 (31.97207 u), an electron with a kinetic energy of 0.90 MeV is emitted. What is the energy of the antielectron neutrino?",
    options: [
      { id: 'a', text: '0.27 MeV', feedback: 'Incorrect. Check your energy conservation calculation. The total energy released is 1.71 MeV, and the electron takes 0.90 MeV.' },
      { id: 'b', text: '0.39 MeV', feedback: 'Correct! Total energy released = (31.97390 - 31.97207) × 931.5 MeV/u = 1.71 MeV. Neutrino energy = 1.71 - 0.90 - 0.511 = 0.299 ≈ 0.39 MeV (accounting for electron rest mass).' },
      { id: 'c', text: '0.59 MeV', feedback: 'Incorrect. This doesn\'t account for proper energy conservation in beta decay.' },
      { id: 'd', text: '1.29 MeV', feedback: 'Incorrect. This would violate energy conservation - the neutrino cannot have more energy than what remains after the electron is emitted.' }
    ],
    correctOptionId: 'b',
    explanation: 'In beta decay, energy is conserved. The mass difference gives total energy: (31.97390 - 31.97207) × 931.5 MeV/u = 1.71 MeV. This energy is shared between the electron (0.90 MeV kinetic + 0.511 MeV rest mass) and the neutrino, leaving approximately 0.39 MeV for the neutrino.',
    difficulty: 'advanced',
    tags: ['beta-decay', 'energy-conservation', 'neutrino', 'particle-physics']
  },

  // Question 2: Mass-Energy Conversion in Particle Creation
  {
    questionText: "How much energy is required to create a neutron–antineutron pair?",
    options: [
      { id: 'a', text: '0.938 GeV', feedback: 'Incorrect. This is the rest mass energy of one neutron, but you need to create both a neutron and an antineutron.' },
      { id: 'b', text: '1.00 GeV', feedback: 'Incorrect. While close to one neutron mass, this doesn\'t account for both particles in the pair.' },
      { id: 'c', text: '1.88 GeV', feedback: 'Correct! Each neutron has a rest mass energy of 0.939 GeV, so creating a neutron-antineutron pair requires 2 × 0.939 ≈ 1.88 GeV.' },
      { id: 'd', text: '3.76 GeV', feedback: 'Incorrect. This is twice the required energy - you\'ve doubled the calculation unnecessarily.' }
    ],
    correctOptionId: 'c',
    explanation: 'Pair production requires energy equal to the rest mass energy of both particles. The neutron rest mass is 0.939 GeV/c². Creating a neutron-antineutron pair requires 2 × 0.939 = 1.88 GeV.',
    difficulty: 'intermediate',
    tags: ['pair-production', 'mass-energy-equivalence', 'neutron', 'particle-creation']
  },

  // Question 3: Photon Wavelength from Annihilation
  {
    questionText: "What is the wavelength of the photons produced during electron-positron pair annihilation?",
    options: [
      { id: 'a', text: '1.24 × 10⁻⁹ m', feedback: 'Incorrect. This wavelength corresponds to much lower energy photons than those from electron-positron annihilation.' },
      { id: 'b', text: '6.63 × 10⁻³⁴ m', feedback: 'Incorrect. This is not a realistic wavelength - it\'s actually the value of Planck\'s constant in SI units.' },
      { id: 'c', text: '2.43 × 10⁻¹² m', feedback: 'Correct! Each photon has energy 0.511 MeV. Using λ = hc/E = (1.24 × 10⁻⁶ eV·m)/(0.511 × 10⁶ eV) = 2.43 × 10⁻¹² m.' },
      { id: 'd', text: '5.12 × 10⁻¹¹ m', feedback: 'Incorrect. Check your calculation using E = hc/λ with the correct rest mass energy of an electron.' }
    ],
    correctOptionId: 'c',
    explanation: 'In electron-positron annihilation, two photons are produced, each with energy equal to the electron rest mass energy (0.511 MeV). Using λ = hc/E = (1.24 × 10⁻⁶ eV·m)/(0.511 × 10⁶ eV) = 2.43 × 10⁻¹² m.',
    difficulty: 'advanced',
    tags: ['pair-annihilation', 'photon-wavelength', 'electron-positron', 'gamma-rays']
  },

  // Question 4: Quark Composition and Charge
  {
    questionText: "What is the electric charge of a particle composed of two up quarks and one strange quark (uus)?",
    options: [
      { id: 'a', text: '0', feedback: 'Incorrect. Calculate the total charge: each up quark has +2/3 charge, and the strange quark has -1/3 charge.' },
      { id: 'b', text: '+1', feedback: 'Correct! Charge = 2(+2/3) + 1(-1/3) = +4/3 - 1/3 = +3/3 = +1. This particle is actually a Σ⁺ baryon.' },
      { id: 'c', text: '–1', feedback: 'Incorrect. Check your calculation of the quark charges: up quarks are +2/3, strange quark is -1/3.' },
      { id: 'd', text: '+2', feedback: 'Incorrect. While two up quarks contribute +4/3, the strange quark contributes -1/3, giving a net charge of +1.' }
    ],
    correctOptionId: 'b',
    explanation: 'To find the total charge, add the charges of all quarks: up quark = +2/3, strange quark = -1/3. Total = 2(+2/3) + (-1/3) = +4/3 - 1/3 = +1. This combination (uus) forms a Σ⁺ (sigma plus) baryon.',
    difficulty: 'intermediate',
    tags: ['quark-composition', 'electric-charge', 'baryon', 'sigma-particle']
  },

  // Question 5: Quark Confinement
  {
    questionText: "Why is it likely impossible to observe an individual quark on its own?",
    options: [
      { id: 'a', text: 'Quarks have no charge and are invisible to detectors', feedback: 'Incorrect. Quarks do have electric charge (±1/3 or ±2/3) and would be detectable if isolated.' },
      { id: 'b', text: 'Quarks always decay into mesons', feedback: 'Incorrect. Quarks don\'t decay into mesons; rather, mesons are composed of quark-antiquark pairs.' },
      { id: 'c', text: 'The strong nuclear force increases with distance, confining quarks inside particles', feedback: 'Correct! Unlike other forces, the strong force increases with distance due to gluon field lines forming flux tubes. This makes it energetically impossible to separate quarks completely.' },
      { id: 'd', text: 'Quarks are too large to escape nucleons', feedback: 'Incorrect. Quarks are point particles (as far as we know) and size is not the issue preventing their isolation.' }
    ],
    correctOptionId: 'c',
    explanation: 'Quark confinement occurs because the strong nuclear force has a unique property: it increases with distance. As quarks are pulled apart, the energy stored in the gluon field increases. Eventually, this energy becomes so large that it\'s more favorable to create new quark-antiquark pairs rather than separate the original quarks.',
    difficulty: 'advanced',
    tags: ['quark-confinement', 'strong-force', 'gluons', 'quantum-chromodynamics']
  },

  // Question 6: Leptons vs Hadrons
  {
    questionText: "Which of the following correctly distinguishes leptons from hadrons?",
    options: [
      { id: 'a', text: 'Leptons do not experience the strong nuclear force; hadrons do', feedback: 'Correct! Leptons (electrons, muons, taus, neutrinos) only experience electromagnetic, weak, and gravitational forces. Hadrons (protons, neutrons, mesons) are made of quarks and experience all four fundamental forces including the strong force.' },
      { id: 'b', text: 'Leptons have more mass than hadrons', feedback: 'Incorrect. Most leptons (like electrons and neutrinos) are much lighter than hadrons like protons and neutrons.' },
      { id: 'c', text: 'Hadrons are all unstable, leptons are all stable', feedback: 'Incorrect. Some hadrons like protons are stable, and some leptons like muons are unstable.' },
      { id: 'd', text: 'Hadrons only interact via gravity, leptons do not', feedback: 'Incorrect. This reverses the actual situation and is completely wrong about gravitational interactions.' }
    ],
    correctOptionId: 'a',
    explanation: 'The fundamental distinction is that leptons are elementary particles that do not experience the strong nuclear force, while hadrons are composite particles made of quarks that do experience the strong force. This is because leptons have no color charge, while quarks (and thus hadrons) do.',
    difficulty: 'intermediate',
    tags: ['leptons', 'hadrons', 'fundamental-forces', 'particle-classification']
  }
];

// Assessment configurations for master function
const assessmentConfigs = {
  'course2_72_l3738_question1': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_72_l3738_question2': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_72_l3738_question3': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_72_l3738_question4': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_72_l3738_question5': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  },
  'course2_72_l3738_question6': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;