const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

// Station 1: Conductors in magnetic fields (the motor effect)

exports.course2_41_station1_q1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What effect was observed when the current was switched on through the straight wire suspended between the magnets?',
      options: [
        { id: 'a', text: 'The wire remained stationary.', feedback: 'Incorrect. The wire clearly moved when current was on.' },
        { id: 'b', text: 'The wire moved perpendicular to both the current and magnetic field.', feedback: 'Correct! Motion was perpendicular to both current direction and magnetic field, as Fleming\'s left-hand rule predicts.' },
        { id: 'c', text: 'The wire moved parallel to the magnetic field.', feedback: 'Incorrect. No motion along the field direction is observed.' },
        { id: 'd', text: 'The wire rotated around its longitudinal axis.', feedback: 'Incorrect. The wire did not twist about its own axis but translated as a whole.' }
      ],
      correctOptionId: 'b',
      explanation: 'When a current-carrying conductor is placed in a magnetic field, it experiences a force perpendicular to both the current direction and the magnetic field direction. This is the fundamental principle of the motor effect.',
      difficulty: 'intermediate',
      tags: ['motor-effect', 'electromagnetism', 'fleming-rule']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station1_q2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'Using the open-palm (Fleming\'s) left-hand rule, what determines the direction of the force on the current-carrying wire?',
      options: [
        { id: 'a', text: 'Thumb = magnetic field, First finger = current, Second finger = force', feedback: 'Incorrect. This mixes up the roles assigned to each finger.' },
        { id: 'b', text: 'Thumb = current, First finger = force, Second finger = magnetic field', feedback: 'Incorrect. This places the current on the thumb, which is incorrect.' },
        { id: 'c', text: 'Thumb = force, First finger = magnetic field, Second finger = current', feedback: 'Correct! The arrangement is Thumb → Force (Motion), First finger → Field, Second finger → Current.' },
        { id: 'd', text: 'Thumb = magnetic field, First finger = force, Second finger = current', feedback: 'Incorrect. This mixes up the roles assigned to each finger.' }
      ],
      correctOptionId: 'c',
      explanation: 'Fleming\'s left-hand rule uses the thumb for force/motion direction, the first finger for magnetic field direction, and the second finger for current direction. All three are mutually perpendicular.',
      difficulty: 'intermediate',
      tags: ['fleming-rule', 'motor-effect', 'electromagnetism']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station1_q3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What would happen to the direction of the wire\'s movement if the current direction in the wire were reversed?',
      options: [
        { id: 'a', text: 'The wire would move in the same direction.', feedback: 'Incorrect. Motion direction always flips with current reversal.' },
        { id: 'b', text: 'The wire would not move at all.', feedback: 'Incorrect. The wire continues to move.' },
        { id: 'c', text: 'The wire would move in the opposite direction.', feedback: 'Correct! Reversing current (keeping the magnetic field constant) reverses the force direction per Fleming\'s left-hand rule.' },
        { id: 'd', text: 'The wire would rotate instead of translating.', feedback: 'Incorrect. It still translates, not rotates.' }
      ],
      correctOptionId: 'c',
      explanation: 'According to Fleming\'s left-hand rule, reversing the current direction while keeping the magnetic field constant will reverse the direction of the force, causing the wire to move in the opposite direction.',
      difficulty: 'intermediate',
      tags: ['motor-effect', 'current-reversal', 'electromagnetism']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station1_q4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'When neodymium magnets are used instead of weaker steel magnets, what change occurs in the motor effect?',
      options: [
        { id: 'a', text: 'No change in force magnitude.', feedback: 'Incorrect. The field strength directly affects force magnitude.' },
        { id: 'b', text: 'The force increases due to a stronger magnetic field.', feedback: 'Correct! Stronger magnets create a stronger magnetic field, thus increase the magnetic force on the current-carrying wire.' },
        { id: 'c', text: 'The wire stops moving.', feedback: 'Incorrect. The circuit still operates normally.' },
        { id: 'd', text: 'The force direction reverses.', feedback: 'Incorrect. The magnetic field direction (not polarity) determines force direction.' }
      ],
      correctOptionId: 'b',
      explanation: 'The force on a current-carrying conductor in a magnetic field is proportional to the magnetic field strength. Neodymium magnets produce stronger fields than steel magnets, resulting in a greater force.',
      difficulty: 'intermediate',
      tags: ['magnetic-field-strength', 'motor-effect', 'neodymium-magnets']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station1_q5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'How can this demonstration be used to explain the "motor effect" in devices like speakers?',
      options: [
        { id: 'a', text: 'It shows how current produces a stationary magnetic field.', feedback: 'Partially true but misses the motion aspect.' },
        { id: 'b', text: 'It shows current in a magnet builds up over time.', feedback: 'Irrelevant—current doesn\'t accumulate in this context.' },
        { id: 'c', text: 'It shows how current and magnets interact to produce motion, which makes speaker cones vibrate.', feedback: 'Correct! The demonstration illustrates that current in the presence of a magnet produces force and movement—this same principle causes speaker cones and coil assemblies to vibrate, creating sound.' },
        { id: 'd', text: 'It shows how alternating current causes rotation, not motion.', feedback: 'Wrongly suggests rotational motion and misses the linear vibration used in speakers.' }
      ],
      correctOptionId: 'c',
      explanation: 'Speakers use the motor effect by passing an audio signal (varying current) through a coil attached to the speaker cone. This coil sits in a permanent magnetic field, causing it to move back and forth as the current changes, producing sound waves.',
      difficulty: 'intermediate',
      tags: ['motor-effect-applications', 'speakers', 'electromagnetism']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Station 2: Solenoids – induced current

