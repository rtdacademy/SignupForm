const { onCall } = require('firebase-functions/v2/https');
const { getDatabase } = require('firebase-admin/database');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Get database instance (Firebase Admin is already initialized in main index.js)
const db = getDatabase();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY);

/**
 * Shared AI Question Handler for Course 3 (Financial Literacy)
 * 
 * This cloud function handles AI-powered question generation for Course 3.
 * It provides a fallback for basic implementations and can be extended
 * for course-specific features.
 */
exports.course3_shared_aiQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  enforceAppCheck: false,
  secrets: ['GOOGLE_AI_API_KEY']
}, async (request) => {
  try {
    const { 
      studentEmail, 
      courseId, 
      assessmentId, 
      operation,
      answer,
      topic = 'Financial Literacy',
      difficulty = 'intermediate'
    } = request.data;

    // Validate required parameters
    if (!studentEmail || !courseId || !assessmentId || !operation) {
      throw new Error('Missing required parameters');
    }

    // Sanitize email for use as database key
    const sanitizedEmail = studentEmail.replace(/[.#$\/\[\]]/g, '_');

    if (operation === 'generate') {
      // Generate a new question using Gemini
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Create a ${difficulty} level multiple choice question about ${topic} for a Grade 11-12 Financial Literacy course.

Question Requirements:
- Single clear question
- 4 answer options labeled a, b, c, d
- Only one correct answer
- Include brief feedback for each option
- Provide explanation for the correct answer

Focus on practical, real-world financial scenarios that teenagers can relate to.

Format your response as JSON:
{
  "questionText": "question here",
  "options": [
    {"id": "a", "text": "option text", "feedback": "feedback text"},
    {"id": "b", "text": "option text", "feedback": "feedback text"},
    {"id": "c", "text": "option text", "feedback": "feedback text"},
    {"id": "d", "text": "option text", "feedback": "feedback text"}
  ],
  "correctOptionId": "letter",
  "explanation": "detailed explanation"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Parse the JSON response
      let questionData;
      try {
        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          questionData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse AI response:', text);
        throw new Error('Failed to parse AI response');
      }

      // Store question data in student's assessment record
      const assessmentRef = db.ref(`students/${sanitizedEmail}/courses/${courseId}/Assessments/${assessmentId}`);
      
      await assessmentRef.set({
        ...questionData,
        topic,
        difficulty,
        generatedAt: Date.now(),
        attempts: 0,
        maxAttempts: 999,
        status: 'active',
        generatedBy: 'ai'
      });

      // Store secure data separately
      const secureRef = db.ref(`courses_secure/${courseId}/assessments/${assessmentId}/${sanitizedEmail}`);
      await secureRef.set({
        correctOptionId: questionData.correctOptionId,
        explanation: questionData.explanation,
        generatedAt: Date.now()
      });

      return {
        success: true,
        message: 'Question generated successfully'
      };
    }

    if (operation === 'evaluate') {
      if (!answer) {
        throw new Error('Answer is required for evaluation');
      }

      // Get current assessment data
      const assessmentRef = db.ref(`students/${sanitizedEmail}/courses/${courseId}/Assessments/${assessmentId}`);
      const snapshot = await assessmentRef.once('value');
      const assessmentData = snapshot.val();

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }

      // Get secure data for evaluation
      const secureRef = db.ref(`courses_secure/${courseId}/assessments/${assessmentId}/${sanitizedEmail}`);
      const secureSnapshot = await secureRef.once('value');
      const secureData = secureSnapshot.val();

      if (!secureData) {
        throw new Error('Secure assessment data not found');
      }

      // Evaluate the answer
      const isCorrect = answer === secureData.correctOptionId;
      const feedback = assessmentData.options.find(opt => opt.id === answer)?.feedback || 'No feedback available';

      // Update attempts
      const newAttempts = (assessmentData.attempts || 0) + 1;
      const maxAttempts = assessmentData.maxAttempts || 999;

      // Update assessment data
      await assessmentRef.update({
        attempts: newAttempts,
        lastAttempt: {
          answer,
          isCorrect,
          timestamp: Date.now()
        },
        status: isCorrect ? 'completed' : (newAttempts >= maxAttempts ? 'failed' : 'active'),
        correctOverall: isCorrect
      });

      // Update grade if correct
      if (isCorrect) {
        const gradeRef = db.ref(`students/${sanitizedEmail}/courses/${courseId}/Grades/assessments/${assessmentId}`);
        await gradeRef.set({
          score: 5,
          completedAt: Date.now(),
          attempts: newAttempts
        });
      }

      return {
        success: true,
        result: {
          isCorrect,
          feedback,
          explanation: isCorrect ? secureData.explanation : null,
          attemptsRemaining: Math.max(0, maxAttempts - newAttempts)
        }
      };
    }

    throw new Error('Invalid operation');
  } catch (error) {
    console.error('Error in course3_shared_aiQuestion:', error);
    throw error;
  }
});