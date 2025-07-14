import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode, AIAccordion, onAIAccordionContent }) => {
  // Interactive Thomson Experiment Animation
  const ThomsonExperimentAnimation = () => {
    const [showElectricField, setShowElectricField] = useState(true);
    const [showMagneticField, setShowMagneticField] = useState(false);
    
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Interactive Thomson Experiment</h4>
        
        {/* Control buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => {setShowElectricField(!showElectricField)}}
            className={`px-3 py-1 rounded text-sm ${showElectricField ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
          >
            Electric Field {showElectricField ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {setShowMagneticField(!showMagneticField)}}
            className={`px-3 py-1 rounded text-sm ${showMagneticField ? 'bg-purple-500 text-white' : 'bg-gray-600 text-white'}`}
          >
            Magnetic Field {showMagneticField ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <svg width="100%" height="250" viewBox="0 0 600 250" className="bg-gray-800 rounded">
          {/* Thomson's apparatus outline */}
          <rect x="20" y="80" width="560" height="90" fill="none" stroke="#4A90E2" strokeWidth="3" rx="10" />
          
          {/* Cathode */}
          <rect x="30" y="110" width="8" height="30" fill="#FF6B6B" />
          <text x="25" y="105" fill="#FF6B6B" fontSize="10" textAnchor="middle">Cathode</text>
          
          {/* Anode with hole */}
          <rect x="150" y="110" width="8" height="30" fill="#4ECDC4" />
          <rect x="155" y="123" width="6" height="4" fill="#000" />
          <text x="154" y="105" fill="#4ECDC4" fontSize="10" textAnchor="middle">Anode</text>
          
          {/* Electric Field Plates */}
          {showElectricField && (
            <>
              <rect x="250" y="95" width="120" height="8" fill="#FFD93D" opacity="0.8" />
              <rect x="250" y="147" width="120" height="8" fill="#FFD93D" opacity="0.8" />
              <text x="310" y="90" fill="#FFD93D" fontSize="12" textAnchor="middle">+ Electric Field +</text>
              <text x="310" y="170" fill="#FFD93D" fontSize="12" textAnchor="middle">- Electric Field -</text>
              
              {/* Electric field lines */}
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <line 
                  key={`e-${i}`}
                  x1={260 + i * 20} 
                  y1={103} 
                  x2={260 + i * 20} 
                  y2={147} 
                  stroke="#FFD93D" 
                  strokeWidth="1" 
                  opacity="0.6"
                />
              ))}
            </>
          )}
          
          {/* Magnetic Field */}
          {showMagneticField && (
            <>
              <text x="310" y="60" fill="#8B5CF6" fontSize="12" textAnchor="middle">⊗ Magnetic Field ⊗</text>
              {/* Magnetic field indicators (into the page) */}
              {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                <g key={`m-${i}`}>
                  <circle cx={270 + (i % 4) * 25} cy={115 + Math.floor(i/4) * 20} r="3" fill="#8B5CF6" opacity="0.6" />
                  <text x={270 + (i % 4) * 25} y={118 + Math.floor(i/4) * 20} fill="white" fontSize="8" textAnchor="middle">⊗</text>
                </g>
              ))}
            </>
          )}
          
          {/* Cathode ray beam */}
          <line x1="38" y1="125" x2={showElectricField ? "250" : "520"} y2="125" stroke="#00FF00" strokeWidth="3" opacity="0.8" />
          
          {/* Deflected beam when electric field is on */}
          {showElectricField && (
            <path 
              d="M 250 125 Q 310 110 370 125" 
              fill="none" 
              stroke="#00FF00" 
              strokeWidth="3" 
              opacity="0.8"
            />
          )}
          
          {/* Screen */}
          <rect x="520" y="70" width="10" height="110" fill="#95E1D3" opacity="0.7" />
          <text x="525" y="190" fill="#95E1D3" fontSize="10" textAnchor="middle">Screen</text>
          
          {/* Impact point on screen */}
          <circle 
            cx="525" 
            cy={showElectricField ? 115 : 125} 
            r="4" 
            fill="#FF4444" 
            opacity="0.9"
          />
        </svg>
        
        <div className="mt-4 text-white text-sm">
          <p><strong>Observation:</strong> {showElectricField ? 'The cathode ray beam is deflected by the electric field!' : 'The cathode ray travels in a straight line.'}</p>
          {showMagneticField && <p><strong>With Magnetic Field:</strong> The beam would also be deflected by the magnetic field (perpendicular to electric deflection).</p>}
        </div>
      </div>
    );
  };

  // Cathode Ray Tube Animation Component
  const CathodeRayTubeAnimation = () => {
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Cathode Ray Tube</h4>
        
        <svg width="100%" height="150" viewBox="0 0 500 150" className="bg-gray-800 rounded">
          {/* Glass tube outline */}
          <ellipse
            cx="250"
            cy="75"
            rx="240"
            ry="50"
            fill="none"
            stroke="#87CEEB"
            strokeWidth="3"
            opacity="0.7"
          />
          
          {/* Cathode (negative electrode) */}
          <rect
            x="20"
            y="80"
            width="8"
            height="40"
            fill="#FF6B6B"
          />
          <text x="15" y="55" fill="#FF6B6B" fontSize="12" textAnchor="middle">
            Cathode (-)
          </text>
          
          {/* Anode (positive electrode) */}
          <rect
            x="470"
            y="80"
            width="8"
            height="40"
            fill="#4ECDC4"
          />
          <text x="475" y="55" fill="#4ECDC4" fontSize="12" textAnchor="middle">
            Anode (+)
          </text>
          
          {/* Metal foil (for Goldstein's experiment) */}
          <rect
            x="200"
            y="85"
            width="2"
            height="30"
            fill="#FFD93D"
          />
          <text x="205" y="80" fill="#FFD93D" fontSize="10">
            Metal Foil
          </text>
          
          {/* Fluorescent screen */}
          <rect
            x="450"
            y="70"
            width="15"
            height="60"
            fill="#95E1D3"
            opacity="0.7"
          />
          <text x="458" y="165" fill="#95E1D3" fontSize="10" textAnchor="middle">
            Screen
          </text>
          
          {/* Animated cathode ray particles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={40 + i * 80}
              cy="100"
              r="3"
              fill="#00FF00"
              opacity={0.8 - i * 0.15}
            >
              <animateTransform
                attributeName="transform"
                attributeType="XML"
                type="translate"
                values="0,0; 400,0"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.4}s`}
              />
            </circle>
          ))}
          
          {/* Cathode ray beam line */}
          <line
            x1="28"
            y1="100"
            x2="450"
            y2="100"
            stroke="#00FF00"
            strokeWidth="2"
            opacity="0.5"
            strokeDasharray="5,5"
          />
          
          {/* Glow on fluorescent screen */}
          <circle
            cx="458"
            cy="100"
            r="8"
            fill="#95E1D3"
            opacity="0.6"
          >
            <animate
              attributeName="opacity"
              values="0.3;0.9;0.3"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
        
        <div className="mt-4 text-white text-sm">
          <p><strong>What you see:</strong> Green particles (cathode rays) traveling from the negative cathode to the positive anode, causing the fluorescent screen to glow.</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cathode Rays</h1>
      
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="cathode-ray-research" title="Cathode Ray Tube Research" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Many people experimented with various gas-discharge tubes which were attached to 
                    high voltage induction coils. A major difficulty was that air in the tubes effectively 
                    stopped particles from reaching the anode from the cathode.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    When the technology had improved to the point where most of the air could be 
                    evacuated from the tube, they discovered some interesting things.
                  </p>

                  {/* Insert the animated cathode ray tube */}
                  <CathodeRayTubeAnimation />
                  
                  {/* Key Features of Cathode Ray Tubes */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-2">🔬 Key Features of the Cathode Ray Tube</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700"><strong>Glass tube</strong> with most air evacuated (creating a vacuum)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700"><strong>Cathode (negative electrode)</strong> - where the ray originates</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700"><strong>Anode (positive electrode)</strong> - attracts the cathode ray</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700"><strong>Fluorescent screen</strong> - glows when hit by cathode rays</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700"><strong>High voltage source</strong> - creates the electric field to accelerate particles</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="goldstein" title="Goldstein's Canal Ray Discovery (1886)" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Eugen Goldstein (1850-1930) performed a modification of the cathode ray tube experiment. 
                    He used a cathode that was perforated (had holes). When he looked behind the cathode, 
                    he observed rays traveling in the opposite direction to the cathode rays.
                  </p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">🔍 Goldstein's Key Discovery</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Canal rays (later called positive rays) traveled through the holes in the perforated cathode, 
                      moving in the opposite direction to cathode rays.
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span><strong>Cathode rays:</strong> Negative particles moving toward the anode</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span><strong>Canal rays:</strong> Positive particles moving toward the cathode</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">💡 What This Meant</h4>
                    <p className="text-gray-700 text-sm">
                      Goldstein's experiment provided the first evidence that atoms contained both negative 
                      and positive particles. This was a crucial step toward understanding atomic structure, 
                      as it showed that atoms weren't indivisible as Dalton had proposed.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="crookes" title="William Crookes' Experiments (1870s)" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Sir William Crookes (1832-1919) conducted extensive experiments with cathode ray tubes, 
                    which became known as "Crookes tubes." His work established many fundamental properties 
                    of cathode rays.
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">🧪 Crookes' Key Experiments</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-purple-700 mb-1">Paddle Wheel Experiment:</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Placed a small paddle wheel in the tube</li>
                          <li>• Cathode rays made the wheel spin</li>
                          <li>• Proved cathode rays carry momentum</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-700 mb-1">Shadow Experiment:</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Placed objects in the cathode ray path</li>
                          <li>• Sharp shadows appeared on the screen</li>
                          <li>• Showed cathode rays travel in straight lines</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Crookes' Conclusions</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">Cathode rays are streams of particles, not electromagnetic waves</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">These particles have mass and carry momentum</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">They travel in straight lines from cathode to anode</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">The particles cause fluorescence when they hit certain materials</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="thomson" title="J.J. Thomson's Electron Discovery (1897)" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Joseph John Thomson (1856-1940) performed the definitive experiments that identified 
                    the cathode ray particles as electrons and measured their charge-to-mass ratio. 
                    His work earned him the 1906 Nobel Prize in Physics.
                  </p>
                  
                  <ThomsonExperimentAnimation />
                  
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mb-4">
                    <h4 className="font-semibold text-emerald-800 mb-2">⚡ Thomson's Experimental Setup</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Thomson used both electric and magnetic fields to deflect cathode rays and measure 
                      the charge-to-mass ratio of the particles:
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="font-bold text-emerald-600 min-w-[20px]">1.</span>
                        <span className="text-gray-700">Applied only an electric field - cathode rays deflected toward positive plate</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-emerald-600 min-w-[20px]">2.</span>
                        <span className="text-gray-700">Applied only a magnetic field - cathode rays deflected perpendicular to field</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-emerald-600 min-w-[20px]">3.</span>
                        <span className="text-gray-700">Applied both fields simultaneously - adjusted to make the beam travel straight</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-emerald-600 min-w-[20px]">4.</span>
                        <span className="text-gray-700">Calculated e/m ratio from the field strengths and deflections</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">🏆 Thomson's Revolutionary Discovery</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Thomson's measurements showed that the charge-to-mass ratio (e/m) of cathode ray 
                      particles was about 1000 times larger than that of hydrogen ions:
                    </p>
                    <div className="bg-white p-3 rounded border border-red-200">
                      <p className="text-center font-mono text-sm mb-2">
                        <InlineMath math="e/m \text{ (cathode rays) } \approx 1.76 \times 10^{11} \text{ C/kg}" />
                      </p>
                      <p className="text-center font-mono text-sm">
                        <InlineMath math="e/m \text{ (hydrogen) } \approx 9.6 \times 10^{7} \text{ C/kg}" />
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm mt-3">
                      This meant either the particles had a much smaller mass than hydrogen atoms, 
                      or a much larger charge. Thomson concluded they were fundamental particles 
                      much smaller than atoms - he called them "electrons."
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Calculating Electron Speed" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    In Thomson's experiment, electrons are accelerated through a potential difference of 2000 V. 
                    What is the final speed of the electrons? (Assume electrons start from rest)
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Given:</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Potential difference: <InlineMath math="V = 2000 \text{ V}" /></li>
                      <li>• Initial velocity: <InlineMath math="v_0 = 0" /></li>
                      <li>• Electron mass: <InlineMath math="m_e = 9.11 \times 10^{-31} \text{ kg}" /></li>
                      <li>• Electron charge: <InlineMath math="e = 1.60 \times 10^{-19} \text{ C}" /></li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <h5 className="font-semibold text-green-800 mb-2">Solution:</h5>
                    <div className="space-y-3 text-sm">
                      <p>Use conservation of energy. The electrical potential energy is converted to kinetic energy:</p>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-center mb-2"><InlineMath math="eV = \frac{1}{2}mv^2" /></p>
                        <p className="text-center mb-2"><InlineMath math="v = \sqrt{\frac{2eV}{m}}" /></p>
                        <p className="text-center mb-2">
                          <InlineMath math="v = \sqrt{\frac{2 \times 1.60 \times 10^{-19} \times 2000}{9.11 \times 10^{-31}}}" />
                        </p>
                        <p className="text-center mb-2">
                          <InlineMath math="v = \sqrt{\frac{6.40 \times 10^{-16}}{9.11 \times 10^{-31}}}" />
                        </p>
                        <p className="text-center font-bold">
                          <InlineMath math="v = 2.65 \times 10^7 \text{ m/s}" />
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2">Answer:</h5>
                    <p className="text-sm">
                      The electrons reach a speed of <strong>2.65 × 10⁷ m/s</strong>, which is about 
                      <strong>8.8% the speed of light</strong>! This high speed explains why cathode rays 
                      could penetrate thin materials and create such dramatic effects in the tube.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Electric Field Deflection" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    An electron beam travels horizontally at 2.0 × 10⁶ m/s into a uniform electric field 
                    of strength 1.0 × 10⁴ N/C pointing vertically downward. The field extends for 5.0 cm 
                    in the horizontal direction. How far is the beam deflected vertically?
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Given:</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Horizontal velocity: <InlineMath math="v_x = 2.0 \times 10^6 \text{ m/s}" /></li>
                      <li>• Electric field: <InlineMath math="E = 1.0 \times 10^4 \text{ N/C}" /> (downward)</li>
                      <li>• Field length: <InlineMath math="L = 5.0 \text{ cm} = 0.050 \text{ m}" /></li>
                      <li>• Electron mass: <InlineMath math="m_e = 9.11 \times 10^{-31} \text{ kg}" /></li>
                      <li>• Electron charge: <InlineMath math="e = 1.60 \times 10^{-19} \text{ C}" /></li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <h5 className="font-semibold text-green-800 mb-2">Solution:</h5>
                    <div className="space-y-3 text-sm">
                      <p><strong>Step 1:</strong> Find the time the electron spends in the field</p>
                      <div className="bg-white p-3 rounded border border-green-300 mb-3">
                        <p className="text-center mb-2"><InlineMath math="t = \frac{L}{v_x} = \frac{0.050}{2.0 \times 10^6} = 2.5 \times 10^{-8} \text{ s}" /></p>
                      </div>
                      
                      <p><strong>Step 2:</strong> Find the vertical acceleration (force upward on negative electron)</p>
                      <div className="bg-white p-3 rounded border border-green-300 mb-3">
                        <p className="text-center mb-2"><InlineMath math="F = eE = 1.60 \times 10^{-19} \times 1.0 \times 10^4 = 1.60 \times 10^{-15} \text{ N}" /></p>
                        <p className="text-center mb-2"><InlineMath math="a = \frac{F}{m} = \frac{1.60 \times 10^{-15}}{9.11 \times 10^{-31}} = 1.76 \times 10^{15} \text{ m/s}^2" /></p>
                      </div>
                      
                      <p><strong>Step 3:</strong> Find the vertical deflection</p>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-center mb-2"><InlineMath math="y = \frac{1}{2}at^2 = \frac{1}{2} \times 1.76 \times 10^{15} \times (2.5 \times 10^{-8})^2" /></p>
                        <p className="text-center font-bold"><InlineMath math="y = 5.5 \times 10^{-4} \text{ m} = 0.55 \text{ mm}" /></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2">Answer:</h5>
                    <p className="text-sm">
                      The electron beam is deflected vertically by <strong>0.55 mm</strong> upward 
                      (opposite to the electric field direction, since electrons are negatively charged).
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="millikan" title="Millikan's Oil Drop Experiment (1909)" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Robert Millikan (1868-1953) designed a brilliant experiment to measure the actual 
                    charge of an electron. Thomson had only measured the e/m ratio; Millikan found 
                    the charge itself, allowing the electron mass to be calculated.
                  </p>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">🔬 Millikan's Experimental Design</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-purple-700 mb-2">Setup:</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Tiny oil droplets sprayed between charged plates</li>
                          <li>• Droplets became charged by friction or X-rays</li>
                          <li>• Observed droplets through a microscope</li>
                          <li>• Adjusted electric field strength</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-purple-700 mb-2">Key Observation:</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• Droplets could be made to float motionless</li>
                          <li>• Electric force balanced gravitational force</li>
                          <li>• Charge always came in integer multiples</li>
                          <li>• Found the fundamental unit of charge</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                    <h4 className="font-semibold text-orange-800 mb-2">⚖️ Force Balance Equation</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      When a charged oil droplet is suspended motionless, the electric force equals the gravitational force:
                    </p>
                    <div className="bg-white p-3 rounded border border-orange-300">
                      <p className="text-center mb-2"><InlineMath math="F_E = F_g" /></p>
                      <p className="text-center mb-2"><InlineMath math="qE = mg" /></p>
                      <p className="text-center font-bold"><InlineMath math="q = \frac{mg}{E}" /></p>
                    </div>
                    <p className="text-gray-700 text-sm mt-3">
                      By measuring the droplet mass (from its terminal velocity in air) and the 
                      electric field strength needed to suspend it, Millikan could calculate the charge.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🏆 Millikan's Nobel Prize Discovery</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Millikan's measurements revealed that charge is quantized - it always comes in 
                      integer multiples of a fundamental unit:
                    </p>
                    <div className="bg-white p-3 rounded border border-green-300 mb-3">
                      <p className="text-center font-bold text-lg">
                        <InlineMath math="e = 1.60 \times 10^{-19} \text{ C}" />
                      </p>
                    </div>
                    <p className="text-gray-700 text-sm">
                      This allowed him to calculate the electron mass using Thomson's e/m ratio:
                    </p>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-center">
                        <InlineMath math="m_e = \frac{e}{e/m} = \frac{1.60 \times 10^{-19}}{1.76 \times 10^{11}} = 9.11 \times 10^{-31} \text{ kg}" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Millikan's Oil Drop Calculation" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    In Millikan's experiment, an oil droplet with mass 3.2 × 10⁻¹⁵ kg is suspended 
                    motionless in an electric field of strength 2.0 × 10⁵ N/C pointing downward. 
                    How many excess electrons does the droplet carry?
                  </p>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Given:</h5>
                    <ul className="text-sm space-y-1">
                      <li>• Droplet mass: <InlineMath math="m = 3.2 \times 10^{-15} \text{ kg}" /></li>
                      <li>• Electric field: <InlineMath math="E = 2.0 \times 10^5 \text{ N/C}" /> (downward)</li>
                      <li>• Droplet is motionless (forces balanced)</li>
                      <li>• <InlineMath math="g = 9.8 \text{ m/s}^2" /></li>
                      <li>• <InlineMath math="e = 1.60 \times 10^{-19} \text{ C}" /></li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                    <h5 className="font-semibold text-green-800 mb-2">Solution:</h5>
                    <div className="space-y-3 text-sm">
                      <p><strong>Step 1:</strong> For the droplet to be suspended, the electric force must balance gravity</p>
                      <div className="bg-white p-3 rounded border border-green-300 mb-3">
                        <p className="text-center mb-2"><InlineMath math="F_E = F_g" /></p>
                        <p className="text-center mb-2"><InlineMath math="qE = mg" /></p>
                      </div>
                      
                      <p><strong>Step 2:</strong> Since the field points down and the droplet is suspended, the droplet must be negatively charged (force upward)</p>
                      <div className="bg-white p-3 rounded border border-green-300 mb-3">
                        <p className="text-center mb-2"><InlineMath math="q = \frac{mg}{E} = \frac{3.2 \times 10^{-15} \times 9.8}{2.0 \times 10^5}" /></p>
                        <p className="text-center mb-2"><InlineMath math="q = \frac{3.14 \times 10^{-14}}{2.0 \times 10^5} = 1.57 \times 10^{-19} \text{ C}" /></p>
                      </div>
                      
                      <p><strong>Step 3:</strong> Find the number of excess electrons</p>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-center mb-2"><InlineMath math="n = \frac{q}{e} = \frac{1.57 \times 10^{-19}}{1.60 \times 10^{-19}} = 0.98 \approx 1" /></p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h5 className="font-semibold text-yellow-800 mb-2">Answer:</h5>
                    <p className="text-sm">
                      The oil droplet carries <strong>1 excess electron</strong>. This demonstrates 
                      Millikan's key finding that charge is quantized - it always comes in integer 
                      multiples of the elementary charge.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 p-4 bg-gray-100 rounded">
            This lesson contains interactive content that requires the AI-enhanced accordion feature.
          </p>
        </div>
      )}

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Cathode ray tubes revealed the existence of subatomic particles when air was evacuated from glass tubes with high voltage electrodes",
            "Eugen Goldstein (1886) discovered canal rays (positive particles) moving in the opposite direction to cathode rays, showing atoms contain both positive and negative charges",
            "William Crookes (1870s) proved cathode rays are streams of particles with mass and momentum through paddle wheel and shadow experiments",
            "J.J. Thomson (1897) used electric and magnetic fields to measure the charge-to-mass ratio of cathode ray particles, discovering they were much smaller than atoms",
            "Thomson identified cathode ray particles as 'electrons' - fundamental negatively charged particles that are components of all atoms",
            "Robert Millikan (1909) measured the exact charge of an electron using suspended oil droplets in an electric field, showing charge is quantized",
            "Millikan's oil drop experiment determined e = 1.60 × 10⁻¹⁹ C, allowing calculation of electron mass: mₑ = 9.11 × 10⁻³¹ kg",
            "These experiments proved atoms are not indivisible as Dalton proposed, but contain smaller charged particles, revolutionizing atomic theory"
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