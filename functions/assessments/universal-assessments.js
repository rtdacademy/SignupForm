/**
 * Universal Assessment Function for All Non-Physics Courses
 * 
 * This master function handles all assessment requests for courses other than Physics 30 (course 2).
 * It dynamically loads course-specific assessment mappings and configurations from the database.
 * 
 * ARCHITECTURE:
 * - Uses course-specific mapping files to locate assessment configurations
 * - Dynamically loads only the needed assessment modules (memory efficient)
 * - Reads course configuration from Firebase database, not local JSON files
 * - Routes to appropriate assessment handlers based on assessment type
 * 
 * SUPPORTED COURSES:
 * - Course 3: Economics/Business (when ready)
 * - Course 4: RTD Academy Orientation
 * - Future courses can be added by creating mapping files
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('../utils');
const { getDatabase } = require('firebase-admin/database');

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

// Import core assessment handlers
const { StandardMultipleChoiceCore } = require('../shared/assessment-types/standard-multiple-choice');
const { StandardLongAnswerCore } = require('../shared/assessment-types/standard-long-answer');

/**
 * Loads the course-specific assessment mapping
 * @param {string} courseId - The course identifier
 * @returns {Object} Mapping of assessment IDs to file paths
 */
const loadCourseMapping = (courseId) => {
  try {
    const mappingPath = `../courses/${courseId}/assessment-mapping`;
    console.log(`Loading assessment mapping from: ${mappingPath}`);
    
    const mapping = require(mappingPath);
    
    if (!mapping || typeof mapping !== 'object') {
      console.error(`Invalid mapping structure for course ${courseId}`);
      return null;
    }
    
    console.log(`Successfully loaded mapping for course ${courseId} with ${Object.keys(mapping).length} assessments`);
    return mapping;
  } catch (error) {
    console.error(`Failed to load assessment mapping for course ${courseId}:`, error.message);
    return null;
  }
};

/**
 * Dynamically loads assessment configuration for a specific assessment
 * @param {string} courseId - The course identifier
 * @param {string} assessmentId - The assessment identifier
 * @returns {Object} Assessment configuration
 */
const getAssessmentConfig = (courseId, assessmentId) => {
  try {
    // Load the course mapping
    const courseMapping = loadCourseMapping(courseId);
    
    if (!courseMapping) {
      console.error(`No mapping found for course ${courseId}`);
      return null;
    }
    
    // Get the file path for this assessment
    const filePath = courseMapping[assessmentId];
    
    if (!filePath) {
      console.error(`No file path found for assessmentId: ${assessmentId} in course ${courseId}`);
      console.log('Available assessments:', Object.keys(courseMapping));
      return null;
    }
    
    // Construct the full path relative to this file's location
    const fullPath = `../courses/${courseId}/${filePath}`;
    console.log(`Loading assessment config from: ${fullPath}`);
    
    // Dynamically require the assessment file
    const assessmentModule = require(fullPath);
    
    if (!assessmentModule.assessmentConfigs) {
      console.error(`No assessmentConfigs exported from: ${fullPath}`);
      return null;
    }
    
    // Get the specific assessment configuration
    const config = assessmentModule.assessmentConfigs[assessmentId];
    
    if (!config) {
      console.error(`Assessment config not found for ${assessmentId} in ${fullPath}`);
      console.log('Available configs:', Object.keys(assessmentModule.assessmentConfigs));
      return null;
    }
    
    console.log(`Successfully loaded config for: ${assessmentId} from course ${courseId}`);
    return config;
    
  } catch (error) {
    console.error(`Error loading assessment config for ${assessmentId} in course ${courseId}:`, error.message);
    return null;
  }
};

/**
 * Universal cloud function that handles all non-physics course assessments
 * Routes requests to the appropriate assessment configuration and processes directly
 */
exports.universal_assessments = onCall({
  memory: '1GiB',
  cpu: 1,
  region: 'us-central1',
  timeoutSeconds: 60,
  enforceAppCheck: false,
}, async (request) => {
  try {
    console.log('🚀 UNIVERSAL ASSESSMENT FUNCTION RUNNING');
    const data = request.data;
    
    console.log('=== UNIVERSAL ASSESSMENT REQUEST ===');
    console.log('Request type:', typeof request);
    console.log('Data type:', typeof data);
    console.log('Data exists:', !!data);
    
    if (data) {
      console.log('Data keys:', Object.keys(data));
      for (const key of Object.keys(data)) {
        console.log(`${key}:`, data[key]);
      }
    }
    
    // Extract required parameters
    const { courseId, assessmentId, ...otherData } = data || {};
    
    if (!courseId) {
      throw new Error('courseId is required for universal assessment function');
    }
    
    if (!assessmentId) {
      throw new Error('assessmentId is required for universal assessment function');
    }
    
    console.log(`Universal function received request for course: ${courseId}, assessment: ${assessmentId}`);
    console.log(`Operation: ${data.operation}`);
    console.log(`Exam mode: ${data.examMode}`);
    
    // Get the assessment configuration for this courseId and assessmentId
    const assessmentConfig = getAssessmentConfig(courseId, assessmentId);
    
    if (!assessmentConfig) {
      console.error(`No assessment configuration found for course ${courseId}, assessmentId: ${assessmentId}`);
      throw new Error(`Assessment configuration not found for: ${assessmentId} in course ${courseId}`);
    }
    
    console.log(`Found assessment config for: ${assessmentId} in course ${courseId}`);
    console.log(`Config type: ${assessmentConfig.type || 'multiple-choice'}`);
    
    // Determine assessment type from configuration
    const assessmentType = assessmentConfig.type || 'multiple-choice'; // Default to multiple choice
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
    
    // Extract operation parameters
    const params = {
      courseId: courseId,
      assessmentId: assessmentId,
      operation: data.operation,
      studentEmail: data.studentEmail,
      studentKey: sanitizeEmail(data.studentEmail),
      userId: data.userId,
      topic: data.topic || 'general',
      difficulty: data.difficulty || 'intermediate',
      answer: data.answer, // For evaluation operations
      examMode: data.examMode || false,
      assessmentType: assessmentType,
      isStaff: data.isStaff || false
    };
    
    // Handle the request based on operation type
    if (params.operation === 'generate') {
      console.log(`Generating question for: ${assessmentId} in course ${courseId}`);
      const result = await coreHandler.handleGenerate(params);
      console.log(`Question generated successfully for: ${assessmentId}`);
      return result;
    } 
    else if (params.operation === 'evaluate') {
      console.log(`Evaluating answer for: ${assessmentId} in course ${courseId}`);
      const result = await coreHandler.handleEvaluate(params);
      console.log(`Answer evaluated successfully for: ${assessmentId}`);
      return result;
    }
    else if (params.operation === 'save') {
      console.log(`Saving answer for: ${assessmentId} in course ${courseId}`);
      const result = await coreHandler.handleSave(params);
      console.log(`Answer saved successfully for: ${assessmentId}`);
      return result;
    }
    else if (params.operation === 'submit') {
      console.log(`Submitting answer for: ${assessmentId} in course ${courseId}`);
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
    console.error('Error in universal assessment function:', error);
    throw new Error(`Universal assessment processing failed: ${error.message}`);
  }
});