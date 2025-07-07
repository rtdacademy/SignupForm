//const { createStandardMultipleChoice } = require('../../../../shared/assessment-types/standard-multiple-choice');
//const { getActivityTypeSettings } = require('../../../../shared/utilities/config-loader');

// Load course configuration
//const courseConfig = require('../../../../shared/courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
// This determines which default settings are used from course-config.json
//const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
//const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// Helper function to format numbers in scientific notation
const formatScientific = (num, sigFigs = 2) => {
  if (num === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);
  return `${mantissa.toFixed(sigFigs - 1)} \\\\times 10^{${exponent}}`;
};

// Helper function to generate random integer in range
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to generate random float in range
const randFloat = (min, max, decimals = 1) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

// ===== EXAMPLE PHYSICS QUESTION PATTERNS =====
// These are examples showing how to structure physics questions
// They are kept as reference but not exported as assessments

// Example 1: Displacement calculation pattern
const createDisplacementQuestionExample = () => {
  const initial = randInt(-20, 20);
  const final = randInt(-20, 20);
  const displacement = final - initial;
  
  return {
    questionText: `State the displacement when position changes from ${initial} km to ${final} km.`,
    options: [
      { id: 'a', text: `${displacement} km` },
      { id: 'b', text: `${Math.abs(displacement)} km` },
      { id: 'c', text: `${initial - final} km` },
      { id: 'd', text: `${final + initial} km` }
    ],
    correctOptionId: 'a',
    explanation: `Displacement = final position - initial position = ${final} - (${initial}) = ${displacement} km`,
    difficulty: 'intermediate'
  };
};

// Example 2: Kinematic calculation pattern
const createKinematicQuestionExample = () => {
  const v_i = randInt(5, 15);
  const v_f = randInt(25, 35);
  const time = randFloat(8, 12, 1);
  const acceleration = (v_f - v_i) / time;
  
  return {
    questionText: `A car accelerates uniformly from ${v_i} m/s to ${v_f} m/s in ${time} s. What is the acceleration?`,
    options: [
      { id: 'a', text: `${acceleration.toFixed(1)} m/s²` },
      { id: 'b', text: `${((v_f + v_i) / time).toFixed(1)} m/s²` },
      { id: 'c', text: `${(v_f / time).toFixed(1)} m/s²` },
      { id: 'd', text: `${Math.abs(v_f - v_i).toFixed(1)} m/s²` }
    ],
    correctOptionId: 'a',
    explanation: `Using a = (v_f - v_i) / t = (${v_f} - ${v_i}) / ${time} = ${acceleration.toFixed(1)} m/s²`,
    difficulty: 'intermediate'
  };
};

// ===== SLIDESHOW KNOWLEDGE CHECK ASSESSMENTS =====

// Helper function to create a randomized displacement question
const createRandomDisplacementQuestion = () => {
  const initial = randInt(-20, 20);
  const final = randInt(-20, 20);
  const displacement = final - initial;
  
  // Helper function to format numbers with proper signs
  const formatNumber = (num) => num > 0 ? `+${num}` : `${num}`;
  
  return {
    questionText: `State the displacement when position changes from ${formatNumber(initial)} km to ${formatNumber(final)} km.`,
    options: [
      { id: 'a', text: `${formatNumber(displacement)} km`, feedback: "Correct! Displacement = final position - initial position." },
      { id: 'b', text: `${formatNumber(Math.abs(displacement))} km`, feedback: "This is the magnitude (distance) but displacement includes direction. Don't take the absolute value." },
      { id: 'c', text: `${formatNumber(initial - final)} km`, feedback: "You subtracted in the wrong order. It should be final - initial, not initial - final." },
      { id: 'd', text: `${formatNumber(final + initial)} km`, feedback: "You added the positions instead of subtracting. Displacement = final - initial, not final + initial." }
    ],
    correctOptionId: 'a',
    explanation: `Displacement = final position - initial position = (${final}) - (${initial}) = ${displacement} km`,
    difficulty: "intermediate",
    topic: "Displacement"
  };
};

// Helper function to create a randomized speed/time question
const createRandomSpeedTimeQuestion = () => {
  const speed = randFloat(1.0, 2.0, 1) * Math.pow(10, 5); // 1.0-2.0 × 10⁵ m/s
  const distance = randFloat(0.5, 2.0, 1); // 0.5-2.0 m
  const time = distance / speed; // in seconds
  const timeMicroseconds = time * 1e6; // convert to microseconds
  
  return {
    questionText: `An electron travels at a uniform speed of ${speed.toExponential(1)} m/s. How much time is required for the electron to move a distance of ${distance} m?`,
    options: [
      { id: 'a', text: `${timeMicroseconds.toFixed(1)} μs`, feedback: "Correct! Time = distance ÷ speed, then convert to microseconds." },
      { id: 'b', text: `${(timeMicroseconds * 10).toFixed(1)} μs`, feedback: "You made an error in unit conversion or calculation. Check your division and microsecond conversion." },
      { id: 'c', text: `${(timeMicroseconds / 10).toFixed(1)} μs`, feedback: "This is too small. You may have made an error in the calculation or unit conversion." },
      { id: 'd', text: `${(speed / 1e5).toFixed(1)} μs`, feedback: "You used the wrong formula. Time = distance ÷ speed, not a function of speed alone." }
    ],
    correctOptionId: 'a',
    explanation: `Time = distance ÷ speed = ${distance} m ÷ (${speed.toExponential(1)} m/s) = ${time.toExponential(1)} s = ${timeMicroseconds.toFixed(1)} μs`,
    difficulty: "intermediate",
    topic: "Time Calculation"
  };
};

// Helper function to create a randomized average speed question
const createRandomAverageSpeedQuestion = () => {
  const section1Dist = randFloat(8, 15, 1);
  const section2Dist = randFloat(15, 25, 1);
  const section3Dist = randFloat(5, 12, 1);
  const section1Time = randFloat(5, 10, 2);
  const section2Time = randFloat(10, 18, 2);
  const section3Time = randFloat(3, 8, 2);
  
  const totalDistance = section1Dist + section2Dist + section3Dist;
  const totalTime = section1Time + section2Time + section3Time;
  const averageSpeed = totalDistance / totalTime;
  
  return {
    questionText: `A rally driver completes: section 1 (${section1Dist} km) in ${section1Time} min, section 2 (${section2Dist} km) in ${section2Time} min, and section 3 (${section3Dist} km) in ${section3Time} min. What was the average speed?`,
    options: [
      { id: 'a', text: `${averageSpeed.toFixed(1)} km/min`, feedback: "Correct! Average speed = total distance ÷ total time for the entire journey." },
      { id: 'b', text: `${(averageSpeed * 1.2).toFixed(1)} km/min`, feedback: "This is too high. Make sure you're dividing total distance by total time, not averaging the individual speeds." },
      { id: 'c', text: `${(averageSpeed * 0.8).toFixed(1)} km/min`, feedback: "This is too low. Check your addition of distances and times." },
      { id: 'd', text: `${(totalDistance / 10).toFixed(1)} km/min`, feedback: "You divided by the wrong value. Use total time, not an arbitrary number." }
    ],
    correctOptionId: 'a',
    explanation: `Average speed = total distance ÷ total time = (${section1Dist} + ${section2Dist} + ${section3Dist}) km ÷ (${section1Time} + ${section2Time} + ${section3Time}) min = ${totalDistance.toFixed(1)} km ÷ ${totalTime.toFixed(1)} min = ${averageSpeed.toFixed(1)} km/min`,
    difficulty: "intermediate",
    topic: "Average Speed"
  };
};

