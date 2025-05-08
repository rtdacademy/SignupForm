# Models in Google GenAI SDK

This document provides comprehensive documentation for the `Models` class in the Google GenAI SDK, including all available methods and their usage.

## Class Definition

```typescript
class Models extends BaseModule {
  constructor(apiClient: ApiClient);
  
  // Content Generation Methods
  generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>;
  generateContentStream(params: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse, any, unknown>>;
  
  // Image and Video Generation Methods
  generateImages(params: GenerateImagesParameters): Promise<GenerateImagesResponse>;
  generateVideos(params: GenerateVideosParameters): Promise<GenerateVideosOperation>;
  
  // Embedding Methods
  embedContent(params: EmbedContentParameters): Promise<EmbedContentResponse>;
  
  // Token Methods
  countTokens(params: CountTokensParameters): Promise<CountTokensResponse>;
  computeTokens(params: ComputeTokensParameters): Promise<ComputeTokensResponse>;
  
  // Model Management Methods
  get(params: GetModelParameters): Promise<Model>;
  list(params?: ListModelsParameters): Promise<Pager<Model>>;
  update(params: UpdateModelParameters): Promise<Model>;
  delete(params: DeleteModelParameters): Promise<DeleteModelResponse>;
}
```

## Content Generation Methods

### generateContent()

Makes an API request to generate content with a given model.

```typescript
generateContent(params: GenerateContentParameters): Promise<GenerateContentResponse>
```

**Parameters:**
- `params`: The parameters for generating content.
  - `model`: The model to use
  - `contents`: The input content
  - `config`: Optional configuration parameters

**Returns:** The response from generating content.

**Example:**
```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash',
  contents: 'Why is the sky blue?',
  config: {
    candidateCount: 2,
  }
});
console.log(response.text);
```

**Supported Model Formats:**

For Vertex AI API:
- The Gemini model ID, e.g.: 'gemini-2.0-flash'
- Full resource path: 'projects/my-project-id/locations/us-central1/publishers/google/models/gemini-2.0-flash'
- Partial resource with 'publishers/': 'publishers/google/models/gemini-2.0-flash'
- Publisher/model format: 'google/gemini-2.0-flash'

For Gemini API:
- The Gemini model ID, e.g.: 'gemini-2.0-flash'
- Model name with 'models/': 'models/gemini-2.0-flash'
- Tuned models: 'tunedModels/1234567890123456789'

### generateContentStream()

Makes an API request to generate content with a given model and yields the response in chunks.

```typescript
generateContentStream(params: GenerateContentParameters): Promise<AsyncGenerator<GenerateContentResponse, any, unknown>>
```

**Parameters:**
- Same as `generateContent()`

**Returns:** An async generator that yields chunks of the response.

**Example:**
```javascript
const response = await ai.models.generateContentStream({
  model: 'gemini-2.0-flash',
  contents: 'Why is the sky blue?',
  config: {
    maxOutputTokens: 200,
  }
});
for await (const chunk of response) {
  console.log(chunk.text);
}
```

## Image and Video Generation Methods

### generateImages()

Generates an image based on a text description and configuration.

```typescript
generateImages(params: GenerateImagesParameters): Promise<GenerateImagesResponse>
```

**Parameters:**
- `params`: The parameters for generating images.
  - `model`: The model to use (e.g., 'imagen-3.0-generate-002')
  - `prompt`: The text description for the image
  - `config`: Optional configuration parameters

**Returns:** The response containing generated images.

**Example:**
```javascript
const response = await ai.models.generateImages({
  model: 'imagen-3.0-generate-002',
  prompt: 'Robot holding a red skateboard',
  config: {
    numberOfImages: 1,
    includeRaiReason: true,
  },
});
console.log(response?.generatedImages?.[0]?.image?.imageBytes);
```

### generateVideos()

Generates videos based on a text description and configuration.

```typescript
generateVideos(params: GenerateVideosParameters): Promise<GenerateVideosOperation>
```

**Parameters:**
- `params`: The parameters for generating videos.
  - `model`: The model to use (e.g., 'veo-2.0-generate-001')
  - `prompt`: The text description for the video
  - `config`: Optional configuration parameters

**Returns:** A Promise for a long-running operation that eventually produces videos.

**Example:**
```javascript
let operation = await ai.models.generateVideos({
  model: 'veo-2.0-generate-001',
  prompt: 'A neon hologram of a cat driving at top speed',
  config: {
    numberOfVideos: 1
  }
});

// Poll the operation until it's complete
while (!operation.done) {
  await new Promise(resolve => setTimeout(resolve, 10000));
  operation = await ai.operations.getVideosOperation({operation: operation});
}

console.log(operation.response?.generatedVideos?.[0]?.video?.uri);
```

## Embedding Methods

### embedContent()

Calculates embeddings for the given contents. Only text is supported.

```typescript
embedContent(params: EmbedContentParameters): Promise<EmbedContentResponse>
```

**Parameters:**
- `params`: The parameters for embedding contents.
  - `model`: The embedding model to use (e.g., 'text-embedding-004')
  - `contents`: Text content to embed
  - `config`: Optional configuration parameters

**Returns:** The response containing embeddings.

