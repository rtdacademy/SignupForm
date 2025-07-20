// Course 4 - RTD Academy Orientation Cloud Functions
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
// Course 4 Assessment Functions - RTD Academy Orientation
//==============================================================================exports.course4_01_welcome_rtd_academy_knowledge_check = require('./01-welcome-rtd-academy/assessments').course4_01_welcome_rtd_academy_knowledge_check;
exports.course4_01_welcome_rtd_academy_question2 = require('./01-welcome-rtd-academy/assessments').course4_01_welcome_rtd_academy_question2;
exports.course4_01_welcome_rtd_academy_question3 = require('./01-welcome-rtd-academy/assessments').course4_01_welcome_rtd_academy_question3;
exports.course4_03_time_management_question1 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question1;
exports.course4_03_time_management_question2 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question2;
exports.course4_03_time_management_question3 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question3;
exports.course4_03_time_management_question4 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question4;
exports.course4_03_time_management_question5 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question5;
exports.course4_03_time_management_question6 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question6;
exports.course4_03_time_management_question7 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question7;
exports.course4_03_time_management_question8 = require('./03-time-management-staying-active/assessments').course4_03_time_management_question8;
exports.course4_02_learning_plans_completion_policies_aiQuestion = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_completion_policies_aiQuestion;
exports.course4_02_learning_plans_jordan_scenario = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_jordan_scenario;
exports.course4_02_learning_plans_question1 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question1;
exports.course4_02_learning_plans_question2 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question2;
exports.course4_02_learning_plans_question3 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question3;
exports.course4_02_learning_plans_question4 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question4;
exports.course4_02_learning_plans_question5 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question5;
exports.course4_02_learning_plans_question6 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question6;
exports.course4_02_learning_plans_question7 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question7;
exports.course4_02_learning_plans_question8 = require('./02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question8;
exports.course4_04_conduct_expectations_question1 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question1;
exports.course4_04_conduct_expectations_question2 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question2;
exports.course4_04_conduct_expectations_question3 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question3;
exports.course4_04_conduct_expectations_question4 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question4;
exports.course4_04_conduct_expectations_question5 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question5;
exports.course4_04_conduct_expectations_question6 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question6;
exports.course4_04_conduct_expectations_question7 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question7;
exports.course4_04_conduct_expectations_question8 = require('./04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question8;
exports.course4_05_course_prerequisites_question1 = require('./05-digital-citizenship-online-safety/assessments').course4_05_course_prerequisites_question1;
exports.course4_05_course_prerequisites_question2 = require('./05-digital-citizenship-online-safety/assessments').course4_05_course_prerequisites_question2;
exports.course4_05_course_prerequisites_question3 = require('./05-digital-citizenship-online-safety/assessments').course4_05_course_prerequisites_question3;
exports.course4_07_technology_readiness_assistive_tools_aiQuestion = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_assistive_tools_aiQuestion;
exports.course4_07_technology_readiness_question1 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question1;
exports.course4_07_technology_readiness_question2 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question2;
exports.course4_07_technology_readiness_question3 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question3;
exports.course4_07_technology_readiness_question4 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question4;
exports.course4_07_technology_readiness_question5 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question5;
exports.course4_07_technology_readiness_question6 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question6;
exports.course4_07_technology_readiness_question7 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question7;
exports.course4_07_technology_readiness_question8 = require('./07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question8;
exports.course4_08_cell_phone_policy_question1 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question1;
exports.course4_08_cell_phone_policy_question2 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question2;
exports.course4_08_cell_phone_policy_question3 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question3;
exports.course4_08_cell_phone_policy_question4 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question4;
exports.course4_08_cell_phone_policy_question5 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question5;
exports.course4_08_cell_phone_policy_question6 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question6;
exports.course4_08_cell_phone_policy_question7 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question7;
exports.course4_08_cell_phone_policy_question8 = require('./08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question8;
exports.course4_10_exams_rewrites_question1 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question1;
exports.course4_10_exams_rewrites_question2 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question2;
exports.course4_10_exams_rewrites_question3 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question3;
exports.course4_10_exams_rewrites_question4 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question4;
exports.course4_10_exams_rewrites_question5 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question5;
exports.course4_10_exams_rewrites_question6 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question6;
exports.course4_10_exams_rewrites_question7 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question7;
exports.course4_10_exams_rewrites_question8 = require('./10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question8;
exports.course4_06_mid_exam_question1 = require('./06-mid-course-exam/assessments').course4_06_mid_exam_question1;
exports.course4_06_mid_exam_question2 = require('./06-mid-course-exam/assessments').course4_06_mid_exam_question2;
exports.course4_06_mid_exam_question3 = require('./06-mid-course-exam/assessments').course4_06_mid_exam_question3;
exports.course4_11_final_exam_question1 = require('./11-final-exam/assessments').course4_11_final_exam_question1;
exports.course4_11_final_exam_question2 = require('./11-final-exam/assessments').course4_11_final_exam_question2;
exports.course4_11_final_exam_question3 = require('./11-final-exam/assessments').course4_11_final_exam_question3;
exports.course4_11_final_exam_question4 = require('./11-final-exam/assessments').course4_11_final_exam_question4;
