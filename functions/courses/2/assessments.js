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
const { getDatabase } = require('firebase-admin/database');

// Initialize Firebase Admin globally - this needs to happen before any other imports
// that might use admin services
if (!admin.apps.length) {
  admin.initializeApp();
}

const { StandardMultipleChoiceCore } = require('../../shared/assessment-types/standard-multiple-choice');
const { StandardLongAnswerCore } = require('../../shared/assessment-types/standard-long-answer');

// We need to extract and recreate the question generator functions from the original file
// Rather than importing the cloud functions, we'll recreate the core logic here

// Import assessment configurations from all lesson files
const { assessmentConfigs: physicsReviewConfigs } = require('../2a/01-physics-20-review/assessments');
const { assessmentConfigs: momentum1DConfigs } = require('../2a/02-momentum-one-dimension/assessments');
const { assessmentConfigs: momentum2DConfigs } = require('../2a/03-momentum-two-dimensions/assessments');
const { assessmentConfigs: impulseConfigs } = require('../2a/04-impulse-momentum-change/assessments');
const { assessmentConfigs: l13AssignmentConfigs } = require('../2a/05-l1-3-assignment/assessments');
const { assessmentConfigs: graphingTechniquesConfigs } = require('../2a/06-graphing-techniques/assessments');
const { assessmentConfigs: labMomentumConfigs } = require('../2a/07-lab-momentum-conservation/assessments');
const { assessmentConfigs: l14CumulativeConfigs } = require('../2a/08-l1-4-cumulative-assignment/assessments');
const { assessmentConfigs: introToLightConfigs } = require('../2a/09-introduction-to-light/assessments');
const { assessmentConfigs: reflectionOfLightConfigs } = require('../2a/10-reflection-of-light/assessments');
const { assessmentConfigs: curvedMirrorsConfigs } = require('../2a/11-curved-mirrors/assessments');
const { assessmentConfigs: l57AssignmentConfigs } = require('../2a/12-l5-7-assignment/assessments');
const { assessmentConfigs: refractionConfigs } = require('../2a2/13-refraction-of-light/assessments');
const { assessmentConfigs: opticsLensesConfigs } = require('../2a2/14-optics-lenses/assessments');
const { assessmentConfigs: labMirrorsLensesConfigs } = require('../2a2/15-lab-mirrors-lenses/assessments');
const { assessmentConfigs: l89AssignmentConfigs } = require('../2a2/16-l8-9-assignment/assessments');
const { assessmentConfigs: dispersionScatteringConfigs } = require('../2a2/17-dispersion-scattering/assessments');
const { assessmentConfigs: interferenceOfLightConfigs } = require('../2a2/18-interference-of-light/assessments');
const { assessmentConfigs: diffractionGratingsConfigs } = require('../2a2/19-diffraction-gratings/assessments');
const { assessmentConfigs: labLaserWavelengthConfigs } = require('../2a2/20-lab-laser-wavelength/assessments');
const { assessmentConfigs: l112CumulativeConfigs } = require('../2a2/21-l1-12-cumulative-assignment/assessments');
const { assessmentConfigs: unit1ReviewConfigs } = require('../2a2/22-unit-1-review/assessments');
const { assessmentConfigs: unit2ReviewConfigs } = require('../2a2/23-unit-2-review/assessments');
const { assessmentConfigs: section1ExamConfigs } = require('../2a2/24-section-1-exam/assessments');

