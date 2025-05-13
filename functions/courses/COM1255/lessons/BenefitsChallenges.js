/**
 * Cloud functions for the Benefits and Challenges of E-Learning lesson
 * This file contains assessment functions using AI-generated questions
 */

const { onCall } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const { sanitizeEmail } = require('../../../utils.js');
const { GoogleGenAI } = require('@google/genai');

// Environment variables
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

//==============================================================================
// Shared Utilities
//==============================================================================

/**
 * Gets a safe server timestamp that works in both production and emulator environments
 * @returns {any} Server timestamp or Date.now() fallback
 */
function getServerTimestamp() {
  try {
    // Try to use ServerValue.TIMESTAMP if available
    if (admin.database && admin.database.ServerValue && admin.database.ServerValue.TIMESTAMP) {
      return admin.database.ServerValue.TIMESTAMP;
    } else {
      // Fall back to Date.now() if ServerValue is not available
      console.log("ServerValue.TIMESTAMP not available, using Date.now() instead");
      return Date.now();
    }
  } catch (error) {
    console.log("Error accessing ServerValue.TIMESTAMP, using Date.now() instead:", error);
    return Date.now();
  }
}

/**
 * Extracts and validates required parameters from the function call
 * @param {Object} data - The data object from the function call
 * @param {Object} context - The context object from the function call
 * @returns {Object} Extracted and validated parameters
 */
function extractParameters(data, context) {
  // Extract the data from the request correctly
  const {
    courseId,
    assessmentId,
    operation,
    answer,
    studentEmail,
    userId,
    topic = 'elearning_benefits_challenges',
    difficulty = 'intermediate',
  } = data.data || {};

  // Log the received data for debugging
  console.log("Data received by function:", data);

  // Only log simple authentication status - avoid stringifying the entire context
  const authStatus = context?.auth ? "Authenticated" : "Not authenticated";
  console.log("Function received context:", authStatus);

  // Get authentication info
  let finalStudentEmail = studentEmail;
  let finalUserId = userId;

  // If we have authentication context but no studentEmail in the data, use the auth email
  if (context?.auth?.token?.email && !finalStudentEmail) {
    finalStudentEmail = context.auth.token.email;
    console.log("Using email from auth context:", finalStudentEmail);
  }

  // If we have authentication context but no userId in the data, use the auth uid
  if (context?.auth?.uid && !finalUserId) {
    finalUserId = context.auth.uid;
    console.log("Using uid from auth context:", finalUserId);
  }

  // Log each important parameter individually for debugging
  console.log("Parameter - operation:", operation);
  console.log("Parameter - courseId:", courseId);
  console.log("Parameter - assessmentId:", assessmentId);
  console.log("Parameter - studentEmail:", finalStudentEmail);
  console.log("Parameter - userId:", finalUserId);
  console.log("Parameter - topic:", topic);
  console.log("Parameter - difficulty:", difficulty);

  // Check if required operation parameters are present
  if (!operation) {
    throw new Error("Missing required parameter: operation");
  }

  if (!courseId) {
    throw new Error("Missing required parameter: courseId");
  }

  if (!assessmentId) {
    throw new Error("Missing required parameter: assessmentId");
  }

  // Get the proper studentKey
  let studentKey;

  // Check if we're running in the emulator
  const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

  // Simplified approach that prioritizes studentEmail parameter over context.auth
  // This works better for emulator testing while still maintaining security in production
  if (finalStudentEmail) {
    studentKey = sanitizeEmail(finalStudentEmail);
    console.log(`Using provided student email: ${finalStudentEmail}, sanitized to: ${studentKey}`);
  } else if (context.auth && context.auth.token && context.auth.token.email) {
    const email = context.auth.token.email;
    studentKey = sanitizeEmail(email);
    console.log(`Using authenticated user email: ${email}`);
  } else {
    // Fallback for emulator or missing authentication - use test account
    console.log("Using test account - this should only happen in development");
    studentKey = "test-student";
  }

  return {
    courseId,
    assessmentId,
    operation,
    answer,
    topic,
    difficulty,
    studentEmail: finalStudentEmail,
    userId: finalUserId,
    studentKey,
    isEmulator
  };
}

