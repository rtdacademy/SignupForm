/**
 * Assessment Functions for Introduction to Data Science
 * Course: 5 
 * Content: 01_data_science_introduction_overview
 * 
 * This module provides assessments for this lesson
 * using the shared assessment system.
 */

// ===== ACTIVITY TYPE CONFIGURATION =====
const ACTIVITY_TYPE = 'lesson';

// Default settings for this activity type
const activityDefaults = {
  theme: 'purple',
  maxAttempts: 3,
  pointsValue: 1
};


// Question pool 1: Data Science Fundamentals
const questionPool1 = [
  {
    questionText: "[Add question text here]",
    options: [
      { 
        id: 'a', 
        text: '[Option A text]', 
        feedback: '[Feedback for option A]' 
      },
      { 
        id: 'b', 
        text: '[Option B text]', 
        feedback: '[Feedback for option B]' 
      },
      { 
        id: 'c', 
        text: '[Option C text]', 
        feedback: '[Feedback for option C]' 
      },
      { 
        id: 'd', 
        text: '[Option D text]', 
        feedback: '[Feedback for option D]' 
      }
    ],
    correctOptionId: 'a', // Change to correct option
    explanation: '[Detailed explanation of the correct answer]',
    difficulty: 'intermediate',
    tags: ['topic1', 'topic2']
  },
  // Add more questions to this pool as needed
];

// Question pool 2: True/False Questions about Data Science
const trueFalseQuestions = [
  {
    questionText: "Data Science is solely about analyzing structured data in databases.",
    correctAnswer: false,
    explanation: "Data Science involves analyzing both structured and unstructured data from various sources including text, images, audio, and more. It's not limited to just database data.",
    feedback: {
      true: "Incorrect. Data Science encompasses much more than just structured database data. It includes unstructured data like text, images, and audio.",
      false: "Correct! Data Science works with all types of data - structured, semi-structured, and unstructured - from various sources."
    },
    difficulty: 'beginner',
    tags: ['data-science', 'fundamentals']
  },
  {
    questionText: "Machine Learning is a subset of Data Science.",
    correctAnswer: true,
    explanation: "Machine Learning is indeed a subset of Data Science. Data Science is a broader field that includes machine learning, statistics, data visualization, and domain expertise.",
    feedback: {
      true: "Correct! Machine Learning is one of the key components of Data Science, along with statistics, data visualization, and domain knowledge.",
      false: "Incorrect. Machine Learning is actually a subset of Data Science, not the other way around."
    },
    difficulty: 'beginner',
    tags: ['data-science', 'machine-learning']
  },
  {
    questionText: "Python and R are the only programming languages used in Data Science.",
    correctAnswer: false,
    explanation: "While Python and R are the most popular languages for Data Science, many other languages are also used including SQL, Julia, Scala, Java, and JavaScript for various data science tasks.",
    feedback: {
      true: "Incorrect. While Python and R are very popular, Data Scientists also use SQL, Julia, Scala, Java, JavaScript, and other languages.",
      false: "Correct! Although Python and R are dominant, Data Science utilizes many languages including SQL, Julia, Scala, and others."
    },
    difficulty: 'intermediate',
    tags: ['data-science', 'programming-languages']
  },
  {
    questionText: "Data cleaning typically takes up 60-80% of a data scientist's time.",
    correctAnswer: true,
    explanation: "Studies and surveys consistently show that data cleaning and preparation consume the majority of a data scientist's time, often quoted as 60-80% of the project timeline.",
    feedback: {
      true: "Correct! Data cleaning and preparation is indeed the most time-consuming part of data science projects, often taking 60-80% of the time.",
      false: "Incorrect. Data cleaning is actually the most time-consuming part of data science, typically taking 60-80% of project time."
    },
    difficulty: 'intermediate',
    tags: ['data-science', 'data-cleaning']
  },
  {
    questionText: "Big Data always requires distributed computing frameworks like Hadoop or Spark.",
    correctAnswer: false,
    explanation: "Not all Big Data problems require distributed computing. Modern tools and cloud services can handle many big data tasks on single machines with sufficient resources. The need for distributed computing depends on the specific use case.",
    feedback: {
      true: "Incorrect. While distributed frameworks are useful for very large datasets, many big data problems can be solved with modern single-machine tools and cloud services.",
      false: "Correct! The choice between distributed and single-machine processing depends on the specific requirements, data size, and available resources."
    },
    difficulty: 'advanced',
    tags: ['big-data', 'distributed-computing']
  }
];

/**
 * Assessment Configurations for Universal Assessment Function
 */
const assessmentConfigs = {
  'course5_01_introduction_knowledge_check': {
    type: 'multiple-choice',
    questions: questionPool1,
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'Data Science',
    gradeLevel: 'University',
    topic: 'Data Science Fundamentals',
    learningObjectives: [
      '[Learning objective 1]',
      '[Learning objective 2]',
      '[Learning objective 3]'
    ]
  },
  'course5_01_introduction_applications': {
    type: 'true-false',
    questionType: 'true-false',  // Explicitly set for universal_assessments
    questions: trueFalseQuestions,
    randomizeQuestions: true,
    allowSameQuestion: false,
    activityType: ACTIVITY_TYPE,
    maxAttempts: 999,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0,
    theme: activityDefaults.theme,
    subject: 'Data Science',
    gradeLevel: 'University',
    topic: 'Data Science Fundamentals',
    learningObjectives: [
      'Understand the scope and breadth of Data Science',
      'Recognize the relationship between Data Science and related fields',
      'Identify common misconceptions about Data Science practices'
    ]
  },
};

/**
 * Export the assessment configurations for the universal assessment function
 */
module.exports = {
  assessmentConfigs
};
