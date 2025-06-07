import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const CellPhonePolicyExamProctoringProcedures = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Cell Phone Policy & Exam Proctoring Procedures</h1>
        <p className="text-gray-600 mb-6">Cell phone policies during exams and proctoring procedures</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="08_cell_phone_policy_exam_proctoring_practice"
        cloudFunctionName="course4_08_cell_phone_policy_exam_proctoring_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default CellPhonePolicyExamProctoringProcedures;