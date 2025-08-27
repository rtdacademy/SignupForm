/**
 * Assessment Functions for Impulse and Momentum Change
 * Course: 2 (Physics 30)
 * Content: 04-impulse-momentum-change
 * 
 * This module provides assessments for impulse-momentum theorem concepts
 * using the shared assessment system with Physics 30 specific configuration.
 */


// Removed dependency on config file - settings are now handled directly in assessment configurations

// ===== HELPER FUNCTIONS FOR RANDOMIZATION =====
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

// ===== IMPULSE AND MOMENTUM PRACTICE PROBLEMS SET 1 =====

// Question 1: Basic impulse calculation
const createBasicImpulseQuestion = () => {
  const mass = randFloat(2.0, 3.0, 1); // Mass: 2.0-3.0 kg
  const v_initial = randFloat(4.5, 5.5, 1); // Initial velocity: 4.5-5.5 m/s north
  const time = randFloat(0.70, 0.80, 2); // Time: 0.70-0.80 s
  
  // Final velocity is 0 (brought to stop)
  const v_final = 0;
  
  // Calculate impulse using momentum change
  const delta_p = mass * (v_final - v_initial); // Negative because stopping
  const impulse_magnitude = Math.abs(delta_p);
  
  // Calculate required force
  const force_required = Math.abs(delta_p / time);
  
  // Create distractors
  const wrong_impulse1 = parseFloat((impulse_magnitude * 1.1).toFixed(1));
  const wrong_impulse2 = parseFloat((impulse_magnitude * 0.9).toFixed(1));
  const wrong_force = parseFloat((force_required * 1.15).toFixed(1));
  
  return {
    questionText: `A ${mass} kg object is initially moving north at ${v_initial} m/s. If it is brought to a stop in ${time} s: A. What is the impulse? B. What is the force required?`,
    options: [
      { id: 'a', text: `Impulse: ${impulse_magnitude.toFixed(1)} N·s [S]; Force: ${force_required.toFixed(1)} N [S]`, feedback: `Correct! Impulse = Δp = m(v_f - v_i) = ${mass}(0 - ${v_initial}) = ${delta_p.toFixed(1)} N·s. Magnitude: ${impulse_magnitude.toFixed(1)} N·s [S]. Force = J/Δt = ${impulse_magnitude.toFixed(1)}/${time} = ${force_required.toFixed(1)} N [S]` },
      { id: 'b', text: `Impulse: ${wrong_impulse1} N·s [S]; Force: ${force_required.toFixed(1)} N [S]`, feedback: "Check your impulse calculation. Use J = m(v_f - v_i) = mΔv." },
      { id: 'c', text: `Impulse: ${impulse_magnitude.toFixed(1)} N·s [S]; Force: ${wrong_force} N [S]`, feedback: "Your impulse is correct, but check your force calculation using F = J/Δt." },
      { id: 'd', text: `Impulse: ${wrong_impulse2} N·s [S]; Force: ${force_required.toFixed(1)} N [S]`, feedback: "Your force is correct, but verify your impulse calculation from the momentum change." }
    ],
    correctOptionId: 'a',
    explanation: `Impulse-momentum theorem: J = Δp = m(v_f - v_i) = ${mass}(0 - ${v_initial}) = ${delta_p.toFixed(1)} N·s. Direction is south (opposite to motion). Average force: F = J/Δt = ${impulse_magnitude.toFixed(1)}/${time} = ${force_required.toFixed(1)} N [S]`,
    difficulty: "intermediate",
    topic: "Basic Impulse Calculation"
  };
};



// Question 2: Person falling and landing
const createPersonFallingQuestion = () => {
  const mass = randFloat(70, 80, 0); // Person mass: 70-80 kg
  const height = randFloat(1.8, 2.2, 1); // Fall height: 1.8-2.2 m
  const stop_time = randFloat(0.6, 0.8, 2); // Stopping time: 0.6-0.8 s
  
  // Calculate velocity just before hitting bed using v = √(2gh)
  const g = 9.8; // m/s²
  const v_before_bed = Math.sqrt(2 * g * height);
  
  // Change in momentum (from v to 0)
  const delta_p = mass * (0 - v_before_bed); // Negative (upward impulse)
  const impulse_magnitude = Math.abs(delta_p);
  
  // Average force from bed
  const force_bed = Math.abs(delta_p / stop_time);
  
  // Create distractors
  const wrong_impulse = parseFloat((impulse_magnitude * 1.1).toFixed(0));
  const wrong_force = parseFloat((force_bed * 0.9).toFixed(0));
  const wrong_delta_p = parseFloat((mass * Math.sqrt(2 * g * (height + 0.5))).toFixed(0));
  
  return {
    questionText: `A ${mass} kg person falls from a height of ${height} m. If the person lands on a bed, what is the change in momentum? What is the impulse? If the stopping time was ${stop_time} s, what average force did the bed apply on the person?`,
    options: [
      { id: 'a', text: `Δp = ${impulse_magnitude.toFixed(0)} kg·m/s [up]; J = ${impulse_magnitude.toFixed(0)} N·s [up]; F = ${force_bed.toFixed(0)} N [up]`, feedback: `Correct! Velocity before bed: v = √(2gh) = √(2×9.8×${height}) = ${v_before_bed.toFixed(1)} m/s. Change in momentum: Δp = ${mass}(0 - ${v_before_bed.toFixed(1)}) = ${delta_p.toFixed(0)} kg·m/s. Force: F = J/Δt = ${impulse_magnitude.toFixed(0)}/${stop_time} = ${force_bed.toFixed(0)} N [up]` },
      { id: 'b', text: `Δp = ${wrong_impulse} kg·m/s [up]; J = ${wrong_impulse} N·s [up]; F = ${force_bed.toFixed(0)} N [up]`, feedback: "Check your velocity calculation using v = √(2gh) for free fall." },
      { id: 'c', text: `Δp = ${impulse_magnitude.toFixed(0)} kg·m/s [up]; J = ${impulse_magnitude.toFixed(0)} N·s [up]; F = ${wrong_force} N [up]`, feedback: "Your momentum change is correct, but check your force calculation using F = J/Δt." },
      { id: 'd', text: `Δp = ${wrong_delta_p} kg·m/s [up]; J = ${wrong_delta_p} N·s [up]; F = ${force_bed.toFixed(0)} N [up]`, feedback: "Check your free fall velocity calculation. Use v = √(2gh) where h is the actual fall height." }
    ],
    correctOptionId: 'a',
    explanation: `Free fall velocity: v = √(2gh) = √(2×9.8×${height}) = ${v_before_bed.toFixed(1)} m/s. Momentum change: Δp = m(v_f - v_i) = ${mass}(0 - ${v_before_bed.toFixed(1)}) = ${delta_p.toFixed(0)} kg·m/s [up]. Average bed force: F = |Δp|/Δt = ${impulse_magnitude.toFixed(0)}/${stop_time} = ${force_bed.toFixed(0)} N [up]`,
    difficulty: "intermediate",
    topic: "Person Falling and Landing"
  };
};


// Question 4: Quantities used to calculate impulse
const createImpulseQuantitiesQuestion = () => {
  const concepts = [
    {
      question: "What quantities are used to calculate impulse using the fundamental definition?",
      correct: "Force and time interval",
      options: ["Force and time interval", "Mass and velocity change", "Force and displacement", "Mass and acceleration"],
      explanation: "Impulse is fundamentally defined as J = F·Δt (force × time interval). While J = Δp = mΔv is equivalent, the basic definition uses force and time."
    },
    {
      question: "What quantities are used to calculate impulse using the impulse-momentum theorem?",
      correct: "Mass and velocity change", 
      options: ["Mass and velocity change", "Force and time interval", "Force and acceleration", "Mass and displacement"],
      explanation: "The impulse-momentum theorem states J = Δp = mΔv. This relates impulse to mass and the change in velocity."
    },
    {
      question: "Which combination of quantities can be used to determine impulse in a collision problem?",
      correct: "Either force×time or mass×velocity change",
      options: ["Either force×time or mass×velocity change", "Only force and time", "Only mass and velocity", "Force and displacement"],
      explanation: "Both J = F·Δt and J = mΔv are valid. In problems, we often use whichever quantities are given or easier to determine."
    }
  ];
  
  const selected = concepts[Math.floor(Math.random() * concepts.length)];
  
  return {
    questionText: selected.question,
    options: selected.options.map((option, index) => ({
      id: ['a', 'b', 'c', 'd'][index],
      text: option,
      feedback: option === selected.correct ? 
        `Correct! ${selected.explanation}` : 
        `Incorrect. ${selected.explanation}`
    })),
    correctOptionId: ['a', 'b', 'c', 'd'][selected.options.indexOf(selected.correct)],
    explanation: selected.explanation,
    difficulty: "beginner",
    topic: "Impulse Calculation Methods"
  };
};


