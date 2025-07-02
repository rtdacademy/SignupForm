/**
 * Assessment Functions for Course Prerequisites & Academic Requirements
 * Course: 4 (RTD Academy Orientation - COM1255)
 * Content: 05-course-prerequisites
 * 
 * This module provides standard multiple choice assessments for understanding course
 * prerequisites, academic pathway planning, and handling missing requirements.
 */

const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// Activity type for this lesson
const ACTIVITY_TYPE = 'lesson';

/**
 * Standard Multiple Choice Question 1 - General Prerequisites Understanding
 * Function name: course4_05_course_prerequisites_question1
 */
exports.course4_05_course_prerequisites_question1 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What is the primary purpose of course prerequisites in academic programs?",
      options: [
        { 
          id: 'a', 
          text: 'To make courses more difficult and limit enrollment',
          feedback: 'Incorrect. Prerequisites are not designed to create barriers or make courses artificially difficult.'
        },
        { 
          id: 'b', 
          text: 'To ensure students have the foundational knowledge and skills needed for success',
          feedback: 'Correct! Prerequisites ensure students have built the necessary foundation to understand and succeed in more advanced coursework.'
        },
        { 
          id: 'c', 
          text: 'To force students to take more courses than necessary',
          feedback: 'Incorrect. Prerequisites are based on educational necessity, not designed to increase course loads unnecessarily.'
        },
        { 
          id: 'd', 
          text: 'To help teachers organize their curriculum better',
          feedback: 'Incorrect. While prerequisites may help with organization, their primary purpose is student success and preparedness.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Prerequisites are educational building blocks that ensure students have mastered essential concepts before moving to more advanced topics. This sequential learning approach maximizes student success and comprehension.',
      difficulty: 'basic',
      tags: ['prerequisites', 'academic-foundations', 'student-success']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Understanding Course Prerequisites',
  learningObjectives: [
    'Understand the fundamental purpose of course prerequisites',
    'Recognize how prerequisites support student success',
    'Appreciate the importance of sequential learning'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 2 - Sequential Learning Benefits
 * Function name: course4_05_course_prerequisites_question2
 */
exports.course4_05_course_prerequisites_question2 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "Why is sequential learning (taking courses in the correct order) important for academic success?",
      options: [
        { 
          id: 'a', 
          text: 'It allows students to complete their education faster',
          feedback: 'Incorrect. Sequential learning is about building knowledge systematically, not necessarily completing education faster.'
        },
        { 
          id: 'b', 
          text: 'It ensures concepts build upon each other logically, creating a strong foundation',
          feedback: 'Correct! Sequential learning allows students to master fundamental concepts before moving to more complex topics that depend on those foundations.'
        },
        { 
          id: 'c', 
          text: 'It makes courses easier by spreading content over more time',
          feedback: 'Incorrect. Sequential learning is about proper knowledge building, not making courses easier by extending time.'
        },
        { 
          id: 'd', 
          text: 'It helps teachers plan their lessons more effectively',
          feedback: 'Incorrect. While sequential learning may help teachers, the primary benefit is for student learning and comprehension.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Sequential learning creates a scaffold of knowledge where each new concept builds upon previously mastered skills. This approach leads to deeper understanding and greater success in advanced coursework.',
      difficulty: 'intermediate',
      tags: ['sequential-learning', 'knowledge-building', 'academic-foundations', 'student-success']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Sequential Learning and Knowledge Building',
  learningObjectives: [
    'Understand the importance of sequential learning',
    'Recognize how concepts build upon each other',
    'Appreciate the benefits of following proper course sequences'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});

/**
 * Standard Multiple Choice Question 3 - Handling Missing Prerequisites
 * Function name: course4_05_course_prerequisites_question3
 */
exports.course4_05_course_prerequisites_question3 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "What should a student do if they discover they are missing a prerequisite for a course they want to take?",
      options: [
        { 
          id: 'a', 
          text: 'Enroll in the course anyway and try to catch up on missing concepts',
          feedback: 'Incorrect. Attempting advanced coursework without proper preparation often leads to poor performance and frustration.'
        },
        { 
          id: 'b', 
          text: 'Complete the missing prerequisite first, then enroll in the desired course',
          feedback: 'Correct! Taking the prerequisite course first ensures proper preparation and maximizes chances of success in the advanced course.'
        },
        { 
          id: 'c', 
          text: 'Find a different course that has no prerequisites',
          feedback: 'Incorrect. Avoiding prerequisites altogether may prevent the student from achieving their academic or career goals.'
        },
        { 
          id: 'd', 
          text: 'Ask the teacher to waive the prerequisite requirement',
          feedback: 'Incorrect. Prerequisites exist for educational reasons and are rarely waived without demonstrated equivalent knowledge.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'Prerequisites ensure students have the necessary foundation for success. Completing missing prerequisites first, rather than skipping them, leads to better understanding and performance in advanced courses.',
      difficulty: 'basic',
      tags: ['prerequisites', 'academic-planning', 'student-preparation', 'foundation-building']
    }
  ],
  
  // Assessment settings
  activityType: ACTIVITY_TYPE,
  maxAttempts: 1,
  pointsValue: 1,
  showFeedback: true,
  enableHints: true,
  attemptPenalty: 0,
  theme: 'purple',
  
  // Selection settings
  randomizeQuestions: false,
  randomizeOptions: true,
  
  // Course metadata
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Handling Missing Prerequisites',
  learningObjectives: [
    'Understand proper response to missing prerequisites',
    'Recognize the importance of completing foundational courses',
    'Make informed decisions about course readiness'
  ],
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});
