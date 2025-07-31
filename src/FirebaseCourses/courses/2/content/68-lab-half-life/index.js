
import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import { toast } from 'sonner';
import { Info, FileText, Activity, Calculator, Target, Zap, Clock, CheckCircle2 } from 'lucide-react';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import GeigerCounterSimulation from './GeigerCounterSimulation';

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
 * Lab 10 - Radioactive Half-Life Investigation for Physics 30
 * Unit: Modern Physics - Nuclear Physics
 */

const LabHalfLife = ({ courseId = '2', course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_half_life']?.questions?.[0]?.questionId || 'course2_lab_half_life';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Lab state management
  const [labStarted, setLabStarted] = useState(false);
  const [currentSection, setCurrentSection] = useState('introduction');
  
  // Standard 6-section lab structure
  const [sectionStatus, setSectionStatus] = useState({
    introduction: 'not-started',
    prelab: 'not-started',
    investigation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    conclusions: 'not-started'
  });

  // Section content for text-based sections
  const [sectionContent, setSectionContent] = useState({
    introductionConfirmed: false,
    prelabAnswers: ['', '', '', ''], // 4 pre-lab questions
    investigationPlan: '',
    procedureNotes: '',
    postLabAnswers: ['', '', ''] // Post-lab questions
  });

  // Observation data from Geiger counter
  const [observationData, setObservationData] = useState({
    selectedIsotope: '',
    backgroundCPM: 25,
    measurements: [],
    totalMeasurementTime: 0,
    dataQuality: 'good'
  });

  // Analysis data with linearization
  const [analysisData, setAnalysisData] = useState({
    linearizedData: [],
    calculatedHalfLife: '',
    decayConstant: '',
    correlationCoefficient: '',
    graphAnalysis: '',
    uncertaintyAnalysis: '',
    manualSlope: '',
    manualIntercept: ''
  });

  // Conclusion data
  const [conclusionData, setConclusionData] = useState({
    identifiedIsotope: '',
    justification: '',
    uncertaintyDiscussion: '',
    sourcesOfError: '',
    improvements: ''
  });

  // Submission state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submissionTime, setSubmissionTime] = useState(null);
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Initial load flag
  const isInitialLoad = useRef(true);
  
  // Debounce timer for section status updates
  const statusUpdateTimer = useRef(null);
  
  // Helper function to check if SimpleQuillEditor content has actual text
  const hasQuillContent = (htmlContent) => {
    if (!htmlContent || typeof htmlContent !== 'string') return false;
    // Remove HTML tags and check if there's actual text
    const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
    return textContent.length > 10;
  };
  
  // Scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setCurrentSection(sectionId);
    }
  };
  
  // Load existing data from Firebase
  useEffect(() => {
    if (!labDataRef) return;
    
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        console.log('📊 Loaded lab data:', data);
        
        // Load section status
        if (data.sectionStatus) {
          setSectionStatus(data.sectionStatus);
        }
        
        // Load section content
        if (data.sectionContent) {
          setSectionContent(data.sectionContent);
        }
        
        // Load observation data
        if (data.observationData) {
          setObservationData(data.observationData);
        }
        
        // Load analysis data
        if (data.analysisData) {
          setAnalysisData(data.analysisData);
        }
        
        // Load conclusion data
        if (data.conclusionData) {
          setConclusionData(data.conclusionData);
        }
        
        // Load lab started state
        if (data.labStarted) {
          setLabStarted(true);
          setCurrentSection(data.currentSection || 'introduction');
        }
        
        // Check for saved progress
        if (data.sectionStatus || data.sectionContent || data.observationData) {
          setHasSavedProgress(true);
        }
        
        // Load submission state
        if (data.isSubmitted) {
          setIsSubmitted(true);
          setSubmissionTime(data.submissionTime);
        }
      }
      
      setIsLoading(false);
      isInitialLoad.current = false;
    });
    
    return () => unsubscribe();
  }, [labDataRef]);
  
  // Auto-save function
  const saveData = useCallback(async () => {
    if (!labDataRef || isInitialLoad.current) return;
    
    const dataToSave = {
      sectionStatus,
      sectionContent,
      observationData,
      analysisData,
      conclusionData,
      isSubmitted,
      submissionTime,
      labStarted,
      currentSection,
      lastSaved: serverTimestamp(),
      courseId,
      questionId
    };
    
    try {
      await update(labDataRef, dataToSave);
      console.log('💾 Lab data auto-saved');
      toast.success('Progress saved', {
        duration: 2000,
        icon: '💾'
      });
    } catch (error) {
      console.error('❌ Error saving lab data:', error);
      toast.error('Failed to save progress');
    }
  }, [labDataRef, sectionStatus, sectionContent, observationData, analysisData, conclusionData, isSubmitted, submissionTime, labStarted, currentSection, courseId, questionId]);
  
  // Auto-save every 30 seconds
  useEffect(() => {
    if (!labStarted || !labDataRef || isSubmitted) return;
    
    const interval = setInterval(() => {
      saveData();
    }, 30000); // Save every 30 seconds
    
    return () => clearInterval(interval);
  }, [labStarted, labDataRef, saveData, isSubmitted]);
  
  
  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('introduction');
    
    // Introduction starts as not-started (requires acknowledgment)
    setSectionStatus(prev => ({
      ...prev,
      introduction: 'not-started'
    }));
    
    // Save lab started state
    if (labDataRef) {
      update(labDataRef, { 
        labStarted: true, 
        currentSection: 'introduction',
        lastSaved: serverTimestamp()
      });
    }
  };
  
  // Update section status (immediate)
  const updateSectionStatus = (section, status) => {
    setSectionStatus(prev => ({ ...prev, [section]: status }));
  };
  
  // Debounced section status update function
  const debouncedStatusUpdate = (checkFunction) => {
    if (statusUpdateTimer.current) {
      clearTimeout(statusUpdateTimer.current);
    }
    statusUpdateTimer.current = setTimeout(() => {
      checkFunction();
    }, 1000); // Wait 1 second after user stops typing
  };
  
  // Handle lab submission
  const handleSubmit = async () => {
    setIsSaving(true);
    
    try {
      const functions = getFunctions();
      const submitLab = httpsCallable(functions, 'course2_lab_submit');
      
      const submissionData = {
        courseId,
        questionId,
        labData: {
          sectionStatus,
          sectionContent,
          observationData,
          analysisData,
          conclusionData,
          submissionTime: serverTimestamp()
        }
      };
      
      const result = await submitLab(submissionData);
      
      if (result.data.success) {
        setIsSubmitted(true);
        setSubmissionTime(Date.now());
        setShowSubmissionOverlay(true);
        toast.success('Lab submitted successfully!');
        
        // Final save
        await saveData();
      } else {
        throw new Error(result.data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Error submitting lab:', error);
      toast.error('Failed to submit lab. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Define sections
  const sections = [
    { key: 'introduction', label: 'Introduction' },
    { key: 'prelab', label: 'Pre-Lab' },
    { key: 'investigation', label: 'Investigation' },
    { key: 'observations', label: 'Observations' },
    { key: 'analysis', label: 'Analysis' },
    { key: 'conclusions', label: 'Conclusions' }
  ];
  
  // Calculate completion percentage
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = sections.length;
  
  // Auto-start lab for staff view
  useEffect(() => {
    if (isStaffView && !labStarted) {
      setLabStarted(true);
      setCurrentSection('introduction');
      setSectionStatus(prev => ({
        ...prev,
        introduction: 'not-started' // Staff also needs to acknowledge
      }));
    }
  }, [isStaffView, labStarted]);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lab data...</p>
        </div>
      </div>
    );
  }
  
  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Lab 10 - Radioactive Half-Life Investigation</h1>
            <p className="text-lg text-gray-600 mb-8">
              Use a virtual Geiger counter to identify unknown radioactive isotopes by analyzing decay data
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this lab, you will use a virtual Geiger counter to collect decay data from unknown radioactive isotopes. 
                You'll analyze the data using linearization techniques to determine half-life and identify the isotope.
              </p>
              <p>
                Using exponential decay principles and data linearization, you'll transform the exponential relationship 
                into a linear form to calculate the decay constant and half-life.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objective:</p>
                <p className="text-blue-700">Determine the half-life to identify unknown radioactive isotopes</p>
              </div>
            </div>
          </div>
          
          {/* Lab Objectives */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Objectives</h2>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center gap-2">
                <span className="text-blue-600">•</span>
                <span>Use a virtual Geiger counter to collect radioactive decay data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">•</span>
                <span>Apply linearization techniques to exponential decay data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">•</span>
                <span>Calculate decay constants and half-lives from experimental data</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">•</span>
                <span>Identify unknown isotopes by comparing calculated and theoretical half-lives</span>
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
                  : 'This lab contains 6 sections using the virtual Geiger counter simulation.'
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
      {/* Lab Title - Outside lab-input-disabled */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Lab 10 - Radioactive Half-Life Investigation</h1>
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
          </div>
        </div>

        {/* Section 1: Introduction */}
        <div id="introduction" className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Info className="text-blue-600" />
            1. Introduction & Background
          </h2>
          
          {/* Background Information */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Background: Radioactive Decay</h3>
            <div className="prose max-w-none text-sm space-y-4">
              <p>
                Radioactive decay is a random process where unstable atomic nuclei lose energy by emitting radiation. 
                The rate of decay follows an exponential relationship:
              </p>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <BlockMath math="A(t) = A_0 e^{-\lambda t}" />
                <p className="text-xs mt-2 text-blue-700">
                  Where A(t) is activity at time t, A₀ is initial activity, λ is decay constant
                </p>
              </div>
              
              <p>
                The half-life (t₁/₂) is related to the decay constant by:
              </p>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <BlockMath math="t_{1/2} = \frac{\ln(2)}{\lambda} = \frac{0.693}{\lambda}" />
              </div>
              
              <p>
                A Geiger counter detects ionizing radiation by counting individual particles. 
                The count rate (CPM - counts per minute) is proportional to the activity of the source.
              </p>
            </div>
            
            {/* Safety Protocol */}
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-3">Safety Protocol</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h4 className="font-medium text-red-800 mb-2">⚠️ Important Safety Notice</h4>
                <p className="text-red-700 text-sm">
                  This lab uses a virtual simulation of radioactive materials. In a real laboratory setting, 
                  strict safety protocols would be required including radiation monitoring, protective equipment, 
                  and specialized handling procedures.
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mt-4">
              <input
                type="checkbox"
                id="introduction-confirm"
                checked={sectionContent.introductionConfirmed}
                onChange={() => {
                  setSectionContent(prev => ({ ...prev, introductionConfirmed: true }));
                  updateSectionStatus('introduction', 'completed');
                }}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="introduction-confirm" className="text-sm font-medium">
                I have read and understood the background information and safety protocols
              </label>
            </div>
          </div>
        </div>
        
        {/* Section 2: Pre-Lab Questions */}
        <div id="prelab" className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FileText className="text-purple-600" />
            2. Pre-Lab Questions
          </h2>
          
          <div className="space-y-6">
            {[
              "What is the mathematical relationship between half-life and decay constant?",
              "Why is radioactive decay considered a random process, and how does this affect measurements?",
              "What is background radiation and why must it be subtracted from measurements?",
              "Explain how linearization of exponential data helps in determining half-life."
            ].map((question, index) => (
              <div key={index} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {index + 1}. {question}
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-half-life"
                  itemId={`prelab-question-${index}`}
                  initialContent={sectionContent.prelabAnswers[index] || ''}
                  onSave={(value) => {
                    // Save is handled by onContentChange
                  }}
                  onContentChange={(value) => {
                    setSectionContent(prev => ({
                      ...prev,
                      prelabAnswers: prev.prelabAnswers.map((answer, i) => i === index ? value : answer)
                    }));
                    
                    // Debounced section status update
                    debouncedStatusUpdate(() => {
                      const updatedAnswers = sectionContent.prelabAnswers.map((answer, i) => i === index ? value : answer);
                      const completedAnswers = updatedAnswers.filter(answer => hasQuillContent(answer)).length;
                      if (completedAnswers === 4) {
                        updateSectionStatus('prelab', 'completed');
                      } else if (completedAnswers > 0) {
                        updateSectionStatus('prelab', 'in-progress');
                      }
                    });
                  }}
                  placeholder="Enter your answer here..."
                  className="min-h-[100px]"
                  disabled={isSubmitted && !isStaffView}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Section 3: Investigation */}
        <div id="investigation" className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="text-green-600" />
            3. Investigation Plan
          </h2>
          
          <div className="space-y-6">
            {/* Investigation Plan */}
            <div>
              <h3 className="text-lg font-medium mb-3">Investigation Strategy</h3>
              <div className="bg-blue-50 p-4 rounded-lg mb-4">
                <h4 className="font-medium text-blue-800 mb-2">Objective</h4>
                <p className="text-blue-700 text-sm">
                  Use the virtual Geiger counter to collect decay data from unknown isotopes. 
                  Analyze the data using linearization techniques to determine half-life and identify the isotope.
                </p>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Describe your investigation plan (include measurement strategy, time intervals, data collection approach):
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-half-life"
                itemId="investigation-plan"
                initialContent={sectionContent.investigationPlan}
                onSave={(value) => {
                  // Save is handled by onContentChange
                }}
                onContentChange={(value) => {
                  setSectionContent(prev => ({ ...prev, investigationPlan: value }));
                  
                  // Debounced section status update
                  debouncedStatusUpdate(() => {
                    if (hasQuillContent(value) && hasQuillContent(sectionContent.procedureNotes)) {
                      updateSectionStatus('investigation', 'completed');
                    } else if (hasQuillContent(value) || hasQuillContent(sectionContent.procedureNotes)) {
                      updateSectionStatus('investigation', 'in-progress');
                    }
                  });
                }}
                placeholder="Outline your approach for collecting and analyzing decay data..."
                className="min-h-[150px]"
                disabled={isSubmitted && !isStaffView}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
              />
            </div>
            
            {/* Procedure Notes */}
            <div>
              <h3 className="text-lg font-medium mb-3">Procedure Notes</h3>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Document your procedure as you work (include settings, observations, challenges):
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-half-life"
                itemId="procedure-notes"
                initialContent={sectionContent.procedureNotes}
                onSave={(value) => {
                  // Save is handled by onContentChange
                }}
                onContentChange={(value) => {
                  setSectionContent(prev => ({ ...prev, procedureNotes: value }));
                  
                  // Debounced section status update
                  debouncedStatusUpdate(() => {
                    if (hasQuillContent(sectionContent.investigationPlan) && hasQuillContent(value)) {
                      updateSectionStatus('investigation', 'completed');
                    } else if (hasQuillContent(sectionContent.investigationPlan) || hasQuillContent(value)) {
                      updateSectionStatus('investigation', 'in-progress');
                    }
                  });
                }}
                placeholder="Record your procedure notes here as you conduct the investigation..."
                className="min-h-[150px]"
                disabled={isSubmitted && !isStaffView}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
              />
            </div>
          </div>
        </div>
        
        {/* Section 4: Observations */}
        <div id="observations" className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Zap className="text-yellow-600" />
            4. Data Collection & Observations
          </h2>
          
          {/* Geiger Counter Simulation */}
          <div className="mb-6">
            <GeigerCounterSimulation 
              onDataExport={(exportedData) => {
                setObservationData(prev => ({
                  ...prev,
                  selectedIsotope: exportedData.isotope,
                  backgroundCPM: exportedData.backgroundCPM,
                  measurements: exportedData.measurements,
                  totalMeasurementTime: exportedData.totalMeasurementTime
                }));
                
                // Update section status
                if (exportedData.measurements.length >= 10) {
                  updateSectionStatus('observations', 'completed');
                } else if (exportedData.measurements.length > 0) {
                  updateSectionStatus('observations', 'in-progress');
                }
              }}
            />
          </div>
          
          {/* Data Summary */}
          {observationData.measurements.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Collected Data Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-600">Sample</div>
                  <div className="font-medium">{observationData.selectedIsotope}</div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-600">Data Points</div>
                  <div className="font-medium">{observationData.measurements.length}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg">
                  <div className="text-sm text-purple-600">Total Time</div>
                  <div className="font-medium">{observationData.totalMeasurementTime}s</div>
                </div>
              </div>
              
              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-3 py-2 text-left">Time (s)</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Total CPM</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Net CPM</th>
                      <th className="border border-gray-300 px-3 py-2 text-left">Activity</th>
                    </tr>
                  </thead>
                  <tbody className="font-mono">
                    {observationData.measurements.map((measurement, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border border-gray-300 px-3 py-2">{measurement.time}</td>
                        <td className="border border-gray-300 px-3 py-2">{Math.round(measurement.totalCPM)}</td>
                        <td className="border border-gray-300 px-3 py-2">{Math.round(measurement.netCPM)}</td>
                        <td className="border border-gray-300 px-3 py-2">{Math.round(measurement.activity)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
        
        {/* Section 5: Analysis */}
        <div id="analysis" className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calculator className="text-indigo-600" />
            5. Data Analysis & Linearization
          </h2>
          
          <div className="space-y-6">
            {/* Linearization Theory */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Linearization Approach</h3>
              <p className="text-blue-700 text-sm mb-2">
                The exponential decay equation <InlineMath math="A(t) = A_0 e^{-\lambda t}" /> can be linearized by taking the natural logarithm:
              </p>
              <BlockMath math="\ln(A(t)) = \ln(A_0) - \lambda t" />
              <p className="text-blue-700 text-sm mt-2">
                This gives a straight line with slope = -λ and y-intercept = ln(A₀)
              </p>
            </div>
            
            {/* Manual Calculations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Manually calculated slope (m = -λ):
                </label>
                <input
                  type="text"
                  value={analysisData.manualSlope}
                  onChange={(e) => {
                    setAnalysisData(prev => ({ ...prev, manualSlope: e.target.value }));
                    
                    // Debounced section status update
                    debouncedStatusUpdate(() => {
                      const completedFields = [
                        e.target.value,
                        analysisData.decayConstant,
                        analysisData.calculatedHalfLife
                      ].filter(field => field && field.trim().length > 0).length + (hasQuillContent(analysisData.graphAnalysis) ? 1 : 0);
                      
                      if (completedFields >= 4) {
                        updateSectionStatus('analysis', 'completed');
                      } else if (completedFields > 0) {
                        updateSectionStatus('analysis', 'in-progress');
                      }
                    });
                  }}
                  placeholder="Calculate slope from your graph..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Decay constant (λ = -slope):
                </label>
                <input
                  type="text"
                  value={analysisData.decayConstant}
                  onChange={(e) => {
                    setAnalysisData(prev => ({ ...prev, decayConstant: e.target.value }));
                    
                    // Debounced section status update
                    debouncedStatusUpdate(() => {
                      const completedFields = [
                        analysisData.manualSlope,
                        e.target.value,
                        analysisData.calculatedHalfLife
                      ].filter(field => field && field.trim().length > 0).length + (hasQuillContent(analysisData.graphAnalysis) ? 1 : 0);
                      
                      if (completedFields >= 4) {
                        updateSectionStatus('analysis', 'completed');
                      } else if (completedFields > 0) {
                        updateSectionStatus('analysis', 'in-progress');
                      }
                    });
                  }}
                  placeholder="λ = -slope..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calculated half-life (t₁/₂ = ln(2)/λ):
              </label>
              <input
                type="text"
                value={analysisData.calculatedHalfLife}
                onChange={(e) => {
                  setAnalysisData(prev => ({ ...prev, calculatedHalfLife: e.target.value }));
                  
                  // Debounced section status update
                  debouncedStatusUpdate(() => {
                    const completedFields = [
                      analysisData.manualSlope,
                      analysisData.decayConstant,
                      e.target.value
                    ].filter(field => field && field.trim().length > 0).length + (hasQuillContent(analysisData.graphAnalysis) ? 1 : 0);
                    
                    if (completedFields >= 4) {
                      updateSectionStatus('analysis', 'completed');
                    } else if (completedFields > 0) {
                      updateSectionStatus('analysis', 'in-progress');
                    }
                  });
                }}
                placeholder="t₁/₂ = 0.693/λ..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            {/* Graph Analysis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Graph Analysis (describe your linearized plot, quality of fit, correlation):
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-half-life"
                itemId="graph-analysis"
                initialContent={analysisData.graphAnalysis}
                onSave={(value) => {
                  // Save is handled by onContentChange
                }}
                onContentChange={(value) => {
                  setAnalysisData(prev => ({ ...prev, graphAnalysis: value }));
                  
                  // Debounced section status update
                  debouncedStatusUpdate(() => {
                    const completedFields = [
                      analysisData.manualSlope,
                      analysisData.decayConstant,
                      analysisData.calculatedHalfLife
                    ].filter(field => field && field.trim().length > 0).length + (hasQuillContent(value) ? 1 : 0);
                    
                    if (completedFields >= 4) {
                      updateSectionStatus('analysis', 'completed');
                    } else if (completedFields > 0) {
                      updateSectionStatus('analysis', 'in-progress');
                    }
                  });
                }}
                placeholder="Describe your ln(Activity) vs Time graph, linearity, and correlation..."
                className="min-h-[120px]"
                disabled={isSubmitted && !isStaffView}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
              />
            </div>
          </div>
        </div>
        
        {/* Section 6: Conclusions */}
        <div id="conclusions" className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Target className="text-red-600" />
            6. Conclusions & Isotope Identification
          </h2>
          
          <div className="space-y-6">
            {/* Isotope Identification */}
            <div>
              <h3 className="text-lg font-medium mb-3">Isotope Identification</h3>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Based on your calculated half-life, identify the unknown isotope:
                </label>
                <select
                  value={conclusionData.identifiedIsotope}
                  onChange={(e) => {
                    setConclusionData(prev => ({ ...prev, identifiedIsotope: e.target.value }));
                    
                    // Update section status
                    const completedFields = (e.target.value ? 1 : 0) + 
                      [conclusionData.justification, conclusionData.sourcesOfError, conclusionData.improvements]
                        .filter(field => hasQuillContent(field)).length;
                    
                    if (completedFields >= 3) {
                      updateSectionStatus('conclusions', 'completed');
                    } else if (completedFields > 0) {
                      updateSectionStatus('conclusions', 'in-progress');
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an isotope...</option>
                  <option value="Radon-220">²²⁰Rn - Radon-220 (t₁/₂ = 55.6 seconds)</option>
                  <option value="Francium-223">²²³Fr - Francium-223 (t₁/₂ = 22.0 minutes)</option>
                  <option value="Astatine-218">²¹⁸At - Astatine-218 (t₁/₂ = 1.5 seconds)</option>
                  <option value="Polonium-214">²¹⁴Po - Polonium-214 (t₁/₂ = 164.3 microseconds)</option>
                  <option value="Radium-224">²²⁴Ra - Radium-224 (t₁/₂ = 3.66 days)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Justification for your identification (compare calculated vs. known half-life):
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-half-life"
                  itemId="justification"
                  initialContent={conclusionData.justification}
                  onSave={(value) => {
                    // Save is handled by onContentChange
                  }}
                  onContentChange={(value) => {
                    setConclusionData(prev => ({ ...prev, justification: value }));
                    
                    // Debounced section status update
                    debouncedStatusUpdate(() => {
                      const completedFields = (conclusionData.identifiedIsotope ? 1 : 0) + 
                        [value, conclusionData.sourcesOfError, conclusionData.improvements]
                          .filter(field => hasQuillContent(field)).length;
                      
                      if (completedFields >= 3) {
                        updateSectionStatus('conclusions', 'completed');
                      } else if (completedFields > 0) {
                        updateSectionStatus('conclusions', 'in-progress');
                      }
                    });
                  }}
                  placeholder="Justify your isotope identification with numerical comparisons..."
                  className="min-h-[120px]"
                  disabled={isSubmitted && !isStaffView}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                />
              </div>
            </div>
            
            {/* Sources of Error */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sources of Error (systematic and random errors in your experiment):
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-half-life"
                itemId="sources-of-error"
                initialContent={conclusionData.sourcesOfError}
                onSave={(value) => {
                  // Save is handled by onContentChange
                }}
                onContentChange={(value) => {
                  setConclusionData(prev => ({ ...prev, sourcesOfError: value }));
                  
                  // Debounced section status update
                  debouncedStatusUpdate(() => {
                    const completedFields = (conclusionData.identifiedIsotope ? 1 : 0) + 
                      [conclusionData.justification, value, conclusionData.improvements]
                        .filter(field => hasQuillContent(field)).length;
                    
                    if (completedFields >= 3) {
                      updateSectionStatus('conclusions', 'completed');
                    } else if (completedFields > 0) {
                      updateSectionStatus('conclusions', 'in-progress');
                    }
                  });
                }}
                placeholder="Identify and discuss potential sources of error in your measurements..."
                className="min-h-[120px]"
                disabled={isSubmitted && !isStaffView}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
              />
            </div>
            
            {/* Improvements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggested Improvements (how to improve accuracy and precision):
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-half-life"
                itemId="improvements"
                initialContent={conclusionData.improvements}
                onSave={(value) => {
                  // Save is handled by onContentChange
                }}
                onContentChange={(value) => {
                  setConclusionData(prev => ({ ...prev, improvements: value }));
                  
                  // Debounced section status update
                  debouncedStatusUpdate(() => {
                    const completedFields = (conclusionData.identifiedIsotope ? 1 : 0) + 
                      [conclusionData.justification, conclusionData.sourcesOfError, value]
                        .filter(field => hasQuillContent(field)).length;
                    
                    if (completedFields >= 3) {
                      updateSectionStatus('conclusions', 'completed');
                    } else if (completedFields > 0) {
                      updateSectionStatus('conclusions', 'in-progress');
                    }
                  });
                }}
                placeholder="Suggest improvements to the experimental procedure and data collection..."
                className="min-h-[120px]"
                disabled={isSubmitted && !isStaffView}
              />
            </div>
            
            {/* Summary */}
            {analysisData.calculatedHalfLife && conclusionData.identifiedIsotope && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Experimental Summary</h4>
                <div className="text-green-700 text-sm space-y-1">
                  <div>Calculated half-life: {analysisData.calculatedHalfLife}</div>
                  <div>Identified isotope: {conclusionData.identifiedIsotope}</div>
                  <div>Decay constant: {analysisData.decayConstant}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Submission Section */}
        {!isSubmitted && (
          <div className="mt-12 p-6 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Lab Submission</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Completion: {Math.round((completedCount / totalSections) * 100)}% ({completedCount} of {totalSections} sections)
                </p>
                {isSaving && (
                  <p className="text-sm text-orange-600">
                    <Clock className="inline w-4 h-4 mr-1" />
                    Auto-saving changes...
                  </p>
                )}
              </div>
              <button
                onClick={handleSubmit}
                disabled={isSaving || completedCount < Math.ceil(totalSections * 0.8)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                {isSaving ? 'Submitting...' : 'Submit Lab'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Submission Overlay */}
      <PostSubmissionOverlay 
        isVisible={showSubmissionOverlay || isSubmitted}
        isStaffView={isStaffView}
        course={course}
        questionId={questionId}
        submissionData={{
          labTitle: 'Lab 10 - Radioactive Half-Life Investigation',
          completionPercentage: Math.round((completedCount / totalSections) * 100),
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

export default LabHalfLife;

