import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const Section3Exam = ({ courseId, studentEmail }) => {
  const assessmentConfig = {
    assessmentId: 'exam_section_3',
    activityType: 'exam',
    title: 'Section 3 Exam - Atomic Physics and Nuclear',
    description: 'This comprehensive exam covers early atomic models, cathode rays, Rutherford atom, quantization of light, photoelectric effect, light spectra, Bohr model, Compton effect, wave-particle nature, quantum mechanics, nuclear physics, radioactivity, and particle physics. The exam tests your understanding of the physics concepts from Lessons 25-38.',
    timeLimit: 180, // 3 hours (180 minutes)
    questions: [
      // Multiple Choice Questions (23 questions, 1 point each)
      {
        questionId: 'course2_76_section3_exam_q1',
        type: 'multiple-choice',
        title: 'Isotope Definition',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q2',
        type: 'multiple-choice',
        title: 'Nuclear Binding Energy',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q3',
        type: 'multiple-choice',
        title: 'Beta Decay Process',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q4',
        type: 'multiple-choice',
        title: 'Half-Life Calculation',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q5',
        type: 'multiple-choice',
        title: 'Nuclear Fission',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q6',
        type: 'multiple-choice',
        title: 'Atomic Models',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q7',
        type: 'multiple-choice',
        title: 'Alpha Radiation',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q8',
        type: 'multiple-choice',
        title: 'Radioactive Decay',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q9',
        type: 'multiple-choice',
        title: 'Nuclear Reactions',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q10',
        type: 'multiple-choice',
        title: 'Mass-Energy Equivalence',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q11',
        type: 'multiple-choice',
        title: 'Electron Configuration',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q12',
        type: 'multiple-choice',
        title: 'Quantum Numbers',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q13',
        type: 'multiple-choice',
        title: 'Photoelectric Effect',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q14',
        type: 'multiple-choice',
        title: 'Nuclear Stability Analysis',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q15',
        type: 'multiple-choice',
        title: 'Radiation Detection',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q16',
        type: 'multiple-choice',
        title: 'Nuclear Chart Analysis',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q17',
        type: 'multiple-choice',
        title: 'Energy Level Diagram',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q18',
        type: 'multiple-choice',
        title: 'Isotope Applications',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q19',
        type: 'multiple-choice',
        title: 'Nuclear Decay Series',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q20',
        type: 'multiple-choice',
        title: 'Nuclear Medicine',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q21',
        type: 'multiple-choice',
        title: 'Nuclear Power',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q22',
        type: 'multiple-choice',
        title: 'Atomic Structure',
        points: 1
      },
      {
        questionId: 'course2_76_section3_exam_q23',
        type: 'multiple-choice',
        title: 'Nuclear Physics Principles',
        points: 1
      },
      // Written Response Questions (2 questions, multi-point)
      {
        questionId: 'course2_76_section3_exam_q24',
        type: 'standard-long-answer',
        title: 'Decay Analysis Problem',
        points: 5
      },
      {
        questionId: 'course2_76_section3_exam_q25',
        type: 'standard-long-answer',
        title: 'Nuclear Physics Application',
        points: 4
      }
    ],
    instructions: [
      'This is a comprehensive exam covering atomic physics and nuclear physics from Section 3.',
      'You have 3 hours (180 minutes) to complete all 25 questions.',
      'The exam includes 23 multiple choice questions (1 point each) and 2 written response questions (5 and 4 points each).',
      'Total possible points: 32',
      'You may not use external resources, notes, or communicate with others during the exam.',
      'All questions must be answered before submitting.',
      'You have a maximum of 2 attempts - make sure you are ready before starting.',
      'Read each question carefully and review your answers before submitting.',
      'For written response questions, show all work and explain your reasoning clearly.',
      'Use proper physics units and significant figures in calculations.',
      'Some questions include diagrams and images - pay careful attention to visual information.',
      'The physics principles are given on the data sheet for calculation problems.'
    ],
    passingGrade: 70, // 70% to pass
    totalPoints: 32 // 23 MC (1 pt each) + 2 WR (5 + 4 pts)
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

export default Section3Exam;
