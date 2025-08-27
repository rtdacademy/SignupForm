// Cloud function creation imports removed since we only export data configs now
// Removed dependency on config file - settings are now handled directly in assessment configurations

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// Constants
const k = 8.99e9; // Coulomb's constant in N⋅m²/C²

// ========================================
// QUESTION GENERATOR FUNCTIONS
// ========================================

// Question 1: Force between two charges
const createBasicForceQuestion = () => {
  const q1_micro = randInt(50, 200); // μC
  const q2_micro = randInt(-10, -2); // negative μC
  const distance_cm = randInt(30, 80); // cm
  
  const q1 = q1_micro * 1e-6; // Convert to C
  const q2 = q2_micro * 1e-6; // Convert to C  
  const r = distance_cm / 100; // Convert to m
  
  const force = Math.abs(k * q1 * Math.abs(q2) / (r * r)); // Magnitude in N
  
  return {
    questionText: `Find the force of electrostatic attraction between a +${q1_micro} μC charge and a ${q2_micro} μC charge located ${distance_cm} cm apart.`,
    options: [
      { 
        id: 'a', 
        text: `${force.toFixed(1)} N`, 
        feedback: "Correct! Use F = kq₁q₂/r² with proper unit conversions." 
      },
      { 
        id: 'b', 
        text: `${(force * 1000).toFixed(0)} N`, 
        feedback: "Incorrect. Check your unit conversion - charges should be in Coulombs, not microCoulombs." 
      },
      { 
        id: 'c', 
        text: `${(force / 100).toFixed(3)} N`, 
        feedback: "Incorrect. Check your distance conversion - it should be in meters, not centimeters." 
      },
      { 
        id: 'd', 
        text: `${(force / 1000).toFixed(4)} N`, 
        feedback: "Incorrect. Double-check both your charge and distance unit conversions." 
      }
    ],
    correctOptionId: 'a',
    explanation: `F = k|q₁||q₂|/r² = (8.99×10⁹)(${q1_micro}×10⁻⁶)(${Math.abs(q2_micro)}×10⁻⁶)/(${distance_cm/100})² = ${force.toFixed(1)} N`,
    difficulty: "intermediate",
    topic: "Coulomb's Law"
  };
};

// Question 2: Force scaling with charge and distance changes  
const createForceScalingQuestion = () => {
  const originalForce = randInt(200, 500); // N
  const chargeMultiplier = 4;
  const distanceMultiplier = 0.5; // half distance
  
  // New force = original × (charge ratio) × (1/distance ratio)²
  const newForce = originalForce * chargeMultiplier * (1 / (distanceMultiplier * distanceMultiplier));
  
  return {
    questionText: `If the force of attraction between two charges is ${originalForce} N, what will be the force if one of the charges is made four times larger and the distance is reduced to half of its original value?`,
    options: [
      { 
        id: 'a', 
        text: `${(newForce/1000).toFixed(2)} kN`, 
        feedback: "Correct! Force increases by factor of 4 (charge) × 4 (1/distance²) = 16." 
      },
      { 
        id: 'b', 
        text: `${(originalForce * 4 / 2).toFixed(0)} N`, 
        feedback: "Incorrect. Distance affects force by 1/r², not 1/r." 
      },
      { 
        id: 'c', 
        text: `${(originalForce * 4 * 0.5 * 0.5).toFixed(0)} N`, 
        feedback: "Incorrect. You used (1/2)² = 1/4, but smaller distance means larger force: use (1/0.5)² = 4." 
      },
      { 
        id: 'd', 
        text: `${(originalForce * 2).toFixed(0)} N`, 
        feedback: "Incorrect. You forgot that force depends on 1/r², so halving distance quadruples the force." 
      }
    ],
    correctOptionId: 'a',
    explanation: `New force = ${originalForce} × 4 × (1/0.5)² = ${originalForce} × 4 × 4 = ${newForce} N = ${(newForce/1000).toFixed(2)} kN`,
    difficulty: "advanced",
    topic: "Force Scaling"
  };
};

