const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI-powered question generation for Communication Tools & Etiquette lesson
 * Creates scenario-based questions about professional communication, virtual meeting etiquette,
 * email best practices, Teams/LMS usage, and RTD Academy communication expectations
 */
exports.course4_06_communication_tools_etiquette_aiQuestion = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Data object is required');
  }

  const { difficulty = 'medium', questionType = 'multiple-choice', topic = 'general' } = data;

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(functions.config().google.ai_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Comprehensive prompt for communication tools and etiquette scenarios
    const prompt = `Generate a thoughtful multiple-choice question about professional communication tools and etiquette for RTD Academy students. The question should test understanding of appropriate digital communication in educational settings.

    Focus areas to choose from:
    - Professional vs casual communication styles and language
    - Proper use of Teams for virtual meetings and collaboration
    - LMS messaging protocols and appropriate content
    - Email structure, greetings, body content, and sign-offs
    - Virtual meeting etiquette (camera setup, audio, participation)
    - Professional username guidelines and digital presence
    - Response time expectations and communication boundaries
    - Platform-specific communication protocols (when to use email vs LMS vs Teams)
    - Professional tone and language in academic settings
    - Code-switching between social and academic communication contexts

    The question should:
    - Present a realistic communication scenario that RTD Academy students might encounter
    - Test application of professional communication principles, not just memorization
    - Include specific details about RTD Academy communication expectations when relevant
    - Have clearly distinct answer options with one best choice
    - Include plausible distractors that represent common communication mistakes
    - Be relevant to online learning environments and digital communication

    Difficulty level: ${difficulty}
    Question type: ${questionType}
    Specific topic focus: ${topic}

    Provide exactly this JSON structure:
    {
      "question": "Scenario-based question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect, with reference to professional communication principles",
      "category": "Communication Tools & Etiquette",
      "difficulty": "${difficulty}",
      "learningObjective": "Students will demonstrate understanding of professional communication standards in educational settings"
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
      lessonId: '06-communication-tools-etiquette'
    };

  } catch (error) {
    console.error('Error generating AI question:', error);
    
    // Return fallback question if AI generation fails
    return {
      success: true,
      question: {
        question: "You need to ask your instructor about an assignment deadline extension due to a family emergency. You have their email address and can also contact them through the LMS messaging system. Which approach demonstrates the most professional communication?",
        options: [
          "A) Send a detailed email with a clear subject line, explain the situation professionally, and follow up with an LMS message if needed",
          "B) Send a quick text-style message through LMS: 'hey need extension on assignment - family stuff came up'",
          "C) Wait until the last minute and send a brief email saying you need more time without explanation",
          "D) Post about your situation on social media and hope the instructor sees it"
        ],
        correctAnswer: "A",
        explanation: "Option A demonstrates professional communication by using email for formal requests, providing clear subject lines, explaining the situation appropriately, and having a backup communication method. Professional communication requires clear, respectful language and appropriate channel selection. Options B-D either use inappropriate tone, lack necessary detail, or use unsuitable communication channels for academic correspondence.",
        category: "Communication Tools & Etiquette",
        difficulty: difficulty,
        learningObjective: "Students will demonstrate understanding of appropriate communication channels and professional tone in academic settings"
      },
      timestamp: new Date().toISOString(),
      generatedBy: 'Fallback',
      lessonId: '06-communication-tools-etiquette'
    };
  }
});
