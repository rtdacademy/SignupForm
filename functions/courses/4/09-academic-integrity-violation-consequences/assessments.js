const functions = require('firebase-functions');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI-powered question generation for Academic Integrity & Violation Consequences lesson
 * Creates scenario-based questions about RTD Academy's academic integrity policy,
 * violation types, disciplinary procedures, appeals process, and ethical decision-making
 */
exports.course4_09_academic_integrity_violation_consequences_aiQuestion = functions.https.onCall(async (data, context) => {
  // Input validation
  if (!data || typeof data !== 'object') {
    throw new functions.https.HttpsError('invalid-argument', 'Data object is required');
  }

  const { difficulty = 'medium', questionType = 'multiple-choice', topic = 'general' } = data;

  try {
    // Initialize Google AI
    const genAI = new GoogleGenerativeAI(functions.config().google.ai_key);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Comprehensive prompt for academic integrity scenarios
    const prompt = `Generate a thoughtful multiple-choice question about RTD Academy's academic integrity policy and violation consequences. The question should test understanding of ethical academic behavior, policy violations, and appropriate responses to integrity challenges.

    Focus areas to choose from:
    - Academic integrity violations: plagiarism (copying without citation), AI misuse (ChatGPT on exams), unauthorized collaboration, impersonation
    - Disciplinary process: first offense (0% grade, integrity module, re-write option), second offense (withdrawal, final grade submission)
    - Appeals policy: 14-day deadline, investigation process, required documentation, possible outcomes
    - Violation consequences: immediate exam termination, academic record impacts, future enrollment restrictions
    - Ethical scenarios: proper citation practices, appropriate AI use, legitimate collaboration vs. cheating
    - Case study applications: analyzing real student situations and determining appropriate responses
    - Prevention strategies: communication with instructors, understanding policies, seeking help appropriately
    - Policy enforcement: warning systems, documentation requirements, meeting obligations
    - Student responsibilities: reporting violations, understanding consequences, making ethical choices
    - Real-world examples: workplace integrity connections, long-term impacts of academic dishonesty

    The question should:
    - Present a realistic scenario that RTD Academy students might encounter
    - Test practical application of academic integrity knowledge, not just memorization
    - Include specific details about RTD Academy's policies and procedures
    - Have clearly distinct answer options with one best choice
    - Include plausible distractors that represent common policy misunderstandings
    - Encourage critical thinking about ethical decision-making in academic contexts
    - Be relevant to maintaining integrity and preventing violations

    Difficulty level: ${difficulty}
    Question type: ${questionType}
    Specific topic focus: ${topic}

    Provide exactly this JSON structure:
    {
      "question": "Scenario-based question text here",
      "options": ["A) First option", "B) Second option", "C) Third option", "D) Fourth option"],
      "correctAnswer": "A",
      "explanation": "Detailed explanation of why this answer is correct and why others are incorrect, with reference to RTD Academy's academic integrity policy and ethical principles",
      "category": "Academic Integrity & Violation Consequences",
      "difficulty": "${difficulty}",
      "learningObjective": "Students will demonstrate understanding of RTD Academy's academic integrity policy and ability to make ethical decisions in academic contexts"
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
      lessonId: '09-academic-integrity-violation-consequences'
    };

  } catch (error) {
    console.error('Error generating AI question:', error);
    
    // Return fallback question if AI generation fails
    return {
      success: true,
      question: {
        question: "Maria is working on her Chemistry 30 assignment and finds a helpful explanation online that perfectly addresses one of the questions. She paraphrases the content and incorporates it into her answer but doesn't include a citation because she 'put it in her own words.' According to RTD Academy's academic integrity policy, what should Maria have done?",
        options: [
          "A) Include a proper citation even when paraphrasing, as the ideas originated from another source",
          "B) Continue without citation since paraphrasing makes the content her own work", 
          "C) Only cite if she used direct quotes from the original source",
          "D) Ask her classmates if they think a citation is necessary for paraphrased content"
        ],
        correctAnswer: "A",
        explanation: "Option A is correct because RTD Academy's academic integrity policy requires citation of all sources, even when paraphrasing. Using someone else's ideas without attribution constitutes plagiarism regardless of whether the wording has been changed. Option B is incorrect as paraphrasing alone doesn't make ideas original. Option C is wrong because citations are required for both direct quotes and paraphrased ideas. Option D is inappropriate as academic integrity decisions shouldn't be based on peer opinions but on established policy requirements.",
        category: "Academic Integrity & Violation Consequences",
        difficulty: difficulty,
        learningObjective: "Students will demonstrate understanding of proper citation requirements and recognize that plagiarism includes using others' ideas without attribution, even when paraphrased"
      },
      timestamp: new Date().toISOString(),
      generatedBy: 'Fallback',
      lessonId: '09-academic-integrity-violation-consequences'
    };
  }
});