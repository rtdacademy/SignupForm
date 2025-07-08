import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ElectricFields = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const [testChargeDemo, setTestChargeDemo] = useState('positive'); // 'positive' or 'negative'
  const [fieldDiagramType, setFieldDiagramType] = useState('single-positive'); // 'single-positive', 'single-negative', 'dipole'
  const [conductorShape, setConductorShape] = useState('sphere'); // 'sphere', 'plate', 'irregular'
  const [animateCharges, setAnimateCharges] = useState(false);
  const [faradayDemo, setFaradayDemo] = useState('off'); // 'off', 'charging', 'charged'
  const [showPerson, setShowPerson] = useState(false);

  return (
    <LessonContent
      title="Electric Fields"
      subtitle="Understanding how charges interact through fields"
      course={course}
      courseId={courseId}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="fields" title="Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The idea of a field resulted from a need to explain how one object (for example a 
                      charged ebonite rod) can have an effect on another object (a charged pith ball) over a 
                      distance. How does the pith ball "know" about the presence of the ebonite rod? 
                      Conversely, how does the ebonite rod "know" about the presence of the pith ball? After 
                      all, they are not in direct contact.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">The Problem of "Action at a Distance"</h4>
                    <p className="text-sm text-blue-900">
                      This fundamental question puzzled scientists for centuries: How can objects influence 
                      each other without touching? The concept of fields was developed to address this mystery 
                      of remote interaction.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      It is this <span className="font-semibold text-gray-900">"action at a distance"</span> for 
                      which the concept of a field was initially developed. In this course we will learn about 
                      electric fields and magnetic fields (Lesson 19). We learned about gravitational fields 
                      in Physics 20.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Fields in Physics</h4>
                    <p className="text-sm text-yellow-900 mb-3">
                      The field concept is one of the most important unifying ideas in physics. Different types 
                      of fields explain various fundamental interactions:
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-1">Gravitational Fields</h5>
                        <p className="text-xs text-yellow-900">
                          Explain how masses attract each other across space (Physics 20)
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-1">Electric Fields</h5>
                        <p className="text-xs text-yellow-900">
                          Explain how charges interact without direct contact (this lesson)
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-yellow-300">
                        <h5 className="font-medium text-yellow-800 mb-1">Magnetic Fields</h5>
                        <p className="text-xs text-yellow-900">
                          Explain magnetic forces and electromagnetic induction (Lesson 19)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">Key Insight</h4>
                    <p className="text-sm text-green-900">
                      A field is a region of space where a force can be detected. Rather than thinking of 
                      charges acting directly on each other across empty space, we can imagine that each 
                      charge creates an invisible "field" in the space around it. Other charges then respond 
                      to this field in their immediate vicinity.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-2">The Field Perspective</h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      Instead of asking "How does charge A affect charge B at a distance?", we can break 
                      this into two simpler questions:
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                      <li>
                        <span className="font-medium">What field does charge A create</span> in the space around it?
                      </li>
                      <li>
                        <span className="font-medium">How does charge B respond</span> to the field at its location?
                      </li>
                    </ol>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      This field approach transforms a mysterious "action at a distance" into two local 
                      interactions that are easier to understand and calculate.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electric-fields" title="Electric Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      An electric field is generated by any object which has an electric charge. Electric fields 
                      have the following characteristics:
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Key Characteristics of Electric Fields:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">⇒</span>
                        <span className="text-blue-900">Electric fields can be produced by either positive or negative charged objects.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">⇒</span>
                        <span className="text-blue-900">Electric fields decrease in strength with increased distance.</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-blue-600 font-bold mt-1">⇒</span>
                        <span className="text-blue-900">Electric fields are vector fields.</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      When a charge (q) is placed within an existing electric field it will experience a force. 
                      The electric field strength (<InlineMath math="\vec{E}" />) at a given point is defined as the ratio of the electric force 
                      (<InlineMath math="\vec{F_e}" />) to the magnitude of the charge (q).
                    </p>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">Electric Field Strength Formula:</h4>
                    <div className="text-center">
                      <div className="my-4">
                        <BlockMath math="\vec{E} = \frac{\vec{F_e}}{|q|}" />
                      </div>
                      <p className="text-sm text-gray-600 mb-3">units: Newtons per Coulomb (N/C)</p>
                      <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                        <p className="text-sm text-yellow-800">
                          Notice that the electric field strength equation above uses absolute value symbols. The 
                          equation calculates the electric field strength, but does not give its direction.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">Direction of Electric Fields</h4>
                    <p className="text-gray-700 leading-relaxed mb-3">
                      The direction of an electric field at any point in space is conventionally defined as: 
                      <span className="font-semibold"> the direction that a small imaginary positive test charge (q<sub>T</sub>) 
                      will move in the electric field</span>. We imagine that the charge on q<sub>T</sub> is so small that it responds to the 
                      electric field without changing the electric field being tested.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Interactive: Test Charge Behavior</h4>
                    <p className="text-sm text-green-900 mb-4">
                      Click the buttons below to see how a positive test charge behaves near different source charges:
                    </p>
                    
                    <div className="flex gap-3 mb-4">
                      <button
                        onClick={() => setTestChargeDemo('positive')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          testChargeDemo === 'positive'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                        }`}
                      >
                        Positive Source Charge
                      </button>
                      <button
                        onClick={() => setTestChargeDemo('negative')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          testChargeDemo === 'negative'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        Negative Source Charge
                      </button>
                    </div>

                    <div className="bg-white border border-green-300 rounded-lg p-4">
                      <svg width="400" height="200" className="mx-auto">
                        {/* Background */}
                        <rect width="400" height="200" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Source charge */}
                        <circle 
                          cx="100" 
                          cy="100" 
                          r="25" 
                          fill={testChargeDemo === 'positive' ? '#dc2626' : '#2563eb'} 
                          stroke={testChargeDemo === 'positive' ? '#b91c1c' : '#1d4ed8'} 
                          strokeWidth="3"
                        />
                        <text 
                          x="100" 
                          y="108" 
                          textAnchor="middle" 
                          fontSize="20" 
                          fontWeight="bold" 
                          fill="white"
                        >
                          {testChargeDemo === 'positive' ? '+' : '−'}
                        </text>
                        <text 
                          x="100" 
                          y="140" 
                          textAnchor="middle" 
                          fontSize="12" 
                          fontWeight="bold" 
                          fill="#374151"
                        >
                          Source Charge
                        </text>

                        {/* Test charge */}
                        <circle 
                          cx={testChargeDemo === 'positive' ? '250' : '200'} 
                          cy="100" 
                          r="15" 
                          fill="#f59e0b" 
                          stroke="#d97706" 
                          strokeWidth="2"
                        />
                        <text 
                          x={testChargeDemo === 'positive' ? '250' : '200'} 
                          y="106" 
                          textAnchor="middle" 
                          fontSize="14" 
                          fontWeight="bold" 
                          fill="white"
                        >
                          +
                        </text>
                        <text 
                          x={testChargeDemo === 'positive' ? '250' : '200'} 
                          y="130" 
                          textAnchor="middle" 
                          fontSize="10" 
                          fontWeight="bold" 
                          fill="#374151"
                        >
                          q<tspan fontSize="8">T</tspan>
                        </text>

                        {/* Arrow showing force direction */}
                        <defs>
                          <marker 
                            id="arrowhead" 
                            markerWidth="10" 
                            markerHeight="7" 
                            refX="10" 
                            refY="3.5" 
                            orient="auto"
                          >
                            <polygon points="0 0, 10 3.5, 0 7" fill="#059669" />
                          </marker>
                        </defs>
                        
                        {testChargeDemo === 'positive' ? (
                          // Repulsion - arrow pointing away
                          <line 
                            x1="265" 
                            y1="100" 
                            x2="320" 
                            y2="100" 
                            stroke="#059669" 
                            strokeWidth="4" 
                            markerEnd="url(#arrowhead)"
                          />
                        ) : (
                          // Attraction - arrow pointing toward
                          <line 
                            x1="185" 
                            y1="100" 
                            x2="135" 
                            y2="100" 
                            stroke="#059669" 
                            strokeWidth="4" 
                            markerEnd="url(#arrowhead)"
                          />
                        )}

                        {/* Force label */}
                        <text 
                          x={testChargeDemo === 'positive' ? '292' : '160'} 
                          y="90" 
                          textAnchor="middle" 
                          fontSize="12" 
                          fontWeight="bold" 
                          fill="#059669"
                        >
                          Force
                        </text>

                        {/* Electric field direction indicator */}
                        <text 
                          x="200" 
                          y="170" 
                          textAnchor="middle" 
                          fontSize="14" 
                          fontWeight="bold" 
                          fill="#374151"
                        >
                          Electric field points in direction of force on positive test charge
                        </text>
                      </svg>

                      <div className="mt-4 p-3 bg-gray-100 rounded">
                        {testChargeDemo === 'positive' ? (
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">Positive source charge:</span> The positive test charge is 
                            <span className="font-semibold text-red-600"> repelled</span> (like charges repel). 
                            Therefore, the electric field points <span className="font-semibold">away</span> from positive charges.
                          </p>
                        ) : (
                          <p className="text-sm text-gray-800">
                            <span className="font-semibold">Negative source charge:</span> The positive test charge is 
                            <span className="font-semibold text-blue-600"> attracted</span> (unlike charges attract). 
                            Therefore, the electric field points <span className="font-semibold">toward</span> negative charges.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Summary: Electric Field Direction Convention</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-red-700 mb-2">Positive Source Charge (+)</h5>
                        <p className="text-xs text-purple-900">
                          The positive test charge will be <strong>repelled</strong>. 
                          Electric field points <strong>away</strong> from positive charges.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <h5 className="font-medium text-blue-700 mb-2">Negative Source Charge (−)</h5>
                        <p className="text-xs text-purple-900">
                          The positive test charge will be <strong>attracted</strong>. 
                          Electric field points <strong>toward</strong> negative charges.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Finding Electric Field Strength from Force" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 60 μC charge is placed in an electric field. If the mass of the charge is 0.25 mg and it 
                  experiences an acceleration of 1.25 × 10⁴ m/s², what is the electric field strength at that point?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Find the force on the charged particle</span>
                      <div className="my-3">
                        <BlockMath math="F = ma" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = 0.25 \times 10^{-3} \text{ kg} \times 1.25 \times 10^4 \text{ m/s}^2" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = 3.125 \times 10^{-3} \text{ N}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the electric field strength</span>
                      <div className="my-3">
                        <BlockMath math="E = \frac{F_e}{q}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E = \frac{3.125 \times 10^{-3} \text{ N}}{60 \times 10^{-6} \text{ C}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E = 5.21 \times 10^1 \text{ N/C}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The electric field strength is 
                      <span className="font-bold"> 52.1 N/C</span>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="point-charge" title="Electric Field Strength Around a Point Charge" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The electric field strength for a point charge source is given by the equation:
                    </p>
                  </div>

                  <div className="bg-white border border-gray-300 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3 text-center">Electric Field Strength Formula:</h4>
                    <div className="text-center">
                      <div className="my-4">
                        <BlockMath math="|\vec{E}| = k \frac{|q|}{r^2}" />
                      </div>
                      <p className="text-sm text-gray-600">units: Newtons per Coulomb (N/C)</p>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Key Relationships:</h4>
                    <ul className="space-y-2 text-blue-900">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        The electric field <InlineMath math="|\vec{E}|" /> is generated by a charge q.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        The larger the charge, the greater the strength of the electric field around the charge.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        The further we go from the charge, the weaker the electric field strength becomes.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        Point charges or charges on spheres produce non-uniform electric fields.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Note:</h4>
                    <p className="text-sm text-yellow-900">
                      This formula gives the <strong>magnitude</strong> of the electric field. The direction 
                      must be determined separately using the test charge convention: electric fields point 
                      away from positive charges and toward negative charges.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Multiple Charges: Vector Addition</h4>
                    <p className="text-sm text-purple-900 mb-3">
                      When two charges are involved, the resulting electric field is the <strong>vector sum</strong> of the fields 
                      from each of the charges. For example, say we have a positive and a negative charge a 
                      fixed distance from each other. At any point (P) in space, the resulting electric field will be 
                      the vector sum of the electric fields of each of the two charges.
                    </p>
                    
                    <div className="bg-white border border-purple-300 rounded p-3">
                      <h5 className="font-medium text-purple-800 mb-2">Mathematical Expression:</h5>
                      <div className="text-center">
                        <BlockMath math="\vec{E}_{total} = \vec{E}_1 + \vec{E}_2 + \vec{E}_3 + ..." />
                      </div>
                      <p className="text-xs text-purple-700 mt-2 text-center">
                        Each individual field is calculated using the point charge formula, then combined vectorially.
                      </p>
                    </div>

                    <div className="mt-3 p-3 bg-purple-100 rounded">
                      <p className="text-xs text-purple-900">
                        <strong>Key Insight:</strong> The superposition principle applies to electric fields. 
                        Each charge contributes its own field as if the other charges weren't there, and the 
                        total field is the vector sum of all individual contributions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Finding Charge from Electric Field" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If the electric field is 6.0 × 10⁸ N/C toward a point charge at a distance of 5.0 cm from 
                  the centre of the charge, what is the magnitude and sign of the charge?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Using the point charge electric field formula:</span>
                      <div className="my-3">
                        <BlockMath math="|\vec{E}| = k \frac{|q|}{r^2}" />
                      </div>
                      <p className="text-sm text-gray-600">Rearranging to solve for q:</p>
                      <div className="my-3">
                        <BlockMath math="|q| = \frac{|\vec{E}| \cdot r^2}{k}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substituting the given values:</span>
                      <div className="my-3">
                        <BlockMath math="|q| = \frac{6.0 \times 10^8 \text{ N/C} \times (0.050 \text{ m})^2}{8.99 \times 10^9 \text{ N⋅m}^2/\text{C}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="|q| = \frac{6.0 \times 10^8 \times 0.0025}{8.99 \times 10^9}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="|q| = 1.67 \times 10^{-4} \text{ C}" />
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Determining the sign:</span>
                      <p className="text-sm text-green-900 mt-2">
                        Since the electric field is directed <strong>toward</strong> the point charge 
                        (i.e., a positive test charge is attracted to this charge), the charge must be <strong>negative</strong>.
                      </p>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The charge is 
                      <span className="font-bold"> q = −1.67 × 10⁻⁴ C</span>.
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Remember:</strong> Electric field lines point toward negative charges and away from positive charges. 
                        This convention helps us determine the sign of unknown charges from field direction information.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Electric Field from Multiple Charges" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A +40 μC charge and a −60 μC charge are set 1.0 m apart as shown in the diagram. 
                  Calculate the electric field (magnitude and direction) at a point 0.25 m to the left of the 
                  +40 μC charge.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Problem Setup</h5>
                    <div className="text-center">
                      <svg width="500" height="200" className="mx-auto mb-2">
                        {/* Background */}
                        <rect width="500" height="200" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Point P */}
                        <circle cx="80" cy="100" r="4" fill="#000" />
                        <text x="80" y="85" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#000">P</text>
                        
                        {/* +40 μC charge */}
                        <circle cx="180" cy="100" r="20" fill="#dc2626" stroke="#b91c1c" strokeWidth="3"/>
                        <text x="180" y="107" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">+</text>
                        <text x="180" y="135" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2d3436">+40 μC</text>
                        
                        {/* -60 μC charge */}
                        <circle cx="380" cy="100" r="20" fill="#2563eb" stroke="#1d4ed8" strokeWidth="3"/>
                        <text x="380" y="108" textAnchor="middle" fontSize="16" fontWeight="bold" fill="white">−</text>
                        <text x="380" y="135" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2d3436">−60 μC</text>
                        
                        {/* Distance labels */}
                        <line x1="80" y1="150" x2="180" y2="150" stroke="#636e72" strokeWidth="2"/>
                        <text x="130" y="165" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">0.25 m</text>
                        
                        <line x1="180" y1="165" x2="380" y2="165" stroke="#636e72" strokeWidth="2"/>
                        <text x="280" y="180" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">1.0 m</text>
                        
                        {/* Total distance from P to -60 μC */}
                        <line x1="80" y1="50" x2="380" y2="50" stroke="#636e72" strokeWidth="1" strokeDasharray="3,3"/>
                        <text x="230" y="40" textAnchor="middle" fontSize="10" fill="#2d3436">1.25 m total</text>
                      </svg>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">Important Strategy</h5>
                    <p className="text-sm text-yellow-900">
                      When solving this problem it is extremely important to draw a diagram showing the directions of the 
                      electric fields of all the charges generating the field at the point of interest. Recall that the direction of the 
                      electric field is the direction that a small + test charge would move if placed at the point of interest. 
                      A positive test charge would be attracted to the −60 charge and away from the +40 charge.
                    </p>
                  </div>

                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Calculate electric field from +40 μC charge</span>
                      <div className="my-3">
                        <BlockMath math="E_{+40} = k \frac{|q_{+40}|}{r_{+40}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{+40} = \frac{8.99 \times 10^9 \times 40 \times 10^{-6}}{(0.25)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{+40} = \frac{359.6}{0.0625} = 5.754 \times 10^6 \text{ N/C}" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Direction:</strong> Away from +40 μC charge → <strong>leftward</strong>
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate electric field from −60 μC charge</span>
                      <div className="my-3">
                        <BlockMath math="E_{-60} = k \frac{|q_{-60}|}{r_{-60}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{-60} = \frac{8.99 \times 10^9 \times 60 \times 10^{-6}}{(1.25)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{-60} = \frac{539.4}{1.5625} = 345216 \text{ N/C}" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Direction:</strong> Toward −60 μC charge → <strong>rightward</strong>
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Electric Field Direction Diagram</h5>
                      <div className="text-center">
                        <svg width="400" height="150" className="mx-auto mb-2">
                          {/* Background */}
                          <rect width="400" height="150" fill="#f0f9ff" stroke="#e0f2fe" strokeWidth="1" rx="4"/>
                          
                          {/* Point P */}
                          <circle cx="200" cy="75" r="6" fill="#000" />
                          <text x="200" y="60" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">P</text>
                          
                          {/* Electric field vectors */}
                          <defs>
                            <marker id="arrowhead-left" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
                            </marker>
                            <marker id="arrowhead-right" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                            </marker>
                            <marker id="arrowhead-net" markerWidth="12" markerHeight="9" 
                             refX="12" refY="4.5" orient="auto">
                              <polygon points="0 0, 12 4.5, 0 9" fill="#059669" />
                            </marker>
                          </defs>
                          
                          {/* E+40 vector (leftward) */}
                          <line x1="194" y1="75" x2="120" y2="75" stroke="#dc2626" strokeWidth="4" markerEnd="url(#arrowhead-left)"/>
                          <text x="150" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#dc2626">E<tspan fontSize="10">+40</tspan></text>
                          <text x="150" y="95" textAnchor="middle" fontSize="10" fill="#dc2626">5.75×10⁶ N/C left</text>
                          
                          {/* E-60 vector (rightward) */}
                          <line x1="206" y1="75" x2="280" y2="75" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrowhead-right)"/>
                          <text x="250" y="65" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2563eb">E<tspan fontSize="10">−60</tspan></text>
                          <text x="250" y="95" textAnchor="middle" fontSize="10" fill="#2563eb">3.45×10⁵ N/C right</text>
                          
                          {/* Net vector (leftward, longer) */}
                          <line x1="200" y1="110" x2="100" y2="110" stroke="#059669" strokeWidth="6" markerEnd="url(#arrowhead-net)"/>
                          <text x="150" y="130" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#059669">E<tspan fontSize="10">net</tspan></text>
                          <text x="150" y="145" textAnchor="middle" fontSize="10" fill="#059669">5.41×10⁶ N/C left</text>
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Apply vector addition</span>
                      <div className="my-3">
                        <BlockMath math="\vec{E}_{total} = \vec{E}_{+40} + \vec{E}_{-60}" />
                      </div>
                      <p className="text-sm text-gray-600 mb-2">Since both vectors are along the same line (horizontal):</p>
                      <div className="my-3">
                        <BlockMath math="E_{total} = E_{+40} - E_{-60}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{total} = 5.754 \times 10^6 \text{ left} - 3.452 \times 10^5 \text{ right}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{total} = 5.754 \times 10^6 - 3.452 \times 10^5 = 5.409 \times 10^6 \text{ N/C}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The electric field at point P is 
                      <span className="font-bold"> 5.41 × 10⁶ N/C to the left</span>.
                    </p>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-purple-800">
                        <strong>Key Insight:</strong> The +40 μC charge creates a much stronger field at point P because 
                        it's much closer (0.25 m vs 1.25 m). Even though the −60 μC charge has a larger magnitude, 
                        the 1/r² dependence makes proximity the dominant factor.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4 - 2D Electric Field Vector Addition" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  From the diagram below determine (a) the electric field at point P and (b) the 
                  electrostatic force on a −3.00 nC charge if it were placed at P.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Problem Setup</h5>
                    <div className="text-center">
                      <svg width="400" height="300" className="mx-auto mb-2">
                        {/* Background */}
                        <rect width="400" height="300" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Coordinate system */}
                        <defs>
                          <marker id="coord-arrow" markerWidth="8" markerHeight="6" 
                           refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#666" />
                          </marker>
                        </defs>
                        
                        {/* Coordinate axes */}
                        <line x1="50" y1="250" x2="120" y2="250" stroke="#666" strokeWidth="2" markerEnd="url(#coord-arrow)"/>
                        <text x="130" y="255" fontSize="12" fontWeight="bold" fill="#666">East</text>
                        
                        <line x1="50" y1="250" x2="50" y2="180" stroke="#666" strokeWidth="2" markerEnd="url(#coord-arrow)"/>
                        <text x="25" y="175" fontSize="12" fontWeight="bold" fill="#666">North</text>
                        
                        {/* -2.00 μC charge */}
                        <circle cx="150" cy="200" r="15" fill="#2563eb" stroke="#1d4ed8" strokeWidth="2"/>
                        <text x="150" y="206" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">−</text>
                        <text x="150" y="225" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">−2.00 μC</text>
                        
                        {/* +4.00 μC charge */}
                        <circle cx="250" cy="125" r="15" fill="#dc2626" stroke="#b91c1c" strokeWidth="2"/>
                        <text x="250" y="131" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">+</text>
                        <text x="250" y="110" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+4.00 μC</text>
                        
                        {/* Point P */}
                        <circle cx="250" cy="200" r="4" fill="#000" />
                        <text x="265" y="205" fontSize="12" fontWeight="bold" fill="#000">P</text>
                        
                        {/* Distance lines */}
                        <line x1="150" y1="185" x2="250" y2="185" stroke="#636e72" strokeWidth="1" strokeDasharray="3,3"/>
                        <text x="200" y="180" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2d3436">0.10 m</text>
                        
                        <line x1="265" y1="200" x2="265" y2="125" stroke="#636e72" strokeWidth="1" strokeDasharray="3,3"/>
                        <text x="275" y="165" fontSize="10" fontWeight="bold" fill="#2d3436">0.075 m</text>
                        
                        {/* Right angle indicator */}
                        <path d="M 235 200 L 235 185 L 250 185" stroke="#636e72" strokeWidth="1" fill="none"/>
                      </svg>
                    </div>
                    <p className="text-sm text-blue-900 text-center mt-2">
                      The electric field at P is the vector sum of the electric fields from both charges: E⃗₋₂.₀₀ and E⃗₊₄.₀₀
                    </p>
                  </div>

                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Part (a): Electric field at point P</span>
                    </div>

                    <div>
                      <span className="font-medium">Step 1: Calculate electric field from −2.00 μC charge</span>
                      <div className="my-3">
                        <BlockMath math="E_{-2.00} = k \frac{|q_{-2.00}|}{r_{-2.00}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{-2.00} = \frac{8.99 \times 10^9 \times 2.00 \times 10^{-6}}{(0.10)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{-2.00} = 1.798 \times 10^6 \text{ N/C}" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Direction:</strong> Toward −2.00 μC charge → <strong>west</strong>
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate electric field from +4.00 μC charge</span>
                      <div className="my-3">
                        <BlockMath math="E_{+4.00} = k \frac{|q_{+4.00}|}{r_{+4.00}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{+4.00} = \frac{8.99 \times 10^9 \times 4.00 \times 10^{-6}}{(0.075)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="E_{+4.00} = 6.393 \times 10^6 \text{ N/C}" />
                      </div>
                      <p className="text-sm text-gray-600">
                        <strong>Direction:</strong> Away from +4.00 μC charge → <strong>south</strong>
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Vector Diagram</h5>
                      <div className="text-center">
                        <svg width="350" height="250" className="mx-auto mb-2">
                          {/* Background */}
                          <rect width="350" height="250" fill="#f0f9ff" stroke="#e0f2fe" strokeWidth="1" rx="4"/>
                          
                          {/* Coordinate system */}
                          <defs>
                            <marker id="arrow-west" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                            </marker>
                            <marker id="arrow-south" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
                            </marker>
                            <marker id="arrow-net" markerWidth="12" markerHeight="9" 
                             refX="12" refY="4.5" orient="auto">
                              <polygon points="0 0, 12 4.5, 0 9" fill="#059669" />
                            </marker>
                          </defs>
                          
                          {/* Point P */}
                          <circle cx="175" cy="125" r="6" fill="#000" />
                          <text x="175" y="110" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#000">P</text>
                          
                          {/* E from -2.00 μC (west) */}
                          <line x1="175" y1="125" x2="100" y2="125" stroke="#2563eb" strokeWidth="4" markerEnd="url(#arrow-west)"/>
                          <text x="135" y="115" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2563eb">E<tspan fontSize="9">−2.00</tspan></text>
                          <text x="135" y="145" textAnchor="middle" fontSize="9" fill="#2563eb">1.798×10⁶ N/C</text>
                          
                          {/* E from +4.00 μC (south) */}
                          <line x1="175" y1="125" x2="175" y2="200" stroke="#dc2626" strokeWidth="4" markerEnd="url(#arrow-south)"/>
                          <text x="195" y="165" fontSize="11" fontWeight="bold" fill="#dc2626">E<tspan fontSize="9">+4.00</tspan></text>
                          <text x="195" y="175" fontSize="9" fill="#dc2626">6.393×10⁶ N/C</text>
                          
                          {/* Resultant vector */}
                          <line x1="175" y1="125" x2="105" y2="195" stroke="#059669" strokeWidth="5" markerEnd="url(#arrow-net)"/>
                          <text x="130" y="170" fontSize="12" fontWeight="bold" fill="#059669">E<tspan fontSize="10">net</tspan></text>
                          
                          {/* Angle marking */}
                          <path d="M 160 125 A 15 15 0 0 1 175 140" stroke="#059669" strokeWidth="2" fill="none"/>
                          <text x="150" y="145" fontSize="10" fontWeight="bold" fill="#059669">15.7°</text>
                          
                          {/* Coordinate labels */}
                          <text x="50" y="130" fontSize="12" fontWeight="bold" fill="#666">W</text>
                          <text x="175" y="230" fontSize="12" fontWeight="bold" fill="#666">S</text>
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Calculate magnitude and direction of net field</span>
                      <div className="my-3">
                        <BlockMath math="|\vec{E}| = \sqrt{E_{west}^2 + E_{south}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="|\vec{E}| = \sqrt{(1.798 \times 10^6)^2 + (6.393 \times 10^6)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="|\vec{E}| = 6.64 \times 10^6 \text{ N/C}" />
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">Direction:</p>
                      <div className="my-3">
                        <BlockMath math="\theta = \tan^{-1}\left(\frac{1.798 \times 10^6}{6.393 \times 10^6}\right) = \tan^{-1}(0.281) = 15.7°" />
                      </div>
                      <p className="text-sm text-gray-600">
                        Direction: <strong>15.7° west of south</strong>
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <span className="font-medium text-blue-800">Answer (a):</span>
                      <p className="text-sm text-blue-900 mt-1">
                        The electric field at point P is <strong>6.64 × 10⁶ N/C at 15.7° west of south</strong>.
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Part (b): Force on a −3.00 nC charge at P</span>
                      <div className="my-3">
                        <BlockMath math="\vec{F} = q\vec{E}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = (-3.00 \times 10^{-9} \text{ C})(6.64 \times 10^6 \text{ N/C})" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F = 1.99 \times 10^{-2} \text{ N}" />
                      </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h5 className="font-semibold text-yellow-800 mb-2">Important Note about Direction:</h5>
                      <p className="text-sm text-yellow-900">
                        Note that a <strong>negative charge moves in the opposite direction</strong> in an electric field 
                        than a positive charge would move. Since the electric field points 15.7° west of south, 
                        a negative charge will experience a force in the opposite direction.
                      </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <span className="font-medium text-green-800">Answer (b):</span>
                      <p className="text-sm text-green-900 mt-1">
                        The force on the −3.00 nC charge is <strong>1.99 × 10⁻² N at 15.7° east of north</strong>.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-purple-800">
                        <strong>Key Concepts:</strong> This problem demonstrates 2D vector addition of electric fields. 
                        The perpendicular components are combined using the Pythagorean theorem for magnitude and 
                        inverse tangent for direction. Remember that force direction depends on charge sign!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="field-diagrams" title="Electric Field Diagrams" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      It is useful to visualize the direction and strength of an electric field at various points 
                      in space as a "map." The great English physicist Michael Faraday (1791–1867) proposed the idea of electric field 
                      lines or lines of force.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Historical Note</h4>
                    <p className="text-sm text-blue-900 mb-3">
                      The photograph below shows bits of fine thread suspended in oil. At centre is a charged 
                      object. Its electric field induces opposite charges on the two ends of each bit of thread which 
                      then tend to line up end-to-end along the direction of the field lines.
                    </p>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Cotton fibres floating in oil</h5>
                        <p className="text-xs text-blue-900">
                          Respond to a point charge, creating a visual representation of the electric field pattern.
                        </p>
                      </div>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <h5 className="font-medium text-blue-800 mb-2">Cotton fibres floating in oil</h5>
                        <p className="text-xs text-blue-900">
                          Respond to + and − point charges, showing the more complex field pattern.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Interactive Electric Field Diagrams</h4>
                    <p className="text-sm text-green-900 mb-4">
                      Explore different electric field patterns by selecting the charge configuration below:
                    </p>
                    
                    <div className="flex gap-3 mb-4 flex-wrap">
                      <button
                        onClick={() => setFieldDiagramType('single-positive')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          fieldDiagramType === 'single-positive'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                        }`}
                      >
                        Single Positive Charge
                      </button>
                      <button
                        onClick={() => setFieldDiagramType('single-negative')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          fieldDiagramType === 'single-negative'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        Single Negative Charge
                      </button>
                      <button
                        onClick={() => setFieldDiagramType('dipole')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          fieldDiagramType === 'dipole'
                            ? 'bg-purple-500 text-white'
                            : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        Positive and Negative
                      </button>
                    </div>

                    <div className="bg-white border border-green-300 rounded-lg p-4">
                      <svg width="500" height="400" className="mx-auto">
                        {/* Background */}
                        <rect width="500" height="400" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Field lines based on selected type */}
                        {fieldDiagramType === 'single-positive' && (
                          <>
                            {/* Positive charge at center */}
                            <circle cx="250" cy="200" r="20" fill="#dc2626" stroke="#b91c1c" strokeWidth="3"/>
                            <text x="250" y="208" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">+</text>
                            
                            {/* Radial field lines pointing outward */}
                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
                              const rad = angle * Math.PI / 180;
                              const startX = 250 + 25 * Math.cos(rad);
                              const startY = 200 + 25 * Math.sin(rad);
                              const endX = 250 + 150 * Math.cos(rad);
                              const endY = 200 + 150 * Math.sin(rad);
                              
                              return (
                                <g key={angle}>
                                  <line x1={startX} y1={startY} x2={endX} y2={endY} 
                                        stroke="#dc2626" strokeWidth="2" />
                                  {/* Arrowhead */}
                                  <polygon 
                                    points={`${endX},${endY} ${endX - 8*Math.cos(rad) - 4*Math.sin(rad)},${endY - 8*Math.sin(rad) + 4*Math.cos(rad)} ${endX - 8*Math.cos(rad) + 4*Math.sin(rad)},${endY - 8*Math.sin(rad) - 4*Math.cos(rad)}`}
                                    fill="#dc2626"
                                  />
                                </g>
                              );
                            })}
                            
                            <text x="250" y="380" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2d3436">
                              Electric field lines point away from positive charges
                            </text>
                          </>
                        )}
                        
                        {fieldDiagramType === 'single-negative' && (
                          <>
                            {/* Negative charge at center */}
                            <circle cx="250" cy="200" r="20" fill="#2563eb" stroke="#1d4ed8" strokeWidth="3"/>
                            <text x="250" y="208" textAnchor="middle" fontSize="20" fontWeight="bold" fill="white">−</text>
                            
                            {/* Radial field lines pointing inward */}
                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(angle => {
                              const rad = angle * Math.PI / 180;
                              const startX = 250 + 150 * Math.cos(rad);
                              const startY = 200 + 150 * Math.sin(rad);
                              const endX = 250 + 30 * Math.cos(rad);
                              const endY = 200 + 30 * Math.sin(rad);
                              
                              return (
                                <g key={angle}>
                                  <line x1={startX} y1={startY} x2={endX} y2={endY} 
                                        stroke="#2563eb" strokeWidth="2" />
                                  {/* Arrowhead */}
                                  <polygon 
                                    points={`${endX},${endY} ${endX + 8*Math.cos(rad) - 4*Math.sin(rad)},${endY + 8*Math.sin(rad) + 4*Math.cos(rad)} ${endX + 8*Math.cos(rad) + 4*Math.sin(rad)},${endY + 8*Math.sin(rad) - 4*Math.cos(rad)}`}
                                    fill="#2563eb"
                                  />
                                </g>
                              );
                            })}
                            
                            <text x="250" y="380" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2d3436">
                              Electric field lines point toward negative charges
                            </text>
                          </>
                        )}
                        
                        {fieldDiagramType === 'dipole' && (
                          <>
                            {/* Positive charge */}
                            <circle cx="180" cy="200" r="18" fill="#dc2626" stroke="#b91c1c" strokeWidth="3"/>
                            <text x="180" y="207" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">+</text>
                            
                            {/* Negative charge */}
                            <circle cx="320" cy="200" r="18" fill="#2563eb" stroke="#1d4ed8" strokeWidth="3"/>
                            <text x="320" y="207" textAnchor="middle" fontSize="18" fontWeight="bold" fill="white">−</text>
                            
                            {/* Field lines from positive to negative */}
                            {/* Central straight line */}
                            <line x1="198" y1="200" x2="302" y2="200" stroke="#8b5cf6" strokeWidth="2" />
                            <polygon points="302,200 294,196 294,204" fill="#8b5cf6" />
                            
                            {/* Curved field lines */}
                            {[-60, -30, 30, 60].map(startAngle => {
                              const rad = startAngle * Math.PI / 180;
                              return (
                                <g key={startAngle}>
                                  <path 
                                    d={`M ${180 + 22*Math.cos(rad)} ${200 + 22*Math.sin(rad)} 
                                        Q 250 ${200 + 80*Math.sin(rad)} 
                                        ${320 - 22*Math.cos(rad)} ${200 - 22*Math.sin(rad)}`}
                                    fill="none" stroke="#8b5cf6" strokeWidth="2" 
                                  />
                                  {/* Arrowhead near negative charge */}
                                  <polygon 
                                    points={`${320 - 22*Math.cos(rad)},${200 - 22*Math.sin(rad)} ${320 - 22*Math.cos(rad) - 6},${200 - 22*Math.sin(rad) - 4*Math.sign(startAngle)} ${320 - 22*Math.cos(rad) - 6},${200 - 22*Math.sin(rad) + 4*Math.sign(startAngle)}`}
                                    fill="#8b5cf6"
                                  />
                                </g>
                              );
                            })}
                            
                            <text x="250" y="380" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#2d3436">
                              Field lines go from positive to negative charges
                            </text>
                          </>
                        )}
                      </svg>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      The diagrams above show how we draw the field lines around a point charge. Note the direction 
                      of an electric field is away from positive and toward negative.
                    </p>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      As we saw in the examples above, when two or more charges are creating an electric field the 
                      result is the vector sum of the fields from all of the charges. Thus, when we have equal positive 
                      and negative charges the following electric field is produced.
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-3">Summary of Electric Field Lines:</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-3">
                        <span className="text-purple-600 font-bold mt-1">⇒</span>
                        <span className="text-purple-900">
                          Electric field lines are directed away from positive charges and toward negative charges.
                        </span>
                      </li>
                      <li className="flex items-start gap-3">
                        <span className="text-purple-600 font-bold mt-1">⇒</span>
                        <span className="text-purple-900">
                          The number of field lines indicates the strength of the field at that point. Notice in 
                          the diagram above how the field lines are more dense close to each charge and become spread 
                          further apart away from the charges.
                        </span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Important Properties of Field Lines</h4>
                    <ul className="space-y-2 text-sm text-yellow-900">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        Field lines never cross each other (this would mean two different directions at one point)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        Field lines are continuous except at charges
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        The density of field lines represents field strength
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        Field lines begin on positive charges and end on negative charges
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="conductors" title="Conductors and Electric Fields" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      In a conductor, electrons move freely until they reach a state of static equilibrium – i.e. all charges 
                      are at rest and experience no net force.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Interactive: Charge Distribution on Conductors</h4>
                    <p className="text-sm text-green-900 mb-4">
                      Explore how charges distribute on different conductor shapes. Click "Animate" to see charges move to equilibrium:
                    </p>
                    
                    <div className="flex gap-3 mb-4 flex-wrap">
                      <button
                        onClick={() => {setConductorShape('sphere'); setAnimateCharges(false);}}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          conductorShape === 'sphere'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        Sphere
                      </button>
                      <button
                        onClick={() => {setConductorShape('plate'); setAnimateCharges(false);}}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          conductorShape === 'plate'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        Flat Plate
                      </button>
                      <button
                        onClick={() => {setConductorShape('irregular'); setAnimateCharges(false);}}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          conductorShape === 'irregular'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-blue-600 border border-blue-300 hover:bg-blue-50'
                        }`}
                      >
                        Irregular Shape
                      </button>
                      <button
                        onClick={() => setAnimateCharges(true)}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                      >
                        Animate Charges
                      </button>
                    </div>

                    <div className="bg-white border border-green-300 rounded-lg p-4">
                      <svg width="500" height="300" className="mx-auto">
                        {/* Background */}
                        <rect width="500" height="300" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Conductor shape and charges */}
                        {conductorShape === 'sphere' && (
                          <>
                            {/* Sphere outline */}
                            <circle cx="250" cy="150" r="80" fill="none" stroke="#374151" strokeWidth="3"/>
                            <text x="250" y="260" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                              Charged Conducting Sphere
                            </text>
                            
                            {/* Charges on surface */}
                            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((angle, i) => {
                              const rad = angle * Math.PI / 180;
                              const baseRadius = animateCharges ? 40 : 0;
                              const targetRadius = 80;
                              const currentRadius = animateCharges ? targetRadius : baseRadius;
                              const x = 250 + currentRadius * Math.cos(rad);
                              const y = 150 + currentRadius * Math.sin(rad);
                              
                              return (
                                <circle 
                                  key={i}
                                  cx={x} 
                                  cy={y} 
                                  r="4" 
                                  fill="#dc2626"
                                  className={animateCharges ? "transition-all duration-1000" : ""}
                                />
                              );
                            })}
                            
                            {/* Field lines perpendicular to surface */}
                            {animateCharges && [0, 45, 90, 135, 180, 225, 270, 315].map(angle => {
                              const rad = angle * Math.PI / 180;
                              const startX = 250 + 85 * Math.cos(rad);
                              const startY = 150 + 85 * Math.sin(rad);
                              const endX = 250 + 120 * Math.cos(rad);
                              const endY = 150 + 120 * Math.sin(rad);
                              
                              return (
                                <g key={angle}>
                                  <line 
                                    x1={startX} 
                                    y1={startY} 
                                    x2={endX} 
                                    y2={endY} 
                                    stroke="#dc2626" 
                                    strokeWidth="2"
                                    opacity="0"
                                    className="animate-fade-in"
                                    style={{animationDelay: '1s'}}
                                  />
                                  <polygon 
                                    points={`${endX},${endY} ${endX - 6*Math.cos(rad) - 3*Math.sin(rad)},${endY - 6*Math.sin(rad) + 3*Math.cos(rad)} ${endX - 6*Math.cos(rad) + 3*Math.sin(rad)},${endY - 6*Math.sin(rad) - 3*Math.cos(rad)}`}
                                    fill="#dc2626"
                                    opacity="0"
                                    className="animate-fade-in"
                                    style={{animationDelay: '1s'}}
                                  />
                                </g>
                              );
                            })}
                          </>
                        )}
                        
                        {conductorShape === 'plate' && (
                          <>
                            {/* Plate outline */}
                            <rect x="150" y="100" width="200" height="100" fill="none" stroke="#374151" strokeWidth="3"/>
                            <text x="250" y="260" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                              Charged Flat Conducting Plate
                            </text>
                            
                            {/* Charges distributed on surface */}
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => {
                              const x = 170 + i * 18;
                              const y = animateCharges ? 100 : 150;
                              
                              return (
                                <g key={i}>
                                  <circle 
                                    cx={x} 
                                    cy={y} 
                                    r="4" 
                                    fill="#dc2626"
                                    className={animateCharges ? "transition-all duration-1000" : ""}
                                  />
                                  <circle 
                                    cx={x} 
                                    cy={animateCharges ? 200 : 150} 
                                    r="4" 
                                    fill="#dc2626"
                                    className={animateCharges ? "transition-all duration-1000" : ""}
                                  />
                                </g>
                              );
                            })}
                            
                            {/* Field lines perpendicular to surface */}
                            {animateCharges && [0, 1, 2, 3, 4].map(i => {
                              const x = 170 + i * 45;
                              
                              return (
                                <g key={i}>
                                  <line 
                                    x1={x} y1="95" x2={x} y2="65" 
                                    stroke="#dc2626" strokeWidth="2"
                                    opacity="0"
                                    className="animate-fade-in"
                                    style={{animationDelay: '1s'}}
                                  />
                                  <polygon 
                                    points={`${x},65 ${x-3},73 ${x+3},73`}
                                    fill="#dc2626"
                                    opacity="0"
                                    className="animate-fade-in"
                                    style={{animationDelay: '1s'}}
                                  />
                                  <line 
                                    x1={x} y1="205" x2={x} y2="235" 
                                    stroke="#dc2626" strokeWidth="2"
                                    opacity="0"
                                    className="animate-fade-in"
                                    style={{animationDelay: '1s'}}
                                  />
                                  <polygon 
                                    points={`${x},235 ${x-3},227 ${x+3},227`}
                                    fill="#dc2626"
                                    opacity="0"
                                    className="animate-fade-in"
                                    style={{animationDelay: '1s'}}
                                  />
                                </g>
                              );
                            })}
                          </>
                        )}
                        
                        {conductorShape === 'irregular' && (
                          <>
                            {/* Irregular shape (pointed on left, rounded on right) */}
                            <path 
                              d="M 150 150 L 200 120 L 250 110 Q 320 110 350 150 Q 320 190 250 190 L 200 180 Z"
                              fill="none" 
                              stroke="#374151" 
                              strokeWidth="3"
                            />
                            <text x="250" y="260" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#374151">
                              Irregularly Shaped Conductor
                            </text>
                            
                            {/* Charges concentrated at pointed end */}
                            {animateCharges ? (
                              <>
                                {/* More charges at pointed end */}
                                {[0, 1, 2, 3, 4].map(i => (
                                  <circle 
                                    key={`point-${i}`}
                                    cx={155 + i * 8} 
                                    cy={150 - i * 3} 
                                    r="4" 
                                    fill="#dc2626"
                                    className="transition-all duration-1000"
                                  />
                                ))}
                                {/* Fewer charges on rounded end */}
                                {[0, 1, 2].map(i => (
                                  <circle 
                                    key={`round-${i}`}
                                    cx={320 + i * 10} 
                                    cy={150} 
                                    r="4" 
                                    fill="#dc2626"
                                    className="transition-all duration-1000"
                                  />
                                ))}
                                {/* Some charges on top and bottom */}
                                <circle cx="250" cy="110" r="4" fill="#dc2626" className="transition-all duration-1000"/>
                                <circle cx="250" cy="190" r="4" fill="#dc2626" className="transition-all duration-1000"/>
                              </>
                            ) : (
                              /* Initial random distribution */
                              [180, 220, 260, 300, 200, 240].map((x, i) => (
                                <circle 
                                  key={i}
                                  cx={x} 
                                  cy={130 + i * 10} 
                                  r="4" 
                                  fill="#dc2626"
                                />
                              ))
                            )}
                            
                            {/* Labels */}
                            {animateCharges && (
                              <>
                                <text x="150" y="100" fontSize="12" fontWeight="bold" fill="#dc2626">
                                  High density
                                </text>
                                <text x="150" y="115" fontSize="10" fill="#dc2626">
                                  (sharp curve)
                                </text>
                                <text x="330" y="100" fontSize="12" fontWeight="bold" fill="#2563eb">
                                  Low density
                                </text>
                                <text x="330" y="115" fontSize="10" fill="#2563eb">
                                  (gentle curve)
                                </text>
                              </>
                            )}
                          </>
                        )}
                      </svg>
                      
                      <style jsx>{`
                        @keyframes fade-in {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        .animate-fade-in {
                          animation: fade-in 0.5s ease-in forwards;
                        }
                      `}</style>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      For example, when a solid metal sphere is charged, either negatively or positively, all excess charges move as 
                      far apart as possible because of electrostatic forces of repulsion. The result is that excess charges distribute 
                      evenly on the surface of the sphere. The diagram to the right indicates the corresponding electric field lines created by 
                      the distribution of charge on the outer surface of a solid conducting sphere. Note that the electric field lines at the outer surface 
                      are always perpendicular to the outer surface.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-3">Key Principles for Different Conductor Shapes:</h4>
                    <div className="space-y-3">
                      <div>
                        <h5 className="font-medium text-blue-700">Spherical Conductors:</h5>
                        <p className="text-sm text-blue-900">
                          Charges distribute uniformly on the surface. Electric field lines extend perpendicularly outward.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-700">Flat Plates:</h5>
                        <p className="text-sm text-blue-900">
                          Electrostatic forces cause charges to spread evenly along the outer surface. Electric field lines are 
                          uniform and parallel, perpendicular to the surface.
                        </p>
                      </div>
                      <div>
                        <h5 className="font-medium text-blue-700">Irregular Shapes:</h5>
                        <p className="text-sm text-blue-900">
                          Charges accumulate at pointed parts (high curvature). At a pointed part of a convex surface, 
                          the forces are directed at an angle to the surface, allowing charges to accumulate closer together.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Important Rule for Irregular Conductors:</h4>
                    <p className="text-sm text-purple-900">
                      As a rule, the net electrostatic forces cause the charges to accumulate at the points of an irregularly 
                      shaped convex conducting object. Conversely, the charges will spread out on an irregularly shaped concave conducting object. 
                      On irregularly shaped conductors, the charge density and the electric field density is greatest where the surface curves most sharply.
                    </p>
                    <p className="text-xs text-purple-700 mt-2">
                      (Refer to Pearson pages 554 to 559.)
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Note about Electric Field Lines:</h4>
                    <p className="text-sm text-yellow-900">
                      The diagram below shows the electric field lines for two identical positive point charges which are a short 
                      distance apart. Notice how the field lines repel each other in the region between the charges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="fields-within" title="Electric Fields Within Conductors" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Imagine a neutral conductor, solid or hollow, in a field-free region of space. Now suppose we add some electrons 
                      to it, either on the surface or inside. The mutual repulsion between free charges causes them to redistribute. 
                      The charges are initially bunched up, but very quickly they move apart and come to rest on the outer surface. 
                      The process generally only takes a fraction of a second, depending on the physical details of the conductor.
                    </p>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-3">Interactive: Faraday Cage Demonstration</h4>
                    <p className="text-sm text-green-900 mb-4">
                      Explore how a Faraday cage protects its interior from external electric fields:
                    </p>
                    
                    <div className="flex gap-3 mb-4 flex-wrap">
                      <button
                        onClick={() => setFaradayDemo('off')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          faradayDemo === 'off'
                            ? 'bg-gray-500 text-white'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        No External Field
                      </button>
                      <button
                        onClick={() => setFaradayDemo('charging')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          faradayDemo === 'charging'
                            ? 'bg-orange-500 text-white'
                            : 'bg-white text-orange-600 border border-orange-300 hover:bg-orange-50'
                        }`}
                      >
                        Apply External Field
                      </button>
                      <button
                        onClick={() => setFaradayDemo('charged')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          faradayDemo === 'charged'
                            ? 'bg-red-500 text-white'
                            : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
                        }`}
                      >
                        Strong External Field
                      </button>
                      <button
                        onClick={() => setShowPerson(!showPerson)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          showPerson
                            ? 'bg-purple-500 text-white'
                            : 'bg-white text-purple-600 border border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        {showPerson ? 'Hide' : 'Show'} Person Inside
                      </button>
                    </div>

                    <div className="bg-white border border-green-300 rounded-lg p-4">
                      <svg width="500" height="400" className="mx-auto">
                        {/* Background */}
                        <rect width="500" height="400" fill="#f8f9fa" stroke="#e9ecef" strokeWidth="1" rx="4"/>
                        
                        {/* Faraday cage (hollow conductor) */}
                        <rect x="150" y="100" width="200" height="200" fill="none" stroke="#374151" strokeWidth="12" rx="10"/>
                        <rect x="156" y="106" width="188" height="188" fill="#f3f4f6" stroke="none" rx="6"/>
                        
                        {/* Person inside (if shown) */}
                        {showPerson && (
                          <g>
                            {/* Simple stick figure */}
                            <circle cx="250" cy="160" r="15" fill="#8b5cf6" stroke="#7c3aed" strokeWidth="2"/>
                            <line x1="250" y1="175" x2="250" y2="220" stroke="#7c3aed" strokeWidth="3"/>
                            <line x1="250" y1="190" x2="230" y2="205" stroke="#7c3aed" strokeWidth="3"/>
                            <line x1="250" y1="190" x2="270" y2="205" stroke="#7c3aed" strokeWidth="3"/>
                            <line x1="250" y1="220" x2="235" y2="245" stroke="#7c3aed" strokeWidth="3"/>
                            <line x1="250" y1="220" x2="265" y2="245" stroke="#7c3aed" strokeWidth="3"/>
                            
                            {/* Electroscope in hand */}
                            <circle cx="270" cy="205" r="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1"/>
                            <line x1="270" y1="208" x2="270" y2="215" stroke="#f59e0b" strokeWidth="1"/>
                            <line x1="270" y1="215" x2="267" y2="218" stroke="#f59e0b" strokeWidth="1"/>
                            <line x1="270" y1="215" x2="273" y2="218" stroke="#f59e0b" strokeWidth="1"/>
                            
                            <text x="250" y="270" textAnchor="middle" fontSize="12" fill="#7c3aed">
                              No deflection!
                            </text>
                          </g>
                        )}
                        
                        {/* External field lines and charges */}
                        {(faradayDemo === 'charging' || faradayDemo === 'charged') && (
                          <>
                            {/* External field lines */}
                            {[80, 110, 140, 360, 390, 420].map(x => (
                              <g key={x}>
                                <line 
                                  x1={x} y1="50" x2={x} y2="350" 
                                  stroke="#dc2626" 
                                  strokeWidth="2"
                                  strokeDasharray={x < 250 ? "none" : "5,5"}
                                />
                                {/* Arrowheads */}
                                {[100, 200, 300].map(y => (
                                  <polygon 
                                    key={y}
                                    points={`${x},${y} ${x-3},${y-8} ${x+3},${y-8}`}
                                    fill="#dc2626"
                                  />
                                ))}
                              </g>
                            ))}
                            
                            {/* Charges on conductor surface */}
                            {/* Negative charges on left side */}
                            {[0, 1, 2, 3, 4, 5].map(i => (
                              <circle 
                                key={`neg-${i}`}
                                cx="150" 
                                cy={120 + i * 30} 
                                r="5" 
                                fill="#2563eb"
                                className={faradayDemo === 'charged' ? "animate-pulse" : ""}
                              />
                            ))}
                            {/* Positive charges on right side */}
                            {[0, 1, 2, 3, 4, 5].map(i => (
                              <circle 
                                key={`pos-${i}`}
                                cx="350" 
                                cy={120 + i * 30} 
                                r="5" 
                                fill="#dc2626"
                                className={faradayDemo === 'charged' ? "animate-pulse" : ""}
                              />
                            ))}
                            
                            {/* Spark effects for strong field */}
                            {faradayDemo === 'charged' && (
                              <>
                                <path 
                                  d="M 370 150 L 380 140 L 375 145 L 385 135"
                                  stroke="#fbbf24" 
                                  strokeWidth="3" 
                                  fill="none"
                                  className="animate-pulse"
                                />
                                <path 
                                  d="M 365 250 L 375 240 L 370 245 L 380 235"
                                  stroke="#fbbf24" 
                                  strokeWidth="3" 
                                  fill="none"
                                  className="animate-pulse"
                                />
                              </>
                            )}
                          </>
                        )}
                        
                        {/* Labels */}
                        <text x="250" y="30" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#374151">
                          Faraday Cage (Hollow Conductor)
                        </text>
                        
                        {faradayDemo === 'off' && (
                          <text x="250" y="380" textAnchor="middle" fontSize="14" fill="#374151">
                            No external field - charges distribute evenly
                          </text>
                        )}
                        
                        {faradayDemo === 'charging' && (
                          <text x="250" y="380" textAnchor="middle" fontSize="14" fill="#dc2626">
                            External field causes charge separation on surface
                          </text>
                        )}
                        
                        {faradayDemo === 'charged' && (
                          <>
                            <text x="250" y="370" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#dc2626">
                              Strong external field with sparks
                            </text>
                            <text x="250" y="385" textAnchor="middle" fontSize="12" fill="#374151">
                              Interior remains field-free!
                            </text>
                          </>
                        )}
                        
                        {/* Interior field indicator */}
                        <text x="250" y="200" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#059669">
                          E = 0
                        </text>
                        <text x="250" y="215" textAnchor="middle" fontSize="11" fill="#059669">
                          (inside)
                        </text>
                      </svg>
                    </div>
                  </div>

                  <div>
                    <p className="text-gray-700 leading-relaxed">
                      Once settled, the distribution is such that each free charge experiences a zero net force – if it did not, 
                      the charge would accelerate until it could no longer move, and equilibrium would ultimately be established. 
                      If none of the charges experiences a net electric force, none of them is in an electric field. Since electric 
                      field lines either begin or end on charge, the field could only extend inside the conductor if there were a 
                      remaining excess of free charges there and that's impossible.
                    </p>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Key Principle:</h4>
                    <p className="text-sm text-blue-900">
                      The electrostatic field inside a charged conductor, anywhere beneath the surface, is zero – i.e. there are no 
                      electric field lines anywhere inside a hollow conductor. (In the picture to the right note that there is no field 
                      within the circular charged conductor.)
                    </p>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Faraday's Dramatic Demonstration:</h4>
                    <p className="text-sm text-purple-900">
                      Michael Faraday dramatically proved the point by constructing a room within a room, covering the inner enclosure 
                      with tinfoil. He sat inside this Faraday cage, as it has come to be called, with an electroscope at hand, while 
                      the entire structure was charged by an electrostatic generator no field could be detected inside, even while 
                      sparks were flying outside.
                    </p>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Modern Applications:</h4>
                    <ul className="space-y-2 text-sm text-yellow-900">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        Cars act as Faraday cages, protecting occupants from lightning
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        Microwave ovens use Faraday cage principle to contain radiation
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        Sensitive electronic equipment housed in Faraday cages for protection
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600 mt-1">•</span>
                        MRI rooms are Faraday cages to block external radio waves
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : (
        <div>
          {/* Fallback content when AIAccordion is not available */}
          <p className="text-gray-600 p-4 bg-gray-100 rounded">
            This lesson contains interactive content that requires the AI-enhanced accordion feature.
          </p>
        </div>
      )}

      {/* Practice Questions */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="29-electric-fields"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question1',
            title: 'Question 1: Test Charge Concepts'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question2',
            title: 'Question 2: Metal Sphere Field'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question3',
            title: 'Question 3: Field from Force'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question4',
            title: 'Question 4: Force on Different Charge'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question5',
            title: 'Question 5: Point Charge Field'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question6',
            title: 'Question 6: Two Charges Superposition'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question7',
            title: 'Question 7: Electron Acceleration'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question8',
            title: 'Question 8: Square Configuration'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question9',
            title: 'Question 9: Hollow Conductor'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question10',
            title: 'Question 10: Alpha Particle Equilibrium'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_29_question11',
            title: 'Question 11: Earth\'s Electric Charge'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Electric field is the force per unit charge at a point; measured in N/C",
          "Field lines point away from positive charges and toward negative charges",
          "Electric field strength follows inverse square law: E = kq/r²",
          "Multiple charges create fields that add vectorially (superposition principle)",
          "Test charge convention: positive test charge defines field direction",
          "Charges on conductors redistribute to make interior electric field zero",
          "Faraday cages protect interior from external electric fields",
          "Charge density is highest at sharp points on irregular conductors"
        ]}
      />
    </LessonContent>
  );
};

export default ElectricFields;
