# Gradebook System Documentation

## Overview

The Gradebook System is a comprehensive grade tracking and display system for RTD Academy's course platform. It provides real-time grade calculations, progress tracking, and detailed assessment review capabilities for students.

## Table of Contents

1. [Architecture](#architecture)
2. [Components](#components)
3. [Data Structure](#data-structure)
4. [Grade Calculation Logic](#grade-calculation-logic)
5. [Usage](#usage)
6. [Integration](#integration)

## Architecture

### Data Flow

```
Firebase Realtime Database
└── students/
    └── [sanitized_email]/
        └── courses/
            └── [courseId]/
                ├── Gradebook/          # Calculated grade data
                │   ├── summary/        # Overall grade summary
                │   ├── categories/     # Grade breakdown by category
                │   └── items/          # Individual item grades
                └── Assessments/        # Raw assessment responses
                    └── [assessmentId]/
                        ├── attempts
                        ├── lastSubmission
                        └── status
```

### Component Hierarchy

```
GradebookProvider (Context)
├── GradebookSummary (Overview)
├── AssessmentGrid (Table View)
├── CourseItemGrid (Course Structure View)
│   └── CourseItemDetailModal
│       └── QuestionReviewModal
└── GradebookDemo (Debug Tool)
```

## Components

### 1. **GradebookSummary**

Displays the overall grade summary with visual indicators.

**Features:**
- Overall grade percentage with pass/fail indicator
- Progress bar showing progress toward passing grade
- Category breakdown cards
- Quick stats (total points, weighted score, last update)

### 2. **AssessmentGrid**

A searchable and filterable table view of all assessments.

**Features:**
- Search by title or ID
- Filter by type (lesson, assignment, exam, project, lab)
- Filter by status (completed, attempted, not started)
- Sort by date, score, title, or type
- Color-coded score visualization

### 3. **CourseItemGrid**

Displays assessments organized by course structure.

**Features:**
- Maps gradebook items to course units
- Shows progress at the course item level
- Displays question completion within each item
- Provides navigation to detailed views

### 4. **CourseItemDetailModal**

Detailed view for a specific course item.

**Features:**
- Item metadata (type, unit, lesson path)
- Overall statistics (score, questions completed)
- List of all questions within the item
- Individual question scores and attempts
- Direct links to review each question

### 5. **QuestionReviewModal**

Allows students to review their submitted answers.

**Features:**
- Original question text display
- All answer options with visual indicators
- Student's answer vs. correct answer
- Explanations when available
- Navigation between questions

## Data Structure

### Student Data Structure

```javascript
{
  "students": {
    "[sanitized_email]": {
      "courses": {
        "[courseId]": {
          // Course enrollment data
          "CourseID": 4,
          "Status": {
            "Id": 1,
            "Value": "Newly Enrolled"
          },
          "Created": "2025-06-16T21:49:39.384Z",
          
          // Assessment responses
          "Assessments": {
            "[assessmentId]": {
              "activityType": "lesson",
              "attempts": 1,
              "correctOverall": false,
              "difficulty": "intermediate",
              "maxAttempts": 1,
              "pointsValue": 1,
              "status": "failed",
              "timestamp": 1750157633831,
              "lastSubmission": {
                "answer": "a",
                "correctOptionId": "c",
                "feedback": "Incorrect. This describes...",
                "isCorrect": false,
                "submissionPath": "submissions/...",
                "timestamp": 1750157655718
              }
            }
          },
          
          // Calculated gradebook data
          "Gradebook": {
            "summary": {
              "totalPoints": 0,
              "possiblePoints": 45,
              "percentage": 0,
              "isPassing": false,
              "passingGrade": 60,
              "weightedScore": 0,
              "lastUpdated": 1750158408655,
              "status": "active"
            },
            "categories": {
              "lesson": {
                "categoryWeight": 0.15,
                "earned": 0,
                "possible": 45,
                "percentage": 0,
                "weightedScore": 0,
                "items": [...]
              }
            },
            "items": {
              "[itemId]": {
                "title": "RTD Academy Knowledge Check",
                "type": "lesson",
                "score": 0,
                "maxScore": 1,
                "attempts": 1,
                "status": "completed",
                "lastAttempt": 1750158408138,
                "courseStructureItemId": "lesson_welcome_rtd_academy",
                "unitId": "main_unit"
              }
            }
          }
        }
      }
    }
  }
}
```

### Assessment Data Fields

| Field | Type | Description |
|-------|------|-------------|
| `activityType` | string | Type of assessment (lesson, assignment, exam, project, lab) |
| `attempts` | number | Number of attempts made |
| `correctOverall` | boolean | Whether the assessment was passed |
| `difficulty` | string | Difficulty level (basic, intermediate, advanced) |
| `maxAttempts` | number | Maximum allowed attempts |
| `pointsValue` | number | Points this assessment is worth |
| `status` | string | Current status (not_started, in_progress, completed, failed) |
| `timestamp` | number | Unix timestamp of first attempt |
| `lastSubmission` | object | Details of the most recent submission |

### Gradebook Summary Fields

| Field | Type | Description |
|-------|------|-------------|
| `totalPoints` | number | Total points earned across all assessments |
| `possiblePoints` | number | Total possible points |
| `percentage` | number | Overall grade percentage |
| `isPassing` | boolean | Whether student is passing (>= passingGrade) |
| `passingGrade` | number | Minimum percentage to pass (default: 60) |
| `weightedScore` | number | Grade calculated using category weights |
| `lastUpdated` | number | Unix timestamp of last update |

## Grade Calculation Logic

### 1. Item-Level Calculation

```javascript
// For each gradebook item
itemScore = sum of earned points from all questions
itemMaxScore = sum of maximum points from all questions
itemPercentage = (itemScore / itemMaxScore) * 100
```

### 2. Category-Level Calculation

```javascript
// For each category (lesson, assignment, exam, etc.)
categoryEarned = sum of all item scores in category
categoryPossible = sum of all item max scores in category
categoryPercentage = (categoryEarned / categoryPossible) * 100
categoryWeightedScore = categoryPercentage * categoryWeight
```

### 3. Overall Grade Calculation

```javascript
// Method 1: Simple percentage
overallPercentage = (totalEarned / totalPossible) * 100

// Method 2: Weighted average
weightedScore = sum of all categoryWeightedScores

// Passing determination
isPassing = overallPercentage >= passingGrade
```

### Category Weights (Default)

| Category | Weight | Description |
|----------|--------|-------------|
| Lessons | 15% | Regular lesson assessments |
| Assignments | 35% | Homework and practice work |
| Exams | 35% | Unit tests and final exams |
| Projects | 15% | Long-form project work |
| Labs | 0% | Lab work (unweighted) |

## Usage

### Basic Implementation

```javascript
import { GradebookSummary, AssessmentGrid } from './components/gradebook';
import { GradebookProvider } from './context/GradebookContext';

function CourseView({ courseData }) {
  return (
    <GradebookProvider courseData={courseData}>
      <div>
        <GradebookSummary />
        <AssessmentGrid />
      </div>
    </GradebookProvider>
  );
}
```

### Accessing Gradebook Data

```javascript
import { useGradebook } from './context/GradebookContext';

function MyComponent() {
  const { 
    gradebookData, 
    getAssessmentById, 
    getItemById 
  } = useGradebook();
  
  // Access overall summary
  const { summary } = gradebookData;
  console.log(`Grade: ${summary.percentage}%`);
  
  // Get specific assessment
  const assessment = getAssessmentById('quiz_1');
  
  // Get gradebook item
  const item = getItemById('lesson_1');
}
```

## Integration

### 1. With Firebase

The gradebook system automatically syncs with Firebase Realtime Database:

```javascript
// Data is fetched from:
const gradebookRef = ref(database, `students/${userId}/courses/${courseId}/Gradebook`);
const assessmentsRef = ref(database, `students/${userId}/courses/${courseId}/Assessments`);
```

### 2. With Course Structure

The gradebook maps assessments to course structure:

```javascript
// Course structure defines assessments
const courseStructure = {
  units: [{
    id: "unit1",
    items: [{
      id: "lesson1",
      assessments: ["quiz1", "assignment1"]
    }]
  }]
};
```

### 3. With Assessment Components

Assessment components update the gradebook on submission:

```javascript
// After assessment submission
const updateGradebook = async (assessmentId, result) => {
  // Update assessment data
  await updateAssessment(assessmentId, result);
  
  // Trigger gradebook recalculation
  await recalculateGradebook();
};
```

## Best Practices

1. **Performance**: Use React.memo and useMemo for expensive calculations
2. **Error Handling**: Always check for null/undefined data before calculations
3. **Loading States**: Show appropriate loading indicators during data fetch
4. **Accessibility**: Ensure all interactive elements are keyboard accessible
5. **Mobile Responsive**: Test all components on mobile devices

## Troubleshooting

### Common Issues

1. **Gradebook not updating**: Check Firebase rules and data structure
2. **Incorrect calculations**: Verify category weights sum to 100%
3. **Missing assessments**: Ensure assessment IDs match between course structure and gradebook

### Debug Mode

Use the GradebookDemo component to view raw data:

```javascript
import { GradebookDemo } from './components/gradebook';

// In development only
<GradebookDemo />
```

## Future Enhancements

- [ ] Export grades to CSV/PDF
- [ ] Grade history and trends
- [ ] Custom grading scales
- [ ] Rubric-based grading
- [ ] Parent/guardian view access
- [ ] Grade notifications and alerts