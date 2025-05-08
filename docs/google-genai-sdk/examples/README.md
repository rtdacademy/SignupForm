# Google GenAI SDK Implementation Examples

This document provides practical examples of using the Google GenAI SDK based on our current implementation, focusing on real-world use cases in our application.

## Firebase Cloud Function for Generating Content

This example demonstrates our implementation of a content generation endpoint using Firebase Cloud Functions:

```javascript
// From our googleai.js in Firebase Cloud Functions
const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { GoogleGenAI } = require('@google/genai');

// Initialize Firebase Admin SDK if not already initialized
if (admin.apps.length === 0) {
  admin.initializeApp();
}

// Environment variables should be set in Firebase Cloud Functions
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

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

    // Initialize the Google AI client
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

module.exports = {
  generateContent
};
```

## Chat Functionality Implementation

Our chat implementation in Firebase Cloud Functions:

```javascript
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

    // Initialize the Google AI client
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
      systemInstruction = null
    } = data;

    if (!message) {
      console.error("Message is missing or empty in the request data");
      throw new Error('Message is required');
    }
    
    console.log(`Processing message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Initialize the Google AI client
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

    // Send the message
    const response = await chat.sendMessage({message: message});
    
    return {
      text: response.text,
    };
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw new Error(`An error occurred while sending the message: ${error.message}`);
  }
});
```

## React Frontend Chat Interface

Our React component for chat interface from `GoogleAIChatApp.js`:

```jsx
// Main component
const GoogleAIChatApp = ({ firebaseApp = getApp() }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollAreaRef = useRef(null);
  
  // Initialize Firebase Functions
  const functions = getFunctions(firebaseApp, 'us-central1');
  const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
  
  // Send message to Google AI
  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;
    setError(null);
    
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: inputMessage,
      timestamp: Date.now(),
    };
    
    // Create a copy of the input message before clearing it
    const messageToSend = inputMessage;
    
    // Update UI immediately
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    // Create empty AI message placeholder for streaming
    const aiMessageId = Date.now() + 1;
    setMessages(prev => [...prev, {
      id: aiMessageId,
      sender: 'ai',
      text: '',
      timestamp: Date.now() + 1,
    }]);
    
    try {
      // Call the Cloud Function with message and history
      const history = messages.slice(-10); // Keep last 10 messages for context
      
      // Log what we're sending to help debug
      console.log("Sending to AI:", {
        message: messageToSend,
        history: history,
        model: AI_MODEL_MAPPING.livechat.name
      });
      
      // Format the data that we send to match what the Cloud Function expects
      const result = await sendChatMessage({
        message: messageToSend, // The actual text message to send
        history: history.map(msg => ({
          // Convert our internal message format to what the function expects
          sender: msg.sender, // 'user' or 'ai'
          text: msg.text
        })),
        model: AI_MODEL_MAPPING.livechat.name, // Using the live chat model from settings
        systemInstruction: "You are a helpful AI assistant that provides clear, accurate information."
      });
      
      // Update the AI message with the response
      const aiResponse = result.data.text;
      
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { ...msg, text: aiResponse } : msg
        )
      );
      
    } catch (err) {
      console.error('Error sending message:', err);
      const errorDetails = err.message || 'Failed to send message. Please try again.';
      setError(errorDetails);
      
      // Show detailed error information in the UI for debugging
      const errorMessage = err.code === 'functions/invalid-argument' 
        ? `API Error: ${errorDetails}` 
        : `I'm sorry, I encountered an error: ${errorDetails}`;
        
      // Update the AI message with the error
      setMessages(prev =>
        prev.map(msg =>
          msg.id === aiMessageId ? { 
            ...msg, 
            text: errorMessage
          } : msg
        )
      );
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  };
  
  // Render the chat interface...
};
```

## Model Configuration Settings

Our configuration for different Gemini models in `settings.js`:

```javascript
// src/edbotz/utils/settings.js

