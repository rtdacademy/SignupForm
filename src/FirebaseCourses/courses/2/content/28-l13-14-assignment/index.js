import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L1314Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l13_14',
    activityType: 'assignment',
    title: 'L13-14 Assignment - Electrostatics',
    description: 'Assessment covering fundamental concepts of electrostatics including static charge, conductors vs. insulators, charge distribution, Coulomb\'s Law, and basic electrostatic calculations.',
    questions: [
      {
        questionId: 'course2_28_l1314_question1',
        type: 'multiple-choice',
        title: 'Conductors vs Insulators',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question2',
        type: 'multiple-choice',
        title: 'Charge Calculation - Electron Deficit',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question3',
        type: 'multiple-choice',
        title: 'Electroscope Charge Detection',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question4',
        type: 'multiple-choice',
        title: 'Solid vs Hollow Sphere Charge Capacity',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question5',
        type: 'multiple-choice',
        title: 'Charge Sharing Between Spheres',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question6',
        type: 'multiple-choice',
        title: 'Charging Methods - Contact and Induction',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question7',
        type: 'multiple-choice',
        title: 'Coulomb\'s Law Calculation',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question8',
        type: 'multiple-choice',
        title: 'Force Changes with Distance and Charge',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question9',
        type: 'multiple-choice',
        title: 'Finding Unknown Charges',
        points: 1
      },
      {
        questionId: 'course2_28_l1314_question10',
        type: 'multiple-choice',
        title: 'Electric Force and Acceleration',
        points: 1
      }
    ],
    instructions: [
      'Read each question carefully and consider the fundamental principles of electrostatics.',
      'For calculation problems, pay attention to units and significant figures.',
      'Remember that like charges repel and opposite charges attract.',
      'Use Coulomb\'s Law: F = k|q₁q₂|/r² for electric force calculations.',
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
      course={course}
      activityType="assignment"
    />
  );
};

export default L1314Assignment;