// Question 5: Karate board breaking
const createKarateBoardQuestion = () => {
  const explanations = [
    {
      concept: "How can a karate expert break a board using impulse principles?",
      correct: "By applying a large force over a very short time interval",
      options: [
        "By applying a large force over a very short time interval",
        "By applying a small force over a long time interval", 
        "By moving their hand very slowly through the board",
        "By increasing the mass of their hand"
      ],
      detail: "J = F·Δt. To deliver a large impulse (needed to break the board), a karate expert maximizes force while minimizing contact time. The large force over short time creates enough impulse to change the board's momentum dramatically, causing it to break."
    },
    {
      concept: "What principle explains why a karate chop can break a board but a slow push cannot?",
      correct: "Large force in short time creates greater impulse than small force over long time",
      options: [
        "Large force in short time creates greater impulse than small force over long time",
        "The hand has more kinetic energy when moving fast",
        "The board becomes weaker when hit quickly",
        "Slow pushes don't transfer any momentum"
      ],
      detail: "While both deliver impulse, J = F·Δt shows that a very large force over a short time can deliver the same or greater impulse than a small force over long time. The peak force in a karate chop exceeds the board's breaking strength."
    }
  ];
  
  const selected = explanations[Math.floor(Math.random() * explanations.length)];
  
  return {
    questionText: selected.concept,
    options: selected.options.map((option, index) => ({
      id: ['a', 'b', 'c', 'd'][index],
      text: option,
      feedback: option === selected.correct ? 
        `Correct! ${selected.detail}` : 
        `Incorrect. ${selected.detail}`
    })),
    correctOptionId: ['a', 'b', 'c', 'd'][selected.options.indexOf(selected.correct)],
    explanation: selected.detail,
    difficulty: "intermediate",
    topic: "Karate Board Breaking Physics"
  };
};



// Question 6: Safety features (seat belts and headrests)
const createSafetyFeaturesQuestion = () => {
  const safetyTopics = [
    {
      question: "How do seat belts save lives using impulse and momentum principles?",
      correct: "They increase collision time, reducing the average force on passengers",
      options: [
        "They increase collision time, reducing the average force on passengers",
        "They decrease the momentum change during collision",
        "They increase the impulse delivered to passengers", 
        "They prevent any momentum change from occurring"
      ],
      explanation: "J = F·Δt = Δp. Since momentum change (Δp) is fixed by the collision, increasing the time (Δt) through seat belt stretch reduces the average force (F) on the passenger, preventing serious injury."
    },
    {
      question: "What is the physics principle behind headrest design in preventing whiplash?",
      correct: "Headrests reduce the time difference between torso and head acceleration",
      options: [
        "Headrests reduce the time difference between torso and head acceleration",
        "Headrests increase the momentum of the head during collision",
        "Headrests prevent any force from acting on the neck",
        "Headrests reduce the mass of the head effectively"
      ],
      explanation: "In rear-end collisions, the torso accelerates forward first while the head lags behind, straining the neck. Properly positioned headrests ensure the head accelerates with the torso, minimizing relative motion and reducing neck injury."
    },
    {
      question: "Why are airbags effective in reducing injury during collisions?",
      correct: "They increase collision time and distribute force over larger area",
      options: [
        "They increase collision time and distribute force over larger area", 
        "They eliminate the momentum change completely",
        "They increase the impulse delivered to the passenger",
        "They reduce the passenger's initial momentum"
      ],
      explanation: "Airbags work by: 1) Increasing collision time (J = F·Δt, longer Δt means smaller F), and 2) Distributing force over a larger contact area, reducing pressure on any single body part."
    }
  ];
  
  const selected = safetyTopics[Math.floor(Math.random() * safetyTopics.length)];
  
  return {
    questionText: selected.question,
    options: selected.options.map((option, index) => ({
      id: ['a', 'b', 'c', 'd'][index],
      text: option,
      feedback: option === selected.correct ? 
        `Correct! ${selected.explanation}` : 
        `Incorrect. ${selected.explanation}`
    })),
    correctOptionId: ['a', 'b', 'c', 'd'][selected.options.indexOf(selected.correct)],
    explanation: selected.explanation,
    difficulty: "intermediate", 
    topic: "Safety Features and Impulse"
  };
};


