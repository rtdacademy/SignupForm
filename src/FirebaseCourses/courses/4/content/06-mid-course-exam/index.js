import React from 'react';
import ExamSession from '../../../../components/ExamSession';

const MidCourseExam = ({ courseId, studentEmail }) => {
  const examConfig = {
    examId: 'exam_mid_course_test',
    title: 'Mid-Course Exam - Policies and Procedures',
    description: 'This exam tests your understanding of RTD Academy policies, time management requirements, and communication standards covered in the first half of the course.',
    timeLimit: 60, // 60 minutes
    questions: [
      {
        questionId: 'course4_06_mid_exam_question1',
        type: 'multiple-choice',
        title: 'RTD Academy Policies Review',
        points: 5
      },
      {
        questionId: 'course4_06_mid_exam_question2', 
        type: 'multiple-choice',
        title: 'Time Management and Activity Requirements',
        points: 5
      },
      {
        questionId: 'course4_06_mid_exam_question3',
        type: 'ai-short-answer',
        title: 'Communication and Conduct Standards',
        points: 5
      }
    ],
    instructions: [
      'This is a timed exam with a 60-minute limit.',
      'You may not use external resources or communicate with others during the exam.',
      'All questions must be answered before submitting.',
      'You have only ONE attempt - make sure you are ready before starting.',
      'Read each question carefully and review your answers before submitting.'
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

export default MidCourseExam;