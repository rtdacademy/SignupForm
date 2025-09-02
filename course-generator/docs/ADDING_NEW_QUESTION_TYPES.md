# Adding New Question Types to the Firebase Course System

This guide provides comprehensive instructions for adding new question types to the Firebase course assessment system. All new question types must integrate with the existing SlideshowKnowledgeCheck and AssessmentSession.js components while maintaining database compatibility.

## Overview of Architecture

The assessment system consists of:
- **Frontend Components**: React components that render questions and handle user interactions
- **Backend Handlers**: Cloud Functions that generate questions, evaluate answers, and manage database operations
- **Integration Points**: Components that orchestrate question display and routing

## Required Files for a New Question Type

### 1. Frontend Component (`/src/FirebaseCourses/components/assessments/Standard[Type]Question/index.js`)

Create a new React component following this structure:

```javascript
import React, { useState, useEffect, useRef } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import AIQuestionChat from '../AIQuestionChat';
// Import other necessary components

const Standard[Type]Question = ({
  // Required props - must match exactly
  courseId,
  cloudFunctionName,
  assessmentId,
  onComplete,
  onAttempt,
  attemptNumber = 1,
  examMode = false,
  examSessionId = null,
  preloadedQuestion = null,
  questionNumber = 1,
  totalQuestions = 1,
  theme = 'blue',
  course,
  coursePath,
  lessonPath,
  slideNumber,
  slideRef,
  isPreloading = false,
  onQuestionGenerated = () => {},
  questionIdPrefix = '',
  onResult,
  maxAttempts = 3,
  pointsValue = 1,
  activityType = 'lesson',
  enableHints = true,
  enableAIChat = true,
  showFeedback = true,
  attemptPenalty = 0.1
}) => {
  // State management
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  
  // For exam mode
  const hasSubmittedRef = useRef(false);
  const isGeneratingRef = useRef(false);

  // Question generation function
  const generateQuestion = async () => {
    if (isGeneratingRef.current || isPreloading) return;
    isGeneratingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const functions = getFunctions();
      const assessmentFunction = httpsCallable(functions, cloudFunctionName || 'universal_assessments');
      
      const result = await assessmentFunction({
        courseId: String(courseId),
        assessmentId,
        operation: 'generate',
        questionType: '[your-type]', // e.g., 'true-false'
        examMode,
        examSessionId
      });

      if (result.data.success && result.data.question) {
        setQuestion(result.data.question);
        onQuestionGenerated(result.data.question);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
      isGeneratingRef.current = false;
    }
  };

  // Answer submission function
  const handleSubmit = async () => {
    if (!selectedAnswer || isSubmitting) return;
    
    setIsSubmitting(true);
    hasSubmittedRef.current = true;

    try {
      const functions = getFunctions();
      const assessmentFunction = httpsCallable(functions, cloudFunctionName || 'universal_assessments');
      
      const result = await assessmentFunction({
        courseId: String(courseId),
        assessmentId,
        operation: 'evaluate',
        answer: selectedAnswer,
        questionType: '[your-type]',
        examMode,
        examSessionId
      });

      if (result.data.success) {
        setIsCorrect(result.data.isCorrect);
        setFeedback(result.data.feedback);
        setSubmitted(true);
        
        // Notify parent components
        if (onAttempt) onAttempt(result.data.isCorrect);
        if (onResult) onResult(questionNumber, result.data.isCorrect);
        if (result.data.isCorrect && onComplete) {
          onComplete(questionNumber);
        }
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Initialize question
  useEffect(() => {
    if (!preloadedQuestion && !isPreloading) {
      generateQuestion();
    } else if (preloadedQuestion) {
      setQuestion(preloadedQuestion);
    }
  }, []);

  // Render loading state
  if (isLoading) {
    return <div>Loading question...</div>;
  }

  // Render error state
  if (error) {
    return <div>Error: {error}</div>;
  }

  // Render question UI
  return (
    <div className="question-container">
      {/* Question display */}
      <ReactMarkdown 
        remarkPlugins={[remarkMath]} 
        rehypePlugins={[rehypeKatex]}
      >
        {question?.questionText}
      </ReactMarkdown>

      {/* Answer input UI specific to your question type */}
      {/* ... */}

      {/* Submit button */}
      <button onClick={handleSubmit} disabled={!selectedAnswer || isSubmitting}>
        Submit
      </button>

      {/* Feedback display */}
      {submitted && feedback && (
        <div className={isCorrect ? 'correct-feedback' : 'incorrect-feedback'}>
          {feedback}
        </div>
      )}

      {/* AI Chat if enabled */}
      {enableAIChat && showAIChat && (
        <AIQuestionChat 
          question={question}
          courseId={courseId}
          onClose={() => setShowAIChat(false)}
        />
      )}
    </div>
  );
};

export default Standard[Type]Question;
```

