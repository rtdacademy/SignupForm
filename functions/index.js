// functions/index.js
const admin = require('firebase-admin');
require('dotenv').config();
const { setGlobalOptions } = require('firebase-functions/v2');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Set global options
setGlobalOptions({
  region: 'us-central1',
  maxInstances: 30 
});

//==============================================================================
// Import function modules
//==============================================================================

// Core services
const chatFunctions = require('./chat');
const emailFunctions = require('./email');
const stripeFunctions = require('./stripe');
const speechFunctions = require('./speech');

// Exam session management
const examSessionFunctions = require('./examSessionManager');

// Gradebook functions
const gradebookFunctions = require('./gradebook');

// Course management
const categoryFunctions = require('./categories');
const summaryFunctions = require('./summaries');
const ltiFunctions = require('./lti');
const IMathASFunctions = require('./IMathAS_Database');
const normalizedScheduleFunctions = require('./normalizedSchedule');
const asnFunctions = require('./asnSync');

// User management
const archiveStudentDataFunctions = require('./archiveStudentData');
const archiveUserActivityFunctions = require('./archiveUserActivity');
const retrieveUserActivityFunctions = require('./retrieveUserActivity');
const profileHistoryFunctions = require('./profileHistory');
const parentPortalFunctions = require('./parentPortal');
const studentPropertiesFunctions = require('./studentProperties');
const userRolesFunctions = require('./setUserRoles');
const updateStudentProfileFunctions = require('./updateStudentProfile');

// PASI data management
const pasiDataFunctions = require('./uploadPasiData');

// PDF generation
const pdfGenerationFunctions = require('./generateRegistrationPDFs');
const pdfStreamingFunctions = require('./generateRegistrationPDFsStreaming');
const downloadPDFFunctions = require('./downloadRegistrationPDFs');
const downloadJobFileFunctions = require('./downloadJobFile');
const pasiCsvFunctions = require('./uploadPasiCsv');

// Edge functions
const edgeFunctions = require('./edge');

// AI services
const googleAIFunctions = require('./googleai');
//const tempFunctions = require('./TempFunction');

// Student dashboard notifications
const surveySubmissionFunctions = require('./surveySubmissions');

// Course code loader
const courseCodeLoaderFunctions = require('./courseCodeLoader');

// Course configuration functions
const courseConfigFunctions = require('./courseConfig');

//==============================================================================
// Export functions by category
//==============================================================================

// Communications functions
exports.sendChatNotificationV2 = chatFunctions.sendChatNotificationV2;
exports.removeUserFromChatV2 = chatFunctions.removeUserFromChatV2;
exports.sendChatMessageV2 = chatFunctions.sendChatMessageV2;

// Student management functions
exports.deleteCategoryForStudentsV2 = categoryFunctions.deleteCategoryForStudentsV2;
exports.archiveStudentDataV2 = archiveStudentDataFunctions.archiveStudentDataV2;
exports.restoreStudentDataV2 = archiveStudentDataFunctions.restoreStudentDataV2;
exports.archiveUserActivity = archiveUserActivityFunctions.archiveUserActivity;
exports.cleanupOldActivityData = archiveUserActivityFunctions.cleanupOldActivityData;
exports.retrieveUserActivity = retrieveUserActivityFunctions.retrieveUserActivity;
exports.generateActivityReport = retrieveUserActivityFunctions.generateActivityReport;
exports.trackProfileChangesV2 = profileHistoryFunctions.trackProfileChangesV2;
exports.trackCourseEnrollmentChangesV2 = profileHistoryFunctions.trackCourseEnrollmentChangesV2;

// Course summary and data functions
exports.syncProfileToCourseSummariesV2 = summaryFunctions.syncProfileToCourseSummariesV2;
exports.updateStudentCourseSummaryV2 = summaryFunctions.updateStudentCourseSummaryV2;
exports.createStudentCourseSummaryOnCourseCreateV2 = summaryFunctions.createStudentCourseSummaryOnCourseCreateV2;
exports.batchSyncStudentDataV2 = summaryFunctions.batchSyncStudentDataV2;

// Email functions
exports.sendBulkEmailsV2 = emailFunctions.sendBulkEmailsV2;
exports.handleWebhookEventsV2 = emailFunctions.handleWebhookEventsV2;
exports.checkCourseDatesV2 = emailFunctions.checkCourseDatesV2;
exports.testCheckCourseDatesV2 = emailFunctions.testCheckCourseDatesV2;

// Payment functions
exports.handleStripeWebhookV2 = stripeFunctions.handleStripeWebhookV2;
exports.handleOneTimePaymentV2 = stripeFunctions.handleOneTimePaymentV2;
exports.handleSubscriptionUpdateV2 = stripeFunctions.handleSubscriptionUpdateV2;
exports.handleSubscriptionScheduleV2 = stripeFunctions.handleSubscriptionScheduleV2;
exports.getPaymentStatusV2 = stripeFunctions.getPaymentStatusV2;

// LTI functions
exports.ltiJwksV2 = ltiFunctions.ltiJwksV2;
exports.ltiLoginV2 = ltiFunctions.ltiLoginV2;
exports.ltiAuthV2 = ltiFunctions.ltiAuthV2;
exports.ltiDeepLinkReturnV2 = ltiFunctions.ltiDeepLinkReturnV2;
exports.getLTILinksV2 = ltiFunctions.getLTILinksV2;
exports.ltiGradeCallbackV2 = ltiFunctions.ltiGradeCallbackV2;

// IMathAS integration functions
exports.updateIMathASGradeV2 = IMathASFunctions.updateIMathASGradeV2;
exports.importIMathASGradesV2 = IMathASFunctions.importIMathASGradesV2;

// Edge functions
exports.fetchLMSStudentIdV2 = edgeFunctions.fetchLMSStudentIdV2;

// ASN functions
exports.syncStudentASNV2 = asnFunctions.syncStudentASNV2;
exports.rebuildASNNodesV2 = asnFunctions.rebuildASNNodesV2;

// Speech functions
exports.textToSpeechV2 = speechFunctions.textToSpeechV2; 
exports.streamTTSv2 = require('./standalone-streamTTSv2').streamTTSv2;

