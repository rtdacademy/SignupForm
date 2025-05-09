/**
 * Course structure for COM1255 - E-Learning
 * 
 * This defines the complete structure of the course including:
 * - Units and their organization into sections
 * - Individual lessons, assessments, and exams
 * - Weighting for grade calculations
 */

export const courseWeights = {
  "lesson": 0.20,    // 20% of grade
  "assignment": 0.40, // 40% of grade
  "exam": 0.40       // 40% of grade
};

export const courseStructure = [
  {
    "name": "Introduction to E-Learning",
    "section": "1",
    "sequence": 1,
    "unitId": "unit_introduction",
    "items": [
      {
        "gradebookIndex": 0,
        "hasMarking": false,
        "itemId": "lesson_intro_elearning",
        "multiplier": 1,
        "sequence": 1,
        "title": "What is E-Learning?",
        "type": "lesson",
        "content": "intro_elearning" // Reference to content file or component
      },
      {
        "gradebookIndex": 1,
        "hasMarking": false,
        "itemId": "lesson_benefits",
        "multiplier": 1,
        "sequence": 2,
        "title": "Benefits and Challenges of E-Learning",
        "type": "lesson",
        "content": "benefits_challenges"
      },
      {
        "gradebookIndex": 2,
        "hasMarking": true,
        "itemId": "assignment_elearning_reflection",
        "multiplier": 1,
        "sequence": 3,
        "title": "E-Learning Reflection Assignment",
        "type": "assignment",
        "content": "reflection_assignment"
      }
    ]
  },
  {
    "name": "E-Learning Technologies",
    "section": "1",
    "sequence": 2,
    "unitId": "unit_technologies",
    "items": [
      {
        "gradebookIndex": 3,
        "hasMarking": false,
        "itemId": "lesson_lms_overview",
        "multiplier": 1,
        "sequence": 1,
        "title": "Learning Management Systems Overview",
        "type": "lesson",
        "content": "lms_overview"
      },
      {
        "gradebookIndex": 4,
        "hasMarking": false,
        "itemId": "lesson_content_tools",
        "multiplier": 1,
        "sequence": 2,
        "title": "Digital Content Creation Tools",
        "type": "lesson",
        "content": "content_tools"
      },
      {
        "gradebookIndex": 5,
        "hasMarking": true,
        "itemId": "assignment_tech_comparison",
        "multiplier": 1,
        "sequence": 3,
        "title": "Technology Comparison Project",
        "type": "assignment",
        "content": "tech_comparison"
      }
    ]
  },
  {
    "name": "Instructional Design for E-Learning",
    "section": "2",
    "sequence": 3,
    "unitId": "unit_instructional_design",
    "items": [
      {
        "gradebookIndex": 6,
        "hasMarking": false,
        "itemId": "lesson_design_principles",
        "multiplier": 1,
        "sequence": 1,
        "title": "E-Learning Design Principles",
        "type": "lesson",
        "content": "design_principles"
      },
      {
        "gradebookIndex": 7,
        "hasMarking": false,
        "itemId": "lesson_engagement",
        "multiplier": 1,
        "sequence": 2,
        "title": "Designing for Student Engagement",
        "type": "lesson",
        "content": "engagement_strategies"
      },
      {
        "gradebookIndex": 8,
        "hasMarking": true,
        "itemId": "assignment_mini_lesson",
        "multiplier": 1,
        "sequence": 3,
        "title": "Design a Mini E-Learning Lesson",
        "type": "assignment",
        "content": "mini_lesson_design"
      }
    ]
  },
  {
    "name": "E-Learning Assessment Strategies",
    "section": "2",
    "sequence": 4,
    "unitId": "unit_assessment",
    "items": [
      {
        "gradebookIndex": 9,
        "hasMarking": false,
        "itemId": "lesson_assessment_types",
        "multiplier": 1,
        "sequence": 1,
        "title": "Types of Online Assessments",
        "type": "lesson",
        "content": "assessment_types"
      },
      {
        "gradebookIndex": 10,
        "hasMarking": false,
        "itemId": "lesson_feedback",
        "multiplier": 1,
        "sequence": 2,
        "title": "Providing Effective Feedback",
        "type": "lesson",
        "content": "effective_feedback"
      },
      {
        "gradebookIndex": 11,
        "hasMarking": true,
        "itemId": "midterm_exam",
        "multiplier": 1,
        "sequence": 3,
        "title": "Midterm Examination",
        "type": "exam",
        "content": "midterm_exam"
      }
    ]
  },
  {
    "name": "Final Project and Assessment",
    "section": "3",
    "sequence": 5,
    "unitId": "unit_final",
    "items": [
      {
        "gradebookIndex": 12,
        "hasMarking": false,
        "itemId": "lesson_project_guidelines",
        "multiplier": 1,
        "sequence": 1,
        "title": "Final Project Guidelines",
        "type": "lesson",
        "content": "project_guidelines"
      },
      {
        "gradebookIndex": 13,
        "hasMarking": true,
        "itemId": "assignment_final_project",
        "multiplier": 1,
        "sequence": 2,
        "title": "Create Your Own E-Learning Module",
        "type": "assignment",
        "content": "final_project"
      },
      {
        "gradebookIndex": 14,
        "hasMarking": true,
        "itemId": "final_exam",
        "multiplier": 1,
        "sequence": 3,
        "title": "Final Examination",
        "type": "exam",
        "content": "final_exam"
      }
    ]
  }
];

export default {
  courseId: "COM1255",
  title: "COM1255 - E-Learning",
  description: "This course introduces students to the principles, technologies, and best practices of e-learning. Students will explore different e-learning platforms, instructional design concepts, and assessment strategies while developing their own online learning materials.",
  weights: courseWeights,
  structure: courseStructure,
  credits: 1,
  grade: "10"
};