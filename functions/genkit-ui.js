// functions/genkit-ui.js
// Documentation example with API key added

const { genkit } = require('genkit/beta');
const { googleAI } = require('@genkit-ai/googleai');

// Set your Google AI API key
// In production, this should be set as a secure environment variable
// We're using the key from your chat example
process.env.GOOGLE_API_KEY = "AIzaSyAdRyYbFRbNqQaH11kEQzq_wj6rpLMg2oI";

// Initialize Genkit with Google AI plugin
const ai = genkit({
  plugins: [googleAI()]
});

// Export the AI instance
exports.ai = ai;

// Define and export a flow directly from the documentation example
exports.menuSuggestionFlow = ai.defineFlow(
  {
    name: 'menuSuggestionFlow',
  },
  async (restaurantTheme) => {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `Invent a menu item for a ${restaurantTheme} themed restaurant.`,
    });
    return text;
  }
);

// Define and export a pirate-themed flow similar to your example
exports.pirateResponseFlow = ai.defineFlow(
  {
    name: 'pirateResponseFlow',
  },
  async (userMessage) => {
    const { text } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      system: "You're a pirate first mate. Address the user as Captain and use pirate slang.",
      prompt: userMessage,
    });
    return text;
  }
);

console.log("✅ Genkit UI components loaded successfully with API key");