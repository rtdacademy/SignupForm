// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { genkit } = require('genkit'); // Using stable genkit package
const { googleAI } = require('@genkit-ai/googleai');
const fetch = require('node-fetch');
const AI_MODELS = require('./aiSettings');

/**
 * Resolve AI settings from keys to actual values
 */
const resolveAISettings = (aiModel, aiTemperature, aiMaxTokens) => {
  // Resolve model name
  let resolvedModel = AI_MODELS.DEFAULT_CHAT_MODEL;
  
  // Handle GEMINI sub-models
  if (AI_MODELS.GEMINI[aiModel]) {
    resolvedModel = AI_MODELS.GEMINI[aiModel];
  }
  // Handle top-level model keys
  else if (AI_MODELS[aiModel]) {
    resolvedModel = AI_MODELS[aiModel];
  }
  // Validate if it's already a full model name
  else if (Object.values(AI_MODELS.GEMINI).includes(aiModel) || 
           [AI_MODELS.DEFAULT_CHAT_MODEL, AI_MODELS.DEFAULT_IMAGE_GENERATION_MODEL, AI_MODELS.ACTIVE_CHAT_MODEL].includes(aiModel)) {
    resolvedModel = aiModel;
  }
  else {
    console.warn(`Unknown AI model key: ${aiModel}, using default`);
  }
  
  // Resolve temperature
  const resolvedTemperature = AI_MODELS.TEMPERATURE[aiTemperature] || 0.7;
  
  // Resolve max tokens
  const resolvedMaxTokens = AI_MODELS.MAX_TOKENS[aiMaxTokens] || 1000;
  
  // Validate settings are allowed
  const isModelAllowed = AI_MODELS.ALLOWED_MODELS.includes(aiModel) || aiModel === 'DEFAULT_CHAT_MODEL';
  const isTemperatureAllowed = AI_MODELS.ALLOWED_TEMPERATURES.includes(aiTemperature);
  const isMaxTokensAllowed = AI_MODELS.ALLOWED_MAX_TOKENS.includes(aiMaxTokens);
  
  if (!isModelAllowed) {
    console.warn(`Model ${aiModel} not in allowed list, using default`);
    resolvedModel = AI_MODELS.DEFAULT_CHAT_MODEL;
  }
  
  if (!isTemperatureAllowed) {
    console.warn(`Temperature ${aiTemperature} not in allowed list, using BALANCED`);
  }
  
  if (!isMaxTokensAllowed) {
    console.warn(`MaxTokens ${aiMaxTokens} not in allowed list, using MEDIUM`);
  }
  
  console.log(`Resolved AI settings: model=${resolvedModel}, temperature=${resolvedTemperature}, maxTokens=${resolvedMaxTokens}`);
  
  return {
    model: resolvedModel,
    temperature: resolvedTemperature,
    maxTokens: resolvedMaxTokens
  };
};

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Lazy initialization of AI instance to avoid timeouts during deployment
let aiInstance = null;

function initializeAI() {
  if (!aiInstance) {
    aiInstance = genkit({
      plugins: [googleAI()], // No need to pass API key - Genkit reads from environment
      model: googleAI.model('gemini-2.5-flash'), // Use stable model
    });
  }
  return aiInstance;
}

// Default AI assistant system instruction
const DEFAULT_SYSTEM_INSTRUCTION = `You are a helpful AI assistant specialized in education and learning. Your role is to:

- Help students understand concepts clearly and thoroughly
- Guide them through problem-solving step by step
- Encourage critical thinking and deep understanding
- Provide clear explanations using appropriate terminology
- Be patient, supportive, and encouraging
- Adapt your explanations to the student's level of understanding

Always focus on helping students learn rather than just providing answers.`;

