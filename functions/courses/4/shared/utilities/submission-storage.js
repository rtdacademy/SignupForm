/**
 * Cloud Storage Utilities for Assessment Submissions
 * Provides cost-effective storage for detailed submission history
 */

const admin = require('firebase-admin');
const { getServerTimestamp } = require('./database-utils');

/**
 * Formats a timestamp for filename use
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted timestamp (YYYYMMDD_HHMMSS)
 */
function formatTimestampForFilename(timestamp) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

/**
 * Generates a Cloud Storage path for a submission
 * @param {string} courseId - Course identifier
 * @param {string} assessmentId - Assessment identifier  
 * @param {string} studentKey - Sanitized student email
 * @param {number} attemptNumber - Attempt number
 * @param {number} timestamp - Submission timestamp
 * @returns {string} Storage path
 */
function generateSubmissionPath(courseId, assessmentId, studentKey, attemptNumber, timestamp) {
  const formattedTimestamp = formatTimestampForFilename(timestamp);
  return `submissions/${courseId}/${assessmentId}/${studentKey}/attempt_${attemptNumber}_${formattedTimestamp}.json`;
}

/**
 * Stores a comprehensive submission record in Cloud Storage
 * @param {Object} submissionData - Complete submission data
 * @returns {Promise<string>} Storage path where file was saved
 */
async function storeSubmission(submissionData) {
  try {
    const timestamp = submissionData.metadata.timestamp;
    const path = generateSubmissionPath(
      submissionData.metadata.courseId,
      submissionData.metadata.assessmentId,
      submissionData.metadata.studentKey,
      submissionData.metadata.attemptNumber,
      timestamp
    );

    // Get Cloud Storage bucket
    const bucket = admin.storage().bucket();
    const file = bucket.file(path);

    // Convert submission data to JSON string
    const jsonData = JSON.stringify(submissionData, null, 2);

    // Upload to Cloud Storage with metadata
    await file.save(jsonData, {
      metadata: {
        contentType: 'application/json',
        cacheControl: 'private, max-age=0', // Don't cache submission data
        metadata: {
          courseId: submissionData.metadata.courseId,
          assessmentId: submissionData.metadata.assessmentId,
          studentKey: submissionData.metadata.studentKey,
          attemptNumber: submissionData.metadata.attemptNumber.toString(),
          assessmentType: submissionData.metadata.assessmentType,
          createdAt: new Date(timestamp).toISOString()
        }
      }
    });

    console.log(`📁 Stored submission in Cloud Storage: ${path}`);
    return path;
    
  } catch (error) {
    console.error('❌ Error storing submission in Cloud Storage:', error);
    throw new Error(`Failed to store submission: ${error.message}`);
  }
}

/**
 * Retrieves a specific submission from Cloud Storage
 * @param {string} storagePath - Path to the submission file
 * @returns {Promise<Object>} Submission data
 */
async function retrieveSubmission(storagePath) {
  try {
    const bucket = admin.storage().bucket();
    const file = bucket.file(storagePath);

    const [fileContents] = await file.download();
    const submissionData = JSON.parse(fileContents.toString());

    console.log(`📁 Retrieved submission from Cloud Storage: ${storagePath}`);
    return submissionData;
    
  } catch (error) {
    console.error('❌ Error retrieving submission from Cloud Storage:', error);
    throw new Error(`Failed to retrieve submission: ${error.message}`);
  }
}

/**
 * Lists all submissions for a specific student and assessment
 * @param {string} courseId - Course identifier
 * @param {string} assessmentId - Assessment identifier
 * @param {string} studentKey - Sanitized student email
 * @returns {Promise<Array>} Array of submission metadata
 */
async function listStudentSubmissions(courseId, assessmentId, studentKey) {
  try {
    const bucket = admin.storage().bucket();
    const prefix = `submissions/${courseId}/${assessmentId}/${studentKey}/`;

    const [files] = await bucket.getFiles({ prefix });

    const submissions = files.map(file => {
      const metadata = file.metadata;
      return {
        path: file.name,
        attemptNumber: parseInt(metadata.metadata?.attemptNumber || '0'),
        timestamp: metadata.metadata?.createdAt,
        assessmentType: metadata.metadata?.assessmentType,
        size: metadata.size,
        created: metadata.timeCreated
      };
    });

    // Sort by attempt number
    submissions.sort((a, b) => a.attemptNumber - b.attemptNumber);

    console.log(`📁 Found ${submissions.length} submissions for ${studentKey}/${assessmentId}`);
    return submissions;
    
  } catch (error) {
    console.error('❌ Error listing submissions from Cloud Storage:', error);
    throw new Error(`Failed to list submissions: ${error.message}`);
  }
}

