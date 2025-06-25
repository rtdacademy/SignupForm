const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

// Optics and Reflection Questions - L5-7 Assignment
const questions = [
  // Pinhole Camera Calculation
  {
    questionText: "A pinhole camera is a device that consists of a light-proof box with a pinhole punched into one end and a screen of some kind on the other. An image is formed on the screen from light travelling in straight lines from the object through the pinhole. What is the size of the image of a person that is 1.90 m tall and is standing 7.5 m from a pinhole camera that is 25 cm long?",
    options: [
      { id: 'a', text: '5.2 cm', feedback: 'Incorrect. Use similar triangles: image height/camera length = object height/object distance.' },
      { id: 'b', text: '6.3 cm', feedback: 'Correct! Using similar triangles: hi/0.25 = 1.90/7.5, so hi = 6.3 cm.' },
      { id: 'c', text: '7.6 cm', feedback: 'Incorrect. Check your calculation using the pinhole camera formula.' },
      { id: 'd', text: '8.1 cm', feedback: 'Incorrect. Remember to convert units consistently (camera length in meters or height in cm).' }
    ],
    correctOptionId: 'b',
    explanation: 'Using similar triangles for pinhole cameras: image height/camera length = object height/object distance. So hi/0.25 m = 1.90 m/7.5 m, giving hi = 0.063 m = 6.3 cm.',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'optics', 'similar-triangles']
  },

  // Pinhole Camera Image Formation
  {
    questionText: "A pinhole camera forms an image of a person on a screen at the back of a light-proof box. Which statement best explains why the image is inverted?",
    options: [
      { id: 'a', text: 'The light bends as it passes through the pinhole, flipping the image.', feedback: 'Incorrect. Light travels in straight lines through the pinhole - no bending occurs.' },
      { id: 'b', text: 'Light rays from the top and bottom of the object cross at the pinhole and continue in straight lines.', feedback: 'Correct! Light travels in straight lines, so rays from the top cross to the bottom and vice versa.' },
      { id: 'c', text: 'The screen reflects the image, causing it to flip.', feedback: 'Incorrect. The screen only receives the image - it doesn\'t flip it.' },
      { id: 'd', text: 'The screen is curved, which changes the orientation of the image.', feedback: 'Incorrect. Pinhole cameras typically use flat screens, and curvature wouldn\'t cause inversion.' }
    ],
    correctOptionId: 'b',
    explanation: 'In a pinhole camera, light travels in straight lines. Rays from the top of the object pass through the pinhole and hit the bottom of the screen, while rays from the bottom hit the top, creating an inverted image.',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'image-formation', 'light-rays']
  },

  // Römer's Speed of Light Measurement
  {
    questionText: "Olaf Römer noticed that the time when one of Jupiter's moons was eclipsed by the planet changed depending on the season in which the measurement was taken. When the Earth was closest to Jupiter compared to when the Earth was furthest away from Jupiter (on the other side of the Sun), there was a 1320 s difference. Römer correctly interpreted this observation to be the effect of the increased distance that light had to travel to reach the Earth. If the Earth's mean radius of orbit is 1.5 × 10¹¹ m, what is the speed of light that Römer measured?",
    options: [
      { id: 'a', text: '1.9 × 10⁸ m/s', feedback: 'Incorrect. Check your calculation of the distance difference and time.' },
      { id: 'b', text: '2.3 × 10⁸ m/s', feedback: 'Correct! Distance difference = 2 × orbital radius = 3.0 × 10¹¹ m. Speed = distance/time = 3.0 × 10¹¹ m / 1320 s = 2.3 × 10⁸ m/s.' },
      { id: 'c', text: '2.8 × 10⁸ m/s', feedback: 'Incorrect. The distance difference is twice the orbital radius, not just the radius.' },
      { id: 'd', text: '3.0 × 10⁸ m/s', feedback: 'Incorrect. This is close to the modern value, but Römer\'s measurement was less accurate due to the approximations used.' }
    ],
    correctOptionId: 'b',
    explanation: 'The distance difference between Earth closest and furthest from Jupiter is twice the orbital radius (diameter of Earth\'s orbit) = 2 × 1.5 × 10¹¹ = 3.0 × 10¹¹ m. Speed of light = distance/time = 3.0 × 10¹¹ m / 1320 s = 2.3 × 10⁸ m/s.',
    difficulty: 'advanced',
    tags: ['speed-of-light', 'astronomy', 'historical-measurement']
  },

  // Michelson Speed of Light Apparatus
  {
    questionText: "Using the Michelson-like apparatus diagrammed below, the observer found that in order to observe the return light ray, the mirror had to rotate at 707.1 Hz. The distance to the stationary reflecting mirror is 35 km. What is the speed of light calculated from this experiment?",
    options: [
      { id: 'a', text: '2.65 × 10⁸ m/s', feedback: 'Incorrect. Check your calculation of the total distance and rotation time.' },
      { id: 'b', text: '2.97 × 10⁸ m/s', feedback: 'Correct! Total distance = 2 × 35 km = 70 km. Time = 1/(6 × 707.1 Hz) for 1/6 rotation. Speed = 70,000 m / (1/4242.6 s) = 2.97 × 10⁸ m/s.' },
      { id: 'c', text: '3.15 × 10⁸ m/s', feedback: 'Incorrect. Remember the light travels to the mirror and back, doubling the distance.' },
      { id: 'd', text: '3.42 × 10⁸ m/s', feedback: 'Incorrect. Check the geometry of the rotating six-sided mirror and the time calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Light travels 35 km to the mirror and 35 km back = 70 km total. The six-sided mirror rotates 1/6 of a turn in time t = 1/(6 × 707.1) s. Speed = distance/time = 70,000 m / (1/4242.6 s) = 2.97 × 10⁸ m/s.',
    difficulty: 'advanced',
    tags: ['speed-of-light', 'michelson-apparatus', 'experimental-physics']
  },

  // Angle of Reflection
  {
    questionText: "The angle between a ray and the mirror is 40 degrees. What is the angle of reflection?",
    options: [
      { id: 'a', text: '40°', feedback: 'Incorrect. The angle between the ray and mirror is not the same as the angle of incidence.' },
      { id: 'b', text: '50°', feedback: 'Correct! If the ray makes 40° with the mirror, then the angle of incidence is 90° - 40° = 50°. The angle of reflection equals the angle of incidence.' },
      { id: 'c', text: '90°', feedback: 'Incorrect. This would be perpendicular reflection, which only occurs for normal incidence.' },
      { id: 'd', text: '130°', feedback: 'Incorrect. Angles of incidence and reflection are always measured from the normal, not from the surface.' }
    ],
    correctOptionId: 'b',
    explanation: 'Angles of incidence and reflection are measured from the normal (perpendicular) to the surface. If the ray makes 40° with the mirror surface, the angle of incidence is 90° - 40° = 50°. By the law of reflection, the angle of reflection equals the angle of incidence = 50°.',
    difficulty: 'beginner',
    tags: ['reflection', 'angles', 'law-of-reflection']
  },

  // Double Mirror Reflection
  {
    questionText: "Light strikes mirror A at an angle of 20 degrees to the mirror. The corners of mirror A and mirror B meet at 130 degrees. Find the angle of reflection from mirror B.",
    options: [
      { id: 'a', text: '20°', feedback: 'Incorrect. The light undergoes two reflections, changing direction at each mirror.' },
      { id: 'b', text: '50°', feedback: 'Incorrect. Consider both reflections and the geometry of the mirror arrangement.' },
      { id: 'c', text: '60°', feedback: 'Correct! After reflection from mirror A (angle = 70° from normal), the ray hits mirror B. Due to the 130° geometry, the angle of reflection from mirror B is 60°.' },
      { id: 'd', text: '70°', feedback: 'Incorrect. This is the angle of reflection from mirror A, not mirror B.' }
    ],
    correctOptionId: 'c',
    explanation: 'Light hits mirror A at 20° to the surface, so 70° from the normal. After reflection, it travels 70° from the normal. Due to the 130° angle between mirrors, when this ray hits mirror B, the geometry results in a 60° angle of reflection.',
    difficulty: 'advanced',
    tags: ['reflection', 'multiple-mirrors', 'geometry']
  },

  // Concave Mirror - Object at 14 cm
  {
    questionText: "An object which is 5 cm tall is placed 14 cm in front of a concave mirror which has a radius of 10 cm. What is the image distance?",
    options: [
      { id: 'a', text: '6.8 cm', feedback: 'Incorrect. Check your calculation using the mirror equation 1/f = 1/do + 1/di.' },
      { id: 'b', text: '7.8 cm', feedback: 'Correct! Using 1/f = 1/do + 1/di where f = R/2 = 5 cm: 1/5 = 1/14 + 1/di, solving gives di = 7.8 cm.' },
      { id: 'c', text: '8.9 cm', feedback: 'Incorrect. Remember that focal length f = R/2 for spherical mirrors.' },
      { id: 'd', text: '10.2 cm', feedback: 'Incorrect. Check your arithmetic in the mirror equation solution.' }
    ],
    correctOptionId: 'b',
    explanation: 'For a concave mirror, f = R/2 = 10/2 = 5 cm. Using the mirror equation: 1/f = 1/do + 1/di, so 1/5 = 1/14 + 1/di. Solving: 1/di = 1/5 - 1/14 = 14/70 - 5/70 = 9/70, so di = 70/9 = 7.8 cm.',
    difficulty: 'intermediate',
    tags: ['concave-mirror', 'mirror-equation', 'image-distance']
  },

  // Convex Mirror Calculation
  {
    questionText: "An object which is 5 cm tall is placed 14 cm in front of a convex mirror which has a radius of 10 cm. What is the image distance?",
    options: [
      { id: 'a', text: '-2.8 cm', feedback: 'Incorrect. Check your focal length - for convex mirrors, f is negative.' },
      { id: 'b', text: '-3.68 cm', feedback: 'Correct! For convex mirror, f = -R/2 = -5 cm. Using 1/f = 1/do + 1/di: 1/(-5) = 1/14 + 1/di, solving gives di = -3.68 cm.' },
      { id: 'c', text: '-4.2 cm', feedback: 'Incorrect. Check your arithmetic in solving the mirror equation.' },
      { id: 'd', text: '+3.68 cm', feedback: 'Incorrect. For convex mirrors, the image distance is always negative (virtual image).' }
    ],
    correctOptionId: 'b',
    explanation: 'For a convex mirror, f = -R/2 = -10/2 = -5 cm (negative because it\'s convex). Using 1/f = 1/do + 1/di: 1/(-5) = 1/14 + 1/di. Solving: 1/di = -1/5 - 1/14 = -14/70 - 5/70 = -19/70, so di = -70/19 = -3.68 cm.',
    difficulty: 'intermediate',
    tags: ['convex-mirror', 'mirror-equation', 'virtual-image']
  },

  // Mirror Type Identification
  {
    questionText: "The inverted image of an object is a quarter the size of the object. If the object is 30 cm from the mirror, what kind of mirror is it?",
    options: [
      { id: 'a', text: 'Plane mirror', feedback: 'Incorrect. Plane mirrors always produce images the same size as the object.' },
      { id: 'b', text: 'Concave mirror', feedback: 'Correct! Only concave mirrors can produce real, inverted, smaller images when the object is beyond the center of curvature.' },
      { id: 'c', text: 'Convex mirror', feedback: 'Incorrect. Convex mirrors always produce virtual, upright, smaller images.' },
      { id: 'd', text: 'Cannot determine', feedback: 'Incorrect. The fact that the image is inverted and smaller gives enough information to identify the mirror type.' }
    ],
    correctOptionId: 'b',
    explanation: 'An inverted image that is smaller than the object can only be formed by a concave mirror when the object is placed beyond the center of curvature. Convex mirrors always form upright images, and plane mirrors form same-size images.',
    difficulty: 'intermediate',
    tags: ['mirror-type', 'image-characteristics', 'concave-mirror']
  },

  // Emergency Vehicle Letters
  {
    questionText: "Which of the following best explains why letters on emergency vehicles (like ambulances) are written in reverse?",
    options: [
      { id: 'a', text: 'Plane mirrors invert objects vertically.', feedback: 'Incorrect. Plane mirrors do not invert images vertically - they appear upright.' },
      { id: 'b', text: 'Plane mirrors reverse images from left to right.', feedback: 'Correct! Plane mirrors create lateral inversion, so reversed text appears normal when viewed in a rearview mirror.' },
      { id: 'c', text: 'Plane mirrors rotate images 180°.', feedback: 'Incorrect. Plane mirrors do not rotate images - they create lateral inversion only.' },
      { id: 'd', text: 'Plane mirrors make images appear larger.', feedback: 'Incorrect. Plane mirrors produce images the same size as the object.' }
    ],
    correctOptionId: 'b',
    explanation: 'Plane mirrors create lateral inversion (left-right reversal). By writing text in reverse on the ambulance, it appears correctly oriented when drivers view it in their rearview mirrors, making "AMBULANCE" readable instead of "ƎƆИA⅃UᙠMA".',
    difficulty: 'beginner',
    tags: ['plane-mirror', 'lateral-inversion', 'practical-application']
  }
];

// Export individual question handlers for ExamSession compatibility
exports.course2_12_l57_question1 = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question2 = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question3 = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question4 = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question5 = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question6 = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question7 = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question8 = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question9 = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});

exports.course2_12_l57_question10 = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'assignment',
  maxAttempts: 1,
  pointsValue: 1
});