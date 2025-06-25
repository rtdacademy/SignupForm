const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

/**
 * Curved Mirrors Practice Problems - 6 Questions
 * Course 2, Lesson 11 - Curved Mirrors
 */

// Question 1: Concave Mirror - Image Distance
exports.concave_mirror_image_distance = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 6.0 cm tall object is placed 40 cm in front of a concave mirror with a radius of curvature of 60 cm. What is the image distance?',
      options: [
        { id: 'a', text: '120 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di where f = R/2 = 30 cm: 1/30 = 1/40 + 1/di, solving gives di = 120 cm.' },
        { id: 'b', text: '60 cm', feedback: 'Incorrect. This is the radius of curvature, not the image distance. Remember f = R/2 = 30 cm.' },
        { id: 'c', text: '30 cm', feedback: 'Incorrect. This is the focal length, not the image distance. Use the mirror equation to find di.' },
        { id: 'd', text: '24 cm', feedback: 'Incorrect. Check your calculation. Use 1/f = 1/do + 1/di with f = 30 cm and do = 40 cm.' }
      ],
      correctOptionId: 'a',
      explanation: 'For a concave mirror: f = R/2 = 60/2 = 30 cm. Using the mirror equation: 1/f = 1/do + 1/di, so 1/30 = 1/40 + 1/di. Solving: 1/di = 1/30 - 1/40 = (4-3)/120 = 1/120, therefore di = 120 cm.',
      difficulty: 'intermediate',
      tags: ['concave-mirror', 'image-distance', 'mirror-equation']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 2: Concave Mirror - Image Size
exports.concave_mirror_image_size = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 6.0 cm tall object is placed 40 cm in front of a concave mirror with a radius of curvature of 60 cm. What is the size of the image produced?',
      options: [
        { id: 'a', text: '-18 cm', feedback: 'Correct! Using magnification m = -di/do = -120/40 = -3. Image height = m × ho = -3 × 6.0 cm = -18 cm.' },
        { id: 'b', text: '18 cm', feedback: 'Incorrect. The negative sign indicates the image is inverted. The correct answer is -18 cm.' },
        { id: 'c', text: '-6 cm', feedback: 'Incorrect. This would be the same size as the object. The magnification is -3, not -1.' },
        { id: 'd', text: '6 cm', feedback: 'Incorrect. This is the object height. Calculate the image height using magnification m = -di/do.' }
      ],
      correctOptionId: 'a',
      explanation: 'With di = 120 cm and do = 40 cm, the magnification is m = -di/do = -120/40 = -3. The image height is hi = m × ho = -3 × 6.0 cm = -18 cm. The negative sign indicates the image is inverted.',
      difficulty: 'intermediate',
      tags: ['concave-mirror', 'image-size', 'magnification']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 3: Concave Mirror - Image Description
exports.concave_mirror_image_description = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 6.0 cm tall object is placed 40 cm in front of a concave mirror with a radius of curvature of 60 cm. Describe the image.',
      options: [
        { id: 'a', text: 'Inverted, real, larger', feedback: 'Correct! Since di > 0 (120 cm), the image is real. Since |m| = 3 > 1, it is larger. Since m < 0, it is inverted.' },
        { id: 'b', text: 'Erect, virtual, larger', feedback: 'Incorrect. With di = 120 cm (positive), the image is real, not virtual. Real images are always inverted.' },
        { id: 'c', text: 'Inverted, real, smaller', feedback: 'Incorrect. The magnification |m| = 3 > 1, so the image is larger than the object, not smaller.' },
        { id: 'd', text: 'Erect, real, larger', feedback: 'Incorrect. Real images formed by mirrors are always inverted, never erect.' }
      ],
      correctOptionId: 'a',
      explanation: 'With di = 120 cm > 0, the image is real. With m = -3, the negative sign means inverted and |m| = 3 > 1 means the image is larger than the object.',
      difficulty: 'intermediate',
      tags: ['concave-mirror', 'image-characteristics', 'real-image']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 4: Convex Mirror - Image Distance
