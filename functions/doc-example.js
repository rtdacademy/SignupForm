// functions/doc-example.js
// Direct implementation from Genkit documentation

const { genkit } = require('genkit/beta');
const { googleAI } = require('@genkit-ai/googleai');
const { z } = require('zod'); // Import Zod for schema validation

// Set API key for development
process.env.GOOGLE_API_KEY = "AIzaSyAdRyYbFRbNqQaH11kEQzq_wj6rpLMg2oI";

// Initialize Genkit with Google AI plugin
const ai = genkit({
  plugins: [googleAI()]
});

// Export the AI instance
exports.ai = ai;

// Define the MenuItemSchema for the structured outputs
const MenuItemSchema = z.object({
  dishname: z.string(),
  description: z.string(),
});

// Define the PrixFixeMenuSchema for the complex menu example
const PrixFixeMenuSchema = z.object({
  starter: z.string(),
  soup: z.string(),
  main: z.string(),
  dessert: z.string(),
});

// EXAMPLE 1: Basic flow without schemas
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

// EXAMPLE 2: Flow with schema validation
exports.menuSuggestionFlowWithSchema = ai.defineFlow(
  {
    name: 'menuSuggestionFlowWithSchema',
    inputSchema: z.string(),
    outputSchema: MenuItemSchema,
  },
  async (restaurantTheme) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `Invent a menu item for a ${restaurantTheme} themed restaurant.`,
      output: { schema: MenuItemSchema },
    });
    if (output == null) {
      throw new Error("Response doesn't satisfy schema.");
    }
    return output;
  }
);

// EXAMPLE 3: Flow that formats structured output as a string
exports.menuSuggestionFlowMarkdown = ai.defineFlow(
  {
    name: 'menuSuggestionFlowMarkdown',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (restaurantTheme) => {
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `Invent a menu item for a ${restaurantTheme} themed restaurant.`,
      output: { schema: MenuItemSchema },
    });
    if (output == null) {
      throw new Error("Response doesn't satisfy schema.");
    }
    return `**${output.dishname}**: ${output.description}`;
  }
);

// EXAMPLE 4: Pirate-themed flow
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

// EXAMPLE 5: Streaming flow
exports.menuSuggestionStreamingFlow = ai.defineFlow(
  {
    name: 'menuSuggestionStreamingFlow',
    inputSchema: z.string(),
    streamSchema: z.string(),
    outputSchema: z.object({ theme: z.string(), menuItem: z.string() }),
  },
  async (restaurantTheme, { sendChunk }) => {
    const response = await ai.generateStream({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `Invent a detailed menu item for a ${restaurantTheme} themed restaurant. Include ingredients, preparation method, and presentation details.`,
    });

    for await (const chunk of response.stream) {
      // Here, we output the text of the chunk, unmodified.
      // In a real application, you could process each chunk before sending
      sendChunk(chunk.text);
    }

    return {
      theme: restaurantTheme,
      menuItem: (await response.response).text,
    };
  }
);

// EXAMPLE 6: Creative writing streaming flow (for more visible streaming effects)
exports.storyStreamingFlow = ai.defineFlow(
  {
    name: 'storyStreamingFlow',
    inputSchema: z.string(),
    streamSchema: z.string(),
    outputSchema: z.object({ topic: z.string(), story: z.string() }),
  },
  async (topic, { sendChunk }) => {
    const response = await ai.generateStream({
      model: googleAI.model('gemini-2.0-flash'),
      prompt: `Write a creative short story about ${topic}. Make it engaging and at least 300 words long.`,
    });

    for await (const chunk of response.stream) {
      // Send each chunk as it's generated
      sendChunk(chunk.text);
    }

    return {
      topic: topic,
      story: (await response.response).text,
    };
  }
);

// EXAMPLE 7: Complex menu using chat interface with multiple exchanges
exports.complexMenuSuggestionFlow = ai.defineFlow(
  {
    name: 'complexMenuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: PrixFixeMenuSchema,
  },
  async (theme) => {
    // Create a chat instance to maintain context across multiple exchanges
    const chat = ai.chat({ model: googleAI.model('gemini-2.0-flash') });
    
    // First exchange: Ask about good prix fixe menus in general
    console.log("Asking about prix fixe menus...");
    await chat.send('What makes a good prix fixe menu?');
    
    // Second exchange: Ask about ingredients for the specific theme
    console.log(`Asking about ingredients for ${theme} cuisine...`);
    await chat.send(
      'What are some ingredients, seasonings, and cooking techniques that ' +
        `would work for a ${theme} themed menu?`
    );
    
    // Final exchange: Request the complete menu with the schema
    console.log("Requesting the complete menu...");
    const { output } = await chat.send({
      prompt:
        `Based on our discussion, invent a prix fixe menu for a ${theme} ` +
        'themed restaurant.',
      output: {
        schema: PrixFixeMenuSchema,
      },
    });
    
    if (!output) {
      throw new Error('No data generated.');
    }
    
    return output;
  }
);

console.log("✅ Documentation example flows loaded successfully");