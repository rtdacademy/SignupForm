const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

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