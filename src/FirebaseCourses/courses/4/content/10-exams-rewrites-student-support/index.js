import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const ExamsRewritesStudentSupportResources = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Exams, Rewrites & Student Support Resources</h1>
        <p className="text-gray-600 mb-6">Understanding exam procedures, rewrite policies, and accessing student support</p>
        <p className="text-sm text-blue-600">Estimated Time: 60 minutes</p>
      </section>

      {/* Assignment Instructions */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Instructions</h2>
        <p>Assignment instructions go here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="10_exams_rewrites_student_support_assessment"
        cloudFunctionName="course4_10_exams_rewrites_student_support_aiQuestion"
        title="Exams, Rewrites & Student Support Resources"
        theme="green"
      />
    </div>
  );
};

export default ExamsRewritesStudentSupportResources;