import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const Electrostatics = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  
  // Interactive states for historical timeline
  const [selectedHistoricalItem, setSelectedHistoricalItem] = useState(null);
  const [comparisonView, setComparisonView] = useState(false);
  
  // Animation states for amber/lodestone demonstration
  const [isRubbing, setIsRubbing] = useState(false);
  const [showAttraction, setShowAttraction] = useState(false);
  const [attractionType, setAttractionType] = useState('amber'); // 'amber' or 'lodestone'
  
  // States for early ideas section
  const [selectedTheory, setSelectedTheory] = useState('franklin'); // 'franklin' or 'dufay'
  const [fluidAnimation, setFluidAnimation] = useState(false);
  const [selectedObject, setSelectedObject] = useState('neutral'); // 'neutral', 'positive', 'negative'
  
  // States for modern theory section
  const [selectedCharge, setSelectedCharge] = useState('neutral'); // 'neutral', 'positive', 'negative'
  const [conductorType, setConductorType] = useState('conductor'); // 'conductor' or 'insulator'
  const [chargeDistribution, setChargeDistribution] = useState(false);
  
  // States for electroscopes section
  const [electroscopeType, setElectroscopeType] = useState('metal-leaf'); // 'metal-leaf' or 'straw'
  const [electroscopeState, setElectroscopeState] = useState('neutral'); // 'neutral' or 'charged'
  const [chargeLevel, setChargeLevel] = useState(5); // 1-10 scale for demonstration
  
  // States for charging by friction
  const [frictionMaterial1, setFrictionMaterial1] = useState('ebonite');
  const [frictionMaterial2, setFrictionMaterial2] = useState('fur');
  const [showFrictionCharging, setShowFrictionCharging] = useState(false);
  
  // States for induced charge separation
  const [inductionStep, setInductionStep] = useState(1);
  const [pithBallAnimation, setPithBallAnimation] = useState(false);
  
  // States for charging by contact
  const [contactChargeType, setContactChargeType] = useState('negative');
  const [contactAnimation, setContactAnimation] = useState(false);
  const [sphereContact, setSphereContact] = useState(false);
  
  // States for charging by induction
  const [inductionChargeStep, setInductionChargeStep] = useState(1);
  
  // Helper function for material colors
  const getMaterialColor = (material) => {
    const colors = {
      ebonite: '#4b5563',
      glass: '#93c5fd',
      silk: '#c084fc',
      fur: '#8b4513',
      wool: '#d1d5db'
    };
    return colors[material] || '#6b7280';
  };

  return (
    <LessonContent
      lessonId="lesson_25_electrostatics"
      title="Lesson 13 - Electrostatics"
      metadata={{ estimated_time: '45 minutes' }}
    >
      {/* AI-Enhanced Examples and Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="intro" title="Introduction to Electricity and Magnetism" onAskAI={onAIAccordionContent}>
              <p className="text-gray-700 mb-4">
                In lessons 1 to 4 we learned about momentum and the principle of conservation. Now 
                we turn our attention to electricity and magnetism. A carry-over idea which will be used 
                extensively, in fact throughout the course, is the idea of conservation. Conservation of 
                different quantities is one of the most important principles in science.
              </p>
              
              <p className="text-gray-700 mb-4">
                In this lesson we shall discuss the properties of static (not moving) electric charges. In 
                future lessons we will learn about dynamic (moving) electric charges which is called 
                current electricity.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <h4 className="font-semibold text-blue-800 mb-2">Key Concepts Preview:</h4>
                <ul className="text-sm text-blue-900 space-y-1">
                  <li>• <strong>Electrostatics:</strong> Study of stationary electric charges</li>
                  <li>• <strong>Current Electricity:</strong> Study of moving electric charges (coming in future lessons)</li>
                  <li>• <strong>Conservation Principles:</strong> Fundamental ideas that carry over from mechanics</li>
                </ul>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="history" title="Historical Background for Electricity and Magnetism" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Interactive Timeline */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Interactive Historical Timeline</h4>
                  <div className="flex justify-between items-center bg-white p-4 rounded border border-gray-300">
                    <button
                      onClick={() => setSelectedHistoricalItem('amber')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedHistoricalItem === 'amber' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      600 BC - Amber
                    </button>
                    <button
                      onClick={() => setSelectedHistoricalItem('lodestone')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedHistoricalItem === 'lodestone' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Ancient - Lodestone
                    </button>
                    <button
                      onClick={() => setSelectedHistoricalItem('effluvium')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedHistoricalItem === 'effluvium' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Lucretius - Effluvium
                    </button>
                    <button
                      onClick={() => setSelectedHistoricalItem('gilbert')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedHistoricalItem === 'gilbert' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      1600 - Gilbert
                    </button>
                  </div>
                </div>

                {/* Content based on selection */}
                {selectedHistoricalItem === 'amber' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">1) Amber - 600 BC</h5>
                    <p className="text-yellow-900 text-sm mb-3">
                      Amber is a semi-transparent solid (yellow or brown) which is fossilized sap that 
                      oozed from softwood trees in the distant past. In 600 BC, Thales recognized that it 
                      had a property of attraction if rubbed vigorously against a cloth. This is the first 
                      recorded evidence of electrostatic attraction.
                    </p>
                    <p className="text-yellow-900 text-sm italic">
                      The word 'electric' comes from 'electron' which is the Greek word for amber!
                    </p>
                  </div>
                )}

                {selectedHistoricalItem === 'lodestone' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-green-800 mb-2">2) Lodestone - Ancient Times</h5>
                    <p className="text-green-900 text-sm mb-3">
                      Lodestone is a mineral (we call magnetite) that has a chemical formula of Fe₃O₄. It 
                      has the unusual property of attracting iron. When suspended or floated in a liquid it 
                      will always turn to one particular (North-South) orientation. It was used as a 
                      compass by the Vikings and the Chinese.
                    </p>
                  </div>
                )}

                {selectedHistoricalItem === 'effluvium' && (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-purple-800 mb-2">3) Effluvium Theory - Lucretius</h5>
                    <p className="text-purple-900 text-sm mb-3">
                      Lucretius was the first scientist to attempt an explanation of the 
                      attractive properties of both amber and lodestone. He suggested that the amber and 
                      lodestone had an efflux (or flowing out) of minute particles that would capture other 
                      small objects on their way back to the lodestone or amber.
                    </p>
                    <p className="text-purple-900 text-sm">
                      Lucretius did not attempt to distinguish between the type of attraction or take into 
                      account that amber and lodestone did not attract the same materials.
                    </p>
                  </div>
                )}

                {selectedHistoricalItem === 'gilbert' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">4) de Magnete - Sir William Gilbert (1544-1603)</h5>
                    <p className="text-blue-900 text-sm mb-3">
                      Sir William Gilbert was the chief physician to Queen Elizabeth I of England. He was 
                      also a scientist and, since Queen Elizabeth was very healthy, he had lots of time to 
                      work on his scientific ideas. He published his work in a document called "de Magnete" 
                      in the year 1600.
                    </p>
                    <p className="text-blue-900 text-sm mb-3">
                      In de Magnete, Gilbert advanced the idea that the earth had a magnetic field. He 
                      reasoned that if small pieces of lodestone always line up the same way on a larger 
                      piece of lodestone and that they also align themselves in one direction with respect 
                      to the earth, then the earth must be a GIANT lodestone.
                    </p>
                    <p className="text-blue-900 text-sm">
                      Gilbert also introduced the term 'electric' to describe bodies that attract the 
                      way amber does. He was the first scientist to distinguish between electric and 
                      magnetic fields.
                    </p>
                  </div>
                )}

                {/* Default content when nothing selected */}
                {!selectedHistoricalItem && (
                  <p className="text-center text-gray-600 italic mb-4">
                    Click on a timeline item above to explore the history of electricity and magnetism!
                  </p>
                )}

                {/* Interactive Amber vs Lodestone Comparison */}
                <div className="bg-white p-6 rounded border border-gray-300 mt-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">
                    Interactive Demonstration: Amber vs Lodestone
                  </h4>
                  
                  {/* Controls */}
                  <div className="flex justify-center items-center space-x-4 mb-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={attractionType === 'amber'}
                        onChange={() => {
                          setAttractionType('amber');
                          setShowAttraction(false);
                          setIsRubbing(false);
                        }}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">Amber</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        checked={attractionType === 'lodestone'}
                        onChange={() => {
                          setAttractionType('lodestone');
                          setShowAttraction(true);
                          setIsRubbing(false);
                        }}
                        className="form-radio"
                      />
                      <span className="text-sm text-gray-700">Lodestone</span>
                    </label>
                  </div>

                  {attractionType === 'amber' && (
                    <div className="text-center mb-4">
                      <button
                        onMouseDown={() => setIsRubbing(true)}
                        onMouseUp={() => {
                          setIsRubbing(false);
                          setShowAttraction(true);
                          setTimeout(() => setShowAttraction(false), 3000);
                        }}
                        onMouseLeave={() => setIsRubbing(false)}
                        className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                      >
                        {isRubbing ? 'Rubbing...' : 'Rub Amber with Cloth'}
                      </button>
                    </div>
                  )}

                  {/* Animation Canvas */}
                  <div className="flex justify-center">
                    <svg width="400" height="250" viewBox="0 0 400 250" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Amber/Lodestone */}
                      <rect 
                        x="150" 
                        y="100" 
                        width="100" 
                        height="50" 
                        fill={attractionType === 'amber' ? '#fbbf24' : '#6b7280'}
                        stroke={attractionType === 'amber' ? '#f59e0b' : '#4b5563'}
                        strokeWidth="2"
                        rx="5"
                      />
                      <text x="200" y="130" textAnchor="middle" className="text-sm font-semibold fill-white">
                        {attractionType === 'amber' ? 'Amber' : 'Lodestone'}
                      </text>

                      {/* Particles/Objects */}
                      {attractionType === 'amber' && showAttraction && (
                        <>
                          {/* Small particles attracted to amber */}
                          {[
                            {x: 120, y: 80, size: 3},
                            {x: 280, y: 90, size: 4},
                            {x: 130, y: 160, size: 3},
                            {x: 270, y: 170, size: 4},
                            {x: 100, y: 125, size: 3}
                          ].map((particle, i) => (
                            <circle
                              key={i}
                              cx={particle.x}
                              cy={particle.y}
                              r={particle.size}
                              fill="#8b5cf6"
                            >
                              <animate
                                attributeName="cx"
                                to={particle.x < 200 ? 150 : 250}
                                dur="1s"
                                fill="freeze"
                              />
                              <animate
                                attributeName="cy"
                                to="125"
                                dur="1s"
                                fill="freeze"
                              />
                            </circle>
                          ))}
                          <text x="200" y="200" textAnchor="middle" className="text-xs fill-gray-600">
                            Attracts small particles of various materials
                          </text>
                        </>
                      )}

                      {attractionType === 'lodestone' && (
                        <>
                          {/* Iron pieces attracted to lodestone */}
                          <rect 
                            x="80" 
                            y="115" 
                            width="20" 
                            height="20" 
                            fill="#374151"
                            stroke="#1f2937"
                            strokeWidth="1"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="translate"
                              from="0 0"
                              to="50 0"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </rect>
                          <rect 
                            x="300" 
                            y="115" 
                            width="20" 
                            height="20" 
                            fill="#374151"
                            stroke="#1f2937"
                            strokeWidth="1"
                          >
                            <animateTransform
                              attributeName="transform"
                              type="translate"
                              from="0 0"
                              to="-50 0"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </rect>
                          <text x="200" y="200" textAnchor="middle" className="text-xs fill-gray-600">
                            Always attracts iron (no rubbing needed)
                          </text>
                        </>
                      )}

                      {/* Rubbing effect */}
                      {isRubbing && attractionType === 'amber' && (
                        <rect 
                          x="140" 
                          y="90" 
                          width="120" 
                          height="70" 
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="2"
                          strokeDasharray="5,5"
                          opacity="0.7"
                        >
                          <animate
                            attributeName="x"
                            values="140;160;140"
                            dur="0.3s"
                            repeatCount="indefinite"
                          />
                        </rect>
                      )}
                    </svg>
                  </div>
                </div>

                {/* Gilbert's Comparison Table */}
                <div className="mt-6">
                  <button
                    onClick={() => setComparisonView(!comparisonView)}
                    className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 flex items-center justify-between"
                  >
                    <h5 className="font-semibold">Gilbert's Distinction Between Electric and Magnetic Properties</h5>
                    <span className="text-gray-600">{comparisonView ? '▼' : '▶'}</span>
                  </button>

                  {comparisonView && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-300 rounded-lg overflow-hidden">
                        <thead className="bg-gray-100">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Property</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Electric (Amber)</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 border-b">Magnetic (Lodestone)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">Attraction Condition</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Attracts only when rubbed</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Always attracts</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">Materials Attracted</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Attracts small particles of most objects</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Attracts only iron or other ferromagnetic materials</td>
                          </tr>
                          <tr className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">Centers of Attraction</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Attracts from one center of attraction</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Attracts from two centers (poles) of attraction</td>
                          </tr>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-700 font-medium">Repulsion</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Only examples of attraction existed (until 1646 when Sir Thomas Browne found examples of electric repulsion)</td>
                            <td className="px-4 py-3 text-sm text-gray-600">Attraction and repulsion had been observed</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <h5 className="font-semibold text-green-800 mb-2">Historical Significance:</h5>
                  <p className="text-green-900 text-sm">
                    Sir William Gilbert was the first scientist to distinguish between electric and magnetic 
                    fields. His systematic approach to studying these phenomena laid the groundwork for our 
                    modern understanding of electricity and magnetism.
                  </p>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="early-ideas" title="Electrostatics – Early Ideas" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Brief Historical Context */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-3">
                    <strong>Thales (600 BC)</strong> discovered that if substances like amber are rubbed with a piece of
                    cloth, they can pick up little shreds of cloth or other small pieces of matter.
                  </p>
                  <p className="text-gray-700 mb-4">
                    <strong>Gilbert (1600 AD)</strong> showed that many substances can be electrified by rubbing and
                    as a result they can attract small bits of matter.
                  </p>
                </div>

                {/* Theory Selection */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Compare Electric Fluid Theories</h4>
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => setSelectedTheory('franklin')}
                      className={`px-6 py-3 rounded-lg transition-colors ${
                        selectedTheory === 'franklin' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Franklin's One Fluid Theory
                    </button>
                    <button
                      onClick={() => setSelectedTheory('dufay')}
                      className={`px-6 py-3 rounded-lg transition-colors ${
                        selectedTheory === 'dufay' 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Dufay's Two Fluid Theory
                    </button>
                  </div>
                </div>

                {/* Franklin's Theory */}
                {selectedTheory === 'franklin' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                    <h5 className="font-semibold text-blue-800 mb-3">1. Benjamin Franklin's One Fluid Theory (1706-1790)</h5>
                    <p className="text-blue-900 text-sm mb-4">
                      Ben Franklin proposed that substances became charged because of a transfer of electric fluid 
                      when they were rubbed against each other. He reasoned that an excess of the electric fluid 
                      would result in a positive charge, while a lack of the fluid would result in a negative charge. 
                      He also believed that the fluid was composed of tiny (invisible to the eye) particles.
                    </p>

                    {/* Interactive Franklin Model */}
                    <div className="bg-white p-4 rounded border border-blue-300 mt-4">
                      <h6 className="font-medium text-gray-800 mb-3">Interactive Franklin Model</h6>
                      <p className="text-sm text-gray-600 mb-3">Select an object's charge state to see Franklin's one-fluid model:</p>
                      
                      <div className="flex justify-center space-x-4 mb-4">
                        <button
                          onClick={() => setSelectedObject('neutral')}
                          className={`px-3 py-2 text-sm rounded ${
                            selectedObject === 'neutral' 
                              ? 'bg-gray-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Neutral
                        </button>
                        <button
                          onClick={() => setSelectedObject('positive')}
                          className={`px-3 py-2 text-sm rounded ${
                            selectedObject === 'positive' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Positive
                        </button>
                        <button
                          onClick={() => setSelectedObject('negative')}
                          className={`px-3 py-2 text-sm rounded ${
                            selectedObject === 'negative' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Negative
                        </button>
                      </div>

                      <div className="flex justify-center">
                        <svg width="300" height="150" viewBox="0 0 300 150" className="border border-gray-300 bg-gray-50 rounded">
                          {/* Object */}
                          <rect x="125" y="60" width="50" height="30" 
                            fill={selectedObject === 'positive' ? '#fca5a5' : 
                                  selectedObject === 'negative' ? '#a3c5f7' : '#d1d5db'}
                            stroke="#6b7280" strokeWidth="2" rx="5" />
                          <text x="150" y="78" textAnchor="middle" className="text-xs font-semibold fill-gray-700">
                            Object
                          </text>

                          {/* Fluid particles */}
                          {selectedObject === 'neutral' && (
                            // Normal amount of fluid
                            Array.from({length: 8}, (_, i) => (
                              <circle key={i} 
                                cx={130 + (i % 4) * 10} 
                                cy={65 + Math.floor(i / 4) * 10} 
                                r="2" 
                                fill="#3b82f6" 
                              />
                            ))
                          )}
                          {selectedObject === 'positive' && (
                            // Excess fluid
                            Array.from({length: 12}, (_, i) => (
                              <circle key={i} 
                                cx={128 + (i % 4) * 8} 
                                cy={63 + Math.floor(i / 3) * 8} 
                                r="2" 
                                fill="#dc2626" 
                              />
                            ))
                          )}
                          {selectedObject === 'negative' && (
                            // Lack of fluid
                            Array.from({length: 4}, (_, i) => (
                              <circle key={i} 
                                cx={135 + (i % 2) * 15} 
                                cy={68 + Math.floor(i / 2) * 10} 
                                r="2" 
                                fill="#2563eb" 
                              />
                            ))
                          )}

                          {/* Labels */}
                          <text x="150" y="110" textAnchor="middle" className="text-xs fill-gray-600">
                            {selectedObject === 'neutral' && 'Normal amount of electric fluid'}
                            {selectedObject === 'positive' && 'Excess of electric fluid = Positive charge'}
                            {selectedObject === 'negative' && 'Lack of electric fluid = Negative charge'}
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dufay's Theory */}
                {selectedTheory === 'dufay' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                    <h5 className="font-semibold text-green-800 mb-3">2. Dufay's Two Fluid Theory (1700 AD)</h5>
                    <p className="text-green-900 text-sm mb-4">
                      Dufay, a French scientist, proposed that substances were composed of two different types of 
                      electric fluid: a positive fluid and a negative fluid. Neutral objects would contain equal 
                      amounts of each fluid and friction would cause an excess of one or the other fluid to 
                      accumulate on the object.
                    </p>

                    {/* Interactive Dufay Model */}
                    <div className="bg-white p-4 rounded border border-green-300 mt-4">
                      <h6 className="font-medium text-gray-800 mb-3">Interactive Dufay Model</h6>
                      <p className="text-sm text-gray-600 mb-3">Select an object's charge state to see Dufay's two-fluid model:</p>
                      
                      <div className="flex justify-center space-x-4 mb-4">
                        <button
                          onClick={() => setSelectedObject('neutral')}
                          className={`px-3 py-2 text-sm rounded ${
                            selectedObject === 'neutral' 
                              ? 'bg-gray-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Neutral
                        </button>
                        <button
                          onClick={() => setSelectedObject('positive')}
                          className={`px-3 py-2 text-sm rounded ${
                            selectedObject === 'positive' 
                              ? 'bg-red-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Positive
                        </button>
                        <button
                          onClick={() => setSelectedObject('negative')}
                          className={`px-3 py-2 text-sm rounded ${
                            selectedObject === 'negative' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Negative
                        </button>
                      </div>

                      <div className="flex justify-center">
                        <svg width="300" height="150" viewBox="0 0 300 150" className="border border-gray-300 bg-gray-50 rounded">
                          {/* Object */}
                          <rect x="125" y="60" width="50" height="30" 
                            fill={selectedObject === 'positive' ? '#fca5a5' : 
                                  selectedObject === 'negative' ? '#a3c5f7' : '#d1d5db'}
                            stroke="#6b7280" strokeWidth="2" rx="5" />
                          <text x="150" y="78" textAnchor="middle" className="text-xs font-semibold fill-gray-700">
                            Object
                          </text>

                          {/* Two types of fluid */}
                          {selectedObject === 'neutral' && (
                            <>
                              {/* Equal amounts of both fluids */}
                              {Array.from({length: 6}, (_, i) => (
                                <circle key={`pos-${i}`} 
                                  cx={130 + (i % 3) * 12} 
                                  cy={65} 
                                  r="2" 
                                  fill="#dc2626" 
                                />
                              ))}
                              {Array.from({length: 6}, (_, i) => (
                                <circle key={`neg-${i}`} 
                                  cx={130 + (i % 3) * 12} 
                                  cy={80} 
                                  r="2" 
                                  fill="#2563eb" 
                                />
                              ))}
                            </>
                          )}
                          {selectedObject === 'positive' && (
                            <>
                              {/* Excess positive fluid */}
                              {Array.from({length: 10}, (_, i) => (
                                <circle key={`pos-${i}`} 
                                  cx={128 + (i % 5) * 8} 
                                  cy={63 + Math.floor(i / 5) * 12} 
                                  r="2" 
                                  fill="#dc2626" 
                                />
                              ))}
                              {/* Less negative fluid */}
                              {Array.from({length: 3}, (_, i) => (
                                <circle key={`neg-${i}`} 
                                  cx={135 + i * 10} 
                                  cy={85} 
                                  r="2" 
                                  fill="#2563eb" 
                                />
                              ))}
                            </>
                          )}
                          {selectedObject === 'negative' && (
                            <>
                              {/* Less positive fluid */}
                              {Array.from({length: 3}, (_, i) => (
                                <circle key={`pos-${i}`} 
                                  cx={135 + i * 10} 
                                  cy={65} 
                                  r="2" 
                                  fill="#dc2626" 
                                />
                              ))}
                              {/* Excess negative fluid */}
                              {Array.from({length: 10}, (_, i) => (
                                <circle key={`neg-${i}`} 
                                  cx={128 + (i % 5) * 8} 
                                  cy={75 + Math.floor(i / 5) * 12} 
                                  r="2" 
                                  fill="#2563eb" 
                                />
                              ))}
                            </>
                          )}

                          {/* Legend */}
                          <circle cx="50" cy="120" r="3" fill="#dc2626" />
                          <text x="60" y="125" className="text-xs fill-gray-600">Positive fluid</text>
                          <circle cx="150" cy="120" r="3" fill="#2563eb" />
                          <text x="160" y="125" className="text-xs fill-gray-600">Negative fluid</text>

                          {/* Description */}
                          <text x="150" y="140" textAnchor="middle" className="text-xs fill-gray-600">
                            {selectedObject === 'neutral' && 'Equal amounts of both fluids'}
                            {selectedObject === 'positive' && 'Excess positive fluid'}
                            {selectedObject === 'negative' && 'Excess negative fluid'}
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Theory Comparison and Historical Context */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h5 className="font-semibold text-yellow-800 mb-3">Historical Context and Scientific Development</h5>
                  <p className="text-yellow-900 text-sm mb-3">
                    It is interesting to note that at the time of Franklin and Dufay, scientists like 
                    Lagrange, Euler and Bernoulli were developing theories about fluid flow, 
                    pressure/force relations, and hydraulics. Their theories were so successful it 
                    seemed a logical step to extend the theories into explaining electricity and magnetism.
                  </p>
                  <p className="text-yellow-900 text-sm">
                    However, the later work of Faraday, Henry and others tended to support theories 
                    based on the motions of particles rather than fluids.
                  </p>
                </div>

              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="modern-theory" title="Electrostatics – Modern Theory" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction to Modern Theory */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    <strong>Refer to Pearson pages 512 to 515.</strong>
                  </p>
                  <p className="text-gray-700 mb-4">
                    Today we find that both one fluid and two fluid theory models had merits. Today, we 
                    consider that all matter is composed of atoms and, in turn, the building blocks for each 
                    atom are protons and neutrons within the nucleus and electrons outside of the nucleus. 
                    Protons are positive, electrons are negative and neutral objects have equal amounts of 
                    each. In that sense, Dufay was correct. However, only electrons are transferred in the 
                    process of rubbing, so in that sense Franklin was correct.
                  </p>
                </div>

                {/* Interactive Atomic Model */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Atomic Model</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Explore how both theories were partially correct in the modern atomic understanding
                  </p>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => setSelectedCharge('neutral')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedCharge === 'neutral' 
                          ? 'bg-gray-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Neutral Atom
                    </button>
                    <button
                      onClick={() => setSelectedCharge('positive')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedCharge === 'positive' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Positive Ion
                    </button>
                    <button
                      onClick={() => setSelectedCharge('negative')}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedCharge === 'negative' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Negative Ion
                    </button>
                  </div>

                  <div className="flex justify-center">
                    <svg width="400" height="250" viewBox="0 0 400 250" className="border border-gray-300 bg-gray-50 rounded">
                      {/* Nucleus */}
                      <circle cx="200" cy="125" r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                      
                      {/* Protons in nucleus */}
                      {Array.from({length: 6}, (_, i) => {
                        const angle = (i / 6) * 2 * Math.PI;
                        const x = 200 + 8 * Math.cos(angle);
                        const y = 125 + 8 * Math.sin(angle);
                        return (
                          <circle key={`proton-${i}`} cx={x} cy={y} r="3" fill="#dc2626" stroke="#b91c1c" strokeWidth="1" />
                        );
                      })}
                      
                      {/* Neutrons in nucleus */}
                      {Array.from({length: 6}, (_, i) => {
                        const angle = (i / 6) * 2 * Math.PI + Math.PI/6;
                        const x = 200 + 12 * Math.cos(angle);
                        const y = 125 + 12 * Math.sin(angle);
                        return (
                          <circle key={`neutron-${i}`} cx={x} cy={y} r="3" fill="#6b7280" stroke="#4b5563" strokeWidth="1" />
                        );
                      })}

                      {/* Electron orbits */}
                      <circle cx="200" cy="125" r="60" fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />
                      <circle cx="200" cy="125" r="90" fill="none" stroke="#d1d5db" strokeWidth="1" strokeDasharray="2,2" opacity="0.5" />

                      {/* Electrons based on charge state */}
                      {selectedCharge === 'neutral' && (
                        <>
                          {/* 6 electrons for neutral atom */}
                          {Array.from({length: 6}, (_, i) => {
                            const angle = (i / 6) * 2 * Math.PI;
                            const radius = i < 3 ? 60 : 90;
                            const x = 200 + radius * Math.cos(angle);
                            const y = 125 + radius * Math.sin(angle);
                            return (
                              <circle key={`electron-${i}`} cx={x} cy={y} r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                            );
                          })}
                        </>
                      )}
                      
                      {selectedCharge === 'positive' && (
                        <>
                          {/* 4 electrons for positive ion (lost 2 electrons) */}
                          {Array.from({length: 4}, (_, i) => {
                            const angle = (i / 4) * 2 * Math.PI;
                            const radius = i < 2 ? 60 : 90;
                            const x = 200 + radius * Math.cos(angle);
                            const y = 125 + radius * Math.sin(angle);
                            return (
                              <circle key={`electron-${i}`} cx={x} cy={y} r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                            );
                          })}
                          
                          {/* Show lost electrons moving away */}
                          <circle cx="320" cy="100" r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" opacity="0.5" />
                          <circle cx="340" cy="120" r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" opacity="0.5" />
                          <text x="350" y="110" className="text-xs fill-gray-600">Lost electrons</text>
                        </>
                      )}
                      
                      {selectedCharge === 'negative' && (
                        <>
                          {/* 8 electrons for negative ion (gained 2 electrons) */}
                          {Array.from({length: 8}, (_, i) => {
                            const angle = (i / 8) * 2 * Math.PI;
                            const radius = i < 4 ? 60 : 90;
                            const x = 200 + radius * Math.cos(angle);
                            const y = 125 + radius * Math.sin(angle);
                            return (
                              <circle key={`electron-${i}`} cx={x} cy={y} r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                            );
                          })}
                          
                          {/* Show gained electrons */}
                          <text x="50" y="110" className="text-xs fill-gray-600">Gained electrons</text>
                          <path d="M 80 115 Q 150 80 180 100" fill="none" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arrowhead)" opacity="0.5" />
                        </>
                      )}

                      {/* Labels */}
                      <text x="200" y="170" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
                        {selectedCharge === 'neutral' && 'Neutral Atom: 6 protons = 6 electrons'}
                        {selectedCharge === 'positive' && 'Positive Ion: 6 protons > 4 electrons'}
                        {selectedCharge === 'negative' && 'Negative Ion: 6 protons < 8 electrons'}
                      </text>

                      {/* Legend */}
                      <g transform="translate(20, 190)">
                        <circle cx="8" cy="8" r="3" fill="#dc2626" />
                        <text x="18" y="12" className="text-xs fill-gray-700">Proton (+)</text>
                        
                        <circle cx="8" cy="25" r="3" fill="#6b7280" />
                        <text x="18" y="29" className="text-xs fill-gray-700">Neutron (0)</text>
                        
                        <circle cx="8" cy="42" r="4" fill="#2563eb" />
                        <text x="18" y="46" className="text-xs fill-gray-700">Electron (-)</text>
                      </g>

                      <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                        </marker>
                      </defs>
                    </svg>
                  </div>

                  <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Modern Understanding:</h5>
                    <ul className="text-sm text-purple-900 space-y-1">
                      <li>• <strong>Dufay was right:</strong> Two types of charge exist (positive protons, negative electrons)</li>
                      <li>• <strong>Franklin was right:</strong> Only electrons move during charging (protons stay in nucleus)</li>
                      <li>• <strong>Charge transfer:</strong> Objects become charged by gaining or losing electrons, not protons</li>
                      <li>• <strong>Conservation:</strong> Total charge remains constant - electrons are transferred, not created/destroyed</li>
                    </ul>
                  </div>
                </div>

                {/* Law of Charges */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-blue-800 mb-3">Law of Charges</h4>
                  <div className="text-center mb-4">
                    <p className="text-lg font-bold text-blue-900">Like charges repel and unlike charges attract.</p>
                  </div>
                  
                  {/* Interactive charge demonstration */}
                  <div className="bg-white p-4 rounded border border-blue-300">
                    <div className="flex justify-center space-x-8">
                      {/* Like charges repel */}
                      <div className="text-center">
                        <div className="flex justify-center items-center space-x-4 mb-2">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">+</div>
                          <span className="text-red-600 font-bold">←→</span>
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">+</div>
                        </div>
                        <p className="text-xs text-gray-700">Like charges repel</p>
                      </div>
                      
                      {/* Unlike charges attract */}
                      <div className="text-center">
                        <div className="flex justify-center items-center space-x-4 mb-2">
                          <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">+</div>
                          <span className="text-green-600 font-bold">→←</span>
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">−</div>
                        </div>
                        <p className="text-xs text-gray-700">Unlike charges attract</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Conservation of Charge */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-green-800 mb-3">Conservation of Charge</h4>
                  <p className="text-green-900 text-sm mb-4">
                    When a neutral rubber rod is rubbed with a neutral piece of fur, the negative charge 
                    produced on the rod is numerically the same as the positive charge produced on the fur. 
                    The rod gained as many electrons as the fur lost. The net charge before rubbing the 
                    two together was zero and the net charge after adding the rubber to the fur will also be 
                    zero. In this closed system the net charge stays the same or, in other words, charge is 
                    conserved.
                  </p>
                  
                  {/* Conservation demonstration */}
                  <div className="bg-white p-4 rounded border border-green-300">
                    <div className="text-center">
                      <div className="flex justify-center items-center space-x-8 mb-4">
                        {/* Before */}
                        <div className="text-center">
                          <p className="font-semibold text-sm mb-2">BEFORE</p>
                          <div className="flex space-x-4">
                            <div className="border-2 border-gray-400 rounded-lg p-2">
                              <div className="text-xs text-gray-700">Rubber Rod</div>
                              <div className="text-lg font-bold text-gray-700">0</div>
                            </div>
                            <div className="border-2 border-gray-400 rounded-lg p-2">
                              <div className="text-xs text-gray-700">Fur</div>
                              <div className="text-lg font-bold text-gray-700">0</div>
                            </div>
                          </div>
                          <p className="text-xs mt-1">Total: 0</p>
                        </div>
                        
                        <div className="text-2xl">→</div>
                        
                        {/* After */}
                        <div className="text-center">
                          <p className="font-semibold text-sm mb-2">AFTER</p>
                          <div className="flex space-x-4">
                            <div className="border-2 border-blue-400 rounded-lg p-2 bg-blue-50">
                              <div className="text-xs text-blue-700">Rubber Rod</div>
                              <div className="text-lg font-bold text-blue-700">−Q</div>
                            </div>
                            <div className="border-2 border-red-400 rounded-lg p-2 bg-red-50">
                              <div className="text-xs text-red-700">Fur</div>
                              <div className="text-lg font-bold text-red-700">+Q</div>
                            </div>
                          </div>
                          <p className="text-xs mt-1">Total: −Q + Q = 0</p>
                        </div>
                      </div>
                      <p className="text-sm text-green-800 font-medium">Charge is conserved: Total charge before = Total charge after</p>
                    </div>
                  </div>
                </div>

                {/* Measuring Charge */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-3">Measuring Charge</h4>
                  <div className="space-y-3 text-yellow-900 text-sm">
                    <p>The unit for charge is the <strong>Coulomb (C)</strong> and the symbol for charge is <strong>q</strong>.</p>
                    
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <p className="mb-2">A Coulomb (C) of positive charge is equal to the combined charge of:</p>
                      <div className="text-center">
                        <InlineMath math="6.25 \times 10^{18} \text{ protons}" />
                      </div>
                    </div>
                    
                    <p>Since a proton cancels an electron, a Coulomb of negative charge is equal to the combined charge of 6.25 × 10¹⁸ electrons.</p>
                    
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="text-center">
                          <p className="text-xs mb-1">Charge on one electron:</p>
                          <InlineMath math="q_e = -1.60 \times 10^{-19} \text{ C}" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs mb-1">Charge on one proton:</p>
                          <InlineMath math="q_p = +1.60 \times 10^{-19} \text{ C}" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-purple-800 text-sm">
                        <strong>Elementary Charge:</strong> The number 1.60 × 10⁻¹⁹ is called the elementary charge. 
                        This is the smallest unit of charge that exists in the large-scale universe. All charges on 
                        objects are, in reality, whole number multiples of this number.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Electrons Move, Protons Do Not */}
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-red-800 mb-3">Electrons Move, Protons Do Not Move</h4>
                  <p className="text-red-900 text-sm mb-4">
                    Protons exist within the nuclei of atoms, while electrons exist around the nuclei of 
                    atoms. Although they have the same amount of charge, protons are 1800 times more 
                    massive than electrons. Therefore, with far less inertia, electrons are far more 
                    responsive to electrical influences than are protons.
                  </p>
                  
                  <div className="bg-white p-4 rounded border border-red-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-700 mb-2">Protons</div>
                        <ul className="text-xs text-red-800 space-y-1">
                          <li>• Located in nucleus</li>
                          <li>• 1800× more massive</li>
                          <li>• Strongly bound</li>
                          <li>• Do NOT move during charging</li>
                        </ul>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-700 mb-2">Electrons</div>
                        <ul className="text-xs text-blue-800 space-y-1">
                          <li>• Located around nucleus</li>
                          <li>• Much lighter</li>
                          <li>• Weakly bound (outer electrons)</li>
                          <li>• MOVE during charging</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distribution of Charges - Conductors vs Insulators */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Distribution of Charges</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    All substances will allow electric charges to flow over or through them with different 
                    degrees of ease. <strong>Conductors</strong> are materials which allow electricity to flow easily 
                    through them (metals, ionic solutions, etc.) <strong>Insulators</strong> do not allow electricity to flow 
                    very easily (wood, plastics, glass, etc.) The terms conductor and insulator are relative, 
                    since some metals are better conductors than others and some materials insulate better 
                    than others.
                  </p>

                  {/* Interactive conductor/insulator demonstration */}
                  <div className="mb-4">
                    <div className="flex justify-center space-x-4 mb-4">
                      <button
                        onClick={() => setConductorType('conductor')}
                        className={`px-4 py-2 rounded transition-colors ${
                          conductorType === 'conductor' 
                            ? 'bg-yellow-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Conductor (Metal)
                      </button>
                      <button
                        onClick={() => setConductorType('insulator')}
                        className={`px-4 py-2 rounded transition-colors ${
                          conductorType === 'insulator' 
                            ? 'bg-brown-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                        style={{ backgroundColor: conductorType === 'insulator' ? '#8b4513' : undefined }}
                      >
                        Insulator (Plastic)
                      </button>
                    </div>

                    <div className="flex justify-center">
                      <svg width="500" height="200" viewBox="0 0 500 200" className="border border-gray-300 bg-gray-50 rounded">
                        {/* Object */}
                        <rect 
                          x="150" 
                          y="75" 
                          width="200" 
                          height="50" 
                          fill={conductorType === 'conductor' ? '#fbbf24' : '#8b4513'} 
                          stroke={conductorType === 'conductor' ? '#f59e0b' : '#7c3f00'} 
                          strokeWidth="2" 
                          rx="5" 
                        />
                        <text x="250" y="105" textAnchor="middle" className="text-sm font-semibold fill-white">
                          {conductorType === 'conductor' ? 'Metal Sphere' : 'Plastic Rod'}
                        </text>

                        {/* Negative charges */}
                        {conductorType === 'conductor' ? (
                          // Conductor: charges spread to surface, as far apart as possible
                          <>
                            {Array.from({length: 8}, (_, i) => {
                              // Distribute around perimeter
                              const angle = (i / 8) * 2 * Math.PI;
                              const radiusX = 105; // ellipse width
                              const radiusY = 30;  // ellipse height
                              const x = 250 + radiusX * Math.cos(angle);
                              const y = 100 + radiusY * Math.sin(angle);
                              return (
                                <circle key={`charge-${i}`} cx={x} cy={y} r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                              );
                            })}
                            <text x="250" y="160" textAnchor="middle" className="text-xs fill-gray-600">
                              Charges spread out on surface, repel each other
                            </text>
                          </>
                        ) : (
                          // Insulator: charges stay where placed
                          <>
                            {Array.from({length: 8}, (_, i) => {
                              // Concentrate at one end
                              const x = 160 + (i % 2) * 8;
                              const y = 85 + Math.floor(i / 2) * 8;
                              return (
                                <circle key={`charge-${i}`} cx={x} cy={y} r="4" fill="#2563eb" stroke="#1d4ed8" strokeWidth="1" />
                              );
                            })}
                            <text x="250" y="160" textAnchor="middle" className="text-xs fill-gray-600">
                              Charges stay where placed, cannot move freely
                            </text>
                          </>
                        )}

                        {/* Labels */}
                        <text x="50" y="30" className="text-sm font-semibold fill-gray-800">
                          {conductorType === 'conductor' ? 'CONDUCTOR:' : 'INSULATOR:'}
                        </text>
                        <text x="50" y="50" className="text-xs fill-gray-700">
                          {conductorType === 'conductor' 
                            ? 'Free electrons move easily' 
                            : 'Electrons bound to atoms'
                          }
                        </text>
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <h5 className="font-semibold text-yellow-800 mb-2">Conductors</h5>
                      <ul className="text-xs text-yellow-900 space-y-1">
                        <li>• Electrons are free to move</li>
                        <li>• Charges spread out as far as possible</li>
                        <li>• Like charges repel each other</li>
                        <li>• Examples: metals, salt water</li>
                      </ul>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <h5 className="font-semibold text-orange-800 mb-2">Insulators</h5>
                      <ul className="text-xs text-orange-900 space-y-1">
                        <li>• Electrons forced to stay in place</li>
                        <li>• Charges cannot move freely</li>
                        <li>• Stay where they are placed</li>
                        <li>• Examples: plastic, glass, rubber</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Finding Charge from Number of Electrons" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the charge on an object that has 750 excess electrons on its surface?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Number of excess electrons = 750 e</li>
                        <li>Charge on one electron: <InlineMath math="q_e = -1.60 \times 10^{-19} \text{ C}" /></li>
                        <li>q = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Formula:</span>
                      <p className="text-sm text-gray-600 mt-1">Total charge = number of electrons × charge per electron</p>
                      <div className="my-3">
                        <BlockMath math="q = n \times q_e" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substituting values:</span>
                      <div className="my-3">
                        <BlockMath math="q = 750e \times (-1.60 \times 10^{-19} \text{ C})" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="q = 750 \times (-1.60 \times 10^{-19})" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="q = -1200 \times 10^{-19} \text{ C}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="q = -1.20 \times 10^{-16} \text{ C}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The charge on the object is <span className="font-bold">-1.20 × 10⁻¹⁶ C</span>
                    </p>
                    
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> The negative sign indicates that the object has a negative charge due 
                        to the excess electrons. If the object had a deficit of electrons (excess protons), 
                        the charge would be positive.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="electroscopes" title="Electroscopes" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    An electroscope is an instrument that will indicate the presence of a charge. 
                    There are different types of electroscopes, each working on the principle that 
                    like charges repel one another.
                  </p>
                </div>

                {/* Interactive Electroscope Demonstration */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Electroscope Demonstration</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Explore different types of electroscopes and how they respond to charge
                  </p>
                  
                  {/* Controls */}
                  <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Type:</label>
                      <select 
                        value={electroscopeType}
                        onChange={(e) => setElectroscopeType(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm w-36"
                      >
                        <option value="metal-leaf">Metal Leaf</option>
                        <option value="straw">Tin Foil Straw</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">State:</label>
                      <select 
                        value={electroscopeState}
                        onChange={(e) => setElectroscopeState(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm w-28"
                      >
                        <option value="neutral">Neutral</option>
                        <option value="charged">Charged</option>
                      </select>
                    </div>
                    
                    {electroscopeState === 'charged' && (
                      <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium text-gray-700">Charge Level:</label>
                        <input
                          type="range"
                          min="1"
                          max="10"
                          value={chargeLevel}
                          onChange={(e) => setChargeLevel(parseInt(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">{chargeLevel}/10</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Electroscope Visualization */}
                  <div className="flex justify-center">
                    <svg width="400" height="350" viewBox="0 0 400 350" className="border border-gray-300 bg-gray-50 rounded">
                      {electroscopeType === 'metal-leaf' ? (
                        <>
                          {/* Metal Leaf Electroscope */}
                          {/* Glass box */}
                          <rect x="150" y="150" width="100" height="120" fill="none" stroke="#93c5fd" strokeWidth="2" rx="5" />
                          <text x="260" y="210" className="text-xs fill-gray-600">Glass Box</text>
                          
                          {/* Rubber stopper */}
                          <rect x="170" y="140" width="60" height="20" fill="#8b4513" stroke="#7c3f00" strokeWidth="1" rx="3" />
                          <text x="240" y="155" className="text-xs fill-gray-600">Rubber Stopper</text>
                          
                          {/* Metallic knob */}
                          <circle cx="200" cy="120" r="15" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                          <text x="220" y="125" className="text-xs fill-gray-600">Metal Knob</text>
                          
                          {/* Metal stem */}
                          <rect x="198" y="135" width="4" height="60" fill="#6b7280" />
                          
                          {/* Metal foil leaves */}
                          {electroscopeState === 'neutral' ? (
                            <>
                              {/* Leaves hanging straight down */}
                              <rect x="194" y="195" width="3" height="30" fill="#fbbf24" />
                              <rect x="203" y="195" width="3" height="30" fill="#fbbf24" />
                              <text x="200" y="250" textAnchor="middle" className="text-xs fill-gray-600">Leaves hang straight</text>
                            </>
                          ) : (
                            <>
                              {/* Leaves repelling based on charge level */}
                              {(() => {
                                const angle = Math.min(chargeLevel * 4, 35); // Max 35 degrees
                                const leftAngle = -angle;
                                const rightAngle = angle;
                                
                                return (
                                  <>
                                    <g transform={`translate(200, 195) rotate(${leftAngle})`}>
                                      <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                                    </g>
                                    <g transform={`translate(200, 195) rotate(${rightAngle})`}>
                                      <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                                    </g>
                                    <text x="200" y="250" textAnchor="middle" className="text-xs fill-gray-600">
                                      Leaves repel (angle: {angle}°)
                                    </text>
                                  </>
                                );
                              })()}
                            </>
                          )}
                          
                          {/* Labels */}
                          <text x="200" y="290" textAnchor="middle" className="text-sm font-semibold fill-gray-800">Metal Leaf Electroscope</text>
                        </>
                      ) : (
                        <>
                          {/* Tin Foil Straw Electroscope */}
                          {/* Support column */}
                          <rect x="198" y="100" width="4" height="100" fill="#6b7280" />
                          <text x="220" y="120" className="text-xs fill-gray-600">Support Column</text>
                          
                          {/* Pivot point */}
                          <circle cx="200" cy="150" r="3" fill="#374151" />
                          <text x="220" y="155" className="text-xs fill-gray-600">Pivot Point</text>
                          
                          {/* Straw */}
                          {electroscopeState === 'neutral' ? (
                            <>
                              {/* Straw hanging straight down */}
                              <rect x="198" y="150" width="4" height="60" fill="#fbbf24" />
                              <text x="200" y="230" textAnchor="middle" className="text-xs fill-gray-600">Straw hangs straight</text>
                            </>
                          ) : (
                            <>
                              {/* Straw deflected based on charge level */}
                              {(() => {
                                const angle = Math.min(chargeLevel * 6, 50); // Max 50 degrees
                                
                                return (
                                  <>
                                    <g transform={`translate(200, 150) rotate(${angle})`}>
                                      <rect x="-2" y="0" width="4" height="60" fill="#fbbf24" />
                                    </g>
                                    <text x="200" y="230" textAnchor="middle" className="text-xs fill-gray-600">
                                      Straw deflected (angle: {angle}°)
                                    </text>
                                  </>
                                );
                              })()}
                            </>
                          )}
                          
                          {/* Base */}
                          <rect x="180" y="200" width="40" height="10" fill="#8b7355" rx="2" />
                          
                          {/* Labels */}
                          <text x="200" y="250" textAnchor="middle" className="text-sm font-semibold fill-gray-800">Tin Foil Straw Electroscope</text>
                        </>
                      )}
                      
                      {/* Charge indicators */}
                      {electroscopeState === 'charged' && (
                        <g transform="translate(20, 20)">
                          <rect x="0" y="0" width="120" height="40" fill="white" stroke="#d1d5db" strokeWidth="1" rx="5" opacity="0.9" />
                          <text x="10" y="20" className="text-sm font-semibold fill-gray-800">Charge Present!</text>
                          <text x="10" y="35" className="text-xs fill-gray-600">Level: {chargeLevel}/10</text>
                        </g>
                      )}
                    </svg>
                  </div>
                  
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-3">Important Notes:</h4>
                  <div className="space-y-3 text-yellow-900 text-sm">
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-700 font-bold">⇒</span>
                      <p>
                        Both types of electroscopes will <strong>indicate the presence of charge</strong> but neither will give 
                        an exact reading of the amount of charge.
                      </p>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-yellow-700 font-bold">⇒</span>
                      <p>
                        You <strong>cannot tell whether the charge is positive or negative</strong> by just looking at an 
                        electroscope. A negatively charged electroscope will look identical to a positively 
                        charged electroscope. However, they will respond differently when a charged object 
                        is brought close to a charged electroscope.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Working Principle */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">How Electroscopes Work</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Neutral State */}
                    <div className="text-center">
                      <div className="bg-gray-100 p-4 rounded-lg mb-3">
                        <h5 className="font-semibold text-gray-800 mb-2">Neutral Electroscope</h5>
                        <div className="flex justify-center">
                          <svg width="150" height="100" viewBox="0 0 150 100" className="border border-gray-300 bg-white rounded">
                            {/* Simple neutral representation */}
                            <rect x="70" y="20" width="10" height="40" fill="#6b7280" />
                            <rect x="67" y="60" width="6" height="25" fill="#fbbf24" />
                            <rect x="77" y="60" width="6" height="25" fill="#fbbf24" />
                            <text x="75" y="95" textAnchor="middle" className="text-xs fill-gray-600">No deflection</text>
                          </svg>
                        </div>
                        <ul className="text-xs text-gray-700 space-y-1 mt-2">
                          <li>• Equal + and - charges</li>
                          <li>• No net charge</li>
                          <li>• No repulsion</li>
                        </ul>
                      </div>
                    </div>
                    
                    {/* Charged State */}
                    <div className="text-center">
                      <div className="bg-red-100 p-4 rounded-lg mb-3">
                        <h5 className="font-semibold text-red-800 mb-2">Charged Electroscope</h5>
                        <div className="flex justify-center">
                          <svg width="150" height="100" viewBox="0 0 150 100" className="border border-gray-300 bg-white rounded">
                            {/* Simple charged representation */}
                            <rect x="70" y="20" width="10" height="40" fill="#6b7280" />
                            <g transform="translate(75, 60) rotate(-20)">
                              <rect x="-3" y="0" width="6" height="25" fill="#fbbf24" />
                            </g>
                            <g transform="translate(75, 60) rotate(20)">
                              <rect x="-3" y="0" width="6" height="25" fill="#fbbf24" />
                            </g>
                            <text x="75" y="95" textAnchor="middle" className="text-xs fill-gray-600">Deflection</text>
                          </svg>
                        </div>
                        <ul className="text-xs text-red-800 space-y-1 mt-2">
                          <li>• Same charge on both leaves</li>
                          <li>• Like charges repel</li>
                          <li>• Leaves spread apart</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <p className="text-sm text-purple-800">
                      <strong>Principle:</strong> When charge is applied to the electroscope, it distributes throughout 
                      the conducting parts. The leaves (or straw) acquire the same type of charge and repel each other 
                      due to the fundamental law that like charges repel.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="charging-friction" title="Charging Objects by Friction" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    <strong>Refer to Pearson pages 517 to 523.</strong>
                  </p>
                  <p className="text-gray-700 mb-4">
                    Some substances acquire an electric charge when rubbed with another substance. For example, an 
                    ebonite rod becomes negatively charged when rubbed with fur. We can explain this phenomenon with the 
                    help of the model of the electrical structure of matter. An atom holds on to its electrons by the force of electric 
                    attraction to its positively charged nucleus. Some atoms or combinations of atoms exert stronger 
                    forces of attraction on their electrons than others. When ebonite and fur are rubbed together, work is done on the 
                    electrons. Some of the electrons from the fur are "captured" by the atoms of the ebonite, which exert 
                    stronger forces of attraction on them than do the atoms making up the fur. Thus, after rubbing, the ebonite 
                    has an excess of electrons (– charge) and the fur has a deficit (+ charge).
                  </p>
                  <p className="text-gray-700 mb-4">
                    The same explanation holds for many other pairs of substances, such as glass and silk.
                  </p>
                </div>

                {/* Electrostatic Series */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">The Electrostatic Series</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    The electrostatic series table below lists many of the substances that can be charged by 
                    friction. If two substances in the table are rubbed together, the substance that is higher 
                    in the table becomes negatively charged, while the other substance becomes positively 
                    charged.
                  </p>
                  
                  <div className="flex justify-center">
                    <div className="bg-gradient-to-b from-blue-100 to-red-100 p-6 rounded-lg border-2 border-gray-400">
                      <div className="text-center mb-4">
                        <div className="text-2xl font-bold text-blue-600 mb-2">−</div>
                        <div className="text-sm text-gray-700">hold on to electrons tightly</div>
                      </div>
                      
                      <div className="space-y-2 mb-4">
                        {[
                          'sulphur',
                          'brass',
                          'copper',
                          'ebonite',
                          'paraffin wax',
                          'silk',
                          'lead',
                          'fur',
                          'wool',
                          'glass'
                        ].map((material, index) => (
                          <div 
                            key={material}
                            className={`px-4 py-2 text-center font-medium rounded ${
                              index < 5 ? 'bg-blue-200 text-blue-800' : 'bg-red-200 text-red-800'
                            }`}
                          >
                            {material}
                          </div>
                        ))}
                      </div>
                      
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600 mb-2">+</div>
                        <div className="text-sm text-gray-700">hold on to electrons loosely</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Friction Charging Demo */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Friction Charging</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Select two materials and see what happens when they are rubbed together
                  </p>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material 1:</label>
                      <select 
                        value={frictionMaterial1}
                        onChange={(e) => setFrictionMaterial1(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="ebonite">Ebonite</option>
                        <option value="glass">Glass</option>
                        <option value="silk">Silk</option>
                        <option value="fur">Fur</option>
                        <option value="wool">Wool</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Material 2:</label>
                      <select 
                        value={frictionMaterial2}
                        onChange={(e) => setFrictionMaterial2(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded"
                      >
                        <option value="fur">Fur</option>
                        <option value="silk">Silk</option>
                        <option value="wool">Wool</option>
                        <option value="glass">Glass</option>
                        <option value="ebonite">Ebonite</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => {
                        setShowFrictionCharging(false);
                        setTimeout(() => setShowFrictionCharging(true), 100);
                      }}
                      className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Rub Materials Together
                    </button>
                  </div>
                  
                  <div className="flex justify-center">
                    <svg width="500" height="250" viewBox="0 0 500 250" className="border border-gray-300 bg-gray-50 rounded">
                      {/* Material 1 */}
                      <rect x="50" y="75" width="150" height="100" 
                        fill={getMaterialColor(frictionMaterial1)} 
                        stroke="#6b7280" strokeWidth="2" rx="10" />
                      <text x="125" y="130" textAnchor="middle" className="text-sm font-semibold fill-white">
                        {frictionMaterial1.charAt(0).toUpperCase() + frictionMaterial1.slice(1)}
                      </text>
                      
                      {/* Material 2 */}
                      <rect x="300" y="75" width="150" height="100" 
                        fill={getMaterialColor(frictionMaterial2)} 
                        stroke="#6b7280" strokeWidth="2" rx="10" />
                      <text x="375" y="130" textAnchor="middle" className="text-sm font-semibold fill-white">
                        {frictionMaterial2.charAt(0).toUpperCase() + frictionMaterial2.slice(1)}
                      </text>
                      
                      {/* Show electron transfer if charging */}
                      {showFrictionCharging && (
                        <>
                          {/* Determine which gets negative charge based on electrostatic series */}
                          {(() => {
                            const series = ['sulphur', 'brass', 'copper', 'ebonite', 'paraffin wax', 'silk', 'lead', 'fur', 'wool', 'glass'];
                            const index1 = series.indexOf(frictionMaterial1);
                            const index2 = series.indexOf(frictionMaterial2);
                            const material1GetsNegative = index1 < index2;
                            
                            return (
                              <>
                                {/* Electron transfer animation */}
                                {Array.from({length: 5}, (_, i) => (
                                  <circle key={i} cx={material1GetsNegative ? 250 : 250} cy={100 + i * 15} r="3" fill="#2563eb">
                                    <animate
                                      attributeName="cx"
                                      from={material1GetsNegative ? "375" : "125"}
                                      to={material1GetsNegative ? "125" : "375"}
                                      dur="2s"
                                      fill="freeze"
                                    />
                                  </circle>
                                ))}
                                
                                {/* Charge indicators */}
                                <text x="125" y="50" textAnchor="middle" className="text-2xl font-bold fill-blue-600">
                                  {material1GetsNegative ? '−' : '+'}
                                </text>
                                <text x="375" y="50" textAnchor="middle" className="text-2xl font-bold fill-red-600">
                                  {material1GetsNegative ? '+' : '−'}
                                </text>
                                
                                {/* Result text */}
                                <text x="250" y="220" textAnchor="middle" className="text-sm fill-gray-700">
                                  {material1GetsNegative 
                                    ? `${frictionMaterial1} gains electrons (−), ${frictionMaterial2} loses electrons (+)`
                                    : `${frictionMaterial1} loses electrons (+), ${frictionMaterial2} gains electrons (−)`
                                  }
                                </text>
                              </>
                            );
                          })()}
                        </>
                      )}
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="induced-charge" title="Induced Charge Separation" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Electroscope Example */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Induced Charge Separation in an Electroscope</h4>
                  <p className="text-gray-700 mb-4">
                    The three diagrams of an electroscope indicate the steps involved in 
                    inducing a charge separation. Diagram 1 indicates a neutral 
                    electroscope where the number of electrons and protons are the same 
                    everywhere.
                  </p>
                  
                  {/* Interactive Electroscope Demonstration */}
                  <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Interactive Charge Induction</h5>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Move through the steps to see how charge separation occurs
                    </p>
                    
                    <div className="flex justify-center space-x-4 mb-6">
                      <button
                        onClick={() => setInductionStep(1)}
                        className={`px-4 py-2 rounded transition-colors ${
                          inductionStep === 1 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Step 1: Neutral
                      </button>
                      <button
                        onClick={() => setInductionStep(2)}
                        className={`px-4 py-2 rounded transition-colors ${
                          inductionStep === 2 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Step 2: Rod Near
                      </button>
                      <button
                        onClick={() => setInductionStep(3)}
                        className={`px-4 py-2 rounded transition-colors ${
                          inductionStep === 3 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Step 3: Rod Removed
                      </button>
                    </div>
                    
                    <div className="flex justify-center">
                      <svg width="400" height="300" viewBox="0 0 400 300" className="border border-gray-300 bg-gray-50 rounded">
                        {/* Electroscope structure */}
                        <rect x="150" y="120" width="100" height="120" fill="none" stroke="#93c5fd" strokeWidth="2" rx="5" />
                        <circle cx="200" cy="100" r="15" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                        <rect x="198" y="115" width="4" height="40" fill="#6b7280" />
                        
                        {/* Leaves based on step */}
                        {inductionStep === 1 && (
                          <>
                            {/* Neutral - leaves hang straight */}
                            <rect x="194" y="155" width="3" height="30" fill="#fbbf24" />
                            <rect x="203" y="155" width="3" height="30" fill="#fbbf24" />
                            
                            {/* Equal distribution of charges */}
                            {/* In knob */}
                            {Array.from({length: 3}, (_, i) => (
                              <circle key={`knob-pos-${i}`} cx={190 + i * 10} cy={100} r="2" fill="#dc2626" />
                            ))}
                            {Array.from({length: 3}, (_, i) => (
                              <circle key={`knob-neg-${i}`} cx={190 + i * 10} cy={95} r="2" fill="#2563eb" />
                            ))}
                            {/* In leaves */}
                            {Array.from({length: 2}, (_, i) => (
                              <circle key={`leaf-pos-${i}`} cx={195 + i * 8} cy={170} r="2" fill="#dc2626" />
                            ))}
                            {Array.from({length: 2}, (_, i) => (
                              <circle key={`leaf-neg-${i}`} cx={195 + i * 8} cy={165} r="2" fill="#2563eb" />
                            ))}
                          </>
                        )}
                        
                        {inductionStep === 2 && (
                          <>
                            {/* Negative rod nearby */}
                            <rect x="50" y="80" width="80" height="20" fill="#4b5563" stroke="#374151" strokeWidth="2" rx="10" />
                            <text x="90" y="95" textAnchor="middle" className="text-xs font-semibold fill-white">Negative Rod</text>
                            {Array.from({length: 6}, (_, i) => (
                              <circle key={`rod-neg-${i}`} cx={60 + i * 10} cy={90} r="2" fill="#2563eb" />
                            ))}
                            
                            {/* Leaves spread */}
                            <g transform="translate(200, 155) rotate(-15)">
                              <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                            </g>
                            <g transform="translate(200, 155) rotate(15)">
                              <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                            </g>
                            
                            {/* Charge separation */}
                            {/* Positive charges in knob (attracted to rod) */}
                            {Array.from({length: 3}, (_, i) => (
                              <circle key={`knob-pos-${i}`} cx={185 + i * 10} cy={100} r="2" fill="#dc2626" />
                            ))}
                            {Array.from({length: 2}, (_, i) => (
                              <circle key={`knob-pos-${i}`} cx={190 + i * 10} cy={170} r="2" fill="#dc2626" />
                            ))}
                            {/* Negative charges pushed to leaves */}
                            {Array.from({length: 5}, (_, i) => (
                              <circle key={`leaf-neg-${i}`} cx={190 + (i % 3) * 10} cy={165 + Math.floor(i / 3) * 10} r="2" fill="#2563eb" />
                            ))}
                            
                            <text x="200" y="260" textAnchor="middle" className="text-xs fill-gray-600">
                              Electrons repelled to leaves, knob becomes positive
                            </text>
                          </>
                        )}
                        
                        {inductionStep === 3 && (
                          <>
                            {/* Back to neutral - leaves hang straight */}
                            <rect x="194" y="155" width="3" height="30" fill="#fbbf24" />
                            <rect x="203" y="155" width="3" height="30" fill="#fbbf24" />
                            
                            {/* Charges redistribute evenly */}
                            {/* In knob */}
                            {Array.from({length: 3}, (_, i) => (
                              <circle key={`knob-pos-${i}`} cx={190 + i * 10} cy={100} r="2" fill="#dc2626" />
                            ))}
                            {Array.from({length: 3}, (_, i) => (
                              <circle key={`knob-neg-${i}`} cx={190 + i * 10} cy={95} r="2" fill="#2563eb" />
                            ))}
                            {/* In leaves */}
                            {Array.from({length: 2}, (_, i) => (
                              <circle key={`leaf-pos-${i}`} cx={195 + i * 8} cy={170} r="2" fill="#dc2626" />
                            ))}
                            {Array.from({length: 2}, (_, i) => (
                              <circle key={`leaf-neg-${i}`} cx={195 + i * 8} cy={165} r="2" fill="#2563eb" />
                            ))}
                            
                            <text x="200" y="260" textAnchor="middle" className="text-xs fill-gray-600">
                              Charges return to normal distribution
                            </text>
                          </>
                        )}
                        
                        {/* Step label */}
                        <text x="200" y="30" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                          {inductionStep === 1 && "Step 1: Neutral Electroscope"}
                          {inductionStep === 2 && "Step 2: Negative Rod Brought Near"}
                          {inductionStep === 3 && "Step 3: Rod Removed"}
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-yellow-800 mb-2">Important Notes:</h5>
                    <ul className="text-sm text-yellow-900 space-y-2">
                      <li className="flex items-start">
                        <span className="text-yellow-700 font-bold mr-2">⇒</span>
                        <span>The crystal structure of metals hold the nuclei in place. The positive charges within 
                        the nuclei remain where they are and the electrons do the moving.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-700 font-bold mr-2">⇒</span>
                        <span>Notice that in step 2 there are still positive charges in the leaves, but they are 
                        overwhelmed by the negative charges which were repelled from the knob by the 
                        charged rod.</span>
                      </li>
                      <li className="flex items-start">
                        <span className="text-yellow-700 font-bold mr-2">⇒</span>
                        <span>An induced charge separation is temporary. When the charged rod is removed from 
                        the vicinity of the electroscope the electroscope returns to normal.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Pith Ball Example */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Induced Charge Separation in a Pith Ball</h4>
                  <p className="text-gray-700 mb-4">
                    Another example of an induced charge separation is when a charged rod is brought 
                    near a neutral pith ball. Initially nothing appears to happen, but after a few seconds the 
                    pith ball is attracted to the charged rod. How can a neutral object be attracted to a 
                    charged object? To illustrate, suppose a charged rod, in this case a positive rod, is 
                    brought close to a pith ball.
                  </p>
                  
                  {/* Interactive Pith Ball Demo */}
                  <div className="bg-white p-6 rounded border border-gray-300">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Interactive Pith Ball Attraction</h5>
                    
                    <div className="flex justify-center mb-4">
                      <button
                        onClick={() => setPithBallAnimation(!pithBallAnimation)}
                        className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        {pithBallAnimation ? 'Reset' : 'Bring Rod Near Pith Ball'}
                      </button>
                    </div>
                    
                    <div className="flex justify-center">
                      <svg width="500" height="250" viewBox="0 0 500 250" className="border border-gray-300 bg-gray-50 rounded">
                        {/* Positive rod */}
                        <rect 
                          x={pithBallAnimation ? "320" : "400"} 
                          y="100" 
                          width="120" 
                          height="30" 
                          fill="#dc2626" 
                          stroke="#b91c1c" 
                          strokeWidth="2" 
                          rx="15"
                        >
                          {pithBallAnimation && (
                            <animate
                              attributeName="x"
                              from="400"
                              to="320"
                              dur="1s"
                              fill="freeze"
                            />
                          )}
                        </rect>
                        <text x={pithBallAnimation ? "380" : "460"} y="120" textAnchor="middle" className="text-sm font-semibold fill-white">
                          Positive Rod
                          {pithBallAnimation && (
                            <animate
                              attributeName="x"
                              from="460"
                              to="380"
                              dur="1s"
                              fill="freeze"
                            />
                          )}
                        </text>
                        {Array.from({length: 7}, (_, i) => (
                          <text key={i} x={pithBallAnimation ? 340 + i * 12 : 420 + i * 12} y="120" className="text-xs font-bold fill-white">
                            +
                            {pithBallAnimation && (
                              <animate
                                attributeName="x"
                                from={420 + i * 12}
                                to={340 + i * 12}
                                dur="1s"
                                fill="freeze"
                              />
                            )}
                          </text>
                        ))}
                        
                        {/* Pith ball */}
                        <circle 
                          cx={pithBallAnimation ? "250" : "200"} 
                          cy="115" 
                          r="30" 
                          fill="#f3f4f6" 
                          stroke="#6b7280" 
                          strokeWidth="2"
                        >
                          {pithBallAnimation && (
                            <animate
                              attributeName="cx"
                              from="200"
                              to="250"
                              dur="1s"
                              begin="1s"
                              fill="freeze"
                            />
                          )}
                        </circle>
                        
                        {/* String */}
                        <line 
                          x1={pithBallAnimation ? "250" : "200"} 
                          y1="85" 
                          x2="200" 
                          y2="50" 
                          stroke="#6b7280" 
                          strokeWidth="2"
                        >
                          {pithBallAnimation && (
                            <animate
                              attributeName="x1"
                              from="200"
                              to="250"
                              dur="1s"
                              begin="1s"
                              fill="freeze"
                            />
                          )}
                        </line>
                        
                        {/* Charges in pith ball */}
                        {!pithBallAnimation ? (
                          // Neutral state - even distribution
                          <>
                            {Array.from({length: 5}, (_, i) => (
                              <circle key={`pos-${i}`} cx={185 + (i % 3) * 15} cy={105 + Math.floor(i / 3) * 15} r="2" fill="#dc2626" />
                            ))}
                            {Array.from({length: 5}, (_, i) => (
                              <circle key={`neg-${i}`} cx={190 + (i % 3) * 15} cy={110 + Math.floor(i / 3) * 15} r="2" fill="#2563eb" />
                            ))}
                            <text x="200" y="200" textAnchor="middle" className="text-sm fill-gray-600">
                              Neutral pith ball
                            </text>
                          </>
                        ) : (
                          // Induced charge separation
                          <>
                            {/* Positive charges remain in neutral positions */}
                            {Array.from({length: 5}, (_, i) => (
                              <circle key={`pos-${i}`} cx={235 + (i % 3) * 15} cy={105 + Math.floor(i / 3) * 15} r="2" fill="#dc2626" />
                            ))}
                            {/* Negative charges cluster on right side (near rod) */}
                            {Array.from({length: 5}, (_, i) => (
                              <circle key={`neg-${i}`} cx={265 + (i % 2) * 8} cy={105 + Math.floor(i / 2) * 10} r="2" fill="#2563eb" />
                            ))}
                            
                            <text x="250" y="200" textAnchor="middle" className="text-sm fill-gray-600">
                              Net force toward rod
                            </text>
                          </>
                        )}
                        
                        <defs>
                          <marker id="arrowRed" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
                          </marker>
                          <marker id="arrowBlue" markerWidth="10" markerHeight="7" refX="0" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#2563eb" />
                          </marker>
                        </defs>
                      </svg>
                    </div>
                    
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Explanation:</strong> The negative charges on the pith ball are attracted to the charged rod resulting in a 
                        charge separation. Since the negative side of the pith ball is closer to the rod than the positive side, the 
                        attractive force between the negative side of the pith ball and the rod is slightly greater 
                        than the repulsive force between the positive side of the pith ball and the rod. The 
                        result is a net force toward the rod.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="charging-contact" title="Charging by Contact (Conduction)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    When a negatively charged rod is touched to a neutral pith ball, some of the excess 
                    electrons on the rod that are repelled by the close proximity of their neighbouring 
                    excess electrons move over to the pith ball. The pith ball and the negative rod share 
                    some of the excess of electrons that the charged rod previously had. Both have some 
                    of the excess and hence both are negatively charged. A similar sharing occurs when a 
                    positively charged rod is touched to the knob of a metal-leaf electroscope.
                  </p>
                  <p className="text-gray-700 mb-4">
                    When a positively charged rod is used, some of the free electrons on the pith ball or 
                    metal-leaf electroscope are attracted over to the positive rod to reduce some of its 
                    deficit of electrons. The electroscope and the rod share the deficit of electrons that the 
                    rod previously had, and both have a positive charge.
                  </p>
                </div>

                {/* Interactive Contact Charging Demo */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Contact Charging</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Watch how charge is transferred when objects touch
                  </p>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => setContactChargeType('negative')}
                      className={`px-4 py-2 rounded transition-colors ${
                        contactChargeType === 'negative' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Negative Rod
                    </button>
                    <button
                      onClick={() => setContactChargeType('positive')}
                      className={`px-4 py-2 rounded transition-colors ${
                        contactChargeType === 'positive' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Positive Rod
                    </button>
                  </div>
                  
                  <div className="flex justify-center mb-4">
                    <button
                      onClick={() => {
                        setContactAnimation(false);
                        setTimeout(() => setContactAnimation(true), 100);
                      }}
                      className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Touch Objects Together
                    </button>
                  </div>
                  
                  <div className="flex justify-center">
                    <svg width="500" height="300" viewBox="0 0 500 300" className="border border-gray-300 bg-gray-50 rounded">
                      {/* Charged rod */}
                      <rect 
                        x={contactAnimation ? "200" : "50"} 
                        y="100" 
                        width="100" 
                        height="30" 
                        fill={contactChargeType === 'negative' ? '#3b82f6' : '#dc2626'} 
                        stroke={contactChargeType === 'negative' ? '#2563eb' : '#b91c1c'} 
                        strokeWidth="2" 
                        rx="15"
                      >
                        {contactAnimation && (
                          <animate
                            attributeName="x"
                            from="50"
                            to="200"
                            dur="1s"
                            fill="freeze"
                          />
                        )}
                      </rect>
                      <text 
                        x={contactAnimation ? "250" : "100"} 
                        y="120" 
                        textAnchor="middle" 
                        className="text-xs font-semibold fill-white"
                      >
                        {contactChargeType === 'negative' ? 'Negative Rod' : 'Positive Rod'}
                        {contactAnimation && (
                          <animate
                            attributeName="x"
                            from="100"
                            to="250"
                            dur="1s"
                            fill="freeze"
                          />
                        )}
                      </text>
                      
                      {/* Neutral object (pith ball) */}
                      <circle cx="350" cy="115" r="30" fill="#f3f4f6" stroke="#6b7280" strokeWidth="2" />
                      <text x="350" y="160" textAnchor="middle" className="text-xs fill-gray-600">Pith Ball</text>
                      
                      {/* Show charges */}
                      {!contactAnimation ? (
                        <>
                          {/* Initial state */}
                          {/* Charged rod */}
                          {contactChargeType === 'negative' ? (
                            // Excess electrons on negative rod
                            Array.from({length: 10}, (_, i) => (
                              <circle key={`rod-${i}`} cx={60 + (i % 5) * 16} cy={105 + Math.floor(i / 5) * 10} r="2" fill="#2563eb" />
                            ))
                          ) : (
                            // Deficit of electrons on positive rod (show fewer electrons)
                            Array.from({length: 3}, (_, i) => (
                              <circle key={`rod-${i}`} cx={70 + i * 20} cy={115} r="2" fill="#2563eb" />
                            ))
                          )}
                          
                          {/* Neutral pith ball - equal charges */}
                          {Array.from({length: 5}, (_, i) => (
                            <circle key={`ball-pos-${i}`} cx={335 + (i % 3) * 15} cy={105 + Math.floor(i / 3) * 15} r="2" fill="#dc2626" />
                          ))}
                          {Array.from({length: 5}, (_, i) => (
                            <circle key={`ball-neg-${i}`} cx={340 + (i % 3) * 15} cy={110 + Math.floor(i / 3) * 15} r="2" fill="#2563eb" />
                          ))}
                        </>
                      ) : (
                        <>
                          {/* After contact - charges shared */}
                          {contactChargeType === 'negative' ? (
                            <>
                              {/* Some electrons moved to pith ball */}
                              {/* Rod still has some excess */}
                              {Array.from({length: 6}, (_, i) => (
                                <circle key={`rod-${i}`} cx={210 + (i % 3) * 16} cy={105 + Math.floor(i / 3) * 10} r="2" fill="#2563eb" />
                              ))}
                              {/* Pith ball now has excess electrons */}
                              {Array.from({length: 5}, (_, i) => (
                                <circle key={`ball-pos-${i}`} cx={335 + (i % 3) * 15} cy={105 + Math.floor(i / 3) * 15} r="2" fill="#dc2626" />
                              ))}
                              {Array.from({length: 9}, (_, i) => (
                                <circle key={`ball-neg-${i}`} cx={335 + (i % 4) * 12} cy={105 + Math.floor(i / 4) * 12} r="2" fill="#2563eb" />
                              ))}
                              
                              {/* Animation of electron transfer */}
                              {Array.from({length: 4}, (_, i) => (
                                <circle key={`transfer-${i}`} cx="250" cy={110 + i * 5} r="2" fill="#2563eb" opacity="0">
                                  <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    dur="2s"
                                    begin="1s"
                                  />
                                  <animate
                                    attributeName="cx"
                                    from="250"
                                    to="320"
                                    dur="1s"
                                    begin="1.5s"
                                  />
                                </circle>
                              ))}
                            </>
                          ) : (
                            <>
                              {/* Electrons moved from pith ball to rod */}
                              {/* Rod now has more electrons (less positive) */}
                              {Array.from({length: 5}, (_, i) => (
                                <circle key={`rod-${i}`} cx={220 + i * 12} cy={115} r="2" fill="#2563eb" />
                              ))}
                              {/* Pith ball now has deficit of electrons */}
                              {Array.from({length: 5}, (_, i) => (
                                <circle key={`ball-pos-${i}`} cx={335 + (i % 3) * 15} cy={105 + Math.floor(i / 3) * 15} r="2" fill="#dc2626" />
                              ))}
                              {Array.from({length: 3}, (_, i) => (
                                <circle key={`ball-neg-${i}`} cx={345 + i * 10} cy={115} r="2" fill="#2563eb" />
                              ))}
                              
                              {/* Animation of electron transfer */}
                              {Array.from({length: 2}, (_, i) => (
                                <circle key={`transfer-${i}`} cx="320" cy={110 + i * 10} r="2" fill="#2563eb" opacity="0">
                                  <animate
                                    attributeName="opacity"
                                    values="0;1;1;0"
                                    dur="2s"
                                    begin="1s"
                                  />
                                  <animate
                                    attributeName="cx"
                                    from="320"
                                    to="250"
                                    dur="1s"
                                    begin="1.5s"
                                  />
                                </circle>
                              ))}
                            </>
                          )}
                          
                          {/* Result labels */}
                          <text x={250} y={80} textAnchor="middle" className="text-sm font-bold fill-gray-700">
                            {contactChargeType === 'negative' ? '−' : '+'}
                          </text>
                          <text x={350} y={80} textAnchor="middle" className="text-sm font-bold fill-gray-700">
                            {contactChargeType === 'negative' ? '−' : '+'}
                          </text>
                        </>
                      )}
                      
                      {/* Explanation */}
                      <text x="250" y="220" textAnchor="middle" className="text-sm fill-gray-600">
                        {!contactAnimation 
                          ? `${contactChargeType === 'negative' ? 'Negative' : 'Positive'} rod and neutral pith ball`
                          : `Both objects now have ${contactChargeType === 'negative' ? 'negative' : 'positive'} charge`
                        }
                      </text>
                      <text x="250" y="240" textAnchor="middle" className="text-xs fill-gray-600">
                        {contactAnimation && 
                          (contactChargeType === 'negative' 
                            ? 'Electrons moved from rod to pith ball'
                            : 'Electrons moved from pith ball to rod')
                        }
                      </text>
                    </svg>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-yellow-800 mb-2">Note:</h5>
                  <p className="text-sm text-yellow-900">
                    <span className="font-bold">⇒</span> Charging by conduction results in the electroscope receiving the same charge as the 
                    charging device and the charging device loses some, not all, of its charge in the 
                    process.
                  </p>
                </div>

                {/* Sphere Example */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Charge Distribution Between Spheres</h4>
                  <p className="text-gray-700 mb-4">
                    If a conducting object with an existing charge is brought 
                    into contact with another conducting object, the charges 
                    on both objects redistribute themselves. In the example 
                    to the right, we start with two positively charged spheres. 
                    Both spheres have the same surface area but they have 
                    different charges (+22 and +8).
                  </p>
                  
                  {/* Interactive Sphere Contact Demo */}
                  <div className="bg-white p-6 rounded border border-gray-300">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Charge Redistribution Between Spheres</h5>
                    
                    <div className="flex justify-center mb-4">
                      <button
                        onClick={() => setSphereContact(!sphereContact)}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        {sphereContact ? 'Separate Spheres' : 'Bring Spheres Together'}
                      </button>
                    </div>
                    
                    <div className="flex justify-center">
                      <svg width="500" height="250" viewBox="0 0 500 250" className="border border-gray-300 bg-gray-50 rounded">
                        {!sphereContact ? (
                          <>
                            {/* Initial state - separated spheres */}
                            <circle cx="150" cy="125" r="50" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
                            <text x="150" y="130" textAnchor="middle" className="text-lg font-bold fill-gray-800">+22</text>
                            
                            <circle cx="350" cy="125" r="50" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
                            <text x="350" y="130" textAnchor="middle" className="text-lg font-bold fill-gray-800">+8</text>
                            
                            <text x="250" y="50" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                              Before Contact
                            </text>
                            <text x="250" y="200" textAnchor="middle" className="text-sm fill-gray-600">
                              Total charge: +22 + 8 = +30
                            </text>
                          </>
                        ) : (
                          <>
                            {/* After contact - charges redistributed */}
                            <circle cx="200" cy="125" r="50" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
                            <text x="200" y="130" textAnchor="middle" className="text-lg font-bold fill-gray-800">+15</text>
                            
                            <circle cx="300" cy="125" r="50" fill="#fca5a5" stroke="#dc2626" strokeWidth="2" />
                            <text x="300" y="130" textAnchor="middle" className="text-lg font-bold fill-gray-800">+15</text>
                            
                            {/* Connection line */}
                            <line x1="250" y1="125" x2="250" y2="125" stroke="#dc2626" strokeWidth="3" />
                            
                            <text x="250" y="50" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                              After Contact
                            </text>
                            <text x="250" y="200" textAnchor="middle" className="text-sm fill-gray-600">
                              Charges redistribute evenly: 30 ÷ 2 = +15 each
                            </text>
                            
                            {/* Show charge movement */}
                            {Array.from({length: 7}, (_, i) => (
                              <text key={i} x="150" y={100 + i * 10} className="text-xs font-bold fill-red-600" opacity="0">
                                +
                                <animate
                                  attributeName="opacity"
                                  values="0;1;1;0"
                                  dur="2s"
                                  begin="0.5s"
                                />
                                <animate
                                  attributeName="x"
                                  from="150"
                                  to="350"
                                  dur="1.5s"
                                  begin="0.5s"
                                />
                              </text>
                            ))}
                          </>
                        )}
                      </svg>
                    </div>
                    
                    <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <strong>Key Principle:</strong> When the spheres are brought into contact, charges redistribute themselves evenly between 
                        both spheres. The positive charges are found inside the nuclei of atoms that are fixed in position 
                        by the crystal structure of the metals. Only the negative electrons are free to flow. The evenly distributed 
                        charges result in a +15 charge on each sphere.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Different Surface Areas */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-800 mb-2">Different Surface Areas:</h5>
                  <p className="text-sm text-purple-900">
                    If the surface areas of the spherical conductors are different, the sphere with the larger 
                    surface area will have proportionately more of the charges (i.e. if one sphere has twice 
                    the surface area of the other, it will have twice the charge.)
                  </p>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="charging-induction" title="Charging By Induction (Influence or Induce)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    We learned that a charged rod can induce a charge separation on a neutral conductor. 
                    When a negatively charged rod is brought near the knob of a neutral metal-leaf 
                    electroscope, free electrons on the electroscope move as far away as possible from the 
                    negative rod. When the charged object is removed from the area, the charges on the 
                    electroscope redistribute themselves and a neutral electroscope remains.
                  </p>
                  <p className="text-gray-700 mb-4">
                    In order to give the electroscope or any conductor a permanent charge through induction another step is 
                    required. If, for example, a negatively charged rod is brought near the electroscope and you touch the 
                    electroscope with your finger, keeping the negative rod in place, electrons are induced to vacate the electroscope and 
                    flow through your finger. When your finger is removed, the electroscope is left with a deficit of electrons and, therefore, 
                    a positive charge. The leaves will remain apart even when the negative rod is removed.
                  </p>
                </div>

                {/* Interactive Induction Charging Demo */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Charging by Induction</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Follow the steps to charge an electroscope by induction
                  </p>
                  
                  <div className="flex justify-center space-x-2 mb-6">
                    {[1, 2, 3, 4].map((step) => (
                      <button
                        key={step}
                        onClick={() => setInductionChargeStep(step)}
                        className={`px-3 py-2 rounded transition-colors text-sm ${
                          inductionChargeStep === step 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Step {step}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <svg width="500" height="350" viewBox="0 0 500 350" className="border border-gray-300 bg-gray-50 rounded">
                      {/* Electroscope structure */}
                      <rect x="200" y="150" width="100" height="120" fill="none" stroke="#93c5fd" strokeWidth="2" rx="5" />
                      <circle cx="250" cy="130" r="15" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                      <rect x="248" y="145" width="4" height="40" fill="#6b7280" />
                      
                      {/* Step-specific elements */}
                      {inductionChargeStep === 1 && (
                        <>
                          {/* Step 1: Neutral electroscope */}
                          <rect x="244" y="185" width="3" height="30" fill="#fbbf24" />
                          <rect x="253" y="185" width="3" height="30" fill="#fbbf24" />
                          
                          {/* Equal charges */}
                          {Array.from({length: 3}, (_, i) => (
                            <circle key={`pos-${i}`} cx={240 + i * 10} cy={130} r="2" fill="#dc2626" />
                          ))}
                          {Array.from({length: 3}, (_, i) => (
                            <circle key={`neg-${i}`} cx={240 + i * 10} cy={125} r="2" fill="#2563eb" />
                          ))}
                          
                          <text x="250" y="50" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                            Step 1: Neutral Electroscope
                          </text>
                          <text x="250" y="300" textAnchor="middle" className="text-xs fill-gray-600">
                            Start with a neutral electroscope
                          </text>
                        </>
                      )}
                      
                      {inductionChargeStep === 2 && (
                        <>
                          {/* Step 2: Bring negative rod near */}
                          {/* Negative rod */}
                          <rect x="80" y="110" width="80" height="20" fill="#4b5563" stroke="#374151" strokeWidth="2" rx="10" />
                          <text x="120" y="125" textAnchor="middle" className="text-xs font-semibold fill-white">Negative Rod</text>
                          {Array.from({length: 6}, (_, i) => (
                            <circle key={`rod-${i}`} cx={90 + i * 10} cy={120} r="2" fill="#2563eb" />
                          ))}
                          
                          {/* Leaves spread */}
                          <g transform="translate(250, 185) rotate(-15)">
                            <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                          </g>
                          <g transform="translate(250, 185) rotate(15)">
                            <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                          </g>
                          
                          {/* Charge separation */}
                          {Array.from({length: 5}, (_, i) => (
                            <circle key={`pos-${i}`} cx={235 + i * 6} cy={130} r="2" fill="#dc2626" />
                          ))}
                          {Array.from({length: 5}, (_, i) => (
                            <circle key={`neg-${i}`} cx={240 + (i % 3) * 10} cy={195 + Math.floor(i / 3) * 10} r="2" fill="#2563eb" />
                          ))}
                          
                          <text x="250" y="50" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                            Step 2: Bring Negative Rod Near
                          </text>
                          <text x="250" y="300" textAnchor="middle" className="text-xs fill-gray-600">
                            Electrons repelled to leaves, knob becomes positive
                          </text>
                        </>
                      )}
                      
                      {inductionChargeStep === 3 && (
                        <>
                          {/* Step 3: Ground with finger */}
                          {/* Negative rod still present */}
                          <rect x="80" y="110" width="80" height="20" fill="#4b5563" stroke="#374151" strokeWidth="2" rx="10" />
                          <text x="120" y="125" textAnchor="middle" className="text-xs font-semibold fill-white">Negative Rod</text>
                          {Array.from({length: 6}, (_, i) => (
                            <circle key={`rod-${i}`} cx={90 + i * 10} cy={120} r="2" fill="#2563eb" />
                          ))}
                          
                          {/* Finger touching knob */}
                          <rect x="260" y="120" width="15" height="40" fill="#fdbcb4" stroke="#8b7355" strokeWidth="1" rx="7" />
                          <text x="290" y="140" className="text-xs fill-gray-600">Finger</text>
                          
                          {/* Electrons flowing out */}
                          {Array.from({length: 4}, (_, i) => (
                            <circle key={`flow-${i}`} cx={250} cy={160 + i * 10} r="2" fill="#2563eb">
                              <animate
                                attributeName="cy"
                                from={160 + i * 10}
                                to={120}
                                dur="1s"
                                repeatCount="indefinite"
                              />
                              <animate
                                attributeName="opacity"
                                values="1;1;0"
                                dur="1s"
                                repeatCount="indefinite"
                              />
                            </circle>
                          ))}
                          
                          {/* Leaves close */}
                          <rect x="244" y="185" width="3" height="30" fill="#fbbf24" />
                          <rect x="253" y="185" width="3" height="30" fill="#fbbf24" />
                          
                          {/* Positive charges remain */}
                          {Array.from({length: 5}, (_, i) => (
                            <circle key={`pos-${i}`} cx={240 + (i % 3) * 10} cy={130 + Math.floor(i / 3) * 20} r="2" fill="#dc2626" />
                          ))}
                          {/* Very few electrons left */}
                          <circle cx="250" cy="200" r="2" fill="#2563eb" />
                          
                          <text x="250" y="50" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                            Step 3: Ground with Finger
                          </text>
                          <text x="250" y="300" textAnchor="middle" className="text-xs fill-gray-600">
                            Electrons flow out through finger (ground)
                          </text>
                        </>
                      )}
                      
                      {inductionChargeStep === 4 && (
                        <>
                          {/* Step 4: Remove finger then rod */}
                          {/* Leaves spread again */}
                          <g transform="translate(250, 185) rotate(-20)">
                            <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                          </g>
                          <g transform="translate(250, 185) rotate(20)">
                            <rect x="-1.5" y="0" width="3" height="30" fill="#fbbf24" />
                          </g>
                          
                          {/* Positive charges throughout */}
                          {Array.from({length: 5}, (_, i) => (
                            <circle key={`pos-${i}`} cx={240 + (i % 3) * 10} cy={140 + Math.floor(i / 3) * 30} r="2" fill="#dc2626" />
                          ))}
                          {/* Very few electrons */}
                          <circle cx="245" cy="150" r="2" fill="#2563eb" />
                          <circle cx="255" cy="170" r="2" fill="#2563eb" />
                          
                          {/* Charge indicator */}
                          <text x="250" y="100" textAnchor="middle" className="text-2xl font-bold fill-red-600">+</text>
                          
                          <text x="250" y="50" textAnchor="middle" className="text-sm font-semibold fill-gray-800">
                            Step 4: Remove Finger, Then Rod
                          </text>
                          <text x="250" y="300" textAnchor="middle" className="text-xs fill-gray-600">
                            Electroscope left with positive charge
                          </text>
                        </>
                      )}
                    </svg>
                  </div>
                  
                  {/* Step descriptions */}
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    {inductionChargeStep === 1 && (
                      <p className="text-sm text-blue-800">
                        <strong>Step 1:</strong> Start with a neutral electroscope. Equal numbers of positive and negative charges.
                      </p>
                    )}
                    {inductionChargeStep === 2 && (
                      <p className="text-sm text-blue-800">
                        <strong>Step 2:</strong> Bring a negatively charged rod near the knob. Electrons are repelled to the leaves, 
                        making the knob positive and the leaves negative.
                      </p>
                    )}
                    {inductionChargeStep === 3 && (
                      <p className="text-sm text-blue-800">
                        <strong>Step 3:</strong> Touch the knob with your finger while keeping the rod in place. Electrons flow out 
                        through your finger to ground. The leaves collapse as charge leaves.
                      </p>
                    )}
                    {inductionChargeStep === 4 && (
                      <p className="text-sm text-blue-800">
                        <strong>Step 4:</strong> Remove your finger first, then remove the rod. The electroscope is left with a 
                        deficit of electrons (positive charge). The leaves spread due to mutual repulsion of positive charges.
                      </p>
                    )}
                  </div>
                </div>

                {/* Ground Connection */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-green-800 mb-2">The Ground Connection</h5>
                  <p className="text-sm text-green-900 mb-3">
                    The use of your finger acts as a ground through which electrons can either escape from the conductor or be pulled 
                    into the conductor.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h6 className="font-medium text-green-800 mb-2">With Negative Rod:</h6>
                      <p className="text-xs text-green-900">
                        Electrons are repelled and escape through the ground connection, leaving the 
                        electroscope positively charged.
                      </p>
                    </div>
                    <div className="bg-white p-3 rounded border border-green-300">
                      <h6 className="font-medium text-green-800 mb-2">With Positive Rod:</h6>
                      <p className="text-xs text-green-900">
                        Electrons are attracted from ground into the electroscope, leaving it with an 
                        excess of electrons (negative charge).
                      </p>
                    </div>
                  </div>
                </div>

                {/* Important Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Note:</h5>
                  <p className="text-sm text-yellow-900">
                    <span className="font-bold">⇒</span> Charging by induction causes the object to become opposite in charge to the 
                    charging device and the charging device does not lose any charge in the process.
                  </p>
                </div>
              </div>
            </div>
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

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200 mt-8">
        <h2 className="text-2xl font-bold text-blue-900 mb-4">Practice Questions</h2>
        <p className="text-blue-700 mb-6">Test your understanding of electrostatics concepts with these practice questions.</p>
        
        <SlideshowKnowledgeCheck
          courseId={courseId}
          lessonPath="25-electrostatics"
          course={course}
          onAIAccordionContent={onAIAccordionContent}
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_25_conservation_of_charge',
              title: 'Conservation of Charge'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_charge_movement_in_solids',
              title: 'Charge Movement in Solids'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_conductor_vs_insulator',
              title: 'Conductor vs Insulator'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_electrostatic_series',
              title: 'Electrostatic Series'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_electron_charge',
              title: 'Adding/Removing Electrons'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_induced_charge',
              title: 'Induced Charge vs Separation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_conduction_charging',
              title: 'Conduction Charging Procedure'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_induction_charging',
              title: 'Induction Charging Procedure'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_conduction_result',
              title: 'Conduction Charging Result'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_induction_result',
              title: 'Induction Charging Result'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_spheres_charge',
              title: 'Identical Spheres Charge Distribution'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_25_different_spheres',
              title: 'Different Size Spheres'
            }
          ]}
          theme="indigo"
        />
      </div>

      <LessonSummary
        points={[
          "Matter composed of atoms with protons (+), electrons (-), and neutrons (0)",
          "Elementary charge: e = 1.60 × 10⁻¹⁹ C; like charges repel, unlike attract",
          "Conservation of charge: total charge is conserved in closed systems",
          "Friction charging transfers electrons through rubbing (electrostatic series)",
          "Contact charging: direct transfer gives same charge as source object",
          "Induction charging: charge without contact gives opposite charge to source",
          "Conductors have free electrons; insulators have bound electrons",
          "Electroscopes detect presence of charge using principle of repulsion"
        ]}
      />
    </LessonContent>
  );
};

export default Electrostatics;