/**
 * Standard Rubrics for Momentum Assessments
 * These rubrics ensure consistent evaluation across all momentum-related questions
 * Each rubric uses a 4-level scoring system (0-3 points per criterion)
 * Total: 12 points (4 criteria × 3 points each)
 */

const MOMENTUM_RUBRICS = {
  beginner: [
    {
      criterion: "Conceptual Understanding",
      points: 3,
      description: "Understanding of momentum concepts (p = mv)",
      levels: {
        3: "Correctly defines momentum with units and explains it as quantity of motion with clear understanding",
        2: "Defines momentum with minor gaps in explanation or unit specification",
        1: "Basic definition present but lacks clarity or has minor errors",
        0: "Significant errors in definition or missing explanation"
      }
    },
    {
      criterion: "Real-World Application",
      points: 3,
      description: "Quality of real-world example demonstrating momentum",
      levels: {
        3: "Provides clear, relevant example showing how both mass and velocity affect momentum",
        2: "Good example but missing one aspect of how mass or velocity affects momentum",
        1: "Basic example present but lacks clear connection to momentum concepts",
        0: "No example or example doesn't demonstrate momentum"
      }
    },
    {
      criterion: "Scientific Communication",
      points: 3,
      description: "Explanation of momentum's importance in physics",
      levels: {
        3: "Clearly explains momentum conservation and provides multiple applications",
        2: "Explains conservation with at least one clear application",
        1: "Basic explanation of importance but lacks depth",
        0: "Missing or incorrect explanation of momentum's importance"
      }
    },
    {
      criterion: "Overall Clarity",
      points: 3,
      description: "Organization and clarity of response",
      levels: {
        3: "Well-organized response with logical flow and proper physics terminology",
        2: "Generally clear with minor organizational issues",
        1: "Understandable but poorly organized or unclear in places",
        0: "Disorganized or very difficult to follow"
      }
    }
  ],
  intermediate: [
    {
      criterion: "Conceptual Understanding",
      points: 3,
      description: "Understanding of conservation of momentum principles",
      levels: {
        3: "Demonstrates clear understanding of momentum conservation and its application to collisions",
        2: "Shows solid grasp of key concepts with minor gaps in explanation",
        1: "Basic understanding present but lacking depth or clarity",
        0: "Significant conceptual errors or missing explanations"
      }
    },
    {
      criterion: "Mathematical Analysis",
      points: 3,
      description: "Accuracy of calculations and proper use of units",
      levels: {
        3: "Correctly applies momentum equations; calculations accurate with proper units throughout",
        2: "Minor calculation errors or unit issues; approach is sound",
        1: "General approach correct but multiple errors in execution",
        0: "Major errors in approach or incomplete calculations"
      }
    },
    {
      criterion: "Problem-Solving Process",
      points: 3,
      description: "Organization and logical progression of solution",
      levels: {
        3: "Clearly identifies known/unknown quantities and shows logical progression through solution",
        2: "Good organization with minor omissions in setup or explanation",
        1: "Basic structure present but lacks clear organization",
        0: "Disorganized or incomplete problem-solving approach"
      }
    },
    {
      criterion: "Collision Analysis",
      points: 3,
      description: "Identification and justification of collision type",
      levels: {
        3: "Correctly identifies collision type with thorough justification based on physical reasoning",
        2: "Correct identification with adequate reasoning",
        1: "Identification present but justification is weak or incomplete",
        0: "Incorrect identification or missing analysis"
      }
    }
  ],
  advanced: [
    {
      criterion: "Complex System Analysis",
      points: 3,
      description: "Analysis of multi-object collision scenarios",
      levels: {
        3: "Thoroughly analyzes complex collisions with clear physics reasoning and vector considerations",
        2: "Good analysis with minor gaps in reasoning or vector treatment",
        1: "Basic analysis present but lacks depth or has errors",
        0: "Inadequate analysis of complex collision scenario"
      }
    },
    {
      criterion: "Mathematical Sophistication",
      points: 3,
      description: "Advanced calculations and mathematical reasoning",
      levels: {
        3: "All calculations correct with proper vector notation, units, and significant figures",
        2: "Minor errors in calculations or notation; approach is sophisticated",
        1: "Calculations attempted but multiple errors present",
        0: "Major calculation errors or inappropriate methods used"
      }
    },
    {
      criterion: "Energy-Momentum Analysis",
      points: 3,
      description: "Comparison of collision types and energy considerations",
      levels: {
        3: "Expertly compares elastic/inelastic collisions with clear energy and momentum analysis",
        2: "Good comparison with minor gaps in energy or momentum discussion",
        1: "Basic comparison present but lacks thorough analysis",
        0: "Missing or incorrect collision type comparison"
      }
    },
    {
      criterion: "Real-World Connections",
      points: 3,
      description: "Application to practical scenarios and deeper insights",
      levels: {
        3: "Makes sophisticated connections to real-world applications with specific examples",
        2: "Good real-world connections with adequate examples",
        1: "Basic connections made but lacks specific examples",
        0: "No meaningful real-world connections made"
      }
    }
  ]
};

module.exports = {
  MOMENTUM_RUBRICS
};