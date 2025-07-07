# Slideshow Practice Questions Template & Guide

This file contains templates and step-by-step instructions for adding practice question sets to lessons in the Physics 30 course using the SlideshowKnowledgeCheck component.

## Overview

The practice question system consists of 4 parts:
1. **Backend Assessment Functions** - Define questions with randomization
2. **Function Exports** - Make questions available to Firebase
3. **Course Configuration** - Register questions in the system
4. **Frontend Component** - Display questions to students

## Step-by-Step Process

### Step 1: Create Assessment File

Create a new file at `/functions/courses/2a/[XX-lesson-name]/assessments.js`

**Template:**

```javascript
const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

// ========================================
// HELPER FUNCTIONS FOR RANDOMIZATION
// ========================================
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];

// ========================================
// QUESTION GENERATOR FUNCTIONS
// ========================================

// Question 1: [Description of what this question tests]
const createQuestion1 = () => {
  // Generate random values
  const value1 = randInt(10, 50);
  const value2 = randFloat(2.0, 8.0, 1);
  const correctAnswer = value1 * value2;
  
  // Create wrong answers with common mistakes
  const wrongAnswer1 = (correctAnswer * 0.5).toFixed(1);
  const wrongAnswer2 = (correctAnswer * 2).toFixed(1);
  const wrongAnswer3 = (value1 + value2).toFixed(1);
  
  return {
    questionText: `A car travels at ${value1} m/s for ${value2} s. What distance does it cover?`,
    options: [
      { 
        id: 'a', 
        text: `${correctAnswer.toFixed(1)} m`, 
        feedback: "Correct! Distance = velocity × time" 
      },
      { 
        id: 'b', 
        text: `${wrongAnswer1} m`, 
        feedback: "You divided by 2. Remember: distance = velocity × time" 
      },
      { 
        id: 'c', 
        text: `${wrongAnswer2} m`, 
        feedback: "You multiplied by 2. Check the formula: d = vt" 
      },
      { 
        id: 'd', 
        text: `${wrongAnswer3} m`, 
        feedback: "You added instead of multiplying. Use d = v × t" 
      }
    ],
    correctOptionId: 'a',
    explanation: `To find distance, multiply velocity by time: d = v × t = ${value1} × ${value2} = ${correctAnswer.toFixed(1)} m`,
    difficulty: "intermediate",
    topic: "Kinematics"
  };
};

// Question 2: [Description]
const createQuestion2 = () => {
  const mass = randInt(100, 500);
  const velocity = randFloat(5.0, 20.0, 1);
  const momentum = mass * velocity;
  
  return {
    questionText: `An object with mass ${mass} kg moves at ${velocity} m/s. What is its momentum?`,
    options: [
      { 
        id: 'a', 
        text: `${momentum.toFixed(0)} kg⋅m/s`, 
        feedback: "Correct! Momentum = mass × velocity" 
      },
      { 
        id: 'b', 
        text: `${(momentum / 1000).toFixed(1)} kg⋅m/s`, 
        feedback: "Check your units. The mass is already in kg." 
      },
      { 
        id: 'c', 
        text: `${(mass / velocity).toFixed(1)} kg⋅m/s`, 
        feedback: "You divided mass by velocity. Momentum = m × v" 
      },
      { 
        id: 'd', 
        text: `${(mass + velocity).toFixed(1)} kg⋅m/s`, 
        feedback: "You added instead of multiplying. p = mv" 
      }
    ],
    correctOptionId: 'a',
    explanation: `Momentum = mass × velocity = ${mass} × ${velocity} = ${momentum.toFixed(0)} kg⋅m/s`,
    difficulty: "beginner",
    topic: "Momentum"
  };
};

// Add more question generators as needed...

// ========================================
// EXPORT ASSESSMENT CONFIGURATIONS
// ========================================

// Export each question with 5 random variations
exports.course2_[lesson]_practice1 = createStandardMultipleChoice({
  questions: [
    createQuestion1(),
    createQuestion1(),
    createQuestion1(),
    createQuestion1(),
    createQuestion1()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true
});

exports.course2_[lesson]_practice2 = createStandardMultipleChoice({
  questions: [
    createQuestion2(),
    createQuestion2(),
    createQuestion2(),
    createQuestion2(),
    createQuestion2()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true
});

// Export the assessment configurations for the master function
exports.assessmentConfigs = {
  'course2_[lesson]_practice1': exports.course2_[lesson]_practice1.config,
  'course2_[lesson]_practice2': exports.course2_[lesson]_practice2.config,
  // Add all question IDs here
};
```

### Step 2: Update Function Exports

Add to `/functions/courses/2a/index.js`:

```javascript
// Add these lines for your new lesson
exports.course2_[lesson]_practice1 = require('./[XX-lesson-name]/assessments').course2_[lesson]_practice1;
exports.course2_[lesson]_practice2 = require('./[XX-lesson-name]/assessments').course2_[lesson]_practice2;
// Add all your questions here
```

### Step 3: Update Master Assessment Function

Add to `/functions/courses/2/assessments.js` in the imports section:

```javascript
const { assessmentConfigs: [lessonName]Configs } = require('../2a/[XX-lesson-name]/assessments');
```

And in the `getAllAssessmentConfigs()` function:

```javascript
const getAllAssessmentConfigs = () => {
  return {
    // ... existing configs
    ...[lessonName]Configs,
  };
};
```

### Step 4: Update Course Configuration

In `/functions/courses-config/2/course-config.json`, find your lesson and update:

```json
{
  "itemId": "[lesson_id]",
  "title": "Lesson Title",
  "type": "lesson",
  "hasCloudFunctions": true,
  "questions": [
    {
      "questionId": "course2_[lesson]_practice1",
      "title": "Practice 1: Kinematics Problems",
      "points": 1
    },
    {
      "questionId": "course2_[lesson]_practice2",
      "title": "Practice 2: Momentum Calculations",
      "points": 1
    }
  ]
}
```

### Step 5: Add Frontend Component

In `/src/FirebaseCourses/courses/2/content/[XX-lesson-name]/index.js`:

```javascript
import React from 'react';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const [LessonName] = ({ courseId = '2', onAIAccordionContent, course }) => {
  return (
    <div className="space-y-8">
      {/* Your lesson content here */}
      
      <h2 className="text-2xl font-bold">Practice Questions</h2>
      
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="[XX-lesson-name]"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',  // MUST be 'multiple-choice'
            questionId: 'course2_[lesson]_practice1',  // MUST match export name
            title: 'Practice 1: Kinematics Problems'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_[lesson]_practice2',
            title: 'Practice 2: Momentum Calculations'
          }
        ]}
        theme="indigo"  // Options: blue, green, purple, indigo
      />
    </div>
  );
};

export default [LessonName];
```

## Batch Processing Steps

To efficiently add multiple practice questions:

1. **Prepare All Questions First**
   - Write all question generator functions
   - Test randomization ranges
   - Verify answer calculations

2. **Batch Update Backend Files**
   ```bash
   # In assessments.js - add all exports at once
   # In index.js - add all exports in one edit
   # In master assessments.js - add import and spread in one edit
   ```

3. **Update Course Config Once**
   - Add all questions for the lesson in a single edit
   - Ensure `hasCloudFunctions: true` is set

4. **Add Frontend Component**
   - Import SlideshowKnowledgeCheck once
   - Add all questions to the array

5. **Deploy Functions**
   ```bash
   # Deploy only course 2 functions
   firebase deploy --only functions:course2*
   
   # Or deploy specific function
   firebase deploy --only functions:course2_[lesson]_practice1
   ```

## Common Question Patterns

