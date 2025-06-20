# Physics 30 Assessment Setup Guide

This guide explains how to create physics calculation questions with KaTeX formatting, randomized variables, and detailed solutions for the Physics 30 course.

## Overview

Physics 30 assessments use a slideshow format with multiple-choice questions that feature:
- **Randomized numerical values** within reasonable ranges
- **KaTeX formatting** for all mathematical expressions
- **Infinite attempts** through question regeneration
- **Detailed solutions** following the GRASSS method (Given, Required, Analysis, Substitute, Solve, Statement)
- **Immediate feedback** after each attempt

## Slideshow Style Guidelines

### Visual Layout

The assessment slideshow follows these specific styling patterns:

#### 1. Container Structure
```jsx
<div className="max-w-4xl mx-auto">
  {/* Question content goes here */}
</div>
```
- Maximum width of 4xl (56rem/896px) centered
- Clean white background with subtle shadows
- Responsive padding that adjusts to screen size

#### 2. Progress Indicator Dots
```jsx
<div className="flex justify-center mb-6">
  <div className="flex space-x-2">
    {[0, 1, 2].map((index) => (
      <button
        key={index}
        onClick={() => setCurrentQuestionIndex(index)}
        className={`w-3 h-3 rounded-full transition-all duration-200 ${
          index === currentQuestionIndex
            ? 'bg-indigo-600 scale-125'  // Active question - scaled up
            : questionResults[`question${index + 1}`] === 'correct'
            ? 'bg-green-500'              // Correct answer
            : questionResults[`question${index + 1}`] === 'incorrect'
            ? 'bg-red-500'                // Incorrect answer
            : 'bg-gray-300 hover:bg-gray-400'  // Unattempted
        }`}
        aria-label={`Go to question ${index + 1}`}
      />
    ))}
  </div>
</div>
```

**Progress Dot States:**
- **Unattempted**: Gray (bg-gray-300)
- **Active**: Indigo with 125% scale (bg-indigo-600 scale-125)
- **Correct**: Green (bg-green-500)
- **Incorrect**: Red (bg-red-500)
- **Size**: 0.75rem (w-3 h-3)
- **Spacing**: 0.5rem between dots (space-x-2)

#### 3. Navigation Controls
```jsx
<div className="flex justify-between items-center mt-6">
  <button
    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
    disabled={currentQuestionIndex === 0}
    className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
      currentQuestionIndex === 0
        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
        : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
    }`}
  >
    <svg className="h-4 w-4 mr-2" /* Previous arrow icon *//>
    Previous
  </button>

  <div className="text-sm text-gray-500">
    Question {currentQuestionIndex + 1} of 3
  </div>

  <button /* Similar structure for Next button */>
    Next
    <svg className="h-4 w-4 ml-2" /* Next arrow icon *//>
  </button>
</div>
```

**Navigation Button Styles:**
- **Enabled**: Indigo background (bg-indigo-100) with darker text (text-indigo-700)
- **Hover**: Darker indigo (hover:bg-indigo-200)
- **Disabled**: Gray background (bg-gray-100) with gray text (text-gray-400)
- **Padding**: px-4 py-2
- **Rounded corners**: rounded-lg
- **Smooth transitions**: transition-all duration-200

#### 4. Question Container
Each question is wrapped in the StandardMultipleChoiceQuestion component with:
- **Theme**: "blue" for Physics 30 (customizable per course)
- **Title**: Clear, descriptive title for each question
- **Callbacks**: onAttempt handler for tracking completion

#### 5. Completion Summary
When all questions are completed:
```jsx
<section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 sm:p-8">
  <h2 className="text-2xl font-bold mb-4 text-center">Knowledge Check Complete</h2>
  {/* Summary content */}
  <button className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg 
    transition-all duration-200 transform hover:scale-105 shadow-lg">
    Continue to Next Lesson →
  </button>
