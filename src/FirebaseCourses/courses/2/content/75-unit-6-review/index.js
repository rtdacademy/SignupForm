
import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Unit6Review = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_75_unit_6_review"
      title="Unit 6 Review - Nuclear Physics and Particle Physics"
      metadata={{ estimated_time: '120 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="unit-overview" title="Unit 6 Overview - From Nucleus to Quarks" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Unit 6 Review! This unit explores the heart of matter - from nuclear structure 
                    and radioactivity to the fundamental particles that make up all matter. We journey from 
                    nuclear reactions to the discovery of quarks and the Standard Model.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Unit 6 Learning Journey</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">L66: Nuclear Physics</h5>
                        <p className="text-sm text-blue-900">Nuclear structure, reactions, and binding energy</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">L67: Radioactivity</h5>
                        <p className="text-sm text-blue-900">Decay types, half-life, and nuclear stability</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">L68: Lab Half-Life</h5>
                        <p className="text-sm text-blue-900">Experimental measurement of radioactive decay</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">L70: Particle Physics</h5>
                        <p className="text-sm text-blue-900">Detection methods and particle interactions</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">L71: Quarks</h5>
                        <p className="text-sm text-blue-900">Fundamental particles and the Standard Model</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="nuclear-structure" title="Nuclear Structure and Reactions" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Nuclear Composition and Notation</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Isotope Notation</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"{^A_Z}X"}</BlockMath>
                        </div>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li><strong>A:</strong> Mass number (protons + neutrons)</li>
                          <li><strong>Z:</strong> Atomic number (protons)</li>
                          <li><strong>X:</strong> Element symbol</li>
                          <li><strong>N = A - Z:</strong> Number of neutrons</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Nuclear Reactions</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Conservation of mass number: ΣA(reactants) = ΣA(products)</li>
                          <li>• Conservation of atomic number: ΣZ(reactants) = ΣZ(products)</li>
                          <li>• Transmutation: changing one element into another</li>
                          <li>• Alpha bombardment: common method for artificial transmutation</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Mass-Energy Equivalence</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E = mc^2"}</BlockMath>
                        </div>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Mass defect: difference between calculated and actual atomic mass</li>
                          <li>• Binding energy: energy holding nucleus together</li>
                          <li>• 1 u = 931.5 MeV (atomic mass unit conversion)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="radioactive-decay" title="Radioactive Decay and Half-Life" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <h4 className="font-semibold text-orange-800 mb-3">Types of Radioactive Decay</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-medium text-orange-800 mb-2">Alpha Decay (α)</h5>
                        <div className="text-center mb-2">
                          <InlineMath>{"{^A_Z}X \\rightarrow {^{A-4}_{Z-2}}Y + {^4_2}He"}</InlineMath>
                        </div>
                        <ul className="text-orange-900 text-sm space-y-1">
                          <li>• Emission of helium-4 nucleus (2 protons, 2 neutrons)</li>
                          <li>• Mass number decreases by 4</li>
                          <li>• Atomic number decreases by 2</li>
                          <li>• Occurs in heavy nuclei (usually Z > 82)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-medium text-orange-800 mb-2">Beta-Minus Decay (β⁻)</h5>
                        <div className="text-center mb-2">
                          <InlineMath>{"{^A_Z}X \\rightarrow {^A_{Z+1}}Y + e^- + \\bar{\\nu}_e"}</InlineMath>
                        </div>
                        <ul className="text-orange-900 text-sm space-y-1">
                          <li>• Neutron transforms to proton + electron + antineutrino</li>
                          <li>• Mass number stays constant</li>
                          <li>• Atomic number increases by 1</li>
                          <li>• Occurs when neutron-to-proton ratio is too high</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-orange-300">
                        <h5 className="font-medium text-orange-800 mb-2">Half-Life Calculations</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"N(t) = N_0 \\left(\\frac{1}{2}\\right)^{t/t_{1/2}}"}</BlockMath>
                        </div>
                        <ul className="text-orange-900 text-sm space-y-1">
                          <li>• N(t): amount remaining after time t</li>
                          <li>• N₀: initial amount</li>
                          <li>• t₁/₂: half-life (time for half to decay)</li>
                          <li>• Number of half-lives = t/t₁/₂</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="nuclear-fission" title="Nuclear Fission and Mass Spectrometry" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Nuclear Fission Process</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Fission Reaction</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Heavy nucleus splits into two smaller nuclei</li>
                          <li>• Usually initiated by neutron absorption</li>
                          <li>• Produces multiple neutrons and energy</li>
                          <li>• Chain reaction possible if enough fissile material</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Mass Spectrometry Principles</h5>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Velocity selector: qE = qvB (undeflected motion)</li>
                          <li>• Magnetic deflection: r = mv/qB</li>
                          <li>• Ion mass determination from radius and field strength</li>
                          <li>• Separation of isotopes by mass-to-charge ratio</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Key Equations</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"V = vBd"}</InlineMath> (velocity selector voltage)</div>
                          <div><InlineMath>{"m = \\frac{qBr}{v}"}</InlineMath> (ion mass from radius)</div>
                          <div><InlineMath>{"v = \\frac{E}{B}"}</InlineMath> (velocity from fields)</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="particle-detection" title="Particle Detection and Interactions" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">Detection Methods</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Bubble Chambers</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Superheated liquid forms bubbles along particle tracks</li>
                          <li>• Only charged particles create visible tracks</li>
                          <li>• Neutrons invisible (neutral, no ionization)</li>
                          <li>• Track thickness indicates ionization rate</li>
                          <li>• Magnetic field curves tracks for momentum analysis</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Track Characteristics</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• <strong>Electrons:</strong> Thin tracks, tight curves (low mass)</li>
                          <li>• <strong>Muons:</strong> Thicker tracks, looser curves (200× electron mass)</li>
                          <li>• <strong>Protons:</strong> Thick tracks, gentle curves (1836× electron mass)</li>
                          <li>• <strong>Alpha particles:</strong> Very thick, straight tracks (high mass, double charge)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Particle Interactions</h5>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Conservation laws: energy, momentum, charge, lepton number</li>
                          <li>• Annihilation: matter + antimatter → energy (photons)</li>
                          <li>• Pair production: high-energy photon → particle + antiparticle</li>
                          <li>• Threshold energies determine possible reactions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="pair-production" title="Pair Production and Annihilation" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-3">Matter-Antimatter Interactions</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Pair Production</h5>
                        <div className="text-center mb-2">
                          <InlineMath>{"\\gamma \\rightarrow e^+ + e^-"}</InlineMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Minimum energy: E ≥ 2mₑc² = 1.022 MeV</li>
                          <li>• Creates electron-positron pair from photon</li>
                          <li>• Requires nucleus nearby for momentum conservation</li>
                          <li>• Excess energy becomes kinetic energy of particles</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Annihilation</h5>
                        <div className="text-center mb-2">
                          <InlineMath>{"e^+ + e^- \\rightarrow 2\\gamma"}</InlineMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Produces two 0.511 MeV photons (in rest frame)</li>
                          <li>• Photons travel in opposite directions</li>
                          <li>• Wavelength: λ = hc/E = 2.43×10⁻¹² m</li>
                          <li>• Complete conversion of matter to energy</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Threshold Energies</h5>
                        <div className="space-y-1 text-sm">
                          <div><strong>Electron-positron:</strong> 1.022 MeV</div>
                          <div><strong>Proton-antiproton:</strong> 1.876 GeV</div>
                          <div><strong>Neutron-antineutron:</strong> 1.88 GeV</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="quarks-particles" title="Quarks and Fundamental Particles" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">The Standard Model</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Quark Compositions</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• <strong>Proton:</strong> uud (up-up-down)</li>
                          <li>• <strong>Neutron:</strong> udd (up-down-down)</li>
                          <li>• <strong>Neutral pion (π⁰):</strong> u + ū (up + anti-up)</li>
                          <li>• Quarks have fractional charges: u = +2/3, d = -1/3</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Fundamental Forces</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• <strong>Strong force:</strong> Confines quarks (gluon exchange)</li>
                          <li>• <strong>Electromagnetic:</strong> Acts on charged particles</li>
                          <li>• <strong>Weak force:</strong> Responsible for beta decay</li>
                          <li>• <strong>Gravity:</strong> Weakest, dominates at large scales</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Quark Properties</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Six types (flavors): up, down, charm, strange, top, bottom</li>
                          <li>• Confined by strong force (cannot exist alone)</li>
                          <li>• Top quark: heaviest (173 GeV), hardest to discover</li>
                          <li>• Beta decay: d → u + e⁻ + ν̄ₑ (quark transformation)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="key-formulas" title="Unit 6 Formula Summary" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4">Essential Formulas for Unit 6</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Nuclear Equations</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"E = mc^2"}</InlineMath> (mass-energy equivalence)</div>
                          <div><InlineMath>{"1 \\text{ u} = 931.5 \\text{ MeV}"}</InlineMath></div>
                          <div>Conservation: <InlineMath>{"\\sum A_{in} = \\sum A_{out}"}</InlineMath></div>
                          <div>Conservation: <InlineMath>{"\\sum Z_{in} = \\sum Z_{out}"}</InlineMath></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Radioactive Decay</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"N(t) = N_0(\\frac{1}{2})^{t/t_{1/2}}"}</InlineMath></div>
                          <div><InlineMath>{"t_{1/2} = \\frac{\\ln(2)}{\\lambda}"}</InlineMath></div>
                          <div>Half-lives: <InlineMath>{"n = \\frac{t}{t_{1/2}}"}</InlineMath></div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Mass Spectrometry</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"qE = qvB"}</InlineMath> (velocity selector)</div>
                          <div><InlineMath>{"r = \\frac{mv}{qB}"}</InlineMath> (circular motion)</div>
                          <div><InlineMath>{"V = vBd"}</InlineMath> (plate voltage)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Pair Production</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"E_{min} = 2mc^2"}</InlineMath> (threshold)</div>
                          <div><InlineMath>{"\\lambda = \\frac{hc}{E}"}</InlineMath> (photon wavelength)</div>
                          <div>e⁺e⁻: 1.022 MeV minimum</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h5 className="font-medium text-yellow-800 mb-2">Important Constants</h5>
                      <div className="text-sm text-yellow-900 space-y-1">
                        <div><InlineMath>{"m_e = 9.11 \\times 10^{-31}"}</InlineMath> kg = 0.511 MeV/c²</div>
                        <div><InlineMath>{"m_p = 1.67 \\times 10^{-27}"}</InlineMath> kg = 938 MeV/c²</div>
                        <div><InlineMath>{"m_n = 1.68 \\times 10^{-27}"}</InlineMath> kg = 940 MeV/c²</div>
                        <div><InlineMath>{"c = 3.00 \\times 10^8"}</InlineMath> m/s</div>
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
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Unit 6 Practice Questions</h3>
          <p className="text-blue-700 mb-4">
            Test your understanding of nuclear physics and particle physics with these comprehensive 
            practice questions covering all major concepts from lessons 66-71.
          </p>
          
          {/* SlideshowKnowledgeCheck Component */}
          <SlideshowKnowledgeCheck
        course={course}
            lessonPath="75-unit-6-review"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q1',
                title: 'Question 1: Nuclear Transmutation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q2',
                title: 'Question 2: Nuclear Equation Balancing'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q3',
                title: 'Question 3: Velocity Selector Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q4',
                title: 'Question 4: Mass Spectrometer Ion Mass'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q5',
                title: 'Question 5: Nuclear Mass Defect'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q6',
                title: 'Question 6: Isotope Notation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q7',
                title: 'Question 7: Radioactive Decay Identification'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q8',
                title: 'Question 8: Half-Life Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q9',
                title: 'Question 9: Decay Time Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q10',
                title: 'Question 10: Nuclear Fission Balance'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q11',
                title: 'Question 11: Neutron Detection'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q12',
                title: 'Question 12: Particle Track Analysis'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q13',
                title: 'Question 13: Pair Production Threshold'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q14',
                title: 'Question 14: Proton-Antiproton Production'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q15',
                title: 'Question 15: Annihilation Photon Wavelength'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q16',
                title: 'Question 16: Neutron Quark Composition'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q17',
                title: 'Question 17: Neutral Pion Structure'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q18',
                title: 'Question 18: Strong Force Role'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q19',
                title: 'Question 19: Top Quark Discovery'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_75_unit6_q20',
                title: 'Question 20: Beta Decay Quark Transformation'
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
          <h3 className="text-xl font-semibold text-green-800 mb-4">Study Tips for Unit 6</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Conceptual Understanding</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Master conservation laws in nuclear reactions (mass number, atomic number)</li>
                <li>• Understand the connection between mass defect and binding energy</li>
                <li>• Distinguish between different types of radioactive decay</li>
                <li>• Connect particle properties to detection methods and track characteristics</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Problem-Solving Strategies</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Always check conservation laws in nuclear reactions</li>
                <li>• Use proper isotope notation with mass number and atomic number</li>
                <li>• Remember half-life formula: N = N₀(1/2)^(t/t₁/₂)</li>
                <li>• For mass spectrometry: velocity selector (qE = qvB), circular motion (r = mv/qB)</li>
                <li>• Pair production threshold: minimum 2mc² energy required</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Common Mistakes to Avoid</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Confusing mass number (A) with atomic number (Z) in nuclear notation</li>
                <li>• Forgetting that beta decay changes atomic number but not mass number</li>
                <li>• Mixing up particle charges when calculating quark compositions</li>
                <li>• Not considering both conservation laws simultaneously in reactions</li>
                <li>• Forgetting unit conversions (u to MeV, GeV to kg, etc.)</li>
              </ul>
            </div>
          </div>
        </div>
      </TextSection>

      {/* Unit Summary */}
      <LessonSummary>
        <div className="space-y-4">
          <p>
            Unit 6 explores the fundamental nature of matter from the nuclear scale to the most basic 
            constituents of the universe. This unit bridges nuclear physics and particle physics, 
            showing how our understanding evolved from nuclear structure to the discovery of quarks 
            and the Standard Model.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Key Takeaways</h4>
            <ul className="text-blue-900 text-sm space-y-1">
              <li>• Nuclear reactions follow strict conservation laws for mass number and atomic number</li>
              <li>• Radioactive decay types have distinct signatures and follow exponential decay laws</li>
              <li>• Mass spectrometry uses electromagnetic fields to separate and identify particles</li>
              <li>• Particle detection relies on ionization and track analysis in bubble chambers</li>
              <li>• Pair production and annihilation demonstrate mass-energy equivalence</li>
              <li>• Quarks are fundamental particles confined by the strong nuclear force</li>
              <li>• The Standard Model describes all known fundamental particles and forces</li>
            </ul>
          </div>
          
          <p>
            These nuclear and particle physics principles underpin our understanding of stellar processes, 
            nuclear power, medical imaging, carbon dating, and the fundamental structure of matter itself. 
            They represent humanity's deepest insights into the nature of the physical universe.
          </p>
        </div>
      </LessonSummary>
    </LessonContent>
  );
};

export default Unit6Review;
