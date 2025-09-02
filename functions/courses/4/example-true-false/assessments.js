/**
 * Example True/False Assessment Configuration
 * This file demonstrates how to set up true/false questions for Course 4
 * 
 * True/False questions are perfect for:
 * - Quick knowledge checks
 * - Fact verification
 * - Concept understanding
 * - Pre/post lesson assessments
 */

// Example True/False question pools
const physicsFactsQuestions = [
  {
    questionText: "The speed of light in a vacuum is constant regardless of the observer's motion.",
    correctAnswer: true,
    explanation: "According to Einstein's special relativity, the speed of light in a vacuum is always c = 299,792,458 m/s for all observers, regardless of their motion relative to the light source.",
    feedback: {
      true: "Correct! This is one of the fundamental postulates of special relativity. The constancy of the speed of light is what leads to time dilation and length contraction.",
      false: "Incorrect. The speed of light in a vacuum is indeed constant for all observers. This counterintuitive fact is a cornerstone of Einstein's special relativity."
    },
    difficulty: 'intermediate',
    tags: ['physics', 'relativity', 'light']
  },
  {
    questionText: "Water freezes at 100°C at standard atmospheric pressure.",
    correctAnswer: false,
    explanation: "Water freezes at 0°C (32°F) at standard atmospheric pressure. 100°C is the boiling point of water at standard pressure.",
    feedback: {
      true: "Incorrect. You're confusing the freezing and boiling points. Water freezes at 0°C and boils at 100°C at standard atmospheric pressure.",
      false: "Correct! Water freezes at 0°C, not 100°C. 100°C is the boiling point of water at standard atmospheric pressure."
    },
    difficulty: 'beginner',
    tags: ['physics', 'thermodynamics', 'phase-changes']
  },
  {
    questionText: "All objects fall at the same rate in a vacuum, regardless of their mass.",
    correctAnswer: true,
    explanation: "In the absence of air resistance (in a vacuum), all objects experience the same gravitational acceleration and fall at the same rate, regardless of their mass. This was famously demonstrated on the Moon during the Apollo 15 mission.",
    feedback: {
      true: "Correct! This principle was first proposed by Galileo and later confirmed by Newton's laws. Without air resistance, a feather and a hammer fall at the same rate.",
      false: "Incorrect. In a vacuum (without air resistance), all objects fall at the same rate regardless of mass. The misconception that heavier objects fall faster comes from everyday experience with air resistance."
    },
    difficulty: 'intermediate',
    tags: ['physics', 'gravity', 'motion']
  },
  {
    questionText: "Sound waves can travel through a vacuum.",
    correctAnswer: false,
    explanation: "Sound waves are mechanical waves that require a medium (like air, water, or solids) to propagate. They cannot travel through a vacuum because there are no particles to transmit the vibrations.",
    feedback: {
      true: "Incorrect. Sound waves are mechanical waves that need a medium to travel through. In a vacuum, there are no particles to carry the sound vibrations.",
      false: "Correct! Sound cannot travel through a vacuum because it needs a medium (matter) to propagate. This is why space is silent."
    },
    difficulty: 'beginner',
    tags: ['physics', 'waves', 'sound']
  },
  {
    questionText: "Energy can be created or destroyed according to the law of conservation of energy.",
    correctAnswer: false,
    explanation: "The law of conservation of energy states that energy cannot be created or destroyed, only transformed from one form to another. The total energy in an isolated system remains constant.",
    feedback: {
      true: "Incorrect. The law of conservation of energy states the opposite: energy cannot be created or destroyed, only converted from one form to another.",
      false: "Correct! Energy cannot be created or destroyed, only transformed. This is one of the most fundamental principles in physics."
    },
    difficulty: 'beginner',
    tags: ['physics', 'energy', 'conservation-laws']
  }
];

const mathematicsConceptsQuestions = [
  {
    questionText: "The square root of a negative number is undefined in the real number system.",
    correctAnswer: true,
    explanation: "In the real number system, square roots of negative numbers are undefined. However, they are defined in the complex number system using imaginary numbers (i = √-1).",
    feedback: {
      true: "Correct! In the real number system, you cannot take the square root of a negative number. This limitation led to the development of complex numbers.",
      false: "Incorrect. Within the real number system, square roots of negative numbers are undefined. You need complex numbers to work with them."
    },
    difficulty: 'intermediate',
    tags: ['mathematics', 'algebra', 'number-systems']
  },
  {
    questionText: "All prime numbers are odd numbers.",
    correctAnswer: false,
    explanation: "While most prime numbers are odd, the number 2 is both prime and even. It's the only even prime number.",
    feedback: {
      true: "Incorrect. Remember that 2 is a prime number, and it's even! It's the only even prime number.",
      false: "Correct! The number 2 is prime and even, making it the exception. All other prime numbers are indeed odd."
    },
    difficulty: 'beginner',
    tags: ['mathematics', 'number-theory', 'primes']
  }
];

// Assessment configurations using true-false type
const assessmentConfigs = {
  // Example 1: Simple physics facts check
  'course4_physics_facts_tf': {
    type: 'true-false',
    questions: physicsFactsQuestions,
    activityType: 'lesson',
    maxAttempts: 3,
    pointsValue: 1,
    theme: 'blue',
    randomizeQuestions: true,
    showFeedback: true
  },
  
  // Example 2: Mathematics concepts verification
  'course4_math_concepts_tf': {
    type: 'true-false',
    questions: mathematicsConceptsQuestions,
    activityType: 'lesson',
    maxAttempts: 2,
    pointsValue: 1,
    theme: 'green',
    randomizeQuestions: true,
    showFeedback: true
  },
  
  // Example 3: Mixed difficulty assessment
  'course4_mixed_tf_assessment': {
    type: 'true-false',
    questions: [...physicsFactsQuestions, ...mathematicsConceptsQuestions],
    activityType: 'assignment',
    maxAttempts: 1,
    pointsValue: 2,
    theme: 'purple',
    randomizeQuestions: true,
    allowSameQuestion: false,
    showFeedback: true
  },
  
  // Example 4: Exam-style true/false (no immediate feedback)
  'course4_tf_exam': {
    type: 'true-false',
    questions: physicsFactsQuestions.filter(q => q.difficulty === 'intermediate'),
    activityType: 'exam',
    maxAttempts: 1,
    pointsValue: 2,
    theme: 'slate',
    randomizeQuestions: true,
    showFeedback: false  // No feedback during exam
  }
};

module.exports = {
  assessmentConfigs
};