import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Interactive Photoelectric Effect Simulation
 * Demonstrates the relationship between light frequency, intensity, and photoelectron emission
 */
const PhotoelectricSimulation = ({ onDataExport = () => {} }) => {
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [selectedMetal, setSelectedMetal] = useState('sodium');
  const [wavelength, setWavelength] = useState(400); // nm
  const [intensity, setIntensity] = useState(50); // percentage
  const [stopVoltage, setStopVoltage] = useState(0); // volts
  
  // Animation state
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const photonsRef = useRef([]);
  const electronsRef = useRef([]);
  
  // Metal properties (work functions in eV)
  const metals = {
    sodium: { name: 'Sodium (Na)', workFunction: 2.28, color: '#FFD700' },
    potassium: { name: 'Potassium (K)', workFunction: 2.25, color: '#E6E6FA' },
    cesium: { name: 'Cesium (Cs)', workFunction: 1.94, color: '#98FB98' },
    calcium: { name: 'Calcium (Ca)', workFunction: 2.87, color: '#FFA07A' },
    magnesium: { name: 'Magnesium (Mg)', workFunction: 3.68, color: '#C0C0C0' }
  };
  
  // Physical constants
  const h = 6.626e-34; // Planck's constant (J⋅s)
  const c = 3e8; // Speed of light (m/s)
  const e = 1.602e-19; // Elementary charge (C)
  const hc_eV = 1240; // hc in eV⋅nm for convenience
  
  // Calculate physics values
  const frequency = c / (wavelength * 1e-9); // Hz
  const photonEnergy = hc_eV / wavelength; // eV
  const workFunction = metals[selectedMetal].workFunction; // eV
  const thresholdWavelength = hc_eV / workFunction; // nm
  const maxKineticEnergy = Math.max(0, photonEnergy - workFunction); // eV
  const isEmitting = photonEnergy > workFunction;
  
  // Animation classes for photons and electrons
  class Photon {
    constructor() {
      this.x = 50;
      this.y = 150 + Math.random() * 100;
      this.vx = 2 + Math.random() * 2;
      this.size = 8;
      this.alpha = 1;
      this.wavelengthColor = this.getWavelengthColor(wavelength);
    }
    
    getWavelengthColor(wl) {
      if (wl < 380) return '#8B00FF'; // UV
      if (wl < 450) return '#4B0082'; // Violet
      if (wl < 495) return '#0000FF'; // Blue
      if (wl < 570) return '#00FF00'; // Green
      if (wl < 590) return '#FFFF00'; // Yellow
      if (wl < 620) return '#FFA500'; // Orange
      if (wl < 750) return '#FF0000'; // Red
      return '#8B0000'; // IR
    }
    
    update() {
      this.x += this.vx;
      if (this.x > 300) {
        this.alpha -= 0.02;
      }
    }
    
    draw(ctx) {
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = this.wavelengthColor;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    
    isDead() {
      return this.alpha <= 0;
    }
  }
  
  class Electron {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.vx = 3 + Math.random() * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.size = 6;
      this.alpha = 1;
      this.trail = [];
    }
    
    update() {
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) this.trail.shift();
      
      this.x += this.vx;
      this.y += this.vy;
      
      // Apply stop voltage effect
      if (stopVoltage > 0) {
        this.vx *= (1 - stopVoltage * 0.01);
      }
      
      if (this.x > 500 || this.vx < 0.1) {
        this.alpha -= 0.02;
      }
    }
    
    draw(ctx) {
      // Draw trail
      ctx.save();
      this.trail.forEach((point, index) => {
        ctx.globalAlpha = (index / this.trail.length) * 0.3;
        ctx.fillStyle = '#87CEEB';
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
      
      // Draw electron
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.fillStyle = '#87CEEB';
      ctx.strokeStyle = '#4682B4';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    
    isDead() {
      return this.alpha <= 0;
    }
  }
  
  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw metal surface
    ctx.fillStyle = metals[selectedMetal].color;
    ctx.fillRect(300, 0, 20, canvas.height);
    ctx.fillStyle = '#333';
    ctx.font = '14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(metals[selectedMetal].name, 310, canvas.height - 10);
    
    // Draw anode (if stop voltage is applied)
    if (stopVoltage > 0) {
      ctx.fillStyle = '#666';
      ctx.fillRect(450, 50, 10, canvas.height - 100);
      ctx.fillText(`Stop Voltage: ${stopVoltage}V`, 455, 40);
    }
    
    // Spawn photons based on intensity
    if (isRunning && Math.random() < intensity / 100) {
      photonsRef.current.push(new Photon());
    }
    
    // Update and draw photons
    photonsRef.current = photonsRef.current.filter(photon => {
      photon.update();
      photon.draw(ctx);
      
      // Check collision with metal surface
      if (photon.x >= 300 && photon.x <= 320 && photon.alpha > 0.5) {
        if (isEmitting && Math.random() < 0.3) {
          electronsRef.current.push(new Electron(320, photon.y));
        }
      }
      
      return !photon.isDead();
    });
    
    // Update and draw electrons
    electronsRef.current = electronsRef.current.filter(electron => {
      electron.update();
      electron.draw(ctx);
      return !electron.isDead();
    });
    
    // Draw info panel
    drawInfoPanel(ctx);
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  const drawInfoPanel = (ctx) => {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(10, 10, 200, 120);
    ctx.strokeStyle = '#ddd';
    ctx.strokeRect(10, 10, 200, 120);
    
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    
    const lines = [
      `Wavelength: ${wavelength} nm`,
      `Frequency: ${(frequency / 1e14).toFixed(2)} × 10¹⁴ Hz`,
      `Photon Energy: ${photonEnergy.toFixed(2)} eV`,
      `Work Function: ${workFunction.toFixed(2)} eV`,
      `Threshold λ: ${thresholdWavelength.toFixed(0)} nm`,
      `Max KE: ${maxKineticEnergy.toFixed(2)} eV`,
      `Emitting: ${isEmitting ? 'Yes' : 'No'}`
    ];
    
    lines.forEach((line, index) => {
      ctx.fillText(line, 15, 30 + index * 14);
    });
    
    ctx.restore();
  };
  
  // Control functions
  const startSimulation = () => {
    setIsRunning(true);
  };
  
  const pauseSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };
  
  const resetSimulation = () => {
    setIsRunning(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    photonsRef.current = [];
    electronsRef.current = [];
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  // Export current data to parent component
  const exportData = () => {
    const data = {
      metal: metals[selectedMetal].name,
      wavelength: wavelength,
      frequency: (frequency / 1e14).toFixed(3), // in 10^14 Hz
      photonEnergy: photonEnergy.toFixed(3),
      workFunction: workFunction.toFixed(3),
      thresholdWavelength: thresholdWavelength.toFixed(0),
      thresholdFrequency: (c / (thresholdWavelength * 1e-9) / 1e14).toFixed(3),
      stopVoltage: stopVoltage,
      kineticEnergy: maxKineticEnergy.toFixed(3),
      isEmitting: isEmitting
    };
    onDataExport(data);
  };
  
  // Start animation when running
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, wavelength, intensity, stopVoltage, selectedMetal]);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Interactive Photoelectric Effect Simulation</h3>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metal Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Target Metal</label>
          <select
            value={selectedMetal}
            onChange={(e) => setSelectedMetal(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(metals).map(([key, metal]) => (
              <option key={key} value={key}>{metal.name}</option>
            ))}
          </select>
        </div>
        
        {/* Wavelength Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Wavelength: {wavelength} nm
          </label>
          <input
            type="range"
            min="200"
            max="800"
            value={wavelength}
            onChange={(e) => setWavelength(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">200-800 nm</div>
        </div>
        
        {/* Intensity Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Beam Intensity: {intensity}%
          </label>
          <input
            type="range"
            min="10"
            max="100"
            value={intensity}
            onChange={(e) => setIntensity(parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">10-100%</div>
        </div>
        
        {/* Stop Voltage Control */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Stop Voltage: {stopVoltage} V
          </label>
          <input
            type="range"
            min="0"
            max="5"
            step="0.1"
            value={stopVoltage}
            onChange={(e) => setStopVoltage(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-500 mt-1">0-5 V</div>
        </div>
      </div>
      
      {/* Control Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={isRunning ? pauseSimulation : startSimulation}
          className={`simulation-control px-4 py-2 rounded-lg flex items-center gap-2 font-medium ${
            isRunning 
              ? 'bg-orange-600 text-white hover:bg-orange-700' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          {isRunning ? 'Pause' : 'Start'}
        </button>
        
        <button
          onClick={resetSimulation}
          className="simulation-control px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2 font-medium"
        >
          <RotateCcw size={16} />
          Reset
        </button>
        
        <button
          onClick={exportData}
          className="simulation-control px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Export Data
        </button>
      </div>
      
      {/* Canvas */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-auto bg-gray-50"
        />
      </div>
      
      {/* Physics Information */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <h4 className="font-semibold text-blue-800 mb-2">Current Conditions</h4>
          <div className="space-y-1 text-blue-700">
            <div>Photon Energy: {photonEnergy.toFixed(2)} eV</div>
            <div>Work Function: {workFunction.toFixed(2)} eV</div>
            <div>Max Kinetic Energy: {maxKineticEnergy.toFixed(2)} eV</div>
            <div className={`font-medium ${isEmitting ? 'text-green-600' : 'text-red-600'}`}>
              {isEmitting ? '✓ Photoelectrons emitted' : '✗ No emission (insufficient energy)'}
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Threshold Conditions</h4>
          <div className="space-y-1 text-gray-700">
            <div>Threshold λ: {thresholdWavelength.toFixed(0)} nm</div>
            <div>Threshold f: {(c / (thresholdWavelength * 1e-9) / 1e14).toFixed(2)} × 10¹⁴ Hz</div>
            <div className="text-xs mt-2 text-gray-600">
              Light must have λ &lt; {thresholdWavelength.toFixed(0)} nm to emit electrons
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhotoelectricSimulation;