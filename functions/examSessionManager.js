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
    
    // Check for existing sessions and validate attempt limits
    const basePath = isStaff ? 'staff_testing' : 'students';
    const sessionsPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions`;
    
    const sessionsSnapshot = await admin.database().ref(sessionsPath).once('value');
    const allSessions = sessionsSnapshot.val() || {};
    
    // Filter sessions for this specific exam
    const examSessions = Object.values(allSessions).filter(session => 
      session.examItemId === examItemId
    );
    
    // Check for active session
    const activeSession = examSessions.find(session => session.status === 'in_progress');
    if (activeSession) {
      throw new Error(`An active exam session already exists for this exam. Session ID: ${activeSession.sessionId}`);
    }
    
    // Check attempt limits
    const completedSessions = examSessions.filter(session => session.status === 'completed');
    const maxAttempts = examConfig.maxAttempts || 1;
    const attemptsUsed = completedSessions.length;
    
    if (attemptsUsed >= maxAttempts) {
      throw new Error(`Maximum attempts (${maxAttempts}) reached for this exam. No more attempts allowed.`);
    }
    
    const attemptNumber = attemptsUsed + 1;
    console.log(`🎯 Starting attempt ${attemptNumber}/${maxAttempts} for exam ${examItemId}`);
    
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
      
      // Attempt tracking
      attemptNumber: attemptNumber,
      maxAttempts: examConfig.maxAttempts || 1,
      previousAttempts: completedSessions.length,
      
      // Exam configuration
      showDetailedFeedback: examConfig.showDetailedFeedback !== false, // Show after completion
      enableHints: examConfig.enableHints || false,
      theme: examConfig.theme || 'red'
    };

    // Save session to database
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
      // No evaluation data - answers will be evaluated at exam submission
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
    
    // Update responses (answers only - no evaluation)
    const responses = sessionData.responses || {};
    const wasNewAnswer = !responses[assessmentId];
    responses[assessmentId] = answer;
    
    // Update session with answer only
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
    
    console.log(`📝 Evaluating ${Object.keys(finalResponses).length} responses in real-time`);
    
    // Read question results from database (questions will be evaluated in parallel by client)
    console.log(`📝 Reading evaluation results from database for ${sessionData.questions.length} questions`);
    
    const questionResults = await Promise.all(sessionData.questions.map(async (question) => {
      // Handle both string questionId and object with questionId property
      const questionId = typeof question === 'string' ? question : question.questionId;
      
      if (!questionId) {
        console.error('Invalid question in grading:', question);
        return {
          questionId: 'unknown',
          questionText: 'Invalid question',
          studentAnswer: 'No answer',
          correctAnswer: 'Unknown',
          isCorrect: false,
          feedback: 'This question could not be processed.',
          points: 0,
          maxPoints: 1
        };
      }
      
      const studentAnswer = finalResponses[questionId];
      
      try {
        // Read the evaluation result from the student's assessment data
        const assessmentPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${questionId}`;
        const assessmentSnapshot = await admin.database().ref(assessmentPath).once('value');
        const assessmentData = assessmentSnapshot.val();
        
        if (assessmentData && assessmentData.lastSubmission) {
          const submission = assessmentData.lastSubmission;
          console.log(`✅ Found evaluation result for ${questionId}: ${submission.isCorrect ? 'Correct' : 'Incorrect'}`);
          
          return {
            questionId: questionId,
            questionText: question.title || questionId,
            studentAnswer: studentAnswer || 'No answer',
            correctAnswer: submission.correctOptionId || 'Unknown',
            isCorrect: submission.isCorrect || false,
            feedback: submission.feedback || '',
            points: submission.isCorrect ? (question.points || 1) : 0,
            maxPoints: question.points || 1
          };
        } else {
          // No evaluation found - question was not answered or not evaluated
          console.warn(`⚠️ No evaluation result found for ${questionId}`);
          return {
            questionId: questionId,
            questionText: question.title || questionId,
            studentAnswer: studentAnswer || 'No answer',
            correctAnswer: 'Unknown',
            isCorrect: false,
            feedback: studentAnswer ? 'This question could not be graded due to a technical error.' : 'No answer provided.',
            points: 0,
            maxPoints: question.points || 1
          };
        }
        
      } catch (error) {
        console.error(`❌ Error reading evaluation result for ${questionId}:`, error);
        return {
          questionId: questionId,
          questionText: question.title || questionId,
          studentAnswer: studentAnswer || 'No answer',
          correctAnswer: 'Unknown',
          isCorrect: false,
          feedback: 'This question could not be graded due to a technical error.',
          points: 0,
          maxPoints: question.points || 1
        };
      }
    }));
    
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
      finalResults: examResults, // Store final compiled results separately from individual question results
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
 * Exit/Cancel exam session (without grading)
 */
