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

  let content = fs.readFileSync(filePath, 'utf8');
  let stateVariablesToRemove = [];

  // Pattern to match manual accordion sections
  const accordionPattern = /<TextSection>\s*<div className="mb-6">\s*<button\s+onClick=\{[^}]*setIs(\w+)Open[^}]*\}[^>]*>\s*<h3[^>]*>([^<]+)<\/h3>\s*<span[^>]*>\{is\w+Open[^}]*\}<\/span>\s*<\/button>\s*\{is\w+Open && \(\s*<div className="mt-4">([\s\S]*?)<\/div>\s*\)\}\s*<\/div>\s*<\/TextSection>/g;

  // Find all accordion sections
  const matches = [];
  let match;
  while ((match = accordionPattern.exec(content)) !== null) {
    matches.push({
      fullMatch: match[0],
      stateName: match[1],
      title: match[2].trim(),
      content: match[3]
    });
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