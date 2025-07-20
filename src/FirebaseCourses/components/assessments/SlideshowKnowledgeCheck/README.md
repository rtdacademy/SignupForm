# SlideshowKnowledgeCheck Component

A reusable component for creating interactive slideshow-style knowledge checks with multiple question types.

## Features

- 🎯 Multiple question type support (Multiple Choice, AI Short Answer)
- 📊 Visual progress navigation with numbered circles
- 🎨 **Persistent** color-coded progress indicators (white/blue/green/red)
- 🎲 **Randomizable questions** with variable values
- 💬 **Detailed feedback** for all answer choices
- ♾️ Unlimited attempts (maxAttempts: 9999)
- 🔄 Automatic gradebook integration
- 📱 Responsive design

## Quick Start with Claude (Recommended)

### Simple Command Pattern

Just tell Claude: **"Add a slideshow knowledge check to [lesson] in course [X] with these questions:"** and paste your questions.

Example:
```
Add a slideshow knowledge check to lesson 02-learning-strategies in course 4 with these questions:

Question: What is the most effective study technique?
A) Cramming all night
B) Spaced repetition 
C) Reading once quickly
D) Multitasking while studying
Answer: B
Explanation: Spaced repetition improves long-term retention.

Question: Explain why time management is important for online learning.
Expected: Students need to self-regulate their schedule and maintain consistent progress without traditional classroom structure.
Keywords: time management, self-regulate, schedule, progress, structure
Word Limit: 30-150 words
```

### What Claude Does Automatically

1. ✅ **Updates Frontend** - Adds SlideshowKnowledgeCheck to existing lesson
2. ✅ **Creates Backend** - Generates assessment functions with unique IDs
3. ✅ **Registers Functions** - Updates functions/index.js exports
4. ✅ **Updates Gradebook** - Adds questions to course-config.json
5. ✅ **Shows Summary** - Lists all changes made

### Supported Question Formats

**Multiple Choice:**
```
Question: What is...?
A) Option A
B) Option B  
C) Option C
D) Option D
Answer: A
Explanation: Because...
```

**AI Short Answer:**
```
Question: Explain...
Expected: Key concepts should include...
Keywords: concept, important, key
Word Limit: 50-150 words
```

## Alternative: Generator Script

### 1. Generate a New Slideshow

Run the generator script:

```bash
npm run generate-slideshow
```

### 2. Paste Your Configuration

When prompted, paste a JSON configuration like this:

```json
{
  "courseId": 4,
  "lessonPath": "02-lesson-name",
  "lessonTitle": "Lesson 2 - Understanding Core Concepts",
  "questions": [
    {
      "type": "multiple-choice",
      "question": "What is the primary purpose of RTD Academy?",
      "options": [
        "To provide in-person education only",
        "To offer flexible online learning opportunities",
        "To replace traditional schools entirely",
        "To focus only on diploma preparation"
      ],
      "correctAnswer": "To offer flexible online learning opportunities",
      "explanation": "RTD Academy specializes in flexible, asynchronous online learning that allows students to work at their own pace.",
      "points": 1
    },
    {
      "type": "ai-short-answer",
      "question": "Explain in your own words why time management is important for online learning success.",
      "expectedAnswers": [
        "Time management is crucial for online learning because students need to self-regulate their schedule, maintain consistent progress, and balance their studies with other responsibilities without the structure of a traditional classroom."
      ],
      "keyWords": ["time management", "self-regulate", "schedule", "progress", "balance"],
      "wordLimits": { "min": 30, "max": 150 },
      "points": 2
    }
  ]
}
```

### 3. What Gets Generated

The script automatically creates:

1. **Frontend Component** (`/src/FirebaseCourses/courses/{courseId}/content/{lessonPath}/index.js`)
2. **Backend Assessments** (`/functions/courses/{courseId}/{lessonPath}/assessments.js`)
3. **Cloud Function Exports** (appended to `/functions/index.js`)
4. **Gradebook Configuration** (updated in `/functions/courses-config/{courseId}/course-config.json`)

### 4. Deploy and Test

```bash
# Deploy the cloud functions
firebase deploy --only functions

# Start your development server
npm run start:main
```

## Manual Usage (Without Generator)

If you prefer to manually integrate the component:

### Step 1: Create Backend Assessment Functions

Create assessment functions using `createStandardMultipleChoice()` in your course's assessments file:

```javascript
// functions/courses/{courseId}/{lessonPath}/assessments.js
const { createStandardMultipleChoice } = require('../shared/assessment-types/standard-multiple-choice');

exports.question_function_name = createStandardMultipleChoice({
  questions: [
    {
      questionText: 'Your question here',
      options: [
        { id: 'a', text: 'Option A', feedback: 'Feedback for A' },
        { id: 'b', text: 'Option B', feedback: 'Feedback for B' },
        { id: 'c', text: 'Option C', feedback: 'Feedback for C' },
        { id: 'd', text: 'Option D', feedback: 'Feedback for D' }
      ],
      correctOptionId: 'a',
      explanation: 'Explanation text',
      difficulty: 'intermediate',
      tags: ['your-topic']
    }
  ],
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1,
  showFeedback: true,
  randomizeQuestions: false,
  randomizeOptions: true,
  allowSameQuestion: true
});
```

