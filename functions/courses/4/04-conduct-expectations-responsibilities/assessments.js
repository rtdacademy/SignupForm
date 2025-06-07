const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI-powered question generation for Digital Citizenship and Online Conduct lesson
 * Creates scenario-based questions about digital citizenship, social media conduct, 
 * exam integrity, cyberbullying prevention, and RTD Academy policies
 */
exports.course4_04_conduct_expectations_responsibilities_aiQuestion = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Data object is required');
  }

  const { difficulty = 'medium', questionType = 'multiple-choice', topic = 'general' } = data;

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(functions.config().google.ai_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Comprehensive prompt for digital citizenship and conduct scenarios
    const prompt = `Generate a thoughtful multiple-choice question about digital citizenship and online conduct for RTD Academy students. The question should test understanding of appropriate digital behavior in educational settings.

    Focus areas to choose from:
    - Digital citizenship pillars (respect, responsibility, critical thinking)
    - Social media conduct and professional representation
    - Exam integrity and proctoring policies  
    - Cyberbullying prevention and reporting
    - Privacy and digital footprint awareness
    - Virtual meeting etiquette and professional behavior
    - Cell phone policies during exams
    - Communication expectations with instructors
    - Online safety and security practices
    - Academic integrity in digital environments

    The question should:
    - Present a realistic scenario that RTD Academy students might encounter
    - Test application of digital citizenship principles, not just memorization
    - Include specific details about RTD Academy policies when relevant
    - Have clearly distinct answer options with one best choice
    - Include plausible distractors that represent common misconceptions
    - Be relevant to online learning environments

    Difficulty level: ${difficulty}
    Question type: ${questionType}
    Specific topic focus: ${topic}

    Provide exactly this JSON structure:
    {
      "question": "Scenario-based question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect, with reference to digital citizenship principles",
      "category": "Digital Citizenship & Online Conduct",
      "difficulty": "${difficulty}",
      "learningObjective": "Students will demonstrate understanding of appropriate digital citizenship behaviors in educational settings"
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
      lessonId: '04-conduct-expectations-responsibilities'
    };

  } catch (error) {
    console.error('Error generating AI question:', error);
    
    // Return fallback question if AI generation fails
    return {
      success: true,
      question: {
        question: "You discover that a classmate has been posting negative comments about RTD Academy and specific instructors on social media, using their real name and mentioning the school directly. They ask you not to tell anyone. According to digital citizenship principles and RTD Academy policies, what should you do?",
        options: [
          "A) Encourage them to remove the posts and speak directly with the instructor about their concerns through appropriate channels",
          "B) Ignore the situation since it's not your responsibility to monitor classmates' social media",
          "C) Join the conversation to show support and add your own concerns about the school",
          "D) Screenshot the posts and share them with other students to get their opinions"
        ],
        correctAnswer: "A",
        explanation: "Option A demonstrates responsible digital citizenship by encouraging direct, professional communication. Digital citizenship requires taking responsibility for our online community and helping others make good choices. Posting negative comments about the school and instructors publicly can damage relationships and the student's reputation. The appropriate action is to encourage professional communication through proper channels while respecting everyone involved. Options B-D either ignore the problem or make it worse.",
        category: "Digital Citizenship & Online Conduct",
        difficulty: difficulty,
        learningObjective: "Students will demonstrate understanding of appropriate responses to digital citizenship violations and professional communication expectations"
      },
      timestamp: new Date().toISOString(),
      generatedBy: 'Fallback',
      lessonId: '04-conduct-expectations-responsibilities'
    };
  }
});
