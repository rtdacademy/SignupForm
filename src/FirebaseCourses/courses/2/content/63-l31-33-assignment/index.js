import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L3133Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l31_33',
    activityType: 'assignment',
    title: 'L31-33 Assignment - Wave-Particle Duality',
    description: 'Assessment covering wave-particle duality, de Broglie wavelengths, atomic energy levels, and quantum measurement principles. Topics include electron acceleration, photoelectric effect variations, hydrogen energy transitions, X-ray photon calculations, and the uncertainty principle.',
    timeLimit: 60, // 60 minutes
    questions: [
      {
        questionId: 'course2_63_l3133_question1',
        type: 'multiple-choice',
        title: 'de Broglie Wavelength Calculation',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question2',
        type: 'multiple-choice',
        title: 'Photoelectric Frequency Effects',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question3',
        type: 'multiple-choice',
        title: 'Electron Wave Evidence',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question4',
        type: 'multiple-choice',
        title: 'Hydrogen Energy Transitions',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question5',
        type: 'multiple-choice',
        title: 'Ionization Energy',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question6',
        type: 'multiple-choice',
        title: 'X-ray Photon Momentum',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question7',
        type: 'multiple-choice',
        title: 'Double-Slit with Electrons',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question8',
        type: 'multiple-choice',
        title: 'de Broglie Particle Wavelength',
        points: 1
      },
      {
        questionId: 'course2_63_l3133_question9',
        type: 'multiple-choice',
        title: 'Uncertainty Principle',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers wave-particle duality concepts from Lessons 31-33.',
      'Topics include de Broglie wavelengths, photoelectric effect, atomic energy transitions, and quantum measurement.',
      'Apply formulas: λ = h/p, E = 13.6 eV × (1/n₁² - 1/n₂²), E = pc, Δx × Δp ≥ ℏ/2.',
      'Calculate electron wavelengths using λ = h/√(2meV) for accelerated electrons.',
      'Understand the relationship between frequency changes and kinetic energy in photoelectric effect.',
      'Analyze hydrogen energy level transitions and photon emission/absorption.',
      'Apply the uncertainty principle to position and momentum measurements.',
      'Consider experimental evidence for wave-particle duality in electrons and photons.',
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

export default L3133Assignment;
