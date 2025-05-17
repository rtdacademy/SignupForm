// functions/local-dev-server.js
// Simple dev server for Genkit Developer UI integration

// Load the Genkit UI integration file with API key
require('./genkit-ui');

// Set the development environment variable
process.env.GENKIT_ENV = 'dev';

console.log('\n🔑 Genkit Developer UI Server');
console.log('✅ Loaded examples with API key from your chat example');
console.log('💡 The Genkit Developer UI should open in your browser');
console.log('   If not, access it at: http://localhost:4001');
console.log('\n🔍 Available components:');
console.log('  - AI instance: ai');
console.log('  - Flows: menuSuggestionFlow, pirateResponseFlow');

// Keep the process alive
setInterval(() => {}, 1000);