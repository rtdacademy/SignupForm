# CLAUDE.md - Guidelines for EdBotz Project

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

### Instructions:
Currently, Please review the following files:
- src/edbotz/AIChatApp.js
- src/edbotz/AIAssistantSheet.js
- src/courses/CourseEditor/QuillEditor.js

I want to be able to add this more complex QuillEditor.js to the First Message and the Message to Students section so that I can display a youtube video or image into the the first message in the chat bubble. However, I think we may need to consider how the chat bubble is smaller, and we may need to adapt this to work in this setting. Please think deeply about how we could implement this, and then provide the updates to my code in all the necessary locations. 