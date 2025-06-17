/**
 * Enhanced Course Router - Unified course rendering with optional wrapper
 * 
 * This component eliminates duplication between StaffCourseWrapper and CourseRouter
 * by providing a single source of truth for course rendering logic.
 * 
 * Features:
 * - Single place for course imports and routing logic
 * - Support for wrapped (with navigation) and unwrapped (content only) modes
 * - Staff-specific features when in staff mode
 * - Clean separation of concerns
 */

import React, { lazy, Suspense, useState, useCallback, useMemo } from 'react';
import FirebaseCourseWrapper from './FirebaseCourseWrapperImproved';

// Import course components (using dynamic imports for code splitting)
const PHY30Course = lazy(() => import('./courses/PHY30'));
const Course2 = lazy(() => import('./courses/2'));
const Course3 = lazy(() => import('./courses/3'));
const Course4 = lazy(() => import('./courses/4'));
const Course100 = lazy(() => import('./courses/100'));

// Course structure is now loaded from database via gradebook
// No need for static JSON imports

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

/**
 * Enhanced Course Router with flexible rendering modes
 * 
 * @param {Object} props
 * @param {Object} props.course - Course data object
 * @param {boolean} props.isStaffView - Whether this is a staff view
 * @param {boolean} props.devMode - Developer mode flag
 * @param {string} props.renderMode - Rendering mode: 'wrapped' (default), 'content-only', or 'custom-wrapper'
 * @param {string} props.externalActiveItemId - External control of active item
 * @param {function} props.externalOnItemSelect - External item selection handler
 * @param {function} props.customWrapper - Custom wrapper component for 'custom-wrapper' mode
 * @param {Object} props.wrapperProps - Additional props to pass to the wrapper
 */
const CourseRouterEnhanced = ({ 
  course, 
  isStaffView = false, 
  devMode = false,
  renderMode = 'wrapped', // 'wrapped', 'content-only', or 'custom-wrapper'
  externalActiveItemId = null,
  externalOnItemSelect = null,
  customWrapper = null,
  wrapperProps = {}
}) => {
  const courseId = course.CourseID;
  const [internalCurrentItemId, setInternalCurrentItemId] = useState(null);

  // Use external navigation state if provided, otherwise use internal state
  const currentItemId = externalActiveItemId !== null ? externalActiveItemId : internalCurrentItemId;
  
  // Handle item selection from navigation
  const handleItemSelect = useCallback((itemId) => {
    console.log('CourseRouterEnhanced: Selected item:', itemId);
    if (externalOnItemSelect) {
      // Use external handler if provided
      externalOnItemSelect(itemId);
    } else {
      // Use internal state management
      setInternalCurrentItemId(itemId);
    }
  }, [externalOnItemSelect]);

  // Course structure now comes from database via gradebook
  // The course object already contains the structure from gradebook initialization
  const enhancedCourse = useMemo(() => {
    // Check if course structure exists in gradebook
    if (course?.Gradebook?.courseStructure) {
      return {
        ...course,
        courseStructure: course.Gradebook.courseStructure
      };
    }
    
    // If no structure available, show error instead of fallback
    if (!course?.Gradebook?.courseStructure) {
      console.warn(`No course structure found in gradebook for course ${courseId}. Gradebook may not be initialized.`);
    }
    
    return course;
  }, [course, courseId]);

  // This will dynamically render course components based on CourseID
  const renderCourseContent = useCallback(() => {
    const courseProps = {
      course: enhancedCourse,
      activeItemId: currentItemId,
      onItemSelect: handleItemSelect,
      isStaffView,
      devMode,
      gradebookItems: enhancedCourse?.Gradebook?.items || enhancedCourse?.Assessments || {}
    };

    switch(courseId) {
      case 0: // PHY30
      case '0':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <PHY30Course {...courseProps} />
          </Suspense>
        );
      
      case 2: // Physics 30
      case '2':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course2 {...courseProps} />
          </Suspense>
        );
      
      case 3: // Financial Literacy
      case '3':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course3 {...courseProps} />
          </Suspense>
        );
      
      case 4: // COM1255
      case '4':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course4 {...courseProps} />
          </Suspense>
        );
      
      case 100: // Sample Course
      case '100':
        return (
          <Suspense fallback={<LoadingCourse />}>
            <Course100 {...courseProps} />
          </Suspense>
        );
      
      default:
        return <TemplateCourse course={course} />;
    }
  }, [courseId, enhancedCourse, currentItemId, handleItemSelect, isStaffView, devMode]);

  // Render based on the specified mode
  switch (renderMode) {
    case 'content-only':
      // Just the course content, no wrapper
      return renderCourseContent();

    case 'custom-wrapper':
      // Use a custom wrapper component
      if (!customWrapper) {
        console.error('Custom wrapper mode selected but no customWrapper provided');
        return renderCourseContent();
      }
      const CustomWrapper = customWrapper;
      return (
        <CustomWrapper
          course={enhancedCourse}
          activeItemId={currentItemId}
          onItemSelect={handleItemSelect}
          {...wrapperProps}
        >
          {renderCourseContent()}
        </CustomWrapper>
      );

    case 'wrapped':
    default:
      // Use the default FirebaseCourseWrapper
      return (
        <FirebaseCourseWrapper
          course={enhancedCourse}
          activeItemId={currentItemId}
          onItemSelect={handleItemSelect}
          isStaffView={isStaffView}
          devMode={devMode}
        >
          {renderCourseContent()}
        </FirebaseCourseWrapper>
      );
  }
};

// Export the enhanced version
export default CourseRouterEnhanced;
export { LoadingCourse };