// Question 7: Golf ball and woman driver
const createGolfBallDriverQuestion = () => {
  const mass_ball = randFloat(42, 48, 0); // Golf ball mass: 42-48 g
  const contact_time = randFloat(5.5, 6.5, 1); // Contact time: 5.5-6.5 ms
  const final_speed = randFloat(26, 30, 0); // Final speed: 26-30 m/s
  const angle = randFloat(18, 22, 0); // Launch angle: 18-22°
  
  // Convert units
  const mass_kg = mass_ball / 1000;
  const time_s = contact_time / 1000;
  
  // Calculate momentum change (assuming initially at rest)
  const delta_p = mass_kg * final_speed;
  
  // Calculate impulse and average force
  const impulse = delta_p;
  const avg_force = impulse / time_s;
  
  // Calculate horizontal distance (basic projectile motion)
  const g = 9.8;
  const angle_rad = angle * Math.PI / 180;
  const range = (final_speed * final_speed * Math.sin(2 * angle_rad)) / g;
  
  // Create distractors
  const wrong_momentum = parseFloat((delta_p * 1.15).toFixed(3));
  const wrong_impulse = parseFloat((impulse * 0.9).toFixed(3));
  const wrong_force = parseFloat((avg_force * 1.2).toFixed(0));
  
  return {
    questionText: `A woman drives a golf ball off the tee to a speed of ${final_speed} m/s. The mass of the ball is ${mass_ball} g and the time of contact was ${contact_time} ms. A. What is the change in momentum of the ball? B. What is the impulse? C. What was the average force exerted by the club on the ball? D. If the angle of flight was initially ${angle}° from the horizontal, how far would the ball go before it landed?`,
    options: [
      { id: 'a', text: `Δp = ${delta_p.toFixed(3)} kg·m/s; J = ${impulse.toFixed(3)} N·s; F = ${avg_force.toFixed(0)} N; Range = ${range.toFixed(0)} m`, feedback: `Correct! Δp = mv = ${mass_kg.toFixed(3)} × ${final_speed} = ${delta_p.toFixed(3)} kg·m/s. J = Δp = ${impulse.toFixed(3)} N·s. F = J/Δt = ${impulse.toFixed(3)}/${time_s.toFixed(4)} = ${avg_force.toFixed(0)} N. Range = v²sin(2θ)/g = ${final_speed}²sin(${2*angle}°)/9.8 = ${range.toFixed(0)} m` },
      { id: 'b', text: `Δp = ${wrong_momentum} kg·m/s; J = ${wrong_momentum} N·s; F = ${avg_force.toFixed(0)} N; Range = ${range.toFixed(0)} m`, feedback: "Check your momentum calculation. Use Δp = mv where the ball starts from rest." },
      { id: 'c', text: `Δp = ${delta_p.toFixed(3)} kg·m/s; J = ${wrong_impulse} N·s; F = ${avg_force.toFixed(0)} N; Range = ${range.toFixed(0)} m`, feedback: "Your momentum is correct, but remember that impulse equals the change in momentum: J = Δp." },
      { id: 'd', text: `Δp = ${delta_p.toFixed(3)} kg·m/s; J = ${impulse.toFixed(3)} N·s; F = ${wrong_force} N; Range = ${range.toFixed(0)} m`, feedback: "Check your force calculation. Use F = J/Δt with the contact time in seconds." }
    ],
    correctOptionId: 'a',
    explanation: `Ball starts at rest, so Δp = mv = ${mass_kg.toFixed(3)} kg × ${final_speed} m/s = ${delta_p.toFixed(3)} kg·m/s. Impulse J = Δp = ${impulse.toFixed(3)} N·s. Average force F = J/Δt = ${impulse.toFixed(3)} N·s ÷ ${time_s.toFixed(4)} s = ${avg_force.toFixed(0)} N. Projectile range: R = v²sin(2θ)/g = ${range.toFixed(0)} m`,
    difficulty: "advanced",
    topic: "Golf Ball Driver Analysis"
  };
};



// ===== IMPULSE AND MOMENTUM PRACTICE PROBLEMS SET 2 =====

