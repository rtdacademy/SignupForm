// test-chat.js
// Simple terminal-based chat client for testing Genkit chat functionality

const readline = require('readline/promises');
const { stdin, stdout } = require('process');
const path = require('path');

// Create a readline interface
const rl = readline.createInterface({ input: stdin, output: stdout });

// Whether to call the cloud function or run locally
const USE_CLOUD_FUNCTION = false;

async function localChatTest() {
  // Change working directory to functions folder to access dependencies
  process.chdir(path.join(__dirname, 'functions'));
  
  const { genkit } = require('genkit/beta');
  const { googleAI } = require('@genkit-ai/googleai');

  // Initialize genkit with Google AI plugin
  const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.0-flash'), // Using Gemini 2.0 Flash model
  });

  // Create chat session
  const chat = ai.chat({
    system: "You are a helpful AI assistant. Provide concise, accurate answers.",
  });

  console.log("Chat with AI (Ctrl+C to exit)");
  console.log("Running in LOCAL mode - using Genkit directly");
  console.log("-----------------------------------------");

  try {
    while (true) {
      const message = await rl.question("> ");
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        break;
      }
      
      console.log("AI is thinking...");
      const { text } = await chat.send(message);
      console.log(`\nAI: ${text}\n`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

async function cloudFunctionChatTest() {
  // Firebase configuration - replace with your own if needed
  const PROJECT_ID = "your-firebase-project-id";
  const REGION = "us-central1";
  const FUNCTION_URL = `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/terminalChat`;

  console.log("Chat with AI (Ctrl+C to exit)");
  console.log("Running in CLOUD mode - using Firebase Function");
  console.log("-----------------------------------------");

  try {
    while (true) {
      const message = await rl.question("> ");
      if (message.toLowerCase() === 'exit' || message.toLowerCase() === 'quit') {
        break;
      }
      
      console.log("AI is thinking...");
      
      // Call the cloud function
      const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            message
          }
        }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`\nAI: ${data.result.response}\n`);
    }
  } catch (error) {
    console.error("Error:", error.message);
  } finally {
    rl.close();
  }
}

// Run the appropriate function based on configuration
if (USE_CLOUD_FUNCTION) {
  cloudFunctionChatTest();
} else {
  localChatTest();
}