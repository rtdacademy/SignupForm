// Import 2nd gen Firebase Functions
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { genkit, z } = require('genkit'); // Using stable genkit package with Zod
const { googleAI } = require('@genkit-ai/googleai');
const fetch = require('node-fetch');
const AI_MODELS = require('./aiSettings');
const { createJSXGraphVisualization } = require('./jsxgraphAgent');

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

// Define JSXGraph visualization tool
const jsxGraphTool = {
  name: 'createVisualization',
  description: 'Creates interactive visualizations using JSXGraph for mathematical concepts, physics diagrams, geometric shapes, and educational illustrations',
  inputSchema: z.object({
    description: z.string().describe('Clear description of what to visualize (e.g., "sine wave", "electric field", "triangle with angles")'),
    context: z.string().optional().describe('Additional context about the educational topic or lesson'),
    subject: z.string().optional().describe('Subject area (physics, math, geometry, etc.)')
  }),
  outputSchema: z.object({
    success: z.boolean(),
    visualization: z.object({
      title: z.string(),
      description: z.string(),
      boardConfig: z.object({}).passthrough(),
      elements: z.array(z.object({}).passthrough()),
      jsxCode: z.string()
    }),
    generatedBy: z.string()
  })
};

// Lazy initialization of AI instance to avoid timeouts during deployment
let aiInstance = null;