</section>
```

### Physics 30 Theme Colors

For Physics 30, use the "blue" theme throughout:
- **Primary**: Blue-600 (#2563eb)
- **Secondary**: Indigo-700 (#4338ca)
- **Success**: Green-500 (#10b981)
- **Error**: Red-500 (#ef4444)
- **Neutral**: Gray shades

## Architecture

Each assessment requires three components:

1. **Frontend Component** (`src/FirebaseCourses/courses/2/content/[lesson-name]/index.js`)
2. **Backend Functions** (`functions/courses/2/[lesson-name]/assessments.js`)
3. **Function Export** (`functions/index.js`)

## Step-by-Step Setup

### Step 1: Backend Assessment Function

Create the assessment function in `functions/courses/2/[lesson-name]/assessments.js`:

```javascript
const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

// Helper function to generate random values
const generateRandomValues = () => {
  // Generate reasonable random values for the problem
  const velocity = (Math.random() * 2 + 0.5) * 1e5; // 0.5-2.5 × 10^5 m/s
  const distance = Math.random() * 3 + 0.5; // 0.5-3.5 m
  const time = distance / velocity;
  
  return { velocity, distance, time };
};

// Helper function to format numbers in scientific notation
const formatScientific = (num, sigFigs = 2) => {
  if (num === 0) return '0';
  const exponent = Math.floor(Math.log10(Math.abs(num)));
  const mantissa = num / Math.pow(10, exponent);
  return `${mantissa.toFixed(sigFigs - 1)} \\times 10^{${exponent}}`;
};

// Create question pool with randomized values
const createQuestionPool = () => {
  const questions = [];
  
  // Generate multiple versions of the same question type
  for (let i = 0; i < 5; i++) {
    const { velocity, distance, time } = generateRandomValues();
    const timeInMicroseconds = time * 1e6;
    
    // Generate incorrect answers
    const incorrectAnswers = [
      timeInMicroseconds * 10,     // Order of magnitude error
      timeInMicroseconds / 10,      // Order of magnitude error
      timeInMicroseconds * 2,       // Calculation error
      timeInMicroseconds / 2        // Calculation error
    ];
    
    const question = {
      question: `An electron travels at a uniform speed of $${formatScientific(velocity)}$ m/s. How much time is required for the electron to move a distance of ${distance.toFixed(1)} m?`,
      options: [
        {
          text: `$${timeInMicroseconds.toFixed(1)} \\, \\mu\\text{s}$`,
          correct: true,
          feedback: "Correct! You properly applied the formula t = d/v and converted to microseconds."
        },
        {
          text: `$${incorrectAnswers[0].toFixed(1)} \\, \\mu\\text{s}$`,
          correct: false,
          feedback: "Check your calculation. This appears to be off by an order of magnitude."
        },
        {
          text: `$${incorrectAnswers[1].toFixed(1)} \\, \\mu\\text{s}$`,
          correct: false,
          feedback: "This is off by an order of magnitude. Review your unit conversions."
        },
        {
          text: `$${incorrectAnswers[2].toFixed(1)} \\, \\mu\\text{s}$`,
          correct: false,
          feedback: "Check your calculation. Make sure you're using t = d/v correctly."
        }
      ],
      explanation: `
**Detailed Solution:**

**Given:**
- Velocity: $v = ${formatScientific(velocity)}$ m/s
- Distance: $d = ${distance.toFixed(1)}$ m

**Required:**
- Time: $t = ?$

**Formula:**
$$v = \\frac{d}{t}$$

**Rearrange:**
$$t = \\frac{d}{v}$$

**Substitute:**
$$t = \\frac{${distance.toFixed(1)} \\text{ m}}{${formatScientific(velocity)} \\text{ m/s}}$$

**Solve:**
$$t = ${formatScientific(time, 3)} \\text{ s}$$
$$t = ${(time * 1e6).toFixed(1)} \\times 10^{-6} \\text{ s}$$
$$t = ${timeInMicroseconds.toFixed(1)} \\, \\mu\\text{s}$$

**Statement:**
The electron requires ${timeInMicroseconds.toFixed(1)} microseconds to travel ${distance.toFixed(1)} m.
      `
    };
    
    questions.push(question);
  }
  
  return questions;
};

