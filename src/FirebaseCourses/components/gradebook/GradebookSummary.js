import React from 'react';
import { TrendingUp, TrendingDown, Award, Target } from 'lucide-react';
import { Progress } from '../../../components/ui/progress';
import { 
  validateGradeDataStructures, 
  calculateLessonScore, 
  calculateCategoryScores,
  checkLessonCompletion 
} from '../../utils/gradeCalculations';
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
  const baseCategoryStats = calculateCategoryScores(course, studentEmail);
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
              <span className="text-5xl font-bold text-blue-700">{Math.round(courseItemStats.completionPercentage)}%</span>
            </div>
           
            <div className="mt-3 flex items-center gap-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-600 font-medium">
                {courseItemStats.completed} of {courseItemStats.total} course items completed
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
            <span>{Math.round(courseItemStats.completionPercentage)}%</span>
          </div>
          <Progress 
            value={courseItemStats.completionPercentage} 
            className="h-2"
          />
        </div>
      </div>

      {/* Weighted Course Grade */}
      {overallStats.totalPossible > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-md font-medium text-gray-700">Overall Course Grade</h4>
              <span className="text-3xl font-bold text-purple-700">{Math.round(overallStats.weightedGrade)}%</span>
              <p className="text-sm text-gray-600">
                Weighted by category (assignments: 20%, exams: 60%, labs: 20%, lessons: 0%)
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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Items Completed"
          value={`${courseItemStats.completed} / ${courseItemStats.total}`}
          subtext="Course activities finished"
          color="green"
        />
        <StatCard
          label="Points Earned"
          value={`${overallStats.attemptedPoints} / ${overallStats.attemptedPossible}`}
          subtext="On attempted work"
          color="blue"
        />
        <StatCard
          label="Course Total"
          value={`${overallStats.totalPoints || 0} / ${overallStats.totalPossible || 0}`}
          subtext="All possible points"
          color="purple"
        />
        <StatCard
          label="Last Updated"
          value={getRelativeTime(getLastActivityTime(course))}
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
        </div>
        
        <Progress value={percentage} className="h-1.5" />
        
        <div className="text-xs text-gray-600">
          {data.totalItemCount || 0} items • Weighted: {Math.round(data.weightedScore || 0)}%
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
  let weightedGrade = 0;
  
  // Sum up category data
  Object.entries(categoryStats).forEach(([categoryType, categoryData]) => {
    totalPoints += categoryData.score || 0;
    totalPossible += categoryData.total || 0;
    
    // For attempted calculation, use items that have some score
    const attemptedItems = categoryData.items?.filter(item => item.score > 0 || item.attempted > 0) || [];
    attemptedItems.forEach(item => {
      attemptedPoints += item.score || 0;
      attemptedPossible += item.total || 0;
    });
    
    // Calculate weighted grade
    const weight = (weights[categoryType] || 0);
    const categoryPercentage = categoryData.percentage || 0;
    weightedGrade += (categoryPercentage * weight);
  });
  
  const overallPercentage = totalPossible > 0 ? (totalPoints / totalPossible) * 100 : 0;
  const performancePercentage = attemptedPossible > 0 ? (attemptedPoints / attemptedPossible) * 100 : 0;
  
  return {
    totalPoints,
    totalPossible,
    overallPercentage,
    attemptedPoints,
    attemptedPossible,
    performancePercentage,
    weightedGrade // This is the true course grade using category weights
  };
};

// Enhanced category stats that adds item counts from allCourseItems
const enhanceCategoryStatsWithItemCounts = (categoryStats, allCourseItems = [], weights = {}) => {
  // Add item counts from allCourseItems to the category stats from our utility
  const enhanced = { ...categoryStats };
  
  // Initialize missing categories and add item counts
  Object.keys(weights).forEach(categoryType => {
    if (!enhanced[categoryType]) {
      enhanced[categoryType] = {
        score: 0,
        total: 0,
        percentage: 0,
        items: [],
        categoryWeight: (weights[categoryType] || 0) * 100,
        totalItemCount: 0
      };
    } else {
      enhanced[categoryType].categoryWeight = (weights[categoryType] || 0) * 100;
    }
  });
  
  // Count all items by type from allCourseItems
  allCourseItems.forEach(courseItem => {
    const categoryType = courseItem.type || 'lesson';
    if (!enhanced[categoryType]) {
      enhanced[categoryType] = {
        score: 0,
        total: 0,
        percentage: 0,
        items: [],
        categoryWeight: 0,
        totalItemCount: 0
      };
    }
    enhanced[categoryType].totalItemCount = (enhanced[categoryType].totalItemCount || 0) + 1;
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

export default GradebookSummary;