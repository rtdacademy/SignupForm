import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Image path constants for magnetic fields lesson
const ASSET_PATH = '/courses/2/content/36-magnetic-fields/assests/';
const images = {
  // Magnetic domain images
  magneticDomains: `${ASSET_PATH}Permanent magnets - magnetic domains.png`,
  alignedDomains: `${ASSET_PATH}Permanent magnets - aligned domains.png`,
  
  // Magnetic field visualization images
  barMagnetFilings: `${ASSET_PATH}Magnetic field - bar magnet with iron filings.png`,
  fluxLines: `${ASSET_PATH}Magnetic field - flux lines.png`,
  earthField: `${ASSET_PATH}Magnetic field - earth.png`,
  
  // Oersted demonstration images
  oerstedNoCurrent: `${ASSET_PATH}Oersted's Demonstration - no current.png`,
  oerstedWireCompass: `${ASSET_PATH}Oersted's Demonstration - wire above and below compass.png`,
  
  // Hand rule images
  handRuleDiagram: `${ASSET_PATH}First Hand Rule - hand diagram.png`,
  handRuleCrossSection: `${ASSET_PATH}First Hand Rule - cross section.png`,
  
  // Example problem images
  example1Diagram: `${ASSET_PATH}Example 1 - diagram.png`,
  example1Answer: `${ASSET_PATH}Example 1 - answer.png`,
  example2Diagram: `${ASSET_PATH}Example 2 - diagram.png`,
  example2Answer: `${ASSET_PATH}Example 2 - answer.png`,
  example3Diagram: `${ASSET_PATH}Example 3 - diagram.png`,
  example4Diagram: `${ASSET_PATH}Example 4 - diagram.png`,
  
  // Solenoid and second hand rule images
  secondHandCoilLines: `${ASSET_PATH}Second Hand rule - coil lines.png`,
  secondHandCompare: `${ASSET_PATH}Second Hand rule - compare bar and coil.png`,
  secondHandSolenoid: `${ASSET_PATH}Second Hand rule - solenoid flux lines.png`,
  
  // Practice problem diagrams
  practice1: `${ASSET_PATH}36-practice1diagram.png`,
  practice2: `${ASSET_PATH}36-practice2diagram.png`,
  practice3: `${ASSET_PATH}36-practice3diagram.png`,
  practice4: `${ASSET_PATH}36-practice4diagram.png`,
  practice5: `${ASSET_PATH}36-practice5diagram.png`,
  practice6: `${ASSET_PATH}36-practice6diagram.png`,
  practice7: `${ASSET_PATH}36-practice7diagram.png`
};

