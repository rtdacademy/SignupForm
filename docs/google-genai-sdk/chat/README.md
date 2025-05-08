# Chat Functionality with Google GenAI

This document explains how to implement chat functionality using the Google GenAI JavaScript SDK, including creating chat sessions and managing conversation history.

## Class Definitions

### Chat Class

The `Chat` class represents a chat session that enables sending messages to the model with previous conversation context.

```typescript
class Chat {
  constructor(
    apiClient: ApiClient,
    modelsModule: Models,
    model: string,
    config?: GenerateContentConfig,
    history?: Content[]
  );

  // Methods
  getHistory(curated?: boolean): Content[];
  sendMessage(params: SendMessageParameters): Promise<GenerateContentResponse>;
  sendMessageStream(params: SendMessageParameters): Promise<AsyncGenerator<GenerateContentResponse, any, unknown>>;
}
```

### Chats Class

The `Chats` class is a utility to create chat sessions.

```typescript
class Chats {
  constructor(modelsModule: Models, apiClient: ApiClient);
  
  // Methods
  create(params: CreateChatParameters): Chat;
}
```

## Creating a Chat Session

To start a chat session, use the `Chats.create()` method:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Initialize a chat session with a specific model
const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  history: [], // Optional: Previous conversation history
  config: {     // Optional: Configuration for the chat
    temperature: 0.5,
    maxOutputTokens: 1024,
  },
  systemInstruction: { text: 'You are a helpful assistant.' } // Optional: Guide model behavior
});
```

## Sending Messages in a Chat Session

Once a chat session is created, you can send messages using the `sendMessage()` method:

```javascript
const response = await chat.sendMessage({
  message: 'Hello, how can you help me today?'
});

// Access the response
console.log(response.text);
```

### Full Message Examples

You can also send more complex messages with structured parts:

```javascript
// Simple text message
const result = await chat.sendMessage('What is the capital of France?');

// Text message with additional context
const result = await chat.sendMessage({
  message: 'What is the capital of France?'
});

// Multimodal message (text + image)
const result = await chat.sendMessage({
  parts: [
    { text: 'What's in this image?' },
    {
      image: {
        data: imageData, // base64-encoded image data
        mimeType: 'image/jpeg'
      }
    }
  ]
});
```

## Getting Chat History

You can retrieve the chat history using the `getHistory()` method:

```javascript
// Get comprehensive history (default)
const fullHistory = chat.getHistory();

// Get curated history (only valid turns between user and model)
const curatedHistory = chat.getHistory(true);
```

**Remarks:**
- The history is a list of contents alternating between user and model.
- There are two types of history:
  - The curated history contains only the valid turns between user and model, which will be included in subsequent requests.
  - The comprehensive history contains all turns, including invalid or empty model outputs.
- The history is updated after receiving the response from the model.
- For streaming responses, the history is updated after receiving the last chunk.

## Streaming Message Responses

For more responsive interactions, use the `sendMessageStream()` method:

```javascript
const response = await chat.sendMessageStream({
  message: 'Write a short story about space exploration.'
});

for await (const chunk of response) {
  // Process each chunk as it arrives
  console.log(chunk.text);
}
```

## System Instructions

System instructions guide the model's behavior throughout a chat session:

```javascript
const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  systemInstruction: { 
    text: 'You are an AI tutor specialized in mathematics. Provide clear explanations and guide the student through problems step by step.' 
  }
});
```

System instructions are persistent for the entire chat session and do not take up space in the conversation history.

## Firebase Implementation

In our project, we've implemented chat functionality through Firebase Cloud Functions:

```javascript
// Example from our implementation
const sendChatMessage = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60
}, async (request) => {
  const { 
    message, 
    history = [],
    model = 'gemini-1.5-flash',
    systemInstruction = null
  } = request.data;

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
});
```

## Frontend Implementation

Our frontend implementation in `GoogleAIChatApp.js` demonstrates a complete chat interface:

```javascript
// Call the Cloud Function with message and history
const history = messages.slice(-10); // Keep last 10 messages for context

const result = await sendChatMessage({
  message: messageToSend,
  history: history.map(msg => ({
    // Convert our internal message format to what the function expects
    sender: msg.sender, // 'user' or 'ai'
    text: msg.text
  })),
  model: AI_MODEL_MAPPING.livechat.name,
  systemInstruction: "You are a helpful AI assistant that provides clear, accurate information."
});

// Update UI with response
const aiResponse = result.data.text;
```

## Managing Long Conversations

For longer conversations, manage token usage by limiting your history:

```javascript
// Keep only the last N messages to avoid exceeding token limits
const limitedHistory = fullHistory.slice(-10);

const chat = ai.chats.create({
  model: 'gemini-2.0-flash',
  history: limitedHistory
});
```

## Multi-modal Chat

Some models support image inputs in chat messages:

```javascript
const result = await chat.sendMessage({
  parts: [
    { text: "What's in this image?" },
    { image: {data: imageData, mimeType: 'image/jpeg' }}
  ]
});
```

## Error Handling for Chat Sessions

Handle chat-specific errors:

```javascript
try {
  const response = await chat.sendMessage({message});
  // Process response
} catch (error) {
  if (error.message.includes('maximum context length')) {
    // Handle context window exceeded
    console.error('Chat history too long, clearing older messages');
    // Reset or trim chat history
  } else {
    console.error('Chat error:', error);
    // Handle other errors
  }
}
```

## Stateful vs. Stateless Chat

The SDK's `chats` feature maintains state locally in your application. For server-side implementations where persistence across requests is needed, you should:

1. Store the full chat history in your database
2. Reconstruct the chat session with each request
3. Update your stored history after each interaction

This approach is demonstrated in our Firebase Cloud Functions implementation.

For more information about chat functionality, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/classes/chat.Chat.html).