### Step 2: Export Functions in index.js

Add your functions to `functions/index.js`:

```javascript
// functions/index.js
exports.question_function_name = require('./courses/{courseId}/{lessonPath}/assessments').question_function_name;
```

### Step 3: Update Course Configuration

Set `hasCloudFunctions: true` in your course config:

```json
// functions/courses-config/{courseId}/course-config.json
{
  "itemId": "lesson_id",
  "type": "lesson", 
  "title": "Your Lesson Title",
  "hasCloudFunctions": true
}
```

### Step 4: Frontend Integration

**IMPORTANT**: Use the correct configuration format that matches existing working lessons:

```jsx
import React from 'react';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const YourLesson = ({ courseId }) => {
  return (
    <SlideshowKnowledgeCheck
      courseId={courseId}
      lessonPath="your-lesson-path"
      questions={[
        {
          type: 'multiple-choice',           // MUST be 'multiple-choice' (not 'standard-multiple-choice')
          questionId: 'question_function_name',  // MUST match exported function name
          title: 'Question 1: Your Question Title'
        },
        {
          type: 'multiple-choice',
          questionId: 'another_function_name',
          title: 'Question 2: Another Question Title'
        }
      ]}
      theme="indigo"
    />
  );
};
```

### ⚠️ Critical Requirements

**Frontend Configuration Must Use:**
- `type: 'multiple-choice'` (NOT `'standard-multiple-choice'`)
- `questionId:` (NOT `assessmentId:`)
- `questionId` value must EXACTLY match the exported function name
- `title:` should follow the pattern "Question X: Description"

**Backend Requirements:**
- Functions must use `createStandardMultipleChoice()` from `functions/shared/assessment-types/standard-multiple-choice.js`
- Function names must match the `questionId` used in frontend
- Functions must be exported in `functions/index.js`
- Course config must have `hasCloudFunctions: true`

## Question Types

### Multiple Choice
```json
{
  "type": "multiple-choice",
  "question": "Question text",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "correctAnswer": "Option A",
  "explanation": "Why this is correct",
  "points": 1,
  "difficulty": "intermediate",
  "title": "Optional custom title"
}
```

### AI Short Answer
```json
{
  "type": "ai-short-answer",
  "question": "Open-ended question",
  "expectedAnswers": ["Expected answer text"],
  "keyWords": ["important", "concepts", "to", "include"],
  "wordLimits": { "min": 20, "max": 150 },
  "points": 2,
  "difficulty": "intermediate",
  "topic": "Topic name",
  "sampleAnswer": "Example of a good answer",
  "title": "Optional custom title"
}
```

## Visual Progress Indicators

The component features **persistent** progress indicators that maintain their state across page refreshes:

- **White Circle with Number**: Question not attempted (no submission exists in database)
- **Blue/Indigo Circle**: Current question (active selection)
- **Green Circle with Number**: Answered correctly (saved in Firebase as `lastSubmission.isCorrect: true`)
- **Red Circle with Number**: Attempted but incorrect (saved in Firebase as `lastSubmission.isCorrect: false`)

### How Persistence Works

The component automatically:
1. **Loads progress on mount** from Firebase path: `/students/{email}/courses/{courseId}/Assessments/{questionId}/lastSubmission`
2. **Reads `lastSubmission.isCorrect`** to determine if question was answered correctly
3. **Shows loading spinner** while fetching progress data
4. **Updates circles** based on previous attempts without additional database writes

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| courseId | string/number | Yes | The course ID |
| lessonPath | string | Yes | The lesson path (used for generating IDs) |
| questions | array | Yes | Array of question configurations |
| onComplete | function | No | Callback when all questions completed |
| theme | string | No | Color theme (default: "indigo") |

## Troubleshooting

### ❌ Slideshow shows but no questions appear (COMMON ISSUE)
**Symptoms**: The slideshow component renders but shows "No questions available" or empty content.

**Cause**: Incorrect frontend configuration format.

**Solution**: Verify your frontend configuration matches the working pattern:
```jsx
// ❌ WRONG - Don't use these patterns:
{
  type: 'standard-multiple-choice',  // Wrong type
  assessmentId: 'function_name',     // Wrong property name
}

// ✅ CORRECT - Use this pattern:
{
  type: 'multiple-choice',           // Correct type
  questionId: 'function_name',       // Correct property name  
  title: 'Question 1: Description'   // Include title
}
```

**Debug Steps**:
1. Check browser console for errors
2. Verify `questionId` exactly matches exported function name in `functions/index.js`
3. Ensure backend functions are deployed: `firebase deploy --only functions`
4. Confirm course config has `hasCloudFunctions: true`

### Questions not saving to gradebook
- Ensure cloud functions are deployed
- Check that question IDs match in all locations
- Verify course-config.json has been updated

### AI questions not working
- Confirm AI assessment functions are properly configured
- Check that the AI model is accessible
- Verify word limits are reasonable

