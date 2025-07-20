
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

// ON-DEMAND LOADING: Assessment configurations are now loaded only when needed
// This prevents the massive memory overhead of loading all assessment configs at startup

/**
 * Maps assessment ID patterns to their corresponding file paths
 * This allows dynamic loading of only the needed assessment configuration
 */
const getAssessmentFilePath = (assessmentId) => {
  // Extract lesson identifier from assessmentId (e.g., course2_25_question1 -> 25)
  const match = assessmentId.match(/course2_(\d+[a-z]*)_/);
  if (!match) {
    console.error(`Cannot parse lesson number from assessmentId: ${assessmentId}`);
    return null;
  }
  
  const lessonNumber = match[1];
  
  // Map lesson numbers to their directory paths
  const lessonMapping = {
    // Course 2a lessons
    '01': '../2a/01-physics-20-review/assessments',
    '02': '../2a/02-momentum-one-dimension/assessments', 
    '03': '../2a/03-momentum-two-dimensions/assessments',
    '04': '../2a/04-impulse-momentum-change/assessments',
    '05': '../2a/05-l1-3-assignment/assessments',
    '06': '../2a/06-graphing-techniques/assessments',
    '07': '../2a/07-lab-momentum-conservation/assessments',
    '08': '../2a/08-l1-4-cumulative-assignment/assessments',
    '09': '../2a/09-introduction-to-light/assessments',
    '10': '../2a/10-reflection-of-light/assessments',
    '11': '../2a/11-curved-mirrors/assessments',
    '12': '../2a/12-l5-7-assignment/assessments',
    
    // Course 2a2 lessons  
    '13': '../2a2/13-refraction-of-light/assessments',
    '14': '../2a2/14-optics-lenses/assessments',
    '15': '../2a2/15-lab-mirrors-lenses/assessments',
    '16': '../2a2/16-l8-9-assignment/assessments',
    '17': '../2a2/17-dispersion-scattering/assessments',
    '18': '../2a2/18-interference-of-light/assessments',
    '19': '../2a2/19-diffraction-gratings/assessments',
    '20': '../2a2/20-lab-laser-wavelength/assessments',
    '21': '../2a2/21-l1-12-cumulative-assignment/assessments',
    '22': '../2a2/22-unit-1-review/assessments',
    '23': '../2a2/23-unit-2-review/assessments',
    '24': '../2a2/24-section-1-exam/assessments',
    
    // Course 2b lessons
    '25': '../2b/25-electrostatics/assessments',
    '26': '../2b/26-coulombs-law/assessments',
    '27': '../2a/27-lab-electrostatic/assessments',
    '28': '../2b/28-l13-14-assignment/assessments',
    '29': '../2b/29-electric-fields/assessments',
    '30': '../2b/30-electric-potential/assessments',
    '31': '../2b/31-parallel-plates/assessments',
    '32': '../2b/32-electric-current/assessments',
    '33': '../2a/33-lab-electric-fields/assessments',
    '34': '../2b/34-l15-18-assignment/assessments',
    '35': '../2b/35-l1-18-cumulative-assignment/assessments',
    '36': '../2b/36-magnetic-fields/assessments',
    '37': '../2b/37-magnetic-forces-particles/assessments',
    '38': '../2b/38-motor-effect/assessments',
    '39': '../2b/39-l19-21-assignment/assessments',
    '40': '../2b/40-generator-effect/assessments',
    '41': '../2/41-activities/assessments',
    '42': '../2b/42-electromagnetic-radiation/assessments',
    '43': '../2b/43-lab-electromagnet/assessments',
    '44': '../2b/44-l22-24-assignment/assessments',
    '45': '../2b/45-l1-24-cumulative-assignment/assessments',
    '46': '../2b/46-unit-3-review/assessments',
    '47': '../2b/47-unit-4-review/assessments',
    '48': '../2b/48-section-2-exam/assessments',
    
    // Course 2c lessons
    '49': '../2b/49-early-atomic-models/assessments',
    '50': '../2b/50-cathode-rays/assessments',
    '51': '../2b/51-rutherford-atom/assessments',
    '52': '../2b/52-l25-27-assignment/assessments',
    '53': '../2b/53-quantization-of-light/assessments',
    '54': '../2c/54-lab-plancks-constant/assessments',
    '55': '../2b/55-photoelectric-effect/assessments',
    '56': '../2c/56-lab-millikans-oil-drop/assessments',
    '57': '../2c/57-light-spectra-excitation/assessments',
    '58': '../2c/58-lab-marshmallow-speed-light/assessments',
    '59': '../2c/59-l28-30-assignment/assessments',
    '60': '../2c/60-bohr-model/assessments',
    '61': '../2c/61-compton-effect/assessments',
    '62': '../2c/62-wave-particle-nature/assessments',
    '63': '../2c/63-l31-33-assignment/assessments',
    '64': '../2c/64-quantum-mechanics/assessments',
    '65': '../2c/65-l1-34-cumulative-assignment/assessments',
    '66': '../2c/66-nuclear-physics/assessments',
    '67': '../2c/67-radioactivity/assessments',
    '68': '../2c/68-lab-half-life/assessments',
    '69': '../2c/69-l35-36-assignment/assessments',
    '70': '../2c/70-particle-physics/assessments',
    '71': '../2c/71-quarks/assessments',
    '72': '../2c/72-l37-38-assignment/assessments',
    '73': '../2c/73-l1-38-cumulative-assignment/assessments',
    '74': '../2c/74-unit-5-review/assessments',
    '75': '../2c/75-unit-6-review/assessments',
    '76': '../2c/76-section-3-exam/assessments',
    '77': '../2c/77-diploma-exam-review/assessments',
    '78': '../2c/78-diploma-exam/assessments'
  };
  
  return lessonMapping[lessonNumber] || null;
};

/**
 * Dynamically loads assessment configuration only when needed
 * This replaces the previous approach of loading all configs at startup
 */
const getAssessmentConfig = (assessmentId) => {
  try {
    const filePath = getAssessmentFilePath(assessmentId);
    if (!filePath) {
      console.error(`No file path found for assessmentId: ${assessmentId}`);
      return null;
    }
    
    console.log(`Loading assessment config from: ${filePath}`);
    
    // Dynamically require the assessment file
    const assessmentModule = require(filePath);
    
    if (!assessmentModule.assessmentConfigs) {
      console.error(`No assessmentConfigs exported from: ${filePath}`);
      return null;
    }
    
    // Debug: Show all available configs
    console.log(`Available configs in ${filePath}:`, Object.keys(assessmentModule.assessmentConfigs));
    
    const config = assessmentModule.assessmentConfigs[assessmentId];
    if (!config) {
      console.error(`Assessment config not found for ${assessmentId} in ${filePath}`);
      console.log('Looking for:', assessmentId);
      console.log('Available configs:', Object.keys(assessmentModule.assessmentConfigs));
      return null;
    }
    
    console.log(`Successfully loaded config for: ${assessmentId}`);
    return config;
    
  } catch (error) {
    console.error(`Error loading assessment config for ${assessmentId}:`, error.message);
    return null;
  }
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
      console.error(`Tried to load from path: ${getAssessmentFilePath(assessmentId)}`);
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