#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG_PATH = path.join(__dirname, '../functions/courses-config/2/course-config.json');

function fixQuestionPoints() {
  try {
    // Read the config file
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configContent);
    
    let changesCount = 0;
    
    // Update gradebook.itemStructure questions
    if (config.gradebook && config.gradebook.itemStructure) {
      for (const [itemKey, item] of Object.entries(config.gradebook.itemStructure)) {
        if (item.questions && Array.isArray(item.questions)) {
          for (const question of item.questions) {
            if (question.points && question.points !== 1) {
              console.log(`Updating ${itemKey} - ${question.questionId || question.title}: ${question.points} → 1`);
              question.points = 1;
              changesCount++;
            }
          }
        }
      }
    }
    
    // Update courseStructure items if they have questions
    if (config.courseStructure && config.courseStructure.units) {
      for (const unit of config.courseStructure.units) {
        if (unit.items) {
          for (const item of unit.items) {
            if (item.questions && Array.isArray(item.questions)) {
              for (const question of item.questions) {
                if (question.points && question.points !== 1) {
                  console.log(`Updating courseStructure ${item.itemId} - ${question.questionId || question.title}: ${question.points} → 1`);
                  question.points = 1;
                  changesCount++;
                }
              }
            }
          }
        }
      }
    }
    
    if (changesCount > 0) {
      // Write the updated config back
      const updatedContent = JSON.stringify(config, null, 2);
      fs.writeFileSync(CONFIG_PATH, updatedContent, 'utf8');
      console.log(`\n✅ Updated ${changesCount} question points to 1`);
    } else {
      console.log('No question points needed updating - all are already set to 1');
    }
    
  } catch (error) {
    console.error('Error fixing question points:', error.message);
    process.exit(1);
  }
}

// Main execution
function main() {
  console.log('Fixing question points to 1...\n');
  
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Config file not found: ${CONFIG_PATH}`);
    process.exit(1);
  }
  
  fixQuestionPoints();
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = { fixQuestionPoints };