// Helper function to create a randomized acceleration question
const createRandomAccelerationQuestion = () => {
  const v_i = randInt(5, 20);
  const v_f = randInt(25, 45);
  const time = randInt(8, 15);
  const acceleration = (v_f - v_i) / time;
  
  return {
    questionText: `A car accelerates uniformly from ${v_i} m/s to ${v_f} m/s in ${time} s. What is the acceleration?`,
    options: [
      { id: 'a', text: `${acceleration.toFixed(1)} m/s²`, feedback: "Correct! Acceleration = (change in velocity) ÷ time." },
      { id: 'b', text: `${(acceleration * 2).toFixed(1)} m/s²`, feedback: "This is double the correct answer. Check your calculation - you may have made an arithmetic error." },
      { id: 'c', text: `${(v_f - v_i).toFixed(1)} m/s²`, feedback: "You forgot to divide by time. Acceleration = Δv ÷ t, not just Δv." },
      { id: 'd', text: `${(acceleration / 2).toFixed(1)} m/s²`, feedback: "This is half the correct answer. Check your calculation." }
    ],
    correctOptionId: 'a',
    explanation: `Acceleration = (final velocity - initial velocity) ÷ time = (${v_f} - ${v_i}) m/s ÷ ${time} s = ${acceleration.toFixed(1)} m/s²`,
    difficulty: "intermediate",
    topic: "Acceleration"
  };
};

// Helper function to create a randomized vertical motion question
const createRandomVerticalMotionQuestion = () => {
  const v_i = randInt(30, 50);
  const time = randFloat(3.0, 5.0, 1);
  const acceleration = -v_i / time;
  
  return {
    questionText: `A ball thrown straight up has an initial velocity of ${v_i} m/s and reaches maximum height in ${time} s. What was the acceleration?`,
    options: [
      { id: 'a', text: `${acceleration.toFixed(1)} m/s²`, feedback: "Correct! Acceleration = (final velocity - initial velocity) ÷ time. Final velocity at max height is 0." },
      { id: 'b', text: `${Math.abs(acceleration).toFixed(1)} m/s²`, feedback: "You forgot the negative sign. Acceleration due to gravity is always downward (negative)." },
      { id: 'c', text: "-9.8 m/s²", feedback: "This is the standard gravity value, but you should calculate the actual acceleration from the given data." },
      { id: 'd', text: "0 m/s²", feedback: "The velocity at maximum height is 0, but acceleration due to gravity is still acting on the ball." }
    ],
    correctOptionId: 'a',
    explanation: `At maximum height, final velocity = 0. Acceleration = (0 - ${v_i}) m/s ÷ ${time} s = ${acceleration.toFixed(1)} m/s²`,
    difficulty: "intermediate",
    topic: "Vertical Motion"
  };
};

// Helper function to create a randomized slope motion question
const createRandomSlopeMotionQuestion = () => {
  const v_i = randFloat(4.0, 8.0, 1);
  const acceleration = randFloat(1.5, 2.5, 1);
  const time = v_i / acceleration; // Time to stop
  const finalVelocity = v_i - acceleration * time;
  
  return {
    questionText: `A ball is rolled up a slope with initial speed ${v_i} m/s and acceleration ${acceleration} m/s² down the slope. What is its velocity after ${time.toFixed(1)} s?`,
    options: [
      { id: 'a', text: `${finalVelocity.toFixed(1)} m/s`, feedback: "Correct! Using v = v₀ + at, the ball stops at this moment before rolling back." },
      { id: 'b', text: `+${(v_i - acceleration).toFixed(1)} m/s`, feedback: "You subtracted acceleration directly instead of multiplying by time first. Use v = v₀ + at." },
      { id: 'c', text: `-${acceleration.toFixed(1)} m/s`, feedback: "This is just the negative acceleration value, not the velocity after time t." },
      { id: 'd', text: `+${v_i.toFixed(1)} m/s`, feedback: "You ignored the effect of acceleration. The ball slows down due to the downslope acceleration." }
    ],
    correctOptionId: 'a',
    explanation: `v = v₀ + at = ${v_i} + (-${acceleration})(${time.toFixed(1)}) = ${v_i} - ${(acceleration * time).toFixed(1)} = ${finalVelocity.toFixed(1)} m/s. The ball momentarily stops before rolling back.`,
    difficulty: "intermediate",
    topic: "Motion on Slope"
  };
};

// Helper function to create a randomized electron acceleration question
const createRandomElectronAccelerationQuestion = () => {
  const finalVelocity = randFloat(1.5, 2.5, 1) * Math.pow(10, 7);
  const distance = randFloat(0.08, 0.15, 2);
  const acceleration = (finalVelocity * finalVelocity) / (2 * distance);
  
  return {
    questionText: `An electron accelerates from rest to ${finalVelocity.toExponential(1)} m/s over ${distance} m. What was its acceleration?`,
    options: [
      { id: 'a', text: `${acceleration.toExponential(1)} m/s²`, feedback: "Correct! Using v² = u² + 2as, solve for acceleration a." },
      { id: 'b', text: `${(acceleration / 10).toExponential(1)} m/s²`, feedback: "This is too small by a factor of 10. Check your calculation or unit conversion." },
      { id: 'c', text: `${(acceleration / 2).toExponential(1)} m/s²`, feedback: "You forgot to divide by 2 in the kinematic equation. Remember: a = v²/(2s) when starting from rest." },
      { id: 'd', text: `${(acceleration * 2).toExponential(1)} m/s²`, feedback: "This is double the correct answer. You may have forgotten to divide by 2 in the formula." }
    ],
    correctOptionId: 'a',
    explanation: `Using v² = u² + 2as: (${finalVelocity.toExponential(1)})² = 0 + 2a(${distance}), so a = ${(finalVelocity * finalVelocity).toExponential(1)} ÷ ${(2 * distance).toFixed(2)} = ${acceleration.toExponential(1)} m/s²`,
    difficulty: "advanced",
    topic: "Electron Motion"
  };
};


// Helper function to create a randomized projectile time question
const createRandomProjectileTimeQuestion = () => {
  const v_i = randInt(400, 600);
  const time = v_i / 9.8;
  
  return {
    questionText: `A bullet shot vertically with initial velocity ${v_i} m/s. How long to reach maximum height?`,
    options: [
      { id: 'a', text: `${time.toFixed(0)} s`, feedback: "Correct! At maximum height, velocity = 0. Use v = u + at to solve for time." },
      { id: 'b', text: `${(time / 2).toFixed(0)} s`, feedback: "This is half the correct time. You may have confused this with time to reach half the maximum height." },
      { id: 'c', text: `${(time * 2).toFixed(0)} s`, feedback: "This is the total flight time (up and down). The question asks only for time to reach maximum height." },
      { id: 'd', text: `${(v_i / 50).toFixed(0)} s`, feedback: "You divided by the wrong value. Use gravity (9.8 m/s²) not an arbitrary number." }
    ],
    correctOptionId: 'a',
    explanation: `At maximum height, v = 0. Using v = u + at: 0 = ${v_i} + (-9.8)t, so t = ${v_i} ÷ 9.8 = ${time.toFixed(0)} s`,
    difficulty: "intermediate",
    topic: "Projectile Motion"
  };
};


// Helper function to create a randomized falling object question
const createRandomFallingObjectQuestion = () => {
  const v_0 = randFloat(8.0, 12.0, 1);
  const h_0 = randInt(60, 100);
  
  // Solve quadratic: 0 = h_0 + v_0*t - 4.9*t^2
  // Using quadratic formula: t = (-v_0 + sqrt(v_0^2 + 4*4.9*h_0)) / (2*(-4.9))
  const discriminant = v_0 * v_0 + 4 * 4.9 * h_0;
  const time = (-v_0 + Math.sqrt(discriminant)) / (2 * (-4.9));
  
  return {
    questionText: `A balloon ascending at ${v_0} m/s at height ${h_0} m releases a package. How long until it hits the ground?`,
    options: [
      { id: 'a', text: `${time.toFixed(1)} s`, feedback: "Correct! This requires solving a quadratic equation: 0 = h₀ + v₀t - ½gt²." },
      { id: 'b', text: `${(time * 0.8).toFixed(1)} s`, feedback: "This is too short. Make sure you account for the initial upward velocity of the package." },
      { id: 'c', text: `${(time * 0.6).toFixed(1)} s`, feedback: "This is much too short. The package continues upward briefly before falling." },
      { id: 'd', text: `${(h_0 / 10).toFixed(1)} s`, feedback: "You used a simple ratio instead of the kinematic equation. This ignores the initial upward velocity." }
    ],
    correctOptionId: 'a',
    explanation: `Using h = h₀ + v₀t - ½gt²: 0 = ${h_0} + ${v_0}t - 4.9t². Solving the quadratic gives t = ${time.toFixed(1)} s`,
    difficulty: "advanced",
    topic: "Falling Objects"
  };
};


