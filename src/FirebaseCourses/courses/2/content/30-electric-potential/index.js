import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ElectricPotential = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_30_electric_potential"
      title="Lesson 16 - Electric Potential"
      metadata={{ estimated_time: '45 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="gravitational" title="Gravitational Potential Energy − Revisited" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  There are many similarities between gravitational potential energy and electric potential
                  energy. To help us understand electric potential energy, it may be helpful to review
                  gravitational potential energy and extend the concepts we have learned.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Gravitational Potential Energy Changes</h4>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="300" viewBox="0 0 400 300" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Earth */}
                      <circle cx="200" cy="250" r="40" fill="#22c55e" stroke="#16a34a" strokeWidth="2"/>
                      <text x="200" y="260" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">Earth</text>
                      
                      {/* Mass at different positions */}
                      <circle cx="200" cy="180" r="8" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      <text x="215" y="185" fontSize="12" fontWeight="bold" fill="#dc2626">m</text>
                      
                      {/* Position A (higher up) */}
                      <circle cx="120" cy="100" r="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2"/>
                      <text x="100" y="90" fontSize="14" fontWeight="bold" fill="#3b82f6">A</text>
                      
                      {/* Position B (closer to Earth) */}
                      <circle cx="280" cy="220" r="6" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
                      <text x="295" y="225" fontSize="14" fontWeight="bold" fill="#f59e0b">B</text>
                      
                      {/* Position C (same level) */}
                      <circle cx="320" cy="180" r="6" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
                      <text x="335" y="185" fontSize="14" fontWeight="bold" fill="#8b5cf6">C</text>
                      
                      {/* Arrows showing movement */}
                      <defs>
                        <marker id="arrowhead-grav" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#666" />
                        </marker>
                      </defs>
                      
                      {/* Arrow to A */}
                      <line x1="180" y1="160" x2="140" y2="120" 
                        stroke="#3b82f6" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-grav)"/>
                      
                      {/* Arrow to B */}
                      <line x1="220" y1="200" x2="260" y2="220" 
                        stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-grav)"/>
                      
                      {/* Arrow to C */}
                      <line x1="220" y1="180" x2="300" y2="180" 
                        stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-grav)"/>
                      
                      {/* Equipotential lines (circular around Earth) */}
                      <circle cx="200" cy="250" r="80" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3"/>
                      <circle cx="200" cy="250" r="120" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3"/>
                      <circle cx="200" cy="250" r="160" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3"/>
                      
                      {/* Labels */}
                      <text x="50" y="120" fontSize="12" fill="#3b82f6" fontWeight="bold">Higher potential energy</text>
                      <text x="280" y="240" fontSize="12" fill="#f59e0b" fontWeight="bold">Lower potential energy</text>
                      <text x="250" y="170" fontSize="12" fill="#8b5cf6" fontWeight="bold">Same potential energy</text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Gravitational potential energy depends on position relative to Earth
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">
                  When a mass is placed in a gravitational field it has a certain amount of potential energy relative to a
                  starting position. In the diagram above:
                </p>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">⇒</span>
                      <span className="text-blue-900">
                        If the mass is moved toward <strong>A</strong>, there is a <strong>gain</strong> in
                        gravitational potential energy.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">⇒</span>
                      <span className="text-blue-900">
                        If the object is moved toward <strong>B</strong>, there is a <strong>loss</strong> of
                        gravitational potential energy.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">⇒</span>
                      <span className="text-blue-900">
                        If the object is moved toward <strong>C</strong>, there is <strong>no change</strong> in the energy.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-potential-energy" title="Electric Potential Energy" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Reference:</strong> Refer to Pearson pages 560 to 566.
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">
                  Charged objects in electric fields behave in a similar way to masses placed in
                  gravitational fields. For example, a small positive charge (q+) is placed in the electric
                  field created by the positive and negative charges as shown in the diagram below.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Electric Potential Energy Changes</h4>
                  
                  <div className="flex justify-center">
                    <svg width="500" height="300" viewBox="0 0 500 300" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Positive source charge */}
                      <circle cx="150" cy="150" r="20" fill="#dc2626" stroke="#b91c1c" strokeWidth="3"/>
                      <text x="150" y="158" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">+</text>
                      <text x="150" y="185" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#dc2626">Source +</text>
                      
                      {/* Negative source charge */}
                      <circle cx="350" cy="150" r="20" fill="#2563eb" stroke="#1d4ed8" strokeWidth="3"/>
                      <text x="350" y="158" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">−</text>
                      <text x="350" y="185" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2563eb">Source −</text>
                      
                      {/* Test charge */}
                      <circle cx="250" cy="150" r="12" fill="#f59e0b" stroke="#d97706" strokeWidth="2"/>
                      <text x="250" y="156" textAnchor="middle" fontSize="14" fontWeight="bold" fill="white">q+</text>
                      <text x="250" y="175" fontSize="11" textAnchor="middle" fontWeight="bold" fill="#f59e0b">Test charge</text>
                      
                      {/* Position A (closer to positive charge) */}
                      <circle cx="180" cy="120" r="6" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
                      <text x="165" y="110" fontSize="14" fontWeight="bold" fill="#8b5cf6">A</text>
                      
                      {/* Position B (closer to negative charge) */}
                      <circle cx="320" cy="120" r="6" fill="#10b981" stroke="#059669" strokeWidth="2"/>
                      <text x="305" y="110" fontSize="14" fontWeight="bold" fill="#10b981">B</text>
                      
                      {/* Position C (perpendicular movement) */}
                      <circle cx="250" cy="100" r="6" fill="#f97316" stroke="#ea580c" strokeWidth="2"/>
                      <text x="235" y="90" fontSize="14" fontWeight="bold" fill="#f97316">C</text>
                      
                      {/* Movement arrows */}
                      <defs>
                        <marker id="arrowhead-elec" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#666" />
                        </marker>
                      </defs>
                      
                      {/* Arrow to A */}
                      <line x1="235" y1="140" x2="195" y2="130" 
                        stroke="#8b5cf6" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-elec)"/>
                      
                      {/* Arrow to B */}
                      <line x1="265" y1="140" x2="305" y2="130" 
                        stroke="#10b981" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-elec)"/>
                      
                      {/* Arrow to C */}
                      <line x1="250" y1="135" x2="250" y2="115" 
                        stroke="#f97316" strokeWidth="2" strokeDasharray="5,5" markerEnd="url(#arrowhead-elec)"/>
                      
                      {/* Electric field lines */}
                      {/* From positive to negative */}
                      <line x1="170" y1="150" x2="330" y2="150" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
                      <line x1="165" y1="130" x2="335" y2="170" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
                      <line x1="165" y1="170" x2="335" y2="130" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2"/>
                      
                      {/* Labels for energy changes */}
                      <text x="180" y="200" fontSize="11" fill="#8b5cf6" fontWeight="bold" textAnchor="middle">Higher potential</text>
                      <text x="180" y="215" fontSize="11" fill="#8b5cf6" fontWeight="bold" textAnchor="middle">energy</text>
                      
                      <text x="320" y="200" fontSize="11" fill="#10b981" fontWeight="bold" textAnchor="middle">Lower potential</text>
                      <text x="320" y="215" fontSize="11" fill="#10b981" fontWeight="bold" textAnchor="middle">energy</text>
                      
                      <text x="250" y="250" fontSize="11" fill="#f97316" fontWeight="bold" textAnchor="middle">Same potential energy</text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Electric potential energy changes as a positive test charge moves in an electric field
                  </p>
                </div>
                
                <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">⇒</span>
                      <span className="text-green-900">
                        If q+ is moved toward <strong>A</strong>, work (i.e. W = F × d) must be done <strong>against</strong> the electric field – 
                        the electric potential energy of the charge <strong>increases</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">⇒</span>
                      <span className="text-green-900">
                        If q+ is moved toward <strong>B</strong>, work is done <strong>by</strong> the electric field – 
                        the electric potential energy of the charge <strong>decreases</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-green-600 font-bold mt-1">⇒</span>
                      <span className="text-green-900">
                        If q+ is moved toward <strong>C</strong>, no work is done since no force is required to move it in 
                        that direction – the electric potential energy of the charge <strong>does not change</strong>.
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Definition:</h4>
                  <p className="text-blue-900 font-medium">
                    <strong>Electric Potential Energy (EP)</strong> is the energy of a charged object due to its position in
                    an electric field.
                  </p>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-potential" title="Electric Potential" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  When we were working with gravitational potential energy, we were interested in
                  changes in gravitational potential – a change in the position of a mass within a
                  gravitational field. In a similar manner, a change in electric potential is due to a
                  change in the position of a charge within an electric field.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Electric Potential Basics:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-blue-900">
                        The symbol for electric potential is <strong>V</strong> and its unit is the <strong>Volt</strong>.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-blue-900">
                        It is not possible to measure the <strong>absolute</strong> electric potential at a point in an electric field.
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-blue-900">
                        We can measure the <strong>electric potential difference</strong> (ΔV) between two points.
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Electric Potential Difference</h4>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="200" viewBox="0 0 400 200" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Electric field lines */}
                      <defs>
                        <marker id="arrowhead-field" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                        </marker>
                      </defs>
                      
                      {/* Field lines */}
                      {[60, 100, 140].map(y => (
                        <line key={y} x1="50" y1={y} x2="350" y2={y} 
                          stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrowhead-field)"/>
                      ))}
                      
                      {/* Position B */}
                      <circle cx="120" cy="100" r="8" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      <text x="120" y="107" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">q</text>
                      <text x="120" y="130" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#dc2626">B</text>
                      <text x="120" y="145" textAnchor="middle" fontSize="12" fill="#dc2626">V<tspan fontSize="10">B</tspan></text>
                      
                      {/* Position A */}
                      <circle cx="280" cy="100" r="8" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      <text x="280" y="107" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">q</text>
                      <text x="280" y="130" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#dc2626">A</text>
                      <text x="280" y="145" textAnchor="middle" fontSize="12" fill="#dc2626">V<tspan fontSize="10">A</tspan></text>
                      
                      {/* Movement arrow */}
                      <line x1="140" y1="100" x2="260" y2="100" 
                        stroke="#2563eb" strokeWidth="3" strokeDasharray="8,4" markerEnd="url(#arrowhead-field)"/>
                      <text x="200" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2563eb">Movement</text>
                      
                      {/* Electric field label */}
                      <text x="200" y="30" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#6b7280">Electric Field</text>
                      <text x="200" y="45" textAnchor="middle" fontSize="12" fill="#6b7280">(Field lines point in direction of decreasing potential)</text>
                      
                      {/* Potential difference */}
                      <text x="200" y="170" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#059669">ΔV = V<tspan fontSize="12">B</tspan> - V<tspan fontSize="12">A</tspan></text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    A positively charged particle moves from position B to position A in an electric field
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">
                  A positively charged particle, with a charge of q, has a certain amount of electric
                  potential at position B (V<sub>B</sub>) and a different amount of electric potential at position A (V<sub>A</sub>).
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">The difference in potential is given by:</h4>
                  <div className="text-center">
                    <BlockMath math="\Delta V = V_B - V_A" />
                  </div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-900">
                      <strong>When a charged particle moves from B to A:</strong> The electric field does work on the particle 
                      and the particle's kinetic energy increases.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-900">
                      <strong>When a particle is moved from A to B:</strong> Work must be done against the electric field.
                    </p>
                  </div>
                </div>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-purple-800 mb-3">Definition of Electric Potential:</h4>
                  <p className="text-purple-900 mb-3">
                    <strong>Electric potential is the change in electric potential energy per unit of charge.</strong>
                  </p>
                  <div className="text-center">
                    <BlockMath math="\Delta V = \frac{\Delta E_p}{q}" />
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Units:</h4>
                  <div className="text-center space-y-2">
                    <BlockMath math="\Delta V = \frac{\text{Joule}}{\text{Coulomb}} = \frac{\text{J}}{\text{C}} = \text{Volt (V)}" />
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Important Note:</h4>
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 font-bold mt-1">⇒</span>
                    <span className="text-red-900">
                      <strong>Electric potential (V) is a scalar term.</strong> (Direction does not matter.)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Finding Electric Potential Difference" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If 5.0 μJ of energy is required to move a 1.0 μC charge in an electric field, then the
                  potential difference between the two points is?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Use the formula for electric potential difference:</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = \frac{\Delta E_p}{q}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the given values:</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = \frac{5.0 \text{ μJ}}{1.0 \text{ μC}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Calculate the result:</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = 5.0 \text{ V}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The potential difference between the two points is <strong>5.0 V</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Proton in Electric Field" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If 1.0 × 10⁻¹⁸ J of energy is required to move a proton in an electric field, what is the
                  potential difference between the starting point and the finishing point in the field?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Use the formula for electric potential difference:</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = \frac{\Delta E_p}{q}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the given values (proton charge = 1.6 × 10⁻¹⁹ C):</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = \frac{1.0 \times 10^{-18} \text{ J}}{1.6 \times 10^{-19} \text{ C}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Calculate the result:</span>
                      <div className="my-3">
                        <BlockMath math="\Delta V = 6.25 \text{ V}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The potential difference between the starting and finishing points is <strong>6.25 V</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Work Required to Move Charge" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  The potential difference between two points is 120 Volts. What is the work required to
                  move a 6.0 × 10⁻⁴ C against the field?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Use the work formula (rearranged from ΔV = ΔEp/q):</span>
                      <div className="my-3">
                        <BlockMath math="W = q \Delta V" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the given values:</span>
                      <div className="my-3">
                        <BlockMath math="W = (6.0 \times 10^{-4} \text{ C})(120 \text{ V})" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Calculate the result:</span>
                      <div className="my-3">
                        <BlockMath math="W = 7.2 \times 10^{-2} \text{ J}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The work required to move the charge against the field is <strong>7.2 × 10⁻² J</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4 - Alpha Particle Speed from Electric Potential" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An alpha particle is placed in an electric field with a potential difference of 100 V. If the
                  alpha particle is released within the field, what is the maximum speed that the alpha
                  particle could attain?
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-blue-800 mb-2">From the formula/data sheet:</h5>
                  <p className="text-blue-900 text-sm">
                    <strong>Alpha particle:</strong> m<sub>α</sub> = 6.65 × 10⁻²⁷ kg, charge = α²⁺
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Convert the 2+ charge to Coulombs</span>
                      <div className="my-3">
                        <BlockMath math="q = 2^+ \times 1.6 \times 10^{-19} \text{ C} = 3.2 \times 10^{-19} \text{ C}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply conservation of energy (Electric PE → Kinetic energy)</span>
                      <div className="my-3">
                        <BlockMath math="E_p = E_k" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q \Delta V = \frac{1}{2}mv^2" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Solve for velocity</span>
                      <div className="my-3">
                        <BlockMath math="v = \sqrt{\frac{2q \Delta V}{m}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 4: Substitute values</span>
                      <div className="my-3">
                        <BlockMath math="v = \sqrt{\frac{2(3.2 \times 10^{-19} \text{ C})(100 \text{ V})}{6.65 \times 10^{-27} \text{ kg}}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 5: Calculate the result</span>
                      <div className="my-3">
                        <BlockMath math="v = 9.81 \times 10^{4} \text{ m/s}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The maximum speed the alpha particle could attain is <strong>9.81 × 10⁴ m/s</strong>.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Important Note:</h5>
                      <p className="text-yellow-900 text-sm">
                        This example is a very common application of converting electric potential
                        energy into the kinetic energy of a charged particle. We will be using this
                        idea throughout the rest of the course.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="equipotential" title="Equipotential Lines" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Quite often, two parallel plates are a simple way to create a potential difference (we will
                  discuss parallel plates in detail in Lesson 17). In such an electric field, one can map out
                  what the electric potential is at different points. Along an imaginary line parallel to the
                  plates, the electric potential is the same or "equal." The subsequent "equipotential
                  lines" have the same potential at all points on the line.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Parallel Plate System with Equipotential Lines</h4>
                  
                  <div className="flex justify-center">
                    <svg width="600" height="300" viewBox="0 0 600 300" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Positive plate */}
                      <rect x="50" y="50" width="20" height="200" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                      <text x="35" y="35" fontSize="14" fontWeight="bold" fill="#dc2626">+</text>
                      
                      {/* Negative plate */}
                      <rect x="530" y="50" width="20" height="200" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                      <text x="565" y="35" fontSize="14" fontWeight="bold" fill="#2563eb">−</text>
                      
                      {/* Electric field lines (horizontal arrows) */}
                      <defs>
                        <marker id="arrowhead-equi" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                          <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
                        </marker>
                      </defs>
                      
                      {/* Field lines */}
                      {[80, 120, 160, 200, 240].map(y => (
                        <line key={y} x1="70" y1={y} x2="520" y2={y} 
                          stroke="#6b7280" strokeWidth="1" strokeDasharray="3,3" markerEnd="url(#arrowhead-equi)"/>
                      ))}
                      
                      {/* Equipotential lines (vertical dashed lines) */}
                      {[
                        {x: 130, v: "40 V", color: "#dc2626"},
                        {x: 170, v: "35 V", color: "#f97316"},
                        {x: 210, v: "30 V", color: "#eab308"},
                        {x: 250, v: "25 V", color: "#22c55e"},
                        {x: 290, v: "20 V", color: "#06b6d4"},
                        {x: 330, v: "15 V", color: "#3b82f6"},
                        {x: 370, v: "10 V", color: "#8b5cf6"},
                        {x: 410, v: "5 V", color: "#ec4899"},
                        {x: 450, v: "0 V", color: "#6b7280"}
                      ].map((line, i) => (
                        <g key={i}>
                          <line x1={line.x} y1="50" x2={line.x} y2="250" 
                            stroke={line.color} strokeWidth="2" strokeDasharray="8,4"/>
                          <text x={line.x} y="275" textAnchor="middle" fontSize="12" fontWeight="bold" fill={line.color}>
                            {line.v}
                          </text>
                        </g>
                      ))}
                      
                      {/* Points A, B, C */}
                      <circle cx="250" cy="150" r="6" fill="#000" stroke="#fff" strokeWidth="2"/>
                      <text x="265" y="155" fontSize="14" fontWeight="bold" fill="#000">A</text>
                      
                      <circle cx="290" cy="120" r="6" fill="#000" stroke="#fff" strokeWidth="2"/>
                      <text x="305" y="125" fontSize="14" fontWeight="bold" fill="#000">B</text>
                      
                      <circle cx="250" cy="200" r="6" fill="#000" stroke="#fff" strokeWidth="2"/>
                      <text x="265" y="205" fontSize="14" fontWeight="bold" fill="#000">C</text>
                      
                      {/* Labels */}
                      <text x="300" y="20" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">
                        40 V potential difference between plates
                      </text>
                      
                      {/* Legend */}
                      <text x="80" y="290" fontSize="12" fill="#6b7280">Electric field lines →</text>
                      <text x="400" y="290" fontSize="12" fill="#3b82f6">| | | Equipotential lines</text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Electric field lines and equipotential lines for a parallel plate system
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">
                  The diagram above shows electric field lines and equipotential lines for a parallel plate
                  system consisting of a (+) plate and a (−) plate. The dotted lines represent the
                  equipotential lines which are always perpendicular to the electric field lines. For this
                  particular example there is a potential difference of 40 volts between the two plates.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <p className="text-yellow-900">
                    <strong>Note:</strong> What we call our 0 V potential line is quite arbitrary, it is the difference in
                    potential between two points that really counts.
                  </p>
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Key Properties of Equipotential Lines:</h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-blue-900">
                        Equipotential lines are always <strong>perpendicular</strong> to electric field lines
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-blue-900">
                        All points on the same equipotential line have the <strong>same electric potential</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-blue-600 font-bold mt-1">•</span>
                      <span className="text-blue-900">
                        <strong>No work</strong> is required to move a charge along an equipotential line
                      </span>
                    </li>
                  </ul>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-900">
                      <strong>Moving from A to B:</strong> If a proton were to move from A to B, work would have to be done 
                      and its potential energy would increase.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <p className="text-purple-900">
                      <strong>Same equipotential line:</strong> Since C and A lie on the same equipotential line, 
                      moving a proton from C to B would require the same amount of work as moving it from A to B.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <p className="text-orange-900">
                      <strong>Reverse direction:</strong> If a proton is moved from B to A or B to C, its potential would decrease.
                    </p>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-900">
                      <strong>No energy change:</strong> Moving the proton from A to C would not result in any energy change.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5 - Parallel Plate System Calculations" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  Using the parallel plate system shown above:
                </p>
                
                <div className="space-y-6">
                  {/* Part A */}
                  <div className="bg-white p-4 rounded border border-gray-100">
                    <h5 className="font-medium text-gray-700 mb-3">Part A: If an alpha particle is moved from A to B, what energy would be required?</h5>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium">Use the energy formula:</span>
                        <div className="my-3">
                          <BlockMath math="\Delta E = q \Delta V" />
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">From the diagram: A is at 25 V, B is at 20 V, so ΔV = 25V - 20V = 5V</span>
                        <div className="my-3">
                          <BlockMath math="\Delta E = (3.20 \times 10^{-19} \text{ C})(5 \text{ V})" />
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          <em>Note: Alpha particle charge = 2 × 1.6 × 10⁻¹⁹ C = 3.20 × 10⁻¹⁹ C</em>
                        </p>
                      </div>
                      
                      <div>
                        <span className="font-medium">Calculate the result:</span>
                        <div className="my-3">
                          <BlockMath math="\Delta E = 1.6 \times 10^{-18} \text{ J}" />
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <span className="font-medium text-green-800">Answer A:</span>
                        <p className="text-green-900 mt-1">
                          The energy required is <strong>1.6 × 10⁻¹⁸ J</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Part B */}
                  <div className="bg-white p-4 rounded border border-gray-100">
                    <h5 className="font-medium text-gray-700 mb-3">Part B: If a 7.0 μC charge is allowed to move from B to A and its mass is 2.0 mg, what is its final speed if it starts from rest?</h5>
                    
                    <div className="space-y-4">
                      <div>
                        <span className="font-medium">Apply conservation of energy (Electric PE → Kinetic energy):</span>
                        <div className="my-3">
                          <BlockMath math="E_p = E_k" />
                        </div>
                        <div className="my-3">
                          <BlockMath math="q \Delta V = \frac{1}{2}mv^2" />
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Solve for velocity:</span>
                        <div className="my-3">
                          <BlockMath math="v = \sqrt{\frac{2q \Delta V}{m}}" />
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">From B (20V) to A (25V): ΔV = 25V - 20V = 5V</span>
                        <div className="my-3">
                          <BlockMath math="v = \sqrt{\frac{2(7.0 \times 10^{-6} \text{ C})(5 \text{ V})}{2.0 \times 10^{-6} \text{ kg}}}" />
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium">Calculate the result:</span>
                        <div className="my-3">
                          <BlockMath math="v = \sqrt{\frac{7.0 \times 10^{-5}}{2.0 \times 10^{-6}}} = \sqrt{35} = 5.92 \text{ m/s}" />
                        </div>
                      </div>
                      
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <span className="font-medium text-green-800">Answer B:</span>
                        <p className="text-green-900 mt-1">
                          The final speed is <strong>5.92 m/s</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example6" title="Example 6 - Finding Mass from Electric Acceleration" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A beryllium ion (Be²⁺) is accelerated through a 0.150 MV potential difference. If its final
                  speed is 2.53 × 10⁶ m/s, what is its mass?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Convert the 2+ charge to Coulombs</span>
                      <div className="my-3">
                        <BlockMath math="q = 2^+ \times 1.60 \times 10^{-19} \text{ C} = 3.20 \times 10^{-19} \text{ C}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply conservation of energy (Electric PE → Kinetic energy)</span>
                      <div className="my-3">
                        <BlockMath math="E_p = E_k" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q \Delta V = \frac{1}{2}mv^2" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Solve for mass</span>
                      <div className="my-3">
                        <BlockMath math="m = \frac{2q \Delta V}{v^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 4: Substitute the given values</span>
                      <p className="text-sm text-gray-600 mb-2">
                        Note: 0.150 MV = 0.150 × 10⁶ V = 1.50 × 10⁵ V
                      </p>
                      <div className="my-3">
                        <BlockMath math="m = \frac{2(3.20 \times 10^{-19} \text{ C})(1.50 \times 10^5 \text{ V})}{(2.53 \times 10^6 \text{ m/s})^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 5: Calculate the numerator and denominator</span>
                      <div className="my-3">
                        <BlockMath math="\text{Numerator: } 2 \times 3.20 \times 10^{-19} \times 1.50 \times 10^5 = 9.60 \times 10^{-14} \text{ J}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\text{Denominator: } (2.53 \times 10^6)^2 = 6.40 \times 10^{12} \text{ m}^2\text{/s}^2" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 6: Calculate the final result</span>
                      <div className="my-3">
                        <BlockMath math="m = \frac{9.60 \times 10^{-14}}{6.40 \times 10^{12}} = 1.50 \times 10^{-26} \text{ kg}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The mass of the beryllium ion is <strong>1.50 × 10⁻²⁶ kg</strong>.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Physical Insight:</h5>
                      <p className="text-blue-900 text-sm">
                        This example demonstrates how electric potential differences can be used to determine 
                        the mass of charged particles by measuring their final velocity after acceleration. 
                        This principle is fundamental to mass spectrometry and particle physics experiments.
                      </p>
                    </div>
                  </div>
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

      {/* Practice Questions */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="30-electric-potential"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_30_question1',
            title: 'Question 1: Spark Gap Potential'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_30_question2',
            title: 'Question 2: Alpha Particle Speed'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_30_question3',
            title: 'Question 3: Fluorine Nucleus Energy'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_30_question4',
            title: 'Question 4: Alpha Particle Acceleration'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_30_question5',
            title: 'Question 5: Proton Momentum'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_30_question6',
            title: 'Question 6: Electron Collision Speed'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Electric potential energy is the energy of a charged object due to its position in an electric field",
          "Electric potential (V) is the change in electric potential energy per unit charge: ΔV = ΔEp/q",
          "Electric potential is measured in volts (V) where 1 V = 1 J/C; it is a scalar quantity",
          "Only potential differences (ΔV) between two points can be measured, not absolute potential",
          "Conservation of energy: electric potential energy converts to kinetic energy (qΔV = ½mv²)",
          "Equipotential lines connect points of equal electric potential and are perpendicular to field lines",
          "No work is required to move a charge along an equipotential line",
          "Parallel plates create uniform electric fields with equally spaced equipotential lines"
        ]}
      />
    </LessonContent>
  );
};

export default ElectricPotential;