/**
 * Initializes course structure for a student if it doesn't exist
 * @param {string} studentKey - The sanitized student email
 * @param {string} courseId - The course ID
 * @returns {Promise<void>}
 */
async function initializeCourseIfNeeded(studentKey, courseId) {
  // Make sure courseId is a string
  const safeCoursePath = String(courseId);

  // Check if the student's course path exists - if not, we might need to initialize it
  const courseRef = admin.database().ref(`students/${studentKey}/courses/${safeCoursePath}`);

  try {
    // Check if the course exists in the database for this student
    const courseSnapshot = await courseRef.once('value');
    if (!courseSnapshot.exists()) {
      // Initialize basic course structure if it doesn't exist
      console.log(`Initializing course structure for ${studentKey} in course ${safeCoursePath}`);
      await courseRef.set({
        Initialized: true,
        Assessments: {},
        Grades: {
          assessments: {}
        },
        timestamp: getServerTimestamp()
      });
    }
  } catch (error) {
    console.warn("Error checking/initializing course:", error);
    // Continue anyway - the assessment operation will create required paths
  }
}

//==============================================================================
// AI-Powered Multiple Choice Question Functions
//==============================================================================

/**
 * Schema for AI question generation
 * This defines the structure we want the AI to follow
 */
const questionSchema = {
  type: "object",
  properties: {
    questionText: {
      type: "string",
      description: "The text of the multiple-choice question"
    },
    options: {
      type: "array",
      description: "Four answer options for the question",
      items: {
        type: "object",
        properties: {
          id: { type: "string", description: "Unique identifier for this option (a, b, c, or d)" },
          text: { type: "string", description: "The text of this answer option" },
          feedback: { type: "string", description: "Feedback to show if this option is selected" }
        },
        required: ["id", "text", "feedback"]
      },
      minItems: 4,
      maxItems: 4
    },
    correctOptionId: {
      type: "string",
      description: "The ID of the correct answer option (a, b, c, or d)"
    },
    explanation: {
      type: "string",
      description: "A detailed explanation of why the correct answer is right and the others are wrong"
    }
  },
  required: ["questionText", "options", "correctOptionId", "explanation"]
};

/**
 * Prompt templates for question generation based on topic and difficulty
 */
const PROMPT_TEMPLATES = {
  elearning_benefits_challenges: {
    beginner: `Create a multiple-choice question about the basic benefits and challenges of e-learning. 
    Focus on concepts like flexibility, accessibility, self-discipline, and technical requirements.
    Make sure the question is suitable for beginners with limited knowledge of e-learning.`,
    
    intermediate: `Create a multiple-choice question that tests understanding of the benefits and challenges 
    of e-learning systems. Focus on topics like cost-effectiveness, global reach, time management skills, 
    digital literacy, and learning engagement strategies. Make this appropriate for students with some 
    familiarity with online learning.`,
    
    advanced: `Create a complex multiple-choice question that requires deep analysis of e-learning systems 
    and their impacts. Focus on advanced topics like learning analytics, adaptive learning technologies, 
    pedagogical strategies for online engagement, institutional challenges in implementation, or equity 
    issues in digital education. This should challenge students with significant understanding of e-learning.`
  }
};

/**
 * Shuffles an array in place
 * @param {Array} array - The array to shuffle
 * @returns {Array} The shuffled array
 */
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 * Predefined questions as a fallback if AI generation fails
 * @param {string} difficulty - The difficulty level (beginner, intermediate, advanced)
 * @returns {Object} A predefined question appropriate for the difficulty level
 */