// Helper function to create a randomized free fall question
const createRandomFreeFallQuestion = () => {
  const height = randInt(15, 30);
  const finalVelocity = Math.sqrt(2 * 9.8 * height);
  
  return {
    questionText: `A ball dropped from ${height} m height. What is the final velocity when it hits the ground?`,
    options: [
      { id: 'a', text: `${-finalVelocity.toFixed(1)} m/s`, feedback: "Correct! Using v² = u² + 2as. Velocity is negative because it's directed downward." },
      { id: 'b', text: `+${finalVelocity.toFixed(1)} m/s`, feedback: "The magnitude is correct, but you missed the direction. Downward velocity should be negative." },
      { id: 'c', text: `${-(finalVelocity * 0.7).toFixed(1)} m/s`, feedback: "You have the right direction but the magnitude is too small. Check your calculation." },
      { id: 'd', text: `+${(finalVelocity * 0.7).toFixed(1)} m/s`, feedback: "Both the magnitude and direction are wrong. The velocity should be larger and negative." }
    ],
    correctOptionId: 'a',
    explanation: `Using v² = u² + 2as: v² = 0 + 2(9.8)(${height}) = ${(2 * 9.8 * height).toFixed(0)}, so v = ±${finalVelocity.toFixed(1)} m/s. Negative since downward.`,
    difficulty: "intermediate",
    topic: "Free Fall"
  };
};


// Helper function to create a randomized maximum height question
const createRandomMaxHeightQuestion = () => {
  const v_i = randInt(8, 15);
  const maxHeight = (v_i * v_i) / (2 * 9.8);
  
  return {
    questionText: `A stone thrown upward with initial velocity ${v_i} m/s. What is the maximum height?`,
    options: [
      { id: 'a', text: `${maxHeight.toFixed(1)} m`, feedback: "Correct! At maximum height, v = 0. Use v² = u² + 2as to solve for height." },
      { id: 'b', text: `${v_i} m`, feedback: "You confused velocity with height. The maximum height is not numerically equal to initial velocity." },
      { id: 'c', text: `${(maxHeight / 2).toFixed(1)} m`, feedback: "This is half the maximum height. You may have made an error in the calculation." },
      { id: 'd', text: `${(maxHeight * 2).toFixed(1)} m`, feedback: "This is double the maximum height. Check your use of the kinematic equation." }
    ],
    correctOptionId: 'a',
    explanation: `Using v² = u² + 2as at maximum height (v = 0): 0 = ${v_i}² - 2(9.8)h, so h = ${v_i * v_i} ÷ ${2 * 9.8} = ${maxHeight.toFixed(1)} m`,
    difficulty: "intermediate",
    topic: "Maximum Height"
  };
};


// Helper function to create a randomized horizontal projectile question
const createRandomHorizontalProjectileQuestion = () => {
  const horizontalVelocity = randFloat(15, 25, 2);
  const height = randInt(80, 150);
  const time = Math.sqrt(2 * height / 9.8);
  
  return {
    questionText: `A stone thrown horizontally at ${horizontalVelocity} m/s from a ${height} m cliff. How long until it hits water?`,
    options: [
      { id: 'a', text: `${time.toFixed(2)} s`, feedback: "Correct! For horizontal projectiles, only vertical motion determines the time: t = √(2h/g)." },
      { id: 'b', text: `${(time * 1.2).toFixed(2)} s`, feedback: "This is too long. The horizontal velocity doesn't affect the fall time." },
      { id: 'c', text: `${(time * 0.7).toFixed(2)} s`, feedback: "This is too short. Make sure you're using the correct kinematic equation for vertical motion." },
      { id: 'd', text: `${(height / 50).toFixed(2)} s`, feedback: "You used an incorrect approach. Use h = ½t² to find the time, not a simple ratio." }
    ],
    correctOptionId: 'a',
    explanation: `For vertical motion: h = ½gt², so t = √(2h/g) = √(2 × ${height} ÷ 9.8) = √${(2 * height / 9.8).toFixed(2)} = ${time.toFixed(2)} s`,
    difficulty: "intermediate",
    topic: "Horizontal Projectile"
  };
};

// ===== VECTOR KNOWLEDGE CHECK ASSESSMENTS =====

// Helper function to create randomized ski lift trigonometry question
const createRandomSkiLiftQuestion = () => {
  const length = randInt(2500, 3500);
  const angle = randFloat(12, 18, 1);
  const height = length * Math.sin(angle * Math.PI / 180);
  const cosineError = length * Math.cos(angle * Math.PI / 180); // Common mistake
  
  return {
    questionText: `The gondola ski lift at a resort is ${length} m long. On average, the ski lift rises ${angle}° above the horizontal. How high is the top of the ski lift relative to the base?`,
    options: [
      { id: 'a', text: `${height.toFixed(0)} m`, feedback: `Correct! Using trigonometry: height = length × sin(angle) = ${length} m × sin(${angle}°) = ${height.toFixed(0)} m` },
      { id: 'b', text: `${(height * 0.85).toFixed(0)} m`, feedback: `This is too small. Remember to use sine function: height = length × sin(angle)` },
      { id: 'c', text: `${(height * 1.15).toFixed(0)} m`, feedback: `This is too large. Check your calculation: ${length} × sin(${angle}°) = ${height.toFixed(0)} m` },
      { id: 'd', text: `${cosineError.toFixed(0)} m`, feedback: `This uses cosine instead of sine. For height, use: height = length × sin(angle)` }
    ],
    correctOptionId: 'a',
    explanation: `Using trigonometry: height = length × sin(angle) = ${length} m × sin(${angle}°) = ${height.toFixed(0)} m`,
    difficulty: "intermediate",
    topic: "Vector Components"
  };
};


// Helper function to create randomized distance and bearing question
const createRandomDistanceBearingQuestion = () => {
  const southDistance = randFloat(25, 45, 1);
  const westDistance = randFloat(60, 90, 1);
  const totalDistance = Math.sqrt(westDistance * westDistance + southDistance * southDistance);
  const bearing = Math.atan(southDistance / westDistance) * (180 / Math.PI);
  
  return {
    questionText: `A highway is planned between two towns, one of which lies ${southDistance} km south and ${westDistance} km west of the other. What is the shortest length of highway that can be built and what would be its bearing?`,
    options: [
      { id: 'a', text: `${totalDistance.toFixed(1)} km @ ${bearing.toFixed(0)}° S of W`, feedback: `Correct! Distance = √(${westDistance}² + ${southDistance}²) = ${totalDistance.toFixed(1)} km. Bearing = tan⁻¹(${southDistance}/${westDistance}) = ${bearing.toFixed(0)}° S of W` },
      { id: 'b', text: `${(westDistance + southDistance).toFixed(1)} km @ ${bearing.toFixed(0)}° S of W`, feedback: `The angle is correct but the distance is wrong. Use Pythagorean theorem: √(${westDistance}² + ${southDistance}²) = ${totalDistance.toFixed(1)} km` },
      { id: 'c', text: `${totalDistance.toFixed(1)} km @ ${(90 - bearing).toFixed(0)}° S of W`, feedback: `The distance is correct but the angle is wrong. Use tan⁻¹(${southDistance}/${westDistance}) = ${bearing.toFixed(0)}°, not ${(90 - bearing).toFixed(0)}°` },
      { id: 'd', text: `${westDistance.toFixed(1)} km @ ${bearing.toFixed(0)}° S of W`, feedback: `This is just the west component. Use Pythagorean theorem for total distance: √(${westDistance}² + ${southDistance}²) = ${totalDistance.toFixed(1)} km` }
    ],
    correctOptionId: 'a',
    explanation: `Distance = √(${westDistance}² + ${southDistance}²) = √(${(westDistance * westDistance).toFixed(0)} + ${(southDistance * southDistance).toFixed(0)}) = √${(westDistance * westDistance + southDistance * southDistance).toFixed(0)} = ${totalDistance.toFixed(1)} km. Bearing = tan⁻¹(${southDistance}/${westDistance}) = ${bearing.toFixed(0)}° S of W`,
    difficulty: "intermediate",
    topic: "Vector Magnitude and Direction"
  };
};