### 2. Backend Handler (`/functions/shared/assessment-types/[type].js`)

Create a backend handler following this pattern:

```javascript
const admin = require('firebase-admin');
const { extractParameters, initializeCourseIfNeeded, getServerTimestamp, getDatabaseRef } = require('../utilities/database-utils');

class [Type]Core {
  constructor(config) {
    this.config = config;
  }

  /**
   * Select a question from the pool
   */
  selectQuestion(difficulty = null, usedQuestionIds = []) {
    let availableQuestions = this.config.questions || [];
    
    // Filter by difficulty if specified
    if (difficulty && difficulty !== 'all') {
      availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
    }
    
    // Filter out used questions if configured
    if (!this.config.allowSameQuestion && usedQuestionIds.length > 0) {
      availableQuestions = availableQuestions.filter(q => 
        !usedQuestionIds.includes(q.questionId)
      );
    }

    // Select random or sequential question
    if (this.config.randomizeQuestions) {
      const randomIndex = Math.floor(Math.random() * availableQuestions.length);
      return availableQuestions[randomIndex];
    } else {
      return availableQuestions[0];
    }
  }

  /**
   * Generate a new question
   */
  async generateQuestion(params) {
    const { 
      studentEmail, 
      userId, 
      courseId, 
      assessmentId,
      difficulty,
      isStaff 
    } = params;

    // Get database reference - MUST use this pattern
    const sanitizedEmail = studentEmail.replace(/\./g, ',');
    const assessmentRef = getDatabaseRef('studentAssessment', sanitizedEmail, courseId, assessmentId, isStaff);
    
    // Check existing attempts
    let assessmentData = null;
    try {
      const snapshot = await assessmentRef.once('value');
      assessmentData = snapshot.val();
    } catch (error) {
      console.log('No existing assessment data, creating new');
    }

    // Check attempt limits
    const currentAttempts = assessmentData?.attempts || 0;
    if (currentAttempts >= this.config.maxAttempts) {
      return {
        success: false,
        error: 'Maximum attempts reached',
        maxAttemptsReached: true,
        attempts: currentAttempts,
        maxAttempts: this.config.maxAttempts
      };
    }

    // Select question
    const usedQuestions = assessmentData?.usedQuestions || [];
    const selectedQuestion = this.selectQuestion(difficulty, usedQuestions);

    if (!selectedQuestion) {
      return {
        success: false,
        error: 'No questions available'
      };
    }

    // Update database
    const updates = {
      currentQuestion: selectedQuestion,
      lastQuestionTime: getServerTimestamp(),
      attempts: currentAttempts,
      usedQuestions: [...usedQuestions, selectedQuestion.questionId]
    };

    await assessmentRef.update(updates);

    // Return question to frontend
    return {
      success: true,
      question: {
        questionText: selectedQuestion.questionText,
        // Include type-specific fields
        questionId: selectedQuestion.questionId
      },
      attempts: currentAttempts,
      maxAttempts: this.config.maxAttempts
    };
  }

  /**
   * Evaluate an answer
   */
  async evaluateAnswer(params) {
    const { 
      studentEmail, 
      userId, 
      courseId, 
      assessmentId,
      answer,
      isStaff 
    } = params;

    // Get database reference
    const sanitizedEmail = studentEmail.replace(/\./g, ',');
    const assessmentRef = getDatabaseRef('studentAssessment', sanitizedEmail, courseId, assessmentId, isStaff);
    
    // Get current question
    const snapshot = await assessmentRef.once('value');
    const assessmentData = snapshot.val();

    if (!assessmentData || !assessmentData.currentQuestion) {
      throw new Error('No question found. Please generate a question first.');
    }

    // Evaluate answer (implement your logic)
    const isCorrect = this.checkAnswer(assessmentData.currentQuestion, answer);
    
    // Update database
    const updates = {
      lastAnswer: answer,
      lastAnswerTime: getServerTimestamp(),
      attempts: (assessmentData.attempts || 0) + 1,
      correctOverall: isCorrect || assessmentData.correctOverall || false
    };

    await assessmentRef.update(updates);

    // Return result
    return {
      success: true,
      isCorrect,
      feedback: isCorrect ? 
        assessmentData.currentQuestion.feedback?.correct : 
        assessmentData.currentQuestion.feedback?.incorrect,
      explanation: assessmentData.currentQuestion.explanation
    };
  }

  /**
   * Check if answer is correct (implement your logic)
   */
  checkAnswer(question, answer) {
    // Implement type-specific logic
    return false;
  }

  /**
   * Main handler
   */
  static async handle(data, assessmentConfig) {
    const params = extractParameters(data);
    const { operation } = params;

    // Initialize course if needed
    await initializeCourseIfNeeded(params.studentKey, params.courseId, params.isStaff);

    const core = new [Type]Core(assessmentConfig);

    switch (operation) {
      case 'generate':
        return await core.generateQuestion(params);
      case 'evaluate':
        return await core.evaluateAnswer(params);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }
}

// Create singleton for cloud function use
const [Type]CoreStatic = {
  handle: async (data, assessmentConfig) => {
    return [Type]Core.handle(data, assessmentConfig);
  }
};

module.exports = { [Type]Core, [Type]CoreStatic };
```

