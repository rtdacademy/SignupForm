/**
 * AI Prompt Loader Utility
 * Dynamically loads lesson-specific AI prompts
 */

// Cache for loaded prompts to avoid re-importing
const promptCache = new Map();

/**
 * Default prompt for lessons without custom prompts
 */
const defaultPrompt = {
  instructions: `You are a helpful Physics 30 tutor. Your role is to:
- Help students understand physics concepts clearly
- Guide them through problem-solving step by step
- Encourage critical thinking and conceptual understanding
- Use appropriate physics terminology and mathematical notation
- Be patient and supportive

Always adapt your explanations to the student's level of understanding.`,

  conversationHistory: (studentName = '') => {
    const firstName = studentName || 'there';
    return [
      {
        sender: 'user',
        text: 'Hello!',
        timestamp: Date.now() - 1000
      },
      {
        sender: 'model',
        text: `Hello${firstName !== 'there' ? ` ${firstName}` : ''}! I'm your AI physics tutor. I'm here to help you understand physics concepts and solve problems. 

${firstName !== 'there' ? `I know your name is ${firstName}, so I'll make sure to address you personally throughout our conversation. ` : ''}What would you like to work on today? Feel free to ask questions about any physics topic or get help with specific problems.`,
        timestamp: Date.now()
      }
    ];
  },

  contextKeywords: ['physics', 'science', 'problem-solving'],
  difficulty: 'intermediate',
  
  // Default AI configuration
  aiConfig: {
    model: 'DEFAULT_CHAT_MODEL',
    temperature: 'BALANCED',
    maxTokens: 'MEDIUM'
  },
  
  // Default chat configuration
  chatConfig: {
    showYouTube: true,
    showUpload: true,
    allowContentRemoval: true,
    showResourcesAtTop: true,
    predefinedYouTubeVideos: [],
    predefinedFiles: [],
    predefinedFilesDisplayNames: {}
  }
};

/**
 * Maps course IDs to their content paths
 */
const courseContentPaths = {
  '2': '2',
  '3': '3',
  '4': '4',
  '0': 'PHY30',
  '100': '100'
};

/**
 * Extracts lesson folder from itemId
 * @param {string} itemId - The lesson item ID (e.g., 'q1_physics_20_review')
 * @returns {string} The lesson folder name
 */
const getLessonFolder = (itemId) => {
  // Handle different itemId formats
  // Looking at the actual course structure, the itemId seems to be 'q1_physics_20_review'
  // and the folder is '01-physics-20-review'
  
  // Extract the number after 'q' or 'lesson_'
  let lessonNumber = null;
  let lessonName = null;
  
  // Pattern 1: q1_physics_20_review format
  const qPattern = /^q(\d+)_(.+)$/;
  const qMatch = itemId.match(qPattern);
  if (qMatch) {
    lessonNumber = qMatch[1].padStart(2, '0');
    lessonName = qMatch[2].replace(/_/g, '-');
    return `${lessonNumber}-${lessonName}`;
  }
  
  // Pattern 2: lesson_01_name format
  const lessonPattern = /^lesson_(\d+)_(.+)$/;
  const lessonMatch = itemId.match(lessonPattern);
  if (lessonMatch) {
    lessonNumber = lessonMatch[1].padStart(2, '0');
    lessonName = lessonMatch[2].replace(/_/g, '-');
    return `${lessonNumber}-${lessonName}`;
  }
  
  // Pattern 3: already in folder format (01-physics-20-review)
  if (/^\d{2}-/.test(itemId)) {
    return itemId;
  }
  
  // Pattern 4: 01_physics_20_review format (number with underscores)
  const numberUnderscorePattern = /^(\d{2})_(.+)$/;
  const numberUnderscoreMatch = itemId.match(numberUnderscorePattern);
  if (numberUnderscoreMatch) {
    lessonNumber = numberUnderscoreMatch[1];
    lessonName = numberUnderscoreMatch[2].replace(/_/g, '-');
    return `${lessonNumber}-${lessonName}`;
  }
  
  // Special case for some lesson IDs that might not follow the pattern
  // Based on looking at actual course files
  const specialMappings = {
    'q1_physics_20_review': '01-physics-20-review',
    'q2_momentum_1d': '02-momentum-one-dimension',
    'q3_momentum_2d': '03-momentum-two-dimensions',
    // Add more mappings as needed
  };
  
  if (specialMappings[itemId]) {
    return specialMappings[itemId];
  }
  
  // Fallback: try to extract meaningful folder name
  console.warn(`Unable to map itemId '${itemId}' to folder name, using fallback`);
  return itemId.replace(/_/g, '-');
};

/**
 * Loads AI prompt for a specific lesson
 * @param {string} courseId - The course ID
 * @param {string} itemId - The lesson item ID
 * @returns {Promise<Object>} The AI prompt configuration
 */
export const loadLessonPrompt = async (courseId, itemId) => {
  if (!courseId || !itemId) {
    console.warn('Missing courseId or itemId, using default prompt');
    return defaultPrompt;
  }

  // Check cache first
  const cacheKey = `${courseId}-${itemId}`;
  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey);
  }

  try {
    // Get the course content path
    const coursePath = courseContentPaths[String(courseId)] || courseId;
    const lessonFolder = getLessonFolder(itemId);
    
    // Try to dynamically import the prompt file
    const promptModule = await import(
      `../courses/${coursePath}/content/${lessonFolder}/ai-prompt.js`
    );

    if (promptModule.aiPrompt) {
      // Cache the loaded prompt
      promptCache.set(cacheKey, promptModule.aiPrompt);
      console.log(`Loaded custom AI prompt for lesson: ${itemId}`);
      return promptModule.aiPrompt;
    } else {
      console.warn(`AI prompt file found but no aiPrompt export for lesson: ${itemId}`);
      return defaultPrompt;
    }
  } catch (error) {
    // File doesn't exist or failed to load
    console.log(`No custom AI prompt found for lesson: ${itemId}, using default`);
    
    // Cache the default to avoid repeated failed imports
    promptCache.set(cacheKey, defaultPrompt);
    return defaultPrompt;
  }
};

