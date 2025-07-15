import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import { toast } from 'sonner';
import { Info, FileText } from 'lucide-react';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import PhotoelectricSimulation from './PhotoelectricSimulation';

// Add CSS styles for disabled lab inputs
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Disable inputs for submitted labs (student view only) */
    .lab-input-disabled input,
    .lab-input-disabled textarea,
    .lab-input-disabled button:not(.staff-only):not(.print-button):not(.pdf-button):not(.simulation-control),
    .lab-input-disabled select {
      pointer-events: none !important;
      opacity: 0.7 !important;
      cursor: not-allowed !important;
      background-color: #f9fafb !important;
    }

    /* Keep certain elements interactive for staff, print button, pdf button, and simulation controls */
    .lab-input-disabled .staff-only,
    .lab-input-disabled .print-button,
    .lab-input-disabled .pdf-button,
    .lab-input-disabled .simulation-control {
      pointer-events: auto !important;
      opacity: 1 !important;
      cursor: pointer !important;
    }

    /* Disable canvas interactions in simulation */
    .lab-input-disabled canvas {
      pointer-events: none !important;
      opacity: 0.8 !important;
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
 * Lab 8 - Millikan's Photoelectric Experiment for Physics 30
 * Investigates the photoelectric effect to determine Planck's constant
 * Unit: Modern Physics - Quantum Mechanics
 */

const LabPhotoelectricEffect = ({ courseId = '2', course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_millikans_oil_drop']?.questions?.[0]?.questionId || 'course2_lab_photoelectric_effect';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Standard 6-section lab structure
  const [sectionStatus, setSectionStatus] = useState({
    objectives: 'not-started',
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    error_analysis: 'not-started'
  });

  // Section content for text-based sections
  const [sectionContent, setSectionContent] = useState({
    objectivesConfirmed: false,
    procedureConfirmed: false,
    frequencyEffectAnswer: '',
    intensityEffectAnswer: '',
    postLabAnswers: ['', '', ''] // Post-lab questions
  });

  // Observation data - structure for 2 metals with 4 measurements each
  const [observationData, setObservationData] = useState({
    metal1: {
      metalName: '',
      thresholdWavelength: '',
      thresholdFrequency: '',
      measurements: [
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' },
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' },
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' },
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' }
      ]
    },
    metal2: {
      metalName: '',
      thresholdWavelength: '',
      thresholdFrequency: '',
      measurements: [
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' },
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' },
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' },
        { wavelength: '', frequency: '', stopVoltage: '', kineticEnergy: '' }
      ]
    }
  });

  // Analysis data
  const [analysisData, setAnalysisData] = useState({
    frequencyCalculations: '',
    kineticEnergyCalculations: '',
    graphDescription: '',
    metal1ThresholdFreq: '',
    metal1WorkFunction: '',
    metal2ThresholdFreq: '',
    metal2WorkFunction: '',
    planckConstant: '',
    planckConstantCalculation: '',
    sampleCalculationFreq: '',
    sampleCalculationKE: ''
  });

  // Error analysis data
  const [errorAnalysisData, setErrorAnalysisData] = useState({
    acceptedPlanckConstant: '',
    experimentalPlanckConstant: '',
    percentError: '',
    percentErrorCalculation: '',
    errorSources: '',
    comparisonThresholdFreq: ''
  });

  // UI state
  const [currentSection, setCurrentSection] = useState('objectives');
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
        labId: '56-lab-millikans-oil-drop'
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
      if (submittedData.analysisData) setAnalysisData(submittedData.analysisData);
      if (submittedData.errorAnalysisData) setErrorAnalysisData(submittedData.errorAnalysisData);
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
        if (savedData.analysisData) setAnalysisData(savedData.analysisData);
        if (savedData.errorAnalysisData) setErrorAnalysisData(savedData.errorAnalysisData);
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
      setCurrentSection('objectives');
      setSectionStatus(prev => ({
        ...prev,
        objectives: 'not-started'
      }));
    }
  }, [isStaffView, labStarted]);

  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('objectives');
    
    const newSectionStatus = {
      ...sectionStatus,
      objectives: 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save lab start to Firebase
    saveToFirebase({
      labStarted: true,
      currentSection: 'objectives',
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
        analysisData,
        errorAnalysisData
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

  // Section update functions with completion tracking
  const updateSectionContent = (section, field, value, index = null) => {
    let newSectionContent;
    
    if (index !== null) {
      const currentArray = sectionContent[field] || ['', '', ''];
      const newArray = [...currentArray];
      newArray[index] = value;
      newSectionContent = {
        ...sectionContent,
        [field]: newArray
      };
    } else {
      newSectionContent = {
        ...sectionContent,
        [field]: value
      };
    }
    
    setSectionContent(newSectionContent);
    
    // Update section status based on completion
    let newStatus = 'not-started';
    
    if (section === 'objectives') {
      newStatus = newSectionContent.objectivesConfirmed ? 'completed' : 'not-started';
    } else if (section === 'procedure') {
      const hasFrequencyAnswer = newSectionContent.frequencyEffectAnswer?.trim().length > 20;
      const hasIntensityAnswer = newSectionContent.intensityEffectAnswer?.trim().length > 20;
      const procedureConfirmed = newSectionContent.procedureConfirmed;
      newStatus = (hasFrequencyAnswer && hasIntensityAnswer && procedureConfirmed) ? 'completed' : 
                  (hasFrequencyAnswer || hasIntensityAnswer || procedureConfirmed) ? 'in-progress' : 'not-started';
    } else if (section === 'error_analysis') {
      // Check reflection questions completion
      const answeredCount = newSectionContent.postLabAnswers.filter(answer => answer?.trim().length > 20).length;
      newStatus = answeredCount >= 2 ? 'completed' : (answeredCount > 0 ? 'in-progress' : 'not-started');
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

  // Check observations completion
  const checkObservationsCompletion = () => {
    const metal1Complete = observationData.metal1.metalName && 
                          observationData.metal1.thresholdWavelength &&
                          observationData.metal1.measurements.filter(m => m.wavelength && m.frequency).length >= 2;
    
    const metal2Complete = observationData.metal2.metalName && 
                          observationData.metal2.thresholdWavelength &&
                          observationData.metal2.measurements.filter(m => m.wavelength && m.frequency).length >= 2;
    
    if (metal1Complete && metal2Complete) return 'completed';
    if (metal1Complete || metal2Complete) return 'in-progress';
    return 'not-started';
  };

  // Check analysis completion
  const checkAnalysisCompletion = () => {
    const hasCalculations = analysisData.sampleCalculationFreq?.trim().length > 10 &&
                           analysisData.sampleCalculationKE?.trim().length > 10;
    const hasGraphDescription = analysisData.graphDescription?.trim().length > 20;
    const hasPlanckConstant = analysisData.planckConstant?.trim().length > 0;
    const hasAnalysisValues = analysisData.metal1ThresholdFreq && analysisData.metal2ThresholdFreq;

    const completedItems = [hasCalculations, hasGraphDescription, hasPlanckConstant, hasAnalysisValues].filter(Boolean).length;
    
    if (completedItems >= 3) return 'completed';
    if (completedItems >= 1) return 'in-progress';
    return 'not-started';
  };

  // Check error analysis completion
  const checkErrorAnalysisCompletion = () => {
    const hasPercentError = errorAnalysisData.percentError?.toString().length > 0;
    const hasErrorSources = errorAnalysisData.errorSources?.trim().length > 20;
    const hasReflectionAnswers = sectionContent.postLabAnswers.filter(answer => answer?.trim().length > 20).length >= 2;

    const completedItems = [hasPercentError, hasErrorSources, hasReflectionAnswers].filter(Boolean).length;
    
    if (completedItems >= 2) return 'completed';
    if (completedItems >= 1) return 'in-progress';
    return 'not-started';
  };

  // Update completion status when data changes
  useEffect(() => {
    const newSectionStatus = {
      ...sectionStatus,
      observations: checkObservationsCompletion(),
      analysis: checkAnalysisCompletion(),
      error_analysis: checkErrorAnalysisCompletion()
    };
    
    if (JSON.stringify(newSectionStatus) !== JSON.stringify(sectionStatus)) {
      setSectionStatus(newSectionStatus);
      saveToFirebase({ sectionStatus: newSectionStatus });
    }
  }, [observationData, analysisData, errorAnalysisData, sectionContent.postLabAnswers]);

  // Navigation functions
  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Auto-complete simulation section when user navigates to it
    let newSectionStatus = sectionStatus;
    if (sectionId === 'simulation' && sectionStatus.simulation === 'not-started') {
      newSectionStatus = {
        ...sectionStatus,
        simulation: 'completed'
      };
      setSectionStatus(newSectionStatus);
    }
    
    saveToFirebase({ 
      currentSection: sectionId,
      ...(newSectionStatus !== sectionStatus && { sectionStatus: newSectionStatus })
    });
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

  // Handle simulation data export
  const handleSimulationDataExport = (data) => {
    toast.success(`Data exported: ${data.metal} at ${data.wavelength}nm`);
    console.log('Simulation data:', data);
  };

  // Count completed sections
  const sections = [
    { key: 'objectives', label: 'Objectives' },
    { key: 'procedure', label: 'Procedure' },
    { key: 'simulation', label: 'Simulation' },
    { key: 'observations', label: 'Observations' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'error_analysis', label: 'Error Analysis' }
  ];
  
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = sections.length;

  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Lab 8 - Millikan's Photoelectric Experiment</h1>
            <p className="text-lg text-gray-600 mb-8">
              Investigate the photoelectric effect to determine Planck's constant
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this lab, you will explore the photoelectric effect by studying how light frequency and 
                intensity affect photoelectron emission and kinetic energy. Using an interactive simulation, 
                you'll collect data to determine Planck's constant.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objectives:</p>
                <ul className="text-blue-700 mt-2 space-y-1">
                  <li>• Experience the effects of changing frequency and intensity</li>
                  <li>• Determine threshold frequency and work function for metals</li>
                  <li>• Calculate Planck's constant using graphical analysis</li>
                  <li>• Compare experimental results to accepted values</li>
                </ul>
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
                  : 'This lab contains 6 sections with interactive simulations.'
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
                          {section.replace('_', ' ')}
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
      {/* Lab Title and PDF Button - Outside lab-input-disabled */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Lab 8 - Millikan's Photoelectric Experiment</h1>
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

      {/* Objectives Section */}
      <div id="section-objectives" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.objectives)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Objectives</span>
          {getStatusIcon(sectionStatus.objectives)}
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Lab Goals</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Visually experience the effects of changing frequency and intensity on the photoelectric effect</li>
              <li>• Graphically determine threshold frequency, work function, and Planck's constant for metals</li>
              <li>• Use interactive simulation to collect experimental data</li>
              <li>• Compare experimental results with accepted theoretical values</li>
            </ul>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="objectivesConfirmed"
              checked={sectionContent.objectivesConfirmed}
              onChange={(e) => updateSectionContent('objectives', 'objectivesConfirmed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="objectivesConfirmed" className="text-sm text-gray-700">
              I have read and understood the lab objectives. I am ready to begin the photoelectric effect investigation.
            </label>
          </div>
        </div>
      </div>

      {/* Procedure Section */}
      <div id="section-procedure" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.procedure)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Procedure</span>
          {getStatusIcon(sectionStatus.procedure)}
        </h2>
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Part 1: Effects of Frequency and Intensity</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Explore the simulation controls to understand the adjustable variables</li>
              <li>Experiment with intensity, wavelength, and voltage settings</li>
              <li>Observe what happens when you change these parameters</li>
              <li>Answer the analysis questions below based on your observations</li>
            </ol>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is the effect of higher frequency on the photocurrent and kinetic energy of photoelectrons?
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-photoelectric"
                itemId="frequency-effect"
                initialContent={sectionContent.frequencyEffectAnswer || ''}
                onSave={(content) => updateSectionContent('procedure', 'frequencyEffectAnswer', content)}
                onContentChange={(content) => updateSectionContent('procedure', 'frequencyEffectAnswer', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What is the effect of higher intensity on the photocurrent and kinetic energy of photoelectrons?
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-photoelectric"
                itemId="intensity-effect"
                initialContent={sectionContent.intensityEffectAnswer || ''}
                onSave={(content) => updateSectionContent('procedure', 'intensityEffectAnswer', content)}
                onContentChange={(content) => updateSectionContent('procedure', 'intensityEffectAnswer', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Part 2: Millikan's Experiment Steps</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Choose a metal from the simulation's target list</li>
              <li>Set beam control to 50%</li>
              <li>Find threshold wavelength where electrons just start emitting</li>
              <li>Record threshold frequency for comparison with graph results</li>
              <li>Choose shorter wavelengths and adjust stop voltage until electrons barely reach anode</li>
              <li>Record wavelength and stop voltage for at least 4 data points</li>
              <li>Repeat for a second metal with different work function</li>
            </ol>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="procedureConfirmed"
              checked={sectionContent.procedureConfirmed}
              onChange={(e) => updateSectionContent('procedure', 'procedureConfirmed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="procedureConfirmed" className="text-sm text-gray-700">
              I have read and understand the experimental procedure. I am ready to use the simulation for data collection.
            </label>
          </div>
        </div>
      </div>

      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.simulation)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Interactive Simulation</span>
          {getStatusIcon(sectionStatus.simulation)}
        </h2>
        <div className="space-y-4">
          <PhotoelectricSimulation onDataExport={handleSimulationDataExport} />
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Use the simulation above to explore the photoelectric effect and collect data for your observations.
              The Export Data button will help you transfer measurements to the observation tables.
            </p>
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
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Instructions:</strong> Use the simulation above to collect data for two different metals. 
              Record threshold frequencies and then collect 4 measurements per metal with different wavelengths.
            </p>
          </div>

          {/* Trial 1 - Metal 1 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Trial #1</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metal:</label>
                <input
                  type="text"
                  value={observationData.metal1.metalName}
                  onChange={(e) => {
                    const newData = {
                      ...observationData,
                      metal1: { ...observationData.metal1, metalName: e.target.value }
                    };
                    setObservationData(newData);
                    saveToFirebase({ observationData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Sodium (Na)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threshold wavelength (nm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={observationData.metal1.thresholdWavelength}
                  onChange={(e) => {
                    const newData = {
                      ...observationData,
                      metal1: { ...observationData.metal1, thresholdWavelength: e.target.value }
                    };
                    setObservationData(newData);
                    saveToFirebase({ observationData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Converted to frequency (×10¹⁴ Hz):
              </label>
              <input
                type="number"
                step="0.001"
                value={observationData.metal1.thresholdFrequency}
                onChange={(e) => {
                  const newData = {
                    ...observationData,
                    metal1: { ...observationData.metal1, thresholdFrequency: e.target.value }
                  };
                  setObservationData(newData);
                  saveToFirebase({ observationData: newData });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>

            {/* Data Table for Metal 1 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 border-b text-left">Measurement #</th>
                    <th className="p-3 border-b text-left">Wavelength (λ) (nm)</th>
                    <th className="p-3 border-b text-left">Frequency (f) (×10¹⁴ Hz)</th>
                    <th className="p-3 border-b text-left">Stop Voltage (V_stop) (V)</th>
                    <th className="p-3 border-b text-left">Kinetic Energy (E_k) (eV)</th>
                  </tr>
                </thead>
                <tbody>
                  {observationData.metal1.measurements.map((measurement, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{index + 1}</td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.1"
                          value={measurement.wavelength}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal1.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], wavelength: e.target.value };
                            const newData = {
                              ...observationData,
                              metal1: { ...observationData.metal1, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.001"
                          value={measurement.frequency}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal1.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], frequency: e.target.value };
                            const newData = {
                              ...observationData,
                              metal1: { ...observationData.metal1, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.01"
                          value={measurement.stopVoltage}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal1.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], stopVoltage: e.target.value };
                            const newData = {
                              ...observationData,
                              metal1: { ...observationData.metal1, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.001"
                          value={measurement.kineticEnergy}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal1.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], kineticEnergy: e.target.value };
                            const newData = {
                              ...observationData,
                              metal1: { ...observationData.metal1, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trial 2 - Metal 2 */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Trial #2</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Metal:</label>
                <input
                  type="text"
                  value={observationData.metal2.metalName}
                  onChange={(e) => {
                    const newData = {
                      ...observationData,
                      metal2: { ...observationData.metal2, metalName: e.target.value }
                    };
                    setObservationData(newData);
                    saveToFirebase({ observationData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Potassium (K)"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Threshold wavelength (nm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={observationData.metal2.thresholdWavelength}
                  onChange={(e) => {
                    const newData = {
                      ...observationData,
                      metal2: { ...observationData.metal2, thresholdWavelength: e.target.value }
                    };
                    setObservationData(newData);
                    saveToFirebase({ observationData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Converted to frequency (×10¹⁴ Hz):
              </label>
              <input
                type="number"
                step="0.001"
                value={observationData.metal2.thresholdFrequency}
                onChange={(e) => {
                  const newData = {
                    ...observationData,
                    metal2: { ...observationData.metal2, thresholdFrequency: e.target.value }
                  };
                  setObservationData(newData);
                  saveToFirebase({ observationData: newData });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder=""
              />
            </div>

            {/* Data Table for Metal 2 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-3 border-b text-left">Measurement #</th>
                    <th className="p-3 border-b text-left">Wavelength (λ) (nm)</th>
                    <th className="p-3 border-b text-left">Frequency (f) (×10¹⁴ Hz)</th>
                    <th className="p-3 border-b text-left">Stop Voltage (V_stop) (V)</th>
                    <th className="p-3 border-b text-left">Kinetic Energy (E_k) (eV)</th>
                  </tr>
                </thead>
                <tbody>
                  {observationData.metal2.measurements.map((measurement, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{index + 1}</td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.1"
                          value={measurement.wavelength}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal2.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], wavelength: e.target.value };
                            const newData = {
                              ...observationData,
                              metal2: { ...observationData.metal2, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.001"
                          value={measurement.frequency}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal2.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], frequency: e.target.value };
                            const newData = {
                              ...observationData,
                              metal2: { ...observationData.metal2, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.01"
                          value={measurement.stopVoltage}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal2.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], stopVoltage: e.target.value };
                            const newData = {
                              ...observationData,
                              metal2: { ...observationData.metal2, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                      <td className="p-3 border-b">
                        <input
                          type="number"
                          step="0.001"
                          value={measurement.kineticEnergy}
                          onChange={(e) => {
                            const newMeasurements = [...observationData.metal2.measurements];
                            newMeasurements[index] = { ...newMeasurements[index], kineticEnergy: e.target.value };
                            const newData = {
                              ...observationData,
                              metal2: { ...observationData.metal2, measurements: newMeasurements }
                            };
                            setObservationData(newData);
                            saveToFirebase({ observationData: newData });
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          placeholder=""
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Helper Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">Helpful Formulas:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div>
                <p><strong>Frequency from wavelength:</strong></p>
                <div className="bg-white p-2 rounded border mt-1">
                  <InlineMath math="f = \frac{c}{\lambda} = \frac{3.00 \times 10^8}{\lambda \times 10^{-9}}" />
                </div>
              </div>
              <div>
                <p><strong>Kinetic energy from stop voltage:</strong></p>
                <div className="bg-white p-2 rounded border mt-1">
                  <InlineMath math="E_k = eV_{stop}" />
                </div>
              </div>
            </div>
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
            <p className="text-sm text-blue-700">
              <strong>Instructions:</strong> Use your observation data to calculate frequencies and kinetic energies, 
              then create graphs of E_k vs. f for each metal to determine Planck's constant.
            </p>
          </div>

          {/* Sample Calculations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Sample Calculations</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show one sample calculation for determining frequency from wavelength:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-photoelectric"
                  itemId="sample-freq-calculation"
                  initialContent={analysisData.sampleCalculationFreq || ''}
                  onSave={(content) => {
                    const newData = { ...analysisData, sampleCalculationFreq: content };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  onContentChange={(content) => {
                    const newData = { ...analysisData, sampleCalculationFreq: content };
                    setAnalysisData(newData);
                  }}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Show one sample calculation for determining kinetic energy from stop voltage:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-photoelectric"
                  itemId="sample-ke-calculation"
                  initialContent={analysisData.sampleCalculationKE || ''}
                  onSave={(content) => {
                    const newData = { ...analysisData, sampleCalculationKE: content };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  onContentChange={(content) => {
                    const newData = { ...analysisData, sampleCalculationKE: content };
                    setAnalysisData(newData);
                  }}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
            </div>
          </div>

          {/* Graph Creation Instructions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Graphical Analysis</h3>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">Creating E_k vs. f Graphs</h4>
              <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                <li>Plot kinetic energy (E_k) on the y-axis vs. frequency (f) on the x-axis for each metal</li>
                <li>Draw the best-fit line through your data points for each metal</li>
                <li>Extrapolate each line to find where it crosses the x-axis (threshold frequency)</li>
                <li>Calculate the slope of each line (this equals Planck's constant, h)</li>
                <li>Use the y-intercept to determine the work function (W₀ = -y-intercept)</li>
              </ol>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your graph and the relationship you observe between E_k and f:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-photoelectric"
                  itemId="graph-description"
                  initialContent={analysisData.graphDescription || ''}
                  onSave={(content) => {
                    const newData = { ...analysisData, graphDescription: content };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  onContentChange={(content) => {
                    const newData = { ...analysisData, graphDescription: content };
                    setAnalysisData(newData);
                  }}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
            </div>
          </div>

          {/* Metal 1 Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Metal 1 Analysis: {observationData.metal1.metalName || '[Enter metal name in observations]'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold frequency from graph (×10¹⁴ Hz):
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={analysisData.metal1ThresholdFreq}
                  onChange={(e) => {
                    const newData = { ...analysisData, metal1ThresholdFreq: e.target.value };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 mt-1">Compare with your recorded value: {observationData.metal1.thresholdFrequency || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work function (eV):
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={analysisData.metal1WorkFunction}
                  onChange={(e) => {
                    const newData = { ...analysisData, metal1WorkFunction: e.target.value };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 mt-1">W₀ = h × f₀ (from y-intercept)</p>
              </div>
            </div>
          </div>

          {/* Metal 2 Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Metal 2 Analysis: {observationData.metal2.metalName || '[Enter metal name in observations]'}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Threshold frequency from graph (×10¹⁴ Hz):
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={analysisData.metal2ThresholdFreq}
                  onChange={(e) => {
                    const newData = { ...analysisData, metal2ThresholdFreq: e.target.value };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 mt-1">Compare with your recorded value: {observationData.metal2.thresholdFrequency || 'N/A'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Work function (eV):
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={analysisData.metal2WorkFunction}
                  onChange={(e) => {
                    const newData = { ...analysisData, metal2WorkFunction: e.target.value };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
                <p className="text-xs text-gray-500 mt-1">W₀ = h × f₀ (from y-intercept)</p>
              </div>
            </div>
          </div>

          {/* Planck's Constant Calculation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Planck's Constant Determination</h3>
            
            <div className="bg-yellow-50 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Key Relationship:</strong> From Einstein's photoelectric equation: E_k = hf - W₀
                <br />The slope of your E_k vs. f graph equals Planck's constant (h).
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experimental Planck's constant (J·s):
                </label>
                <input
                  type="text"
                  value={analysisData.planckConstant}
                  onChange={(e) => {
                    const newData = { ...analysisData, planckConstant: e.target.value };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 6.5 × 10⁻³⁴"
                />
                <p className="text-xs text-gray-500 mt-1">Average slope from both metals</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  In eV·s:
                </label>
                <input
                  type="text"
                  value={analysisData.planckConstantEV || ''}
                  onChange={(e) => {
                    const newData = { ...analysisData, planckConstantEV: e.target.value };
                    setAnalysisData(newData);
                    saveToFirebase({ analysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 4.1 × 10⁻¹⁵"
                />
                <p className="text-xs text-gray-500 mt-1">Convert: 1 eV = 1.602 × 10⁻¹⁹ J</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your calculation for determining Planck's constant from the slope:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-photoelectric"
                itemId="planck-calculation"
                initialContent={analysisData.planckConstantCalculation || ''}
                onSave={(content) => {
                  const newData = { ...analysisData, planckConstantCalculation: content };
                  setAnalysisData(newData);
                  saveToFirebase({ analysisData: newData });
                }}
                onContentChange={(content) => {
                  const newData = { ...analysisData, planckConstantCalculation: content };
                  setAnalysisData(newData);
                }}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>

          {/* Key Equations Reference */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-3">Key Equations for Analysis:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">Einstein's Equation:</p>
                  <BlockMath math="E_k = hf - W_0" />
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">Frequency from wavelength:</p>
                  <BlockMath math="f = \frac{c}{\lambda}" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">Kinetic energy from voltage:</p>
                  <BlockMath math="E_k = eV_{stop}" />
                </div>
                <div className="bg-white p-3 rounded border">
                  <p className="font-medium">Work function:</p>
                  <BlockMath math="W_0 = hf_0" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Error Analysis Section */}
      <div id="section-error_analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.error_analysis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Error Analysis</span>
          {getStatusIcon(sectionStatus.error_analysis)}
        </h2>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Instructions:</strong> Compare your experimental results with accepted theoretical values 
              and identify possible sources of error in the photoelectric effect experiment.
            </p>
          </div>

          {/* Planck's Constant Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Planck's Constant Comparison</h3>
            
            <div className="bg-yellow-50 p-3 rounded mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Accepted Values:</strong>
                <br />• h = 6.626 × 10⁻³⁴ J·s
                <br />• h = 4.136 × 10⁻¹⁵ eV·s
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted Planck's constant:
                </label>
                <input
                  type="text"
                  value={errorAnalysisData.acceptedPlanckConstant}
                  onChange={(e) => {
                    const newData = { ...errorAnalysisData, acceptedPlanckConstant: e.target.value };
                    setErrorAnalysisData(newData);
                    saveToFirebase({ errorAnalysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="6.626 × 10⁻³⁴ J·s"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your experimental value:
                </label>
                <input
                  type="text"
                  value={errorAnalysisData.experimentalPlanckConstant}
                  onChange={(e) => {
                    const newData = { ...errorAnalysisData, experimentalPlanckConstant: e.target.value };
                    setErrorAnalysisData(newData);
                    saveToFirebase({ errorAnalysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="From your analysis above"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Percent error (%):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={errorAnalysisData.percentError}
                  onChange={(e) => {
                    const newData = { ...errorAnalysisData, percentError: e.target.value };
                    setErrorAnalysisData(newData);
                    saveToFirebase({ errorAnalysisData: newData });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder=""
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quality of result:
                </label>
                <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                  {errorAnalysisData.percentError ? (
                    <span className={`font-medium ${
                      parseFloat(errorAnalysisData.percentError) < 5 ? 'text-green-600' :
                      parseFloat(errorAnalysisData.percentError) < 15 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {parseFloat(errorAnalysisData.percentError) < 5 ? 'Excellent (< 5%)' :
                       parseFloat(errorAnalysisData.percentError) < 15 ? 'Good (5-15%)' :
                       'Needs improvement (> 15%)'}
                    </span>
                  ) : (
                    <span className="text-gray-500">Enter percent error above</span>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your percent error calculation:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-photoelectric"
                itemId="percent-error-calculation"
                initialContent={errorAnalysisData.percentErrorCalculation || ''}
                onSave={(content) => {
                  const newData = { ...errorAnalysisData, percentErrorCalculation: content };
                  setErrorAnalysisData(newData);
                  saveToFirebase({ errorAnalysisData: newData });
                }}
                onContentChange={(content) => {
                  const newData = { ...errorAnalysisData, percentErrorCalculation: content };
                  setErrorAnalysisData(newData);
                }}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
              <p className="text-xs text-gray-500 mt-1">
                Formula: % Error = |Experimental - Accepted| / Accepted × 100%
              </p>
            </div>
          </div>

          {/* Threshold Frequency Comparison */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Threshold Frequency Comparison</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compare your threshold frequencies from direct measurement vs. graph extrapolation. 
                Comment on the agreement between these two methods:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-photoelectric"
                itemId="threshold-comparison"
                initialContent={errorAnalysisData.comparisonThresholdFreq || ''}
                onSave={(content) => {
                  const newData = { ...errorAnalysisData, comparisonThresholdFreq: content };
                  setErrorAnalysisData(newData);
                  saveToFirebase({ errorAnalysisData: newData });
                }}
                onContentChange={(content) => {
                  const newData = { ...errorAnalysisData, comparisonThresholdFreq: content };
                  setErrorAnalysisData(newData);
                }}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Metal 1: {observationData.metal1.metalName || 'N/A'}</h4>
                <p className="text-sm text-gray-700">Direct: {observationData.metal1.thresholdFrequency || 'N/A'} × 10¹⁴ Hz</p>
                <p className="text-sm text-gray-700">Graph: {analysisData.metal1ThresholdFreq || 'N/A'} × 10¹⁴ Hz</p>
              </div>
              <div className="bg-gray-50 p-3 rounded">
                <h4 className="font-semibold text-gray-800 mb-2">Metal 2: {observationData.metal2.metalName || 'N/A'}</h4>
                <p className="text-sm text-gray-700">Direct: {observationData.metal2.thresholdFrequency || 'N/A'} × 10¹⁴ Hz</p>
                <p className="text-sm text-gray-700">Graph: {analysisData.metal2ThresholdFreq || 'N/A'} × 10¹⁴ Hz</p>
              </div>
            </div>
          </div>

          {/* Sources of Error */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Sources of Error</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identify and explain possible sources of error in this photoelectric effect experiment. 
                Consider both systematic and random errors:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-photoelectric"
                itemId="error-sources"
                initialContent={errorAnalysisData.errorSources || ''}
                onSave={(content) => {
                  const newData = { ...errorAnalysisData, errorSources: content };
                  setErrorAnalysisData(newData);
                  saveToFirebase({ errorAnalysisData: newData });
                }}
                onContentChange={(content) => {
                  const newData = { ...errorAnalysisData, errorSources: content };
                  setErrorAnalysisData(newData);
                }}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div className="mt-4 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-2">Consider these potential error sources:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                <div>
                  <p className="font-medium">Measurement Errors:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Wavelength calibration accuracy</li>
                    <li>Stop voltage measurement precision</li>
                    <li>Difficulty determining exact threshold</li>
                    <li>Reading uncertainties from simulation</li>
                  </ul>
                </div>
                <div>
                  <p className="font-medium">Systematic Errors:</p>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Metal surface contamination</li>
                    <li>Non-monochromatic light sources</li>
                    <li>Temperature effects on work function</li>
                    <li>Simulation approximations</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Reflection Questions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-4">Reflection Questions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. How does this experiment support the particle nature of light over the wave nature?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-photoelectric"
                  itemId="reflection-question-1"
                  initialContent={sectionContent.postLabAnswers[0] || ''}
                  onSave={(content) => updateSectionContent('error_analysis', 'postLabAnswers', content, 0)}
                  onContentChange={(content) => updateSectionContent('error_analysis', 'postLabAnswers', content, 0)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Why was Einstein awarded the Nobel Prize for his explanation of the photoelectric effect rather than for relativity?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-photoelectric"
                  itemId="reflection-question-2"
                  initialContent={sectionContent.postLabAnswers[1] || ''}
                  onSave={(content) => updateSectionContent('error_analysis', 'postLabAnswers', content, 1)}
                  onContentChange={(content) => updateSectionContent('error_analysis', 'postLabAnswers', content, 1)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. What improvements could be made to this experiment to increase accuracy?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-photoelectric"
                  itemId="reflection-question-3"
                  initialContent={sectionContent.postLabAnswers[2] || ''}
                  onSave={(content) => updateSectionContent('error_analysis', 'postLabAnswers', content, 2)}
                  onContentChange={(content) => updateSectionContent('error_analysis', 'postLabAnswers', content, 2)}
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
          labTitle: 'Lab 8 - Millikan\'s Photoelectric Experiment',
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

export default LabPhotoelectricEffect;

// Also export with the old name for backward compatibility
export { LabPhotoelectricEffect as LabMillikansOilDrop };