export const AI_MODEL_MAPPING = {
  standard: {
    name: 'gemini-2.0-flash-lite',
    label: 'Gemini 2.0 Flash-Lite',
    description: 'Great model for everyday use. This model provides quick, concise responses perfect for common tasks like answering questions, writing assistance, and basic analysis. It balances speed and accuracy while keeping costs low, making it ideal for chat applications with steady traffic. Best choice if you need reliable performance without advanced features.',
  },
  advanced: {
    name: 'gemini-2.0-flash',
    label: 'Gemini 2.0 Flash',
    description: 'Our most powerful model offering enhanced capabilities for complex tasks. Features improved context understanding, more nuanced responses, and better handling of specialized topics. Choose this model for tasks requiring deep analysis, technical discussions, creative writing, or when accuracy is critical. Ideal for professional applications where quality takes priority over speed.',
  },
  fallback: {
    name: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash',
    description: 'A reliable backup model that maintains service continuity during high demand or system constraints. While slightly older than our 2.0 versions, it delivers consistent performance for most tasks. Automatically engages when needed to prevent service interruptions, ensuring your application remains responsive even under heavy load. No action required from users as this switches seamlessly in the background.',
  },
  livechat: {
    name: 'gemini-1.5-flash',
    label: 'Gemini 1.5 Flash for Chat',
    description: 'Optimized for real-time interactive chat applications. This model delivers fast, responsive outputs for dynamic conversations while maintaining high quality responses. Perfect for chat interfaces requiring quick turnaround times and natural conversational flow.',
  }
};
```

## Error Handling Pattern

Our implementation of error handling and safe JSON stringifying:

```javascript
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

// Example error handling in the chat component
try {
  // Call API
  const result = await sendChatMessage({...});
  // Process successful result
} catch (err) {
  console.error('Error sending message:', err);
  const errorDetails = err.message || 'Failed to send message. Please try again.';
  
  // Differentiate between different error types
  const errorMessage = err.code === 'functions/invalid-argument' 
    ? `API Error: ${errorDetails}` 
    : `I'm sorry, I encountered an error: ${errorDetails}`;
    
  // Update UI with error
  setError(errorMessage);
} finally {
  // Clean up regardless of success or failure
  setIsLoading(false);
}
```

## Message Bubble Component Example

Our UI component for rendering chat messages:

```jsx
// Sample message component
const MessageBubble = ({ message, userName = 'You', assistantName = 'Google AI Assistant' }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={cn(
      "group flex gap-3 relative transition-all duration-300",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0",
        isUser ? "bg-blue-500" : "bg-gradient-to-br from-purple-600 to-indigo-600"
      )}>
        {isUser ? <Send className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      
      <div className={cn(
        "flex flex-col max-w-[80%]",
        isUser ? "items-end" : "items-start"
      )}>
        <div className="text-sm font-medium text-gray-500 mb-1">
          {isUser ? userName : assistantName}
        </div>
        
        <div className={cn(
          "rounded-2xl px-4 py-2",
          isUser 
            ? "bg-blue-500 text-white rounded-br-none" 
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        )}>
          <div className={cn(
            "prose prose-sm max-w-none",
            isUser && "[&_*]:text-white"
          )}>
            {message.text}
          </div>
        </div>
        
        <div className="text-xs text-gray-400 mt-1">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
};
```

## Using a Custom System Instruction

Example of using system instructions in a chat context:

```javascript
// In a React component
const handleSendPromptWithContext = async (prompt, contextType) => {
  let systemInstruction = "";
  
  // Customize system instruction based on context
  switch (contextType) {
    case 'educational':
      systemInstruction = 
        "You are an educational assistant helping students understand concepts clearly. " +
        "Explain topics at an appropriate level for high school students. " +
        "Include examples, analogies, and step-by-step explanations when helpful. " +
        "If a student appears confused, try explaining the concept in a different way. " +
        "Focus on building understanding rather than just providing answers.";
      break;
    case 'technical':
      systemInstruction = 
        "You are a technical assistant helping with programming and technical questions. " +
        "Provide accurate, concise code examples when appropriate. " +
        "Explain technical concepts clearly, assuming the user has basic knowledge. " +
        "When sharing code, include comments to explain what each section does. " +
        "Suggest best practices and potential issues to watch out for.";
      break;
    default:
      systemInstruction = "You are a helpful AI assistant that provides clear, accurate information.";
  }
  
  try {
    const result = await sendChatMessage({
      message: prompt,
      history: previousMessages,
      model: AI_MODEL_MAPPING.advanced.name,
      systemInstruction: systemInstruction
    });
    
    // Process result...
  } catch (error) {
    // Handle error...
  }
};
```

These examples provide a practical reference for implementing the Google GenAI SDK in your application, based on our current implementation patterns.