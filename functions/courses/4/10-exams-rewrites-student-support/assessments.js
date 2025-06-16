const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

/**
 * AI-powered question generation for Exams, Rewrites & Student Support Resources lesson
 * Creates scenario-based questions about RTD Academy's rewrite policy, support services,
 * appeals process, ISP access, and course readiness
 */
exports.course4_10_exams_rewrites_student_support_aiQuestion = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Data object is required');
  }

  const { difficulty = 'medium', questionType = 'multiple-choice', topic = 'general' } = data;

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(functions.config().google.ai_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Comprehensive prompt for exam policies and student support
    const prompt = `Generate a thoughtful multiple-choice question about RTD Academy's exam policies, rewrite procedures, and student support services. The question should test understanding of policies and appropriate help-seeking behaviors.

    Focus areas to choose from:
    - Rewrite policy: one per course, all exams completed, practice test threshold (70%), section exams only
    - Quiz rewrite restrictions: no rewrites allowed for quizzes or daily assessments
    - Appeals process: mark disputes, investigation procedures, documentation requirements, timelines
    - Instructional Support Plans (ISPs): access procedures, assessment process, plan development, implementation
    - Support contact procedures: academic (support@rtdacademy.com), technical (tech@rtdacademy.com), wellness (wellness@rtdacademy.com)
    - Types of support: academic tutoring, study skills, writing assistance, technical help, wellness resources
    - Proactive help-seeking: warning signs, when to contact support, escalation procedures
    - Course readiness assessment: technology setup, study space preparation, schedule creation
    - E-learning reflection and preparation for upcoming courses
    - Response times and communication expectations

    The question should:
    - Present a realistic scenario that RTD Academy students might encounter
    - Test practical application of support policies, not just memorization
    - Include specific details about RTD Academy's procedures and contact information
    - Have clearly distinct answer options with one best choice
    - Include plausible distractors that represent common misunderstandings
    - Encourage appropriate help-seeking and support utilization
    - Be relevant to student success and course readiness

    Difficulty level: ${difficulty}
    Question type: ${questionType}
    Specific topic focus: ${topic}

    Provide exactly this JSON structure:
    {
      "question": "Scenario-based question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect, with reference to RTD Academy's support policies and best practices",
      "category": "Exams, Rewrites & Student Support",
      "difficulty": "${difficulty}",
      "learningObjective": "Students will demonstrate understanding of RTD Academy's support services and ability to seek help appropriately"
    }`;

    // Generate the question
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let questionText = response.text();

    // Clean up the response
    questionText = questionText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let questionData;
    try {
      questionData = JSON.parse(questionText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', questionText);
      throw new functions.https.HttpsError('internal', 'Failed to parse AI response as JSON');
    }

    // Validate the response structure
    const requiredFields = ['question', 'options', 'correctAnswer', 'explanation', 'category', 'difficulty'];
    for (const field of requiredFields) {
      if (!questionData[field]) {
        throw new functions.https.HttpsError('internal', `Generated question missing required field: ${field}`);
      }
    }

    // Additional validation
    if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
      throw new functions.https.HttpsError('internal', 'Generated question must have exactly 4 options');
    }

    if (!['A', 'B', 'C', 'D'].includes(questionData.correctAnswer)) {
      throw new functions.https.HttpsError('internal', 'Correct answer must be A, B, C, or D');
    }

    // Return the validated question
    return {
      success: true,
      question: questionData,
      timestamp: new Date().toISOString(),
      generatedBy: 'AI',
      lessonId: '10-exams-rewrites-student-support'
    };

  } catch (error) {
    console.error('Error generating AI question:', error);
    
    // Return fallback question if AI generation fails
    return {
      success: true,
      question: {
        question: "Emma is struggling with Physics 30 content and has fallen behind her target dates. She's completed Section 1 exam with 78% but is worried about Section 2. She wants to know about her rewrite options and what support is available. What is the most accurate information about RTD Academy's rewrite policy?",
        options: [
          "A) She can rewrite Section 1 now since she has one rewrite per course, and should contact support@rtdacademy.com for academic help",
          "B) She must wait until all three section exams are completed before requesting any rewrites", 
          "C) She can rewrite any quiz or section exam twice per course with instructor approval",
          "D) Rewrites are only available for students who score below 50% on their original attempt"
        ],
        correctAnswer: "B",
        explanation: "Option B is correct because RTD Academy's rewrite policy requires students to complete ALL three section exams before becoming eligible for a rewrite. While Emma can use her one rewrite opportunity per course, she must finish Sections 2 and 3 first, achieve the 70% threshold on the practice test for whichever section she wants to rewrite, and then request the rewrite. Option A is incorrect about timing. Option C is wrong about quiz rewrites (not allowed) and number of rewrites. Option D incorrectly states a minimum score requirement.",
        category: "Exams, Rewrites & Student Support",
        difficulty: difficulty,
        learningObjective: "Students will demonstrate understanding of RTD Academy's rewrite policy requirements and appropriate help-seeking procedures"
      },
      timestamp: new Date().toISOString(),
      generatedBy: 'Fallback',
      lessonId: '10-exams-rewrites-student-support'
    };
  }
});

