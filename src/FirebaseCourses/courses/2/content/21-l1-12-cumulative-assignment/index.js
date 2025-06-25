import React, { useState } from 'react';
import ExamSession from '../../../../components/ExamSession.js';

const L112CumulativeAssignment = () => {
  const [showExam, setShowExam] = useState(false);

  const examConfig = {
    examId: 'l1-12-cumulative-assignment',
    timeLimit: 90, // 90 minutes
    questions: [
      {
        questionId: 'course2_21_l112_question1',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question2',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question3',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question4',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question5',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question6',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question7',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question8',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question9',
        type: 'standard-multiple-choice',
        points: 1
      },
      {
        questionId: 'course2_21_l112_question10',
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
      <h1 className="text-3xl font-bold mb-4">L1-12 Cumulative Assignment</h1>
      <div className="prose max-w-none">
        <p className="text-lg mb-6">
          This comprehensive assignment covers key concepts from Lessons 1-12, including momentum, 
          optics, interference, and diffraction gratings.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">Assignment Overview</h3>
          <ul className="text-blue-700 space-y-1">
            <li>• 10 multiple choice questions</li>
            <li>• Topics: Momentum, collisions, optics, mirrors, lenses, interference, diffraction</li>
            <li>• Time limit: 90 minutes</li>
            <li>• 1 attempt allowed</li>
          </ul>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-amber-800 mb-2">Key Formulas to Remember</h3>
          <div className="text-amber-700 space-y-2">
            <p><strong>Momentum:</strong> p = mv</p>
            <p><strong>Conservation of Momentum:</strong> p₁ᵢ + p₂ᵢ = p₁f + p₂f</p>
            <p><strong>Mirror/Lens Equation:</strong> 1/f = 1/dₒ + 1/dᵢ</p>
            <p><strong>Magnification:</strong> m = -dᵢ/dₒ = hᵢ/hₒ</p>
            <p><strong>Critical Angle:</strong> sin(θc) = n₂/n₁</p>
            <p><strong>Double Slit:</strong> y = nλL/d</p>
            <p><strong>Diffraction Grating:</strong> dsinθ = nλ</p>
          </div>
        </div>

        <button
          onClick={() => setShowExam(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
        >
          Start Cumulative Assignment
        </button>
      </div>
    </div>
  );
};

export default L112CumulativeAssignment;
