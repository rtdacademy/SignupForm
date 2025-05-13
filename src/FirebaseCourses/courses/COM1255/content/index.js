/**
 * Central import/export file for all course content components
 */

// Lessons
import IntroToELearning from './lessons/IntroToELearning';
import BenefitsChallenges from './lessons/BenefitsChallenges';

// Assignments
import ReflectionAssignment from './assignments/ReflectionAssignment';
// import TechComparison from './assignments/TechComparison';

// Exams

// import FinalExam from './exams/FinalExam';

/**
 * Content registry - maps content IDs to their respective components
 */
const contentRegistry = {
  // Lessons
  "intro_elearning": IntroToELearning,
  "benefits_challenges": BenefitsChallenges,

  // Assignments
  "reflection_assignment": ReflectionAssignment,
  // "tech_comparison": TechComparison,

  // Exams

  // "final_exam": FinalExam,
};

export default contentRegistry;