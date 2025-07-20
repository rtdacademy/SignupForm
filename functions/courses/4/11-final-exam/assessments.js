const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { createAIShortAnswer } = require('../shared/assessment-types/ai-short-answer');
const { createAILongAnswer } = require('../shared/assessment-types/ai-long-answer');

exports.course4_11_final_exam_question1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "According to RTD Academy's course completion policies, what is the minimum requirement for course completion?",
      options: [
        { id: 'a', text: "Complete all lessons with at least 60% average" },
        { id: 'b', text: "Complete all assignments and exams with at least 50% average" },
        { id: 'c', text: "Complete all required activities with the minimum passing grade specified in the course" },
        { id: 'd', text: "Complete at least 80% of all course activities" }
      ],
      correctOptionId: 'c',
      explanation: "Students must complete all required activities and achieve the minimum passing grade specified for each course. The specific passing grade varies by course but is clearly outlined in the course syllabus.",
      difficulty: "advanced",
      topic: "Course Completion Policies"
    }
  ],
  pointsValue: 5,
  maxAttempts: 1,
  showFeedback: false
});

exports.course4_11_final_exam_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Which statement best describes the relationship between academic integrity and technology use at RTD Academy?",
      options: [
        { id: 'a', text: "Technology use is unrestricted as long as work is completed" },
        { id: 'b', text: "Students may use any technology but must cite all sources used" },
        { id: 'c', text: "Technology use must follow academic integrity principles including proper attribution and honest work" },
        { id: 'd', text: "Only specific RTD-approved technology tools may be used for coursework" }
      ],
      correctOptionId: 'c',
      explanation: "Academic integrity principles apply to all technology use, requiring students to do honest work, properly attribute sources, and avoid plagiarism whether using AI tools, online resources, or other technology.",
      difficulty: "advanced",
      topic: "Academic Integrity and Technology"
    }
  ],
  pointsValue: 5,
  maxAttempts: 1,
  showFeedback: false
});

exports.course4_11_final_exam_question3 = createAIShortAnswer({
  prompt: "Generate a short answer question about student support services at RTD Academy and exam rewrite procedures. The question should ask students to describe available support services and explain the proper procedures for exam rewrites.",
  expectedAnswers: ["RTD Academy provides various student support services including counseling services, technical support, and accessibility services. For exam rewrites, students must follow specific procedures: contact their instructor within the required timeframe, provide valid reasons for the rewrite request, and follow the established rewrite policies. Students should access these services through proper channels such as the student portal, direct instructor contact, or the student support office."],
  keyWords: ["student support services", "counseling", "technical support", "exam rewrites", "procedures", "instructor contact"],
  pointsValue: 5,
  wordLimits: { min: 50, max: 300 },
  activityType: "exam",
  maxAttempts: 1,
  showFeedback: false,
  enableAIChat: false,
  subject: "Student Services",
  topic: "Student Support and Exam Procedures",
  fallbackQuestions: [
    {
      questionText: "Describe the student support services available at RTD Academy and explain the proper procedures for exam rewrites. Include when and how a student should access these services.",
      expectedAnswer: "RTD Academy provides various student support services including counseling services, technical support, and accessibility services. For exam rewrites, students must follow specific procedures: contact their instructor within the required timeframe, provide valid reasons for the rewrite request, and follow the established rewrite policies. Students should access these services through proper channels such as the student portal, direct instructor contact, or the student support office.",
      sampleAnswer: "RTD Academy offers counseling services, technical support, and accessibility services to help students succeed. For exam rewrites, students must contact their instructor promptly, provide valid reasons for the request, and follow established policies. These services can be accessed through the student portal or by contacting instructors directly.",
      acceptableAnswers: ["counseling services", "technical support", "accessibility services", "exam rewrite procedures", "instructor contact"],
      wordLimit: { min: 50, max: 300 },
      difficulty: "advanced"
    }
  ]
});

exports.course4_11_final_exam_question4 = createAILongAnswer({
  prompt: "Generate a long answer question about digital citizenship that presents a scenario involving inappropriate online conduct and academic integrity concerns. The question should ask students to demonstrate how they would handle both issues using digital citizenship principles.",
  rubric: [
    {
      criterion: "Digital Citizenship Understanding",
      points: 3,
      description: "Demonstrates comprehensive understanding of digital citizenship principles"
    },
    {
      criterion: "Online Safety Application",
      points: 3,
      description: "Shows knowledge of online safety practices and cyberbullying prevention"
    },
    {
      criterion: "Real-world Application",
      points: 2,
      description: "Applies concepts to realistic scenarios with practical solutions"
    },
    {
      criterion: "Communication and Ethics",
      points: 2,
      description: "Addresses ethical considerations and appropriate communication strategies"
    }
  ],
  totalPoints: 10,
  wordLimits: { min: 100, max: 500 },
  activityType: "exam",
  maxAttempts: 1,
  showFeedback: false,
  enableAIChat: false,
  subject: "Digital Citizenship",
  topic: "Digital Citizenship Scenario",
  fallbackQuestions: [
    {
      questionText: "You are working on a group project with classmates online when you notice one student sharing inappropriate content and making other group members uncomfortable. Another student suggests using an unauthorized website to complete the assignment faster. As a responsible digital citizen, how would you handle this situation? Address both the inappropriate conduct and the academic integrity concern, explaining the principles of digital citizenship that guide your actions.",
      rubric: [
        {
          criterion: "Digital Citizenship Understanding",
          points: 3,
          description: "Demonstrates comprehensive understanding of digital citizenship principles"
        },
        {
          criterion: "Online Safety Application",
          points: 3,
          description: "Shows knowledge of online safety practices and cyberbullying prevention"
        },
        {
          criterion: "Real-world Application",
          points: 2,
          description: "Applies concepts to realistic scenarios with practical solutions"
        },
        {
          criterion: "Communication and Ethics",
          points: 2,
          description: "Addresses ethical considerations and appropriate communication strategies"
        }
      ],
      maxPoints: 10,
      wordLimit: { min: 100, max: 500 },
      sampleAnswer: "As a responsible digital citizen, I would address both issues immediately. For the inappropriate content, I would privately message the student to ask them to stop, document the behavior, and report it to the instructor if necessary to protect group members from harassment. For the academic integrity concern, I would remind the group about the importance of using authorized resources and suggest we find legitimate sources instead. Digital citizenship principles that guide these actions include respect for others, maintaining academic integrity, taking responsibility for online behavior, and creating a safe digital environment for all participants.",
      difficulty: "advanced"
    }
  ]
});