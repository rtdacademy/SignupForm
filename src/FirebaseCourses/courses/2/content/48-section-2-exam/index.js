import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const Section2Exam = ({ courseId, studentEmail }) => {
  const assessmentConfig = {
    assessmentId: 'exam_section_2',
    activityType: 'exam',
    title: 'Section 2 Exam - Electricity and Magnetism',
    description: 'This comprehensive exam covers electrostatics, electric fields, electric potential, electric current, magnetic fields, magnetic forces, motor effect, generator effect, and electromagnetic radiation. The exam tests your understanding of the physics concepts from Lessons 13-24.',
    timeLimit: 180, // 3 hours (180 minutes)
    questions: [
      // Multiple Choice Questions (23 questions, 1 point each)
      {
        questionId: 'course2_48_section2_exam_q1',
        type: 'multiple-choice',
        title: 'Electrostatic Forces Analysis',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q2',
        type: 'multiple-choice',
        title: 'Force Scaling with Charge and Distance',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q3',
        type: 'multiple-choice',
        title: 'Coulomb\'s Law Application',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q4',
        type: 'multiple-choice',
        title: 'Electric Field Strength',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q5',
        type: 'multiple-choice',
        title: 'Electric Potential Energy',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q6',
        type: 'multiple-choice',
        title: 'Parallel Plate Capacitor',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q7',
        type: 'multiple-choice',
        title: 'Electric Current and Drift Velocity',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q8',
        type: 'multiple-choice',
        title: 'Ohm\'s Law and Resistance',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q9',
        type: 'multiple-choice',
        title: 'Electric Power Calculations',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q10',
        type: 'multiple-choice',
        title: 'Circuit Analysis - Series and Parallel',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q11',
        type: 'multiple-choice',
        title: 'Magnetic Field Direction',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q12',
        type: 'multiple-choice',
        title: 'Magnetic Force on Current-Carrying Wire',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q13',
        type: 'multiple-choice',
        title: 'Magnetic Force on Moving Charges',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q14',
        type: 'multiple-choice',
        title: 'Motor Effect Applications',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q15',
        type: 'multiple-choice',
        title: 'Electromagnetic Induction - Faraday\'s Law',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q16',
        type: 'multiple-choice',
        title: 'Generator Effect and EMF',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q17',
        type: 'multiple-choice',
        title: 'Lenz\'s Law Application',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q18',
        type: 'multiple-choice',
        title: 'Transformers - Voltage and Current Ratios',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q19',
        type: 'multiple-choice',
        title: 'Electromagnetic Radiation Properties',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q20',
        type: 'multiple-choice',
        title: 'Magnetic Field Diagrams',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q21',
        type: 'multiple-choice',
        title: 'Direction Matching - Field Arrows',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q22',
        type: 'multiple-choice',
        title: 'Energy in Electric and Magnetic Fields',
        points: 1
      },
      {
        questionId: 'course2_48_section2_exam_q23',
        type: 'multiple-choice',
        title: 'Electromagnetic Spectrum Applications',
        points: 1
      },
      // Written Response Questions (2 questions, multi-point)
      {
        questionId: 'course2_48_section2_exam_q24',
        type: 'standard-long-answer',
        title: 'Electric Field and Potential Problem',
        points: 4
      },
      {
        questionId: 'course2_48_section2_exam_q25',
        type: 'standard-long-answer',
        title: 'Electromagnetic Induction Analysis',
        points: 5
      }
    ],
    instructions: [
      'This is a comprehensive exam covering electricity and magnetism physics from Section 2.',
      'You have 3 hours (180 minutes) to complete all 25 questions.',
      'The exam includes 23 multiple choice questions (1 point each) and 2 written response questions (4-5 points each).',
      'Total possible points: 32',
      'You may not use external resources, notes, or communicate with others during the exam.',
      'All questions must be answered before submitting.',
      'You have a maximum of 2 attempts - make sure you are ready before starting.',
      'Read each question carefully and review your answers before submitting.',
      'For written response questions, show all work and explain your reasoning clearly.',
      'Use proper physics units and significant figures in calculations.',
      'Some questions include diagrams and images - pay careful attention to visual information.'
    ],
    passingGrade: 70, // 70% to pass
    totalPoints: 32 // 23 MC (1 pt each) + 2 WR (4 + 5 pts)
  };

  return (
    <AssessmentSession
      courseId={courseId}
      studentEmail={studentEmail}
      assessmentConfig={assessmentConfig}
      activityType="exam"
    />
  );
};

export default Section2Exam;