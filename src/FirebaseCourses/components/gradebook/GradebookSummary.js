import React from 'react';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  calculateCategoryScores,
  checkLessonCompletion 
} from '../../utils/gradeCalculations';
import { formatScore } from '../../utils/gradeUtils';
import { useAuth } from '../../../context/AuthContext';

const GradebookSummary = ({ course, allCourseItems = [], profile }) => {
  const { currentUser } = useAuth();
  
  // Validate that we have the required data structures
  const validation = validateGradeDataStructures(course);
  
  // Show error if validation fails
  if (!validation.valid) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <p className="text-yellow-700 font-medium">Course Data Loading</p>
        <p className="text-yellow-600 text-sm mt-2">
          Progress data is loading. Missing: {validation.missing.join(', ')}
        </p>
      </div>
    );
  }
  
  const itemStructure = course?.Gradebook?.courseConfig?.gradebook?.itemStructure || {};
  const actualGrades = course?.Grades?.assessments || {};
  const weights = course?.Gradebook?.courseConfig?.weights || {};

  // Get student email for session-based scoring
  const studentEmail = profile?.StudentEmail || currentUser?.email;


  // Calculate all stats using session-aware utility functions
  const baseCategoryStats = calculateCategoryScores(course, studentEmail, allCourseItems);
  const categoryStats = enhanceCategoryStatsWithItemCounts(baseCategoryStats, allCourseItems, weights);
  const overallStats = calculateOverallStatsFromCategories(categoryStats, weights);
  const courseItemStats = calculateCourseItemStats(course, allCourseItems, studentEmail);
  
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

      {/* Weighted Course Grade */}
      {overallStats.totalPossible > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Current Performance */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
            <div>
              <h4 className="text-md font-medium text-gray-700">Current Performance</h4>
              {overallStats.currentWeightedGrade !== null ? (
                <>
                  <span className="text-3xl font-bold text-green-700">{formatScore(overallStats.currentWeightedGrade)}%</span>
                  <p className="text-sm text-gray-600 mt-1">
                    Based on completed work
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
              <span className="text-3xl font-bold text-purple-700">{formatScore(overallStats.weightedGrade)}%</span>
              <p className="text-sm text-gray-600 mt-1">
                If remaining work not completed
              </p>
              <p className="text-xs text-gray-500">
                Weighted by: {Object.entries(weights).filter(([_, weight]) => weight > 0).map(([type, weight]) => `${type}: ${weight * 100}%`).join(', ')}
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
          />
        ))}
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
  const attemptedPercentage = data.attemptedPercentage;
  const completionPercentage = data.completionPercentage || 0;
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
      
      <div className="space-y-3">
        {/* Performance on attempted work */}
        <div className="flex items-baseline justify-between">
          {attemptedPercentage !== null ? (
            <span className={`text-2xl font-bold text-${config.color}-700`}>{formatScore(attemptedPercentage)}%</span>
          ) : (
            <span className="text-2xl font-bold text-gray-400">--</span>
          )}
          <span className="text-xs text-gray-600">
            {attemptedPercentage !== null ? 'On attempted' : 'Not started'}
          </span>
        </div>
        
        
        {/* Projected contribution */}
        <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
          Contributes {formatScore(data.percentage * weight / 100)}% to final grade
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

// Calculate overall stats from category scores (replaces old calculateOverallStats)
const calculateOverallStatsFromCategories = (categoryStats, weights) => {
  let totalPoints = 0;
  let totalPossible = 0;
  let attemptedPoints = 0;
  let attemptedPossible = 0;
  let weightedGrade = 0; // Projected grade (includes 0s for unstarted work)
  let currentWeightedGrade = 0; // Current grade based on attempted work only
  let totalWeightForAttempted = 0; // Sum of weights for categories with attempted work
  
  // Sum up category data
  Object.entries(categoryStats).forEach(([categoryType, categoryData]) => {
    totalPoints += categoryData.score || 0;
    totalPossible += categoryData.total || 0;
    attemptedPoints += categoryData.attemptedScore || 0;
    attemptedPossible += categoryData.attemptedTotal || 0;
    
    // Calculate projected weighted grade (includes all work - zeros for incomplete)
    const weight = (weights[categoryType] || 0);
    const categoryPercentage = categoryData.percentage || 0; // This already includes zeros
    weightedGrade += (categoryPercentage * weight);
    
    
    // Calculate current weighted grade (only attempted work)
    if (categoryData.attemptedPercentage !== null && categoryData.attemptedCount > 0) {
      currentWeightedGrade += (categoryData.attemptedPercentage * weight);
      totalWeightForAttempted += weight;
    }
  });
  
  
  // Normalize current weighted grade to show performance on attempted work
  // This gives us the weighted average of only the categories with attempts
  if (totalWeightForAttempted > 0) {
    currentWeightedGrade = currentWeightedGrade / totalWeightForAttempted;
  } else {
    currentWeightedGrade = null; // No work attempted
  }
  
  const overallPercentage = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0;
  const performancePercentage = attemptedPossible > 0 ? (attemptedPoints / attemptedPossible) * 100 : 0;
  
  return {
    totalPoints,
    totalPossible,
    overallPercentage,
    attemptedPoints,
    attemptedPossible,
    performancePercentage,
    weightedGrade, // Projected final grade if all remaining work scores 0%
    currentWeightedGrade, // Current grade based only on attempted work
    hasAttemptedWork: attemptedPossible > 0
  };
};

