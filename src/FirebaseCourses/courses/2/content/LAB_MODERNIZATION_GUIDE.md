# Lab Modernization Guide
## Converting Legacy Labs to Modern Firebase/React Pattern

Based on the modernization of Lab 2 - Mirrors and Lenses, this guide outlines the systematic process for updating any lab to the current standard.

## Overview of Changes Needed

### 1. **Database Integration Pattern**
- **Current Legacy**: Uses cloud functions with custom save/load operations
- **New Standard**: Uses Firebase Realtime Database with direct integration
- **Key Changes Needed**:
  - Replace cloud function calls with `getDatabase()`, `ref()`, `update()`, `onValue()`
  - Add `serverTimestamp()` for tracking modifications
  - Use `useAuth()` context for user identification
  - Implement memoized database references to prevent re-creation

### 2. **State Management Modernization**
- **Current Legacy**: Multiple separate useState hooks for different data types with complex auto-save mechanisms
- **New Standard**: Consolidated state with direct Firebase Realtime Database integration
- **Key Changes Needed**:
  - Combine related state into logical groupings (sectionStatus, sectionContent, observationData, etc.)
  - Use callback-based state updates for complex operations
  - Implement immediate Firebase saving on state changes using direct database connections
  - **IMPORTANT**: Simplify auto-saving by directly updating Firebase on state changes, avoiding complex intermediate save mechanisms

### 3. **Lab Structure Standardization**
- **Current Legacy**: Variable section names and organization
- **New Standard**: Consistent 7-section pattern
- **Required Sections**:
  1. **Introduction** - Lab overview and objectives (auto-completed when lab starts)
  2. **Equipment** - Method selection (simulation vs. physical)
  3. **Procedure** - Instructions with confirmation checkbox
  4. **Simulation** - Interactive component with data collection
  5. **Observations** - Data tables with real-time validation
  6. **Analysis** - Calculations and interpretation
  7. **Post-Lab** - Reflection questions

### 4. **UI Component Modernization**
- **Current Legacy**: Custom navigation and progress tracking
- **New Standard**: Standardized navigation bar with progress indicators
- **Key Components**:
  - Sticky navigation header with section buttons
  - Color-coded progress indicators (green=completed, yellow=in-progress, gray=not-started)
  - Auto-save indicator in top-right corner
  - Print PDF functionality
  - PostSubmissionOverlay component

### 5. **Simulation Integration Pattern**
- **Current Legacy**: Simulation components with custom data flow
- **New Standard**: Standardized simulation component with callback pattern
- **Key Features**:
  - `onDataCollected` callback prop for parent communication
  - Multiple simulation parts/modes within single component
  - Real-time data validation and feedback
  - Visual simulation with canvas or SVG rendering

### 6. **AI Assistant Integration**
- **Current Legacy**: No AI assistant support
- **New Standard**: Comprehensive AI prompt file with guidance-focused approach
- **Required Components**:
  - Create `ai-prompt.js` file with structured prompt object
  - Import physics reference sheets
  - Define guidance-only instructions (no direct answers)
  - Include lab-specific troubleshooting scenarios
  - Add context keywords for topic detection

## Detailed Implementation Steps

### Step 1: Create AI Prompt File
```javascript
// File: ai-prompt.js
import { physics20Level, aiFormattingGuidelines } from '../../physics30-reference-sheet.js';

export const aiPrompt = {
  instructions: `GUIDANCE-ONLY approach...`,
  conversationHistory: (studentName = '') => [...],
  contextKeywords: [...],
  difficulty: 'intermediate-conceptual',
  referenceData: `...`,
  aiConfig: {
    model: 'FLASH_LITE',
    temperature: 'BALANCED',
    maxTokens: 'MEDIUM'
  },
  chatConfig: {
    showYouTube: false,
    showUpload: true,
    allowContentRemoval: true,
    showResourcesAtTop: false
  }
};
```

**IMPORTANT**: After completing all lab modernization steps, ensure you add the AI prompt for the lesson by:
1. Creating the `ai-prompt.js` file in the lesson's directory
2. Importing it in the main `index.js` file: `import { aiPrompt } from './ai-prompt';`
3. Adding it to the exported lesson object at the end of `index.js`

