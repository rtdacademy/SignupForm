const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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