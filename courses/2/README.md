# 2 Course

## Overview

This course uses a convention-based structure for easy development and maintenance. Content is organized in numbered folders, and cloud functions follow a predictable naming pattern.

## Directory Structure

```
2/
├── course-config.json        # Course settings and metadata
├── course-structure.json     # Defines units, lessons, and navigation
├── index.js                  # Main course component
├── content/                  # Frontend components (numbered for ordering)
│   ├── index.js             # Content registry
│   ├── 01-getting-started/  # Each folder contains:
│   │   ├── index.js        # React component
│   │   ├── README.md       # Documentation
│   │   └── assets/         # Images, videos, etc.
│   ├── 02-core-concepts/
│   ├── 03-advanced-topic-1/
│   ├── 04-reflection-assignment/
│   └── 05-midterm-exam/

functions/courses/2/  # Cloud functions (in main functions directory)
├── shared/                    # Shared functions used by multiple lessons
│   └── aiQuestions.js        # 2_shared_aiQuestion
├── 01-getting-started/       # Empty - uses shared functions only
├── 02-core-concepts/
│   └── assessments.js        # 2_02_core_concepts_multipleChoice
│                             # 2_02_core_concepts_aiQuestion
├── 03-advanced-topic-1/      # Empty - no functions needed
├── 04-reflection-assignment/
│   └── submission.js         # 2_04_reflection_assignment_submit
└── 05-midterm-exam/
    └── exam.js              # 2_05_midterm_exam_handler
```

## Naming Conventions

### Content Folders
- Use numbered prefixes for ordering: `01-`, `02-`, etc.
- Use descriptive names with hyphens: `getting-started`, `core-concepts`
- Keep names concise but clear

### Cloud Functions
Functions follow this pattern: `COURSEID_FOLDERNAME_FUNCTIONTYPE`

**Note:** If your course ID starts with a number, use `courseID_` prefix (e.g., `course2_shared_aiQuestion`).

Examples:
- `2_shared_aiQuestion` - Shared AI question generator
- `2_02_core_concepts_multipleChoice` - Standard MC questions
- `2_02_core_concepts_aiQuestion` - AI questions for lesson 2
- `2_04_reflection_assignment_submit` - Assignment submission

Note: Hyphens in folder names become underscores in function names.

## Quick Start

### 1. Update Course Information

Edit `course-config.json`:
```json
{
  "courseId": "YOUR_COURSE_ID",
  "title": "Your Course Title",
  "description": "What students will learn..."
}
```

### 2. Define Course Structure

Edit `course-structure.json`:
- Add/remove units
- Define lessons, assignments, and exams
- Set the `contentPath` to match your folder names
- Mark `hasCloudFunctions: true` for content that needs backend functions

### 3. Create Content Components

For each content item:
1. Create a folder: `content/XX-descriptive-name/`
2. Add `index.js` with your React component
3. Add `README.md` with documentation
4. Add any assets to `assets/` subfolder

### 4. Create Cloud Functions (if needed)

If `hasCloudFunctions: true` in structure:
1. Create matching folder in `functions/courses/COURSEID/XX-descriptive-name/`
2. Add your function files
3. Export with correct naming convention

### 5. Register Functions

In your main `functions/index.js`, add:
```javascript
// Shared functions
exports.COURSEID_shared_aiQuestion = require('./courses/COURSEID/shared/aiQuestions').COURSEID_shared_aiQuestion;

// Lesson-specific functions
exports.COURSEID_02_core_concepts_multipleChoice = require('./courses/COURSEID/02-core-concepts/assessments').COURSEID_02_core_concepts_multipleChoice;
exports.COURSEID_02_core_concepts_aiQuestion = require('./courses/COURSEID/02-core-concepts/assessments').COURSEID_02_core_concepts_aiQuestion;
// ... add more as needed
```

**Important:** If your courseId starts with a number (e.g., "2"), replace `COURSEID` with `courseID` (e.g., `course2`):
```javascript
// Example for courseId "2":
exports.course2_shared_aiQuestion = require('./courses/2/shared/aiQuestions').course2_shared_aiQuestion;
exports.course2_02_core_concepts_aiQuestion = require('./courses/2/02-core-concepts/assessments').course2_02_core_concepts_aiQuestion;
```

