import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { formatScore } from '../../utils/gradeUtils';
import { useAuth } from '../../../context/AuthContext';
import { createAllCourseItems } from '../../utils/courseItemsUtils';
import { 
  calculateCourseProgress,
  hasValidGradebookData 
} from '../../utils/courseProgressUtils';

const GradebookSummary = ({ course, profile }) => {
  const { currentUser } = useAuth();
  
  // Create allCourseItems using utility function
  const allCourseItems = useMemo(() => {
    return createAllCourseItems(course);
  }, [course]);
  
  // Calculate actual item counts from course structure
  const actualItemCounts = useMemo(() => {
    const counts = {};
    const courseStructure = course?.courseDetails?.['course-config']?.courseStructure;
    
    if (courseStructure?.units) {
      courseStructure.units.forEach(unit => {
        if (unit.items) {
          unit.items.forEach(item => {
            const type = item.type;
            if (type) {
              counts[type] = (counts[type] || 0) + 1;
            }
          });
        }
      });
    }
    
    console.log('Actual item counts from course structure:', counts);
    return counts;
  }, [course]);
  
  // Check if server-calculated gradebook data is available
  const gradebook = course?.Gradebook;
  const hasGradebookData = hasValidGradebookData(course);
  
  if (!hasGradebookData) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700 font-medium">Gradebook Loading</p>
        <p className="text-yellow-600 text-sm mt-2">
          Grade calculations are being processed...
        </p>
      </div>
    );
  }

  // Get student email for completion checking
  const studentEmail = profile?.StudentEmail || currentUser?.email;

  // Use server-calculated data directly
  const categoryStats = gradebook.categories;
  const overallStats = {
    ...gradebook.overall,
    hasAttemptedWork: Object.values(gradebook.items).some(item => item.attempted > 0)
  };

  // Get weights from course config for display
  const weights = course?.courseDetails?.['course-config']?.weights || {};
  const courseItemStats = calculateCourseProgress(course, allCourseItems);
  
  const passingGrade = 60; // Could be made configurable

  return (
    <div className="space-y-6">
      {/* Course Progress */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">Course Progress</h3>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-blue-700">{formatScore(courseItemStats.completionPercentage)}%</span>
            </div>
           
            <div className="mt-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">
                {courseItemStats.completed} of {courseItemStats.total} course items completed
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="text-blue-600 mb-2">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Last updated</p>
              <p className="text-xs font-medium text-gray-700">{getRelativeTime(getLastActivityTime(course))}</p>
            </div>
          </div>
        </div>
        
        {/* Progress to completion */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Overall Progress</span>
            <span>{formatScore(courseItemStats.completionPercentage)}%</span>
          </div>
          <Progress 
            value={courseItemStats.completionPercentage} 
            className="h-2"
          />
        </div>
      </div>

      {/* Course Grades */}
      {overallStats.isWeighted && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Performance */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div>
              <h4 className="text-md font-medium text-gray-700">Current Performance</h4>
              {overallStats.hasAttemptedWork ? (
                <>
                  <span className="text-3xl font-bold text-green-700">{formatScore(overallStats.currentPerformance)}%</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on completed work only
                  </p>
                </>
              ) : (
                <>
                  <span className="text-3xl font-bold text-gray-400">--</span>
                  <p className="text-sm text-gray-500 mt-1">
                    No assessments attempted yet
                  </p>
                </>
              )}
            </div>
          </div>
          
          {/* Projected Final Grade */}
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
            <div>
              <h4 className="text-md font-medium text-gray-700">Projected Final Grade</h4>
              <span className="text-3xl font-bold text-purple-700">{formatScore(overallStats.projectedFinal)}%</span>
              <p className="text-sm text-gray-600 mt-1">
                If remaining work not completed
              </p>
           
            </div>
          </div>
        </div>
      )}

      {/* Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(categoryStats).map(([categoryType, categoryData]) => (
          <CategoryCard 
            key={categoryType}
            type={categoryType}
            data={categoryData}
            weight={weights[categoryType] || 0}
            actualItemCount={actualItemCounts[categoryType] || 0}
          />
        ))}
      </div>

    </div>
  );
};

// Category Card Component
const CategoryCard = ({ type, data, weight, actualItemCount }) => {
  const categoryConfig = {
    lesson: { color: 'blue', icon: '📚', label: 'Lessons' },
    assignment: { color: 'emerald', icon: '📝', label: 'Assignments' },
    exam: { color: 'purple', icon: '📋', label: 'Exams' },
    lab: { color: 'orange', icon: '🔬', label: 'Labs' },
    project: { color: 'pink', icon: '🎯', label: 'Projects' }
  };

  const config = categoryConfig[type] || { color: 'gray', icon: '📄', label: type };
  const weightPercent = (weight || 0) * 100;

  return (
    <div className={`bg-${config.color}-50 rounded-lg p-4 border border-${config.color}-100`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="text-2xl">{config.icon}</span>
          <h4 className="text-sm font-medium text-gray-700 mt-1">{config.label}</h4>
        </div>
        <span className={`text-xs font-medium text-${config.color}-700 bg-${config.color}-100 px-2 py-1 rounded`}>
          {formatScore(weightPercent)}% weight
        </span>
      </div>
      
      <div className="space-y-3">
        {/* Current Performance */}
        <div className="flex items-baseline justify-between">
          {data.total > 0 ? (
            <span className={`text-2xl font-bold text-${config.color}-700`}>{formatScore(data.percentage)}%</span>
          ) : (
            <span className="text-2xl font-bold text-gray-400">--</span>
          )}
          <span className="text-xs text-gray-600">
            {actualItemCount} items
          </span>
        </div>
        
        {/* Score Details */}
        <div className="text-xs text-gray-600">
          {data.completedCount > 0 && (
            <div>
              {data.completedCount} of {actualItemCount} completed
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper functions

const getLastActivityTime = (course) => {
  const assessments = course?.Assessments || {};
  let latestTimestamp = 0;
  
  // Find the latest timestamp from all assessments
  Object.values(assessments).forEach(assessment => {
    if (assessment?.timestamp && assessment.timestamp > latestTimestamp) {
      latestTimestamp = assessment.timestamp;
    }
  });
  
  return latestTimestamp || null;
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

// Using simplified courseProgressUtils functions that leverage cloud function calculated data

// Export utility functions for use in parent components
export { getLastActivityTime, getRelativeTime };

export default GradebookSummary;