# Lab Save Feature - Quick Reference

## 🚀 Quick Setup Checklist

- [ ] Create `functions/courses/[COURSE_ID]/[LAB_FOLDER]/assessments.js`
- [ ] Add Firebase imports to lab component
- [ ] Add save/load functions to component
- [ ] Add save buttons to UI
- [ ] Export function in `functions/index.js`
- [ ] Deploy and test

---

## 📁 File Locations

```
functions/
├── courses/[COURSE_ID]/[LAB_FOLDER]/
│   └── assessments.js                    ← Cloud function config
├── index.js                              ← Add export here
└── shared/assessment-types/
    └── lab-submission.js                 ← Core system (already exists)

src/FirebaseCourses/courses/[COURSE_ID]/content/[LAB_FOLDER]/
└── index.js                              ← Your lab component
```

---

## ⚙️ Essential Code Snippets

### 1. Assessments Configuration
```javascript
// functions/courses/[COURSE_ID]/[LAB_FOLDER]/assessments.js
const { createLabSubmission } = require('../shared/assessment-types/lab-submission');

exports.course[ID]_[NAME] = createLabSubmission({
  labTitle: 'Lab Name',
  labType: 'physics', // 'physics', 'chemistry', 'biology', 'general'
  activityType: 'lab',
  requiredSections: ['hypothesis', 'procedure', 'observations', 'analysis', 'conclusion'],
  pointsValue: 10,
  allowPartialCredit: true,
  completionThreshold: 75
});
```

### 2. Component Imports
```javascript
// Add to top of lab component
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import { sanitizeEmail } from '../../../../../utils/sanitizeEmail';
```

### 3. Component Setup
```javascript
const YourLab = ({ courseId = 'X' }) => {
  const { currentUser } = useAuth();
  
  // Add these state variables
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
```

### 4. Save Function
```javascript
const saveLabProgress = async (isAutoSave = false) => {
  if (!currentUser) return false;
  
  try {
    setIsSaving(true);
    const functions = getFunctions();
    const saveFunction = httpsCallable(functions, 'course[ID]_[NAME]');
    
    const labData = {
      sectionStatus,
      sectionContent,
      // Add all your lab state here
      timestamp: new Date().toISOString()
    };
    
    const result = await saveFunction({
      operation: 'save',
      studentKey: sanitizeEmail(currentUser.email),
      courseId: courseId,
      assessmentId: 'your_assessment_id',
      labData: labData,
      saveType: isAutoSave ? 'auto' : 'manual',
      studentEmail: currentUser.email,
      userId: currentUser.uid
    });
    
    if (result.data.success) {
      setHasSavedProgress(true);
      return true;
    }
  } catch (error) {
    console.error('Save failed:', error);
  } finally {
    setIsSaving(false);
  }
  return false;
};
```

### 5. Load Function
```javascript
const loadLabProgress = async () => {
  if (!currentUser) return;
  
  try {
    setIsLoading(true);
    const functions = getFunctions();
    const loadFunction = httpsCallable(functions, 'course[ID]_[NAME]');
    
    const result = await loadFunction({
      operation: 'load',
      studentKey: sanitizeEmail(currentUser.email),
      courseId: courseId,
      assessmentId: 'your_assessment_id',
      studentEmail: currentUser.email,
      userId: currentUser.uid
    });
    
    if (result.data.success && result.data.found) {
      const savedData = result.data.labData;
      // Restore all your state here
      if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
      if (savedData.sectionContent) setSectionContent(savedData.sectionContent);
      setHasSavedProgress(true);
    }
  } catch (error) {
    console.error('Load failed:', error);
  } finally {
    setIsLoading(false);
  }
};
```

### 6. useEffect Hooks
```javascript
// Load on mount
useEffect(() => {
  if (currentUser) loadLabProgress();
}, [currentUser]);

// Auto-save
useEffect(() => {
  if (!autoSaveEnabled || !currentUser || !hasSavedProgress) return;
  const interval = setInterval(() => saveLabProgress(true), 30000);
  return () => clearInterval(interval);
}, [autoSaveEnabled, currentUser, hasSavedProgress, /* your state variables */]);
```

