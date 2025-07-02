/**
 * Assessment Functions for Time Management & Staying Active
 * Course: 4 (RTD Academy Orientation)
 * Content: 03-time-management-staying-active
 * 
 * This module provides standard multiple choice assessments for understanding
 * time management, RTD Academy requirements, and inactivity policies.
 */

const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Activity type for this lesson
const ACTIVITY_TYPE = 'lesson';

/**
 * Standard Multiple Choice Question 1 - Weekly Login Requirement (Knowledge)
 * Function name: course4_03_time_management_question1
 */
exports.course4_03_time_management_question1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students must log into their course at least once per _____.",
      options: [
        { 
          id: 'a', 
          text: 'day',
          feedback: 'Incorrect. While daily engagement is beneficial, the requirement is less frequent than this.'
        },
        { 
          id: 'b', 
          text: 'week',
          feedback: 'Correct! Students must log into their course at least once per week. This is a non-negotiable requirement to maintain course access.'
        },
        { 
          id: 'c', 
          text: 'month',
          feedback: 'Incorrect. This would be too infrequent and could lead to course lockout.'
        },
        { 
          id: 'd', 
          text: 'semester',
          feedback: 'Incorrect. This would result in immediate course access issues.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'The weekly login requirement is non-negotiable and ensures students stay engaged with their coursework. Failure to log in weekly can result in course access being locked.',
      difficulty: 'beginner',
      tags: ['weekly-login', 'requirements', 'course-access']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'RTD Academy Activity Requirements',
  learningObjectives: [
    'Understand weekly login requirements',
    'Know the consequences of not meeting activity requirements'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 2 - Two-Lesson Rule (Knowledge)
 * Function name: course4_03_time_management_question2
 */
exports.course4_03_time_management_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students must stay within _____ lessons of their target date.",
      options: [
        { 
          id: 'a', 
          text: 'one',
          feedback: 'Incorrect. RTD Academy allows a bit more flexibility than just one lesson.'
        },
        { 
          id: 'b', 
          text: 'two',
          feedback: 'Correct! The two-lesson rule allows students to be up to two lessons behind or ahead of their target date while staying on track.'
        },
        { 
          id: 'c', 
          text: 'three',
          feedback: 'Incorrect. Three lessons would trigger intervention procedures.'
        },
        { 
          id: 'd', 
          text: 'five',
          feedback: 'Incorrect. This would be too far off track and require immediate intervention.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'The two-lesson rule keeps students on pace without being overly restrictive. Being more than two lessons behind triggers intervention to help students get back on track.',
      difficulty: 'beginner',
      tags: ['two-lesson-rule', 'target-dates', 'pace']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'RTD Academy Activity Requirements',
  learningObjectives: [
    'Understand the two-lesson rule',
    'Know acceptable progress ranges'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 3 - Inactivity Timeline (Knowledge)
 * Function name: course4_03_time_management_question3
 */
exports.course4_03_time_management_question3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "After _____ days of inactivity, a student's course access will be temporarily locked.",
      options: [
        { 
          id: 'a', 
          text: '7',
          feedback: 'Incorrect. At 7 days, students receive a warning email, but access is not yet locked.'
        },
        { 
          id: 'b', 
          text: '14',
          feedback: 'Correct! After 14 days (two weeks) of inactivity, course access is temporarily locked until the student meets with RTD Administration.'
        },
        { 
          id: 'c', 
          text: '21',
          feedback: 'Incorrect. By 21 days, students would already have been locked out for a week.'
        },
        { 
          id: 'd', 
          text: '30',
          feedback: 'Incorrect. This would be too long without intervention.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'The 14-day lockout policy ensures students don\'t fall too far behind. Students receive a warning at 7 days, then access is locked at 14 days if no activity occurs.',
      difficulty: 'intermediate',
      tags: ['inactivity-policy', 'course-lockout', 'timeline']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Inactivity Policies and Timeline',
  learningObjectives: [
    'Understand the inactivity escalation timeline',
    'Know when course access gets locked'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 4 - Response Time After Lockout (Knowledge)
 * Function name: course4_03_time_management_question4
 */
exports.course4_03_time_management_question4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students have _____ weeks to meet with RTD Administration after their course access is locked.",
      options: [
        { 
          id: 'a', 
          text: 'one',
          feedback: 'Incorrect. Students have more time than one week to respond to being locked out.'
        },
        { 
          id: 'b', 
          text: 'two',
          feedback: 'Correct! Students have two weeks to meet with RTD Administration after being locked out. Failure to respond within this time results in withdrawal.'
        },
        { 
          id: 'c', 
          text: 'three',
          feedback: 'Incorrect. The response window is shorter than three weeks.'
        },
        { 
          id: 'd', 
          text: 'four',
          feedback: 'Incorrect. This would be too long and delay necessary intervention.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'The two-week response window after lockout gives students adequate time to schedule and attend a meeting with RTD Administration to create a plan for resuming their studies.',
      difficulty: 'intermediate',
      tags: ['lockout-response', 'administration-meeting', 'timeline']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Inactivity Response Requirements',
  learningObjectives: [
    'Know the response timeline after course lockout',
    'Understand intervention procedures'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 5 - Total Withdrawal Timeline (Knowledge)
 * Function name: course4_03_time_management_question5
 */
exports.course4_03_time_management_question5 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Students who don't respond to lockout will be withdrawn from their course after a total of _____ days of inactivity.",
      options: [
        { 
          id: 'a', 
          text: '21',
          feedback: 'Incorrect. The total timeline is longer than 21 days.'
        },
        { 
          id: 'b', 
          text: '28',
          feedback: 'Correct! The complete timeline is 28 days: 7 days to warning, 14 days to lockout, then 14 more days to withdrawal (7+14+7=28 total).'
        },
        { 
          id: 'c', 
          text: '30',
          feedback: 'Incorrect. The timeline is slightly shorter than 30 days.'
        },
        { 
          id: 'd', 
          text: '35',
          feedback: 'Incorrect. This exceeds the actual withdrawal timeline.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'The 28-day total timeline allows multiple opportunities for intervention: warning email at 7 days, lockout at 14 days, and final withdrawal at 28 days if no response.',
      difficulty: 'intermediate',
      tags: ['withdrawal-timeline', 'total-inactivity', 'escalation']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Withdrawal Timeline',
  learningObjectives: [
    'Understand the complete inactivity escalation timeline',
    'Know when withdrawal occurs'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 6 - Sarah's Lockout Scenario
 * Function name: course4_03_time_management_question6
 */
exports.course4_03_time_management_question6 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Sarah received an email saying her course access has been locked due to 2 weeks of inactivity. She's been dealing with a family emergency. What should she do immediately?",
      options: [
        { 
          id: 'a', 
          text: 'Wait until the family emergency is completely resolved before contacting RTD',
          feedback: 'Incorrect. Waiting too long could result in withdrawal from the course. Sarah needs to act within the two-week response window.'
        },
        { 
          id: 'b', 
          text: 'Contact RTD Administration immediately to schedule a meeting and explain her situation',
          feedback: 'Correct! Sarah should contact RTD Administration right away to schedule a meeting within the two-week window. RTD understands that emergencies happen and will work with her.'
        },
        { 
          id: 'c', 
          text: 'Try to log in multiple times to unlock her access automatically',
          feedback: 'Incorrect. Once access is locked, it requires a meeting with RTD Administration to unlock. Simply trying to log in won\'t work.'
        },
        { 
          id: 'd', 
          text: 'Withdraw from the course to avoid getting a failing grade',
          feedback: 'Incorrect. There\'s no need to withdraw. RTD Academy is willing to work with students facing emergencies to create modified timelines.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'When course access is locked, students have two weeks to meet with RTD Administration. Family emergencies are exactly the type of situation where RTD will work with students to create a modified timeline and provide support.',
      difficulty: 'intermediate',
      tags: ['scenario', 'lockout-response', 'family-emergency', 'communication']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Emergency Response and Communication',
  learningObjectives: [
    'Understand proper response to course lockout',
    'Know how to communicate during emergencies'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 7 - Marcus's Prevention Scenario
 * Function name: course4_03_time_management_question7
 */
exports.course4_03_time_management_question7 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Marcus has been very busy with work and realizes he hasn't logged into his course for 5 days. He's worried about falling behind. What's the best approach?",
      options: [
        { 
          id: 'a', 
          text: 'Continue with his work schedule - 5 days isn\'t that long',
          feedback: 'Incorrect. While 5 days hasn\'t triggered warnings yet, Marcus should take proactive steps to prevent falling further behind.'
        },
        { 
          id: 'b', 
          text: 'Log in immediately and complete homework questions, even if just for a short time',
          feedback: 'Correct! Completing homework questions at least once per week is a key engagement requirement. Even a short session helps maintain course activity and prevents lockout.'
        },
        { 
          id: 'c', 
          text: 'Wait until he has a full day available to dedicate to studying',
          feedback: 'Incorrect. Waiting for large blocks of time can lead to prolonged inactivity. Small, regular sessions are better than waiting for perfect conditions.'
        },
        { 
          id: 'd', 
          text: 'Email his instructor to request an extension on all assignments',
          feedback: 'Incorrect. Marcus hasn\'t fallen behind enough to need extensions. He just needs to resume regular engagement.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Regular engagement, including completing homework questions at least once per week, is essential for staying active. Even short study sessions count toward the weekly activity requirement and help prevent course lockout.',
      difficulty: 'intermediate',
      tags: ['scenario', 'prevention', 'homework-engagement', 'time-management']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Proactive Course Engagement',
  learningObjectives: [
    'Understand prevention strategies for course inactivity',
    'Know the importance of regular homework completion'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 8 - Lisa's Communication Scenario
 * Function name: course4_03_time_management_question8
 */
exports.course4_03_time_management_question8 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Lisa knows she'll be traveling for work for the next 10 days and won't be able to access her course regularly. What should she do to prevent lockout?",
      options: [
        { 
          id: 'a', 
          text: 'Just focus on work and deal with the course when she returns',
          feedback: 'Incorrect. Ten days of inactivity would trigger a warning email and put Lisa at risk of lockout. She needs to take proactive steps.'
        },
        { 
          id: 'b', 
          text: 'Email her instructor beforehand to explain the situation and create a plan',
          feedback: 'Correct! Proactive communication with instructors about anticipated challenges is one of the best prevention strategies. This allows for planning and prevents misunderstandings.'
        },
        { 
          id: 'c', 
          text: 'Try to complete all assignments before leaving so she doesn\'t need to log in',
          feedback: 'Partially correct but incomplete. While completing work ahead is helpful, she still needs to communicate with her instructor about the extended absence.'
        },
        { 
          id: 'd', 
          text: 'Withdraw from the course temporarily and re-enroll later',
          feedback: 'Incorrect. There\'s no need for withdrawal. RTD Academy can work with students who communicate proactively about travel or work commitments.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Proactive communication is key to preventing lockouts. When students email instructors about challenges early, instructors can provide support and create modified expectations to help students succeed.',
      difficulty: 'intermediate',
      tags: ['scenario', 'proactive-communication', 'travel', 'prevention']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'green',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Proactive Communication and Planning',
  learningObjectives: [
    'Understand the importance of proactive communication',
    'Know how to prevent course access issues'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});
