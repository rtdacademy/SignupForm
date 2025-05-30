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
const { getActivityTypeSettings, getWordLimitsForDifficulty } = require('../../../shared/utilities/config-loader');
const { MOMENTUM_RUBRICS } = require('../../../shared/rubrics');
const courseConfig = require('../../../courses-config/2/course-config.json');

// ===== ACTIVITY TYPE CONFIGURATION =====
// Set the activity type for all assessments in this content module
// Options: 'lesson', 'assignment', 'lab', 'exam'
// This determines which default settings are used from course-config.json
const ACTIVITY_TYPE = 'lesson';

// Get the default settings for this activity type
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);
const longAnswerDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE, 'longAnswer');

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
  // Activity type is set at the top of this file: ACTIVITY_TYPE = '${ACTIVITY_TYPE}'
  activityType: ACTIVITY_TYPE,
  
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
  // These use values from course-config.json -> activityTypes[ACTIVITY_TYPE]
  // Change any value below to override the course default
  maxAttempts: activityDefaults.maxAttempts,                      // Course default: 999
  pointsValue: activityDefaults.pointValue,                       // Course default: 5
  showFeedback: activityDefaults.showDetailedFeedback,           // Course default: true
  enableHints: activityDefaults.enableHints,                     // Course default: true
  attemptPenalty: activityDefaults.attemptPenalty,               // Course default: 0
  theme: activityDefaults.theme,                                 // Course default: 'purple'
  allowDifficultySelection: activityDefaults.allowDifficultySelection, // Course default: false
  defaultDifficulty: activityDefaults.defaultDifficulty,         // Course default: 'intermediate'
  
  // ===== AI GENERATION SETTINGS =====
  // From course-config.json -> activityTypes[ACTIVITY_TYPE].aiSettings
  // Change any value below to override the course default
  aiSettings: {
    temperature: activityDefaults.aiSettings.temperature,  // Course default: 0.7
    topP: activityDefaults.aiSettings.topP,               // Course default: 0.9
    topK: 40  // Not in config, using assessment system default
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
  // Activity type is set at the top of this file: ACTIVITY_TYPE = '${ACTIVITY_TYPE}'
  activityType: ACTIVITY_TYPE,
  
  // ===== STANDARD RUBRICS =====
  // Use the predefined rubrics for consistency
  rubrics: MOMENTUM_RUBRICS,
  
  // ===== REQUIRED: Course-specific prompts =====
  prompts: {
    beginner: `Create a simple long answer question about momentum for Grade 12 Physics.
    
    The question should ask students to:
    - Define momentum and explain what it means physically
    - Give one clear real-world example
    - Explain why momentum is important in physics
    
    Word limit: ${getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'beginner').min}-${getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'beginner').max} words
    
    Use the provided rubric exactly as given - do not modify the criteria or point values.`,
    
    intermediate: `Create a momentum conservation question for Grade 12 Physics.
    
    The question should ask students to:
    - Explain conservation of momentum in a collision scenario
    - Calculate the final velocity using given values
    - Identify the type of collision and explain why
    
    Word limit: ${getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'intermediate').min}-${getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'intermediate').max} words
    
    Use the provided rubric exactly as given - do not modify the criteria or point values.`,
    
    advanced: `Create a challenging momentum question for Grade 12 Physics.
    
    The question should ask students to:
    - Analyze a complex collision with multiple objects
    - Compare elastic vs inelastic collisions in the scenario
    - Calculate key values and explain the physics
    - Discuss real-world applications
    
    Word limit: ${getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'advanced').min}-${getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'advanced').max} words
    
    Use the provided rubric exactly as given - do not modify the criteria or point values.`
  },
  
  // ===== ASSESSMENT SETTINGS =====
  // These use values from course-config.json -> activityTypes[ACTIVITY_TYPE]
  // Change any value below to override the course default
  maxAttempts: longAnswerDefaults.maxAttempts,                      // Course default: 999
  theme: longAnswerDefaults.theme,                                 // Course default: 'purple'
  allowDifficultySelection: longAnswerDefaults.allowDifficultySelection, // Course default: false
  defaultDifficulty: longAnswerDefaults.defaultDifficulty,         // Course default: 'intermediate'
  
  // ===== LONG ANSWER SPECIFIC SETTINGS =====
  // From course-config.json -> activityTypes[ACTIVITY_TYPE].longAnswer
  // Change any value below to override the course default
  totalPoints: 12,                                      // Override: Using 12 points for all momentum assessments
  rubricCriteria: 4,                                    // Override: Using 4 criteria for all levels
  wordLimits: longAnswerDefaults.wordLimits,           // Course default: {min: 50, max: 200}
  showRubric: longAnswerDefaults.showRubric,           // Course default: true
  showWordCount: longAnswerDefaults.showWordCount,     // Course default: true
  showHints: false,                    // Custom override - not using default
  
  // ===== AI GENERATION SETTINGS =====
  // From course-config.json -> activityTypes[ACTIVITY_TYPE].aiSettings
  // Change any value below to override the course default
  aiSettings: {
    temperature: longAnswerDefaults.aiSettings.temperature,  // Course default: 0.7
    topP: longAnswerDefaults.aiSettings.topP,               // Course default: 0.9
    topK: 40  // Not in config, using assessment system default
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
  
  // ===== EVALUATION GUIDANCE =====
  evaluationGuidance: {
    commonMistakes: [
      "Confusing momentum (p = mv) with kinetic energy (KE = ½mv²)",
      "Not including units (kg·m/s) or using incorrect units",
      "Stating momentum is conserved without explaining why (Newton's third law)",
      "Mixing up elastic vs inelastic collision definitions",
      "Forgetting momentum is a vector (direction matters)"
    ],
    scoringNotes: {
      beginner: "Use the 4-level rubric (0-3 points per criterion). Focus on conceptual understanding.",
      intermediate: "Use the 4-level rubric (0-3 points per criterion). Balance conceptual understanding with mathematical accuracy.",
      advanced: "Use the 4-level rubric (0-3 points per criterion). Expect sophisticated analysis and connections."
    },
    scoringReminder: "IMPORTANT: Only assign whole number scores (0, 1, 2, or 3) based on the rubric levels. No partial points."
  },
  
  // ===== FALLBACK QUESTIONS =====
  // Used when AI generation fails
  fallbackQuestions: [
    {
      questionText: "A 1500 kg car traveling at 20 m/s collides with a stationary 1000 kg car. After the collision, the cars stick together. Explain conservation of momentum, calculate the final velocity, and identify what type of collision this is.",
      rubric: MOMENTUM_RUBRICS.intermediate,
      maxPoints: 12,
      wordLimit: getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'intermediate'),
      sampleAnswer: `Conservation of momentum states that total momentum before a collision equals total momentum after, when no external forces act on the system.

Initial momentum: p = m₁v₁ + m₂v₂ = (1500 kg)(20 m/s) + (1000 kg)(0 m/s) = 30,000 kg·m/s

After collision, both cars move together at velocity v_f:
Final momentum: (1500 + 1000)v_f = 2500v_f

By conservation: 30,000 = 2500v_f
Therefore: v_f = 12 m/s

This is an inelastic collision because the cars stick together. In inelastic collisions, kinetic energy is lost but momentum is conserved.`,
      difficulty: 'intermediate'
    },
    {
      questionText: "Define momentum and explain what it means physically. Give one clear real-world example. Explain why momentum is important in physics.",
      rubric: MOMENTUM_RUBRICS.beginner,
      maxPoints: 12,
      wordLimit: getWordLimitsForDifficulty(courseConfig, ACTIVITY_TYPE, 'beginner'),
      sampleAnswer: `Momentum is the product of mass and velocity: p = mv. Units are kg·m/s. It represents the "quantity of motion" an object has - how hard it is to stop.

Example: A bowling ball has more momentum than a tennis ball at the same speed because of its greater mass. This is why the bowling ball knocks down pins more effectively.

Momentum is important because it's conserved in collisions. This conservation law lets us predict outcomes in crashes, explosions, and other interactions. It's a fundamental tool for solving physics problems.`,
      difficulty: 'beginner'
    }
  ],
  
  // ===== CLOUD FUNCTION SETTINGS =====
  timeout: 180,         // Function timeout in seconds (longer for evaluation)
  memory: '1GiB',       // Memory allocation (more for text processing)
  region: 'us-central1' // Deployment region
});