// ===== CIRCULAR MOTION KNOWLEDGE CHECK ASSESSMENTS =====

// Helper function to create randomized circular motion question
const createRandomCircularMotionQuestion = () => {
  const mass = randFloat(0.15, 0.35, 2);
  const radius = randFloat(0.8, 1.5, 1);
  const tangentialSpeed = randFloat(3.5, 5.5, 1);
  const centripetalAcceleration = (tangentialSpeed * tangentialSpeed) / radius;
  const tension = mass * (9.8 + centripetalAcceleration); // Weight + centripetal force
  
  return {
    questionText: `A ${mass} kg ball on a ${radius} m string is being swung horizontally at a tangential speed of ${tangentialSpeed} m/s. What is the speed and tension?`,
    options: [
      { id: 'a', text: `${tangentialSpeed} m/s, ${tension.toFixed(1)} N`, feedback: `Correct! Speed = ${tangentialSpeed} m/s (given). For tension: T = mg + mac = ${mass}(9.8) + ${mass}(${tangentialSpeed}²/${radius}) = ${mass}(9.8 + ${centripetalAcceleration.toFixed(1)}) = ${tension.toFixed(1)} N` },
      { id: 'b', text: `${tangentialSpeed} m/s, ${(mass * 9.8).toFixed(1)} N`, feedback: `Speed is correct, but tension is wrong. You only included weight. Tension = mg + mac = weight + centripetal force = ${tension.toFixed(1)} N` },
      { id: 'c', text: `${centripetalAcceleration.toFixed(1)} m/s, ${tension.toFixed(1)} N`, feedback: `Tension is correct, but you confused speed with centripetal acceleration. Speed = ${tangentialSpeed} m/s (given).` },
      { id: 'd', text: `${radius} m/s, ${(mass * centripetalAcceleration).toFixed(1)} N`, feedback: `Both values are wrong. Speed = ${tangentialSpeed} m/s (given). Tension = mg + mac = ${tension.toFixed(1)} N` }
    ],
    correctOptionId: 'a',
    explanation: `Speed = ${tangentialSpeed} m/s (given). Centripetal acceleration = v²/r = ${tangentialSpeed}²/${radius} = ${centripetalAcceleration.toFixed(1)} m/s². Tension = mg + mac = ${mass}(9.8) + ${mass}(${centripetalAcceleration.toFixed(1)}) = ${(mass * 9.8).toFixed(1)} + ${(mass * centripetalAcceleration).toFixed(1)} = ${tension.toFixed(1)} N`,
    difficulty: "intermediate",
    topic: "Circular Motion"
  };
};


// Helper function to create randomized car cornering question
const createRandomCarCorneringQuestion = () => {
  const speed = randFloat(12, 18, 1);
  const radius = randFloat(45, 75, 1);
  const mass = randInt(1200, 1800);
  const centripetalForce = mass * (speed * speed) / radius;
  
  return {
    questionText: `A ${mass} kg car rounds a curve of radius ${radius} m at ${speed} m/s. What centripetal force is required?`,
    options: [
      { id: 'a', text: `${centripetalForce.toFixed(0)} N`, feedback: `Correct! Centripetal force = mv²/r = ${mass} × ${speed}² ÷ ${radius} = ${mass} × ${(speed * speed).toFixed(1)} ÷ ${radius} = ${centripetalForce.toFixed(0)} N` },
      { id: 'b', text: `${(centripetalForce / 2).toFixed(0)} N`, feedback: `This is half the correct answer. Make sure you're using Fc = mv²/r, not mv/r.` },
      { id: 'c', text: `${(mass * 9.8).toFixed(0)} N`, feedback: `This is the car's weight, not centripetal force. Use Fc = mv²/r = ${centripetalForce.toFixed(0)} N` },
      { id: 'd', text: `${(mass * speed).toFixed(0)} N`, feedback: `This uses mv instead of mv²/r. Centripetal force = mv²/r = ${centripetalForce.toFixed(0)} N` }
    ],
    correctOptionId: 'a',
    explanation: `Centripetal force = mv²/r = ${mass} kg × (${speed} m/s)² ÷ ${radius} m = ${mass} × ${(speed * speed).toFixed(1)} ÷ ${radius} = ${centripetalForce.toFixed(0)} N`,
    difficulty: "intermediate",
    topic: "Centripetal Force"
  };
};


// Helper function to create randomized satellite motion question
const createRandomSatelliteMotionQuestion = () => {
  const altitude = randInt(200, 500);
  const earthRadius = 6380;
  const orbitRadius = earthRadius + altitude;
  const orbitalSpeed = 7.8 * Math.sqrt(earthRadius / orbitRadius); // Simplified calculation
  const period = (2 * Math.PI * orbitRadius) / orbitalSpeed / 60; // in minutes
  
  return {
    questionText: `A satellite orbits ${altitude} km above Earth's surface. If Earth's radius is ${earthRadius} km, what is approximately the orbital period?`,
    options: [
      { id: 'a', text: `${period.toFixed(0)} minutes`, feedback: `Correct! Orbital radius = ${earthRadius} + ${altitude} = ${orbitRadius} km. Using simplified orbital mechanics, the period is approximately ${period.toFixed(0)} minutes.` },
      { id: 'b', text: `${(period * 0.7).toFixed(0)} minutes`, feedback: `This is too short. For higher orbits, the period increases. Check your calculation.` },
      { id: 'c', text: `${(period * 1.4).toFixed(0)} minutes`, feedback: `This is too long. The period should be around ${period.toFixed(0)} minutes for this altitude.` },
      { id: 'd', text: `${altitude} minutes`, feedback: `The period is not simply equal to the altitude. Use orbital mechanics: T ∝ r^(3/2)` }
    ],
    correctOptionId: 'a',
    explanation: `For a satellite at ${altitude} km altitude, the orbital radius is ${orbitRadius} km. Using Kepler's laws and simplified orbital mechanics, the period is approximately ${period.toFixed(0)} minutes.`,
    difficulty: "advanced",
    topic: "Satellite Motion"
  };
};


// ===== DYNAMICS KNOWLEDGE CHECK ASSESSMENTS =====

// Helper function to create randomized net force question
const createRandomNetForceQuestion = () => {
  const mass = randFloat(5.5, 8.5, 1);
  const acceleration = randFloat(2.2, 3.8, 1);
  const netForce = mass * acceleration;
  
  return {
    questionText: `A ${mass} kg object accelerates at ${acceleration} m/s². What is the net force acting on it?`,
    options: [
      { id: 'a', text: `${netForce.toFixed(1)} N`, feedback: `Correct! Using Newton's second law: F = ma = ${mass} kg × ${acceleration} m/s² = ${netForce.toFixed(1)} N` },
      { id: 'b', text: `${(netForce / mass).toFixed(1)} N`, feedback: `This is the acceleration value, not force. Use F = ma = ${mass} × ${acceleration} = ${netForce.toFixed(1)} N` },
      { id: 'c', text: `${(mass * 9.8).toFixed(1)} N`, feedback: `This is the object's weight, not the net force. Net force = ma = ${netForce.toFixed(1)} N` },
      { id: 'd', text: `${(netForce / 2).toFixed(1)} N`, feedback: `This is half the correct answer. Make sure you're using F = ma correctly: ${mass} × ${acceleration} = ${netForce.toFixed(1)} N` }
    ],
    correctOptionId: 'a',
    explanation: `Using Newton's second law: F = ma = ${mass} kg × ${acceleration} m/s² = ${netForce.toFixed(1)} N`,
    difficulty: "intermediate",
    topic: "Newton's Second Law"
  };
};



