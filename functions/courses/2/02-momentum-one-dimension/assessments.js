/**
 * Assessment Functions for Momentum in One Dimension
 * Course: 2 (Physics 30)
 * Content: 02-momentum-one-dimension
 * 
 * This module provides AI-powered assessments for momentum concepts
 * using the shared assessment system with Physics 30 specific configuration.
 */

const { createAIMultipleChoice } = require('../../../shared/assessment-types/ai-multiple-choice');
const { createAILongAnswer } = require('../../../shared/assessment-types/ai-long-answer');
const courseConfig = require('../../../courses-config/2/course-config.json');

/**
 * AI-powered multiple choice assessment for momentum in one dimension
 * Function name: course2_02_momentum_one_dimension_aiQuestion
 * 
 * CONFIGURATION GUIDE:
 * All parameters below can be customized. Current values match course defaults from:
 * functions/courses-config/2/course-config.json -> activityTypes.lesson
 * 
 * To override any setting, simply change the value.
 * To use course defaults, you can comment out the line.
 */
exports.course2_02_momentum_one_dimension_aiQuestion = createAIMultipleChoice({
  // ===== REQUIRED: Activity Type =====
  // Determines which settings from course-config.json to use as defaults
  // Options: 'lesson', 'assignment', 'lab', 'exam'
  activityType: 'lesson',
  
  // ===== REQUIRED: Course-specific prompts =====
  prompts: {
    beginner: `Create a multiple-choice question about basic momentum concepts in one dimension for a Grade 12 Physics 30 student. 
    Focus on:
    - Definition of momentum (p = mv)
    - Units of momentum (kg·m/s)
    - Simple momentum calculations
    - Understanding the relationship between mass, velocity, and momentum
    
    Make the question clear and straightforward, testing fundamental understanding rather than complex applications.
    Include realistic values and everyday examples like cars, balls, or people moving.`,
    
    intermediate: `Create a multiple-choice question about momentum in one dimension for a Grade 12 Physics 30 student at an intermediate level.
    Focus on:
    - Conservation of momentum in simple collisions
    - Comparing momentum of different objects
    - Analyzing momentum changes when velocity or mass changes
    - Impulse-momentum relationship (J = Δp)
    
    Use scenarios that require students to apply momentum concepts to solve problems.
    Include reasonable physics values and relatable situations like sports, vehicles, or everyday collisions.`,
    
    advanced: `Create a challenging multiple-choice question about momentum in one dimension for a Grade 12 Physics 30 student.
    Focus on:
    - Complex momentum conservation problems
    - Elastic and inelastic collision scenarios
    - Systems with multiple objects
    - Analysis of momentum before and after interactions
    - Integration of momentum with other physics concepts
    
    Design problems that require multi-step thinking and deep understanding of momentum principles.
    Use realistic physics scenarios with appropriate values for Grade 12 level.`
  },
  
  // ===== ASSESSMENT SETTINGS =====
  // These use values from course-config.json -> activityTypes.lesson
  maxAttempts: 999,                    // Maximum attempts allowed (course default: 999)
  pointsValue: 5,                       // Points for correct answer (course default: 5)
  showFeedback: true,                   // Show detailed feedback (course default: true)
  enableHints: true,                    // Enable hint system (course default: true)
  attemptPenalty: 0,                    // Points deducted per attempt (course default: 0)
  theme: 'purple',                      // Color theme (course default: 'purple')
  allowDifficultySelection: false,      // Let students choose difficulty (course default: false)
  defaultDifficulty: 'intermediate',    // Default difficulty level (course default: 'intermediate')
  
  // ===== AI GENERATION SETTINGS =====
  // From course-config.json -> activityTypes.lesson.aiSettings
  aiSettings: {
    temperature: 0.7,    // AI creativity level 0-1 (course default: 0.7)
    topP: 0.9,          // Nucleus sampling (course default: 0.9)
    topK: 40            // Top-K sampling (default: 40)
  },
  
  // ===== FORMATTING OPTIONS =====
  katexFormatting: true,  // Enable LaTeX math rendering
  
  // ===== COURSE METADATA =====
  subject: 'Physics 30',
  gradeLevel: 12,
  topic: 'Momentum in One Dimension',
  learningObjectives: [
    'Define momentum and identify its units',
    'Calculate momentum using p = mv',
    'Apply conservation of momentum to simple collisions',
    'Analyze the relationship between impulse and momentum change'
  ],
  
  // ===== AI CHAT INTEGRATION =====
  enableAIChat: true,  // Show AI chat button for student support
  aiChatContext: "This assessment focuses on momentum concepts in one dimension. Students are learning about the definition of momentum (p = mv), calculating momentum values, understanding conservation of momentum in collisions, and the relationship between impulse and momentum change. Common student difficulties include confusing momentum with force, incorrect unit usage (kg⋅m/s), and misapplying conservation laws in collision scenarios. AI tutors should emphasize conceptual understanding of momentum as 'quantity of motion' and guide students through step-by-step problem-solving approaches.",
  
  // ===== FALLBACK QUESTIONS =====
  // Used when AI generation fails
  fallbackQuestions: [
    {
      questionText: "A 2000 kg car traveling at 15 m/s has what momentum?",
      options: [
        { id: 'a', text: '$30{,}000\\text{ kg}\\cdot\\text{m/s}$' },
        { id: 'b', text: '$15{,}000\\text{ kg}\\cdot\\text{m/s}$' },
        { id: 'c', text: '$2{,}000\\text{ kg}\\cdot\\text{m/s}$' },
        { id: 'd', text: '$7.5\\text{ kg}\\cdot\\text{m/s}$' }
      ],
      correctOptionId: 'a',
      explanation: 'Momentum = mass $\\times$ velocity = $2000\\text{ kg} \\times 15\\text{ m/s} = 30{,}000\\text{ kg}\\cdot\\text{m/s}$',
      difficulty: 'beginner'
    },
    {
      questionText: "If a 0.5 kg ball moving at 10 m/s collides with and sticks to a 1.5 kg ball at rest, what is their combined velocity after collision?",
      options: [
        { id: 'a', text: '2.5 m/s' },
        { id: 'b', text: '5.0 m/s' },
        { id: 'c', text: '7.5 m/s' },
        { id: 'd', text: '10.0 m/s' }
      ],
      correctOptionId: 'a',
      explanation: 'Using conservation of momentum: (0.5 kg)(10 m/s) = (0.5 + 1.5 kg)(v). Therefore v = 5/(2) = 2.5 m/s',
      difficulty: 'intermediate'
    }
  ],
  
  // ===== CLOUD FUNCTION SETTINGS =====
  timeout: 120,         // Function timeout in seconds
  memory: '512MiB',     // Memory allocation
  region: 'us-central1' // Deployment region
});

/**
 * AI-powered long answer assessment for momentum in one dimension
 * Function name: course2_02_momentum_one_dimension_aiLongAnswer
 * 
 * CONFIGURATION GUIDE:
 * All parameters below can be customized. Current values match course defaults from:
 * functions/courses-config/2/course-config.json -> activityTypes.assignment.longAnswer
 * 
 * To override any setting, simply change the value.
 * To use course defaults, you can comment out the line.
 */
exports.course2_02_momentum_one_dimension_aiLongAnswer = createAILongAnswer({
  // ===== REQUIRED: Activity Type =====
  // Determines which settings from course-config.json to use as defaults
  // Options: 'lesson', 'assignment', 'lab', 'exam'
  activityType: 'lesson',
  
  // ===== REQUIRED: Course-specific prompts =====
  prompts: {
    beginner: `Create a beginner-level long answer question about momentum in one dimension for a Grade 12 Physics 30 student.
    The question should:
    - Focus on explaining basic momentum concepts and conservation
    - Require students to define momentum and explain its properties
    - Ask for simple examples or applications
    - Be answerable in 100-200 words
    
    Create a clear rubric with 3-4 criteria that assess:
    - Understanding of momentum definition (p = mv)
    - Explanation of conservation principle
    - Use of appropriate examples
    - Clear communication of ideas`,
    
    intermediate: `Create an intermediate-level long answer question about momentum in one dimension for a Grade 12 Physics 30 student.
    The question should:
    - Require analysis of a collision scenario
    - Ask students to explain conservation of momentum with calculations
    - Include discussion of real-world applications
    - Be answerable in 150-300 words
    
    Create a rubric with 4-5 criteria that assess:
    - Correct application of momentum formula
    - Understanding of conservation in collisions
    - Mathematical reasoning and calculations
    - Connection to real-world scenarios
    - Quality of scientific explanation`,
    
    advanced: `Create a challenging long answer question about momentum in one dimension for a Grade 12 Physics 30 student.
    The question should:
    - Present a complex multi-object collision scenario
    - Require detailed analysis with multiple steps
    - Ask for evaluation of different collision types (elastic/inelastic)
    - Include discussion of energy considerations
    - Be answerable in 200-400 words
    
    Create a rubric with 5-6 criteria that assess:
    - Advanced problem-solving approach
    - Correct multi-step calculations
    - Distinction between collision types
    - Energy and momentum relationships
    - Critical thinking and analysis
    - Scientific communication quality`
  },
  
  // ===== ASSESSMENT SETTINGS =====
  // These use values from course-config.json -> activityTypes.assignment
  maxAttempts: 3,                      // Maximum attempts allowed (course default: 3)
  theme: 'blue',                       // Color theme (course default: 'blue')
  allowDifficultySelection: true,      // Let students choose difficulty (course default: true)
  defaultDifficulty: 'beginner',       // Default difficulty level (course default: 'beginner')
  
  // ===== LONG ANSWER SPECIFIC SETTINGS =====
  // From course-config.json -> activityTypes.assignment.longAnswer
  totalPoints: 10,                     // Total points for rubric (course default: 10)
  rubricCriteria: 4,                   // Number of rubric criteria (course default: 4)
  wordLimits: { min: 100, max: 400 }, // Word count limits (course default: 100-400)
  showRubric: true,                    // Show rubric to students (course default: true)
  showWordCount: true,                 // Show word counter (course default: true)
  showHints: false,                    // Show hints button (default: false)
  
  // ===== AI GENERATION SETTINGS =====
  // From course-config.json -> activityTypes.assignment.aiSettings
  aiSettings: {
    temperature: 0.7,    // AI creativity level 0-1 (course default: 0.7)
    topP: 0.9,          // Nucleus sampling (course default: 0.9)
    topK: 40            // Top-K sampling (default: 40)
  },
  
  // ===== FORMATTING OPTIONS =====
  katexFormatting: true,  // Enable LaTeX math rendering
  
  // ===== COURSE METADATA =====
  subject: 'Physics 30',
  gradeLevel: 12,
  topic: 'Momentum in One Dimension',
  learningObjectives: [
    'Explain the concept of momentum and its conservation',
    'Apply conservation of momentum to analyze collisions',
    'Distinguish between elastic and inelastic collisions',
    'Connect momentum concepts to real-world scenarios'
  ],
  
  // ===== AI CHAT INTEGRATION =====
  enableAIChat: true,  // Show AI chat button for student support
  aiChatContext: "This long answer assessment focuses on explaining momentum concepts and applying conservation laws. Students often struggle with: 1) Clearly distinguishing between momentum and force, 2) Explaining WHY momentum is conserved in collisions, 3) Connecting mathematical calculations to physical meaning. The rubric emphasizes both conceptual understanding and mathematical application. Guide students to structure their answers to address each rubric criterion.",
  
  // ===== FALLBACK QUESTIONS =====
  // Used when AI generation fails
  fallbackQuestions: [
    {
      questionText: "A 1500 kg car traveling at 20 m/s collides with a stationary 1000 kg car. After the collision, the cars stick together and move as one unit. Explain the principle of conservation of momentum, calculate the final velocity of the combined cars, and discuss what type of collision this represents. Include a discussion of why momentum is conserved in this scenario.",
      rubric: [
        {
          criterion: "Conservation Principle",
          points: 3,
          description: "Clearly explains the law of conservation of momentum and why it applies to collisions"
        },
        {
          criterion: "Mathematical Application",
          points: 3,
          description: "Correctly calculates initial momentum, final momentum, and final velocity with proper units"
        },
        {
          criterion: "Collision Type Analysis",
          points: 2,
          description: "Identifies this as an inelastic collision and explains what that means"
        },
        {
          criterion: "Scientific Communication",
          points: 2,
          description: "Presents ideas clearly with proper physics terminology and logical flow"
        }
      ],
      maxPoints: 10,
      wordLimit: { min: 150, max: 300 },
      sampleAnswer: `The law of conservation of momentum states that in a closed system with no external forces, the total momentum before a collision equals the total momentum after the collision. This principle applies because momentum is a conserved quantity in isolated systems.

For the given scenario:
Initial momentum = m₁v₁ + m₂v₂ = (1500 kg)(20 m/s) + (1000 kg)(0 m/s) = 30,000 kg·m/s

Since the cars stick together, they have the same final velocity (v_f):
Final momentum = (m₁ + m₂)v_f = (1500 + 1000)v_f = 2500v_f

By conservation of momentum:
30,000 = 2500v_f
v_f = 12 m/s

This is an inelastic collision because the objects stick together after impact. In inelastic collisions, kinetic energy is not conserved (some is converted to heat, sound, and deformation), but momentum is still conserved. Momentum conservation occurs because the collision forces between the cars are internal to the system—they are equal and opposite (Newton's third law), so they cancel out when considering the total system momentum.`,
      difficulty: 'intermediate'
    },
    {
      questionText: "Explain the concept of momentum in physics. In your answer, define momentum, describe its key properties, provide an everyday example, and explain why understanding momentum is important in physics.",
      rubric: [
        {
          criterion: "Definition and Formula",
          points: 3,
          description: "Correctly defines momentum and states the formula p = mv with units"
        },
        {
          criterion: "Properties of Momentum",
          points: 2,
          description: "Identifies momentum as a vector quantity and explains what this means"
        },
        {
          criterion: "Practical Example",
          points: 3,
          description: "Provides a clear, relevant everyday example that illustrates momentum"
        },
        {
          criterion: "Importance in Physics",
          points: 2,
          description: "Explains why momentum is a fundamental concept in physics"
        }
      ],
      maxPoints: 10,
      wordLimit: { min: 100, max: 200 },
      sampleAnswer: `Momentum is defined as the product of an object's mass and velocity, expressed by the formula p = mv, where p is momentum (kg·m/s), m is mass (kg), and v is velocity (m/s).

Momentum is a vector quantity, meaning it has both magnitude and direction. The direction of momentum is always the same as the direction of velocity. This vector nature is crucial when analyzing collisions or interactions between objects.

An everyday example is a bowling ball rolling down a lane. A heavy bowling ball moving at moderate speed has large momentum, making it effective at knocking down pins. A lightweight ball at the same speed would have less momentum and be less effective.

Understanding momentum is fundamental in physics because it is a conserved quantity in isolated systems. This conservation law allows us to predict the outcomes of collisions, analyze particle interactions, and understand everything from car crashes to rocket propulsion. Momentum conservation is one of the most powerful problem-solving tools in physics.`,
      difficulty: 'beginner'
    }
  ],
  
  // ===== CLOUD FUNCTION SETTINGS =====
  timeout: 180,         // Function timeout in seconds (longer for evaluation)
  memory: '1GiB',       // Memory allocation (more for text processing)
  region: 'us-central1' // Deployment region
});