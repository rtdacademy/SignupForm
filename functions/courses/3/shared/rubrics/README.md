# Assessment Rubrics

This directory contains standardized rubrics for long answer assessments across different subjects and topics.

## Structure

Each rubric file exports rubrics for different difficulty levels (beginner, intermediate, advanced) with consistent scoring criteria.

### Standard Format

All rubrics use a 4-level scoring system:
- **3 points**: Excellent - Meets all expectations
- **2 points**: Good - Minor gaps or issues  
- **1 point**: Satisfactory - Basic understanding but lacking
- **0 points**: Not Met - Significant errors or missing

### Rubric Schema

```javascript
{
  criterion: "Name of Criterion",
  points: 3,
  description: "Brief description of what this criterion evaluates",
  levels: {
    3: "Description for excellent performance",
    2: "Description for good performance",
    1: "Description for satisfactory performance",
    0: "Description for not meeting expectations"
  }
}
```

## Usage

### Importing Rubrics

```javascript
// Import specific rubric
const { MOMENTUM_RUBRICS } = require('../shared/rubrics');

// Use in assessment configuration
exports.myAssessment = createAILongAnswer({
  rubrics: MOMENTUM_RUBRICS,
  // ... other config
});
```

### Creating New Rubrics

1. Create a new file in this directory (e.g., `kinematics-rubrics.js`)
2. Follow the existing format with 4 criteria × 3 points = 12 total points
3. Export the rubrics object
4. Add the export to `index.js`

### Guidelines for Writing Rubrics

1. **Be Specific**: Each level should have clear, measurable criteria
2. **Progressive**: Each level should build on the previous one
3. **Observable**: Focus on what can be observed in student work
4. **Consistent**: Use similar language patterns across criteria
5. **Subject-Appropriate**: Tailor language to the subject matter

## Benefits

- **Consistency**: Same rubric for all questions at each difficulty level
- **Transparency**: Students know exactly what's expected
- **Fair Evaluation**: AI and human graders use identical criteria
- **Reusability**: Rubrics can be shared across multiple assessments