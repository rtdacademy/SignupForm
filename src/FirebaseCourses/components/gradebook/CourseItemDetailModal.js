import React, { useState } from 'react';
import { 
  X, 
  CheckCircle, 
  XCircle, 
  ChevronLeft, 
  ChevronRight,
  Clock,
  Award,
  AlertCircle,
  Eye,
  BookOpen,
  FileText
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { ScrollArea } from '../../../components/ui/scroll-area';
import { Separator } from '../../../components/ui/separator';
import { Progress } from '../../../components/ui/progress';

const CourseItemDetailModal = ({ item, isOpen, onClose, onReviewQuestion }) => {
  if (!item) return null;

  const getQuestionStatus = (questionData) => {
    if (!questionData) return 'not_started';
    if (questionData.status === 'completed' && questionData.score > 0) return 'completed';
    if (questionData.attempts > 0) return 'attempted';
    return 'not_started';
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 90) return 'text-green-700 bg-green-50 border-green-200';
    if (percentage >= 80) return 'text-blue-700 bg-blue-50 border-blue-200';
    if (percentage >= 70) return 'text-yellow-700 bg-yellow-50 border-yellow-200';
    if (percentage >= 60) return 'text-orange-700 bg-orange-50 border-orange-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const getTypeIcon = (type) => {
    const icons = {
      lesson: <BookOpen className="h-5 w-5" />,
      assignment: <FileText className="h-5 w-5" />,
      exam: <Award className="h-5 w-5" />,
      lab: <AlertCircle className="h-5 w-5" />,
      project: <Award className="h-5 w-5" />
    };
    return icons[type] || <BookOpen className="h-5 w-5" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                {getTypeIcon(item.type)}
              </div>
              <div>
                <DialogTitle className="text-xl">{item.title}</DialogTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                  <span className="text-sm text-gray-600">{item.unitTitle}</span>
                  <span className="text-sm text-gray-500">Path: {item.contentPath}</span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-8rem)] pr-4">
          <div className="space-y-6">
            {/* Item Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                icon={<Award className="h-5 w-5" />}
                label="Total Score"
                value={`${item.earnedPoints}/${item.totalPoints}`}
                subtext={`${item.percentage}%`}
                color={item.percentage >= 80 ? 'green' : item.percentage >= 60 ? 'yellow' : 'red'}
              />
              <StatCard
                icon={<CheckCircle className="h-5 w-5" />}
                label="Questions"
                value={`${item.completedQuestions}/${item.totalQuestions}`}
                subtext="Completed"
                color="blue"
              />
              <StatCard
                icon={<Clock className="h-5 w-5" />}
                label="Progress"
                value={`${Math.round((item.completedQuestions / item.totalQuestions) * 100)}%`}
                subtext="Complete"
                color={item.status === 'completed' ? 'green' : 'blue'}
              />
              <StatCard
                icon={<AlertCircle className="h-5 w-5" />}
                label="Status"
                value={item.status === 'completed' ? 'Complete' : 
                       item.status === 'in_progress' ? 'In Progress' : 'Not Started'}
                subtext={item.estimatedTime ? `~${item.estimatedTime} min` : ''}
                color={item.status === 'completed' ? 'green' : 
                       item.status === 'in_progress' ? 'yellow' : 'gray'}
              />
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Overall Progress</span>
                <span>{item.percentage}%</span>
              </div>
              <Progress value={item.percentage} className="h-2" />
            </div>

            <Separator />

            {/* Questions List */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Questions in this {item.type}</h3>
              
              {item.questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <AlertCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No questions found for this course item.</p>
                  <p className="text-sm">Questions may not have been attempted yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {item.questions.map(([questionId, questionData], index) => (
                    <QuestionRow
                      key={questionId}
                      questionId={questionId}
                      questionData={questionData}
                      index={index + 1}
                      onReview={() => onReviewQuestion({ 
                        id: questionId, 
                        ...questionData, 
                        assessmentData: questionData.assessmentData 
                      })}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Item Description */}
            {item.description && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              </>
            )}

            {/* Additional Details */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Content Path:</span>
                <span className="text-gray-800 font-mono">{item.contentPath}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Course Item ID:</span>
                <span className="text-gray-800 font-mono">{item.itemId}</span>
              </div>
              {item.estimatedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Estimated Time:</span>
                  <span className="text-gray-800">{item.estimatedTime} minutes</span>
                </div>
              )}
              {item.required !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Required:</span>
                  <span className="text-gray-800">{item.required ? 'Yes' : 'No'}</span>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Question Row Component
const QuestionRow = ({ questionId, questionData, index, onReview }) => {
  const status = questionData.status || 'not_started';
  const percentage = questionData.maxScore > 0 
    ? Math.round((questionData.score / questionData.maxScore) * 100) 
    : 0;
    
  const getStatusIcon = () => {
    if (status === 'completed' && questionData.score === questionData.maxScore) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-blue-500" />;
    } else if (questionData.attempts > 0) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    }
    return <AlertCircle className="h-5 w-5 text-gray-400" />;
  };

  const getScoreColor = (pct) => {
    if (pct >= 90) return 'text-green-700 bg-green-50';
    if (pct >= 80) return 'text-blue-700 bg-blue-50';
    if (pct >= 70) return 'text-yellow-700 bg-yellow-50';
    if (pct >= 60) return 'text-orange-700 bg-orange-50';
    return 'text-red-700 bg-red-50';
  };

  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm font-medium">
          {index}
        </div>
        {getStatusIcon()}
        <div>
          <div className="font-medium text-gray-900">
            {questionData.title || `Question ${index}`}
          </div>
          <div className="text-sm text-gray-600 font-mono">
            {questionId}
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        {questionData.attempts > 0 ? (
          <div className="text-right">
            <div className={`text-sm font-medium px-2 py-1 rounded ${getScoreColor(percentage)}`}>
              {questionData.score || 0} / {questionData.maxScore || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {questionData.attempts} attempt{questionData.attempts !== 1 ? 's' : ''}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-400">Not attempted</div>
        )}
        
        {questionData.attempts > 0 && questionData.assessmentData && (
          <Button
            size="sm"
            variant="ghost"
            onClick={onReview}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            Review
          </Button>
        )}
      </div>
    </div>
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

export default CourseItemDetailModal;