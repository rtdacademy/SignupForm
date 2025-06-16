/**
 * Assessment Functions for Welcome to RTD Academy
 * Course: 4 (RTD Academy Orientation)
 * Content: 01-welcome-rtd-academy
 * 
 * This module provides AI-powered assessments for RTD Academy orientation
 * using the shared assessment system with general educational configuration.
 */

const { createAILongAnswer } = require('../../../shared/assessment-types/ai-long-answer');
const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');
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

/**
 * Standard Multiple Choice Questions for Welcome to RTD Academy Knowledge Check
 * Function name: course4_01_welcome_rtd_academy_knowledge_check
 * 
 * This assessment tests student understanding of key concepts from the lesson:
 * - RTD Academy's mission and approach
 * - Asynchronous learning concepts
 * - Essential tools and systems
 */
exports.course4_01_welcome_rtd_academy_knowledge_check = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What is RTD Academy's mission?",
      options: [
        { 
          id: 'a', 
          text: 'To provide in-person classroom education only', 
          feedback: 'Incorrect. RTD Academy specializes in online education with flexible scheduling.' 
        },
        { 
          id: 'b', 
          text: 'To provide flexible, high-quality online education in Math, Physics, and STEM subjects', 
          feedback: 'Correct! RTD Academy provides flexible, high-quality online education that fits students\' schedules and learning styles.' 
        },
        { 
          id: 'c', 
          text: 'To replace traditional high schools completely', 
          feedback: 'Incorrect. RTD Academy complements traditional education by offering flexible online alternatives.' 
        },
        { 
          id: 'd', 
          text: 'To focus only on diploma exam preparation', 
          feedback: 'Incorrect. While diploma exam prep is important, RTD Academy provides comprehensive course content and learning.' 
        }
      ],
      correctOptionId: 'b',
      explanation: 'RTD Academy\'s mission is to provide flexible, high-quality online education in Math, Physics, and STEM subjects. They believe every student deserves access to excellent education that fits their schedule and learning style.',
      difficulty: 'beginner',
      tags: ['mission', 'rtd-academy', 'online-education']
    },
    {
      questionText: "What does 'asynchronous learning' mean at RTD Academy?",
      options: [
        { 
          id: 'a', 
          text: 'You must be online at the same time as your instructors', 
          feedback: 'Incorrect. This describes synchronous learning, not asynchronous learning.' 
        },
        { 
          id: 'b', 
          text: 'You can only access materials during business hours', 
          feedback: 'Incorrect. Asynchronous learning provides 24/7 access to course materials.' 
        },
        { 
          id: 'c', 
          text: 'You can access course materials and complete work when it fits your schedule', 
          feedback: 'Correct! Asynchronous learning means you don\'t need to be online at the same time as instructors or other students.' 
        },
        { 
          id: 'd', 
          text: 'You must complete all work within specific daily time slots', 
          feedback: 'Incorrect. Asynchronous learning provides flexibility in when you complete your work.' 
        }
      ],
      correctOptionId: 'c',
      explanation: 'Asynchronous learning means you don\'t need to be online at the same time as your instructors or other students. You can access your course materials, complete assignments, and engage with content when it works best for your schedule.',
      difficulty: 'intermediate',
      tags: ['asynchronous-learning', 'flexibility', 'schedule']
    },
    {
      questionText: "Which of the following is NOT one of the essential tools or systems mentioned for RTD Academy students?",
      options: [
        { 
          id: 'a', 
          text: 'Learning Management System (LMS) for accessing course content', 
          feedback: 'Incorrect. The LMS is mentioned as your digital classroom for course materials and assignments.' 
        },
        { 
          id: 'b', 
          text: 'YourWay Portal for managing schedules and registration', 
          feedback: 'Incorrect. YourWay Portal is mentioned as your personal academic dashboard.' 
        },
        { 
          id: 'c', 
          text: 'MyPass for official transcripts and diploma exam registration', 
          feedback: 'Incorrect. MyPass is mentioned as Alberta\'s official student record system.' 
        },
        { 
          id: 'd', 
          text: 'Zoom for mandatory daily video conferences', 
          feedback: 'Correct! Zoom for mandatory daily video conferences is NOT mentioned as an essential tool, as RTD Academy uses asynchronous learning.' 
        }
      ],
      correctOptionId: 'd',
      explanation: 'RTD Academy uses asynchronous learning, which means there are no mandatory daily video conferences. The essential tools mentioned are the LMS, YourWay Portal, MyPass, and Proctorio for secure exam monitoring.',
      difficulty: 'intermediate',
      tags: ['tools', 'systems', 'lms', 'yourway', 'mypass']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: activityDefaults.theme,
  
  // Selection settings
  randomizeQuestions: true,
  randomizeOptions: true,
  allowSameQuestion: false,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'RTD Academy Introduction',
  learningObjectives: [
    'Understand RTD Academy\'s mission and approach',
    'Explain the concept of asynchronous learning',
    'Identify key tools and systems used at RTD Academy',
    'Recognize the benefits of flexible online education'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Questions for Welcome to RTD Academy - Question 2
 * Function name: course4_01_welcome_rtd_academy_question2
 * 
 * This assessment provides a second set of questions focusing on:
 * - Learning strategies and time management
 * - Technology requirements and digital citizenship
 * - Support resources and communication
 */
exports.course4_01_welcome_rtd_academy_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What is one of the key benefits of asynchronous learning mentioned in the lesson?",
      options: [
        { 
          id: 'a', 
          text: 'You must attend live video conferences daily', 
          feedback: 'Incorrect. Asynchronous learning means you do NOT need to attend live sessions.' 
        },
        { 
          id: 'b', 
          text: 'You can learn at your own pace and access materials 24/7', 
          feedback: 'Correct! Asynchronous learning provides flexibility to learn when it works best for your schedule.' 
        },
        { 
          id: 'c', 
          text: 'All assignments must be completed within the same day', 
          feedback: 'Incorrect. Asynchronous learning allows you to work on assignments over time.' 
        },
        { 
          id: 'd', 
          text: 'You can only access course materials during business hours', 
          feedback: 'Incorrect. Course materials are available 24/7 in asynchronous learning.' 
        }
      ],
      correctOptionId: 'b',
      explanation: 'Asynchronous learning\'s main benefit is flexibility - you can access course materials, complete assignments, and learn when it works best for your schedule, with 24/7 availability.',
      difficulty: 'beginner',
      tags: ['asynchronous-learning', 'benefits', 'flexibility']
    },
    {
      questionText: "According to the lesson, what should you do to stay motivated in asynchronous learning?",
      options: [
        { 
          id: 'a', 
          text: 'Wait for your instructor to contact you first', 
          feedback: 'Incorrect. You should be proactive in your learning and communication.' 
        },
        { 
          id: 'b', 
          text: 'Only study when you feel like it', 
          feedback: 'Incorrect. Consistent study habits are important for success.' 
        },
        { 
          id: 'c', 
          text: 'Set weekly goals and celebrate small wins', 
          feedback: 'Correct! Setting goals and acknowledging progress helps maintain motivation in self-directed learning.' 
        },
        { 
          id: 'd', 
          text: 'Avoid asking questions until the end of the course', 
          feedback: 'Incorrect. You should ask questions early and regularly communicate with instructors.' 
        }
      ],
      correctOptionId: 'c',
      explanation: 'The lesson recommends setting weekly goals and celebrating small wins as key strategies to stay motivated. This helps maintain momentum and provides regular feedback on your progress.',
      difficulty: 'intermediate',
      tags: ['motivation', 'study-strategies', 'goal-setting']
    },
    {
      questionText: "What is RTD Academy's vision as described in the lesson?",
      options: [
        { 
          id: 'a', 
          text: 'To replace all traditional schools in Alberta', 
          feedback: 'Incorrect. RTD Academy complements rather than replaces traditional education.' 
        },
        { 
          id: 'b', 
          text: 'To be Alberta\'s premier destination for personalized, technology-enhanced learning', 
          feedback: 'Correct! RTD Academy aims to be the leading provider of personalized, technology-enhanced education in Alberta.' 
        },
        { 
          id: 'c', 
          text: 'To focus only on students who struggle in traditional classrooms', 
          feedback: 'Incorrect. RTD Academy serves all students seeking flexible, high-quality online education.' 
        },
        { 
          id: 'd', 
          text: 'To provide the cheapest online education available', 
          feedback: 'Incorrect. The focus is on quality and personalization, not just being the lowest cost option.' 
        }
      ],
      correctOptionId: 'b',
      explanation: 'RTD Academy\'s vision is to be Alberta\'s premier destination for personalized, technology-enhanced learning that empowers students to achieve their academic goals on their own terms.',
      difficulty: 'beginner',
      tags: ['vision', 'rtd-academy', 'personalized-learning']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: activityDefaults.theme,
  
  // Selection settings
  randomizeQuestions: true,
  randomizeOptions: true,
  allowSameQuestion: false,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Learning Strategies and Vision',
  learningObjectives: [
    'Understand the benefits of asynchronous learning',
    'Identify strategies for staying motivated in online learning',
    'Recognize RTD Academy\'s vision and goals',
    'Apply time management and goal-setting techniques'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Questions for Welcome to RTD Academy - Question 3
 * Function name: course4_01_welcome_rtd_academy_question3
 * 
 * This assessment provides a third set of questions focusing on:
 * - Time management and study strategies
 * - Academic expectations and digital citizenship
 * - Rolling enrollment and unique RTD features
 */
exports.course4_01_welcome_rtd_academy_question3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What does 'rolling enrollment' mean at RTD Academy?",
      options: [
        { 
          id: 'a', 
          text: 'Students must complete courses within a rolling 12-month period', 
          feedback: 'Incorrect. Rolling enrollment refers to when you can start, not how long you have to complete courses.' 
        },
        { 
          id: 'b', 
          text: 'You can start your courses when you\'re ready, not when the semester starts', 
          feedback: 'Correct! Rolling enrollment means continuous enrollment throughout the year, allowing you to start when it works for you.' 
        },
        { 
          id: 'c', 
          text: 'Courses rotate between different subjects each month', 
          feedback: 'Incorrect. Rolling enrollment is about start times, not course rotation.' 
        },
        { 
          id: 'd', 
          text: 'Students are grouped into cohorts that move together', 
          feedback: 'Incorrect. Rolling enrollment actually allows for individual start times rather than cohort-based learning.' 
        }
      ],
      correctOptionId: 'b',
      explanation: 'Rolling enrollment is one of RTD Academy\'s key features - it allows students to start their courses when they\'re ready rather than waiting for traditional semester start dates.',
      difficulty: 'beginner',
      tags: ['rolling-enrollment', 'flexibility', 'start-dates']
    },
    {
      questionText: "According to the lesson, what is one of your key responsibilities as an asynchronous learner?",
      options: [
        { 
          id: 'a', 
          text: 'Wait for detailed daily instructions from your teacher', 
          feedback: 'Incorrect. Asynchronous learning requires more self-direction and initiative.' 
        },
        { 
          id: 'b', 
          text: 'Only communicate with instructors during scheduled office hours', 
          feedback: 'Incorrect. While office hours are available, communication should be ongoing as needed.' 
        },
        { 
          id: 'c', 
          text: 'Stay organized and manage your time effectively', 
          feedback: 'Correct! Time management and organization are crucial responsibilities for success in asynchronous learning.' 
        },
        { 
          id: 'd', 
          text: 'Complete all work at the last possible moment', 
          feedback: 'Incorrect. Effective time management involves steady progress, not last-minute completion.' 
        }
      ],
      correctOptionId: 'c',
      explanation: 'As an asynchronous learner, staying organized and managing your time effectively is essential. You have the freedom to learn on your schedule, but this requires self-discipline and good planning.',
      difficulty: 'intermediate',
      tags: ['responsibilities', 'time-management', 'organization']
    },
    {
      questionText: "What makes RTD Academy's approach to education unique compared to traditional schools?",
      options: [
        { 
          id: 'a', 
          text: 'It only offers math and science courses', 
          feedback: 'Incorrect. While RTD Academy specializes in Math, Physics, and STEM, this isn\'t what makes it unique.' 
        },
        { 
          id: 'b', 
          text: 'It combines AI-enhanced learning with personalized, flexible scheduling', 
          feedback: 'Correct! RTD Academy\'s combination of AI tutoring, adaptive assessments, and flexible scheduling creates a unique learning environment.' 
        },
        { 
          id: 'c', 
          text: 'Students never interact with real teachers', 
          feedback: 'Incorrect. RTD Academy has qualified instructors available for support and guidance.' 
        },
        { 
          id: 'd', 
          text: 'All courses must be completed within one month', 
          feedback: 'Incorrect. RTD Academy\'s flexibility allows students to work at their own pace.' 
        }
      ],
      correctOptionId: 'b',
      explanation: 'RTD Academy is unique because it combines cutting-edge AI technology (like AI tutoring and adaptive assessments) with the flexibility of personalized scheduling and asynchronous learning.',
      difficulty: 'advanced',
      tags: ['unique-features', 'ai-enhanced', 'personalized-learning']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: activityDefaults.theme,
  
  // Selection settings
  randomizeQuestions: true,
  randomizeOptions: true,
  allowSameQuestion: false,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'RTD Academy Features and Student Responsibilities',
  learningObjectives: [
    'Understand the concept of rolling enrollment',
    'Recognize key responsibilities in asynchronous learning',
    'Identify unique features of RTD Academy\'s approach',
    'Apply organizational and time management skills'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});