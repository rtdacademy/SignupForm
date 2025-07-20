

// Question pools for L19-21 Assignment - Magnetism (Updated: Removed Question 5 - Fluoride Ion)
const questionPools = {
  // Group 1: Magnetic Fields and Compass Deflection
  group1: [
    {
      questionText: "A magnetic compass is allowed to come to rest in a north-south orientation. A wire is placed over it, and connected so that the electron flow is from north to south. Will the compass needle deflect clockwise or counterclockwise as seen from above?",
      options: [
        { id: 'a', text: 'Clockwise', feedback: 'Incorrect. The Left Hand Rule predicts the opposite direction.' },
        { id: 'b', text: 'Counterclockwise', feedback: 'Correct! The Left Hand Rule predicts that the compass needle deflects counterclockwise as seen from above.' },
        { id: 'c', text: 'No deflection occurs', feedback: 'Incorrect. A current-carrying wire creates a magnetic field that will deflect the compass needle.' },
        { id: 'd', text: 'The needle will spin rapidly', feedback: 'Incorrect. The needle will deflect to a new stable position.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the Left Hand Rule for electron flow from north to south, the magnetic field created by the wire will cause the compass needle to deflect counterclockwise as seen from above.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'left-hand-rule', 'compass', 'electron-flow']
    },
    {
      questionText: "If you fire a negatively charged bullet horizontally and watch it recede away from you, what is the direction of the magnetic field that surrounds it? (clockwise or counterclockwise)",
      options: [
        { id: 'a', text: 'Clockwise', feedback: 'Incorrect. Use the Left Hand Rule for negative charges.' },
        { id: 'b', text: 'Counterclockwise', feedback: 'Correct! For a receding negatively charged bullet, the Left Hand Rule predicts a counterclockwise magnetic field.' },
        { id: 'c', text: 'No magnetic field is created', feedback: 'Incorrect. Moving charges create magnetic fields.' },
        { id: 'd', text: 'The field alternates direction', feedback: 'Incorrect. The field direction is consistent based on the charge and motion.' }
      ],
      correctOptionId: 'b',
      explanation: 'A receding negatively charged bullet creates a counterclockwise magnetic field when viewed from behind, as predicted by the Left Hand Rule.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'left-hand-rule', 'negative-charge', 'magnetic-field']
    },
    {
      questionText: "A coil of wire is placed on a table with its axis in the vertical direction. A flow of electrons is sent through the wire in the counterclockwise direction as seen from above. In which direction (up or down) is the North end of the magnetic field inside the coil generated?",
      options: [
        { id: 'a', text: 'Up (toward the top of the coil)', feedback: 'Incorrect. Apply the Left Hand Rule for electron flow.' },
        { id: 'b', text: 'Down (toward the bottom of the coil)', feedback: 'Correct! Using the Left Hand Rule for counterclockwise electron flow, the North pole of the magnetic field is at the bottom of the coil.' },
        { id: 'c', text: 'No magnetic field is created inside the coil', feedback: 'Incorrect. Current-carrying coils create magnetic fields.' },
        { id: 'd', text: 'The field direction depends on the coil material', feedback: 'Incorrect. The field direction depends on the current direction, not the coil material.' }
      ],
      correctOptionId: 'b',
      explanation: 'For counterclockwise electron flow viewed from above, the Left Hand Rule indicates that the North pole of the magnetic field is at the bottom of the coil.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'left-hand-rule', 'coil', 'electron-flow', 'magnetic-poles']
    }
  ],

  // Group 2: Charged Particle Motion in Magnetic Fields  
  group2: [
    {
      questionText: "For a charged particle moving through a magnetic field, what is the direction of the deflecting force if the particle is a proton?",
      image: {
        url: '/courses/2/content/39-l19-21-assignment/assets/question_4.png',
        alt: 'Proton moving through magnetic field diagram',
        caption: 'A proton moving through a magnetic field'
      },
      options: [
        { id: 'a', text: 'Upward', feedback: 'Incorrect. Consider the Right Hand Rule for positive charges.' },
        { id: 'b', text: 'Downward', feedback: 'Correct! For a proton (positive charge), the Right Hand Rule predicts a downward deflecting force.' },
        { id: 'c', text: 'Into the page', feedback: 'Incorrect. Check the direction using the Right Hand Rule.' },
        { id: 'd', text: 'Out of the page', feedback: 'Incorrect. The deflecting force direction depends on the charge type and field orientation.' }
      ],
      correctOptionId: 'b',
      explanation: 'For a proton (positive charge) moving through the magnetic field, the Right Hand Rule predicts a downward deflecting force.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'right-hand-rule', 'proton', 'deflecting-force']
    },
    {
      questionText: "What is the magnetic field strength if a deflecting force of 0.0010 N is produced on a 7.5 C particle entering the field at 30° with a speed of 30 m/s?",
      options: [
        { id: 'a', text: '4.44 mT', feedback: 'Incorrect. Check your calculation using F = qvB sin θ.' },
        { id: 'b', text: '8.89 mT', feedback: 'Correct! Using F = qvB sin θ: B = F/(qv sin θ) = 0.0010/(7.5 × 30 × sin 30°) = 8.89 × 10⁻⁶ T = 8.89 mT.' },
        { id: 'c', text: '17.8 mT', feedback: 'Incorrect. Remember to include sin θ in your calculation.' },
        { id: 'd', text: '2.22 mT', feedback: 'Incorrect. Double-check your arithmetic and formula application.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the formula F = qvB sin θ, we solve for B: B = F/(qv sin θ) = 0.0010 N/(7.5 C × 30 m/s × sin 30°) = 0.0010/(7.5 × 30 × 0.5) = 8.89 × 10⁻⁶ T = 8.89 mT.',
      difficulty: 'advanced',
      tags: ['magnetism', 'magnetic-field-strength', 'deflecting-force', 'calculation']
    }
  ],

  // Group 3: Motor Effect and Conductor Forces
  group3: [
    {
      questionText: "Current is flowing from A to B in a conductor placed in a magnetic field. Predict the direction of movement of the conductor.",
      image: {
        url: '/courses/2/content/39-l19-21-assignment/assets/question_6.png',
        alt: 'Conductor in magnetic field with current from A to B',
        caption: 'Current flowing from A to B in a conductor placed in a magnetic field'
      },
      options: [
        { id: 'a', text: 'Into the page', feedback: 'Correct! Using the Right Hand Rule for conventional current from A to B, the conductor will move into the page.' },
        { id: 'b', text: 'Out of the page', feedback: 'Incorrect. Check the direction using the Right Hand Rule.' },
        { id: 'c', text: 'Upward', feedback: 'Incorrect. The force direction depends on the current direction and magnetic field orientation.' },
        { id: 'd', text: 'Downward', feedback: 'Incorrect. Apply the Right Hand Rule for conventional current flow.' }
      ],
      correctOptionId: 'a',
      explanation: 'For conventional current flowing from A to B in the given magnetic field configuration, the Right Hand Rule predicts that the conductor will move into the page.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'motor-effect', 'right-hand-rule', 'conductor-force']
    },
    {
      questionText: "Current through a conductor results in a force to the right. Which way is conventional current flowing?",
      image: {
        url: '/courses/2/content/39-l19-21-assignment/assets/question_7.png',
        alt: 'Conductor with force to the right in magnetic field',
        caption: 'Conductor experiencing a force to the right in a magnetic field'
      },
      options: [
        { id: 'a', text: 'Into the page', feedback: 'Incorrect. Use the Right Hand Rule to determine current direction from force direction.' },
        { id: 'b', text: 'Out of the page', feedback: 'Correct! If the force is to the right, the Right Hand Rule indicates conventional current is flowing out of the page.' },
        { id: 'c', text: 'Upward', feedback: 'Incorrect. Consider the relationship between current direction and force direction.' },
        { id: 'd', text: 'Downward', feedback: 'Incorrect. Apply the Right Hand Rule to find current direction from force direction.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the Right Hand Rule in reverse: if the force is to the right, the conventional current must be flowing out of the page.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'motor-effect', 'right-hand-rule', 'current-direction']
    },
    {
      questionText: "In a magnetic field, a 10 cm wire carries a current of 20 A through a magnetic field of 2.0 T. What is the deflecting force on the conductor?",
      image: {
        url: '/courses/2/content/39-l19-21-assignment/assets/question_8.png',
        alt: '10 cm wire with 20 A current in 2.0 T magnetic field',
        caption: '10 cm wire carrying 20 A current in a 2.0 T magnetic field'
      },
      options: [
        { id: 'a', text: '2.0 N', feedback: 'Incorrect. Check your calculation using F = BIL.' },
        { id: 'b', text: '4.0 N', feedback: 'Correct! Using F = BIL: F = 2.0 T × 20 A × 0.10 m = 4.0 N.' },
        { id: 'c', text: '8.0 N', feedback: 'Incorrect. Remember to convert cm to m.' },
        { id: 'd', text: '40 N', feedback: 'Incorrect. Check your unit conversion and calculation.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the formula F = BIL: F = 2.0 T × 20 A × 0.10 m = 4.0 N. The force direction is into the page based on the field configuration.',
      difficulty: 'intermediate',
      tags: ['magnetism', 'motor-effect', 'force-calculation', 'conductor']
    },
    {
      questionText: "A 40 cm conductor cuts through a magnetic field of 0.50 T at an angle of 60° to the field. If the wire carries a current of 20 A, what is the deflecting force on the conductor?",
      options: [
        { id: 'a', text: '2.0 N', feedback: 'Incorrect. Remember to include sin θ in your calculation.' },
        { id: 'b', text: '3.5 N', feedback: 'Correct! Using F = BIL sin θ: F = 0.50 T × 20 A × 0.40 m × sin 60° = 0.50 × 20 × 0.40 × 0.866 = 3.5 N.' },
        { id: 'c', text: '4.0 N', feedback: 'Incorrect. You need to account for the angle between the conductor and field.' },
        { id: 'd', text: '6.9 N', feedback: 'Incorrect. Check your calculation of sin 60°.' }
      ],
      correctOptionId: 'b',
      explanation: 'Using the formula F = BIL sin θ: F = 0.50 T × 20 A × 0.40 m × sin 60° = 0.50 × 20 × 0.40 × 0.866 = 3.5 N.',
      difficulty: 'advanced',
      tags: ['magnetism', 'motor-effect', 'force-calculation', 'angle', 'conductor']
    }
  ]
};

// Create individual questions by selecting from pools
const questions = [
  // Group 1 questions (3 questions)
  ...questionPools.group1,
  
  // Group 2 questions (2 questions) 
  ...questionPools.group2,
  
  // Group 3 questions (4 questions)
  ...questionPools.group3
];

// Export individual handlers for each question (9 total)
const questionHandlers = {};
const assessmentConfigs = {};

for (let i = 1; i <= 9; i++) {
  const questionIndex = i - 1;
  const questionId = `course2_39_l1921_question${i}`;
  
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