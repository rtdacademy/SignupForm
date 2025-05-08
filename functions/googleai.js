// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Environment variables should be set in Firebase Cloud Functions
// Try to get the API key from different sources
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Safe JSON stringifying to handle circular references
const safeStringify = (obj) => {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }
    return value;
  });
};

/**
 * Cloud function to proxy requests to Google AI's Gemini model
 * This keeps the API key secure on the server side
 */
const generateContent = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  // Data is in request.data for V2 functions
  const data = request.data;

  try {
    // Log the incoming data for debugging (safely)
    console.log("Received data:", safeStringify(data));
    
    const { 
      prompt, 
      model = 'gemini-1.5-flash',
      options = {} 
    } = data;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log(`Processing prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

    // Initialize the Google AI client - updated to use the correct constructor
    const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
    
    // Generate content
    const response = await genAI.models.generateContent({
      model: model,
      contents: prompt
    });
    
    return {
      text: response.text,
    };
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error(`An error occurred while generating content: ${error.message}`);
  }
});

/**
 * Create a chat session with history
 */
const startChatSession = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    console.log("Starting chat session with data:", safeStringify(data));
    
    const { 
      history = [], 
      model = 'gemini-1.5-flash',
      systemInstruction = null
    } = data;

    // Initialize the Google AI client - updated to use the correct constructor
    const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
    const chat = genAI.chats.create({
      model: model,
      history: history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      systemInstruction: systemInstruction ? { text: systemInstruction } : undefined
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
    throw new Error(`An error occurred while starting the chat session: ${error.message}`);
  }
});

/**
 * Send a message to an existing chat session
 */
const sendChatMessage = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    // Log the incoming data but safely handle circular references
    console.log("Received chat message data:", safeStringify(data));
    
    const { 
      message, 
      history = [],
      model = 'gemini-1.5-flash',
      systemInstruction = null,
      streaming = false
    } = data;

    if (!message) {
      console.error("Message is missing or empty in the request data");
      throw new Error('Message is required');
    }
    
    console.log(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Initialize the Google AI client - updated to use the correct constructor
    const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
    
    // Create a chat session
    const chat = genAI.chats.create({
      model: model,
      history: history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      })),
      systemInstruction: systemInstruction ? { text: systemInstruction } : undefined
    });

    // Send the message - with streaming or without based on the request
    if (streaming) {
      // NOTE: Firebase Functions v2 doesn't support true streaming responses.
      // This is a workaround to simulate streaming by collecting all chunks.
      const streamingResponse = await chat.sendMessageStream({message: message});
      
      // Collect all chunks
      let completeResponse = '';
      for await (const chunk of streamingResponse) {
        completeResponse += chunk.text || '';
      }
      
      return {
        text: completeResponse,
        streaming: true
      };
    } else {
      // Regular non-streaming response
      const response = await chat.sendMessage({message: message});
      
      return {
        text: response.text,
        streaming: false
      };
    }
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error(`An error occurred while sending the message: ${error.message}`);
  }
});

module.exports = {
  generateContent,
  startChatSession,
  sendChatMessage
};