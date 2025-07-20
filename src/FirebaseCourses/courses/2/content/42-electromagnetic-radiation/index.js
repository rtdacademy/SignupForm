import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ElectromagneticRadiation = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_42_electromagnetic_radiation"
      title="Lesson 24 - Electromagnetic Radiation"
      metadata={{ estimated_time: '60 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="historical-discovery" title="Historical Discovery - From Faraday to Maxwell" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      On April 11, 1846, Michael Faraday was scheduled to introduce Sir Charles Wheatstone 
                      at a meeting of the Royal Society of London. Unfortunately, Wheatstone had a bad 
                      case of stage fright and took off just before his lecture was to begin. As a result, 
                      Faraday was forced to give an unprepared lecture to the Royal Society of London.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Faraday's Uncharacteristic Speculation</h4>
                    <div className="space-y-3">
                      <p className="text-blue-900 text-sm">
                        Faraday always gave well-prepared lectures punctuated by spectacular demonstrations, 
                        but he was totally unprepared for Wheatstone's departure. Forced to spend an 
                        unrehearsed hour speculating on the future, he made a prescient observation.
                      </p>
                      
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">The 1845 Discovery</h5>
                        <p className="text-blue-900 text-sm">
                          Faraday commented on his 1845 discovery concerning the change of polarization 
                          caused in light passing through heavy glass when exposed to external magnetic 
                          fields. He uncharacteristically speculated on the possible interrelationship 
                          between light and magnetism.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Faraday's Limitations</h4>
                    <p className="text-yellow-900 text-sm">
                      Unfortunately, Faraday did not possess the background or required talent in 
                      mathematics required to advance this idea. Besides, his time and energy were 
                      consumed by other interests. It would be ten years before someone could pursue 
                      this connection.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Enter James Clerk Maxwell (1831-1879)</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Timeline of Maxwell's Work</div>
                        <div className="space-y-1 text-xs">
                          <div><strong>1855:</strong> Maxwell begins making his impression on science</div>
                          <div><strong>1857:</strong> Begins examining Faraday's light-magnetism connection</div>
                          <div><strong>Two years after Cambridge:</strong> Started theoretical investigation</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-green-900 text-sm">
                      You have probably never heard of Maxwell, but he was perhaps the finest theoretical 
                      physicist there has ever been. In 1855, Maxwell began to make his impression upon 
                      the face of science in England, and would pursue the study of the possible connection 
                      between light and magnetism.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Historical Significance</h4>
                    <p className="text-purple-900 text-sm">
                      This chance encounter - Wheatstone's stage fright leading to Faraday's speculation - 
                      planted the seed for one of physics' greatest theoretical breakthroughs. Maxwell would 
                      transform Faraday's intuitive insight into mathematical rigor, ultimately unifying 
                      electricity, magnetism, and light.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electromagnetic-principles" title="The Principles of Electromagnetism" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Maxwell began by studying the two known principles of electromagnetism discovered by 
                      previous scientists. These formed the foundation for his revolutionary insights.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Oersted-Ampere Principle (Lessons 19 & 21)</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <p className="text-blue-900 font-medium text-sm">
                          "A constant electric current in a conductor induces a uniform, constant 
                          magnetic field that circles the conductor. The electric current and 
                          magnetic field are perpendicular."
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-900 text-sm">
                      Current → Magnetic Field (requires conductor)
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Henry-Faraday Principle (Lessons 22 & 23)</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <p className="text-green-900 font-medium text-sm">
                          "When a conductor moves through a perpendicular magnetic field, 
                          a uniform, constant current is induced in the conductor."
                        </p>
                      </div>
                    </div>
                    <p className="text-green-900 text-sm">
                      Magnetic Field → Current (requires conductor)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Maxwell's Crucial Insight</h4>
                    <div className="space-y-3">
                      <p className="text-yellow-900 text-sm">
                        <strong>The Problem:</strong> Both principles required a conductor as an essential ingredient. 
                        Maxwell wanted to know if electricity could be induced in an insulator in the presence 
                        of an external magnetic field.
                      </p>
                      
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Maxwell's Experiment</h5>
                        <p className="text-yellow-900 text-sm">
                          Maxwell discovered that a newly introduced magnetic field did cause a momentary 
                          shift of charges in the insulator, but the strong internal attractive forces 
                          quickly pulled the charges back into place. This confirmed that changing magnetic 
                          fields could induce current in ANY object.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Maxwell's Revolutionary Generalization</h4>
                    <p className="text-purple-900 text-sm mb-3">
                      Maxwell extrapolated his ideas to Ampere's and Faraday's principles. Where the original 
                      principles were limited to a conductor, Maxwell did not see a need for a conductor – 
                      electric and magnetic fields could exist in space.
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Modified Ampere's Principle</h5>
                        <p className="text-purple-900 text-sm">
                          "A changing electric field in space will generate a changing magnetic 
                          field that is perpendicular to the electric field."
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Modified Faraday's Principle</h5>
                        <p className="text-purple-900 text-sm">
                          "A changing magnetic field in space will generate a changing electric 
                          field that is perpendicular to the magnetic field."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">The Self-Perpetuating Cycle</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-red-300 inline-block">
                        <div className="text-sm mb-2">Maxwell's Electromagnetic Chain Reaction</div>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span>Changing E</span>
                          <span>→</span>
                          <span>Changing B</span>
                          <span>→</span>
                          <span>New Changing E</span>
                          <span>→</span>
                          <span>New Changing B</span>
                          <span>→</span>
                          <span>...</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Self-perpetuating electromagnetic waves!</div>
                      </div>
                    </div>
                    <p className="text-red-900 text-sm">
                      Note how the two principles work together: A changing electric field induces a changing 
                      magnetic field which induces a new changing electric field which induces a new changing 
                      magnetic field which continues forever!
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="wave-propagation" title="Propagation of Electromagnetic Waves" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Maxwell's mathematical theories presented an argument for electric and magnetic 
                      waves in space. Starting with an oscillating (changing) electric field in space, 
                      Maxwell could explain how electromagnetic waves could be generated.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Sequential Wave Generation</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">Self-Generating Electromagnetic Wave</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-red-100 rounded">E₁ ↗</span>
                            <span>induces</span>
                            <span className="px-2 py-1 bg-blue-100 rounded">B₁ ↗</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-blue-100 rounded">B₁ ↗</span>
                            <span>induces</span>
                            <span className="px-2 py-1 bg-red-100 rounded">E₂ ↗</span>
                          </div>
                          <div className="flex items-center justify-center gap-2 text-xs">
                            <span className="px-2 py-1 bg-red-100 rounded">E₂ ↗</span>
                            <span>induces</span>
                            <span className="px-2 py-1 bg-blue-100 rounded">B₂ ↗</span>
                          </div>
                          <div className="text-xs text-gray-600">... and so on forever</div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-blue-900 text-sm">
                      An increasing electric field E₁ induces an increasing magnetic field B₁ which 
                      induces an increasing electric field E₂ which induces an increasing magnetic 
                      field B₂ and so on... forever. The result would be a self-generating series 
                      of changing fields radiating outward into space.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Wave Visualization</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Electromagnetic Wave Structure</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-center gap-4">
                            <div className="text-center">
                              <div className="text-xs">Electric Field (E)</div>
                              <div className="text-2xl text-red-600">↕</div>
                              <div className="text-xs">Oscillating vertically</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs">Magnetic Field (B)</div>
                              <div className="text-2xl text-blue-600">⊗⊙</div>
                              <div className="text-xs">Oscillating horizontally</div>
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xl">→</div>
                            <div className="text-xs">Wave propagation direction</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-green-900 text-sm">
                        <strong>Wave Components:</strong>
                      </p>
                      <ul className="text-green-900 text-sm space-y-1 ml-4">
                        <li>• Series of increasing and decreasing electric fields (E)</li>
                        <li>• Corresponding series of increasing and decreasing magnetic fields (B)</li>
                        <li>• Magnetic fields run perpendicular to electric fields</li>
                        <li>• Wave propagates perpendicular to both E and B fields</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Electromagnetic Radiation Properties</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Medium Independence</h5>
                        <p className="text-yellow-900 text-sm">
                          EMR could travel through a vacuum as it did not require a medium - 
                          unlike mechanical waves which need matter to propagate.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Transverse Nature</h5>
                        <p className="text-yellow-900 text-sm">
                          EMR could be polarized since it was transverse in nature - the 
                          oscillations are perpendicular to the direction of propagation.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Mathematical Foundation</h4>
                    <p className="text-purple-900 text-sm">
                      Maxwell's equations provided the mathematical framework for understanding how 
                      oscillating electric and magnetic fields could propagate through space without 
                      requiring any material medium. This was a revolutionary concept that challenged 
                      the prevailing idea that all waves needed a medium (like the proposed "aether").
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="maxwell-predictions" title="Maxwell's Predictions" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Not only did Maxwell correctly predict the existence of electromagnetic waves, 
                      his equations also allowed him to make some remarkable predictions about the 
                      wave's properties that would later be experimentally verified.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">1. Source of Electromagnetic Waves</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <p className="text-blue-900 font-medium text-sm">
                          "The primary cause of all electromagnetic waves is an accelerating electric charge."
                        </p>
                      </div>
                    </div>
                    <p className="text-blue-900 text-sm">
                      As an electric charge oscillates/accelerates, electrical energy will be lost, and an 
                      equivalent amount of energy will be radiated outward in the form of oscillating 
                      electric and magnetic fields.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">2. Frequency Correspondence</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Charge-Wave Frequency Relationship</div>
                        <div className="space-y-1">
                          <div className="text-xs">Oscillating charge frequency = EMR frequency</div>
                          <div className="text-xs">f_charge = f_wave</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-green-900 text-sm">
                      When the electric charge is accelerated in periodic motion, the frequency of 
                      oscillation of the charge will correspond exactly to the frequency of the 
                      electromagnetic wave that is produced.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">3. Universal Speed</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-yellow-300 inline-block">
                        <div className="text-sm mb-2">Maxwell's Speed Prediction</div>
                        <div className="space-y-1">
                          <div className="text-xs">Theoretical: 310,740,000 m/s</div>
                          <div className="text-xs">Modern value: 3.00 × 10⁸ m/s</div>
                          <div className="text-xs">Universal wave equation: c = fλ</div>
                        </div>
                      </div>
                    </div>
                    <p className="text-yellow-900 text-sm">
                      All electromagnetic waves will travel at the same speed and obey the universal wave 
                      equation. Maxwell's theoretical prediction was remarkably close to today's accepted value!
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">4. Geometric Relationships</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-purple-300 inline-block">
                        <div className="text-sm mb-2">Perpendicular Field Orientations</div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="text-center">
                            <div>E field</div>
                            <div className="text-red-600">↕</div>
                          </div>
                          <div className="text-center">
                            <div>B field</div>
                            <div className="text-blue-600">↔</div>
                          </div>
                          <div className="text-center">
                            <div>Direction</div>
                            <div>→</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">All three are mutually perpendicular</div>
                      </div>
                    </div>
                    <p className="text-purple-900 text-sm">
                      The oscillating electric and magnetic fields will always be perpendicular to each 
                      other and perpendicular to the direction of propagation of the wave.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">5. Wave Phenomena</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Expected Behaviors</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Interference</li>
                          <li>• Diffraction</li>
                          <li>• Refraction</li>
                          <li>• Polarization</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Physical Effects</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Radiation pressure</li>
                          <li>• Energy transfer</li>
                          <li>• Momentum carrying</li>
                        </ul>
                      </div>
                    </div>
                    <p className="text-red-900 text-sm mt-3">
                      Electromagnetic waves should show all phenomena associated with transverse waves 
                      and should produce pressure when they come in contact with a surface.
                    </p>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-2">Theoretical Triumph</h4>
                    <p className="text-indigo-900 text-sm">
                      Maxwell's predictions were made purely from mathematical theory, without experimental 
                      confirmation. The accuracy and comprehensiveness of these predictions demonstrated the 
                      power of theoretical physics and established Maxwell as one of history's greatest scientists.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="hertz-confirmation" title="Hertz Confirms Electromagnetic Waves" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Maxwell was a theoretical genius but he was not a research scientist – he lacked 
                      the ability to experimentally verify his own predictions. In 1888, a German 
                      scientist named Heinrich Hertz would come to his rescue.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Hertz's Groundbreaking Experiment (1888)</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">Hertz's Spark Gap Experiment</div>
                        <div className="flex items-center justify-center gap-4">
                          <div className="text-center">
                            <div className="text-xs">Transmitter</div>
                            <div className="text-2xl">⚡</div>
                            <div className="text-xs">Induction coil</div>
                            <div className="text-xs">creates spark</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs">EM Wave</div>
                            <div className="text-2xl">~~~</div>
                            <div className="text-xs">Travels across room</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs">Receiver</div>
                            <div className="text-2xl">⚡</div>
                            <div className="text-xs">Wire loop</div>
                            <div className="text-xs">detects spark</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <p className="text-blue-900 text-sm">
                        <strong>Experimental Setup:</strong> Using an induction coil to produce a spark 
                        across a gap, Hertz was able to detect a spark jumping across the same type of 
                        gap on a wire across the room.
                      </p>
                      
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">How It Worked</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Changing electric field from oscillating sparks created EM wave</li>
                          <li>• Wave traveled across the room at ~3.0 × 10⁸ m/s</li>
                          <li>• Changing magnetic field in wave induced spark in receiver loop</li>
                          <li>• Time delay confirmed wave speed matched light speed</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Polarization Verification</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="text-sm mb-2">Hertz's Polarization Test</div>
                        <div className="grid grid-cols-3 gap-4 text-xs">
                          <div className="text-center">
                            <div>0° rotation</div>
                            <div className="text-green-600">⚡ SPARK</div>
                            <div>Aligned with E field</div>
                          </div>
                          <div className="text-center">
                            <div>90° rotation</div>
                            <div className="text-red-600">✗ NO SPARK</div>
                            <div>Perpendicular to E field</div>
                          </div>
                          <div className="text-center">
                            <div>180° rotation</div>
                            <div className="text-green-600">⚡ SPARK</div>
                            <div>Aligned again</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-green-900 text-sm">
                      When Hertz rotated the second spark gap through 90°, he found that the radiation 
                      did not produce a spark. Upon a further rotation of 90°, the spark was produced. 
                      This confirmed that electromagnetic waves are polarized - the spark is produced 
                      when the gap is aligned with the electric field.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Complete Wave Behavior Verification</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Wave Properties Tested</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Reflection</li>
                          <li>• Diffraction</li>
                          <li>• Interference</li>
                          <li>• Refraction</li>
                          <li>• Polarization</li>
                        </ul>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Key Findings</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Behaved exactly like light</li>
                          <li>• Different frequencies possible</li>
                          <li>• Speed always constant</li>
                          <li>• All Maxwell's predictions confirmed</li>
                        </ul>
                      </div>
                    </div>
                    
                    <p className="text-yellow-900 text-sm mt-3">
                      Hertz went on to test for all wave phenomena. In each case, the electromagnetic 
                      radiation behaved the same as light. He also varied the frequency of the waves 
                      and found they could have several different frequencies but the speed always remained the same.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Hertz's Historic Conclusion</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-purple-300 inline-block">
                        <p className="text-purple-900 font-bold text-lg">
                          "Electromagnetic waves are light."
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">Final Confirmations</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Radiation Pressure (1899-1901)</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• <strong>1899:</strong> Lebedev demonstrated EMR exerts pressure on surfaces</li>
                          <li>• <strong>1901:</strong> Nichols and Hull confirmed Lebedev's research</li>
                          <li>• All of Maxwell's predictions were now verified as correct</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-3">Legacy and Impact</h4>
                    <div className="space-y-3">
                      <p className="text-indigo-900 text-sm">
                        Not only had Hertz confirmed Maxwell's mathematical theories, but he also fired 
                        the interest of Italian scientist Marconi. Marconi would journey to England to 
                        continue work on wireless transmission (radio), eventually receiving the first 
                        transatlantic radio message in St. John's, Newfoundland from Cornwall, England.
                      </p>
                      
                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <p className="text-indigo-800 font-medium text-center">
                          Marconi is often referred to as the "Father of Radio"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electromagnetic-spectrum" title="The Electromagnetic Spectrum" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Electromagnetic waves have a broad range of frequencies called the electromagnetic 
                      spectrum. The only difference between one type of EMR and another is the frequency/wavelength.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Fundamental Principle</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <div className="text-sm mb-2">All EMR travels at the same speed</div>
                        <div className="space-y-2">
                          <BlockMath math="c = 3.00 \times 10^8 \text{ m/s}" />
                          <BlockMath math="c = f\lambda" />
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Universal wave equation applies to all EMR</div>
                      </div>
                    </div>
                    <p className="text-blue-900 text-sm">
                      Use the universal wave equation to calculate wavelengths and frequencies of any electromagnetic radiation.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Complete Electromagnetic Spectrum</h4>
                    <div className="space-y-3">
                      
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Low Frequency AC (~60 Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Weak radiation from AC power lines
                          </div>
                          <div>
                            <strong>Effect:</strong> Interference in radio reception near high voltage lines
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Radio, Radar, TV (10⁴ - 10¹⁰ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Oscillations in electric circuits with inductive and capacitive components
                          </div>
                          <div>
                            <strong>Applications:</strong> Radio/TV transmission, radar navigation, radio telescopes, satellite control
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Microwaves (10⁹ - 10¹² Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Oscillating currents in special tubes and solid state devices
                          </div>
                          <div>
                            <strong>Applications:</strong> Long range TV transmission, telecommunications, microwave ovens
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Infrared (10¹¹ - 4×10¹⁴ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Transitions of outer electrons in atoms and molecules
                          </div>
                          <div>
                            <strong>Applications:</strong> Direct heating from sun, remote sensing, thermography
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Visible Light (4×10¹⁴ - 7.5×10¹⁴ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Higher energy transitions of outer electrons in atoms
                          </div>
                          <div>
                            <strong>Detection:</strong> Radiation that can be detected by the human eye
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Ultraviolet (7.5×10¹⁴ - 10¹⁷ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Even higher energy transitions of outer electrons
                          </div>
                          <div>
                            <strong>Effects:</strong> Fluorescence, skin tanning, bacteria killing, vitamin D synthesis
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">X-rays (10¹⁷ - 10²⁰ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Inner electron transitions or rapid deceleration of high energy electrons
                          </div>
                          <div>
                            <strong>Applications:</strong> Medical imaging, radiation therapy, industrial testing
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Gamma Rays (10¹⁹ - 10²⁴ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Spontaneous nuclear emission, high energy particle deceleration
                          </div>
                          <div>
                            <strong>Applications:</strong> Cancer treatment for localized tumors
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Cosmic Rays (>10²⁴ Hz)</h5>
                        <div className="grid md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <strong>Origin:</strong> Very high energy particles from outer space bombarding Earth's atmosphere
                          </div>
                          <div>
                            <strong>Detection:</strong> Specialized instruments and particle detectors
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Visible Light Detail</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-yellow-300 inline-block">
                        <div className="text-sm mb-2">ROYGBIV - Visible Spectrum</div>
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="px-2 py-1 bg-red-200 rounded">Red</span>
                          <span className="px-2 py-1 bg-orange-200 rounded">Orange</span>
                          <span className="px-2 py-1 bg-yellow-200 rounded">Yellow</span>
                          <span className="px-2 py-1 bg-green-200 rounded">Green</span>
                          <span className="px-2 py-1 bg-blue-200 rounded">Blue</span>
                          <span className="px-2 py-1 bg-indigo-200 rounded">Indigo</span>
                          <span className="px-2 py-1 bg-purple-200 rounded">Violet</span>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">700 nm (red) to 400 nm (violet)</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Memory Aid - Frequency Progression</h4>
                    <div className="text-center mb-3">
                      <div className="bg-white p-4 rounded border border-purple-300 inline-block">
                        <div className="text-sm mb-2">Each type increases by factor of 10²</div>
                        <div className="grid grid-cols-7 gap-2 text-xs">
                          <div className="text-center">
                            <div>TV</div>
                            <div>10⁸</div>
                          </div>
                          <div className="text-center">
                            <div>Microwave</div>
                            <div>10¹⁰</div>
                          </div>
                          <div className="text-center">
                            <div>Infrared</div>
                            <div>10¹²</div>
                          </div>
                          <div className="text-center">
                            <div>Visible</div>
                            <div>10¹⁴</div>
                          </div>
                          <div className="text-center">
                            <div>UV</div>
                            <div>10¹⁶</div>
                          </div>
                          <div className="text-center">
                            <div>X-rays</div>
                            <div>10¹⁸</div>
                          </div>
                          <div className="text-center">
                            <div>Gamma</div>
                            <div>10²⁰</div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2">Remember order and starting frequency (10⁸ Hz)</div>
                      </div>
                    </div>
                    <p className="text-purple-900 text-sm">
                      To find equivalent wavelengths, use c = fλ with c = 3.00 × 10⁸ m/s for all EMR types.
                    </p>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Key Learning Objectives</h4>
                    <div className="space-y-2">
                      <p className="text-red-900 text-sm">
                        <strong>You are responsible for:</strong>
                      </p>
                      <ul className="text-red-900 text-sm space-y-1 ml-4">
                        <li>• Knowing the various members of the electromagnetic spectrum</li>
                        <li>• Understanding their approximate frequency or wavelength ranges</li>
                        <li>• Knowing how each type of radiation is produced and detected</li>
                        <li>• Using c = fλ to calculate wavelengths and frequencies of any EMR</li>
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
            <h3 className="text-xl font-semibold mb-3">Historical Discovery - From Faraday to Maxwell</h3>
            <p>Faraday's uncharacteristic speculation led to Maxwell's theoretical breakthrough...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">The Principles of Electromagnetism</h3>
            <p>Maxwell studied and generalized Oersted-Ampere and Henry-Faraday principles...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Propagation of Electromagnetic Waves</h3>
            <p>Self-generating series of changing fields radiating outward into space...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Maxwell's Predictions</h3>
            <p>Theoretical predictions about electromagnetic wave properties...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Hertz Confirms Electromagnetic Waves</h3>
            <p>Experimental verification of Maxwell's theoretical predictions...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">The Electromagnetic Spectrum</h3>
            <p>Broad range of frequencies from radio waves to gamma rays...</p>
          </TextSection>
        </div>
      )}

      <SlideshowKnowledgeCheck 
        course={course}
        courseId={courseId || '2'}
        lessonPath="42-electromagnetic-radiation"
        title="Electromagnetic Radiation Knowledge Check"
        description="Test your understanding of electromagnetic radiation theory and calculations."
        theme="indigo"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question1',
            title: 'Question 1: Fundamental Origin of EMR'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question2',
            title: 'Question 2: Harmonic Oscillation Frequency'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question3',
            title: 'Question 3: Speed of EMR in Vacuum'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question4',
            title: 'Question 4: Definition of Electromagnetic Radiation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question5',
            title: 'Question 5: Inner Electron Transitions'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question6',
            title: 'Question 6: Frequency vs Wavelength Relationship'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question7',
            title: 'Question 7: Penetration Through Human Body'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question8',
            title: 'Question 8: How Microwaves Cook Food'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question9',
            title: 'Question 9: Night Vision Cameras'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question10',
            title: 'Question 10: Honey Bee Vision'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question11',
            title: 'Question 11: Microwave Frequency Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question12',
            title: 'Question 12: Radar Wavelength Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question13',
            title: 'Question 13: Power Line Frequency Wavelength'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question14',
            title: 'Question 14: Red Light Frequency'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question15',
            title: 'Question 15: Satellite vs Direct Transmission Delay'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question16',
            title: 'Question 16: Wavelength from Period'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question17',
            title: 'Question 17: UV Light in Glass'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question18',
            title: 'Question 18: Period in Lucite'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question19',
            title: 'Question 19: Double-slit Microwave Experiment'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_42_question20',
            title: 'Question 20: Hydrogen Space Emissions'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Faraday's 1846 uncharacteristic speculation about light-magnetism connection inspired Maxwell's work",
          "James Clerk Maxwell (1831-1879) was perhaps the finest theoretical physicist who unified electromagnetism",
          "Maxwell generalized Oersted-Ampere principle: changing electric field generates perpendicular changing magnetic field",
          "Maxwell generalized Henry-Faraday principle: changing magnetic field generates perpendicular changing electric field",
          "Maxwell eliminated the need for conductors - electric and magnetic fields could exist in space",
          "Self-perpetuating cycle: changing E field → changing B field → new changing E field → continues forever",
          "Electromagnetic waves propagate perpendicular to both electric and magnetic field oscillations",
          "EMR travels through vacuum without requiring a medium and can be polarized (transverse waves)",
          "Maxwell predicted: accelerating charges create EMR, frequency correspondence, universal speed c = 3×10⁸ m/s",
          "Maxwell predicted: perpendicular field orientations and all transverse wave phenomena",
          "Heinrich Hertz (1888) experimentally confirmed electromagnetic waves using spark gap apparatus",
          "Hertz verified wave speed (~3×10⁸ m/s), polarization, reflection, diffraction, interference, and refraction",
          "Hertz concluded: 'Electromagnetic waves are light' - confirming Maxwell's theory",
          "Lebedev (1899) and Nichols & Hull (1901) confirmed radiation pressure prediction",
          "Hertz's work inspired Marconi to develop wireless transmission (radio communication)",
          "Electromagnetic spectrum spans from low frequency AC (~60 Hz) to cosmic rays (>10²⁴ Hz)",
          "All EMR travels at same speed c = 3.00×10⁸ m/s; only frequency/wavelength differs between types",
          "Visible light: 700 nm (red) to 400 nm (violet), frequencies 4×10¹⁴ to 7.5×10¹⁴ Hz",
          "Each EMR type originates from different energy transitions: outer electrons (visible/IR) to nuclear processes (gamma rays)",
          "Universal wave equation c = fλ applies to all electromagnetic radiation calculations"
        ]}
      />
    </LessonContent>
  );
};

export default ElectromagneticRadiation;