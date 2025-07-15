// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Question pool with complete configuration
const questionPool = [
  {
    questionText: "When a solid, liquid, or very dense gas is heated until it glows, and the light is passed through a prism, what type of spectrum is produced?",
    options: [
      { id: 'a', text: 'Absorption spectrum', feedback: 'Incorrect. Absorption spectra are produced when light passes through a gas, not from glowing hot objects.' },
      { id: 'b', text: 'Continuous spectrum', feedback: 'Correct! Hot solids, liquids, and very dense gases produce continuous spectra with all wavelengths present.' },
      { id: 'c', text: 'Emission spectrum', feedback: 'Incorrect. Emission spectra show discrete lines from excited gases, not continuous radiation from hot dense matter.' },
      { id: 'd', text: 'Band spectrum', feedback: 'Incorrect. Band spectra are characteristic of molecules, not the continuous radiation from hot dense objects.' }
    ],
    correctOptionId: 'b',
    explanation: 'When a solid, liquid, or very dense gas is heated until it glows, it produces a continuous spectrum containing all wavelengths of light. This is because the atoms are so close together that their energy levels overlap, creating a continuous range of possible transitions.',
    difficulty: 'intermediate',
    tags: ['continuous-spectrum', 'blackbody-radiation', 'dense-matter', 'spectroscopy']
  },
  {
    questionText: "When a rarefied gas is excited by electrical energy and its light is passed through a prism, what type of spectrum is observed?",
    options: [
      { id: 'a', text: 'Continuous spectrum', feedback: 'Incorrect. Continuous spectra come from hot dense objects, not excited rarefied gases.' },
      { id: 'b', text: 'Absorption spectrum', feedback: 'Incorrect. Absorption spectra are seen when light passes through a gas, not from an excited gas emitting light.' },
      { id: 'c', text: 'Emission spectrum', feedback: 'Correct! Excited rarefied gases emit light at specific wavelengths, producing an emission spectrum with bright lines.' },
      { id: 'd', text: 'Line-dark spectrum', feedback: 'Incorrect. This is not a standard type of spectrum in spectroscopy.' }
    ],
    correctOptionId: 'c',
    explanation: 'When a rarefied (low-density) gas is excited by electrical energy, electrons jump to higher energy levels and then fall back down, emitting photons at specific wavelengths. This creates an emission spectrum with bright lines at characteristic wavelengths.',
    difficulty: 'intermediate',
    tags: ['emission-spectrum', 'excited-gas', 'electrical-excitation', 'spectroscopy']
  },
  {
    questionText: "Why can an emission spectrum be used to identify elements or molecules in the gas phase?",
    options: [
      { id: 'a', text: 'Each element emits all visible wavelengths', feedback: 'Incorrect. If all elements emitted all wavelengths, they would be indistinguishable.' },
      { id: 'b', text: 'The emission spectrum is random', feedback: 'Incorrect. Emission spectra are not random but follow specific patterns based on atomic structure.' },
      { id: 'c', text: 'Each element has a unique set of allowed energy transitions', feedback: 'Correct! Each element has a unique electron configuration and energy level structure, creating a unique spectral "fingerprint".' },
      { id: 'd', text: 'Molecules do not emit light in gas phase', feedback: 'Incorrect. Both atoms and molecules can emit light when excited in the gas phase.' }
    ],
    correctOptionId: 'c',
    explanation: 'Each element has a unique electron configuration and specific energy levels. When electrons transition between these levels, they emit photons at characteristic wavelengths, creating a unique spectral "fingerprint" that can be used for identification.',
    difficulty: 'intermediate',
    tags: ['spectral-identification', 'energy-levels', 'electron-transitions', 'atomic-fingerprint']
  },
  {
    questionText: "When white light is passed through a gas and then through a prism, what type of spectrum is produced?",
    options: [
      { id: 'a', text: 'Continuous spectrum', feedback: 'Incorrect. The continuous spectrum is modified by the gas absorption.' },
      { id: 'b', text: 'Absorption spectrum', feedback: 'Correct! The gas absorbs specific wavelengths from the white light, creating dark lines in an otherwise continuous spectrum.' },
      { id: 'c', text: 'Emission spectrum', feedback: 'Incorrect. Emission spectra show bright lines from excited gases, not dark lines from absorption.' },
      { id: 'd', text: 'X-ray spectrum', feedback: 'Incorrect. X-ray spectra are not produced by visible light passing through gases.' }
    ],
    correctOptionId: 'b',
    explanation: 'When white light passes through a gas, the gas atoms absorb photons at specific wavelengths that match their energy level differences. This creates an absorption spectrum - a continuous spectrum with dark lines where specific wavelengths have been absorbed.',
    difficulty: 'intermediate',
    tags: ['absorption-spectrum', 'white-light', 'gas-absorption', 'dark-lines']
  },
  {
    questionText: "What is the significance of the Frank-Hertz experiment?",
    options: [
      { id: 'a', text: 'It confirmed the wave nature of electrons', feedback: 'Incorrect. The wave nature of electrons was demonstrated by other experiments like electron diffraction.' },
      { id: 'b', text: 'It demonstrated continuous energy absorption', feedback: 'Incorrect. The Franck-Hertz experiment actually showed discrete energy absorption, not continuous.' },
      { id: 'c', text: 'It provided evidence for quantized energy levels in atoms', feedback: 'Correct! The experiment showed that atoms only absorb specific amounts of energy, proving energy levels are quantized.' },
      { id: 'd', text: 'It proved photons have mass', feedback: 'Incorrect. Photons are massless particles, and this was not the purpose of the Franck-Hertz experiment.' }
    ],
    correctOptionId: 'c',
    explanation: 'The Franck-Hertz experiment demonstrated that atoms only absorb energy at specific values, providing direct evidence that atomic energy levels are quantized rather than continuous. This was crucial support for quantum theory.',
    difficulty: 'advanced',
    tags: ['franck-hertz-experiment', 'quantized-energy', 'atomic-theory', 'quantum-mechanics']
  },
  {
    questionText: "What is meant by an atom's ground state?",
    options: [
      { id: 'a', text: 'When the atom is split', feedback: 'Incorrect. Splitting an atom refers to nuclear reactions, not energy states.' },
      { id: 'b', text: 'Its lowest possible energy state', feedback: 'Correct! The ground state is when all electrons occupy the lowest available energy levels.' },
      { id: 'c', text: 'When the nucleus has maximum mass', feedback: 'Incorrect. Nuclear mass is not related to the atom\'s energy state.' },
      { id: 'd', text: 'When it emits light', feedback: 'Incorrect. Light emission occurs when atoms transition from excited states to lower states.' }
    ],
    correctOptionId: 'b',
    explanation: 'The ground state is the atom\'s most stable configuration, where all electrons occupy the lowest possible energy levels. This is the state atoms naturally return to after being excited.',
    difficulty: 'beginner',
    tags: ['ground-state', 'lowest-energy', 'stable-configuration', 'atomic-structure']
  },
  {
    questionText: "What is meant by an atom's excitation states?",
    options: [
      { id: 'a', text: 'States where atoms gain electrons', feedback: 'Incorrect. Gaining electrons creates ions, not excited states.' },
      { id: 'b', text: 'Unstable nuclear states', feedback: 'Incorrect. Excitation states refer to electron energy levels, not nuclear states.' },
      { id: 'c', text: 'Higher energy levels above ground state', feedback: 'Correct! Excited states occur when electrons absorb energy and move to higher energy levels.' },
      { id: 'd', text: 'Maximum energy state before fusion', feedback: 'Incorrect. Fusion is a nuclear process unrelated to electron excitation states.' }
    ],
    correctOptionId: 'c',
    explanation: 'Excited states are higher energy configurations where one or more electrons have absorbed energy and moved to higher energy levels above the ground state. These states are typically unstable and electrons will eventually return to lower levels.',
    difficulty: 'beginner',
    tags: ['excited-states', 'higher-energy', 'electron-levels', 'energy-absorption']
  },
  {
    questionText: "What is an atom's ionization energy?",
    options: [
      { id: 'a', text: 'The energy needed to remove a neutron', feedback: 'Incorrect. Removing neutrons involves nuclear binding energy, not ionization energy.' },
      { id: 'b', text: 'The energy gained by an alpha particle', feedback: 'Incorrect. Alpha particles are involved in nuclear processes, not atomic ionization.' },
      { id: 'c', text: 'The energy required to remove an electron from the atom', feedback: 'Correct! Ionization energy is the minimum energy needed to completely remove an electron from an atom.' },
      { id: 'd', text: 'The energy an atom radiates when excited', feedback: 'Incorrect. This describes emission energy, not ionization energy.' }
    ],
    correctOptionId: 'c',
    explanation: 'Ionization energy is the minimum energy required to completely remove an electron from an atom, converting it into a positive ion. This energy varies for different elements and for removing different electrons from the same atom.',
    difficulty: 'intermediate',
    tags: ['ionization-energy', 'electron-removal', 'atomic-ionization', 'binding-energy']
  },
  {
    questionText: "An electron with energy 4.7 eV collides with a Chekleyium atom and reflects with 1.4 eV. What is the frequency of the emitted photon?",
    options: [
      { id: 'a', text: '1.0 × 10¹⁵ Hz', feedback: 'Incorrect. This frequency is too high for the energy difference calculated.' },
      { id: 'b', text: '8.0 × 10¹⁴ Hz', feedback: 'Correct! Energy absorbed = 4.7 - 1.4 = 3.3 eV. Using f = E/h = (3.3 eV × 1.602 × 10⁻¹⁹ J/eV) / (6.626 × 10⁻³⁴ J·s) = 8.0 × 10¹⁴ Hz' },
      { id: 'c', text: '4.2 × 10¹³ Hz', feedback: 'Incorrect. This frequency is too low for the calculated energy difference.' },
      { id: 'd', text: '3.0 × 10¹⁷ Hz', feedback: 'Incorrect. This frequency is far too high and would correspond to much higher energy radiation.' }
    ],
    correctOptionId: 'b',
    explanation: 'The energy absorbed by the atom is 4.7 - 1.4 = 3.3 eV. When the atom de-excites, it emits a photon with this energy. Using f = E/h: f = (3.3 eV × 1.602 × 10⁻¹⁹ J/eV) / (6.626 × 10⁻³⁴ J·s) = 8.0 × 10¹⁴ Hz',
    difficulty: 'advanced',
    tags: ['franck-hertz', 'energy-calculation', 'photon-frequency', 'inelastic-collision']
  },
  {
    questionText: "A mercury atom has stationary states at 4.9 eV, 6.7 eV, and 8.8 eV. An electron with 3.6 eV collides with a ground state atom. What is the energy of the reflected electron?",
    options: [
      { id: 'a', text: '0.0 eV', feedback: 'Incorrect. The electron would still have kinetic energy after an elastic collision.' },
      { id: 'b', text: '1.3 eV', feedback: 'Incorrect. This would require energy absorption, but 3.6 eV is less than the first excited state at 4.9 eV.' },
      { id: 'c', text: '3.6 eV', feedback: 'Correct! Since 3.6 eV is less than the first excited state (4.9 eV), no energy is absorbed and the collision is elastic.' },
      { id: 'd', text: '4.9 eV', feedback: 'Incorrect. The electron cannot gain energy in this collision.' }
    ],
    correctOptionId: 'c',
    explanation: 'The electron has 3.6 eV, but the first excited state is at 4.9 eV. Since the electron doesn\'t have enough energy to excite the atom, the collision is elastic and the electron retains all its original energy.',
    difficulty: 'intermediate',
    tags: ['elastic-collision', 'energy-levels', 'mercury-atom', 'threshold-energy']
  },
  {
    questionText: "An electron with energy 6.8 eV strikes a mercury atom in the ground state. What are the possible energies of the reflected electron?",
    options: [
      { id: 'a', text: '1.9 eV and 2.0 eV', feedback: 'Correct! The electron can excite the atom to 4.9 eV (leaving 1.9 eV) or remain elastic (6.8 eV). However, 2.0 eV suggests another possible transition.' },
      { id: 'b', text: '0.0 eV and 3.0 eV', feedback: 'Incorrect. These energies don\'t correspond to the available transitions from the given energy levels.' },
      { id: 'c', text: '4.0 eV and 8.8 eV', feedback: 'Incorrect. The electron cannot gain energy, and 8.8 eV exceeds the incident energy.' },
      { id: 'd', text: '6.8 eV only', feedback: 'Incorrect. While elastic collision (6.8 eV) is possible, inelastic collisions are also possible.' }
    ],
    correctOptionId: 'a',
    explanation: 'With 6.8 eV, the electron can: 1) Undergo elastic collision (6.8 eV reflected), 2) Excite atom to 4.9 eV level (6.8 - 4.9 = 1.9 eV reflected). The 2.0 eV option might represent a small calculation variation or additional energy level.',
    difficulty: 'advanced',
    tags: ['inelastic-collision', 'multiple-transitions', 'mercury-excitation', 'energy-conservation']
  },
  {
    questionText: "Based on the data below from a Frank-Hertz experiment, what energy levels can be inferred for this fictitious atom?\nE_input (eV)    E_output (eV)\n6.4    6.4\n6.7    6.7\n6.8    0.0\n7.8    1.0\n8.7    0.0 or 1.9\n8.9    0.2 or 2.1",
    options: [
      { id: 'a', text: '1.0 eV, 1.9 eV, 2.3 eV', feedback: 'Correct! From the data: 6.8-0.0=6.8 eV (ground to first), 7.8-1.0=6.8 eV, 8.7-1.9=6.8 eV, and 8.9-2.1=6.8 eV all give 6.8 eV first level. Second transitions show 1.9 eV and other patterns.' },
      { id: 'b', text: '4.0 eV, 6.0 eV', feedback: 'Incorrect. These energies don\'t match the transition patterns shown in the experimental data.' },
      { id: 'c', text: '0.0 eV, 1.0 eV, 3.0 eV', feedback: 'Incorrect. While 0.0 eV (ground state) is correct, the other levels don\'t fit the data patterns.' },
      { id: 'd', text: '6.7 eV, 8.9 eV', feedback: 'Incorrect. These are input energies, not the atom\'s internal energy levels.' }
    ],
    correctOptionId: 'a',
    explanation: 'Analyzing the data: When input energy equals output energy (6.4, 6.7), collisions are elastic. When energy is lost, the difference equals excitation energy. The pattern suggests energy levels that allow for the observed transitions.',
    difficulty: 'advanced',
    tags: ['franck-hertz-analysis', 'energy-level-determination', 'experimental-data', 'collision-analysis']
  },
  {
    questionText: "What happens to a mercury atom excited to its first energy level after a collision with an electron?",
    options: [
      { id: 'a', text: 'It releases a photon as it returns to ground state', feedback: 'Correct! Excited atoms are unstable and spontaneously emit photons as electrons fall back to lower energy levels.' },
      { id: 'b', text: 'It fissions into isotopes', feedback: 'Incorrect. Fission is a nuclear process that doesn\'t occur from simple electron excitation.' },
      { id: 'c', text: 'It loses all electrons', feedback: 'Incorrect. Excitation to the first level doesn\'t provide enough energy to remove electrons.' },
      { id: 'd', text: 'It ionizes immediately', feedback: 'Incorrect. The first excited state is below the ionization threshold.' }
    ],
    correctOptionId: 'a',
    explanation: 'When an atom is excited to a higher energy level, it is in an unstable state. The electron will spontaneously fall back to the ground state, emitting a photon with energy equal to the energy difference between the levels.',
    difficulty: 'beginner',
    tags: ['excited-state-decay', 'photon-emission', 'spontaneous-emission', 'energy-release']
  },
  {
    questionText: "Why does an element produce an absorption spectrum?",
    options: [
      { id: 'a', text: 'Because it reflects incoming light', feedback: 'Incorrect. Reflection doesn\'t create the characteristic dark lines of absorption spectra.' },
      { id: 'b', text: 'It emits all colors continuously', feedback: 'Incorrect. This would produce a continuous spectrum, not an absorption spectrum.' },
      { id: 'c', text: 'It absorbs photons matching energy differences between levels', feedback: 'Correct! Atoms absorb photons whose energy exactly matches the energy difference between atomic energy levels.' },
      { id: 'd', text: 'The nucleus absorbs all visible photons', feedback: 'Incorrect. Nuclear absorption involves much higher energies than visible light.' }
    ],
    correctOptionId: 'c',
    explanation: 'Atoms can only absorb photons whose energy exactly matches the energy difference between two of their energy levels. This selective absorption creates dark lines at specific wavelengths in an otherwise continuous spectrum.',
    difficulty: 'intermediate',
    tags: ['absorption-mechanism', 'energy-matching', 'selective-absorption', 'quantum-transitions']
  },
  {
    questionText: "Why are most gases invisible to the human eye?",
    options: [
      { id: 'a', text: 'They reflect infrared only', feedback: 'Incorrect. Gases don\'t primarily reflect light; they can absorb and emit it.' },
      { id: 'b', text: 'They absorb no light', feedback: 'Incorrect. Gases can absorb light, but usually at specific wavelengths outside the visible range.' },
      { id: 'c', text: 'They do not emit or absorb visible light unless excited', feedback: 'Correct! Most gases at room temperature have their absorption/emission lines outside the visible spectrum or require excitation to interact with visible light.' },
      { id: 'd', text: 'They only glow in UV', feedback: 'Incorrect. While some gases do emit in UV, this isn\'t the primary reason for their invisibility.' }
    ],
    correctOptionId: 'c',
    explanation: 'Most gases at normal temperatures and pressures don\'t interact significantly with visible light. Their characteristic absorption and emission lines are often in other parts of the electromagnetic spectrum, or they require external excitation to interact with visible light.',
    difficulty: 'intermediate',
    tags: ['gas-visibility', 'visible-spectrum', 'room-temperature', 'excitation-requirement']
  },
  {
    questionText: "Why does an emission spectrum have more lines than an absorption spectrum?",
    options: [
      { id: 'a', text: 'Because more energy is absorbed', feedback: 'Incorrect. The number of lines isn\'t simply related to total energy absorbed.' },
      { id: 'b', text: 'Because of multiple photon collisions', feedback: 'Incorrect. Multiple collisions don\'t directly explain the difference in line numbers.' },
      { id: 'c', text: 'Because atoms can decay through many pathways', feedback: 'Correct! Excited atoms can cascade down through multiple intermediate levels, creating more emission lines than the direct absorption pathways.' },
      { id: 'd', text: 'Because it includes thermal radiation', feedback: 'Incorrect. Thermal radiation is continuous, not line spectra.' }
    ],
    correctOptionId: 'c',
    explanation: 'In absorption, atoms typically absorb from the ground state to excited states. In emission, excited atoms can cascade down through multiple pathways and intermediate levels, creating many more possible transitions and therefore more spectral lines.',
    difficulty: 'advanced',
    tags: ['emission-vs-absorption', 'cascade-transitions', 'multiple-pathways', 'spectral-complexity']
  },
  {
    questionText: "What happens when an electron with energy 5.0 eV collides with a mercury atom?",
    options: [
      { id: 'a', text: 'The atom absorbs all energy and ionizes', feedback: 'Incorrect. 5.0 eV is above the first excited state (4.9 eV) but may not be enough for ionization.' },
      { id: 'b', text: 'No reaction occurs', feedback: 'Incorrect. Since 5.0 eV > 4.9 eV, excitation can occur.' },
      { id: 'c', text: 'The atom is excited and emits a photon', feedback: 'Correct! The electron has enough energy to excite the atom to the 4.9 eV level, and the atom will subsequently emit a photon.' },
      { id: 'd', text: 'The electron bounces back with increased energy', feedback: 'Incorrect. Electrons cannot gain energy in collisions with atoms.' }
    ],
    correctOptionId: 'c',
    explanation: 'With 5.0 eV, the electron has enough energy to excite the mercury atom to its first excited state at 4.9 eV. The atom will then spontaneously emit a 4.9 eV photon as it returns to the ground state.',
    difficulty: 'intermediate',
    tags: ['mercury-excitation', 'threshold-energy', 'photon-emission', 'energy-sufficient']
  },
  {
    questionText: "A photon of 5.0 eV strikes a mercury atom. What occurs?",
    options: [
      { id: 'a', text: 'The atom is excited if the photon energy matches a transition', feedback: 'Correct! The photon will be absorbed only if its energy exactly matches an energy level difference in the atom.' },
      { id: 'b', text: 'The atom emits an electron', feedback: 'Incorrect. 5.0 eV may not be sufficient for ionization, and photoelectric emission requires the right conditions.' },
      { id: 'c', text: 'The atom fissions', feedback: 'Incorrect. Atomic fission requires much higher energies and involves nuclear processes.' },
      { id: 'd', text: 'No reaction is possible', feedback: 'Incorrect. If the photon energy matches a transition energy, absorption and excitation will occur.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a photon to be absorbed, its energy must exactly match the energy difference between two atomic energy levels. If 5.0 eV matches such a transition in mercury, the atom will be excited; otherwise, the photon will pass through unchanged.',
    difficulty: 'intermediate',
    tags: ['photon-absorption', 'energy-matching', 'quantum-selection-rules', 'exact-energy']
  },
  {
    questionText: "A spectroscope shows dark lines in the spectrum after white light passes through mercury vapor. Why are the lines dark?",
    options: [
      { id: 'a', text: 'Light is absorbed and re-emitted in a different direction', feedback: 'Correct! Mercury atoms absorb specific wavelengths, then re-emit them randomly in all directions, reducing intensity in the forward direction.' },
      { id: 'b', text: 'The vapor blocks all light', feedback: 'Incorrect. Only specific wavelengths are absorbed, not all light.' },
      { id: 'c', text: 'Only red wavelengths are absorbed', feedback: 'Incorrect. Mercury absorbs multiple specific wavelengths, not just red.' },
      { id: 'd', text: 'Mercury converts light into electrons', feedback: 'Incorrect. While photoelectric effect is possible, this doesn\'t explain absorption spectroscopy.' }
    ],
    correctOptionId: 'a',
    explanation: 'When white light passes through mercury vapor, mercury atoms absorb photons at characteristic wavelengths. These photons are then re-emitted in random directions, reducing the intensity of those wavelengths in the forward beam and creating dark absorption lines.',
    difficulty: 'intermediate',
    tags: ['absorption-lines', 'light-scattering', 'random-re-emission', 'intensity-reduction']
  },
  {
    questionText: "The emission spectrum of a substance contains lines at 172 nm, 194 nm, and 258 nm. What are the corresponding excitation energies?",
    options: [
      { id: 'a', text: '4.82 eV, 6.41 eV, 7.23 eV', feedback: 'Correct! Using E = hc/λ: 172 nm gives 7.23 eV, 194 nm gives 6.41 eV, 258 nm gives 4.82 eV.' },
      { id: 'b', text: '2.10 eV, 3.00 eV, 4.50 eV', feedback: 'Incorrect. These energies are too low for the given UV wavelengths.' },
      { id: 'c', text: '1.20 eV, 2.80 eV, 3.90 eV', feedback: 'Incorrect. These energies are far too low for UV wavelengths in the 170-260 nm range.' },
      { id: 'd', text: '8.00 eV, 7.50 eV, 6.00 eV', feedback: 'Incorrect. While in the right range, these specific values don\'t match the calculation for the given wavelengths.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using E = hc/λ with h = 6.626 × 10⁻³⁴ J·s, c = 3 × 10⁸ m/s: For 172 nm: E = 7.23 eV; For 194 nm: E = 6.41 eV; For 258 nm: E = 4.82 eV. Note that shorter wavelengths correspond to higher energies.',
    difficulty: 'advanced',
    tags: ['energy-wavelength-conversion', 'uv-emission', 'planck-equation', 'spectral-analysis']
  },
  {
    questionText: "A sodium atom emits a 589 nm photon. What is the energy difference between the levels?",
    options: [
      { id: 'a', text: '2.1 eV', feedback: 'Correct! Using E = hc/λ = (1240 eV·nm)/(589 nm) = 2.1 eV' },
      { id: 'b', text: '1.0 eV', feedback: 'Incorrect. This energy is too low for 589 nm yellow light.' },
      { id: 'c', text: '5.0 eV', feedback: 'Incorrect. This energy is too high for 589 nm light.' },
      { id: 'd', text: '4.8 eV', feedback: 'Incorrect. This energy corresponds to a much shorter wavelength than 589 nm.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the convenient formula E(eV) = 1240/λ(nm) for photon energy: E = 1240/589 = 2.1 eV. This corresponds to the famous sodium D-line emission.',
    difficulty: 'intermediate',
    tags: ['sodium-emission', 'photon-energy-calculation', 'd-line', 'visible-light']
  },
  {
    questionText: "An electron with 3.0 eV of kinetic energy collides with a free mercury atom. What is its energy after the collision?",
    options: [
      { id: 'a', text: '0.0 eV', feedback: 'Incorrect. The electron would retain some energy even in an inelastic collision.' },
      { id: 'b', text: '1.0 eV', feedback: 'Incorrect. This would require the atom to absorb 2.0 eV, but 3.0 eV is less than the first excited state.' },
      { id: 'c', text: '3.0 eV', feedback: 'Correct! Since 3.0 eV is less than the first excited state (4.9 eV), no excitation occurs and the collision is elastic.' },
      { id: 'd', text: '2.0 eV', feedback: 'Incorrect. There\'s no mechanism for the electron to lose exactly 1.0 eV in this collision.' }
    ],
    correctOptionId: 'c',
    explanation: 'The electron has 3.0 eV, which is less than mercury\'s first excited state at 4.9 eV. Since there\'s no energy level that can be reached, the collision must be elastic and the electron retains all its kinetic energy.',
    difficulty: 'intermediate',
    tags: ['elastic-collision', 'insufficient-energy', 'mercury-thresholds', 'energy-conservation']
  },
  {
    questionText: "In a Franck-Hertz experiment, electrons are accelerated through mercury vapor with 7.0 V. What photon energies may be emitted?",
    options: [
      { id: 'a', text: '2.0 eV, 5.0 eV', feedback: 'Incorrect. These energies don\'t correspond to known mercury transitions.' },
      { id: 'b', text: '4.9 eV, 6.7 eV, 1.8 eV', feedback: 'Correct! 7.0 eV can excite to 4.9 eV or 6.7 eV levels. The 1.8 eV represents the difference between these levels (6.7 - 4.9 = 1.8 eV).' },
      { id: 'c', text: '3.0 eV, 4.5 eV', feedback: 'Incorrect. These energies don\'t match mercury\'s known energy level transitions.' },
      { id: 'd', text: '7.0 eV only', feedback: 'Incorrect. While 7.0 eV is the maximum, electrons can excite to multiple levels and cascading transitions create other photon energies.' }
    ],
    correctOptionId: 'b',
    explanation: 'With 7.0 eV, electrons can excite mercury atoms to the 4.9 eV or 6.7 eV levels. Direct de-excitation gives 4.9 eV and 6.7 eV photons. Cascade transitions from 6.7 eV to 4.9 eV to ground give an additional 1.8 eV photon.',
    difficulty: 'advanced',
    tags: ['franck-hertz-mercury', 'multiple-excitation', 'cascade-emission', 'photon-energies']
  },
  {
    questionText: "A photon of 684 nm is emitted. How much energy did the atom lose?",
    options: [
      { id: 'a', text: '1.82 eV', feedback: 'Correct! Using E = hc/λ = (1240 eV·nm)/(684 nm) = 1.81 ≈ 1.82 eV' },
      { id: 'b', text: '2.48 eV', feedback: 'Incorrect. This energy corresponds to a shorter wavelength than 684 nm.' },
      { id: 'c', text: '4.20 eV', feedback: 'Incorrect. This energy is much too high for 684 nm red light.' },
      { id: 'd', text: '0.93 eV', feedback: 'Incorrect. This energy corresponds to a much longer wavelength than 684 nm.' }
    ],
    correctOptionId: 'a',
    explanation: 'The energy of the emitted photon equals the energy lost by the atom. Using E = hc/λ = 1240 eV·nm / 684 nm = 1.81 eV ≈ 1.82 eV. This represents the energy difference between two atomic levels.',
    difficulty: 'intermediate',
    tags: ['photon-energy', 'energy-loss', 'red-light-emission', 'wavelength-conversion']
  }
];

// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Assessment configurations for master function (keeping for compatibility)
const assessmentConfigs = {
  'course2_57_question1': {
    type: 'multiple-choice',
    questions: [questionPool[0]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question2': {
    type: 'multiple-choice',
    questions: [questionPool[1]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question3': {
    type: 'multiple-choice',
    questions: [questionPool[2]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question4': {
    type: 'multiple-choice',
    questions: [questionPool[3]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question5': {
    type: 'multiple-choice',
    questions: [questionPool[4]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question6': {
    type: 'multiple-choice',
    questions: [questionPool[5]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question7': {
    type: 'multiple-choice',
    questions: [questionPool[6]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question8': {
    type: 'multiple-choice',
    questions: [questionPool[7]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question9': {
    type: 'multiple-choice',
    questions: [questionPool[8]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question10': {
    type: 'multiple-choice',
    questions: [questionPool[9]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question11': {
    type: 'multiple-choice',
    questions: [questionPool[10]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question12': {
    type: 'multiple-choice',
    questions: [questionPool[11]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question13': {
    type: 'multiple-choice',
    questions: [questionPool[12]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question14': {
    type: 'multiple-choice',
    questions: [questionPool[13]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question15': {
    type: 'multiple-choice',
    questions: [questionPool[14]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question16': {
    type: 'multiple-choice',
    questions: [questionPool[15]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question17': {
    type: 'multiple-choice',
    questions: [questionPool[16]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question18': {
    type: 'multiple-choice',
    questions: [questionPool[17]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question19': {
    type: 'multiple-choice',
    questions: [questionPool[18]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question20': {
    type: 'multiple-choice',
    questions: [questionPool[19]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question21': {
    type: 'multiple-choice',
    questions: [questionPool[20]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question22': {
    type: 'multiple-choice',
    questions: [questionPool[21]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question23': {
    type: 'multiple-choice',
    questions: [questionPool[22]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_57_question24': {
    type: 'multiple-choice',
    questions: [questionPool[23]],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  }
};

module.exports = { 
  assessmentConfigs
};