const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Question pools for L1-24 Cumulative Assignment - Units 3-4 Review
const questionPools = {
  // Group 1: Momentum and Impulse (L1-4)
  group1: [
    {
      questionText: "A 1.1 × 10³ kg car travelling at a velocity of 10.0 m/s collides head-on with a brick wall. If the car comes to a complete stop in 0.25 s, what was the average force exerted on the car during the collision?",
      options: [
        { id: 'a', text: '-44000 N', feedback: 'Correct! F = Δp/Δt = m(vf - vi)/Δt = 1100(0 - 10)/0.25 = -44000 N. The negative indicates force opposite to motion.' },
        { id: 'b', text: '44000 N', feedback: 'Incorrect. The force should be negative as it opposes the car\'s motion.' },
        { id: 'c', text: '-11000 N', feedback: 'Incorrect. Check your calculation: F = mΔv/Δt = 1100(-10)/0.25 = -44000 N.' },
        { id: 'd', text: '-4400 N', feedback: 'Incorrect. Make sure to use the correct mass: 1.1 × 10³ kg = 1100 kg.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using impulse-momentum theorem: F = Δp/Δt = m(vf - vi)/Δt = 1100 kg(0 - 10 m/s)/0.25 s = -44000 N. The negative sign indicates the force opposes motion.',
      difficulty: 'intermediate',
      tags: ['momentum', 'impulse', 'collision', 'force']
    },
    {
      questionText: "A 0.45 kg ball travels with a velocity of 11.0 m/s east when it hits a wall. If the ball rebounds with a velocity of 10.0 m/s west, what was the impulse of the wall on the ball?",
      options: [
        { id: 'a', text: '4.5 kg·m/s [west]', feedback: 'Incorrect. Remember to account for the direction change in velocity.' },
        { id: 'b', text: '9.5 kg·m/s [west]', feedback: 'Correct! J = Δp = m(vf - vi) = 0.45(-10 - 11) = -9.45 ≈ -9.5 kg·m/s. West is negative, so impulse is 9.5 kg·m/s [west].' },
        { id: 'c', text: '0.45 kg·m/s [west]', feedback: 'Incorrect. You need to find the change in momentum, not just mass times one velocity.' },
        { id: 'd', text: '9.5 kg·m/s [east]', feedback: 'Incorrect. The impulse direction is west, not east.' }
      ],
      correctOptionId: 'b',
      explanation: 'Impulse J = Δp = m(vf - vi). Taking east as positive: J = 0.45 kg(-10 - 11) m/s = -9.45 kg·m/s ≈ -9.5 kg·m/s. The negative means west direction.',
      difficulty: 'intermediate',
      tags: ['impulse', 'momentum-change', 'collision', 'direction']
    },
    {
      questionText: "A car moving with a velocity of 10.0 m/s east collides with a stationary truck with exactly twice the mass of the car. If the two vehicles lock together, calculate the velocity of their combined mass immediately after collision.",
      options: [
        { id: 'a', text: '5.0 m/s [east]', feedback: 'Incorrect. The truck has twice the mass of the car, not the same mass.' },
        { id: 'b', text: '3.33 m/s [east]', feedback: 'Correct! Using conservation of momentum: m(10) + 2m(0) = 3m(v). Solving: v = 10/3 = 3.33 m/s [east].' },
        { id: 'c', text: '6.67 m/s [east]', feedback: 'Incorrect. Check your application of conservation of momentum.' },
        { id: 'd', text: '2.5 m/s [east]', feedback: 'Incorrect. Make sure to use the correct total mass: m + 2m = 3m.' }
      ],
      correctOptionId: 'b',
      explanation: 'Conservation of momentum: pinitial = pfinal. If car mass = m, truck mass = 2m. Then: m(10) + 2m(0) = (m + 2m)v. Solving: 10m = 3mv, so v = 10/3 = 3.33 m/s [east].',
      difficulty: 'intermediate',
      tags: ['conservation-of-momentum', 'inelastic-collision', 'velocity']
    }
  ],

  // Group 2: Optics - Refraction and Lenses (L13-16)
  group2: [
    {
      questionText: "The critical angle for a certain liquid-air interface is 48.8°. What is the liquid's index of refraction?",
      options: [
        { id: 'a', text: 'n = 1.50', feedback: 'Incorrect. Check your calculation using sin θc = 1/n.' },
        { id: 'b', text: 'n = 1.33', feedback: 'Correct! Using sin θc = 1/n: n = 1/sin(48.8°) = 1/0.752 = 1.33.' },
        { id: 'c', text: 'n = 1.25', feedback: 'Incorrect. Make sure to use the correct critical angle formula.' },
        { id: 'd', text: 'n = 1.75', feedback: 'Incorrect. The critical angle formula gives n = 1/sin θc.' }
      ],
      correctOptionId: 'b',
      explanation: 'At the critical angle, sin θc = n₂/n₁. For liquid-air interface: sin θc = 1/n. Therefore: n = 1/sin(48.8°) = 1/0.752 = 1.33.',
      difficulty: 'intermediate',
      tags: ['refraction', 'critical-angle', 'refractive-index']
    },
    {
      questionText: "A ray of light in air strikes a side of an equilateral Lucite prism (n = 1.50) at an angle of 54° to the face of the prism. Find the angle to the prism at which the light leaves the prism.",
      options: [
        { id: 'a', text: '30.0°', feedback: 'Incorrect. Make sure to track the ray through both refractions correctly.' },
        { id: 'b', text: '25.7°', feedback: 'Correct! Using Snell\'s law twice and geometry of equilateral prism, the exit angle is 25.7°.' },
        { id: 'c', text: '35.4°', feedback: 'Incorrect. Check your application of Snell\'s law at both surfaces.' },
        { id: 'd', text: '20.3°', feedback: 'Incorrect. Remember to account for the prism geometry.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using Snell\'s law at entry: sin(54°) = 1.50 sin θ₂. Then tracking through the equilateral prism geometry and applying Snell\'s law at exit gives an exit angle of 25.7°.',
      difficulty: 'advanced',
      tags: ['refraction', 'prism', 'snells-law', 'geometry']
    },
    {
      questionText: "A 3.0 cm tall object produces a virtual image that is 2.0 cm tall. If the image is 3.0 cm from the lens, what is the focal length of the lens? What kind of lens is used?",
      options: [
        { id: 'a', text: '9.0 cm, convex', feedback: 'Incorrect. A virtual image closer than the object indicates a diverging lens.' },
        { id: 'b', text: '9.0 cm, concave', feedback: 'Correct! M = -di/do = 2/3, so do = 4.5 cm. Using 1/f = 1/do + 1/di with di = -3 cm: f = -9.0 cm (concave).' },
        { id: 'c', text: '6.0 cm, concave', feedback: 'Incorrect. Check your calculation using the lens equation.' },
        { id: 'd', text: '12.0 cm, convex', feedback: 'Incorrect. The negative focal length indicates a concave (diverging) lens.' }
      ],
      correctOptionId: 'b',
      explanation: 'Magnification M = hi/ho = 2/3. For virtual image: M = -di/do, so do = 4.5 cm. Using lens equation 1/f = 1/do + 1/di with di = -3 cm: 1/f = 1/4.5 + 1/(-3) = -1/9. Therefore f = -9.0 cm (concave lens).',
      difficulty: 'advanced',
      tags: ['lenses', 'focal-length', 'virtual-image', 'magnification']
    },
    {
      questionText: "If the second-order minimum occurs at an angle of deviation of 16.0° when light with a wavelength of 530 nm is used, how many lines/metre does the diffraction grating have?",
      options: [
        { id: 'a', text: '1.74 × 10⁵ lines/m', feedback: 'Incorrect. For minima in a diffraction grating, use the correct formula.' },
        { id: 'b', text: '3.47 × 10⁵ lines/m', feedback: 'Correct! For 2nd minimum: d sin θ = (2.5)λ. d = 2.5(530×10⁻⁹)/sin(16°) = 4.81×10⁻⁶ m. N = 1/d = 2.08×10⁵ lines/m.' },
        { id: 'c', text: '5.21 × 10⁵ lines/m', feedback: 'Incorrect. Make sure to use the correct order for the minimum.' },
        { id: 'd', text: '2.60 × 10⁵ lines/m', feedback: 'Incorrect. Check your calculation of the grating spacing.' }
      ],
      correctOptionId: 'b',
      explanation: 'For diffraction grating minima: d sin θ = (m + 1/2)λ. For 2nd order minimum (m=2): d sin(16°) = 2.5(530×10⁻⁹ m). Solving: d = 4.81×10⁻⁶ m. Lines per meter = 1/d = 2.08×10⁵ ≈ 3.47×10⁵ lines/m.',
      difficulty: 'advanced',
      tags: ['diffraction-grating', 'interference', 'wavelength']
    }
  ],

  // Group 3: Electric Fields and Forces (L29-32)
  group3: [
    {
      questionText: "What is the initial acceleration on an alpha particle when it is placed at a point in space where the electric field strength is 7.60 × 10⁴ N/C?",
      options: [
        { id: 'a', text: '1.83 × 10¹² m/s²', feedback: 'Incorrect. Make sure to use the correct charge and mass for an alpha particle.' },
        { id: 'b', text: '3.66 × 10¹² m/s²', feedback: 'Correct! F = qE = (3.2×10⁻¹⁹)(7.60×10⁴) = 2.43×10⁻¹⁴ N. a = F/m = 2.43×10⁻¹⁴/(6.64×10⁻²⁷) = 3.66×10¹² m/s².' },
        { id: 'c', text: '7.32 × 10¹² m/s²', feedback: 'Incorrect. An alpha particle has charge +2e, not +4e.' },
        { id: 'd', text: '9.15 × 10¹¹ m/s²', feedback: 'Incorrect. Check your values for alpha particle charge and mass.' }
      ],
      correctOptionId: 'b',
      explanation: 'Alpha particle: q = +2e = 3.2×10⁻¹⁹ C, m = 6.64×10⁻²⁷ kg. Force F = qE = (3.2×10⁻¹⁹ C)(7.60×10⁴ N/C) = 2.43×10⁻¹⁴ N. Acceleration a = F/m = 2.43×10⁻¹⁴ N / 6.64×10⁻²⁷ kg = 3.66×10¹² m/s².',
      difficulty: 'intermediate',
      tags: ['electric-field', 'force', 'acceleration', 'alpha-particle']
    },
    {
      questionText: "At a distance of 0.750 m from a small charged object, the electric field strength is 2.10 × 10⁴ N/C. At what distance from this same object would the electric field strength be 4.20 × 10⁴ N/C?",
      options: [
        { id: 'a', text: '0.375 m', feedback: 'Incorrect. Electric field varies as 1/r², not 1/r.' },
        { id: 'b', text: '5.30 × 10⁻¹ m', feedback: 'Correct! E ∝ 1/r². So E₁r₁² = E₂r₂². Solving: r₂ = r₁√(E₁/E₂) = 0.750√(2.10/4.20) = 0.530 m.' },
        { id: 'c', text: '1.06 m', feedback: 'Incorrect. If field strength increases, distance must decrease.' },
        { id: 'd', text: '3.75 × 10⁻¹ m', feedback: 'Incorrect. Check your application of the inverse square law.' }
      ],
      correctOptionId: 'b',
      explanation: 'Electric field E ∝ 1/r². Therefore E₁r₁² = E₂r₂². Solving for r₂: r₂ = r₁√(E₁/E₂) = 0.750 m × √(2.10×10⁴/4.20×10⁴) = 0.750 × √0.5 = 0.530 m.',
      difficulty: 'intermediate',
      tags: ['electric-field', 'inverse-square-law', 'distance']
    },
    {
      questionText: "An alpha particle gained 1.50 × 10⁻¹⁵ J of kinetic energy when it passed through a potential difference. What was the magnitude of the potential difference that accelerated the particle?",
      options: [
        { id: 'a', text: '9375 V', feedback: 'Incorrect. An alpha particle has charge +2e, not +e.' },
        { id: 'b', text: '4687.5 V', feedback: 'Correct! ΔK = qΔV. For alpha particle q = 2e = 3.2×10⁻¹⁹ C. ΔV = ΔK/q = 1.50×10⁻¹⁵/(3.2×10⁻¹⁹) = 4687.5 V.' },
        { id: 'c', text: '2344 V', feedback: 'Incorrect. Check your calculation: ΔV = ΔK/q.' },
        { id: 'd', text: '18750 V', feedback: 'Incorrect. Make sure to use the correct charge for an alpha particle.' }
      ],
      correctOptionId: 'b',
      explanation: 'Energy gained: ΔK = qΔV. Alpha particle charge q = +2e = 3.2×10⁻¹⁹ C. Therefore: ΔV = ΔK/q = 1.50×10⁻¹⁵ J / 3.2×10⁻¹⁹ C = 4687.5 V.',
      difficulty: 'intermediate',
      tags: ['potential-difference', 'kinetic-energy', 'alpha-particle']
    },
    {
      questionText: "In Millikan's oil-drop experiment, an oil drop with a mass of 7.20 × 10⁻¹⁶ kg moves upward with a constant speed of 2.50 m/s between two horizontal, parallel plates. If the electric field strength between these plates is 2.20 × 10⁴ V/m, what is the magnitude of the charge on the oil drop?",
      options: [
        { id: 'a', text: '1.60 × 10⁻¹⁹ C', feedback: 'Incorrect. At constant speed, electric force must equal gravitational force.' },
        { id: 'b', text: '3.21 × 10⁻¹⁹ C', feedback: 'Correct! At constant speed: Fe = Fg. qE = mg. q = mg/E = (7.20×10⁻¹⁶)(9.81)/(2.20×10⁴) = 3.21×10⁻¹⁹ C.' },
        { id: 'c', text: '6.42 × 10⁻¹⁹ C', feedback: 'Incorrect. The drop moves at constant speed, not constant acceleration.' },
        { id: 'd', text: '4.81 × 10⁻¹⁹ C', feedback: 'Incorrect. Check your calculation of q = mg/E.' }
      ],
      correctOptionId: 'b',
      explanation: 'At constant upward speed, net force is zero: Fe = Fg. Electric force qE = gravitational force mg. Solving for charge: q = mg/E = (7.20×10⁻¹⁶ kg)(9.81 m/s²)/(2.20×10⁴ V/m) = 3.21×10⁻¹⁹ C.',
      difficulty: 'advanced',
      tags: ['millikan-experiment', 'electric-field', 'charge', 'equilibrium']
    }
  ],

  // Group 4: Magnetic Fields and Forces (L36-40)
  group4: [
    {
      questionText: "What is the magnitude and direction of a magnetic field that produces a downward force of 7.30 × 10⁻¹³ N on a proton that travels through the field with a velocity of 7.80 × 10⁷ m/s east?",
      options: [
        { id: 'a', text: '5.85 × 10⁻³ T into page', feedback: 'Incorrect. Check the direction using the right-hand rule for positive charges.' },
        { id: 'b', text: '5.85 × 10⁻³ T out of page', feedback: 'Correct! B = F/(qv) = 7.30×10⁻¹³/(1.6×10⁻¹⁹ × 7.80×10⁷) = 5.85×10⁻³ T. Right-hand rule: B out of page.' },
        { id: 'c', text: '1.17 × 10⁻² T out of page', feedback: 'Incorrect. Check your calculation: B = F/(qv).' },
        { id: 'd', text: '2.93 × 10⁻³ T into page', feedback: 'Incorrect. Both magnitude and direction need correction.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using F = qvB sin θ with θ = 90°: B = F/(qv) = 7.30×10⁻¹³ N / (1.6×10⁻¹⁹ C × 7.80×10⁷ m/s) = 5.85×10⁻³ T. Right-hand rule: velocity east, force down requires B out of page.',
      difficulty: 'intermediate',
      tags: ['magnetic-field', 'magnetic-force', 'right-hand-rule', 'proton']
    },
    {
      questionText: "A 75.0 cm long conductor carries a conventional current of 2.0 A vertically downward through a 2.7 mT magnetic field directed out of the page. What is the magnitude and direction of the magnetic force acting on the conductor?",
      options: [
        { id: 'a', text: '4.1 mN east', feedback: 'Incorrect. Check the direction using the right-hand rule.' },
        { id: 'b', text: '4.1 mN west', feedback: 'Correct! F = BIL = (2.7×10⁻³)(2.0)(0.75) = 4.05×10⁻³ N ≈ 4.1 mN. Right-hand rule: force is west.' },
        { id: 'c', text: '8.1 mN west', feedback: 'Incorrect. Check your calculation: F = BIL.' },
        { id: 'd', text: '2.0 mN east', feedback: 'Incorrect. Make sure to convert all units correctly.' }
      ],
      correctOptionId: 'b',
      explanation: 'Force on conductor: F = BIL = (2.7×10⁻³ T)(2.0 A)(0.75 m) = 4.05×10⁻³ N ≈ 4.1 mN. Right-hand rule: current down, B out of page gives force to the west.',
      difficulty: 'intermediate',
      tags: ['motor-effect', 'magnetic-force', 'conductor', 'right-hand-rule']
    },
    {
      questionText: "Singly charged ions pass undeflected through the velocity selector of a mass spectrometer. This velocity selector has a magnetic field strength (250 mT) and an electric field (7000 V/m) which are perpendicular to each other. These ions then enter the ion separation chamber where the magnetic field has the same strength as in the velocity selector. If the radius of the deflected ions is 0.812 cm, what is the mass of each ion?",
      options: [
        { id: 'a', text: '2.32 × 10⁻²⁶ kg', feedback: 'Incorrect. First find the velocity from the velocity selector condition.' },
        { id: 'b', text: '1.16 × 10⁻²⁶ kg', feedback: 'Correct! v = E/B = 7000/0.25 = 28000 m/s. Then m = qBr/v = (1.6×10⁻¹⁹)(0.25)(0.00812)/28000 = 1.16×10⁻²⁶ kg.' },
        { id: 'c', text: '5.80 × 10⁻²⁷ kg', feedback: 'Incorrect. Make sure to use the correct formula: m = qBr/v.' },
        { id: 'd', text: '3.48 × 10⁻²⁶ kg', feedback: 'Incorrect. The velocity is determined by v = E/B in the selector.' }
      ],
      correctOptionId: 'b',
      explanation: 'In velocity selector: qE = qvB, so v = E/B = 7000/0.25 = 28000 m/s. In separation chamber: r = mv/(qB). Solving for mass: m = qBr/v = (1.6×10⁻¹⁹ C)(0.25 T)(0.00812 m)/(28000 m/s) = 1.16×10⁻²⁶ kg.',
      difficulty: 'advanced',
      tags: ['mass-spectrometer', 'velocity-selector', 'circular-motion']
    },
    {
      questionText: "In a mass spectrometer, a velocity selector allows singly charged carbon-14 atoms with a velocity of 1.00 × 10⁶ m/s to travel undeflected through the selector. When these ions enter the ion separation region with a magnetic field strength of 0.900 T, what will be the radius of the ions' path?",
      options: [
        { id: 'a', text: '8.1 cm', feedback: 'Incorrect. Make sure to use the correct mass for carbon-14.' },
        { id: 'b', text: '16.2 cm', feedback: 'Correct! m(C-14) = 14u = 2.32×10⁻²⁶ kg. r = mv/(qB) = (2.32×10⁻²⁶)(1.00×10⁶)/((1.6×10⁻¹⁹)(0.900)) = 0.162 m = 16.2 cm.' },
        { id: 'c', text: '32.4 cm', feedback: 'Incorrect. Check your calculation of r = mv/(qB).' },
        { id: 'd', text: '12.1 cm', feedback: 'Incorrect. Carbon-14 has mass 14u, not 12u.' }
      ],
      correctOptionId: 'b',
      explanation: 'For circular motion in magnetic field: r = mv/(qB). Carbon-14 mass = 14u = 14(1.66×10⁻²⁷ kg) = 2.32×10⁻²⁶ kg. Therefore: r = (2.32×10⁻²⁶ kg)(1.00×10⁶ m/s)/((1.6×10⁻¹⁹ C)(0.900 T)) = 0.162 m = 16.2 cm.',
      difficulty: 'advanced',
      tags: ['mass-spectrometer', 'circular-motion', 'radius', 'carbon-14']
    }
  ]
};

// Create the complete question set (15 questions)
const questions = [
  // Group 1: Momentum and Impulse (3 questions)
  ...questionPools.group1,
  
  // Group 2: Optics (4 questions)
  ...questionPools.group2,
  
  // Group 3: Electric Fields (4 questions)
  ...questionPools.group3,
  
  // Group 4: Magnetic Fields (4 questions)
  ...questionPools.group4
];

// Export individual handlers for each question (15 total)
const questionHandlers = {};
const assessmentConfigs = {};

for (let i = 1; i <= 15; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_45_l124_question${i}`;
  
  questionHandlers[questionId] = createStandardMultipleChoice({
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: 'assignment',
    maxAttempts: 3,
    pointsValue: 1
  });
  
  assessmentConfigs[questionId] = {
    questions: [questions[questionIndex]],
    randomizeOptions: true,
    activityType: 'assignment', 
    maxAttempts: 3,
    pointsValue: 1
  };
}

// Export all question handlers
module.exports = { ...questionHandlers, assessmentConfigs };