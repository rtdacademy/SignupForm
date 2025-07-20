// functions/doc-server.js
// Simple dev server using the documentation example

// Import the documentation example
require('./doc-example');

// Set the development environment variable
process.env.GENKIT_ENV = 'dev';

console.log('\n📚 Genkit Documentation Example Server');
console.log('✅ Loaded examples from the Genkit documentation');
console.log('💡 The Genkit Developer UI should open in your browser');
console.log('   If not, access it at: http://localhost:4001');
console.log('\n🔍 Available flows:');
console.log('  - menuSuggestionFlow: Basic flow without schemas');
console.log('  - menuSuggestionFlowWithSchema: Flow with schema validation');
console.log('  - menuSuggestionFlowMarkdown: Flow that formats structured output');
console.log('  - pirateResponseFlow: Pirate-themed response flow');
console.log('  - menuSuggestionStreamingFlow: Flow with streaming output (menu items)');
console.log('  - storyStreamingFlow: Flow with streaming output (short stories)');
console.log('  - complexMenuSuggestionFlow: Multi-step chat flow to create a full menu');
console.log('\n💡 Testing tips:');
console.log('   • Try a cuisine type like "Italian", "Japanese", or "Mexican"');
console.log('   • For the complex menu flow, watch the console to see the multi-step process');
console.log('   • For streaming flows, use the -s flag when running from CLI:');
console.log('     npx genkit flow:run storyStreamingFlow \'"adventure"\' -s');

// Keep the process alive
setInterval(() => {}, 1000);