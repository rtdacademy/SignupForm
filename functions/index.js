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

// Course 2 - Physics 20 Review
exports.course2_01_physics_20_review_q1 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q1;
exports.course2_01_physics_20_review_q2 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q2;
exports.course2_01_physics_20_review_q3 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q3;
exports.course2_01_physics_20_review_q4 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q4;
exports.course2_01_physics_20_review_q5 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q5;
exports.course2_01_physics_20_review_q6 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q6;
exports.course2_01_physics_20_review_q7 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q7;
exports.course2_01_physics_20_review_q8 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q8;
exports.course2_01_physics_20_review_q9 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q9;
exports.course2_01_physics_20_review_q10 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q10;
exports.course2_01_physics_20_review_q11 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q11;
exports.course2_01_physics_20_review_q12 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q12;
exports.course2_01_physics_20_review_q13 = require('./courses/2/01-physics-20-review/assessments').course2_01_physics_20_review_q13;

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

