const { onCall } = require('firebase-functions/v2/https');

// Simple test function to verify CORS works
exports.testDatabaseAssessment = onCall(async (data, context) => {
  console.log('🎯 Test function called with data:', data);
  return {
    success: true,
    message: 'Test function works!',
    receivedData: data
  };
});