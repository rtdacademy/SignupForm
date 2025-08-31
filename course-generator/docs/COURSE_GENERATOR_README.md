# Firebase Course Generator

## Quick Start

Generate a complete course structure with a single command:

```bash
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json
```

This will create all necessary frontend and backend files for your course, allowing you to focus on content creation rather than boilerplate code.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Configuration File Structure](#configuration-file-structure)
4. [Running the Generator](#running-the-generator)
5. [Generated File Structure](#generated-file-structure)
6. [Post-Generation Steps](#post-generation-steps)
7. [Customization Guide](#customization-guide)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The Firebase Course Generator automates the creation of course structures for the Firebase Course System. It generates:

- ✅ Frontend React components for course navigation
- ✅ Individual lesson components with proper structure
- ✅ Backend assessment configurations
- ✅ Database configuration files
- ✅ Proper file organization following conventions
- ✅ Full rollback support with automatic backups
- ✅ Generation tracking with manifests

## Prerequisites

Before using the generator:

1. **Node.js**: Ensure Node.js is installed (version 14+)
2. **Project Setup**: The script should be run from the project root
3. **Firebase Project**: Have your Firebase project configured
4. **Understanding**: Read `COURSE_ARCHITECTURE.md` for system overview

## Configuration File Structure

Create a JSON configuration file with the following structure:

### Minimal Configuration

```json
{
  "courseId": "5",
  "title": "Course Title",
  "courseStructure": {
    "units": [
      {
        "unitId": "unit_1",
        "name": "Unit Name",
        "order": 1,
        "items": [
          {
            "itemId": "01_subject_grade_lesson_name",
            "title": "Lesson Title",
            "type": "lesson",
            "order": 1
          }
        ]
      }
    ]
  }
}
```

### Complete Configuration

See `course-generator/configs/course-sample-config.json` for a comprehensive example with all options.

### Key Configuration Fields

#### Course Metadata
```json
{
  "courseId": "5",           // Unique identifier (required)
  "title": "Course Name",    // Display title (required)
  "credits": 3,              // Credit hours
  "metadata": {
    "version": "1.0.0",
    "status": "development", // development, active, archived
    "author": "Your Name",
    "prerequisites": ["Prerequisite 1"],
    "learningOutcomes": ["Outcome 1"],
    "estimatedDuration": "12 weeks"
  }
}
```

#### Course Structure
```json
{
  "courseStructure": {
    "units": [
      {
        "unitId": "unit_1_foundations",
        "name": "Unit Name",
        "order": 1,
        "items": [/* lessons, assignments, etc. */]
      }
    ]
  }
}
```

#### Item Types and Structure
```json
{
  "itemId": "01_subject_grade_topic_name",
  "title": "Item Title",
  "type": "lesson",        // lesson, assignment, lab, quiz, exam
  "order": 1,
  "estimatedTime": 45,     // minutes
  "description": "Brief description",
  "questions": [           // Optional: assessments
    {
      "questionId": "course5_01_topic_check",
      "title": "Question Title",
      "points": 1,
      "subject": "Subject Area",
      "gradeLevel": "Grade Level"
    }
  ]
}
```

#### Attempt Limits and Weights
```json
{
  "attemptLimits": {
    "lesson": 999,
    "assignment": 3,
    "lab": 3,
    "quiz": 2,
    "exam": 1
  },
  "weights": {
    "lesson": 0.2,
    "assignment": 0.3,
    "lab": 0.2,
    "quiz": 0.1,
    "exam": 0.2
  }
}
```

#### Progression Requirements
```json
{
  "progressionRequirements": {
    "enabled": true,
    "defaultCriteria": {
      "minimumPercentage": 70,
      "requireAllQuestions": false
    },
    "lessonOverrides": {
      "lesson_id": {
        "minimumPercentage": 80,
        "requireAllQuestions": true
      }
    }
  }
}
```

## Running the Generator

### Basic Usage

```bash
node course-generator/scripts/generate-course-with-rollback.js generate <config-file.json>
```

### Examples

```bash
# Generate from sample configuration
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/course-sample-config.json

# Generate from custom configuration
node course-generator/scripts/generate-course-with-rollback.js generate course-generator/configs/my-math-course.json
```

### Rollback and Clean Commands

```bash
# Rollback a course (removes generated files, keeps backups)
node course-generator/scripts/generate-course-with-rollback.js rollback 5

# Clean a course completely (removes everything including backups)
node course-generator/scripts/generate-course-with-rollback.js clean 5
```

### Output

The generator will:
1. Automatically backup any existing course files
2. Create all necessary directories
3. Generate component files with boilerplate code
4. Create assessment configurations
5. Save a generation manifest for tracking
6. Output a summary of created files
7. Provide next steps for course deployment

If files already exist for the course:
- Automatic backup is created with timestamp
- You can rollback at any time using the rollback command
- Backups are preserved until you explicitly clean them

## Generated File Structure

```
project-root/
├── src/FirebaseCourses/courses/{courseId}/
│   ├── index.js                          # Main course component
│   └── content/
│       ├── index.js                      # Content registry
│       ├── 01-lesson-name/
│       │   └── index.js                  # Lesson component
│       ├── 02-another-lesson/
│       │   └── index.js
│       └── ...
├── functions/courses/{courseId}/
│   ├── assessment-mapping.js             # Question ID mappings
│   ├── 01-lesson-name/
│   │   └── assessments.js               # Question pools
│   ├── 02-another-lesson/
│   │   └── assessments.js
│   └── ...
├── course-generator/
│   ├── configs/
│   │   └── course-{courseId}-generated.json  # Generated config
│   ├── backups/                              # Automatic backups
│   └── manifests/                            # Generation tracking
└── ...
```

## Post-Generation Steps

### 1. Import Course in Main Wrapper

Edit `src/FirebaseCourses/FirebaseCourseWrapperImproved.js`:

```javascript
// Add import at top of file
const Course5 = React.lazy(() => import('./courses/5'));

// Add to course selection logic
{courseId === '5' && <Course5 {...props} />}
```

### 2. Upload Configuration to Firebase

Upload the generated configuration to Firebase Realtime Database:

```bash
firebase database:set /courses/5/course-config course-generator/configs/course-5-generated.json
```

Or use Firebase Console to import at path: `/courses/5/course-config/`

### 3. Customize Lesson Components

Edit generated lesson files in `src/FirebaseCourses/courses/{courseId}/content/`:

- Replace placeholder content with actual lesson material
- Add images, videos, and interactive elements
- Customize styling and layout
- Integrate additional assessment types

### 4. Add Assessment Questions

Edit assessment files in `functions/courses/{courseId}/{lesson}/assessments.js`:

- Replace placeholder questions with actual content
- Add multiple questions to each pool
- Set correct answers and feedback
- Configure difficulty levels and tags

### 5. Test the Course

1. Start development server: `npm start`
2. Navigate to the course
3. Test all lessons and assessments
4. Verify progression requirements
5. Check responsive design

## Customization Guide

### Adding Custom Themes

In your configuration:

```json
{
  "themes": {
    "lesson": {
      "primaryColor": "purple",
      "accent": "#8b5cf6",
      "background": "#f5f3ff",
      "border": "#ddd6fe"
    }
  }
}
```

### Custom Assessment Types

Extend assessment configurations:

```javascript
// In assessments.js
const assessmentConfigs = {
  'question_id': {
    type: 'long-answer',  // Change from 'multiple-choice'
    rubrics: { /* custom rubrics */ },
    // ... other config
  }
};
```

### Adding Interactive Elements

In lesson components:

```javascript
import InteractiveWidget from './InteractiveWidget';

// In component JSX
<InteractiveWidget 
  data={lessonData}
  onComplete={handleComplete}
/>
```

## Best Practices

### Naming Conventions

1. **Course IDs**: Use simple numbers or short codes (e.g., "5", "PHY30")
2. **Item IDs**: Follow pattern `{number}_{subject}_{grade}_{description}`
3. **Question IDs**: Use pattern `course{id}_{lesson}_{description}_{type}`
4. **Folder Names**: Use hyphens for folders, underscores for IDs

### Content Organization

1. **Units**: Group related lessons logically
2. **Order**: Number items sequentially within units
3. **Time Estimates**: Provide realistic completion times
4. **Descriptions**: Write clear, concise descriptions

### Assessment Design

1. **Question Pools**: Include 3-5 questions per pool for variety
2. **Feedback**: Provide helpful feedback for all options
3. **Difficulty**: Mix difficulty levels appropriately
4. **Points**: Assign points based on complexity

### Performance Optimization

1. **Lazy Loading**: Components are automatically lazy loaded
2. **Code Splitting**: Each course is a separate bundle
3. **Image Optimization**: Use appropriate formats and sizes
4. **Caching**: Leverage Firebase's built-in caching

## Troubleshooting

### Common Issues and Solutions

#### Generator Errors

**Issue**: "Missing required field: courseId"
**Solution**: Ensure your configuration has a `courseId` field

**Issue**: "Failed to load configuration"
**Solution**: Check JSON syntax is valid (use JSONLint)

#### Runtime Errors

**Issue**: "Content Not Found"
**Solution**: Verify content registry maps to existing components

**Issue**: "Assessment not loading"
**Solution**: Check assessment-mapping.js paths match folder structure

**Issue**: "Navigation locked"
**Solution**: Review progression requirements in configuration

#### Database Issues

**Issue**: "Permission denied"
**Solution**: Check Firebase rules and authentication

**Issue**: "Data not syncing"
**Solution**: Verify database paths match courseId

### Debug Mode

Enable debug logging in course components:

```javascript
// In course index.js
const DEBUG = true;

if (DEBUG) {
  console.log('Course structure:', structure);
  console.log('Active item:', activeItem);
}
```

### Getting Help

1. Check `COURSE_ARCHITECTURE.md` for system details
2. Review existing courses for examples
3. Check Firebase Console for database/function logs
4. Use browser DevTools for frontend debugging

## Advanced Features

### Conditional Lesson Access

Configure complex unlock conditions:

```json
{
  "progressionRequirements": {
    "lessonOverrides": {
      "final_exam": {
        "requiresPreviousCompletion": ["unit_1", "unit_2"],
        "minimumCourseProgress": 80
      }
    }
  }
}
```

### Custom Validation

Add validation to the generator:

```javascript
// In generate-course-with-rollback.js
function validateConfig(config) {
  // Add custom validation rules
  if (config.credits > 10) {
    throw new Error('Credits cannot exceed 10');
  }
}
```

### Batch Generation

Generate multiple courses:

```bash
# Create a script
for config in course-generator/configs/*.json; do
  node course-generator/scripts/generate-course-with-rollback.js generate "$config"
done
```

## Migration Guide

### From Manual Creation

1. Export existing course structure to JSON
2. Run generator with configuration
3. Copy custom content to generated files
4. Test thoroughly

### Version Updates

When updating the generator:

1. Backup existing courses
2. Run generator (automatic backup will preserve existing files)
3. Merge changes carefully
4. Test all functionality

## Contributing

To improve the generator:

1. Identify repetitive patterns
2. Propose configuration schema changes
3. Submit pull requests with:
   - Updated generator script
   - Documentation changes
   - Example configurations

## Appendix

### Configuration Schema Reference

Full JSON schema available in `course-config-schema.json`

### File Template Reference

Templates used by generator available in `templates/` directory

### Conversion Utilities

- `itemIdToFolderName()`: Converts IDs to folder names
- `sanitizeEmail()`: Formats emails for database keys
- `getThemeForType()`: Maps item types to themes

---

*For more information about the course system architecture, see `COURSE_ARCHITECTURE.md`*