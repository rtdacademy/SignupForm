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

// Define specialized educational agents for different question states
const preAnswerTutorAgent = ai.definePrompt({
  name: 'preAnswerTutor',
  description: 'Guides students using Socratic method before they answer questions',
  system: `You are an educational AI tutor helping a student with a physics question. The student has NOT yet answered this question.

CRITICAL RULES:
- NEVER directly provide the answer or indicate which option is correct
- NEVER say things like "the answer is" or "option A is correct"
- Use the Socratic method - ask guiding questions to help them think through the problem
- Help them understand the concepts and principles needed to solve the problem
- Encourage them to work through the problem step by step
- If they ask for the answer directly, politely remind them that you're here to help them learn by guiding their thinking
- Ask questions about what they understand, what forces or principles might be involved, or how they might approach the problem
- Be encouraging and supportive while maintaining the educational goal of guided discovery`
});

const postAnswerTutorAgent = ai.definePrompt({
  name: 'postAnswerTutor', 
  description: 'Discusses answers and provides explanations after student attempts question',
  system: `You are an educational AI tutor helping a student with a physics question. The student has already attempted this question.

You have access to their submission details and can reference them directly in your responses. The specific details will be provided in the system instruction.

You can now freely:
- Reference their specific answer choice by letter (A, B, C, D) and explain why it was right/wrong
- Discuss why the correct answer is right and explain the reasoning
- Explain why incorrect answers are wrong and address common misconceptions
- Provide detailed explanations of the underlying physics concepts
- Give additional examples to reinforce understanding
- Help them understand how to approach similar problems in the future
- Celebrate their success if they got it right, or help them learn from mistakes if they got it wrong
- Be encouraging and focus on learning and understanding

Always reference their specific answer when relevant to make the conversation personal and educational.`
});

