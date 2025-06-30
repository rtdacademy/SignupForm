#!/usr/bin/env node

const fs = require('fs');

/**
 * Simple script to convert manual accordion sections to AIAccordion components
 * This version provides a list of sections to convert manually rather than automated conversion
 * Usage: node convert-accordions-simple.js <file-path>
 */

function analyzeAccordions(filePath) {
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, 'utf8');
  
  // Find all button patterns with onClick handlers
  const buttonPattern = /onClick=\{\(\) => setIs(\w+)Open\(!is\w+Open\)\}/g;
  const sections = [];
  let match;
  
  while ((match = buttonPattern.exec(content)) !== null) {
    const stateName = match[1];
    
    // Find the title by looking for the h3 tag after this button
    const afterButton = content.substring(match.index);
    const titleMatch = afterButton.match(/<h3[^>]*>([^<]+)<\/h3>/);
    
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const kebabCase = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      sections.push({
        stateName: stateName,
        title: title,
        kebabCase: kebabCase,
        stateVariable: `is${stateName}Open`
      });
    }
  }
  
  return sections;
}

function generateConversionInstructions(sections) {
  console.log('\n=== ACCORDION CONVERSION INSTRUCTIONS ===\n');
  
  console.log('1. SECTIONS TO CONVERT:');
  sections.forEach((section, index) => {
    console.log(`   ${index + 1}. "${section.title}"`);
    console.log(`      State: ${section.stateVariable}`);
    console.log(`      Value: "${section.kebabCase}"`);
    console.log('');
  });
  
  console.log('2. PATTERN TO REPLACE:');
  console.log(`   Replace this pattern:`);
  console.log(`   <TextSection>`);
  console.log(`     <div className="mb-6">`);
  console.log(`       <button onClick={() => setState(!state)}...>`);
  console.log(`         <h3>Title</h3>`);
  console.log(`       </button>`);
  console.log(`       {state && (`);
  console.log(`         <div className="mt-4">`);
  console.log(`           CONTENT`);
  console.log(`         </div>`);
  console.log(`       )}`);
  console.log(`     </div>`);
  console.log(`   </TextSection>`);
  console.log('');
  
  console.log('   With this pattern:');
  console.log(`   <TextSection>`);
  console.log(`     <AIAccordion theme="blue">`);
  console.log(`       <AIAccordion.Item title="Title" value="kebab-case" onAskAI={onAIAccordionContent}>`);
  console.log(`         CONTENT (without wrapper div)`);
  console.log(`       </AIAccordion.Item>`);
  console.log(`     </AIAccordion>`);
  console.log(`   </TextSection>`);
  console.log('');
  
  console.log('3. STATE VARIABLES TO REMOVE:');
  sections.forEach(section => {
    console.log(`   const [${section.stateVariable}, set${section.stateName}Open] = useState(false);`);
  });
  console.log('');
  
  console.log('4. RECOMMENDED CONVERSION ORDER:');
  console.log('   Convert sections one at a time to avoid conflicts');
  console.log('   Start with conceptual sections (non-examples) for maximum AI benefit');
  console.log('');
}

// Main execution
if (require.main === module) {
  const filePath = process.argv[2];
  
  if (!filePath) {
    console.error('Usage: node convert-accordions-simple.js <file-path>');
    process.exit(1);
  }

  try {
    const sections = analyzeAccordions(filePath);
    
    console.log(`\n📋 Found ${sections.length} accordion sections in: ${filePath}`);
    
    generateConversionInstructions(sections);
    
    console.log('💡 TIP: Use Claude Code to convert these sections one by one for best results!');
    
  } catch (error) {
    console.error('Error during analysis:', error.message);
    process.exit(1);
  }
}

module.exports = { analyzeAccordions };