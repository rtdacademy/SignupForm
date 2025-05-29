import React, { lazy, Suspense, useState, useCallback } from 'react';
import FirebaseCourseWrapper from './FirebaseCourseWrapperImproved';

// Import course components
// Using dynamic imports for better code splitting
const COM1255Course = lazy(() => import('./courses/COM1255'));
const PHY30Course = lazy(() => import('./courses/PHY30'));
const Course2 = lazy(() => import('./courses/2'));
const Course100 = lazy(() => import('./courses/100'));


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
          </Suspense>        );      
      case 2: // PHY30
      case '2':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <PHY30Course
              course={course}
              activeItemId={currentItemId}
              onItemSelect={handleItemSelect}
              isStaffView={isStaffView}
              devMode={devMode}
            />
          </Suspense>
        );
      case 2: // 2
      case '2':
        // Import course structure JSON directly for Firebase courses
        const courseStructureData2 = require('./courses/2/course-structure.json');
        const courseWithStructure2 = {
          ...course,
          courseStructure: {
            title: "Physics 30",
            structure: courseStructureData2.courseStructure?.units || []
          }
        };
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course2
              course={courseWithStructure2}
              activeItemId={currentItemId}
              onItemSelect={handleItemSelect}
              isStaffView={isStaffView}
              devMode={devMode}
            />
          </Suspense>
        );
            case 100: // 100
      case '100':
        // Import course structure JSON directly for Firebase courses
        const courseStructureData100 = require('./courses/100/course-structure.json');
        const courseWithStructure100 = {
          ...course,
          courseStructure: {
            title: "Sample Course",
            structure: courseStructureData100.courseStructure?.units || []
          }
        };
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course100
              course={courseWithStructure100}
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

  // Get the enhanced course from renderCourseContent
  const { content, enhancedCourse } = (() => {
    const content = renderCourseContent();
    
    // Extract the enhanced course based on courseId
    let enhanced = course;
    switch(courseId) {
      case 2:
      case '2':
        const courseStructureData2 = require('./courses/2/course-structure.json');
        enhanced = {
          ...course,
          courseStructure: {
            title: "Physics 30",
            structure: courseStructureData2.courseStructure?.units || []
          }
        };
        break;
      case 100:
      case '100':
        const courseStructureData100 = require('./courses/100/course-structure.json');
        enhanced = {
          ...course,
          courseStructure: {
            title: "Sample Course",
            structure: courseStructureData100.courseStructure?.units || []
          }
        };
        break;
    }
    
    return { content, enhancedCourse: enhanced };
  })();

  return (
    <FirebaseCourseWrapper
      course={enhancedCourse}
      activeItemId={currentItemId}
      onItemSelect={handleItemSelect}
    >
      {content}
    </FirebaseCourseWrapper>
  );
};

export default CourseRouter;