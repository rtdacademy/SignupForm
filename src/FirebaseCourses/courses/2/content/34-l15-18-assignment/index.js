import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L1518Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l15_18',
    activityType: 'assignment',
    title: 'L15-18 Assignment - Electric Fields and Potential',
    description: 'Comprehensive assessment covering electric fields, electric potential, work, and parallel plate capacitors. Includes problems on point charges, spheres, Millikan oil drop experiments, and energy calculations.',
    timeLimit: 90, // 90 minutes as requested
    questions: [
      {
        questionId: 'course2_34_l1518_question1',
        type: 'multiple-choice',
        title: 'Electric Field from Point Charge',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question2',
        type: 'multiple-choice',
        title: 'Charged Sphere Electric Field',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question3',
        type: 'multiple-choice',
        title: 'Electric Field from Force',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question4',
        type: 'multiple-choice',
        title: 'Proton Acceleration',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question5',
        type: 'multiple-choice',
        title: 'Work and Potential Difference',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question6',
        type: 'multiple-choice',
        title: 'Electron Speed from Potential',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question7',
        type: 'multiple-choice',
        title: 'Aluminum Nucleus Acceleration',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question8',
        type: 'multiple-choice',
        title: 'Parallel Plates Acceleration',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question9',
        type: 'multiple-choice',
        title: 'Work Parallel to Plates',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question10',
        type: 'multiple-choice',
        title: 'Work Perpendicular to Plates',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question11',
        type: 'multiple-choice',
        title: 'Oil Drop with Upward Acceleration',
        points: 1
      },
      {
        questionId: 'course2_34_l1518_question12',
        type: 'multiple-choice',
        title: 'Millikan Oil Drop Stationary',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers electric fields, electric potential, and related concepts from Lessons 15-18.',
      'Use appropriate physics formulas including E = kq/r², V = W/q, and F = qE.',
      'Pay careful attention to units and significant figures in your calculations.',
      'You have 90 minutes to complete this assignment.',
      'Your progress will be saved automatically as you work.',
      'You can review and change your answers before final submission.'
    ],
    passingGrade: 70,
    maxAttempts: 1,
    examMode: true // Enable exam session manager
  };

  return (
    <AssessmentSession
      courseId={courseId}
      studentEmail={studentEmail}
      assessmentConfig={assessmentConfig}
      course={course}
      activityType="assignment"
    />
  );
};

export default L1518Assignment;