// Generate AI Assistant Configuration using Genkit
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { genkit, z } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const AI_MODELS = require('./aiSettings');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Lazy initialization of AI instance
let aiInstance = null;

function initializeAI() {
  if (!aiInstance) {
    console.log('Initializing AI with Genkit and Google AI plugin...');

    // Check if Google AI API key is available
    const apiKey = process.env.GOOGLE_AI_API_KEY || process.env.GEMINI_API_KEY;
    console.log('Google AI API key available:', !!apiKey);

    const ai = genkit({
      plugins: [googleAI()], // Genkit reads API key from environment
    });

    console.log('Genkit AI instance initialized successfully');
    aiInstance = ai;
  }
  return aiInstance;
}

/**
 * Schema for AI Assistant configuration
 */
const AssistantConfigSchema = z.object({
  assistantName: z.string().describe('Clear and descriptive name for the assistant'),
  instructions: z.string().describe('Detailed instructions defining personality, teaching approach, and expertise'),
  firstMessage: z.string().describe('Engaging first message that invites interaction, can include HTML formatting'),
  messageStarters: z.array(z.string()).min(3).max(5).describe('3-5 relevant message starters that students might use')
});

/**
 * System prompt for generating assistant configuration
 */
const ASSISTANT_GENERATION_PROMPT = `You are an expert in creating educational AI teaching assistants. Your task is to generate a configuration for an AI assistant based on the provided description and any attached context (documents or images).

Key responsibilities:
1. Create a clear, descriptive assistant name
2. Define comprehensive instructions for the assistant's behavior and expertise
3. Write an engaging first message that welcomes students
4. Generate 3-5 relevant message starters

Guidelines:
- Focus on educational value and student engagement
- Make the assistant supportive, encouraging, and knowledgeable
- Tailor the personality to the subject matter and grade level if specified
- If documents or images are provided as context, incorporate their relevance into the configuration
- Use clear, age-appropriate language
- The first message can include HTML formatting for better presentation (bold, lists, links)

Output Requirements:
- assistantName: Should be descriptive and friendly (e.g., "Math Tutor", "Writing Coach", "Science Helper")
- instructions: Comprehensive guide for the assistant's behavior, knowledge, and teaching approach (minimum 100 words)
- firstMessage: Welcoming message that introduces the assistant and invites interaction (can use HTML)
- messageStarters: Array of 3-5 example questions or prompts students might use

Educational Focus:
- Encourage critical thinking and problem-solving
- Provide step-by-step guidance when appropriate
- Adapt explanations to student understanding level
- Foster curiosity and learning enthusiasm
- Be patient with mistakes and encourage learning from errors`;

/**
 * Cloud function to generate AI assistant configuration
 */
