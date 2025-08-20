/**
 * Assessment Functions for Welcome to RTD Academy
 * Course: 4 (RTD Academy Orientation)
 * Content: 01-welcome-rtd-academy
 * 
 * This module provides AI-powered assessments for RTD Academy orientation
 * using the shared assessment system with general educational configuration.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type (will be overridden by database config if available)
const activityDefaults = {
  theme: 'purple',
  maxAttempts: 3,
  pointsValue: 1
};

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
 * Question Pools for Welcome to RTD Academy
 * 
 * Three separate question pools for different aspects of the lesson
 */

// Question pool 1: RTD Academy mission and approach
const questionPool1 = [
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
];

// Question pool 2: Learning strategies and vision
const questionPool2 = [
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
];

// Question pool 3: RTD Academy features and responsibilities
const questionPool3 = [
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
];

/**
 * Assessment Configurations for Universal Assessment Function
 * 
 * Export plain configuration objects that the universal assessment function
 * can use to instantiate StandardMultipleChoiceCore handlers
 */
const assessmentConfigs = {
  'course4_01_welcome_rtd_academy_knowledge_check': {
    type: 'multiple-choice',
    questions: questionPool1,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'RTD Academy Orientation',
    gradeLevel: 'Multi-Grade',
    topic: 'RTD Academy Introduction',
    learningObjectives: [
      'Understand RTD Academy\'s mission and approach',
      'Explain the concept of asynchronous learning',
      'Identify key tools and systems used at RTD Academy',
      'Recognize the benefits of flexible online education'
    ]
  },
  
  'course4_01_welcome_rtd_academy_question2': {
    type: 'multiple-choice',
    questions: questionPool2,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'RTD Academy Orientation',
    gradeLevel: 'Multi-Grade',
    topic: 'Learning Strategies and Vision',
    learningObjectives: [
      'Understand the benefits of asynchronous learning',
      'Identify strategies for staying motivated in online learning',
      'Recognize RTD Academy\'s vision and goals',
      'Apply time management and goal-setting techniques'
    ]
  },
  
  'course4_01_welcome_rtd_academy_question3': {
    type: 'multiple-choice',
    questions: questionPool3,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'RTD Academy Orientation',
    gradeLevel: 'Multi-Grade',
    topic: 'RTD Academy Features and Student Responsibilities',
    learningObjectives: [
      'Understand the concept of rolling enrollment',
      'Recognize key responsibilities in asynchronous learning',
      'Identify unique features of RTD Academy\'s approach',
      'Apply organizational and time management skills'
    ]
  }
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};
