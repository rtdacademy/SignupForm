const functions = require('firebase-functions');
const { defineSecret } = require('firebase-functions/params');
const { getFirestore } = require('firebase-admin/firestore');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const geminiApiKey = defineSecret('GEMINI_API_KEY');
const db = getFirestore();

exports.course4_03_time_management_staying_active_aiQuestion = functions
  .runWith({
    secrets: [geminiApiKey],
    timeoutSeconds: 60,
    memory: '1GB'
  })
  .https.onCall(async (data, context) => {
    try {
      const genAI = new GoogleGenerativeAI(geminiApiKey.value());
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Generate a multiple choice question for RTD Academy's COM1255 course lesson on Time Management & Staying Active in Your Course.

Focus on realistic scenarios students might encounter, such as:
- Managing time effectively in asynchronous learning environments
- Understanding RTD Academy's weekly login requirements
- Staying within two lessons of target dates
- Summer student check-in and reflection requirements
- Inactivity lockout procedures and administrative meetings
- Creating effective weekly study plans and schedules
- Progress monitoring and strategy development
- Balancing online learning with other commitments

Create scenarios that test practical application of time management strategies and RTD policies.

Question Types to Choose From:
1. Time management scenario questions (student struggling with consistency, planning conflicts)
2. RTD requirement clarification questions (login frequency, check-in procedures, target date rules)
3. Inactivity policy application questions (lockout timelines, administrative meeting process)
4. Planning and strategy questions (weekly planning, progress tracking, study templates)
5. Problem-solving questions (falling behind, communication strategies, recovery plans)

Requirements:
- Create ONE multiple choice question with 4 options
- Make it realistic and practical for adult online learners
- Focus on RTD Academy-specific requirements and procedures
- Include clear, actionable scenarios that students commonly face
- Avoid trick questions - test genuine understanding of policies and strategies
- Make incorrect options plausible but clearly wrong when you understand the material

Format your response as a JSON object with:
{
  "question": "Your question text here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": 0,
  "explanation": "Brief explanation of why this is correct and what students should remember about time management and activity requirements"
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
        lessonId: '03-time-management-staying-active',
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
        question: "Sarah is a summer student at RTD Academy taking Math 30-1. She's been very busy with work and hasn't logged into her course for 10 days. Today she received an email saying her course access has been locked. What should Sarah do to regain access and stay enrolled?",
        options: [
          "Wait until her work schedule calms down, then log in and continue where she left off",
          "Immediately contact RTD Administration to schedule a meeting within one week and create a plan for resuming progress",
          "Just start logging in daily again - the system will automatically unlock after a few days",
          "Withdraw from the course now to avoid getting a failing grade on her transcript"
        ],
        correctAnswer: 1,
        explanation: "When locked out due to inactivity, students have exactly one week to schedule and attend a meeting with RTD Administration. This meeting is required to create a plan for resuming progress and regaining course access. Waiting or hoping for automatic unlock will result in withdrawal from the course."
      };

      return {
        success: true,
        question: fallbackQuestion
      };
    }
  });
