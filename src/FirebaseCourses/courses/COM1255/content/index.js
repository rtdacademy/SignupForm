/**
 * Central import/export file for all course content components
 */

// Lessons
import IntroToELearning from './lessons/IntroToELearning';
import IntroToELearningStaff from './lessons/IntroToELearning_Staff';
import BenefitsChallenges from './lessons/BenefitsChallenges';

// Assignments
import ReflectionAssignment from './assignments/ReflectionAssignment';
// import TechComparison from './assignments/TechComparison';

// Exams
import MidtermExam from './exams/MidtermExam';
import QuestionDevelopmentSandbox from './exams/QuestionDevelopmentSandbox';
// import FinalExam from './exams/FinalExam';

/**
 * Content registry - maps content IDs to their respective components
 */
const contentRegistry = {
  // Lessons
  "intro_elearning": IntroToELearning,
  "intro_elearning_Staff": IntroToELearningStaff,
  "benefits_challenges": BenefitsChallenges,

  // Assignments
  "reflection_assignment": ReflectionAssignment,
  // "tech_comparison": TechComparison,

  // Exams
  "midterm_exam": MidtermExam,
  "question_sandbox": QuestionDevelopmentSandbox,
  // "final_exam": FinalExam,
};

export default contentRegistry;