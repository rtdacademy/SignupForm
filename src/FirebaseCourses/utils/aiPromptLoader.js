/**
 * AI Prompt Loader Utility
 * Dynamically loads lesson-specific AI prompts
 */

// Cache for loaded prompts to avoid re-importing
const promptCache = new Map();

/**
 * Course-specific default prompts
 */
const courseDefaultPrompts = {
  // Physics courses (2 and 0)
  physics: {
    instructions: `You are a helpful Physics 30 tutor. Your role is to:
- Help students understand physics concepts clearly
- Guide them through problem-solving step by step
- Encourage critical thinking and conceptual understanding
- Use appropriate physics terminology and mathematical notation
- Be patient and supportive

When a student asks a question but isn't clear about what specific help they need, ask probing questions to determine exactly where they may be having difficulties. This helps you provide more targeted and effective assistance.

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
  },

  // RTD Academy Orientation (Course 4)
  orientation: {
    instructions: `You are a helpful RTD Academy orientation assistant. Your role is to:
- Guide students through RTD Academy policies and procedures
- Explain academic expectations and requirements
- Help students understand time management and study strategies
- Clarify questions about exams, assignments, and academic integrity
- Provide information about student support services

Be welcoming, clear, and supportive as students navigate their learning journey at RTD Academy.`,

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
          text: `Hello${firstName !== 'there' ? ` ${firstName}` : ''}! I'm your RTD Academy orientation assistant. I'm here to help you understand academy policies, procedures, and support services. 

${firstName !== 'there' ? `Welcome to RTD Academy, ${firstName}! ` : 'Welcome to RTD Academy! '}How can I assist you today? Feel free to ask about course expectations, time management, academic integrity, or any other questions about your learning journey here.`,
          timestamp: Date.now()
        }
      ];
    },

    contextKeywords: ['orientation', 'policies', 'academic', 'RTD Academy'],
    difficulty: 'beginner',
    
    // Default AI configuration
    aiConfig: {
      model: 'DEFAULT_CHAT_MODEL',
      temperature: 'BALANCED',
      maxTokens: 'MEDIUM'
    },
    
    // Default chat configuration
    chatConfig: {
      showYouTube: false,
      showUpload: false,
      allowContentRemoval: true,
      showResourcesAtTop: false,
      predefinedYouTubeVideos: [],
      predefinedFiles: [],
      predefinedFilesDisplayNames: {}
    }
  },

  // Math courses (Course 3)
  math: {
    instructions: `You are a helpful mathematics tutor. Your role is to:
- Help students understand mathematical concepts clearly
- Guide them through problem-solving step by step
- Encourage logical thinking and mathematical reasoning
- Use appropriate mathematical notation and terminology
- Be patient and supportive

When a student asks a question but isn't clear about what specific help they need, ask probing questions to determine exactly where they may be having difficulties.`,

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
          text: `Hello${firstName !== 'there' ? ` ${firstName}` : ''}! I'm your AI math tutor. I'm here to help you understand mathematical concepts and solve problems. 

${firstName !== 'there' ? `I know your name is ${firstName}, so I'll make sure to address you personally throughout our conversation. ` : ''}What would you like to work on today?`,
          timestamp: Date.now()
        }
      ];
    },

    contextKeywords: ['mathematics', 'math', 'algebra', 'calculus', 'problem-solving'],
    difficulty: 'intermediate',
    
    aiConfig: {
      model: 'DEFAULT_CHAT_MODEL',
      temperature: 'BALANCED',
      maxTokens: 'MEDIUM'
    },
    
    chatConfig: {
      showYouTube: true,
      showUpload: true,
      allowContentRemoval: true,
      showResourcesAtTop: true,
      predefinedYouTubeVideos: [],
      predefinedFiles: [],
      predefinedFilesDisplayNames: {}
    }
  }
};

/**
 * Get the appropriate default prompt for a course
 */
const getDefaultPromptForCourse = (courseId) => {
  const courseIdStr = String(courseId);
  
  switch(courseIdStr) {
    case '2':
    case '0':
      return courseDefaultPrompts.physics;
    case '3':
      return courseDefaultPrompts.math;
    case '4':
      return courseDefaultPrompts.orientation;
    default:
      // Fallback to physics prompt for unknown courses
      return courseDefaultPrompts.physics;
  }
};

