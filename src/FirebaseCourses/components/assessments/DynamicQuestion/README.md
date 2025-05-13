# Dynamic Question Component

The `DynamicQuestion` component provides a flexible interface for questions that require text input answers, such as math problems, short answer questions, and more. Unlike the `MultipleChoiceQuestion` component, this component uses a text input field rather than radio buttons.

## Features

- Text input field for free-form answers
- Support for question regeneration
- Difficulty level display
- Customizable appearance with themes
- Multiple attempts tracking
- Correct answer display on incorrect submissions
- Real-time feedback
- Integration with Firebase functions for secure assessment

## Usage

```jsx
import { DynamicQuestion } from '../../../../components/assessments';

const LessonContent = () => {
  return (
    <div>
      {/* Lesson content here */}
      
      <DynamicQuestion
        courseId="COM1255"
        assessmentId="intro_dynamic_question"
        cloudFunctionName="COM1255_IntroToELearningDynamic"
        theme="green"
        title="Dynamic Math Question"
        showRegenerate={true}
        onCorrectAnswer={() => console.log("Question answered correctly!")}
      />
    </div>
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `courseId` | string | required | Course identifier |
| `assessmentId` | string | required | Unique identifier for this assessment |
| `cloudFunctionName` | string | required | Name of the cloud function to call |
| `theme` | string | 'green' | Color theme: 'blue', 'green', 'purple', 'amber' |
| `maxAttempts` | number | 5 | Maximum number of attempts allowed (server can override) |
| `showRegenerate` | boolean | true | Whether to show regenerate button after correct answer |
| `title` | string | 'Dynamic Question' | Question title/header |
| `questionClassName` | string | '' | Additional class name for question container |
| `inputClassName` | string | '' | Additional class name for input container |
| `allowRetry` | boolean | true | Allow retry if the answer is wrong |
| `onCorrectAnswer` | function | () => {} | Callback when answer is correct |
| `onAttempt` | function | () => {} | Callback on each attempt |
| `onComplete` | function | () => {} | Callback when all attempts are used |

## Database Structure

The component expects the question data to be stored in the following path:
```
/students/{studentKey}/courses/{courseId}/Assessments/{assessmentId}/
```

Question data should include:
- `questionText`: Text of the question (can include HTML)
- `difficulty`: Difficulty level (beginner, intermediate, advanced)
- `attempts`: Number of attempts made
- `maxAttempts`: Maximum allowed attempts
- `status`: Question status (active, attempted, completed, failed)
- `lastSubmission`: Last answer submission data

## Cloud Function Integration

The dynamic question component works with Firebase Cloud Functions to generate questions and evaluate answers. The cloud function should handle:

1. Question generation with parameters based on difficulty level
2. Answer evaluation with proper feedback
3. Tracking of attempts and scores

For implementation details, see the assessment workflow documentation.