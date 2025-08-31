import WelcometoRTDAcademy from './01-welcome-rtd-academy';
import LearningPlansCourseCompletionDiplomaExamPolicies from './02-learning-plans-completion-policies';
import TimeManagementStayingActiveinYourCourse from './03-time-management-staying-active';
import ConductExpectationsAlbertaEducationResponsibilities from './04-conduct-expectations-responsibilities';
import DigitalCitizenshipOnlineSafety from './05-digital-citizenship-online-safety';
import TechnologyReadinessAssistiveTools from './07-technology-readiness-assistive-tools';
import CellPhonePolicyExamProctoringProcedures from './08-cell-phone-policy-exam-proctoring';
import ExamsRewritesStudentSupportResources from './10-exams-rewrites-student-support';

// Content registry using itemId as keys - matching database exactly
const contentRegistry = {
  '01_physics_30_welcome_rtd_academy': WelcometoRTDAcademy,
  '02_physics_30_learning_plans_completion_policies': LearningPlansCourseCompletionDiplomaExamPolicies,
  '03_physics_30_time_management_staying_active': TimeManagementStayingActiveinYourCourse,
  '04_physics_30_conduct_expectations_responsibilities': ConductExpectationsAlbertaEducationResponsibilities,
  '05_physics_30_digital_citizenship_online_safety': DigitalCitizenshipOnlineSafety,
  '07_physics_30_technology_readiness_assistive_tools': TechnologyReadinessAssistiveTools,
  '08_physics_30_cell_phone_policy_exam_proctoring': CellPhonePolicyExamProctoringProcedures,
  //'09_physics_30_academic_integrity_violation_consequences': null, // Missing content - needs to be created
  '10_physics_30_exams_rewrites_student_support': ExamsRewritesStudentSupportResources,
};

export default contentRegistry;