// Helper function to create randomized friction force question
const createRandomFrictionForceQuestion = () => {
  const mass = randFloat(8.5, 15.5, 1);
  const appliedForce = randFloat(45, 75, 1);
  const acceleration = randFloat(1.8, 3.2, 1);
  const netForce = mass * acceleration;
  const frictionForce = appliedForce - netForce;
  
  return {
    questionText: `A ${mass} kg box is pushed with ${appliedForce} N and accelerates at ${acceleration} m/s². What is the friction force?`,
    options: [
      { id: 'a', text: `${frictionForce.toFixed(1)} N`, feedback: `Correct! Net force = ma = ${mass} × ${acceleration} = ${netForce.toFixed(1)} N. Friction = Applied force - Net force = ${appliedForce} - ${netForce.toFixed(1)} = ${frictionForce.toFixed(1)} N` },
      { id: 'b', text: `${appliedForce} N`, feedback: `This is the applied force, not friction. Friction = Applied force - Net force = ${appliedForce} - ${netForce.toFixed(1)} = ${frictionForce.toFixed(1)} N` },
      { id: 'c', text: `${netForce.toFixed(1)} N`, feedback: `This is the net force, not friction. Friction = Applied force - Net force = ${appliedForce} - ${netForce.toFixed(1)} = ${frictionForce.toFixed(1)} N` },
      { id: 'd', text: `${(mass * 9.8).toFixed(1)} N`, feedback: `This is the weight of the box, not friction force. Use: Friction = Applied force - Net force = ${frictionForce.toFixed(1)} N` }
    ],
    correctOptionId: 'a',
    explanation: `Net force = ma = ${mass} kg × ${acceleration} m/s² = ${netForce.toFixed(1)} N. Since Net force = Applied force - Friction force: Friction = ${appliedForce} N - ${netForce.toFixed(1)} N = ${frictionForce.toFixed(1)} N`,
    difficulty: "intermediate",
    topic: "Friction Forces"
  };
};


// Helper function to create randomized inclined plane question
const createRandomInclinedPlaneQuestion = () => {
  const mass = randFloat(12, 25, 1);
  const angle = randFloat(25, 40, 1);
  const parallelComponent = mass * 9.8 * Math.sin(angle * Math.PI / 180);
  const perpendicularComponent = mass * 9.8 * Math.cos(angle * Math.PI / 180);
  
  return {
    questionText: `A ${mass} kg object sits on a ${angle}° inclined plane. What is the component of weight parallel to the plane?`,
    options: [
      { id: 'a', text: `${parallelComponent.toFixed(1)} N`, feedback: `Correct! Parallel component = mg sin(θ) = ${mass} × 9.8 × sin(${angle}°) = ${parallelComponent.toFixed(1)} N` },
      { id: 'b', text: `${perpendicularComponent.toFixed(1)} N`, feedback: `This is the perpendicular component (mg cos θ). Parallel component = mg sin(θ) = ${parallelComponent.toFixed(1)} N` },
      { id: 'c', text: `${(mass * 9.8).toFixed(1)} N`, feedback: `This is the total weight. Parallel component = mg sin(θ) = ${parallelComponent.toFixed(1)} N` },
      { id: 'd', text: `${(parallelComponent * 0.7).toFixed(1)} N`, feedback: `This is too small. Use: Parallel component = mg sin(θ) = ${mass} × 9.8 × sin(${angle}°) = ${parallelComponent.toFixed(1)} N` }
    ],
    correctOptionId: 'a',
    explanation: `On an inclined plane, the parallel component of weight = mg sin(θ) = ${mass} kg × 9.8 m/s² × sin(${angle}°) = ${parallelComponent.toFixed(1)} N`,
    difficulty: "intermediate",
    topic: "Inclined Planes"
  };
};



// Helper function to create randomized tension question
const createRandomTensionQuestion = () => {
  const mass1 = randFloat(3.5, 6.5, 1);
  const mass2 = randFloat(4.5, 7.5, 1);
  const totalMass = mass1 + mass2;
  const acceleration = (mass2 - mass1) * 9.8 / totalMass;
  const tension = mass1 * (9.8 + acceleration);
  
  return {
    questionText: `Two masses (${mass1} kg and ${mass2} kg) are connected by a rope over a pulley. What is the tension in the rope?`,
    options: [
      { id: 'a', text: `${tension.toFixed(1)} N`, feedback: `Correct! First find acceleration: a = (m₂ - m₁)g/(m₁ + m₂) = ${acceleration.toFixed(2)} m/s². Then tension: T = m₁(g + a) = ${mass1}(9.8 + ${acceleration.toFixed(2)}) = ${tension.toFixed(1)} N` },
      { id: 'b', text: `${(mass1 * 9.8).toFixed(1)} N`, feedback: `This is just the weight of mass 1. You need to account for the acceleration of the system. T = ${tension.toFixed(1)} N` },
      { id: 'c', text: `${(mass2 * 9.8).toFixed(1)} N`, feedback: `This is just the weight of mass 2. The tension is different from either weight when the system accelerates. T = ${tension.toFixed(1)} N` },
      { id: 'd', text: `${((mass1 + mass2) * 9.8 / 2).toFixed(1)} N`, feedback: `This is the average of the two weights, but that's not how tension works in this system. T = ${tension.toFixed(1)} N` }
    ],
    correctOptionId: 'a',
    explanation: `For an Atwood machine: acceleration = (m₂ - m₁)g/(m₁ + m₂) = (${mass2} - ${mass1}) × 9.8/(${mass1} + ${mass2}) = ${acceleration.toFixed(2)} m/s². Tension = m₁(g + a) = ${mass1}(9.8 + ${acceleration.toFixed(2)}) = ${tension.toFixed(1)} N`,
    difficulty: "advanced",
    topic: "Pulley Systems"
  };
};



// Helper function to create randomized coefficient of friction question
const createRandomCoefficientFrictionQuestion = () => {
  const mass = randFloat(15, 30, 1);
  const frictionForce = randFloat(45, 80, 1);
  const coefficient = frictionForce / (mass * 9.8);
  
  return {
    questionText: `A ${mass} kg object experiences ${frictionForce} N of friction when sliding on a horizontal surface. What is the coefficient of kinetic friction?`,
    options: [
      { id: 'a', text: `${coefficient.toFixed(2)}`, feedback: `Correct! Coefficient of friction = Friction force ÷ Normal force = ${frictionForce} N ÷ (${mass} kg × 9.8 m/s²) = ${frictionForce} ÷ ${(mass * 9.8).toFixed(1)} = ${coefficient.toFixed(2)}` },
      { id: 'b', text: `${(coefficient * 1.3).toFixed(2)}`, feedback: `This is too large. Use μ = Ff ÷ N = ${frictionForce} ÷ ${(mass * 9.8).toFixed(1)} = ${coefficient.toFixed(2)}` },
      { id: 'c', text: `${(coefficient * 0.7).toFixed(2)}`, feedback: `This is too small. Check your calculation: μ = ${frictionForce} ÷ ${(mass * 9.8).toFixed(1)} = ${coefficient.toFixed(2)}` },
      { id: 'd', text: `${(frictionForce / mass).toFixed(2)}`, feedback: `You forgot to include gravity. Use μ = Ff ÷ (mg) = ${frictionForce} ÷ (${mass} × 9.8) = ${coefficient.toFixed(2)}` }
    ],
    correctOptionId: 'a',
    explanation: `Coefficient of kinetic friction = Friction force ÷ Normal force. Since the object is on a horizontal surface, Normal force = mg = ${mass} kg × 9.8 m/s² = ${(mass * 9.8).toFixed(1)} N. Therefore: μₖ = ${frictionForce} N ÷ ${(mass * 9.8).toFixed(1)} N = ${coefficient.toFixed(2)}`,
    difficulty: "intermediate",
    topic: "Coefficient of Friction"
  };
};



