# Lab Template with Save/Load Functionality

This template provides a complete scaffolding for creating a new lab component with persistent save/load functionality.

## Template Files

### 1. `assessments.js` - Cloud Function Configuration
- Pre-configured lab submission function
- Commented configuration options
- Common validation patterns
- Deployment checklist

### 2. `lab-component-template.js` - React Component Template
- Complete save/load functionality
- Auto-save implementation
- Section tracking system
- Progress indicators
- Error handling
- UI components for save/load

### 3. `README.md` - This documentation

## Quick Start

### 1. Copy the Template
```bash
# Create your lab directory
mkdir -p functions/courses/[COURSE_ID]/[LAB_FOLDER]
mkdir -p src/FirebaseCourses/courses/[COURSE_ID]/content/[LAB_FOLDER]

# Copy assessment configuration
cp functions/courses/templates/lab-template/assessments.js \
   functions/courses/[COURSE_ID]/[LAB_FOLDER]/assessments.js

# Copy component template
cp functions/courses/templates/lab-template/lab-component-template.js \
   src/FirebaseCourses/courses/[COURSE_ID]/content/[LAB_FOLDER]/index.js
```

### 2. Customize the Assessment Configuration
Edit `functions/courses/[COURSE_ID]/[LAB_FOLDER]/assessments.js`:

1. Replace all `[PLACEHOLDER]` values
2. Update `requiredSections` to match your lab
3. Adjust `pointsValue` and other settings
4. Remove template comments

### 3. Customize the Component
Edit `src/FirebaseCourses/courses/[COURSE_ID]/content/[LAB_FOLDER]/index.js`:

1. Replace all `[PLACEHOLDER]` values
2. Define your lab's data structure
3. Implement lab-specific functionality
4. Add your lab's content sections
5. Update save/load data mapping

### 4. Deploy and Test
```bash
# Add to functions/index.js
exports.course[COURSE_ID]_[LAB_FUNCTION_NAME] = 
  require('./courses/[COURSE_ID]/[LAB_FOLDER]/assessments').course[COURSE_ID]_[LAB_FUNCTION_NAME];

# Deploy
firebase deploy --only functions:course[COURSE_ID]_[LAB_FUNCTION_NAME]

# Test in your application
```

## Template Features

### ✅ Complete Save/Load System
- Persistent data storage in Firebase
- Auto-save every 30 seconds
- Manual save buttons
- Progress loading on page refresh

### ✅ Section Tracking
- Status tracking for each lab section
- Progress indicators
- Completion percentage calculation

### ✅ User Experience
- Loading indicators
- Save status notifications
- Error handling with user-friendly messages
- Auto-save status indicator

### ✅ Data Validation
- Configurable validation rules
- Size limits to prevent abuse
- Section completion requirements

### ✅ Gradebook Integration
- Automatic grade calculation
- Partial credit support
- Progress-based scoring

## Customization Guide

### Lab Data Structure
The template includes common patterns for different types of labs:

```javascript
// Trial-based labs
const [trialData, setTrialData] = useState([]);

// Calculation labs
const [calculations, setCalculations] = useState({});

// Simulation labs
const [simulationResults, setSimulationResults] = useState({});

// Multi-step labs
const [currentStep, setCurrentStep] = useState(1);
```

### Section Configuration
Update sections to match your lab:

```javascript
// In assessments.js
requiredSections: [
  'hypothesis',
  'procedure',
  'observations',
  'analysis',
  'conclusion'
],

// In component
const [sectionStatus, setSectionStatus] = useState({
  hypothesis: 'not-started',
  procedure: 'not-started',
  observations: 'not-started',
  analysis: 'not-started',
  conclusion: 'not-started'
});
```

### Validation Rules
Add custom validation for your lab:

```javascript
// In assessments.js
customValidator: (labData) => {
  const errors = [];
  
  if (labData.trialData && labData.trialData.length < 3) {
    errors.push('At least 3 trials are required');
  }
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
}
```

## Common Lab Types

### Physics Labs
- Trial data collection
- Error analysis sections
- Calculation verification
- Graph plotting

### Chemistry Labs
- Observation recording
- Reaction data
- Safety procedures
- Results analysis

### Biology Labs
- Data collection
- Image annotations
- Hypothesis testing
- Scientific method

### General Labs
- Step-by-step procedures
- Data recording
- Analysis and conclusion
- Reflection questions

## Best Practices

### 1. Data Organization
- Keep data structures flat when possible
- Use descriptive state variable names
- Group related data together

### 2. Section Design
- Make sections independent when possible
- Provide clear completion criteria
- Include validation for required fields

### 3. User Experience
- Show clear progress indicators
- Provide immediate feedback on saves
- Handle errors gracefully
- Test with slow internet connections

### 4. Performance
- Avoid storing large binary data
- Implement proper loading states
- Use debouncing for auto-save triggers

## Troubleshooting

### Common Issues

1. **"Module not found" errors**
   - Check import path depths in template
   - Verify AuthContext and utils exist

2. **"Required section missing" errors**
   - Ensure requiredSections matches sectionStatus keys
   - Check for typos in section names

3. **Save/load not working**
   - Verify function is deployed
   - Check assessment ID matches between save/load
   - Verify function export in index.js

4. **Auto-save issues**
   - Check useEffect dependencies include all relevant state
   - Verify hasSavedProgress is set after first save

### Debug Tools

1. **Function Logs**
   ```bash
   firebase functions:log --only course[COURSE_ID]_[LAB_FUNCTION_NAME]
   ```

2. **Local Testing**
   ```bash
   firebase emulators:start --only functions,database
   ```

3. **Browser Console**
   - Check for JavaScript errors
   - Monitor network requests
   - Verify authentication status

## Support

For additional help:
1. Review the [step-by-step setup guide](../../docs/guides/ADDING_LAB_SAVE_FEATURE.md)
2. Check the [Lab Submission README](../assessment-types/LAB_SUBMISSION_README.md)
3. Look at existing lab implementations for patterns
4. Test with Firebase emulators before deploying

## Contributing

To improve this template:
1. Test with different lab types
2. Add common patterns you discover
3. Update documentation with new use cases
4. Share feedback on the developer experience