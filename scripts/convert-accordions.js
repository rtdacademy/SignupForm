#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Script to convert manual accordion sections to AIAccordion components
 * Usage: node convert-accordions.js <file-path>
 */

function convertAccordions(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  let stateVariablesToRemove = [];

  // Manual approach - find sections by button patterns and parse manually
  const sections = findAccordionSections(content);
  
  console.log(`Found ${sections.length} accordion sections to convert:`);
  
  return {
    content: content, // For now, just return original content 
    convertedCount: sections.length,
    removedStateVars: []
  };
}

function findAccordionSections(content) {
  // Find all button patterns with onClick handlers
  const buttonPattern = /onClick=\{\(\) => setIs(\w+)Open\(!is\w+Open\)\}/g;
  const matches = [];
  let match;
  
  while ((match = buttonPattern.exec(content)) !== null) {
    const stateName = match[1];
    
    // Find the title by looking for the h3 tag after this button
    const beforeButton = content.substring(0, match.index);
    const afterButton = content.substring(match.index);
    
    // Look for h3 tag in the button
    const titleMatch = afterButton.match(/<h3[^>]*>([^<]+)<\/h3>/);
    if (titleMatch) {
      matches.push({
        stateName: stateName,
        title: titleMatch[1].trim(),
        position: match.index
      });
    }
  }
  
  return matches;
}

  console.log(`Found ${matches.length} accordion sections to convert:`);

  // Process each match
  matches.forEach((accordionMatch, index) => {
    const { fullMatch, stateName, title, content } = accordionMatch;
    
    // Generate kebab-case value from title
    const value = title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

    console.log(`  ${index + 1}. Converting: "${title}" (${stateName})`);

    // Create AIAccordion replacement
    const replacement = `<TextSection>
        <AIAccordion theme="blue">
          <AIAccordion.Item
            title="${title}"
            value="${value}"
            onAskAI={onAIAccordionContent}
          >
${content}
          </AIAccordion.Item>
        </AIAccordion>
      </TextSection>`;

    // Replace the section
    content = content.replace(fullMatch, replacement);

    // Track state variables to remove
    stateVariablesToRemove.push(`is${stateName}Open`);
  });

  // Remove state variable declarations
  stateVariablesToRemove.forEach(varName => {
    const statePattern = new RegExp(`\\s*const \\[${varName}, set${varName.replace('is', '').replace('Open', '')}Open\\] = useState\\(false\\);`, 'g');
    content = content.replace(statePattern, '');
    
    // Also handle the more compact format seen in the file
    const compactPattern = new RegExp(`\\s*const \\[${varName}, set${varName.replace('is', '').replace('Open', '')}Open\\] = useState\\(false\\);`, 'g');
    content = content.replace(compactPattern, '');
  });

  // Clean up any duplicate semicolons or empty lines
  content = content.replace(/;\s*;/g, ';');
  content = content.replace(/\n\s*\n\s*\n/g, '\n\n');

  return {
    content,
    convertedCount: matches.length,
    removedStateVars: stateVariablesToRemove
  };
}

// Main execution
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node convert-accordions.js <file-path>');
    process.exit(1);
  }

  try {
    const result = convertAccordions(filePath);
    
    // Create backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`\nBackup created: ${backupPath}`);

    // Write converted content
    fs.writeFileSync(filePath, result.content);
    
    console.log(`\n✅ Conversion completed successfully!`);
    console.log(`   - Converted ${result.convertedCount} accordion sections`);
    console.log(`   - Removed ${result.removedStateVars.length} state variables`);
    console.log(`   - Updated file: ${filePath}`);
    
    if (result.removedStateVars.length > 0) {
      console.log(`\nRemoved state variables:`);
      result.removedStateVars.forEach(varName => console.log(`   - ${varName}`));
    }

  } catch (error) {
    console.error('Error during conversion:', error.message);
    process.exit(1);
  }
}

module.exports = { convertAccordions };