// Question 3: Finding unknown charge
const createUnknownChargeQuestion = () => {
  const distance_cm = randFloat(3.0, 6.0, 1); // cm
  const q1_nC = randInt(60, 120); // nC
  const force = randFloat(0.010, 0.025, 3); // N
  
  const r = distance_cm / 100; // Convert to m
  const q1 = q1_nC * 1e-9; // Convert to C
  const q2 = force * r * r / (k * q1); // Calculate unknown charge
  
  return {
    questionText: `What charge q placed ${distance_cm} cm from a charge of ${q1_nC} nC will produce a repulsive force of ${force} N?`,
    options: [
      { 
        id: 'a', 
        text: `${(q2 * 1e8).toFixed(1)} × 10⁻⁸ C`, 
        feedback: "Correct! Rearrange F = kq₁q₂/r² to solve for q₂ = Fr²/(kq₁)." 
      },
      { 
        id: 'b', 
        text: `${(q2 * 1e11).toFixed(1)} × 10⁻¹¹ C`, 
        feedback: "Incorrect. Check your unit conversion for the given charge (nC to C)." 
      },
      { 
        id: 'c', 
        text: `${(q2 * 1e6).toFixed(1)} × 10⁻⁶ C`, 
        feedback: "Incorrect. Check your distance unit conversion (cm to m)." 
      },
      { 
        id: 'd', 
        text: `${(q2 * 1e5).toFixed(1)} × 10⁻⁵ C`, 
        feedback: "Incorrect. Double-check both unit conversions and the calculation." 
      }
    ],
    correctOptionId: 'a',
    explanation: `q₂ = Fr²/(kq₁) = (${force})(${distance_cm/100})²/((8.99×10⁹)(${q1_nC}×10⁻⁹)) = ${(q2 * 1e8).toFixed(1)} × 10⁻⁸ C`,
    difficulty: "advanced",
    topic: "Unknown Charge"
  };
};

// Question 4: Spheres in contact
const createSpheresContactQuestion = () => {
  const q1_micro = randFloat(3.0, 6.0, 2); // μC
  const q2_micro = randFloat(-1.5, -0.5, 2); // negative μC
  const distance = randFloat(0.15, 0.25, 2); // m
  
  // After contact, charges are shared equally
  const q_final = (q1_micro + q2_micro) / 2; // μC
  const q_final_C = q_final * 1e-6; // Convert to C
  
  const force = k * q_final_C * q_final_C / (distance * distance);
  
  return {
    questionText: `Two small metallic spheres have the same mass and volume. One sphere has a charge of +${q1_micro} μC and the other a charge of ${q2_micro} μC. If the two spheres are brought into brief contact and then separated to a distance of ${distance} m, what is the electric force between them?`,
    options: [
      { 
        id: 'a', 
        text: `${force.toFixed(3)} N`, 
        feedback: "Correct! After contact, each sphere has charge (q₁+q₂)/2, then use F = kq²/r²." 
      },
      { 
        id: 'b', 
        text: `${(k * q1_micro * 1e-6 * Math.abs(q2_micro) * 1e-6 / (distance * distance)).toFixed(3)} N`, 
        feedback: "Incorrect. The charges redistribute when the spheres touch - they don't keep their original charges." 
      },
      { 
        id: 'c', 
        text: `${(force * 4).toFixed(3)} N`, 
        feedback: "Incorrect. Check your calculation of the final charge on each sphere after contact." 
      },
      { 
        id: 'd', 
        text: `0 N`, 
        feedback: "Incorrect. The spheres don't become neutral after contact unless the original charges were equal and opposite." 
      }
    ],
    correctOptionId: 'a',
    explanation: `After contact: q_final = (${q1_micro} + ${q2_micro})/2 = ${q_final} μC on each sphere. F = k(${q_final}×10⁻⁶)²/(${distance})² = ${force.toFixed(3)} N`,
    difficulty: "advanced", 
    topic: "Charge Distribution"
  };
};

// Question 5: Force with charge and distance changes
const createForceChangeQuestion = () => {
  const originalForce = randFloat(1.4, 1.8, 1) * 1e-2; // N
  
  // Charge halved, distance doubled
  // New force = original × (0.5)² × (1/2)² = original × 0.25 × 0.25 = original × 0.0625
  const newForce = originalForce * 0.25 * 0.25;
  
  return {
    questionText: `Two small, oppositely charged spheres have a force of electric attraction between them of ${(originalForce * 1000).toFixed(1)} × 10⁻³ N. What does this force become if the charge on each sphere is halved and then they are placed twice as far apart as before?`,
    options: [
      { 
        id: 'a', 
        text: `${(newForce * 1000).toFixed(1)} × 10⁻³ N`, 
        feedback: "Correct! Force scales as (charge)² × (1/distance)², so (1/2)² × (1/2)² = 1/16 of original." 
      },
      { 
        id: 'b', 
        text: `${(originalForce * 0.25 * 1000).toFixed(1)} × 10⁻³ N`, 
        feedback: "Incorrect. You accounted for charge change but forgot that doubling distance reduces force by factor of 4." 
      },
      { 
        id: 'c', 
        text: `${(originalForce * 0.125 * 1000).toFixed(1)} × 10⁻³ N`, 
        feedback: "Incorrect. Force depends on q₁×q₂, not just one charge. Both charges are halved." 
      },
      { 
        id: 'd', 
        text: `${(originalForce * 0.5 * 1000).toFixed(1)} × 10⁻³ N`, 
        feedback: "Incorrect. Force depends on the square of both charge and inverse distance." 
      }
    ],
    correctOptionId: 'a',
    explanation: `New force = original × (1/2)² × (1/2)² × (1/2)² = original × 1/16 = ${(originalForce * 1000).toFixed(1)} × 10⁻³ × 1/16 = ${(newForce * 1000).toFixed(1)} × 10⁻³ N`,
    difficulty: "advanced",
    topic: "Force Scaling"
  };
};

// Question 6: Third charge between two charges (outside negative)
const createThirdChargeQuestion1 = () => {
  const q1 = 40; // μC
  const q2 = -18; // μC  
  const q3 = -2.5; // μC
  const distance12 = 0.24; // m between q1 and q2
  const distance3 = 0.12; // m outside q2
  
  // q3 is 12cm outside q2 (on negative side)
  // Distance from q1 to q3 = 24 + 12 = 36 cm = 0.36 m
  // Distance from q2 to q3 = 12 cm = 0.12 m
  
  const r13 = distance12 + distance3; // 0.36 m
  const r23 = distance3; // 0.12 m
  
  // Forces on q3
  const F13 = k * Math.abs(q1 * 1e-6) * Math.abs(q3 * 1e-6) / (r13 * r13); // Repulsive (both same direction away from negative)
  const F23 = k * Math.abs(q2 * 1e-6) * Math.abs(q3 * 1e-6) / (r23 * r23); // Attractive (toward q2)
  
  const netForce = F23 - F13; // Net force toward negative charge
  
  return {
    questionText: `Two charges, +${q1} μC and ${q2} μC, are placed ${distance12 * 100} cm apart. What is the force on a third charge of ${q3} μC if it is placed ${distance3 * 100} cm outside the negative charge?`,
    options: [
      { 
        id: 'a', 
        text: `${netForce.toFixed(0)} N away from negative charge`, 
        feedback: "Correct! The stronger attractive force from the closer negative charge dominates." 
      },
      { 
        id: 'b', 
        text: `${(F13 + F23).toFixed(0)} N toward positive charge`, 
        feedback: "Incorrect. You added the forces instead of finding the net force. Consider directions." 
      },
      { 
        id: 'c', 
        text: `${F13.toFixed(0)} N toward negative charge`, 
        feedback: "Incorrect. You only considered force from the positive charge. Include both forces." 
      },
      { 
        id: 'd', 
        text: `0 N`, 
        feedback: "Incorrect. The forces don't cancel because they have different magnitudes." 
      }
    ],
    correctOptionId: 'a',
    explanation: `F₁₃ = (8.99×10⁹)(40×10⁻⁶)(2.5×10⁻⁶)/(0.36)² = ${F13.toFixed(1)} N (repulsive). F₂₃ = (8.99×10⁹)(18×10⁻⁶)(2.5×10⁻⁶)/(0.12)² = ${F23.toFixed(1)} N (attractive). Net = ${F23.toFixed(1)} - ${F13.toFixed(1)} = ${netForce.toFixed(0)} N away from negative charge.`,
    difficulty: "advanced",
    topic: "Multiple Charges"
  };
};

