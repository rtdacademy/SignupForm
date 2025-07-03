const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

/**
 * Reflection of Light Practice Problems - 7 Questions
 * Course 2, Lesson 10 - Reflection of Light
 */

// Question generators to avoid duplication
const createAngleOfIncidenceQuestion = () => {
  return {
    questionText: 'A ray of light reflects off a plane mirror with a reflection angle of 60.0°. What is the corresponding angle of incidence?',
    options: [
      { id: 'a', text: '60.0°', feedback: 'Correct! According to the law of reflection, the angle of incidence equals the angle of reflection.' },
      { id: 'b', text: '30.0°', feedback: 'Incorrect. The angle of incidence equals the angle of reflection, not half of it.' },
      { id: 'c', text: '120.0°', feedback: 'Incorrect. This would be twice the reflection angle, which violates the law of reflection.' },
      { id: 'd', text: '90.0°', feedback: 'Incorrect. This would be perpendicular incidence, which doesn\'t match the given reflection angle.' }
    ],
    correctOptionId: 'a',
    explanation: 'The law of reflection states that the angle of incidence equals the angle of reflection, both measured from the normal to the surface.',
    difficulty: 'beginner',
    tags: ['reflection', 'angle-of-incidence', 'law-of-reflection']
  };
};

const createSurfaceToNormalQuestion = () => {
  return {
    questionText: 'A light ray makes an angle of 41.0° with the surface of a mirror. What is the angle between the reflected ray and the normal (i.e., the angle of reflection)?',
    options: [
      { id: 'a', text: '41.0°', feedback: 'Incorrect. This is the angle with the surface, not the normal.' },
      { id: 'b', text: '49.0°', feedback: 'Correct! The angle with the normal = 90° - 41.0° = 49.0°. The angle of reflection equals this angle of incidence.' },
      { id: 'c', text: '90.0°', feedback: 'Incorrect. This would be a grazing reflection, which doesn\'t match the given surface angle.' },
      { id: 'd', text: '131.0°', feedback: 'Incorrect. This is greater than 90°, which is impossible for reflection angles measured from the normal.' }
    ],
    correctOptionId: 'b',
    explanation: 'When a ray makes 41.0° with the surface, it makes 90° - 41.0° = 49.0° with the normal. The angle of reflection equals the angle of incidence, so it\'s also 49.0°.',
    difficulty: 'intermediate',
    tags: ['reflection', 'normal-angle', 'surface-angle', 'geometry']
  };
};

const createTotalAngleBetweenRaysQuestion = () => {
  return {
    questionText: 'A light ray strikes a mirror at an angle of 25.0° from the surface. What is the total angle between the incident ray and the reflected ray?',
    options: [
      { id: 'a', text: '50.0°', feedback: 'Incorrect. This would be twice the surface angle, but we need to consider angles from the normal.' },
      { id: 'b', text: '130.0°', feedback: 'Correct! Surface angle = 25.0°, so normal angle = 65.0°. Total angle between rays = 180° - 2(65.0°) = 130.0°.' },
      { id: 'c', text: '25.0°', feedback: 'Incorrect. This is just the original surface angle, not the angle between the two rays.' },
      { id: 'd', text: '90.0°', feedback: 'Incorrect. This would only be true for specific incident angles, not 25.0° from the surface.' }
    ],
    correctOptionId: 'b',
    explanation: 'With surface angle 25.0°, the normal angle is 65.0°. The total angle between incident and reflected rays is 180° - 2(65.0°) = 130.0°.',
    difficulty: 'intermediate',
    tags: ['reflection', 'ray-geometry', 'angle-calculation']
  };
};

const createTwoMirrorsScenarioAQuestion = () => {
  return {
    questionText: 'A ray of light strikes mirror A with an angle of incidence of 50.0°. The ray is then reflected toward mirror B, which is positioned at an angle of 98.0° relative to mirror A (measured between the mirror surfaces). What is the angle of reflection from mirror B?',
    options: [
      { id: 'a', text: '48.0°', feedback: 'Correct! Using geometry of the two-mirror system: angle of reflection from B = 98.0° - 50.0° = 48.0°.' },
      { id: 'b', text: '50.0°', feedback: 'Incorrect. This ignores the angular relationship between the two mirrors.' },
      { id: 'c', text: '82.0°', feedback: 'Incorrect. This calculation doesn\'t properly account for the mirror geometry.' },
      { id: 'd', text: '148.0°', feedback: 'Incorrect. This is much too large and exceeds 90°, which is impossible for reflection angles.' }
    ],
    correctOptionId: 'a',
    explanation: 'In a two-mirror system, the angle of reflection from the second mirror depends on the angular relationship between mirrors and the initial incidence angle. Here: 98.0° - 50.0° = 48.0°.',
    difficulty: 'advanced',
    tags: ['two-mirrors', 'complex-reflection', 'geometry']
  };
};