// Question 8: Child hitting ball
const createChildBallQuestion = () => {
  const force = randFloat(12, 18, 0); // Applied force: 12-18 N
  const contact_time = randFloat(0.10, 0.15, 2); // Contact time: 0.10-0.15 s
  const mass_ball = randFloat(700, 800, 0); // Ball mass: 700-800 g
  const initial_speed = randFloat(10, 14, 0); // Initial speed: 10-14 m/s toward child
  
  // Convert mass to kg
  const mass_kg = mass_ball / 1000;
  
  // Calculate impulse from force
  const impulse = force * contact_time;
  
  // Initial momentum (toward child, let's call this negative direction)
  const p_initial = -mass_kg * initial_speed;
  
  // Final momentum after impulse (away from child, positive direction)
  const p_final = p_initial + impulse;
  
  // Final velocity
  const v_final = p_final / mass_kg;
  
  // Create distractors
  const wrong_impulse = parseFloat((impulse * 1.1).toFixed(2));
  const wrong_momentum = parseFloat((Math.abs(p_final) * 0.9).toFixed(3));
  const wrong_velocity = parseFloat((v_final * 1.15).toFixed(1));
  
  return {
    questionText: `A child hits a ball with a force of ${force} N. If the ball and bat are in contact for ${contact_time} s, what impulse does the ball receive? What is its change in momentum? If the mass of the ball is ${mass_ball} g and the ball was initially moving toward the boy at ${initial_speed} m/s, what is its final velocity?`,
    options: [
      { id: 'a', text: `J = ${impulse.toFixed(2)} N·s; Δp = ${impulse.toFixed(2)} kg·m/s; v_f = ${v_final.toFixed(1)} m/s`, feedback: `Correct! Impulse J = F·Δt = ${force} × ${contact_time} = ${impulse.toFixed(2)} N·s. By impulse-momentum theorem, Δp = J = ${impulse.toFixed(2)} kg·m/s. Initial momentum: p_i = ${mass_kg.toFixed(3)} × (-${initial_speed}) = ${p_initial.toFixed(3)} kg·m/s. Final momentum: p_f = ${p_initial.toFixed(3)} + ${impulse.toFixed(2)} = ${p_final.toFixed(3)} kg·m/s. Final velocity: v_f = ${p_final.toFixed(3)}/${mass_kg.toFixed(3)} = ${v_final.toFixed(1)} m/s` },
      { id: 'b', text: `J = ${wrong_impulse} N·s; Δp = ${wrong_impulse} kg·m/s; v_f = ${v_final.toFixed(1)} m/s`, feedback: "Check your impulse calculation. Use J = F × Δt with the given values." },
      { id: 'c', text: `J = ${impulse.toFixed(2)} N·s; Δp = ${impulse.toFixed(2)} kg·m/s; v_f = ${wrong_velocity} m/s`, feedback: "Your impulse is correct, but check your final velocity calculation. Use conservation of momentum with the impulse." },
      { id: 'd', text: `J = ${impulse.toFixed(2)} N·s; Δp = ${wrong_momentum} kg·m/s; v_f = ${v_final.toFixed(1)} m/s`, feedback: "Impulse and final velocity are correct, but remember that Δp = J (impulse-momentum theorem)." }
    ],
    correctOptionId: 'a',
    explanation: `Impulse: J = F·Δt = ${force} N × ${contact_time} s = ${impulse.toFixed(2)} N·s. Change in momentum equals impulse: Δp = J = ${impulse.toFixed(2)} kg·m/s. For final velocity: p_initial = ${mass_kg.toFixed(3)} kg × (-${initial_speed} m/s) = ${p_initial.toFixed(3)} kg·m/s. p_final = p_initial + J = ${p_initial.toFixed(3)} + ${impulse.toFixed(2)} = ${p_final.toFixed(3)} kg·m/s. v_final = ${p_final.toFixed(3)}/${mass_kg.toFixed(3)} = ${v_final.toFixed(1)} m/s`,
    difficulty: "intermediate",
    topic: "Child Hitting Ball"
  };
};



