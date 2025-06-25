/**
 * Lab Laser Wavelength Assessments
 * Course: Physics 30 (Course ID: 2)
 * Content: 20-lab-laser-wavelength
 */

const { createLabSubmission } = require('../../../shared/assessment-types/lab-submission');

/**
 * Lab: Laser Wavelength
 * Students use diffraction gratings to measure the wavelength of a commercially available laser
 * including hypothesis, equipment selection, procedure understanding, simulation/observations,
 * analysis with wavelength calculations, error analysis, and post-lab questions
 */
exports.course2_lab_laser_wavelength = createLabSubmission({
  // Lab Configuration
  labTitle: 'Lab 20 - Laser Wavelength',
  labType: 'physics',
  activityType: 'lab',
  
  // Required sections that must be completed
  requiredSections: [
    'hypothesis',
    'equipment', 
    'procedure',
    'simulation',
    'observations',
    'analysis',
    'error',
    'postlab'
  ],
  
  // Grading Configuration
  pointsValue: 20, // Worth 20 points total
  allowPartialCredit: true,
  completionThreshold: 75, // 75% completion required for full credit
  
  // Data Validation
  validateData: true,
  maxDataSize: 3, // Maximum 3MB of data (larger due to rich text content)
  
  // Auto-save Configuration
  autoSaveInterval: 30, // Auto-save every 30 seconds
  
  // Cloud Function Settings
  region: 'us-central1',
  timeout: 120, // 2 minutes timeout for large lab data
  memory: '512MiB'
});