// Schedule functions
exports.onGradeUpdateTriggerNormalizedScheduleV2 = normalizedScheduleFunctions.onGradeUpdateTriggerNormalizedScheduleV2;
exports.generateNormalizedScheduleV2 = normalizedScheduleFunctions.generateNormalizedScheduleV2;
exports.onLMSStudentIDAssignedTriggerScheduleV2 = normalizedScheduleFunctions.onLMSStudentIDAssignedTriggerScheduleV2;
exports.updateDailyScheduleAdherenceV2 = normalizedScheduleFunctions.updateDailyScheduleAdherenceV2;
exports.batchUpdateNormalizedSchedulesV2 = normalizedScheduleFunctions.batchUpdateNormalizedSchedulesV2;

// Google AI functions
exports.generateContent = googleAIFunctions.generateContent;
exports.startChatSession = googleAIFunctions.startChatSession;
exports.sendChatMessage = googleAIFunctions.sendChatMessage;
//exports.terminalChat = tempFunctions.terminalChat;

// Notification functions
exports.submitNotificationSurvey = surveySubmissionFunctions.submitNotificationSurvey;

// Course code loader functions
exports.loadCourseCode = courseCodeLoaderFunctions.loadCourseCode;

// Course configuration functions
exports.getCourseConfigV2 = courseConfigFunctions.getCourseConfigV2;
exports.syncCourseConfigToDatabase = courseConfigFunctions.syncCourseConfigToDatabase;
exports.checkCourseConfigSyncStatus = courseConfigFunctions.checkCourseConfigSyncStatus;

// JSX transformation is now handled automatically by autoTransformSectionCode trigger
// No manual transformation endpoint needed

// Section management functions
exports.manageCourseSection = require('./manageCourseSection').manageCourseSection;
exports.manageCodeExamples = require('./manageCodeExamples').manageCodeExamples;
//exports.debugLesson = require('./debugLesson').debugLesson;

// Auto-transform functions
exports.autoTransformSectionCode = require('./autoTransformSections').autoTransformSectionCode;

// Database-driven assessment functions
exports.generateDatabaseAssessment = require('./manageDatabaseAssessment').generateDatabaseAssessment;
exports.manageDatabaseAssessmentConfig = require('./manageDatabaseAssessment').manageDatabaseAssessmentConfig;

// Test function to verify CORS
//exports.testDatabaseAssessment = require('./testDatabaseAssessment').testDatabaseAssessment;
//exports.generateDatabaseAssessmentSimple = require('./generateDatabaseAssessmentSimple').generateDatabaseAssessmentSimple;

// Parent Portal functions
exports.sendParentInvitation = parentPortalFunctions.sendParentInvitation;
exports.sendParentInvitationOnCreate = parentPortalFunctions.sendParentInvitationOnCreate;

// PASI data management functions
exports.uploadPasiData = pasiDataFunctions.uploadPasiData;
exports.retrievePasiData = pasiDataFunctions.retrievePasiData;
exports.retrieveStudentPasiData = pasiDataFunctions.retrieveStudentPasiData;

// PDF generation functions
exports.generateRegistrationPDFs = pdfGenerationFunctions.generateRegistrationPDFs;
exports.generateRegistrationPDFsStreaming = pdfStreamingFunctions.generateRegistrationPDFsStreaming;
exports.downloadRegistrationPDFs = downloadPDFFunctions.downloadRegistrationPDFs;
exports.downloadJobFile = downloadJobFileFunctions.downloadJobFile;

// PASI CSV Upload V2
exports.uploadPasiCsvV2 = pasiCsvFunctions.uploadPasiCsvV2;
exports.validateParentInvitation = parentPortalFunctions.validateParentInvitation;
exports.verifyStudentASN = parentPortalFunctions.verifyStudentASN;
exports.processParentInvitationRequest = parentPortalFunctions.processParentInvitationRequest;
exports.acceptParentInvitation = parentPortalFunctions.acceptParentInvitation;
exports.approveStudentEnrollment = parentPortalFunctions.approveStudentEnrollment;

// Student category update function
exports.updateStudentCategories = require('./updateStudentCategories').updateStudentCategories;
exports.resendParentInvitation = parentPortalFunctions.resendParentInvitation;
exports.getParentDashboardData = parentPortalFunctions.getParentDashboardData;

// Student Properties functions (Parent Portal)
exports.updateStudentPersonalInfo = studentPropertiesFunctions.updateStudentPersonalInfo;
exports.updateStudentAddress = studentPropertiesFunctions.updateStudentAddress;
exports.updateStudentAcademicInfo = studentPropertiesFunctions.updateStudentAcademicInfo;
exports.updateGuardianInfo = studentPropertiesFunctions.updateGuardianInfo;
exports.updateStudentStatus = studentPropertiesFunctions.updateStudentStatus;
exports.updateStudentDocuments = studentPropertiesFunctions.updateStudentDocuments;

// User roles and custom claims functions
exports.setUserRoles = userRolesFunctions.setUserRoles;

// Student profile update functions
exports.updateStudentProfile = updateStudentProfileFunctions.updateStudentProfile;

// Student Registration functions
const studentRegistrationFunctions = require('./submitStudentRegistration');
exports.submitStudentRegistration = studentRegistrationFunctions.submitStudentRegistration;


// Student Profile functions
const studentProfileFunctions = require('./updateStudentProfile');
exports.updateStudentProfile = studentProfileFunctions.updateStudentProfile;

// Student Schedule functions
const studentScheduleFunctions = require('./saveStudentSchedule');
exports.saveStudentSchedule = studentScheduleFunctions.saveStudentSchedule;

// Gradebook functions
exports.updateStudentGradebook = gradebookFunctions.updateStudentGradebook;
exports.updateStudentGradebookOnChange = gradebookFunctions.updateStudentGradebookOnChange;
exports.trackLessonAccess = gradebookFunctions.trackLessonAccess;
exports.validateGradebookStructure = gradebookFunctions.validateGradebookStructure;

// Exam session management functions
exports.startExamSession = examSessionFunctions.startExamSession;
exports.saveExamAnswer = examSessionFunctions.saveExamAnswer;
exports.submitExamSession = examSessionFunctions.submitExamSession;
exports.getExamSession = examSessionFunctions.getExamSession;
exports.detectActiveExamSession = examSessionFunctions.detectActiveExamSession;
exports.exitExamSession = examSessionFunctions.exitExamSession;

//==============================================================================
// Assessment functions for courses
//==============================================================================



//PHY30
exports.PHY30_IntroToPhysics = require('./courses/PHY30/content/lessons/IntroToPhysics').default;

// 2 Course Functions
//exports.course2_shared_aiQuestion = require('./courses/2/shared/aiQuestions').course2_shared_aiQuestion;
exports.course2_02_momentum_one_dimension_aiQuestion = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_aiQuestion;
exports.course2_02_momentum_one_dimension_aiLongAnswer = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_aiLongAnswer;

// Momentum Knowledge Check Questions (New Functions)
exports.course2_02_momentum_one_dimension_kc_q1 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q1;
exports.course2_02_momentum_one_dimension_kc_q2 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q2;
exports.course2_02_momentum_one_dimension_kc_q3 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q3;
exports.course2_02_momentum_one_dimension_kc_q4 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q4;
exports.course2_02_momentum_one_dimension_kc_q5 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q5;

// Collision Knowledge Check Questions (Questions 6-11)
exports.course2_02_momentum_one_dimension_kc_q6 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q6;
exports.course2_02_momentum_one_dimension_kc_q7 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q7;
exports.course2_02_momentum_one_dimension_kc_q8 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q8;
exports.course2_02_momentum_one_dimension_kc_q9 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q9;
exports.course2_02_momentum_one_dimension_kc_q10 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q10;
exports.course2_02_momentum_one_dimension_kc_q11 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q11;

// Advanced Knowledge Check Questions (Questions 12-19)
exports.course2_02_momentum_one_dimension_kc_q12 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q12;
exports.course2_02_momentum_one_dimension_kc_q13 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q13;
exports.course2_02_momentum_one_dimension_kc_q14 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q14;
exports.course2_02_momentum_one_dimension_kc_q15 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q15;
exports.course2_02_momentum_one_dimension_kc_q16 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q16;
exports.course2_02_momentum_one_dimension_kc_q17 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q17;
exports.course2_02_momentum_one_dimension_kc_q18 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q18;
exports.course2_02_momentum_one_dimension_kc_q19 = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_kc_q19;

// Slideshow Knowledge Check Questions (Legacy - kept for compatibility)
exports.course2_02_momentum_inertia_difference = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_inertia_difference;
exports.course2_02_bowling_ball_momentum = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_bowling_ball_momentum;
exports.course2_02_bullet_velocity = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_bullet_velocity;
exports.course2_02_hockey_puck_mass = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_hockey_puck_mass;
exports.course2_02_jet_momentum_a = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_jet_momentum_a;
exports.course2_02_jet_momentum_b = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_jet_momentum_b;

// Collision Practice Problems
exports.course2_02_collision_rebound = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_collision_rebound;
exports.course2_02_ball_collision_type = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_ball_collision_type;
exports.course2_02_unknown_mass_collision = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_unknown_mass_collision;
exports.course2_02_football_tackle_mass = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_football_tackle_mass;
exports.course2_02_arrow_apple_mass = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_arrow_apple_mass;
exports.course2_02_truck_car_headon = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_truck_car_headon;

// Advanced Practice Problems
exports.course2_02_astronaut_recoil = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_astronaut_recoil;
exports.course2_02_rocket_separation = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_rocket_separation;
exports.course2_02_machine_gun_recoil = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_machine_gun_recoil;
exports.course2_02_uranium_disintegration = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_uranium_disintegration;
exports.course2_02_ballistic_pendulum = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_ballistic_pendulum;
exports.course2_02_canoe_comparison = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_canoe_comparison;
exports.course2_02_cart_jumping = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_cart_jumping;
exports.course2_02_atom_collision = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_atom_collision;

// Course 2 - Momentum in Two Dimensions
exports.course2_03_car_truck_2d_collision = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_car_truck_2d_collision;
exports.course2_03_nuclear_decay_2d = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_nuclear_decay_2d;
exports.course2_03_glancing_collision_2d = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_glancing_collision_2d;
exports.course2_03_space_capsule_projectile = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_space_capsule_projectile;

// Course 2 - Momentum in Two Dimensions (Advanced)
exports.course2_03_steel_ball_deflection = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_steel_ball_deflection;
exports.course2_03_mass_explosion = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_mass_explosion;
exports.course2_03_elastic_collision_90 = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_elastic_collision_90;
exports.course2_03_plasticene_collision = require('./courses/2/03-momentum-two-dimensions/assessments').course2_03_plasticene_collision;

// Course 2 - Impulse and Momentum Change
exports.course2_04_basic_impulse = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_basic_impulse;
exports.course2_04_person_falling = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_person_falling;
exports.course2_04_impulse_quantities = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_impulse_quantities;
exports.course2_04_karate_board = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_karate_board;
exports.course2_04_safety_features = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_safety_features;
exports.course2_04_golf_ball_driver = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_golf_ball_driver;
exports.course2_04_child_ball = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_child_ball;
exports.course2_04_ball_bat = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_ball_bat;
exports.course2_04_bullet_wood = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_bullet_wood;
exports.course2_04_water_turbine = require('./courses/2/04-impulse-momentum-change/assessments').course2_04_water_turbine;

// Course 2 - L1-3 Assignment (Momentum and Impulse)
exports.course2_05_l13_question1 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question1;
exports.course2_05_l13_question2 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question2;
exports.course2_05_l13_question3 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question3;
exports.course2_05_l13_question4 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question4;
exports.course2_05_l13_question5 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question5;
exports.course2_05_l13_question6 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question6;
exports.course2_05_l13_question7 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question7;
exports.course2_05_l13_question8 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question8;
exports.course2_05_l13_question9 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question9;
exports.course2_05_l13_question10 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question10;
exports.course2_05_l13_question11 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question11;
exports.course2_05_l13_question12 = require('./courses/2/05-l1-3-assignment/assessments').course2_05_l13_question12;

