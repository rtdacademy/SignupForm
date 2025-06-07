// functions/courseConfig.js
const { onCall } = require('firebase-functions/v2/https');
const fs = require('fs').promises;
const path = require('path');

/**
 * Fetches course configuration from the functions/courses-config directory
 * This is a read-only function to display hardcoded course settings
 */
exports.getCourseConfigV2 = onCall(async (request) => {
  try {
    const { courseId } = request.data;
    
    if (!courseId) {
      throw new Error('Course ID is required');
    }

    // Construct the path to the course config file
    const configPath = path.join(__dirname, 'courses-config', courseId.toString(), 'course-config.json');
    
    try {
      // Read the configuration file
      const configData = await fs.readFile(configPath, 'utf8');
      const courseConfig = JSON.parse(configData);
      
      return {
        success: true,
        courseConfig,
        configPath: `functions/courses-config/${courseId}/course-config.json`
      };
    } catch (error) {
      // If file doesn't exist, return a clear message
      if (error.code === 'ENOENT') {
        return {
          success: false,
          error: 'Course configuration not found',
          message: `No configuration file found at functions/courses-config/${courseId}/course-config.json`,
          configPath: `functions/courses-config/${courseId}/course-config.json`
        };
      }
      
      // For other errors (like JSON parsing), throw them
      throw error;
    }
  } catch (error) {
    console.error('Error fetching course config:', error);
    return {
      success: false,
      error: error.message
    };
  }
});