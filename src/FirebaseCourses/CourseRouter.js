/**
 * Course Router - Routes students to specific course implementations
 * 
 * This is now a lightweight wrapper around CourseRouterEnhanced for backward compatibility.
 * For new implementations, consider using CourseRouterEnhanced directly.
 * 
 * HOW TO ADD A NEW COURSE:
 * Add your course in CourseRouterEnhanced.js following the same pattern.
 */

import React from 'react';
import CourseRouterEnhanced from './CourseRouterEnhanced';

/**
 * CourseRouter - Backward compatibility wrapper
 * 
 * This component maintains backward compatibility with existing code
 * while delegating all functionality to CourseRouterEnhanced.
 * 
 * For new implementations, use CourseRouterEnhanced directly.
 */
const CourseRouter = ({ 
  course, 
  isStaffView = false, 
  devMode = false,
  externalActiveItemId = null,
  externalOnItemSelect = null,
  contentOnly = false
}) => {
  /* Debug logging for course object
  console.log('🎯 CourseRouter.js - Course object received:', {
    courseId: course?.CourseID,
    gradebook: course?.Gradebook,
    gradebookItems: course?.Gradebook?.items,
    assessments: course?.Grades?.assessments,
    timestamp: new Date().toLocaleTimeString()
  });
  */

  // Determine render mode based on contentOnly prop
  const renderMode = contentOnly ? 'content-only' : 'wrapped';

  // Delegate to CourseRouterEnhanced
  return (
    <CourseRouterEnhanced
      course={course}
      isStaffView={isStaffView}
      devMode={devMode}
      renderMode={renderMode}
      externalActiveItemId={externalActiveItemId}
      externalOnItemSelect={externalOnItemSelect}
    />
  );
};

export default CourseRouter;