exports.course2_41_station2_q1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What does the galvanometer in the demonstration primarily indicate?',
      options: [
        { id: 'a', text: 'The magnetic field strength inside the solenoid', feedback: 'Incorrect. It shows current, not field strength.' },
        { id: 'b', text: 'The direction and magnitude of induced current', feedback: 'Correct! The galvanometer detects and displays the induced current flowing through the solenoid circuit.' },
        { id: 'c', text: 'The speed at which the magnet is moving', feedback: 'Misleading. While deflection depends on speed, it\'s not a direct speed measure.' },
        { id: 'd', text: 'The polarity of the magnet', feedback: 'Wrong. Galvanometer doesn\'t reveal magnet polarity, only current direction.' }
      ],
      correctOptionId: 'b',
      explanation: 'A galvanometer is an instrument that detects and measures small electric currents. In this demonstration, it shows both the magnitude (by how far the needle deflects) and direction (which way it deflects) of the induced current.',
      difficulty: 'intermediate',
      tags: ['electromagnetic-induction', 'galvanometer', 'solenoids']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station2_q2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What happens when the magnet is pushed into the solenoid?',
      options: [
        { id: 'a', text: 'Needle jumps one way, then returns to zero when held still', feedback: 'Correct! The needle deflects during motion (when flux is changing) but returns to zero when the magnet stops moving.' },
        { id: 'b', text: 'Needle stays deflected while magnet is in place', feedback: 'Wrong. Deflection stops when flux change ceases.' },
        { id: 'c', text: 'No needle deflection at all', feedback: 'Contradicts the observed induced emf upon movement.' },
        { id: 'd', text: 'Needle continually increases its deflection', feedback: 'False. Deflection is momentary, not continuous increase.' }
      ],
      correctOptionId: 'a',
      explanation: 'When the magnet moves into the solenoid, the changing magnetic flux induces an emf (and current) causing the galvanometer needle to deflect. Once the magnet stops moving, the flux becomes constant, the induced emf drops to zero, and the needle returns to its neutral position.',
      difficulty: 'intermediate',
      tags: ['electromagnetic-induction', 'faraday-law', 'changing-flux']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station2_q3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What occurs when the magnet is pulled out of the solenoid?',
      options: [
        { id: 'a', text: 'Needle deflects in same direction as when pushing in', feedback: 'Misstates Lenz\'s Law: reversal of flux change reverses induced current.' },
        { id: 'b', text: 'Needle deflects in opposite direction', feedback: 'Correct! According to Lenz\'s Law, the induced current opposes the change, so pulling out causes opposite deflection.' },
        { id: 'c', text: 'Needle doesn\'t move', feedback: 'False. Any change in flux causes deflection.' },
        { id: 'd', text: 'Needle moves erratically', feedback: 'Incorrect. Direction is consistent and opposite, not erratic.' }
      ],
      correctOptionId: 'b',
      explanation: 'When the magnet is pulled out, the magnetic flux through the solenoid decreases (opposite of insertion). By Lenz\'s Law, the induced current creates a magnetic field to oppose this change, resulting in current flow in the opposite direction compared to insertion.',
      difficulty: 'intermediate',
      tags: ['lenz-law', 'electromagnetic-induction', 'flux-direction']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station2_q4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'According to Faraday\'s Law, why does moving the magnet in and out of the solenoid cause the galvanometer to deflect?',
      options: [
        { id: 'a', text: 'Because the magnet heats the solenoid, generating current', feedback: 'Incorrect. Heat isn\'t involved here.' },
        { id: 'b', text: 'A changing magnetic flux induces an emf and hence current', feedback: 'Correct! Faraday\'s Law states that a changing magnetic flux through a circuit induces an electromotive force (emf).' },
        { id: 'c', text: 'Mechanical vibration from movement powers the circuit', feedback: 'Wrong. No mechanical contact generates electricity.' },
        { id: 'd', text: 'Electric charges are pushed out by the magnet\'s field', feedback: 'False. It\'s flux change, not direct charge push, that induces emf.' }
      ],
      correctOptionId: 'b',
      explanation: 'Faraday\'s Law of electromagnetic induction states that the induced emf in a circuit is proportional to the rate of change of magnetic flux through the circuit. Moving the magnet changes the flux, inducing an emf that drives current through the galvanometer.',
      difficulty: 'intermediate',
      tags: ['faraday-law', 'electromagnetic-induction', 'magnetic-flux']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station2_q5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'If the magnet is held stationary inside the solenoid, what will the galvanometer indicate?',
      options: [
        { id: 'a', text: 'A steady deflection', feedback: 'Wrong. No flux change means no induced current.' },
        { id: 'b', text: 'No deflection', feedback: 'Correct! Without change in magnetic flux, there is no induced emf or current, so the galvanometer shows zero.' },
        { id: 'c', text: 'Random fluctuations', feedback: 'False. Without change, needle remains still.' },
        { id: 'd', text: 'A gradually increasing deflection', feedback: 'Wrong. No flux change means no induced current.' }
      ],
      correctOptionId: 'b',
      explanation: 'Electromagnetic induction requires a changing magnetic flux. When the magnet is stationary, the magnetic flux through the solenoid remains constant, resulting in zero induced emf and no current flow. The galvanometer needle stays at zero.',
      difficulty: 'intermediate',
      tags: ['electromagnetic-induction', 'constant-flux', 'no-current']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Station 3: Swinging aluminum paddles

