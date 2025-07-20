import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L124CumulativeAssignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_24',
    activityType: 'assignment',
    title: 'L1-24 Cumulative Assignment - Units 3-4 Review',
    description: 'Comprehensive review covering momentum & impulse, optics, electric fields, and magnetic fields. This cumulative assessment tests understanding of physics concepts from Lessons 1-24.',
    timeLimit: 90, // 90 minutes for comprehensive assessment
    questions: [
      {
        questionId: 'course2_45_l124_question1',
        type: 'multiple-choice',
        title: 'Car Collision Force Calculation',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question2',
        type: 'multiple-choice',
        title: 'Ball Wall Collision Impulse',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question3',
        type: 'multiple-choice',
        title: 'Inelastic Collision Velocity',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question4',
        type: 'multiple-choice',
        title: 'Critical Angle and Refractive Index',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question5',
        type: 'multiple-choice',
        title: 'Light Through Prism',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question6',
        type: 'multiple-choice',
        title: 'Lens Focal Length and Type',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question7',
        type: 'multiple-choice',
        title: 'Diffraction Grating Lines per Meter',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question8',
        type: 'multiple-choice',
        title: 'Alpha Particle Acceleration',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question9',
        type: 'multiple-choice',
        title: 'Electric Field Distance Calculation',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question10',
        type: 'multiple-choice',
        title: 'Alpha Particle Potential Difference',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question11',
        type: 'multiple-choice',
        title: 'Millikan Oil Drop Charge',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question12',
        type: 'multiple-choice',
        title: 'Proton Magnetic Field Calculation',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question13',
        type: 'multiple-choice',
        title: 'Conductor Magnetic Force',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question14',
        type: 'multiple-choice',
        title: 'Mass Spectrometer Ion Mass',
        points: 1
      },
      {
        questionId: 'course2_45_l124_question15',
        type: 'multiple-choice',
        title: 'Carbon-14 Path Radius',
        points: 1
      }
    ],
    instructions: [
      'This is a comprehensive cumulative assignment covering Units 3-4 (Lessons 1-24).',
      'Topics include: momentum & impulse, collisions, refraction & lenses, electric fields & forces, and magnetic fields & forces.',
      'Apply conservation laws: momentum, energy, and charge.',
      'Use key formulas: F = Δp/Δt, Snell\'s law, lens equation, F = qE, F = qvB, F = BIL.',
      'Pay careful attention to directions using right-hand rule and vector analysis.',
      'Include proper units and significant figures in all calculations.',
      'You have 90 minutes to complete this comprehensive assessment.',
      'You can attempt each question up to 3 times to demonstrate your understanding.',
      'Your progress will be saved automatically as you work.',
      'This assessment covers all major physics concepts from the first 24 lessons.'
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

export default L124CumulativeAssignment;