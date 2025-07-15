/**
 * Lab - Radioactive Half-Life Investigation Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 68-lab-half-life
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');

/**
 * Lab: Radioactive Half-Life Investigation
 * Students use a virtual Geiger counter to identify an unknown radioactive isotope
 * by analyzing decay data and calculating half-life using linearization techniques
 */
exports.course2_lab_half_life = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 10 - Radioactive Half-Life Investigation',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'incident_background',
    'prelab_questions',
    'investigation',
    'observations',
    'analysis',
    'conclusions'
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
  'course2_lab_half_life': {
    // Lab Configuration
    labTitle: 'Lab 10 - Radioactive Half-Life Investigation',
    labType: 'physics',
    activityType: 'lab',
    
    // Required sections that must be completed
    requiredSections: [
      'incident_background',
      'prelab_questions', 
      'investigation',
      'observations',
      'analysis',
      'conclusions'
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