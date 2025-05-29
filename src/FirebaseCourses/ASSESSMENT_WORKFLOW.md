# Firebase Course Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Course Creation Workflow](#course-creation-workflow)
4. [Course Structure and Navigation](#course-structure-and-navigation)
5. [Assessment System](#assessment-system)
6. [AI Multiple Choice Question System](#ai-multiple-choice-question-system)
7. [Security Model](#security-model)


## Overview

This guide provides comprehensive documentation for creating Firebase-based courses in the RTD Academy platform. The system uses a modular, convention-based approach that prioritizes security, maintainability, and developer experience.

### Key Features
- 🔒 **Security-First Design**: Sensitive data (grades, answers) stored server-side only
- 📁 **File-Based Configuration**: Course structure defined in JSON files, not database
- 🧩 **Modular Assessments**: Reusable assessment types with minimal code
- 🎯 **Convention-Based**: Predictable naming patterns and folder structures
- ⚡ **Fast Development**: Create courses in minutes using templates

## Architecture

### System Components

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Dashboard     │────▶│  Course Router  │────▶│ Course Component│
│  (CourseCard)   │     │                 │     │   (Course2)     │
└─────────────────┘     └─────────────────┘     └────────┬────────┘
                                                          │
                                    ┌─────────────────────▼────────────────┐
                                    │      FirebaseCourseWrapper           │
                                    │  • Navigation                        │
                                    │  • Progress Tracking                 │
                                    │  • Grade Display                     │
                                    └────────┬─────────────────────────────┘
                                             │
                        ┌────────────────────┴────────────────────┐
                        │                                          │
            ┌───────────▼────────────┐              ┌─────────────▼──────────┐
            │   Course Content       │              │   Cloud Functions      │
            │ • Lessons              │◀────────────▶│ • Generate Questions   │
            │ • Assessments          │              │ • Evaluate Answers     │
            │ • Interactive Elements │              │ • Update Grades        │
            └────────────────────────┘              └────────────────────────┘
```

### Data Flow

1. **Student Access**: Student clicks course in dashboard
2. **Routing**: CourseRouter loads the appropriate course component
3. **Configuration**: Course component loads JSON configs (structure & display)
4. **Wrapper**: FirebaseCourseWrapper provides navigation and progress UI
5. **Content**: Course content renders with embedded assessments
6. **Assessment**: Cloud functions handle secure question generation/evaluation

## Course Creation Workflow

### Quick Start

Create a new course in 3 steps:

```bash
# 1. Generate course from template
npm run create-course -- --id=3 --title="Chemistry 30" --grade=12

# 2. Add cloud functions to index.js
# (Follow the output instructions)

# 3. Deploy
firebase deploy --only functions:course3_*
```

### Generated File Structure

```
src/FirebaseCourses/courses/3/
├── index.js                    # Main course component
├── course-display.json         # Display settings (safe for frontend)
├── course-structure.json       # Navigation structure
└── content/                    # Course content
    ├── index.js               # Content registry
    ├── 01-getting-started/
    │   ├── index.js          # Lesson component
    │   ├── README.md         # Documentation
    │   └── assets/           # Images, videos
    └── 02-core-concepts/
        └── index.js

functions/courses/3/            # Cloud functions
├── shared/
│   └── aiQuestions.js        # Shared AI question generator
└── 02-core-concepts/
    ├── assessments.js        # Assessment functions
    └── fallback-questions.js # Fallback questions

functions/courses-config/3/     # Secure backend config
└── course-config.json         # All settings including sensitive ones
```

## Course Structure and Navigation

### Important: JSON-Based Structure Loading

The course structure is loaded from JSON files, NOT from the database. This happens in the CourseRouter:

```javascript
// In CourseRouter.js
case '2':
  const courseStructureData = require('./courses/2/course-structure.json');
  const courseWithStructure = {
    ...course,
    courseStructure: {
      title: courseStructureData.title,
      structure: courseStructureData.units
    }
  };
  // This enhanced course object is passed to FirebaseCourseWrapper
```

This ensures:
- Course structure is version-controlled
- No database queries for navigation
- Faster loading and development
- Easy testing and modification

### course-structure.json

Defines the course navigation and content organization:

```json
{
  "title": "Physics 30",
  "units": [
    {
      "unitId": "unit_kinematics",
      "name": "Kinematics",
      "section": "1",
      "sequence": 1,
      "items": [
        {
          "itemId": "lesson_intro_motion",
          "type": "lesson",
          "title": "Introduction to Motion",
          "contentPath": "01-intro-motion",
          "learningObjectives": [
            "Define position, displacement, and distance",
            "Distinguish between scalar and vector quantities"
          ],
          "hasCloudFunctions": false
        },
        {
          "itemId": "lesson_velocity",
          "type": "lesson", 
          "title": "Velocity and Acceleration",
          "contentPath": "02-velocity-acceleration",
          "hasCloudFunctions": true,
          "assessments": [
            {
              "assessmentId": "velocity_calculation",
              "type": "ai_multiple_choice",
              "cloudFunctionName": "course3_02_velocity_acceleration_aiQuestion"
            }
          ]
        },
        {
          "itemId": "assignment_kinematics",
          "type": "assignment",
          "title": "Kinematics Problem Set",
          "contentPath": "03-kinematics-assignment",
          "hasCloudFunctions": true,
          "dueAfterDays": 7
        }
      ]
    }
  ]
}
```

### Key Structure Concepts

1. **Units**: Major course sections (e.g., "Kinematics", "Dynamics")
2. **Sections**: Optional grouping (1, 2, 3) for organizing units
3. **Items**: Individual content pieces (lessons, assignments, exams)
4. **Content Path**: Maps to folder in `content/` directory
5. **Cloud Functions**: Flag indicating if backend functions exist

### course-display.json

Contains only safe, display-related settings:

```json
{
  "courseId": "3",
  "title": "Chemistry 30",
  "fullTitle": "3 - Chemistry 30",
  "description": "Grade 12 Chemistry covering stoichiometry, gases, solutions...",
  "grade": "12",
  "prerequisites": ["Chemistry 20", "Math 20-1"],
  "instructors": ["Dr. Smith"],
  "duration": "1 semester",
  "theme": {
    "primaryColor": "green",
    "secondaryColor": "blue"
  },
  "displaySettings": {
    "showProgressBar": true,
    "showGrades": true,
    "enableTextToSpeech": true
  }
}
```

### course-config.json (Backend Only)

Stored in `functions/courses-config/3/`, contains ALL settings:

```json
{
  "courseId": "3",
  "title": "Chemistry 30",
  "credits": 5,
  "weights": {
    "lesson": 0.2,
    "assignment": 0.3,
    "exam": 0.5
  },
  "settings": {
    "allowLateSubmissions": true,
    "latePenaltyPerDay": 0.05,
    "maxLateDays": 7,
    "requireSequentialProgress": false,
    "enableAIQuestions": true
  }
}
```

**Security Note**: Students cannot modify these settings as they're server-side only.

## Assessment System

### Modular Assessment Types

The platform provides pre-built assessment modules:

#### 1. AI Multiple Choice

```javascript
const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');

exports.course3_02_velocity_aiQuestion = createAIMultipleChoice({
  prompts: {
    beginner: "Create a basic physics question about velocity...",
    intermediate: "Create a question requiring velocity calculations...",
    advanced: "Create a complex multi-step velocity problem..."
  },
  maxAttempts: 3,
  pointsValue: 5,
  fallbackQuestions: VELOCITY_FALLBACK_QUESTIONS
});
```

#### 2. Standard Multiple Choice

```javascript
const { createStandardMultipleChoice } = require('../../../../shared/assessment-types/standard-multiple-choice');

exports.course3_01_concepts_multipleChoice = createStandardMultipleChoice({
  questions: PREDEFINED_QUESTIONS,
  randomizeOrder: true,
  maxAttempts: 2
});
```

### Creating Fallback Questions

Every AI assessment needs fallback questions for when AI generation fails:

```javascript
// In fallback-questions.js
const VELOCITY_FALLBACK_QUESTIONS = [
  {
    difficulty: 'beginner',
    questionText: "A car travels 120 km in 2 hours. What is its average velocity?",
    options: [
      { id: "a", text: "60 km/h", feedback: "Correct! Velocity = distance/time" },
      { id: "b", text: "240 km/h", feedback: "Check your calculation" },
      { id: "c", text: "30 km/h", feedback: "Review the velocity formula" },
      { id: "d", text: "120 km/h", feedback: "Remember to divide by time" }
    ],
    correctOptionId: "a",
    explanation: "Average velocity = total distance / total time = 120 km / 2 h = 60 km/h"
  }
  // Add intermediate and advanced questions...
];

module.exports = { VELOCITY_FALLBACK_QUESTIONS };
```

### Embedding Assessments in Content

```jsx
import { AIMultipleChoiceQuestion } from '../../components/assessments';

const VelocityLesson = ({ courseId, itemConfig }) => {
  return (
    <div className="space-y-6">
      <section>
        <h2>Understanding Velocity</h2>
        <p>Velocity is the rate of change of position...</p>
      </section>

      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="velocity_calculation"
        cloudFunctionName="course3_02_velocity_aiQuestion"
        title="Check Your Understanding"
        theme="blue"
      />
    </div>
  );
};
```

### Database Schema

#### Student Assessment Data
```
/students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/
  - questionText: string
  - options: array
  - attempts: number
  - maxAttempts: number
  - status: "active" | "completed" | "failed"
  - correctOverall: boolean
  - lastSubmission: {
      answer: string
      isCorrect: boolean
      timestamp: timestamp
      feedback: string
    }
```

#### Student Grades
```
/students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}
  - score: number (e.g., 5 for 5 points)
```

#### Secure Assessment Data (Server Only)
```
/courses_secure/{courseId}/assessments/{assessmentId}/
  - correctOptionId: string
  - explanation: string
  - optionFeedback: object
```

## AI Multiple Choice Question System

### Overview

The AI Multiple Choice Question system provides a secure, flexible way to generate dynamic questions using Google's Gemini AI. It separates sensitive data (correct answers) from student-accessible data and provides extensive customization options.

### Complete Workflow

1. **Frontend Component** (`AIMultipleChoiceQuestion/index.js`)
   - Displays questions and handles user interactions
   - Manages UI state (loading, regenerating, submitting)
   - Communicates with cloud functions for secure operations
   - Supports LaTeX/KaTeX math rendering

2. **Cloud Function** (`assessments.js`)
   - Uses the `createAIMultipleChoice` factory function
   - Defines course-specific prompts and settings
   - Handles secure operations (generate/evaluate)

3. **Shared Module** (`ai-multiple-choice.js`)
   - Provides reusable AI question generation logic
   - Manages database interactions securely
   - Implements attempt tracking and grade calculation

### Configuration Parameters

#### Frontend Component Props

```jsx
<AIMultipleChoiceQuestion
  // Required Props
  courseId="2"                    // Course identifier
  assessmentId="momentum_practice" // Unique assessment ID
  cloudFunctionName="course2_02_momentum_one_dimension_aiQuestion"
  
  // Optional Props
  course={courseObject}           // Course data object
  topic="Momentum"                // Topic for AI generation
  theme="purple"                  // UI theme (blue, green, purple, amber)
  questionClassName=""            // Additional CSS classes
  optionsClassName=""             // CSS for options container
  
  // Callbacks
  onCorrectAnswer={() => {}}      // Called when answer is correct
  onAttempt={(isCorrect) => {}}   // Called on each attempt
  onComplete={() => {}}           // Called when assessment complete
/>
```

#### Cloud Function Configuration

```javascript
exports.course2_02_momentum_one_dimension_aiQuestion = createAIMultipleChoice({
  // AI Prompts for Different Difficulty Levels
  prompts: {
    beginner: "Create a basic question...",
    intermediate: "Create a moderate question...",
    advanced: "Create a challenging question..."
  },
  
  // Activity Type (SECURITY: hardcoded, cannot be changed by client)
  activityType: 'lesson',  // lesson | assignment | lab | exam
  
  // Formatting Options
  katexFormatting: true,   // Enable LaTeX math support
  
  // Assessment Settings (can use course config values)
  maxAttempts: 999,        // Number from config or hardcoded
  pointsValue: 5,          // Points awarded for correct answer
  showFeedback: true,      // Show detailed feedback
  enableHints: true,       // Enable hint system
  attemptPenalty: 0,       // Points deducted per attempt
  theme: 'purple',         // Default UI theme
  
  // Difficulty Settings
  allowDifficultySelection: false,  // Let students choose difficulty
  defaultDifficulty: 'intermediate', // Default difficulty level
  freeRegenerationOnDifficultyChange: false, // Free regenerate on difficulty change
  
  // AI Generation Settings
  aiSettings: {
    temperature: 0.7,      // Creativity level (0-1)
    topP: 0.9,            // Nucleus sampling
    topK: 40,             // Top-k sampling
    maxTokens: 1000       // Max response length
  },
  
  // Course Metadata
  subject: 'Physics 30',
  gradeLevel: 12,
  topic: 'Momentum in One Dimension',
  learningObjectives: [
    'Define momentum',
    'Calculate momentum',
    'Apply conservation laws'
  ],
  
  // Fallback Questions (required for reliability)
  fallbackQuestions: [
    {
      questionText: "A car has momentum of...",
      options: [
        { id: 'a', text: '30,000 kg·m/s', feedback: 'Correct!' },
        { id: 'b', text: '15,000 kg·m/s', feedback: 'Check calculation' }
      ],
      correctOptionId: 'a',
      explanation: 'Momentum = mass × velocity',
      difficulty: 'beginner'
    }
  ],
  
  // Cloud Function Settings
  timeout: 120,           // Function timeout in seconds
  memory: '512MiB',       // Function memory allocation
  region: 'us-central1'   // Deployment region
});
```

### Course Configuration Hierarchy

The system uses a hierarchical configuration system with these priority levels:

1. **Hardcoded in Assessment Function** (Highest Priority)
   ```javascript
   activityType: 'lesson',  // Cannot be overridden
   maxAttempts: 5          // Specific to this assessment
   ```

2. **Activity Type Configuration** (`course-config.json`)
   ```json
   "activityTypes": {
     "lesson": {
       "maxAttempts": 999,
       "pointValue": 5,
       "theme": "purple"
     }
   }
   ```

3. **Global Course Settings** (Lowest Priority)
   ```json
   "globalSettings": {
     "enableAIQuestions": true,
     "showProgressBar": true
   }
   ```

### Database Structure

#### Student-Accessible Data
```javascript
// /students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}
{
  timestamp: 1234567890,
  questionText: "Calculate the momentum of a 2000 kg car...",
  options: [
    { id: 'a', text: '30,000 kg·m/s' },
    { id: 'b', text: '15,000 kg·m/s' }
  ],
  topic: "Momentum",
  difficulty: "intermediate",
  generatedBy: "ai",
  attempts: 2,
  status: "active",
  maxAttempts: 999,
  activityType: "lesson",
  pointsValue: 5,
  settings: {
    showFeedback: true,
    enableHints: true,
    allowDifficultySelection: false,
    theme: "purple"
  }
}
```

#### Secure Server-Only Data
```javascript
// /courses_secure/{courseId}/assessments/{assessmentId}
{
  correctOptionId: "a",
  explanation: "Momentum = mass × velocity = 2000 kg × 15 m/s = 30,000 kg·m/s",
  optionFeedback: {
    "a": "Correct! You properly applied p = mv",
    "b": "Remember to multiply mass by velocity",
    "c": "Check your calculation",
    "d": "Review the momentum formula"
  },
  timestamp: 1234567890
}
```

### Creating Custom Cloud Functions

Course creators can create custom assessment functions while maintaining security:

#### Available Database Utilities

The `database-utils.js` module provides essential utilities:

```javascript
const { 
  extractParameters,      // Extracts and validates function parameters
  initializeCourseIfNeeded, // Ensures course structure exists
  getServerTimestamp,     // Gets server timestamp (works in emulator too)
  getDatabaseRef,         // Gets typed database references
  DATABASE_PATHS         // Standard path templates
} = require('../shared/utilities/database-utils');
```

**Database Path Types:**
- `studentAssessment`: `/students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}`
- `studentGrade`: `/students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}`
- `courseAssessment`: `/courses/{courseId}/assessments/{assessmentId}`
- `secureAssessment`: `/courses_secure/{courseId}/assessments/{assessmentId}`
- `studentCourse`: `/students/{studentKey}/courses/{courseId}`

#### Step-by-Step Custom Function Example

```javascript
const { onCall } = require('firebase-functions/v2/https');
const { 
  extractParameters, 
  initializeCourseIfNeeded, 
  getServerTimestamp, 
  getDatabaseRef 
} = require('../shared/utilities/database-utils');

exports.course3_custom_assessment = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
  enforceAppCheck: false
}, async (data, context) => {
  // Step 1: Extract and validate parameters
  // This automatically handles authentication, sanitizes emails, and validates required fields
  const params = extractParameters(data, context);
  // Returns: { courseId, assessmentId, operation, answer, topic, difficulty, 
  //           studentEmail, userId, studentKey, isEmulator }
  
  // Step 2: Ensure course structure exists
  await initializeCourseIfNeeded(params.studentKey, params.courseId);
  
  // Step 3: Handle different operations
  if (params.operation === 'generate') {
    // Get student assessment reference
    const assessmentRef = getDatabaseRef(
      'studentAssessment', 
      params.studentKey, 
      params.courseId, 
      params.assessmentId
    );
    
    // Create your custom question logic
    const questionData = {
      timestamp: getServerTimestamp(),
      questionText: "Your custom question text",
      options: [
        { id: 'a', text: 'Option A' },
        { id: 'b', text: 'Option B' },
        { id: 'c', text: 'Option C' },
        { id: 'd', text: 'Option D' }
      ],
      attempts: 0,
      maxAttempts: 3,
      status: 'active',
      topic: params.topic,
      difficulty: params.difficulty
    };
    
    // Save to student's assessment data
    await assessmentRef.set(questionData);
    
    // Store secure data separately (server-only)
    const secureRef = getDatabaseRef(
      'secureAssessment',
      params.courseId,
      params.assessmentId
    );
    
    await secureRef.set({
      correctOptionId: 'a',
      explanation: 'Detailed explanation here',
      optionFeedback: {
        'a': 'Correct! Well done.',
        'b': 'Incorrect. Consider...',
        'c': 'Not quite. Remember...',
        'd': 'Try again. Think about...'
      },
      timestamp: getServerTimestamp()
    });
    
    return { 
      success: true, 
      message: 'Question generated successfully' 
    };
  }
  
  if (params.operation === 'evaluate') {
    // Get current assessment data
    const assessmentRef = getDatabaseRef(
      'studentAssessment',
      params.studentKey,
      params.courseId,
      params.assessmentId
    );
    
    const snapshot = await assessmentRef.once('value');
    const assessmentData = snapshot.val();
    
    if (!assessmentData) {
      throw new Error('Assessment not found');
    }
    
    // Get secure data for evaluation
    const secureRef = getDatabaseRef(
      'secureAssessment',
      params.courseId,
      params.assessmentId
    );
    
    const secureSnapshot = await secureRef.once('value');
    const secureData = secureSnapshot.val();
    
    // Evaluate the answer
    const isCorrect = params.answer === secureData.correctOptionId;
    const feedback = secureData.optionFeedback[params.answer] || 'No feedback available';
    
    // Update attempts
    const newAttempts = (assessmentData.attempts || 0) + 1;
    
    // Update assessment data
    await assessmentRef.update({
      attempts: newAttempts,
      lastSubmission: {
        answer: params.answer,
        isCorrect: isCorrect,
        feedback: feedback,
        timestamp: getServerTimestamp()
      },
      status: isCorrect ? 'completed' : 'attempted'
    });
    
    // Update grade if correct
    if (isCorrect) {
      const gradeRef = getDatabaseRef(
        'studentGrade',
        params.studentKey,
        params.courseId,
        params.assessmentId
      );
      
      await gradeRef.set(assessmentData.pointsValue || 5);
    }
    
    return {
      success: true,
      result: {
        isCorrect: isCorrect,
        feedback: feedback,
        explanation: secureData.explanation
      }
    };
  }
  
  throw new Error('Invalid operation');
});
```

### Activity Type Inference

If `activityType` is not hardcoded, the system infers it from the assessment ID:

- Contains "assignment", "homework", "hw" → `assignment`
- Contains "exam", "test", "final" → `exam`
- Contains "lab", "laboratory", "experiment" → `lab`
- Default → `lesson`

### Prompt Modules

The system supports conditional prompt modules that enhance AI generation:

#### Available Modules

1. **KaTeX Formatting Module** (`katexFormatting: true`)
   
   When enabled, adds these system instructions to the AI:
   ```
   - Use LaTeX syntax: $p = mv$ for inline math, $$F = ma$$ for display math
   - For units with multiplication: $\text{kg}\cdot\text{m/s}$
   - For fractions: $\frac{1}{2}mv^2$
   - For Greek letters: $\Delta p$, $\theta$, $\omega$
   - For subscripts/superscripts: $v_1$, $v_2$, $x^2$
   - Always wrap units in \text{}: $\text{m/s}$, $\text{kg}$, $\text{N}$
   ```

#### Creating Custom Prompt Modules

1. Create a new module in `functions/shared/prompt-modules/`:
   ```javascript
   // custom-formatting.js
   const CUSTOM_FORMATTING_PROMPT = `Your custom instructions here...`;
   
   module.exports = { CUSTOM_FORMATTING_PROMPT };
   ```

2. Register in `functions/shared/prompt-modules/index.js`:
   ```javascript
   const { CUSTOM_FORMATTING_PROMPT } = require('./custom-formatting');
   
   function applyPromptModules(config = {}) {
     const promptAdditions = [];
     
     if (config.katexFormatting === true) {
       promptAdditions.push(KATEX_FORMATTING_PROMPT);
     }
     
     if (config.customFormatting === true) {
       promptAdditions.push(CUSTOM_FORMATTING_PROMPT);
     }
     
     return promptAdditions.join('\n\n');
   }
   ```

3. Use in your assessment configuration:
   ```javascript
   exports.course3_assessment = createAIMultipleChoice({
     katexFormatting: true,
     customFormatting: true,
     // ... other config
   });
   ```

### Best Practices

1. **Always Provide Fallback Questions**
   - Include questions for each difficulty level
   - Test fallbacks thoroughly
   - Ensure mathematical notation is correct

2. **Security Considerations**
   - Never expose correct answers to frontend
   - Validate all inputs server-side
   - Use secure database paths for sensitive data

3. **Performance Optimization**
   - Set appropriate memory limits
   - Use reasonable token limits for AI
   - Implement proper error handling

4. **User Experience**
   - Provide clear feedback messages
   - Show remaining attempts
   - Handle loading states gracefully

5. **Testing Strategy**
   - Test with Gemini API disabled (fallbacks)
   - Verify attempt tracking
   - Check grade calculations
   - Test all difficulty levels

### Example Implementation

Here's a complete example of implementing AI Multiple Choice Questions in a Physics 30 momentum lesson:

```javascript
// In: functions/courses/2/02-momentum-one-dimension/assessments.js
const { createAIMultipleChoice } = require('../../../shared/assessment-types/ai-multiple-choice');
const courseConfig = require('../../../courses-config/2/course-config.json');