const generateAssistant = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "https://edbotz.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    // Initialize AI instance
    const ai = initializeAI();

    console.log("Generating assistant configuration");
    console.log("Request data:", {
      hasDescription: !!data.description,
      hasFileContexts: !!(data.fileContexts && data.fileContexts.length > 0),
      hasImageContexts: !!(data.imageContexts && data.imageContexts.length > 0)
    });

    const { description, fileContexts, imageContexts } = data;

    if (!description || !description.trim()) {
      throw new Error('Assistant description is required');
    }

    // Build the prompt with context
    let fullPrompt = `${ASSISTANT_GENERATION_PROMPT}

User's Description: "${description}"`;

    // Add file contexts if available
    if (fileContexts && fileContexts.length > 0) {
      fullPrompt += `

Documents Available to Assistant:
${fileContexts.map((context, i) =>
  `Document ${i + 1}:
${context}`
).join('\n\n')}

Instructions: Reference these documents in the assistant's configuration. The assistant should be aware of these resources and mention them appropriately in the instructions and first message.`;
    }

    // Add image contexts if available
    if (imageContexts && imageContexts.length > 0) {
      fullPrompt += `

Images Available to Assistant:
${imageContexts.map((context, i) =>
  `Image ${i + 1}:
${context}`
).join('\n\n')}

Instructions: Consider these visual resources when creating the assistant's configuration. The assistant should be able to reference and discuss these images with students.`;
    }

    fullPrompt += `

Generate a complete assistant configuration based on the above information. Make sure to:
1. Create an educational and supportive assistant appropriate for students
2. Include references to any provided documents or images in the instructions
3. Make the first message engaging and welcoming
4. Provide diverse and helpful message starters
5. Ensure all content is appropriate for an educational context`;

    console.log('Generating assistant configuration with Genkit...');

    // Generate structured output using the schema
    let response;
    try {
      response = await ai.generate({
        model: googleAI.model(AI_MODELS.GEMINI.FLASH), // Using FLASH for fast generation
        prompt: fullPrompt,
        output: { schema: AssistantConfigSchema },
        config: {
          temperature: 0.7, // Balanced creativity for educational content
          maxOutputTokens: 2000 // Sufficient for detailed configuration
        }
      });

      console.log('Assistant configuration generated successfully');
    } catch (schemaError) {
      console.error('Schema validation failed, trying fallback approach:', schemaError.message);

      // If structured output fails, try without schema and parse manually
      try {
        const fallbackResponse = await ai.generate({
          model: googleAI.model(AI_MODELS.GEMINI.FLASH),
          prompt: fullPrompt + '\n\nReturn a JSON object with the following fields: assistantName, instructions, firstMessage, messageStarters (array of 3-5 strings)',
          config: {
            temperature: 0.7,
            maxOutputTokens: 2000
          }
        });

        console.log('Fallback response received');

        // Try to extract JSON from the text response
        let parsedOutput = null;
        if (fallbackResponse.text) {
          try {
            // Look for JSON in the response
            const jsonMatch = fallbackResponse.text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              parsedOutput = JSON.parse(jsonMatch[0]);
              console.log('Successfully parsed JSON from fallback response');
            }
          } catch (parseError) {
            console.error('Could not parse JSON from fallback response:', parseError.message);
            throw new Error('Failed to generate valid assistant configuration');
          }
        }

        response = { output: parsedOutput };
      } catch (fallbackError) {
        console.error('Fallback generation also failed:', fallbackError.message);
        throw new Error('Failed to generate assistant configuration');
      }
    }

    // Validate and return the configuration
    const config = response.output;

    if (!config || !config.assistantName || !config.instructions || !config.firstMessage || !config.messageStarters) {
      console.error('Invalid configuration generated:', config);
      throw new Error('Generated configuration is incomplete');
    }

    // Ensure messageStarters is an array with 3-5 items
    if (!Array.isArray(config.messageStarters)) {
      config.messageStarters = ['How can you help me?', 'What topics can we discuss?', 'Can you explain this concept?'];
    } else if (config.messageStarters.length < 3) {
      // Add default starters if too few
      const defaults = ['How can you help me?', 'What topics can we discuss?', 'Can you explain this concept?'];
      while (config.messageStarters.length < 3) {
        config.messageStarters.push(defaults[config.messageStarters.length]);
      }
    } else if (config.messageStarters.length > 5) {
      // Trim to 5 if too many
      config.messageStarters = config.messageStarters.slice(0, 5);
    }

    console.log('Assistant configuration complete:', {
      assistantName: config.assistantName,
      instructionsLength: config.instructions.length,
      firstMessageLength: config.firstMessage.length,
      messageStartersCount: config.messageStarters.length
    });

    return {
      success: true,
      config: {
        assistantName: config.assistantName,
        instructions: config.instructions,
        firstMessage: config.firstMessage,
        messageStarters: config.messageStarters
      }
    };

  } catch (error) {
    console.error('Error generating assistant configuration:', error);

    return {
      success: false,
      error: error.message || 'Failed to generate assistant configuration',
      config: null
    };
  }
});

module.exports = {
  generateAssistant
};