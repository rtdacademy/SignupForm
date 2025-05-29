/**
 * Assessment Functions for Momentum in One Dimension
 * Course: 2 (Physics 30)
 * Content: 02-momentum-one-dimension
 * 
 * This module provides AI-powered assessments for momentum concepts
 * using the shared assessment system with Physics 30 specific configuration.
 */

const { createAIMultipleChoice } = require('../../../shared/assessment-types/ai-multiple-choice');
const courseConfig = require('../../../courses-config/2/course-config.json');

/**
 * AI-powered multiple choice assessment for momentum in one dimension
 * Function name: course2_02_momentum_one_dimension_aiQuestion
 */
exports.course2_02_momentum_one_dimension_aiQuestion = createAIMultipleChoice({
  // Course-specific prompts for different difficulty levels
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
  
  // Hardcoded activity type for security (cannot be manipulated by client)
  activityType: 'lesson',
  
  // Enable KaTeX formatting for mathematical expressions
  katexFormatting: true,
  
  // Assessment settings from course configuration
  maxAttempts: courseConfig.activityTypes.lesson.maxAttempts,
  pointsValue: courseConfig.activityTypes.lesson.pointValue,
  showFeedback: courseConfig.activityTypes.lesson.showDetailedFeedback,
  enableHints: courseConfig.activityTypes.lesson.enableHints,
  attemptPenalty: courseConfig.activityTypes.lesson.attemptPenalty,
  theme: courseConfig.activityTypes.lesson.theme,
  allowDifficultySelection: courseConfig.activityTypes.lesson.allowDifficultySelection,
  
  // Course creator can override default difficulty for this specific assessment
  // Priority hierarchy (only for lesson type):
  // 1. Student's selected difficulty (highest priority)
  // 2. This defaultDifficulty setting (course creator's override)
  // 3. courseConfig.activityTypes.lesson.defaultDifficulty (fallback)
  // Comment out or remove the line below to use courseConfig default
  // defaultDifficulty: 'intermediate', // Uncomment and change to 'beginner' or 'advanced' to override
  
  // AI generation settings from course config
  aiSettings: courseConfig.activityTypes.lesson.aiSettings,
  
  // Physics 30 specific configuration
  subject: 'Physics 30',
  gradeLevel: 12,
  topic: 'Momentum in One Dimension',
  learningObjectives: [
    'Define momentum and identify its units',
    'Calculate momentum using p = mv',
    'Apply conservation of momentum to simple collisions',
    'Analyze the relationship between impulse and momentum change'
  ],
  
  // AI Chat Integration Settings
  // Controls whether the AI chat button appears for students on this assessment
  enableAIChat: true,
  
  // Additional context for AI tutors to understand the assessment focus
  // This helps AI provide more relevant assistance beyond just the question text
  aiChatContext: "This assessment focuses on momentum concepts in one dimension. Students are learning about the definition of momentum (p = mv), calculating momentum values, understanding conservation of momentum in collisions, and the relationship between impulse and momentum change. Common student difficulties include confusing momentum with force, incorrect unit usage (kg⋅m/s), and misapplying conservation laws in collision scenarios. AI tutors should emphasize conceptual understanding of momentum as 'quantity of motion' and guide students through step-by-step problem-solving approaches.",
  
  // Fallback questions in case AI generation fails
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
  
  // Cloud function configuration
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});