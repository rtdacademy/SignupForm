import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDatabase, ref, set, update, onValue, serverTimestamp } from 'firebase/database';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

/**
 * Lab 4 - Electrostatic Charge Measurement for Physics 30
 * Item ID: assignment_1747283296776_954
 * Unit: Electrostatics & Electricity
 */
const LabElectrostatic = ({ courseId = '2', course }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_electrostatic']?.questions?.[0]?.questionId || 'course2_lab_electrostatic';
  console.log('📋 Lab questionId:', questionId);
  
  // Create database reference for this lab using questionId
  const labDataRef = currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  
  // Ref to track if component is mounted (for cleanup)
  const isMountedRef = useRef(true);
  
  // Track completion status for each section (4 sections total)
  const [sectionStatus, setSectionStatus] = useState({
    hypothesis: 'not-started', // 'not-started', 'in-progress', 'completed'
    observations: 'not-started',
    analysis: 'not-started',
    conclusion: 'not-started'
  });

  // Track section content
  const [sectionContent, setSectionContent] = useState({
    hypothesis: '',
    conclusion: ''
  });

  // Track current section for navigation
  const [currentSection, setCurrentSection] = useState('hypothesis');
  
  // Track if lab has been started
  const [labStarted, setLabStarted] = useState(false);
  
  // Track if student has saved progress
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Track saving state
  const [isSaving, setIsSaving] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);

  // Notification state
  const [notification, setNotification] = useState({
    message: '',
    type: 'success', // 'success', 'error', 'warning'
    visible: false
  });


  // Data tables for observations
  const [observationData, setObservationData] = useState({
    qualitative: 'Objects attracted each other',
    selectedGroup: null, // No group selected initially
    groupAlpha: [
      { trial: 1, r: 0.050, Fe: 0.58 },
      { trial: 2, r: 0.10, Fe: 0.14 },
      { trial: 3, r: 0.15, Fe: 0.070 },
      { trial: 4, r: 0.20, Fe: 0.040 },
      { trial: 5, r: 0.25, Fe: 0.020 },
      { trial: 6, r: 0.30, Fe: 0.015 }
    ],
    groupBeta: [
      { trial: 1, r: 0.050, Fe: 0.32 },
      { trial: 2, r: 0.10, Fe: 0.080 },
      { trial: 3, r: 0.15, Fe: 0.035 },
      { trial: 4, r: 0.20, Fe: 0.020 },
      { trial: 5, r: 0.25, Fe: 0.010 },
      { trial: 6, r: 0.30, Fe: 0.0090 }
    ],
    groupGamma: [
      { trial: 1, r: 0.050, Fe: 0.81 },
      { trial: 2, r: 0.10, Fe: 0.21 },
      { trial: 3, r: 0.15, Fe: 0.090 },
      { trial: 4, r: 0.20, Fe: 0.050 },
      { trial: 5, r: 0.25, Fe: 0.033 },
      { trial: 6, r: 0.30, Fe: 0.024 }
    ],
    groupEpsilon: [
      { trial: 1, r: 0.050, Fe: 0.44 },
      { trial: 2, r: 0.10, Fe: 0.11 },
      { trial: 3, r: 0.15, Fe: 0.050 },
      { trial: 4, r: 0.20, Fe: 0.030 },
      { trial: 5, r: 0.25, Fe: 0.016 },
      { trial: 6, r: 0.30, Fe: 0.011 }
    ]
  });

  // Analysis state
  const [analysisData, setAnalysisData] = useState({
    // Student input fields
    calculatedOneOverRSquared: ['', '', '', '', '', ''], // 6 trials
    xAxisVariable: '',
    yAxisVariable: '',
    lineStrateningExplanation: '',
    slopeValue: '',
    slopeCalculation: '',
    chargeValue: '',
    chargeCalculation: '',
    whyLineStrateningHelps: ''
  });

  // Save specific data to Firebase
  const saveToFirebase = useCallback(async (dataToUpdate) => {
    if (!currentUser?.uid || !labDataRef) {
      console.log('🚫 Save blocked: no user or ref');
      return;
    }
    
    try {
      console.log('💾 Saving to Firebase:', dataToUpdate);
      
      // Create the complete data object to save
      const dataToSave = {
        ...dataToUpdate,
        lastModified: serverTimestamp(),
        courseId: courseId,
        labId: '27-lab-electrostatic'
      };
      
      // Use update instead of set to only update specific fields
      await update(labDataRef, dataToSave);
      console.log('✅ Save successful!');
      
      setHasSavedProgress(true);
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      setNotification({
        message: 'Failed to save data. Please try again.',
        type: 'error',
        visible: true
      });
    }
  }, [currentUser?.uid, labDataRef, courseId]);

  // Load saved data from Firebase
  useEffect(() => {
    if (!currentUser?.uid || !labDataRef) return;
    
    let hasLoaded = false;
    
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      if (hasLoaded) return; // Prevent multiple loads
      hasLoaded = true;
      
      console.log('📡 Firebase data fetched:', snapshot.exists());
      
      const savedData = snapshot.val();
      
      if (savedData) {
        console.log('✅ Lab data found:', Object.keys(savedData));
        
        // Restore saved state
        if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
        if (savedData.sectionContent) setSectionContent(savedData.sectionContent);
        if (savedData.observationData) {
          // Merge saved data with default data to ensure all groups are available
          setObservationData(prev => ({
            ...prev,
            ...savedData.observationData
          }));
        }
        if (savedData.analysisData) {
          // Merge saved data with default structure to ensure all fields exist
          setAnalysisData(prev => ({
            ...prev,
            ...savedData.analysisData,
            // Ensure calculatedOneOverRSquared is always an array
            calculatedOneOverRSquared: savedData.analysisData.calculatedOneOverRSquared || prev.calculatedOneOverRSquared
          }));
        }
        if (savedData.currentSection) setCurrentSection(savedData.currentSection);
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);
        
        setHasSavedProgress(true);
      } else {
        console.log('📝 No previous lab data found, starting fresh');
      }
      
      // Unsubscribe after first load
      unsubscribe();
    }, (error) => {
      if (hasLoaded) return;
      hasLoaded = true;
      
      console.error('❌ Firebase load error:', error);
      setNotification({ 
        message: 'Failed to load lab data', 
        type: 'error', 
        visible: true 
      });
      unsubscribe();
    });
    
    // Return cleanup function for useEffect
    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-hide notifications
  useEffect(() => {
    if (notification.visible) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification.visible]);

  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('hypothesis');
    
    // Save lab start to Firebase
    saveToFirebase({
      labStarted: true,
      currentSection: 'hypothesis'
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // End lab session
  const endLabSession = () => {
    setLabStarted(false);
    setNotification({ 
      message: 'Lab session ended. Your progress has been saved automatically.', 
      type: 'success', 
      visible: true 
    });
  };

  // Submit lab for teacher review
  const submitLab = async () => {
    if (!currentUser?.uid) {
      toast.error('You must be logged in to submit your lab.');
      return;
    }

    setIsSaving(true);
    
    try {
      const functions = getFunctions();
      const submitLabFunction = httpsCallable(functions, 'course2_lab_submit');
      
      console.log('🚀 Submitting lab for review...');
      
      const result = await submitLabFunction({
        courseId: courseId,
        questionId: questionId,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        isStaff: false
      });
      
      console.log('✅ Lab submitted successfully:', result.data);
      
      toast.success('Lab submitted successfully! Your teacher can now review your work.');
      
    } catch (error) {
      console.error('❌ Lab submission failed:', error);
      toast.error(`Failed to submit lab: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Check if lab is ready for submission
  const isReadyForSubmission = () => {
    const completedSections = Object.values(sectionStatus).filter(status => status === 'completed').length;
    return completedSections >= 3; // Require at least 3 of 4 sections completed
  };

  // Update section content
  const updateSectionContent = (section, content) => {
    // Update local state
    const newSectionContent = {
      ...sectionContent,
      [section]: content
    };
    setSectionContent(newSectionContent);
    
    // Determine completion status
    let isCompleted = false;
    let newStatus = 'not-started';
    
    if (content.trim().length > 0) {
      if (section === 'hypothesis') {
        // Check for required words: if, then, because
        const lowerContent = content.toLowerCase();
        const hasIf = lowerContent.includes('if');
        const hasThen = lowerContent.includes('then');
        const hasBecause = lowerContent.includes('because');
        isCompleted = hasIf && hasThen && hasBecause && content.trim().length > 20;
      } else if (section === 'conclusion') {
        // Check for minimum 2 sentences for post-lab question
        const sentenceCount = countSentences(content);
        isCompleted = sentenceCount >= 2 && content.trim().length > 30;
      } else {
        isCompleted = content.trim().length > 20;
      }
      newStatus = isCompleted ? 'completed' : 'in-progress';
    }
    
    // Update local status state
    const newSectionStatus = {
      ...sectionStatus,
      [section]: newStatus
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      sectionContent: newSectionContent,
      sectionStatus: newSectionStatus
    });
  };

  // Helper function to count sentences
  const countSentences = (text) => {
    if (!text || text.trim().length === 0) return 0;
    
    const normalizedText = text.trim().replace(/\s+/g, ' ');
    const sentences = normalizedText.split(/[.!?]+/).filter(sentence => {
      const trimmed = sentence.trim();
      const wordCount = trimmed.split(/\s+/).filter(word => word.length > 0).length;
      return trimmed.length > 0 && wordCount >= 3;
    });
    
    return sentences.length;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500">✓</span>;
      case 'in-progress':
        return <span className="text-yellow-500">◐</span>;
      default:
        return <span className="text-gray-300">○</span>;
    }
  };

  // Get status color for section
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  // Scroll to section
  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Save current section
    saveToFirebase({ currentSection: sectionId });
  };

  // Count completed sections
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;

  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
  };


  // Update selected group for observations
  const updateSelectedGroup = (group) => {
    const newObservationData = {
      ...observationData,
      selectedGroup: group
    };
    setObservationData(newObservationData);
    
    // Mark observations as completed
    setSectionStatus(prev => ({
      ...prev,
      observations: 'completed'
    }));
    
    // Save to Firebase
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: {
        ...sectionStatus,
        observations: 'completed'
      }
    });
  };

  // Update analysis data and save to Firebase
  const updateAnalysisData = (field, value, index = null) => {
    let newAnalysisData;
    
    if (index !== null) {
      // Handle array fields like calculatedOneOverRSquared
      const currentArray = analysisData[field] || ['', '', '', '', '', ''];
      const newArray = [...currentArray];
      newArray[index] = value;
      newAnalysisData = {
        ...analysisData,
        [field]: newArray
      };
    } else {
      // Handle regular fields
      newAnalysisData = {
        ...analysisData,
        [field]: value
      };
    }
    
    setAnalysisData(newAnalysisData);
    
    // Check if analysis is completed (basic validation)
    const isCompleted = checkAnalysisCompletion(newAnalysisData);
    
    // Update section status
    setSectionStatus(prev => ({
      ...prev,
      analysis: isCompleted ? 'completed' : 'in-progress'
    }));
    
    // Save to Firebase
    saveToFirebase({
      analysisData: newAnalysisData,
      sectionStatus: {
        ...sectionStatus,
        analysis: isCompleted ? 'completed' : 'in-progress'
      }
    });
  };

  // Check if analysis section is completed
  const checkAnalysisCompletion = (data) => {
    // Check if at least 4 of 6 1/r² values are filled
    const oneOverRSquaredArray = data.calculatedOneOverRSquared || [];
    const oneOverRSquaredCount = oneOverRSquaredArray.filter(val => val && val.toString().trim().length > 0).length;
    
    // Check if key explanation fields are filled
    const hasExplanations = (data.xAxisVariable || '').trim().length > 0 && 
                           (data.yAxisVariable || '').trim().length > 0 &&
                           (data.lineStrateningExplanation || '').trim().length > 10 &&
                           (data.slopeValue || '').trim().length > 0 &&
                           (data.chargeValue || '').trim().length > 0;
    
    return oneOverRSquaredCount >= 4 && hasExplanations;
  };

  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Lab 4 - Electrostatic Charge Measurement
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Determine the unknown charge on a pith ball using Coulomb's law
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this lab, you will perform a variation of Coulomb's experiment to measure the unknown 
                charge on a pith ball. The pith ball will be hanging in a spring-loaded device near a 
                metal sphere with a known charge of <strong>-3.59 × 10⁻⁷ C</strong>.
              </p>
              <p>
                You will analyze force measurements at different distances and use line straightening 
                techniques to determine the charge on the pith ball.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objective:</p>
                <p className="text-blue-700">Determine the charge on the pith ball using Coulomb's law analysis</p>
              </div>
            </div>
          </div>

          {/* Start Lab Box */}
          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {hasSavedProgress ? 'Welcome Back!' : 'Ready to Begin?'}
              </h2>
              <p className="text-gray-600 mb-4">
                {hasSavedProgress 
                  ? 'Your progress has been saved. You can continue where you left off.'
                  : 'This lab contains hypothesis, observations, analysis, and conclusion sections.'
                }
              </p>
              
              {/* Progress Summary for returning students */}
              {hasSavedProgress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Progress:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {Object.entries(sectionStatus).map(([section, status]) => (
                      <div key={section} className="flex items-center gap-1">
                        <span className={`text-xs ${
                          status === 'completed' ? 'text-green-600' : 
                          status === 'in-progress' ? 'text-yellow-600' : 
                          'text-gray-400'
                        }`}>
                          {status === 'completed' ? '✓' : 
                           status === 'in-progress' ? '◐' : '○'}
                        </span>
                        <span className="text-xs text-gray-600 capitalize">
                          {section}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {completedCount} of 4 sections completed
                  </p>
                </div>
              )}
              
              <button
                onClick={startLab}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200 text-lg"
              >
                {hasSavedProgress ? 'Continue Lab' : 'Start Lab'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="lab-content" className="space-y-6">
      <style dangerouslySetInnerHTML={{__html: `
        /* Hide number input spinners */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}} />
       
      {/* Navigation Header */}
      <div className="sticky top-14 z-10 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-2">
            {/* Navigation Buttons */}
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'hypothesis', label: 'Hypothesis' },
                { key: 'observations', label: 'Observations' },
                { key: 'analysis', label: 'Analysis' },
                { key: 'conclusion', label: 'Post-Lab Question' }
              ].map(section => {
                const sectionStatusValue = sectionStatus[section.key];
                
                return (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.key)}
                    className={`px-3 py-1 text-sm font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
                      sectionStatusValue === 'completed'
                        ? 'bg-green-100 border-green-300 text-green-700'
                        : sectionStatusValue === 'in-progress'
                        ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                        : currentSection === section.key 
                        ? 'bg-blue-100 border-blue-300 text-blue-700' 
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span>{section.label}</span>
                    {sectionStatusValue === 'completed' && <span className="text-green-600">✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 ml-4">
              <button
                onClick={endLabSession}
                className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-all duration-200"
              >
                End Session
              </button>
              
              {isReadyForSubmission() && (
                <button
                  onClick={submitLab}
                  disabled={isSaving}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                >
                  {isSaving ? 'Submitting...' : 'Submit Lab'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification */}
      {notification.visible && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-100 border border-red-300 text-red-700' :
          notification.type === 'warning' ? 'bg-yellow-100 border border-yellow-300 text-yellow-700' :
          'bg-green-100 border border-green-300 text-green-700'
        }`}>
          {notification.type === 'error' ? <AlertTriangle size={20} /> : <CheckCircle size={20} />}
          <span>{notification.message}</span>
          <button 
            onClick={() => setNotification(prev => ({ ...prev, visible: false }))}
            className="ml-2 text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Hypothesis Section */}
      <div id="section-hypothesis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.hypothesis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Hypothesis</span>
          {getStatusIcon(sectionStatus.hypothesis)}
        </h2>
        <div className="space-y-4">
          <p className="text-gray-700 text-sm">
            Write a hypothesis predicting the relationship between the electric force and the distance between the charges. 
            Use the format: "If... then... because..."
          </p>
          <textarea
            value={sectionContent.hypothesis}
            onChange={(e) => updateSectionContent('hypothesis', e.target.value)}
            placeholder="If the distance between the charges is increased, then..."
            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {sectionContent.hypothesis.length} characters
            </span>
            {(() => {
              const content = sectionContent.hypothesis.toLowerCase();
              const hasIf = content.includes('if');
              const hasThen = content.includes('then');
              const hasBecause = content.includes('because');
              const hasLength = sectionContent.hypothesis.trim().length > 20;
              
              if (hasIf && hasThen && hasBecause && hasLength) {
                return <span className="text-xs text-green-600">Complete hypothesis format</span>;
              } else if (sectionContent.hypothesis.trim().length > 0) {
                const missing = [];
                if (!hasIf) missing.push('if');
                if (!hasThen) missing.push('then');
                if (!hasBecause) missing.push('because');
                
                if (missing.length > 0) {
                  return <span className="text-xs text-yellow-600">Need: {missing.join(', ')}</span>;
                } else if (!hasLength) {
                  return <span className="text-xs text-yellow-600">Need more detail</span>;
                }
              }
              return null;
            })()}
          </div>
        </div>
      </div>

      {/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.observations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Observations</span>
          {getStatusIcon(sectionStatus.observations)}
        </h2>
        <div className="space-y-6">
          {/* Qualitative Observations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Qualitative Observations</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">
              {observationData.qualitative}
            </p>
          </div>

          {/* Quantitative Data */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Quantitative Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select one group's data to use for your analysis:
            </p>
            
            {/* Group Selection Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              {[
                { key: 'alpha', label: 'Group Alpha' },
                { key: 'beta', label: 'Group Beta' },
                { key: 'gamma', label: 'Group Gamma' },
                { key: 'epsilon', label: 'Group Epsilon' }
              ].map(group => (
                <button
                  key={group.key}
                  onClick={() => updateSelectedGroup(group.key)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    observationData.selectedGroup === group.key
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Selected Data Table */}
            {observationData.selectedGroup && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-700 mb-3">
                  Selected Data: Group {observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border border-gray-200 rounded">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-3 border-b text-left">Trial</th>
                        <th className="p-3 border-b text-left">r (m)</th>
                        <th className="p-3 border-b text-left">Fe (N)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        let selectedData;
                        
                        switch (observationData.selectedGroup) {
                          case 'alpha':
                            selectedData = observationData.groupAlpha;
                            break;
                          case 'beta':
                            selectedData = observationData.groupBeta;
                            break;
                          case 'gamma':
                            selectedData = observationData.groupGamma;
                            break;
                          case 'epsilon':
                            selectedData = observationData.groupEpsilon;
                            break;
                          default:
                            selectedData = [];
                        }
                        
                        return selectedData?.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{row.trial}</td>
                            <td className="p-3 border-b">{row.r.toFixed(3)}</td>
                            <td className="p-3 border-b">{row.Fe.toFixed(4)}</td>
                          </tr>
                        )) || [];
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Instruction when no group selected */}
            {!observationData.selectedGroup && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Select a group above to view the data table</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div id="section-analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.analysis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Analysis</span>
          {getStatusIcon(sectionStatus.analysis)}
        </h2>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Instructions:</strong> Use line straightening technique to determine the charge on the pith ball. 
              According to Coulomb's law: Fe = k|q₁||q₂|/r²
            </p>
            <p className="text-sm text-blue-700">
              Complete the calculations and explanations below using your selected observation data.
            </p>
          </div>

          {/* Data Table with Student Calculations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 1: Calculate 1/r² Values</h3>
            <p className="text-sm text-gray-600 mb-4">
              Fill in the 1/r² column using your selected observation data:
            </p>
            
            {observationData.selectedGroup ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 border-b text-left">Trial</th>
                      <th className="p-3 border-b text-left">r (m)</th>
                      <th className="p-3 border-b text-left">Fe (N)</th>
                      <th className="p-3 border-b text-left">1/r² (m⁻²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let selectedData;
                      switch (observationData.selectedGroup) {
                        case 'alpha':
                          selectedData = observationData.groupAlpha;
                          break;
                        case 'beta':
                          selectedData = observationData.groupBeta;
                          break;
                        case 'gamma':
                          selectedData = observationData.groupGamma;
                          break;
                        case 'epsilon':
                          selectedData = observationData.groupEpsilon;
                          break;
                        default:
                          selectedData = [];
                      }
                      
                      return selectedData?.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{row.trial}</td>
                          <td className="p-3 border-b">{row.r.toFixed(3)}</td>
                          <td className="p-3 border-b">{row.Fe.toFixed(4)}</td>
                          <td className="p-3 border-b">
                            <input
                              type="number"
                              step="0.1"
                              value={analysisData.calculatedOneOverRSquared?.[index] || ''}
                              onChange={(e) => updateAnalysisData('calculatedOneOverRSquared', e.target.value, index)}
                              className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="?"
                            />
                          </td>
                        </tr>
                      )) || [];
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">Please select an observation group first</p>
              </div>
            )}
          </div>

          {/* Line Straightening Explanation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 2: Line Straightening Technique</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What variable goes on the x-axis?
                </label>
                <input
                  type="text"
                  value={analysisData.xAxisVariable}
                  onChange={(e) => updateAnalysisData('xAxisVariable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What variable goes on the y-axis?
                </label>
                <input
                  type="text"
                  value={analysisData.yAxisVariable}
                  onChange={(e) => updateAnalysisData('yAxisVariable', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explain why this line straightening technique helps determine the charge:
              </label>
              <textarea
                value={analysisData.lineStrateningExplanation}
                onChange={(e) => updateAnalysisData('lineStrateningExplanation', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder=""
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How does this help determine the charge on the pith ball?
              </label>
              <textarea
                value={analysisData.whyLineStrateningHelps}
                onChange={(e) => updateAnalysisData('whyLineStrateningHelps', e.target.value)}
                className="w-full h-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder=""
              />
            </div>
          </div>

          {/* Slope Calculation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 3: Determine the Slope</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is the slope of your line?
                </label>
                <input
                  type="text"
                  value={analysisData.slopeValue}
                  onChange={(e) => updateAnalysisData('slopeValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units of slope:
                </label>
                <input
                  type="text"
                  readOnly
                  value="N⋅m²"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your calculation or method for determining the slope:
              </label>
              <textarea
                value={analysisData.slopeCalculation}
                onChange={(e) => updateAnalysisData('slopeCalculation', e.target.value)}
                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder=""
              />
            </div>
          </div>

          {/* Charge Calculation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 4: Calculate the Charge</h3>
            
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-700">
                <strong>Given:</strong> Metal sphere charge = -3.59 × 10⁻⁷ C, k = 8.99 × 10⁹ N⋅m²/C²
              </p>
              <p className="text-sm text-gray-700">
                <strong>Relationship:</strong> slope = k|q₁||q₂|/1, so |q₂| = slope/(k|q₁|)
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charge on pith ball:
                </label>
                <input
                  type="text"
                  value={analysisData.chargeValue}
                  onChange={(e) => updateAnalysisData('chargeValue', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder=""
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units:
                </label>
                <input
                  type="text"
                  readOnly
                  value="C (Coulombs)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your calculation for determining the charge:
              </label>
              <textarea
                value={analysisData.chargeCalculation}
                onChange={(e) => updateAnalysisData('chargeCalculation', e.target.value)}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                placeholder=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Post-Lab Question Section */}
      <div id="section-conclusion" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.conclusion)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Post-Lab Question</span>
          {getStatusIcon(sectionStatus.conclusion)}
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg mb-4">
            <h4 className="font-medium text-blue-800 mb-2">Question:</h4>
            <p className="text-sm text-blue-700">
              Explain why it is not necessary to take the force of gravity into account while performing this experiment.
            </p>
          </div>
          
          <div>
            <textarea
              value={sectionContent.conclusion}
              onChange={(e) => updateSectionContent('conclusion', e.target.value)}
              placeholder="The reason we don't need to consider gravity is..."
              className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            />
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-500">
              {sectionContent.conclusion.length} characters
            </span>
            {(() => {
              const sentenceCount = countSentences(sectionContent.conclusion);
              const hasLength = sectionContent.conclusion.trim().length > 30;
              
              if (sentenceCount >= 2 && hasLength) {
                return <span className="text-xs text-green-600">Complete answer</span>;
              } else if (sectionContent.conclusion.trim().length > 0) {
                if (sentenceCount < 2) {
                  return <span className="text-xs text-yellow-600">Need at least 2 sentences</span>;
                } else if (!hasLength) {
                  return <span className="text-xs text-yellow-600">Need more detail</span>;
                }
              }
              return null;
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabElectrostatic;