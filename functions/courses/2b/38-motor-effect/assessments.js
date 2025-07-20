
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
    questionText: "What is the direction of the deflecting force on a stream of alpha particles moving away from you across a magnetic field whose direction is down?",
    options: [
      { id: 'a', text: 'To the left', feedback: 'Correct! Using the Right Hand Rule: fingers point down (B-field), thumb points away from you (velocity), palm faces left (force direction).' },
      { id: 'b', text: 'To the right', feedback: 'Incorrect. Use the Right Hand Rule for positive charges - the force is to the left.' },
      { id: 'c', text: 'Upward', feedback: 'Incorrect. The magnetic field is already pointing downward, so the force is perpendicular to this direction.' },
      { id: 'd', text: 'Downward', feedback: 'Incorrect. The force is perpendicular to both velocity and magnetic field, pointing to the left.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule for positive charges (alpha particles): fingers point in the direction of the magnetic field (down), thumb points in the direction of motion (away from you), and the palm shows the force direction (to the left).',
    difficulty: 'intermediate',
    tags: ['right-hand-rule', 'alpha-particles', 'force-direction', 'motor-effect']
  },
  {
    questionText: "If you wanted to write units for magnetic flux density into an equation and were limited to the following units: metre, kilogram, second, ampere, what units would you use?",
    options: [
      { id: 'a', text: 'kg/(A·s²)', feedback: 'Correct! Tesla (T) = kg/(A·s²) when expressed in fundamental SI units.' },
      { id: 'b', text: 'kg·m/(A·s²)', feedback: 'Incorrect. This includes an extra meter unit that should not be present.' },
      { id: 'c', text: 'kg·s/(A·m²)', feedback: 'Incorrect. This arrangement does not give the correct dimensions for magnetic flux density.' },
      { id: 'd', text: 'A·s²/kg', feedback: 'Incorrect. This is the inverse of the correct units for magnetic flux density.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnetic flux density (B) has units of Tesla (T). From F = qvB, we get B = F/(qv). Since F has units kg·m/s², q has units A·s, and v has units m/s, then B = (kg·m/s²)/(A·s·m/s) = kg/(A·s²).',
    difficulty: 'intermediate',
    tags: ['units', 'tesla', 'magnetic-flux-density', 'dimensional-analysis']
  },
  {
    questionText: "A single conductor in a power transmission line is 40 m long and carries a current of 80 A from east to west. It lies perpendicularly across Earth's magnetic field in Canada. If Earth's magnetic flux density is 2.0 × 10⁻⁷ T, what is the magnitude and direction of the deflecting force?",
    options: [
      { id: 'a', text: '6.4 × 10⁻⁴ N downward', feedback: 'Correct! F = BIL = (2.0×10⁻⁷ T)(80 A)(40 m) = 6.4×10⁻⁴ N. Using the right-hand rule, force is downward.' },
      { id: 'b', text: '6.4 × 10⁻⁴ N upward', feedback: 'Incorrect magnitude calculation is correct, but the direction should be downward using the right-hand rule.' },
      { id: 'c', text: '1.6 × 10⁻⁵ N downward', feedback: 'Incorrect. Check your calculation: F = BIL = (2.0×10⁻⁷)(80)(40) = 6.4×10⁻⁴ N.' },
      { id: 'd', text: '3.2 × 10⁻³ N downward', feedback: 'Incorrect. Verify your multiplication: the answer should be smaller by a factor of 5.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using F = BIL: F = (2.0×10⁻⁷ T)(80 A)(40 m) = 6.4×10⁻⁴ N. Direction: Using right-hand rule with current west and magnetic field north (in Canada), the force is downward.',
    difficulty: 'intermediate',
    tags: ['motor-force-calculation', 'transmission-line', 'earth-magnetic-field', 'right-hand-rule']
  },
  {
    questionText: "A conductor which is 30 cm long with a mass of 20 g is suspended horizontally in a magnetic field whose magnetic flux density is 0.12 T. What current is required so that the magnetic force balances the gravitational force?",
    options: [
      { id: 'a', text: '5.5 A', feedback: 'Correct! Setting F_magnetic = F_gravity: BIL = mg, so I = mg/(BL) = (0.020)(9.8)/(0.12)(0.30) = 5.44 A ≈ 5.5 A' },
      { id: 'b', text: '2.7 A', feedback: 'Incorrect. Check your calculation - you may have made an error with the units or arithmetic.' },
      { id: 'c', text: '11.0 A', feedback: 'Incorrect. This is approximately double the correct answer - check your division.' },
      { id: 'd', text: '1.4 A', feedback: 'Incorrect. This current would be too small to balance the gravitational force.' }
    ],
    correctOptionId: 'a',
    explanation: 'For equilibrium: F_magnetic = F_gravity, so BIL = mg. Solving for current: I = mg/(BL) = (0.020 kg)(9.8 m/s²)/(0.12 T)(0.30 m) = 0.196/(0.036) = 5.44 A ≈ 5.5 A',
    difficulty: 'intermediate',
    tags: ['equilibrium', 'magnetic-force', 'gravity-balance', 'current-calculation']
  },
  {
    questionText: "If a 45 mg conductor that is 15 cm long is accelerating upward (against gravity) at 4.19 m/s² in a 5.0 mT field, how much current must be flowing in the conductor?",
    options: [
      { id: 'a', text: '0.84 A', feedback: 'Correct! F_net = ma = mg + F_magnetic. So BIL = m(g + a), giving I = m(g + a)/(BL) = (0.000045)(13.99)/(0.005)(0.15) = 0.84 A' },
      { id: 'b', text: '0.42 A', feedback: 'Incorrect. This would only balance gravity but not provide the additional upward acceleration.' },
      { id: 'c', text: '1.26 A', feedback: 'Incorrect. Check your calculation - you may have errors in unit conversion or arithmetic.' },
      { id: 'd', text: '0.31 A', feedback: 'Incorrect. This current is too small to provide the required net upward force.' }
    ],
    correctOptionId: 'a',
    explanation: 'Net upward force needed: F_net = ma = (0.000045 kg)(4.19 m/s²) = 1.886×10⁻⁴ N. Total upward magnetic force needed: F_magnetic = mg + F_net = (0.000045)(9.8) + 1.886×10⁻⁴ = 6.296×10⁻⁴ N. Current: I = F_magnetic/(BL) = 6.296×10⁻⁴/(0.005×0.15) = 0.84 A',
    difficulty: 'advanced',
    tags: ['acceleration', 'net-force', 'current-calculation', 'motor-force']
  },
  {
    questionText: "In a diagram where a conductor is forced out of the page by the motor effect, and the magnetic field points to the right, what direction does the current flow in the conductor?",
    options: [
      { id: 'a', text: 'Down the page', feedback: 'Correct! Using the Right Hand Rule: fingers point right (B-field), palm points out of page (force), thumb points down (current direction).' },
      { id: 'b', text: 'Up the page', feedback: 'Incorrect. Use the Right Hand Rule - with field right and force out, current must be down.' },
      { id: 'c', text: 'Into the page', feedback: 'Incorrect. The current direction is perpendicular to the force, not parallel to it.' },
      { id: 'd', text: 'Out of the page', feedback: 'Incorrect. This would be the force direction, not the current direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule: fingers point in the direction of the magnetic field (right), palm points in the direction of the force (out of page), and the thumb indicates the current direction (down the page).',
    difficulty: 'intermediate',
    tags: ['right-hand-rule', 'current-direction', 'motor-effect', 'force-analysis']
  },
  {
    questionText: "A solenoid lies horizontally with a current balance WXYZ in the core. Sides WX and ZY are 7.10 cm long, side XY is 1.90 cm, and current is 6.0 A. If a 17.6 g mass is needed to balance the system, what is the magnetic field strength of the solenoid?",
    options: [
      { id: 'a', text: '1.51 T', feedback: 'Correct! Force balance: BIL = mg. Only the perpendicular segment XY contributes to force: B = mg/(IL) = (0.0176)(9.8)/(6.0)(0.019) = 1.51 T' },
      { id: 'b', text: '0.76 T', feedback: 'Incorrect. Make sure you are only considering the perpendicular segment (XY = 1.90 cm) in your calculation.' },
      { id: 'c', text: '0.20 T', feedback: 'Incorrect. You may have used the wrong length in your calculation - use only the perpendicular segment.' },
      { id: 'd', text: '3.02 T', feedback: 'Incorrect. Check your arithmetic - the field strength should be smaller than this value.' }
    ],
    correctOptionId: 'a',
    explanation: 'For equilibrium, magnetic force equals gravitational force: BIL = mg. Only the segment perpendicular to the magnetic field (XY = 1.90 cm) experiences force. B = mg/(IL) = (0.0176 kg)(9.8 m/s²)/(6.0 A)(0.019 m) = 0.172/(0.114) = 1.51 T',
    difficulty: 'advanced',
    tags: ['solenoid', 'current-balance', 'magnetic-field-calculation', 'equilibrium']
  },
  {
    questionText: "A coil with 100 turns in a 15 cm length has a conducting wire WXYZ balanced horizontally. WX and YZ are 5.0 cm (parallel to axis), XY is 1.5 cm (perpendicular to axis), current is 20 A. What current through the coil keeps the system balanced when a 1.8 × 10⁻² g mass hangs from the frame? Use B = μ₀IN/L where μ₀ = 4π × 10⁻⁷ T·m/A.",
    options: [
      { id: 'a', text: '1.4 A', feedback: 'Correct! mg = B_coil × I_wire × L_perp. B_coil = μ₀I_coil N/L. Solving: I_coil = mgL/(μ₀NI_wire L_perp) = (1.8×10⁻⁵×9.8×0.15)/(4π×10⁻⁷×100×20×0.015) = 1.4 A' },
      { id: 'b', text: '2.8 A', feedback: 'Incorrect. Check your calculation - you may have an error in the formula application or arithmetic.' },
      { id: 'c', text: '0.7 A', feedback: 'Incorrect. This current would produce insufficient magnetic field to balance the mass.' },
      { id: 'd', text: '5.6 A', feedback: 'Incorrect. This current would be too large for the required balance.' }
    ],
    correctOptionId: 'a',
    explanation: 'Force balance: mg = B_coil × I_wire × L_perp. Magnetic field in solenoid: B = μ₀IN/L. Substituting: mg = (μ₀I_coil N/L) × I_wire × L_perp. Solving for I_coil: I_coil = mgL/(μ₀NI_wire L_perp) = (1.8×10⁻⁵ kg)(9.8 m/s²)(0.15 m)/[(4π×10⁻⁷)(100)(20)(0.015)] = 1.4 A',
    difficulty: 'advanced',
    tags: ['solenoid-field', 'current-balance', 'permeability', 'coil-calculation']
  },
  {
    questionText: "A 20 cm wire carries 1.0 A in a 0.020 T field. Another 10 cm wire carries 3.0 A in the same field. What is the ratio of the deflecting force in case two to case one?",
    options: [
      { id: 'a', text: '1.5 to 1', feedback: 'Correct! F₁ = BIL = (0.020)(1.0)(0.20) = 0.004 N. F₂ = BIL = (0.020)(3.0)(0.10) = 0.006 N. Ratio = 0.006/0.004 = 1.5' },
      { id: 'b', text: '3.0 to 1', feedback: 'Incorrect. You must consider both current and length changes: wire 2 has 3× current but ½ length.' },
      { id: 'c', text: '0.5 to 1', feedback: 'Incorrect. This is the inverse of the correct ratio - check your force calculations.' },
      { id: 'd', text: '6.0 to 1', feedback: 'Incorrect. You may have only considered the current ratio and ignored the length difference.' }
    ],
    correctOptionId: 'a',
    explanation: 'Force 1: F₁ = BIL = (0.020 T)(1.0 A)(0.20 m) = 0.004 N. Force 2: F₂ = BIL = (0.020 T)(3.0 A)(0.10 m) = 0.006 N. Ratio F₂/F₁ = 0.006/0.004 = 1.5 to 1',
    difficulty: 'intermediate',
    tags: ['force-comparison', 'current-length-relationship', 'motor-force', 'ratio-calculation']
  },
  {
    questionText: "A 12 cm long wire hangs perpendicularly across a magnetic field whose density is 0.015 T. How great must the current be to produce a motor effect of 1.0 mN?",
    options: [
      { id: 'a', text: '5.6 × 10⁻¹ A', feedback: 'Correct! Using F = BIL, solve for I: I = F/(BL) = (1.0×10⁻³ N)/(0.015 T)(0.12 m) = 1.0×10⁻³/1.8×10⁻³ = 0.56 A' },
      { id: 'b', text: '1.8 × 10⁻³ A', feedback: 'Incorrect. This appears to be the product BL rather than F/(BL). Check your division.' },
      { id: 'c', text: '1.8 A', feedback: 'Incorrect. This is too large - check your unit conversions and calculation.' },
      { id: 'd', text: '8.3 × 10⁻² A', feedback: 'Incorrect. Verify your calculation - you may have made an arithmetic error.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the motor force equation F = BIL, solve for current: I = F/(BL) = (1.0×10⁻³ N)/(0.015 T)(0.12 m) = (1.0×10⁻³)/(1.8×10⁻³) = 0.56 A = 5.6×10⁻¹ A',
    difficulty: 'intermediate',
    tags: ['current-calculation', 'motor-force', 'perpendicular-wire', 'force-equation']
  },
  {
    questionText: "The following data was collected for alpha particles entering a magnetic field:\n\n| Magnetic Force (×10⁻¹⁹ N) | Speed (×10⁵ m/s) |\n|---------------------------|------------------|\n| 1.6                       | 1.0              |\n| 3.2                       | 2.0              |\n| 4.8                       | 3.0              |\n| 6.4                       | 4.0              |\n| 8.0                       | 5.0              |\n\nUsing graphing technique, what is the magnetic field strength?",
    options: [
      { id: 'a', text: '5.0 × 10⁻⁶ T', feedback: 'Correct! From F = qvB, slope = qB. For alpha particles q = 3.2×10⁻¹⁹ C. Slope = ΔF/Δv = 1.6×10⁻¹⁹/1.0×10⁵ = 1.6×10⁻²⁴. B = slope/q = 1.6×10⁻²⁴/3.2×10⁻¹⁹ = 5.0×10⁻⁶ T' },
      { id: 'b', text: '1.6 × 10⁻⁶ T', feedback: 'Incorrect. Remember that alpha particles have charge +2e = 3.2×10⁻¹⁹ C, not just e.' },
      { id: 'c', text: '3.2 × 10⁻⁶ T', feedback: 'Incorrect. Check your slope calculation and charge value for alpha particles.' },
      { id: 'd', text: '8.0 × 10⁻⁶ T', feedback: 'Incorrect. Verify your graph analysis - the slope should give you qB, then divide by q.' }
    ],
    correctOptionId: 'a',
    explanation: 'From F = qvB, a graph of F vs v gives slope = qB. Calculating slope: Δ(F×10⁻¹⁹)/Δ(v×10⁵) = 1.6/1.0 = 1.6. Converting units: slope = 1.6×10⁻¹⁹/1.0×10⁵ = 1.6×10⁻²⁴ N·s/m. For alpha particles, q = 2e = 3.2×10⁻¹⁹ C. Therefore: B = slope/q = 1.6×10⁻²⁴/3.2×10⁻¹⁹ = 5.0×10⁻⁶ T',
    difficulty: 'advanced',
    tags: ['graphing-analysis', 'alpha-particles', 'magnetic-field-determination', 'linear-relationship']
  }
];

// ========================================
// ASSESSMENT CONFIGURATIONS
// ========================================

// Assessment configurations for master function 
const assessmentConfigs = {};

questionPool.forEach((questionData, index) => {
  const questionNumber = index + 1;
  const questionId = `course2_38_question${questionNumber}`;
  
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