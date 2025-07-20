import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Image path constants for magnetic forces on particles lesson
const ASSET_PATH = '/courses/2/content/37-magnetic-forces-particles/assests/';
const images = {
  // Charged particle diagrams
  chargedParticleField: `${ASSET_PATH}Charged particle in magnetic field - charged particle in magnetic field.png`,
  inducedMagneticForce: `${ASSET_PATH}Charged particle in magnetic field - induced magnetic force.png`,
  
  // Example problem diagrams
  example1Diagram: `${ASSET_PATH}Example 1 - diagram.png`,
  example2Diagram: `${ASSET_PATH}Example 2 - diagram.png`,
  
  // Third hand rule diagram
  thirdHandRule: `${ASSET_PATH}Third hand rule - hand diagram.png`,
  
  // Particle motion diagram
  particleCurves: `${ASSET_PATH}Particles in magnetic fields - particle curves when entering a magnetic field.png`,
  
  // Mass spectrometer diagram
  massSpectrometer: `${ASSET_PATH}Mass spectrometer - main parts diagram.png`,
  
  // Television application diagram
  televisionDiagram: `${ASSET_PATH}Black and white television - electron gun and magnetic coils diagram.png`,
  
  // Practice problem diagrams
  practice3: `${ASSET_PATH}37-practice3diagram.png`,
  practice4: `${ASSET_PATH}37-practice4diagram.png`
};

