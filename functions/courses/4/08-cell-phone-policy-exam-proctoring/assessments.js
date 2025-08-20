/**
 * Assessment Functions for Cell Phone Policy & Exam Proctoring
 * Course: 4 (RTD Academy Orientation - COM1255)
 * Content: 08-cell-phone-policy-exam-proctoring
 * 
 * This module provides assessments for RTD Academy's cell phone requirements,
 * secondary camera setup procedures, exam day behaviors, and accessibility accommodations
 * using the shared assessment system with general educational configuration.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type (will be overridden by database config if available)
const activityDefaults = {
  theme: 'red',
  maxAttempts: 1,
  pointsValue: 1
};

/**
 * Question Pool 1 - Secondary Camera Setup Knowledge
 */
const questionPool1 = [
  {
    questionText: "What is the primary purpose of the secondary camera setup during proctored exams?",
    options: [
      { 
        id: 'a', 
        text: 'To record the exam for later review',
        feedback: 'Incorrect. The secondary camera is not for recording but for real-time monitoring.'
      },
      { 
        id: 'b', 
        text: 'To monitor the student\'s workspace and ensure exam integrity',
        feedback: 'Correct! The secondary camera allows proctors to monitor your workspace, hands, and materials to ensure you\'re following exam protocols.'
      },
      { 
        id: 'c', 
        text: 'To provide backup audio in case the computer microphone fails',
        feedback: 'Incorrect. The secondary camera is primarily for visual monitoring, not audio backup.'
      },
      { 
        id: 'd', 
        text: 'To allow multiple proctors to watch the same exam',
        feedback: 'Incorrect. The purpose is workspace monitoring, not accommodating multiple proctors.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'The secondary camera setup ensures academic integrity by providing proctors with a clear view of your workspace, hands, and any materials you might use during the exam.',
    difficulty: 'beginner',
    tags: ['secondary-camera', 'exam-monitoring', 'academic-integrity']
  }
];

/**
 * Question Pool 2 - Phone Configuration Requirements
 */
const questionPool2 = [
  {
    questionText: "Before using your phone as a secondary camera, what settings must be configured?",
    options: [
      { 
        id: 'a', 
        text: 'Enable Do Not Disturb and close all other apps',
        feedback: 'Correct! Do Not Disturb prevents notifications from interrupting the exam, and closing other apps ensures the proctoring app runs smoothly.'
      },
      { 
        id: 'b', 
        text: 'Turn on airplane mode',
        feedback: 'Incorrect. Airplane mode would disable internet connectivity needed for the proctoring app.'
      },
      { 
        id: 'c', 
        text: 'Set the phone to silent mode only',
        feedback: 'Incorrect. Silent mode alone doesn\'t prevent visual notifications or ensure proper app management.'
      },
      { 
        id: 'd', 
        text: 'Install a special exam app',
        feedback: 'Incorrect. While you may need a proctoring app, the question is about basic phone configuration settings.'
      }
    ],
    correctOptionId: 'a',
    explanation: 'Proper phone configuration requires enabling Do Not Disturb to block all notifications and closing other apps to prevent distractions and ensure optimal performance of the proctoring application.',
    difficulty: 'beginner',
    tags: ['phone-configuration', 'do-not-disturb', 'exam-preparation']
  }
];

/**
 * Question Pool 3 - Exam Day Restrictions Knowledge
 */
const questionPool3 = [
  {
    questionText: "During a proctored exam, which of the following is strictly prohibited?",
    options: [
      { 
        id: 'a', 
        text: 'Using approved calculators when permitted',
        feedback: 'Incorrect. Using approved calculators when explicitly permitted is allowed.'
      },
      { 
        id: 'b', 
        text: 'Asking the proctor for clarification through the chat function',
        feedback: 'Incorrect. Appropriate communication with the proctor is allowed and encouraged when needed.'
      },
      { 
        id: 'c', 
        text: 'Accessing any websites, applications, or communication tools not authorized for the exam',
        feedback: 'Correct! Accessing unauthorized websites, apps, or communication tools violates academic integrity and exam security protocols.'
      },
      { 
        id: 'd', 
        text: 'Taking bathroom breaks when necessary',
        feedback: 'Incorrect. Bathroom breaks may be permitted with proper communication to the proctor.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'During proctored exams, students must only use explicitly authorized resources. Accessing unauthorized websites, applications, or communication tools constitutes a serious violation of academic integrity policies.',
    difficulty: 'intermediate',
    tags: ['exam-restrictions', 'prohibited-behaviors', 'academic-integrity']
  }
];

/**
 * Question Pool 4 - Academic Integrity Principles Knowledge
 */
const questionPool4 = [
  {
    questionText: "What is the core principle behind RTD Academy's academic integrity policy?",
    options: [
      { 
        id: 'a', 
        text: 'To make exams more difficult and challenging',
        feedback: 'Incorrect. The policy is not about making exams harder but ensuring fairness and honesty.'
      },
      { 
        id: 'b', 
        text: 'To ensure all students are evaluated fairly and that achievements reflect genuine knowledge',
        feedback: 'Correct! Academic integrity ensures fair evaluation and that all academic achievements represent genuine student knowledge and skills.'
      },
      { 
        id: 'c', 
        text: 'To reduce the number of students who pass the course',
        feedback: 'Incorrect. The goal is fair assessment, not reducing pass rates.'
      },
      { 
        id: 'd', 
        text: 'To comply with government regulations only',
        feedback: 'Incorrect. While compliance may be part of it, the core principle is about educational fairness and integrity.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'RTD Academy\'s academic integrity policy ensures that all students are evaluated fairly and that academic achievements truly reflect genuine knowledge and skills rather than dishonest practices.',
    difficulty: 'beginner',
    tags: ['academic-integrity', 'core-principles', 'fair-evaluation']
  }
];

/**
 * Question Pool 5 - Violation Consequences Knowledge
 */
const questionPool5 = [
  {
    questionText: "What happens for a first-time academic integrity violation at RTD Academy?",
    options: [
      { 
        id: 'a', 
        text: 'Immediate course withdrawal with no opportunity to continue',
        feedback: 'Incorrect. Immediate withdrawal typically occurs for second offenses or severe violations.'
      },
      { 
        id: 'b', 
        text: 'Assessment scored at 0%, academic integrity module required, re-write opportunity available',
        feedback: 'Correct! First offenses typically result in a zero grade, required completion of an integrity module, and then opportunity to use a re-write.'
      },
      { 
        id: 'c', 
        text: 'Only a warning with no other consequences',
        feedback: 'Incorrect. First offenses have real consequences including grade impacts and required remedial work.'
      },
      { 
        id: 'd', 
        text: 'Automatic referral to law enforcement',
        feedback: 'Incorrect. Legal referral would only occur in extreme cases, not typical first offenses.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'RTD Academy\'s first offense process includes scoring the violated assessment at 0%, requiring completion of an academic integrity module, and then allowing use of the course re-write opportunity to replace the zero grade.',
    difficulty: 'intermediate',
    tags: ['first-offense', 'consequences', 're-write-opportunity']
  }
];

/**
 * Question Pool 6 - Technical Difficulties Scenario
 */
const questionPool6 = [
  {
    questionText: "Emma is taking her Biology 30 exam when her secondary camera (phone) suddenly loses internet connection and stops working. What should Emma do?",
    options: [
      { 
        id: 'a', 
        text: 'Continue the exam and fix the camera issue after finishing',
        feedback: 'Incorrect. Technical issues during exams must be addressed immediately to maintain exam integrity.'
      },
      { 
        id: 'b', 
        text: 'Pause the exam and immediately contact the proctor to report the technical issue',
        feedback: 'Correct! Technical issues must be reported immediately to the proctor for proper guidance and documentation.'
      },
      { 
        id: 'c', 
        text: 'Restart the phone and rejoin the exam without telling anyone',
        feedback: 'Incorrect. Any technical issues must be communicated to the proctor, and students shouldn\'t make changes without guidance.'
      },
      { 
        id: 'd', 
        text: 'Switch to using her laptop camera instead',
        feedback: 'Incorrect. Students cannot make equipment changes during exams without proctor approval and guidance.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'When technical issues occur during proctored exams, students must immediately contact the proctor. This ensures proper documentation, maintains exam integrity, and allows the proctor to provide appropriate guidance for resolving the issue.',
    difficulty: 'intermediate',
    tags: ['technical-difficulties', 'proctor-communication', 'exam-procedures']
  }
];

/**
 * Question Pool 7 - Academic Integrity Violation Scenario
 */
const questionPool7 = [
  {
    questionText: "During his Math 30-1 exam, Tyler gets stuck on a difficult problem. He remembers seeing a similar problem explained on YouTube and is tempted to quickly search for it. What should Tyler do?",
    options: [
      { 
        id: 'a', 
        text: 'Quickly search YouTube since he\'s just looking for understanding, not copying answers',
        feedback: 'Incorrect. Accessing any unauthorized resources during a closed-book exam constitutes an academic integrity violation.'
      },
      { 
        id: 'b', 
        text: 'Skip the question and continue with the rest of the exam using only authorized resources',
        feedback: 'Correct! Tyler should work with only authorized resources. If struggling, he can skip the question and return to it later using his own knowledge.'
      },
      { 
        id: 'c', 
        text: 'Ask the proctor to help him solve the problem',
        feedback: 'Incorrect. Proctors cannot provide academic help or solve problems during exams.'
      },
      { 
        id: 'd', 
        text: 'Text a classmate for a quick hint about the problem type',
        feedback: 'Incorrect. Any communication with others during an exam is a serious academic integrity violation.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'During closed-book exams, students must use only authorized resources. Accessing external websites, communicating with others, or seeking unauthorized help violates academic integrity policies, regardless of the intent.',
    difficulty: 'advanced',
    tags: ['academic-integrity-scenario', 'unauthorized-resources', 'exam-temptation']
  }
];

/**
 * Question Pool 8 - Cell Phone Policy Violation Scenario
 */
const questionPool8 = [
  {
    questionText: "Sarah is in the middle of her Chemistry 30 exam when her phone (serving as secondary camera) starts receiving multiple text messages that appear on screen despite Do Not Disturb being enabled. The proctor notices the notifications. What is the most likely outcome?",
    options: [
      { 
        id: 'a', 
        text: 'The proctor will give her a warning and allow her to continue',
        feedback: 'Incorrect. Notification failures during exams are typically treated as setup violations with more serious consequences.'
      },
      { 
        id: 'b', 
        text: 'Sarah can quickly silence the phone and continue without consequences',
        feedback: 'Incorrect. Once violations are observed, touching the phone or making changes is not permitted and may worsen the situation.'
      },
      { 
        id: 'c', 
        text: 'The exam may be terminated due to failure to properly configure the device according to requirements',
        feedback: 'Correct! Proper device configuration is a requirement for exam integrity. Notification failures suggest improper setup and may result in exam termination.'
      },
      { 
        id: 'd', 
        text: 'Nothing will happen since it was an accidental technical issue',
        feedback: 'Incorrect. Students are responsible for proper device configuration, and failures have consequences regardless of intent.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'Proper device configuration is the student\'s responsibility and a requirement for exam integrity. When notifications appear during exams, it indicates failure to properly set up Do Not Disturb mode, which can result in exam termination as it violates the required setup protocols.',
    difficulty: 'advanced',
    tags: ['phone-policy-violation', 'setup-failure', 'exam-consequences']
  }
];

/**
 * Assessment Configurations for Universal Assessment Function
 * 
 * Export plain configuration objects that the universal assessment function
 * can use to instantiate StandardMultipleChoiceCore handlers
 */
const assessmentConfigs = {
  'course4_08_cell_phone_policy_question1': {
    type: 'multiple-choice',
    questions: questionPool1,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question2': {
    type: 'multiple-choice',
    questions: questionPool2,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question3': {
    type: 'multiple-choice',
    questions: questionPool3,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question4': {
    type: 'multiple-choice',
    questions: questionPool4,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question5': {
    type: 'multiple-choice',
    questions: questionPool5,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question6': {
    type: 'multiple-choice',
    questions: questionPool6,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question7': {
    type: 'multiple-choice',
    questions: questionPool7,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme
  },

  'course4_08_cell_phone_policy_question8': {
    type: 'multiple-choice',
    questions: questionPool8,
    randomizeQuestions: false,
    randomizeOptions: true,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
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