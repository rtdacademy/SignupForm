const { createStandardMultipleChoice } = require('../../shared/assessment-types/standard-multiple-choice');

// Question 4: Economic Cycles and Financial Strategy (Standard Multiple Choice)
exports.course3_02_economic_environment_question4 = createStandardMultipleChoice({
  questions: [
    {
      questionText: "During which phase of the economic cycle should you focus on building your emergency fund and reducing debt?",
      options: [
        { 
          id: 'a', 
          text: 'Expansion - when the economy is growing', 
          feedback: 'Correct! During expansion, employment is strong and incomes are rising, making it the best time to save and pay down debt.'
        },
        { 
          id: 'b', 
          text: 'Peak - when economic activity is at its highest', 
          feedback: 'At the peak, it\'s better to prepare for the coming downturn rather than build savings.'
        },
        { 
          id: 'c', 
          text: 'Recession - when the economy is contracting', 
          feedback: 'During recessions, focus should be on preserving cash and essential expenses.'
        },
        { 
          id: 'd', 
          text: 'Trough - when the economy is at its lowest point', 
          feedback: 'At the trough, you should preserve cash and look for investment opportunities.'
        }
      ],
      correctOptionId: 'a',
      explanation: 'During economic expansion, employment rates are high, wages tend to increase, and people have more stable income. This makes it the ideal time to build emergency funds and pay down high-interest debt before the next economic downturn.',
      difficulty: 'intermediate',
      tags: ['economic-cycles', 'emergency-fund', 'debt-management']
    },
    {
      questionText: "Sarah has $5,000 saved and the economy just entered a recession. What should be her PRIMARY financial priority?",
      options: [
        { 
          id: 'a', 
          text: 'Invest in stocks since prices are lower', 
          feedback: 'While stock prices may be lower, preserving cash is more important during uncertain times.'
        },
        { 
          id: 'b', 
          text: 'Make a large purchase before prices go up', 
          feedback: 'During recessions, prices often fall or stay stable, not rise.'
        },
        { 
          id: 'c', 
          text: 'Preserve her cash for emergencies and essential expenses', 
          feedback: 'Correct! During recessions, job security decreases and unexpected expenses may arise, making cash preservation crucial.'
        },
        { 
          id: 'd', 
          text: 'Take out a loan to buy real estate', 
          feedback: 'Taking on debt during economic uncertainty increases financial risk.'
        }
      ],
      correctOptionId: 'c',
      explanation: 'During a recession, unemployment rises and economic uncertainty increases. The priority should be preserving cash for potential job loss, medical emergencies, or other unexpected expenses. Investment opportunities can wait until financial stability is secured.',
      difficulty: 'intermediate',
      tags: ['economic-cycles', 'recession-strategy', 'cash-management']
    },
    {
      questionText: "Which economic phase typically offers the best opportunities for making major purchases like homes or cars?",
      options: [
        { 
          id: 'a', 
          text: 'Peak - when everyone has money to spend', 
          feedback: 'At economic peaks, prices are typically at their highest, making purchases more expensive.'
        },
        { 
          id: 'b', 
          text: 'Expansion - when employment and income are growing', 
          feedback: 'While employment is good during expansion, prices are rising. Better opportunities exist elsewhere.'
        },
        { 
          id: 'c', 
          text: 'Trough - when the economy is at its lowest', 
          feedback: 'Correct! During economic troughs, prices are low, interest rates are often reduced, and sellers are motivated.'
        },
        { 
          id: 'd', 
          text: 'Recession - when businesses are struggling', 
          feedback: 'While prices may be lower in recession, job security issues make major purchases risky.'
        }
      ],
      correctOptionId: 'c',
      explanation: 'The economic trough represents the lowest point in the economic cycle, when prices have fallen, interest rates are often at their lowest, and sellers (including businesses) are motivated to make deals. However, this strategy only works if you have job security and adequate savings.',
      difficulty: 'advanced',
      tags: ['economic-cycles', 'major-purchases', 'timing-strategy']
    },
    {
      questionText: "What is the main characteristic that signals the economy is moving from recession to recovery (trough phase)?",
      options: [
        { 
          id: 'a', 
          text: 'Stock prices reach their all-time highs', 
          feedback: 'All-time highs indicate a peak or late expansion phase, not early recovery.'
        },
        { 
          id: 'b', 
          text: 'Unemployment stops rising and begins to stabilize', 
          feedback: 'Correct! The trough is marked by unemployment hitting its peak and beginning to stabilize, signaling the start of recovery.'
        },
        { 
          id: 'c', 
          text: 'Interest rates are raised to combat inflation', 
          feedback: 'Rate increases to combat inflation happen during late expansion or peak phases.'
        },
        { 
          id: 'd', 
          text: 'Consumer spending increases dramatically', 
          feedback: 'Dramatic spending increases indicate expansion, not the beginning of recovery.'
        }
      ],
      correctOptionId: 'b',
      explanation: 'The trough phase is characterized by unemployment reaching its highest level and then stabilizing. This signals that the worst of the recession is over and recovery is beginning. Other indicators include stabilizing GDP and the beginning of renewed business investment.',
      difficulty: 'intermediate',
      tags: ['economic-cycles', 'trough-phase', 'economic-indicators']
    },
    {
      questionText: "During an economic expansion, which strategy would be LEAST effective for protecting your financial future?",
      options: [
        { 
          id: 'a', 
          text: 'Building a larger emergency fund', 
          feedback: 'Building emergency funds during good times is smart preparation for future downturns.'
        },
        { 
          id: 'b', 
          text: 'Paying down high-interest debt', 
          feedback: 'Using good economic times to eliminate debt reduces financial risk.'
        },
        { 
          id: 'c', 
          text: 'Taking on maximum debt to buy luxury items', 
          feedback: 'Correct! Loading up on debt for luxuries during expansion leaves you vulnerable when the cycle turns.'
        },
        { 
          id: 'd', 
          text: 'Investing in education or skills training', 
          feedback: 'Improving your skills during good times increases job security and earning potential.'
        }
      ],
      correctOptionId: 'c',
      explanation: 'While economic expansion brings optimism and higher incomes, taking on maximum debt for luxury purchases is dangerous. Economic cycles are inevitable, and excessive debt during good times can lead to financial disaster when the economy contracts.',
      difficulty: 'intermediate',
      tags: ['economic-cycles', 'debt-management', 'financial-strategy']
    }
  ],
  
  activityType: 'lesson',
  
  // Question selection settings
  randomizeQuestions: true,
  randomizeOptions: true,
  allowSameQuestion: false,
  
  // Assessment settings
  //maxAttempts: 3,
  //pointsValue: 5,
  //showFeedback: true,
  //enableHints: true,
  //attemptPenalty: 0,
  theme: 'purple',
  
  // Cloud function settings
  timeout: 60,
  memory: '256MiB',
  region: 'us-central1'
});