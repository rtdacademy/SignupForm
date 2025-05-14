/**
 * Google AI Genkit Chat Example
 * 
 * This example demonstrates how to create a chat application using Genkit's beta chat API.
 * The application establishes a chat context by sending initial messages, then allows
 * for interactive conversation that maintains memory of the entire chat history.
 */

// Import required l
// ibraries
const { genkit } = require('genkit/beta');          // Import Genkit beta package for chat functionality
const { googleAI } = require('@genkit-ai/googleai'); // Import Google AI plugin for Genkit
const { createInterface } = require('readline/promises'); // For terminal input/output

// Set your Google AI API key as an environment variable
// WARNING: In production, use secure environment variables instead of hardcoding
process.env.GOOGLE_API_KEY = "AIzaSyAdRyYbFRbNqQaH11kEQzq_wj6rpLMg2oI"; 

// Initialize Genkit with Google AI plugin and default model
const ai = genkit({
  plugins: [googleAI()],                        // Use Google AI's chat models
  model: googleAI.model('gemini-2.0-flash'),    // Set default model to Gemini 2.0 Flash
});

/**
 * Main function to run the chat application
 */
async function main() {
  console.log("You're chatting with your Pirate First Mate. Ctrl-C to quit.\n");
  
  try {
    // ========== STEP 1: CREATE SESSION ==========
    // Create a session to maintain state across multiple exchanges
    // Sessions provide the foundation for persistent conversation memory
    const session = ai.createSession();
    
    // ========== STEP 2: CREATE CHAT THREAD ==========
    // Create a named chat thread within the session
    // The thread name allows for multiple separate conversations in the same session
    const chat = session.chat('pirateChat', {
      // System message sets the character/behavior of the AI
      system: "You're a pirate first mate. Address the user as Captain and use pirate slang.",
      config: {
        temperature: 1.3 // Higher temperature (>1.0) for more creative, varied responses
      }
    });
    
    console.log("Setting up initial chat context...");
    
    // ========== STEP 3: ESTABLISH INITIAL CONTEXT ==========
    // Send initial messages to build context and character background
    // These messages create history that future responses will reference
    
    // First exchange - establish character's name
    console.log("- Asking about first mate's name");
    const nameResponse = await chat.send("What's your name?");
    // Extract first word as the character's name for our UI (not necessary for functionality)
    const firstMateName = nameResponse.text; 
    
    // Second exchange - establish information about the ship
    console.log("- Asking about the ship");
    const shipResponse = await chat.send("Tell me about our ship.");
    
    // Try to extract ship name from response (for UI purposes only)
    const shipNameMatch = shipResponse.text.match(/'([^']+)'|"([^"]+)"/);
    const shipName = shipNameMatch ? (shipNameMatch[1] || shipNameMatch[2]) : "our ship";
    
    // ========== STEP 4: DISPLAY ESTABLISHED CONTEXT ==========
    console.log(`\nChat context established with First Mate ${firstMateName} on the ${shipName}!`);
    console.log("-----------------------------------------");
    console.log("PREVIOUS CONVERSATION (ALREADY IN HISTORY):");
    console.log("YOU: What's your name?");
    console.log(`AI: ${nameResponse.text.substring(0, 200)}...`);
    console.log("YOU: Tell me about our ship.");
    console.log(`AI: ${shipResponse.text.substring(0, 200)}...`);
    console.log("-----------------------------------------\n");
    
    // ========== STEP 5: INTERACTIVE CHAT LOOP ==========
    // Set up console interface for user interaction
    const readline = createInterface(process.stdin, process.stdout);
    
    // Main chat loop - continues until user exits
    while (true) {
      // Get user input
      const userInput = await readline.question("> ");
      
      // Check for exit commands
      if (userInput.toLowerCase() === 'exit' || 
          userInput.toLowerCase() === 'quit' || 
          userInput.toLowerCase() === 'bye') {
        console.log("\nFarewell, Captain! May fair winds fill yer sails!\n");
        break;
      }
      
      // Send user message to the chat and get AI response
      // The chat.send() method automatically:
      // 1. Includes previous conversation history
      // 2. Applies the system message
      // 3. Sends the current user input
      // 4. Adds this exchange to the history for future messages
      console.log("AI is thinking...");
      const { text } = await chat.send(userInput);
      
      // Display the AI's response
      console.log(text);
      console.log(); // Add empty line for better readability
    }
    
    // Clean up resources
    readline.close();
  } catch (error) {
    // Error handling
    console.error("Error:", error.message);
  }
}

// Run the main function when the script is executed directly
if (require.main === module) {
  main();
}