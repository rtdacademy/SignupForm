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
        <div className="bg-gray-50 px-6 py-4 border-b flex items-center justify-between">
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

        {/* Questions Table */}
        <div className="flex-1 overflow-auto">
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
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    </div>
  );
};

// Individual Question Card Component
const QuestionCard = ({ question, assessmentData, questionNumber }) => {
  const getStatusIcon = () => {
    if (question.status === 'completed' && question.score === question.maxScore) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (question.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    } else if (question.attempts > 0) {
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
              {question.status?.replace('_', ' ') || 'Not Started'}
            </Badge>
          </div>
          <h4 className="font-medium text-gray-900">{question.title}</h4>
          {assessmentData?.questionText && (
            <p className="text-sm text-gray-600 mt-1">{assessmentData.questionText}</p>
          )}
        </div>
        
        <div className="text-right ml-4">
          {question.attempts > 0 ? (
            <div className={`text-sm font-medium px-3 py-1 rounded border ${getScoreColor(question.score, question.maxScore)}`}>
              {question.score} / {question.maxScore}
            </div>
          ) : (
            <div className="text-sm text-gray-400 px-3 py-1 bg-gray-50 rounded border">
              Not Started
            </div>
          )}
        </div>
      </div>

      {/* Question Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div>
          <span className="font-medium text-gray-700">Attempts:</span>
          <div className="text-gray-600">{question.attempts || 0}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Max Attempts:</span>
          <div className="text-gray-600">{assessmentData?.maxAttempts || 'Unlimited'}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Difficulty:</span>
          <div className="text-gray-600 capitalize">{assessmentData?.difficulty || 'N/A'}</div>
        </div>
        <div>
          <span className="font-medium text-gray-700">Points:</span>
          <div className="text-gray-600">{assessmentData?.pointsValue || question.maxScore}</div>
        </div>
      </div>

      {/* Last Submission Details */}
      {assessmentData?.lastSubmission && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Last Submission:</span>
            <span className="text-xs text-gray-500">{formatDate(assessmentData.lastSubmission.timestamp)}</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-medium text-gray-600">Your Answer:</span>
              <div className="text-gray-800">{assessmentData.lastSubmission.answer}</div>
            </div>
            <div>
              <span className="font-medium text-gray-600">Correct Answer:</span>
              <div className="text-gray-800">{assessmentData.lastSubmission.correctOptionId}</div>
            </div>
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

      {/* Answer Options (if available and not yet attempted) */}
      {assessmentData?.options && question.attempts === 0 && (
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