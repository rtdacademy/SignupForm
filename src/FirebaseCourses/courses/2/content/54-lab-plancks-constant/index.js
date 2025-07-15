import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, set, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';
import PostSubmissionOverlay from '../../../../components/PostSubmissionOverlay';
import LEDCircuitSimulation from './LEDCircuitSimulation';
import AxisSelection from './AxisSelection';
import InteractiveGraph from './InteractiveGraph';
import SlopeCalculation from './SlopeCalculation';
import PlancksConstantCalculation from './PlancksConstantCalculation';

const LabPlancksConstant = ({ courseId = "2", lessonId = "54-lab-plancks-constant", userId, userEmail, isStaff = false }) => {
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
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const autoSaveIntervalRef = useRef(null);
  
  // Firebase functions
  const functions = getFunctions();
  const submitLab = httpsCallable(functions, 'course2_lab_submit');
  
  // Auto-save functionality
  useEffect(() => {
    if (userId && !isSubmitted) {
      autoSaveIntervalRef.current = setInterval(handleAutoSave, 30000); // Auto-save every 30 seconds
      return () => {
        if (autoSaveIntervalRef.current) {
          clearInterval(autoSaveIntervalRef.current);
        }
      };
    }
  }, [userId, sectionContent, observationData, analysisData, sectionStatus, isSubmitted]);
  
  // Load existing data on component mount
  useEffect(() => {
    if (userId) {
      loadLabData();
    }
  }, [userId]);
  
  // Update section completion status
  useEffect(() => {
    updateSectionStatus();
  }, [sectionContent, observationData, analysisData]);
  
  const loadLabData = async () => {
    try {
      const db = getDatabase();
      const labRef = ref(db, `users/${userId}/FirebaseCourses/${courseId}/course2_lab_plancks_constant`);
      const snapshot = await get(labRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        if (data.sectionContent) setSectionContent(data.sectionContent);
        if (data.observationData) setObservationData(data.observationData);
        if (data.analysisData) setAnalysisData(data.analysisData);
        if (data.sectionStatus) setSectionStatus(data.sectionStatus);
        if (data.isSubmitted) setIsSubmitted(data.isSubmitted);
        if (data.lastSaved) setLastSaved(new Date(data.lastSaved));
        console.log('Lab data loaded successfully');
      }
    } catch (error) {
      console.error('Error loading lab data:', error);
    }
  };
  
  const handleAutoSave = async () => {
    if (!userId || isSubmitted) return;
    
    try {
      setIsSaving(true);
      const db = getDatabase();
      const labRef = ref(db, `users/${userId}/FirebaseCourses/${courseId}/course2_lab_plancks_constant`);
      
      const saveData = {
        sectionContent,
        observationData,
        analysisData,
        sectionStatus,
        isSubmitted,
        lastSaved: Date.now(),
        autoSave: true
      };
      
      await set(labRef, saveData);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };
  
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
    setSectionContent(prev => ({
      ...prev,
      [section]: content
    }));
  };
  
  const handleLEDMeasurement = (voltage) => {
    const currentMeasurement = observationData.measurements[observationData.currentLED];
    
    setObservationData(prev => {
      const newMeasurements = [...prev.measurements];
      newMeasurements[prev.currentLED] = {
        ...currentMeasurement,
        voltage: voltage,
        measured: true
      };
      
      return {
        ...prev,
        measurements: newMeasurements,
        completedMeasurements: newMeasurements.filter(m => m.measured).length
      };
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
    if (isSubmitted) return;
    
    try {
      const labData = {
        sectionContent,
        observationData,
        analysisData,
        sectionStatus,
        submittedAt: Date.now()
      };
      
      const result = await submitLab({
        courseId,
        questionId: 'course2_lab_plancks_constant',
        studentEmail: userEmail,
        userId,
        isStaff
      });
      
      if (result.data.success) {
        setIsSubmitted(true);
        console.log('Lab submitted successfully');
      }
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Submission failed. Please try again.');
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
                value={sectionContent.hypothesis}
                onChange={(content) => handleSectionContentChange('hypothesis', content)}
                placeholder="Based on Einstein's photoelectric equation, I predict that..."
                className={isSubmitted ? 'lab-input-disabled' : ''}
                readOnly={isSubmitted}
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
                {observationData.measurements.map((measurement, index) => (
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
                isExperimentMode={!isSubmitted}
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
                    {observationData.measurements.map((measurement, index) => (
                      <tr key={index} className={observationData.currentLED === index ? 'bg-blue-50' : ''}>
                        <td className="border border-gray-300 px-4 py-2 font-medium">
                          {measurement.color}
                        </td>
                        <td className="border border-gray-300 px-4 py-2">
                          {(measurement.frequency / 1e14).toFixed(2)}
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
              
              {observationData.completedMeasurements > 0 && observationData.currentLED < 4 && !isSubmitted && (
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
                    <strong>Your percent error:</strong> {parseFloat(analysisData.studentPercentError).toFixed(1)}%
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
                value={sectionContent.error}
                onChange={(content) => handleSectionContentChange('error', content)}
                placeholder="Discuss the accuracy of your results, major sources of error, and how the experiment could be improved..."
                className={isSubmitted ? 'lab-input-disabled' : ''}
                readOnly={isSubmitted}
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
  
  if (isSubmitted) {
    return (
      <PostSubmissionOverlay
        title="Lab 7 - Planck's Constant"
        message="Your lab has been submitted successfully!"
        submissionTime={new Date()}
        courseId={courseId}
        lessonId={lessonId}
      />
    );
  }
  
  return (
    <div className="lab-plancks-constant max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Lab 7 - Planck's Constant</h1>
        <p className="text-gray-600">
          Determine Planck's constant using LED threshold voltages and the photoelectric effect
        </p>
        {lastSaved && (
          <p className="text-sm text-gray-500 mt-2">
            Last saved: {lastSaved.toLocaleTimeString()}
            {isSaving && <span className="ml-2 text-blue-600">Saving...</span>}
          </p>
        )}
      </div>
      
      {/* Section Navigation */}
      <div className="section-navigation mb-6 sticky top-0 bg-white z-10 border-b pb-4">
        <div className="flex flex-wrap gap-2">
          {Object.entries(sectionStatus).map(([section, status]) => (
            <button
              key={section}
              onClick={() => setCurrentSection(section)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                currentSection === section
                  ? 'bg-blue-600 text-white'
                  : `${getStatusColor(status)} hover:opacity-80`
              }`}
            >
              <span className="mr-2">{getStatusIcon(status)}</span>
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
    </div>
  );
};

export default LabPlancksConstant;