### Step 2: Update Database Integration
```javascript
// Replace cloud function patterns with DIRECT Firebase Realtime Database connections:
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';

const database = getDatabase();
const labDataRef = React.useMemo(() => {
  return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
}, [currentUser?.uid, database, courseId, questionId]);

// SIMPLIFIED AUTO-SAVE: Direct database updates on state changes
const saveToFirebase = useCallback(async (dataToUpdate) => {
  if (!currentUser?.uid || !labDataRef) return;
  
  const dataToSave = {
    ...dataToUpdate,
    lastModified: serverTimestamp(),
    courseId: courseId,
    labId: 'lab-name-here'
  };
  
  // Direct update to Firebase - no intermediate mechanisms
  await update(labDataRef, dataToSave);
}, [currentUser?.uid, labDataRef, courseId]);

// Example: Save immediately when data changes
const updateObservationData = (field, value) => {
  const newData = { ...observationData, [field]: value };
  setObservationData(newData);
  saveToFirebase({ observationData: newData }); // Direct save
};
```

### Step 3: Standardize Lab Sections
```javascript
const [sectionStatus, setSectionStatus] = useState({
  introduction: 'not-started',
  equipment: 'not-started', 
  procedure: 'not-started',
  simulation: 'not-started',
  observations: 'not-started',
  analysis: 'not-started',
  postlab: 'not-started'
});
```

### Step 4: Implement Modern Navigation
```jsx
<div className="sticky top-14 z-10 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-md">
  <div className="flex items-center justify-between">
    <h3 className="text-base font-semibold text-gray-800">Lab Progress</h3>
    <div className="flex gap-1 flex-wrap">
      {sections.map(section => (
        <button
          key={section.key}
          onClick={() => scrollToSection(section.key)}
          className={`px-3 py-1 text-xs font-medium rounded border ${getStatusColor(sectionStatus[section.key])}`}
        >
          {section.label}
        </button>
      ))}
    </div>
  </div>
</div>
```

### Step 5: Update Submission System
```javascript
const submitLab = async () => {
  try {
    setIsSaving(true);
    await saveToFirebase({ /* current lab data */ });
    
    const functions = getFunctions();
    const submitFunction = httpsCallable(functions, 'course2_lab_submit');
    
    const result = await submitFunction({
      questionId: questionId,
      studentEmail: currentUser.email,
      userId: currentUser.uid,
      courseId: courseId,
      isStaff: isStaffView
    });
    
    if (result.data.success) {
      setShowSubmissionOverlay(true);
      toast.success('Lab submitted successfully!');
    }
  } catch (error) {
    toast.error(`Failed to submit lab: ${error.message}`);
  } finally {
    setIsSaving(false);
  }
};
```

### Step 6: Add PostSubmissionOverlay
```jsx
<PostSubmissionOverlay
  isVisible={showSubmissionOverlay || isSubmitted}
  isStaffView={isStaffView}
  course={course}
  questionId={questionId}
  submissionData={{
    labTitle: 'Lab Name Here',
    completionPercentage: completedCount * (100 / totalSections),
    status: isSubmitted ? 'completed' : 'in-progress',
    timestamp: course?.Assessments?.[questionId]?.timestamp || new Date().toISOString()
  }}
  onContinue={() => {}}
  onViewGradebook={() => {}}
  onClose={() => setShowSubmissionOverlay(false)}
/>
```

## Lab-Specific Considerations

### For Each Lab, Identify:
1. **Unique Simulation Requirements**: What interactive elements are needed?
2. **Data Collection Pattern**: What measurements and calculations are involved?
3. **Validation Logic**: How to provide real-time feedback on correctness?
4. **Equipment Variations**: Simulation vs. physical equipment differences?
5. **Analysis Methods**: What calculation approaches are appropriate?

### Common Patterns to Implement:
- **Real-time validation** with green highlighting for correct answers
- **Auto-calculation** of derived values when possible
- **Progress tracking** based on completion percentage
- **Auto-save** functionality every 30 seconds
- **Section-by-section** completion tracking
- **Responsive design** with mobile-friendly layouts

## Advanced Implementation Patterns

### **Section Completion Logic Patterns**
Complex labs require sophisticated completion tracking. Use this pattern for multi-field sections:

```javascript
// Pattern for multi-field section completion
const checkSectionCompletion = (fieldGroups, currentData) => {
  const allGroups = Object.entries(fieldGroups).map(([groupName, fields]) => {
    const groupComplete = fields.every(field => {
      const value = currentData[field];
      return value && value.trim() !== '';
    });
    console.log(`📋 ${groupName} fields:`, fields.map(f => ({
      field: f, 
      value: currentData[f]?.substring(0, 20) + '...', 
      complete: !!(currentData[f] && currentData[f].trim() !== '')
    })));
    return { groupName, complete: groupComplete };
  });
  
  return allGroups.every(group => group.complete);
};

// Example usage for Analysis section
const analysisFields = ['method', 'replicaWavelength', 'glassWavelength', 'cdWavelength', 'dvdWavelength', 'calculationWork', 'methodExplanation'];
const errorFields = ['replicaError', 'glassError', 'cdError', 'dvdError'];

const analysisComplete = checkSectionCompletion({
  'main analysis': analysisFields,
  'error analysis': errorFields
}, { ...analysisData, ...errorAnalysis });
```

