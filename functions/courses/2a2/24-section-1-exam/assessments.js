const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { createStandardLongAnswer } = require('../shared/assessment-types/standard-long-answer');

// Multiple Choice Questions Array
const multipleChoiceQuestions = [
  {
    questionText: "A 0.30 kg object moving east at 4.0 m/s collides inelastically with a stationary 0.50 kg object. What is their final velocity?",
    options: [
      { id: 'a', text: '1.5 m/s', feedback: 'Correct! Using conservation of momentum: m₁v₁ = (m₁ + m₂)vf → (0.30)(4.0) = (0.80)vf → vf = 1.5 m/s' },
      { id: 'b', text: '2.0 m/s', feedback: 'Incorrect. Check your calculation using conservation of momentum.' },
      { id: 'c', text: '3.0 m/s', feedback: 'Incorrect. Remember both objects stick together after the collision.' },
      { id: 'd', text: '4.0 m/s', feedback: 'Incorrect. The final velocity must be less than the initial velocity.' }
    ],
    correctOptionId: 'a',
    explanation: 'For an inelastic collision where objects stick together, use conservation of momentum: p₁ = pf. Initial momentum = (0.30 kg)(4.0 m/s) = 1.2 kg·m/s. Final momentum = (0.80 kg)(vf). Therefore: 1.2 = 0.80vf, so vf = 1.5 m/s.',
    difficulty: 'intermediate',
    tags: ['momentum', 'inelastic-collision']
  },
  {
    questionText: "A bullet of mass 0.020 kg is fired from a 2.0 kg gun at 350 m/s. What is the recoil velocity of the gun?",
    options: [
      { id: 'a', text: '–3.5 m/s', feedback: 'Correct! Using conservation of momentum: 0 = m₁v₁ + m₂v₂ → (0.020)(350) + (2.0)v₂ = 0 → v₂ = –3.5 m/s' },
      { id: 'b', text: '–1.0 m/s', feedback: 'Incorrect. Check your calculation using the mass ratio.' },
      { id: 'c', text: '–2.5 m/s', feedback: 'Incorrect. Use conservation of momentum with initial total momentum = 0.' },
      { id: 'd', text: '–0.5 m/s', feedback: 'Incorrect. Make sure you use the correct masses in your calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Initially at rest, total momentum = 0. By conservation of momentum: mbvb + mgvg = 0. Therefore: (0.020)(350) + (2.0)vg = 0. Solving: vg = -7.0/2.0 = -3.5 m/s. The negative indicates opposite direction.',
    difficulty: 'intermediate',
    tags: ['momentum', 'recoil', 'conservation']
  },
  {
    questionText: "Which quantity is always conserved in a collision?",
    options: [
      { id: 'a', text: 'Kinetic energy', feedback: 'Incorrect. Kinetic energy is only conserved in perfectly elastic collisions.' },
      { id: 'b', text: 'Velocity', feedback: 'Incorrect. Individual velocities change during collisions.' },
      { id: 'c', text: 'Momentum', feedback: 'Correct! Momentum is always conserved in isolated systems, regardless of collision type.' },
      { id: 'd', text: 'Force', feedback: 'Incorrect. Force varies during the collision and is not a conserved quantity.' }
    ],
    correctOptionId: 'c',
    explanation: 'Momentum is always conserved in isolated systems (no external forces). This applies to all types of collisions - elastic, inelastic, and explosions. Kinetic energy is only conserved in perfectly elastic collisions.',
    difficulty: 'beginner',
    tags: ['momentum', 'conservation', 'conceptual']
  },
  {
    questionText: "The area under a force–time graph represents:",
    options: [
      { id: 'a', text: 'Work', feedback: 'Incorrect. Work is force × displacement, represented by area under F-d graph.' },
      { id: 'b', text: 'Acceleration', feedback: 'Incorrect. Acceleration is related to force but not to the area under F-t graph.' },
      { id: 'c', text: 'Displacement', feedback: 'Incorrect. Displacement is area under velocity-time graph.' },
      { id: 'd', text: 'Impulse', feedback: 'Correct! Impulse = ∫F dt, which is mathematically the area under a force-time graph.' }
    ],
    correctOptionId: 'd',
    explanation: 'Impulse is defined as J = ∫F dt (integral of force over time), which geometrically represents the area under a force-time graph. This impulse equals the change in momentum (J = Δp).',
    difficulty: 'intermediate',
    tags: ['impulse', 'graphs', 'conceptual']
  },
  {
    questionText: "A 2.5 kg object experiences a 10 N force for 0.60 s. The change in momentum is:",
    options: [
      { id: 'a', text: '6.0 kg·m/s', feedback: 'Correct! Impulse = FΔt = (10 N)(0.60 s) = 6.0 N·s = 6.0 kg·m/s, which equals the change in momentum.' },
      { id: 'b', text: '12.5 kg·m/s', feedback: 'Incorrect. This would be if you multiplied force by mass instead of time.' },
      { id: 'c', text: '4.0 kg·m/s', feedback: 'Incorrect. Check your calculation of impulse = force × time.' },
      { id: 'd', text: '15.0 kg·m/s', feedback: 'Incorrect. You may have added force and mass incorrectly.' }
    ],
    correctOptionId: 'a',
    explanation: 'Impulse equals change in momentum: J = Δp = FΔt. Therefore: Δp = (10 N)(0.60 s) = 6.0 N·s. Since 1 N·s = 1 kg·m/s, the change in momentum is 6.0 kg·m/s.',
    difficulty: 'intermediate',
    tags: ['impulse', 'momentum-change']
  },
  {
    questionText: "A 1.0 kg cart moving at 2.0 m/s collides elastically with a 1.0 kg stationary cart. Final speed of first cart?",
    options: [
      { id: 'a', text: '0 m/s', feedback: 'Correct! In a perfectly elastic collision between equal masses where one is initially at rest, the moving object stops and the stationary object takes on all the velocity.' },
      { id: 'b', text: '1.0 m/s', feedback: 'Incorrect. This would be the case if momentum was split equally, but that\'s not how elastic collisions work.' },
      { id: 'c', text: '2.0 m/s', feedback: 'Incorrect. The first cart cannot maintain its original speed after transferring momentum.' },
      { id: 'd', text: '4.0 m/s', feedback: 'Incorrect. This would violate conservation of momentum.' }
    ],
    correctOptionId: 'a',
    explanation: 'For a perfectly elastic collision between equal masses where one is initially at rest, the velocities are completely exchanged. The moving cart stops (v₁f = 0) and the stationary cart moves off with the original velocity (v₂f = 2.0 m/s).',
    difficulty: 'intermediate',
    tags: ['momentum', 'elastic-collision', 'equal-masses']
  },
  {
    questionText: "Two players collide and stick together. This is a:",
    options: [
      { id: 'a', text: 'Perfectly elastic collision', feedback: 'Incorrect. In elastic collisions, objects separate after collision.' },
      { id: 'b', text: 'Partially elastic collision', feedback: 'Incorrect. When objects stick together, it\'s completely inelastic.' },
      { id: 'c', text: 'Explosion', feedback: 'Incorrect. An explosion involves objects separating from rest or moving apart.' },
      { id: 'd', text: 'Completely inelastic collision', feedback: 'Correct! When objects stick together after collision, it\'s a completely (perfectly) inelastic collision.' }
    ],
    correctOptionId: 'd',
    explanation: 'A completely (perfectly) inelastic collision occurs when the colliding objects stick together and move with the same final velocity. Maximum kinetic energy is lost while momentum is still conserved.',
    difficulty: 'beginner',
    tags: ['collision-types', 'inelastic-collision', 'conceptual']
  },
  {
    questionText: "A 0.20 kg ball rebounds off a wall with equal speed. The impulse delivered by the wall is:",
    options: [
      { id: 'a', text: '0', feedback: 'Incorrect. Even though speeds are equal, the velocity changes direction, so momentum changes.' },
      { id: 'b', text: 'mv', feedback: 'Incorrect. This would be the magnitude of initial or final momentum, not the change.' },
      { id: 'c', text: '2mv', feedback: 'Correct! The ball\'s momentum changes from +mv to -mv, so Δp = -mv - (+mv) = -2mv. The impulse magnitude is 2mv.' },
      { id: 'd', text: '–mv', feedback: 'Incorrect. This represents only the change from positive to zero, not the full reversal.' }
    ],
    correctOptionId: 'c',
    explanation: 'When the ball rebounds with equal speed, its momentum changes from +mv to -mv (taking direction into account). The change in momentum is Δp = pf - pi = -mv - mv = -2mv. The impulse delivered by the wall has magnitude 2mv.',
    difficulty: 'intermediate',
    tags: ['impulse', 'momentum-change', 'rebounds']
  },
  {
    questionText: "A triangle-shaped force-time graph peaks at 10 N over 2.0 s. Impulse is:",
    options: [
      { id: 'a', text: '5.0 Ns', feedback: 'Incorrect. For a triangle, area = ½ × base × height, not base ÷ height.' },
      { id: 'b', text: '10.0 Ns', feedback: 'Correct! For a triangular force-time graph, impulse = area = ½ × base × height = ½ × 2.0 s × 10 N = 10.0 N·s.' },
      { id: 'c', text: '20.0 Ns', feedback: 'Incorrect. You may have calculated base × height instead of ½ × base × height.' },
      { id: 'd', text: '2.0 Ns', feedback: 'Incorrect. This is just the time duration, not the impulse.' }
    ],
    correctOptionId: 'b',
    explanation: 'The impulse equals the area under the force-time graph. For a triangle: Area = ½ × base × height = ½ × 2.0 s × 10 N = 10.0 N·s. This impulse equals the change in momentum.',
    difficulty: 'intermediate',
    tags: ['impulse', 'graphs', 'area-calculation']
  },
  {
    questionText: "During a collision with no net external force, momentum is:",
    options: [
      { id: 'a', text: 'Zero', feedback: 'Incorrect. The total momentum remains constant, but it\'s not necessarily zero.' },
      { id: 'b', text: 'Lost as heat', feedback: 'Incorrect. Energy may be lost as heat, but momentum is always conserved.' },
      { id: 'c', text: 'Conserved', feedback: 'Correct! In the absence of external forces, momentum is always conserved in all types of collisions.' },
      { id: 'd', text: 'Increasing', feedback: 'Incorrect. Without external forces, total momentum cannot increase.' }
    ],
    correctOptionId: 'c',
    explanation: 'The law of conservation of momentum states that in the absence of external forces, the total momentum of a system remains constant. This applies to all collisions and interactions within an isolated system.',
    difficulty: 'beginner',
    tags: ['momentum', 'conservation', 'conceptual']
  },
  {
    questionText: "Two identical balls are dropped from the same height. Ball A bounces off the ground, while Ball B sticks to the ground. Which ball experiences a greater impulse during the collision?",
    options: [
      { id: 'a', text: 'Ball A, because it changes direction.', feedback: 'Correct! Ball A changes from -v to +v (Δp = 2mv), while Ball B changes from -v to 0 (Δp = mv). Ball A experiences greater impulse.' },
      { id: 'b', text: 'Ball B, because it loses more momentum.', feedback: 'Incorrect. Ball B\'s momentum change is smaller in magnitude than Ball A\'s.' },
      { id: 'c', text: 'Both experience the same impulse.', feedback: 'Incorrect. The direction change in Ball A creates a larger momentum change.' },
      { id: 'd', text: 'Impulse depends only on mass, so they are equal.', feedback: 'Incorrect. Impulse depends on the change in momentum, which includes velocity changes.' }
    ],
    correctOptionId: 'a',
    explanation: 'Ball A bounces (momentum changes from -mv to +mv, so Δp = 2mv). Ball B sticks (momentum changes from -mv to 0, so Δp = mv). Since impulse equals change in momentum, Ball A experiences twice the impulse of Ball B.',
    difficulty: 'advanced',
    tags: ['impulse', 'momentum-change', 'collisions', 'comparison']
  },
  {
    questionText: "Light slows down entering a new medium. The angle of refraction:",
    options: [
      { id: 'a', text: 'Increases', feedback: 'Incorrect. When light slows down, it bends toward the normal, making the angle smaller.' },
      { id: 'b', text: 'Equals the critical angle', feedback: 'Incorrect. The critical angle applies to total internal reflection, not regular refraction.' },
      { id: 'c', text: 'Decreases', feedback: 'Correct! When light enters a denser medium and slows down, it bends toward the normal, decreasing the angle of refraction.' },
      { id: 'd', text: 'Becomes 90°', feedback: 'Incorrect. 90° would mean the light travels along the interface, which occurs at the critical angle.' }
    ],
    correctOptionId: 'c',
    explanation: 'When light enters a denser medium (higher refractive index), it slows down and bends toward the normal. This means the angle of refraction is smaller than the angle of incidence, according to Snell\'s law.',
    difficulty: 'intermediate',
    tags: ['refraction', 'snells-law', 'light-behavior']
  },
  {
    questionText: "The index of refraction compares:",
    options: [
      { id: 'a', text: 'Two wavelengths', feedback: 'Incorrect. While wavelength changes in different media, the index compares speeds.' },
      { id: 'b', text: 'Two frequencies', feedback: 'Incorrect. Frequency remains constant when light passes between media.' },
      { id: 'c', text: 'Light speeds', feedback: 'Correct! The index of refraction n = c/v, comparing the speed of light in vacuum to its speed in the medium.' },
      { id: 'd', text: 'Medium densities', feedback: 'Incorrect. While related to density, the index specifically compares light speeds.' }
    ],
    correctOptionId: 'c',
    explanation: 'The index of refraction is defined as n = c/v, where c is the speed of light in vacuum and v is the speed of light in the medium. It directly compares these two speeds.',
    difficulty: 'beginner',
    tags: ['refraction', 'index-of-refraction', 'light-speed']
  },
  {
    questionText: "A ray bends toward the normal. This means it entered a:",
    options: [
      { id: 'a', text: 'Slower medium', feedback: 'Correct! When light bends toward the normal, it has entered a denser medium where it travels slower.' },
      { id: 'b', text: 'Faster medium', feedback: 'Incorrect. Light bends away from the normal when entering a faster (less dense) medium.' },
      { id: 'c', text: 'Mirror', feedback: 'Incorrect. Mirrors reflect light; refraction occurs at transparent interfaces.' },
      { id: 'd', text: 'Vacuum', feedback: 'Incorrect. Light travels fastest in vacuum, so it would bend away from the normal.' }
    ],
    correctOptionId: 'a',
    explanation: 'When light bends toward the normal upon entering a new medium, it indicates the light has slowed down. This occurs when light enters a denser medium with a higher refractive index.',
    difficulty: 'intermediate',
    tags: ['refraction', 'light-behavior', 'medium-properties']
  },
  {
    questionText: "A convex lens forms a virtual, upright image. The object is:",
    options: [
      { id: 'a', text: 'At 2f', feedback: 'Incorrect. At 2f, a convex lens forms a real, inverted, same-size image.' },
      { id: 'b', text: 'At f', feedback: 'Incorrect. At the focal point, rays emerge parallel and no image forms.' },
      { id: 'c', text: 'Inside f', feedback: 'Correct! When the object is closer than the focal point, a convex lens acts like a magnifying glass, forming a virtual, upright, enlarged image.' },
      { id: 'd', text: 'Beyond 2f', feedback: 'Incorrect. Beyond 2f, a convex lens forms a real, inverted, reduced image.' }
    ],
    correctOptionId: 'c',
    explanation: 'A convex lens forms a virtual, upright image only when the object is placed closer than the focal point (inside f). In this case, the lens acts as a magnifying glass, producing an enlarged virtual image.',
    difficulty: 'intermediate',
    tags: ['lenses', 'convex-lens', 'image-formation']
  },
  {
    questionText: "Which diagram ray passes through the focal point after refraction?",
    options: [
      { id: 'a', text: 'Ray through center', feedback: 'Incorrect. A ray through the center passes through undeviated.' },
      { id: 'b', text: 'Ray parallel to axis', feedback: 'Correct! A ray parallel to the principal axis refracts and passes through the focal point on the opposite side.' },
      { id: 'c', text: 'Ray aimed at focal point on object side', feedback: 'Incorrect. This ray emerges parallel to the axis after refraction.' },
      { id: 'd', text: 'Ray perpendicular to lens', feedback: 'Incorrect. This describes the ray through the center, which passes straight through.' }
    ],
    correctOptionId: 'b',
    explanation: 'One of the three principal rays for lens diagrams: a ray parallel to the principal axis refracts through the focal point on the opposite side of the lens. This is a fundamental rule for ray diagrams.',
    difficulty: 'intermediate',
    tags: ['lenses', 'ray-diagrams', 'focal-point']
  },
  {
    questionText: "A diverging mirror always forms images that are:",
    options: [
      { id: 'a', text: 'Real and inverted', feedback: 'Incorrect. Diverging mirrors never form real images.' },
      { id: 'b', text: 'Real and upright', feedback: 'Incorrect. Diverging mirrors cannot form real images.' },
      { id: 'c', text: 'Virtual and inverted', feedback: 'Incorrect. Images formed by diverging mirrors are always upright.' },
      { id: 'd', text: 'Virtual and upright', feedback: 'Correct! Diverging (convex) mirrors always form virtual, upright, and reduced images regardless of object position.' }
    ],
    correctOptionId: 'd',
    explanation: 'Diverging (convex) mirrors always produce virtual, upright, and reduced images. The diverging nature means reflected rays appear to come from behind the mirror, creating virtual images that are always smaller and upright.',
    difficulty: 'intermediate',
    tags: ['mirrors', 'diverging-mirror', 'image-properties']
  },
  {
    questionText: "A concave mirror, object beyond f, forms an image that is:",
    options: [
      { id: 'a', text: 'Real and reduced', feedback: 'Incorrect. The size depends on whether the object is between f and 2f or beyond 2f.' },
      { id: 'b', text: 'Virtual and upright', feedback: 'Incorrect. When the object is beyond f, a concave mirror forms a real image.' },
      { id: 'c', text: 'Real and inverted', feedback: 'Correct! When an object is beyond the focal point of a concave mirror, it always forms a real, inverted image.' },
      { id: 'd', text: 'Virtual and inverted', feedback: 'Incorrect. Virtual images are always upright; real images are inverted.' }
    ],
    correctOptionId: 'c',
    explanation: 'When an object is placed beyond the focal point of a concave mirror, the reflected rays converge to form a real image. Real images formed by concave mirrors are always inverted. The size depends on the specific object distance.',
    difficulty: 'intermediate',
    tags: ['mirrors', 'concave-mirror', 'image-formation']
  },
  {
    questionText: "A plane mirror image is:",
    options: [
      { id: 'a', text: 'Real, inverted', feedback: 'Incorrect. Plane mirror images cannot be projected on a screen (virtual) and are upright.' },
      { id: 'b', text: 'Virtual, same size', feedback: 'Correct! Plane mirror images are virtual (cannot be projected), upright, same size, and appear to be the same distance behind the mirror.' },
      { id: 'c', text: 'Virtual, inverted', feedback: 'Incorrect. Plane mirror images are upright, not inverted.' },
      { id: 'd', text: 'Magnified', feedback: 'Incorrect. Plane mirrors produce images that are the same size as the object.' }
    ],
    correctOptionId: 'b',
    explanation: 'Plane mirrors always form virtual images that are upright, the same size as the object, and appear to be the same distance behind the mirror as the object is in front. The image cannot be projected on a screen.',
    difficulty: 'beginner',
    tags: ['mirrors', 'plane-mirror', 'image-properties']
  },
  {
    questionText: "The critical angle is:",
    options: [
      { id: 'a', text: 'Where refraction ceases', feedback: 'Incorrect. Refraction occurs at all angles below the critical angle.' },
      { id: 'b', text: 'When total internal reflection starts', feedback: 'Correct! The critical angle is the minimum angle of incidence for total internal reflection to occur.' },
      { id: 'c', text: 'Where incidence equals 0°', feedback: 'Incorrect. At 0° incidence, light passes straight through without bending.' },
      { id: 'd', text: 'Where light is absorbed', feedback: 'Incorrect. The critical angle relates to reflection, not absorption.' }
    ],
    correctOptionId: 'b',
    explanation: 'The critical angle is the angle of incidence at which the angle of refraction becomes 90°. At angles greater than the critical angle, total internal reflection occurs and no light is transmitted into the second medium.',
    difficulty: 'intermediate',
    tags: ['refraction', 'critical-angle', 'total-internal-reflection']
  },
  {
    questionText: "Light strikes glass (n = 1.52) at 30°. The angle of refraction is closest to:",
    options: [
      { id: 'a', text: '30°', feedback: 'Incorrect. The angle must change when light enters a different medium.' },
      { id: 'b', text: '45°', feedback: 'Incorrect. Light bends toward the normal when entering glass from air.' },
      { id: 'c', text: '19°', feedback: 'Correct! Using Snell\'s law: sin(θ₂) = sin(30°)/1.52 = 0.5/1.52 = 0.329, so θ₂ ≈ 19°.' },
      { id: 'd', text: '50°', feedback: 'Incorrect. This would be bending away from the normal, which occurs when exiting glass.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using Snell\'s law: n₁sin(θ₁) = n₂sin(θ₂). With n₁ = 1.00 (air), θ₁ = 30°, n₂ = 1.52: sin(θ₂) = (1.00)(sin30°)/1.52 = 0.5/1.52 = 0.329. Therefore θ₂ = arcsin(0.329) ≈ 19°.',
    difficulty: 'intermediate',
    tags: ['refraction', 'snells-law', 'calculation']
  },
  {
    questionText: "A prism splits white light into colors due to:",
    options: [
      { id: 'a', text: 'Absorption differences', feedback: 'Incorrect. Absorption would remove colors, not separate them.' },
      { id: 'b', text: 'Reflection properties', feedback: 'Incorrect. While reflection may play a role, the splitting is due to refraction.' },
      { id: 'c', text: 'Different bending by wavelength', feedback: 'Correct! Dispersion occurs because different wavelengths (colors) have different refractive indices and bend by different amounts.' },
      { id: 'd', text: 'Frequency changes', feedback: 'Incorrect. Frequency remains constant when light passes through materials.' }
    ],
    correctOptionId: 'c',
    explanation: 'Dispersion occurs because the refractive index of a material varies with wavelength. Different colors (wavelengths) bend by different amounts when passing through the prism, causing white light to separate into its component colors.',
    difficulty: 'intermediate',
    tags: ['dispersion', 'prism', 'wavelength', 'refraction']
  },
  {
    questionText: "Which setup produces a real image?",
    options: [
      { id: 'a', text: 'Convex lens, object outside f', feedback: 'Correct! When an object is placed beyond the focal point of a convex lens, it produces a real image that can be projected on a screen.' },
      { id: 'b', text: 'Convex lens, object inside f', feedback: 'Incorrect. When the object is inside the focal point, a convex lens produces a virtual image.' },
      { id: 'c', text: 'Plane mirror', feedback: 'Incorrect. Plane mirrors always produce virtual images.' },
      { id: 'd', text: 'Concave mirror, object inside f', feedback: 'Incorrect. When the object is inside the focal point, a concave mirror produces a virtual image.' }
    ],
    correctOptionId: 'a',
    explanation: 'A convex lens produces a real image when the object is placed beyond the focal point. Real images can be projected on a screen and are formed where light rays actually converge. The other options all produce virtual images.',
    difficulty: 'intermediate',
    tags: ['lenses', 'mirrors', 'real-images', 'image-formation']
  }
];

// Long Answer Question Configurations
const longAnswerQuestion1Config = {
  questions: [
    {
      questionText: "A 0.40 kg puck moving at 5.0 m/s strikes a 0.60 kg puck at rest. They stick together. a) Calculate their final velocity. (3 points) b) Is this collision elastic or inelastic? Justify your answer with calculations. (2 points)",
      rubric: [
        { criterion: "Momentum Conservation Setup", points: 1, description: "Correctly applies conservation of momentum equation: m₁v₁ + m₂v₂ = (m₁ + m₂)vf" },
        { criterion: "Calculation of Final Velocity", points: 2, description: "Correctly substitutes values and calculates final velocity as 2.0 m/s" },
        { criterion: "Collision Type Identification", points: 1, description: "Correctly identifies this as an inelastic collision" },
        { criterion: "Justification with Energy", points: 1, description: "Shows that kinetic energy is not conserved (KEᵢ = 5.0 J, KEf = 2.0 J)" }
      ],
      maxPoints: 5,
      wordLimit: { min: 50, max: 300 },
      sampleAnswer: "a) Using conservation of momentum: m₁v₁ + m₂v₂ = (m₁ + m₂)vf. Substituting values: (0.40 kg)(5.0 m/s) + (0.60 kg)(0 m/s) = (1.0 kg)vf. Therefore: 2.0 kg⋅m/s = 1.0 kg × vf, so vf = 2.0 m/s. b) This is an inelastic collision because the objects stick together after collision, and kinetic energy is not conserved (initial KE = ½(0.40)(5.0)² = 5.0 J, final KE = ½(1.0)(2.0)² = 2.0 J).",
      difficulty: "intermediate",
      topic: "Momentum and Collisions",
      tags: ["momentum", "conservation", "inelastic-collision"]
    }
  ],
  activityType: "exam",
  maxAttempts: 1,
  showRubric: true,
  showWordCount: true,
  theme: "blue",
  randomizeQuestions: false
};

const longAnswerQuestion2Config = {
  questions: [
    {
      questionText: "A light ray travels from air into crown glass (n = 1.52) at an incident angle of 35°. a) Calculate the angle of refraction. (2 points) b) Explain what happens to the speed of light when it enters the glass and why this occurs. (2 points)",
      rubric: [
        { criterion: "Snell's Law Application", points: 1, description: "Correctly applies Snell's law: n₁sin(θ₁) = n₂sin(θ₂)" },
        { criterion: "Angle Calculation", points: 1, description: "Correctly calculates the angle of refraction as 22.2°" },
        { criterion: "Speed Change Description", points: 1, description: "States that light slows down when entering glass" },
        { criterion: "Physical Explanation", points: 1, description: "Explains that glass has higher refractive index, making it optically denser" }
      ],
      maxPoints: 4,
      wordLimit: { min: 40, max: 200 },
      sampleAnswer: "a) Using Snell's law: n₁sin(θ₁) = n₂sin(θ₂). With n₁ = 1.00 (air), θ₁ = 35°, n₂ = 1.52 (crown glass): sin(θ₂) = (1.00)(sin35°)/1.52 = 0.574/1.52 = 0.378. Therefore θ₂ = arcsin(0.378) = 22.2°. b) The light slows down when entering glass because glass has a higher refractive index than air, meaning light travels slower in the denser optical medium.",
      difficulty: "intermediate",
      topic: "Light and Refraction",
      tags: ["refraction", "snells-law", "refractive-index"]
    }
  ],
  activityType: "exam",
  maxAttempts: 1,
  showRubric: true,
  showWordCount: true,
  theme: "blue",
  randomizeQuestions: false
};

// Assessment configurations for the master function
const assessmentConfigs = {
  'course2_24_section1_exam_q1': {
    questions: [multipleChoiceQuestions[0]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q2': {
    questions: [multipleChoiceQuestions[1]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q3': {
    questions: [multipleChoiceQuestions[2]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q4': {
    questions: [multipleChoiceQuestions[3]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q5': {
    questions: [multipleChoiceQuestions[4]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q6': {
    questions: [multipleChoiceQuestions[5]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q7': {
    questions: [multipleChoiceQuestions[6]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q8': {
    questions: [multipleChoiceQuestions[7]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q9': {
    questions: [multipleChoiceQuestions[8]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q10': {
    questions: [multipleChoiceQuestions[9]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q11': {
    questions: [multipleChoiceQuestions[10]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q12': {
    questions: [multipleChoiceQuestions[11]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q13': {
    questions: [multipleChoiceQuestions[12]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q14': {
    questions: [multipleChoiceQuestions[13]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q15': {
    questions: [multipleChoiceQuestions[14]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q16': {
    questions: [multipleChoiceQuestions[15]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q17': {
    questions: [multipleChoiceQuestions[16]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q18': {
    questions: [multipleChoiceQuestions[17]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q19': {
    questions: [multipleChoiceQuestions[18]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q20': {
    questions: [multipleChoiceQuestions[19]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q21': {
    questions: [multipleChoiceQuestions[20]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q22': {
    questions: [multipleChoiceQuestions[21]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_q23': {
    questions: [multipleChoiceQuestions[22]],
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: false
  },
  'course2_24_section1_exam_long1': longAnswerQuestion1Config,
  'course2_24_section1_exam_long2': longAnswerQuestion2Config
};

exports.assessmentConfigs = assessmentConfigs;