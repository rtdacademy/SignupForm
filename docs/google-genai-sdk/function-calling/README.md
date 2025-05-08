# Function Calling with Google GenAI

This document explains how to implement function calling with the Google GenAI JavaScript SDK, allowing Gemini models to interact with external systems based on the official API definitions.

## Introduction to Function Calling

Function calling enables Gemini to interact with external systems by requesting specific function calls when needed to fulfill a user request. This feature allows the AI to:

1. Recognize when it needs external data or actions
2. Request execution of functions with appropriate parameters
3. Incorporate the results back into the conversation

## Implementation Overview

To use function calling, follow these 4 steps:

1. Declare the function name, description, and parameters
2. Call `generateContent` with function calling enabled
3. Use the returned `FunctionCall` parameters to call your actual function
4. Send the result back to the model (with history, easier in chat) as a `FunctionResponse`

## Declaring Functions

First, define your function declarations using the SDK's types:

```javascript
import {
  GoogleGenAI, 
  FunctionCallingConfigMode, 
  FunctionDeclaration, 
  Type
} from '@google/genai';

// Define a function to control a light
const controlLightDeclaration = {
  name: 'controlLight',
  parameters: {
    type: Type.OBJECT,
    description: 'Set the brightness and color temperature of a room light.',
    properties: {
      brightness: {
        type: Type.NUMBER,
        description: 'Light level from 0 to 100. Zero is off and 100 is full brightness.',
      },
      colorTemperature: {
        type: Type.STRING,
        description: 'Color temperature of the light fixture which can be `daylight`, `cool`, or `warm`.',
      },
    },
    required: ['brightness', 'colorTemperature'],
  },
};
```

## Using Function Calling with generateContent

Enable function calling when generating content:

```javascript
const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: 'Dim the lights so the room feels cozy and warm.',
  config: {
    toolConfig: {
      functionCallingConfig: {
        // Force it to call any function
        mode: FunctionCallingConfigMode.ANY,
        allowedFunctionNames: ['controlLight'],
      }
    },
    tools: [{functionDeclarations: [controlLightDeclaration]}]
  }
});

console.log(response.functionCalls);
```

## Function Calling Modes

The SDK provides several modes for function calling:

| Mode | Description |
|------|-------------|
| `FunctionCallingConfigMode.ANY` | The model can call any of the provided functions |
| `FunctionCallingConfigMode.AUTO` | The model decides whether to call a function |
| `FunctionCallingConfigMode.NONE` | Function calling is disabled |

## Processing Function Calls

When the model decides to call a function, you need to handle the function call and return the result:

```javascript
// Check if the response includes function calls
if (response.functionCalls && response.functionCalls.length > 0) {
  const functionCall = response.functionCalls[0];
  
  // Log function call details
  console.log(`Function name: ${functionCall.name}`);
  console.log(`Function parameters: ${JSON.stringify(functionCall.args)}`);
  
  // Execute the actual function with the provided parameters
  let functionResult;
  if (functionCall.name === 'controlLight') {
    functionResult = await controlLight(functionCall.args.brightness, functionCall.args.colorTemperature);
  }
  
  // Return the function result back to the model in a chat session
  const chat = ai.chats.create({
    model: 'gemini-2.0-flash-001',
    history: [
      {
        role: 'user',
        parts: [{ text: 'Dim the lights so the room feels cozy and warm.' }]
      },
      {
        role: 'model',
        parts: [{
          functionCall: {
            name: functionCall.name,
            args: functionCall.args
          }
        }]
      },
      {
        role: 'user',
        parts: [{
          functionResponse: {
            name: functionCall.name,
            response: { 
              content: JSON.stringify(functionResult) 
            }
          }
        }]
      }
    ]
  });
  
  // Get model's response after function execution
  const finalResponse = await chat.sendMessage('Did that work as expected?');
  console.log(finalResponse.text);
}
```

## Complete Example with Function Execution

Here's a complete example showing how to handle function calling in a chat context:

```javascript
import { GoogleGenAI, FunctionCallingConfigMode, Type } from '@google/genai';

async function weatherDemo() {
  const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
  
  // Define a function to get weather information
  const getWeatherDeclaration = {
    name: 'getWeather',
    parameters: {
      type: Type.OBJECT,
      properties: {
        location: {
          type: Type.STRING,
          description: 'The city and state, e.g., San Francisco, CA',
        },
        unit: {
          type: Type.STRING,
          enum: ['celsius', 'fahrenheit'],
          description: 'The unit of temperature',
        },
      },
      required: ['location'],
    },
  };

  // Create a chat session with function calling enabled
  const chat = ai.chats.create({
    model: 'gemini-2.0-flash-001',
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

  // Start the conversation
  const response = await chat.sendMessage('What's the weather like in Boston?');
  
  // Check if the model called the function
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    
    console.log(`Function called: ${functionCall.name}`);
    console.log(`Arguments: ${JSON.stringify(functionCall.args)}`);
    
    // Simulate calling a weather API
    const weatherData = {
      location: functionCall.args.location,
      temperature: 72,
      unit: functionCall.args.unit || 'fahrenheit',
      condition: 'sunny',
      humidity: 45,
      windSpeed: 8
    };
    
    // Send the function result back to the model
    const nextResponse = await chat.sendMessage({
      parts: [{
        functionResponse: {
          name: 'getWeather',
          response: { content: JSON.stringify(weatherData) }
        }
      }]
    });
    
    console.log('Final response:', nextResponse.text);
  } else {
    console.log('No function was called:', response.text);
  }
}

weatherDemo();
```

## Function Parameter Types

The SDK supports these parameter types:

| Type | Description |
|------|-------------|
| `Type.STRING` | Text values |
| `Type.NUMBER` | Numeric values |
| `Type.BOOLEAN` | True/false values |
| `Type.OBJECT` | Complex objects with properties |
| `Type.ARRAY` | Lists of values |

## Multiple Function Declarations

You can provide multiple functions for the model to choose from:

```javascript
const response = await ai.models.generateContent({
  model: 'gemini-2.0-flash-001',
  contents: 'I need to know the weather in New York and book a restaurant reservation.',
  config: {
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.AUTO,
        allowedFunctionNames: ['getWeather', 'bookRestaurant'],
      }
    },
    tools: [{
      functionDeclarations: [
        getWeatherDeclaration,
        bookRestaurantDeclaration
      ]
    }]
  }
});
```

## Function Calling in Chat Sessions

Function calling is particularly useful in chat sessions:

```javascript
// Create a chat with function calling capabilities
const chat = ai.chats.create({
  model: 'gemini-2.0-flash-001', 
  config: {
    toolConfig: {
      functionCallingConfig: {
        mode: FunctionCallingConfigMode.AUTO
      }
    },
    tools: [{
      functionDeclarations: [functionDeclaration1, functionDeclaration2]
    }]
  }
});

// Chat session flow with function calling
let response = await chat.sendMessage("What's the weather in San Francisco?");

while (response.functionCalls && response.functionCalls.length > 0) {
  for (const functionCall of response.functionCalls) {
    // Execute the actual function
    const result = await executeFunction(functionCall.name, functionCall.args);
    
    // Send the result back to the chat
    response = await chat.sendMessage({
      parts: [{
        functionResponse: {
          name: functionCall.name,
          response: { content: JSON.stringify(result) }
        }
      }]
    });
  }
}
```

## Error Handling

Handle potential errors that could occur during function calling:

```javascript
try {
  const response = await ai.models.generateContent({
    // Function calling configuration...
  });
  
  if (response.functionCalls && response.functionCalls.length > 0) {
    const functionCall = response.functionCalls[0];
    
    try {
      // Execute function
      const result = await executeFunction(functionCall.name, functionCall.args);
      // Return result to model
    } catch (functionError) {
      // Handle function execution errors
      console.error(`Error executing function ${functionCall.name}:`, functionError);
      
      // Send error back to model
      const errorResponse = await chat.sendMessage({
        parts: [{
          functionResponse: {
            name: functionCall.name,
            error: functionError.message
          }
        }]
      });
    }
  }
} catch (error) {
  console.error('Error during function calling:', error);
}
```

## Best Practices

1. **Provide Clear Function Descriptions**: The model uses descriptions to determine when and how to call functions.

2. **Validate Parameters**: Always validate parameters before executing functions.

3. **Handle Errors Gracefully**: Return informative error messages that the model can use to recover.

4. **Limit Function Scope**: Define functions with specific, focused capabilities.

5. **Secure Implementation**: Never execute potentially harmful operations without validation.

6. **Test Function Declarations**: Test your function declarations to ensure they are correctly defined.

7. **Implement Multi-step Interactions**: For complex tasks, break them down into multiple function calls.

For more details on function calling, refer to the [official documentation](https://googleapis.github.io/js-genai/release_docs/).