**Example:**
```javascript
const response = await ai.models.embedContent({
  model: 'text-embedding-004',
  contents: [
    'What is your name?',
    'What is your favorite color?',
  ],
  config: {
    outputDimensionality: 64,
  },
});
console.log(response);
```

## Token Methods

### countTokens()

Counts the number of tokens in the given contents. Multimodal input is supported for Gemini models.

```typescript
countTokens(params: CountTokensParameters): Promise<CountTokensResponse>
```

**Parameters:**
- `params`: The parameters for counting tokens.
  - `model`: The model to use for token counting
  - `contents`: The content to count tokens for

**Returns:** The response containing token counts.

**Example:**
```javascript
const response = await ai.models.countTokens({
  model: 'gemini-2.0-flash',
  contents: 'The quick brown fox jumps over the lazy dog.'
});
console.log(response);
```

### computeTokens()

Given a list of contents, returns a corresponding TokensInfo containing the list of tokens and list of token IDs. This method is not supported by the Gemini Developer API.

```typescript
computeTokens(params: ComputeTokensParameters): Promise<ComputeTokensResponse>
```

**Parameters:**
- `params`: The parameters for computing tokens.
  - `model`: The model to use for token computation
  - `contents`: The content to compute tokens for

**Returns:** The response from the API.

**Example:**
```javascript
const response = await ai.models.computeTokens({
  model: 'gemini-2.0-flash',
  contents: 'What is your name?'
});
console.log(response);
```

## Model Management Methods

### get()

Fetches information about a model by name.

```typescript
get(params: GetModelParameters): Promise<Model>
```

**Parameters:**
- `params`: The parameters for getting a model.
  - `model`: The name of the model to get

**Returns:** Information about the model.

**Example:**
```javascript
const modelInfo = await ai.models.get({model: 'gemini-2.0-flash'});
console.log(modelInfo);
```

### list()

Lists available models.

```typescript
list(params?: ListModelsParameters): Promise<Pager<Model>>
```

**Parameters:**
- `params`: Optional parameters for listing models.

**Returns:** A paginated list of models.

**Example:**
```javascript
const models = await ai.models.list();
for await (const model of models) {
  console.log(model.name);
}
```

### update()

Updates a tuned model by its name.

```typescript
update(params: UpdateModelParameters): Promise<Model>
```

**Parameters:**
- `params`: The parameters for updating the model.
  - `model`: The name of the model to update
  - `config`: Configuration updates to apply

**Returns:** The updated model.

**Example:**
```javascript
const response = await ai.models.update({
  model: 'tuned-model-name',
  config: {
    displayName: 'New display name',
    description: 'New description',
  },
});
console.log(response);
```

### delete()

Deletes a tuned model by its name.

```typescript
delete(params: DeleteModelParameters): Promise<DeleteModelResponse>
```

**Parameters:**
- `params`: The parameters for deleting the model.
  - `model`: The name of the model to delete

**Returns:** The response from the API.

**Example:**
```javascript
const response = await ai.models.delete({model: 'tuned-model-name'});
console.log(response);
```

## How to Structure Contents Argument

The SDK allows for several ways to specify the `contents` parameter in your requests:

### Content Structure Options

When calling `generateContent()`, you can provide the `contents` parameter in these forms:

1. **Content Object**: A single Content instance
2. **Content Array**: An array of Content objects (for multi-turn exchanges)
3. **Part Object**: A simple Part will be wrapped as a user Content
4. **Part Array**: An array of Parts wrapped as a single user Content
5. **String**: A simple string will be treated as a text Part from a user

Here's how the SDK transforms your input:

```typescript
// These are all equivalent:

// 1. String
ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: 'Write a poem about coding'
});

// 2. Part object
ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: { text: 'Write a poem about coding' }
});

// 3. Content object with explicit role
ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: {
    role: 'user',
    parts: [{ text: 'Write a poem about coding' }]
  }
});
```

## Generation Configuration

You can customize the generation with these parameters:

```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: 'Write a story about space exploration',
  config: {
    temperature: 0.7,          // Controls randomness (0.0-1.0)
    maxOutputTokens: 800,      // Maximum length of response
    topK: 40,                  // Limits vocabulary to top K options
    topP: 0.95,                // Nucleus sampling parameter
    stopSequences: ['THE END'] // Sequences that trigger the model to stop
  }
});
```

## Using Function Calling with Models

Enable function calling with models:

```javascript
import { FunctionCallingConfigMode, Type } from '@google/genai';

const weatherFunctionDeclaration = {
  name: 'getWeather',
  parameters: {
    type: Type.OBJECT,
    properties: {
      location: {
        type: Type.STRING,
        description: 'The city and state',
      },
      unit: {
        type: Type.STRING,
        enum: ['celsius', 'fahrenheit'],
      },
    },
    required: ['location'],
  },
};

const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: 'What's the weather like in Boston?',
  config: {
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.AUTO,
        allowedFunctionNames: ['getWeather'],
      }
    },
    tools: [{functionDeclarations: [weatherFunctionDeclaration]}]
  }
});

// Check if the model called a function
if (response.functionCalls && response.functionCalls.length > 0) {
  console.log(response.functionCalls[0]);
}
```

For more details on the Models functionality, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/classes/models.Models.html).