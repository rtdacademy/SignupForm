/**
 * Assessment Functions for Time Management & Staying Active
 * Course: 4 (RTD Academy Orientation)
 * Content: 03-time-management-staying-active
 */

const { createAIMultipleChoice } = require('../../../shared/assessment-types/ai-multiple-choice');

// Basic course configuration fallback
const courseConfig = {
  activityTypes: {
    lesson: {
      maxAttempts: 999,
      pointValue: 5,
      theme: 'blue',
      allowDifficultySelection: false,
      defaultDifficulty: 'intermediate',
      showDetailedFeedback: true,
      enableHints: true,
      attemptPenalty: 0,
      aiSettings: {
        temperature: 0.7,
        topP: 0.9
      }
    }
  }
};

const activityDefaults = courseConfig.activityTypes.lesson;

/**
 * AI-powered multiple choice assessment for time management and staying active
 * Function name: course4_03_time_management_staying_active_aiQuestion
 */
exports.course4_03_time_management_staying_active_aiQuestion = createAIMultipleChoice({
  // ===== REQUIRED: Activity Type =====
  activityType: 'lesson',
  
  // ===== REQUIRED: Course-specific prompts =====
  prompts: {
    beginner: `Create a multiple-choice question about basic time management or staying active for online students.
    Focus on:
    - Simple time management strategies
    - Basic study scheduling concepts
    - Importance of physical activity for learning
    - Creating healthy study habits
    
    Make the question clear and practical for students new to online learning.`,
    
    intermediate: `Create a multiple-choice question about effective time management and staying active for online students.
    Focus on:
    - Balancing study time with physical activity
    - Time blocking and scheduling strategies
    - Managing distractions and maintaining focus
    - Creating productive learning environments
    
    Use scenarios that require students to apply time management concepts.`,
    
    advanced: `Create a challenging multiple-choice question about advanced time management and wellness strategies.
    Focus on:
    - Complex scheduling with multiple priorities
    - Integration of physical and mental wellness
    - Long-term planning and goal achievement
    - Adapting strategies for different learning styles
    
    Design problems that require sophisticated thinking about work-life balance.`
  },
  
  // ===== ASSESSMENT SETTINGS =====
  maxAttempts: activityDefaults.maxAttempts,
  pointsValue: activityDefaults.pointValue,
  showFeedback: activityDefaults.showDetailedFeedback,
  enableHints: activityDefaults.enableHints,
  attemptPenalty: activityDefaults.attemptPenalty,
  theme: activityDefaults.theme,
  allowDifficultySelection: activityDefaults.allowDifficultySelection,
  defaultDifficulty: activityDefaults.defaultDifficulty,
  
  // ===== AI GENERATION SETTINGS =====
  aiSettings: {
    temperature: activityDefaults.aiSettings.temperature,
    topP: activityDefaults.aiSettings.topP,
    topK: 40
  },
  
  // ===== FORMATTING OPTIONS =====
  katexFormatting: false, // No math needed for this course
  
  // ===== COURSE METADATA =====
  subject: 'RTD Academy Orientation',
  gradeLevel: 'Multi-Grade',
  topic: 'Time Management and Staying Active',
  learningObjectives: [
    'Develop effective time management strategies',
    'Understand the importance of physical activity in learning',
    'Create balanced study schedules',
    'Maintain motivation and focus in online learning'
  ],
  
  // ===== AI CHAT INTEGRATION =====
  enableAIChat: true,
  aiChatContext: "This assessment focuses on time management and staying physically active while learning online. Students often struggle with: 1) Creating realistic study schedules, 2) Balancing screen time with physical activity, 3) Staying motivated without classroom structure, 4) Managing distractions at home. Help students develop practical strategies for success.",
  
  // ===== FALLBACK QUESTIONS =====
  fallbackQuestions: [
    {
      questionText: "What is the most effective way to manage your time when studying online?",
      options: [
        { id: 'a', text: 'Study for 8 hours straight without breaks' },
        { id: 'b', text: 'Create a schedule with regular breaks and stick to it' },
        { id: 'c', text: 'Only study when you feel motivated' },
        { id: 'd', text: 'Wait until the last minute to complete assignments' }
      ],
      correctOptionId: 'b',
      explanation: 'Creating a consistent schedule with regular breaks helps maintain focus and prevents burnout, making your study time more effective.',
      difficulty: 'beginner'
    },
    {
      questionText: "Why is physical activity important for online learners?",
      options: [
        { id: 'a', text: 'It improves focus, reduces stress, and enhances memory' },
        { id: 'b', text: 'It makes you tired so you sleep better' },
        { id: 'c', text: 'It wastes time that could be spent studying' },
        { id: 'd', text: 'It is only important for athletes' }
      ],
      correctOptionId: 'a',
      explanation: 'Physical activity improves blood flow to the brain, reduces stress hormones, and enhances memory formation, all of which benefit learning.',
      difficulty: 'intermediate'
    }
  ],
  
  // ===== CLOUD FUNCTION SETTINGS =====
  timeout: 120,
  memory: '512MiB',
  region: 'us-central1'
});