// Removed session management - keeping it simple

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
    // Initialize AI instance - Genkit reads API key from environment
    const ai = initializeAI();
    
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
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"],
}, async (request) => {
  const data = request.data;

  try {
    // Initialize AI instance - Genkit reads API key from environment
    const ai = initializeAI();
    
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
 * Returns a string for text-only or properly formatted content for multimodal
 */
const processMultimodalContent = async (message, mediaItems = []) => {
  // If no media items, just return the text message as a string
  if (!mediaItems || mediaItems.length === 0) {
    return message || '';
  }

  // For multimodal content, create content parts without any role properties
  const contentParts = [];
  
  // Add the text message first if it exists
  if (message && message.trim()) {
    contentParts.push({ text: message });
  }
  
  // Process each media item and add to content parts
  for (const media of mediaItems) {
    if (media.type === 'youtube') {
      // For YouTube videos, we extract the video ID and use the proper video URL
      const videoId = extractYouTubeVideoId(media.url);
      if (videoId) {
        // Properly formatted YouTube URL
        const youtubeUrl = getYouTubeVideoUrl(videoId);
        
        // Add as video media with proper content type
        contentParts.push({
          media: { 
            url: youtubeUrl,
            contentType: "video/mp4"
          }
        });
      }
    } else if (media.type === 'document') {
      // Handle document files
      contentParts.push({
        media: { 
          url: media.url,
          contentType: getContentType(media.mimeType, media.name) 
        }
      });
      
      // Add context about the document if available
      if (media.name) {
        contentParts.push({
          text: `[Document: ${media.name}]`
        });
      }
    } else if ((media.type === 'image' || media.type === 'file') && media.url) {
      // Standard image handling or generic file
      contentParts.push({
        media: { 
          url: media.url,
          contentType: media.mimeType || getContentType(null, media.name)
        }
      });
    }
  }
  
  // Return the content parts array directly for Genkit multimodal messages
  // Genkit expects just the content parts array, not wrapped in a message object
  return contentParts;
};

/**
 * Chat message function using stable ai.generate() with multi-turn conversations
 */
const sendChatMessage = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "http://localhost:3000"],
}, async (request, response) => {
  const data = request.data;

  try {
    // Initialize AI instance
    const ai = initializeAI();
    
    console.log("Received chat message:", data.message);
    
    const { 
      message,
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
      streaming = false,
      messages = [], // Previous conversation history
      aiModel = 'FLASH', // Default to FLASH model
      aiTemperature = 'BALANCED', // Default to balanced temperature
      aiMaxTokens = 'MEDIUM' // Default to medium response length
    } = data;

    if (!message) {
      throw new Error('Message is required');
    }
    
    // Resolve AI settings from the request
    const resolvedSettings = resolveAISettings(aiModel, aiTemperature, aiMaxTokens);
    console.log('🎯 Resolved AI Settings:', resolvedSettings);
    
    // Log system instruction details
    console.log('🤖 System Instruction being used:');
    console.log('Length:', systemInstruction ? systemInstruction.length : 0, 'characters');
    console.log('Full text:', systemInstruction || 'None');
    console.log('Is using default?', systemInstruction === DEFAULT_SYSTEM_INSTRUCTION);
    
    // Simple approach: if no conversation history, use system + prompt
    // If there is history, include it as messages
    console.log('Sending message to AI with conversation history...');
    console.log('Previous messages count:', messages.length);
    
    if (streaming) {
      // Use streaming for real-time response
      console.log('Using streaming mode...');
      
      let generateParams;
      
      if (messages.length === 0) {
        // First message - use system + prompt approach
        console.log('✅ STREAMING: First message - Using system instruction with prompt');
        console.log('System instruction will be applied:', !!systemInstruction);
        
        generateParams = {
          model: googleAI.model(resolvedSettings.model),
          system: systemInstruction,
          prompt: message,
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      } else {
        // Subsequent messages - use messages array approach
        console.log('📚 STREAMING: Subsequent message - Using conversation history');
        console.log('⚠️ STREAMING: System instruction NOT being applied to this message');
        
        // Ensure conversation starts with user message
        const conversationMessages = messages.map(msg => ({
          role: msg.role,
          content: [{ text: msg.content }] // Convert string to array format
        }));
        
        // Add current user message
        conversationMessages.push({ role: 'user', content: [{ text: message }] });
        
        // Ensure first message is from user - if not, we need to restructure
        if (conversationMessages.length > 0 && conversationMessages[0].role !== 'user') {
          // Find first user message and move it to the front, or create a dummy user message
          const firstUserIndex = conversationMessages.findIndex(msg => msg.role === 'user');
          if (firstUserIndex > 0) {
            // Move first user message to the beginning
            const firstUserMsg = conversationMessages.splice(firstUserIndex, 1)[0];
            conversationMessages.unshift(firstUserMsg);
          }
        }
        
        generateParams = {
          model: googleAI.model(resolvedSettings.model),
          messages: conversationMessages,
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      }
      
      console.log('Generate params:', JSON.stringify(generateParams, null, 2));
      
      const { stream, response } = ai.generateStream(generateParams);
      
      let fullText = '';
      let streamingFailed = false;
      let chunkCount = 0;
      
      try {
        // Try to stream the response
        for await (const chunk of stream) {
          if (chunk.text) {
            fullText += chunk.text;
            chunkCount++;
            
            // Send chunk immediately to clients that support streaming
            // Check if sendChunk is available (production feature, not always in emulator)
            if (request.acceptsStreaming && typeof response.sendChunk === 'function' && process.env.FUNCTIONS_EMULATOR !== 'true') {
              try {
                response.sendChunk({
                  text: chunk.text,
                  isComplete: false,
                  chunkIndex: chunkCount
                });
              } catch (chunkError) {
                console.warn('Failed to send chunk:', chunkError.message);
                // Continue collecting for fallback
              }
            }
          }
        }
        console.log(`Streaming completed successfully. Chunks: ${chunkCount}, Length: ${fullText.length}`);
        
        // Check if response might have been truncated due to token limits
        const estimatedTokens = Math.ceil(fullText.length / 4); // Rough estimate: 1 token ≈ 4 characters
        const tokenLimit = resolvedSettings.maxTokens;
        
        if (estimatedTokens >= tokenLimit * 0.95) { // If we're within 95% of the limit
          console.warn(`Response may have been truncated. Estimated tokens: ${estimatedTokens}/${tokenLimit}`);
        }
      } catch (streamErr) {
        console.warn('Streaming failed, falling back to complete response:', streamErr.message);
        streamingFailed = true;
        // Clear any partial text since we'll get the full response
        fullText = '';
      }
      
      // If streaming failed or we got no text, wait for the complete response
      if (streamingFailed || !fullText) {
        try {
          console.log('Waiting for complete response...');
          const finalResponse = await response;
          
          if (finalResponse && finalResponse.text) {
            fullText = finalResponse.text;
            console.log(`Got complete response. Length: ${fullText.length}`);
          } else {
            throw new Error('No text in final response');
          }
        } catch (responseErr) {
          console.error('Failed to get complete response:', responseErr);
          throw new Error(`AI response failed: ${responseErr.message}`);
        }
      }
      
      // Validate we got something
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('Empty response received from AI model');
      }
      
      // Send final completion marker for streaming clients
      if (request.acceptsStreaming && typeof response.sendChunk === 'function' && process.env.FUNCTIONS_EMULATOR !== 'true') {
        try {
          response.sendChunk({
            text: '',
            isComplete: true,
            totalChunks: chunkCount,
            fullText: fullText
          });
        } catch (chunkError) {
          console.warn('Failed to send completion chunk:', chunkError.message);
        }
      }
      
      return {
        text: fullText,
        success: true,
        streaming: !streamingFailed, // Let frontend know if streaming actually worked
        fallbackUsed: streamingFailed,
        chunkCount: chunkCount
      };
    } else {
      // Use regular generate for non-streaming
      let generateParams;
      
      if (messages.length === 0) {
        // First message - use system + prompt approach
        console.log('✅ NON-STREAMING: First message - Using system instruction with prompt');
        console.log('System instruction will be applied:', !!systemInstruction);
        
        generateParams = {
          model: googleAI.model(resolvedSettings.model),
          system: systemInstruction,
          prompt: message,
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      } else {
        // Subsequent messages - use messages array approach
        console.log('📚 NON-STREAMING: Subsequent message - Using conversation history');
        console.log('⚠️ NON-STREAMING: System instruction NOT being applied to this message');
        
        // Ensure conversation starts with user message
        const conversationMessages = messages.map(msg => ({
          role: msg.role,
          content: [{ text: msg.content }] // Convert string to array format
        }));
        
        // Add current user message
        conversationMessages.push({ role: 'user', content: [{ text: message }] });
        
        // Ensure first message is from user - if not, we need to restructure
        if (conversationMessages.length > 0 && conversationMessages[0].role !== 'user') {
          // Find first user message and move it to the front, or create a dummy user message
          const firstUserIndex = conversationMessages.findIndex(msg => msg.role === 'user');
          if (firstUserIndex > 0) {
            // Move first user message to the beginning
            const firstUserMsg = conversationMessages.splice(firstUserIndex, 1)[0];
            conversationMessages.unshift(firstUserMsg);
          }
        }
        
        generateParams = {
          model: googleAI.model(resolvedSettings.model),
          messages: conversationMessages,
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      }
      
      const response = await ai.generate(generateParams);
      
      console.log('Got response:', response.text);
      
      return {
        text: response.text,
        success: true,
        streaming: false
      };
    }
  } catch (error) {
    console.error('Error in chat:', error);
    throw new Error(`Chat error: ${error.message}`);
  }
});

module.exports = {
  generateContent,
  startChatSession,
  sendChatMessage
};