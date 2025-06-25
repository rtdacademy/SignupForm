const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

// Interference of Light Knowledge Check Questions
const questions = [
  {
    questionText: 'Two waves are traveling toward each other. One has an amplitude of 5.0 cm and the other has an amplitude of 3.0 cm. What will be the amplitude of the resultant wave when they meet if they undergo constructive interference?',
    options: [
      { id: 'a', text: '2.0 cm', feedback: 'Incorrect. This would be the amplitude if they underwent destructive interference (5.0 - 3.0 = 2.0 cm).' },
      { id: 'b', text: '8.0 cm', feedback: 'Correct! During constructive interference, the amplitudes add together: 5.0 cm + 3.0 cm = 8.0 cm.' },
      { id: 'c', text: '4.0 cm', feedback: 'Incorrect. This is the average of the two amplitudes, not the result of constructive interference.' },
      { id: 'd', text: '15.0 cm', feedback: 'Incorrect. This would be the product of the amplitudes, which is not how wave interference works.' }
    ],
    correctOptionId: 'b',
    explanation: 'In constructive interference, waves are in phase and their amplitudes add algebraically. The resultant amplitude is the sum of the individual amplitudes.',
    difficulty: 'intermediate',
    tags: ['constructive-interference', 'amplitude', 'wave-superposition']
  },
  {
    questionText: 'Two waves are traveling toward each other. One has an amplitude of 5.0 cm and the other has an amplitude of 3.0 cm. What will be the amplitude of the resultant wave when they meet if they undergo destructive interference?',
    options: [
      { id: 'a', text: '2.0 cm', feedback: 'Correct! During destructive interference, the amplitudes subtract: |5.0 cm - 3.0 cm| = 2.0 cm.' },
      { id: 'b', text: '8.0 cm', feedback: 'Incorrect. This would be the result of constructive interference where amplitudes add together.' },
      { id: 'c', text: '0.0 cm', feedback: 'Incorrect. Complete cancellation only occurs when both waves have equal amplitudes.' },
      { id: 'd', text: '4.0 cm', feedback: 'Incorrect. This is the average of the two amplitudes, not the result of destructive interference.' }
    ],
    correctOptionId: 'a',
    explanation: 'In destructive interference, waves are out of phase and their amplitudes subtract algebraically. The resultant amplitude is the absolute difference of the individual amplitudes.',
    difficulty: 'intermediate',
    tags: ['destructive-interference', 'amplitude', 'wave-superposition']
  },
  {
    questionText: 'Light from a coherent source is incident on two narrow slits. On a screen some distance away, you observe alternating bright and dark fringes. What causes the dark fringes?',
    options: [
      { id: 'a', text: 'Light is blocked by the barrier between the slits', feedback: 'Incorrect. The dark fringes occur even in areas where light from both slits can reach the screen.' },
      { id: 'b', text: 'Destructive interference between light waves from the two slits', feedback: 'Correct! Dark fringes occur where light waves from the two slits arrive out of phase, causing destructive interference and cancellation.' },
      { id: 'c', text: 'The light intensity is too weak to be detected', feedback: 'Incorrect. The total light energy is conserved; it\'s redistributed due to interference effects.' },
      { id: 'd', text: 'Refraction of light at the slit edges', feedback: 'Incorrect. While diffraction occurs at slit edges, the dark fringes are specifically due to interference effects.' }
    ],
    correctOptionId: 'b',
    explanation: 'Dark fringes in a double-slit pattern occur where the path difference between light from the two slits equals an odd multiple of half-wavelengths, causing destructive interference.',
    difficulty: 'intermediate',
    tags: ['double-slit', 'destructive-interference', 'dark-fringes']
  },
  {
    questionText: 'In a double-slit experiment, what happens to the fringe spacing when the wavelength of light is increased?',
    options: [
      { id: 'a', text: 'The fringe spacing decreases', feedback: 'Incorrect. Longer wavelengths actually produce wider fringe spacing.' },
      { id: 'b', text: 'The fringe spacing increases', feedback: 'Correct! According to the equation y = mλL/d, fringe spacing is directly proportional to wavelength. Longer wavelengths create wider interference patterns.' },
      { id: 'c', text: 'The fringe spacing remains the same', feedback: 'Incorrect. Wavelength directly affects the fringe spacing in the interference pattern.' },
      { id: 'd', text: 'The fringes disappear completely', feedback: 'Incorrect. Changing wavelength doesn\'t eliminate the interference pattern, just changes its scale.' }
    ],
    correctOptionId: 'b',
    explanation: 'The fringe spacing formula y = mλL/d shows that spacing is directly proportional to wavelength (λ). Longer wavelengths produce wider fringe patterns.',
    difficulty: 'intermediate',
    tags: ['double-slit', 'wavelength', 'fringe-spacing', 'interference-equation']
  },
  {
    questionText: 'Two coherent sources are producing waves in phase. At a point where the path difference is 1.5 wavelengths, what type of interference occurs?',
    options: [
      { id: 'a', text: 'Constructive interference', feedback: 'Incorrect. For sources in phase, constructive interference occurs when path difference equals whole number multiples of wavelength.' },
      { id: 'b', text: 'Destructive interference', feedback: 'Correct! When sources are in phase, destructive interference occurs when the path difference equals odd multiples of half-wavelengths (like 1.5λ = 3×0.5λ).' },
      { id: 'c', text: 'No interference', feedback: 'Incorrect. Coherent sources always produce interference patterns.' },
      { id: 'd', text: 'Partial interference', feedback: 'Incorrect. At this specific path difference, complete destructive interference occurs.' }
    ],
    correctOptionId: 'b',
    explanation: 'For in-phase sources, destructive interference occurs when path difference = (m + 0.5)λ where m is an integer. 1.5λ = (1 + 0.5)λ gives destructive interference.',
    difficulty: 'advanced',
    tags: ['path-difference', 'destructive-interference', 'coherent-sources', 'phase-relationship']
  },
  {
    questionText: 'What is the main requirement for two light sources to produce a stable interference pattern?',
    options: [
      { id: 'a', text: 'They must have the same intensity', feedback: 'Incorrect. While equal intensities give maximum contrast, coherence is the key requirement for stable patterns.' },
      { id: 'b', text: 'They must be coherent (maintain a constant phase relationship)', feedback: 'Correct! Coherence means the sources maintain a constant phase relationship over time, which is essential for producing stable, observable interference patterns.' },
      { id: 'c', text: 'They must be the same color', feedback: 'Incorrect. While the same wavelength helps, the key requirement is maintaining constant phase relationships (coherence).' },
      { id: 'd', text: 'They must be very bright', feedback: 'Incorrect. Brightness affects visibility but not the formation of interference patterns.' }
    ],
    correctOptionId: 'b',
    explanation: 'Coherence is the fundamental requirement for stable interference. Coherent sources maintain constant phase relationships, allowing interference patterns to persist long enough to be observed.',
    difficulty: 'intermediate',
    tags: ['coherence', 'interference-requirements', 'phase-relationship', 'stability']
  },
  {
    questionText: 'In a double-slit experiment, if you cover one of the slits, what happens to the pattern on the screen?',
    options: [
      { id: 'a', text: 'The interference pattern becomes brighter', feedback: 'Incorrect. Blocking one slit eliminates the interference effect entirely.' },
      { id: 'b', text: 'The interference pattern disappears and is replaced by a single-slit diffraction pattern', feedback: 'Correct! With only one slit open, there\'s no second source for interference. You get a single-slit diffraction pattern instead of the double-slit interference pattern.' },
      { id: 'c', text: 'The fringe spacing doubles', feedback: 'Incorrect. Without two slits, there are no interference fringes at all.' },
      { id: 'd', text: 'Half of the fringes disappear', feedback: 'Incorrect. The entire interference pattern disappears because interference requires two coherent sources.' }
    ],
    correctOptionId: 'b',
    explanation: 'Interference requires two coherent sources. With one slit blocked, you lose the interference effect and only observe single-slit diffraction from the remaining opening.',
    difficulty: 'intermediate',
    tags: ['double-slit', 'single-slit', 'diffraction', 'interference-vs-diffraction']
  },
  {
    questionText: 'Which of the following best describes why we don\'t normally observe interference patterns from two separate lightbulbs?',
    options: [
      { id: 'a', text: 'Lightbulbs don\'t produce enough light', feedback: 'Incorrect. Lightbulbs produce plenty of light; the issue is coherence, not intensity.' },
      { id: 'b', text: 'Lightbulbs are incoherent sources - they don\'t maintain constant phase relationships', feedback: 'Correct! Regular lightbulbs emit light randomly from many atoms at different times, creating incoherent light with constantly changing phase relationships that prevent stable interference patterns.' },
      { id: 'c', text: 'Lightbulbs are too far apart', feedback: 'Incorrect. While spacing affects fringe visibility, the main issue is the lack of coherence between independent sources.' },
      { id: 'd', text: 'Lightbulbs produce white light instead of monochromatic light', feedback: 'Partially correct but not the main reason. Even with filters, two independent sources would still be incoherent.' }
    ],
    correctOptionId: 'b',
    explanation: 'Independent light sources like lightbulbs emit photons randomly from different atoms at different times, creating incoherent light that cannot maintain the constant phase relationships needed for observable interference.',
    difficulty: 'intermediate',
    tags: ['incoherent-sources', 'lightbulbs', 'coherence', 'random-emission']
  },
  {
    questionText: 'In Young\'s double-slit experiment, what determines the number of bright fringes you can observe on the screen?',
    options: [
      { id: 'a', text: 'The intensity of the light source', feedback: 'Incorrect. Intensity affects brightness but not the number of observable fringes.' },
      { id: 'b', text: 'The ratio of slit separation to wavelength, and the screen size', feedback: 'Correct! The number of fringes depends on the angular range (determined by screen size and distance) and the angular separation between fringes (which depends on λ/d ratio).' },
      { id: 'c', text: 'Only the wavelength of light', feedback: 'Incorrect. While wavelength is important, slit separation and screen geometry also matter.' },
      { id: 'd', text: 'The distance between the slits and screen only', feedback: 'Incorrect. While distance affects fringe spacing, the slit separation and wavelength are also crucial factors.' }
    ],
    correctOptionId: 'b',
    explanation: 'The angular separation between fringes is θ = λ/d. The total observable fringes depend on this separation and the angular range visible on your screen (determined by screen size and distance).',
    difficulty: 'advanced',
    tags: ['youngs-double-slit', 'fringe-count', 'angular-separation', 'screen-geometry']
  },
  {
    questionText: 'Two speakers are playing the same pure tone in phase. At a certain location, you hear no sound (a "dead spot"). This is an example of:',
    options: [
      { id: 'a', text: 'Constructive interference', feedback: 'Incorrect. Constructive interference would create a louder sound, not silence.' },
      { id: 'b', text: 'Destructive interference', feedback: 'Correct! The dead spot occurs where sound waves from the two speakers arrive out of phase, causing destructive interference and cancellation of the sound.' },
      { id: 'c', text: 'Resonance', feedback: 'Incorrect. Resonance involves matching natural frequencies, not the cancellation of waves from two sources.' },
      { id: 'd', text: 'Echo', feedback: 'Incorrect. An echo is a reflected sound wave, not an interference effect between two sources.' }
    ],
    correctOptionId: 'b',
    explanation: 'Sound waves, like light waves, can interfere. Dead spots occur where the path difference between speakers equals odd multiples of half-wavelengths, causing destructive interference.',
    difficulty: 'intermediate',
    tags: ['sound-interference', 'destructive-interference', 'dead-spots', 'audio-waves']
  }
];

// Export individual question handlers
exports.course2_18_constructive_amplitude = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_destructive_amplitude = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_dark_fringes_cause = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_wavelength_fringe_spacing = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_path_difference_interference = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_coherence_requirement = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_single_slit_blocking = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_lightbulb_incoherence = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_fringe_count_factors = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_18_sound_dead_spots = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});