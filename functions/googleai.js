// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { genkit } = require('genkit/beta'); // Beta package is needed for chat
const { googleAI } = require('@genkit-ai/googleai');
const fetch = require('node-fetch');
const AI_MODELS = require('./aiSettings');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Environment variables should be set in Firebase Cloud Functions
// Try to get the API key from different sources
//const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Configure genkit with Google AI plugin
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model(AI_MODELS.ACTIVE_CHAT_MODEL), // Use active model from settings
});

// Store active chat instances by session ID
// In production, you'd want to use a persistent store like Firestore
const activeChatSessions = new Map();

// Store pre-initialized context for each session
const sessionContexts = new Map();

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
 * Extract YouTube video ID from various YouTube URL formats
 */
const extractYouTubeVideoId = (url) => {
  if (!url) return null;
  
  // Regular expression to match YouTube video IDs from various URL formats
  const regExp = /^.*(?:(?:youtu\.be\/|v\/|vi\/|u\/\w\/|embed\/|shorts\/)|(?:(?:watch)?\?v(?:i)?=|&v(?:i)?=))([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[1].length === 11) ? match[1] : null;
};

/**
 * Convert YouTube video ID to a proper YouTube video URL for embedding
 */
const getYouTubeVideoUrl = (videoId) => {
  if (!videoId) return null;
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Determine content type from file extension or MIME type
 */
const getContentType = (fileType, fileName) => {
  // First, check if we already have a MIME type
  if (fileType && fileType.includes('/')) {
    return fileType;
  }
  
  // Otherwise, try to determine from file extension
  if (fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const contentTypeMap = {
      // Documents
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'rtf': 'application/rtf',
      'odt': 'application/vnd.oasis.opendocument.text',
      
      // Spreadsheets
      'csv': 'text/csv',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'ods': 'application/vnd.oasis.opendocument.spreadsheet',
      
      // Presentations
      'ppt': 'application/vnd.ms-powerpoint',
      'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'odp': 'application/vnd.oasis.opendocument.presentation',
      
      // Images
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml',
      'bmp': 'image/bmp',
      
      // Audio
      'mp3': 'audio/mpeg',
      'wav': 'audio/wav',
      'ogg': 'audio/ogg',
      
      // Video
      'mp4': 'video/mp4',
      'webm': 'video/webm',
      'avi': 'video/x-msvideo',
      'mov': 'video/quicktime',
      
      // Code files
      'js': 'text/javascript',
      'html': 'text/html',
      'css': 'text/css',
      'json': 'application/json',
      'xml': 'application/xml',
    };
    
    return contentTypeMap[extension] || 'application/octet-stream';
  }
  
  return 'application/octet-stream'; // Default binary data
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
      model = AI_MODELS.DEFAULT_CHAT_MODEL,
      options = {} 
    } = data;

    if (!prompt) {
      throw new Error('Prompt is required');
    }

    console.log(`Processing prompt: "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}"`);

    // Generate content using genkit
    const { text } = await ai.generate({
      model: googleAI.model(model),
      prompt: prompt,
      config: options
    });
    
    return {
      text: text,
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
      model = AI_MODELS.DEFAULT_CHAT_MODEL,
      systemInstruction = null
    } = data;

    // With genkit we don't need to create a session explicitly
    // as it's handled by the sendChatMessage function
    
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
 * Process multimodal content for sending to the model
 * Supports text, images (as data URLs or https URLs), documents, and YouTube videos
 */
const processMultimodalContent = async (message, mediaItems = []) => {
  // If no media items, just return text prompt
  if (!mediaItems || mediaItems.length === 0) {
    return message;
  }

  // Create multimodal prompt format
  const promptParts = [];
  
  // Process each media item
  for (const media of mediaItems) {
    if (media.type === 'youtube') {
      // For YouTube videos, we extract the video ID and use the proper video URL
      const videoId = extractYouTubeVideoId(media.url);
      if (videoId) {
        // Properly formatted YouTube URL
        const youtubeUrl = getYouTubeVideoUrl(videoId);
        
        // Add as video media with proper content type instead of just the thumbnail
        promptParts.push({
          media: { 
            url: youtubeUrl,
            contentType: "video/mp4"  // Specify this is a video
          }
        });
      }
    } else if (media.type === 'document') {
      // Handle document files
      promptParts.push({
        media: { 
          url: media.url,
          contentType: getContentType(media.mimeType, media.name) 
        }
      });
      
      // Add context about the document if available
      if (media.name) {
        promptParts.push({
          text: `[This is a document file: ${media.name}]`
        });
      }
    } else if ((media.type === 'image' || media.type === 'file') && media.url) {
      // Standard image handling or generic file
      promptParts.push({
        media: { 
          url: media.url,
          contentType: media.mimeType || getContentType(null, media.name)
        }
      });
    }
  }
  
  // Add main text content
  if (message) {
    promptParts.push({ text: message });
  }
  
  return promptParts;
};

/**
 * Send a message to an existing chat session
 */
const sendChatMessage = onCall({
  concurrency: 10,
  memory: '2GiB', // Increased memory for video and document processing
  timeoutSeconds: 120, // Increased timeout for video and document processing
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"]
}, async (request) => {
  const data = request.data;

  try {
    // Log the incoming data but safely handle circular references
    console.log("Received chat message data:", safeStringify(data));
    
    const { 
      message, 
      model = AI_MODELS.DEFAULT_CHAT_MODEL,
      systemInstruction = null,
      streaming = false,
      mediaItems = [],  // Media items including images, documents, and YouTube URLs
      sessionId = null,  // Session ID for persistent chat
      context = null  // Context object for Genkit API
    } = data;

    // Validate input
    if (!message && (!mediaItems || mediaItems.length === 0)) {
      console.error("Neither message nor media items provided in the request data");
      throw new Error('Either message or media items are required');
    }
    
    if (message) {
      console.log(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);
    }
    
    if (mediaItems && mediaItems.length > 0) {
      console.log(`Processing ${mediaItems.length} media items`);
      mediaItems.forEach((item, index) => {
        console.log(`Media item ${index + 1}: type=${item.type}, name=${item.name || 'unknown'}, url=${item.url?.substring(0, 50)}...`);
      });
    }

    // Process multimodal content (text + images + documents + YouTube)
    // Make sure mediaItems is always an array, even if it's undefined
    const safeMediaItems = Array.isArray(mediaItems) ? mediaItems : [];
    const prompt = await processMultimodalContent(message, safeMediaItems);
    console.log("Processed prompt:", safeStringify(prompt));
    
    // Log context if provided
    if (context) {
      console.log("Context provided:", safeStringify(context));
    }
    
    // Simply log if context is provided
    if (context) {
      console.log("Using context as provided in Genkit documentation");
    }

    let chat;
    let currentSessionId = sessionId;
    
    // Prepare the system instruction with clear guidance about the greeting
    const effectiveSystemInstruction = systemInstruction || 
      `You are a helpful AI assistant. The user has already seen an initial greeting message from you in the chat interface that said: "Hello! I'm your AI assistant. I can help you with a variety of tasks. Would you like to: hear a joke, learn about a topic, or get help with a question? Just let me know how I can assist you today!" DO NOT repeat this greeting or reference it directly - continue the conversation naturally as if you've already exchanged that first message.`;
    
    // Check if we have an existing chat session
    if (sessionId && activeChatSessions.has(sessionId)) {
      chat = activeChatSessions.get(sessionId);
      console.log(`Using existing chat session: ${sessionId}`);
    } else {
      // Create a new session
      // Session creation is not needed with the new format
      
      // Create a chat with the correct format for Gemini 2.0
      chat = ai.chat({
        model: googleAI.model(model),
        system: effectiveSystemInstruction,
        config: {
          temperature: 0.7 // Balanced temperature for natural responses
        },
        context: context // Pass the context to the chat
      });
      
      console.log("Chat initialized with system instruction");
      
      // Generate a new session ID for tracking
      currentSessionId = Date.now().toString();
      activeChatSessions.set(currentSessionId, chat);
      console.log(`Created new chat session: ${currentSessionId}`);
    }

    // Simple pass-through function - don't modify the table at all
    const fixMarkdownTables = (text) => {
      // Just remove blockquote markers (>) from the text, as these can interfere with markdown parsing
      return text.replace(/^>\s*/gm, '').replace(/\n>\s*/g, '\n');
    };
    
    // Now send the actual current message with media
    let responseText;
    try {
      if (streaming) {
        // Firebase Functions v2 doesn't support true streaming responses.
        // This is a workaround to simulate streaming by collecting all chunks.
        const { response, stream } = await chat.sendStream(prompt);
        
        // Collect all chunks
        let completeResponse = '';
        for await (const chunk of stream) {
          completeResponse += chunk.text || '';
        }
        
        // Log the raw streaming response for debugging
        console.log('=== RAW STREAMING AI RESPONSE START ===');
        console.log(completeResponse);
        console.log('=== RAW STREAMING AI RESPONSE END ===');
        
        // Format the response before sending back
        responseText = fixMarkdownTables(completeResponse);
      } else {
        // Regular non-streaming response
        const { text } = await chat.send(prompt);
        
        // Log the raw response for debugging
        console.log('=== RAW AI RESPONSE START ===');
        console.log(text);
        console.log('=== RAW AI RESPONSE END ===');
        
        // Format the response before sending back
        responseText = fixMarkdownTables(text);
      }
    } catch (err) {
      console.error("Error during chat message processing:", err);
      // If we can't process the message with the existing chat, try creating a new one
      if (sessionId) {
        console.log("Chat session error - creating new session");
        
        // Session creation is not needed with the new format
        
        // This code is no longer needed with the new approach
        
        // Create a chat with the correct format for Gemini 2.0
        chat = ai.chat({
          model: googleAI.model(model),
          system: effectiveSystemInstruction,
          config: {
            temperature: 0.7 // Balanced temperature for natural responses
          },
          context: context // Pass the context to the chat in recovery path
        });
        
        currentSessionId = Date.now().toString();
        activeChatSessions.set(currentSessionId, chat);
        
        // Try sending just the current message without history
        const { text } = await chat.send(prompt);
        
        // Log the raw response for debugging in recovery path
        console.log('=== RAW RECOVERY AI RESPONSE START ===');
        console.log(text);
        console.log('=== RAW RECOVERY AI RESPONSE END ===');
        
        // Format the response before sending back
        responseText = fixMarkdownTables(text);
      } else {
        throw err; // Re-throw if we can't recover
      }
    }
    
    // Update the last activity time for this chat session
    chat.lastActivityTime = Date.now();
    
    // Periodically clean up old chat sessions to prevent memory leaks
    // In a production environment, you'd use a more persistent storage
    const cleanupOldSessions = () => {
      const now = Date.now();
      const ONE_HOUR = 60 * 60 * 1000;
      
      for (const [id, chatSession] of activeChatSessions.entries()) {
        if (chatSession.lastActivityTime && (now - chatSession.lastActivityTime > ONE_HOUR)) {
          console.log(`Removing inactive chat session: ${id}`);
          activeChatSessions.delete(id);
        }
      }
    };
    
    // Clean up occasionally - don't wait for it to complete
    if (Math.random() < 0.1) { // 10% chance on each call
      setTimeout(cleanupOldSessions, 0);
    }
    
    // Log raw table information to help with debugging
    if (responseText.includes('|')) {
      console.log('=== TABLE DEBUGGING INFO ===');
      console.log('Table detected in response');
      const tableLines = responseText.split('\n').filter(line => line.includes('|'));
      console.log(`Table has ${tableLines.length} lines`);
      console.log('First few table lines:');
      tableLines.slice(0, 3).forEach((line, i) => console.log(`${i}: ${line}`));
    }
    
    return {
      text: responseText,
      streaming: streaming,
      sessionId: currentSessionId // Return the session ID so client can maintain the conversation
    };
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