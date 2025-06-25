# Adding Lab Save Feature to a Lab Component

## Overview

This guide walks you through adding persistent save/load functionality to a lab component. Students will be able to save their progress and return later to continue their work.

## Prerequisites

Before starting, ensure you have:

- [ ] An existing lab component in `/src/FirebaseCourses/courses/[courseId]/content/[lab-folder]/`
- [ ] Lab component is a functional component using React hooks
- [ ] Firebase project configured with Realtime Database
- [ ] Firebase functions deployed and working
- [ ] Access to deploy functions

## Time Estimate: 30-45 minutes

---

## Step 1: Create the Cloud Function Configuration

### 1.1 Create the assessment directory

```bash
mkdir -p functions/courses/[courseId]/[lab-folder]
```

### 1.2 Create the assessments.js file

**Location:** `functions/courses/[courseId]/[lab-folder]/assessments.js`

```javascript
/**
 * [Lab Name] Assessments
 * Course: [Course Name] (Course ID: [courseId])
 * Content: [lab-folder]
 */

const { createLabSubmission } = require('../../../shared/assessment-types/lab-submission');

/**
 * Lab: [Lab Name]
 * [Brief description of what students do in this lab]
 */
exports.course[courseId]_[lab_function_name] = createLabSubmission({
  // Lab Configuration
  labTitle: '[Lab Display Name]',
  labType: 'physics', // 'physics', 'chemistry', 'biology', 'general'
  activityType: 'lab', // 'lab', 'experiment', 'simulation'
  
  // Required sections that must be completed
  requiredSections: [
    'hypothesis',
    'procedure', 
    'observations',
    'analysis',
    'conclusion'
    // Add any additional sections your lab has
  ],
  
  // Grading Configuration
  pointsValue: 10, // Total points for the lab
  allowPartialCredit: true,
  completionThreshold: 75, // Percentage required for full credit
  
  // Data Validation
  validateData: true,
  maxDataSize: 2, // Maximum 2MB of data
  
  // Cloud Function Settings
  region: 'us-central1',
  timeout: 120, // 2 minutes timeout for large lab data
  memory: '512MiB'
});
```

### 1.3 Update required sections

**Important:** Update the `requiredSections` array to match your lab's actual sections. Check your lab component for the `sectionStatus` state to see all sections.

---

## Step 2: Add Firebase Imports to Lab Component

### 2.1 Add imports at the top of your lab component

**Location:** `src/FirebaseCourses/courses/[courseId]/content/[lab-folder]/index.js`

```javascript
import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import { sanitizeEmail } from '../../../../../utils/sanitizeEmail';
```

**Note:** Adjust the relative path depth based on your lab's location in the folder structure.

---

## Step 3: Update Component Props and Authentication

### 3.1 Update component declaration

```javascript
// OLD:
const YourLabComponent = () => {

// NEW:
const YourLabComponent = ({ courseId = '[your-course-id]' }) => {
  const { currentUser } = useAuth();
  
  // ... rest of component
```

---

## Step 4: Add State Management for Saving/Loading

### 4.1 Add new state variables

Add these after your existing state declarations:

```javascript
// Track saving/loading state
const [isSaving, setIsSaving] = useState(false);
const [isLoading, setIsLoading] = useState(false);
const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
```

---

## Step 5: Implement Save and Load Functions

### 5.1 Add the saveLabProgress function

Add this function to your component (before the return statement):

