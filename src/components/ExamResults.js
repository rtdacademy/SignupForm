import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';  
import { getDatabase, ref, get } from 'firebase/database';
import { sanitizeEmail } from '../utils/sanitizeEmail';

const ExamResults = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sessionData, setSessionData] = useState(null);
  const [detailedQuestions, setDetailedQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      if (!user?.email || !sessionId) {
        setError('Missing user email or session ID');
        setLoading(false);
        return;
      }

      try {
        const database = getDatabase();
        const studentKey = sanitizeEmail(user.email);
        const isStaff = user.email.includes('@rtdacademy.com');
        const basePath = isStaff ? 'staff_testing' : 'students';
        
        // We need to search through all courses since we don't know the courseId from sessionId alone
        // First, let's extract the courseId from the session data structure
        // Session ID format: exam_${itemId}_${studentKey}_${timestamp}
        // We'll need to search through courses to find the session
        
        // Try to get session from different possible course paths
        // For now, let's try course 2 (most common) and expand if needed
        const possibleCourseIds = ['2', '1', '3', '4', '5'];
        let foundSessionData = null;
        let foundCourseId = null;

        for (const courseId of possibleCourseIds) {
          const sessionPath = `${basePath}/${studentKey}/courses/${courseId}/ExamSessions/${sessionId}`;
          const sessionRef = ref(database, sessionPath);
          const snapshot = await get(sessionRef);
          
          if (snapshot.exists()) {
            foundSessionData = snapshot.val();
            foundCourseId = courseId;
            break;
          }
        }

        if (!foundSessionData) {
          throw new Error('Exam session not found');
        }

        // Add courseId to session data for navigation
        foundSessionData.courseId = foundCourseId;
        setSessionData(foundSessionData);

        // Fetch detailed question information for each question
        if (foundSessionData.finalResults?.questionResults) {
          const questionDetails = {};
          
          const detailPromises = foundSessionData.finalResults.questionResults.map(async (questionResult) => {
            try {
              const assessmentPath = `${basePath}/${studentKey}/courses/${foundCourseId}/Assessments/${questionResult.questionId}`;
              const assessmentRef = ref(database, assessmentPath);
              const assessmentSnapshot = await get(assessmentRef);
              
              if (assessmentSnapshot.exists()) {
                questionDetails[questionResult.questionId] = assessmentSnapshot.val();
              }
            } catch (err) {
              console.warn(`Failed to fetch details for question ${questionResult.questionId}:`, err);
            }
          });
          
          await Promise.all(detailPromises);
          setDetailedQuestions(questionDetails);
        }
        
      } catch (err) {
        console.error('Error fetching session data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionData();
  }, [user, sessionId]);

  const handleBackToCourse = () => {
    if (sessionData) {
      // Navigate back to the course dashboard with page refresh
      const returnUrl = `/dashboard?courseId=${sessionData.courseId}&view=course&courseType=firebase&lesson=${sessionData.examItemId}`;
      window.location.href = returnUrl;
    } else {
      // Fallback to dashboard
      window.location.href = '/dashboard';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading exam results...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Unable to Load Results</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!sessionData || !sessionData.finalResults) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-yellow-500 text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Results Not Available</h2>
          <p className="text-gray-600 mb-4">The exam results are not yet available or this session is incomplete.</p>
          <button
            onClick={handleBackToCourse}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Course
          </button>
        </div>
      </div>
    );
  }

  const { finalResults } = sessionData;
  const { score, maxScore, percentage, correctAnswers, totalQuestions, questionResults } = finalResults;

  // Determine score color based on percentage
  const getScoreColor = (pct) => {
    if (pct >= 80) return 'text-green-600';
    if (pct >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const scoreColor = getScoreColor(percentage);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
              <p className="text-gray-600">{sessionData.examItemId?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
            </div>
            <button
              onClick={handleBackToCourse}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              ← Back to Course
            </button>
          </div>
          
          {/* Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${scoreColor}`}>
                {score}/{maxScore}
              </div>
              <div className="text-sm text-gray-600">Points</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className={`text-3xl font-bold ${scoreColor}`}>
                {percentage}%
              </div>
              <div className="text-sm text-gray-600">Percentage</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-blue-600">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Correct</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-700">
                {sessionData.attemptNumber || 1}
              </div>
              <div className="text-sm text-gray-600">Attempt</div>
            </div>
          </div>
        </div>

        {/* Question Results */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Question Details</h2>
          
          {questionResults?.map((question, index) => {
            const detailedQuestion = detailedQuestions[question.questionId];
            
            // Helper function to find option text by ID
            const getOptionText = (optionId) => {
              if (!detailedQuestion?.options) return optionId;
              const option = detailedQuestion.options.find(opt => opt.id === optionId);
              return option ? option.text : optionId;
            };

            return (
              <div
                key={question.questionId || index}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  question.isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Question {index + 1}
                    </h3>
                    {/* Display the full question text from detailed data */}
                    <div className="text-gray-700 mb-4 leading-relaxed">
                      {detailedQuestion?.questionText || question.questionText || 'Question text not available'}
                    </div>
                  </div>
                  <div className="flex flex-col items-end ml-4">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-2 ${
                      question.isCorrect 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {question.isCorrect ? '✓ Correct' : '✗ Incorrect'}
                    </span>
                    <span className="text-sm text-gray-600">
                      {question.points}/{question.maxPoints} pts
                    </span>
                  </div>
                </div>

                {/* Enhanced answer display */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Your Answer:</span>
                    <div className={`mt-1 p-3 rounded ${
                      question.isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                    }`}>
                      {question.studentAnswer ? (
                        <>
                          <strong>{question.studentAnswer.toUpperCase()})</strong> {getOptionText(question.studentAnswer)}
                        </>
                      ) : (
                        'No answer provided'
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Correct Answer:</span>
                    <div className="mt-1 p-3 bg-green-50 text-green-800 rounded">
                      <strong>{question.correctAnswer.toUpperCase()})</strong> {getOptionText(question.correctAnswer)}
                    </div>
                  </div>
                </div>

                {/* Enhanced feedback display */}
                {(detailedQuestion?.lastSubmission?.feedback || question.feedback) && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
                    <span className="text-sm font-medium text-blue-800 block mb-2">Detailed Feedback:</span>
                    <p className="text-sm text-blue-700 leading-relaxed">
                      {detailedQuestion?.lastSubmission?.feedback || question.feedback}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <button
            onClick={handleBackToCourse}
            className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors text-lg"
          >
            Return to Course
          </button>
        </div>

        {/* Session Info (for debugging) */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Session completed: {sessionData.completedAt ? new Date(sessionData.completedAt).toLocaleString() : 'Unknown'}
        </div>
      </div>
    </div>
  );
};

export default ExamResults;