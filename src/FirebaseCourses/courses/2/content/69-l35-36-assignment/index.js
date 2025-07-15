import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L3536Assignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l35_36',
    activityType: 'assignment',
    title: 'L35-36 Assignment - Nuclear Physics',
    description: 'Nuclear physics assignment covering nuclear reactions, radioactive decay, binding energy calculations, and nuclear stability. Topics include alpha decay, half-life calculations, mass-energy equivalence, and nuclear equation balancing.',
    timeLimit: 40, // 40 minutes
    questions: [
      {
        questionId: 'course2_69_l3536_question1',
        type: 'multiple-choice',
        title: 'Proton-Induced Nuclear Reaction',
        points: 1
      },
      {
        questionId: 'course2_69_l3536_question2',
        type: 'multiple-choice',
        title: 'Alpha Decay Identification',
        points: 1
      },
      {
        questionId: 'course2_69_l3536_question3',
        type: 'multiple-choice',
        title: 'Half-Life Calculation',
        points: 1
      },
      {
        questionId: 'course2_69_l3536_question4',
        type: 'multiple-choice',
        title: 'Strontium-86 Binding Energy',
        points: 1
      },
      {
        questionId: 'course2_69_l3536_question5',
        type: 'multiple-choice',
        title: 'Cobalt-60 Binding Energy',
        points: 1
      },
      {
        questionId: 'course2_69_l3536_question6',
        type: 'multiple-choice',
        title: 'Radium-226 Decay Energy',
        points: 1
      }
    ],
    instructions: [
      'This assignment covers nuclear physics concepts from lessons 35-36.',
      'Topics include nuclear reactions, radioactive decay, and binding energy.',
      'Apply conservation laws for mass number (A) and atomic number (Z) in nuclear reactions.',
      'Use the half-life formula: N = N₀(1/2)^(t/t₁/₂) for radioactive decay problems.',
      'Calculate binding energy using: BE = (mass defect) × c² = Δm × 931.5 MeV/u.',
      'For alpha decay: parent nucleus → daughter nucleus + alpha particle (₂⁴He).',
      'Remember: mass defect = (mass of separated nucleons) - (actual atomic mass).',
      'Use standard atomic masses: proton = 1.007276 u, neutron = 1.008665 u.',
      'You have 40 minutes to complete this 6-question assignment.',
      'You can attempt each question up to 3 times with immediate feedback.',
      'Your progress will be saved automatically as you work through the problems.'
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

export default L3536Assignment;
