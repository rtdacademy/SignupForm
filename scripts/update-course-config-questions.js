#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const COURSE_ID = '2';
const FUNCTIONS_PATH = path.join(__dirname, '../functions');
const COURSE_PATH = path.join(FUNCTIONS_PATH, 'courses', COURSE_ID);
const CONFIG_PATH = path.join(FUNCTIONS_PATH, 'courses-config', COURSE_ID, 'course-config.json');

// Helper function to extract question IDs and their point values from assessment files
function extractQuestionIds(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const questions = [];
    
    // Regex to match exports with their full definition blocks
    const exportRegex = /exports\.(course2_\d+_[^=\s]+)\s*=\s*[^{]*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    let match;
    
    while ((match = exportRegex.exec(content)) !== null) {
      const questionId = match[1];
      const definitionBlock = match[2];
      
      // Extract pointsValue from the definition block
      const pointsMatch = definitionBlock.match(/pointsValue:\s*(\d+)/);
      const points = pointsMatch ? parseInt(pointsMatch[1]) : 1; // Default to 1 if not found
      
      questions.push({
        id: questionId,
        points: points
      });
    }
    
    return questions;
  } catch (error) {
    console.warn(`Warning: Could not read ${filePath}:`, error.message);
    return [];
  }
}

// Helper function to determine question type and points based on naming
function determineQuestionType(questionId) {
  const lowerId = questionId.toLowerCase();
  
  if (lowerId.includes('_l') && lowerId.includes('_assignment')) {
    return { type: 'assignment', points: 1 };
  }
  if (lowerId.includes('_lab_')) {
    return { type: 'lab', points: 1 };
  }
  if (lowerId.includes('_exam_')) {
    return { type: 'exam', points: 1 };
  }
  
  // Default to lesson type
  return { type: 'lesson', points: 1 };
}

// Helper function to generate question title from ID
function generateQuestionTitle(questionId) {
  const parts = questionId.split('_');
  // Remove 'course2' and lesson number, capitalize remaining parts
  const titleParts = parts.slice(2).map(part => {
    return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
  });
  return titleParts.join(' ');
}

// Helper function to map lesson folder to contentPath in config
function mapFolderToContentPath(folderName) {
  // Remove leading numbers and dashes, e.g., "01-physics-20-review" -> "01-physics-20-review"
  return folderName;
}

// Main function to scan all assessment files and build question map
function scanAssessmentFiles() {
  const questionMap = new Map();
  
  try {
    const courseFolders = fs.readdirSync(COURSE_PATH);
    
    for (const folder of courseFolders) {
      const folderPath = path.join(COURSE_PATH, folder);
      const assessmentsPath = path.join(folderPath, 'assessments.js');
      
      // Skip if not a directory or no assessments.js
      if (!fs.statSync(folderPath).isDirectory() || !fs.existsSync(assessmentsPath)) {
        continue;
      }
      
      console.log(`Scanning ${folder}/assessments.js...`);
      const questions = extractQuestionIds(assessmentsPath);
      
      if (questions.length > 0) {
        const contentPath = mapFolderToContentPath(folder);
        questionMap.set(contentPath, questions);
        console.log(`  Found ${questions.length} questions`);
      }
    }
    
  } catch (error) {
    console.error('Error scanning assessment files:', error.message);
    process.exit(1);
  }
  
  return questionMap;
}

// Function to update course config with questions
function updateCourseConfig(questionMap) {
  try {
    // Read existing config
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf8');
    const config = JSON.parse(configContent);
    
    // Ensure gradebook.itemStructure exists
    if (!config.gradebook) {
      config.gradebook = {};
    }
    if (!config.gradebook.itemStructure) {
      config.gradebook.itemStructure = {};
    }
    
    // CLEAR ALL EXISTING QUESTIONS - Start fresh each time
    console.log('Clearing all existing questions from gradebook.itemStructure...');
    for (const [itemKey, item] of Object.entries(config.gradebook.itemStructure)) {
      if (item.questions) {
        const questionCount = item.questions.length;
        item.questions = [];
        console.log(`  Cleared ${questionCount} questions from ${itemKey}`);
      }
    }
    
    // Process each lesson/assignment/lab/exam in the course structure
    for (const unit of config.courseStructure.units) {
      for (const item of unit.items) {
        const contentPath = item.contentPath;
        
        if (questionMap.has(contentPath)) {
          const questions = questionMap.get(contentPath);
          
          // Create or update the gradebook item
          const gradebookKey = item.itemId;
          
          if (!config.gradebook.itemStructure[gradebookKey]) {
            config.gradebook.itemStructure[gradebookKey] = {
              title: item.title,
              type: item.type,
              contentPath: contentPath,
              questions: []
            };
          }
          
          // Questions array is already cleared above, now add new ones
          
          questions.forEach((question, index) => {
            config.gradebook.itemStructure[gradebookKey].questions.push({
              questionId: question.id,
              title: generateQuestionTitle(question.id),
              points: question.points
            });
          });
          
          console.log(`Updated ${gradebookKey} with ${questions.length} questions`);
        }
      }
    }
    
    // Write updated config back to file
    const updatedContent = JSON.stringify(config, null, 2);
    fs.writeFileSync(CONFIG_PATH, updatedContent, 'utf8');
    
    console.log(`\nSuccessfully updated ${CONFIG_PATH}`);
    
  } catch (error) {
    console.error('Error updating course config:', error.message);
    process.exit(1);
  }
}

// Function to generate summary report
function generateSummaryReport(questionMap) {
  console.log('\n=== QUESTION EXTRACTION SUMMARY ===');
  
  let totalQuestions = 0;
  const typeCount = { lesson: 0, assignment: 0, lab: 0, exam: 0 };
  
  for (const [contentPath, questions] of questionMap) {
    totalQuestions += questions.length;
    
    // Determine predominant type for this content
    const types = questions.map(q => determineQuestionType(q.id).type);
    const predominantType = types[0] || 'lesson';
    typeCount[predominantType] += questions.length;
    
    console.log(`${contentPath}: ${questions.length} questions`);
  }
  
  console.log(`\nTotal Questions: ${totalQuestions}`);
  console.log(`By Type:`);
  Object.entries(typeCount).forEach(([type, count]) => {
    console.log(`  ${type}: ${count} questions`);
  });
}

// Main execution
function main() {
  console.log('Starting Course Config Question Update...\n');
  
  // Check if paths exist
  if (!fs.existsSync(COURSE_PATH)) {
    console.error(`Error: Course path not found: ${COURSE_PATH}`);
    process.exit(1);
  }
  
  if (!fs.existsSync(CONFIG_PATH)) {
    console.error(`Error: Config file not found: ${CONFIG_PATH}`);
    process.exit(1);
  }
  
  // Scan all assessment files
  const questionMap = scanAssessmentFiles();
  
  if (questionMap.size === 0) {
    console.log('No questions found in assessment files.');
    process.exit(0);
  }
  
  // Generate summary
  generateSummaryReport(questionMap);
  
  // Ask for confirmation
  console.log('\nThis will update the course-config.json file.');
  console.log('Make sure you have a backup before proceeding.');
  
  // Update the config
  updateCourseConfig(questionMap);
  
  console.log('\n✅ Course config update completed successfully!');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  extractQuestionIds,
  determineQuestionType,
  generateQuestionTitle,
  scanAssessmentFiles,
  updateCourseConfig
};