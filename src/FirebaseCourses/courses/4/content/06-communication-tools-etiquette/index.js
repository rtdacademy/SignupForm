import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const CommunicationToolsEtiquette = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Communication Tools & Etiquette</h1>
        <p className="text-gray-600 mb-6">Effective use of communication tools and proper online etiquette</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
      {/* Assessment */}
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="06_communication_tools_etiquette_practice"
        cloudFunctionName="course4_06_communication_tools_etiquette_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};

export default CommunicationToolsEtiquette;