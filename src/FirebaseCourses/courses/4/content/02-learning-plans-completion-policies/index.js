import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const LearningPlansCourseCompletionDiplomaExamPolicies = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Learning Plans, Course Completion & Diploma Exam Policies</h1>
        <p className="text-gray-600 mb-6">Understanding learning plans, completion requirements, and diploma exam procedures</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="02_learning_plans_completion_policies_practice"
        cloudFunctionName="course4_02_learning_plans_completion_policies_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default LearningPlansCourseCompletionDiplomaExamPolicies;