// Helper function to create randomized normal force question
const createRandomNormalForceQuestion = () => {
  const mass = randFloat(8, 18, 1);
  const angle = randFloat(15, 35, 1);
  const normalForce = mass * 9.8 * Math.cos(angle * Math.PI / 180);
  
  return {
    questionText: `A ${mass} kg object rests on a ${angle}° inclined plane. What is the normal force?`,
    options: [
      { id: 'a', text: `${normalForce.toFixed(1)} N`, feedback: `Correct! Normal force = mg cos(θ) = ${mass} × 9.8 × cos(${angle}°) = ${normalForce.toFixed(1)} N` },
      { id: 'b', text: `${(mass * 9.8).toFixed(1)} N`, feedback: `This is the total weight. On an incline, normal force = mg cos(θ) = ${normalForce.toFixed(1)} N` },
      { id: 'c', text: `${(mass * 9.8 * Math.sin(angle * Math.PI / 180)).toFixed(1)} N`, feedback: `This is the parallel component (mg sin θ). Normal force = mg cos(θ) = ${normalForce.toFixed(1)} N` },
      { id: 'd', text: `${(normalForce * 0.8).toFixed(1)} N`, feedback: `This is too small. Use: Normal force = mg cos(θ) = ${mass} × 9.8 × cos(${angle}°) = ${normalForce.toFixed(1)} N` }
    ],
    correctOptionId: 'a',
    explanation: `On an inclined plane, the normal force = mg cos(θ) = ${mass} kg × 9.8 m/s² × cos(${angle}°) = ${normalForce.toFixed(1)} N`,
    difficulty: "intermediate",
    topic: "Normal Force"
  };
};



// Helper function to create randomized acceleration question
const createRandomAccelerationVectorQuestion = () => {
  const mass = randFloat(12, 25, 1);
  const eastForce = randFloat(35, 55, 1);
  const northForce = randFloat(25, 45, 1);
  const netForce = Math.sqrt(eastForce * eastForce + northForce * northForce);
  const acceleration = netForce / mass;
  const angle = Math.atan(northForce / eastForce) * (180 / Math.PI);
  
  return {
    questionText: `A ${mass} kg object experiences forces of ${eastForce} N east and ${northForce} N north. What is the acceleration?`,
    options: [
      { id: 'a', text: `${acceleration.toFixed(1)} m/s² @ ${angle.toFixed(0)}° N of E`, feedback: `Correct! Net force = √(${eastForce}² + ${northForce}²) = ${netForce.toFixed(1)} N. Acceleration = F/m = ${netForce.toFixed(1)}/${mass} = ${acceleration.toFixed(1)} m/s² @ ${angle.toFixed(0)}° N of E` },
      { id: 'b', text: `${(acceleration * 0.85).toFixed(1)} m/s² @ ${angle.toFixed(0)}° N of E`, feedback: `The direction is correct but magnitude is wrong. Use a = F_net/m = ${netForce.toFixed(1)}/${mass} = ${acceleration.toFixed(1)} m/s²` },
      { id: 'c', text: `${acceleration.toFixed(1)} m/s² @ ${(90 - angle).toFixed(0)}° N of E`, feedback: `The magnitude is correct but angle is wrong. Use tan⁻¹(${northForce}/${eastForce}) = ${angle.toFixed(0)}° N of E` },
      { id: 'd', text: `${(eastForce / mass).toFixed(1)} m/s² @ ${angle.toFixed(0)}° N of E`, feedback: `You only used the east component. Net force = √(${eastForce}² + ${northForce}²) = ${netForce.toFixed(1)} N, so a = ${acceleration.toFixed(1)} m/s²` }
    ],
    correctOptionId: 'a',
    explanation: `Net force magnitude = √(F_east² + F_north²) = √(${eastForce}² + ${northForce}²) = ${netForce.toFixed(1)} N. Direction = tan⁻¹(${northForce}/${eastForce}) = ${angle.toFixed(0)}° N of E. Acceleration = F_net/m = ${netForce.toFixed(1)} N / ${mass} kg = ${acceleration.toFixed(1)} m/s² @ ${angle.toFixed(0)}° N of E`,
    difficulty: "intermediate",
    topic: "Vector Acceleration"
  };
};



// Helper function to create randomized elevator question
const createRandomElevatorQuestion = () => {
  const mass = randFloat(45, 75, 1);
  const acceleration = randFloat(1.5, 2.8, 1);
  const direction = Math.random() > 0.5 ? 'up' : 'down';
  let apparentWeight;
  
  if (direction === 'up') {
    apparentWeight = mass * (9.8 + acceleration);
  } else {
    apparentWeight = mass * (9.8 - acceleration);
  }
  
  return {
    questionText: `A ${mass} kg person stands on a scale in an elevator accelerating ${acceleration} m/s² ${direction}ward. What does the scale read?`,
    options: [
      { id: 'a', text: `${apparentWeight.toFixed(0)} N`, feedback: `Correct! When accelerating ${direction}ward: F_scale = m(g ${direction === 'up' ? '+' : '-'} a) = ${mass}(9.8 ${direction === 'up' ? '+' : '-'} ${acceleration}) = ${apparentWeight.toFixed(0)} N` },
      { id: 'b', text: `${(mass * 9.8).toFixed(0)} N`, feedback: `This would be the reading if the elevator had constant velocity. With acceleration, the scale reads ${apparentWeight.toFixed(0)} N` },
      { id: 'c', text: `${direction === 'up' ? (mass * (9.8 - acceleration)).toFixed(0) : (mass * (9.8 + acceleration)).toFixed(0)} N`, feedback: `You have the formula backwards. When accelerating ${direction}ward: F_scale = mg ${direction === 'up' ? '+' : '-'} ma = ${apparentWeight.toFixed(0)} N` },
      { id: 'd', text: `${(mass * acceleration).toFixed(0)} N`, feedback: `This is just ma. The scale reads the normal force: F_scale = m(g ${direction === 'up' ? '+' : '-'} a) = ${apparentWeight.toFixed(0)} N` }
    ],
    correctOptionId: 'a',
    explanation: `In an accelerating elevator, the scale reads the normal force. Using Newton's second law: F_scale - mg = ma (for upward acceleration) or mg - F_scale = ma (for downward acceleration). Therefore: F_scale = m(g ${direction === 'up' ? '+' : '-'} a) = ${mass} kg × (9.8 ${direction === 'up' ? '+' : '-'} ${acceleration}) m/s² = ${apparentWeight.toFixed(0)} N`,
    difficulty: "intermediate",
    topic: "Apparent Weight"
  };
};


// Helper function to create randomized static friction question
const createRandomStaticFrictionQuestion = () => {
  const mass = randFloat(18, 35, 1);
  const coefficient = randFloat(0.15, 0.45, 2);
  const maxStaticFriction = coefficient * mass * 9.8;
  const appliedForce = randFloat(maxStaticFriction * 0.7, maxStaticFriction * 0.9, 1);
  
  return {
    questionText: `A ${mass} kg box sits on a surface with μₛ = ${coefficient}. If you push with ${appliedForce} N horizontally, what is the friction force?`,
    options: [
      { id: 'a', text: `${appliedForce} N`, feedback: `Correct! Since the applied force (${appliedForce} N) is less than the maximum static friction (${maxStaticFriction.toFixed(1)} N), the box doesn't slide. Static friction equals the applied force to maintain equilibrium.` },
      { id: 'b', text: `${maxStaticFriction.toFixed(1)} N`, feedback: `This is the maximum static friction, but the box isn't sliding. Static friction only equals the applied force: ${appliedForce} N` },
      { id: 'c', text: `${(coefficient * mass * 9.8 * 0.5).toFixed(1)} N`, feedback: `This uses kinetic friction formula. Since the box isn't moving, static friction = applied force = ${appliedForce} N` },
      { id: 'd', text: `${(mass * 9.8).toFixed(1)} N`, feedback: `This is the normal force (weight). Static friction = applied force = ${appliedForce} N (as long as it doesn't exceed maximum)` }
    ],
    correctOptionId: 'a',
    explanation: `Maximum static friction = μₛN = ${coefficient} × ${mass} × 9.8 = ${maxStaticFriction.toFixed(1)} N. Since the applied force (${appliedForce} N) is less than this maximum, the box remains stationary. Static friction adjusts to equal the applied force: ${appliedForce} N`,
    difficulty: "intermediate",
    topic: "Static Friction"
  };
};



