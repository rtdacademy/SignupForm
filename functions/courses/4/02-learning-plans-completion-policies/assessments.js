/**
 * Assessment Functions for Learning Plans, Course Completion & Diploma Exam Policies
 * Course: 4 (RTD Academy Orientation - COM1255)
 * Content: 02-learning-plans-completion-policies
 * 
 * This module provides AI-powered assessments for understanding RTD Academy policies
 * using the shared assessment system with COM1255 specific configuration.
 */

const { createAIMultipleChoice } = require('../shared/assessment-types/ai-multiple-choice');
const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Activity type for this lesson
const ACTIVITY_TYPE = 'lesson';

/**
 * AI-powered multiple choice assessment for learning plans and completion policies
 * Function name: course4_02_learning_plans_completion_policies_aiQuestion
 */
exports.course4_02_learning_plans_completion_policies_aiQuestion = createAIMultipleChoice({
  // Set activity type
  activityType: ACTIVITY_TYPE,
  
  // Course-specific prompts for different difficulty levels
  prompts: {
    beginner: `Generate a multiple choice question for RTD Academy's COM1255 course lesson on Learning Plans, Course Completion & Diploma Exam Policies at a BEGINNER level.

Focus on basic understanding of:
- What a personal learning plan is and why it's important
- Basic course completion requirements
- MyPass registration basics
- Simple timeline expectations

Create straightforward questions that test fundamental knowledge of policies.

Requirements:
- Create ONE multiple choice question with 4 options
- Make it clear and direct for adult learners new to RTD Academy
- Focus on the most essential policies they need to know
- Avoid complex scenarios - test basic comprehension`,
    
    intermediate: `Generate a multiple choice question for RTD Academy's COM1255 course lesson on Learning Plans, Course Completion & Diploma Exam Policies at an INTERMEDIATE level.

Focus on realistic scenarios students might encounter, such as:
- Personal learning plan creation challenges
- Course completion timeline management
- Withdrawal decisions and PASI implications
- MyPass registration requirements and responsibilities
- Student inactivity consequences and recovery procedures
- Time management and study planning strategies

Create scenarios that test practical application of policies rather than just memorization.

Question Types to Choose From:
1. Scenario-based questions about student situations (withdrawal decisions, inactivity responses, MyPass issues)
2. Policy application questions (PASI reporting, timeline requirements)
3. Planning and strategy questions (learning plan creation, time management)
4. Responsibility and procedure questions (MyPass management, communication requirements)

Requirements:
- Create ONE multiple choice question with 4 options
- Make it realistic and practical for adult learners
- Focus on RTD Academy-specific policies and procedures
- Include clear, actionable scenarios
- Make incorrect options plausible but clearly wrong when you understand the policy`,
    
    advanced: `Generate a challenging multiple choice question for RTD Academy's COM1255 course lesson on Learning Plans, Course Completion & Diploma Exam Policies at an ADVANCED level.

Focus on complex situations involving:
- Multiple policy interactions (e.g., withdrawal + PASI + MyPass + timelines)
- Edge cases and special circumstances
- Strategic decision-making about course progression
- Understanding policy implications for future academic plans
- Complex timeline calculations with multiple factors

Create questions that require deep understanding and critical thinking about how policies work together.

Requirements:
- Create ONE multiple choice question with 4 options
- Include multi-layered scenarios requiring analysis
- Test understanding of policy interactions and consequences
- Make students think through cause-and-effect relationships`
  },
  
  // Assessment settings
  maxAttempts: 5,
  pointsValue: 2,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'blue',
  allowDifficultySelection: true,
  defaultDifficulty: 'intermediate',
  freeRegenerationOnDifficultyChange: true,
  
  // Enable AI chat for student support
  enableAIChat: true,
  aiChatContext: "This question tests understanding of RTD Academy's policies regarding learning plans, course completion, withdrawal procedures, PASI reporting, and MyPass registration. Students often struggle with understanding the implications of withdrawal and their responsibilities with MyPass.",
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 12,
  topic: 'Learning Plans & Completion Policies',
  learningObjectives: [
    'Understand personal learning plan requirements',
    'Know course completion and withdrawal policies',
    'Understand PASI implications of withdrawal',
    'Know MyPass registration responsibilities',
    'Understand inactivity consequences'
  ],
  
  // Fallback questions if AI generation fails
  fallbackQuestions: [
    {
      questionText: "Emma is enrolled in Math 30-1 and has completed her Section 1 exam with a score of 78%. Due to unexpected family circumstances, she's considering withdrawing from the course. She's also registered for the diploma exam through MyPass. What should Emma know about her situation?",
      options: [
        { id: 'a', text: "She can withdraw cleanly with no grade impact since she hasn't finished the course yet" },
        { id: 'b', text: "If she withdraws now, RTD will submit her current grade to PASI, and she must cancel her MyPass registration herself" },
        { id: 'c', text: "RTD Academy will automatically cancel her MyPass registration if she withdraws" },
        { id: 'd', text: "She should wait to withdraw until after the diploma exam to avoid penalty" }
      ],
      correctOptionId: 'b',
      explanation: "Since Emma completed Section 1 exam, withdrawing now means RTD will submit her current grade to PASI. Additionally, students are responsible for cancelling their own MyPass registrations - RTD cannot do this for them.",
      difficulty: 'intermediate'
    },
    {
      questionText: "What is the primary purpose of creating a personal learning plan at RTD Academy?",
      options: [
        { id: 'a', text: "To meet government requirements for funding" },
        { id: 'b', text: "To help you set realistic goals and manage your time effectively throughout the course" },
        { id: 'c', text: "To determine your final grade in the course" },
        { id: 'd', text: "To register for diploma exams automatically" }
      ],
      correctOptionId: 'b',
      explanation: "A personal learning plan helps you set realistic goals, manage your time effectively, and stay on track with your coursework. It's a tool for your success, not just a requirement.",
      difficulty: 'beginner'
    },
    {
      questionText: "Marcus started his Biology 30 course in September but hasn't submitted any work for 45 days. He's registered for the January diploma exam through MyPass. He wants to get back on track but is unsure of his status. Which statement best describes his situation and required actions?",
      options: [
        { id: 'a', text: "He's been automatically withdrawn and must re-register for the course and cancel his MyPass registration" },
        { id: 'b', text: "He's still enrolled but at risk of withdrawal; he should contact his teacher immediately and may need to update his learning plan" },
        { id: 'c', text: "His inactivity automatically cancelled his diploma exam registration" },
        { id: 'd', text: "He can continue where he left off with no consequences since he's still within the course timeline" }
      ],
      correctOptionId: 'b',
      explanation: "After 30+ days of inactivity, students are at risk of withdrawal but not automatically withdrawn. Marcus should contact his teacher immediately to discuss his situation and likely update his learning plan. His MyPass registration remains active unless he cancels it himself.",
      difficulty: 'advanced'
    }
  ]
});

