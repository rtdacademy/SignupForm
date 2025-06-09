import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Award,
  AlertCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';

const QuestionReviewModal = ({ question, isOpen, onClose, onNavigate }) => {
  const [showExplanation, setShowExplanation] = useState(true);
  
  if (!question || !question.assessmentData) {
    return null;
  }

  const { assessmentData } = question;
  const lastSubmission = assessmentData.lastSubmission || {};
  const isCorrect = lastSubmission.isCorrect;
  const percentage = question.maxScore > 0 
    ? Math.round((question.score / question.maxScore) * 100) 
    : 0;

  const getOptionClass = (optionId) => {
    const isStudentAnswer = optionId === lastSubmission.answer;
    const isCorrectOption = optionId === assessmentData.correctOptionId;
    
    if (isStudentAnswer && isCorrect) {
      return 'bg-green-50 border-green-300 ring-2 ring-green-400';
    } else if (isStudentAnswer && !isCorrect) {
      return 'bg-red-50 border-red-300 ring-2 ring-red-400';
    } else if (!isStudentAnswer && isCorrectOption && !isCorrect) {
      return 'bg-green-50 border-green-300 border-dashed';
    }
    return 'bg-gray-50 border-gray-200';
  };

  const getOptionIcon = (optionId) => {
    const isStudentAnswer = optionId === lastSubmission.answer;
    const isCorrectOption = optionId === assessmentData.correctOptionId;
    
    if (isStudentAnswer && isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (isStudentAnswer && !isCorrect) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    } else if (!isStudentAnswer && isCorrectOption && !isCorrect) {
      return <CheckCircle className="h-5 w-5 text-green-600 opacity-50" />;
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Question Review</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">{question.title}</p>
            </div>
            <div className="flex items-center gap-2">
              {onNavigate && (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onNavigate('prev')}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onNavigate('next')}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Question Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Award className="h-5 w-5" />}
                label="Score"
                value={`${question.score}/${question.maxScore}`}
                subtext={`${percentage}%`}
                color={percentage >= 80 ? 'green' : percentage >= 60 ? 'yellow' : 'red'}
              />
              <StatCard
                icon={<Clock className="h-5 w-5" />}
                label="Attempts"
                value={question.attempts || 0}
                subtext={`of ${assessmentData.maxAttempts || '∞'}`}
                color="blue"
              />
              <StatCard
                icon={isCorrect ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                label="Result"
                value={isCorrect ? 'Correct' : 'Incorrect'}
                subtext={lastSubmission.timestamp ? new Date(lastSubmission.timestamp).toLocaleDateString() : ''}
                color={isCorrect ? 'green' : 'red'}
              />
              <StatCard
                icon={<AlertCircle className="h-5 w-5" />}
                label="Status"
                value={question.status === 'completed' ? 'Complete' : 'In Progress'}
                subtext={assessmentData.difficulty || 'Standard'}
                color={question.status === 'completed' ? 'green' : 'yellow'}
              />
            </div>

            <Separator />

            {/* Question */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Question</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {assessmentData.questionText}
                </p>
              </div>
            </div>

            {/* Options */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Answer Options</h3>
              <div className="space-y-3">
                {assessmentData.options?.map((option) => (
                  <div
                    key={option.id}
                    className={`p-4 rounded-lg border-2 transition-colors ${getOptionClass(option.id)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getOptionIcon(option.id) || (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-800">{option.text}</p>
                        {option.id === lastSubmission.answer && lastSubmission.feedback && (
                          <p className="text-sm text-gray-600 mt-2 italic">
                            {lastSubmission.feedback}
                          </p>
                        )}
                      </div>
                      {option.id === lastSubmission.answer && (
                        <Badge variant="secondary" className="text-xs">
                          Your Answer
                        </Badge>
                      )}
                      {option.id === assessmentData.correctOptionId && !isCorrect && (
                        <Badge variant="outline" className="text-xs text-green-700 border-green-300">
                          Correct Answer
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            {assessmentData.explanation && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Explanation</h3>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setShowExplanation(!showExplanation)}
                    >
                      {showExplanation ? 'Hide' : 'Show'}
                    </Button>
                  </div>
                  {showExplanation && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-800 whitespace-pre-wrap">
                        {assessmentData.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Additional Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Question Type:</span>
                <Badge variant="outline">{question.type}</Badge>
              </div>
              {assessmentData.topic && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Topic:</span>
                  <span className="text-gray-800">{assessmentData.topic}</span>
                </div>
              )}
              {assessmentData.generatedBy && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Generated By:</span>
                  <span className="text-gray-800 capitalize">{assessmentData.generatedBy}</span>
                </div>
              )}
              {question.completedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Completed:</span>
                  <span className="text-gray-800">
                    {new Date(question.completedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Stat Card Component
const StatCard = ({ icon, label, value, subtext, color }) => {
  const colorClasses = {
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    gray: 'bg-gray-50 text-gray-700 border-gray-200'
  };

  return (
    <div className={`rounded-lg border p-3 ${colorClasses[color] || colorClasses.gray}`}>
      <div className="flex items-center gap-2 mb-1">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <div className="text-lg font-bold">{value}</div>
      {subtext && <div className="text-xs opacity-75">{subtext}</div>}
    </div>
  );
};

export default QuestionReviewModal;