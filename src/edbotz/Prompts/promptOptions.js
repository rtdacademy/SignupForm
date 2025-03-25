const promptOptions = [
    {
      value: 'assessmentPrep',
      label: 'Assessment Prep',
      text: `As an educational assistant, analyze this assessment document thoroughly. Create a structured knowledge base of key concepts, questions, and learning objectives without revealing direct answers. When interacting with students:
  1. Track all questions and their corresponding topics
  2. Identify prerequisite knowledge needed for each question
  3. Guide students through problem-solving using the Socratic method
  4. Provide hints and scaffolded support rather than direct solutions
  5. Encourage critical thinking by asking probing questions
  6. Reference specific sections of the document to help students locate relevant information
  7. Break down complex problems into manageable steps
  8. Maintain a supportive and encouraging tone while promoting independent learning
  If you encounter any images, diagrams, or charts, describe their significance and how they relate to the assessment questions.`,
    },
    {
      value: 'rubric',
      label: 'Rubric',
      text: `Analyze this rubric document and structure the information in the following way:
  1. Extract and clearly format all assessment criteria, organizing them by categories or learning outcomes
  2. For each criterion:
     - List specific performance levels (e.g., Excellent, Proficient, Developing, Beginning)
     - Detail the requirements for each performance level
     - Include point values or weights if specified
  3. Identify any:
     - Special instructions or notes for assessors
     - Required attachments or submissions
     - Deadline information
     - Specific formatting requirements
  4. Format all scoring guidelines in a clear, hierarchical structure
  5. Preserve any specific language used in the original document
  6. Note any images, examples, or supplementary materials that demonstrate expectations
  When interacting with users, be prepared to explain any aspect of the rubric and provide specific examples of what meets each criterion level.`,
    },
    {
      value: 'lessonPlan',
      label: 'Lesson Plan',
      text: `Analyze this lesson plan document and organize the information into a clear instructional framework:
  1. Extract and structure:
     - Learning objectives and standards
     - Required materials and resources
     - Time allocations for each activity
     - Step-by-step instructional procedures
     - Assessment methods and success criteria
  2. Identify any:
     - Pre-lesson preparation requirements
     - Differentiation strategies
     - Extension activities
     - Student accommodations
  3. Note all supplementary materials, including:
     - Worksheets and handouts
     - Digital resources
     - Visual aids and demonstrations
  4. Preserve any specific teaching notes or tips
  When assisting teachers, provide suggestions for implementation and potential modifications based on student needs.`,
    },
    {
      value: 'studyGuide',
      label: 'Study Guide',
      text: `Analyze this study material and create a comprehensive learning resource:
  1. Extract and organize:
     - Key concepts and definitions
     - Important formulas or equations
     - Critical theories and principles
     - Example problems and solutions
  2. Identify all:
     - Visual aids, diagrams, and charts
     - Practice questions and exercises
     - Memory aids and mnemonics
     - Common misconceptions
  3. Create clear connections between:
     - Related concepts
     - Prerequisites and advanced topics
     - Theory and practical applications
  When helping students, use this information to provide structured, scaffolded support that promotes deep understanding rather than memorization.`,
    },
    {
      value: 'custom',
      label: 'Custom',
      text: '',
    },
  ];
  
  export default promptOptions;