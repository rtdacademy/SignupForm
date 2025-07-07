import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const CoulombsLaw = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {
  
  // Interactive states for Franklin's experiment
  const [franklinExperiment, setFranklinExperiment] = useState('outside'); // 'outside' or 'inside'
  const [showFranklinAnimation, setShowFranklinAnimation] = useState(false);
  
  // Interactive states for Coulomb's experiments
  const [coulombExperiment, setCoulombExperiment] = useState('charge'); // 'charge' or 'distance'
  const [chargeValue1, setChargeValue1] = useState(2);
  const [chargeValue2, setChargeValue2] = useState(2);
  const [distanceValue, setDistanceValue] = useState(2);
  
  // Interactive states for using Coulomb's Law
  const [selectedExample, setSelectedExample] = useState(1); // 1 or 2
  const [showForceDirection, setShowForceDirection] = useState(false);
  const [showCommonMistake, setShowCommonMistake] = useState(false);
  
  // Interactive states for Newton's 3rd Law
  const [focusCharge, setFocusCharge] = useState('A'); // 'A' or 'B'
  const [showActionReaction, setShowActionReaction] = useState(false);

  // Calculate force for demonstration
  const calculateForce = () => {
    const k = 8.99e9;
    const q1 = chargeValue1 * 1e-6; // Convert to microcoulombs
    const q2 = chargeValue2 * 1e-6;
    const r = distanceValue * 0.1; // Convert to meters
    return (k * q1 * q2) / (r * r);
  };

  // Helper functions for using Coulomb's Law examples
  const getExampleData = (exampleNum) => {
    if (exampleNum === 1) {
      return {
        qA: 20e-6, // +20 μC
        qB: -15e-6, // -15 μC
        r: 0.25,
        qALabel: '+20 μC',
        qBLabel: '-15 μC',
        description: 'Unlike charges (positive and negative)'
      };
    } else {
      return {
        qA: 10e-6, // +10 μC
        qB: -12e-6, // -12 μC
        r: 0.25,
        qALabel: '+10 μC',
        qBLabel: '-12 μC',
        description: 'Unlike charges (positive and negative)'
      };
    }
  };

  const calculateExampleForce = (exampleNum) => {
    const data = getExampleData(exampleNum);
    const k = 8.99e9;
    const force = (k * data.qA * data.qB) / (data.r * data.r);
    return {
      magnitude: Math.abs(force),
      withSign: force,
      isAttractive: (data.qA * data.qB) < 0
    };
  };

  return (
    <LessonContent
      lessonId="lesson_26_coulombs_law"
      title="Lesson 14 - Coulomb's Law"
      metadata={{ estimated_time: '50 minutes' }}
    >
      {/* AI-Enhanced Content Sections */}
      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="historical" title="Historical Development of Coulomb's Law" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Timeline Overview */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Historical Timeline</h4>
                  <div className="flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded border border-gray-300 space-y-4 md:space-y-0">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                        1775
                      </div>
                      <div className="text-sm font-medium">Franklin's Cork Experiment</div>
                    </div>
                    <div className="hidden md:block text-gray-400">→</div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                        1775
                      </div>
                      <div className="text-sm font-medium">Priestley's Insight</div>
                    </div>
                    <div className="hidden md:block text-gray-400">→</div>
                    <div className="text-center">
                      <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2">
                        1785
                      </div>
                      <div className="text-sm font-medium">Coulomb's Law</div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Key Insight:</h5>
                  <p className="text-yellow-900 text-sm">
                    The development of Coulomb's Law beautifully demonstrates how scientific discovery often builds 
                    upon previous observations and insights, connecting seemingly different phenomena through careful 
                    experimentation and mathematical analysis.
                  </p>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="franklin" title="Franklin's Cork Experiment (1775)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Franklin's Observation */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    In 1775, Ben Franklin noted that a small neutral cork hanging near the 
                    surface of an electrically charged metal can was strongly attracted to 
                    the outside surface of the metal can.
                  </p>
                  <p className="text-gray-700 mb-4">
                    When the same neutral cork was lowered inside the can, the cork was not 
                    attracted to the surface of the can. Franklin was surprised to discover no 
                    attraction within the can but strong attraction outside the can.
                  </p>
                </div>

                {/* Interactive Franklin Experiment */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Franklin Experiment</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Explore Franklin's surprising discovery about electric forces inside vs. outside a charged container
                  </p>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => {
                        setFranklinExperiment('outside');
                        setShowFranklinAnimation(false);
                        setTimeout(() => setShowFranklinAnimation(true), 100);
                      }}
                      className={`px-4 py-2 rounded transition-colors ${
                        franklinExperiment === 'outside' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cork Outside Can
                    </button>
                    <button
                      onClick={() => {
                        setFranklinExperiment('inside');
                        setShowFranklinAnimation(false);
                        setTimeout(() => setShowFranklinAnimation(true), 100);
                      }}
                      className={`px-4 py-2 rounded transition-colors ${
                        franklinExperiment === 'inside' 
                          ? 'bg-red-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cork Inside Can
                    </button>
                  </div>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="300" viewBox="0 0 400 300" className="border border-gray-300 bg-gray-50 rounded">
                      {/* Metal can */}
                      <rect x="150" y="100" width="100" height="120" fill="none" stroke="#fbbf24" strokeWidth="4" rx="5" />
                      <text x="200" y="240" textAnchor="middle" className="text-sm font-semibold fill-gray-700">
                        Charged Metal Can
                      </text>
                      
                      {/* Charge distribution on can */}
                      {Array.from({length: 12}, (_, i) => {
                        const angle = (i / 12) * 2 * Math.PI;
                        const centerX = 200;
                        const centerY = 160;
                        const radiusX = 55;
                        const radiusY = 65;
                        const x = centerX + radiusX * Math.cos(angle);
                        const y = centerY + radiusY * Math.sin(angle);
                        return (
                          <text key={i} x={x} y={y} textAnchor="middle" className="text-xs font-bold fill-red-600">
                            +
                          </text>
                        );
                      })}
                      
                      {franklinExperiment === 'outside' ? (
                        <>
                          {/* Cork outside - attracted */}
                          <circle 
                            cx={showFranklinAnimation ? "120" : "80"} 
                            cy="160" 
                            r="8" 
                            fill="#8b4513" 
                            stroke="#7c3f00" 
                            strokeWidth="2"
                          >
                            {showFranklinAnimation && (
                              <animate
                                attributeName="cx"
                                from="80"
                                to="120"
                                dur="2s"
                                fill="freeze"
                              />
                            )}
                          </circle>
                          
                          {/* String */}
                          <line 
                            x1={showFranklinAnimation ? "120" : "80"} 
                            y1="160" 
                            x2="100" 
                            y2="80" 
                            stroke="#654321" 
                            strokeWidth="2"
                          >
                            {showFranklinAnimation && (
                              <animate
                                attributeName="x1"
                                from="80"
                                to="120"
                                dur="2s"
                                fill="freeze"
                              />
                            )}
                          </line>
                          
                          {/* Force arrow */}
                          {showFranklinAnimation && (
                            <path d="M 90 160 L 110 160" stroke="#dc2626" strokeWidth="3" markerEnd="url(#arrow)" opacity="0">
                              <animate
                                attributeName="opacity"
                                from="0"
                                to="1"
                                dur="1s"
                                begin="1s"
                                fill="freeze"
                              />
                            </path>
                          )}
                          
                          <text x="200" y="280" textAnchor="middle" className="text-sm fill-green-600 font-semibold">
                            Strong Attraction Outside!
                          </text>
                        </>
                      ) : (
                        <>
                          {/* Cork inside - no attraction */}
                          <circle cx="200" cy="160" r="8" fill="#8b4513" stroke="#7c3f00" strokeWidth="2" />
                          
                          {/* String hanging straight down */}
                          <line x1="200" y1="160" x2="200" y2="80" stroke="#654321" strokeWidth="2" />
                          
                          {/* No force indication */}
                          <text x="200" y="280" textAnchor="middle" className="text-sm fill-red-600 font-semibold">
                            No Attraction Inside!
                          </text>
                          
                          {/* Show field lines canceling inside */}
                          {showFranklinAnimation && (
                            <>
                              {Array.from({length: 4}, (_, i) => (
                                <g key={i} opacity="0">
                                  <path d="M 170 140 L 230 140" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arrow)" />
                                  <path d="M 230 180 L 170 180" stroke="#2563eb" strokeWidth="2" markerEnd="url(#arrow)" />
                                  <animate
                                    attributeName="opacity"
                                    from="0"
                                    to="0.6"
                                    dur="1s"
                                    begin="1s"
                                    fill="freeze"
                                  />
                                </g>
                              ))}
                              <text x="200" y="200" textAnchor="middle" className="text-xs fill-blue-600" opacity="0">
                                Forces cancel out
                                <animate
                                  attributeName="opacity"
                                  from="0"
                                  to="1"
                                  dur="1s"
                                  begin="2s"
                                  fill="freeze"
                                />
                              </text>
                            </>
                          )}
                        </>
                      )}
                      
                      <defs>
                        <marker id="arrow" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                          <polygon points="0 0, 10 3.5, 0 7" fill="#dc2626" />
                        </marker>
                      </defs>
                    </svg>
                  </div>
                  
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Franklin's Puzzle:</strong> Why would electric forces be strong outside the can but 
                      completely absent inside? This mysterious observation would lead to one of the most important 
                      laws in physics.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="priestley" title="Priestley's Insight (1775)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Priestley's Background */}
                <div className="mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Joseph Priestley (1733-1804)</h4>
                    <p className="text-green-900 text-sm mb-2">
                      Joseph Priestley was a house guest of Ben Franklin in 1775. Priestley had been studying 
                      science at Cambridge, but had fled from England because of religious persecution.
                    </p>
                    <p className="text-green-900 text-sm">
                      Franklin asked Priestley to repeat his experiment. Priestley obtained the same results as 
                      Franklin, but the experiment triggered memories of Newton's discussion of gravity within 
                      a hollow planet.
                    </p>
                  </div>
                </div>

                {/* Newton's Hollow Planet Theory */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Newton's Hollow Planet Theory</h4>
                  <p className="text-gray-700 mb-4">
                    Newton had examined the possibility of gravity inside a hollow planet in 
                    his book <em>Principia Mathematica</em> "Principles of Mathematics". Newton came to the 
                    conclusion that any point inside the hollow planet would be subject to forces from the 
                    surface but the forces would all cancel out leaving the appearance of no gravitational 
                    field.
                  </p>
                  
                  {/* Visual comparison */}
                  <div className="bg-white p-6 rounded border border-gray-300 mb-4">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Priestley's Brilliant Connection</h5>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Gravity analogy */}
                      <div className="text-center">
                        <h6 className="font-medium text-gray-800 mb-3">Newton's Hollow Planet</h6>
                        <svg width="200" height="200" viewBox="0 0 200 200" className="border border-gray-300 bg-gray-50 rounded mx-auto">
                          {/* Hollow planet */}
                          <circle cx="100" cy="100" r="80" fill="none" stroke="#8b7355" strokeWidth="6" />
                          
                          {/* Point inside */}
                          <circle cx="100" cy="100" r="3" fill="#dc2626" />
                          
                          {/* Force vectors canceling out */}
                          {Array.from({length: 8}, (_, i) => {
                            const angle = (i / 8) * 2 * Math.PI;
                            const startX = 100 + 15 * Math.cos(angle);
                            const startY = 100 + 15 * Math.sin(angle);
                            const endX = 100 + 35 * Math.cos(angle);
                            const endY = 100 + 35 * Math.sin(angle);
                            return (
                              <line key={i} x1={startX} y1={startY} x2={endX} y2={endY} 
                                stroke="#2563eb" strokeWidth="2" markerEnd="url(#blueArrow)" />
                            );
                          })}
                          
                          <text x="100" y="190" textAnchor="middle" className="text-xs fill-gray-600">
                            Forces cancel → No gravity
                          </text>
                        </svg>
                      </div>
                      
                      {/* Electric analogy */}
                      <div className="text-center">
                        <h6 className="font-medium text-gray-800 mb-3">Franklin's Charged Can</h6>
                        <svg width="200" height="200" viewBox="0 0 200 200" className="border border-gray-300 bg-gray-50 rounded mx-auto">
                          {/* Charged can */}
                          <rect x="60" y="60" width="80" height="80" fill="none" stroke="#fbbf24" strokeWidth="6" rx="5" />
                          
                          {/* Point inside */}
                          <circle cx="100" cy="100" r="3" fill="#8b4513" />
                          
                          {/* Electric field lines canceling out */}
                          {Array.from({length: 4}, (_, i) => {
                            const positions = [
                              {x1: 80, y1: 100, x2: 95, y2: 100},
                              {x1: 120, y1: 100, x2: 105, y2: 100},
                              {x1: 100, y1: 80, x2: 100, y2: 95},
                              {x1: 100, y1: 120, x2: 100, y2: 105}
                            ];
                            const pos = positions[i];
                            return (
                              <line key={i} x1={pos.x1} y1={pos.y1} x2={pos.x2} y2={pos.y2} 
                                stroke="#dc2626" strokeWidth="2" markerEnd="url(#redArrow)" />
                            );
                          })}
                          
                          <text x="100" y="190" textAnchor="middle" className="text-xs fill-gray-600">
                            Forces cancel → No attraction
                          </text>
                        </svg>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
                      <p className="text-sm text-purple-800 text-center">
                        <strong>Priestley's Insight:</strong> If electric and gravitational forces follow similar patterns, 
                        then perhaps they follow similar mathematical laws!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Priestley's Conclusion */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Priestley's Revolutionary Suggestion:</h5>
                  <p className="text-yellow-900 text-sm mb-2">
                    Priestley reasoned that the appearance of no net electrical forces inside the metal 
                    can might be very similar to gravity within the hollow planet.
                  </p>
                  <p className="text-yellow-900 text-sm">
                    <strong>Priestley suggested that this experiment showed that electrical forces were very similar to gravitational forces.</strong>
                  </p>
                </div>

                <defs>
                  <marker id="blueArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                  </marker>
                  <marker id="redArrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#dc2626" />
                  </marker>
                </defs>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="coulomb" title="Coulomb's Experiments (1785)" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Coulomb's Background */}
                <div className="mb-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">Charles Coulomb (1738-1806)</h4>
                    <p className="text-purple-900 text-sm">
                      Charles Coulomb was very intrigued by Priestley's intuitive connection 
                      between electrostatic forces and gravitational forces. He immediately began to test the 
                      relationship using a torsion balance which was similar to a device that Cavendish had 
                      used to measure the universal gravitational constant G.
                    </p>
                  </div>
                </div>

                {/* Torsion Balance */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">The Torsion Balance</h4>
                  <p className="text-gray-700 mb-4">
                    He measured the force of electrostatic repulsion using the torsion balance as diagrammed below. 
                    If (b) and (a) have like charges then they will repel each other causing the rod to which (a) is attached to twist 
                    away from (b). The force necessary to twist the wire attached to the rod holding (a) could be determined by 
                    first finding the relationship between the angle of torsion and the repulsive force. Thus, Coulomb had a way to 
                    measure the force of repulsion.
                  </p>
                  
                  {/* Coulomb's Torsion Balance Video */}
                  <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Coulomb's Torsion Balance</h5>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Watch how Coulomb measured electric forces using his torsion balance
                    </p>
                    
                    <div className="flex justify-center">
                      <div className="relative w-full max-w-2xl" style={{paddingBottom: '56.25%', height: 0}}>
                        <iframe 
                          className="absolute top-0 left-0 w-full h-full rounded"
                          src="https://www.youtube.com/embed/B5LVoU_a08c?si=IfhBzLiMr-Q_Yw4D" 
                          title="YouTube video player" 
                          frameBorder="0" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          referrerPolicy="strict-origin-when-cross-origin" 
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coulomb's Experimental Discoveries */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Coulomb's Experimental Discoveries</h4>
                  
                  {/* Interactive Experiment Controls */}
                  <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Explore Coulomb's Relationships</h5>
                    
                    <div className="flex justify-center space-x-4 mb-6">
                      <button
                        onClick={() => setCoulombExperiment('charge')}
                        className={`px-4 py-2 rounded transition-colors ${
                          coulombExperiment === 'charge' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Effect of Charge
                      </button>
                      <button
                        onClick={() => setCoulombExperiment('distance')}
                        className={`px-4 py-2 rounded transition-colors ${
                          coulombExperiment === 'distance' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Effect of Distance
                      </button>
                    </div>
                    
                    {coulombExperiment === 'charge' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Charge 1 (q₁): {chargeValue1} μC
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={chargeValue1}
                              onChange={(e) => setChargeValue1(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Charge 2 (q₂): {chargeValue2} μC
                            </label>
                            <input
                              type="range"
                              min="1"
                              max="5"
                              value={chargeValue2}
                              onChange={(e) => setChargeValue2(parseInt(e.target.value))}
                              className="w-full"
                            />
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-center">
                            <p className="text-sm text-blue-800 mb-2">
                              <strong>Coulomb's First Discovery:</strong>
                            </p>
                            <div className="text-lg font-bold text-blue-900">
                              F ∝ q₁ × q₂ = {chargeValue1} × {chargeValue2} = {chargeValue1 * chargeValue2}
                            </div>
                            <p className="text-xs text-blue-700 mt-2">
                              Force is proportional to the product of the charges
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {coulombExperiment === 'distance' && (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Distance (r): {distanceValue} cm
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="5"
                            value={distanceValue}
                            onChange={(e) => setDistanceValue(parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                        
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-center">
                            <p className="text-sm text-green-800 mb-2">
                              <strong>Coulomb's Second Discovery:</strong>
                            </p>
                            <div className="text-lg font-bold text-green-900">
                              F ∝ 1/r² = 1/{distanceValue}² = 1/{distanceValue * distanceValue} = {(1/(distanceValue * distanceValue)).toFixed(3)}
                            </div>
                            <p className="text-xs text-green-700 mt-2">
                              Force is inversely proportional to the square of the distance
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Combined Relationship */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h5 className="font-semibold text-purple-800 mb-3">Coulomb's Combined Discovery</h5>
                  <div className="text-center mb-4">
                    <div className="text-lg font-bold text-purple-900 mb-2">
                      <BlockMath math="F_e \propto \frac{q_1 q_2}{r^2}" />
                    </div>
                    <p className="text-sm text-purple-800">
                      When Coulomb combined the two relationships together he found that the electrostatic 
                      force varied directly as the product of the two charges and inversely as the square of 
                      the distance between the two charged objects.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="law" title="Coulomb's Law" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Coulomb's Constant */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Determining Coulomb's Constant</h4>
                  <p className="text-gray-700 mb-4">
                    After repeated measurements where the charges and distances were known, he was 
                    able to replace the proportionality sign ∝ with (k) which is known as Coulomb's 
                    constant.
                  </p>
                  
                  <div className="bg-white p-6 rounded border border-gray-300 mb-4">
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-800 mb-3">Coulomb's Constant</h5>
                      <div className="text-2xl font-bold text-blue-900 mb-2">
                        <InlineMath math="k = 8.99 \times 10^9 \, \frac{\text{N} \cdot \text{m}^2}{\text{C}^2}" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Final Law */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Coulomb's Law of Electrostatic Force</h4>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-lg p-6 mb-6">
                    <div className="text-center">
                      <h5 className="font-semibold text-gray-800 mb-4">The Final Result:</h5>
                      <div className="text-3xl font-bold text-blue-900 mb-4">
                        <BlockMath math="F_e = k \frac{q_1 q_2}{r^2}" />
                      </div>
                      <p className="text-sm text-gray-700">
                        Where:
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-left">
                        <div className="space-y-1">
                          <p className="text-sm"><InlineMath math="F_e" /> = electrostatic force (N)</p>
                          <p className="text-sm"><InlineMath math="k" /> = Coulomb's constant</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm"><InlineMath math="q_1, q_2" /> = charges (C)</p>
                          <p className="text-sm"><InlineMath math="r" /> = distance between charges (m)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comparison with Newton's Law */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Comparison with Newton's Universal Gravitation</h4>
                  
                  <div className="bg-white p-6 rounded border border-gray-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Coulomb's Law */}
                      <div className="text-center">
                        <h6 className="font-semibold text-blue-800 mb-3">Coulomb's Law</h6>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="text-lg font-bold text-blue-900 mb-2">
                            <BlockMath math="F_e = k \frac{q_1 q_2}{r^2}" />
                          </div>
                          <div className="text-xs text-blue-700 space-y-1">
                            <p>• Acts on charges</p>
                            <p>• Can be attractive or repulsive</p>
                            <p>• Much stronger than gravity</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Newton's Law */}
                      <div className="text-center">
                        <h6 className="font-semibold text-green-800 mb-3">Newton's Gravitation</h6>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                          <div className="text-lg font-bold text-green-900 mb-2">
                            <BlockMath math="F_g = G \frac{m_1 m_2}{r^2}" />
                          </div>
                          <div className="text-xs text-green-700 space-y-1">
                            <p>• Acts on masses</p>
                            <p>• Always attractive</p>
                            <p>• Much weaker than electric</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <p className="text-sm text-yellow-800 text-center">
                        <strong>Priestley's Intuition Confirmed!</strong> The relationship is very similar to Newton's Universal Gravitation Law 
                        and the connection predicted by Priestley's intuitive leap was confirmed.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Force Calculator */}
                <div className="bg-white p-6 rounded border border-gray-300">
                  <h5 className="text-center font-semibold text-gray-800 mb-4">Interactive Force Calculator</h5>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Calculate the electrostatic force using Coulomb's Law
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        q₁: {chargeValue1} μC
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={chargeValue1}
                        onChange={(e) => setChargeValue1(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        q₂: {chargeValue2} μC
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={chargeValue2}
                        onChange={(e) => setChargeValue2(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        r: {distanceValue * 0.1} m
                      </label>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={distanceValue}
                        onChange={(e) => setDistanceValue(parseInt(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-700 mb-2">Electrostatic Force:</p>
                      <div className="text-xl font-bold text-purple-900">
                        F = {calculateForce().toExponential(2)} N
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        F = (8.99×10⁹) × ({chargeValue1}×10⁻⁶) × ({chargeValue2}×10⁻⁶) / ({distanceValue * 0.1})²
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="using-law" title="Using Coulomb's Law" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    When using Coulomb's Law, the equation does a great job of calculating the magnitude 
                    of the force, but it is not good at predicting the direction of the force.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Key Challenge:</h4>
                    <p className="text-yellow-900 text-sm">
                      The sign of the result from Coulomb's Law can be confusing. A negative result doesn't necessarily 
                      mean the force points in the "negative" direction!
                    </p>
                  </div>
                </div>

                {/* Interactive Examples */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Interactive Examples</h4>
                  
                  <div className="flex justify-center space-x-4 mb-6">
                    <button
                      onClick={() => {
                        setSelectedExample(1);
                        setShowForceDirection(false);
                        setShowCommonMistake(false);
                      }}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedExample === 1 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Example 1
                    </button>
                    <button
                      onClick={() => {
                        setSelectedExample(2);
                        setShowForceDirection(false);
                        setShowCommonMistake(false);
                      }}
                      className={`px-4 py-2 rounded transition-colors ${
                        selectedExample === 2 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Example 2
                    </button>
                  </div>

                  {/* Example Display */}
                  <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                    {(() => {
                      const data = getExampleData(selectedExample);
                      const force = calculateExampleForce(selectedExample);
                      
                      return (
                        <>
                          <h5 className="text-center font-semibold text-gray-800 mb-4">
                            Example {selectedExample}: Force Calculation and Direction
                          </h5>
                          
                          <p className="text-center text-sm text-gray-600 mb-6">
                            {data.description} separated by {data.r} m
                          </p>
                          
                          {/* Visual representation */}
                          <div className="flex justify-center mb-6">
                            <svg width="400" height="150" viewBox="0 0 400 150" className="border border-gray-300 bg-gray-50 rounded">
                              {/* Charge A */}
                              <circle cx="100" cy="75" r="25" fill="#ff6b6b" stroke="#dc2626" strokeWidth="3" />
                              <text x="100" y="80" textAnchor="middle" className="text-sm font-bold fill-white">A</text>
                              <text x="100" y="110" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                                {data.qALabel}
                              </text>
                              
                              {/* Charge B */}
                              <circle cx="300" cy="75" r="25" fill="#3b82f6" stroke="#2563eb" strokeWidth="3" />
                              <text x="300" y="80" textAnchor="middle" className="text-sm font-bold fill-white">B</text>
                              <text x="300" y="110" textAnchor="middle" className="text-xs font-bold fill-gray-700">
                                {data.qBLabel}
                              </text>
                              
                              {/* Distance indicator */}
                              <line x1="125" y1="75" x2="275" y2="75" stroke="#6b7280" strokeWidth="2" markerStart="url(#distanceMarker)" markerEnd="url(#distanceMarker)" />
                              <text x="200" y="65" textAnchor="middle" className="text-xs fill-gray-600">
                                {data.r} m
                              </text>
                              
                              {/* Force arrows - correct direction */}
                              {showForceDirection && (
                                <>
                                  {/* Force on A (toward B for attraction) */}
                                  <path d="M 130 75 L 170 75" stroke="#dc2626" strokeWidth="4" markerEnd="url(#forceArrowCorrect)" />
                                  <text x="150" y="95" textAnchor="middle" className="text-xs font-bold fill-green-600">
                                    {force.magnitude.toFixed(0)} N
                                  </text>
                                  <text x="150" y="50" textAnchor="middle" className="text-xs fill-green-600">
                                    Correct Direction!
                                  </text>
                                </>
                              )}
                              
                              {/* Force arrows - common mistake */}
                              {showCommonMistake && (
                                <>
                                  {/* Force on A (wrong direction) */}
                                  <path d="M 70 75 L 30 75" stroke="#dc2626" strokeWidth="4" markerEnd="url(#forceArrowWrong)" />
                                  <text x="50" y="95" textAnchor="middle" className="text-xs font-bold fill-red-600">
                                    {force.magnitude.toFixed(0)} N
                                  </text>
                                  <text x="50" y="50" textAnchor="middle" className="text-xs fill-red-600">
                                    Common Mistake!
                                  </text>
                                </>
                              )}
                              
                              <defs>
                                <marker id="distanceMarker" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                                  <circle cx="4" cy="4" r="2" fill="#6b7280" />
                                </marker>
                                <marker id="forceArrowCorrect" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                                  <polygon points="0 0, 12 4, 0 8" fill="#dc2626" />
                                </marker>
                                <marker id="forceArrowWrong" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                                  <polygon points="0 0, 12 4, 0 8" fill="#dc2626" />
                                </marker>
                              </defs>
                            </svg>
                          </div>
                          
                          {/* Calculation */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h6 className="font-semibold text-blue-800 mb-3">Coulomb's Law Calculation:</h6>
                            
                            <div className="space-y-2 text-sm">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <strong>Given:</strong>
                                  <br />q₁ = {data.qALabel}
                                  <br />q₂ = {data.qBLabel}
                                  <br />r = {data.r} m
                                </div>
                                <div>
                                  <strong>Formula:</strong>
                                  <br /><InlineMath math="F_e = k \frac{|q_1 q_2|}{r^2}" />
                                </div>
                                <div>
                                  <strong>Result:</strong>
                                  <br />F = {force.magnitude.toFixed(0)} N
                                  <br /><span className="text-xs text-gray-600">
                                    (Raw calculation: {force.withSign.toFixed(0)} N)
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Direction Analysis */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <button
                              onClick={() => {
                                setShowForceDirection(true);
                                setShowCommonMistake(false);
                              }}
                              className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                            >
                              Show Correct Direction
                            </button>
                            <button
                              onClick={() => {
                                setShowCommonMistake(true);
                                setShowForceDirection(false);
                              }}
                              className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                            >
                              Show Common Mistake
                            </button>
                            <button
                              onClick={() => {
                                setShowForceDirection(false);
                                setShowCommonMistake(false);
                              }}
                              className="px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              Reset View
                            </button>
                          </div>
                          
                          {/* Explanation based on what's shown */}
                          {showForceDirection && (
                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
                              <h6 className="font-semibold text-green-800 mb-2">Correct Analysis:</h6>
                              <p className="text-sm text-green-900">
                                <strong>Law of Charges:</strong> Unlike charges attract. Since A is positive and B is negative, 
                                they attract each other. Therefore, the force on A points toward B (to the right), 
                                regardless of the negative sign in the calculation.
                              </p>
                            </div>
                          )}
                          
                          {showCommonMistake && (
                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
                              <h6 className="font-semibold text-red-800 mb-2">Common Mistake:</h6>
                              <p className="text-sm text-red-900">
                                <strong>Wrong interpretation:</strong> Students often think that a negative result 
                                means the force points in the "negative" (leftward) direction. This is incorrect! 
                                The sign in Coulomb's Law indicates attraction/repulsion, not spatial direction.
                              </p>
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>

                {/* Key Principles */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Key Principles for Using Coulomb's Law</h4>
                  
                  <div className="space-y-4">
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h5 className="font-semibold text-purple-800 mb-2">1. Magnitude vs. Direction</h5>
                      <p className="text-sm text-purple-900">
                        <strong>Use Coulomb's Law for magnitude only.</strong> The equation tells you how strong the force is, 
                        but use the Law of Charges and the physical situation to determine the direction.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">2. Sign Interpretation</h5>
                      <ul className="text-sm text-blue-900 space-y-1">
                        <li>• <strong>Negative result:</strong> Attractive force (unlike charges)</li>
                        <li>• <strong>Positive result:</strong> Repulsive force (like charges)</li>
                        <li>• <strong>The sign does NOT indicate spatial direction!</strong></li>
                      </ul>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">3. Recommended Approach</h5>
                      <ol className="text-sm text-green-900 space-y-1 list-decimal list-inside">
                        <li>Calculate the magnitude using <InlineMath math="F = k \frac{|q_1 q_2|}{r^2}" /></li>
                        <li>Use the Law of Charges to determine if it's attractive or repulsive</li>
                        <li>Use the physical setup to determine the spatial direction</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Practice Problems Setup */}
                <div className="bg-white p-6 rounded border border-gray-300">
                  <h5 className="text-center font-semibold text-gray-800 mb-4">Quick Practice</h5>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Test your understanding with these scenarios
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Scenario 1 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h6 className="font-semibold text-blue-800 mb-2">Scenario A</h6>
                      <p className="text-sm text-blue-900 mb-3">
                        Two positive charges: +5 μC and +3 μC
                        <br />Distance: 0.1 m apart
                      </p>
                      <div className="text-center">
                        <svg width="200" height="80" viewBox="0 0 200 80" className="border border-blue-300 bg-white rounded">
                          <circle cx="50" cy="40" r="15" fill="#ff6b6b" stroke="#dc2626" strokeWidth="2" />
                          <text x="50" y="45" textAnchor="middle" className="text-xs font-bold fill-white">+</text>
                          
                          <circle cx="150" cy="40" r="15" fill="#ff6b6b" stroke="#dc2626" strokeWidth="2" />
                          <text x="150" y="45" textAnchor="middle" className="text-xs font-bold fill-white">+</text>
                          
                          <path d="M 35 40 L 15 40" stroke="#dc2626" strokeWidth="3" markerEnd="url(#repelArrow1)" />
                          <path d="M 165 40 L 185 40" stroke="#dc2626" strokeWidth="3" markerEnd="url(#repelArrow2)" />
                          
                          <text x="100" y="65" textAnchor="middle" className="text-xs fill-blue-800">
                            Like charges → Repulsion
                          </text>
                        </svg>
                      </div>
                      <p className="text-xs text-blue-700 mt-2 text-center">
                        Coulomb's Law gives: <strong>+13.5 N</strong> (positive = repulsive)
                      </p>
                    </div>
                    
                    {/* Scenario 2 */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h6 className="font-semibold text-green-800 mb-2">Scenario B</h6>
                      <p className="text-sm text-green-900 mb-3">
                        Opposite charges: +4 μC and -6 μC
                        <br />Distance: 0.2 m apart
                      </p>
                      <div className="text-center">
                        <svg width="200" height="80" viewBox="0 0 200 80" className="border border-green-300 bg-white rounded">
                          <circle cx="50" cy="40" r="15" fill="#ff6b6b" stroke="#dc2626" strokeWidth="2" />
                          <text x="50" y="45" textAnchor="middle" className="text-xs font-bold fill-white">+</text>
                          
                          <circle cx="150" cy="40" r="15" fill="#3b82f6" stroke="#2563eb" strokeWidth="2" />
                          <text x="150" y="45" textAnchor="middle" className="text-xs font-bold fill-white">−</text>
                          
                          <path d="M 65 40 L 85 40" stroke="#dc2626" strokeWidth="3" markerEnd="url(#attractArrow1)" />
                          <path d="M 135 40 L 115 40" stroke="#dc2626" strokeWidth="3" markerEnd="url(#attractArrow2)" />
                          
                          <text x="100" y="65" textAnchor="middle" className="text-xs fill-green-800">
                            Unlike charges → Attraction
                          </text>
                        </svg>
                      </div>
                      <p className="text-xs text-green-700 mt-2 text-center">
                        Coulomb's Law gives: <strong>-5.4 N</strong> (negative = attractive)
                      </p>
                    </div>
                  </div>
                  
                  <defs>
                    <marker id="repelArrow1" markerWidth="10" markerHeight="6" refX="10" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#dc2626" />
                    </marker>
                    <marker id="repelArrow2" markerWidth="10" markerHeight="6" refX="10" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#dc2626" />
                    </marker>
                    <marker id="attractArrow1" markerWidth="10" markerHeight="6" refX="10" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#dc2626" />
                    </marker>
                    <marker id="attractArrow2" markerWidth="10" markerHeight="6" refX="10" refY="3" orient="auto">
                      <polygon points="0 0, 10 3, 0 6" fill="#dc2626" />
                    </marker>
                  </defs>
                </div>

                {/* Summary Box */}
                <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-lg p-6">
                  <h5 className="font-bold text-yellow-800 mb-3 text-center">⚠️ Remember This!</h5>
                  <div className="text-center">
                    <p className="text-sm text-yellow-900 mb-2">
                      <strong>Think of Coulomb's Law as an absolute value equation where the signs of the charges are not important.</strong>
                    </p>
                    <p className="text-sm text-yellow-900">
                      <strong>Then use the context of the question to determine the direction of the force.</strong>
                    </p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="newton-third" title="Coulomb's Law and Newton's 3rd Law" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Introduction */}
                <div className="mb-6">
                  <p className="text-gray-700 mb-4">
                    In the example above we were considering the electrostatic force between A and B and we 
                    focussed our attention on charge A. What if we had been asked about the force on charge B?
                  </p>
                  
                  <p className="text-gray-700 mb-4">
                    Coulomb's Law indicates the same magnitude of force acts on B and on A, but the direction of the force on B would be to the left since 
                    the negative B is attracted to the positive A. This is an example of Newton's 3rd Law – 
                    i.e. an action force (A on B) is accompanied by a reaction force (B on A) that is equal in 
                    magnitude and opposite in direction.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Essential Problem-Solving Rule:</h4>
                    <p className="text-yellow-900 text-sm">
                      In terms of problem solving, it is essential that we focus on the forces acting on the charge of interest 
                      and to ignore the reaction forces acting on the other charge(s). You will learn more about this in the examples 
                      and assignment problems below.
                    </p>
                  </div>
                </div>

                {/* Interactive Demonstration */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Interactive Newton's 3rd Law Demonstration</h4>
                  
                  <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">
                      Action-Reaction Force Pairs
                    </h5>
                    <p className="text-center text-sm text-gray-600 mb-4">
                      Choose which charge to focus on and see how Newton's 3rd Law applies
                    </p>
                    
                    <div className="flex justify-center space-x-4 mb-6">
                      <button
                        onClick={() => {
                          setFocusCharge('A');
                          setShowActionReaction(false);
                        }}
                        className={`px-4 py-2 rounded transition-colors ${
                          focusCharge === 'A' 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Focus on Charge A
                      </button>
                      <button
                        onClick={() => {
                          setFocusCharge('B');
                          setShowActionReaction(false);
                        }}
                        className={`px-4 py-2 rounded transition-colors ${
                          focusCharge === 'B' 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Focus on Charge B
                      </button>
                    </div>
                    
                    <div className="flex justify-center mb-6">
                      <button
                        onClick={() => setShowActionReaction(!showActionReaction)}
                        className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                      >
                        {showActionReaction ? 'Hide' : 'Show'} Action-Reaction Forces
                      </button>
                    </div>
                    
                    <div className="flex justify-center">
                      <svg width="500" height="200" viewBox="0 0 500 200" className="border border-gray-300 bg-gray-50 rounded">
                        {/* Background grid for reference */}
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e5e5" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="500" height="200" fill="url(#grid)" />
                        
                        {/* Charge A */}
                        <circle 
                          cx="150" 
                          cy="100" 
                          r="30" 
                          fill={focusCharge === 'A' ? "#ff6b6b" : "#ffb3b3"} 
                          stroke={focusCharge === 'A' ? "#dc2626" : "#fca5a5"} 
                          strokeWidth={focusCharge === 'A' ? "4" : "2"}
                        />
                        <text x="150" y="105" textAnchor="middle" className="text-lg font-bold fill-white">A</text>
                        <text x="150" y="140" textAnchor="middle" className="text-sm font-bold fill-gray-700">
                          +20 μC
                        </text>
                        
                        {/* Charge B */}
                        <circle 
                          cx="350" 
                          cy="100" 
                          r="30" 
                          fill={focusCharge === 'B' ? "#3b82f6" : "#93c5fd"} 
                          stroke={focusCharge === 'B' ? "#2563eb" : "#60a5fa"} 
                          strokeWidth={focusCharge === 'B' ? "4" : "2"}
                        />
                        <text x="350" y="105" textAnchor="middle" className="text-lg font-bold fill-white">B</text>
                        <text x="350" y="140" textAnchor="middle" className="text-sm font-bold fill-gray-700">
                          -15 μC
                        </text>
                        
                        {/* Distance indicator */}
                        <line x1="180" y1="100" x2="320" y2="100" stroke="#6b7280" strokeWidth="2" markerStart="url(#distMarker)" markerEnd="url(#distMarker)" />
                        <text x="250" y="90" textAnchor="middle" className="text-xs fill-gray-600">
                          0.25 m
                        </text>
                        
                        {/* Force on focused charge */}
                        {showActionReaction && focusCharge === 'A' && (
                          <>
                            {/* Force on A (toward B) */}
                            <path d="M 185 100 L 225 100" stroke="#dc2626" strokeWidth="5" markerEnd="url(#forceArrowA)" />
                            <text x="205" y="85" textAnchor="middle" className="text-sm font-bold fill-red-600">
                              Force on A
                            </text>
                            <text x="205" y="120" textAnchor="middle" className="text-xs fill-red-600">
                              43.2 N →
                            </text>
                            
                            {/* Highlight focused charge */}
                            <circle cx="150" cy="100" r="35" fill="none" stroke="#dc2626" strokeWidth="3" strokeDasharray="5,5">
                              <animate attributeName="stroke-opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                          </>
                        )}
                        
                        {showActionReaction && focusCharge === 'B' && (
                          <>
                            {/* Force on B (toward A) */}
                            <path d="M 315 100 L 275 100" stroke="#2563eb" strokeWidth="5" markerEnd="url(#forceArrowB)" />
                            <text x="295" y="85" textAnchor="middle" className="text-sm font-bold fill-blue-600">
                              Force on B
                            </text>
                            <text x="295" y="120" textAnchor="middle" className="text-xs fill-blue-600">
                              43.2 N ←
                            </text>
                            
                            {/* Highlight focused charge */}
                            <circle cx="350" cy="100" r="35" fill="none" stroke="#2563eb" strokeWidth="3" strokeDasharray="5,5">
                              <animate attributeName="stroke-opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                            </circle>
                          </>
                        )}
                        
                        {/* Show both forces when demonstrating Newton's 3rd Law */}
                        {showActionReaction && (
                          <>
                            {/* Dotted lines showing the pair */}
                            <line x1="250" y1="60" x2="250" y2="140" stroke="#9333ea" strokeWidth="2" strokeDasharray="3,3" />
                            <text x="250" y="50" textAnchor="middle" className="text-xs font-bold fill-purple-600">
                              Newton's 3rd Law Pair
                            </text>
                            <text x="250" y="160" textAnchor="middle" className="text-xs fill-purple-600">
                              Equal magnitude, opposite direction
                            </text>
                          </>
                        )}
                        
                        <defs>
                          <marker id="distMarker" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
                            <circle cx="4" cy="4" r="2" fill="#6b7280" />
                          </marker>
                          <marker id="forceArrowA" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                            <polygon points="0 0, 12 4, 0 8" fill="#dc2626" />
                          </marker>
                          <marker id="forceArrowB" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                            <polygon points="0 0, 12 4, 0 8" fill="#2563eb" />
                          </marker>
                        </defs>
                      </svg>
                    </div>
                    
                    {/* Explanation based on focus */}
                    {showActionReaction && (
                      <div className="mt-6">
                        {focusCharge === 'A' ? (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h6 className="font-semibold text-red-800 mb-2">Force Analysis: Focus on Charge A</h6>
                            <div className="text-sm text-red-900 space-y-2">
                              <p><strong>Question:</strong> What force does charge B exert on charge A?</p>
                              <p><strong>Answer:</strong> 43.2 N toward the right (toward charge B)</p>
                              <p><strong>Reasoning:</strong> A is positive, B is negative → unlike charges attract → force on A points toward B</p>
                              <p className="text-xs bg-red-100 p-2 rounded">
                                <strong>Focus Rule:</strong> We only consider the force ON charge A. We ignore any force that A might exert on other charges.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h6 className="font-semibold text-blue-800 mb-2">Force Analysis: Focus on Charge B</h6>
                            <div className="text-sm text-blue-900 space-y-2">
                              <p><strong>Question:</strong> What force does charge A exert on charge B?</p>
                              <p><strong>Answer:</strong> 43.2 N toward the left (toward charge A)</p>
                              <p><strong>Reasoning:</strong> B is negative, A is positive → unlike charges attract → force on B points toward A</p>
                              <p className="text-xs bg-blue-100 p-2 rounded">
                                <strong>Focus Rule:</strong> We only consider the force ON charge B. We ignore any force that B might exert on other charges.
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Newton's 3rd Law Explanation */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Understanding Newton's 3rd Law in Electrostatics</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Action Force */}
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h5 className="font-semibold text-red-800 mb-3">Action Force</h5>
                      <div className="space-y-2 text-sm text-red-900">
                        <p><strong>Force:</strong> A exerts force on B</p>
                        <p><strong>Magnitude:</strong> 43.2 N</p>
                        <p><strong>Direction:</strong> B feels attraction toward A (leftward)</p>
                        <p><strong>Physics:</strong> Unlike charges attract</p>
                      </div>
                    </div>
                    
                    {/* Reaction Force */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-3">Reaction Force</h5>
                      <div className="space-y-2 text-sm text-blue-900">
                        <p><strong>Force:</strong> B exerts force on A</p>
                        <p><strong>Magnitude:</strong> 43.2 N (same!)</p>
                        <p><strong>Direction:</strong> A feels attraction toward B (rightward)</p>
                        <p><strong>Physics:</strong> Unlike charges attract</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h5 className="font-semibold text-purple-800 mb-2">Newton's 3rd Law Summary:</h5>
                    <div className="text-sm text-purple-900 space-y-1">
                      <p>• <strong>Equal Magnitude:</strong> Both forces have exactly the same strength (43.2 N)</p>
                      <p>• <strong>Opposite Direction:</strong> Forces point toward each other (attraction)</p>
                      <p>• <strong>Different Objects:</strong> One force acts on A, the other acts on B</p>
                      <p>• <strong>Simultaneous:</strong> Both forces exist at the same time</p>
                    </div>
                  </div>
                </div>

                {/* Problem-Solving Strategy */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Problem-Solving Strategy</h4>
                  
                  <div className="bg-white p-6 rounded border border-gray-300">
                    <h5 className="font-semibold text-gray-800 mb-4 text-center">Step-by-Step Approach</h5>
                    
                    <div className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                        <div>
                          <h6 className="font-semibold text-gray-800">Identify the Charge of Interest</h6>
                          <p className="text-sm text-gray-700">
                            Clearly determine which charge you're analyzing. This is the charge that feels the force.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                        <div>
                          <h6 className="font-semibold text-gray-800">Identify the Source Charges</h6>
                          <p className="text-sm text-gray-700">
                            Determine which other charges are exerting forces on your charge of interest.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                        <div>
                          <h6 className="font-semibold text-gray-800">Calculate Each Force</h6>
                          <p className="text-sm text-gray-700">
                            Use Coulomb's Law to find the magnitude of each force acting on your charge of interest.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                        <div>
                          <h6 className="font-semibold text-gray-800">Determine Directions</h6>
                          <p className="text-sm text-gray-700">
                            Use the Law of Charges and geometry to find the direction of each force.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">!</div>
                        <div>
                          <h6 className="font-semibold text-red-800">Ignore Reaction Forces</h6>
                          <p className="text-sm text-red-700">
                            Do NOT include forces that your charge of interest exerts on other charges. Only focus on forces acting ON your charge.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Common Mistakes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h5 className="font-semibold text-yellow-800 mb-3">⚠️ Common Mistakes to Avoid</h5>
                  <div className="space-y-2 text-sm text-yellow-900">
                    <p>• <strong>Including reaction forces:</strong> Don't include forces that your charge exerts on others</p>
                    <p>• <strong>Double-counting:</strong> Each force should only be counted once</p>
                    <p>• <strong>Wrong direction:</strong> Always check which charge feels the force you're calculating</p>
                    <p>• <strong>Mixing up pairs:</strong> Remember that Newton's 3rd Law forces act on different objects</p>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Example 1 - Electrostatic Force Between Two Charges" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the electrostatic force of attraction between a –8.0 × 10⁻⁶ C charge and a 
                  +6.0 × 10⁻⁵ C charge separated by 0.050 m?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>q₁ = -8.0 × 10⁻⁶ C</li>
                        <li>q₂ = +6.0 × 10⁻⁵ C</li>
                        <li>r = 0.050 m</li>
                        <li>k = 8.99 × 10⁹ N⋅m²/C²</li>
                        <li>F_e = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Formula:</span>
                      <div className="my-3">
                        <BlockMath math="F_e = k \frac{q_1 q_2}{r^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Calculation:</span>
                      <div className="my-3">
                        <BlockMath math="F_e = \frac{8.99 \times 10^9 \text{ N} \cdot \text{m}^2/\text{C}^2 \times (8.0 \times 10^{-6} \text{ C}) \times (6.0 \times 10^{-5} \text{ C})}{(0.050 \text{ m})^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = \frac{8.99 \times 10^9 \times 48.0 \times 10^{-11}}{2.5 \times 10^{-3}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = \frac{431.52 \times 10^{-2}}{2.5 \times 10^{-3}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = 1.7 \times 10^2 \text{ N}" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <span className="font-medium">Direction Analysis:</span>
                      <p className="text-sm text-blue-900 mt-2">
                        <strong>Law of Charges:</strong> Since we have unlike charges (negative and positive), 
                        they attract each other.
                      </p>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> F_e = <span className="font-bold">1.7 × 10² N attraction</span>
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Coulomb's Law is used to calculate the magnitude of the electrostatic force. 
                        The direction of the force is determined by the Law of Charges (like charges repel, unlike charges attract). 
                        Since + and – charges attract, this is an attractive force.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Example 2 - Electrostatic Force and Acceleration" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A fixed charge of +5.0 × 10⁻⁴ C acts upon a 5.0 g mass which has a charge of 
                  +7.0 × 10⁻⁴ C. If the charges are 0.50 m away from one another, what is the 
                  acceleration experienced by the 5.0 g mass?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>q₁ = +5.0 × 10⁻⁴ C (fixed charge)</li>
                        <li>q₂ = +7.0 × 10⁻⁴ C (movable charge)</li>
                        <li>r = 0.50 m</li>
                        <li>m = 5.0 g = 0.0050 kg</li>
                        <li>k = 8.99 × 10⁹ N·m²/C²</li>
                        <li>a = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 1: Calculate the electrostatic force</span>
                      <div className="my-3">
                        <BlockMath math="F_e = k \frac{q_1 q_2}{r^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = \frac{8.99 \times 10^9 \text{ N} \cdot \text{m}^2/\text{C}^2 \times (5.0 \times 10^{-4} \text{ C}) \times (7.0 \times 10^{-4} \text{ C})}{(0.50 \text{ m})^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = \frac{8.99 \times 10^9 \times 35.0 \times 10^{-8}}{0.25}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = \frac{314.65 \times 10^1}{0.25}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_e = 12586 \text{ N}" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <span className="font-medium">Direction Analysis:</span>
                      <p className="text-sm text-blue-900 mt-2">
                        <strong>Law of Charges:</strong> Since both charges are positive (like charges), 
                        they repel each other. The force on the 5.0 g mass is directed away from the 5.0 × 10⁻⁴ C charge.
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the acceleration using Newton's 2nd Law</span>
                      <div className="my-3">
                        <BlockMath math="F = ma" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = \frac{F}{m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = \frac{12586 \text{ N}}{0.0050 \text{ kg}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="a = 2.52 \times 10^6 \text{ m/s}^2" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> a = <span className="font-bold">2.52 × 10⁶ m/s² away from the 5.0 × 10⁻⁴ C charge</span>
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> This is an enormous acceleration! For comparison, Earth's gravitational 
                        acceleration is only 9.8 m/s². This demonstrates the incredible strength of electrostatic forces 
                        compared to gravitational forces at these scales.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example3" title="Example 3 - Finding Charge from Force and Distance" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If the force between two equally charged particles is 9.0 × 10⁶ N and the distance 
                  between them is 0.50 cm, what is the charge on each particle?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>F_e = 9.0 × 10⁶ N</li>
                        <li>r = 0.50 cm = 0.0050 m</li>
                        <li>q₁ = q₂ = q (equally charged)</li>
                        <li>k = 8.99 × 10⁹ N⋅m²/C²</li>
                        <li>q = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Formula:</span>
                      <div className="my-3">
                        <BlockMath math="F_e = k \frac{q_1 q_2}{r^2}" />
                      </div>
                      <p className="text-sm text-gray-600">Since q₁ = q₂ = q:</p>
                      <div className="my-3">
                        <BlockMath math="F_e = k \frac{q \cdot q}{r^2} = k \frac{q^2}{r^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Solve for q:</span>
                      <div className="my-3">
                        <BlockMath math="q^2 = \frac{F_e r^2}{k}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = \sqrt{\frac{F_e r^2}{k}}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Calculation:</span>
                      <div className="my-3">
                        <BlockMath math="q = \sqrt{\frac{9.0 \times 10^6 \text{ N} \times (0.0050 \text{ m})^2}{8.99 \times 10^9 \text{ N} \cdot \text{m}^2/\text{C}^2}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = \sqrt{\frac{9.0 \times 10^6 \times 2.5 \times 10^{-5}}{8.99 \times 10^9}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = \sqrt{\frac{225}{8.99 \times 10^9}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = \sqrt{2.50 \times 10^{-8}}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="q = 1.58 \times 10^{-4} \text{ C}" />
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
                      <span className="font-medium">Direction Analysis:</span>
                      <p className="text-sm text-blue-900 mt-2">
                        <strong>Repulsive Force:</strong> Since the problem states there is a force between equally charged particles, 
                        and the force is repulsive (as indicated by the large magnitude), both particles have the same type of charge.
                      </p>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> q = <span className="font-bold">1.58 × 10⁻⁴ C</span> (each particle)
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> Since both charges are equal and like charges repel with the given force, 
                        each particle carries the same magnitude of charge. The charges could both be positive or both be negative.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example4" title="Example 4 - Force Changes with Distance and Charge" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  When two charged particles are set a certain distance apart, a repulsive force of 8.0 N 
                  exists. What is the force of repulsion between the two particles if the distance between 
                  them is doubled and one of the charges is tripled in size?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Initial force: F₁ = 8.0 N</li>
                        <li>Initial distance: r₁</li>
                        <li>Initial charges: q₁ and q₂</li>
                        <li>New distance: r₂ = 2r₁ (doubled)</li>
                        <li>New charges: q₁' = q₁ and q₂' = 3q₂ (one tripled)</li>
                        <li>New force: F₂ = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Initial Situation:</span>
                      <div className="my-3">
                        <BlockMath math="F_1 = k \frac{q_1 q_2}{r_1^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="8.0 \text{ N} = k \frac{q_1 q_2}{r_1^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">New Situation:</span>
                      <div className="my-3">
                        <BlockMath math="F_2 = k \frac{q_1' q_2'}{r_2^2}" />
                      </div>
                      <p className="text-sm text-gray-600">Substituting the new values:</p>
                      <div className="my-3">
                        <BlockMath math="F_2 = k \frac{q_1 \cdot (3q_2)}{(2r_1)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_2 = k \frac{3q_1 q_2}{4r_1^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_2 = \frac{3}{4} \cdot k \frac{q_1 q_2}{r_1^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Applying the Proportion Method:</span>
                      <p className="text-sm text-gray-600 mb-2">
                        Since we know that F₁ = k(q₁q₂)/r₁², we can substitute this into our expression for F₂:
                      </p>
                      <div className="my-3">
                        <BlockMath math="F_2 = \frac{3}{4} \cdot F_1" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_2 = \frac{3}{4} \times 8.0 \text{ N}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_2 = 6.0 \text{ N}" />
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-4">
                      <span className="font-medium">Alternative Method - Step by Step:</span>
                      <p className="text-sm text-green-900 mt-2 mb-3">
                        We can also solve this by applying each change one at a time:
                      </p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Step 1:</strong> Triple one charge → Force becomes 3 × 8.0 N = 24.0 N
                        </div>
                        <div>
                          <strong>Step 2:</strong> Double the distance → Force becomes 24.0 N ÷ 2² = 24.0 N ÷ 4 = 6.0 N
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> F₂ = <span className="font-bold">6.0 N</span>
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Analysis:</strong> Tripling one charge increases the force by a factor of 3, 
                        but doubling the distance decreases the force by a factor of 4 (since force ∝ 1/r²). 
                        The net effect is: 8.0 N × 3 ÷ 4 = 6.0 N.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example5" title="Example 5 - Equilibrium Position Between Two Charges" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A +40 μC charge and a +160 μC charge are set 9.0 m apart. An unknown positive
                  charge is placed on a line joining the first two charges and it is allowed to move until it
                  comes to rest between the two charges. At what distance measured from the 160 μC
                  charge will the unknown charge come to rest?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Initial Setup</h5>
                    <div className="text-center">
                      <svg width="400" height="120" className="mx-auto mb-2">
                        {/* Charge A */}
                        <circle cx="50" cy="60" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                        <text x="50" y="66" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">A</text>
                        <text x="50" y="90" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+40 μC</text>
                        
                        {/* Charge B */}
                        <circle cx="350" cy="60" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                        <text x="350" y="66" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">B</text>
                        <text x="350" y="90" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+160 μC</text>
                        
                        {/* Distance line */}
                        <line x1="65" y1="60" x2="335" y2="60" stroke="#636e72" strokeWidth="2"/>
                        <text x="200" y="45" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#2d3436">9.0 m</text>
                        
                        {/* Distance markers */}
                        <line x1="65" y1="55" x2="65" y2="65" stroke="#636e72" strokeWidth="2"/>
                        <line x1="335" y1="55" x2="335" y2="65" stroke="#636e72" strokeWidth="2"/>
                      </svg>
                    </div>
                  </div>

                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Key Insight:</span>
                      <p className="text-sm text-gray-600 mt-1">
                        The charge will come to rest where the forces from A and B on C are equal to each other.
                        At equilibrium: F<sub>AC</sub> = F<sub>BC</sub>
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Equilibrium Position</h5>
                      <div className="text-center">
                        <svg width="450" height="140" className="mx-auto mb-2">
                          {/* Charge A */}
                          <circle cx="50" cy="70" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                          <text x="50" y="76" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">A</text>
                          <text x="50" y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+40 μC</text>
                          
                          {/* Charge C */}
                          <circle cx="270" cy="70" r="12" fill="#74b9ff" stroke="#0984e3" strokeWidth="2"/>
                          <text x="270" y="76" textAnchor="middle" fontSize="11" fontWeight="bold" fill="white">C</text>
                          <text x="270" y="100" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#2d3436">(+) charge</text>
                          
                          {/* Charge B */}
                          <circle cx="400" cy="70" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                          <text x="400" y="76" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">B</text>
                          <text x="400" y="100" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+160 μC</text>
                          
                          {/* Distance lines */}
                          <line x1="65" y1="70" x2="255" y2="70" stroke="#636e72" strokeWidth="1" strokeDasharray="5,5"/>
                          <text x="160" y="60" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">9.0 - x</text>
                          
                          <line x1="285" y1="70" x2="385" y2="70" stroke="#636e72" strokeWidth="1" strokeDasharray="5,5"/>
                          <text x="335" y="60" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">x</text>
                          
                          <line x1="65" y1="120" x2="385" y2="120" stroke="#636e72" strokeWidth="2"/>
                          <text x="225" y="135" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">9.0 m</text>
                          
                          {/* Force arrows */}
                          <defs>
                            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#e17055" />
                            </marker>
                          </defs>
                          
                          <line x1="255" y1="70" x2="220" y2="70" stroke="#e17055" strokeWidth="3" markerEnd="url(#arrowhead)"/>
                          <text x="237" y="55" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e17055">F<tspan fontSize="8">AC</tspan></text>
                          
                          <line x1="285" y1="70" x2="320" y2="70" stroke="#e17055" strokeWidth="3" markerEnd="url(#arrowhead)"/>
                          <text x="302" y="55" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#e17055">F<tspan fontSize="8">BC</tspan></text>
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Setting up the equilibrium condition:</span>
                      <div className="my-3">
                        <BlockMath math="F_{AC} = F_{BC}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="k \frac{q_A q_C}{(9.0-x)^2} = k \frac{q_B q_C}{x^2}" />
                      </div>
                      <p className="text-sm text-gray-600">The k and q<sub>C</sub> terms cancel out:</p>
                      <div className="my-3">
                        <BlockMath math="\frac{q_A}{(9.0-x)^2} = \frac{q_B}{x^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substituting the charge values:</span>
                      <div className="my-3">
                        <BlockMath math="\frac{40 \times 10^{-6}}{(9.0-x)^2} = \frac{160 \times 10^{-6}}{x^2}" />
                      </div>
                      <p className="text-sm text-gray-600">The 10<sup>-6</sup> terms cancel out:</p>
                      <div className="my-3">
                        <BlockMath math="\frac{40}{(9.0-x)^2} = \frac{160}{x^2}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Cross-multiplying:</span>
                      <div className="my-3">
                        <BlockMath math="40x^2 = 160(9.0-x)^2" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="x^2 = 4(9.0-x)^2" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Taking the square root of both sides:</span>
                      <div className="my-3">
                        <BlockMath math="x = 2(9.0-x)" />
                      </div>
                      <p className="text-sm text-gray-600">Note: We take the positive root since distance must be positive</p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Solving for x:</span>
                      <div className="space-y-2">
                        <div className="my-3">
                          <BlockMath math="x = 18.0 - 2x" />
                        </div>
                        <div className="my-3">
                          <BlockMath math="3x = 18.0" />
                        </div>
                        <div className="my-3">
                          <BlockMath math="x = 6.0 \text{ m}" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                      <span className="font-medium text-green-800">Alternative Approach:</span>
                      <p className="text-sm text-green-900 mt-2">
                        From the ratio: 40/160 = 1/4, so √(1/4) = 1/2
                      </p>
                      <p className="text-sm text-green-900">
                        This means x/(9.0-x) = 1/2, so x = 0.5(9.0-x) = 4.5 - 0.5x
                      </p>
                      <p className="text-sm text-green-900">
                        Therefore: 1.5x = 4.5, so x = 3.0 m
                      </p>
                      <p className="text-sm text-red-700 mt-2">
                        <strong>Note:</strong> This gives the distance from the 40 μC charge. 
                        The distance from the 160 μC charge is 9.0 - 3.0 = 6.0 m.
                      </p>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The unknown charge will come to rest at 
                      <span className="font-bold"> 6.0 m</span> from the 160 μC charge.
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Physical Interpretation:</strong> The positive charge settles closer to the smaller charge (40 μC) 
                        because it needs to be farther from the larger charge (160 μC) to balance the forces. The equilibrium 
                        position divides the 9.0 m distance in a 1:2 ratio (3.0 m : 6.0 m), which matches the 1:4 charge ratio 
                        when considering the inverse square relationship.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Verification</h5>
                      <p className="text-sm text-blue-900 mb-2">Let's verify our answer by checking that the forces are indeed equal:</p>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Force from A on C:</strong> F<sub>AC</sub> = k(40×10⁻⁶)(q<sub>C</sub>)/(3.0)² = k·q<sub>C</sub>·4.44×10⁻⁶
                        </div>
                        <div>
                          <strong>Force from B on C:</strong> F<sub>BC</sub> = k(160×10⁻⁶)(q<sub>C</sub>)/(6.0)² = k·q<sub>C</sub>·4.44×10⁻⁶
                        </div>
                        <div className="text-green-700 font-medium">
                          ✓ The forces are equal, confirming our answer!
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example6" title="Example 6 - Net Electrostatic Force with Vector Components" theme="green" onAskAI={onAIAccordionContent}>
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  From the diagram below, determine the net electrostatic force on charge C.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Given Configuration</h5>
                    <div className="text-center">
                      <svg width="500" height="300" className="mx-auto mb-2">
                        {/* Grid for reference */}
                        <defs>
                          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e0e0e0" strokeWidth="0.5"/>
                          </pattern>
                        </defs>
                        <rect width="500" height="300" fill="url(#grid)" />
                        
                        {/* Coordinate system */}
                        <defs>
                          <marker id="arrowhead-coord" markerWidth="8" markerHeight="6" 
                           refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#666" />
                          </marker>
                        </defs>
                        
                        {/* X-axis (East) */}
                        <line x1="50" y1="250" x2="120" y2="250" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-coord)"/>
                        <text x="130" y="255" fontSize="12" fontWeight="bold" fill="#666">East</text>
                        
                        {/* Y-axis (North) */}
                        <line x1="50" y1="250" x2="50" y2="180" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-coord)"/>
                        <text x="20" y="175" fontSize="12" fontWeight="bold" fill="#666">North</text>
                        
                        {/* Charge A */}
                        <circle cx="150" cy="200" r="15" fill="#74b9ff" stroke="#0984e3" strokeWidth="2"/>
                        <text x="150" y="206" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">A</text>
                        <text x="150" y="225" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">-2.00 μC</text>
                        
                        {/* Charge B */}
                        <circle cx="150" cy="125" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                        <text x="150" y="131" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">B</text>
                        <text x="150" y="110" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+3.00 μC</text>
                        
                        {/* Charge C */}
                        <circle cx="250" cy="200" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                        <text x="250" y="206" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">C</text>
                        <text x="250" y="225" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#2d3436">+4.00 μC</text>
                        
                        {/* Distance lines and labels */}
                        <line x1="150" y1="180" x2="150" y2="145" stroke="#636e72" strokeWidth="1" strokeDasharray="3,3"/>
                        <text x="125" y="165" fontSize="10" fontWeight="bold" fill="#2d3436">0.075 m</text>
                        
                        <line x1="165" y1="200" x2="235" y2="200" stroke="#636e72" strokeWidth="1" strokeDasharray="3,3"/>
                        <text x="200" y="190" fontSize="10" fontWeight="bold" fill="#2d3436">0.10 m</text>
                        
                        {/* Diagonal distance AC */}
                        <line x1="165" y1="215" x2="235" y2="215" stroke="#636e72" strokeWidth="1" strokeDasharray="2,2"/>
                        <line x1="235" y1="215" x2="235" y2="185" stroke="#636e72" strokeWidth="1" strokeDasharray="2,2"/>
                        <text x="300" y="205" fontSize="10" fontWeight="bold" fill="#2d3436">d<tspan fontSize="8">AC</tspan> = √(0.10² + 0.075²)</text>
                        <text x="300" y="220" fontSize="10" fontWeight="bold" fill="#2d3436">d<tspan fontSize="8">AC</tspan> = 0.125 m</text>
                        
                        {/* Angle marking */}
                        <path d="M 165 200 A 15 15 0 0 0 175 190" stroke="#e17055" strokeWidth="2" fill="none"/>
                        <text x="180" y="185" fontSize="10" fontWeight="bold" fill="#e17055">53.1°</text>
                        
                        {/* Calculation note */}
                        <text x="320" y="250" fontSize="10" fill="#2d3436">tan⁻¹(0.075/0.10) = 53.1°</text>
                      </svg>
                    </div>
                  </div>

                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="font-medium">Step 1: Calculate the distance from A to C</span>
                      <div className="my-3">
                        <BlockMath math="d_{AC} = \sqrt{(0.10)^2 + (0.075)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="d_{AC} = \sqrt{0.01 + 0.005625} = \sqrt{0.015625} = 0.125 \text{ m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\theta = \tan^{-1}\left(\frac{0.075}{0.10}\right) = \tan^{-1}(0.75) = 53.1°" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate force F<sub>AC</sub> (A acting on C)</span>
                      <div className="my-3">
                        <BlockMath math="F_{AC} = k \frac{|q_A q_C|}{d_{AC}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{AC} = \frac{8.99 \times 10^9 \times |(-2.00 \times 10^{-6})(4.00 \times 10^{-6})|}{(0.125)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{AC} = \frac{8.99 \times 10^9 \times 8.00 \times 10^{-12}}{0.015625}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{AC} = 4.60 \text{ N toward A (attractive)}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Calculate force F<sub>BC</sub> (B acting on C)</span>
                      <div className="my-3">
                        <BlockMath math="F_{BC} = k \frac{q_B q_C}{d_{BC}^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{BC} = \frac{8.99 \times 10^9 \times (3.00 \times 10^{-6})(4.00 \times 10^{-6})}{(0.075)^2}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{BC} = \frac{8.99 \times 10^9 \times 12.0 \times 10^{-12}}{0.005625}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{BC} = 19.18 \text{ N away from B (repulsive)}" />
                      </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h5 className="font-semibold text-green-800 mb-2">Force Vector Diagram</h5>
                      <div className="text-center">
                        <svg width="450" height="350" className="mx-auto mb-2">
                          {/* Grid for reference */}
                          <defs>
                            <pattern id="grid2" width="15" height="15" patternUnits="userSpaceOnUse">
                              <path d="M 15 0 L 0 0 0 15" fill="none" stroke="#e8f5e8" strokeWidth="0.5"/>
                            </pattern>
                          </defs>
                          <rect width="450" height="350" fill="url(#grid2)" />
                          
                          {/* Coordinate system */}
                          <defs>
                            <marker id="arrowhead-green" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#00b894" />
                            </marker>
                            <marker id="arrowhead-red" markerWidth="10" markerHeight="7" 
                             refX="10" refY="3.5" orient="auto">
                              <polygon points="0 0, 10 3.5, 0 7" fill="#e17055" />
                            </marker>
                            <marker id="arrowhead-blue" markerWidth="12" markerHeight="9" 
                             refX="12" refY="4.5" orient="auto">
                              <polygon points="0 0, 12 4.5, 0 9" fill="#0984e3" />
                            </marker>
                          </defs>
                          
                          {/* Charge C at center */}
                          <circle cx="225" cy="175" r="15" fill="#ff6b6b" stroke="#d63031" strokeWidth="2"/>
                          <text x="225" y="181" textAnchor="middle" fontSize="12" fontWeight="bold" fill="white">C</text>
                          
                          {/* FAC vector (toward A, so northwest) */}
                          <line x1="225" y1="175" x2="155" y2="120" stroke="#e17055" strokeWidth="4" markerEnd="url(#arrowhead-red)"/>
                          <text x="180" y="140" fontSize="12" fontWeight="bold" fill="#e17055">F<tspan fontSize="10">AC</tspan> = 4.60 N</text>
                          
                          {/* FBC vector (away from B, so south) */}
                          <line x1="225" y1="175" x2="225" y2="290" stroke="#e17055" strokeWidth="4" markerEnd="url(#arrowhead-red)"/>
                          <text x="235" y="235" fontSize="12" fontWeight="bold" fill="#e17055">F<tspan fontSize="10">BC</tspan> = 19.18 N</text>
                          
                          {/* Component vectors of FAC */}
                          <line x1="225" y1="175" x2="155" y2="175" stroke="#00b894" strokeWidth="3" markerEnd="url(#arrowhead-green)" strokeDasharray="5,5"/>
                          <text x="185" y="165" fontSize="11" fontWeight="bold" fill="#00b894">3.68 N (W)</text>
                          
                          <line x1="225" y1="175" x2="225" y2="120" stroke="#00b894" strokeWidth="3" markerEnd="url(#arrowhead-green)" strokeDasharray="5,5"/>
                          <text x="235" y="145" fontSize="11" fontWeight="bold" fill="#00b894">2.76 N (N)</text>
                          
                          {/* Angle marking */}
                          <path d="M 210 175 A 15 15 0 0 0 205 160" stroke="#e17055" strokeWidth="2" fill="none"/>
                          <text x="195" y="155" fontSize="10" fontWeight="bold" fill="#e17055">53.1°</text>
                          
                          {/* Net force vector */}
                          <line x1="225" y1="175" x2="195" y2="290" stroke="#0984e3" strokeWidth="5" markerEnd="url(#arrowhead-blue)"/>
                          <text x="160" y="280" fontSize="13" fontWeight="bold" fill="#0984e3">F<tspan fontSize="11">NET</tspan> = 16.8 N</text>
                          
                          {/* Net force angle */}
                          <path d="M 225 200 A 25 25 0 0 1 210 220" stroke="#0984e3" strokeWidth="2" fill="none"/>
                          <text x="200" y="235" fontSize="11" fontWeight="bold" fill="#0984e3">12.6° W of S</text>
                          
                          {/* Coordinate axes */}
                          <line x1="50" y1="320" x2="100" y2="320" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-green)"/>
                          <text x="105" y="325" fontSize="12" fontWeight="bold" fill="#666">East</text>
                          
                          <line x1="50" y1="320" x2="50" y2="270" stroke="#666" strokeWidth="2" markerEnd="url(#arrowhead-green)"/>
                          <text x="25" y="265" fontSize="12" fontWeight="bold" fill="#666">North</text>
                        </svg>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 4: Break F<sub>AC</sub> into components</span>
                      <p className="text-sm text-gray-600 mt-1 mb-2">
                        Since F<sub>AC</sub> points toward A (northwest direction at 53.1° above the negative x-axis):
                      </p>
                      <div className="my-3">
                        <BlockMath math="F_{AC(N)} = 4.60 \cos(53.1°) = 4.60 \times 0.600 = 2.76 \text{ N north}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{AC(W)} = 4.60 \sin(53.1°) = 4.60 \times 0.800 = 3.68 \text{ N west}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 5: Identify F<sub>BC</sub> components</span>
                      <p className="text-sm text-gray-600 mt-1 mb-2">
                        F<sub>BC</sub> points directly south (away from B):
                      </p>
                      <div className="my-3">
                        <BlockMath math="F_{BC(S)} = 19.18 \text{ N south}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="F_{BC(E/W)} = 0 \text{ N}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 6: Add vector components</span>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-blue-700">East-West direction:</span>
                          <div className="my-2">
                            <BlockMath math="\sum F_{E/W} = 0 + (-3.68) = -3.68 \text{ N (west)}" />
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">North-South direction:</span>
                          <div className="my-2">
                            <BlockMath math="\sum F_{N/S} = 2.76 + (-19.18) = -16.42 \text{ N (south)}" />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 7: Calculate net force magnitude and direction</span>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-green-700">Magnitude:</span>
                          <div className="my-2">
                            <BlockMath math="F_{NET} = \sqrt{(3.68)^2 + (16.42)^2}" />
                          </div>
                          <div className="my-2">
                            <BlockMath math="F_{NET} = \sqrt{13.54 + 269.6} = \sqrt{283.1} = 16.8 \text{ N}" />
                          </div>
                        </div>
                        <div>
                          <span className="font-medium text-green-700">Direction:</span>
                          <div className="my-2">
                            <BlockMath math="\theta = \tan^{-1}\left(\frac{3.68}{16.42}\right) = \tan^{-1}(0.224) = 12.6°" />
                          </div>
                          <p className="text-sm text-gray-600">Direction: 12.6° west of south</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Summary Table</h5>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-blue-200">
                              <th className="text-left p-2">Force</th>
                              <th className="text-left p-2">Magnitude</th>
                              <th className="text-left p-2">Direction</th>
                              <th className="text-left p-2">East Component</th>
                              <th className="text-left p-2">North Component</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b border-blue-100">
                              <td className="p-2 font-medium">F<sub>AC</sub></td>
                              <td className="p-2">4.60 N</td>
                              <td className="p-2">53.1° N of W</td>
                              <td className="p-2">-3.68 N</td>
                              <td className="p-2">+2.76 N</td>
                            </tr>
                            <tr className="border-b border-blue-100">
                              <td className="p-2 font-medium">F<sub>BC</sub></td>
                              <td className="p-2">19.18 N</td>
                              <td className="p-2">South</td>
                              <td className="p-2">0 N</td>
                              <td className="p-2">-19.18 N</td>
                            </tr>
                            <tr className="bg-blue-100 font-bold">
                              <td className="p-2">F<sub>NET</sub></td>
                              <td className="p-2">16.8 N</td>
                              <td className="p-2">12.6° W of S</td>
                              <td className="p-2">-3.68 N</td>
                              <td className="p-2">-16.42 N</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The net electrostatic force on charge C is 
                      <span className="font-bold">16.8 N</span> at <span className="font-bold">12.6° west of south</span>.
                    </p>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                      <p className="text-sm text-yellow-800">
                        <strong>Key Insights:</strong> When dealing with multiple forces on a charge, always:
                        1) Calculate each force magnitude using Coulomb's law, 2) Determine force directions using charge signs,
                        3) Break forces into components, 4) Add components algebraically, 5) Find resultant magnitude and direction.
                        The negative charge A attracts C (northwest), while positive charge B repels C (south).
                      </p>
                    </div>
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
        lessonPath="26-coulombs-law"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_26_basic_force',
            title: 'Basic Force Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_force_scaling',
            title: 'Force Scaling with Changes'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_unknown_charge',
            title: 'Unknown Charge Calculation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_spheres_contact',
            title: 'Spheres in Contact'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_force_changes',
            title: 'Force Changes Analysis'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_third_charge',
            title: 'Third Charge Effects'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_larger_charge',
            title: 'Larger Charge Comparisons'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_triangle_forces',
            title: 'Triangle Configuration Forces'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_vector_forces',
            title: 'Vector Force Analysis'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_minimum_charge',
            title: 'Minimum Charge Requirements'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_26_equilibrium_position',
            title: 'Equilibrium Position Analysis'
          }
        ]}
      />

      <LessonSummary
        points={[
          "Coulomb's Law: F = kq₁q₂/r² where k = 8.99 × 10⁹ N⋅m²/C²",
          "Force proportional to charge product; inversely proportional to distance squared",
          "Like charges repel, unlike charges attract (law of charges)",
          "Use absolute values for magnitude; determine direction separately",
          "Newton's 3rd Law: forces between charges are equal and opposite pairs",
          "Focus on forces acting ON your charge of interest to avoid double-counting",
          "Historical development: Franklin (1775) → Priestley → Coulomb (1785)",
          "Vector addition required for multiple charges; break into components for 2D problems"
        ]}
      />
    </LessonContent>
  );
};

export default CoulombsLaw;