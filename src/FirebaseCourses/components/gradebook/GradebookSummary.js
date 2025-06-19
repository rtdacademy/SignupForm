import React from 'react';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';

const GradebookSummary = ({ course }) => {
  
  // Extract gradebook data directly from course prop
  const gradebook = course?.Gradebook || {};
  const summary = gradebook?.summary || null;
  const categories = gradebook?.categories || {};
  const items = gradebook?.items || {};
  const assessments = course?.Assessments || {};
  const hasData = !!summary;
  
  // Check for configuration errors
  const configError = summary ? null : 'No gradebook data available';
  
  // Show configuration error if weights are missing
  if (configError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Configuration Error</p>
        <p className="text-red-600 text-sm mt-2">{configError}</p>
      </div>
    );
  }
  
  if (!hasData || !summary) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No grade data available yet.</p>
      </div>
    );
  }

  // Fix percentage calculation - convert from decimal to percentage if needed
  let overallPercentage = summary.percentage || 0;
  if (overallPercentage > 0 && overallPercentage < 1) {
    overallPercentage = overallPercentage * 100;
  }
  
  const isPassing = summary.isPassing || overallPercentage >= (summary.passingGrade || 60);
  
  // Extract new grade fields
  const performanceGrade = summary.performanceGrade || 0;
  const courseGrade = summary.courseGrade || 0;
  const completedCount = summary.completedCount || 0;
  const totalItemCount = summary.totalItemCount || 0;
  const completedPoints = summary.completedPoints || 0;
  const completedPossible = summary.completedPossible || 0;

  // Calculate lesson-based completion stats
  const lessonStats = calculateLessonStats(items, assessments);

  return (
    <div className="space-y-6">
      {/* Dual Grade Display */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Performance Grade - How well student is doing on completed work */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Your Performance</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-green-700">{Math.round(performanceGrade)}%</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {completedPoints} / {completedPossible} points on completed work
              </p>
              <div className="mt-3 flex items-center gap-2">
                {performanceGrade >= (summary.passingGrade || 60) ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-600 font-medium">Strong performance!</span>
                  </>
                ) : (
                  <>
                    <Target className="h-4 w-4 text-orange-600" />
                    <span className="text-sm text-orange-600 font-medium">
                      Focus on accuracy
                    </span>
                  </>
                )}
              </div>
            </div>
            <Award className={`h-12 w-12 ${performanceGrade >= (summary.passingGrade || 60) ? 'text-yellow-500' : 'text-gray-300'}`} />
          </div>
        </div>

        {/* Course Progress - Overall course completion percentage */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-1">Course Progress</h3>
              <div className="flex items-baseline gap-3">
                <span className="text-5xl font-bold text-blue-700">{Math.round(lessonStats.completionPercentage)}%</span>
              </div>
             
              <div className="mt-3 flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-blue-600 font-medium">
                  {lessonStats.completed} of {lessonStats.total} lessons completed
                </span>
              </div>
            </div>
            <div className="text-blue-600">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
          
          {/* Progress to completion */}
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Overall Progress</span>
              <span>{Math.round(lessonStats.completionPercentage)}%</span>
            </div>
            <Progress 
              value={lessonStats.completionPercentage} 
              className="h-2"
            />
          </div>
        </div>
      </div>

      {/* Traditional Overall Grade (for reference/backward compatibility) */}
      {overallPercentage !== courseGrade && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-700">Weighted Grade</h4>
              <span className="text-3xl font-bold text-purple-700">{Math.round(overallPercentage)}%</span>
              <p className="text-sm text-gray-600">This would be your grade if zeros were applied to all uncompleted lessons</p>
            </div>
           
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(categories).map(([categoryType, categoryData]) => (
          <CategoryCard 
            key={categoryType}
            type={categoryType}
            data={categoryData}
          />
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Lessons Completed"
          value={`${lessonStats.completed} / ${lessonStats.total}`}
          subtext="Learning activities finished"
          color="green"
        />
        <StatCard
          label="Points Earned"
          value={`${completedPoints} / ${completedPossible}`}
          subtext="On completed work"
          color="blue"
        />
        <StatCard
          label="Course Total"
          value={`${summary.totalPoints || 0} / ${summary.possiblePoints || 0}`}
          subtext="All possible points"
          color="purple"
        />
        <StatCard
          label="Last Updated"
          value={getRelativeTime(summary.lastUpdated)}
          subtext="Most recent activity"
          color="gray"
        />
      </div>
    </div>
  );
};

// Category Card Component
const CategoryCard = ({ type, data }) => {
  const categoryConfig = {
    lesson: { color: 'blue', icon: '📚', label: 'Lessons' },
    assignment: { color: 'emerald', icon: '📝', label: 'Assignments' },
    exam: { color: 'purple', icon: '📋', label: 'Exams' },
    lab: { color: 'orange', icon: '🔬', label: 'Labs' },
    project: { color: 'pink', icon: '🎯', label: 'Projects' }
  };

  const config = categoryConfig[type] || { color: 'gray', icon: '📄', label: type };
  const percentage = data.percentage || 0;
  const weight = data.categoryWeight || 0;

  return (
    <div className={`bg-${config.color}-50 rounded-lg p-4 border border-${config.color}-100`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl">{config.icon}</span>
          <h4 className="text-sm font-medium text-gray-700 mt-1">{config.label}</h4>
        </div>
        <span className={`text-xs font-medium text-${config.color}-700 bg-${config.color}-100 px-2 py-1 rounded`}>
          {weight}% weight
        </span>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className={`text-2xl font-bold text-${config.color}-700`}>{Math.round(percentage)}%</span>
          <span className="text-sm text-gray-600">
            {data.earned || 0} / {data.possible || 0} pts
          </span>
        </div>
        
        <Progress value={percentage} className="h-1.5" />
        
        <div className="text-xs text-gray-600">
          {data.items?.length || 0} items • Weighted: {Math.round(data.weightedScore || 0)}%
        </div>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ label, value, subtext, color }) => (
  <div className={`bg-${color}-50 rounded-lg p-3 border border-${color}-100`}>
    <div className="text-xs font-medium text-gray-600">{label}</div>
    <div className={`text-lg font-bold text-${color}-700 mt-1`}>{value}</div>
    <div className="text-xs text-gray-500">{subtext}</div>
  </div>
);

// Helper functions

const getCompletedCount = (categories) => {
  let count = 0;
  Object.values(categories).forEach(cat => {
    count += cat.items?.filter(item => item.score > 0).length || 0;
  });
  return count;
};

const getTotalCount = (categories) => {
  let count = 0;
  Object.values(categories).forEach(cat => {
    count += cat.items?.length || 0;
  });
  return count;
};

const getRelativeTime = (timestamp) => {
  if (!timestamp) return 'Never';
  
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'Just now';
};

const calculateLessonStats = (items, assessments) => {
  const lessons = {};
  
  // Group items by lesson prefix
  Object.entries(items || {}).forEach(([itemId, itemData]) => {
    const lessonPrefix = extractLessonPrefix(itemId);
    if (!lessonPrefix) return;
    
    if (!lessons[lessonPrefix]) {
      lessons[lessonPrefix] = {
        lessonId: lessonPrefix,
        totalQuestions: 0,
        completedQuestions: 0,
        status: 'not_started'
      };
    }
    
    lessons[lessonPrefix].totalQuestions += 1;
    
    if (itemData.score > 0) {
      lessons[lessonPrefix].completedQuestions += 1;
    }
  });
  
  // Calculate lesson completion status
  Object.values(lessons).forEach(lesson => {
    if (lesson.completedQuestions === 0) {
      lesson.status = 'not_started';
    } else if (lesson.completedQuestions === lesson.totalQuestions) {
      lesson.status = 'completed';
    } else {
      lesson.status = 'in_progress';
    }
  });
  
  const total = Object.keys(lessons).length;
  const completed = Object.values(lessons).filter(lesson => lesson.status === 'completed').length;
  const completionPercentage = total > 0 ? (completed / total) * 100 : 0;
  
  return {
    total,
    completed,
    completionPercentage
  };
};

const extractLessonPrefix = (itemId) => {
  // Extract lesson prefix from item ID like "course4_01_welcome_rtd_academy_knowledge_check"
  // Returns "course4_01"
  const match = itemId.match(/^(course\d+_\d+)/);
  return match ? match[1] : null;
};

export default GradebookSummary;