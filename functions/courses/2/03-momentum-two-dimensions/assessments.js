/**
 * Assessment Functions for Momentum in Two Dimensions
 * Course: 2 (Physics 30)
 * Content: 03-momentum-two-dimensions
 * 
 * This module provides assessments for two-dimensional momentum concepts
 * using the shared assessment system with Physics 30 specific configuration.
 */

const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ===== HELPER FUNCTIONS FOR RANDOMIZATION =====
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

// Vector helper functions
const vectorMagnitude = (x, y) => Math.sqrt(x * x + y * y);
const vectorAngle = (x, y) => {
  let angle = Math.atan2(y, x) * 180 / Math.PI;
  if (angle < 0) angle += 360;
  return angle;
};

// ===== TWO-DIMENSIONAL MOMENTUM PRACTICE PROBLEMS =====

// Question 1: Car-truck collision in 2D
const createCarTruckCollision2DQuestion = () => {
  const m_car = randFloat(1.2e3, 1.6e3, 0); // Car mass: 1200-1600 kg
  const v_car = randFloat(35, 40, 1); // Car speed: 35-40 km/h (westbound)
  const m_truck = randFloat(1.8e3, 2.2e3, 0); // Truck mass: 1800-2200 kg
  const v_truck = randFloat(32, 38, 1); // Truck speed: 32-38 km/h (northbound)
  
  // Initial momentum components
  const p_car_x = -m_car * v_car; // Westbound (negative x)
  const p_car_y = 0;
  const p_truck_x = 0;
  const p_truck_y = m_truck * v_truck; // Northbound (positive y)
  
  // Total momentum components
  const p_total_x = p_car_x + p_truck_x;
  const p_total_y = p_car_y + p_truck_y;
  
  // Combined mass
  const m_total = m_car + m_truck;
  
  // Final velocity components
  const v_final_x = p_total_x / m_total;
  const v_final_y = p_total_y / m_total;
  
  // Final velocity magnitude and direction
  const v_final_magnitude = vectorMagnitude(v_final_x, v_final_y);
  const angle_from_west = vectorAngle(-v_final_x, v_final_y); // Angle N of W
  
  // Create distractors
  const wrong1 = parseFloat((v_final_magnitude * 1.1).toFixed(1));
  const wrong2 = parseFloat((v_final_magnitude * 0.9).toFixed(1));
  const wrong3 = parseFloat((angle_from_west * 1.1).toFixed(1));
  
  return {
    questionText: `A ${m_car.toExponential(1)} kg car traveling westbound at ${v_car} km/h collides with a ${m_truck.toExponential(1)} kg northbound truck at ${v_truck} km/h. If they lock together, what is their final velocity?`,
    options: [
      { id: 'a', text: `${v_final_magnitude.toFixed(1)} km/h @ ${angle_from_west.toFixed(1)}° N of W`, feedback: `Correct! Using 2D momentum conservation: p_x = ${p_total_x.toFixed(0)}, p_y = ${p_total_y.toFixed(0)}. Final velocity = ${v_final_magnitude.toFixed(1)} km/h @ ${angle_from_west.toFixed(1)}° N of W` },
      { id: 'b', text: `${wrong1} km/h @ ${angle_from_west.toFixed(1)}° N of W`, feedback: "Check your momentum conservation calculation. Make sure you're using the correct masses." },
      { id: 'c', text: `${v_final_magnitude.toFixed(1)} km/h @ ${wrong3.toFixed(1)}° N of W`, feedback: "The magnitude is correct, but check your angle calculation using atan2(p_y, -p_x)." },
      { id: 'd', text: `${wrong2} km/h @ ${angle_from_west.toFixed(1)}° N of W`, feedback: "Your angle is correct, but verify your magnitude calculation from the momentum components." }
    ],
    correctOptionId: 'a',
    explanation: `In 2D collisions: p_x = m₁v₁ₓ + m₂v₂ₓ = ${p_total_x.toFixed(0)} kg·km/h, p_y = m₁v₁ᵧ + m₂v₂ᵧ = ${p_total_y.toFixed(0)} kg·km/h. Final: |v| = √(vₓ² + vᵧ²) = ${v_final_magnitude.toFixed(1)} km/h, θ = ${angle_from_west.toFixed(1)}° N of W`,
    difficulty: "intermediate",
    topic: "2D Inelastic Collision"
  };
};

