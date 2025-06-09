import React from 'react';
import { useGradebook } from '../../context/GradebookContext';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';

const GradebookSummary = () => {
  const { summary, categories, hasData } = useGradebook();
  
  if (!hasData || !summary) {
    return (
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <p className="text-gray-500">No grade data available yet.</p>
      </div>
    );
  }

  const overallPercentage = summary.percentage || 0;
  const isPassing = summary.isPassing || overallPercentage >= (summary.passingGrade || 60);
  
  return (
    <div className="space-y-6">
      {/* Overall Grade Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Overall Grade</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-blue-700">{Math.round(overallPercentage)}%</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              {isPassing ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Passing</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">
                    Need {(summary.passingGrade || 60) - overallPercentage}% more to pass
                  </span>
                </>
              )}
            </div>
          </div>
          <Award className={`h-12 w-12 ${isPassing ? 'text-yellow-500' : 'text-gray-300'}`} />
        </div>
        
        {/* Progress to passing */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress to passing grade</span>
            <span>{summary.passingGrade || 60}%</span>
          </div>
          <Progress 
            value={Math.min(100, (overallPercentage / (summary.passingGrade || 60)) * 100)} 
            className="h-2"
          />
        </div>
      </div>

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
          label="Total Points"
          value={`${summary.totalPoints || 0} / ${summary.possiblePoints || 0}`}
          subtext="Earned / Possible"
          color="blue"
        />
        <StatCard
          label="Weighted Score"
          value={`${Math.round(summary.weightedScore || 0)}%`}
          subtext="After weights applied"
          color="purple"
        />
        <StatCard
          label="Assignments"
          value={`${getCompletedCount(categories)} / ${getTotalCount(categories)}`}
          subtext="Completed"
          color="green"
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

export default GradebookSummary;