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
import { aiPrompt } from './ai-prompt';
import ParticleAccelerationSimulationV2 from './ParticleAccelerationSimulationV2';

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
 * Lab 5 - Electric Fields and Charge-to-Mass Ratio for Physics 30
 * Item ID: assignment_1747283296776_955
 * Unit: Electrostatics & Electricity
 */


const LabElectricFields = ({ courseId = '2', course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_electric_fields']?.questions?.[0]?.questionId || 'course2_lab_electric_fields';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Standard 6-section lab structure (no equipment section - simulation only)
  const [sectionStatus, setSectionStatus] = useState({
    introduction: 'not-started',
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    postlab: 'not-started'
  });

  // Section content for text-based sections
  const [sectionContent, setSectionContent] = useState({
    introductionConfirmed: false,
    procedureConfirmed: false,
    postLabAnswers: ['', '', ''] // Post-lab questions
  });

  
  // Observation data - keeping existing Group Alpha/Beta structure
  const [observationData, setObservationData] = useState({
    selectedGroup: null,
    groupAlpha: {
      qualitative: 'The initial setup worked just fine as shown in the diagram. Particles did reach the mass spectrometer at the velocities shown on the table.',
      data: [
        { trial: 1, V: 10, v: 2.9 },
        { trial: 2, V: 15, v: 3.6 },
        { trial: 3, V: 20, v: 4.4 },
        { trial: 4, V: 25, v: 4.6 },
        { trial: 5, V: 30, v: 5.2 },
        { trial: 6, V: 35, v: 5.8 },
        { trial: 7, V: 40, v: 6.3 },
        { trial: 8, V: 45, v: 6.5 },
        { trial: 9, V: 50, v: 7.0 },
        { trial: 10, V: 55, v: 7.1 },
        { trial: 11, V: 60, v: 7.5 },
        { trial: 12, V: 65, v: 7.8 },
        { trial: 13, V: 70, v: 8.4 },
        { trial: 14, V: 75, v: 8.6 }
      ]
    },
    groupBeta: {
      qualitative: 'The initial setup did not work as shown in the diagram. Particles did not reach the mass spectrometer until you made changes.',
      data: [
        { trial: 1, V: 10, v: 4.5 },
        { trial: 2, V: 15, v: 5.5 },
        { trial: 3, V: 20, v: 6.3 },
        { trial: 4, V: 25, v: 7.1 },
        { trial: 5, V: 30, v: 7.7 },
        { trial: 6, V: 35, v: 8.9 },
        { trial: 7, V: 40, v: 9.0 },
        { trial: 8, V: 45, v: 9.6 },
        { trial: 9, V: 50, v: 9.7 },
        { trial: 10, V: 55, v: 10.3 },
        { trial: 11, V: 60, v: 10.7 },
        { trial: 12, V: 65, v: 11.1 },
        { trial: 13, V: 70, v: 11.6 },
        { trial: 14, V: 75, v: 12.0 }
      ]
    }
  });

  // Analysis data - enhanced from original
  const [analysisData, setAnalysisData] = useState({
    calculatedVSquared: ['', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    xAxisVariable: '',
    yAxisVariable: '',
    lineStrateningExplanation: '',
    slopeValue: '',
    slopeCalculation: '',
    chargeToMassRatio: '',
    chargeToMassCalculation: '',
    particleIdentification: '',
    whyLineStrateningHelps: ''
  });

  // Post-lab data - includes error analysis
  const [postLabData, setPostLabData] = useState({
    acceptedValue: '',
    experimentalValue: '',
    percentError: '',
    percentErrorCalculation: '',
    errorSources: ''
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
        labId: '33-lab-electric-fields'
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
          calculatedVSquared: submittedData.analysisData.calculatedVSquared || prev.calculatedVSquared
        }));
      }
      if (submittedData.postLabData) setPostLabData(submittedData.postLabData);
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
            calculatedVSquared: savedData.analysisData.calculatedVSquared || prev.calculatedVSquared
          }));
        }
        if (savedData.postLabData) setPostLabData(savedData.postLabData);
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
        introduction: 'not-started' // Staff also needs to acknowledge
      }));
    }
  }, [isStaffView, labStarted]);

  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('introduction');
    
    // Introduction starts as not-started (requires acknowledgment)
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
        analysisData,
        postLabData
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

  // Section completion checking functions
  const checkSectionCompletion = (fieldGroups, currentData) => {
    const allGroups = Object.entries(fieldGroups).map(([groupName, fields]) => {
      const groupComplete = fields.every(field => {
        const value = currentData[field];
        return value && value.trim() !== '';
      });
      return { groupName, complete: groupComplete };
    });
    
    return allGroups.every(group => group.complete);
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
      newStatus = newSectionContent.procedureConfirmed ? 'completed' : 'not-started';
    } else if (section === 'postlab') {
      const answeredCount = newSectionContent.postLabAnswers.filter(answer => answer.trim().length > 20).length;
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


  // Update observation data selection
  const updateSelectedGroup = (group) => {
    const newObservationData = {
      ...observationData,
      selectedGroup: group
    };
    setObservationData(newObservationData);
    
    // Mark observations as completed
    const newSectionStatus = {
      ...sectionStatus,
      observations: 'completed'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: newSectionStatus
    });
  };

  // Update analysis data with completion checking
  const updateAnalysisData = (field, value, index = null) => {
    let newAnalysisData;
    
    if (index !== null) {
      const currentArray = analysisData[field] || ['', '', '', '', '', '', '', '', '', '', '', '', '', ''];
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
    
    // Check completion
    const analysisFields = ['xAxisVariable', 'yAxisVariable', 'lineStrateningExplanation', 'slopeValue', 'chargeToMassRatio', 'particleIdentification'];
    const vSquaredCount = newAnalysisData.calculatedVSquared.filter(val => val && val.toString().trim().length > 0).length;
    const fieldsComplete = analysisFields.every(fieldName => {
      const fieldValue = newAnalysisData[fieldName];
      return fieldValue && fieldValue.trim() !== '';
    });
    
    const isCompleted = vSquaredCount >= 8 && fieldsComplete;
    
    const newSectionStatus = {
      ...sectionStatus,
      analysis: isCompleted ? 'completed' : (vSquaredCount > 0 || fieldsComplete ? 'in-progress' : 'not-started')
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      analysisData: newAnalysisData,
      sectionStatus: newSectionStatus
    });
  };

  // Update post-lab data with completion checking
  const updatePostLabData = (field, value) => {
    const newPostLabData = {
      ...postLabData,
      [field]: value
    };
    
    setPostLabData(newPostLabData);
    
    // Check completion (needs most fields filled)
    const requiredFields = ['acceptedValue', 'experimentalValue', 'percentError', 'percentErrorCalculation', 'errorSources'];
    const isCompleted = requiredFields.every(fieldName => {
      const fieldValue = newPostLabData[fieldName];
      return fieldValue && fieldValue.trim() !== '';
    });
    
    const newSectionStatus = {
      ...sectionStatus,
      postlab: isCompleted ? 'completed' : 'in-progress'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase
    saveToFirebase({
      postLabData: newPostLabData,
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
    
    // Auto-complete simulation section when user navigates to it (visual demonstration only)
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
    { key: 'postlab', label: 'Post-Lab' }
  ];
  
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = sections.length;

  // PDF generation function
  const generatePDF = async () => {
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
      
      // Helper function to clean HTML content
      const cleanHtmlContent = (htmlContent) => {
        if (!htmlContent) return '[No content provided]';
        return htmlContent.replace(/<[^>]*>/g, '').trim() || '[No content provided]';
      };
      
      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Lab 5 - Electric Fields and Charge-to-Mass Ratio', 105, yPosition, { align: 'center' });
      yPosition += 15;
      
      // Student info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student: ${currentUser?.email || 'Unknown'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Lab Status: ${isSubmitted ? 'Submitted' : 'In Progress'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Completion: ${completedCount}/${totalSections} sections`, 20, yPosition);
      yPosition += 15;
      
      // Lab Overview
      addText('Lab Overview', 16, 'bold');
      addText('In this lab, you will use an electric field to determine the identity of an unknown charged particle from a radioactive source. You\'ll identify the particle based on its charge-to-mass ratio.');
      addText('Using parallel plates with variable DC voltage, you\'ll measure particle velocities and analyze the relationship between electric field strength and final particle velocity.');
      yPosition += 10;
      
      // Objectives
      addText('Lab Objectives:', 14, 'bold');
      addText('• Use an electric field apparatus to accelerate charged particles');
      addText('• Measure particle velocities at different voltages');
      addText('• Calculate charge-to-mass ratios using energy conservation');
      addText('• Identify the unknown particle by comparing to theoretical values');
      yPosition += 10;
      
      // Theoretical Background
      addText('Theoretical Background', 14, 'bold');
      addText('When a charged particle is accelerated through an electric potential difference V, the electric potential energy is converted to kinetic energy: qV = ½mv²');
      addText('Rearranging for v²: v² = (2q/m)V');
      addText('This linear relationship allows us to determine the charge-to-mass ratio from the slope of a v² vs. V graph.');
      yPosition += 15;
      
      // Section 1: Introduction
      checkNewPage(30);
      addText('1. Introduction', 16, 'bold');
      addText(`Introduction Status: ${sectionStatus.introduction === 'completed' ? 'Completed' : 'Not Completed'}`);
      if (sectionContent.introductionConfirmed) {
        addText('✓ Student confirmed understanding of lab introduction, objectives, and theoretical background');
      } else {
        addText('○ Student has not yet confirmed understanding of introduction');
      }
      yPosition += 10;
      
      // Section 2: Procedure
      checkNewPage(50);
      addText('2. Procedure', 16, 'bold');
      addText('Experimental Steps:', 14, 'bold');
      addText('1. Set up the electric field apparatus with parallel plates separated by 1.5 cm');
      addText('2. Connect the variable voltage supply (range: 10V to 75V)');
      addText('3. Position the radioactive particle source at the entrance');
      addText('4. Calibrate the mass spectrometer detector');
      addText('5. For each voltage setting, apply voltage and record final particle velocity');
      addText('6. Record all measurements in the data table');
      addText('7. Note any adjustments needed for particle detection');
      yPosition += 10;
      addText(`Procedure Status: ${sectionStatus.procedure === 'completed' ? 'Completed' : 'Not Completed'}`);
      if (sectionContent.procedureConfirmed) {
        addText('✓ Student confirmed understanding of experimental procedure');
      } else {
        addText('○ Student has not yet confirmed understanding of procedure');
      }
      yPosition += 15;
      
      // Section 3: Simulation
      checkNewPage(40);
      addText('3. Simulation & Data Collection', 16, 'bold');
      addText('An interactive simulation was used to demonstrate the particle acceleration process.');
      
      // Add simulation placeholder
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPosition, 170, 40, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'italic');
      doc.text('Interactive Particle Acceleration Simulation', 105, yPosition + 15, { align: 'center' });
      doc.text('(Animation shows how voltage affects particle acceleration)', 105, yPosition + 25, { align: 'center' });
      yPosition += 50;
      addText(`Simulation Status: ${sectionStatus.simulation === 'completed' ? 'Completed' : 'Not Completed'}`);
      yPosition += 15;
      
      // Section 4: Observations
      checkNewPage(80);
      addText('4. Observations', 16, 'bold');
      addText('Data Group Selection:', 14, 'bold');
      addText('Students were provided with two different data groups (Alpha and Beta) representing different experimental conditions.');
      
      if (observationData.selectedGroup) {
        addText(`Selected Data Group: ${observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}`, 14, 'bold');
        
        // Add qualitative observation
        const qualitativeText = observationData.selectedGroup === 'alpha' 
          ? observationData.groupAlpha.qualitative 
          : observationData.groupBeta.qualitative;
        addText('Qualitative Observation:', 12, 'bold');
        addText(qualitativeText);
        yPosition += 10;
        
        // Create data table
        const selectedData = observationData.selectedGroup === 'alpha' 
          ? observationData.groupAlpha.data 
          : observationData.groupBeta.data;
        
        const tableData = selectedData?.map(row => [
          row.trial.toString(),
          row.V.toString(),
          row.v.toString()
        ]) || [];
        
        checkNewPage(60);
        addText('Quantitative Data:', 12, 'bold');
        autoTable(doc, {
          head: [['Trial', 'V (V)', 'v (×10⁴ m/s)']],
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
      
      // Section 5: Analysis
      checkNewPage(80);
      addText('5. Analysis', 16, 'bold');
      addText('Instructions: Use line straightening technique to determine the charge-to-mass ratio of the particle.');
      addText('Key relationship: ½mv² = qV, so v² = (2q/m)V');
      yPosition += 10;
      
      // v² calculations
      if (observationData.selectedGroup && analysisData.calculatedVSquared) {
        addText('Step 1: Calculate v² Values', 14, 'bold');
        const selectedData = observationData.selectedGroup === 'alpha' 
          ? observationData.groupAlpha.data 
          : observationData.groupBeta.data;
        
        const analysisTableData = selectedData?.map((row, index) => [
          row.trial.toString(),
          row.V.toString(),
          row.v.toString(),
          analysisData.calculatedVSquared[index] || '[Not calculated]'
        ]) || [];
        
        checkNewPage(60);
        autoTable(doc, {
          head: [['Trial', 'V (V)', 'v (×10⁴ m/s)', 'v² (×10⁸ m²/s²)']],
          body: analysisTableData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 10 },
          headStyles: { fillColor: [200, 200, 200] }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      
      // Line straightening analysis
      addText('Step 2: Line Straightening Technique', 14, 'bold');
      addText(`X-axis variable: ${cleanHtmlContent(analysisData.xAxisVariable)}`);
      addText(`Y-axis variable: ${cleanHtmlContent(analysisData.yAxisVariable)}`);
      addText(`Explanation: ${cleanHtmlContent(analysisData.lineStrateningExplanation)}`);
      addText(`Why this helps: ${cleanHtmlContent(analysisData.whyLineStrateningHelps)}`);
      yPosition += 10;
      
      // Slope calculation
      addText('Step 3: Determine the Slope', 14, 'bold');
      addText(`Slope value: ${cleanHtmlContent(analysisData.slopeValue)} ×10⁸ m²/(s²⋅V)`);
      addText(`Slope calculation: ${cleanHtmlContent(analysisData.slopeCalculation)}`);
      yPosition += 10;
      
      // Charge-to-mass ratio
      addText('Step 4: Calculate Charge-to-Mass Ratio', 14, 'bold');
      addText('Relationship: slope = 2q/m, so q/m = slope/2');
      addText(`Charge-to-mass ratio: ${cleanHtmlContent(analysisData.chargeToMassRatio)} ×10⁸ C/kg`);
      addText(`Calculation: ${cleanHtmlContent(analysisData.chargeToMassCalculation)}`);
      addText(`Particle identification: ${cleanHtmlContent(analysisData.particleIdentification)}`);
      yPosition += 15;
      
      // Section 6: Post-Lab
      checkNewPage(80);
      addText('6. Post-Lab Questions & Error Analysis', 16, 'bold');
      
      // Error Analysis
      addText('Error Analysis:', 14, 'bold');
      addText(`Accepted value (q/m): ${cleanHtmlContent(postLabData.acceptedValue)}`);
      addText(`Experimental value (q/m): ${cleanHtmlContent(postLabData.experimentalValue)}`);
      addText(`Percent error: ${cleanHtmlContent(postLabData.percentError)}`);
      addText(`Percent error calculation: ${cleanHtmlContent(postLabData.percentErrorCalculation)}`);
      addText(`Error sources: ${cleanHtmlContent(postLabData.errorSources)}`);
      yPosition += 10;
      
      // Reflection Questions
      addText('Reflection Questions:', 14, 'bold');
      addText('1. Energy conservation principle:');
      addText(cleanHtmlContent(sectionContent.postLabAnswers[0]));
      yPosition += 5;
      addText('2. Line straightening technique importance:');
      addText(cleanHtmlContent(sectionContent.postLabAnswers[1]));
      yPosition += 5;
      addText('3. Factors affecting accuracy:');
      addText(cleanHtmlContent(sectionContent.postLabAnswers[2]));
      yPosition += 15;
      
      // Lab Status Summary
      checkNewPage(30);
      addText('Lab Status Summary', 16, 'bold');
      addText(`Sections completed: ${completedCount}/${totalSections}`);
      addText(`Completion percentage: ${Math.round((completedCount / totalSections) * 100)}%`);
      if (isSubmitted) {
        addText('Lab Status: Submitted for grading');
        addText(`Submission Date: ${course?.Assessments?.[questionId]?.timestamp ? new Date(course.Assessments[questionId].timestamp).toLocaleString() : 'Unknown'}`);
      } else {
        addText('Lab Status: In progress');
      }
      
      // Save the PDF
      doc.save(`Lab_5_Electric_Fields_${currentUser?.email || 'student'}_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('PDF generated successfully!');
      
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };

  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
        
            <p className="text-lg text-gray-600 mb-8">
              Use electric fields to determine the identity of an unknown charged particle
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this lab, you will use an electric field to determine the identity of an unknown charged 
                particle from a radioactive source. You'll identify the particle based on its charge-to-mass ratio.
              </p>
              <p>
                Using parallel plates with variable DC voltage, you'll measure particle velocities and analyze 
                the relationship between electric field strength and final particle velocity.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objective:</p>
                <p className="text-blue-700">Determine the charge-to-mass ratio to identify the unknown particle</p>
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
                  : 'This lab contains 6 sections using the interactive simulation.'
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

      {/* Lab Title and PDF Button - Outside lab-input-disabled */}
      <div className="text-center">
     
        {isSubmitted && !isStaffView && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Lab Submitted - Read Only
          </div>
        )}
        
        {/* PDF Generation Button */}
        <div className="mt-4">
          <button
            onClick={generatePDF}
            className="pdf-button px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 flex items-center gap-2 mx-auto shadow-md"
          >
            <FileText size={16} />
            Generate Lab PDF
          </button>
        </div>
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
              <li>• Use an electric field apparatus to accelerate charged particles</li>
              <li>• Measure particle velocities at different voltages</li>
              <li>• Calculate charge-to-mass ratios using energy conservation</li>
              <li>• Identify the unknown particle by comparing to theoretical values</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-2">Theoretical Background</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                When a charged particle is accelerated through an electric potential difference V, 
                the electric potential energy is converted to kinetic energy:
              </p>
              <div className="bg-white p-3 rounded border">
                <BlockMath math="qV = \frac{1}{2}mv^2" />
              </div>
              <p>
                Rearranging for v²: <InlineMath math="v^2 = \frac{2q}{m}V" />
              </p>
              <p>
                This linear relationship allows us to determine the charge-to-mass ratio from the slope of a v² vs. V graph.
              </p>
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
              I have read and understood the lab introduction, objectives, and theoretical background. I am ready to begin the experiment.
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
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-800 mb-3">Experimental Steps</h3>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Set up the electric field apparatus with parallel plates separated by 1.5 cm</li>
              <li>Connect the variable voltage supply (range: 10V to 75V)</li>
              <li>Position the radioactive particle source at the entrance</li>
              <li>Calibrate the mass spectrometer detector</li>
              <li>For each voltage setting (10V, 15V, 20V, ..., 75V):
                <ul className="ml-6 mt-1 list-disc list-inside">
                  <li>Apply the voltage to the parallel plates</li>
                  <li>Record the final particle velocity from the mass spectrometer</li>
                  <li>Ensure particles reach the detector</li>
                </ul>
              </li>
              <li>Record all measurements in the data table</li>
              <li>Note any adjustments needed for particle detection</li>
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
              I have read and understand the experimental procedure. I am ready to begin data collection.
            </label>
          </div>
        </div>
      </div>

      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.simulation)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Simulation</span>
          {getStatusIcon(sectionStatus.simulation)}
        </h2>
        <div className="space-y-4">
    
          
          <ParticleAccelerationSimulationV2 />
          
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-700">
              ✓ Simulation demonstration completed. The animation above shows how voltage affects particle acceleration.
              Proceed to the observations section to work with actual experimental data.
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
          {/* Group Selection */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Select Data Group</h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose one group's experimental data to use for your analysis:
            </p>
            
            {/* Group Selection Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[
                { key: 'groupAlpha', label: 'Group Alpha', displayKey: 'alpha' },
                { key: 'groupBeta', label: 'Group Beta', displayKey: 'beta' }
              ].map(group => (
                <button
                  key={group.key}
                  onClick={() => updateSelectedGroup(group.displayKey)}
                  className={`px-4 py-3 text-sm font-medium rounded-lg border transition-all duration-200 ${
                    observationData.selectedGroup === group.displayKey
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {group.label}
                </button>
              ))}
            </div>

            {/* Selected Group Display */}
            {observationData.selectedGroup && (
              <div className="mt-6">
                <div className="space-y-4">
                  {/* Qualitative Observation */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">Qualitative Observation</h4>
                    <div className="bg-gray-50 p-3 rounded">
                      <p className="text-gray-700 text-sm">
                        {observationData.selectedGroup === 'alpha' 
                          ? observationData.groupAlpha.qualitative
                          : observationData.groupBeta.qualitative
                        }
                      </p>
                    </div>
                  </div>

                  {/* Quantitative Data */}
                  <div>
                    <h4 className="font-medium text-gray-700 mb-3">
                      Quantitative Data: Group {observationData.selectedGroup.charAt(0).toUpperCase() + observationData.selectedGroup.slice(1)}
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border border-gray-200 rounded">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="p-3 border-b text-left">Trial</th>
                            <th className="p-3 border-b text-left">V (V)</th>
                            <th className="p-3 border-b text-left">v (×10⁴ m/s)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const selectedData = observationData.selectedGroup === 'alpha' 
                              ? observationData.groupAlpha.data 
                              : observationData.groupBeta.data;
                            
                            return selectedData?.map((row, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="p-3 border-b">{row.trial}</td>
                                <td className="p-3 border-b">{row.V}</td>
                                <td className="p-3 border-b">{row.v}</td>
                              </tr>
                            )) || [];
                          })()}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Instruction when no group selected */}
            {!observationData.selectedGroup && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">Select a group above to view the observations</p>
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
              <strong>Instructions:</strong> Use line straightening technique to determine the charge-to-mass ratio of the particle.
            </p>
            <p className="text-sm text-blue-700">
              Key relationship: ½mv² = qV, so v² = (2q/m)V
            </p>
          </div>

          {/* Data Table with Student Calculations */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 1: Calculate v² Values</h3>
            <p className="text-sm text-gray-600 mb-4">
              Fill in the v² column using your selected observation data (remember v is in ×10⁴ m/s):
            </p>
            
            {observationData.selectedGroup ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border border-gray-200 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="p-3 border-b text-left">Trial</th>
                      <th className="p-3 border-b text-left">V (V)</th>
                      <th className="p-3 border-b text-left">v (×10⁴ m/s)</th>
                      <th className="p-3 border-b text-left">v² (×10⁸ m²/s²)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const selectedData = observationData.selectedGroup === 'alpha' 
                        ? observationData.groupAlpha.data 
                        : observationData.groupBeta.data;
                      
                      return selectedData?.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="p-3 border-b">{row.trial}</td>
                          <td className="p-3 border-b">{row.V}</td>
                          <td className="p-3 border-b">{row.v}</td>
                          <td className="p-3 border-b">
                            <input
                              type="number"
                              step="0.01"
                              value={analysisData.calculatedVSquared?.[index] || ''}
                              onChange={(e) => updateAnalysisData('calculatedVSquared', e.target.value, index)}
                              className="w-24 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            
            <div className="grid md:grid-cols-2 gap-4 mb-4 min-h-[150px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What variable goes on the x-axis?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="x-axis-variable"
                  initialContent={analysisData.xAxisVariable || ''}
                  onSave={(content) => updateAnalysisData('xAxisVariable', content)}
                  onContentChange={(content) => updateAnalysisData('xAxisVariable', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What variable goes on the y-axis?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="y-axis-variable"
                  initialContent={analysisData.yAxisVariable || ''}
                  onSave={(content) => updateAnalysisData('yAxisVariable', content)}
                  onContentChange={(content) => updateAnalysisData('yAxisVariable', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Explain why this line straightening technique helps determine the charge-to-mass ratio:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="line-straightening-explanation"
                initialContent={analysisData.lineStrateningExplanation || ''}
                onSave={(content) => updateAnalysisData('lineStrateningExplanation', content)}
                onContentChange={(content) => updateAnalysisData('lineStrateningExplanation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How does this help determine the charge-to-mass ratio of the particle?
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="why-line-straightening-helps"
                initialContent={analysisData.whyLineStrateningHelps || ''}
                onSave={(content) => updateAnalysisData('whyLineStrateningHelps', content)}
                onContentChange={(content) => updateAnalysisData('whyLineStrateningHelps', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
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
                  value="×10⁸ m²/(s²⋅V)"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your calculation or method for determining the slope:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="slope-calculation"
                initialContent={analysisData.slopeCalculation || ''}
                onSave={(content) => updateAnalysisData('slopeCalculation', content)}
                onContentChange={(content) => updateAnalysisData('slopeCalculation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>

          {/* Charge-to-Mass Ratio Calculation */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Step 4: Calculate Charge-to-Mass Ratio</h3>
            
            <div className="bg-gray-50 p-3 rounded mb-4">
              <p className="text-sm text-gray-700">
                <strong>Relationship:</strong> slope = 2q/m, so q/m = slope/2
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Charge-to-mass ratio (q/m):
                </label>
                <input
                  type="text"
                  value={analysisData.chargeToMassRatio}
                  onChange={(e) => updateAnalysisData('chargeToMassRatio', e.target.value)}
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
                  value="×10⁸ C/kg"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your calculation for determining the charge-to-mass ratio:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="charge-mass-calculation"
                initialContent={analysisData.chargeToMassCalculation || ''}
                onSave={(content) => updateAnalysisData('chargeToMassCalculation', content)}
                onContentChange={(content) => updateAnalysisData('chargeToMassCalculation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Based on your result, what particle do you think this is? (electron, proton, or alpha particle)
              </label>
              <input
                type="text"
                value={analysisData.particleIdentification}
                onChange={(e) => updateAnalysisData('particleIdentification', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder=""
              />
            </div>
          </div>
        </div>
      </div>

      {/* Post-Lab Section */}
      <div id="section-postlab" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.postlab)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Post-Lab Questions & Error Analysis</span>
          {getStatusIcon(sectionStatus.postlab)}
        </h2>
        <div className="space-y-6">
          {/* Error Analysis */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Error Analysis</h3>
            <div className="bg-blue-50 p-3 rounded mb-4">
              <p className="text-sm text-blue-700">
                Compare your experimental charge-to-mass ratio to the accepted theoretical value for your identified particle.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4 mb-4 min-h-[150px]">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Accepted value (q/m):
                </label>
                <p className="text-xs text-gray-500 mt-1">Include units (×10⁸ C/kg)</p>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="accepted-value"
                  initialContent={postLabData.acceptedValue || ''}
                  onSave={(content) => updatePostLabData('acceptedValue', content)}
                  onContentChange={(content) => updatePostLabData('acceptedValue', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
                
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Experimental value (q/m):
                </label>
                <p className="text-xs text-gray-500 mt-1">From your analysis above</p>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="experimental-value"
                  initialContent={postLabData.experimentalValue || ''}
                  onSave={(content) => updatePostLabData('experimentalValue', content)}
                  onContentChange={(content) => updatePostLabData('experimentalValue', content)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
                
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percent error:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="percent-error"
                initialContent={postLabData.percentError || ''}
                onSave={(content) => updatePostLabData('percentError', content)}
                onContentChange={(content) => updatePostLabData('percentError', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Show your percent error calculation:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="percent-error-calculation"
                initialContent={postLabData.percentErrorCalculation || ''}
                onSave={(content) => updatePostLabData('percentErrorCalculation', content)}
                onContentChange={(content) => updatePostLabData('percentErrorCalculation', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Identify and explain possible sources of error in this experiment:
              </label>
              <SimpleQuillEditor
                courseId="2"
                unitId="lab-electric-fields"
                itemId="error-sources"
                initialContent={postLabData.errorSources || ''}
                onSave={(content) => updatePostLabData('errorSources', content)}
                onContentChange={(content) => updatePostLabData('errorSources', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
            </div>
          </div>

          {/* Post-Lab Questions */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="font-medium text-gray-800 mb-3">Reflection Questions</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  1. Explain how the energy conservation principle ½mv² = qV allows us to determine particle identity.
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="postlab-question-1"
                  initialContent={sectionContent.postLabAnswers[0] || ''}
                  onSave={(content) => updateSectionContent('postlab', 'postLabAnswers', content, 0)}
                  onContentChange={(content) => updateSectionContent('postlab', 'postLabAnswers', content, 0)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  2. Why was it important to use the line straightening technique (plotting v² vs. V) rather than v vs. V?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="postlab-question-2"
                  initialContent={sectionContent.postLabAnswers[1] || ''}
                  onSave={(content) => updateSectionContent('postlab', 'postLabAnswers', content, 1)}
                  onContentChange={(content) => updateSectionContent('postlab', 'postLabAnswers', content, 1)}
                  onError={(error) => console.error('SimpleQuillEditor error:', error)}
                  disabled={isSubmitted && !isStaffView}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  3. What factors might affect the accuracy of charge-to-mass ratio measurements in this type of experiment?
                </label>
                <SimpleQuillEditor
                  courseId="2"
                  unitId="lab-electric-fields"
                  itemId="postlab-question-3"
                  initialContent={sectionContent.postLabAnswers[2] || ''}
                  onSave={(content) => updateSectionContent('postlab', 'postLabAnswers', content, 2)}
                  onContentChange={(content) => updateSectionContent('postlab', 'postLabAnswers', content, 2)}
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
          labTitle: 'Lab 5 - Electric Fields and Charge-to-Mass Ratio',
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

export default LabElectricFields;
export { aiPrompt };