// Course 2 - L1-4 Cumulative Assignment
exports.course2_08_l14_question1 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question1;
exports.course2_08_l14_question2 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question2;
exports.course2_08_l14_question3 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question3;
exports.course2_08_l14_question4 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question4;
exports.course2_08_l14_question5 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question5;
exports.course2_08_l14_question6 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question6;
exports.course2_08_l14_question7 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question7;
exports.course2_08_l14_question8 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question8;
exports.course2_08_l14_question9 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question9;
exports.course2_08_l14_question10 = require('./courses/2/08-l1-4-cumulative-assignment/assessments').course2_08_l14_question10;

// Course 2 - Unit 1 Review
exports.course2_22_unit1_q1a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q1a;
exports.course2_22_unit1_q1b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q1b;
exports.course2_22_unit1_q2 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q2;
exports.course2_22_unit1_q3a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q3a;
exports.course2_22_unit1_q3b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q3b;
exports.course2_22_unit1_q4a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q4a;
exports.course2_22_unit1_q4b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q4b;
exports.course2_22_unit1_q5 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q5;
exports.course2_22_unit1_q6 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q6;
exports.course2_22_unit1_q7 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q7;
exports.course2_22_unit1_q8 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q8;
exports.course2_22_unit1_q9a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q9a;
exports.course2_22_unit1_q9b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q9b;
exports.course2_22_unit1_q10 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q10;
exports.course2_22_unit1_q11 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q11;
exports.course2_22_unit1_q12 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q12;
exports.course2_22_unit1_q13a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q13a;
exports.course2_22_unit1_q13b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q13b;
exports.course2_22_unit1_q14 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q14;
exports.course2_22_unit1_q15 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q15;
exports.course2_22_unit1_q16 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q16;
exports.course2_22_unit1_q17 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q17;

// Course 2 - Graphing Techniques
exports.course2_06_graphing_techniques_question1 = require('./courses/2/06-graphing-techniques/assessments').course2_06_graphing_techniques_question1;
exports.course2_06_graphing_techniques_question2 = require('./courses/2/06-graphing-techniques/assessments').course2_06_graphing_techniques_question2;
exports.course2_06_graphing_techniques_question3 = require('./courses/2/06-graphing-techniques/assessments').course2_06_graphing_techniques_question3;
exports.course2_06_graphing_techniques_question4 = require('./courses/2/06-graphing-techniques/assessments').course2_06_graphing_techniques_question4;

// Course 2 - Physics 20 Review
exports.course2_01_physics_20_review_question1 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question1;
exports.course2_01_physics_20_review_question2 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question2;
exports.course2_01_physics_20_review_question3 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question3;
exports.course2_01_physics_20_review_question4 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question4;
exports.course2_01_physics_20_review_question5 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question5;
exports.course2_01_physics_20_review_question6 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question6;
exports.course2_01_physics_20_review_question7 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question7;
exports.course2_01_physics_20_review_question8 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question8;
exports.course2_01_physics_20_review_question9 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question9;
exports.course2_01_physics_20_review_question10 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question10;
exports.course2_01_physics_20_review_question11 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question11;
exports.course2_01_physics_20_review_question12 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_question12;

// Vector Knowledge Check Questions
exports.course2_01_physics_20_review_vector_q1 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q1;
exports.course2_01_physics_20_review_vector_q2 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q2;
exports.course2_01_physics_20_review_vector_q3 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q3;
exports.course2_01_physics_20_review_vector_q4 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q4;
exports.course2_01_physics_20_review_vector_q5 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q5;
exports.course2_01_physics_20_review_vector_q6 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q6;
exports.course2_01_physics_20_review_vector_q7 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_vector_q7;

// Circular Motion Knowledge Check Questions
exports.course2_01_physics_20_review_circular_q1 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_circular_q1;
exports.course2_01_physics_20_review_circular_q2 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_circular_q2;
exports.course2_01_physics_20_review_circular_q3 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_circular_q3;
exports.course2_01_physics_20_review_circular_q4 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_circular_q4;

// Dynamics Knowledge Check Questions
exports.course2_01_physics_20_review_dynamics_q1 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q1;
exports.course2_01_physics_20_review_dynamics_q2 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q2;
exports.course2_01_physics_20_review_dynamics_q3 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q3;
exports.course2_01_physics_20_review_dynamics_q4 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q4;
exports.course2_01_physics_20_review_dynamics_q5 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q5;
exports.course2_01_physics_20_review_dynamics_q6 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q6;
exports.course2_01_physics_20_review_dynamics_q7 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q7;
exports.course2_01_physics_20_review_dynamics_q8 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q8;
exports.course2_01_physics_20_review_dynamics_q9 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_dynamics_q9;

// Course 2 - Lab: Conservation of Momentum
exports.course2_lab_momentum_conservation = require('./courses/2/07-lab-momentum-conservation/assessments').course2_lab_momentum_conservation;

// Course 2 - Lesson 09: Introduction to Light - Pinhole Camera Practice
exports.pinhole_distance_calculation = require('./courses/2/09-introduction-to-light/assessments').pinhole_distance_calculation;
exports.building_height_calculation = require('./courses/2/09-introduction-to-light/assessments').building_height_calculation;
exports.shadow_size_calculation = require('./courses/2/09-introduction-to-light/assessments').shadow_size_calculation;
exports.shadow_area_calculation = require('./courses/2/09-introduction-to-light/assessments').shadow_area_calculation;
exports.fence_shadow_calculation = require('./courses/2/09-introduction-to-light/assessments').fence_shadow_calculation;

// Course 2 - Lesson 09: Introduction to Light - Michelson Method Practice
exports.michelson_six_sided_calculation = require('./courses/2/09-introduction-to-light/assessments').michelson_six_sided_calculation;
exports.michelson_eight_sided_frequency = require('./courses/2/09-introduction-to-light/assessments').michelson_eight_sided_frequency;
exports.michelson_pentagonal_frequency = require('./courses/2/09-introduction-to-light/assessments').michelson_pentagonal_frequency;
exports.michelson_twelve_sided_distance = require('./courses/2/09-introduction-to-light/assessments').michelson_twelve_sided_distance;

