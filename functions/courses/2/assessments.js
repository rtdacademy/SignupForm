/**
 * Master Cloud Function for Course 2 (Physics 30) Assessments
 * 
 * This consolidated function handles all assessment requests directly using the core logic,
 * reducing the number of deployed functions from ~200+ to just 1.
 * 
 * ARCHITECTURE:
 * - Imports the core assessment logic (not the cloud functions)
 * - Uses assessmentId to route to the correct assessment configuration
 * - Handles the logic directly without calling other cloud functions
 * - Only this master function needs to be deployed
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('../../utils');

// Initialize Firebase Admin globally - this needs to happen before any other imports
// that might use admin services
if (!admin.apps.length) {
  admin.initializeApp();
}

const { StandardMultipleChoiceCore } = require('../../shared/assessment-types/standard-multiple-choice');

// We need to extract and recreate the question generator functions from the original file
// Rather than importing the cloud functions, we'll recreate the core logic here

// Import assessment configurations from all lesson files
const { assessmentConfigs: physicsReviewConfigs } = require('../2a/01-physics-20-review/assessments');
const { assessmentConfigs: momentum1DConfigs } = require('../2a/02-momentum-one-dimension/assessments');
const { assessmentConfigs: momentum2DConfigs } = require('../2a/03-momentum-two-dimensions/assessments');
const { assessmentConfigs: impulseConfigs } = require('../2a/04-impulse-momentum-change/assessments');
const { assessmentConfigs: l13AssignmentConfigs } = require('../2a/05-l1-3-assignment/assessments');

/**
 * Assessment Configuration Mapping
 * Maps assessmentId to the appropriate assessment configuration
 * Now imports directly from the original assessment files
 */
const getAllAssessmentConfigs = () => {
  return {
    ...physicsReviewConfigs,
    ...momentum1DConfigs,
    ...momentum2DConfigs,
    ...impulseConfigs,
    ...l13AssignmentConfigs
  };
};

const getAssessmentConfig = (assessmentId) => {
  const allConfigs = getAllAssessmentConfigs();
  return allConfigs[assessmentId] || null;
};

/**
 * Master cloud function (v2) that handles all course 2 assessments
 * Routes requests to the appropriate assessment configuration and processes directly
 */
exports.course2_assessments = onCall(async (request) => {
  try {
    console.log('🚀 NEW v2 FUNCTION RUNNING - SIMPLIFIED VERSION');
    const data = request.data;
    
    console.log('=== DEBUGGING v2 FUNCTION ===');
    console.log('Request type:', typeof request);
    console.log('Data type:', typeof data);
    console.log('Data exists:', !!data);
    
    if (data) {
      console.log('Data keys:', Object.keys(data));
      for (const key of Object.keys(data)) {
        console.log(`${key}:`, data[key]);
      }
    }
    
    // Extract assessmentId from the request
    const { assessmentId, ...otherData } = data || {};
    
    console.log(`Master function received request for assessment: ${assessmentId}`);
    
    // Get the assessment configuration for this assessmentId
    const assessmentConfig = getAssessmentConfig(assessmentId);
    
    if (!assessmentConfig) {
      console.error(`No assessment configuration found for assessmentId: ${assessmentId}`);
      throw new Error(`Assessment configuration not found for: ${assessmentId}`);
    }
    
    console.log(`Processing assessment directly for: ${assessmentId}`);
    
    // Create the core handler with the assessment configuration
    const coreHandler = new StandardMultipleChoiceCore(assessmentConfig);
    
    // Extract operation parameters (this mimics what the individual functions do)
    const params = {
      courseId: data.courseId,
      assessmentId: assessmentId,
      operation: data.operation,
      studentEmail: data.studentEmail,
      studentKey: sanitizeEmail(data.studentEmail), // Add sanitized student key for database path
      userId: data.userId,
      topic: data.topic || 'general',
      difficulty: data.difficulty || 'intermediate',
      answer: data.answer // For evaluation operations
    };
    
    // Handle the request directly using the core logic
    if (params.operation === 'generate') {
      console.log(`Generating question for: ${assessmentId}`);
      const result = await coreHandler.handleGenerate(params);
      console.log(`Question generated successfully for: ${assessmentId}`);
      return result;
    } 
    else if (params.operation === 'evaluate') {
      console.log(`Evaluating answer for: ${assessmentId}`);
      const result = await coreHandler.handleEvaluate(params);
      console.log(`Answer evaluated successfully for: ${assessmentId}`);
      return result;
    }
    else {
      throw new Error(`Invalid operation: ${params.operation}. Supported operations are "generate" and "evaluate".`);
    }
    
  } catch (error) {
    console.error('Error in master assessment function:', error);
    throw new Error(`Assessment processing failed: ${error.message}`);
  }
});