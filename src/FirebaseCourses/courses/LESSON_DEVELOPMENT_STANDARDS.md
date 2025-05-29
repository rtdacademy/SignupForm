# Lesson Development Standards & Guidelines

## Overview

This document establishes the standards and guidelines for creating consistent, high-quality lesson files within the Firebase Courses system. Following these standards ensures uniformity across all lessons and maintains a professional learning experience for students.

## File Structure & Organization

### Directory Structure
```
src/FirebaseCourses/courses/
├── [COURSE_ID]/
│   ├── content/
│   │   └── lessons/
│   │       ├── LessonName.js
│   │       └── AnotherLesson.js
│   └── ...
```

### Course ID Naming Convention
- **Format**: Use course codes that match institutional standards
- **Examples**: `PHY30`, `COM1255`, `MATH20`
- **Rules**: All uppercase letters, include numbers where applicable

### Lesson File Naming Convention
- **Format**: PascalCase with descriptive names
- **Examples**: `MomentumOneDimension.js`, `IntroToPhysics.js`, `BenefitsChallenges.js`
- **Rules**: 
  - No spaces or special characters
  - Start with capital letter
  - Use descriptive, concise names
  - Maximum 50 characters

## Lesson File Structure

### Required Imports
Every lesson file must include these standard imports:

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
```

### Optional Imports (Based on Content Type)
```javascript
// For assessments
import { MultipleChoiceQuestion, DynamicQuestion, AIMultipleChoiceQuestion } from '../../../../components/assessments';

// For mathematical content
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// For text-to-speech functionality
import { SimpleReadAloudText as ReadAloudText } from '../../../../components/TextToSpeech';
```

### Component Structure Template
```javascript
/**
 * Lesson about [TOPIC DESCRIPTION]
 * [Brief description of lesson content and learning objectives]
 */
const LessonName = ({ course, courseId = '1' }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Assessment IDs (if applicable)
  const assessmentId1 = 'unique_assessment_id';

  // Get effective courseId
  const effectiveCourseId = courseId || 
    course?.courseDetails?.courseId || 
    course?.courseId || 
    course?.id || 
    'default';

  // Component logic here

  return (
    <LessonContent
      lessonId="lesson_[unique_id]"
      title="[Lesson Title]"
      metadata={{ estimated_time: '[X] minutes' }}
    >
      {/* Lesson content here */}
    </LessonContent>
  );
};

export default LessonName;
```

## Content Organization Standards

### Lesson Metadata
- **lessonId**: Format as `lesson_[descriptive_name]` or `lesson_[timestamp]_[number]`
- **title**: Clear, descriptive title matching learning objectives
- **estimated_time**: Realistic time estimate in minutes (e.g., "45 minutes", "1.5 hours")

### Content Sections

#### 1. TextSection Components
```javascript
<TextSection title="Section Title">
  <p className="mb-4">
    Content paragraphs with consistent spacing and formatting.
  </p>
</TextSection>
```

#### 2. MediaSection Components
```javascript
<MediaSection
  type="video|image"
  src="[URL or path]"
  alt="Descriptive alt text"
  caption="Optional caption describing the media"
/>
```

#### 3. LessonSummary Components
```javascript
<LessonSummary
  points={[
    "First key takeaway or learning objective",
    "Second important concept covered",
    "Third essential skill or knowledge gained",
    "Fourth summary point if needed"
  ]}
