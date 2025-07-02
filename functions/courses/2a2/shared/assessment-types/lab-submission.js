/**
 * Lab Submission Assessment Module
 * This module provides a factory function to create lab submission assessments
 * Course developers can import this and configure it for their specific labs
 * 
 * ARCHITECTURE:
 * =============
 * This backend module works in conjunction with lab frontend components
 * - Frontend: Lab components in src/FirebaseCourses/courses/[courseId]/content/
 * - Backend: This module creates cloud functions that the frontend calls
 * - Configuration: Set parameters in course-specific files like functions/courses/[courseId]/[content]/assessments.js
 * 
 * The frontend component should handle:
 * - Collecting lab data (observations, calculations, analysis)
 * - Student progress tracking through lab sections
 * - Auto-save and manual save functionality
 * - Data loading to restore previous progress
 * 
 * WORKFLOW:
 * =========
 * 1. Configure this module in your course assessment file
 * 2. Deploy the cloud function
 * 3. Frontend component calls your cloud function to save/load lab data
 * 4. Students interact with lab through the frontend UI
 * 5. All lab data is stored securely server-side with proper validation
 * 
 * USAGE:
 * ======
 * 
 * To use this module in your course assessment file:
 * 
 * ```javascript
 * const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
 * 
 * exports.yourLabFunctionName = createLabSubmission({
 *   // Configuration object - see ACCEPTED PARAMETERS below
 * });
 * ```
 * 
 * ACCEPTED PARAMETERS:
 * ===================
 * 
 * Core Configuration:
 * - labTitle: {string} - Title of the lab (optional, for display)
 * - labType: {string} - Type of lab ('physics', 'chemistry', 'biology', 'general')
 * - requiredSections: {Array<string>} - Required sections that must be completed
 * - autoSaveInterval: {number} - Auto-save interval in seconds (default: 30)
 * 
 * Activity Settings:
 * - activityType: {string} - Type of activity ('lab', 'experiment', 'simulation')
 * - pointsValue: {number} - Points awarded for completion (default: 10)
 * - allowPartialCredit: {boolean} - Whether to award partial credit (default: true)
 * - completionThreshold: {number} - Percentage completion required (default: 80)
 * 
 * Validation Settings:
 * - validateData: {boolean} - Whether to validate lab data structure (default: true)
 * - maxFileSize: {number} - Maximum size for file uploads in MB (default: 10)
 * - allowedFileTypes: {Array<string>} - Allowed file extensions (default: ['jpg', 'png', 'pdf'])
 * 
 * Cloud Function Settings:
 * - region: {string} - Firebase function region (default: 'us-central1')
 * - timeout: {number} - Function timeout in seconds (default: 120)
 * - memory: {string} - Memory allocation (default: '512MiB')
 */

const { onCall } = require('firebase-functions/v2/https');
const { loadConfig } = require('../utilities/config-loader');
const { initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef, updateGradebookItem, getCourseConfig } = require('../utilities/database-utils');

/**
 * Validates the structure of lab data based on configuration
 * @param {Object} labData - The lab data to validate
 * @param {Object} config - Configuration object with validation rules
 * @returns {Object} Validation result with isValid and errors
 */
function validateLabData(labData, config = {}) {
  const errors = [];
  
  if (!labData || typeof labData !== 'object') {
    errors.push('Lab data must be a valid object');
    return { isValid: false, errors };
  }
  
  // Check required sections if specified
  if (config.requiredSections && Array.isArray(config.requiredSections)) {
    // Check if sections are tracked in sectionStatus
    if (labData.sectionStatus) {
      for (const section of config.requiredSections) {
        if (!labData.sectionStatus.hasOwnProperty(section)) {
          errors.push(`Required section '${section}' is missing from sectionStatus`);
        }
      }
    } else {
      // If no sectionStatus, check for sections directly
      for (const section of config.requiredSections) {
        if (!labData[section]) {
          errors.push(`Required section '${section}' is missing`);
        }
      }
    }
  }
  
  // Validate data size (prevent extremely large submissions)
  const dataSize = JSON.stringify(labData).length;
  const maxSize = (config.maxDataSize || 1) * 1024 * 1024; // Default 1MB
  
  if (dataSize > maxSize) {
    errors.push(`Lab data size (${Math.round(dataSize / 1024)}KB) exceeds maximum allowed (${config.maxDataSize || 1}MB)`);
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors,
    dataSize: dataSize
  };
}

/**
 * Calculates completion percentage based on lab data
 * @param {Object} labData - The lab data to analyze
 * @param {Object} config - Configuration object with completion rules
 * @returns {number} Completion percentage (0-100)
 */
