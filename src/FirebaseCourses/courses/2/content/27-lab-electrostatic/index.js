import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import { toast } from 'sonner';
import { Info, Save, FileText } from 'lucide-react';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import PithBallDemo from './PithBallDemo';

// Add CSS styles for disabled lab inputs
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    /* Disable inputs for submitted labs (student view only) */
    .lab-input-disabled input,
    .lab-input-disabled textarea,
    .lab-input-disabled button:not(.staff-only):not(.print-button),
    .lab-input-disabled select {
      pointer-events: none !important;
      opacity: 0.7 !important;
      cursor: not-allowed !important;
      background-color: #f9fafb !important;
    }

    /* Keep certain elements interactive for staff and print button */
    .lab-input-disabled .staff-only,
    .lab-input-disabled .print-button {
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
    
    /* Hide number input spinners */
    input[type=number]::-webkit-inner-spin-button,
    input[type=number]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `;
  document.head.appendChild(styleElement);
}

/**
 * Lab 4 - Electrostatic Charge Measurement for Physics 30
 * Item ID: assignment_1747283296776_954
 * Unit: Electrostatics & Electricity
 */


const LabElectrostatic = ({ courseId = '2', course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course assessment data
  const itemId = 'lab_electrostatic';
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.[itemId]?.questions?.[0]?.questionId || 'course2_lab_electrostatic';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Check if lab is submitted
  const isSubmitted = course?.Assessments?.[questionId] !== undefined;
  
  // Track section status (6 sections)
  const [sectionStatus, setSectionStatus] = useState({
    introduction: 'not-started',
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    postlab: 'not-started'
  });

  // Track section content
  const [sectionContent, setSectionContent] = useState({
    introduction: '',
    hypothesis: '',
    conclusion: ''
  });

  // Track current section for navigation
  const [currentSection, setCurrentSection] = useState('introduction');
  
  // Track if lab has been started
  const [labStarted, setLabStarted] = useState(false);
  
  // Track if student has saved progress
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Track saving state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  
  // PostSubmissionOverlay state
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  
  // Introduction confirmation
  const [introductionConfirmed, setIntroductionConfirmed] = useState(false);
  
  // Procedure confirmation
  const [procedureConfirmed, setProcedureConfirmed] = useState(false);
  
  // Simulation confirmation
  const [simulationConfirmed, setSimulationConfirmed] = useState(false);

  // Data tables for observations
  const [observationData, setObservationData] = useState({
    qualitative: 'Objects attracted each other',
    selectedGroup: null,
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
    calculatedOneOverRSquared: ['', '', '', '', '', ''],
    xAxisVariable: '',
    yAxisVariable: '',
    lineStrateningExplanation: '',
    slopeValue: '',
    slopeCalculation: '',
    chargeValue: '',
    chargeCalculation: '',
    whyLineStrateningHelps: ''
  });

  // Save to Firebase
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
        labId: 'lab-electrostatic'
      };
      
      await update(labDataRef, dataToSave);
      console.log('✅ Save successful!');
      setHasSavedProgress(true);
      setLastSaved(new Date());
      
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
      
      // Restore saved state - only restore valid sections
      if (submittedData.sectionStatus) {
        const validSections = ['introduction', 'procedure', 'simulation', 'observations', 'analysis', 'postlab'];
        const filteredSectionStatus = {};
        validSections.forEach(section => {
          filteredSectionStatus[section] = submittedData.sectionStatus[section] || 'not-started';
        });
        setSectionStatus(filteredSectionStatus);
      }
      if (submittedData.sectionContent) setSectionContent(submittedData.sectionContent);
      if (submittedData.observationData) {
        setObservationData(prev => ({
          ...prev,
          ...submittedData.observationData
        }));
      }
      if (submittedData.analysisData) {
        setAnalysisData(prev => ({
          ...prev,
          ...submittedData.analysisData,
          calculatedOneOverRSquared: submittedData.analysisData.calculatedOneOverRSquared || prev.calculatedOneOverRSquared
        }));
      }
      if (submittedData.currentSection) setCurrentSection(submittedData.currentSection);
      if (submittedData.labStarted !== undefined) setLabStarted(submittedData.labStarted);
      if (submittedData.introductionConfirmed !== undefined) setIntroductionConfirmed(submittedData.introductionConfirmed);
      if (submittedData.procedureConfirmed !== undefined) setProcedureConfirmed(submittedData.procedureConfirmed);
      if (submittedData.simulationConfirmed !== undefined) setSimulationConfirmed(submittedData.simulationConfirmed);
      
      setLabStarted(true);
      setHasSavedProgress(true);
      return;
    }

    // For non-submitted labs, set up real-time listener
    if (!currentUser?.uid || !labDataRef) return;
    
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      const savedData = snapshot.val();
      
      if (savedData) {
        console.log('✅ Lab data loaded:', Object.keys(savedData));
        
        // Restore saved state - only restore valid sections
        if (savedData.sectionStatus) {
          const validSections = ['introduction', 'procedure', 'simulation', 'observations', 'analysis', 'postlab'];
          const filteredSectionStatus = {};
          validSections.forEach(section => {
            filteredSectionStatus[section] = savedData.sectionStatus[section] || 'not-started';
          });
          setSectionStatus(filteredSectionStatus);
        }
        if (savedData.sectionContent) setSectionContent(savedData.sectionContent);
        if (savedData.observationData) {
          setObservationData(prev => ({
            ...prev,
            ...savedData.observationData
          }));
        }
        if (savedData.analysisData) {
          setAnalysisData(prev => ({
            ...prev,
            ...savedData.analysisData,
            calculatedOneOverRSquared: savedData.analysisData.calculatedOneOverRSquared || prev.calculatedOneOverRSquared
          }));
        }
        if (savedData.currentSection) setCurrentSection(savedData.currentSection);
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);
        if (savedData.introductionConfirmed !== undefined) setIntroductionConfirmed(savedData.introductionConfirmed);
        if (savedData.procedureConfirmed !== undefined) setProcedureConfirmed(savedData.procedureConfirmed);
        if (savedData.simulationConfirmed !== undefined) setSimulationConfirmed(savedData.simulationConfirmed);
        
        setHasSavedProgress(true);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid, labDataRef, isSubmitted, course?.Assessments, questionId]);

  // Auto-start for staff view
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

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!labStarted || !hasSavedProgress) return;
    
    const interval = setInterval(() => {
      saveToFirebase({
        sectionStatus,
        sectionContent,
        observationData,
        analysisData,
        currentSection,
        introductionConfirmed,
        procedureConfirmed,
        simulationConfirmed
      });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [labStarted, hasSavedProgress, sectionStatus, sectionContent, observationData, analysisData, currentSection, introductionConfirmed, procedureConfirmed, simulationConfirmed, saveToFirebase]);

  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('introduction');
    setSectionStatus(prev => ({
      ...prev,
      introduction: 'not-started'
    }));
    
    saveToFirebase({
      labStarted: true,
      currentSection: 'introduction',
      sectionStatus: {
        ...sectionStatus,
        introduction: 'not-started'
      }
    });
  };

  // Submit lab
  const submitLab = async () => {
    try {
      setIsSaving(true);
      
      // Save current state
      await saveToFirebase({
        sectionStatus,
        sectionContent,
        observationData,
        analysisData,
        currentSection,
        introductionConfirmed,
        procedureConfirmed,
        simulationConfirmed
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
      console.error('❌ Lab submission failed:', error);
      toast.error(`Failed to submit lab: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-700';
      case 'in-progress':
        return 'bg-yellow-100 border-yellow-300 text-yellow-700';
      default:
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
    }
  };

  // Scroll to section
  const scrollToSection = (sectionId) => {
    setCurrentSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    saveToFirebase({ currentSection: sectionId });
  };

  // Count completed sections
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = Object.keys(sectionStatus).length;
  
  // Debug logging for section completion
  console.log('🔍 Section Status Debug:', {
    sectionStatus,
    completedCount,
    totalSections,
    completedSections: Object.entries(sectionStatus).filter(([key, status]) => status === 'completed'),
    incompleteSections: Object.entries(sectionStatus).filter(([key, status]) => status !== 'completed')
  });

  // Shared validation function for conclusion - simplified to just count periods
  const validateConclusion = (content) => {
    const plainText = content.replace(/<[^>]*>/g, '');
    const periodCount = (plainText.match(/\./g) || []).length;
    const isComplete = periodCount >= 2;
    return { periodCount, isComplete, plainText };
  };

  // Update section content
  const updateSectionContent = (section, content) => {
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
        const lowerContent = content.toLowerCase();
        const hasIf = lowerContent.includes('if');
        const hasThen = lowerContent.includes('then');
        const hasBecause = lowerContent.includes('because');
        const hypothesisComplete = hasIf && hasThen && hasBecause && content.trim().length > 20;
        
        // For procedure: need both hypothesis AND checkbox confirmed
        isCompleted = hypothesisComplete && procedureConfirmed;
        newStatus = isCompleted ? 'completed' : (hypothesisComplete || procedureConfirmed ? 'in-progress' : 'not-started');
      } else if (section === 'conclusion') {
        const validation = validateConclusion(content);
        isCompleted = validation.isComplete;
        newStatus = isCompleted ? 'completed' : 'in-progress';
      } else {
        isCompleted = content.trim().length > 20;
        newStatus = isCompleted ? 'completed' : 'in-progress';
      }
    }
    
    // Map content sections to status sections
    const sectionMapping = {
      'hypothesis': 'procedure',
      'conclusion': 'postlab'
    };
    
    const statusSection = sectionMapping[section] || section;
    
    // Only update if it's a valid section
    const validSections = ['introduction', 'procedure', 'simulation', 'observations', 'analysis', 'postlab'];
    if (!validSections.includes(statusSection)) {
      console.warn(`⚠️ Attempted to update invalid section: ${statusSection}`);
      return;
    }
    
    const newSectionStatus = {
      ...sectionStatus,
      [statusSection]: newStatus
    };
    setSectionStatus(newSectionStatus);
    
    saveToFirebase({
      sectionContent: newSectionContent,
      sectionStatus: newSectionStatus
    });
  };


  // Update introduction confirmation
  const updateIntroductionConfirmation = (confirmed) => {
    setIntroductionConfirmed(confirmed);
    setSectionStatus(prev => ({
      ...prev,
      introduction: confirmed ? 'completed' : 'not-started'
    }));
    saveToFirebase({
      introductionConfirmed: confirmed,
      sectionStatus: {
        ...sectionStatus,
        introduction: confirmed ? 'completed' : 'not-started'
      }
    });
  };

  // Update procedure confirmation
  const updateProcedureConfirmation = (confirmed) => {
    setProcedureConfirmed(confirmed);
    
    // Check if hypothesis is also complete
    const hypothesisComplete = (() => {
      const content = sectionContent.hypothesis.toLowerCase();
      const hasIf = content.includes('if');
      const hasThen = content.includes('then');
      const hasBecause = content.includes('because');
      const hasLength = sectionContent.hypothesis.trim().length > 20;
      return hasIf && hasThen && hasBecause && hasLength;
    })();
    
    // Procedure is complete only if both hypothesis AND checkbox are done
    const isComplete = confirmed && hypothesisComplete;
    const newStatus = isComplete ? 'completed' : (confirmed || hypothesisComplete ? 'in-progress' : 'not-started');
    
    setSectionStatus(prev => ({
      ...prev,
      procedure: newStatus
    }));
    
    saveToFirebase({
      procedureConfirmed: confirmed,
      sectionStatus: {
        ...sectionStatus,
        procedure: newStatus
      }
    });
  };

  // Update simulation confirmation
  const updateSimulationConfirmation = (confirmed) => {
    setSimulationConfirmed(confirmed);
    setSectionStatus(prev => ({
      ...prev,
      simulation: confirmed ? 'completed' : 'not-started'
    }));
    saveToFirebase({
      simulationConfirmed: confirmed,
      sectionStatus: {
        ...sectionStatus,
        simulation: confirmed ? 'completed' : 'not-started'
      }
    });
  };

  // Update selected group
  const updateSelectedGroup = (group) => {
    const newObservationData = {
      ...observationData,
      selectedGroup: group
    };
    setObservationData(newObservationData);
    
    setSectionStatus(prev => ({
      ...prev,
      observations: 'completed'
    }));
    
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: {
        ...sectionStatus,
        observations: 'completed'
      }
    });
  };

  // Update analysis data
  const updateAnalysisData = (field, value, index = null) => {
    let newAnalysisData;
    
    if (index !== null) {
      const currentArray = analysisData[field] || ['', '', '', '', '', ''];
      const newArray = [...currentArray];
      newArray[index] = value;
      newAnalysisData = {
        ...analysisData,
        [field]: newArray
      };
    } else {
      newAnalysisData = {
        ...analysisData,
        [field]: value
      };
    }
    
    setAnalysisData(newAnalysisData);
    
    // Check if analysis is completed
    const oneOverRSquaredCount = (newAnalysisData.calculatedOneOverRSquared || []).filter(val => val && val.toString().trim().length > 0).length;
    const hasExplanations = (newAnalysisData.xAxisVariable || '').trim().length > 0 && 
                           (newAnalysisData.yAxisVariable || '').trim().length > 0 &&
                           (newAnalysisData.lineStrateningExplanation || '').trim().length > 10 &&
                           (newAnalysisData.slopeValue || '').trim().length > 0 &&
                           (newAnalysisData.chargeValue || '').trim().length > 0;
    
    const isCompleted = oneOverRSquaredCount >= 4 && hasExplanations;
    
    setSectionStatus(prev => ({
      ...prev,
      analysis: isCompleted ? 'completed' : 'in-progress'
    }));
    
    saveToFirebase({
      analysisData: newAnalysisData,
      sectionStatus: {
        ...sectionStatus,
        analysis: isCompleted ? 'completed' : 'in-progress'
      }
    });
  };

  // Print PDF function using jsPDF
  const handlePrint = async () => {
    try {
      // Dynamically import jsPDF to avoid bundle size issues
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      const doc = new jsPDF();
      let yPosition = 20;
      
      // Helper function to check if we need a new page
      const checkNewPage = (additionalSpace = 20) => {
        if (yPosition > 270 - additionalSpace) {
          doc.addPage();
          yPosition = 20;
        }
      };
      
      // Helper function to add text with word wrapping
      const addText = (text, fontSize = 12, fontWeight = 'normal', maxWidth = 170) => {
        checkNewPage();
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontWeight);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        lines.forEach(line => {
          checkNewPage();
          doc.text(line, 20, yPosition);
          yPosition += fontSize * 0.4;
        });
        yPosition += 5;
      };
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Lab 4 - Electrostatic Charge Measurement', 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Student info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student: ${currentUser?.email || 'Unknown'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Completion: ${completedCount}/${totalSections} sections`, 20, yPosition);
      yPosition += 15;
      
      // Lab Overview
      addText('Lab Overview', 16, 'bold');
      addText('Welcome to the Electrostatic Charge Measurement lab! In this experiment, you\'ll determine the unknown charge on a pith ball by analyzing the electrostatic force between it and a metal sphere with a known charge.');
      addText('In this lab, you will perform a variation of Coulomb\'s experiment to measure the unknown charge on a pith ball. The pith ball will be hanging in a spring-loaded device near a metal sphere with a known charge of -3.59 × 10⁻⁷ C.');
      addText('You will analyze force measurements at different distances and use line straightening techniques to determine the charge on the pith ball.');
      
      // Objectives
      addText('Lab Objectives:', 14, 'bold');
      addText('• Apply Coulomb\'s law to analyze electrostatic interactions');
      addText('• Use line straightening techniques for data analysis');
      addText('• Calculate an unknown charge from experimental data');
      addText('• Understand the inverse square relationship between force and distance');
      yPosition += 10;
      
      // Known Values
      addText('Known Values:', 14, 'bold');
      addText('• Metal sphere charge q₁ = -3.59 × 10⁻⁷ C');
      addText('• Coulomb\'s constant k = 8.99 × 10⁹ N·m²/C²');
      yPosition += 10;
      
      // Hypothesis Section
      if (sectionContent.hypothesis) {
        checkNewPage(30);
        addText('Hypothesis', 16, 'bold');
        const hypothesisText = sectionContent.hypothesis.replace(/<[^>]*>/g, '').trim();
        if (hypothesisText) {
          addText(hypothesisText);
        } else {
          addText('[No hypothesis provided]');
        }
        yPosition += 10;
      }
      
      // Procedure Section
      checkNewPage(80);
      addText('Procedure & Hypothesis', 16, 'bold');
      addText('Experimental Procedure:', 14, 'bold');
      addText('The following procedure was used to collect electrostatic force data:');
      addText('1. A charged metal sphere (-3.59 × 10⁻⁷ C) is placed at various distances from a pith ball');
      addText('2. The pith ball is suspended by a spring that measures the electrostatic force');
      addText('3. Force measurements are recorded at six different distances (0.05m to 0.30m)');
      addText('4. Data is analyzed using Coulomb\'s law: F = k|q₁||q₂|/r²');
      addText('5. Line straightening technique is used to determine the unknown charge');
      addText(`Student\'s understanding of procedure: ${procedureConfirmed ? 'Confirmed' : 'Not confirmed'}`);
      yPosition += 15;
      
      // Simulation Section
      checkNewPage(60);
      addText('Simulation & Data Collection', 16, 'bold');
      addText('Review the experimental setup below to understand how the data was collected:');
      addText('An interactive simulation was used to model the electrostatic force measurement setup. The simulation demonstrates how a charged metal sphere interacts with a pith ball at various distances, allowing students to observe the relationship between distance and electrostatic force.');
      
      // Add simulation placeholder
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition, 170, 40, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('Interactive Pith Ball Electrostatic Force Simulation', 105, yPosition + 15, { align: 'center' });
      doc.text('(Animation shows charged sphere approaching pith ball)', 105, yPosition + 25, { align: 'center' });
      yPosition += 50;
      addText(`Simulation understanding: ${simulationConfirmed ? 'Confirmed' : 'Not confirmed'}`);
      yPosition += 10;
      
      // Observations Section
      checkNewPage(80);
      addText('Observations', 16, 'bold');
      addText('In this section, students recorded both qualitative and quantitative observations from the electrostatic force experiment.');
      
      // Qualitative observations
      addText('Qualitative Observations:', 14, 'bold');
      addText('General observations about the electrostatic interaction:');
      addText(observationData.qualitative);
      yPosition += 10;
      
      addText('Quantitative Data Selection:', 14, 'bold');
      addText('Students were provided with four different data groups (Alpha, Beta, Gamma, Epsilon) representing different experimental conditions. Each group contains force measurements at six different distances from 0.05m to 0.30m.');
      
      // Selected group data
      if (observationData.selectedGroup) {
        addText(`Selected Data Group: ${observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}`, 14, 'bold');
        
        const groupKey = `group${observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}`;
        const selectedData = observationData[groupKey] || [];
        
        // Create data table
        const tableData = selectedData.map(row => [
          row.trial.toString(),
          row.r.toFixed(3),
          row.Fe.toFixed(4)
        ]);
        
        checkNewPage(60);
        autoTable(doc, {
          head: [['Trial', 'Distance r (m)', 'Force Fe (N)']],
          body: tableData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [200, 200, 200] }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      } else {
        addText('[No data group selected]');
      }
      
      // Analysis Section
      checkNewPage(80);
      addText('Analysis', 16, 'bold');
      addText('Instructions: Use line straightening technique to determine the charge on the pith ball. According to Coulomb\'s law: Fe = k|q₁||q₂|/r²');
      addText('The analysis involves four main steps to determine the unknown charge through mathematical manipulation of the data.');
      yPosition += 10;
      
      // 1/r² calculations
      addText('Step 1: Calculate 1/r² Values', 14, 'bold');
      addText('To linearize the relationship, students must calculate the reciprocal of the square of each distance measurement. This transforms the inverse square relationship into a linear relationship suitable for graphing.');
      if (observationData.selectedGroup && analysisData.calculatedOneOverRSquared) {
        const groupKey = `group${observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}`;
        const selectedData = observationData[groupKey] || [];
        
        const analysisTableData = selectedData.map((row, index) => [
          row.trial.toString(),
          row.r.toFixed(3),
          row.Fe.toFixed(4),
          analysisData.calculatedOneOverRSquared[index] || '[Not calculated]'
        ]);
        
        checkNewPage(60);
        autoTable(doc, {
          head: [['Trial', 'r (m)', 'Fe (N)', '1/r² (m⁻²)']],
          body: analysisTableData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [200, 200, 200] }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      } else {
        addText('[Analysis data not available]');
      }
      
      // Line straightening technique
      addText('Step 2: Line Straightening Technique', 14, 'bold');
      addText('Students must identify the appropriate variables for the x and y axes to create a linear relationship. This technique allows for easier analysis and more accurate determination of the slope.');
      
      const xAxisText = analysisData.xAxisVariable ? analysisData.xAxisVariable.replace(/<[^>]*>/g, '').trim() : '[Not provided]';
      const yAxisText = analysisData.yAxisVariable ? analysisData.yAxisVariable.replace(/<[^>]*>/g, '').trim() : '[Not provided]';
      const explanationText = analysisData.lineStrateningExplanation ? analysisData.lineStrateningExplanation.replace(/<[^>]*>/g, '').trim() : '[Not provided]';
      
      addText(`X-axis variable: ${xAxisText}`);
      addText(`Y-axis variable: ${yAxisText}`);
      addText(`Student explanation of why this technique works: ${explanationText}`);
      yPosition += 10;
      
      // Slope calculation
      addText('Step 3: Determine the Slope', 14, 'bold');
      addText('Once the data is linearized, students calculate the slope of the best-fit line. The slope contains important information about the charges involved in the interaction.');
      
      const slopeText = analysisData.slopeValue ? analysisData.slopeValue.replace(/<[^>]*>/g, '').trim() : '[Not calculated]';
      const slopeCalcText = analysisData.slopeCalculation ? analysisData.slopeCalculation.replace(/<[^>]*>/g, '').trim() : '[Not shown]';
      
      addText(`Slope value: ${slopeText} N⋅m²`);
      addText(`Student\'s slope calculation work: ${slopeCalcText}`);
      yPosition += 10;
      
      // Charge calculation
      addText('Step 4: Calculate the Charge', 14, 'bold');
      addText('The final step involves using the slope to calculate the unknown charge on the pith ball. Since one charge is known (-3.59 × 10⁻⁷ C), students can solve for the unknown charge.');
      addText('Hint: From the linearized equation, slope = k|q₁||q₂|');
      addText('Students must rearrange this equation to solve for q₂ (the unknown charge).');
      
      const chargeText = analysisData.chargeValue ? analysisData.chargeValue.replace(/<[^>]*>/g, '').trim() : '[Not calculated]';
      const chargeCalcText = analysisData.chargeCalculation ? analysisData.chargeCalculation.replace(/<[^>]*>/g, '').trim() : '[Not shown]';
      
      addText(`Calculated charge on pith ball: ${chargeText} C`);
      addText(`Student\'s charge calculation work: ${chargeCalcText}`);
      yPosition += 15;
      
      // Post-Lab Questions
      checkNewPage(50);
      addText('Post-Lab Questions', 16, 'bold');
      addText('In this final section, students reflect on their experimental results and consider improvements to the methodology.');
      addText('Question: Reflect on your results. What sources of error might have affected the experiment? How could the experimental design be improved? (Write at least 2 complete sentences)');
      addText('This reflection helps students think critically about experimental design, measurement uncertainty, and the scientific method.');
      
      const conclusionText = sectionContent.conclusion ? sectionContent.conclusion.replace(/<[^>]*>/g, '').trim() : '[No conclusion provided]';
      addText(`Student Response: ${conclusionText}`);
      yPosition += 15;
      
      // Lab Status
      checkNewPage(30);
      addText('Lab Status', 16, 'bold');
      addText(`Completion Status: ${completedCount}/${totalSections} sections completed`);
      addText(`Submitted: ${isSubmitted ? 'Yes' : 'No'}`);
      if (isSubmitted) {
        addText(`Submission Date: ${course?.Assessments?.[questionId]?.timestamp ? new Date(course.Assessments[questionId].timestamp).toLocaleString() : 'Unknown'}`);
      }
      
      // Save the PDF
      doc.save(`Lab_4_Electrostatic_Charge_${currentUser?.email || 'student'}_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
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

          <div className="max-w-md mx-auto">
            <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md text-center">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {hasSavedProgress ? 'Welcome Back!' : 'Ready to Begin?'}
              </h2>
              <p className="text-gray-600 mb-6">
                {hasSavedProgress 
                  ? 'Your progress has been saved. You can continue where you left off.'
                  : 'This lab will guide you through hypothesis, observations, analysis, and conclusions.'
                }
              </p>
              
              {hasSavedProgress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Progress:</h3>
                  <p className="text-xs text-gray-500">
                    {completedCount} of {totalSections} sections completed
                  </p>
                </div>
              )}
              
              <button
                onClick={startLab}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 text-lg"
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
    <div id="lab-content" className={`space-y-6 ${isSubmitted && !isStaffView ? 'lab-input-disabled' : ''}`}>
      {/* Lab Title and Status */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Lab 4 - Electrostatic Charge Measurement
        </h1>
        {isSubmitted && !isStaffView && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Lab Submitted - Read Only
          </div>
        )}
      </div>
      {/* Print PDF Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handlePrint}
          className="px-4 py-2 text-sm bg-gray-600 text-white rounded hover:bg-gray-700 print-button flex items-center gap-2 shadow-md"
        >
          <FileText size={16} />
          Print Lab PDF
        </button>
      </div>

      {/* Navigation Header */}
      <div className="sticky top-14 z-10 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Lab Progress</h3>
          <div className="flex gap-1 flex-wrap">
            {[
              { key: 'introduction', label: 'Introduction' },
              { key: 'procedure', label: 'Procedure' },
              { key: 'simulation', label: 'Simulation' },
              { key: 'observations', label: 'Observations' },
              { key: 'analysis', label: 'Analysis' },
              { key: 'postlab', label: 'Post-Lab' }
            ].map(section => (
              <button
                key={section.key}
                onClick={() => scrollToSection(section.key)}
                className={`px-3 py-1 text-xs font-medium rounded border ${getStatusColor(sectionStatus[section.key])}`}
              >
                {section.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {/* Permanent auto-save indicator - only show if lab not submitted */}
            {!isSubmitted && hasSavedProgress && (
              <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                <Save size={12} />
                <span>Auto-saving</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Introduction Section */}
      <div id="section-introduction" className="border rounded-lg shadow-sm p-6 scroll-mt-32 bg-green-50 border-green-200">
        <h2 className="text-lg font-semibold mb-4 text-green-700">1. Introduction</h2>
        <div className="space-y-4 text-gray-700">
          <p>
            Welcome to the Electrostatic Charge Measurement lab! In this experiment, you'll determine 
            the unknown charge on a pith ball by analyzing the electrostatic force between it and a 
            metal sphere with a known charge.
          </p>
          <div className="bg-white p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">Lab Objectives:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Apply Coulomb's law to analyze electrostatic interactions</li>
              <li>Use line straightening techniques for data analysis</li>
              <li>Calculate an unknown charge from experimental data</li>
              <li>Understand the inverse square relationship between force and distance</li>
            </ul>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Known values:</strong> Metal sphere charge q₁ = -3.59 × 10⁻⁷ C, 
              Coulomb's constant k = 8.99 × 10⁹ N·m²/C²
            </p>
          </div>
          
          <label className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={introductionConfirmed}
              onChange={(e) => updateIntroductionConfirmation(e.target.checked)}
              className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
            />
            <span className="text-sm text-gray-700">
              I have read and understood the lab introduction and objectives
            </span>
          </label>
        </div>
      </div>


      {/* Procedure Section */}
      <div id="section-procedure" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${
        sectionStatus.procedure === 'completed' ? 'bg-green-50 border-green-200' :
        sectionStatus.procedure === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
        'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">2. Procedure & Hypothesis</h2>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Experimental Procedure:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>A charged metal sphere (-3.59 × 10⁻⁷ C) is placed at various distances from a pith ball</li>
              <li>The pith ball is suspended by a spring that measures the electrostatic force</li>
              <li>Force measurements are recorded at six different distances (0.05m to 0.30m)</li>
              <li>Data is analyzed using Coulomb's law: <InlineMath math="F = k\frac{|q_1||q_2|}{r^2}" /></li>
              <li>Line straightening technique is used to determine the unknown charge</li>
            </ol>
          </div>
          
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Write your hypothesis (use "If... then... because..." format):
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electrostatic"
              itemId="hypothesis"
              initialContent={sectionContent.hypothesis || ''}
              onSave={(content) => updateSectionContent('hypothesis', content)}
              onContentChange={(content) => updateSectionContent('hypothesis', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
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
                  return <span className="text-xs text-green-600">✓ Complete hypothesis format</span>;
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
          
          <label className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={procedureConfirmed}
              onChange={(e) => updateProcedureConfirmation(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I understand the experimental procedure and am ready to analyze the data
            </span>
          </label>
        </div>
      </div>

      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${
        sectionStatus.simulation === 'completed' ? 'bg-green-50 border-green-200' :
        sectionStatus.simulation === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
        'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">3. Simulation & Data Collection</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            Review the experimental setup below to understand how the data was collected:
          </p>
          
          <PithBallDemo 
            observationData={observationData}
            selectedGroup={observationData.selectedGroup}
          />
          
          <label className="flex items-center gap-2 p-3 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={simulationConfirmed}
              onChange={(e) => updateSimulationConfirmation(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">
              I understand the experimental setup and how the electrostatic force data was collected
            </span>
          </label>
        </div>
      </div>

      {/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${
        sectionStatus.observations === 'completed' ? 'bg-green-50 border-green-200' :
        sectionStatus.observations === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
        'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">4. Observations</h2>
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Qualitative Observations</h3>
            <p className="text-gray-700 bg-gray-50 p-3 rounded">
              {observationData.qualitative}
            </p>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Quantitative Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Select one group's data to use for your analysis:
            </p>
            
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
                        const groupKey = `group${observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}`;
                        const selectedData = observationData[groupKey] || [];
                        
                        return selectedData.map((row, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="p-3 border-b">{row.trial}</td>
                            <td className="p-3 border-b">{row.r.toFixed(3)}</td>
                            <td className="p-3 border-b">{row.Fe.toFixed(4)}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!observationData.selectedGroup && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Select a group above to view the data table</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Section */}
      <div id="section-analysis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${
        sectionStatus.analysis === 'completed' ? 'bg-green-50 border-green-200' :
        sectionStatus.analysis === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
        'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">5. Analysis</h2>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-700 mb-2">
              <strong>Instructions:</strong> Use line straightening technique to determine the charge on the pith ball. 
              According to Coulomb's law: <InlineMath math="F_e = k\frac{|q_1||q_2|}{r^2}" />
            </p>
          </div>

          {/* Calculate 1/r² values */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 1: Calculate 1/r² Values</h3>
            
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
                      const groupKey = `group${observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}`;
                      const selectedData = observationData[groupKey] || [];
                      
                      return selectedData.map((row, index) => (
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
                              className={`w-20 px-2 py-1 border rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                                analysisData.calculatedOneOverRSquared?.[index] && 
                                Math.abs(parseFloat(analysisData.calculatedOneOverRSquared[index]) - (1 / (row.r * row.r))) < 1
                                  ? 'border-green-300 bg-green-50'
                                  : 'border-gray-300'
                              }`}
                              placeholder="?"
                            />
                          </td>
                        </tr>
                      ));
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

          {/* Line Straightening */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 2: Line Straightening Technique</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4 min-h-[180px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What variable goes on the x-axis?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electrostatic"
                  itemId="x-axis-variable"
                  initialContent={analysisData.xAxisVariable || ''}
                  onSave={(content) => updateAnalysisData('xAxisVariable', content)}
                  onContentChange={(content) => updateAnalysisData('xAxisVariable', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  minHeight="150px"
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What variable goes on the y-axis?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electrostatic"
                  itemId="y-axis-variable"
                  initialContent={analysisData.yAxisVariable || ''}
                  onSave={(content) => updateAnalysisData('yAxisVariable', content)}
                  onContentChange={(content) => updateAnalysisData('yAxisVariable', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  minHeight="150px"
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explain why this line straightening technique works:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electrostatic"
                itemId="line-straightening-explanation"
                initialContent={analysisData.lineStrateningExplanation || ''}
                onSave={(content) => updateAnalysisData('lineStrateningExplanation', content)}
                onContentChange={(content) => updateAnalysisData('lineStrateningExplanation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>

          {/* Slope Calculation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 3: Determine the Slope</h3>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4 min-h-[180px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slope value:
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electrostatic"
                  itemId="slope-value"
                  initialContent={analysisData.slopeValue || ''}
                  onSave={(content) => updateAnalysisData('slopeValue', content)}
                  onContentChange={(content) => updateAnalysisData('slopeValue', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  minHeight="150px"
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units:
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
                Show your calculation:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electrostatic"
                itemId="slope-calculation"
                initialContent={analysisData.slopeCalculation || ''}
                onSave={(content) => updateAnalysisData('slopeCalculation', content)}
                onContentChange={(content) => updateAnalysisData('slopeCalculation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>

          {/* Charge Calculation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 4: Calculate the Charge</h3>
            
            <div className="bg-yellow-50 p-3 rounded-lg mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Hint:</strong> From your linearized equation, slope = k|q₁||q₂|
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4 min-h-[180px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Calculated charge (C):
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electrostatic"
                  itemId="charge-value"
                  initialContent={analysisData.chargeValue || ''}
                  onSave={(content) => updateAnalysisData('chargeValue', content)}
                  onContentChange={(content) => updateAnalysisData('chargeValue', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  minHeight="150px"
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your calculation:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electrostatic"
                itemId="charge-calculation"
                initialContent={analysisData.chargeCalculation || ''}
                onSave={(content) => updateAnalysisData('chargeCalculation', content)}
                onContentChange={(content) => updateAnalysisData('chargeCalculation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Post-Lab Section */}
      <div id="section-postlab" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${
        sectionStatus.postlab === 'completed' ? 'bg-green-50 border-green-200' :
        sectionStatus.postlab === 'in-progress' ? 'bg-yellow-50 border-yellow-200' :
        'bg-white border-gray-200'
      }`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">6. Post-Lab Questions</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reflect on your results. What sources of error might have affected the experiment? 
              How could the experimental design be improved? (Write at least 2 complete sentences)
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-electrostatic"
              itemId="conclusion"
              initialContent={sectionContent.conclusion || ''}
              onSave={(content) => updateSectionContent('conclusion', content)}
              onContentChange={(content) => updateSectionContent('conclusion', content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              disabled={isSubmitted && !isStaffView}
            />
            <div className="flex justify-between items-center text-sm mt-2">
              <span className="text-gray-500">
                {sectionContent.conclusion.length} characters
              </span>
              {(() => {
                const validation = validateConclusion(sectionContent.conclusion);
                if (validation.isComplete) {
                  return <span className="text-xs text-green-600">✓ Complete response</span>;
                } else if (sectionContent.conclusion.trim().length > 0) {
                  return <span className="text-xs text-yellow-600">Need {2 - validation.periodCount} more period(s)</span>;
                }
                return null;
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button - Only show if not submitted */}
      {!isSubmitted && (
        <div className="flex justify-center mt-8">
          <button
            onClick={submitLab}
            disabled={isSaving || completedCount < totalSections}
            className={`px-6 py-3 font-medium rounded-lg transition-all duration-200 ${
              completedCount >= totalSections
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {(() => {
              const buttonText = isSaving ? 'Submitting...' : 
               completedCount >= totalSections ? 'Submit Lab' : 
               `Complete ${totalSections - completedCount} more section(s)`;
              
              console.log('🔍 Submit Button Debug:', {
                isSaving,
                completedCount,
                totalSections,
                isDisabled: isSaving || completedCount < totalSections,
                buttonText,
                incompleteSections: Object.entries(sectionStatus).filter(([key, status]) => status !== 'completed').map(([key]) => key)
              });
              
              return buttonText;
            })()}
          </button>
        </div>
      )}

      {/* PostSubmissionOverlay */}
      <PostSubmissionOverlay
        isVisible={showSubmissionOverlay || isSubmitted}
        isStaffView={isStaffView}
        course={course}
        questionId={questionId}
        submissionData={{
          labTitle: 'Electrostatic Charge Measurement Lab',
          completionPercentage: (completedCount * 100) / totalSections,
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

export default LabElectrostatic;