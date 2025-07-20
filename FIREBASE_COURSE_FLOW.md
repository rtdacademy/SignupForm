# Firebase Course Flow Documentation

## System Overview

This document serves as the definitive guide to the Firebase-based course system architecture, specifically covering how COM1255 and similar courses operate. It details the complete data flow from student interaction to automatic gradebook updates, serving as both a developer reference and AI context for maintaining the system.

### High-Level Architecture

```
Student Interaction (React Component)
    ↓
Cloud Function (Assessment Processing)
    ↓
Firebase Database (Grade Storage)
    ↓
Firebase Trigger (gradebook.js)
    ↓
Database Utils (Automatic Calculation)
    ↓
Real-time UI Update (Frontend Listeners)
```

### Key Firebase Database Paths

```
/students/{sanitizedEmail}/courses/{courseId}/
├── Grades/assessments/{assessmentId} → score
├── Gradebook/
│   ├── items/{itemId}/ → calculated totals
│   ├── categories/{categoryType}/ → category totals
│   ├── courseStructure → from course-config.json
│   └── totalScore → overall course percentage
└── Assessments/{assessmentId}/ → detailed attempt data

/staff_testing/{sanitizedEmail}/courses/{courseId}/
└── [Same structure as students for staff testing]

/functions/courses-config/{courseId}/course-config.json
└── Single source of truth for all course configuration
```

## Course Configuration System

### course-config.json: The Single Source of Truth

Located at `/functions/courses-config/{courseId}/course-config.json`, this file controls every aspect of course behavior:

#### Essential Configuration Sections

**1. Course Weights (drives all calculations)**
```json
"weights": {
  "lesson": 0.7,    // 70% of final grade
  "assignment": 0,  // 0% (not used in COM1255)
  "lab": 0,         // 0% (not used in COM1255)
  "exam": 0.3       // 30% of final grade
}
```

**2. Gradebook Item Structure (question definitions)**
```json
"gradebook": {
  "itemStructure": {
    "lesson_welcome_rtd_academy": {
      "title": "Lesson 1 - Welcome to RTD Academy",
      "type": "lesson",
      "contentPath": "01-welcome-rtd-academy",
      "questions": [
        {
          "questionId": "course4_01_welcome_rtd_academy_knowledge_check",
          "title": "RTD Academy Knowledge Check - Question 1",
          "points": 1
        }
      ]
    }
  }
}
```

**3. Course Structure (navigation and display)**
```json
"courseStructure": {
  "title": "COM1255",
  "units": [
    {
      "unitId": "main_unit",
      "items": [
        {
          "itemId": "lesson_welcome_rtd_academy",
          "type": "lesson",
          "title": "Lesson 1 - Welcome to RTD Academy",
          "contentPath": "01-welcome-rtd-academy",
          "order": 1,
          "required": true
        }
      ]
    }
  ]
}
```

### How Configuration Drives the System

1. **Frontend Navigation**: `FirebaseCourseWrapperImproved.js` reads `courseStructure` to build navigation
2. **Assessment Grading**: `database-utils.js` uses `gradebook.itemStructure` for point values
3. **Category Totals**: Gradebook calculations use `weights` for final score computation
4. **Progress Tracking**: `progressionRequirements` controls sequential access

## Frontend Components Flow

### FirebaseCourseWrapperImproved.js: Main Course Container

**Key Function: getCourseData() (lines 288-335)**
```javascript
const getCourseData = () => {
  // First priority: check gradebook courseStructure (database-driven from backend config)
  if (course.Gradebook?.courseStructure) {
    console.log("✅ Using course structure from gradebook (database-driven from backend config)");
    return {
      title: course.Gradebook.courseStructure.title || course.Course?.Value || '',
      structure: course.Gradebook.courseStructure.units || [],
      courseWeights: course.weights || { lesson: 0.15, assignment: 0.35, exam: 0.35, project: 0.15 }
    };
  }
```

**Real-time Listeners**: Component automatically updates when Firebase data changes, ensuring UI stays synchronized with backend calculations.

### Lesson Components: Assessment Integration

**Example: /src/FirebaseCourses/courses/4/content/01-welcome-rtd-academy/index.js**

```javascript
<StandardMultipleChoiceQuestion
  courseId={courseId}
  cloudFunctionName="course4_01_welcome_rtd_academy_knowledge_check"
  title="RTD Academy Knowledge Check - Question 1"
  theme="indigo"
  onAttempt={(isCorrect) => {
    handleQuestionComplete(1);
    setQuestionResults(prev => ({...prev, question1: isCorrect ? 'correct' : 'incorrect'}));
  }}
/>
```

