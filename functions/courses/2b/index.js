// Course 2b - Physics 30 Cloud Functions (Lessons 25-48)
const admin = require('firebase-admin');
require('dotenv').config();
const { setGlobalOptions } = require('firebase-functions/v2');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options for Gen 2 functions
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 30 
});

//==============================================================================
// Course 2b Assessment Functions - (25-55)
//==============================================================================

// Lesson 25: Electrostatics
exports.course2_25_conservation_of_charge = require('./25-electrostatics/assessments').course2_25_conservation_of_charge;
exports.course2_25_charge_movement_in_solids = require('./25-electrostatics/assessments').course2_25_charge_movement_in_solids;
exports.course2_25_conductor_vs_insulator = require('./25-electrostatics/assessments').course2_25_conductor_vs_insulator;
exports.course2_25_electrostatic_series = require('./25-electrostatics/assessments').course2_25_electrostatic_series;
exports.course2_25_electron_charge = require('./25-electrostatics/assessments').course2_25_electron_charge;
exports.course2_25_induced_charge = require('./25-electrostatics/assessments').course2_25_induced_charge;
exports.course2_25_conduction_charging = require('./25-electrostatics/assessments').course2_25_conduction_charging;
exports.course2_25_induction_charging = require('./25-electrostatics/assessments').course2_25_induction_charging;
exports.course2_25_conduction_result = require('./25-electrostatics/assessments').course2_25_conduction_result;
exports.course2_25_induction_result = require('./25-electrostatics/assessments').course2_25_induction_result;
exports.course2_25_spheres_charge = require('./25-electrostatics/assessments').course2_25_spheres_charge;
exports.course2_25_different_spheres = require('./25-electrostatics/assessments').course2_25_different_spheres;

// Lesson 26: Coulomb's Law
exports.course2_26_basic_force = require('./26-coulombs-law/assessments').course2_26_basic_force;
exports.course2_26_force_scaling = require('./26-coulombs-law/assessments').course2_26_force_scaling;
exports.course2_26_unknown_charge = require('./26-coulombs-law/assessments').course2_26_unknown_charge;
exports.course2_26_spheres_contact = require('./26-coulombs-law/assessments').course2_26_spheres_contact;
exports.course2_26_force_changes = require('./26-coulombs-law/assessments').course2_26_force_changes;
exports.course2_26_third_charge = require('./26-coulombs-law/assessments').course2_26_third_charge;
exports.course2_26_larger_charge = require('./26-coulombs-law/assessments').course2_26_larger_charge;
exports.course2_26_triangle_forces = require('./26-coulombs-law/assessments').course2_26_triangle_forces;
exports.course2_26_vector_forces = require('./26-coulombs-law/assessments').course2_26_vector_forces;
exports.course2_26_minimum_charge = require('./26-coulombs-law/assessments').course2_26_minimum_charge;
exports.course2_26_equilibrium_position = require('./26-coulombs-law/assessments').course2_26_equilibrium_position;

// Assignment 28: L13-14 Assignment - Electrostatics
exports.course2_28_l1314_question1 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question1;
exports.course2_28_l1314_question2 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question2;
exports.course2_28_l1314_question3 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question3;
exports.course2_28_l1314_question4 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question4;
exports.course2_28_l1314_question5 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question5;
exports.course2_28_l1314_question6 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question6;
exports.course2_28_l1314_question7 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question7;
exports.course2_28_l1314_question8 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question8;
exports.course2_28_l1314_question9 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question9;
exports.course2_28_l1314_question10 = require('./28-l13-14-assignment/assessments').course2_28_l1314_question10;

// Lesson 29: Electric Fields
exports.course2_29_electric_field = require('./29-electric-fields/assessments').course2_29_electric_field;
exports.course2_29_electric_field_direction = require('./29-electric-fields/assessments').course2_29_electric_field_direction;
exports.course2_29_field_strength = require('./29-electric-fields/assessments').course2_29_field_strength;
exports.course2_29_field_vector = require('./29-electric-fields/assessments').course2_29_field_vector;
exports.course2_29_charge_in_field = require('./29-electric-fields/assessments').course2_29_charge_in_field;
exports.course2_29_field_multiple_charges = require('./29-electric-fields/assessments').course2_29_field_multiple_charges;

// Lesson 30: Electric Potential  
exports.course2_30_potential_definition = require('./30-electric-potential/assessments').course2_30_potential_definition;
exports.course2_30_potential_energy = require('./30-electric-potential/assessments').course2_30_potential_energy;
exports.course2_30_potential_calculation = require('./30-electric-potential/assessments').course2_30_potential_calculation;
exports.course2_30_voltage_work = require('./30-electric-potential/assessments').course2_30_voltage_work;
exports.course2_30_electron_acceleration = require('./30-electric-potential/assessments').course2_30_electron_acceleration;

