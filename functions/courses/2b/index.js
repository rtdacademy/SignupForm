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
