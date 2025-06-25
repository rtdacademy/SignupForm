/**
 * Lab Momentum Conservation Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 07-lab-momentum-conservation
 */

const { createLabSubmission } = require('../../../shared/assessment-types/lab-submission');

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