function initializeAI() {
  if (!aiInstance) {
    const ai = genkit({
      plugins: [googleAI()], // No need to pass API key - Genkit reads from environment
      model: googleAI.model('gemini-2.5-flash'), // Use stable model
    });

    // Define the JSXGraph tool implementation
    ai.defineTool(jsxGraphTool, async (input) => {
      try {
        console.log('🎨 ===== JSXGRAPH TOOL CALLED =====');
        console.log('🎨 Tool input received:', safeStringify(input));
        console.log('🎨 Description:', input.description);
        console.log('🎨 Context:', input.context || 'none');
        console.log('🎨 Subject:', input.subject || 'general');
        
        // Call the JSXGraph agent helper function directly
        console.log('🎨 Calling createJSXGraphVisualization...');
        const result = await createJSXGraphVisualization({
          description: input.description,
          context: input.context || '',
          subject: input.subject || 'general'
        });

        console.log('🎨 Visualization tool result:', result.success ? 'SUCCESS' : 'FAILED');
        console.log('🎨 Result structure:', {
          hasSuccess: result.hasOwnProperty('success'),
          hasVisualization: result.hasOwnProperty('visualization'),
          hasGeneratedBy: result.hasOwnProperty('generatedBy'),
          hasError: result.hasOwnProperty('error')
        });
        
        if (!result.success) {
          console.error('❌ JSXGraph agent returned failure:', result.error);
          console.error('📝 Raw response was:', result.rawResponse);
          
          // Store failed tool result too (with error info)
          currentToolResults.push(result);
          console.log(`🎨 Stored failed tool result. Total results: ${currentToolResults.length}`);
          
          // Return the result as-is since it now conforms to the expected schema
          return result;
        }
        
        console.log('✅ Visualization created successfully');
        console.log('🎨 Full result object:', safeStringify(result));
        
        // Store successful tool result for injection into response
        currentToolResults.push(result);
        console.log(`🎨 Stored tool result. Total results: ${currentToolResults.length}`);
        
        console.log('🎨 ===== TOOL CALL COMPLETE =====');
        return result;
      } catch (error) {
        console.error('❌ Visualization tool failed:', error);
        
        const errorResult = {
          success: false,
          visualization: {
            title: "Visualization Error",
            description: `Failed to create visualization: ${error.message}`,
            boardConfig: {
              boundingBox: [-5, 5, 5, -5],
              axis: true,
              grid: false,
              showCopyright: false
            },
            elements: [],
            jsxCode: "// Error creating visualization"
          },
          generatedBy: 'jsxGraphAgent',
          error: `Failed to create visualization: ${error.message}`
        };
        
        // Store error result too
        currentToolResults.push(errorResult);
        console.log(`🎨 Stored error tool result. Total results: ${currentToolResults.length}`);
        
        return errorResult;
      }
    });

    aiInstance = ai;
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
- Create interactive visualizations when they would enhance understanding

## Visualization Capabilities

You have access to a powerful visualization tool that can create interactive diagrams using JSXGraph. Use this tool when visual representations would help explain concepts:

**When to create visualizations:**
- Mathematical functions and graphs (sine waves, parabolas, exponentials)
- Geometric shapes and constructions (triangles, circles, polygons)
- Physics concepts (force vectors, electric fields, wave motion)
- Data relationships and plots
- Step-by-step geometric constructions
- Interactive demonstrations

**How to use visualizations:**
- Call the createVisualization tool with a clear description
- The tool will generate an interactive JSXGraph diagram
- When you receive the tool result, format it as a markdown code block using the exact format below
- Students can interact with draggable points and sliders

**IMPORTANT: Visualization Formatting**
When you use the createVisualization tool and it succeeds, you MUST include the tool result in your response using this exact format:

\`\`\`visualization
{insert_the_complete_tool_result_json_here}
\`\`\`

For example, if the tool returns:
{"success": true, "visualization": {"title": "Sine Wave", "description": "...", "boardConfig": {...}, "elements": [...], "jsxCode": "..."}, "generatedBy": "jsxGraphAgent"}

Include this COMPLETE JSON in a visualization code block in your response. This allows the frontend to extract and render the interactive visualization.

**Examples:**
- "Show me a sine wave" → Creates interactive sine function
- "Draw a triangle with labeled angles" → Creates geometric diagram
- "Visualize electric field lines" → Creates physics diagram

## CRITICAL: Tool Usage Rules

You have tools available but you MUST follow these rules:
- NEVER mention that you have tools or capabilities unless the user specifically asks "what tools do you have" or similar
- NEVER suggest using visualizations unless the user explicitly asks for one
- NEVER say things like "I can create", "I can visualize", "I can draw" unless directly responding to such a request
- NEVER break character to mention technical capabilities
- If asked to visualize something, just do it without mentioning the tool
- Stay completely in character and focus only on the conversation topic
- Treat your tools as invisible - use them when needed but never talk about them

Always focus on helping students learn rather than just providing answers. Use visualizations to make abstract concepts concrete and engaging.`;

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

// Global variable to track tool results for the current request
let currentToolResults = [];

// Helper function to inject tool results into AI response text
const injectToolResults = (responseText) => {
  if (!currentToolResults || currentToolResults.length === 0) {
    console.log('🔧 No tool results to inject');
    return responseText;
  }

  console.log(`🎨 Injecting ${currentToolResults.length} tool result(s) into response`);
  
  let enhancedText = responseText;
  
  // Add each tool result as a visualization markdown block
  for (const toolResult of currentToolResults) {
    if (toolResult.success && toolResult.visualization) {
      console.log(`🎨 Adding visualization: ${toolResult.visualization.title}`);
      
      const visualizationBlock = `\n\n\`\`\`visualization\n${JSON.stringify(toolResult, null, 2)}\n\`\`\``;
      enhancedText += visualizationBlock;
    }
  }
  
  console.log(`🎨 Enhanced response length: ${enhancedText.length} (was ${responseText.length})`);
  return enhancedText;
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
 * Cloud function to proxy requests to Google AI's Gemini model
 * This keeps the API key secure on the server side
 */
const generateContent = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "https://edbotz.com", "http://localhost:3000"]
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
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "https://edbotz.com", "http://localhost:3000"],
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
 * Chat message function using Genkit streaming with Firebase Functions v2 streaming
 */
const sendChatMessage = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://rtd-connect.com", "https://edbotz.com", "http://localhost:3000"],
}, async (request, firebaseResponse) => {
  const data = request.data;

  try {
    // Initialize AI instance
    const ai = initializeAI();
    
    // Clear tool results from any previous request
    currentToolResults = [];
    console.log('🔧 Cleared tool results for new request');
    
    console.log("Received chat message:", data.message);
    
    const { 
      message,
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
      streaming = false,
      messages = [], // Previous conversation history
      aiModel = 'FLASH', // Default to FLASH model
      aiTemperature = 'BALANCED', // Default to balanced temperature
      aiMaxTokens = 'MEDIUM', // Default to medium response length
      enabledTools = ['createVisualization'], // Default to visualization tool for backward compatibility
      mediaItems = [] // Media items (images, documents, videos) attached to the message
    } = data;

    if (!message) {
      throw new Error('Message is required');
    }
    
    // Process multimodal content (text + images/documents/videos)
    console.log('📎 Processing multimodal content:', {
      hasMessage: !!message,
      mediaItemsCount: mediaItems.length,
      mediaTypes: mediaItems.map(item => item.type)
    });
    
    const processedContent = await processMultimodalContent(message, mediaItems);
    console.log('📎 Processed content type:', Array.isArray(processedContent) ? 'multimodal_array' : 'text_string');
    
    // Resolve AI settings from the request
    const resolvedSettings = resolveAISettings(aiModel, aiTemperature, aiMaxTokens);
    console.log('🎯 Resolved AI Settings:', resolvedSettings);

    // Append tool usage guidelines to custom system instructions (but not to the default one)
    let finalSystemInstruction = systemInstruction;
    if (systemInstruction && systemInstruction !== DEFAULT_SYSTEM_INSTRUCTION && enabledTools.length > 0) {
      // Add tool usage guidelines to custom system instructions
      const toolGuidelines = `

## CRITICAL: Tool Usage Rules

You have tools available but you MUST follow these rules:
- NEVER mention that you have tools or capabilities unless the user specifically asks "what tools do you have" or similar
- NEVER suggest using visualizations unless the user explicitly asks for one
- NEVER say things like "I can create", "I can visualize", "I can draw" unless directly responding to such a request
- NEVER break character to mention technical capabilities
- If asked to visualize something, just do it without mentioning the tool
- Stay completely in character and focus only on the conversation topic
- Treat your tools as invisible - use them when needed but never talk about them`;

      finalSystemInstruction = systemInstruction + toolGuidelines;
    }

    // Log system instruction details
    console.log('🤖 System Instruction being used:');
    console.log('Length:', finalSystemInstruction ? finalSystemInstruction.length : 0, 'characters');
    console.log('Full text:', finalSystemInstruction || 'None');
    console.log('Is using default?', finalSystemInstruction === DEFAULT_SYSTEM_INSTRUCTION);
    
    // Simple approach: if no conversation history, use system + prompt
    // If there is history, include it as messages
    console.log('Sending message to AI with conversation history...');
    console.log('Previous messages count:', messages.length);
    
    if (streaming) {
      // Use Genkit streaming with Firebase Functions v2 streaming
      console.log('🚀 Using Genkit streaming with Firebase v2 integration...');
      
      let generateParams;
      
      if (messages.length === 0) {
        // First message - use system + prompt approach
        console.log('✅ STREAMING: First message - Using system instruction with prompt');
        console.log('System instruction will be applied:', !!systemInstruction);

        generateParams = {
          model: googleAI.model(resolvedSettings.model),
          system: finalSystemInstruction,
          prompt: processedContent, // Use processedContent instead of message for multimodal support
          tools: enabledTools, // Use dynamic tools configuration
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      } else {
        // Messages with conversation history - NO system instruction with messages
        console.log('📚 STREAMING: Message with conversation history');
        console.log('ℹ️ STREAMING: System instruction NOT applied (already set in initial message)');
        
        // Ensure conversation starts with user message
        const conversationMessages = messages.map(msg => ({
          role: msg.role,
          content: [{ text: msg.content }] // Convert string to array format
        }));

        // Note: Tools are already known to the model via the 'tools' parameter
        // No need to inject reminders that would break the assistant's persona

        // Add current user message with enhanced context for visualization requests
        let enhancedMessage = message;
        if (enabledTools.includes('createVisualization') && (message.toLowerCase().includes('draw') || 
            message.toLowerCase().includes('visualize') || 
            message.toLowerCase().includes('show') || 
            message.toLowerCase().includes('graph') ||
            message.toLowerCase().includes('sine') ||
            message.toLowerCase().includes('wave') ||
            message.toLowerCase().includes('plot'))) {
          enhancedMessage = `${message}\n\n[Note: If this is a request for a visualization, diagram, or graph, please use the createVisualization tool to create an interactive JSXGraph visualization.]`;
        }
        
        // Handle multimodal content for current message
        let currentMessageContent;
        if (Array.isArray(processedContent)) {
          // Multimodal content - replace text content with enhanced message
          currentMessageContent = processedContent.map(part => 
            part.text ? { text: enhancedMessage } : part
          );
        } else {
          // Text-only content
          currentMessageContent = [{ text: enhancedMessage }];
        }
        
        conversationMessages.push({ role: 'user', content: currentMessageContent });
        
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
          // NO system parameter when using messages - it was set in the first message
          messages: conversationMessages,
          tools: enabledTools, // Use dynamic tools configuration
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      }
      
      console.log('Generate params:', JSON.stringify(generateParams, null, 2));
      console.log('🔧 Tools enabled in streaming mode:', generateParams.tools);
      
      // Use Genkit's generateStream - following the official documentation
      console.log('🎯 About to call ai.generateStream with tools...');
      const { stream, response: genkitResponse } = ai.generateStream(generateParams);
      
      console.log('🎯 Stream and response objects created successfully');
      
      let fullText = '';
      let streamingSuccessful = true;
      let chunkCount = 0;
      
      try {
        // Stream the response using Genkit's stream iterator
        console.log('📡 Starting to stream chunks from Genkit...');
        
        for await (const chunk of stream) {
          console.log('📦 Raw chunk received:', {
            hasText: !!chunk.text,
            hasToolCalls: !!chunk.toolCalls,
            hasToolResponses: !!chunk.toolResponses,
            chunkKeys: Object.keys(chunk),
            chunkType: typeof chunk
          });
          
          if (chunk.toolCalls && chunk.toolCalls.length > 0) {
            console.log('🔧 TOOL CALLS DETECTED IN CHUNK:', chunk.toolCalls);
          }
          
          if (chunk.toolResponses && chunk.toolResponses.length > 0) {
            console.log('🎨 TOOL RESPONSES DETECTED IN CHUNK:', chunk.toolResponses);
          }
          
          if (chunk.text) {
            fullText += chunk.text;
            chunkCount++;
            
            console.log(`📦 Chunk ${chunkCount}: "${chunk.text}" (${chunk.text.length} chars)`);
            
            // Use Firebase v2 streaming - send each chunk if client accepts streaming
            if (request.acceptsStreaming && typeof firebaseResponse.sendChunk === 'function') {
              try {
                firebaseResponse.sendChunk({
                  text: chunk.text,
                  isComplete: false,
                  chunkIndex: chunkCount,
                  timestamp: Date.now()
                });
                console.log(`✅ Successfully sent chunk ${chunkCount} to client`);
              } catch (chunkError) {
                console.error('❌ Failed to send chunk:', chunkError.message);
                streamingSuccessful = false;
                // Continue processing but mark streaming as failed
              }
            } else {
              if (!request.acceptsStreaming) {
                console.log('ℹ️ Client does not accept streaming - collecting for complete response');
                streamingSuccessful = false;
              } else {
                console.warn('⚠️ firebaseResponse.sendChunk not available - streaming not supported');
                streamingSuccessful = false;
              }
            }
          }
        }
        
        console.log(`🎉 Genkit streaming completed! Total chunks: ${chunkCount}, Total text length: ${fullText.length}`);
        
        // Check if response might have been truncated due to token limits
        const estimatedTokens = Math.ceil(fullText.length / 4); // Rough estimate: 1 token ≈ 4 characters
        const tokenLimit = resolvedSettings.maxTokens;
        
        if (estimatedTokens >= tokenLimit * 0.95) { // If we're within 95% of the limit
          console.warn(`⚠️ Response may have been truncated. Estimated tokens: ${estimatedTokens}/${tokenLimit}`);
        }
        
      } catch (streamErr) {
        console.error('❌ Genkit streaming failed:', streamErr.message);
        streamingSuccessful = false;
        
        // Try to get the complete response as fallback using Genkit's response object
        try {
          console.log('🔄 Falling back to complete Genkit response...');
          const finalResponse = await genkitResponse;
          
          console.log('🔧 Final response structure:', {
            hasText: !!finalResponse?.text,
            hasToolCalls: !!finalResponse?.toolCalls,
            hasToolResponses: !!finalResponse?.toolResponses,
            responseKeys: finalResponse ? Object.keys(finalResponse) : 'no response'
          });
          
          if (finalResponse?.toolCalls) {
            console.log('🔧 TOOL CALLS IN FINAL RESPONSE:', finalResponse.toolCalls);
          }
          
          if (finalResponse?.toolResponses) {
            console.log('🎨 TOOL RESPONSES IN FINAL RESPONSE:', finalResponse.toolResponses);
          }
          
          if (finalResponse && finalResponse.text) {
            fullText = finalResponse.text;
            console.log(`📝 Got complete response from Genkit. Length: ${fullText.length}`);
          } else {
            throw new Error('No text in final Genkit response');
          }
        } catch (responseErr) {
          console.error('❌ Failed to get complete response from Genkit:', responseErr);
          throw new Error(`Genkit AI response failed: ${responseErr.message}`);
        }
      }
      
      // Validate we got something
      if (!fullText || fullText.trim().length === 0) {
        throw new Error('Empty response received from Genkit AI model');
      }
      
      // Send final completion marker using Firebase streaming
      if (request.acceptsStreaming && typeof firebaseResponse.sendChunk === 'function' && streamingSuccessful) {
        try {
          firebaseResponse.sendChunk({
            text: '',
            isComplete: true,
            totalChunks: chunkCount,
            fullText: fullText,
            timestamp: Date.now()
          });
          console.log('📋 Sent streaming completion marker to client');
        } catch (chunkError) {
          console.warn('⚠️ Failed to send completion chunk:', chunkError.message);
        }
      }
      
      // Check for tool results in the successful streaming case too
      if (streamingSuccessful) {
        console.log('🔧 Checking for tool results in successful streaming...');
        try {
          const finalResponse = await genkitResponse;
          console.log('🔧 Successful stream final response structure:', {
            hasText: !!finalResponse?.text,
            hasToolCalls: !!finalResponse?.toolCalls,  
            hasToolResponses: !!finalResponse?.toolResponses,
            responseKeys: finalResponse ? Object.keys(finalResponse) : 'no response'
          });
          
          if (finalResponse?.toolResponses) {
            console.log('🎨 TOOL RESPONSES IN SUCCESSFUL STREAM:', finalResponse.toolResponses);
            // TODO: We may need to process tool responses here
          }
        } catch (err) {
          console.warn('⚠️ Could not check final response for tool results:', err.message);
        }
      }
      
      // Inject tool results into the response text
      const enhancedText = injectToolResults(fullText);
      
      return {
        text: enhancedText,
        success: true,
        streaming: streamingSuccessful, // Let frontend know if streaming actually worked
        fallbackUsed: !streamingSuccessful,
        chunkCount: chunkCount,
        streamingMethod: 'genkit_firebase_v2'
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
          system: finalSystemInstruction,
          prompt: processedContent, // Use processedContent instead of message for multimodal support
          tools: enabledTools, // Use dynamic tools configuration
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      } else {
        // Messages with conversation history - NO system instruction with messages
        console.log('📚 NON-STREAMING: Message with conversation history');
        console.log('ℹ️ NON-STREAMING: System instruction NOT applied (already set in initial message)');
        
        // Ensure conversation starts with user message
        const conversationMessages = messages.map(msg => ({
          role: msg.role,
          content: [{ text: msg.content }] // Convert string to array format
        }));

        // Note: Tools are already known to the model via the 'tools' parameter
        // No need to inject reminders that would break the assistant's persona

        // Add current user message with enhanced context for visualization requests
        let enhancedMessage = message;
        if (enabledTools.includes('createVisualization') && (message.toLowerCase().includes('draw') || 
            message.toLowerCase().includes('visualize') || 
            message.toLowerCase().includes('show') || 
            message.toLowerCase().includes('graph') ||
            message.toLowerCase().includes('sine') ||
            message.toLowerCase().includes('wave') ||
            message.toLowerCase().includes('plot'))) {
          enhancedMessage = `${message}\n\n[Note: If this is a request for a visualization, diagram, or graph, please use the createVisualization tool to create an interactive JSXGraph visualization.]`;
        }
        
        // Handle multimodal content for current message
        let currentMessageContent;
        if (Array.isArray(processedContent)) {
          // Multimodal content - replace text content with enhanced message
          currentMessageContent = processedContent.map(part => 
            part.text ? { text: enhancedMessage } : part
          );
        } else {
          // Text-only content
          currentMessageContent = [{ text: enhancedMessage }];
        }
        
        conversationMessages.push({ role: 'user', content: currentMessageContent });
        
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
          // NO system parameter when using messages - it was set in the first message
          messages: conversationMessages,
          tools: enabledTools, // Use dynamic tools configuration
          config: {
            temperature: resolvedSettings.temperature,
            maxOutputTokens: resolvedSettings.maxTokens
          }
        };
      }
      
      const response = await ai.generate(generateParams);
      
      console.log('Got response:', response.text);
      
      // Inject tool results into the response text
      const enhancedText = injectToolResults(response.text);
      
      return {
        text: enhancedText,
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