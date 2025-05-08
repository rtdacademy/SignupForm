# Live Session Functionality in Google GenAI SDK

The Live functionality in the Google GenAI SDK provides real-time, bidirectional interaction with Gemini models via WebSocket connections. This enables more dynamic interaction patterns, including audio and video inputs and outputs.

> **Note**: The Live functionality is marked as **Experimental** in the current SDK version and may change in future releases.

## Overview

The Live functionality consists of two main classes:
- `Live`: Manages the configuration and connection to the API
- `Session`: Represents an active connection session with methods for interaction

These classes enable advanced features:
- Real-time bidirectional communication
- Audio and video input/output
- Voice activity detection
- Support for tool calling in real-time

## Live Class

The `Live` class encapsulates the configuration for live interaction with the Generative Language API.

```typescript
class Live {
  constructor(
    apiClient: ApiClient,
    auth: Auth,
    webSocketFactory: WebSocketFactory
  );
  
  // Methods
  connect(params: LiveConnectParameters): Promise<Session>;
}
```

### connect()

Establishes a connection to the specified model with the given configuration and returns a Session object representing that connection.

```typescript
connect(params: LiveConnectParameters): Promise<Session>
```

**Parameters:**
- `params`: The parameters for establishing a connection to the model.
  - `model`: The model ID to connect to
  - `config`: Optional configuration for the session
  - `callbacks`: Event handlers for WebSocket events

**Returns:** A Promise that resolves to a Session object.

**Example:**
```javascript
// Choose the appropriate model based on environment
let model;
if (GOOGLE_GENAI_USE_VERTEXAI) {
  model = 'gemini-2.0-flash-live-preview-04-09';
} else {
  model = 'gemini-2.0-flash-live-001';
}

// Connect with configuration for audio response
const session = await ai.live.connect({
  model: model,
  config: {
    responseModalities: [Modality.AUDIO],
  },
  callbacks: {
    onopen: () => {
      console.log('Connected to the socket.');
    },
    onmessage: (e) => {
      console.log('Received message from the server:', e.data);
    },
    onerror: (e) => {
      console.log('Error occurred:', e.error);
    },
    onclose: (e) => {
      console.log('Connection closed.');
    },
  },
});
```

## Session Class

The `Session` class represents an active connection to the API.

```typescript
class Session {
  constructor(conn: WebSocket, apiClient: ApiClient);
  
  // Properties
  readonly conn: WebSocket;
  
  // Methods
  sendClientContent(params: LiveSendClientContentParameters): void;
  sendRealtimeInput(params: LiveSendRealtimeInputParameters): void;
  sendToolResponse(params: LiveSendToolResponseParameters): void;
  close(): void;
}
```

### sendClientContent()

Sends a message over the established connection. This method is for structured conversational messages.

```typescript
sendClientContent(params: LiveSendClientContentParameters): void
```

**Parameters:**
- `params`: Contains two optional properties:
  - `turns`: Will be converted to a Content[] array
  - `turnComplete`: Boolean indicating if you are done sending content and expect a response (defaults to true)

**Remarks:**
There are two ways to send messages to the live API: `sendClientContent` and `sendRealtimeInput`.

`sendClientContent` messages are added to the model context in order. Having a conversation using `sendClientContent` messages is roughly equivalent to using the `Chat.sendMessageStream`, except that the state of the chat history is stored on the API server instead of locally.

Because of `sendClientContent`'s order guarantee, the model cannot respond as quickly to `sendClientContent` messages as to `sendRealtimeInput` messages. This makes the biggest difference when sending objects that have significant preprocessing time (typically images).

The main use-cases for `sendClientContent` over `sendRealtimeInput` are:
- Sending anything that can't be represented as a Blob (text, `sendClientContent({turns="Hello?"})`)
- Managing turns when not using audio input and voice activity detection
- Prefilling a conversation context

**Example:**
```javascript
// Send a simple text message
session.sendClientContent({
  turns: "What's the weather like today?"
});

// Send a more complex message with multiple turns
session.sendClientContent({
  turns: [
    {
      role: 'user',
      parts: [{ text: "Hello, I have a question about astronomy." }]
    }
  ],
  turnComplete: true
});
```

### sendRealtimeInput()

Sends a realtime message over the established connection. Optimized for audio and video inputs.

```typescript
sendRealtimeInput(params: LiveSendRealtimeInputParameters): void
```

**Parameters:**
- `params`: Contains one property:
  - `media`: Will be converted to a Blob (only specific audio and image MIME types are allowed)

**Remarks:**
Use `sendRealtimeInput` for realtime audio chunks and video frames (images).

With `sendRealtimeInput` the API will respond to audio automatically based on voice activity detection (VAD).

`sendRealtimeInput` is optimized for responsiveness at the expense of deterministic ordering guarantees. Audio and video tokens are added to the context when they become available.

**Example:**
```javascript
// Assuming audioBlob is a Blob of audio data
session.sendRealtimeInput({
  media: audioBlob
});
```

### sendToolResponse()

Sends a function response message over the established connection.

```typescript
sendToolResponse(params: LiveSendToolResponseParameters): void
```

**Parameters:**
- `params`: Contains property:
  - `functionResponses`: Will be converted to a functionResponses[] array

**Remarks:**
Use `sendToolResponse` to reply to `LiveServerToolCall` from the server.

Use `types.LiveConnectConfig#tools` to configure the callable functions.

**Example:**
```javascript
// Respond to a function call from the model
session.sendToolResponse({
  functionResponses: [
    {
      name: "getWeather",
      response: {
        content: JSON.stringify({
          temperature: 72,
          condition: "sunny",
          location: "San Francisco"
        })
      }
    }
  ]
});
```

### close()

Terminates the WebSocket connection.

```typescript
close(): void
```

**Example:**
```javascript
// End the session
session.close();
```

## Complete Example: Live Audio Interaction

Here's a more comprehensive example showing how to use the Live functionality for audio interaction:

```javascript
// Connect to the live API
const session = await ai.live.connect({
  model: 'gemini-2.0-flash-live-001',
  config: {
    responseModalities: [Modality.AUDIO],
    audioConfig: {
      sampleRateHertz: 16000,
      encoding: AudioEncoding.LINEAR16
    }
  },
  callbacks: {
    onopen: () => console.log('Connection established'),
    onmessage: (event) => {
      const data = JSON.parse(event.data);
      
      // Handle audio responses
      if (data.audioResponse) {
        const audioBytes = data.audioResponse.audioContent;
        // Convert audioBytes to audio and play it
        playAudio(audioBytes);
      }
      
      // Handle text responses
      if (data.textResponse) {
        console.log('AI:', data.textResponse.text);
      }
    },
    onerror: (error) => console.error('WebSocket error:', error),
    onclose: () => console.log('Connection closed')
  }
});

// Send audio data
// This assumes you have audio chunks from a microphone
function sendAudioChunk(audioChunk) {
  session.sendRealtimeInput({
    media: new Blob([audioChunk], { type: 'audio/wav' })
  });
}

// Close the session when done
function endSession() {
  session.close();
}
```

## Best Practices

1. **Handle WebSocket Events**: Always implement handlers for all WebSocket events (open, message, error, close).

2. **Close Sessions When Done**: Always close the session when it's no longer needed to free up resources.

3. **Error Handling**: Implement robust error handling for both connection issues and response processing.

4. **Audio Format Compatibility**: Ensure your audio format matches the configuration specified in the connection.

5. **Media Types**: Be aware of the supported media types for real-time input.

For more details on Live functionality, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/classes/live.Live.html).