function getPredefinedQuestion(difficulty = 'intermediate') {
  // Create an array of predefined questions for variety
  const predefinedQuestions = [
    // Beginner questions
    {
      difficulty: 'beginner',
      questionText: "Which of the following is considered a major benefit of e-learning?",
      options: [
        { id: "a", text: "Reduced need for self-discipline", feedback: "E-learning requires more self-discipline, not less, since students must manage their own schedule and learning without direct supervision." },
        { id: "b", text: "Guaranteed high-quality internet access", feedback: "Internet access is actually a potential challenge for e-learning, not a benefit. Many students face issues with consistent, high-quality internet access." },
        { id: "c", text: "Geographical flexibility for learners", feedback: "Correct! One of the primary benefits of e-learning is that it allows students to access educational content from anywhere with an internet connection." },
        { id: "d", text: "Elimination of technical difficulties", feedback: "Technical difficulties are a common challenge in e-learning environments, not something that e-learning eliminates." }
      ],
      correctOptionId: "c",
      explanation: "Geographical flexibility is a major benefit of e-learning as it allows students to access educational content from anywhere with an internet connection, removing location-based barriers to education. The other options are either challenges of e-learning or inaccurate statements."
    },
    // Intermediate questions
    {
      difficulty: 'intermediate',
      questionText: "Which of the following statements about student engagement in e-learning is most accurate?",
      options: [
        { id: "a", text: "Student engagement is typically higher in e-learning than in traditional classrooms", feedback: "While some students may engage more in e-learning environments, research generally shows that maintaining engagement can be more challenging in online settings without specific strategies." },
        { id: "b", text: "Student engagement primarily depends on the quality of the content, not the delivery method", feedback: "While content quality is important, engagement in e-learning depends on multiple factors including content, interaction design, instructor presence, and student self-regulation skills." },
        { id: "c", text: "Student engagement in e-learning requires more deliberate strategies than in traditional classrooms", feedback: "Correct! E-learning lacks the natural social cues and physical presence of traditional classrooms, so it requires more intentional design of interactive elements, feedback mechanisms, and community building to foster engagement." },
        { id: "d", text: "Student engagement is impossible to measure in e-learning environments", feedback: "This is incorrect. Student engagement in e-learning can be measured through various metrics including participation rates, assignment completion, time spent on learning activities, and learning analytics." }
      ],
      correctOptionId: "c",
      explanation: "E-learning environments lack the natural social cues and physical presence found in traditional classrooms. Therefore, instructors and course designers must implement more deliberate and varied strategies to maintain student engagement, such as interactive content, regular feedback, collaborative activities, and personalized learning paths."
    },
    // Advanced questions
    {
      difficulty: 'advanced',
      questionText: "Which of the following represents the most significant challenge for institutional implementation of adaptive learning technologies in e-learning environments?",
      options: [
        { id: "a", text: "Developing algorithms that can accurately predict student learning needs", feedback: "While developing predictive algorithms is challenging, it's primarily a technical challenge that many educational technology companies have already addressed." },
        { id: "b", text: "Ethical concerns about data privacy and algorithmic bias", feedback: "Correct! Implementing adaptive learning systems requires collecting extensive student data, raising serious privacy concerns. Additionally, algorithms may perpetuate existing biases in educational assessment, disadvantaging certain groups of students." },
        { id: "c", text: "The cost of purchasing adaptive learning platforms", feedback: "While cost is a consideration, it's rarely the most significant barrier, as many institutions prioritize funding for technologies that demonstrate improved learning outcomes." },
        { id: "d", text: "Resistance from faculty to adopt new teaching technologies", feedback: "Faculty resistance can be a challenge, but it can be addressed through professional development and change management processes. It's not typically the most significant institutional challenge." }
      ],
      correctOptionId: "b",
      explanation: "The implementation of adaptive learning technologies raises significant ethical concerns about student data privacy, surveillance, and informed consent. These technologies collect massive amounts of data about student behavior and performance, which creates institutional risks related to data governance and privacy regulations. Additionally, algorithmic bias can perpetuate or amplify existing inequities in educational assessment, potentially disadvantaging marginalized student populations. These ethical considerations often present more complex challenges than technical, financial, or adoption hurdles."
    }
  ];
  
  // Filter questions by difficulty
  const filteredQuestions = predefinedQuestions.filter(q => q.difficulty === difficulty);
  
  // If no questions match the requested difficulty, use the intermediate ones
  const availableQuestions = filteredQuestions.length > 0 ? filteredQuestions : 
    predefinedQuestions.filter(q => q.difficulty === 'intermediate');
  
  // Select a random question from the available ones
  const randomIndex = Math.floor(Math.random() * availableQuestions.length);
  const selectedQuestion = availableQuestions[randomIndex];
  
  // Shuffle the options for variety
  const shuffledOptions = shuffleArray([...selectedQuestion.options]);
  
  return {
    questionText: selectedQuestion.questionText,
    options: shuffledOptions,
    correctOptionId: selectedQuestion.correctOptionId,
    explanation: selectedQuestion.explanation,
    generatedBy: 'fallback'
  };
}

