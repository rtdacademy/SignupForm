// functions/index.js
const admin = require('firebase-admin');
require('dotenv').config();
const { setGlobalOptions } = require('firebase-functions/v2');
const { onValueWritten } = require('firebase-functions/v2/database');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export functions from other files
//const gradebookFunctions = require('./gradebook');
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
//const pasiFunctions = require('./pasi');
//const httpFunctions = require('./httpTrigger');
const speechFunctions = require('./speech'); 
const normalizedScheduleFunctions = require('./normalizedSchedule');
const pasiRecordsFunctions = require('./pasiRecords');

setGlobalOptions({
  region: 'us-central1',
  maxInstances: 30 
});

// Export gradebook functions
//exports.updateGradebookData = gradebookFunctions.updateGradebookData;

//exports.updateJsonGradebookSchedule = gradebookFunctions.updateJsonGradebookSchedule;
//exports.updateJsonGradebookScheduleOnScheduleChange = gradebookFunctions.updateJsonGradebookScheduleOnScheduleChange;

// Export payment functions
//exports.updatePaymentInfo = paymentFunctions.updatePaymentInfo;

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

// Export historical payment status update function
//exports.updateHistoricalPaymentStatus = historicalPaymentFunctions.updateHistoricalPaymentStatus;


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

//exports.syncPasiRecordsV2 = pasiFunctions.syncPasiRecordsV2;
//exports.syncCategoriesToStudents = pasiFunctions.syncCategoriesToStudents;



//exports.addSchoolYearToPasiLinks = httpFunctions.addSchoolYearToPasiLinks;

// Export text-to-speech function
exports.textToSpeechV2 = speechFunctions.textToSpeechV2; 

exports.streamTTSv2 = require('./standalone-streamTTSv2').streamTTSv2;



//exports.primarySchoolNameUpdate = httpFunctions.primarySchoolNameUpdate; 


// Export original normalized schedule functions (1st gen)
// Keeping these to allow gradual migration
//exports.onGradeUpdateTriggerNormalizedSchedule = normalizedScheduleFunctions.onGradeUpdateTriggerNormalizedSchedule;
//exports.generateNormalizedSchedule = normalizedScheduleFunctions.generateNormalizedSchedule;
//exports.onLMSStudentIDAssignedTriggerSchedule = normalizedScheduleFunctions.onLMSStudentIDAssignedTriggerSchedule;
//exports.updateDailyScheduleAdherence = normalizedScheduleFunctions.updateDailyScheduleAdherence;
//exports.batchUpdateNormalizedSchedules = normalizedScheduleFunctions.batchUpdateNormalizedSchedules;

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


exports.cleanupDeletedPasiRecordV2 = pasiRecordsFunctions.cleanupDeletedPasiRecordV2;
exports.cleanupOrphanedPasiLinksV2 = pasiRecordsFunctions.cleanupOrphanedPasiLinksV2;

/**
 * Cloud Function: debugDataStructure
 * Purpose: Log the structure of the data in Realtime Database events to verify access patterns
 */
const debugDataStructure = onValueWritten({
  ref: '/students/{studentId}/courses/{courseId}',
  region: 'us-central1'
}, async (event) => {
  const studentId = event.params.studentId;
  const courseId = event.params.courseId;
  
  console.log(`======= DEBUG: Data Structure for ${studentId}/${courseId} =======`);
  
  // Top level event structure
  console.log('Event object keys:', Object.keys(event));
  console.log('Event params:', event.params);
  
  // Data structure
  console.log('Data object keys:', Object.keys(event.data));
  
  // Before data
  if (event.data.before && event.data.before.exists()) {
    console.log('Before data exists');
    console.log('Before value:', JSON.stringify(event.data.before.val()));
    
    // Check specific nested paths
    const statusExists = event.data.before.child('Status').exists();
    console.log('Status exists in before data:', statusExists);
    
    if (statusExists) {
      console.log('Status value in before data:', 
                  JSON.stringify(event.data.before.child('Status').val()));
      
      const statusValueExists = event.data.before.child('Status').child('Value').exists();
      console.log('Status.Value exists in before data:', statusValueExists);
      
      if (statusValueExists) {
        console.log('Status.Value in before data:', 
                    event.data.before.child('Status').child('Value').val());
      }
    }
  } else {
    console.log('No before data (new record)');
  }
  
  // After data
  if (event.data.after && event.data.after.exists()) {
    console.log('After data exists');
    console.log('After value:', JSON.stringify(event.data.after.val()));
    
    // Check specific nested paths
    const statusExists = event.data.after.child('Status').exists();
    console.log('Status exists in after data:', statusExists);
    
    if (statusExists) {
      console.log('Status value in after data:', 
                  JSON.stringify(event.data.after.child('Status').val()));
      
      const statusValueExists = event.data.after.child('Status').child('Value').exists();
      console.log('Status.Value exists in after data:', statusValueExists);
      
      if (statusValueExists) {
        console.log('Status.Value in after data:', 
                    event.data.after.child('Status').child('Value').val());
      }
    }
  } else {
    console.log('No after data (record deleted)');
  }
  
  // Different ways to access nested data
  console.log('\n===== Testing different access patterns =====');
  try {
    // Direct path access using child() method
    if (event.data.after && event.data.after.exists()) {
      console.log('Direct child access (Status/Value):',
                  event.data.after.child('Status/Value').exists() ? 
                  event.data.after.child('Status/Value').val() : 'Path does not exist');
                  
      // Alternative path with separate child() calls
      const nestedValue = event.data.after.child('Status').child('Value').exists() ?
                          event.data.after.child('Status').child('Value').val() : 'Path does not exist';
      console.log('Chained child access (Status then Value):', nestedValue);
      
      // Path notation
      const paths = ['Status', 'Course', 'ScheduleJSON', 'payment_status'];
      for (const path of paths) {
        console.log(`${path} exists:`, event.data.after.child(path).exists());
      }
    }
  } catch (e) {
    console.error('Error testing access patterns:', e.message);
  }
  
  console.log('======= END DEBUG =======');
  
  // Don't make any changes, just return
  return null;
});

// Don't forget to export the function
exports.debugDataStructure = debugDataStructure;