// Enhanced category stats that properly calculates overall percentages including zeros
const enhanceCategoryStatsWithItemCounts = (categoryStats, allCourseItems = [], weights = {}) => {
  const enhanced = { ...categoryStats };
  
  // Initialize missing categories
  Object.keys(weights).forEach(categoryType => {
    if (!enhanced[categoryType]) {
      enhanced[categoryType] = {
        score: 0,
        total: 0,
        attemptedScore: 0,
        attemptedTotal: 0,
        attemptedCount: 0,
        totalCount: 0,
        percentage: 0,
        attemptedPercentage: null,
        completionPercentage: 0,
        items: [],
        categoryWeight: (weights[categoryType] || 0) * 100,
        totalItemCount: 0
      };
    } else {
      enhanced[categoryType].categoryWeight = (weights[categoryType] || 0) * 100;
    }
  });
  
  // Count all items by category from allCourseItems
  const categoryItemCounts = {};
  allCourseItems.forEach(courseItem => {
    const categoryType = courseItem.type || 'lesson';
    categoryItemCounts[categoryType] = (categoryItemCounts[categoryType] || 0) + 1;
    
    // Initialize category if it doesn't exist
    if (!enhanced[categoryType]) {
      enhanced[categoryType] = {
        score: 0,
        total: 0,
        attemptedScore: 0,
        attemptedTotal: 0,
        attemptedCount: 0,
        totalCount: 0,
        percentage: 0,
        attemptedPercentage: null,
        completionPercentage: 0,
        items: [],
        categoryWeight: 0,
        totalItemCount: 0
      };
    }
  });
  
  // Update completion percentages and total item counts (don't recalculate percentages - trust gradeCalculations.js)
  Object.entries(enhanced).forEach(([categoryType, categoryData]) => {
    const totalItemsInCategory = categoryItemCounts[categoryType] || 0;
    categoryData.totalItemCount = totalItemsInCategory;
    
    // Update the totalCount if the course structure has more items
    const originalTotalCount = categoryData.totalCount;
    if (totalItemsInCategory > originalTotalCount) {
      categoryData.totalCount = totalItemsInCategory;
    }
    
    // Recalculate completion percentage with the updated total count
    if (categoryData.completedCount !== undefined) {
      categoryData.completionPercentage = totalItemsInCategory > 0 ? 
        (categoryData.completedCount / totalItemsInCategory) * 100 : 0;
    }
      
  });
  
  return enhanced;
};

const calculateCourseItemStats = (course, allCourseItems = [], studentEmail = null) => {
  // Use allCourseItems passed from parent for consistency with navigation and progress
  // Process ALL course items (lessons, assignments, exams, labs, etc.) not just lessons
  
  if (allCourseItems.length === 0) {
    return {
      total: 0,
      completed: 0,
      completionPercentage: 0
    };
  }
  
  // Count completed items using session-aware completion check
  const completedCount = allCourseItems.filter(courseItem => {
    return checkLessonCompletion(courseItem.itemId, course, studentEmail);
  }).length;
  
  const total = allCourseItems.length;
  const completionPercentage = total > 0 ? (completedCount / total) * 100 : 0;
  
  return {
    total,
    completed: completedCount,
    completionPercentage
  };
};

// Export utility functions for use in parent components
export { getLastActivityTime, getRelativeTime };

export default GradebookSummary;