/**
 * Creates a comprehensive submission record for Multiple Choice assessments
 * @param {Object} params - Parameters from the assessment
 * @param {Object} questionData - Full question data from database
 * @param {Object} result - Evaluation result
 * @param {number} attemptNumber - Current attempt number
 * @returns {Object} Complete submission record
 */
function createMultipleChoiceSubmissionRecord(params, questionData, result, attemptNumber) {
  const timestamp = Date.now();
  
  return {
    metadata: {
      studentKey: params.studentKey,
      courseId: params.courseId,
      assessmentId: params.assessmentId,
      attemptNumber: attemptNumber,
      timestamp: timestamp,
      assessmentType: 'ai-multiple-choice',
      isStaff: params.isStaff || false
    },
    question: {
      questionText: questionData.questionText,
      options: questionData.options,
      difficulty: questionData.difficulty,
      topic: questionData.topic,
      generatedBy: questionData.generatedBy,
      activityType: questionData.activityType,
      pointsValue: questionData.pointsValue
    },
    submission: {
      answer: params.answer,
      isCorrect: result.isCorrect,
      correctOptionId: result.correctOptionId,
      feedback: result.feedback,
      explanation: result.explanation,
      submissionTime: timestamp
    },
    context: {
      maxAttempts: questionData.maxAttempts,
      attemptsRemaining: questionData.maxAttempts - attemptNumber,
      theme: questionData.settings?.theme,
      showFeedback: questionData.settings?.showFeedback
    }
  };
}

/**
 * Creates a comprehensive submission record for Long Answer assessments
 * @param {Object} params - Parameters from the assessment
 * @param {Object} questionData - Full question data from database
 * @param {Object} evaluation - Full AI evaluation result
 * @param {number} attemptNumber - Current attempt number
 * @param {number} wordCount - Word count of student answer
 * @returns {Object} Complete submission record
 */
function createLongAnswerSubmissionRecord(params, questionData, evaluation, attemptNumber, wordCount) {
  const timestamp = Date.now();
  
  return {
    metadata: {
      studentKey: params.studentKey,
      courseId: params.courseId,
      assessmentId: params.assessmentId,
      attemptNumber: attemptNumber,
      timestamp: timestamp,
      assessmentType: 'ai-long-answer',
      isStaff: params.isStaff || false
    },
    question: {
      questionText: questionData.questionText,
      rubric: questionData.rubric,
      maxPoints: questionData.maxPoints,
      wordLimit: questionData.wordLimit,
      difficulty: questionData.difficulty,
      topic: questionData.topic,
      subject: questionData.subject,
      generatedBy: questionData.generatedBy,
      activityType: questionData.activityType
    },
    submission: {
      answer: params.answer,
      wordCount: wordCount,
      evaluation: evaluation,
      submissionTime: timestamp
    },
    context: {
      maxAttempts: questionData.maxAttempts,
      attemptsRemaining: questionData.maxAttempts - attemptNumber,
      theme: questionData.settings?.theme,
      showRubric: questionData.settings?.showRubric,
      showWordCount: questionData.settings?.showWordCount
    }
  };
}

/**
 * Creates a comprehensive submission record for Short Answer assessments
 * @param {Object} params - Parameters from the assessment
 * @param {Object} questionData - Full question data from database
 * @param {Object} evaluation - Full AI evaluation result
 * @param {number} attemptNumber - Current attempt number
 * @param {number} wordCount - Word count of student answer
 * @returns {Object} Complete submission record
 */
function createShortAnswerSubmissionRecord(params, questionData, evaluation, attemptNumber, wordCount) {
  const timestamp = Date.now();
  
  return {
    metadata: {
      studentKey: params.studentKey,
      courseId: params.courseId,
      assessmentId: params.assessmentId,
      attemptNumber: attemptNumber,
      timestamp: timestamp,
      assessmentType: 'ai-short-answer',
      isStaff: params.isStaff || false
    },
    question: {
      questionText: questionData.questionText,
      expectedAnswer: questionData.expectedAnswer,
      maxPoints: questionData.maxPoints,
      wordLimit: questionData.wordLimit,
      difficulty: questionData.difficulty,
      topic: questionData.topic,
      subject: questionData.subject,
      generatedBy: questionData.generatedBy,
      activityType: questionData.activityType
    },
    submission: {
      answer: params.answer,
      wordCount: wordCount,
      evaluation: evaluation,
      submissionTime: timestamp
    },
    context: {
      maxAttempts: questionData.maxAttempts,
      attemptsRemaining: questionData.maxAttempts - attemptNumber,
      theme: questionData.settings?.theme,
      showHints: questionData.settings?.showHints,
      showWordCount: questionData.settings?.showWordCount
    }
  };
}