// Course 2 - Lesson 09: Introduction to Light - Light-Year and Space Communication Practice
exports.space_station_radio_signal = require('./courses/2/09-introduction-to-light/assessments').space_station_radio_signal;
exports.light_travel_three_years = require('./courses/2/09-introduction-to-light/assessments').light_travel_three_years;
exports.star_explosion_observation = require('./courses/2/09-introduction-to-light/assessments').star_explosion_observation;
exports.proxima_centauri_distance = require('./courses/2/09-introduction-to-light/assessments').proxima_centauri_distance;
exports.spacecraft_travel_time = require('./courses/2/09-introduction-to-light/assessments').spacecraft_travel_time;
exports.sunlight_travel_time = require('./courses/2/09-introduction-to-light/assessments').sunlight_travel_time;
exports.galileo_light_travel = require('./courses/2/09-introduction-to-light/assessments').galileo_light_travel;
exports.earth_jupiter_speed_calculation = require('./courses/2/09-introduction-to-light/assessments').earth_jupiter_speed_calculation;

// Course 2 - Lesson 10: Reflection of Light - Practice Questions
exports.angle_of_incidence_basic = require('./courses/2/10-reflection-of-light/assessments').angle_of_incidence_basic;
exports.surface_to_normal_angle = require('./courses/2/10-reflection-of-light/assessments').surface_to_normal_angle;
exports.total_angle_between_rays = require('./courses/2/10-reflection-of-light/assessments').total_angle_between_rays;
exports.two_mirrors_scenario_a = require('./courses/2/10-reflection-of-light/assessments').two_mirrors_scenario_a;
exports.two_mirrors_scenario_b = require('./courses/2/10-reflection-of-light/assessments').two_mirrors_scenario_b;
exports.mirror_image_description = require('./courses/2/10-reflection-of-light/assessments').mirror_image_description;
exports.mirror_time_reading = require('./courses/2/10-reflection-of-light/assessments').mirror_time_reading;

// Course 2 - Lesson 11: Curved Mirrors - Practice Questions
exports.concave_mirror_image_distance = require('./courses/2/11-curved-mirrors/assessments').concave_mirror_image_distance;
exports.concave_mirror_image_size = require('./courses/2/11-curved-mirrors/assessments').concave_mirror_image_size;
exports.concave_mirror_image_description = require('./courses/2/11-curved-mirrors/assessments').concave_mirror_image_description;
exports.convex_mirror_image_distance = require('./courses/2/11-curved-mirrors/assessments').convex_mirror_image_distance;
exports.convex_mirror_image_size = require('./courses/2/11-curved-mirrors/assessments').convex_mirror_image_size;
exports.convex_mirror_image_description = require('./courses/2/11-curved-mirrors/assessments').convex_mirror_image_description;
exports.mirror_type_erect_80cm = require('./courses/2/11-curved-mirrors/assessments').mirror_type_erect_80cm;
exports.mirror_type_identification_erect = require('./courses/2/11-curved-mirrors/assessments').mirror_type_identification_erect;
exports.mirror_radius_inverted_120cm = require('./courses/2/11-curved-mirrors/assessments').mirror_radius_inverted_120cm;
exports.mirror_type_inverted_120cm = require('./courses/2/11-curved-mirrors/assessments').mirror_type_inverted_120cm;
exports.convex_mirror_radius_20cm = require('./courses/2/11-curved-mirrors/assessments').convex_mirror_radius_20cm;
exports.convex_mirror_type_identification = require('./courses/2/11-curved-mirrors/assessments').convex_mirror_type_identification;
exports.object_movement_image_size = require('./courses/2/11-curved-mirrors/assessments').object_movement_image_size;
exports.object_movement_image_size_change = require('./courses/2/11-curved-mirrors/assessments').object_movement_image_size_change;
exports.concave_mirror_3x_inverted_distance = require('./courses/2/11-curved-mirrors/assessments').concave_mirror_3x_inverted_distance;
exports.concave_mirror_2x_erect_distance = require('./courses/2/11-curved-mirrors/assessments').concave_mirror_2x_erect_distance;
exports.convex_mirror_one_sixth_distance = require('./courses/2/11-curved-mirrors/assessments').convex_mirror_one_sixth_distance;

// Course 2 - L5-7 Assignment (Reflection and Optics)
exports.course2_12_l57_question1 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question1;
exports.course2_12_l57_question2 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question2;
exports.course2_12_l57_question3 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question3;
exports.course2_12_l57_question4 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question4;
exports.course2_12_l57_question5 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question5;
exports.course2_12_l57_question6 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question6;
exports.course2_12_l57_question7 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question7;
exports.course2_12_l57_question8 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question8;
exports.course2_12_l57_question9 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question9;
exports.course2_12_l57_question10 = require('./courses/2/12-l5-7-assignment/assessments').course2_12_l57_question10;

// Course 2 - Lesson 13: Refraction of Light - Knowledge Check Questions
exports.course2_13_refraction_kc_q1 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q1;
exports.course2_13_refraction_kc_q2 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q2;
exports.course2_13_refraction_kc_q3 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q3;
exports.course2_13_refraction_kc_q4 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q4;
exports.course2_13_refraction_kc_q5 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q5;
exports.course2_13_refraction_kc_q6 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q6;
exports.course2_13_refraction_kc_q7 = require('./courses/2/13-refraction-of-light/assessments').course2_13_refraction_kc_q7;
exports.course2_13_slideshow_q1 = require('./courses/2/13-refraction-of-light/assessments').course2_13_slideshow_q1;
exports.course2_13_slideshow_q2 = require('./courses/2/13-refraction-of-light/assessments').course2_13_slideshow_q2;
exports.course2_13_critical_q1 = require('./courses/2/13-refraction-of-light/assessments').course2_13_critical_q1;
exports.course2_13_critical_q2 = require('./courses/2/13-refraction-of-light/assessments').course2_13_critical_q2;
exports.course2_13_critical_q3 = require('./courses/2/13-refraction-of-light/assessments').course2_13_critical_q3;

