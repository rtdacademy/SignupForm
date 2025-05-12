# Firebase Emulator Setup

## Development Options

You now have two development modes:

### 1. Development with Production Services

Run your app against the real Firebase services:

```bash
# Main site with production services
npm run start:main

# Second site with production services
npm run start:second
```

### 2. Development with Local Emulators

Run your app against local Firebase emulators:

```bash
# Start the Firebase emulators in one terminal
firebase emulators:start

# In another terminal, start your app with emulator connections
npm run start:main:emulators

# Or for second site
npm run start:second:emulators
```

## Switching Between Modes

You can switch between using emulators and production by using the appropriate npm script:
- With `:emulators` suffix to use emulators
- Without suffix to use production

The scripts automatically set `REACT_APP_USE_EMULATORS=true` for emulator mode.
