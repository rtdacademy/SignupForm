import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L138CumulativeAssignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_38',
    activityType: 'assignment',
    title: 'L1-38 Cumulative Assignment - Comprehensive Physics 30 Review',
    description: 'Comprehensive 120-minute assessment covering all major topics from Physics 30: mechanics, optics, electricity & magnetism, and atomic physics. This cumulative assignment tests your understanding of the entire course content.',
    timeLimit: 120, // 120 minutes
    questions: [
      // Part A: Non-Nature of the Atom (Questions 1-8)
      {
        questionId: 'course2_73_l138_question1',
        type: 'multiple-choice',
        title: 'Momentum Conservation - Inelastic Collision',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question2',
        type: 'multiple-choice',
        title: 'Units of Impulse',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question3',
        type: 'multiple-choice',
        title: 'Snell\'s Law - Refraction',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question4',
        type: 'multiple-choice',
        title: 'Light Dispersion through Prism',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question5',
        type: 'multiple-choice',
        title: 'Magnetic Force on Current-Carrying Wire',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question6',
        type: 'multiple-choice',
        title: 'Electric Field from Point Charge',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question7',
        type: 'multiple-choice',
        title: 'Convex Mirror Image Distance',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question8',
        type: 'multiple-choice',
        title: 'Diffraction Grating First Order Maximum',
        points: 1
      },
      
      // Part B: Nature of the Atom (Questions 9-20)
      {
        questionId: 'course2_73_l138_question9',
        type: 'multiple-choice',
        title: 'First Quantum Model of the Atom',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question10',
        type: 'multiple-choice',
        title: 'de Broglie Wavelength Relationship',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question11',
        type: 'multiple-choice',
        title: 'Photon Energy Calculation',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question12',
        type: 'multiple-choice',
        title: 'Pauli Exclusion Principle',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question13',
        type: 'multiple-choice',
        title: 'Photoelectric Effect Evidence',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question14',
        type: 'multiple-choice',
        title: 'Photoelectric Effect Energy',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question15',
        type: 'multiple-choice',
        title: 'Photon Recoil Speed',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question16',
        type: 'multiple-choice',
        title: 'Azimuthal Quantum Number',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question17',
        type: 'multiple-choice',
        title: 'Nuclear Reaction - Boron Neutron Capture',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question18',
        type: 'multiple-choice',
        title: 'Radioactive Decay - Half-Life',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question19',
        type: 'multiple-choice',
        title: 'Mass-Energy Conversion',
        points: 1
      },
      {
        questionId: 'course2_73_l138_question20',
        type: 'multiple-choice',
        title: 'Quark Composition and Electric Charge',
        points: 1
      }
    ],
    instructions: [
      '⏰ This is a 120-minute timed assessment covering the entire Physics 30 course.',
      '📚 Part A (Questions 1-8): Mechanics, optics, electricity & magnetism',
      '⚛️ Part B (Questions 9-20): Atomic physics, quantum mechanics, nuclear physics',
      '💾 Your progress will be automatically saved as you work through the questions.',
      '🔄 You can review and change your answers before final submission.',
      '📊 Detailed feedback will be provided for each question upon completion.',
      '⚠️ Once you start, the timer cannot be paused. Ensure you have uninterrupted time.',
      '✅ Aim for at least 70% (14/20 questions correct) for a passing grade.'
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

export default L138CumulativeAssignment;