// Course 2 - Lesson 14: Optics: Lenses - Practice Questions
exports.converging_lens_position = require('./courses/2/14-optics-lenses/assessments').converging_lens_position;
exports.converging_lens_height = require('./courses/2/14-optics-lenses/assessments').converging_lens_height;
exports.diverging_lens_position = require('./courses/2/14-optics-lenses/assessments').diverging_lens_position;
exports.diverging_lens_height = require('./courses/2/14-optics-lenses/assessments').diverging_lens_height;
exports.camera_lens_calculation = require('./courses/2/14-optics-lenses/assessments').camera_lens_calculation;
exports.camera_image_size = require('./courses/2/14-optics-lenses/assessments').camera_image_size;
exports.infinity_focus = require('./courses/2/14-optics-lenses/assessments').infinity_focus;
exports.slide_projector_screen = require('./courses/2/14-optics-lenses/assessments').slide_projector_screen;
exports.slide_projector_image_size = require('./courses/2/14-optics-lenses/assessments').slide_projector_image_size;
exports.slide_projector_adjustment = require('./courses/2/14-optics-lenses/assessments').slide_projector_adjustment;
exports.object_image_separation = require('./courses/2/14-optics-lenses/assessments').object_image_separation;
exports.projector_focal_length = require('./courses/2/14-optics-lenses/assessments').projector_focal_length;
exports.optical_bench_problem = require('./courses/2/14-optics-lenses/assessments').optical_bench_problem;
exports.optical_bench_image_size = require('./courses/2/14-optics-lenses/assessments').optical_bench_image_size;
exports.camera_film_distance = require('./courses/2/14-optics-lenses/assessments').camera_film_distance;

// Course 2 - L8-9 Assignment (Refraction and Lenses)
exports.course2_16_l89_question1 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question1;
exports.course2_16_l89_question2 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question2;
exports.course2_16_l89_question3 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question3;
exports.course2_16_l89_question4 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question4;
exports.course2_16_l89_question5 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question5;
exports.course2_16_l89_question6 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question6;
exports.course2_16_l89_question7 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question7;
exports.course2_16_l89_question8 = require('./courses/2/16-l8-9-assignment/assessments').course2_16_l89_question8;

// Course 2 - L1-12 Cumulative Assignment (Comprehensive Physics)
exports.course2_21_l112_question1 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question1;
exports.course2_21_l112_question2 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question2;
exports.course2_21_l112_question3 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question3;
exports.course2_21_l112_question4 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question4;
exports.course2_21_l112_question5 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question5;
exports.course2_21_l112_question6 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question6;
exports.course2_21_l112_question7 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question7;
exports.course2_21_l112_question8 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question8;
exports.course2_21_l112_question9 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question9;
exports.course2_21_l112_question10 = require('./courses/2/21-l1-12-cumulative-assignment/assessments').course2_21_l112_question10;

// Course 2 - Lesson 17: Dispersion, Scattering, Colour, Polarisation - Knowledge Check Questions
exports.course2_17_dispersion_air_speeds = require('./courses/2/17-dispersion-scattering/assessments').course2_17_dispersion_air_speeds;
exports.course2_17_diamond_dispersion = require('./courses/2/17-dispersion-scattering/assessments').course2_17_diamond_dispersion;
exports.course2_17_microscopy_scattering = require('./courses/2/17-dispersion-scattering/assessments').course2_17_microscopy_scattering;
exports.course2_17_clothing_color_heat = require('./courses/2/17-dispersion-scattering/assessments').course2_17_clothing_color_heat;
exports.course2_17_red_orange_difference = require('./courses/2/17-dispersion-scattering/assessments').course2_17_red_orange_difference;
exports.course2_17_stage_lighting_color = require('./courses/2/17-dispersion-scattering/assessments').course2_17_stage_lighting_color;
exports.course2_17_window_glass_dispersion = require('./courses/2/17-dispersion-scattering/assessments').course2_17_window_glass_dispersion;
exports.course2_17_green_object_lighting = require('./courses/2/17-dispersion-scattering/assessments').course2_17_green_object_lighting;
exports.course2_17_cat_color_vision = require('./courses/2/17-dispersion-scattering/assessments').course2_17_cat_color_vision;
exports.course2_17_moonlight_colorless = require('./courses/2/17-dispersion-scattering/assessments').course2_17_moonlight_colorless;

// Course 2 - Lesson 18: Interference of Light - Knowledge Check Questions
exports.course2_18_constructive_amplitude = require('./courses/2/18-interference-of-light/assessments').course2_18_constructive_amplitude;
exports.course2_18_destructive_amplitude = require('./courses/2/18-interference-of-light/assessments').course2_18_destructive_amplitude;
exports.course2_18_dark_fringes_cause = require('./courses/2/18-interference-of-light/assessments').course2_18_dark_fringes_cause;
exports.course2_18_wavelength_fringe_spacing = require('./courses/2/18-interference-of-light/assessments').course2_18_wavelength_fringe_spacing;
exports.course2_18_path_difference_interference = require('./courses/2/18-interference-of-light/assessments').course2_18_path_difference_interference;
exports.course2_18_coherence_requirement = require('./courses/2/18-interference-of-light/assessments').course2_18_coherence_requirement;
exports.course2_18_single_slit_blocking = require('./courses/2/18-interference-of-light/assessments').course2_18_single_slit_blocking;
exports.course2_18_lightbulb_incoherence = require('./courses/2/18-interference-of-light/assessments').course2_18_lightbulb_incoherence;
exports.course2_18_fringe_count_factors = require('./courses/2/18-interference-of-light/assessments').course2_18_fringe_count_factors;
exports.course2_18_sound_dead_spots = require('./courses/2/18-interference-of-light/assessments').course2_18_sound_dead_spots;

// Course 2 - Lesson 19: Diffraction Gratings - Knowledge Check Questions
exports.course2_19_green_light_grating = require('./courses/2/19-diffraction-gratings/assessments').course2_19_green_light_grating;
exports.course2_19_second_order_minimum = require('./courses/2/19-diffraction-gratings/assessments').course2_19_second_order_minimum;
exports.course2_19_yellow_light_spacing = require('./courses/2/19-diffraction-gratings/assessments').course2_19_yellow_light_spacing;
exports.course2_19_frequency_third_order = require('./courses/2/19-diffraction-gratings/assessments').course2_19_frequency_third_order;
exports.course2_19_spectral_orders_red = require('./courses/2/19-diffraction-gratings/assessments').course2_19_spectral_orders_red;
exports.course2_19_water_trough_fringes = require('./courses/2/19-diffraction-gratings/assessments').course2_19_water_trough_fringes;
exports.course2_19_cd_player_laser = require('./courses/2/19-diffraction-gratings/assessments').course2_19_cd_player_laser;
exports.course2_19_bright_dark_bands = require('./courses/2/19-diffraction-gratings/assessments').course2_19_bright_dark_bands;
exports.course2_19_frequency_measurement = require('./courses/2/19-diffraction-gratings/assessments').course2_19_frequency_measurement;
exports.course2_19_grating_change = require('./courses/2/19-diffraction-gratings/assessments').course2_19_grating_change;
exports.course2_19_distance_change = require('./courses/2/19-diffraction-gratings/assessments').course2_19_distance_change;
exports.course2_19_frequency_change = require('./courses/2/19-diffraction-gratings/assessments').course2_19_frequency_change;

