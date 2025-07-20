const { createAIShortAnswer } = require('../../shared/assessment-types/ai-short-answer');

// Question 6: Economic Decision Making Short Answer
exports.course3_02_economic_environment_shortAnswer = createAIShortAnswer({
  prompt: `Create a short answer question about how students can apply economic knowledge to personal financial decisions for Grade 11-12 students.
    
    The question should:
    - Focus on practical application of economic concepts
    - Be answerable in 30-60 words
    - Test understanding of how economic indicators affect personal choices
    - Include real-world scenarios students can relate to
    - Require students to explain their reasoning
    
    Examples might include:
    - How to adjust spending based on inflation trends
    - When to save vs. invest based on interest rate changes
    - How unemployment rates might affect career planning
    - Personal financial strategies during economic uncertainty`,
  
  activityType: 'lesson',
  pointsValue: 2,
  wordLimits: { min: 20, max: 80 },
  
  // Enable AI chat for help
  enableAIChat: true,
  aiChatContext: "This question tests practical application of economic concepts to personal finance. Help students think about real-world connections between economic indicators and their daily financial decisions.",
  
  // Assessment settings
  maxAttempts: 5,
  showHints: false,
  showWordCount: true,
  theme: 'green',
  
  // Course metadata
  subject: 'Financial Literacy',
  gradeLevel: '11-12',
  topic: 'Economic Decision Making',
  learningObjectives: [
    'Apply economic concepts to personal financial decisions',
    'Explain how economic indicators influence personal choices',
    'Demonstrate understanding of economic principles in daily life',
    'Communicate economic reasoning clearly and concisely'
  ],
  
  // Evaluation guidance
  evaluationGuidance: {
    commonMistakes: [
      "Providing vague answers without specific economic reasoning",
      "Focusing only on general advice without connecting to economic indicators",
      "Using examples that don't match the economic scenario",
      "Confusing economic indicators with personal preferences"
    ],
    scoringReminder: "Look for clear connections between economic concepts and personal financial decisions. Award credit for practical reasoning even if specific terminology isn't perfect."
  },
  
  // Fallback questions
  fallbackQuestions: [
    {
      questionText: "If inflation is rising at 4% per year and your savings account earns 2% interest, explain what this means for your purchasing power and suggest one specific action you could take.",
      expectedAnswer: "Your purchasing power is decreasing because inflation (4%) is higher than your savings interest (2%), meaning you're losing 2% purchasing power annually. You should consider moving money to higher-yield investments or accounts that beat inflation.",
      sampleAnswer: "When inflation (4%) exceeds my savings rate (2%), my money loses purchasing power over time. I'm effectively losing 2% of my buying power each year. I should consider moving some savings to investments like stocks or high-yield accounts that historically outpace inflation.",
      acceptableAnswers: [
        "losing purchasing power",
        "inflation higher than savings rate",
        "need higher yield investment",
        "move to stocks or better accounts"
      ],
      wordLimit: { min: 20, max: 80 },
      difficulty: 'intermediate'
    },
    {
      questionText: "You're planning to buy a car next year. Interest rates are currently low but economists predict they will rise. How might this economic forecast influence your decision timing and financing approach?",
      expectedAnswer: "I should consider buying sooner to lock in current low interest rates for financing. Rising rates would increase loan costs, making the car more expensive later. I might also save more aggressively now or consider financing options that protect against rate increases.",
      sampleAnswer: "Since interest rates are expected to rise, I should accelerate my car purchase timeline to secure financing at current low rates. Waiting could cost me significantly more in interest payments. I'll focus on saving for a larger down payment now and explore pre-approved loans to lock in today's rates.",
      acceptableAnswers: [
        "buy sooner to lock in low rates",
        "rising rates increase loan costs",
        "save more for down payment",
        "get pre-approved financing"
      ],
      wordLimit: { min: 20, max: 80 },
      difficulty: 'intermediate'
    }
  ],
  
  // Cloud function settings
  timeout: 90,
  memory: '512MiB',
  region: 'us-central1'
});