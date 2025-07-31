# AI Prompt Creation Guide for Physics 30 Lessons

## Overview
This guide helps create `ai-prompt.js` files for each Physics 30 lesson. Each file provides context-aware AI assistance based on the specific lesson content.

## Quick Process

### 1. Read the Lesson File
```bash
# Read the main lesson file to understand content
@src/FirebaseCourses/courses/2/content/[LESSON-FOLDER]/index.js

# Example:
@src/FirebaseCourses/courses/2/content/04-impulse-momentum-change/index.js
```

### 2. Identify Key Elements
When reading the lesson file, look for:

- **Lesson Title & Duration**: Found in `<LessonContent title="..." metadata={{ estimated_time: '...' }}>`
- **Major Sections**: Each `<AIAccordion.Item title="...">` is a major topic
- **Examples**: Count and summarize each example (problem statement, solution approach)
- **Interactive Elements**: Animations, simulations, calculators
- **Practice Problems**: Problem sets with their navigation functions
- **Knowledge Checks**: `<SlideshowKnowledgeCheck>` components with question IDs
- **Key Concepts**: Look for definition boxes, formulas, important principles
- **Visual Elements**: Diagrams, graphs, animations described in the code

### 3. Create the AI Prompt File

Create file at: `src/FirebaseCourses/courses/2/content/[LESSON-FOLDER]/ai-prompt.js`

## Parallel Processing Approach (Recommended)

When creating prompts for multiple lessons, use parallel processing to save time:

### Benefits:
- **3-5x faster** than sequential processing
- **Consistent quality** across all prompts
- **Efficient context usage**

### How to Use Parallel Processing:

1. **Identify Multiple Lessons**
```bash
# List lessons that need AI prompts
ls src/FirebaseCourses/courses/2/content/*/index.js | grep -v ai-prompt
```

2. **Read Multiple Files Simultaneously**
```bash
# Read 3-4 lesson files at once
@src/FirebaseCourses/courses/2/content/30-electric-potential/index.js
@src/FirebaseCourses/courses/2/content/31-parallel-plates/index.js
@src/FirebaseCourses/courses/2/content/32-electric-current/index.js
```

3. **Create Multiple Prompts in One Operation**
- Analyze all lessons together
- Write all ai-prompt.js files simultaneously
- Maintain consistency across related topics

### Example Workflow:
```
1. Group related lessons (e.g., electricity topics)
2. Read 3-4 lesson files in parallel
3. Create all AI prompts simultaneously
4. Verify all files were created successfully
```

### Tips for Parallel Processing:
- Group lessons by topic for better context
- Process 3-4 lessons per batch (optimal)
- Use consistent formatting across all prompts
- Track progress with a todo list

## Template Structure

### Improved Formatting for Long Text

For better readability of long conversation text, use this clean formatting approach:

```javascript
// RECOMMENDED: Clean template literal formatting
conversationHistory: (studentName = '') => {
  const firstName = studentName || 'there';
  return [
    {
      sender: 'user',
      text: 'Hi! I just started the momentum in two dimensions lesson.',
      timestamp: Date.now() - 1000
    },
    {
      sender: 'model',
      text: `Hello${firstName !== 'there' ? ` ${firstName}` : ''}! Welcome to momentum in two dimensions. This lesson builds on what you learned about 1D momentum by adding the complexity of vector analysis.

${firstName !== 'there' ? `I see you're ${firstName} - I'll make sure to address you by name throughout our discussion. ` : ''}The key insight is that momentum conservation applies independently to each direction - what happens in the x-direction is separate from the y-direction.

This lesson covers two main approaches:
- **Component Method**: Breaking vectors into x and y parts
- **Vector Addition Method**: Using geometry and trigonometry

We have 5 detailed examples showing different scenarios - explosions, collisions, and multi-body systems. Which aspect would you like to explore first?`,
      timestamp: Date.now()
    }
  ];
},
```

**Key formatting principles:**
- Use natural paragraph breaks with blank lines
- Use **bold** for important concepts or lists
- Keep sentences flowing naturally
- Use bullet points or numbered lists for clarity
- Maintain conversational tone throughout

## Template Structure

```javascript
/**
 * AI Assistant Prompt for [LESSON TITLE]
 * [Brief description of lesson focus]
 */

import { physics20Level, kinematics, dynamics, momentumEnergy, [OTHER_NEEDED_SECTIONS], aiFormattingGuidelines } from '../../physics30-reference-sheet.js';

export const aiPrompt = {
  instructions: `You are an expert Physics 30 tutor helping students understand [TOPIC]. 

## **YOUR ROLE**
- [Key teaching approach for this topic]
- [Specific guidance points]
- [Problem-solving methodology if applicable]
- [Common misconceptions to address]

## **LESSON AWARENESS**
Students are viewing "[LESSON TITLE]" lesson ([DURATION]) which covers [BRIEF OVERVIEW]. The lesson includes:
- [List major sections/topics]
- [Number of worked examples with brief descriptions]
- [Interactive features if any]
- [Practice problems and assessments]

## **AVAILABLE EXAMPLES**
[List each example with brief description]
- **Example 1**: [Problem type and key concept]
- **Example 2**: [Problem type and key concept]
[Continue for all examples]

## **KEY CONCEPTS**
[List the main physics concepts, formulas, and principles covered]

## **PROBLEM SOLVING APPROACH**
[If applicable, describe the specific methodology taught in this lesson]

## **COMMON STUDENT ERRORS**
[List 3-5 common mistakes specific to this topic]

${aiFormattingGuidelines}

When students share extracted content, provide focused help on that specific material while connecting to broader physics principles.

## **[LESSON TITLE IN CAPS] LESSON CONTEXT**

[Detailed description of lesson structure and available content]