// Course 2 - Lesson 22: Unit 1 Review - Knowledge Check Questions
exports.course2_22_unit1_q1a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q1a;
exports.course2_22_unit1_q1b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q1b;
exports.course2_22_unit1_q2 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q2;
exports.course2_22_unit1_q3a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q3a;
exports.course2_22_unit1_q3b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q3b;
exports.course2_22_unit1_q4a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q4a;
exports.course2_22_unit1_q4b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q4b;
exports.course2_22_unit1_q5 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q5;
exports.course2_22_unit1_q6 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q6;
exports.course2_22_unit1_q7 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q7;
exports.course2_22_unit1_q8 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q8;
exports.course2_22_unit1_q9a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q9a;
exports.course2_22_unit1_q9b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q9b;
exports.course2_22_unit1_q10 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q10;
exports.course2_22_unit1_q11 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q11;
exports.course2_22_unit1_q12 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q12;
exports.course2_22_unit1_q13a = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q13a;
exports.course2_22_unit1_q13b = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q13b;
exports.course2_22_unit1_q14 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q14;
exports.course2_22_unit1_q15 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q15;
exports.course2_22_unit1_q16 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q16;
exports.course2_22_unit1_q17 = require('./courses/2/22-unit-1-review/assessments').course2_22_unit1_q17;

// Course 2 - Lesson 23: Unit 2 Review - Knowledge Check Questions
exports.course2_23_unit2_q1 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q1;
exports.course2_23_unit2_q2 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q2;
exports.course2_23_unit2_q3 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q3;
exports.course2_23_unit2_q4 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q4;
exports.course2_23_unit2_q5a = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q5a;
exports.course2_23_unit2_q5b = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q5b;
exports.course2_23_unit2_q6a = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q6a;
exports.course2_23_unit2_q6b = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q6b;
exports.course2_23_unit2_q7a = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q7a;
exports.course2_23_unit2_q7b = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q7b;
exports.course2_23_unit2_q8a = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q8a;
exports.course2_23_unit2_q8b = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q8b;
exports.course2_23_unit2_q9 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q9;
exports.course2_23_unit2_q10 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q10;
exports.course2_23_unit2_q11a = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q11a;
exports.course2_23_unit2_q11b = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q11b;
exports.course2_23_unit2_q12a = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q12a;
exports.course2_23_unit2_q12b = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q12b;
exports.course2_23_unit2_q13 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q13;
exports.course2_23_unit2_q14 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q14;
exports.course2_23_unit2_q15 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q15;
exports.course2_23_unit2_q16 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q16;
exports.course2_23_unit2_q17 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q17;
exports.course2_23_unit2_q18 = require('./courses/2/23-unit-2-review/assessments').course2_23_unit2_q18;

// Course 2 - Lesson 24: Section 1 Exam (Momentum and Light)
exports.course2_24_section1_exam_q1 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q1;
exports.course2_24_section1_exam_q2 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q2;
exports.course2_24_section1_exam_q3 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q3;
exports.course2_24_section1_exam_q4 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q4;
exports.course2_24_section1_exam_q5 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q5;
exports.course2_24_section1_exam_q6 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q6;
exports.course2_24_section1_exam_q7 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q7;
exports.course2_24_section1_exam_q8 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q8;
exports.course2_24_section1_exam_q9 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q9;
exports.course2_24_section1_exam_q10 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q10;
exports.course2_24_section1_exam_q11 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q11;
exports.course2_24_section1_exam_q12 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q12;
exports.course2_24_section1_exam_q13 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q13;
exports.course2_24_section1_exam_q14 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q14;
exports.course2_24_section1_exam_q15 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q15;
exports.course2_24_section1_exam_q16 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q16;
exports.course2_24_section1_exam_q17 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q17;
exports.course2_24_section1_exam_q18 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q18;
exports.course2_24_section1_exam_q19 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q19;
exports.course2_24_section1_exam_q20 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q20;
exports.course2_24_section1_exam_q21 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q21;
exports.course2_24_section1_exam_q22 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q22;
exports.course2_24_section1_exam_q23 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_q23;
exports.course2_24_section1_exam_long1 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_long1;
exports.course2_24_section1_exam_long2 = require('./courses/2/24-section-1-exam/assessments').course2_24_section1_exam_long2;

// Course 2 - Section Exams
exports.course2_76_section_3_exam_question1 = require('./courses/2/78-diploma-exam/assessments').course2_76_section_3_exam_question1;

// 3 Course Functions (Financial Literacy)
//exports.course3_shared_aiQuestion = require('./courses/3/shared/aiQuestions').course3_shared_aiQuestion;

// Course 3 - Lesson 1: Introduction and Ethics in Financial Decision Making
exports.course3_01_intro_ethics_question1 = require('./courses/3/01-intro-ethics-financial-decisions/assessments').course3_01_intro_ethics_question1;
exports.course3_01_intro_ethics_question2 = require('./courses/3/01-intro-ethics-financial-decisions/assessments').course3_01_intro_ethics_question2;

// Course 3 - Lesson 2: The Economic Environment and Your Money
exports.course3_02_economic_environment_question1 = require('./courses/3/02-economic-environment-money/assessments').course3_02_economic_environment_question1;
exports.course3_02_economic_environment_question2 = require('./courses/3/02-economic-environment-money/assessments').course3_02_economic_environment_question2;
exports.course3_02_economic_environment_question3 = require('./courses/3/02-economic-environment-money/assessments').course3_02_economic_environment_question3;
exports.course3_02_economic_environment_question4 = require('./courses/3/02-economic-environment-money/assessments').course3_02_economic_environment_question4;
exports.course3_02_economic_environment_longAnswer = require('./courses/3/02-economic-environment-money/assessments').course3_02_economic_environment_longAnswer;
exports.course3_02_economic_environment_shortAnswer = require('./courses/3/02-economic-environment-money/assessments').course3_02_economic_environment_shortAnswer;

