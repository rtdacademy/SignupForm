# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- Run development server: `npm run start:main`
- Build for production: `npm run build:main`
- Run Firebase emulators: `npm run emulator`
- Clean build artifacts: `npm run clean`

## Code Style Guidelines
- **React Components**: Use functional components with hooks, PascalCase for names
- **Imports**: Group by: React, third-party, local components, utilities
- **Path Aliases**: Use absolute imports with `@/` prefix (e.g., `@/components/Button`)
- **Styling**: Use Tailwind CSS for styling, BEM-like naming for custom CSS
- **Error Handling**: Try/catch for async operations, provide user-friendly messages
- **Naming**: Descriptive variable/function names, prefix event handlers with 'handle', booleans with 'is/has'
- **Types**: Use JSDoc comments for type annotations
- **Formatting**: Double quotes for strings, allow template literals
- **Form Handling**: Use controlled components, validate before submission

## Tests (Functions)
- Test files are named with `.spec.js` suffix and use Mocha