const { assessmentConfigs: electrostaticsConfigs } = require('../2b/25-electrostatics/assessments');
const { assessmentConfigs: coulombsLawConfigs } = require('../2b/26-coulombs-law/assessments');
const { assessmentConfigs: l1314AssignmentConfigs } = require('../2b/28-l13-14-assignment/assessments');
const { assessmentConfigs: electricFieldsConfigs } = require('../2b/29-electric-fields/assessments');
const { assessmentConfigs: electricPotentialConfigs } = require('../2b/30-electric-potential/assessments');
const { assessmentConfigs: parallelPlatesConfigs } = require('../2b/31-parallel-plates/assessments');
const { assessmentConfigs: electricCurrentConfigs } = require('../2b/32-electric-current/assessments');
const { assessmentConfigs: magneticFieldsConfigs } = require('../2b/36-magnetic-fields/assessments');
const { assessmentConfigs: magneticForcesParticlesConfigs } = require('../2b/37-magnetic-forces-particles/assessments');
const { assessmentConfigs: motorEffectConfigs } = require('../2b/38-motor-effect/assessments');
const { assessmentConfigs: generatorEffectConfigs } = require('../2b/40-generator-effect/assessments');
const { assessmentConfigs: electromagneticRadiationConfigs } = require('../2b/42-electromagnetic-radiation/assessments');
const { assessmentConfigs: l1518AssignmentConfigs } = require('../2b/34-l15-18-assignment/assessments');
const { assessmentConfigs: l118CumulativeConfigs } = require('../2b/35-l1-18-cumulative-assignment/assessments');
const { assessmentConfigs: l1921AssignmentConfigs } = require('../2b/39-l19-21-assignment/assessments');
const { assessmentConfigs: activitiesConfigs } = require('../2/41-activities/assessments');

/**
 * Assessment Configuration Mapping
 * Maps assessmentId to the appropriate assessment configuration
 * Now imports directly from the original assessment files
 */
