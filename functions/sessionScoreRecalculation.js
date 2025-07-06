// Import the necessary v2 modules
const { onValueWritten } = require('firebase-functions/v2/database');
const admin = require('firebase-admin');

// Initialize admin if not already initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

/**
 * Cloud Function: recalculateSessionScores
 * Triggers when a session question's points are updated and recalculates the session's final results
 */
const recalculateSessionScores = onValueWritten({
  ref: '/students/{studentId}/courses/{courseId}/ExamSessions/{sessionId}/finalResults/questionResults/{questionIndex}/points',
  region: 'us-central1',
  memory: '512MiB',
  concurrency: 100
}, async (event) => {
  const { studentId, courseId, sessionId, questionIndex } = event.params;
  const db = admin.database();

  console.log(`Processing score recalculation for student ${studentId}, course ${courseId}, session ${sessionId}, question ${questionIndex}`);

  // Check if the question points were updated (not deleted)
  if (!event.data.after.exists()) {
    console.log(`Question points were deleted - skipping recalculation`);
    return null;
  }

  try {
    // Get the complete session finalResults data
    const finalResultsRef = db.ref(`students/${studentId}/courses/${courseId}/ExamSessions/${sessionId}/finalResults`);
    const finalResultsSnapshot = await finalResultsRef.once('value');
    
    if (!finalResultsSnapshot.exists()) {
      console.error(`No finalResults found for session ${sessionId}`);
      return null;
    }

    const finalResults = finalResultsSnapshot.val();
    const questionResults = finalResults.questionResults || [];

    // Check if manual override mode is active
    if (finalResults.isManualOverrideMode === true) {
      console.log(`Session ${sessionId} is in manual override mode - skipping automatic recalculation of individual question changes`);
      console.log(`Question ${questionIndex} points were updated, but total score remains manually controlled`);
      
      // Optionally update a status field to indicate individual questions were modified during override mode
      await finalResultsRef.update({
        lastQuestionModifiedInOverrideMode: questionIndex,
        lastQuestionModifiedInOverrideModeAt: admin.database.ServerValue.TIMESTAMP,
        status: 'manual_override_with_question_changes'
      });
      
      return null;
    }

    if (questionResults.length === 0) {
      console.error(`No questionResults found for session ${sessionId}`);
      return null;
    }

    // Validate that the updated question exists
    if (!questionResults[questionIndex]) {
      console.error(`Question index ${questionIndex} not found in session ${sessionId}`);
      return null;
    }

    console.log(`Recalculating scores for ${questionResults.length} questions in session ${sessionId}`);

    // Calculate new totals
    let totalScore = 0;
    let totalMaxScore = 0;
    let correctAnswers = 0;

    questionResults.forEach((question, index) => {
      const points = parseFloat(question.points) || 0;
      const maxPoints = parseFloat(question.maxPoints) || 1;
      
      totalScore += points;
      totalMaxScore += maxPoints;
      
      // Count as correct if points equal maxPoints
      if (points === maxPoints) {
        correctAnswers++;
      }

      console.log(`Question ${index}: ${points}/${maxPoints} points`);
    });

    // Calculate percentage
    const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

    console.log(`Calculated totals: ${totalScore}/${totalMaxScore} (${percentage.toFixed(1)}%), ${correctAnswers} correct`);

    // Prepare the updates
    const updates = {
      score: Math.round(totalScore * 10) / 10, // Round to 1 decimal place to avoid floating point precision issues
      maxScore: Math.round(totalMaxScore * 10) / 10, // Round to 1 decimal place to avoid floating point precision issues
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
      correctAnswers: correctAnswers,
      status: 'manually_graded',
      manuallyGradedAt: admin.database.ServerValue.TIMESTAMP,
      lastRecalculatedAt: admin.database.ServerValue.TIMESTAMP
    };

    // Add grader information if available from the original update context
    // Note: We can't directly access who made the update, but we can add a system marker
    updates.lastRecalculatedBy = 'system_auto_recalculation';

    // Perform atomic update of all calculated fields
    await finalResultsRef.update(updates);

    console.log(`Successfully recalculated session scores for ${sessionId}:`, {
      score: `${totalScore}/${totalMaxScore}`,
      percentage: `${percentage.toFixed(1)}%`,
      correctAnswers,
      status: 'manually_graded'
    });

    console.log(`Successfully recalculated session scores for ${sessionId} - no additional updates needed`);

    return null;

  } catch (error) {
    console.error(`Error recalculating session scores for ${sessionId}:`, error);

    // Log the error for monitoring
    await db.ref('errorLogs/sessionScoreRecalculation').push({
      studentId,
      courseId,
      sessionId,
      questionIndex,
      error: error.message,
      stack: error.stack,
      timestamp: admin.database.ServerValue.TIMESTAMP,
    });

    // Don't throw - we don't want to fail the original grade update
    return null;
  }
});

