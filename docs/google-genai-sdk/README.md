# Google Gen AI JavaScript SDK

The Google Gen AI JavaScript SDK is designed for TypeScript and JavaScript developers to build applications powered by Gemini. The SDK supports both the Gemini Developer API and Vertex AI.

> **Note**: This SDK documentation is based on the official Google GenAI SDK documentation.

## Prerequisites

- Node.js version 18 or later

## Installation

To install the SDK, run the following command:

```bash
npm install @google/genai
```

## Initialization

The Google Gen AI SDK provides support for both the Google AI Studio and Vertex AI implementations of the Gemini API.

### GoogleGenAI Class

The main entry point to the SDK is the `GoogleGenAI` class, which provides access to all the GenAI features.

```typescript
class GoogleGenAI {
  constructor(options: GoogleGenAIOptions);
  
  readonly models: Models;        // Access model functionality
  readonly chats: Chats;          // Create chat sessions
  readonly live: Live;            // Start live sessions for real-time interaction
  readonly files: Files;          // Upload and manage files
  readonly caches: Caches;        // Create and manage content caches
  readonly operations: Operations; // Access long-running operations
  readonly tunings: Tunings;      // Access model tuning functionality
  readonly vertexai: boolean;     // Whether this is using Vertex AI
}
```

### Gemini Developer API

For server-side applications, initialize using an API key, which can be acquired from Google AI Studio:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
```

### Browser

> **⚠️ CAUTION**: API Key Security: Avoid exposing API keys in client-side code. Use server-side implementations in production environments.

In the browser the initialization code is identical, but you should always proxy requests through a secure backend:

```javascript
import { GoogleGenAI } from '@google/genai';
const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
```

### Vertex AI

Sample code for VertexAI initialization:

```javascript
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    vertexai: true,
    project: 'your_project',
    location: 'your_location',
});
```

## GoogleGenAIOptions Interface

When initializing the SDK, you can specify various options through the `GoogleGenAIOptions` interface:

```typescript
interface GoogleGenAIOptions {
    apiKey?: string;            // The API Key, required for Gemini API clients
    apiVersion?: string;        // Optional API version to use
    vertexai?: boolean;         // Whether to use Vertex AI (false = Gemini API)
    project?: string;           // Google Cloud project ID for Vertex AI
    location?: string;          // Google Cloud project location for Vertex AI
    googleAuthOptions?: GoogleAuthOptions<JSONClient>; // Auth options for Vertex AI
    httpOptions?: HttpOptions;  // Customizable configuration for HTTP requests
}
```

## Google GenAI Overview

All API features are accessed through an instance of the GoogleGenAI class. The submodules bundle together related API methods:

- **[ai.models](./models/README.md)**: Use models to query models (generateContent, generateImages, ...), or examine their metadata.
- **[ai.caches](./caches/README.md)**: Create and manage caches to reduce costs when repeatedly using the same large prompt prefix.
- **[ai.chats](./chat/README.md)**: Create local stateful chat objects to simplify multi-turn interactions.
- **[ai.files](./files/README.md)**: Upload files to the API and reference them in your prompts. This reduces bandwidth if you use a file many times, and handles files too large to fit inline with your prompt.
- **[ai.live](./live/README.md)**: Start a live session for real-time interaction, allows text + audio + video input, and text or audio output.
- **[ai.operations](./operations/README.md)**: Access long-running operations.
- **[ai.tunings](./tunings/README.md)**: Access model tuning functionality.
- **[Pagers](./pagers/README.md)**: Utility for iterating through paginated results from the API.
- **[Types](./types/README.md)**: Complete list of SDK types (enums, classes, interfaces, etc.).

## Feature Documentation

### Content Generation

The Models module provides methods for generating content, images, videos, and embeddings:

- [Content Generation](./models/README.md): Detailed documentation on all Models functionality
- [Function Calling](./function-calling/README.md): Enable Gemini models to interact with external systems
- [Streaming](./streaming/README.md): Implement streaming responses for more responsive applications

### Chat and Real-time Interaction

Create conversational and real-time experiences:

- [Chat Sessions](./chat/README.md): Create and manage chat sessions with conversation history
- [Live Sessions](./live/README.md): Real-time bidirectional communication with audio/video support

### File Management

Upload and manage files to reference in your AI interactions:

- [Files](./files/README.md): Upload, download, list, and delete files with the SDK

### Content Caching

Reduce costs and improve performance by caching content:

- [Caches](./caches/README.md): Create and manage cached content for efficient reuse

### Long-running Operations

Manage resource-intensive tasks:

- [Operations](./operations/README.md): Track and manage long-running operations like video generation

### Model Tuning

Create custom versions of Gemini models:

- [Tunings](./tunings/README.md): Create and manage supervised fine-tuning jobs

### Pagination

Work with large result sets:

- [Pagers](./pagers/README.md): Iterate through paginated results from List APIs

### Schema Helpers

Utilities for working with schemas:

- [Schema Helper](./schema-helper/README.md): Types and utilities for JSON schemas and function declarations

### Types Reference

Complete reference of all types in the SDK:

- [Types](./types/README.md): Comprehensive list of SDK types (enums, classes, interfaces, etc.)

### Practical Examples

- [Examples](./examples/README.md): Code examples based on our implementation

## Quickstart

The simplest way to get started is by using an API key from Google AI Studio:

```javascript
import { GoogleGenAI } from '@google/genai';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

async function main() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.0-flash-001',
    contents: 'Why is the sky blue?',
  });
  console.log(response.text);
}

main();
```

## Security Best Practices in Production

In our application, we use Firebase Cloud Functions to securely proxy requests to the Google GenAI API. This approach prevents API keys from being exposed in client-side code.

### Our Implementation

```javascript
// In Firebase Cloud Functions (server-side)
const { onCall } = require('firebase-functions/v2/https');
const { GoogleGenAI } = require('@google/genai');

// Environment variables should be set in Firebase Cloud Functions
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

const generateContent = onCall({
  concurrency: 10,
  memory: '1GiB',
  timeoutSeconds: 60
}, async (request) => {
  // Data is in request.data for V2 functions
  const { prompt, model = 'gemini-1.5-flash' } = request.data;

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
});
```

## Resources

- [Official Documentation](https://googleapis.github.io/js-genai/release_docs/)
- [GitHub Repository](https://github.com/googleapis/nodejs-vertexai)
- [Google AI Studio](https://ai.google.dev/) - For testing prompts