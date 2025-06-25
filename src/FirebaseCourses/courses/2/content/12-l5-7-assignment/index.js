import React from 'react';
import ExamSession from '../../../../components/ExamSession';

const L57Assignment = ({ courseId, studentEmail }) => {
  const examConfig = {
    examId: 'exam_l5_7_assignment',
    title: 'L5-7 Assignment - Reflection and Optics',
    description: 'Assessment covering pinhole cameras, speed of light measurements, reflection laws, and curved mirror calculations from Lessons 5-7.',
    timeLimit: 60, // 60 minutes
    questions: [
      {
        questionId: 'course2_12_l57_question1',
        type: 'standard-multiple-choice',
        title: 'Pinhole Camera Calculation',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question2',
        type: 'standard-multiple-choice',
        title: 'Pinhole Camera Image Formation',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question3',
        type: 'standard-multiple-choice',
        title: 'Römer Speed of Light Measurement',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question4',
        type: 'standard-multiple-choice',
        title: 'Michelson Speed of Light Apparatus',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question5',
        type: 'standard-multiple-choice',
        title: 'Angle of Reflection',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question6',
        type: 'standard-multiple-choice',
        title: 'Double Mirror Reflection',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question7',
        type: 'standard-multiple-choice',
        title: 'Concave Mirror Image Distance',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question8',
        type: 'standard-multiple-choice',
        title: 'Convex Mirror Calculation',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question9',
        type: 'standard-multiple-choice',
        title: 'Mirror Type Identification',
        points: 1
      },
      {
        questionId: 'course2_12_l57_question10',
        type: 'standard-multiple-choice',
        title: 'Emergency Vehicle Letters',
        points: 1
      }
    ],
    instructions: [
      'This is a timed assignment with a 60-minute limit.',
      'Use appropriate physics formulas for optics and reflection calculations.',
      'Pay attention to sign conventions for mirrors (concave vs convex).',
      'Remember the law of reflection and mirror equation applications.',
      'All questions must be answered before submitting.',
      'You have only ONE attempt - make sure you are ready before starting.'
    ],
    passingGrade: 70
  };

  return (
    <ExamSession
      courseId={courseId}
      studentEmail={studentEmail}
      examConfig={examConfig}
    />
  );
};

export default L57Assignment;
