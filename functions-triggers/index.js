// Database Trigger Functions Export
const summaries = require('./summaries');
const archiveStudentData = require('./archiveStudentData');

// Export all trigger functions
module.exports = {
  ...summaries,
  ...archiveStudentData
};