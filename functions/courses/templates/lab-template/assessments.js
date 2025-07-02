/**
 * [LAB NAME] Assessments Template
 * Course: [COURSE NAME] (Course ID: [COURSE_ID])
 * Content: [LAB_FOLDER_NAME]
 * 
 * INSTRUCTIONS:
 * 1. Replace all [PLACEHOLDER] values with your specific lab information
 * 2. Update the requiredSections array to match your lab's sections
 * 3. Adjust the configuration values as needed for your lab
 * 4. Copy this file to: functions/courses/[COURSE_ID]/[LAB_FOLDER_NAME]/assessments.js
 */

const { createLabSubmission } = require('../shared/assessment-types/lab-submission');

/**
 * Lab: [LAB NAME]
 * [BRIEF DESCRIPTION OF WHAT STUDENTS DO IN THIS LAB]
 * 
 * Example descriptions:
 * - Students investigate conservation of momentum through collision experiments
 * - Students analyze chemical reaction rates under different conditions
 * - Students explore electromagnetic induction using simulations and calculations
 */
exports.course[COURSE_ID]_[LAB_FUNCTION_NAME] = createLabSubmission({
  // ============================================================================
  // BASIC CONFIGURATION - REQUIRED
  // ============================================================================
  
  // Lab identification
  labTitle: '[LAB DISPLAY NAME]',          // Example: 'Lab 1 - Conservation of Momentum'
  labType: '[LAB_TYPE]',                   // Options: 'physics', 'chemistry', 'biology', 'general'
  activityType: '[ACTIVITY_TYPE]',         // Options: 'lab', 'experiment', 'simulation'
  
  // ============================================================================
  // SECTION REQUIREMENTS - CUSTOMIZE FOR YOUR LAB
  // ============================================================================
  
  /**
   * Required sections that must be completed
   * 
   * IMPORTANT: These must match the sections in your lab component's sectionStatus state!
   * 
   * Common sections:
   * - 'hypothesis': Student's initial hypothesis
   * - 'procedure': Understanding of lab procedure
   * - 'observations': Data collection and observations
   * - 'analysis': Data analysis and calculations
   * - 'conclusion': Final conclusions and reflection
   * - 'error': Error analysis (for physics/chemistry labs)
   * - 'simulation': Interactive simulation work
   * 
   * Check your lab component for the exact section names used in sectionStatus state
   */
  requiredSections: [
    'hypothesis',
    'procedure',
    'observations',
    'analysis',
    'conclusion'
    // Add any additional sections your lab has:
    // 'error',
    // 'simulation',
    // 'calculations',
    // 'reflection'
  ],
  
  // ============================================================================
  // GRADING CONFIGURATION
  // ============================================================================
  
  pointsValue: 10,                         // Total points for the lab (adjust as needed)
  allowPartialCredit: true,                // Award partial credit for incomplete work
  completionThreshold: 75,                 // Percentage completion required for full credit
  
  // ============================================================================
  // VALIDATION SETTINGS
  // ============================================================================
  
  validateData: true,                      // Enable data structure validation
  maxDataSize: 2,                          // Maximum data size in MB (increase for data-heavy labs)
  
  // Uncomment and customize if you need special validation:
  // customValidator: (labData) => {
  //   const errors = [];
  //   
  //   // Example: Require minimum number of trials
  //   if (labData.trialData && labData.trialData.length < 3) {
  //     errors.push('At least 3 trials are required');
  //   }
  //   
  //   // Example: Validate required calculations
  //   if (labData.calculations && !labData.calculations.average) {
  //     errors.push('Average calculation is missing');
  //   }
  //   
  //   return {
  //     isValid: errors.length === 0,
  //     errors: errors
  //   };
  // },
  
  // ============================================================================
  // CLOUD FUNCTION SETTINGS
  // ============================================================================
  
  region: 'us-central1',                   // Firebase region (usually keep as is)
  timeout: 120,                            // Function timeout in seconds (increase for complex labs)
  memory: '512MiB'                         // Memory allocation (increase if needed)
  
  // ============================================================================
  // ADVANCED OPTIONS (uncomment if needed)
  // ============================================================================
  
  // Custom completion calculation:
  // calculateCompletion: (labData) => {
  //   let score = 0;
  //   if (labData.hypothesis) score += 20;
  //   if (labData.trialData?.length >= 3) score += 40;
  //   if (labData.analysis) score += 40;
  //   return Math.min(score, 100);
  // },
  
  // File upload support (future feature):
  // allowedFileTypes: ['jpg', 'png', 'pdf'],
  // maxFileSize: 10, // MB
});

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================
/*
After creating this file:

1. [ ] Replace all [PLACEHOLDER] values
2. [ ] Update requiredSections to match your lab
3. [ ] Adjust pointsValue and other settings
4. [ ] Copy to: functions/courses/[COURSE_ID]/[LAB_FOLDER_NAME]/assessments.js
5. [ ] Add export to functions/index.js:
       exports.course[COURSE_ID]_[LAB_FUNCTION_NAME] = 
         require('./courses/[COURSE_ID]/[LAB_FOLDER_NAME]/assessments').course[COURSE_ID]_[LAB_FUNCTION_NAME];
6. [ ] Deploy function: firebase deploy --only functions:course[COURSE_ID]_[LAB_FUNCTION_NAME]
7. [ ] Test save/load functionality in your lab

NAMING CONVENTIONS:
- LAB_FUNCTION_NAME: Use underscores, descriptive, example: lab_momentum_conservation
- COURSE_ID: Usually a number, example: 2
- LAB_FOLDER_NAME: Use hyphens, example: 07-lab-momentum-conservation
*/