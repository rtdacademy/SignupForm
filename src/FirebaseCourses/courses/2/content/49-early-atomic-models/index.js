import React from 'react';
import LessonContent, { LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const EarlyAtomicModels = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode, AIAccordion, onAIAccordionContent }) => {
  return (
    <LessonContent
      lessonId="lesson_49_early_atomic_models"
      title="Lesson 25 - Early Atomic Models"
      metadata={{ estimated_time: '45 minutes' }}
    >
      
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="introduction" title="Setting the Stage" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed">
                    In Lessons 25 to 38 we explore the nature of the atom. The lessons more or less
                    follow the historical development of our modern understanding of atoms. The purpose
                    of this lesson is to "set the stage" by describing the understanding of atoms just prior to
                    the beginning of the twentieth century, for it was in the early 1900's that our modern
                    understanding of matter began to really take shape.
                  </p>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="alchemy" title="Alchemy" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    For thousands of years, philosophers of nature held to a theory of matter put
                    forward by Aristotle in the 6th century BCE. All matter was composed of a combination
                    of four elements (fire, air, water, earth) and a number of principles (dry, hot,
                    moist, cold).
                  </p>
                  
                  {/* Interactive Four Elements Display */}
                  <div className="bg-white p-4 rounded-lg border border-gray-300 mb-6">
                    <h4 className="font-semibold mb-3 text-center">The Four Elements & Principles</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-red-50 p-3 rounded border border-red-200 text-center">
                        <span className="text-2xl">🔥</span>
                        <p className="font-semibold text-red-700">Fire</p>
                        <p className="text-sm text-red-600">Hot & Dry</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded border border-blue-200 text-center">
                        <span className="text-2xl">💧</span>
                        <p className="font-semibold text-blue-700">Water</p>
                        <p className="text-sm text-blue-600">Cold & Moist</p>
                      </div>
                      <div className="bg-green-50 p-3 rounded border border-green-200 text-center">
                        <span className="text-2xl">🍃</span>
                        <p className="font-semibold text-green-700">Air</p>
                        <p className="text-sm text-green-600">Hot & Moist</p>
                      </div>
                      <div className="bg-amber-50 p-3 rounded border border-amber-200 text-center">
                        <span className="text-2xl">🪨</span>
                        <p className="font-semibold text-amber-700">Earth</p>
                        <p className="text-sm text-amber-600">Cold & Dry</p>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    By using these principles and elements in various combinations, the varying
                    properties of different compounds could be "explained." Alchemy was a mixture of
                    philosophy, astrology, mysticism, magic, science and many other subjects. It was
                    an attempt to unify one's knowledge through a search for the philosopher's stone (no,
                    not Harry Potter's stone).
                  </p>
                  
                  {/* Philosopher's Stone Info Box */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-300 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">💎 The Philosopher's Stone</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      The philosopher's stone was believed to be the pure substance underlying all of matter, 
                      thought, and creation which could transmute anything into gold. Gold was symbolic of 
                      the material form of God – permanent, incorruptible and pure.
                    </p>
                  </div>
                  
                  {/* Famous Alchemists Box */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-2">⚗️ Did You Know?</h4>
                    <p className="text-gray-700 text-sm">
                      Many famous scientists were interested in alchemy, including:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-600">•</span>
                        <span><strong>Isaac Newton</strong> - Wrote more about alchemy than physics!</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-600">•</span>
                        <span><strong>Robert Boyle</strong> - Father of modern chemistry, practiced alchemy</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-indigo-600">•</span>
                        <span><strong>Tycho Brahe</strong> - Famous astronomer and alchemist</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="dalton" title="Dalton and the Postulates of Chemical Philosophy" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    John Dalton (1766-1844) is known as the father of chemistry. He was colour blind and
                    therefore had great difficulty working in the laboratory. His accomplishments rest on his
                    ingenious interpretation of the work of previous experimenters like Francis Bacon,
                    Benjamin Franklin, William Gilbert, Charles Coulomb, Antoine Lavoisier, and many
                    others.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Before the time of John Dalton, chemistry did not exist. All research was
                    classified as alchemy, and most of the relevant information in the field existed because
                    of the commitment of alchemists into turning base metals (lead, antimony, etc.) into
                    gold. Many alchemists went to their graves as a direct result of heavy metal poisoning.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Dalton synthesized all previous research in the field of alchemy into five basic
                    postulates of chemical philosophy that gave a starting point for all further research.
                    He published the five postulates in 1808 and chemistry began.
                  </p>
                  
                  {/* Dalton's Five Postulates */}
                  <div className="bg-white p-5 rounded-lg border border-gray-300">
                    <h4 className="font-semibold text-lg mb-4 text-center text-blue-800">The Five Postulates of Chemical Philosophy</h4>
                    <ol className="space-y-3">
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[24px]">1.</span>
                        <span className="text-gray-700">Matter is composed from indivisible atoms.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[24px]">2.</span>
                        <span className="text-gray-700">Each element consists of a characteristic kind of identical atom.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[24px]">3.</span>
                        <span className="text-gray-700">Atoms are unchangeable.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[24px]">4.</span>
                        <span className="text-gray-700">When different elements combine and form a compound, the smallest possible portion of the compound (molecule) is a group containing a definite, whole number of atoms of each element.</span>
                      </li>
                      <li className="flex gap-3">
                        <span className="font-bold text-blue-600 min-w-[24px]">5.</span>
                        <span className="text-gray-700">In chemical reactions, atoms are neither created nor destroyed, but only rearranged.</span>
                      </li>
                    </ol>
                  </div>
                  
                  {/* Key Points About Dalton */}
                  <div className="mt-6 bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">🔬 Dalton's Key Beliefs</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">All elements were composed of extremely tiny, indivisible and indestructible atoms (like solid spheres)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">All substances were composed of various combinations of these atoms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Atoms of different elements were different in size and mass</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">He tried to determine numerical values for their relative masses (we still use relative atomic mass today)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="periodic-nature" title="The Periodic Nature of the Elements" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    In the year 1800, all previous work by all the alchemists over centuries has only
                    identified 31 different elements. John Dalton's new field of chemistry encouraged the
                    discovery of many new elements. By 1860, the number of known elements totaled 60.
                    The sheer number of elements, plus the almost constant discovery of new elements,
                    spurred interest in the organization of the elements into categories.
                  </p>
                  
                  {/* Newlands' Work */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                    <h4 className="font-semibold text-orange-800 mb-2">📊 J. Newlands (1865)</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Produced the first list of the known elements, ranking all the elements according to increasing atomic mass.
                    </p>
                    <p className="text-gray-700 text-sm italic">
                      Surprising observation: Elements with similar chemical and physical properties appeared over and over in the list!
                    </p>
                  </div>
                  
                  {/* Meyer's Discovery */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">📈 Julius Meyer's Periodic Discovery (1869)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Meyer examined physical properties of the elements and decided to plot relative atomic size
                      against increasing atomic mass. His graph produced a series of peaks and valleys:
                    </p>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-semibold text-purple-700 mb-1">⛰️ Peaks (Alkali Metals):</p>
                          <ul className="space-y-1 text-gray-600">
                            <li>• 1st peak: Lithium</li>
                            <li>• 2nd peak: Sodium</li>
                            <li>• 3rd peak: Potassium</li>
                          </ul>
                        </div>
                        <div>
                          <p className="font-semibold text-purple-700 mb-1">🏔️ Valleys (Halogens):</p>
                          <ul className="space-y-1 text-gray-600">
                            <li>• 1st valley: Fluorine</li>
                            <li>• 2nd valley: Chlorine</li>
                            <li>• 3rd valley: Bromine</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Meyer's Conclusion */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                    <h4 className="font-semibold text-indigo-800 mb-2">💡 Meyer's Conclusion</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Meyer concluded that the properties of the elements might be a periodic (re-occurring) function of
                      their atomic mass. He published his research in early 1869 and received the Copley medal
                      for his work from the Royal Society of London in 1882.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="mendeleev" title="Dmitri Mendeleev" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Dmitri Mendeleev (1834-1907) was unable to gain admission into the University of
                    Moscow, but he was accepted into the University of St. Petersburg. In 1861, he
                    received a doctorate in Chemistry for a thesis on the combination of alcohol with water.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-4">
                    In 1869, Mendeleev began to prepare a table of the elements. Like Meyer, he
                    recognized the importance of the recurring chemical and physical properties of the
                    chemical families. So he began to set up a table that would increase in atomic mass
                    while still accounting for the periodic families of elements.
                  </p>
                  
                  {/* Mendeleev's Table Structure */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                    <h4 className="font-semibold text-indigo-800 mb-2">📋 Mendeleev's Table Design</h4>
                    <p className="text-gray-700 text-sm">
                      In Mendeleev's table:
                    </p>
                    <ul className="mt-2 space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700">Atomic mass increases horizontally</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-indigo-600">•</span>
                        <span className="text-gray-700">Elements are grouped vertically according to chemical and physical properties (chemical families)</span>
                      </li>
                    </ul>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    By 1871, Mendeleev had designed a table that looks very similar to the periodic table
                    we use today. The transition elements do not appear until the fourth horizontal row (Ti
                    through Zn). This version of the table was actively used until 1914.
                  </p>
                  
                  {/* Mendeleev's Predictions */}
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200 mb-6">
                    <h4 className="font-semibold text-emerald-800 mb-3">🔮 Mendeleev's Greatest Achievement</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Mendeleev's greatest claim to fame came from the predictions he made about the
                      blanks on his periodic table. In 1871, he made three predictions concerning
                      three blanks on his table. These elements were all discovered by 1886 – note
                      Mendeleev's amazing accuracy:
                    </p>
                    
                    {/* Predictions Table */}
                    <div className="bg-white p-3 rounded border border-emerald-300 overflow-x-auto">
                      <table className="text-sm w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Element</th>
                            <th className="text-left p-2">Property</th>
                            <th className="text-left p-2">Predicted (1871)</th>
                            <th className="text-left p-2">Observed</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b bg-emerald-50/50">
                            <td rowSpan="3" className="p-2 font-semibold">Scandium<br/><span className="text-xs font-normal">(Discovered 1877)</span></td>
                            <td className="p-2">Molar Mass</td>
                            <td className="p-2">44 g</td>
                            <td className="p-2">43.7 g</td>
                          </tr>
                          <tr className="border-b bg-emerald-50/50">
                            <td className="p-2">Oxide formula</td>
                            <td className="p-2">M₂O₃</td>
                            <td className="p-2">Sc₂O₃</td>
                          </tr>
                          <tr className="border-b bg-emerald-50/50">
                            <td className="p-2">Density of oxide</td>
                            <td className="p-2">3.5 g/ml</td>
                            <td className="p-2">3.86 g/ml</td>
                          </tr>
                          
                          <tr className="border-b">
                            <td rowSpan="3" className="p-2 font-semibold">Gallium<br/><span className="text-xs font-normal">(Discovered 1875)</span></td>
                            <td className="p-2">Molar mass</td>
                            <td className="p-2">68 g</td>
                            <td className="p-2">69.4 g</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Density of metal</td>
                            <td className="p-2">6.0 g/ml</td>
                            <td className="p-2">5.96 g/ml</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">Melting temperature</td>
                            <td className="p-2">Low</td>
                            <td className="p-2">30°C</td>
                          </tr>
                          
                          <tr className="border-b bg-emerald-50/50">
                            <td rowSpan="3" className="p-2 font-semibold">Germanium<br/><span className="text-xs font-normal">(Discovered 1886)</span></td>
                            <td className="p-2">Molar mass</td>
                            <td className="p-2">72 g</td>
                            <td className="p-2">72.6 g</td>
                          </tr>
                          <tr className="border-b bg-emerald-50/50">
                            <td className="p-2">Density of metal</td>
                            <td className="p-2">5.5 g/ml</td>
                            <td className="p-2">5.47 g/ml</td>
                          </tr>
                          <tr className="bg-emerald-50/50">
                            <td className="p-2">Color of metal</td>
                            <td className="p-2">Dark gray</td>
                            <td className="p-2">Grayish white</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Awards and Recognition */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">🏆 Awards & Recognition</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      Mendeleev's periodic table explained all known items and the table was accurate
                      enough to make predictions that proved to be correct. He was rewarded with:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span><strong>Davy Medal</strong> (Royal Society of London) - 1882</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span><strong>Faraday Medal</strong> (English Chemical Society) - 1884</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span><strong>Copley Medal</strong> (Royal Society of London) - 1905</span>
                      </li>
                    </ul>
                  </div>
                  
                  {/* Mendeleev's Mistakes and Corrections */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">⚠️ Even Geniuses Make Mistakes</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      There were two notable errors on Mendeleev's periodic table:
                    </p>
                    <ol className="space-y-2 text-sm">
                      <li>
                        <span className="font-semibold">1. Argon (Ar):</span>
                        <p className="text-gray-700 ml-4">Mendeleev didn't even know about this element. Argon has a mass of 39.95 and potassium has a mass of 39.10 (not increasing by atomic mass).</p>
                      </li>
                      <li>
                        <span className="font-semibold">2. Tellurium (Te) and Iodine (I):</span>
                        <p className="text-gray-700 ml-4">Tellurium has a mass of 127.60 and iodine has a mass of 126.90. Mendeleev was forced to place these two elements according to their chemical properties, believing the mass of tellurium must be wrong.</p>
                      </li>
                    </ol>
                    <div className="mt-3 bg-white p-3 rounded border border-red-200">
                      <p className="text-sm text-gray-700">
                        <strong>The Solution:</strong> Henry Moseley (1887-1915) discovered through X-ray diffraction that tellurium has 52 protons and iodine has 53 protons. He proposed that elements should be arranged by atomic number (number of protons), not atomic mass!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="classical-science" title="Classical Science" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To many people in our culture, scientific reasoned thinking, based on evidence rather
                    than mere belief, is seen as a natural way to think. But it may come as a shock to some
                    that the method of scientific thinking was an invention of European and Arabic cultures.
                  </p>
                  
                  {/* Descartes Section */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-2">🔬 René Descartes (1596-1650)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      One of the fathers of modern scientific thinking was René Descartes, the French mathematician 
                      and philosopher. You have worked with some of his mathematical ideas for years – he is the 
                      inventor of Cartesian coordinates which you know as x,y coordinates.
                    </p>
                    
                    <p className="text-gray-700 text-sm mb-3">
                      Descartes was disgruntled with the ideas and beliefs he was given as he grew up. 
                      Tired of being told what to think and believe by his culture, class and church, he wanted
                      to know if what he believed and lived his life by was true or false.
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <h5 className="font-semibold text-purple-700 mb-2">Descartes' Four Principles:</h5>
                      <ol className="space-y-2 text-sm">
                        <li className="flex gap-2">
                          <span className="font-bold text-purple-600 min-w-[20px]">1.</span>
                          <span className="text-gray-700">Never accept anything for true that which I do not know clearly as being true. Avoid prejudice.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-purple-600 min-w-[20px]">2.</span>
                          <span className="text-gray-700">Divide each difficulty into as many parts as possible for adequate solution.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-purple-600 min-w-[20px]">3.</span>
                          <span className="text-gray-700">Conduct thinking in order, from the simplest to most complex knowledge.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-purple-600 min-w-[20px]">4.</span>
                          <span className="text-gray-700">Make statements so complete that nothing is omitted.</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  {/* Francis Bacon Section */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-2">🧪 Sir Francis Bacon (1561-1626)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Another philosopher and father of science was Sir Francis Bacon. His idea
                      was to study nature with the goal of being able to control and utilize nature to our
                      designs and desires. His method should be even more familiar to you:
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">Bacon's Scientific Method:</h5>
                      <ol className="space-y-1 text-sm">
                        <li className="flex gap-2">
                          <span className="font-bold text-green-600 min-w-[20px]">1.</span>
                          <span className="text-gray-700">Observe the phenomenon one wishes to understand.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-green-600 min-w-[20px]">2.</span>
                          <span className="text-gray-700">Develop a hypothesis for why the phenomenon behaves as it does.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-green-600 min-w-[20px]">3.</span>
                          <span className="text-gray-700">Develop an experiment which will test the hypothesis.</span>
                        </li>
                        <li className="flex gap-2">
                          <span className="font-bold text-green-600 min-w-[20px]">4.</span>
                          <span className="text-gray-700">Through repeated experiment, refine the hypothesis into a sound theory.</span>
                        </li>
                      </ol>
                    </div>
                  </div>
                  
                  {/* 1896 Conference */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-2">🏛️ The 1896 Royal Society Conference</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      By the 1896 conference of the Royal Society of London, people were announcing that 
                      the basic understanding of the physical universe was at hand:
                    </p>
                    
                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">Newton's laws explained motion and gravity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">Maxwell unified electricity, magnetism and light</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">Mendeleev showed atomic order</span>
                        </li>
                      </ul>
                      <ul className="space-y-1">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">Mendel discovered laws of heredity</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">Darwin explained evolution</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span className="text-gray-700">Only "minor details" remained...</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* The Collapse */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-2">💥 Then the Roof Fell In...</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      In 1896, classical physics had all the answers...but by 1920, everything changed:
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-red-200">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">⚡</span>
                          <span className="text-gray-700">Newton's gravity → Einstein's space-time curvature</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">⚡</span>
                          <span className="text-gray-700">Constant length/mass/time → Relative to observer motion</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">⚡</span>
                          <span className="text-gray-700">Light as wave → Light as wave AND particle (photon)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">⚡</span>
                          <span className="text-gray-700">Indivisible atoms → Electrons orbiting tiny nuclei</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">⚡</span>
                          <span className="text-gray-700">Electron particles → Electron waves</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">⚡</span>
                          <span className="text-gray-700">Certain knowledge → Uncertainty principle</span>
                        </li>
                      </ul>
                    </div>
                    
                    <p className="text-gray-700 text-sm mt-3 italic">
                      In Lessons 26 to 37 we will discover how classical physics could not understand the real
                      nature of the atom. From a predictable and controlled view of nature, physicists would
                      reveal that the atomic world was far stranger than anyone imagined.
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

      {/* Knowledge Check Section */}
      <SlideshowKnowledgeCheck
        courseId={courseId || '2'}
        lessonPath="49-early-atomic-models"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        title="Early Atomic Models Knowledge Check"
        description="Test your understanding of the historical development of atomic theory and the periodic table."
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question1',
            title: 'Question 1: Classical Elements'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question2',
            title: 'Question 2: Philosopher\'s Stone'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question3',
            title: 'Question 3: Father of Chemistry'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question4',
            title: 'Question 4: Dalton\'s Atomic Theory'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question5',
            title: 'Question 5: Meyer\'s Discovery'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question6',
            title: 'Question 6: Mendeleev\'s Contribution'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question7',
            title: 'Question 7: Mendeleev\'s Table Error'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question8',
            title: 'Question 8: Moseley\'s Improvement'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question9',
            title: 'Question 9: Classical vs Modern Physics'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_49_question10',
            title: 'Question 10: Scientific Method'
          }
        ]}
        theme="indigo"
      />

      <LessonSummary
        points={[
          "Alchemy dominated thinking about matter for thousands of years, based on Aristotle's four elements (fire, air, water, earth)",
          "John Dalton (1766-1844) synthesized alchemical knowledge into five postulates of chemical philosophy, founding modern chemistry in 1808",
          "Dalton proposed that matter is composed of indivisible atoms, with each element having characteristic identical atoms",
          "The periodic nature of elements was discovered through the work of Newlands (1865) and Julius Meyer (1869)",
          "Dmitri Mendeleev created the first successful periodic table (1869-1871) by organizing elements by increasing atomic mass while grouping by chemical families",
          "Mendeleev's greatest achievement was predicting the properties of undiscovered elements (scandium, gallium, germanium) with remarkable accuracy",
          "Classical science, founded by Descartes and Bacon, dominated thinking from Galileo to 1900 with the belief that physical laws were absolute and predictable",
          "By 1896, scientists believed they had explained the universe through Newton's laws, Maxwell's electromagnetism, and Mendeleev's periodic table",
          "Between 1896-1920, classical physics collapsed as relativity, quantum mechanics, and atomic structure revealed the universe was far stranger than imagined"
        ]}
      />
    </LessonContent>
  );
};

export default EarlyAtomicModels;
