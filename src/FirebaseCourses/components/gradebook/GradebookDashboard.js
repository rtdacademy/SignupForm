import React from 'react';
import GradebookDashboardRealtime from './GradebookDashboardRealtime';

const GradebookDashboard = ({ course, profile, lessonAccessibility = {}, showHeader = true }) => {
  // Always use the realtime implementation
  return (
    <GradebookDashboardRealtime 
      course={course} 
      profile={profile} 
      lessonAccessibility={lessonAccessibility}
      showHeader={showHeader}
    />
  );
};

export default GradebookDashboard;