# Code Examples Garden - Database Seeding

This directory contains JSON files with code examples that can be added to your Firebase database.

## Quick Start

To add code examples to your database, use ONE of these methods:

### Method 1: Using the Shell Script (Recommended)
```bash
cd scripts
./seed-code-examples.sh
```

### Method 2: Manual Firebase CLI Commands

For a quick test with just 2 examples:
```bash
firebase database:update "/" scripts/code-examples-data/quick-start-examples.json
```

Or to add specific categories:
```bash
# Add AI Chat examples
firebase database:update "/" scripts/code-examples-data/ai-chat-examples.json

# Add Basic UI examples  
firebase database:update "/" scripts/code-examples-data/basic-ui-examples.json
```

### Method 3: Add a Single Example
```bash
# Create a single example using inline JSON
firebase database:update "/codeExamples/basic-ui/my-example" --data '{
  "id": "my-example",
  "title": "My Custom Example",
  "category": "Basic UI",
  "description": "A custom example",
  "tags": ["custom", "example"],
  "difficulty": "beginner",
  "imports": ["import React from \"react\";"],
  "code": "const MyExample = () => <div>Hello World</div>;",
  "createdAt": "2025-01-06T10:00:00Z",
  "updatedAt": "2025-01-06T10:00:00Z",
  "createdBy": "system",
  "isPublic": true
}'
```

## Important Notes

- `firebase database:update` merges data at the specified paths, it doesn't overwrite the entire database
- Existing data at other paths will be preserved
- If an example with the same ID already exists, it will be overwritten
- Always backup your database before running bulk updates

## Verify the Data

After seeding, verify the examples were added:

```bash
# View all code examples
firebase database:get /codeExamples

# View a specific category
firebase database:get /codeExamples/ai-chat

# View a specific example
firebase database:get /codeExamples/basic-ui/card-with-tabs
```

## File Structure

- `quick-start-examples.json` - 2 simple examples for testing
- `ai-chat-examples.json` - AI Chat components
- `basic-ui-examples.json` - Basic UI components  
- `rich-content-examples.json` - Rich content editors (create this if needed)
- `interactive-examples.json` - Interactive components (create this if needed)

## Adding More Examples

To add more examples, either:
1. Edit the existing JSON files and re-run the update command
2. Create new JSON files following the same structure
3. Use the Firebase Console to add examples manually