```javascript
// Save lab progress to database
const saveLabProgress = async (isAutoSave = false) => {
  if (!currentUser) {
    setNotification({ 
      message: 'Please log in to save your progress', 
      type: 'error', 
      visible: true 
    });
    return false;
  }

  try {
    setIsSaving(true);
    
    const functions = getFunctions();
    const saveFunction = httpsCallable(functions, 'course[courseId]_[lab_function_name]');
    
    const studentKey = sanitizeEmail(currentUser.email);
    
    // Prepare lab data for saving
    const labData = {
      sectionStatus,
      sectionContent,
      // Add all your lab-specific state variables here:
      // trialData,
      // calculations,
      // currentStep,
      // etc.
      timestamp: new Date().toISOString()
    };
    
    const result = await saveFunction({
      operation: 'save',
      studentKey: studentKey,
      courseId: courseId,
      assessmentId: '[your_assessment_id]',
      labData: labData,
      saveType: isAutoSave ? 'auto' : 'manual',
      studentEmail: currentUser.email,
      userId: currentUser.uid
    });
    
    if (result.data.success) {
      setHasSavedProgress(true);
      if (!isAutoSave) {
        setNotification({ 
          message: `Lab progress saved successfully! (${result.data.completionPercentage}% complete)`, 
          type: 'success', 
          visible: true 
        });
      }
      return true;
    } else {
      throw new Error('Save operation failed');
    }
  } catch (error) {
    console.error('Error saving lab progress:', error);
    setNotification({ 
      message: `Failed to save progress: ${error.message}`, 
      type: 'error', 
      visible: true 
    });
    return false;
  } finally {
    setIsSaving(false);
  }
};
```

### 5.2 Add the loadLabProgress function

```javascript
// Load lab progress from database
const loadLabProgress = async () => {
  if (!currentUser) return;

  try {
    setIsLoading(true);
    
    const functions = getFunctions();
    const loadFunction = httpsCallable(functions, 'course[courseId]_[lab_function_name]');
    
    const studentKey = sanitizeEmail(currentUser.email);
    
    const result = await loadFunction({
      operation: 'load',
      studentKey: studentKey,
      courseId: courseId,
      assessmentId: '[your_assessment_id]',
      studentEmail: currentUser.email,
      userId: currentUser.uid
    });
    
    if (result.data.success && result.data.found) {
      const savedData = result.data.labData;
      
      // Restore saved state
      if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
      if (savedData.sectionContent) setSectionContent(savedData.sectionContent);
      // Add restoration for all your lab-specific state:
      // if (savedData.trialData) setTrialData(savedData.trialData);
      // if (savedData.calculations) setCalculations(savedData.calculations);
      // etc.
      
      setHasSavedProgress(true);
      setNotification({ 
        message: `Previous progress loaded! (${result.data.completionPercentage}% complete)`, 
        type: 'success', 
        visible: true 
      });
    }
  } catch (error) {
    console.error('Error loading lab progress:', error);
    setNotification({ 
      message: 'Failed to load previous progress', 
      type: 'error', 
      visible: true 
    });
  } finally {
    setIsLoading(false);
  }
};
```

### 5.3 Update your existing save function

If you have an existing `saveAndEnd` function, update it:

```javascript
const saveAndEnd = async () => {
  const saved = await saveLabProgress(false);
  if (saved) {
    // Add any cleanup logic here
    setLabStarted(false);
  }
};
```

---

## Step 6: Add useEffect Hooks

### 6.1 Add data loading on component mount

Add these useEffect hooks after your existing ones:

```javascript
// Load saved progress on component mount
React.useEffect(() => {
  if (currentUser) {
    loadLabProgress();
  }
}, [currentUser]);

// Auto-save functionality
React.useEffect(() => {
  if (!autoSaveEnabled || !currentUser || !hasSavedProgress) return;

  const autoSaveInterval = setInterval(() => {
    saveLabProgress(true); // Auto-save
  }, 30000); // Auto-save every 30 seconds

  return () => clearInterval(autoSaveInterval);
}, [autoSaveEnabled, currentUser, hasSavedProgress, sectionStatus, sectionContent /* add other state variables */]);
```

---

## Step 7: Update the User Interface

### 7.1 Update save buttons

Find your existing save button and replace it with:

```javascript
{/* Action Buttons */}
<div className="flex space-x-3">
  <button 
    onClick={() => saveLabProgress(false)}
    disabled={isSaving || !currentUser}
    className="px-4 py-2 bg-green-600 text-white font-medium rounded border border-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
  >
    {isSaving ? 'Saving...' : 'Save Progress'}
  </button>
  <button 
    onClick={saveAndEnd}
    disabled={isSaving || !currentUser}
    className="px-4 py-2 bg-blue-600 text-white font-medium rounded border border-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200"
  >
    Save and End
  </button>
</div>
```

### 7.2 Add status indicators