// Question 7: Finding larger charge from repulsive force
const createLargerChargeQuestion = () => {
  const distance = 0.04; // m (4.0 cm)
  const force = 0.90; // N
  const ratio = 4; // one charge is 4x larger
  
  // F = kq₁q₂/r² = k(q)(4q)/r² = 4kq²/r²
  // q² = Fr²/(4k)
  const q_smaller_squared = force * distance * distance / (4 * k);
  const q_smaller = Math.sqrt(q_smaller_squared);
  const q_larger = 4 * q_smaller;
  
  return {
    questionText: `Two positive charges ${distance * 100} cm apart repel each other with a force of ${force} N. One charge is four times larger than the other. Find the magnitude of the larger charge.`,
    options: [
      { 
        id: 'a', 
        text: `${(q_larger * 1e7).toFixed(1)} × 10⁻⁷ C`, 
        feedback: "Correct! Set up F = k(q)(4q)/r² = 4kq²/r² and solve for q, then multiply by 4." 
      },
      { 
        id: 'b', 
        text: `${(q_smaller * 1e7).toFixed(1)} × 10⁻⁷ C`, 
        feedback: "Incorrect. This is the smaller charge. The question asks for the larger charge." 
      },
      { 
        id: 'c', 
        text: `${(Math.sqrt(force * distance * distance / k) * 1e7).toFixed(1)} × 10⁻⁷ C`, 
        feedback: "Incorrect. You used F = kq²/r² instead of F = 4kq²/r² for the charge relationship." 
      },
      { 
        id: 'd', 
        text: `${(q_larger * 1e6).toFixed(1)} × 10⁻⁶ C`, 
        feedback: "Incorrect. Check your calculation and unit conversion." 
      }
    ],
    correctOptionId: 'a',
    explanation: `F = 4kq²/r² → q = √(Fr²/4k) = √((${force})(${distance})²/(4×8.99×10⁹)) = ${(q_smaller * 1e7).toFixed(1)} × 10⁻⁷ C. Larger charge = 4q = ${(q_larger * 1e7).toFixed(1)} × 10⁻⁷ C`,
    difficulty: "advanced",
    topic: "Unknown Charge"
  };
};