/**
 * Clears the prompt cache
 */
export const clearPromptCache = () => {
  promptCache.clear();
};

/**
 * Gets a course-level default prompt if available
 * @param {string} courseId - The course ID
 * @returns {Promise<Object|null>} The course default prompt or null
 */
export const loadCourseDefaultPrompt = async (courseId) => {
  try {
    const coursePath = courseContentPaths[String(courseId)] || courseId;
    const promptModule = await import(
      `../courses/${coursePath}/ai-prompt-default.js`
    );
    
    if (promptModule.aiPrompt) {
      console.log(`Loaded course default AI prompt for course: ${courseId}`);
      return promptModule.aiPrompt;
    }
  } catch (error) {
    // No course default prompt
    return null;
  }
  
  return null;
};

/**
 * Combines lesson prompt with additional context
 * @param {Object} basePrompt - The base prompt configuration
 * @param {Object} additionalContext - Additional context to merge
 * @returns {Object} Combined prompt configuration
 */
export const enhancePromptWithContext = (basePrompt, additionalContext) => {
  if (!additionalContext) return basePrompt;

  // Handle conversation history - can be array or function
  let enhancedConversationHistory;
  if (typeof basePrompt.conversationHistory === 'function') {
    // Call the function with student name to get personalized conversation history
    enhancedConversationHistory = basePrompt.conversationHistory(additionalContext.studentName);
  } else {
    // Fallback to array format
    enhancedConversationHistory = [...(basePrompt.conversationHistory || [])];
  }
  
  // Build enhanced system instructions instead of fake conversation messages
  let enhancedInstructions = basePrompt.instructions || '';

  // Add lesson questions context to system instructions instead of conversation
  if (additionalContext.lessonQuestions && Object.keys(additionalContext.lessonQuestions).length > 0) {
    const totalQuestions = Object.keys(additionalContext.lessonQuestions).length;
    const attemptedQuestions = Object.values(additionalContext.lessonQuestions).filter(q => q.attempts > 0).length;
    const correctQuestions = Object.values(additionalContext.lessonQuestions).filter(q => 
      q.lastSubmission && q.lastSubmission.isCorrect
    ).length;

    // Add assessment context to system instructions
    enhancedInstructions += `\n\n## **CURRENT STUDENT ASSESSMENT STATUS**\n\n`;
    enhancedInstructions += `The student is working on ${totalQuestions} assessment questions in this lesson.\n`;
    enhancedInstructions += `**Progress Summary**: ${attemptedQuestions}/${totalQuestions} attempted, ${correctQuestions}/${totalQuestions} correct\n\n`;
    enhancedInstructions += `**Question Details:**\n`;

    // Add details for each question to system instructions
    Object.entries(additionalContext.lessonQuestions).forEach(([questionId, questionData]) => {
      enhancedInstructions += `- **${questionId}**: ${questionData.questionText}\n`;
      enhancedInstructions += `  - Type: ${questionData.activityType}, Attempts: ${questionData.attempts}, Status: ${questionData.status}\n`;

      if (questionData.lastSubmission) {
        const resultIcon = questionData.lastSubmission.isCorrect ? '✅' : '❌';
        enhancedInstructions += `  - Last Answer: "${questionData.lastSubmission.answer}" ${resultIcon}\n`;
        if (!questionData.lastSubmission.isCorrect) {
          enhancedInstructions += `  - Student needs help with this concept\n`;
        }
      } else if (questionData.attempts === 0) {
        enhancedInstructions += `  - Status: Ready to attempt - student may need preparation\n`;
      }
    });

    enhancedInstructions += `\nUse this assessment information to provide targeted help when the student asks questions about specific problems.`;
  }

  // Add other context to system instructions instead of conversation messages
  if (additionalContext.studentProgress || additionalContext.currentUnit || additionalContext.studentName) {
    enhancedInstructions += `\n\n## **ADDITIONAL CONTEXT**\n\n`;
    if (additionalContext.studentName) {
      enhancedInstructions += `👤 Student Name: ${additionalContext.studentName} (use this name when addressing the student)\n`;
    }
    if (additionalContext.studentProgress) {
      enhancedInstructions += `📈 Course Progress: ${additionalContext.studentProgress}\n`;
    }
    if (additionalContext.currentUnit) {
      enhancedInstructions += `📚 Current Unit: ${additionalContext.currentUnit}\n`;
    }
    if (additionalContext.recentTopics) {
      enhancedInstructions += `🔍 Recent Topics: ${additionalContext.recentTopics.join(', ')}\n`;
    }
  }

  return {
    ...basePrompt,
    instructions: enhancedInstructions, // Enhanced instructions instead of fake conversation
    conversationHistory: enhancedConversationHistory, // Keep original conversation clean
    
    contextKeywords: [
      ...(basePrompt.contextKeywords || []),
      ...(additionalContext.keywords || [])
    ],
    
    // Store lesson questions in the prompt for AI context (not in conversation)
    lessonQuestions: additionalContext.lessonQuestions || {}
  };
};