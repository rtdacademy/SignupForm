# CLAUDE.md - Guidelines for EdBotz Project

## Build Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm test` - Run all tests
- `npm test -- -t "test name"` - Run specific test

## Code Style Guidelines

### React Components
- Use functional components with hooks
- Use camelCase for component props and variables
- Use PascalCase for component names

### Imports
- Group imports: React, third-party, local components, utilities
- Use absolute imports for app modules

### Styling
- Use Tailwind CSS classes for styling
- Follow BEM-like naming for custom CSS

### Error Handling
- Use try/catch blocks for async operations
- Provide user-friendly error messages
- Log errors to console for debugging

### Naming Conventions
- Use descriptive names for functions and variables
- Prefix event handlers with 'handle'
- Prefix boolean variables with 'is' or 'has'

### Form Handling
- Use controlled components for form inputs
- Validate user input before submission
- Provide feedback for form errors