### 3. Integration Points

#### A. Export from assessments index (`/src/FirebaseCourses/components/assessments/index.js`)

```javascript
import Standard[Type]Question from './Standard[Type]Question/index';

export {
  // ... existing exports
  Standard[Type]Question
};
```

#### B. Add to SlideshowKnowledgeCheck (`/src/FirebaseCourses/components/assessments/SlideshowKnowledgeCheck/index.js`)

1. Import the component:
```javascript
import { Standard[Type]Question } from '../index';
```

2. Add case in renderQuestion switch:
```javascript
case '[type-name]':  // e.g., 'true-false'
  return (
    <Standard[Type]Question
      key={questionId}
      courseId={courseId}
      assessmentId={question.questionId}
      onComplete={handleQuestionComplete}
      onAttempt={(isCorrect) => {
        handleQuestionComplete(questionNumber);
        handleQuestionResult(questionNumber, isCorrect);
      }}
      onResult={handleQuestionResult}
      examMode={false}
      questionNumber={questionNumber}
      totalQuestions={questions.length}
      theme={theme}
      course={course}
      coursePath={coursePath}
      lessonPath={lessonPath}
      slideNumber={questionNumber}
      slideRef={questionId}
      questionIdPrefix={questionIdPrefix}
      {...additionalProps}
    />
  );
```

#### C. Add to AssessmentSession.js (`/src/FirebaseCourses/components/AssessmentSession.js`)

1. Import the component:
```javascript
import Standard[Type]Question from './assessments/Standard[Type]Question';
```

2. Add rendering condition:
```javascript
{currentQuestion.type === '[type-name]' && (
  <Standard[Type]Question
    courseId={courseId}
    assessmentId={`${assessmentId}_${currentQuestionIndex}`}
    onComplete={handleQuestionComplete}
    onAttempt={handleQuestionAttempt}
    examMode={true}
    examSessionId={examSessionId}
    preloadedQuestion={currentQuestion}
    questionNumber={currentQuestionIndex + 1}
    totalQuestions={questions.length}
    theme="slate"
    course={course}
    showFeedback={false}
    enableHints={false}
    enableAIChat={false}
  />
)}
```

#### D. Add to universal-assessments.js (`/functions/assessments/universal-assessments.js`)

1. Import the handler:
```javascript
const { [Type]CoreStatic } = require('../shared/assessment-types/[type]');
```

2. Add handler case:
```javascript
// Handle [type] questions
if (requestedType === '[type-name]' || assessmentConfig.type === '[type-name]') {
  console.log(`Processing [type] question for ${assessmentId}`);
  try {
    const result = await [Type]CoreStatic.handle(data, assessmentConfig);
    return result;
  } catch (error) {
    console.error(`Error processing [type] question for ${assessmentId}:`, error);
    throw new Error(`Failed to process [type] question: ${error.message}`);
  }
}
```