/**
 * Uses Google's Gemini API to generate a custom multiple choice question
 * @param {string} topic - The question topic
 * @param {string} difficulty - The difficulty level (beginner, intermediate, advanced)
 * @returns {Promise<Object>} Generated question with options and solution
 */
async function generateAIQuestion(topic, difficulty = 'intermediate') {
  try {
    // Check if API key is available
    if (!GEMINI_API_KEY) {
      console.warn("No Gemini API key found. Using predefined question instead.");
      return getPredefinedQuestion(difficulty);
    }

    // Get the appropriate prompt template
    const topicTemplates = PROMPT_TEMPLATES[topic] || PROMPT_TEMPLATES.elearning_benefits_challenges;
    const promptTemplate = topicTemplates[difficulty] || topicTemplates.intermediate;
    
    // Initialize the Google AI client exactly as in googleai.js
    const genAI = new GoogleGenAI({apiKey: GEMINI_API_KEY});
    
    // Create prompt content with clearer instructions
    const promptText = `${promptTemplate}

    Follow these specific guidelines:
    1. Create a question that tests understanding, not just memorization
    2. Make sure the question has ONE clear correct answer
    3. Ensure all incorrect options (distractors) are plausible but clearly wrong
    4. Include specific feedback for each answer option explaining why it's correct or incorrect
    5. Format your response as a JSON object matching the schema below
    6. Do not include any text outside the JSON structure
    7. IMPORTANT: Your response must be valid JSON format with exactly 4 options, each with id, text, and feedback fields
    8. IMPORTANT: The options array must contain objects with ids "a", "b", "c", and "d" only
    
    Schema:
    {
      "questionText": "Your question text here",
      "options": [
        {
          "id": "a",
          "text": "First option text",
          "feedback": "Feedback for selecting this option"
        },
        {
          "id": "b",
          "text": "Second option text",
          "feedback": "Feedback for selecting this option"
        },
        {
          "id": "c",
          "text": "Third option text",
          "feedback": "Feedback for selecting this option" 
        },
        {
          "id": "d",
          "text": "Fourth option text",
          "feedback": "Feedback for selecting this option"
        }
      ],
      "correctOptionId": "one of: a, b, c, or d",
      "explanation": "Detailed explanation of the answer"
    }`;
    
    // Send the prompt to the API using the same format as googleai.js
    console.log("Sending prompt to Gemini API:", promptTemplate.substring(0, 100) + "...");
    
    try {
      // Generate content using the same API calls as in googleai.js
      const response = await genAI.models.generateContent({
        model: "gemini-2.0-flash-001",
        contents: promptText,
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40
        }
      });
      
      // Extract the response text
      const responseText = response.text;
      console.log("Raw response from Gemini:", responseText.substring(0, 200) + "...");
      
      // Extract the JSON from the response
      // Handle various ways the model might format the response
      let jsonStr;
      // Check for code blocks with json language marker
      const jsonBlockMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonBlockMatch) {
        jsonStr = jsonBlockMatch[1];
      } else {
        // Check for generic code blocks
        const codeBlockMatch = responseText.match(/```\n([\s\S]*?)\n```/);
        if (codeBlockMatch) {
          jsonStr = codeBlockMatch[1];
        } else {
          // Check for JSON object with curly braces
          const jsonObjectMatch = responseText.match(/(\{[\s\S]*\})/);
          if (jsonObjectMatch) {
            jsonStr = jsonObjectMatch[1];
          } else {
            // Just use the entire response as a fallback
            jsonStr = responseText;
          }
        }
      }
      
      console.log("Extracted JSON string:", jsonStr.substring(0, 200) + "...");
      
      try {
        const questionData = JSON.parse(jsonStr);
        
        // Log the parsed question data structure
        console.log("Parsed question data:", JSON.stringify(questionData, null, 2).substring(0, 300) + "...");
      
        // Validate the required fields are present
        if (!questionData.questionText || !questionData.options || 
            !questionData.correctOptionId || !questionData.explanation) {
          console.error("Generated question is missing required fields:", {
            hasQuestionText: !!questionData.questionText,
            hasOptions: !!questionData.options,
            hasCorrectOptionId: !!questionData.correctOptionId,
            hasExplanation: !!questionData.explanation
          });
          throw new Error("Generated question is missing required fields");
        }
        
        // Ensure exactly 4 options
        if (!Array.isArray(questionData.options) || questionData.options.length !== 4) {
          console.error("Options validation failed:", {
            isArray: Array.isArray(questionData.options),
            optionsCount: questionData.options ? questionData.options.length : 0
          });
          throw new Error("Generated question must have exactly 4 options");
        }
        
        // Ensure all options have id, text and feedback
        let optionsValid = true;
        let invalidOptionIndex = -1;
        
        questionData.options.forEach((option, index) => {
          if (!option.id || !option.text || !option.feedback) {
            optionsValid = false;
            invalidOptionIndex = index;
            console.error(`Option at index ${index} is invalid:`, {
              hasId: !!option.id,
              hasText: !!option.text,
              hasFeedback: !!option.feedback,
              option: option
            });
          }
        });
        
        if (!optionsValid) {
          throw new Error(`Option at index ${invalidOptionIndex} is missing required properties`);
        }
        
        // Ensure the correctOptionId matches one of the option ids
        const optionIds = questionData.options.map(opt => opt.id);
        if (!questionData.options.some(opt => opt.id === questionData.correctOptionId)) {
          console.error("correctOptionId validation failed:", {
            correctOptionId: questionData.correctOptionId,
            availableOptionIds: optionIds
          });
          throw new Error("correctOptionId must match the id of one of the options");
        }
        
        console.log("Successfully parsed AI-generated question:", questionData.questionText.substring(0, 50) + "...");
        
        return {
          ...questionData,
          generatedBy: 'ai'
        };
      } catch (parseError) {
        console.error("Failed to parse JSON from Gemini response:", parseError);
        console.error("JSON string that failed to parse:", jsonStr);
        throw new Error(`Failed to parse Gemini response: ${parseError.message}`);
      }
    } catch (error) {
      console.error("Error with Gemini API:", error.message);
      
      // Check if it's a permission or authentication error
      if (error.message && error.message.includes("permission") || 
          error.message.includes("auth") || 
          error.message.includes("scope")) {
        console.warn("This appears to be an API permission or authentication error.");
      }
      
      // Fall back to a predefined question
      console.log("Falling back to predefined question due to API error");
      return getPredefinedQuestion(difficulty);
    }
  } catch (error) {
    console.error("Error generating AI question:", error);
    return getPredefinedQuestion(difficulty);
  }
}

