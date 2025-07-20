/**
 * Assessment Functions for Unit 4 Review - Magnetism and Electromagnetic Phenomena
 * Course: 2 (Physics 30)
 * Content: 47-unit-4-review
 * 
 * This module provides individual standard multiple choice assessments for the
 * slideshow knowledge check frontend component covering:
 * - Lesson 36: Magnetic Fields
 * - Lesson 37: Magnetic Forces on Particles
 * - Lesson 38: Motor Effect
 * - Lesson 40: Generator Effect
 * - Activities: Practical Applications
 * - Lesson 42: Electromagnetic Radiation
 */

const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ===== UNIT 4 REVIEW QUESTIONS =====

// Assessment configurations for the master function
const assessmentConfigs = {
  
  // ===== MAGNETIC FIELDS QUESTIONS =====
  'course2_47_unit4_q1': {
    questions: [{
      questionText: "Which statement about magnetic field lines is correct?",
      options: [
        { id: 'a', text: 'Magnetic field lines start and end on the same pole', feedback: 'Incorrect. Magnetic field lines form closed loops or extend to infinity.' },
        { id: 'b', text: 'Magnetic field lines can cross each other', feedback: 'Incorrect. Magnetic field lines never cross each other.' },
        { id: 'c', text: 'Magnetic field lines point from North to South outside the magnet', feedback: 'Correct! Outside a magnet, field lines point from the North pole to the South pole, completing the loop by going from South to North inside the magnet.' },
        { id: 'd', text: 'The density of field lines has no relationship to field strength', feedback: 'Incorrect. Closer field lines indicate stronger magnetic field.' }
      ],
      correctOptionId: 'c',
      explanation: 'Magnetic field lines form closed loops, pointing from North to South outside the magnet and from South to North inside the magnet. They never cross and their density indicates field strength.',
      difficulty: 'beginner',
      tags: ['magnetic-fields', 'field-lines']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q2': {
    questions: [{
      questionText: "Using the right-hand rule for a straight current-carrying wire, if your thumb points in the direction of current flow, your fingers indicate:",
      options: [
        { id: 'a', text: 'The direction of the electric field', feedback: 'Incorrect. The right-hand rule for current relates to magnetic field direction.' },
        { id: 'b', text: 'The direction of magnetic field lines around the wire', feedback: 'Correct! When the thumb points along current direction, the fingers curl in the direction of the circular magnetic field lines around the wire.' },
        { id: 'c', text: 'The direction of electron flow', feedback: 'Incorrect. Conventional current (thumb) is opposite to electron flow direction.' },
        { id: 'd', text: 'The direction of force on the wire', feedback: 'Incorrect. This rule determines field direction, not force direction.' }
      ],
      correctOptionId: 'b',
      explanation: 'The right-hand rule for a straight wire: thumb = current direction, fingers curl = magnetic field direction around the wire.',
      difficulty: 'intermediate',
      tags: ['magnetic-fields', 'right-hand-rule']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== MAGNETIC FORCES ON PARTICLES QUESTIONS =====
  'course2_47_unit4_q3': {
    questions: [{
      questionText: "A charged particle moving parallel to a magnetic field experiences:",
      options: [
        { id: 'a', text: 'Maximum magnetic force', feedback: 'Incorrect. When parallel, the angle is 0° and sin(0°) = 0.' },
        { id: 'b', text: 'No magnetic force', feedback: 'Correct! The magnetic force F = qvB sin θ. When the particle moves parallel to the field, θ = 0° and sin(0°) = 0, so F = 0.' },
        { id: 'c', text: 'Half the maximum possible force', feedback: 'Incorrect. This would occur at 30° to the field.' },
        { id: 'd', text: 'A force that increases its kinetic energy', feedback: 'Incorrect. Magnetic force is always perpendicular to velocity and does no work.' }
      ],
      correctOptionId: 'b',
      explanation: 'Magnetic force F = qvB sin θ. When motion is parallel to the field, θ = 0°, so sin θ = 0 and F = 0.',
      difficulty: 'intermediate',
      tags: ['magnetic-force', 'particle-motion']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q4': {
    questions: [{
      questionText: "An electron moving in a uniform magnetic field follows a circular path. If the magnetic field strength is doubled, the radius of the circular path:",
      options: [
        { id: 'a', text: 'Doubles', feedback: 'Incorrect. Consider the relationship r = mv/(qB).' },
        { id: 'b', text: 'Is halved', feedback: 'Correct! Since r = mv/(qB), doubling B makes the radius half as large.' },
        { id: 'c', text: 'Quadruples', feedback: 'Incorrect. The radius is inversely proportional to B, not B².' },
        { id: 'd', text: 'Remains the same', feedback: 'Incorrect. The radius depends on the magnetic field strength.' }
      ],
      correctOptionId: 'b',
      explanation: 'The radius of circular motion is r = mv/(qB). Since r is inversely proportional to B, doubling the field strength halves the radius.',
      difficulty: 'intermediate',
      tags: ['circular-motion', 'magnetic-field']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== MOTOR EFFECT QUESTIONS =====
  'course2_47_unit4_q5': {
    questions: [{
      questionText: "A current-carrying wire is placed perpendicular to a magnetic field. If the current is 2.0 A, the wire length is 0.50 m, and the magnetic field is 0.30 T, what is the magnetic force on the wire?",
      options: [
        { id: 'a', text: '0.15 N', feedback: 'Incorrect. Check your calculation using F = ILB.' },
        { id: 'b', text: '0.30 N', feedback: 'Correct! F = ILB = (2.0 A)(0.50 m)(0.30 T) = 0.30 N' },
        { id: 'c', text: '0.60 N', feedback: 'Incorrect. You may have doubled one of the values.' },
        { id: 'd', text: '3.0 N', feedback: 'Incorrect. Check your decimal placement in the calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'For a wire perpendicular to magnetic field: F = ILB = (2.0 A)(0.50 m)(0.30 T) = 0.30 N',
      difficulty: 'intermediate',
      tags: ['motor-effect', 'force-calculation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q6': {
    questions: [{
      questionText: "In an electric motor, what is the primary function of the commutator?",
      options: [
        { id: 'a', text: 'To increase the magnetic field strength', feedback: 'Incorrect. The commutator affects current direction, not field strength.' },
        { id: 'b', text: 'To reverse the current direction in the coil for continuous rotation', feedback: 'Correct! The commutator reverses current direction every half turn, ensuring the force always acts in the same rotational direction.' },
        { id: 'c', text: 'To provide electrical insulation', feedback: 'Incorrect. While commutators have insulated segments, their primary function is current reversal.' },
        { id: 'd', text: 'To increase the rotational speed', feedback: 'Incorrect. Speed depends on current and field strength, not the commutator directly.' }
      ],
      correctOptionId: 'b',
      explanation: 'The commutator reverses current direction every half rotation, ensuring continuous torque in the same direction for sustained rotation.',
      difficulty: 'intermediate',
      tags: ['motor', 'commutator']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== GENERATOR EFFECT QUESTIONS =====
  'course2_47_unit4_q7': {
    questions: [{
      questionText: "According to Faraday's law, an EMF is induced when:",
      options: [
        { id: 'a', text: 'A conductor is placed in a magnetic field', feedback: 'Incorrect. Simply placing a conductor in a static field does not induce EMF.' },
        { id: 'b', text: 'Current flows through a conductor', feedback: 'Incorrect. Current flow creates a magnetic field but does not necessarily induce EMF.' },
        { id: 'c', text: 'The magnetic flux through a loop changes', feedback: 'Correct! Faraday\'s law states that EMF = -dΦ/dt, meaning EMF is induced when magnetic flux changes.' },
        { id: 'd', text: 'The magnetic field is very strong', feedback: 'Incorrect. Field strength alone does not induce EMF; the field must be changing.' }
      ],
      correctOptionId: 'c',
      explanation: 'Faraday\'s law: EMF = -N(dΦ/dt). An EMF is induced when magnetic flux through a circuit changes, regardless of what causes the change.',
      difficulty: 'intermediate',
      tags: ['faradays-law', 'electromagnetic-induction']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q8': {
    questions: [{
      questionText: "Lenz's law states that the direction of an induced current is such that it:",
      options: [
        { id: 'a', text: 'Enhances the change that produced it', feedback: 'Incorrect. Lenz\'s law states that induced effects oppose the change.' },
        { id: 'b', text: 'Opposes the change that produced it', feedback: 'Correct! Lenz\'s law is a consequence of energy conservation - induced currents create effects that oppose the change causing them.' },
        { id: 'c', text: 'Is always in the same direction as the external current', feedback: 'Incorrect. The direction depends on the type of change, not the external current direction.' },
        { id: 'd', text: 'Creates the maximum possible magnetic field', feedback: 'Incorrect. The induced current creates just enough field to oppose the change.' }
      ],
      correctOptionId: 'b',
      explanation: 'Lenz\'s law ensures energy conservation by having induced currents oppose the change that created them, preventing perpetual motion machines.',
      difficulty: 'intermediate',
      tags: ['lenz-law', 'electromagnetic-induction']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q9': {
    questions: [{
      questionText: "A conductor 0.20 m long moves at 5.0 m/s perpendicular to a 0.40 T magnetic field. What is the motional EMF induced?",
      options: [
        { id: 'a', text: '0.20 V', feedback: 'Incorrect. Check your calculation using EMF = BLv.' },
        { id: 'b', text: '0.40 V', feedback: 'Correct! EMF = BLv = (0.40 T)(0.20 m)(5.0 m/s) = 0.40 V' },
        { id: 'c', text: '1.0 V', feedback: 'Incorrect. Make sure you multiply all three values correctly.' },
        { id: 'd', text: '4.0 V', feedback: 'Incorrect. Check your decimal placement in the calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'Motional EMF: EMF = BLv = (0.40 T)(0.20 m)(5.0 m/s) = 0.40 V',
      difficulty: 'intermediate',
      tags: ['motional-emf', 'calculation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== PRACTICAL APPLICATIONS QUESTIONS =====
  'course2_47_unit4_q10': {
    questions: [{
      questionText: "A step-up transformer has 100 turns on the primary coil and 500 turns on the secondary coil. If the primary voltage is 120 V, what is the secondary voltage?",
      options: [
        { id: 'a', text: '24 V', feedback: 'Incorrect. This would be for a step-down transformer.' },
        { id: 'b', text: '120 V', feedback: 'Incorrect. The voltage changes according to the turns ratio.' },
        { id: 'c', text: '600 V', feedback: 'Correct! Using Vs/Vp = Ns/Np: Vs = Vp × (Ns/Np) = 120 V × (500/100) = 600 V' },
        { id: 'd', text: '1200 V', feedback: 'Incorrect. Check your turns ratio calculation.' }
      ],
      correctOptionId: 'c',
      explanation: 'Transformer voltage relationship: Vs/Vp = Ns/Np. Therefore: Vs = 120 V × (500/100) = 600 V',
      difficulty: 'intermediate',
      tags: ['transformers', 'voltage-ratio']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== ELECTROMAGNETIC RADIATION QUESTIONS =====
  'course2_47_unit4_q11': {
    questions: [{
      questionText: "What is the frequency of electromagnetic radiation with a wavelength of 6.0 × 10⁻⁷ m? (c = 3.0 × 10⁸ m/s)",
      options: [
        { id: 'a', text: '2.0 × 10¹⁴ Hz', feedback: 'Incorrect. Check your calculation using c = fλ.' },
        { id: 'b', text: '5.0 × 10¹⁴ Hz', feedback: 'Correct! f = c/λ = (3.0×10⁸ m/s)/(6.0×10⁻⁷ m) = 5.0×10¹⁴ Hz' },
        { id: 'c', text: '1.8 × 10¹⁵ Hz', feedback: 'Incorrect. You may have multiplied instead of dividing.' },
        { id: 'd', text: '1.8 × 10² Hz', feedback: 'Incorrect. Check your powers of 10 in the calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using c = fλ, solve for frequency: f = c/λ = (3.0×10⁸)/(6.0×10⁻⁷) = 5.0×10¹⁴ Hz',
      difficulty: 'intermediate',
      tags: ['electromagnetic-waves', 'frequency-calculation']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q12': {
    questions: [{
      questionText: "Which type of electromagnetic radiation has the highest frequency?",
      options: [
        { id: 'a', text: 'Radio waves', feedback: 'Incorrect. Radio waves have the lowest frequency in the EM spectrum.' },
        { id: 'b', text: 'Visible light', feedback: 'Incorrect. Visible light is in the middle of the EM spectrum.' },
        { id: 'c', text: 'X-rays', feedback: 'Incorrect. X-rays have high frequency, but not the highest.' },
        { id: 'd', text: 'Gamma rays', feedback: 'Correct! Gamma rays have the highest frequency (and shortest wavelength) in the electromagnetic spectrum.' }
      ],
      correctOptionId: 'd',
      explanation: 'The EM spectrum in order of increasing frequency: radio, microwave, infrared, visible, ultraviolet, X-rays, gamma rays.',
      difficulty: 'beginner',
      tags: ['electromagnetic-spectrum', 'frequency']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  'course2_47_unit4_q13': {
    questions: [{
      questionText: "The energy of a photon is given by E = hf. What happens to the energy when the frequency doubles?",
      options: [
        { id: 'a', text: 'Energy is halved', feedback: 'Incorrect. Energy is directly proportional to frequency.' },
        { id: 'b', text: 'Energy doubles', feedback: 'Correct! Since E = hf and energy is directly proportional to frequency, doubling f doubles E.' },
        { id: 'c', text: 'Energy quadruples', feedback: 'Incorrect. The relationship is linear, not quadratic.' },
        { id: 'd', text: 'Energy remains the same', feedback: 'Incorrect. Energy depends directly on frequency.' }
      ],
      correctOptionId: 'b',
      explanation: 'The photon energy equation E = hf shows direct proportionality between energy and frequency. Doubling frequency doubles energy.',
      difficulty: 'intermediate',
      tags: ['photon-energy', 'wave-particle-duality']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== PRACTICAL APPLICATIONS QUESTIONS =====
  'course2_47_unit4_q14': {
    questions: [{
      questionText: "Which device converts mechanical energy into electrical energy?",
      options: [
        { id: 'a', text: 'Electric motor', feedback: 'Incorrect. Motors convert electrical energy to mechanical energy.' },
        { id: 'b', text: 'Transformer', feedback: 'Incorrect. Transformers change voltage levels but do not convert between energy types.' },
        { id: 'c', text: 'Generator', feedback: 'Correct! Generators use electromagnetic induction to convert mechanical energy (rotation) into electrical energy.' },
        { id: 'd', text: 'Capacitor', feedback: 'Incorrect. Capacitors store electrical energy but do not convert between energy types.' }
      ],
      correctOptionId: 'c',
      explanation: 'Generators use Faraday\'s law of electromagnetic induction to convert mechanical rotation into electrical energy, opposite to motors.',
      difficulty: 'beginner',
      tags: ['energy-conversion', 'generator']
    }],
    randomizeOptions: true,
    activityType: 'lesson',
    maxAttempts: 9999,
    pointsValue: 1
  },

  // ===== CONCEPTUAL INTEGRATION QUESTIONS =====
  'course2_47_unit4_q15': {
    questions: [{
      questionText: "What fundamental principle connects electric and magnetic phenomena?",
      options: [
        { id: 'a', text: 'Moving electric charges create magnetic fields, and changing magnetic fields induce electric effects', feedback: 'Correct! This describes the fundamental electromagnetic relationship: moving charges create magnetism (Oersted/Ampère) and changing magnetism creates electricity (Faraday).' },
        { id: 'b', text: 'Electric and magnetic fields are completely independent', feedback: 'Incorrect. Electric and magnetic phenomena are intimately connected.' },
        { id: 'c', text: 'Only static charges can create magnetic fields', feedback: 'Incorrect. Static charges do not create magnetic fields; only moving charges do.' },
        { id: 'd', text: 'Magnetic fields can only be created by permanent magnets', feedback: 'Incorrect. Magnetic fields are also created by electric currents and changing electric fields.' }
      ],
      correctOptionId: 'a',
      explanation: 'The fundamental connection is that electricity and magnetism are two aspects of the same phenomenon: moving charges create magnetic fields, and changing magnetic fields induce electrical effects.',
      difficulty: 'intermediate',
      tags: ['electromagnetism', 'conceptual-integration']
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