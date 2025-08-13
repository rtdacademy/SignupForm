import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Unit4Review = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_47_unit_4_review"
      title="Unit 4 Review - Magnetism and Electromagnetic Phenomena"
      metadata={{ estimated_time: '120 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="unit-overview" title="Unit 4 Overview - Journey Through Magnetism and EM Phenomena" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Unit 4 Review! This unit explores magnetism and electromagnetic phenomena, 
                    covering six essential lessons that reveal the deep connections between electricity and 
                    magnetism, culminating in our understanding of electromagnetic radiation.
                  </p>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">Unit 4 Learning Path</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800">Lesson 19 - Magnetic Fields</h5>
                        <p className="text-sm text-red-900">Magnetic field properties, field lines, and basic magnetism</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800">Lesson 20 - Magnetic Forces on Particles</h5>
                        <p className="text-sm text-red-900">Forces on moving charges and particles in magnetic fields</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800">Lesson 21 - Motor Effect</h5>
                        <p className="text-sm text-red-900">Forces on current-carrying conductors and motor principles</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800">Lesson 22 - Generator Effect</h5>
                        <p className="text-sm text-red-900">Electromagnetic induction, Faraday's and Lenz's laws</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800">Activities - Practical Applications</h5>
                        <p className="text-sm text-red-900">Real-world applications and problem-solving</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800">Lesson 24 - Electromagnetic Radiation</h5>
                        <p className="text-sm text-red-900">EM spectrum, wave properties, and radiation phenomena</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="magnetic-fields" title="Magnetic Fields - The Foundation of Magnetism" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Key Concepts - Magnetic Fields</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Magnetic Field Properties</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Magnetic fields surround all magnets and current-carrying conductors</li>
                          <li>• Field direction: North to South outside magnet, South to North inside</li>
                          <li>• Magnetic field lines never cross each other</li>
                          <li>• Field strength indicated by line density</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Sources of Magnetic Fields</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Permanent magnets (ferromagnetic materials)</li>
                          <li>• Electric currents (moving charges)</li>
                          <li>• Electromagnets (current in coils)</li>
                          <li>• Earth's magnetic field</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Right-Hand Rules</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• <strong>Straight wire:</strong> Thumb = current, fingers curl = field direction</li>
                          <li>• <strong>Coil:</strong> Fingers curl with current, thumb = field direction</li>
                          <li>• <strong>Force:</strong> Index = field, middle = current, thumb = force</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="magnetic-forces" title="Magnetic Forces on Particles - Motion in Magnetic Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Magnetic Force on Moving Charges</h4>
                    
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="space-y-2">
                          <div><BlockMath>{"\\vec{F} = q\\vec{v} \\times \\vec{B}"}</BlockMath></div>
                          <div className="text-sm">Magnetic force = charge × velocity × magnetic field</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Force Magnitude</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"F = qvB\\sin\\theta"}</BlockMath>
                        </div>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• <InlineMath>{"q"}</InlineMath> = charge (C)</li>
                          <li>• <InlineMath>{"v"}</InlineMath> = speed (m/s)</li>
                          <li>• <InlineMath>{"B"}</InlineMath> = magnetic field strength (T, tesla)</li>
                          <li>• <InlineMath>{"\\theta"}</InlineMath> = angle between velocity and field</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Circular Motion in Uniform Field</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"r = \\frac{mv}{qB}"}</BlockMath>
                        </div>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Charged particles follow circular paths</li>
                          <li>• Radius depends on mass, velocity, charge, and field strength</li>
                          <li>• Period: <InlineMath>{"T = \\frac{2\\pi m}{qB}"}</InlineMath></li>
                          <li>• Applications: cyclotrons, mass spectrometers</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Key Properties</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Force is always perpendicular to both velocity and field</li>
                          <li>• Magnetic force does no work (perpendicular to motion)</li>
                          <li>• Kinetic energy remains constant</li>
                          <li>• Only changes direction, not speed</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="motor-effect" title="Motor Effect - Forces on Current-Carrying Conductors" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Motor Principle and Forces</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Force on Current-Carrying Wire</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"\\vec{F} = I\\vec{L} \\times \\vec{B}"}</BlockMath>
                        </div>
                        <div className="text-center mb-2">
                          <BlockMath>{"F = ILB\\sin\\theta"}</BlockMath>
                        </div>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• <InlineMath>{"I"}</InlineMath> = current (A)</li>
                          <li>• <InlineMath>{"L"}</InlineMath> = length of conductor (m)</li>
                          <li>• <InlineMath>{"B"}</InlineMath> = magnetic field strength (T)</li>
                          <li>• <InlineMath>{"\\theta"}</InlineMath> = angle between current and field</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Motor Components</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• <strong>Stator:</strong> Provides magnetic field (permanent magnets or electromagnets)</li>
                          <li>• <strong>Rotor/Armature:</strong> Current-carrying conductors that experience force</li>
                          <li>• <strong>Commutator:</strong> Reverses current direction for continuous rotation</li>
                          <li>• <strong>Brushes:</strong> Maintain electrical contact with rotating commutator</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Applications</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Electric motors (DC and AC)</li>
                          <li>• Loudspeakers (voice coil)</li>
                          <li>• Galvanometers and ammeters</li>
                          <li>• Magnetic levitation systems</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="generator-effect" title="Generator Effect - Electromagnetic Induction" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-3">Electromagnetic Induction Laws</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Faraday's Law</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"\\mathcal{E} = -N\\frac{d\\Phi_B}{dt}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• <InlineMath>{"\\mathcal{E}"}</InlineMath> = induced EMF (V)</li>
                          <li>• <InlineMath>{"N"}</InlineMath> = number of turns in coil</li>
                          <li>• <InlineMath>{"\\Phi_B = BA\\cos\\theta"}</InlineMath> = magnetic flux (Wb)</li>
                          <li>• EMF induced when magnetic flux changes</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Lenz's Law</h5>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Direction of induced current opposes the change causing it</li>
                          <li>• Conserves energy (prevents perpetual motion)</li>
                          <li>• Explains the negative sign in Faraday's law</li>
                          <li>• Induced effects resist changes in magnetic flux</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Methods of Inducing EMF</h5>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Change magnetic field strength (vary current in electromagnet)</li>
                          <li>• Change area of coil (expand/contract coil)</li>
                          <li>• Change orientation (rotate coil in field)</li>
                          <li>• Move conductor through field (motional EMF)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Motional EMF</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"\\mathcal{E} = BLv"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• EMF induced in conductor moving through magnetic field</li>
                          <li>• <InlineMath>{"L"}</InlineMath> = length of conductor</li>
                          <li>• <InlineMath>{"v"}</InlineMath> = velocity perpendicular to field</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="practical-applications" title="Practical Applications - Motors, Generators, and Transformers" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">Real-World Applications</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-medium text-orange-800 mb-2">Electric Generators</h5>
                        <ul className="text-orange-900 text-sm space-y-1">
                          <li>• Convert mechanical energy to electrical energy</li>
                          <li>• AC generators: rotating coil in magnetic field</li>
                          <li>• DC generators: use commutator to rectify current</li>
                          <li>• Power plants, wind turbines, bicycle dynamos</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-medium text-orange-800 mb-2">Transformers</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"\\frac{V_s}{V_p} = \\frac{N_s}{N_p}"}</BlockMath>
                        </div>
                        <ul className="text-orange-900 text-sm space-y-1">
                          <li>• Change AC voltage levels using mutual induction</li>
                          <li>• Step-up: increase voltage (more secondary turns)</li>
                          <li>• Step-down: decrease voltage (fewer secondary turns)</li>
                          <li>• Power transmission, adapters, welding equipment</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-medium text-orange-800 mb-2">Electromagnetic Devices</h5>
                        <ul className="text-orange-900 text-sm space-y-1">
                          <li>• Relays and contactors (electromagnetic switches)</li>
                          <li>• Solenoids and actuators</li>
                          <li>• Magnetic brakes and clutches</li>
                          <li>• Induction heating systems</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electromagnetic-radiation" title="Electromagnetic Radiation - Waves and the EM Spectrum" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">Electromagnetic Wave Properties</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Wave Equations</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"c = f\\lambda"}</BlockMath>
                        </div>
                        <div className="text-center mb-2">
                          <BlockMath>{"E = hf = \\frac{hc}{\\lambda}"}</BlockMath>
                        </div>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• <InlineMath>{"c = 3.00 \\times 10^8"}</InlineMath> m/s (speed of light)</li>
                          <li>• <InlineMath>{"f"}</InlineMath> = frequency (Hz)</li>
                          <li>• <InlineMath>{"\\lambda"}</InlineMath> = wavelength (m)</li>
                          <li>• <InlineMath>{"h = 6.626 \\times 10^{-34}"}</InlineMath> J⋅s (Planck's constant)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">EM Spectrum (increasing frequency)</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• <strong>Radio waves:</strong> AM/FM radio, cell phones, WiFi</li>
                          <li>• <strong>Microwaves:</strong> Microwave ovens, radar, satellite communication</li>
                          <li>• <strong>Infrared:</strong> Heat radiation, night vision, remote controls</li>
                          <li>• <strong>Visible light:</strong> Human vision (400-700 nm)</li>
                          <li>• <strong>Ultraviolet:</strong> Sunburn, sterilization, fluorescence</li>
                          <li>• <strong>X-rays:</strong> Medical imaging, crystallography</li>
                          <li>• <strong>Gamma rays:</strong> Nuclear decay, cancer treatment</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Wave Properties</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Transverse waves with electric and magnetic field components</li>
                          <li>• Electric and magnetic fields perpendicular to each other</li>
                          <li>• Both fields perpendicular to direction of propagation</li>
                          <li>• Can travel through vacuum (no medium required)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Generation and Detection</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Generated by accelerating electric charges</li>
                          <li>• Detected by interaction with matter</li>
                          <li>• Higher frequency = higher energy per photon</li>
                          <li>• Applications depend on frequency/wavelength</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="key-formulas" title="Unit 4 Formula Summary" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4">Essential Formulas for Unit 4</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Magnetic Forces</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"F = qvB\\sin\\theta"}</InlineMath> (Force on charge)</div>
                          <div><InlineMath>{"F = ILB\\sin\\theta"}</InlineMath> (Force on wire)</div>
                          <div><InlineMath>{"r = \\frac{mv}{qB}"}</InlineMath> (Circular motion radius)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Electromagnetic Induction</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"\\mathcal{E} = -N\\frac{d\\Phi_B}{dt}"}</InlineMath> (Faraday's Law)</div>
                          <div><InlineMath>{"\\mathcal{E} = BLv"}</InlineMath> (Motional EMF)</div>
                          <div><InlineMath>{"\\Phi_B = BA\\cos\\theta"}</InlineMath> (Magnetic Flux)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Transformers</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"\\frac{V_s}{V_p} = \\frac{N_s}{N_p}"}</InlineMath> (Voltage ratio)</div>
                          <div><InlineMath>{"\\frac{I_s}{I_p} = \\frac{N_p}{N_s}"}</InlineMath> (Current ratio)</div>
                          <div><InlineMath>{"P_p = P_s"}</InlineMath> (Power conservation)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">EM Waves</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"c = f\\lambda"}</InlineMath> (Wave equation)</div>
                          <div><InlineMath>{"E = hf = \\frac{hc}{\\lambda}"}</InlineMath> (Photon energy)</div>
                          <div><InlineMath>{"c = 3.00 \\times 10^8"}</InlineMath> m/s</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h5 className="font-medium text-yellow-800 mb-2">Important Constants</h5>
                      <div className="text-sm text-yellow-900 space-y-1">
                        <div><InlineMath>{"c = 3.00 \\times 10^8"}</InlineMath> m/s (Speed of light)</div>
                        <div><InlineMath>{"h = 6.626 \\times 10^{-34}"}</InlineMath> J⋅s (Planck's constant)</div>
                        <div><InlineMath>{"e = 1.602 \\times 10^{-19}"}</InlineMath> C (Elementary charge)</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : null}

      {/* Practice Questions Section */}
      <div className="my-8">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-red-800 mb-4">Unit 4 Practice Questions</h3>
          <p className="text-red-700 mb-4">
            Test your understanding of magnetism and electromagnetic phenomena with these practice questions 
            covering all six lessons in Unit 4.
          </p>
          
          {/* SlideshowKnowledgeCheck Component */}
          <SlideshowKnowledgeCheck
        course={course}
            lessonPath="47-unit-4-review"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q1',
                title: 'Question 1: Magnetic Field Properties'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q2',
                title: 'Question 2: Right-Hand Rules'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q3',
                title: 'Question 3: Force on Moving Charge'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q4',
                title: 'Question 4: Circular Motion in Magnetic Field'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q5',
                title: 'Question 5: Force on Current-Carrying Wire'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q6',
                title: 'Question 6: Motor Principle'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q7',
                title: 'Question 7: Faraday\'s Law'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q8',
                title: 'Question 8: Lenz\'s Law'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q9',
                title: 'Question 9: Motional EMF'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q10',
                title: 'Question 10: Transformers'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q11',
                title: 'Question 11: EM Wave Properties'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q12',
                title: 'Question 12: EM Spectrum'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q13',
                title: 'Question 13: Wave-Particle Duality'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q14',
                title: 'Question 14: Practical Applications'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_47_unit4_q15',
                title: 'Question 15: Conceptual Integration'
              }
            ]}
            courseId={courseId}
            course={course}
          />
        </div>
      </div>

      {/* Study Tips and Strategies */}
      <TextSection>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-green-800 mb-4">Study Tips for Unit 4</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Conceptual Understanding</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Master the right-hand rules for field direction and force direction</li>
                <li>• Understand the connection between electricity and magnetism</li>
                <li>• Visualize magnetic field lines and their properties</li>
                <li>• Connect microscopic (moving charges) to macroscopic (motors, generators)</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Problem-Solving Strategies</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Always start with a clear diagram showing field directions</li>
                <li>• Use right-hand rules to determine force directions</li>
                <li>• Check units throughout calculations (Tesla, Webers, etc.)</li>
                <li>• Distinguish between magnetic force and electromagnetic induction</li>
                <li>• Apply Lenz's law to determine induced current directions</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Common Mistakes to Avoid</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Confusing magnetic force direction with field direction</li>
                <li>• Forgetting that magnetic force is always perpendicular to velocity</li>
                <li>• Mixing up Faraday's law and motional EMF formulas</li>
                <li>• Ignoring the sign in Lenz's law (direction of induced current)</li>
                <li>• Confusing frequency and wavelength in EM radiation problems</li>
              </ul>
            </div>
          </div>
        </div>
      </TextSection>

      {/* Unit Summary */}
      <LessonSummary>
        <div className="space-y-4">
          <p>
            Unit 4 reveals the profound connections between electricity and magnetism, showing how moving 
            charges create magnetic fields, how magnetic fields can exert forces on charges and currents, 
            and how changing magnetic fields can induce electrical effects.
          </p>
          
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">Key Takeaways</h4>
            <ul className="text-red-900 text-sm space-y-1">
              <li>• Magnetic fields are created by moving charges and current</li>
              <li>• Magnetic forces on charges depend on charge, velocity, and field strength</li>
              <li>• Motors convert electrical energy to mechanical energy using magnetic forces</li>
              <li>• Generators convert mechanical energy to electrical energy via induction</li>
              <li>• Electromagnetic radiation encompasses all waves in the EM spectrum</li>
              <li>• All EM phenomena are interconnected through Maxwell's equations</li>
            </ul>
          </div>
          
          <p>
            These concepts form the foundation for understanding modern technology including electric motors, 
            generators, transformers, radio communications, and electromagnetic radiation applications in 
            medicine, astronomy, and everyday life.
          </p>
        </div>
      </LessonSummary>
    </LessonContent>
  );
};

export default Unit4Review;