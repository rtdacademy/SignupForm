

// Diffraction Gratings Knowledge Check Questions
const questions = [
  {
    questionText: 'Green light of wavelength 5000 Å (1 Å = 10⁻¹⁰ m) is shone on a grating and a second order image is produced at 32°. How many lines/cm are marked on the grating?',
    options: [
      { id: 'a', text: '4200 lines/cm', feedback: 'Incorrect. Check your calculation using the grating equation d sin θ = mλ.' },
      { id: 'b', text: '5300 lines/cm', feedback: 'Correct! Using d sin θ = mλ: d = mλ/(sin θ) = (2 × 5000×10⁻¹⁰)/(sin 32°) = 1.887×10⁻⁶ m. Lines/cm = 1/(d×100) = 5300 lines/cm.' },
      { id: 'c', text: '6800 lines/cm', feedback: 'Incorrect. Make sure you\'re using the correct wavelength conversion and order number.' },
      { id: 'd', text: '3100 lines/cm', feedback: 'Incorrect. Double-check your angle and wavelength values in the grating equation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using the grating equation d sin θ = mλ, where m=2, λ=5000Å=5×10⁻⁷m, θ=32°. Solving for d gives 1.887×10⁻⁶ m, which equals 5300 lines/cm.',
    difficulty: 'advanced',
    tags: ['diffraction-grating', 'wavelength', 'lines-per-cm', 'grating-equation']
  },
  {
    questionText: 'How many lines per metre does a diffraction grating have if the 2nd order minimum occurs at an angle of deviation of 16.0° when 530 nm light is used?',
    options: [
      { id: 'a', text: '2.85 × 10⁵ lines/m', feedback: 'Incorrect. Remember that for minima in diffraction gratings, we need to consider the single-slit diffraction condition.' },
      { id: 'b', text: '3.47 × 10⁵ lines/m', feedback: 'Correct! For the 2nd order minimum, we use the condition for destructive interference. The calculation gives d = 2.88×10⁻⁶ m, so lines/m = 1/d = 3.47×10⁵ lines/m.' },
      { id: 'c', text: '4.12 × 10⁵ lines/m', feedback: 'Incorrect. Check your understanding of the condition for diffraction minima.' },
      { id: 'd', text: '1.95 × 10⁵ lines/m', feedback: 'Incorrect. Make sure you\'re using the correct equation for the 2nd order minimum.' }
    ],
    correctOptionId: 'b',
    explanation: 'For diffraction grating minima, we use the single-slit condition. The 2nd order minimum occurs when d sin θ = (m + 1/2)λ for the envelope, giving d = 2.88×10⁻⁶ m, or 3.47×10⁵ lines/m.',
    difficulty: 'advanced',
    tags: ['diffraction-minimum', 'lines-per-meter', 'order', 'wavelength']
  },
  {
    questionText: '650 nm yellow light is incident on a diffraction grating which has 150 lines/cm. What is the spacing between the bright fringes produced on a screen 4.9 m away?',
    options: [
      { id: 'a', text: '3.2 cm', feedback: 'Incorrect. Double-check your calculation of the grating spacing and the small angle approximation.' },
      { id: 'b', text: '4.8 cm', feedback: 'Correct! First find d = 1/(150×100) = 6.67×10⁻⁵ m. Using x = λL/d = (650×10⁻⁹ × 4.9)/(6.67×10⁻⁵) = 0.048 m = 4.8 cm.' },
      { id: 'c', text: '6.1 cm', feedback: 'Incorrect. Check your conversion of lines/cm to grating spacing.' },
      { id: 'd', text: '2.9 cm', feedback: 'Incorrect. Make sure you\'re using the correct distance to the screen.' }
    ],
    correctOptionId: 'b',
    explanation: 'The grating spacing is d = 1/(150×100) = 6.67×10⁻⁵ m. The fringe spacing is x = λL/d = (650×10⁻⁹ × 4.9)/(6.67×10⁻⁵) = 4.8 cm.',
    difficulty: 'intermediate',
    tags: ['fringe-spacing', 'screen-distance', 'wavelength', 'grating-spacing']
  },
  {
    questionText: 'Light of frequency 5.0 × 10¹⁴ Hz falls on a diffraction grating which has 4.2 × 10³ lines/cm. At what angle will the third antinodal line be inclined to the forward direction?',
    options: [
      { id: 'a', text: '32°', feedback: 'Incorrect. Make sure you\'re using the correct order (m=3) and have calculated the wavelength correctly.' },
      { id: 'b', text: '49°', feedback: 'Correct! First find λ = c/f = 3×10⁸/(5×10¹⁴) = 600 nm. Then d = 1/(4200×100) = 2.38×10⁻⁶ m. Using d sin θ = mλ with m=3: θ = sin⁻¹(3×600×10⁻⁹/2.38×10⁻⁶) = 49°.' },
      { id: 'c', text: '58°', feedback: 'Incorrect. Check your calculation of the grating spacing from lines/cm.' },
      { id: 'd', text: '41°', feedback: 'Incorrect. Verify that you\'re using m=3 for the third order maximum.' }
    ],
    correctOptionId: 'b',
    explanation: 'Convert frequency to wavelength: λ = c/f = 600 nm. Grating spacing: d = 1/(4200×100) = 2.38×10⁻⁶ m. For m=3: sin θ = 3λ/d = 0.756, so θ = 49°.',
    difficulty: 'advanced',
    tags: ['frequency', 'wavelength-conversion', 'third-order', 'angle-calculation']
  },
  {
    questionText: 'A grating is ruled with 1000 lines/cm. How many orders of spectra are possible on either side of the central maximum for 700 nm red light?',
    options: [
      { id: 'a', text: '12', feedback: 'Incorrect. Remember that sin θ cannot exceed 1, which limits the maximum order.' },
      { id: 'b', text: '14', feedback: 'Correct! The grating spacing is d = 1/(1000×100) = 10⁻⁵ m. Maximum order occurs when sin θ = 1: m_max = d/λ = 10⁻⁵/(700×10⁻⁹) = 14.3. Since m must be integer, maximum order is 14.' },
      { id: 'c', text: '16', feedback: 'Incorrect. Check the condition that sin θ ≤ 1 for physical solutions.' },
      { id: 'd', text: '10', feedback: 'Incorrect. Make sure you\'re calculating the maximum possible order correctly.' }
    ],
    correctOptionId: 'b',
    explanation: 'The maximum order occurs when sin θ = 1. Using d sin θ = mλ: m_max = d/λ = (10⁻⁵ m)/(700×10⁻⁹ m) = 14.3. Since m must be an integer, the maximum order is 14.',
    difficulty: 'intermediate',
    tags: ['maximum-order', 'spectral-orders', 'physical-limits', 'red-light']
  },
  {
    questionText: 'A light ray of frequency 5.0 × 10¹⁴ Hz is incident on a diffraction grating that has 180 lines/cm. After passing through the grating the light travels 4.0 m in a trough of water to a screen where it produces an interference pattern. How far apart are the bright fringes on the screen?',
    options: [
      { id: 'a', text: '2.7 cm', feedback: 'Incorrect. Make sure you\'re accounting for the refraction of light in water (n=1.33).' },
      { id: 'b', text: '3.2 cm', feedback: 'Correct! λ = c/f = 600 nm in air. In water: λ_water = λ/n = 600/1.33 = 451 nm. d = 1/(180×100) = 5.56×10⁻⁵ m. Fringe spacing: x = λ_water × L/d = (451×10⁻⁹ × 4.0)/(5.56×10⁻⁵) = 3.2 cm.' },
      { id: 'c', text: '4.3 cm', feedback: 'Incorrect. Remember that the wavelength changes when light enters water.' },
      { id: 'd', text: '1.8 cm', feedback: 'Incorrect. Check your calculation of the wavelength in water and the grating spacing.' }
    ],
    correctOptionId: 'b',
    explanation: 'The wavelength in air is λ = c/f = 600 nm. In water (n=1.33), λ_water = 451 nm. With d = 5.56×10⁻⁵ m, the fringe spacing is x = λ_water × L/d = 3.2 cm.',
    difficulty: 'advanced',
    tags: ['refraction', 'water-medium', 'wavelength-change', 'frequency-conversion']
  },
  {
    questionText: 'The wavelength of a laser beam used in a compact disc player is 790 nm. Suppose that a diffraction grating produces first-order tracking beams which are 1.20 mm apart at a distance of 3.00 mm from the grating. Estimate the spacing between the slits of the grating.',
    options: [
      { id: 'a', text: '1.85 × 10⁻⁶ m', feedback: 'Incorrect. Check your calculation of the angle from the given measurements.' },
      { id: 'b', text: '2.13 × 10⁻⁶ m', feedback: 'Correct! The angle is θ = tan⁻¹(0.6 mm / 3.00 mm) = 11.31°. Using d sin θ = mλ with m=1: d = λ/sin θ = (790×10⁻⁹)/sin(11.31°) = 2.13×10⁻⁶ m.' },
      { id: 'c', text: '3.47 × 10⁻⁶ m', feedback: 'Incorrect. Make sure you\'re using the correct geometry to find the diffraction angle.' },
      { id: 'd', text: '1.25 × 10⁻⁶ m', feedback: 'Incorrect. Double-check your trigonometry and the first-order condition.' }
    ],
    correctOptionId: 'b',
    explanation: 'The beams are 1.20 mm apart, so each is 0.6 mm from center. The angle is θ = tan⁻¹(0.6/3.0) = 11.31°. Using d sin θ = λ for first order: d = 2.13×10⁻⁶ m.',
    difficulty: 'advanced',
    tags: ['cd-player', 'laser-wavelength', 'first-order', 'slit-spacing']
  },
  {
    questionText: 'Monochromatic light with a frequency of 5.50 × 10¹⁴ Hz is directed onto a diffraction grating ruled with 6000 lines/m. What is the distance between the 3rd bright band and the 5th dark band of the interference pattern formed on a screen 2.50 m from the grating?',
    options: [
      { id: 'a', text: '0.98 cm', feedback: 'Incorrect. Make sure you\'re correctly identifying the positions of both the 3rd bright band and 5th dark band.' },
      { id: 'b', text: '1.23 cm', feedback: 'Correct! λ = c/f = 545 nm, d = 1/6000 = 1.67×10⁻⁴ m. For 3rd bright: x₃ = 3λL/d = 2.45 cm. For 5th dark: x₅ = 4.5λL/d = 3.68 cm. Distance = 3.68 - 2.45 = 1.23 cm.' },
      { id: 'c', text: '1.47 cm', feedback: 'Incorrect. Check your calculation of the dark fringe position (occurs at half-integer multiples).' },
      { id: 'd', text: '0.82 cm', feedback: 'Incorrect. Verify your wavelength calculation and the positions of both fringes.' }
    ],
    correctOptionId: 'b',
    explanation: 'λ = c/f = 545 nm. The 3rd bright band is at x₃ = 3λL/d = 2.45 cm. The 5th dark band is at x₅ = 4.5λL/d = 3.68 cm. The distance between them is 1.23 cm.',
    difficulty: 'advanced',
    tags: ['bright-dark-bands', 'frequency-conversion', 'pattern-spacing', 'multiple-orders']
  },
  {
    questionText: 'A student using a diffraction grating ruled with 6.20 × 10⁴ lines/m to measure the frequency of some monochromatic light. If the nodal lines are 0.0522 m apart at a distance of 1.50 m from the grating, what is the frequency of the light used?',
    options: [
      { id: 'a', text: '4.2 × 10¹⁴ Hz', feedback: 'Incorrect. Check your calculation of the wavelength from the fringe spacing.' },
      { id: 'b', text: '5.3 × 10¹⁴ Hz', feedback: 'Correct! d = 1/(6.20×10⁴) = 1.61×10⁻⁵ m. From x = λL/d: λ = xd/L = (0.0522 × 1.61×10⁻⁵)/1.50 = 560 nm. Then f = c/λ = 3×10⁸/(560×10⁻⁹) = 5.3×10¹⁴ Hz.' },
      { id: 'c', text: '6.8 × 10¹⁴ Hz', feedback: 'Incorrect. Make sure you\'re using the correct grating spacing in your calculation.' },
      { id: 'd', text: '3.9 × 10¹⁴ Hz', feedback: 'Incorrect. Double-check your wavelength calculation from the given fringe spacing.' }
    ],
    correctOptionId: 'b',
    explanation: 'First find d = 1/(6.20×10⁴) = 1.61×10⁻⁵ m. Then λ = xd/L = (0.0522 × 1.61×10⁻⁵)/1.50 = 560 nm. Finally, f = c/λ = 5.3×10¹⁴ Hz.',
    difficulty: 'advanced',
    tags: ['frequency-measurement', 'nodal-lines', 'reverse-calculation', 'wavelength-determination']
  },
  {
    questionText: 'Using the information from the previous question, determine the distance between nodal lines if the grating was changed to 9.30 × 10⁴ lines/m while all other variables remained unchanged.',
    options: [
      { id: 'a', text: '6.25 cm', feedback: 'Incorrect. Remember that changing the grating spacing affects the fringe spacing proportionally.' },
      { id: 'b', text: '7.83 cm', feedback: 'Correct! The new grating spacing is d₂ = 1/(9.30×10⁴) = 1.075×10⁻⁵ m. Using the same wavelength (560 nm): x₂ = λL/d₂ = (560×10⁻⁹ × 1.50)/(1.075×10⁻⁵) = 0.0783 m = 7.83 cm.' },
      { id: 'c', text: '9.12 cm', feedback: 'Incorrect. Check your calculation of the new grating spacing.' },
      { id: 'd', text: '4.67 cm', feedback: 'Incorrect. Make sure you\'re using the wavelength determined from the previous question.' }
    ],
    correctOptionId: 'b',
    explanation: 'With the new grating (9.30×10⁴ lines/m), d₂ = 1.075×10⁻⁵ m. Using the same wavelength (560 nm) and distance (1.50 m): x₂ = λL/d₂ = 7.83 cm.',
    difficulty: 'intermediate',
    tags: ['grating-change', 'proportional-relationships', 'fringe-spacing-change', 'same-wavelength']
  },
  {
    questionText: 'Using the information from question 9, determine the distance between nodal lines at a distance of 3.00 m if all other variables remained unchanged.',
    options: [
      { id: 'a', text: '0.087 m', feedback: 'Incorrect. Remember that fringe spacing is directly proportional to screen distance.' },
      { id: 'b', text: '0.104 m', feedback: 'Correct! The fringe spacing is proportional to screen distance: x₂/x₁ = L₂/L₁. So x₂ = x₁ × (L₂/L₁) = 0.0522 × (3.00/1.50) = 0.104 m.' },
      { id: 'c', text: '0.125 m', feedback: 'Incorrect. Check the proportional relationship between distance and fringe spacing.' },
      { id: 'd', text: '0.078 m', feedback: 'Incorrect. Make sure you\'re doubling the original fringe spacing when doubling the distance.' }
    ],
    correctOptionId: 'b',
    explanation: 'Fringe spacing is directly proportional to screen distance. When distance doubles from 1.50 m to 3.00 m, the fringe spacing also doubles: 0.0522 × 2 = 0.104 m.',
    difficulty: 'intermediate',
    tags: ['distance-change', 'proportional-scaling', 'screen-distance-effect', 'linear-relationship']
  },
  {
    questionText: 'Using the information from question 9, determine the distance between nodal lines if the frequency of the light was changed to four-fifths of its original while all other variables remained unchanged.',
    options: [
      { id: 'a', text: '5.2 cm', feedback: 'Incorrect. Remember that wavelength is inversely proportional to frequency, and fringe spacing is proportional to wavelength.' },
      { id: 'b', text: '6.5 cm', feedback: 'Correct! If frequency becomes 4/5 of original, then wavelength becomes 5/4 of original. Since fringe spacing is proportional to wavelength: x₂ = x₁ × (5/4) = 0.0522 × 1.25 = 0.065 m = 6.5 cm.' },
      { id: 'c', text: '4.2 cm', feedback: 'Incorrect. Check the inverse relationship between frequency and wavelength.' },
      { id: 'd', text: '7.8 cm', feedback: 'Incorrect. Make sure you\'re applying the correct factor for the frequency change.' }
    ],
    correctOptionId: 'b',
    explanation: 'When frequency becomes 4/5 of original, wavelength becomes 5/4 of original (λ ∝ 1/f). Since fringe spacing is proportional to wavelength: x₂ = 0.0522 × (5/4) = 6.5 cm.',
    difficulty: 'intermediate',
    tags: ['frequency-change', 'wavelength-inverse-relationship', 'proportional-effects', 'scaling-calculations']
  }
];

// Assessment configurations for the master function
const assessmentConfigs = {
  'course2_19_green_light_grating': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_second_order_minimum': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_yellow_light_spacing': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_frequency_third_order': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_spectral_orders_red': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_water_trough_fringes': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_cd_player_laser': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_bright_dark_bands': {
    questions: [questions[7]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_frequency_measurement': {
    questions: [questions[8]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_grating_change': {
    questions: [questions[9]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_distance_change': {
    questions: [questions[10]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_19_frequency_change': {
    questions: [questions[11]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;