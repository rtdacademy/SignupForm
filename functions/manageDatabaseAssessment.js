/**
 * Generic Database-Driven Assessment Cloud Function
 * This function reads assessment configurations from the database and routes to appropriate assessment modules
 * 
 * ARCHITECTURE:
 * =============
 * Instead of hardcoding assessment configs in cloud functions, this system:
 * 1. Reads assessment configuration from database
 * 2. Routes to appropriate assessment module (AI Multiple Choice, AI Long Answer, etc.)
 * 3. Allows real-time configuration changes without code deployment
 * 
 * DATABASE SCHEMA:
 * ================
 * /courses/{courseId}/lessons/{lessonPath}/assessments/{assessmentId}
 * {
 *   id: string,
 *   title: string,
 *   type: "ai-multiple-choice" | "ai-long-answer",
 *   configuration: { ... }, // Type-specific config
 *   status: "active" | "draft" | "archived",
 *   createdAt: timestamp,
 *   createdBy: string,
 *   lessonPath: string,
 *   insertionPoint: string
 * }
 * 
 * USAGE:
 * ======
 * Frontend components call these functions instead of course-specific ones:
 * - generateDatabaseAssessment({ courseId, lessonPath, assessmentId, operation: 'generate', ... })
 * - evaluateDatabaseAssessment({ courseId, lessonPath, assessmentId, operation: 'evaluate', ... })
 */

const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');
// Temporarily commented out imports that might be causing issues
// const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef } = require('./shared/utilities/database-utils');
// const { createAIMultipleChoice } = require('./shared/assessment-types/ai-multiple-choice');
// const { createAILongAnswer } = require('./shared/assessment-types/ai-long-answer');

// Temporarily commented out until imports are fixed
/*
async function getAssessmentConfig(courseId, lessonPath, assessmentId) {
  // ... implementation
}
*/

// Temporarily commented out until imports are fixed
/*
async function handleAIMultipleChoice(config, data, context, operation) {
  // ... implementation
}

async function handleAILongAnswer(config, data, context, operation) {
  // ... implementation  
}
*/

// Temporarily commented out until imports are fixed
/*
function createGenericAssessmentHandler(operation) {
  // ... implementation
}
*/

// Simplified version to test basic functionality
exports.generateDatabaseAssessment = onCall(async (request) => {
  try {
    const data = request.data;
    console.log('🎯 generateDatabaseAssessment called with data:', data);
    
    // Just return success for now to test CORS
    return {
      success: true,
      message: 'generateDatabaseAssessment function works!',
      operation: data.operation || 'generate',
      receivedData: data
    };
    
  } catch (error) {
    console.error('❌ Error in generateDatabaseAssessment:', error);
    return { 
      success: false, 
      error: error.message 
    };
  }
});

/**
 * Utility function to create/update assessment configurations in database
 * This is called by the code editor when teachers create assessments
 */
exports.manageDatabaseAssessmentConfig = onCall(async (request) => {
  try {
    const data = request.data;
    const context = request;
    
    console.log('🔧 manageDatabaseAssessmentConfig received data:', {
      action: data.action,
      courseId: data.courseId,
      lessonPath: data.lessonPath,
      assessmentId: data.assessmentId,
      hasConfiguration: !!data.configuration
    });
    
    // Validate user is authenticated and is staff
    // Temporarily disabled for emulator development
    // if (!context.auth) {
    //   throw new Error('Authentication required');
    // }
    
    // Extract parameters
    const { courseId, lessonPath, assessmentId, configuration, action } = data;
    
    if (!courseId || !lessonPath || !assessmentId || !action) {
      throw new Error('courseId, lessonPath, assessmentId, and action are required');
    }
    
    const db = getDatabase();
    const assessmentRef = db.ref(`courses_secure/${courseId}/assessmentConfig/${lessonPath}/${assessmentId}`);
    
    switch (action) {
      case 'save':
        if (!configuration || !configuration.type) {
          throw new Error('configuration and configuration.type are required for save action');
        }
        
        // Validate configuration based on type (temporarily disabled)
        // validateAssessmentConfiguration(configuration);
        
        const assessmentData = {
          id: assessmentId,
          title: configuration.title || `Assessment ${assessmentId}`,
          type: configuration.type,
          configuration: configuration,
          status: 'active',
          createdAt: Date.now(), // Simplified timestamp
          modifiedAt: Date.now(), // Simplified timestamp
          createdBy: context.auth?.token?.email || context.auth?.uid || 'development-user',
          lessonPath: lessonPath,
          insertionPoint: configuration.insertionPoint || 'end'
        };
        
        await assessmentRef.set(assessmentData);
        
        console.log(`✅ Saved assessment configuration: ${courseId}/${lessonPath}/${assessmentId}`);
        return {
          success: true,
          message: 'Assessment configuration saved successfully',
          assessmentId: assessmentId
        };
        
      case 'load':
        const snapshot = await assessmentRef.once('value');
        if (!snapshot.exists()) {
          throw new Error('Assessment configuration not found');
        }
        
        return {
          success: true,
          configuration: snapshot.val()
        };
        
      case 'delete':
        await assessmentRef.remove();
        
        console.log(`🗑️ Deleted assessment configuration: ${courseId}/${lessonPath}/${assessmentId}`);
        return {
          success: true,
          message: 'Assessment configuration deleted successfully'
        };
        
      case 'list':
        const lessonRef = db.ref(`courses/${courseId}/lessons/${lessonPath}/assessments`);
        const lessonSnapshot = await lessonRef.once('value');
        const assessments = lessonSnapshot.val() || {};
        
        return {
          success: true,
          assessments: Object.keys(assessments).map(id => ({
            id,
            ...assessments[id]
          }))
        };
        
      default:
        throw new Error(`Unsupported action: ${action}`);
    }
    
  } catch (error) {
    console.error('❌ Error managing assessment configuration:', error);
    throw new Error(`Failed to manage assessment configuration: ${error.message}`);
  }
});