// Question 8: Three charges in equilateral triangle
const createTriangleChargesQuestion = () => {
  const side = 0.10; // m (10 cm)
  const qA = 0.30e-6; // C
  const qB = -0.20e-6; // C  
  const qC = -0.20e-6; // C
  
  // Forces on A from B and C
  const FAB = k * Math.abs(qA * qB) / (side * side); // Attractive
  const FAC = k * Math.abs(qA * qC) / (side * side); // Attractive
  
  // Both forces point toward A (attractive), at 60° to each other
  // Net force magnitude using vector addition
  const netForce = Math.sqrt(FAB * FAB + FAC * FAC + 2 * FAB * FAC * Math.cos(Math.PI / 3));
  
  return {
    questionText: `Three charges are placed in an equilateral triangle with side lengths of ${side * 100} cm. A has a charge of +${qA * 1e6} μC, B has a charge of ${qB * 1e6} μC, and C has a charge of ${qC * 1e6} μC. What is the net force on A?`,
    options: [
      { 
        id: 'a', 
        text: `${(netForce * 1000).toFixed(0)} × 10⁻³ N [S]`, 
        feedback: "Correct! Both attractive forces combine vectorially, with resultant pointing south." 
      },
      { 
        id: 'b', 
        text: `${(FAB * 1000).toFixed(0)} × 10⁻³ N`, 
        feedback: "Incorrect. You only considered one force. Must add both forces vectorially." 
      },
      { 
        id: 'c', 
        text: `${((FAB + FAC) * 1000).toFixed(0)} × 10⁻³ N`, 
        feedback: "Incorrect. You added forces algebraically. Must consider vector directions in the triangle." 
      },
      { 
        id: 'd', 
        text: `0 N`, 
        feedback: "Incorrect. The forces from B and C don't cancel because A has different charge." 
      }
    ],
    correctOptionId: 'a',
    explanation: `Each force = (8.99×10⁹)(0.30×10⁻⁶)(0.20×10⁻⁶)/(0.10)² = ${(FAB * 1000).toFixed(1)} × 10⁻³ N. Net force = √(F² + F² + 2F²cos60°) = √3 × F = ${(netForce * 1000).toFixed(0)} × 10⁻³ N [S]`,
    difficulty: "advanced",
    topic: "Vector Forces"
  };
};

// Question 9: Three charges with vector diagram  
const createVectorForceQuestion = () => {
  const q1 = 4.0e-6; // C (center charge)
  const q2 = 3.0e-6; // C (west)
  const q3 = -4.0e-6; // C (south)
  const r12 = 0.60; // m (west)
  const r13 = 0.60; // m (south, assuming same distance)
  
  // Forces on q1
  const F12 = k * q1 * q2 / (r12 * r12); // Repulsive (east)
  const F13 = k * q1 * Math.abs(q3) / (r13 * r13); // Attractive (south)
  
  const netForce = Math.sqrt(F12 * F12 + F13 * F13);
  const angle = Math.atan(F13 / F12) * 180 / Math.PI; // degrees south of east
  
  return {
    questionText: `A +${q1 * 1e6} μC charge is placed at the origin. A +${q2 * 1e6} μC charge is ${r12 * 100} cm directly west, and a ${q3 * 1e6} μC charge is ${r13 * 100} cm directly south. What is the net force on the +${q1 * 1e6} μC charge?`,
    options: [
      { 
        id: 'a', 
        text: `${netForce.toFixed(3)} N @ ${angle.toFixed(0)}° S of E`, 
        feedback: "Correct! Repulsive force eastward and attractive force southward combine vectorially." 
      },
      { 
        id: 'b', 
        text: `${F12.toFixed(3)} N [E]`, 
        feedback: "Incorrect. You only considered the force from the western charge. Include the southern charge." 
      },
      { 
        id: 'c', 
        text: `${F13.toFixed(3)} N [S]`, 
        feedback: "Incorrect. You only considered the force from the southern charge. Include the western charge." 
      },
      { 
        id: 'd', 
        text: `${(F12 + F13).toFixed(3)} N`, 
        feedback: "Incorrect. Forces are perpendicular, so use Pythagorean theorem for vector addition." 
      }
    ],
    correctOptionId: 'a',
    explanation: `F₁₂ = (8.99×10⁹)(4.0×10⁻⁶)(3.0×10⁻⁶)/(0.60)² = ${F12.toFixed(3)} N [E]. F₁₃ = (8.99×10⁹)(4.0×10⁻⁶)(4.0×10⁻⁶)/(0.60)² = ${F13.toFixed(3)} N [S]. Net = √(${F12.toFixed(3)}² + ${F13.toFixed(3)}²) = ${netForce.toFixed(3)} N @ ${angle.toFixed(0)}° S of E`,
    difficulty: "advanced",
    topic: "Vector Forces"
  };
};

