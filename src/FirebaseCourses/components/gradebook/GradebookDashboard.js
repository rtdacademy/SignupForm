import React, { useState } from 'react';
import { BarChart, List, Target } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import GradebookSummary, { getLastActivityTime, getRelativeTime } from './GradebookSummary';
import AssessmentGrid from './AssessmentGrid';
//import CourseItemDetailModal from './CourseItemDetailModal';
//import QuestionReviewModal from './QuestionReviewModal';

const GradebookDashboard = ({ course, allCourseItems = [], profile, lessonAccessibility = {}, showHeader = true }) => {
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [selectedCourseItem, setSelectedCourseItem] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleReviewAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    setReviewModalOpen(true);
  };

  const handleCourseItemSelect = (item) => {
    setSelectedCourseItem(item);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Page Header - conditionally rendered */}
      {showHeader && (
        <div className="border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Gradebook</h1>
              <p className="text-gray-600 mt-1">Track your progress and manage your learning journey</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Last updated</p>
              <p className="text-sm font-medium text-gray-700">{getRelativeTime(getLastActivityTime(course))}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="assessments" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <GradebookSummary course={course} allCourseItems={allCourseItems} profile={profile} />
        </TabsContent>

        <TabsContent value="assessments" className="space-y-6">
          <AssessmentGrid 
            course={course} 
            allCourseItems={allCourseItems}
            profile={profile}
            onReviewAssessment={handleReviewAssessment}
          />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {selectedCourseItem && (
        <CourseItemDetailModal
          isOpen={!!selectedCourseItem}
          onClose={() => setSelectedCourseItem(null)}
          courseItem={selectedCourseItem}
          onReviewAssessment={handleReviewAssessment}
        />
      )}

    </div>
  );
};

// Quick Action Cards Component
const QuickActionCards = ({ course }) => {
  const gradebook = course?.Gradebook || {};
  const items = gradebook?.items || {};
  const summary = gradebook?.summary || {};

  const overallPercentage = summary.percentage > 0 && summary.percentage < 1 
    ? summary.percentage * 100 
    : summary.percentage;

  const actions = [];

  // Incomplete items
  const incompleteCount = Object.values(items).filter(item => item.attempts === 0).length;
  if (incompleteCount > 0) {
    actions.push({
      title: 'Complete Missing Assessments',
      description: `${incompleteCount} assessments need to be started`,
      color: 'blue',
      icon: '📝'
    });
  }

  // Low scores to retry
  const lowScoreCount = Object.values(items).filter(item => 
    item.attempts > 0 && item.score < item.maxScore * 0.7
  ).length;
  if (lowScoreCount > 0) {
    actions.push({
      title: 'Improve Low Scores',
      description: `${lowScoreCount} assessments scored below 70%`,
      color: 'orange',
      icon: '🎯'
    });
  }

  // Overall grade improvement
  if (overallPercentage < 85) {
    actions.push({
      title: 'Boost Your Grade',
      description: `Current: ${Math.round(overallPercentage)}% - Aim for 85%+`,
      color: 'green',
      icon: '📈'
    });
  }

  // Course completion
  const completedCount = Object.values(items).filter(item => item.status === 'completed').length;
  const completionRate = items.length > 0 ? (completedCount / Object.keys(items).length) * 100 : 0;
  if (completionRate < 100) {
    actions.push({
      title: 'Course Completion',
      description: `${Math.round(completionRate)}% complete - Keep going!`,
      color: 'purple',
      icon: '🏆'
    });
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {actions.slice(0, 4).map((action, index) => (
        <div key={index} className={`bg-${action.color}-50 border border-${action.color}-200 rounded-lg p-4`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl">{action.icon}</span>
            <div>
              <h5 className="font-medium text-gray-800">{action.title}</h5>
              <p className="text-sm text-gray-600">{action.description}</p>
            </div>
          </div>
        </div>
      ))}
      {actions.length === 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⭐</span>
            <div>
              <h5 className="font-medium text-green-800">Excellent Work!</h5>
              <p className="text-sm text-green-700">You're performing well across all areas.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradebookDashboard;