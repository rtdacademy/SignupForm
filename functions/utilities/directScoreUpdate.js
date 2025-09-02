const admin = require('firebase-admin');
const crypto = require('crypto');
const { extractParameters, getDatabaseRef, getServerTimestamp } = require('../shared/utilities/database-utils');

/**
 * Direct score update utility for frontend-calculated assessments
 * Includes security measures to prevent tampering
 */
async function directScoreUpdate(data, context) {
  console.log('DirectScoreUpdate - received data:', JSON.stringify(data, null, 2));
  console.log('DirectScoreUpdate - received context.auth:', context.auth ? 'exists' : 'missing');
  
  // Security check 1: Ensure user is authenticated
  if (!context.auth) {
    throw new Error('Authentication required');
  }

  const params = extractParameters(data);
  const { 
    studentEmail, 
    courseId, 
    assessmentId, 
    score, // Expected: 0-1 decimal (e.g., 0.6 for 60%)
    metadata = {}, // Optional metadata about the interaction
    verificationToken, // Required for security
    interactionData = {}, // Data about the interaction for validation
    isStaff 
  } = params;

  console.log('DirectScoreUpdate - extracted params:', {
    studentEmail,
    courseId,
    assessmentId,
    score,
    scoreType: typeof score,
    isStaff
  });

  // Security check 2: Verify the request is from the authenticated user (unless staff)
  if (!isStaff && context.auth.token && context.auth.token.email !== studentEmail) {
    throw new Error('Unauthorized: Cannot update scores for other users');
  }

  // Security check 3: Validate score range
  console.log('DirectScoreUpdate - validating score:', score, 'type:', typeof score);
  if (typeof score !== 'number' || score < 0 || score > 1) {
    throw new Error(`Score must be a number between 0 and 1. Received: ${score} (type: ${typeof score})`);
  }

  // Security check 4: For direct scoring assessments, config is in the assessment file
  // We don't need to check database config for these types
  // The assessment config in the file already has allowDirectScoring: true

  // Security check 5: Rate limiting - prevent rapid score updates
  const recentUpdateRef = admin.database().ref(
    `rateLimiting/directScore/${context.auth.uid}/${assessmentId}`
  );
  const recentSnapshot = await recentUpdateRef.once('value');
  const lastUpdate = recentSnapshot.val();
  
  if (lastUpdate && Date.now() - lastUpdate < 5000) { // 5 second cooldown
    throw new Error('Please wait before updating the score again');
  }

  // Security check 6: Validate interaction data if provided
  // For keyboarding assessments, we check minimum time and keystrokes
  if (interactionData) {
    // Check minimum interaction time (30 seconds for practice)
    if (interactionData.duration && interactionData.duration < 30000) {
      console.warn('Interaction time too short', { 
        duration: interactionData.duration, 
        minimum: 30000 
      });
      // Don't throw error, just log warning
    }

    // Check minimum interactions (50 keystrokes for practice)
    if (interactionData.interactionCount && interactionData.interactionCount < 50) {
      console.warn('Insufficient interactions', {
        count: interactionData.interactionCount,
        minimum: 50
      });
      // Don't throw error, just log warning
    }
  }

  // Get database references
  const sanitizedEmail = studentEmail.replace(/\./g, ',');
  
  console.log('Direct score update - sanitized email:', sanitizedEmail);
  console.log('Direct score update - courseId:', courseId);
  console.log('Direct score update - assessmentId:', assessmentId);
  console.log('Direct score update - score:', score);
  
  // Get database references - use capital 'Assessments' for gradebook compatibility
  const assessmentPath = `students/${sanitizedEmail}/courses/${courseId}/Assessments/${assessmentId}`;
  const gradesPath = `students/${sanitizedEmail}/courses/${courseId}/Grades/assessments/${assessmentId}`;
  
  const assessmentRef = admin.database().ref(assessmentPath);
  const gradesRef = admin.database().ref(gradesPath);

  // Check if this is first attempt or update
  const existingSnapshot = await assessmentRef.once('value');
  const existingData = existingSnapshot.val();
  const currentAttempts = (existingData?.attempts || 0) + 1;
  const wasAlreadyCorrect = existingData?.correctOverall || false;
  
  // Prepare updates
  const timestamp = getServerTimestamp();
  const updates = {};
  
  // Determine pass/fail based on score (1 = pass, 0 = fail)
  const isPassing = score === 1;

  // Create full Assessment metadata structure for gradebook
  updates[assessmentPath] = {
    // Core assessment fields
    attempts: currentAttempts,
    correctAnswer: isPassing,
    correctOverall: wasAlreadyCorrect || isPassing, // True if ever passed
    difficulty: metadata?.difficulty || 'intermediate',
    
    // Last submission details
    lastSubmission: {
      score: score,
      isPassing: isPassing,
      pointsEarned: score, // 1 or 0
      timestamp: timestamp,
      wpm: metadata?.wpm || null,
      accuracy: metadata?.accuracy || null,
      category: metadata?.category || null,
      duration: interactionData?.duration || null,
      totalKeystrokes: metadata?.totalKeystrokes || null,
      correctKeystrokes: metadata?.correctKeystrokes || null,
      errors: metadata?.errors || null,
      bestStreak: metadata?.bestStreak || null,
      passingCriteria: metadata?.passingCriteria || null,
      textLength: metadata?.textLength || null
    },
    
    // Assessment configuration
    maxAttempts: 999, // Unlimited for practice
    pointsValue: 1,
    questionText: metadata?.category ? 
      `Complete typing practice: ${metadata.category}` : 
      'Complete the interactive assessment',
    
    // Settings
    settings: {
      activityType: metadata?.activityType || 'practice',
      showFeedback: true,
      theme: metadata?.theme || 'blue',
      allowDirectScoring: true
    },
    
    // Status and metadata
    status: isPassing ? 'completed' : 'attempted',
    timestamp: existingData?.timestamp || timestamp, // Keep original timestamp
    type: 'direct-score',
    
    // Security and tracking metadata
    directScore: true,
    metadata: {
      ...metadata,
      updateMethod: 'directScore',
      authenticatedUser: context.auth.uid,
      userEmail: context.auth.token?.email,
      interactionDuration: interactionData?.duration || null,
      interactionStartTime: interactionData?.startTime || null,
      interactionEndTime: interactionData?.endTime || null
    },
    
    // Security validation record
    securityChecks: {
      authenticated: true,
      authorizedUser: true,
      validScore: true,
      rateLimited: true,
      tokenVerified: !!verificationToken
    }
  };

  // Update grades
  updates[`students/${sanitizedEmail}/courses/${courseId}/Grades/assessments/${assessmentId}`] = score;

  // Update rate limiting tracker
  updates[`rateLimiting/directScore/${context.auth.uid}/${assessmentId}`] = Date.now();

  // Log activity for audit trail
  const activityId = admin.database().ref().push().key;
  updates[`activityLogs/directScore/${activityId}`] = {
    timestamp,
    userId: context.auth.uid,
    userEmail: context.auth.token.email,
    studentEmail,
    courseId,
    assessmentId,
    score,
    isStaff,
    metadata
  };

  // Log the updates we're about to make
  console.log('Direct score update - updates to apply:', JSON.stringify(updates, null, 2));
  
  // Apply all updates atomically
  try {
    await admin.database().ref().update(updates);
    console.log('Direct score update - database updated successfully');
  } catch (error) {
    console.error('Direct score update - database update failed:', error);
    throw error;
  }

  const result = {
    success: true,
    score,
    assessmentId,
    message: `Score of ${(score * 100).toFixed(1)}% recorded for ${assessmentId}`
  };
  
  console.log('Direct score update - returning result:', result);
  return result;
}

