import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ParallelPlates = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {
  const [animationState, setAnimationState] = useState('initial'); // 'initial', 'charging', 'charged'
  const [showBattery, setShowBattery] = useState(false);
  const [milliklanAnimationState, setMillikanAnimationState] = useState('off'); // 'off', 'spraying', 'balancing'
  const [voltage, setVoltage] = useState(0);
  const [dropletPosition, setDropletPosition] = useState(150);

  const handleStartAnimation = () => {
    setShowBattery(true);
    setAnimationState('charging');
    
    // After 2 seconds, complete the charging animation
    setTimeout(() => {
      setAnimationState('charged');
    }, 2000);
  };

  const handleReset = () => {
    setAnimationState('initial');
    setShowBattery(false);
  };

  const handleMillikanSpray = () => {
    setMillikanAnimationState('spraying');
    setDropletPosition(180);
    setTimeout(() => {
      setMillikanAnimationState('falling');
      setDropletPosition(150);
    }, 1000);
  };

  const handleVoltageChange = (newVoltage) => {
    setVoltage(newVoltage);
    if (newVoltage >= 800) {
      setMillikanAnimationState('balanced');
      setDropletPosition(150);
    } else if (newVoltage > 0) {
      setMillikanAnimationState('slowing');
      setDropletPosition(140);
    } else {
      setMillikanAnimationState('falling');
      setDropletPosition(160);
    }
  };

  const handleMillikanReset = () => {
    setMillikanAnimationState('off');
    setVoltage(0);
    setDropletPosition(150);
  };

  return (
    <LessonContent
      lessonId="lesson_31_parallel_plates"
      title="Lesson 17 - Parallel Plates"
      metadata={{ estimated_time: '40 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="parallel-plates" title="Parallel Plates − Uniform Electric Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  When two metallic plates are set a distance apart and are then hooked up to a potential
                  difference, a battery in this case, one plate will have a positive charge and the other
                  plate will have a negative charge.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Interactive: Parallel Plate Capacitor Formation</h4>
                  
                  <div className="flex justify-center mb-4">
                    <svg width="600" height="350" viewBox="0 0 600 350" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Left plate */}
                      <rect x="150" y="80" width="20" height="180" 
                        fill={animationState === 'charged' ? '#dc2626' : '#9ca3af'} 
                        stroke={animationState === 'charged' ? '#b91c1c' : '#6b7280'} 
                        strokeWidth="3"/>
                      
                      {/* Right plate */}
                      <rect x="450" y="80" width="20" height="180" 
                        fill={animationState === 'charged' ? '#2563eb' : '#9ca3af'} 
                        stroke={animationState === 'charged' ? '#1d4ed8' : '#6b7280'} 
                        strokeWidth="3"/>
                      
                      {/* Battery (if shown) */}
                      {showBattery && (
                        <g>
                          {/* Battery symbol */}
                          <rect x="250" y="300" width="80" height="30" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" rx="5"/>
                          <text x="290" y="320" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">Battery</text>
                          
                          {/* Wires to plates */}
                          <line x1="160" y1="270" x2="160" y2="300" stroke="#374151" strokeWidth="3"/>
                          <line x1="160" y1="300" x2="250" y2="300" stroke="#374151" strokeWidth="3"/>
                          
                          <line x1="460" y1="270" x2="460" y2="315" stroke="#374151" strokeWidth="3"/>
                          <line x1="460" y1="315" x2="330" y2="315" stroke="#374151" strokeWidth="3"/>
                          
                          {/* Battery terminals */}
                          <text x="240" y="295" fontSize="18" fontWeight="bold" fill="#dc2626">+</text>
                          <text x="340" y="310" fontSize="18" fontWeight="bold" fill="#2563eb">−</text>
                        </g>
                      )}
                      
                      {/* Charges on plates */}
                      {animationState === 'charged' && (
                        <>
                          {/* Positive charges on left plate */}
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <g key={`pos-${i}`}>
                              <circle cx="145" cy={95 + i * 18} r="4" fill="#dc2626" 
                                className="animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}/>
                              <text x="145" y="99" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white"
                                className="animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>+</text>
                            </g>
                          ))}
                          
                          {/* Negative charges on right plate */}
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <g key={`neg-${i}`}>
                              <circle cx="475" cy={95 + i * 18} r="4" fill="#2563eb" 
                                className="animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}/>
                              <text x="475" y="99" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white"
                                className="animate-fade-in" style={{animationDelay: `${i * 0.1}s`}}>−</text>
                            </g>
                          ))}
                        </>
                      )}
                      
                      {/* Electric field lines (when charged) */}
                      {animationState === 'charged' && (
                        <>
                          <defs>
                            <marker id="arrowhead-field" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#059669" />
                            </marker>
                          </defs>
                          
                          {[100, 130, 160, 190, 220].map(y => (
                            <line key={y} x1="175" y1={y} x2="445" y2={y} 
                              stroke="#059669" strokeWidth="2" markerEnd="url(#arrowhead-field)"
                              className="animate-fade-in" style={{animationDelay: '1s'}}/>
                          ))}
                          
                          <text x="310" y="60" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#059669"
                            className="animate-fade-in" style={{animationDelay: '1.5s'}}>
                            Uniform Electric Field
                          </text>
                        </>
                      )}
                      
                      {/* Labels */}
                      <text x="160" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">
                        {animationState === 'charged' ? 'Positive Plate' : 'Metal Plate'}
                      </text>
                      <text x="460" y="50" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">
                        {animationState === 'charged' ? 'Negative Plate' : 'Metal Plate'}
                      </text>
                      
                      {/* Distance indicator */}
                      <line x1="170" y1="290" x2="450" y2="290" stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3"/>
                      <text x="310" y="305" textAnchor="middle" fontSize="12" fill="#6b7280">distance d</text>
                    </svg>
                  </div>
                  
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={handleStartAnimation}
                      disabled={animationState === 'charging'}
                      className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
                    >
                      {animationState === 'initial' ? 'Connect Battery' : 'Charging...'}
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      Reset
                    </button>
                  </div>
                  
                  <style jsx>{`
                    @keyframes fade-in {
                      from { opacity: 0; }
                      to { opacity: 1; }
                    }
                    .animate-fade-in {
                      animation: fade-in 0.5s ease-in forwards;
                      opacity: 0;
                    }
                  `}</style>
                </div>
                
                <p className="text-gray-700 mb-4">
                  The electrostatic forces of repulsion of like charges, within each plate, cause the charges to distribute evenly 
                  within each plate, and electrostatic forces of attraction between the two plates cause the charges to 
                  accumulate on the inner surfaces. The electric field will be directed away from the 
                  positive plate and toward the negative plate.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Key Property of Parallel Plates:</h4>
                  <p className="text-green-900">
                    The electric field between the plates is <strong>uniform throughout</strong>. That means the electric field strength is 
                    the same everywhere inside the parallel plates. Only at the ends of the plates will it show a non-uniform field.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Parallel-Plate Capacitor:</h4>
                  <p className="text-blue-900">
                    Such a system is called a <strong>parallel-plate capacitor</strong>.
                  </p>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Electric Field Strength Formula:</h4>
                  <p className="text-purple-900 mb-3">
                    The electric field strength between two charged parallel plates is given by the equation:
                  </p>
                  <div className="text-center">
                    <BlockMath math="E = \frac{\Delta V}{d}" />
                  </div>
                  <div className="mt-3 text-sm text-purple-800">
                    <p><strong>Where:</strong></p>
                    <ul className="ml-4 mt-2 space-y-1">
                      <li>E = field strength (N/C or V/m)</li>
                      <li>ΔV = potential difference across plates (Volts)</li>
                      <li>d = distance between plates (m)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Note:</h4>
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-600 font-bold mt-1">⇒</span>
                    <span className="text-yellow-900">
                      This formula can only be used for electric fields that are <strong>uniform</strong> or between <strong>parallel 
                      plates</strong>. This formula does <strong>not</strong> apply to point charges and charged spheres since 
                      they do not produce uniform fields.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Electron Acceleration in Parallel Plates" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A potential difference of 8 000 V is applied across two parallel plates set 5.0 mm apart. 
                  What is the acceleration on an electron placed in the field?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Find the electric field strength</span>
                      <div className="my-3">
                        <BlockMath math="E = \frac{\Delta V}{d}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E = \frac{8000 \text{ V}}{5.0 \times 10^{-3} \text{ m}} = 1.6 \times 10^6 \text{ N/C}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Find the force on the electron</span>
                      <div className="my-3">
                        <BlockMath math="F = qE" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = (1.6 \times 10^{-19} \text{ C})(1.6 \times 10^6 \text{ N/C})" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = 2.56 \times 10^{-13} \text{ N}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Find the acceleration using Newton's second law</span>
                      <div className="my-3">
                        <BlockMath math="a = \frac{F}{m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = \frac{2.56 \times 10^{-13} \text{ N}}{9.11 \times 10^{-31} \text{ kg}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = 2.81 \times 10^{17} \text{ m/s}^2" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The acceleration on the electron is <strong>2.81 × 10¹⁷ m/s²</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Electric Field Strength and Plate Separation" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  The electric field strength between two parallel plates is 930 V/m when the plates are 7.0 cm apart. 
                  What is the electric field strength when the plates are moved to a point where they are 5.0 cm apart?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Find the potential difference (which remains constant)</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = E \times d" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\Delta V = (930 \text{ V/m})(7.0 \times 10^{-2} \text{ m})" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\Delta V = 65.1 \text{ V}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the new electric field strength</span>
                      <p className="text-sm text-gray-600 mb-2">
                        Since the potential difference remains the same, we can find the new field strength:
                      </p>
                      <div className="my-3">
                        <BlockMath math="E_{new} = \frac{\Delta V}{d_{new}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{new} = \frac{65.1 \text{ V}}{5.0 \times 10^{-2} \text{ m}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{new} = 1302 \text{ V/m}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The electric field strength when the plates are 5.0 cm apart is <strong>1302 V/m</strong>.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Key Insight:</h5>
                      <p className="text-blue-900 text-sm">
                        As the plate separation decreases while maintaining the same potential difference, 
                        the electric field strength increases proportionally. This demonstrates the inverse 
                        relationship between field strength and distance in parallel plate capacitors.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="potential-difference" title="Parallel Plates − Potential Difference" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Parallel plates are also excellent sources of a potential difference for the acceleration of 
                  electrons, protons, and other particles. In these cases, we can use the principle of the 
                  conservation of energy – electric potential energy is transformed into kinetic energy.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Conservation of Energy Principle:</h4>
                  <div className="text-center">
                    <BlockMath math="E_p = E_k" />
                  </div>
                  <div className="text-center mt-2">
                    <BlockMath math="q\Delta V = \frac{1}{2}mv^2" />
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Alpha Particle Speed Change in Electric Field" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An alpha particle with an initial speed of 7.15 × 10⁴ m/s enters through a hole in the 
                  parallel plate between two plates that are 0.090 m apart as shown below. If the electric 
                  field between the two plates is 170 N/C, what is the speed of the alpha particle when it 
                  reaches the negative plate?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                  <div className="flex justify-center">
                    <svg width="400" height="200" viewBox="0 0 400 200" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Positive plate */}
                      <rect x="50" y="40" width="15" height="120" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      <text x="30" y="30" fontSize="16" fontWeight="bold" fill="#dc2626">+</text>
                      
                      {/* Negative plate */}
                      <rect x="335" y="40" width="15" height="120" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                      <text x="365" y="30" fontSize="16" fontWeight="bold" fill="#2563eb">−</text>
                      
                      {/* Electric field lines */}
                      <defs>
                        <marker id="arrowhead-ex3" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                        </marker>
                      </defs>
                      
                      {[70, 100, 130].map(y => (
                        <line key={y} x1="70" y1={y} x2="330" y2={y} 
                          stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrowhead-ex3)"/>
                      ))}
                      
                      {/* Alpha particle path */}
                      <circle cx="80" cy="100" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
                      <text x="80" y="107" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">α</text>
                      <text x="80" y="125" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#f59e0b">vi = 7.15×10⁴ m/s</text>
                      
                      <circle cx="320" cy="100" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
                      <text x="320" y="107" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">α</text>
                      <text x="320" y="125" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#f59e0b">vf = ?</text>
                      
                      {/* Arrow showing motion */}
                      <line x1="100" y1="100" x2="300" y2="100" 
                        stroke="#f59e0b" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrowhead-ex3)"/>
                      
                      {/* Distance label */}
                      <line x1="65" y1="170" x2="335" y2="170" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
                      <text x="200" y="185" textAnchor="middle" fontSize="12" fill="#6b7280">d = 0.090 m</text>
                      
                      {/* Field strength label */}
                      <text x="200" y="50" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#6b7280">E = 170 N/C</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  <p className="text-sm text-gray-600 mb-4">
                    <em>The simplest solution method is to use conservation of energy principles.</em>
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Find the potential difference</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = Ed" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\Delta V = (170 \text{ N/C})(0.090 \text{ m}) = 15.3 \text{ V}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply conservation of energy</span>
                      <div className="my-3">
                        <BlockMath math="E_k + E_p = E_{k_f}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\frac{1}{2}mv_i^2 + q\Delta V = \frac{1}{2}mv_f^2" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Solve for final velocity</span>
                      <div className="my-3">
                        <BlockMath math="v_f^2 = v_i^2 + \frac{2q\Delta V}{m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v_f = \sqrt{v_i^2 + \frac{2q\Delta V}{m}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 4: Substitute values (α charge = 3.20 × 10⁻¹⁹ C, mass = 6.65 × 10⁻²⁷ kg)</span>
                      <div className="my-3">
                        <BlockMath math="v_f = \sqrt{(7.15 \times 10^4)^2 + \frac{2(3.20 \times 10^{-19})(15.3)}{6.65 \times 10^{-27}}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v_f = \sqrt{5.11 \times 10^9 + 1.47 \times 10^9}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v_f = 8.11 \times 10^4 \text{ m/s}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The speed of the alpha particle when it reaches the negative plate is <strong>8.11 × 10⁴ m/s</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4 - Maximum Speed from Potential Difference" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An alpha particle is placed between two parallel plates set 4.0 cm apart with a potential 
                  difference of 7 500 V across them. What is the maximum speed that the alpha particle 
                  could achieve in this field?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Apply conservation of energy for maximum speed</span>
                      <p className="text-sm text-gray-600 mb-2">
                        <em>In order to achieve maximum speed the alpha particle would have to travel 
                        from the positive plate to the negative plate. Its potential energy would be 
                        completely converted to kinetic energy.</em>
                      </p>
                      <div className="my-3">
                        <BlockMath math="E_p = E_k" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q\Delta V = \frac{1}{2}mv^2" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Solve for velocity</span>
                      <div className="my-3">
                        <BlockMath math="v = \sqrt{\frac{2q\Delta V}{m}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute values (α charge = 3.20 × 10⁻¹⁹ C, mass = 6.65 × 10⁻²⁷ kg)</span>
                      <div className="my-3">
                        <BlockMath math="v = \sqrt{\frac{2(3.20 \times 10^{-19} \text{ C})(7500 \text{ V})}{6.65 \times 10^{-27} \text{ kg}}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v = 8.5 \times 10^5 \text{ m/s}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The maximum speed the alpha particle could achieve is <strong>8.5 × 10⁵ m/s</strong>.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Important Note:</h5>
                      <p className="text-blue-900 text-sm">
                        Notice that the plate separation does not matter for this kind of problem. 
                        Only the potential difference determines the maximum kinetic energy that can be achieved.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-gravitational" title="Electric Forces and Gravitational Forces" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Quite often the electrostatic forces are so large when compared to the gravitational 
                  force involved, we can then ignore the gravitational force. In examples 1, 3 and 4 
                  above, the gravitational forces on protons, electrons and alpha particles are very small 
                  compared to the electric forces acting on them.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">General Guidelines:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-600 font-bold mt-1">1.</span>
                      <span className="text-yellow-900">
                        Any time you are given the mass of the particle, calculate both the gravitational and 
                        electric forces and compare them. If the gravitational force is less than 1000 times 
                        the electrical force, then it is safe to ignore the gravitational force.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-600 font-bold mt-1">2.</span>
                      <span className="text-yellow-900">
                        Any time a massive particle is suspended or moving vertically in an electric field 
                        between parallel plates, gravity is a factor.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-yellow-600 font-bold mt-1">3.</span>
                      <span className="text-yellow-900">
                        Any time a massive particle is accelerating upward or downward in an electric field 
                        between parallel plates, gravity is a factor.
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Key Principle:</h4>
                  <p className="text-blue-900">
                    When dealing with vertical motion or equilibrium in electric fields, always consider 
                    both electric and gravitational forces acting on the particle.
                  </p>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5 - Suspended Charged Particle" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An unknown charge is placed onto a 0.050 mg particle. The particle is placed between 
                  two horizontal plates set 8.0 mm apart with a potential difference of 5 000 V across the 
                  plates. If the particle is suspended between the plates, what is the charge on the 
                  particle? How many excess electrons are on the particle?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-4">
                  <div className="flex justify-center">
                    <svg width="400" height="250" viewBox="0 0 400 250" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Top plate (positive) */}
                      <rect x="50" y="50" width="300" height="15" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      {/* Positive charges on top plate */}
                      {[70, 110, 150, 190, 230, 270, 310].map(x => (
                        <text key={x} x={x} y="45" fontSize="16" fontWeight="bold" fill="#dc2626" textAnchor="middle">+</text>
                      ))}
                      
                      {/* Bottom plate (negative) */}
                      <rect x="50" y="185" width="300" height="15" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                      {/* Negative charges on bottom plate */}
                      {[70, 110, 150, 190, 230, 270, 310].map(x => (
                        <text key={x} x={x} y="220" fontSize="16" fontWeight="bold" fill="#2563eb" textAnchor="middle">−</text>
                      ))}
                      
                      {/* Suspended particle */}
                      <circle cx="200" cy="125" r="8" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
                      <text x="200" y="131" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">q</text>
                      
                      {/* Force arrows */}
                      <defs>
                        <marker id="arrowhead-forces" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#059669" />
                        </marker>
                        <marker id="arrowhead-grav" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Electric force (upward) */}
                      <line x1="200" y1="110" x2="200" y2="90" 
                        stroke="#059669" strokeWidth="3" markerEnd="url(#arrowhead-forces)"/>
                      <text x="220" y="100" fontSize="12" fontWeight="bold" fill="#059669">FE</text>
                      
                      {/* Gravitational force (downward) */}
                      <line x1="200" y1="140" x2="200" y2="160" 
                        stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead-grav)"/>
                      <text x="220" y="155" fontSize="12" fontWeight="bold" fill="#dc2626">Fg</text>
                      
                      {/* Electric field lines */}
                      {[90, 130, 170].map(x => (
                        <line key={x} x1={x} y1="70" x2={x} y2="180" 
                          stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrowhead-forces)"/>
                      ))}
                      
                      {/* Distance label */}
                      <line x1="30" y1="65" x2="30" y2="185" stroke="#6b7280" strokeWidth="1"/>
                      <text x="25" y="125" fontSize="12" fill="#6b7280" transform="rotate(-90 25 125)" textAnchor="middle">8.0 mm</text>
                      
                      {/* Voltage label */}
                      <text x="200" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">ΔV = 5000 V</text>
                      
                      {/* Mass label */}
                      <text x="200" y="240" textAnchor="middle" fontSize="12" fill="#f59e0b">m = 0.050 mg</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-blue-800 mb-2">Review Note:</h5>
                  <p className="text-blue-900 text-sm">
                    To remember how to properly solve problems of this kind, it may be wise to review 
                    Physics 20 – Lesson 17 on vertical force problems.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Apply equilibrium condition (particle is suspended)</span>
                      <p className="text-sm text-gray-600 mb-2">
                        From the diagram: F<sub>NET</sub> = F<sub>g</sub> + F<sub>E</sub>
                      </p>
                      <div className="my-3">
                        <BlockMath math="F_{NET} = 0 \text{ (since particle is suspended)}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="0 = F_g + F_E" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="0 = mg + qE" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Express electric field in terms of potential difference</span>
                      <div className="my-3">
                        <BlockMath math="qE = mg + \frac{q\Delta V}{d}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="0 = mg + \frac{q\Delta V}{d}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\frac{q\Delta V}{d} = -mg" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Solve for charge</span>
                      <div className="my-3">
                        <BlockMath math="q = \frac{-mgd}{\Delta V}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = \frac{-(0.050 \times 10^{-6} \text{ kg})(9.81 \text{ m/s}^2)(0.0080 \text{ m})}{5000 \text{ V}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = -7.85 \times 10^{-13} \text{ C}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 4: Calculate number of excess electrons</span>
                      <div className="my-3">
                        <BlockMath math="q = ne" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="n = \frac{q}{e} = \frac{7.85 \times 10^{-13} \text{ C}}{1.60 \times 10^{-19} \text{ C}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="n = 4.91 \times 10^6 \text{ electrons}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <div className="text-green-900 mt-1 space-y-1">
                        <p>The charge on the particle is <strong>-7.85 × 10⁻¹³ C</strong>.</p>
                        <p>The particle has <strong>4.91 × 10⁶ excess electrons</strong>.</p>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-2">Physical Interpretation:</h5>
                      <p className="text-purple-900 text-sm">
                        The negative charge indicates the particle must be negatively charged to experience 
                        an upward electric force that balances the downward gravitational force. The electric 
                        field points downward (from positive to negative plate), so a negative charge 
                        experiences an upward force.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="millikan" title="Millikan's Oil-Drop Experiment" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  In 1897, J. J. Thomson measured the charge to mass ratio of an electron (we will study 
                  his experiment in detail in Lesson 26). At that time, neither the charge nor the mass of 
                  an electron were known – all that physicists knew was the ratio of these values.
                </p>
                
                <p className="text-gray-700 mb-4">
                  A few years later, between 1906 and 1913, R. A. Millikan used the suspension of charged 
                  particles between parallel plates as a way to determine the charge of the electron. This 
                  experiment is referred to as an oil drop problem and it is solved in the same manner that 
                  Example 5 was solved.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Reference:</strong> Refer to Pearson pages 761 to 765.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Interactive: Millikan's Oil-Drop Experiment</h4>
                  
                  <div className="flex justify-center mb-4">
                    <svg width="500" height="350" viewBox="0 0 500 350" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Top plate (positive) */}
                      <rect x="100" y="80" width="300" height="15" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      <text x="50" y="75" fontSize="14" fontWeight="bold" fill="#dc2626">+</text>
                      <text x="450" y="75" fontSize="14" fontWeight="bold" fill="#dc2626">+</text>
                      
                      {/* Bottom plate (negative) */}
                      <rect x="100" y="220" width="300" height="15" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                      <text x="50" y="245" fontSize="14" fontWeight="bold" fill="#2563eb">−</text>
                      <text x="450" y="245" fontSize="14" fontWeight="bold" fill="#2563eb">−</text>
                      
                      {/* Electric field lines when voltage is on */}
                      {voltage > 0 && (
                        <>
                          <defs>
                            <marker id="arrowhead-millikan" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                              <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                            </marker>
                          </defs>
                          {[130, 170, 210, 250, 290, 330, 370].map(x => (
                            <line key={x} x1={x} y1="100" x2={x} y2="215" 
                              stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrowhead-millikan)"/>
                          ))}
                        </>
                      )}
                      
                      {/* Atomizer */}
                      <rect x="80" y="40" width="15" height="30" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2" rx="5"/>
                      <text x="87" y="25" fontSize="12" fontWeight="bold" fill="#8b5cf6" textAnchor="middle">Atomizer</text>
                      
                      {/* Oil droplet */}
                      {milliklanAnimationState !== 'off' && (
                        <g style={{
                          transform: `translateY(${dropletPosition - 150}px)`,
                          transition: 'transform 0.5s ease-in-out'
                        }}>
                          <circle cx="250" cy="150" r="4" fill="#f59e0b" stroke="#d97706" strokeWidth="1"/>
                          <text x="265" y="155" fontSize="10" fill="#f59e0b" fontWeight="bold">oil drop</text>
                          
                          {/* Force arrows on droplet */}
                          {milliklanAnimationState === 'balanced' && (
                            <>
                              {/* Electric force (upward) */}
                              <line x1="250" y1="140" x2="250" y2="125" 
                                stroke="#059669" strokeWidth="2" markerEnd="url(#arrowhead-millikan)"/>
                              <text x="260" y="135" fontSize="10" fontWeight="bold" fill="#059669">FE</text>
                              
                              {/* Gravitational force (downward) */}
                              <line x1="250" y1="160" x2="250" y2="175" 
                                stroke="#dc2626" strokeWidth="2" markerEnd="url(#arrowhead-millikan)"/>
                              <text x="260" y="170" fontSize="10" fontWeight="bold" fill="#dc2626">Fg</text>
                            </>
                          )}
                        </g>
                      )}
                      
                      {/* Microscope */}
                      <rect x="420" y="140" width="40" height="20" fill="#4b5563" stroke="#374151" strokeWidth="2" rx="3"/>
                      <circle cx="440" cy="150" r="8" fill="#94a3b8" stroke="#64748b" strokeWidth="1"/>
                      <text x="440" y="130" fontSize="12" fontWeight="bold" fill="#4b5563" textAnchor="middle">Microscope</text>
                      
                      {/* Variable voltage source */}
                      <rect x="50" y="280" width="80" height="40" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" rx="5"/>
                      <text x="90" y="295" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">Variable</text>
                      <text x="90" y="308" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#000">Voltage</text>
                      <text x="90" y="321" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#dc2626">{voltage} V</text>
                      
                      {/* Wires */}
                      <line x1="100" y1="88" x2="100" y2="280" stroke="#374151" strokeWidth="3"/>
                      <line x1="100" y1="227" x2="100" y2="300" stroke="#374151" strokeWidth="3"/>
                      <line x1="100" y1="300" x2="130" y2="300" stroke="#374151" strokeWidth="3"/>
                      
                      {/* Spray animation */}
                      {milliklanAnimationState === 'spraying' && (
                        <>
                          {[0, 1, 2, 3, 4].map(i => (
                            <circle key={i} cx={95 + i * 10} cy={75 + i * 5} r="1" fill="#f59e0b" 
                              className="animate-pulse"/>
                          ))}
                        </>
                      )}
                      
                      {/* Status indicator */}
                      <rect x="350" y="280" width="120" height="50" fill="#f3f4f6" stroke="#d1d5db" strokeWidth="1" rx="5"/>
                      <text x="410" y="295" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">Status:</text>
                      <text x="410" y="310" textAnchor="middle" fontSize="11" fill="#059669">
                        {milliklanAnimationState === 'off' && 'Ready'}
                        {milliklanAnimationState === 'spraying' && 'Spraying Oil'}
                        {milliklanAnimationState === 'falling' && 'Droplet Falling'}
                        {milliklanAnimationState === 'slowing' && 'Droplet Slowing'}
                        {milliklanAnimationState === 'balanced' && 'Forces Balanced!'}
                      </text>
                      <text x="410" y="325" textAnchor="middle" fontSize="10" fill="#6b7280">
                        {milliklanAnimationState === 'balanced' && 'FE = Fg'}
                      </text>
                      
                      {/* Labels */}
                      <text x="250" y="270" textAnchor="middle" fontSize="12" fill="#6b7280">Distance d</text>
                    </svg>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={handleMillikanSpray}
                        disabled={milliklanAnimationState === 'spraying'}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-400 transition-colors"
                      >
                        Spray Oil Droplets
                      </button>
                      <button
                        onClick={handleMillikanReset}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Reset
                      </button>
                    </div>
                    
                    <div className="flex justify-center items-center gap-4">
                      <label className="text-sm font-medium text-gray-700">Voltage:</label>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={voltage}
                        onChange={(e) => handleVoltageChange(parseInt(e.target.value))}
                        className="w-48"
                        disabled={milliklanAnimationState === 'off'}
                      />
                      <span className="text-sm text-gray-600 w-16">{voltage} V</span>
                    </div>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  The basic design of Millikan's experiment involved two parallel plates, a distance (d) 
                  apart, hooked up to a variable voltage source where the voltage could be adjusted to 
                  provide just enough of an electric force to balance the force of gravity on the oil drop.
                </p>
                
                <p className="text-gray-700 mb-4">
                  An atomizer sprayed tiny oil droplets between the plates. In addition, friction between 
                  the droplets and the atomizer's plastic nozzle gave the droplet a small static charge. 
                  Using a small microscope, Millikan could observe the motion of the droplets and he 
                  could also measure the size of the droplets. From the droplet's radius and the density 
                  of the oil he could determine the mass of the droplet.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Key Principle:</h4>
                  <p className="text-green-900 mb-2">
                    When the droplet is motionless, the electric and gravitational forces are balanced.
                  </p>
                  <div className="text-center space-y-2">
                    <BlockMath math="F_E = F_g" />
                    <BlockMath math="qE = mg" />
                    <BlockMath math="\frac{q\Delta V}{d} = mg" />
                    <BlockMath math="q = \frac{mgd}{\Delta V}" />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Millikan's Educated Assumptions:</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">1.</span>
                      <span className="text-blue-900">
                        All electrons are identical – each has the same amount of charge.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">2.</span>
                      <span className="text-blue-900">
                        The mass of each electron is so small that the addition or subtraction of a few will 
                        not significantly change the mass of the oil droplet.
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">3.</span>
                      <span className="text-blue-900">
                        The amount of charge on the oil droplet will be a whole number multiple of the 
                        charge of one electron (i.e. 2e, 7e, 12e, etc.).
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Historical Results:</h4>
                  <p className="text-purple-900">
                    Using this apparatus, Millikan came up with a value of <strong>1.69 × 10⁻¹⁹ C</strong> for the charge on 
                    an electron. This value is fairly close to the presently accepted value of <strong>1.60 × 10⁻¹⁹ C</strong>.
                  </p>
                </div>
              </div>
            </div>
          )}
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : (
        <div>
          {/* Fallback content when AIAccordion is not available */}
          <p className="text-gray-600 p-4 bg-gray-100 rounded">
            This lesson contains interactive content that requires the AI-enhanced accordion feature.
          </p>
        </div>
      )}

      <LessonSummary
        points={[
          "Parallel plate capacitors create uniform electric fields between charged plates",
          "Electric field strength between parallel plates: E = ΔV/d (only for uniform fields)",
          "Electric potential energy converts to kinetic energy: qΔV = ½mv²",
          "For suspended particles, electric force balances gravitational force: qE = mg",
          "Plate separation affects field strength: closer plates create stronger fields",
          "Distance doesn't affect maximum kinetic energy gained, only potential difference matters",
          "Millikan's oil-drop experiment used parallel plates to determine electron charge",
          "Always consider both electric and gravitational forces for vertical motion problems"
        ]}
      />
    </LessonContent>
  );
};

export default ParallelPlates;