function calculateCompletionPercentage(labData, config = {}) {
  if (!labData || typeof labData !== 'object') {
    return 0;
  }
  
  let totalSections = 0;
  let completedSections = 0;
  
  // Check section status if available
  if (labData.sectionStatus && typeof labData.sectionStatus === 'object') {
    const sectionStatuses = Object.values(labData.sectionStatus);
    totalSections = sectionStatuses.length;
    completedSections = sectionStatuses.filter(status => status === 'completed').length;
  }
  
  // If no section status, use required sections
  else if (config.requiredSections && Array.isArray(config.requiredSections)) {
    totalSections = config.requiredSections.length;
    completedSections = config.requiredSections.filter(section => 
      labData[section] && 
      (typeof labData[section] === 'string' ? labData[section].trim() !== '' : true)
    ).length;
  }
  
  // Fallback: check for any data presence
  else {
    const dataKeys = Object.keys(labData).filter(key => 
      labData[key] !== null && 
      labData[key] !== undefined && 
      labData[key] !== ''
    );
    totalSections = Math.max(5, dataKeys.length); // Assume minimum 5 sections
    completedSections = dataKeys.length;
  }
  
  return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
}

/**
 * Infers activity type from assessment ID patterns
 * @param {string} assessmentId - The assessment identifier
 * @returns {string} The inferred activity type
 */
function inferActivityTypeFromAssessmentId(assessmentId) {
  if (!assessmentId) return 'lab';
  
  const id = assessmentId.toLowerCase();
  
  if (id.includes('simulation') || id.includes('sim')) {
    return 'simulation';
  } else if (id.includes('experiment') || id.includes('exp')) {
    return 'experiment';
  } else {
    return 'lab';
  }
}

/**
 * Core business logic for Lab Submission assessments
 * This can be called directly by other systems without Firebase wrapper
 */
class LabSubmissionCore {
  constructor(config = {}) {
    this.config = config;
  }

