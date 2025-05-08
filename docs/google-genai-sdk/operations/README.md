# Operations in Google GenAI SDK

The `Operations` class in the Google GenAI SDK provides methods for managing long-running operations, particularly those involved in resource-intensive tasks like video generation.

## Overview

Some API tasks, like video generation, take significant time to complete. Rather than requiring clients to wait for the entire process to finish, the API returns an Operation object that can be used to check the status of the task and retrieve the results when complete.

## Class Definition

```typescript
class Operations extends BaseModule {
  constructor(apiClient: ApiClient);
  
  // Methods
  getVideosOperation(parameters: OperationGetParameters): Promise<GenerateVideosOperation>;
}
```

## Methods

### getVideosOperation()

Gets the status of a long-running operation related to video generation.

```typescript
getVideosOperation(parameters: OperationGetParameters): Promise<GenerateVideosOperation>
```

**Parameters:**
- `parameters`: The parameters for the get operation request.
  - `operation`: The Operation object returned from a previous call

**Returns:** The updated Operation object, with the latest status or result.

**Example:**
```javascript
// First, initiate a video generation operation
let operation = await ai.models.generateVideos({
  model: 'veo-2.0-generate-001',
  prompt: 'A spaceship landing on a distant planet with two moons',
  config: {
    numberOfVideos: 1
  }
});

// Check the status periodically until completion
while (!operation.done) {
  // Wait for a period before checking again
  await new Promise(resolve => setTimeout(resolve, 10000)); // 10 seconds
  
  // Get the updated operation status
  operation = await ai.operations.getVideosOperation({
    operation: operation
  });
  
  console.log(`Operation status: ${operation.done ? 'Completed' : 'In progress'}`);
}

// Once done, access the results
if (operation.response && operation.response.generatedVideos) {
  const video = operation.response.generatedVideos[0];
  console.log(`Generated video URI: ${video.video.uri}`);
}
```

## Working with Long-Running Operations

Long-running operations in the Google GenAI SDK typically follow this pattern:

1. **Initiate the operation**: Call a method like `generateVideos()` that returns an Operation object
2. **Poll for completion**: Use the `getVideosOperation()` method to check the status periodically
3. **Access results**: Once the operation is complete, access the results from the operation object

### Operation Object Structure

The `GenerateVideosOperation` object includes these key properties:

- `name`: A unique identifier for the operation
- `done`: A boolean indicating whether the operation has completed
- `response`: When `done` is true, contains the operation result (e.g., generated videos)
- `error`: When an error occurs, contains error details
- `metadata`: Additional information about the operation status

### Best Practices for Polling

When polling for operation completion, consider these best practices:

1. **Exponential backoff**: Increase the wait time between checks if the operation is taking a long time
2. **Timeout handling**: Implement a maximum wait time to avoid indefinite polling
3. **Error handling**: Check for and properly handle errors during polling

```javascript
async function pollOperation(initialOperation) {
  let operation = initialOperation;
  let retryCount = 0;
  const maxRetries = 20; // Maximum number of retries
  
  while (!operation.done && retryCount < maxRetries) {
    // Exponential backoff: wait longer between retries
    const waitTime = Math.min(1000 * Math.pow(2, retryCount), 60000); // Max 60 seconds
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    try {
      // Get updated operation status
      operation = await ai.operations.getVideosOperation({
        operation: operation
      });
      retryCount++;
    } catch (error) {
      console.error('Error polling operation:', error);
      throw error; // Or handle appropriately
    }
  }
  
  if (!operation.done) {
    throw new Error('Operation timed out');
  }
  
  if (operation.error) {
    throw new Error(`Operation failed: ${operation.error.message}`);
  }
  
  return operation;
}
```

## Complete Video Generation Example

Here's a complete example of generating a video and handling the long-running operation:

```javascript
async function generateVideo(prompt) {
  try {
    console.log(`Starting video generation for prompt: "${prompt}"`);
    
    // Initiate the video generation
    let operation = await ai.models.generateVideos({
      model: 'veo-2.0-generate-001',
      prompt: prompt,
      config: {
        numberOfVideos: 1
      }
    });
    
    console.log(`Operation started: ${operation.name}`);
    
    // Poll until completion
    let retryCount = 0;
    const startTime = Date.now();
    
    while (!operation.done) {
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      console.log(`Waiting for operation to complete... (${elapsedSeconds}s elapsed)`);
      
      // Wait with exponential backoff
      const waitTime = Math.min(5000 * Math.pow(1.5, retryCount), 30000);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      
      // Check operation status
      operation = await ai.operations.getVideosOperation({
        operation: operation
      });
      
      retryCount++;
    }
    
    // Check for errors
    if (operation.error) {
      console.error('Video generation failed:', operation.error);
      return null;
    }
    
    // Process results
    const videoResults = operation.response.generatedVideos;
    if (!videoResults || videoResults.length === 0) {
      console.warn('No videos were generated');
      return null;
    }
    
    const video = videoResults[0];
    console.log('Video generation successful!');
    console.log(`Video URI: ${video.video.uri}`);
    
    return video;
  } catch (error) {
    console.error('Error in video generation process:', error);
    throw error;
  }
}

// Usage
generateVideo('A drone flying over a futuristic city with flying cars')
  .then(video => {
    if (video) {
      console.log('Successfully generated video');
    }
  })
  .catch(error => {
    console.error('Video generation failed:', error);
  });
```

## Limitations and Considerations

1. **API Quotas**: Long-running operations may be subject to API quotas and rate limits
2. **Operation History**: Operations may be accessible for a limited time after completion
3. **Resource Usage**: Heavy operations like video generation can consume significant resources
4. **Cancellation**: Currently, the SDK doesn't provide a direct method to cancel operations
5. **Vertex AI vs. Gemini API**: Operation behavior may differ slightly between Vertex AI and Gemini API implementations

For more details on Operations functionality, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/classes/operations.Operations.html).