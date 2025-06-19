import React from 'react';
import { AlertTriangle, TrendingUp, BookOpen, Target, RefreshCw, Star } from 'lucide-react';

const StudyRecommendations = ({ course }) => {
  const gradebook = course?.Gradebook || {};
  const categories = gradebook?.categories || {};
  const items = gradebook?.items || {};
  const summary = gradebook?.summary || {};

  const recommendations = generateRecommendations(categories, items, summary);

  if (recommendations.length === 0) {
    return (
      <div className="bg-green-50 rounded-lg p-6 border border-green-100">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-green-600" />
          <div>
            <h4 className="font-medium text-green-800">Great Work!</h4>
            <p className="text-sm text-green-700">You're doing well! Keep up the excellent progress.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="text-md font-medium text-gray-700">Study Recommendations</h4>
      {recommendations.map((rec, index) => (
        <RecommendationCard key={index} recommendation={rec} />
      ))}
    </div>
  );
};

const RecommendationCard = ({ recommendation }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case 'improvement': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'study': return <BookOpen className="h-5 w-5 text-purple-600" />;
      case 'focus': return <Target className="h-5 w-5 text-red-600" />;
      case 'retry': return <RefreshCw className="h-5 w-5 text-yellow-600" />;
      default: return <BookOpen className="h-5 w-5 text-gray-600" />;
    }
  };

  const getCardStyle = (type) => {
    switch (type) {
      case 'warning': return 'bg-orange-50 border-orange-200';
      case 'improvement': return 'bg-blue-50 border-blue-200';
      case 'study': return 'bg-purple-50 border-purple-200';
      case 'focus': return 'bg-red-50 border-red-200';
      case 'retry': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg p-4 border ${getCardStyle(recommendation.type)}`}>
      <div className="flex items-start gap-3">
        {getIcon(recommendation.type)}
        <div className="flex-1">
          <h5 className="font-medium text-gray-800 mb-1">{recommendation.title}</h5>
          <p className="text-sm text-gray-600 mb-2">{recommendation.description}</p>
          {recommendation.actions && recommendation.actions.length > 0 && (
            <div className="space-y-1">
              <div className="text-xs font-medium text-gray-700">Suggested Actions:</div>
              <ul className="text-xs text-gray-600 space-y-1">
                {recommendation.actions.map((action, idx) => (
                  <li key={idx} className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Generate recommendations based on performance data
const generateRecommendations = (categories, items, summary) => {
  const recommendations = [];
  const overallPercentage = summary.percentage > 0 && summary.percentage < 1 ? summary.percentage * 100 : summary.percentage;

  // Overall performance recommendations
  if (overallPercentage < 60) {
    recommendations.push({
      type: 'warning',
      title: 'Below Passing Grade',
      description: `Your current grade is ${Math.round(overallPercentage)}%. You need to reach 60% to pass.`,
      actions: [
        'Focus on completing remaining lessons',
        'Review incorrect answers and explanations',
        'Consider retaking questions if allowed'
      ]
    });
  } else if (overallPercentage < 75) {
    recommendations.push({
      type: 'improvement',
      title: 'Room for Improvement',
      description: `You're passing with ${Math.round(overallPercentage)}%, but there's room to improve.`,
      actions: [
        'Review lessons where you scored below 80%',
        'Complete any remaining optional activities',
        'Make sure you understand key concepts thoroughly'
      ]
    });
  }

  // Category-specific recommendations
  Object.entries(categories).forEach(([categoryType, categoryData]) => {
    const categoryPercentage = categoryData.percentage || 0;
    const categoryItems = categoryData.items || [];
    
    if (categoryPercentage < 70 && categoryItems.length > 0) {
      recommendations.push({
        type: 'focus',
        title: `Improve ${categoryType.charAt(0).toUpperCase() + categoryType.slice(1)} Performance`,
        description: `Your ${categoryType} average is ${Math.round(categoryPercentage)}%. This category has significant room for improvement.`,
        actions: [
          `Review all ${categoryType} materials thoroughly`,
          `Identify specific topics where you're struggling`,
          `Consider additional practice in this area`
        ]
      });
    }
  });

  // Item-specific recommendations
  const failedItems = Object.entries(items).filter(([_, item]) => 
    item.attempts > 0 && item.score < item.maxScore * 0.7
  );

  if (failedItems.length > 0) {
    recommendations.push({
      type: 'retry',
      title: 'Consider Retaking Low-Scoring Questions',
      description: `You have ${failedItems.length} question(s) where you scored below 70%.`,
      actions: [
        'Review the explanations for incorrect answers',
        'Study the related course materials',
        'Retake questions if additional attempts are allowed'
      ]
    });
  }

  // Incomplete items recommendations
  const incompleteItems = Object.entries(items).filter(([_, item]) => 
    item.attempts === 0
  );

  if (incompleteItems.length > 0) {
    recommendations.push({
      type: 'study',
      title: 'Complete Remaining Lessons',
      description: `You have ${incompleteItems.length} question(s) that haven't been started yet.`,
      actions: [
        'Review the course materials for upcoming topics',
        'Start with the earliest lessons you haven\'t completed',
        'Set aside dedicated time to work through remaining content'
      ]
    });
  }

  // Study pattern recommendations
  const recentItems = Object.entries(items)
    .filter(([_, item]) => item.lastAttempt && Date.now() - item.lastAttempt < 7 * 24 * 60 * 60 * 1000)
    .length;

  if (recentItems === 0 && Object.keys(items).length > 0) {
    recommendations.push({
      type: 'study',
      title: 'Stay Active in Your Studies',
      description: 'You haven\'t completed any lessons in the past week.',
      actions: [
        'Set a regular study schedule',
        'Aim to complete at least 2-3 lessons per week',
        'Review previous materials to maintain knowledge retention'
      ]
    });
  }

  return recommendations.slice(0, 4); // Limit to 4 recommendations
};

export default StudyRecommendations;