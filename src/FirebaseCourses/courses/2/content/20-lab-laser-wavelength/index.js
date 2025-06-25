import React, { useState, useEffect, useRef } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import { sanitizeEmail } from '../../../../../utils/sanitizeEmail';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';

/**
 * Lab 20 - Laser Wavelength for Physics 30
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

const LabLaserWavelength = ({ courseId = '2' }) => {
  const { currentUser } = useAuth();
  
  // Track lab started state
  const [labStarted, setLabStarted] = useState(false);
  
  // Track if student has saved progress
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  
  // Track current section
  const [currentSection, setCurrentSection] = useState('hypothesis');
  
  // Track completion status for each section
  const [sectionStatus, setSectionStatus] = useState({
    hypothesis: 'not-started',
    equipment: 'not-started',
    procedure: 'not-started',
    simulation: 'not-started',
    observations: 'not-started',
    analysis: 'not-started',
    error: 'not-started',
    postlab: 'not-started'
  });
  
  // Track hypothesis
  const [hypothesis, setHypothesis] = useState('');
  
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
  
  // Track notifications
  const [notification, setNotification] = useState({ message: '', type: '', visible: false });
  
  // Track saving/loading state
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  
  // Reference for calculation work textarea
  const calculationTextareaRef = useRef(null);
  
  // Calculate completion counts
  const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
  const totalSections = Object.keys(sectionStatus).length;
  
  // Helper function to start the lab
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('hypothesis');
  };
  
  // Save lab progress to cloud function
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
      const saveFunction = httpsCallable(functions, 'course2_lab_laser_wavelength');
      
      const studentKey = sanitizeEmail(currentUser.email);
      
      // Prepare lab data for saving
      const labData = {
        sectionStatus,
        hypothesis,
        labMethod,
        procedureUnderstood,
        collectedGratings: Array.from(collectedGratings),
        observationData,
        analysisData,
        errorAnalysis,
        postLabAnswers,
        currentSection,
        labStarted,
        timestamp: new Date().toISOString()
      };
      
      const result = await saveFunction({
        operation: 'save',
        studentKey: studentKey,
        courseId: courseId,
        assessmentId: 'lab_laser_wavelength',
        labData: labData,
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
  
  // Load lab progress from cloud function
  const loadLabProgress = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      
      const functions = getFunctions();
      const loadFunction = httpsCallable(functions, 'course2_lab_laser_wavelength');
      
      const studentKey = sanitizeEmail(currentUser.email);
      
      const result = await loadFunction({
        operation: 'load',
        studentKey: studentKey,
        courseId: courseId,
        assessmentId: 'lab_laser_wavelength',
        studentEmail: currentUser.email,
        userId: currentUser.uid
      });
      
      if (result.data.success && result.data.found) {
        const savedData = result.data.labData;
        
        // Restore saved state
        if (savedData.sectionStatus) setSectionStatus(savedData.sectionStatus);
        if (savedData.hypothesis !== undefined) setHypothesis(savedData.hypothesis);
        if (savedData.labMethod !== undefined) setLabMethod(savedData.labMethod);
        if (savedData.procedureUnderstood !== undefined) setProcedureUnderstood(savedData.procedureUnderstood);
        if (savedData.collectedGratings) setCollectedGratings(new Set(savedData.collectedGratings));
        if (savedData.observationData) setObservationData(savedData.observationData);
        if (savedData.analysisData) setAnalysisData(savedData.analysisData);
        if (savedData.errorAnalysis) setErrorAnalysis(savedData.errorAnalysis);
        if (savedData.postLabAnswers) setPostLabAnswers(savedData.postLabAnswers);
        if (savedData.currentSection) setCurrentSection(savedData.currentSection);
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);
        
        setHasSavedProgress(true);
        console.log('Lab progress loaded successfully');
      }
    } catch (error) {
      console.error('Error loading lab progress:', error);
      setNotification({ 
        message: 'Failed to load saved progress', 
        type: 'error', 
        visible: true 
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Helper function to save and end
  const saveAndEnd = async () => {
    const saved = await saveLabProgress(false);
    if (saved) {
      setLabStarted(false);
    }
  };
  
  // Show notification function
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, visible: false }));
    }, 3000);
  };
  
  // Load progress on component mount
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
  }, [autoSaveEnabled, currentUser, hasSavedProgress, sectionStatus, hypothesis, labMethod, procedureUnderstood, observationData, analysisData, errorAnalysis, postLabAnswers]);
  
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
  
  // Update hypothesis
  const updateHypothesis = (value) => {
    setHypothesis(value);
    
    // Check if hypothesis contains if, then, because, and a period
    const lowerValue = value.toLowerCase();
    const hasAllKeywords = lowerValue.includes('if') && 
                          lowerValue.includes('then') && 
                          lowerValue.includes('because') && 
                          value.includes('.');
    
    setSectionStatus(prev => ({
      ...prev,
      hypothesis: hasAllKeywords ? 'completed' : value.trim() ? 'in-progress' : 'not-started'
    }));
  };
  
  // Check if hypothesis is valid (for green styling)
  const isHypothesisValid = () => {
    const lowerValue = hypothesis.toLowerCase();
    return lowerValue.includes('if') && 
           lowerValue.includes('then') && 
           lowerValue.includes('because') && 
           hypothesis.includes('.');
  };
  
  
  // Update procedure understanding
  const updateProcedureUnderstood = (checked) => {
    setProcedureUnderstood(checked);
    setSectionStatus(prev => ({
      ...prev,
      procedure: checked ? 'completed' : 'not-started'
    }));
  };
  
  // Update observation data
  const updateObservationData = (grating, field, value) => {
    setObservationData(prev => ({
      ...prev,
      [grating]: {
        ...prev[grating],
        [field]: value
      }
    }));
    
    // Auto-calculate derived values
    if (field === 'linesPerMm' && value) {
      const d = 1 / (parseFloat(value) * 1000); // Convert to meters
      setObservationData(prev => ({
        ...prev,
        [grating]: {
          ...prev[grating],
          d: d.toExponential(3)
        }
      }));
    }
    
    if (field === 'spacing' && value) {
      const d = parseFloat(value) * 1e-9; // Convert nm to meters
      setObservationData(prev => ({
        ...prev,
        [grating]: {
          ...prev[grating],
          d: d.toExponential(3)
        }
      }));
    }
    
    if ((field === 'xRight' || field === 'xLeft')) {
      // Check if we have both values to calculate average
      const currentData = observationData[grating];
      const xRight = field === 'xRight' ? parseFloat(value) : parseFloat(currentData.xRight);
      const xLeft = field === 'xLeft' ? parseFloat(value) : parseFloat(currentData.xLeft);
      
      if (!isNaN(xRight) && !isNaN(xLeft)) {
        const xAverage = (Math.abs(xRight) + Math.abs(xLeft)) / 2;
        
        setObservationData(prev => ({
          ...prev,
          [grating]: {
            ...prev[grating],
            xAverage: xAverage.toFixed(3)
          }
        }));
      }
    }
    
    checkObservationCompletion();
  };
  
  // Check observation completion
  const checkObservationCompletion = () => {
    let totalFields = 0;
    let filledFields = 0;
    
    Object.values(observationData).forEach(grating => {
      totalFields += 5; // d, distance, xRight, xLeft, xAverage
      if (grating.d) filledFields++;
      if (grating.distance) filledFields++;
      if (grating.xRight) filledFields++;
      if (grating.xLeft) filledFields++;
      if (grating.xAverage) filledFields++;
    });
    
    const percentage = (filledFields / totalFields) * 100;
    
    if (percentage === 0) {
      setSectionStatus(prev => ({ ...prev, observations: 'not-started' }));
    } else if (percentage === 100) {
      setSectionStatus(prev => ({ ...prev, observations: 'completed' }));
    } else {
      setSectionStatus(prev => ({ ...prev, observations: 'in-progress' }));
    }
  };
  
  // Update analysis data
  const updateAnalysisData = (field, value) => {
    setAnalysisData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Check completion
    const fields = ['method', 'replicaWavelength', 'glassWavelength', 'cdWavelength', 'dvdWavelength'];
    const filledFields = fields.filter(fieldName => {
      const fieldValue = fieldName === field ? value : analysisData[fieldName];
      return fieldValue !== '';
    }).length;
    
    if (filledFields === 0) {
      setSectionStatus(prev => ({ ...prev, analysis: 'not-started' }));
    } else if (filledFields === fields.length) {
      setSectionStatus(prev => ({ ...prev, analysis: 'completed' }));
    } else {
      setSectionStatus(prev => ({ ...prev, analysis: 'in-progress' }));
    }
  };
  
  // Update error analysis
  const updateErrorAnalysis = (field, value) => {
    setErrorAnalysis(prev => ({
      ...prev,
      [field]: value
    }));
    
    const bothFilled = (field === 'mostAccurate' ? value : errorAnalysis.mostAccurate) &&
                      (field === 'explanation' ? value : errorAnalysis.explanation);
    
    setSectionStatus(prev => ({
      ...prev,
      error: bothFilled ? 'completed' : 'not-started'
    }));
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
  
  // Show start lab screen if lab hasn't started
  if (!labStarted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Lab 20 - Laser Wavelength</h1>
        
        {/* Introduction Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Objective</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The purpose of this lab is to measure the wavelength of a commercially available laser using several 
              different forms of gratings.
            </p>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <p className="text-red-800 font-semibold mb-2">⚠️ LASER SAFETY WARNING:</p>
              <ul className="list-disc list-inside text-red-700 space-y-1">
                <li>Consider any exposure (direct or indirect) of the laser to your eye as dangerous</li>
                <li>Never look directly into the laser beam or its reflections</li>
                <li>Always wear appropriate eye protection when available</li>
                <li>Be aware of reflective surfaces that could redirect the beam</li>
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
                : 'This lab uses diffraction gratings to determine laser wavelength. You can save your progress and return later if needed.'
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
                        {section === 'postlab' ? 'Post-Lab' : section}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {completedCount}/{totalSections} sections completed
                </p>
              </div>
            )}
            
            <button 
              onClick={startLab}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200"
            >
              {hasSavedProgress ? 'Continue Lab' : 'Start Lab'}
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Lab 20 - Laser Wavelength</h1>
          
          <div className="flex items-center gap-4">
            {/* Navigation Menu */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'hypothesis', label: 'Hypothesis' },
                { key: 'equipment', label: 'Equipment' },
                { key: 'procedure', label: 'Procedure' },
                { key: 'simulation', label: 'Simulation' },
                { key: 'observations', label: 'Observations' },
                { key: 'analysis', label: 'Analysis' },
                { key: 'error', label: 'Error' },
                { key: 'postlab', label: 'Post-Lab' }
              ].map(section => (
                <button
                  key={section.key}
                  onClick={() => scrollToSection(section.key)}
                  className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                    currentSection === section.key
                      ? 'bg-blue-100 text-blue-700'
                      : sectionStatus[section.key] === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span>{section.label}</span>
                  {sectionStatus[section.key] === 'completed' && <span className="text-green-600">✓</span>}
                </button>
              ))}
            </div>
            
            {/* Save Progress Button */}
            <button 
              onClick={() => saveLabProgress(false)}
              disabled={isSaving || !currentUser}
              className={`px-3 py-2 text-sm font-medium rounded border transition-all duration-200 mr-2 ${
                isSaving || !currentUser
                  ? 'bg-gray-400 border-gray-400 text-white cursor-not-allowed'
                  : 'bg-green-600 border-green-600 text-white hover:bg-green-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save Progress'}
            </button>
            
            {/* Save and End Button */}
            <button 
              onClick={saveAndEnd}
              disabled={isSaving || !currentUser}
              className={`px-4 py-2 font-medium rounded border transition-all duration-200 ${
                isSaving || !currentUser
                  ? 'bg-gray-400 border-gray-400 text-white cursor-not-allowed'
                  : 'bg-blue-600 border-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save and End'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Status Indicators */}
      {(isLoading || isSaving || autoSaveEnabled) && (
        <div className="fixed bottom-4 right-4 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-sm">
          {isLoading && (
            <div className="flex items-center text-blue-600 mb-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Loading progress...
            </div>
          )}
          {isSaving && (
            <div className="flex items-center text-yellow-600 mb-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600 mr-2"></div>
              Saving progress...
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
      
      {/* Hypothesis Section */}
      <div id="section-hypothesis" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.hypothesis)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Hypothesis</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            Make sure to note the wavelength listed on your laser.
          </p>
          <div>
            <label className="block text-gray-700 font-semibold mb-2">
              Write your hypothesis about the expected wavelength measurement:
            </label>
            <textarea
              value={hypothesis}
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
              Note: Most lasers used will be red. If your laser is missing its label, assume the accepted wavelength is 700nm.
            </p>
          </div>
        </div>
      </div>
      
      {/* Equipment Section */}
      <div id="section-equipment" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.equipment)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Equipment</h2>
        
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
                    setSectionStatus(prev => ({
                      ...prev,
                      equipment: 'completed'
                    }));
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
                    setSectionStatus(prev => ({
                      ...prev,
                      equipment: 'completed'
                    }));
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
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Procedure</h2>
        
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
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Simulation</h2>
        <DiffractionSimulation 
          onDataCollected={(grating, data) => {
            // Handle data collection from simulation
            Object.keys(data).forEach(field => {
              updateObservationData(grating, field, data[field]);
            });
            
            // Add this grating to collected set
            setCollectedGratings(prev => {
              const newSet = new Set(prev);
              newSet.add(grating);
              
              // Update simulation status based on collected gratings
              const allGratings = ['replica', 'glass', 'cd', 'dvd'];
              const allCollected = allGratings.every(g => newSet.has(g));
              
              setSectionStatus(prevStatus => ({ 
                ...prevStatus, 
                simulation: newSet.size === 0 ? 'not-started' : 
                           allCollected ? 'completed' : 'in-progress'
              }));
              
              return newSet;
            });
          }}
        />
      </div>
      
      {/* Observations Section */}
      <div id="section-observations" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.observations)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Observations</h2>
        
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
                    {grating === 'replica' ? 'Replica Grating' :
                     grating === 'glass' ? 'Glass Grating' :
                     grating.toUpperCase()}
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
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Analysis</h2>
        
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
              Use the rich text editor below to show your calculation for one of your wavelength results. You can use the formula button (∑) in the toolbar to add mathematical expressions.
            </p>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <SimpleQuillEditor
                courseId="2"
                unitId="20-lab-laser-wavelength"
                itemId="calculation-work"
                initialContent={analysisData.calculationWork || ''}
                onSave={(content) => updateAnalysisData('calculationWork', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Error Analysis Section */}
      <div id="section-error" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.error)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Error</h2>
        
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
            <h3 className="font-semibold text-gray-800 mb-3">Percent Error Calculations</h3>
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
      
      {/* Post-Lab Questions Section */}
      <div id="section-postlab" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(sectionStatus.postlab)}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700">Post-Lab Questions</h2>
        
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
    </div>
  );
};

export default LabLaserWavelength;