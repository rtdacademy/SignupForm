import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import { toast } from 'sonner';
import { Info, FileText, Magnet } from 'lucide-react';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import ElectromagnetSimulation from './ElectromagnetSimulation';

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
 * Lab 6 - Virtual Electromagnet Construction for Physics 30
 * Unit: Magnetism and Electromagnetism
 */

const LabElectromagnet = ({ courseId = '2', course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_electromagnet']?.questions?.[0]?.questionId || 'course2_lab_electromagnet';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Standard 6-section lab structure
  const [sectionStatus, setSectionStatus] = useState({
    introduction: 'not-started',
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    conclusion: 'not-started'
  });

  // Section content for text-based sections
  const [sectionContent, setSectionContent] = useState({
    introductionConfirmed: false,
    procedureConfirmed: false,
    hypothesis: '',
    equipment: '',
    procedure: '',
    conclusionAnswers: ['', '', ''] // Conclusion questions
  });

  // Observation data - simulation test results
  const [observationData, setObservationData] = useState({
    trials: [], // Array of test configurations and results
    selectedBestConfig: null
  });

  // Analysis data
  const [analysisData, setAnalysisData] = useState({
    hypothesisAnalysis: '',
    factorsAnalysis: '',
    improvementSuggestions: '',
    theoreticalExplanation: ''
  });

  // UI state
  const [currentSection, setCurrentSection] = useState('introduction');
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
        labId: '43-lab-electromagnet'
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
      setCurrentSection('introduction');
      setSectionStatus(prev => ({
        ...prev,
        introduction: 'not-started'
      }));
    }
  }, [isStaffView, labStarted]);

  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('introduction');
    
    const newSectionStatus = {
      ...sectionStatus,
      introduction: 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save lab start to Firebase
    saveToFirebase({
      labStarted: true,
      currentSection: 'introduction',
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
        analysisData
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
    
    if (section === 'introduction') {
      newStatus = newSectionContent.introductionConfirmed ? 'completed' : 'not-started';
    } else if (section === 'procedure') {
      const hasHypothesis = newSectionContent.hypothesis && newSectionContent.hypothesis.trim().length > 20;
      const hasEquipment = newSectionContent.equipment && newSectionContent.equipment.trim().length > 10;
      const hasProcedure = newSectionContent.procedure && newSectionContent.procedure.trim().length > 20;
      const confirmedProcedure = newSectionContent.procedureConfirmed;
      
      if (hasHypothesis && hasEquipment && hasProcedure && confirmedProcedure) {
        newStatus = 'completed';
      } else if (hasHypothesis || hasEquipment || hasProcedure) {
        newStatus = 'in-progress';
      }
    } else if (section === 'conclusion') {
      const answeredCount = newSectionContent.conclusionAnswers.filter(answer => answer.trim().length > 20).length;
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

  // Handle simulation data collection
  const handleSimulationData = (testData) => {
    const newTrials = [...observationData.trials, {
      ...testData,
      timestamp: new Date().toISOString(),
      trialNumber: observationData.trials.length + 1
    }];
    
    const newObservationData = {
      ...observationData,
      trials: newTrials
    };
    
    setObservationData(newObservationData);
    
    // Update observations section status
    const newSectionStatus = {
      ...sectionStatus,
      observations: newTrials.length >= 3 ? 'completed' : 'in-progress'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: newSectionStatus
    });
  };

  // Update analysis data
  const updateAnalysisData = (field, value) => {
    const newAnalysisData = {
      ...analysisData,
      [field]: value
    };
    
    setAnalysisData(newAnalysisData);
    
    // Check completion
    const analysisFields = ['hypothesisAnalysis', 'factorsAnalysis', 'improvementSuggestions'];
    const isCompleted = analysisFields.every(fieldName => {
      const fieldValue = newAnalysisData[fieldName];
      return fieldValue && fieldValue.trim().length > 20;
    });
    
    const newSectionStatus = {
      ...sectionStatus,
      analysis: isCompleted ? 'completed' : 'in-progress'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      analysisData: newAnalysisData,
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

  // Count completed sections
  const sections = [
    { key: 'introduction', label: 'Introduction' },
    { key: 'procedure', label: 'Procedure' },
    { key: 'simulation', label: 'Simulation' },
    { key: 'observations', label: 'Observations' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'conclusion', label: 'Conclusion' }
  ];
  
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = sections.length;

  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <Magnet className="mx-auto h-16 w-16 text-blue-600 mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab 6 - Virtual Electromagnet Construction</h1>
            <p className="text-lg text-gray-600 mb-8">
              Design and test virtual electromagnets to explore the factors that affect magnetic field strength
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this virtual lab, you will construct and test electromagnets using an interactive simulation. 
                You'll explore how different factors like wire length, core material, and battery voltage affect 
                the magnetic field strength and lifting capability of your electromagnet.
              </p>
              <p>
                This lab focuses on the scientific method and lab report writing skills. You'll form hypotheses, 
                collect data systematically, and analyze your results to understand electromagnetic principles.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objective:</p>
                <p className="text-blue-700">Determine which factors most significantly affect electromagnet strength and create an optimized design</p>
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
                  : 'This lab contains 6 sections using the virtual electromagnet simulation.'
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
      {/* Lab Title */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Lab 6 - Virtual Electromagnet Construction</h1>
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

      {/* Introduction Section */}
      <div id="section-introduction" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.introduction)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Introduction</span>
          {getStatusIcon(sectionStatus.introduction)}
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-medium text-blue-800 mb-2">Lab Objectives</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Understand the relationship between current, magnetic field, and electromagnetic force</li>
              <li>• Investigate how wire length, core material, and voltage affect electromagnet strength</li>
              <li>• Design an optimized electromagnet using scientific methodology</li>
              <li>• Practice forming hypotheses and analyzing experimental data</li>
            </ul>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Theoretical Background</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                An electromagnet is created when electric current flows through a wire wrapped around a ferromagnetic core. 
                The magnetic field strength depends on several factors:
              </p>
              <div className="bg-white p-3 rounded border">
                <BlockMath math="B = \mu \frac{NI}{L}" />
              </div>
              <p>Where:</p>
              <ul className="ml-4 space-y-1">
                <li>• B = Magnetic field strength</li>
                <li>• μ = Permeability of the core material</li>
                <li>• N = Number of wire turns</li>
                <li>• I = Current through the wire</li>
                <li>• L = Length of the coil</li>
              </ul>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="introductionConfirmed"
              checked={sectionContent.introductionConfirmed}
              onChange={(e) => updateSectionContent('introduction', 'introductionConfirmed', e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="introductionConfirmed" className="text-sm text-gray-700">
              I have read and understood the lab introduction, objectives, and theoretical background. I am ready to begin the virtual experiment.
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
        <div className="space-y-4">
          
          {/* Hypothesis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hypothesis: What factors do you think will most affect electromagnet strength, and why?
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="hypothesis"
              initialContent={sectionContent.hypothesis || ''}
              onSave={(content) => updateSectionContent('procedure', 'hypothesis', content)}
              onContentChange={(content) => updateSectionContent('procedure', 'hypothesis', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>

          {/* Equipment List */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Virtual Equipment List: List the virtual components available in the simulation
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="equipment"
              initialContent={sectionContent.equipment || ''}
              onSave={(content) => updateSectionContent('procedure', 'equipment', content)}
              onContentChange={(content) => updateSectionContent('procedure', 'equipment', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>

          {/* Procedure Steps */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Experimental Procedure: Describe your plan for testing different electromagnet configurations
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="procedure"
              initialContent={sectionContent.procedure || ''}
              onSave={(content) => updateSectionContent('procedure', 'procedure', content)}
              onContentChange={(content) => updateSectionContent('procedure', 'procedure', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
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
              I have completed my hypothesis, equipment list, and experimental procedure. I am ready to begin testing.
            </label>
          </div>
        </div>
      </div>

      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.simulation)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Virtual Simulation</span>
          {getStatusIcon(sectionStatus.simulation)}
        </h2>
        <div className="space-y-4">
          <ElectromagnetSimulation onDataCollected={handleSimulationData} />
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Use the simulation above to test different electromagnet configurations. 
              Each test will automatically be recorded in your observations section below.
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
          
          {observationData.trials.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-sm">Run tests in the simulation section above to collect data</p>
            </div>
          ) : (
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Test Results Data Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 border-b text-left">Trial</th>
                      <th className="p-3 border-b text-left">Wire Length (m)</th>
                      <th className="p-3 border-b text-left">Wire Turns</th>
                      <th className="p-3 border-b text-left">Core Material</th>
                      <th className="p-3 border-b text-left">Voltage (V)</th>
                      <th className="p-3 border-b text-left">Current (A)</th>
                      <th className="p-3 border-b text-left">Paper Clips</th>
                      <th className="p-3 border-b text-left">Screws</th>
                      <th className="p-3 border-b text-left">Nails</th>
                      <th className="p-3 border-b text-left">Iron Rod</th>
                      <th className="p-3 border-b text-left">Strength</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observationData.trials.map((trial, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="p-3 border-b">{trial.trialNumber}</td>
                        <td className="p-3 border-b">{trial.config.wireLength}</td>
                        <td className="p-3 border-b">{trial.config.wireTurns}</td>
                        <td className="p-3 border-b">{trial.config.coreMaterial}</td>
                        <td className="p-3 border-b">{trial.config.batteryVoltage}</td>
                        <td className="p-3 border-b">{trial.config.current}</td>
                        <td className="p-3 border-b">{trial.results.paperClips}</td>
                        <td className="p-3 border-b">{trial.results.screws}</td>
                        <td className="p-3 border-b">{trial.results.nails}</td>
                        <td className="p-3 border-b">{trial.results.ironRod ? 'Yes' : 'No'}</td>
                        <td className="p-3 border-b">{trial.results.magneticStrength}/100</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {observationData.trials.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Recommendation:</strong> Run at least 3-5 different tests with varying configurations to get good data for analysis.
                Try changing one variable at a time to see its isolated effect.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Analysis Section */}
      <div id="section-analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.analysis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Analysis</span>
          {getStatusIcon(sectionStatus.analysis)}
        </h2>
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hypothesis Analysis: Was your hypothesis correct? What did you learn about the factors affecting electromagnet strength?
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="hypothesis-analysis"
              initialContent={analysisData.hypothesisAnalysis || ''}
              onSave={(content) => updateAnalysisData('hypothesisAnalysis', content)}
              onContentChange={(content) => updateAnalysisData('hypothesisAnalysis', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factor Analysis: Compare the effects of wire length/turns, core material, and voltage/current. Which had the biggest impact?
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="factors-analysis"
              initialContent={analysisData.factorsAnalysis || ''}
              onSave={(content) => updateAnalysisData('factorsAnalysis', content)}
              onContentChange={(content) => updateAnalysisData('factorsAnalysis', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Design Improvements: Based on your results, how would you design an optimal electromagnet? What limitations did you encounter?
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="improvement-suggestions"
              initialContent={analysisData.improvementSuggestions || ''}
              onSave={(content) => updateAnalysisData('improvementSuggestions', content)}
              onContentChange={(content) => updateAnalysisData('improvementSuggestions', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>

        </div>
      </div>

      {/* Conclusion Section */}
      <div id="section-conclusion" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.conclusion)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Conclusion Questions</span>
          {getStatusIcon(sectionStatus.conclusion)}
        </h2>
        <div className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              1. How does the relationship B = μNI/L help explain why electromagnets can be much stronger than permanent magnets?
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="conclusion-question-1"
              initialContent={sectionContent.conclusionAnswers[0] || ''}
              onSave={(content) => updateSectionContent('conclusion', 'conclusionAnswers', content, 0)}
              onContentChange={(content) => updateSectionContent('conclusion', 'conclusionAnswers', content, 0)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              2. Why might a real electromagnet behave differently from this simulation? What factors are simplified here?
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="conclusion-question-2"
              initialContent={sectionContent.conclusionAnswers[1] || ''}
              onSave={(content) => updateSectionContent('conclusion', 'conclusionAnswers', content, 1)}
              onContentChange={(content) => updateSectionContent('conclusion', 'conclusionAnswers', content, 1)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              3. Describe at least two real-world applications where electromagnets are used and explain why they're better than permanent magnets for those uses.
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electromagnet"
              itemId="conclusion-question-3"
              initialContent={sectionContent.conclusionAnswers[2] || ''}
              onSave={(content) => updateSectionContent('conclusion', 'conclusionAnswers', content, 2)}
              onContentChange={(content) => updateSectionContent('conclusion', 'conclusionAnswers', content, 2)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
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
          labTitle: 'Lab 6 - Virtual Electromagnet Construction',
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

export default LabElectromagnet;
