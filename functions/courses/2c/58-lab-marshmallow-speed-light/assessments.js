/**
 * Lab Marshmallow Speed of Light Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 58-lab-marshmallow-speed-light
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');

/**
 * Lab: Marshmallow Speed of Light
 * Students use microwave standing waves to measure the speed of light
 * by observing melting patterns in marshmallows
 */
exports.course2_lab_marshmallow_speed_light = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 9 - Marshmallow Speed of Light',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'prelab',
    'observations',
    'calculations', 
    'analysis'
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
  'course2_lab_marshmallow_speed_light': {
    // Lab Configuration
    labTitle: 'Lab 9 - Marshmallow Speed of Light',
    labType: 'physics',
    activityType: 'lab',
    
    // Required sections that must be completed
    requiredSections: [
      'prelab',
      'observations',
      'calculations',
      'analysis'
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