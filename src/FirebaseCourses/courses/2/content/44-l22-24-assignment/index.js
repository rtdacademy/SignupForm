import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L2224Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l22_24',
    activityType: 'assignment',
    title: 'L22-24 Assignment - Electromagnetic Induction',
    description: 'Electromagnetic induction, Lenz\'s law, motional EMF, AC generators, and electromagnetic radiation. Covers induced current direction, EMF calculations, power in circuits, and wave properties.',
    timeLimit: 70, // 70 minutes
    questions: [
      {
        questionId: 'course2_44_l2224_question1',
        type: 'multiple-choice',
        title: 'Induced Current Direction - Coil',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question2',
        type: 'multiple-choice',
        title: 'Conductor Polarity - Current Flow',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question3',
        type: 'multiple-choice',
        title: 'Conductor End Polarity',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question4',
        type: 'multiple-choice',
        title: 'Motional EMF and Current Calculation',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question5',
        type: 'multiple-choice',
        title: 'AC Generator Power Calculation',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question6',
        type: 'multiple-choice',
        title: 'Electromagnetic Radiation Nature',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question7',
        type: 'multiple-choice',
        title: 'Wavelength in Different Media',
        points: 1
      },
      {
        questionId: 'course2_44_l2224_question8',
        type: 'multiple-choice',
        title: 'Microwave Interference Pattern',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers electromagnetic induction concepts from Lessons 22-24.',
      'Topics include Lenz\'s law, motional EMF, AC generators, and electromagnetic radiation.',
      'Apply Lenz\'s law to determine the direction of induced currents.',
      'Use the right-hand rule for motional EMF and current direction.',
      'Apply formulas: EMF = BLv, P = V²/R, λ = λ₀/n, f = c/λ.',
      'Pay attention to units and significant figures in calculations.',
      'You have 70 minutes to complete this assignment.',
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

export default L2224Assignment;