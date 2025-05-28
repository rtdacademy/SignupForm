# Firebase Course Development Guide

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Course Creation Workflow](#course-creation-workflow)
4. [Course Structure and Navigation](#course-structure-and-navigation)
5. [Assessment System](#assessment-system)
6. [Security Model](#security-model)
7. [Development Guide](#development-guide)
8. [Testing and Deployment](#testing-and-deployment)
9. [Troubleshooting](#troubleshooting)

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

## Development Guide

### Step 1: Plan Your Course

1. **Define Structure**: List units, lessons, assignments
2. **Create Learning Objectives**: Clear goals for each lesson
3. **Design Assessments**: Types and difficulty levels
4. **Set Grading Weights**: How much each component counts

### Step 2: Create the Course

```bash
npm run create-course -- --id=YourCourseId --title="Your Course Title" --grade=12
```

### Step 3: Customize Structure

Edit `course-structure.json`:

```json
{
  "units": [
    {
      "unitId": "unit_fundamentals",
      "name": "Course Fundamentals",
      "items": [
        {
          "itemId": "lesson_introduction",
          "type": "lesson",
          "title": "Welcome to the Course",
          "contentPath": "01-introduction"
        }
      ]
    }
  ]
}
```

### Step 4: Create Content Components

For each lesson in `content/01-introduction/index.js`:

```jsx
import React from 'react';
import { Card, CardContent } from '../../../components/ui/card';

const Introduction = ({ courseId, itemConfig }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardContent className="prose max-w-none">
          <h1>{itemConfig.title}</h1>
          <p>Welcome to {courseId}!</p>
          {/* Your content here */}
        </CardContent>
      </Card>
    </div>
  );
};

export default Introduction;
```

### Step 5: Add Assessments

1. Create assessment function in `functions/courses/{id}/02-lesson/assessments.js`
2. Add fallback questions in `fallback-questions.js`
3. Embed in lesson content
4. Register in `functions/index.js`

### Step 6: Update Course Configuration

Backend config in `functions/courses-config/{id}/course-config.json`:

```json
{
  "weights": {
    "lesson": 0.3,
    "assignment": 0.4,
    "exam": 0.3
  },
  "settings": {
    "maxAttempts": 3,
    "allowLateSubmissions": true
  }
}
```

### Step 7: Test Locally

```bash
# Start emulators
firebase emulators:start

# Run React app
npm start
```

### Step 8: Deploy

```bash
# Deploy functions
firebase deploy --only functions:course3_*

# Deploy hosting
npm run build
firebase deploy --only hosting
```

## Testing and Deployment

### Local Testing Checklist

- [ ] Course loads without errors
- [ ] Navigation shows all units/lessons
- [ ] Content displays correctly
- [ ] Assessments generate questions
- [ ] Answers evaluate properly
- [ ] Grades update in database
- [ ] Progress tracking works

### Production Deployment

1. **Test in Emulators**: Verify all functions work locally
2. **Deploy Functions First**: `firebase deploy --only functions`
3. **Test Functions**: Use Firebase console to test
4. **Deploy Frontend**: `npm run build && firebase deploy --only hosting`
5. **Verify Production**: Test complete workflow as student

### Monitoring

- Check Firebase Functions logs for errors
- Monitor Firestore usage for performance
- Review student feedback for issues
- Track assessment completion rates

## Troubleshooting

### Common Issues

#### Course Not Loading
- Verify CourseRouter has case for your courseId
- Check import statement in CourseRouter
- Ensure course files exist in correct location

#### Navigation Not Showing
- Check course-structure.json syntax
- Verify contentPath matches folder names
- Ensure all itemIds are unique

#### Assessments Not Working
- Verify cloud function is deployed
- Check function naming convention
- Ensure assessmentId matches in all places
- Review Firebase Functions logs

#### Grades Not Updating
- Check database rules allow writes
- Verify student authentication
- Ensure pointsValue is set
- Check Grades path in database

### Debug Commands

```bash
# View function logs
firebase functions:log

# Test specific function
firebase functions:shell

# Check deployment status
firebase deploy:list

# Run with verbose logging
npm start -- --verbose
```

### Getting Help

1. Check example courses (COM1255, Course 2)
2. Review template files
3. Search Firebase Functions logs
4. Test in emulators first
5. Ask for code review before production

## Best Practices

### Course Design
- Keep lessons focused (15-20 min each)
- Mix content types (video, text, interactive)
- Provide immediate feedback on assessments
- Use clear, descriptive naming

### Code Quality
- Follow existing patterns
- Comment complex logic
- Handle errors gracefully
- Test edge cases

### Performance
- Lazy load course components
- Optimize images and videos
- Batch database operations
- Cache frequently accessed data

### Security
- Never trust client input
- Validate all parameters
- Use server timestamps
- Log security events

---

**Remember**: The course structure lives in JSON files, not the database. This gives you version control, easier testing, and faster development.