// Activity type for standard questions
const ACTIVITY_TYPE = 'lesson';

/**
 * Standard Multiple Choice Question 1 - Rewrite Policy Knowledge
 * Function name: course4_10_exams_rewrites_question1
 */
exports.course4_10_exams_rewrites_question1 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Rewrite Policy and Requirements',
  learningObjectives: [
    'Understand RTD Academy\'s rewrite policy limitations',
    'Know the scope of rewrite opportunities'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 2 - Practice Test Requirements Knowledge
 * Function name: course4_10_exams_rewrites_question2
 */
exports.course4_10_exams_rewrites_question2 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Practice Test Requirements for Rewrites',
  learningObjectives: [
    'Know the practice test score requirement for rewrites',
    'Understand the preparation standards for rewrite requests'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 3 - Appeals Process Knowledge
 * Function name: course4_10_exams_rewrites_question3
 */
exports.course4_10_exams_rewrites_question3 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Appeals Process and Procedures',
  learningObjectives: [
    'Know the proper authority for formal appeals',
    'Understand the appeals submission process'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 4 - IPP Accommodations Knowledge
 * Function name: course4_10_exams_rewrites_question4
 */
exports.course4_10_exams_rewrites_question4 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'IPP Accommodations and Timing',
  learningObjectives: [
    'Know when to discuss IPP accommodations',
    'Understand the importance of early accommodation planning'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 5 - Support Contact Knowledge
 * Function name: course4_10_exams_rewrites_question5
 */
exports.course4_10_exams_rewrites_question5 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Support Contact Hierarchy',
  learningObjectives: [
    'Know the primary contact for support issues',
    'Understand the support contact hierarchy'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 6 - Rewrite Eligibility Scenario
 * Function name: course4_10_exams_rewrites_question6
 */
exports.course4_10_exams_rewrites_question6 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Applying Rewrite Policy to Real Scenarios',
  learningObjectives: [
    'Apply rewrite policy requirements to specific situations',
    'Understand the sequence of requirements for rewrite eligibility'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 7 - Appeals Process Scenario
 * Function name: course4_10_exams_rewrites_question7
 */
exports.course4_10_exams_rewrites_question7 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Applying Appeals Process to Real Situations',
  learningObjectives: [
    'Apply appeals process steps to specific scenarios',
    'Understand when to move from informal to formal appeals'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 8 - Complex Support Scenario
 * Function name: course4_10_exams_rewrites_question8
 */
exports.course4_10_exams_rewrites_question8 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'emerald',
  randomizeQuestions: false,
  randomizeOptions: true,
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Complex IPP Accommodation Planning',
  learningObjectives: [
    'Apply IPP accommodation procedures to complex scenarios',
    'Understand when to request administrator meetings for accommodation planning'
  ],
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});