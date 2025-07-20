// Cloud function creation imports removed since we only export data configs now
const { getActivityTypeSettings } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// ========================================
// QUESTION GENERATOR FUNCTIONS
// ========================================

// Question 1: Law of Conservation of Charge
const createConservationQuestion = () => {
  return {
    questionText: "What is the Law of Conservation of Charge?",
    options: [
      { 
        id: 'a', 
        text: "In a closed system, the net charge is conserved", 
        feedback: "Correct! The total charge in a closed system remains constant." 
      },
      { 
        id: 'b', 
        text: "Positive charges are always conserved but negative charges can be destroyed", 
        feedback: "Incorrect. Both positive and negative charges are conserved equally." 
      },
      { 
        id: 'c', 
        text: "Charge can be created or destroyed depending on the material", 
        feedback: "Incorrect. Charge cannot be created or destroyed, only transferred." 
      },
      { 
        id: 'd', 
        text: "The amount of charge increases over time in any system", 
        feedback: "Incorrect. Charge is conserved - it doesn't increase or decrease." 
      }
    ],
    correctOptionId: 'a',
    explanation: "The Law of Conservation of Charge states that in a closed system, the total electric charge remains constant. Charge can be transferred but never created or destroyed.",
    difficulty: "beginner",
    topic: "Conservation of Charge"
  };
};

// Question 2: Movement of charges in solids
const createChargeMovementQuestion = () => {
  return {
    questionText: "Which charges are relatively free to move and which are not free to move in a solid substance?",
    options: [
      { 
        id: 'a', 
        text: "Electrons are free to move, but protons and neutrons (in the nucleus) are not", 
        feedback: "Correct! Electrons in the outer shells can move between atoms, while nuclear particles are bound." 
      },
      { 
        id: 'b', 
        text: "Protons are free to move, but electrons and neutrons are not", 
        feedback: "Incorrect. Protons are bound in the nucleus and cannot move freely in solids." 
      },
      { 
        id: 'c', 
        text: "All charges (protons, electrons, neutrons) are equally free to move", 
        feedback: "Incorrect. Neutrons have no charge, and protons are bound in the nucleus." 
      },
      { 
        id: 'd', 
        text: "No charges can move in solid substances", 
        feedback: "Incorrect. Electrons can move between atoms, which is how electric current flows." 
      }
    ],
    correctOptionId: 'a',
    explanation: "In solids, electrons in the outer electron shells are relatively free to move between atoms. Protons and neutrons are tightly bound in the atomic nucleus and cannot move freely.",
    difficulty: "beginner",
    topic: "Charge Movement"
  };
};

// Question 3: Conductor vs Insulator
const createConductorInsulatorQuestion = () => {
  return {
    questionText: "What is the difference between a conductor and an insulator?",
    options: [
      { 
        id: 'a', 
        text: "A conductor allows electrons to move easily between atoms, while an insulator does not allow electrons to flow freely", 
        feedback: "Correct! Conductors have free electrons that can move easily, while insulators hold electrons tightly." 
      },
      { 
        id: 'b', 
        text: "A conductor has more protons than electrons, while an insulator has more electrons than protons", 
        feedback: "Incorrect. Both conductors and insulators are electrically neutral with equal protons and electrons." 
      },
      { 
        id: 'c', 
        text: "A conductor can only carry positive charge, while an insulator can only carry negative charge", 
        feedback: "Incorrect. Both can carry either type of charge, but conductors allow charge to move freely." 
      },
      { 
        id: 'd', 
        text: "A conductor is always positively charged, while an insulator is always negatively charged", 
        feedback: "Incorrect. Both materials are normally neutral and their charge depends on how they've been treated." 
      }
    ],
    correctOptionId: 'a',
    explanation: "Conductors have electrons that are free to move easily from atom to atom, allowing electric current to flow. Insulators hold their electrons tightly, preventing current flow.",
    difficulty: "beginner",
    topic: "Conductors and Insulators"
  };
};

