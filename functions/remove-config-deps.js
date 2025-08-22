#!/usr/bin/env node

/**
 * Script to remove config file dependencies from all assessment files
 * This removes references to the deprecated course-config.json file
 */

const fs = require('fs');
const path = require('path');

// Files that need updating (from grep search)
const filesToUpdate = [
  'courses/2a/01-physics-20-review/assessments.js',
  'courses/2a/03-momentum-two-dimensions/assessments.js',
  'courses/2a/04-impulse-momentum-change/assessments.js',
  'courses/2a/06-graphing-techniques/assessments.js',
  'courses/2a/09-introduction-to-light/assessments.js',
  'courses/2a2/22-unit-1-review/assessments.js',
  'courses/2a2/23-unit-2-review/assessments.js',
  'courses/2b/25-electrostatics/assessments.js',
  'courses/2b/26-coulombs-law/assessments.js',
  'courses/2b/29-electric-fields/assessments.js',
  'courses/2b/30-electric-potential/assessments.js',
  'courses/2b/31-parallel-plates/assessments.js',
  'courses/2b/32-electric-current/assessments.js',
  'courses/2b/35-l1-18-cumulative-assignment/assessments.js',
  'courses/2b/36-magnetic-fields/assessments.js',
  'courses/2b/37-magnetic-forces-particles/assessments.js',
  'courses/2b/38-motor-effect/assessments.js',
  'courses/2b/40-generator-effect/assessments.js',
  'courses/2b/42-electromagnetic-radiation/assessments.js',
  'courses/2b/46-unit-3-review/assessments.js',
  'courses/2b/47-unit-4-review/assessments.js',
  'courses/2b/49-early-atomic-models/assessments.js',
  'courses/2b/50-cathode-rays/assessments.js',
  'courses/2b/51-rutherford-atom/assessments.js',
  'courses/2b/53-quantization-of-light/assessments.js',
  'courses/2b/55-photoelectric-effect/assessments.js',
  'courses/2c/57-light-spectra-excitation/assessments.js',
  'courses/2c/60-bohr-model/assessments.js',
  'courses/2c/61-compton-effect/assessments.js',
  'courses/2c/62-wave-particle-nature/assessments.js',
  'courses/2c/66-nuclear-physics/assessments.js',
  'courses/2c/67-radioactivity/assessments.js',
  'courses/2c/70-particle-physics/assessments.js',
  'courses/2c/71-quarks/assessments.js',
  'courses/2c/74-unit-5-review/assessments.js',
  'courses/2c/75-unit-6-review/assessments.js'
];

function removeConfigDependency(filePath) {
  const fullPath = path.join(__dirname, filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  File not found: ${filePath}`);
    return false;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Check if file has the config dependency
  if (!content.includes('courses-config/2/course-config.json')) {
    console.log(`✓  Already updated: ${filePath}`);
    return true;
  }
  
  // Remove the config-loader import line (may or may not be present)
  content = content.replace(
    /const\s*{\s*getActivityTypeSettings\s*,\s*getWordLimitsForDifficulty\s*}\s*=\s*require\([^)]+config-loader[^)]*\);?\n/g,
    ''
  );
  
  // Remove the course-config.json require line
  content = content.replace(
    /const\s+courseConfig\s*=\s*require\([^)]*courses-config\/2\/course-config\.json[^)]*\);?\n/g,
    ''
  );
  
  // Remove the activityDefaults line
  content = content.replace(
    /const\s+activityDefaults\s*=\s*getActivityTypeSettings\([^)]+\);?\n/g,
    ''
  );
  
  // Remove the longAnswerDefaults line (commented or not)
  content = content.replace(
    /\/\/const\s+longAnswerDefaults\s*=\s*getActivityTypeSettings\([^)]+\);?\n/g,
    ''
  );
  
  // Remove the comment about course-config.json
  content = content.replace(
    /\/\/\s*This determines which default settings are used from course-config\.json\n/g,
    ''
  );
  
  // Add a comment about the removal (only if we made changes)
  if (content.includes('// ===== ACTIVITY TYPE CONFIGURATION =====')) {
    content = content.replace(
      '// ===== ACTIVITY TYPE CONFIGURATION =====',
      '// Removed dependency on config file - settings are now handled directly in assessment configurations\n\n// ===== ACTIVITY TYPE CONFIGURATION ====='
    );
  }
  
  // Clean up extra blank lines (more than 3 consecutive)
  content = content.replace(/\n{4,}/g, '\n\n\n');
  
  // Write the updated content back
  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`✅  Updated: ${filePath}`);
  return true;
}

console.log('Starting config dependency removal...\n');

let successCount = 0;
let failCount = 0;

for (const file of filesToUpdate) {
  if (removeConfigDependency(file)) {
    successCount++;
  } else {
    failCount++;
  }
}

console.log('\n' + '='.repeat(50));
console.log(`✅  Successfully updated: ${successCount} files`);
if (failCount > 0) {
  console.log(`⚠️  Failed to update: ${failCount} files`);
}
console.log('='.repeat(50));
console.log('\nDone! Config dependencies have been removed.');