## Development Workflow

1. **Plan your content**: Outline units and lessons
2. **Create folders**: Number them for proper ordering
3. **Build components**: Start with provided templates
4. **Add functions**: Only where assessments/interactions are needed
5. **Test locally**: Run with Firebase emulators
6. **Deploy**: Functions first, then hosting

## Adding New Content

### Example: Adding a new lesson "06-practical-examples"

1. Create folder structure:
   ```
   content/06-practical-examples/
   ├── index.js
   ├── README.md
   └── assets/
   ```

2. Update `course-structure.json`:
   ```json
   {
     "itemId": "lesson_practical_examples",
     "type": "lesson",
     "title": "Practical Examples",
     "contentPath": "06-practical-examples",
     "hasCloudFunctions": false
   }
   ```

3. Update `content/index.js`:
   ```javascript
   '06-practical-examples': lazy(() => import('./06-practical-examples')),
   ```

4. If cloud functions are needed:
   - Set `hasCloudFunctions: true`
   - Create `functions/courses/COURSEID/06-practical-examples/`
   - Follow naming convention for exports

## Database Integration Requirements

**CRITICAL**: All assessment functions MUST follow these database conventions to properly integrate with student records.

### Required Database Paths

Your cloud functions MUST interact with these specific database locations:

#### Student Progress (Student-Accessible):
```
students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}
```
Stores: question data, attempts, status, submissions, timestamps

#### Student Grades:
```
students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}
```
Stores: final numeric score (e.g., 2 for 2 points)

#### Course Configuration:
```
courses/{courseId}/assessments/{assessmentId}
```
Stores: maxAttempts, pointsValue, settings from course-config.json

#### Secure Data (Server-Only):
```
courses_secure/{courseId}/assessments/{assessmentId}
```
Stores: correctOptionId, explanation, optionFeedback (NEVER client-accessible)

### Required Assessment Properties

Every assessment record MUST include:

```javascript
{
  timestamp: getServerTimestamp(),
  attempts: number,           // Current attempt count
  maxAttempts: number,        // From course settings or defaults
  pointsValue: number,        // From course-config.json weights
  status: string,            // 'active', 'attempted', 'completed', 'failed'
  correctOverall: boolean,   // Has ever been answered correctly
  settings: {
    showFeedback: boolean    // From assessment-defaults.json
  }
}
```

### Student Key Generation

ALWAYS use the sanitizeEmail utility:
```javascript
const { sanitizeEmail } = require('../../../utils.js');
const studentKey = sanitizeEmail(studentEmail);
```

### Required Utility Functions

Your functions MUST include:

1. **getServerTimestamp()** - Handles production vs emulator timestamps
2. **extractParameters()** - Validates and extracts function parameters  
3. **initializeCourseIfNeeded()** - Creates student course structure if missing

### Assessment Type Standards

Based on `assessment-defaults.json`, use these configurations:

#### AI Multiple Choice:
- 4 options exactly (a, b, c, d)
- Shuffle options: true
- Store individual feedback per option
- Use structured output with Zod schemas

#### Standard Multiple Choice:
- Follow same 4-option pattern
- Predefined questions as fallback
- Same database structure

### Security Requirements

1. **Secure Data Separation**: Never expose correct answers or detailed feedback to client
2. **Attempt Validation**: Always verify attempts against both saved and course settings
3. **Authentication**: Use context.auth for user validation
4. **Server Timestamps**: Use getServerTimestamp() for consistency

### Integration with Assessment Defaults

Your functions should read from `functions/config/assessment-defaults.json` for:

#### Cloud Function Configuration:
```javascript
// Use these settings from assessment-defaults.json
const functionConfig = {
  timeout: 60,           // cloudFunctions.timeout
  memory: "512MiB",      // cloudFunctions.memory  
  region: "us-central1"  // cloudFunctions.region
};
```