### 4. Assessment Configuration

In your course assessment files (`/functions/courses/[courseId]/[lesson]/assessments.js`):

```javascript
const assessmentConfigs = {
  'course[X]_[lesson]_[name]': {
    type: '[type-name]',  // Must match the case statements
    questions: [
      {
        questionText: "Question text here",
        // Type-specific fields
        correctAnswer: "...",
        explanation: "...",
        feedback: {
          correct: "...",
          incorrect: "..."
        },
        difficulty: 'beginner|intermediate|advanced',
        tags: ['tag1', 'tag2']
      }
    ],
    randomizeQuestions: true,
    allowSameQuestion: false,
    activityType: 'lesson|assignment|quiz|exam',
    maxAttempts: 3,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    enableAIChat: true,
    attemptPenalty: 0.1,
    theme: 'blue|green|purple|indigo|slate'
  }
};
```

### 5. Assessment Mapping

Add to `/functions/courses/[courseId]/assessment-mapping.js`:

```javascript
module.exports = {
  'course[X]_[lesson]_[name]': '[lesson]/assessments',
  // ...
};
```

## Testing Checklist

### Frontend Testing
- [ ] Component renders without errors
- [ ] Question generation works
- [ ] Answer submission works
- [ ] Feedback displays correctly
- [ ] Regenerate button works (no infinite loops)
- [ ] AI Chat integration works (if enabled)
- [ ] Exam mode works (no feedback, no regenerate)
- [ ] Props are properly passed and used

### Backend Testing
- [ ] Cloud function accepts requests
- [ ] Database paths are correct (uses getDatabaseRef properly)
- [ ] isStaff parameter is extracted and used
- [ ] Attempt limits are enforced
- [ ] Question pooling works
- [ ] Answer evaluation is accurate
- [ ] Database updates are correct

### Integration Testing
- [ ] Works in SlideshowKnowledgeCheck
- [ ] Works in AssessmentSession (exam mode)
- [ ] Database structure is maintained
- [ ] Progress tracking works
- [ ] Gradebook updates correctly

## Common Pitfalls to Avoid

1. **Database Path Errors**: Always use `getDatabaseRef('studentAssessment', ...)` not raw path strings
2. **Missing Parameters**: Always extract `isStaff` from params in backend handlers
3. **Infinite Loops**: Use refs to prevent multiple onComplete calls in SlideshowKnowledgeCheck
4. **Props Mismatch**: Ensure all required props are accepted and passed correctly
5. **Type String Consistency**: The type string must match across all files (config, switch cases, etc.)

## Example Implementation: True/False Questions

See the following files for a complete working example:
- Frontend: `/src/FirebaseCourses/components/assessments/StandardTrueFalseQuestion/index.js`
- Backend: `/functions/shared/assessment-types/true-false.js`
- Config: `/functions/courses/5/01_data_science_introduction_overview/assessments.js`

### True/False Display Styles

The True/False question component supports multiple display styles via the `displayStyle` prop:

1. **`buttons`** (default): Traditional radio button style with True/False options
2. **`dropdown`**: Select dropdown menu for choosing True or False
3. **`checkbox`**: Single checkbox for acknowledgment (checked = true, unchecked = false)
4. **`toggle`**: iOS-style toggle switch between False and True
5. **`cards`**: Large card-based selection with icons

Example usage in lesson component:
```javascript
<StandardTrueFalseQuestion
  courseId={courseId}
  assessmentId={questionId}
  displayStyle="toggle"  // or 'dropdown', 'checkbox', 'cards', 'buttons'
  theme={theme}
  // ... other props
/>
```

The checkbox style is particularly useful for acknowledgment questions where you want students to confirm they've read or understood something.

## Required Dependencies

Ensure these are installed:
- Frontend: `react`, `firebase`, `react-markdown`, `remark-math`, `rehype-katex`, `lucide-react`
- Backend: `firebase-admin`, `firebase-functions`

## Deployment

After implementing a new question type:
1. Test locally with Firebase emulator
2. Deploy cloud functions: `firebase deploy --only functions`
3. Test in production environment
4. Monitor error logs for any issues

## Support

For questions or issues, check:
1. Existing question type implementations for patterns
2. Firebase logs for backend errors
3. Browser console for frontend errors
4. Database structure in Firebase Console