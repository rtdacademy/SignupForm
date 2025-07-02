// Course 2a2 - Physics 30 Cloud Functions (Lessons 13-24)
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
// Course 2a2 Assessment Functions - Lessons 13-24
//==============================================================================

// Lesson 13 - Refraction of Light
exports.course2_13_critical_q1 = require('./13-refraction-of-light/assessments').course2_13_critical_q1;
exports.course2_13_critical_q2 = require('./13-refraction-of-light/assessments').course2_13_critical_q2;
exports.course2_13_critical_q3 = require('./13-refraction-of-light/assessments').course2_13_critical_q3;
exports.course2_13_refraction_kc_q1 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q1;
exports.course2_13_refraction_kc_q2 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q2;
exports.course2_13_refraction_kc_q3 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q3;
exports.course2_13_refraction_kc_q4 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q4;
exports.course2_13_refraction_kc_q5 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q5;
exports.course2_13_refraction_kc_q6 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q6;
exports.course2_13_refraction_kc_q7 = require('./13-refraction-of-light/assessments').course2_13_refraction_kc_q7;
exports.course2_13_slideshow_q1 = require('./13-refraction-of-light/assessments').course2_13_slideshow_q1;
exports.course2_13_slideshow_q2 = require('./13-refraction-of-light/assessments').course2_13_slideshow_q2;

// Lesson 15 - Lab Mirrors Lenses
exports.course2_lab_mirrors_lenses = require('./15-lab-mirrors-lenses/assessments').course2_lab_mirrors_lenses;

// Lesson 16 - L8-9 Assignment
exports.course2_16_l89_question1 = require('./16-l8-9-assignment/assessments').course2_16_l89_question1;
exports.course2_16_l89_question2 = require('./16-l8-9-assignment/assessments').course2_16_l89_question2;
exports.course2_16_l89_question3 = require('./16-l8-9-assignment/assessments').course2_16_l89_question3;
exports.course2_16_l89_question4 = require('./16-l8-9-assignment/assessments').course2_16_l89_question4;
exports.course2_16_l89_question5 = require('./16-l8-9-assignment/assessments').course2_16_l89_question5;
exports.course2_16_l89_question6 = require('./16-l8-9-assignment/assessments').course2_16_l89_question6;
exports.course2_16_l89_question7 = require('./16-l8-9-assignment/assessments').course2_16_l89_question7;
exports.course2_16_l89_question8 = require('./16-l8-9-assignment/assessments').course2_16_l89_question8;

// Lesson 17 - Dispersion Scattering
exports.course2_17_cat_color_vision = require('./17-dispersion-scattering/assessments').course2_17_cat_color_vision;
exports.course2_17_clothing_color_heat = require('./17-dispersion-scattering/assessments').course2_17_clothing_color_heat;
exports.course2_17_diamond_dispersion = require('./17-dispersion-scattering/assessments').course2_17_diamond_dispersion;
exports.course2_17_dispersion_air_speeds = require('./17-dispersion-scattering/assessments').course2_17_dispersion_air_speeds;
exports.course2_17_green_object_lighting = require('./17-dispersion-scattering/assessments').course2_17_green_object_lighting;
exports.course2_17_microscopy_scattering = require('./17-dispersion-scattering/assessments').course2_17_microscopy_scattering;
exports.course2_17_moonlight_colorless = require('./17-dispersion-scattering/assessments').course2_17_moonlight_colorless;
exports.course2_17_red_orange_difference = require('./17-dispersion-scattering/assessments').course2_17_red_orange_difference;
exports.course2_17_stage_lighting_color = require('./17-dispersion-scattering/assessments').course2_17_stage_lighting_color;
exports.course2_17_window_glass_dispersion = require('./17-dispersion-scattering/assessments').course2_17_window_glass_dispersion;

// Lesson 18 - Interference of Light
exports.course2_18_coherence_requirement = require('./18-interference-of-light/assessments').course2_18_coherence_requirement;
exports.course2_18_constructive_amplitude = require('./18-interference-of-light/assessments').course2_18_constructive_amplitude;
exports.course2_18_dark_fringes_cause = require('./18-interference-of-light/assessments').course2_18_dark_fringes_cause;
exports.course2_18_destructive_amplitude = require('./18-interference-of-light/assessments').course2_18_destructive_amplitude;
exports.course2_18_fringe_count_factors = require('./18-interference-of-light/assessments').course2_18_fringe_count_factors;
exports.course2_18_lightbulb_incoherence = require('./18-interference-of-light/assessments').course2_18_lightbulb_incoherence;
exports.course2_18_path_difference_interference = require('./18-interference-of-light/assessments').course2_18_path_difference_interference;
exports.course2_18_single_slit_blocking = require('./18-interference-of-light/assessments').course2_18_single_slit_blocking;
exports.course2_18_sound_dead_spots = require('./18-interference-of-light/assessments').course2_18_sound_dead_spots;
exports.course2_18_wavelength_fringe_spacing = require('./18-interference-of-light/assessments').course2_18_wavelength_fringe_spacing;

