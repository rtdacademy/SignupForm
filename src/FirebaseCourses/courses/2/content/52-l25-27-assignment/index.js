import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L2527Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l25_27',
    activityType: 'assignment',
    title: 'L25-27 Assignment - Cathode Rays and Rutherford Model',
    description: 'Assessment covering cathode ray properties, quantitative calculations, and Rutherford\'s atomic model. Topics include electron discovery, velocity selectors, charge-to-mass ratios, alpha particle experiments, and atomic structure.',
    timeLimit: 60, // 60 minutes
    questions: [
      {
        questionId: 'course2_52_l2527_question1',
        type: 'multiple-choice',
        title: 'Cathode Ray Theory',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question2',
        type: 'multiple-choice',
        title: 'Cathode Ray Velocity',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question3',
        type: 'multiple-choice',
        title: 'Charge-to-Mass Ratio',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question4',
        type: 'multiple-choice',
        title: 'Particle Charge Calculation',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question5',
        type: 'multiple-choice',
        title: 'Alpha Particle Electric Field',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question6',
        type: 'multiple-choice',
        title: 'Rutherford Model Explanation',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question7',
        type: 'multiple-choice',
        title: 'Maxwell Theory and Electrons',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question8',
        type: 'multiple-choice',
        title: 'Atomic Structure Dimensions',
        points: 1
      },
      {
        questionId: 'course2_52_l2527_question9',
        type: 'multiple-choice',
        title: 'Rutherford Experiment Analysis',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers atomic theory concepts from Lessons 25-27.',
      'Topics include cathode ray experiments, velocity selectors, and Rutherford\'s atomic model.',
      'Apply formulas: v = E/B (velocity selector), q/m = v²/(rB²), E = vB.',
      'Use Lenz\'s law and the right-hand rule for electromagnetic effects.',
      'Understand the historical development of atomic models.',
      'Pay attention to scientific notation and significant figures.',
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

export default L2527Assignment;
