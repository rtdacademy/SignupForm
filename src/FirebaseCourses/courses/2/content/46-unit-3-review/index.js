import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Unit3Review = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {

  return (
    <LessonContent
      lessonId="lesson_46_unit_3_review"
      title="Unit 3 Review - Electricity and Electric Fields"
      metadata={{ estimated_time: '120 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="unit-overview" title="Unit 3 Overview - The Journey Through Electricity" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Unit 3 Review! This unit takes you through the fundamental concepts of electricity 
                    and electric fields, covering six essential lessons that build upon each other to create a 
                    comprehensive understanding of electrostatic phenomena and electric current.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Unit 3 Learning Path</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">Lesson 13 - Electrostatics</h5>
                        <p className="text-sm text-blue-900">Static charges, charging methods, and basic electric forces</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">Lesson 14 - Coulomb's Law</h5>
                        <p className="text-sm text-blue-900">Quantitative analysis of electric forces between charges</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">Lesson 15 - Electric Fields</h5>
                        <p className="text-sm text-blue-900">Field concepts, field lines, and force relationships</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">Lesson 16 - Electric Potential</h5>
                        <p className="text-sm text-blue-900">Energy concepts, voltage, and electric potential difference</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">Lesson 17 - Parallel Plates</h5>
                        <p className="text-sm text-blue-900">Uniform fields, capacitors, and practical applications</p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800">Lesson 18 - Electric Current</h5>
                        <p className="text-sm text-blue-900">Current flow, resistance, and basic circuit concepts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electrostatics-foundation" title="Electrostatics - The Foundation of Electric Phenomena" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-3">Key Concepts - Electrostatics</h4>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Three Methods of Charging</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li><strong>Friction:</strong> Transfer of electrons through rubbing (glass rod + silk)</li>
                          <li><strong>Conduction:</strong> Direct contact with charged object</li>
                          <li><strong>Induction:</strong> Charge separation without direct contact</li>
                        </ul>
                      </div>
                      
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Fundamental Principles</h5>
                        <ul className="text-yellow-900 text-sm space-y-1">
                          <li>• Like charges repel, unlike charges attract</li>
                          <li>• Charge is conserved in all interactions</li>
                          <li>• Charge exists in discrete units (quantized)</li>
                          <li>• Elementary charge: <InlineMath>{"e = 1.602 \\times 10^{-19}"}</InlineMath> C</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-2">Conductors vs Insulators</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <p className="font-medium text-yellow-800">Conductors</p>
                            <p className="text-sm text-yellow-900">Free electrons, charge moves easily</p>
                            <p className="text-xs text-yellow-700">Examples: metals, salt water</p>
                          </div>
                          <div>
                            <p className="font-medium text-yellow-800">Insulators</p>
                            <p className="text-sm text-yellow-900">Electrons bound tightly, resist charge flow</p>
                            <p className="text-xs text-yellow-700">Examples: glass, rubber, plastic</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="coulombs-law" title="Coulomb's Law - Quantifying Electric Forces" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Coulomb's Law Formula</h4>
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-blue-300 inline-block">
                        <BlockMath>{"F = k \\frac{q_1 q_2}{r^2}"}</BlockMath>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Variables and Constants</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li><InlineMath>{"F"}</InlineMath> = electric force (N)</li>
                          <li><InlineMath>{"k = 8.99 \\times 10^9"}</InlineMath> N⋅m²/C² (Coulomb's constant)</li>
                          <li><InlineMath>{"q_1, q_2"}</InlineMath> = charges (C)</li>
                          <li><InlineMath>{"r"}</InlineMath> = distance between charges (m)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Key Relationships</h5>
                        <ul className="text-blue-900 text-sm space-y-1">
                          <li>• Force is proportional to the product of charges</li>
                          <li>• Force is inversely proportional to distance squared</li>
                          <li>• Force acts along the line connecting the charges</li>
                          <li>• Positive force = repulsion, negative force = attraction</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Problem-Solving Strategy</h5>
                        <ol className="text-blue-900 text-sm space-y-1">
                          <li>1. Identify the charges and their positions</li>
                          <li>2. Determine the distance between charges</li>
                          <li>3. Apply Coulomb's law</li>
                          <li>4. Consider direction (vector nature of force)</li>
                          <li>5. Use superposition for multiple charges</li>
                        </ol>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-fields" title="Electric Fields - Understanding the Force Field Concept" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Electric Field Fundamentals</h4>
                    
                    <div className="text-center mb-4">
                      <div className="bg-white p-4 rounded border border-green-300 inline-block">
                        <div className="space-y-2">
                          <div><BlockMath>{"\\vec{E} = \\frac{\\vec{F}}{q}"}</BlockMath></div>
                          <div className="text-sm">Electric field = Force per unit charge</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Electric Field of Point Charge</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E = k \\frac{q}{r^2}"}</BlockMath>
                        </div>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Direction: away from positive charge, toward negative charge</li>
                          <li>• Units: N/C or V/m</li>
                          <li>• Field exists everywhere in space around the charge</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Electric Field Lines</h5>
                        <ul className="text-green-900 text-sm space-y-1">
                          <li>• Show direction of electric field</li>
                          <li>• Density indicates field strength</li>
                          <li>• Start on positive charges, end on negative charges</li>
                          <li>• Never cross each other</li>
                          <li>• Always perpendicular to conductor surfaces</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-green-300">
                        <h5 className="font-medium text-green-800 mb-2">Superposition Principle</h5>
                        <p className="text-green-900 text-sm mb-2">
                          For multiple charges, the net electric field is the vector sum of individual fields:
                        </p>
                        <div className="text-center">
                          <BlockMath>{"\\vec{E}_{net} = \\vec{E}_1 + \\vec{E}_2 + \\vec{E}_3 + ..."}</BlockMath>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-potential" title="Electric Potential - Energy and Voltage Concepts" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Electric Potential Energy and Potential</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Electric Potential Energy</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"U = k \\frac{q_1 q_2}{r}"}</BlockMath>
                        </div>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Energy stored in system of charges</li>
                          <li>• Positive for like charges, negative for unlike charges</li>
                          <li>• Zero at infinite separation</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Electric Potential (Voltage)</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"V = \\frac{U}{q} = k \\frac{q}{r}"}</BlockMath>
                        </div>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Potential energy per unit charge</li>
                          <li>• Units: volts (V) = J/C</li>
                          <li>• Scalar quantity (not vector)</li>
                          <li>• Independent of test charge</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Potential Difference</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"\\Delta V = V_B - V_A = -\\int_A^B \\vec{E} \\cdot d\\vec{l}"}</BlockMath>
                        </div>
                        <ul className="text-purple-900 text-sm space-y-1">
                          <li>• Work done per unit charge moving between points</li>
                          <li>• Voltage = potential difference</li>
                          <li>• Current flows from high to low potential</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-purple-800 mb-2">Relationship Between E and V</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E = -\\frac{dV}{dr}"}</BlockMath>
                        </div>
                        <p className="text-purple-900 text-sm">
                          Electric field points in direction of decreasing potential
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="parallel-plates" title="Parallel Plate Capacitors - Uniform Electric Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                    <h4 className="font-semibold text-indigo-800 mb-3">Parallel Plate Capacitor Physics</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Uniform Electric Field</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"E = \\frac{\\sigma}{\\epsilon_0} = \\frac{V}{d}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Field is uniform between plates</li>
                          <li>• <InlineMath>{"\\sigma"}</InlineMath> = surface charge density (C/m²)</li>
                          <li>• <InlineMath>{"\\epsilon_0 = 8.85 \\times 10^{-12}"}</InlineMath> C²/(N⋅m²)</li>
                          <li>• Field points from positive to negative plate</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Capacitance</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"C = \\frac{Q}{V} = \\epsilon_0 \\frac{A}{d}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Ability to store charge per volt</li>
                          <li>• Units: farads (F) = C/V</li>
                          <li>• Depends on geometry, not charge or voltage</li>
                          <li>• A = plate area, d = separation</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Energy Storage</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"U = \\frac{1}{2}CV^2 = \\frac{1}{2}QV = \\frac{Q^2}{2C}"}</BlockMath>
                        </div>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Energy density: <InlineMath>{"u = \\frac{1}{2}\\epsilon_0 E^2"}</InlineMath></li>
                          <li>• Energy stored in electric field</li>
                          <li>• Multiple equivalent expressions</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-indigo-300">
                        <h5 className="font-medium text-indigo-800 mb-2">Particle Motion in Uniform Field</h5>
                        <ul className="text-indigo-900 text-sm space-y-1">
                          <li>• Force: <InlineMath>{"F = qE"}</InlineMath></li>
                          <li>• Acceleration: <InlineMath>{"a = \\frac{qE}{m}"}</InlineMath></li>
                          <li>• Kinematic equations apply</li>
                          <li>• Work-energy theorem: <InlineMath>{"W = q \\Delta V = \\Delta KE"}</InlineMath></li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-current" title="Electric Current - From Static to Dynamic Electricity" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-3">Electric Current Fundamentals</h4>
                    
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Definition of Current</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"I = \\frac{Q}{t} = \\frac{dQ}{dt}"}</BlockMath>
                        </div>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• Rate of charge flow</li>
                          <li>• Units: amperes (A) = C/s</li>
                          <li>• Conventional current: positive charge flow</li>
                          <li>• Actual current: electron flow (opposite direction)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Current and Drift Velocity</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"I = nqAv_d"}</BlockMath>
                        </div>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• n = charge carrier density</li>
                          <li>• q = charge per carrier</li>
                          <li>• A = cross-sectional area</li>
                          <li>• <InlineMath>{"v_d"}</InlineMath> = drift velocity (very slow!)</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Resistance and Ohm's Law</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"V = IR"}</BlockMath>
                          <BlockMath>{"R = \\rho \\frac{L}{A}"}</BlockMath>
                        </div>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• R = resistance (Ω, ohms)</li>
                          <li>• ρ = resistivity (material property)</li>
                          <li>• L = length, A = cross-sectional area</li>
                          <li>• Ohmic materials: constant resistance</li>
                        </ul>
                      </div>

                      <div className="bg-white p-3 rounded border border-red-300">
                        <h5 className="font-medium text-red-800 mb-2">Power in Electric Circuits</h5>
                        <div className="text-center mb-2">
                          <BlockMath>{"P = IV = I^2R = \\frac{V^2}{R}"}</BlockMath>
                        </div>
                        <ul className="text-red-900 text-sm space-y-1">
                          <li>• P = power (W, watts)</li>
                          <li>• Energy dissipated per unit time</li>
                          <li>• Heat generation in resistors</li>
                          <li>• Multiple equivalent expressions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="key-formulas" title="Unit 3 Formula Summary" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-4">Essential Formulas for Unit 3</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Forces and Fields</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"F = k \\frac{q_1 q_2}{r^2}"}</InlineMath> (Coulomb's Law)</div>
                          <div><InlineMath>{"E = \\frac{F}{q} = k \\frac{q}{r^2}"}</InlineMath> (Electric Field)</div>
                          <div><InlineMath>{"E = \\frac{V}{d}"}</InlineMath> (Uniform Field)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Energy and Potential</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"U = k \\frac{q_1 q_2}{r}"}</InlineMath> (Potential Energy)</div>
                          <div><InlineMath>{"V = k \\frac{q}{r}"}</InlineMath> (Electric Potential)</div>
                          <div><InlineMath>{"W = q \\Delta V"}</InlineMath> (Work)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Capacitors</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"C = \\frac{Q}{V} = \\epsilon_0 \\frac{A}{d}"}</InlineMath></div>
                          <div><InlineMath>{"U = \\frac{1}{2}CV^2 = \\frac{1}{2}QV"}</InlineMath></div>
                          <div><InlineMath>{"u = \\frac{1}{2}\\epsilon_0 E^2"}</InlineMath> (Energy Density)</div>
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded border border-gray-400">
                        <h5 className="font-medium text-gray-800 mb-2">Current and Resistance</h5>
                        <div className="space-y-1 text-sm">
                          <div><InlineMath>{"I = \\frac{Q}{t}"}</InlineMath> (Current)</div>
                          <div><InlineMath>{"V = IR"}</InlineMath> (Ohm's Law)</div>
                          <div><InlineMath>{"P = IV = I^2R = \\frac{V^2}{R}"}</InlineMath> (Power)</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded p-3">
                      <h5 className="font-medium text-yellow-800 mb-2">Important Constants</h5>
                      <div className="text-sm text-yellow-900 space-y-1">
                        <div><InlineMath>{"k = 8.99 \\times 10^9"}</InlineMath> N⋅m²/C² (Coulomb's constant)</div>
                        <div><InlineMath>{"\\epsilon_0 = 8.85 \\times 10^{-12}"}</InlineMath> C²/(N⋅m²) (Permittivity of free space)</div>
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4">Unit 3 Practice Questions</h3>
          <p className="text-blue-700 mb-4">
            Test your understanding of electricity and electric fields with these practice questions 
            covering all six lessons in Unit 3.
          </p>
          
          {/* SlideshowKnowledgeCheck Component */}
          <SlideshowKnowledgeCheck
        course={course}
            lessonPath="46-unit-3-review"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q1',
                title: 'Question 1: Charging Methods'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q2',
                title: 'Question 2: Glass Rod and Silk'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q3',
                title: 'Question 3: Coulomb\'s Law Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q4',
                title: 'Question 4: Inverse Square Law'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q5',
                title: 'Question 5: Electric Field Strength'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q6',
                title: 'Question 6: Electric Field Lines'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q7',
                title: 'Question 7: Electric Potential Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q8',
                title: 'Question 8: Work and Potential Difference'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q9',
                title: 'Question 9: Parallel Plate Field'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q10',
                title: 'Question 10: Capacitor Charge Storage'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q11',
                title: 'Question 11: Electric Current Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q12',
                title: 'Question 12: Ohm\'s Law Application'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q13',
                title: 'Question 13: Scalar vs Vector Quantities'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q14',
                title: 'Question 14: Electron Motion in Electric Field'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_46_unit3_q15',
                title: 'Question 15: Capacitance and Plate Separation'
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
          <h3 className="text-xl font-semibold text-green-800 mb-4">Study Tips for Unit 3</h3>
          
          <div className="space-y-4">
            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Conceptual Understanding</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Understand the difference between force, field, energy, and potential</li>
                <li>• Visualize electric field lines and equipotential surfaces</li>
                <li>• Connect microscopic charge behavior to macroscopic phenomena</li>
                <li>• Practice identifying when to use each formula</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Problem-Solving Strategies</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Always start with a clear diagram</li>
                <li>• Identify given quantities and what you need to find</li>
                <li>• Check units throughout your calculations</li>
                <li>• Use symmetry to simplify complex problems</li>
                <li>• Apply superposition principle for multiple charges</li>
              </ul>
            </div>

            <div className="bg-white p-4 rounded border border-green-300">
              <h4 className="font-medium text-green-800 mb-2">Common Mistakes to Avoid</h4>
              <ul className="text-green-900 text-sm space-y-1">
                <li>• Confusing scalar quantities (potential) with vector quantities (field)</li>
                <li>• Forgetting to consider direction in vector problems</li>
                <li>• Mixing up electric field and electric force</li>
                <li>• Using wrong distance in inverse square law problems</li>
                <li>• Ignoring signs of charges in calculations</li>
              </ul>
            </div>
          </div>
        </div>
      </TextSection>

      {/* Unit Summary */}
      <LessonSummary>
        <div className="space-y-4">
          <p>
            Unit 3 provides a comprehensive foundation in electricity and electric fields, taking you 
            from basic electrostatic phenomena through to electric current and circuits. This knowledge 
            forms the basis for understanding more advanced topics in electromagnetism.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">Key Takeaways</h4>
            <ul className="text-blue-900 text-sm space-y-1">
              <li>• Electric force follows an inverse square law (Coulomb's Law)</li>
              <li>• Electric field represents force per unit charge</li>
              <li>• Electric potential represents energy per unit charge</li>
              <li>• Parallel plate capacitors create uniform electric fields</li>
              <li>• Electric current is the rate of charge flow</li>
              <li>• All concepts are interconnected and build upon each other</li>
            </ul>
          </div>
          
          <p>
            Master these concepts thoroughly, as they form the foundation for understanding 
            electromagnetic phenomena, circuits, and many practical applications in technology and nature.
          </p>
        </div>
      </LessonSummary>
    </LessonContent>
  );
};

export default Unit3Review;