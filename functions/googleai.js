const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/genai');

// Environment variables should be set in Firebase Cloud Functions
// See: https://firebase.google.com/docs/functions/config-env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

/**
 * Cloud function to proxy requests to Google AI's Gemini model
 * This keeps the API key secure on the server side
 */
exports.generateContent = functions.https.onCall(async (data, context) => {
  // Verify Firebase Auth (optional but recommended)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to access this service.'
    );
  }

  try {
    const { prompt, model = 'gemini-2.0-flash-001', options = {} } = data;

    if (!prompt) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Prompt is required'
      );
    }

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const geminiModel = genAI.models.getGenerativeModel({ model });

    // Generate content
    const result = await geminiModel.generateContent(prompt);
    const response = result.response;
    
    return {
      text: response.text(),
      // Can include other metadata as needed
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while generating content.',
      error.message
    );
  }
});

/**
 * Create a chat session with history
 */
exports.startChatSession = functions.https.onCall(async (data, context) => {
  // Verify Firebase Auth (optional but recommended)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to access this service.'
    );
  }

  try {
    const { 
      history = [], 
      model = 'gemini-2.0-flash-001',
      systemInstruction = null
    } = data;

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Set up the model configuration
    const modelConfig = {
      model,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    // Add system instructions if provided
    if (systemInstruction) {
      modelConfig.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const geminiModel = genAI.models.getGenerativeModel(modelConfig);
    
    // Initialize chat
    const chat = geminiModel.startChat({
      history: history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
    });

    // Generate a session ID
    const sessionId = Date.now().toString();
    
    return {
      success: true,
      sessionId,
      message: 'Chat session initialized'
    };
  } catch (error) {
    console.error('Error starting chat session:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while starting the chat session.',
      error.message
    );
  }
});

/**
 * Send a message to an existing chat session
 */
exports.sendChatMessage = functions.https.onCall(async (data, context) => {
  // Verify Firebase Auth (optional but recommended)
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Authentication required to access this service.'
    );
  }

  try {
    const { 
      message, 
      history = [],
      model = 'gemini-2.0-flash-001',
      systemInstruction = null
    } = data;

    if (!message) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        'Message is required'
      );
    }

    // Initialize the Google AI client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // Set up the model configuration
    const modelConfig = {
      model,
      generationConfig: {
        temperature: 0.9,
        topP: 0.95,
        topK: 64,
        maxOutputTokens: 8192,
      },
      safetySettings: [
        {
          category: 'HARM_CATEGORY_HATE_SPEECH',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        },
        {
          category: 'HARM_CATEGORY_HARASSMENT',
          threshold: 'BLOCK_MEDIUM_AND_ABOVE'
        }
      ]
    };

    // Add system instructions if provided
    if (systemInstruction) {
      modelConfig.systemInstruction = {
        parts: [{ text: systemInstruction }]
      };
    }

    const geminiModel = genAI.models.getGenerativeModel(modelConfig);
    
    // Initialize chat with history
    const chat = geminiModel.startChat({
      history: history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
    });

    // Send the message
    const result = await chat.sendMessage(message);
    const response = await result.response;
    
    return {
      text: response.text()
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while sending the message.',
      error.message
    );
  }
});