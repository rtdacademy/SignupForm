/**
 * Template for Creating New Subject Rubrics
 * Copy this file and customize for your subject area
 * 
 * NAMING CONVENTION: [SUBJECT]_RUBRICS (e.g., KINEMATICS_RUBRICS, FORCES_RUBRICS)
 * FILE NAME: [subject]-rubrics.js (e.g., kinematics-rubrics.js, forces-rubrics.js)
 */

const TEMPLATE_RUBRICS = {
  beginner: [
    {
      criterion: "Conceptual Understanding",
      points: 3,
      description: "Understanding of basic [SUBJECT] concepts",
      levels: {
        3: "[Excellent - describe what full understanding looks like]",
        2: "[Good - describe minor gaps or issues]",
        1: "[Satisfactory - describe basic understanding]",
        0: "[Not Met - describe significant errors or missing elements]"
      }
    },
    {
      criterion: "Application/Examples",
      points: 3,
      description: "Quality of examples or applications",
      levels: {
        3: "[Excellent example/application description]",
        2: "[Good example with minor issues]",
        1: "[Basic example present]",
        0: "[No example or incorrect]"
      }
    },
    {
      criterion: "Scientific Communication",
      points: 3,
      description: "Clarity and use of scientific language",
      levels: {
        3: "[Clear, precise scientific communication]",
        2: "[Generally clear with minor issues]",
        1: "[Understandable but lacks precision]",
        0: "[Unclear or incorrect terminology]"
      }
    },
    {
      criterion: "Organization/Completeness",
      points: 3,
      description: "Overall organization and completeness",
      levels: {
        3: "[Well-organized and complete]",
        2: "[Good organization, minor omissions]",
        1: "[Basic structure present]",
        0: "[Disorganized or incomplete]"
      }
    }
  ],
  intermediate: [
    {
      criterion: "Conceptual Understanding",
      points: 3,
      description: "Understanding of [SUBJECT] principles and relationships",
      levels: {
        3: "[Clear understanding of concepts and their applications]",
        2: "[Solid grasp with minor gaps]",
        1: "[Basic understanding but lacking depth]",
        0: "[Significant conceptual errors]"
      }
    },
    {
      criterion: "Mathematical Analysis",
      points: 3,
      description: "Accuracy of calculations and problem-solving",
      levels: {
        3: "[Correct approach and accurate calculations with units]",
        2: "[Sound approach with minor errors]",
        1: "[General approach correct but multiple errors]",
        0: "[Major errors or incomplete]"
      }
    },
    {
      criterion: "Problem-Solving Process",
      points: 3,
      description: "Logical progression and methodology",
      levels: {
        3: "[Clear problem setup and logical solution path]",
        2: "[Good organization with minor omissions]",
        1: "[Basic structure but lacks clarity]",
        0: "[Disorganized or illogical approach]"
      }
    },
    {
      criterion: "Analysis/Interpretation",
      points: 3,
      description: "Quality of analysis and conclusions",
      levels: {
        3: "[Thorough analysis with justified conclusions]",
        2: "[Good analysis with adequate reasoning]",
        1: "[Basic analysis present]",
        0: "[Missing or incorrect analysis]"
      }
    }
  ],
  advanced: [
    {
      criterion: "Complex Analysis",
      points: 3,
      description: "Analysis of complex [SUBJECT] scenarios",
      levels: {
        3: "[Sophisticated analysis with multiple considerations]",
        2: "[Good analysis with minor gaps]",
        1: "[Basic analysis attempted]",
        0: "[Inadequate or missing analysis]"
      }
    },
    {
      criterion: "Mathematical Sophistication",
      points: 3,
      description: "Advanced mathematical reasoning and techniques",
      levels: {
        3: "[Expert use of advanced techniques]",
        2: "[Good application with minor errors]",
        1: "[Attempts advanced methods with errors]",
        0: "[Inappropriate or incorrect methods]"
      }
    },
    {
      criterion: "Synthesis/Connections",
      points: 3,
      description: "Integration of concepts and broader connections",
      levels: {
        3: "[Excellent synthesis across topics]",
        2: "[Good connections made]",
        1: "[Basic connections attempted]",
        0: "[No meaningful connections]"
      }
    },
    {
      criterion: "Real-World Applications",
      points: 3,
      description: "Application to practical scenarios",
      levels: {
        3: "[Sophisticated real-world connections]",
        2: "[Good practical applications]",
        1: "[Basic applications present]",
        0: "[No practical connections]"
      }
    }
  ]
};

module.exports = {
  TEMPLATE_RUBRICS
};