  async handleSave(params) {
    // Load and merge configurations
    const globalConfig = await loadConfig();
    
    // SECURITY: Use hardcoded activity type from course config (cannot be manipulated by client)
    const activityType = this.config.activityType || inferActivityTypeFromAssessmentId(params.assessmentId) || 'lab';
    
    console.log(`Lab submission: Using activity type: ${activityType} (Source: ${this.config.activityType ? 'hardcoded' : 'inferred'})`);
    
    // Get activity-specific configuration
    const activityConfig = this.config.activityTypes?.[activityType] || this.config.activityTypes?.lab || {};
    
    const config = {
      ...globalConfig.assessmentTypes?.lab || {},
      ...activityConfig,
      ...this.config
    };

    // Initialize course if needed
    await initializeCourseIfNeeded(params.studentKey, params.courseId, params.isStaff);

    // Validate lab data if validation is enabled
    if (config.validateData !== false) {
      const validation = validateLabData(params.labData, config);
      if (!validation.isValid) {
        console.error('Lab data validation failed:', validation.errors);
        throw new Error(`Lab data validation failed: ${validation.errors.join(', ')}`);
      }
      console.log(`Lab data validation passed. Data size: ${Math.round(validation.dataSize / 1024)}KB`);
    }

    // Calculate completion percentage
    const completionPercentage = calculateCompletionPercentage(params.labData, config);
    console.log(`Lab completion percentage: ${completionPercentage}%`);

    // Determine if lab is considered complete
    const completionThreshold = config.completionThreshold || 80;
    const isComplete = completionPercentage >= completionThreshold;
    
    // Reference to the assessment in the database
    const assessmentRef = getDatabaseRef('studentAssessment', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    const dbPath = params.isStaff 
      ? `staff_testing/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`
      : `students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`;
    console.log(`Database path: ${dbPath}`);

    // Check for existing data
    const existingAssessmentSnapshot = await assessmentRef.once('value');
    const existingAssessment = existingAssessmentSnapshot.val();
    const isUpdate = !!existingAssessment;
    
    console.log(`This is a ${isUpdate ? 'update' : 'new submission'} for lab: ${params.assessmentId}`);

    // Create the lab submission data object
    const submissionData = {
      timestamp: getServerTimestamp(),
      lastModified: getServerTimestamp(),
      labData: params.labData,
      completionPercentage: completionPercentage,
      status: isComplete ? 'completed' : 'in-progress',
      submissionType: 'lab',
      activityType: activityType,
      pointsValue: config.pointsValue || activityConfig.pointValue || 10,
      allowPartialCredit: config.allowPartialCredit !== false,
      version: (existingAssessment?.version || 0) + 1,
      labTitle: config.labTitle || params.assessmentId.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      saveType: params.saveType || 'manual' // 'manual' or 'auto'
    };
    
    // Preserve original timestamp for first submission
    if (isUpdate && existingAssessment.timestamp) {
      submissionData.timestamp = existingAssessment.timestamp;
    }
    
    // Store lab data in the database
    await assessmentRef.set(submissionData);
    console.log(`✅ Lab data saved successfully. Version: ${submissionData.version}, Status: ${submissionData.status}`);

    // Update gradebook if lab is complete or partial credit is allowed
    const shouldUpdateGradebook = isComplete || (config.allowPartialCredit && completionPercentage > 0);
    
    if (shouldUpdateGradebook) {
      try {
        // Calculate score based on completion
        const pointsValue = submissionData.pointsValue;
        const score = config.allowPartialCredit ? 
          Math.round((completionPercentage / 100) * pointsValue) : 
          (isComplete ? pointsValue : 0);

        // Get course config for gradebook integration
        const courseConfig = await getCourseConfig(params.courseId);
        
        // Find course structure item for better integration
        const { findCourseStructureItem } = require('../utilities/database-utils');
        const courseStructureItem = await findCourseStructureItem(params.courseId, params.assessmentId);
        
        // Create item configuration for gradebook
        const itemConfig = {
          title: submissionData.labTitle,
          type: activityType,
          unitId: courseStructureItem?.unitId || 'unknown',
          courseStructureItemId: courseStructureItem?.itemId,
          pointsValue: pointsValue,
          maxScore: pointsValue,
          weight: courseStructureItem?.weight || 0,
          required: courseStructureItem?.required !== false,
          estimatedTime: courseStructureItem?.estimatedTime || 0
        };

        // Update gradebook item
        const gradeRef = getDatabaseRef('studentGrade', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
        await gradeRef.set(score);
        
        await updateGradebookItem(params.studentKey, params.courseId, params.assessmentId, score, itemConfig, params.isStaff);
        
        console.log(`✅ Gradebook updated for lab ${params.assessmentId} with score ${score}/${pointsValue} (${completionPercentage}% complete)`);
      } catch (gradebookError) {
        console.warn(`⚠️ Failed to update gradebook for ${params.assessmentId}:`, gradebookError.message);
        // Don't throw error - gradebook failure shouldn't block lab saving
      }
    }

    return {
      success: true,
      saved: true,
      assessmentId: params.assessmentId,
      completionPercentage: completionPercentage,
      status: submissionData.status,
      version: submissionData.version,
      isComplete: isComplete
    };
  }

  async handleLoad(params) {
    // Initialize course if needed
    await initializeCourseIfNeeded(params.studentKey, params.courseId, params.isStaff);

    // Reference to the assessment in the database
    const assessmentRef = getDatabaseRef('studentAssessment', params.studentKey, params.courseId, params.assessmentId, params.isStaff);
    
    // Get the existing lab data
    const assessmentSnapshot = await assessmentRef.once('value');
    const assessmentData = assessmentSnapshot.val();

    if (!assessmentData) {
      console.log(`No existing lab data found for ${params.assessmentId}`);
      return {
        success: true,
        found: false,
        labData: null
      };
    }
    
    console.log(`✅ Lab data loaded for ${params.assessmentId}. Status: ${assessmentData.status}, Version: ${assessmentData.version}`);

    return {
      success: true,
      found: true,
      labData: assessmentData.labData,
      completionPercentage: assessmentData.completionPercentage,
      status: assessmentData.status,
      version: assessmentData.version,
      timestamp: assessmentData.timestamp,
      lastModified: assessmentData.lastModified
    };
  }
}

/**
 * Factory function to create a Lab Submission assessment handler
 * @param {Object} courseConfig - Course-specific configuration
 * @returns {Function} Cloud function handler
 */
function createLabSubmission(courseConfig = {}) {
  return onCall({
    region: courseConfig.region || 'us-central1',
    timeoutSeconds: courseConfig.timeout || 120,
    memory: courseConfig.memory || '512MiB',
    enforceAppCheck: false,
  }, async (request) => {
    const data = request.data;
    const context = request;
    
    // Extract lab-specific parameters
    const {
      courseId,
      assessmentId,
      operation,
      studentKey,
      labData,
      saveType,
      studentEmail,
      userId,
      isStaff = false
    } = data;
    
    // Validate required parameters
    if (!operation) {
      throw new Error("Missing required parameter: operation");
    }
    
    if (!courseId) {
      throw new Error("Missing required parameter: courseId");
    }
    
    if (!assessmentId) {
      throw new Error("Missing required parameter: assessmentId");
    }
    
    if (!studentKey) {
      throw new Error("Missing required parameter: studentKey");
    }
    
    // Create params object with all necessary data
    const params = {
      courseId,
      assessmentId,
      operation,
      studentKey,
      labData,
      saveType: saveType || 'manual',
      studentEmail,
      userId,
      isStaff
    };
    
    console.log("Lab submission parameters:", {
      operation,
      courseId,
      assessmentId,
      studentKey,
      hasLabData: !!labData,
      saveType: params.saveType
    });
    
    // Create core handler instance
    const coreHandler = new LabSubmissionCore(courseConfig);

    // Handle save operation
    if (params.operation === 'save') {
      try {
        if (!params.labData) {
          throw new Error('Lab data is required for save operation');
        }
        return await coreHandler.handleSave(params);
      } catch (error) {
        console.error("Error saving lab data:", error);
        throw new Error('Error saving lab data: ' + error.message);
      }
    }
    // Handle load operation
    else if (params.operation === 'load') {
      try {
        return await coreHandler.handleLoad(params);
      } catch (error) {
        console.error("Error loading lab data:", error);
        throw new Error('Error loading lab data: ' + error.message);
      }
    }

    // If the operation is neither save nor load
    throw new Error('Invalid operation. Supported operations are "save" and "load".');
  });
}

module.exports = {
  createLabSubmission,
  LabSubmissionCore
};