// Export assessment functions for each question in the slideshow
exports.course2_[lesson_name]_question1 = createStandardMultipleChoice({
  questionPool: createQuestionPool(),
  config: {
    maxAttempts: 999,        // Infinite attempts
    pointsValue: 1,
    showFeedback: true,
    enableHints: true,
    attemptPenalty: 0,
    theme: 'blue',
    randomizeQuestions: true,
    randomizeOptions: true,
    allowSameQuestion: false,
    showExplanationAfterCorrect: true,
    showExplanationAfterIncorrect: true
  },
  metadata: {
    courseId: '2',
    lessonId: '[lesson-name]',
    assessmentId: '[lesson_name]_question1',
    title: 'Kinematics Calculation - Question 1',
    description: 'Calculate time from velocity and distance',
    activityType: 'lesson'
  }
});

// Repeat for additional questions in the slideshow
exports.course2_[lesson_name]_question2 = createStandardMultipleChoice({
  // Different question type with similar structure
});

exports.course2_[lesson_name]_question3 = createStandardMultipleChoice({
  // Another question type
});
```

### Step 2: Frontend Component

Add the assessment slideshow to your lesson in `src/FirebaseCourses/courses/2/content/[lesson-name]/index.js`:

```javascript
import React, { useState } from 'react';
import StandardMultipleChoiceQuestion from '../../../components/assessments/StandardMultipleChoiceQuestion';

const KnowledgeCheck = ({ courseId }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState({
    question1: false,
    question2: false,
    question3: false
  });
  const [questionResults, setQuestionResults] = useState({
    question1: null,
    question2: null,
    question3: null
  });

  const allQuestionsCompleted = Object.values(questionsCompleted).every(completed => completed);

  const questions = [
    {
      id: 'question1',
      assessmentId: '[lesson_name]_question1',
      cloudFunctionName: 'course2_[lesson_name]_question1',
      title: 'Kinematics Calculation - Question 1'
    },
    {
      id: 'question2',
      assessmentId: '[lesson_name]_question2',
      cloudFunctionName: 'course2_[lesson_name]_question2',
      title: 'Kinematics Calculation - Question 2'
    },
    {
      id: 'question3',
      assessmentId: '[lesson_name]_question3',
      cloudFunctionName: 'course2_[lesson_name]_question3',
      title: 'Kinematics Calculation - Question 3'
    }
  ];

  const handleQuestionAttempt = (questionId, isCorrect) => {
    if (isCorrect) {
      setQuestionsCompleted(prev => ({
        ...prev,
        [questionId]: true
      }));
    }
    setQuestionResults(prev => ({
      ...prev,
      [questionId]: isCorrect ? 'correct' : 'incorrect'
    }));
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check</h2>
        <p className="text-gray-600">
          Test your understanding of physics calculations with these practice problems.
        </p>
      </div>

      {/* Progress Indicator */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-2">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestionIndex(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentQuestionIndex
                  ? 'bg-blue-600 scale-125'
                  : questionResults[`question${index + 1}`] === 'correct'
                  ? 'bg-green-500'
                  : questionResults[`question${index + 1}`] === 'incorrect'
                  ? 'bg-red-500'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to question ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Question Display */}
      <div className="relative">
        {currentQuestionIndex === 0 && (
          <StandardMultipleChoiceQuestion
            courseId={courseId}
            assessmentId={questions[0].assessmentId}
            cloudFunctionName={questions[0].cloudFunctionName}
            title={questions[0].title}
            theme="blue"
            onAttempt={(isCorrect) => handleQuestionAttempt('question1', isCorrect)}
          />
        )}
        
        {currentQuestionIndex === 1 && (
          <StandardMultipleChoiceQuestion
            courseId={courseId}
            assessmentId={questions[1].assessmentId}
            cloudFunctionName={questions[1].cloudFunctionName}
            title={questions[1].title}
            theme="blue"
            onAttempt={(isCorrect) => handleQuestionAttempt('question2', isCorrect)}
          />
        )}
        
        {currentQuestionIndex === 2 && (
          <StandardMultipleChoiceQuestion
            courseId={courseId}
            assessmentId={questions[2].assessmentId}
            cloudFunctionName={questions[2].cloudFunctionName}
            title={questions[2].title}
            theme="blue"
            onAttempt={(isCorrect) => handleQuestionAttempt('question3', isCorrect)}
          />
        )}
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
          disabled={currentQuestionIndex === 0}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentQuestionIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <div className="text-sm text-gray-500">
          Question {currentQuestionIndex + 1} of 3
        </div>

        <button
          onClick={() => setCurrentQuestionIndex(Math.min(2, currentQuestionIndex + 1))}
          disabled={currentQuestionIndex === 2}
          className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            currentQuestionIndex === 2
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
          }`}
        >
          Next
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Completion Summary - Only show when all questions are completed */}
      {allQuestionsCompleted && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 sm:p-8 mt-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Knowledge Check Complete! 🎉</h2>
          
          <div className="text-center mb-6">
            <p className="text-lg">
              Great work! You've completed all practice problems in this section.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <h3 className="font-semibold mb-2">Your Results:</h3>
            <div className="space-y-1">
              {questions.map((question, index) => (
                <div key={question.id} className="flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                    questionResults[question.id] === 'correct' ? 'bg-green-500' : 'bg-red-500'
                  }`}>
                    {questionResults[question.id] === 'correct' ? '✓' : '✗'}
                  </span>
                  <span>Question {index + 1}: {questionResults[question.id] === 'correct' ? 'Correct' : 'Incorrect'}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