/**
 * Standard Multiple Choice Question 1 - Alex's Section 1 Withdrawal Scenario
 * Function name: course4_02_learning_plans_question1
 */
exports.course4_02_learning_plans_question1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Alex has been struggling with the course content and hasen't yet written the Section 1 exam. He's considering withdrawing from the course. What should Alex know?",
      options: [
        { 
          id: 'a', 
          text: 'Since he missed Section 1, he\'ll automatically get a withdrawal (WDRW) on his transcript',
          feedback: 'Incorrect. Missing the Section 1 exam deadline doesn\'t automatically result in a withdrawal. Alex needs to make an active decision.'
        },
        { 
          id: 'b', 
          text: 'He can still withdraw cleanly since he hasn\'t completed Section 1 exam',
          feedback: 'Correct! Since Alex hasn\'t completed the Section 1 exam yet, he can withdraw and receive a WDRW (withdrawal) on his transcript with no grade impact.'
        },
        { 
          id: 'c', 
          text: 'He must complete Section 1 before he can withdraw',
          feedback: 'Incorrect. Students can withdraw at any time. However, withdrawing before Section 1 exam means no grade is submitted.'
        },
        { 
          id: 'd', 
          text: 'His current grade will be submitted regardless of when he withdraws',
          feedback: 'Incorrect. Grades are only submitted if a student withdraws AFTER completing the Section 1 exam.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Students who withdraw before completing the Section 1 exam will have their enrollment recorded as a Withdrawal (WDRW) in PASI with no grade impact. This is important for students who realize early that they need to postpone their studies.',
      difficulty: 'intermediate',
      tags: ['withdrawal', 'section-1', 'pasi', 'transcript']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Withdrawal Policies and PASI Reporting',
  learningObjectives: [
    'Understand withdrawal timing and its impact on transcripts',
    'Know the significance of the Section 1 exam deadline',
    'Make informed decisions about course continuation'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 2 - Maria's MyPass Registration
 * Function name: course4_02_learning_plans_question2
 */
exports.course4_02_learning_plans_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Maria is enrolled in Math 30-1 and needs to register for the diploma exam. She's never used MyPass before. What's the most important thing for her to know?",
      options: [
        { 
          id: 'a', 
          text: 'RTD Academy will register her automatically',
          feedback: 'Incorrect. RTD Academy cannot register students for diploma exams. This is the student\'s responsibility.'
        },
        { 
          id: 'b', 
          text: 'She must create a MyPass account and register herself',
          feedback: 'Correct! All students in diploma courses must create their own MyPass account and register themselves for diploma exams. RTD Academy cannot do this for them.'
        },
        { 
          id: 'c', 
          text: 'She only needs to register if she wants to choose her exam location',
          feedback: 'Incorrect. Registration through MyPass is mandatory for all diploma exam students, regardless of location preferences.'
        },
        { 
          id: 'd', 
          text: 'MyPass registration is optional for Math 30-1',
          feedback: 'Incorrect. MyPass registration is required for all diploma courses, including Math 30-1.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'MyPass is Alberta Education\'s official portal for diploma exam registration. All students in diploma courses are required to create their own MyPass account and register themselves. RTD Academy provides guidance but cannot register on behalf of students.',
      difficulty: 'beginner',
      tags: ['mypass', 'diploma-exam', 'registration', 'student-responsibility']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'MyPass Registration and Diploma Exams',
  learningObjectives: [
    'Understand MyPass registration requirements',
    'Know student responsibilities for diploma exam registration',
    'Recognize that RTD Academy cannot register students for exams'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 3 - Jordan's Inactivity Situation
 * Function name: course4_02_learning_plans_question3
 */
exports.course4_02_learning_plans_question3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Jordan hasn't logged into his Physics 30 course for 10 days due to a family emergency. He just received an email saying his access has been locked. What should he do?",
      options: [
        { 
          id: 'a', 
          text: 'Wait until the family emergency is over to respond',
          feedback: 'Incorrect. Waiting too long could result in being withdrawn from the course. Jordan needs to act within one week of being locked out.'
        },
        { 
          id: 'b', 
          text: 'Immediately contact RTD to schedule a meeting within one week',
          feedback: 'Correct! When course access is locked due to inactivity, students have one week to meet with RTD Administration to create a plan for resuming progress.'
        },
        { 
          id: 'c', 
          text: 'Just start logging in again - the lock will automatically lift',
          feedback: 'Incorrect. Once course access is locked, it requires a meeting with RTD Administration to unlock. Simply trying to log in won\'t work.'
        },
        { 
          id: 'd', 
          text: 'Withdraw from the course to avoid getting a failing grade',
          feedback: 'Incorrect. Withdrawing isn\'t necessary. By meeting with RTD Administration, Jordan can explain his situation and create a modified timeline to continue the course.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'When a student\'s course access is locked due to inactivity, they have one week to meet with RTD Administration. This meeting allows them to explain their circumstances, create a modified timeline if needed, and get back on track. RTD understands that life emergencies happen and is willing to work with students who communicate promptly.',
      difficulty: 'intermediate',
      tags: ['inactivity', 'course-access', 'emergency-situation', 'communication']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Student Inactivity and Course Access',
  learningObjectives: [
    'Understand inactivity policies and consequences',
    'Know the proper response when course access is locked',
    'Recognize the importance of timely communication with RTD Administration'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 4 - Course Completion Timeline
 * Function name: course4_02_learning_plans_question4
 */
exports.course4_02_learning_plans_question4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students are expected to complete their course within _____ of enrollment.",
      options: [
        { 
          id: 'a', 
          text: 'six months',
          feedback: 'Incorrect. While six months is a reasonable timeline, RTD Academy allows more time for completion.'
        },
        { 
          id: 'b', 
          text: 'one year',
          feedback: 'Correct! Students are expected to complete their course within one year of enrollment, though extensions may be available under special circumstances.'
        },
        { 
          id: 'c', 
          text: 'two years',
          feedback: 'Incorrect. The standard expectation is one year, not two years.'
        },
        { 
          id: 'd', 
          text: 'three months',
          feedback: 'Incorrect. Three months would be too short for most students to complete a full course.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'RTD Academy expects students to complete their courses within one year of enrollment. This provides sufficient time for most students while ensuring steady progress. Extensions may be available for special circumstances.',
      difficulty: 'beginner',
      tags: ['completion-timeline', 'course-expectations', 'enrollment']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Course Completion Expectations',
  learningObjectives: [
    'Know the expected timeline for course completion',
    'Understand RTD Academy\'s one-year completion expectation'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 5 - Section 1 Withdrawal Policy
 * Function name: course4_02_learning_plans_question5
 */
exports.course4_02_learning_plans_question5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students who withdraw before completing the _____ exam will have their enrollment recorded as a Withdrawal (WDRW) in PASI.",
      options: [
        { 
          id: 'a', 
          text: 'diploma',
          feedback: 'Incorrect. The policy refers to the Section 1 exam, not the diploma exam.'
        },
        { 
          id: 'b', 
          text: 'final',
          feedback: 'Incorrect. The key deadline is the Section 1 exam, not the final exam.'
        },
        { 
          id: 'c', 
          text: 'Section 1',
          feedback: 'Correct! Withdrawing before completing the Section 1 exam results in a WDRW with no grade impact on the transcript.'
        },
        { 
          id: 'd', 
          text: 'midterm',
          feedback: 'Incorrect. RTD Academy uses Section exams, not midterms.'
        }
      ],
      correctOptionId: 'c',
      explanation: 'The Section 1 exam is a critical milestone. Students who withdraw before completing it receive a WDRW (withdrawal) on their transcript with no grade impact. After Section 1, withdrawal results in a grade being submitted.',
      difficulty: 'intermediate',
      tags: ['withdrawal-policy', 'section-1', 'pasi', 'transcript']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Withdrawal Policies and Section Exams',
  learningObjectives: [
    'Understand the significance of the Section 1 exam for withdrawal',
    'Know how withdrawal timing affects transcripts'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 6 - Diploma Exam Registration
 * Function name: course4_02_learning_plans_question6
 */
exports.course4_02_learning_plans_question6 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "All students in diploma courses are required to register for their exams through _____.",
      options: [
        { 
          id: 'a', 
          text: 'RTD Academy',
          feedback: 'Incorrect. RTD Academy cannot register students for diploma exams.'
        },
        { 
          id: 'b', 
          text: 'MyPass',
          feedback: 'Correct! All diploma exam registrations must be done through MyPass, Alberta Education\'s official portal.'
        },
        { 
          id: 'c', 
          text: 'their high school',
          feedback: 'Incorrect. RTD Academy students register directly through MyPass, not through other schools.'
        },
        { 
          id: 'd', 
          text: 'email request',
          feedback: 'Incorrect. Diploma exam registration requires using the MyPass system, not email.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'MyPass is Alberta Education\'s official portal for diploma exam registration. All students must create their own MyPass account and register themselves - RTD Academy cannot do this on their behalf.',
      difficulty: 'beginner',
      tags: ['mypass', 'diploma-exam', 'registration', 'student-responsibility']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'MyPass and Diploma Exam Registration',
  learningObjectives: [
    'Know where to register for diploma exams',
    'Understand that MyPass registration is mandatory for diploma courses'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 7 - Course Access Lock Policy
 * Function name: course4_02_learning_plans_question7
 */
exports.course4_02_learning_plans_question7 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "If a student is inactive for more than one week, their course access may be temporarily _____.",
      options: [
        { 
          id: 'a', 
          text: 'deleted',
          feedback: 'Incorrect. Course access is not deleted, just temporarily restricted.'
        },
        { 
          id: 'b', 
          text: 'suspended',
          feedback: 'Close, but the specific term used is "locked" not suspended.'
        },
        { 
          id: 'c', 
          text: 'locked',
          feedback: 'Correct! After one week of inactivity, course access is temporarily locked until the student meets with RTD Administration.'
        },
        { 
          id: 'd', 
          text: 'terminated',
          feedback: 'Incorrect. The access is temporarily locked, not permanently terminated.'
        }
      ],
      correctOptionId: 'c',
      explanation: 'RTD Academy temporarily locks course access after one week of inactivity to ensure students stay engaged. This can be resolved by meeting with RTD Administration to create a plan for resuming progress.',
      difficulty: 'intermediate',
      tags: ['inactivity-policy', 'course-access', 'student-engagement']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Student Inactivity and Course Access',
  learningObjectives: [
    'Understand the inactivity policy',
    'Know what happens after one week of inactivity'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 8 - Consequence of Not Meeting After Lock
 * Function name: course4_02_learning_plans_question8
 */
exports.course4_02_learning_plans_question8 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students who don't meet with RTD Administration after being locked out will be _____ from their course.",
      options: [
        { 
          id: 'a', 
          text: 'suspended',
          feedback: 'Close, but the specific term is "withdrawn" not suspended.'
        },
        { 
          id: 'b', 
          text: 'withdrawn',
          feedback: 'Correct! Students who don\'t respond within one week of being locked out will be withdrawn from their course.'
        },
        { 
          id: 'c', 
          text: 'transferred',
          feedback: 'Incorrect. Students are withdrawn, not transferred to another course.'
        },
        { 
          id: 'd', 
          text: 'graduated',
          feedback: 'Incorrect. Not meeting after being locked out results in withdrawal, not graduation.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'If a student doesn\'t meet with RTD Administration within one week of having their course access locked, they will be withdrawn from the course. This emphasizes the importance of timely communication when facing challenges.',
      difficulty: 'intermediate',
      tags: ['withdrawal', 'inactivity-consequences', 'communication', 'course-access']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Consequences of Inactivity',
  learningObjectives: [
    'Understand the consequences of not responding to course lock',
    'Recognize the importance of timely communication with RTD Administration'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});