// Question 10: Minimum charge for equilibrium (Styrofoam ball)
const createMinimumChargeQuestion = () => {
  const mass = 0.100e-3; // kg (0.100 g)
  const distance = 0.02; // m (2.0 cm)
  const g = 9.8; // m/s²
  
  // For equilibrium: F_electric = F_gravity
  // kq²/r² = mg
  // q = √(mgr²/k)
  const q = Math.sqrt(mass * g * distance * distance / k);
  
  return {
    questionText: `A negatively charged Styrofoam ball (mass ${mass * 1000} g) on a table is pulled upward at constant speed by another Styrofoam ball held ${distance * 100} cm above it. Assuming equal charges and masses, what is the smallest possible charge?`,
    options: [
      { 
        id: 'a', 
        text: `${(q * 1e9).toFixed(1)} × 10⁻⁹ C`, 
        feedback: "Correct! At equilibrium, electric force equals gravitational force: kq²/r² = mg." 
      },
      { 
        id: 'b', 
        text: `${(q * 1e6).toFixed(1)} × 10⁻⁶ C`, 
        feedback: "Incorrect. Check your unit conversion for mass (grams to kilograms)." 
      },
      { 
        id: 'c', 
        text: `${(Math.sqrt(mass * g / k) * 1e9).toFixed(1)} × 10⁻⁹ C`, 
        feedback: "Incorrect. You forgot to include the distance squared in the denominator." 
      },
      { 
        id: 'd', 
        text: `${(q * 1e12).toFixed(1)} × 10⁻¹² C`, 
        feedback: "Incorrect. Double-check your calculation and unit conversions." 
      }
    ],
    correctOptionId: 'a',
    explanation: `For equilibrium: kq²/r² = mg → q = √(mgr²/k) = √((0.100×10⁻³)(9.8)(0.02)²/(8.99×10⁹)) = ${(q * 1e9).toFixed(1)} × 10⁻⁹ C`,
    difficulty: "advanced",
    topic: "Equilibrium"
  };
};

// Question 11: Equilibrium position between two charges
const createEquilibriumPositionQuestion = () => {
  const qA = 5.0e-6; // C
  const qB = 20.0e-6; // C  
  const qC = 4.0e-6; // C
  const distance_AB = 0.12; // m
  
  // For equilibrium: F_AC = F_BC
  // Let x = distance from B to C
  // Distance from A to C = 0.12 - x
  // kqAqC/(0.12-x)² = kqBqC/x²
  // qA/(0.12-x)² = qB/x²
  // qA × x² = qB × (0.12-x)²
  // √(qA) × x = √(qB) × (0.12-x)
  // x(√qA + √qB) = 0.12√qB
  // x = 0.12√qB/(√qA + √qB)
  
  const sqrtA = Math.sqrt(qA * 1e6);
  const sqrtB = Math.sqrt(qB * 1e6);
  const x = 0.12 * sqrtB / (sqrtA + sqrtB);
  
  return {
    questionText: `Two positive charges A (+${qA * 1e6} μC) and B (+${qB * 1e6} μC) are ${distance_AB * 100} cm apart. A third charge C (+${qC * 1e6} μC) is placed between them and is free to move. At what distance from B will charge C come to rest?`,
    options: [
      { 
        id: 'a', 
        text: `${(x * 100).toFixed(0)} cm`, 
        feedback: "Correct! At equilibrium, forces from A and B on C are equal: qₐ/(d-x)² = qᵦ/x²." 
      },
      { 
        id: 'b', 
        text: `${((distance_AB - x) * 100).toFixed(0)} cm`, 
        feedback: "Incorrect. This is the distance from A. The question asks for distance from B." 
      },
      { 
        id: 'c', 
        text: `${(distance_AB * 100 / 2).toFixed(0)} cm`, 
        feedback: "Incorrect. The equilibrium point is not at the midpoint because the charges are different." 
      },
      { 
        id: 'd', 
        text: `${(0.12 * qA / (qA + qB) * 100).toFixed(0)} cm`, 
        feedback: "Incorrect. You used a linear ratio instead of the square root relationship for equilibrium." 
      }
    ],
    correctOptionId: 'a',
    explanation: `At equilibrium: qₐ/(0.12-x)² = qᵦ/x² → √(${qA * 1e6})/√(${qB * 1e6}) = (0.12-x)/x → x = 0.12×√${qB * 1e6}/(√${qA * 1e6} + √${qB * 1e6}) = ${(x * 100).toFixed(0)} cm from B`,
    difficulty: "advanced",
    topic: "Equilibrium"
  };
};