### Pattern 1: Simple Calculation
```javascript
const createSimpleCalc = () => {
  const a = randInt(10, 100);
  const b = randInt(2, 20);
  const answer = a * b;
  
  return {
    questionText: `Calculate ${a} × ${b}`,
    options: [
      { id: 'a', text: `${answer}`, feedback: "Correct!" },
      { id: 'b', text: `${answer + 10}`, feedback: "Close, but check your calculation" },
      { id: 'c', text: `${a + b}`, feedback: "You added instead of multiplying" },
      { id: 'd', text: `${Math.abs(a - b)}`, feedback: "You subtracted instead of multiplying" }
    ],
    correctOptionId: 'a',
    explanation: `${a} × ${b} = ${answer}`,
    difficulty: "beginner",
    topic: "Arithmetic"
  };
};
```

### Pattern 2: Unit Conversion
```javascript
const createUnitConversion = () => {
  const meters = randInt(1000, 9000);
  const km = meters / 1000;
  
  return {
    questionText: `Convert ${meters} m to kilometers`,
    options: [
      { id: 'a', text: `${km} km`, feedback: "Correct! Divide by 1000" },
      { id: 'b', text: `${meters} km`, feedback: "Remember to convert the units" },
      { id: 'c', text: `${km * 1000} km`, feedback: "You multiplied instead of dividing" },
      { id: 'd', text: `${km / 1000} km`, feedback: "You divided twice" }
    ],
    correctOptionId: 'a',
    explanation: `To convert m to km, divide by 1000: ${meters} ÷ 1000 = ${km} km`,
    difficulty: "beginner",
    topic: "Units"
  };
};
```

### Pattern 3: Formula Application
```javascript
const createFormulaQuestion = () => {
  const force = randInt(100, 500);
  const mass = randInt(10, 50);
  const acceleration = (force / mass).toFixed(1);
  
  return {
    questionText: `A ${force} N force acts on a ${mass} kg object. What is the acceleration?`,
    options: [
      { id: 'a', text: `${acceleration} m/s²`, feedback: "Correct! F = ma, so a = F/m" },
      { id: 'b', text: `${(force * mass).toFixed(0)} m/s²`, feedback: "You multiplied F×m. Use a = F/m" },
      { id: 'c', text: `${(force + mass).toFixed(0)} m/s²`, feedback: "You added F+m. Use Newton's second law: a = F/m" },
      { id: 'd', text: `${(mass / force).toFixed(3)} m/s²`, feedback: "You inverted the formula. It's a = F/m, not m/F" }
    ],
    correctOptionId: 'a',
    explanation: `Using F = ma: a = F/m = ${force}/${mass} = ${acceleration} m/s²`,
    difficulty: "intermediate",
    topic: "Newton's Laws"
  };
};
```

## Tips for Effective Questions

1. **Randomization Ranges**
   - Choose ranges that create realistic scenarios
   - Avoid values that make calculations too complex
   - Ensure answers are distinguishable

2. **Distractors (Wrong Answers)**
   - Use common student mistakes
   - Include unit errors
   - Add calculation errors (×2, ÷2, etc.)
   - Include conceptual misunderstandings

3. **Feedback Quality**
   - Explain why the answer is wrong
   - Guide toward the correct approach
   - Reference the relevant formula or concept

4. **Question Variety**
   - Mix difficulty levels
   - Cover different aspects of the topic
   - Include both conceptual and numerical questions

## Troubleshooting

### Common Issues:

1. **Question not appearing**
   - Check that questionId matches exactly in all files
   - Ensure hasCloudFunctions: true in course config
   - Verify the function was deployed

2. **Random values causing errors**
   - Add bounds checking
   - Use Math.abs() for values that shouldn't be negative
   - Round appropriately with toFixed()

3. **Deployment errors**
   - Check for syntax errors in assessments.js
   - Ensure all imports are correct
   - Verify Firebase project is selected

## Quick Reference Checklist

