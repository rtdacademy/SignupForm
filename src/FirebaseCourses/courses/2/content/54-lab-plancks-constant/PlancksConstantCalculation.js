import React, { useState, useEffect } from 'react';

const PlancksConstantCalculation = ({ slope, xAxis, yAxis, onStudentCalculation }) => {
  const [showSteps, setShowSteps] = useState(false);
  const [studentCalculatedH, setStudentCalculatedH] = useState('');
  const [studentPercentError, setStudentPercentError] = useState('');
  const [showCalculationWork, setShowCalculationWork] = useState(false);
  
  // Physical constants
  const elementaryCharge = 1.602176634e-19; // C (exact value)
  const theoreticalH = 6.62607015e-34; // J⋅s (exact value)
  
  // Calculate correct answer for validation (not shown to student)
  const getCorrectAnswer = () => {
    if (!slope || isNaN(slope)) return null;
    
    if (xAxis === 'frequency' && yAxis === 'voltage') {
      return Math.abs(slope) * elementaryCharge;
    } else if (xAxis === 'voltage' && yAxis === 'frequency') {
      return elementaryCharge / Math.abs(slope);
    }
    return null;
  };
  
  const correctH = getCorrectAnswer();
  
  const handleStudentHChange = (value) => {
    setStudentCalculatedH(value);
    if (onStudentCalculation) {
      onStudentCalculation(value, studentPercentError);
    }
  };
  
  const handlePercentErrorChange = (value) => {
    setStudentPercentError(value);
    if (onStudentCalculation) {
      onStudentCalculation(studentCalculatedH, value);
    }
  };
  
  const validateStudentAnswer = () => {
    const studentH = parseFloat(studentCalculatedH);
    const studentError = parseFloat(studentPercentError);
    
    if (!correctH || isNaN(studentH)) return null;
    
    const correctError = Math.abs((studentH - theoreticalH) / theoreticalH) * 100;
    const hIsCorrect = Math.abs(studentH - correctH) / correctH < 0.05; // Within 5%
    const errorIsCorrect = Math.abs(studentError - correctError) < 2; // Within 2%
    
    return { hIsCorrect, errorIsCorrect, correctError };
  };
  
  const validation = validateStudentAnswer();
  
  const getErrorAssessment = (errorValue) => {
    if (!errorValue || isNaN(errorValue)) return null;
    
    if (errorValue < 5) {
      return { type: 'excellent', message: 'Excellent result! Very close to the theoretical value.' };
    } else if (errorValue < 15) {
      return { type: 'good', message: 'Good result! Within reasonable experimental error.' };
    } else if (errorValue < 30) {
      return { type: 'fair', message: 'Fair result. Consider sources of experimental error.' };
    } else {
      return { type: 'poor', message: 'Large error. Review your measurements and calculations.' };
    }
  };
  
  const errorAssessment = getErrorAssessment(parseFloat(studentPercentError));
  
  if (!slope || isNaN(slope)) {
    return (
      <div className="plancks-calculation bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-2">Calculate Planck's Constant</h3>
        <p className="text-gray-500">Enter a slope value to calculate Planck's constant.</p>
      </div>
    );
  }
  
  return (
    <div className="plancks-calculation bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Calculate Planck's Constant</h3>
      
      <div className="physics-explanation mb-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded mb-4">
          <h4 className="font-medium text-blue-800 mb-2">Physics Background:</h4>
          <div className="text-blue-700 text-sm space-y-1">
            <p>• Einstein's photoelectric equation: <strong>E = hf</strong></p>
            <p>• Energy to create a photon: <strong>E = eV</strong> (where e is elementary charge)</p>
            <p>• Therefore: <strong>eV = hf</strong></p>
            <p>• Rearranging: <strong>V = (h/e) × f</strong></p>
          </div>
        </div>
        
        <p className="text-gray-700 text-sm">
          Your graph shows the linear relationship between threshold voltage and frequency. 
          The slope of this line is directly related to Planck's constant.
        </p>
      </div>
      
      <div className="calculation-section">
        <div className="calculation-instructions bg-blue-50 border border-blue-200 p-4 rounded mb-4">
          <h4 className="font-medium text-blue-800 mb-3">Now You Calculate:</h4>
          
          <div className="space-y-2 text-sm text-blue-700">
            <p>Your slope: <strong>{slope.toExponential(3)} {xAxis === 'frequency' ? 'V/Hz' : 'Hz/V'}</strong></p>
            {xAxis === 'frequency' && yAxis === 'voltage' ? (
              <div>
                <p>From V = (h/e) × f, the slope = h/e</p>
                <p>Therefore: h = slope × e</p>
                <p>h = {slope.toExponential(3)} × {elementaryCharge.toExponential(3)}</p>
              </div>
            ) : (
              <div>
                <p>From f = (e/h) × V, the slope = e/h</p>
                <p>Therefore: h = e / slope</p>
                <p>h = {elementaryCharge.toExponential(3)} / {slope.toExponential(3)}</p>
              </div>
            )}
            <p className="font-medium">Complete the calculation below:</p>
          </div>
        </div>
        
        <div className="student-calculation bg-white border-2 border-gray-300 p-4 rounded mb-4">
          <h4 className="font-medium mb-3">Your Calculation:</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Calculate Planck's constant (h) in J⋅s:
              </label>
              <input
                type="text"
                value={studentCalculatedH}
                onChange={(e) => handleStudentHChange(e.target.value)}
                placeholder="Enter your calculated value (e.g., 6.626e-34)"
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {validation && !validation.hIsCorrect && studentCalculatedH && (
                <p className="text-red-600 text-sm mt-1">Check your calculation - this doesn't match the expected result.</p>
              )}
              {validation && validation.hIsCorrect && (
                <p className="text-green-600 text-sm mt-1">✓ Good calculation!</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Calculate percent error compared to theoretical value ({theoreticalH.toExponential(3)} J⋅s):
              </label>
              <div className="flex items-center space-x-2">
                <span className="text-sm">|</span>
                <input
                  type="text"
                  value={studentCalculatedH}
                  readOnly
                  className="flex-shrink-0 w-32 p-1 bg-gray-100 border border-gray-300 rounded text-sm"
                  placeholder="your h"
                />
                <span className="text-sm">-</span>
                <span className="text-sm">{theoreticalH.toExponential(3)}</span>
                <span className="text-sm">| / {theoreticalH.toExponential(3)} × 100% =</span>
                <input
                  type="text"
                  value={studentPercentError}
                  onChange={(e) => handlePercentErrorChange(e.target.value)}
                  placeholder="%"
                  className="w-20 p-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm">%</span>
              </div>
              {validation && !validation.errorIsCorrect && studentPercentError && (
                <p className="text-red-600 text-sm mt-1">Check your percent error calculation.</p>
              )}
              {validation && validation.errorIsCorrect && (
                <p className="text-green-600 text-sm mt-1">✓ Correct percent error!</p>
              )}
            </div>
            
            <button
              onClick={() => setShowCalculationWork(!showCalculationWork)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {showCalculationWork ? 'Hide' : 'Show'} calculation work area
            </button>
            
            {showCalculationWork && (
              <div className="bg-gray-50 border p-3 rounded">
                <label className="block text-sm font-medium mb-2">
                  Show your calculation work:
                </label>
                <textarea
                  rows="4"
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Write out your step-by-step calculation here..."
                />
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => setShowSteps(!showSteps)}
          className="mb-4 text-sm text-blue-600 hover:text-blue-800"
        >
          {showSteps ? 'Hide' : 'Show'} detailed calculation steps
        </button>
        
        {showSteps && (
          <div className="detailed-steps bg-gray-50 border p-4 rounded mb-4 text-sm">
            <h5 className="font-medium mb-2">Step-by-Step Calculation:</h5>
            <div className="space-y-2 font-mono">
              <p>1. Einstein's equation: E = hf</p>
              <p>2. Energy to create photon: E = eV</p>
              <p>3. Setting equal: eV = hf</p>
              <p>4. Solving for V: V = (h/e) × f</p>
              <p>5. This is linear: y = mx + b, where m = h/e</p>
              <p>6. Your slope m = {slope.toExponential(3)}</p>
              <p>7. Elementary charge e = {elementaryCharge.toExponential(3)} C</p>
              <p>8. Planck's constant h = m × e = {experimentalH?.toExponential(3)} J⋅s</p>
            </div>
          </div>
        )}
        
        <div className="comparison-section">
          <h4 className="font-medium mb-3">Comparison with Theoretical Value:</h4>
          
          {studentCalculatedH && studentPercentError && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded">
                <p className="text-xs text-blue-600 mb-1">Theoretical Value</p>
                <p className="font-semibold text-blue-800">{theoreticalH.toExponential(3)} J⋅s</p>
              </div>
              
              <div className="text-center p-3 bg-green-50 border border-green-200 rounded">
                <p className="text-xs text-green-600 mb-1">Your Result</p>
                <p className="font-semibold text-green-800">{parseFloat(studentCalculatedH).toExponential(3)} J⋅s</p>
              </div>
              
              <div className={`text-center p-3 border rounded ${
                errorAssessment?.type === 'excellent' ? 'bg-green-50 border-green-200' :
                errorAssessment?.type === 'good' ? 'bg-yellow-50 border-yellow-200' :
                errorAssessment?.type === 'fair' ? 'bg-orange-50 border-orange-200' :
                'bg-red-50 border-red-200'
              }`}>
                <p className={`text-xs mb-1 ${
                  errorAssessment?.type === 'excellent' ? 'text-green-600' :
                  errorAssessment?.type === 'good' ? 'text-yellow-600' :
                  errorAssessment?.type === 'fair' ? 'text-orange-600' :
                  'text-red-600'
                }`}>Percent Error</p>
                <p className={`font-semibold ${
                  errorAssessment?.type === 'excellent' ? 'text-green-800' :
                  errorAssessment?.type === 'good' ? 'text-yellow-800' :
                  errorAssessment?.type === 'fair' ? 'text-orange-800' :
                  'text-red-800'
                }`}>{parseFloat(studentPercentError).toFixed(1)}%</p>
              </div>
            </div>
          )}
          
          {errorAssessment && studentPercentError && (
            <div className={`p-3 rounded text-sm ${
              errorAssessment.type === 'excellent' ? 'bg-green-50 border border-green-200 text-green-800' :
              errorAssessment.type === 'good' ? 'bg-yellow-50 border border-yellow-200 text-yellow-800' :
              errorAssessment.type === 'fair' ? 'bg-orange-50 border border-orange-200 text-orange-800' :
              'bg-red-50 border border-red-200 text-red-800'
            }`}>
              <p className="font-medium">{errorAssessment.message}</p>
            </div>
          )}
        </div>
        
        <div className="additional-info mt-6 p-4 bg-gray-50 border rounded">
          <h5 className="font-medium mb-2">About Planck's Constant:</h5>
          <div className="text-sm text-gray-700 space-y-1">
            <p>• Planck's constant (h) is a fundamental physical constant</p>
            <p>• It relates the energy of photons to their frequency</p>
            <p>• Current accepted value: 6.62607015 × 10⁻³⁴ J⋅s (exact since 2019)</p>
            <p>• Your measurement helps verify this fundamental constant!</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlancksConstantCalculation;