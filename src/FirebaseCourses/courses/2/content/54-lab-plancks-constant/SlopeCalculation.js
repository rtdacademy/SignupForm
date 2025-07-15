import React, { useState, useEffect } from 'react';

const SlopeCalculation = ({ measurements, xAxis, yAxis, selectedPoints, onSlopeCalculated }) => {
  const [slopeMethod, setSlopeMethod] = useState('');
  const [selectedTwoPoints, setSelectedTwoPoints] = useState([]);
  const [manualSlope, setManualSlope] = useState('');
  const [calculatedSlope, setCalculatedSlope] = useState(null);
  const [showCalculation, setShowCalculation] = useState(false);
  
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
  
  // Best-fit line calculation using least squares
  const calculateBestFitSlope = () => {
    if (validMeasurements.length < 2) return null;
    
    const points = validMeasurements.map(getDataPoint);
    const n = points.length;
    
    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumX2 = points.reduce((sum, p) => sum + p.x * p.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const yIntercept = (sumY - slope * sumX) / n;
    
    // Calculate R-squared for goodness of fit
    const yMean = sumY / n;
    const ssTotal = points.reduce((sum, p) => sum + Math.pow(p.y - yMean, 2), 0);
    const ssResidual = points.reduce((sum, p) => {
      const predictedY = slope * p.x + yIntercept;
      return sum + Math.pow(p.y - predictedY, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);
    
    return { slope, yIntercept, rSquared, points };
  };
  
  // Handle method selection
  const handleMethodChange = (method) => {
    setSlopeMethod(method);
    setCalculatedSlope(null);
    setShowCalculation(false);
    setManualSlope('');
  };
  
  
  // Calculate slope when method changes
  useEffect(() => {
    if (slopeMethod === 'best-fit' && validMeasurements.length >= 2) {
      const result = calculateBestFitSlope();
      if (result) {
        setCalculatedSlope(result.slope);
        setManualSlope(result.slope.toString());
        onSlopeCalculated(result.slope);
      }
    }
  }, [slopeMethod, validMeasurements, onSlopeCalculated]);
  
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
  
  const bestFitResult = slopeMethod === 'best-fit' ? calculateBestFitSlope() : null;
  
  return (
    <div className="slope-calculation bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Slope Determination</h3>
      
      <div className="method-selection mb-6">
        <p className="text-gray-700 mb-3">
          To get the most accurate result, you should use all data points to determine the best-fit line through your measurements.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 p-3 rounded">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> Using only two data points would not account for experimental error across all measurements. 
            A best-fit line through all points provides the most reliable slope value.
          </p>
        </div>
        
        <button
          onClick={() => handleMethodChange('best-fit')}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Calculate Best-Fit Line
        </button>
      </div>
      
      
      {slopeMethod === 'best-fit' && bestFitResult && (
        <div className="best-fit-method mb-6">
          <h4 className="font-medium mb-3">Best-Fit Line Method</h4>
          <p className="text-sm text-gray-600 mb-3">
            Using least squares regression to find the best line through all data points:
          </p>
          
          <div className="calculation-results bg-green-50 border border-green-200 p-4 rounded">
            <div className="space-y-2 text-sm">
              <p><strong>Slope:</strong> {bestFitResult.slope.toExponential(3)} {getUnits()}</p>
              <p><strong>Y-intercept:</strong> {bestFitResult.yIntercept.toFixed(4)}</p>
              <p><strong>R² (correlation):</strong> {bestFitResult.rSquared.toFixed(4)}</p>
              {bestFitResult.rSquared > 0.95 && (
                <p className="text-green-700 font-medium">Excellent linear fit! (R² > 0.95)</p>
              )}
            </div>
          </div>
          
          <button
            onClick={() => setShowCalculation(!showCalculation)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showCalculation ? 'Hide' : 'Show'} detailed calculation
          </button>
          
          {showCalculation && (
            <div className="mt-3 p-3 bg-gray-50 border rounded text-xs font-mono">
              <p>Least squares formulas:</p>
              <p>slope = (n·ΣXY - ΣX·ΣY) / (n·ΣX² - (ΣX)²)</p>
              <p>y-intercept = (ΣY - slope·ΣX) / n</p>
              <p>where n = {bestFitResult.points.length} data points</p>
            </div>
          )}
        </div>
      )}
      
      <div className="manual-slope-input">
        <label className="block text-sm font-medium mb-2">
          Your calculated slope:
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
        
        {calculatedSlope && (
          <p className="text-xs text-gray-600 mt-1">
            Calculated value: {calculatedSlope.toExponential(3)} {getUnits()}
          </p>
        )}
      </div>
    </div>
  );
};

export default SlopeCalculation;