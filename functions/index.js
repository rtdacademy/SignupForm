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

// Export the functions
exports.updateGradebookData = gradebookFunctions.updateGradebookData;
exports.addGradebookIndex = gradebookFunctions.addGradebookIndex;
exports.updateJsonGradebookSchedule = gradebookFunctions.updateJsonGradebookSchedule;
exports.updateJsonGradebookScheduleOnScheduleChange = gradebookFunctions.updateJsonGradebookScheduleOnScheduleChange;

exports.updateStudentData = studentFunctions.updateStudentData;

exports.updatePaymentInfo = paymentFunctions.updatePaymentInfo;

exports.removeUserFromChat = chatFunctions.removeUserFromChat;
exports.sendChatNotification = chatFunctions.sendChatNotification;
exports.sendChatMessage = chatFunctions.sendChatMessage;

exports.deleteCategoryForStudents = categoryFunctions.deleteCategoryForStudents;

exports.updateStudentCourseSummary = summaryFunctions.updateStudentCourseSummary;