// Question 9: Ball struck by bat
const createBallBatQuestion = () => {
  const mass_ball = randFloat(280, 320, 0); // Ball mass: 280-320 g
  const contact_time = randFloat(0.018, 0.022, 3); // Contact time: 0.018-0.022 s
  const initial_speed = randFloat(48, 52, 0); // Initial speed: 48-52 m/s toward bat
  const final_speed = randFloat(95, 105, 0); // Final speed: 95-105 m/s away from bat
  
  // Convert mass to kg
  const mass_kg = mass_ball / 1000;
  
  // Calculate momentum change (taking away from bat as positive direction)
  const p_initial = -mass_kg * initial_speed; // Toward bat (negative)
  const p_final = mass_kg * final_speed; // Away from bat (positive)
  const delta_p = p_final - p_initial;
  
  // Calculate average force
  const avg_force = delta_p / contact_time;
  
  // Create distractors
  const wrong_delta_p = parseFloat((mass_kg * (final_speed - initial_speed)).toFixed(3));
  const wrong_force1 = parseFloat((avg_force * 1.1).toFixed(0));
  const wrong_force2 = parseFloat((avg_force * 0.85).toFixed(0));
  
  return {
    questionText: `A ${mass_ball} g ball is struck by a bat with an impact that lasts ${contact_time} s. If the ball moves through the air towards the bat at ${initial_speed} m/s and leaves at ${final_speed} m/s in the opposite direction, calculate the average force exerted by the bat on the ball.`,
    options: [
      { id: 'a', text: `${avg_force.toFixed(0)} N`, feedback: `Correct! Initial momentum: p_i = ${mass_kg.toFixed(3)} × (-${initial_speed}) = ${p_initial.toFixed(3)} kg·m/s. Final momentum: p_f = ${mass_kg.toFixed(3)} × ${final_speed} = ${p_final.toFixed(3)} kg·m/s. Change in momentum: Δp = ${p_final.toFixed(3)} - (${p_initial.toFixed(3)}) = ${delta_p.toFixed(3)} kg·m/s. Average force: F = Δp/Δt = ${delta_p.toFixed(3)}/${contact_time} = ${avg_force.toFixed(0)} N` },
      { id: 'b', text: `${wrong_force1} N`, feedback: "Check your momentum change calculation. Remember to account for the change in direction properly." },
      { id: 'c', text: `${wrong_force2} N`, feedback: "Verify your calculation. Make sure you're using the correct contact time and momentum change." },
      { id: 'd', text: `${Math.abs(wrong_delta_p / contact_time).toFixed(0)} N`, feedback: "This uses an incorrect momentum change calculation. Remember that momentum is a vector - account for the direction change." }
    ],
    correctOptionId: 'a',
    explanation: `The ball changes direction, so we must be careful with signs. Taking away from bat as positive: p_initial = ${mass_kg.toFixed(3)} kg × (-${initial_speed} m/s) = ${p_initial.toFixed(3)} kg·m/s. p_final = ${mass_kg.toFixed(3)} kg × (+${final_speed} m/s) = ${p_final.toFixed(3)} kg·m/s. Δp = ${p_final.toFixed(3)} - (${p_initial.toFixed(3)}) = ${delta_p.toFixed(3)} kg·m/s. F_avg = Δp/Δt = ${delta_p.toFixed(3)}/${contact_time} = ${avg_force.toFixed(0)} N`,
    difficulty: "advanced",
    topic: "Ball Struck by Bat"
  };
};


