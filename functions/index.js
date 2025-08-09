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
//const summaryFunctions = require('./summaries');
const sessionScoreRecalculationFunctions = require('./sessionScoreRecalculation');
const ltiFunctions = require('./lti');
const IMathASFunctions = require('./IMathAS_Database');
const normalizedScheduleFunctions = require('./normalizedSchedule');
const asnFunctions = require('./asnSync');

// User management
// const archiveStudentDataFunctions = require('./archiveStudentData'); // Moved to triggers codebase
const archiveUserActivityFunctions = require('./archiveUserActivity');
const retrieveUserActivityFunctions = require('./retrieveUserActivity');
const retrieveAuthActivityLogsFunctions = require('./retrieveAuthActivityLogs');
const profileHistoryFunctions = require('./profileHistory');
const parentPortalFunctions = require('./parentPortal');
const studentPropertiesFunctions = require('./studentProperties');
const updateStudentProfileFunctions = require('./updateStudentProfile');
const adminUserManagementFunctions = require('./adminUserManagement');

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
const googleGenkitFunctions = require('./googlegenkit');
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
// exports.archiveStudentDataV2 = archiveStudentDataFunctions.archiveStudentDataV2; // Moved to triggers codebase
// exports.restoreStudentDataV2 = archiveStudentDataFunctions.restoreStudentDataV2; // Moved to triggers codebase
exports.archiveUserActivity = archiveUserActivityFunctions.archiveUserActivity;
exports.cleanupOldActivityData = archiveUserActivityFunctions.cleanupOldActivityData;
exports.retrieveUserActivity = retrieveUserActivityFunctions.retrieveUserActivity;
exports.generateActivityReport = retrieveUserActivityFunctions.generateActivityReport;

// Auth activity logging functions
exports.retrieveAuthActivityLogs = retrieveAuthActivityLogsFunctions.retrieveAuthActivityLogs;
exports.getAuthActivitySummary = retrieveAuthActivityLogsFunctions.getAuthActivitySummary;
exports.getAuthSecurityAlerts = retrieveAuthActivityLogsFunctions.getAuthSecurityAlerts;
exports.trackProfileChangesV2 = profileHistoryFunctions.trackProfileChangesV2;
exports.trackCourseEnrollmentChangesV2 = profileHistoryFunctions.trackCourseEnrollmentChangesV2;

/* Course summary and data functions
exports.syncProfileToCourseSummariesV2 = summaryFunctions.syncProfileToCourseSummariesV2;
exports.updateStudentCourseSummaryV2 = summaryFunctions.updateStudentCourseSummaryV2;
exports.createStudentCourseSummaryOnCourseCreateV2 = summaryFunctions.createStudentCourseSummaryOnCourseCreateV2;
exports.batchSyncStudentDataV2 = summaryFunctions.batchSyncStudentDataV2;
*/

// Session score recalculation functions
exports.recalculateSessionScores = sessionScoreRecalculationFunctions.recalculateSessionScores;
exports.handleManualOverrideModeChange = sessionScoreRecalculationFunctions.handleManualOverrideModeChange;

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

// Stripe Connect functions for parent payouts (consolidated)
const { 
  createStripeConnectAccount,
  createAccountSession,
  debugStripeAccount,
  updateStripeAccount,
  deleteStripeAccount
} = require('./stripe-connect');
const { processReimbursementPayout } = require('./processReimbursementPayout');

exports.createStripeConnectAccount = createStripeConnectAccount;
exports.createAccountSession = createAccountSession;
exports.processReimbursementPayout = processReimbursementPayout;
exports.debugStripeAccount = debugStripeAccount;
exports.updateStripeAccount = updateStripeAccount;
exports.deleteStripeAccount = deleteStripeAccount;



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

// Google Genkit functions
exports.analyzeReceipt = googleGenkitFunctions.analyzeReceipt;
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


// Family custom claims functions
const familyCustomClaimsFunctions = require('./setFamilyCustomClaims');
const saveFamilyDataFunction = require('./saveFamilyData');
//exports.setFamilyCustomClaims = familyCustomClaimsFunctions.setFamilyCustomClaims;
//exports.syncGuardianPermissions = familyCustomClaimsFunctions.syncGuardianPermissions;
//exports.syncStudentPermissions = familyCustomClaimsFunctions.syncStudentPermissions;
exports.applyPendingPermissions = familyCustomClaimsFunctions.applyPendingPermissions;
exports.saveFamilyData = saveFamilyDataFunction;

// Staff custom claims functions
const staffCustomClaimsFunctions = require('./setStaffCustomClaims');
const optimizedStaffFunctions = require('./getAllStaffPermissionsOptimized');
exports.setBasicStaffClaim = staffCustomClaimsFunctions.setBasicStaffClaim;
exports.setStaffCustomClaims = staffCustomClaimsFunctions.setStaffCustomClaims;
exports.getAnyStaffPermissions = staffCustomClaimsFunctions.getAnyStaffPermissions;
exports.getAllStaffPermissions = staffCustomClaimsFunctions.getAllStaffPermissions;
exports.getAllStaffPermissionsOptimized = optimizedStaffFunctions.getAllStaffPermissionsOptimized;
exports.getAnyUserPermissions = staffCustomClaimsFunctions.getAnyUserPermissions;
exports.updateStaffPermissions = staffCustomClaimsFunctions.updateStaffPermissions;
exports.removeStaffPermissions = staffCustomClaimsFunctions.removeStaffPermissions;

