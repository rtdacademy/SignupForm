#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to merge questions from functions/courses-config/2/course-config.json
 * into course2_simplified_config.json
 */

const SIMPLIFIED_CONFIG_PATH = './course2_simplified_config.json';
const FUNCTIONS_CONFIG_PATH = './functions/courses-config/2/course-config.json';
const OUTPUT_PATH = './course2_simplified_config_updated.json';

console.log('🔄 Starting question merge process...\n');

// Read configuration files
let simplifiedConfig, functionsConfig;

try {
  console.log('📖 Reading simplified config...');
  const simplifiedData = fs.readFileSync(SIMPLIFIED_CONFIG_PATH, 'utf8');
  simplifiedConfig = JSON.parse(simplifiedData);
  console.log('✅ Simplified config loaded successfully');
} catch (error) {
  console.error('❌ Error reading simplified config:', error.message);
  process.exit(1);
}

try {
  console.log('📖 Reading functions config...');
  const functionsData = fs.readFileSync(FUNCTIONS_CONFIG_PATH, 'utf8');
  functionsConfig = JSON.parse(functionsData);
  console.log('✅ Functions config loaded successfully');
} catch (error) {
  console.error('❌ Error reading functions config:', error.message);
  process.exit(1);
}

// Extract questions from functions config
console.log('\n🔍 Extracting questions from functions config...');
const questionsMap = {};
let totalQuestionsFound = 0;

if (functionsConfig.gradebook && functionsConfig.gradebook.itemStructure) {
  const itemStructure = functionsConfig.gradebook.itemStructure;
  
  for (const [itemId, itemData] of Object.entries(itemStructure)) {
    if (itemData.questions && Array.isArray(itemData.questions)) {
      questionsMap[itemId] = itemData.questions;
      totalQuestionsFound += itemData.questions.length;
      console.log(`  📝 Found ${itemData.questions.length} questions for ${itemId}`);
    }
  }
}

console.log(`✅ Extracted ${totalQuestionsFound} total questions from ${Object.keys(questionsMap).length} items\n`);

// Merge questions into simplified config
console.log('🔗 Merging questions into simplified config...');
let itemsUpdated = 0;
let questionsAdded = 0;

function processItems(items) {
  for (const item of items) {
    const itemId = item.itemId;
    
    // Check if this item exists in the questions map and needs questions
    if (questionsMap[itemId] && (!item.questions || item.questions.length === 0)) {
      item.questions = questionsMap[itemId];
      itemsUpdated++;
      questionsAdded += item.questions.length;
      console.log(`  ✅ Added ${item.questions.length} questions to ${itemId}`);
    } else if (questionsMap[itemId] && item.questions && item.questions.length > 0) {
      console.log(`  ℹ️  ${itemId} already has ${item.questions.length} questions - skipping`);
    } else if (!questionsMap[itemId] && (!item.questions || item.questions.length === 0)) {
      console.log(`  ⚠️  No questions found for ${itemId} in functions config`);
    }
  }
}

// Process all units and their items
if (simplifiedConfig.units && Array.isArray(simplifiedConfig.units)) {
  for (const unit of simplifiedConfig.units) {
    if (unit.items && Array.isArray(unit.items)) {
      console.log(`\n📚 Processing unit: ${unit.name}`);
      processItems(unit.items);
    }
  }
}

console.log(`\n🎯 Merge Summary:`);
console.log(`   📊 Items updated: ${itemsUpdated}`);
console.log(`   📝 Questions added: ${questionsAdded}`);

// Write updated config to output file
try {
  console.log(`\n💾 Writing updated config to ${OUTPUT_PATH}...`);
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(simplifiedConfig, null, 2), 'utf8');
  console.log('✅ Updated config file written successfully');
} catch (error) {
  console.error('❌ Error writing output file:', error.message);
  process.exit(1);
}

// Generate summary report
const summaryReport = {
  timestamp: new Date().toISOString(),
  totalItemsUpdated: itemsUpdated,
  totalQuestionsAdded: questionsAdded,
  totalQuestionsInSource: totalQuestionsFound,
  questionsSourceItems: Object.keys(questionsMap).length,
  outputFile: OUTPUT_PATH
};

try {
  const reportPath = './merge-report.json';
  fs.writeFileSync(reportPath, JSON.stringify(summaryReport, null, 2), 'utf8');
  console.log(`📋 Summary report saved to ${reportPath}`);
} catch (error) {
  console.warn('⚠️  Could not write summary report:', error.message);
}

console.log('\n🎉 Question merge completed successfully!');
console.log(`\n📄 Next steps:`);
console.log(`   1. Review the updated file: ${OUTPUT_PATH}`);
console.log(`   2. If satisfied, replace your original file`);
console.log(`   3. Upload to Firebase database`);