/>
```

## Practice Problem Slideshow Standards

### Data Structure
All practice problems must follow this consistent data structure:

```javascript
const practiceProblems = [
  {
    id: 1,
    question: "Problem statement with clear, specific wording",
    given: [
      "Variable 1: value with units",
      "Variable 2: value with units",
      "Find: what needs to be calculated"
    ],
    equation: "Mathematical equation in LaTeX format",
    solution: "Step-by-step solution showing work", 
    answer: "Final answer with correct units and significant figures"
  },
  // Additional problems...
];
```

### Color Scheme Standards

#### Green Theme (Primary for Physics/Science)
- **Header**: `text-green-800`
- **Background**: `bg-green-50`
- **Borders**: `border-green-200`, `border-green-300`
- **Buttons**: `bg-green-600 hover:bg-green-700`
- **Problem indicators**: `bg-green-600`, `bg-green-200 text-green-800 hover:bg-green-300`

#### Blue Theme (Secondary/Alternative)
- **Header**: `text-blue-800`
- **Background**: `bg-blue-50`
- **Borders**: `border-blue-200`, `border-blue-300`
- **Buttons**: `bg-blue-600 hover:bg-blue-700`
- **Problem indicators**: `bg-blue-600`, `bg-blue-200 text-blue-800 hover:bg-blue-300`

#### Purple Theme (For Specific Subjects)
- **Header**: `text-purple-800`
- **Background**: `bg-purple-50`
- **Borders**: `border-purple-200`, `border-purple-300`
- **Buttons**: `bg-purple-600 hover:bg-purple-700`
- **Problem indicators**: `bg-purple-600`, `bg-purple-200 text-purple-800 hover:bg-purple-300`

### Slideshow Implementation Template
```javascript
// State management
const [currentProblem, setCurrentProblem] = useState(0);

// Navigation functions
const nextProblem = () => {
  setCurrentProblem((prev) => (prev + 1) % practiceProblems.length);
};

const prevProblem = () => {
  setCurrentProblem((prev) => (prev - 1 + practiceProblems.length) % practiceProblems.length);
};

const goToProblem = (index) => {
  setCurrentProblem(index);
};