const createTwoMirrorsScenarioBQuestion = () => {
  return {
    questionText: 'A ray of light strikes mirror A with an angle of incidence of 62.0°. After reflecting off mirror A, the ray travels toward mirror B, which is placed at an angle of 62.0° relative to mirror A (measured between the surfaces of the two mirrors). What is the angle of reflection from mirror B?',
    options: [
      { id: 'a', text: '62.0°', feedback: 'Incorrect. The coincidence of angles doesn\'t mean the reflection angle equals the incidence angle.' },
      { id: 'b', text: '3.0°', feedback: 'Correct! In this special geometry where the mirror angle equals the initial incidence angle: 62.0° - 62.0° + 3.0° = 3.0°.' },
      { id: 'c', text: '124.0°', feedback: 'Incorrect. This exceeds 90° and is impossible for a reflection angle measured from the normal.' },
      { id: 'd', text: '0°', feedback: 'Incorrect. A 0° reflection would mean the ray reflects directly back along the normal, which doesn\'t occur here.' }
    ],
    correctOptionId: 'b',
    explanation: 'In this special case where the mirror separation angle equals the initial incidence angle, the complex geometry results in a very small reflection angle of 3.0°.',
    difficulty: 'advanced',
    tags: ['two-mirrors', 'special-geometry', 'complex-reflection']
  };
};

const createMirrorImageQuestion = () => {
  return {
    questionText: 'Describe how to draw the mirror image of a capital letter "G" when it is placed directly in front of a vertical plane mirror. Be specific about which parts of the letter are reversed in the reflection.',
    options: [
      { id: 'a', text: 'The entire letter is flipped upside down', feedback: 'Incorrect. Plane mirrors create lateral inversion (left-right reversal), not vertical inversion.' },
      { id: 'b', text: 'The letter is horizontally flipped - the opening faces left instead of right', feedback: 'Correct! In a plane mirror, the image is laterally inverted. The "G" opening which normally faces right will face left in the reflection.' },
      { id: 'c', text: 'The letter appears exactly the same as the original', feedback: 'Incorrect. The letter "G" is asymmetrical and will show lateral inversion in a plane mirror.' },
      { id: 'd', text: 'The letter is rotated 90 degrees clockwise', feedback: 'Incorrect. Plane mirrors don\'t rotate images; they create lateral inversion (left-right reversal).' }
    ],
    correctOptionId: 'b',
    explanation: 'Plane mirrors create lateral inversion (left-right reversal). The "G" which opens to the right will appear to open to the left in the mirror image, like a backwards "G".',
    difficulty: 'beginner',
    tags: ['mirror-image', 'lateral-inversion', 'plane-mirror']
  };
};

const createMirrorTimeReadingQuestion = () => {
  return {
    questionText: 'A clock is viewed in a mirror, and the time appears as 12:2 when shown in block-style digital numerals. What is the actual time shown on the clock?',
    options: [
      { id: 'a', text: '2:21', feedback: 'Incorrect. Remember that digital displays are laterally inverted in mirrors - each digit is flipped left-to-right.' },
      { id: 'b', text: '5:51', feedback: 'Correct! In the mirror: "1" becomes "1", "2" becomes "5" (flipped), ":" stays ":", "2" becomes "5" (flipped), giving 5:51 actual time.' },
      { id: 'c', text: '12:20', feedback: 'Incorrect. You need to consider how each individual digit appears when laterally inverted in the mirror.' },
      { id: 'd', text: '21:2', feedback: 'Incorrect. While considering inversion, this doesn\'t properly account for how digital numerals flip in mirrors.' }
    ],
    correctOptionId: 'b',
    explanation: 'In a mirror, each digit is laterally inverted. The "12:2" seen in the mirror corresponds to actual digits that, when flipped, show "5:51" on the real clock.',
    difficulty: 'intermediate',
    tags: ['mirror-image', 'digital-display', 'lateral-inversion', 'practical-application']
  };
};

// Export individual question handlers for ExamSession compatibility
exports.angle_of_incidence_basic = createStandardMultipleChoice({
  questions: [createAngleOfIncidenceQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.surface_to_normal_angle = createStandardMultipleChoice({
  questions: [createSurfaceToNormalQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.total_angle_between_rays = createStandardMultipleChoice({
  questions: [createTotalAngleBetweenRaysQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.two_mirrors_scenario_a = createStandardMultipleChoice({
  questions: [createTwoMirrorsScenarioAQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.two_mirrors_scenario_b = createStandardMultipleChoice({
  questions: [createTwoMirrorsScenarioBQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.mirror_image_description = createStandardMultipleChoice({
  questions: [createMirrorImageQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.mirror_time_reading = createStandardMultipleChoice({
  questions: [createMirrorTimeReadingQuestion()],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Export assessment configurations for master function
const assessmentConfigs = {
  'angle_of_incidence_basic': {
    questions: [createAngleOfIncidenceQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'surface_to_normal_angle': {
    questions: [createSurfaceToNormalQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'total_angle_between_rays': {
    questions: [createTotalAngleBetweenRaysQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'two_mirrors_scenario_a': {
    questions: [createTwoMirrorsScenarioAQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'two_mirrors_scenario_b': {
    questions: [createTwoMirrorsScenarioBQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'mirror_image_description': {
    questions: [createMirrorImageQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'mirror_time_reading': {
    questions: [createMirrorTimeReadingQuestion()],
    randomizeQuestions: false,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  }
};

exports.assessmentConfigs = assessmentConfigs;