import React, { useState } from 'react';
import SimpleQuillEditor from '../../../../../components/SimpleQuillEditor';

const PlancksConstantCalculation = ({ slope, xAxis, yAxis, onStudentCalculation }) => {
  const [studentCalculatedH, setStudentCalculatedH] = useState('');
  const [studentPercentError, setStudentPercentError] = useState('');
  const [calculationWork, setCalculationWork] = useState('');
  
  // Physical constants
  const theoreticalH = 6.62607015e-34; // J⋅s (exact value)
  
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
        <div className="calculation-setup mb-6">
          <p className="text-gray-700 mb-3">
            Your graph shows the linear relationship between threshold voltage and frequency. 
            The slope of this line is directly related to Planck's constant.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <p className="text-blue-700 text-sm">
              <strong>Your slope:</strong> {slope.toExponential(3)} {xAxis === 'frequency' ? 'V/Hz' : 'Hz/V'}
            </p>
          </div>
        </div>
        
        <div className="student-calculation space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Calculate Planck's constant (h) in J⋅s:
            </label>
            <input
              type="text"
              value={studentCalculatedH}
              onChange={(e) => handleStudentHChange(e.target.value)}
              placeholder="Enter your calculated value (e.g., 6.626e-34)"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Calculate percent error compared to theoretical value ({theoreticalH.toExponential(3)} J⋅s):
            </label>
            <input
              type="text"
              value={studentPercentError}
              onChange={(e) => handlePercentErrorChange(e.target.value)}
              placeholder="Enter percent error (e.g., 5.2)"
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Show your calculation work:
            </label>
            <SimpleQuillEditor
              courseId="2"
              unitId="lab-plancks-constant"
              itemId="calculation-work"
              initialContent={calculationWork}
              onSave={(content) => setCalculationWork(content)}
              onContentChange={(content) => setCalculationWork(content)}
              onError={(error) => console.error('SimpleQuillEditor error:', error)}
              placeholder="Show your step-by-step calculation work here..."
            />
          </div>
        </div>
        
        
        
      </div>
    </div>
  );
};

export default PlancksConstantCalculation;