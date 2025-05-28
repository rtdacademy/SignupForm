import React, { lazy, Suspense, useState, useCallback } from 'react';
import FirebaseCourseWrapper from './FirebaseCourseWrapperImproved';

// Import course components
// Using dynamic imports for better code splitting
const COM1255Course = lazy(() => import('./courses/COM1255'));
const Course2 = lazy(() => import('./courses/2'));

// Default template course component for courses without specific implementations
const TemplateCourse = ({ course }) => {
  const courseTitle = course.Course?.Value || course.courseDetails?.Title || '';
  const courseId = course.CourseID;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">{courseTitle}</h1>
      <p className="text-gray-600">
        Course content for ID {courseId} is being developed. Check back soon!
      </p>
    </div>
  );
};

// Loading component for Suspense fallback
const LoadingCourse = () => (
  <div className="p-8 flex justify-center items-center">
    <div className="text-center">
      <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
      <p className="mt-4 text-gray-600">Loading course content...</p>
    </div>
  </div>
);

// This will be our main router component that loads specific course implementations
// based on the CourseID or falls back to a template implementation
const CourseRouter = ({ course, isStaffView = false, devMode = false }) => {
  const courseId = course.CourseID;
  const [currentItemId, setCurrentItemId] = useState(null);

  // Handle item selection from navigation
  const handleItemSelect = useCallback((itemId) => {
    console.log('CourseRouter: Selected item:', itemId);
    setCurrentItemId(itemId);
  }, []);

  // This will dynamically render course components based on CourseID
  const renderCourseContent = () => {
    // Map courseId to the appropriate component
    switch(courseId) {
      case 1: // COM1255
      case '1':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <COM1255Course
              course={course}
              activeItemId={currentItemId}
              onItemSelect={handleItemSelect}
              isStaffView={isStaffView}
              devMode={devMode}
            />
          </Suspense>
        );
      case 2: // Physics 30
      case '2':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course2
              course={course}
              activeItemId={currentItemId}
              onItemSelect={handleItemSelect}
              isStaffView={isStaffView}
              devMode={devMode}
            />
          </Suspense>
        );
      default:
        return <TemplateCourse course={course} />;
    }
  };

  return (
    <FirebaseCourseWrapper
      course={course}
      activeItemId={currentItemId}
      onItemSelect={handleItemSelect}
    >
      {renderCourseContent()}
    </FirebaseCourseWrapper>
  );
};

export default CourseRouter;