import React, { useState, useEffect, useRef, useCallback } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getDatabase, ref, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import { toast } from 'sonner';
import { Info } from 'lucide-react';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';

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
 * Lab 3 - Laser Wavelength for Physics 30
 * Item ID: assignment_1747283296776_955
 * Unit: Wave Properties of Light
 */

// Interactive Diffraction Simulation Component
const DiffractionSimulation = ({ onDataCollected }) => {
  const canvasRef = useRef(null);
  const [currentGrating, setCurrentGrating] = useState('replica');
  const [isRunning, setIsRunning] = useState(false);
  
  // Simulation state for different gratings
  const [simulationState, setSimulationState] = useState({
    replica: { // Replica diffraction grating
      linesPerMm: 300,
      distance: 1.0, // meters from grating to screen
      xRight: 0.105, // m
      xLeft: -0.098, // m
      wavelength: 650 // nm (calculated)
    },
    glass: { // Glass diffraction grating
      linesPerMm: 600,
      distance: 1.0,
      xRight: 0.054,
      xLeft: -0.051,
      wavelength: 650
    },
    cd: { // CD
      spacing: 1600, // nm
      distance: 1.0,
      xRight: 0.42,
      xLeft: -0.41,
      wavelength: 650
    },
    dvd: { // DVD
      spacing: 740, // nm
      distance: 1.0,
      xRight: 0.88,
      xLeft: -0.86,
      wavelength: 650
    }
  });
  
  // Canvas drawing functions
  const drawCanvas = () => {
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, width, height);
    
    // Draw diffraction pattern based on current grating
    drawDiffractionPattern(ctx, width, height);
    } catch (error) {
      console.error('Canvas drawing error:', error);
    }
  };
  
  // Draw diffraction pattern simulation
  const drawDiffractionPattern = (ctx, width, height) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const current = simulationState[currentGrating];
    
    // Draw laser source
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(50, centerY, 8, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('Laser', 35, centerY + 25);
    
    // Draw grating
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY - 80);
    ctx.lineTo(centerX - 100, centerY + 80);
    ctx.stroke();
    
    // Draw grating lines
    for (let i = -15; i <= 15; i += 2) {
      ctx.strokeStyle = '#374151';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(centerX - 100, centerY + i * 4);
      ctx.lineTo(centerX - 95, centerY + i * 4);
      ctx.stroke();
    }
    
    // Draw incident beam
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(60, centerY);
    ctx.lineTo(centerX - 100, centerY);
    ctx.stroke();
    
    // Draw screen
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(centerX + 150, centerY - 100);
    ctx.lineTo(centerX + 150, centerY + 100);
    ctx.stroke();
    
    // Calculate diffraction angles and positions
    const distance = current.distance * 200; // Scale for canvas (200 pixels = 1m)
    const screenX = centerX + 150;
    
    // Central maximum
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(screenX, centerY, 4, 0, 2 * Math.PI);
    ctx.fill();
    
    // Calculate first-order maxima positions
    let d; // grating spacing in meters
    if (currentGrating === 'cd') {
      d = current.spacing * 1e-9; // Convert nm to m
    } else if (currentGrating === 'dvd') {
      d = current.spacing * 1e-9;
    } else {
      d = 1 / (current.linesPerMm * 1000); // Convert lines/mm to spacing in m
    }
    
    // Calculate theoretical positions
    const wavelength = 650e-9; // Red laser wavelength in meters
    const theta = Math.asin(wavelength / d);
    const x = current.distance * Math.tan(theta);
    
    // Update simulation state with calculated positions
    const pixelScale = 200; // pixels per meter
    const rightPos = centerY - (x * pixelScale);
    const leftPos = centerY + (x * pixelScale);
    
    // Draw first-order maxima
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(screenX, rightPos, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(screenX, leftPos, 3, 0, 2 * Math.PI);
    ctx.fill();
    
    // Draw diffracted beams
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // Right beam
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY);
    ctx.lineTo(screenX, rightPos);
    ctx.stroke();
    
    // Left beam
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY);
    ctx.lineTo(screenX, leftPos);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Draw measurements
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    
    // Distance measurement
    ctx.beginPath();
    ctx.moveTo(centerX - 100, centerY + 120);
    ctx.lineTo(screenX, centerY + 120);
    ctx.stroke();
    
    // Vertical measurements
    ctx.beginPath();
    ctx.moveTo(screenX + 20, centerY);
    ctx.lineTo(screenX + 20, rightPos);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(screenX + 20, centerY);
    ctx.lineTo(screenX + 20, leftPos);
    ctx.stroke();
    
    ctx.setLineDash([]);
    
    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.fillText('Grating', centerX - 120, centerY - 90);
    ctx.fillText('Screen', screenX - 20, centerY - 110);
    ctx.fillText(`d = ${d.toExponential(2)} m`, centerX - 120, centerY + 100);
    ctx.fillText(`L = ${current.distance.toFixed(1)} m`, centerX - 20, centerY + 140);
    ctx.fillText(`x₁`, screenX + 30, rightPos);
    ctx.fillText(`x₋₁`, screenX + 30, leftPos);
  };
  
  // Update simulation parameters
  const updateParameter = (grating, parameter, value) => {
    const newValue = parseFloat(value);
    
    setSimulationState(prev => {
      const current = prev[grating];
      const updated = { ...current, [parameter]: newValue };
      
      // If distance is being changed, recalculate x positions
      if (parameter === 'distance') {
        let d; // grating spacing in meters
        if (grating === 'cd') {
          d = current.spacing * 1e-9; // Convert nm to m
        } else if (grating === 'dvd') {
          d = current.spacing * 1e-9;
        } else {
          d = 1 / (current.linesPerMm * 1000); // Convert lines/mm to spacing in m
        }
        
        // Calculate theoretical positions
        const wavelength = 650e-9; // Red laser wavelength in meters
        const theta = Math.asin(wavelength / d);
        const x = newValue * Math.tan(theta);
        
        // Add random measurement error (±2% to simulate real measurement uncertainty)
        const errorFactor = 0.95 + Math.random() * 0.1; // Random factor between 0.98 and 1.02
        const xWithError = x * errorFactor;
        
        // Update both distance and calculated x positions with slight asymmetry, rounded to nearest hundredth
        updated.xRight = Math.round(xWithError * 100) / 100;
        updated.xLeft = -Math.round(xWithError * (0.95 + Math.random() * 0.01) * 100) / 100; // Slightly different error for left side
      }
      
      return {
        ...prev,
        [grating]: updated
      };
    });
  };
  
  // Check if maxima are visible on screen (within reasonable bounds)
  const areMaximaVisible = () => {
    const current = simulationState[currentGrating];
    // Check if both maxima are within ±0.5m for good visibility
    const maxScreenHeight = 0.5; // meters
    return Math.abs(current.xRight) <= maxScreenHeight && Math.abs(current.xLeft) <= maxScreenHeight;
  };

  // Collect measurement data
  const collectData = () => {
    const current = simulationState[currentGrating];
    let data = {};
    
    // Fill distance and x positions from simulation, but not d (students calculate d)
    data = {
      distance: current.distance,
      xRight: current.xRight,
      xLeft: current.xLeft
    };
    
    onDataCollected(currentGrating, data);
    
    // Show success toast
    toast.success(`Data collected for ${currentGrating.toUpperCase()}!`);
  };
  
  // Animation loop
  useEffect(() => {
    try {
      if (isRunning) {
        const interval = setInterval(() => {
          drawCanvas();
        }, 50);
        return () => clearInterval(interval);
      } else {
        drawCanvas();
      }
    } catch (error) {
      console.error('Simulation error:', error);
    }
  }, [isRunning, currentGrating, simulationState]);
  
  return (
    <div className="border border-gray-300 rounded-lg p-4">
      {/* Grating Selection */}
      <div className="mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">Select Grating:</h3>
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'replica', label: 'Replica Grating' },
            { key: 'glass', label: 'Glass Grating' },
            { key: 'cd', label: 'CD' },
            { key: 'dvd', label: 'DVD' }
          ].map(grating => (
            <button
              key={grating.key}
              onClick={() => setCurrentGrating(grating.key)}
              className={`px-3 py-2 text-sm font-medium rounded border ${
                currentGrating === grating.key
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {grating.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Canvas */}
      <div className="mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={400}
          className="border border-gray-300 rounded bg-gray-50"
        />
      </div>
      
      {/* Controls */}
      <div className="mb-4">
        <h4 className="font-semibold text-gray-800 mb-2">Adjust Distance to Screen:</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm text-gray-700">Distance to Screen</label>
              <span className="text-sm font-medium text-gray-900">{simulationState[currentGrating].distance.toFixed(1)} m</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="2.0"
              step="0.1"
              value={simulationState[currentGrating].distance}
              onChange={(e) => updateParameter(currentGrating, 'distance', e.target.value)}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>0.1 m</span>
              <span>2.0 m</span>
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 rounded-lg">
            <h5 className="text-sm font-semibold text-gray-700 mb-2">Measured Positions:</h5>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Right Maximum (x):</span>
                <span className="ml-2 font-medium text-gray-900">{simulationState[currentGrating].xRight.toFixed(2)} m</span>
              </div>
              <div>
                <span className="text-gray-600">Left Maximum (x):</span>
                <span className="ml-2 font-medium text-gray-900">{simulationState[currentGrating].xLeft.toFixed(2)} m</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Data Collection */}
      <div className="flex gap-4 items-center">
        <button
          onClick={collectData}
          disabled={!areMaximaVisible()}
          className={`px-4 py-2 font-medium rounded transition-colors ${
            areMaximaVisible()
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Collect Data for {currentGrating.toUpperCase()}
        </button>
        {!areMaximaVisible() && (
          <div className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded border border-amber-200">
            ⚠️ Adjust distance so both maxima are visible on screen
          </div>
        )}
      </div>
    </div>
  );
};

const LabLaserWavelength = ({ 
  courseId = '2', 
  course,
  isStaffView = false,
  devMode = false
}) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course config
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.['lab_laser_wavelength']?.questions?.[0]?.questionId || 'course2_lab_laser_wavelength';
  console.log('📋 Lab questionId:', questionId);
  
  // Create database reference for this lab using questionId
  const labDataRef = React.useMemo(() => {
    if (currentUser?.uid) {
      const path = `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`;
      console.log('🔗 Lab data path:', path);
      return ref(database, path);
    }
    return null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Ref to track if component is mounted (for cleanup)
  const isMountedRef = useRef(true);
  
  // Track lab started state
  const [labStarted, setLabStarted] = useState(false);
  
  // Track if student has saved progress
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Track current section
  const [currentSection, setCurrentSection] = useState('hypothesis');
  
  // Track completion status for each section (7 standard sections)
  const [sectionStatus, setSectionStatus] = useState({
    introduction: 'not-started',
    equipment: 'not-started', 
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    postlab: 'not-started'
  });
  
  // Track section content
  const [sectionContent, setSectionContent] = useState({
    hypothesis: '',
    conclusion: ''
  });
  
  // Track lab method (simulation or real)
  const [labMethod, setLabMethod] = useState('');
  
  // Track procedure understanding
  const [procedureUnderstood, setProcedureUnderstood] = useState(false);
  
  // Track which gratings have had data collected
  const [collectedGratings, setCollectedGratings] = useState(new Set());
  
  // Track observation data
  const [observationData, setObservationData] = useState({
    replica: {
      linesPerMm: '',
      d: '', // converted spacing
      distance: '',
      xRight: '',
      xLeft: '',
      xAverage: ''
    },
    glass: {
      linesPerMm: '',
      d: '',
      distance: '',
      xRight: '',
      xLeft: '',
      xAverage: ''
    },
    cd: {
      spacing: '1600', // nm
      d: '', // converted to meters
      distance: '',
      xRight: '',
      xLeft: '',
      xAverage: ''
    },
    dvd: {
      spacing: '740', // nm
      d: '',
      distance: '',
      xRight: '',
      xLeft: '',
      xAverage: ''
    }
  });
  
  // Track analysis data
  const [analysisData, setAnalysisData] = useState({
    method: '', // 'small-angle' or 'sine-theta'
    replicaWavelength: '',
    glassWavelength: '',
    cdWavelength: '',
    dvdWavelength: ''
  });
  
  // Track error analysis
  const [errorAnalysis, setErrorAnalysis] = useState({
    mostAccurate: '',
    explanation: ''
  });
  
  // Track post-lab answers
  const [postLabAnswers, setPostLabAnswers] = useState({
    lpQuestion: ''
  });
  
  
  // Track saving/loading state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Reference for calculation work textarea
  const calculationTextareaRef = useRef(null);
  
  // Check if lab has been submitted
  const isSubmitted = course?.Assessments?.[questionId] !== undefined;
  
  // Overlay state
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  
  // Calculate completion counts
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = Object.keys(sectionStatus).length;
  
  // Note: startLab function removed - lab now starts automatically
  
  // Save specific data to Firebase - simplified for real-time sync
  const saveToFirebase = useCallback(async (dataToUpdate) => {
    if (!currentUser?.uid || !labDataRef || isSubmitted) {
      return; // Don't save if no user, no ref, or already submitted
    }
    
    try {
      // Add metadata to the update
      const dataToSave = {
        ...dataToUpdate,
        lastModified: serverTimestamp(),
        courseId: courseId,
        labId: '20-lab-laser-wavelength'
      };
      
      // Update Firebase directly
      await update(labDataRef, dataToSave);
      
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save data');
    }
  }, [currentUser?.uid, labDataRef, courseId, isSubmitted]);
  
  // Simplified data loading using real-time sync
  useEffect(() => {
    // If lab is submitted, use data from course.Assessments
    if (isSubmitted && course?.Assessments?.[questionId]) {
      console.log('📋 Lab is submitted, loading from course.Assessments');
      const submittedData = course.Assessments[questionId];
      
      // Directly set all state from submitted data
      if (submittedData.sectionStatus) setSectionStatus(submittedData.sectionStatus);
      if (submittedData.sectionContent) setSectionContent(submittedData.sectionContent);
      if (submittedData.labMethod !== undefined) setLabMethod(submittedData.labMethod);
      if (submittedData.procedureUnderstood !== undefined) setProcedureUnderstood(submittedData.procedureUnderstood);
      if (submittedData.collectedGratings) setCollectedGratings(new Set(submittedData.collectedGratings));
      if (submittedData.observationData) setObservationData(submittedData.observationData);
      if (submittedData.analysisData) setAnalysisData(submittedData.analysisData);
      if (submittedData.errorAnalysis) setErrorAnalysis(submittedData.errorAnalysis);
      if (submittedData.postLabAnswers) setPostLabAnswers(submittedData.postLabAnswers);
      
      setLabStarted(true);
      setHasSavedProgress(true);
      setIsLoading(false);
      return;
    }

    // For non-submitted labs, set up real-time listener
    if (!currentUser?.uid || !labDataRef) {
      console.log('🔍 No user or lab ref');
      setLabStarted(true); // Allow access even without data
      setIsLoading(false);
      return;
    }

    console.log('🔄 Setting up real-time data sync...');
    setIsLoading(true);

    // Real-time listener for continuous sync
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📡 Real-time update:', data ? 'Data exists' : 'No data');
      
      if (data) {
        // Update all state from Firebase data
        if (data.sectionStatus) setSectionStatus(data.sectionStatus);
        if (data.sectionContent) setSectionContent(data.sectionContent);
        if (data.labMethod !== undefined) setLabMethod(data.labMethod);
        if (data.procedureUnderstood !== undefined) setProcedureUnderstood(data.procedureUnderstood);
        if (data.collectedGratings) setCollectedGratings(new Set(data.collectedGratings));
        if (data.observationData) setObservationData(data.observationData);
        if (data.analysisData) setAnalysisData(data.analysisData);
        if (data.errorAnalysis) setErrorAnalysis(data.errorAnalysis);
        if (data.postLabAnswers) setPostLabAnswers(data.postLabAnswers);
        if (data.currentSection) setCurrentSection(data.currentSection);
        
        setHasSavedProgress(true);
      }
      
      setLabStarted(true);
      setIsLoading(false);
    }, (error) => {
      console.error('❌ Firebase error:', error);
      setLabStarted(true); // Allow access even on error
      setIsLoading(false);
    });
    
    return () => {
      unsubscribe();
    };
  }, [currentUser?.uid, isSubmitted, course?.Assessments, questionId, labDataRef]);

  // Remove these useEffects - lab starting is now handled in the main data loading effect
  
  // Comprehensive PDF generation function
  const handlePrintPDF = async () => {
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
      
      // Helper function to add wrapped text
      const addText = (text, fontSize = 12, fontStyle = 'normal', maxWidth = 170) => {
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', fontStyle);
        const lines = doc.splitTextToSize(text, maxWidth);
        checkNewPage(lines.length * 5);
        doc.text(lines, 20, yPosition);
        yPosition += lines.length * 5 + 5;
      };
      
      // Add title and header info
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Lab 3 - Laser Wavelength', 20, yPosition);
      yPosition += 25;
      
      // Student info
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Student: ${currentUser?.email || 'Unknown'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Lab Method: ${labMethod || 'Not specified'}`, 20, yPosition);
      yPosition += 8;
      doc.text(`Status: ${isSubmitted ? 'Submitted' : 'In Progress'}`, 20, yPosition);
      yPosition += 20;
      
      // Lab Objective
      addText('Lab Objective', 16, 'bold');
      addText('The purpose of this lab is to measure the wavelength of a commercially available laser using several different forms of gratings.');
      yPosition += 10;
      
      // Safety Warning
      checkNewPage(30);
      addText('LASER SAFETY WARNING', 14, 'bold');
      addText('• Consider any exposure (direct or indirect) of the laser to your eye as dangerous');
      addText('• Never look directly into the laser beam or its reflections');
      addText('• Always wear appropriate eye protection when available');
      addText('• Be aware of reflective surfaces that could redirect the beam');
      yPosition += 10;
      
      // Hypothesis Section
      if (sectionContent.hypothesis) {
        checkNewPage(30);
        addText('Hypothesis', 16, 'bold');
        addText(sectionContent.hypothesis);
        yPosition += 10;
      }
      
      // Procedure Section
      checkNewPage(50);
      addText('Procedure', 16, 'bold');
      addText('Important Distinction:');
      addText('• For gratings (replica and glass): Make sure your laser passes through the grating');
      addText('• For CDs and DVDs: The laser must bounce off the surface');
      addText('General Steps:');
      addText('1. Set up the laser at a fixed distance from the screen');
      addText('2. Position the grating/disc between the laser and screen');
      addText('3. Observe the diffraction pattern on the screen');
      addText('4. Measure the positions of the first-order maxima');
      addText('5. Record all measurements carefully');
      addText('6. Repeat for each type of grating/disc');
      addText(`Procedure understood: ${procedureUnderstood ? 'Yes' : 'No'}`);
      yPosition += 15;
      
      // Simulation Section
      if (collectedGratings.size > 0) {
        checkNewPage(40);
        addText('Simulation Data Collection', 16, 'bold');
        addText(`Gratings collected data for: ${Array.from(collectedGratings).join(', ')}`);
        
        // Add simulation placeholder
        doc.setFillColor(240, 240, 240);
        doc.rect(20, yPosition, 170, 40, 'F');
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Interactive Diffraction Simulation Used', 105, yPosition + 15, { align: 'center' });
        doc.text('Data collected for laser wavelength measurement', 105, yPosition + 25, { align: 'center' });
        yPosition += 55;
      }
      
      // Observations & Data Table
      checkNewPage(80);
      addText('Observations & Data Collection', 16, 'bold');
      
      // Create observation data table
      const observationTableData = [];
      ['replica', 'glass', 'cd', 'dvd'].forEach(grating => {
        const data = observationData[grating];
        const gratingName = grating === 'replica' ? 'Replica Grating' :
                           grating === 'glass' ? 'Glass Grating' :
                           grating.toUpperCase();
        
        observationTableData.push([
          gratingName,
          data.d || '',
          data.distance ? parseFloat(data.distance).toFixed(2) : '',
          data.xRight ? parseFloat(data.xRight).toFixed(2) : '',
          data.xLeft ? Math.abs(parseFloat(data.xLeft)).toFixed(2) : '',
          data.xAverage || ''
        ]);
      });
      
      doc.autoTable({
        head: [['Diffraction Grating', 'd (nm)', 'l (m)', '|x_right| (m)', '|x_left| (m)', '|x_ave| (m)']],
        body: observationTableData,
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [200, 200, 200] },
        styles: { fontSize: 10 },
        margin: { left: 20, right: 20 }
      });
      
      yPosition = doc.lastAutoTable.finalY + 15;
      
      // Analysis Section
      checkNewPage(60);
      addText('Analysis', 16, 'bold');
      
      if (analysisData.method) {
        addText('Method Selected:', 14, 'bold');
        const methodName = analysisData.method === 'small-angle' ? 
          'Small Angle Approximation (sin θ ≈ tan θ ≈ θ)' : 
          'Sine Theta Method (λ = d sin θ)';
        addText(methodName);
        
        if (analysisData.methodExplanation) {
          addText('Method Explanation:');
          addText(analysisData.methodExplanation);
        }
        yPosition += 10;
      }
      
      // Calculated Wavelengths
      if (analysisData.replicaWavelength || analysisData.glassWavelength || 
          analysisData.cdWavelength || analysisData.dvdWavelength) {
        checkNewPage(50);
        addText('Calculated Wavelengths', 14, 'bold');
        
        const wavelengthData = [];
        if (analysisData.replicaWavelength) wavelengthData.push(['Replica Grating', `${analysisData.replicaWavelength} nm`]);
        if (analysisData.glassWavelength) wavelengthData.push(['Glass Grating', `${analysisData.glassWavelength} nm`]);
        if (analysisData.cdWavelength) wavelengthData.push(['CD', `${analysisData.cdWavelength} nm`]);
        if (analysisData.dvdWavelength) wavelengthData.push(['DVD', `${analysisData.dvdWavelength} nm`]);
        
        doc.autoTable({
          head: [['Grating Type', 'Calculated Wavelength']],
          body: wavelengthData,
          startY: yPosition,
          theme: 'grid',
          headStyles: { fillColor: [200, 200, 200] },
          styles: { fontSize: 10 },
          margin: { left: 20, right: 20 }
        });
        
        yPosition = doc.lastAutoTable.finalY + 15;
      }
      
      // Calculation Work - always show this section
      checkNewPage(40);
      addText('Calculation Work', 14, 'bold');
      if (analysisData.calculationWork && analysisData.calculationWork.trim()) {
        addText('Note: Detailed calculation work with mathematical formatting is available in the online lab interface.');
        addText('The calculation work contains mathematical expressions and formulas that cannot be properly');
        addText('displayed in this PDF format. Please refer to the online submission for full details.');
      } else {
        addText('[No calculation work provided]');
      }
      yPosition += 10;
      
      // Error Analysis
      if (errorAnalysis.mostAccurate || Object.values(errorAnalysis).some(v => v && v !== '')) {
        checkNewPage(60);
        addText('Error Analysis', 16, 'bold');
        
        if (errorAnalysis.mostAccurate) {
          const gratingName = errorAnalysis.mostAccurate === 'replica' ? 'Replica Grating' :
                             errorAnalysis.mostAccurate === 'glass' ? 'Glass Grating' :
                             errorAnalysis.mostAccurate.toUpperCase();
          addText(`Most Accurate Result: ${gratingName}`);
        }
        
        // Percent Error Table
        const errorData = [];
        if (errorAnalysis.replicaError) errorData.push(['Replica Grating', `${errorAnalysis.replicaError}%`]);
        if (errorAnalysis.glassError) errorData.push(['Glass Grating', `${errorAnalysis.glassError}%`]);
        if (errorAnalysis.cdError) errorData.push(['CD', `${errorAnalysis.cdError}%`]);
        if (errorAnalysis.dvdError) errorData.push(['DVD', `${errorAnalysis.dvdError}%`]);
        
        if (errorData.length > 0) {
          doc.autoTable({
            head: [['Grating Type', 'Percent Error']],
            body: errorData,
            startY: yPosition,
            theme: 'grid',
            headStyles: { fillColor: [200, 200, 200] },
            styles: { fontSize: 10 },
            margin: { left: 20, right: 20 }
          });
          
          yPosition = doc.lastAutoTable.finalY + 15;
        }
      }
      
      // Post-Lab Questions
      if (postLabAnswers.lpQuestion) {
        checkNewPage(50);
        addText('Post-Lab Questions', 16, 'bold');
        addText('Question: Before CDs people mostly listened to music recorded on LP records. Explain if you would be able to perform this lab with an LP instead of a CD.');
        addText('Answer:');
        addText(postLabAnswers.lpQuestion);
      }
      
      // Footer with completion info
      checkNewPage(30);
      addText('Lab Completion Summary', 14, 'bold');
      addText(`Sections completed: ${completedCount}/${totalSections}`);
      addText(`Completion percentage: ${Math.round((completedCount / totalSections) * 100)}%`);
      if (isSubmitted) {
        addText('Lab Status: Submitted for grading');
      } else {
        addText('Lab Status: In progress');
      }
      
      // Save the PDF
      doc.save(`lab-3-laser-wavelength-${currentUser?.email || 'student'}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Comprehensive PDF generated successfully!');
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF. Please try again.');
    }
  };
  
  

  // Submit lab for grading
  const submitLab = async () => {
    try {
      setIsSaving(true);
      
      // First save current state
      await saveToFirebase({
        sectionStatus,
        sectionContent,
        labMethod,
        procedureUnderstood,
        collectedGratings: Array.from(collectedGratings),
        observationData,
        analysisData,
        errorAnalysis,
        postLabAnswers,
        currentSection,
        labStarted
      });
      
      // Then submit for grading using modern pattern
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
      } else {
        throw new Error(result.data.error || 'Submission failed');
      }
    } catch (error) {
      console.error('❌ Lab submission error:', error);
      toast.error(`Failed to submit lab: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };
  
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Insert symbol into calculation work
  const insertSymbol = (symbol) => {
    const textarea = calculationTextareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = analysisData.calculationWork || '';
    
    const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);
    updateAnalysisData('calculationWork', newValue);
    
    // Set cursor position after inserted symbol
    setTimeout(() => {
      if (symbol.includes('{}')) {
        // For symbols with {}, place cursor inside the braces
        const bracePosition = start + symbol.indexOf('{}') + 1;
        textarea.setSelectionRange(bracePosition, bracePosition);
      } else {
        const newPosition = start + symbol.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
      textarea.focus();
    }, 0);
  };
  
  // Scroll to section
  const scrollToSection = (sectionName) => {
    setCurrentSection(sectionName);
    const element = document.getElementById(`section-${sectionName}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  // Get section status color
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
  
  // Update hypothesis (now stored in sectionContent)
  const updateHypothesis = (value) => {
    const newSectionContent = { ...sectionContent, hypothesis: value };
    setSectionContent(newSectionContent);
    
    // Check if hypothesis contains if, then, because, and a period
    const lowerValue = value.toLowerCase();
    const hasAllKeywords = lowerValue.includes('if') && 
                          lowerValue.includes('then') && 
                          lowerValue.includes('because') && 
                          value.includes('.');
    
    const newSectionStatus = {
      ...sectionStatus,
      introduction: hasAllKeywords ? 'completed' : value.trim() ? 'in-progress' : 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      sectionContent: newSectionContent,
      sectionStatus: newSectionStatus
    });
  };
  
  // Check if hypothesis is valid (for green styling)
  const isHypothesisValid = () => {
    const lowerValue = sectionContent.hypothesis.toLowerCase();
    return lowerValue.includes('if') && 
           lowerValue.includes('then') && 
           lowerValue.includes('because') && 
           sectionContent.hypothesis.includes('.');
  };
  
  
  // Update procedure understanding
  const updateProcedureUnderstood = (checked) => {
    setProcedureUnderstood(checked);
    
    const newSectionStatus = {
      ...sectionStatus,
      procedure: checked ? 'completed' : 'not-started'
    };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
    saveToFirebase({
      procedureUnderstood: checked,
      sectionStatus: newSectionStatus
    });
  };
  
  // Update observation data
  const updateObservationData = (grating, field, value) => {
    let newObservationData = {
      ...observationData,
      [grating]: {
        ...observationData[grating],
        [field]: value
      }
    };
    
    // Auto-calculate derived values
    if (field === 'linesPerMm' && value) {
      const d = 1 / (parseFloat(value) * 1000); // Convert to meters
      newObservationData[grating].d = d.toExponential(3);
    }
    
    if (field === 'spacing' && value) {
      const d = parseFloat(value) * 1e-9; // Convert nm to meters
      newObservationData[grating].d = d.toExponential(3);
    }
    
    if ((field === 'xRight' || field === 'xLeft')) {
      // Check if we have both values to calculate average
      const currentData = newObservationData[grating];
      const xRight = field === 'xRight' ? parseFloat(value) : parseFloat(currentData.xRight);
      const xLeft = field === 'xLeft' ? parseFloat(value) : parseFloat(currentData.xLeft);
      
      if (!isNaN(xRight) && !isNaN(xLeft)) {
        const xAverage = (Math.abs(xRight) + Math.abs(xLeft)) / 2;
        newObservationData[grating].xAverage = xAverage.toFixed(3);
      }
    }
    
    setObservationData(newObservationData);
    
    // Calculate completion status
    let totalFields = 0;
    let filledFields = 0;
    
    Object.values(newObservationData).forEach(gratingData => {
      totalFields += 5; // d, distance, xRight, xLeft, xAverage
      if (gratingData.d) filledFields++;
      if (gratingData.distance) filledFields++;
      if (gratingData.xRight) filledFields++;
      if (gratingData.xLeft) filledFields++;
      if (gratingData.xAverage) filledFields++;
    });
    
    const percentage = (filledFields / totalFields) * 100;
    const observationStatus = percentage === 0 ? 'not-started' : 
                            percentage === 100 ? 'completed' : 'in-progress';
    
    const newSectionStatus = { ...sectionStatus, observations: observationStatus };
    setSectionStatus(newSectionStatus);
    
    // Save to Firebase immediately
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
    
    // Check completion - requires all analysis fields, calculation work, method explanation, and error analysis
    const analysisFields = ['method', 'replicaWavelength', 'glassWavelength', 'cdWavelength', 'dvdWavelength', 'calculationWork', 'methodExplanation'];
    
    console.log('🔍 updateAnalysisData - Checking completion:', {
      field,
      value: value?.substring(0, 50) + (value?.length > 50 ? '...' : ''),
      newAnalysisData,
      errorAnalysis
    });
    
    const analysisComplete = analysisFields.every(fieldName => {
      const fieldValue = fieldName === field ? value : newAnalysisData[fieldName];
      const isComplete = fieldValue && fieldValue.trim() !== '';
      console.log(`  📝 Field "${fieldName}": "${fieldValue?.substring(0, 30)}..." -> ${isComplete ? '✅' : '❌'}`);
      return isComplete;
    });
    
    // Error analysis completion: mostAccurate selection + all 4 error calculations
    const errorFields = ['replicaError', 'glassError', 'cdError', 'dvdError'];
    const errorComplete = errorAnalysis.mostAccurate && 
                         errorFields.every(errorField => {
                           const value = errorAnalysis[errorField];
                           return value && value.trim() !== '';
                         });
    
    console.log('🎯 Analysis completion check:', {
      analysisComplete,
      errorComplete: {
        mostAccurate: !!errorAnalysis.mostAccurate,
        errorCalculations: errorFields.map(field => ({
          field,
          value: errorAnalysis[field],
          filled: !!(errorAnalysis[field] && errorAnalysis[field].trim() !== '')
        })),
        overall: errorComplete
      }
    });
    
    const allComplete = analysisComplete && errorComplete;
    
    // Calculate status
    let status = 'not-started';
    if (allComplete) {
      status = 'completed';
    } else {
      // Check if any fields are filled
      const anyFilled = analysisFields.some(fieldName => {
        const fieldValue = fieldName === field ? value : newAnalysisData[fieldName];
        return fieldValue && fieldValue.trim() !== '';
      }) || errorAnalysis.mostAccurate || errorFields.some(errorField => {
        const value = errorAnalysis[errorField];
        return value && value.trim() !== '';
      });
      
      if (anyFilled) {
        status = 'in-progress';
      }
    }
    
    console.log(`🚦 Analysis section status: ${status} (allComplete: ${allComplete})`);
    
    setSectionStatus(prev => ({ ...prev, analysis: status }));
    
    // Save to Firebase
    saveToFirebase({
      analysisData: newAnalysisData,
      sectionStatus: { ...sectionStatus, analysis: status }
    });
  };
  
  // Update error analysis (now part of analysis section)
  const updateErrorAnalysis = (field, value) => {
    const newErrorAnalysis = {
      ...errorAnalysis,
      [field]: value
    };
    
    setErrorAnalysis(newErrorAnalysis);
    
    console.log('🔍 updateErrorAnalysis - Checking completion:', {
      field,
      value,
      newErrorAnalysis,
      analysisData
    });
    
    // Check completion - requires all analysis fields, calculation work, method explanation, and error analysis
    const analysisFields = ['method', 'replicaWavelength', 'glassWavelength', 'cdWavelength', 'dvdWavelength', 'calculationWork', 'methodExplanation'];
    const analysisComplete = analysisFields.every(fieldName => {
      const fieldValue = analysisData[fieldName];
      const isComplete = fieldValue && fieldValue.trim() !== '';
      console.log(`  📝 Analysis Field "${fieldName}": "${fieldValue?.substring(0, 30)}..." -> ${isComplete ? '✅' : '❌'}`);
      return isComplete;
    });
    
    // Error analysis completion: mostAccurate selection + all 4 error calculations
    const errorFields = ['replicaError', 'glassError', 'cdError', 'dvdError'];
    const errorComplete = newErrorAnalysis.mostAccurate && 
                         errorFields.every(errorField => {
                           const value = newErrorAnalysis[errorField];
                           return value && value.trim() !== '';
                         });
    
    console.log('🎯 Error analysis completion check:', {
      analysisComplete,
      errorComplete: {
        mostAccurate: !!newErrorAnalysis.mostAccurate,
        errorCalculations: errorFields.map(field => ({
          field,
          value: newErrorAnalysis[field],
          filled: !!(newErrorAnalysis[field] && newErrorAnalysis[field].trim() !== '')
        })),
        overall: errorComplete
      }
    });
    
    const allComplete = analysisComplete && errorComplete;
    
    // Calculate status
    let status = 'not-started';
    if (allComplete) {
      status = 'completed';
    } else {
      // Check if any fields are filled
      const anyAnalysisFilled = analysisFields.some(fieldName => {
        const fieldValue = analysisData[fieldName];
        return fieldValue && fieldValue.trim() !== '';
      });
      const anyErrorFilled = newErrorAnalysis.mostAccurate || errorFields.some(errorField => {
        const value = newErrorAnalysis[errorField];
        return value && value.trim() !== '';
      });
      
      if (anyAnalysisFilled || anyErrorFilled) {
        status = 'in-progress';
      }
    }
    
    console.log(`🚦 Error Analysis section status: ${status} (allComplete: ${allComplete})`);
    
    setSectionStatus(prev => ({ ...prev, analysis: status }));
    
    // Save to Firebase
    saveToFirebase({
      errorAnalysis: newErrorAnalysis,
      sectionStatus: { ...sectionStatus, analysis: status }
    });
  };
  
  // Update post-lab answers
  const updatePostLabAnswer = (question, value) => {
    setPostLabAnswers(prev => ({
      ...prev,
      [question]: value
    }));
    
    setSectionStatus(prev => ({
      ...prev,
      postlab: value.trim().length > 50 ? 'completed' : value.trim() ? 'in-progress' : 'not-started'
    }));
  };
  
  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lab data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div id="lab-content" className={`space-y-6 relative ${isSubmitted && !isStaffView ? 'lab-input-disabled' : ''}`}>
      {/* Lab Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800">Lab 3 - Laser Wavelength</h1>
        {isSubmitted && !isStaffView && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Lab Submitted - Read Only
          </div>
        )}
      </div>
      
      {/* Lab Progress Header */}
      <div className="sticky top-14 z-10 bg-gray-50 border border-gray-200 rounded-lg p-2 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">Lab Progress</h3>
          
          <div className="flex items-center gap-2">
            {/* Navigation Buttons */}
            <div className="flex gap-1 flex-wrap">
              {[
                { key: 'introduction', label: 'Introduction' },
                { key: 'equipment', label: 'Equipment' },
                { key: 'procedure', label: 'Procedure' },
                { key: 'simulation', label: 'Simulation' },
                { key: 'observations', label: 'Observations' },
                { key: 'analysis', label: 'Analysis' },
                { key: 'postlab', label: 'Post-Lab' }
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => scrollToSection(section.key)}
                  className={`px-3 py-1 text-xs font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
                    sectionStatus[section.key] === 'completed'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : sectionStatus[section.key] === 'in-progress'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                      : currentSection === section.key 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>{section.label}</span>
                  {sectionStatus[section.key] === 'completed' && <span className="text-green-600">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Status Indicators - Hide when submitted */}
      {autoSaveEnabled && !isSubmitted && (
        <div className="fixed top-4 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
          {isSaving && (
            <div className="flex items-center text-blue-600 mb-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Saving...
            </div>
          )}
          {autoSaveEnabled && currentUser && hasSavedProgress && !isSaving && (
            <div className="flex items-center text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Auto-save enabled
            </div>
          )}
        </div>
      )}
      
      {/* Print PDF Button */}
      <div className="flex justify-end mb-6">
        <button 
          onClick={handlePrintPDF}
          className="print-button px-4 py-2 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200"
        >
          Print PDF
        </button>
      </div>
      
      
      
      {/* Introduction Section */}
      <div id="section-introduction" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.introduction)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Introduction and Hypothesis</span>
          {getStatusIcon(sectionStatus.introduction)}
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Lab Objective</h3>
            <p className="text-blue-700">
              The purpose of this lab is to measure the wavelength of a commercially available laser using several 
              different forms of gratings.
            </p>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-semibold mb-2">⚠️ LASER SAFETY WARNING:</p>
            <ul className="list-disc list-inside text-red-700 space-y-1">
              <li>Consider any exposure (direct or indirect) of the laser to your eye as dangerous</li>
              <li>Never look directly into the laser beam or its reflections</li>
              <li>Always wear appropriate eye protection when available</li>
              <li>Be aware of reflective surfaces that could redirect the beam</li>
            </ul>
          </div>
          
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Write your hypothesis about the expected wavelength measurement:
            </label>
            <textarea
              value={sectionContent.hypothesis}
              onChange={(e) => updateHypothesis(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                isHypothesisValid() 
                  ? 'bg-green-100 border-green-400' 
                  : 'border-gray-300'
              }`}
              rows="4"
              placeholder="If I use diffraction gratings to measure the laser wavelength, then..., because..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Include 'if', 'then', 'because', and end with a period (.) in your hypothesis. Most lasers used will be red. If your laser is missing its label, assume the accepted wavelength is 700nm.
            </p>
          </div>
        </div>
      </div>
      
      {/* Equipment Section */}
      <div id="section-equipment" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.equipment)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Equipment</span>
          {getStatusIcon(sectionStatus.equipment)}
        </h2>
        
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Safety Reminders:</h3>
            <p className="text-red-700">
              Consider any exposure (direct or indirect) of the laser to your eye as dangerous.
              Most lasers used will be red. If you are using the simulation, the expected
              accepted wavelength is 650nm.
            </p>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Wavelength Information:</h3>
            <p className="text-blue-700">
              Note the wavelength listed on your laser. If missing, assume 700nm for red lasers.
            </p>
          </div>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Grating Information:</h3>
            <div className="text-amber-700 space-y-2">
              <p>
                Gratings will always have information printed on them about lines/mm. Make sure you take note of these values while performing your lab.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>CDs have a spacing of 1600nm between their grooves</li>
                <li>DVDs have a spacing of 740nm between their grooves</li>
                <li>Avoid touching the surfaces of gratings, especially glass diffraction gratings</li>
                <li>Oil from fingers can reduce grating effectiveness</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Lab Method:</h3>
            <p className="text-gray-700 mb-3">
              Please indicate how you will be completing this lab:
            </p>
            <div className="space-y-2">
              <label className="flex items-center space-x-3 text-gray-700">
                <input
                  type="radio"
                  name="labMethod"
                  value="simulation"
                  checked={labMethod === 'simulation'}
                  onChange={(e) => {
                    setLabMethod(e.target.value);
                    const newSectionStatus = {
                      ...sectionStatus,
                      equipment: 'completed'
                    };
                    setSectionStatus(newSectionStatus);
                    
                    // Save to Firebase immediately
                    saveToFirebase({
                      labMethod: e.target.value,
                      sectionStatus: newSectionStatus
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>I will be using the simulation</span>
              </label>
              <label className="flex items-center space-x-3 text-gray-700">
                <input
                  type="radio"
                  name="labMethod"
                  value="real"
                  checked={labMethod === 'real'}
                  onChange={(e) => {
                    setLabMethod(e.target.value);
                    const newSectionStatus = {
                      ...sectionStatus,
                      equipment: 'completed'
                    };
                    setSectionStatus(newSectionStatus);
                    
                    // Save to Firebase immediately
                    saveToFirebase({
                      labMethod: e.target.value,
                      sectionStatus: newSectionStatus
                    });
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span>I will be using real equipment</span>
              </label>
            </div>
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
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">Important Distinction:</h3>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li><strong>For gratings (replica and glass):</strong> Make sure your laser passes through the grating</li>
              <li><strong>For CDs and DVDs:</strong> The laser must bounce off the surface</li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-2">General Steps:</h3>
            <ol className="list-decimal list-inside text-gray-700 space-y-2">
              <li>Set up the laser at a fixed distance from the screen (measure and record this distance)</li>
              <li>Position the grating/disc between the laser and screen</li>
              <li>Observe the diffraction pattern on the screen</li>
              <li>Measure the positions of the first-order maxima (both left and right of center)</li>
              <li>Record all measurements carefully</li>
              <li>Repeat for each type of grating/disc</li>
            </ol>
          </div>
        </div>
        
        {/* Procedure Confirmation */}
        <div className="bg-blue-50 p-4 rounded-lg mt-4">
          <label className="flex items-start space-x-3 text-gray-700">
            <input
              type="checkbox"
              checked={procedureUnderstood}
              onChange={(e) => updateProcedureUnderstood(e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
            />
            <span className="font-semibold">I have read and understand the procedure for this lab.</span>
          </label>
        </div>
      </div>
      
      {/* Simulation Section */}
      <div id="section-simulation" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.simulation)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Simulation</span>
          {getStatusIcon(sectionStatus.simulation)}
        </h2>
        <DiffractionSimulation 
          onDataCollected={(grating, data) => {
            // Handle data collection from simulation - update all fields at once
            let newObservationData = {
              ...observationData,
              [grating]: {
                ...observationData[grating],
                ...data // Apply all data fields at once
              }
            };
            
            // Auto-calculate derived values
            const currentData = newObservationData[grating];
            
            // Calculate xAverage if we have both xRight and xLeft
            if (currentData.xRight && currentData.xLeft) {
              const xRight = parseFloat(currentData.xRight);
              const xLeft = parseFloat(currentData.xLeft);
              if (!isNaN(xRight) && !isNaN(xLeft)) {
                const xAverage = (Math.abs(xRight) + Math.abs(xLeft)) / 2;
                newObservationData[grating].xAverage = xAverage.toFixed(3);
              }
            }
            
            setObservationData(newObservationData);
            
            // Add this grating to collected set
            setCollectedGratings(prev => {
              const newSet = new Set(prev);
              newSet.add(grating);
              
              // Update simulation status based on collected gratings
              const allGratings = ['replica', 'glass', 'cd', 'dvd'];
              const allCollected = allGratings.every(g => newSet.has(g));
              
              const newSectionStatus = { 
                ...sectionStatus, 
                simulation: newSet.size === 0 ? 'not-started' : 
                           allCollected ? 'completed' : 'in-progress'
              };
              
              setSectionStatus(newSectionStatus);
              
              // Calculate observation completion status
              let totalFields = 0;
              let filledFields = 0;
              
              Object.values(newObservationData).forEach(gratingData => {
                totalFields += 5; // d, distance, xRight, xLeft, xAverage
                if (gratingData.d) filledFields++;
                if (gratingData.distance) filledFields++;
                if (gratingData.xRight) filledFields++;
                if (gratingData.xLeft) filledFields++;
                if (gratingData.xAverage) filledFields++;
              });
              
              const percentage = (filledFields / totalFields) * 100;
              const observationStatus = percentage === 0 ? 'not-started' : 
                                      percentage === 100 ? 'completed' : 'in-progress';
              
              const finalSectionStatus = { ...newSectionStatus, observations: observationStatus };
              setSectionStatus(finalSectionStatus);
              
              // Save to Firebase once with all updates
              saveToFirebase({
                observationData: newObservationData,
                sectionStatus: finalSectionStatus,
                collectedGratings: Array.from(newSet)
              });
              
              return newSet;
            });
          }}
        />
      </div>
      
      {/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.observations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Observations</span>
          {getStatusIcon(sectionStatus.observations)}
        </h2>
        
        {/* Grating Specifications */}
        <div className="mb-6">
          <h3 className="font-semibold text-gray-800 mb-3">Grating Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 mb-1">Replica diffraction grating spacing (lines/mm):</label>
              <input
                type="number"
                value="300"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Glass diffraction grating spacing (lines/mm):</label>
              <input
                type="number"
                value="600"
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-700"
              />
            </div>
          </div>
        </div>
        
        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-2 text-left">Diffraction Grating Used</th>
                <th className="border border-gray-300 px-4 py-2 text-left">d (nm)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">l (m)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">|x<sub>right</sub>| (m)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">|x<sub>left</sub>| (m)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">|x<sub>ave</sub>| (m)</th>
              </tr>
            </thead>
            <tbody>
              {['replica', 'glass', 'cd', 'dvd'].map(grating => (
                <tr key={grating}>
                  <td className="border border-gray-300 px-4 py-2 font-medium capitalize">
                    <div className="flex items-center gap-2">
                      <span>
                        {grating === 'replica' ? 'Replica Grating' :
                         grating === 'glass' ? 'Glass Grating' :
                         grating.toUpperCase()}
                      </span>
                      {(grating === 'cd' || grating === 'dvd') && (
                        <div className="relative group">
                          <Info className="w-4 h-4 text-blue-500 cursor-help" />
                          <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                            See grating spacing in Equipment section above
                            <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-800"></div>
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      step="1"
                      value={observationData[grating].d}
                      onChange={(e) => updateObservationData(grating, 'd', e.target.value)}
                      className={`w-full px-2 py-1 border rounded ${
                        (() => {
                          const correctValues = { replica: '3333', glass: '1667', cd: '1600', dvd: '740' };
                          return observationData[grating].d === correctValues[grating]
                            ? 'border-green-400 bg-green-100'
                            : 'border-gray-300';
                        })()
                      }`}
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={observationData[grating].distance ? parseFloat(observationData[grating].distance).toFixed(2) : ''}
                      readOnly
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={observationData[grating].xRight ? parseFloat(observationData[grating].xRight).toFixed(2) : ''}
                      readOnly
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="text"
                      value={observationData[grating].xLeft ? Math.abs(parseFloat(observationData[grating].xLeft)).toFixed(2) : ''}
                      readOnly
                      className="w-full px-2 py-1 border border-gray-300 rounded bg-gray-50 text-gray-700"
                    />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <input
                      type="number"
                      step="0.01"
                      value={observationData[grating].xAverage}
                      onChange={(e) => updateObservationData(grating, 'xAverage', e.target.value)}
                      className={`w-full px-2 py-1 border rounded ${
                        (() => {
                          if (!observationData[grating].xRight || !observationData[grating].xLeft || !observationData[grating].xAverage) return 'border-gray-300';
                          
                          // Calculate expected average using the ROUNDED values displayed in the table
                          const xRightRounded = parseFloat(parseFloat(observationData[grating].xRight).toFixed(2));
                          const xLeftRounded = parseFloat(Math.abs(parseFloat(observationData[grating].xLeft)).toFixed(2));
                          const expected = (xRightRounded + xLeftRounded) / 2;
                          
                          const actual = parseFloat(observationData[grating].xAverage);
                          return Math.abs(actual - expected) < 0.001 ? 'border-green-400 bg-green-100' : 'border-gray-300';
                        })()
                      }`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Calculate and enter the spacing 'd' values in nanometers from the grating specifications above.
            Use the simulation to collect distance (l) and position data (x<sub>right</sub>, x<sub>left</sub>).
          </p>
          <div className="mt-2 space-y-1 text-sm text-blue-800">
           
            <div>For diffraction gratings: d = 10<sup>6</sup>/(lines per mm) nm</div>
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
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Method Selection</h3>
            <p className="text-gray-700 mb-3">
              You will first need to determine which method (small angle approximation or sine theta method) is 
              appropriate based on your observations. Then calculate the wavelength. There is no linear regression in 
              this lab analysis.
            </p>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="method"
                  value="small-angle"
                  checked={analysisData.method === 'small-angle'}
                  onChange={(e) => updateAnalysisData('method', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Small Angle Approximation (<InlineMath math={"\\sin \\theta \\approx \\tan \\theta \\approx \\theta"} />)</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="method"
                  value="sine-theta"
                  checked={analysisData.method === 'sine-theta'}
                  onChange={(e) => updateAnalysisData('method', e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                <span>Sine Theta Method (<InlineMath math={"\\lambda = d \\sin \\theta"} />)</span>
              </label>
            </div>
            
            {analysisData.method && (
              <div className="mt-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Explain why you selected this method for your analysis:
                </label>
                <textarea
                  value={analysisData.methodExplanation || ''}
                  onChange={(e) => updateAnalysisData('methodExplanation', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  placeholder="Explain your reasoning for choosing this method based on your data and observations..."
                />
              </div>
            )}
          </div>
          
          <div>
            <h3 className="font-semibold text-gray-800 mb-3">Calculated Wavelengths</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-700 mb-1">Replica Grating Wavelength (nm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={analysisData.replicaWavelength}
                  onChange={(e) => updateAnalysisData('replicaWavelength', e.target.value)}
                  className={`w-full px-3 py-2 border rounded ${
                    (() => {
                      // Calculate expected wavelength from student's observation data
                      const d = parseFloat(observationData.replica.d) * 1e-9; // Convert nm to m
                      const l = parseFloat(observationData.replica.distance);
                      const xAve = parseFloat(observationData.replica.xAverage);
                      const studentWavelength = parseFloat(analysisData.replicaWavelength) * 1e-9; // Convert nm to m
                      
                      if (!d || !l || !xAve || !studentWavelength) return 'border-gray-300';
                      
                      let expectedWavelength;
                      if (analysisData.method === 'small-angle') {
                        // Small angle: λ = (d × x_ave) / l
                        expectedWavelength = (d * xAve) / l;
                      } else if (analysisData.method === 'sine-theta') {
                        // Sine theta: λ = d × sin(θ), where sin(θ) = x_ave / √(x_ave² + l²)
                        const sinTheta = xAve / Math.sqrt(xAve * xAve + l * l);
                        expectedWavelength = d * sinTheta;
                      } else {
                        return 'border-gray-300';
                      }
                      
                      // Check if student's answer is within 5% of expected
                      const tolerance = 0.05;
                      return Math.abs(studentWavelength - expectedWavelength) / expectedWavelength < tolerance 
                        ? 'border-green-400 bg-green-100' 
                        : 'border-gray-300';
                    })()
                  }`}
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">Glass Grating Wavelength (nm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={analysisData.glassWavelength}
                  onChange={(e) => updateAnalysisData('glassWavelength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">CD Wavelength (nm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={analysisData.cdWavelength}
                  onChange={(e) => updateAnalysisData('cdWavelength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-gray-700 mb-1">DVD Wavelength (nm):</label>
                <input
                  type="number"
                  step="0.1"
                  value={analysisData.dvdWavelength}
                  onChange={(e) => updateAnalysisData('dvdWavelength', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                />
              </div>
            </div>
          </div>
          
          {/* Calculation Work Editor */}
          <div className="mt-6">
            <h4 className="font-semibold text-gray-800 mb-3">Show Your Calculation Work:</h4>
            <p className="text-sm text-gray-600 mb-3">
              Use the rich text editor below to show your calculation for one of your wavelength results. You can use the formula button (<InlineMath math="f_x" />) in the toolbar to add mathematical expressions.
            </p>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <SimpleQuillEditor
                courseId="2"
                unitId="20-lab-laser-wavelength"
                itemId="calculation-work"
                initialContent={analysisData.calculationWork || ''}
                onSave={(content) => updateAnalysisData('calculationWork', content)}
                onContentChange={(content) => updateAnalysisData('calculationWork', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
              />
            </div>
          </div>
          
          {/* Error Analysis */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-3">Error Analysis</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Which grating produced the most accurate result?
                </label>
                <select
                  value={errorAnalysis.mostAccurate}
                  onChange={(e) => updateErrorAnalysis('mostAccurate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select grating...</option>
                  <option value="replica">Replica Grating</option>
                  <option value="glass">Glass Grating</option>
                  <option value="cd">CD</option>
                  <option value="dvd">DVD</option>
                </select>
              </div>
              
              {/* Percent Error Calculations */}
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Percent Error Calculations</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { key: 'replica', label: 'Replica Grating', wavelength: analysisData.replicaWavelength, errorField: 'replicaError' },
                    { key: 'glass', label: 'Glass Grating', wavelength: analysisData.glassWavelength, errorField: 'glassError' },
                    { key: 'cd', label: 'CD', wavelength: analysisData.cdWavelength, errorField: 'cdError' },
                    { key: 'dvd', label: 'DVD', wavelength: analysisData.dvdWavelength, errorField: 'dvdError' }
                  ].map(grating => {
                    const observed = parseFloat(grating.wavelength);
                    const expected = 650;
                    const correctPercentError = observed ? Math.abs((observed - expected) / expected * 100) : null;
                    const studentPercentError = parseFloat(errorAnalysis[grating.errorField]);
                    
                    const isCorrect = correctPercentError !== null && studentPercentError && 
                                    Math.abs(studentPercentError - correctPercentError) < 0.1;
                    
                    return (
                      <div key={grating.key} className="bg-white p-3 rounded border border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-2">{grating.label}</div>
                        {observed ? (
                          <div className="space-y-2">
                            <div className="text-xs text-gray-600">
                              Observed: {observed} nm | Expected: 650 nm
                            </div>
                            <div className="flex items-center space-x-2">
                              <label className="text-sm text-gray-700">% Error:</label>
                              <input
                                type="number"
                                step="0.1"
                                value={errorAnalysis[grating.errorField] || ''}
                                onChange={(e) => updateErrorAnalysis(grating.errorField, e.target.value)}
                                className={`w-20 px-2 py-1 text-sm border rounded ${
                                  isCorrect ? 'border-green-400 bg-green-100' : 'border-gray-300'
                                }`}
                              />
                              <span className="text-sm text-gray-600">%</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500 italic">Enter wavelength to calculate % error</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      
      {/* Post-Lab Questions Section */}
      <div id="section-postlab" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.postlab)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Post-Lab Questions</span>
          {getStatusIcon(sectionStatus.postlab)}
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Before CDs people mostly listened to music recorded on LP records. Explain if you would be able to 
              perform this lab with an LP instead of a CD.
            </label>
            <textarea
              value={postLabAnswers.lpQuestion}
              onChange={(e) => updatePostLabAnswer('lpQuestion', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="6"
              placeholder="Consider the groove spacing, surface properties, and how LP records differ from CDs..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Hint: Think about the physical structure of LP records compared to CDs and what properties are needed for diffraction.
            </p>
          </div>
        </div>
      </div>
      
      {/* Submit Lab Section */}
      {!isSubmitted && (
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
      
      {/* PostSubmissionOverlay */}
      <PostSubmissionOverlay
        isVisible={showSubmissionOverlay || isSubmitted}
        isStaffView={isStaffView}
        course={course}
        questionId={questionId}
        submissionData={{
          labTitle: 'Lab 3 - Laser Wavelength',
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

export default LabLaserWavelength;