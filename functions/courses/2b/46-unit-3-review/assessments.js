/**
 * Assessment Functions for Unit 3 Review - Electricity and Electric Fields
 * Course: 2 (Physics 30)
 * Content: 46-unit-3-review
 * 
 * This module provides individual standard multiple choice assessments for the
 * slideshow knowledge check frontend component covering:
 * - Lesson 25: Electrostatics
 * - Lesson 26: Coulomb's Law  
 * - Lesson 29: Electric Fields
 * - Lesson 30: Electric Potential
 * - Lesson 31: Parallel Plates
 * - Lesson 32: Electric Current
 */

// Removed dependency on config file - settings are now handled directly in assessment configurations

// ===== UNIT 3 REVIEW QUESTIONS =====

// Assessment configurations for the master function
const assessmentConfigs = {
  
  // ===== ELECTROSTATICS QUESTIONS =====
  'course2_46_unit3_q1': {
    questions: [{
      questionText: "Which of the following methods can be used to charge an object?",
      options: [
        { id: 'a', text: 'Friction only', feedback: 'Incorrect. There are multiple methods to charge objects.' },
        { id: 'b', text: 'Conduction only', feedback: 'Incorrect. There are multiple methods to charge objects.' },
        { id: 'c', text: 'Friction, conduction, and induction', feedback: 'Correct! All three methods can transfer or separate charge: friction transfers electrons, conduction involves direct contact, and induction separates charges without contact.' },
        { id: 'd', text: 'Induction only', feedback: 'Incorrect. There are multiple methods to charge objects.' }
      ],
      correctOptionId: 'c',
      explanation: 'Objects can be charged by three methods: friction (electron transfer through rubbing), conduction (direct contact with charged object), and induction (charge separation without contact).',
      difficulty: 'beginner',
      tags: ['electrostatics', 'charging-methods']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q2': {
    questions: [{
      questionText: "What happens when a glass rod is rubbed with silk?",
      options: [
        { id: 'a', text: 'The glass rod gains electrons and becomes negative', feedback: 'Incorrect. Glass loses electrons when rubbed with silk.' },
        { id: 'b', text: 'The glass rod loses electrons and becomes positive', feedback: 'Correct! When glass is rubbed with silk, electrons transfer from the glass to the silk, leaving the glass with a positive charge.' },
        { id: 'c', text: 'Both objects remain neutral', feedback: 'Incorrect. Friction causes electron transfer between materials.' },
        { id: 'd', text: 'The silk becomes positive', feedback: 'Incorrect. The silk gains electrons and becomes negative.' }
      ],
      correctOptionId: 'b',
      explanation: 'When glass is rubbed with silk, electrons transfer from the glass to the silk. The glass loses electrons and becomes positively charged, while the silk gains electrons and becomes negatively charged.',
      difficulty: 'beginner',
      tags: ['electrostatics', 'friction-charging']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== COULOMB'S LAW QUESTIONS =====
  'course2_46_unit3_q3': {
    questions: [{
      questionText: "Two point charges of +3.0 μC and +4.0 μC are separated by a distance of 0.50 m. What is the magnitude of the electric force between them? (k = 8.99 × 10⁹ N⋅m²/C²)",
      options: [
        { id: 'a', text: '0.43 N', feedback: 'Correct! F = k(q₁q₂)/r² = (8.99×10⁹)(3.0×10⁻⁶)(4.0×10⁻⁶)/(0.50)² = 0.43 N' },
        { id: 'b', text: '0.86 N', feedback: 'Incorrect. Check your calculation of the distance squared.' },
        { id: 'c', text: '1.72 N', feedback: 'Incorrect. Make sure you square the distance in the denominator.' },
        { id: 'd', text: '0.22 N', feedback: 'Incorrect. Check your unit conversions for the charges.' }
      ],
      correctOptionId: 'a',
      explanation: 'Using Coulombs Law: F = k(q₁q₂)/r² = (8.99×10⁹)(3.0×10⁻⁶)(4.0×10⁻⁶)/(0.50)² = 0.43 N. The force is repulsive since both charges are positive.',
      difficulty: 'intermediate',
      tags: ['coulombs-law', 'force-calculation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q4': {
    questions: [{
      questionText: "If the distance between two point charges is doubled, how does the electric force between them change?",
      options: [
        { id: 'a', text: 'The force doubles', feedback: 'Incorrect. Consider the inverse square relationship in Coulombs Law.' },
        { id: 'b', text: 'The force is halved', feedback: 'Incorrect. The relationship involves the square of the distance.' },
        { id: 'c', text: 'The force becomes one-fourth as strong', feedback: 'Correct! Since F ∝ 1/r², doubling the distance (r → 2r) makes the force (1/2r)² = 1/4 times as strong.' },
        { id: 'd', text: 'The force becomes four times stronger', feedback: 'Incorrect. This would be the case if force were proportional to r².' }
      ],
      correctOptionId: 'c',
      explanation: 'Coulombs Law shows that force is inversely proportional to the square of distance (F ∝ 1/r²). When distance doubles, the force becomes (1/2)² = 1/4 times as strong.',
      difficulty: 'intermediate',
      tags: ['coulombs-law', 'inverse-square-law']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== ELECTRIC FIELD QUESTIONS =====
  'course2_46_unit3_q5': {
    questions: [{
      questionText: "What is the electric field strength at a distance of 2.0 m from a +5.0 μC point charge? (k = 8.99 × 10⁹ N⋅m²/C²)",
      options: [
        { id: 'a', text: '1.1 × 10⁴ N/C', feedback: 'Correct! E = kq/r² = (8.99×10⁹)(5.0×10⁻⁶)/(2.0)² = 1.1 × 10⁴ N/C' },
        { id: 'b', text: '2.2 × 10⁴ N/C', feedback: 'Incorrect. Check your calculation of the distance squared.' },
        { id: 'c', text: '4.5 × 10⁴ N/C', feedback: 'Incorrect. Make sure you square the distance in the denominator.' },
        { id: 'd', text: '5.6 × 10³ N/C', feedback: 'Incorrect. Check your arithmetic in the calculation.' }
      ],
      correctOptionId: 'a',
      explanation: 'Electric field strength: E = kq/r² = (8.99×10⁹)(5.0×10⁻⁶)/(2.0)² = 44,950/4.0 = 1.1 × 10⁴ N/C',
      difficulty: 'intermediate',
      tags: ['electric-field', 'point-charge']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q6': {
    questions: [{
      questionText: "Which statement about electric field lines is correct?",
      options: [
        { id: 'a', text: 'Field lines can cross each other', feedback: 'Incorrect. Electric field lines never cross each other.' },
        { id: 'b', text: 'Field lines start on negative charges', feedback: 'Incorrect. Field lines start on positive charges and end on negative charges.' },
        { id: 'c', text: 'The density of field lines indicates field strength', feedback: 'Correct! Where field lines are closer together, the electric field is stronger. The density of lines represents field magnitude.' },
        { id: 'd', text: 'Field lines are parallel to conductor surfaces', feedback: 'Incorrect. Field lines are always perpendicular to conductor surfaces.' }
      ],
      correctOptionId: 'c',
      explanation: 'Electric field lines have specific properties: they start on positive charges, end on negative charges, never cross, are perpendicular to conductor surfaces, and their density indicates field strength.',
      difficulty: 'intermediate',
      tags: ['electric-field', 'field-lines']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== ELECTRIC POTENTIAL QUESTIONS =====
  'course2_46_unit3_q7': {
    questions: [{
      questionText: "What is the electric potential at a distance of 1.5 m from a +2.0 μC point charge? (k = 8.99 × 10⁹ N⋅m²/C²)",
      options: [
        { id: 'a', text: '6.0 × 10³ V', feedback: 'Incorrect. Check your calculation using V = kq/r.' },
        { id: 'b', text: '1.2 × 10⁴ V', feedback: 'Correct! V = kq/r = (8.99×10⁹)(2.0×10⁻⁶)/(1.5) = 1.2 × 10⁴ V' },
        { id: 'c', text: '2.4 × 10⁴ V', feedback: 'Incorrect. Make sure you are not squaring the distance.' },
        { id: 'd', text: '8.0 × 10³ V', feedback: 'Incorrect. Check your unit conversions and arithmetic.' }
      ],
      correctOptionId: 'b',
      explanation: 'Electric potential: V = kq/r = (8.99×10⁹)(2.0×10⁻⁶)/(1.5) = 17,980/1.5 = 1.2 × 10⁴ V',
      difficulty: 'intermediate',
      tags: ['electric-potential', 'point-charge']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q8': {
    questions: [{
      questionText: "How much work is required to move a +3.0 μC charge from a point where the potential is 100 V to a point where the potential is 300 V?",
      options: [
        { id: 'a', text: '3.0 × 10⁻⁴ J', feedback: 'Incorrect. Check your unit conversion for the charge.' },
        { id: 'b', text: '6.0 × 10⁻⁴ J', feedback: 'Correct! Work = qΔV = (3.0×10⁻⁶)(300 - 100) = (3.0×10⁻⁶)(200) = 6.0×10⁻⁴ J' },
        { id: 'c', text: '9.0 × 10⁻⁴ J', feedback: 'Incorrect. Make sure you calculate the potential difference correctly.' },
        { id: 'd', text: '1.2 × 10⁻³ J', feedback: 'Incorrect. Check your calculation of qΔV.' }
      ],
      correctOptionId: 'b',
      explanation: 'Work done moving a charge: W = qΔV = q(Vf - Vi) = (3.0×10⁻⁶)(300 - 100) = (3.0×10⁻⁶)(200) = 6.0×10⁻⁴ J',
      difficulty: 'intermediate',
      tags: ['electric-potential', 'work', 'potential-difference']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== PARALLEL PLATES QUESTIONS =====
  'course2_46_unit3_q9': {
    questions: [{
      questionText: "A parallel plate capacitor has plates separated by 2.0 mm with a potential difference of 12 V. What is the electric field strength between the plates?",
      options: [
        { id: 'a', text: '3.0 × 10³ N/C', feedback: 'Incorrect. Check your unit conversion from mm to m.' },
        { id: 'b', text: '6.0 × 10³ N/C', feedback: 'Correct! E = V/d = 12 V / (2.0×10⁻³ m) = 6.0×10³ N/C' },
        { id: 'c', text: '2.4 × 10⁴ N/C', feedback: 'Incorrect. Make sure you convert mm to m correctly.' },
        { id: 'd', text: '1.2 × 10⁴ N/C', feedback: 'Incorrect. Check your distance conversion and calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'For uniform field between parallel plates: E = V/d = 12 V / (2.0×10⁻³ m) = 6.0×10³ N/C',
      difficulty: 'intermediate',
      tags: ['parallel-plates', 'uniform-field']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q10': {
    questions: [{
      questionText: "A parallel plate capacitor has a capacitance of 2.0 μF and is connected to a 9.0 V battery. How much charge is stored on the capacitor?",
      options: [
        { id: 'a', text: '4.5 μC', feedback: 'Incorrect. Check your use of the capacitance formula.' },
        { id: 'b', text: '9.0 μC', feedback: 'Incorrect. Make sure you multiply C and V correctly.' },
        { id: 'c', text: '18 μC', feedback: 'Correct! Q = CV = (2.0×10⁻⁶ F)(9.0 V) = 1.8×10⁻⁵ C = 18 μC' },
        { id: 'd', text: '36 μC', feedback: 'Incorrect. Check your arithmetic in the multiplication.' }
      ],
      correctOptionId: 'c',
      explanation: 'Charge stored on capacitor: Q = CV = (2.0×10⁻⁶ F)(9.0 V) = 1.8×10⁻⁵ C = 18 μC',
      difficulty: 'intermediate',
      tags: ['capacitance', 'charge-storage']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== ELECTRIC CURRENT QUESTIONS =====
  'course2_46_unit3_q11': {
    questions: [{
      questionText: "If 240 C of charge flows through a wire in 2.0 minutes, what is the current in the wire?",
      options: [
        { id: 'a', text: '1.0 A', feedback: 'Incorrect. Check your time conversion from minutes to seconds.' },
        { id: 'b', text: '2.0 A', feedback: 'Correct! I = Q/t = 240 C / (2.0 min × 60 s/min) = 240 C / 120 s = 2.0 A' },
        { id: 'c', text: '4.0 A', feedback: 'Incorrect. Make sure you convert minutes to seconds.' },
        { id: 'd', text: '120 A', feedback: 'Incorrect. You need to convert time to seconds before dividing.' }
      ],
      correctOptionId: 'b',
      explanation: 'Current I = Q/t = 240 C / (2.0 min × 60 s/min) = 240 C / 120 s = 2.0 A',
      difficulty: 'intermediate',
      tags: ['electric-current', 'charge-flow']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q12': {
    questions: [{
      questionText: "A 12 V battery is connected to a 4.0 Ω resistor. What is the current through the resistor?",
      options: [
        { id: 'a', text: '1.5 A', feedback: 'Incorrect. Check your application of Ohms Law.' },
        { id: 'b', text: '3.0 A', feedback: 'Correct! Using Ohms Law: I = V/R = 12 V / 4.0 Ω = 3.0 A' },
        { id: 'c', text: '6.0 A', feedback: 'Incorrect. Make sure you divide voltage by resistance.' },
        { id: 'd', text: '48 A', feedback: 'Incorrect. You multiplied instead of dividing.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using Ohms Law: I = V/R = 12 V / 4.0 Ω = 3.0 A',
      difficulty: 'beginner',
      tags: ['ohms-law', 'current', 'resistance']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== CONCEPTUAL INTEGRATION QUESTIONS =====
  'course2_46_unit3_q13': {
    questions: [{
      questionText: "Which quantity is a scalar (has magnitude but no direction)?",
      options: [
        { id: 'a', text: 'Electric field', feedback: 'Incorrect. Electric field is a vector quantity with both magnitude and direction.' },
        { id: 'b', text: 'Electric force', feedback: 'Incorrect. Electric force is a vector quantity with both magnitude and direction.' },
        { id: 'c', text: 'Electric potential', feedback: 'Correct! Electric potential (voltage) is a scalar quantity - it has magnitude but no direction.' },
        { id: 'd', text: 'Electric field lines', feedback: 'Incorrect. Field lines represent vectors and have direction.' }
      ],
      correctOptionId: 'c',
      explanation: 'Electric potential (voltage) is a scalar quantity with only magnitude. Electric field and force are vectors with both magnitude and direction.',
      difficulty: 'intermediate',
      tags: ['scalar-vector', 'electric-potential', 'conceptual']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q14': {
    questions: [{
      questionText: "An electron is placed in a uniform electric field. In which direction will it accelerate?",
      options: [
        { id: 'a', text: 'In the same direction as the electric field', feedback: 'Incorrect. The electron has negative charge and will move opposite to the field direction.' },
        { id: 'b', text: 'Opposite to the direction of the electric field', feedback: 'Correct! Since the electron has negative charge, the force F = qE points opposite to the electric field direction.' },
        { id: 'c', text: 'Perpendicular to the electric field', feedback: 'Incorrect. The force on a charge is parallel (or anti-parallel) to the electric field.' },
        { id: 'd', text: 'The electron will not accelerate', feedback: 'Incorrect. A charged particle in an electric field experiences a force and accelerates.' }
      ],
      correctOptionId: 'b',
      explanation: 'The force on a charge is F = qE. Since the electron has negative charge (q < 0), the force is opposite to the electric field direction.',
      difficulty: 'intermediate',
      tags: ['electric-field', 'force', 'electron-motion']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_46_unit3_q15': {
    questions: [{
      questionText: "What happens to the capacitance of a parallel plate capacitor if the plate separation is doubled while keeping everything else constant?",
      options: [
        { id: 'a', text: 'Capacitance doubles', feedback: 'Incorrect. Consider the relationship C = ε₀A/d.' },
        { id: 'b', text: 'Capacitance is halved', feedback: 'Correct! Since C = ε₀A/d, doubling the separation (d → 2d) halves the capacitance.' },
        { id: 'c', text: 'Capacitance quadruples', feedback: 'Incorrect. Capacitance is inversely proportional to distance, not distance squared.' },
        { id: 'd', text: 'Capacitance is unchanged', feedback: 'Incorrect. Capacitance depends on the plate separation.' }
      ],
      correctOptionId: 'b',
      explanation: 'Capacitance C = ε₀A/d is inversely proportional to plate separation. Doubling the distance halves the capacitance.',
      difficulty: 'intermediate',
      tags: ['capacitance', 'parallel-plates', 'proportional-reasoning']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  }
};

// Only export the assessment configurations
// The main course2_assessments function will handle creating the handlers on-demand
exports.assessmentConfigs = assessmentConfigs;