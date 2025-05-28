# Assessment Workflow Documentation

## Overview

This document outlines the secure assessment system for delivering and evaluating student questions in our e-learning platform. The system is designed with the following key principles:

1. **Security-First Design**: Question logic, parameters, and answers are stored server-side
2. **Separation of Concerns**: Content delivery (client) vs. assessment logic (server)
3. **Stateful Tracking**: Student progress and assessment results are tracked in the database
4. **Modular Architecture**: Reusable assessment types with shared utilities and configuration
5. **Configuration Hierarchy**: Global defaults → Course settings → Assessment-level overrides
6. **Template-Based Development**: Standardized course creation with convention-based naming

## Modular Assessment System (NEW)

The platform now uses a modular assessment system that dramatically simplifies course development:

### Available Assessment Types:
- **AI Multiple Choice**: `createAIMultipleChoice()` - Generates questions using AI with course-specific prompts
- **Standard Multiple Choice**: Traditional predefined questions
- **Dynamic Math**: Parameterized math problems (extensible)
- **Assignment Submission**: File upload and text submission handling

### Benefits:
- ✅ **No Code Duplication**: Shared, tested logic across all courses
- ✅ **Consistent Database Integration**: Automatic adherence to security and data patterns
- ✅ **Easy Customization**: Configure with prompts and settings, not complex code
- ✅ **Automatic Fallbacks**: Course-specific fallback questions when AI fails

## Component Architecture

The assessment system consists of these key components:

### 1. Client-Side Components

- **Lesson Content**: React components that display course content and embed assessment questions
- **Assessment UI**: Components that render question interfaces and collect student responses
- **Course Wrapper**: Manages student session and provides access to course data from the database
- **Progress Tracking**: Monitors and displays student progress through the course

### 2. Server-Side Components

- **Cloud Functions**: Generate questions, evaluate answers, and update student records
- **Database**: Stores student progress, assessment data, grades, and assessment settings
- **Auth**: Verifies student identity and permissions

## Workflow Sequence

The assessment workflow follows this sequence:

1. **Question Initialization**:
   - Student accesses a lesson page with embedded assessment questions
   - Client calls cloud function with student info (email, courseId, questionId)
   - Cloud function retrieves assessment settings from the database
   - Cloud function generates question parameters using a seed unique to the student
   - Question data is stored in the student's database path
   - Client displays the question using data from the database

2. **Answer Submission**:
   - Student submits an answer
   - Client sends the answer along with question metadata (including seed) to cloud function
   - Cloud function regenerates the question using the original seed
   - Answer is evaluated server-side
   - Results are stored in the database
   - Grade data is updated based on configured point values and difficulty multipliers

3. **Progress Tracking**:
   - Assessment completion is recorded in student progress
   - Grade calculations are updated

## Database Structure

### Course Structure Data

The course structure is stored in the database under the following path:

```
/courses/{courseId}/courseDetails/courseStructure/structure/
[
  {
    "name": "Unit Name",
    "section": "1",
    "unitId": "unit_identifier",
    "items": [
      {
        "itemId": "lesson_identifier",
        "title": "Lesson Title",
        "type": "lesson",
        "content": "content_registry_key",
        "assessments": [
          {
            "id": "assessment_id",
            "type": "multiple_choice",
            "functionName": "cloud_function_path",
            "weight": 1,
            "maxAttempts": 3,
            "points": 5
          }
        ]
      }
    ]
  }
]
```

This structure defines:
- Units with sections and unique identifiers
- Items within units (lessons, assignments, exams)
- Assessments embedded within items, with their configurations

### Student Assessment Data

The assessment data is stored in the following paths:

```
/students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/
  - seed: Number
  - timestamp: Timestamp
  - attempts: Number
  - maxAttempts: Number
  - pointsValue: Number
  - parameters: Object
  - questionText: String
  - status: String (e.g., "active", "attempted", "completed", "failed")
  - difficulty: String (for dynamic questions)
  - settings: Object
    - showFeedback: Boolean
    - randomizeOptions: Boolean
    - showRegenerate: Boolean
  - lastSubmission: Object
    - answer: Any
    - timestamp: Timestamp
    - isCorrect: Boolean
    - feedback: String
  - submissions: Array
    - [each submission with timestamp and result]

/students/{studentKey}/courses/{courseId}/Grades/
  - assessments: Object
    - [assessmentId]: Number (score)
  - lessons: Object
    - [lessonId]: Number (score)
  - assignments: Object
    - [assignmentId]: Number (score)
  - exams: Object
    - [examId]: Number (score)
  - totalScore: Number
  - weightedScore: Number
```

