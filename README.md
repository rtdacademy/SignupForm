Firebase Emulator Setup
Development Options
You now have four development modes:

1. Development with Production Services
Run your app against the real Firebase services:
bash# Main site with production services

npm run start:main

# Second site with production services
npm run start:second

2. Development with Live Database + Functions Emulator
Use the live Realtime Database for real data while running Functions locally for faster development:
bash# Start only the Functions emulator in one terminal

npm run start:emulators:functions-only

# In another terminal, start your app with only Functions emulator
npm run start:main:functions-emulator

# Or for second site
npm run start:second:functions-emulator

3. Development with Functions Emulator + Genkit Developer UI

This mode allows you to test and develop your AI features interactively using the Genkit Developer UI:
bash# This starts everything you need: Functions emulator, Genkit UI, and the main site

npm run start:main:functions-genkit

Or you can start each component separately:
bash# Start only the Functions emulator

npm run start:emulators:functions-only

# Start the Genkit Developer UI (opens in browser)
npm run genkit:ui

# Start the main site with Functions emulator
npm run start:main:functions-emulator
4. Full Emulation Mode
Use both Database and Functions emulators for completely local development:
bash# Start all emulators in one terminal
npm run start:emulators

# In another terminal, start your app with all emulators
npm run start:main:all-emulators

# Or for second site
npm run start:second:all-emulators
Switching Between Modes
You can switch between using different emulator configurations:

No suffix: Use all production services
:all-emulators suffix: Use both Functions and Database emulators
:functions-emulator suffix: Use Functions emulator but live production Database
:functions-genkit suffix: Use Functions emulator with Genkit Developer UI

Environment Variables
The app uses these environment variables to determine which services to connect to:

REACT_APP_USE_FUNCTIONS_EMULATOR=true: Connect to local Functions emulator
REACT_APP_USE_DATABASE_EMULATOR=true: Connect to local Database emulator

These are automatically set by the npm scripts.
Using the Genkit Developer UI
The Genkit Developer UI provides a local web interface for testing and developing your AI features powered by Genkit and Google AI (Gemini).
Features

Model Playground: Test and experiment with different AI models
Interactive Flows: Test your defined AI flows with different inputs
Prompt Engineering: Experiment with different prompts and see the results in real-time
Chat Sessions: Test multi-turn conversations with your AI assistant

Accessing the UI
When you run npm run genkit:ui or npm run start:main:functions-genkit, the Genkit Developer UI will automatically open in your default browser at http://localhost:4000.
Prerequisites
To use the Genkit Developer UI, make sure:

You have the local-dev-server.js file in your functions directory
Your Firebase functions are properly configured with Genkit components
You've set up the correct exports in your functions code to expose the Genkit components