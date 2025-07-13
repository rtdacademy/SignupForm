import React, { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

const ElectromagnetSimulation = ({ onDataCollected }) => {
  // Simulation state
  const [config, setConfig] = useState({
    wireLength: 5, // meters (1-15m)
    coreMaterial: 'iron', // iron, steel, aluminum, none
    batteryVoltage: 9, // volts (1.5, 3, 6, 9V)
    wireTurns: 50, // calculated from length
    current: 0.5 // calculated amperage
  });

  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState({
    paperClips: 0,
    screws: 0,
    nails: 0,
    ironRod: false,
    magneticStrength: 0
  });

  const canvasRef = useRef(null);

  // Core material properties
  const coreMaterials = {
    iron: { permeability: 5000, color: '#8B4513', name: 'Iron Nail' },
    steel: { permeability: 2000, color: '#C0C0C0', name: 'Steel Rod' },
    aluminum: { permeability: 1.00002, color: '#B0B0B0', name: 'Aluminum Rod' },
    none: { permeability: 1, color: '#D2B48C', name: 'No Core (Air)' }
  };

  // Battery options
  const batteries = {
    1.5: { name: 'AA Battery', current: 0.15 },
    3: { name: '2x AA Batteries', current: 0.3 },
    6: { name: '4x AA Batteries', current: 0.6 },
    9: { name: '9V Battery', current: 0.9 }
  };

  // Calculate wire turns from length (assuming 1cm diameter core)
  const calculateTurns = (length) => {
    const coreCircumference = 0.0314; // ~1cm diameter = ~3.14cm circumference
    return Math.floor(length / coreCircumference);
  };

  // Calculate magnetic field strength (simplified formula)
  const calculateMagneticStrength = () => {
    const { wireLength, coreMaterial, batteryVoltage } = config;
    const turns = calculateTurns(wireLength);
    const current = batteries[batteryVoltage]?.current || 0.5;
    const permeability = coreMaterials[coreMaterial]?.permeability || 1;
    
    // Simplified B = μ * N * I / L (Tesla)
    // Normalized to 0-100 scale for simulation
    const strength = (permeability * turns * current) / 1000;
    return Math.min(Math.round(strength), 100);
  };

  // Calculate test results based on magnetic strength
  const calculateTestResults = (strength) => {
    const paperClips = Math.floor(strength / 2); // 1 paper clip per 2 strength points
    const screws = Math.floor(strength / 8); // 1 screw per 8 strength points  
    const nails = Math.floor(strength / 15); // 1 nail per 15 strength points
    const ironRod = strength >= 80; // Iron rod needs 80+ strength

    return {
      paperClips: Math.min(paperClips, 50),
      screws: Math.min(screws, 15),
      nails: Math.min(nails, 8),
      ironRod,
      magneticStrength: strength
    };
  };

  // Update configuration
  const updateConfig = (field, value) => {
    const newConfig = { ...config, [field]: value };
    if (field === 'wireLength') {
      newConfig.wireTurns = calculateTurns(value);
    }
    if (field === 'batteryVoltage') {
      newConfig.current = batteries[value]?.current || 0.5;
    }
    setConfig(newConfig);
  };

  // Run simulation test
  const runTest = () => {
    setIsRunning(true);
    
    // Simulate testing delay
    setTimeout(() => {
      const strength = calculateMagneticStrength();
      const results = calculateTestResults(strength);
      setTestResults(results);
      setIsRunning(false);
      
      // Send data to parent component
      if (onDataCollected) {
        onDataCollected({
          config: { ...config, wireTurns: calculateTurns(config.wireLength) },
          results
        });
      }
      
      toast.success(`Test complete! Magnetic strength: ${strength}/100`);
    }, 2000);
  };

  // Draw electromagnet visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw core
    const coreColor = coreMaterials[config.coreMaterial]?.color || '#8B4513';
    ctx.fillStyle = coreColor;
    ctx.fillRect(width/2 - 10, height/2 - 60, 20, 120);
    
    // Draw wire coils
    const turns = calculateTurns(config.wireLength);
    const coilHeight = 100;
    const turnSpacing = coilHeight / Math.min(turns, 50); // Max visual turns
    
    ctx.strokeStyle = '#CD7F32'; // Copper wire color
    ctx.lineWidth = 2;
    
    // Left side coils
    for (let i = 0; i < Math.min(turns, 50); i++) {
      const y = height/2 - 50 + i * turnSpacing;
      ctx.beginPath();
      ctx.arc(width/2 - 15, y, 8, 0, Math.PI);
      ctx.stroke();
    }
    
    // Right side coils
    for (let i = 0; i < Math.min(turns, 50); i++) {
      const y = height/2 - 50 + i * turnSpacing;
      ctx.beginPath();
      ctx.arc(width/2 + 15, y, 8, Math.PI, 2 * Math.PI);
      ctx.stroke();
    }
    
    // Draw battery connections
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(width/2 - 23, height/2 - 60);
    ctx.lineTo(50, height/2 - 60);
    ctx.lineTo(50, height/2 + 80);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(width/2 + 23, height/2 + 60);
    ctx.lineTo(width - 50, height/2 + 60);
    ctx.lineTo(width - 50, height/2 + 80);
    ctx.stroke();
    
    // Draw battery
    ctx.fillStyle = '#333';
    ctx.fillRect(50, height/2 + 80, width - 100, 20);
    ctx.fillStyle = '#fff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(`${config.batteryVoltage}V`, width/2, height/2 + 94);
    
    // Draw magnetic field lines if running
    if (isRunning || testResults.magneticStrength > 0) {
      const strength = testResults.magneticStrength || 50;
      ctx.strokeStyle = `rgba(0, 0, 255, ${strength / 100})`;
      ctx.lineWidth = 1;
      
      // Draw field lines around electromagnet
      for (let radius = 30; radius < 80; radius += 15) {
        ctx.beginPath();
        ctx.ellipse(width/2, height/2, radius, radius * 0.6, 0, 0, 2 * Math.PI);
        ctx.stroke();
      }
    }
    
  }, [config, isRunning, testResults]);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Virtual Electromagnet Builder</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Configuration</h4>
          
          {/* Wire Length */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Wire Length: {config.wireLength}m
            </label>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={config.wireLength}
              onChange={(e) => updateConfig('wireLength', parseFloat(e.target.value))}
              className="w-full"
              disabled={isRunning}
            />
            <p className="text-xs text-gray-500">Turns: ~{calculateTurns(config.wireLength)}</p>
          </div>
          
          {/* Core Material */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Core Material
            </label>
            <select
              value={config.coreMaterial}
              onChange={(e) => updateConfig('coreMaterial', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            >
              {Object.entries(coreMaterials).map(([key, material]) => (
                <option key={key} value={key}>{material.name}</option>
              ))}
            </select>
          </div>
          
          {/* Battery Voltage */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Power Source
            </label>
            <select
              value={config.batteryVoltage}
              onChange={(e) => updateConfig('batteryVoltage', parseFloat(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              disabled={isRunning}
            >
              {Object.entries(batteries).map(([voltage, battery]) => (
                <option key={voltage} value={voltage}>
                  {battery.name} ({voltage}V, ~{battery.current}A)
                </option>
              ))}
            </select>
          </div>
          
          {/* Test Button */}
          <button
            onClick={runTest}
            disabled={isRunning}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 simulation-control ${
              isRunning
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isRunning ? 'Testing...' : 'Test Electromagnet'}
          </button>
        </div>
        
        {/* Visualization Panel */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Electromagnet Visualization</h4>
          
          <canvas
            ref={canvasRef}
            width={300}
            height={250}
            className="border border-gray-300 rounded bg-gray-50 w-full"
          />
          
          {/* Test Results */}
          {(isRunning || testResults.magneticStrength > 0) && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h5 className="font-medium text-gray-700 mb-2">Test Results</h5>
              {isRunning ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-sm text-gray-600">Testing magnetic strength...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Paper clips: <strong>{testResults.paperClips}</strong></div>
                  <div>Small screws: <strong>{testResults.screws}</strong></div>
                  <div>Iron nails: <strong>{testResults.nails}</strong></div>
                  <div>Iron rod: <strong>{testResults.ironRod ? 'Yes' : 'No'}</strong></div>
                  <div className="col-span-2 mt-2 pt-2 border-t">
                    Magnetic Strength: <strong>{testResults.magneticStrength}/100</strong>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-800 mb-2">Instructions</h5>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Adjust wire length to change the number of coil turns</li>
          <li>• Select different core materials to see how permeability affects strength</li>
          <li>• Try different battery voltages to change the current</li>
          <li>• Test your electromagnet to see how many objects it can pick up</li>
          <li>• Record your configurations and results in the observations section</li>
        </ul>
      </div>
    </div>
  );
};

export default ElectromagnetSimulation;