
// SECTION 2 EXAM - ELECTROMAGNETISM
// Physics 30 - Topics: Electrostatics, Electric Fields, Magnetic Fields, Motor Effect
// Questions 1-23: Multiple Choice (1 point each)
// Questions 24-25: Written Response (WR1: 4 points, WR2: 5 points)
// Total: 32 points

// IMAGE REQUIREMENTS NOTES:
// Q1(V1): Free-body diagram options - 4 image choices
// Q20(V2): Magnetic field diagram options - 4 image choices  
// Q21(V1): Direction matching with field arrows - 4 image choices
// NOTE: Q20 versions are swapped (V1 becomes V2, V2 becomes V1)

// Asset path for all images
const ASSET_PATH = '/courses/2/content/48-section-2-exam/assets/';

// Multiple Choice Questions Array with Variants A & B
const multipleChoiceQuestions = [
  // Question 1 - Free-body diagrams (IMAGE OPTIONS FOR V1)
  {
    questionText: "Which of the following free-body diagrams, drawn to scale, illustrates the electrostatic forces acting on a positive test charge placed at point P?",
    image: `${ASSET_PATH}q01_setup_v1.png`,
    options: [
      { 
        id: 'a', 
        text: `![Option A](${ASSET_PATH}q01_option_a_v1.png)`, 
        feedback: 'Incorrect. This diagram does not correctly represent the forces acting on the test charge.' 
      },
      { 
        id: 'b', 
        text: `![Option B](${ASSET_PATH}q01_option_b_v1.png)`, 
        feedback: 'Incorrect. The force vectors are not drawn to the correct scale.' 
      },
      { 
        id: 'c', 
        text: `![Option C](${ASSET_PATH}q01_option_c_v1.png)`, 
        feedback: 'Correct! This diagram correctly shows the electrostatic forces acting on the positive test charge at point P.' 
      },
      { 
        id: 'd', 
        text: `![Option D](${ASSET_PATH}q01_option_d_v1.png)`, 
        feedback: 'Incorrect. The directions of the force vectors are wrong.' 
      }
    ],
    correctOptionId: 'c',
    explanation: 'The free-body diagram must show forces that are proportional to the charge magnitudes and inversely proportional to the square of the distances, with correct directions based on charge interactions.',
    difficulty: 'intermediate',
    tags: ['electrostatics', 'free-body-diagrams', 'coulombs-law'],
    variant: 'A'
  },
  {
    questionText: "The net electrostatic force on sphere III that is caused by the charges on spheres I and II is:",
    image: `${ASSET_PATH}q01_setup_v2.png`,
    options: [
      { id: 'a', text: '6.99 × 10⁻⁴ N, right', feedback: 'Incorrect. Check your calculation of the net force.' },
      { id: 'b', text: '1.06 × 10⁻³ N, right', feedback: 'Incorrect. Review the force calculations from each sphere.' },
      { id: 'c', text: '6.99 N, right', feedback: 'Correct! The net electrostatic force is 6.99 N to the right.' },
      { id: 'd', text: '10.6 N, right', feedback: 'Incorrect. This represents an arithmetic error in combining forces.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using Coulomb\'s law, calculate the force from each sphere on sphere III, then find the vector sum considering directions.',
    difficulty: 'advanced',
    tags: ['electrostatics', 'coulombs-law', 'free-body-diagrams'],
    variant: 'B'
  },

  // Question 2 - Force scaling with charge and distance changes
  {
    questionText: "Two point charges produce an electric force on each other of 4.5 mN. What is the electric force if the charge on both objects triples and the distance between them doubles?",
    options: [
      { id: 'a', text: '0.010 N', feedback: 'Correct! F = k(3q₁)(3q₂)/(2r)² = 9kq₁q₂/4r² = 9/4 × 4.5 mN = 10.125 mN ≈ 0.010 N' },
      { id: 'b', text: '0.020 N', feedback: 'Incorrect. Check how both charge tripling and distance doubling affect the force.' },
      { id: 'c', text: '0.040 N', feedback: 'Incorrect. Remember that force is proportional to the product of charges and inversely proportional to distance squared.' },
      { id: 'd', text: '0.090 N', feedback: 'Incorrect. This would be the result if only the charges were considered without the distance change.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using Coulomb\'s law: F ∝ q₁q₂/r². When both charges triple: factor of 9. When distance doubles: factor of 1/4. Net factor: 9/4 = 2.25. So 4.5 mN × 2.25 = 10.125 mN ≈ 0.010 N',
    difficulty: 'intermediate',
    tags: ['coulombs-law', 'force-scaling', 'proportional-reasoning'],
    variant: 'A'
  },
  {
    questionText: "Two charged spheres exert a force of 6.0 mN on each other. If one charge is doubled and the other is halved, and the distance is reduced by a factor of 2, what is the new force?",
    options: [
      { id: 'a', text: '3.0 mN', feedback: 'Incorrect. Check how the charge changes and distance reduction affect the force.' },
      { id: 'b', text: '6.0 mN', feedback: 'Incorrect. The force will change due to both charge and distance modifications.' },
      { id: 'c', text: '12.0 mN', feedback: 'Incorrect. Check your calculation - consider both charge and distance effects carefully.' },
      { id: 'd', text: '24.0 mN', feedback: 'Correct! Charge factor: 2 × 0.5 = 1. Distance factor: (1/2)² = 1/4, so force increases by 4. Final: 6.0 mN × 4 = 24.0 mN' }
    ],
    correctOptionId: 'd',
    explanation: 'Charge effect: 2 × 0.5 = 1 (no change). Distance effect: force ∝ 1/r², so halving distance increases force by 4. Net: 6.0 mN × 1 × 4 = 24.0 mN',
    difficulty: 'intermediate',
    tags: ['coulombs-law', 'force-scaling', 'proportional-reasoning'],
    variant: 'B'
  },

  // Question 3 - Charges touching and separation
  {
    questionText: "Two spheres with charges +4.00 μC and –1.00 μC touch briefly, then are separated by 20 cm. What is the force between them? What process occurred?",
    options: [
      { id: 'a', text: '0.0200 N Charging by polarization', feedback: 'Incorrect. This is not the correct force calculation or charging process.' },
      { id: 'b', text: '0.0506 N Charging by conduction', feedback: 'Correct! After touching, charges redistribute equally: (+4.00 - 1.00)/2 = +1.50 μC each. F = k(1.50×10⁻⁶)²/(0.20)² = 0.0506 N. This is charging by conduction.' },
      { id: 'c', text: '0.0700 N Charging by friction', feedback: 'Incorrect. The force calculation and charging process are wrong.' },
      { id: 'd', text: '0.1000 N Charging by induction', feedback: 'Incorrect. This is not the correct force or charging process.' }
    ],
    correctOptionId: 'b',
    explanation: 'When conductors touch, charge redistributes equally. Total charge: +4.00 + (-1.00) = +3.00 μC. Each gets +1.50 μC. Force: F = k(1.50×10⁻⁶)²/(0.20)² = 0.0506 N. This is charging by conduction.',
    difficulty: 'intermediate',
    tags: ['electrostatics', 'charging-by-conduction', 'coulombs-law'],
    variant: 'A'
  },
  {
    questionText: "A +6.0 μC sphere touches a –2.0 μC sphere. After separation, they are 30 cm apart. What is the new force?",
    options: [
      { id: 'a', text: '0.0180 N', feedback: 'Incorrect. Check the charge redistribution calculation.' },
      { id: 'b', text: '0.0240 N', feedback: 'Incorrect. Review how charges redistribute when conductors touch.' },
      { id: 'c', text: '0.0320 N', feedback: 'Correct! After touching: total charge = +6.0 + (-2.0) = +4.0 μC. Each gets +2.0 μC. F = k(2.0×10⁻⁶)²/(0.30)² = 0.0320 N' },
      { id: 'd', text: '0.0360 N', feedback: 'Incorrect. Check your calculation of the final force.' }
    ],
    correctOptionId: 'c',
    explanation: 'When conductors touch, charge redistributes equally. Total: +6.0 + (-2.0) = +4.0 μC. Each gets +2.0 μC. F = k(2.0×10⁻⁶)²/(0.30)² = 0.0320 N',
    difficulty: 'intermediate',
    tags: ['electrostatics', 'charging-by-conduction', 'coulombs-law'],
    variant: 'B'
  },

  // Question 4 - Work calculation (IMAGES NEEDED FOR BOTH VERSIONS)
  {
    questionText: "How much work is required to move an electron from location I to location II?",
    image: `${ASSET_PATH}q04_setup_v1.png`,
    options: [
      { id: 'a', text: '5.8 × 10⁻¹⁷ J', feedback: 'Incorrect. Check your calculation using W = qΔV.' },
      { id: 'b', text: '1.5 × 10⁻¹⁶ J', feedback: 'Correct! Work = qΔV = (1.6 × 10⁻¹⁹ C)(potential difference)' },
      { id: 'c', text: '1.6 × 10⁻¹⁶ J', feedback: 'Incorrect. This uses the wrong potential difference.' },
      { id: 'd', text: '1.9 × 10⁻¹⁶ J', feedback: 'Incorrect. Review the work-energy relationship for charged particles.' }
    ],
    correctOptionId: 'b',
    explanation: 'Work done on a charged particle in an electric field is W = qΔV, where q is the charge and ΔV is the potential difference between the two points.',
    difficulty: 'intermediate',
    tags: ['work-energy', 'electric-potential', 'electron'],
    variant: 'A'
  },
  {
    questionText: "How much work is required to move a proton from location I to location II (same E-field)?",
    image: `${ASSET_PATH}q04_setup_v2.png`,
    options: [
      { id: 'a', text: '5.8 × 10⁻¹⁷ J', feedback: 'Incorrect. Check your calculation using W = qΔV.' },
      { id: 'b', text: '1.5 × 10⁻¹⁶ J', feedback: 'Incorrect. This is the result for an electron.' },
      { id: 'c', text: '1.6 × 10⁻¹⁶ J', feedback: 'Incorrect. This uses the wrong potential difference.' },
      { id: 'd', text: '1.9 × 10⁻¹⁶ J', feedback: 'Correct! Work = qΔV = (1.6 × 10⁻¹⁹ C)(potential difference for proton)' }
    ],
    correctOptionId: 'd',
    explanation: 'For a proton in the same field, the work calculation uses the same formula W = qΔV, but the potential difference experienced differs due to the opposite charge direction.',
    difficulty: 'intermediate',
    tags: ['work-energy', 'electric-potential', 'proton'],
    variant: 'B'
  },

  // Question 5 - Energy changes in electric field
  {
    questionText: "As an electron accelerates in an electric field and moves farther from the negatively charged plate, its kinetic energy _____, its potential energy _____, because of the work done by the electric _____.",
    options: [
      { id: 'a', text: 'increases, decreases, field', feedback: 'Incorrect. Check the energy relationships.' },
      { id: 'b', text: 'increases, decreases, force', feedback: 'Correct! KE increases, PE decreases, due to work by electric force.' },
      { id: 'c', text: 'decreases, increases, field', feedback: 'Incorrect. The electron gains speed moving away from like charges.' },
      { id: 'd', text: 'decreases, increases, force', feedback: 'Incorrect. The electron accelerates away from the negative plate.' }
    ],
    correctOptionId: 'b',
    explanation: 'An electron moving away from a negative plate is accelerated by the electric force, gaining kinetic energy while losing potential energy. The work is done by the electric force.',
    difficulty: 'intermediate',
    tags: ['energy-conservation', 'electric-field', 'electron-motion'],
    variant: 'A'
  },
  {
    questionText: "A small, positively charged sphere is released from rest near the positive plate of a parallel-plate capacitor. As it moves freely in the electric field toward the negative plate, which of the following best describes the changes in its energy and the cause of that change?",
    options: [
      { id: 'a', text: 'Kinetic energy increases, potential energy increases, due to applied force', feedback: 'Incorrect. Both energies cannot increase simultaneously in this conservative system.' },
      { id: 'b', text: 'Kinetic energy increases, potential energy decreases, due to electric field', feedback: 'Correct! KE increases as PE decreases, work done by electric field.' },
      { id: 'c', text: 'Kinetic energy decreases, potential energy increases, due to magnetic force', feedback: 'Incorrect. No magnetic force is present, and the particle accelerates.' },
      { id: 'd', text: 'Kinetic energy remains constant, potential energy remains constant, due to balanced forces', feedback: 'Incorrect. The particle accelerates due to unbalanced electric force.' }
    ],
    correctOptionId: 'b',
    explanation: 'A positive charge moves from high to low potential, losing potential energy and gaining kinetic energy. The electric field does positive work on the charge.',
    difficulty: 'intermediate',
    tags: ['energy-conservation', 'electric-field', 'positive-charge'],
    variant: 'B'
  },

  // Question 6 - Acceleration in electric field
  {
    questionText: "What is the acceleration of an alpha particle placed in an electric field of 7.60 × 10⁴ N/C?",
    options: [
      { id: 'a', text: '2.4 × 10¹² m/s²', feedback: 'Incorrect. Check your calculation using F = ma and F = qE.' },
      { id: 'b', text: '3.66 × 10¹² m/s²', feedback: 'Correct! a = qE/m = (3.2×10⁻¹⁹ C)(7.60×10⁴ N/C)/(6.64×10⁻²⁷ kg)' },
      { id: 'c', text: '5.0 × 10¹² m/s²', feedback: 'Incorrect. Review the mass of an alpha particle.' },
      { id: 'd', text: '1.1 × 10¹³ m/s²', feedback: 'Incorrect. This may be using wrong charge or mass values.' }
    ],
    correctOptionId: 'b',
    explanation: 'Using F = qE = ma, so a = qE/m. For an alpha particle: q = 3.2×10⁻¹⁹ C, m = 6.64×10⁻²⁷ kg.',
    difficulty: 'intermediate',
    tags: ['acceleration', 'electric-field', 'alpha-particle'],
    variant: 'A'
  },
  {
    questionText: "A proton experiences a 2.00 × 10⁴ N/C electric field. What is its acceleration?",
    options: [
      { id: 'a', text: '1.25 × 10¹⁵ m/s²', feedback: 'Incorrect. Check your calculation using a = qE/m.' },
      { id: 'b', text: '3.29 × 10¹² m/s²', feedback: 'Incorrect. Review the proton mass value.' },
      { id: 'c', text: '1.91 × 10¹² m/s²', feedback: 'Correct! a = qE/m = (1.6×10⁻¹⁹ C)(2.00×10⁴ N/C)/(1.67×10⁻²⁷ kg)' },
      { id: 'd', text: '4.52 × 10¹³ m/s²', feedback: 'Incorrect. This uses incorrect mass or charge values.' }
    ],
    correctOptionId: 'c',
    explanation: 'For a proton: a = qE/m = (1.6×10⁻¹⁹ C)(2.00×10⁴ N/C)/(1.67×10⁻²⁷ kg) = 1.91×10¹² m/s²',
    difficulty: 'intermediate',
    tags: ['acceleration', 'electric-field', 'proton'],
    variant: 'B'
  },

  // Question 7 - Electric field midway between charges
  {
    questionText: "Calculate the electric field strength midway between a +3.0 μC and +6.0 μC charge 80 cm apart.",
    options: [
      { id: 'a', text: '1.1 × 10⁵ N/C', feedback: 'Incorrect. Check your vector addition of the two field contributions.' },
      { id: 'b', text: '1.3 × 10⁵ N/C', feedback: 'Incorrect. Review the calculation for each charge contribution.' },
      { id: 'c', text: '1.7 × 10⁵ N/C', feedback: 'Correct! Net field = |E₆μC - E₃μC| at midpoint' },
      { id: 'd', text: '2.5 × 10⁵ N/C', feedback: 'Incorrect. This would be if the fields added rather than subtracted.' }
    ],
    correctOptionId: 'c',
    explanation: 'At the midpoint, both charges create fields pointing away (same direction for like charges). Calculate each field using E = kq/r² at 40 cm, then find the vector sum.',
    difficulty: 'advanced',
    tags: ['electric-field', 'superposition', 'like-charges'],
    variant: 'A'
  },
  {
    questionText: "What is the electric field midway between a +2.0 μC and –2.0 μC charge 60 cm apart?",
    options: [
      { id: 'a', text: '2.0 × 10⁵ N/C', feedback: 'Incorrect. Check the direction and magnitude of field contributions.' },
      { id: 'b', text: '4.0 × 10⁵ N/C', feedback: 'Correct! Fields from opposite charges add at midpoint: E₊ + E₋' },
      { id: 'c', text: '6.0 × 10⁵ N/C', feedback: 'Incorrect. This uses wrong distance values.' },
      { id: 'd', text: '8.0 × 10⁵ N/C', feedback: 'Incorrect. Check your calculation method.' }
    ],
    correctOptionId: 'b',
    explanation: 'For opposite charges, the electric fields at the midpoint add because they point in the same direction (from + to -). Each field magnitude: E = kq/r² at 30 cm.',
    difficulty: 'advanced',
    tags: ['electric-field', 'superposition', 'opposite-charges'],
    variant: 'B'
  },

  // Question 8 - Electric field distance relationship
  {
    questionText: "The electric field at 0.750 m from a charge is 2.10 × 10⁴ N/C. At what distance would it be 4.20 × 10⁴ N/C?",
    options: [
      { id: 'a', text: '0.375 m', feedback: 'Incorrect. This would double the field, but check the inverse square relationship.' },
      { id: 'b', text: '0.530 m', feedback: 'Correct! Using E ∝ 1/r², if E doubles, r decreases by factor of √2' },
      { id: 'c', text: '1.00 m', feedback: 'Incorrect. This increases distance but field should be stronger at closer distance.' },
      { id: 'd', text: '1.50 m', feedback: 'Incorrect. Moving farther decreases field strength.' }
    ],
    correctOptionId: 'b',
    explanation: 'Electric field follows E ∝ 1/r². When E doubles, r must decrease by √2. So r = 0.750 m / √2 = 0.530 m.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'inverse-square-law', 'distance'],
    variant: 'A'
  },
  {
    questionText: "At 1.00 m, the field strength is 9.00 × 10⁴ N/C. At what distance would it be 2.25 × 10⁴ N/C?",
    options: [
      { id: 'a', text: '0.25 m', feedback: 'Incorrect. This would increase field strength, not decrease it.' },
      { id: 'b', text: '1.50 m', feedback: 'Incorrect. Check the inverse square relationship calculation.' },
      { id: 'c', text: '2.00 m', feedback: 'Correct! Field decreases by factor of 4, so distance increases by factor of 2' },
      { id: 'd', text: '3.00 m', feedback: 'Incorrect. This would decrease field too much.' }
    ],
    correctOptionId: 'c',
    explanation: 'E ∝ 1/r². Field decreases from 9.00×10⁴ to 2.25×10⁴ (factor of 4), so distance increases by √4 = 2. New distance: 1.00 m × 2 = 2.00 m.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'inverse-square-law', 'distance'],
    variant: 'B'
  },

  // Question 9 - Potential difference and kinetic energy
  {
    questionText: "An alpha particle gains 1.50 × 10⁻¹⁵ J of kinetic energy. What potential difference accelerated it?",
    options: [
      { id: 'a', text: '2343.8 V', feedback: 'Incorrect. Check your calculation using ΔKE = qΔV.' },
      { id: 'b', text: '3512.5 V', feedback: 'Incorrect. Review the charge of an alpha particle.' },
      { id: 'c', text: '4687.5 V', feedback: 'Correct! ΔV = ΔKE/q = (1.50×10⁻¹⁵ J)/(3.2×10⁻¹⁹ C)' },
      { id: 'd', text: '5000 V', feedback: 'Incorrect. This uses the wrong charge value.' }
    ],
    correctOptionId: 'c',
    explanation: 'Using energy conservation: ΔKE = qΔV, so ΔV = ΔKE/q. For alpha particle: q = 3.2×10⁻¹⁹ C.',
    difficulty: 'intermediate',
    tags: ['potential-difference', 'kinetic-energy', 'alpha-particle'],
    variant: 'A'
  },
  {
    questionText: "A proton gains 3.20 × 10⁻¹⁹ J of kinetic energy. What is the potential difference?",
    options: [
      { id: 'a', text: '0.80 V', feedback: 'Incorrect. Check your energy-to-voltage conversion.' },
      { id: 'b', text: '1.00 V', feedback: 'Incorrect. This seems too simple - verify your calculation.' },
      { id: 'c', text: '1.20 V', feedback: 'Incorrect. Review the relationship ΔKE = qΔV.' },
      { id: 'd', text: '2.00 V', feedback: 'Correct! ΔV = ΔKE/q = (3.20×10⁻¹⁹ J)/(1.6×10⁻¹⁹ C) = 2.00 V' }
    ],
    correctOptionId: 'd',
    explanation: 'Using ΔKE = qΔV: ΔV = (3.20×10⁻¹⁹ J)/(1.6×10⁻¹⁹ C) = 2.00 V.',
    difficulty: 'intermediate',
    tags: ['potential-difference', 'kinetic-energy', 'proton'],
    variant: 'B'
  },

  // Question 10 - Work done parallel vs perpendicular to field
  {
    questionText: "A proton moves 3.0 cm parallel to two plates 6.0 cm apart with a 750 V potential difference. How much work is done against the field?",
    options: [
      { id: 'a', text: '0 J', feedback: 'Correct! No work is done when moving parallel to equipotential lines.' },
      { id: 'b', text: '3.0 × 10⁻¹⁷ J', feedback: 'Incorrect. Consider the direction of motion relative to the field.' },
      { id: 'c', text: '6.0 × 10⁻¹⁷ J', feedback: 'Incorrect. Work depends on displacement in the field direction.' },
      { id: 'd', text: '1.2 × 10⁻¹⁶ J', feedback: 'Incorrect. This would be for motion perpendicular to the plates.' }
    ],
    correctOptionId: 'a',
    explanation: 'Work = qE·d where d is displacement in field direction. Moving parallel to plates means no displacement in field direction, so W = 0.',
    difficulty: 'intermediate',
    tags: ['work-energy', 'electric-field', 'parallel-motion'],
    variant: 'A'
  },
  {
    questionText: "The proton moves 3.0 cm perpendicular to two plates 6.0 cm apart with a 750 V potential difference. How much work is done against the field?",
    options: [
      { id: 'a', text: '3.0 × 10⁻¹⁷ J', feedback: 'Incorrect. Check your calculation using W = qEd.' },
      { id: 'b', text: '6.0 × 10⁻¹⁷ J', feedback: 'Correct! W = qEd = q(V/s)d where motion is perpendicular to plates' },
      { id: 'c', text: '9.0 × 10⁻¹⁷ J', feedback: 'Incorrect. Review the electric field calculation.' },
      { id: 'd', text: '1.5 × 10⁻¹⁶ J', feedback: 'Incorrect. This uses wrong field or distance values.' }
    ],
    correctOptionId: 'b',
    explanation: 'Work = qEd. Electric field E = V/s = 750 V / 0.06 m. Work = (1.6×10⁻¹⁹ C)(12500 N/C)(0.03 m) = 6.0×10⁻¹⁷ J.',
    difficulty: 'intermediate',
    tags: ['work-energy', 'electric-field', 'perpendicular-motion'],
    variant: 'B'
  },

  // Question 11 - Force on charged particle in field
  {
    questionText: "What force is required to move an alpha particle between plates 7.5 cm apart if potential difference is 12421.9 V?",
    options: [
      { id: 'a', text: '2.7 × 10⁻¹³ N', feedback: 'Incorrect. Check your electric field calculation.' },
      { id: 'b', text: '3.5 × 10⁻¹³ N', feedback: 'Incorrect. Review F = qE where E = V/d.' },
      { id: 'c', text: '5.3 × 10⁻¹⁴ N', feedback: 'Correct! F = qE = q(V/d) = (3.2×10⁻¹⁹)(12421.9/0.075)' },
      { id: 'd', text: '6.8 × 10⁻¹³ N', feedback: 'Incorrect. This may use wrong charge or distance values.' }
    ],
    correctOptionId: 'c',
    explanation: 'Force = qE = q(V/d). For alpha particle: F = (3.2×10⁻¹⁹ C)(12421.9 V / 0.075 m) = 5.3×10⁻¹⁴ N.',
    difficulty: 'intermediate',
    tags: ['electric-force', 'alpha-particle', 'parallel-plates'],
    variant: 'A'
  },
  {
    questionText: "A proton experiences a 7500 V/m electric field. What force does it experience?",
    options: [
      { id: 'a', text: '1.20 × 10⁻¹⁵ N', feedback: 'Incorrect. Check your multiplication.' },
      { id: 'b', text: '1.60 × 10⁻¹⁵ N', feedback: 'Correct! F = qE = (1.6×10⁻¹⁹ C)(7500 V/m)' },
      { id: 'c', text: '1.20 × 10⁻¹⁹ N', feedback: 'Incorrect. This is too small - check your powers of 10.' },
      { id: 'd', text: '4.80 × 10⁻¹⁵ N', feedback: 'Incorrect. This uses the wrong charge value.' }
    ],
    correctOptionId: 'b',
    explanation: 'F = qE = (1.6×10⁻¹⁹ C)(7500 V/m) = 1.20×10⁻¹⁵ N.',
    difficulty: 'beginner',
    tags: ['electric-force', 'proton', 'field-strength'],
    variant: 'B'
  },

  // Question 12 - Charged particle motion in magnetic field
  {
    questionText: "The path of a charged particle travelling perpendicularly through a uniform magnetic field is deflected due to _____ and the speed of the charged particle will _____.",
    options: [
      { id: 'a', text: 'an unbalanced magnetic force, stay the same', feedback: 'Correct! Magnetic force is always perpendicular to velocity, so it changes direction but not speed.' },
      { id: 'b', text: 'an unbalanced magnetic force, increase', feedback: 'Incorrect. Magnetic force does no work on the particle.' },
      { id: 'c', text: 'a balanced centripetal force, stay the same', feedback: 'Incorrect. The magnetic force is unbalanced and provides centripetal acceleration.' },
      { id: 'd', text: 'a balanced centripetal force, increase', feedback: 'Incorrect. Magnetic force doesn\'t increase particle speed.' }
    ],
    correctOptionId: 'a',
    explanation: 'Magnetic force F = qv×B is always perpendicular to velocity, providing centripetal force that curves the path without changing speed.',
    difficulty: 'intermediate',
    tags: ['magnetic-force', 'charged-particle', 'circular-motion'],
    variant: 'A'
  },
  {
    questionText: "A beam of negatively charged particles enters a region where a uniform magnetic field is directed into the page. The particles enter moving parallel to the top of the page. What will be the shape of their path, and what happens to their speed?",
    options: [
      { id: 'a', text: 'Circular path, constant speed', feedback: 'Correct! Magnetic force provides centripetal force, maintaining constant speed in circular motion.' },
      { id: 'b', text: 'Circular path, decreasing speed', feedback: 'Incorrect. Magnetic force does no work on moving charges.' },
      { id: 'c', text: 'Spiral path, increasing speed', feedback: 'Incorrect. No energy is added by the magnetic force.' },
      { id: 'd', text: 'Straight line, constant speed', feedback: 'Incorrect. The magnetic force will deflect the charged particles.' }
    ],
    correctOptionId: 'a',
    explanation: 'Charged particles in a uniform magnetic field follow circular paths at constant speed because the magnetic force is always perpendicular to velocity.',
    difficulty: 'intermediate',
    tags: ['magnetic-force', 'charged-particle', 'circular-motion'],
    variant: 'B'
  },

  // Question 13 - Ring and magnet electromagnetic induction (IMAGES NEEDED)
  {
    questionText: "The ring swings _____ the magnet and the electron flow at point P is toward the _____ of the page.",
    image: `${ASSET_PATH}q13_setup_v1.png`,
    options: [
      { id: 'a', text: 'away from, top', feedback: 'Incorrect. Check Lenz\'s law for the direction of induced effects.' },
      { id: 'b', text: 'away from, bottom', feedback: 'Correct! The ring opposes the approaching magnet by moving away, electron flow creates opposing field.' },
      { id: 'c', text: 'toward, top', feedback: 'Incorrect. The ring will oppose the change in magnetic flux.' },
      { id: 'd', text: 'toward, bottom', feedback: 'Incorrect. This would assist rather than oppose the flux change.' }
    ],
    correctOptionId: 'b',
    explanation: 'By Lenz\'s law, the induced effects oppose the change. The ring moves away from the approaching magnet, and induced current creates an opposing magnetic field.',
    difficulty: 'advanced',
    tags: ['ring-magnet-induction', 'lenz-law', 'ring-magnet'],
    variant: 'A'
  },
  {
    questionText: "When the south pole of the magnet moves into the ring from above, the direction the electrons inside the copper ring will move is from _____ . Compared to X, the nature of the charge on Y will be relatively _____.",
    image: `${ASSET_PATH}q13_setup_v2.png`,
    options: [
      { id: 'a', text: 'X to Y, negative', feedback: 'Incorrect. Check the direction of induced current using Lenz\'s law.' },
      { id: 'b', text: 'X to Y, positive', feedback: 'Incorrect. Review the electron flow direction.' },
      { id: 'c', text: 'Y to X, negative', feedback: 'Incorrect. Check the charge buildup from electron movement.' },
      { id: 'd', text: 'Y to X, positive', feedback: 'Correct! Electrons flow Y to X, making Y relatively positive compared to X.' }
    ],
    correctOptionId: 'd',
    explanation: 'As the south pole approaches, induced current opposes the flux increase. Electrons flow to create opposing field, causing charge separation.',
    difficulty: 'advanced',
    tags: ['ring-magnet-induction', 'lenz-law', 'electron-flow'],
    variant: 'B'
  },

  // Question 14 - Electric field and force directions (IMAGES NEEDED)
  {
    questionText: "The direction of the net electric force on sphere L due to spheres K and M is:",
    image: `${ASSET_PATH}q14_setup_v1.png`,
    options: [
      { id: 'a', text: 'to the left of the page', feedback: 'Correct! Vector addition of forces from K and M results in net force to the left.' },
      { id: 'b', text: 'to the right of the page', feedback: 'Incorrect. Check the charge signs and force directions.' },
      { id: 'c', text: 'toward the top of the page', feedback: 'Incorrect. The geometry doesn\'t produce vertical net force.' },
      { id: 'd', text: 'toward the bottom of the page', feedback: 'Incorrect. Check the vector addition of individual forces.' }
    ],
    correctOptionId: 'a',
    explanation: 'Calculate individual forces using Coulomb\'s law, then determine the vector sum based on charge signs and positions.',
    difficulty: 'advanced',
    tags: ['electric-force', 'vector-addition', 'three-charges'],
    variant: 'A'
  },
  {
    questionText: "At point P, above sphere L, the direction of the net electric field is mostly:",
    image: `${ASSET_PATH}q14_setup_v2.png`,
    options: [
      { id: 'a', text: 'to the left of the page', feedback: 'Incorrect. Check the field contributions from all charges.' },
      { id: 'b', text: 'to the right of the page', feedback: 'Incorrect. Consider the field directions from each charge.' },
      { id: 'c', text: 'toward the top of the page', feedback: 'Incorrect. Review the vector addition of field contributions.' },
      { id: 'd', text: 'toward the bottom of the page', feedback: 'Correct! Net field points predominantly downward at point P.' }
    ],
    correctOptionId: 'd',
    explanation: 'Electric field vectors from each charge point away from positive charges and toward negative charges. Vector sum determines net direction.',
    difficulty: 'advanced',
    tags: ['electric-field', 'vector-addition', 'field-direction'],
    variant: 'B'
  },

  // Question 15 - Electric field strength calculation
  {
    questionText: "The electric field strength 4.00 cm from a 1.20 × 10⁻⁵ C charge is:",
    options: [
      { id: 'a', text: '6.74 × 10⁷ N/C', feedback: 'Correct! E = kq/r² = (9×10⁹)(1.20×10⁻⁵)/(0.04)²' },
      { id: 'b', text: '3.37 × 10⁷ N/C', feedback: 'Incorrect. Check your distance conversion and calculation.' },
      { id: 'c', text: '1.35 × 10⁸ N/C', feedback: 'Incorrect. Review the inverse square law application.' },
      { id: 'd', text: '2.70 × 10⁸ N/C', feedback: 'Incorrect. This may use wrong distance units.' }
    ],
    correctOptionId: 'a',
    explanation: 'E = kq/r² = (9.0×10⁹ N·m²/C²)(1.20×10⁻⁵ C)/(0.04 m)² = 6.74×10⁷ N/C.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'point-charge', 'field-calculation'],
    variant: 'A'
  },
  {
    questionText: "The electric field strength 8.00 cm from a 1.20 × 10⁻⁵ C charge is:",
    options: [
      { id: 'a', text: '1.69 × 10⁷ N/C', feedback: 'Correct! E = kq/r² = (9×10⁹)(1.20×10⁻⁵)/(0.08)²' },
      { id: 'b', text: '3.37 × 10⁷ N/C', feedback: 'Incorrect. This uses 4 cm distance instead of 8 cm.' },
      { id: 'c', text: '6.74 × 10⁷ N/C', feedback: 'Incorrect. Check your distance value in the calculation.' },
      { id: 'd', text: '1.35 × 10⁸ N/C', feedback: 'Incorrect. Review the distance squared in denominator.' }
    ],
    correctOptionId: 'a',
    explanation: 'E = kq/r² = (9.0×10⁹ N·m²/C²)(1.20×10⁻⁵ C)/(0.08 m)² = 1.69×10⁷ N/C.',
    difficulty: 'intermediate',
    tags: ['electric-field', 'point-charge', 'field-calculation'],
    variant: 'B'
  },

  // Question 16 - Oil drop suspension (Millikan experiment)
  {
    questionText: "An oil drop of mass 7.0 × 10⁻¹⁴ kg is suspended in a 2.20 × 10⁴ V/m field. What is the charge?",
    options: [
      { id: 'a', text: '2.9 × 10⁻¹⁸ C', feedback: 'Incorrect. Check your force balance calculation.' },
      { id: 'b', text: '3.2 × 10⁻¹⁹ C', feedback: 'Incorrect. Review the equilibrium condition.' },
      { id: 'c', text: '3.9 × 10⁻¹⁸ C', feedback: 'Correct! For equilibrium: qE = mg, so q = mg/E' },
      { id: 'd', text: '3.1 × 10⁻¹⁸ C', feedback: 'Incorrect. Check your calculation of q = mg/E.' }
    ],
    correctOptionId: 'c',
    explanation: 'For a suspended drop: qE = mg. Therefore q = mg/E = (7.0×10⁻¹⁴ kg)(9.81 m/s²)/(2.20×10⁴ V/m) = 3.1×10⁻¹⁸ C.',
    difficulty: 'intermediate',
    tags: ['millikan-experiment', 'force-balance', 'oil-drop'],
    variant: 'A'
  },
  {
    questionText: "An oil drop of mass 7.0 × 10⁻¹⁴ kg is suspended in a 2.20 × 10⁴ V/m field. If the field strength doubles but the mass is halved, what is the new charge needed to suspend the drop?",
    options: [
      { id: 'a', text: '1.95 × 10⁻¹⁸ C', feedback: 'Correct! New mass = 3.5×10⁻¹⁴ kg, new field = 4.4×10⁴ V/m' },
      { id: 'b', text: '2.80 × 10⁻¹⁸ C', feedback: 'Incorrect. Check how both mass and field changes affect the charge.' },
      { id: 'c', text: '3.90 × 10⁻¹⁸ C', feedback: 'Incorrect. This doesn\'t account for the field doubling.' },
      { id: 'd', text: '7.80 × 10⁻¹⁸ C', feedback: 'Incorrect. Review the relationship q = mg/E.' }
    ],
    correctOptionId: 'a',
    explanation: 'q = mg/E. New conditions: m\' = 3.5×10⁻¹⁴ kg, E\' = 4.4×10⁴ V/m. q = (3.5×10⁻¹⁴)(9.81)/(4.4×10⁴) = 1.55×10⁻¹⁸ C.',
    difficulty: 'advanced',
    tags: ['millikan-experiment', 'proportional-reasoning', 'variable-conditions'],
    variant: 'B'
  },

  // Question 17 - Number of excess electrons
  {
    questionText: "An oil drop of mass 6.6 × 10⁻¹⁴ kg is suspended in an electric field of 2.0 × 10⁶ N/C between horizontal plates that are 4.0 × 10⁻² m apart. The number of excess electrons on the oil drop is:",
    options: [
      { id: 'a', text: '1', feedback: 'Incorrect. Calculate the total charge first, then divide by elementary charge.' },
      { id: 'b', text: '2', feedback: 'Correct! q = mg/E, then n = q/e gives number of electrons' },
      { id: 'c', text: '5', feedback: 'Incorrect. Check your charge calculation.' },
      { id: 'd', text: '20', feedback: 'Incorrect. This is too many electrons for this mass and field.' }
    ],
    correctOptionId: 'b',
    explanation: 'First find total charge: q = mg/E = (6.6×10⁻¹⁴)(9.81)/(2.0×10⁶) = 3.24×10⁻¹⁹ C. Number of electrons: n = q/e = 3.24×10⁻¹⁹/1.6×10⁻¹⁹ ≈ 2.',
    difficulty: 'intermediate',
    tags: ['millikan-experiment', 'electron-count', 'elementary-charge'],
    variant: 'A'
  },
  {
    questionText: "An oil drop of mass 3.3 × 10⁻¹⁴ kg is suspended in an electric field of 2.0 × 10⁶ N/C between horizontal plates that are 4.0 × 10⁻² m apart. The number of excess electrons on the oil drop is:",
    options: [
      { id: 'a', text: '1', feedback: 'Correct! q = mg/E, then n = q/e gives 1 electron' },
      { id: 'b', text: '2', feedback: 'Incorrect. This mass requires fewer electrons for suspension.' },
      { id: 'c', text: '5', feedback: 'Incorrect. Check your charge and electron count calculation.' },
      { id: 'd', text: '20', feedback: 'Incorrect. This is far too many electrons.' }
    ],
    correctOptionId: 'a',
    explanation: 'q = mg/E = (3.3×10⁻¹⁴)(9.81)/(2.0×10⁶) = 1.62×10⁻¹⁹ C. Number of electrons: n = 1.62×10⁻¹⁹/1.6×10⁻¹⁹ ≈ 1.',
    difficulty: 'intermediate',
    tags: ['millikan-experiment', 'electron-count', 'elementary-charge'],
    variant: 'B'
  },

  // Question 18 - Solenoid magnetic field direction (IMAGE NEEDED)
  {
    questionText: "The magnetic field created inside the solenoid is directed:",
    image: `${ASSET_PATH}q18_setup_v1.png`,
    options: [
      { id: 'a', text: 'into the page', feedback: 'Incorrect. Use the right-hand rule for current direction.' },
      { id: 'b', text: 'out of the page', feedback: 'Incorrect. Check the current direction and hand rule application.' },
      { id: 'c', text: 'toward the left of the page', feedback: 'Incorrect. The field inside is axial, not radial.' },
      { id: 'd', text: 'toward the right of the page', feedback: 'Correct! Using right-hand rule for the shown current direction.' }
    ],
    correctOptionId: 'd',
    explanation: 'Using the right-hand rule: fingers curl in direction of current, thumb points in direction of magnetic field inside the solenoid.',
    difficulty: 'intermediate',
    tags: ['solenoid', 'magnetic-field', 'right-hand-rule'],
    variant: 'A'
  },
  {
    questionText: "The magnetic field created inside the solenoid is directed:",
    image: `${ASSET_PATH}q18_setup_v2.png`,
    options: [
      { id: 'a', text: 'into the page', feedback: 'Correct! Using right-hand rule for the current direction shown.' },
      { id: 'b', text: 'out of the page', feedback: 'Incorrect. Check the current direction in the diagram.' },
      { id: 'c', text: 'toward the left of the page', feedback: 'Incorrect. The field is axial, not perpendicular to the axis.' },
      { id: 'd', text: 'toward the right of the page', feedback: 'Incorrect. Use the right-hand rule correctly.' }
    ],
    correctOptionId: 'a',
    explanation: 'For this current direction, the right-hand rule indicates the magnetic field inside the solenoid points into the page.',
    difficulty: 'intermediate',
    tags: ['solenoid', 'magnetic-field', 'right-hand-rule'],
    variant: 'B'
  },

  // Question 19 - Magnetic force on current-carrying wire
  {
    questionText: "A current-carrying wire is placed in an external magnetic field. The magnetic field strength is 5.00 × 10⁻² T. When the current in the wire is 1.25 A, the wire experiences a magnetic force of 3.90 × 10⁻³ N. The length of the wire that is inside of and perpendicular to the magnetic field is:",
    options: [
      { id: 'a', text: '6.24 × 10⁻² m', feedback: 'Correct! Using F = BIL: L = F/(BI) = 3.90×10⁻³/(5.00×10⁻²×1.25)' },
      { id: 'b', text: '3.12 × 10⁻² m', feedback: 'Incorrect. Check your calculation of L = F/(BI).' },
      { id: 'c', text: '1.25 × 10⁻¹ m', feedback: 'Incorrect. Review the magnetic force formula.' },
      { id: 'd', text: '2.44 × 10⁻¹ m', feedback: 'Incorrect. This uses incorrect values in the calculation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using F = BIL for perpendicular wire: L = F/(BI) = (3.90×10⁻³ N)/[(5.00×10⁻² T)(1.25 A)] = 6.24×10⁻² m.',
    difficulty: 'intermediate',
    tags: ['magnetic-force', 'current-wire', 'force-calculation'],
    variant: 'A'
  },
  {
    questionText: "A current-carrying conductor that is 4.00 × 10⁻² m long is placed perpendicular to a magnetic field that has a strength of 6.00 × 10⁻² T. During a 20.0 s time interval, 7.00 × 10¹⁹ electrons pass a point in the conductor. The magnitude of the average magnetic force exerted on the conductor is:",
    options: [
      { id: 'a', text: '2.69 × 10⁻³ N', feedback: 'Incorrect. Check your current calculation from electron flow.' },
      { id: 'b', text: '3.14 × 10⁻³ N', feedback: 'Correct! I = nq/t, then F = BIL' },
      { id: 'c', text: '4.48 × 10⁻³ N', feedback: 'Incorrect. Verify your use of F = BIL.' },
      { id: 'd', text: '2.69 × 10⁻⁴ N', feedback: 'Incorrect. Review the relationship between electron flow and current.' }
    ],
    correctOptionId: 'b',
    explanation: 'Current: I = nq/t = (7.00×10¹⁹)(1.6×10⁻¹⁹)/20.0 = 0.56 A. Force: F = BIL = (6.00×10⁻²)(0.56)(4.00×10⁻²) = 1.34×10⁻³ N.',
    difficulty: 'advanced',
    tags: ['magnetic-force', 'electron-flow', 'current-calculation'],
    variant: 'B'
  },

  // Question 20 - Magnetic field diagrams (SWAPPED VERSIONS - V2 has IMAGE OPTIONS)
  {
    questionText: "When the magnet is moved as illustrated above, then the direction of the motion of the positively charged sphere is:",
    image: `${ASSET_PATH}q20_setup_v1.png`,
    options: [
      { id: 'a', text: 'into the page', feedback: 'Incorrect. Consider the direction of the induced electric field.' },
      { id: 'b', text: 'toward Plate I', feedback: 'Incorrect. Check the direction of the changing magnetic field.' },
      { id: 'c', text: 'toward Plate II', feedback: 'Correct! Moving magnet induces electric field that accelerates positive charge toward Plate II.' },
      { id: 'd', text: 'out of the page', feedback: 'Incorrect. The motion is in the plane of the plates.' }
    ],
    correctOptionId: 'c',
    explanation: 'The changing magnetic field induces an electric field (Faraday\'s law). The positive charge experiences force in direction of induced E-field.',
    difficulty: 'advanced',
    tags: ['magnet-motion-induction', 'induced-electric-field', 'charged-particle'],
    variant: 'A'
  },
  {
    questionText: "Which of the following diagrams, drawn to the same scale as Diagram I above, represents the net magnetic field strength at point P in Diagram II?",
    image: `${ASSET_PATH}q20_setup_v2.png`,
    options: [
      { 
        id: 'a', 
        text: `![Option A](${ASSET_PATH}q20_option_a_v2.png)`, 
        feedback: 'Incorrect. This doesn\'t represent the correct superposition of fields.' 
      },
      { 
        id: 'b', 
        text: `![Option B](${ASSET_PATH}q20_option_b_v2.png)`, 
        feedback: 'Incorrect. Check the vector addition of magnetic fields.' 
      },
      { 
        id: 'c', 
        text: `![Option C](${ASSET_PATH}q20_option_c_v2.png)`, 
        feedback: 'Incorrect. The field strength and direction are not correct.' 
      },
      { 
        id: 'd', 
        text: `![Option D](${ASSET_PATH}q20_option_d_v2.png)`, 
        feedback: 'Correct! This represents the correct net magnetic field at point P.' 
      }
    ],
    correctOptionId: 'd',
    explanation: 'The net magnetic field is the vector sum of individual field contributions from each current-carrying element, following superposition principle.',
    difficulty: 'advanced',
    tags: ['magnetic-field', 'superposition', 'field-diagrams'],
    variant: 'B'
  },

  // Question 21 - Direction matching (IMAGE OPTIONS FOR V1)
  {
    questionText: "Match the numbers on the directions given above with the descriptions given below. Direction of the electric force on the ion: _____, Direction of the electric field in the region: _____, Direction of the magnetic force on the ion: _____, Direction of the magnetic field in the region: _____",
    image: `${ASSET_PATH}q21_setup_v1.png`,
    options: [
      { 
        id: 'a', 
        text: `![Answer A](${ASSET_PATH}q21_option_a_v1.png)`, 
        feedback: 'Incorrect. Check the force directions using right-hand rules.' 
      },
      { 
        id: 'b', 
        text: `![Answer B](${ASSET_PATH}q21_option_b_v1.png)`, 
        feedback: 'Incorrect. Review the relationship between field and force directions.' 
      },
      { 
        id: 'c', 
        text: `![Answer C](${ASSET_PATH}q21_option_c_v1.png)`, 
        feedback: 'Incorrect. The magnetic force direction is not correct.' 
      },
      { 
        id: 'd', 
        text: `![Answer D: 5560](${ASSET_PATH}q21_option_d_v1.png)`, 
        feedback: 'Correct! Electric force: 5, Electric field: 5, Magnetic force: 6, Magnetic field: 0 (into page)' 
      }
    ],
    correctOptionId: 'd',
    explanation: 'Use F = qE for electric force direction and F = qv×B for magnetic force direction. Field directions follow conventional definitions.',
    difficulty: 'advanced',
    tags: ['force-directions', 'field-directions', 'velocity-selector'],
    variant: 'A'
  },
  {
    questionText: "Match the numbers on the directions given above with the descriptions given below. Direction of the electric force on the ion: _____, Direction of the electric field in the region: _____, Direction of the magnetic force on the ion: _____, Direction of the magnetic field in the region: _____",
    image: `${ASSET_PATH}q21_setup_v2.png`,
    options: [
      { id: 'a', text: '3, 3, 8, 0 (into page)', feedback: 'Incorrect. Check the force directions for this configuration.' },
      { id: 'b', text: '7, 7, 2, 0 (into page)', feedback: 'Incorrect. Review the relationship between field and force directions.' },
      { id: 'c', text: '1, 1, 4, 0 (out of page)', feedback: 'Incorrect. Review the magnetic field direction.' },
      { id: 'd', text: '5, 5, 6, 0 (into page)', feedback: 'Correct! Electric force: 5, Electric field: 5, Magnetic force: 6, Magnetic field: 0' }
    ],
    correctOptionId: 'd',
    explanation: 'For this configuration, apply the same principles: F = qE and F = qv×B to determine all force and field directions.',
    difficulty: 'advanced',
    tags: ['force-directions', 'field-directions', 'velocity-selector'],
    variant: 'B'
  },

  // Question 22 - Velocity selector
  {
    questionText: "Ions move at 3.50 × 10⁷ m/s undeflected in a 0.500 T magnetic field. What is the electric field strength?",
    options: [
      { id: 'a', text: '1.75 × 10⁷ N/C', feedback: 'Correct! For undeflected motion: E = vB = (3.50×10⁷)(0.500)' },
      { id: 'b', text: '2.25 × 10⁷ N/C', feedback: 'Incorrect. Check the velocity selector condition E = vB.' },
      { id: 'c', text: '1.00 × 10⁷ N/C', feedback: 'Incorrect. This doesn\'t satisfy the balance condition.' },
      { id: 'd', text: '2.00 × 10⁷ N/C', feedback: 'Incorrect. Review the relationship for crossed fields.' }
    ],
    correctOptionId: 'a',
    explanation: 'For undeflected motion in crossed E and B fields: qE = qvB, so E = vB = (3.50×10⁷ m/s)(0.500 T) = 1.75×10⁷ N/C.',
    difficulty: 'intermediate',
    tags: ['velocity-selector', 'crossed-fields', 'undeflected-motion'],
    variant: 'A'
  },
  {
    questionText: "In a 0.250 T magnetic field, ions are undeflected by a 7000 V/m electric field. What is their speed?",
    options: [
      { id: 'a', text: '2.80 × 10⁴ m/s', feedback: 'Incorrect. Check your powers of 10.' },
      { id: 'b', text: '4.60 × 10⁴ m/s', feedback: 'Incorrect. Check your division: v = E/B.' },
      { id: 'c', text: '6.00 × 10⁴ m/s', feedback: 'Incorrect. This doesn\'t satisfy E = vB.' },
      { id: 'd', text: '2.80 × 10⁵ m/s', feedback: 'Correct! v = E/B = 7000/0.250 = 2.80×10⁴ m/s' }
    ],
    correctOptionId: 'd',
    explanation: 'For undeflected motion: E = vB, so v = E/B = (7000 V/m)/(0.250 T) = 2.80×10⁴ m/s.',
    difficulty: 'intermediate',
    tags: ['velocity-selector', 'crossed-fields', 'speed-calculation'],
    variant: 'B'
  },

  // Question 23 - Circular path radius in magnetic field
  {
    questionText: "A 1.00 × 10⁶ m/s carbon-14 ion enters a 0.900 T field. What is its circular path radius?",
    options: [
      { id: 'a', text: '12.5 cm', feedback: 'Incorrect. Check your mass and charge values for carbon-14.' },
      { id: 'b', text: '14.8 cm', feedback: 'Incorrect. Review the cyclotron radius formula r = mv/(qB).' },
      { id: 'c', text: '16.2 cm', feedback: 'Correct! r = mv/(qB) using carbon-14 mass and charge' },
      { id: 'd', text: '18.3 cm', feedback: 'Incorrect. This may use incorrect ion properties.' }
    ],
    correctOptionId: 'c',
    explanation: 'Cyclotron radius: r = mv/(qB). For carbon-14 ion: m = 14u = 2.33×10⁻²⁶ kg, q = e = 1.6×10⁻¹⁹ C.',
    difficulty: 'advanced',
    tags: ['cyclotron-radius', 'magnetic-field', 'circular-motion'],
    variant: 'A'
  },
  {
    questionText: "The same ion enters a 0.450 T field. What is the new radius?",
    options: [
      { id: 'a', text: '8.1 cm', feedback: 'Correct! Radius is inversely proportional to B: r₂ = r₁(B₁/B₂) = 16.2(0.450/0.900)' },
      { id: 'b', text: '10.5 cm', feedback: 'Incorrect. Check the inverse relationship between radius and field.' },
      { id: 'c', text: '12.1 cm', feedback: 'Incorrect. This doesn\'t follow r ∝ 1/B.' },
      { id: 'd', text: '14.3 cm', feedback: 'Incorrect. Field strength increased, so radius should decrease.' }
    ],
    correctOptionId: 'a',
    explanation: 'Since r ∝ 1/B, when field doubles, radius halves: r = 16.2 cm × (0.450/0.900) = 8.1 cm.',
    difficulty: 'advanced',
    tags: ['cyclotron-radius', 'proportional-reasoning', 'field-dependence'],
    variant: 'B'
  }
];

// Written Response Question 1 (4 points)
const writtenResponse1Config = {
  type: 'long-answer',
  requiresManualGrading: true,
  questions: [
    {
      // Version A
      questionText: `**WR1A:** Determine the magnitude of the electric force acting on an alpha particle. 

Describe two of the physics principles (numbered on the data sheet) that must be used to determine the magnitude of the electric force acting on the alpha particle.`,
      image: `${ASSET_PATH}q24_setup_v1.png`,
      rubric: [
        { criterion: "Force Calculation Setup", points: 1, description: "Correctly identifies the relevant formula and variables" },
        { criterion: "Numerical Calculation", points: 2, description: "Accurately calculates the electric force magnitude" },
        { criterion: "Physics Principles", points: 1, description: "Correctly identifies two required physics principles from data sheet" }
      ],
      maxPoints: 4,
      wordLimit: { min: 50, max: 300 },
      sampleAnswer: `**Force Calculation:**
Using F = qE, where q = 3.2 × 10⁻¹⁹ C (alpha particle charge) and E = given field strength.
F = 2.1 × 10⁻¹⁷ N

**Physics Principles Required:**
1. Coulomb's Law
2. Electric field definition (F = qE)`,
      difficulty: "intermediate",
      topic: "Electric Forces and Fields",
      tags: ["electric-force", "alpha-particle", "field-calculations"],
      variant: 'A'
    },
    {
      // Version B  
      questionText: `**WR1B:** Determine the magnitude of the electric force acting on an electron. 

Describe two of the physics principles (numbered on the data sheet) that must be used to determine the magnitude of the electric force acting on the electron particle.`,
      image: `${ASSET_PATH}q24_setup_v2.png`,
      rubric: [
        { criterion: "Force Calculation Setup", points: 1, description: "Correctly identifies the relevant formula and variables" },
        { criterion: "Numerical Calculation", points: 2, description: "Accurately calculates the electric force magnitude" },
        { criterion: "Physics Principles", points: 1, description: "Correctly identifies two required physics principles from data sheet" }
      ],
      maxPoints: 4,
      wordLimit: { min: 50, max: 300 },
      sampleAnswer: `**Force Calculation:**
Using F = qE, where q = 1.6 × 10⁻¹⁹ C (electron charge magnitude) and E = given field strength.
F = 2.1 × 10⁻¹⁷ N

**Physics Principles Required:**
1. Coulomb's Law  
2. Electric field definition (F = qE)`,
      difficulty: "intermediate",
      topic: "Electric Forces and Fields",
      tags: ["electric-force", "electron", "field-calculations"],
      variant: 'B'
    }
  ],
  activityType: "exam",
  maxAttempts: 1,
  showRubric: false,
  showWordCount: true,
  theme: "red",
  randomizeQuestions: false
};

// Written Response Question 2 (5 points)
const writtenResponse2Config = {
  type: 'long-answer',
  requiresManualGrading: true,
  questions: [
    {
      // Version A
      questionText: `**WR2A:** You are provided with an apparatus consisting of a C-shaped magnet, a straight wire, a power supply, and a force sensor. Several variables can be changed during the investigation to examine factors affecting the magnetic force on a current-carrying wire.

**Research Questions (Choose ONE):**
• Does the length of the wire in the magnetic field affect the magnetic force?
• Does the magnitude of the current in the wire affect the magnetic force?
• Does the strength of the magnetic field produced by the C-shaped magnet affect the magnetic force?
• Does the direction of the electron flow affect the magnetic force?
• Does the orientation of the wire relative to the external magnetic field affect the magnetic force?

**Variables:**
(6) Force on the wire
(7) Length of wire
(8) Strength of the C-shaped magnet
(9) Current in the wire

**Instructions:**
Choose one research question from the list above to investigate.

Identify and match three of the variables to the following roles in your investigation:
• Manipulated Variable
• Responding Variable
• Controlled Variable

Explain the reasoning for your choices using relevant physics principles.`,
      rubric: [
        { criterion: "Research Question Selection", points: 1, description: "Selects an appropriate and feasible research question" },
        { criterion: "Variable Classification", points: 2, description: "Correctly identifies dependent, independent, and controlled variables" },
        { criterion: "Physics Explanation", points: 2, description: "Explains the relationship using magnetic force principles (F = BIL)" }
      ],
      maxPoints: 5,
      wordLimit: { min: 75, max: 400 },
      sampleAnswer: `**Selected Research Question:** Question 2 - Does the magnitude of the current affect the magnetic force?

**Variable Roles:**
- **Independent Variable:** 9 (Current in wire) - This is what we change
- **Dependent Variable:** 6 (Force on wire) - This is what we measure
- **Controlled Variables:** 7 (Length of wire), 8 (Strength of magnet) - These remain constant

**Physics Explanation:**
According to the magnetic force law F = BIL, the force on a current-carrying wire is directly proportional to the current (I). By varying only the current while keeping the magnetic field strength (B) and wire length (L) constant, we can demonstrate this direct relationship experimentally.`,
      difficulty: "advanced",
      topic: "Magnetic Forces and Experimental Design",
      tags: ["magnetic-force", "experimental-design", "variables"],
      variant: 'A',
      image: `${ASSET_PATH}q25_setup_v1.png`
    },
    {
      // Version B
      questionText: `**WR2B:** 

**Part A:**
Complete the following statement:
When it touches the generator, the metal sphere becomes ___ due to the transfer of ___.

Use your understanding of electrostatics to choose appropriate terms and explain your reasoning.

**Part B:**
Determine the magnitude of the electric force acting in the situation.
Show your work and explain any formulas or reasoning used in your calculation.`,
      rubric: [
        { criterion: "Charging Process Understanding", points: 1, description: "Correctly identifies the charging mechanism" },
        { criterion: "Charge Transfer Identification", points: 1, description: "Correctly identifies what particles transfer during charging" },
        { criterion: "Force Calculation", points: 2, description: "Accurately calculates or verifies the electric force magnitude" },
        { criterion: "Scientific Explanation", points: 1, description: "Explains the process using electrostatic principles" }
      ],
      maxPoints: 5,
      wordLimit: { min: 75, max: 400 },
      sampleAnswer: `**Charging Analysis:**
**Answer: C** - positively charged / electrons

When the metal sphere touches the generator, electrons transfer from the sphere to the generator, leaving the sphere with a deficit of electrons (positive charge).

**Force Calculation:**
Using F = kq₁q₂/r², the electric force magnitude is 4.17 × 10⁻⁵ N.

**Explanation:**
During charging by conduction, mobile electrons move from the sphere to the generator due to electric field differences. The sphere becomes positively charged because it loses electrons, not because it gains protons (which are immobile in the nucleus).`,
      difficulty: "advanced", 
      topic: "Electrostatic Charging and Forces",
      tags: ["electrostatic-charging", "conduction", "force-calculation"],
      variant: 'B',
      image: `${ASSET_PATH}q25_setup_v2.png`
    }
  ],
  activityType: "exam",
  maxAttempts: 1,
  showRubric: false,
  showWordCount: true,
  theme: "red",
  randomizeQuestions: false
};

// Assessment configurations for the master function
const assessmentConfigs = {
  // Multiple Choice Questions (1-23) - Initial 3 questions implemented
  'course2_48_section2_exam_q1': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('free-body-diagrams')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q2': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('force-scaling')),
    randomizeOptions: true,
    activityType: 'exam', 
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q3': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('charging-by-conduction')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2, 
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },

  // Questions 4-23 configurations
  'course2_48_section2_exam_q4': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('work-energy')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q5': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('energy-conservation')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q6': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('acceleration')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q7': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('superposition')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q8': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('inverse-square-law')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q9': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('potential-difference')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q10': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('parallel-motion') || q.tags && q.tags.includes('perpendicular-motion')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q11': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('electric-force') && q.tags && q.tags.includes('parallel-plates')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q12': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('charged-particle') && q.tags && q.tags.includes('circular-motion')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q13': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('ring-magnet-induction')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q14': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('three-charges') || q.tags && q.tags.includes('field-direction')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q15': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('field-calculation')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q16': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('millikan-experiment')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q17': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('electron-count')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q18': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('solenoid')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q19': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('current-wire') || q.tags && q.tags.includes('electron-flow')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q20': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('magnet-motion-induction') || q.tags && q.tags.includes('field-diagrams')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q21': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('velocity-selector')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q22': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('crossed-fields')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },
  'course2_48_section2_exam_q23': {
    questions: multipleChoiceQuestions.filter(q => q.tags && q.tags.includes('cyclotron-radius')),
    randomizeOptions: true,
    activityType: 'exam',
    maxAttempts: 2,
    pointsValue: 1,
    showFeedback: false,
    attemptBasedSelection: true
  },

  // Written Response Questions (24-25)
  'course2_48_section2_exam_q24': writtenResponse1Config,
  'course2_48_section2_exam_q25': writtenResponse2Config
};

exports.assessmentConfigs = assessmentConfigs;