import React from 'react';
import FirebaseCourseWrapper from '../../FirebaseCourseWrapperImproved';
import { generateCourseContent } from './content';

const Course4 = ({ course, activeItemId, onItemSelect, isStaffView, devMode }) => {
  return (
    <FirebaseCourseWrapper
      course={course}
      activeItemId={activeItemId}
      onItemSelect={onItemSelect}
      isStaffView={isStaffView}
      devMode={devMode}
      generateContent={generateCourseContent}
    />
  );
};

export default Course4;