import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive Millikan Graph Component
const MillikanGraphComponent = () => {
  const [selectedMetal, setSelectedMetal] = useState('aluminum');
  
  const metals = {
    aluminum: { workFunction: 4.25, thresholdFreq: 1.03 },
    barium: { workFunction: 2.48, thresholdFreq: 0.60 },
    cadmium: { workFunction: 4.07, thresholdFreq: 0.98 },
    calcium: { workFunction: 3.33, thresholdFreq: 0.80 },
    cesium: { workFunction: 1.90, thresholdFreq: 0.46 },
    copper: { workFunction: 4.46, thresholdFreq: 1.08 },
    mercury: { workFunction: 4.50, thresholdFreq: 1.09 },
    nickel: { workFunction: 5.01, thresholdFreq: 1.21 },
    potassium: { workFunction: 1.60, thresholdFreq: 0.39 },
    sodium: { workFunction: 2.26, thresholdFreq: 0.55 },
    tungsten: { workFunction: 4.52, thresholdFreq: 1.09 },
    zinc: { workFunction: 3.31, thresholdFreq: 0.80 }
  };
  
  const planckConstant = 4.14; // ×10^-15 eV·s
  
  const generateDataPoints = (metal) => {
    const points = [];
    const { workFunction, thresholdFreq } = metals[metal];
    
    // Generate points from threshold frequency to 2.0 × 10^15 Hz
    for (let f = thresholdFreq; f <= 2.0; f += 0.1) {
      const kineticEnergy = planckConstant * (f - thresholdFreq);
      points.push({ x: f, y: Math.max(0, kineticEnergy) });
    }
    return points;
  };
  
  const svgWidth = 500;
  const svgHeight = 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };
  const plotWidth = svgWidth - margin.left - margin.right;
  const plotHeight = svgHeight - margin.top - margin.bottom;
  
  // Scale functions
  const xScale = (freq) => (freq / 2.0) * plotWidth;
  const yScale = (energy) => plotHeight - (energy / 8.0) * plotHeight;
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Millikan's Photoelectric Data</h4>
      
      {/* Metal Selector */}
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Metal:</label>
        <select
          value={selectedMetal}
          onChange={(e) => setSelectedMetal(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.keys(metals).map(metal => (
            <option key={metal} value={metal}>
              {metal.charAt(0).toUpperCase() + metal.slice(1)} (W = {metals[metal].workFunction} eV)
            </option>
          ))}
        </select>
      </div>
      
      {/* Graph */}
      <div className="bg-white rounded p-4">
        <svg width={svgWidth} height={svgHeight}>
          {/* Axes */}
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {/* X-axis */}
            <line x1="0" y1={plotHeight} x2={plotWidth} y2={plotHeight} stroke="#333" strokeWidth="2" />
            {/* Y-axis */}
            <line x1="0" y1="0" x2="0" y2={plotHeight} stroke="#333" strokeWidth="2" />
            
            {/* X-axis labels */}
            {[0, 0.5, 1.0, 1.5, 2.0].map(freq => (
              <g key={freq}>
                <line x1={xScale(freq)} y1={plotHeight} x2={xScale(freq)} y2={plotHeight + 5} stroke="#333" />
                <text x={xScale(freq)} y={plotHeight + 20} textAnchor="middle" fontSize="12" fill="#333">
                  {freq.toFixed(1)}
                </text>
              </g>
            ))}
            
            {/* Y-axis labels */}
            {[0, 2, 4, 6, 8].map(energy => (
              <g key={energy}>
                <line x1="0" y1={yScale(energy)} x2="-5" y2={yScale(energy)} stroke="#333" />
                <text x="-10" y={yScale(energy) + 4} textAnchor="end" fontSize="12" fill="#333">
                  {energy}
                </text>
              </g>
            ))}
            
            {/* Axis labels */}
            <text x={plotWidth / 2} y={plotHeight + 40} textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold">
              Frequency (×10¹⁵ Hz)
            </text>
            <text x="-40" y={plotHeight / 2} textAnchor="middle" fontSize="14" fill="#333" fontWeight="bold" transform={`rotate(-90, -40, ${plotHeight / 2})`}>
              Kinetic Energy (eV)
            </text>
            
            {/* Plot all metal lines faintly */}
            {Object.keys(metals).map(metal => {
              const points = generateDataPoints(metal);
              const pathData = points.map((point, i) => 
                `${i === 0 ? 'M' : 'L'} ${xScale(point.x)} ${yScale(point.y)}`
              ).join(' ');
              
              return (
                <path
                  key={metal}
                  d={pathData}
                  stroke={metal === selectedMetal ? "#FF6B6B" : "#E0E0E0"}
                  strokeWidth={metal === selectedMetal ? "3" : "1"}
                  fill="none"
                />
              );
            })}
            
            {/* Threshold frequency marker */}
            <line 
              x1={xScale(metals[selectedMetal].thresholdFreq)} 
              y1="0" 
              x2={xScale(metals[selectedMetal].thresholdFreq)} 
              y2={plotHeight} 
              stroke="#4ECDC4" 
              strokeWidth="2" 
              strokeDasharray="5,5" 
            />
            <text 
              x={xScale(metals[selectedMetal].thresholdFreq) + 5} 
              y="15" 
              fontSize="12" 
              fill="#4ECDC4" 
              fontWeight="bold"
            >
              f₀
            </text>
            
            {/* Data points for selected metal */}
            {generateDataPoints(selectedMetal).filter((_, i) => i % 3 === 0).map((point, i) => (
              <circle
                key={i}
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r="4"
                fill="#FF6B6B"
                stroke="#CC5555"
                strokeWidth="2"
              />
            ))}
          </g>
        </svg>
      </div>
      
      {/* Information Panel */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-blue-300">Equation:</h5>
          <p className="text-sm">Eₖ = hf - W</p>
          <p className="text-sm">y = mx + b</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-green-300">Slope (h):</h5>
          <p className="text-sm">4.14 × 10⁻¹⁵ eV·s</p>
          <p className="text-sm">(Planck's constant)</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-red-300">Y-intercept (-W):</h5>
          <p className="text-sm">-{metals[selectedMetal].workFunction} eV</p>
          <p className="text-sm">Work function: {metals[selectedMetal].workFunction} eV</p>
        </div>
      </div>
    </div>
  );
};

// Interactive Photoelectric Animation Component
const PhotoelectricAnimation = () => {
  const [frequency, setFrequency] = useState(5.0); // Hz (×10^14)
  const [isAnimating, setIsAnimating] = useState(false);
  const [wavePosition, setWavePosition] = useState(0);
  const [electronPosition, setElectronPosition] = useState({ x: 300, y: 200 });
  const [showWave, setShowWave] = useState(true);
  const [electronEjected, setElectronEjected] = useState(false);
  
  const thresholdFrequency = 4.0; // f₀ = 4.0 × 10^14 Hz
  const canEject = frequency >= thresholdFrequency;
  
  // Generate squiggly wave path
  const generateWavePath = (startX, endX, amplitude, frequency) => {
    let path = `M ${startX} 200`;
    const steps = 50;
    const stepSize = (endX - startX) / steps;
    
    for (let i = 1; i <= steps; i++) {
      const x = startX + i * stepSize;
      const y = 200 + amplitude * Math.sin((frequency * 2 * Math.PI * i) / steps);
      path += ` L ${x} ${y}`;
    }
    return path;
  };
  
  const startAnimation = () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    setWavePosition(0);
    setElectronPosition({ x: 300, y: 200 });
    setShowWave(true);
    setElectronEjected(false);
    
    // Animate wave moving toward electron
    const waveInterval = setInterval(() => {
      setWavePosition(prev => {
        if (prev >= 250) {
          clearInterval(waveInterval);
          setShowWave(false);
          
          // If frequency is above threshold, eject electron
          if (canEject) {
            setElectronEjected(true);
            const electronInterval = setInterval(() => {
              setElectronPosition(prev => {
                if (prev.x >= 500) {
                  clearInterval(electronInterval);
                  setTimeout(() => {
                    setIsAnimating(false);
                    setElectronPosition({ x: 300, y: 200 });
                    setElectronEjected(false);
                  }, 500);
                  return prev;
                }
                return { x: prev.x + 5, y: prev.y - 2 };
              });
            }, 50);
          } else {
            setTimeout(() => setIsAnimating(false), 1000);
          }
          return prev;
        }
        return prev + 5;
      });
    }, 50);
  };
  
  return (
    <div className="w-full">
      {/* Frequency Slider */}
      <div className="mb-4 px-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-white font-medium">Frequency (×10¹⁴ Hz):</label>
          <span className="text-white font-mono">{frequency.toFixed(1)}</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="2.0"
            max="8.0"
            step="0.1"
            value={frequency}
            onChange={(e) => setFrequency(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            disabled={isAnimating}
          />
          {/* Threshold marker */}
          <div 
            className="absolute top-0 h-2 w-1 bg-red-500 rounded"
            style={{ left: `${((thresholdFrequency - 2.0) / 6.0) * 100}%` }}
          />
          <div 
            className="absolute -top-6 text-xs text-red-400 font-semibold"
            style={{ left: `${((thresholdFrequency - 2.0) / 6.0) * 100}%`, transform: 'translateX(-50%)' }}
          >
            f₀
          </div>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>2.0</span>
          <span className="text-red-400">f₀ = {thresholdFrequency}</span>
          <span>8.0</span>
        </div>
      </div>
      
      {/* Status Display */}
      <div className="mb-4 text-center">
        <div className={`inline-block px-3 py-1 rounded text-sm font-medium ${
          canEject ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}>
          {canEject ? `f ≥ f₀: Electron will be ejected` : `f < f₀: No photoelectric effect`}
        </div>
      </div>
      
      {/* Animation Area */}
      <div className="relative bg-gray-800 rounded border border-gray-600" style={{ height: '300px' }}>
        <svg width="100%" height="100%" viewBox="0 0 500 300" className="absolute inset-0">
          {/* Metal Surface */}
          <rect x="250" y="180" width="200" height="100" fill="#8B7355" stroke="#6B5B47" strokeWidth="2" />
          <text x="350" y="175" fill="#8B7355" fontSize="12" textAnchor="middle" fontWeight="bold">Metal Surface</text>
          
          {/* Electron on surface */}
          {!electronEjected && (
            <circle 
              cx={electronPosition.x} 
              cy={electronPosition.y} 
              r="8" 
              fill="#4ECDC4" 
              stroke="#2C9AA0" 
              strokeWidth="2"
            />
          )}
          
          {/* Ejected electron */}
          {electronEjected && (
            <circle 
              cx={electronPosition.x} 
              cy={electronPosition.y} 
              r="8" 
              fill="#4ECDC4" 
              stroke="#2C9AA0" 
              strokeWidth="2"
            />
          )}
          
          {/* Squiggly wave */}
          {showWave && (
            <path
              d={generateWavePath(50 + wavePosition, 250 + wavePosition, 15, frequency)}
              stroke="#FFD93D"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          )}
          
          {/* Wave arrow */}
          {showWave && (
            <defs>
              <marker id="wave-arrow" markerWidth="10" markerHeight="7" 
                refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#FFD93D" />
              </marker>
            </defs>
          )}
          
          {showWave && (
            <line 
              x1={240 + wavePosition} 
              y1="200" 
              x2={250 + wavePosition} 
              y2="200" 
              stroke="#FFD93D" 
              strokeWidth="2" 
              markerEnd="url(#wave-arrow)" 
            />
          )}
          
          {/* Labels */}
          <text x="150" y="150" fill="#FFD93D" fontSize="14" textAnchor="middle" fontWeight="bold">
            Electromagnetic Wave
          </text>
          <text x="150" y="165" fill="#FFD93D" fontSize="12" textAnchor="middle">
            f = {frequency.toFixed(1)} × 10¹⁴ Hz
          </text>
          
          <text x="300" y="250" fill="#4ECDC4" fontSize="12" textAnchor="middle" fontWeight="bold">
            Electron (e⁻)
          </text>
          
          {/* Energy equation */}
          <rect x="20" y="20" width="180" height="40" fill="#2D3748" stroke="#4A5568" strokeWidth="1" rx="5" />
          <text x="110" y="35" fill="#FFFFFF" fontSize="11" textAnchor="middle" fontWeight="bold">
            E = hf = {(frequency * 6.63 * 0.1).toFixed(2)} × 10⁻²⁰ J
          </text>
          <text x="110" y="50" fill="#FFFFFF" fontSize="10" textAnchor="middle">
            Work Function: W = {(thresholdFrequency * 6.63 * 0.1).toFixed(2)} × 10⁻²⁰ J
          </text>
        </svg>
        
        {/* Start Animation Button */}
        <div className="absolute bottom-4 right-4">
          <button
            onClick={startAnimation}
            disabled={isAnimating}
            className={`px-4 py-2 rounded font-medium ${
              isAnimating 
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isAnimating ? 'Animating...' : 'Start Animation'}
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [isDiscoveryOpen, setIsDiscoveryOpen] = useState(false);
  const [isEinsteinOpen, setIsEinsteinOpen] = useState(false);
  const [isPhotoelectricEffectOpen, setIsPhotoelectricEffectOpen] = useState(false);
  const [isMillikanOpen, setIsMillikanOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isExample3Open, setIsExample3Open] = useState(false);
  const [isExample4Open, setIsExample4Open] = useState(false);
  const [isExample5Open, setIsExample5Open] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          💡 The Photoelectric Effect
        </h1>
        <p className="text-lg text-gray-600">
          The discovery that changed our understanding of light and matter
        </p>
      </div>

      {/* Discovery of the Photoelectric Effect Section */}
      <div>
        <button
          onClick={() => setIsDiscoveryOpen(!isDiscoveryOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Discovery of the photoelectric effect</h3>
          <span className="text-blue-600">{isDiscoveryOpen ? '▼' : '▶'}</span>
        </button>
        
        {isDiscoveryOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              {/* Hertz's Discovery */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-3">⚡ Hertz's Surprising Discovery (1887)</h4>
                <p className="text-gray-700 text-sm mb-3">
                  In 1887, Heinrich Hertz discovered the photoelectric effect while working with a cathode 
                  ray tube. Hertz's cathode ray tube was turned off and sitting on his lab bench. A high 
                  frequency external light source was turned on and light from the external light source 
                  was allowed to strike the metal cathode in the cathode ray tube.
                </p>
                <div className="bg-white p-3 rounded border border-yellow-300">
                  <p className="text-gray-700 text-sm font-semibold">
                    The result was startling: Cathode rays (i.e. electrons) began to flow from the cathode 
                    to the anode even though the tube was not turned on!
                  </p>
                </div>
              </div>

              {/* Naming the Effect */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">📝 Naming the Photoelectric Effect</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Hertz immediately began to test this effect and, since light "photo" caused electric 
                  charges "electric" to flow, he called it the <strong>photoelectric effect</strong>. 
                  The electrons emitted by the metal surface when illuminated by an external light source 
                  are referred to as <strong>photoelectrons</strong>.
                </p>
              </div>

              {/* Hertz's Experimental Results */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-3">🔬 Hertz's Experimental Results</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Hertz began a thorough examination of the photoelectric effect. His results can be 
                  summed up in the following:
                </p>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">1.</span>
                      <p className="text-gray-700 text-sm">
                        A substance shows a photoelectric effect only if the incident light has a frequency 
                        above a certain threshold value known as the <strong>threshold frequency (f₀)</strong>. 
                        Zinc, for example, will emit electrons for violet light but not for blue light.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">2.</span>
                      <p className="text-gray-700 text-sm">
                        Any frequency below the threshold value will not produce a stream of 
                        photoelectrons off the metal surface.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">3.</span>
                      <p className="text-gray-700 text-sm">
                        Different metal surfaces (i.e. silver versus copper) have different threshold 
                        frequency values.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">4.</span>
                      <p className="text-gray-700 text-sm">
                        Once the external light is at or above the minimum threshold frequency, 
                        photoelectric current flow is <strong>instantaneous</strong>.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">5.</span>
                      <p className="text-gray-700 text-sm">
                        Increasing the frequency of the incident light does not affect the photoelectric 
                        current flow (i.e. the frequency does not affect the number of electrons being emitted).
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">6.</span>
                      <p className="text-gray-700 text-sm">
                        Increasing the intensity of the external light (i.e. using a brighter light source) 
                        caused an increase in the amount of photoelectric flow (called the <strong>photocurrent</strong>) 
                        through the tube. In short, the photocurrent is proportional to the intensity of 
                        the external light source.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="flex items-start gap-3">
                      <span className="font-bold text-green-700 text-sm">7.</span>
                      <p className="text-gray-700 text-sm">
                        Finally, Hertz discovered that increasing the external light source's frequency 
                        caused the kinetic energy of the photoelectrons to increase. In other words, 
                        the speed of the electrons increased with higher energy light.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Classical Physics Problem */}
              <div className="bg-red-50 p-4 rounded-lg border border-red-200 mt-6">
                <h4 className="font-semibold text-red-800 mb-3">⚠️ The Classical Physics Problem</h4>
                <p className="text-gray-700 text-sm mb-3">
                  How do we explain these results? From the classical physics point of view, where 
                  light is a continuous electromagnetic wave, when light is illuminated on the surface 
                  of a metal, the electrons in the metal are violently shaken and oscillated by the 
                  vibrating electromagnetic field of the light.
                </p>
                <div className="bg-white p-3 rounded border border-red-300">
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Classical Prediction:</strong> If the oscillation is too great to keep the 
                    electrons inside the metal, they jump out of the metal surface. According to the 
                    classical theory, the energy given to the electrons is proportional to the square 
                    of the strength of the electromagnetic field.
                  </p>
                  <p className="text-gray-700 text-sm">
                    Hence the maximum energy of the photoelectron must be dependent on the intensity 
                    of the light illuminated which completely contradicts Hertz's experimental results. 
                    Results (1), (2), (5) and (7) above can never be explained within the classical 
                    theory consisting of Newtonian mechanics and Maxwellian electromagnetism.
                  </p>
                </div>
                <div className="mt-3 p-2 bg-red-200 rounded text-center">
                  <p className="text-red-900 font-semibold text-sm">
                    From a quantum physics point of view, we can understand the photoelectric effect 
                    without contradiction if we think that light is instantaneously absorbed as a whole 
                    unit of energy (hf) by the electron in the metal. This is Einstein's hypothesis of energy quanta.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Albert Einstein Section */}
      <div>
        <button
          onClick={() => setIsEinsteinOpen(!isEinsteinOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Albert Einstein</h3>
          <span className="text-blue-600">{isEinsteinOpen ? '▼' : '▶'}</span>
        </button>
        
        {isEinsteinOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              {/* Einstein's Background */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                <h4 className="font-semibold text-purple-800 mb-3">👨‍🔬 Albert Einstein (1879 – 1955)</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Albert Einstein was not particularly brilliant in his formal schooling period. 
                  He found the German schools of the day to be too rigid and militaristic. He dropped 
                  out of school and went to Switzerland where he eventually graduated from the Zurich 
                  Polytechnic School in 1902.
                </p>
                <div className="bg-white p-3 rounded border border-purple-300">
                  <p className="text-gray-700 text-sm">
                    He went to work for the Swiss Patent Office in Bern, Switzerland where he evaluated 
                    patent applications in terms of their agreement with the laws of physics. During his 
                    spare time he thought about and worked on scientific problems.
                  </p>
                </div>
              </div>

              {/* 1905 - The Miracle Year */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-3">🌟 1905: The Miracle Year</h4>
                <p className="text-gray-700 text-sm mb-3">
                  In 1905, he published three papers on topics relevant to the world of Physics. 
                  The first paper was on the mathematics associated with Brownian motion. The second 
                  paper was on the photoelectric effect. The third paper was devoted to special relativity.
                </p>
                <div className="bg-white p-3 rounded border border-yellow-300 mb-3">
                  <p className="text-gray-700 text-sm">
                    <strong>Revolutionary Impact:</strong> Any one of the papers could have placed him 
                    in line for a Nobel Prize in Physics. Einstein, like Maxwell, was a theoretical 
                    genius and he would rely on other experimental scientists to confirm his theoretical 
                    results. The impact of his papers was immense and they caused much controversy.
                  </p>
                </div>
              </div>

              {/* Career Progression */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">🎓 Academic Career</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Einstein was granted a PhD from Zurich for his contributions. In 1915, Einstein 
                  went on to publish another major paper on general relativity. From 1919 on he was 
                  head of the Kaiser Wilhelm Institute for Physics in Berlin.
                </p>
                <div className="bg-white p-3 rounded border border-blue-300">
                  <p className="text-gray-700 text-sm">
                    In 1933, with the rise of the Nazi Party in Germany, Einstein left Berlin, 
                    renounced his German citizenship, and traveled to Princeton in the United States. 
                    He became a member of the Institute for Advanced Studies, an institution where 
                    scientists are not required to publish articles or teach classes. Einstein finished 
                    his career at this institution.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Einstein and the Photoelectric Effect Section */}
      <div>
        <button
          onClick={() => setIsPhotoelectricEffectOpen(!isPhotoelectricEffectOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Einstein and the photoelectric effect</h3>
          <span className="text-blue-600">{isPhotoelectricEffectOpen ? '▼' : '▶'}</span>
        </button>
        
        {isPhotoelectricEffectOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              {/* Einstein's Explanation */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h4 className="font-semibold text-green-800 mb-3">💡 Einstein's Revolutionary Explanation</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Einstein's explanation of the photoelectric effect borrowed from his mentor Max Planck. 
                  Einstein liked the concept of bundles of energy in matter and he expanded it to include 
                  any form of light energy which were later called <strong>photons</strong>.
                </p>
                <div className="bg-white p-3 rounded border border-green-300 mb-3">
                  <p className="text-gray-700 text-sm mb-2">
                    He believed that Planck was correct in assuming that the photons would have discrete 
                    amounts of energy and their energy could be calculated using:
                  </p>
                  <div className="text-center">
                    <BlockMath math="E = hf \quad \text{or} \quad E = \frac{hc}{\lambda}" />
                  </div>
                </div>
              </div>

              {/* Interactive Photoelectric Effect Animation */}
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
                <h4 className="text-white font-semibold mb-4 text-center">Interactive Photoelectric Effect</h4>
                
                {/* Frequency Slider Controls */}
                <div className="mb-6">
                  <PhotoelectricAnimation />
                </div>
              </div>

              {/* Work Function Concept */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-blue-800 mb-3">🔐 The Work Function Concept</h4>
                <p className="text-gray-700 text-sm mb-3">
                  In Einstein's explanation, he assumed that the electrons on the surface of a metal were 
                  held there with a certain amount of "binding" energy. For the electrons to become free 
                  of the metal, this binding energy had to be overcome.
                </p>
                <div className="bg-white p-3 rounded border border-blue-300 mb-3">
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Work Function (W):</strong> Einstein called the energy required to overcome 
                    the binding energy with the metal surface the work function.
                  </p>
                  <div className="text-center">
                    <BlockMath math="W = hf_0" />
                    <p className="text-sm text-gray-600">where f₀ is the threshold frequency</p>
                  </div>
                </div>
              </div>

              {/* Einstein's Explanations */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                <h4 className="font-semibold text-purple-800 mb-3">🎯 How Einstein Explained the Observations</h4>
                
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-purple-300">
                    <h5 className="font-semibold text-purple-700 mb-2">1. Threshold Frequency & Instantaneous Flow:</h5>
                    <p className="text-gray-700 text-sm">
                      If a photon with the threshold frequency strikes an atom of the metal, then an electron 
                      will be freed immediately. This explained both the threshold frequency requirement and 
                      the instantaneous flow aspect of the photoelectric effect.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-300">
                    <h5 className="font-semibold text-purple-700 mb-2">2. Intensity and Photocurrent:</h5>
                    <p className="text-gray-700 text-sm">
                      Einstein's model implies that if you increase the number of photons striking the metal 
                      surface (increased intensity) you will get an increase in the number of photoelectrons 
                      bumped off the surface. An increase in intensity produces a greater photocurrent.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-purple-300">
                    <h5 className="font-semibold text-purple-700 mb-2">3. Frequency and Kinetic Energy:</h5>
                    <p className="text-gray-700 text-sm mb-2">
                      Einstein's model can also explain the increase in the kinetic energy of the electron 
                      with an increase in the frequency of the incident light. If the incident photon possesses 
                      more than the minimum energy (W), any excess energy will be given to the escaping electron 
                      as kinetic energy.
                    </p>
                    <div className="text-center p-2 bg-purple-100 rounded">
                      <BlockMath math="E_{K_{electron}} = E_{photon} - W" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example 1 */}
      <div>
        <button
          onClick={() => setIsExample1Open(!isExample1Open)}
          className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Example 1: Work Function Calculation</h3>
          <span className="text-green-600">{isExample1Open ? '▼' : '▶'}</span>
        </button>
        
        {isExample1Open && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                If the threshold frequency required for emission of a photoelectron is <InlineMath math="4.00 \times 10^{14} \text{ Hz}" />, 
                what is the work function of the surface in Joules and eV?
              </p>

              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-4">Solution:</p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Given:</strong>
                    <div className="mt-2 ml-4">
                      <p>Threshold frequency: <InlineMath math="f_0 = 4.00 \times 10^{14} \text{ Hz}" /></p>
                      <p>Planck's constant: <InlineMath math="h = 6.63 \times 10^{-34} \text{ J·s}" /></p>
                      <p>Find: Work function in Joules and eV</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Equation:</strong>
                    <div className="text-center mt-2">
                      <BlockMath math="W = hf_0" />
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute and solve:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="W = (6.63 \times 10^{-34} \text{ J·s})(4.00 \times 10^{14} \text{ Hz})" />
                        <BlockMath math="W = 2.65 \times 10^{-19} \text{ J}" />
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Convert to eV:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="W = \frac{2.65 \times 10^{-19} \text{ J}}{1.60 \times 10^{-19} \text{ J/eV}}" />
                        <BlockMath math="W = 1.66 \text{ eV}" />
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The work function is <InlineMath math="2.65 \times 10^{-19} \text{ J}" /> or <InlineMath math="1.66 \text{ eV}" />.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example 2 */}
      <div>
        <button
          onClick={() => setIsExample2Open(!isExample2Open)}
          className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Example 2: Photoelectron Speed</h3>
          <span className="text-green-600">{isExample2Open ? '▼' : '▶'}</span>
        </button>
        
        {isExample2Open && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                If the work function of a metal surface is <InlineMath math="3.00 \times 10^{-19} \text{ J}" />, and it is illuminated by light with 
                a wavelength of 500 nm, what is the speed of the escaping photoelectrons?
              </p>

              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-4">Solution:</p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Given:</strong>
                    <div className="mt-2 ml-4">
                      <p>Work function: <InlineMath math="W = 3.00 \times 10^{-19} \text{ J}" /></p>
                      <p>Wavelength: <InlineMath math="\lambda = 500 \text{ nm} = 500 \times 10^{-9} \text{ m}" /></p>
                      <p>Find: Speed of photoelectrons</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Equation:</strong>
                    <div className="text-center mt-2 space-y-1">
                      <BlockMath math="E_k = E_{photon} - W" />
                      <BlockMath math="E_k = \frac{hc}{\lambda} - W" />
                    </div>
                  </li>
                  
                  <li>
                    <strong>Calculate photon energy:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="E_{photon} = \frac{hc}{\lambda} = \frac{(6.63 \times 10^{-34})(3.00 \times 10^8)}{500 \times 10^{-9}}" />
                        <BlockMath math="E_{photon} = 3.978 \times 10^{-19} \text{ J}" />
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Calculate kinetic energy:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="E_k = 3.978 \times 10^{-19} - 3.00 \times 10^{-19}" />
                        <BlockMath math="E_k = 9.78 \times 10^{-20} \text{ J}" />
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Calculate speed using kinetic energy formula:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="E_k = \frac{1}{2}mv^2" />
                        <BlockMath math="v = \sqrt{\frac{2E_k}{m}}" />
                        <BlockMath math="v = \sqrt{\frac{2(9.78 \times 10^{-20})}{9.11 \times 10^{-31}}}" />
                        <BlockMath math="v = 4.63 \times 10^5 \text{ m/s}" />
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The speed of the escaping photoelectrons is <InlineMath math="4.63 \times 10^5 \text{ m/s}" />.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example 3 */}
      <div>
        <button
          onClick={() => setIsExample3Open(!isExample3Open)}
          className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Example 3: Finding Light Frequency</h3>
          <span className="text-green-600">{isExample3Open ? '▼' : '▶'}</span>
        </button>
        
        {isExample3Open && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                A metal surface has a work function of 2.06 eV. If the fastest photoelectron emitted 
                has a speed of <InlineMath math="6.00 \times 10^5 \text{ m/s}" />, what is the frequency of the light source striking the surface?
              </p>

              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-4">Solution:</p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Given:</strong>
                    <div className="mt-2 ml-4">
                      <p>Work function: <InlineMath math="W = 2.06 \text{ eV} = 2.06 \times 1.60 \times 10^{-19} = 3.30 \times 10^{-19} \text{ J}" /></p>
                      <p>Electron speed: <InlineMath math="v = 6.00 \times 10^5 \text{ m/s}" /></p>
                      <p>Electron mass: <InlineMath math="m = 9.11 \times 10^{-31} \text{ kg}" /></p>
                      <p>Find: Frequency of light</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Calculate kinetic energy of electron:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="E_k = \frac{1}{2}mv^2" />
                        <BlockMath math="E_k = \frac{1}{2}(9.11 \times 10^{-31})(6.00 \times 10^5)^2" />
                        <BlockMath math="E_k = 1.64 \times 10^{-19} \text{ J}" />
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Apply photoelectric equation:</strong>
                    <div className="text-center mt-2 space-y-1">
                      <BlockMath math="E_k = hf - W" />
                      <BlockMath math="hf = E_k + W" />
                    </div>
                  </li>
                  
                  <li>
                    <strong>Calculate photon energy:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="hf = 1.64 \times 10^{-19} + 3.30 \times 10^{-19}" />
                        <BlockMath math="hf = 4.94 \times 10^{-19} \text{ J}" />
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Calculate frequency:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="f = \frac{hf}{h} = \frac{4.94 \times 10^{-19}}{6.63 \times 10^{-34}}" />
                        <BlockMath math="f = 7.45 \times 10^{14} \text{ Hz}" />
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The frequency of the light source is <InlineMath math="7.45 \times 10^{14} \text{ Hz}" />.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example 4 */}
      <div>
        <button
          onClick={() => setIsExample4Open(!isExample4Open)}
          className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Example 4: Kinetic Energy from Frequencies</h3>
          <span className="text-green-600">{isExample4Open ? '▼' : '▶'}</span>
        </button>
        
        {isExample4Open && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                If a metal surface has a threshold frequency of <InlineMath math="4.00 \times 10^{14} \text{ Hz}" />, what is the kinetic energy 
                of the escaping photoelectrons when light with a frequency of <InlineMath math="6.00 \times 10^{14} \text{ Hz}" /> strikes the surface?
              </p>

              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-4">Solution:</p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Given:</strong>
                    <div className="mt-2 ml-4">
                      <p>Threshold frequency: <InlineMath math="f_0 = 4.00 \times 10^{14} \text{ Hz}" /></p>
                      <p>Incident frequency: <InlineMath math="f = 6.00 \times 10^{14} \text{ Hz}" /></p>
                      <p>Planck's constant: <InlineMath math="h = 6.63 \times 10^{-34} \text{ J·s}" /></p>
                      <p>Find: Kinetic energy of photoelectrons</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Equation:</strong>
                    <div className="text-center mt-2 space-y-1">
                      <BlockMath math="E_k = E_{photon} - W" />
                      <BlockMath math="E_k = hf - hf_0" />
                      <BlockMath math="E_k = h(f - f_0)" />
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute and solve:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="E_k = (6.63 \times 10^{-34})(6.00 \times 10^{14} - 4.00 \times 10^{14})" />
                        <BlockMath math="E_k = (6.63 \times 10^{-34})(2.00 \times 10^{14})" />
                        <BlockMath math="E_k = 1.33 \times 10^{-19} \text{ J}" />
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The kinetic energy of the escaping photoelectrons is <InlineMath math="1.33 \times 10^{-19} \text{ J}" />.
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Einstein's explanation of the photoelectric effect could explain all the features 
                    discovered by Hertz, but it would require the experimental genius of R.A. Millikan to 
                    verify Einstein's theory.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Millikan's Photoelectric Experiment Section */}
      <div>
        <button
          onClick={() => setIsMillikanOpen(!isMillikanOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Millikan's Photoelectric Experiment</h3>
          <span className="text-blue-600">{isMillikanOpen ? '▼' : '▶'}</span>
        </button>
        
        {isMillikanOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              {/* Millikan's Experimental Setup */}
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                <h4 className="font-semibold text-orange-800 mb-3">🔬 Millikan's Experimental Approach</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Millikan set up an experiment that would allow him to measure the energy of the 
                  escaping electrons while he varied the frequency of the incident light source. He set up 
                  the photoelectric tube so that a reversed voltage could be applied across the anode 
                  and cathode which would stop the ejected photoelectrons from reaching the anode.
                </p>
                <div className="bg-white p-3 rounded border border-orange-300">
                  <p className="text-gray-700 text-sm">
                    <strong>Key Innovation:</strong> With the voltage set up in the opposite direction, Millikan could make the other 
                    electrode so negative that it would repel the photoelectron and prevent its 
                    movement across the tube. He called the necessary voltage the cutoff or <strong>stopping 
                    voltage</strong>. Thus, the electric potential established would have the same energy 
                    as the escaping photoelectron.
                  </p>
                </div>
              </div>

              {/* Energy Measurement */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                <h4 className="font-semibold text-purple-800 mb-3">⚡ Energy Measurement Method</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Millikan now had a practical way to measure the energy of the photoelectrons by raising 
                  the voltage until the current across the tube stopped flowing. In this way he could 
                  measure very accurate values of the kinetic energy of the photoelectrons for different 
                  light frequencies.
                </p>
                <div className="text-center p-3 bg-white rounded border border-purple-300">
                  <BlockMath math="E_{k_{electron}} = \text{electric potential energy} = qV_{stop}" />
                </div>
              </div>

              {/* Interactive Graph */}
              <MillikanGraphComponent />

              {/* Millikan's Discoveries */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6 mt-6">
                <h4 className="font-semibold text-green-800 mb-3">📊 Millikan's Key Discoveries</h4>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded border border-green-300">
                    <h5 className="font-semibold text-green-700 mb-2">1. Linear Relationship:</h5>
                    <p className="text-gray-700 text-sm">
                      Millikan noted that Einstein's equation had the same structure as the general equation 
                      for a straight line: <InlineMath math="E_k = hf - W" /> becomes <InlineMath math="y = mx + b" />
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <h5 className="font-semibold text-green-700 mb-2">2. Universal Slope:</h5>
                    <p className="text-gray-700 text-sm">
                      When Millikan plotted his data he found that the slope of the line did indeed equal 
                      Planck's constant. He also found that the y-intercept was the threshold frequency 
                      for the metal, and the x-intercept was the work function.
                    </p>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-green-300">
                    <h5 className="font-semibold text-green-700 mb-2">3. Different Metals, Same Physics:</h5>
                    <p className="text-gray-700 text-sm">
                      Millikan then used different metals and plotted the data the same way. He found 
                      that each metal gave a different line but each line had the same slope (Planck's constant).
                    </p>
                  </div>
                </div>
              </div>

              {/* Nobel Prizes */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-3">🏆 Nobel Prize Recognition</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Millikan's work in 1916 led to the awarding of three Nobel Prizes in Physics:
                </p>
                <div className="space-y-2">
                  <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                    <strong>1918:</strong> Max Planck - for the quantum theory of thermal radiation
                  </div>
                  <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                    <strong>1921:</strong> Albert Einstein - for the explanation of the photoelectric effect
                  </div>
                  <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                    <strong>1923:</strong> Robert Millikan - for his work on the oil drop experiment plus the verification of Einstein's theory
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Example 5 */}
      <div>
        <button
          onClick={() => setIsExample5Open(!isExample5Open)}
          className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Example 5: Stopping Voltage and Work Function</h3>
          <span className="text-green-600">{isExample5Open ? '▼' : '▶'}</span>
        </button>
        
        {isExample5Open && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                If the stopping voltage in a certain photoelectric effect is 10.0 V and the incident 
                wavelength of the light source is 105 nm, what is the work function of the metal surface?
              </p>

              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-4">Solution:</p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <strong>Given:</strong>
                    <div className="mt-2 ml-4">
                      <p>Stopping voltage: <InlineMath math="V_{stop} = 10.0 \text{ V}" /></p>
                      <p>Wavelength: <InlineMath math="\lambda = 105 \text{ nm} = 105 \times 10^{-9} \text{ m}" /></p>
                      <p>Find: Work function</p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Equation:</strong>
                    <div className="text-center mt-2 space-y-1">
                      <BlockMath math="E_k = E_{photon} - W" />
                      <BlockMath math="qV_{stop} = \frac{hc}{\lambda} - W" />
                      <BlockMath math="W = \frac{hc}{\lambda} - qV_{stop}" />
                    </div>
                  </li>
                  
                  <li>
                    <strong>Choose units and constants:</strong>
                    <div className="mt-2 ml-4">
                      <p>Using eV units for convenience:</p>
                      <p>Planck's constant: <InlineMath math="h = 4.14 \times 10^{-15} \text{ eV·s}" /></p>
                      <p>Speed of light: <InlineMath math="c = 3.00 \times 10^8 \text{ m/s}" /></p>
                      <p>Electron charge: <InlineMath math="q = 1e" /></p>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Substitute and solve:</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="W = \frac{(4.14 \times 10^{-15})(3.00 \times 10^8)}{105 \times 10^{-9}} - (1e)(10.0 \text{ V})" />
                        <BlockMath math="W = 11.83 \text{ eV} - 10.0 \text{ eV}" />
                        <BlockMath math="W = 1.83 \text{ eV}" />
                      </div>
                    </div>
                  </li>
                  
                  <li>
                    <strong>Convert to Joules (optional):</strong>
                    <div className="mt-2 ml-4">
                      <div className="text-center space-y-1">
                        <BlockMath math="W = 1.83 \text{ eV} \times 1.60 \times 10^{-19} \text{ J/eV}" />
                        <BlockMath math="W = 2.93 \times 10^{-20} \text{ J}" />
                      </div>
                    </div>
                  </li>
                </ol>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="font-semibold text-gray-800">Answer:</p>
                  <p className="text-lg mt-2">
                    The work function is <InlineMath math="1.83 \text{ eV}" /> or <InlineMath math="2.93 \times 10^{-20} \text{ J}" />.
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> This problem can be solved using either eV or J as the unit of 
                    energy. Using eV is often more convenient as it eliminates the need for very small numbers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Function Table */}
      <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📋 Work Functions of Common Metals</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-left">Metal</th>
                <th className="border border-gray-300 p-2 text-left">Work Function (eV)</th>
                <th className="border border-gray-300 p-2 text-left">Metal</th>
                <th className="border border-gray-300 p-2 text-left">Work Function (eV)</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr><td className="border border-gray-300 p-2">Aluminum</td><td className="border border-gray-300 p-2">4.25</td><td className="border border-gray-300 p-2">Mercury</td><td className="border border-gray-300 p-2">4.50</td></tr>
              <tr><td className="border border-gray-300 p-2">Barium</td><td className="border border-gray-300 p-2">2.48</td><td className="border border-gray-300 p-2">Nickel</td><td className="border border-gray-300 p-2">5.01</td></tr>
              <tr><td className="border border-gray-300 p-2">Cadmium</td><td className="border border-gray-300 p-2">4.07</td><td className="border border-gray-300 p-2">Potassium</td><td className="border border-gray-300 p-2">1.60</td></tr>
              <tr><td className="border border-gray-300 p-2">Calcium</td><td className="border border-gray-300 p-2">3.33</td><td className="border border-gray-300 p-2">Sodium</td><td className="border border-gray-300 p-2">2.26</td></tr>
              <tr><td className="border border-gray-300 p-2">Cesium</td><td className="border border-gray-300 p-2">1.90</td><td className="border border-gray-300 p-2">Tungsten</td><td className="border border-gray-300 p-2">4.52</td></tr>
              <tr><td className="border border-gray-300 p-2">Copper</td><td className="border border-gray-300 p-2">4.46</td><td className="border border-gray-300 p-2">Zinc</td><td className="border border-gray-300 p-2">3.31</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-600 mt-3">
          <strong>Note:</strong> Every metal has its own unique work function value, which determines 
          its threshold frequency for the photoelectric effect.
        </p>
      </div>

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Hertz discovered the photoelectric effect in 1887 when light caused electrons to flow from a cathode",
            "Classical physics could not explain the threshold frequency, instantaneous flow, or energy-frequency relationship",
            "Einstein explained the photoelectric effect using Planck's quantum theory: light exists as discrete photons with energy E = hf",
            "The work function (W) is the minimum energy required to remove an electron from a metal surface: W = hf₀",
            "Einstein's photoelectric equation: Eₖ = hf - W explains all experimental observations",
            "Millikan's experiments (1916) verified Einstein's theory using stopping voltage measurements",
            "The photoelectric effect demonstrates the particle nature of light and wave-particle duality",
            "Millikan's graph of Eₖ vs f gives a straight line with slope = h and y-intercept = -W",
            "Different metals have different work functions but all follow the same linear relationship",
            "The photoelectric effect led to three Nobel Prizes: Planck (1918), Einstein (1921), and Millikan (1923)",
            "Applications include photomultiplier tubes, image sensors, and solar cells",
            "The effect only depends on photon frequency/energy, not intensity - confirming quantum nature of light"
          ].map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualContent;