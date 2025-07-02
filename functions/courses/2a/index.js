// Course 2a - Physics 30 Cloud Functions (Lessons 01-12)
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
// Course 2a Assessment Functions - Lessons 01-12
//==============================================================================

// Lesson 01 - Physics 20 Review
exports.course2_01_physics_20_review_circular_q1 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_circular_q1;
exports.course2_01_physics_20_review_circular_q2 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_circular_q2;
exports.course2_01_physics_20_review_circular_q3 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_circular_q3;
exports.course2_01_physics_20_review_circular_q4 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_circular_q4;
exports.course2_01_physics_20_review_dynamics_q1a = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q1a;
exports.course2_01_physics_20_review_dynamics_q2 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q2;
exports.course2_01_physics_20_review_dynamics_q3 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q3;
exports.course2_01_physics_20_review_dynamics_q4 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q4;
exports.course2_01_physics_20_review_dynamics_q5 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q5;
exports.course2_01_physics_20_review_dynamics_q6 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q6;
exports.course2_01_physics_20_review_dynamics_q7 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q7;
exports.course2_01_physics_20_review_dynamics_q8 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q8;
exports.course2_01_physics_20_review_dynamics_q9 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q9;
exports.course2_01_physics_20_review_question1 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question1;
exports.course2_01_physics_20_review_question10 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question10;
exports.course2_01_physics_20_review_question11 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question11;
exports.course2_01_physics_20_review_question12 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question12;
exports.course2_01_physics_20_review_question2 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question2;
exports.course2_01_physics_20_review_question3 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question3;
exports.course2_01_physics_20_review_question4 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question4;
exports.course2_01_physics_20_review_question5 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question5;
exports.course2_01_physics_20_review_question6 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question6;
exports.course2_01_physics_20_review_question7 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question7;
exports.course2_01_physics_20_review_question8 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question8;
exports.course2_01_physics_20_review_question9 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_question9;
exports.course2_01_physics_20_review_vector_q1 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q1;
exports.course2_01_physics_20_review_vector_q2 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q2;
exports.course2_01_physics_20_review_vector_q3 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q3;
exports.course2_01_physics_20_review_vector_q4 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q4;
exports.course2_01_physics_20_review_vector_q5 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q5;
exports.course2_01_physics_20_review_vector_q6 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q6;
exports.course2_01_physics_20_review_vector_q7 = require('./01-physics-20-review/assessments').course2_01_physics_20_review_vector_q7;