// ========================================
// INDIVIDUAL CLOUD FUNCTION EXPORTS REMOVED
// ========================================
// All individual cloud function exports have been removed to prevent
// memory overhead in the master function. Only assessmentConfigs data 
// is exported below for use by the master course2_assessments function.

// Assessment configurations for master function
const assessmentConfigs = {
  'course2_26_basic_force': {
    questions: [
      createBasicForceQuestion(),
      createBasicForceQuestion(),
      createBasicForceQuestion(),
      createBasicForceQuestion(),
      createBasicForceQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_force_scaling': {
    questions: [
      createForceScalingQuestion(),
      createForceScalingQuestion(),
      createForceScalingQuestion(),
      createForceScalingQuestion(),
      createForceScalingQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_unknown_charge': {
    questions: [
      createUnknownChargeQuestion(),
      createUnknownChargeQuestion(),
      createUnknownChargeQuestion(),
      createUnknownChargeQuestion(),
      createUnknownChargeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_spheres_contact': {
    questions: [
      createSpheresContactQuestion(),
      createSpheresContactQuestion(),
      createSpheresContactQuestion(),
      createSpheresContactQuestion(),
      createSpheresContactQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_force_changes': {
    questions: [
      createForceChangeQuestion(),
      createForceChangeQuestion(),
      createForceChangeQuestion(),
      createForceChangeQuestion(),
      createForceChangeQuestion(),
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_third_charge': {
    questions: [
      createThirdChargeQuestion1(),
      createThirdChargeQuestion1(),
      createThirdChargeQuestion1(),
      createThirdChargeQuestion1(),
      createThirdChargeQuestion1()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_larger_charge': {
    questions: [
      createLargerChargeQuestion(),
      createLargerChargeQuestion(),
      createLargerChargeQuestion(),
      createLargerChargeQuestion(),
      createLargerChargeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_triangle_forces': {
    questions: [
      createTriangleChargesQuestion(),
      createTriangleChargesQuestion(),
      createTriangleChargesQuestion(),
      createTriangleChargesQuestion(),
      createTriangleChargesQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_vector_forces': {
    questions: [
      createVectorForceQuestion(),
      createVectorForceQuestion(),
      createVectorForceQuestion(),
      createVectorForceQuestion(),
      createVectorForceQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_minimum_charge': {
    questions: [
      createMinimumChargeQuestion(),
      createMinimumChargeQuestion(),
      createMinimumChargeQuestion(),
      createMinimumChargeQuestion(),
      createMinimumChargeQuestion()
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    pointsValue: 1,
    maxAttempts: 9999,
    showFeedback: true,
    activityType: 'lesson',
    theme: 'indigo'
  },
  'course2_26_equilibrium_position': {
    questions: [
      createEquilibriumPositionQuestion(),
      createEquilibriumPositionQuestion(),
      createEquilibriumPositionQuestion(),
      createEquilibriumPositionQuestion(),
      createEquilibriumPositionQuestion()
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
