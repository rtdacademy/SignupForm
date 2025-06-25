const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

// Optics: Lenses Practice Questions
const questions = [
  // Converging Lens - Image Position Questions
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
  {
    questionText: 'An object 6.0 cm high is placed 60 cm in front of a converging lens of focal length 20 cm. What is the image position?',
    options: [
      { id: 'a', text: '30 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di with f=20cm and do=60cm gives di = 30 cm.' },
      { id: 'b', text: '15 cm', feedback: 'Incorrect. Check your calculation using the lens equation.' },
      { id: 'c', text: '40 cm', feedback: 'Incorrect. Make sure you\'re solving the lens equation correctly.' },
      { id: 'd', text: '20 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/20 = 1/60 + 1/di gives 1/di = 1/20 - 1/60 = 3/60 - 1/60 = 2/60 = 1/30. Therefore di = 30 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'lens-equation', 'image-position']
  },
  {
    questionText: 'An object 10.0 cm high is placed 100 cm in front of a converging lens of focal length 30 cm. What is the image position?',
    options: [
      { id: 'a', text: '42.9 cm', feedback: 'Correct! Using the lens equation with f=30cm and do=100cm gives di ≈ 42.9 cm.' },
      { id: 'b', text: '25 cm', feedback: 'Incorrect. Check your calculation with the lens equation.' },
      { id: 'c', text: '60 cm', feedback: 'Incorrect. Make sure you\'re using the correct values in the lens equation.' },
      { id: 'd', text: '30 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/30 = 1/100 + 1/di gives 1/di = 1/30 - 1/100 = 10/300 - 3/300 = 7/300. Therefore di = 300/7 ≈ 42.9 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'lens-equation', 'image-position']
  },
  {
    questionText: 'An object 5.0 cm high is placed 50 cm in front of a converging lens of focal length 15 cm. What is the image position?',
    options: [
      { id: 'a', text: '21.4 cm', feedback: 'Correct! Using the lens equation with f=15cm and do=50cm gives di ≈ 21.4 cm.' },
      { id: 'b', text: '10 cm', feedback: 'Incorrect. Review your calculation using 1/f = 1/do + 1/di.' },
      { id: 'c', text: '35 cm', feedback: 'Incorrect. Check that you\'re solving the equation correctly.' },
      { id: 'd', text: '15 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/15 = 1/50 + 1/di gives 1/di = 1/15 - 1/50 = 10/150 - 3/150 = 7/150. Therefore di = 150/7 ≈ 21.4 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'lens-equation', 'image-position']
  },
  {
    questionText: 'An object 12.0 cm high is placed 120 cm in front of a converging lens of focal length 40 cm. What is the image position?',
    options: [
      { id: 'a', text: '60 cm', feedback: 'Correct! Using the lens equation with f=40cm and do=120cm gives di = 60 cm.' },
      { id: 'b', text: '30 cm', feedback: 'Incorrect. Review the lens equation calculation.' },
      { id: 'c', text: '80 cm', feedback: 'Incorrect. Check your arithmetic when solving 1/f = 1/do + 1/di.' },
      { id: 'd', text: '40 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/40 = 1/120 + 1/di gives 1/di = 1/40 - 1/120 = 3/120 - 1/120 = 2/120 = 1/60. Therefore di = 60 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'lens-equation', 'image-position']
  },

  // Converging Lens - Image Height Questions
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
  {
    questionText: 'An object 6.0 cm high is placed 60 cm in front of a converging lens. The image forms 30 cm from the lens. What is the image height?',
    options: [
      { id: 'a', text: '-3.0 cm', feedback: 'Correct! Using m = -di/do = -30/60 = -0.5, so hi = -0.5 × 6.0 = -3.0 cm.' },
      { id: 'b', text: '3.0 cm', feedback: 'Incorrect. Real images are inverted, so height is negative.' },
      { id: 'c', text: '-6.0 cm', feedback: 'Incorrect. The magnification is not 1.' },
      { id: 'd', text: '-1.5 cm', feedback: 'Incorrect. Review your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -30/60 = -0.5. Image height hi = m × ho = -0.5 × 6.0 = -3.0 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'magnification', 'image-height']
  },
  {
    questionText: 'An object 10.0 cm high forms an image 42.9 cm from a converging lens when placed 100 cm away. What is the image height?',
    options: [
      { id: 'a', text: '-4.3 cm', feedback: 'Correct! Using m = -di/do = -42.9/100 = -0.429, so hi ≈ -4.3 cm.' },
      { id: 'b', text: '4.3 cm', feedback: 'Incorrect. The image is real and therefore inverted (negative height).' },
      { id: 'c', text: '-10.0 cm', feedback: 'Incorrect. The image is diminished, not same size.' },
      { id: 'd', text: '-2.1 cm', feedback: 'Incorrect. Check your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -42.9/100 = -0.429. Image height hi = m × ho = -0.429 × 10.0 ≈ -4.3 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'magnification', 'image-height']
  },
  {
    questionText: 'An object 5.0 cm high forms an image 21.4 cm from a converging lens when placed 50 cm away. What is the image height?',
    options: [
      { id: 'a', text: '-2.1 cm', feedback: 'Correct! Using m = -di/do = -21.4/50 = -0.428, so hi ≈ -2.1 cm.' },
      { id: 'b', text: '2.1 cm', feedback: 'Incorrect. Real images are inverted.' },
      { id: 'c', text: '-5.0 cm', feedback: 'Incorrect. The magnification is less than 1.' },
      { id: 'd', text: '-1.1 cm', feedback: 'Incorrect. Review the magnification formula.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -21.4/50 = -0.428. Image height hi = m × ho = -0.428 × 5.0 ≈ -2.1 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'magnification', 'image-height']
  },
  {
    questionText: 'An object 12.0 cm high forms an image 60 cm from a converging lens when placed 120 cm away. What is the image height?',
    options: [
      { id: 'a', text: '-6.0 cm', feedback: 'Correct! Using m = -di/do = -60/120 = -0.5, so hi = -0.5 × 12.0 = -6.0 cm.' },
      { id: 'b', text: '6.0 cm', feedback: 'Incorrect. The image is real and inverted.' },
      { id: 'c', text: '-12.0 cm', feedback: 'Incorrect. The magnification is 0.5, not 1.' },
      { id: 'd', text: '-3.0 cm', feedback: 'Incorrect. Check your calculation of m = -di/do.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -60/120 = -0.5. Image height hi = m × ho = -0.5 × 12.0 = -6.0 cm.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'magnification', 'image-height']
  },

  // Diverging Lens - Image Position Questions
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
  {
    questionText: 'An object 8 cm high is placed 40 cm in front of a diverging lens of focal length 15 cm. What is the image position?',
    options: [
      { id: 'a', text: '-10.9 cm', feedback: 'Correct! Using the lens equation with f=-15cm and do=40cm gives di ≈ -10.9 cm.' },
      { id: 'b', text: '10.9 cm', feedback: 'Incorrect. Diverging lenses produce virtual images with negative di.' },
      { id: 'c', text: '-20 cm', feedback: 'Incorrect. Review your lens equation calculation.' },
      { id: 'd', text: '-15 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/(-15) = 1/40 + 1/di gives 1/di = -1/15 - 1/40 = -8/120 - 3/120 = -11/120. Therefore di = -120/11 ≈ -10.9 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'lens-equation', 'virtual-image']
  },
  {
    questionText: 'An object 6 cm high is placed 80 cm in front of a diverging lens of focal length 30 cm. What is the image position?',
    options: [
      { id: 'a', text: '-21.8 cm', feedback: 'Correct! Using the lens equation with f=-30cm and do=80cm gives di ≈ -21.8 cm.' },
      { id: 'b', text: '21.8 cm', feedback: 'Incorrect. Virtual images have negative image distances.' },
      { id: 'c', text: '-40 cm', feedback: 'Incorrect. Check your calculation.' },
      { id: 'd', text: '-30 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/(-30) = 1/80 + 1/di gives 1/di = -1/30 - 1/80 = -8/240 - 3/240 = -11/240. Therefore di = -240/11 ≈ -21.8 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'lens-equation', 'virtual-image']
  },
  {
    questionText: 'An object 12 cm high is placed 100 cm in front of a diverging lens of focal length 25 cm. What is the image position?',
    options: [
      { id: 'a', text: '-20 cm', feedback: 'Correct! Using the lens equation with f=-25cm and do=100cm gives di = -20 cm.' },
      { id: 'b', text: '20 cm', feedback: 'Incorrect. Diverging lenses always form virtual images.' },
      { id: 'c', text: '-50 cm', feedback: 'Incorrect. Review the lens equation.' },
      { id: 'd', text: '-25 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/(-25) = 1/100 + 1/di gives 1/di = -1/25 - 1/100 = -4/100 - 1/100 = -5/100 = -1/20. Therefore di = -20 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'lens-equation', 'virtual-image']
  },
  {
    questionText: 'An object 15 cm high is placed 50 cm in front of a diverging lens of focal length 10 cm. What is the image position?',
    options: [
      { id: 'a', text: '-8.3 cm', feedback: 'Correct! Using the lens equation with f=-10cm and do=50cm gives di ≈ -8.3 cm.' },
      { id: 'b', text: '8.3 cm', feedback: 'Incorrect. Virtual images have negative positions.' },
      { id: 'c', text: '-25 cm', feedback: 'Incorrect. Check your arithmetic.' },
      { id: 'd', text: '-10 cm', feedback: 'Incorrect. This is the focal length, not the image distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using 1/(-10) = 1/50 + 1/di gives 1/di = -1/10 - 1/50 = -5/50 - 1/50 = -6/50 = -3/25. Therefore di = -25/3 ≈ -8.3 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'lens-equation', 'virtual-image']
  },

  // Diverging Lens - Image Height Questions
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
  {
    questionText: 'An object 8 cm high forms a virtual image 10.9 cm from a diverging lens when placed 40 cm away. What is the image height?',
    options: [
      { id: 'a', text: '2.2 cm', feedback: 'Correct! Using m = -di/do = -(-10.9)/40 = 0.273, so hi ≈ 2.2 cm.' },
      { id: 'b', text: '-2.2 cm', feedback: 'Incorrect. Virtual images are upright.' },
      { id: 'c', text: '8 cm', feedback: 'Incorrect. Diverging lenses always diminish the image.' },
      { id: 'd', text: '4 cm', feedback: 'Incorrect. Review the magnification formula.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -(-10.9)/40 = 0.273. Image height hi = m × ho = 0.273 × 8 ≈ 2.2 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'magnification', 'virtual-image']
  },
  {
    questionText: 'An object 6 cm high forms a virtual image 21.8 cm from a diverging lens when placed 80 cm away. What is the image height?',
    options: [
      { id: 'a', text: '1.6 cm', feedback: 'Correct! Using m = -di/do = -(-21.8)/80 = 0.273, so hi ≈ 1.6 cm.' },
      { id: 'b', text: '-1.6 cm', feedback: 'Incorrect. Virtual images from diverging lenses are upright.' },
      { id: 'c', text: '6 cm', feedback: 'Incorrect. The magnification is less than 1.' },
      { id: 'd', text: '3 cm', feedback: 'Incorrect. Check your calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -(-21.8)/80 = 0.273. Image height hi = m × ho = 0.273 × 6 ≈ 1.6 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'magnification', 'virtual-image']
  },
  {
    questionText: 'An object 12 cm high forms a virtual image 20 cm from a diverging lens when placed 100 cm away. What is the image height?',
    options: [
      { id: 'a', text: '2.4 cm', feedback: 'Correct! Using m = -di/do = -(-20)/100 = 0.2, so hi = 0.2 × 12 = 2.4 cm.' },
      { id: 'b', text: '-2.4 cm', feedback: 'Incorrect. Virtual images are upright.' },
      { id: 'c', text: '12 cm', feedback: 'Incorrect. The image is diminished.' },
      { id: 'd', text: '6 cm', feedback: 'Incorrect. Check your magnification.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -(-20)/100 = 0.2. Image height hi = m × ho = 0.2 × 12 = 2.4 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'magnification', 'virtual-image']
  },
  {
    questionText: 'An object 15 cm high forms a virtual image 8.3 cm from a diverging lens when placed 50 cm away. What is the image height?',
    options: [
      { id: 'a', text: '2.5 cm', feedback: 'Correct! Using m = -di/do = -(-8.3)/50 = 0.166, so hi ≈ 2.5 cm.' },
      { id: 'b', text: '-2.5 cm', feedback: 'Incorrect. Virtual images are upright.' },
      { id: 'c', text: '15 cm', feedback: 'Incorrect. The image is diminished.' },
      { id: 'd', text: '7.5 cm', feedback: 'Incorrect. Review your calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnification m = -di/do = -(-8.3)/50 = 0.166. Image height hi = m × ho = 0.166 × 15 ≈ 2.5 cm.',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'magnification', 'virtual-image']
  }
];

// Export individual question handlers - Converging Lens Position Questions
exports.converging_lens_position = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_position_q2 = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_position_q3 = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_position_q4 = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_position_q5 = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Export individual question handlers - Converging Lens Height Questions
exports.converging_lens_height = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_height_q2 = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_height_q3 = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_height_q4 = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.converging_lens_height_q5 = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Export individual question handlers - Diverging Lens Position Questions
exports.diverging_lens_position = createStandardMultipleChoice({
  questions: [questions[10]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_position_q2 = createStandardMultipleChoice({
  questions: [questions[11]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_position_q3 = createStandardMultipleChoice({
  questions: [questions[12]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_position_q4 = createStandardMultipleChoice({
  questions: [questions[13]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_position_q5 = createStandardMultipleChoice({
  questions: [questions[14]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Export individual question handlers - Diverging Lens Height Questions
exports.diverging_lens_height = createStandardMultipleChoice({
  questions: [questions[15]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_height_q2 = createStandardMultipleChoice({
  questions: [questions[16]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_height_q3 = createStandardMultipleChoice({
  questions: [questions[17]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_height_q4 = createStandardMultipleChoice({
  questions: [questions[18]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.diverging_lens_height_q5 = createStandardMultipleChoice({
  questions: [questions[19]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// TODO: Continue extracting and creating individual exports for the remaining questions:
// - camera_lens_calculation
// - camera_image_size
// - infinity_focus
// - slide_projector_screen
// - slide_projector_image_size
// - slide_projector_adjustment
// - object_image_separation
// - projector_focal_length
// - optical_bench_problem
// - optical_bench_image_size
// - camera_film_distance