// Question 10: Bullet through wood block
const createBulletWoodQuestion = () => {
  const mass_bullet = randFloat(7.5, 8.5, 1); // Bullet mass: 7.5-8.5 g
  const v_initial = randFloat(380, 420, 0); // Initial velocity: 380-420 m/s
  const v_final = randFloat(90, 110, 0); // Final velocity: 90-110 m/s
  const contact_time = randFloat(3.8, 4.2, 1); // Contact time: 3.8-4.2 × 10⁻⁴ s
  
  // Convert units
  const mass_kg = mass_bullet / 1000;
  const time_s = contact_time * 1e-4;
  
  // Calculate momentum change and force
  const delta_p = mass_kg * (v_final - v_initial);
  const avg_force = delta_p / time_s;
  
  // Calculate wood thickness (using work-energy theorem estimate)
  // Assume constant deceleration: v_f² = v_i² + 2a·d
  const acceleration = (v_final * v_final - v_initial * v_initial) / (2 * avg_force / mass_kg);
  const thickness = (v_final * v_final - v_initial * v_initial) / (2 * (avg_force / mass_kg));
  const thickness_estimate = Math.abs(thickness);
  
  // For simpler calculation, use average velocity method
  const avg_velocity = (v_initial + v_final) / 2;
  const distance = avg_velocity * time_s;
  
  // Create distractors
  const wrong_force = parseFloat((Math.abs(avg_force) * 1.15).toFixed(0));
  const wrong_thickness1 = parseFloat((distance * 1.2).toFixed(3));
  const wrong_thickness2 = parseFloat((distance * 0.8).toFixed(3));
  
  return {
    questionText: `An ${mass_bullet} g bullet travelling at ${v_initial} m/s goes through a stationary block of wood in ${contact_time} × 10⁻⁴ s, emerging at ${v_final} m/s. A. What average force did the wood exert on the bullet? B. How thick is the wood?`,
    options: [
      { id: 'a', text: `F = ${Math.abs(avg_force).toFixed(0)} N; thickness = ${distance.toFixed(3)} m`, feedback: `Correct! Δp = m(v_f - v_i) = ${mass_kg.toFixed(4)} × (${v_final} - ${v_initial}) = ${delta_p.toFixed(4)} kg·m/s. Force: F = Δp/Δt = ${delta_p.toFixed(4)}/${time_s.toFixed(6)} = ${avg_force.toFixed(0)} N (magnitude: ${Math.abs(avg_force).toFixed(0)} N). Thickness ≈ average velocity × time = ${avg_velocity} × ${time_s.toFixed(6)} = ${distance.toFixed(3)} m` },
      { id: 'b', text: `F = ${wrong_force} N; thickness = ${distance.toFixed(3)} m`, feedback: "Check your force calculation. Use F = Δp/Δt where Δp = m(v_f - v_i)." },
      { id: 'c', text: `F = ${Math.abs(avg_force).toFixed(0)} N; thickness = ${wrong_thickness1} m`, feedback: "Your force is correct, but check your thickness calculation. Use distance = average velocity × time." },
      { id: 'd', text: `F = ${Math.abs(avg_force).toFixed(0)} N; thickness = ${wrong_thickness2} m`, feedback: "Your force is correct, but verify your thickness calculation using kinematic principles." }
    ],
    correctOptionId: 'a',
    explanation: `Momentum change: Δp = ${mass_kg.toFixed(4)} kg × (${v_final} - ${v_initial}) m/s = ${delta_p.toFixed(4)} kg·m/s. Average force: F = Δp/Δt = ${delta_p.toFixed(4)} kg·m/s ÷ ${time_s.toFixed(6)} s = ${avg_force.toFixed(0)} N. Wood thickness: Using average velocity method, d = v̄ × t = ${avg_velocity} m/s × ${time_s.toFixed(6)} s = ${distance.toFixed(3)} m`,
    difficulty: "advanced",
    topic: "Bullet Through Wood"
  };
};


// Question 11: Water stream and turbine blade
const createWaterTurbineQuestion = () => {
  const v_incident = randFloat(17.0, 19.0, 1); // Incident velocity: 17.0-19.0 m/s
  const v_exit = randFloat(-17.5, -18.5, 1); // Exit velocity: -17.5 to -18.5 m/s (opposite direction)
  const mass_flow_rate = randFloat(23, 27, 1); // Mass flow rate: 23-27 kg/s
  
  // Calculate velocity change
  const delta_v = v_exit - v_incident; // Large negative value
  
  // Calculate force on water (and equal/opposite force on blade)
  const force_on_water = mass_flow_rate * delta_v;
  const force_on_blade = -force_on_water; // Newton's 3rd law
  
  // Create distractors  
  const wrong_delta_v = parseFloat((Math.abs(v_exit) + v_incident).toFixed(1));
  const wrong_force1 = parseFloat((Math.abs(force_on_blade) * 1.1).toFixed(0));
  const wrong_force2 = parseFloat((mass_flow_rate * wrong_delta_v).toFixed(0));
  
  return {
    questionText: `A stream of water strikes a stationary turbine blade. The incident water stream has a velocity of +${v_incident} m/s and the exiting stream has a velocity of ${v_exit} m/s. The water stream has a velocity of ${mass_flow_rate} kg/s. Find the net force acting on the water and on the blade.`,
    options: [
      { id: 'a', text: `Force on water: ${force_on_water.toFixed(0)} N; Force on blade: ${force_on_blade.toFixed(0)} N`, feedback: `Correct! Velocity change: Δv = v_exit - v_incident = ${v_exit} - (+${v_incident}) = ${delta_v.toFixed(1)} m/s. Force on water: F = ṁ × Δv = ${mass_flow_rate} kg/s × ${delta_v.toFixed(1)} m/s = ${force_on_water.toFixed(0)} N. By Newton's 3rd law, force on blade = ${force_on_blade.toFixed(0)} N (equal magnitude, opposite direction).` },
      { id: 'b', text: `Force on water: ${wrong_force1} N; Force on blade: ${-wrong_force1} N`, feedback: "Check your velocity change calculation. Remember that velocity is a vector quantity." },
      { id: 'c', text: `Force on water: ${wrong_force2} N; Force on blade: ${-wrong_force2} N`, feedback: "This uses an incorrect velocity change. Use Δv = v_final - v_initial, accounting for direction." },
      { id: 'd', text: `Force on water: ${Math.abs(force_on_water).toFixed(0)} N; Force on blade: ${Math.abs(force_on_blade).toFixed(0)} N`, feedback: "The magnitudes are correct, but be careful about the directions. The forces are equal and opposite." }
    ],
    correctOptionId: 'a',
    explanation: `For continuous flow, F = ṁ × Δv where ṁ is mass flow rate. Velocity change: Δv = ${v_exit} - (+${v_incident}) = ${delta_v.toFixed(1)} m/s. Force on water: F = ${mass_flow_rate} × ${delta_v.toFixed(1)} = ${force_on_water.toFixed(0)} N. Force on blade: By Newton's 3rd law, F_blade = -F_water = ${force_on_blade.toFixed(0)} N`,
    difficulty: "advanced",
    topic: "Water Turbine Blade"
  };
};