/**
 * Cloud Function: handleManualOverrideModeChange
 * Triggers when isManualOverrideMode changes and recalculates scores when switching back to individual question mode
 */
const handleManualOverrideModeChange = onValueWritten({
  ref: '/students/{studentId}/courses/{courseId}/ExamSessions/{sessionId}/finalResults/isManualOverrideMode',
  region: 'us-central1',
  memory: '512MiB',
  concurrency: 100
}, async (event) => {
  const { studentId, courseId, sessionId } = event.params;
  const db = admin.database();

  console.log(`Processing manual override mode change for student ${studentId}, course ${courseId}, session ${sessionId}`);

  // Check if isManualOverrideMode was set to false (switching back to individual question mode)
  if (!event.data.after.exists()) {
    console.log(`Manual override mode field was deleted - skipping recalculation`);
    return null;
  }

  const newOverrideMode = event.data.after.val();
  const previousOverrideMode = event.data.before.exists() ? event.data.before.val() : null;

  console.log(`Override mode changed from ${previousOverrideMode} to ${newOverrideMode}`);

  // Only recalculate when switching FROM manual override (true) TO individual questions (false)
  if (previousOverrideMode === true && newOverrideMode === false) {
    console.log(`Switching from manual override to individual questions - recalculating scores based on question points`);

    try {
      // Get the complete session finalResults data
      const finalResultsRef = db.ref(`students/${studentId}/courses/${courseId}/ExamSessions/${sessionId}/finalResults`);
      const finalResultsSnapshot = await finalResultsRef.once('value');
      
      if (!finalResultsSnapshot.exists()) {
        console.error(`No finalResults found for session ${sessionId}`);
        return null;
      }

      const finalResults = finalResultsSnapshot.val();
      const questionResults = finalResults.questionResults || [];

      if (questionResults.length === 0) {
        console.error(`No questionResults found for session ${sessionId}`);
        return null;
      }

      console.log(`Recalculating scores for ${questionResults.length} questions in session ${sessionId} after override mode change`);

      // Calculate new totals based on individual question points
      let totalScore = 0;
      let totalMaxScore = 0;
      let correctAnswers = 0;

      questionResults.forEach((question, index) => {
        const points = parseFloat(question.points) || 0;
        const maxPoints = parseFloat(question.maxPoints) || 1;
        
        totalScore += points;
        totalMaxScore += maxPoints;
        
        // Count as correct if points equal maxPoints
        if (points === maxPoints) {
          correctAnswers++;
        }

        console.log(`Question ${index}: ${points}/${maxPoints} points`);
      });

      // Calculate percentage
      const percentage = totalMaxScore > 0 ? (totalScore / totalMaxScore) * 100 : 0;

      console.log(`Calculated totals after override mode change: ${totalScore}/${totalMaxScore} (${percentage.toFixed(1)}%), ${correctAnswers} correct`);

      // Prepare the updates
      const updates = {
        score: Math.round(totalScore * 10) / 10, // Round to 1 decimal place
        maxScore: Math.round(totalMaxScore * 10) / 10, // Round to 1 decimal place
        percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal place
        correctAnswers: correctAnswers,
        status: 'individual_questions_mode',
        switchedToIndividualModeAt: admin.database.ServerValue.TIMESTAMP,
        lastRecalculatedAt: admin.database.ServerValue.TIMESTAMP,
        lastRecalculatedBy: 'system_override_mode_change'
      };

      // Perform atomic update of all calculated fields
      await finalResultsRef.update(updates);

      console.log(`Successfully recalculated session scores after switching to individual mode for ${sessionId}:`, {
        score: `${totalScore}/${totalMaxScore}`,
        percentage: `${percentage.toFixed(1)}%`,
        correctAnswers,
        status: 'individual_questions_mode'
      });

      return null;

    } catch (error) {
      console.error(`Error recalculating session scores after override mode change for ${sessionId}:`, error);

      // Log the error for monitoring
      await db.ref('errorLogs/overrideModeRecalculation').push({
        studentId,
        courseId,
        sessionId,
        error: error.message,
        stack: error.stack,
        timestamp: admin.database.ServerValue.TIMESTAMP,
      });

      // Don't throw - we don't want to fail the original mode change
      return null;
    }

  } else {
    console.log(`No recalculation needed - override mode change was not from manual (true) to individual (false)`);
    return null;
  }
});

// Export the functions
module.exports = {
  recalculateSessionScores,
  handleManualOverrideModeChange
};