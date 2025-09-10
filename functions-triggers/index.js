// Database Trigger Functions Export
const summaries = require('./summaries');
const archiveStudentData = require('./archiveStudentData');
const creditTrackingFunctions = require('./updateCreditTracking');
const scheduledFunctions = require('./updatePaymentStatusScheduled');

// Export all trigger functions
module.exports = {
  ...summaries,
  ...archiveStudentData,
  ...creditTrackingFunctions,
  ...scheduledFunctions
};