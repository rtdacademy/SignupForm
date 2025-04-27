// functions/index.js
const admin = require('firebase-admin');
require('dotenv').config();
const { setGlobalOptions } = require('firebase-functions/v2');


// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export functions from other files
//const paymentFunctions = require('./payment');
const chatFunctions = require('./chat');
const categoryFunctions = require('./categories');
const summaryFunctions = require('./summaries');
const emailFunctions = require('./email');
const stripeFunctions = require('./stripe');
//const historicalPaymentFunctions = require('./updateHistoricalPaymentStatus');
const ltiFunctions = require('./lti');
const IMathASFunctions = require('./IMathAS_Database');
const edgeFunctions = require('./edge');
const asnFunctions = require('./asnSync');
//const httpFunctions = require('./httpTrigger');
const speechFunctions = require('./speech'); 
const normalizedScheduleFunctions = require('./normalizedSchedule');
//const pasiRecordsFunctions = require('./pasiRecords');
//const tempFunctions = require('./TempFunction');

const archiveStudentDataFunctions = require('./archiveStudentData');

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 30 
});

// Export chat functions
exports.sendChatNotificationV2 = chatFunctions.sendChatNotificationV2;
exports.removeUserFromChatV2 = chatFunctions.removeUserFromChatV2;
exports.sendChatMessageV2 = chatFunctions.sendChatMessageV2;

// Export category functions
exports.deleteCategoryForStudentsV2 = categoryFunctions.deleteCategoryForStudentsV2;

// Export summary functions
exports.syncProfileToCourseSummariesV2 = summaryFunctions.syncProfileToCourseSummariesV2;
exports.updateStudentCourseSummaryV2 = summaryFunctions.updateStudentCourseSummaryV2;
exports.createStudentCourseSummaryOnCourseCreateV2 = summaryFunctions.createStudentCourseSummaryOnCourseCreateV2;
exports.batchSyncStudentDataV2 = summaryFunctions.batchSyncStudentDataV2;


//email
exports.sendBulkEmailsV2 = emailFunctions.sendBulkEmailsV2;
exports.handleWebhookEventsV2 = emailFunctions.handleWebhookEventsV2;
exports.checkCourseDatesV2 = emailFunctions.checkCourseDatesV2;
exports.testCheckCourseDatesV2 = emailFunctions.testCheckCourseDatesV2;

// Export Stripe webhook and related functions
exports.handleStripeWebhookV2 = stripeFunctions.handleStripeWebhookV2;
exports.handleOneTimePaymentV2 = stripeFunctions.handleOneTimePaymentV2;
exports.handleSubscriptionUpdateV2 = stripeFunctions.handleSubscriptionUpdateV2;
exports.handleSubscriptionScheduleV2 = stripeFunctions.handleSubscriptionScheduleV2;
exports.getPaymentStatusV2 = stripeFunctions.getPaymentStatusV2;


// Export LTI functions using v2 endpoints
exports.ltiJwksV2 = ltiFunctions.ltiJwksV2;
exports.ltiLoginV2 = ltiFunctions.ltiLoginV2;
exports.ltiAuthV2 = ltiFunctions.ltiAuthV2;
exports.ltiDeepLinkReturnV2 = ltiFunctions.ltiDeepLinkReturnV2;
exports.getLTILinksV2 = ltiFunctions.getLTILinksV2;
exports.ltiGradeCallbackV2 = ltiFunctions.ltiGradeCallbackV2;



// functions to sync data between mysql and realtime database
exports.updateIMathASGradeV2 = IMathASFunctions.updateIMathASGradeV2;
exports.importIMathASGradesV2 = IMathASFunctions.importIMathASGradesV2;


exports.fetchLMSStudentIdV2 = edgeFunctions.fetchLMSStudentIdV2;

// Export ASN sync function
exports.syncStudentASNV2 = asnFunctions.syncStudentASNV2;
exports.rebuildASNNodesV2 = asnFunctions.rebuildASNNodesV2;

// Export text-to-speech function
exports.textToSpeechV2 = speechFunctions.textToSpeechV2; 

exports.streamTTSv2 = require('./standalone-streamTTSv2').streamTTSv2;


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


//exports.cleanupDeletedPasiRecordV2 = pasiRecordsFunctions.cleanupDeletedPasiRecordV2;
//exports.cleanupOrphanedPasiLinksV2 = pasiRecordsFunctions.cleanupOrphanedPasiLinksV2;



//exports.cleanupIncorrectRootNodes = tempFunctions.cleanupIncorrectRootNodes;

exports.archiveStudentDataV2 = archiveStudentDataFunctions.archiveStudentDataV2;
exports.restoreStudentDataV2 = archiveStudentDataFunctions.restoreStudentDataV2;