// Question 4: Electrostatic Series
const createElectrostaticSeriesQuestion = () => {
  const pairs = [
    { first: "Brass", second: "Paraffin wax", firstCharge: "-", secondCharge: "+" },
    { first: "Wool", second: "Glass", firstCharge: "-", secondCharge: "+" },
    { first: "Wool", second: "Lead", firstCharge: "+", secondCharge: "-" },
    { first: "Paraffin wax", second: "Ebonite", firstCharge: "+", secondCharge: "-" },
    { first: "Ebonite", second: "Fur", firstCharge: "-", secondCharge: "+" },
    { first: "Glass", second: "Silk", firstCharge: "+", secondCharge: "-" }
  ];
  
  const selectedPair = randChoice(pairs);
  
  return {
    questionText: `When ${selectedPair.first} and ${selectedPair.second} are rubbed together, which material becomes positively charged and which becomes negatively charged?`,
    options: [
      { 
        id: 'a', 
        text: `${selectedPair.first} becomes ${selectedPair.firstCharge === '+' ? 'positively' : 'negatively'} charged, ${selectedPair.second} becomes ${selectedPair.secondCharge === '+' ? 'positively' : 'negatively'} charged`, 
        feedback: "Correct! This follows the electrostatic series ordering." 
      },
      { 
        id: 'b', 
        text: `${selectedPair.first} becomes ${selectedPair.firstCharge === '+' ? 'negatively' : 'positively'} charged, ${selectedPair.second} becomes ${selectedPair.secondCharge === '+' ? 'negatively' : 'positively'} charged`, 
        feedback: "Incorrect. Check the electrostatic series - the order determines which material loses electrons." 
      },
      { 
        id: 'c', 
        text: "Both materials become positively charged", 
        feedback: "Incorrect. When materials are rubbed together, one gains electrons (negative) and one loses electrons (positive)." 
      },
      { 
        id: 'd', 
        text: "Both materials remain neutral", 
        feedback: "Incorrect. Friction charging transfers electrons between materials, creating opposite charges." 
      }
    ],
    correctOptionId: 'a',
    explanation: `According to the electrostatic series, ${selectedPair.first} ${selectedPair.firstCharge === '+' ? 'loses' : 'gains'} electrons and becomes ${selectedPair.firstCharge === '+' ? 'positive' : 'negative'}, while ${selectedPair.second} ${selectedPair.secondCharge === '+' ? 'loses' : 'gains'} electrons and becomes ${selectedPair.secondCharge === '+' ? 'positive' : 'negative'}.`,
    difficulty: "intermediate",
    topic: "Electrostatic Series"
  };
};

// Question 5: Adding/Removing Electrons
const createElectronChargeQuestion = () => {
  return {
    questionText: "If electrons are removed from an object it will have a net _________ charge. If electrons are added to an object it will have a net _________ charge.",
    options: [
      { 
        id: 'a', 
        text: "positive; negative", 
        feedback: "Correct! Removing electrons leaves excess protons (positive), adding electrons creates excess negative charge." 
      },
      { 
        id: 'b', 
        text: "negative; positive", 
        feedback: "Incorrect. Think about what happens when you remove the negative charges (electrons)." 
      },
      { 
        id: 'c', 
        text: "neutral; neutral", 
        feedback: "Incorrect. Adding or removing electrons changes the balance of positive and negative charges." 
      },
      { 
        id: 'd', 
        text: "positive; positive", 
        feedback: "Incorrect. Adding electrons increases the negative charge, not positive." 
      }
    ],
    correctOptionId: 'a',
    explanation: "Electrons carry negative charge. Removing electrons leaves behind excess positive charge (protons). Adding electrons creates excess negative charge.",
    difficulty: "beginner",
    topic: "Charge and Electrons"
  };
};

// Question 6: Induced Charge vs Induced Charge Separation
const createInducedChargeQuestion = () => {
  return {
    questionText: "What is the difference between an induced charge and an induced charge separation?",
    options: [
      { 
        id: 'a', 
        text: "An induced charge separation is only temporary; an induced charge is permanent", 
        feedback: "Correct! Charge separation disappears when the inducing object is removed, but transferred charge remains." 
      },
      { 
        id: 'b', 
        text: "An induced charge is only temporary; an induced charge separation is permanent", 
        feedback: "Incorrect. It's the opposite - separation is temporary, transferred charge is permanent." 
      },
      { 
        id: 'c', 
        text: "Both are permanent changes to the object", 
        feedback: "Incorrect. Charge separation returns to normal when the inducing field is removed." 
      },
      { 
        id: 'd', 
        text: "Both are temporary changes to the object", 
        feedback: "Incorrect. Induced charge (from induction charging) involves actual charge transfer and is permanent." 
      }
    ],
    correctOptionId: 'a',
    explanation: "Induced charge separation occurs when charges redistribute within an object but no charge is transferred - this is temporary. Induced charge occurs when charge is actually transferred to an object through induction - this is permanent.",
    difficulty: "intermediate",
    topic: "Induction"
  };
};