// ===== CONFIGURATION EXPORTS FOR MASTER FUNCTION =====
// Export raw configurations that can be imported by the master function
// This allows consolidation without needing to deploy individual functions

const assessmentConfigs = {
  'course2_04_basic_impulse': {
    questions: [
      createBasicImpulseQuestion(),
      createBasicImpulseQuestion(),
      createBasicImpulseQuestion(),
      createBasicImpulseQuestion(),
      createBasicImpulseQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 3,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_person_falling': {
    questions: [
      createPersonFallingQuestion(),
      createPersonFallingQuestion(),
      createPersonFallingQuestion(),
      createPersonFallingQuestion(),
      createPersonFallingQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 3,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_impulse_quantities': {
    questions: [
      createImpulseQuantitiesQuestion(),
      createImpulseQuantitiesQuestion(),
      createImpulseQuantitiesQuestion(),
      createImpulseQuantitiesQuestion(),
      createImpulseQuantitiesQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 2,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_karate_board': {
    questions: [
      createKarateBoardQuestion(),
      createKarateBoardQuestion(),
      createKarateBoardQuestion(),
      createKarateBoardQuestion(),
      createKarateBoardQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 3,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_safety_features': {
    questions: [
      createSafetyFeaturesQuestion(),
      createSafetyFeaturesQuestion(),
      createSafetyFeaturesQuestion(),
      createSafetyFeaturesQuestion(),
      createSafetyFeaturesQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 3,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_golf_ball_driver': {
    questions: [
      createGolfBallDriverQuestion(),
      createGolfBallDriverQuestion(),
      createGolfBallDriverQuestion(),
      createGolfBallDriverQuestion(),
      createGolfBallDriverQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 4,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_child_ball': {
    questions: [
      createChildBallQuestion(),
      createChildBallQuestion(),
      createChildBallQuestion(),
      createChildBallQuestion(),
      createChildBallQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 3,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_ball_bat': {
    questions: [
      createBallBatQuestion(),
      createBallBatQuestion(),
      createBallBatQuestion(),
      createBallBatQuestion(),
      createBallBatQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 4,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_bullet_wood': {
    questions: [
      createBulletWoodQuestion(),
      createBulletWoodQuestion(),
      createBulletWoodQuestion(),
      createBulletWoodQuestion(),
      createBulletWoodQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 4,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  },
  'course2_04_water_turbine': {
    questions: [
      createWaterTurbineQuestion(),
      createWaterTurbineQuestion(),
      createWaterTurbineQuestion(),
      createWaterTurbineQuestion(),
      createWaterTurbineQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 4,
    maxAttempts: 9999,
    showFeedback: true,
    theme: 'blue'
  }
};

// Export the configurations for use by master functions
exports.assessmentConfigs = assessmentConfigs;