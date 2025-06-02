const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');

exports.generateDatabaseAssessmentSimple = onCall(async (request) => {
  try {
    const data = request.data;
    
    logger.info('=== DATABASE ASSESSMENT FUNCTION CALLED ===');
    logger.info('Data received:', data);
    
    // Just return success for now to test CORS
    return {
      success: true,
      message: 'Database assessment function called successfully',
      receivedData: data
    };
    
  } catch (error) {
    logger.error('Error in generateDatabaseAssessmentSimple:', error);
    return { success: false, error: error.message };
  }
});