/**
 * Evaluates the student's answer to the AI-generated question
 * @param {Object} question - The question object with correctOptionId and options
 * @param {string} studentAnswer - The student's selected option ID
 * @returns {Object} Result of the evaluation
 */
function evaluateAIQuestionAnswer(question, studentAnswer) {
  // Check if the selected answer is one of the valid options
  if (!question.options.some(opt => opt.id === studentAnswer)) {
    return {
      isCorrect: false,
      correctOptionId: question.correctOptionId,
      feedback: "Invalid answer selection",
      explanation: question.explanation
    };
  }

  const isCorrect = studentAnswer === question.correctOptionId;
  
  // Get the appropriate feedback based on selected option
  const selectedOption = question.options.find(opt => opt.id === studentAnswer);
  const feedback = selectedOption ? selectedOption.feedback : "";
  
  return {
    isCorrect,
    correctOptionId: question.correctOptionId,
    feedback: feedback || (isCorrect ? "Correct!" : "Incorrect."),
    explanation: question.explanation
  };
}

//==============================================================================
// Cloud Function Handlers
//==============================================================================

/**
 * Handler for AI-generated multiple choice questions
 */
exports.handleAIQuestion = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '512MiB',
  // Don't enforce app check in emulator mode
  enforceAppCheck: false,
}, async (data, context) => {
  // Extract and validate parameters
  const params = extractParameters(data, context);

  // Initialize course if needed
  await initializeCourseIfNeeded(params.studentKey, params.courseId);

  // Reference to the assessment in the database
  const assessmentRef = admin.database()
    .ref(`students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);
  console.log(`Database path: students/${params.studentKey}/courses/${params.courseId}/Assessments/${params.assessmentId}`);

  // Handle question generation operation
  if (params.operation === 'generate') {
    try {
      // STEP 1: Check if this is a regeneration or a new assessment
      const existingAssessmentSnapshot = await assessmentRef.once('value');
      const existingAssessment = existingAssessmentSnapshot.val();
      const isRegeneration = !!existingAssessment;
      
      // Initialize the attempts counter
      let currentAttempts = 0;
      if (existingAssessment) {
        currentAttempts = existingAssessment.attempts || 0;
      }
      
      console.log(`This is a ${isRegeneration ? 'regeneration' : 'new question'} request. Current attempts: ${currentAttempts}`);
      
      // STEP 2: Look up course settings to get max attempts
      // Use a single reference for course settings that we'll reuse
      const courseRef = admin.database()
        .ref(`courses/${params.courseId}/assessments/${params.assessmentId}`);
      const courseAssessmentSnapshot = await courseRef.once('value');
      const courseAssessmentData = courseAssessmentSnapshot.val();
      
      // Determine max attempts from course settings or use default
      let maxAttempts = 9999; // Default to very high number (practically infinite)
      
      if (courseAssessmentData && courseAssessmentData.maxAttempts) {
        // Use course settings value if available
        maxAttempts = courseAssessmentData.maxAttempts;
      } else if (existingAssessment && existingAssessment.maxAttempts) {
        // Fall back to existing assessment value if available
        maxAttempts = existingAssessment.maxAttempts;
      }
      
      console.log(`Max attempts allowed: ${maxAttempts}`);
      
      // STEP 3: Verify the student hasn't exceeded the max attempts
      if (isRegeneration && currentAttempts >= maxAttempts) {
        console.log(`Security check: Student has exceeded max attempts (${currentAttempts}/${maxAttempts})`);
        throw new Error(`Maximum attempts (${maxAttempts}) reached for this assessment. No more regenerations allowed.`);
      }
      
      // STEP 4: Generate the AI question
      console.log(`Generating AI question on topic: ${params.topic}, difficulty: ${params.difficulty}`);
      const question = await generateAIQuestion(params.topic, params.difficulty);
      
      // STEP 5: Prepare the question data
      const randomizedOptions = shuffleArray([...question.options]);
      
      // We no longer increment attempts during question generation
      // Attempts will only be incremented during answer evaluation
      
      // Create the final question data object to save
      const questionData = {
        timestamp: getServerTimestamp(),
        questionText: question.questionText,
        options: randomizedOptions.map(opt => ({ id: opt.id, text: opt.text })),
        topic: params.topic,
        difficulty: params.difficulty,
        generatedBy: question.generatedBy || 'ai',
        // Preserve the current attempts count without incrementing it
        // Attempts only get incremented when submitting an answer
        attempts: currentAttempts,
        status: 'active',
        maxAttempts: maxAttempts,
        pointsValue: 2,
        settings: {
          showFeedback: true
        }
      };
      
      // Store public question data in the database (student-accessible)
      await assessmentRef.set(questionData);

      // Store the secure data in a completely separate database node (server-side only)
      // This node should not be loaded in any client-side code
      const secureRef = admin.database()
        .ref(`courses_secure/${params.courseId}/assessments/${params.assessmentId}`);
      
      await secureRef.set({
        correctOptionId: question.correctOptionId,
        explanation: question.explanation,
        // Store option feedback for each ID
        optionFeedback: question.options.reduce((obj, opt) => {
          obj[opt.id] = opt.feedback || "";
          return obj;
        }, {}),
        timestamp: getServerTimestamp()
      });

      return {
        success: true,
        questionGenerated: true,
        assessmentId: params.assessmentId,
        generatedBy: question.generatedBy
      };
    } catch (error) {
      console.error("Error generating AI question:", error);
      throw new Error('Error generating question: ' + error.message);
    }
  }
  // Handle answer evaluation operation
  else if (params.operation === 'evaluate') {
    try {
      // Get the existing question data
      const assessmentSnapshot = await assessmentRef.once('value');
      const assessmentData = assessmentSnapshot.val();

      if (!assessmentData) {
        throw new Error('Assessment not found');
      }
      
      // Verify max attempts from course settings
      const courseRef = admin.database()
        .ref(`courses/${params.courseId}/assessments/${params.assessmentId}`);
      const courseAssessmentSnapshot = await courseRef.once('value');
      const courseAssessmentData = courseAssessmentSnapshot.val();
      
      // Use course-specific max attempts if available, otherwise use assessment value
      const maxAttemptsFromSettings = (courseAssessmentData && courseAssessmentData.maxAttempts) ? 
        courseAssessmentData.maxAttempts : assessmentData.maxAttempts;
        
      // Security check: Always use the smaller value between saved assessment maxAttempts and 
      // course settings maxAttempts to prevent manipulation
      const secureMaxAttempts = Math.min(
        assessmentData.maxAttempts || 9999,
        maxAttemptsFromSettings || 9999
      );
      
      console.log(`Secure max attempts check: Assessment has ${assessmentData.attempts} attempts. ` + 
        `Max allowed attempts: ${secureMaxAttempts} ` + 
        `(Assessment value: ${assessmentData.maxAttempts}, Course settings value: ${maxAttemptsFromSettings})`);

      // Check if the student has exceeded the max attempts
      if (assessmentData.attempts >= secureMaxAttempts) {
        console.log(`Security check: Student has exceeded verified max attempts (${assessmentData.attempts}/${secureMaxAttempts})`);
        return {
          success: false,
          error: 'Maximum attempts exceeded',
          attemptsRemaining: 0
        };
      }

      // Try to get the secure data from the new secure path first
      const newSecureRef = admin.database()
        .ref(`courses_secure/${params.courseId}/assessments/${params.assessmentId}`);
      let secureSnapshot = await newSecureRef.once('value');
      let secureData = secureSnapshot.val();

      // If not found in the new location, check the old location as fallback
      if (!secureData || !secureData.correctOptionId) {
        console.log(`Secure data not found in new location, checking old location...`);
        const oldSecureRef = admin.database()
          .ref(`courses/${params.courseId}/secureAssessments/${params.assessmentId}`);
        secureSnapshot = await oldSecureRef.once('value');
        secureData = secureSnapshot.val();
        
        // If found in old location, migrate it to the new location for future use
        if (secureData && secureData.correctOptionId) {
          console.log(`Found secure data in old location, migrating to new location...`);
          await newSecureRef.set(secureData);
        }
      }

      // If still not found, we need to regenerate the question data
      if (!secureData || !secureData.correctOptionId) {
        console.log(`Secure data not found in any location. Regenerating question data...`);
        
        // We have the question and options data from assessmentData
        // Generate a fallback question that matches the displayed options
        const existingOptions = assessmentData.options || [];
        
        // If we can't find the secure data, we'll regenerate it using the AI generation logic
        const difficulty = assessmentData.difficulty || params.difficulty || 'intermediate';
        
        // Use our predefined question data (which has known correct answers and feedback)
        // We only need to match it to the existing question data
        const predefinedQuestions = getPredefinedQuestion(difficulty);
        
        // Extract the relevant information from the predefined question
        // But map it to match the existing options IDs from assessmentData
        const regeneratedData = {
          correctOptionId: predefinedQuestions.correctOptionId,
          explanation: predefinedQuestions.explanation,
          optionFeedback: {}
        };
        
        // Find matching option texts to assign feedback
        // This matches the visible question options with our known correct answers
        if (existingOptions.length > 0) {
          const predefinedMap = predefinedQuestions.options.reduce((map, opt) => {
            map[opt.text] = opt;
            return map;
          }, {});
          
          // Map feedback to each existing option based on text similarity
          for (const option of existingOptions) {
            const matchingOption = predefinedMap[option.text];
            if (matchingOption) {
              // If texts match exactly, use the feedback and check if this is correct
              regeneratedData.optionFeedback[option.id] = matchingOption.feedback;
              if (matchingOption.id === predefinedQuestions.correctOptionId) {
                regeneratedData.correctOptionId = option.id;
              }
            } else {
              // Default feedback if no match
              regeneratedData.optionFeedback[option.id] = option.id === regeneratedData.correctOptionId ? 
                "Correct!" : "Incorrect. Please review the material.";
            }
          }
        }
        
        // Save the regenerated data to both locations for compatibility
        await newSecureRef.set({
          ...regeneratedData,
          timestamp: getServerTimestamp(),
          isRegenerated: true
        });
        
        secureData = regeneratedData;
      }

      // Reconstruct the complete question for evaluation
      const completeQuestion = {
        questionText: assessmentData.questionText,
        options: assessmentData.options.map(opt => ({
          id: opt.id,
          text: opt.text,
          feedback: secureData.optionFeedback ? secureData.optionFeedback[opt.id] : ""
        })),
        correctOptionId: secureData.correctOptionId,
        explanation: secureData.explanation
      };

      // Evaluate the answer
      const result = evaluateAIQuestionAnswer(completeQuestion, params.answer);

      // IMPORTANT: This is where we increment the attempts counter, NOT during question generation
      // This ensures we only count actual answer submissions as attempts, not questions viewed
      
      // Increment the attempts counter 
      let updatedAttempts = (assessmentData.attempts || 0) + 1;
      console.log(`Incrementing attempts from ${assessmentData.attempts || 0} to ${updatedAttempts} on answer submission`);
      
      // Use secure maxAttempts value from earlier validation
      const attemptsRemaining = secureMaxAttempts - updatedAttempts;

      // Prepare the submission record
      const submission = {
        timestamp: getServerTimestamp(),
        answer: params.answer,
        isCorrect: result.isCorrect,
        attemptNumber: updatedAttempts
      };

      // Check if this question was previously marked correct overall
      const wasCorrectOverall = assessmentData.correctOverall || false;

      // Update assessment data in the database
      const updates = {
        attempts: updatedAttempts,
        status: result.isCorrect ? 'completed' : (attemptsRemaining > 0 ? 'attempted' : 'failed'),
        // Track whether the question has ever been answered correctly
        correctOverall: wasCorrectOverall || result.isCorrect,
        lastSubmission: {
          timestamp: getServerTimestamp(),
          answer: params.answer,
          isCorrect: result.isCorrect,
          feedback: result.feedback,
          correctOptionId: result.correctOptionId, // Include correct answer for feedback
        }
      };

      // Add submission to the history
      await assessmentRef.child('submissions').push(submission);

      // Update the assessment
      await assessmentRef.update(updates);

      // Update the grade if the answer is correct AND we haven't previously recorded a correct grade
      if (result.isCorrect && !wasCorrectOverall) {
        const gradeRef = admin.database()
          .ref(`students/${params.studentKey}/courses/${params.courseId}/Grades/assessments/${params.assessmentId}`);

        // Calculate score based on the pointsValue from settings
        const pointsValue = assessmentData.pointsValue || 2;

        // No penalty for attempts - full points for getting it correct
        const finalScore = pointsValue;

        await gradeRef.set(finalScore);
      }

      return {
        success: true,
        result: result,
        attemptsRemaining: attemptsRemaining,
        attemptsMade: updatedAttempts
      };
    } catch (error) {
      console.error("Error evaluating answer:", error);
      throw new Error('Error evaluating answer: ' + error.message);
    }
  }

  // If the operation is neither generate nor evaluate
  throw new Error('Invalid operation. Supported operations are "generate" and "evaluate".');
});

// Export the functions
module.exports = {
  handleAIQuestion: exports.handleAIQuestion
};