const transitionAgent = ai.definePrompt({
  name: 'transitionAgent',
  description: 'Handles transitions when student moves from pre-answer to post-answer state',
  system: `You are an educational AI tutor handling the moment when a student has just submitted their answer to a physics question.

The student's submission details will be provided in the system instruction.

Your role:
- Acknowledge their specific answer choice (e.g., "I see you selected option D") in an encouraging way
- Provide a brief, natural transition that recognizes they've now answered
- Then seamlessly move into discussing why their answer was right/wrong and explaining the concepts
- Keep the transition smooth and supportive - don't make it feel like you're switching personalities
- Be positive regardless of whether they got it right or wrong
- Reference their actual selection to make it personal and relevant
- Focus on the learning opportunity this creates`
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
    
    // Extract question state information from context (following Genkit best practices)
    const questionState = context?.questionState || {};
    const isContextUpdate = questionState.isContextUpdate || false;
    const questionStatus = isContextUpdate ? (questionState.newStatus || 'attempted') : (questionState.status || 'active');
    const hasAttempted = questionState.lastSubmission || questionStatus === 'attempted' || questionState.hasAttempted;
    const previousStatus = questionState.previousStatus;
    
    // Log state detection for debugging
    console.log('Question state detection:', {
      isContextUpdate,
      questionStatus,
      hasAttempted,
      previousStatus,
      contextKeys: Object.keys(context || {}),
      questionStateKeys: Object.keys(questionState || {}),
      lastSubmission: questionState.lastSubmission ? {
        selectedAnswer: questionState.lastSubmission.selectedAnswer,
        isCorrect: questionState.lastSubmission.isCorrect,
        correctOptionId: questionState.lastSubmission.correctOptionId
      } : null
    });
    
    // Select appropriate agent based on state
    let selectedAgent;
    let agentName;
    
    if (isContextUpdate && (previousStatus !== questionStatus || previousStatus === 'active')) {
      // This is a transition from unanswered to answered
      selectedAgent = transitionAgent;
      agentName = 'transitionAgent';
      console.log(`🔄 Using transition agent for status change: ${previousStatus} → ${questionStatus}`);
    } else if (hasAttempted) {
      // Student has attempted the question - use post-answer agent
      selectedAgent = postAnswerTutorAgent;
      agentName = 'postAnswerTutor';
      console.log('Using post-answer tutor agent (student has attempted question)');
    } else {
      // Student hasn't answered yet - use pre-answer agent
      selectedAgent = preAnswerTutorAgent;
      agentName = 'preAnswerTutor';
      console.log('Using pre-answer tutor agent (student has not yet answered)');
    }
    
    // Prepare the system instruction with educational context
    // Always use the agent system when we have questionState context
    let effectiveSystemInstruction = (context?.questionState) ? selectedAgent.system : (systemInstruction || selectedAgent.system);
    
    // Add question-specific information to system instruction (not context)
    if (context?.sessionInfo) {
      // For pre-answer agent, include topic info
      if (!questionState.lastSubmission) {
        const topicInfo = `

CURRENT QUESTION CONTEXT:
- Course: ${context.sessionInfo.courseId}
- Topic: ${context.sessionInfo.topic}
- Student has NOT yet answered this question
- Use Socratic method to guide their thinking

IMPORTANT: Help guide the student's thinking about ${context.sessionInfo.topic} concepts without giving away the answer.`;
        
        effectiveSystemInstruction += topicInfo;
        console.log('Enhanced system instruction for pre-answer scenario');
      }
    }
    
    // Add detailed submission information for post-answer scenarios
    if (questionState.lastSubmission && context?.sessionInfo) {
      const answerDetails = questionState.answerDetails || {};
      const questionInfo = `

CURRENT QUESTION CONTEXT:
- Course: ${context.sessionInfo.courseId}
- Topic: ${context.sessionInfo.topic}
- Student selected: Option ${questionState.lastSubmission.selectedAnswer?.toUpperCase()} - "${answerDetails.studentAnswerText || 'Unknown option'}"
- Result: ${questionState.lastSubmission.isCorrect ? 'CORRECT' : 'INCORRECT'}
- Correct answer: Option ${questionState.lastSubmission.correctOptionId?.toUpperCase()} - "${answerDetails.correctAnswerText || 'Unknown option'}"
- Feedback given: "${questionState.lastSubmission.feedback}"

IMPORTANT: Use these SPECIFIC details in your response. Reference "Option ${questionState.lastSubmission.selectedAnswer?.toUpperCase()}" and "Option ${questionState.lastSubmission.correctOptionId?.toUpperCase()}" directly.`;
      
      effectiveSystemInstruction += questionInfo;
      
      console.log('Enhanced system instruction with question details:', {
        selectedAnswer: questionState.lastSubmission.selectedAnswer,
        correctAnswer: questionState.lastSubmission.correctOptionId,
        studentText: answerDetails.studentAnswerText,
        correctText: answerDetails.correctAnswerText
      });
    }
    
    // Log the final effective system instruction for debugging
    console.log('Final effective system instruction preview:', effectiveSystemInstruction.substring(0, 200) + '...');
    
    // Check if we have an existing chat session
    if (sessionId && activeChatSessions.has(sessionId)) {
      const existingChat = activeChatSessions.get(sessionId);
      
      // Always create new chat when using agent system if agent has changed or we have questionState
      if (isContextUpdate || 
          agentName !== existingChat.lastAgentUsed || 
          (context?.questionState && !existingChat.lastAgentUsed)) {
        
        console.log(`🔄 Creating new chat for agent switch from ${existingChat.lastAgentUsed || 'none'} to ${agentName}`);
        
        // Create new chat with the selected agent and enhanced system instruction
        chat = ai.chat({
          model: googleAI.model(model),
          system: effectiveSystemInstruction,
          config: {
            temperature: 0.7
          },
          context: context
        });
        
        // Store the agent name for future reference
        chat.lastAgentUsed = agentName;
        activeChatSessions.set(sessionId, chat);
      } else {
        chat = existingChat;
        console.log(`Using existing chat session: ${sessionId} with agent: ${agentName}`);
      }
    } else {
      // Create a new session with the appropriate agent
      console.log(`Creating new chat session with agent: ${agentName}`);
      
      // Create a chat using the enhanced system instruction
      chat = ai.chat({
        model: googleAI.model(model),
        system: effectiveSystemInstruction,
        config: {
          temperature: 0.7 // Balanced temperature for natural responses
        },
        context: context // Pass the context to the chat
      });
      
      // Store the agent name for future reference
      chat.lastAgentUsed = agentName;
      
      console.log("Chat initialized with specialized agent");
      
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
      sessionId: currentSessionId, // Return the session ID so client can maintain the conversation
      agentUsed: agentName, // For debugging and logging
      questionStatus: questionStatus, // Echo back the detected status
      isTransition: isContextUpdate // Indicate if this was a transition response
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