// Helper function to create randomized ball speed question for circular motion
const createRandomBallSpeedQuestion = () => {
  const radius = randFloat(2.0, 4.0, 1);
  const period = randFloat(0.8, 1.5, 2);
  const speed = (2 * Math.PI * radius) / period;
  
  return {
    questionText: `A ball moves in a horizontal circle with a radius of ${radius} m. If the ball completes one revolution in ${period} s, what is the ball's speed?`,
    options: [
      { id: 'a', text: `${speed.toFixed(1)} m/s`, feedback: `Correct! Speed = circumference ÷ period = 2πr ÷ T = 2π(${radius}) ÷ ${period} = ${speed.toFixed(1)} m/s` },
      { id: 'b', text: `${(speed * 0.5).toFixed(1)} m/s`, feedback: "This is too small. Remember that speed = 2πr/T for circular motion." },
      { id: 'c', text: `${(speed * 2).toFixed(1)} m/s`, feedback: "This is too large. Check your calculation: speed = 2πr/T." },
      { id: 'd', text: `${(radius / period).toFixed(1)} m/s`, feedback: "This uses radius instead of circumference. Speed = 2πr/T, not r/T." }
    ],
    correctOptionId: 'a',
    explanation: `For circular motion, speed = circumference ÷ period = 2πr ÷ T = 2π(${radius}) ÷ ${period} = ${speed.toFixed(1)} m/s`,
    difficulty: "intermediate",
    topic: "Circular Motion"
  };
};



// Helper function to create randomized rope tension question
const createRandomRopeTensionQuestion = () => {
  const mass = randFloat(0.8, 1.5, 1);
  const radius = randFloat(2.0, 3.5, 1);
  const period = randFloat(0.8, 1.2, 2);
  const speed = (2 * Math.PI * radius) / period;
  const centripetalForce = (mass * speed * speed) / radius;
  const weight = mass * 9.8;
  const tension = centripetalForce + weight;
  
  const formatScientific = (num) => {
    if (num >= 100) {
      return `${(num / 100).toFixed(1)} × 10² N`;
    } else {
      return `${num.toFixed(0)} N`;
    }
  };
  
  return {
    questionText: `A ${mass} kg ball at the end of a ${radius} m rope rotates once every ${period} s. What is the tension in the rope?`,
    options: [
      { id: 'a', text: formatScientific(tension), feedback: `Correct! Tension = mv²/r + mg = (${mass})(${speed.toFixed(1)})²/${radius} + (${mass})(9.8) = ${centripetalForce.toFixed(1)} + ${weight.toFixed(1)} = ${formatScientific(tension)}` },
      { id: 'b', text: formatScientific(tension * 0.85), feedback: "This is too small. Remember to add both centripetal force and weight: T = mv²/r + mg" },
      { id: 'c', text: formatScientific(tension * 1.2), feedback: `This is too large. Check your calculation: mv²/r + mg = (${mass})(${speed.toFixed(1)})²/${radius} + ${weight.toFixed(1)}` },
      { id: 'd', text: formatScientific(weight), feedback: "This is just the weight. You need to add the centripetal force: T = mv²/r + mg" }
    ],
    correctOptionId: 'a',
    explanation: `For vertical circular motion, tension = centripetal force + weight. First find speed: v = 2πr/T = ${speed.toFixed(1)} m/s. Then T = mv²/r + mg = (${mass} kg)(${speed.toFixed(1)} m/s)²/(${radius} m) + (${mass} kg)(9.8 m/s²) = ${centripetalForce.toFixed(1)} N + ${weight.toFixed(1)} N = ${formatScientific(tension)}`,
    difficulty: "intermediate",
    topic: "Circular Motion"
  };
};



// Helper function to create randomized car friction question
const createRandomCarFrictionQuestion = () => {
  const mass = randInt(700, 1000);
  const speed = randFloat(25, 35, 1);
  const radius = randInt(80, 130);
  const centripetalForce = (mass * speed * speed) / radius;
  
  const formatLargeNumber = (num) => {
    return `${(num / 1000).toFixed(2)} × 10³ N`;
  };
  
  return {
    questionText: `A car with a mass of ${mass} kg rounds an unbanked curve in the road at a speed of ${speed} m/s. If the radius of the curve is ${radius} m, what is the minimum frictional force required to keep the car on the road?`,
    options: [
      { id: 'a', text: formatLargeNumber(centripetalForce), feedback: `Correct! Centripetal force = mv²/r = (${mass})(${speed})²/${radius} = (${mass})(${(speed * speed).toFixed(0)})/${radius} = ${formatLargeNumber(centripetalForce)}` },
      { id: 'b', text: formatLargeNumber(centripetalForce * 0.85), feedback: `This is too small. Check your calculation: (${mass} kg)(${speed} m/s)²/(${radius} m)` },
      { id: 'c', text: formatLargeNumber(centripetalForce * 1.2), feedback: `This is too large. Make sure you're using the correct values: mv²/r = (${mass})(${(speed * speed).toFixed(0)})/${radius}` },
      { id: 'd', text: formatLargeNumber(centripetalForce * 0.7), feedback: `This is too small. The centripetal force needed is mv²/r = (${mass})(${speed})²/${radius}` }
    ],
    correctOptionId: 'a',
    explanation: `For an unbanked curve, friction provides the centripetal force. F_friction = F_centripetal = mv²/r = (${mass} kg)(${speed} m/s)²/(${radius} m) = (${mass})(${(speed * speed).toFixed(0)})/${radius} = ${formatLargeNumber(centripetalForce)}`,
    difficulty: "intermediate",
    topic: "Circular Motion"
  };
};






// Helper function to create randomized angled pull with friction question
const createRandomAngledPullFrictionQuestion = () => {
  const mass = randInt(20, 30);
  const pullForce = randInt(100, 140);
  const pullAngle = randInt(20, 30);
  const frictionCoefficient = randFloat(0.25, 0.35, 2);
  
  const horizontalComponent = pullForce * Math.cos(pullAngle * Math.PI / 180);
  const verticalComponent = pullForce * Math.sin(pullAngle * Math.PI / 180);
  const normalForce = mass * 9.8 - verticalComponent;
  const frictionForce = frictionCoefficient * normalForce;
  const netForce = horizontalComponent - frictionForce;
  const acceleration = netForce / mass;
  
  return {
    questionText: `A ${mass} kg object is pulled across a horizontal surface with a force of ${pullForce} N at an angle of ${pullAngle}° above the horizontal. The coefficient of kinetic friction is ${frictionCoefficient}. What is the acceleration?`,
    options: [
      { id: 'a', text: `${acceleration.toFixed(1)} m/s²`, feedback: `Correct! Horizontal force: Fx = ${pullForce}cos(${pullAngle}°) = ${horizontalComponent.toFixed(1)} N. Vertical force: Fy = ${pullForce}sin(${pullAngle}°) = ${verticalComponent.toFixed(1)} N. Normal force: N = mg - Fy = ${mass}(9.8) - ${verticalComponent.toFixed(1)} = ${normalForce.toFixed(1)} N. Friction: f = μN = ${frictionCoefficient}(${normalForce.toFixed(1)}) = ${frictionForce.toFixed(1)} N. Net force: Fnet = ${horizontalComponent.toFixed(1)} - ${frictionForce.toFixed(1)} = ${netForce.toFixed(1)} N. Acceleration: a = ${netForce.toFixed(1)}/${mass} = ${acceleration.toFixed(1)} m/s²` },
      { id: 'b', text: `${(acceleration * 0.8).toFixed(1)} m/s²`, feedback: `This is too small. Check your normal force calculation: N = mg - Fy where Fy is the upward component of the pull.` },
      { id: 'c', text: `${(acceleration * 1.3).toFixed(1)} m/s²`, feedback: `This is too large. Make sure you're subtracting friction and accounting for the reduced normal force.` },
      { id: 'd', text: `${(horizontalComponent / mass).toFixed(1)} m/s²`, feedback: `This ignores friction. You must subtract the friction force from the horizontal component.` }
    ],
    correctOptionId: 'a',
    explanation: `Horizontal component of pull: Fx = ${pullForce}cos(${pullAngle}°) = ${horizontalComponent.toFixed(1)} N. Vertical component: Fy = ${pullForce}sin(${pullAngle}°) = ${verticalComponent.toFixed(1)} N. Normal force: N = mg - Fy = ${mass}(9.8) - ${verticalComponent.toFixed(1)} = ${normalForce.toFixed(1)} N. Friction force: f = μN = ${frictionCoefficient} × ${normalForce.toFixed(1)} = ${frictionForce.toFixed(1)} N. Net horizontal force: ${horizontalComponent.toFixed(1)} - ${frictionForce.toFixed(1)} = ${netForce.toFixed(1)} N. Acceleration: a = ${netForce.toFixed(1)}/${mass} = ${acceleration.toFixed(1)} m/s²`,
    difficulty: "advanced",
    topic: "Complex Forces with Friction"
  };
};



