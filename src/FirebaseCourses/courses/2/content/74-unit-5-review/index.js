import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Unit5Review = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_74_unit_5_review"
      title="Unit 5 Review - Quantum Physics and Atomic Models"
      metadata={{ estimated_time: '120 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="unit-overview" title="Unit 5 Overview - The Quantum Revolution" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Unit 5 Review! This unit chronicles the revolutionary transition from classical 
                    to quantum physics, covering the discoveries and theories that fundamentally changed our 
                    understanding of matter, energy, and the atomic world.
                  </p>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Unit 5 Learning Journey</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800">L49-51: Atomic Discovery</h5>
                        <p className="text-sm text-purple-900">Thomson, Rutherford, and the nuclear atom</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800">L53-55: Quantum Birth</h5>
                        <p className="text-sm text-purple-900">Planck's quantization and photoelectric effect</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800">L56-58: Experimental Evidence</h5>
                        <p className="text-sm text-purple-900">Millikan, spectra, and wave measurements</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800">L60-62: Quantum Models</h5>
                        <p className="text-sm text-purple-900">Bohr model, Compton effect, wave-particle duality</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800">L64: Modern Quantum Theory</h5>
                        <p className="text-sm text-purple-900">Schrödinger, uncertainty, and quantum mechanics</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="atomic-discovery" title="Early Atomic Models - Building the Foundation" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Key Discoveries and Models</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">J.J. Thomson (1897)</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li><strong>Discovery:</strong> The electron through cathode ray experiments</li>
                          <li><strong>Measurement:</strong> Charge-to-mass ratio (e/m)</li>
                          <li><strong>Model:</strong> "Plum pudding" - electrons embedded in positive sphere</li>
                          <li><strong>Impact:</strong> Proved atoms are divisible</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Ernest Rutherford (1911)</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li><strong>Experiment:</strong> Gold foil with alpha particles</li>
                          <li><strong>Observation:</strong> Most particles passed through, few deflected</li>
                          <li><strong>Conclusion:</strong> Atoms are mostly empty space with dense nucleus</li>
                          <li><strong>Model:</strong> Nuclear atom with electrons orbiting nucleus</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Problem with Rutherford's Model</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Accelerating electrons should radiate energy continuously</li>
                          <li>• Atoms should collapse in ~10⁻¹⁰ seconds</li>
                          <li>• Could not explain atomic stability or discrete spectra</li>
                          <li>• Led to the need for quantum theory</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="quantum-birth" title="The Birth of Quantum Theory" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Planck's Revolutionary Hypothesis</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Blackbody Radiation Problem</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Classical physics predicted infinite energy (ultraviolet catastrophe)</li>
                          <li>• Experimental observations didn't match theoretical predictions</li>
                          <li>• Peak wavelength followed Wien's displacement law</li>
                          <li>• Total energy followed Stefan-Boltzmann law</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Planck's Solution (1900)</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E = nhf \\quad \\text{where } n = 1, 2, 3, ..."}</BlockMath>
                        </div>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Energy is quantized in discrete packets (quanta)</li>
                          <li>• <InlineMath>{"h = 6.63 \\times 10^{-34}"}</InlineMath> J·s (Planck's constant)</li>
                          <li>• Each quantum has energy <InlineMath>{"E = hf"}</InlineMath></li>
                          <li>• Resolved the ultraviolet catastrophe</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Einstein's Photon Concept (1905)</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Extended Planck's idea to light itself</li>
                          <li>• Light consists of discrete particles (photons)</li>
                          <li>• Each photon carries energy <InlineMath>{"E = hf"}</InlineMath></li>
                          <li>• Explained the photoelectric effect</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="photoelectric-effect" title="Photoelectric Effect - Light as Particles" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Einstein's Photoelectric Equation</h4>
                    
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <BlockMath>{"KE_{max} = hf - \\phi"}</BlockMath>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Key Variables</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li><InlineMath>{"KE_{max}"}</InlineMath> = Maximum kinetic energy of photoelectrons</li>
                          <li><InlineMath>{"h"}</InlineMath> = Planck's constant (6.63×10⁻³⁴ J·s or 4.14×10⁻¹⁵ eV·s)</li>
                          <li><InlineMath>{"f"}</InlineMath> = Frequency of incident light</li>
                          <li><InlineMath>{"\\phi"}</InlineMath> = Work function (minimum energy to remove electron)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Key Observations</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Threshold frequency: <InlineMath>{"f_0 = \\phi/h"}</InlineMath></li>
                          <li>• No electrons emitted below threshold (regardless of intensity)</li>
                          <li>• Above threshold: electron energy depends on frequency, not intensity</li>
                          <li>• Number of electrons depends on intensity (number of photons)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Stopping Potential</h5>
                        <div className="text-center mb-2">
                          <InlineMath>{"eV_{stop} = KE_{max}"}</InlineMath>
                        </div>
                        <p className="text-green-900 text-sm">
                          The stopping potential (in volts) equals the maximum kinetic energy (in eV)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="bohr-model" title="Bohr Model - Quantized Electron Orbits" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-3">Bohr's Postulates</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Quantized Angular Momentum</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"L = n\\hbar \\quad \\text{where } \\hbar = \\frac{h}{2\\pi}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Electrons exist in specific allowed orbits</li>
                          <li>• Angular momentum is quantized in units of ℏ</li>
                          <li>• n = 1, 2, 3, ... (principal quantum number)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Energy Levels in Hydrogen</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E_n = -\\frac{13.6 \\text{ eV}}{n^2}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Ground state: n=1, E₁ = -13.6 eV</li>
                          <li>• Energy increases (becomes less negative) for higher n</li>
                          <li>• Ionization energy = 13.6 eV (remove electron from n=1)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Spectral Lines</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E_{photon} = E_i - E_f = hf = \\frac{hc}{\\lambda}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Emission: electron drops from higher to lower energy level</li>
                          <li>• Absorption: electron jumps from lower to higher energy level</li>
                          <li>• Each transition produces a specific wavelength</li>
                          <li>• Explains discrete line spectra of hydrogen</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="wave-particle-duality" title="Wave-Particle Duality - Matter Waves" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">de Broglie's Hypothesis</h4>
                    
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-red-300 inline-block">
                        <BlockMath>{"\\lambda = \\frac{h}{p} = \\frac{h}{mv}"}</BlockMath>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Matter Waves</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• All matter exhibits wave properties</li>
                          <li>• Wavelength inversely proportional to momentum</li>
                          <li>• More noticeable for small, fast-moving particles</li>
                          <li>• Confirmed by electron diffraction experiments</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Compton Effect</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• X-ray photons scatter from electrons</li>
                          <li>• Scattered photons have longer wavelengths</li>
                          <li>• Proves photons have momentum: <InlineMath>{"p = E/c = h/\\lambda"}</InlineMath></li>
                          <li>• Obeys conservation of energy and momentum</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Complementarity Principle</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Wave and particle behaviors are complementary</li>
                          <li>• Cannot observe both simultaneously</li>
                          <li>• Depends on experimental setup</li>
                          <li>• Fundamental to quantum mechanics</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="quantum-mechanics" title="Modern Quantum Mechanics" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Quantum Mechanical Principles</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Heisenberg Uncertainty Principle</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}"}</BlockMath>
                        </div>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Cannot measure position and momentum simultaneously with perfect precision</li>
                          <li>• Fundamental limitation, not due to measurement errors</li>
                          <li>• More precise position measurement → less precise momentum</li>
                          <li>• Also applies to energy and time: <InlineMath>{"\\Delta E \\cdot \\Delta t \\geq \\hbar/2"}</InlineMath></li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Schrödinger's Wave Function</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Wave function ψ describes quantum state</li>
                          <li>• |ψ|² gives probability density</li>
                          <li>• Orbitals are three-dimensional probability distributions</li>
                          <li>• Replaces definite trajectories with probabilities</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Quantum Numbers</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• <strong>n:</strong> Principal (energy level, size)</li>
                          <li>• <strong>l:</strong> Angular momentum (shape: s, p, d, f)</li>
                          <li>• <strong>mₗ:</strong> Magnetic (orientation in space)</li>
                          <li>• <strong>mₛ:</strong> Spin (intrinsic angular momentum)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Pauli Exclusion Principle</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• No two electrons can have identical quantum numbers</li>
                          <li>• Maximum two electrons per orbital (opposite spins)</li>
                          <li>• Explains electron configuration and chemical properties</li>
                          <li>• Foundation of atomic structure and periodic table</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="key-formulas" title="Unit 5 Formula Summary" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4">Essential Formulas for Unit 5</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Photon Energy</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"E = hf = \\frac{hc}{\\lambda}"}</InlineMath></div>
                          <div><InlineMath>{"p = \\frac{E}{c} = \\frac{h}{\\lambda}"}</InlineMath> (photon momentum)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Photoelectric Effect</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"KE_{max} = hf - \\phi"}</InlineMath></div>
                          <div><InlineMath>{"f_0 = \\phi/h"}</InlineMath> (threshold frequency)</div>
                          <div><InlineMath>{"eV_{stop} = KE_{max}"}</InlineMath></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Bohr Model</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"E_n = -\\frac{13.6 \\text{ eV}}{n^2}"}</InlineMath></div>
                          <div><InlineMath>{"\\Delta E = E_i - E_f"}</InlineMath></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Matter Waves</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"\\lambda = \\frac{h}{p} = \\frac{h}{mv}"}</InlineMath></div>
                          <div><InlineMath>{"\\Delta x \\cdot \\Delta p \\geq \\frac{\\hbar}{2}"}</InlineMath></div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h5 className="font-medium text-yellow-800 mb-2">Important Constants</h5>
                      <div className="text-sm text-yellow-900 space-y-1">
                        <div><InlineMath>{"h = 6.63 \\times 10^{-34}"}</InlineMath> J·s = <InlineMath>{"4.14 \\times 10^{-15}"}</InlineMath> eV·s</div>
                        <div><InlineMath>{"c = 3.00 \\times 10^8"}</InlineMath> m/s</div>
                        <div><InlineMath>{"e = 1.60 \\times 10^{-19}"}</InlineMath> C</div>
                        <div><InlineMath>{"m_e = 9.11 \\times 10^{-31}"}</InlineMath> kg</div>
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
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-purple-800 mb-4">Unit 5 Practice Questions</h3>
          <p className="text-purple-700 mb-4">
            Test your understanding of quantum physics and atomic models with these comprehensive 
            practice questions covering all major concepts from lessons 49-64.
          </p>
          
          {/* SlideshowKnowledgeCheck Component */}
          <SlideshowKnowledgeCheck
            lessonPath="74-unit-5-review"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q1',
                title: 'Question 1: Photon Energy from Wavelength'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q2',
                title: 'Question 2: Photoelectric Effect Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q3',
                title: 'Question 3: de Broglie Wavelength of Baseball'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q4',
                title: 'Question 4: Photon Momentum'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q5',
                title: 'Question 5: Photoelectric Kinetic Energy'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q6',
                title: 'Question 6: Electron Wave Frequency'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q7',
                title: 'Question 7: Proton Wavelength'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q8',
                title: 'Question 8: Photon Energy from Frequency'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q9',
                title: 'Question 9: Stopping Potential'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q10',
                title: 'Question 10: Photon Energy Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q11',
                title: 'Question 11: Accelerated Electron Wavelength'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q12',
                title: 'Question 12: Laser Power Output'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q13',
                title: 'Question 13: Particle Nature of Light'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q14',
                title: 'Question 14: Rutherford\'s Gold Foil Experiment'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q15',
                title: 'Question 15: Spin Quantum Number'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q16',
                title: 'Question 16: Bohr Model Limitations'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q17',
                title: 'Question 17: Compton Scattering'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q18',
                title: 'Question 18: Orbital Shape Quantum Number'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q19',
                title: 'Question 19: Heisenberg Uncertainty Principle'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_74_unit5_q20',
                title: 'Question 20: Schrödinger\'s Orbital Model'
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
          <h3 className="text-xl font-semibold text-green-800 mb-4">Study Tips for Unit 5</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Conceptual Understanding</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Understand the historical progression from classical to quantum physics</li>
                <li>• Connect experimental observations to theoretical developments</li>
                <li>• Distinguish between wave and particle properties of matter and light</li>
                <li>• Recognize when to apply classical vs. quantum mechanical approaches</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Problem-Solving Strategies</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Identify whether the problem involves photons, electrons, or other particles</li>
                <li>• Choose appropriate constants (h in J·s or eV·s depending on units)</li>
                <li>• Use energy conservation in photoelectric effect problems</li>
                <li>• Remember de Broglie wavelength applies to all matter, not just electrons</li>
                <li>• Check units carefully - energy in eV vs. J, wavelength in nm vs. m</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Common Mistakes to Avoid</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Confusing photon energy formulas (E = hf vs. E = hc/λ)</li>
                <li>• Forgetting to subtract work function in photoelectric calculations</li>
                <li>• Using wrong mass for de Broglie wavelength (electron vs. proton vs. other)</li>
                <li>• Mixing up quantum numbers and their meanings</li>
                <li>• Applying classical physics where quantum effects dominate</li>
              </ul>
            </div>
          </div>
        </div>
      </TextSection>

      {/* Unit Summary */}
      <LessonSummary>
        <div className="space-y-4">
          <p>
            Unit 5 traces the revolutionary development of quantum physics, from the early discoveries 
            of atomic structure through the modern quantum mechanical model. This unit bridges classical 
            and quantum physics, showing how experimental observations led to fundamental changes in our 
            understanding of nature.
          </p>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-semibold text-purple-800 mb-2">Key Takeaways</h4>
            <ul className="text-purple-900 text-sm space-y-1">
              <li>• Energy and angular momentum are quantized at atomic scales</li>
              <li>• Light exhibits both wave and particle properties (wave-particle duality)</li>
              <li>• All matter has wave properties (de Broglie wavelength)</li>
              <li>• Quantum mechanics replaces deterministic paths with probability distributions</li>
              <li>• Uncertainty is fundamental to nature, not just measurement limitations</li>
              <li>• Atomic structure explains chemical properties and spectral observations</li>
            </ul>
          </div>
          
          <p>
            These quantum mechanical principles form the foundation for understanding atomic structure, 
            chemical bonding, solid-state physics, and modern technology including lasers, semiconductors, 
            and quantum devices.
          </p>
        </div>
      </LessonSummary>
    </LessonContent>
  );
};

export default Unit5Review;
