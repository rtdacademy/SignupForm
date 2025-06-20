/**
 * Exam Session Manager
 * 
 * Cloud functions for managing exam sessions:
 * - startExamSession: Initialize a new exam session
 * - saveExamAnswer: Save an answer during exam (no feedback)
 * - submitExamSession: Complete exam and grade all questions
 * - getExamSession: Retrieve exam session data
 */

const admin = require('firebase-admin');
const { onCall } = require('firebase-functions/v2/https');
const { sanitizeEmail } = require('./utils');
const { getServerTimestamp, updateGradebookItem, getCourseConfig } = require('./shared/utilities/database-utils');

/**
 * Start a new exam session
 */
exports.startExamSession = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    console.log('🎯 Starting exam session:', data);
    
    // Extract parameters directly from data
    const actualData = data.data || data;
    const {
      courseId,
      examItemId,
      questions = [],
      timeLimit = null,
      studentEmail: dataStudentEmail,
      userId: dataUserId
    } = actualData;

    // Get authentication info
    const studentEmail = dataStudentEmail || context.auth?.token?.email;
    const userId = dataUserId || context.auth?.uid;
    
    if (!studentEmail) {
      throw new Error('Student email is required');
    }

    // Sanitize email for database key
    const studentKey = sanitizeEmail(studentEmail);
    const isStaff = studentEmail.includes('@rtdacademy.com');

    if (!courseId || !examItemId || !questions.length) {
      throw new Error('Missing required parameters: courseId, examItemId, or questions');
    }

    // Generate unique session ID
    const sessionId = `exam_${examItemId}_${studentKey}_${Date.now()}`;
    
    // Get course config to validate exam settings
    const courseConfig = await getCourseConfig(courseId);
    const examConfig = courseConfig?.activityTypes?.exam || {};
    
    // Ensure questions is an array of objects with at least questionId
    const normalizedQuestions = questions.map(q => {
      if (typeof q === 'string') {
        return { questionId: q };
      }
      return q;
    });
    
    // Create exam session
    const sessionData = {
      sessionId: sessionId,
      examItemId: examItemId,
      courseId: courseId,
      studentEmail: studentEmail,
      status: 'in_progress',
      startTime: getServerTimestamp(),
      endTime: null,
      timeLimit: timeLimit,
      questions: normalizedQuestions,
      responses: {},
      questionsCompleted: 0,
      totalQuestions: normalizedQuestions.length,
      results: null,
      createdAt: getServerTimestamp(),
      
      // Exam configuration
      maxAttempts: examConfig.maxAttempts || 1,
      showDetailedFeedback: examConfig.showDetailedFeedback !== false, // Show after completion
      enableHints: examConfig.enableHints || false,
      theme: examConfig.theme || 'red'
    };

    // Save session to database
    const basePath = isStaff ? 'staff_testing' : 'students';
    const sessionPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions/${sessionId}`;
    
    await admin.database().ref(sessionPath).set(sessionData);
    
    // Also create assessment entries for each question (as placeholders)
    console.log('Questions array received:', JSON.stringify(questions, null, 2));
    
    const assessmentPromises = questions.map(async (question) => {
      // Handle both string questionId and object with questionId property
      const questionId = typeof question === 'string' ? question : question.questionId;
      
      if (!questionId) {
        console.error('Invalid question object:', question);
        throw new Error('Question ID is missing');
      }
      
      const assessmentPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${questionId}`;
      const assessmentRef = admin.database().ref(assessmentPath);
      
      // Check if assessment already exists
      const snapshot = await assessmentRef.once('value');
      if (!snapshot.exists()) {
        // Create placeholder assessment
        await assessmentRef.set({
          activityType: 'exam',
          status: 'exam_in_progress',
          examSessionId: sessionId,
          attempts: 0,
          timestamp: getServerTimestamp(),
          settings: {
            theme: 'red',
            showFeedback: false, // No feedback during exam
            enableHints: false
          }
        });
      }
    });
    
    await Promise.all(assessmentPromises);
    
    console.log(`✅ Exam session started: ${sessionId} with ${questions.length} questions`);
    
    return {
      success: true,
      session: sessionData
    };
    
  } catch (error) {
    console.error('❌ Error starting exam session:', error);
    throw new Error(`Failed to start exam session: ${error.message}`);
  }
});

/**
 * Save an answer during exam (no immediate feedback)
 */
exports.saveExamAnswer = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // Extract parameters directly from data
    const actualData = data.data || data;
    const {
      courseId,
      assessmentId,
      answer,
      examSessionId,
      studentEmail: dataStudentEmail
    } = actualData;

    // Get authentication info
    const studentEmail = dataStudentEmail || context.auth?.token?.email;
    
    if (!studentEmail) {
      throw new Error('Student email is required');
    }

    // Sanitize email for database key
    const studentKey = sanitizeEmail(studentEmail);
    const isStaff = studentEmail.includes('@rtdacademy.com');

    if (!examSessionId || !answer) {
      throw new Error('Missing required parameters: examSessionId or answer');
    }

    console.log(`💾 Saving exam answer: ${assessmentId} = ${answer} (Session: ${examSessionId})`);
    
    // Update exam session with the response
    const basePath = isStaff ? 'staff_testing' : 'students';
    const sessionPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions/${examSessionId}`;
    const sessionRef = admin.database().ref(sessionPath);
    
    // Get current session data
    const sessionSnapshot = await sessionRef.once('value');
    const sessionData = sessionSnapshot.val();
    
    if (!sessionData) {
      throw new Error('Exam session not found');
    }
    
    if (sessionData.status !== 'in_progress') {
      throw new Error('Exam session is not active');
    }
    
    // Update responses
    const responses = sessionData.responses || {};
    const wasNewAnswer = !responses[assessmentId];
    responses[assessmentId] = answer;
    
    // Update session
    const updates = {
      responses: responses,
      questionsCompleted: Object.keys(responses).length,
      lastUpdated: getServerTimestamp()
    };
    
    await sessionRef.update(updates);
    
    console.log(`✅ Exam answer saved: ${assessmentId} = ${answer}`);
    
    return {
      success: true,
      sessionId: examSessionId,
      questionId: assessmentId,
      answer: answer,
      questionsCompleted: updates.questionsCompleted,
      totalQuestions: sessionData.totalQuestions
    };
    
  } catch (error) {
    console.error('❌ Error saving exam answer:', error);
    throw new Error(`Failed to save exam answer: ${error.message}`);
  }
});

/**
 * Submit exam session and grade all questions
 */
exports.submitExamSession = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // Extract parameters directly from data
    const actualData = data.data || data;
    const {
      courseId,
      sessionId,
      responses = {},
      studentEmail: dataStudentEmail,
      autoSubmit = false
    } = actualData;

    // Get authentication info
    const studentEmail = dataStudentEmail || context.auth?.token?.email;
    
    if (!studentEmail) {
      throw new Error('Student email is required');
    }

    // Sanitize email for database key
    const studentKey = sanitizeEmail(studentEmail);
    const isStaff = studentEmail.includes('@rtdacademy.com');

    if (!sessionId) {
      throw new Error('Missing required parameter: sessionId');
    }

    console.log(`🎯 Submitting exam session: ${sessionId} (Auto: ${autoSubmit})`);
    
    const basePath = isStaff ? 'staff_testing' : 'students';
    const sessionPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions/${sessionId}`;
    const sessionRef = admin.database().ref(sessionPath);
    
    // Get session data
    const sessionSnapshot = await sessionRef.once('value');
    const sessionData = sessionSnapshot.val();
    
    if (!sessionData) {
      throw new Error('Exam session not found');
    }
    
    if (sessionData.status !== 'in_progress') {
      throw new Error('Exam session is not active');
    }
    
    // Use provided responses or session responses
    const finalResponses = Object.keys(responses).length > 0 ? responses : sessionData.responses || {};
    
    console.log(`📝 Grading ${Object.keys(finalResponses).length} responses`);
    
    // Grade each question
    const gradingPromises = sessionData.questions.map(async (question) => {
      // Handle both string questionId and object with questionId property
      const questionId = typeof question === 'string' ? question : question.questionId;
      
      if (!questionId) {
        console.error('Invalid question in grading:', question);
        throw new Error('Question ID is missing during grading');
      }
      
      const studentAnswer = finalResponses[questionId];
      
      try {
        // Get the assessment cloud function for this question
        const assessmentFunction = admin.functions().httpsCallable(questionId);
        
        // Evaluate the answer
        const result = await assessmentFunction({
          courseId: courseId,
          assessmentId: questionId,
          operation: 'evaluate',
          answer: studentAnswer || '', // Empty string if not answered
          studentEmail: studentEmail,
          examMode: true, // Special flag for exam mode
          examSessionId: sessionId
        });
        
        const questionResult = result.data?.result || {};
        
        // Update gradebook with the result
        await updateGradebookItem(
          studentKey,
          courseId,
          questionId,
          questionResult.isCorrect ? (questionResult.maxScore || 1) : 0,
          {
            title: questionResult.title || questionId,
            type: 'exam',
            maxScore: questionResult.maxScore || 1,
            courseStructureItemId: sessionData.examItemId
          },
          isStaff
        );
        
        return {
          questionId: questionId,
          questionText: questionResult.questionText || '',
          studentAnswer: studentAnswer || 'No answer',
          correctAnswer: questionResult.correctAnswer || '',
          isCorrect: questionResult.isCorrect || false,
          feedback: questionResult.feedback || '',
          points: questionResult.isCorrect ? (questionResult.maxScore || 1) : 0,
          maxPoints: questionResult.maxScore || 1
        };
        
      } catch (error) {
        console.error(`Error grading question ${questionId}:`, error);
        return {
          questionId: questionId,
          questionText: 'Question could not be loaded',
          studentAnswer: studentAnswer || 'No answer',
          correctAnswer: 'Unknown',
          isCorrect: false,
          feedback: 'This question could not be graded due to a technical error.',
          points: 0,
          maxPoints: 1
        };
      }
    });
    
    const questionResults = await Promise.all(gradingPromises);
    
    // Calculate overall results
    const totalPoints = questionResults.reduce((sum, q) => sum + q.points, 0);
    const maxPoints = questionResults.reduce((sum, q) => sum + q.maxPoints, 0);
    const correctAnswers = questionResults.filter(q => q.isCorrect).length;
    const percentage = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0;
    
    // Create results object
    const examResults = {
      score: totalPoints,
      maxScore: maxPoints,
      percentage: percentage,
      correctAnswers: correctAnswers,
      totalQuestions: sessionData.questions.length,
      questionResults: questionResults,
      completedAt: getServerTimestamp(),
      autoSubmit: autoSubmit
    };
    
    // Update session with results
    await sessionRef.update({
      status: 'completed',
      endTime: getServerTimestamp(),
      responses: finalResponses,
      results: examResults,
      completedAt: getServerTimestamp()
    });
    
    console.log(`✅ Exam graded: ${totalPoints}/${maxPoints} (${percentage}%) - ${correctAnswers}/${sessionData.questions.length} correct`);
    
    return {
      success: true,
      sessionId: sessionId,
      results: examResults
    };
    
  } catch (error) {
    console.error('❌ Error submitting exam session:', error);
    throw new Error(`Failed to submit exam session: ${error.message}`);
  }
});