exports.exitExamSession = onCall({
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

    console.log(`🚪 Exiting exam session: ${sessionId}`);
    
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
      console.log(`Session ${sessionId} is already ${sessionData.status}`);
      return {
        success: true,
        sessionId: sessionId,
        status: sessionData.status
      };
    }
    
    // Update session status to exited
    await sessionRef.update({
      status: 'exited',
      endTime: getServerTimestamp(),
      exitedAt: getServerTimestamp(),
      lastUpdated: getServerTimestamp()
    });
    
    // Clean up any placeholder assessments that were created
    const assessmentCleanupPromises = sessionData.questions.map(async (question) => {
      const questionId = typeof question === 'string' ? question : question.questionId;
      
      if (!questionId) return;
      
      const assessmentPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${questionId}`;
      const assessmentRef = admin.database().ref(assessmentPath);
      
      // Check if this is an exam placeholder
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();
      
      if (assessmentData && assessmentData.status === 'exam_in_progress' && assessmentData.examSessionId === sessionId) {
        // Remove the placeholder assessment
        await assessmentRef.remove();
        console.log(`🗑️ Cleaned up placeholder assessment: ${questionId}`);
      }
    });
    
    await Promise.all(assessmentCleanupPromises);
    
    console.log(`✅ Exam session exited: ${sessionId}`);
    
    return {
      success: true,
      sessionId: sessionId,
      status: 'exited',
      message: 'Exam session has been exited successfully'
    };
    
  } catch (error) {
    console.error('❌ Error exiting exam session:', error);
    throw new Error(`Failed to exit exam session: ${error.message}`);
  }
});

/**
 * Detect active or available exam sessions for a student
 */
exports.detectActiveExamSession = onCall({
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
      examItemId,
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

    if (!courseId || !examItemId) {
      throw new Error('Missing required parameters: courseId or examItemId');
    }

    console.log(`🔍 Detecting exam sessions for ${examItemId} in course ${courseId}`);
    
    const basePath = isStaff ? 'staff_testing' : 'students';
    const sessionsPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions`;
    
    // Get all exam sessions for this student/course
    const sessionsSnapshot = await admin.database().ref(sessionsPath).once('value');
    const allSessions = sessionsSnapshot.val() || {};
    
    // Filter sessions for this specific exam
    const examSessions = Object.values(allSessions).filter(session => 
      session.examItemId === examItemId
    );
    
    // Sort by creation time (newest first)
    examSessions.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    
    // Find active session (in_progress)
    const activeSession = examSessions.find(session => session.status === 'in_progress');
    
    // Find completed sessions
    const completedSessions = examSessions.filter(session => session.status === 'completed');
    
    // Get course config to check attempt limits
    const courseConfig = await getCourseConfig(courseId);
    const examConfig = courseConfig?.activityTypes?.exam || {};
    const maxAttempts = examConfig.maxAttempts || 1;
    
    // Calculate attempts used (completed + active sessions)
    const attemptsUsed = completedSessions.length + (activeSession ? 1 : 0);
    const attemptsRemaining = Math.max(0, maxAttempts - attemptsUsed);
    
    console.log(`📊 Exam session summary: ${attemptsUsed}/${maxAttempts} attempts used, ${attemptsRemaining} remaining`);
    
    return {
      success: true,
      activeSession: activeSession || null,
      completedSessions: completedSessions,
      allExamSessions: examSessions,
      attemptsSummary: {
        maxAttempts: maxAttempts,
        attemptsUsed: attemptsUsed,
        attemptsRemaining: attemptsRemaining,
        canStartNewAttempt: attemptsRemaining > 0 && !activeSession
      }
    };
    
  } catch (error) {
    console.error('❌ Error detecting exam sessions:', error);
    throw new Error(`Failed to detect exam sessions: ${error.message}`);
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