const ETHICS_FALLBACK_QUESTIONS = [
  {
    difficulty: 'beginner',
    questionText: 'Sarah finds a $20 bill on the floor of a busy coffee shop. What is the most ethical action she should take?',
    options: [
      { 
        id: 'a', 
        text: 'Keep the money since she found it fairly',
        feedback: 'While finders-keepers might seem fair, this ignores the rightful owner who may need the money.'
      },
      { 
        id: 'b', 
        text: 'Give it to the coffee shop staff in case someone comes looking for it',
        feedback: 'Correct! This shows honesty and consideration for the person who lost the money.'
      },
      { 
        id: 'c', 
        text: 'Use it to buy coffee for everyone in line',
        feedback: 'While generous, this doesn\'t respect the property rights of the person who lost the money.'
      },
      { 
        id: 'd', 
        text: 'Post about it on social media to find the owner',
        feedback: 'This could attract false claims and doesn\'t protect the rightful owner.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'The most ethical choice is to turn the money over to the coffee shop staff. This demonstrates honesty and integrity, key principles in financial ethics. The staff can hold it in case the owner returns to look for it.'
  },
  {
    difficulty: 'intermediate',
    questionText: 'Jake\'s friend asks him to co-sign a car loan. Jake knows his friend has struggled with making payments in the past but really needs transportation for a new job. Which ethical principle should guide Jake\'s decision-making process?',
    options: [
      { 
        id: 'a', 
        text: 'Loyalty - He should help his friend no matter what',
        feedback: 'While loyalty is important, it shouldn\'t override financial responsibility and risk assessment.'
      },
      { 
        id: 'b', 
        text: 'Self-interest - He should only consider how it affects him',
        feedback: 'Ethical decisions require considering all stakeholders, not just oneself.'
      },
      { 
        id: 'c', 
        text: 'Responsibility - He should consider the risks and impacts on all parties',
        feedback: 'Correct! Responsibility means weighing the consequences for himself, his friend, and their relationship.'
      },
      { 
        id: 'd', 
        text: 'Generosity - He should always help those in need',
        feedback: 'Generosity is admirable but must be balanced with prudent financial decision-making.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'The principle of responsibility is most appropriate here. Jake must consider: his own financial risk if his friend defaults, whether this truly helps his friend or enables poor habits, and the potential impact on their friendship. Responsible decision-making involves honest assessment of risks and benefits for all involved.'
  },
  {
    difficulty: 'advanced',
    questionText: 'Maria inherits $50,000 and is considering investment options. She\'s interested in a company with excellent returns but discovers it has been cited for environmental violations and poor labor practices. Her financial advisor says these issues are already "priced in" to the stock value. How should Maria approach this ethical dilemma?',
    options: [
      { 
        id: 'a', 
        text: 'Invest anyway since the market has already accounted for these issues',
        feedback: 'This ignores the ethical dimension of supporting companies whose values don\'t align with yours.'
      },
      { 
        id: 'b', 
        text: 'Avoid the investment entirely and choose lower-return ethical options',
        feedback: 'While ethical, this presents a false dichotomy - there may be other profitable AND ethical options.'
      },
      { 
        id: 'c', 
        text: 'Research alternative investments that balance returns with ethical considerations',
        feedback: 'Correct! This demonstrates a balanced approach to ethical investing and financial responsibility.'
      },
      { 
        id: 'd', 
        text: 'Invest a small amount to minimize both ethical concerns and missed opportunities',
        feedback: 'This compromise doesn\'t resolve the ethical issue - you\'re still supporting practices you find objectionable.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'The most ethical approach is to seek investments that align with both financial goals and personal values. This situation illustrates the importance of considering environmental, social, and governance (ESG) factors in investment decisions. Many successful investors practice "socially responsible investing" without sacrificing returns.'
  },
  {
    difficulty: 'beginner',
    questionText: 'Tom notices an error on his restaurant bill - he was charged $15 instead of $50 for his meal. What principle of financial ethics should guide his response?',
    options: [
      { 
        id: 'a', 
        text: 'Opportunity - Take advantage of others\' mistakes',
        feedback: 'Taking advantage of errors violates the principle of honesty in financial dealings.'
      },
      { 
        id: 'b', 
        text: 'Honesty - Point out the error and pay the correct amount',
        feedback: 'Correct! Honesty is fundamental to ethical financial behavior, even when it costs us.'
      },
      { 
        id: 'c', 
        text: 'Silence - It\'s not his job to check their math',
        feedback: 'Knowingly benefiting from an error is a form of dishonesty.'
      },
      { 
        id: 'd', 
        text: 'Negotiation - Offer to pay $30 as a compromise',
        feedback: 'This isn\'t a negotiation - there\'s a correct amount owed for services received.'
      }
    ],
    correctOptionId: 'b',
    explanation: 'Honesty is a cornerstone of financial ethics. By pointing out the error, Tom demonstrates integrity and builds trust. This principle applies whether the error benefits or harms us - ethical behavior requires consistency.'
  },
  {
    difficulty: 'intermediate',
    questionText: 'A credit card company offers Emma a card with a $5,000 limit, despite knowing she\'s a college student with minimal income. The terms include a 29.99% interest rate after a 6-month promotional period. What ethical issue does this situation primarily illustrate?',
    options: [
      { 
        id: 'a', 
        text: 'Freedom of choice - Emma can decide whether to accept',
        feedback: 'While true, this ignores the power imbalance and potential for exploitation.'
      },
      { 
        id: 'b', 
        text: 'Financial education - Emma needs to learn about credit',
        feedback: 'Education is important, but this doesn\'t address the ethical concerns of the offer itself.'
      },
      { 
        id: 'c', 
        text: 'Predatory lending - Targeting vulnerable populations with unfair terms',
        feedback: 'Correct! This illustrates how financial institutions can exploit those with limited experience or options.'
      },
      { 
        id: 'd', 
        text: 'Market efficiency - High-risk borrowers pay higher rates',
        feedback: 'This economic principle doesn\'t justify targeting inexperienced consumers with debt traps.'
      }
    ],
    correctOptionId: 'c',
    explanation: 'This scenario illustrates predatory lending practices - offering credit with terms likely to trap borrowers in debt. Ethical financial institutions consider borrowers\' ability to repay and offer appropriate products. This highlights why financial literacy and consumer protection regulations are important.'
  }
];

module.exports = { ETHICS_FALLBACK_QUESTIONS };