### 7. Save Buttons
```javascript
<div className="flex space-x-3">
  <button 
    onClick={() => saveLabProgress(false)}
    disabled={isSaving || !currentUser}
    className="px-4 py-2 bg-green-600 text-white rounded disabled:bg-gray-400"
  >
    {isSaving ? 'Saving...' : 'Save Progress'}
  </button>
  <button 
    onClick={saveAndEnd}
    disabled={isSaving || !currentUser}
    className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
  >
    Save and End
  </button>
</div>
```

### 8. Function Export
```javascript
// Add to functions/index.js
exports.course[ID]_[NAME] = require('./courses/[ID]/[FOLDER]/assessments').course[ID]_[NAME];
```

---

## 🎯 Key Configuration Parameters

| Parameter | Description | Example |
|-----------|-------------|---------|
| `requiredSections` | Sections that must exist | `['hypothesis', 'procedure']` |
| `pointsValue` | Total points for lab | `10` |
| `completionThreshold` | % required for full credit | `75` |
| `allowPartialCredit` | Award partial points | `true` |
| `maxDataSize` | Max data size in MB | `2` |
| `validateData` | Enable validation | `true` |

---

## 🔧 Common Naming Patterns

### Function Names
- Format: `course[ID]_[descriptive_name]`
- Examples: `course2_lab_momentum_conservation`, `course3_experiment_rates`

### Assessment IDs
- Format: `[type]_[descriptive_name]`
- Examples: `lab_momentum_conservation`, `experiment_reaction_rates`

### Folder Names
- Format: `[number]-[descriptive-name]`
- Examples: `07-lab-momentum-conservation`, `03-chemistry-rates-lab`

---

## 🚨 Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| "Required section missing" | Check `requiredSections` matches `sectionStatus` keys |
| "Module not found" | Verify import paths (count ../ correctly) |
| "Failed to save: INTERNAL" | Check function logs, verify all parameters |
| Auto-save not working | Add all state to useEffect dependencies |
| Data not loading | Ensure identical assessment ID in save/load |

---

## 📊 Data Structure Template

```javascript
// What to save
const labData = {
  sectionStatus: {          // Required for progress tracking
    hypothesis: 'completed',
    procedure: 'completed',
    observations: 'in-progress'
  },
  sectionContent: {         // Text content
    hypothesis: 'My hypothesis...',
    conclusion: 'I conclude...'
  },
  // Your lab-specific data:
  trialData: [...],         // For data collection labs
  calculations: {...},      // For calculation labs
  simulationResults: {...}, // For simulation labs
  currentStep: 3,           // For multi-step labs
  timestamp: '2024-01-20T10:30:00Z'
};
```

---

## 🎨 Status Indicators

```javascript
// Loading indicator
{isLoading && (
  <div className="flex items-center">
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
    Loading...
  </div>
)}

// Auto-save indicator
{autoSaveEnabled && hasSavedProgress && (
  <div className="flex items-center text-green-600">
    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
    Auto-save enabled
  </div>
)}
```

---

## 🧪 Testing Checklist

- [ ] **Save Test**: Enter data, click save, verify success message
- [ ] **Load Test**: Refresh page, verify data persists
- [ ] **Auto-save Test**: Wait 30+ seconds, check for auto-save
- [ ] **Error Test**: Save while logged out, verify error handling
- [ ] **Progress Test**: Check gradebook for score updates
- [ ] **Section Test**: Mark sections complete, verify status

---

## 📋 Deployment Commands

```bash
# Deploy specific function
firebase deploy --only functions:course[ID]_[NAME]

# View function logs
firebase functions:log --only course[ID]_[NAME]

# Test locally
firebase emulators:start --only functions,database
```

---

## 🔗 Related Documentation

- **Complete Guide**: [Adding Lab Save Feature](guides/ADDING_LAB_SAVE_FEATURE.md)
- **System Details**: [Lab Submission README](../functions/shared/assessment-types/LAB_SUBMISSION_README.md)
- **Templates**: [Lab Template](../functions/courses/templates/lab-template/)

---

## 💡 Pro Tips

1. **Start Small**: Get basic save/load working before adding complexity
2. **Match Sections**: Always ensure `requiredSections` matches your `sectionStatus`
3. **Test Early**: Deploy and test after each major addition
4. **Monitor Logs**: Check Firebase console for function execution details
5. **Use Templates**: Copy from existing working labs when possible

---

*Need help? Check the full documentation or look at existing lab implementations for patterns.*