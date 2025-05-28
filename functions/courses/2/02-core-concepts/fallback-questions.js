/**
 * Fallback Questions for Core Concepts Lesson
 * Course: 2
 * Content: 02-core-concepts
 * 
 * These fallback questions are used when AI generation fails or is unavailable.
 * Each difficulty level should have at least one question for each assessment.
 */

const FALLBACK_QUESTIONS = [
  // Beginner Level Questions
  {
    difficulty: 'beginner',
    questionText: "What is the most fundamental principle underlying the core concepts discussed in this lesson?",
    options: [
      { 
        id: "a", 
        text: "Complexity should be maximized in all solutions", 
        feedback: "This is incorrect. The core concepts emphasize simplicity and clarity, not unnecessary complexity." 
      },
      { 
        id: "b", 
        text: "Understanding basic principles enables building more advanced knowledge", 
        feedback: "Correct! The core concepts show how fundamental understanding creates a foundation for more complex learning." 
      },
      { 
        id: "c", 
        text: "All concepts exist independently without relationships", 
        feedback: "This is incorrect. The core concepts demonstrate how different ideas connect and build upon each other." 
      },
      { 
        id: "d", 
        text: "Theoretical knowledge is less important than practical application", 
        feedback: "This is incorrect. Both theoretical understanding and practical application are emphasized as equally important." 
      }
    ],
    correctOptionId: "b",
    explanation: "The fundamental principle underlying these core concepts is that solid understanding of basic principles provides the foundation necessary to build more advanced knowledge and skills."
  },

  // Intermediate Level Questions
  {
    difficulty: 'intermediate',
    questionText: "How do the core concepts presented in this lesson work together to create a comprehensive framework?",
    options: [
      { 
        id: "a", 
        text: "Each concept operates independently to achieve different goals", 
        feedback: "This is incorrect. The power of these concepts comes from how they integrate and reinforce each other." 
      },
      { 
        id: "b", 
        text: "The concepts build sequentially, with each one depending on the previous", 
        feedback: "This is partially correct but oversimplified. While there is some sequential building, the concepts also interact in more complex ways." 
      },
      { 
        id: "c", 
        text: "The concepts interconnect and reinforce each other to create emergent understanding", 
        feedback: "Correct! The core concepts work synergistically, where their combination creates insights that are greater than the sum of their parts." 
      },
      { 
        id: "d", 
        text: "Only one concept is truly important, while the others provide minor support", 
        feedback: "This is incorrect. All the core concepts contribute significantly to the overall framework and understanding." 
      }
    ],
    correctOptionId: "c",
    explanation: "The core concepts form an integrated framework where each concept reinforces and amplifies the others, creating emergent understanding that goes beyond what any single concept could provide alone."
  },

  // Advanced Level Questions  
  {
    difficulty: 'advanced',
    questionText: "Considering the implications of these core concepts for complex real-world applications, what represents the most significant challenge in their implementation?",
    options: [
      { 
        id: "a", 
        text: "The individual concepts are too difficult to understand separately", 
        feedback: "This is incorrect. While the concepts have depth, the main challenge lies not in understanding them individually but in their coordinated application." 
      },
      { 
        id: "b", 
        text: "Balancing the dynamic tensions between concepts when they suggest different approaches", 
        feedback: "Correct! In complex real-world scenarios, these concepts may sometimes point toward different solutions, requiring sophisticated judgment to balance competing considerations." 
      },
      { 
        id: "c", 
        text: "The concepts only work in theoretical settings, not practical applications", 
        feedback: "This is incorrect. These concepts are specifically designed to bridge theory and practice, with proven real-world applications." 
      },
      { 
        id: "d", 
        text: "There are too many concepts to remember and apply simultaneously", 
        feedback: "This is incorrect. The framework is designed to be manageable, and the real challenge is in nuanced application rather than memorization." 
      }
    ],
    correctOptionId: "b",
    explanation: "The most significant implementation challenge arises when these core concepts suggest different approaches in complex situations, requiring practitioners to navigate the dynamic tensions between them and make sophisticated judgments about which aspects to prioritize in specific contexts."
  }
];

module.exports = {
  FALLBACK_QUESTIONS
};