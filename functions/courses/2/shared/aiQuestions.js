/**
 * Shared AI Question Handler
 * Course: 2
 * 
 * This is a shared cloud function that can be used by any lesson
 * that needs AI-generated questions without creating lesson-specific functions.
 * 
 * Function name: course2_shared_aiQuestion
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { genkit } = require('genkit/beta');
const { googleAI } = require('@genkit-ai/googleai');
const { z } = require('zod');
const { sanitizeEmail } = require('../../../utils.js');

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Genkit
const ai = genkit({
  plugins: [googleAI()],
  model: googleAI.model('gemini-2.0-flash'),
});

// Zod schemas for structured output
const AnswerOptionSchema = z.object({
  id: z.enum(['a', 'b', 'c', 'd']),
  text: z.string(),
  feedback: z.string(),
});

const AIQuestionSchema = z.object({
  questionText: z.string(),
  options: z.array(AnswerOptionSchema).length(4),
  correctOptionId: z.enum(['a', 'b', 'c', 'd']),
  explanation: z.string(),
});

// Topic prompts for your course
const TOPIC_PROMPTS = {
  course_introduction: {
    beginner: "Create a basic multiple-choice question about getting started with this course.",
    intermediate: "Create a question about how course components work together.",
    advanced: "Create a complex question about course objectives and outcomes."
  },
  core_concepts_application: {
    beginner: "Create a question about basic application of core concepts.",
    intermediate: "Create a question requiring analysis of how concepts interact.",
    advanced: "Create a question about complex real-world applications."
  }
  // Add more topics as needed
};

// Fallback questions
const FALLBACK_QUESTIONS = {
  course_introduction: {
    questionText: "What is the primary purpose of this introductory lesson?",
    options: [
      { id: "a", text: "To test your existing knowledge", feedback: "The introduction focuses on orientation, not testing." },
      { id: "b", text: "To provide an overview of the course", feedback: "Correct! The introduction gives you a roadmap for the course." },
      { id: "c", text: "To assign homework", feedback: "Assignments come in later lessons." },
      { id: "d", text: "To grade your performance", feedback: "Grading happens through assessments, not the introduction." }
    ],
    correctOptionId: "b",
    explanation: "Introductory lessons are designed to orient students and provide an overview of what they'll learn."
  }
};

// Main function handler
exports.course2_shared_aiQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '512MiB',
}, async (data, context) => {
  const { 
    courseId, 
    assessmentId, 
    operation, 
    answer, 
    topic = 'course_introduction',
    difficulty = 'intermediate' 
  } = data.data || {};
  
  // Get student key
  const studentKey = data.data?.studentEmail ? sanitizeEmail(data.data.studentEmail) : 
                    context.auth?.token?.email ? sanitizeEmail(context.auth.token.email) : 
                    'test-student';

  const assessmentRef = admin.database()
    .ref(`students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`);

  if (operation === 'generate') {
    try {
      let question;
      
      // Try to generate with AI if API key is available
      if (GEMINI_API_KEY) {
        const prompts = TOPIC_PROMPTS[topic] || TOPIC_PROMPTS.course_introduction;
        const prompt = prompts[difficulty] || prompts.intermediate;
        
        try {
          const { output } = await ai.generate({
            model: googleAI.model('gemini-2.0-flash'),
            prompt: `${prompt}\n\nGenerate a multiple-choice question with 4 options (a, b, c, d), one correct answer, and feedback for each option.`,
            output: { schema: AIQuestionSchema },
            config: { temperature: 0.7, topP: 0.8 }
          });
          
          question = output;
        } catch (err) {
          console.log("AI generation failed, using fallback");
          question = FALLBACK_QUESTIONS[topic] || FALLBACK_QUESTIONS.course_introduction;
        }
      } else {
        // No API key, use fallback
        question = FALLBACK_QUESTIONS[topic] || FALLBACK_QUESTIONS.course_introduction;
      }
      
      // Shuffle options
      const shuffledOptions = [...question.options].sort(() => Math.random() - 0.5);
      
      // Save question data
      await assessmentRef.set({
        timestamp: admin.database.ServerValue.TIMESTAMP,
        questionText: question.questionText,
        options: shuffledOptions.map(opt => ({ id: opt.id, text: opt.text })),
        topic,
        difficulty,
        attempts: 0,
        maxAttempts: 5,
        pointsValue: 10,
        status: 'active'
      });
      
      // Save secure data
      await admin.database()
        .ref(`courses_secure/${courseId}/assessments/${assessmentId}`)
        .set({
          correctOptionId: question.correctOptionId,
          explanation: question.explanation,
          optionFeedback: question.options.reduce((obj, opt) => {
            obj[opt.id] = opt.feedback;
            return obj;
          }, {})
        });
      
      return { success: true, questionGenerated: true };
      
    } catch (error) {
      console.error("Error generating question:", error);
      throw new Error('Failed to generate question');
    }
  }
  
  if (operation === 'evaluate') {
    const assessmentData = (await assessmentRef.once('value')).val();
    const secureData = (await admin.database()
      .ref(`courses_secure/${courseId}/assessments/${assessmentId}`)
      .once('value')).val();
    
    if (!assessmentData || !secureData) {
      throw new Error('Assessment not found');
    }
    
    const isCorrect = answer === secureData.correctOptionId;
    const attempts = (assessmentData.attempts || 0) + 1;
    const feedback = secureData.optionFeedback?.[answer] || 
                    (isCorrect ? 'Correct!' : 'Incorrect.');
    
    await assessmentRef.update({
      attempts,
      lastSubmission: {
        answer,
        isCorrect,
        feedback,
        timestamp: admin.database.ServerValue.TIMESTAMP
      },
      status: isCorrect ? 'completed' : 
              attempts >= assessmentData.maxAttempts ? 'failed' : 'attempted'
    });
    
    return {
      success: true,
      result: {
        isCorrect,
        feedback,
        correctOptionId: isCorrect ? answer : undefined,
        explanation: isCorrect || attempts >= assessmentData.maxAttempts ? 
                    secureData.explanation : undefined,
        attemptsRemaining: Math.max(0, assessmentData.maxAttempts - attempts)
      }
    };
  }
  
  throw new Error('Invalid operation');
});