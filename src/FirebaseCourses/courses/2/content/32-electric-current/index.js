import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ElectricCurrent = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const [currentFlowType, setCurrentFlowType] = useState('conventional'); // 'conventional' or 'electron'
  const [isCurrentDirectionOpen, setIsCurrentDirectionOpen] = useState(false);

  return (
    <LessonContent
      lessonId="lesson_32_electric_current"
      title="Lesson 18 - Electric Current"
      metadata={{ estimated_time: '40 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="electrochemical" title="The Electrochemical Cell" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The electrochemical cell was discovered by Italian scientist Alessandro Volta (1745 - 1827) who 
                      designed the first electrochemical cell. An electrochemical cell is one in which a spontaneous 
                      chemical reaction produces electrical energy. Volta's cell was the first to produce a steady flow 
                      of electric current. Until his discovery, all electrical experiments used electrostatic charges 
                      produced by friction. Since the static discharge happened very quickly experiments were difficult 
                      to perform. Volta's discovery was immediately recognized as a major breakthrough by other scientists.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The charge build up at the electrodes of an electrochemical cell create a potential difference 
                      between the electrodes. The external cathode (negative pole) on a cell is the anode inside the cell. 
                      The internal anode accumulates electrons from the chemical reaction. Anions (negatively charged ions) 
                      travel to the anode where they release their electrons. The external anode (positive pole) on a cell 
                      is the cathode inside the cell. The internal cathode gives electrons away in the chemical reaction. 
                      Cations (positively charged ions) travel to the cathode where they collect electrons.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The chemical reaction will continue only if the external cathode (internal anode) gives away the 
                      excess electrons it is gathering in the cell, while the external anode (internal cathode) must 
                      replenish its supply of electrons. In other words, an external wire is required to complete the 
                      electric circuit. Without the wire nothing happens. If a conductor is connected from the external 
                      cathode to the external anode, electrons will move through the conductor and the chemical reaction 
                      in the cell will continue. Since the flow is caused by the potential difference between the external 
                      cathode and the external anode it is believed that the potential difference forces the electrons 
                      through the conductor. Thus, potential difference has incorrectly inherited the name electromotive 
                      force (EMF) because it forces electrons through the conductor. However, the term EMF is still in use. 
                      The terms potential difference and EMF can be used interchangeably. (For those who are also studying 
                      Chemistry 30, in physics our study focuses on the external circuit connecting the external cathode 
                      to the external anode. In chemistry, the focus is on what happens in the internal circuit where 
                      ions flow to the internal cathode and anode.)
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-blue-900 font-medium mb-2">External Circuit (Physics 30)</p>
                      <p className="text-blue-800 text-sm">external cathode (−) → external anode (+)</p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-green-900 font-medium mb-2">Internal Circuit (Chemistry 30)</p>
                      <p className="text-green-800 text-sm">internal anode → internal cathode</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="current-flow" title="Current Flow" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Refer to Pearson pages 602 and 603. Andreas Ampere (1775 – 1836) quickly made use of Volta's 
                      cell to study the flow of charge through a conductor. The study of electricity changed from 
                      investigating static electricity to investigating current (flowing) electricity. Ampere gave an 
                      operational definition for current flow (recall that an operational definition is based on 
                      observation, not on theory):
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Operational Definition of Current</h4>
                    <p className="text-blue-900 mb-3">
                      When a Coulomb (C) of charge flows past a given point in a conductor over a one second time 
                      interval, a current of one Ampere (1A) exists.
                    </p>
                    <div className="text-center">
                      <BlockMath math="I = \frac{q}{t}" />
                    </div>
                    <div className="mt-3 text-sm text-blue-800">
                      <p><strong>Where:</strong></p>
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>I = current (A)</li>
                        <li>q = charge (C)</li>
                        <li>t = time (s)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <BlockMath math="[1 \text{ ampere} = 1 \text{ A} = 1 \text{ C/s}]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If 1.2 × 10²⁰ electrons flow past a given point in a conductor over 2.0 seconds, what is 
                  the current?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Calculate the total charge</span>
                      <div className="my-3">
                        <BlockMath math="q = n \times e" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = (1.2 \times 10^{20})(1.60 \times 10^{-19} \text{ C})" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = 19.2 \text{ C}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the current using I = q/t</span>
                      <div className="my-3">
                        <BlockMath math="I = \frac{q}{t}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{19.2 \text{ C}}{2.0 \text{ s}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = 9.6 \text{ A}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The current is <strong>9.6 A</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="resistance" title="Resistance" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      George Simon Ohm (1787 – 1854) is responsible for the early study of conductivity of substances. 
                      He found that some substances made better conductors than others. At this point, it may be prudent 
                      to review the difference between conductors and insulators. Electric charges move through and 
                      spread over objects. A conductor is a material through which electric charges move easily.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Good conductors are items such as any metal (copper & silver), any ionic solution (dissociated 
                      into ions by the solvent) or hot gases. An insulator is any material that retards or restricts 
                      the flow of electric charge. Insulators include such items as glass, dry fibers, or dry air. 
                      However, if the potential difference across the conductor is large enough, all materials, 
                      including insulators, will conduct electricity.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Ohm found it easier to compare substances in terms of their reluctance to allow the flow of 
                      electric charge. He called the factor resistance and it is inversely related to conductivity. 
                      Ohm found that the resistance of substances was related to several factors:
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Factors Affecting Resistance:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">1.</span>
                        <span className="text-yellow-900">
                          <strong>The type of material.</strong> Each substance has a resistance value that is innate to the material.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">2.</span>
                        <span className="text-yellow-900">
                          <strong>Resistance is directly proportional to the length of the conductor.</strong> The longer the 
                          conductor, the greater the resistance. That is why the City of Calgary asks residents to use 
                          short cords to plug their cars in during the winter.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">3.</span>
                        <span className="text-yellow-900">
                          <strong>Resistance is inversely proportional to the cross sectional area of the conductor.</strong> 
                          The more area, the greater the flow of current. Like a water hose, a large diameter water hose 
                          will move more water than a small diameter hose.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">4.</span>
                        <span className="text-yellow-900">
                          <strong>Resistance is generally directly proportional to the absolute temperature of the conductor.</strong> 
                          As the temperature increases, the resistance increases.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <BlockMath math="\text{Resistance} \propto \frac{\text{material} \times \text{absolute temperature} \times \text{length}}{\text{cross sectional area}}" />
                    </div>
                    <p className="text-blue-900 text-center mt-3">
                      Resistance is measured in <strong>Ohms (Ω)</strong>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="ohms-law" title="Ohm's Law" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Ohm is remembered for the simple relationship known as Ohm's Law which is:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <BlockMath math="V = IR" />
                    </div>
                    <div className="mt-3 text-sm text-blue-800">
                      <p><strong>Where:</strong></p>
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>I = current (A)</li>
                        <li>V = potential difference (V)</li>
                        <li>R = resistance (Ω)</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">The limitations of Ohm's Law are:</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">1.</span>
                        <span className="text-yellow-900">
                          It applies only to solid conductors. It can not be used to calculate current flow 
                          through a salt solution.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">2.</span>
                        <span className="text-yellow-900">
                          Since resistance varies with temperature, Ohm's law will vary with temperature.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">3.</span>
                        <span className="text-yellow-900">
                          It applies to direct current and instantaneous alternating current.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">4.</span>
                        <span className="text-yellow-900">
                          Some combinations of materials conduct charge better in one direction than in the 
                          other. Ohm's law does not account for this situation.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 6.0 volt source is applied across a conductor with a resistance of 4.0 Ω. What is the 
                  current flow through the conductor?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Apply Ohm's Law</span>
                      <div className="my-3">
                        <BlockMath math="V = IR" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{V}{R}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the given values</span>
                      <div className="my-3">
                        <BlockMath math="I = \frac{6.0 \text{ V}}{4.0 \text{ Ω}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = 1.5 \text{ A}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The current flow through the conductor is <strong>1.5 A</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 5.4 mA current is measured across a 470 Ω resistor. What is the potential drop 
                  across the resistor?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Apply Ohm's Law</span>
                      <div className="my-3">
                        <BlockMath math="V = IR" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the given values</span>
                      <div className="my-3">
                        <BlockMath math="V = (5.4 \times 10^{-3} \text{ A})(470 \text{ Ω})" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V = 2.54 \text{ V}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The potential drop across the resistor is <strong>2.54 V</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="current-direction" title="The Direction of Electric Current" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Early in the nineteenth century, Benjamin Franklin made the assumption that there were 
                      two electrical states: one with more than the normal amount of electricity, which he 
                      called a positive charge, and one with less than the normal amount of electricity, which 
                      he called a negative charge.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Electric current was defined as the rate of movement of electrically charged particles 
                      past a point, so it was only natural to assume that the charge moved from an area 
                      where there was an excess (positive charge) to an area where there was a deficit 
                      (negative charge). Thus, the direction of the electric current was defined as moving from 
                      the positive terminal to the negative terminal of the source of electric potential. This 
                      assumption about the direction of the electric current is called <strong>"conventional current"</strong>.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Much later, after the conventional current assumption had become firmly entrenched in 
                      scientific literature, the electron was discovered. It soon became clear that what 
                      actually constituted an electric current in a solid conductor (such as a wire) was a flow 
                      of negatively charged electrons from the negative terminal to the positive terminal of the 
                      source of electric potential. This model, favored by many physicists since it gives a 
                      more accurate representation of what is actually happening in the circuit, is called 
                      <strong>"electron current"</strong> flow.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Interactive: Compare Current Flow Models</h4>
                    <p className="text-sm text-blue-900 mb-4">
                      Toggle between conventional current and electron flow to see the difference in direction:
                    </p>
                    
                    <div className="flex gap-3 mb-4 justify-center">
                      <button
                        onClick={() => setCurrentFlowType('conventional')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentFlowType === 'conventional'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                        }`}
                      >
                        Conventional Current
                      </button>
                      <button
                        onClick={() => setCurrentFlowType('electron')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          currentFlowType === 'electron'
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
                        }`}
                      >
                        Electron Flow
                      </button>
                    </div>

                    <div className="bg-white border border-blue-300 rounded-lg p-4">
                      <svg width="500" height="250" className="mx-auto">
                        {/* Background */}
                        <rect width="500" height="250" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Battery */}
                        <rect x="50" y="100" width="80" height="50" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" rx="5"/>
                        <text x="90" y="115" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">Battery</text>
                        <text x="90" y="130" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#dc2626">+</text>
                        <text x="90" y="145" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2563eb">−</text>
                        
                        {/* Wires */}
                        <line x1="130" y1="110" x2="420" y2="110" stroke="#374151" strokeWidth="4"/>
                        <line x1="130" y1="140" x2="420" y2="140" stroke="#374151" strokeWidth="4"/>
                        <line x1="420" y1="110" x2="420" y2="140" stroke="#374151" strokeWidth="4"/>
                        
                        {/* Resistor */}
                        <rect x="350" y="105" width="40" height="30" fill="#e5e7eb" stroke="#6b7280" strokeWidth="2" rx="3"/>
                        <text x="370" y="123" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#374151">R</text>
                        
                        {/* Current flow arrows and labels */}
                        <defs>
                          <marker id="arrowhead-current-flow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" 
                              fill={currentFlowType === 'conventional' ? '#dc2626' : '#059669'} />
                          </marker>
                        </defs>
                        
                        {currentFlowType === 'conventional' && (
                          <>
                            {/* Conventional current arrows (clockwise) */}
                            <line x1="150" y1="105" x2="330" y2="105" 
                              stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead-current-flow)"/>
                            <line x1="425" y1="120" x2="425" y2="130" 
                              stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead-current-flow)"/>
                            <line x1="400" y1="145" x2="150" y2="145" 
                              stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrowhead-current-flow)"/>
                            
                            <text x="240" y="95" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#dc2626">
                              Conventional Current
                            </text>
                            <text x="240" y="80" textAnchor="middle" fontSize="12" fill="#dc2626">
                              (+ to −)
                            </text>
                          </>
                        )}
                        
                        {currentFlowType === 'electron' && (
                          <>
                            {/* Electron flow arrows (counterclockwise) */}
                            <line x1="330" y1="105" x2="150" y2="105" 
                              stroke="#059669" strokeWidth="3" markerEnd="url(#arrowhead-current-flow)"/>
                            <line x1="425" y1="130" x2="425" y2="120" 
                              stroke="#059669" strokeWidth="3" markerEnd="url(#arrowhead-current-flow)"/>
                            <line x1="150" y1="145" x2="400" y2="145" 
                              stroke="#059669" strokeWidth="3" markerEnd="url(#arrowhead-current-flow)"/>
                            
                            {/* Electron symbols */}
                            {[180, 220, 260, 300].map(x => (
                              <g key={x}>
                                <circle cx={x} cy="105" r="4" fill="#059669"/>
                                <text x={x} y="109" textAnchor="middle" fontSize="8" fontWeight="bold" fill="white">e⁻</text>
                              </g>
                            ))}
                            
                            <text x="240" y="95" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#059669">
                              Electron Flow
                            </text>
                            <text x="240" y="80" textAnchor="middle" fontSize="12" fill="#059669">
                              (− to +)
                            </text>
                          </>
                        )}
                        
                        {/* Terminal labels */}
                        <text x="45" y="105" fontSize="16" fontWeight="bold" fill="#dc2626" textAnchor="end">+</text>
                        <text x="45" y="150" fontSize="16" fontWeight="bold" fill="#2563eb" textAnchor="end">−</text>
                        
                        {/* Description */}
                        <text x="250" y="200" textAnchor="middle" fontSize="12" fill="#6b7280">
                          {currentFlowType === 'conventional' 
                            ? 'Franklin\'s original assumption: positive charge flows from + to −'
                            : 'Reality: electrons (negative charges) flow from − to +'
                          }
                        </text>
                        
                        <text x="250" y="220" textAnchor="middle" fontSize="11" fill="#6b7280">
                          {currentFlowType === 'conventional' 
                            ? 'Used in circuit analysis and engineering'
                            : 'What actually happens in solid conductors'
                          }
                        </text>
                      </svg>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Important Note:</h4>
                    <p className="text-purple-900">
                      It should be noted that the term "current" will be used to denote the magnitude of the 
                      rate of charge flow. For example, a current of ten amperes can refer to an electron flow 
                      rate of ten coulombs per second or a conventional current of 10 coulombs per second.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">Conventional Current</h5>
                      <ul className="text-sm text-red-900 space-y-1">
                        <li>• Flows from positive to negative</li>
                        <li>• Benjamin Franklin's assumption</li>
                        <li>• Used in circuit analysis</li>
                        <li>• Standard in engineering</li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Electron Flow</h5>
                      <ul className="text-sm text-green-900 space-y-1">
                        <li>• Flows from negative to positive</li>
                        <li>• What actually happens physically</li>
                        <li>• Electrons are the charge carriers</li>
                        <li>• Preferred by some physicists</li>
                      </ul>
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
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">The Electrochemical Cell</h3>
            <p>The electrochemical cell was discovered by Italian scientist Alessandro Volta...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Current Flow</h3>
            <p>Andreas Ampere quickly made use of Volta's cell to study the flow of charge...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 1</h3>
            <p>Calculate current from electron flow...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Resistance</h3>
            <p>George Simon Ohm is responsible for the early study of conductivity...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Ohm's Law</h3>
            <p>Ohm is remembered for the simple relationship V = IR...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 2</h3>
            <p>Apply Ohm's Law to calculate current...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 3</h3>
            <p>Apply Ohm's Law to calculate voltage...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">The Direction of Electric Current</h3>
            <p>Benjamin Franklin's assumptions about current direction...</p>
          </TextSection>
        </div>
      )}

      {/* Practice Questions */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="32-electric-current"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question1',
            title: 'Question 1: Toaster Current Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question2',
            title: 'Question 2: Light Bulb Charge'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question3',
            title: 'Question 3: Electroscope Discharge Current'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question4',
            title: 'Question 4: Motor Time Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question5',
            title: 'Question 5: Electrons per Second'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question6',
            title: 'Question 6: Radio Resistance'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question7',
            title: 'Question 7: Clothes Dryer Current'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question8',
            title: 'Question 8: TV Tube Voltage'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question9',
            title: 'Question 9: Toaster Current from Voltage'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question10',
            title: 'Question 10: Load Voltage Requirement'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_32_question11',
            title: 'Question 11: Conventional Current vs Electron Flow'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Alessandro Volta (1745-1827) invented the first electrochemical cell",
          "Electrochemical cells convert chemical energy to electrical energy through spontaneous reactions",
          "External cathode (negative) corresponds to internal anode where electrons accumulate",
          "External anode (positive) corresponds to internal cathode where electrons are consumed", 
          "Anions travel to anode and release electrons; cations travel to cathode and collect electrons",
          "External wire is required to complete circuit and maintain continuous chemical reaction",
          "Electromotive force (EMF) is another term for potential difference that drives electron flow",
          "Andreas Ampere (1775-1836) defined current as charge flow: I = q/t (measured in amperes)",
          "Current of 1 ampere = 1 coulomb of charge flowing past a point in 1 second",
          "George Ohm (1787-1854) studied conductivity and resistance of materials",
          "Conductors allow easy charge flow; insulators restrict charge flow",
          "Resistance depends on material type, length, cross-sectional area, and temperature",
          "Resistance is measured in ohms (Ω) and is inversely related to conductivity",
          "Ohm's Law: V = IR relates voltage, current, and resistance in simple circuits",
          "Ohm's Law applies only to solid conductors and varies with temperature",
          "Ohm's Law works for direct current and instantaneous alternating current",
          "Benjamin Franklin defined conventional current as flowing from positive to negative terminals",
          "Electron flow is the actual physical process: electrons move from negative to positive",
          "Both models give same current magnitude; only direction differs between them"
        ]}
      />
    </LessonContent>
  );
};

export default ElectricCurrent;