### **Major Sections:**
[List all accordion sections with brief descriptions]

### **Practice Problem Sets:**
[Describe practice problems if any]

### **Knowledge Check Topics:**
[List slideshow questions by topic]

### **Interactive Features:**
[Describe any animations, simulations, or interactive elements]

### **Visual Elements:**
[Describe diagrams, graphs, or visual aids]

[Any special notes about this lesson]`,

  conversationHistory: (studentName = '') => {
    const firstName = studentName || 'there';
    return [
      {
        sender: 'user',
        text: 'Hi! I just started the [lesson topic] lesson.',
        timestamp: Date.now() - 1000
      },
      {
        sender: 'model',
        text: `Hello${firstName !== 'there' ? ` ${firstName}` : ''}! Welcome to [lesson topic]. [Personalized introduction mentioning 1-2 key aspects of this specific lesson].

${firstName !== 'there' ? `I see you're ${firstName} - I'll address you by name throughout our discussion. ` : ''}[Brief overview of what makes this lesson important/interesting].

[Mention available resources like examples, animations, or practice problems]. What would you like to explore first?`,
        timestamp: Date.now()
      }
    ];
  },

  contextKeywords: [
    // Add all relevant keywords for this lesson
    'Example 1', 'Example 2', // ... list all examples
    // Key physics terms from the lesson
    // Special features or sections
  ],

  difficulty: '[basic/intermediate/advanced]', // Choose based on topic complexity

  referenceData: `## **Physics 30 Reference Sheet - Relevant Sections**

${physics20Level.constants}

[Include only the reference sections relevant to this lesson topic]

## **[TOPIC] Quick Reference**
[Add lesson-specific formulas, conversions, or quick references]`,

  aiConfig: {
    model: 'FLASH_LITE',
    temperature: 'BALANCED',
    maxTokens: 'MEDIUM'
  },

  chatConfig: {
    showYouTube: false,
    showUpload: false,
    allowContentRemoval: true,
    showResourcesAtTop: true,
    predefinedYouTubeVideos: [],
    predefinedFiles: [],
    predefinedFilesDisplayNames: {}
  }
};
```

## Reference Sheet Import Guide

Choose imports based on lesson topic:

### For Mechanics Lessons:
```javascript
import { physics20Level, kinematics, dynamics, momentumEnergy, aiFormattingGuidelines } from '../../physics30-reference-sheet.js';
```

### For Waves/Optics Lessons:
```javascript
import { physics20Level, waves, aiFormattingGuidelines } from '../../physics30-reference-sheet.js';
```

### For Electricity/Magnetism Lessons:
```javascript
import { physics20Level, electricityMagnetism, aiFormattingGuidelines } from '../../physics30-reference-sheet.js';
```

### For Modern Physics Lessons:
```javascript
import { physics20Level, atomicPhysics, quantumNuclear, particles, aiFormattingGuidelines } from '../../physics30-reference-sheet.js';
```

### For Nuclear Physics Lessons:
```javascript
import { physics20Level, atomicPhysics, quantumNuclear, radioactiveElements, isotopes, aiFormattingGuidelines } from '../../physics30-reference-sheet.js';
```

## Example Analysis Process

### Step 1: Read lesson file and identify structure
```
Lesson: "Impulse and Momentum Change"
Duration: 90 minutes
Sections: 
- Introduction to Impulse
- Impulse-Momentum Theorem
- Force-Time Graphs
- Real-world Applications
Examples: 5 (car crash, ball bounce, rocket thrust, etc.)
Interactive: Force-time graph calculator
Practice: 2 problem sets
```

### Step 2: Extract key physics concepts
- Impulse definition (J = FΔt)
- Impulse-momentum theorem (J = Δp)
- Area under force-time curves
- Variable force applications

### Step 3: Note special features
- Interactive graph tool for calculating impulse
- Real-world safety applications (airbags, crumple zones)
- Connection to Newton's laws

### Step 4: Create contextKeywords array
```javascript
contextKeywords: [
  'Example 1', 'Example 2', 'Example 3', 'Example 4', 'Example 5',
  'impulse', 'momentum change', 'force-time graph', 'area under curve',
  'collision', 'safety', 'airbag', 'crumple zone', 'theorem',
  'variable force', 'constant force', 'Newton second law'
]
```

## Quality Checklist

Before finalizing each ai-prompt.js file, ensure:

- [ ] All examples from the lesson are listed with descriptions
- [ ] Interactive features are mentioned
- [ ] Practice problem sets are described
- [ ] Common student errors are specific to this topic
- [ ] Reference sheet imports match the lesson topic
- [ ] Context keywords include all examples and key terms
- [ ] Conversation starter is natural and lesson-specific
- [ ] Instructions mention specific solving methods taught
- [ ] Visual elements and diagrams are described

## Common Patterns by Lesson Type

### Calculation-Heavy Lessons
- Emphasize step-by-step problem solving
- Include unit analysis reminders
- Reference specific formulas heavily

### Conceptual Lessons
- Focus on understanding principles
- Use analogies and real-world connections
- Emphasize the "why" behind concepts

### Lab/Experimental Lessons
- Include data analysis guidance
- Mention experimental procedures
- Address uncertainty and error analysis

### Review/Exam Prep Lessons
- Comprehensive topic coverage
- Connection between different units
- Test-taking strategies

## File Naming Requirements

The lesson folder name MUST match the expected pattern:
- Format: `XX-lesson-name-with-hyphens`
- Example: `04-impulse-momentum-change`
- The ai-prompt.js file MUST be in this folder

## Testing Your Prompt

After creating, verify:
1. File is saved in correct location
2. Export is named `aiPrompt` (not `prompt` or other names)
3. All imports resolve correctly
4. No syntax errors in the JavaScript

The system will automatically load your prompt when students open that lesson!