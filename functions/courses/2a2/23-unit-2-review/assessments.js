/**
 * Assessment Functions for Unit 2 Review - Optics and Wave Properties of Light
 * Course: 2 (Physics 30)
 * Content: 23-unit-2-review
 * 
 * This module provides individual standard multiple choice assessments for the
 * slideshow knowledge check frontend component.
 */

const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ===== UNIT 2 REVIEW QUESTIONS =====

// Question 1: Pinhole camera image size
exports.course2_23_unit2_q1 = createStandardMultipleChoice({
  questions: [{
    questionText: "What is the size of the image of a person that is 1.75 m tall and is standing 8 m from a pinhole camera that is 20 cm long?",
    options: [
      { id: 'a', text: '4.4 cm', feedback: 'Correct! Using similar triangles: hi/ho = di/do → hi = (1.75 m × 0.20 m) / 8 m = 0.044 m = 4.4 cm' },
      { id: 'b', text: '2.2 cm', feedback: 'Incorrect. Check your calculation of the ratio of distances.' },
      { id: 'c', text: '8.8 cm', feedback: 'Incorrect. You may have doubled the correct answer.' },
      { id: 'd', text: '3.5 cm', feedback: 'Incorrect. Make sure you are using the correct distance ratios.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a pinhole camera, similar triangles apply: hi/ho = di/do. Therefore: hi = ho × (di/do) = 1.75 m × (0.20 m/8 m) = 0.044 m = 4.4 cm',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'similar-triangles', 'optics']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 2: Rotating mirror frequency
exports.course2_23_unit2_q2 = createStandardMultipleChoice({
  questions: [{
    questionText: "When verifying the speed of light, a student set up a hexagonal rotating mirror and a reflecting mirror 40 km away. At what minimum frequency must the mirror rotate so that the reflected light is seen by the observer?",
    options: [
      { id: 'a', text: '625 Hz', feedback: 'Correct! For a hexagonal mirror to show reflected light, it must rotate 1/6 turn in the time light travels 80 km. f = c/(6 × 80 km) = 3×10⁸/(6 × 8×10⁴) = 625 Hz' },
      { id: 'b', text: '750 Hz', feedback: 'Incorrect. Check your calculation of the time for light to travel the round trip distance.' },
      { id: 'c', text: '500 Hz', feedback: 'Incorrect. Make sure you account for the hexagonal shape (6 sides) of the mirror.' },
      { id: 'd', text: '1250 Hz', feedback: 'Incorrect. You may have made an error in the distance calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Light travels 80 km (40 km each way). For a hexagonal mirror, rotation of 1/6 turn aligns the next face. Time = 80,000 m / (3×10⁸ m/s) = 2.67×10⁻⁴ s. Frequency = 1/(6 × 2.67×10⁻⁴ s) = 625 Hz',
    difficulty: 'advanced',
    tags: ['speed-of-light', 'rotating-mirror', 'frequency']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 3: Two mirrors at 135° angle
exports.course2_23_unit2_q3 = createStandardMultipleChoice({
  questions: [{
    questionText: "Two mirrors meet at a 135° angle. If light rays strike one mirror at 40°, at what angle do they leave the second mirror?",
    options: [
      { id: 'a', text: '5°', feedback: 'Correct! Using the formula: exit angle = |180° - 2(mirror angle) - incident angle| = |180° - 2(135°) - 40°| = |180° - 270° - 40°| = |-130°| = 130°, but measured from normal gives 5°' },
      { id: 'b', text: '40°', feedback: 'Incorrect. The angle changes due to the geometry of the two-mirror system.' },
      { id: 'c', text: '95°', feedback: 'Incorrect. Check your application of the law of reflection for both mirrors.' },
      { id: 'd', text: '50°', feedback: 'Incorrect. Consider the geometry more carefully.' }
    ],
    correctOptionId: 'a',
    explanation: 'For two mirrors at angle α with incident angle θ, the deviation is independent of θ and equals 360° - 2α. Here: deviation = 360° - 2(135°) = 90°. The ray exits at 40° + 90° - 180° = -50° from the incident direction, which is 5° from the normal to the second mirror.',
    difficulty: 'advanced',
    tags: ['reflection', 'multiple-mirrors', 'geometry']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 4: Concave mirror image beyond C
exports.course2_23_unit2_q4 = createStandardMultipleChoice({
  questions: [{
    questionText: "Describe the image formed by a concave mirror when the object is beyond C (center of curvature).",
    options: [
      { id: 'a', text: 'Smaller, inverted, real', feedback: 'Correct! When the object is beyond C for a concave mirror, the image is smaller than the object, inverted, and real (can be projected on a screen).' },
      { id: 'b', text: 'Larger, upright, virtual', feedback: 'Incorrect. This describes the image when the object is closer than the focal point.' },
      { id: 'c', text: 'Same size, inverted, real', feedback: 'Incorrect. Same size occurs when the object is exactly at C.' },
      { id: 'd', text: 'Larger, inverted, real', feedback: 'Incorrect. Larger images occur when the object is between F and C.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a concave mirror with object beyond center of curvature C: the image forms between the focal point F and C, is real (can be projected), inverted (upside down), and smaller than the object.',
    difficulty: 'intermediate',
    tags: ['concave-mirror', 'image-formation', 'ray-diagrams']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 5a: Diamond ring image position
exports.course2_23_unit2_q5a = createStandardMultipleChoice({
  questions: [{
    questionText: "A 1.50 cm high diamond ring is placed 20.0 cm from a concave mirror with radius of curvature of 30.0 cm. Determine the position of the image.",
    options: [
      { id: 'a', text: '60.0 cm', feedback: 'Correct! f = R/2 = 15.0 cm. Using 1/f = 1/do + 1/di: 1/15 = 1/20 + 1/di → 1/di = 1/15 - 1/20 = 1/60 → di = 60.0 cm' },
      { id: 'b', text: '30.0 cm', feedback: 'Incorrect. This is the radius of curvature, not the image distance.' },
      { id: 'c', text: '12.0 cm', feedback: 'Incorrect. Check your calculation using the mirror equation.' },
      { id: 'd', text: '40.0 cm', feedback: 'Incorrect. Make sure you are using the correct focal length (f = R/2).' }
    ],
    correctOptionId: 'a',
    explanation: 'First find focal length: f = R/2 = 30.0 cm / 2 = 15.0 cm. Then use mirror equation: 1/f = 1/do + 1/di. Solving: 1/15 = 1/20 + 1/di → 1/di = 4/60 - 3/60 = 1/60 → di = 60.0 cm',
    difficulty: 'intermediate',
    tags: ['concave-mirror', 'mirror-equation', 'calculations']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 5b: Diamond ring image size
exports.course2_23_unit2_q5b = createStandardMultipleChoice({
  questions: [{
    questionText: "A 1.50 cm high diamond ring is placed 20.0 cm from a concave mirror with radius of curvature of 30.0 cm. Determine the image size.",
    options: [
      { id: 'a', text: '4.5 cm', feedback: 'Correct! Using M = -di/do = -60.0/20.0 = -3.0. Image height = |M| × object height = 3.0 × 1.50 cm = 4.5 cm' },
      { id: 'b', text: '1.5 cm', feedback: 'Incorrect. This is the same as the object height. The magnification is not 1.' },
      { id: 'c', text: '0.5 cm', feedback: 'Incorrect. This would indicate the image is smaller, but it should be larger.' },
      { id: 'd', text: '9.0 cm', feedback: 'Incorrect. Check your magnification calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'From the previous calculation, di = 60.0 cm. Magnification M = -di/do = -60.0/20.0 = -3.0. The image height = |M| × object height = 3.0 × 1.50 cm = 4.5 cm. The negative magnification indicates the image is inverted.',
    difficulty: 'intermediate',
    tags: ['concave-mirror', 'magnification', 'image-size']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 6a: Object at 10 cm from concave mirror - position
exports.course2_23_unit2_q6a = createStandardMultipleChoice({
  questions: [{
    questionText: "A 1.00 cm high object is placed 10.0 cm from a concave mirror whose radius of curvature is 30.0 cm. Determine the position of the image analytically.",
    options: [
      { id: 'a', text: '-30 cm', feedback: 'Correct! f = R/2 = 15.0 cm. Using 1/f = 1/do + 1/di: 1/15 = 1/10 + 1/di → 1/di = 1/15 - 1/10 = -1/30 → di = -30 cm (virtual image)' },
      { id: 'b', text: '30 cm', feedback: 'Incorrect. The image is virtual (behind the mirror), so the distance should be negative.' },
      { id: 'c', text: '6 cm', feedback: 'Incorrect. Check your calculation using the mirror equation.' },
      { id: 'd', text: '-6 cm', feedback: 'Incorrect. Make sure you are using the correct focal length.' }
    ],
    correctOptionId: 'a',
    explanation: 'f = R/2 = 30.0/2 = 15.0 cm. Mirror equation: 1/f = 1/do + 1/di → 1/15 = 1/10 + 1/di → 1/di = 1/15 - 1/10 = 2/30 - 3/30 = -1/30 → di = -30 cm. Negative means virtual image.',
    difficulty: 'intermediate',
    tags: ['concave-mirror', 'virtual-image', 'mirror-equation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 6b: Object at 10 cm from concave mirror - magnification
exports.course2_23_unit2_q6b = createStandardMultipleChoice({
  questions: [{
    questionText: "A 1.00 cm high object is placed 10.0 cm from a concave mirror whose radius of curvature is 30.0 cm. Determine the magnification analytically.",
    options: [
      { id: 'a', text: '3', feedback: 'Correct! M = -di/do = -(-30)/10 = 30/10 = 3. Positive magnification indicates upright virtual image that is 3 times larger.' },
      { id: 'b', text: '-3', feedback: 'Incorrect. This would indicate an inverted image, but virtual images are upright.' },
      { id: 'c', text: '0.33', feedback: 'Incorrect. This would indicate a smaller image, but this configuration produces a larger image.' },
      { id: 'd', text: '-0.33', feedback: 'Incorrect. Check your calculation of magnification using M = -di/do.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using di = -30 cm from the previous calculation: M = -di/do = -(-30)/10 = +3. The positive magnification indicates the image is upright and 3 times larger than the object.',
    difficulty: 'intermediate',
    tags: ['concave-mirror', 'magnification', 'virtual-image']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 7a: Convex car mirror - image location
exports.course2_23_unit2_q7a = createStandardMultipleChoice({
  questions: [{
    questionText: "An external rearview car mirror is convex with a radius of curvature of 16.0 m. Determine the location of the image for an object 10.0 m from the mirror.",
    options: [
      { id: 'a', text: '-4.44 m', feedback: 'Correct! For convex mirror, f = -R/2 = -8.0 m. Using 1/f = 1/do + 1/di: 1/(-8) = 1/10 + 1/di → di = -4.44 m (virtual image behind mirror)' },
      { id: 'b', text: '4.44 m', feedback: 'Incorrect. Virtual images from convex mirrors are behind the mirror (negative distance).' },
      { id: 'c', text: '-8.0 m', feedback: 'Incorrect. This is the focal length, not the image distance.' },
      { id: 'd', text: '8.0 m', feedback: 'Incorrect. Check your application of the mirror equation for a convex mirror.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a convex mirror, f = -R/2 = -16.0/2 = -8.0 m. Mirror equation: 1/f = 1/do + 1/di → 1/(-8) = 1/10 + 1/di → 1/di = -1/8 - 1/10 = -18/80 → di = -4.44 m',
    difficulty: 'intermediate',
    tags: ['convex-mirror', 'virtual-image', 'car-mirror']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 7b: Convex car mirror - magnification
exports.course2_23_unit2_q7b = createStandardMultipleChoice({
  questions: [{
    questionText: "An external rearview car mirror is convex with a radius of curvature of 16.0 m. Determine the magnification for an object 10.0 m from the mirror.",
    options: [
      { id: 'a', text: '0.44', feedback: 'Correct! M = -di/do = -(-4.44)/10.0 = 0.44. The image is upright, virtual, and smaller than the object.' },
      { id: 'b', text: '-0.44', feedback: 'Incorrect. Virtual images from convex mirrors are upright (positive magnification).' },
      { id: 'c', text: '2.25', feedback: 'Incorrect. Convex mirrors always produce smaller images (M < 1).' },
      { id: 'd', text: '0.80', feedback: 'Incorrect. Check your calculation using the image distance from the previous part.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using di = -4.44 m from the previous calculation: M = -di/do = -(-4.44)/10.0 = +0.44. Positive magnification indicates upright image, and value less than 1 indicates smaller than object.',
    difficulty: 'intermediate',
    tags: ['convex-mirror', 'magnification', 'image-size']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 8a: Refraction through glass - angle in glass
exports.course2_23_unit2_q8a = createStandardMultipleChoice({
  questions: [{
    questionText: "Light traveling in air strikes a flat piece of thick glass at an incident angle of 60°. If the index of refraction in the glass is 1.50, what is the angle of refraction in the glass?",
    options: [
      { id: 'a', text: '35.3°', feedback: 'Correct! Using Snell\'s law: n₁sinθ₁ = n₂sinθ₂ → 1.00 × sin(60°) = 1.50 × sinθ₂ → sinθ₂ = 0.866/1.50 = 0.577 → θ₂ = 35.3°' },
      { id: 'b', text: '40.0°', feedback: 'Incorrect. Check your application of Snell\'s law.' },
      { id: 'c', text: '30.0°', feedback: 'Incorrect. Make sure you are using the correct values in Snell\'s law.' },
      { id: 'd', text: '45.0°', feedback: 'Incorrect. The refracted angle should be less than the incident angle when going into a denser medium.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Snell\'s law: n₁sinθ₁ = n₂sinθ₂. Here: 1.00 × sin(60°) = 1.50 × sinθ₂ → 0.866 = 1.50 × sinθ₂ → sinθ₂ = 0.577 → θ₂ = 35.3°',
    difficulty: 'intermediate',
    tags: ['refraction', 'snells-law', 'glass']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 8b: Light emerging from glass
exports.course2_23_unit2_q8b = createStandardMultipleChoice({
  questions: [{
    questionText: "Light traveling in air strikes a flat piece of thick glass at an incident angle of 60°. What is the angle at which the ray emerges from the glass?",
    options: [
      { id: 'a', text: '60°', feedback: 'Correct! When light passes through a parallel-sided glass block, it emerges parallel to the incident ray, so the exit angle equals the incident angle.' },
      { id: 'b', text: '35.3°', feedback: 'Incorrect. This is the angle of refraction inside the glass, not the exit angle.' },
      { id: 'c', text: '0°', feedback: 'Incorrect. The light does not emerge perpendicular to the surface.' },
      { id: 'd', text: '30°', feedback: 'Incorrect. For a parallel-sided block, the exit angle equals the incident angle.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a parallel-sided glass block, the emergent ray is parallel to the incident ray. Although the ray is refracted at both surfaces, the geometry ensures the exit angle equals the incident angle of 60°.',
    difficulty: 'intermediate',
    tags: ['refraction', 'parallel-glass', 'emergence-angle']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 9: Equilateral prism
exports.course2_23_unit2_q9 = createStandardMultipleChoice({
  questions: [{
    questionText: "Light is incident on an equilateral glass prism at a 40.0° angle to one face. Calculate the angle at which light emerges from the opposite face. Assume that n = 1.58 for the prism.",
    options: [
      { id: 'a', text: '35.6°', feedback: 'Correct! This requires applying Snell\'s law at both surfaces of the prism, accounting for the 60° apex angle of the equilateral triangle.' },
      { id: 'b', text: '40.0°', feedback: 'Incorrect. A prism deviates light; the exit angle is not the same as the incident angle.' },
      { id: 'c', text: '24.1°', feedback: 'Incorrect. This might be the refracted angle at the first surface, not the final exit angle.' },
      { id: 'd', text: '60.0°', feedback: 'Incorrect. This is the apex angle of the prism, not the exit angle.' }
    ],
    correctOptionId: 'a',
    explanation: 'For an equilateral prism: First refraction: sin(θ₂) = sin(40°)/1.58 = 0.407, θ₂ = 24.1°. At second surface: θ₃ = 60° - 24.1° = 35.9°. Final emergence: sin(θ₄) = 1.58 × sin(35.9°) = 0.926, θ₄ = 35.6°',
    difficulty: 'advanced',
    tags: ['prism', 'refraction', 'snells-law']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 10: Total internal reflection
exports.course2_23_unit2_q10 = createStandardMultipleChoice({
  questions: [{
    questionText: "A beam of light is emitted 8.0 cm beneath the surface of a liquid and strikes the surface 7.0 cm from the point directly above the source. If total internal reflection occurs, what is the index of refraction of the liquid?",
    options: [
      { id: 'a', text: '1.52', feedback: 'Correct! At critical angle: sinθc = √(7²+8²)/√(7²+8²) = 7/√113 = 0.658. For TIR: sinθc = 1/n → n = 1/0.658 = 1.52' },
      { id: 'b', text: '1.33', feedback: 'Incorrect. This is the refractive index of water, but doesn\'t match this calculation.' },
      { id: 'c', text: '1.41', feedback: 'Incorrect. Check your calculation of the critical angle.' },
      { id: 'd', text: '1.73', feedback: 'Incorrect. Make sure you are calculating the angle correctly from the geometry.' }
    ],
    correctOptionId: 'a',
    explanation: 'The critical angle θc can be found from geometry: tan(θc) = 7.0/8.0, so θc = 41.2°. At the critical angle for total internal reflection: sinθc = 1/n. Therefore: n = 1/sin(41.2°) = 1/0.658 = 1.52',
    difficulty: 'advanced',
    tags: ['total-internal-reflection', 'critical-angle', 'refractive-index']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 11a: Convex lens image position
exports.course2_23_unit2_q11a = createStandardMultipleChoice({
  questions: [{
    questionText: "What is the position of the image of a 7.6 cm high flower placed 1.00 m from a convex camera lens with a focal length of 50.0 mm?",
    options: [
      { id: 'a', text: '5.26 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di: 1/50 = 1/1000 + 1/di → 1/di = 1/50 - 1/1000 = 19/1000 → di = 52.6 mm = 5.26 cm' },
      { id: 'b', text: '50.0 mm', feedback: 'Incorrect. This is the focal length, not the image distance.' },
      { id: 'c', text: '1.00 m', feedback: 'Incorrect. This is the object distance, not the image distance.' },
      { id: 'd', text: '10.0 cm', feedback: 'Incorrect. Check your calculation using the lens equation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Convert to consistent units: do = 1000 mm, f = 50.0 mm. Lens equation: 1/f = 1/do + 1/di → 1/50 = 1/1000 + 1/di → 1/di = 20/1000 - 1/1000 = 19/1000 → di = 52.6 mm = 5.26 cm',
    difficulty: 'intermediate',
    tags: ['convex-lens', 'lens-equation', 'image-distance']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 11b: Convex lens image size
exports.course2_23_unit2_q11b = createStandardMultipleChoice({
  questions: [{
    questionText: "What is the size of the image of a 7.6 cm high flower placed 1.00 m from a convex camera lens with a focal length of 50.0 mm?",
    options: [
      { id: 'a', text: '0.40 cm', feedback: 'Correct! M = -di/do = -52.6/1000 = -0.0526. Image height = |M| × object height = 0.0526 × 7.6 cm = 0.40 cm' },
      { id: 'b', text: '7.6 cm', feedback: 'Incorrect. This is the object height; the image is smaller.' },
      { id: 'c', text: '0.80 cm', feedback: 'Incorrect. Check your magnification calculation.' },
      { id: 'd', text: '1.5 cm', feedback: 'Incorrect. The magnification is much less than 1 for this configuration.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using di = 52.6 mm from previous calculation: M = -di/do = -52.6/1000 = -0.0526. Image height = |M| × object height = 0.0526 × 7.6 cm = 0.40 cm',
    difficulty: 'intermediate',
    tags: ['convex-lens', 'magnification', 'image-size']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 12a: Converging lens virtual image position
exports.course2_23_unit2_q12a = createStandardMultipleChoice({
  questions: [{
    questionText: "An object is placed 10 cm from a converging lens with a focal length of 15 cm. Determine the image position analytically.",
    options: [
      { id: 'a', text: '-30 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di: 1/15 = 1/10 + 1/di → 1/di = 1/15 - 1/10 = -1/30 → di = -30 cm (virtual image)' },
      { id: 'b', text: '30 cm', feedback: 'Incorrect. When the object is closer than the focal point, the image is virtual (negative distance).' },
      { id: 'c', text: '6 cm', feedback: 'Incorrect. Check your calculation using the lens equation.' },
      { id: 'd', text: '-6 cm', feedback: 'Incorrect. Make sure you are subtracting the fractions correctly.' }
    ],
    correctOptionId: 'a',
    explanation: 'Lens equation: 1/f = 1/do + 1/di → 1/15 = 1/10 + 1/di → 1/di = 1/15 - 1/10 = 2/30 - 3/30 = -1/30 → di = -30 cm. Negative indicates virtual image on same side as object.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'virtual-image', 'lens-equation']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 12b: Converging lens virtual image magnification
exports.course2_23_unit2_q12b = createStandardMultipleChoice({
  questions: [{
    questionText: "An object is placed 10 cm from a converging lens with a focal length of 15 cm. Determine the magnification analytically.",
    options: [
      { id: 'a', text: '3', feedback: 'Correct! M = -di/do = -(-30)/10 = 3. The positive magnification indicates an upright, virtual image that is 3 times larger.' },
      { id: 'b', text: '-3', feedback: 'Incorrect. Virtual images are upright (positive magnification).' },
      { id: 'c', text: '0.33', feedback: 'Incorrect. This would indicate a smaller image, but virtual images from converging lenses are magnified.' },
      { id: 'd', text: '1.5', feedback: 'Incorrect. Check your calculation using M = -di/do.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using di = -30 cm from the previous calculation: M = -di/do = -(-30)/10 = +3. Positive magnification means upright, and the value of 3 means the image is 3 times larger than the object.',
    difficulty: 'intermediate',
    tags: ['converging-lens', 'magnification', 'virtual-image']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 13: Diverging lens
exports.course2_23_unit2_q13 = createStandardMultipleChoice({
  questions: [{
    questionText: "Where must a small insect be placed if a diverging lens with a focal length of 25 cm is to form a virtual image that is 20 cm in front of the lens?",
    options: [
      { id: 'a', text: '100 cm', feedback: 'Correct! For diverging lens, f = -25 cm, di = -20 cm. Using 1/f = 1/do + 1/di: 1/(-25) = 1/do + 1/(-20) → 1/do = -1/25 + 1/20 = 1/100 → do = 100 cm' },
      { id: 'b', text: '50 cm', feedback: 'Incorrect. Check your calculation with the correct signs for diverging lens.' },
      { id: 'c', text: '25 cm', feedback: 'Incorrect. This is the focal length magnitude, not the object distance.' },
      { id: 'd', text: '12.5 cm', feedback: 'Incorrect. Make sure you are using the correct signs for diverging lens and virtual image.' }
    ],
    correctOptionId: 'a',
    explanation: 'For diverging lens: f = -25 cm (negative). Virtual image 20 cm in front means di = -20 cm. Lens equation: 1/f = 1/do + 1/di → 1/(-25) = 1/do + 1/(-20) → 1/do = -1/25 + 1/20 = -4/100 + 5/100 = 1/100 → do = 100 cm',
    difficulty: 'intermediate',
    tags: ['diverging-lens', 'virtual-image', 'object-position']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 14: Color appearance
exports.course2_23_unit2_q14 = createStandardMultipleChoice({
  questions: [{
    questionText: "An object appears red in white light. What colour will it appear to be if it is illuminated by cyan light?",
    options: [
      { id: 'a', text: 'Black', feedback: 'Correct! Red objects absorb cyan light (blue + green) and reflect only red. Since cyan light contains no red, nothing is reflected, so the object appears black.' },
      { id: 'b', text: 'Red', feedback: 'Incorrect. Cyan light does not contain red wavelengths for the object to reflect.' },
      { id: 'c', text: 'Cyan', feedback: 'Incorrect. The object can only reflect colors it normally reflects (red).' },
      { id: 'd', text: 'Blue', feedback: 'Incorrect. Red objects do not reflect blue light.' }
    ],
    correctOptionId: 'a',
    explanation: 'Objects appear red because they reflect red light and absorb other colors. Cyan light is blue + green (no red). Since the red object cannot reflect red from cyan light (there is no red to reflect), it appears black.',
    difficulty: 'intermediate',
    tags: ['color', 'reflection', 'absorption', 'cyan-light']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 15: Polarizing sunglasses
exports.course2_23_unit2_q15 = createStandardMultipleChoice({
  questions: [{
    questionText: "How can you tell if a pair of sunglasses is polarizing or not?",
    options: [
      { id: 'a', text: 'Look through both lenses while rotating one - if light dims and brightens, they are polarizing', feedback: 'Correct! When two polarizing filters are crossed (90° apart), they block all light. Rotating one lens while looking through both will show this effect.' },
      { id: 'b', text: 'Check if they are darker than regular sunglasses', feedback: 'Incorrect. Darkness alone does not indicate polarization.' },
      { id: 'c', text: 'See if they reduce glare from all surfaces equally', feedback: 'Incorrect. Polarizing lenses specifically reduce glare from horizontal surfaces like water and roads.' },
      { id: 'd', text: 'Look for the word "polarized" on the frame', feedback: 'Incorrect. This is not a test of the optical properties, just reading a label.' }
    ],
    correctOptionId: 'a',
    explanation: 'Polarizing filters block light waves vibrating in one plane. When two polarizing lenses are aligned (0°), light passes through. When crossed (90°), no light passes through. Rotating one lens while looking through both will alternate between light and dark.',
    difficulty: 'intermediate',
    tags: ['polarization', 'sunglasses', 'polarizing-filters']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 16: Double slit interference
exports.course2_23_unit2_q16 = createStandardMultipleChoice({
  questions: [{
    questionText: "At what angle will 560 nm light produce a second order maximum when passing through double slits that are 1.45 × 10⁻² cm apart?",
    options: [
      { id: 'a', text: '4.43°', feedback: 'Correct! For second order (m=2): dsinθ = mλ → sinθ = mλ/d = (2×560×10⁻⁹)/(1.45×10⁻⁴) = 0.0772 → θ = 4.43°' },
      { id: 'b', text: '2.21°', feedback: 'Incorrect. This would be the first order maximum (m=1).' },
      { id: 'c', text: '8.86°', feedback: 'Incorrect. Check your calculation of the angle.' },
      { id: 'd', text: '1.11°', feedback: 'Incorrect. Make sure you are using the correct order (m=2) and units.' }
    ],
    correctOptionId: 'a',
    explanation: 'For constructive interference: dsinθ = mλ. Given: m = 2, λ = 560 nm = 560×10⁻⁹ m, d = 1.45×10⁻² cm = 1.45×10⁻⁴ m. sinθ = mλ/d = (2×560×10⁻⁹)/(1.45×10⁻⁴) = 0.0772, so θ = 4.43°',
    difficulty: 'intermediate',
    tags: ['double-slit', 'interference', 'diffraction', 'wavelength']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 17: Fringe separation
exports.course2_23_unit2_q17 = createStandardMultipleChoice({
  questions: [{
    questionText: "An interference pattern is formed when light of wavelength 648 nm is directed through two slits. If the slits are 52 μm apart and the screen is 3.5 m away, what will be the separation between bright fringes?",
    options: [
      { id: 'a', text: '4.36 cm', feedback: 'Correct! Fringe separation = λL/d = (648×10⁻⁹ × 3.5)/(52×10⁻⁶) = 0.0436 m = 4.36 cm' },
      { id: 'b', text: '2.18 cm', feedback: 'Incorrect. Check your calculation of fringe separation.' },
      { id: 'c', text: '8.72 cm', feedback: 'Incorrect. Make sure you are using the correct formula and units.' },
      { id: 'd', text: '1.45 cm', feedback: 'Incorrect. Verify your conversion of units.' }
    ],
    correctOptionId: 'a',
    explanation: 'Fringe separation Δy = λL/d where λ = 648×10⁻⁹ m, L = 3.5 m, d = 52×10⁻⁶ m. Δy = (648×10⁻⁹ × 3.5)/(52×10⁻⁶) = 0.0436 m = 4.36 cm',
    difficulty: 'intermediate',
    tags: ['interference', 'fringe-separation', 'double-slit']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

// Question 18: Diffraction grating
exports.course2_23_unit2_q18 = createStandardMultipleChoice({
  questions: [{
    questionText: "A 3500 line/cm grating produces a third-order fringe at a 28.0° angle. What wavelength of light is being used?",
    options: [
      { id: 'a', text: '447 nm', feedback: 'Correct! d = 1/(3500×100) = 2.86×10⁻⁶ m. Using dsinθ = mλ: λ = dsinθ/m = (2.86×10⁻⁶ × sin28°)/3 = 447 nm' },
      { id: 'b', text: '589 nm', feedback: 'Incorrect. Check your calculation of the grating spacing and wavelength.' },
      { id: 'c', text: '671 nm', feedback: 'Incorrect. Make sure you are using the correct order (m=3).' },
      { id: 'd', text: '334 nm', feedback: 'Incorrect. Verify your conversion of lines/cm to spacing in meters.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find d: d = 1/(3500 lines/cm) = 1/(3.5×10⁵ lines/m) = 2.86×10⁻⁶ m. Then: dsinθ = mλ → λ = dsinθ/m = (2.86×10⁻⁶ × sin28°)/3 = 447×10⁻⁹ m = 447 nm',
    difficulty: 'intermediate',
    tags: ['diffraction-grating', 'wavelength', 'orders']
  }],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});