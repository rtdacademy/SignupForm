import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L2830Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l28_30',
    activityType: 'assignment',
    title: 'L28-30 Assignment - Quantum Effects',
    description: 'Assessment covering quantum theory, photoelectric effect, work functions, and atomic energy levels. Topics include Planck\'s equation, photon energy and wavelength calculations, Frank-Hertz experiment analysis, and spectral line emissions.',
    timeLimit: 60, // 60 minutes
    questions: [
      {
        questionId: 'course2_59_l2830_question1',
        type: 'multiple-choice',
        title: 'Quantum Energy Calculation',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question2',
        type: 'multiple-choice',
        title: 'Photon Wavelength',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question3',
        type: 'multiple-choice',
        title: 'Work Function Calculation',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question4',
        type: 'multiple-choice',
        title: 'Photoelectron Speed',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question5',
        type: 'multiple-choice',
        title: 'Stopping Voltage',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question6',
        type: 'multiple-choice',
        title: 'Energy Level Transitions',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question7',
        type: 'multiple-choice',
        title: 'Absorption Wavelengths',
        points: 1
      },
      {
        questionId: 'course2_59_l2830_question8',
        type: 'multiple-choice',
        title: 'Emission Spectral Lines',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers quantum theory concepts from Lessons 28-30.',
      'Topics include Planck\'s quantum hypothesis, photoelectric effect, and atomic energy levels.',
      'Apply formulas: E = hf, λ = hc/E, φ = hf₀, KE = E - φ, V = KE/e.',
      'Use the convenient conversion: λ(nm) = 1240/E(eV) for photon wavelength calculations.',
      'Analyze Frank-Hertz experiment data to determine energy level transitions.',
      'Calculate emission and absorption wavelengths from energy differences.',
      'Pay attention to units: convert between Joules and electron volts as needed.',
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

export default L2830Assignment;