const getAllAssessmentConfigs = () => {
  return {
    // Standard Assessment Configurations
    ...physicsReviewConfigs,
    ...momentum1DConfigs,
    ...momentum2DConfigs,
    ...impulseConfigs,
    ...l13AssignmentConfigs,
    ...graphingTechniquesConfigs,
    ...labMomentumConfigs,
    ...l14CumulativeConfigs,
    ...introToLightConfigs,
    ...reflectionOfLightConfigs,
    ...curvedMirrorsConfigs,
    ...l57AssignmentConfigs,
    ...refractionConfigs,
    ...opticsLensesConfigs,
    ...labMirrorsLensesConfigs,
    ...l89AssignmentConfigs,
    ...dispersionScatteringConfigs,
    ...interferenceOfLightConfigs,
    ...diffractionGratingsConfigs,
    ...labLaserWavelengthConfigs,
    ...l112CumulativeConfigs,
    ...unit1ReviewConfigs,
    ...unit2ReviewConfigs,
    ...section1ExamConfigs,
    ...electrostaticsConfigs,
    ...coulombsLawConfigs,
    ...l1314AssignmentConfigs,
    ...electricFieldsConfigs,
    ...electricPotentialConfigs,
    ...parallelPlatesConfigs,
    ...electricCurrentConfigs,
    ...magneticFieldsConfigs,
    ...magneticForcesParticlesConfigs,
    ...motorEffectConfigs,
    ...generatorEffectConfigs,
    ...electromagneticRadiationConfigs,
    ...activitiesConfigs,
    ...l1518AssignmentConfigs,
    ...l118CumulativeConfigs,
    ...l1921AssignmentConfigs
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
exports.course2_assessments = onCall({
  memory: '1GiB',
  cpu: 1
}, async (request) => {
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
    console.log(`Exam mode parameter: ${data.examMode}`);
    
    // Get the assessment configuration for this assessmentId
    const assessmentConfig = getAssessmentConfig(assessmentId);
    
    if (!assessmentConfig) {
      console.error(`No assessment configuration found for assessmentId: ${assessmentId}`);
      // Log all available assessment IDs for debugging
      const allConfigs = getAllAssessmentConfigs();
      console.log('Available assessment IDs:', Object.keys(allConfigs));
      throw new Error(`Assessment configuration not found for: ${assessmentId}`);
    }
    
    console.log(`Found assessment config for: ${assessmentId}`);
    console.log(`Config structure:`, JSON.stringify(assessmentConfig, null, 2));
    
    console.log(`Processing assessment directly for: ${assessmentId}`);
    
    // Determine assessment type from configuration
    const assessmentType = assessmentConfig.type || 'multiple-choice'; // Default to multiple choice for backward compatibility
    console.log(`Assessment type: ${assessmentType} for ${assessmentId}`);
    
    // Create the appropriate core handler based on assessment type
    let coreHandler;
    try {
      if (assessmentType === 'long-answer') {
        coreHandler = new StandardLongAnswerCore(assessmentConfig);
        console.log(`Long answer core handler created successfully for: ${assessmentId}`);
      } else {
        // Default to multiple choice for backward compatibility
        coreHandler = new StandardMultipleChoiceCore(assessmentConfig);
        console.log(`Multiple choice core handler created successfully for: ${assessmentId}`);
      }
    } catch (configError) {
      console.error(`Error creating ${assessmentType} core handler for ${assessmentId}:`, configError);
      throw new Error(`Failed to create assessment handler: ${configError.message}`);
    }
    
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
      answer: data.answer, // For evaluation operations
      examMode: data.examMode || false, // Pass through exam mode parameter
      assessmentType: assessmentType // Add assessment type for proper question type tracking
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
    else if (params.operation === 'save') {
      console.log(`Saving answer for: ${assessmentId}`);
      const result = await coreHandler.handleSave(params);
      console.log(`Answer saved successfully for: ${assessmentId}`);
      return result;
    }
    else if (params.operation === 'submit') {
      console.log(`Submitting answer for: ${assessmentId}`);
      // For long answer, submit maps to handleSave with submit operation
      if (assessmentType === 'long-answer') {
        const result = await coreHandler.handleSave({ ...params, operation: 'submit' });
        console.log(`Answer submitted successfully for: ${assessmentId}`);
        return result;
      } else {
        // For multiple choice, submit maps to handleEvaluate
        const result = await coreHandler.handleEvaluate(params);
        console.log(`Answer submitted successfully for: ${assessmentId}`);
        return result;
      }
    }
    else {
      const supportedOps = assessmentType === 'long-answer' ? 
        '"generate", "save", and "submit"' : 
        '"generate" and "evaluate"';
      throw new Error(`Invalid operation: ${params.operation}. Supported operations are ${supportedOps}.`);
    }
    
  } catch (error) {
    console.error('Error in master assessment function:', error);
    throw new Error(`Assessment processing failed: ${error.message}`);
  }
});

/**
 * Universal Lab Submission Function for Course 2
 * Copies lab data from working storage to assessment system for teacher marking
 * Works with any lab by using the questionId parameter
 */
exports.course2_lab_submit = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '512MiB',
  enforceAppCheck: false,
}, async (request) => {
  const data = request.data;
  
  const {
    courseId = '2',
    questionId,
    studentEmail,
    userId,
    isStaff = false
  } = data;
  
  // Validate required parameters
  if (!questionId) {
    throw new Error("Missing required parameter: questionId");
  }
  
  if (!studentEmail) {
    throw new Error("Missing required parameter: studentEmail");
  }
  
  if (!userId) {
    throw new Error("Missing required parameter: userId");
  }
  
  // Generate studentKey from email using sanitizeEmail function
  const studentKey = sanitizeEmail(studentEmail);
  
  try {
    const db = getDatabase();
    
    // Read lab data from working storage using questionId
    const workingDataRef = db.ref(`users/${userId}/FirebaseCourses/${courseId}/${questionId}`);
    const workingDataSnapshot = await workingDataRef.once('value');
    const workingData = workingDataSnapshot.val();
    
    if (!workingData) {
      throw new Error('No lab data found to submit. Please complete some work first.');
    }
    
    console.log('📋 Submitting lab data for student:', studentKey, 'questionId:', questionId);
    
    // Prepare submission data
    const submissionData = {
      ...workingData,
      submittedAt: Date.now(),
      submissionType: 'lab',
      assessmentId: questionId,
      studentKey: studentKey,
      studentEmail: studentEmail,
      status: 'submitted',
      questionId: questionId
    };
    
    // Save to assessment system path using questionId
    const assessmentPath = isStaff 
      ? `staff_testing/${studentKey}/courses/${courseId}/Assessments/${questionId}`
      : `students/${studentKey}/courses/${courseId}/Assessments/${questionId}`;
    
    const assessmentRef = db.ref(assessmentPath);
    await assessmentRef.set(submissionData);
    
    console.log('✅ Lab submitted successfully to:', assessmentPath);
    
    return {
      success: true,
      message: 'Lab submitted successfully for teacher review',
      submittedAt: submissionData.submittedAt,
      assessmentId: questionId,
      questionId: questionId
    };
    
  } catch (error) {
    console.error('❌ Lab submission failed:', error);
    throw new Error('Failed to submit lab: ' + error.message);
  }
});