exports.course2_41_station3_q1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'Is aluminum ferromagnetic?',
      options: [
        { id: 'a', text: 'Yes, it\'s strongly magnetic like iron', feedback: 'Incorrect. Aluminum cannot retain strong magnetization like iron, cobalt, or nickel.' },
        { id: 'b', text: 'No, it is paramagnetic and not ferromagnetic', feedback: 'Correct! Aluminum is paramagnetic, not ferromagnetic—its magnetic response is very weak and temporary.' },
        { id: 'c', text: 'Only when shaped in a paddle', feedback: 'False. Shape doesn\'t make it ferromagnetic.' },
        { id: 'd', text: 'Only if exposed to a strong current', feedback: 'False. Current doesn\'t make it ferromagnetic.' }
      ],
      correctOptionId: 'b',
      explanation: 'Aluminum is a paramagnetic material, meaning it has a very weak magnetic response and cannot retain magnetization like ferromagnetic materials (iron, nickel, cobalt). This property is intrinsic to aluminum\'s atomic structure.',
      difficulty: 'intermediate',
      tags: ['magnetic-materials', 'aluminum', 'ferromagnetism']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station3_q2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'When the solid aluminum paddle swings through the magnet\'s field, what is observed?',
      options: [
        { id: 'a', text: 'It swings freely with no change', feedback: 'Wrong. It clearly slows.' },
        { id: 'b', text: 'It slows dramatically due to eddy current braking', feedback: 'Correct! The solid paddle slows quickly because eddy currents are induced, generating opposing magnetic forces.' },
        { id: 'c', text: 'It speeds up because of attraction', feedback: 'Wrong. It does not accelerate.' },
        { id: 'd', text: 'It oscillates faster', feedback: 'False. Its motion is damped, not sped up.' }
      ],
      correctOptionId: 'b',
      explanation: 'As the conductive aluminum paddle moves through the magnetic field, the changing magnetic flux induces eddy currents within the paddle. These currents create their own magnetic fields that oppose the motion, causing electromagnetic braking.',
      difficulty: 'intermediate',
      tags: ['eddy-currents', 'electromagnetic-braking', 'aluminum-paddle']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station3_q3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'According to Faraday\'s and Lenz\'s Laws, why does the solid paddle slow down?',
      options: [
        { id: 'a', text: 'Magnetic field heats the paddle, increasing friction', feedback: 'Incorrect. Heat occurs, but not via friction with a surface.' },
        { id: 'b', text: 'Changing magnetic flux induces currents that oppose its motion', feedback: 'Correct! The changing flux in the conducting paddle induces circular eddy currents, which produce magnetic fields opposing the motion.' },
        { id: 'c', text: 'Gravity increases under magnetic influence', feedback: 'Irrelevant. Gravity is not affected by magnetic fields.' },
        { id: 'd', text: 'Magnetic field physically pushes the paddle away', feedback: 'Misrepresents Lenz\'s law—it\'s not a simple push but an electromagnetic braking.' }
      ],
      correctOptionId: 'b',
      explanation: 'Faraday\'s Law states that changing magnetic flux induces an emf. Lenz\'s Law states that this induced emf creates currents that oppose the change causing them. The eddy currents in the paddle create magnetic fields that oppose the paddle\'s motion through the external field.',
      difficulty: 'intermediate',
      tags: ['faraday-law', 'lenz-law', 'eddy-currents']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station3_q4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'Why is the comb paddle (with slots) much less affected than the solid paddle?',
      options: [
        { id: 'a', text: 'The slots make the paddle magnetic', feedback: 'False. The paddle isn\'t magnetic.' },
        { id: 'b', text: 'Slots break current loops, reducing eddy currents', feedback: 'Correct! Cutting slots interrupts current paths, greatly reducing induced eddy currents and thus braking.' },
        { id: 'c', text: 'It is lighter, so moves easier', feedback: 'Irrelevant. The key difference is in electrical continuity.' },
        { id: 'd', text: 'Has different magnetic permeability', feedback: 'Incorrect. Permeability of aluminum is uniform; it\'s conductivity that matters.' }
      ],
      correctOptionId: 'b',
      explanation: 'The slots in the comb paddle interrupt the paths that eddy currents would normally follow. With broken current loops, the induced currents are much smaller, resulting in much less electromagnetic braking force.',
      difficulty: 'intermediate',
      tags: ['eddy-currents', 'current-loops', 'electromagnetic-braking']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station3_q5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What would happen if a non-conductive plastic paddle were used instead?',
      options: [
        { id: 'a', text: 'It would behave like the solid paddle', feedback: 'Incorrect. It won\'t experience magnetic braking.' },
        { id: 'b', text: 'It would behave like the comb paddle', feedback: 'Incorrect. It won\'t experience magnetic braking.' },
        { id: 'c', text: 'It would pass unaffected through the field', feedback: 'Correct! No eddy currents can form in an insulator, so no electromagnetic damping occurs.' },
        { id: 'd', text: 'It would speed up due to no resistance', feedback: 'False. No magnetic effect means no extra acceleration either.' }
      ],
      correctOptionId: 'c',
      explanation: 'Eddy currents require a conductive material to form. In a non-conductive plastic paddle, no currents can be induced, so there is no electromagnetic interaction with the magnetic field. The paddle would swing normally as if the magnets weren\'t there.',
      difficulty: 'intermediate',
      tags: ['conductivity', 'insulators', 'eddy-currents']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Station 4: The vertical tubes

