// functions/index.js

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Export functions from other files
const gradebookFunctions = require('./gradebook');
const studentFunctions = require('./student');
const paymentFunctions = require('./payment');
const chatFunctions = require('./chat');
const categoryFunctions = require('./categories');
const summaryFunctions = require('./summaries');
const emailFunctions = require('./email');
const stripeFunctions = require('./stripe');
const historicalPaymentFunctions = require('./updateHistoricalPaymentStatus');
const ltiFunctions = require('./lti');

// Export all gradebook functions
exports.updateGradebookData = gradebookFunctions.updateGradebookData;
exports.addGradebookIndex = gradebookFunctions.addGradebookIndex;
exports.updateJsonGradebookSchedule = gradebookFunctions.updateJsonGradebookSchedule;
exports.updateJsonGradebookScheduleOnScheduleChange = gradebookFunctions.updateJsonGradebookScheduleOnScheduleChange;

// Export student functions
exports.updateStudentData = studentFunctions.updateStudentData;

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

// Export email functions
exports.sendEmail = emailFunctions.sendEmail;
exports.sendBulkEmails = emailFunctions.sendBulkEmails;

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