/**
 * Cloud Function to retrieve submission history for instructors
 * This is meant to be called by admin/instructor interfaces
 * @param {string} courseId - Course identifier
 * @param {string} assessmentId - Assessment identifier
 * @param {string} studentKey - Sanitized student email (optional, if not provided returns all students)
 * @returns {Promise<Object>} Submission history with metadata
 */
async function getSubmissionHistory(courseId, assessmentId, studentKey = null) {
  try {
    const bucket = admin.storage().bucket();
    let prefix;
    
    if (studentKey) {
      // Get submissions for specific student
      prefix = `submissions/${courseId}/${assessmentId}/${studentKey}/`;
    } else {
      // Get submissions for all students in this assessment
      prefix = `submissions/${courseId}/${assessmentId}/`;
    }

    const [files] = await bucket.getFiles({ prefix });

    const submissions = [];
    
    for (const file of files) {
      try {
        const [fileContents] = await file.download();
        const submissionData = JSON.parse(fileContents.toString());
        
        submissions.push({
          ...submissionData,
          storagePath: file.name,
          fileSize: file.metadata.size,
          created: file.metadata.timeCreated
        });
      } catch (parseError) {
        console.warn(`⚠️ Failed to parse submission file ${file.name}:`, parseError.message);
      }
    }

    // Sort by student, then by attempt number
    submissions.sort((a, b) => {
      const studentCompare = a.metadata.studentKey.localeCompare(b.metadata.studentKey);
      if (studentCompare !== 0) return studentCompare;
      return a.metadata.attemptNumber - b.metadata.attemptNumber;
    });

    console.log(`📁 Retrieved ${submissions.length} submissions for ${courseId}/${assessmentId}${studentKey ? `/${studentKey}` : ''}`);
    
    return {
      courseId,
      assessmentId,
      studentKey,
      totalSubmissions: submissions.length,
      submissions
    };
    
  } catch (error) {
    console.error('❌ Error retrieving submission history:', error);
    throw new Error(`Failed to retrieve submission history: ${error.message}`);
  }
}

/**
 * Generates a summary of submissions for an assessment (for instructor dashboard)
 * @param {string} courseId - Course identifier
 * @param {string} assessmentId - Assessment identifier
 * @returns {Promise<Object>} Summary statistics
 */
async function getSubmissionSummary(courseId, assessmentId) {
  try {
    const history = await getSubmissionHistory(courseId, assessmentId);
    
    const studentStats = {};
    let totalAttempts = 0;
    let completedCount = 0;
    
    history.submissions.forEach(submission => {
      const studentKey = submission.metadata.studentKey;
      
      if (!studentStats[studentKey]) {
        studentStats[studentKey] = {
          studentKey,
          attempts: 0,
          completed: false,
          bestScore: 0,
          lastAttempt: 0
        };
      }
      
      const stats = studentStats[studentKey];
      stats.attempts++;
      totalAttempts++;
      stats.lastAttempt = Math.max(stats.lastAttempt, submission.metadata.timestamp);
      
      // Handle different assessment types
      if (submission.metadata.assessmentType === 'ai-multiple-choice') {
        if (submission.submission.isCorrect) {
          stats.completed = true;
          stats.bestScore = Math.max(stats.bestScore, submission.question.pointsValue || 0);
        }
      } else if (submission.metadata.assessmentType === 'ai-long-answer') {
        const percentage = submission.submission.evaluation.percentage || 0;
        stats.bestScore = Math.max(stats.bestScore, percentage);
        if (percentage >= 70) {
          stats.completed = true;
        }
      } else if (submission.metadata.assessmentType === 'ai-short-answer') {
        if (submission.submission.evaluation.isCorrect) {
          stats.completed = true;
          stats.bestScore = Math.max(stats.bestScore, submission.submission.evaluation.score || 0);
        }
      }
    });
    
    completedCount = Object.values(studentStats).filter(s => s.completed).length;
    
    return {
      courseId,
      assessmentId,
      totalStudents: Object.keys(studentStats).length,
      totalAttempts,
      completedCount,
      completionRate: completedCount / Object.keys(studentStats).length,
      studentStats: Object.values(studentStats),
      generated: Date.now()
    };
    
  } catch (error) {
    console.error('❌ Error generating submission summary:', error);
    throw new Error(`Failed to generate submission summary: ${error.message}`);
  }
}

module.exports = {
  storeSubmission,
  retrieveSubmission,
  listStudentSubmissions,
  createMultipleChoiceSubmissionRecord,
  createLongAnswerSubmissionRecord,
  createShortAnswerSubmissionRecord,
  generateSubmissionPath,
  getSubmissionHistory,
  getSubmissionSummary
};