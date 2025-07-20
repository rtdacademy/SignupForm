const functions = require('firebase-functions/v1');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

/**
 * AI-powered question generation for Technology Readiness & Assistive Tools lesson
 * Creates scenario-based questions about technology setup, hardware/software requirements,
 * ergonomics, file organization, accessibility features, and RTD Academy tech support
 */
exports.course4_07_technology_readiness_assistive_tools_aiQuestion = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Data object is required');
  }

  const { difficulty = 'medium', questionType = 'multiple-choice', topic = 'general' } = data;

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(functions.config().google.ai_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Comprehensive prompt for technology readiness and assistive tools scenarios
    const prompt = `Generate a thoughtful multiple-choice question about technology readiness and assistive tools for RTD Academy students. The question should test understanding of proper technology setup and accessibility features in online learning environments.

    Focus areas to choose from:
    - Hardware requirements: computers, webcams, microphones, internet speed
    - Software requirements: browsers, Microsoft Teams, LMS access, document viewers
    - Ergonomic workspace setup: monitor positioning, lighting, seating, keyboard placement
    - File organization: folder structures, naming conventions, backup strategies
    - Accessibility features: screen readers, voice recognition, captioning, text-to-speech
    - Assistive technology: magnification tools, alternative keyboards, specialized software
    - RTD Academy technical support: troubleshooting steps, who to contact, available resources
    - Exam setup requirements: secondary devices, camera positioning, environment preparation
    - Internet connectivity: bandwidth requirements, backup options, stability testing
    - Device maintenance: updates, security, performance optimization

    The question should:
    - Present a realistic technology scenario that RTD Academy students might encounter
    - Test practical application of tech setup knowledge, not just memorization
    - Include specific details about RTD Academy requirements when relevant
    - Have clearly distinct answer options with one best choice
    - Include plausible distractors that represent common technology mistakes
    - Be relevant to online learning success and accessibility needs

    Difficulty level: ${difficulty}
    Question type: ${questionType}
    Specific topic focus: ${topic}

    Provide exactly this JSON structure:
    {
      "question": "Scenario-based question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect, with reference to technology best practices and accessibility principles",
      "category": "Technology Readiness & Assistive Tools",
      "difficulty": "${difficulty}",
      "learningObjective": "Students will demonstrate understanding of technology setup requirements and accessibility features for online learning success"
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
      lessonId: '07-technology-readiness-assistive-tools'
    };

  } catch (error) {
    console.error('Error generating AI question:', error);
    
    // Return fallback question if AI generation fails
    return {
      success: true,
      question: {
        question: "Sarah is setting up her workspace for RTD Academy courses and wants to ensure she meets all technical requirements for exams. She has a laptop with a built-in webcam, but her internet connection sometimes drops during video calls. What should be her top priority to ensure exam success?",
        options: [
          "A) Test and upgrade internet connection, set up a secondary device as backup camera, and ensure stable power supply",
          "B) Buy an external webcam and assume the internet will work fine during exams",
          "C) Focus only on having good lighting and ignore internet connectivity issues",
          "D) Set up multiple monitors for better visibility but keep the same unstable internet"
        ],
        correctAnswer: "A",
        explanation: "Option A demonstrates comprehensive exam preparation by addressing the critical internet stability issue, ensuring backup camera capability with a secondary device, and planning for power reliability. Stable internet is essential for RTD Academy exams, and having backup systems prevents technical failures from disrupting assessments. Options B-D either ignore critical requirements or focus on less important aspects while neglecting essential technical infrastructure.",
        category: "Technology Readiness & Assistive Tools",
        difficulty: difficulty,
        learningObjective: "Students will demonstrate understanding of comprehensive technology setup requirements for successful online exam completion"
      },
      timestamp: new Date().toISOString(),
      generatedBy: 'Fallback',
      lessonId: '07-technology-readiness-assistive-tools'
    };
  }
});

// Activity type for standard questions
const ACTIVITY_TYPE = 'lesson';

/**
 * Standard Multiple Choice Question 1 - System Requirements Knowledge
 * Function name: course4_07_technology_readiness_question1
 */
exports.course4_07_technology_readiness_question1 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Technology Requirements and Specifications',
  learningObjectives: [
    'Understand minimum internet speed requirements for online learning',
    'Know the technical specifications needed for RTD Academy courses'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 2 - Internet Connection Requirements  
 * Function name: course4_07_technology_readiness_question2
 */
exports.course4_07_technology_readiness_question2 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Internet Connectivity and Exam Requirements',
  learningObjectives: [
    'Understand the importance of stable internet for proctored exams',
    'Know the advantages of wired vs wireless connections'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 3 - Ergonomic Setup Best Practices
 * Function name: course4_07_technology_readiness_question3
 */
exports.course4_07_technology_readiness_question3 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Ergonomic Workspace Setup',
  learningObjectives: [
    'Understand proper monitor positioning for health and comfort',
    'Know ergonomic best practices for long study sessions'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 4 - Accessibility Features Understanding
 * Function name: course4_07_technology_readiness_question4
 */
exports.course4_07_technology_readiness_question4 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Accessibility Features and Assistive Technology',
  learningObjectives: [
    'Understand how assistive technologies support different learning needs',
    'Identify appropriate accessibility features for specific challenges'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 5 - Proctored Exam Technology
 * Function name: course4_07_technology_readiness_question5
 */
exports.course4_07_technology_readiness_question5 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Proctored Exam Technology Requirements',
  learningObjectives: [
    'Understand camera and audio requirements for proctored exams',
    'Know the technical setup needed for exam integrity'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 6 - Scenario: Technical Difficulties During Exam
 * Function name: course4_07_technology_readiness_question6
 */
exports.course4_07_technology_readiness_question6 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Handling Technical Issues During Exams',
  learningObjectives: [
    'Know proper procedures for technical difficulties during proctored exams',
    'Understand the importance of immediate communication with proctors'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 7 - Scenario: Student with Vision Impairment
 * Function name: course4_07_technology_readiness_question7
 */
exports.course4_07_technology_readiness_question7 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Supporting Students with Visual Impairments',
  learningObjectives: [
    'Understand how assistive technology supports students with visual impairments',
    'Know about accommodation services available at RTD Academy'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 8 - Scenario: Ergonomic Setup Problems
 * Function name: course4_07_technology_readiness_question8
 */
exports.course4_07_technology_readiness_question8 = createStandardMultipleChoice({
  questions: [
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
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'cyan',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Identifying and Solving Ergonomic Problems',
  learningObjectives: [
    'Recognize symptoms of poor ergonomic setup',
    'Understand how proper workspace design prevents health issues'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});