// In your lesson component:
const LessonContent = ({ courseId }) => {
  return (
    <div>
      {/* Other lesson content */}
      
      <KnowledgeCheck courseId={courseId} />
      
      {/* More lesson content */}
    </div>
  );
};
```

### Step 3: Export Functions

Add exports to `functions/index.js`:

```javascript
// Physics 30 - [Lesson Name] Assessments
exports.course2_[lesson_name]_question1 = require('./courses/2/[lesson-name]/assessments').course2_[lesson_name]_question1;
exports.course2_[lesson_name]_question2 = require('./courses/2/[lesson-name]/assessments').course2_[lesson_name]_question2;
exports.course2_[lesson_name]_question3 = require('./courses/2/[lesson-name]/assessments').course2_[lesson_name]_question3;
```

## KaTeX Formatting Guidelines

### Common Physics Expressions

```javascript
// Variables
`$v$`                          // velocity
`$d$` or `$\\Delta x$`         // distance/displacement
`$t$` or `$\\Delta t$`         // time
`$a$`                          // acceleration
`$F$`                          // force
`$m$`                          // mass
`$E_k$`                        // kinetic energy
`$E_p$`                        // potential energy

// Units
`$\\text{m/s}$`                // meters per second
`$\\text{m/s}^2$`              // meters per second squared
`$\\mu\\text{s}$`              // microseconds
`$\\text{N}$`                  // Newtons
`$\\text{J}$`                  // Joules

// Scientific Notation
`$1.5 \\times 10^{5}$`         // 1.5 × 10^5
`$3.0 \\times 10^{-8}$`        // 3.0 × 10^-8

// Equations
`$$v = \\frac{d}{t}$$`         // velocity equation
`$$F = ma$$`                   // Newton's second law
`$$E_k = \\frac{1}{2}mv^2$$`   // kinetic energy
```

### Formatting in Questions

Always wrap mathematical expressions in KaTeX delimiters:
- Inline math: `$expression$`
- Display math: `$$expression$$`

Example:
```javascript
question: `A car accelerates from rest at $${acceleration.toFixed(1)} \\, \\text{m/s}^2$ for ${time.toFixed(1)} s. What is its final velocity?`
```

## Question Types for Physics 30

### 1. Kinematics Problems
- Velocity, acceleration, displacement calculations
- Motion graphs interpretation
- Free fall problems

### 2. Dynamics Problems
- Force calculations
- Newton's laws applications
- Friction and tension problems

### 3. Energy and Momentum
- Conservation of energy
- Conservation of momentum
- Collisions (elastic/inelastic)

### 4. Waves and Optics
- Wave properties
- Reflection and refraction
- Lens and mirror calculations

### 5. Electricity and Magnetism
- Electric fields and forces
- Circuit analysis
- Magnetic field calculations

## Best Practices

### 1. Randomization Ranges
Choose physically reasonable ranges:
```javascript
// Good ranges for common quantities
const velocity = Math.random() * 50 + 10;        // 10-60 m/s (car speeds)
const mass = Math.random() * 900 + 100;          // 100-1000 kg (vehicle masses)
const acceleration = Math.random() * 8 + 2;      // 2-10 m/s² (typical accelerations)
```

### 2. Significant Figures
Maintain consistent significant figures:
```javascript
const sigFigs = (num, figs) => {
  return Number(num.toPrecision(figs));
};
```

### 3. Unit Conversions
Include unit conversion challenges:
```javascript
const kmhToMs = (kmh) => kmh / 3.6;
const msToKmh = (ms) => ms * 3.6;
```

### 4. Error Checking
Validate generated values:
```javascript
if (calculatedAnswer < 0 && physicalQuantityShouldBePositive) {
  // Regenerate values
}
```

## Testing Your Assessment

1. **Test Randomization**: Regenerate questions multiple times to ensure all values are reasonable
2. **Check KaTeX Rendering**: Verify all mathematical expressions display correctly
3. **Validate Solutions**: Manually calculate several generated problems
4. **Test Edge Cases**: Ensure no division by zero or negative square roots
5. **Review Feedback**: Confirm feedback messages are helpful and accurate

## Common Issues and Solutions

### Issue: KaTeX Not Rendering
**Solution**: Ensure all special characters are properly escaped:
```javascript
// Wrong
`$\times$`

