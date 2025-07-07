/**
 * Lab Electrostatic Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 27-lab-electrostatic
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');

/**
 * Lab: Electrostatic Charge Measurement
 * Students perform Coulomb's law experiment to determine unknown charge on pith ball
 * including force measurements, data analysis, graphing, and charge calculation
 */
exports.course2_lab_electrostatic = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 4 - Electrostatic Charge Measurement',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'hypothesis',
    'observations',
    'analysis',
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
  'course2_lab_electrostatic': {
    // Lab Configuration
    labTitle: 'Lab 4 - Electrostatic Charge Measurement',
    labType: 'physics',
    activityType: 'lab',
    
    // Required sections that must be completed
    requiredSections: [
      'hypothesis',
      'observations',
      'analysis',
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