exports.course2_41_station4_q1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What does the slow descent of the magnet through the aluminum pipe indicate?',
      options: [
        { id: 'a', text: 'Aluminum is strongly ferromagnetic', feedback: 'False. Aluminum is not ferromagnetic—it doesn\'t attract magnets permanently.' },
        { id: 'b', text: 'The magnet is losing magnetism', feedback: 'Incorrect. The magnet retains its magnetic field.' },
        { id: 'c', text: 'Eddy currents in the pipe oppose the magnet\'s motion', feedback: 'Correct! The moving magnet induces eddy currents in the conductive aluminum pipe, which create opposing magnetic fields that slow the descent.' },
        { id: 'd', text: 'The magnet is electrically heating the pipe', feedback: 'Irrelevant. Electrical heating isn\'t involved in its descent.' }
      ],
      correctOptionId: 'c',
      explanation: 'As the magnet falls through the aluminum pipe, it creates a changing magnetic flux that induces eddy currents in the pipe walls. These currents produce magnetic fields that oppose the magnet\'s motion according to Lenz\'s Law, causing electromagnetic braking.',
      difficulty: 'intermediate',
      tags: ['eddy-currents', 'electromagnetic-braking', 'aluminum-tube']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station4_q2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'Which law explains why an emf is generated when the magnet moves through the pipe?',
      options: [
        { id: 'a', text: 'Ohm\'s Law', feedback: 'Unrelated to electromagnetic induction.' },
        { id: 'b', text: 'Faraday\'s Law of Induction', feedback: 'Correct! Moving magnet → changing magnetic flux through pipe walls → emf induced, per Faraday\'s Law.' },
        { id: 'c', text: 'Coulomb\'s Law', feedback: 'Unrelated to electromagnetic induction.' },
        { id: 'd', text: 'Hooke\'s Law', feedback: 'Unrelated to electromagnetic induction.' }
      ],
      correctOptionId: 'b',
      explanation: 'Faraday\'s Law of electromagnetic induction states that a changing magnetic flux through a conductor induces an electromotive force (emf). The moving magnet creates changing flux in the pipe walls, inducing an emf that drives the eddy currents.',
      difficulty: 'intermediate',
      tags: ['faraday-law', 'electromagnetic-induction', 'emf']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station4_q3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'According to Lenz\'s Law, how do the eddy currents affect the magnet\'s motion?',
      options: [
        { id: 'a', text: 'They accelerate the magnet downward', feedback: 'Incorrect. They oppose the motion.' },
        { id: 'b', text: 'They oppose the change in magnetic flux', feedback: 'Correct! Induced currents produce magnetic fields that oppose the motion (i.e., resist the changing flux).' },
        { id: 'c', text: 'They polarize the aluminum', feedback: 'Incorrect or irrelevant.' },
        { id: 'd', text: 'They convert the magnet into an electromagnet', feedback: 'Incorrect or irrelevant.' }
      ],
      correctOptionId: 'b',
      explanation: 'Lenz\'s Law states that induced currents flow in a direction that opposes the change causing them. The eddy currents create magnetic fields that oppose the magnet\'s motion, resulting in electromagnetic braking that slows the descent.',
      difficulty: 'intermediate',
      tags: ['lenz-law', 'eddy-currents', 'electromagnetic-opposition']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station4_q4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'Why does a non-magnetic steel ball fall through the same pipe faster than the magnet?',
      options: [
        { id: 'a', text: 'The pipe is magnetic and repels the steel', feedback: 'False. The pipe doesn\'t have magnetic properties that would repel steel.' },
        { id: 'b', text: 'The steel ball induces negligible eddy currents', feedback: 'Correct! Steel is conductive but has no changing flux, so minimal eddy currents form—no electromagnetic braking.' },
        { id: 'c', text: 'The steel ball is smaller', feedback: 'Size doesn\'t significantly affect descent time.' },
        { id: 'd', text: 'The magnet is heavier', feedback: 'Weight doesn\'t significantly affect descent time.' }
      ],
      correctOptionId: 'b',
      explanation: 'A non-magnetic steel ball doesn\'t create a changing magnetic flux as it falls, so very few eddy currents are induced in the pipe. Without significant eddy currents, there\'s no electromagnetic braking, allowing it to fall at nearly normal speed.',
      difficulty: 'intermediate',
      tags: ['magnetic-vs-nonmagnetic', 'eddy-currents', 'electromagnetic-braking']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

exports.course2_41_station4_q5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'What real-world application is best illustrated by this demonstration?',
      options: [
        { id: 'a', text: 'Solenoid operation in speaker', feedback: 'Speakers rely on the motor effect, not eddy current damping.' },
        { id: 'b', text: 'Magnetic braking systems in trains and roller-coasters', feedback: 'Correct! Magnetic braking uses eddy current damping between moving metal and magnetic fields.' },
        { id: 'c', text: 'Electric motors', feedback: 'Electric motors work on related principles but involve coils and power, not passive sliding.' },
        { id: 'd', text: 'Induction cooktops', feedback: 'Induction cooktops work on related principles but involve coils and power, not passive sliding.' }
      ],
      correctOptionId: 'b',
      explanation: 'Magnetic braking systems use the same principle: a moving conductor (train wheel/track) passing through magnetic fields induces eddy currents that create opposing forces, providing smooth, wear-free braking without physical contact.',
      difficulty: 'intermediate',
      tags: ['magnetic-braking', 'real-world-applications', 'eddy-currents']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});

