/**
 * Lab Momentum Conservation Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 07-lab-momentum-conservation
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');

/**
 * Lab: Conservation of Momentum
 * Students complete practical experiments with momentum conservation
 * including 1D and 2D collision analysis, data collection, and error analysis
 */
exports.course2_lab_momentum_conservation = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 1 - Conservation of Momentum',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'hypothesis',
    'procedure', 
    'simulation',
    'observations',
    'analysis',
    'error',
    'conclusion'
  ],
  
  // Grading Configuration
  pointsValue: 15, // Worth 15 points total
  allowPartialCredit: true,
  completionThreshold: 75, // 75% completion required for full credit
  
  // Data Validation
  validateData: true,
  maxDataSize: 2, // Maximum 2MB of data
  
  // Auto-save Configuration
  autoSaveInterval: 30, // Auto-save every 30 seconds
  
  // Cloud Function Settings
  region: 'us-central1',
  timeout: 120, // 2 minutes timeout for large lab data
  memory: '512MiB'
});

// Export assessment configurations for master function
const assessmentConfigs = {
  'course2_lab_momentum_conservation': {
    // Lab Configuration
    labTitle: 'Lab 1 - Conservation of Momentum',
    labType: 'physics',
    activityType: 'lab',
    
    // Required sections that must be completed
    requiredSections: [
      'hypothesis',
      'procedure', 
      'simulation',
      'observations',
      'analysis',
      'error',
      'conclusion'
    ],
    
    // Grading Configuration
    pointsValue: 15, // Worth 15 points total
    allowPartialCredit: true,
    completionThreshold: 75, // 75% completion required for full credit
    
    // Data Validation
    validateData: true,
    maxDataSize: 2, // Maximum 2MB of data
    
    // Auto-save Configuration
    autoSaveInterval: 30, // Auto-save every 30 seconds
    
    // Cloud Function Settings
    region: 'us-central1',
    timeout: 120, // 2 minutes timeout for large lab data
    memory: '512MiB'
  }
};

exports.assessmentConfigs = assessmentConfigs;

/**
 * Universal Lab Submission Function
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
    studentKey,
    studentEmail,
    userId,
    isStaff = false
  } = data;
  
  // Validate required parameters
  if (!questionId) {
    throw new Error("Missing required parameter: questionId");
  }
  
  if (!studentKey) {
    throw new Error("Missing required parameter: studentKey");
  }
  
  if (!userId) {
    throw new Error("Missing required parameter: userId");
  }
  
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

// Keep the old function for backward compatibility
exports.course2_lab_momentum_conservation_submit = exports.course2_lab_submit;