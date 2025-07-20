import React from 'react';
import AssessmentSession from '../../../../components/AssessmentSession';

const L118CumulativeAssignment = ({ courseId, studentEmail, course }) => {
  const assessmentConfig = {
    assessmentId: 'assignment_l1_18_cumulative',
    activityType: 'assignment',
    title: 'L1-18 Cumulative Assignment - Comprehensive Physics Review',
    description: 'Comprehensive cumulative assessment covering static electricity, momentum, collisions, electroscopes, electric fields, light, mirrors, and electromagnetic radiation from Lessons 1-18.',
    timeLimit: 120, // 120 minutes as requested
    questions: [
      {
        questionId: 'course2_35_l118_question1',
        type: 'multiple-choice',
        title: 'Static Electricity - Charging Methods (Group 1)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question2',
        type: 'multiple-choice',
        title: 'Static Electricity - Induction Method (Group 1)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question3',
        type: 'multiple-choice',
        title: 'Static Electricity - Conductors vs Insulators (Group 1)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question4',
        type: 'multiple-choice',
        title: 'Electroscope - Negative Rod Interaction (Group 2)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question5',
        type: 'multiple-choice',
        title: 'Electroscope - Charge Identification (Group 2)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question6',
        type: 'multiple-choice',
        title: 'Electroscope - Sphere Charge Capacity (Group 2)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question7',
        type: 'multiple-choice',
        title: 'Momentum - Football Collision (Group 3)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question8',
        type: 'multiple-choice',
        title: 'Momentum - Van and Car Collision (Group 3)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question9',
        type: 'multiple-choice',
        title: 'Momentum - Hockey Puck and Octopus (Group 3)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question10',
        type: 'multiple-choice',
        title: 'Momentum - Plastic Ball Collision (Group 3)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question11',
        type: 'multiple-choice',
        title: 'Momentum - High-Speed Object Collision (Group 3)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question12',
        type: 'multiple-choice',
        title: '2D Collision - Multi-Object System (Group 4)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question13',
        type: 'multiple-choice',
        title: '2D Collision - Stationary Target (Group 4)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question14',
        type: 'multiple-choice',
        title: 'Electric Field Data Analysis (Group 5)',
        points: 1
      },
      {
        questionId: 'course2_35_l118_question15',
        type: 'multiple-choice',
        title: 'Light and Mirrors (Group 6-7)',
        points: 1
      }
    ],
    instructions: [
      'This cumulative assignment covers all major concepts from Lessons 1-18.',
      'Topics include static electricity, momentum and collisions, electroscopes, electric fields, light, and mirrors.',
      'Questions are organized by topic groups to test your comprehensive understanding.',
      'Use appropriate physics formulas and pay attention to units and significant figures.',
      'You have 120 minutes to complete this assignment.',
      'Your progress will be saved automatically as you work.',
      'You can review and change your answers before final submission.'
    ],
    passingGrade: 70,
    maxAttempts: 1,
    examMode: true // Enable exam session manager
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

export default L118CumulativeAssignment;
