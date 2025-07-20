/**
 * Lab - Millikan's Photoelectric Experiment Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 56-lab-millikans-oil-drop (renamed to photoelectric experiment)
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');
const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');

/**
 * Lab: Millikan's Photoelectric Experiment
 * Students investigate the photoelectric effect by analyzing the relationship between
 * light frequency, intensity, and photoelectron kinetic energy to determine Planck's constant
 */
exports.course2_lab_photoelectric_effect = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 8 - Millikan\'s Photoelectric Experiment',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'objectives',
    'procedure',
    'simulation',
    'observations',
    'analysis',
    'error_analysis'
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
  'course2_lab_photoelectric_effect': {
    // Lab Configuration
    labTitle: 'Lab 8 - Millikan\'s Photoelectric Experiment',
    labType: 'physics',
    activityType: 'lab',
    
    // Required sections that must be completed
    requiredSections: [
      'objectives',
      'procedure',
      'simulation',
      'observations',
      'analysis',
      'error_analysis'
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