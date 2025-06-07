import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const TimeManagementStayingActiveinYourCourse = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Time Management & Staying Active in Your Course</h1>
        <p className="text-gray-600 mb-6">Strategies for effective time management and maintaining course engagement</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="03_time_management_staying_active_practice"
        cloudFunctionName="course4_03_time_management_staying_active_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default TimeManagementStayingActiveinYourCourse;