### **SimpleQuillEditor Integration Pattern**
Rich text editors require both save and real-time content tracking:

```javascript
// CRITICAL: Use both onSave and onContentChange for complete functionality
<SimpleQuillEditor
  courseId="2"
  unitId="lab-name"
  itemId="calculation-work"
  initialContent={analysisData.calculationWork || ''}
  onSave={(content) => updateAnalysisData('calculationWork', content)}
  onContentChange={(content) => updateAnalysisData('calculationWork', content)} // Real-time completion
  onError={(error) => console.error('SimpleQuillEditor error:', error)}
/>
```

### **Data Collection Race Condition Prevention**
Prevent state inconsistencies with proper data collection patterns:

```javascript
// WRONG: Processing fields one by one (causes race conditions)
Object.keys(data).forEach(field => {
  updateObservationData(grating, field, data[field]); // Multiple saves, stale state
});

// CORRECT: Process all data at once
onDataCollected={(grating, data) => {
  const newObservationData = {
    ...observationData,
    [grating]: {
      ...observationData[grating],
      ...data // Apply all fields at once
    }
  };
  
  // Auto-calculate derived values
  const currentData = newObservationData[grating];
  if (currentData.xRight && currentData.xLeft) {
    const xAverage = (Math.abs(parseFloat(currentData.xRight)) + Math.abs(parseFloat(currentData.xLeft))) / 2;
    newObservationData[grating].xAverage = xAverage.toFixed(3);
  }
  
  setObservationData(newObservationData);
  
  // Single save with all updates
  saveToFirebase({ 
    observationData: newObservationData,
    sectionStatus: updatedSectionStatus 
  });
}}
```

### **Debugging and Console Logging Strategy**
Implement systematic debugging for complex completion logic:

```javascript
// Standard debugging pattern for completion logic
const updateAnalysisData = (field, value) => {
  const newAnalysisData = { ...analysisData, [field]: value };
  setAnalysisData(newAnalysisData);
  
  console.log('🔍 updateAnalysisData - Checking completion:', {
    field,
    value: value?.substring(0, 50) + (value?.length > 50 ? '...' : ''),
    newAnalysisData,
    errorAnalysis
  });
  
  const analysisFields = ['method', 'replicaWavelength', 'glassWavelength', 'cdWavelength', 'dvdWavelength', 'calculationWork', 'methodExplanation'];
  const analysisComplete = analysisFields.every(fieldName => {
    const fieldValue = fieldName === field ? value : newAnalysisData[fieldName];
    const isComplete = fieldValue && fieldValue.trim() !== '';
    console.log(`  📝 Field "${fieldName}": "${fieldValue?.substring(0, 30)}..." -> ${isComplete ? '✅' : '❌'}`);
    return isComplete;
  });
  
  console.log(`🚦 Section status: ${status} (allComplete: ${allComplete})`);
};
```

### **Staff View Auto-Start Pattern**
Enable automatic lab initialization for development and staff testing:

```javascript
// Auto-start lab for staff view
useEffect(() => {
  if (isStaffView && !labStarted) {
    setLabStarted(true);
    setCurrentSection('introduction');
    setSectionStatus(prev => ({
      ...prev,
      introduction: 'not-started' // Will be updated when content is entered
    }));
  }
}, [isStaffView, labStarted]);
```

### **Complex Validation Patterns**
Different field types require specific validation approaches:

```javascript
// Validation patterns for different field types
const validateField = (fieldType, value) => {
  switch (fieldType) {
    case 'dropdown':
      return value !== '' && value !== null;
    
    case 'numeric':
      return !isNaN(parseFloat(value)) && parseFloat(value) > 0;
    
    case 'richText':
      return value && value.trim() !== '' && value !== '<p></p>' && value !== '<p><br></p>';
    
    case 'textarea':
      return value && value.trim() !== '';
    
    case 'array':
      return Array.isArray(value) && value.length > 0 && value.every(item => item.field !== '');
    
    case 'percentage':
      const num = parseFloat(value);
      return !isNaN(num) && num >= 0 && num <= 100;
    
    case 'wavelength':
      const wavelength = parseFloat(value);
      return !isNaN(wavelength) && wavelength > 0 && wavelength < 10000; // nm range
    
    default:
      return value && value.trim() !== '';
  }
};
```

### **Toast Notification Standards**
Consistent user feedback patterns:

