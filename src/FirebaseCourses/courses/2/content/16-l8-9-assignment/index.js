import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession.js';

const L89Assignment = () => {
  const assessmentConfig = {
    assessmentId: 'assignment_l8_9',
    activityType: 'assignment',
    title: 'L8-9 Assignment - Refraction and Lenses',
    description: 'Assessment covering Snell\'s law, critical angles, total internal reflection, and lens equations from Lessons 8-9.',
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

  const handleAssessmentComplete = (results) => {
    console.log('Assessment completed:', results);
  };

  return (
    <AssessmentSession
      courseId="2"
      assessmentConfig={assessmentConfig}
      activityType="assignment"
      onAssessmentComplete={handleAssessmentComplete}
    />
  );
};

export default L89Assignment;