exports.convex_mirror_image_distance = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 6.0 cm tall object is placed 40 cm in front of a convex mirror with a radius of curvature of 60 cm. What is the image distance?',
      options: [
        { id: 'a', text: '-17 cm', feedback: 'Correct! For convex mirror f = -30 cm. Using 1/f = 1/do + 1/di: 1/(-30) = 1/40 + 1/di, solving gives di = -17.1 cm ≈ -17 cm.' },
        { id: 'b', text: '17 cm', feedback: 'Incorrect. For convex mirrors, the image distance is always negative (virtual image). The answer should be -17 cm.' },
        { id: 'c', text: '-30 cm', feedback: 'Incorrect. This is the focal length, not the image distance. Use the mirror equation to find di.' },
        { id: 'd', text: '-60 cm', feedback: 'Incorrect. This is the negative radius of curvature, not the image distance.' }
      ],
      correctOptionId: 'a',
      explanation: 'For a convex mirror: f = -R/2 = -60/2 = -30 cm (negative for convex). Using 1/f = 1/do + 1/di: 1/(-30) = 1/40 + 1/di. Solving: 1/di = -1/30 - 1/40 = (-4-3)/120 = -7/120, so di = -120/7 ≈ -17.1 cm.',
      difficulty: 'intermediate',
      tags: ['convex-mirror', 'image-distance', 'virtual-image']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 5: Convex Mirror - Image Size
exports.convex_mirror_image_size = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 6.0 cm tall object is placed 40 cm in front of a convex mirror with a radius of curvature of 60 cm. What is the size of the image produced?',
      options: [
        { id: 'a', text: '2.6 cm', feedback: 'Correct! With di = -17.1 cm, magnification m = -di/do = -(-17.1)/40 = +0.43. Image height = 0.43 × 6.0 cm = 2.6 cm.' },
        { id: 'b', text: '-2.6 cm', feedback: 'Incorrect. For virtual images from convex mirrors, the magnification is positive, so the image height is positive (erect).' },
        { id: 'c', text: '6.0 cm', feedback: 'Incorrect. This is the object height. The image is smaller than the object for convex mirrors.' },
        { id: 'd', text: '10.3 cm', feedback: 'Incorrect. This would indicate the image is larger than the object, which never happens with convex mirrors.' }
      ],
      correctOptionId: 'a',
      explanation: 'With di = -17.1 cm and do = 40 cm, magnification m = -di/do = -(-17.1)/40 = +0.43. The image height is hi = m × ho = 0.43 × 6.0 cm = 2.6 cm. The positive value indicates an erect image.',
      difficulty: 'intermediate',
      tags: ['convex-mirror', 'image-size', 'magnification']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 6: Convex Mirror - Image Description
exports.convex_mirror_image_description = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 6.0 cm tall object is placed 40 cm in front of a convex mirror with a radius of curvature of 60 cm. Describe the image.',
      options: [
        { id: 'a', text: 'Erect, virtual, smaller', feedback: 'Correct! Since di < 0 (-17 cm), the image is virtual. Since m > 0 (+0.43), it is erect. Since |m| < 1, it is smaller.' },
        { id: 'b', text: 'Inverted, real, smaller', feedback: 'Incorrect. Convex mirrors always produce virtual images (di < 0), and virtual images are always erect, not inverted.' },
        { id: 'c', text: 'Erect, virtual, larger', feedback: 'Incorrect. While the image is erect and virtual, convex mirrors always produce images smaller than the object (|m| < 1).' },
        { id: 'd', text: 'Inverted, virtual, smaller', feedback: 'Incorrect. Virtual images are always erect, never inverted. The image is virtual and smaller, but erect.' }
      ],
      correctOptionId: 'a',
      explanation: 'With di = -17 cm < 0, the image is virtual. With m = +0.43, the positive sign means erect and |m| = 0.43 < 1 means the image is smaller than the object. Convex mirrors always produce erect, virtual, diminished images.',
      difficulty: 'intermediate',
      tags: ['convex-mirror', 'image-characteristics', 'virtual-image']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 7: Mirror Type Identification - Erect Image at 80cm
exports.mirror_type_erect_80cm = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object is placed 50 cm in front of a spherical mirror. The image formed is erect and located 80 cm from the mirror. What type of mirror is this?',
      options: [
        { id: 'a', text: 'Concave mirror', feedback: 'Incorrect. Concave mirrors produce real, inverted images when the object is beyond the focal point.' },
        { id: 'b', text: 'Convex mirror', feedback: 'Correct! Convex mirrors always produce erect, virtual images. The positive image distance (80 cm) indicates a virtual image on the same side as the object.' },
        { id: 'c', text: 'Plane mirror', feedback: 'Incorrect. A plane mirror would produce an image at the same distance as the object (50 cm), not 80 cm.' },
        { id: 'd', text: 'Cannot be determined', feedback: 'Incorrect. The erect, virtual image characteristics clearly indicate a convex mirror.' }
      ],
      correctOptionId: 'b',
      explanation: 'Only convex mirrors can produce erect images. The fact that the image is erect and at a different distance than the object confirms this is a convex mirror.',
      difficulty: 'intermediate',
      tags: ['mirror-identification', 'convex-mirror', 'virtual-image']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 8: Mirror Type Identification - General Erect Image
