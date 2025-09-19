# Physics Lesson Format Guide

This guide documents the standard format and structure for creating physics lessons based on the pattern established in `03-momentum-two-dimensions/index.js`.

## Table of Contents
- [Overall Structure](#overall-structure)
- [Component Imports](#component-imports)
- [State Management](#state-management)
- [Content Sections](#content-sections)
- [Interactive Elements](#interactive-elements)
- [Practice Problems](#practice-problems)
- [Visual Elements](#visual-elements)
- [Best Practices](#best-practices)

## Overall Structure

Each lesson is a React functional component that follows this general structure:

```javascript
const LessonName = ({ course, courseId = '2' }) => {
  // State declarations
  // Practice problem data
  // Navigation functions
  // useEffect hooks
  
  return (
    <LessonContent
      lessonId="lesson_[timestamp]_[id]"
      title="Lesson X - Topic Name"
      metadata={{ estimated_time: 'XX minutes' }}
    >
      {/* Content sections */}
    </LessonContent>
  );
};
```

## Component Imports

Standard imports for physics lessons:

```javascript
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
```

## State Management

### Collapsible Section States
Each major content section should have its own toggle state:

```javascript
const [isIntroductionOpen, setIsIntroductionOpen] = useState(false);
const [isExample1Open, setIsExample1Open] = useState(false);
const [isExample2Open, setIsExample2Open] = useState(false);
```

### Practice Problem Navigation States
For slideshows of practice problems:

```javascript
const [currentProblemSet1, setCurrentProblemSet1] = useState(0);
const [currentProblemSet2, setCurrentProblemSet2] = useState(0);
```

## Content Sections

### 1. Collapsible Notes/Theory Sections

Use this pattern for theoretical content that can be expanded/collapsed:

```javascript
<TextSection>
  <div className="mb-6">
    <button
      onClick={() => setIsSectionOpen(!isSectionOpen)}
      className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
    >
      <h3 className="text-xl font-semibold">Section Title</h3>
      <span className="text-blue-600">{isSectionOpen ? '▼' : '▶'}</span>
    </button>

    {isSectionOpen && (
      <div className="mt-4">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          {/* Section content */}
        </div>
      </div>
    )}
  </div>
</TextSection>
```

### 2. Information Boxes

Use colored boxes to highlight different types of information:

#### Key Properties Box (Blue)
```javascript
<div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
  <h4 className="font-semibold text-blue-800 mb-3">Key Properties:</h4>
  <div className="space-y-3">
    {/* Numbered items with circular badges */}
  </div>
</div>
```

#### Method/Technique Box (Green)
```javascript
<div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
  <h4 className="font-semibold text-green-800 mb-3">Method Name</h4>
  {/* Method details */}
</div>
```

#### Important Insight Box (Yellow)
```javascript
<div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
  <h4 className="font-semibold text-yellow-800 mb-2">Key Insight:</h4>
  <p className="text-yellow-900">
    {/* Insight text */}
  </p>
</div>
```

### 3. Examples with Solutions

Examples should be collapsible and follow this structure:

```javascript
<TextSection>
  <div className="mb-6">
    <button
      onClick={() => setIsExample1Open(!isExample1Open)}
      className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
    >
      <h3 className="text-xl font-semibold">Example 1 - Description</h3>
      <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
    </button>

    {isExample1Open && (
      <div className="mt-4">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
          <p className="mb-4">{/* Problem statement */}</p>
          
          <div className="bg-white p-4 rounded border border-gray-100">
            <p className="font-medium text-gray-700 mb-4">Solution:</p>
            
            {/* Optional: Vector diagrams */}
            
            <ol className="list-decimal pl-6 space-y-3">
              {/* Step-by-step solution */}
            </ol>
          </div>
        </div>
      </div>
    )}
  </div>
</TextSection>
```

## Practice Problems

### Data Structure
Practice problems should be defined as arrays of objects:

```javascript
const practiceProblems = [
  {
    id: 1,
    question: "Problem statement",
    given: ["Given value 1", "Given value 2"],
    equation: "\\text{LaTeX equation}",
    solution: "\\text{LaTeX solution steps}",
    answer: "Final answer with units"
  },
  // More problems...
];
```

### Practice Problem Display Component

```javascript
<TextSection>
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-green-800 mb-4">Practice Problems</h3>
    <div className="bg-green-50 p-6 rounded-lg border border-green-200">
      {/* Problem Counter and Indicators */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-800">
          Problem {currentProblem + 1} of {problems.length}
        </h4>
        <div className="flex items-center space-x-2">
          {problems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToProblem(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium transition-colors duration-200 ${
                index === currentProblem
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Display with 2x2 Grid */}
      <div className="bg-white rounded-lg border border-green-300 p-6 mb-4">
        {/* Question Box */}
        <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
          <h5 className="font-semibold text-blue-800 mb-2">Question:</h5>
          <p className="text-blue-900">{problems[currentProblem].question}</p>
        </div>

        {/* 2x2 Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Given Values */}
          <div className="bg-gray-50 p-4 rounded border border-gray-200">
            <h5 className="font-semibold text-gray-800 mb-2">Given:</h5>
            <ul className="space-y-1">
              {problems[currentProblem].given.map((item, index) => (
                <li key={index} className="text-gray-700 flex items-center text-sm">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-3"></span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Equation */}
          <div className="bg-purple-50 p-4 rounded border border-purple-200">
            <h5 className="font-semibold text-purple-800 mb-2">Equation:</h5>
            <div className="text-center">
              <BlockMath>{problems[currentProblem].equation}</BlockMath>
            </div>
          </div>

          {/* Solution */}
          <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
            <h5 className="font-semibold text-yellow-800 mb-2">Solution:</h5>
            <div className="text-center">
              <BlockMath>{problems[currentProblem].solution}</BlockMath>
            </div>
          </div>

          {/* Answer */}
          <div className="bg-green-100 p-4 rounded border border-green-300">
            <h5 className="font-semibold text-green-800 mb-2">Answer:</h5>
            <p className="text-green-900 font-medium">
              {problems[currentProblem].answer}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevProblem}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
        >
          <span className="mr-2">←</span>
          Previous
        </button>
        
        <button
          onClick={nextProblem}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200"
        >
          Next
          <span className="ml-2">→</span>
        </button>
      </div>
    </div>
  </div>
</TextSection>
```

### Navigation Functions

```javascript
const nextProblem = () => {
  setCurrentProblem((prev) => (prev + 1) % problems.length);
};

const prevProblem = () => {
  setCurrentProblem((prev) => (prev - 1 + problems.length) % problems.length);
};

const goToProblem = (index) => {
  setCurrentProblem(index);
};
```

## Visual Elements

### SVG Vector Diagrams

Vector diagrams are created using inline SVG with these characteristics:
- Contained within responsive containers
- Use viewBox for scaling
- Include arrow markers for vectors
- Color-coded components (x: green, y: purple, resultant: red/blue)

Example structure:
```javascript
<svg width="100%" height="180" viewBox="0 0 240 180" className="border border-blue-300 bg-white rounded">
  <defs>
    <marker id="arrowId" markerWidth="6" markerHeight="5" refX="5" refY="2.5" orient="auto">
      <polygon points="0 0, 6 2.5, 0 5" fill="#dc2626"/>
    </marker>
  </defs>
  {/* Vector lines and components */}
</svg>
```

### Mathematical Expressions

Use KaTeX for rendering mathematical expressions:
- `<InlineMath>` for inline expressions
- `<BlockMath>` for displayed equations

```javascript
<InlineMath>{'p = mv'}</InlineMath>
<BlockMath>{'\\vec{p}_{total} = \\vec{p}_1 + \\vec{p}_2'}</BlockMath>
```

## Best Practices

### 1. Color Coding
- **Blue**: Primary information, questions, key concepts
- **Green**: Methods, techniques, correct answers
- **Yellow**: Solutions, important notes, warnings
- **Purple**: Equations, mathematical concepts
- **Red**: Important values, emphasis
- **Gray**: Given values, general information

### 2. Responsive Design
- Use `grid-cols-1 md:grid-cols-2` for mobile-friendly layouts
- Ensure SVG diagrams scale properly with viewBox
- Test collapsible sections on mobile devices

### 3. Accessibility
- Include proper heading hierarchy (h3, h4, h5)
- Use semantic HTML elements
- Provide text descriptions for visual elements
- Ensure sufficient color contrast

### 4. Component Organization
- Keep practice problem data separate from render logic
- Use meaningful state variable names
- Group related states together
- Comment complex calculations or logic

### 5. Mathematical Content
- Always escape LaTeX properly in JavaScript strings
- Use `\\text{}` for units in equations
- Be consistent with variable naming conventions
- Include step-by-step solutions for complex problems

## Lesson Summary

Every lesson should end with a `<LessonSummary>` component containing key takeaways:

```javascript
<LessonSummary
  points={[
    "Key concept 1",
    "Key concept 2",
    "Important formula or principle",
    "Application or method",
    "Common pitfall or reminder"
  ]}
/>
```

## Example File Structure

```
/content/
  /[lesson-number]-[lesson-name]/
    index.js          # Main lesson component
    README.md         # Optional lesson-specific notes
```

This format ensures consistency across all physics lessons while providing flexibility for different types of content and interactive elements.