import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

// Interactive Planetary Model Component
const PlanetaryModelComponent = () => {
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const problems = [
    {
      id: 1,
      title: "Electron Structure Problem",
      description: "Did all of the electrons travel in the same orbit? Why did they not bump into one another? What was the electron structure?",
      color: "#E74C3C"
    },
    {
      id: 2,
      title: "Bonding Problem", 
      description: "From the known bonding characteristics of different chemical compounds, how are the electrons involved in the bonding process?",
      color: "#3498DB"
    },
    {
      id: 3,
      title: "Nuclear Stability Problem",
      description: "Why do the positive protons stay together in the nucleus? Their strong mutual repulsion should tear the nucleus apart.",
      color: "#9B59B6"
    },
    {
      id: 4,
      title: "Electromagnetic Radiation Problem",
      description: "Maxwell had shown that accelerating electric charges radiate EM radiation. Orbiting electrons should continuously radiate energy and spiral into the nucleus.",
      color: "#F39C12"
    }
  ];
  
  const svgWidth = 600;
  const svgHeight = 400;
  
  const animateElectronSpiral = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 3000);
  };
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Planetary Model of the Atom & Its Problems</h4>
      
      {/* Planetary Model Visualization */}
      <div className="bg-black rounded p-4 mb-4">
        <svg width={svgWidth} height={svgHeight}>
          {/* Sun (Nucleus) */}
          <circle cx="300" cy="200" r="15" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
          <text x="300" y="205" fill="#FFD700" fontSize="10" textAnchor="middle" fontWeight="bold">
            Nucleus
          </text>
          <text x="300" y="235" fill="#FFD700" fontSize="8" textAnchor="middle">
            (Positive)
          </text>
          
          {/* Orbital paths */}
          <circle cx="300" cy="200" r="80" fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="300" cy="200" r="120" fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="300" cy="200" r="160" fill="none" stroke="#444" strokeWidth="1" strokeDasharray="3,3" />
          
          {/* Electrons */}
          <circle cx="380" cy="200" r="6" fill="#4ECDC4" stroke="#2C9AA0" strokeWidth="2">
            {isAnimating && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 300 200;360 300 200;360 300 200"
                dur="3s"
                repeatCount="1"
              />
            )}
          </circle>
          
          <circle cx="220" cy="280" r="6" fill="#4ECDC4" stroke="#2C9AA0" strokeWidth="2">
            {isAnimating && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 300 200;-360 300 200;-360 300 200"
                dur="2.5s"
                repeatCount="1"
              />
            )}
          </circle>
          
          <circle cx="460" cy="200" r="6" fill="#4ECDC4" stroke="#2C9AA0" strokeWidth="2">
            {isAnimating && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                values="0 300 200;360 300 200;360 300 200"
                dur="4s"
                repeatCount="1"
              />
            )}
          </circle>
          
          {/* Radiation waves (showing the problem) */}
          {isAnimating && (
            <g>
              <path d="M 380 200 Q 400 180 420 200 Q 440 220 460 200" 
                    stroke="#FF6B6B" strokeWidth="2" fill="none" opacity="0.7">
                <animate attributeName="opacity" values="0;1;0" dur="1s" repeatCount="indefinite" />
              </path>
              <text x="440" y="175" fill="#FF6B6B" fontSize="10" fontWeight="bold">
                EM Radiation
              </text>
            </g>
          )}
          
          {/* Spiral path showing electron falling in */}
          {isAnimating && (
            <path d="M 380 200 Q 350 200 330 200 Q 320 200 315 200" 
                  stroke="#FF6B6B" strokeWidth="2" fill="none" strokeDasharray="5,5">
              <animate attributeName="stroke-dashoffset" values="0;-20" dur="2s" repeatCount="indefinite" />
            </path>
          )}
          
          {/* Labels */}
          <text x="300" y="50" fill="#FFFFFF" fontSize="16" textAnchor="middle" fontWeight="bold">
            Planetary Model (Rutherford)
          </text>
          <text x="300" y="70" fill="#FFFFFF" fontSize="12" textAnchor="middle">
            Electrons orbit nucleus like planets around the Sun
          </text>
          
          {/* Problem indicators */}
          <text x="50" y="350" fill="#FF6B6B" fontSize="12" fontWeight="bold">
            PROBLEMS:
          </text>
          <text x="50" y="365" fill="#FF6B6B" fontSize="10">
            • Electrons should radiate energy
          </text>
          <text x="50" y="380" fill="#FF6B6B" fontSize="10">
            • Atoms should collapse in ~10⁻¹⁰ seconds
          </text>
          
          <button
            onClick={animateElectronSpiral}
            className="absolute bottom-4 right-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            disabled={isAnimating}
          >
            {isAnimating ? 'Showing Problem...' : 'Show EM Radiation Problem'}
          </button>
        </svg>
      </div>
      
      {/* Problems List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {problems.map((problem) => (
          <div 
            key={problem.id}
            className={`p-3 rounded cursor-pointer transition-all ${
              selectedProblem === problem.id 
                ? 'bg-gray-700 border-2' 
                : 'bg-gray-800 border border-gray-600 hover:bg-gray-700'
            }`}
            style={{ borderColor: selectedProblem === problem.id ? problem.color : undefined }}
            onClick={() => setSelectedProblem(selectedProblem === problem.id ? null : problem.id)}
          >
            <h5 className="font-semibold text-white mb-2" style={{ color: problem.color }}>
              Problem #{problem.id}: {problem.title}
            </h5>
            {selectedProblem === problem.id && (
              <p className="text-gray-300 text-sm">{problem.description}</p>
            )}
          </div>
        ))}
      </div>
      
      {/* Comparison Table */}
      <div className="bg-gray-800 p-4 rounded">
        <h5 className="text-white font-semibold mb-3">Solar System vs Atomic Model Comparison</h5>
        <div className="overflow-x-auto">
          <table className="w-full text-white text-sm">
            <thead>
              <tr className="border-b border-gray-600">
                <th className="text-left p-2">Property</th>
                <th className="text-left p-2">Solar System</th>
                <th className="text-left p-2">Planetary Atom Model</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-b border-gray-700">
                <td className="p-2">Central Body</td>
                <td className="p-2">Sun (massive, positive)</td>
                <td className="p-2">Nucleus (massive, positive)</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Orbiting Bodies</td>
                <td className="p-2">Planets (neutral)</td>
                <td className="p-2">Electrons (negative)</td>
              </tr>
              <tr className="border-b border-gray-700">
                <td className="p-2">Attractive Force</td>
                <td className="p-2">Gravitational</td>
                <td className="p-2">Electrostatic</td>
              </tr>
              <tr>
                <td className="p-2">Stability</td>
                <td className="p-2">Stable orbits</td>
                <td className="p-2">❌ Unstable (EM radiation)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Interactive Hydrogen Spectrum Component