- [ ] Create assessments.js with question generators
- [ ] Export functions with correct naming convention
- [ ] Add exports to /functions/courses/2a/index.js
- [ ] Import configs in master assessments.js
- [ ] Update course-config.json with question entries
- [ ] Add SlideshowKnowledgeCheck to frontend component
- [ ] Deploy functions
- [ ] Test questions in the application

## Naming Conventions

- Function names: `course2_[lesson]_[type][number]`
  - Examples: `course2_momentum_practice1`, `course2_optics_quiz3`
- Question IDs must match exactly across all files
- Use descriptive titles in course config and frontend

This template provides everything needed to efficiently add practice questions to any lesson.

## ⚠️ Common Errors and Solutions

### Error 1: `ReferenceError: randInt is not defined`

**Problem:** Missing helper functions for randomization.

**Solution:** Always include these helper functions at the top of assessments.js:
```javascript
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max, decimals = 1) => parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randChoice = (array) => array[Math.floor(Math.random() * array.length)];
```

### Error 2: `No assessment configuration found for assessmentId`

**Problem:** Missing import in master assessments function OR export conflicts.

**Solutions:**

1. **Add import to `/functions/courses/2/assessments.js`:**
```javascript
const { assessmentConfigs: [lessonName]Configs } = require('../2b/[XX-lesson-name]/assessments');
```

2. **Add to getAllAssessmentConfigs() function:**
```javascript
const getAllAssessmentConfigs = () => {
  return {
    // ... existing configs
    ...[lessonName]Configs,  // Add this line
  };
};
```

3. **CRITICAL: Fix export conflicts in assessments.js:**

❌ **WRONG - This causes export conflicts:**
```javascript
exports.assessmentConfigs = assessmentConfigs;
module.exports = { assessments }; // This overwrites assessmentConfigs!
```

✅ **CORRECT - Use ONLY exports:**
```javascript
exports.assessmentConfigs = assessmentConfigs;
// No module.exports statement
```

### Error 3: `Successfully imported configs: false` with empty keys

**Problem:** Export conflicts - `module.exports` overwrites `exports.assessmentConfigs`.

**Solution:** Never use both `exports.property` and `module.exports` in the same file. Choose one pattern:

**Pattern A (Recommended):**
```javascript
exports.individualFunction = someFunction;
exports.assessmentConfigs = configObject;
```

**Pattern B (Alternative):**
```javascript
module.exports = {
  individualFunction: someFunction,
  assessmentConfigs: configObject
};
```

### Error 4: Missing required dependencies

**Problem:** Assessment files need specific imports to work with the system.

**Solution:** Always include these imports in assessments.js:
```javascript
const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');
const { getActivityTypeSettings } = require('../shared/utilities/config-loader');

// Load course configuration
const courseConfig = require('../shared/courses-config/2/course-config.json');

// Activity type configuration
const ACTIVITY_TYPE = 'lesson';
const activityDefaults = getActivityTypeSettings(courseConfig, ACTIVITY_TYPE);
```

### Error 5: Function emulator not picking up changes

**Problem:** Cached functions or restart needed.

**Solution:** 
1. Stop the function emulator completely
2. Restart with `firebase emulators:start`
3. Clear browser cache if needed

## Updated Checklist

- [ ] Include required helper functions (randInt, randFloat, randChoice)
- [ ] Include required imports (getActivityTypeSettings, courseConfig)
- [ ] Create assessments.js with question generators
- [ ] Export functions with correct naming convention  
- [ ] ⚠️ Use ONLY `exports.assessmentConfigs` - NO `module.exports`
- [ ] Add exports to appropriate index.js file
- [ ] Import configs in master assessments.js (/functions/courses/2/assessments.js)
- [ ] Add to getAllAssessmentConfigs() function
- [ ] Update course-config.json with question entries
- [ ] Set hasCloudFunctions: true in course config
- [ ] Add SlideshowKnowledgeCheck to frontend component
- [ ] Deploy functions
- [ ] Test questions in the application