Add this after your notification component:

```javascript
{/* Status Indicators */}
{(isLoading || autoSaveEnabled) && (
  <div className="fixed bottom-4 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
    {isLoading && (
      <div className="flex items-center text-blue-600 mb-1">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
        Loading progress...
      </div>
    )}
    {autoSaveEnabled && currentUser && hasSavedProgress && (
      <div className="flex items-center text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
        Auto-save enabled
      </div>
    )}
  </div>
)}
```

---

## Step 8: Export Function in Index

### 8.1 Add the function export

**Location:** `functions/index.js`

Find the section for your course and add:

```javascript
// Course [courseId] - Lab: [Lab Name]
exports.course[courseId]_[lab_function_name] = require('./courses/[courseId]/[lab-folder]/assessments').course[courseId]_[lab_function_name];
```

---

## Step 9: Deploy and Test

### 9.1 Deploy the function

```bash
firebase deploy --only functions:course[courseId]_[lab_function_name]
```

### 9.2 Test the functionality

1. **Save Test**: Enter some data and click "Save Progress"
2. **Auto-save Test**: Wait 30 seconds and check for auto-save
3. **Load Test**: Refresh the page and verify data loads
4. **Error Test**: Try saving while logged out

---

## Customization Options

### Custom Assessment ID

Replace `[your_assessment_id]` with a descriptive identifier:
- Use the lab folder name: `'lab_momentum_conservation'`
- Use a descriptive name: `'physics_lab_1'`
- Keep it consistent between save and load calls

### Additional State Variables

In the `labData` object, include all state that should be saved:

```javascript
const labData = {
  sectionStatus,
  sectionContent,
  // Lab-specific data:
  experimentData: yourExperimentData,
  calculations: yourCalculations,
  userInputs: yourUserInputs,
  currentStep: currentStep,
  // Any other state variables
  timestamp: new Date().toISOString()
};
```

And restore them in `loadLabProgress`:

```javascript
if (savedData.experimentData) setExperimentData(savedData.experimentData);
if (savedData.calculations) setCalculations(savedData.calculations);
if (savedData.userInputs) setUserInputs(savedData.userInputs);
if (savedData.currentStep) setCurrentStep(savedData.currentStep);
```

---

## Troubleshooting

### Common Issues

1. **"Failed to save progress: INTERNAL"**
   - Check required sections match your lab's sectionStatus
   - Verify function is deployed
   - Check Firebase console logs

2. **"Module not found" errors**
   - Verify import paths are correct for your folder depth
   - Check that AuthContext and sanitizeEmail files exist

3. **Data not loading**
   - Verify the assessment ID is identical in save and load calls
   - Check that the function export is added to functions/index.js

4. **Auto-save not working**
   - Verify all state variables are included in useEffect dependencies
   - Check that hasSavedProgress is set to true after first save

### Debug Tips

1. **Check function logs:**
   ```bash
   firebase functions:log --only course[courseId]_[lab_function_name]
   ```

2. **Test locally:**
   ```bash
   firebase emulators:start --only functions,database
   ```

3. **Add console.log statements:**
   ```javascript
   console.log('Saving lab data:', labData);
   console.log('Save result:', result);
   ```

---

## Next Steps

After implementation:

1. Test thoroughly with different user scenarios
2. Monitor function performance in Firebase console
3. Gather user feedback on save/load experience
4. Consider adding progress indicators for longer saves
5. Document any lab-specific customizations

For more advanced configuration options, see the [Lab Submission README](../../functions/shared/assessment-types/LAB_SUBMISSION_README.md).

---

## Template Checklist

- [ ] Created assessments.js with correct required sections
- [ ] Added Firebase imports to lab component
- [ ] Updated component to accept courseId prop
- [ ] Added save/load state variables
- [ ] Implemented saveLabProgress function
- [ ] Implemented loadLabProgress function
- [ ] Updated existing save function
- [ ] Added useEffect hooks for loading and auto-save
- [ ] Updated UI with new save buttons
- [ ] Added status indicators
- [ ] Added function export to functions/index.js
- [ ] Deployed function
- [ ] Tested save, load, and auto-save functionality