const HydrogenSpectrumComponent = () => {
  const [selectedSeries, setSelectedSeries] = useState('balmer');
  const [calculationExample, setCalculationExample] = useState(null);
  
  const series = {
    lyman: { nf: 1, name: 'Lyman Series', color: '#9B59B6', region: 'Ultraviolet' },
    balmer: { nf: 2, name: 'Balmer Series', color: '#3498DB', region: 'Visible' },
    paschen: { nf: 3, name: 'Paschen Series', color: '#E74C3C', region: 'Infrared' }
  };
  
  const balmerLines = [
    { n: 3, wavelength: 656.21, color: '#FF0000', name: 'Red (Hα)' },
    { n: 4, wavelength: 486.07, color: '#00FF00', name: 'Green (Hβ)' },
    { n: 5, wavelength: 434.01, color: '#0000FF', name: 'Blue (Hγ)' },
    { n: 6, wavelength: 410.12, color: '#8B00FF', name: 'Violet (Hδ)' }
  ];
  
  const calculateWavelength = (nf, ni) => {
    const RH = 1.0972e7; // m^-1
    const result = RH * (1/(nf*nf) - 1/(ni*ni));
    const wavelength = 1/result * 1e9; // Convert to nm
    return wavelength;
  };
  
  const showCalculation = (nf, ni) => {
    setCalculationExample({ nf, ni, wavelength: calculateWavelength(nf, ni) });
  };
  
  const svgWidth = 700;
  const svgHeight = 300;
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Hydrogen Spectrum Analysis</h4>
      
      {/* Series Selector */}
      <div className="mb-4 flex justify-center gap-4">
        {Object.entries(series).map(([key, data]) => (
          <button
            key={key}
            onClick={() => setSelectedSeries(key)}
            className={`px-4 py-2 rounded font-medium transition-colors ${
              selectedSeries === key 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {data.name}
          </button>
        ))}
      </div>
      
      {/* Balmer Series Visualization */}
      {selectedSeries === 'balmer' && (
        <div className="bg-black rounded p-4 mb-4">
          <svg width={svgWidth} height={svgHeight}>
            {/* Spectrum background */}
            <defs>
              <linearGradient id="visibleSpectrum" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" style={{stopColor:"#8B00FF"}} />
                <stop offset="25%" style={{stopColor:"#0000FF"}} />
                <stop offset="50%" style={{stopColor:"#00FF00"}} />
                <stop offset="75%" style={{stopColor:"#FFFF00"}} />
                <stop offset="100%" style={{stopColor:"#FF0000"}} />
              </linearGradient>
            </defs>
            
            <rect x="50" y="120" width="600" height="30" fill="url(#visibleSpectrum)" opacity="0.3" />
            
            {/* Balmer lines */}
            {balmerLines.map((line, index) => {
              const x = 50 + ((line.wavelength - 400) / (700 - 400)) * 600;
              return (
                <g key={index}>
                  <line
                    x1={x}
                    y1={100}
                    x2={x}
                    y2={170}
                    stroke={line.color}
                    strokeWidth="3"
                    style={{ cursor: 'pointer' }}
                    onClick={() => showCalculation(2, line.n)}
                  />
                  <text
                    x={x}
                    y={90}
                    fill={line.color}
                    fontSize="10"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {line.wavelength} nm
                  </text>
                  <text
                    x={x}
                    y={185}
                    fill="white"
                    fontSize="9"
                    textAnchor="middle"
                  >
                    n={line.n}→n=2
                  </text>
                  <text
                    x={x}
                    y={195}
                    fill={line.color}
                    fontSize="8"
                    textAnchor="middle"
                  >
                    {line.name}
                  </text>
                </g>
              );
            })}
            
            {/* Labels */}
            <text x="350" y="50" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">
              Balmer Series (Visible Light)
            </text>
            <text x="350" y="220" fill="white" fontSize="12" textAnchor="middle">
              Click on spectral lines to see calculations
            </text>
            
            {/* Wavelength scale */}
            <text x="50" y="245" fill="white" fontSize="10">400 nm</text>
            <text x="650" y="245" fill="white" fontSize="10">700 nm</text>
          </svg>
        </div>
      )}
      
      {/* Series Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white mb-4">
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-purple-300 mb-2">Lyman Series (UV):</h5>
          <p className="text-sm">nf = 1, ni = 2,3,4,5...</p>
          <p className="text-sm">{`λ < 400 nm`}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-blue-300 mb-2">Balmer Series (Visible):</h5>
          <p className="text-sm">nf = 2, ni = 3,4,5,6...</p>
          <p className="text-sm">{`400 nm < λ < 700 nm`}</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-red-300 mb-2">Paschen Series (IR):</h5>
          <p className="text-sm">nf = 3, ni = 4,5,6,7...</p>
          <p className="text-sm">{`λ > 700 nm`}</p>
        </div>
      </div>
      
      {/* Calculation Example */}
      {calculationExample && (
        <div className="bg-gray-800 p-4 rounded border border-gray-600">
          <h5 className="text-yellow-300 font-semibold mb-2">
            Calculation Example: n={calculationExample.ni} → n={calculationExample.nf}
          </h5>
          <div className="text-white text-sm space-y-1">
            <p>Using Rydberg equation: 1/λ = R_H(1/n_f² - 1/n_i²)</p>
            <p>R_H = 1.0972 × 10⁷ m⁻¹</p>
            <p>1/λ = 1.0972 × 10⁷ × (1/{calculationExample.nf}² - 1/{calculationExample.ni}²)</p>
            <p>Calculated wavelength: {calculationExample.wavelength.toFixed(1)} nm</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Interactive Bohr Model Component
const BohrModelComponent = () => {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [transitionExample, setTransitionExample] = useState(null);
  
  const energyLevels = [
    { n: 1, energy: -13.6, radius: 5.29, label: 'Ground State' },
    { n: 2, energy: -3.40, radius: 21.16, label: '1st Excited' },
    { n: 3, energy: -1.51, radius: 47.61, label: '2nd Excited' },
    { n: 4, energy: -0.85, radius: 84.64, label: '3rd Excited' },
    { n: 5, energy: -0.54, radius: 132.25, label: '4th Excited' },
    { n: Infinity, energy: 0, radius: Infinity, label: 'Ionization' }
  ];
  
  const transitions = [
    { from: 4, to: 2, wavelength: 487, color: '#00FF00', name: 'Green (Hβ)' },
    { from: 3, to: 2, wavelength: 656, color: '#FF0000', name: 'Red (Hα)' },
    { from: 5, to: 2, wavelength: 434, color: '#0000FF', name: 'Blue (Hγ)' }
  ];
  
  const calculateTransition = (from, to) => {
    const fromLevel = energyLevels.find(l => l.n === from);
    const toLevel = energyLevels.find(l => l.n === to);
    const deltaE = fromLevel.energy - toLevel.energy;
    const frequency = deltaE * 1.602e-19 / 6.626e-34; // Convert eV to Hz
    const wavelength = 3e8 / frequency * 1e9; // Convert to nm
    return { deltaE, frequency, wavelength };
  };
  
  const svgWidth = 600;
  const svgHeight = 400;
  const centerX = 300;
  const centerY = 200;
  const maxRadius = 150;
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Bohr Model of Hydrogen Atom</h4>
      
      {/* Energy Level Diagram */}
      <div className="bg-black rounded p-4 mb-4">
        <svg width={svgWidth} height={svgHeight}>
          {/* Nucleus */}
          <circle cx={centerX} cy={centerY} r="8" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
          <text x={centerX} y={centerY + 3} fill="#FFD700" fontSize="10" textAnchor="middle" fontWeight="bold">
            H⁺
          </text>
          
          {/* Orbital circles and energy levels */}
          {energyLevels.slice(0, 5).map((level, index) => {
            const radius = (level.n * level.n) * 15; // Scale for visibility
            const isSelected = selectedLevel === level.n;
            
            return (
              <g key={level.n}>
                {/* Orbital circle */}
                <circle
                  cx={centerX}
                  cy={centerY}
                  r={radius}
                  fill="none"
                  stroke={isSelected ? "#4ECDC4" : "#444"}
                  strokeWidth={isSelected ? "2" : "1"}
                  strokeDasharray="3,3"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedLevel(isSelected ? null : level.n)}
                />
                
                {/* Electron */}
                <circle
                  cx={centerX + radius}
                  cy={centerY}
                  r="4"
                  fill="#4ECDC4"
                  stroke="#2C9AA0"
                  strokeWidth="2"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setSelectedLevel(isSelected ? null : level.n)}
                />
                
                {/* Energy level labels */}
                <text
                  x={centerX - radius - 40}
                  y={centerY + 3}
                  fill="white"
                  fontSize="10"
                  textAnchor="middle"
                >
                  n={level.n}
                </text>
                <text
                  x={centerX - radius - 40}
                  y={centerY + 15}
                  fill="white"
                  fontSize="9"
                  textAnchor="middle"
                >
                  {level.energy} eV
                </text>
              </g>
            );
          })}
          
          {/* Transition arrows for visible lines */}
          {transitions.map((transition, index) => {
            const fromRadius = (transition.from * transition.from) * 15;
            const toRadius = (transition.to * transition.to) * 15;
            const x = centerX + 180 + (index * 60);
            
            return (
              <g key={index}>
                <line
                  x1={x}
                  y1={centerY - fromRadius/4}
                  x2={x}
                  y2={centerY - toRadius/4}
                  stroke={transition.color}
                  strokeWidth="3"
                  markerEnd="url(#arrow)"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setTransitionExample(transition)}
                />
                <text
                  x={x + 10}
                  y={centerY - (fromRadius + toRadius)/8}
                  fill={transition.color}
                  fontSize="9"
                  fontWeight="bold"
                >
                  {transition.wavelength}nm
                </text>
              </g>
            );
          })}
          
          {/* Arrow marker */}
          <defs>
            <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="white" />
            </marker>
          </defs>
          
          {/* Labels */}
          <text x={centerX} y={50} fill="white" fontSize="14" textAnchor="middle" fontWeight="bold">
            Quantized Energy Levels (Stationary States)
          </text>
        </svg>
      </div>
      
      {/* Level Information */}
      {selectedLevel && (
        <div className="bg-gray-800 p-4 rounded border border-gray-600 mb-4">
          <h5 className="text-yellow-300 font-semibold mb-2">
            Energy Level n = {selectedLevel}
          </h5>
          {energyLevels.filter(l => l.n === selectedLevel).map(level => (
            <div key={level.n} className="text-white text-sm space-y-1">
              <p>Energy: {level.energy} eV</p>
              <p>Radius: {level.radius} × 10⁻¹¹ m</p>
              <p>State: {level.label}</p>
            </div>
          ))}
        </div>
      )}
      
      {/* Transition Information */}
      {transitionExample && (
        <div className="bg-gray-800 p-4 rounded border border-gray-600">
          <h5 className="text-yellow-300 font-semibold mb-2">
            Transition: n={transitionExample.from} → n={transitionExample.to}
          </h5>
          <div className="text-white text-sm space-y-1">
            <p>Wavelength: {transitionExample.wavelength} nm</p>
            <p>Color: {transitionExample.name}</p>
            <p>Series: Balmer (visible light)</p>
          </div>
        </div>
      )}
    </div>
  );
};

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode, AIAccordion, onAIAccordionContent }) => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ⚛️ The Bohr Model of the Atom
        </h1>
        <p className="text-lg text-gray-600">
          Solving the problems of the planetary model with quantum mechanics
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="planetary" title="Planetary Models of the Atom" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Post-Rutherford Models */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">🌟 After Rutherford's Discovery</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      After Rutherford's gold foil scattering experiment, all models of the atom featured a nuclear 
                      model with electrons moving around a tiny, massive nucleus. A simple way to visualise the 
                      nuclear model was as planets orbiting a central Sun.
                    </p>
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <p className="text-gray-700 text-sm">
                        <strong>The Analogy:</strong> As the Sun of our solar system attracted the planets, the positive 
                        nucleus of the atom would attract the negative electrons. While the Sun and planets involve 
                        gravitational forces, the nucleus and electrons involve electrostatic forces.
                      </p>
                    </div>
                  </div>

                  {/* Interactive Planetary Model */}
                  <PlanetaryModelComponent />

                  {/* Gravitational vs Electrostatic Forces */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6 mt-6">
                    <h4 className="font-semibold text-blue-800 mb-3">⚖️ Gravitational vs Electrostatic Attraction</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      The nuclear atom was a nice combination of gravitational ideas and sub atomic particles, 
                      but it had several major flaws:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-semibold text-blue-700 mb-2">Solar System (Works)</h5>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Gravitational attraction</li>
                          <li>• Neutral planets</li>
                          <li>• No energy loss</li>
                          <li>• Stable orbits</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-semibold text-blue-700 mb-2">Atomic System (Problems)</h5>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Electrostatic attraction</li>
                          <li>• Charged electrons</li>
                          <li>• Continuous energy radiation</li>
                          <li>• Unstable - should collapse!</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Major Problems */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                    <h4 className="font-semibold text-red-800 mb-3">⚠️ Major Flaws in the Planetary Model</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-semibold text-red-700 mb-2">1. Electron Structure Problems</h5>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Did all of the electrons travel in the same orbit?</li>
                          <li>• Why did they not bump into one another?</li>
                          <li>• What was the electron structure?</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-semibold text-red-700 mb-2">2. Chemical Bonding Questions</h5>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• From the known bonding characteristics of different chemical compounds, how are the electrons involved in the bonding process?</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-semibold text-red-700 mb-2">3. Nuclear Stability Problem</h5>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Why do the positive protons stay together in the nucleus?</li>
                          <li>• Their strong mutual repulsion should tear the nucleus apart</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-semibold text-red-700 mb-2">4. ⚡ The Fatal Flaw: Electromagnetic Radiation</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          The final, and most important flaw, concerned the nature of accelerating charges. James Maxwell 
                          had shown that accelerating electric charges radiate EM radiation (Lesson 24).
                        </p>
                        <div className="bg-red-100 p-2 rounded mt-2">
                          <p className="text-red-800 text-sm font-semibold">
                            If the electrons were in circular orbits, they would continually experience a centripetal 
                            acceleration and should continually radiate energy in the form of electromagnetic waves. 
                            Further, since their kinetic energy is being converted into radiant energy, the electrons 
                            should spiral into the nucleus.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Observational Evidence */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">🔬 What We Actually Observe</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      From observation, we know that atoms have stable structures for long periods of time and they 
                      do not radiate energy on their own.
                    </p>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Required Solution:</strong> A good model of the atom must include Rutherford's findings – 
                        i.e. that the majority of an atom's volume is empty space containing the electrons of the atom 
                        and there is a small, massive, positively charged nucleus.
                      </p>
                      <p className="text-gray-700 text-sm">
                        In addition, any model of the atom would have to account for the absorption and emission 
                        spectra of elements and molecules.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="hydrogen-spectrum" title="Regularities in the Hydrogen Spectrum" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Historical Context */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">🔬 Studying the Simplest Element</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Over many years, different people worked on measuring and understanding the properties of the 
                      lightest and simplest element – hydrogen. The visible bright line spectrum formed by excited 
                      hydrogen gas consists of four lines:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="bg-white p-2 rounded border border-green-300 text-center">
                        <div className="w-full h-4 bg-red-500 rounded mb-1"></div>
                        <p className="text-xs font-semibold">Red line</p>
                        <p className="text-xs">λ = 656.21 nm</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-green-300 text-center">
                        <div className="w-full h-4 bg-green-500 rounded mb-1"></div>
                        <p className="text-xs font-semibold">Green line</p>
                        <p className="text-xs">λ = 486.07 nm</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-green-300 text-center">
                        <div className="w-full h-4 bg-blue-500 rounded mb-1"></div>
                        <p className="text-xs font-semibold">Blue line</p>
                        <p className="text-xs">λ = 434.01 nm</p>
                      </div>
                      <div className="bg-white p-2 rounded border border-green-300 text-center">
                        <div className="w-full h-4 bg-purple-500 rounded mb-1"></div>
                        <p className="text-xs font-semibold">Violet line</p>
                        <p className="text-xs">λ = 410.12 nm</p>
                      </div>
                    </div>
                  </div>

                  {/* Balmer's Discovery */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">📐 Johann Jakob Balmer (1885)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      In 1885, a mathematician named Johann Jakob Balmer found a simple empirical formula that would 
                      give the wavelengths of these four lines (an empirical formula describes the phenomenon, but it 
                      does not explain the phenomenon). His equation is:
                    </p>
                    <div className="bg-white p-4 rounded border border-blue-300 text-center">
                      <BlockMath math="\frac{1}{\lambda} = R_H \left(\frac{1}{2^2} - \frac{1}{n^2}\right)" />
                      <p className="text-sm text-gray-600 mt-2">
                        where n = any integer greater than 2 and less than 7 (i.e. 3, 4, 5, 6)
                      </p>
                      <p className="text-sm text-gray-600">
                        <InlineMath math="R_H = 1.0972 \times 10^7 \text{ m}^{-1}" /> (later called the Rydberg constant)
                      </p>
                    </div>
                  </div>

                  {/* Interactive Hydrogen Spectrum */}
                  <HydrogenSpectrumComponent />

                  {/* Rydberg Equation */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6 mt-6">
                    <h4 className="font-semibold text-orange-800 mb-3">🌟 The Generalized Rydberg Equation</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Once the UV lines were verified, the Balmer equation was modified to handle other possibilities. 
                      The new equation was called the Rydberg equation:
                    </p>
                    <div className="bg-white p-4 rounded border border-orange-300 text-center">
                      <BlockMath math="\frac{1}{\lambda} = R_H \left(\frac{1}{n_f^2} - \frac{1}{n_i^2}\right)" />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
                        <div>
                          <p className="text-sm text-gray-600">
                            where <InlineMath math="n_f" /> = final integer (1, 2, 3 ...)
                          </p>
                          <p className="text-sm text-gray-600">
                            <InlineMath math="n_i" /> = initial integer (1, 2, 3 ...)
                          </p>
                        </div>
                        <div className="bg-orange-100 p-2 rounded">
                          <p className="text-xs text-orange-800 font-semibold">Note:</p>
                          <p className="text-xs text-orange-800">
                            This equation works for hydrogen only. For other atoms a different R constant is required.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Mathematical Significance */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-3">🎯 The Significance for Atomic Theory</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      The fact that a precise, and fairly simple, mathematical relationship described the wavelengths 
                      of spectral lines generated by hydrogen gas indicated that the spectral lines were governed by 
                      some physical relationship or law.
                    </p>
                    <div className="bg-white p-3 rounded border border-indigo-300">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Challenge for Scientists:</strong> Niels Bohr would use the production of spectral lines 
                        for hydrogen to enhance and refine his model of the atom.
                      </p>
                      <p className="text-gray-700 text-sm">
                        <strong>Note:</strong> You are not required to know the Balmer or Rydberg equations, they were 
                        used above for instructive purposes only. You are required to know that hydrogen has a spectrum 
                        that can be described by a simple mathematical relationship.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="bohr-postulates" title="Bohr's Postulates" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Bohr's Background */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">👨‍🔬 Niels Bohr (1885-1962)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Niels Bohr received his PhD in 1911 in the field of Physics from the University of Copenhagen. 
                      In 1912, he spent a year working under Ernest Rutherford at the University of Manchester in England.
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <p className="text-gray-700 text-sm">
                        In the same year, Bohr would propose a model of the hydrogen atom that incorporated multiple 
                        groundbreaking theories and experimental results.
                      </p>
                    </div>
                  </div>

                  {/* Incorporated Theories */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">🧩 Theories Incorporated in Bohr's Model</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">⚡ J.J. Thomson's cathode ray tube experiments</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">🎯 Rutherford's nuclear model</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">📦 Planck's quantum theory</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">💡 Einstein's photon theory</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">🌈 Emission and absorption spectra for hydrogen</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">📐 Rydberg's equation for hydrogen wavelengths</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">🧪 Franck-Hertz experimental results</p>
                      </div>
                    </div>
                  </div>

                  {/* The Three Postulates */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">📜 The Three Postulates</h4>
                    <p className="text-gray-700 text-sm mb-4">
                      In order to account for the existence of stable electron orbits and separate emission spectra, 
                      Bohr made three major assumptions called the postulates. (A postulate is an assumed idea upon 
                      which a theory is based.)
                    </p>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded border border-yellow-300">
                        <h5 className="font-semibold text-yellow-800 mb-2">Postulate 1: Stationary States</h5>
                        <p className="text-gray-700 text-sm">
                          Electrons move in circular orbits, but they do not radiate energy. These orbits are 
                          called <strong>stationary states</strong>.
                        </p>
                      </div>
                      
                      <div className="bg-white p-4 rounded border border-yellow-300">
                        <h5 className="font-semibold text-yellow-800 mb-2">Postulate 2: Quantum Jumps</h5>
                        <p className="text-gray-700 text-sm mb-3">
                          Electrons can "jump" from one stationary state to another, but they cannot exist in between them. 
                          When an electron absorbs energy it jumps up in energy level. When an electron releases energy 
                          it jumps down in energy level. The energy emitted or absorbed has a frequency determined by the relation:
                        </p>
                        <div className="text-center p-2 bg-yellow-100 rounded">
                          <BlockMath math="hf = |E_f - E_i|" />
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded border border-yellow-300">
                        <h5 className="font-semibold text-yellow-800 mb-2">Postulate 3: Quantized Orbits</h5>
                        <p className="text-gray-700 text-sm mb-3">
                          Of all possible orbits around the nucleus, only a few are allowed. Each orbit has a 
                          characteristic energy and radius given by the following equations:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="text-center p-3 bg-yellow-100 rounded">
                            <BlockMath math="E_n = \frac{E_1}{n^2}" />
                            <p className="text-xs text-gray-600 mt-1">Energy levels</p>
                          </div>
                          <div className="text-center p-3 bg-yellow-100 rounded">
                            <BlockMath math="r_n = n^2 r_1" />
                            <p className="text-xs text-gray-600 mt-1">Orbital radii</p>
                          </div>
                        </div>
                        <div className="mt-3 p-3 bg-yellow-100 rounded">
                          <p className="text-sm text-gray-700">
                            Where n = 1, 2, 3, 4, ... (n is the principal quantum number)
                          </p>
                          <p className="text-sm text-gray-700">For the ground state n = 1</p>
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>For hydrogen:</strong> <InlineMath math="E_1 = -13.6 \text{ eV}" /> or <InlineMath math="-2.18 \times 10^{-18} \text{ J}" />
                          </p>
                          <p className="text-sm text-gray-700">
                            <InlineMath math="r_1 = 5.29 \times 10^{-11} \text{ m}" />
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Bohr Model */}
                  <BohrModelComponent />

                  {/* Energy Level Diagram Explanation */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6 mt-6">
                    <h4 className="font-semibold text-purple-800 mb-3">📊 Understanding Energy Level Diagrams</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Below is an energy level diagram for hydrogen. Note that the sign of the energy depends on where 
                      we place our zero value. This is a very important diagram to understand.
                    </p>
                    <div className="bg-white p-3 rounded border border-purple-300 mb-3">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Energy Reference Point:</strong> In order to jump from one energy level to another, 
                        the atom had to absorb or emit the difference in the energy levels.
                      </p>
                      <div className="text-center p-2 bg-purple-100 rounded">
                        <BlockMath math="\Delta E = E_f - E_i" />
                        <BlockMath math="hf = E_f - E_i" />
                        <BlockMath math="\frac{hc}{\lambda} = E_f - E_i" />
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Note on Energy Signs:</strong> If our zero point is the ionization state, then the energy 
                        levels are negative relative to 0 eV measured from the ionization level. If we choose our zero 
                        point to be the ground state, then the energies are positive relative to the ground state.
                      </p>
                    </div>
                  </div>

                  {/* Scope and Limitations */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                    <h4 className="font-semibold text-red-800 mb-3">⚠️ Scope and Limitations</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Bohr's postulates were intended to work for all atoms, not just hydrogen, but it did not work out that way. 
                      For multi-electron atoms, the interactions between electrons require a far more sophisticated and involved idea.
                    </p>
                  </div>

                  {/* Personal Note about Bohr */}
                  <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-3">📝 An Interesting Personal Note</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      It may be of interest to note that Bohr was not very good at writing down his ideas. His PhD was 
                      delayed by many years because he had developed such a fear of writing. Finally, he dictated his 
                      ideas to his wife who then wrote the necessary thesis.
                    </p>
                    <div className="bg-white p-3 rounded border border-gray-400">
                      <p className="text-gray-700 text-sm mb-2">
                        Throughout his professional life, Bohr found writing to be very painful. When you read Albert 
                        Einstein's papers there is an eloquent flow of words and ideas. When you try to read Bohr's 
                        papers, you are fortunate if you get beyond the first paragraph.
                      </p>
                      <p className="text-gray-700 text-sm">
                        <strong>When asked why he had such difficulties, he said, "Grammar teachers."</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1: Energy Transition Calculation" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    An electron drops from the fourth energy level of hydrogen to the second energy level.
                  </p>
                  <p className="mb-4 font-semibold">a) What is the energy released?</p>
                  <p className="mb-4 font-semibold">b) What is the frequency and wavelength of the emitted photon?</p>

                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <div className="space-y-6">
                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Part a) Energy Released:</h5>
                        <div className="ml-4 space-y-2">
                          <p className="text-gray-700 text-sm">Given energy levels:</p>
                          <p className="text-gray-700 text-sm">• <InlineMath math="E_4 = -0.85 \text{ eV}" /></p>
                          <p className="text-gray-700 text-sm">• <InlineMath math="E_2 = -3.40 \text{ eV}" /></p>
                          
                          <div className="text-center space-y-2 mt-4">
                            <BlockMath math="\Delta E = E_f - E_i" />
                            <BlockMath math="\Delta E = E_2 - E_4" />
                            <BlockMath math="\Delta E = (-3.40 \text{ eV}) - (-0.85 \text{ eV})" />
                            <BlockMath math="\Delta E = -2.55 \text{ eV}" />
                          </div>
                          
                          <div className="bg-green-100 p-3 rounded mt-3">
                            <p className="text-green-800 font-semibold text-sm">
                              The energy released is 2.55 eV (the negative sign indicates energy is released)
                            </p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-gray-800 mb-2">Part b) Frequency and Wavelength:</h5>
                        <div className="ml-4 space-y-2">
                          <p className="text-gray-700 text-sm">Using the energy-frequency relationship:</p>
                          
                          <div className="text-center space-y-2 mt-4">
                            <BlockMath math="\Delta E = hf" />
                            <BlockMath math="f = \frac{\Delta E}{h} = \frac{2.55 \text{ eV}}{4.14 \times 10^{-15} \text{ eV·s}}" />
                            <BlockMath math="f = 6.16 \times 10^{14} \text{ Hz}" />
                          </div>
                          
                          <p className="text-gray-700 text-sm mt-4">Using the wave equation:</p>
                          
                          <div className="text-center space-y-2 mt-2">
                            <BlockMath math="\lambda = \frac{c}{f} = \frac{3.00 \times 10^8 \text{ m/s}}{6.16 \times 10^{14} \text{ Hz}}" />
                            <BlockMath math="\lambda = 487 \text{ nm}" />
                          </div>
                          
                          <div className="bg-green-100 p-3 rounded mt-3">
                            <p className="text-green-800 font-semibold text-sm">
                              This corresponds to the green line in the emission spectrum of the Balmer series
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800">Answer:</p>
                      <p className="text-lg mt-2">
                        a) Energy released: 2.55 eV
                      </p>
                      <p className="text-lg">
                        b) Frequency: <InlineMath math="6.16 \times 10^{14} \text{ Hz}" />, Wavelength: 487 nm (green light)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="strengths" title="Strengths of the Bohr Model" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">1. Accurate Hydrogen Atom Calculations</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model of the atom could explain the size of the hydrogen atom. The radius calculated 
                        corresponded to known values of the hydrogen atom.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">2. Correct Ionization Energy</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model gave an ionization value (-E₁) that corresponded to the known ionization value 
                        for the hydrogen atom.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">3. Explained Hydrogen Spectral Lines</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model could account for the formation of the spectral lines in the hydrogen spectra. 
                        While Balmer, Lyman, Paschen, and others had used a mathematical relationship to calculate 
                        the known wavelengths, the relationship had no scientific basis. Bohr's atom gave the same 
                        results and a strong scientific basis for the observed emission and absorption spectral lines.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">4. Explained Periodic Table Structure</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model could be expanded with some modifications to account for: a) larger charges in 
                        the nucleus and b) possible shielding by inner electrons on outer electrons in larger atoms 
                        in the periodic table as a whole. When Bohr applied his theories to the periodic table as a 
                        whole, he was able to explain why elements were grouped vertically according to chemical and 
                        physical properties.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">5. Connected Quantum Numbers to Periodic Trends</h5>
                      <p className="text-gray-700 text-sm">
                        He found all the elements in a vertical column had the same number of electrons in their outer 
                        most energy level. Bohr also found that the energy level quantum number corresponded to the 
                        horizontal row (period) of the periodic table. Bohr's atom provided greater understanding for 
                        the workings of the periodic table designed by Mendeleev and Moseley.
                      </p>
                    </div>

                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">6. Foundation for Modern Atomic Theory</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's atom used the nucleus idea of Rutherford but now gave an explanation for the structure 
                        of the electron cloud. His model is still used as the starting point for teaching the atom in 
                        the field of chemistry. His model will explain many of the known properties of the group 1, 2, 
                        13-18 elements. The Bohr model breaks down for transition elements and members of the Lanthanide 
                        and Actinide series.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="problems" title="Problems with the Bohr Model" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 mb-2">1. Limited to Hydrogen Only</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model only works well for hydrogen. It must be tremendously modified to accommodate 
                        other elements with larger nuclei and more electrons.
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 mb-2">2. Cannot Explain Complex Spectra</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model could not explain why the number of spectral lines increased for some elements 
                        when they were placed in electric and magnetic fields.
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 mb-2">3. Cannot Explain Spectral Line Intensities</h5>
                      <p className="text-gray-700 text-sm">
                        Bohr's model was not able to explain the relative intensity of some of the spectral lines 
                        (i.e. why some lines were brighter than others).
                      </p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 mb-2">4. Still Based on Classical Physics</h5>
                      <p className="text-gray-700 text-sm">
                        Nevertheless Bohr's model of the atom was a spectacular success. His model is still used as 
                        the starting point for teaching the atom in the field of chemistry. His model will explain 
                        many of the known properties of the group 1, 2, 13-18 elements. The Bohr model breaks down 
                        for transition elements and members of the Lanthanide and Actinide series.
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">🎯 Overall Assessment</h4>
                    <p className="text-gray-700 text-sm">
                      Despite its limitations, Bohr's model was revolutionary because it successfully bridged classical 
                      and quantum physics, provided a scientific explanation for hydrogen spectra, and laid the 
                      foundation for modern quantum mechanical models of the atom.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Fallback content - show all sections expanded */}
          <div className="bg-gray-100 p-4 rounded-lg border border-gray-300">
            <h3 className="text-lg font-semibold text-gray-700">Course content loading...</h3>
            <p className="text-gray-600">Please wait while we prepare the interactive content.</p>
          </div>
        </div>
      )}

      {/* Knowledge Check */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="60-bohr-model"
        course={course}
        itemConfig={itemConfig}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question1',
            title: 'Question 1: Rutherford Model Problem'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question2',
            title: 'Question 2: Photon Emission Process'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question3',
            title: 'Question 3: Bohr Model Spectral Explanation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question4',
            title: 'Question 4: Bohr Model Strengths'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question5',
            title: 'Question 5: Bohr Model Weaknesses'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question6',
            title: 'Question 6: Energy Level Calculations'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question7',
            title: 'Question 7: Energy Conservation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question8',
            title: 'Question 8: Photon Color and Energy'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question9',
            title: 'Question 9: Ionization Energy'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question10',
            title: 'Question 10: Wavelength Calculations'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question11',
            title: 'Question 11: Hydrogen Gas Excitation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question12',
            title: 'Question 12: Photon Wavelength from n=6→n=2'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question13',
            title: 'Question 13: Photon Frequency from n=7→n=3'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question14',
            title: 'Question 14: Energy Absorption n=1→n=8'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_60_question15',
            title: 'Question 15: Ionization Energy from Diagram'
          }
        ]}
        title="⚛️ Bohr Model Knowledge Check"
        subtitle="Test your understanding of the Bohr atomic model, energy levels, and quantum transitions"
      />

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "The planetary model failed because accelerating charges should radiate energy, causing atomic collapse",
            "Balmer (1885) discovered an empirical formula for hydrogen spectral lines with remarkable accuracy (0.02%)",
            "The Rydberg equation generalized Balmer's work to all hydrogen spectral series (Lyman, Balmer, Paschen)",
            "Bohr's model incorporated quantum theory, nuclear structure, and spectroscopic data into a unified theory",
            "Postulate 1: Electrons orbit in stationary states without radiating energy",
            "Postulate 2: Electrons jump between energy levels, emitting/absorbing photons with E = hf = |Ef - Ei|",
            "Postulate 3: Only specific quantized orbits are allowed, with En = E₁/n² and rn = n²r₁",
            "For hydrogen: E₁ = -13.6 eV and r₁ = 5.29 × 10⁻¹¹ m define the ground state",
            "Bohr's model correctly predicted hydrogen's size, ionization energy, and spectral line wavelengths",
            "The model explained periodic table structure and electron shell arrangements",
            "Major limitation: Only works accurately for hydrogen and hydrogen-like ions",
            "Cannot explain spectral line intensities or fine structure in magnetic/electric fields",
            "Bohr's work bridged classical and quantum physics, earning him the 1922 Nobel Prize",
            "The model remains foundational for teaching atomic structure and chemical bonding"
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