exports.mirror_type_identification_erect = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A spherical mirror always produces erect images regardless of object position. What type of mirror is this?',
      options: [
        { id: 'a', text: 'Concave mirror', feedback: 'Incorrect. Concave mirrors can produce both erect (virtual) and inverted (real) images depending on object position.' },
        { id: 'b', text: 'Convex mirror', feedback: 'Correct! Convex mirrors always produce erect, virtual, diminished images regardless of object position.' },
        { id: 'c', text: 'Plane mirror', feedback: 'Incorrect. While plane mirrors always produce erect images, they are not spherical mirrors.' },
        { id: 'd', text: 'Both concave and convex', feedback: 'Incorrect. Only convex mirrors always produce erect images.' }
      ],
      correctOptionId: 'b',
      explanation: 'Convex mirrors always produce erect, virtual, diminished images regardless of where the object is placed. Concave mirrors can produce both erect and inverted images depending on object position.',
      difficulty: 'beginner',
      tags: ['mirror-identification', 'convex-mirror', 'image-characteristics']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 9: Mirror Radius - Inverted Image at 120cm
exports.mirror_radius_inverted_120cm = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object placed 40 cm in front of a concave mirror produces an inverted image 120 cm from the mirror. What is the radius of curvature of the mirror?',
      options: [
        { id: 'a', text: '60 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di: 1/f = 1/40 + 1/120 = 4/120 = 1/30, so f = 30 cm. R = 2f = 60 cm.' },
        { id: 'b', text: '30 cm', feedback: 'Incorrect. This is the focal length, not the radius of curvature. R = 2f = 2(30) = 60 cm.' },
        { id: 'c', text: '80 cm', feedback: 'Incorrect. Check your calculation using the mirror equation 1/f = 1/do + 1/di.' },
        { id: 'd', text: '160 cm', feedback: 'Incorrect. This would give f = 80 cm, which doesn\'t match the mirror equation results.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using the mirror equation: 1/f = 1/40 + 1/120 = (3+1)/120 = 4/120 = 1/30, so f = 30 cm. The radius of curvature R = 2f = 60 cm.',
      difficulty: 'intermediate',
      tags: ['concave-mirror', 'radius-curvature', 'mirror-equation']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 10: Mirror Type - Inverted Image at 120cm
exports.mirror_type_inverted_120cm = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object placed 40 cm in front of a spherical mirror produces an inverted image 120 cm from the mirror. What type of mirror is this?',
      options: [
        { id: 'a', text: 'Concave mirror', feedback: 'Correct! Only concave mirrors can produce real, inverted images. The positive image distance confirms this is a real image.' },
        { id: 'b', text: 'Convex mirror', feedback: 'Incorrect. Convex mirrors always produce erect, virtual images, never inverted ones.' },
        { id: 'c', text: 'Plane mirror', feedback: 'Incorrect. Plane mirrors always produce erect images at the same distance as the object.' },
        { id: 'd', text: 'Cannot be determined', feedback: 'Incorrect. The inverted image clearly indicates this must be a concave mirror.' }
      ],
      correctOptionId: 'a',
      explanation: 'Only concave mirrors can form real, inverted images. Convex mirrors always form virtual, erect images, and plane mirrors always form virtual, erect images.',
      difficulty: 'beginner',
      tags: ['mirror-identification', 'concave-mirror', 'real-image']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 11: Convex Mirror Radius - 20cm Object Distance
exports.convex_mirror_radius_20cm = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A convex mirror with a radius of curvature of 60 cm forms an image of an object placed 20 cm in front of it. What is the image distance?',
      options: [
        { id: 'a', text: '-12 cm', feedback: 'Correct! For convex mirror f = -30 cm. Using 1/f = 1/do + 1/di: 1/(-30) = 1/20 + 1/di, solving gives di = -12 cm.' },
        { id: 'b', text: '12 cm', feedback: 'Incorrect. Convex mirrors always produce virtual images with negative image distances. The answer should be -12 cm.' },
        { id: 'c', text: '-30 cm', feedback: 'Incorrect. This is the focal length, not the image distance. Use the mirror equation to find di.' },
        { id: 'd', text: '-60 cm', feedback: 'Incorrect. This is the negative radius, not the image distance calculated from the mirror equation.' }
      ],
      correctOptionId: 'a',
      explanation: 'For a convex mirror: f = -R/2 = -60/2 = -30 cm. Using 1/f = 1/do + 1/di: 1/(-30) = 1/20 + 1/di. Solving: 1/di = -1/30 - 1/20 = (-2-3)/60 = -5/60 = -1/12, so di = -12 cm.',
      difficulty: 'intermediate',
      tags: ['convex-mirror', 'image-distance', 'mirror-equation']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 12: Convex Mirror Type Identification
exports.convex_mirror_type_identification = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A spherical mirror forms images that are always erect, virtual, and smaller than the object. What type of mirror is this?',
      options: [
        { id: 'a', text: 'Concave mirror', feedback: 'Incorrect. Concave mirrors can form both real/inverted and virtual/erect images depending on object position.' },
        { id: 'b', text: 'Convex mirror', feedback: 'Correct! Convex mirrors always form erect, virtual, and diminished (smaller) images regardless of object position.' },
        { id: 'c', text: 'Plane mirror', feedback: 'Incorrect. Plane mirrors form images the same size as the object, not smaller.' },
        { id: 'd', text: 'Parabolic mirror', feedback: 'Incorrect. This describes the behavior specific to convex mirrors.' }
      ],
      correctOptionId: 'b',
      explanation: 'Convex mirrors have the unique property of always forming erect, virtual, and diminished images regardless of where the object is placed. This makes them useful for wide-angle viewing applications.',
      difficulty: 'beginner',
      tags: ['convex-mirror', 'mirror-identification', 'image-characteristics']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 13: Object Movement and Image Size
exports.object_movement_image_size = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object is moved closer to a concave mirror from a position beyond the center of curvature. How does the image size change?',
      options: [
        { id: 'a', text: 'The image gets smaller', feedback: 'Incorrect. As the object moves closer to a concave mirror from beyond C, the image actually gets larger.' },
        { id: 'b', text: 'The image gets larger', feedback: 'Correct! As an object moves closer to a concave mirror from beyond the center of curvature, the magnification increases and the image gets larger.' },
        { id: 'c', text: 'The image size stays the same', feedback: 'Incorrect. Moving the object position changes the magnification and therefore the image size.' },
        { id: 'd', text: 'The image disappears', feedback: 'Incorrect. The image only disappears when the object is exactly at the focal point, not when moving from beyond C.' }
      ],
      correctOptionId: 'b',
      explanation: 'For concave mirrors, as an object moves closer from beyond the center of curvature, the image distance increases and the magnification |m| = |di/do| increases, making the image larger.',
      difficulty: 'intermediate',
      tags: ['concave-mirror', 'object-movement', 'magnification', 'image-size']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 14: Object Movement - Image Size Change
exports.object_movement_image_size_change = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'A 20 cm object located 30 cm in front of a mirror generates an erect image that is 10 cm tall. What is the size of image produced when the object is moved 60 cm further from the mirror\'s surface?',
      options: [
        { id: 'a', text: '5.0 cm', feedback: 'Correct! First find the mirror type and focal length, then calculate the new image size when the object is at 90 cm from the mirror.' },
        { id: 'b', text: '10 cm', feedback: 'Incorrect. The image size will change when the object distance changes. Calculate the new magnification at 90 cm.' },
        { id: 'c', text: '3.3 cm', feedback: 'Incorrect. Check your calculation of the focal length and new magnification.' },
        { id: 'd', text: '15 cm', feedback: 'Incorrect. The image gets smaller, not larger, when moved further from a convex mirror.' }
      ],
      correctOptionId: 'a',
      explanation: 'Initial: do = 30 cm, ho = 20 cm, hi = 10 cm (erect). Magnification m = +0.5, so di = -15 cm. This gives f = -30 cm (convex mirror). When moved 60 cm further: do = 90 cm. New di = -22.5 cm, new m = +0.25, so new hi = 0.25 × 20 = 5.0 cm.',
      difficulty: 'advanced',
      tags: ['object-movement', 'convex-mirror', 'magnification-change']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 15: Concave Mirror - Inverted Image 3x Size
exports.concave_mirror_3x_inverted_distance = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object located in front of a concave mirror with a radius of curvature of 80 cm produced an inverted image that is three times the size of the object. What is the object distance?',
      options: [
        { id: 'a', text: '53 cm', feedback: 'Correct! Using m = -3 for inverted image and f = +40 cm: di = 3do, then 1/40 = 1/do + 1/(3do) = 4/(3do), so do = 160/3 ≈ 53 cm.' },
        { id: 'b', text: '40 cm', feedback: 'Incorrect. This is the focal length, not the object distance. Use the magnification and mirror equation.' },
        { id: 'c', text: '80 cm', feedback: 'Incorrect. This is the radius of curvature. Calculate using m = -3 and the mirror equation.' },
        { id: 'd', text: '120 cm', feedback: 'Incorrect. This would give a different magnification. Check your calculation with m = -di/do = -3.' }
      ],
      correctOptionId: 'a',
      explanation: 'For concave mirror: f = R/2 = 40 cm. Inverted image 3× larger means m = -3. From m = -di/do: di = 3do. Using mirror equation: 1/f = 1/do + 1/di gives 1/40 = 1/do + 1/(3do) = 4/(3do). Solving: do = 160/3 ≈ 53.3 cm.',
      difficulty: 'advanced',
      tags: ['concave-mirror', 'magnification', 'object-distance']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 16: Concave Mirror - Erect Image 2x Size
exports.concave_mirror_2x_erect_distance = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object located in front of a concave mirror with a radius of curvature of 180 cm produced an erect image that is two times the size of the object. What is the object distance?',
      options: [
        { id: 'a', text: '45 cm', feedback: 'Correct! For erect image 2× larger: m = +2, f = +90 cm. From m = -di/do: di = -2do. Using 1/f = 1/do + 1/di: 1/90 = 1/do - 1/(2do) = 1/(2do), so do = 45 cm.' },
        { id: 'b', text: '90 cm', feedback: 'Incorrect. This is the focal length. For virtual images, the object must be closer than the focal point.' },
        { id: 'c', text: '180 cm', feedback: 'Incorrect. This is the radius of curvature. Calculate using m = +2 for erect image.' },
        { id: 'd', text: '30 cm', feedback: 'Incorrect. Check your calculation with m = +2 and the mirror equation.' }
      ],
      correctOptionId: 'a',
      explanation: 'For concave mirror: f = R/2 = 90 cm. Erect image 2× larger means m = +2 (virtual). From m = -di/do: di = -2do. Using mirror equation: 1/f = 1/do + 1/di gives 1/90 = 1/do + 1/(-2do) = 1/do - 1/(2do) = 1/(2do). Solving: do = 45 cm.',
      difficulty: 'advanced',
      tags: ['concave-mirror', 'virtual-image', 'object-distance']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Question 17: Convex Mirror - 1/6 Size Object Distance
exports.convex_mirror_one_sixth_distance = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'An object located in front of a convex mirror with a focal length of 60 cm produced an erect image that is 1/6 the size of the object. What is the object distance?',
      options: [
        { id: 'a', text: '300 cm', feedback: 'Correct! For convex mirror f = -60 cm, m = +1/6. From m = -di/do: di = -do/6. Using 1/f = 1/do + 1/di: 1/(-60) = 1/do + 6/(-do) = -5/(do), so do = 300 cm.' },
        { id: 'b', text: '60 cm', feedback: 'Incorrect. This is the focal length magnitude. Calculate using m = +1/6 and the mirror equation.' },
        { id: 'c', text: '50 cm', feedback: 'Incorrect. Check your calculation with the magnification formula and mirror equation.' },
        { id: 'd', text: '360 cm', feedback: 'Incorrect. Verify your algebra when solving the mirror equation with m = +1/6.' }
      ],
      correctOptionId: 'a',
      explanation: 'For convex mirror: f = -60 cm. Erect image 1/6 size means m = +1/6. From m = -di/do: di = -do/6. Using mirror equation: 1/f = 1/do + 1/di gives 1/(-60) = 1/do + 1/(-do/6) = 1/do - 6/do = -5/do. Solving: do = 300 cm.',
      difficulty: 'advanced',
      tags: ['convex-mirror', 'magnification', 'object-distance']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