const MagneticFields = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_36_magnetic_fields"
      title="Lesson 19 - Magnetic Fields"
      metadata={{ estimated_time: '50 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="introduction" title="Introduction - Electricity vs Magnetism" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Prior to 1820, the majority of natural philosophers (what we now call scientists) believed 
                      that there was no relationship between electricity and magnetism. Repeated tests had 
                      shown that permanent magnets do not effect static charges. The text books of the day 
                      had two separate sections, one on electricity and another on magnetism. No one 
                      suspected that, in reality, electricity and magnetism were intimately related.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Historical Context</h4>
                    <p className="text-sm text-blue-900">
                      This fundamental misconception about the separation of electricity and magnetism 
                      persisted until Hans Oersted's accidental discovery in 1820 would revolutionize 
                      our understanding of these phenomena and lead to the development of electric 
                      motors and generators.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="permanent-magnets" title="Permanent Magnets and Domain Theory" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      There are only certain materials which can either be made into a permanent magnet or 
                      be attracted by a magnetic field. These kinds of materials are called <strong>ferromagnetic 
                      substances</strong>. A ferromagnetic substance is one that can be attracted by a magnet or be 
                      turned into a permanent magnet. Ferromagnetic materials include iron, nickel, cobalt 
                      and alloys of iron such as alnico.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Domain Theory of Magnetism</h4>
                    <p className="text-yellow-900 mb-3">
                      One theory that attempts to explain the behavior of ferromagnetic materials is the 
                      domain theory of magnetism.
                    </p>
                    <p className="text-yellow-900">
                      According to the domain theory, all ferromagnetic substances are composed of a large 
                      number of regions (less than 1 μm long) called <strong>magnetic domains</strong>. Each domain 
                      behaves like a tiny bar magnet.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-2">Unmagnetized State</h5>
                      <div className="mb-3">
                        <img 
                          src={images.magneticDomains} 
                          alt="Random magnetic domains in unmagnetized material" 
                          className="w-full max-w-xs mx-auto rounded border border-red-300"
                        />
                      </div>
                      <p className="text-sm text-red-900">
                        The millions of domains are oriented at random so that their combined magnetic 
                        effects cancel each other out.
                      </p>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Magnetized State</h5>
                      <div className="mb-3">
                        <img 
                          src={images.alignedDomains} 
                          alt="Aligned magnetic domains in magnetized material" 
                          className="w-full max-w-xs mx-auto rounded border border-green-300"
                        />
                      </div>
                      <p className="text-sm text-green-900">
                        In a magnetic field, domains rotate to align with the external field. The stronger 
                        the field, the more domains align, creating a net magnetic effect.
                      </p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Domain Theory Explanations:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">1.</span>
                        <span className="text-blue-900 text-sm">
                          A needle can be magnetized by stroking it in one direction with a permanent 
                          magnet, thereby aligning its domains.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">2.</span>
                        <span className="text-blue-900 text-sm">
                          When a bar magnet is broken in two, rather than producing separate north and 
                          south poles, two smaller magnets are produced, each with its own north and south poles.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">3.</span>
                        <span className="text-blue-900 text-sm">
                          Some induced magnets made of soft iron demagnetize instantaneously while others 
                          made of hard steel or alloys remain magnetized indefinitely. Impurities in alloys 
                          seem to lock the aligned domains in place.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">4.</span>
                        <span className="text-blue-900 text-sm">
                          Heating, hammering or dropping a magnet can cause a magnet to lose its 
                          magnetization. The domains are jostled from an aligned pattern into a random pattern.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">5.</span>
                        <span className="text-blue-900 text-sm">
                          A strong magnet can reverse the magnetism in a bar magnet. This occurs when the 
                          domains reverse their direction in the presence of a strong external magnetic field.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">6.</span>
                        <span className="text-blue-900 text-sm">
                          Ship's hulls, steel columns and beams in buildings, and many other ferromagnetic 
                          structures are often found to be magnetized by the combined effects of the Earth's 
                          magnetic field and the vibrations created during construction.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">7.</span>
                        <span className="text-blue-900 text-sm">
                          Some ferromagnetic minerals will have a magnetic field aligned with that of the 
                          Earth's magnetic field. The domains in the minerals align themselves with the 
                          external field of the Earth.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> Refer to Pearson pages 589 to 591 for a discussion about the domain theory of magnetism.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="magnetic-fields-rules" title="Magnetic Fields and Rules of Magnetism" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Like the Rules of Charge that describe electrical interactions, the <strong>Rules for Magnetism</strong> are:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Rules for Magnetism</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="text-blue-900">There are two kinds of magnetic poles (North and South).</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="text-blue-900">Like poles repel.</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="text-blue-900">Unlike poles attract.</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      A <strong>magnetic pole</strong> is a region of the magnet where its strength is greatest. Every magnet 
                      has two poles. In fact, magnets are always bipolar – i.e. there are no isolated 
                      magnetic poles. This is, of course, different from electric charges that can and do occur 
                      in isolation. Do not confuse North and South magnetic poles with + and − charges. 
                      Magnetic poles do not attract or repel electric charges.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Visualizing Magnetic Fields</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <img 
                          src={images.barMagnetFilings} 
                          alt="Bar magnet with iron filings showing magnetic field pattern" 
                          className="w-full rounded border border-yellow-300 mb-2"
                        />
                        <p className="text-xs text-yellow-800 font-medium">Iron filings reveal magnetic field pattern</p>
                      </div>
                      <div className="text-center">
                        <img 
                          src={images.fluxLines} 
                          alt="Magnetic flux lines diagram around a bar magnet" 
                          className="w-full rounded border border-yellow-300 mb-2"
                        />
                        <p className="text-xs text-yellow-800 font-medium">Magnetic flux lines representation</p>
                      </div>
                    </div>
                    
                    <p className="text-yellow-900 mb-3">
                      The magnetic field around a magnet can be easily observed by sprinkling iron filings 
                      on a horizontal surface in the field. The domains in the little iron filings are aligned 
                      by the field and then behave like magnetic compass needles which align themselves in 
                      the direction of the field.
                    </p>
                    <p className="text-yellow-900">
                      In a diagram of a magnetic field, the magnetic field is represented by <strong>magnetic lines 
                      of force</strong>, which are also called <strong>magnetic flux lines</strong>. These lines are imaginary. 
                      The stronger a magnet, the greater the number of flux lines.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Key Properties of Magnetic Field Lines</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900 text-sm">
                          Magnetic field lines continue through the magnetic domains within the magnet and are 
                          therefore continuous.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900 text-sm">
                          Unlike gravitational field lines (originate from mass) or electric field lines 
                          (originate from positive charges), magnetic field lines have no beginning and no end.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-green-600 font-bold mt-1">•</span>
                        <span className="text-green-900 text-sm">
                          Outside of the magnet, field line direction is from the N-pole to the S-pole.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Earth's Magnetic Field</h4>
                    
                    <div className="text-center mb-4">
                      <img 
                        src={images.earthField} 
                        alt="Earth's magnetic field diagram showing field lines and magnetic poles" 
                        className="w-full max-w-md mx-auto rounded border border-purple-300"
                      />
                      <p className="text-xs text-purple-800 font-medium mt-2">Earth's magnetic field with north and south magnetic poles</p>
                    </div>
                    
                    <p className="text-purple-900 mb-3">
                      The Earth has a magnetic field that acts as if it had a giant magnet inside it. Note that 
                      the north end of a compass points toward the geographic north pole.
                    </p>
                    <p className="text-purple-900">
                      However, since the north pole of a compass is attracted to the south pole of a magnet, 
                      we conclude that there is a <strong>south magnetic pole</strong> at the north geographic pole of the Earth. 
                      Likewise, there is a <strong>north magnetic pole</strong> at the south geographic pole of the Earth.
                    </p>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> Refer to Pearson pages 585 and 586 for a discussion about magnetic fields.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="oersted-demonstration" title="Oersted's Demonstration - The Discovery" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      As stated earlier, in the early 19th century people did not know of the relationship 
                      between electricity and magnetism. In 1820, <strong>Hans Oersted (1777 – 1851)</strong> accidentally 
                      made a discovery that was to have major effects on the use of electricity. His discovery 
                      would lead to the development of the electric motor and the generator within eleven years.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">The Accidental Discovery</h4>
                    <p className="text-blue-900 mb-3">
                      Oersted was a professor and one day he was using one of Volta's electrochemical cells to 
                      demonstrate that an electric current in a wire produces heat. While doing the demonstration 
                      he noticed that a nearby magnet would always turn when the current in the wire was turned on.
                    </p>
                    <p className="text-blue-900">
                      To investigate, he placed a small compass under the wire so that the copper wire conductor 
                      and the compass needle were parallel. When he turned the current on the compass needle moved 
                      so that it became perpendicular to the current carrying wire.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Oersted's Observations</h4>
                    <p className="text-yellow-900 mb-3">
                      When he placed the compass above the current carrying wire it pointed in one direction and 
                      when placed below the wire it pointed in the opposite direction. With his discovery, Oersted 
                      became famous over night.
                    </p>
                    
                    <div className="bg-white border border-yellow-300 rounded-lg p-4 mt-4">
                      <div className="text-center mb-3">
                        <h5 className="font-medium text-yellow-800">Oersted's Setup</h5>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="text-center">
                          <img 
                            src={images.oerstedNoCurrent} 
                            alt="Compass needle with no current flowing through wire" 
                            className="w-full rounded border border-yellow-300 mb-2"
                          />
                          <p className="text-xs text-yellow-800 font-medium">No current - compass points north</p>
                        </div>
                        
                        <div className="text-center">
                          <img 
                            src={images.oerstedWireCompass} 
                            alt="Compass needle deflection with current flowing through wire above and below" 
                            className="w-full rounded border border-yellow-300 mb-2"
                          />
                          <p className="text-xs text-yellow-800 font-medium">Current flowing - compass deflects perpendicular to wire</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">The Key Discovery</h4>
                    <div className="space-y-3">
                      <p className="text-green-900 font-medium">
                        Current through a conducting wire induces a magnetic field around 
                        the wire in a plane that is perpendicular to the wire.
                      </p>
                      <p className="text-green-900 font-medium">
                        In addition, the relative motion of a charged particle induces a magnetic field around 
                        the particle.
                      </p>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Warning</h4>
                    <p className="text-red-900">
                      Many students get caught up in the hand rules that are presented in the next 
                      section, and they forget the main idea that current-carrying wires and moving charges 
                      have induced magnetic fields around them.
                    </p>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      <strong>Reference:</strong> Refer to Pearson pages 587 and 588 for a discussion about induced magnetic fields.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="first-hand-rule" title="First Hand Rule - Current Carrying Wires" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Important Recall from Lesson 18:</h4>
                    <div className="space-y-2">
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          The terms <strong>current</strong> and <strong>conventional current</strong> refer to the movement of positive charges.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold mt-1">•</span>
                        <span className="text-yellow-900">
                          <strong>Electron current</strong> or <strong>electron flow</strong> refers to the movement of negative charges.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      In order to predict the direction of the magnetic field around a current carrying wire, we 
                      use hand rules. There are three hand rules we will be using:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">The Three Hand Rules</h4>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">1.</span>
                        <span className="text-blue-900">
                          The <strong>first hand rule</strong> indicates the direction of the magnetic field around a current 
                          carrying wire.
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">2.</span>
                        <span className="text-blue-900">
                          The <strong>second hand rule</strong> indicates the magnetic field direction for a coil of wire 
                          (i.e. a solenoid).
                        </span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">3.</span>
                        <span className="text-blue-900">
                          The <strong>third hand rule</strong> (which we will deal with in Lessons 20 and 21) indicates the 
                          direction of the force when a charged particle enters a magnetic field.
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Hand Rule Convention</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Left Hand</h5>
                        <p className="text-sm text-green-900">Used for electron current (negative charges)</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Right Hand</h5>
                        <p className="text-sm text-green-900">Used for conventional current (positive charges)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">First Hand Rule Technique</h4>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <img 
                          src={images.handRuleDiagram} 
                          alt="Hand diagram showing first hand rule technique for magnetic field direction" 
                          className="w-full max-w-sm mx-auto rounded border border-purple-300 mb-2"
                        />
                        <p className="text-xs text-purple-800 font-medium">Hand rule technique</p>
                      </div>
                      <div className="text-center">
                        <img 
                          src={images.handRuleCrossSection} 
                          alt="Cross-section view of magnetic field around current-carrying wire" 
                          className="w-full max-w-sm mx-auto rounded border border-purple-300 mb-2"
                        />
                        <p className="text-xs text-purple-800 font-medium">3D magnetic field view</p>
                      </div>
                    </div>
                    
                    <p className="text-purple-900 mb-3">
                      For a current carrying wire the <strong>thumb points in the direction of the current</strong> and the 
                      <strong>fingers curl around the wire</strong> indicating the direction of the magnetic field. Note that 
                      the direction of the magnetic field is around the wire.
                    </p>
                    <p className="text-purple-900">
                      Note that the magnetic field around a current carrying wire is in three-dimensional space. 
                      The current carrying wires are surrounded by magnetic fields that are not in the plane 
                      of the paper.
                    </p>
                  </div>

                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Notation for 3D Diagrams</h4>
                    <p className="text-gray-700 mb-3">
                      We can represent current direction using standard notation:
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">•</span>
                          <span className="text-sm">represents a direction <strong>out of</strong> the page</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">(Imagine the point of an arrow coming toward you)</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-gray-400">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">⊗</span>
                          <span className="text-sm">represents a direction <strong>into</strong> the page</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">(Imagine the feathers of an arrow moving away from you)</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Wire Under Compass" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A wire is placed under a compass needle and electrons are allowed to flow from A to B 
                  as shown in the diagram. What direction will the compass needle point?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="text-center mb-4">
                    <img 
                      src={images.example1Diagram} 
                      alt="Example 1: Wire under compass with electron flow from A to B" 
                      className="w-full max-w-md mx-auto rounded border border-blue-300"
                    />
                    <p className="text-sm text-gray-600 mt-2">Wire under compass needle - electrons flow A to B</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Apply the First Hand Rule</span>
                      <p className="text-gray-700 mt-2">
                        Using the <strong>left hand</strong> (i.e. electron flow), we find that on 
                        top of the wire your fingers point to the right. This tells us that the north end 
                        of the compass will point to the right.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">Step-by-step:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">1.</span>
                          <span className="text-blue-900">Identify the type of current: electron flow (A → B)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">2.</span>
                          <span className="text-blue-900">Use left hand rule for electron flow</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">3.</span>
                          <span className="text-blue-900">Thumb points in direction of electron flow (A → B)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">4.</span>
                          <span className="text-blue-900">Fingers curl to show magnetic field direction above wire</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <div className="mt-3 text-center">
                        <img 
                          src={images.example1Answer} 
                          alt="Example 1 answer showing compass needle pointing to the right" 
                          className="w-full max-w-sm mx-auto rounded border border-green-300 mb-2"
                        />
                      </div>
                      <p className="text-green-900 mt-1 text-center">
                        The north end of the compass needle will point <strong>to the right</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Wire Over Compass" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A wire is placed over a compass needle and current flows from A to B as shown in the diagram. 
                  What direction will the compass needle point?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="text-center mb-4">
                    <img 
                      src={images.example2Diagram} 
                      alt="Example 2: Wire over compass with conventional current from A to B" 
                      className="w-full max-w-md mx-auto rounded border border-red-300"
                    />
                    <p className="text-sm text-gray-600 mt-2">Wire over compass needle - conventional current flows A to B</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Apply the First Hand Rule</span>
                      <p className="text-gray-700 mt-2">
                        Using the <strong>right hand</strong> (i.e. conventional current), we find that below 
                        the wire your fingers point to the right. This tells us that the north end 
                        of the compass will point to the right.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 mb-2">Step-by-step:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">1.</span>
                          <span className="text-red-900">Identify the type of current: conventional current (A → B)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">2.</span>
                          <span className="text-red-900">Use right hand rule for conventional current</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">3.</span>
                          <span className="text-red-900">Thumb points in direction of current flow (A → B)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">4.</span>
                          <span className="text-red-900">Fingers curl to show magnetic field direction below wire</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <div className="mt-3 text-center">
                        <img 
                          src={images.example2Answer} 
                          alt="Example 2 answer showing compass needle pointing to the right" 
                          className="w-full max-w-sm mx-auto rounded border border-green-300 mb-2"
                        />
                      </div>
                      <p className="text-green-900 mt-1 text-center">
                        The north end of the compass needle will point <strong>to the right</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="second-hand-rule" title="Second Hand Rule - Solenoids and Electromagnets" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      When a long conducting wire is bent into a loop, the magnetic field from each point in the 
                      loop points in the same direction. The result is a strong magnetic field inside the loop of wire.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Creating Electromagnets</h4>
                    <p className="text-blue-900 mb-3">
                      If more turns of wire are wrapped repeatedly we have a coil of wire, a <strong>solenoid</strong>, and our 
                      generated field will become stronger while its direction remains constant. This is called an 
                      <strong>electromagnet</strong> since the electric current through the loops of wire results in a strong, 
                      uniform magnetic field.
                    </p>
                    <p className="text-blue-900">
                      The strength of the electromagnet will depend on the <strong>number of loops</strong> in the 
                      solenoid and the <strong>amount of current</strong> flowing through the loops.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Second Hand Rule Technique</h4>
                    <p className="text-green-900 mb-3">
                      To determine the direction of the magnetic field in the core of the solenoid, we use the 
                      second hand rule. The fingers curl in the direction of the current (right hand) or the 
                      electron flow (left hand).
                    </p>
                    <p className="text-green-900">
                      The <strong>thumb will point in the direction of the magnetic field lines</strong> in the core of the 
                      solenoid and, hence, towards the <strong>north pole</strong> of the electromagnet.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Electromagnet Field Visualization</h4>
                    
                    <div className="grid md:grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <img 
                          src={images.secondHandCoilLines} 
                          alt="Magnetic field lines around a current-carrying coil" 
                          className="w-full rounded border border-yellow-300 mb-2"
                        />
                        <p className="text-xs text-yellow-800 font-medium">Coil magnetic field lines</p>
                      </div>
                      <div className="text-center">
                        <img 
                          src={images.secondHandCompare} 
                          alt="Comparison between bar magnet and electromagnet magnetic fields" 
                          className="w-full rounded border border-yellow-300 mb-2"
                        />
                        <p className="text-xs text-yellow-800 font-medium">Bar magnet vs electromagnet</p>
                      </div>
                      <div className="text-center">
                        <img 
                          src={images.secondHandSolenoid} 
                          alt="Solenoid magnetic flux lines showing uniform field inside" 
                          className="w-full rounded border border-yellow-300 mb-2"
                        />
                        <p className="text-xs text-yellow-800 font-medium">Solenoid flux lines</p>
                      </div>
                    </div>
                    
                    <p className="text-yellow-900">
                      The magnetic field of an electromagnet is similar to the field of a bar magnet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Solenoid North Pole (Configuration 1)" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  In the diagram below if current flows from A to B, which end of the coil is north?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="text-center mb-4">
                    <img 
                      src={images.example3Diagram} 
                      alt="Example 3: Solenoid configuration 1 with current flowing from A to B" 
                      className="w-full max-w-lg mx-auto rounded border border-blue-300"
                    />
                    <p className="text-sm text-gray-600 mt-2">Solenoid Configuration 1 - Current flows A to B</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Draw Current Direction</span>
                      <p className="text-gray-700 mt-2">
                        Draw in arrows on the solenoid to indicate the direction of current flow from A to B.
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply Second Hand Rule</span>
                      <p className="text-gray-700 mt-2">
                        Since we are dealing with conventional current we use the <strong>right hand</strong>. 
                        The fingers of the right hand point in the direction of the current and the 
                        thumb points in the North direction for the induced magnetic field.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-800 mb-2">Analysis:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">1.</span>
                          <span className="text-blue-900">Current flows from A to B (conventional current)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">2.</span>
                          <span className="text-blue-900">Use right hand rule for conventional current</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">3.</span>
                          <span className="text-blue-900">Fingers curl in direction of current around coil</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">4.</span>
                          <span className="text-blue-900">Thumb points toward north pole</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The <strong>north pole is to the right</strong> and the <strong>south pole to the left</strong>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4 - Solenoid North Pole (Configuration 2)" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  In the diagram below if current flows from A to B, which end of the coil is north?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <div className="text-center mb-4">
                    <img 
                      src={images.example4Diagram} 
                      alt="Example 4: Solenoid configuration 2 with current flowing from A to B" 
                      className="w-full max-w-lg mx-auto rounded border border-red-300"
                    />
                    <p className="text-sm text-gray-600 mt-2">Solenoid Configuration 2 - Current flows A to B</p>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Draw Current Direction</span>
                      <p className="text-gray-700 mt-2">
                        Draw in arrows on the solenoid to indicate the direction of current flow from A to B.
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Apply Second Hand Rule</span>
                      <p className="text-gray-700 mt-2">
                        Since we are dealing with conventional current we use the <strong>right hand</strong>. 
                        The fingers of the right hand point in the direction of the current and the 
                        thumb points in the North direction for the induced magnetic field.
                      </p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-medium text-red-800 mb-2">Analysis:</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">1.</span>
                          <span className="text-red-900">Current flows from A to B (conventional current)</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">2.</span>
                          <span className="text-red-900">Use right hand rule for conventional current</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">3.</span>
                          <span className="text-red-900">Fingers curl in direction of current around coil</span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">4.</span>
                          <span className="text-red-900">Note: This coil winds in opposite direction to Example 3</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer:</span>
                      <p className="text-green-900 mt-1">
                        The <strong>north pole is to the left</strong> and the <strong>south pole to the right</strong>.
                      </p>
                      <p className="text-green-900 mt-2 text-sm">
                        Note the difference between this example and example 3 is that the winding of the solenoids are opposite.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="comparing-fields" title="Comparing Magnetic, Gravitational and Electric Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The idea of a field of influence resulted from a need to explain how one object (for 
                      example a magnet) can have an effect on another object (an iron nail) over a distance. 
                      How does an iron nail "know" about the presence of the magnet? Conversely, how 
                      does the magnet "know" about the nail? After all, the magnet and the nail are not in 
                      direct contact.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Similarly, how does the Earth "know" about the presence of the Sun? Or 
                      how does a proton become attracted to an electron? It is this action at a distance for 
                      which the concept of a field was developed. This type of influence at a distance is 
                      referred to as a <strong>field</strong>.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Gravitational Fields</h4>
                    <p className="text-blue-900 mb-3">
                      We studied gravity in Physics 20 where it was described as the attraction between two 
                      masses. In terms of fields, one object responded to the gravitational field of another 
                      object. For example, near the surface of the Earth all objects, regardless of size or 
                      shape, are subject to an average acceleration due to gravity of 9.81 m/s² acting toward 
                      the center of the Earth.
                    </p>
                    <p className="text-blue-900">
                      Another name for this acceleration is <strong>gravitational field strength</strong>. Near the surface of the Earth, 
                      the gravitational field strength is 9.81 m/s² downward. As you move away from the center of the Earth, 
                      the gravitational field strength decreases in magnitude, but its direction remains unchanged.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Gravitational Field Formula</h4>
                    <div className="text-center mb-3">
                      <BlockMath math="g = \frac{GM}{r^2}" />
                    </div>
                    <p className="text-sm text-yellow-900 text-center">
                      units: N/kg or m/s²
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Force vs Field Strength Concept</h4>
                    <p className="text-purple-900 mb-3">
                      Some confusion may exist between the concepts of gravitational field strength and 
                      gravitational force. Consider three objects:
                    </p>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300 text-center">
                        <div className="font-bold text-purple-800">10 kg</div>
                        <div className="text-sm text-purple-700 mt-2">Different force due to different mass</div>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300 text-center">
                        <div className="font-bold text-purple-800">100 kg</div>
                        <div className="text-sm text-purple-700 mt-2">Different force due to different mass</div>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300 text-center">
                        <div className="font-bold text-purple-800">1000 kg</div>
                        <div className="text-sm text-purple-700 mt-2">Different force due to different mass</div>
                      </div>
                    </div>
                    
                    <p className="text-purple-900 mt-3 text-center">
                      Each object experiences the <strong>same gravitational field strength</strong> of -9.81 m/s²
                    </p>
                    
                    <div className="text-center mt-3">
                      <BlockMath math="F_g = mg" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-3">Gravitational Fields</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold mt-1">•</span>
                          <span className="text-green-900">
                            Exist between any objects which have mass
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold mt-1">•</span>
                          <span className="text-green-900">
                            Massive objects always attract, they never repel
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold mt-1">•</span>
                          <span className="text-green-900">
                            Decrease in strength with increased distance
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-green-600 font-bold mt-1">•</span>
                          <span className="text-green-900">
                            Have a vector nature
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-3">Electric Fields</h4>
                      <p className="text-red-900 text-sm mb-3">
                        As we saw in Lesson 15, an electric field is generated by any object which has an electric charge.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">•</span>
                          <span className="text-red-900">
                            Can be produced by either positive or negative charged objects
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">•</span>
                          <span className="text-red-900">
                            Like charges repel, unlike charges attract
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">•</span>
                          <span className="text-red-900">
                            Decrease in strength with increased distance
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-red-600 font-bold mt-1">•</span>
                          <span className="text-red-900">
                            Have a vector nature
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-3">Magnetic Fields</h4>
                      <p className="text-blue-900 text-sm mb-3">
                        As we saw in this lesson, magnetic fields can be produced by aligned magnetic domains or they can be induced by current-carrying wires.
                      </p>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span className="text-blue-900">
                            Magnets are always bipolar, possessing a north and a south pole (No magnetic monopoles detected)
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span className="text-blue-900">
                            Similar poles repel, opposite poles attract
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span className="text-blue-900">
                            Decrease in strength with increased distance from the magnet
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span className="text-blue-900">
                            Have a vector nature
                          </span>
                        </div>
                        <div className="flex items-start gap-3">
                          <span className="text-blue-600 font-bold mt-1">•</span>
                          <span className="text-blue-900">
                            Unlike gravitational or electric fields, magnetic field lines are always circular without beginning or end
                          </span>
                        </div>
                      </div>
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
            <h3 className="text-xl font-semibold mb-3">Introduction - Electricity vs Magnetism</h3>
            <p>Prior to 1820, scientists believed there was no relationship between electricity and magnetism...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Permanent Magnets and Domain Theory</h3>
            <p>Ferromagnetic substances and the domain theory of magnetism...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Magnetic Fields and Rules of Magnetism</h3>
            <p>Rules for magnetism and magnetic field visualization...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Oersted's Demonstration</h3>
            <p>The accidental discovery that linked electricity and magnetism...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">First Hand Rule</h3>
            <p>Determining magnetic field direction around current-carrying wires...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Examples 1 & 2</h3>
            <p>Compass needle behavior with current-carrying wires...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Second Hand Rule</h3>
            <p>Solenoids and electromagnets...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Examples 3 & 4</h3>
            <p>Determining north poles of solenoids...</p>
          </TextSection>
          
          <TextSection>
            <h3 className="text-xl font-semibold mb-3">Comparing Fields</h3>
            <p>Magnetic, gravitational, and electric field characteristics...</p>
          </TextSection>
        </div>
      )}

      {/* Knowledge Check Questions */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="36-magnetic-fields"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question1',
            title: 'Question 1: Right Hand Rule - Compass Under Wire'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question2',
            title: 'Question 2: Right Hand Rule - Compass Above Wire'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question3',
            title: 'Question 3: Left Hand Rule - Electron Flow'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question4',
            title: 'Question 4: Parallel Wires - Same Direction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question5',
            title: 'Question 5: Parallel Wires - Opposite Direction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question6',
            title: 'Question 6: Circular Conductor Loop'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question7',
            title: 'Question 7: Solenoid Cross-Section'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question8',
            title: 'Question 8: Solenoid North Pole - Configuration 1'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question9',
            title: 'Question 9: Solenoid North Pole - Configuration 2'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question10',
            title: 'Question 10: Domain Theory'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question11',
            title: 'Question 11: Ferromagnetic Materials'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question12',
            title: 'Question 12: Magnetic Poles'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question13',
            title: 'Question 13: Field Line Properties'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question14',
            title: 'Question 14: Electromagnet Strength'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_36_question15',
            title: 'Question 15: Oersted Discovery'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Prior to 1820, scientists believed electricity and magnetism were unrelated phenomena",
          "Ferromagnetic substances (iron, nickel, cobalt, alloys) can be magnetized or attracted by magnets",
          "Domain theory explains magnetism: tiny magnetic domains align with external fields",
          "Domain alignment explains magnetization, demagnetization, and magnetic material behavior",
          "Rules for magnetism: two poles (N & S), like poles repel, unlike poles attract",
          "Magnets are always bipolar - no isolated magnetic poles exist (unlike electric charges)",
          "Magnetic field lines are continuous loops with no beginning or end",
          "Earth's magnetic field: magnetic south pole at geographic north pole",
          "Hans Oersted (1820) accidentally discovered that electric current creates magnetic fields",
          "Current-carrying wires induce magnetic fields perpendicular to the wire",
          "Moving charged particles also induce magnetic fields around them",
          "First hand rule: thumb = current direction, fingers = magnetic field direction",
          "Left hand for electron flow, right hand for conventional current",
          "Wire loops and solenoids create strong, uniform magnetic fields (electromagnets)",
          "Second hand rule: fingers = current direction, thumb = north pole direction",
          "Electromagnet strength depends on number of coils and current magnitude",
          "Gravitational fields always attractive, electric fields can attract/repel",
          "Magnetic fields require two poles, decrease with distance, have vector nature",
          "All three field types (gravitational, electric, magnetic) explain 'action at a distance'"
        ]}
      />
    </LessonContent>
  );
};

export default MagneticFields;