### Visual indicators not updating
- Check browser console for errors
- Ensure question completion callbacks are firing
- Verify state updates are happening correctly

### Progress circles not persisting across page refreshes
- Verify Firebase database permissions for reading student assessment data
- Check console for any errors during progress loading
- Ensure question IDs match exactly between frontend and backend
- Confirm user is properly authenticated

### Randomized questions showing same values
- Check that generator functions are being called (not just referenced)
- Verify `randomizeQuestions: true` is set in the assessment configuration
- Ensure multiple question variations are created in the question pool
- Confirm `allowSameQuestion: false` to prevent repetition

### Answer feedback not displaying
- Verify each option has a `feedback` property in the question configuration
- Check that `showFeedback: true` is set in the assessment settings
- Ensure the StandardMultipleChoiceQuestion component supports feedback display
- Look for any JavaScript errors preventing feedback from rendering

## Randomizable Questions

Create questions with variable values that change each time students attempt them:

### Example: Physics Displacement Question

```javascript
// Helper function to create randomized displacement questions
const createRandomDisplacementQuestion = () => {
  const initial = randInt(-20, 20);
  const final = randInt(-20, 20);
  const displacement = final - initial;
  
  const formatNumber = (num) => num > 0 ? `+${num}` : `${num}`;
  
  return {
    questionText: `State the displacement when position changes from ${formatNumber(initial)} km to ${formatNumber(final)} km.`,
    options: [
      { id: 'a', text: `${formatNumber(displacement)} km`, feedback: "Correct! Displacement = final position - initial position." },
      { id: 'b', text: `${formatNumber(Math.abs(displacement))} km`, feedback: "This is the magnitude but displacement includes direction." },
      { id: 'c', text: `${formatNumber(initial - final)} km`, feedback: "Wrong order. Should be final - initial." },
      { id: 'd', text: `${formatNumber(final + initial)} km`, feedback: "You added instead of subtracting." }
    ],
    correctOptionId: 'a',
    explanation: `Displacement = final - initial = (${final}) - (${initial}) = ${displacement} km`,
    difficulty: "intermediate",
    topic: "Displacement"
  };
};

// Create multiple variations for question pool
exports.your_question_id = createStandardMultipleChoice({
  questions: [
    createRandomDisplacementQuestion(),
    createRandomDisplacementQuestion(),
    createRandomDisplacementQuestion(),
    createRandomDisplacementQuestion(),
    createRandomDisplacementQuestion()
  ],
  randomizeQuestions: true,
  allowSameQuestion: false,
  pointsValue: 1,
  maxAttempts: 9999,
  showFeedback: true
});
```

### Helper Functions for Randomization

The assessment files include utility functions for generating random values:

```javascript
// Generate random integer in range (inclusive)
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate random float in range with specified decimal places
const randFloat = (min, max, decimals = 1) => {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
};

// Format numbers in scientific notation
const formatScientific = (num, sigFigs = 2) => {
  if (num === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);
  return `${mantissa.toFixed(sigFigs - 1)} \\times 10^{${exponent}}`;
};
```

### Benefits of Randomization

- **Unlimited practice** with different values
- **Prevents memorization** of specific answers
- **Same concepts** taught with varied examples
- **Realistic value ranges** for meaningful problems
- **Automatic generation** of plausible distractors

## Detailed Answer Feedback

Every answer choice can include specific feedback to help students learn:

### Feedback Structure

```javascript
options: [
  { 
    id: 'a', 
    text: "Correct answer", 
    feedback: "Correct! Explanation of why this is right." 
  },
  { 
    id: 'b', 
    text: "Wrong answer", 
    feedback: "This is incorrect because..." 
  },
  { 
    id: 'c', 
    text: "Common mistake", 
    feedback: "You made this common error. Here's how to avoid it..." 
  },
  { 
    id: 'd', 
    text: "Wrong approach", 
    feedback: "You used the wrong formula. Try this approach instead..." 
  }
]
```

### Types of Feedback

- **Correct answers**: Reinforce the right approach
- **Common mistakes**: Explain what went wrong
- **Formula errors**: Guide to correct equations
- **Conceptual issues**: Clarify misunderstandings
- **Sign/direction errors**: Address physics conventions

## Advanced Features

### Custom Completion Logic
```jsx
onComplete={(totalScore, results) => {
  if (totalScore >= 80) {
    // Navigate to next lesson
    navigate(`/course/${courseId}/next-lesson`);
  } else {
    // Show review message
    setShowReview(true);
  }
}}
```

### Dynamic Question Loading
Questions can be loaded from an API or database instead of being hardcoded:

```jsx
const [questions, setQuestions] = useState([]);

useEffect(() => {
  fetchQuestionsFromAPI(lessonId).then(setQuestions);
}, [lessonId]);
```

## Contributing

When adding new question types:
1. Update the SlideshowKnowledgeCheck component's `renderQuestion` method
2. Add the new type to the generator script
3. Create appropriate assessment type in the shared utilities
4. Update this documentation