// Lesson 02 - Momentum One Dimension
exports.course2_02_arrow_apple_mass = require('./02-momentum-one-dimension/assessments').course2_02_arrow_apple_mass;
exports.course2_02_astronaut_recoil = require('./02-momentum-one-dimension/assessments').course2_02_astronaut_recoil;
exports.course2_02_atom_collision = require('./02-momentum-one-dimension/assessments').course2_02_atom_collision;
exports.course2_02_ball_collision_type = require('./02-momentum-one-dimension/assessments').course2_02_ball_collision_type;
exports.course2_02_ballistic_pendulum = require('./02-momentum-one-dimension/assessments').course2_02_ballistic_pendulum;
exports.course2_02_bowling_ball_momentum = require('./02-momentum-one-dimension/assessments').course2_02_bowling_ball_momentum;
exports.course2_02_bullet_velocity = require('./02-momentum-one-dimension/assessments').course2_02_bullet_velocity;
exports.course2_02_canoe_comparison = require('./02-momentum-one-dimension/assessments').course2_02_canoe_comparison;
exports.course2_02_cart_jumping = require('./02-momentum-one-dimension/assessments').course2_02_cart_jumping;
exports.course2_02_collision_rebound = require('./02-momentum-one-dimension/assessments').course2_02_collision_rebound;
exports.course2_02_football_tackle_mass = require('./02-momentum-one-dimension/assessments').course2_02_football_tackle_mass;
exports.course2_02_hockey_puck_mass = require('./02-momentum-one-dimension/assessments').course2_02_hockey_puck_mass;
exports.course2_02_jet_momentum_a = require('./02-momentum-one-dimension/assessments').course2_02_jet_momentum_a;
exports.course2_02_jet_momentum_b = require('./02-momentum-one-dimension/assessments').course2_02_jet_momentum_b;
exports.course2_02_machine_gun_recoil = require('./02-momentum-one-dimension/assessments').course2_02_machine_gun_recoil;
exports.course2_02_momentum_inertia_difference = require('./02-momentum-one-dimension/assessments').course2_02_momentum_inertia_difference;
exports.course2_02_momentum_one_dimension_aiLongAnswer = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_aiLongAnswer;
exports.course2_02_momentum_one_dimension_aiQuestion = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_aiQuestion;
exports.course2_02_momentum_one_dimension_kc_q1 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q1;
exports.course2_02_momentum_one_dimension_kc_q10 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q10;
exports.course2_02_momentum_one_dimension_kc_q11 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q11;
exports.course2_02_momentum_one_dimension_kc_q12 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q12;
exports.course2_02_momentum_one_dimension_kc_q13 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q13;
exports.course2_02_momentum_one_dimension_kc_q14 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q14;
exports.course2_02_momentum_one_dimension_kc_q15 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q15;
exports.course2_02_momentum_one_dimension_kc_q16 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q16;
exports.course2_02_momentum_one_dimension_kc_q17 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q17;
exports.course2_02_momentum_one_dimension_kc_q18 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q18;
exports.course2_02_momentum_one_dimension_kc_q19 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q19;
exports.course2_02_momentum_one_dimension_kc_q2 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q2;
exports.course2_02_momentum_one_dimension_kc_q3 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q3;
exports.course2_02_momentum_one_dimension_kc_q4 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q4;
exports.course2_02_momentum_one_dimension_kc_q5 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q5;
exports.course2_02_momentum_one_dimension_kc_q6 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q6;
exports.course2_02_momentum_one_dimension_kc_q7 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q7;
exports.course2_02_momentum_one_dimension_kc_q8 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q8;
exports.course2_02_momentum_one_dimension_kc_q9 = require('./02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q9;
exports.course2_02_rocket_separation = require('./02-momentum-one-dimension/assessments').course2_02_rocket_separation;
exports.course2_02_truck_car_headon = require('./02-momentum-one-dimension/assessments').course2_02_truck_car_headon;
exports.course2_02_unknown_mass_collision = require('./02-momentum-one-dimension/assessments').course2_02_unknown_mass_collision;
exports.course2_02_uranium_disintegration = require('./02-momentum-one-dimension/assessments').course2_02_uranium_disintegration;

// Lesson 03 - Momentum Two Dimensions
exports.course2_03_car_truck_2d_collision = require('./03-momentum-two-dimensions/assessments').course2_03_car_truck_2d_collision;
exports.course2_03_elastic_collision_90 = require('./03-momentum-two-dimensions/assessments').course2_03_elastic_collision_90;
exports.course2_03_glancing_collision_2d = require('./03-momentum-two-dimensions/assessments').course2_03_glancing_collision_2d;
exports.course2_03_mass_explosion = require('./03-momentum-two-dimensions/assessments').course2_03_mass_explosion;
exports.course2_03_nuclear_decay_2d = require('./03-momentum-two-dimensions/assessments').course2_03_nuclear_decay_2d;
exports.course2_03_plasticene_collision = require('./03-momentum-two-dimensions/assessments').course2_03_plasticene_collision;
exports.course2_03_space_capsule_projectile = require('./03-momentum-two-dimensions/assessments').course2_03_space_capsule_projectile;
exports.course2_03_steel_ball_deflection = require('./03-momentum-two-dimensions/assessments').course2_03_steel_ball_deflection;

// Lesson 04 - Impulse Momentum Change
exports.course2_04_ball_bat = require('./04-impulse-momentum-change/assessments').course2_04_ball_bat;
exports.course2_04_basic_impulse = require('./04-impulse-momentum-change/assessments').course2_04_basic_impulse;
exports.course2_04_bullet_wood = require('./04-impulse-momentum-change/assessments').course2_04_bullet_wood;
exports.course2_04_child_ball = require('./04-impulse-momentum-change/assessments').course2_04_child_ball;
exports.course2_04_golf_ball_driver = require('./04-impulse-momentum-change/assessments').course2_04_golf_ball_driver;
exports.course2_04_impulse_quantities = require('./04-impulse-momentum-change/assessments').course2_04_impulse_quantities;
exports.course2_04_karate_board = require('./04-impulse-momentum-change/assessments').course2_04_karate_board;
exports.course2_04_person_falling = require('./04-impulse-momentum-change/assessments').course2_04_person_falling;
exports.course2_04_safety_features = require('./04-impulse-momentum-change/assessments').course2_04_safety_features;
exports.course2_04_water_turbine = require('./04-impulse-momentum-change/assessments').course2_04_water_turbine;

// Lesson 05 - L1-3 Assignment
exports.course2_05_l13_question1 = require('./05-l1-3-assignment/assessments').course2_05_l13_question1;
exports.course2_05_l13_question10 = require('./05-l1-3-assignment/assessments').course2_05_l13_question10;
exports.course2_05_l13_question11 = require('./05-l1-3-assignment/assessments').course2_05_l13_question11;
exports.course2_05_l13_question12 = require('./05-l1-3-assignment/assessments').course2_05_l13_question12;
exports.course2_05_l13_question2 = require('./05-l1-3-assignment/assessments').course2_05_l13_question2;
exports.course2_05_l13_question3 = require('./05-l1-3-assignment/assessments').course2_05_l13_question3;
exports.course2_05_l13_question4 = require('./05-l1-3-assignment/assessments').course2_05_l13_question4;
exports.course2_05_l13_question5 = require('./05-l1-3-assignment/assessments').course2_05_l13_question5;
exports.course2_05_l13_question6 = require('./05-l1-3-assignment/assessments').course2_05_l13_question6;
exports.course2_05_l13_question7 = require('./05-l1-3-assignment/assessments').course2_05_l13_question7;
exports.course2_05_l13_question8 = require('./05-l1-3-assignment/assessments').course2_05_l13_question8;
exports.course2_05_l13_question9 = require('./05-l1-3-assignment/assessments').course2_05_l13_question9;

// Lesson 06 - Graphing Techniques
exports.course2_06_graphing_techniques_question1 = require('./06-graphing-techniques/assessments').course2_06_graphing_techniques_question1;
exports.course2_06_graphing_techniques_question2 = require('./06-graphing-techniques/assessments').course2_06_graphing_techniques_question2;
exports.course2_06_graphing_techniques_question3 = require('./06-graphing-techniques/assessments').course2_06_graphing_techniques_question3;
exports.course2_06_graphing_techniques_question4 = require('./06-graphing-techniques/assessments').course2_06_graphing_techniques_question4;

// Lesson 07 - Lab Momentum Conservation
exports.course2_lab_momentum_conservation = require('./07-lab-momentum-conservation/assessments').course2_lab_momentum_conservation;

// Lesson 08 - L1-4 Cumulative Assignment
exports.course2_08_l14_question1 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question1;
exports.course2_08_l14_question10 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question10;
exports.course2_08_l14_question2 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question2;
exports.course2_08_l14_question3 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question3;
exports.course2_08_l14_question4 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question4;
exports.course2_08_l14_question5 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question5;
exports.course2_08_l14_question6 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question6;
exports.course2_08_l14_question7 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question7;
exports.course2_08_l14_question8 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question8;
exports.course2_08_l14_question9 = require('./08-l1-4-cumulative-assignment/assessments').course2_08_l14_question9;

// Lesson 12 - L5-7 Assignment
exports.course2_12_l57_question1 = require('./12-l5-7-assignment/assessments').course2_12_l57_question1;
exports.course2_12_l57_question10 = require('./12-l5-7-assignment/assessments').course2_12_l57_question10;
exports.course2_12_l57_question2 = require('./12-l5-7-assignment/assessments').course2_12_l57_question2;
exports.course2_12_l57_question3 = require('./12-l5-7-assignment/assessments').course2_12_l57_question3;
exports.course2_12_l57_question4 = require('./12-l5-7-assignment/assessments').course2_12_l57_question4;
exports.course2_12_l57_question5 = require('./12-l5-7-assignment/assessments').course2_12_l57_question5;
exports.course2_12_l57_question6 = require('./12-l5-7-assignment/assessments').course2_12_l57_question6;
exports.course2_12_l57_question7 = require('./12-l5-7-assignment/assessments').course2_12_l57_question7;
exports.course2_12_l57_question8 = require('./12-l5-7-assignment/assessments').course2_12_l57_question8;
exports.course2_12_l57_question9 = require('./12-l5-7-assignment/assessments').course2_12_l57_question9;

