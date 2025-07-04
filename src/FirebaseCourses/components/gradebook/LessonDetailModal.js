import React from 'react';
import { X, CheckCircle, XCircle, Clock, Award, RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';

const LessonDetailModal = ({ isOpen, onClose, lesson, course }) => {
  if (!isOpen || !lesson) return null;

  const assessments = course?.Assessments || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{lesson.lessonTitle}</h2>
            <p className="text-sm text-gray-600">{lesson.lessonId} • {lesson.activityType}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto">
          {/* Lesson Summary Stats */}
          <div className="px-6 py-4 border-b bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{lesson.totalQuestions}</div>
                <div className="text-sm text-gray-600">Total Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{lesson.completedQuestions}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{Math.round(lesson.averageScore)}%</div>
                <div className="text-sm text-gray-600">Average Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{Math.round(lesson.completionRate)}%</div>
                <div className="text-sm text-gray-600">Progress</div>
              </div>
            </div>
          </div>

          {/* Session Information for Assignments/Exams/Quizzes */}
          {lesson.sessionData && ['assignment', 'exam', 'quiz'].includes(lesson.activityType) && (
            <div className="px-6 py-4 border-b bg-blue-50">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-blue-600" />
                Exam Session History
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{lesson.sessionData.sessionCount}</div>
                  <div className="text-sm text-gray-600">Total Attempts</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(lesson.sessionData.latestSession.finalResults.percentage)}%
                  </div>
                  <div className="text-sm text-gray-600">Latest Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(Math.max(...lesson.sessionData.sessions.map(s => s.finalResults.percentage)))}%
                  </div>
                  <div className="text-sm text-gray-600">Best Score</div>
                </div>
              </div>

              {/* Session List */}
              <div className="space-y-3">
                <h4 className="text-md font-medium text-gray-700">Session Details</h4>
                {lesson.sessionData.sessions.map((session, index) => (
                  <SessionCard key={session.sessionId || index} session={session} attemptNumber={index + 1} />
                ))}
              </div>
            </div>
          )}

          {/* Questions Table */}
          <div className="px-6 py-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Question Details</h3>
            
            {lesson.questions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No questions found for this lesson.
              </div>
            ) : (
              <div className="space-y-4">
                {lesson.questions.map((question, index) => (
                  <QuestionCard 
                    key={question.id} 
                    question={question} 
                    assessmentData={assessments[question.id]}
                    questionNumber={index + 1}
                    activityType={lesson.activityType}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end flex-shrink-0">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

// Individual Session Card Component
const SessionCard = ({ session, attemptNumber }) => {
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    return new Date(timestamp).toLocaleString();
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds || milliseconds < 0) return 'N/A';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const percentage = session.finalResults?.percentage || 0;
  const score = session.finalResults?.score || 0;
  const maxScore = session.finalResults?.maxScore || 0;

  return (
    <div className="border rounded-lg p-4 bg-white hover:bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Attempt {attemptNumber}</span>
            <Badge variant="outline" className="text-xs">
              {session.status === 'completed' ? 'Completed' : session.status}
            </Badge>
          </div>
          <div className="text-sm text-gray-600">
            Completed: {formatDate(session.finalResults?.completedAt)}
          </div>
          {session.createdAt && (
            <div className="text-xs text-gray-500">
              Started: {formatDate(session.createdAt)}
            </div>
          )}
        </div>
        
        <div className="text-right ml-4">
          <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(percentage)}`}>
            {score} / {maxScore}
          </div>
          <div className="text-xs text-gray-500 mt-1">{Math.round(percentage)}%</div>
        </div>
      </div>

      {/* Session Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Questions:</span>
          <div className="text-gray-600">{session.finalResults?.totalQuestions || 0}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Duration:</span>
          <div className="text-gray-600">
            {session.createdAt && session.finalResults?.completedAt 
              ? formatDuration(session.finalResults.completedAt - session.createdAt)
              : 'N/A'}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Session ID:</span>
          <div className="text-gray-600 text-xs break-all">
            {session.sessionId ? session.sessionId.slice(-8) : 'N/A'}
          </div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Item ID:</span>
          <div className="text-gray-600 text-xs">
            {session.examItemId || 'N/A'}
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Question Card Component
const QuestionCard = ({ question, assessmentData, questionNumber, activityType }) => {
  // Determine if we should show detailed information
  // Show detailed info for assignments, limited info for exams and quizzes
  const showDetailedInfo = activityType === 'assignment';
  
  // Helper to get question status based on new data structure
  const getQuestionStatus = () => {
    if (!question.attempted) {
      return 'not_started';
    } else if (question.actualGrade === question.points) {
      return 'completed_perfect';
    } else {
      return 'completed';
    }
  };

  const getStatusIcon = () => {
    const status = getQuestionStatus();
    if (status === 'completed_perfect') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    } else if (question.attempted) {
      return <RotateCcw className="h-5 w-5 text-yellow-500" />;
    }
    return <Clock className="h-5 w-5 text-gray-400" />;
  };

  const getScoreColor = (score, maxScore) => {
    const pct = maxScore > 0 ? (score / maxScore) * 100 : 0;
    if (pct >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (pct >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (pct >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Not attempted';
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-500">Question {questionNumber}</span>
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs">
              {getQuestionStatus().replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Badge>
          </div>
          <h4 className="font-medium text-gray-900">{question.title}</h4>
          {showDetailedInfo && assessmentData?.questionText && (
            <p className="text-sm text-gray-600 mt-1">{assessmentData.questionText}</p>
          )}
          {!showDetailedInfo && (
            <p className="text-sm text-gray-500 mt-1 italic">
              Question details are not shown for {activityType}s to maintain assessment integrity
            </p>
          )}
        </div>
        
        <div className="text-right ml-4">
          {question.attempted ? (
            <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(question.actualGrade, question.points)}`}>
              {question.actualGrade} / {question.points}
            </div>
          ) : (
            <div className="text-sm text-gray-400 px-3 py-1 bg-gray-50 rounded border">
              Not Started
            </div>
          )}
        </div>
      </div>


      {/* Last Submission Details - Only show for assignments */}
      {showDetailedInfo && assessmentData?.lastSubmission && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Last Submission:</span>
            <span className="text-xs text-gray-500">{formatDate(assessmentData.lastSubmission.timestamp)}</span>
          </div>
          
          <div className="space-y-3 text-sm">
            {(() => {
              // Find the actual option text for student's answer and correct answer
              const studentAnswerId = assessmentData.lastSubmission.answer;
              const correctAnswerId = assessmentData.lastSubmission.correctOptionId;
              const isCorrect = assessmentData.lastSubmission.isCorrect;
              
              // Find option texts from the available options
              const studentOption = assessmentData.options?.find(opt => opt.id === studentAnswerId);
              const correctOption = assessmentData.options?.find(opt => opt.id === correctAnswerId);
              
              const studentAnswerText = studentOption?.text || studentAnswerId;
              const correctAnswerText = correctOption?.text || correctAnswerId;
              
              if (isCorrect) {
                // If correct, only show one answer since they're the same
                return (
                  <div>
                    <span className="font-medium text-gray-600">Selected Answer:</span>
                    <div className="text-green-800 bg-green-50 p-2 rounded border border-green-200 mt-1">
                      <span className="font-medium">{studentAnswerId?.toUpperCase()}:</span> {studentAnswerText}
                    </div>
                  </div>
                );
              } else {
                // If incorrect, show both answers
                return (
                  <>
                    <div>
                      <span className="font-medium text-gray-600">Your Answer:</span>
                      <div className="text-red-800 bg-red-50 p-2 rounded border border-red-200 mt-1">
                        <span className="font-medium">{studentAnswerId?.toUpperCase()}:</span> {studentAnswerText}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Correct Answer:</span>
                      <div className="text-green-800 bg-green-50 p-2 rounded border border-green-200 mt-1">
                        <span className="font-medium">{correctAnswerId?.toUpperCase()}:</span> {correctAnswerText}
                      </div>
                    </div>
                  </>
                );
              }
            })()}
          </div>
          
          {assessmentData.lastSubmission.feedback && (
            <div className="mt-2">
              <span className="font-medium text-gray-600">Feedback:</span>
              <div className={`text-sm mt-1 p-2 rounded ${
                assessmentData.lastSubmission.isCorrect 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {assessmentData.lastSubmission.feedback}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Limited info for exams and quizzes */}
      {!showDetailedInfo && question.attempted && (
        <div className="mt-3 pt-3 border-t">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Submission recorded:</span> {formatDate(assessmentData?.lastSubmission?.timestamp)}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Detailed answer information is not shown for {activityType}s
          </div>
        </div>
      )}

      {/* Answer Options (if available and not yet attempted) - Only show for assignments */}
      {showDetailedInfo && assessmentData?.options && !question.attempted && (
        <div className="mt-3 pt-3 border-t">
          <span className="text-sm font-medium text-gray-700">Answer Options:</span>
          <div className="mt-2 space-y-1">
            {assessmentData.options.map((option) => (
              <div key={option.id} className="text-sm text-gray-600 flex items-center gap-2">
                <span className="font-medium">{option.id.toUpperCase()}:</span>
                <span>{option.text}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonDetailModal;