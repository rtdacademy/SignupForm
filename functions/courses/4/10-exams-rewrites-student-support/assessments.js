/**
 * Assessment Functions for Exams, Rewrites & Student Support Resources
 * Course: 4 (RTD Academy Orientation - COM1255)
 * Content: 10-exams-rewrites-student-support
 * 
 * This module provides assessments for RTD Academy's rewrite policy, support services,
 * appeals process, ISP access, and course readiness using the shared assessment system
 * with general educational configuration.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type (will be overridden by database config if available)
const activityDefaults = {
  theme: 'emerald',
  maxAttempts: 1,
  pointsValue: 1
};

/**
 * Question Pool 1 - Rewrite Policy Knowledge
 */
const questionPool1 = [
  {
    questionText: "How many rewrite opportunities does each student get per course at RTD Academy?",
    options: [
      { 
        id: 'a', 
        text: 'Unlimited rewrites with instructor approval',
        feedback: 'Incorrect. RTD Academy has a specific limit on rewrite opportunities per course.'
      },
      { 
        id: 'b', 
        text: 'One rewrite opportunity per course',
        feedback: 'Correct! Each student is entitled to one rewrite opportunity per course, which can be used for any single section exam of their choice.'
      },
      { 
        id: 'c', 
        text: 'Two rewrites per course maximum',
        feedback: 'Incorrect. Students receive fewer rewrite opportunities than this.'
      },
      { 
        id: 'd', 
        text: 'One rewrite per section exam',
        feedback: 'Incorrect. The limit applies to the entire course, not individual sections.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'RTD Academy provides exactly one rewrite opportunity per course. Students can choose which section exam to rewrite, but they can only use this opportunity once per course.',
    difficulty: 'beginner',
    tags: ['rewrite-policy', 'course-limits', 'section-exams']
  }
];

/**
 * Question Pool 2 - Practice Test Requirements Knowledge
 */
const questionPool2 = [
  {
    questionText: "What score must students achieve on the practice test before requesting a rewrite?",
    options: [
      { 
        id: 'a', 
        text: '50% or higher',
        feedback: 'Incorrect. The required threshold is higher than this.'
      },
      { 
        id: 'b', 
        text: '60% or higher',
        feedback: 'Incorrect. The required threshold is higher than this.'
      },
      { 
        id: 'c', 
        text: '70% or higher',
        feedback: 'Correct! Students must score at least 70% on the practice test specific to the section they want to rewrite before they can request a rewrite.'
      },
      { 
        id: 'd', 
        text: '80% or higher',
        feedback: 'Incorrect. While this is a good score, the required threshold is lower.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'The practice test threshold is 70%. This demonstrates that the student has adequately prepared and is ready for a successful rewrite attempt.',
    difficulty: 'beginner',
    tags: ['practice-test', 'threshold-requirements', 'rewrite-preparation']
  }
];

/**
 * Question Pool 3 - Appeals Process Knowledge
 */
const questionPool3 = [
  {
    questionText: "To whom should formal written appeals be submitted at RTD Academy?",
    options: [
      { 
        id: 'a', 
        text: 'The course instructor',
        feedback: 'Incorrect. Formal appeals go to a higher authority than the course instructor.'
      },
      { 
        id: 'b', 
        text: 'The principal',
        feedback: 'Correct! Formal written appeals should be submitted to the principal, who will conduct the investigation and review.'
      },
      { 
        id: 'c', 
        text: 'The course coordinator',
        feedback: 'Incorrect. While coordinators may be involved, formal appeals go to the principal.'
      },
      { 
        id: 'd', 
        text: 'Student support services',
        feedback: 'Incorrect. Support services handle other issues, but formal appeals have a specific submission process.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Formal written appeals must be submitted to the principal, who has the authority to conduct investigations and make decisions about grade disputes.',
    difficulty: 'intermediate',
    tags: ['appeals-process', 'formal-procedures', 'principal-authority']
  }
];

/**
 * Question Pool 4 - IPP Accommodations Knowledge
 */
const questionPool4 = [
  {
    questionText: "When should students discuss their IPP accommodations at RTD Academy?",
    options: [
      { 
        id: 'a', 
        text: 'Only if they encounter difficulties during the course',
        feedback: 'Incorrect. IPP accommodations should be discussed proactively, not reactively.'
      },
      { 
        id: 'b', 
        text: 'During their orientation meeting',
        feedback: 'Correct! Students should discuss their IPP accommodations during their orientation meeting to ensure accommodations are implemented from the start of their course.'
      },
      { 
        id: 'c', 
        text: 'After completing their first assessment',
        feedback: 'Incorrect. This is too late - accommodations should be in place from the beginning.'
      },
      { 
        id: 'd', 
        text: 'Only for diploma exams',
        feedback: 'Incorrect. IPP accommodations apply to all assessments, not just diploma exams.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'IPP accommodations should be discussed during the orientation meeting so that all necessary supports can be implemented from the very beginning of the student\'s course.',
    difficulty: 'intermediate',
    tags: ['ipp-accommodations', 'orientation-meeting', 'proactive-planning']
  }
];

/**
 * Question Pool 5 - Support Contact Knowledge
 */
const questionPool5 = [
  {
    questionText: "Who should students contact first for both academic and technical support issues?",
    options: [
      { 
        id: 'a', 
        text: 'Stan Scott directly',
        feedback: 'Incorrect. Stan Scott is the secondary contact for technical issues only.'
      },
      { 
        id: 'b', 
        text: 'RTD Academy support services',
        feedback: 'Incorrect. There is a more direct first contact for students.'
      },
      { 
        id: 'c', 
        text: 'Their course teacher',
        feedback: 'Correct! Students should contact their course teacher first for both academic and technical support issues before escalating to other contacts.'
      },
      { 
        id: 'd', 
        text: 'The principal',
        feedback: 'Incorrect. The principal handles formal appeals, not initial support requests.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'The course teacher is the primary contact for both academic and technical support. They can either help directly or direct students to the appropriate secondary contacts like Stan Scott for complex technical issues.',
    difficulty: 'beginner',
    tags: ['support-contacts', 'course-teacher', 'first-contact']
  }
];

/**
 * Question Pool 6 - Rewrite Eligibility Scenario
 */
const questionPool6 = [
  {
    questionText: "Alex has completed Section 1 (78%) and Section 2 (65%) of his Physics 30 course but hasn't taken Section 3 yet. He wants to improve his Section 2 grade. What must Alex do first according to RTD Academy's rewrite policy?",
    options: [
      { 
        id: 'a', 
        text: 'Complete the Section 2 practice test and achieve 70%',
        feedback: 'Incorrect. While the practice test is required, there\'s something else Alex must do first.'
      },
      { 
        id: 'b', 
        text: 'Complete Section 3 exam first, then complete all rewrite requirements',
        feedback: 'Correct! Students must complete all three section exams before becoming eligible for any rewrite. Alex must finish Section 3 before he can request a Section 2 rewrite.'
      },
      { 
        id: 'c', 
        text: 'Request the rewrite immediately since he scored below 70%',
        feedback: 'Incorrect. Alex hasn\'t met the basic eligibility requirement for rewrites yet.'
      },
      { 
        id: 'd', 
        text: 'Contact his instructor to schedule the Section 2 rewrite',
        feedback: 'Incorrect. Alex is not yet eligible for any rewrite requests.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'RTD Academy\'s rewrite policy requires students to complete all three section exams before becoming eligible for a rewrite. Only after Alex completes Section 3 can he then complete the practice test and request a Section 2 rewrite.',
    difficulty: 'advanced',
    tags: ['rewrite-eligibility', 'completion-requirements', 'scenario-application']
  }
];

/**
 * Question Pool 7 - Appeals Process Scenario
 */
const questionPool7 = [
  {
    questionText: "Maya believes her English 30-1 essay was marked incorrectly and wants to appeal the grade. She already tried discussing it with her instructor but wasn't satisfied with the response. What should Maya do next?",
    options: [
      { 
        id: 'a', 
        text: 'Submit a formal written appeal directly to the principal with evidence supporting her position',
        feedback: 'Correct! Since Maya has already attempted informal discussion with her instructor, she can now proceed to submit a formal written appeal to the principal.'
      },
      { 
        id: 'b', 
        text: 'Contact Stan Scott for technical support with the grading system',
        feedback: 'Incorrect. This is not a technical issue but a grade dispute that requires the appeals process.'
      },
      { 
        id: 'c', 
        text: 'Request a rewrite of the essay instead of appealing',
        feedback: 'Incorrect. Essays and assignments cannot be rewritten - only section exams are eligible for rewrites.'
      },
      { 
        id: 'd', 
        text: 'Wait 30 days and then submit the appeal',
        feedback: 'Incorrect. There\'s no waiting period required, and Maya should act promptly within the appeal deadlines.'
      }
    ],
    correctOptionId: 'a',
    explanation: 'Maya has completed the informal discussion step and should now submit a formal written appeal to the principal. She needs to include evidence supporting her position and documentation of her informal discussion attempts.',
    difficulty: 'advanced',
    tags: ['appeals-scenario', 'formal-appeal-process', 'grade-disputes']
  }
];

/**
 * Question Pool 8 - Complex Support Scenario
 */
const questionPool8 = [
  {
    questionText: "Jordan has an IPP requiring extended time and frequent breaks. He's starting his Math 30-1 course next week, but he's concerned about how his accommodations will work in the online environment, especially for proctored exams. What should Jordan do?",
    options: [
      { 
        id: 'a', 
        text: 'Wait until the first exam to see how the accommodations work',
        feedback: 'Incorrect. Jordan should be proactive rather than waiting until issues arise during an actual exam.'
      },
      { 
        id: 'b', 
        text: 'Contact his course teacher first, then request a meeting with an administrator to discuss complex accommodation implementation',
        feedback: 'Correct! Since Jordan\'s accommodations are complex and he\'s unsure how they\'ll work online, he should request a meeting with an administrator to ensure proper implementation.'
      },
      { 
        id: 'c', 
        text: 'Email Stan Scott about the technical setup for his accommodations',
        feedback: 'Incorrect. While Stan handles technical issues, IPP accommodations require administrative planning, not just technical setup.'
      },
      { 
        id: 'd', 
        text: 'Proceed without accommodations since it\'s an online course',
        feedback: 'Incorrect. IPP accommodations apply to all learning environments, including online courses.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Jordan should request a meeting with an administrator because his accommodations are complex and he\'s unsure how they\'ll work in the online environment. This proactive approach ensures his needs are properly addressed before he starts his course.',
    difficulty: 'advanced',
    tags: ['ipp-complex-scenario', 'administrator-meeting', 'proactive-planning']
  }
];

/**
 * Assessment Configurations for Universal Assessment Function
 * 
 * Export plain configuration objects that the universal assessment function
 * can use to instantiate StandardMultipleChoiceCore handlers
 */
const assessmentConfigs = {
  'course4_10_exams_rewrites_question1': {
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

  'course4_10_exams_rewrites_question2': {
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

  'course4_10_exams_rewrites_question3': {
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

  'course4_10_exams_rewrites_question4': {
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

  'course4_10_exams_rewrites_question5': {
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

  'course4_10_exams_rewrites_question6': {
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

  'course4_10_exams_rewrites_question7': {
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

  'course4_10_exams_rewrites_question8': {
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