// ===== ASSESSMENT CONFIGURATIONS FOR MASTER FUNCTION =====
// Export all assessment configurations for use by the master function
const assessmentConfigs = {
  'course2_01_physics_20_review_question1': {
    questions: [
      createRandomDisplacementQuestion(),
      createRandomDisplacementQuestion(),
      createRandomDisplacementQuestion(),
      createRandomDisplacementQuestion(),
      createRandomDisplacementQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question2': {
    questions: [
      createRandomSpeedTimeQuestion(),
      createRandomSpeedTimeQuestion(),
      createRandomSpeedTimeQuestion(),
      createRandomSpeedTimeQuestion(),
      createRandomSpeedTimeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question3': {
    questions: [
      createRandomAverageSpeedQuestion(),
      createRandomAverageSpeedQuestion(),
      createRandomAverageSpeedQuestion(),
      createRandomAverageSpeedQuestion(),
      createRandomAverageSpeedQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question4': {
    questions: [
      createRandomAccelerationQuestion(),
      createRandomAccelerationQuestion(),
      createRandomAccelerationQuestion(),
      createRandomAccelerationQuestion(),
      createRandomAccelerationQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question5': {
    questions: [
      createRandomVerticalMotionQuestion(),
      createRandomVerticalMotionQuestion(),
      createRandomVerticalMotionQuestion(),
      createRandomVerticalMotionQuestion(),
      createRandomVerticalMotionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question6': {
    questions: [
      createRandomSlopeMotionQuestion(),
      createRandomSlopeMotionQuestion(),
      createRandomSlopeMotionQuestion(),
      createRandomSlopeMotionQuestion(),
      createRandomSlopeMotionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question7': {
    questions: [
      createRandomElectronAccelerationQuestion(),
      createRandomElectronAccelerationQuestion(),
      createRandomElectronAccelerationQuestion(),
      createRandomElectronAccelerationQuestion(),
      createRandomElectronAccelerationQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question8': {
    questions: [
      createRandomProjectileTimeQuestion(),
      createRandomProjectileTimeQuestion(),
      createRandomProjectileTimeQuestion(),
      createRandomProjectileTimeQuestion(),
      createRandomProjectileTimeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question9': {
    questions: [
      createRandomFallingObjectQuestion(),
      createRandomFallingObjectQuestion(),
      createRandomFallingObjectQuestion(),
      createRandomFallingObjectQuestion(),
      createRandomFallingObjectQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question10': {
    questions: [
      createRandomFreeFallQuestion(),
      createRandomFreeFallQuestion(),
      createRandomFreeFallQuestion(),
      createRandomFreeFallQuestion(),
      createRandomFreeFallQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question11': {
    questions: [
      createRandomMaxHeightQuestion(),
      createRandomMaxHeightQuestion(),
      createRandomMaxHeightQuestion(),
      createRandomMaxHeightQuestion(),
      createRandomMaxHeightQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_question12': {
    questions: [
      createRandomHorizontalProjectileQuestion(),
      createRandomHorizontalProjectileQuestion(),
      createRandomHorizontalProjectileQuestion(),
      createRandomHorizontalProjectileQuestion(),
      createRandomHorizontalProjectileQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_vector_q1': {
    questions: [
      createRandomSkiLiftQuestion(),
      createRandomSkiLiftQuestion(),
      createRandomSkiLiftQuestion(),
      createRandomSkiLiftQuestion(),
      createRandomSkiLiftQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_vector_q2': {
    questions: [
      createRandomDistanceBearingQuestion(),
      createRandomDistanceBearingQuestion(),
      createRandomDistanceBearingQuestion(),
      createRandomDistanceBearingQuestion(),
      createRandomDistanceBearingQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_circular_q1': {
    questions: [
      createRandomCircularMotionQuestion(),
      createRandomCircularMotionQuestion(),
      createRandomCircularMotionQuestion(),
      createRandomCircularMotionQuestion(),
      createRandomCircularMotionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_circular_q2': {
    questions: [
      createRandomCarCorneringQuestion(),
      createRandomCarCorneringQuestion(),
      createRandomCarCorneringQuestion(),
      createRandomCarCorneringQuestion(),
      createRandomCarCorneringQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_circular_q3': {
    questions: [
      createRandomSatelliteMotionQuestion(),
      createRandomSatelliteMotionQuestion(),
      createRandomSatelliteMotionQuestion(),
      createRandomSatelliteMotionQuestion(),
      createRandomSatelliteMotionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q1a': {
    questions: [
      createRandomNetForceQuestion(),
      createRandomNetForceQuestion(),
      createRandomNetForceQuestion(),
      createRandomNetForceQuestion(),
      createRandomNetForceQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q2': {
    questions: [
      createRandomFrictionForceQuestion(),
      createRandomFrictionForceQuestion(),
      createRandomFrictionForceQuestion(),
      createRandomFrictionForceQuestion(),
      createRandomFrictionForceQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q3': {
    questions: [
      createRandomInclinedPlaneQuestion(),
      createRandomInclinedPlaneQuestion(),
      createRandomInclinedPlaneQuestion(),
      createRandomInclinedPlaneQuestion(),
      createRandomInclinedPlaneQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q4': {
    questions: [
      createRandomTensionQuestion(),
      createRandomTensionQuestion(),
      createRandomTensionQuestion(),
      createRandomTensionQuestion(),
      createRandomTensionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q5': {
    questions: [
      createRandomCoefficientFrictionQuestion(),
      createRandomCoefficientFrictionQuestion(),
      createRandomCoefficientFrictionQuestion(),
      createRandomCoefficientFrictionQuestion(),
      createRandomCoefficientFrictionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q6': {
    questions: [
      createRandomNormalForceQuestion(),
      createRandomNormalForceQuestion(),
      createRandomNormalForceQuestion(),
      createRandomNormalForceQuestion(),
      createRandomNormalForceQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q7': {
    questions: [
      createRandomAccelerationVectorQuestion(),
      createRandomAccelerationVectorQuestion(),
      createRandomAccelerationVectorQuestion(),
      createRandomAccelerationVectorQuestion(),
      createRandomAccelerationVectorQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q8': {
    questions: [
      createRandomElevatorQuestion(),
      createRandomElevatorQuestion(),
      createRandomElevatorQuestion(),
      createRandomElevatorQuestion(),
      createRandomElevatorQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_01_physics_20_review_dynamics_q9': {
    questions: [
      createRandomStaticFrictionQuestion(),
      createRandomStaticFrictionQuestion(),
      createRandomStaticFrictionQuestion(),
      createRandomStaticFrictionQuestion(),
      createRandomStaticFrictionQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  }
};

exports.assessmentConfigs = assessmentConfigs;