### Assessment Settings

Assessment configuration is stored in the following paths:

```
/courses/{courseId}/assessmentSettings/
  - default: Object
    - maxAttempts: Number
    - pointsValue: Number
    - showFeedback: Boolean
    - randomizeOptions: Boolean
    - showRegenerate: Boolean
    - passThreshold: Number
    - timeLimit: Number (null for unlimited)
  
  - contentTypes: Object
    - lesson: Object
      - maxAttempts: Number
      - pointsValue: Number
      - timeLimit: Number
    - assignment: Object
      - maxAttempts: Number
      - pointsValue: Number
      - timeLimit: Number
    - exam: Object
      - maxAttempts: Number
      - pointsValue: Number
      - timeLimit: Number
      - showFeedback: Boolean
  
  - questionTypes: Object
    - multipleChoice: Object
      - maxAttempts: Number
      - pointsValue: Number
      - randomizeOptions: Boolean
    - dynamic: Object
      - maxAttempts: Number
      - pointsValue: Number
      - showRegenerate: Boolean
      - difficulties: Object
        - beginner: Object
          - pointsMultiplier: Number
        - intermediate: Object
          - pointsMultiplier: Number
        - advanced: Object
          - pointsMultiplier: Number
```

## Cloud Function Implementation

### Modular Architecture

Cloud functions now use a modular architecture with shared components:

```
/functions/
├── shared/
│   ├── assessment-types/          # Reusable assessment modules
│   │   ├── ai-multiple-choice.js  # createAIMultipleChoice()
│   │   ├── standard-multiple-choice.js
│   │   └── dynamic-math.js
│   ├── utilities/                 # Shared utilities
│   │   ├── database-utils.js      # Standard DB operations
│   │   ├── config-loader.js       # Configuration hierarchy
│   │   └── parameter-validator.js # Input validation
│   └── schemas/                   # Zod validation schemas
└── courses/{courseId}/{contentPath}/
    └── assessments.js             # Course-specific implementations
```

### Example Course Implementation

Course developers now create simple configuration-based functions:

```javascript
// Import the modular assessment type
const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');
const { FALLBACK_QUESTIONS } = require('./fallback-questions');

// Create an AI multiple choice assessment with course-specific config
exports.course2_02_core_concepts_aiQuestion = createAIMultipleChoice({
  // Course-specific prompts
  prompts: {
    beginner: "Create a basic physics question about...",
    intermediate: "Create a physics problem requiring...",
    advanced: "Create a complex physics scenario..."
  },
  
  // Override default settings
  maxAttempts: 3,
  pointsValue: 5,
  
  // Course-specific fallback questions
  fallbackQuestions: FALLBACK_QUESTIONS
});
```

### Configuration Hierarchy

Settings are merged in this priority order:

1. **Assessment-Level Config** (highest priority): Settings in `createAIMultipleChoice({...})`
2. **Course Config**: Values from `course-config.json`
3. **Global Defaults** (lowest priority): Values from `courses/config/assessment-defaults.json`

## Client-Side Implementation

### Course Structure Implementation

The course structure is loaded from the database at the path `/courses/{courseId}/courseDetails/courseStructure/structure/` and used to build the course navigation and content rendering system. The key components involved are:

1. **FirebaseCourseWrapperImproved.js**: Loads course data from the database and prioritizes using the structure from `course.courseDetails.courseStructure.structure`

2. **CollapsibleNavigation.js**: Renders the course navigation using the structure data

3. **COM1255/index.js**: Renders the specific course content using the structure data

### Assessment Component Implementation

Assessment questions are integrated into lesson content using the `MultipleChoiceQuestion` component:

```jsx
import { MultipleChoiceQuestion } from '../../../../components/assessments';

const LessonContent = () => {
  return (
    <div>
      {/* Lesson content here */}

      <MultipleChoiceQuestion
        courseId="COM1255"
        assessmentId="q1_elearning_benefits"
        cloudFunctionName="COM1255_IntroToELearningQ1"
        theme="blue"
        title="Multiple Choice Question"
        onCorrectAnswer={() => console.log("Question answered correctly!")}
      />

      <MultipleChoiceQuestion
        courseId="COM1255"
        assessmentId="intro_dynamic_question"
        cloudFunctionName="COM1255_IntroToELearningDynamic"
        theme="green"
        title="Dynamic Math Question"
        showRegenerate={true}
      />
    </div>
  );
};
```

