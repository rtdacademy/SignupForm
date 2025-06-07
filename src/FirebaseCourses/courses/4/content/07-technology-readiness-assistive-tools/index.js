import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const TechnologyReadinessAssistiveTools = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Technology Readiness & Assistive Tools</h1>
        <p className="text-gray-600 mb-6">Ensuring technology readiness and understanding available assistive tools</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="07_technology_readiness_assistive_tools_practice"
        cloudFunctionName="course4_07_technology_readiness_assistive_tools_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default TechnologyReadinessAssistiveTools;