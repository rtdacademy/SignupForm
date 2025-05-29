/**
 * Central import/export file for all Physics 30 course content components
 */

// Lessons
import IntroToPhysics from './lessons/IntroToPhysics';
import MomentumOneDimension from './lessons/MomentumOneDimension';
import MomentumTwoDimensions from './lessons/MomentumTwoDimensions';

// Assignments
import ReflectionAssignment from './assignments/ReflectionAssignment';
import L1_3_Assignment from './assignments/L1_3_Assignment';
import Lab1_ConservationOfMomentum from './assignments/Lab1_ConservationOfMomentum';

// Exams
// import FinalExam from './exams/FinalExam';

/**
 * Content registry - maps content IDs to their respective components
 */
const contentRegistry = {
  // Lessons
  "lesson_1747281754691_113": IntroToPhysics,
  "lesson_1747281764415_851": MomentumOneDimension,  
  "lesson_1747281779014_814": MomentumTwoDimensions,  
    // Assignments
  "reflection_assignment": ReflectionAssignment,
  "assignment_1747281808385_436": L1_3_Assignment,
  "assignment_1747283296776_954": Lab1_ConservationOfMomentum,

  // Exams
  // "final_exam": FinalExam,
};

export default contentRegistry;
