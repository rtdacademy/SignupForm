# Streaming Capabilities with Google GenAI

This document explains how to implement streaming responses using the Google GenAI JavaScript SDK based on the official API definitions, allowing for quicker, more responsive AI interactions.

## Introduction to Streaming

Streaming enables receiving generated content in chunks as they're produced rather than waiting for the entire response to be generated. This provides several benefits:

1. **Improved User Experience**: Users see responses appear progressively instead of waiting
2. **Faster Initial Response Time**: First words appear much sooner
3. **Support for Longer Outputs**: Generate lengthy content without timing out
4. **More Interactive Interfaces**: Build real-time, dynamic experiences

## Basic Streaming Implementation

For quicker, more responsive API interactions, use the `generateContentStream` method which yields chunks as they're generated:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

async function streamingExample() {
  const response = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-001',
    contents: 'Write a 100-word poem.',
  });
  
  for await (const chunk of response) {
    // Process each chunk as it arrives
    console.log(chunk.text);
  }
}

streamingExample();
```

## Streaming in Chat Sessions

You can also use streaming with chat sessions using the `sendMessageStream` method:

```javascript
const chat = ai.chats.create({
  model: 'gemini-2.0-flash-001',
});

const streamingResponse = await chat.sendMessageStream('Tell me a story about space exploration');

for await (const chunk of streamingResponse) {
  // Process each chunk
  console.log(chunk.text);
}
```

## Processing Stream Chunks

Stream chunks contain partial response data. Here's how to handle them:

```javascript
let responseText = '';

const streamingResponse = await ai.models.generateContentStream({
  model: 'gemini-2.0-flash-001',
  contents: 'Write a tutorial about React hooks.',
});

// Option 1: Using for-await loop
for await (const chunk of streamingResponse) {
  responseText += chunk.text;
  // Update UI with new content
  updateUI(responseText);
}

// Option 2: Manual stream handling
const stream = streamingResponse.stream();
try {
  while (true) {
    const { value, done } = await stream.next();
    if (done) break;
    
    responseText += value.text;
    updateUI(responseText);
  }
} catch (error) {
  console.error('Stream error:', error);
}
```

## Using Stream() Method

The streaming response provides a `stream()` method that returns an async iterator:

```javascript
const streamingResponse = await ai.models.generateContentStream({
  model: 'gemini-2.0-flash-001',
  contents: 'Write a long essay about artificial intelligence.',
});

// Get the stream
const stream = streamingResponse.stream();

// Process the stream
try {
  while (true) {
    const { value, done } = await stream.next();
    if (done) break;
    
    // Process each chunk
    console.log(value.text);
  }
} catch (error) {
  console.error('Stream processing error:', error);
}
```

## Configuration Options with Streaming

You can use the same configuration options with streaming that you use with regular content generation:

```javascript
const streamingResponse = await ai.models.generateContentStream({
  model: 'gemini-2.0-flash-001',
  contents: 'Write a short story.',
  config: {
    temperature: 0.9,          // Higher creativity
    maxOutputTokens: 2000,     // Longer output
    topK: 40,
    topP: 0.95,
    stopSequences: ['THE END']
  }
});
```

## React Implementation Example

Here's how you might implement streaming in a React component:

```jsx
import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';

function AIStreamingChat() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  
  const functions = getFunctions();
  const generateStreamingContent = httpsCallable(functions, 'generateStreamingContent');
  
  const handleGenerate = async () => {
    setResponse('');
    setIsStreaming(true);
    
    try {
      const streamingResponse = await generateStreamingContent({ prompt });
      
      // This assumes your Firebase Function returns a readable stream
      // You would need to implement appropriate server-side handling
      const reader = streamingResponse.data.reader;
      while (true) {
        const { value, done } = await reader.next();
        if (done) break;
        
        setResponse(prev => prev + value);
      }
    } catch (error) {
      console.error('Streaming error:', error);
    } finally {
      setIsStreaming(false);
    }
  };
  
  return (
    <div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your prompt..."
      />
      <button 
        onClick={handleGenerate}
        disabled={isStreaming || !prompt.trim()}
      >
        {isStreaming ? 'Generating...' : 'Generate'}
      </button>
      
      <div className="response">
        {response || <span className="placeholder">Response will appear here...</span>}
        {isStreaming && <span className="cursor">|</span>}
      </div>
    </div>
  );
}
```

## Firebase Cloud Functions Implementation

To implement streaming through Firebase Cloud Functions:

```javascript
const { onCall } = require('firebase-functions/v2/https');
const { GoogleGenAI } = require('@google/genai');

