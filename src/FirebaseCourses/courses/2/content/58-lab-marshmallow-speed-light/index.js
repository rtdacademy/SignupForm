import React, { useState, useEffect, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import { toast } from 'sonner';
import { Info, FileText, AlertTriangle } from 'lucide-react';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import { aiPrompt } from './ai-prompt';

// Add CSS styles for disabled lab inputs
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Disable inputs for submitted labs (student view only) */
    .lab-input-disabled input,
    .lab-input-disabled textarea,
    .lab-input-disabled button:not(.staff-only):not(.print-button):not(.pdf-button),
    .lab-input-disabled select {
      pointer-events: none !important;
      opacity: 0.7 !important;
      cursor: not-allowed !important;
      background-color: #f9fafb !important;
    }

    /* Keep certain elements interactive for staff, print button, pdf button */
    .lab-input-disabled .staff-only,
    .lab-input-disabled .print-button,
    .lab-input-disabled .pdf-button {
      pointer-events: auto !important;
      opacity: 1 !important;
      cursor: pointer !important;
    }

    /* Style for the read-only indicator */
    .lab-input-disabled::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(249, 250, 251, 0.1);
      pointer-events: none;
      z-index: 1;
    }
  `;
  document.head.appendChild(styleElement);
}

/**
 * Lab 9 - Marshmallow Speed of Light for Physics 30
 * Unit: Modern Physics / The Nature of the Atom
 */

const LabMarshmallowSpeedLight = ({ courseId = '2', course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_marshmallow_speed_light']?.questions?.[0]?.questionId || 'course2_lab_marshmallow_speed_light';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Lab structure: objective, materials, setup, prelab, observations, calculations
  const [sectionStatus, setSectionStatus] = useState({
    objective: 'not-started',
    materials: 'not-started', 
    setup: 'not-started',
    prelab: 'not-started',
    observations: 'not-started',
    calculations: 'not-started'
  });

  // Section content for text-based sections
  const [sectionContent, setSectionContent] = useState({
    objectiveConfirmed: false,
    materialsConfirmed: false,
    setupConfirmed: false,
    prelabAnswer: ''
  });

  // Observation data
  const [observationData, setObservationData] = useState({
    microwaveFrequency: '',
    microwaveFrequencyUnit: 'GHz',
    qualitativeObservations: '',
    distanceMeasurements: ['', '', '', '', ''], // 5 trials
    distanceUnit: 'cm'
  });

  // Calculation data - all student inputs
  const [calculationData, setCalculationData] = useState({
    averageDistanceCalculation: '',
    averageDistance: '',
    wavelengthCalculation: '',
    wavelength: '',
    wavelengthExplanation: '',
    frequencyConversion: '',
    frequencyHz: '',
    speedLightCalculation: '',
    speedLightExperimental: '',
    acceptedSpeedLight: '',
    percentErrorCalculation: '',
    percentError: '',
    errorSources: '',
    standingWaveExplanation: '',
    antinodeExplanation: '',
    improvementSuggestions: ''
  });

  // UI state
  const [currentSection, setCurrentSection] = useState('objective');
  const [labStarted, setLabStarted] = useState(false);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  
  // Check if lab is submitted
  const isSubmitted = course?.Assessments?.[questionId] !== undefined;

  // Save to Firebase with direct database integration
  const saveToFirebase = useCallback(async (dataToUpdate) => {
    if (!currentUser?.uid || !labDataRef || isSubmitted) {
      console.log('🚫 Save blocked: no user, no ref, or already submitted');
      return;
    }
    
    try {
      console.log('💾 Saving to Firebase:', dataToUpdate);
      
      const dataToSave = {
        ...dataToUpdate,
        lastModified: serverTimestamp(),
        courseId: courseId,
        labId: '58-lab-marshmallow-speed-light'
      };
      
      await update(labDataRef, dataToSave);
      console.log('✅ Save successful!');
      setHasSavedProgress(true);
      
    } catch (error) {
      console.error('❌ Save failed:', error);
      toast.error('Failed to save data. Please try again.');
    }
  }, [currentUser?.uid, labDataRef, courseId, isSubmitted]);

  // Load saved data from Firebase
  useEffect(() => {
    // If lab is submitted, use data from course.Assessments
    if (isSubmitted && course?.Assessments?.[questionId]) {
      console.log('📋 Lab is submitted, loading from course.Assessments');
      const submittedData = course.Assessments[questionId];
      
      // Restore saved state
      if (submittedData.sectionStatus) setSectionStatus(submittedData.sectionStatus);
      if (submittedData.sectionContent) setSectionContent(submittedData.sectionContent);
      if (submittedData.observationData) setObservationData(submittedData.observationData);
      if (submittedData.calculationData) setCalculationData(submittedData.calculationData);
      if (submittedData.currentSection) setCurrentSection(submittedData.currentSection);
      if (submittedData.labStarted !== undefined) setLabStarted(submittedData.labStarted);
      
      setLabStarted(true);
      setHasSavedProgress(true);
      return;
    }

    // For non-submitted labs, set up real-time listener
    if (!currentUser?.uid || !labDataRef) return;
    
    let hasLoaded = false;
    
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      if (hasLoaded) return;
      hasLoaded = true;
      
      console.log('📡 Firebase data fetched:', snapshot.exists());
      
      const savedData = snapshot.val();
      
      if (savedData) {
        console.log('✅ Lab data found:', Object.keys(savedData));
        
        // Restore saved state
        if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
        if (savedData.sectionContent) setSectionContent(savedData.sectionContent);
        if (savedData.observationData) setObservationData(savedData.observationData);
        if (savedData.calculationData) setCalculationData(savedData.calculationData);
        if (savedData.currentSection) setCurrentSection(savedData.currentSection);
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);
        
        setHasSavedProgress(true);
      } else {
        console.log('📝 No previous lab data found, starting fresh');
      }
      
      unsubscribe();
    }, (error) => {
      if (hasLoaded) return;
      hasLoaded = true;
      
      console.error('❌ Firebase load error:', error);
      toast.error('Failed to load lab data');
      unsubscribe();
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid, labDataRef, isSubmitted, course?.Assessments, questionId]);

  // Auto-start lab for staff view
  useEffect(() => {
    if (isStaffView && !labStarted) {
      setLabStarted(true);
      setCurrentSection('objective');
      setSectionStatus(prev => ({
        ...prev,
        objective: 'not-started'
      }));
    }
  }, [isStaffView, labStarted]);

  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('objective');
    
    const newSectionStatus = {
      ...sectionStatus,
      objective: 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save lab start to Firebase
    saveToFirebase({
      labStarted: true,
      currentSection: 'objective',
      sectionStatus: newSectionStatus
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Submit lab function
  const submitLab = async () => {
    try {
      setIsSaving(true);
      await saveToFirebase({
        sectionStatus,
        sectionContent,
        observationData,
        calculationData
      });
      
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

  // Update section content with completion tracking
  const updateSectionContent = (section, field, value) => {
    const newSectionContent = {
      ...sectionContent,
      [field]: value
    };
    
    setSectionContent(newSectionContent);
    
    // Update section status based on completion
    let newStatus = 'not-started';
    
    if (section === 'objective') {
      newStatus = newSectionContent.objectiveConfirmed ? 'completed' : 'not-started';
    } else if (section === 'materials') {
      newStatus = newSectionContent.materialsConfirmed ? 'completed' : 'not-started';
    } else if (section === 'setup') {
      newStatus = newSectionContent.setupConfirmed ? 'completed' : 'not-started';
    } else if (section === 'prelab') {
      newStatus = newSectionContent.prelabAnswer && newSectionContent.prelabAnswer.trim().length > 20 ? 'completed' : (newSectionContent.prelabAnswer.trim().length > 0 ? 'in-progress' : 'not-started');
    }
    
    const newSectionStatus = {
      ...sectionStatus,
      [section]: newStatus
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      sectionContent: newSectionContent,
      sectionStatus: newSectionStatus
    });
  };

  // Update observation data with completion checking
  const updateObservationData = (field, value, index = null) => {
    let newObservationData;
    
    if (index !== null) {
      const currentArray = observationData[field] || ['', '', '', '', ''];
      const newArray = [...currentArray];
      newArray[index] = value;
      newObservationData = {
        ...observationData,
        [field]: newArray
      };
    } else {
      newObservationData = {
        ...observationData,
        [field]: value
      };
    }
    
    setObservationData(newObservationData);
    
    // Check completion
    const hasFrequency = newObservationData.microwaveFrequency && newObservationData.microwaveFrequency.trim() !== '';
    const hasObservations = newObservationData.qualitativeObservations && newObservationData.qualitativeObservations.trim().length > 20;
    const distanceCount = newObservationData.distanceMeasurements.filter(val => val && val.toString().trim().length > 0).length;
    
    const isCompleted = hasFrequency && hasObservations && distanceCount >= 3;
    
    const newSectionStatus = {
      ...sectionStatus,
      observations: isCompleted ? 'completed' : (hasFrequency || hasObservations || distanceCount > 0 ? 'in-progress' : 'not-started')
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: newSectionStatus
    });
  };

  // Update calculation data with completion checking
  const updateCalculationData = (field, value) => {
    const newCalculationData = {
      ...calculationData,
      [field]: value
    };
    
    setCalculationData(newCalculationData);
    
    // Check completion (needs most key fields filled)
    const requiredFields = ['averageDistance', 'wavelength', 'speedLightExperimental', 'percentError'];
    const isCompleted = requiredFields.every(fieldName => {
      const fieldValue = newCalculationData[fieldName];
      return fieldValue && fieldValue.trim() !== '';
    });
    
    const newSectionStatus = {
      ...sectionStatus,
      calculations: isCompleted ? 'completed' : 'in-progress'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      calculationData: newCalculationData,
      sectionStatus: newSectionStatus
    });
  };

  // Navigation functions
  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    saveToFirebase({ currentSection: sectionId });
  };

  // Helper functions
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

  // Count completed sections
  const sections = [
    { key: 'objective', label: 'Objective' },
    { key: 'materials', label: 'Materials' },
    { key: 'setup', label: 'Set-Up' },
    { key: 'prelab', label: 'Pre-Lab' },
    { key: 'observations', label: 'Observations' },
    { key: 'calculations', label: 'Calculations' }
  ];
  
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = sections.length;

  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Lab 9 - Marshmallow Speed of Light</h1>
            <p className="text-lg text-gray-600 mb-8">
              Measure the speed of light using microwave standing waves and marshmallows
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this lab, you will use a microwave oven to create standing wave patterns and measure 
                the speed of light. By observing where marshmallows melt, you can determine the wavelength 
                of microwaves and calculate the speed of light using the relationship c = λf.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objective:</p>
                <p className="text-blue-700">To measure the speed of light using microwave standing waves</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-red-800">Safety Warning:</p>
                    <p className="text-red-700 text-sm">
                      Be very careful while "cooking" the marshmallows. Do not leave them unattended. 
                      Be ready to turn off the microwave at any moment.
                    </p>
                  </div>
                </div>
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
                  : 'This lab contains 6 sections for measuring the speed of light.'
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
                    {completedCount} of {totalSections} sections completed
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
    <div className="space-y-6">
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

      {/* Lab Title - Outside lab-input-disabled */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab 9 - Marshmallow Speed of Light</h1>
        {isSubmitted && !isStaffView && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Lab Submitted - Read Only
          </div>
        )}
      </div>

      {/* Lab Content with potential input disabling */}
      <div id="lab-content" className={`space-y-6 ${isSubmitted && !isStaffView ? 'lab-input-disabled' : ''}`}>
       
      {/* Navigation Header */}
      <div className="sticky top-14 z-10 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-2">
            {/* Navigation Buttons */}
            <div className="flex gap-1 flex-wrap">
              {sections.map(section => {
                const sectionStatusValue = sectionStatus[section.key];
                
                return (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.key)}
                    className={`px-3 py-1 text-xs font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
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
              {completedCount >= 4 && !isSubmitted && (
                <button
                  onClick={submitLab}
                  disabled={isSaving}
                  className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 transition-all duration-200"
                >
                  {isSaving ? 'Submitting...' : 'Submit Lab'}
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Auto-save indicator */}
        <div className="text-xs text-gray-500 mt-1 text-right">
          {hasSavedProgress && (
            <span className="flex items-center justify-end gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Auto-saved
            </span>
          )}
        </div>
      </div>

      {/* Objective Section */}
      <div id="section-objective" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.objective)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Objective</span>
          {getStatusIcon(sectionStatus.objective)}
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Lab Objective</h3>
            <p className="text-blue-700 text-sm">
              To measure the speed of light using microwave standing waves and marshmallows.
            </p>
          </div>
          
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-red-800 mb-2">⚠️ SAFETY WARNING</h3>
                <p className="text-red-700 text-sm">
                  Be very careful while "cooking" the marshmallows in the microwave. Do not leave them 
                  at any time. Be aware that the main ingredient is sugar, and they could start to burn very 
                  suddenly. Be ready to turn off the microwave at any moment. As long as you only run the 
                  experiment to the point where they start to melt, you will be fine.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="objectiveConfirmed"
              checked={sectionContent.objectiveConfirmed}
              onChange={(e) => updateSectionContent('objective', 'objectiveConfirmed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="objectiveConfirmed" className="text-sm text-gray-700">
              I have read and understood the lab objective and safety warnings. I am ready to proceed.
            </label>
          </div>
        </div>
      </div>

      {/* Materials Section */}
      <div id="section-materials" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.materials)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Materials</span>
          {getStatusIcon(sectionStatus.materials)}
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Required Materials</h3>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Microwave oven
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Bag of marshmallows
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Microwave-safe plate
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Ruler or measuring tape
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                Marker or pen (to mark hot spots)
              </li>
            </ul>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="materialsConfirmed"
              checked={sectionContent.materialsConfirmed}
              onChange={(e) => updateSectionContent('materials', 'materialsConfirmed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="materialsConfirmed" className="text-sm text-gray-700">
              I have gathered all the required materials and am ready to set up the experiment.
            </label>
          </div>
        </div>
      </div>

      {/* Set-Up Section */}
      <div id="section-setup" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.setup)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Experimental Set-Up</span>
          {getStatusIcon(sectionStatus.setup)}
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Setup Procedure</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>
                <strong>Remove the turntable:</strong> Take out the spinning turntable from your microwave. 
                This is essential for creating standing wave patterns.
              </li>
              <li>
                <strong>Arrange marshmallows:</strong> Completely cover the plate in a layer of closely placed 
                marshmallows, making sure that it is only one marshmallow deep (don't stack them). 
                Make sure they are sitting on the plate on their flat end.
              </li>
              <li>
                <strong>Position in microwave:</strong> Place the plate with marshmallows in the center 
                of the microwave.
              </li>
              <li>
                <strong>Start cooking:</strong> Cook the marshmallows until you see them start to melt 
                in a few spots. <strong>Stop immediately</strong> when melting begins.
              </li>
              <li>
                <strong>Mark hot spots:</strong> Quickly mark the spots where melting occurred.
              </li>
              <li>
                <strong>Measure distances:</strong> Measure the distance between adjacent "hot spots." 
                Take several measurements for multiple trials.
              </li>
              <li>
                <strong>Find frequency:</strong> Look for a label on the back of the microwave that 
                lists the exact frequency. If missing, use approximately 2.4 GHz.
              </li>
            </ol>
          </div>
          
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="flex items-start gap-3">
              <Info className="text-yellow-600 mt-1 flex-shrink-0" size={20} />
              <div>
                <h3 className="font-medium text-yellow-800 mb-1">Important Notes</h3>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>• Monitor the marshmallows constantly - do not leave unattended</li>
                  <li>• Stop heating as soon as melting begins</li>
                  <li>• The melted spots occur at antinodes (maximum wave amplitude)</li>
                  <li>• Distance between spots = λ/2 (half wavelength)</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="setupConfirmed"
              checked={sectionContent.setupConfirmed}
              onChange={(e) => updateSectionContent('setup', 'setupConfirmed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="setupConfirmed" className="text-sm text-gray-700">
              I have read and understand the experimental setup procedure and safety requirements.
            </label>
          </div>
        </div>
      </div>

      {/* Pre-Lab Section */}
      <div id="section-prelab" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.prelab)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Pre-Lab Question</span>
          {getStatusIcon(sectionStatus.prelab)}
        </h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Pre-Lab Question:</h3>
            <p className="text-gray-700 text-sm mb-4">
              What is the relationship between the distance between the melted spots and the wavelength of the microwaves?
            </p>
            
            <div className="bg-blue-50 p-3 rounded mb-4">
              <p className="text-blue-700 text-sm">
                <strong>Hint:</strong> Think about standing wave patterns and where antinodes (maximum amplitude points) occur.
              </p>
            </div>
            
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-marshmallow-speed-light"
              itemId="prelab-question"
              initialContent={sectionContent.prelabAnswer || ''}
              onSave={(content) => updateSectionContent('prelab', 'prelabAnswer', content)}
              onContentChange={(content) => updateSectionContent('prelab', 'prelabAnswer', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
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
          {/* Microwave Frequency */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Microwave Frequency</h3>
            <p className="text-sm text-gray-600 mb-4">
              Find the frequency label on the back of your microwave. If not available, use 2.4 GHz.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Microwave Frequency:
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={observationData.microwaveFrequency}
                  onChange={(e) => updateObservationData('microwaveFrequency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="2.45"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units:
                </label>
                <select
                  value={observationData.microwaveFrequencyUnit}
                  onChange={(e) => updateObservationData('microwaveFrequencyUnit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="GHz">GHz</option>
                  <option value="MHz">MHz</option>
                  <option value="Hz">Hz</option>
                </select>
              </div>
            </div>
          </div>

          {/* Qualitative Observations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Qualitative Observations</h3>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Describe what happened during the experiment (melting pattern, timing, etc.):
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-marshmallow-speed-light"
              itemId="qualitative-observations"
              initialContent={observationData.qualitativeObservations || ''}
              onSave={(content) => updateObservationData('qualitativeObservations', content)}
              onContentChange={(content) => updateObservationData('qualitativeObservations', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>

          {/* Distance Measurements */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Distance Measurements</h3>
            <p className="text-sm text-gray-600 mb-4">
              Measure the distance between adjacent hot spots (melted areas). Record multiple trials.
            </p>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 border-b text-left">Trial</th>
                    <th className="p-3 border-b text-left">Distance Between Hot Spots</th>
                    <th className="p-3 border-b text-left">Units</th>
                  </tr>
                </thead>
                <tbody>
                  {observationData.distanceMeasurements.map((distance, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{index + 1}</td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.1"
                          value={distance}
                          onChange={(e) => updateObservationData('distanceMeasurements', e.target.value, index)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.0"
                        />
                      </td>
                      <td className="p-3 border-b text-gray-600">{observationData.distanceUnit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Distance Units:
              </label>
              <select
                value={observationData.distanceUnit}
                onChange={(e) => updateObservationData('distanceUnit', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="cm">cm</option>
                <option value="mm">mm</option>
                <option value="m">m</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Calculations Section */}
      <div id="section-calculations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.calculations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Calculations</span>
          {getStatusIcon(sectionStatus.calculations)}
        </h2>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Instructions:</strong> Calculate the speed of light using the relationship c = λf
            </p>
            <p className="text-sm text-blue-700">
              Key relationships: λ = 2d (where d = distance between hot spots) and c = λf
            </p>
          </div>

          {/* Step 1: Average Distance */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 1: Calculate Average Distance</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show your calculation for average distance between hot spots:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="average-distance-calculation"
                  initialContent={calculationData.averageDistanceCalculation || ''}
                  onSave={(content) => updateCalculationData('averageDistanceCalculation', content)}
                  onContentChange={(content) => updateCalculationData('averageDistanceCalculation', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Average distance (with units):
                </label>
                <input
                  type="text"
                  value={calculationData.averageDistance}
                  onChange={(e) => updateCalculationData('averageDistance', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 6.2 cm"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Wavelength */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 2: Calculate Wavelength</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explain why wavelength equals twice the distance between hot spots:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-marshmallow-speed-light"
                itemId="wavelength-explanation"
                initialContent={calculationData.wavelengthExplanation || ''}
                onSave={(content) => updateCalculationData('wavelengthExplanation', content)}
                onContentChange={(content) => updateCalculationData('wavelengthExplanation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show your calculation for wavelength (λ = 2d):
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="wavelength-calculation"
                  initialContent={calculationData.wavelengthCalculation || ''}
                  onSave={(content) => updateCalculationData('wavelengthCalculation', content)}
                  onContentChange={(content) => updateCalculationData('wavelengthCalculation', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Wavelength (m):
                </label>
                <input
                  type="text"
                  value={calculationData.wavelength}
                  onChange={(e) => updateCalculationData('wavelength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 0.124 m"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Frequency Conversion */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 3: Convert Frequency to Hz</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show your conversion from GHz to Hz:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="frequency-conversion"
                  initialContent={calculationData.frequencyConversion || ''}
                  onSave={(content) => updateCalculationData('frequencyConversion', content)}
                  onContentChange={(content) => updateCalculationData('frequencyConversion', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frequency (Hz):
                </label>
                <input
                  type="text"
                  value={calculationData.frequencyHz}
                  onChange={(e) => updateCalculationData('frequencyHz', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2.45 × 10⁹ Hz"
                />
              </div>
            </div>
          </div>

          {/* Step 4: Speed of Light */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 4: Calculate Speed of Light</h3>
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-700">
                <strong>Relationship:</strong> c = λf
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show your calculation using c = λf:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="speed-light-calculation"
                  initialContent={calculationData.speedLightCalculation || ''}
                  onSave={(content) => updateCalculationData('speedLightCalculation', content)}
                  onContentChange={(content) => updateCalculationData('speedLightCalculation', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experimental speed of light (m/s):
                </label>
                <input
                  type="text"
                  value={calculationData.speedLightExperimental}
                  onChange={(e) => updateCalculationData('speedLightExperimental', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 3.04 × 10⁸ m/s"
                />
              </div>
            </div>
          </div>

          {/* Step 5: Error Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 5: Error Analysis</h3>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted value for speed of light:
                </label>
                <input
                  type="text"
                  value={calculationData.acceptedSpeedLight}
                  onChange={(e) => updateCalculationData('acceptedSpeedLight', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="3.00 × 10⁸ m/s"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percent error (%):
                </label>
                <input
                  type="text"
                  value={calculationData.percentError}
                  onChange={(e) => updateCalculationData('percentError', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 1.3%"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your percent error calculation:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-marshmallow-speed-light"
                itemId="percent-error-calculation"
                initialContent={calculationData.percentErrorCalculation || ''}
                onSave={(content) => updateCalculationData('percentErrorCalculation', content)}
                onContentChange={(content) => updateCalculationData('percentErrorCalculation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identify and explain possible sources of error in this experiment:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-marshmallow-speed-light"
                itemId="error-sources"
                initialContent={calculationData.errorSources || ''}
                onSave={(content) => updateCalculationData('errorSources', content)}
                onContentChange={(content) => updateCalculationData('errorSources', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Explain the physics of standing waves in the microwave:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="standing-wave-explanation"
                  initialContent={calculationData.standingWaveExplanation || ''}
                  onSave={(content) => updateCalculationData('standingWaveExplanation', content)}
                  onContentChange={(content) => updateCalculationData('standingWaveExplanation', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Why do marshmallows melt at the antinodes?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="antinode-explanation"
                  initialContent={calculationData.antinodeExplanation || ''}
                  onSave={(content) => updateCalculationData('antinodeExplanation', content)}
                  onContentChange={(content) => updateCalculationData('antinodeExplanation', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How could you improve the accuracy of this experiment?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-marshmallow-speed-light"
                  itemId="improvement-suggestions"
                  initialContent={calculationData.improvementSuggestions || ''}
                  onSave={(content) => updateCalculationData('improvementSuggestions', content)}
                  onContentChange={(content) => updateCalculationData('improvementSuggestions', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Submit Lab Section */}
      {!isSubmitted && completedCount >= 4 && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ready to Submit?</h3>
            <p className="text-gray-600 mb-6">
              Review your work above, then submit your lab for grading. You can make changes until you submit.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={submitLab}
                disabled={isSaving || !currentUser}
                className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
                  isSaving || !currentUser
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isSaving ? 'Submitting...' : 'Submit Lab for Grading'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div> {/* End lab-content div */}
      
      {/* PostSubmissionOverlay */}
      <PostSubmissionOverlay
        isVisible={showSubmissionOverlay || isSubmitted}
        isStaffView={isStaffView}
        course={course}
        questionId={questionId}
        submissionData={{
          labTitle: 'Lab 9 - Marshmallow Speed of Light',
          completionPercentage: completedCount * (100 / totalSections),
          status: isSubmitted ? 'completed' : 'in-progress',
          timestamp: course?.Assessments?.[questionId]?.timestamp || new Date().toISOString()
        }}
        onContinue={() => {}}
        onViewGradebook={() => {}}
        onClose={() => setShowSubmissionOverlay(false)}
      />
    </div>
  );
};

export default LabMarshmallowSpeedLight;
export { aiPrompt };
