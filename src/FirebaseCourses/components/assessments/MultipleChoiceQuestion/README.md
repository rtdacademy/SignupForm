# Multiple Choice Question Component

A reusable assessment component that integrates with Firebase Cloud Functions for secure assessment handling. This component provides a modern, animated user interface for multiple choice questions with support for randomization, regeneration, and attempt tracking.

## Features

- **Secure Assessment Handling**: Uses Firebase Cloud Functions to keep question logic and answers on the server
- **Modern UI with Animations**: Uses Framer Motion for smooth transitions and loading animations
- **Customizable Themes**: Choose from multiple color themes (blue, green, purple, amber, red, gray)
- **Randomized Answers**: Options are displayed in a random order (determined by the cloud function)
- **Progress Tracking**: Shows number of attempts and provides helpful feedback
- **Answer Regeneration**: Option to regenerate questions for additional practice
- **Persistence**: Saves and restores the student's previous answers when returning to the page

## Installation

The component is already included in the project. Make sure you have the required dependencies:

- framer-motion: For animations
- Firebase (functions, database): For cloud function integration and data storage

## Usage

```jsx
import { MultipleChoiceQuestion } from '../../components/assessments';

const MyComponent = () => {
  return (
    <MultipleChoiceQuestion 
      courseId="COM1255"
      assessmentId="question_id_1"
      cloudFunctionName="COM1255_IntroToELearningQ1"
      theme="blue"
      onCorrectAnswer={() => console.log("Correct!")}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| courseId | string | Required | Course identifier |
| assessmentId | string | Required | Unique identifier for this assessment |
| cloudFunctionName | string | Required | Name of the cloud function to call |
| theme | string | 'blue' | Color theme: 'blue', 'green', 'purple', 'amber', 'red', 'gray' |
| maxAttempts | number | 3 | Maximum number of attempts allowed (server can override) |
| showRegenerate | boolean | true | Whether to show regenerate button after correct answer |
| title | string | 'Multiple Choice Question' | Question title/header |
| questionClassName | string | '' | Additional class name for question container |
| optionsClassName | string | '' | Additional class name for options container |
| allowRetry | boolean | true | Allow retry if the answer is wrong |
| onCorrectAnswer | function | () => {} | Callback when answer is correct |
| onAttempt | function | () => {} | Callback on each attempt |
| onComplete | function | () => {} | Callback when all attempts are used |

## Cloud Function Requirements

The component expects the cloud function to follow a specific protocol:

1. **Generation Operation**: The function should accept a 'generate' operation with the following parameters:
   - courseId: Course identifier
   - assessmentId: Assessment identifier
   - operation: 'generate'
   - studentEmail: Student's email address
   - userId: Student's user ID

2. **Evaluation Operation**: The function should accept an 'evaluate' operation with:
   - courseId: Course identifier
   - assessmentId: Assessment identifier  
   - operation: 'evaluate'
   - answer: Student's selected answer
   - studentEmail: Student's email address
   - userId: Student's user ID

The function should store the question data and evaluation results in the Firebase Realtime Database at:
`students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}`

## Example

See the `example.js` file for detailed examples of using this component with different configurations.

## Database Structure

The component expects the following database structure:

```
students/
  {studentKey}/
    courses/
      {courseId}/
        Assessments/
          {assessmentId}/
            timestamp: number
            questionText: string
            options: array
              - id: string
              - text: string
            seed: number
            attempts: number
            status: string ('active', 'attempted', 'completed', 'failed')
            maxAttempts: number
            lastSubmission: object (optional)
              - timestamp: number
              - answer: string
              - isCorrect: boolean
              - feedback: string
```

## Customization

You can customize the component in several ways:

1. **Themes**: Choose from preset color themes or modify the `styles.js` file to add new themes
2. **Layout**: Use the `questionClassName` and `optionsClassName` props to customize the layout
3. **Animations**: Modify the animation variants in the `styles.js` file
4. **Behavior**: Control regeneration and retry behavior with props

## Animations

The component uses Framer Motion for animations:

- Loading state: Pulsing animation for the placeholder content
- Question entry: Fade and slide up animation
- Options: Staggered entry animation
- Hover effects: Slight scale increase on hover
- Feedback: Slide up and fade in animation