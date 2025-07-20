import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession.js';

const L112CumulativeAssignment = () => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_12_cumulative',
    activityType: 'assignment',
    title: 'L1-12 Cumulative Assignment',
    description: 'Comprehensive assessment covering key concepts from Lessons 1-12, including momentum, optics, interference, and diffraction gratings.',
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

export default L112CumulativeAssignment;
