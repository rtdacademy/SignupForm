import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const Section1Exam = ({ courseId, studentEmail }) => {
  const assessmentConfig = {
    assessmentId: 'exam_section_1',
    activityType: 'exam',
    title: 'Section 1 Exam - Momentum and Light',
    description: 'This comprehensive exam covers momentum conservation, impulse, collisions, and the fundamentals of light including reflection, refraction, and image formation. The exam tests your understanding of the physics concepts from Lessons 1-12.',
    timeLimit: 180, // 3 hours (180 minutes)
    questions: [
      // Multiple Choice Questions (23 questions, 1 point each)
      {
        questionId: 'course2_24_section1_exam_q1',
        type: 'multiple-choice',
        title: 'Momentum Conservation - Inelastic Collision',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q2',
        type: 'multiple-choice',
        title: 'Recoil Velocity Calculation',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q3',
        type: 'multiple-choice',
        title: 'Conservation Laws in Collisions',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q4',
        type: 'multiple-choice',
        title: 'Force-Time Graph Analysis',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q5',
        type: 'multiple-choice',
        title: 'Impulse and Momentum Change',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q6',
        type: 'multiple-choice',
        title: 'Elastic Collision - Equal Masses',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q7',
        type: 'multiple-choice',
        title: 'Types of Collisions',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q8',
        type: 'multiple-choice',
        title: 'Impulse from Wall Collision',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q9',
        type: 'multiple-choice',
        title: 'Triangular Force-Time Graph',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q10',
        type: 'multiple-choice',
        title: 'Momentum Conservation Principle',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q11',
        type: 'multiple-choice',
        title: 'Impulse Comparison - Bouncing vs Sticking',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q12',
        type: 'multiple-choice',
        title: 'Light Refraction Behavior',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q13',
        type: 'multiple-choice',
        title: 'Index of Refraction Definition',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q14',
        type: 'multiple-choice',
        title: 'Light Bending and Medium Properties',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q15',
        type: 'multiple-choice',
        title: 'Convex Lens Image Formation',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q16',
        type: 'multiple-choice',
        title: 'Ray Diagram Principles',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q17',
        type: 'multiple-choice',
        title: 'Diverging Mirror Properties',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q18',
        type: 'multiple-choice',
        title: 'Concave Mirror Image Formation',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q19',
        type: 'multiple-choice',
        title: 'Plane Mirror Image Properties',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q20',
        type: 'multiple-choice',
        title: 'Critical Angle Concept',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q21',
        type: 'multiple-choice',
        title: 'Snells Law Calculation',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q22',
        type: 'multiple-choice',
        title: 'Prism Dispersion Mechanism',
        points: 1
      },
      {
        questionId: 'course2_24_section1_exam_q23',
        type: 'multiple-choice',
        title: 'Real Image Formation Conditions',
        points: 1
      },
      // Long Answer Questions (2 questions, multi-point)
      {
        questionId: 'course2_24_section1_exam_long1',
        type: 'standard-long-answer',
        title: 'Momentum Conservation Problem',
        points: 5
      },
      {
        questionId: 'course2_24_section1_exam_long2',
        type: 'standard-long-answer',
        title: 'Light Refraction Problem',
        points: 4
      }
    ],
    instructions: [
      'This is a comprehensive exam covering momentum and light physics from Section 1.',
      'You have 3 hours (180 minutes) to complete all 25 questions.',
      'The exam includes 23 multiple choice questions (1 point each) and 2 long answer questions (4-5 points each).',
      'Total possible points: 32',
      'You may not use external resources, notes, or communicate with others during the exam.',
      'All questions must be answered before submitting.',
      'You have only ONE attempt - make sure you are ready before starting.',
      'Read each question carefully and review your answers before submitting.',
      'For long answer questions, show all work and explain your reasoning clearly.',
      'Use proper physics units and significant figures in calculations.'
    ],
    passingGrade: 70, // 70% to pass
    totalPoints: 32 // 23 MC (1 pt each) + 2 LA (5 + 4 pts)
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

export default Section1Exam;