/**
 * Validates assessment configuration based on type
 * @param {Object} configuration - Assessment configuration to validate
 */
function validateAssessmentConfiguration(configuration) {
  const { type } = configuration;
  
  switch (type) {
    case 'ai-multiple-choice':
      validateAIMultipleChoiceConfig(configuration);
      break;
      
    case 'ai-long-answer':
      validateAILongAnswerConfig(configuration);
      break;
      
    default:
      throw new Error(`Unknown assessment type: ${type}`);
  }
}

/**
 * Validates AI Multiple Choice configuration
 * @param {Object} config - Configuration to validate
 */
function validateAIMultipleChoiceConfig(config) {
  // Check required fields
  if (!config.prompts || typeof config.prompts !== 'object') {
    throw new Error('AI Multiple Choice configuration must include prompts object');
  }
  
  if (!config.prompts.intermediate) {
    throw new Error('AI Multiple Choice configuration must include at least an intermediate prompt');
  }
  
  // Validate optional numeric fields
  if (config.maxAttempts && (typeof config.maxAttempts !== 'number' || config.maxAttempts < 1)) {
    throw new Error('maxAttempts must be a positive number');
  }
  
  if (config.pointsValue && (typeof config.pointsValue !== 'number' || config.pointsValue < 0)) {
    throw new Error('pointsValue must be a non-negative number');
  }
  
  // Validate theme if provided
  if (config.theme && !['blue', 'green', 'purple', 'amber'].includes(config.theme)) {
    throw new Error('theme must be one of: blue, green, purple, amber');
  }
  
  console.log('✅ AI Multiple Choice configuration validated');
}

/**
 * Validates AI Long Answer configuration
 * @param {Object} config - Configuration to validate
 */
function validateAILongAnswerConfig(config) {
  // Check required fields
  if (!config.prompts || typeof config.prompts !== 'object') {
    throw new Error('AI Long Answer configuration must include prompts object');
  }
  
  if (!config.prompts.intermediate) {
    throw new Error('AI Long Answer configuration must include at least an intermediate prompt');
  }
  
  // Validate rubrics if provided
  if (config.rubrics) {
    Object.keys(config.rubrics).forEach(difficulty => {
      const rubric = config.rubrics[difficulty];
      if (!Array.isArray(rubric)) {
        throw new Error(`Rubric for ${difficulty} must be an array`);
      }
      
      rubric.forEach((criterion, index) => {
        if (!criterion.criterion || !criterion.points || !criterion.description) {
          throw new Error(`Rubric criterion ${index} for ${difficulty} must have criterion, points, and description`);
        }
      });
    });
  }
  
  // Validate word limits if provided
  if (config.wordLimits) {
    if (typeof config.wordLimits.min !== 'number' || typeof config.wordLimits.max !== 'number') {
      throw new Error('wordLimits must include numeric min and max values');
    }
    
    if (config.wordLimits.min >= config.wordLimits.max) {
      throw new Error('wordLimits.min must be less than wordLimits.max');
    }
  }
  
  console.log('✅ AI Long Answer configuration validated');
}

// Temporarily commented out until functions are implemented
// module.exports = {
//   getAssessmentConfig,
//   validateAssessmentConfiguration
// };