// Correct
`$\\times$`
```

### Issue: Inconsistent Decimal Places
**Solution**: Use consistent formatting:
```javascript
const formatAnswer = (num) => {
  if (num < 0.01) return num.toExponential(2);
  if (num > 1000) return num.toExponential(2);
  return num.toFixed(2);
};
```

### Issue: Unrealistic Values
**Solution**: Add validation:
```javascript
const generateRealisticSpeed = () => {
  let speed;
  do {
    speed = Math.random() * 100;
  } while (speed < 5); // Ensure minimum speed
  return speed;
};
```

## Example: Complete Projectile Motion Question

```javascript
const createProjectileQuestion = () => {
  const angle = Math.round(Math.random() * 60 + 15); // 15-75 degrees
  const v0 = Math.round(Math.random() * 30 + 20);    // 20-50 m/s
  const g = 9.81;
  
  const vx = v0 * Math.cos(angle * Math.PI / 180);
  const vy = v0 * Math.sin(angle * Math.PI / 180);
  const timeToMax = vy / g;
  const maxHeight = (vy * vy) / (2 * g);
  const totalTime = 2 * timeToMax;
  const range = vx * totalTime;
  
  return {
    question: `A projectile is launched at an angle of ${angle}° above the horizontal with an initial velocity of ${v0} m/s. What is the maximum height reached? (Use $g = 9.81 \\, \\text{m/s}^2$)`,
    correctAnswer: maxHeight,
    explanation: `
**Given:**
- Initial velocity: $v_0 = ${v0}$ m/s
- Launch angle: $\\theta = ${angle}°$
- Gravitational acceleration: $g = 9.81$ m/s²

**Required:**
- Maximum height: $h_{max} = ?$

**Formula:**
$$h_{max} = \\frac{(v_0 \\sin\\theta)^2}{2g}$$

**Substitute:**
$$h_{max} = \\frac{(${v0} \\times \\sin(${angle}°))^2}{2 \\times 9.81}$$
$$h_{max} = \\frac{(${v0} \\times ${(Math.sin(angle * Math.PI / 180)).toFixed(3)})^2}{19.62}$$
$$h_{max} = \\frac{${vy.toFixed(1)}^2}{19.62}$$

**Solve:**
$$h_{max} = ${maxHeight.toFixed(1)} \\text{ m}$$

**Statement:**
The projectile reaches a maximum height of ${maxHeight.toFixed(1)} m.
    `
  };
};
```

## Deployment Checklist

- [ ] Create assessment functions with proper randomization
- [ ] Add KaTeX formatting to all mathematical expressions
- [ ] Implement detailed solutions following GRASSS format
- [ ] Export functions in `functions/index.js`
- [ ] Create frontend slideshow component
- [ ] Test randomization ranges
- [ ] Verify KaTeX rendering
- [ ] Validate calculations
- [ ] Deploy functions: `firebase deploy --only functions`
- [ ] Test in development environment
- [ ] Monitor for any errors in production