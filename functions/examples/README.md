# Genkit Chat Examples

This directory contains examples showing how to use Google's Genkit library for creating chat applications.

## Files

- `chat-session-example.js` - Demonstrates how to create a chat application using Genkit's beta chat API with session and history management.

## Running the Examples

To run the examples, first make sure you've installed the dependencies:

```bash
cd functions
npm install genkit @genkit-ai/googleai
```

Then update the API key in the example file (replace `YOUR_API_KEY_HERE` with your actual Google AI API key).

Finally, run the example:

```bash
cd functions
node examples/chat-session-example.js
```

## Key Concepts

These examples demonstrate several key concepts:

1. **Sessions and Threads**: Genkit uses sessions to maintain state across multiple exchanges. Within a session, you can have multiple chat threads, each with its own history.

2. **System Message**: Sets the character/behavior of the AI assistant. In this example, we're using it to create a pirate character.

3. **Chat History**: The chat history is automatically managed by Genkit. When you call `chat.send()`, the message and response are automatically added to the history.

4. **Temperature Setting**: Controls the creativity of the AI responses. Values above 1.0 produce more creative and varied responses.

## Testing Chat History

After running the example, you can test if the chat history is working properly by asking questions about information that was established in previous messages, such as:

- "What's your name again?"
- "When did we name our ship?"
- "How long have you been my first mate?"
- "What are your duties on the ship?"

The AI should maintain consistent answers based on the chat history.