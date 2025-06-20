const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
// This determines which default settings are used from course-config.json
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// Helper function to format numbers in scientific notation
const formatScientific = (num, sigFigs = 2) => {
  if (num === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);
  return `${mantissa.toFixed(sigFigs - 1)} \\times 10^{${exponent}}`;
};

// Helper function to generate random integer in range
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random float in range
const randFloat = (min, max, decimals = 1) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

// Question 1: Displacement calculation
const createQuestion1Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const initial = randInt(-20, 20);
    const final = randInt(-20, 20);
    const displacement = final - initial;
    
    // Generate distractors
    const distractors = [
      Math.abs(final - initial),  // Common error: taking absolute value
      initial - final,            // Common error: reversing subtraction
      final + initial,            // Common error: adding instead
      -displacement              // Common error: wrong sign
    ].filter(d => d !== displacement);
    
    const question = {
      question: `State the displacement when position changes from ${initial} km to ${final} km.`,
      options: [
        {
          text: `${displacement} km`,
          correct: true,
          feedback: "Correct! Displacement = final position - initial position."
        },
        {
          text: `${distractors[0]} km`,
          correct: false,
          feedback: "Remember that displacement is a vector quantity with direction. Don't take the absolute value."
        },
        {
          text: `${distractors[1]} km`,
          correct: false,
          feedback: "Check your calculation. Displacement = final position - initial position."
        },
        {
          text: `${distractors[2]} km`,
          correct: false,
          feedback: "You seem to have added the positions. Displacement = final - initial position."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial position: $x_i = ${initial}$ km
- Final position: $x_f = ${final}$ km

**Required:**
- Displacement: $\\Delta x = ?$

**Formula:**
$$\\Delta x = x_f - x_i$$

**Substitute:**
$$\\Delta x = ${final} \\text{ km} - (${initial} \\text{ km})$$

**Solve:**
$$\\Delta x = ${displacement} \\text{ km}$$

**Statement:**
The displacement is ${displacement} km${displacement > 0 ? ' in the positive direction' : displacement < 0 ? ' in the negative direction' : ' (no net displacement)'}.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 2: Time calculation from speed and distance
const createQuestion2Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const velocity = randFloat(0.5, 3.0, 1) * 1e5; // 0.5-3.0 × 10^5 m/s
    const distance = randFloat(0.5, 2.0, 1); // 0.5-2.0 m
    const time = distance / velocity;
    const timeInMicroseconds = time * 1e6;
    
    // Generate distractors
    const distractors = [
      timeInMicroseconds * 10,
      timeInMicroseconds / 10,
      timeInMicroseconds * 1000,
      distance * velocity * 1e6  // Using wrong formula
    ];
    
    const question = {
      question: `An electron travels at a uniform speed of $${formatScientific(velocity)}$ m/s. How much time is required for the electron to move a distance of ${distance} m?`,
      options: [
        {
          text: `$${timeInMicroseconds.toFixed(1)} \\, \\mu\\text{s}$`,
          correct: true,
          feedback: "Correct! You properly applied t = d/v and converted to microseconds."
        },
        {
          text: `$${distractors[0].toFixed(1)} \\, \\mu\\text{s}$`,
          correct: false,
          feedback: "Check your unit conversion. This is off by an order of magnitude."
        },
        {
          text: `$${distractors[1].toFixed(1)} \\, \\mu\\text{s}$`,
          correct: false,
          feedback: "This is off by an order of magnitude. Review your calculation."
        },
        {
          text: `$${(distance * velocity * 1e6).toExponential(1)} \\, \\mu\\text{s}$`,
          correct: false,
          feedback: "Check your formula. Time = distance ÷ velocity, not distance × velocity."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Velocity: $v = ${formatScientific(velocity)}$ m/s
- Distance: $d = ${distance}$ m

**Required:**
- Time: $t = ?$

**Formula:**
$$v = \\frac{d}{t} \\quad \\Rightarrow \\quad t = \\frac{d}{v}$$

**Substitute:**
$$t = \\frac{${distance} \\text{ m}}{${formatScientific(velocity)} \\text{ m/s}}$$

**Solve:**
$$t = ${formatScientific(time, 3)} \\text{ s}$$
$$t = ${(time * 1e6).toFixed(1)} \\times 10^{-6} \\text{ s}$$
$$t = ${timeInMicroseconds.toFixed(1)} \\, \\mu\\text{s}$$

**Statement:**
The electron requires ${timeInMicroseconds.toFixed(1)} microseconds to travel ${distance} m.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 3: Average speed calculation
const createQuestion3Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    // Generate three sections with distances and times
    const d1 = randFloat(8, 12, 1);
    const d2 = randFloat(15, 20, 1);
    const d3 = randFloat(8, 12, 1);
    
    const t1 = randFloat(6, 9, 2);
    const t2 = randFloat(12, 16, 2);
    const t3 = randFloat(5, 7, 2);
    
    const totalDistance = d1 + d2 + d3;
    const totalTime = t1 + t2 + t3;
    const avgSpeed = totalDistance / totalTime;
    
    // Generate distractors
    const distractors = [
      (d1/t1 + d2/t2 + d3/t3) / 3,  // Common error: averaging speeds
      Math.max(d1/t1, d2/t2, d3/t3), // Taking max speed
      Math.min(d1/t1, d2/t2, d3/t3)  // Taking min speed
    ];
    
    const question = {
      question: `A rally driver completes three consecutive sections of a straight rally course as follows: section 1 (${d1} km) in ${t1} min, section 2 (${d2} km) in ${t2} min, and section 3 (${d3} km) in ${t3} min. What was the average speed through the three sections?`,
      options: [
        {
          text: `${avgSpeed.toFixed(1)} km/min`,
          correct: true,
          feedback: "Correct! Average speed = total distance ÷ total time."
        },
        {
          text: `${distractors[0].toFixed(1)} km/min`,
          correct: false,
          feedback: "You can't average speeds directly. Use total distance ÷ total time."
        },
        {
          text: `${distractors[1].toFixed(1)} km/min`,
          correct: false,
          feedback: "This is the maximum speed in one section, not the average for all sections."
        },
        {
          text: `${distractors[2].toFixed(1)} km/min`,
          correct: false,
          feedback: "This is the minimum speed in one section, not the average for all sections."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Section 1: $d_1 = ${d1}$ km in $t_1 = ${t1}$ min
- Section 2: $d_2 = ${d2}$ km in $t_2 = ${t2}$ min
- Section 3: $d_3 = ${d3}$ km in $t_3 = ${t3}$ min

**Required:**
- Average speed: $v_{avg} = ?$

**Formula:**
$$v_{avg} = \\frac{\\text{total distance}}{\\text{total time}}$$

**Calculate totals:**
$$d_{total} = d_1 + d_2 + d_3 = ${d1} + ${d2} + ${d3} = ${totalDistance.toFixed(1)} \\text{ km}$$
$$t_{total} = t_1 + t_2 + t_3 = ${t1} + ${t2} + ${t3} = ${totalTime.toFixed(2)} \\text{ min}$$

**Substitute:**
$$v_{avg} = \\frac{${totalDistance.toFixed(1)} \\text{ km}}{${totalTime.toFixed(2)} \\text{ min}}$$

**Solve:**
$$v_{avg} = ${avgSpeed.toFixed(1)} \\text{ km/min}$$

**Statement:**
The average speed through the three sections is ${avgSpeed.toFixed(1)} km/min.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 4: Acceleration calculation
const createQuestion4Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_i = randInt(5, 15);
    const v_f = randInt(25, 35);
    const time = randFloat(8, 12, 1);
    const acceleration = (v_f - v_i) / time;
    
    // Generate distractors
    const distractors = [
      (v_f + v_i) / time,           // Adding velocities instead
      v_f / time,                   // Forgetting initial velocity
      (v_i - v_f) / time,          // Wrong sign
      Math.abs(v_f - v_i)          // Forgetting to divide by time
    ];
    
    const question = {
      question: `A car accelerates uniformly from ${v_i} m/s to ${v_f} m/s in ${time} s. What is the acceleration?`,
      options: [
        {
          text: `$${acceleration.toFixed(1)} \\text{ m/s}^2$`,
          correct: true,
          feedback: "Correct! You used a = (v_f - v_i) / t properly."
        },
        {
          text: `$${distractors[0].toFixed(1)} \\text{ m/s}^2$`,
          correct: false,
          feedback: "Check your formula. Acceleration = change in velocity ÷ time."
        },
        {
          text: `$${distractors[1].toFixed(1)} \\text{ m/s}^2$`,
          correct: false,
          feedback: "Don't forget the initial velocity. Use a = (v_f - v_i) / t."
        },
        {
          text: `$${distractors[3].toFixed(1)} \\text{ m/s}^2$`,
          correct: false,
          feedback: "Remember to divide by time. Acceleration has units of m/s²."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial velocity: $v_i = ${v_i}$ m/s
- Final velocity: $v_f = ${v_f}$ m/s
- Time: $t = ${time}$ s

**Required:**
- Acceleration: $a = ?$

**Formula:**
$$a = \\frac{v_f - v_i}{t}$$

**Substitute:**
$$a = \\frac{${v_f} \\text{ m/s} - ${v_i} \\text{ m/s}}{${time} \\text{ s}}$$

**Solve:**
$$a = \\frac{${v_f - v_i} \\text{ m/s}}{${time} \\text{ s}}$$
$$a = ${acceleration.toFixed(1)} \\text{ m/s}^2$$

**Statement:**
The car's acceleration is ${acceleration.toFixed(1)} m/s².
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 5: Acceleration from initial velocity and time to max height
const createQuestion5Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_i = randInt(30, 50);
    const time = randFloat(3.0, 5.0, 1);
    const acceleration = -v_i / time;  // Negative because it's decelerating
    
    // Generate distractors
    const distractors = [
      v_i / time,                    // Forgetting negative sign
      -time / v_i,                   // Inverted formula
      -(v_i * time),                 // Wrong operation
      -9.81                          // Assuming standard gravity
    ];
    
    const question = {
      question: `A ball thrown straight up in the air has an initial velocity of ${v_i} m/s and reaches its maximum height in ${time} s. What was the acceleration of the ball?`,
      options: [
        {
          text: `$${acceleration.toFixed(1)} \\text{ m/s}^2$`,
          correct: true,
          feedback: "Correct! At max height, v_f = 0, so a = -v_i / t."
        },
        {
          text: `$${distractors[0].toFixed(1)} \\text{ m/s}^2$`,
          correct: false,
          feedback: "The acceleration should be negative (downward) for upward motion."
        },
        {
          text: `$${distractors[3].toFixed(2)} \\text{ m/s}^2$`,
          correct: false,
          feedback: "Don't assume standard gravity. Calculate from the given information."
        },
        {
          text: `$${(v_i / time / 2).toFixed(1)} \\text{ m/s}^2$`,
          correct: false,
          feedback: "Check your calculation. At max height, final velocity is zero."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial velocity: $v_i = ${v_i}$ m/s (upward)
- Time to reach maximum height: $t = ${time}$ s
- Final velocity at max height: $v_f = 0$ m/s

**Required:**
- Acceleration: $a = ?$

**Formula:**
$$a = \\frac{v_f - v_i}{t}$$

**Substitute:**
$$a = \\frac{0 \\text{ m/s} - ${v_i} \\text{ m/s}}{${time} \\text{ s}}$$

**Solve:**
$$a = \\frac{-${v_i} \\text{ m/s}}{${time} \\text{ s}}$$
$$a = ${acceleration.toFixed(1)} \\text{ m/s}^2$$

**Statement:**
The acceleration of the ball is ${acceleration.toFixed(1)} m/s² (downward).
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Export all questions (1-5 for now)
exports.course2_01_physics_20_review_q1 = createStandardMultipleChoice({
  questionPool: createQuestion1Pool(),
  config: {
    ...activityDefaults,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: '01_physics_20_review_q1',
    title: 'Displacement Calculation',
    description: 'Calculate displacement from position changes',
    activityType: ACTIVITY_TYPE
  }
});

exports.course2_01_physics_20_review_q2 = createStandardMultipleChoice({
  questionPool: createQuestion2Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q2',
    title: 'Time Calculation',
    description: 'Calculate time from velocity and distance',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q3 = createStandardMultipleChoice({
  questionPool: createQuestion3Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q3',
    title: 'Average Speed',
    description: 'Calculate average speed over multiple sections',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q4 = createStandardMultipleChoice({
  questionPool: createQuestion4Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q4',
    title: 'Acceleration Calculation',
    description: 'Calculate acceleration from velocity change',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q5 = createStandardMultipleChoice({
  questionPool: createQuestion5Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q5',
    title: 'Vertical Motion Acceleration',
    description: 'Find acceleration from vertical motion',
    activityType: 'lesson'
  }
});

// Question 6: Velocity after time with constant acceleration (choosing part b: after 3.0s)
const createQuestion6Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_i = randFloat(4, 8, 1);
    const a = -randFloat(1.5, 2.5, 1); // Negative acceleration (deceleration)
    const time = v_i / Math.abs(a); // Time when velocity becomes zero
    const v_f = 0; // Velocity at this specific time
    
    // Generate distractors
    const distractors = [
      v_i + Math.abs(a) * time,     // Using positive acceleration
      v_i,                          // No change
      -v_i,                         // Just negative of initial
      v_i * time                    // Wrong formula
    ];
    
    const question = {
      question: `A ball is rolled up a slope with an initial speed of ${v_i} m/s. The ball experiences an acceleration of ${Math.abs(a).toFixed(1)} m/s² down the slope. What is its velocity after ${time.toFixed(1)} s?`,
      options: [
        {
          text: `0 m/s`,
          correct: true,
          feedback: "Correct! This is the turning point where the ball momentarily stops."
        },
        {
          text: `${distractors[0].toFixed(1)} m/s`,
          correct: false,
          feedback: "Check the direction of acceleration. It's down the slope (negative)."
        },
        {
          text: `${v_i.toFixed(1)} m/s`,
          correct: false,
          feedback: "The velocity changes due to acceleration. Use v = v_i + at."
        },
        {
          text: `${(-v_i).toFixed(1)} m/s`,
          correct: false,
          feedback: "Calculate using v = v_i + at with the correct signs."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial velocity: $v_i = ${v_i}$ m/s (up the slope, positive)
- Acceleration: $a = -${Math.abs(a).toFixed(1)}$ m/s² (down the slope, negative)
- Time: $t = ${time.toFixed(1)}$ s

**Required:**
- Final velocity: $v_f = ?$

**Formula:**
$$v_f = v_i + at$$

**Substitute:**
$$v_f = ${v_i} \\text{ m/s} + (-${Math.abs(a).toFixed(1)} \\text{ m/s}^2)(${time.toFixed(1)} \\text{ s})$$

**Solve:**
$$v_f = ${v_i} \\text{ m/s} - ${(Math.abs(a) * time).toFixed(1)} \\text{ m/s}$$
$$v_f = 0 \\text{ m/s}$$

**Statement:**
After ${time.toFixed(1)} s, the ball has come to rest (v = 0 m/s) and is about to roll back down.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 7: Acceleration and time for electron
const createQuestion7Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_f = randFloat(1.5, 2.5, 1) * 1e7; // Final velocity
    const distance = randFloat(0.08, 0.12, 2); // Distance in meters
    const v_i = 0; // Starting from rest
    
    // Calculate acceleration using v_f² = v_i² + 2ad
    const acceleration = (v_f * v_f) / (2 * distance);
    const time = v_f / acceleration;
    
    // Generate distractors
    const accelDistractors = [
      acceleration / 10,
      acceleration * 10,
      v_f / distance,
      v_f * distance
    ];
    
    const timeDistractors = [
      time * 10,
      time / 10,
      distance / v_f,
      v_f / distance
    ];
    
    const question = {
      question: `An electron is accelerated uniformly from rest to a speed of $${formatScientific(v_f)}$ m/s. If the electron travelled ${distance} m while it was being accelerated, what was its acceleration? How long did it take?`,
      options: [
        {
          text: `$a = ${formatScientific(acceleration)}$ m/s², $t = ${formatScientific(time)}$ s`,
          correct: true,
          feedback: "Correct! You used the kinematic equations properly."
        },
        {
          text: `$a = ${formatScientific(accelDistractors[0])}$ m/s², $t = ${formatScientific(timeDistractors[0])}$ s`,
          correct: false,
          feedback: "Check your calculations. Use v² = v₀² + 2ad and v = v₀ + at."
        },
        {
          text: `$a = ${formatScientific(v_f / distance)}$ m/s², $t = ${formatScientific(distance / v_f)}$ s`,
          correct: false,
          feedback: "These formulas are incorrect. Use kinematic equations for constant acceleration."
        },
        {
          text: `$a = ${formatScientific(acceleration)}$ m/s², $t = ${formatScientific(distance / v_f)}$ s`,
          correct: false,
          feedback: "Your acceleration is correct but check the time calculation."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial velocity: $v_i = 0$ m/s (from rest)
- Final velocity: $v_f = ${formatScientific(v_f)}$ m/s
- Distance: $d = ${distance}$ m

**Required:**
- Acceleration: $a = ?$
- Time: $t = ?$

**Step 1: Find acceleration using:**
$$v_f^2 = v_i^2 + 2ad$$

**Substitute:**
$$(${formatScientific(v_f)})^2 = 0^2 + 2a(${distance})$$

**Solve for a:**
$$a = \\frac{v_f^2}{2d} = \\frac{(${formatScientific(v_f)})^2}{2(${distance})}$$
$$a = ${formatScientific(acceleration)} \\text{ m/s}^2$$

**Step 2: Find time using:**
$$v_f = v_i + at$$

**Substitute:**
$$${formatScientific(v_f)} = 0 + (${formatScientific(acceleration)})t$$

**Solve for t:**
$$t = \\frac{v_f}{a} = ${formatScientific(time)} \\text{ s}$$

**Statement:**
The electron's acceleration was ${formatScientific(acceleration)} m/s² and it took ${formatScientific(time)} s to reach its final speed.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 8: Bullet shot vertically - maximum height (part b)
const createQuestion8Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_i = randInt(400, 600); // Initial velocity in m/s
    const g = 9.81; // Gravity
    
    // Calculate maximum height using v² = v₀² + 2ad where v = 0 at max height
    const maxHeight = (v_i * v_i) / (2 * g);
    const maxHeightKm = maxHeight / 1000;
    
    // Generate distractors
    const distractors = [
      maxHeight / 2,           // Common error: forgetting the 2 in formula
      v_i * v_i / g,           // Missing the 2 in denominator
      v_i / g,                 // Using wrong formula
      maxHeight * 2            // Doubling by mistake
    ];
    
    const question = {
      question: `A bullet is shot vertically into the air with an initial velocity of ${v_i} m/s. Ignoring air resistance, how high does the bullet go?`,
      options: [
        {
          text: `$${formatScientific(maxHeight)}$ m`,
          correct: true,
          feedback: "Correct! You used v² = v₀² - 2gh with v = 0 at maximum height."
        },
        {
          text: `$${formatScientific(distractors[0])}$ m`,
          correct: false,
          feedback: "Check your formula. Remember h = v₀²/(2g) for maximum height."
        },
        {
          text: `$${formatScientific(distractors[1])}$ m`,
          correct: false,
          feedback: "You're missing the factor of 2 in the denominator. h = v₀²/(2g)."
        },
        {
          text: `$${(v_i * v_i / (2 * g * 1000)).toFixed(1)} \\times 10^{3}$ m`,
          correct: false,
          feedback: "Check your unit conversion. The answer should be in meters."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial velocity: $v_i = ${v_i}$ m/s (upward)
- Acceleration due to gravity: $g = 9.81$ m/s² (downward)
- Final velocity at maximum height: $v_f = 0$ m/s

**Required:**
- Maximum height: $h = ?$

**Formula:**
$$v_f^2 = v_i^2 - 2gh$$

**At maximum height, $v_f = 0$:**
$$0 = v_i^2 - 2gh$$

**Rearrange:**
$$h = \\frac{v_i^2}{2g}$$

**Substitute:**
$$h = \\frac{(${v_i} \\text{ m/s})^2}{2(9.81 \\text{ m/s}^2)}$$

**Solve:**
$$h = \\frac{${v_i * v_i}}{19.62}$$
$$h = ${maxHeight.toFixed(0)} \\text{ m}$$
$$h = ${(maxHeight/1000).toFixed(1)} \\times 10^{3} \\text{ m}$$

**Statement:**
The bullet reaches a maximum height of ${formatScientific(maxHeight)} m or ${(maxHeight/1000).toFixed(1)} km.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 9: Package dropped from ascending balloon
const createQuestion9Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_balloon = randFloat(7, 11, 1); // Balloon velocity (m/s)
    const height = randInt(70, 90); // Initial height (m)
    const g = 9.81;
    
    // Package starts with same velocity as balloon (upward)
    // Using s = ut + (1/2)at² where s = -height (negative because falling)
    // -height = v_balloon*t - (1/2)g*t²
    // (1/2)g*t² - v_balloon*t - height = 0
    
    const a = g / 2;
    const b = -v_balloon;
    const c = -height;
    
    const discriminant = b * b - 4 * a * c;
    const time = (-b + Math.sqrt(discriminant)) / (2 * a);
    
    // Generate distractors
    const distractors = [
      Math.sqrt(2 * height / g),              // Ignoring initial velocity
      (height + v_balloon * time) / g,        // Wrong formula
      time / 2,                               // Arbitrary reduction
      (-b - Math.sqrt(discriminant)) / (2 * a) // Wrong root (negative time)
    ];
    
    const question = {
      question: `A balloon is ascending at the rate of ${v_balloon} m/s and has reached a height of ${height} m above the ground when the occupant releases a package. How long does the package take to hit the ground?`,
      options: [
        {
          text: `${time.toFixed(1)} s`,
          correct: true,
          feedback: "Correct! You accounted for the initial upward velocity of the package."
        },
        {
          text: `${distractors[0].toFixed(1)} s`,
          correct: false,
          feedback: "Remember the package initially has the same upward velocity as the balloon."
        },
        {
          text: `${(time * 0.8).toFixed(1)} s`,
          correct: false,
          feedback: "Check your calculation. Use the quadratic formula with the correct initial velocity."
        },
        {
          text: `${(time * 1.2).toFixed(1)} s`,
          correct: false,
          feedback: "Review your setup. The package starts with an upward velocity."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Balloon velocity: $v_0 = ${v_balloon}$ m/s (upward, positive)
- Initial height: $h_0 = ${height}$ m
- Acceleration: $a = -g = -9.81$ m/s² (downward)
- Final position: $h = 0$ m (ground level)

**Required:**
- Time to hit ground: $t = ?$

**Using position equation:**
$$h = h_0 + v_0t + \\frac{1}{2}at^2$$

**Substitute (taking downward as negative):**
$$0 = ${height} + ${v_balloon}t - \\frac{1}{2}(9.81)t^2$$

**Rearrange:**
$$4.905t^2 - ${v_balloon}t - ${height} = 0$$

**Using quadratic formula:**
$$t = \\frac{${v_balloon} \\pm \\sqrt{${v_balloon}^2 + 4(4.905)(${height})}}{2(4.905)}$$

**Calculate:**
$$t = \\frac{${v_balloon} + \\sqrt{${(v_balloon * v_balloon).toFixed(1)} + ${(4 * 4.905 * height).toFixed(1)}}}{9.81}$$
$$t = \\frac{${v_balloon} + ${Math.sqrt(discriminant).toFixed(1)}}{9.81}$$
$$t = ${time.toFixed(1)} \\text{ s}$$

**Statement:**
The package takes ${time.toFixed(1)} seconds to hit the ground.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Export questions 6-9
exports.course2_01_physics_20_review_q6 = createStandardMultipleChoice({
  questionPool: createQuestion6Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q6',
    title: 'Velocity on Slope',
    description: 'Calculate velocity at specific time on slope',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q7 = createStandardMultipleChoice({
  questionPool: createQuestion7Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q7',
    title: 'Electron Acceleration',
    description: 'Calculate acceleration and time for electron',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q8 = createStandardMultipleChoice({
  questionPool: createQuestion8Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q8',
    title: 'Maximum Height',
    description: 'Calculate maximum height of projectile',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q9 = createStandardMultipleChoice({
  questionPool: createQuestion9Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q9',
    title: 'Falling Package',
    description: 'Calculate time for package to fall from balloon',
    activityType: 'lesson'
  }
});

// Question 10: Ball dropped from height
const createQuestion10Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const height = randInt(15, 25); // Height in meters
    const g = 9.81;
    
    // Calculate time using h = (1/2)gt²
    const time = Math.sqrt(2 * height / g);
    
    // Calculate final velocity using v² = u² + 2as where u = 0
    const finalVelocity = Math.sqrt(2 * g * height);
    
    // Generate distractors
    const timeDistractors = [
      Math.sqrt(height / g),        // Missing the 2
      height / g,                   // Wrong formula
      time * 1.5,                   // Arbitrary multiplier
      Math.sqrt(height)             // Missing gravity
    ];
    
    const velocityDistractors = [
      Math.sqrt(g * height),        // Missing the 2
      g * time,                     // Using wrong formula
      height / time,                // Wrong approach
      finalVelocity / 2             // Arbitrary division
    ];
    
    const question = {
      question: `A person drops a ball from a height of ${height} m. What is the ball's final velocity and how long does it take to fall?`,
      options: [
        {
          text: `$v = ${finalVelocity.toFixed(1)}$ m/s, $t = ${time.toFixed(1)}$ s`,
          correct: true,
          feedback: "Correct! You used the kinematic equations for free fall properly."
        },
        {
          text: `$v = ${velocityDistractors[0].toFixed(1)}$ m/s, $t = ${timeDistractors[0].toFixed(1)}$ s`,
          correct: false,
          feedback: "Check your formulas. For free fall: v² = 2gh and h = ½gt²."
        },
        {
          text: `$v = ${velocityDistractors[1].toFixed(1)}$ m/s, $t = ${timeDistractors[1].toFixed(1)}$ s`,
          correct: false,
          feedback: "Use kinematic equations: v = √(2gh) and t = √(2h/g)."
        },
        {
          text: `$v = ${finalVelocity.toFixed(1)}$ m/s, $t = ${timeDistractors[2].toFixed(1)}$ s`,
          correct: false,
          feedback: "Your velocity is correct but check the time calculation."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial height: $h = ${height}$ m
- Initial velocity: $v_i = 0$ m/s (dropped, not thrown)
- Acceleration: $a = g = 9.81$ m/s² (downward)

**Required:**
- Final velocity: $v_f = ?$
- Time of fall: $t = ?$

**Step 1: Find time using:**
$$h = v_i t + \\frac{1}{2}gt^2$$

**Since $v_i = 0$:**
$$h = \\frac{1}{2}gt^2$$

**Solve for t:**
$$t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${height})}{9.81}}$$
$$t = \\sqrt{${(2 * height / 9.81).toFixed(2)}}$$
$$t = ${time.toFixed(1)} \\text{ s}$$

**Step 2: Find final velocity using:**
$$v_f^2 = v_i^2 + 2gh$$

**Since $v_i = 0$:**
$$v_f^2 = 2gh$$
$$v_f = \\sqrt{2gh} = \\sqrt{2(9.81)(${height})}$$
$$v_f = \\sqrt{${(2 * g * height).toFixed(1)}}$$
$$v_f = ${finalVelocity.toFixed(1)} \\text{ m/s}$$

**Statement:**
The ball reaches a final velocity of ${finalVelocity.toFixed(1)} m/s downward and takes ${time.toFixed(1)} s to fall.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 11: Stone thrown upward
const createQuestion11Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const v_i = randInt(9, 13); // Initial velocity in m/s
    const g = 9.81;
    
    // Calculate maximum height using v² = u² - 2gh where v = 0 at max height
    const maxHeight = (v_i * v_i) / (2 * g);
    
    // Calculate total time in air (up and down) using v = u - gt at top, then double it
    const timeToTop = v_i / g;
    const totalTime = 2 * timeToTop;
    
    // Generate distractors
    const heightDistractors = [
      maxHeight / 2,                // Missing factor
      v_i * v_i / g,               // Missing the 2
      v_i / g,                     // Wrong formula
      maxHeight * 2                // Doubling error
    ];
    
    const timeDistractors = [
      timeToTop,                   // Only time to top
      v_i / (2 * g),              // Wrong calculation
      totalTime * 1.5,            // Arbitrary multiplier
      Math.sqrt(2 * maxHeight / g) // Using wrong approach
    ];
    
    const question = {
      question: `A stone is thrown upward with an initial velocity of ${v_i} m/s. Calculate the maximum height and the time the stone is in the air.`,
      options: [
        {
          text: `$h = ${maxHeight.toFixed(1)}$ m, $t = ${totalTime.toFixed(1)}$ s`,
          correct: true,
          feedback: "Correct! You calculated both the maximum height and total flight time properly."
        },
        {
          text: `$h = ${heightDistractors[0].toFixed(1)}$ m, $t = ${timeDistractors[0].toFixed(1)}$ s`,
          correct: false,
          feedback: "Check your formulas. Use h = v₀²/(2g) and remember total time = 2 × time to reach maximum height."
        },
        {
          text: `$h = ${heightDistractors[1].toFixed(1)}$ m, $t = ${totalTime.toFixed(1)}$ s`,
          correct: false,
          feedback: "Your time is correct but check the height formula: h = v₀²/(2g)."
        },
        {
          text: `$h = ${maxHeight.toFixed(1)}$ m, $t = ${timeDistractors[0].toFixed(1)}$ s`,
          correct: false,
          feedback: "Your height is correct but you only calculated time to reach maximum height. Total time is twice that."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial velocity: $v_i = ${v_i}$ m/s (upward)
- Acceleration: $a = -g = -9.81$ m/s² (downward)

**Required:**
- Maximum height: $h_{max} = ?$
- Total time in air: $t_{total} = ?$

**Step 1: Find maximum height using:**
$$v_f^2 = v_i^2 + 2ah$$

**At maximum height, $v_f = 0$:**
$$0 = v_i^2 - 2gh_{max}$$

**Solve for $h_{max}$:**
$$h_{max} = \\frac{v_i^2}{2g} = \\frac{(${v_i})^2}{2(9.81)}$$
$$h_{max} = \\frac{${v_i * v_i}}{19.62}$$
$$h_{max} = ${maxHeight.toFixed(1)} \\text{ m}$$

**Step 2: Find total time in air:**
**Time to reach maximum height:**
$$v_f = v_i - gt$$
$$0 = ${v_i} - 9.81t$$
$$t_{up} = \\frac{${v_i}}{9.81} = ${timeToTop.toFixed(2)} \\text{ s}$$

**Total time (up + down):**
$$t_{total} = 2 \\times t_{up} = 2 \\times ${timeToTop.toFixed(2)}$$
$$t_{total} = ${totalTime.toFixed(1)} \\text{ s}$$

**Statement:**
The stone reaches a maximum height of ${maxHeight.toFixed(1)} m and is in the air for ${totalTime.toFixed(1)} s total.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 12: Stone thrown upward from cliff
const createQuestion12Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const cliffHeight = randFloat(100, 130, 2);
    const v_i = randFloat(18, 22, 2);
    const g = 9.81;
    
    // Using h = h₀ + v₀t - ½gt² where final h = 0 (water level)
    // 0 = cliffHeight + v_i*t - (1/2)*g*t²
    // (1/2)*g*t² - v_i*t - cliffHeight = 0
    
    const a = g / 2;
    const b = -v_i;
    const c = -cliffHeight;
    
    const discriminant = b * b - 4 * a * c;
    const time = (-b + Math.sqrt(discriminant)) / (2 * a);
    
    // Generate distractors
    const distractors = [
      Math.sqrt(2 * cliffHeight / g),          // Ignoring initial velocity
      (cliffHeight + v_i * time) / g,          // Wrong formula
      time * 0.8,                              // Arbitrary reduction
      v_i / g + Math.sqrt(2 * cliffHeight / g) // Adding wrong components
    ];
    
    const question = {
      question: `A stone is thrown vertically upward from a ${cliffHeight} m high cliff with an initial velocity of ${v_i} m/s. How long will it take for the stone to hit the water below?`,
      options: [
        {
          text: `${time.toFixed(2)} s`,
          correct: true,
          feedback: "Correct! You used the quadratic formula accounting for both initial height and velocity."
        },
        {
          text: `${distractors[0].toFixed(2)} s`,
          correct: false,
          feedback: "You ignored the initial upward velocity. The stone goes up first before falling."
        },
        {
          text: `${distractors[3].toFixed(2)} s`,
          correct: false,
          feedback: "This approach is incorrect. Use the position equation with quadratic formula."
        },
        {
          text: `${(time * 0.9).toFixed(2)} s`,
          correct: false,
          feedback: "Check your calculation. Set up the equation: 0 = h₀ + v₀t - ½gt²."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial height: $h_0 = ${cliffHeight}$ m
- Initial velocity: $v_i = ${v_i}$ m/s (upward)
- Acceleration: $a = -g = -9.81$ m/s² (downward)
- Final position: $h = 0$ m (water level)

**Required:**
- Time to hit water: $t = ?$

**Using position equation:**
$$h = h_0 + v_i t - \\frac{1}{2}gt^2$$

**Substitute:**
$$0 = ${cliffHeight} + ${v_i}t - \\frac{1}{2}(9.81)t^2$$

**Rearrange to standard form:**
$$4.905t^2 - ${v_i}t - ${cliffHeight} = 0$$

**Using quadratic formula:**
$$t = \\frac{${v_i} \\pm \\sqrt{(${v_i})^2 + 4(4.905)(${cliffHeight})}}{2(4.905)}$$

**Calculate:**
$$t = \\frac{${v_i} \\pm \\sqrt{${(v_i * v_i).toFixed(2)} + ${(4 * 4.905 * cliffHeight).toFixed(1)}}}{9.81}$$
$$t = \\frac{${v_i} + ${Math.sqrt(discriminant).toFixed(2)}}{9.81}$$
$$t = ${time.toFixed(2)} \\text{ s}$$

**Statement:**
The stone takes ${time.toFixed(2)} seconds to hit the water below.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Question 13: Horizontal projectile motion
const createQuestion13Pool = () => {
  const questions = [];
  
  for (let i = 0; i < 5; i++) {
    const cliffHeight = randFloat(100, 130, 2);
    const v_horizontal = randFloat(18, 22, 2);
    const g = 9.81;
    
    // Time to fall (vertical motion only)
    const time = Math.sqrt(2 * cliffHeight / g);
    
    // Horizontal distance
    const horizontalDistance = v_horizontal * time;
    
    // Generate distractors
    const timeDistractors = [
      time / 2,                             // Wrong calculation
      Math.sqrt(cliffHeight / g),          // Missing factor of 2
      v_horizontal / g,                     // Using wrong formula
      time * 1.2                           // Arbitrary multiplier
    ];
    
    const distanceDistractors = [
      horizontalDistance / 2,               // Using wrong time
      v_horizontal * Math.sqrt(cliffHeight / g), // Using wrong time formula
      Math.sqrt(v_horizontal * cliffHeight), // Wrong approach
      cliffHeight * v_horizontal / g        // Wrong formula
    ];
    
    const question = {
      question: `A stone is thrown horizontally at ${v_horizontal} m/s from a ${cliffHeight} m high cliff. How long will it take for the stone to hit the water below? How far from the base of the cliff will the stone land?`,
      options: [
        {
          text: `$t = ${time.toFixed(2)}$ s, $d = ${horizontalDistance.toFixed(1)}$ m`,
          correct: true,
          feedback: "Correct! You properly separated horizontal and vertical motion."
        },
        {
          text: `$t = ${timeDistractors[0].toFixed(2)}$ s, $d = ${distanceDistractors[0].toFixed(1)}$ m`,
          correct: false,
          feedback: "Check your time calculation. Use t = √(2h/g) for vertical motion."
        },
        {
          text: `$t = ${timeDistractors[1].toFixed(2)}$ s, $d = ${distanceDistractors[1].toFixed(1)}$ m`,
          correct: false,
          feedback: "You're missing the factor of 2 in the time formula: t = √(2h/g)."
        },
        {
          text: `$t = ${time.toFixed(2)}$ s, $d = ${distanceDistractors[2].toFixed(1)}$ m`,
          correct: false,
          feedback: "Your time is correct but the distance should be d = v_horizontal × t."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Initial height: $h = ${cliffHeight}$ m
- Horizontal velocity: $v_x = ${v_horizontal}$ m/s (constant)
- Initial vertical velocity: $v_{y0} = 0$ m/s (thrown horizontally)
- Acceleration: $a_y = g = 9.81$ m/s² (downward)

**Required:**
- Time to hit water: $t = ?$
- Horizontal distance: $d = ?$

**Step 1: Find time using vertical motion:**
**Vertical motion equation:**
$$h = v_{y0}t + \\frac{1}{2}gt^2$$

**Since $v_{y0} = 0$ (horizontal throw):**
$$h = \\frac{1}{2}gt^2$$

**Solve for t:**
$$t = \\sqrt{\\frac{2h}{g}} = \\sqrt{\\frac{2(${cliffHeight})}{9.81}}$$
$$t = \\sqrt{${(2 * cliffHeight / 9.81).toFixed(2)}}$$
$$t = ${time.toFixed(2)} \\text{ s}$$

**Step 2: Find horizontal distance:**
**Horizontal motion (constant velocity):**
$$d = v_x \\times t$$
$$d = ${v_horizontal} \\times ${time.toFixed(2)}$$
$$d = ${horizontalDistance.toFixed(1)} \\text{ m}$$

**Statement:**
The stone takes ${time.toFixed(2)} s to hit the water and lands ${horizontalDistance.toFixed(1)} m from the base of the cliff.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Export questions 10-13
exports.course2_01_physics_20_review_q10 = createStandardMultipleChoice({
  questionPool: createQuestion10Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q10',
    title: 'Free Fall',
    description: 'Calculate velocity and time for free fall',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q11 = createStandardMultipleChoice({
  questionPool: createQuestion11Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q11',
    title: 'Vertical Throw',
    description: 'Calculate height and time for vertical throw',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q12 = createStandardMultipleChoice({
  questionPool: createQuestion12Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q12',
    title: 'Cliff Throw Vertical',
    description: 'Calculate time for vertical throw from cliff',
    activityType: 'lesson'
  }
});

exports.course2_01_physics_20_review_q13 = createStandardMultipleChoice({
  questionPool: createQuestion13Pool(),
  config: {
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '01-physics-20-review',
    assessmentId: 'physics_20_review_q13',
    title: 'Horizontal Projectile',
    description: 'Calculate time and distance for horizontal projectile',
    activityType: 'lesson'
  }
});