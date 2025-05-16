# Firebase Emulator Setup

## Development Options

You now have three development modes:

### 1. Development with Production Services

Run your app against the real Firebase services:

```bash
# Main site with production services
npm run start:main

# Second site with production services
npm run start:second
```

### 2. Development with Live Database + Functions Emulator

Use the live Realtime Database for real data while running Functions locally for faster development:

```bash
# Start only the Functions emulator in one terminal
npm run start:emulators:functions-only

# In another terminal, start your app with only Functions emulator
npm run start:main:functions-emulator

# Or for second site
npm run start:second:functions-emulator
```

## Switching Between Modes

You can switch between using different emulator configurations:
- No suffix: Use all production services
- `:all-emulators` suffix: Use both Functions and Database emulators
- `:functions-emulator` suffix: Use Functions emulator but live production Database

## Environment Variables

The app uses these environment variables to determine which services to connect to:

- `REACT_APP_USE_FUNCTIONS_EMULATOR=true`: Connect to local Functions emulator
- `REACT_APP_USE_DATABASE_EMULATOR=true`: Connect to local Database emulator

These are automatically set by the npm scripts.
