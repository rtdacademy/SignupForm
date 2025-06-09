const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI-powered question generation for Cell Phone Policy & Exam Proctoring lesson
 * Creates scenario-based questions about RTD Academy's cell phone requirements,
 * secondary camera setup procedures, exam day behaviors, and accessibility accommodations
 */
exports.course4_08_cell_phone_policy_exam_proctoring_aiQuestion = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Data object is required');
  }

  const { difficulty = 'medium', questionType = 'multiple-choice', topic = 'general' } = data;

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(functions.config().google.ai_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Comprehensive prompt for cell phone policy and exam proctoring scenarios
    const prompt = `Generate a thoughtful multiple-choice question about RTD Academy's cell phone policy and exam proctoring procedures. The question should test understanding of proper device usage, setup requirements, and academic integrity in online assessments.

    Focus areas to choose from:
    - Secondary camera setup: phone positioning, platform joining, naming conventions, technical requirements
    - Exam day behaviors: permitted vs. prohibited actions, communication protocols, emergency procedures
    - Do Not Disturb requirements: notification blocking, app management, device preparation
    - Violation consequences: immediate exam termination, warning systems, grade impacts
    - Academic integrity: unauthorized device use, communication restrictions, monitoring compliance
    - Accessibility accommodations: assistive technology exceptions, modified setup requirements, medical considerations
    - Technical troubleshooting: camera failures, connectivity issues, device malfunctions
    - Camera positioning: workspace visibility, angle requirements, privacy considerations
    - Proctoring protocols: instructor communication, break procedures, emergency situations
    - Policy enforcement: warning processes, escalation procedures, documentation requirements

    The question should:
    - Present a realistic scenario that RTD Academy students might encounter during exams
    - Test practical application of cell phone policy knowledge, not just memorization
    - Include specific details about RTD Academy's requirements and procedures
    - Have clearly distinct answer options with one best choice
    - Include plausible distractors that represent common policy misunderstandings
    - Be relevant to maintaining academic integrity and exam security

    Difficulty level: ${difficulty}
    Question type: ${questionType}
    Specific topic focus: ${topic}

    Provide exactly this JSON structure:
    {
      "question": "Scenario-based question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect, with reference to RTD Academy's cell phone policy and academic integrity principles",
      "category": "Cell Phone Policy & Exam Proctoring",
      "difficulty": "${difficulty}",
      "learningObjective": "Students will demonstrate understanding of RTD Academy's cell phone policy requirements and proper exam proctoring procedures"
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
      lessonId: '08-cell-phone-policy-exam-proctoring'
    };

  } catch (error) {
    console.error('Error generating AI question:', error);
    
    // Return fallback question if AI generation fails
    return {
      success: true,
      question: {
        question: "During a Math 30-1 section exam, Alex's phone starts buzzing with notifications despite being set to 'Do Not Disturb' mode. The phone is positioned as the secondary camera showing his workspace. What should Alex do immediately?",
        options: [
          "A) Stop the exam immediately and notify the proctor about the technical issue with his phone setup",
          "B) Continue the exam and ignore the notifications since the camera is still working",
          "C) Quickly pick up the phone to properly silence it and continue with the exam",
          "D) Try to continue the exam but explain the situation in the chat to the proctor"
        ],
        correctAnswer: "A",
        explanation: "Option A is correct because any technical issues during an exam, including notification failures, must be addressed immediately with proctor guidance to maintain exam integrity. Touching the phone (Option C) would violate policy and could void the exam. Ignoring the issue (Option B) doesn't address the potential distraction and policy violation. While communication is important (Option D), the exam should be stopped first to prevent any appearance of impropriety and ensure proper resolution of the technical issue.",
        category: "Cell Phone Policy & Exam Proctoring",
        difficulty: difficulty,
        learningObjective: "Students will demonstrate understanding of proper procedures for handling technical issues during proctored exams while maintaining academic integrity"
      },
      timestamp: new Date().toISOString(),
      generatedBy: 'Fallback',
      lessonId: '08-cell-phone-policy-exam-proctoring'
    };
  }
});