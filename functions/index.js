// functions/index.js
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export functions from other files
const gradebookFunctions = require('./gradebook');
const paymentFunctions = require('./payment');
const chatFunctions = require('./chat');
const categoryFunctions = require('./categories');
const summaryFunctions = require('./summaries');
const emailFunctions = require('./email');
const stripeFunctions = require('./stripe');
const historicalPaymentFunctions = require('./updateHistoricalPaymentStatus');
const ltiFunctions = require('./lti');
const IMathASFunctions = require('./IMathAS_Database');
const edgeFunctions = require('./edge');
const asnFunctions = require('./asnSync');
const pasiFunctions = require('./pasi');
const httpFunctions = require('./httpTrigger');
const speechFunctions = require('./speech'); 
const normalizedScheduleFunctions = require('./normalizedSchedule');
const pasiRecordsFunctions = require('./pasiRecords');

// Export gradebook functions
exports.updateGradebookData = gradebookFunctions.updateGradebookData;

exports.updateJsonGradebookSchedule = gradebookFunctions.updateJsonGradebookSchedule;
exports.updateJsonGradebookScheduleOnScheduleChange = gradebookFunctions.updateJsonGradebookScheduleOnScheduleChange;

// Export payment functions
exports.updatePaymentInfo = paymentFunctions.updatePaymentInfo;

// Export chat functions
exports.removeUserFromChat = chatFunctions.removeUserFromChat;
exports.sendChatNotification = chatFunctions.sendChatNotification;
exports.sendChatMessage = chatFunctions.sendChatMessage;

// Export category functions
exports.deleteCategoryForStudents = categoryFunctions.deleteCategoryForStudents;

// Export summary functions
exports.updateStudentCourseSummary = summaryFunctions.updateStudentCourseSummary;
exports.syncProfileToCourseSummaries = summaryFunctions.syncProfileToCourseSummaries;
exports.createStudentCourseSummaryOnCourseCreate = summaryFunctions.createStudentCourseSummaryOnCourseCreate;
exports.batchSyncStudentDataV2 = summaryFunctions.batchSyncStudentDataV2;



// Export email functions
exports.sendBulkEmails = emailFunctions.sendBulkEmails;
// Sendgrid webhooks
exports.handleWebhookEvents = emailFunctions.handleWebhookEvents;
exports.sendCourseEmail = emailFunctions.sendCourseEmail;
exports.testCheckCourseDates = emailFunctions.testCheckCourseDates;



// Export Stripe webhook and related functions
exports.handleStripeWebhook = stripeFunctions.handleStripeWebhook;
exports.handleOneTimePayment = stripeFunctions.handleOneTimePayment;
exports.handleSubscriptionUpdate = stripeFunctions.handleSubscriptionUpdate;
exports.handleSubscriptionSchedule = stripeFunctions.handleSubscriptionSchedule;
exports.getPaymentStatus = stripeFunctions.getPaymentStatus;

// Export historical payment status update function
exports.updateHistoricalPaymentStatus = historicalPaymentFunctions.updateHistoricalPaymentStatus;

// Export LTI functions
exports.ltiJwks = ltiFunctions.ltiJwks;
exports.ltiLogin = ltiFunctions.ltiLogin;
exports.ltiAuth = ltiFunctions.ltiAuth; 
exports.ltiDeepLinkReturn = ltiFunctions.ltiDeepLinkReturn; 
exports.getLTILinks = ltiFunctions.getLTILinks;
exports.ltiGradeCallback = ltiFunctions.ltiGradeCallback;




// functions to sync data between mysql and realtime database
exports.updateIMathASGrade = IMathASFunctions.updateIMathASGrade;
exports.importIMathASGrades = IMathASFunctions.importIMathASGrades;


exports.fetchLMSStudentId = edgeFunctions.fetchLMSStudentId;

// Export ASN sync function
exports.syncStudentASN = asnFunctions.syncStudentASN;
exports.rebuildASNNodes = asnFunctions.rebuildASNNodes;

exports.syncPasiRecordsV2 = pasiFunctions.syncPasiRecordsV2;
exports.syncCategoriesToStudents = pasiFunctions.syncCategoriesToStudents;



exports.addSchoolYearToPasiLinks = httpFunctions.addSchoolYearToPasiLinks;

// Export text-to-speech function
exports.textToSpeech = speechFunctions.textToSpeech; 

exports.streamTTSv2 = require('./standalone-streamTTSv2').streamTTSv2;



exports.primarySchoolNameUpdate = httpFunctions.primarySchoolNameUpdate; 


// Export original normalized schedule functions (1st gen)
// Keeping these to allow gradual migration
exports.onGradeUpdateTriggerNormalizedSchedule = normalizedScheduleFunctions.onGradeUpdateTriggerNormalizedSchedule;
exports.generateNormalizedSchedule = normalizedScheduleFunctions.generateNormalizedSchedule;
exports.onLMSStudentIDAssignedTriggerSchedule = normalizedScheduleFunctions.onLMSStudentIDAssignedTriggerSchedule;
exports.updateDailyScheduleAdherence = normalizedScheduleFunctions.updateDailyScheduleAdherence;
exports.batchUpdateNormalizedSchedules = normalizedScheduleFunctions.batchUpdateNormalizedSchedules;

// Export new V2 normalized schedule functions (2nd gen)
// Triggered when a grade is updated in imathas_grades, automatically updates student's normalized schedule
exports.onGradeUpdateTriggerNormalizedScheduleV2 = normalizedScheduleFunctions.onGradeUpdateTriggerNormalizedScheduleV2;

// HTTP callable function to generate/update a normalized schedule for a specific student and course
exports.generateNormalizedScheduleV2 = normalizedScheduleFunctions.generateNormalizedScheduleV2;

// Triggered when a student's LMSStudentID is assigned, generates their normalized schedule
exports.onLMSStudentIDAssignedTriggerScheduleV2 = normalizedScheduleFunctions.onLMSStudentIDAssignedTriggerScheduleV2;

// Scheduled daily function that performs lightweight updates to all active students' schedule adherence metrics
exports.updateDailyScheduleAdherenceV2 = normalizedScheduleFunctions.updateDailyScheduleAdherenceV2;

// HTTP callable function to process schedule updates for multiple students in parallel with progress tracking
exports.batchUpdateNormalizedSchedulesV2 = normalizedScheduleFunctions.batchUpdateNormalizedSchedulesV2;


exports.cleanupDeletedPasiRecord = pasiRecordsFunctions.cleanupDeletedPasiRecord;
exports.cleanupOrphanedPasiLinks = pasiRecordsFunctions.cleanupOrphanedPasiLinks;