// Admin user management functions
exports.setTemporaryPassword = adminUserManagementFunctions.setTemporaryPassword;
exports.deleteFirebaseAuthUser = adminUserManagementFunctions.deleteFirebaseAuthUser;
exports.toggleUserAccountStatus = adminUserManagementFunctions.toggleUserAccountStatus;
exports.getUserSignInMethods = adminUserManagementFunctions.getUserSignInMethods;
exports.getAdminAuditLog = adminUserManagementFunctions.getAdminAuditLog;
exports.sendTempPasswordEmail = adminUserManagementFunctions.sendTempPasswordEmail;
exports.createUserWithTempPassword = adminUserManagementFunctions.createUserWithTempPassword;
exports.removeTempPasswordClaim = adminUserManagementFunctions.removeTempPasswordClaim;

// Student profile update functions
exports.updateStudentProfile = updateStudentProfileFunctions.updateStudentProfile;

// Student Registration functions
const studentRegistrationFunctions = require('./submitStudentRegistration');
exports.submitStudentRegistration = studentRegistrationFunctions.submitStudentRegistration;

// Reimbursement submission function
const reimbursementFunctions = require('./submitReimbursement');
exports.submitReimbursement = reimbursementFunctions.submitReimbursement;


// Student Profile functions
const studentProfileFunctions = require('./updateStudentProfile');
exports.updateStudentProfile = studentProfileFunctions.updateStudentProfile;

// Student Schedule functions
const studentScheduleFunctions = require('./saveStudentSchedule');
const studentScheduleV2Functions = require('./saveStudentScheduleV2');
exports.saveStudentSchedule = studentScheduleFunctions.saveStudentSchedule;
exports.saveStudentScheduleV2 = studentScheduleV2Functions.saveStudentScheduleV2;

// Legacy reimbursement functions removed - replaced with Stripe Connect

// Gradebook functions - NEW SERVER-SIDE SYSTEM
exports.updateGradebookOnSessionComplete = gradebookFunctions.updateGradebookOnSessionComplete;
exports.updateGradebookOnAssessmentScore = gradebookFunctions.updateGradebookOnAssessmentScore;
exports.recalculateStudentGradebook = gradebookFunctions.recalculateStudentGradebook;


// Exam session management functions
exports.startExamSession = examSessionFunctions.startExamSession;
exports.saveExamAnswer = examSessionFunctions.saveExamAnswer;
exports.submitExamSession = examSessionFunctions.submitExamSession;
exports.getExamSession = examSessionFunctions.getExamSession;
exports.detectActiveExamSession = examSessionFunctions.detectActiveExamSession;
exports.exitExamSession = examSessionFunctions.exitExamSession;
exports.createTeacherSession = examSessionFunctions.createTeacherSession;
exports.deleteTeacherSession = examSessionFunctions.deleteTeacherSession;

//==============================================================================
// Core functions only (course-specific functions moved to separate codebases)
//==============================================================================

// Course-specific functions are now deployed independently:
// - Course 2: firebase deploy --only functions:course-2
// - Course 3: firebase deploy --only functions:course-3  
// - Course 4: firebase deploy --only functions:course-4
// No course-specific functions exported here - they are deployed via separate codebases

//==============================================================================
// Course Assessment Functions (Consolidated)
//==============================================================================

// Course 2 (Physics 30) Master Assessment Function
const course2AssessmentFunctions = require('./courses/2/assessments');
exports.course2_assessments = course2AssessmentFunctions.course2_assessments;

// Course 2 Lab Submission Function (consolidated with assessments)
exports.course2_lab_submit = course2AssessmentFunctions.course2_lab_submit;

// Course 2 Lesson 41: Activities Assessment Functions
const course2_41_activities = require('./courses/2/41-activities/assessments');
exports.course2_41_station1_q1 = course2_41_activities.course2_41_station1_q1;
exports.course2_41_station1_q2 = course2_41_activities.course2_41_station1_q2;
exports.course2_41_station1_q3 = course2_41_activities.course2_41_station1_q3;
exports.course2_41_station1_q4 = course2_41_activities.course2_41_station1_q4;
exports.course2_41_station1_q5 = course2_41_activities.course2_41_station1_q5;
exports.course2_41_station2_q1 = course2_41_activities.course2_41_station2_q1;
exports.course2_41_station2_q2 = course2_41_activities.course2_41_station2_q2;
exports.course2_41_station2_q3 = course2_41_activities.course2_41_station2_q3;
exports.course2_41_station2_q4 = course2_41_activities.course2_41_station2_q4;
exports.course2_41_station2_q5 = course2_41_activities.course2_41_station2_q5;
exports.course2_41_station3_q1 = course2_41_activities.course2_41_station3_q1;
exports.course2_41_station3_q2 = course2_41_activities.course2_41_station3_q2;
exports.course2_41_station3_q3 = course2_41_activities.course2_41_station3_q3;
exports.course2_41_station3_q4 = course2_41_activities.course2_41_station3_q4;
exports.course2_41_station3_q5 = course2_41_activities.course2_41_station3_q5;
exports.course2_41_station4_q1 = course2_41_activities.course2_41_station4_q1;
exports.course2_41_station4_q2 = course2_41_activities.course2_41_station4_q2;
exports.course2_41_station4_q3 = course2_41_activities.course2_41_station4_q3;
exports.course2_41_station4_q4 = course2_41_activities.course2_41_station4_q4;
exports.course2_41_station4_q5 = course2_41_activities.course2_41_station4_q5;