// Lesson 31: Parallel Plates
exports.course2_31_plate_field = require('./31-parallel-plates/assessments').course2_31_plate_field;
exports.course2_31_plate_potential = require('./31-parallel-plates/assessments').course2_31_plate_potential;
exports.course2_31_electron_motion = require('./31-parallel-plates/assessments').course2_31_electron_motion;
exports.course2_31_field_strength_plates = require('./31-parallel-plates/assessments').course2_31_field_strength_plates;

// Lesson 32: Electric Current
exports.course2_32_current_definition = require('./32-electric-current/assessments').course2_32_current_definition;
exports.course2_32_current_calculation = require('./32-electric-current/assessments').course2_32_current_calculation;
exports.course2_32_resistance_ohm = require('./32-electric-current/assessments').course2_32_resistance_ohm;
exports.course2_32_power_calculation = require('./32-electric-current/assessments').course2_32_power_calculation;
exports.course2_32_energy_cost = require('./32-electric-current/assessments').course2_32_energy_cost;

// Assignment 34: L15-18 Assignment - Electric Fields and Current
exports.course2_34_l1518_question1 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question1;
exports.course2_34_l1518_question2 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question2;
exports.course2_34_l1518_question3 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question3;
exports.course2_34_l1518_question4 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question4;
exports.course2_34_l1518_question5 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question5;
exports.course2_34_l1518_question6 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question6;
exports.course2_34_l1518_question7 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question7;
exports.course2_34_l1518_question8 = require('./34-l15-18-assignment/assessments').course2_34_l1518_question8;

// Assignment 35: L1-18 Cumulative Assignment - Electrostatics to Current
exports.course2_35_l118_question1 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question1;
exports.course2_35_l118_question2 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question2;
exports.course2_35_l118_question3 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question3;
exports.course2_35_l118_question4 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question4;
exports.course2_35_l118_question5 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question5;
exports.course2_35_l118_question6 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question6;
exports.course2_35_l118_question7 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question7;
exports.course2_35_l118_question8 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question8;
exports.course2_35_l118_question9 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question9;
exports.course2_35_l118_question10 = require('./35-l1-18-cumulative-assignment/assessments').course2_35_l118_question10;

// Lesson 36: Magnetic Fields
exports.course2_36_magnetic_field = require('./36-magnetic-fields/assessments').course2_36_magnetic_field;
exports.course2_36_magnetic_field_direction = require('./36-magnetic-fields/assessments').course2_36_magnetic_field_direction;
exports.course2_36_field_patterns = require('./36-magnetic-fields/assessments').course2_36_field_patterns;
exports.course2_36_earth_magnetism = require('./36-magnetic-fields/assessments').course2_36_earth_magnetism;

// Lesson 37: Magnetic Forces on Particles
exports.course2_37_particle_force = require('./37-magnetic-forces-particles/assessments').course2_37_particle_force;
exports.course2_37_force_direction = require('./37-magnetic-forces-particles/assessments').course2_37_force_direction;
exports.course2_37_circular_motion = require('./37-magnetic-forces-particles/assessments').course2_37_circular_motion;
exports.course2_37_radius_calculation = require('./37-magnetic-forces-particles/assessments').course2_37_radius_calculation;

// Lesson 38: Motor Effect
exports.course2_38_motor_principle = require('./38-motor-effect/assessments').course2_38_motor_principle;
exports.course2_38_force_on_conductor = require('./38-motor-effect/assessments').course2_38_force_on_conductor;
exports.course2_38_motor_components = require('./38-motor-effect/assessments').course2_38_motor_components;
exports.course2_38_right_hand_rule = require('./38-motor-effect/assessments').course2_38_right_hand_rule;

// Assignment 39: L19-21 Assignment - Magnetism
exports.course2_39_l1921_question1 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question1;
exports.course2_39_l1921_question2 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question2;
exports.course2_39_l1921_question3 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question3;
exports.course2_39_l1921_question4 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question4;
exports.course2_39_l1921_question5 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question5;
exports.course2_39_l1921_question6 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question6;
exports.course2_39_l1921_question7 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question7;
exports.course2_39_l1921_question8 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question8;
exports.course2_39_l1921_question9 = require('./39-l19-21-assignment/assessments').course2_39_l1921_question9;

// Lesson 40: Generator Effect
exports.course2_40_generator_principle = require('./40-generator-effect/assessments').course2_40_generator_principle;
exports.course2_40_emf_generation = require('./40-generator-effect/assessments').course2_40_emf_generation;
exports.course2_40_lenz_law = require('./40-generator-effect/assessments').course2_40_lenz_law;
exports.course2_40_faraday_law = require('./40-generator-effect/assessments').course2_40_faraday_law;

// Lesson 42: Electromagnetic Radiation
exports.course2_42_em_spectrum = require('./42-electromagnetic-radiation/assessments').course2_42_em_spectrum;
exports.course2_42_wave_properties = require('./42-electromagnetic-radiation/assessments').course2_42_wave_properties;
exports.course2_42_energy_frequency = require('./42-electromagnetic-radiation/assessments').course2_42_energy_frequency;
exports.course2_42_wave_speed = require('./42-electromagnetic-radiation/assessments').course2_42_wave_speed;

