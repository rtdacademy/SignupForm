import React, { useState } from 'react';

const AxisSelection = ({ onAxisChange, measurements }) => {
  const [xAxis, setXAxis] = useState('');
  const [yAxis, setYAxis] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  
  const variableOptions = [
    { value: 'frequency', label: 'Frequency (Hz)', unit: 'Hz', description: 'The frequency of light emitted by each LED' },
    { value: 'voltage', label: 'Threshold Voltage (V)', unit: 'V', description: 'The minimum voltage needed for LED to emit light' },
    { value: 'wavelength', label: 'Wavelength (m)', unit: 'm', description: 'The wavelength of light emitted by each LED' },
    { value: 'energy', label: 'Photon Energy (J)', unit: 'J', description: 'The energy of individual photons emitted' }
  ];
  
  const validateAxisChoice = (xAxis, yAxis) => {
    // Correct choice: Voltage vs Frequency (Einstein equation: V = (h/e) × f)
    return (xAxis === 'frequency' && yAxis === 'voltage') ||
           (xAxis === 'voltage' && yAxis === 'frequency');
  };
  
  const isCorrectChoice = xAxis && yAxis && validateAxisChoice(xAxis, yAxis);
  
  const handleXAxisChange = (value) => {
    setXAxis(value);
    setShowFeedback(false);
  };
  
  const handleYAxisChange = (value) => {
    setYAxis(value);
    setShowFeedback(false);
  };
  
  const handleGenerateGraph = () => {
    // Allow all combinations to be tried - let students explore
    onAxisChange(xAxis, yAxis);
  };
  
  const showHint = () => {
    setShowFeedback(true);
  };
  
  const getFeedbackMessage = () => {
    if (!xAxis || !yAxis) {
      return null;
    }
    
    if (isCorrectChoice) {
      return {
        type: 'success',
        message: 'Excellent choice! This combination will give you a linear relationship that directly relates to Planck\'s constant through Einstein\'s photoelectric equation: E = hf, where eV = hf, so V = (h/e) × f.'
      };
    } else {
      return {
        type: 'warning',
        message: 'This combination might not give you a clear linear relationship. Think about Einstein\'s photoelectric equation and how the threshold voltage relates to photon frequency.'
      };
    }
  };
  
  const feedbackMessage = getFeedbackMessage();
  
  return (
    <div className="axis-selection bg-white p-6 rounded-lg border">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Graph Setup</h3>
        <p className="text-gray-700 mb-4">
          Based on the data you collected and the physics of the photoelectric effect, 
          what should you plot to create a linear relationship that will help you determine Planck's constant?
        </p>
        
        <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4">
          <p className="text-blue-800 text-sm">
            <strong>Think about:</strong> Einstein's photoelectric equation and how the energy of photons 
            relates to their frequency and the voltage needed to create them.
          </p>
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            X-axis (Independent Variable):
          </label>
          <select 
            value={xAxis} 
            onChange={(e) => handleXAxisChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select variable...</option>
            {variableOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {xAxis && (
            <p className="text-xs text-gray-600 mt-1">
              {variableOptions.find(opt => opt.value === xAxis)?.description}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">
            Y-axis (Dependent Variable):
          </label>
          <select 
            value={yAxis} 
            onChange={(e) => handleYAxisChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select variable...</option>
            {variableOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {yAxis && (
            <p className="text-xs text-gray-600 mt-1">
              {variableOptions.find(opt => opt.value === yAxis)?.description}
            </p>
          )}
        </div>
      </div>
      
      {xAxis && yAxis && (
        <div className="selection-summary mb-4">
          <h4 className="font-medium mb-2">Your Selection:</h4>
          <p className="text-gray-700">
            You chose to plot <strong>{variableOptions.find(opt => opt.value === yAxis)?.label}</strong> vs{' '}
            <strong>{variableOptions.find(opt => opt.value === xAxis)?.label}</strong>
          </p>
        </div>
      )}
      
      {feedbackMessage && (
        <div className={`p-3 rounded mb-4 ${
          feedbackMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
        }`}>
          <p className="text-sm">{feedbackMessage.message}</p>
        </div>
      )}
      
      <div className="flex gap-3">
        {xAxis && yAxis && isCorrectChoice && (
          <button
            onClick={handleGenerateGraph}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
          >
            Generate Graph
          </button>
        )}
        
        {xAxis && yAxis && !isCorrectChoice && (
          <button
            onClick={handleGenerateGraph}
            className="px-4 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors"
          >
            Try This Combination
          </button>
        )}
        
        {xAxis && yAxis && !showFeedback && (
          <button
            onClick={showHint}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Get Hint
          </button>
        )}
      </div>
      
      {showFeedback && !isCorrectChoice && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-2">Hint:</h4>
          <p className="text-blue-700 text-sm mb-2">
            Remember Einstein's photoelectric equation: <strong>E = hf</strong>
          </p>
          <p className="text-blue-700 text-sm mb-2">
            The energy of each photon equals the work done by the electric field: <strong>E = eV</strong>
          </p>
          <p className="text-blue-700 text-sm">
            Therefore: <strong>eV = hf</strong>, which can be rearranged to <strong>V = (h/e) × f</strong>
          </p>
          <p className="text-blue-700 text-sm mt-2">
            This tells us that plotting <strong>voltage vs frequency</strong> should give a straight line 
            with slope = h/e, allowing us to calculate Planck's constant!
          </p>
        </div>
      )}
    </div>
  );
};

export default AxisSelection;