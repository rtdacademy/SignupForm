import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L14CumulativeAssignment = ({ courseId, studentEmail }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_4_cumulative',
    activityType: 'assignment',
    title: 'L1-4 Cumulative Assignment - Momentum and Impulse',
    description: 'Comprehensive assessment covering all concepts from Lessons 1-4: momentum conservation, collisions, impulse, and problem-solving applications.',
    timeLimit: 60, // 60 minutes for cumulative assignment
    questions: [
      {
        questionId: 'course2_08_l14_question1',
        type: 'multiple-choice',
        title: 'Sled and Susan Problem',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question2',
        type: 'multiple-choice',
        title: 'Baseball Hitting Distance',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question3',
        type: 'multiple-choice',
        title: 'Hammer and Nail Impulse',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question4',
        type: 'multiple-choice',
        title: 'Hockey Puck Slap Shot',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question5',
        type: 'multiple-choice',
        title: 'Skier Friction Problem',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question6',
        type: 'multiple-choice',
        title: 'Inelastic Collision - Combined Mass',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question7',
        type: 'multiple-choice',
        title: 'Rifle Recoil Velocity',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question8',
        type: 'multiple-choice',
        title: 'Railroad Car Collision',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question9',
        type: 'multiple-choice',
        title: 'Three-Part Explosion',
        points: 1
      },
      {
        questionId: 'course2_08_l14_question10',
        type: 'multiple-choice',
        title: 'Force-Impulse Data Analysis',
        points: 1
      }
    ],
    instructions: [
      'This cumulative assignment has a 60-minute time limit, but you can exit and return as needed.',
      'Questions cover all topics from Lessons 1-4.',
      'Use appropriate physics formulas and show clear reasoning.',
      'Pay careful attention to units and vector directions.',
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

export default L14CumulativeAssignment;
