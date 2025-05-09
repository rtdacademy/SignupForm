import React from 'react';
import { useParams } from 'react-router-dom';
import FirebaseCourseWrapper from './FirebaseCourseWrapper';

// This will be our main router component that loads specific course implementations
// based on the CourseID or falls back to a template implementation
const CourseRouter = ({ course }) => {
  const courseId = course.CourseID;
  const courseTitle = course.Course?.Value || course.courseDetails?.Title || '';
  
  // This will dynamically render course components based on CourseID
  // As we develop more courses, we can import and include them here
  const renderCourseContent = () => {
    // In the future, we'll implement specific course components and import them
    // For now, we'll use a placeholder
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">{courseTitle}</h1>
        <p className="text-gray-600">
          Course content for ID {courseId} is being developed. Check back soon!
        </p>
      </div>
    );
  };

  return (
    <FirebaseCourseWrapper course={course}>
      {renderCourseContent()}
    </FirebaseCourseWrapper>
  );
};

export default CourseRouter;