// Lesson 19 - Diffraction Gratings
exports.course2_19_bright_dark_bands = require('./19-diffraction-gratings/assessments').course2_19_bright_dark_bands;
exports.course2_19_cd_player_laser = require('./19-diffraction-gratings/assessments').course2_19_cd_player_laser;
exports.course2_19_distance_change = require('./19-diffraction-gratings/assessments').course2_19_distance_change;
exports.course2_19_frequency_change = require('./19-diffraction-gratings/assessments').course2_19_frequency_change;
exports.course2_19_frequency_measurement = require('./19-diffraction-gratings/assessments').course2_19_frequency_measurement;
exports.course2_19_frequency_third_order = require('./19-diffraction-gratings/assessments').course2_19_frequency_third_order;
exports.course2_19_grating_change = require('./19-diffraction-gratings/assessments').course2_19_grating_change;
exports.course2_19_green_light_grating = require('./19-diffraction-gratings/assessments').course2_19_green_light_grating;
exports.course2_19_second_order_minimum = require('./19-diffraction-gratings/assessments').course2_19_second_order_minimum;
exports.course2_19_spectral_orders_red = require('./19-diffraction-gratings/assessments').course2_19_spectral_orders_red;
exports.course2_19_water_trough_fringes = require('./19-diffraction-gratings/assessments').course2_19_water_trough_fringes;
exports.course2_19_yellow_light_spacing = require('./19-diffraction-gratings/assessments').course2_19_yellow_light_spacing;

// Lesson 21 - L1-12 Cumulative Assignment
exports.course2_21_l112_question1 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question1;
exports.course2_21_l112_question10 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question10;
exports.course2_21_l112_question2 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question2;
exports.course2_21_l112_question3 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question3;
exports.course2_21_l112_question4 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question4;
exports.course2_21_l112_question5 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question5;
exports.course2_21_l112_question6 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question6;
exports.course2_21_l112_question7 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question7;
exports.course2_21_l112_question8 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question8;
exports.course2_21_l112_question9 = require('./21-l1-12-cumulative-assignment/assessments').course2_21_l112_question9;

// Lesson 22 - Unit 1 Review
exports.course2_22_unit1_q10 = require('./22-unit-1-review/assessments').course2_22_unit1_q10;
exports.course2_22_unit1_q11 = require('./22-unit-1-review/assessments').course2_22_unit1_q11;
exports.course2_22_unit1_q12 = require('./22-unit-1-review/assessments').course2_22_unit1_q12;
exports.course2_22_unit1_q13a = require('./22-unit-1-review/assessments').course2_22_unit1_q13a;
exports.course2_22_unit1_q13b = require('./22-unit-1-review/assessments').course2_22_unit1_q13b;
exports.course2_22_unit1_q14 = require('./22-unit-1-review/assessments').course2_22_unit1_q14;
exports.course2_22_unit1_q15 = require('./22-unit-1-review/assessments').course2_22_unit1_q15;
exports.course2_22_unit1_q16 = require('./22-unit-1-review/assessments').course2_22_unit1_q16;
exports.course2_22_unit1_q17 = require('./22-unit-1-review/assessments').course2_22_unit1_q17;
exports.course2_22_unit1_q1a = require('./22-unit-1-review/assessments').course2_22_unit1_q1a;
exports.course2_22_unit1_q1b = require('./22-unit-1-review/assessments').course2_22_unit1_q1b;
exports.course2_22_unit1_q2 = require('./22-unit-1-review/assessments').course2_22_unit1_q2;
exports.course2_22_unit1_q3a = require('./22-unit-1-review/assessments').course2_22_unit1_q3a;
exports.course2_22_unit1_q3b = require('./22-unit-1-review/assessments').course2_22_unit1_q3b;
exports.course2_22_unit1_q4a = require('./22-unit-1-review/assessments').course2_22_unit1_q4a;
exports.course2_22_unit1_q4b = require('./22-unit-1-review/assessments').course2_22_unit1_q4b;
exports.course2_22_unit1_q5 = require('./22-unit-1-review/assessments').course2_22_unit1_q5;
exports.course2_22_unit1_q6 = require('./22-unit-1-review/assessments').course2_22_unit1_q6;
exports.course2_22_unit1_q7 = require('./22-unit-1-review/assessments').course2_22_unit1_q7;
exports.course2_22_unit1_q8 = require('./22-unit-1-review/assessments').course2_22_unit1_q8;
exports.course2_22_unit1_q9a = require('./22-unit-1-review/assessments').course2_22_unit1_q9a;
exports.course2_22_unit1_q9b = require('./22-unit-1-review/assessments').course2_22_unit1_q9b;

