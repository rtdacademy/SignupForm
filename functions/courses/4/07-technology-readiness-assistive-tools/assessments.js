/**
 * Assessment Functions for Technology Readiness & Assistive Tools
 * Course: 4 (RTD Academy Orientation - COM1255)
 * Content: 07-technology-readiness-assistive-tools
 * 
 * This module provides assessments for understanding technology setup,
 * hardware/software requirements, ergonomics, file organization, accessibility features,
 * and RTD Academy tech support using the shared assessment system.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type (will be overridden by database config if available)
const activityDefaults = {
  theme: 'cyan',
  maxAttempts: 1,
  pointsValue: 1
};

/**
 * Question Pool 1 - System Requirements Knowledge
 */
const questionPool1 = [
  {
    questionText: "What is the minimum internet speed recommended for RTD Academy courses?",
    options: [
      { 
        id: 'a', 
        text: '5 Mbps download',
        feedback: 'Incorrect. While 5 Mbps might work for basic browsing, RTD Academy recommends higher speeds for optimal learning experience.'
      },
      { 
        id: 'b', 
        text: '25 Mbps download, 3 Mbps upload',
        feedback: 'Correct! RTD Academy recommends at least 25 Mbps download and 3 Mbps upload for smooth video streaming, proctored exams, and content access.'
      },
      { 
        id: 'c', 
        text: '10 Mbps download',
        feedback: 'Incorrect. While 10 Mbps is better than 5, RTD Academy recommends 25 Mbps download for optimal performance.'
      },
      { 
        id: 'd', 
        text: '50 Mbps download, 10 Mbps upload',
        feedback: 'Incorrect. While this exceeds requirements, the minimum recommendation is 25 Mbps download and 3 Mbps upload.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Reliable internet with at least 25 Mbps download and 3 Mbps upload ensures smooth video streaming, file uploads, and proctored exam functionality without interruptions.',
    difficulty: 'beginner',
    tags: ['internet-speed', 'system-requirements', 'technical-specs']
  }
];

/**
 * Question Pool 2 - Internet Connection Requirements
 */
const questionPool2 = [
  {
    questionText: "Why is a wired internet connection preferred over Wi-Fi for proctored exams?",
    options: [
      { 
        id: 'a', 
        text: 'Wired connections are faster than Wi-Fi',
        feedback: 'Partially correct, but the main reason is stability and reliability, not just speed.'
      },
      { 
        id: 'b', 
        text: 'Wi-Fi doesn\'t work with proctoring software',
        feedback: 'Incorrect. Wi-Fi can work with proctoring software, but wired connections are more reliable.'
      },
      { 
        id: 'c', 
        text: 'Wired connections provide more stable and reliable connectivity',
        feedback: 'Correct! Wired connections offer more consistent connectivity, reducing the risk of disconnections during critical exam moments.'
      },
      { 
        id: 'd', 
        text: 'Proctored exams require ethernet cables specifically',
        feedback: 'Incorrect. While wired is preferred, the requirement is about stability, not a specific cable type.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'During proctored exams, any interruption in internet connectivity can affect exam validity. Wired connections provide more stable, consistent connectivity compared to Wi-Fi, which can be affected by interference or signal strength.',
    difficulty: 'intermediate',
    tags: ['internet-connectivity', 'proctored-exams', 'reliability']
  }
];

/**
 * Question Pool 3 - Ergonomic Setup Best Practices
 */
const questionPool3 = [
  {
    questionText: "What is the recommended position for your computer monitor in an ergonomic setup?",
    options: [
      { 
        id: 'a', 
        text: 'Top of screen at eye level, arm\'s length away',
        feedback: 'Correct! The top of your screen should be at or slightly below eye level, positioned about arm\'s length away to reduce neck strain and eye fatigue.'
      },
      { 
        id: 'b', 
        text: 'Center of screen at eye level, as close as possible',
        feedback: 'Incorrect. While center at eye level sounds right, the monitor should be arm\'s length away, not as close as possible.'
      },
      { 
        id: 'c', 
        text: 'Bottom of screen at eye level, within reach',
        feedback: 'Incorrect. Having the bottom of screen at eye level would cause you to look up, creating neck strain.'
      },
      { 
        id: 'd', 
        text: 'Any height is fine as long as you can see clearly',
        feedback: 'Incorrect. Proper monitor height is crucial for preventing neck strain and eye fatigue during long study sessions.'
      }
    ],
    correctOptionId: 'a',
    explanation: 'Proper monitor positioning prevents neck strain and eye fatigue. The top of your screen should be at or slightly below eye level, and the monitor should be about arm\'s length away (50-70 cm) for optimal viewing comfort.',
    difficulty: 'beginner',
    tags: ['ergonomics', 'monitor-setup', 'health-safety']
  }
];

/**
 * Question Pool 4 - Accessibility Features Understanding
 */
const questionPool4 = [
  {
    questionText: "Which accessibility feature would be most helpful for a student with dyslexia?",
    options: [
      { 
        id: 'a', 
        text: 'Screen magnifier',
        feedback: 'Incorrect. Screen magnifiers are primarily for vision impairments, not reading difficulties like dyslexia.'
      },
      { 
        id: 'b', 
        text: 'Text-to-speech (read aloud)',
        feedback: 'Correct! Text-to-speech helps students with dyslexia by allowing them to hear content while following along visually, supporting reading comprehension.'
      },
      { 
        id: 'c', 
        text: 'High contrast colors',
        feedback: 'Incorrect. While high contrast can help some visual processing, text-to-speech is more directly beneficial for dyslexia.'
      },
      { 
        id: 'd', 
        text: 'Keyboard shortcuts',
        feedback: 'Incorrect. While helpful for efficiency, keyboard shortcuts don\'t specifically address dyslexia challenges.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Text-to-speech technology helps students with dyslexia by providing auditory support for reading. This multi-sensory approach (hearing + seeing) can significantly improve comprehension and reduce reading fatigue.',
    difficulty: 'intermediate',
    tags: ['accessibility', 'assistive-technology', 'learning-support']
  }
];

/**
 * Question Pool 5 - Proctored Exam Technology
 */
const questionPool5 = [
  {
    questionText: "What camera and audio setup is required for proctored exams?",
    options: [
      { 
        id: 'a', 
        text: 'Built-in laptop camera and microphone are sufficient',
        feedback: 'Incorrect. While built-in equipment might work, specific requirements ensure proper proctoring functionality.'
      },
      { 
        id: 'b', 
        text: 'External webcam with 720p resolution and working microphone',
        feedback: 'Correct! Proctored exams require at least 720p camera resolution and a functioning microphone for identity verification and exam monitoring.'
      },
      { 
        id: 'c', 
        text: 'Only a microphone is needed, camera is optional',
        feedback: 'Incorrect. Both camera and microphone are required for identity verification and proctoring protocols.'
      },
      { 
        id: 'd', 
        text: 'Professional broadcasting equipment is required',
        feedback: 'Incorrect. Standard webcam equipment is sufficient - professional broadcasting equipment is unnecessary.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Proctored exams require identity verification and continuous monitoring. A camera with at least 720p resolution ensures clear visual identification, and a working microphone allows for audio monitoring and communication if needed.',
    difficulty: 'beginner',
    tags: ['proctored-exams', 'camera-requirements', 'exam-preparation']
  }
];

/**
 * Question Pool 6 - Scenario: Technical Difficulties During Exam
 */
const questionPool6 = [
  {
    questionText: "Sarah is taking a proctored exam when her internet connection becomes unstable, causing the exam platform to freeze. What should she do first?",
    options: [
      { 
        id: 'a', 
        text: 'Restart her computer and continue the exam',
        feedback: 'Incorrect. Restarting without communicating could be seen as suspicious activity by the proctoring system.'
      },
      { 
        id: 'b', 
        text: 'Contact the proctor through the chat feature and explain the situation',
        feedback: 'Correct! Immediate communication with the proctor documents the technical issue and ensures proper handling of the situation.'
      },
      { 
        id: 'c', 
        text: 'Close the exam and email RTD Academy later',
        feedback: 'Incorrect. Closing the exam without communication could result in an incomplete or invalid exam attempt.'
      },
      { 
        id: 'd', 
        text: 'Continue working and hope the connection stabilizes',
        feedback: 'Incorrect. Technical issues should be reported immediately to ensure exam validity and proper documentation.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'When technical issues occur during proctored exams, immediate communication with the proctor is essential. This documents the problem, allows for proper guidance, and ensures the exam can continue or be rescheduled appropriately without academic penalty.',
    difficulty: 'intermediate',
    tags: ['technical-difficulties', 'proctored-exams', 'problem-solving', 'communication']
  }
];

/**
 * Question Pool 7 - Scenario: Student with Vision Impairment
 */
const questionPool7 = [
  {
    questionText: "Marcus has low vision and is struggling to read course content on his computer screen. He's considering dropping his Physics course because of the difficulty. What would be the best advice for Marcus?",
    options: [
      { 
        id: 'a', 
        text: 'Switch to an easier course that requires less reading',
        feedback: 'Incorrect. Marcus shouldn\'t have to compromise his educational goals. Assistive technology can help him succeed in Physics.'
      },
      { 
        id: 'b', 
        text: 'Use screen magnification software and explore text-to-speech options, and contact RTD for accommodation support',
        feedback: 'Correct! Screen magnification and text-to-speech can make content accessible. RTD Academy also provides accommodation support for students with visual impairments.'
      },
      { 
        id: 'c', 
        text: 'Ask family members to read all course content aloud to him',
        feedback: 'Incorrect. While family support is valuable, assistive technology provides more independence and is available anytime Marcus needs it.'
      },
      { 
        id: 'd', 
        text: 'Try to get closer to the screen and use brighter lighting',
        feedback: 'Incorrect. While environmental adjustments can help, proper assistive technology is more effective and reduces eye strain.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Students with vision impairments can succeed in any course with proper assistive technology. Screen magnification, text-to-speech, high contrast settings, and RTD Academy\'s accommodation services can provide the support Marcus needs to excel in Physics.',
    difficulty: 'advanced',
    tags: ['vision-impairment', 'assistive-technology', 'accommodation-services', 'student-support']
  }
];

/**
 * Question Pool 8 - Scenario: Ergonomic Setup Problems
 */
const questionPool8 = [
  {
    questionText: "Emma has been studying at RTD Academy for two weeks and is experiencing neck pain and eye strain. She studies for 3-4 hours at a time on her laptop at the kitchen table. What changes would most likely help her situation?",
    options: [
      { 
        id: 'a', 
        text: 'Take breaks every 30 minutes and reduce daily study time',
        feedback: 'Partially correct. Breaks are important, but the main issue is likely her workspace setup at the kitchen table.'
      },
      { 
        id: 'b', 
        text: 'Set up a proper workspace with external monitor at eye level and ergonomic seating',
        feedback: 'Correct! Kitchen tables and laptop screens are typically too low, causing neck strain. An external monitor at proper height and ergonomic seating would address the root causes.'
      },
      { 
        id: 'c', 
        text: 'Wear glasses or get her eyes checked',
        feedback: 'Incorrect. While eye health is important, the symptoms suggest ergonomic issues rather than vision problems.'
      },
      { 
        id: 'd', 
        text: 'Study in shorter sessions of 1 hour maximum',
        feedback: 'Incorrect. While shorter sessions might reduce exposure to the problem, fixing the ergonomic setup is more important for long-term health.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Neck pain and eye strain from laptop use at kitchen tables is common because laptops position the screen too low. An external monitor at eye level, proper chair height, and dedicated workspace would eliminate the need to crane her neck downward.',
    difficulty: 'intermediate',
    tags: ['ergonomic-problems', 'workspace-setup', 'health-issues', 'laptop-ergonomics']
  }
];

/**
 * Assessment Configurations for Universal Assessment Function
 * 
 * Export plain configuration objects that the universal assessment function
 * can use to instantiate StandardMultipleChoiceCore handlers
 */
const assessmentConfigs = {
  'course4_07_technology_readiness_question1': {
    type: 'multiple-choice',
    questions: questionPool1,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question2': {
    type: 'multiple-choice',
    questions: questionPool2,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question3': {
    type: 'multiple-choice',
    questions: questionPool3,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question4': {
    type: 'multiple-choice',
    questions: questionPool4,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question5': {
    type: 'multiple-choice',
    questions: questionPool5,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question6': {
    type: 'multiple-choice',
    questions: questionPool6,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question7': {
    type: 'multiple-choice',
    questions: questionPool7,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_07_technology_readiness_question8': {
    type: 'multiple-choice',
    questions: questionPool8,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 3,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: false,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  }
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};