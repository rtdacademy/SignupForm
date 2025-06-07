import React from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const WelcometoRTDAcademy = ({ courseId }) => {
  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-bold mb-4">Welcome to RTD Academy</h1>
        <p className="text-gray-600 mb-6">Introduction to RTD Academy, mission, and learning environment</p>
      </section>

      {/* Add your lesson content here */}
      <section>
        <h2 className="text-2xl font-semibold mb-3">Content</h2>
        <p>Lesson content goes here...</p>
      </section>

      
    </div>
  );
};

export default WelcometoRTDAcademy;