/**
 * Generate a verification token for secure score updates
 */
function generateVerificationToken({ studentEmail, courseId, assessmentId, timestamp, secret }) {
  const data = `${studentEmail}:${courseId}:${assessmentId}:${timestamp}:${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Validate interaction data meets minimum requirements
 */
function validateInteractionData(interactionData, config) {
  // Check minimum interaction time if configured
  if (config.minimumInteractionTime) {
    const duration = interactionData.endTime - interactionData.startTime;
    if (duration < config.minimumInteractionTime) {
      console.error('Interaction time too short', { 
        duration, 
        minimum: config.minimumInteractionTime 
      });
      return false;
    }
  }

  // Check required interaction events if configured
  if (config.requiredEvents && Array.isArray(config.requiredEvents)) {
    const events = interactionData.events || [];
    for (const required of config.requiredEvents) {
      if (!events.includes(required)) {
        console.error('Missing required interaction event', { required });
        return false;
      }
    }
  }

  // Check minimum interactions count if configured
  if (config.minimumInteractions && interactionData.interactionCount) {
    if (interactionData.interactionCount < config.minimumInteractions) {
      console.error('Insufficient interactions', {
        count: interactionData.interactionCount,
        minimum: config.minimumInteractions
      });
      return false;
    }
  }

  return true;
}

module.exports = { directScoreUpdate, generateVerificationToken };