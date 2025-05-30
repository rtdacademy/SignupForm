const ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS = [
  {
    difficulty: 'beginner',
    questionText: 'If the inflation rate is 3% per year, and a video game costs $60 today, approximately how much would a similar game cost in 2 years?',
    options: [
      { 
        id: 'a', 
        text: '$60 - prices don\'t change that quickly',
        feedback: 'Inflation means prices generally rise over time, even if slowly.'
      },
      { 
        id: 'b', 
        text: '$63.70',
        feedback: 'Correct! With 3% annual inflation: Year 1: $60 × 1.03 = $61.80, Year 2: $61.80 × 1.03 = $63.65 (rounded to $63.70)'
      },
      { 
        id: 'c', 
        text: '$66',
        feedback: 'This would be 10% total inflation (5% per year), which is higher than the stated 3%.'
      },
      { 
        id: 'd', 
        text: '$78',
        feedback: 'This represents 30% inflation, which would be 10 times the annual rate given.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'With 3% annual inflation, prices compound each year. After 2 years: $60 × (1.03)² = $60 × 1.0609 = $63.65. This shows how even modest inflation reduces purchasing power over time.'
  },
  {
    difficulty: 'intermediate',
    questionText: 'The central bank just raised interest rates from 2% to 4%. Which of the following is the MOST likely immediate effect on your family\'s finances?',
    options: [
      { 
        id: 'a', 
        text: 'Your parents\' savings account will immediately double its interest earnings',
        feedback: 'Correct! If rates double from 2% to 4%, interest earnings on savings also double (though the base amount stays the same).'
      },
      { 
        id: 'b', 
        text: 'The family home will lose half its value',
        feedback: 'Home values may be affected by interest rates, but not this dramatically or immediately.'
      },
      { 
        id: 'c', 
        text: 'Grocery prices will immediately drop by 50%',
        feedback: 'Interest rates affect inflation over time, but not this directly or dramatically.'
      },
      { 
        id: 'd', 
        text: 'Your student loan payments will be cut in half',
        feedback: 'Higher interest rates make borrowing more expensive, not less.'
      }
    ],
    correctOptionId: 'a',
    explanation: 'When interest rates rise, savers benefit immediately through higher returns on deposits. A savings account earning 2% would now earn 4%, doubling the interest income. However, borrowers face higher costs, and the economy may slow over time.'
  },
  {
    difficulty: 'advanced',
    questionText: 'During a recession, unemployment rises to 8%, GDP contracts by 2%, and the central bank lowers interest rates to 0.5%. Maria has $10,000 in savings, a stable government job, and is considering buying her first home. What\'s her BEST financial strategy?',
    options: [
      { 
        id: 'a', 
        text: 'Keep all money in savings to earn the 0.5% interest',
        feedback: 'At 0.5%, savings barely keep up with inflation. This misses the opportunity of low mortgage rates.'
      },
      { 
        id: 'b', 
        text: 'Invest everything in stocks while prices are low',
        feedback: 'While stocks may be cheaper, using all savings eliminates the home purchase option and emergency funds.'
      },
      { 
        id: 'c', 
        text: 'Use the low interest rates to buy a home, keeping some emergency savings',
        feedback: 'Correct! Her stable job provides security, low rates make mortgages affordable, and home prices may be negotiable during recession.'
      },
      { 
        id: 'd', 
        text: 'Wait until the economy fully recovers before making any decisions',
        feedback: 'This misses the opportunity of low interest rates and potentially lower home prices during recession.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'During recessions, those with stable income can benefit from low interest rates and motivated sellers. Maria\'s government job provides security that many lack during economic downturns. By buying now with historically low mortgage rates while maintaining an emergency fund, she maximizes the economic conditions in her favor.'
  },
  {
    difficulty: 'beginner',
    questionText: 'Your part-time job pays $15 per hour. If inflation is 4% this year but your wage stays the same, what happens to your real purchasing power?',
    options: [
      { 
        id: 'a', 
        text: 'It increases because you\'re still earning $15/hour',
        feedback: 'Your nominal wage is the same, but inflation reduces what that money can buy.'
      },
      { 
        id: 'b', 
        text: 'It stays the same because your wage hasn\'t changed',
        feedback: 'Even though your wage number is the same, inflation means it buys less than before.'
      },
      { 
        id: 'c', 
        text: 'It decreases because your money buys less than before',
        feedback: 'Correct! With 4% inflation, your $15 only buys what $14.42 would have bought last year.'
      },
      { 
        id: 'd', 
        text: 'It doubles because of the inflation effect',
        feedback: 'Inflation reduces purchasing power, it doesn\'t increase it.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'Inflation means your money buys less over time. If prices rise 4% but your wage stays at $15/hour, you\'ve effectively had a pay cut. Your $15 now only buys what $14.42 ($15 ÷ 1.04) would have bought before inflation.'
  },
  {
    difficulty: 'intermediate',
    questionText: 'The unemployment rate jumps from 4% to 7% in your city. Which economic effect are you LEAST likely to experience, even if you keep your job?',
    options: [
      { 
        id: 'a', 
        text: 'Reduced hours or overtime opportunities at work',
        feedback: 'High unemployment often means employers reduce hours to cut costs.'
      },
      { 
        id: 'b', 
        text: 'Lower prices at local restaurants and stores',
        feedback: 'Businesses often reduce prices to attract customers when unemployment is high.'
      },
      { 
        id: 'c', 
        text: 'Significant wage increases and bonuses',
        feedback: 'Correct! High unemployment means more competition for jobs, reducing employer incentive to raise wages.'
      },
      { 
        id: 'd', 
        text: 'Friends or family members struggling financially',
        feedback: 'With higher unemployment, it\'s likely someone you know will be affected.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'When unemployment is high, employers have many applicants for each position. This reduces pressure to increase wages or offer bonuses. Even employed workers may see wage freezes, reduced hours, or increased job insecurity. This illustrates how macroeconomic conditions affect everyone, not just the unemployed.'
  }
];

module.exports = { ECONOMIC_ENVIRONMENT_FALLBACK_QUESTIONS };