// Question 7: Positive Charge by Conduction
const createConductionChargingQuestion = () => {
  return {
    questionText: "What is the procedure for giving an electroscope a positive charge by conduction?",
    options: [
      { 
        id: 'a', 
        text: "Touch the electroscope with a positively charged rod, then remove the rod", 
        feedback: "Correct! Direct contact allows positive charge to transfer from the rod to the electroscope." 
      },
      { 
        id: 'b', 
        text: "Bring a positively charged rod near the electroscope without touching, then ground the electroscope", 
        feedback: "Incorrect. This describes induction charging, not conduction charging." 
      },
      { 
        id: 'c', 
        text: "Touch the electroscope with a negatively charged rod, then remove the rod", 
        feedback: "Incorrect. A negatively charged rod would give the electroscope a negative charge by conduction." 
      },
      { 
        id: 'd', 
        text: "Rub the electroscope with fur to remove electrons", 
        feedback: "Incorrect. This describes friction charging, not conduction charging." 
      }
    ],
    correctOptionId: 'a',
    explanation: "Conduction charging requires direct contact. A positively charged rod touching the electroscope allows positive charge to transfer directly through conduction.",
    difficulty: "intermediate",
    topic: "Conduction Charging"
  };
};

// Question 8: Positive Charge by Induction
const createInductionChargingQuestion = () => {
  return {
    questionText: "What is the procedure for giving an electroscope a positive charge by induction?",
    options: [
      { 
        id: 'a', 
        text: "Bring a negatively charged rod near the electroscope, ground the electroscope, remove the ground, then remove the rod", 
        feedback: "Correct! The negative rod attracts positive charges up, grounding removes negative charges, leaving net positive charge." 
      },
      { 
        id: 'b', 
        text: "Bring a positively charged rod near the electroscope, ground the electroscope, remove the ground, then remove the rod", 
        feedback: "Incorrect. A positive rod would repel positive charges, resulting in negative charge on the electroscope." 
      },
      { 
        id: 'c', 
        text: "Touch the electroscope directly with a positively charged rod", 
        feedback: "Incorrect. This describes conduction charging, not induction charging." 
      },
      { 
        id: 'd', 
        text: "Ground the electroscope first, then bring a negatively charged rod near it", 
        feedback: "Incorrect. The sequence matters - the inducing rod must be present before and during grounding." 
      }
    ],
    correctOptionId: 'a',
    explanation: "Induction charging uses attraction without contact. A negative rod attracts positive charges to the top of the electroscope. Grounding allows negative charges to flow away. Removing the ground first, then the rod, leaves the electroscope with net positive charge.",
    difficulty: "advanced",
    topic: "Induction Charging"
  };
};

// Question 9: Conduction Charging Result
const createConductionResultQuestion = () => {
  return {
    questionText: "If a negative rod is used to charge an object by conduction, the object will have a _________ charge.",
    options: [
      { 
        id: 'a', 
        text: "negative", 
        feedback: "Correct! In conduction charging, the object acquires the same type of charge as the charging object." 
      },
      { 
        id: 'b', 
        text: "positive", 
        feedback: "Incorrect. Conduction transfers charge directly - same charge type as the rod." 
      },
      { 
        id: 'c', 
        text: "neutral", 
        feedback: "Incorrect. Conduction charging transfers charge, changing the object from neutral to charged." 
      },
      { 
        id: 'd', 
        text: "alternating between positive and negative", 
        feedback: "Incorrect. The charge remains constant after conduction charging is complete." 
      }
    ],
    correctOptionId: 'a',
    explanation: "In conduction charging, direct contact allows charge to transfer from the charging object to the target object. The target acquires the same type of charge as the charging object.",
    difficulty: "beginner",
    topic: "Conduction Charging"
  };
};

