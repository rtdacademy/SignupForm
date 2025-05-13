# Assessment Workflow Documentation

## Overview

This document outlines the secure assessment system for delivering and evaluating student questions in our e-learning platform. The system is designed with the following key principles:

1. **Security-First Design**: Question logic, parameters, and answers are stored server-side
2. **Separation of Concerns**: Content delivery (client) vs. assessment logic (server)
3. **Stateful Tracking**: Student progress and assessment results are tracked in the database
4. **Seed-Based Generation**: Questions use deterministic random seeds for reproducibility
5. **Cloud Function Architecture**: Assessment logic is centralized by lesson/content
6. **Configurable Settings**: Assessment parameters are managed through database settings

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

Each lesson has a single cloud function file that contains handlers for all assessment types in that lesson:

```
/functions/courses/{courseId}/{contentType}/{contentName}.js
```

For example:
```
/functions/courses/COM1255/lessons/IntroToELearning.js
```

### Cloud Function Design

Each cloud function file exports multiple handlers that implement:

1. **Settings Retrieval**: Gets assessment settings from the database with fallbacks and overrides
2. **Question Generation**: Creates question parameters from a seed and settings
3. **Answer Evaluation**: Compares student answer to correct solution
4. **Progress & Grade Tracking**: Updates student records with scores based on settings

Example cloud function structure:

```javascript
// Shared utility for fetching assessment settings with priority order:
// 1. Hardcoded settings (highest priority)
// 2. Database content type settings (lessons, exams)
// 3. Database question type settings 
// 4. Database default settings
// 5. Fallback default settings (lowest priority)
async function getAssessmentSettings(courseId, questionType, contentType) {
  // ... implementation
}

// Multiple choice question handler
exports.handleMultipleChoiceQuestion = functions.https.onCall(async (data, context) => {
  // ... implementation for generating and evaluating multiple choice questions
});

// Dynamic question handler
exports.handleDynamicQuestion = functions.https.onCall(async (data, context) => {
  // ... implementation for generating and evaluating dynamic math questions
});
```

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

## Creating New Assessments

To implement a new assessment question:

1. **Update Course Structure in Database**:
   - Add the assessment configuration to the course structure in the database at `/courses/{courseId}/courseDetails/courseStructure/structure/`
   - Include assessment ID, type, cloud function name, and other configuration parameters

2. **Configure Settings**:
   - Ensure appropriate defaults exist in the database under `/courses/{courseId}/assessmentSettings/`
   - Customize settings per question type or content type as needed

3. **Create/Update Cloud Function**:
   - Create a new function file or add to an existing file in the appropriate directory
   - Implement question generation logic with settings consideration
   - Implement answer evaluation logic with appropriate scoring

4. **Update Client**:
   - Create the question component in the appropriate lesson content file
   - Register the component in the content registry at `src/FirebaseCourses/courses/COM1255/content/index.js`
   - Configure with appropriate courseId, assessmentId, and cloudFunctionName

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

## Overriding Assessment Settings

Settings can be adjusted at three levels (in order of increasing priority):

1. **Global Default Settings**: Base settings for all assessments
2. **Content Type Settings**: Settings specific to lessons, assignments, or exams
3. **Question Type Settings**: Settings specific to question types (multiple choice, dynamic)
4. **Hardcoded Settings**: Direct values in the cloud function (highest priority)

To override settings for a specific question, modify the hardcoded settings in the cloud function:

```javascript
// Hardcoded settings specific to this cloud function - highest priority
const hardcodedSettings = {
  multipleChoice: {
    maxAttempts: 3,
    pointsValue: 2
  },
  dynamic: {
    showRegenerate: true
  }
};
```

This layered approach allows for flexible configuration while maintaining the ability to enforce specific requirements when needed.