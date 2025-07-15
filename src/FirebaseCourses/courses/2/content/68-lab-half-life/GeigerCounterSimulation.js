import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Activity, Zap } from 'lucide-react';

/**
 * Virtual Geiger Counter Simulation for Half-Life Lab
 * Simulates radioactive decay with realistic Geiger counter behavior
 */
const GeigerCounterSimulation = ({ onDataExport = () => {} }) => {
  // Simulation state
  const [isRunning, setIsRunning] = useState(false);
  const [selectedIsotope, setSelectedIsotope] = useState('unknown1');
  const [timeElapsed, setTimeElapsed] = useState(0); // seconds
  const [currentCPM, setCurrentCPM] = useState(0);
  const [backgroundCPM] = useState(25); // Background radiation
  const [dataPoints, setDataPoints] = useState([]);
  const [totalCounts, setTotalCounts] = useState(0);
  
  // Animation and audio simulation
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const lastClickTime = useRef(0);
  const particleTrails = useRef([]);
  
  // Isotope database with realistic half-lives and initial activities
  const isotopes = {
    unknown1: { 
      name: 'Unknown Isotope A', 
      halfLife: 30, // seconds (for demo purposes)
      initialActivity: 2000, // initial CPM above background
      symbol: '?',
      actualName: 'Radon-220' // Hidden from students
    },
    unknown2: { 
      name: 'Unknown Isotope B', 
      halfLife: 60, // seconds
      initialActivity: 1800,
      symbol: '?',
      actualName: 'Francium-223'
    },
    unknown3: { 
      name: 'Unknown Isotope C', 
      halfLife: 90, // seconds
      initialActivity: 1500,
      symbol: '?',
      actualName: 'Astatine-218'
    },
    unknown4: { 
      name: 'Unknown Isotope D', 
      halfLife: 45, // seconds
      initialActivity: 2200,
      symbol: '?',
      actualName: 'Polonium-214'
    }
  };
  
  const currentIsotope = isotopes[selectedIsotope];
  
  // Calculate theoretical activity at current time using exponential decay
  const calculateActivity = (time) => {
    const lambda = Math.LN2 / currentIsotope.halfLife; // decay constant
    const activity = currentIsotope.initialActivity * Math.exp(-lambda * time);
    return Math.max(0, activity) + backgroundCPM; // Add background radiation
  };
  
  // Simulate Poisson statistics for realistic counting
  const simulatePoisson = (lambda) => {
    // Box-Muller approximation for normal distribution, then convert to Poisson
    const mean = lambda;
    const variance = lambda;
    const random1 = Math.random();
    const random2 = Math.random();
    const normal = Math.sqrt(-2 * Math.log(random1)) * Math.cos(2 * Math.PI * random2);
    const poisson = Math.max(0, Math.round(mean + Math.sqrt(variance) * normal));
    return poisson;
  };
  
  // Particle animation class
  class Particle {
    constructor() {
      this.x = 200 + Math.random() * 100; // Near detector center
      this.y = 150 + Math.random() * 100;
      this.vx = (Math.random() - 0.5) * 8;
      this.vy = (Math.random() - 0.5) * 8;
      this.life = 30;
      this.maxLife = 30;
      this.type = Math.random() < 0.6 ? 'alpha' : Math.random() < 0.8 ? 'beta' : 'gamma';
    }
    
    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.life--;
      
      // Simulate electromagnetic deflection for charged particles
      if (this.type === 'alpha' || this.type === 'beta') {
        this.vx *= 0.98; // Slow down due to interactions
        this.vy *= 0.98;
      }
    }
    
    draw(ctx) {
      const alpha = this.life / this.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      
      switch (this.type) {
        case 'alpha':
          ctx.fillStyle = '#FF6B6B'; // Red for alpha
          ctx.fillRect(this.x - 2, this.y - 2, 4, 4);
          break;
        case 'beta':
          ctx.fillStyle = '#4ECDC4'; // Cyan for beta
          ctx.beginPath();
          ctx.arc(this.x, this.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          break;
        case 'gamma':
          ctx.strokeStyle = '#FFE66D'; // Yellow for gamma
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(this.x - 3, this.y);
          ctx.lineTo(this.x + 3, this.y);
          ctx.stroke();
          break;
      }
      ctx.restore();
    }
    
    isDead() {
      return this.life <= 0;
    }
  }
  
  // Animation loop
  const animate = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw Geiger counter tube
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 3;
    ctx.strokeRect(150, 100, 200, 150);
    ctx.fillStyle = '#333';
    ctx.fillRect(150, 100, 200, 150);
    
    // Draw detector window
    ctx.fillStyle = '#444';
    ctx.fillRect(160, 110, 180, 130);
    
    // Draw sample holder
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(220, 120, 60, 40);
    ctx.fillStyle = '#FFF';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Sample', 250, 145);
    
    // Update and draw particles
    particleTrails.current = particleTrails.current.filter(particle => {
      particle.update();
      particle.draw(ctx);
      return !particle.isDead();
    });
    
    // Draw counter display
    drawCounterDisplay(ctx);
    
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
  };
  
  const drawCounterDisplay = (ctx) => {
    // Digital display background
    ctx.fillStyle = '#000';
    ctx.fillRect(400, 120, 150, 80);
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(400, 120, 150, 80);
    
    // Display text
    ctx.fillStyle = '#00FF00'; // Green LED style
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('GEIGER COUNTER', 475, 140);
    
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`${Math.round(currentCPM)} CPM`, 475, 165);
    
    ctx.font = '12px monospace';
    ctx.fillText(`Time: ${timeElapsed}s`, 475, 185);
  };
  
  // Simulation timer effect
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setTimeElapsed(prev => {
          const newTime = prev + 1;
          const theoreticalCPM = calculateActivity(newTime);
          const measuredCPM = simulatePoisson(theoreticalCPM / 60); // Convert to counts per second, then back
          
          setCurrentCPM(measuredCPM * 60); // Convert back to CPM for display
          setTotalCounts(prevTotal => prevTotal + measuredCPM);
          
          // Add data point every 5 seconds
          if (newTime % 5 === 0) {
            setDataPoints(prev => [...prev, {
              time: newTime,
              cpm: measuredCPM * 60,
              netCPM: Math.max(0, (measuredCPM * 60) - backgroundCPM),
              counts: measuredCPM
            }]);
          }
          
          // Generate particles based on activity
          if (measuredCPM > 0) {
            for (let i = 0; i < Math.min(3, Math.ceil(measuredCPM / 20)); i++) {
              particleTrails.current.push(new Particle());
            }
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, selectedIsotope]);
  
  // Animation effect
  useEffect(() => {
    if (isRunning) {
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, currentCPM, timeElapsed]);
  
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
    setTimeElapsed(0);
    setCurrentCPM(0);
    setTotalCounts(0);
    setDataPoints([]);
    particleTrails.current = [];
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };
  
  const exportData = () => {
    const exportableData = {
      isotope: currentIsotope.name,
      backgroundCPM: backgroundCPM,
      measurements: dataPoints.map(point => ({
        time: point.time,
        totalCPM: point.cpm,
        netCPM: point.netCPM,
        activity: point.netCPM // Activity above background
      })),
      totalMeasurementTime: timeElapsed,
      averageCPM: dataPoints.length > 0 ? (dataPoints.reduce((sum, p) => sum + p.cpm, 0) / dataPoints.length).toFixed(1) : 0
    };
    
    onDataExport(exportableData);
  };
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Activity className="text-green-600" size={20} />
        Virtual Geiger Counter
      </h3>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Isotope Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Unknown Sample
          </label>
          <select
            value={selectedIsotope}
            onChange={(e) => {
              setSelectedIsotope(e.target.value);
              resetSimulation();
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(isotopes).map(([key, isotope]) => (
              <option key={key} value={key}>{isotope.name}</option>
            ))}
          </select>
          <div className="text-xs text-gray-500 mt-1">
            Select a sample to analyze
          </div>
        </div>
        
        {/* Current Status */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-2">Current Reading</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Total CPM:</span>
              <span className="font-mono font-medium">{Math.round(currentCPM)}</span>
            </div>
            <div className="flex justify-between">
              <span>Net CPM:</span>
              <span className="font-mono font-medium">{Math.max(0, Math.round(currentCPM - backgroundCPM))}</span>
            </div>
            <div className="flex justify-between">
              <span>Background:</span>
              <span className="font-mono font-medium">{backgroundCPM} CPM</span>
            </div>
            <div className="flex justify-between">
              <span>Runtime:</span>
              <span className="font-mono font-medium">{timeElapsed}s</span>
            </div>
          </div>
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
          disabled={dataPoints.length === 0}
          className="simulation-control px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center gap-2"
        >
          <Zap size={16} />
          Export Data ({dataPoints.length} points)
        </button>
      </div>
      
      {/* Geiger Counter Visualization */}
      <div className="border border-gray-300 rounded-lg overflow-hidden mb-4">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-auto bg-gray-900"
        />
      </div>
      
      {/* Live Data Display */}
      {dataPoints.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-medium text-gray-800 mb-3">Recent Measurements</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300">
                  <th className="text-left py-2">Time (s)</th>
                  <th className="text-left py-2">Total CPM</th>
                  <th className="text-left py-2">Net CPM</th>
                  <th className="text-left py-2">Activity</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {dataPoints.slice(-8).map((point, index) => (
                  <tr key={index} className="border-b border-gray-200">
                    <td className="py-1">{point.time}</td>
                    <td className="py-1">{Math.round(point.cpm)}</td>
                    <td className="py-1">{Math.round(point.netCPM)}</td>
                    <td className="py-1">{Math.round(point.netCPM)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dataPoints.length > 8 && (
            <div className="text-xs text-gray-500 mt-2">
              Showing last 8 measurements of {dataPoints.length} total
            </div>
          )}
        </div>
      )}
      
      {/* Instructions */}
      <div className="mt-4 bg-blue-50 p-3 rounded-lg">
        <h4 className="font-medium text-blue-800 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Select an unknown isotope sample to analyze</li>
          <li>• Start the Geiger counter to begin collecting data</li>
          <li>• Allow sufficient time (2-3 half-lives) for accurate measurements</li>
          <li>• Export your data for analysis when you have enough points</li>
          <li>• Remember to subtract background radiation from your measurements</li>
        </ul>
      </div>
    </div>
  );
};

export default GeigerCounterSimulation;