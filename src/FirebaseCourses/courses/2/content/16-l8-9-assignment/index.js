import React, { useState } from 'react';
import ExamSession from '../../../../components/ExamSession.js';

const L89Assignment = () => {
  const [showExam, setShowExam] = useState(false);

  const examConfig = {
    examId: 'l8-9-assignment',
    timeLimit: 60, // 60 minutes
    questions: [
      {
        questionId: 'course2_16_l89_question1',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question2',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question3',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question4',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question5',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question6',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question7',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_16_l89_question8',
        type: 'standard-multiple-choice',
        points: 1
      }
    ]
  };

  const handleExamComplete = (results) => {
    console.log('Exam completed:', results);
    setShowExam(false);
  };

  const handleExamExit = () => {
    setShowExam(false);
  };

  if (showExam) {
    return (
      <ExamSession
        courseId="2"
        examConfig={examConfig}
        onExamComplete={handleExamComplete}
        onExamExit={handleExamExit}
      />
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">L8-9 Assignment: Refraction and Lenses</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          This assignment covers key concepts from Lessons 8 and 9, including Snell's law, 
          critical angles, total internal reflection, and lens equations.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Assignment Overview</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 8 multiple choice questions</li>
            <li>• Topics: Refraction, critical angles, lens calculations</li>
            <li>• Time limit: 60 minutes</li>
            <li>• 1 attempt allowed</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Key Formulas to Remember</h3>
          <div className="text-amber-700 space-y-2">
            <p><strong>Snell's Law:</strong> n₁sin(θ₁) = n₂sin(θ₂)</p>
            <p><strong>Critical Angle:</strong> sin(θc) = n₂/n₁</p>
            <p><strong>Lens Equation:</strong> 1/f = 1/dₒ + 1/dᵢ</p>
            <p><strong>Magnification:</strong> m = -dᵢ/dₒ = hᵢ/hₒ</p>
          </div>
        </div>

        <button
          onClick={() => setShowExam(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Start Assignment
        </button>
      </div>
    </div>
  );
};

export default L89Assignment;
