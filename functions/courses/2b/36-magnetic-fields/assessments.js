// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

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
    questionText: "In the diagram below, a compass is placed under the conductor and the conductor is carrying conventional current from A to B. In which direction will the compass needle point?",
    image: {
      url: '/courses/2/content/36-magnetic-fields/assests/36-practice1diagram.png',
      alt: 'Diagram showing a conductor with current from A to B and a compass placed underneath',
      caption: 'Compass placed under conductor with conventional current from A to B'
    },
    options: [
      { id: 'a', text: 'To the right', feedback: 'Correct! The Right Hand Rule predicts that the compass needle deflects and points to the right.' },
      { id: 'b', text: 'To the left', feedback: 'Incorrect. Use the Right Hand Rule: thumb points in direction of current (A to B), fingers curl around, compass points right.' },
      { id: 'c', text: 'Up the page', feedback: 'Incorrect. The magnetic field around a straight conductor is circular, not vertical.' },
      { id: 'd', text: 'Down the page', feedback: 'Incorrect. Apply the Right Hand Rule to determine the correct direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule: point your thumb in the direction of conventional current (A to B), curl your fingers around the wire. Below the wire, the magnetic field points to the right, so the compass needle will point right.',
    difficulty: 'intermediate',
    tags: ['right-hand-rule', 'magnetic-field', 'compass', 'current-direction']
  },
  {
    questionText: "In the diagram below, a compass is placed over a conductor and the conductor is carrying electrons from B to A. In which direction will the compass needle point?",
    // image: {
    //   url: '/courses/2/content/36-magnetic-fields/assests/36-practice2diagram.png',
    //   alt: 'Diagram showing a conductor with electron flow from B to A and a compass placed above',
    //   caption: 'Compass placed over conductor with electron flow from B to A'
    // },
    options: [
      { id: 'a', text: 'To the left', feedback: 'Correct! The Left Hand Rule for electron flow predicts that the compass needle deflects and points to the left.' },
      { id: 'b', text: 'To the right', feedback: 'Incorrect. Remember that electron flow is opposite to conventional current direction. Use the Left Hand Rule.' },
      { id: 'c', text: 'Up the page', feedback: 'Incorrect. The magnetic field around a straight conductor is circular, not vertical.' },
      { id: 'd', text: 'Down the page', feedback: 'Incorrect. Apply the Left Hand Rule for electron flow to determine the correct direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow: point your thumb in the direction of electron flow (B to A), curl your fingers around the wire. Above the wire, the magnetic field points to the left, so the compass needle will point left.',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'electron-flow', 'magnetic-field', 'compass']
  },
  {
    questionText: "In the diagram below, the compass is pointing toward the right side of the page. In which direction is current flowing in the conductor, A to B or B to A?",
    // image: {
    //   url: '/courses/2/content/36-magnetic-fields/assests/36-practice3diagram.png',
    //   alt: 'Diagram showing a conductor with compass pointing right',
    //   caption: 'Compass pointing to the right side of the page'
    // },
    options: [
      { id: 'a', text: 'From B to A', feedback: 'Correct! Using the right hand rule, if the compass points right and is below the wire, current must flow from B to A.' },
      { id: 'b', text: 'From A to B', feedback: 'Incorrect. If current flowed A to B, the compass below the wire would point left, not right.' },
      { id: 'c', text: 'No current is flowing', feedback: 'Incorrect. The compass deflection indicates there is a magnetic field present, which requires current flow.' },
      { id: 'd', text: 'Current direction cannot be determined', feedback: 'Incorrect. The Right Hand Rule allows us to determine current direction from the magnetic field direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule in reverse: if the magnetic field points right below the wire, curl your fingers in that direction and your thumb points from B to A, indicating the current direction.',
    difficulty: 'advanced',
    tags: ['right-hand-rule', 'current-direction', 'magnetic-field-analysis', 'reverse-application']
  },
  {
    questionText: "In the diagram below, the circle represents the cross-section of a conductor coming out of the page. The direction of the current is represented by the dot in the centre of the conductor. In what direction will a compass needle point if it is placed at point P?",
    // image: {
    //   url: '/courses/2/content/36-magnetic-fields/assests/36-practice4diagram.png',
    //   alt: 'Cross-section view of conductor with current coming out of page (dot symbol) and point P marked',
    //   caption: 'Cross-section of conductor with current out of page (⊙) and compass at point P'
    // },
    options: [
      { id: 'a', text: 'Down the page', feedback: 'Correct! Using the right hand rule, with current out of the page, the magnetic field circles counterclockwise. At point P, this points down the page.' },
      { id: 'b', text: 'Up the page', feedback: 'Incorrect. The magnetic field at point P would point up if the current were into the page (⊗), not out of the page (⊙).' },
      { id: 'c', text: 'To the right', feedback: 'Incorrect. Point P is below the conductor, where the field points vertically, not horizontally.' },
      { id: 'd', text: 'To the left', feedback: 'Incorrect. The horizontal components of the field are to the left and right of the conductor, not below it.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule: thumb points out of the page (direction of current), fingers curl counterclockwise around the wire. At point P (below the conductor), the magnetic field points down the page.',
    difficulty: 'advanced',
    tags: ['right-hand-rule', 'cross-section', 'current-out-of-page', 'magnetic-field-direction']
  },
  {
    questionText: "In the diagram, electrons are flowing from A to B. Which end of the solenoid becomes the north pole?",
    // image: {
    //   url: '/courses/2/content/36-magnetic-fields/assests/36-practice5diagram.png',
    //   alt: 'Solenoid diagram with electron flow from A to B',
    //   caption: 'Solenoid with electron flow from A to B'
    // },
    options: [
      { id: 'a', text: 'Left end', feedback: 'Correct! Using the Left Hand Rule for electron flow, the north pole is at the left end of the solenoid.' },
      { id: 'b', text: 'Right end', feedback: 'Incorrect. With electron flow A to B, the Left Hand Rule indicates the north pole is at the left end.' },
      { id: 'c', text: 'Both ends are north poles', feedback: 'Incorrect. A solenoid acts like a bar magnet with one north and one south pole.' },
      { id: 'd', text: 'Neither end is a north pole', feedback: 'Incorrect. The solenoid creates a magnetic field with distinct north and south poles.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow: curl your fingers in the direction of electron flow around the coils. Your thumb points toward the north pole, which is the left end.',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'solenoid', 'electron-flow', 'magnetic-poles']
  },
  {
    questionText: "In the diagram, current is flowing from A to B. Which end of the solenoid becomes the south pole?",
    image: {
      url: '/courses/2/content/36-magnetic-fields/assests/36-practice6diagram.png',
      alt: 'Solenoid diagram with conventional current from A to B',
      caption: 'Solenoid with conventional current from A to B'
    },
    options: [
      { id: 'a', text: 'Right end', feedback: 'Correct! Using the Right Hand Rule for conventional current, the south pole is at the right end of the solenoid.' },
      { id: 'b', text: 'Left end', feedback: 'Incorrect. With conventional current A to B, the Right Hand Rule indicates the north pole is at the left end, so south is at the right.' },
      { id: 'c', text: 'Both ends are south poles', feedback: 'Incorrect. A solenoid acts like a bar magnet with one north and one south pole.' },
      { id: 'd', text: 'Neither end is a south pole', feedback: 'Incorrect. The solenoid creates a magnetic field with distinct north and south poles.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule for conventional current: curl your fingers in the direction of current flow around the coils. Your thumb points toward the north pole (left end), making the right end the south pole.',
    difficulty: 'intermediate',
    tags: ['right-hand-rule', 'solenoid', 'conventional-current', 'magnetic-poles']
  },
  {
    questionText: "In the diagram, the top of the solenoid is the induced north pole. Which way is the current flowing, A to B or B to A?",
    image: {
      url: '/courses/2/content/36-magnetic-fields/assests/36-practice7diagram.png',
      alt: 'Solenoid diagram with north pole marked at top',
      caption: 'Solenoid with north pole at the top end'
    },
    options: [
      { id: 'a', text: 'From B to A', feedback: 'Correct! Using the Right Hand Rule in reverse: if north is at the top, curl fingers to point thumb upward, current flows from B to A.' },
      { id: 'b', text: 'From A to B', feedback: 'Incorrect. If current flowed A to B, the Right Hand Rule would place the north pole at the bottom, not the top.' },
      { id: 'c', text: 'No current is flowing', feedback: 'Incorrect. A magnetic north pole indicates current must be flowing through the solenoid.' },
      { id: 'd', text: 'Current direction cannot be determined', feedback: 'Incorrect. The Right Hand Rule allows us to determine current direction from the pole orientation.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule in reverse: if the north pole is at the top, point your thumb upward and curl your fingers. This shows current must flow from B to A to create this magnetic orientation.',
    difficulty: 'advanced',
    tags: ['right-hand-rule', 'solenoid', 'reverse-application', 'current-direction']
  },
  {
    questionText: "A magnetic compass is allowed to come to rest in a north-south orientation. A wire is placed over it, and connected so that the electron flow is from north to south. Will the compass needle deflect clockwise or counterclockwise as seen from above?",
    options: [
      { id: 'a', text: 'Counterclockwise', feedback: 'Correct! The Left Hand Rule predicts that the compass needle deflects counterclockwise as seen from above.' },
      { id: 'b', text: 'Clockwise', feedback: 'Incorrect. With electron flow north to south, use the Left Hand Rule, which gives counterclockwise deflection.' },
      { id: 'c', text: 'No deflection', feedback: 'Incorrect. Electron flow creates a magnetic field that will deflect the compass needle.' },
      { id: 'd', text: 'The compass will spin continuously', feedback: 'Incorrect. The compass will deflect to a new stable position based on the magnetic field.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow: thumb points north to south (direction of electron flow), fingers curl counterclockwise around the wire. The compass needle follows this deflection counterclockwise.',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'electron-flow', 'compass-deflection', 'overhead-view']
  },
  {
    questionText: "A wire is connected in a North-South direction and a compass is placed over top of the wire and allowed to come to rest in the North-South direction. Electrons are allowed to flow through the wire from North to South. Will the compass needle deflect clockwise or counterclockwise as seen from above?",
    options: [
      { id: 'a', text: 'Clockwise', feedback: 'Correct! The Left Hand Rule predicts that the compass needle deflects clockwise as seen from above.' },
      { id: 'b', text: 'Counterclockwise', feedback: 'Incorrect. Check the Left Hand Rule application - with electrons flowing north to south, the deflection is clockwise.' },
      { id: 'c', text: 'No deflection', feedback: 'Incorrect. Electron flow creates a magnetic field that will deflect the compass needle.' },
      { id: 'd', text: 'The direction depends on the wire material', feedback: 'Incorrect. The deflection direction depends only on the current direction and the hand rule, not the wire material.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow from north to south: the magnetic field circles the wire. Above the wire, the field points east, causing the compass needle to deflect clockwise when viewed from above.',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'electron-flow', 'compass-deflection', 'spatial-reasoning']
  },
  {
    questionText: "A magnetic compass is allowed to come to rest in a North-South direction. A wire is placed over it and connected so that the electrons flow from South to North. Will the compass needle deflect clockwise or counterclockwise as seen from above?",
    options: [
      { id: 'a', text: 'Clockwise', feedback: 'Correct! The Left Hand Rule predicts that the compass needle deflects clockwise as seen from above.' },
      { id: 'b', text: 'Counterclockwise', feedback: 'Incorrect. With electron flow south to north, apply the Left Hand Rule to get clockwise deflection.' },
      { id: 'c', text: 'No deflection', feedback: 'Incorrect. Electron flow creates a magnetic field that will deflect the compass needle.' },
      { id: 'd', text: 'The deflection alternates direction', feedback: 'Incorrect. With steady DC current, the deflection will be in one consistent direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow from south to north: the magnetic field circles the wire. Above the wire, the field points west, causing the compass needle to deflect clockwise when viewed from above.',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'electron-flow', 'compass-deflection', 'direction-analysis']
  },
  {
    questionText: "A wire is connected in a North-South direction and a compass is placed over top of the wire and allowed to come to rest in the North-South direction. Electrons are allowed to flow through the wire from South to North. Will the compass needle deflect clockwise or counterclockwise as seen from above?",
    options: [
      { id: 'a', text: 'Counterclockwise', feedback: 'Correct! The Left Hand Rule predicts that the compass needle deflects counterclockwise as seen from above.' },
      { id: 'b', text: 'Clockwise', feedback: 'Incorrect. With electron flow south to north, the Left Hand Rule gives counterclockwise deflection.' },
      { id: 'c', text: 'No deflection', feedback: 'Incorrect. Electron flow creates a magnetic field that will deflect the compass needle.' },
      { id: 'd', text: 'The deflection is too small to observe', feedback: 'Incorrect. The deflection would be observable with sufficient current flow.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow from south to north: point thumb south to north, fingers curl counterclockwise. Above the wire, the magnetic field causes counterclockwise compass deflection.',
    difficulty: 'intermediate',
    tags: ['left-hand-rule', 'electron-flow', 'compass-deflection', 'counterclockwise']
  },
  {
    questionText: "If you fire a negatively charged bullet horizontally and watch it recede away from you, what is the direction of the magnetic field that surrounds it? (clockwise or counterclockwise)",
    options: [
      { id: 'a', text: 'Counterclockwise', feedback: 'Correct! Receding negatively charged bullet - use the Left Hand Rule - counterclockwise magnetic field.' },
      { id: 'b', text: 'Clockwise', feedback: 'Incorrect. For a negatively charged particle, use the Left Hand Rule, which gives counterclockwise field direction.' },
      { id: 'c', text: 'No magnetic field is created', feedback: 'Incorrect. Any moving charged particle creates a magnetic field around it.' },
      { id: 'd', text: 'The field direction changes randomly', feedback: 'Incorrect. The field direction is determined by the charge and motion direction using hand rules.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for negative charges: thumb points in direction of motion (away from you), fingers curl counterclockwise around the path. The magnetic field circles counterclockwise around the moving negative charge.',
    difficulty: 'advanced',
    tags: ['left-hand-rule', 'moving-charges', 'magnetic-field', 'negative-charge']
  },
  {
    questionText: "If you fire a positively charged bullet horizontally and watch it recede, what is the direction of the magnetic field that surrounds it?",
    options: [
      { id: 'a', text: 'Clockwise', feedback: 'Correct! Receding positively charged bullet - use the Right Hand Rule - clockwise magnetic field.' },
      { id: 'b', text: 'Counterclockwise', feedback: 'Incorrect. For a positively charged particle, use the Right Hand Rule, which gives clockwise field direction.' },
      { id: 'c', text: 'No magnetic field is created', feedback: 'Incorrect. Any moving charged particle creates a magnetic field around it.' },
      { id: 'd', text: 'The field alternates between clockwise and counterclockwise', feedback: 'Incorrect. The field direction is consistent based on the charge and motion direction.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Right Hand Rule for positive charges: thumb points in direction of motion (away from you), fingers curl clockwise around the path. The magnetic field circles clockwise around the moving positive charge.',
    difficulty: 'advanced',
    tags: ['right-hand-rule', 'moving-charges', 'magnetic-field', 'positive-charge']
  },
  {
    questionText: "A coil of wire is placed on a table with its axis in the vertical direction. A flow of electrons is sent through the wire in the counterclockwise direction as seen from above. In which direction (up or down) is the North end of the magnetic field inside the coil generated?",
    options: [
      { id: 'a', text: 'Down', feedback: 'Correct! Counterclockwise electron flow using the Left Hand Rule. North pole of magnetic field is at the bottom of the coil.' },
      { id: 'b', text: 'Up', feedback: 'Incorrect. With counterclockwise electron flow, the Left Hand Rule shows the north pole points downward.' },
      { id: 'c', text: 'The field has no distinct poles', feedback: 'Incorrect. A current loop creates a magnetic dipole with distinct north and south poles.' },
      { id: 'd', text: 'Both up and down simultaneously', feedback: 'Incorrect. The magnetic field has one north pole and one south pole, not both directions.' }
    ],
    correctOptionId: 'a',
    explanation: 'Using the Left Hand Rule for electron flow: curl fingers in the counterclockwise direction (direction of electron flow), thumb points downward. The north pole of the magnetic field is at the bottom of the coil.',
    difficulty: 'advanced',
    tags: ['left-hand-rule', 'coil', 'electron-flow', 'magnetic-poles']
  },
  {
    questionText: "A large flat plastic disk is negatively charged. If the disk is spinning clockwise as seen from above, in what direction (up or down) will the North end of the generated magnetic field point?",
    options: [
      { id: 'a', text: 'Up', feedback: 'Correct! Electrons spinning clockwise creates the same effect as electrons flowing clockwise around a coil. Use the Left Hand Rule and the North Pole points up.' },
      { id: 'b', text: 'Down', feedback: 'Incorrect. Spinning negative charges clockwise is equivalent to clockwise electron current, which using the Left Hand Rule points the north pole upward.' },
      { id: 'c', text: 'No magnetic field is generated', feedback: 'Incorrect. Spinning charged objects create magnetic fields due to the moving charges.' },
      { id: 'd', text: 'The direction depends on the spin speed', feedback: 'Incorrect. The direction depends on the charge type and spin direction, not the speed.' }
    ],
    correctOptionId: 'a',
    explanation: 'A spinning negatively charged disk creates the same magnetic effect as a coil with clockwise electron flow. Using the Left Hand Rule: curl fingers clockwise (electron motion), thumb points up, indicating the north pole is directed upward.',
    difficulty: 'advanced',
    tags: ['left-hand-rule', 'spinning-charges', 'magnetic-field', 'charged-disk']
  }
];



// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Assessment configurations for master function 
const assessmentConfigs = {};

questionPool.forEach((questionData, index) => {
  const questionNumber = index + 1;
  const questionId = `course2_36_question${questionNumber}`;
  
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
    theme: 'blue'
  };
});

module.exports = { assessmentConfigs };