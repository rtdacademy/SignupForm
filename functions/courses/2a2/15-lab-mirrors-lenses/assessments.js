/**
 * Lab Mirrors and Lenses Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 15-lab-mirrors-lenses
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');

/**
 * Lab: Mirrors and Lenses
 * Students explore optics principles including index of refraction, light offset,
 * law of reflection, and focal lengths of mirrors and lenses through simulation and/or
 * hands-on experiments with observations, calculations, and analysis
 */
exports.course2_lab_mirrors_lenses = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 15 - Mirrors and Lenses',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'introduction',
    'equipment', 
    'procedure',
    'simulation',
    'observations',
    'analysis',
    'postlab'
  ],
  
  // Grading Configuration
  pointsValue: 18, // Worth 18 points total
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