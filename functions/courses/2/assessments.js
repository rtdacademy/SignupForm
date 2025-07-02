/**
 * Master Cloud Function for Course 2 (Physics 30) Assessments
 * 
 * This consolidated function routes all assessment requests to their specific
 * cloud functions, reducing the number of deployed functions from ~200+ to just 1.
 * 
 * ARCHITECTURE:
 * - Imports existing cloud functions from lesson folders
 * - Uses assessmentId to route to the correct function
 * - Maintains all existing functionality and data patterns
 * - No changes needed to existing assessment files
 */

const functions = require('firebase-functions');

// Import all assessment modules
// Note: We import from the 2a folder where the existing assessments are located

const impulseAssessments = require('../2a/04-impulse-momentum-change/assessments');
// Add more imports as needed for other lessons:
// const physicsReviewAssessments = require('../2a/01-physics-20-review/assessments');
// const momentumAssessments = require('../2a/02-momentum-one-dimension/assessments');
// etc.

/**
 * Assessment Function Mapping
 * Maps assessmentId to the appropriate cloud function
 */
const assessmentFunctionMap = {

  
  // Course 2 impulse-momentum questions
  'course2_04_basic_impulse': impulseAssessments.course2_04_basic_impulse,
  'course2_04_person_falling': impulseAssessments.course2_04_person_falling,
  'course2_04_impulse_quantities': impulseAssessments.course2_04_impulse_quantities,
  'course2_04_karate_board': impulseAssessments.course2_04_karate_board,
  'course2_04_safety_features': impulseAssessments.course2_04_safety_features,
  'course2_04_golf_ball_driver': impulseAssessments.course2_04_golf_ball_driver,
  'course2_04_child_ball': impulseAssessments.course2_04_child_ball,
  'course2_04_ball_bat': impulseAssessments.course2_04_ball_bat,
  'course2_04_bullet_wood': impulseAssessments.course2_04_bullet_wood,
  'course2_04_water_turbine': impulseAssessments.course2_04_water_turbine,
  
  // Add more mappings as you consolidate other lessons:
  // 'course2_01_physics_20_review_question1': physicsReviewAssessments.course2_01_physics_20_review_question1,
  // 'course2_02_momentum_one_dimension_aiQuestion': momentumAssessments.course2_02_momentum_one_dimension_aiQuestion,
  // etc.
};

/**
 * Master cloud function that handles all course 2 assessments
 * Routes requests to the appropriate assessment function based on assessmentId
 */
exports.course2_assessments = functions.https.onCall(async (data, context) => {
  try {
    // Extract assessmentId from the request
    const { assessmentId, ...otherData } = data;
    
    console.log(`Master function received request for assessment: ${assessmentId}`);
    console.log('Full data object received:', JSON.stringify(data, null, 2));
    console.log('All data keys:', Object.keys(data));
    console.log('assessmentId type:', typeof assessmentId);
    console.log('assessmentId value:', assessmentId);
    
    // Find the appropriate function for this assessment
    const assessmentFunction = assessmentFunctionMap[assessmentId];
    
    if (!assessmentFunction) {
      console.error(`No assessment function found for assessmentId: ${assessmentId}`);
      throw new functions.https.HttpsError(
        'not-found',
        `Assessment function not found for: ${assessmentId}`
      );
    }
    
    // Get the handler function (the actual cloud function)
    // Firebase functions v1 structure: the function is the handler itself
    const handler = assessmentFunction;
    
    // Call the specific assessment function with the same data and context
    // For Firebase Functions v1, we need to simulate the call
    console.log(`Routing to assessment function for: ${assessmentId}`);
    
    // Since these are onCall functions, they expect (data, context) directly
    // We pass through all the data including assessmentId
    const result = await handler(data, context);
    
    console.log(`Assessment ${assessmentId} completed successfully`);
    return result;
    
  } catch (error) {
    console.error('Error in master assessment function:', error);
    
    // If it's already an HttpsError, pass it through
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    
    // Otherwise, wrap it in an HttpsError
    throw new functions.https.HttpsError(
      'internal',
      `Assessment processing failed: ${error.message}`
    );
  }
});