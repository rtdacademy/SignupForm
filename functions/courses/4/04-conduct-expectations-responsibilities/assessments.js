/**
 * Assessment Functions for Online Conduct, Expectations & Student Responsibilities
 * Course: 4 (RTD Academy Orientation - COM1255)
 * Content: 04-conduct-expectations-responsibilities
 * 
 * This module provides standard multiple choice assessments for understanding RTD Academy's
 * online conduct standards, communication expectations, and academic integrity requirements.
 */

const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Activity type for this lesson
const ACTIVITY_TYPE = 'lesson';

/**
 * Standard Multiple Choice Question 1 - Professional Email Communication
 * Function name: course4_04_conduct_expectations_question1
 */
exports.course4_04_conduct_expectations_question1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What is the most important element of a professional email to your instructor?",
      options: [
        { 
          id: 'a', 
          text: 'Using informal language to show you\'re friendly',
          feedback: 'Incorrect. Professional emails should maintain formal language and proper etiquette.'
        },
        { 
          id: 'b', 
          text: 'Including a clear subject line, proper greeting, and specific request',
          feedback: 'Correct! Professional emails should have clear subject lines, proper greetings (Dear Mr./Ms.), and specific questions or requests.'
        },
        { 
          id: 'c', 
          text: 'Keeping it as short as possible without details',
          feedback: 'Incorrect. While brevity is good, you need to provide enough context for your instructor to help you effectively.'
        },
        { 
          id: 'd', 
          text: 'Using text message abbreviations to save time',
          feedback: 'Incorrect. Professional emails should use complete words and proper grammar, not text abbreviations.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Professional email communication requires clear subject lines that indicate the topic, proper greetings using titles and last names, and specific details about what you need help with. This helps instructors respond effectively and maintains professional standards.',
      difficulty: 'beginner',
      tags: ['email-communication', 'professional-standards', 'student-responsibilities']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Professional Email Communication',
  learningObjectives: [
    'Understand professional email communication standards',
    'Know the key elements of effective student-instructor communication'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 2 - Academic Integrity Requirements
 * Function name: course4_04_conduct_expectations_question2
 */
exports.course4_04_conduct_expectations_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Which of the following is considered a violation of academic integrity at RTD Academy?",
      options: [
        { 
          id: 'a', 
          text: 'Asking your instructor for clarification on assignment instructions',
          feedback: 'Incorrect. Asking instructors for help and clarification is encouraged and shows good academic practice.'
        },
        { 
          id: 'b', 
          text: 'Sharing your login credentials with a friend to help them see assignment examples',
          feedback: 'Correct! Sharing login credentials violates RTD Academy policy and compromises system security, even if done with good intentions.'
        },
        { 
          id: 'c', 
          text: 'Using approved calculators during exams when permitted',
          feedback: 'Incorrect. Using approved materials and tools when explicitly permitted is following academic integrity policies.'
        },
        { 
          id: 'd', 
          text: 'Completing assignments independently as instructed',
          feedback: 'Incorrect. Independent work is exactly what academic integrity requires unless collaboration is explicitly permitted.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Sharing login credentials is a serious violation of RTD Academy policy. Your login information is strictly personal and confidential. Even sharing with good intentions compromises system security and violates academic integrity policies.',
      difficulty: 'intermediate',
      tags: ['academic-integrity', 'login-security', 'policy-violation']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Academic Integrity and Security',
  learningObjectives: [
    'Understand what constitutes academic integrity violations',
    'Know the importance of protecting login credentials'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 3 - Virtual Meeting Etiquette
 * Function name: course4_04_conduct_expectations_question3
 */
exports.course4_04_conduct_expectations_question3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "During virtual class sessions, what is the most important behavior for maintaining a professional learning environment?",
      options: [
        { 
          id: 'a', 
          text: 'Keep your microphone unmuted so you can participate actively',
          feedback: 'Incorrect. You should mute your microphone when not speaking to prevent background noise and distractions.'
        },
        { 
          id: 'b', 
          text: 'Mute your microphone when not speaking and wait to be recognized before unmuting',
          feedback: 'Correct! Muting when not speaking prevents background noise, and waiting to be recognized before unmuting maintains order and professionalism.'
        },
        { 
          id: 'c', 
          text: 'Turn off your camera to avoid distractions',
          feedback: 'Incorrect. Keeping your camera on (unless specifically instructed otherwise) helps maintain engagement and connection.'
        },
        { 
          id: 'd', 
          text: 'Multitask during sessions to maximize your productivity',
          feedback: 'Incorrect. Multitasking during virtual sessions is distracting and shows lack of respect for the instructor and classmates.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Professional virtual meeting etiquette requires muting your microphone when not speaking to prevent background noise and disruptions. When you want to speak, you should wait to be recognized by the instructor before unmuting, just as you would raise your hand in a physical classroom.',
      difficulty: 'beginner',
      tags: ['virtual-meetings', 'professional-conduct', 'classroom-etiquette']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Virtual Meeting Professional Conduct',
  learningObjectives: [
    'Understand virtual meeting etiquette requirements',
    'Know how to participate professionally in online sessions'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 4 - Password Security Policy
 * Function name: course4_04_conduct_expectations_question4
 */
exports.course4_04_conduct_expectations_question4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "According to RTD Academy's security policies, what should you do if you suspect your account has been compromised?",
      options: [
        { 
          id: 'a', 
          text: 'Wait a few days to see if the problem resolves itself',
          feedback: 'Incorrect. Waiting could allow unauthorized access to continue and potentially cause more security issues.'
        },
        { 
          id: 'b', 
          text: 'Share your concerns with classmates to see if they\'ve had similar issues',
          feedback: 'Incorrect. Sharing security concerns with classmates could spread sensitive information and doesn\'t address the immediate security threat.'
        },
        { 
          id: 'c', 
          text: 'Immediately change your password and report the suspected breach to RTD Academy',
          feedback: 'Correct! If you suspect your account is compromised, you should immediately change your password and report the incident to RTD Academy to protect your account and the system.'
        },
        { 
          id: 'd', 
          text: 'Create a new account without telling anyone about the compromised one',
          feedback: 'Incorrect. Creating unauthorized accounts violates policy, and not reporting the security breach leaves the system vulnerable.'
        }
      ],
      correctOptionId: 'c',
      explanation: 'When you suspect your account has been compromised, immediate action is required. Change your password right away to prevent further unauthorized access, then report the incident to RTD Academy so they can investigate and take additional security measures if needed.',
      difficulty: 'intermediate',
      tags: ['password-security', 'account-protection', 'security-breach-response']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Account Security and Breach Response',
  learningObjectives: [
    'Know proper response to suspected account compromise',
    'Understand the importance of immediate security action'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 5 - Student Responsibilities
 * Function name: course4_04_conduct_expectations_question5
 */
exports.course4_04_conduct_expectations_question5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What is a key student responsibility when participating in RTD Academy's online learning environment?",
      options: [
        { 
          id: 'a', 
          text: 'Respond to instructor communications within 24-48 hours when possible',
          feedback: 'Correct! Timely communication is a key responsibility that shows respect for instructors and helps maintain good academic relationships.'
        },
        { 
          id: 'b', 
          text: 'Only contact instructors during regular business hours',
          feedback: 'Incorrect. While you should be respectful of timing, you can send emails anytime. Instructors will respond during their available hours.'
        },
        { 
          id: 'c', 
          text: 'Avoid asking questions to prevent bothering the instructor',
          feedback: 'Incorrect. Asking questions when you need help is encouraged and shows engagement with your learning.'
        },
        { 
          id: 'd', 
          text: 'Complete assignments as quickly as possible without reviewing',
          feedback: 'Incorrect. Quality work and understanding are more important than speed. You should review your work before submitting.'
        }
      ],
      correctOptionId: 'a',
      explanation: 'Responding to instructor communications within 24-48 hours (when possible) is a key student responsibility that demonstrates respect, professionalism, and engagement. This helps maintain good communication and ensures you don\'t miss important information or support.',
      difficulty: 'beginner',
      tags: ['student-responsibilities', 'communication-expectations', 'professional-conduct']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Student Communication Responsibilities',
  learningObjectives: [
    'Understand key student responsibilities in online learning',
    'Know appropriate communication response times'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 6 - Scenario: Login Credential Request
 * Function name: course4_04_conduct_expectations_question6
 */
exports.course4_04_conduct_expectations_question6 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Your study partner is struggling with the online platform and asks, \"Can I just use your login to see how the assignment submission works? I promise I won't submit anything as you.\" How should you respond?",
      options: [
        { 
          id: 'a', 
          text: 'Share your login since they promised not to submit anything',
          feedback: 'Incorrect. Sharing login credentials violates RTD Academy policy regardless of promises made. This puts both your accounts and the system at risk.'
        },
        { 
          id: 'b', 
          text: 'Politely decline and offer to help them contact IT support or walk them through the process while they use their own account',
          feedback: 'Correct! This protects your account security while still helping your study partner get the support they need through proper channels.'
        },
        { 
          id: 'c', 
          text: 'Give them your login but ask them to change your password first',
          feedback: 'Incorrect. Sharing login credentials violates policy even with password changes. The account access itself is what\'s prohibited.'
        },
        { 
          id: 'd', 
          text: 'Tell them to figure it out themselves since you can\'t help',
          feedback: 'Incorrect. While protecting your login is correct, you can still help by directing them to appropriate support resources or teaching them while they use their own account.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Never share login credentials, even with good intentions. Instead, help your study partner by offering to contact IT support together, walking them through the process on their own account, or connecting them with instructor support. This maintains security while still being helpful.',
      difficulty: 'intermediate',
      tags: ['login-security', 'peer-support', 'policy-application', 'scenario-based']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Security Policy Application in Real Situations',
  learningObjectives: [
    'Apply login security policies to real scenarios',
    'Know how to help others while maintaining security'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 7 - Scenario: Exam Sharing Request
 * Function name: course4_04_conduct_expectations_question7
 */
exports.course4_04_conduct_expectations_question7 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "After completing your Math 30-1 Section 2 exam, a classmate messages you: \"Hey, I'm taking the exam tomorrow. Can you give me a heads up about what types of questions are on it?\" What should you do?",
      options: [
        { 
          id: 'a', 
          text: 'Share general topics but not specific questions',
          feedback: 'Incorrect. Even sharing general exam content violates academic integrity policies and gives unfair advantage to other students.'
        },
        { 
          id: 'b', 
          text: 'Politely decline and explain that sharing exam information violates academic integrity policies',
          feedback: 'Correct! You should politely refuse and explain that sharing any exam information violates RTD Academy\'s academic integrity policies, regardless of how general the information might seem.'
        },
        { 
          id: 'c', 
          text: 'Share the information since you\'re just helping a classmate succeed',
          feedback: 'Incorrect. Sharing exam information, even with good intentions, violates academic integrity policies and creates unfair advantages.'
        },
        { 
          id: 'd', 
          text: 'Tell them to ask other students instead',
          feedback: 'Incorrect. This doesn\'t address the academic integrity violation and encourages the classmate to continue seeking prohibited information.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Academic integrity requires that you never share exam information with other students, even in general terms. This ensures fair testing conditions for all students. You can help classmates by encouraging them to study course materials and contact instructors with questions.',
      difficulty: 'intermediate',
      tags: ['academic-integrity', 'exam-security', 'peer-pressure', 'scenario-based']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Academic Integrity in Peer Interactions',
  learningObjectives: [
    'Apply academic integrity policies when peers request exam information',
    'Know how to decline inappropriate requests professionally'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 8 - Scenario: Virtual Meeting Disruption
 * Function name: course4_04_conduct_expectations_question8
 */
exports.course4_04_conduct_expectations_question8 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "During a virtual class session, another student keeps interrupting the instructor, using inappropriate language, and making jokes that disrupt the lesson. What should you do?",
      options: [
        { 
          id: 'a', 
          text: 'Join in with the jokes to avoid seeming unfriendly',
          feedback: 'Incorrect. Participating in disruptive behavior makes you part of the problem and violates professional conduct standards.'
        },
        { 
          id: 'b', 
          text: 'Ignore the behavior and hope the instructor handles it',
          feedback: 'Partially correct, but you should also report the behavior to help the instructor address the situation effectively.'
        },
        { 
          id: 'c', 
          text: 'Use the chat or private message to tell the disruptive student to stop',
          feedback: 'Incorrect. Direct confrontation during class can escalate the situation. The instructor should handle discipline, and you should report if needed.'
        },
        { 
          id: 'd', 
          text: 'Report the disruptive behavior to the instructor through appropriate channels',
          feedback: 'Correct! Disruptive behavior affects everyone\'s learning experience. Reporting it through proper channels helps the instructor maintain a professional learning environment.'
        }
      ],
      correctOptionId: 'd',
      explanation: 'When classmates disrupt virtual sessions with inappropriate behavior, you should report it to the instructor through appropriate channels (chat, email, or after class). This helps maintain a professional learning environment for everyone and gives the instructor the information needed to address the situation.',
      difficulty: 'advanced',
      tags: ['classroom-disruption', 'professional-conduct', 'reporting-procedures', 'scenario-based']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'teal',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Managing Classroom Disruptions Professionally',
  learningObjectives: [
    'Know how to respond to disruptive behavior in virtual classrooms',
    'Understand the importance of reporting inappropriate conduct'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});