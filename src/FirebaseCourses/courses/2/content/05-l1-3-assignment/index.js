import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L13Assignment = ({ courseId, studentEmail }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_3',
    activityType: 'assignment',
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
      'This assignment has a 80-minute time limit, but you can exit and return as needed.',
      'Use appropriate physics formulas for momentum and impulse calculations.',
      'Pay attention to vector directions (positive/negative, angles).',
      'Show your understanding of momentum conservation principles.',
      'Your progress will be saved automatically as you work.',
      'You can review and change your answers before final submission.'
    ],
    passingGrade: 70
  };

  return (
    <AssessmentSession
      courseId={courseId}
      studentEmail={studentEmail}
      assessmentConfig={assessmentConfig}
      activityType="assignment"
    />
  );
};

export default L13Assignment;
