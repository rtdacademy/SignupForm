/**
 * Lab Electric Fields Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 33-lab-electric-fields
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');

/**
 * Lab: Electric Fields and Charge-to-Mass Ratio
 * Students use electric fields to determine the identity of unknown charged particles
 * including pre-lab questions, observations, analysis, and error calculations
 */
exports.course2_lab_electric_fields = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 5 - Electric Fields and Charge-to-Mass Ratio',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'hypothesis',
    'observations',
    'analysis',
    'error'
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
  'course2_lab_electric_fields': {
    // Lab Configuration
    labTitle: 'Lab 5 - Electric Fields and Charge-to-Mass Ratio',
    labType: 'physics',
    activityType: 'lab',
    
    // Required sections that must be completed
    requiredSections: [
      'hypothesis',
      'observations',
      'analysis',
      'error'
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