const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
// This determines which default settings are used from course-config.json
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

/**
 * Introduction to Light Practice Problems - 17 Questions
 * Course 2, Lesson 09 - Introduction to Light
 */

// Define all questions in a central array to avoid duplication
const questions = [
  // Question 0: Object distance calculation
  {
    questionText: 'Calculate the distance from the pinhole to an object that is 3.5 m high and whose image is 10 cm high in the pinhole camera which is 20 cm long.',
    options: [
      { id: 'a', text: '5.0 m', feedback: 'Incorrect. Check your similar triangles setup: object height / distance to object = image height / camera length.' },
      { id: 'b', text: '7.0 m', feedback: 'Correct! Using similar triangles: 3.5 m / d = 0.10 m / 0.20 m. Solving: d = (3.5 × 0.20) / 0.10 = 7.0 m' },
      { id: 'c', text: '8.5 m', feedback: 'Incorrect. You may have made an error in your calculation. Remember: d = (object height × camera length) / image height.' },
      { id: 'd', text: '10.0 m', feedback: 'Incorrect. This would be correct if the image were 7 cm high, but it is 10 cm high.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using similar triangles: object height / distance to object = image height / camera length. So: 3.5 m / d = 0.10 m / 0.20 m. Solving: d = (3.5 × 0.20) / 0.10 = 7.0 m',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'similar-triangles', 'optics']
  },

  // Question 1: Building height calculation
  {
    questionText: 'Calculate the height of a building 300 m away from a pinhole camera that produces a 3.0 cm high image in a pinhole camera that is 5.0 cm long.',
    options: [
      { id: 'a', text: '1.2 × 10² m', feedback: 'Incorrect. You may have made an error in your calculation. Check the ratio setup.' },
      { id: 'b', text: '1.5 × 10² m', feedback: 'Incorrect. This would be correct if the camera were 6.0 cm long.' },
      { id: 'c', text: '1.8 × 10² m', feedback: 'Correct! Using similar triangles: h / 300 m = 0.030 m / 0.050 m. Solving: h = (0.030 × 300) / 0.050 = 180 m = 1.8 × 10² m' },
      { id: 'd', text: '2.1 × 10² m', feedback: 'Incorrect. You may have made an error converting units or in your calculation.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using similar triangles: building height / distance = image height / camera length. So: h / 300 m = 0.030 m / 0.050 m. Solving: h = (0.030 × 300) / 0.050 = 180 m = 1.8 × 10² m',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'similar-triangles', 'optics']
  },

  // Question 2: Shadow size calculation
  {
    questionText: 'A pinhole source of light shines on a card that is 5.0 cm tall located 25 cm from the light source. What is the size of shadow formed on the wall 75 cm behind the card?',
    options: [
      { id: 'a', text: '15 cm', feedback: 'Incorrect. Remember that the total distance from source to wall is 25 + 75 = 100 cm.' },
      { id: 'b', text: '20 cm', feedback: 'Correct! Using similar triangles: 5.0 cm / 25 cm = shadow height / 100 cm. Solving: shadow height = (5.0 × 100) / 25 = 20 cm' },
      { id: 'c', text: '25 cm', feedback: 'Incorrect. This would be the shadow size if the wall were 100 cm behind the card.' },
      { id: 'd', text: '30 cm', feedback: 'Incorrect. You may have made an error in setting up the proportion.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using similar triangles: card height / distance from source to card = shadow height / total distance from source to wall. So: 5.0 cm / 25 cm = shadow height / (25 + 75) cm. Solving: shadow height = (5.0 × 100) / 25 = 20 cm',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'shadows', 'similar-triangles', 'optics']
  },

  // Question 3: Shadow area calculation
  {
    questionText: 'A coin with a diameter of 2.0 cm is illuminated from a centered point source of light 5.0 cm away. What is the area of the shadow on a screen 20 cm from the light source?',
    options: [
      { id: 'a', text: '28.3 cm²', feedback: 'Incorrect. This would be the area if the shadow diameter were 6.0 cm.' },
      { id: 'b', text: '50.2 cm²', feedback: 'Correct! Shadow diameter = (2.0 × 20) / 5.0 = 8.0 cm. Area = π(d/2)² = π(4.0)² = 50.2 cm²' },
      { id: 'c', text: '78.5 cm²', feedback: 'Incorrect. This would be the area if the shadow diameter were 10.0 cm.' },
      { id: 'd', text: '113 cm²', feedback: 'Incorrect. This would be the area if the shadow diameter were 12.0 cm.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using similar triangles: coin diameter / distance to coin = shadow diameter / distance to screen. So: 2.0 cm / 5.0 cm = shadow diameter / 20 cm. Shadow diameter = (2.0 × 20) / 5.0 = 8.0 cm. Area = π(d/2)² = π(4.0)² = 50.2 cm²',
    difficulty: 'intermediate',
    tags: ['pinhole-camera', 'shadows', 'area-calculation', 'similar-triangles', 'optics']
  },

  // Question 4: Fence shadow calculation
  {
    questionText: 'A street lamp is 10.0 m tall and is situated 15 m from a 1.0 m high fence. How long will the fence\'s shadow be?',
    options: [
      { id: 'a', text: '1.2 m', feedback: 'Incorrect. Check your setup of similar triangles. The lamp, fence, and shadow tip form similar triangles.' },
      { id: 'b', text: '1.5 m', feedback: 'Incorrect. This would be correct if the fence were 0.9 m high.' },
      { id: 'c', text: '1.7 m', feedback: 'Correct! Set up similar triangles: 10.0 m / (15 m + s) = 1.0 m / s. Cross multiply: 10s = 15 + s, so 9s = 15, s = 1.7 m' },
      { id: 'd', text: '2.0 m', feedback: 'Incorrect. You may have made an error in solving the equation.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using similar triangles: lamp height / total distance = fence height / shadow length. The light ray creates similar triangles. Setting up: 10.0 m / (15 m + shadow length) = 1.0 m / shadow length. Cross multiply: 10.0 × shadow length = 1.0 × (15 + shadow length). Solving: 10s = 15 + s, so 9s = 15, s = 1.7 m',
    difficulty: 'intermediate',
    tags: ['similar-triangles', 'shadows', 'optics']
  },

  // Question 5: Six-sided mirror speed of light calculation
  {
    questionText: 'In a Michelson method to measure the speed of light a six-sided rotating mirror assembly was used. The minimum frequency of rotation for a successful reading was 54.15 Hz. If the reflecting mirror was 450 km from the rotating mirror, calculate the speed of light.',
    options: [
      { id: 'a', text: '2.92 × 10⁸ m/s', feedback: 'Correct! Using v = 2df/n where n = 6 sides: v = 2 × 450,000 m × 54.15 Hz / (1/6) = 2.92 × 10⁸ m/s' },
      { id: 'b', text: '3.00 × 10⁸ m/s', feedback: 'This is the accepted value, but check your calculation. The experimental result should be slightly different.' },
      { id: 'c', text: '2.44 × 10⁸ m/s', feedback: 'Too low. Check that you\'re using the correct formula: v = 2df × n where n is the number of sides.' },
      { id: 'd', text: '3.50 × 10⁸ m/s', feedback: 'Too high. Remember that the mirror rotates 1/6 of a turn during the light\'s round trip.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a six-sided mirror, it must rotate 1/6 revolution during light\'s round trip. Using v = 2df × n: v = 2 × 450,000 m × 54.15 Hz × 6 = 2.92 × 10⁸ m/s',
    difficulty: 'advanced',
    tags: ['michelson-method', 'speed-of-light', 'rotating-mirror']
  },

  // Question 6: Eight-sided mirror frequency calculation
  {
    questionText: 'What is the approximate frequency in Hertz for an eight-sided Michelson\'s rotating mirror in order to produce a successful experiment when the fixed mirror is 51.52 km away?',
    options: [
      { id: 'a', text: '291 Hz', feedback: 'Too low. Check your calculation using the speed of light formula.' },
      { id: 'b', text: '364 Hz', feedback: 'Correct! Using f = v/(2dn) where v = 3.00 × 10⁸ m/s: f = 3.00 × 10⁸ / (2 × 51,520 × 8) = 364 Hz' },
      { id: 'c', text: '455 Hz', feedback: 'Too high. Remember to use n = 8 sides in your calculation.' },
      { id: 'd', text: '728 Hz', feedback: 'Much too high. Check that you\'re dividing by the number of sides, not multiplying.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using f = v/(2dn) where v = 3.00 × 10⁸ m/s, d = 51,520 m, n = 8: f = 3.00 × 10⁸ / (2 × 51,520 × 8) = 364 Hz',
    difficulty: 'advanced',
    tags: ['michelson-method', 'frequency-calculation', 'rotating-mirror']
  },

  // Question 7: Pentagonal mirror frequency calculation
  {
    questionText: 'When verifying the speed of light, a student set up a pentagonal rotating mirror and a reflecting mirror 35 km away. At what minimum frequency must the mirror rotate so that the reflected light is seen by the observer?',
    options: [
      { id: 'a', text: '714 Hz', feedback: 'Close, but check your calculation. Remember n = 5 for a pentagon.' },
      { id: 'b', text: '857 Hz', feedback: 'Correct! Using f = v/(2dn) where n = 5: f = 3.00 × 10⁸ / (2 × 35,000 × 5) = 857 Hz' },
      { id: 'c', text: '1071 Hz', feedback: 'Too high. Check that you\'re using the correct number of sides (5) for a pentagon.' },
      { id: 'd', text: '1200 Hz', feedback: 'Much too high. Verify your formula and calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using f = v/(2dn) where v = 3.00 × 10⁸ m/s, d = 35,000 m, n = 5: f = 3.00 × 10⁸ / (2 × 35,000 × 5) = 857 Hz',
    difficulty: 'advanced',
    tags: ['michelson-method', 'pentagonal-mirror', 'frequency-calculation']
  },

  // Question 8: Twelve-sided mirror distance calculation
  {
    questionText: 'A student sets up a Michelson-type experiment for a twelve-sided rotating mirror. If the mirror spun at a rate of 125 Hz, how far was the rotating mirror from the stationary reflecting mirror?',
    options: [
      { id: 'a', text: '83.3 km', feedback: 'Too low. Check your calculation using d = v/(2fn).' },
      { id: 'b', text: '100 km', feedback: 'Correct! Using d = v/(2fn) where n = 12: d = 3.00 × 10⁸ / (2 × 125 × 12) = 100,000 m = 100 km' },
      { id: 'c', text: '120 km', feedback: 'Too high. Verify that you\'re using n = 12 sides correctly.' },
      { id: 'd', text: '150 km', feedback: 'Much too high. Check your formula and calculation.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using d = v/(2fn) where v = 3.00 × 10⁸ m/s, f = 125 Hz, n = 12: d = 3.00 × 10⁸ / (2 × 125 × 12) = 100,000 m = 100 km',
    difficulty: 'advanced',
    tags: ['michelson-method', 'distance-calculation', 'twelve-sided-mirror']
  },

  // Question 9: Space station radio signal
  {
    questionText: 'A radio signal is sent from Earth to a space station orbiting at a distance of 450 km. How long does it take for the signal to reach the space station?',
    options: [
      { id: 'a', text: '1.5 × 10⁻³ s', feedback: 'Correct! Using t = d/c: t = 450,000 m / (3.00 × 10⁸ m/s) = 1.5 × 10⁻³ s' },
      { id: 'b', text: '1.5 × 10⁻⁶ s', feedback: 'Too small. Check your unit conversion - 450 km = 450,000 m.' },
      { id: 'c', text: '1.5 × 10⁰ s', feedback: 'Too large. Remember that electromagnetic waves travel at the speed of light.' },
      { id: 'd', text: '4.5 × 10⁻³ s', feedback: 'Incorrect calculation. Double-check your division: 450,000 ÷ 300,000,000.' }
    ],
    correctOptionId: 'a',
    explanation: 'Time = distance / speed. Converting 450 km to 450,000 m, then t = 450,000 m / (3.00 × 10⁸ m/s) = 1.5 × 10⁻³ s',
    difficulty: 'intermediate',
    tags: ['speed-of-light', 'time-calculation', 'space-communication']
  },

  // Question 10: Light travel three years
  {
    questionText: 'How far does light travel in 3.0 years?',
    options: [
      { id: 'a', text: '2.8 × 10¹⁶ m', feedback: 'Correct! Using d = ct: d = (3.00 × 10⁸ m/s) × (3.0 × 365 × 24 × 3600 s) = 2.8 × 10¹⁶ m' },
      { id: 'b', text: '9.0 × 10⁸ m', feedback: 'This is the distance light travels in 3 seconds, not 3 years.' },
      { id: 'c', text: '9.5 × 10¹⁵ m', feedback: 'This is approximately 1 light-year. You need to multiply by 3.' },
      { id: 'd', text: '1.1 × 10¹⁷ m', feedback: 'Too large. Check your calculation of seconds in 3 years.' }
    ],
    correctOptionId: 'a',
    explanation: 'Distance = speed × time. First convert 3.0 years to seconds: 3.0 × 365 × 24 × 3600 = 9.46 × 10⁷ s. Then d = (3.00 × 10⁸ m/s) × (9.46 × 10⁷ s) = 2.8 × 10¹⁶ m',
    difficulty: 'intermediate',
    tags: ['light-year', 'distance-calculation', 'unit-conversion']
  },

  // Question 11: Star explosion observation
  {
    questionText: 'A star explodes 50 light-years away from Earth. How long after the explosion do we see it on Earth?',
    options: [
      { id: 'a', text: '50 years', feedback: 'Correct! Light from the explosion takes 50 years to travel 50 light-years to reach Earth.' },
      { id: 'b', text: '50 days', feedback: 'Much too short. A light-year is the distance light travels in one year.' },
      { id: 'c', text: '50 seconds', feedback: 'Far too short. Light-years measure astronomical distances, not nearby distances.' },
      { id: 'd', text: 'Instantaneous', feedback: 'Light has a finite speed, so it takes time to travel any distance.' }
    ],
    correctOptionId: 'a',
    explanation: 'A light-year is the distance light travels in one year. If a star is 50 light-years away, light from any event there takes exactly 50 years to reach us.',
    difficulty: 'beginner',
    tags: ['light-year', 'astronomy', 'time-delay']
  },

  // Question 12: Proxima Centauri distance
  {
    questionText: 'Proxima Centauri is 4.22 light-years from Earth. Express this distance in meters.',
    options: [
      { id: 'a', text: '3.99 × 10¹⁶ m', feedback: 'Correct! Using d = 4.22 × (9.46 × 10¹⁵ m/light-year) = 3.99 × 10¹⁶ m' },
      { id: 'b', text: '1.27 × 10⁹ m', feedback: 'Much too small. This is only about the distance light travels in 4 seconds.' },
      { id: 'c', text: '9.46 × 10¹⁵ m', feedback: 'This is the distance of exactly 1 light-year. You need to multiply by 4.22.' },
      { id: 'd', text: '1.68 × 10¹⁷ m', feedback: 'Too large by about a factor of 4. Check your multiplication.' }
    ],
    correctOptionId: 'a',
    explanation: 'One light-year = 9.46 × 10¹⁵ m. Distance = 4.22 light-years × 9.46 × 10¹⁵ m/light-year = 3.99 × 10¹⁶ m',
    difficulty: 'intermediate',
    tags: ['light-year', 'unit-conversion', 'astronomy']
  },

  // Question 13: Spacecraft travel time
  {
    questionText: 'A spacecraft travels at 0.1c (10% the speed of light) to a star 20 light-years away. How long does the journey take?',
    options: [
      { id: 'a', text: '200 years', feedback: 'Correct! Time = distance / speed = 20 light-years / 0.1c = 200 years' },
      { id: 'b', text: '20 years', feedback: 'This would be correct if the spacecraft traveled at the speed of light.' },
      { id: 'c', text: '2 years', feedback: 'Much too short. The spacecraft is traveling at only 10% the speed of light.' },
      { id: 'd', text: '2000 years', feedback: 'Too long. Check your calculation: 20 ÷ 0.1 = 200.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using time = distance / speed: t = 20 light-years / (0.1 × speed of light) = 20 / 0.1 = 200 years',
    difficulty: 'intermediate',
    tags: ['speed-of-light', 'space-travel', 'time-calculation']
  },

  // Question 14: Sunlight travel time
  {
    questionText: 'The Sun is approximately 1.50 × 10¹¹ m from Earth. How long does sunlight take to reach Earth?',
    options: [
      { id: 'a', text: '8.33 minutes', feedback: 'Correct! Using t = d/c: t = (1.50 × 10¹¹ m) / (3.00 × 10⁸ m/s) = 500 s = 8.33 minutes' },
      { id: 'b', text: '8.33 seconds', feedback: 'Too short by a factor of 60. Check your unit conversion from seconds to minutes.' },
      { id: 'c', text: '50 minutes', feedback: 'Too long. Double-check your division: 1.50 × 10¹¹ ÷ 3.00 × 10⁸.' },
      { id: 'd', text: '1.39 hours', feedback: 'Much too long. Light travels much faster than this calculation suggests.' }
    ],
    correctOptionId: 'a',
    explanation: 'Time = distance / speed = (1.50 × 10¹¹ m) / (3.00 × 10⁸ m/s) = 500 s = 8.33 minutes',
    difficulty: 'intermediate',
    tags: ['speed-of-light', 'astronomy', 'time-calculation']
  },

  // Question 15: Galileo light travel
  {
    questionText: 'In Galileo\'s time, the distance from Earth to Jupiter was estimated at 6.3 × 10⁸ km. How long would light take to travel this distance?',
    options: [
      { id: 'a', text: '35 minutes', feedback: 'Correct! Using t = d/c: t = (6.3 × 10¹¹ m) / (3.00 × 10⁸ m/s) = 2100 s = 35 minutes' },
      { id: 'b', text: '35 seconds', feedback: 'Too short by a factor of 60. Remember to convert from seconds to minutes.' },
      { id: 'c', text: '2.1 hours', feedback: 'Too long. Check your calculation: 2100 seconds = 35 minutes, not 2.1 hours.' },
      { id: 'd', text: '5.8 hours', feedback: 'Much too long. Light travels much faster than this suggests.' }
    ],
    correctOptionId: 'a',
    explanation: 'Converting 6.3 × 10⁸ km to 6.3 × 10¹¹ m, then t = (6.3 × 10¹¹ m) / (3.00 × 10⁸ m/s) = 2100 s = 35 minutes',
    difficulty: 'intermediate',
    tags: ['speed-of-light', 'historical', 'astronomy', 'time-calculation']
  },

  // Question 16: Earth-Jupiter speed calculation
  {
    questionText: 'If light from Jupiter takes 33 minutes to reach Earth when they are farthest apart, what is the distance between Earth and Jupiter at this time?',
    options: [
      { id: 'a', text: '5.9 × 10¹¹ m', feedback: 'Correct! Using d = ct: d = (3.00 × 10⁸ m/s) × (33 × 60 s) = 5.9 × 10¹¹ m' },
      { id: 'b', text: '9.9 × 10⁹ m', feedback: 'Too small by a factor of 60. Remember to convert minutes to seconds first.' },
      { id: 'c', text: '1.8 × 10¹³ m', feedback: 'Too large. Check your conversion: 33 minutes = 1980 seconds, not 59,400 seconds.' },
      { id: 'd', text: '3.6 × 10¹⁰ m', feedback: 'Too small. Double-check your multiplication: 3.00 × 10⁸ × 1980.' }
    ],
    correctOptionId: 'a',
    explanation: 'Distance = speed × time. Converting 33 minutes to 1980 seconds: d = (3.00 × 10⁸ m/s) × (1980 s) = 5.9 × 10¹¹ m',
    difficulty: 'intermediate',
    tags: ['speed-of-light', 'distance-calculation', 'astronomy']
  }
];

// Export individual question handlers for compatibility
exports.pinhole_distance_calculation = createStandardMultipleChoice({
  questions: [questions[0]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.building_height_calculation = createStandardMultipleChoice({
  questions: [questions[1]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.shadow_size_calculation = createStandardMultipleChoice({
  questions: [questions[2]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.shadow_area_calculation = createStandardMultipleChoice({
  questions: [questions[3]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.fence_shadow_calculation = createStandardMultipleChoice({
  questions: [questions[4]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.michelson_six_sided_calculation = createStandardMultipleChoice({
  questions: [questions[5]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.michelson_eight_sided_frequency = createStandardMultipleChoice({
  questions: [questions[6]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.michelson_pentagonal_frequency = createStandardMultipleChoice({
  questions: [questions[7]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.michelson_twelve_sided_distance = createStandardMultipleChoice({
  questions: [questions[8]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.space_station_radio_signal = createStandardMultipleChoice({
  questions: [questions[9]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.light_travel_three_years = createStandardMultipleChoice({
  questions: [questions[10]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.star_explosion_observation = createStandardMultipleChoice({
  questions: [questions[11]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.proxima_centauri_distance = createStandardMultipleChoice({
  questions: [questions[12]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.spacecraft_travel_time = createStandardMultipleChoice({
  questions: [questions[13]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.sunlight_travel_time = createStandardMultipleChoice({
  questions: [questions[14]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.galileo_light_travel = createStandardMultipleChoice({
  questions: [questions[15]],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.earth_jupiter_speed_calculation = createStandardMultipleChoice({
  questions: [questions[16]],
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
  'pinhole_distance_calculation': {
    questions: [questions[0]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    theme: activityDefaults.theme || 'purple'
  },
  'building_height_calculation': {
    questions: [questions[1]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'shadow_size_calculation': {
    questions: [questions[2]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'shadow_area_calculation': {
    questions: [questions[3]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'fence_shadow_calculation': {
    questions: [questions[4]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'michelson_six_sided_calculation': {
    questions: [questions[5]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'michelson_eight_sided_frequency': {
    questions: [questions[6]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'michelson_pentagonal_frequency': {
    questions: [questions[7]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'michelson_twelve_sided_distance': {
    questions: [questions[8]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'space_station_radio_signal': {
    questions: [questions[9]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'light_travel_three_years': {
    questions: [questions[10]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'star_explosion_observation': {
    questions: [questions[11]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'proxima_centauri_distance': {
    questions: [questions[12]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'spacecraft_travel_time': {
    questions: [questions[13]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'sunlight_travel_time': {
    questions: [questions[14]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'galileo_light_travel': {
    questions: [questions[15]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  },
  'earth_jupiter_speed_calculation': {
    questions: [questions[16]],
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1,
    showFeedback: true,
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true
  }
};

exports.assessmentConfigs = assessmentConfigs;