## Creating New Assessments (Updated Process)

The modular system has dramatically simplified assessment creation:

### For New Courses:
1. **Use Course Template**: Run `npm run create-course -- --id=COURSEID --title="Course Title"`
2. **Customize Prompts**: Edit the prompts in `assessments.js` for your subject matter
3. **Add Fallback Questions**: Create subject-specific fallback questions in `fallback-questions.js`
4. **Deploy**: Add to `functions/index.js` and deploy with `firebase deploy --only functions`

### For Additional Assessments in Existing Courses:

#### Option A: Use Modular Assessment Types
```javascript
// In assessments.js, add another modular assessment
exports.courseId_lesson_name_newAssessment = createAIMultipleChoice({
  prompts: {
    beginner: "Create a question about...",
    intermediate: "Create a question that...",
    advanced: "Create a complex question..."
  },
  maxAttempts: 2,
  pointsValue: 3
});
```

#### Option B: Create Custom Assessment
```javascript
// For unique requirements, create custom functions
const { onCall } = require('firebase-functions/v2/https');
const { extractParameters, getDatabaseRef } = require('../../../../shared/utilities/database-utils');

exports.courseId_lesson_name_customAssessment = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
}, async (data, context) => {
  const params = extractParameters(data, context);
  // Custom assessment logic here
});
```

### Benefits of New Process:
- ✅ **10x Faster Development**: Minutes instead of hours per assessment
- ✅ **Zero Boilerplate**: No database utilities, parameter validation, or security code needed
- ✅ **Consistent Behavior**: All assessments work the same way across courses
- ✅ **Automatic Best Practices**: Security, error handling, and database patterns built-in

## Security Considerations

The system implements these security measures:

1. All question logic is server-side only
2. Authentication is verified for all operations
3. Student can only access their own data
4. Answers are evaluated server-side
5. Settings are retrieved from secure database paths
6. Hardcoded overrides allow for specific security requirements
7. Seed-based question generation ensures consistent evaluation

## Gradebook Integration

Assessment results automatically update the student's gradebook:

1. Individual assessment scores are calculated based on:
   - Base point value from settings
   - Difficulty multiplier (for dynamic questions)
   - Attempt penalty (optional reduction for multiple attempts)
   
2. Weighted scoring is calculated based on:
   - Content type weights (lessons, assignments, exams)
   - Individual assessment weights within each content

## Configuration System (Updated)

The new system uses a file-based configuration hierarchy:

### Configuration Files:

1. **Global Defaults** (`functions/config/assessment-defaults.json`):
```json
{
  "questionTypes": {
    "multipleChoice": {
      "ai_generated": {
        "maxAttempts": 9999,
        "pointsValue": 2,
        "showFeedback": true,
        "generationPrompts": {
          "beginner": "Create a basic multiple-choice question...",
          "intermediate": "Create a multiple-choice question...",
          "advanced": "Create a complex multiple-choice question..."
        }
      }
    }
  },
  "cloudFunctions": {
    "timeout": 60,
    "memory": "512MiB",
    "region": "us-central1"
  }
}
```

2. **Course Configuration** (`functions/courses-config/{courseId}/course-config.json`):
```json
{
  "courseId": "2",
  "title": "Physics 30",
  "weights": {
    "lesson": 0.2,
    "assignment": 0.4,
    "exam": 0.4
  },
  "settings": {
    "maxAttempts": 3,
    "pointsValue": 5
  }
}
```

3. **Assessment-Level Configuration** (in assessment functions):
```javascript
exports.course2_lesson_aiQuestion = createAIMultipleChoice({
  maxAttempts: 2,        // Overrides course and global defaults
  pointsValue: 10,       // Overrides course and global defaults
  prompts: { ... }       // Overrides global prompts
});
```

### Priority Order (Highest to Lowest):
1. **Assessment-Level Settings** (function configuration)
2. **Course Settings** (`course-config.json`)
3. **Global Defaults** (`assessment-defaults.json`)

This file-based approach provides better version control, easier deployment, and clearer configuration management than database-stored settings.