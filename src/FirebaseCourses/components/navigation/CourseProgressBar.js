import React from 'react';

/**
 * Component to show a progress bar for course completion
 * 
 * @param {Object} props
 * @param {Object} props.progress - Object containing progress data
 * @param {Array} props.courseItems - Array of all course items
 * @param {String} props.className - Additional CSS classes
 */
const CourseProgressBar = ({ progress = {}, courseItems = [], className = '' }) => {
  if (!courseItems || courseItems.length === 0) {
    return null;
  }
  
  // Calculate completed percentage
  const totalItems = courseItems.length;
  const completedItems = Object.values(progress).filter(item => item.completed).length;
  const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex justify-between text-xs text-gray-600">
        <span>Course Progress</span>
        <span>{percentage}% Complete</span>
      </div>
      
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500">
        <span>{completedItems} of {totalItems} items completed</span>
        {percentage === 100 && (
          <span className="text-green-600 font-medium">Course Completed!</span>
        )}
      </div>
    </div>
  );
};

export default CourseProgressBar;