import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const MotorEffect = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_38_motor_effect"
      title="Lesson 21 - Motor Effect"
      metadata={{ estimated_time: '55 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="current-carrying-wires" title="Current Carrying Wires in External Magnetic Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      From the previous lesson we have determined that when a charged particle goes through a 
                      magnetic field the particle will be deflected by a force which is perpendicular to both 
                      the original direction of the particle's motion and the external magnetic field.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Electric current is defined as the flow of charged particles past a given point over a 
                      specific period of time. If charged particles flowing through a magnetic field are 
                      deflected, then it follows that a current carrying conductor will be deflected when 
                      in a magnetic field.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Key Relationship</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">Individual charged particles</div>
                        <div className="text-2xl mb-2">⬇</div>
                        <div className="text-sm">Current carrying conductor</div>
                        <div className="text-xs text-gray-600 mt-2">Both experience force in magnetic field</div>
                      </div>
                    </div>
                    <p className="text-blue-900">
                      Since current is the collective motion of many charged particles, a current-carrying 
                      wire will experience the same deflecting force as individual particles.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Experimental Observation</h4>
                    <p className="text-yellow-900">
                      When a current-carrying conductor is placed in a magnetic field, the conductor 
                      experiences a force that causes it to move. This is the fundamental principle 
                      behind electric motors.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Applications</h4>
                    <p className="text-green-900">
                      This phenomenon is the basis for many technological applications including electric 
                      motors, loudspeakers, and galvanometers. Understanding this force is crucial for 
                      designing electromagnetic devices.
                    </p>
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
                  A current-carrying conductor is placed in a magnetic field. The current runs from left 
                  to right, and the magnetic field points into the page. Using the right-hand rule, 
                  determine the direction of the deflecting force on the conductor.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Identify the given information</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Current direction: left to right →</li>
                        <li>Magnetic field direction: into the page ⊗</li>
                        <li>Need to find: direction of force</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply the right-hand rule</span>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                        <ul className="list-disc ml-4 space-y-1 text-sm">
                          <li>Point fingers in direction of current (left to right)</li>
                          <li>Curl fingers in direction of magnetic field (into page)</li>
                          <li>Thumb points in direction of force</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The deflecting force on the conductor is directed <strong>upward</strong> (toward the top of the page).
                      </p>
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
                  A vertical conductor carries current downward and is placed in a horizontal magnetic 
                  field pointing from north to south. Determine the direction of the force on the conductor.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Identify the given information</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Current direction: downward ↓</li>
                        <li>Magnetic field direction: north to south (horizontal)</li>
                        <li>Need to find: direction of force</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply the right-hand rule</span>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                        <ul className="list-disc ml-4 space-y-1 text-sm">
                          <li>Point fingers in direction of current (downward)</li>
                          <li>Curl fingers in direction of magnetic field (north to south)</li>
                          <li>Thumb points in direction of force</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The deflecting force on the conductor is directed <strong>eastward</strong> (perpendicular to both current and field).
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
                  A horizontal wire carries current from east to west. The wire is placed in a uniform 
                  magnetic field pointing vertically upward. What is the direction of the magnetic force 
                  on the wire?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Identify the given information</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Current direction: east to west →</li>
                        <li>Magnetic field direction: vertically upward ↑</li>
                        <li>Need to find: direction of magnetic force</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply the right-hand rule</span>
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-2">
                        <ul className="list-disc ml-4 space-y-1 text-sm">
                          <li>Point fingers in direction of current (east to west)</li>
                          <li>Curl fingers in direction of magnetic field (upward)</li>
                          <li>Thumb points in direction of force</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The magnetic force on the wire is directed <strong>northward</strong> (perpendicular to both the current and magnetic field).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="magnitude-force" title="Magnitude of the Deflecting Force on a Conductor" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The magnitude of the deflecting force on a current-carrying conductor in a magnetic 
                      field can be calculated using a formula derived from the fundamental principles of 
                      electromagnetic interactions.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Force on a Current-Carrying Conductor</h4>
                    <div className="text-center mb-4">
                      <BlockMath math="F = BIL\sin\theta" />
                    </div>
                    <div className="text-sm text-blue-800">
                      <p><strong>Where:</strong></p>
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>F = force on the conductor (N)</li>
                        <li>B = magnetic field strength (T)</li>
                        <li>I = current through the conductor (A)</li>
                        <li>L = length of conductor in the magnetic field (m)</li>
                        <li>θ = angle between current direction and magnetic field</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Derivation from First Principles</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-yellow-900 text-sm mb-2">
                          Starting with the force on a single charged particle:
                        </p>
                        <div className="text-center">
                          <BlockMath math="F_{particle} = qvB\sin\theta" />
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-yellow-900 text-sm mb-2">
                          For current I = q/t, and considering N particles moving distance L in time t:
                        </p>
                        <div className="text-center">
                          <BlockMath math="F_{total} = N \cdot qvB\sin\theta = \frac{Nq}{t} \cdot L \cdot B\sin\theta = ILB\sin\theta" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Special Cases</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Maximum Force (θ = 90°)</h5>
                        <div className="text-center mb-2">
                          <BlockMath math="F_{max} = BIL" />
                        </div>
                        <p className="text-sm text-green-900">
                          When current is perpendicular to magnetic field
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">No Force (θ = 0°)</h5>
                        <div className="text-center mb-2">
                          <BlockMath math="F = 0" />
                        </div>
                        <p className="text-sm text-green-900">
                          When current is parallel to magnetic field
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Important Notes</h4>
                    <ul className="text-purple-900 text-sm space-y-1">
                      <li>• The force is always perpendicular to both the current direction and magnetic field</li>
                      <li>• The force is proportional to the current strength</li>
                      <li>• Only the length of conductor within the magnetic field contributes to the force</li>
                      <li>• This is the fundamental principle behind electric motors</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A straight conductor 25 cm long carries a current of 8.0 A. The conductor is placed 
                  perpendicular to a uniform magnetic field of strength 0.40 T. Calculate the force 
                  acting on the conductor.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Length: L = 25 cm = 0.25 m</li>
                        <li>Current: I = 8.0 A</li>
                        <li>Magnetic field: B = 0.40 T</li>
                        <li>Angle: θ = 90° (perpendicular)</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Apply the force formula:</span>
                      <div className="my-3">
                        <BlockMath math="F = BIL\sin\theta" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = (0.40 \text{ T})(8.0 \text{ A})(0.25 \text{ m})\sin(90°)" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = (0.40)(8.0)(0.25)(1)" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = 0.80 \text{ N}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The force acting on the conductor is <strong>0.80 N</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A current-carrying wire 15 cm long experiences a force of 0.36 N when placed in a 
                  magnetic field of 0.60 T. The wire makes a 30° angle with the magnetic field lines. 
                  Calculate the current flowing through the wire.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Length: L = 15 cm = 0.15 m</li>
                        <li>Force: F = 0.36 N</li>
                        <li>Magnetic field: B = 0.60 T</li>
                        <li>Angle: θ = 30°</li>
                        <li>Find: Current I</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Rearrange the force formula to solve for current:</span>
                      <div className="my-3">
                        <BlockMath math="F = BIL\sin\theta" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{F}{BL\sin\theta}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the given values:</span>
                      <div className="my-3">
                        <BlockMath math="I = \frac{0.36 \text{ N}}{(0.60 \text{ T})(0.15 \text{ m})\sin(30°)}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{0.36}{(0.60)(0.15)(0.50)}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{0.36}{0.045}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = 8.0 \text{ A}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The current flowing through the wire is <strong>8.0 A</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="current-balance" title="The Current Balance" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The current balance is an important scientific instrument that was historically used 
                      to measure electric current very precisely. It operates on the principle that a 
                      current-carrying conductor experiences a force when placed in a magnetic field.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">How the Current Balance Works</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">1.</span>
                        <span className="text-blue-900 text-sm">
                          A horizontal conductor carrying current is suspended from a sensitive balance
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">2.</span>
                        <span className="text-blue-900 text-sm">
                          The conductor is placed in a known magnetic field
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">3.</span>
                        <span className="text-blue-900 text-sm">
                          The magnetic force on the conductor is balanced by adding weights to the other side
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">4.</span>
                        <span className="text-blue-900 text-sm">
                          The current can be calculated using F = BIL
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Principle of Operation</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-yellow-300 inline-block">
                        <div className="text-sm mb-2">Force Balance Equation</div>
                        <BlockMath math="F_{magnetic} = F_{gravitational}" />
                        <div className="mt-2">
                          <BlockMath math="BIL = mg" />
                        </div>
                        <div className="text-xs text-gray-600 mt-2">where m is the mass added to balance</div>
                      </div>
                    </div>
                    <p className="text-yellow-900 text-sm">
                      By measuring the mass required to balance the magnetic force and knowing the 
                      magnetic field strength and conductor length, the current can be determined.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Historical Significance</h4>
                    <div className="space-y-2">
                      <p className="text-green-900 text-sm">
                        The current balance was one of the first instruments capable of making precise 
                        electrical measurements. It was crucial in:
                      </p>
                      <ul className="text-green-900 text-sm space-y-1 ml-4">
                        <li>• Establishing electrical standards</li>
                        <li>• Defining the ampere</li>
                        <li>• Calibrating other electrical instruments</li>
                        <li>• Advancing electromagnetic theory</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Modern Applications</h4>
                    <p className="text-purple-900 text-sm">
                      While digital instruments have largely replaced current balances for routine 
                      measurements, the underlying principle is still used in precision force 
                      measurements and in defining fundamental electrical units at national 
                      standards laboratories.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example6" title="Example 6" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A current balance has a conductor 20 cm long positioned perpendicular to a magnetic 
                  field of 0.25 T. When a current flows through the conductor, a mass of 15 g must be 
                  added to the opposite side to balance the magnetic force. Calculate the current 
                  flowing through the conductor.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Length: L = 20 cm = 0.20 m</li>
                        <li>Magnetic field: B = 0.25 T</li>
                        <li>Balancing mass: m = 15 g = 0.015 kg</li>
                        <li>Angle: θ = 90° (perpendicular)</li>
                        <li>Gravitational acceleration: g = 9.8 m/s²</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Set up the force balance:</span>
                      <div className="my-3">
                        <BlockMath math="F_{magnetic} = F_{gravitational}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="BIL = mg" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Solve for current:</span>
                      <div className="my-3">
                        <BlockMath math="I = \frac{mg}{BL}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{(0.015 \text{ kg})(9.8 \text{ m/s}^2)}{(0.25 \text{ T})(0.20 \text{ m})}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{0.147 \text{ N}}{0.050 \text{ T⋅m}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = 2.94 \text{ A}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The current flowing through the conductor is <strong>2.94 A</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-motors" title="Electric Motors and Faraday's Electromagnetic Rotator" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The force experienced by a current-carrying conductor in a magnetic field is the 
                      fundamental principle behind electric motors. Michael Faraday was the first to 
                      demonstrate this principle practically with his electromagnetic rotator in 1821.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Faraday's Electromagnetic Rotator (1821)</h4>
                    <div className="space-y-3">
                      <p className="text-blue-900 text-sm">
                        Faraday's device consisted of a basin of mercury with a permanent magnet standing 
                        vertically in the center. A current-carrying wire, suspended so it could move freely, 
                        was placed in the mercury around the magnet.
                      </p>
                      
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">How it worked:</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Current flowed down the wire into the mercury</li>
                          <li>• The magnetic field from the permanent magnet was radial</li>
                          <li>• The force on the wire was always perpendicular to both current and field</li>
                          <li>• This created a continuous rotational force</li>
                          <li>• The wire rotated around the magnet</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Modern Electric Motors</h4>
                    <p className="text-yellow-900 text-sm mb-3">
                      Modern electric motors use the same fundamental principle but with more sophisticated 
                      designs to create continuous rotation:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Key Components:</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• <strong>Rotor:</strong> rotating coil or magnet</li>
                          <li>• <strong>Stator:</strong> stationary magnetic field</li>
                          <li>• <strong>Commutator:</strong> reverses current direction</li>
                          <li>• <strong>Brushes:</strong> maintain electrical contact</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Operating Principle:</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Current creates magnetic field in rotor</li>
                          <li>• Rotor field interacts with stator field</li>
                          <li>• Forces cause rotation</li>
                          <li>• Commutator maintains rotation direction</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Applications of the Motor Effect</h4>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-1">Electric Motors</h5>
                        <p className="text-xs text-green-900">
                          Household appliances, industrial machinery, electric vehicles
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-1">Loudspeakers</h5>
                        <p className="text-xs text-green-900">
                          Audio reproduction using voice coils in magnetic fields
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-1">Galvanometers</h5>
                        <p className="text-xs text-green-900">
                          Precise current measurement instruments
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Historical Impact</h4>
                    <p className="text-purple-900 text-sm">
                      Faraday's electromagnetic rotator was the first device to convert electrical energy 
                      into mechanical motion, making it the ancestor of all electric motors. This discovery 
                      laid the foundation for the electrical age and transformed industry, transportation, 
                      and daily life.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Energy Conversion</h4>
                    <p className="text-red-900 text-sm">
                      Electric motors convert electrical energy into mechanical energy with the fundamental 
                      relationship: <InlineMath math="P_{mechanical} = F \times v = BIL \times v" />, where 
                      the force from the motor effect does work to create motion.
                    </p>
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
            <h3 className="text-xl font-semibold mb-3">Current Carrying Wires in External Magnetic Fields</h3>
            <p>When a charged particle goes through a magnetic field, the particle will be deflected...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 1</h3>
            <p>Direction of deflecting force on current-carrying conductor...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 2</h3>
            <p>Force direction with vertical conductor and horizontal field...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 3</h3>
            <p>Magnetic force on horizontal wire in vertical field...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Magnitude of the Deflecting Force</h3>
            <p>Formula for calculating force on current-carrying conductor...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 4</h3>
            <p>Calculate force on perpendicular conductor...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 5</h3>
            <p>Calculate current from force and field measurements...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">The Current Balance</h3>
            <p>Scientific instrument for precise current measurement...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 6</h3>
            <p>Current balance calculation...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Electric Motors and Faraday's Electromagnetic Rotator</h3>
            <p>Applications of motor effect in electric motors...</p>
          </TextSection>
        </div>
      )}

      <LessonSummary
        points={[
          "Current-carrying conductors experience forces when placed in magnetic fields",
          "The force direction follows the right-hand rule: fingers point with current, curl toward field, thumb shows force",
          "Individual charged particles and current-carrying conductors both experience deflecting forces in magnetic fields",
          "The magnitude of force on a conductor is given by F = BILsinθ",
          "Maximum force occurs when current is perpendicular to magnetic field (θ = 90°)",
          "No force occurs when current is parallel to magnetic field (θ = 0°)",
          "Force is always perpendicular to both current direction and magnetic field direction",
          "The current balance uses magnetic force to measure electric current precisely",
          "Current balance operates on principle: magnetic force = gravitational force (BIL = mg)",
          "Faraday's electromagnetic rotator (1821) was the first electric motor demonstration",
          "Faraday's device used mercury, permanent magnet, and current-carrying wire to create rotation",
          "Modern electric motors use rotors, stators, commutators, and brushes for continuous operation",
          "Motor effect applications include electric motors, loudspeakers, and galvanometers",
          "Electric motors convert electrical energy into mechanical energy using F = BIL principle",
          "The motor effect laid the foundation for the electrical age and industrial transformation"
        ]}
      />
    </LessonContent>
  );
};

export default MotorEffect;