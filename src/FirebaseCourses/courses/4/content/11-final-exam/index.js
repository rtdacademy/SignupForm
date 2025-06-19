import React from 'react';
import ExamSession from '../../../../components/ExamSession';

const FinalComprehensiveExam = ({ courseId, studentEmail }) => {
  const examConfig = {
    examId: 'exam_final_comprehensive',
    title: 'Final Comprehensive Exam',
    description: 'This comprehensive final exam covers all course material including policies, procedures, academic integrity, technology use, digital citizenship, and student support services.',
    timeLimit: 90, // 90 minutes
    questions: [
      {
        questionId: 'course4_11_final_exam_question1',
        type: 'multiple-choice',
        title: 'Course Completion Policies',
        points: 5
      },
      {
        questionId: 'course4_11_final_exam_question2',
        type: 'multiple-choice', 
        title: 'Academic Integrity and Technology',
        points: 5
      },
      {
        questionId: 'course4_11_final_exam_question3',
        type: 'ai-short-answer',
        title: 'Student Support and Exam Procedures',
        points: 5
      },
      {
        questionId: 'course4_11_final_exam_question4',
        type: 'ai-long-answer',
        title: 'Digital Citizenship Scenario',
        points: 10
      }
    ],
    instructions: [
      'This is a comprehensive final exam with a 90-minute time limit.',
      'You may not use external resources, notes, or communicate with others during the exam.',
      'All questions must be answered before submitting the exam.',
      'You have only ONE attempt - ensure you are well-prepared before starting.',
      'For written responses, demonstrate your understanding with specific examples and detailed explanations.',
      'Review all your answers carefully before final submission.',
      'This exam is worth 30% of your final course grade.'
    ],
    passingGrade: 70
  };

  return (
    <ExamSession
      courseId={courseId}
      studentEmail={studentEmail}
      examConfig={examConfig}
    />
  );
};

export default FinalComprehensiveExam;