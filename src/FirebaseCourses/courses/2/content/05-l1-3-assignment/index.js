import React from 'react';
import ExamSession from '../../../../components/ExamSession';

const L13Assignment = ({ courseId, studentEmail }) => {
  const examConfig = {
    examId: 'exam_l1_3_assignment',
    title: 'L1-3 Assignment - Momentum and Impulse',
    description: 'Assessment covering momentum conservation in one dimension, momentum conservation in two dimensions, and impulse-momentum theorem from Lessons 1-3.',
    timeLimit: 80, // 80 minutes
    questions: [
      {
        questionId: 'course2_05_l13_question1',
        type: 'multiple-choice',
        title: 'Collision Problem - One Dimension',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question2',
        type: 'multiple-choice',
        title: 'Coupled Boxcars Problem',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question3',
        type: 'multiple-choice',
        title: 'Ice Skaters Push-Off Problem',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question4',
        type: 'multiple-choice',
        title: 'Two-Dimensional Collision Problem',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question5',
        type: 'multiple-choice',
        title: 'Inelastic Collision with Angles',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question6',
        type: 'multiple-choice',
        title: 'Rocket Explosion Problem',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question7',
        type: 'multiple-choice',
        title: 'Impulse Calculation',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question8',
        type: 'multiple-choice',
        title: 'Momentum and Impulse from Fall',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question9',
        type: 'multiple-choice',
        title: 'Conservation Law Concepts',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question10',
        type: 'multiple-choice',
        title: 'Collision Change in Momentum',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question11',
        type: 'multiple-choice',
        title: 'Force-Time Graph Interpretation',
        points: 1
      },
      {
        questionId: 'course2_05_l13_question12',
        type: 'multiple-choice',
        title: 'Momentum Relationship',
        points: 1
      }
    ],
    instructions: [
      'This is a timed assignment with a 80-minute limit.',
      'Use appropriate physics formulas for momentum and impulse calculations.',
      'Pay attention to vector directions (positive/negative, angles).',
      'Show your understanding of momentum conservation principles.',
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

export default L13Assignment;
