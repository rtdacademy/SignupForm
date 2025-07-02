# Lab Submission Assessment Module

## Overview

The Lab Submission module provides a comprehensive system for saving and loading student lab work in Firebase. It handles data persistence, validation, progress tracking, and gradebook integration for laboratory activities.

## Architecture

### System Components

```
┌─────────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Lab Component     │────▶│  Cloud Function      │────▶│  Firebase DB    │
│  (React Frontend)   │◀────│  (lab-submission.js) │◀────│  (Realtime)     │
└─────────────────────┘     └──────────────────────┘     └─────────────────┘
         │                            │                            │
         │                            │                            │
         ▼                            ▼                            ▼
   User Interface            Business Logic              Data Storage
   - Save/Load buttons       - Validation               - Student progress
   - Auto-save              - Completion calc          - Gradebook scores
   - Status indicators      - Grade calculation        - Version history
```

### Data Flow

1. **Save Operation**:
   - Student works on lab → Component collects data → Calls cloud function
   - Function validates data → Calculates completion → Saves to database
   - Updates gradebook → Returns success status

2. **Load Operation**:
   - Component requests data → Function retrieves from database
   - Returns lab data → Component restores state → Student continues work

## Configuration Options

### Basic Configuration

```javascript
exports.course_lab_name = createLabSubmission({
  // Required Configuration
  labTitle: 'Lab Name',           // Display name for the lab
  labType: 'physics',             // Type: 'physics', 'chemistry', 'biology', 'general'
  activityType: 'lab',            // Type: 'lab', 'experiment', 'simulation'
  
  // Section Requirements
  requiredSections: [             // Sections that must be in the lab
    'hypothesis',
    'procedure',
    'observations',
    'analysis',
    'conclusion'
  ],
  
  // Grading Configuration
  pointsValue: 10,                // Total points for the lab
  allowPartialCredit: true,       // Award points for partial completion
  completionThreshold: 80,        // Percentage required for full credit
});
```

### Advanced Configuration

```javascript
exports.course_lab_name = createLabSubmission({
  // ... basic configuration ...
  
  // Validation Settings
  validateData: true,             // Enable data structure validation
  maxDataSize: 2,                 // Maximum data size in MB
  allowedFileTypes: ['jpg', 'png', 'pdf'], // For future file upload support
  
  // Auto-save Settings
  autoSaveInterval: 30,           // Interval in seconds (used by frontend)
  
  // Cloud Function Settings
  region: 'us-central1',          // Firebase region
  timeout: 120,                   // Function timeout in seconds
  memory: '512MiB',               // Memory allocation
  
  // Custom Validation (optional)
  customValidator: (labData) => {
    // Custom validation logic
    return { isValid: true, errors: [] };
  }
});
```

## Data Structure

### Expected Lab Data Format

```javascript
{
  // Section tracking (recommended)
  sectionStatus: {
    hypothesis: 'completed',     // 'not-started', 'in-progress', 'completed'
    procedure: 'completed',
    observations: 'in-progress',
    analysis: 'not-started',
    conclusion: 'not-started'
  },
  
  // Section content
  sectionContent: {
    hypothesis: 'Text content...',
    conclusion: 'Text content...'
  },
  
  // Lab-specific data
  trialData: { /* trial results */ },
  calculations: { /* computed values */ },
  
  // Metadata
  labStarted: true,
  currentSection: 'observations',
  timestamp: '2024-01-20T10:30:00Z'
}
```

### Database Structure

```
students/
  └── {studentKey}/
      └── courses/
          └── {courseId}/
              └── Assessments/
                  └── {assessmentId}/
                      ├── labData: { ... }
                      ├── completionPercentage: 75
                      ├── status: 'in-progress'
                      ├── version: 3
                      ├── timestamp: ...
                      └── lastModified: ...
```

## Validation System

### Built-in Validation

The module provides automatic validation for:

1. **Data Structure**: Ensures labData is a valid object
2. **Required Sections**: Checks for presence of required sections
3. **Data Size**: Prevents excessively large submissions
4. **Type Checking**: Validates data types for known fields

### Custom Validation

You can add custom validation logic:

```javascript
customValidator: (labData) => {
  const errors = [];
  
  // Example: Validate trial data
  if (labData.trialData && labData.trialData.length < 3) {
    errors.push('At least 3 trials are required');
  }
  
  // Example: Validate calculations
  if (labData.calculations && !labData.calculations.average) {
    errors.push('Average calculation is missing');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

## Completion Calculation

### Default Algorithm

1. If `sectionStatus` exists:
   - Counts sections marked as 'completed'
   - Percentage = (completed sections / total sections) × 100

2. If using `requiredSections`:
   - Checks which required sections have content
   - Percentage = (sections with content / required sections) × 100

3. Fallback:
   - Counts non-empty fields in labData
   - Estimates completion based on data presence

### Custom Completion Logic

Override the default calculation:

```javascript
calculateCompletion: (labData) => {
  let score = 0;
  
  // Custom scoring logic
  if (labData.hypothesis) score += 20;
  if (labData.trialData?.length >= 3) score += 40;
  if (labData.analysis) score += 40;
  
  return Math.min(score, 100);
}
```

## Gradebook Integration

### Automatic Updates

- Grade updates when completion percentage changes
- Supports partial credit based on completion
- Best score policy (keeps highest score)
- Integrates with course gradebook system

### Score Calculation

```javascript
if (allowPartialCredit) {
  score = Math.round((completionPercentage / 100) * pointsValue);
} else {
  score = completionPercentage >= completionThreshold ? pointsValue : 0;
}
```

## Error Handling

### Common Errors and Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Lab data validation failed" | Missing required sections | Ensure all required sections are in sectionStatus |
| "Maximum data size exceeded" | Lab data too large | Increase maxDataSize or reduce data |
| "Missing required parameter" | Missing function params | Check all required parameters are sent |
| "INTERNAL" | Server error | Check function logs for details |

## Best Practices

### 1. Data Structure Design
- Use `sectionStatus` for tracking progress
- Keep data organized and flat when possible
- Include timestamps for important events

### 2. Validation
- List all expected sections in `requiredSections`
- Set appropriate `maxDataSize` limits
- Add custom validation for lab-specific rules

### 3. User Experience
- Implement auto-save on the frontend
- Show clear save/load status to users
- Handle errors gracefully with user-friendly messages

### 4. Performance
- Avoid storing large binary data directly
- Use references for images/files (future feature)
- Implement debouncing for auto-save

## Security Considerations

1. **Authentication**: Function requires authenticated users
2. **Data Validation**: All data is validated before storage
3. **Size Limits**: Prevents abuse through data size limits
4. **Sanitization**: Student keys are sanitized for database paths
5. **Access Control**: Students can only access their own data

## Future Enhancements

- File upload support for lab photos/documents
- Collaborative labs with shared data
- Lab templates with pre-configured sections
- Export functionality for lab reports
- Peer review system for lab work

## Troubleshooting

### Enable Logging

Add console.log statements in the cloud function:

```javascript
console.log('Lab submission parameters:', {
  operation,
  courseId,
  assessmentId,
  hasLabData: !!labData
});
```

### Check Firebase Console

1. Go to Firebase Console → Functions → Logs
2. Look for your function execution
3. Check for error messages or stack traces

### Verify Deployment

```bash
firebase deploy --only functions:course_lab_name
```

### Test Locally

Use Firebase emulators for local testing:

```bash
firebase emulators:start --only functions,database
```

## Support

For issues or questions:
1. Check the step-by-step setup guide
2. Review the quick reference card
3. Look for similar patterns in existing labs
4. Check Firebase function logs for errors