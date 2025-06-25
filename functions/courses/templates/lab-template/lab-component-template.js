/**
 * Lab Component Template with Save/Load Functionality
 * 
 * INSTRUCTIONS:
 * 1. Copy this template to your lab location: src/FirebaseCourses/courses/[COURSE_ID]/content/[LAB_FOLDER]/index.js
 * 2. Replace all [PLACEHOLDER] values
 * 3. Implement your lab-specific content and logic
 * 4. Update the state variables and data structure to match your lab
 * 5. Test the save/load functionality
 */

import React, { useState, useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext'; // Adjust path depth as needed
import { sanitizeEmail } from '../../../../../utils/sanitizeEmail'; // Adjust path depth as needed

/**
 * [LAB NAME] for [COURSE NAME]
 * [BRIEF DESCRIPTION OF LAB]
 */
const [LabComponentName] = ({ courseId = '[COURSE_ID]' }) => {
  const { currentUser } = useAuth();
  
  // ============================================================================
  // SECTION TRACKING STATE - CUSTOMIZE FOR YOUR LAB
  // ============================================================================
  
  // Track completion status for each section
  const [sectionStatus, setSectionStatus] = useState({
    hypothesis: 'not-started',     // 'not-started', 'in-progress', 'completed'
    procedure: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    conclusion: 'not-started'
    // Add any additional sections your lab has:
    // simulation: 'not-started',
    // error: 'not-started',
    // calculations: 'not-started'
  });
  
  // Track section content (text inputs)
  const [sectionContent, setSectionContent] = useState({
    hypothesis: '',
    conclusion: ''
    // Add other text content sections:
    // analysis: '',
    // reflection: ''
  });
  
  // ============================================================================
  // LAB-SPECIFIC STATE - CUSTOMIZE FOR YOUR LAB
  // ============================================================================
  
  // Example lab data structures (replace with your lab's specific needs):
  
  // For trial-based labs:
  // const [trialData, setTrialData] = useState([]);
  
  // For calculation-based labs:
  // const [calculations, setCalculations] = useState({});
  
  // For simulation labs:
  // const [simulationResults, setSimulationResults] = useState({});
  
  // For multi-step procedures:
  // const [currentStep, setCurrentStep] = useState(1);
  
  // Example: Simple data collection
  const [labData, setLabData] = useState({
    // Define your lab's data structure here
    measurements: [],
    notes: '',
    // Add fields specific to your lab
  });
  
  // ============================================================================
  // GENERAL LAB STATE
  // ============================================================================
  
  const [labStarted, setLabStarted] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [currentSection, setCurrentSection] = useState('hypothesis');
  
  // Save/Load state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Notification system
  const [notification, setNotification] = useState({ 
    message: '', 
    type: '', 
    visible: false 
  });
  
  // ============================================================================
  // SAVE/LOAD FUNCTIONS
  // ============================================================================
  
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
      const saveFunction = httpsCallable(functions, 'course[COURSE_ID]_[LAB_FUNCTION_NAME]');
      
      const studentKey = sanitizeEmail(currentUser.email);
      
      // Prepare lab data for saving - CUSTOMIZE THIS FOR YOUR LAB
      const labDataToSave = {
        sectionStatus,
        sectionContent,
        labData,
        labStarted,
        currentSection,
        // Add all your lab-specific state variables:
        // trialData,
        // calculations,
        // simulationResults,
        // currentStep,
        timestamp: new Date().toISOString()
      };
      
      const result = await saveFunction({
        operation: 'save',
        studentKey: studentKey,
        courseId: courseId,
        assessmentId: '[ASSESSMENT_ID]', // Example: 'lab_momentum_conservation'
        labData: labDataToSave,
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

  // Load lab progress from database
  const loadLabProgress = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      const functions = getFunctions();
      const loadFunction = httpsCallable(functions, 'course[COURSE_ID]_[LAB_FUNCTION_NAME]');
      
      const studentKey = sanitizeEmail(currentUser.email);
      
      const result = await loadFunction({
        operation: 'load',
        studentKey: studentKey,
        courseId: courseId,
        assessmentId: '[ASSESSMENT_ID]', // Must match the save function
        studentEmail: currentUser.email,
        userId: currentUser.uid
      });
      
      if (result.data.success && result.data.found) {
        const savedData = result.data.labData;
        
        // Restore saved state - CUSTOMIZE FOR YOUR LAB
        if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
        if (savedData.sectionContent) setSectionContent(savedData.sectionContent);
        if (savedData.labData) setLabData(savedData.labData);
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);
        if (savedData.currentSection) setCurrentSection(savedData.currentSection);
        
        // Restore your lab-specific state:
        // if (savedData.trialData) setTrialData(savedData.trialData);
        // if (savedData.calculations) setCalculations(savedData.calculations);
        // if (savedData.simulationResults) setSimulationResults(savedData.simulationResults);
        // if (savedData.currentStep) setCurrentStep(savedData.currentStep);
        
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

  const saveAndEnd = async () => {
    const saved = await saveLabProgress(false);
    if (saved) {
      setLabStarted(false);
      // Add any additional cleanup logic here
    }
  };
  
  // ============================================================================
  // USEEFFECT HOOKS
  // ============================================================================
  
  // Load saved progress on component mount
  useEffect(() => {
    if (currentUser) {
      loadLabProgress();
    }
  }, [currentUser]);

  // Auto-save functionality
  useEffect(() => {
    if (!autoSaveEnabled || !currentUser || !hasSavedProgress) return;

    const autoSaveInterval = setInterval(() => {
      saveLabProgress(true); // Auto-save
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [
    autoSaveEnabled, 
    currentUser, 
    hasSavedProgress, 
    sectionStatus, 
    sectionContent, 
    labData
    // Add all your lab-specific state variables that should trigger auto-save:
    // trialData,
    // calculations,
    // simulationResults
  ]);

  // Auto-hide notifications
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);
  
  // ============================================================================
  // LAB-SPECIFIC FUNCTIONS - IMPLEMENT YOUR LAB LOGIC HERE
  // ============================================================================
  
  const updateSectionStatus = (section, status) => {
    setSectionStatus(prev => ({
      ...prev,
      [section]: status
    }));
  };

  const updateSectionContent = (section, content) => {
    setSectionContent(prev => ({
      ...prev,
      [section]: content
    }));
  };
  
  // Add your lab-specific functions here:
  // const handleDataCollection = (newData) => { ... };
  // const performCalculation = () => { ... };
  // const runSimulation = () => { ... };
  
  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading lab...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Lab Header */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">[LAB TITLE]</h1>
        <p className="text-blue-600">
          [LAB DESCRIPTION AND OBJECTIVES]
        </p>
        
        {/* Progress Indicator */}
        {hasSavedProgress && (
          <div className="mt-4 text-sm text-green-600">
            ✓ Progress saved - you can continue where you left off
          </div>
        )}
      </div>

      {/* Lab Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Lab Controls</h2>
          
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
        </div>
      </div>

      {/* Lab Sections */}
      {/* Hypothesis Section */}
      <div className="border rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 text-blue-700">
          Hypothesis
        </h2>
        <textarea
          value={sectionContent.hypothesis}
          onChange={(e) => updateSectionContent('hypothesis', e.target.value)}
          placeholder="Enter your hypothesis here..."
          className="w-full p-3 border border-gray-300 rounded-lg"
          rows={4}
        />
        <button
          onClick={() => updateSectionStatus('hypothesis', 'completed')}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Mark Complete
        </button>
      </div>

      {/* Add more sections as needed for your lab */}
      {/* Procedure Section */}
      {/* Observations Section */}
      {/* Analysis Section */}
      {/* Conclusion Section */}

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

      {/* Notification Component */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 max-w-sm rounded-lg shadow-lg p-4 transition-all duration-300 ${
          notification.type === 'success' 
            ? 'bg-green-100 border border-green-400 text-green-800' 
            : 'bg-red-100 border border-red-400 text-red-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">{notification.message}</span>
            <button 
              onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default [LabComponentName];

// ============================================================================
// IMPLEMENTATION CHECKLIST
// ============================================================================
/*
After copying this template:

CUSTOMIZATION:
1. [ ] Replace all [PLACEHOLDER] values with your specific lab information
2. [ ] Update sectionStatus to include all your lab's sections
3. [ ] Define your lab's specific data structure in state variables
4. [ ] Implement your lab's content and interaction logic
5. [ ] Update the labDataToSave object to include all your state
6. [ ] Update the loadLabProgress function to restore all your state
7. [ ] Add your lab's specific sections to the UI

CONFIGURATION:
8. [ ] Create the corresponding assessments.js file
9. [ ] Ensure requiredSections in assessments.js matches sectionStatus keys
10. [ ] Add function export to functions/index.js
11. [ ] Deploy the cloud function

TESTING:
12. [ ] Test save functionality with partial data
13. [ ] Test load functionality after page refresh
14. [ ] Test auto-save functionality
15. [ ] Test error handling (save while logged out, etc.)
16. [ ] Verify gradebook integration

DEPLOYMENT:
17. [ ] Test with real students
18. [ ] Monitor function performance
19. [ ] Gather feedback on user experience

COMMON CUSTOMIZATIONS:
- Trial-based labs: Add arrays for storing trial data
- Calculation labs: Add state for formulas and computed values
- Simulation labs: Add state for simulation parameters and results
- Multi-step labs: Add current step tracking and navigation
- Data collection labs: Add arrays for measurements and observations
*/