const MagneticForcesParticles = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_37_magnetic_forces_particles"
      title="Lesson 20 - Magnetic Forces on Particles"
      metadata={{ estimated_time: '60 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="charged-particles-fields" title="Charged Particles in External Magnetic Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      In the previous lesson we learned that when a charged particle is in motion, a magnetic field is 
                      induced around the particle which is perpendicular to the motion of the particle.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Moving Charged Particle</h4>
                    <div className="text-center mb-4">
                      <img 
                        src={images.chargedParticleField} 
                        alt="Charged particle in magnetic field showing field interactions" 
                        className="w-full max-w-md mx-auto rounded border border-blue-300 mb-2"
                      />
                      <p className="text-xs text-blue-800 font-medium">Charged particle creating magnetic field</p>
                    </div>
                    <p className="text-blue-900 text-center">
                      What would happen if this particle was projected through an existing magnetic field, 
                      say between two bar magnets?
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Particle in External Magnetic Field</h4>
                    <div className="text-center mb-4">
                      <img 
                        src={images.inducedMagneticForce} 
                        alt="Induced magnetic force on charged particle in external field" 
                        className="w-full max-w-md mx-auto rounded border border-yellow-300 mb-2"
                      />
                      <p className="text-xs text-yellow-800 font-medium">Magnetic force interaction between particle and external field</p>
                    </div>
                    <p className="text-yellow-900">
                      The induced magnetic field around the moving particle will interact with the external 
                      magnetic field, resulting in a force.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Field Interaction Analysis</h4>
                    <p className="text-green-900 mb-3">
                      The direction of the force can be determined by studying how the magnetic fields interact. 
                      In the diagram, the ⟶ symbol represents the direction of the induced magnetic field around 
                      the particle at that point. The arrow head is like an induced north pole and the tail is 
                      like an induced south pole.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Above the Particle</h5>
                        <p className="text-sm text-green-900">
                          The induced magnetic field arrow is attracted toward the south and north poles 
                          of the magnets, resulting in a downward force.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Below the Particle</h5>
                        <p className="text-sm text-green-900">
                          The induced and external magnetic fields repel one another, resulting, again, 
                          in a downward force.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Key Result</h4>
                    <p className="text-purple-900 font-medium">
                      The result of a charged particle going through a magnetic field is the particle will be 
                      deflected by a force which is perpendicular to both the original direction of the particle's 
                      motion and the external magnetic field.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="third-hand-rule" title="Third Hand Rule - Direction of the Magnetic Force" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      To find the direction of the force between a particle and an external field, we use the 
                      <strong> third hand rule</strong>. Notice that we are dealing with three quantities; particle direction (v), 
                      magnetic field direction (B) and force direction (F), which are all perpendicular to 
                      each other.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">3D Coordinate System Analogy</h4>
                    <p className="text-blue-900 mb-3">
                      This is similar to the x, y and z coordinates from mathematics where x and 
                      y are in the plane of the page and z points perpendicular out of the page.
                    </p>
                    <div className="text-center">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">3D Coordinate System</div>
                        <div className="grid grid-cols-3 gap-4 text-center">
                          <div>
                            <div className="font-bold text-blue-800">x</div>
                            <div className="text-xs text-gray-600">horizontal</div>
                          </div>
                          <div>
                            <div className="font-bold text-blue-800">y</div>
                            <div className="text-xs text-gray-600">vertical</div>
                          </div>
                          <div>
                            <div className="font-bold text-blue-800">z</div>
                            <div className="text-xs text-gray-600">out of page</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">The Third Hand Rule</h4>
                    
                    <div className="text-center mb-4">
                      <img 
                        src={images.thirdHandRule} 
                        alt="Third hand rule technique for determining magnetic force direction" 
                        className="w-full max-w-sm mx-auto rounded border border-green-300 mb-2"
                      />
                      <p className="text-xs text-green-800 font-medium">Third hand rule visualization</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">👉</span>
                        <span className="text-green-900">
                          The <strong>fingers</strong> point in the direction of the external magnetic field (B) from north to south.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">👍</span>
                        <span className="text-green-900">
                          The <strong>thumb</strong> points in the direction of the particle's motion (v).
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">🤚</span>
                        <span className="text-green-900">
                          The <strong>palm</strong> indicates the direction of the resulting force on the particle (F).
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Hand Rule Convention</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Right Hand</h5>
                        <p className="text-sm text-yellow-900">Used for positive charges</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Left Hand</h5>
                        <p className="text-sm text-yellow-900">Used for negative charges</p>
                      </div>
                    </div>
                    <p className="text-yellow-900 mt-3 text-sm">
                      Like the other hand rules, this convention ensures consistent results for different charge types.
                    </p>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> Refer to Pearson pages 593 to 597.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Direction of Deflecting Force" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  For the following diagram, what is the direction of the deflecting force if the particle is:
                  <br />A. an electron
                  <br />B. an alpha particle
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="text-center mb-4">
                    <img 
                      src={images.example1Diagram} 
                      alt="Example 1: Particle in magnetic field setup for force direction analysis" 
                      className="w-full max-w-md mx-auto rounded border border-blue-300"
                    />
                    <p className="text-sm text-gray-600 mt-2">Magnetic field setup - particle moving into page between N and S poles</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">A. Electron (negative charge)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">1.</span>
                          <span className="text-blue-900">Use left hand (negative charge)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">2.</span>
                          <span className="text-blue-900">Fingers point to the right (N → S)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">3.</span>
                          <span className="text-blue-900">Thumb points into the page (particle direction)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">4.</span>
                          <span className="text-blue-900">Palm indicates force direction</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300 mt-3">
                        <span className="font-medium text-blue-800">Result:</span>
                        <p className="text-blue-900 mt-1">Force is <strong>up the page</strong></p>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 mb-2">B. Alpha particle (positive charge)</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">1.</span>
                          <span className="text-red-900">Use right hand (positive charge)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">2.</span>
                          <span className="text-red-900">Fingers point to the right (N → S)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">3.</span>
                          <span className="text-red-900">Thumb points into the page (particle direction)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">4.</span>
                          <span className="text-red-900">Palm indicates force direction</span>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300 mt-3">
                        <span className="font-medium text-red-800">Result:</span>
                        <p className="text-red-900 mt-1">Force is <strong>down the page</strong></p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Key Observation:</span>
                      <p className="text-green-900 mt-1">
                        Opposite charges experience forces in opposite directions under identical conditions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="magnitude-deflecting-force" title="Magnitude of the Deflecting Force" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The deflecting force on a charged particle moving through an external magnetic field is 
                      calculated using:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">General Magnetic Force Formula</h4>
                    <div className="text-center mb-3">
                      <BlockMath math="F_m = qvB\sin\theta" />
                    </div>
                    <div className="space-y-2 text-sm text-blue-900">
                      <div><strong>Where:</strong></div>
                      <div>F<sub>m</sub> = deflecting force from the magnetic field (N)</div>
                      <div>B = magnetic flux density or magnetic field strength (Tesla) (T)</div>
                      <div>q = charge of moving particle (C)</div>
                      <div>v = speed of particle (m/s)</div>
                      <div>θ = angle between v and B</div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Maximum Force Condition</h4>
                    <p className="text-yellow-900 mb-3">
                      The maximum deflecting force will occur when v and B are perpendicular (θ = 90°).
                      Since sin 90° = 1:
                    </p>
                    <div className="text-center">
                      <BlockMath math="F_m = qvB" />
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Important Notes</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900">
                          The force is always perpendicular to both the velocity and magnetic field
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900">
                          Maximum force occurs when the particle moves perpendicular to the field
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900">
                          No force occurs when the particle moves parallel to the field (θ = 0°, sin 0° = 0)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Acceleration Calculation" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 20 mg particle with a charge of +2.0 μC enters a 0.020 T magnetic field at 90° to the 
                  field. If the speed of the particle is 40 m/s, what is the acceleration that is experienced 
                  by the particle in the diagram below?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="text-center mb-4">
                    <img 
                      src={images.example2Diagram} 
                      alt="Example 2: Charged particle acceleration calculation setup" 
                      className="w-full max-w-md mx-auto rounded border border-blue-300"
                    />
                    <p className="text-sm text-gray-600 mt-2">Example 2 setup: +2.0 μC particle, 20 mg, 40 m/s in 0.020 T field</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Calculate the magnetic force</span>
                      <div className="my-3">
                        <BlockMath math="F_m = qvB" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_m = (2.0 \times 10^{-6} \text{ C})(40 \text{ m/s})(0.020 \text{ T})" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_m = 1.6 \times 10^{-6} \text{ N}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply Newton's Second Law</span>
                      <div className="my-3">
                        <BlockMath math="F_{NET} = ma" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = \frac{F_{NET}}{m} = \frac{1.6 \times 10^{-6} \text{ N}}{0.000020 \text{ kg}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = 8.0 \times 10^{-2} \text{ m/s}^2" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The acceleration is <strong>8.0 × 10⁻² m/s² upward out of the page</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Magnetic Field Strength" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the magnetic field strength if an electron traveling at 400 m/s experiences a 
                  deflecting force of 2.0 × 10⁻¹⁹ N when it enters at 90° to the field?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Rearrange the magnetic force formula to solve for B</span>
                      <div className="my-3">
                        <BlockMath math="F_m = qvB" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="B = \frac{F_m}{qv}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the known values</span>
                      <div className="my-3">
                        <BlockMath math="B = \frac{2.0 \times 10^{-19} \text{ N}}{(1.6 \times 10^{-19} \text{ C})(400 \text{ m/s})}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="B = \frac{2.0 \times 10^{-19}}{6.4 \times 10^{-17}} \text{ T}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="B = 3.1 \times 10^{-3} \text{ T}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The magnetic field strength is <strong>3.1 × 10⁻³ T</strong> or <strong>3.1 mT</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4 - Force at an Angle" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An alpha particle enters a 50 mT field at 30° to the field at a speed of 500 m/s. 
                  What is the deflecting force experienced by the alpha particle?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-medium text-yellow-800 mb-2">Important Information:</h5>
                    <p className="text-sm text-yellow-900">
                      An α²⁺ particle has a charge of 2 × 1.60 × 10⁻¹⁹ C = 3.20 × 10⁻¹⁹ C.
                    </p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Apply the general magnetic force formula</span>
                      <div className="my-3">
                        <BlockMath math="F_m = qvB\sin\theta" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substitute the known values</span>
                      <div className="my-3">
                        <BlockMath math="F_m = (3.20 \times 10^{-19} \text{ C})(500 \text{ m/s})(0.050 \text{ T})\sin(30°)" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_m = (3.20 \times 10^{-19})(500)(0.050)(0.5) \text{ N}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_m = 4.0 \times 10^{-18} \text{ N}" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">Note about sin(30°):</h5>
                      <p className="text-sm text-blue-900">
                        sin(30°) = 0.5, which reduces the force compared to perpendicular entry (sin(90°) = 1).
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The deflecting force is <strong>4.0 × 10⁻¹⁸ N</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="particles-magnetic-fields" title="Particles in Magnetic Fields - Circular Motion" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      When a charged particle enters a magnetic field at 90° to the field, the particle 
                      experiences a force which is perpendicular to its velocity. Consider the diagram below 
                      of a negative particle entering a magnetic field.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Particle Path Visualization</h4>
                    <div className="text-center mb-4">
                      <img 
                        src={images.particleCurves} 
                        alt="Charged particle following curved path when entering magnetic field" 
                        className="w-full max-w-lg mx-auto rounded border border-blue-300 mb-2"
                      />
                      <p className="text-xs text-blue-800 font-medium">Particle curves when entering magnetic field at 90°</p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Key Observations</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          The speed of the particle is not affected by the magnetic force
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          The direction of the particle's motion changes continuously
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          A force acting perpendicular to motion results in uniform circular motion (Physics 20)
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Circular Motion Analysis</h4>
                    <p className="text-green-900 mb-3">
                      Therefore, the magnetic force manifests as a centripetal force:
                    </p>
                    <div className="text-center space-y-3">
                      <BlockMath math="F_m = F_c" />
                      <BlockMath math="qvB = \frac{mv^2}{r}" />
                      <BlockMath math="r = \frac{mv}{qB}" />
                    </div>
                    <p className="text-green-900 text-center mt-3 text-sm">
                      (note that one of the v's cancels out)
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Important Note</h4>
                    <p className="text-red-900">
                      For problems involving a particle entering a magnetic field the derivation of the relationship 
                      between speed, mass, charge, radius of curvature and magnetic field strength must be 
                      always be shown.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Key Relationship</h4>
                    <p className="text-purple-900">
                      This is a very important relationship that we will be working with throughout the 
                      remainder of the course.
                    </p>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> Refer to Pearson pages 596 to 601 for a discussion of particle motion in a magnetic field.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5 - Radius of Electron's Path" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An electron traveling at 6.0 × 10⁶ m/s enters a magnetic field of 40 mT. 
                  What is the radius of the electron's path?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Show the derivation (required)</span>
                      <div className="my-3">
                        <BlockMath math="F_m = F_c" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="qvB = \frac{mv^2}{r}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="r = \frac{mv}{qB}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Substitute known values</span>
                      <div className="my-3 text-sm">
                        <div>m<sub>electron</sub> = 9.11 × 10⁻³¹ kg</div>
                        <div>q<sub>electron</sub> = 1.6 × 10⁻¹⁹ C</div>
                        <div>v = 6.0 × 10⁶ m/s</div>
                        <div>B = 40 × 10⁻³ T</div>
                      </div>
                      <div className="my-3">
                        <BlockMath math="r = \frac{(9.11 \times 10^{-31} \text{ kg})(6.0 \times 10^6 \text{ m/s})}{(1.6 \times 10^{-19} \text{ C})(40 \times 10^{-3} \text{ T})}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="r = \frac{5.466 \times 10^{-24}}{6.4 \times 10^{-21}} \text{ m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="r = 8.54 \times 10^{-4} \text{ m}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The radius of the electron's path is <strong>8.54 × 10⁻⁴ m</strong> or <strong>0.854 mm</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="velocity-selectors" title="Velocity Selectors" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      A <strong>velocity selector</strong> is a device for measuring the speed of a charged particle. The drawing shows a 
                      velocity selector that consists of a cylindrical tube located within a constant magnetic field B. 
                      Inside the tube there is a parallel plate system that produces a uniform electric field E.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">How It Works</h4>
                    <p className="text-blue-900 mb-3">
                      A moving charged particle, in this case a positive charge, experiences a magnetic force and an 
                      electric force at the same time. If the magnetic and electric forces are equal and opposite, 
                      the net force on the charged particle is zero resulting in the particle moving undeflected 
                      through the fields.
                    </p>
                    
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">Velocity Selector Diagram</div>
                        <div className="space-y-2 text-sm">
                          <div>Electric field E ⊥ Magnetic field B</div>
                          <div>F<sub>E</sub> ← (+) → F<sub>B</sub></div>
                          <div>Balanced forces → straight path</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Force Balance Analysis</h4>
                    <p className="text-green-900 mb-3">The forces are balanced:</p>
                    <div className="text-center space-y-3">
                      <BlockMath math="F_E = F_B" />
                      <BlockMath math="qE = qvB" />
                      <BlockMath math="v = \frac{E}{B}" />
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Selectivity Principle</h4>
                    <p className="text-yellow-900 mb-3">
                      Note that only particles with a particular speed will pass through the selector. For 
                      particles with different speeds the forces will not be equal and the particle will be 
                      deflected away either up or down.
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-yellow-300 text-center">
                        <h5 className="font-medium text-yellow-800 mb-1">v &lt; E/B</h5>
                        <p className="text-xs text-yellow-900">F<sub>E</sub> &gt; F<sub>B</sub><br/>Deflected by electric field</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300 text-center">
                        <h5 className="font-medium text-yellow-800 mb-1">v = E/B</h5>
                        <p className="text-xs text-yellow-900">F<sub>E</sub> = F<sub>B</sub><br/>Passes through</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300 text-center">
                        <h5 className="font-medium text-yellow-800 mb-1">v &gt; E/B</h5>
                        <p className="text-xs text-yellow-900">F<sub>E</sub> &lt; F<sub>B</sub><br/>Deflected by magnetic field</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Important Note</h4>
                    <p className="text-red-900">
                      For problems involving a velocity selector, the derivation of the relationship between speed, 
                      electric field strength, and magnetic field strength must be always be shown.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example6" title="Example 6 - Speed in Velocity Selector" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An electron enters an electric field (4.5 × 10⁵ N/C) and a perpendicular magnetic field 
                  (2.5 × 10⁻² T) and passes through both fields undeflected. What is the speed of the electron?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Show the derivation (required)</span>
                      <div className="my-3">
                        <BlockMath math="F_E = F_B" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="qE = qvB" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v = \frac{E}{B}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Substitute the known values</span>
                      <div className="my-3">
                        <BlockMath math="v = \frac{4.5 \times 10^5 \text{ N/C}}{2.5 \times 10^{-2} \text{ T}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v = \frac{4.5 \times 10^5}{2.5 \times 10^{-2}} \text{ m/s}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v = 1.8 \times 10^7 \text{ m/s}" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">Physical Interpretation:</h5>
                      <p className="text-sm text-blue-900">
                        The electron travels at 18,000,000 m/s (about 6% the speed of light) to maintain 
                        balance between electric and magnetic forces.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The speed of the electron is <strong>1.8 × 10⁷ m/s</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="mass-spectrometer" title="Mass Spectrometer (Mass Spectrograph)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      An instrument that makes use of the combination of centripetal motion and magnetic 
                      deflection of charged particles is the <strong>mass spectrometer</strong>. A mass spectrometer is an 
                      instrument that separates particles according to their masses.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Example Application: Lithium Isotopes</h4>
                    <p className="text-blue-900 mb-3">
                      Say, for example, a scientist wants to study the isotopes of lithium. Isotopes, you may recall 
                      from chemistry, have the same atomic number (number of protons) but a different atomic mass 
                      (number of protons + neutrons).
                    </p>
                    <p className="text-blue-900">
                      The element is first placed in an ion generation and accelerator chamber where it is ionized 
                      (the atoms are stripped of their outer electrons) resulting in Li⁺ ions. The ions are then 
                      accelerated through an electric potential and they pass into the spectrometer.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Separation Principle</h4>
                    <p className="text-yellow-900">
                      Since every ion has the same charge, speed and initial path, any differences in their circular 
                      paths are due to differences in mass – the lighter isotopes will travel in smaller circles 
                      than heavier isotopes.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Mass Spectrometer Components</h4>
                    
                    <div className="text-center mb-4">
                      <img 
                        src={images.massSpectrometer} 
                        alt="Mass spectrometer main parts diagram showing ion source, velocity selector, and ion separator" 
                        className="w-full max-w-lg mx-auto rounded border border-green-300 mb-2"
                      />
                      <p className="text-xs text-green-800 font-medium">Complete mass spectrometer setup</p>
                    </div>
                    
                    <h5 className="font-semibold text-green-800 mb-3">Three Basic Parts:</h5>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">1.</span>
                        <span className="text-green-900">
                          <strong>Ion source and accelerator</strong> - Ionizes atoms and accelerates them
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">2.</span>
                        <span className="text-green-900">
                          <strong>Velocity selector</strong> - Ensures all ions have the same speed
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">3.</span>
                        <span className="text-green-900">
                          <strong>Ion separator</strong> - Separates ions by mass using magnetic deflection
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Detailed Process</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <h5 className="font-medium text-purple-800 mb-2">Ion Generator and Accelerator</h5>
                        <p className="text-purple-900 text-sm">
                          Atoms are ionized either by extreme heating or by electrical discharge. The ions are 
                          then accelerated through a potential difference (V) where they gain kinetic energy 
                          E<sub>k</sub> = qV (see Lesson 16).
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-purple-800 mb-2">Velocity Selector</h5>
                        <p className="text-purple-900 text-sm mb-2">
                          Once the ions pass through the accelerator opening they will have different speeds 
                          depending on the charge and mass of the ion. The ion separation chamber requires 
                          that the ions have the same speed so they are passed through a velocity selector.
                        </p>
                        <div className="text-center">
                          <BlockMath math="v = \frac{E}{B_1}" />
                        </div>
                        <p className="text-purple-900 text-sm mt-2">
                          Only particles with a certain speed will pass through the selector.
                        </p>
                      </div>
                      
                      <div>
                        <h5 className="font-medium text-purple-800 mb-2">Ion Separator</h5>
                        <p className="text-purple-900 text-sm mb-2">
                          After leaving the velocity selector, the charged particles enter a different magnetic 
                          field (B₂) that deflects the ions in a circular path.
                        </p>
                        <div className="text-center space-y-2">
                          <BlockMath math="F_m = F_c" />
                          <BlockMath math="qvB_2 = \frac{mv^2}{r}" />
                          <BlockMath math="m = \frac{qB_2r}{v}" />
                        </div>
                        <p className="text-purple-900 text-sm mt-2">
                          An ion detector marks the point where the ion contacts the detector plate. The radius 
                          of the circular path can then be measured and the mass of the isotope is calculated.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example7" title="Example 7 - Uranium Isotope Separation" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  Uranium isotopes, uranium–235 and uranium–239, can be separated using a mass spectrometer. 
                  The uranium–235 isotope travels through a smaller circle and can be gathered at a different 
                  point than the uranium–239. During World War II, the Manhattan project was attempting to make 
                  an atomic bomb. Uranium–235 is fissionable but it makes up only 0.70% of the uranium on Earth. 
                  A large mass spectrometer at Oak Ridge, Tennessee was used to separate uranium–235 from the 
                  raw uranium metal.
                </p>
                
                <p className="mb-4">
                  Uranium–235 and uranium–239 ions, each with a charge of +2, are directed into a velocity 
                  selector which has a magnetic field of 0.250 T and an electric field of 1.25 × 10⁷ V/m 
                  perpendicular to each other. The ions then pass into a magnetic field of 2.00 mT. What is 
                  the radius of deflection for each isotope?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Calculate charges and masses</span>
                      <div className="my-3 text-sm">
                        <div>A charge of +2 means that each ion has lost two electrons:</div>
                        <div>q = 2 × (+1.60 × 10⁻¹⁹ C) = +3.20 × 10⁻¹⁹ C</div>
                        <div className="mt-2">Since each proton and neutron has a mass of 1.67 × 10⁻²⁷ kg:</div>
                        <div>m₂₃₅ = 235 × (1.67 × 10⁻²⁷ kg) = 3.9245 × 10⁻²⁵ kg</div>
                        <div>m₂₃₉ = 239 × (1.67 × 10⁻²⁷ kg) = 3.9913 × 10⁻²⁵ kg</div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate velocity from velocity selector</span>
                      <div className="my-3">
                        <BlockMath math="F_E = F_B" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="qE = qvB_1" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="v = \frac{E}{B_1} = \frac{1.25 \times 10^7 \text{ V/m}}{0.250 \text{ T}} = 5.00 \times 10^7 \text{ m/s}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Calculate radius for each isotope in ion separator</span>
                      <div className="my-3">
                        <BlockMath math="F_m = F_c \Rightarrow qvB_2 = \frac{mv^2}{r} \Rightarrow r = \frac{mv}{qB_2}" />
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mt-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <h5 className="font-medium text-blue-800 mb-2">Uranium-235:</h5>
                          <div className="text-sm">
                            <BlockMath math="r_{235} = \frac{(3.9245 \times 10^{-25})(5.00 \times 10^7)}{(3.20 \times 10^{-19})(2.00 \times 10^{-3})}" />
                            <BlockMath math="r_{235} = 3.07 \times 10^4 \text{ m}" />
                          </div>
                        </div>
                        
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h5 className="font-medium text-red-800 mb-2">Uranium-239:</h5>
                          <div className="text-sm">
                            <BlockMath math="r_{239} = \frac{(3.9913 \times 10^{-25})(5.00 \times 10^7)}{(3.20 \times 10^{-19})(2.00 \times 10^{-3})}" />
                            <BlockMath math="r_{239} = 3.12 \times 10^4 \text{ m}" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <div className="text-green-900 mt-1">
                        <div>Uranium-235 radius: <strong>3.07 × 10⁴ m</strong></div>
                        <div>Uranium-239 radius: <strong>3.12 × 10⁴ m</strong></div>
                        <div className="text-sm mt-2">The smaller radius for U-235 allows separation from U-239.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="van-allen-belts" title="Van Allen Radiation Belts" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      When a charged particle enters a large magnetic field at an angle between 0° and 90°, 
                      the particle will begin to spiral toward one of the magnetic poles. The spiral results from 
                      part of the particle's velocity being converted into circular motion and the remainder 
                      keeps the particle moving along a path perpendicular to the rotation of the circular component.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Earth's Magnetic Protection</h4>
                    <p className="text-blue-900 mb-3">
                      The Earth has a large magnetic field surrounding it. Incoming charged particles from 
                      the sun interact with the magnetic field and spiral toward either the north or south pole. 
                      When they eventually enter the Earth's atmosphere, the collisions between the particles 
                      and the atmospheric gases create the <strong>Aurora Borealis</strong> (northern lights) and the 
                      <strong>Aurora Australis</strong> (southern lights).
                    </p>
                    <p className="text-blue-900">
                      If the magnetic field was not there, the charged particles may reach the Earth's surface 
                      and may be harmful to life.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Discovery and Naming</h4>
                    <p className="text-green-900 mb-3">
                      In 1958, a team of scientists finally confirmed the existence of the spiraling particles. 
                      The magnetic field area containing the charged particles is now called the <strong>Van Allen 
                      Radiation Belt</strong> in honor of the scientist leading the team.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Key Features</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          Charged particles spiral along Earth's magnetic field lines
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          Particles are trapped in radiation belts around Earth
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          Atmospheric collisions create beautiful aurora displays
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          Magnetic field provides essential protection for life on Earth
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Environmental Impact</h4>
                    <p className="text-purple-900">
                      The Van Allen radiation belts are a crucial component of Earth's natural defense system 
                      against harmful solar radiation, making life on our planet possible.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="television-application" title="Black and White Television" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Since a magnetic field changes the path of a moving electron, a properly designed field 
                      can direct an electron wherever the designer wishes. In a television picture tube, 
                      electrons are fired through a potential difference of about 50000 V and are then directed 
                      by horizontal and vertical magnetic coils toward the front of the picture tube – the TV screen.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">TV Picture Tube Components</h4>
                    
                    <div className="text-center mb-4">
                      <img 
                        src={images.televisionDiagram} 
                        alt="Black and white television electron gun and magnetic coils diagram" 
                        className="w-full max-w-lg mx-auto rounded border border-blue-300 mb-2"
                      />
                      <p className="text-xs text-blue-800 font-medium">TV picture tube with electron gun and magnetic deflection coils</p>
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-white p-3 rounded border border-blue-300 text-center">
                        <div className="font-bold text-blue-800">Electron Gun</div>
                        <div className="text-xs text-blue-700 mt-1">Fires electrons</div>
                        <div className="text-xs text-blue-700">~50,000 V</div>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300 text-center">
                        <div className="font-bold text-blue-800">Magnetic Coils</div>
                        <div className="text-xs text-blue-700 mt-1">Horizontal & Vertical</div>
                        <div className="text-xs text-blue-700">Deflection control</div>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300 text-center">
                        <div className="font-bold text-blue-800">Phosphorous Screen</div>
                        <div className="text-xs text-blue-700 mt-1">Glows when hit</div>
                        <div className="text-xs text-blue-700">Creates image</div>
                      </div>
                    </div>
                    
                    <p className="text-blue-900">
                      The screen is coated with a thin film of phosphorus material. When an electron hits the 
                      coating, the coating glows for a brief instant. Thus, if the electrons are properly 
                      directed, a picture can be formed.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">How TV Images Work</h4>
                    <p className="text-yellow-900 mb-3">
                      An image on the TV screen is actually a series of still pictures seen in rapid sequence. 
                      As in motion pictures, the impression of motion is only an illusion. But in TV, you do not 
                      see one complete picture at one time.
                    </p>
                    <p className="text-yellow-900">
                      Each picture on the screen (there are <strong>30 complete pictures</strong> being scanned every second) 
                      is sketched by a moving spot of varying intensity. The spot is produced as the electrons 
                      strike the coating and produce visible light.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Technical Specifications</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900">
                          To produce a single complete picture, the spot traces <strong>525 lines</strong>
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900">
                          The electron beam makes <strong>15,750 horizontal passes</strong> every second
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900">
                          The electron beam must be controlled with great speed and precision
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Engineering Marvel</h4>
                    <p className="text-purple-900">
                      The television represents a sophisticated application of magnetic force principles, 
                      demonstrating how fundamental physics concepts enable complex technological applications 
                      that impact daily life.
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
            <h3 className="text-xl font-semibold mb-3">Charged Particles in External Magnetic Fields</h3>
            <p>When moving charged particles encounter external magnetic fields...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Third Hand Rule</h3>
            <p>Direction of magnetic force on charged particles...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Examples 1-4</h3>
            <p>Force direction and magnitude calculations...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Particles in Magnetic Fields</h3>
            <p>Circular motion and centripetal force relationships...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 5</h3>
            <p>Radius calculations for charged particle paths...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Velocity Selectors</h3>
            <p>Devices for measuring particle speeds...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 6</h3>
            <p>Speed calculations in velocity selectors...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Mass Spectrometer</h3>
            <p>Separating particles by mass...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 7</h3>
            <p>Uranium isotope separation...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Van Allen Radiation Belts</h3>
            <p>Earth's magnetic field protection...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Black and White Television</h3>
            <p>Practical application of magnetic forces...</p>
          </TextSection>
        </div>
      )}

      {/* Knowledge Check Questions */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="37-magnetic-forces-particles"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question1',
            title: 'Question 1: Permanent vs Electromagnets'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question2',
            title: 'Question 2: Horseshoe Magnet Force Direction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question3',
            title: 'Question 3: Particle Charge Identification'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question4',
            title: 'Question 4: Radius-Velocity Relationship'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question5',
            title: 'Question 5: Force Calculation at Angle'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question6',
            title: 'Question 6: Parallel Motion in Field'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question7',
            title: 'Question 7: Alpha Particle Force'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question8',
            title: 'Question 8: Magnesium Ion Radius'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question9',
            title: 'Question 9: Alpha Force Direction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question10',
            title: 'Question 10: Solar Wind Electron'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question11',
            title: 'Question 11: Solar Wind Proton'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question12',
            title: 'Question 12: Alpha Charge Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question13',
            title: 'Question 13: Deuteron Acceleration'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_37_question14',
            title: 'Question 14: Helical Motion Pitch'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Moving charged particles induce magnetic fields perpendicular to their motion",
          "Charged particles in external magnetic fields experience deflecting forces",
          "Force direction determined by interaction between induced and external magnetic fields",
          "Third hand rule: fingers = B direction, thumb = v direction, palm = F direction",
          "Right hand for positive charges, left hand for negative charges",
          "Magnetic force formula: F_m = qvB sin θ (maximum when θ = 90°)",
          "Magnetic force always perpendicular to both velocity and magnetic field",
          "Perpendicular magnetic force causes uniform circular motion (centripetal force)",
          "Circular path radius: r = mv/(qB) - derived from F_m = F_c",
          "Particle speed unaffected by magnetic force, only direction changes",
          "Velocity selectors use balanced electric and magnetic forces: v = E/B",
          "Only particles with specific speed v = E/B pass through velocity selector",
          "Mass spectrometers separate isotopes using magnetic deflection principles",
          "Three components: ion source/accelerator, velocity selector, ion separator",
          "Lighter isotopes follow smaller circular paths than heavier isotopes",
          "Manhattan Project used mass spectrometry to separate uranium-235 from uranium-239",
          "Van Allen radiation belts trap charged solar particles in Earth's magnetic field",
          "Magnetic deflection protects Earth's surface from harmful solar radiation",
          "Aurora displays result from trapped particles colliding with atmosphere",
          "Television picture tubes use magnetic coils to direct electron beams precisely",
          "TV images created by electron beam tracing 525 lines 30 times per second",
          "Magnetic force applications range from particle physics to consumer electronics"
        ]}
      />
    </LessonContent>
  );
};

export default MagneticForcesParticles;