// Slideshow JSX structure
<div className="mt-8 mb-6">
  <h3 className="text-xl font-semibold mb-4 text-green-900">[Slideshow Title]</h3>
  <p className="mb-6 text-gray-700">
    [Instructions for using the slideshow]
  </p>

  <div className="bg-green-50 rounded-lg p-6 border border-green-200">
    {/* Problem indicator dots */}
    <div className="flex justify-center mb-6">
      <div className="flex space-x-2">
        {practiceProblems.map((_, index) => (
          <button
            key={index}
            onClick={() => goToProblem(index)}
            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
              index === currentProblem
                ? 'bg-green-600 text-white'
                : 'bg-green-200 text-green-800 hover:bg-green-300'
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>

    {/* Problem content */}
    <div className="bg-white rounded-lg p-6 border border-green-200">
      <h4 className="text-lg font-semibold text-green-900 mb-4">
        {practiceProblems[currentProblem].question}
      </h4>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left Column - Given and Equation */}
        <div>
          <div className="mb-4">
            <h5 className="font-medium text-green-700 mb-2">Given:</h5>
            <ul className="space-y-1">
              {practiceProblems[currentProblem].given.map((item, index) => (
                <li key={index} className="text-sm bg-green-50 px-3 py-1 rounded border-l-3 border-green-300">
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mb-4">
            <h5 className="font-medium text-green-700 mb-2">Equation:</h5>
            <div className="bg-green-50 p-3 rounded border-l-3 border-green-300">
              <BlockMath>{practiceProblems[currentProblem].equation}</BlockMath>
            </div>
          </div>
        </div>

        {/* Right Column - Solution */}
        <div>
          <h5 className="font-medium text-green-700 mb-2">Solution:</h5>
          <div className="bg-gray-50 p-4 rounded border-l-3 border-gray-300">
            <p className="text-sm">{practiceProblems[currentProblem].solution}</p>
            <p className="font-semibold text-green-800 mt-2">
              Answer: {practiceProblems[currentProblem].answer}
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Navigation */}
    <div className="flex justify-between items-center mt-6">
      <button
        onClick={prevProblem}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={practiceProblems.length <= 1}
      >
        <span className="mr-2">←</span>
        Previous
      </button>
      
      <div className="text-green-700 font-medium">
        {currentProblem + 1} / {practiceProblems.length}
      </div>
      
      <button
        onClick={nextProblem}
        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={practiceProblems.length <= 1}
      >
        Next
        <span className="ml-2">→</span>
      </button>
    </div>
  </div>
</div>
```

## Assessment Integration Standards

### Assessment Component Usage
```javascript
// Multiple Choice Questions
<MultipleChoiceQuestion
  courseId={effectiveCourseId}
  assessmentId="unique_assessment_id"
  cloudFunctionName="[COURSE_ID]_[LessonName]Q[Number]"
  course={course}
  theme="blue|green|purple"
  title="Question Title"
  onCorrectAnswer={() => console.log("Correct answer callback")}
  onAttempt={(isCorrect) => console.log(`Attempt callback: ${isCorrect}`)}
/>

// Dynamic Questions
<DynamicQuestion
  courseId={effectiveCourseId}
  assessmentId="dynamic_question_id"
  cloudFunctionName="[COURSE_ID]_[LessonName]Dynamic"
  course={course}
  theme="green"
  title="Dynamic Question Title"
  onCorrectAnswer={() => console.log("Dynamic question correct")}
  showRegenerate={true}
/>

// AI-Generated Questions
<AIMultipleChoiceQuestion
  courseId={effectiveCourseId}
  assessmentId="ai_question_id"
  cloudFunctionName="[COURSE_ID]_[LessonName]AI"
  course={course}
  theme="purple"
  title="AI-Generated Question"
  topic="specific_topic"
  difficulty="easy|intermediate|advanced"
  onCorrectAnswer={() => console.log("AI question correct")}
  onAttempt={(isCorrect) => console.log(`AI attempt: ${isCorrect}`)}
/>
```

### Assessment ID Naming Conventions
- **Format**: `[type]_[topic]_[descriptor]`
- **Examples**: 
  - `mc_momentum_basic` (multiple choice)
  - `dynamic_kinematics_practice` (dynamic question)
  - `ai_elearning_benefits` (AI question)

## Mathematical Content Standards

### LaTeX Formatting
- Use `InlineMath` for inline mathematical expressions: `<InlineMath>{"p = mv"}</InlineMath>`
- Use `BlockMath` for displayed equations: `<BlockMath>{"p = mv"}</BlockMath>`
- Include proper units and notation: `<InlineMath>{"v = 25 \\text{ m/s}"}</InlineMath>`

### Units and Notation
- Always include units with numerical values
- Use proper scientific notation when appropriate
- Include significant figures as required by the subject
- Use standard SI units unless otherwise specified

## Content Formatting Guidelines

### Typography
- **Headers**: Use semantic heading levels (h1 for main title, h2-h6 for subsections)
- **Emphasis**: Use `<strong>` for important terms, `<em>` for emphasis
- **Spacing**: Include `className="mb-4"` for consistent paragraph spacing

### Lists and Organization
- Use unordered lists for general information
- Use ordered lists for sequential processes
- Include proper spacing with `space-y-2` or similar classes

### Interactive Elements
- Include hover states for all interactive elements
- Use consistent transition classes: `transition-colors duration-200`
- Provide visual feedback for user interactions

## Accessibility Standards

### Text Alternatives
- Provide descriptive `alt` text for all images
- Include captions for media when appropriate
- Use semantic HTML elements

### Navigation
- Ensure keyboard navigation works for all interactive elements
- Include focus states for all focusable elements
- Provide clear navigation instructions

## Quality Assurance Checklist

### Before Publishing a Lesson:

#### Content Review
- [ ] All learning objectives are clearly stated
- [ ] Content is accurate and up-to-date
- [ ] Spelling and grammar are correct
- [ ] Mathematical expressions are properly formatted

#### Technical Review
- [ ] All imports are correct and necessary
- [ ] Component structure follows template
- [ ] Color schemes are consistent
- [ ] All functions are properly implemented
- [ ] Error handling is included where appropriate

#### Accessibility Review
- [ ] Alt text is provided for images
- [ ] Content is logically organized
- [ ] Navigation is intuitive
- [ ] Focus states are visible

#### Testing
- [ ] Lesson loads without errors
- [ ] All interactive elements work correctly
- [ ] Practice problems display properly
- [ ] Assessments function as expected
- [ ] Responsive design works on mobile devices

## Lesson Placement Guidelines

### Standard Lesson Order
1. **Introduction/Overview** - Course concepts and objectives
2. **Theory Sections** - Core content with examples
3. **Worked Examples** - Step-by-step problem solutions
4. **Practice Problems** - Interactive slideshow(s)
5. **Advanced Practice** - Complex, multi-step problems (if applicable)
6. **Assessment Questions** - Check for understanding
7. **Lesson Summary** - Key takeaways and review

### Practice Problem Slideshow Placement
- **Basic Practice**: Immediately after theory introduction
- **Intermediate Practice**: After worked examples
- **Advanced Practice**: After Example 9 but before LessonSummary
- **Assessment Questions**: Scattered throughout for knowledge checks

## Version Control & Documentation

### Change Documentation
- Document any significant changes in commit messages
- Update lesson metadata when content changes substantially
- Maintain backwards compatibility when possible

### Comments and Documentation
- Include JSDoc comments for complex functions
- Document any unusual implementations
- Explain the purpose of custom state management

## Support and Resources

### Common Issues
- **Import Errors**: Verify all import paths are correct
- **Styling Issues**: Check Tailwind classes and theme consistency
- **Assessment Problems**: Verify courseId and assessmentId format
- **Mathematical Rendering**: Ensure KaTeX imports are included

### Getting Help
- Review existing lesson files for implementation examples
- Check component documentation in `/components/` directories
- Test thoroughly in development environment before deployment

## Database Integration & Course Linking

### Overview
For a lesson to appear in the course interface and be selectable by students, it must be properly linked to the database through the course structure system. This involves three critical steps that must all be completed correctly.

### Required Steps for Database Linking

#### Step 1: Create the Lesson Component File
Create the lesson file following the component structure template (see above).

#### Step 2: Register in Content Registry
Add the lesson to the course's content registry at `src/FirebaseCourses/courses/[COURSE_ID]/content/index.js`:

```javascript
// Import the lesson component
import MomentumTwoDimensions from './lessons/MomentumTwoDimensions';

// Add to the content registry object
const contentRegistry = {
  // ...existing lessons...
  "lesson_1747281779014_814": MomentumTwoDimensions,
  // ...other content...
};
```

#### Step 3: Add to Course Structure (CRITICAL)
**This is the most commonly missed step!** Add the lesson to the course structure file at `src/FirebaseCourses/courses/[COURSE_ID]/structure.json`:

```json
{
  "courseStructure": {
    "courseId": "PHY30",
    "title": "Physics 30",
    "structure": [
      {
        "name": "Unit 1: Momentum and Energy",
        "section": "1",
        "unitId": "unit_momentum_energy",
        "items": [
          {
            "itemId": "lesson_1747281779014_814",
            "title": "Lesson 2 - Momentum in Two Dimensions",
            "type": "lesson",
            "content": "lesson_1747281779014_814"
          }
        ]
      }
    ]
  }
}
```

### Course Structure Object Properties

#### Required Properties for Each Lesson Item:
- **itemId**: Must exactly match the lessonId in your component
- **title**: Display title shown in the course interface
- **type**: Always "lesson" for lesson content
- **content**: Must exactly match the key in the content registry

#### Item Types:
- `"lesson"` - Educational content lessons
- `"assignment"` - Quizzes, homework, projects
- `"exam"` - Major assessments
- `"info"` - Informational content

### How the System Works

#### Data Flow:
1. **Course Component** (`[COURSE_ID]/index.js`) reads `structure.json`
2. **Structure defines** which lessons exist and their order
3. **Content Registry** (`content/index.js`) maps lesson IDs to React components
4. **System renders** the appropriate component based on selection

#### Debug Information:
The course component logs helpful debugging information to the console:
```javascript
console.log("PHY30: Course object:", JSON.stringify(course, null, 2));
console.log("PHY30: Content Registry:", contentRegistry);
```

### Common Linking Issues & Solutions

#### Issue: "Select a lesson to begin" Message
**Symptoms**: Lesson doesn't appear in course interface
**Causes**:
- Missing from `structure.json` (most common)
- ID mismatch between component lessonId and structure itemId
- Missing import in content registry
- Incorrect content registry key

**Solution**: Verify all three steps above are completed correctly

#### Issue: Lesson Appears but Won't Load
**Symptoms**: Lesson shows in list but displays "Content under development"
**Causes**:
- Content registry key doesn't match structure.json content property
- Import statement incorrect in content/index.js
- Component export name mismatch

**Solution**: Check console logs for content registry mapping errors

#### Issue: Wrong Lesson Loads
**Symptoms**: Clicking one lesson loads a different lesson
**Causes**:
- Duplicate itemId in structure.json
- Wrong content property in structure item
- Content registry mapping error

**Solution**: Ensure all IDs are unique and properly mapped

### Verification Checklist

Before publishing a new lesson, verify:

#### Component File:
- [ ] File created in correct directory: `courses/[COURSE_ID]/content/lessons/`
- [ ] lessonId matches the intended ID exactly
- [ ] Component follows naming conventions (PascalCase)
- [ ] Component exports correctly with `export default`

#### Content Registry:
- [ ] Import statement added to `content/index.js`
- [ ] Lesson added to contentRegistry object with correct ID
- [ ] No duplicate keys in content registry
- [ ] Import path is correct

#### Course Structure:
- [ ] Lesson added to appropriate unit in `structure.json`
- [ ] itemId matches lessonId exactly (case-sensitive)
- [ ] content property matches content registry key exactly
- [ ] title is descriptive and appropriate
- [ ] type is set to "lesson"
- [ ] JSON syntax is valid (no trailing commas, proper quotes)

#### Testing:
- [ ] Lesson appears in course lesson list
- [ ] Lesson loads when selected
- [ ] Correct lesson content displays
- [ ] No console errors related to content loading

### Example: Complete Lesson Setup

Given a lesson with ID `lesson_1747281779014_814`:

#### 1. Component File (`MomentumTwoDimensions.js`):
```javascript
return (
  <LessonContent
    lessonId="lesson_1747281779014_814"  // ← This ID
    title="Lesson 2 - Momentum in Two Dimensions"
    metadata={{ estimated_time: '120 minutes' }}
  >
    {/* content */}
  </LessonContent>
);
```

#### 2. Content Registry (`content/index.js`):
```javascript
const contentRegistry = {
  "lesson_1747281779014_814": MomentumTwoDimensions,  // ← Same ID as key
};
```

#### 3. Course Structure (`structure.json`):
```json
{
  "itemId": "lesson_1747281779014_814",     // ← Same ID
  "content": "lesson_1747281779014_814",    // ← Same ID
  "title": "Lesson 2 - Momentum in Two Dimensions",
  "type": "lesson"
}
```

**All three IDs must match exactly for the system to work correctly.**

## Conclusion

Following these standards ensures:
- Consistent user experience across all lessons
- Maintainable and scalable codebase
- Professional presentation of educational content
- Accessible learning materials for all students
- Efficient development and debugging processes

Remember: **Consistency is key** - when in doubt, follow the patterns established in existing high-quality lesson files like `MomentumOneDimension.js` and `IntroToPhysics.js`.