/**
 * Get exam session data
 */
exports.getExamSession = onCall({
  region: 'us-central1',
  memory: '256MiB',
  timeoutSeconds: 60,
  cors: ["https://yourway.rtdacademy.com", "https://*.rtdacademy.com", "http://localhost:3000"]
}, async (data, context) => {
  try {
    // Extract parameters directly from data
    const actualData = data.data || data;
    const {
      courseId,
      sessionId,
      studentEmail: dataStudentEmail
    } = actualData;

    // Get authentication info
    const studentEmail = dataStudentEmail || context.auth?.token?.email;
    
    if (!studentEmail) {
      throw new Error('Student email is required');
    }

    // Sanitize email for database key
    const studentKey = sanitizeEmail(studentEmail);
    const isStaff = studentEmail.includes('@rtdacademy.com');

    if (!sessionId) {
      throw new Error('Missing required parameter: sessionId');
    }
    
    const basePath = isStaff ? 'staff_testing' : 'students';
    const sessionPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions/${sessionId}`;
    
    const snapshot = await admin.database().ref(sessionPath).once('value');
    const sessionData = snapshot.val();
    
    if (!sessionData) {
      throw new Error('Exam session not found');
    }
    
    return {
      success: true,
      session: sessionData
    };
    
  } catch (error) {
    console.error('❌ Error getting exam session:', error);
    throw new Error(`Failed to get exam session: ${error.message}`);
  }
});