// Lab 43: Electromagnet Lab
exports.course2_lab_electromagnet = require('./43-lab-electromagnet/assessments').course2_lab_electromagnet;

// Assignment 44: L22-24 Assignment - Electromagnetic Induction
exports.course2_44_l2224_question1 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question1;
exports.course2_44_l2224_question2 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question2;
exports.course2_44_l2224_question3 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question3;
exports.course2_44_l2224_question4 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question4;
exports.course2_44_l2224_question5 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question5;
exports.course2_44_l2224_question6 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question6;
exports.course2_44_l2224_question7 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question7;
exports.course2_44_l2224_question8 = require('./44-l22-24-assignment/assessments').course2_44_l2224_question8;

// Assignment 45: L1-24 Cumulative Assignment - Units 3-4 Review
exports.course2_45_l124_question1 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question1;
exports.course2_45_l124_question2 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question2;
exports.course2_45_l124_question3 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question3;
exports.course2_45_l124_question4 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question4;
exports.course2_45_l124_question5 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question5;
exports.course2_45_l124_question6 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question6;
exports.course2_45_l124_question7 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question7;
exports.course2_45_l124_question8 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question8;
exports.course2_45_l124_question9 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question9;
exports.course2_45_l124_question10 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question10;
exports.course2_45_l124_question11 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question11;
exports.course2_45_l124_question12 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question12;
exports.course2_45_l124_question13 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question13;
exports.course2_45_l124_question14 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question14;
exports.course2_45_l124_question15 = require('./45-l1-24-cumulative-assignment/assessments').course2_45_l124_question15;

// Unit 3 Review: Electricity and Electric Fields
exports.course2_46_unit3_q1 = require('./46-unit-3-review/assessments').course2_46_unit3_q1;
exports.course2_46_unit3_q2 = require('./46-unit-3-review/assessments').course2_46_unit3_q2;
exports.course2_46_unit3_q3 = require('./46-unit-3-review/assessments').course2_46_unit3_q3;
exports.course2_46_unit3_q4 = require('./46-unit-3-review/assessments').course2_46_unit3_q4;
exports.course2_46_unit3_q5 = require('./46-unit-3-review/assessments').course2_46_unit3_q5;
exports.course2_46_unit3_q6 = require('./46-unit-3-review/assessments').course2_46_unit3_q6;
exports.course2_46_unit3_q7 = require('./46-unit-3-review/assessments').course2_46_unit3_q7;
exports.course2_46_unit3_q8 = require('./46-unit-3-review/assessments').course2_46_unit3_q8;
exports.course2_46_unit3_q9 = require('./46-unit-3-review/assessments').course2_46_unit3_q9;
exports.course2_46_unit3_q10 = require('./46-unit-3-review/assessments').course2_46_unit3_q10;
exports.course2_46_unit3_q11 = require('./46-unit-3-review/assessments').course2_46_unit3_q11;
exports.course2_46_unit3_q12 = require('./46-unit-3-review/assessments').course2_46_unit3_q12;
exports.course2_46_unit3_q13 = require('./46-unit-3-review/assessments').course2_46_unit3_q13;
exports.course2_46_unit3_q14 = require('./46-unit-3-review/assessments').course2_46_unit3_q14;
exports.course2_46_unit3_q15 = require('./46-unit-3-review/assessments').course2_46_unit3_q15;

// Unit 4 Review: Magnetism and Electromagnetic Phenomena
exports.course2_47_unit4_q1 = require('./47-unit-4-review/assessments').course2_47_unit4_q1;
exports.course2_47_unit4_q2 = require('./47-unit-4-review/assessments').course2_47_unit4_q2;
exports.course2_47_unit4_q3 = require('./47-unit-4-review/assessments').course2_47_unit4_q3;
exports.course2_47_unit4_q4 = require('./47-unit-4-review/assessments').course2_47_unit4_q4;
exports.course2_47_unit4_q5 = require('./47-unit-4-review/assessments').course2_47_unit4_q5;
exports.course2_47_unit4_q6 = require('./47-unit-4-review/assessments').course2_47_unit4_q6;
exports.course2_47_unit4_q7 = require('./47-unit-4-review/assessments').course2_47_unit4_q7;
exports.course2_47_unit4_q8 = require('./47-unit-4-review/assessments').course2_47_unit4_q8;
exports.course2_47_unit4_q9 = require('./47-unit-4-review/assessments').course2_47_unit4_q9;
exports.course2_47_unit4_q10 = require('./47-unit-4-review/assessments').course2_47_unit4_q10;
exports.course2_47_unit4_q11 = require('./47-unit-4-review/assessments').course2_47_unit4_q11;
exports.course2_47_unit4_q12 = require('./47-unit-4-review/assessments').course2_47_unit4_q12;
exports.course2_47_unit4_q13 = require('./47-unit-4-review/assessments').course2_47_unit4_q13;
exports.course2_47_unit4_q14 = require('./47-unit-4-review/assessments').course2_47_unit4_q14;
exports.course2_47_unit4_q15 = require('./47-unit-4-review/assessments').course2_47_unit4_q15;