// Assessment Configuration Mapping for Master Function
const assessmentConfigs = {
  'course2_41_station1_q1': {
    questions: [
      {
        questionText: 'What effect was observed when the current was switched on through the straight wire suspended between the magnets?',
        options: [
          { id: 'a', text: 'The wire remained stationary.', feedback: 'Incorrect. The wire clearly moved when current was on.' },
          { id: 'b', text: 'The wire moved perpendicular to both the current and magnetic field.', feedback: 'Correct! Motion was perpendicular to both current direction and magnetic field, as Fleming\'s left-hand rule predicts.' },
          { id: 'c', text: 'The wire moved parallel to the magnetic field.', feedback: 'Incorrect. No motion along the field direction is observed.' },
          { id: 'd', text: 'The wire rotated around its longitudinal axis.', feedback: 'Incorrect. The wire did not twist about its own axis but translated as a whole.' }
        ],
        correctOptionId: 'b',
        explanation: 'When a current-carrying conductor is placed in a magnetic field, it experiences a force perpendicular to both the current direction and the magnetic field direction. This is the fundamental principle of the motor effect.',
        difficulty: 'intermediate',
        tags: ['motor-effect', 'electromagnetism', 'fleming-rule']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q2': {
    questions: [
      {
        questionText: 'Using the open-palm (Fleming\'s) left-hand rule, what determines the direction of the force on the current-carrying wire?',
        options: [
          { id: 'a', text: 'Thumb = magnetic field, First finger = current, Second finger = force', feedback: 'Incorrect. This mixes up the roles assigned to each finger.' },
          { id: 'b', text: 'Thumb = current, First finger = force, Second finger = magnetic field', feedback: 'Incorrect. This places the current on the thumb, which is incorrect.' },
          { id: 'c', text: 'Thumb = force, First finger = magnetic field, Second finger = current', feedback: 'Correct! The arrangement is Thumb → Force (Motion), First finger → Field, Second finger → Current.' },
          { id: 'd', text: 'Thumb = magnetic field, First finger = force, Second finger = current', feedback: 'Incorrect. This mixes up the roles assigned to each finger.' }
        ],
        correctOptionId: 'c',
        explanation: 'Fleming\'s left-hand rule uses the thumb for force/motion direction, the first finger for magnetic field direction, and the second finger for current direction. All three are mutually perpendicular.',
        difficulty: 'intermediate',
        tags: ['fleming-rule', 'motor-effect', 'electromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q3': {
    questions: [
      {
        questionText: 'What would happen to the direction of the wire\'s movement if the current direction in the wire were reversed?',
        options: [
          { id: 'a', text: 'The wire would move in the same direction.', feedback: 'Incorrect. Motion direction always flips with current reversal.' },
          { id: 'b', text: 'The wire would not move at all.', feedback: 'Incorrect. The wire continues to move.' },
          { id: 'c', text: 'The wire would move in the opposite direction.', feedback: 'Correct! Reversing current (keeping the magnetic field constant) reverses the force direction per Fleming\'s left-hand rule.' },
          { id: 'd', text: 'The wire would rotate instead of translating.', feedback: 'Incorrect. It still translates, not rotates.' }
        ],
        correctOptionId: 'c',
        explanation: 'According to Fleming\'s left-hand rule, reversing the current direction while keeping the magnetic field constant will reverse the direction of the force, causing the wire to move in the opposite direction.',
        difficulty: 'intermediate',
        tags: ['motor-effect', 'current-reversal', 'electromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q4': {
    questions: [
      {
        questionText: 'When neodymium magnets are used instead of weaker steel magnets, what change occurs in the motor effect?',
        options: [
          { id: 'a', text: 'No change in force magnitude.', feedback: 'Incorrect. The field strength directly affects force magnitude.' },
          { id: 'b', text: 'The force increases due to a stronger magnetic field.', feedback: 'Correct! Stronger magnets create a stronger magnetic field, thus increase the magnetic force on the current-carrying wire.' },
          { id: 'c', text: 'The wire stops moving.', feedback: 'Incorrect. The circuit still operates normally.' },
          { id: 'd', text: 'The force direction reverses.', feedback: 'Incorrect. The magnetic field direction (not polarity) determines force direction.' }
        ],
        correctOptionId: 'b',
        explanation: 'The force on a current-carrying conductor in a magnetic field is proportional to the magnetic field strength. Neodymium magnets produce stronger fields than steel magnets, resulting in a greater force.',
        difficulty: 'intermediate',
        tags: ['magnetic-field-strength', 'motor-effect', 'neodymium-magnets']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q5': {
    questions: [
      {
        questionText: 'How can this demonstration be used to explain the "motor effect" in devices like speakers?',
        options: [
          { id: 'a', text: 'It shows how current produces a stationary magnetic field.', feedback: 'Partially true but misses the motion aspect.' },
          { id: 'b', text: 'It shows current in a magnet builds up over time.', feedback: 'Irrelevant—current doesn\'t accumulate in this context.' },
          { id: 'c', text: 'It shows how current and magnets interact to produce motion, which makes speaker cones vibrate.', feedback: 'Correct! The demonstration illustrates that current in the presence of a magnet produces force and movement—this same principle causes speaker cones and coil assemblies to vibrate, creating sound.' },
          { id: 'd', text: 'It shows how alternating current causes rotation, not motion.', feedback: 'Wrongly suggests rotational motion and misses the linear vibration used in speakers.' }
        ],
        correctOptionId: 'c',
        explanation: 'Speakers use the motor effect by passing an audio signal (varying current) through a coil attached to the speaker cone. This coil sits in a permanent magnetic field, causing it to move back and forth as the current changes, producing sound waves.',
        difficulty: 'intermediate',
        tags: ['motor-effect-applications', 'speakers', 'electromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station2_q1': {
    questions: [
      {
        questionText: 'What does the galvanometer in the demonstration primarily indicate?',
        options: [
          { id: 'a', text: 'The magnetic field strength inside the solenoid', feedback: 'Incorrect. It shows current, not field strength.' },
          { id: 'b', text: 'The direction and magnitude of induced current', feedback: 'Correct! The galvanometer detects and displays the induced current flowing through the solenoid circuit.' },
          { id: 'c', text: 'The speed at which the magnet is moving', feedback: 'Misleading. While deflection depends on speed, it\'s not a direct speed measure.' },
          { id: 'd', text: 'The polarity of the magnet', feedback: 'Wrong. Galvanometer doesn\'t reveal magnet polarity, only current direction.' }
        ],
        correctOptionId: 'b',
        explanation: 'A galvanometer is an instrument that detects and measures small electric currents. In this demonstration, it shows both the magnitude (by how far the needle deflects) and direction (which way it deflects) of the induced current.',
        difficulty: 'intermediate',
        tags: ['electromagnetic-induction', 'galvanometer', 'solenoids']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station3_q1': {
    questions: [
      {
        questionText: 'Is aluminum ferromagnetic?',
        options: [
          { id: 'a', text: 'Yes, it\'s strongly magnetic like iron', feedback: 'Incorrect. Aluminum cannot retain strong magnetization like iron, cobalt, or nickel.' },
          { id: 'b', text: 'No, it is paramagnetic and not ferromagnetic', feedback: 'Correct! Aluminum is paramagnetic, not ferromagnetic—its magnetic response is very weak and temporary.' },
          { id: 'c', text: 'Only when shaped in a paddle', feedback: 'False. Shape doesn\'t make it ferromagnetic.' },
          { id: 'd', text: 'Only if exposed to a strong current', feedback: 'False. Current doesn\'t make it ferromagnetic.' }
        ],
        correctOptionId: 'b',
        explanation: 'Aluminum is a paramagnetic material, meaning it has a very weak magnetic response and cannot retain magnetization like ferromagnetic materials (iron, nickel, cobalt). This property is intrinsic to aluminum\'s atomic structure.',
        difficulty: 'intermediate',
        tags: ['magnetic-materials', 'aluminum', 'ferromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station4_q1': {
    questions: [
      {
        questionText: 'What does the slow descent of the magnet through the aluminum pipe indicate?',
        options: [
          { id: 'a', text: 'Aluminum is strongly ferromagnetic', feedback: 'False. Aluminum is not ferromagnetic—it doesn\'t attract magnets permanently.' },
          { id: 'b', text: 'The magnet is losing magnetism', feedback: 'Incorrect. The magnet retains its magnetic field.' },
          { id: 'c', text: 'Eddy currents in the pipe oppose the magnet\'s motion', feedback: 'Correct! The moving magnet induces eddy currents in the conductive aluminum pipe, which create opposing magnetic fields that slow the descent.' },
          { id: 'd', text: 'The magnet is electrically heating the pipe', feedback: 'Irrelevant. Electrical heating isn\'t involved in its descent.' }
        ],
        correctOptionId: 'c',
        explanation: 'As the magnet falls through the aluminum pipe, it creates a changing magnetic flux that induces eddy currents in the pipe walls. These currents produce magnetic fields that oppose the magnet\'s motion according to Lenz\'s Law, causing electromagnetic braking.',
        difficulty: 'intermediate',
        tags: ['eddy-currents', 'electromagnetic-braking', 'aluminum-tube']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q2': {
    questions: [
      {
        questionText: 'Using the open-palm (Fleming\'s) left-hand rule, what determines the direction of the force on the current-carrying wire?',
        options: [
          { id: 'a', text: 'Thumb = magnetic field, First finger = current, Second finger = force', feedback: 'Incorrect. This mixes up the roles assigned to each finger.' },
          { id: 'b', text: 'Thumb = current, First finger = force, Second finger = magnetic field', feedback: 'Incorrect. This places the current on the thumb, which is incorrect.' },
          { id: 'c', text: 'Thumb = force, First finger = magnetic field, Second finger = current', feedback: 'Correct! The arrangement is Thumb → Force (Motion), First finger → Field, Second finger → Current.' },
          { id: 'd', text: 'Thumb = magnetic field, First finger = force, Second finger = current', feedback: 'Incorrect. This mixes up the roles assigned to each finger.' }
        ],
        correctOptionId: 'c',
        explanation: 'Fleming\'s left-hand rule uses the thumb for force/motion direction, the first finger for magnetic field direction, and the second finger for current direction. All three are mutually perpendicular.',
        difficulty: 'intermediate',
        tags: ['fleming-rule', 'motor-effect', 'electromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q3': {
    questions: [
      {
        questionText: 'What would happen to the direction of the wire\'s movement if the current direction in the wire were reversed?',
        options: [
          { id: 'a', text: 'The wire would move in the same direction.', feedback: 'Incorrect. Motion direction always flips with current reversal.' },
          { id: 'b', text: 'The wire would not move at all.', feedback: 'Incorrect. The wire continues to move.' },
          { id: 'c', text: 'The wire would move in the opposite direction.', feedback: 'Correct! Reversing current (keeping the magnetic field constant) reverses the force direction per Fleming\'s left-hand rule.' },
          { id: 'd', text: 'The wire would rotate instead of translating.', feedback: 'Incorrect. It still translates, not rotates.' }
        ],
        correctOptionId: 'c',
        explanation: 'According to Fleming\'s left-hand rule, reversing the current direction while keeping the magnetic field constant will reverse the direction of the force, causing the wire to move in the opposite direction.',
        difficulty: 'intermediate',
        tags: ['motor-effect', 'current-reversal', 'electromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q4': {
    questions: [
      {
        questionText: 'When neodymium magnets are used instead of weaker steel magnets, what change occurs in the motor effect?',
        options: [
          { id: 'a', text: 'No change in force magnitude.', feedback: 'Incorrect. The field strength directly affects force magnitude.' },
          { id: 'b', text: 'The force increases due to a stronger magnetic field.', feedback: 'Correct! Stronger magnets create a stronger magnetic field, thus increase the magnetic force on the current-carrying wire.' },
          { id: 'c', text: 'The wire stops moving.', feedback: 'Incorrect. The circuit still operates normally.' },
          { id: 'd', text: 'The force direction reverses.', feedback: 'Incorrect. The magnetic field direction (not polarity) determines force direction.' }
        ],
        correctOptionId: 'b',
        explanation: 'The force on a current-carrying conductor in a magnetic field is proportional to the magnetic field strength. Neodymium magnets produce stronger fields than steel magnets, resulting in a greater force.',
        difficulty: 'intermediate',
        tags: ['magnetic-field-strength', 'motor-effect', 'neodymium-magnets']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station1_q5': {
    questions: [
      {
        questionText: 'How can this demonstration be used to explain the "motor effect" in devices like speakers?',
        options: [
          { id: 'a', text: 'It shows how current produces a stationary magnetic field.', feedback: 'Partially true but misses the motion aspect.' },
          { id: 'b', text: 'It shows current in a magnet builds up over time.', feedback: 'Irrelevant—current doesn\'t accumulate in this context.' },
          { id: 'c', text: 'It shows how current and magnets interact to produce motion, which makes speaker cones vibrate.', feedback: 'Correct! The demonstration illustrates that current in the presence of a magnet produces force and movement—this same principle causes speaker cones and coil assemblies to vibrate, creating sound.' },
          { id: 'd', text: 'It shows how alternating current causes rotation, not motion.', feedback: 'Wrongly suggests rotational motion and misses the linear vibration used in speakers.' }
        ],
        correctOptionId: 'c',
        explanation: 'Speakers use the motor effect by passing an audio signal (varying current) through a coil attached to the speaker cone. This coil sits in a permanent magnetic field, causing it to move back and forth as the current changes, producing sound waves.',
        difficulty: 'intermediate',
        tags: ['motor-effect-applications', 'speakers', 'electromagnetism']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station2_q2': {
    questions: [
      {
        questionText: 'What happens when the magnet is pushed into the solenoid?',
        options: [
          { id: 'a', text: 'Needle jumps one way, then returns to zero when held still', feedback: 'Correct! The needle deflects during motion (when flux is changing) but returns to zero when the magnet stops moving.' },
          { id: 'b', text: 'Needle stays deflected while magnet is in place', feedback: 'Wrong. Deflection stops when flux change ceases.' },
          { id: 'c', text: 'No needle deflection at all', feedback: 'Contradicts the observed induced emf upon movement.' },
          { id: 'd', text: 'Needle continually increases its deflection', feedback: 'False. Deflection is momentary, not continuous increase.' }
        ],
        correctOptionId: 'a',
        explanation: 'When the magnet moves into the solenoid, the changing magnetic flux induces an emf (and current) causing the galvanometer needle to deflect. Once the magnet stops moving, the flux becomes constant, the induced emf drops to zero, and the needle returns to its neutral position.',
        difficulty: 'intermediate',
        tags: ['electromagnetic-induction', 'faraday-law', 'changing-flux']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station2_q3': {
    questions: [
      {
        questionText: 'What occurs when the magnet is pulled out of the solenoid?',
        options: [
          { id: 'a', text: 'Needle deflects in same direction as when pushing in', feedback: 'Misstates Lenz\'s Law: reversal of flux change reverses induced current.' },
          { id: 'b', text: 'Needle deflects in opposite direction', feedback: 'Correct! According to Lenz\'s Law, the induced current opposes the change, so pulling out causes opposite deflection.' },
          { id: 'c', text: 'Needle doesn\'t move', feedback: 'False. Any change in flux causes deflection.' },
          { id: 'd', text: 'Needle moves erratically', feedback: 'Incorrect. Direction is consistent and opposite, not erratic.' }
        ],
        correctOptionId: 'b',
        explanation: 'When the magnet is pulled out, the magnetic flux through the solenoid decreases (opposite of insertion). By Lenz\'s Law, the induced current creates a magnetic field to oppose this change, resulting in current flow in the opposite direction compared to insertion.',
        difficulty: 'intermediate',
        tags: ['lenz-law', 'electromagnetic-induction', 'flux-direction']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station2_q4': {
    questions: [
      {
        questionText: 'According to Faraday\'s Law, why does moving the magnet in and out of the solenoid cause the galvanometer to deflect?',
        options: [
          { id: 'a', text: 'Because the magnet heats the solenoid, generating current', feedback: 'Incorrect. Heat isn\'t involved here.' },
          { id: 'b', text: 'A changing magnetic flux induces an emf and hence current', feedback: 'Correct! Faraday\'s Law states that a changing magnetic flux through a circuit induces an electromotive force (emf).' },
          { id: 'c', text: 'Mechanical vibration from movement powers the circuit', feedback: 'Wrong. No mechanical contact generates electricity.' },
          { id: 'd', text: 'Electric charges are pushed out by the magnet\'s field', feedback: 'False. It\'s flux change, not direct charge push, that induces emf.' }
        ],
        correctOptionId: 'b',
        explanation: 'Faraday\'s Law of electromagnetic induction states that the induced emf in a circuit is proportional to the rate of change of magnetic flux through the circuit. Moving the magnet changes the flux, inducing an emf that drives current through the galvanometer.',
        difficulty: 'intermediate',
        tags: ['faraday-law', 'electromagnetic-induction', 'magnetic-flux']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station2_q5': {
    questions: [
      {
        questionText: 'If the magnet is held stationary inside the solenoid, what will the galvanometer indicate?',
        options: [
          { id: 'a', text: 'A steady deflection', feedback: 'Wrong. No flux change means no induced current.' },
          { id: 'b', text: 'No deflection', feedback: 'Correct! Without change in magnetic flux, there is no induced emf or current, so the galvanometer shows zero.' },
          { id: 'c', text: 'Random fluctuations', feedback: 'False. Without change, needle remains still.' },
          { id: 'd', text: 'A gradually increasing deflection', feedback: 'Wrong. No flux change means no induced current.' }
        ],
        correctOptionId: 'b',
        explanation: 'Electromagnetic induction requires a changing magnetic flux. When the magnet is stationary, the magnetic flux through the solenoid remains constant, resulting in zero induced emf and no current flow. The galvanometer needle stays at zero.',
        difficulty: 'intermediate',
        tags: ['electromagnetic-induction', 'constant-flux', 'no-current']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station3_q2': {
    questions: [
      {
        questionText: 'When the solid aluminum paddle swings through the magnet\'s field, what is observed?',
        options: [
          { id: 'a', text: 'It swings freely with no change', feedback: 'Wrong. It clearly slows.' },
          { id: 'b', text: 'It slows dramatically due to eddy current braking', feedback: 'Correct! The solid paddle slows quickly because eddy currents are induced, generating opposing magnetic forces.' },
          { id: 'c', text: 'It speeds up because of attraction', feedback: 'Wrong. It does not accelerate.' },
          { id: 'd', text: 'It oscillates faster', feedback: 'False. Its motion is damped, not sped up.' }
        ],
        correctOptionId: 'b',
        explanation: 'As the conductive aluminum paddle moves through the magnetic field, the changing magnetic flux induces eddy currents within the paddle. These currents create their own magnetic fields that oppose the motion, causing electromagnetic braking.',
        difficulty: 'intermediate',
        tags: ['eddy-currents', 'electromagnetic-braking', 'aluminum-paddle']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station3_q3': {
    questions: [
      {
        questionText: 'According to Faraday\'s and Lenz\'s Laws, why does the solid paddle slow down?',
        options: [
          { id: 'a', text: 'Magnetic field heats the paddle, increasing friction', feedback: 'Incorrect. Heat occurs, but not via friction with a surface.' },
          { id: 'b', text: 'Changing magnetic flux induces currents that oppose its motion', feedback: 'Correct! The changing flux in the conducting paddle induces circular eddy currents, which produce magnetic fields opposing the motion.' },
          { id: 'c', text: 'Gravity increases under magnetic influence', feedback: 'Irrelevant. Gravity is not affected by magnetic fields.' },
          { id: 'd', text: 'Magnetic field physically pushes the paddle away', feedback: 'Misrepresents Lenz\'s law—it\'s not a simple push but an electromagnetic braking.' }
        ],
        correctOptionId: 'b',
        explanation: 'Faraday\'s Law states that changing magnetic flux induces an emf. Lenz\'s Law states that this induced emf creates currents that oppose the change causing them. The eddy currents in the paddle create magnetic fields that oppose the paddle\'s motion through the external field.',
        difficulty: 'intermediate',
        tags: ['faraday-law', 'lenz-law', 'eddy-currents']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station3_q4': {
    questions: [
      {
        questionText: 'Why is the comb paddle (with slots) much less affected than the solid paddle?',
        options: [
          { id: 'a', text: 'The slots make the paddle magnetic', feedback: 'False. The paddle isn\'t magnetic.' },
          { id: 'b', text: 'Slots break current loops, reducing eddy currents', feedback: 'Correct! Cutting slots interrupts current paths, greatly reducing induced eddy currents and thus braking.' },
          { id: 'c', text: 'It is lighter, so moves easier', feedback: 'Irrelevant. The key difference is in electrical continuity.' },
          { id: 'd', text: 'Has different magnetic permeability', feedback: 'Incorrect. Permeability of aluminum is uniform; it\'s conductivity that matters.' }
        ],
        correctOptionId: 'b',
        explanation: 'The slots in the comb paddle interrupt the paths that eddy currents would normally follow. With broken current loops, the induced currents are much smaller, resulting in much less electromagnetic braking force.',
        difficulty: 'intermediate',
        tags: ['eddy-currents', 'current-loops', 'electromagnetic-braking']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station3_q5': {
    questions: [
      {
        questionText: 'What would happen if a non-conductive plastic paddle were used instead?',
        options: [
          { id: 'a', text: 'It would behave like the solid paddle', feedback: 'Incorrect. It won\'t experience magnetic braking.' },
          { id: 'b', text: 'It would behave like the comb paddle', feedback: 'Incorrect. It won\'t experience magnetic braking.' },
          { id: 'c', text: 'It would pass unaffected through the field', feedback: 'Correct! No eddy currents can form in an insulator, so no electromagnetic damping occurs.' },
          { id: 'd', text: 'It would speed up due to no resistance', feedback: 'False. No magnetic effect means no extra acceleration either.' }
        ],
        correctOptionId: 'c',
        explanation: 'Eddy currents require a conductive material to form. In a non-conductive plastic paddle, no currents can be induced, so there is no electromagnetic interaction with the magnetic field. The paddle would swing normally as if the magnets weren\'t there.',
        difficulty: 'intermediate',
        tags: ['conductivity', 'insulators', 'eddy-currents']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station4_q2': {
    questions: [
      {
        questionText: 'Which law explains why an emf is generated when the magnet moves through the pipe?',
        options: [
          { id: 'a', text: 'Ohm\'s Law', feedback: 'Unrelated to electromagnetic induction.' },
          { id: 'b', text: 'Faraday\'s Law of Induction', feedback: 'Correct! Moving magnet → changing magnetic flux through pipe walls → emf induced, per Faraday\'s Law.' },
          { id: 'c', text: 'Coulomb\'s Law', feedback: 'Unrelated to electromagnetic induction.' },
          { id: 'd', text: 'Hooke\'s Law', feedback: 'Unrelated to electromagnetic induction.' }
        ],
        correctOptionId: 'b',
        explanation: 'Faraday\'s Law of electromagnetic induction states that a changing magnetic flux through a conductor induces an electromotive force (emf). The moving magnet creates changing flux in the pipe walls, inducing an emf that drives the eddy currents.',
        difficulty: 'intermediate',
        tags: ['faraday-law', 'electromagnetic-induction', 'emf']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station4_q3': {
    questions: [
      {
        questionText: 'According to Lenz\'s Law, how do the eddy currents affect the magnet\'s motion?',
        options: [
          { id: 'a', text: 'They accelerate the magnet downward', feedback: 'Incorrect. They oppose the motion.' },
          { id: 'b', text: 'They oppose the change in magnetic flux', feedback: 'Correct! Induced currents produce magnetic fields that oppose the motion (i.e., resist the changing flux).' },
          { id: 'c', text: 'They polarize the aluminum', feedback: 'Incorrect or irrelevant.' },
          { id: 'd', text: 'They convert the magnet into an electromagnet', feedback: 'Incorrect or irrelevant.' }
        ],
        correctOptionId: 'b',
        explanation: 'Lenz\'s Law states that induced currents flow in a direction that opposes the change causing them. The eddy currents create magnetic fields that oppose the magnet\'s motion, resulting in electromagnetic braking that slows the descent.',
        difficulty: 'intermediate',
        tags: ['lenz-law', 'eddy-currents', 'electromagnetic-opposition']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station4_q4': {
    questions: [
      {
        questionText: 'Why does a non-magnetic steel ball fall through the same pipe faster than the magnet?',
        options: [
          { id: 'a', text: 'The pipe is magnetic and repels the steel', feedback: 'False. The pipe doesn\'t have magnetic properties that would repel steel.' },
          { id: 'b', text: 'The steel ball induces negligible eddy currents', feedback: 'Correct! Steel is conductive but has no changing flux, so minimal eddy currents form—no electromagnetic braking.' },
          { id: 'c', text: 'The steel ball is smaller', feedback: 'Size doesn\'t significantly affect descent time.' },
          { id: 'd', text: 'The magnet is heavier', feedback: 'Weight doesn\'t significantly affect descent time.' }
        ],
        correctOptionId: 'b',
        explanation: 'A non-magnetic steel ball doesn\'t create a changing magnetic flux as it falls, so very few eddy currents are induced in the pipe. Without significant eddy currents, there\'s no electromagnetic braking, allowing it to fall at nearly normal speed.',
        difficulty: 'intermediate',
        tags: ['magnetic-vs-nonmagnetic', 'eddy-currents', 'electromagnetic-braking']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  },
  'course2_41_station4_q5': {
    questions: [
      {
        questionText: 'What real-world application is best illustrated by this demonstration?',
        options: [
          { id: 'a', text: 'Solenoid operation in speaker', feedback: 'Speakers rely on the motor effect, not eddy current damping.' },
          { id: 'b', text: 'Magnetic braking systems in trains and roller-coasters', feedback: 'Correct! Magnetic braking uses eddy current damping between moving metal and magnetic fields.' },
          { id: 'c', text: 'Electric motors', feedback: 'Electric motors work on related principles but involve coils and power, not passive sliding.' },
          { id: 'd', text: 'Induction cooktops', feedback: 'Induction cooktops work on related principles but involve coils and power, not passive sliding.' }
        ],
        correctOptionId: 'b',
        explanation: 'Magnetic braking systems use the same principle: a moving conductor (train wheel/track) passing through magnetic fields induces eddy currents that create opposing forces, providing smooth, wear-free braking without physical contact.',
        difficulty: 'intermediate',
        tags: ['magnetic-braking', 'real-world-applications', 'eddy-currents']
      }
    ],
    randomizeQuestions: false,
    randomizeOptions: true,
    allowSameQuestion: true,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true
  }
};

exports.assessmentConfigs = assessmentConfigs;

// All stations complete!