// Keep a reference to the physics prompt as the general default
const defaultPrompt = courseDefaultPrompts.physics;

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
  
  // Pattern 5: Handle numbered lessons like "01_physics_20_review", "02_momentum_one_dimension"
  const numberedLessonPattern = /^(\d{2})_(.+)$/;
  const numberedMatch = itemId.match(numberedLessonPattern);
  if (numberedMatch) {
    const lessonNumber = numberedMatch[1];
    const lessonName = numberedMatch[2].replace(/_/g, '-');
    return `${lessonNumber}-${lessonName}`;
  }
  
  // Pattern 6: Handle lab format like "lab_momentum_conservation"
  if (itemId.startsWith('lab_')) {
    // Find the lesson number by looking at the actual folder structure
    // For now, we'll use a mapping for known labs
    const labMappings = {
      'lab_momentum_conservation': '07-lab-momentum-conservation',
      'lab_mirrors_lenses': '15-lab-mirrors-lenses',
      'lab_laser_wavelength': '20-lab-laser-wavelength',
      'lab_electrostatic': '27-lab-electrostatic',
      'lab_electric_fields': '33-lab-electric-fields',
      'lab_electromagnet': '43-lab-electromagnet',
      'lab_plancks_constant': '54-lab-plancks-constant',
      'lab_millikans_oil_drop': '56-lab-millikans-oil-drop',
      'lab_marshmallow_speed_light': '58-lab-marshmallow-speed-light',
      'lab_half_life': '68-lab-half-life'
    };
    
    if (labMappings[itemId]) {
      return labMappings[itemId];
    }
  }
  
  // Pattern 7: Handle assignment format like "assignment_l1_3"
  if (itemId.startsWith('assignment_')) {
    const assignmentMappings = {
      'assignment_l1_3': '05-l1-3-assignment',
      'assignment_l1_4': '08-l1-4-cumulative-assignment',
      'assignment_l5_7': '12-l5-7-assignment',
      'assignment_l8_9': '16-l8-9-assignment',
      'assignment_l1_12': '21-l1-12-cumulative-assignment',
      'assignment_l13_14': '28-l13-14-assignment',
      'assignment_l15_18': '34-l15-18-assignment',
      'assignment_l1_18': '35-l1-18-cumulative-assignment',
      'assignment_l19_21': '39-l19-21-assignment',
      'assignment_l22_24': '44-l22-24-assignment',
      'assignment_l1_24': '45-l1-24-cumulative-assignment',
      'assignment_l25_27': '52-l25-27-assignment',
      'assignment_l28_30': '59-l28-30-assignment',
      'assignment_l31_33': '63-l31-33-assignment',
      'assignment_l1_34': '65-l1-34-cumulative-assignment',
      'assignment_l35_36': '69-l35-36-assignment',
      'assignment_l37_38': '72-l37-38-assignment',
      'assignment_l1_38': '73-l1-38-cumulative-assignment'
    };
    
    if (assignmentMappings[itemId]) {
      return assignmentMappings[itemId];
    }
  }
  
  // Pattern 8: Handle exam format like "exam_section_1"
  if (itemId.startsWith('exam_')) {
    const examMappings = {
      'exam_section_1': '24-section-1-exam',
      'exam_section_2': '48-section-2-exam',
      'exam_section_3': '76-section-3-exam'
    };
    
    if (examMappings[itemId]) {
      return examMappings[itemId];
    }
  }
  
  // Keep the old special mappings as a fallback
  const specialMappings = {
    'q1_physics_20_review': '01-physics-20-review',
    'q2_momentum_1d': '02-momentum-one-dimension',
    'q3_momentum_2d': '03-momentum-two-dimensions',
    // Add current itemId mappings based on actual course structure
    '01_physics_20_review': '01-physics-20-review',
    '02_momentum_one_dimension': '02-momentum-one-dimension',
    '03_momentum_two_dimensions': '03-momentum-two-dimensions',
    '04_impulse_momentum_change': '04-impulse-momentum-change',
    '05_l1_3_assignment': '05-l1-3-assignment',
    '06_graphing_techniques': '06-graphing-techniques',
    '07_lab_momentum_conservation': '07-lab-momentum-conservation',
    '08_l1_4_cumulative_assignment': '08-l1-4-cumulative-assignment',
    '09_introduction_to_light': '09-introduction-to-light',
    '10_reflection_of_light': '10-reflection-of-light',
    '11_curved_mirrors': '11-curved-mirrors',
    '12_l5_7_assignment': '12-l5-7-assignment',
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
    return getDefaultPromptForCourse(courseId || '2'); // Use course-specific default
  }

  // Check cache first
  const cacheKey = `${courseId}-${itemId}`;
  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey);
  }

  // Get the course-specific default prompt
  const courseDefaultPrompt = getDefaultPromptForCourse(courseId);

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
      return courseDefaultPrompt;
    }
  } catch (error) {
    // File doesn't exist or failed to load
    console.log(`No custom AI prompt found for lesson: ${itemId}, using course-specific default`);
    
    // Cache the course-specific default to avoid repeated failed imports
    promptCache.set(cacheKey, courseDefaultPrompt);
    return courseDefaultPrompt;
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
    // No custom course default prompt, use built-in course-specific default
    return getDefaultPromptForCourse(courseId);
  }
  
  return getDefaultPromptForCourse(courseId);
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
    
  
  };
};