const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');
const { createAIShortAnswer } = require('../../../shared/assessment-types/ai-short-answer');

exports.course4_06_mid_exam_question1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Which of the following best describes the MyPass registration requirement at RTD Academy?",
      options: [
        { id: 'a', text: "Students must register for MyPass before starting any courses" },
        { id: 'b', text: "MyPass registration is optional for all students" },
        { id: 'c', text: "Only Grade 12 students need to register for MyPass" },
        { id: 'd', text: "MyPass registration is required only for diploma exams" }
      ],
      correctOptionId: 'a',
      explanation: "All students must register for MyPass before starting their courses at RTD Academy, as this is essential for tracking their academic progress and ensuring proper reporting to PASI.",
      difficulty: "intermediate",
      topic: "RTD Academy Policies"
    }
  ],
  pointsValue: 5,
  maxAttempts: 1,
  showFeedback: false // Exam mode - no feedback
});

exports.course4_06_mid_exam_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What happens if a student doesn't log in for 3 consecutive weeks?",
      options: [
        { id: 'a', text: "Nothing happens, students can log in whenever they want" },
        { id: 'b', text: "The student receives a warning email only" },
        { id: 'c', text: "The student's course is locked and they are contacted for withdrawal" },
        { id: 'd', text: "The student automatically fails the course" }
      ],
      correctOptionId: 'c',
      explanation: "After 3 weeks of inactivity, students' courses are locked and they are contacted regarding withdrawal from the course, as maintaining regular activity is essential for success in asynchronous learning.",
      difficulty: "intermediate",
      topic: "Time Management and Activity Requirements"
    }
  ],
  pointsValue: 5,
  maxAttempts: 1,
  showFeedback: false // Exam mode - no feedback
});

exports.course4_06_mid_exam_question3 = createAIShortAnswer({
  prompt: "Generate a short answer question about professional communication in RTD Academy's online learning environment. The question should ask students to explain professional communication and provide specific examples of appropriate online conduct.",
  expectedAnswers: ["Professional communication at RTD Academy involves clear, respectful, and academically appropriate interactions. This includes using proper email etiquette with clear subject lines and polite tone, participating respectfully in online discussions, properly citing sources to maintain academic integrity, and using technology appropriately for educational purposes."],
  keyWords: ["professional communication", "email etiquette", "respectful", "academic integrity", "online conduct"],
  pointsValue: 5,
  wordLimits: { min: 50, max: 200 },
  activityType: "exam",
  maxAttempts: 1,
  showFeedback: false,
  enableAIChat: false,
  subject: "Digital Citizenship",
  topic: "Communication and Conduct Standards",
  fallbackQuestions: [
    {
      questionText: "Explain what professional communication means in the context of RTD Academy's online learning environment. Include at least two specific examples of appropriate online conduct.",
      expectedAnswer: "Professional communication at RTD Academy involves clear, respectful, and academically appropriate interactions. This includes using proper email etiquette with clear subject lines and polite tone, participating respectfully in online discussions, properly citing sources to maintain academic integrity, and using technology appropriately for educational purposes.",
      sampleAnswer: "Professional communication in RTD Academy's online environment means communicating clearly and respectfully. For example, using proper email format with clear subject lines when contacting instructors, and participating in discussions with respectful language while properly citing any sources used.",
      acceptableAnswers: ["professional communication", "email etiquette", "respectful communication", "academic integrity"],
      wordLimit: { min: 50, max: 200 },
      difficulty: "intermediate"
    }
  ]
});