**Critical Integration Points**:
- `cloudFunctionName` must match questionId in course-config.json
- Assessment completion triggers automatic gradebook updates
- Real-time progress tracking through Firebase listeners

## Backend Assessment Processing

### Cloud Functions: Question Implementation

**Location**: `/functions/courses/4/01-welcome-rtd-academy/assessments.js`

```javascript
const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

const knowledgeCheck = createStandardMultipleChoice({
  questionId: 'course4_01_welcome_rtd_academy_knowledge_check',
  // Question details defined here
});

module.exports = { knowledgeCheck };
```

**Key Requirements**:
- `questionId` must exactly match entry in course-config.json `gradebook.itemStructure`
- Uses shared assessment utilities for consistent behavior
- Automatically integrates with gradebook system

### Automatic Gradebook Updates

**Firebase Triggers (/functions/gradebook.js)**

```javascript
exports.updateStudentGradebook = onValueCreated({
  ref: '/students/{studentKey}/courses/{courseId}/Grades/assessments/{assessmentId}',
}, async (event) => {
  // Triggered whenever a new grade is added
  await updateGradebookItem(studentKey, courseId, assessmentId, score, itemConfig, isStaff);
});
```

**Process Flow**:
1. Student completes assessment → Cloud function stores grade
2. Firebase trigger detects new grade → Calls updateGradebookItem
3. updateGradebookItem finds question in course-config.json → Calculates totals
4. Frontend listeners detect changes → UI updates automatically

## Gradebook System Architecture

### Database Structure

**Student Path**: `/students/{sanitizedEmail}/courses/{courseId}/`
**Staff Path**: `/staff_testing/{sanitizedEmail}/courses/{courseId}/`

```
Grades/
└── assessments/
    ├── course4_01_welcome_rtd_academy_knowledge_check: 1
    ├── course4_01_welcome_rtd_academy_question2: 1
    └── course4_01_welcome_rtd_academy_question3: 0

Gradebook/
├── items/
│   └── lesson_welcome_rtd_academy/
│       ├── earnedPoints: 2
│       ├── possiblePoints: 3
│       └── percentage: 66.67
├── categories/
│   ├── lesson/
│   │   ├── earnedPoints: 2
│   │   ├── possiblePoints: 3
│   │   └── percentage: 66.67
│   └── exam/
│       ├── earnedPoints: 0
│       ├── possiblePoints: 0
│       └── percentage: 0
├── totalScore: 46.67  // (66.67 * 0.7) + (0 * 0.3)
└── courseStructure: {courseStructure from course-config.json}
```

### Auto-calculation Process

**Core Function: findQuestionInCourseConfig() (database-utils.js lines 1062-1109)**

```javascript
const findQuestionInCourseConfig = async (courseId, questionId) => {
  const courseConfig = await getCourseConfig(courseId);
  // Searches through gradebook.itemStructure to find question
  // Returns: { questionPoints, itemId, itemType, questionTitle }
};
```

**updateGradebookItem() Process**:
1. Lookup question in course-config.json gradebook structure
2. Update individual item totals (earnedPoints/possiblePoints)
3. Recalculate category totals using course weights
4. Update overall course percentage
5. All calculations happen automatically on every grade change

## Real-time Data Flow (Complete Process)

### Step-by-Step Execution

1. **Student Interaction**
   - Student clicks answer in React component
   - Component calls StandardMultipleChoiceQuestion

2. **Cloud Function Processing**
   - Assessment cloud function receives answer
   - Validates response and calculates score
   - Writes to `/students/{key}/courses/{id}/Grades/assessments/{questionId}`

3. **Firebase Trigger Activation**
   - `updateStudentGradebook` trigger fires automatically
   - Detects new grade entry in database

4. **Automatic Calculations**
   - `updateGradebookItem` calls `findQuestionInCourseConfig`
   - Retrieves point value and item details from course-config.json
   - Recalculates item, category, and course totals
   - Updates gradebook structure in database

5. **Real-time UI Update**
   - Frontend Firebase listeners detect gradebook changes
   - Components re-render with updated scores
   - No page refresh required

### Critical Dependencies

- **course-config.json**: Must contain accurate gradebook.itemStructure
- **Question IDs**: Must be consistent across frontend, cloud functions, and config
- **Database Permissions**: Students can write to Grades, read from Gradebook
- **Firebase Triggers**: Must be deployed and active for automatic calculations