// Lesson 23 - Unit 2 Review
exports.course2_23_unit2_q1 = require('./23-unit-2-review/assessments').course2_23_unit2_q1;
exports.course2_23_unit2_q10 = require('./23-unit-2-review/assessments').course2_23_unit2_q10;
exports.course2_23_unit2_q11a = require('./23-unit-2-review/assessments').course2_23_unit2_q11a;
exports.course2_23_unit2_q11b = require('./23-unit-2-review/assessments').course2_23_unit2_q11b;
exports.course2_23_unit2_q12a = require('./23-unit-2-review/assessments').course2_23_unit2_q12a;
exports.course2_23_unit2_q12b = require('./23-unit-2-review/assessments').course2_23_unit2_q12b;
exports.course2_23_unit2_q13 = require('./23-unit-2-review/assessments').course2_23_unit2_q13;
exports.course2_23_unit2_q14 = require('./23-unit-2-review/assessments').course2_23_unit2_q14;
exports.course2_23_unit2_q15 = require('./23-unit-2-review/assessments').course2_23_unit2_q15;
exports.course2_23_unit2_q16 = require('./23-unit-2-review/assessments').course2_23_unit2_q16;
exports.course2_23_unit2_q17 = require('./23-unit-2-review/assessments').course2_23_unit2_q17;
exports.course2_23_unit2_q18 = require('./23-unit-2-review/assessments').course2_23_unit2_q18;
exports.course2_23_unit2_q2 = require('./23-unit-2-review/assessments').course2_23_unit2_q2;
exports.course2_23_unit2_q3 = require('./23-unit-2-review/assessments').course2_23_unit2_q3;
exports.course2_23_unit2_q4 = require('./23-unit-2-review/assessments').course2_23_unit2_q4;
exports.course2_23_unit2_q5a = require('./23-unit-2-review/assessments').course2_23_unit2_q5a;
exports.course2_23_unit2_q5b = require('./23-unit-2-review/assessments').course2_23_unit2_q5b;
exports.course2_23_unit2_q6a = require('./23-unit-2-review/assessments').course2_23_unit2_q6a;
exports.course2_23_unit2_q6b = require('./23-unit-2-review/assessments').course2_23_unit2_q6b;
exports.course2_23_unit2_q7a = require('./23-unit-2-review/assessments').course2_23_unit2_q7a;
exports.course2_23_unit2_q7b = require('./23-unit-2-review/assessments').course2_23_unit2_q7b;
exports.course2_23_unit2_q8a = require('./23-unit-2-review/assessments').course2_23_unit2_q8a;
exports.course2_23_unit2_q8b = require('./23-unit-2-review/assessments').course2_23_unit2_q8b;
exports.course2_23_unit2_q9 = require('./23-unit-2-review/assessments').course2_23_unit2_q9;

// Lesson 24 - Section 1 Exam
exports.course2_24_section1_exam_long1 = require('./24-section-1-exam/assessments').course2_24_section1_exam_long1;
exports.course2_24_section1_exam_long2 = require('./24-section-1-exam/assessments').course2_24_section1_exam_long2;
exports.course2_24_section1_exam_q1 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q1;
exports.course2_24_section1_exam_q10 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q10;
exports.course2_24_section1_exam_q11 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q11;
exports.course2_24_section1_exam_q12 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q12;
exports.course2_24_section1_exam_q13 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q13;
exports.course2_24_section1_exam_q14 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q14;
exports.course2_24_section1_exam_q15 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q15;
exports.course2_24_section1_exam_q16 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q16;
exports.course2_24_section1_exam_q17 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q17;
exports.course2_24_section1_exam_q18 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q18;
exports.course2_24_section1_exam_q19 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q19;
exports.course2_24_section1_exam_q2 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q2;
exports.course2_24_section1_exam_q20 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q20;
exports.course2_24_section1_exam_q21 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q21;
exports.course2_24_section1_exam_q22 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q22;
exports.course2_24_section1_exam_q23 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q23;
exports.course2_24_section1_exam_q3 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q3;
exports.course2_24_section1_exam_q4 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q4;
exports.course2_24_section1_exam_q5 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q5;
exports.course2_24_section1_exam_q6 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q6;
exports.course2_24_section1_exam_q7 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q7;
exports.course2_24_section1_exam_q8 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q8;
exports.course2_24_section1_exam_q9 = require('./24-section-1-exam/assessments').course2_24_section1_exam_q9;