```javascript
// Standard toast patterns
import { toast } from 'sonner';

// Success notifications
toast.success(`Data collected for ${grating.toUpperCase()}!`);
toast.success('Lab submitted successfully!');

// Error notifications
toast.error(`Failed to save: ${error.message}`);
toast.error('Please fill in all required fields before submitting');

// Info notifications
toast.info('Auto-saving progress...');
toast.info('Calculation validated successfully');

// Warning notifications
toast.warning('Some data may be lost if you leave without saving');
```

### **Error Handling Patterns**
Comprehensive error handling that doesn't break user experience:

```javascript
const saveToFirebase = useCallback(async (dataToUpdate) => {
  if (!currentUser?.uid || !labDataRef) {
    console.log('🚫 Save blocked: no user or ref');
    return;
  }
  
  try {
    console.log('💾 Saving to Firebase:', dataToUpdate);
    
    const dataToSave = {
      ...dataToUpdate,
      lastModified: serverTimestamp(),
      courseId: courseId,
      labId: 'lab-name-here'
    };
    
    await update(labDataRef, dataToSave);
    console.log('✅ Save successful!');
    setHasSavedProgress(true);
    
  } catch (error) {
    console.error('❌ Save failed:', error);
    toast.error('Failed to save data. Please try again.');
    
    // Log detailed error for debugging
    console.error('Save error details:', {
      errorMessage: error.message,
      errorCode: error.code,
      dataToUpdate,
      userUid: currentUser?.uid
    });
    
    // Don't throw - allow UI to continue functioning
  }
}, [currentUser?.uid, labDataRef, courseId]);
```

## Common Pitfalls and Solutions

### **1. Rich Text Editor Not Updating Section Completion**
**Problem**: Section stays yellow even when content is present
**Solution**: Use `onContentChange` callback for real-time tracking, not just `onSave`

### **2. Race Conditions in Data Collection**
**Problem**: Some fields not populated when collecting simulation data
**Solution**: Process all data fields at once, not individually with separate state updates

### **3. Section Never Completing Despite Filled Fields**
**Problem**: Completion logic missing required fields or using wrong field names
**Solution**: Add console logging to verify all required fields and their actual names

### **4. State Updates Not Saving to Firebase**
**Problem**: Using stale state in save operations
**Solution**: Use the updated state directly in save calls, not dependency on useEffect

### **5. Staff View Not Loading Properly**
**Problem**: Labs don't start automatically for development/testing
**Solution**: Implement auto-start pattern for isStaffView

### **6. Validation Logic Inconsistencies**
**Problem**: Different validation rules across similar fields
**Solution**: Create standardized validation functions for common field types

## Quality Assurance Checklist

### Before Deployment:
- [ ] AI prompt file created with guidance-only approach
- [ ] Database integration uses Firebase Realtime Database pattern
- [ ] All 7 standard lab sections implemented
- [ ] Navigation and progress tracking functional
- [ ] Simulation component provides proper data collection
- [ ] Real-time validation working for student inputs
- [ ] Auto-save functionality operational
- [ ] PostSubmissionOverlay integrated
- [ ] Print PDF functionality working
- [ ] Lab submission process functional
- [ ] Responsive design tested on mobile devices
- [ ] Staff view properly handles submitted labs
- [ ] Error handling implemented for network issues

### Advanced QA Checks:
- [ ] Console logging implemented for completion logic debugging
- [ ] Toast notifications provide clear user feedback
- [ ] Staff view auto-start functionality working
- [ ] SimpleQuillEditor real-time content tracking verified
- [ ] Race condition prevention in data collection tested
- [ ] Complex field validation patterns working correctly
- [ ] Multi-field section completion logic verified
- [ ] Error boundaries prevent crashes from bad data
- [ ] State management handles edge cases gracefully
- [ ] Performance tested with large datasets

## Files That Need Modification

For each lab conversion, expect to modify:
1. **`index.js`** - Main lab component (major refactoring)
2. **`ai-prompt.js`** - Create new AI assistant integration (MUST be added at the end)
3. **`package.json`** - Ensure required dependencies are available
4. **Backend functions** - Update or create lab submission handlers

## Estimated Timeline

- **Simple Lab** (basic data collection): 4-6 hours
- **Complex Lab** (multiple simulations): 8-12 hours  
- **Highly Complex Lab** (advanced calculations): 12-16 hours

## Next Steps

1. **Assessment Phase**: Review target lab's current structure and identify specific requirements
2. **Planning Phase**: Create detailed task breakdown based on this guide
3. **Implementation Phase**: Execute changes systematically, section by section
4. **Testing Phase**: Verify all functionality works correctly
5. **Documentation Phase**: Update any lab-specific documentation

This guide provides a systematic approach to modernizing any lab to match the current standard established by the mirrors and lenses lab.