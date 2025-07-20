// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Question pool with complete configuration
const questionPool = [
  {
    questionText: "What is the difference between a permanent magnet and an electromagnet?",
    options: [
      { id: 'a', text: 'A permanent magnet involves the alignment of magnetic domains, while an electromagnet depends on current around a solenoid.', feedback: 'Correct! Permanent magnets have aligned magnetic domains, while electromagnets require electric current to create magnetic fields.' },
      { id: 'b', text: 'A permanent magnet uses electric current, while an electromagnet uses magnetic domains.', feedback: 'Incorrect. This is backwards - permanent magnets use aligned domains, electromagnets use current.' },
      { id: 'c', text: 'There is no difference between permanent magnets and electromagnets.', feedback: 'Incorrect. They work on different principles - domain alignment vs. current flow.' },
      { id: 'd', text: 'Permanent magnets are stronger than electromagnets.', feedback: 'Incorrect. Electromagnets can be much stronger than permanent magnets when sufficient current is applied.' }
    ],
    correctOptionId: 'a',
    explanation: 'Permanent magnets work through the alignment of magnetic domains in ferromagnetic materials, creating a persistent magnetic field. Electromagnets generate magnetic fields by passing electric current through a solenoid (coil of wire), and their magnetic field exists only while current flows.',
    difficulty: 'beginner',
    tags: ['permanent-magnets', 'electromagnets', 'magnetic-domains', 'solenoids']
  },
  {
    questionText: "The poles of a horseshoe magnet are arranged so that the North Pole is directly over the South Pole. A negatively charged object passes between the poles from left to right. What is the direction of the resulting force?",
    options: [
      { id: 'a', text: 'Out of the page', feedback: 'Correct! Using the Left Hand Rule for negative charges: magnetic field points downward, velocity is left to right, force is out of the page.' },
      { id: 'b', text: 'Into the page', feedback: 'Incorrect. Use the Left Hand Rule for negative charges - the force is out of the page.' },
      { id: 'c', text: 'Upward', feedback: 'Incorrect. The force is perpendicular to both velocity and magnetic field, pointing out of the page.' },
      { id: 'd', text: 'Downward', feedback: 'Incorrect. The magnetic force acts perpendicular to the velocity direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for negative charges: fingers point in the direction of the magnetic field (North to South, downward), thumb points in the direction of motion (left to right), and the palm shows the force direction (out of the page).',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'magnetic-force', 'negative-charge', 'horseshoe-magnet']
  },
  {
    questionText: "Three particles move through a constant magnetic field and follow curved paths. Particle 1 curves one way, Particle 2 travels straight, and Particle 3 curves the opposite way from Particle 1. What can you determine about each particle?",
    options: [
      { id: 'a', text: 'Particle 1 is positive, Particle 2 is neutral, Particle 3 is negative', feedback: 'Correct! Positive charges curve one way, neutral particles are unaffected, negative charges curve the opposite way.' },
      { id: 'b', text: 'Particle 1 is negative, Particle 2 is neutral, Particle 3 is positive', feedback: 'Incorrect. The curving direction depends on the charge sign - opposite curves indicate opposite charges.' },
      { id: 'c', text: 'All particles are neutral', feedback: 'Incorrect. Neutral particles would not be deflected by the magnetic field.' },
      { id: 'd', text: 'All particles have the same charge', feedback: 'Incorrect. Particles with the same charge would curve in the same direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'In a magnetic field, positive and negative charges experience forces in opposite directions (following right-hand and left-hand rules respectively), causing them to curve in opposite directions. Neutral particles experience no magnetic force and travel straight.',
    difficulty: 'intermediate',
    tags: ['charge-identification', 'magnetic-deflection', 'particle-paths', 'hand-rules']
  },
  {
    questionText: "Three particles have identical charges and masses. They enter a constant magnetic field and follow circular paths with different radii. Which relationship describes their speeds?",
    options: [
      { id: 'a', text: 'The particle with the largest radius is moving fastest', feedback: 'Correct! Since r = mv/(qB), radius is directly proportional to velocity when mass, charge, and field are constant.' },
      { id: 'b', text: 'The particle with the smallest radius is moving fastest', feedback: 'Incorrect. Larger radius corresponds to higher velocity in magnetic fields.' },
      { id: 'c', text: 'All particles have the same speed', feedback: 'Incorrect. Different radii indicate different velocities.' },
      { id: 'd', text: 'Speed cannot be determined from the radius', feedback: 'Incorrect. The radius formula r = mv/(qB) directly relates radius to velocity.' }
    ],
    correctOptionId: 'a',
    explanation: 'For charged particles in a magnetic field, the radius of curvature is given by r = mv/(qB). When mass (m), charge (q), and magnetic field (B) are constant, radius is directly proportional to velocity (v). Therefore, the particle with the largest radius is moving fastest.',
    difficulty: 'intermediate',
    tags: ['circular-motion', 'radius-velocity-relationship', 'magnetic-force-formula']
  },
  {
    questionText: "What deflecting force is exerted on a charge of 40 C moving at 15 cm/s at 30° to a magnetic field whose flux density is 0.025 T?",
    options: [
      { id: 'a', text: '7.5 × 10⁻⁸ N', feedback: 'Incorrect. Check your calculation and unit conversions.' },
      { id: 'b', text: '7.5 × 10⁻² N', feedback: 'Correct! F = qvB sin θ = (40 C)(0.15 m/s)(0.025 T)(sin 30°) = 0.075 N' },
      { id: 'c', text: '1.5 × 10⁻¹ N', feedback: 'Incorrect. Remember to include sin(30°) = 0.5 in your calculation.' },
      { id: 'd', text: '3.0 × 10⁻¹ N', feedback: 'Incorrect. Check the angle calculation and ensure proper unit conversions.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using F = qvB sin θ: F = (40 C)(0.15 m/s)(0.025 T)(sin 30°) = (40)(0.15)(0.025)(0.5) = 0.075 N = 7.5 × 10⁻² N',
    difficulty: 'intermediate',
    tags: ['magnetic-force-calculation', 'force-formula', 'angle-dependence']
  },
  {
    questionText: "What happens to the motion of an electron that is moving in the same direction as (parallel to) the magnetic field which it enters?",
    options: [
      { id: 'a', text: 'The electron continues in a straight line with constant velocity', feedback: 'Correct! When velocity is parallel to the magnetic field, sin θ = 0, so F = qvB sin θ = 0.' },
      { id: 'b', text: 'The electron curves in a circular path', feedback: 'Incorrect. Circular motion occurs when velocity is perpendicular to the magnetic field.' },
      { id: 'c', text: 'The electron stops immediately', feedback: 'Incorrect. The magnetic force does no work and cannot change the particle\'s speed.' },
      { id: 'd', text: 'The electron accelerates in the forward direction', feedback: 'Incorrect. There is no magnetic force when velocity is parallel to the field.' }
    ],
    correctOptionId: 'a',
    explanation: 'When a charged particle moves parallel to a magnetic field, the angle θ between velocity and field is 0°. Since F = qvB sin θ and sin(0°) = 0, the magnetic force is zero. The electron experiences no force and continues with constant velocity.',
    difficulty: 'beginner',
    tags: ['parallel-motion', 'magnetic-force', 'force-formula', 'angle-dependence']
  },
  {
    questionText: "What is the deflecting force on an alpha particle moving at 1.0% of the speed of light directly across a magnetic field whose flux density is 0.0030 T?",
    options: [
      { id: 'a', text: '2.9 × 10⁻¹⁵ N', feedback: 'Correct! F = qvB = (3.2×10⁻¹⁹ C)(3.0×10⁶ m/s)(0.0030 T) = 2.9×10⁻¹⁵ N' },
      { id: 'b', text: '2.9 × 10⁻¹² N', feedback: 'Incorrect. Check your calculation - the answer should be smaller.' },
      { id: 'c', text: '9.6 × 10⁻¹⁶ N', feedback: 'Incorrect. Remember that an alpha particle has charge +2e = 3.2×10⁻¹⁹ C.' },
      { id: 'd', text: '1.4 × 10⁻¹⁵ N', feedback: 'Incorrect. Double-check the charge value for an alpha particle.' }
    ],
    correctOptionId: 'a',
    explanation: 'For an alpha particle: q = +2e = 3.2×10⁻¹⁹ C, v = 0.01c = 3.0×10⁶ m/s, B = 0.0030 T. Using F = qvB: F = (3.2×10⁻¹⁹)(3.0×10⁶)(0.0030) = 2.9×10⁻¹⁵ N',
    difficulty: 'intermediate',
    tags: ['alpha-particle', 'magnetic-force-calculation', 'force-formula']
  },
  {
    questionText: "A magnesium ion (Mg²⁺) traveling at 60,000 m/s enters a mass spectrometer with a magnetic field of 0.0800 T at an angle of 90° to the field. What is the radius of the curve followed by the magnesium ion?",
    options: [
      { id: 'a', text: '9.39 × 10⁻² m', feedback: 'Correct! Using r = mv/(qB) with m = 24u, q = +2e, v = 60,000 m/s, B = 0.0800 T' },
      { id: 'b', text: '4.70 × 10⁻² m', feedback: 'Incorrect. Remember that Mg²⁺ has a charge of +2e, not +e.' },
      { id: 'c', text: '1.88 × 10⁻¹ m', feedback: 'Incorrect. Check your mass value for magnesium (24 atomic mass units).' },
      { id: 'd', text: '3.13 × 10⁻³ m', feedback: 'Incorrect. Verify your unit conversions and calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'For Mg²⁺: m = 24u = 24(1.66×10⁻²⁷ kg) = 3.98×10⁻²⁶ kg, q = +2e = 3.2×10⁻¹⁹ C. Using r = mv/(qB): r = (3.98×10⁻²⁶)(60,000)/(3.2×10⁻¹⁹)(0.0800) = 9.39×10⁻² m',
    difficulty: 'advanced',
    tags: ['mass-spectrometer', 'radius-calculation', 'magnesium-ion', 'circular-motion']
  },
  {
    questionText: "Calculate the magnitude and direction of the magnetic force on an alpha particle moving south at a speed of 7.40 × 10⁴ m/s through a vertically upward magnetic field of 5.50 mT.",
    options: [
      { id: 'a', text: '1.30 × 10⁻¹⁶ N west', feedback: 'Correct! Using F = qvB and the right-hand rule for positive charges.' },
      { id: 'b', text: '1.30 × 10⁻¹⁶ N east', feedback: 'Incorrect. Use the right-hand rule: fingers up (B-field), thumb south (velocity), palm faces west (force).' },
      { id: 'c', text: '2.60 × 10⁻¹⁶ N west', feedback: 'Incorrect. Check your charge value for an alpha particle (+2e = 3.2×10⁻¹⁹ C).' },
      { id: 'd', text: '6.50 × 10⁻¹⁷ N west', feedback: 'Incorrect. Verify your calculation with the correct charge and field values.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnitude: F = qvB = (3.2×10⁻¹⁹ C)(7.40×10⁴ m/s)(5.50×10⁻³ T) = 1.30×10⁻¹⁶ N. Direction: Using right-hand rule for positive charge - fingers point up (B-field), thumb points south (velocity), palm faces west (force direction).',
    difficulty: 'intermediate',
    tags: ['alpha-particle', 'right-hand-rule', 'force-direction', 'magnetic-force-calculation']
  },
  {
    questionText: "Charged particles from solar wind traveling at 9.0 × 10⁶ m/s encounter Earth's magnetic field at 90° where the field magnitude is 1.2 × 10⁻⁷ T. Find the radius of the circular path for an electron.",
    options: [
      { id: 'a', text: '4.3 × 10² m', feedback: 'Correct! Using r = mv/(qB) with electron mass and charge values.' },
      { id: 'b', text: '2.1 × 10² m', feedback: 'Incorrect. Check your electron mass value (9.11×10⁻³¹ kg).' },
      { id: 'c', text: '8.6 × 10² m', feedback: 'Incorrect. Verify your calculation with the correct electron charge magnitude.' },
      { id: 'd', text: '1.1 × 10³ m', feedback: 'Incorrect. Double-check your unit conversions and calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'For an electron: m = 9.11×10⁻³¹ kg, q = 1.6×10⁻¹⁹ C. Using r = mv/(qB): r = (9.11×10⁻³¹)(9.0×10⁶)/(1.6×10⁻¹⁹)(1.2×10⁻⁷) = 4.3×10² m',
    difficulty: 'intermediate',
    tags: ['solar-wind', 'electron', 'earth-magnetic-field', 'radius-calculation']
  },
  {
    questionText: "Charged particles from solar wind traveling at 9.0 × 10⁶ m/s encounter Earth's magnetic field at 90° where the field magnitude is 1.2 × 10⁻⁷ T. Find the radius of the circular path for a proton.",
    options: [
      { id: 'a', text: '7.8 × 10⁵ m', feedback: 'Correct! Using r = mv/(qB) with proton mass (1836 times larger than electron mass).' },
      { id: 'b', text: '4.3 × 10² m', feedback: 'Incorrect. This is the electron radius - protons are much more massive.' },
      { id: 'c', text: '1.4 × 10⁶ m', feedback: 'Incorrect. Check your proton mass value (1.67×10⁻²⁷ kg).' },
      { id: 'd', text: '3.9 × 10⁵ m', feedback: 'Incorrect. Verify your calculation with the correct mass ratio.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a proton: m = 1.67×10⁻²⁷ kg, q = 1.6×10⁻¹⁹ C. Using r = mv/(qB): r = (1.67×10⁻²⁷)(9.0×10⁶)/(1.6×10⁻¹⁹)(1.2×10⁻⁷) = 7.8×10⁵ m. Note: proton radius is much larger due to its greater mass.',
    difficulty: 'intermediate',
    tags: ['solar-wind', 'proton', 'earth-magnetic-field', 'radius-calculation', 'mass-comparison']
  },
  {
    questionText: "An alpha particle with a speed of 4.4 × 10⁵ m/s moves perpendicular to a 0.75 T magnetic field in a circular path with a radius of 0.012 m. What is the magnitude of the charge on the helium nucleus?",
    options: [
      { id: 'a', text: '3.2 × 10⁻¹⁹ C', feedback: 'Correct! Using q = mv/(rB) and solving for charge gives 2e = 3.2×10⁻¹⁹ C.' },
      { id: 'b', text: '1.6 × 10⁻¹⁹ C', feedback: 'Incorrect. An alpha particle has charge +2e, not +e.' },
      { id: 'c', text: '6.4 × 10⁻¹⁹ C', feedback: 'Incorrect. Check your calculation - the charge should be +2e.' },
      { id: 'd', text: '4.8 × 10⁻¹⁹ C', feedback: 'Incorrect. Verify the alpha particle mass and charge values.' }
    ],
    correctOptionId: 'a',
    explanation: 'Rearranging r = mv/(qB) to solve for q: q = mv/(rB). For alpha particle: m = 4u = 6.64×10⁻²⁷ kg. Therefore: q = (6.64×10⁻²⁷)(4.4×10⁵)/(0.012)(0.75) = 3.2×10⁻¹⁹ C = 2e',
    difficulty: 'advanced',
    tags: ['alpha-particle', 'charge-calculation', 'helium-nucleus', 'circular-motion']
  },
  {
    questionText: "A deuteron (twice the mass of a proton, same charge) is accelerated from rest through a 2000 V potential difference, then enters a 0.600 T magnetic field. Find the radius of the circular path.",
    options: [
      { id: 'a', text: '0.0152 m', feedback: 'Correct! First find velocity from energy conservation, then use r = mv/(qB).' },
      { id: 'b', text: '0.0108 m', feedback: 'Incorrect. Remember that deuteron mass is twice the proton mass.' },
      { id: 'c', text: '0.0215 m', feedback: 'Incorrect. Check your velocity calculation from the potential energy.' },
      { id: 'd', text: '0.0076 m', feedback: 'Incorrect. Verify your energy conversion and radius formula.' }
    ],
    correctOptionId: 'a',
    explanation: 'First find velocity: ½mv² = qV, so v = √(2qV/m) = √(2(1.6×10⁻¹⁹)(2000)/(2×1.67×10⁻²⁷)) = 4.38×10⁵ m/s. Then: r = mv/(qB) = (2×1.67×10⁻²⁷)(4.38×10⁵)/(1.6×10⁻¹⁹)(0.600) = 0.0152 m',
    difficulty: 'advanced',
    tags: ['deuteron', 'mass-spectrometer', 'energy-conservation', 'acceleration-voltage']
  },
  {
    questionText: "An electron traveling at 3.62 × 10⁶ m/s enters a magnetic field with strength 0.0373 T at 75° to the field lines. In the resulting helical path, what is the distance between spirals (pitch)?",
    options: [
      { id: 'a', text: '8.73 × 10⁻⁴ m', feedback: 'Correct! The pitch equals the parallel velocity component times the period: d = v∥T = v cos θ × 2πm/(qB).' },
      { id: 'b', text: '3.36 × 10⁻³ m', feedback: 'Incorrect. Remember to use only the parallel component of velocity (v cos θ).' },
      { id: 'c', text: '2.26 × 10⁻⁴ m', feedback: 'Incorrect. Check your calculation of the cyclotron period T = 2πm/(qB).' },
      { id: 'd', text: '1.12 × 10⁻³ m', feedback: 'Incorrect. Verify your trigonometric calculation and period formula.' }
    ],
    correctOptionId: 'a',
    explanation: 'In a helical path, the pitch is the distance traveled parallel to the field in one complete revolution. Parallel velocity: v∥ = v cos(75°) = 3.62×10⁶ × 0.259 = 9.37×10⁵ m/s. Period: T = 2πm/(qB) = 2π(9.11×10⁻³¹)/(1.6×10⁻¹⁹)(0.0373) = 9.33×10⁻¹⁰ s. Pitch: d = v∥T = 8.73×10⁻⁴ m',
    difficulty: 'advanced',
    tags: ['helical-motion', 'electron', 'pitch-calculation', 'cyclotron-period', 'angular-motion']
  }
];

// ========================================
// ASSESSMENT CONFIGURATIONS
// ========================================

// Assessment configurations for master function 
const assessmentConfigs = {};

questionPool.forEach((questionData, index) => {
  const questionNumber = index + 1;
  const questionId = `course2_37_question${questionNumber}`;
  
  assessmentConfigs[questionId] = {
    type: 'multiple-choice',
    questions: [questionData],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: ACTIVITY_TYPE,
    theme: 'indigo'
  };
});

module.exports = { assessmentConfigs };