/**
 * Central import/export file for all Physics 30 course content components
 */

// Lessons
import IntroToPhysics from './lessons/IntroToPhysics';
import MomentumOneDimension from './lessons/MomentumOneDimension';

// Assignments
import ReflectionAssignment from './assignments/ReflectionAssignment';

// Exams
// import FinalExam from './exams/FinalExam';

/**
 * Content registry - maps content IDs to their respective components
 */
const contentRegistry = {  // Lessons
  "lesson_1747281754691_113": IntroToPhysics,
  "lesson_1747281764415_851": MomentumOneDimension,

  // Assignments
  "reflection_assignment": ReflectionAssignment,

  // Exams
  // "final_exam": FinalExam,
};

export default contentRegistry;
