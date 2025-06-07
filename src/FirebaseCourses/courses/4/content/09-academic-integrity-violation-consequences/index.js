import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const AcademicIntegrityViolationConsequences = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Academic Integrity & Violation Consequences</h1>
        <p className="text-gray-600 mb-6">Understanding academic integrity standards and consequences of violations</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="09_academic_integrity_violation_consequences_practice"
        cloudFunctionName="course4_09_academic_integrity_violation_consequences_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default AcademicIntegrityViolationConsequences;