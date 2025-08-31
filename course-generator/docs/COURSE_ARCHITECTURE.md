# Firebase Course System Architecture

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Components](#architecture-components)
3. [Data Flow](#data-flow)
4. [File Structure](#file-structure)
5. [Naming Conventions](#naming-conventions)
6. [Course Configuration](#course-configuration)
7. [Assessment System](#assessment-system)
8. [Real-time Synchronization](#real-time-synchronization)
9. [Adding New Courses](#adding-new-courses)

## System Overview

The Firebase Course System is a comprehensive educational platform that combines React frontend components with Firebase backend services to deliver interactive, assessment-driven courses. The system features:

- **Modular Course Architecture**: Each course is self-contained with its own components and configurations
- **Real-time Progress Tracking**: Firebase Realtime Database syncs student progress instantly
- **Universal Assessment System**: Single backend function handles all course assessments
- **Convention-Based Structure**: Consistent patterns across all courses for maintainability

## Architecture Components

### 1. Frontend Layer (React)

#### Main Wrapper Component
**File**: `src/FirebaseCourses/FirebaseCourseWrapperImproved.js`

The master component that provides:
- Course navigation and menu system
- Real-time gradebook integration
- AI assistant integration
- Progress tracking and lesson unlocking
- Responsive layout management

#### Course Components
**Location**: `src/FirebaseCourses/courses/{courseId}/`

Each course has three essential files:

1. **index.js** - The main course component that:
   - Loads course structure from database
   - Manages active lesson state
   - Routes to appropriate content components
   - Handles lesson access control

2. **content/index.js** - Content registry that:
   - Maps lesson IDs to React components
   - Uses ES6 imports for code splitting
   - Provides centralized content management

3. **content/{lessonId}/index.js** - Individual lesson components that:
   - Render lesson content with rich media
   - Integrate assessment components
   - Handle navigation between sections
   - Manage lesson-specific state

### 2. Backend Layer (Firebase Functions)

#### Universal Assessment Function
**File**: `functions/assessments/universal-assessments.js`

Central assessment handler that:
- Routes requests to appropriate course configurations
- Dynamically loads assessment mappings
- Supports multiple assessment types (multiple-choice, long-answer)
- Returns graded results to frontend

#### Course Assessment Structure
**Location**: `functions/courses/{courseId}/`

Each course backend includes:

1. **assessment-mapping.js** - Maps question IDs to file paths:
```javascript
module.exports = {
  'course4_01_question1': '01-lesson-name/assessments',
  'course4_01_question2': '01-lesson-name/assessments',
  // ... more mappings
};
```

2. **{lessonId}/assessments.js** - Contains:
   - Question pools with multiple questions per assessment
   - Rubrics for long-answer questions
   - Assessment configurations (attempts, points, themes)
   - Feedback and explanations

### 3. Database Layer (Firebase Realtime Database)

#### Course Configuration
**Path**: `/courses/{courseId}/course-config/`

Stores complete course structure including:
- Course metadata (title, credits, status)
- Unit and lesson hierarchy
- Question mappings and point values
- Theme configurations
- Progression requirements
- Attempt limits by activity type

#### Student Data
**Path**: `/students/{sanitizedEmail}/courses/{courseId}/`

Tracks individual student progress:
- Assessment attempts and scores
- Question-level responses
- Submission timestamps
- Progress indicators
- Completion status

## Data Flow

### 1. Course Initialization
```
User Login → Load Course Config from DB → Render Course Wrapper → Display First Lesson
```

### 2. Assessment Submission
```
Student Answers → Frontend Component → Universal Assessment Function → 
Load Course Mapping → Get Assessment Config → Process Answer → 
Update Database → Real-time Sync to Frontend → Update Gradebook
```

### 3. Progress Tracking
```
Complete Assessment → Update Student Node → Calculate Scores → 
Check Progression Requirements → Unlock Next Lesson → Update Navigation
```

## File Structure

```
project-root/
├── src/
│   └── FirebaseCourses/
│       ├── FirebaseCourseWrapperImproved.js
│       ├── components/
│       │   └── assessments/
│       │       ├── StandardMultipleChoiceQuestion/
│       │       ├── SlideshowKnowledgeCheck/
│       │       └── StandardLongAnswer/
│       ├── courses/
│       │   └── {courseId}/                    # e.g., "4"
│       │       ├── index.js                   # Main course component
│       │       └── content/
│       │           ├── index.js               # Content registry
│       │           └── {lessonFolder}/        # e.g., "01-welcome-rtd-academy"
│       │               └── index.js           # Lesson component
│       └── utils/
│           ├── lessonAccess.js
│           ├── courseProgressUtils.js
│           └── gradeCalculations.js
└── functions/
    ├── assessments/
    │   └── universal-assessments.js           # Universal handler
    └── courses/
        └── {courseId}/                         # e.g., "4"
            ├── assessment-mapping.js          # Question ID to file mapping
            └── {lessonFolder}/                # e.g., "01-welcome-rtd-academy"
                └── assessments.js             # Question configurations

```

## Naming Conventions

### Item IDs
Format: `{number}_{subject}_{grade}_{description}`
- Example: `01_physics_30_welcome_rtd_academy`
- Used as database keys and file paths

### Question IDs
Format: `course{courseId}_{lessonNumber}_{description}_{type}`
- Example: `course4_01_welcome_rtd_academy_knowledge_check`
- Must be unique across the course

### Database Email Keys
- Replace dots with commas: `kyle.brown@example.com` → `kyle,brown@example,com`
- Prefix with `000` for alphabetical sorting

### Folder Names
- Use hyphens for lesson folders: `01-welcome-rtd-academy`
- Use underscores for item IDs: `01_physics_30_welcome_rtd_academy`

## Course Configuration

### Essential Configuration Fields

```javascript
{
  "courseId": "4",
  "title": "Course Title",
  "credits": 1,
  "courseStructure": {
    "units": [{
      "unitId": "unit_1_course_complete",
      "name": "Unit Name",
      "order": 1,
      "items": [{
        "itemId": "01_physics_30_welcome_rtd_academy",
        "title": "Lesson Title",
        "type": "lesson",        // lesson, assignment, lab, exam
        "order": 1,
        "estimatedTime": 30,
        "questions": [{
          "questionId": "course4_01_welcome_rtd_academy_knowledge_check",
          "title": "Question Title",
          "points": 1
        }]
      }]
    }]
  },
  "attemptLimits": {
    "lesson": 999,
    "assignment": 3,
    "lab": 3,
    "exam": 1
  },
  "weights": {
    "lesson": 1,
    "assignment": 0,
    "lab": 0,
    "exam": 0
  },
  "themes": {
    "lesson": {
      "primaryColor": "purple",
      "secondaryColor": "indigo",
      "accent": "#8b5cf6",
      "background": "#f5f3ff",
      "border": "#ddd6fe"
    }
  },
  "progressionRequirements": {
    "enabled": true,
    "defaultCriteria": {
      "minimumPercentage": 0,
      "requireAllQuestions": true
    }
  },
  "metadata": {
    "version": "1.0.0",
    "status": "development",  // development, active, archived
    "createdDate": "2025-01-01T00:00:00.000Z",
    "lastModified": "2025-01-01T00:00:00.000Z"
  }
}
```

## Assessment System

### Multiple Choice Assessments

Configuration in `assessments.js`:
```javascript
const questionPool1 = [
  {
    questionText: "Question text here",
    options: [
      { 
        id: 'a', 
        text: 'Option A text', 
        feedback: 'Feedback for option A' 
      },
      // ... more options
    ],
    correctOptionId: 'b',
    explanation: 'Detailed explanation',
    difficulty: 'beginner',  // beginner, intermediate, advanced
    tags: ['topic1', 'topic2']
  }
];

const assessmentConfigs = {
  'course4_01_welcome_rtd_academy_knowledge_check': {
    type: 'multiple-choice',
    questions: questionPool1,
    randomizeQuestions: true,
    randomizeOptions: true,
    maxAttempts: 1,
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    theme: 'purple'
  }
};
```

### Long Answer Assessments

Include rubrics for AI grading:
```javascript
const RTD_ACADEMY_RUBRICS = {
  beginner: [
    {
      criterion: "Understanding",
      points: 2,
      description: "Demonstrates understanding of concepts",
      levels: {
        0: "No understanding shown",
        1: "Basic understanding",
        2: "Clear understanding"
      }
    }
  ]
};
```

## Real-time Synchronization

### How It Works
1. **Database Listeners**: Components subscribe to database paths
2. **Automatic Updates**: Changes trigger re-renders immediately
3. **Optimistic Updates**: UI updates before server confirmation
4. **Conflict Resolution**: Last-write-wins with timestamps

### Key Integration Points
- Gradebook updates when assessments complete
- Navigation unlocks when requirements met
- Progress bars update in real-time
- Multiple devices stay synchronized

## Adding New Courses

### Database-First Development Process

The recommended workflow follows a database-first approach:

### Step 1: Create Configuration in Firebase Database
1. Navigate to Firebase Console or use CLI
2. Create course structure at `/courses/{courseId}/course-config/`
3. Build the complete course configuration following the schema
4. Test the configuration in your live application

### Step 2: Download Configuration for Code Generation
```bash
# Export the database configuration to local file
firebase database:get /courses/{courseId}/course-config > course-generator/configs/course-{courseId}-config.json
```

### Step 3: Generate Course Structure
Use the course generator script to create all necessary files:
```bash
# Generate frontend and backend structure
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-{courseId}-config.json
```

This automatically creates:
- Frontend: `src/FirebaseCourses/courses/{courseId}/`
- Backend: `functions/courses/{courseId}/`
- All boilerplate code and structure

### Step 4: Import in Main Wrapper
Add to `FirebaseCourseWrapperImproved.js`:
```javascript
const Course5 = React.lazy(() => import('./courses/5'));
```

### Step 5: Customize and Deploy
1. Add lesson content to generated components
2. Create assessment questions in backend files
3. Deploy code changes (configuration already in database)
4. Test complete course functionality

### Best Practices

1. **Consistent Naming**: Follow established conventions exactly
2. **Modular Components**: Keep lessons self-contained
3. **Error Handling**: Add try-catch blocks in async functions
4. **Performance**: Use React.lazy for code splitting
5. **Documentation**: Comment complex logic and configurations
6. **Testing**: Test each assessment configuration thoroughly
7. **Validation**: Validate course config before deployment

## Troubleshooting

### Common Issues

1. **Content Not Found**: Check content registry mapping
2. **Assessment Not Loading**: Verify assessment-mapping.js paths
3. **Database Sync Issues**: Check Firebase rules and authentication
4. **Navigation Locked**: Review progression requirements
5. **Grades Not Updating**: Verify assessment result structure

### Debug Tools

- Firebase Console for database inspection
- Browser DevTools for React component state
- Firebase Functions logs for backend errors
- Network tab for API call monitoring

## Future Enhancements

Consider implementing:
- Offline support with service workers
- Advanced analytics and reporting
- Collaborative features
- Mobile app versions
- AI-powered content generation
- Automated testing suites