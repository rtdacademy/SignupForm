import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getDatabase, ref, set, get, update, onValue, serverTimestamp } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import LEDCircuitSimulation from './LEDCircuitSimulation';
import AxisSelection from './AxisSelection';
import InteractiveGraph from './InteractiveGraph';
import SlopeCalculation from './SlopeCalculation';
import PlancksConstantCalculation from './PlancksConstantCalculation';
import { toast } from 'sonner';
import { Save, FileText } from 'lucide-react';

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
  `;
  document.head.appendChild(styleElement);
}

const LabPlancksConstant = ({ courseId = "2", course, isStaffView = false }) => {
  const { currentUser } = useAuth();
  const database = getDatabase();
  
  // Get questionId from course assessment data
  const itemId = 'lab_plancks_constant';
  const questionId = course?.Gradebook?.courseConfig?.gradebook?.itemStructure?.[itemId]?.questions?.[0]?.questionId || 'course2_lab_plancks_constant';
  console.log('📋 Lab questionId:', questionId);
  
  // Create memoized database reference
  const labDataRef = React.useMemo(() => {
    return currentUser?.uid ? ref(database, `users/${currentUser.uid}/FirebaseCourses/${courseId}/${questionId}`) : null;
  }, [currentUser?.uid, database, courseId, questionId]);
  
  // Check if lab is submitted from course data
  const isSubmitted = course?.Assessments?.[questionId] !== undefined;
  
  // Define section order
  const SECTION_ORDER = ['hypothesis', 'observations', 'analysis', 'error'];
  
  // Section status tracking
  const [sectionStatus, setSectionStatus] = useState({
    hypothesis: 'not-started',
    observations: 'not-started', 
    analysis: 'not-started',
    error: 'not-started'
  });
  
  // Section content tracking
  const [sectionContent, setSectionContent] = useState({
    hypothesis: '',
    error: ''
  });
  
  // Lab-specific state
  const [observationData, setObservationData] = useState({
    measurements: [
      { color: 'Red', frequency: 4.54e14, voltage: null, measured: false },
      { color: 'Amber', frequency: 5.00e14, voltage: null, measured: false },
      { color: 'Yellow', frequency: 5.08e14, voltage: null, measured: false },
      { color: 'Green', frequency: 5.31e14, voltage: null, measured: false },
      { color: 'Blue', frequency: 6.38e14, voltage: null, measured: false }
    ],
    currentLED: 0,
    completedMeasurements: 0
  });
  
  const [analysisData, setAnalysisData] = useState({
    selectedXAxis: '',
    selectedYAxis: '',
    graphGenerated: false,
    slope: null,
    selectedPoints: [],
    studentCalculatedH: '',
    studentPercentError: ''
  });
  
  // UI state
  const [currentSection, setCurrentSection] = useState('hypothesis');
  const [labStarted, setLabStarted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);
  const [showSubmissionOverlay, setShowSubmissionOverlay] = useState(false);
  
  // Auto-save functionality
  useEffect(() => {
    if (currentUser?.uid && !isSubmitted && labStarted && hasSavedProgress) {
      const interval = setInterval(() => {
        saveToFirebase({
          sectionStatus,
          sectionContent,
          observationData,
          analysisData,
          currentSection,
          labStarted
        });
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [currentUser?.uid, sectionContent, observationData, analysisData, sectionStatus, isSubmitted, labStarted, hasSavedProgress]);
  
  // Load existing data on component mount
  useEffect(() => {
    if (!currentUser?.uid || !labDataRef) return;
    
    // If lab is submitted, use data from course.Assessments
    if (isSubmitted && course?.Assessments?.[questionId]) {
      console.log('📋 Lab is submitted, loading from course.Assessments');
      const submittedData = course.Assessments[questionId];
      
      // Restore saved state
      if (submittedData.sectionStatus) setSectionStatus(submittedData.sectionStatus);
      if (submittedData.sectionContent) setSectionContent(submittedData.sectionContent);
      if (submittedData.observationData) {
        setObservationData(prev => {
          // Merge measurements array carefully to preserve frequency data
          const mergedMeasurements = prev.measurements.map((defaultMeasurement, index) => {
            const savedMeasurement = submittedData.observationData.measurements?.[index];
            return savedMeasurement ? {
              ...defaultMeasurement,
              ...savedMeasurement,
              frequency: savedMeasurement.frequency || defaultMeasurement.frequency
            } : defaultMeasurement;
          });
          
          return {
            ...prev,
            ...submittedData.observationData,
            measurements: mergedMeasurements
          };
        });
      }
      if (submittedData.analysisData) {
        setAnalysisData(prev => ({
          ...prev,
          ...submittedData.analysisData
        }));
      }
      if (submittedData.currentSection) setCurrentSection(submittedData.currentSection);
      if (submittedData.labStarted !== undefined) setLabStarted(submittedData.labStarted);
      
      setLabStarted(true);
      setHasSavedProgress(true);
      return;
    }

    // For non-submitted labs, set up real-time listener
    const unsubscribe = onValue(labDataRef, (snapshot) => {
      const savedData = snapshot.val();
      
      if (savedData) {
        console.log('✅ Lab data loaded:', Object.keys(savedData));
        
        // Only update state if values have actually changed to prevent unnecessary re-renders
        setSectionStatus(prev => savedData.sectionStatus || prev);
        setSectionContent(prev => savedData.sectionContent || prev);
        
        if (savedData.observationData) {
          setObservationData(prev => {
            // Merge measurements array carefully to preserve frequency data
            const mergedMeasurements = prev.measurements.map((defaultMeasurement, index) => {
              const savedMeasurement = savedData.observationData.measurements?.[index];
              return savedMeasurement ? {
                ...defaultMeasurement,
                ...savedMeasurement,
                frequency: savedMeasurement.frequency || defaultMeasurement.frequency
              } : defaultMeasurement;
            });
            
            return {
              ...prev,
              ...savedData.observationData,
              measurements: mergedMeasurements
            };
          });
        }
        
        if (savedData.analysisData) {
          setAnalysisData(prev => ({
            ...prev,
            ...savedData.analysisData
          }));
        }
        
        // Only update current section if we don't have one set
        if (savedData.currentSection && !labStarted) {
          setCurrentSection(savedData.currentSection);
        }
        
        if (savedData.labStarted !== undefined) setLabStarted(savedData.labStarted);
        
        setHasSavedProgress(true);
      }
    });
    
    return () => unsubscribe();
  }, [currentUser?.uid, labDataRef, isSubmitted, course?.Assessments, questionId, labStarted]);
  
  // Update section completion status
  useEffect(() => {
    updateSectionStatus();
  }, [sectionContent, observationData, analysisData]);
  
  
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
        labId: 'lab-plancks-constant'
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
  
  const updateSectionStatus = () => {
    const newStatus = { ...sectionStatus };
    
    // Hypothesis section
    if (sectionContent.hypothesis && sectionContent.hypothesis.trim().length > 50) {
      newStatus.hypothesis = 'completed';
    } else if (sectionContent.hypothesis && sectionContent.hypothesis.trim().length > 0) {
      newStatus.hypothesis = 'in-progress';
    }
    
    // Observations section
    const completedMeasurements = observationData.measurements.filter(m => m.measured && m.voltage !== null).length;
    if (completedMeasurements === 5) {
      newStatus.observations = 'completed';
    } else if (completedMeasurements > 0) {
      newStatus.observations = 'in-progress';
    }
    
    // Analysis section
    if (analysisData.graphGenerated && analysisData.slope !== null && 
        analysisData.studentCalculatedH && analysisData.studentPercentError) {
      newStatus.analysis = 'completed';
    } else if (analysisData.selectedXAxis && analysisData.selectedYAxis) {
      newStatus.analysis = 'in-progress';
    }
    
    // Error section
    if (sectionContent.error && sectionContent.error.trim().length > 100) {
      newStatus.error = 'completed';
    } else if (sectionContent.error && sectionContent.error.trim().length > 0) {
      newStatus.error = 'in-progress';
    }
    
    setSectionStatus(newStatus);
  };
  
  const handleSectionContentChange = (section, content) => {
    const newSectionContent = {
      ...sectionContent,
      [section]: content
    };
    setSectionContent(newSectionContent);
    
    // Save to Firebase
    saveToFirebase({
      sectionContent: newSectionContent
    });
  };
  
  const handleLEDMeasurement = (voltage) => {
    const currentMeasurement = observationData.measurements[observationData.currentLED];
    
    const newObservationData = {
      ...observationData,
      measurements: observationData.measurements.map((m, i) => 
        i === observationData.currentLED 
          ? { ...m, voltage: voltage, measured: true }
          : m
      ),
      completedMeasurements: observationData.measurements.filter(m => m.measured).length + 1
    };
    
    setObservationData(newObservationData);
    
    // Save to Firebase
    saveToFirebase({
      observationData: newObservationData,
      sectionStatus: {
        ...sectionStatus,
        observations: newObservationData.completedMeasurements === 5 ? 'completed' : 'in-progress'
      }
    });
  };
  
  const selectNextLED = () => {
    setObservationData(prev => ({
      ...prev,
      currentLED: Math.min(prev.currentLED + 1, prev.measurements.length - 1)
    }));
  };
  
  const selectLED = (index) => {
    setObservationData(prev => ({
      ...prev,
      currentLED: index
    }));
  };
  
  const handleAxisSelection = (xAxis, yAxis) => {
    setAnalysisData(prev => ({
      ...prev,
      selectedXAxis: xAxis,
      selectedYAxis: yAxis,
      graphGenerated: true
    }));
  };
  
  const handleSlopeCalculation = (slope) => {
    setAnalysisData(prev => ({
      ...prev,
      slope: slope
    }));
  };
  
  const handleStudentCalculation = (hValue, percentError) => {
    setAnalysisData(prev => ({
      ...prev,
      studentCalculatedH: hValue,
      studentPercentError: percentError
    }));
  };
  
  const handleSubmission = async () => {
    try {
      setIsSaving(true);
      
      // Save current state
      await saveToFirebase({
        sectionStatus,
        sectionContent,
        observationData,
        analysisData,
        currentSection,
        labStarted
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
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };
  
  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return '✓';
      case 'in-progress': return '○';
      default: return '○';
    }
  };
  
  const canSubmit = () => {
    const completedSections = Object.values(sectionStatus).filter(status => status === 'completed').length;
    return completedSections >= 3; // Require at least 3 of 4 sections completed
  };
  
  // Start lab function
  const startLab = () => {
    setLabStarted(true);
    setCurrentSection('hypothesis');
    setSectionStatus(prev => ({
      ...prev,
      hypothesis: 'not-started'
    }));
    
    saveToFirebase({
      labStarted: true,
      currentSection: 'hypothesis',
      sectionStatus: {
        ...sectionStatus,
        hypothesis: 'not-started'
      }
    });
  };
  
  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'hypothesis':
        return (
          <div className="hypothesis-section">
            <h2 className="text-2xl font-semibold mb-4">Hypothesis</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Background Information</h3>
              <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
                <p className="text-sm text-blue-800 mb-2">
                  <strong>Objective:</strong> To determine the value of Planck's Constant using LED threshold voltages.
                </p>
                <p className="text-sm text-blue-800">
                  When voltage is applied to an LED, electrons cross between semiconductors and lose energy 
                  that converts directly into photons. By measuring the minimum voltage needed for each LED 
                  to emit light, we can indirectly measure Planck's constant.
                </p>
              </div>
              
              <h4 className="font-medium mb-2">Key Physics Concepts:</h4>
              <ul className="text-sm text-gray-700 space-y-1 mb-4">
                <li>• Einstein's photoelectric equation: E = hf</li>
                <li>• Energy of threshold voltage: E = eV</li>
                <li>• Therefore: eV = hf, which gives V = (h/e) × f</li>
                <li>• This predicts a linear relationship between voltage and frequency</li>
              </ul>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Write your hypothesis about the relationship between LED threshold voltage and light frequency:
              </label>
              <SimpleQuillEditor
                courseId={courseId}
                unitId="lab-plancks-constant"
                itemId="hypothesis"
                initialContent={sectionContent.hypothesis || ''}
                onSave={(content) => handleSectionContentChange('hypothesis', content)}
                onContentChange={(content) => handleSectionContentChange('hypothesis', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
              <p className="text-xs text-gray-600 mt-1">
                Minimum 50 words. Consider the physics relationship between photon energy, frequency, and voltage.
              </p>
            </div>
          </div>
        );
        
      case 'observations':
        return (
          <div className="observations-section">
            <h2 className="text-2xl font-semibold mb-4">Observations</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Equipment Setup</h3>
              <div className="bg-gray-50 border p-4 rounded mb-4">
                <ul className="text-sm space-y-1">
                  <li>• 5 different colored LEDs (Red, Amber, Yellow, Green, Blue)</li>
                  <li>• 6V Battery</li>
                  <li>• 1 kΩ potentiometer (variable resistor)</li>
                  <li>• 330 Ω resistor</li>
                  <li>• Voltmeter</li>
                  <li>• Connecting wires with alligator clips</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 p-3 rounded mb-4">
                <p className="text-yellow-800 text-sm">
                  <strong>⚠️ Safety:</strong> Do not stare directly at bright LEDs as it can harm your vision.
                </p>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">LED Selection</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {observationData.measurements && observationData.measurements.map((measurement, index) => (
                  <button
                    key={index}
                    onClick={() => selectLED(index)}
                    disabled={isSubmitted}
                    className={`px-3 py-2 rounded text-sm font-medium ${
                      observationData.currentLED === index
                        ? 'bg-blue-600 text-white'
                        : measurement.measured
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-700 border border-gray-300'
                    } ${isSubmitted ? 'cursor-not-allowed opacity-50' : 'hover:bg-blue-500 hover:text-white'}`}
                  >
                    {measurement.color} LED {measurement.measured ? '✓' : ''}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mb-6">
              <LEDCircuitSimulation
                selectedLED={observationData.measurements[observationData.currentLED]?.color.toLowerCase()}
                onVoltageChange={() => {}} // We only care about threshold detection
                onThresholdDetected={handleLEDMeasurement}
                isExperimentMode={!isSubmitted || isStaffView}
              />
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Data Table</h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border border-gray-300 px-4 py-2 text-left">LED Color</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Frequency (×10¹⁴ Hz)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Threshold Voltage (V)</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {observationData.measurements && observationData.measurements.map((measurement, index) => (
                      <tr key={index} className={observationData.currentLED === index ? 'bg-blue-50' : ''}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {measurement.color}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {measurement.frequency ? (measurement.frequency / 1e14).toFixed(2) : '—'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {measurement.voltage !== null ? measurement.voltage.toFixed(2) : '—'}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {measurement.measured ? (
                            <span className="text-green-600 font-medium">✓ Measured</span>
                          ) : (
                            <span className="text-gray-500">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 text-sm text-gray-600">
                <p>Progress: {observationData.completedMeasurements} of 5 measurements completed</p>
                {observationData.completedMeasurements < 5 && !isSubmitted && (
                  <p>Use the simulation above to measure the threshold voltage for each LED.</p>
                )}
              </div>
              
              {observationData.completedMeasurements > 0 && observationData.currentLED < 4 && (!isSubmitted || isStaffView) && (
                <button
                  onClick={selectNextLED}
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Next LED
                </button>
              )}
            </div>
          </div>
        );
        
      case 'analysis':
        return (
          <div className="analysis-section">
            <h2 className="text-2xl font-semibold mb-4">Analysis</h2>
            
            {observationData.completedMeasurements < 3 && (
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
                <p className="text-yellow-800">
                  Complete at least 3 LED measurements in the Observations section before proceeding with analysis.
                </p>
              </div>
            )}
            
            {observationData.completedMeasurements >= 3 && (
              <>
                <div className="mb-6">
                  <AxisSelection
                    onAxisChange={handleAxisSelection}
                    measurements={observationData.measurements}
                  />
                </div>
                
                {analysisData.graphGenerated && (
                  <>
                    <div className="mb-6">
                      <InteractiveGraph
                        measurements={observationData.measurements}
                        xAxis={analysisData.selectedXAxis}
                        yAxis={analysisData.selectedYAxis}
                        onPointClick={(point, index) => {
                          setAnalysisData(prev => ({
                            ...prev,
                            selectedPoints: prev.selectedPoints.includes(index)
                              ? prev.selectedPoints.filter(i => i !== index)
                              : [...prev.selectedPoints, index]
                          }));
                        }}
                      />
                    </div>
                    
                    <div className="mb-6">
                      <SlopeCalculation
                        measurements={observationData.measurements}
                        xAxis={analysisData.selectedXAxis}
                        yAxis={analysisData.selectedYAxis}
                        selectedPoints={analysisData.selectedPoints}
                        onSlopeCalculated={handleSlopeCalculation}
                      />
                    </div>
                    
                    {analysisData.slope && (
                      <div className="mb-6">
                        <PlancksConstantCalculation
                          slope={analysisData.slope}
                          xAxis={analysisData.selectedXAxis}
                          yAxis={analysisData.selectedYAxis}
                          onStudentCalculation={handleStudentCalculation}
                        />
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        );
        
      case 'error':
        return (
          <div className="error-section">
            <h2 className="text-2xl font-semibold mb-4">Error Analysis</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Results Summary</h3>
              {analysisData.studentCalculatedH && analysisData.studentPercentError ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded">
                  <p className="text-green-800">
                    <strong>Your experimental value:</strong> {parseFloat(analysisData.studentCalculatedH).toExponential(3)} J⋅s
                  </p>
                  <p className="text-green-800">
                    <strong>Theoretical value:</strong> 6.626 × 10⁻³⁴ J⋅s
                  </p>
                  <p className="text-green-800">
                    <strong>Your percent error:</strong> {analysisData.studentPercentError ? parseFloat(analysisData.studentPercentError).toFixed(1) : '0.0'}%
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded">
                  <p className="text-yellow-800">
                    Complete the analysis section to see your results here.
                  </p>
                </div>
              )}
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Potential Sources of Error</h3>
              <div className="bg-gray-50 border p-4 rounded mb-4">
                <ul className="text-sm space-y-2">
                  <li>• <strong>Measurement precision:</strong> Difficulty determining exact threshold voltage</li>
                  <li>• <strong>LED variations:</strong> Manufacturing differences between LEDs</li>
                  <li>• <strong>Temperature effects:</strong> LED characteristics change with temperature</li>
                  <li>• <strong>Instrument limitations:</strong> Voltmeter and potentiometer precision</li>
                  <li>• <strong>Human error:</strong> Subjective determination of "just begins to glow"</li>
                  <li>• <strong>Circuit resistance:</strong> Additional voltage drops in the circuit</li>
                </ul>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Analyze your experimental results and sources of error:
              </label>
              <SimpleQuillEditor
                courseId={courseId}
                unitId="lab-plancks-constant"
                itemId="error"
                initialContent={sectionContent.error || ''}
                onSave={(content) => handleSectionContentChange('error', content)}
                onContentChange={(content) => handleSectionContentChange('error', content)}
                onError={(error) => console.error('SimpleQuillEditor error:', error)}
                disabled={isSubmitted && !isStaffView}
              />
              <p className="text-xs text-gray-600 mt-1">
                Minimum 100 words. Discuss percent error, sources of uncertainty, and potential improvements.
              </p>
            </div>
          </div>
        );
        
      default:
        return <div>Section not found</div>;
    }
  };
  
  // Auto-start for staff view
  useEffect(() => {
    if (isStaffView && !labStarted) {
      setLabStarted(true);
      setCurrentSection('hypothesis');
      setSectionStatus(prev => ({
        ...prev,
        hypothesis: 'not-started'
      }));
    }
  }, [isStaffView, labStarted]);
  
  // If lab hasn't been started, show welcome screen
  if (!labStarted) {
    const completedCount = Object.values(sectionStatus).filter(status => status === 'completed').length;
    const totalSections = Object.keys(sectionStatus).length;

    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Lab 7 - Planck's Constant</h1>
            <p className="text-lg text-gray-600 mb-8">
              Determine Planck's constant using LED threshold voltages and the photoelectric effect
            </p>
          </div>
          
          {/* Lab Overview */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Lab Overview</h2>
            <div className="space-y-4 text-gray-700">
              <p>
                In this lab, you will determine the value of Planck's constant by measuring the threshold 
                voltages of different colored LEDs and applying Einstein's photoelectric equation.
              </p>
              <p>
                You'll use an interactive LED circuit simulation to measure threshold voltages, 
                plot the relationship between voltage and frequency, calculate the slope manually, 
                and determine Planck's constant from your results.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="font-medium text-blue-800">Objective:</p>
                <p className="text-blue-700">Determine Planck's constant using the photoelectric effect with LEDs</p>
              </div>
              
              <div className="grid md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800">Hypothesis</h3>
                  <p className="text-sm text-purple-600">Predict the voltage-frequency relationship</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800">Observations</h3>
                  <p className="text-sm text-green-600">Measure 5 LED threshold voltages</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800">Analysis</h3>
                  <p className="text-sm text-orange-600">Graph data and calculate Planck's constant</p>
                </div>
                <div className="text-center p-3 bg-red-50 rounded-lg">
                  <h3 className="font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-600">Analyze experimental uncertainty</p>
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
                  : 'This lab contains 4 sections with interactive simulations and calculations.'
                }
              </p>
              
              {/* Progress Summary for returning students */}
              {hasSavedProgress && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Your Progress:</h3>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SECTION_ORDER.map(section => (
                      <div key={section} className="flex items-center gap-1">
                        <span className={`text-xs ${
                          sectionStatus[section] === 'completed' ? 'text-green-600' : 
                          sectionStatus[section] === 'in-progress' ? 'text-yellow-600' : 
                          'text-gray-400'
                        }`}>
                          {sectionStatus[section] === 'completed' ? '✓' : 
                           sectionStatus[section] === 'in-progress' ? '◐' : '○'}
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
    <div className={`lab-plancks-constant max-w-6xl mx-auto p-6 ${isSubmitted && !isStaffView ? 'lab-input-disabled' : ''}`}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lab 7 - Planck's Constant</h1>
        <p className="text-gray-600">
          Determine Planck's constant using LED threshold voltages and the photoelectric effect
        </p>
        {isSubmitted && !isStaffView && (
          <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
            ✓ Lab Submitted - Read Only
          </div>
        )}
        {!isSubmitted && hasSavedProgress && (
          <div className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded mt-2 inline-flex">
            <Save size={12} />
            <span>Auto-saving</span>
          </div>
        )}
      </div>
      
      {/* Section Navigation */}
      <div className="section-navigation mb-6 sticky top-0 bg-white z-10 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {SECTION_ORDER.map(section => (
            <button
              key={section}
              onClick={() => {
                setCurrentSection(section);
                // Save current section to Firebase
                saveToFirebase({ currentSection: section });
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentSection === section
                  ? 'bg-blue-600 text-white'
                  : `${getStatusColor(sectionStatus[section])} hover:opacity-80`
              }`}
            >
              <span className="mr-2">{getStatusIcon(sectionStatus[section])}</span>
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </button>
          ))}
        </div>
        
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Progress: {Object.values(sectionStatus).filter(s => s === 'completed').length} of 4 sections completed
          </div>
          
          {canSubmit() && !isSubmitted && (
            <button
              onClick={handleSubmission}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
            >
              Submit Lab
            </button>
          )}
        </div>
      </div>
      
      {/* Section Content */}
      <div className="section-content">
        {renderCurrentSection()}
      </div>

      {/* PostSubmissionOverlay */}
      <PostSubmissionOverlay
        isVisible={showSubmissionOverlay || isSubmitted}
        isStaffView={isStaffView}
        course={course}
        questionId={questionId}
        submissionData={{
          labTitle: 'Plancks Constant Lab',
          completionPercentage: (Object.values(sectionStatus).filter(s => s === 'completed').length * 100) / Object.keys(sectionStatus).length,
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

export default LabPlancksConstant;