#### Question Generation Settings:
```javascript
// Use prompts from assessment-defaults.json
const generationPrompts = {
  beginner: "Create a basic multiple-choice question...",     // questionTypes.multipleChoice.ai_generated.generationPrompts.beginner
  intermediate: "Create a multiple-choice question...",       // questionTypes.multipleChoice.ai_generated.generationPrompts.intermediate
  advanced: "Create a complex multiple-choice question..."    // questionTypes.multipleChoice.ai_generated.generationPrompts.advanced
};
```

#### Feedback Templates:
```javascript
// Use feedback templates from assessment-defaults.json
const feedbackTemplates = {
  correct: "Correct! {explanation}",                    // feedbackTemplates.correct.detailed
  incorrect: "Incorrect. {explanation}",               // feedbackTemplates.incorrect.detailed
  attemptsRemaining: "You have {remaining} attempts"   // attemptsMessages.remaining.multiple
};
```

#### Required Properties from Defaults:
- **numberOfOptions**: Always 4 (a, b, c, d)
- **shuffleOptions**: Always true for AI questions
- **displayFormat**: "vertical" (handled by frontend)
- **Function naming**: Follow `{courseId}_{contentType}_{contentId}_{assessmentType}` pattern

## Modular Assessment System

**NEW**: This template now includes a modular assessment system that makes creating assessments much easier and more consistent.

### Available Assessment Types

#### 1. AI Multiple Choice (`createAIMultipleChoice`)
Automatically generates multiple choice questions using AI with course-specific prompts.

```javascript
const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');

exports.COURSEID_foldername_aiQuestion = createAIMultipleChoice({
  prompts: {
    beginner: "Create a basic question about...",
    intermediate: "Create a question that tests application of...",
    advanced: "Create a complex question requiring analysis of..."
  },
  maxAttempts: 3,
  pointsValue: 5,
  fallbackQuestions: FALLBACK_QUESTIONS
});
```

#### Benefits:
- ✅ **No code duplication** - Uses shared, tested logic
- ✅ **Consistent behavior** - All AI questions work the same way
- ✅ **Easy customization** - Just provide prompts and settings
- ✅ **Automatic fallbacks** - Uses course-specific fallback questions when AI fails
- ✅ **Proper database integration** - Follows all required database conventions

### Creating Assessments Step-by-Step

#### Step 1: Add Fallback Questions
Create `fallback-questions.js` in your lesson folder:

```javascript
const FALLBACK_QUESTIONS = [
  {
    difficulty: 'beginner',
    questionText: "Your question here...",
    options: [
      { id: "a", text: "Option A", feedback: "Feedback for A" },
      { id: "b", text: "Option B", feedback: "Feedback for B" },
      { id: "c", text: "Option C", feedback: "Feedback for C" },
      { id: "d", text: "Option D", feedback: "Feedback for D" }
    ],
    correctOptionId: "c",
    explanation: "Detailed explanation of correct answer"
  }
  // Add intermediate and advanced questions...
];
```

#### Step 2: Configure Assessment in assessments.js
```javascript
// Import the assessment type
const { createAIMultipleChoice } = require('../../../../shared/assessment-types/ai-multiple-choice');
const { FALLBACK_QUESTIONS } = require('./fallback-questions');

// Create and export your assessment
exports.COURSEID_foldername_aiQuestion = createAIMultipleChoice({
  // Customize prompts for your content
  prompts: {
    beginner: "Create a question about [your topic] at beginner level...",
    intermediate: "Create a question about [your topic] at intermediate level...", 
    advanced: "Create a question about [your topic] at advanced level..."
  },
  
  // Override settings as needed
  maxAttempts: 3,           // Number of attempts allowed
  pointsValue: 5,           // Points awarded for correct answer
  showFeedback: true,       // Show feedback after each attempt
  
  // Include your fallback questions
  fallbackQuestions: FALLBACK_QUESTIONS,
  
  // Optional: Override AI settings
  aiSettings: {
    temperature: 0.8,       // AI creativity (0.0 - 2.0)
    topP: 0.9,             // AI response variety
    topK: 50               // AI token selection
  }
});
```

#### Step 3: Register in functions/index.js
```javascript
// Add to your main functions/index.js file
exports.COURSEID_foldername_aiQuestion = require('./courses/COURSEID/foldername/assessments').COURSEID_foldername_aiQuestion;
```