## Setup Instructions for New Courses

### 1. Create Course Configuration

**File**: `/functions/courses-config/{courseId}/course-config.json`

```json
{
  "courseId": "X",
  "title": "Course Name",
  "weights": {
    "lesson": 0.6,
    "assignment": 0.2,
    "exam": 0.2
  },
  "gradebook": {
    "itemStructure": {
      "lesson_item_id": {
        "title": "Lesson Title",
        "type": "lesson",
        "contentPath": "01-lesson-folder",
        "questions": [
          {
            "questionId": "courseX_01_question_id",
            "title": "Question Title",
            "points": 1
          }
        ]
      }
    }
  },
  "courseStructure": {
    "title": "Course Name",
    "units": [
      {
        "unitId": "main_unit",
        "items": [
          {
            "itemId": "lesson_item_id",
            "type": "lesson",
            "title": "Lesson Title",
            "contentPath": "01-lesson-folder",
            "order": 1
          }
        ]
      }
    ]
  }
}
```

### 2. Implement Lesson Components

**File**: `/src/FirebaseCourses/courses/{courseId}/content/01-lesson-folder/index.js`

```javascript
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';

const LessonComponent = ({ courseId }) => {
  return (
    <StandardMultipleChoiceQuestion
      courseId={courseId}
      cloudFunctionName="courseX_01_question_id"
      title="Question Title"
      onAttempt={(isCorrect) => {
        // Handle completion logic
      }}
    />
  );
};
```

### 3. Create Assessment Cloud Functions

**File**: `/functions/courses/{courseId}/01-lesson-folder/assessments.js`

```javascript
const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

const question1 = createStandardMultipleChoice({
  questionId: 'courseX_01_question_id',
  question: 'Question text?',
  options: ['A', 'B', 'C', 'D'],
  correctAnswer: 'A',
  explanation: 'Explanation text',
  metadata: {
    difficulty: 'intermediate',
    estimatedTime: 2,
    bloomsLevel: 'understanding'
  }
});

module.exports = { question1 };
```

### 4. Testing the Complete Flow

1. **Verify Configuration**: Ensure questionId consistency across all files
2. **Test Assessment**: Complete question and verify grade storage
3. **Check Gradebook**: Confirm automatic calculation and totals
4. **Validate Frontend**: Ensure real-time updates work correctly

## AI Maintenance Instructions

### When to Update This Document

**Required Updates**:
- Any changes to course-config.json structure
- Modifications to gradebook calculation logic
- New assessment types or question formats
- Changes to Firebase database structure
- Updates to frontend component patterns

### Key Files to Monitor

1. **`/functions/courses-config/{courseId}/course-config.json`**
   - Changes affect entire system behavior
   - Update gradebook structure documentation if modified

2. **`/functions/shared/utilities/database-utils.js`**
   - Core calculation logic
   - Update auto-calculation process section if changed

3. **`/functions/gradebook.js`**
   - Firebase triggers for automatic updates
   - Update trigger documentation if modified

4. **`/src/FirebaseCourses/FirebaseCourseWrapperImproved.js`**
   - Frontend course data retrieval
   - Update frontend flow section if getCourseData() changes

### Validation Steps After Modifications

1. **Test End-to-End Flow**:
   - Complete assessment → verify grade storage → check gradebook update
   
2. **Verify Configuration Consistency**:
   - Question IDs match across frontend, cloud functions, and config
   - Course weights sum to 1.0 where applicable
   
3. **Test Real-time Updates**:
   - Ensure frontend updates without refresh
   - Verify gradebook calculations are immediate

4. **Document Changes**:
   - Update relevant sections of this document
   - Add new patterns or processes discovered
   - Note any breaking changes or migration requirements

### Emergency Debugging

**Common Issues**:
- **Gradebook not updating**: Check Firebase trigger deployment
- **Incorrect point values**: Verify course-config.json gradebook structure
- **Missing questions**: Ensure questionId consistency
- **Permission errors**: Check Firebase database rules for student write access

**Debug Tools**:
- Firebase Console for database inspection
- Cloud Functions logs for trigger execution
- Browser console for frontend Firebase listeners
- `recalculateMyGradebook` callable function for manual recalculation

---

**Document Version**: 1.0  
**Last Updated**: 2025-06-20  
**Covers**: COM1255 (Course ID: 4) implementation patterns  
**Maintainer**: AI Assistant with developer oversight