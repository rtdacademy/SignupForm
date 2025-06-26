/**
 * AI Assistant Prompt for Physics 20 Review Lesson
 */

import { physics20Level } from '../../physics30-reference-sheet.js';

export const aiPrompt = {
  instructions: `You are an expert Physics 30 tutor helping students review Physics 20 concepts. This lesson covers fundamental physics principles including kinematics, dynamics, and energy.

IMPORTANT: Students have access to their Physics 30 Reference Sheet (data booklet) during all lessons and exams. You should remind them to use it and reference the appropriate equations and constants when solving problems.

Your role is to:
- Help students recall and reinforce Physics 20 concepts they need for Physics 30
- Guide them through problem-solving step by step without giving direct answers
- Identify and address common misconceptions from Physics 20
- Use clear explanations with appropriate physics terminology and mathematical notation
- Encourage students to think critically about physical relationships
- Remind students to use their reference sheet for equations and constants

Key topics in this review:
- Kinematics (motion in 1D and 2D)
- Newton's Laws and forces
- Energy and momentum
- Vector operations
- Unit conversions and significant figures

When helping with problems:
1. Ask students to identify what type of problem it is
2. Have them list known and unknown quantities
3. Guide them to select appropriate equations from their reference sheet
4. Emphasize unit analysis and checking answers
5. Reference the data booklet values for constants like g = 9.81 m/s²

Be patient, encouraging, and adapt explanations to the student's understanding level.`,

  firstMessage: `Hello! I'm your AI physics tutor, here to help you review Physics 20 concepts. 

This review lesson covers the fundamental principles you'll need for Physics 30, including kinematics, forces, and energy.

What would you like to work on today? You can:
- Ask questions about specific physics concepts
- Get help solving practice problems
- Review formulas and when to use them
- Clarify any Physics 20 topics you found challenging

What's on your mind?`,

  contextKeywords: [
    'kinematics', 'velocity', 'acceleration', 'displacement',
    'forces', 'Newton\'s laws', 'friction', 'tension',
    'energy', 'kinetic', 'potential', 'conservation',
    'vectors', 'components', 'magnitude', 'direction',
    'motion', 'projectile', 'uniform', 'equations'
  ],

  difficulty: 'review',
  
  commonMisconceptions: [
    'Confusing velocity and acceleration',
    'Forgetting that forces are vectors',
    'Mixing up distance and displacement',
    'Incorrect free body diagrams',
    'Sign conventions in kinematics'
  ],

  keyFormulas: [
    'v = u + at',
    's = ut + ½at²',
    'v² = u² + 2as',
    'F = ma',
    'KE = ½mv²',
    'PE = mgh',
    'p = mv'
  ],

  // 📚 REFERENCE DATA - Physics 20 Level
  // Imported from the complete Physics 30 Reference Sheet
  // This data is available to students during all lessons and exams
  referenceData: `${physics20Level.constants}

${physics20Level.equations}

${physics20Level.principles}

**Important Note:** Students always have access to their complete Physics 30 Reference Sheet during lessons and exams. The above shows the sections most relevant for this Physics 20 review.`,

  // ⚙️ AI MODEL CONFIGURATION
  // These settings control how the AI responds to students in this lesson
  // All keys reference predefined options in functions/aiSettings.js for security
  aiConfig: {
    // 🤖 MODEL SELECTION - Choose the AI model for this lesson
    model: 'FLASH',         // Options: 'FLASH' (fast, efficient), 'FLASH_LITE' (fastest), 'PRO' (most capable), 'DEFAULT_CHAT_MODEL'
                           // Note: All models can analyze uploaded images
    
    // 🎯 TEMPERATURE - Controls creativity vs consistency
    temperature: 'BALANCED', // Options: 'CREATIVE' (0.9, varied responses), 'BALANCED' (0.7, recommended), 'FOCUSED' (0.3, consistent responses)
    
    // 📝 MAX TOKENS - Controls response length
    maxTokens: 'MEDIUM'     // Options: 'SHORT' (500 tokens), 'MEDIUM' (1000, recommended), 'LONG' (2000), 'EXTENDED' (4000)
    
    // 💡 EXPLANATION:
    // - FLASH model is chosen for fast review responses
    // - BALANCED temperature provides natural tutoring conversations
    // - MEDIUM tokens allow detailed explanations without being overwhelming
  },

  // Chat interface configuration
  chatConfig: {
    showYouTube: false,  // Disable YouTube uploads for this review lesson
    showUpload: false,    // Allow file uploads for problem-solving
    allowContentRemoval: true,
    showResourcesAtTop: true,
    
    // Predefined YouTube videos for this lesson
    predefinedYouTubeVideos: [
      {
       // url: "https://www.youtube.com/watch?v=kKKM8Y-u7ds", // Example physics review video
       // displayName: "Physics 20 Quick Review"
      }
    ],
    
    // Predefined files for this lesson (Firebase Storage URLs)
    // To get file URLs: Go to https://yourway.rtdacademy.com/file-storage
    // Upload your files and copy the gs:// URLs that are generated
    predefinedFiles: [
      // Example: "gs://rtd-academy.appspot.com/files/physics-20-formulas.pdf"
    ],
    
    // Custom display names for predefined files
    // Map the gs:// URLs to student-friendly names
    predefinedFilesDisplayNames: {
      // "gs://rtd-academy.appspot.com/files/physics-20-formulas.pdf": "Physics 20 Formula Sheet"
    }
  }
};