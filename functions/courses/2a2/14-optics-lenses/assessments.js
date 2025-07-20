

// Optics: Lenses Practice Questions  
const questions = [
  // Question 1: Converging Lens Position - First Question
  {
    questionText: 'An object 8.0 cm high is placed 80 cm in front of a converging lens of focal length 25 cm. What is the image position?',
    options: [
      { id: 'a', text: '36 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di with f=25cm and do=80cm gives di = 36 cm.' },
      { id: 'b', text: '18 cm', feedback: 'Incorrect. Check your calculation using the lens equation 1/f = 1/do + 1/di.' },
      { id: 'c', text: '50 cm', feedback: 'Incorrect. Make sure you\'re using the correct focal length and object distance.' },
      { id: 'd', text: '25 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the lens equation: 1/25 = 1/80 + 1/di. Solving: 1/di = 1/25 - 1/80 = (80-25)/(25×80) = 55/2000 = 11/400. Therefore di = 400/11 ≈ 36 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'lens-equation', 'image-position']
  },

  // Question 2: Converging Lens Height - First Question
  {
    questionText: 'An object 8.0 cm high is placed 80 cm in front of a converging lens of focal length 25 cm. The image position is 36 cm. What is the image height?',
    options: [
      { id: 'a', text: '-3.6 cm', feedback: 'Correct! Using m = -di/do = -36/80 = -0.45, so hi = m × ho = -0.45 × 8.0 = -3.6 cm.' },
      { id: 'b', text: '3.6 cm', feedback: 'Incorrect. The image is inverted (real image), so height should be negative.' },
      { id: 'c', text: '-8.0 cm', feedback: 'Incorrect. The image is diminished, not the same size as the object.' },
      { id: 'd', text: '-1.8 cm', feedback: 'Incorrect. Check your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -36/80 = -0.45. Image height hi = m × ho = -0.45 × 8.0 = -3.6 cm. The negative sign indicates the image is inverted.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'magnification', 'image-height']
  },

  // Question 3: Diverging Lens Position - First Question
  {
    questionText: 'A lamp 10 cm high is placed 60 cm in front of a diverging lens of focal length 20 cm. What is the image position?',
    options: [
      { id: 'a', text: '-15 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di with f=-20cm and do=60cm gives di = -15 cm.' },
      { id: 'b', text: '15 cm', feedback: 'Incorrect. Diverging lenses always produce virtual images (negative di).' },
      { id: 'c', text: '-30 cm', feedback: 'Incorrect. Check your calculation with the lens equation.' },
      { id: 'd', text: '-20 cm', feedback: 'Incorrect. This is the focal length magnitude, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/(-20) = 1/60 + 1/di gives 1/di = -1/20 - 1/60 = -3/60 - 1/60 = -4/60 = -1/15. Therefore di = -15 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'lens-equation', 'virtual-image']
  },

  // Question 4: Diverging Lens Height - First Question
  {
    questionText: 'A lamp 10 cm high is placed 60 cm in front of a diverging lens. The image forms 15 cm from the lens. What is the image height?',
    options: [
      { id: 'a', text: '2.5 cm', feedback: 'Correct! Using m = -di/do = -(-15)/60 = 0.25, so hi = 0.25 × 10 = 2.5 cm.' },
      { id: 'b', text: '-2.5 cm', feedback: 'Incorrect. Virtual images are upright (positive height).' },
      { id: 'c', text: '10 cm', feedback: 'Incorrect. The image is diminished by the diverging lens.' },
      { id: 'd', text: '5 cm', feedback: 'Incorrect. Check your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -(-15)/60 = 15/60 = 0.25. Image height hi = m × ho = 0.25 × 10 = 2.5 cm. Positive height indicates upright image.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'magnification', 'virtual-image']
  },

  // Question 5: Camera Lens Calculation - First Question
  {
    questionText: 'A typical single lens reflex (SLR) camera has a converging lens with a focal length of 50.0 mm. What is the position of the image of a 25 cm candle located 1.0 m from the lens?',
    options: [
      { id: 'a', text: '5.3 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di with f=5cm and do=100cm gives di ≈ 5.3 cm.' },
      { id: 'b', text: '52.6 mm', feedback: 'Incorrect. While numerically close, make sure units are consistent (answer in cm).' },
      { id: 'c', text: '10.0 cm', feedback: 'Incorrect. Check your calculation with f=50mm=5cm and do=1m=100cm.' },
      { id: 'd', text: '50.0 mm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Converting units: f = 50mm = 5cm, do = 1.0m = 100cm. Using 1/5 = 1/100 + 1/di gives 1/di = 1/5 - 1/100 = 20/100 - 1/100 = 19/100. Therefore di = 100/19 ≈ 5.3 cm.',
    difficulty: 'advanced',
    tags: ['camera', 'converging-lens', 'unit-conversion']
  },

  // Question 6: Camera Image Size - First Question
  {
    questionText: 'For the SLR camera in the previous question (f=50mm, object distance=1.0m, image distance=5.3cm), if the candle is 25 cm high, what is the height of the image on the film?',
    options: [
      { id: 'a', text: '-1.3 cm', feedback: 'Correct! Using m = -di/do = -5.3/100 = -0.053, so hi = -0.053 × 25 = -1.3 cm.' },
      { id: 'b', text: '1.3 cm', feedback: 'Incorrect. Real images are inverted, so height should be negative.' },
      { id: 'c', text: '-25 cm', feedback: 'Incorrect. The image is much smaller than the object.' },
      { id: 'd', text: '-2.6 cm', feedback: 'Incorrect. Check your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -5.3/100 = -0.053. Image height hi = m × ho = -0.053 × 25 = -1.3 cm. Negative indicates inverted.',
    difficulty: 'advanced',
    tags: ['camera', 'magnification', 'image-size']
  },

  // Question 7: Infinity Focus - First Question
  {
    questionText: 'When a camera lens is focused at infinity, where is the image formed?',
    options: [
      { id: 'a', text: 'At the focal point', feedback: 'Correct! For objects at infinity, the image forms at the focal point (di = f).' },
      { id: 'b', text: 'At twice the focal length', feedback: 'Incorrect. This occurs when the object is at twice the focal length.' },
      { id: 'c', text: 'At infinity', feedback: 'Incorrect. The image forms at a finite distance from the lens.' },
      { id: 'd', text: 'At the lens center', feedback: 'Incorrect. The image does not form at the lens.' }
    ],
    correctOptionId: 'a',
    explanation: 'When an object is at infinity (do = ∞), using 1/f = 1/do + 1/di gives 1/f = 0 + 1/di, so di = f. The image forms at the focal point.',
    difficulty: 'intermediate',
    tags: ['camera', 'infinity-focus', 'focal-point']
  },

  // Question 8: Slide Projector Screen - First Question
  {
    questionText: 'A slide projector with a converging lens of focal length 12 cm projects an image of a 2.4 cm × 3.6 cm slide onto a screen 3.0 m away. What is the object distance?',
    options: [
      { id: 'a', text: '12.5 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di with f=12cm and di=300cm gives do ≈ 12.5 cm.' },
      { id: 'b', text: '11.5 cm', feedback: 'Incorrect. Check your calculation with the lens equation.' },
      { id: 'c', text: '13.0 cm', feedback: 'Incorrect. Make sure you convert screen distance to cm correctly.' },
      { id: 'd', text: '12.0 cm', feedback: 'Incorrect. This is the focal length, not the object distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'With di = 3.0m = 300cm and f = 12cm: 1/12 = 1/do + 1/300. Solving: 1/do = 1/12 - 1/300 = 25/300 - 1/300 = 24/300 = 2/25. Therefore do = 25/2 = 12.5 cm.',
    difficulty: 'advanced',
    tags: ['projector', 'lens-equation', 'object-distance']
  },

  // Question 9: Slide Projector Image Size - First Question
  {
    questionText: 'For the slide projector above, if the slide is 2.4 cm high, what is the height of the image on the screen?',
    options: [
      { id: 'a', text: '-57.6 cm', feedback: 'Correct! Using m = -di/do = -300/12.5 = -24, so hi = -24 × 2.4 = -57.6 cm.' },
      { id: 'b', text: '57.6 cm', feedback: 'Incorrect. Real images are inverted (negative height).' },
      { id: 'c', text: '-2.4 cm', feedback: 'Incorrect. The image is magnified, not the same size.' },
      { id: 'd', text: '-28.8 cm', feedback: 'Incorrect. Check your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -300/12.5 = -24. Image height hi = m × ho = -24 × 2.4 = -57.6 cm. The negative sign indicates inversion.',
    difficulty: 'advanced',
    tags: ['projector', 'magnification', 'image-size']
  },

  // Question 10: Slide Projector Adjustment - First Question
  {
    questionText: 'If the slide projector screen is moved closer to the projector, what must happen to keep the image in focus?',
    options: [
      { id: 'a', text: 'Move the slide closer to the lens', feedback: 'Correct! As di decreases, do must increase to maintain 1/f = 1/do + 1/di.' },
      { id: 'b', text: 'Move the slide farther from the lens', feedback: 'Incorrect. This would make the image even more out of focus.' },
      { id: 'c', text: 'Change the focal length', feedback: 'Incorrect. The focal length is fixed for a given lens.' },
      { id: 'd', text: 'Nothing needs to change', feedback: 'Incorrect. The lens equation must be satisfied for a focused image.' }
    ],
    correctOptionId: 'a',
    explanation: 'From 1/f = 1/do + 1/di, if di decreases (screen moves closer), then 1/di increases, so 1/do must decrease, meaning do must increase (slide moves closer to lens).',
    difficulty: 'intermediate',
    tags: ['projector', 'lens-equation', 'focus-adjustment']
  },

  // Question 11: Object Image Separation - First Question
  {
    questionText: 'An object and its real image are separated by 80 cm. If the magnification is -3, what is the focal length of the converging lens?',
    options: [
      { id: 'a', text: '15 cm', feedback: 'Correct! With m = -3 and do + di = 80, solving gives f = 15 cm.' },
      { id: 'b', text: '20 cm', feedback: 'Incorrect. Check your calculation using m = -di/do and do + di = 80.' },
      { id: 'c', text: '12 cm', feedback: 'Incorrect. Make sure you use the correct relationship for magnification.' },
      { id: 'd', text: '18 cm', feedback: 'Incorrect. Review the lens equation calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'From m = -di/do = -3, so di = 3do. With do + di = 80: do + 3do = 80, so do = 20cm and di = 60cm. Using 1/f = 1/20 + 1/60 = 3/60 + 1/60 = 4/60 = 1/15, so f = 15cm.',
    difficulty: 'advanced',
    tags: ['magnification', 'object-image-separation', 'lens-equation']
  },

  // Question 12: Projector Focal Length - First Question
  {
    questionText: 'A projector lens forms a 2.0 m high image on a screen 5.0 m away when the object (slide) is 0.10 m high. What is the focal length of the lens?',
    options: [
      { id: 'a', text: '24 cm', feedback: 'Correct! Using magnification and distances: m = -20, do = 25cm, di = 500cm gives f = 24cm.' },
      { id: 'b', text: '20 cm', feedback: 'Incorrect. Check your calculation of object distance from magnification.' },
      { id: 'c', text: '30 cm', feedback: 'Incorrect. Make sure you use the correct units throughout.' },
      { id: 'd', text: '25 cm', feedback: 'Incorrect. This is the object distance, not the focal length.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = hi/ho = -200cm/10cm = -20. From m = -di/do = -20 and di = 500cm, we get do = 25cm. Using 1/f = 1/25 + 1/500 = 20/500 + 1/500 = 21/500, so f = 500/21 ≈ 24cm.',
    difficulty: 'advanced',
    tags: ['projector', 'focal-length', 'magnification']
  },

  // Question 13: Optical Bench Problem - First Question
  {
    questionText: 'On an optical bench, an object and screen are 90 cm apart. A converging lens of focal length 20 cm forms a sharp image on the screen. What are the two possible positions for the lens?',
    options: [
      { id: 'a', text: '30 cm and 60 cm from object', feedback: 'Correct! Using the lens equation with do + di = 90 gives two solutions: do = 30cm, di = 60cm and do = 60cm, di = 30cm.' },
      { id: 'b', text: '20 cm and 70 cm from object', feedback: 'Incorrect. These positions don\'t satisfy the lens equation with the given constraints.' },
      { id: 'c', text: '25 cm and 65 cm from object', feedback: 'Incorrect. Check your calculation using 1/f = 1/do + 1/di with do + di = 90.' },
      { id: 'd', text: '45 cm only (one position)', feedback: 'Incorrect. There are two possible lens positions for this configuration.' }
    ],
    correctOptionId: 'a',
    explanation: 'With do + di = 90 and f = 20: 1/20 = 1/do + 1/(90-do). Solving: do² - 90do + 1800 = 0. Using quadratic formula: do = 30cm or 60cm. Both positions work due to symmetry.',
    difficulty: 'advanced',
    tags: ['optical-bench', 'lens-positions', 'quadratic-equation']
  },

  // Question 14: Optical Bench Image Size - First Question
  {
    questionText: 'For the optical bench setup above, if the object is 2.0 cm high, what are the image heights at the two lens positions?',
    options: [
      { id: 'a', text: '-4.0 cm and -1.0 cm', feedback: 'Correct! At do=30cm, di=60cm: m=-2, hi=-4cm. At do=60cm, di=30cm: m=-0.5, hi=-1cm.' },
      { id: 'b', text: '-3.0 cm and -1.5 cm', feedback: 'Incorrect. Check your magnification calculations for both positions.' },
      { id: 'c', text: '-2.0 cm for both positions', feedback: 'Incorrect. The magnifications are different at the two positions.' },
      { id: 'd', text: '4.0 cm and 1.0 cm', feedback: 'Incorrect. Real images are inverted (negative heights).' }
    ],
    correctOptionId: 'a',
    explanation: 'Position 1: do=30cm, di=60cm, m=-60/30=-2, hi=-2×2=-4cm. Position 2: do=60cm, di=30cm, m=-30/60=-0.5, hi=-0.5×2=-1cm.',
    difficulty: 'advanced',
    tags: ['optical-bench', 'magnification', 'image-heights']
  },

  // Question 15: Camera Film Distance - First Question
  {
    questionText: 'A camera with a 50 mm lens is focused on an object 2.0 m away. How far must the lens be from the film for a sharp image?',
    options: [
      { id: 'a', text: '52.6 mm', feedback: 'Correct! Using 1/f = 1/do + 1/di with f=50mm and do=2000mm gives di ≈ 52.6mm.' },
      { id: 'b', text: '50.0 mm', feedback: 'Incorrect. This would be true only if the object were at infinity.' },
      { id: 'c', text: '48.8 mm', feedback: 'Incorrect. Check your calculation with the lens equation.' },
      { id: 'd', text: '55.0 mm', feedback: 'Incorrect. Make sure you use the correct units and lens equation.' }
    ],
    correctOptionId: 'a',
    explanation: 'With f=50mm and do=2.0m=2000mm: 1/50 = 1/2000 + 1/di. Solving: 1/di = 1/50 - 1/2000 = 40/2000 - 1/2000 = 39/2000. Therefore di = 2000/39 ≈ 52.6mm.',
    difficulty: 'intermediate',
    tags: ['camera', 'film-distance', 'lens-equation']
  }
];

// Assessment configurations for the master function
const assessmentConfigs = {
  'course2_14_converging_lens_position': {
    questions: [questions[0]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_converging_lens_height': {
    questions: [questions[1]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_diverging_lens_position': {
    questions: [questions[2]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_diverging_lens_height': {
    questions: [questions[3]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_camera_lens_calculation': {
    questions: [questions[4]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_camera_image_size': {
    questions: [questions[5]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_infinity_focus': {
    questions: [questions[6]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_slide_projector_screen': {
    questions: [questions[7]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_slide_projector_image_size': {
    questions: [questions[8]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_slide_projector_adjustment': {
    questions: [questions[9]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_object_image_separation': {
    questions: [questions[10]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_projector_focal_length': {
    questions: [questions[11]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_optical_bench_problem': {
    questions: [questions[12]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_optical_bench_image_size': {
    questions: [questions[13]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },
  'course2_14_camera_film_distance': {
    questions: [questions[14]],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  }
};

exports.assessmentConfigs = assessmentConfigs;