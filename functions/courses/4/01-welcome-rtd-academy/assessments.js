/**
 * Assessment Functions for Welcome to RTD Academy
 * Course: 4 (RTD Academy Orientation)
 * Content: 01-welcome-rtd-academy
 * 
 * This module provides AI-powered assessments for RTD Academy orientation
 * using the shared assessment system with general educational configuration.
 */

const { createAILongAnswer } = require('../../../shared/assessment-types/ai-long-answer');
const { getActivityTypeSettings, getWordLimitsForDifficulty } = require('../../../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../../../courses-config/4/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
// This determines which default settings are used from course-config.json
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);
const longAnswerDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE, 'longAnswer');

// Define custom rubrics for RTD Academy orientation
// Using course config: totalPoints = 5, rubricCriteria = 3
const RTD_ACADEMY_RUBRICS = {
  beginner: [
    {
      criterion: "Educational Goals",
      points: 2,
      description: "Clearly identifies and explains educational goals",
      levels: {
        0: "No clear goals identified or explanation is unclear",
        1: "Basic goals mentioned but explanation lacks detail",
        2: "Clear goals identified with thoughtful explanation"
      }
    },
    {
      criterion: "Learning Preferences",
      points: 2,
      description: "Describes personal learning style and preferences",
      levels: {
        0: "No learning preferences mentioned or described",
        1: "Basic mention of learning preferences without detail",
        2: "Clear description of learning preferences with examples"
      }
    },
    {
      criterion: "Communication Quality",
      points: 1,
      description: "Clear, well-organized writing that effectively communicates ideas",
      levels: {
        0: "Writing is unclear, disorganized, or difficult to understand",
        1: "Writing is clear and well-organized"
      }
    }
  ],
  intermediate: [
    {
      criterion: "Goal Setting and Planning",
      points: 2,
      description: "Demonstrates thoughtful goal setting with specific, achievable objectives",
      levels: {
        0: "Goals are vague, unrealistic, or poorly defined",
        1: "Goals are somewhat clear but lack specificity",
        2: "Goals are clear, specific, and achievable"
      }
    },
    {
      criterion: "Self-Awareness",
      points: 2,
      description: "Shows understanding of personal learning strengths and challenges",
      levels: {
        0: "Limited self-awareness about learning strengths and challenges",
        1: "Basic self-awareness with some recognition of strengths/challenges",
        2: "Good self-awareness with clear identification of strengths and challenges"
      }
    },
    {
      criterion: "Academy Integration",
      points: 1,
      description: "Connects personal goals with RTD Academy's resources and opportunities",
      levels: {
        0: "No clear connection made between goals and academy resources",
        1: "Good connection showing understanding of academy resources"
      }
    }
  ],
  advanced: [
    {
      criterion: "Strategic Planning",
      points: 2,
      description: "Develops comprehensive educational strategy with clear milestones",
      levels: {
        0: "No strategic planning evident or strategy is unclear",
        1: "Basic strategic thinking with limited planning detail",
        2: "Comprehensive strategic plan with detailed milestones"
      }
    },
    {
      criterion: "Growth Mindset",
      points: 2,
      description: "Demonstrates understanding of growth mindset and continuous improvement",
      levels: {
        0: "No evidence of growth mindset or improvement orientation",
        1: "Basic understanding of growth concepts",
        2: "Exceptional growth mindset with detailed improvement strategies"
      }
    },
    {
      criterion: "Future Orientation",
      points: 1,
      description: "Connects current learning to future goals and career aspirations",
      levels: {
        0: "No connection made to future goals or aspirations",
        1: "Good connection showing understanding of future implications"
      }
    }
  ]
};

/**
 * AI-powered long answer assessment for Welcome to RTD Academy
 * Function name: course4_01_welcome_rtd_academy_aiLongAnswer
 * 
 * CONFIGURATION GUIDE:
 * All parameters below can be customized. Current values use course defaults or
 * are specifically tailored for the RTD Academy orientation experience.
 */
