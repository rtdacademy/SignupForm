# Platform-Aware Scripts

This project now supports both Windows and Linux/Unix environments with automatic platform detection.

## Environment Configuration

Set your platform in your `.env` or `.env.development` file:

```bash
# For Windows users
PLATFORM=windows

# For Linux/Unix users
PLATFORM=linux
```

## Available Scripts

### Platform-Aware Scripts (Recommended)
These scripts automatically choose the correct command based on your platform:

- `npm run dev:main:functions-emulator` - Start main site with functions emulator
- `npm run dev:main:all-emulators` - Start main site with all emulators
- `npm run dev:second:functions-emulator` - Start second site with functions emulator
- `npm run dev:second:all-emulators` - Start second site with all emulators
- `npm run dev:genkit:ui` - Start Genkit UI
- `npm run dev:main:functions-genkit` - Start main site with functions emulator and Genkit UI

### Linux/Unix Scripts (Original)
- `npm run start:main:functions-emulator`
- `npm run start:main:all-emulators`
- `npm run start:second:functions-emulator`
- `npm run start:second:all-emulators`
- `npm run genkit:ui`
- `npm run start:main:functions-genkit`

### Windows Scripts (Explicit)
- `npm run start:main:functions-emulator:win`
- `npm run start:main:all-emulators:win`
- `npm run start:second:functions-emulator:win`
- `npm run start:second:all-emulators:win`
- `npm run genkit:ui:win`
- `npm run start:main:functions-genkit:win`

## Migration Guide

If you were previously using:
- `npm run start:main:functions-emulator` → Use `npm run dev:main:functions-emulator`
- `npm run start:main:all-emulators` → Use `npm run dev:main:all-emulators`

The new `dev:*` scripts will automatically work on both Windows and Linux/Unix systems.