### Configuration Hierarchy

Settings are merged in this order (later overrides earlier):

1. **Global Defaults** (`functions/config/assessment-defaults.json`)
2. **Course Config** (`course-config.json`)  
3. **Assessment Level** (settings in `createAIMultipleChoice({...})`)

Example:
```javascript
// If global default is maxAttempts: 5
// And course config has maxAttempts: 3  
// And assessment config has maxAttempts: 2
// Final result: maxAttempts: 2 (assessment level wins)
```

### Advanced Usage

#### Custom Assessment Types
You can still create completely custom assessments when the modular types don't fit:

```javascript
const { onCall } = require('firebase-functions/v2/https');
const { extractParameters, getDatabaseRef } = require('../../../../shared/utilities/database-utils');

exports.COURSEID_foldername_customAssessment = onCall({
  region: 'us-central1',
  timeoutSeconds: 60,
  memory: '256MiB',
}, async (data, context) => {
  const params = extractParameters(data, context);
  // Your custom logic here...
});
```

#### Mixed Approach
Use both modular and custom assessments in the same lesson:

```javascript
// Modular AI question for general content
exports.COURSEID_foldername_aiQuestion = createAIMultipleChoice({...});

// Custom assessment for specific needs  
exports.COURSEID_foldername_specialCalculation = onCall({...}, async (data, context) => {
  // Custom calculation logic
});
```

### Troubleshooting Modular Assessments

#### Assessment not loading
- Verify function is exported with correct naming convention
- Check that shared modules are properly imported
- Ensure fallback questions follow the required schema

#### AI generation failing
- Check that fallback questions are properly configured
- Verify GEMINI_API_KEY is set in environment
- Check Firebase logs for detailed error messages

#### Configuration not working
- Verify assessment-defaults.json exists and is valid JSON
- Check configuration hierarchy - assessment level overrides course level
- Use `console.log()` to debug merged configuration

## Best Practices

1. **Keep it Simple**: Start without cloud functions, add them only when needed
2. **Document Everything**: Each content folder should have a README
3. **Follow Conventions**: This makes the codebase predictable
4. **Test Incrementally**: Test each lesson as you build it
5. **Reuse Components**: Use the shared AI question function when possible
6. **Database Consistency**: ALWAYS use the required database paths and properties above

## Troubleshooting

### Content not loading
- Check folder name matches `contentPath` in structure
- Verify component is exported as default
- Check content registry includes your folder

### Cloud function not found
- Verify function name follows convention exactly
- Check function is exported in main functions/index.js
- Ensure function is deployed: `firebase deploy --only functions:FUNCTIONNAME`

### Assessment not working
- Check `assessmentId` matches between frontend and function
- Verify `cloudFunctionName` uses correct convention
- Check Firebase logs: `firebase functions:log`

## Integration Steps

After creating your course, you need to integrate it into the main application:

### 1. Add to CourseRouter.js

In `src/FirebaseCourses/CourseRouter.js`:

**Add import at the top:**
```javascript
const Course2 = lazy(() => import('./courses/2'));
```

**Add to switch statement:**
```javascript
case '2':
  return (
    <Suspense fallback={<LoadingCourse />}>
      <Course2
        course={course}
        activeItemId={currentItemId}
        onItemSelect={handleItemSelect}
        isStaffView={isStaffView}
        devMode={devMode}
      />
    </Suspense>
  );
```

**For numeric courseIds (e.g., "2"), use this pattern instead:**
```javascript
const Course2 = lazy(() => import('./courses/2'));

case '2':
  return (
    <Suspense fallback={<LoadingCourse />}>
      <Course2 ... />
    </Suspense>
  );
```

### 2. Deploy Cloud Functions

Deploy your functions to Firebase:
```bash
firebase deploy --only functions:2_*
```

For numeric courseIds:
```bash
firebase deploy --only functions:course2_*
```

### 3. Test Your Course

Start the development server:
```bash
npm start
```

Navigate to your course in the application to test all functionality.

## Support

For questions or issues:
- Review example implementations in each folder's README
- Check the development guide
- Test with Firebase emulators for better debugging

---

Generated on: 2025-05-28