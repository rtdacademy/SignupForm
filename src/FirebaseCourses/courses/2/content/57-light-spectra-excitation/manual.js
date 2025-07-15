import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

// Interactive Spectral Lines Component
const SpectralLinesComponent = () => {
  const [selectedElement, setSelectedElement] = useState('hydrogen');
  
  const elements = {
    hydrogen: {
      name: 'Hydrogen',
      lines: [
        { wavelength: 656, color: '#FF6B6B', name: 'Hα', energy: 1.89 },
        { wavelength: 486, color: '#4ECDC4', name: 'Hβ', energy: 2.55 },
        { wavelength: 434, color: '#45B7D1', name: 'Hγ', energy: 2.86 },
        { wavelength: 410, color: '#9B59B6', name: 'Hδ', energy: 3.03 }
      ]
    },
    helium: {
      name: 'Helium',
      lines: [
        { wavelength: 587, color: '#F1C40F', name: 'He D3', energy: 2.11 },
        { wavelength: 501, color: '#2ECC71', name: 'He I', energy: 2.48 },
        { wavelength: 447, color: '#3498DB', name: 'He I', energy: 2.78 },
        { wavelength: 402, color: '#9B59B6', name: 'He I', energy: 3.09 }
      ]
    },
    sodium: {
      name: 'Sodium',
      lines: [
        { wavelength: 589, color: '#F39C12', name: 'Na D1', energy: 2.10 },
        { wavelength: 589.6, color: '#E67E22', name: 'Na D2', energy: 2.10 },
        { wavelength: 498, color: '#27AE60', name: 'Na I', energy: 2.49 },
        { wavelength: 466, color: '#3498DB', name: 'Na I', energy: 2.66 }
      ]
    },
    mercury: {
      name: 'Mercury',
      lines: [
        { wavelength: 579, color: '#F1C40F', name: 'Hg I', energy: 2.14 },
        { wavelength: 546, color: '#2ECC71', name: 'Hg I', energy: 2.27 },
        { wavelength: 436, color: '#3498DB', name: 'Hg I', energy: 2.84 },
        { wavelength: 405, color: '#9B59B6', name: 'Hg I', energy: 3.06 }
      ]
    }
  };
  
  const svgWidth = 600;
  const svgHeight = 200;
  const spectrumStart = 50;
  const spectrumEnd = 550;
  const spectrumY = 100;
  
  // Map wavelength to position
  const wavelengthToX = (wavelength) => {
    return spectrumStart + ((wavelength - 400) / (700 - 400)) * (spectrumEnd - spectrumStart);
  };
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Emission Spectra of Elements</h4>
      
      {/* Element Selector */}
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Element:</label>
        <select
          value={selectedElement}
          onChange={(e) => setSelectedElement(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.keys(elements).map(element => (
            <option key={element} value={element}>
              {elements[element].name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Spectrum Display */}
      <div className="bg-black rounded p-4">
        <svg width={svgWidth} height={svgHeight}>
          {/* Continuous spectrum background */}
          <defs>
            <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor:"#8B00FF", stopOpacity:0.3}} />
              <stop offset="16.67%" style={{stopColor:"#4B0082", stopOpacity:0.3}} />
              <stop offset="33.33%" style={{stopColor:"#0000FF", stopOpacity:0.3}} />
              <stop offset="50%" style={{stopColor:"#00FF00", stopOpacity:0.3}} />
              <stop offset="66.67%" style={{stopColor:"#FFFF00", stopOpacity:0.3}} />
              <stop offset="83.33%" style={{stopColor:"#FF7F00", stopOpacity:0.3}} />
              <stop offset="100%" style={{stopColor:"#FF0000", stopOpacity:0.3}} />
            </linearGradient>
          </defs>
          
          {/* Background spectrum */}
          <rect 
            x={spectrumStart} 
            y={spectrumY - 20} 
            width={spectrumEnd - spectrumStart} 
            height={40} 
            fill="url(#spectrum)" 
          />
          
          {/* Spectral lines for selected element */}
          {elements[selectedElement].lines.map((line, index) => (
            <g key={index}>
              {/* Line */}
              <line
                x1={wavelengthToX(line.wavelength)}
                y1={spectrumY - 30}
                x2={wavelengthToX(line.wavelength)}
                y2={spectrumY + 30}
                stroke={line.color}
                strokeWidth="3"
              />
              {/* Label */}
              <text
                x={wavelengthToX(line.wavelength)}
                y={spectrumY - 35}
                fill={line.color}
                fontSize="10"
                textAnchor="middle"
                fontWeight="bold"
              >
                {line.name}
              </text>
              <text
                x={wavelengthToX(line.wavelength)}
                y={spectrumY + 45}
                fill="#FFFFFF"
                fontSize="9"
                textAnchor="middle"
              >
                {line.wavelength}nm
              </text>
            </g>
          ))}
          
          {/* Wavelength scale */}
          {[400, 450, 500, 550, 600, 650, 700].map(wavelength => (
            <g key={wavelength}>
              <line
                x1={wavelengthToX(wavelength)}
                y1={spectrumY + 25}
                x2={wavelengthToX(wavelength)}
                y2={spectrumY + 30}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
              <text
                x={wavelengthToX(wavelength)}
                y={spectrumY + 65}
                fill="#FFFFFF"
                fontSize="8"
                textAnchor="middle"
              >
                {wavelength}
              </text>
            </g>
          ))}
          
          {/* Axis labels */}
          <text x={300} y={190} fill="#FFFFFF" fontSize="12" textAnchor="middle" fontWeight="bold">
            Wavelength (nm)
          </text>
        </svg>
      </div>
      
      {/* Information Panel */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-blue-300 mb-2">Element: {elements[selectedElement].name}</h5>
          <p className="text-sm">Each element produces a unique pattern of spectral lines</p>
          <p className="text-sm mt-1">These "fingerprints" allow identification of elements</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-green-300 mb-2">Energy Transitions:</h5>
          <p className="text-sm">Each line corresponds to an electron energy transition</p>
          <p className="text-sm mt-1">E = hf = hc/λ</p>
        </div>
      </div>
    </div>
  );
};

// Interactive Excitation States Component
const ExcitationStatesComponent = () => {
  const [selectedTransition, setSelectedTransition] = useState(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [electronPosition, setElectronPosition] = useState(0);
  
  const energyLevels = [
    { level: 0, energy: 0, label: 'Ground State', color: '#2ECC71' },
    { level: 1, energy: 4.89, label: '1st Excitation', color: '#3498DB' },
    { level: 2, energy: 6.67, label: '2nd Excitation', color: '#9B59B6' },
    { level: 3, energy: 8.84, label: '3rd Excitation', color: '#E74C3C' },
    { level: 4, energy: 10.4, label: 'Ionization', color: '#F39C12' }
  ];
  
  const transitions = [
    { from: 1, to: 0, energy: 4.89, wavelength: 254.0, color: '#FF6B6B' },
    { from: 2, to: 0, energy: 6.67, wavelength: 186.4, color: '#4ECDC4' },
    { from: 3, to: 0, energy: 8.84, wavelength: 140.6, color: '#45B7D1' },
    { from: 2, to: 1, energy: 1.78, wavelength: 686.8, color: '#96CEB4' },
    { from: 3, to: 1, energy: 3.95, wavelength: 312.3, color: '#FFEAA7' },
    { from: 3, to: 2, energy: 2.17, wavelength: 572.9, color: '#DDA0DD' }
  ];
  
  const svgWidth = 600;
  const svgHeight = 400;
  const levelSpacing = 60;
  const baseY = 350;
  
  const getLevelY = (level) => baseY - (level * levelSpacing);
  
  const animateTransition = (transition) => {
    if (isAnimating) return;
    
    setSelectedTransition(transition);
    setIsAnimating(true);
    setElectronPosition(transition.from);
    
    setTimeout(() => {
      setElectronPosition(transition.to);
      setTimeout(() => {
        setIsAnimating(false);
        setElectronPosition(0);
      }, 1000);
    }, 500);
  };
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Mercury Atom Excitation States & Transitions</h4>
      
      {/* Energy Level Diagram */}
      <div className="bg-black rounded p-4 mb-4">
        <svg width={svgWidth} height={svgHeight}>
          {/* Energy levels */}
          {energyLevels.map((level) => (
            <g key={level.level}>
              {/* Level line */}
              <line
                x1="50"
                y1={getLevelY(level.level)}
                x2="250"
                y2={getLevelY(level.level)}
                stroke={level.color}
                strokeWidth="3"
              />
              {/* Energy label */}
              <text
                x="260"
                y={getLevelY(level.level) + 5}
                fill={level.color}
                fontSize="12"
                fontWeight="bold"
              >
                {level.energy} eV
              </text>
              {/* Level label */}
              <text
                x="10"
                y={getLevelY(level.level) + 5}
                fill="#FFFFFF"
                fontSize="10"
              >
                n={level.level}
              </text>
              {/* State label */}
              <text
                x="300"
                y={getLevelY(level.level) + 5}
                fill="#FFFFFF"
                fontSize="11"
              >
                {level.label}
              </text>
            </g>
          ))}
          
          {/* Animated electron */}
          {isAnimating && (
            <circle
              cx="150"
              cy={getLevelY(electronPosition)}
              r="6"
              fill="#FFD700"
              stroke="#FFA500"
              strokeWidth="2"
            >
              <animate
                attributeName="cy"
                values={`${getLevelY(selectedTransition?.from)};${getLevelY(selectedTransition?.to)}`}
                dur="1s"
                begin="0.5s"
              />
            </circle>
          )}
          
          {/* Transition arrows */}
          {transitions.map((transition, index) => {
            const startY = getLevelY(transition.from);
            const endY = getLevelY(transition.to);
            const x = 400 + (index % 3) * 60;
            
            return (
              <g key={index}>
                {/* Arrow */}
                <line
                  x1={x}
                  y1={startY}
                  x2={x}
                  y2={endY + 10}
                  stroke={transition.color}
                  strokeWidth="2"
                  markerEnd="url(#arrowhead)"
                  style={{ cursor: 'pointer' }}
                  onClick={() => animateTransition(transition)}
                />
                {/* Wavelength label */}
                <text
                  x={x + 5}
                  y={(startY + endY) / 2}
                  fill={transition.color}
                  fontSize="9"
                  fontWeight="bold"
                >
                  {transition.wavelength}nm
                </text>
              </g>
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#FFFFFF" />
            </marker>
          </defs>
          
          {/* Title */}
          <text x="300" y="25" fill="#FFFFFF" fontSize="14" textAnchor="middle" fontWeight="bold">
            Click transition arrows to see electron movement
          </text>
        </svg>
      </div>
      
      {/* Information Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-blue-300 mb-2">Franck-Hertz Results:</h5>
          <p className="text-sm">Electron energy drops at 4.89 eV, 6.67 eV, 8.84 eV</p>
          <p className="text-sm mt-1">Mercury atoms absorb specific energies only</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-green-300 mb-2">Energy Formula:</h5>
          <p className="text-sm">E_photon = E_initial - E_final</p>
          <p className="text-sm mt-1">λ = hc/E</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-red-300 mb-2">Quantum Levels:</h5>
          <p className="text-sm">Only specific excitation energies allowed</p>
          <p className="text-sm mt-1">Electrons fall back emitting photons</p>
        </div>
      </div>
      
      {selectedTransition && (
        <div className="mt-4 p-3 bg-gray-800 rounded border border-gray-600">
          <h5 className="text-yellow-300 font-semibold">
            Selected Transition: n={selectedTransition.from} → n={selectedTransition.to}
          </h5>
          <p className="text-white text-sm">
            Energy: {selectedTransition.energy.toFixed(2)} eV | Wavelength: {selectedTransition.wavelength} nm
          </p>
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
          🌈 Light Spectra & Excitation States
        </h1>
        <p className="text-lg text-gray-600">
          Discovering the chemical composition of stars and the expanding universe
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="introduction" title="Introduction to Light Spectra" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Types of Spectra */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">🔬 What Are Light Spectra?</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      In our study of the nature of the atom and the quantization of light energy, we've learned 
                      about how they led to our current conception of the atom. Light spectra are the patterns 
                      produced when light is either dispersed through an optical glass prism or is diffracted 
                      apart by a diffraction grating – i.e. light is separated into its constituent colours.
                    </p>
                  </div>

                  {/* Three Types of Spectra */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">📊 Three Types of Spectra</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">1. Continuous Spectrum</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          When a solid or a liquid is made white hot, white light is emitted. When the light passes 
                          through a prism it is dispersed into its colours. The short wavelengths (violet, blue) are 
                          refracted more by the prism than the longer wavelengths (orange, red). The result is a 
                          continuous spectrum of light from violet to red.
                        </p>
                        <div className="p-2 bg-green-100 rounded text-center">
                          <p className="text-green-800 font-semibold text-sm">
                            Source: Hot solid or liquid → Complete rainbow of colors
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">2. Emission/Bright-line Spectrum</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          Recall from Lesson 28 that a hot solid or liquid acts as a blackbody radiator and that the 
                          light emitted is not affected by the type or kind of solid or liquid being heated. Gases will 
                          also produce light when heated to a high temperature. In 1752 a Scottish physicist named 
                          Thomas Melvill observed the spectra produced by a heated gas.
                        </p>
                        <div className="p-2 bg-green-100 rounded text-center">
                          <p className="text-green-800 font-semibold text-sm">
                            Source: Hot gas → Bright colored lines against dark background
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">3. Absorption/Dark-line Spectrum</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          In 1802, British scientist William Wollaston found seven dark lines within the continuous 
                          spectrum produced by light from the sun. In 1814, the German physicist Joseph van Fraunhofer 
                          was able to detect hundreds of these dark lines formed on the continuous solar spectrum. 
                          These lines are now called Fraunhofer Lines in his honour.
                        </p>
                        <div className="p-2 bg-green-100 rounded text-center">
                          <p className="text-green-800 font-semibold text-sm">
                            Source: White light through cool gas → Dark lines in continuous spectrum
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Spectral Lines Component */}
                  <SpectralLinesComponent />
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="emission" title="Discovery of Emission Spectra" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Melvill's Discovery */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Thomas Melvill's Discovery (1752)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Melvill discovered that gases do not produce a continuous spectrum, rather they produce a spectrum 
                      that is composed of bright coloured lines against a black background. We call this type of spectrum 
                      a bright line or emission spectrum (i.e. the gas emits the light). He also noted that the colours 
                      and locations of the bright lines were different when different gases were used.
                    </p>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Key Observation:</strong> Each gas produces its own unique pattern of bright spectral lines, 
                        like a fingerprint that identifies the specific element.
                      </p>
                    </div>
                  </div>

                  {/* Gas Excitation Methods */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">⚡ Methods of Gas Excitation</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      By 1823, scientists had found that gases could be induced to glow when excited by electricity. 
                      If the gas was sealed inside a tube with an anode and a cathode, it would glow when electricity 
                      was passed through it. Modern electric signs, for example, are composed of tubes with neon, argon, 
                      and other gases which are exposed to a potential difference.
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Modern Applications:</strong> Neon signs, fluorescent lights, and gas discharge tubes 
                        all work on this principle. Each gas gives off its own characteristic colours of light.
                      </p>
                    </div>
                  </div>

                  {/* Herschel's Contribution */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">🔬 John Herschel's Insight</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      John Herschel, the British Astronomer, suggested that if each gas had a characteristic bright line 
                      spectrum then elements might be identified by their spectrum. Spectral analysis was the result of 
                      this idea. In 1860, Gustav Kirchoff and Robert Bunsen discovered two substances with unique emission 
                      spectra that did not match any known spectrum at the time.
                    </p>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Historic Discovery:</strong> Using this technique they had isolated two new elements: 
                        cesium and rubidium. Many other elements were discovered using this technique.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="absorption" title="Absorption/Dark-line Spectra" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Fraunhofer's Work */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                    <h4 className="font-semibold text-orange-800 mb-3">🌞 Fraunhofer Lines in Solar Spectrum</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      In 1859, Gustav Kirchoff was able to produce a dark line (absorption) spectrum by passing white 
                      light through a glass container holding cold sodium gas and then viewing the emerging light with a prism. 
                      The gas in the container absorbed a few discreet wavelengths or colours of light while the majority 
                      of the light passed through the gas.
                    </p>
                    <div className="bg-white p-3 rounded border border-orange-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Process:</strong> White light source → Cool gas → Prism → Continuous spectrum with dark absorption lines
                      </p>
                    </div>
                  </div>

                  {/* Emission vs Absorption Comparison */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">🔄 Comparison of Emission and Absorption Spectra</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      When Kirchoff compared the emission spectra with the absorption spectra of sodium vapor, he noted 
                      that the position of the dark lines in the absorption spectra corresponded exactly with the position 
                      of the two bright yellow lines in the emission spectra.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-semibold text-purple-700 mb-2">Emission Spectrum</h5>
                        <div className="bg-black p-2 rounded mb-2 text-center">
                          <span className="text-yellow-400 font-bold">|</span>
                          <span className="text-white mx-2">Dark Background</span>
                          <span className="text-yellow-400 font-bold">|</span>
                        </div>
                        <p className="text-gray-700 text-xs">Bright lines on dark background</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-semibold text-purple-700 mb-2">Absorption Spectrum</h5>
                        <div className="bg-gradient-to-r from-purple-400 via-blue-500 via-green-500 via-yellow-500 via-orange-500 to-red-500 p-2 rounded mb-2 text-center relative">
                          <span className="absolute left-1/4 top-0 bottom-0 w-0.5 bg-black"></span>
                          <span className="absolute right-1/4 top-0 bottom-0 w-0.5 bg-black"></span>
                          <span className="text-white text-xs">Continuous</span>
                        </div>
                        <p className="text-gray-700 text-xs">Dark lines in continuous spectrum</p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-white rounded border border-purple-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Key Discovery:</strong> All other elements were quickly checked and an exact match up resulted 
                        for all the other known elements. Apparently the light energy absorbed by an element from white light 
                        matched exactly the light energy emitted by the excited element.
                      </p>
                    </div>
                  </div>

                  {/* Quantum Explanation */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-3">❓ The Puzzling Phenomenon</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      However, a rather puzzling phenomenon was that there were always more lines in the emission spectrum 
                      than in the absorption spectrum. Why? We will answer this question shortly, but first we need to 
                      understand how spectral analysis reveals the chemical composition of distant objects.
                    </p>
                    <div className="bg-white p-3 rounded border border-red-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Coming Up:</strong> The answer involves quantum energy levels and electron transitions between 
                        different energy states in atoms.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="franck-hertz" title="The Franck-Hertz Experiment" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Introduction */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">🧪 Understanding Atomic Energy Absorption</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Earlier studies of emission and absorption spectra had revealed that atoms emit and absorb light 
                      energy only at discrete, characteristic wavelengths or energies, but there was no theory that 
                      could explain how they worked. A significant contribution to our understanding of atomic structure 
                      was provided by a team of two German physicists, James Franck and Gustav Hertz, in 1914.
                    </p>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Objective:</strong> Franck and Hertz devised an experiment to investigate how atoms 
                        absorb energy in collisions with fast-moving electrons.
                      </p>
                    </div>
                  </div>

                  {/* Experimental Setup */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">⚙️ Experimental Apparatus</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Using an apparatus similar to that shown, free electrons emitted from the cathode were accelerated 
                      through low pressure mercury vapour by a voltage applied to the wire screen anode. (An electron 
                      accelerated by a potential difference of 5.0 V, for example, acquires a kinetic energy of 5.0 eV.)
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-300 mb-3">
                      <p className="text-gray-700 text-sm mb-2">
                        Most of the electrons went through the screen and were collected by the anode plate beyond the screen. 
                        This flow of electrons constituted an electric current, which was measured by a microammeter.
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Method:</strong> The experiment consisted of gradually increasing the accelerating voltage 
                        and, for each value, measuring the electric current passing through the mercury vapour and collected by the plate.
                      </p>
                    </div>
                  </div>

                  {/* Experimental Results */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">📊 Franck and Hertz Results</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">Initial Observations:</h5>
                        <p className="text-gray-700 text-sm">
                          As the accelerating voltage was increased slowly from zero, the current gradually increased as well.
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">First Critical Point - 4.89 V:</h5>
                        <p className="text-gray-700 text-sm">
                          Then, at a voltage of 4.89 V, the current dropped dramatically. As the voltage was increased further, 
                          the current once again began to increase.
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">Additional Critical Points:</h5>
                        <p className="text-gray-700 text-sm">
                          Similar minor decreases in current also occurred at voltages of 6.67 V and 8.84 V. Another 
                          significant decrease in current occurred at a voltage of 9.8 V.
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">Pattern Discovery:</h5>
                        <p className="text-gray-700 text-sm">
                          The results indicated that for certain values of bombarding electron energy (4.89 eV, 6.67 eV, 8.84 eV, 9.8 eV, ...) 
                          the electrons do not "make it" through the mercury vapour. Their energy is lost because of collisions with mercury vapour atoms.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quantum Interpretation */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                    <h4 className="font-semibold text-orange-800 mb-3">⚛️ Quantum Energy Level Interpretation</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Their energy is lost by the collision as internal energy quanta or amounts of energy. Their 
                      proposed interpretation was that the electrons within the atom normally exist in a ground state (0 eV). 
                      When they are given enough energy, they jump up to an excited energy state.
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-semibold text-orange-700 mb-2">Energy Below 4.9 eV:</h5>
                        <p className="text-gray-700 text-sm">
                          When the energy of the incident electrons was less than 4.9 eV, they simply bounced off any 
                          mercury atoms they encountered with no loss of energy and continued on as part of the current.
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-semibold text-orange-700 mb-2">Energy at 4.9 eV:</h5>
                        <p className="text-gray-700 text-sm">
                          Those electrons with an energy of 4.9 eV that collided with a mercury atom transferred all of 
                          their energy to the mercury atom and, therefore, with no energy remaining, did not reach the plate.
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-semibold text-orange-700 mb-2">Higher Energy Levels:</h5>
                        <p className="text-gray-700 text-sm">
                          At energies greater than 4.9 eV, electrons colliding with mercury atoms can give up 4.9 eV in the collision 
                          and still move off with the remaining energy and reach the plate. Only certain excitation energy levels 
                          are allowed – i.e. electrons can only absorb specific amounts of energy.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Light Emission */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                    <h4 className="font-semibold text-red-800 mb-3">💡 Light Emission from Excited Mercury</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      As the experiment progressed Franck and Hertz also noted that the mercury vapour began to emit light. 
                      The next step in their experiment was to measure the wavelength of the light emitted by the excited mercury atoms.
                    </p>
                    <div className="bg-white p-3 rounded border border-red-300 mb-3">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Observed Wavelengths:</strong> When the input electron had energy of 9.00 eV, the mercury vapour 
                        released photons that produced spectral lines at 686.8 nm, 572.9 nm, 312.3 nm, 254.2 nm, 186.4 nm and 140.6 nm.
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-red-300">
                      <p className="text-gray-700 text-sm">
                        Using Planck's equation, the energies of each of these wavelengths could be calculated. For example, 
                        for the 254.2 nm light: E = hc/λ = (4.14 × 10⁻¹⁵ eV·s)(3.00 × 10⁸ m/s)/(254.2 × 10⁻⁹ m) = 4.89 eV
                      </p>
                    </div>
                  </div>

                  {/* Energy Level Diagram */}
                  <ExcitationStatesComponent />

                  {/* Complete Energy Analysis */}
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200 mt-6">
                    <h4 className="font-semibold text-cyan-800 mb-3">📈 Complete Energy Level Analysis</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Franck and Hertz interpreted the energies and wavelengths as the result of jumps of mercury atom 
                      electrons falling from excitation states down toward the ground state. As the electron falls or 
                      de-excites back toward the ground state, it releases its energy in the form of a photon.
                    </p>
                    <div className="bg-white p-3 rounded border border-cyan-300 mb-3">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Photon Energy Formula:</strong> In general, the photon's energy is determined by the difference 
                        in the initial (higher) and final (lower) energy levels:
                      </p>
                      <div className="text-center p-2 bg-cyan-100 rounded">
                        <InlineMath math="E_{photon} = E_i - E_f" />
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded border border-cyan-300">
                      <p className="text-gray-700 text-sm">
                        The wavelength or frequency of the photon may be calculated using Planck's equation. The remaining 
                        wavelength/energy pairs above can be explained by intermediate jumps to lower energy states. For example, 
                        an electron in the third excitation state could fall to the second level before falling to the ground state.
                      </p>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mt-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">🎯 Key Discoveries</h4>
                    <div className="space-y-2">
                      <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                        <strong>Quantized Energy Levels:</strong> Atoms can only absorb and emit specific, discrete amounts of energy
                      </div>
                      <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                        <strong>Ground and Excited States:</strong> Electrons exist in specific energy levels within atoms
                      </div>
                      <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                        <strong>Energy Conservation:</strong> Absorbed energy equals emitted photon energy during de-excitation
                      </div>
                      <div className="bg-white p-2 rounded border border-yellow-300 text-sm">
                        <strong>Spectral Line Origin:</strong> Each spectral line corresponds to a specific electron energy transition
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="summary" title="Summary: Absorption of Spectra and Excitation States" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  {/* Two Ways of Energy Absorption */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">🔋 Two Ways Atoms Absorb Energy</h4>
                    <div className="space-y-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">1. By Collisions with High Energy Electrons</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          In these collisions the electron in the atom absorbs only the amount of energy corresponding 
                          to a jump from the ground state to an excitation state. The incoming electron continues on 
                          with the remaining energy.
                        </p>
                        <div className="bg-green-100 p-2 rounded text-sm">
                          <strong>Example:</strong> A 6.00 eV incoming electron colliding with a mercury atom will lose 
                          4.89 eV to the atom and then continue on with an energy of 1.11 eV. Note, for this type of 
                          energy absorption, the incoming particle need only have an energy greater than the first 
                          excitation energy.
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-semibold text-green-700 mb-2">2. By Absorbing a Photon</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          In this case, the atom will absorb only those photons that have energies that exactly match 
                          the excitation state energies. Since electrons normally reside in the ground state, this 
                          means that it will absorb only those photons that match its excitation states from the ground level.
                        </p>
                        <div className="bg-green-100 p-2 rounded text-sm">
                          <strong>Result:</strong> Therefore, when full spectrum white light is sent through a gas, only 
                          those wavelengths of light that correspond to the excitation states of the gas are absorbed 
                          by the gas. The remaining wavelengths simply pass through the gas. This explains the dark 
                          lines for absorption spectra.
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Release of Energy */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                    <h4 className="font-semibold text-orange-800 mb-3">💡 Release of Energy</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Once atoms have been excited they will eventually fall back to the ground state. Some atoms, 
                      for example hydrogen, will return to the ground state immediately after being excited. Other 
                      atoms, like phosphorous, can stay in an excited state for hours before returning to the ground state.
                    </p>
                    <div className="bg-white p-3 rounded border border-orange-300">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Why Glow-in-the-Dark Paint Works:</strong> This is why diverswatches have phosphorous 
                        paint numbers – they will continue to emit light for hours.
                      </p>
                    </div>
                  </div>

                  {/* Two Ways of Falling Back */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">⬇️ Atoms Can Fall Back to Ground State in Two Ways</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-semibold text-purple-700 mb-2">Direct Jump</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          The atom can fall straight back to the ground state from the excitation state. 
                          In this case, one high energy photon is emitted.
                        </p>
                        <div className="text-center p-2 bg-purple-100 rounded">
                          <span className="text-sm font-mono">n=3 → n=0</span>
                          <br />
                          <span className="text-xs">One photon emitted</span>
                        </div>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-semibold text-purple-700 mb-2">Step-by-Step Cascade</h5>
                        <p className="text-gray-700 text-sm mb-2">
                          The atom can fall through a series of intermediate excitation states to the ground state. 
                          In this case, several lower energy photons will be emitted.
                        </p>
                        <div className="text-center p-2 bg-purple-100 rounded">
                          <span className="text-sm font-mono">n=3 → n=2 → n=1 → n=0</span>
                          <br />
                          <span className="text-xs">Multiple photons emitted</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Energy Level Diagram with Transitions */}
                  <div className="bg-black rounded p-4 mb-6">
                    <svg width="500" height="300" className="w-full">
                      {/* Energy levels */}
                      <line x1="50" y1="250" x2="200" y2="250" stroke="#2ECC71" strokeWidth="3" />
                      <text x="210" y="255" fill="#2ECC71" fontSize="12" fontWeight="bold">0 eV (Ground)</text>
                      
                      <line x1="50" y1="190" x2="200" y2="190" stroke="#3498DB" strokeWidth="3" />
                      <text x="210" y="195" fill="#3498DB" fontSize="12" fontWeight="bold">4.89 eV</text>
                      
                      <line x1="50" y1="140" x2="200" y2="140" stroke="#9B59B6" strokeWidth="3" />
                      <text x="210" y="145" fill="#9B59B6" fontSize="12" fontWeight="bold">6.67 eV</text>
                      
                      <line x1="50" y1="90" x2="200" y2="90" stroke="#E74C3C" strokeWidth="3" />
                      <text x="210" y="95" fill="#E74C3C" fontSize="12" fontWeight="bold">8.84 eV</text>

                      {/* Absorption arrows (incoming) */}
                      <defs>
                        <marker id="arrowUp" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#FFD700" />
                        </marker>
                        <marker id="arrowDown" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#FF6B6B" />
                        </marker>
                      </defs>
                      
                      {/* Incoming photons */}
                      <line x1="20" y1="220" x2="35" y2="205" stroke="#FFD700" strokeWidth="2" markerEnd="url(#arrowUp)" />
                      <text x="10" y="235" fill="#FFD700" fontSize="10">177 nm</text>
                      <text x="10" y="245" fill="#FFD700" fontSize="9">(7.00 eV)</text>
                      
                      <line x1="20" y1="200" x2="35" y2="185" stroke="#FFD700" strokeWidth="2" markerEnd="url(#arrowUp)" />
                      <text x="10" y="215" fill="#FFD700" fontSize="10">207 nm</text>
                      <text x="10" y="225" fill="#FFD700" fontSize="9">(6.00 eV)</text>
                      
                      <line x1="20" y1="180" x2="35" y2="165" stroke="#FFD700" strokeWidth="2" markerEnd="url(#arrowUp)" />
                      <text x="10" y="195" fill="#FFD700" fontSize="10">186 nm</text>
                      <text x="10" y="205" fill="#FFD700" fontSize="9">(6.67 eV)</text>

                      {/* Outgoing photons */}
                      <line x1="240" y1="105" x2="255" y2="120" stroke="#FF6B6B" strokeWidth="2" markerEnd="url(#arrowDown)" />
                      <text x="260" y="95" fill="#FF6B6B" fontSize="10">140.6 nm</text>
                      <text x="260" y="105" fill="#FF6B6B" fontSize="9">(8.84 eV)</text>
                      
                      <line x1="240" y1="155" x2="255" y2="170" stroke="#FF6B6B" strokeWidth="2" markerEnd="url(#arrowDown)" />
                      <text x="260" y="145" fill="#FF6B6B" fontSize="10">186.4 nm</text>
                      <text x="260" y="155" fill="#FF6B6B" fontSize="9">(6.67 eV)</text>
                      
                      <line x1="240" y1="205" x2="255" y2="220" stroke="#FF6B6B" strokeWidth="2" markerEnd="url(#arrowDown)" />
                      <text x="260" y="195" fill="#FF6B6B" fontSize="10">254.2 nm</text>
                      <text x="260" y="205" fill="#FF6B6B" fontSize="9">(4.89 eV)</text>
                      
                      <line x1="240" y1="125" x2="255" y2="140" stroke="#FF6B6B" strokeWidth="2" markerEnd="url(#arrowDown)" />
                      <text x="260" y="115" fill="#FF6B6B" fontSize="10">572.9 nm</text>
                      <text x="260" y="125" fill="#FF6B6B" fontSize="9">(2.17 eV)</text>

                      {/* Labels */}
                      <text x="25" y="30" fill="#FFD700" fontSize="14" fontWeight="bold">Incoming</text>
                      <text x="25" y="45" fill="#FFD700" fontSize="14" fontWeight="bold">Photons</text>
                      <text x="270" y="30" fill="#FF6B6B" fontSize="14" fontWeight="bold">Outgoing</text>
                      <text x="270" y="45" fill="#FF6B6B" fontSize="14" fontWeight="bold">Photons</text>
                    </svg>
                  </div>

                  {/* Emission vs Absorption Explanation */}
                  <div className="bg-cyan-50 p-4 rounded-lg border border-cyan-200">
                    <h4 className="font-semibold text-cyan-800 mb-3">🔄 Why Emission and Absorption Spectra Differ</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      The emission of photons when atoms fall back toward the ground state explains two things about emission spectra:
                    </p>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-cyan-300">
                        <h5 className="font-semibold text-cyan-700 mb-2">1. Spectral Line Matching:</h5>
                        <p className="text-gray-700 text-sm">
                          Bright lines of emission spectra correspond with the dark lines of absorption spectra 
                          for the same element or molecule.
                        </p>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-cyan-300">
                        <h5 className="font-semibold text-cyan-700 mb-2">2. More Lines in Emission:</h5>
                        <p className="text-gray-700 text-sm">
                          The presence of more lines in emission spectra compared to absorption spectra can be 
                          explained by the intermediate jumps that can occur when atoms fall toward their ground state.
                        </p>
                      </div>
                    </div>
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

      {/* Slideshow Knowledge Check */}
      <div className="mt-8">
        <SlideshowKnowledgeCheck
          courseId={courseId}
          lessonPath="57-light-spectra-excitation"
          course={course}
          itemConfig={itemConfig}
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question1',
              title: 'Question 1: Continuous Spectrum Source'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question2',
              title: 'Question 2: Emission Spectrum Source'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question3',
              title: 'Question 3: Spectral Identification'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question4',
              title: 'Question 4: Absorption Spectrum'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question5',
              title: 'Question 5: Franck-Hertz Significance'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question6',
              title: 'Question 6: Ground State Definition'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question7',
              title: 'Question 7: Excitation States'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question8',
              title: 'Question 8: Ionization Energy'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question9',
              title: 'Question 9: Photon Frequency Calculation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question10',
              title: 'Question 10: Elastic Collision Energy'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question11',
              title: 'Question 11: Multiple Collision Energies'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question12',
              title: 'Question 12: Energy Level Analysis'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question13',
              title: 'Question 13: Excited State Decay'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question14',
              title: 'Question 14: Absorption Mechanism'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question15',
              title: 'Question 15: Gas Visibility'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question16',
              title: 'Question 16: Emission vs Absorption Lines'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question17',
              title: 'Question 17: Mercury Excitation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question18',
              title: 'Question 18: Photon Energy Matching'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question19',
              title: 'Question 19: Dark Absorption Lines'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question20',
              title: 'Question 20: UV Emission Energies'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question21',
              title: 'Question 21: Sodium D-line Energy'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question22',
              title: 'Question 22: Elastic Collision Threshold'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question23',
              title: 'Question 23: Mercury Photon Energies'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_57_question24',
              title: 'Question 24: Red Light Energy Loss'
            }
          ]}
          title="🌈 Light Spectra & Excitation Knowledge Check"
          subtitle="Test your understanding of spectroscopy, quantum energy levels, and the Franck-Hertz experiment"
        />
      </div>

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Light spectra reveal atomic structure through characteristic wavelengths emitted and absorbed by elements",
            "Thomas Melvill (1752) discovered that heated gases produce unique bright-line emission spectra for each element",
            "Fraunhofer discovered dark absorption lines in solar spectra, revealing the sun's chemical composition",
            "The Franck-Hertz experiment (1914) proved atoms absorb energy only in discrete, quantized amounts",
            "Mercury atoms absorb specific energies: 4.89 eV, 6.67 eV, 8.84 eV, corresponding to excitation levels",
            "Atoms can absorb energy through electron collisions or photon absorption with exact energy matches",
            "Excited atoms fall back to ground state either directly (one photon) or through cascades (multiple photons)",
            "Emission spectra have more lines than absorption spectra due to intermediate energy level transitions",
            "Each spectral line corresponds to a specific electron energy transition: E_photon = E_initial - E_final",
            "Spectral analysis allows determination of chemical composition of distant stars and galaxies",
            "Quantized energy levels explain why atoms emit and absorb only specific wavelengths of light",
            "The work of Planck, Einstein, Franck, and Hertz established the quantum nature of atomic energy",
            "Phosphorescent materials stay excited for hours, explaining glow-in-the-dark applications",
            "Spectroscopy connects quantum mechanics to observable astronomical phenomena"
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