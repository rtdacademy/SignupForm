import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode, AIAccordion, onAIAccordionContent }) => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          ⚡ Quantization of Energy & Light
        </h1>
        <p className="text-lg text-gray-600">
          The revolutionary discovery that energy comes in discrete packets
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="introduction" title="🌟 The Quantum Revolution Begins" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    As we saw in the previous lesson, Rutherford's model of the atom had some serious 
                    difficulties. But before we can proceed with a discussion of Bohr's model of the atom, 
                    we must look at one of several major revolutionary ideas that shook the world of 
                    physics in the early part of the twentieth century, namely quantum theory.
                  </p>
                  <p className="text-gray-700 leading-relaxed">
                    The revolution of quantum theory required almost three decades to unfold, and many 
                    scientists contributed to its development. It began in 1900 with Planck's quantum 
                    hypothesis and culminated in the mid-1920s with the theory of quantum mechanics 
                    by Schrödinger and Heisenberg which has been so effective in describing the structure 
                    of matter.
                  </p>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="blackbody" title="Blackbody Radiation" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    One of the observations that was unexplained at the end of the nineteenth century was 
                    the spectrum of light emitted by hot objects. At normal temperatures (300 K), we are not 
                    aware of this electromagnetic radiation because of its low intensity and long wavelength.
                  </p>

                  {/* Temperature Effects */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-6">
                    <h4 className="font-semibold text-red-800 mb-3">🌡️ Temperature and Light Emission</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-start gap-3">
                        <span className="text-red-600 font-bold">500-600K:</span>
                        <span className="text-gray-700">Sufficient infrared radiation that we can feel heat if we are close to the object</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-orange-600 font-bold">~1000K:</span>
                        <span className="text-gray-700">Objects feel hot and glow visibly, such as a red-hot electric stove burner or heating element in a toaster</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <span className="text-yellow-600 font-bold">2000K+:</span>
                        <span className="text-gray-700">Objects glow with a yellow or whitish color, such as white-hot iron and the filament of a light bulb</span>
                      </div>
                    </div>
                  </div>

                  {/* Blackbody Concept */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">⚫ What is a Blackbody?</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      The term <strong>blackbody</strong>, introduced by the German physicist Gustav Kirchhoff in 1862, 
                      refers to an object that completely and perfectly absorbs any light energy that falls on it 
                      and then perfectly reradiates the energy as light energy.
                    </p>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Key Point:</strong> The energy it reradiates can be depicted as a blackbody curve, 
                        which depends on temperature only. A perfect blackbody appears black at room temperature 
                        because it absorbs all visible light.
                      </p>
                    </div>
                  </div>

                  {/* Radiation Curves */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">📊 Blackbody Radiation Curves</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      As the temperature increases, the electromagnetic radiation emitted by bodies is 
                      strongest at higher and higher frequencies (smaller wavelengths). The curves of light 
                      intensity vs wavelength for different temperatures are called blackbody radiation curves.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-semibold text-blue-700 mb-2">6000K (Sun's Surface):</h5>
                        <p className="text-gray-700">Peaks in the visible part of the spectrum, which explains why we can see sunlight</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-semibold text-blue-700 mb-2">Lower Temperatures:</h5>
                        <p className="text-gray-700">Total radiation drops considerably and the peak occurs at longer wavelengths (infrared)</p>
                      </div>
                    </div>
                  </div>

                  {/* The Classical Physics Problem */}
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h4 className="font-semibold text-red-800 mb-3">⚠️ The Ultraviolet Catastrophe</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      A major problem facing scientists in the 1890's was to explain blackbody radiation. 
                      Maxwell's electromagnetic theory had predicted that oscillating electric charges produce 
                      electromagnetic waves.
                    </p>
                    <div className="bg-white p-3 rounded border border-red-300">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Classical Prediction:</strong> A hot object like the filament in a light bulb should emit light 
                        as a result of the vibrating atoms/charges in the filament. Since heat manifests as faster, 
                        more violent vibration of atoms, classical physics predicted:
                      </p>
                      <ul className="space-y-1 text-sm">
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span className="text-gray-700">Hot objects should emit energy most effectively at <strong>short wavelengths</strong></span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span className="text-gray-700">Heating should produce more blue light, then ultraviolet, X-ray energy, and gamma radiation</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-red-600">•</span>
                          <span className="text-gray-700">This would result in an <strong>infinite amount</strong> of high-energy radiation being produced!</span>
                        </li>
                      </ul>
                    </div>
                    <div className="mt-3 p-2 bg-red-200 rounded text-center">
                      <p className="text-red-900 font-semibold text-sm">
                        This prediction was called the "ultraviolet catastrophe" and it was obviously false.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="planck" title="Planck's Quantum Theory" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The breakthrough came in late 1900 when Max Planck (1858–1947) proposed an 
                    empirical formula that nicely fit the data. (An empirical formula is an equation that fits 
                    experimental results, but does not explain the results.)
                  </p>

                  {/* Planck's Revolutionary Assumption */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                    <h4 className="font-semibold text-green-800 mb-3">🎯 Planck's Radical Assumption</h4>
                    <p className="text-gray-700 text-sm mb-4">
                      Planck sought a theoretical basis for the formula and within two months found that he could 
                      obtain the formula by making a new and radical assumption: <strong>energy is not distributed 
                      continuously among the molecular oscillators but instead consists of a finite number of 
                      very small discrete amounts</strong>.
                    </p>
                    
                    <div className="bg-white p-4 rounded border border-green-300">
                      <h5 className="font-semibold text-green-700 mb-2">The Quantum Hypothesis:</h5>
                      <div className="text-center mb-3">
                        <BlockMath math="E = hf" />
                      </div>
                      <p className="text-gray-700 text-sm mb-2">Where:</p>
                      <ul className="space-y-1 text-sm">
                        <li><InlineMath math="h" /> = Planck's constant = <InlineMath math="6.626 \times 10^{-34} \text{ J·s}" /></li>
                        <li><InlineMath math="f" /> = frequency of oscillation</li>
                        <li><InlineMath math="E" /> = energy of one quantum (discrete bundle)</li>
                      </ul>
                    </div>
                  </div>

                  {/* Quantization Concept */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">🔢 Energy Quantization</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Planck called each discrete bundle a <strong>quantum</strong> ("quantum" means "fixed amount"). 
                      The smallest amount of energy possible (hf) is called the quantum of energy.
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-purple-300 mb-3">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Key Insight:</strong> The energy of any molecular vibration can only be some whole 
                        number multiple of hf, and there cannot be vibrations whose energy lies between these values:
                      </p>
                      <div className="text-center">
                        <BlockMath math="E = nhf" />
                        <p className="text-sm text-gray-600">where n = 1, 2, 3, ...</p>
                      </div>
                    </div>

                    <div className="bg-yellow-100 p-3 rounded border border-yellow-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Revolutionary Idea:</strong> Energy is not a continuous quantity as had been believed for centuries. 
                        Rather, energy is <strong>quantized</strong> – it exists only in discrete amounts. This is often called 
                        <strong>Planck's quantum hypothesis</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Einstein's Contribution */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">🧠 Einstein's Bold Leap (1905)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      Planck initially considered quantization merely as a mathematical device to get the "right answer" 
                      rather than as a discovery comparable to those of Newton. For many years Planck himself resisted 
                      the assumptions he had made and continued to seek a classical explanation.
                    </p>
                    
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Einstein's Revolutionary Suggestion:</strong> While Planck thought that quantization applied 
                        only to how matter could absorb or emit energy, Einstein suggested that this idea implied that 
                        <strong>light itself was quantized</strong>.
                      </p>
                      <div className="text-center mt-3">
                        <BlockMath math="E = nhf \quad \text{or} \quad E = \frac{nhc}{\lambda}" />
                      </div>
                      <p className="text-gray-700 text-sm mt-2">
                        This formula can be used to calculate the energy of one or more quanta or <strong>photons</strong> of light. 
                        (In 1926, the chemist Gilbert Lewis introduced the term photon to describe a quantum of light.)
                      </p>
                    </div>
                  </div>

                  {/* Historical Impact */}
                  <div className="bg-gray-800 text-white p-4 rounded-lg border border-gray-600">
                    <h4 className="font-semibold mb-2 text-center">🌟 Birth of Quantum Physics</h4>
                    <p className="text-center text-sm">
                      The concept of the quantum marks the <strong className="text-yellow-300">end of classical physics</strong> and the 
                      <strong className="text-green-300"> birth of quantum physics</strong>. The recognition that this was an important 
                      and radical innovation did not come until later when others, particularly Einstein, entered the field.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1: Deriving the Wavelength Formula" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    Beginning with <InlineMath math="E = nhf" />, show that <InlineMath math="E = \frac{nhc}{\lambda}" />.
                  </p>

                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <ol className="list-decimal pl-6 space-y-3">
                      <li>
                        <strong>Given:</strong>
                        <div className="mt-2 ml-4">
                          <p>Starting equation: <InlineMath math="E = nhf" /></p>
                          <p>Universal wave equation: <InlineMath math="c = f\lambda" /></p>
                          <p>Need to show: <InlineMath math="E = \frac{nhc}{\lambda}" /></p>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Equation manipulation:</strong>
                        <div className="mt-2 ml-4">
                          <p>From the wave equation, solve for frequency:</p>
                          <div className="text-center">
                            <BlockMath math="f = \frac{c}{\lambda}" />
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Substitute into Planck's equation:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center">
                            <BlockMath math="E = nhf = nh \times \frac{c}{\lambda} = \frac{nhc}{\lambda}" />
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800">Answer:</p>
                      <p className="text-lg mt-2">
                        Therefore, <InlineMath math="E = \frac{nhc}{\lambda}" />, which shows that photon energy is inversely proportional to wavelength.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2: Infrared Photon Energy" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    What is the energy of an infra-red photon with a frequency of <InlineMath math="3.45 \times 10^{14} \text{ Hz}" />?
                  </p>

                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <ol className="list-decimal pl-6 space-y-3">
                      <li>
                        <strong>Given:</strong>
                        <div className="mt-2 ml-4">
                          <p>Frequency: <InlineMath math="f = 3.45 \times 10^{14} \text{ Hz}" /></p>
                          <p>Planck's constant: <InlineMath math="h = 6.63 \times 10^{-34} \text{ J·s}" /></p>
                          <p>Find: Energy of one photon</p>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Equation:</strong>
                        <div className="text-center mt-2">
                          <BlockMath math="E = hf" />
                        </div>
                      </li>
                      
                      <li>
                        <strong>Substitute and solve:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center">
                            <BlockMath math="E = (6.63 \times 10^{-34} \text{ J·s})(3.45 \times 10^{14} \text{ Hz})" />
                          </div>
                          <div className="text-center">
                            <BlockMath math="E = 2.29 \times 10^{-19} \text{ J}" />
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800">Answer:</p>
                      <p className="text-lg mt-2">
                        The energy of one infrared photon is <InlineMath math="2.29 \times 10^{-19} \text{ J}" />.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3: Ruby Laser Photon Count" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    The wavelength of a ruby laser is 650 nm. If the power of the laser is 1.5 W, how many 
                    photons are coming out of the laser every second?
                  </p>

                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <ol className="list-decimal pl-6 space-y-3">
                      <li>
                        <strong>Given:</strong>
                        <div className="mt-2 ml-4">
                          <p>Wavelength: <InlineMath math="\lambda = 650 \text{ nm} = 650 \times 10^{-9} \text{ m}" /></p>
                          <p>Power: <InlineMath math="P = 1.5 \text{ W}" /></p>
                          <p>Time: <InlineMath math="t = 1 \text{ s}" /></p>
                          <p>Find: Number of photons per second</p>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Step 1 - Calculate total energy emitted per second:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center">
                            <BlockMath math="E_{total} = Pt = (1.5 \text{ W})(1 \text{ s}) = 1.5 \text{ J}" />
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Step 2 - Find energy per photon:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center">
                            <BlockMath math="E_{photon} = \frac{hc}{\lambda}" />
                          </div>
                          <div className="text-center">
                            <BlockMath math="E_{photon} = \frac{(6.63 \times 10^{-34})(3.0 \times 10^8)}{650 \times 10^{-9}}" />
                          </div>
                          <div className="text-center">
                            <BlockMath math="E_{photon} = 3.06 \times 10^{-19} \text{ J}" />
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Step 3 - Calculate number of photons:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center">
                            <BlockMath math="n = \frac{E_{total}}{E_{photon}} = \frac{1.5 \text{ J}}{3.06 \times 10^{-19} \text{ J}}" />
                          </div>
                          <div className="text-center">
                            <BlockMath math="n = 4.9 \times 10^{18} \text{ photons}" />
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800">Answer:</p>
                      <p className="text-lg mt-2">
                        The ruby laser emits <InlineMath math="4.9 \times 10^{18}" /> photons every second.
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        This enormous number shows why we don't normally notice the quantized nature of light in everyday situations!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="quantization" title="Quantization" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    The classical idea about energy was that it could come in any size or amount that one 
                    desired. The idea that energy came in discrete bundles was foreign to the classical 
                    notion of the universe. However, the idea of some things being quantized was not 
                    entirely foreign to classical physics.
                  </p>

                  {/* Charge Quantization Example */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">⚡ Electric Charge Quantization</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      For example, electric charge is quantized – any charge on an object is the result of an 
                      excess or deficit of a whole number of electrons. There is no such thing as an object 
                      having ½ an electron charge. The only charges permitted are 1, 2, 3, ... n electrons of charge.
                    </p>
                    <div className="text-center">
                      <BlockMath math="q = nq_e" />
                    </div>
                  </div>

                  {/* Scale Effects */}
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                    <h4 className="font-semibold text-yellow-800 mb-3">📏 Scale Effects of Quantization</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      It is important to note that the idea of quantization of charge does not become important 
                      until we start looking at very small objects like electrons, protons, ions, atoms, and the like.
                    </p>
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <p className="text-gray-700 text-sm">
                        <strong>Large Objects:</strong> For objects with large charges involving an excess or deficit 
                        of billions and trillions of electrons, the effect and limitation of quantization 
                        (i.e. the charge of one or two electrons) is not noticeable.
                      </p>
                    </div>
                  </div>

                  {/* Energy Quantization */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                    <h4 className="font-semibold text-purple-800 mb-3">⚛️ Energy Quantization</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      The same is true for the quantization of energy. For relatively large energy values 
                      quantization is not noticeable or necessary to account for. But for small values, 
                      like those of individual photons and quanta, the law of quantization becomes very important.
                    </p>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-gray-700 text-sm">
                        When Planck found that the quantization of energy was required to explain blackbody 
                        radiation, physicists started to understand that the physics of the atomic size world 
                        (electrons, protons, nuclei, atoms, light) had to be described in a very different way 
                        from the physics of large objects and energies (everyday objects).
                      </p>
                    </div>
                  </div>

                  {/* Quantum vs Classical Physics */}
                  <div className="bg-gray-800 text-white p-4 rounded-lg border border-gray-600 mb-6">
                    <h4 className="font-semibold mb-2 text-center text-yellow-300">⚔️ Quantum vs Classical Physics</h4>
                    <p className="text-center text-sm mb-3">
                      This is the basic difference between <strong className="text-blue-300">quantum physics</strong> and 
                      <strong className="text-green-300"> classical physics</strong>.
                    </p>
                    <div className="text-center text-xs text-gray-300">
                      But old ideas die hard. The majority of physicists at the time, especially those who were older, 
                      would not accept the quantum idea.
                    </div>
                  </div>

                  {/* Planck Quote */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-3">💭 Planck's Wisdom</h4>
                    <blockquote className="text-gray-700 text-sm italic border-l-4 border-green-500 pl-4">
                      "A new scientific truth does not triumph by convincing its opponents and making them see the light, 
                      but rather because its opponents eventually die and a new generation grows up that is familiar with it."
                    </blockquote>
                    <p className="text-xs text-gray-600 mt-2 text-right">— Max Planck</p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electron-volt" title="A different unit of energy – the electron volt (eV)" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Recall from Lesson 16 that when an electron gains energy through a 1.0 Volt potential 
                    difference its energy is calculated as:
                  </p>

                  {/* Energy Calculation Review */}
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-6">
                    <h4 className="font-semibold text-orange-800 mb-3">🔋 Energy from Potential Difference</h4>
                    <div className="text-center space-y-2">
                      <BlockMath math="E = qV" />
                      <BlockMath math="E = 1.60 \times 10^{-19} \text{ C} \times 1.00 \text{ V}" />
                      <BlockMath math="E = 1.60 \times 10^{-19} \text{ C} \times \text{V}" />
                      <BlockMath math="E = 1.60 \times 10^{-19} \text{ J}" />
                    </div>
                    <p className="text-gray-700 text-sm mt-3">
                      Thus, if we are using Coulombs and Volts our unit for energy is Joules.
                    </p>
                  </div>

                  {/* Electron Volt Definition */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                    <h4 className="font-semibold text-blue-800 mb-3">⚡ The Electron Volt (eV)</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      However, in the quantum world the energies are quite small. Therefore a different unit of energy 
                      is often used called an <strong>eV</strong> or <strong>electron volt</strong>. In this unit the charge of an electron is 1 e.
                    </p>
                    <div className="bg-white p-3 rounded border border-blue-300 mb-3">
                      <p className="text-gray-700 text-sm mb-2">
                        <strong>Definition:</strong> An electron volt is the amount of energy that one electron gains 
                        when it falls through a potential difference of one Volt.
                      </p>
                      <div className="text-center space-y-1">
                        <BlockMath math="E = qV" />
                        <BlockMath math="E = 1e \times 1.00 \text{ V}" />
                        <BlockMath math="E = 1.00 \text{ eV}" />
                      </div>
                    </div>
                    <div className="text-center p-2 bg-blue-200 rounded">
                      <p className="font-semibold text-blue-900">
                        Conversion: <InlineMath math="1 \text{ eV} = 1.60 \times 10^{-19} \text{ J}" />
                      </p>
                    </div>
                  </div>

                  {/* Planck's Constant Values */}
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-3">🔢 Planck's Constant in Different Units</h4>
                    <p className="text-gray-700 text-sm mb-3">
                      It should also be noted that Planck's constant can have one of two values depending on 
                      whether we are dealing with Joules or electron volts.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <p className="text-center font-semibold text-purple-700 mb-2">For Joules:</p>
                        <div className="text-center">
                          <InlineMath math="h = 6.63 \times 10^{-34} \text{ J·s}" />
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <p className="text-center font-semibold text-purple-700 mb-2">For Electron Volts:</p>
                        <div className="text-center">
                          <InlineMath math="h = 4.14 \times 10^{-15} \text{ eV·s}" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4: Electron Energy in CRT" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    An electron is accelerated through a potential difference of 2000 V in a cathode ray 
                    tube. What is the energy of the electron in eV and in Joules?
                  </p>

                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <ol className="list-decimal pl-6 space-y-3">
                      <li>
                        <strong>Given:</strong>
                        <div className="mt-2 ml-4">
                          <p>Potential difference: <InlineMath math="V = 2000 \text{ V}" /></p>
                          <p>Electron charge: <InlineMath math="q = 1e" /></p>
                          <p>Find: Energy in eV and Joules</p>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Equation:</strong>
                        <div className="text-center mt-2">
                          <BlockMath math="E = qV" />
                        </div>
                      </li>
                      
                      <li>
                        <strong>Calculate energy in eV:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center space-y-1">
                            <BlockMath math="E = 1e \times 2000 \text{ V}" />
                            <BlockMath math="E = 2000 \text{ eV}" />
                            <BlockMath math="E = 2.0 \text{ keV}" />
                          </div>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Convert to Joules:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center space-y-1">
                            <BlockMath math="E = qV" />
                            <BlockMath math="E = 1.60 \times 10^{-19} \text{ C} \times 2000 \text{ V}" />
                            <BlockMath math="E = 3.20 \times 10^{-16} \text{ J}" />
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800">Answer:</p>
                      <p className="text-lg mt-2">
                        The electron has an energy of <InlineMath math="2.0 \text{ keV}" /> or <InlineMath math="3.20 \times 10^{-16} \text{ J}" />.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5: Wavelength from Energy" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                  <p className="mb-4">
                    A quantum of electromagnetic radiation has an energy of 5.00 eV. What is the 
                    wavelength of the radiation?
                  </p>

                  <div className="bg-white p-4 rounded border border-gray-100">
                    <p className="font-medium text-gray-700 mb-4">Solution:</p>
                    
                    <ol className="list-decimal pl-6 space-y-3">
                      <li>
                        <strong>Given:</strong>
                        <div className="mt-2 ml-4">
                          <p>Energy: <InlineMath math="E = 5.00 \text{ eV}" /></p>
                          <p>Planck's constant: <InlineMath math="h = 4.14 \times 10^{-15} \text{ eV·s}" /></p>
                          <p>Speed of light: <InlineMath math="c = 3.00 \times 10^8 \text{ m/s}" /></p>
                          <p>Find: Wavelength</p>
                        </div>
                      </li>
                      
                      <li>
                        <strong>Equation:</strong>
                        <div className="text-center mt-2 space-y-1">
                          <BlockMath math="E = \frac{hc}{\lambda}" />
                          <p className="text-sm text-gray-600">Rearranging for wavelength:</p>
                          <BlockMath math="\lambda = \frac{hc}{E}" />
                        </div>
                      </li>
                      
                      <li>
                        <strong>Substitute and solve:</strong>
                        <div className="mt-2 ml-4">
                          <div className="text-center space-y-1">
                            <BlockMath math="\lambda = \frac{(4.14 \times 10^{-15} \text{ eV·s})(3.00 \times 10^8 \text{ m/s})}{5.00 \text{ eV}}" />
                            <BlockMath math="\lambda = 249 \text{ nm}" />
                          </div>
                        </div>
                      </li>
                    </ol>

                    <div className="mt-6 pt-4 border-t border-gray-200">
                      <p className="font-semibold text-gray-800">Answer:</p>
                      <p className="text-lg mt-2">
                        The wavelength of the radiation is <InlineMath math="249 \text{ nm}" />.
                      </p>
                      <div className="mt-3 p-2 bg-blue-50 rounded">
                        <p className="text-sm text-blue-800">
                          <strong>Note:</strong> Since we are using eV as our energy unit, we use Planck's constant 
                          as <InlineMath math="4.14 \times 10^{-15} \text{ eV·s}" />.
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
        <div>
          <p className="text-gray-600 p-4 bg-gray-100 rounded">
            This lesson contains interactive content that requires the AI-enhanced accordion feature.
          </p>
        </div>
      )}

      {/* Slideshow Knowledge Check */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="53-quantization-of-light"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question1',
            title: 'Question 1: Radio Wave Energy (Joules)'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question2',
            title: 'Question 2: Radio Wave Energy (eV)'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question3',
            title: 'Question 3: Blue Light Energy'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question4',
            title: 'Question 4: 1.0 MeV Frequency'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question5',
            title: 'Question 5: 1.0 MeV Radiation Type'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question6',
            title: 'Question 6: Neon Laser Photons'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question7',
            title: 'Question 7: Light Bulb Photons'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question8',
            title: 'Question 8: Red Light & Film'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question9',
            title: 'Question 9: Star Temperatures'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question10',
            title: 'Question 10: Dark Objects'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question11',
            title: 'Question 11: Particle Definition'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question12',
            title: 'Question 12: Wave Definition'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_53_question13',
            title: 'Question 13: Electrons vs Photons'
          }
        ]}
        theme="indigo"
      />

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Hot objects emit electromagnetic radiation with intensity and wavelength dependent on temperature",
            "Classical physics predicted the 'ultraviolet catastrophe' - infinite energy emission at short wavelengths",
            "Planck solved the blackbody radiation problem by proposing that energy is quantized: E = hf",
            "Energy can only exist in discrete amounts (quanta) that are whole number multiples of hf",
            "Planck's constant h = 6.626 × 10⁻³⁴ J·s determines the size of energy quanta",
            "Einstein extended Planck's idea, proposing that light itself is quantized into particles called photons",
            "Photon energy depends on frequency: higher frequency light has more energetic photons",
            "The quantum hypothesis marked the end of classical physics and birth of quantum mechanics",
            "Quantization explains why atoms are stable and why classical predictions failed",
            "Energy quantization is fundamental to understanding atomic structure and chemical bonding"
          ].map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualContent;