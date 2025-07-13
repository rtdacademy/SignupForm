import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const GeneratorEffect = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_40_generator_effect"
      title="Lesson 22 - Generator Effect"
      metadata={{ estimated_time: '75 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="electromagnetic-induction" title="Electromagnetic Induction - Michael Faraday" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      In 1821, Michael Faraday invented the first electric motor. He publicly stated that if 
                      current had an effect on magnetism, then magnetism might have a corresponding effect 
                      on current. Faraday began to investigate the possibilities, but it would be ten years 
                      before the phenomena would be successfully demonstrated.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Historical Timeline - The Race to Discovery</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Joseph Henry (Early 1831)</h5>
                        <p className="text-sm text-blue-900">
                          First to observe electromagnetic induction at Albany, New York. Did not publish 
                          results due to teaching responsibilities taking priority over research. Intended 
                          to publish during summer months but delayed too long.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Michael Faraday (1831)</h5>
                        <p className="text-sm text-blue-900">
                          Made the breakthrough in England and immediately published his results. 
                          Historically credited as the first to successfully demonstrate electromagnetic 
                          induction or the generator effect.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Faraday's Iron Ring Experiment</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-yellow-300 inline-block">
                        <div className="text-sm mb-2">Iron Ring Apparatus</div>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="text-xs">Primary Coil</div>
                            <div className="text-2xl">🔄</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs">Iron Ring</div>
                            <div className="text-2xl">⭕</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs">Secondary Coil</div>
                            <div className="text-2xl">🔄</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Current in primary → magnetic field in ring → current in secondary</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-yellow-900 text-sm">
                        <strong>Key Observations:</strong>
                      </p>
                      <ul className="text-yellow-900 text-sm space-y-1 ml-4">
                        <li>• Constant current in primary coil → no current in secondary coil</li>
                        <li>• Turning ON primary current → short-lived current in secondary coil</li>
                        <li>• Turning OFF primary current → short-lived current in opposite direction</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Faraday's Conclusion</h4>
                    <p className="text-green-900 text-sm mb-3">
                      The turning on of current in the primary coil caused a magnetic field to be induced 
                      inside the iron ring. This <strong>changing magnetic field</strong> generated an induced 
                      current in the secondary coil. Once current was constant, no changing magnetic field 
                      existed, so no current was generated.
                    </p>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-green-800 font-medium text-center">
                        The key element: A changing (or moving) magnetic field
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Further Discovery</h4>
                    <p className="text-purple-900 text-sm">
                      Faraday found that the iron ring was not necessary – the phenomena would occur with 
                      just two coils in close proximity. He concluded that the magnetic field traveled through 
                      the air from the first coil to the second coil. James Clerk Maxwell would later use this 
                      observation to show that light energy was electromagnetic wave energy.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="faraday-experiments" title="Faraday's Three Basic Experimental Situations" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Faraday discovered the basic principles of electromagnetic induction through three 
                      fundamental experimental situations:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">1. Moving Wire Through Horseshoe Magnet</h4>
                    <div className="text-center mb-4">
                      <img 
                        src="/courses/2/content/39-generator-effect/assets/Faradays_law_electromagnetic_induction_1.png" 
                        alt="Faraday's first experimental setup showing wire moving through horseshoe magnet" 
                        className="w-full max-w-md mx-auto rounded border border-blue-300 mb-2"
                      />
                      <p className="text-xs text-blue-800 font-medium">Faraday's first experimental situation: Moving wire through magnetic field</p>
                    </div>
                    <ul className="text-blue-900 text-sm space-y-1 ml-4">
                      <li>• Electron flow occurred only when the conductor was moving</li>
                      <li>• Direction of electron flow depended on direction of wire movement</li>
                      <li>• Multiple loops of wire multiplied the voltage produced</li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">2. Bar Magnet and Solenoid</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-3 rounded border border-yellow-300 inline-block">
                        <div className="text-sm mb-2">Plunging Magnet Into Coil</div>
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-2xl">🧲</div>
                          <div className="text-2xl">→</div>
                          <div className="text-2xl">🌀</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Bar magnet moving in/out of solenoid</div>
                      </div>
                    </div>
                    <ul className="text-yellow-900 text-sm space-y-1 ml-4">
                      <li>• Relative motion of magnet and coil produced current in coil wire</li>
                      <li>• Current direction depended on whether magnet was entering or leaving</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">3. Magnetizing and Demagnetizing Iron Core</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-3 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Iron Core Magnetization</div>
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-2xl">🧲</div>
                          <div className="text-xl">⚡</div>
                          <div className="text-2xl">⚙️</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">Touching and removing magnet from iron core</div>
                      </div>
                    </div>
                    <ul className="text-green-900 text-sm space-y-1 ml-4">
                      <li>• Electron flow occurred only when core was becoming magnetized or demagnetized</li>
                      <li>• A changing magnetic field produced a current</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Faraday's Law of Electromagnetic Induction</h4>
                    <p className="text-purple-900 font-medium text-center">
                      A changing magnetic field induces a current in a conductor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="motor-vs-generator" title="Generator Effect vs Motor Effect Comparison" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      How does the generator effect compare with the motor effect? The two phenomena are 
                      complementary - they represent opposite energy conversions using the same physical 
                      principles.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Motor Effect (Electrical → Mechanical)</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">Current flows A to B (into page)</div>
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-sm">A</span>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-red-600">N</span>
                            <div className="text-2xl">⊗</div>
                            <span className="font-bold text-blue-600">S</span>
                          </div>
                          <span className="text-sm">B</span>
                        </div>
                        <div className="text-sm mt-2">Force pushes wire upward ↑</div>
                        <div className="text-xs text-gray-600 mt-1">Left hand rule: primary motion causes secondary motion</div>
                      </div>
                    </div>
                    <p className="text-blue-900 text-sm">
                      Input: electrical current → Output: mechanical force and motion
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Generator Effect (Mechanical → Electrical)</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Wire pulled upward through field</div>
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-sm">B</span>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-red-600">N</span>
                            <div className="text-2xl">↑</div>
                            <span className="font-bold text-blue-600">S</span>
                          </div>
                          <span className="text-sm">A</span>
                        </div>
                        <div className="text-sm mt-2">Induced current flows B to A</div>
                        <div className="text-xs text-gray-600 mt-1">Opposite direction to motor effect</div>
                      </div>
                    </div>
                    <p className="text-green-900 text-sm">
                      Input: mechanical motion → Output: electrical current (opposite direction to motor effect)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Key Comparison</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Motor Effect</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Current provided externally</li>
                          <li>• Force/motion is the result</li>
                          <li>• Electrical energy → Mechanical energy</li>
                          <li>• Used in motors, speakers</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Generator Effect</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Motion provided externally</li>
                          <li>• Current is the result</li>
                          <li>• Mechanical energy → Electrical energy</li>
                          <li>• Used in generators, alternators</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Fundamental Principle</h4>
                    <p className="text-purple-900 text-sm">
                      Both effects involve the same magnetic field interactions and follow the same hand rules, 
                      but with different inputs and outputs. A motor and generator can actually be the same 
                      device - it just depends on whether you input electricity (motor) or mechanical rotation (generator).
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="lenz-law" title="Lenz's Law" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Heinrich F. Lenz was a German physicist who was investigating electrical induction 
                      about the same time as Faraday. In 1834, Lenz formulated a law for determining the 
                      direction of the induced current.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Lenz's Law</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <p className="text-blue-900 font-medium">
                          "An induced current flows in such a direction that the induced magnetic 
                          field it creates opposes the action of the inducing magnetic field."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Three Distinct Phenomena</h4>
                    <p className="text-yellow-900 text-sm mb-3">
                      Understanding Lenz's law requires recognizing three separate phenomena:
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">1.</span>
                        <span className="text-yellow-900 text-sm">
                          <strong>The "inducing field"</strong> - The original magnetic field causing the change (e.g., bar magnet)
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">2.</span>
                        <span className="text-yellow-900 text-sm">
                          <strong>The "induced current"</strong> - The current that flows in the conductor as a result
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">3.</span>
                        <span className="text-yellow-900 text-sm">
                          <strong>The "induced magnetic field"</strong> - The magnetic field created by the induced current
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Example: Magnet Pushed INTO Coil</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">North pole approaching coil</div>
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-sm">A</span>
                          <div className="text-center">
                            <div className="text-2xl">🌀</div>
                            <div className="text-xs">Coil</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-red-600">N</span>
                            <span className="font-bold text-blue-600">S</span>
                            <span className="text-xl">→</span>
                          </div>
                          <span className="text-sm">B</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Magnet moving toward coil</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-green-900 text-sm">
                        <strong>Analysis using Lenz's Law:</strong>
                      </p>
                      <ul className="text-green-900 text-sm space-y-1 ml-4">
                        <li>• Inducing field: North pole of bar magnet approaching</li>
                        <li>• Induced magnetic field must OPPOSE this motion</li>
                        <li>• Coil must create a North pole on the right end to repel the approaching magnet</li>
                        <li>• Using left-hand rule: electrons flow from B to A</li>
                        <li>• Result: A becomes negative, B becomes positive</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Example: Magnet Pulled OUT of Coil</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-purple-300 inline-block">
                        <div className="text-sm mb-2">North pole leaving coil</div>
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-sm">A</span>
                          <div className="text-center">
                            <div className="text-2xl">🌀</div>
                            <div className="text-xs">Coil</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xl">←</span>
                            <span className="font-bold text-red-600">N</span>
                            <span className="font-bold text-blue-600">S</span>
                          </div>
                          <span className="text-sm">B</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Magnet moving away from coil</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-purple-900 text-sm">
                        <strong>Analysis using Lenz's Law:</strong>
                      </p>
                      <ul className="text-purple-900 text-sm space-y-1 ml-4">
                        <li>• Inducing field: North pole of bar magnet leaving</li>
                        <li>• Induced magnetic field must OPPOSE this motion</li>
                        <li>• Coil must create a South pole on the right end to attract the departing magnet</li>
                        <li>• This requires a North pole on the left end</li>
                        <li>• Using left-hand rule: electrons flow from A to B</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Summary Strategy</h4>
                    <p className="text-red-900 text-sm">
                      <strong>Step 1:</strong> Identify the inducing magnetic field change<br/>
                      <strong>Step 2:</strong> Determine what induced magnetic field would oppose this change<br/>
                      <strong>Step 3:</strong> Use hand rules to find the current direction that creates this opposing field
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="hand-rules" title="Predicting Current Direction - Straight Conductors" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      For straight conductors moving through magnetic fields, we can adapt the flat hand rule 
                      to predict the direction of induced current using Lenz's law principles.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Flat Hand Rule (Motor Effect Review)</h4>
                    <p className="text-blue-900 text-sm mb-3">
                      For current or particle motion: fingers point in direction of magnetic field lines, 
                      thumb points in direction of current or electron, palm points in direction of resulting force.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Generator Effect Hand Rule</h4>
                    <p className="text-yellow-900 text-sm mb-3">
                      When a conductor passes through a magnetic field:
                    </p>
                    <ul className="text-yellow-900 text-sm space-y-1 ml-4">
                      <li>• <strong>Fingers:</strong> point in direction of magnetic field lines</li>
                      <li>• <strong>Thumb:</strong> points in direction of motion</li>
                      <li>• <strong>Palm:</strong> indicates direction of induced current or electron flow</li>
                      <li>• <strong>Right hand:</strong> conventional current</li>
                      <li>• <strong>Left hand:</strong> electron flow</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Combined Motor-Generator Hand Rule</h4>
                    <p className="text-green-900 text-sm mb-3">
                      A unified approach that works for both motor and generator effects:
                    </p>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <ul className="text-green-900 text-sm space-y-1">
                        <li>• <strong>Fingers:</strong> point in direction of magnetic field</li>
                        <li>• <strong>Thumb:</strong> points in direction of INPUT or PRIMARY quantity</li>
                        <li>• <strong>Palm:</strong> points in OUTPUT or SECONDARY direction</li>
                      </ul>
                    </div>
                    <div className="mt-3 space-y-2">
                      <p className="text-green-900 text-sm">
                        <strong>Motor Effect:</strong> Input = current (thumb), Output = force (palm)
                      </p>
                      <p className="text-green-900 text-sm">
                        <strong>Generator Effect:</strong> Input = motion (thumb), Output = current (palm)
                      </p>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Example Application</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-purple-300 inline-block">
                        <div className="text-sm mb-2">Wire pulled upward through field</div>
                        <div className="flex items-center justify-center gap-4">
                          <span className="text-sm">B</span>
                          <div className="flex flex-col items-center">
                            <span className="font-bold text-red-600">N</span>
                            <div className="text-2xl">↑</div>
                            <span className="font-bold text-blue-600">S</span>
                          </div>
                          <span className="text-sm">A</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Magnetic field points right, wire moves up</div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-purple-900 text-sm">
                        <strong>Using Left Hand Rule:</strong>
                      </p>
                      <ul className="text-purple-900 text-sm space-y-1 ml-4">
                        <li>• Fingers point right (magnetic field direction)</li>
                        <li>• Thumb points up (wire motion direction)</li>
                        <li>• Palm faces toward us (electron flow from B to A)</li>
                        <li>• Electrons accumulate at A, making A negative</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="emf-voltage" title="Potential Difference Created by Generator Effect" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The motion of electrons toward one end of a conductor results in a potential difference 
                      or voltage along the conductor within the magnetic field. This potential difference is 
                      also called Electromotive Force (EMF).
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">EMF Formula for Moving Conductor</h4>
                    <div className="text-center mb-4">
                      <BlockMath math="V = BvL\sin\theta" />
                    </div>
                    <div className="text-sm text-blue-800">
                      <p><strong>Where:</strong></p>
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>V = potential difference (volts)</li>
                        <li>B = magnetic field strength (T) or (N·s/C·m)</li>
                        <li>v = speed of conductor (m/s)</li>
                        <li>L = length of conductor (m)</li>
                        <li>θ = angle between velocity and magnetic field, or between B and L</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Physical Explanation</h4>
                    <div className="space-y-3">
                      <p className="text-yellow-900 text-sm">
                        When a conductor moves through a magnetic field:
                      </p>
                      <ul className="text-yellow-900 text-sm space-y-1 ml-4">
                        <li>• Free electrons in the conductor experience a magnetic force</li>
                        <li>• Electrons are pushed toward one end of the conductor</li>
                        <li>• This creates a charge separation and potential difference</li>
                        <li>• The faster the motion or stronger the field, the greater the EMF</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Relationship to Motor Effect Formula</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Motor Effect</h5>
                        <div className="text-center mb-2">
                          <BlockMath math="F = BIL\sin\theta" />
                        </div>
                        <p className="text-sm text-green-900">
                          Force from current in magnetic field
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Generator Effect</h5>
                        <div className="text-center mb-2">
                          <BlockMath math="V = BvL\sin\theta" />
                        </div>
                        <p className="text-sm text-green-900">
                          Voltage from motion in magnetic field
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Special Cases</h4>
                    <div className="space-y-2">
                      <p className="text-purple-900 text-sm">
                        <strong>Maximum EMF (θ = 90°):</strong> V = BvL (conductor perpendicular to field)
                      </p>
                      <p className="text-purple-900 text-sm">
                        <strong>No EMF (θ = 0°):</strong> V = 0 (conductor parallel to field)
                      </p>
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
                  What voltage is generated by a 10.0 cm wire passing at 90° to a magnetic field of 4.0 T 
                  at 40 m/s? If the wire is connected to a 20 Ω resistor to form a circuit, what is the current?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Length: L = 10.0 cm = 0.100 m</li>
                        <li>Magnetic field: B = 4.0 T</li>
                        <li>Velocity: v = 40 m/s</li>
                        <li>Angle: θ = 90°</li>
                        <li>Resistance: R = 20 Ω</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 1: Calculate the generated voltage</span>
                      <div className="my-3">
                        <BlockMath math="V = BvL\sin\theta" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V = (4.0 \text{ T})(40 \text{ m/s})(0.100 \text{ m})\sin(90°)" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V = (4.0)(40)(0.100)(1)" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V = 16 \text{ V}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the current using Ohm's law</span>
                      <div className="my-3">
                        <BlockMath math="I = \frac{V}{R}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = \frac{16 \text{ V}}{20 \text{ Ω}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="I = 0.80 \text{ A}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The generated voltage is <strong>16 V</strong> and the current is <strong>0.80 A</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-generators" title="Electric Generators" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      When a single wire is bent into a loop and rotated through a permanent magnetic field, 
                      we have the basis for a generator. If the loop or armature is turned by some mechanical 
                      means (hand crank, pedals, crankshaft of an engine, or a turbine using steam, wind or 
                      water) we can generate electric power.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Generator vs Motor - Fundamental Relationship</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <p className="text-blue-900 font-medium">
                          A generator generates electricity from mechanical work, which is the 
                          opposite of what a motor does. In fact, a generator is just the inverse of a motor.
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Electric Motor</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Input: electrical energy</li>
                          <li>• Output: mechanical energy</li>
                          <li>• Current → magnetic force → rotation</li>
                          <li>• Uses: fans, pumps, vehicles</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Electric Generator</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Input: mechanical energy</li>
                          <li>• Output: electrical energy</li>
                          <li>• Rotation → changing magnetic field → current</li>
                          <li>• Uses: power plants, alternators</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Common Design Elements</h4>
                    <p className="text-yellow-900 text-sm mb-3">
                      Motors and generators have the same basic design - multiple loops of wire turning 
                      in an external magnetic field - but they perform opposite processes.
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <h5 className="font-medium text-yellow-800 mb-2">Key Components:</h5>
                      <ul className="text-yellow-900 text-sm space-y-1">
                        <li>• <strong>Armature:</strong> rotating coil of wire</li>
                        <li>• <strong>Field magnets:</strong> create the magnetic field</li>
                        <li>• <strong>Commutator:</strong> maintains current direction (DC) or allows alternation (AC)</li>
                        <li>• <strong>Brushes:</strong> maintain electrical contact with rotating parts</li>
                        <li>• <strong>Slip rings:</strong> for AC generators to allow current reversal</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Types of Mechanical Input</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Manual Power</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Hand cranks</li>
                          <li>• Bicycle pedals</li>
                          <li>• Exercise equipment</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Large Scale Power</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Steam turbines (coal, nuclear)</li>
                          <li>• Water turbines (hydroelectric)</li>
                          <li>• Wind turbines</li>
                          <li>• Gas turbines</li>
                          <li>• Engine crankshafts (automotive)</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Energy Conversion Efficiency</h4>
                    <p className="text-purple-900 text-sm">
                      Modern generators can be highly efficient (90-98%) at converting mechanical energy 
                      to electrical energy. The same device can function as either a motor or generator 
                      depending on whether electrical or mechanical energy is the input. This dual 
                      functionality is used in hybrid vehicles and regenerative braking systems.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <SlideshowKnowledgeCheck 
              course={course}
              courseId={courseId || '2'}
              lessonPath="40-generator-effect"
              title="Generator Effect Knowledge Check"
              description="Test your understanding of generator principles and electromagnetic induction concepts."
              theme="indigo"
              questions={[
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question1',
                  title: 'Question 1: N-S Poles Left to Right'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question2',
                  title: 'Question 2: S-N Poles Left to Right'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question3',
                  title: 'Question 3: S-N Poles Right to Left'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question4',
                  title: 'Question 4: N-S Poles Right to Left'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question5',
                  title: 'Question 5: Terminal A-B Electron Flow'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question6',
                  title: 'Question 6: Parallel Motion No Current'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question7',
                  title: 'Question 7: Hand Rules'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question8',
                  title: 'Question 8: Coil Turns EMF Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question9',
                  title: 'Question 9: EMF Frequency Relationship'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question10',
                  title: 'Question 10: Wire Length EMF Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question11',
                  title: 'Question 11: Velocity EMF Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question12',
                  title: 'Question 12: Magnetic Field EMF Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question13',
                  title: 'Question 13: Angle EMF Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question14',
                  title: 'Question 14: Transformer Voltage Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question15',
                  title: 'Question 15: Transformer Current Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question16',
                  title: 'Question 16: Transformer Turns Calculation'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question17',
                  title: 'Question 17: AC Effective Values'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question18',
                  title: 'Question 18: Power Transmission Concepts'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question19',
                  title: 'Question 19: Generator vs Motor Comparison'
                },
                {
                  type: 'multiple-choice',
                  questionId: 'course2_40_question20',
                  title: 'Question 20: Lenz Law Applications'
                }
              ]}
            />

            <AIAccordion.Item value="alternating-current" title="Alternating Current (AC)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Many electric circuits use electrochemical cells (batteries) which involve direct 
                      current (DC). However, there are considerably more circuits that operate with 
                      alternating current (AC), which is produced by AC generators.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">DC vs AC Current Flow</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Direct Current (DC)</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Electrons flow in one direction down the wire</li>
                          <li>• Constant voltage and current</li>
                          <li>• Like ball bearings in a tube</li>
                          <li>• Used in batteries, electronics</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Alternating Current (AC)</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Electrons vibrate back and forth</li>
                          <li>• Voltage and current oscillate</li>
                          <li>• Like a mechanical wave</li>
                          <li>• Used in household power, motors</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">AC Waveforms</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-yellow-300 inline-block">
                        <div className="text-sm mb-2">Sinusoidal AC Waveforms</div>
                        <div className="space-y-2">
                          <div className="text-xs">Voltage: V(t) = V_max sin(ωt)</div>
                          <div className="text-xs">Current: I(t) = I_max sin(ωt)</div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Both oscillate between positive and negative values</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-yellow-900 text-sm">
                        <strong>In Canada:</strong> Household voltage has a peak value of 170 V and frequency of 60 Hz
                      </p>
                      <p className="text-yellow-900 text-sm">
                        <strong>Average values:</strong> Both average voltage and average current are zero over a complete cycle
                      </p>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Power in AC Circuits</h4>
                    <p className="text-green-900 text-sm mb-3">
                      If average voltage and current are both zero, how does AC electricity deliver energy? 
                      The answer lies in the power calculation.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Power Analysis</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Power P = IV (always positive since negative × negative = positive)</li>
                          <li>• Peak power: <InlineMath math="P_{max} = I_{max}V_{max}" /></li>
                          <li>• Average power: <InlineMath math="P_{avg} = \frac{I_{max}V_{max}}{2}" /></li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Effective (RMS) Values</h4>
                    <div className="space-y-3">
                      <div className="text-center mb-3">
                        <div className="bg-white p-3 rounded border border-purple-300 inline-block">
                          <div className="space-y-2">
                            <BlockMath math="I_{eff} = I_{rms} = 0.707 I_{max}" />
                            <BlockMath math="V_{eff} = V_{rms} = 0.707 V_{max}" />
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-purple-900 text-sm">
                        Effective (RMS = Root Mean Square) values represent the equivalent DC values that 
                        would produce the same average power. All AC measurements and calculations use 
                        effective values unless stated otherwise.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">AC Circuit Equations</h4>
                    <p className="text-red-900 text-sm mb-3">
                      All power and Ohm's law equations work with effective (RMS) values:
                    </p>
                    <div className="text-center">
                      <div className="space-y-2">
                        <BlockMath math="I_{eff} = \frac{V_{eff}}{R}" />
                        <BlockMath math="P = I_{eff}V_{eff} = I_{eff}^2R = \frac{V_{eff}^2}{R}" />
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
                  In Canada the maximum AC voltage in a regular home socket is typically 170 V. 
                  What is the corresponding effective voltage?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Maximum voltage: V_max = 170 V</li>
                        <li>Find: Effective voltage V_eff</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Apply the effective voltage formula:</span>
                      <div className="my-3">
                        <BlockMath math="V_{eff} = 0.707 V_{max}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V_{eff} = 0.707 \times 170 \text{ V}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V_{eff} = 120 \text{ V}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The effective voltage is <strong>120 V</strong>. This is the standard household 
                        voltage rating in North America.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="transformers" title="Transformers" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Joseph Henry, who missed his chance at glory in 1831, went on to become the leader 
                      in studying the transformer. The basic idea behind the transformer is Faraday's Law – 
                      a changing magnetic field inside a coil of wire induces a current in the wire.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Transformer Construction</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">Basic Transformer Design</div>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="text-xs">Primary Coil</div>
                            <div className="text-2xl">🌀</div>
                            <div className="text-xs">N_p turns</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs">Soft Iron Core</div>
                            <div className="text-2xl">⬛</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs">Secondary Coil</div>
                            <div className="text-2xl">🌀</div>
                            <div className="text-xs">N_s turns</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Circular soft iron core carries magnetic field between coils</div>
                      </div>
                    </div>
                    
                    <p className="text-blue-900 text-sm">
                      Coils of wire are wrapped around both sides of a circular soft iron core. 
                      The iron core efficiently carries the magnetic field from primary to secondary.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Why AC is Required</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">DC Current</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Creates uniform, unchanging magnetic field</li>
                          <li>• No effect on secondary coil</li>
                          <li>• Current induced only when turning on/off</li>
                          <li>• Inefficient for continuous operation</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">AC Current</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Constantly changing direction</li>
                          <li>• Automatically creates growing/collapsing field</li>
                          <li>• Continuously induces current in secondary</li>
                          <li>• Efficient and convenient operation</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Transformer Turns Ratio</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Transformer Equations (100% efficiency)</div>
                        <div className="space-y-2">
                          <BlockMath math="\frac{N_p}{N_s} = \frac{V_p}{V_s} = \frac{I_s}{I_p}" />
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Power in = Power out (P_p = P_s)</div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-green-800">
                      <p><strong>Where:</strong></p>
                      <ul className="ml-4 mt-2 space-y-1">
                        <li>N_p = number of turns in primary coil</li>
                        <li>N_s = number of turns in secondary coil</li>
                        <li>V_p = potential difference in primary coil</li>
                        <li>V_s = potential difference in secondary coil</li>
                        <li>I_p = current in primary coil</li>
                        <li>I_s = current in secondary coil</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Transformer Types</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Step-Up Transformer</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• <InlineMath math="N_s > N_p" /> (more secondary turns)</li>
                          <li>• <InlineMath math="V_s > V_p" /> (higher output voltage)</li>
                          <li>• <InlineMath math="I_s < I_p" /> (lower output current)</li>
                          <li>• Used at power plants</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Step-Down Transformer</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• <InlineMath math="N_s < N_p" /> (fewer secondary turns)</li>
                          <li>• <InlineMath math="V_s < V_p" /> (lower output voltage)</li>
                          <li>• <InlineMath math="I_s > I_p" /> (higher output current)</li>
                          <li>• Used near homes and businesses</li>
                        </ul>
                      </div>
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
                  The primary coil of a transformer has 600 turns and the secondary coil has 1800 turns. 
                  If the primary circuit has a potential difference of 90 V, what is the potential 
                  difference in the secondary coil?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc ml-6 mt-2 space-y-1">
                        <li>Primary turns: N_p = 600 turns</li>
                        <li>Secondary turns: N_s = 1800 turns</li>
                        <li>Primary voltage: V_p = 90 V</li>
                        <li>Find: Secondary voltage V_s</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Apply the transformer turns ratio:</span>
                      <div className="my-3">
                        <BlockMath math="\frac{N_p}{N_s} = \frac{V_p}{V_s}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\frac{600}{1800} = \frac{90 \text{ V}}{V_s}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Solve for V_s:</span>
                      <div className="my-3">
                        <BlockMath math="V_s = \frac{90 \text{ V} \times 1800}{600}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V_s = \frac{90 \times 3}{1}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="V_s = 270 \text{ V}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The potential difference in the secondary coil is <strong>270 V</strong>. 
                        This is a step-up transformer (3:1 ratio) that triples the voltage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="ac-vs-dc-transmission" title="AC vs DC Power Transmission" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      AC generators and DC generators are equally easy to design, build and operate, and 
                      they produce electricity with equal efficiency. Yet all of our large scale electrical 
                      systems are based on AC power generation. The reason lies in power transmission over 
                      long distances.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">The Transmission Problem</h4>
                    <div className="space-y-3">
                      <p className="text-blue-900 text-sm mb-3">
                        When electrical energy is transmitted over long distances, energy lost as heat 
                        can become a costly problem. The power loss in transmission lines is given by:
                      </p>
                      <div className="text-center mb-3">
                        <div className="bg-white p-3 rounded border border-blue-300 inline-block">
                          <BlockMath math="P_{loss} = I^2R" />
                          <div className="text-xs text-gray-600 mt-1">Power loss increases with the square of current</div>
                        </div>
                      </div>
                      <p className="text-blue-900 text-sm">
                        To minimize losses, we need low current. Since P = IV, low current requires high voltage 
                        for the same power transmission.
                      </p>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Edison's DC Dilemma (1882)</h4>
                    <div className="space-y-3">
                      <p className="text-yellow-900 text-sm mb-3">
                        Thomas Edison's preference for DC generators created a dilemma:
                      </p>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded border border-yellow-300">
                          <h5 className="font-medium text-yellow-800 mb-2">Low Voltage DC</h5>
                          <ul className="text-yellow-900 text-sm space-y-1">
                            <li>• Safe for consumers</li>
                            <li>• Required large current</li>
                            <li>• High transmission losses (I²R)</li>
                            <li>• Expensive copper lines needed</li>
                          </ul>
                        </div>
                        <div className="bg-white p-3 rounded border border-yellow-300">
                          <h5 className="font-medium text-yellow-800 mb-2">High Voltage DC</h5>
                          <ul className="text-yellow-900 text-sm space-y-1">
                            <li>• Low transmission losses</li>
                            <li>• Unsafe for consumers</li>
                            <li>• Difficult to step up/down</li>
                            <li>• Limited switching technology</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">AC Solution with Transformers</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">AC Power Transmission System</div>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span>Generator</span>
                          <span>→</span>
                          <span>Step-up</span>
                          <span>→</span>
                          <span>Transmission</span>
                          <span>→</span>
                          <span>Step-down</span>
                          <span>→</span>
                          <span>Consumer</span>
                        </div>
                        <div className="flex items-center justify-center gap-2 text-xs mt-1">
                          <span>25kV</span>
                          <span></span>
                          <span>500kV</span>
                          <span></span>
                          <span>500kV</span>
                          <span></span>
                          <span>120V</span>
                          <span></span>
                          <span>120V</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-green-900 text-sm">
                        <strong>The AC advantage:</strong>
                      </p>
                      <ul className="text-green-900 text-sm space-y-1 ml-4">
                        <li>• Generate at moderate voltage (safe for equipment)</li>
                        <li>• Step up to high voltage for transmission (low losses)</li>
                        <li>• Step down to safe voltage for consumers</li>
                        <li>• Transformers make voltage changes easy and efficient</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">The War of Currents (1880s-1890s)</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Edison (DC) vs Westinghouse (AC)</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Edison Electric Light Company promoted DC systems</li>
                          <li>• Westinghouse Electric Company developed AC systems</li>
                          <li>• Edison + Harold Brown demonstrated AC dangers (electric chair)</li>
                          <li>• Public demonstrations were often misleading</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-808 mb-2">The Decisive Test (1891)</h5>
                        <p className="text-purple-900 text-sm">
                          High voltage AC line from Frankfurt to Lauffen, Germany (176 km) achieved 
                          77% transmission efficiency. This practical demonstration convinced the world 
                          that AC was superior for long-distance power transmission.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">Legacy and Impact</h4>
                    <div className="space-y-2">
                      <p className="text-red-900 text-sm">
                        <strong>1893:</strong> Westinghouse wins contract for Niagara Power Plant using AC
                      </p>
                      <p className="text-red-900 text-sm">
                        <strong>1896:</strong> First AC transmission to Buffalo, New York, spawning new industries
                      </p>
                      <p className="text-red-900 text-sm">
                        <strong>Result:</strong> AC became the global standard; Edison's company evolved into General Electric
                      </p>
                      <p className="text-red-900 text-sm">
                        <strong>Today:</strong> The electrical grid still uses the same AC transmission principles with step-up and step-down transformers
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
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Electromagnetic Induction - Michael Faraday</h3>
            <p>In 1821, Michael Faraday invented the first electric motor...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Faraday's Three Basic Experimental Situations</h3>
            <p>Faraday discovered the basic principles through three fundamental experiments...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Generator Effect vs Motor Effect</h3>
            <p>The generator and motor effects are complementary phenomena...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Lenz's Law</h3>
            <p>Heinrich F. Lenz formulated a law for determining current direction...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Hand Rules for Current Direction</h3>
            <p>Adapted hand rules for predicting induced current direction...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">EMF and Voltage Generation</h3>
            <p>Motion of electrons creates potential difference in conductors...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 1</h3>
            <p>Voltage and current calculations for moving conductor...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Electric Generators</h3>
            <p>Converting mechanical energy to electrical energy...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Alternating Current</h3>
            <p>AC generation and effective values...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 2</h3>
            <p>AC effective voltage calculation...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Transformers</h3>
            <p>Voltage transformation using electromagnetic induction...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Example 3</h3>
            <p>Transformer voltage calculation...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">AC vs DC Power Transmission</h3>
            <p>Historical development and advantages of AC power systems...</p>
          </TextSection>
        </div>
      )}

      {/* AC Circuit Calculations Knowledge Check */}
      <SlideshowKnowledgeCheck 
        course={course}
        courseId={courseId || '2'}
        lessonPath="40-generator-effect"
        title="AC Circuit Calculations Knowledge Check"
        description="Practice AC circuit analysis including RMS values, power calculations, and current-voltage relationships."
        theme="purple"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question21',
            title: 'Question 21: Peak Current in AC Circuit'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question22',
            title: 'Question 22: RMS and Peak Current Values'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question23',
            title: 'Question 23: Light Bulb Resistance'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question24',
            title: 'Question 24: Peak Voltage Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question25',
            title: 'Question 25: Maximum Instantaneous Power'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question26',
            title: 'Question 26: Heater Coil Power Analysis'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question27',
            title: 'Question 27: Current Reversals per Day'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question28',
            title: 'Question 28: RMS Current Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question29',
            title: 'Question 29: CD Player Charger Voltage'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question30',
            title: 'Question 30: Insect Zapper Turns Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question31',
            title: 'Question 31: Doorbell Transformer Type'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question32',
            title: 'Question 32: Electric Train Current'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question33',
            title: 'Question 33: Transformer Power Analysis'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_40_question34',
            title: 'Question 34: Air Filter Power Consumption'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Michael Faraday discovered electromagnetic induction in 1831, demonstrating that magnetism could produce electricity",
          "Faraday's Law: A changing magnetic field induces a current in a conductor",
          "Three key experimental situations: moving wire through magnet, magnet through coil, and magnetizing/demagnetizing iron core",
          "Generator effect converts mechanical energy to electrical energy (opposite of motor effect)",
          "Lenz's Law: Induced current creates magnetic field that opposes the original change",
          "Hand rules can predict induced current direction in moving conductors",
          <>EMF in moving conductor: <InlineMath math="V = BvL\sin\theta" />, where v is conductor velocity</>,
          "Electric generators are motors operating in reverse - same components, opposite energy conversion",
          "AC current oscillates sinusoidally; average voltage and current are zero but power is positive",
          <>Effective (RMS) values: <InlineMath math="I_{eff} = 0.707 I_{max}" />, <InlineMath math="V_{eff} = 0.707 V_{max}" /></>,
          "Standard household voltage: 120 V effective (170 V peak) at 60 Hz in North America",
          "Transformers use electromagnetic induction to change AC voltage levels",
          <>Transformer relationships: <InlineMath math="\frac{N_p}{N_s} = \frac{V_p}{V_s} = \frac{I_s}{I_p}" /> (assuming 100% efficiency)</>,
          <>Step-up transformers increase voltage (<InlineMath math="N_s > N_p" />); step-down transformers decrease voltage (<InlineMath math="N_s < N_p" />)</>,
          "AC won the 'War of Currents' because transformers enable efficient long-distance power transmission",
          "Power transmission: generate at moderate voltage → step up for transmission → step down for consumers",
          <>AC transmission minimizes losses (<InlineMath math="P = I^2R" />) by using high voltage and low current over long distances</>
        ]}
      />
    </LessonContent>
  );
};

export default GeneratorEffect;