// 4 Course Functions (RTD Academy Orientation)
exports.course4_01_welcome_rtd_academy_knowledge_check = require('./courses/4/01-welcome-rtd-academy/assessments').course4_01_welcome_rtd_academy_knowledge_check;
exports.course4_01_welcome_rtd_academy_question2 = require('./courses/4/01-welcome-rtd-academy/assessments').course4_01_welcome_rtd_academy_question2;
exports.course4_01_welcome_rtd_academy_question3 = require('./courses/4/01-welcome-rtd-academy/assessments').course4_01_welcome_rtd_academy_question3;
exports.course4_03_time_management_question1 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question1;
exports.course4_03_time_management_question2 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question2;
exports.course4_03_time_management_question3 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question3;
exports.course4_03_time_management_question4 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question4;
exports.course4_03_time_management_question5 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question5;
exports.course4_03_time_management_question6 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question6;
exports.course4_03_time_management_question7 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question7;
exports.course4_03_time_management_question8 = require('./courses/4/03-time-management-staying-active/assessments').course4_03_time_management_question8;
exports.course4_02_learning_plans_completion_policies_aiQuestion = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_completion_policies_aiQuestion;
exports.course4_02_learning_plans_jordan_scenario = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_jordan_scenario;
exports.course4_02_learning_plans_question1 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question1;
exports.course4_02_learning_plans_question2 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question2;
exports.course4_02_learning_plans_question3 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question3;
exports.course4_02_learning_plans_question4 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question4;
exports.course4_02_learning_plans_question5 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question5;
exports.course4_02_learning_plans_question6 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question6;
exports.course4_02_learning_plans_question7 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question7;
exports.course4_02_learning_plans_question8 = require('./courses/4/02-learning-plans-completion-policies/assessments').course4_02_learning_plans_question8;
exports.course4_04_conduct_expectations_question1 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question1;
exports.course4_04_conduct_expectations_question2 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question2;
exports.course4_04_conduct_expectations_question3 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question3;
exports.course4_04_conduct_expectations_question4 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question4;
exports.course4_04_conduct_expectations_question5 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question5;
exports.course4_04_conduct_expectations_question6 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question6;
exports.course4_04_conduct_expectations_question7 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question7;
exports.course4_04_conduct_expectations_question8 = require('./courses/4/04-conduct-expectations-responsibilities/assessments').course4_04_conduct_expectations_question8;
exports.course4_05_course_prerequisites_question1 = require('./courses/4/05-digital-citizenship-online-safety/assessments').course4_05_course_prerequisites_question1;
exports.course4_05_course_prerequisites_question2 = require('./courses/4/05-digital-citizenship-online-safety/assessments').course4_05_course_prerequisites_question2;
exports.course4_05_course_prerequisites_question3 = require('./courses/4/05-digital-citizenship-online-safety/assessments').course4_05_course_prerequisites_question3;
exports.course4_07_technology_readiness_assistive_tools_aiQuestion = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_assistive_tools_aiQuestion;
exports.course4_07_technology_readiness_question1 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question1;
exports.course4_07_technology_readiness_question2 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question2;
exports.course4_07_technology_readiness_question3 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question3;
exports.course4_07_technology_readiness_question4 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question4;
exports.course4_07_technology_readiness_question5 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question5;
exports.course4_07_technology_readiness_question6 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question6;
exports.course4_07_technology_readiness_question7 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question7;
exports.course4_07_technology_readiness_question8 = require('./courses/4/07-technology-readiness-assistive-tools/assessments').course4_07_technology_readiness_question8;
exports.course4_08_cell_phone_policy_question1 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question1;
exports.course4_08_cell_phone_policy_question2 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question2;
exports.course4_08_cell_phone_policy_question3 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question3;
exports.course4_08_cell_phone_policy_question4 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question4;
exports.course4_08_cell_phone_policy_question5 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question5;
exports.course4_08_cell_phone_policy_question6 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question6;
exports.course4_08_cell_phone_policy_question7 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question7;
exports.course4_08_cell_phone_policy_question8 = require('./courses/4/08-cell-phone-policy-exam-proctoring/assessments').course4_08_cell_phone_policy_question8;
exports.course4_10_exams_rewrites_question1 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question1;
exports.course4_10_exams_rewrites_question2 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question2;
exports.course4_10_exams_rewrites_question3 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question3;
exports.course4_10_exams_rewrites_question4 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question4;
exports.course4_10_exams_rewrites_question5 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question5;
exports.course4_10_exams_rewrites_question6 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question6;
exports.course4_10_exams_rewrites_question7 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question7;
exports.course4_10_exams_rewrites_question8 = require('./courses/4/10-exams-rewrites-student-support/assessments').course4_10_exams_rewrites_question8;

// Course 4 - Mid-Course Exam
exports.course4_06_mid_exam_question1 = require('./courses/4/06-mid-course-exam/assessments').course4_06_mid_exam_question1;
exports.course4_06_mid_exam_question2 = require('./courses/4/06-mid-course-exam/assessments').course4_06_mid_exam_question2;
exports.course4_06_mid_exam_question3 = require('./courses/4/06-mid-course-exam/assessments').course4_06_mid_exam_question3;

// Course 4 - Final Comprehensive Exam
exports.course4_11_final_exam_question1 = require('./courses/4/11-final-exam/assessments').course4_11_final_exam_question1;
exports.course4_11_final_exam_question2 = require('./courses/4/11-final-exam/assessments').course4_11_final_exam_question2;
exports.course4_11_final_exam_question3 = require('./courses/4/11-final-exam/assessments').course4_11_final_exam_question3;
exports.course4_11_final_exam_question4 = require('./courses/4/11-final-exam/assessments').course4_11_final_exam_question4;

// 100 Course Functions
exports.course100_02_core_concepts_multipleChoice = require('./courses/100/02-core-concepts/assessments').course100_02_core_concepts_multipleChoice;
exports.course100_02_core_concepts_aiQuestion = require('./courses/100/02-core-concepts/assessments').course100_02_core_concepts_aiQuestion;

