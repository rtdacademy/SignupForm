/**
 * AI Assistant Prompt Template
 * 
 * Copy this file to your lesson folder and rename it to 'ai-prompt.js'
 * Customize the content based on your specific lesson objectives
 */

// Import specific sections from the Physics 30 Reference Sheet as needed
// NOTE: The reference sheet is in the course 2 directory: src/FirebaseCourses/courses/2/physics30-reference-sheet.js
// Examples (adjust path based on your lesson location):
// import { constants, kinematics, dynamics } from '../../physics30-reference-sheet.js';
// import { electricityMagnetism, atomicPhysics } from '../../physics30-reference-sheet.js';
// import { physics20Level } from '../../physics30-reference-sheet.js'; // For review lessons
// import { periodicTableNuclear, isotopes } from '../../physics30-reference-sheet.js'; // For nuclear physics

export const aiPrompt = {
  // Main instructions for the AI assistant
  instructions: `You are an expert Physics 30 tutor helping students with [LESSON TOPIC HERE].

Your role is to:
- Help students understand [KEY CONCEPTS] clearly
- Guide them through problem-solving step by step without giving direct answers
- Identify and address common misconceptions
- Use appropriate physics terminology and mathematical notation
- Encourage critical thinking and conceptual understanding

Key topics in this lesson:
- [TOPIC 1]
- [TOPIC 2]
- [TOPIC 3]

When helping with problems:
1. Ask students to identify what type of problem it is
2. Have them list known and unknown quantities
3. Guide them to select appropriate equations
4. Emphasize unit analysis and checking answers

Be patient, encouraging, and adapt explanations to the student's understanding level.`,

  // Initial greeting message
  firstMessage: `Hello! I'm your AI physics tutor, here to help you with [LESSON TOPIC].

This lesson covers [BRIEF DESCRIPTION OF LESSON CONTENT].

How can I help you today? You can:
- Ask questions about specific concepts
- Get help solving practice problems
- Review formulas and their applications
- Clarify any confusing topics

What would you like to work on?`,

  // Keywords for context
  contextKeywords: [
    // Add relevant physics terms, concepts, and formulas
    'keyword1', 'keyword2', 'keyword3'
  ],

  // Difficulty level (optional)
  difficulty: 'intermediate', // Options: 'beginner', 'intermediate', 'advanced', 'review'
  
  // Common misconceptions (optional but helpful)
  commonMisconceptions: [
    'Misconception 1',
    'Misconception 2'
  ],

  // Key formulas (optional but helpful)
  keyFormulas: [
    'Formula 1',
    'Formula 2'
  ],

  // Additional metadata (optional)
  prerequisites: ['Previous lesson topic'],
  learningObjectives: [
    'Students will be able to...',
    'Students will understand...'
  ],

  // 📚 REFERENCE DATA (recommended for physics lessons)
  // Import and use specific sections from the Physics 30 Reference Sheet
  // Choose ONE of the following approaches:
  
  // OPTION 1: Use pre-grouped sections (recommended for review lessons)
  // referenceData: `${physics20Level.constants}
  // ${physics20Level.equations}
  // ${physics20Level.principles}`,
  
  // OPTION 2: Combine specific sections for targeted lessons
  // referenceData: `${constants}
  // ${electricityMagnetism}
  // ${periodicTableCommon}`,
  
  // OPTION 3: Use individual sections
  referenceData: `## Reference Data for This Lesson

**Important:** Students have access to their complete Physics 30 Reference Sheet during all lessons and exams.

<!-- Uncomment and customize the sections you need: -->

<!-- Constants section: -->
<!-- \${constants} -->

<!-- Equation sections: -->
<!-- \${kinematics} -->
<!-- \${dynamics} -->
<!-- \${momentumEnergy} -->
<!-- \${waves} -->
<!-- \${electricityMagnetism} -->
<!-- \${atomicPhysics} -->
<!-- \${quantumNuclear} -->

<!-- Math sections: -->
<!-- \${trigonometry} -->
<!-- \${linearEquations} -->
<!-- \${areaFormulas} -->

<!-- Periodic table sections: -->
<!-- \${periodicTableCommon} -->
<!-- \${periodicTableNuclear} -->
<!-- \${radioactiveElements} -->
<!-- \${isotopes} -->

<!-- For complete reference: -->
<!-- \${completeReferenceSheet} -->`,

  // ⚙️ AI MODEL CONFIGURATION
  // These settings control how the AI responds to students in this lesson
  // All keys reference predefined options in functions/aiSettings.js for security
  aiConfig: {
    // 🤖 MODEL SELECTION - Choose the AI model for this lesson
    model: 'FLASH',         // Options:
                           //   'FLASH' - Fast, efficient for most lessons (gemini-2.5-flash)
                           //   'FLASH_LITE' - Fastest responses (gemini-2.5-flash-lite-preview-06-17)
                           //   'PRO' - Most capable for complex topics (gemini-2.5-pro)
                           //   'DEFAULT_CHAT_MODEL' - System default
                           // Note: All models can analyze uploaded images
    
    // 🎯 TEMPERATURE - Controls creativity vs consistency in responses
    temperature: 'BALANCED', // Options:
                            //   'CREATIVE' (0.9) - More varied, creative responses
                            //   'BALANCED' (0.7) - Recommended balance of creativity and consistency
                            //   'FOCUSED' (0.3) - More consistent, focused responses
    
    // 📝 MAX TOKENS - Controls maximum response length
    maxTokens: 'MEDIUM'     // Options:
                           //   'SHORT' (500 tokens) - Brief responses
                           //   'MEDIUM' (1000 tokens) - Standard responses (recommended)
                           //   'LONG' (2000 tokens) - Detailed responses
                           //   'EXTENDED' (4000 tokens) - Very detailed responses (use sparingly)
    
    // 💡 CHOOSING THE RIGHT SETTINGS:
    // 
    // FOR REVIEW LESSONS: model: 'FLASH', temperature: 'BALANCED', maxTokens: 'MEDIUM'
    // FOR COMPLEX PHYSICS: model: 'PRO', temperature: 'FOCUSED', maxTokens: 'LONG'
    // FOR CREATIVE WRITING: model: 'FLASH', temperature: 'CREATIVE', maxTokens: 'LONG'
    // FOR QUICK Q&A: model: 'FLASH_LITE', temperature: 'FOCUSED', maxTokens: 'SHORT'
    // FOR DETAILED ANALYSIS: model: 'PRO', temperature: 'BALANCED', maxTokens: 'LONG'
  },

  // Chat interface configuration
  chatConfig: {
    showYouTube: true,    // Allow YouTube URL input
    showUpload: true,     // Allow file uploads
    allowContentRemoval: true,  // Allow removing uploaded content
    showResourcesAtTop: true,   // Show predefined resources at top
    
    // Predefined YouTube videos for this lesson
    predefinedYouTubeVideos: [
      {
        url: "https://www.youtube.com/watch?v=EXAMPLE",
        displayName: "Lesson Video Title"
      }
    ],
    
    // Predefined files for this lesson (Firebase Storage URLs)
    // 📁 HOW TO GET FILE URLs:
    // 1. Go to https://yourway.rtdacademy.com/file-storage
    // 2. Upload your lesson files (PDFs, images, documents, etc.)
    // 3. Copy the generated gs:// URLs and paste them below
    predefinedFiles: [
      // Example: "gs://rtd-academy.appspot.com/files/lesson-handout.pdf"
      // Example: "gs://rtd-academy.appspot.com/files/formula-sheet.pdf"
    ],
    
    // Custom display names for predefined files
    // Map the gs:// URLs above to student-friendly names that will appear in the chat
    predefinedFilesDisplayNames: {
      // "gs://rtd-academy.appspot.com/files/lesson-handout.pdf": "Lesson Handout"
      // "gs://rtd-academy.appspot.com/files/formula-sheet.pdf": "Formula Reference Sheet"
    }
  }
};