// Environment variables should be set in Firebase Cloud Functions
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const generateStreamingContent = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 300
}, async (request) => {
  const { prompt, model = 'gemini-2.0-flash-001' } = request.data;

  // Initialize the Google AI client
  const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
  
  try {
    // Note: Firebase HTTP Functions don't support true streaming responses
    // This implementation collects all chunks and returns them at once
    const streamingResponse = await genAI.models.generateContentStream({
      model: model,
      contents: prompt
    });
    
    // Collect all chunks
    let completeResponse = '';
    for await (const chunk of streamingResponse) {
      completeResponse += chunk.text;
    }
    
    return {
      text: completeResponse
    };
    
  } catch (error) {
    console.error('Error generating streaming content:', error);
    throw new Error(`An error occurred: ${error.message}`);
  }
});
```

## Streaming with Server-Sent Events (SSE)

For true streaming to the client, implement with Server-Sent Events using Express:

```javascript
const express = require('express');
const { GoogleGenAI } = require('@google/genai');
const functions = require('firebase-functions');

const app = express();

app.get('/stream', async (req, res) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  try {
    const genAI = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const prompt = req.query.prompt;
    
    const streamingResponse = await genAI.models.generateContentStream({
      model: 'gemini-2.0-flash-001',
      contents: prompt
    });
    
    // Stream chunks to client
    for await (const chunk of streamingResponse) {
      res.write(`data: ${JSON.stringify({text: chunk.text})}\n\n`);
      // Flush the response to ensure data is sent immediately
      res.flush();
    }
    
    // End the stream
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    res.write(`data: ${JSON.stringify({error: error.message})}\n\n`);
    res.end();
  }
});

exports.streamApi = functions.https.onRequest(app);
```

## Function Calling with Streaming

You can use function calling with streaming responses:

```javascript
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';

async function streamingFunctionCallExample() {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  
  const getWeatherDeclaration = {
    name: 'getWeather',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: 'The city and state',
        }
      },
      required: ['location'],
    },
  };
  
  // Start streaming with function calling enabled
  const stream = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-001',
    contents: 'What is the weather like in Boston?',
    config: {
      toolConfig: {
        functionCallingConfig: {
          mode: FunctionCallingConfigMode.AUTO,
          allowedFunctionNames: ['getWeather'],
        }
      },
      tools: [{functionDeclarations: [getWeatherDeclaration]}]
    }
  });
  
  let fullResponse = '';
  let hasFunctionCall = false;
  
  // Process the stream
  for await (const chunk of stream) {
    fullResponse += chunk.text || '';
    
    // Check for function calls
    if (chunk.functionCalls && chunk.functionCalls.length > 0) {
      hasFunctionCall = true;
      // Process function calls as they arrive in the stream
      console.log('Function call received:', chunk.functionCalls[0]);
    }
  }
  
  if (hasFunctionCall) {
    // Handle function calls after streaming is complete
    // This is needed because some function call data might only be available at the end
    const functionCall = stream.response.functionCalls[0];
    console.log('Final function call data:', functionCall);
    
    // Execute the function and continue the conversation
    // ...
  }
}
```

## Error Handling in Streaming

Handle streaming-specific errors:

```javascript
try {
  const streamingResponse = await ai.models.generateContentStream({
    model: 'gemini-2.0-flash-001',
    contents: prompt
  });
  
  try {
    for await (const chunk of streamingResponse) {
      // Process chunk
      console.log(chunk.text);
    }
  } catch (streamError) {
    console.error('Stream processing error:', streamError);
    // Handle errors during stream processing
  }
} catch (error) {
  if (error.message.includes('stream')) {
    console.error('Streaming initialization error:', error);
    // Handle streaming-specific errors
  } else {
    console.error('Generation error:', error);
    // Handle other errors
  }
}
```

## Best Practices for Streaming

1. **Add Loading States**: Indicate when streaming is in progress
2. **Handle Network Issues**: Implement robust error handling for connection problems
3. **Provide Cancel Option**: Allow users to cancel ongoing streaming requests
4. **Progressive Enhancement**: Design interfaces that work with or without streaming
5. **Test with Slow Networks**: Ensure the experience is good on slow connections
6. **Consider Buffering**: For smoother UI updates, buffer chunks and update at regular intervals
7. **Implement Timeout Handling**: Set appropriate timeouts for streaming requests

For more details on streaming capabilities, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/).