const { createAILongAnswer } = require('shared/assessment-types/ai-long-answer');

// Question 5: Economic Analysis Long Answer
exports.course3_02_economic_environment_longAnswer = createAILongAnswer({
  prompt: `Create a long answer question about how economic conditions affect personal financial decisions for Grade 11-12 students.
    
    The question should:
    - Present a scenario with multiple economic indicators changing
    - Ask students to analyze the situation and recommend financial strategies
    - Require consideration of both short-term and long-term impacts
    - Include real-world context (e.g., planning for college, first job, etc.)
    
    Rubric should evaluate:
    1. Economic Analysis (3 points): Accurate interpretation of economic indicators
    2. Strategic Thinking (4 points): Well-reasoned financial strategies with justification
    3. Risk Consideration (2 points): Acknowledges uncertainties and trade-offs
    4. Communication (1 point): Clear, organized presentation of ideas
    
    Total: 10 points
    Word limit: 200-400 words`,
  
  // Single rubric for all students
  rubric: [
    {
      criterion: "Economic Analysis",
      points: 3,
      description: "Accurate interpretation of multiple economic indicators",
      levels: {
        3: "Correctly interprets all indicators and their relationships",
        2: "Generally accurate with minor errors or omissions",
        1: "Some understanding but significant errors in interpretation",
        0: "Incorrect or no analysis of indicators"
      }
    },
    {
      criterion: "Strategic Thinking",
      points: 4,
      description: "Well-reasoned financial strategies with justification",
      levels: {
        4: "Comprehensive strategies clearly linked to economic conditions with strong justification",
        3: "Good strategies with reasonable justification",
        2: "Basic strategies but justification is weak or unclear",
        1: "Limited strategies with little justification",
        0: "No clear strategies provided"
      }
    },
    {
      criterion: "Risk Consideration",
      points: 2,
      description: "Acknowledges uncertainties and trade-offs",
      levels: {
        2: "Thoughtfully discusses risks and trade-offs in recommendations",
        1: "Some acknowledgment of risks but limited analysis",
        0: "No consideration of risks or trade-offs"
      }
    },
    {
      criterion: "Communication",
      points: 1,
      description: "Clear, organized presentation of ideas",
      levels: {
        1: "Ideas presented clearly with logical organization",
        0: "Poor organization or unclear presentation"
      }
    }
  ],
  
  activityType: 'lesson',
  totalPoints: 10,
  wordLimits: { min: 200, max: 400 },
  
  // Enable AI chat for help
  enableAIChat: true,
  aiChatContext: "This question tests understanding of how economic conditions affect personal financial decisions. Guide students to think about real-world impacts and practical strategies without giving away specific answers.",
  
  // Assessment settings
  maxAttempts: 3,
  showRubric: true,
  showWordCount: true,
  showHints: false,
  theme: 'purple',
  
  // Course metadata
  subject: 'Financial Literacy',
  gradeLevel: '11-12',
  topic: 'Economic Environment and Personal Finance',
  learningObjectives: [
    'Analyze how economic indicators affect personal finances',
    'Develop strategies for different economic conditions',
    'Apply economic understanding to financial decision-making',
    'Communicate financial strategies clearly'
  ],
  
  // Evaluation guidance
  evaluationGuidance: {
    commonMistakes: [
      "Confusing correlation with causation in economic relationships",
      "Providing strategies without connecting them to the economic conditions",
      "Using examples that don't match the economic scenario presented",
      "Forgetting to consider both positive and negative impacts"
    ],
    scoringReminder: "Award partial credit for partially correct explanations. Look for evidence of understanding even if expression is imperfect. Look for connections between multiple concepts and justified strategies."
  },
  
  // Fallback questions
  fallbackQuestions: [
    {
      questionText: "You're a recent college graduate starting your first job during a period of economic change. Interest rates are rising from historic lows, inflation is at 5%, and unemployment is decreasing. Analyze this economic situation and develop a comprehensive financial strategy for your first year of employment. Address how you would handle budgeting, saving, debt management, and initial investing decisions.",
      rubric: [
        {
          criterion: "Economic Analysis",
          points: 3,
          description: "Accurate interpretation of the economic indicators"
        },
        {
          criterion: "Strategic Thinking",
          points: 4,
          description: "Well-reasoned financial strategies with justification"
        },
        {
          criterion: "Risk Consideration",
          points: 2,
          description: "Acknowledges uncertainties and trade-offs"
        },
        {
          criterion: "Communication",
          points: 1,
          description: "Clear, organized presentation"
        }
      ],
      maxPoints: 10,
      wordLimit: { min: 200, max: 400 },
      sampleAnswer: "The economic indicators suggest we're in a late expansion phase: rising rates indicate the Federal Reserve is combating inflation, while low unemployment shows a strong job market. This creates both opportunities and challenges for financial planning. For budgeting, I'd use the 50/30/20 rule but adjust for inflation by allocating extra to needs (perhaps 55%) since costs are rising. I'd prioritize building a 6-month emergency fund in a high-yield savings account to take advantage of rising rates—if rates reach 4%, that's better than historic norms. For debt management, I'd aggressively pay down any variable-rate debt (like credit cards) since rates are rising, making this debt increasingly expensive. If I have fixed-rate student loans below 5%, I'd pay minimums since inflation is eroding the real cost of this debt. For investing, I'd start contributing to my 401(k) to get any employer match (free money), then open a Roth IRA. Given my long time horizon, I'd invest in low-cost index funds despite market volatility. The key risk is that rising rates might trigger a recession, so maintaining that emergency fund is crucial for job security concerns."
    }
  ],
  
  // Cloud function settings
  timeout: 120,
  memory: '1GiB',
  region: 'us-central1'
});