exports.course2_03_car_truck_2d_collision = createStandardMultipleChoice({
  questions: [
    createCarTruckCollision2DQuestion(),
    createCarTruckCollision2DQuestion(),
    createCarTruckCollision2DQuestion(),
    createCarTruckCollision2DQuestion(),
    createCarTruckCollision2DQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 3,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// Question 2: Nuclear decay with three particles
const createNuclearDecayQuestion = () => {
  const p_electron = randFloat(8.5e-21, 9.5e-21, 22); // Electron momentum: 8.5-9.5 x 10^-21 kg·m/s east
  const p_neutrino = randFloat(4.5e-21, 5.1e-21, 22); // Neutrino momentum: 4.5-5.1 x 10^-21 kg·m/s south
  
  // Momentum components (electron east = +x, neutrino south = -y)
  const p_e_x = p_electron;
  const p_e_y = 0;
  const p_n_x = 0;
  const p_n_y = -p_neutrino; // South is negative y
  
  // Nucleus momentum (conservation requires total = 0)
  const p_nucleus_x = -(p_e_x + p_n_x);
  const p_nucleus_y = -(p_e_y + p_n_y);
  
  // Nucleus momentum magnitude and direction
  const p_nucleus_magnitude = vectorMagnitude(p_nucleus_x, p_nucleus_y);
  const angle_from_west = vectorAngle(-p_nucleus_x, p_nucleus_y); // Angle N of W
  
  // Mass and velocity
  const m_nucleus = randFloat(3.4e-25, 3.8e-25, 26);
  const v_nucleus = p_nucleus_magnitude / m_nucleus;
  
  // Create distractors
  const wrong_angle1 = parseFloat((angle_from_west * 1.1).toFixed(1));
  const wrong_angle2 = parseFloat((angle_from_west * 0.9).toFixed(1));
  const wrong_p = parseFloat((p_nucleus_magnitude * 1.1).toExponential(1));
  
  return {
    questionText: `A nucleus at rest decays, emitting an electron eastward (momentum ${p_electron.toExponential(1)} kg·m/s) and a neutrino southward (momentum ${p_neutrino.toExponential(1)} kg·m/s). In what direction does the residual nucleus move? What is its momentum magnitude? If the nucleus mass is ${m_nucleus.toExponential(1)} kg, what is its velocity?`,
    options: [
      { id: 'a', text: `${angle_from_west.toFixed(1)}° N of W, ${p_nucleus_magnitude.toExponential(1)} kg·m/s, ${v_nucleus.toExponential(1)} m/s`, feedback: `Correct! By momentum conservation: p_nucleus = -(p_electron + p_neutrino). Direction: ${angle_from_west.toFixed(1)}° N of W, |p| = ${p_nucleus_magnitude.toExponential(1)} kg·m/s, v = ${v_nucleus.toExponential(1)} m/s` },
      { id: 'b', text: `${wrong_angle1.toFixed(1)}° N of W, ${p_nucleus_magnitude.toExponential(1)} kg·m/s, ${v_nucleus.toExponential(1)} m/s`, feedback: "Check your angle calculation. Use atan2(p_y, -p_x) for angle N of W." },
      { id: 'c', text: `${angle_from_west.toFixed(1)}° N of W, ${wrong_p} kg·m/s, ${(wrong_p / m_nucleus).toExponential(1)} m/s`, feedback: "Your angle is correct, but check your momentum magnitude calculation." },
      { id: 'd', text: `${wrong_angle2.toFixed(1)}° N of W, ${p_nucleus_magnitude.toExponential(1)} kg·m/s, ${v_nucleus.toExponential(1)} m/s`, feedback: "Close on the angle, but verify your vector components and atan2 calculation." }
    ],
    correctOptionId: 'a',
    explanation: `Conservation: pₜₒₜₐₗ = 0. So p_nucleus = -(${p_electron.toExponential(1)}î - ${p_neutrino.toExponential(1)}ĵ) = ${p_nucleus_x.toExponential(1)}î + ${p_nucleus_y.toExponential(1)}ĵ. |p| = ${p_nucleus_magnitude.toExponential(1)} kg·m/s, θ = ${angle_from_west.toFixed(1)}° N of W, v = ${v_nucleus.toExponential(1)} m/s`,
    difficulty: "advanced",
    topic: "Nuclear Decay Conservation"
  };
};

exports.course2_03_nuclear_decay_2d = createStandardMultipleChoice({
  questions: [
    createNuclearDecayQuestion(),
    createNuclearDecayQuestion(),
    createNuclearDecayQuestion(),
    createNuclearDecayQuestion(),
    createNuclearDecayQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 3,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// Question 3: Glancing collision of steel balls
const createGlancingCollisionQuestion = () => {
  const m1 = randFloat(0.45, 0.55, 2); // Ball 1 mass: 0.45-0.55 kg
  const v1i = randFloat(1.8, 2.2, 1); // Ball 1 initial speed: 1.8-2.2 m/s
  const m2 = randFloat(0.25, 0.35, 2); // Ball 2 mass: 0.25-0.35 kg (initially at rest)
  const theta1 = randFloat(28, 32, 1); // Ball 1 deflection angle: 28-32°
  const v1f = randFloat(1.4, 1.6, 2); // Ball 1 final speed: 1.4-1.6 m/s
  
  // Convert angle to radians
  const theta1_rad = theta1 * Math.PI / 180;
  
  // Initial momentum components
  const p1i_x = m1 * v1i;
  const p1i_y = 0;
  const p2i_x = 0;
  const p2i_y = 0;
  
  // Ball 1 final momentum components
  const p1f_x = m1 * v1f * Math.cos(theta1_rad);
  const p1f_y = m1 * v1f * Math.sin(theta1_rad);
  
  // Ball 2 final momentum (by conservation)
  const p2f_x = p1i_x - p1f_x;
  const p2f_y = p1i_y - p1f_y;
  
  // Ball 2 final velocity
  const v2f_x = p2f_x / m2;
  const v2f_y = p2f_y / m2;
  const v2f_magnitude = vectorMagnitude(v2f_x, v2f_y);
  const theta2 = Math.atan2(v2f_y, v2f_x) * 180 / Math.PI;
  
  // Create distractors
  const wrong_v = parseFloat((v2f_magnitude * 1.1).toFixed(1));
  const wrong_angle = parseFloat((theta2 * 1.1).toFixed(0));
  const wrong_v2 = parseFloat((v2f_magnitude * 0.9).toFixed(1));
  
  return {
    questionText: `A ${m1} kg steel ball moving at ${v1i} m/s strikes a ${m2} kg ball at rest. The first ball deflects at ${theta1}° with speed ${v1f} m/s. What is the velocity of the second ball?`,
    options: [
      { id: 'a', text: `${v2f_magnitude.toFixed(1)} m/s @ ${theta2.toFixed(0)}°`, feedback: `Correct! Using 2D momentum conservation: p₂ₓ = ${p2f_x.toFixed(2)} kg·m/s, p₂ᵧ = ${p2f_y.toFixed(2)} kg·m/s. Final velocity: ${v2f_magnitude.toFixed(1)} m/s @ ${theta2.toFixed(0)}°` },
      { id: 'b', text: `${wrong_v} m/s @ ${theta2.toFixed(0)}°`, feedback: "Check your momentum conservation calculation. Verify the momentum components for both balls." },
      { id: 'c', text: `${v2f_magnitude.toFixed(1)} m/s @ ${wrong_angle}°`, feedback: "The magnitude is correct, but check your angle calculation using atan2(p_y, p_x)." },
      { id: 'd', text: `${wrong_v2} m/s @ ${theta2.toFixed(0)}°`, feedback: "Your angle is correct, but verify your momentum conservation and magnitude calculation." }
    ],
    correctOptionId: 'a',
    explanation: `Conservation of momentum: p₁ᵢ = p₁f + p₂f. Components: p₂ₓ = ${p1i_x.toFixed(1)} - ${p1f_x.toFixed(1)} = ${p2f_x.toFixed(1)} kg·m/s, p₂ᵧ = 0 - ${p1f_y.toFixed(1)} = ${p2f_y.toFixed(1)} kg·m/s. Result: ${v2f_magnitude.toFixed(1)} m/s @ ${theta2.toFixed(0)}°`,
    difficulty: "advanced",
    topic: "2D Glancing Collision"
  };
};

exports.course2_03_glancing_collision_2d = createStandardMultipleChoice({
  questions: [
    createGlancingCollisionQuestion(),
    createGlancingCollisionQuestion(),
    createGlancingCollisionQuestion(),
    createGlancingCollisionQuestion(),
    createGlancingCollisionQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 3,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// Question 4: Space capsule firing projectile
const createSpaceCapsuleQuestion = () => {
  const m_capsule = randFloat(2800, 3200, 0); // Capsule mass: 2800-3200 kg
  const v_capsule_i = randFloat(190, 210, 0); // Initial velocity: 190-210 m/s
  const m_projectile = randFloat(22, 28, 1); // Projectile mass: 22-28 kg
  const v_projectile = randFloat(1900, 2100, 0); // Projectile velocity: 1900-2100 m/s (perpendicular)
  
  // Initial momentum (capsule moving in x direction)
  const p_initial_x = m_capsule * v_capsule_i;
  const p_initial_y = 0;
  
  // Final momentum components
  const p_projectile_x = 0; // Perpendicular to original motion
  const p_projectile_y = m_projectile * v_projectile;
  
  // New capsule mass and momentum
  const m_capsule_new = m_capsule - m_projectile;
  const p_capsule_new_x = p_initial_x - p_projectile_x;
  const p_capsule_new_y = p_initial_y - p_projectile_y;
  
  // New capsule velocity
  const v_capsule_new_x = p_capsule_new_x / m_capsule_new;
  const v_capsule_new_y = p_capsule_new_y / m_capsule_new;
  const v_capsule_new_magnitude = vectorMagnitude(v_capsule_new_x, v_capsule_new_y);
  const angle_from_original = Math.abs(Math.atan2(v_capsule_new_y, v_capsule_new_x) * 180 / Math.PI);
  
  // Create distractors
  const wrong_v = parseFloat((v_capsule_new_magnitude * 1.05).toFixed(1));
  const wrong_angle = parseFloat((angle_from_original * 1.2).toFixed(2));
  const wrong_v2 = parseFloat((v_capsule_new_magnitude * 0.95).toFixed(1));
  
  return {
    questionText: `A ${m_capsule} kg space capsule traveling at ${v_capsule_i} m/s fires a ${m_projectile} kg projectile perpendicular to its motion at ${v_projectile} m/s. What is the capsule's new velocity?`,
    options: [
      { id: 'a', text: `${v_capsule_new_magnitude.toFixed(0)} m/s @ ${angle_from_original.toFixed(2)}° from original direction`, feedback: `Correct! Conservation gives: vₓ = ${v_capsule_new_x.toFixed(1)} m/s, vᵧ = ${v_capsule_new_y.toFixed(1)} m/s. New velocity: ${v_capsule_new_magnitude.toFixed(0)} m/s @ ${angle_from_original.toFixed(2)}° from original line` },
      { id: 'b', text: `${wrong_v.toFixed(0)} m/s @ ${angle_from_original.toFixed(2)}° from original direction`, feedback: "Check your momentum conservation calculation. Make sure to account for the reduced capsule mass." },
      { id: 'c', text: `${v_capsule_new_magnitude.toFixed(0)} m/s @ ${wrong_angle}° from original direction`, feedback: "The magnitude is correct, but check your angle calculation using atan2(v_y, v_x)." },
      { id: 'd', text: `${wrong_v2.toFixed(0)} m/s @ ${angle_from_original.toFixed(2)}° from original direction`, feedback: "Your angle is correct, but verify your momentum conservation and magnitude calculation." }
    ],
    correctOptionId: 'a',
    explanation: `Initial momentum: ${p_initial_x} kg·m/s in x-direction. After firing: p_capsule_x = ${p_capsule_new_x.toFixed(0)} kg·m/s, p_capsule_y = ${p_capsule_new_y.toFixed(0)} kg·m/s. New velocity: ${v_capsule_new_magnitude.toFixed(0)} m/s @ ${angle_from_original.toFixed(2)}°`,
    difficulty: "intermediate",
    topic: "Perpendicular Momentum Transfer"
  };
};

exports.course2_03_space_capsule_projectile = createStandardMultipleChoice({
  questions: [
    createSpaceCapsuleQuestion(),
    createSpaceCapsuleQuestion(),
    createSpaceCapsuleQuestion(),
    createSpaceCapsuleQuestion(),
    createSpaceCapsuleQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 3,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// ===== ADVANCED TWO-DIMENSIONAL MOMENTUM PRACTICE PROBLEMS =====

// Question 5: Steel ball collision with deflection
const createSteelBallDeflectionQuestion = () => {
  const m1 = randFloat(0.22, 0.28, 3); // Ball 1 mass: 0.22-0.28 kg
  const v1i = randFloat(6.5, 7.5, 1); // Ball 1 initial speed: 6.5-7.5 m/s
  const m2 = randFloat(0.08, 0.12, 3); // Ball 2 mass: 0.08-0.12 kg (initially at rest)
  const v2f = randFloat(5.0, 6.0, 1); // Ball 2 final speed: 5.0-6.0 m/s
  const theta2 = randFloat(52, 60, 1); // Ball 2 deflection angle: 52-60°
  
  // Convert angle to radians
  const theta2_rad = theta2 * Math.PI / 180;
  
  // Initial momentum components
  const p1i_x = m1 * v1i;
  const p1i_y = 0;
  const p_total_x = p1i_x;
  const p_total_y = 0;
  
  // Ball 2 final momentum components
  const p2f_x = m2 * v2f * Math.cos(theta2_rad);
  const p2f_y = m2 * v2f * Math.sin(theta2_rad);
  
  // Ball 1 final momentum (by conservation)
  const p1f_x = p_total_x - p2f_x;
  const p1f_y = p_total_y - p2f_y;
  
  // Ball 1 final velocity
  const v1f_x = p1f_x / m1;
  const v1f_y = p1f_y / m1;
  const v1f_magnitude = vectorMagnitude(v1f_x, v1f_y);
  const theta1 = Math.atan2(v1f_y, v1f_x) * 180 / Math.PI;
  
  // Create distractors
  const wrong_v = parseFloat((v1f_magnitude * 1.08).toFixed(2));
  const wrong_angle = parseFloat((Math.abs(theta1) * 1.15).toFixed(1));
  const wrong_v2 = parseFloat((v1f_magnitude * 0.92).toFixed(2));
  
  return {
    questionText: `A ${m1} kg steel ball with a speed of ${v1i} m/s collides with a stationary ${m2} kg steel ball. After the collision, the ${m2} kg ball has a velocity of ${v2f} m/s at an angle of ${theta2}° from the original line of action. What is the final velocity of the ${m1} kg ball?`,
    options: [
      { id: 'a', text: `${v1f_magnitude.toFixed(2)} m/s @ ${Math.abs(theta1).toFixed(1)}° from the original line`, feedback: `Correct! Using 2D momentum conservation: p₁f = p_total - p₂f. Components: p₁ₓ = ${p1f_x.toFixed(3)}, p₁ᵧ = ${p1f_y.toFixed(3)} kg·m/s. Final velocity: ${v1f_magnitude.toFixed(2)} m/s @ ${Math.abs(theta1).toFixed(1)}°` },
      { id: 'b', text: `${wrong_v} m/s @ ${Math.abs(theta1).toFixed(1)}° from the original line`, feedback: "Check your momentum conservation calculation. Make sure to account for both x and y components correctly." },
      { id: 'c', text: `${v1f_magnitude.toFixed(2)} m/s @ ${wrong_angle}° from the original line`, feedback: "The magnitude is correct, but check your angle calculation using atan2(p_y, p_x)." },
      { id: 'd', text: `${wrong_v2} m/s @ ${Math.abs(theta1).toFixed(1)}° from the original line`, feedback: "Your angle is correct, but verify your momentum conservation and magnitude calculation." }
    ],
    correctOptionId: 'a',
    explanation: `Conservation: p_initial = ${p1i_x.toFixed(1)}î kg·m/s. Ball 2: p₂ = ${p2f_x.toFixed(2)}î + ${p2f_y.toFixed(2)}ĵ. Ball 1: p₁ = ${p1f_x.toFixed(2)}î + ${p1f_y.toFixed(2)}ĵ kg·m/s. Result: ${v1f_magnitude.toFixed(2)} m/s @ ${Math.abs(theta1).toFixed(1)}°`,
    difficulty: "advanced",
    topic: "Steel Ball Collision with Deflection"
  };
};

exports.course2_03_steel_ball_deflection = createStandardMultipleChoice({
  questions: [
    createSteelBallDeflectionQuestion(),
    createSteelBallDeflectionQuestion(),
    createSteelBallDeflectionQuestion(),
    createSteelBallDeflectionQuestion(),
    createSteelBallDeflectionQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 4,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// Question 6: Mass explosion into two pieces
const createMassExplosionQuestion = () => {
  const m_total = randFloat(9.5, 10.5, 1); // Total mass: 9.5-10.5 kg
  const v_initial = randFloat(18, 22, 1); // Initial speed: 18-22 m/s (westward)
  const m1 = randFloat(5.5, 6.5, 1); // Piece 1 mass: 5.5-6.5 kg
  const m2 = m_total - m1; // Piece 2 mass
  const v1f = randFloat(11, 14, 1); // Piece 1 final speed: 11-14 m/s
  const theta1 = randFloat(35, 45, 1); // Piece 1 angle: 35-45° south of east
  
  // Convert angle to radians (south of east means negative y)
  const theta1_rad = theta1 * Math.PI / 180;
  
  // Initial momentum (westward = negative x direction)
  const p_initial_x = -m_total * v_initial;
  const p_initial_y = 0;
  
  // Piece 1 final momentum components (east = +x, south = -y)
  const p1f_x = m1 * v1f * Math.cos(-theta1_rad); // Positive x (east)
  const p1f_y = m1 * v1f * Math.sin(-theta1_rad); // Negative y (south)
  
  // Piece 2 final momentum (by conservation)
  const p2f_x = p_initial_x - p1f_x;
  const p2f_y = p_initial_y - p1f_y;
  
  // Piece 2 final velocity
  const v2f_x = p2f_x / m2;
  const v2f_y = p2f_y / m2;
  const v2f_magnitude = vectorMagnitude(v2f_x, v2f_y);
  
  // Calculate angle (north of west)
  const angle_from_west = Math.atan2(v2f_y, -v2f_x) * 180 / Math.PI;
  
  // Create distractors
  const wrong_v = parseFloat((v2f_magnitude * 1.1).toFixed(1));
  const wrong_angle = parseFloat((angle_from_west * 1.15).toFixed(1));
  const wrong_v2 = parseFloat((v2f_magnitude * 0.9).toFixed(1));
  
  return {
    questionText: `A ${m_total} kg mass is traveling west at ${v_initial} m/s when it explodes into two pieces of ${m1} kg and ${m2.toFixed(1)} kg. If the final velocity of the ${m1} kg piece is ${v1f} m/s at ${theta1}° south of east, what is the final velocity of the ${m2.toFixed(1)} kg piece?`,
    options: [
      { id: 'a', text: `${v2f_magnitude.toFixed(1)} m/s @ ${angle_from_west.toFixed(1)}° N of W`, feedback: `Correct! Conservation: p_initial = ${p_initial_x.toFixed(0)}î kg·m/s. Piece 1: p₁ = ${p1f_x.toFixed(1)}î + ${p1f_y.toFixed(1)}ĵ. Piece 2: p₂ = ${p2f_x.toFixed(1)}î + ${p2f_y.toFixed(1)}ĵ kg·m/s. Result: ${v2f_magnitude.toFixed(1)} m/s @ ${angle_from_west.toFixed(1)}° N of W` },
      { id: 'b', text: `${wrong_v} m/s @ ${angle_from_west.toFixed(1)}° N of W`, feedback: "Check your momentum conservation calculation. Make sure to account for the correct initial momentum direction." },
      { id: 'c', text: `${v2f_magnitude.toFixed(1)} m/s @ ${wrong_angle}° N of W`, feedback: "The magnitude is correct, but check your angle calculation. Remember to use the correct quadrant." },
      { id: 'd', text: `${wrong_v2} m/s @ ${angle_from_west.toFixed(1)}° N of W`, feedback: "Your angle is correct, but verify your momentum conservation and mass calculations." }
    ],
    correctOptionId: 'a',
    explanation: `Initial momentum: ${p_initial_x.toFixed(0)}î kg·m/s (west). After explosion: ${m1} kg piece contributes ${p1f_x.toFixed(1)}î + ${p1f_y.toFixed(1)}ĵ, so ${m2.toFixed(1)} kg piece has ${p2f_x.toFixed(1)}î + ${p2f_y.toFixed(1)}ĵ kg·m/s, giving ${v2f_magnitude.toFixed(1)} m/s @ ${angle_from_west.toFixed(1)}° N of W`,
    difficulty: "advanced",
    topic: "Mass Explosion Analysis"
  };
};

exports.course2_03_mass_explosion = createStandardMultipleChoice({
  questions: [
    createMassExplosionQuestion(),
    createMassExplosionQuestion(),
    createMassExplosionQuestion(),
    createMassExplosionQuestion(),
    createMassExplosionQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 4,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// Question 7: Two steel balls elastic collision at 90°
const createElasticCollision90Question = () => {
  const m = randFloat(2.2, 2.8, 2); // Both balls have same mass: 2.2-2.8 kg
  const v1f = randFloat(2.5, 3.5, 1); // Ball 1 final speed: 2.5-3.5 m/s
  const v2f = randFloat(3.5, 4.5, 1); // Ball 2 final speed: 3.5-4.5 m/s
  
  // For elastic collision with equal masses where one is initially at rest,
  // and final velocities are perpendicular (90°), we can use energy conservation
  // Initial KE = Final KE: ½mv₀² = ½mv₁² + ½mv₂²
  // So: v₀² = v₁² + v₂²
  const v0_squared = v1f * v1f + v2f * v2f;
  const v0 = Math.sqrt(v0_squared);
  
  // Create distractors
  const wrong_v1 = parseFloat((v0 * 1.1).toFixed(2));
  const wrong_v2 = parseFloat((v0 * 0.9).toFixed(2));
  const wrong_v3 = parseFloat(((v1f + v2f) / 2).toFixed(2));
  
  return {
    questionText: `Two steel balls, each with a mass of ${m} kg, collide. Prior to the collision, one of the balls was at rest. After the collision the speed of one ball is ${v1f} m/s and the other has a speed of ${v2f} m/s. If the angle between them after the collision is 90°, what was the original speed of the moving ball?`,
    options: [
      { id: 'a', text: `${v0.toFixed(2)} m/s`, feedback: `Correct! For elastic collision with equal masses and 90° separation: v₀² = v₁² + v₂². So v₀² = ${v1f}² + ${v2f}² = ${v0_squared.toFixed(1)}, giving v₀ = ${v0.toFixed(2)} m/s. This satisfies both momentum and energy conservation.` },
      { id: 'b', text: `${wrong_v1} m/s`, feedback: "This uses an incorrect relationship. For elastic collisions with equal masses and perpendicular final velocities, use v₀² = v₁² + v₂²." },
      { id: 'c', text: `${wrong_v2} m/s`, feedback: "Check your calculation. Remember that for equal masses and 90° separation, the initial speed equals √(v₁² + v₂²)." },
      { id: 'd', text: `${wrong_v3} m/s`, feedback: "This is the average of the final speeds, not the correct initial speed. Use energy conservation: v₀² = v₁² + v₂²." }
    ],
    correctOptionId: 'a',
    explanation: `For elastic collision: equal masses, one initially at rest, 90° final separation. Energy conservation: ½mv₀² = ½m(${v1f}²) + ½m(${v2f}²). Simplifying: v₀² = ${v1f * v1f} + ${v2f * v2f} = ${v0_squared.toFixed(1)}, so v₀ = ${v0.toFixed(2)} m/s`,
    difficulty: "advanced",
    topic: "Elastic Collision with 90° Separation"
  };
};

exports.course2_03_elastic_collision_90 = createStandardMultipleChoice({
  questions: [
    createElasticCollision90Question(),
    createElasticCollision90Question(),
    createElasticCollision90Question(),
    createElasticCollision90Question(),
    createElasticCollision90Question()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 4,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});

// Question 8: Plasticene inelastic collision
const createPlasticeneCollisionQuestion = () => {
  const m1 = randFloat(0.18, 0.22, 2); // Piece 1 mass: 0.18-0.22 kg
  const m2 = randFloat(0.28, 0.32, 2); // Piece 2 mass: 0.28-0.32 kg
  const v1 = randFloat(4.5, 5.5, 1); // Piece 1 speed: 4.5-5.5 m/s
  const theta1 = randFloat(25, 35, 1); // Angle: 25-35° west of north
  const v2 = randFloat(3.5, 4.5, 1); // Piece 2 speed: 3.5-4.5 m/s
  const theta2 = randFloat(40, 50, 1); // Angle: 40-50° north of east
  
  // Convert angles to radians
  const theta1_rad = (90 + theta1) * Math.PI / 180; // West of north = 90° + angle from east
  const theta2_rad = theta2 * Math.PI / 180; // North of east
  
  // Initial momentum components
  const p1x = m1 * v1 * Math.cos(theta1_rad); // West of north
  const p1y = m1 * v1 * Math.sin(theta1_rad);
  const p2x = m2 * v2 * Math.cos(theta2_rad); // North of east
  const p2y = m2 * v2 * Math.sin(theta2_rad);
  
  // Total momentum
  const p_total_x = p1x + p2x;
  const p_total_y = p1y + p2y;
  
  // Combined mass and velocity
  const m_total = m1 + m2;
  const v_final_x = p_total_x / m_total;
  const v_final_y = p_total_y / m_total;
  const v_final_magnitude = vectorMagnitude(v_final_x, v_final_y);
  
  // Angle north of east
  const angle_from_east = Math.atan2(v_final_y, v_final_x) * 180 / Math.PI;
  
  // Create distractors
  const wrong_v = parseFloat((v_final_magnitude * 1.1).toFixed(1));
  const wrong_angle = parseFloat((angle_from_east * 1.15).toFixed(0));
  const wrong_v2 = parseFloat((v_final_magnitude * 0.9).toFixed(1));
  
  return {
    questionText: `Two pieces of plasticene slide along a frictionless horizontal surface and collide, sticking together. One piece has a mass of ${m1} kg and a velocity of ${v1} m/s at ${theta1}° west of north. The other piece has a mass of ${m2} kg and is moving at ${v2} m/s at ${theta2}° north of east. What is the velocity of the combined lump after they collide?`,
    options: [
      { id: 'a', text: `${v_final_magnitude.toFixed(1)} m/s @ ${angle_from_east.toFixed(0)}° N of E`, feedback: `Correct! Conservation of momentum: p₁ₓ = ${p1x.toFixed(2)}, p₁ᵧ = ${p1y.toFixed(2)} kg·m/s; p₂ₓ = ${p2x.toFixed(2)}, p₂ᵧ = ${p2y.toFixed(2)} kg·m/s. Total: ${p_total_x.toFixed(2)}î + ${p_total_y.toFixed(2)}ĵ kg·m/s. Final velocity: ${v_final_magnitude.toFixed(1)} m/s @ ${angle_from_east.toFixed(0)}° N of E` },
      { id: 'b', text: `${wrong_v} m/s @ ${angle_from_east.toFixed(0)}° N of E`, feedback: "Check your momentum vector addition. Make sure to convert angles correctly and add components properly." },
      { id: 'c', text: `${v_final_magnitude.toFixed(1)} m/s @ ${wrong_angle}° N of E`, feedback: "The magnitude is correct, but check your angle calculation. Use atan2(p_y, p_x) for the correct quadrant." },
      { id: 'd', text: `${wrong_v2} m/s @ ${angle_from_east.toFixed(0)}° N of E`, feedback: "Your angle is correct, but verify your momentum component calculations and vector addition." }
    ],
    correctOptionId: 'a',
    explanation: `Inelastic collision: p_total = p₁ + p₂. Components: pₓ = ${p1x.toFixed(2)} + ${p2x.toFixed(2)} = ${p_total_x.toFixed(2)} kg·m/s, pᵧ = ${p1y.toFixed(2)} + ${p2y.toFixed(2)} = ${p_total_y.toFixed(2)} kg·m/s. Final velocity: ${v_final_magnitude.toFixed(1)} m/s @ ${angle_from_east.toFixed(0)}° N of E`,
    difficulty: "advanced",
    topic: "Plasticene Inelastic Collision"
  };
};

exports.course2_03_plasticene_collision = createStandardMultipleChoice({
  questions: [
    createPlasticeneCollisionQuestion(),
    createPlasticeneCollisionQuestion(),
    createPlasticeneCollisionQuestion(),
    createPlasticeneCollisionQuestion(),
    createPlasticeneCollisionQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 4,
  maxAttempts: 9999,
  showFeedback: true,
  theme: 'blue'
});
