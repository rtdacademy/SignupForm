import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L134CumulativeAssignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_34',
    activityType: 'assignment',
    title: 'L1-34 Cumulative Assignment - Unit 5 Review',
    description: 'Comprehensive cumulative assessment covering all major topics from Units 1-5. Mixed questions spanning momentum and impulse, optics and wave properties, electromagnetism and magnetic forces, atomic theory and quantum physics. This assessment evaluates understanding of fundamental physics concepts from the entire course.',
    timeLimit: 120, // 120 minutes
    questions: [
      {
        questionId: 'course2_65_l134_question1',
        type: 'multiple-choice',
        title: 'Momentum from Force-Time',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question2',
        type: 'multiple-choice',
        title: 'Velocity from Impulse',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question3',
        type: 'multiple-choice',
        title: 'Index of Refraction',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question4',
        type: 'multiple-choice',
        title: 'Wave Nature Evidence',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question5',
        type: 'multiple-choice',
        title: 'Double-Slit Screen Distance',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question6',
        type: 'multiple-choice',
        title: 'Mirror Image Height',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question7',
        type: 'multiple-choice',
        title: 'Coulomb\'s Law',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question8',
        type: 'multiple-choice',
        title: 'Electric Current Definition',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question9',
        type: 'multiple-choice',
        title: 'Faraday\'s Law',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question10',
        type: 'multiple-choice',
        title: 'Magnetic Force on Electron',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question11',
        type: 'multiple-choice',
        title: 'Thomson\'s Contribution',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question12',
        type: 'multiple-choice',
        title: 'Photoelectric Electron Energy',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question13',
        type: 'multiple-choice',
        title: 'Photoelectric Stopping Voltage',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question14',
        type: 'multiple-choice',
        title: 'Proton Momentum',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question15',
        type: 'multiple-choice',
        title: 'Charge-to-Mass Ratio',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question16',
        type: 'multiple-choice',
        title: 'Proton Circular Motion',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question17',
        type: 'multiple-choice',
        title: 'Planck\'s Quantum Hypothesis',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question18',
        type: 'multiple-choice',
        title: 'Laser Photon Emission',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question19',
        type: 'multiple-choice',
        title: 'Electron Stopping Voltage',
        points: 1
      },
      {
        questionId: 'course2_65_l134_question20',
        type: 'multiple-choice',
        title: 'Spectral Line Energy',
        points: 1
      }
    ],
    instructions: [
      'This is a cumulative assignment covering all major topics from Units 1-5.',
      'Questions 1-10 cover Mixed Units: momentum/impulse, optics, and electromagnetism.',
      'Questions 11-20 cover Nature of the Atom: atomic theory and quantum physics.',
      'Apply formulas: Δp = FΔt, n = c/v, F = k(q₁q₂)/r², F = qvB, E = hf, E = hc/λ.',
      'Use the impulse-momentum theorem for force-time relationships.',
      'Apply wave interference principles and geometric optics for mirror problems.',
      'Use Coulomb\'s law for electrostatic forces and magnetic force equations.',
      'Apply Planck\'s quantum hypothesis and photoelectric effect equations.',
      'Consider Thomson\'s atomic model and modern quantum theory concepts.',
      'Pay careful attention to units and scientific notation in calculations.',
      'You have 120 minutes to complete this comprehensive assessment.',
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

export default L134CumulativeAssignment;
