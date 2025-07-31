import React, { useState, useEffect } from 'react';

const SlopeCalculation = ({ measurements, xAxis, yAxis, selectedPoints, onSlopeCalculated }) => {
  const [manualSlope, setManualSlope] = useState('');
  
  // Get valid measurement data
  const validMeasurements = measurements.filter(m => m.voltage !== null && m.voltage !== undefined);
  
  // Get data for calculations
  const getDataPoint = (measurement) => {
    const x = xAxis === 'frequency' ? measurement.frequency : measurement.voltage;
    const y = yAxis === 'voltage' ? measurement.voltage : measurement.frequency;
    return { x, y, color: measurement.color };
  };
  
  // Two-point slope calculation
  const calculateTwoPointSlope = () => {
    if (selectedTwoPoints.length !== 2) return null;
    
    const point1 = getDataPoint(validMeasurements[selectedTwoPoints[0]]);
    const point2 = getDataPoint(validMeasurements[selectedTwoPoints[1]]);
    
    const slope = (point2.y - point1.y) / (point2.x - point1.x);
    return { slope, point1, point2 };
  };
  
  
  
  
  
  // Handle manual slope input
  const handleManualSlopeChange = (value) => {
    setManualSlope(value);
    const numericValue = parseFloat(value);
    if (!isNaN(numericValue)) {
      onSlopeCalculated(numericValue);
    }
  };
  
  const getUnits = () => {
    if (xAxis === 'frequency' && yAxis === 'voltage') {
      return 'V/Hz';
    } else if (xAxis === 'voltage' && yAxis === 'frequency') {
      return 'Hz/V';
    }
    return '';
  };
  
  
  return (
    <div className="slope-calculation bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Slope Determination</h3>
      
      <div className="instructions mb-6">
        <p className="text-gray-700 mb-3">
          Now you need to calculate the slope of your graph. Look at your plotted data points and determine the slope manually.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Tip:</strong> Choose two points that lie on or close to a straight line through your data. 
            Use the slope formula: slope = (y₂ - y₁) / (x₂ - x₁)
          </p>
        </div>
      </div>
      
      
      
      <div className="manual-slope-input">
        <label className="block text-sm font-medium mb-2">
          Calculate and enter the slope from your graph:
        </label>
        <div className="flex items-center space-x-2">
          <input 
            type="number" 
            step="any"
            value={manualSlope}
            onChange={(e) => handleManualSlopeChange(e.target.value)}
            placeholder="Enter slope value"
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="text-gray-600 text-sm font-medium">
            {getUnits()}
          </span>
        </div>
        
        <p className="text-xs text-gray-600 mt-1">
          Show your calculation work in the next step.
        </p>
      </div>
    </div>
  );
};

export default SlopeCalculation;