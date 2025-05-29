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

// Course management
const categoryFunctions = require('./categories');
const summaryFunctions = require('./summaries');
const ltiFunctions = require('./lti');
const IMathASFunctions = require('./IMathAS_Database');
const normalizedScheduleFunctions = require('./normalizedSchedule');
const asnFunctions = require('./asnSync');

// User management
const archiveStudentDataFunctions = require('./archiveStudentData');
const profileHistoryFunctions = require('./profileHistory');
const parentPortalFunctions = require('./parentPortal');
const studentPropertiesFunctions = require('./studentProperties');

// Edge functions
const edgeFunctions = require('./edge');

// AI services
const googleAIFunctions = require('./googleai');
//const tempFunctions = require('./TempFunction');

// Student dashboard notifications
const surveySubmissionFunctions = require('./surveySubmissions');

// Assessment functions - Course-specific
const COM1255IntroToELearning = require('./courses/COM1255/lessons/IntroToELearning');
const COM1255BenefitsChallenges = require('./courses/COM1255/lessons/BenefitsChallenges');

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

// Parent Portal functions
exports.sendParentInvitation = parentPortalFunctions.sendParentInvitation;
exports.sendParentInvitationOnCreate = parentPortalFunctions.sendParentInvitationOnCreate;
exports.validateParentInvitation = parentPortalFunctions.validateParentInvitation;
exports.verifyStudentASN = parentPortalFunctions.verifyStudentASN;
exports.processParentInvitationRequest = parentPortalFunctions.processParentInvitationRequest;
exports.acceptParentInvitation = parentPortalFunctions.acceptParentInvitation;
exports.approveStudentEnrollment = parentPortalFunctions.approveStudentEnrollment;
exports.getParentDashboardData = parentPortalFunctions.getParentDashboardData;

// Student Properties functions (Parent Portal)
exports.updateStudentPersonalInfo = studentPropertiesFunctions.updateStudentPersonalInfo;
exports.updateStudentAddress = studentPropertiesFunctions.updateStudentAddress;
exports.updateStudentAcademicInfo = studentPropertiesFunctions.updateStudentAcademicInfo;
exports.updateGuardianInfo = studentPropertiesFunctions.updateGuardianInfo;
exports.updateStudentStatus = studentPropertiesFunctions.updateStudentStatus;
exports.updateStudentDocuments = studentPropertiesFunctions.updateStudentDocuments;

//==============================================================================
// Assessment functions for courses
//==============================================================================

// COM1255 - E-Learning
exports.COM1255_IntroToELearningQ1 = COM1255IntroToELearning.handleMultipleChoiceQuestion;
exports.COM1255_IntroToELearningDynamic = COM1255IntroToELearning.handleDynamicQuestion;
exports.COM1255_BenefitsChallengesAI = COM1255BenefitsChallenges.handleAIQuestion;


// 2 Course Functions
exports.course2_shared_aiQuestion = require('./courses/2/shared/aiQuestions').course2_shared_aiQuestion;
exports.course2_02_momentum_one_dimension_aiQuestion = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_aiQuestion;
exports.course2_02_momentum_one_dimension_aiLongAnswer = require('./courses/2/02-momentum-one-dimension/assessments').course2_02_momentum_one_dimension_aiLongAnswer;

// 100 Course Functions
exports.course100_02_core_concepts_multipleChoice = require('./courses/100/02-core-concepts/assessments').course100_02_core_concepts_multipleChoice;
exports.course100_02_core_concepts_aiQuestion = require('./courses/100/02-core-concepts/assessments').course100_02_core_concepts_aiQuestion;