// Question 10: Induction Charging Result
const createInductionResultQuestion = () => {
  return {
    questionText: "If a negative rod is used to charge an object by induction, the object will have a _________ charge.",
    options: [
      { 
        id: 'a', 
        text: "positive", 
        feedback: "Correct! In induction charging, the object acquires the opposite charge to the inducing object." 
      },
      { 
        id: 'b', 
        text: "negative", 
        feedback: "Incorrect. Induction charging produces the opposite charge to the inducing rod." 
      },
      { 
        id: 'c', 
        text: "neutral", 
        feedback: "Incorrect. Induction charging results in a net charge on the object." 
      },
      { 
        id: 'd', 
        text: "the same as before charging", 
        feedback: "Incorrect. Induction charging changes the net charge of the object." 
      }
    ],
    correctOptionId: 'a',
    explanation: "In induction charging, the inducing object causes charge separation and then allows opposite charges to flow away. The object ends up with the opposite charge to the inducing object.",
    difficulty: "intermediate",
    topic: "Induction Charging"
  };
};

// Question 11: Identical Spheres Charge Distribution
const createSpheresChargeQuestion = () => {
  const charge1 = randInt(-30, 30);
  let charge2 = randInt(-30, 30);
  // Ensure charges are different
  while (charge2 === charge1) {
    charge2 = randInt(-30, 30);
  }
  
  const finalCharge = (charge1 + charge2) / 2;
  
  return {
    questionText: `Two identical metal spheres have different charges. One has a charge of ${charge1 > 0 ? '+' : ''}${charge1} C and the other has a charge of ${charge2 > 0 ? '+' : ''}${charge2} C. If the spheres are allowed to touch each other for a time and then are moved away from each other, what is the final charge on each sphere?`,
    options: [
      { 
        id: 'a', 
        text: `${finalCharge > 0 ? '+' : ''}${finalCharge} C on each sphere`, 
        feedback: "Correct! When identical conductors touch, they share charge equally - the average of their original charges." 
      },
      { 
        id: 'b', 
        text: `${charge1 > 0 ? '+' : ''}${charge1} C and ${charge2 > 0 ? '+' : ''}${charge2} C (no change)`, 
        feedback: "Incorrect. When conductors touch, charge redistributes until they have equal potential." 
      },
      { 
        id: 'c', 
        text: `${charge1 + charge2 > 0 ? '+' : ''}${charge1 + charge2} C on each sphere`, 
        feedback: "Incorrect. The total charge is conserved but distributed equally between the spheres." 
      },
      { 
        id: 'd', 
        text: "0 C on each sphere", 
        feedback: "Incorrect. The charges don't necessarily cancel out unless they were equal and opposite." 
      }
    ],
    correctOptionId: 'a',
    explanation: `When identical conducting spheres touch, they reach the same electric potential by sharing charge equally. Total charge = ${charge1} + ${charge2} = ${charge1 + charge2} C. Each sphere gets half: ${charge1 + charge2}/2 = ${finalCharge} C.`,
    difficulty: "intermediate",
    topic: "Charge Distribution"
  };
};

