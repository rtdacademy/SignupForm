import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L1921Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l19_21',
    activityType: 'assignment',
    title: 'L19-21 Assignment - Magnetism',
    description: 'Magnetic forces, fields, and the motor effect. Covers Left Hand Rule, Right Hand Rule, charged particle motion, and conductor forces in magnetic fields.',
    timeLimit: 60, // 60 minutes as requested
    questions: [
      {
        questionId: 'course2_39_l1921_question1',
        type: 'multiple-choice',
        title: 'Compass and Magnetic Field - Electron Flow',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question2',
        type: 'multiple-choice',
        title: 'Moving Charge - Magnetic Field Direction',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question3',
        type: 'multiple-choice',
        title: 'Coil Magnetic Field - Electron Flow',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question4',
        type: 'multiple-choice',
        title: 'Proton Deflection in Magnetic Field',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question5',
        type: 'multiple-choice',
        title: 'Magnetic Field Strength Calculation',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question6',
        type: 'multiple-choice',
        title: 'Conductor Movement - Current Direction',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question7',
        type: 'multiple-choice',
        title: 'Current Direction from Force',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question8',
        type: 'multiple-choice',
        title: 'Conductor Force Calculation',
        points: 1
      },
      {
        questionId: 'course2_39_l1921_question9',
        type: 'multiple-choice',
        title: 'Conductor Force with Angle Calculation',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers magnetism concepts from Lessons 19-21.',
      'Topics include magnetic fields, charged particle motion, and the motor effect.',
      'Use the Left Hand Rule for electron flow and negative charges.',
      'Use the Right Hand Rule for conventional current and positive charges.',
      'Pay attention to directions and apply the appropriate physics formulas.',
      'You have 60 minutes to complete this assignment.',
      'You can attempt each question up to 3 times to improve your understanding.',
      'Your progress will be saved automatically as you work.'
    ],
    passingGrade: 70,
    maxAttempts: 3,
    examMode: false // Regular assignment mode with immediate feedback
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

export default L1921Assignment;