exports.course4_01_welcome_rtd_academy_aiLongAnswer = createAILongAnswer({
  // ===== REQUIRED: Activity Type =====
  activityType: ACTIVITY_TYPE,
  
  // ===== STANDARD RUBRICS =====
  // Use the predefined rubrics for RTD Academy orientation
  rubrics: RTD_ACADEMY_RUBRICS,
  
  // ===== REQUIRED: Course-specific prompts =====
  prompts: {
    beginner: `Create a reflective question for a new RTD Academy student about their educational goals and learning preferences.
    
    The question should ask students to:
    - Identify their main educational goals for this course
    - Describe their preferred learning style (visual, auditory, hands-on, etc.)
    - Explain what they hope to gain from RTD Academy's approach
    - Share any concerns or expectations they have
    
    Word limit: ${longAnswerDefaults.wordLimits.min}-${longAnswerDefaults.wordLimits.max} words
    
    Use the provided rubric exactly as given - do not modify the criteria or point values.`,
    
    intermediate: `Create a comprehensive reflection question for an RTD Academy student about their learning journey and goals.
    
    The question should ask students to:
    - Set specific, measurable educational goals for their time at RTD Academy
    - Analyze their learning strengths and areas for improvement
    - Explain how they plan to use RTD Academy's resources effectively
    - Reflect on how this education connects to their future plans
    
    Word limit: ${longAnswerDefaults.wordLimits.min}-${longAnswerDefaults.wordLimits.max} words
    
    Use the provided rubric exactly as given - do not modify the criteria or point values.`,
    
    advanced: `Create an in-depth strategic planning question for an RTD Academy student about their educational journey.
    
    The question should ask students to:
    - Develop a comprehensive learning strategy with specific milestones
    - Analyze how they will overcome challenges and leverage opportunities
    - Explain their approach to using technology and AI tools for learning
    - Connect their RTD Academy experience to long-term career and life goals
    
    Word limit: ${longAnswerDefaults.wordLimits.min}-${longAnswerDefaults.wordLimits.max} words
    
    Use the provided rubric exactly as given - do not modify the criteria or point values.`
  },
  
  // ===== ASSESSMENT SETTINGS =====
  // These use values from course-config.json -> activityTypes[ACTIVITY_TYPE]
  maxAttempts: activityDefaults.maxAttempts,                      // Course default: 999
  theme: activityDefaults.theme,                                 // Course default: 'purple'
  allowDifficultySelection: activityDefaults.allowDifficultySelection, // Course default: false
  defaultDifficulty: activityDefaults.defaultDifficulty,         // Course default: 'intermediate'
  
  // ===== LONG ANSWER SPECIFIC SETTINGS =====
  // These use values from course-config.json -> activityTypes[ACTIVITY_TYPE].longAnswer
  totalPoints: longAnswerDefaults.totalPoints,                   // Course default: 5
  rubricCriteria: longAnswerDefaults.rubricCriteria,             // Course default: 3
  wordLimits: longAnswerDefaults.wordLimits,                     // Course default: {min: 50, max: 200}
  showRubric: longAnswerDefaults.showRubric,                     // Course default: true
  showWordCount: longAnswerDefaults.showWordCount,               // Course default: true
  showHints: activityDefaults.enableHints,                       // Course default: true
  
  // ===== AI GENERATION SETTINGS =====
  // These use values from course-config.json -> activityTypes[ACTIVITY_TYPE].aiSettings
  aiSettings: {
    temperature: activityDefaults.aiSettings.temperature,        // Course default: 0.7
    topP: activityDefaults.aiSettings.topP,                     // Course default: 0.9
    topK: 40  // Not in config, using assessment system default
  },
  
  // ===== FORMATTING OPTIONS =====
  katexFormatting: false, // No math needed for this orientation course
  
  // ===== COURSE METADATA =====
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Educational Goals and Learning Preferences',
  learningObjectives: [
    'Reflect on personal educational goals and motivations',
    'Identify individual learning preferences and styles',
    'Understand RTD Academy\'s educational approach and resources',
    'Develop strategies for successful online learning'
  ],
  
  // ===== AI CHAT INTEGRATION =====
  enableAIChat: true,
  aiChatContext: "This assessment helps new RTD Academy students reflect on their educational goals and learning preferences. Students often need guidance on: 1) Setting realistic and specific goals, 2) Understanding different learning styles, 3) Making the most of online learning resources, 4) Connecting current learning to future aspirations. The rubric emphasizes thoughtful reflection and clear communication.",
  
  // ===== EVALUATION GUIDANCE =====
  evaluationGuidance: {
    commonMistakes: [
      "Setting vague or unrealistic goals without specific details",
      "Not connecting learning preferences to practical study strategies",
      "Failing to mention RTD Academy's specific resources or approaches",
      "Writing without clear organization or structure",
      "Not demonstrating genuine reflection or self-awareness"
    ],
    scoringNotes: {
      beginner: "Focus on basic goal identification and learning preference awareness. Use the 4-level rubric (0-3 points per criterion).",
      intermediate: "Expect more detailed goal setting and self-analysis. Balance reflection quality with practical planning.",
      advanced: "Look for sophisticated strategic thinking and comprehensive integration of concepts."
    },
    scoringReminder: "IMPORTANT: Only assign whole number scores (0, 1, 2, or 3) based on the rubric levels. No partial points."
  },
  
  // ===== FALLBACK QUESTIONS =====
  fallbackQuestions: [
    {
      questionText: "Welcome to RTD Academy! Take a moment to reflect on your educational journey. What are your main learning goals for this course? Describe your preferred learning style (visual, auditory, hands-on, etc.) and explain what you hope to gain from RTD Academy's personalized approach to education.",
      rubric: RTD_ACADEMY_RUBRICS.intermediate,
      maxPoints: longAnswerDefaults.totalPoints,
      wordLimit: longAnswerDefaults.wordLimits,
      sampleAnswer: `My main learning goals are to successfully complete my coursework while developing better study habits. I want to improve my understanding of subjects where I've struggled in traditional classroom settings.

I'm primarily a visual learner who benefits from diagrams and written instructions. I prefer to work at my own pace rather than being rushed through material.

From RTD Academy's personalized approach, I hope to gain a flexible learning schedule that accommodates my responsibilities. I'm excited about the AI-powered tools and personalized support that will help me succeed.`,
      difficulty: 'intermediate'
    },
    {
      questionText: "As you begin your journey at RTD Academy, what are your educational goals? Describe how you learn best and what you hope to achieve through our personalized learning approach.",
      rubric: RTD_ACADEMY_RUBRICS.beginner,
      maxPoints: longAnswerDefaults.totalPoints,
      wordLimit: longAnswerDefaults.wordLimits,
      sampleAnswer: `My main educational goal is to successfully complete my coursework and graduate. I want to improve my grades and better understand challenging subjects.

I learn best through visual materials like diagrams and videos, and I prefer to work at my own pace. I'm a hands-on learner who benefits from interactive activities.

From RTD Academy's personalized approach, I hope to get more individual attention than I received in traditional school. I expect RTD Academy will help me build confidence in my academic abilities.`,
      difficulty: 'beginner'
    }
  ],
  
  // ===== CLOUD FUNCTION SETTINGS =====
  timeout: 180,
  memory: '1GiB',
  region: 'us-central1'
});