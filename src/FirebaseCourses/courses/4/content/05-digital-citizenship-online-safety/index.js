import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const DigitalCitizenshipOnlineSafety = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Digital Citizenship & Online Safety</h1>
        <p className="text-gray-600 mb-6">Best practices for digital citizenship and maintaining online safety</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="05_digital_citizenship_online_safety_practice"
        cloudFunctionName="course4_05_digital_citizenship_online_safety_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default DigitalCitizenshipOnlineSafety;