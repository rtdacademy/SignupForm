const functions = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const db = getFirestore();

exports.course4_02_learning_plans_completion_policies_aiQuestion = functions
  .runWith({
    secrets: [geminiApiKey],
    timeoutSeconds: 60,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Generate a multiple choice question for RTD Academy's COM1255 course lesson on Learning Plans, Course Completion & Diploma Exam Policies.

Focus on realistic scenarios students might encounter, such as:
- Personal learning plan creation challenges
- Course completion timeline management
- Withdrawal decisions and PASI implications
- MyPass registration requirements and responsibilities
- Student inactivity consequences and recovery procedures
- Time management and study planning strategies

Create scenarios that test practical application of policies rather than just memorization.

Question Types to Choose From:
1. Scenario-based questions about student situations (withdrawal decisions, inactivity responses, MyPass issues)
2. Policy application questions (PASI reporting, timeline requirements)
3. Planning and strategy questions (learning plan creation, time management)
4. Responsibility and procedure questions (MyPass management, communication requirements)

Requirements:
- Create ONE multiple choice question with 4 options
- Make it realistic and practical for adult learners
- Focus on RTD Academy-specific policies and procedures
- Include clear, actionable scenarios
- Avoid trick questions - test genuine understanding
- Make incorrect options plausible but clearly wrong when you understand the policy

Format your response as a JSON object with:
{
  "question": "Your question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why this is correct and what students should remember"
}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      
      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse JSON from response');
      }
      
      const questionData = JSON.parse(jsonMatch[0]);
      
      // Store the question in Firestore for future reference
      await db.collection('course_questions').add({
        courseId: '4',
        lessonId: '02-learning-plans-completion-policies',
        question: questionData,
        createdAt: new Date(),
        generatedBy: 'ai'
      });

      return {
        success: true,
        question: questionData
      };

    } catch (error) {
      console.error('Error generating question:', error);
      
      // Fallback question if AI generation fails
      const fallbackQuestion = {
        question: "Emma is enrolled in Math 30-1 and has completed her Section 1 exam with a score of 78%. Due to unexpected family circumstances, she's considering withdrawing from the course. She's also registered for the diploma exam through MyPass. What should Emma know about her situation?",
        options: [
          "She can withdraw cleanly with no grade impact since she hasn't finished the course yet",
          "If she withdraws now, RTD will submit her current grade to PASI, and she must cancel her MyPass registration herself",
          "RTD Academy will automatically cancel her MyPass registration if she withdraws",
          "She should wait to withdraw until after the diploma exam to avoid penalty"
        ],
        correctAnswer: 1,
        explanation: "Since Emma completed Section 1 exam, withdrawing now means RTD will submit her current grade to PASI. Additionally, students are responsible for cancelling their own MyPass registrations - RTD cannot do this for them."
      };

      return {
        success: true,
        question: fallbackQuestion
      };
    }
  });