exports.course2_02_momentum_one_dimension_aiQuestion = createAIMultipleChoice({
  prompts: {
    beginner: `Create a basic momentum question for Grade 12 Physics...`,
    intermediate: `Create an intermediate momentum question...`,
    advanced: `Create an advanced momentum question...`
  },
  
  activityType: 'lesson',
  katexFormatting: true,
  
  // Pull settings from course config
  maxAttempts: courseConfig.activityTypes.lesson.maxAttempts,
  pointsValue: courseConfig.activityTypes.lesson.pointValue,
  showFeedback: courseConfig.activityTypes.lesson.showDetailedFeedback,
  theme: courseConfig.activityTypes.lesson.theme,
  
  fallbackQuestions: require('./fallback-questions').MOMENTUM_FALLBACK_QUESTIONS
});

// In: src/FirebaseCourses/courses/2/content/02-momentum-one-dimension/index.js
import AIMultipleChoiceQuestion from '../../../../components/assessments/AIMultipleChoiceQuestion';

const MomentumLesson = ({ courseId }) => {
  return (
    <div>
      <h1>Momentum in One Dimension</h1>
      
      <AIMultipleChoiceQuestion
        courseId={courseId}
        assessmentId="momentum_1d_practice"
        cloudFunctionName="course2_02_momentum_one_dimension_aiQuestion"
        topic="Momentum in One Dimension"
      />
    </div>
  );
};
```

### Summary

The AI Multiple Choice Question system provides:

1. **Security**: Complete separation of answers from student-accessible data
2. **Flexibility**: Extensive configuration options at multiple levels
3. **Reliability**: Fallback questions ensure system always works
4. **Customization**: Support for custom functions and prompt modules
5. **User Experience**: Real-time feedback, attempt tracking, and progress indicators

This architecture ensures that course creators can quickly implement secure, AI-powered assessments while maintaining full control over the learning experience.

## Security Model

### Frontend Security

1. **Display-Only Config**: Frontend only has access to `course-display.json`
2. **No Sensitive Data**: Grades, weights, penalties stored backend-only
3. **Read-Only Structure**: Course structure is for navigation only
4. **No Answer Logic**: All evaluation happens server-side

### Backend Security

1. **Authentication Required**: All cloud functions verify user identity
2. **User Isolation**: Students can only access their own data
3. **Server-Side Evaluation**: Answers never exposed to client
4. **Audit Trail**: All submissions timestamped and logged
5. **Configuration Hierarchy**: Settings cascade from global → course → assessment

### Anti-Cheating Measures

- ✅ Answers stored in `/courses_secure/` (inaccessible to clients)
- ✅ Question regeneration uses server-side seeds
- ✅ Attempt tracking prevents unlimited retries
- ✅ Time limits enforced server-side
- ✅ Grade calculations happen in cloud functions only