// Question 12: Different Size Spheres Charge Distribution
const createDifferentSpheresQuestion = () => {
  const radius1 = 1.0;
  const radius2 = 3.0;
  const initialCharge = -5.0;
  
  // Surface area calculation: A = 4πr²
  const area1 = 4 * Math.PI * radius1 * radius1;
  const area2 = 4 * Math.PI * radius2 * radius2;
  const totalArea = area1 + area2;
  
  // Charge distributes proportional to surface area
  const charge1 = (initialCharge * area1 / totalArea).toFixed(2);
  const charge2 = (initialCharge * area2 / totalArea).toFixed(2);
  
  return {
    questionText: `Metal sphere A has a radius of ${radius1} cm and a charge of ${initialCharge} mC. Sphere A is brought into contact with metal sphere B which has a radius of ${radius2} cm and was initially neutral. When they were separated what was the charge on each sphere? (The area of a sphere is A = 4πr²)`,
    options: [
      { 
        id: 'a', 
        text: `${charge1} mC on sphere A, ${charge2} mC on sphere B`, 
        feedback: "Correct! Charge distributes proportional to surface area. Smaller sphere gets less charge." 
      },
      { 
        id: 'b', 
        text: `${(initialCharge/2).toFixed(1)} mC on each sphere`, 
        feedback: "Incorrect. Equal distribution only occurs when spheres are identical. These have different surface areas." 
      },
      { 
        id: 'c', 
        text: `${initialCharge} mC on sphere A, 0 mC on sphere B`, 
        feedback: "Incorrect. When conductors touch, charge redistributes until they reach equal potential." 
      },
      { 
        id: 'd', 
        text: `0 mC on sphere A, ${initialCharge} mC on sphere B`, 
        feedback: "Incorrect. Charge doesn't transfer completely to the larger sphere." 
      }
    ],
    correctOptionId: 'a',
    explanation: `When conducting spheres of different sizes touch, charge distributes proportional to their surface areas. Area A = 4π(1)² = 4π cm². Area B = 4π(3)² = 36π cm². Total area = 40π cm². Sphere A gets ${initialCharge} × (4π/40π) = ${charge1} mC. Sphere B gets ${initialCharge} × (36π/40π) = ${charge2} mC.`,
    difficulty: "advanced",
    topic: "Charge Distribution"
  };
};

// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Export the assessment configurations for the master function
const assessmentConfigs = {
  'course2_25_conservation_of_charge': {
    questions: [
      createConservationQuestion(),
      createConservationQuestion(),
      createConservationQuestion(),
      createConservationQuestion(),
      createConservationQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_charge_movement_in_solids': {
    questions: [
      createChargeMovementQuestion(),
      createChargeMovementQuestion(),
      createChargeMovementQuestion(),
      createChargeMovementQuestion(),
      createChargeMovementQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_conductor_vs_insulator': {
    questions: [
      createConductorInsulatorQuestion(),
      createConductorInsulatorQuestion(),
      createConductorInsulatorQuestion(),
      createConductorInsulatorQuestion(),
      createConductorInsulatorQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_electrostatic_series': {
    questions: [
      createElectrostaticSeriesQuestion(),
      createElectrostaticSeriesQuestion(),
      createElectrostaticSeriesQuestion(),
      createElectrostaticSeriesQuestion(),
      createElectrostaticSeriesQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_electron_charge': {
    questions: [
      createElectronChargeQuestion(),
      createElectronChargeQuestion(),
      createElectronChargeQuestion(),
      createElectronChargeQuestion(),
      createElectronChargeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_induced_charge': {
    questions: [
      createInducedChargeQuestion(),
      createInducedChargeQuestion(),
      createInducedChargeQuestion(),
      createInducedChargeQuestion(),
      createInducedChargeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_conduction_charging': {
    questions: [
      createConductionChargingQuestion(),
      createConductionChargingQuestion(),
      createConductionChargingQuestion(),
      createConductionChargingQuestion(),
      createConductionChargingQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_induction_charging': {
    questions: [
      createInductionChargingQuestion(),
      createInductionChargingQuestion(),
      createInductionChargingQuestion(),
      createInductionChargingQuestion(),
      createInductionChargingQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_conduction_result': {
    questions: [
      createConductionResultQuestion(),
      createConductionResultQuestion(),
      createConductionResultQuestion(),
      createConductionResultQuestion(),
      createConductionResultQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_induction_result': {
    questions: [
      createInductionResultQuestion(),
      createInductionResultQuestion(),
      createInductionResultQuestion(),
      createInductionResultQuestion(),
      createInductionResultQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_spheres_charge': {
    questions: [
      createSpheresChargeQuestion(),
      createSpheresChargeQuestion(),
      createSpheresChargeQuestion(),
      createSpheresChargeQuestion(),
      createSpheresChargeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_25_different_spheres': {
    questions: [
      createDifferentSpheresQuestion(),
      createDifferentSpheresQuestion(),
      createDifferentSpheresQuestion(),
      createDifferentSpheresQuestion(),
      createDifferentSpheresQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  }
};

module.exports = { 
  assessmentConfigs
};
