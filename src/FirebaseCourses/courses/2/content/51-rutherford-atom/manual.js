import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode, AIAccordion, onAIAccordionContent }) => {
  // Rutherford Model Animation Component
  const RutherfordModelAnimation = () => {
    const [animationSpeed, setAnimationSpeed] = useState(1);
    const [showChargeLabels, setShowChargeLabels] = useState(true);
    
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Interactive Rutherford Nuclear Model</h4>
        
        {/* Control buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setAnimationSpeed(animationSpeed === 1 ? 0.5 : animationSpeed === 0.5 ? 2 : 1)}
            className="px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600"
          >
            Speed: {animationSpeed === 0.5 ? 'Slow' : animationSpeed === 1 ? 'Normal' : 'Fast'}
          </button>
          <button
            onClick={() => setShowChargeLabels(!showChargeLabels)}
            className={`px-3 py-1 rounded text-sm ${showChargeLabels ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
          >
            Charge Labels {showChargeLabels ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <svg width="100%" height="400" viewBox="0 0 600 400" className="bg-gray-800 rounded">
          {/* Central nucleus */}
          <circle cx="300" cy="200" r="15" fill="#FF6B6B" stroke="#FF4444" strokeWidth="3">
            <animate
              attributeName="r"
              values="15;18;15"
              dur={`${2/animationSpeed}s`}
              repeatCount="indefinite"
            />
          </circle>
          
          {showChargeLabels && (
            <text x="300" y="210" fill="#FF6B6B" fontSize="12" textAnchor="middle">
              Nucleus (+)
            </text>
          )}
          
          {/* Electron orbital paths */}
          <circle cx="300" cy="200" r="80" fill="none" stroke="#4ECDC4" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
          <circle cx="300" cy="200" r="120" fill="none" stroke="#4ECDC4" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
          <circle cx="300" cy="200" r="160" fill="none" stroke="#4ECDC4" strokeWidth="2" opacity="0.3" strokeDasharray="5,5" />
          
          {/* Orbiting electrons */}
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const radius = 80 + (i % 3) * 40;
            const offset = (i * 60) % 360;
            return (
              <g key={i}>
                <circle r="4" fill="#00FF00">
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="rotate"
                    values={`${offset} 300 200;${offset + 360} 300 200`}
                    dur={`${(3 + i * 0.5)/animationSpeed}s`}
                    repeatCount="indefinite"
                  />
                  <animateTransform
                    attributeName="transform"
                    attributeType="XML"
                    type="translate"
                    values={`${300 + radius} 200`}
                    additive="sum"
                  />
                </circle>
                {showChargeLabels && (
                  <text fontSize="8" fill="#00FF00" textAnchor="middle">
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="rotate"
                      values={`${offset} 300 200;${offset + 360} 300 200`}
                      dur={`${(3 + i * 0.5)/animationSpeed}s`}
                      repeatCount="indefinite"
                    />
                    <animateTransform
                      attributeName="transform"
                      attributeType="XML"
                      type="translate"
                      values={`${300 + radius + 10} 205`}
                      additive="sum"
                    />
                    e⁻
                  </text>
                )}
              </g>
            );
          })}
          
          {/* Nuclear structure detail */}
          <g opacity="0.8">
            {/* Protons in nucleus */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle
                key={`p-${i}`}
                cx={295 + (i % 3) * 3 - 3}
                cy={195 + Math.floor(i / 3) * 3 - 3}
                r="1.5"
                fill="#FF8888"
              />
            ))}
            
            {/* Neutrons in nucleus */}
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <circle
                key={`n-${i}`}
                cx={298 + (i % 3) * 3 - 3}
                cy={198 + Math.floor(i / 3) * 3 - 3}
                r="1.5"
                fill="#CCCCCC"
              />
            ))}
          </g>
          
          {showChargeLabels && (
            <>
              <text x="300" y="175" fill="#FF8888" fontSize="10" textAnchor="middle">
                Protons (+)
              </text>
              <text x="300" y="235" fill="#CCCCCC" fontSize="10" textAnchor="middle">
                Neutrons (0)
              </text>
            </>
          )}
          
          {/* Size comparison label */}
          <text x="300" y="350" fill="#FFFFFF" fontSize="12" textAnchor="middle">
            Nucleus: ~10⁻¹⁵ m | Atom: ~10⁻¹⁰ m
          </text>
          <text x="300" y="370" fill="#FFFFFF" fontSize="10" textAnchor="middle">
            Nucleus is 100,000 times smaller than the atom!
          </text>
        </svg>
        
        <div className="mt-4 text-white text-sm">
          <p><strong>Rutherford's Discovery:</strong> The atom is mostly empty space with a tiny, dense, positively charged nucleus at the center.</p>
          <p><strong>Key Features:</strong> Electrons orbit the nucleus like planets around the sun, but the forces are electrical rather than gravitational.</p>
        </div>
      </div>
    );
  };

  // Gold Foil Experiment Animation
  const GoldFoilExperimentAnimation = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [showDeflections, setShowDeflections] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);
    
    const restartAnimation = () => {
      setAnimationKey(prev => prev + 1);
    };
    
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Rutherford's Gold Foil Experiment</h4>
        
        {/* Control buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-3 py-1 rounded text-sm ${isPlaying ? 'bg-red-500' : 'bg-green-500'} text-white`}
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={restartAnimation}
            className="px-3 py-1 rounded text-sm bg-blue-500 text-white hover:bg-blue-600"
          >
            Restart
          </button>
          <button
            onClick={() => setShowDeflections(!showDeflections)}
            className={`px-3 py-1 rounded text-sm ${showDeflections ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
          >
            Deflections {showDeflections ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <svg key={animationKey} width="100%" height="300" viewBox="0 0 700 300" className="bg-gray-800 rounded">
          {/* Radioactive source */}
          <rect x="20" y="140" width="40" height="20" fill="#FFD93D" stroke="#FFA500" strokeWidth="2" />
          <text x="40" y="130" fill="#FFD93D" fontSize="12" textAnchor="middle">
            Alpha Source
          </text>
          
          {/* Lead shield with slit */}
          <rect x="80" y="100" width="20" height="100" fill="#666666" />
          <rect x="85" y="145" width="10" height="10" fill="#000000" />
          <text x="90" y="90" fill="#666666" fontSize="10" textAnchor="middle">
            Lead Shield
          </text>
          
          {/* Gold foil */}
          <rect x="300" y="50" width="4" height="200" fill="#FFD700" opacity="0.8" />
          <text x="302" y="40" fill="#FFD700" fontSize="12" textAnchor="middle">
            Gold Foil
          </text>
          
          {/* Detector screen */}
          <path d="M 550 50 A 200 200 0 0 1 550 250" stroke="#95E1D3" strokeWidth="8" fill="none" opacity="0.7" />
          <text x="580" y="150" fill="#95E1D3" fontSize="12" textAnchor="middle">
            Detector Screen
          </text>
          
          {/* Alpha particles */}
          {isPlaying && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
            const yStart = 140 + (i - 4.5) * 8;
            const delay = i * 0.3;
            
            // Most particles go straight (95%)
            if (i < 8) {
              return (
                <g key={i}>
                  <circle r="3" fill="#FF6B6B">
                    <animate
                      attributeName="cx"
                      values="60;620"
                      dur="3s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values={`${yStart};${yStart}`}
                      dur="3s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Flash on detector */}
                  <circle cx="550" cy={yStart} r="8" fill="#FFFFFF" opacity="0">
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur="0.2s"
                      begin={`${delay + 2.4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            }
            
            // Some particles deflect at small angles (4%)
            if (i === 8 && showDeflections) {
              return (
                <g key={i}>
                  <circle r="3" fill="#FF6B6B">
                    <animate
                      attributeName="cx"
                      values="60;300;580"
                      dur="3s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values={`${yStart};${yStart};${yStart + 30}`}
                      dur="3s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                  
                  {/* Flash on detector */}
                  <circle cx="580" cy={yStart + 30} r="8" fill="#FFFFFF" opacity="0">
                    <animate
                      attributeName="opacity"
                      values="0;1;0"
                      dur="0.2s"
                      begin={`${delay + 2.4}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            }
            
            // Very few particles bounce back (1%)
            if (i === 9 && showDeflections) {
              return (
                <g key={i}>
                  <circle r="3" fill="#FF6B6B">
                    <animate
                      attributeName="cx"
                      values="60;290;60"
                      dur="3s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="cy"
                      values={`${yStart};${yStart};${yStart - 15}`}
                      dur="3s"
                      begin={`${delay}s`}
                      repeatCount="indefinite"
                    />
                  </circle>
                </g>
              );
            }
            
            return null;
          })}
          
          {/* Gold atoms (simplified) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <g key={`atom-${i}`}>
              {/* Electron cloud */}
              <circle
                cx="302"
                cy={70 + i * 16}
                r="8"
                fill="#87CEEB"
                opacity="0.3"
              />
              {/* Nucleus */}
              <circle
                cx="302"
                cy={70 + i * 16}
                r="1"
                fill="#FF6B6B"
              />
            </g>
          ))}
        </svg>
        
        <div className="mt-4 text-white text-sm space-y-2">
          <p><strong>Observations:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Most alpha particles (95%) passed straight through</li>
            <li>Some particles (4%) were deflected at small angles</li>
            <li>Very few particles (1%) bounced straight back</li>
          </ul>
          <p><strong>Conclusion:</strong> The atom must be mostly empty space with a tiny, dense, positive nucleus!</p>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏛️ Rutherford's Model of the Atom
        </h1>
        <p className="text-lg text-gray-600">
          The revolutionary discovery of the atomic nucleus
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">
            <AIAccordion.Item value="thomson-model" title="Thomson's Model of the Atom" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Refer to Pearson pages 766 to 770 for a discussion of Rutherford's scattering experiment.
                  </p>
                  
                  <p className="text-gray-700 leading-relaxed mb-6">
                    Before Rutherford's discovery, the accepted model of the atom was J.J. Thomson's 
                    "plum pudding" model (also called the "raisin bun" model). This model proposed that 
                    the atom was a uniform sphere of positive charge with electrons embedded within it 
                    like raisins in a bun.
                  </p>
                  
                  {/* Thomson Model Visualization */}
                  <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                    <h4 className="font-semibold text-indigo-800 mb-3 text-center">Thomson's "Plum Pudding" Model</h4>
                    <div className="flex justify-center">
                      <svg width="200" height="200" viewBox="0 0 200 200">
                        {/* Positive sphere background */}
                        <circle cx="100" cy="100" r="80" fill="#FFE4E1" stroke="#FF6B6B" strokeWidth="3" />
                        <text x="100" y="45" fill="#FF6B6B" fontSize="12" textAnchor="middle">
                          Positive "Pudding"
                        </text>
                        
                        {/* Embedded electrons */}
                        {[
                          {x: 70, y: 70}, {x: 130, y: 70}, {x: 100, y: 100},
                          {x: 70, y: 130}, {x: 130, y: 130}, {x: 85, y: 100},
                          {x: 115, y: 100}, {x: 100, y: 85}, {x: 100, y: 115}
                        ].map((pos, i) => (
                          <circle
                            key={i}
                            cx={pos.x}
                            cy={pos.y}
                            r="6"
                            fill="#00FF00"
                            stroke="#008000"
                            strokeWidth="1"
                          />
                        ))}
                        
                        <text x="100" y="170" fill="#00FF00" fontSize="10" textAnchor="middle">
                          Electrons (e⁻)
                        </text>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">📋 Key Features of Thomson's Model</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">The atom is a uniform sphere of positive charge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">Electrons are embedded throughout the positive sphere</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">The positive and negative charges balance to make the atom neutral</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700">The atom is solid - no empty space</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="gold-foil-experiment" title="Rutherford's Gold Foil Experiment" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    In 1909, Ernest Rutherford, along with his colleagues Hans Geiger and Ernest Marsden, 
                    conducted a famous experiment that would revolutionize our understanding of atomic structure. 
                    They fired alpha particles (helium nuclei) at a thin sheet of gold foil.
                  </p>
                  
                  <GoldFoilExperimentAnimation />
                  
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">🧪 Experimental Setup</h4>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="font-bold text-yellow-600 min-w-[20px]">1.</span>
                        <span className="text-gray-700"><strong>Alpha Source:</strong> Radioactive material that emits high-energy alpha particles (He²⁺ nuclei)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-yellow-600 min-w-[20px]">2.</span>
                        <span className="text-gray-700"><strong>Lead Shield:</strong> Blocks radiation except for a narrow beam through a small slit</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-yellow-600 min-w-[20px]">3.</span>
                        <span className="text-gray-700"><strong>Gold Foil:</strong> Ultra-thin sheet of gold (only a few atoms thick)</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="font-bold text-yellow-600 min-w-[20px]">4.</span>
                        <span className="text-gray-700"><strong>Detector Screen:</strong> Fluorescent screen that flashes when hit by alpha particles</span>
                      </li>
                    </ol>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg border border-red-200 mb-4">
                    <h4 className="font-semibold text-red-800 mb-2">🎯 Expected vs. Observed Results</h4>
                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-semibold text-red-700 mb-2">Expected (Thomson Model):</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• All alpha particles should pass through with minimal deflection</li>
                          <li>• Positive charge is spread out uniformly</li>
                          <li>• No concentrated force to cause large deflections</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-semibold text-red-700 mb-2">Observed (Actual Results):</p>
                        <ul className="space-y-1 text-gray-600">
                          <li>• 95% passed straight through</li>
                          <li>• 4% deflected at small angles</li>
                          <li>• 1% bounced straight back!</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-semibold text-green-800 mb-2">💡 Rutherford's Famous Quote</h4>
                    <blockquote className="text-gray-700 text-sm italic border-l-4 border-green-400 pl-4">
                      "It was quite the most incredible event that has ever happened to me in my life. 
                      It was almost as incredible as if you fired a 15-inch shell at a piece of tissue 
                      paper and it came back and hit you."
                    </blockquote>
                    <p className="text-gray-700 text-sm mt-2">
                      This unexpected result led Rutherford to propose a completely new model of the atom.
                    </p>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="rutherford-model" title="Rutherford's Nuclear Model" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Based on the gold foil experiment results, Rutherford proposed a revolutionary new model 
                    of the atom. This model explained all the experimental observations and fundamentally 
                    changed our understanding of atomic structure.
                  </p>
                  
                  <RutherfordModelAnimation />
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-4">
                    <h4 className="font-semibold text-purple-800 mb-2">🏛️ Key Features of Rutherford's Model</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700"><strong>Tiny, Dense Nucleus:</strong> All positive charge and most mass concentrated in a tiny central core</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700"><strong>Mostly Empty Space:</strong> The atom is primarily empty space around the nucleus</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700"><strong>Orbiting Electrons:</strong> Electrons orbit the nucleus like planets around the sun</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700"><strong>Electrical Forces:</strong> Attraction between positive nucleus and negative electrons holds the atom together</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 mb-4">
                    <h4 className="font-semibold text-orange-800 mb-2">📏 Scale Comparison</h4>
                    <div className="space-y-3 text-sm">
                      <p className="text-gray-700">
                        To understand the incredible scale difference between the nucleus and the atom:
                      </p>
                      <div className="bg-white p-3 rounded border border-orange-300">
                        <ul className="space-y-2">
                          <li>• <strong>Nucleus diameter:</strong> ~10⁻¹⁵ m (1 femtometer)</li>
                          <li>• <strong>Atom diameter:</strong> ~10⁻¹⁰ m (1 angstrom)</li>
                          <li>• <strong>Ratio:</strong> The nucleus is 100,000 times smaller than the atom!</li>
                        </ul>
                      </div>
                      <p className="text-gray-700 mt-2">
                        <strong>Analogy:</strong> If the atom were the size of a football stadium, 
                        the nucleus would be the size of a marble at the center!
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">✅ How Rutherford's Model Explains the Gold Foil Results</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700"><strong>95% pass through:</strong> Most alpha particles travel through empty space</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700"><strong>4% deflect slightly:</strong> Alpha particles pass near a nucleus and are deflected by electrical repulsion</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        <span className="text-gray-700"><strong>1% bounce back:</strong> Alpha particles hit the nucleus head-on and are repelled backwards</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="questions" title="Understanding Check Questions" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4">Test Your Understanding</h4>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-800 mb-2">Question 1:</h5>
                      <p className="text-gray-700 text-sm mb-3">
                        If Thomson's model had been correct, what would Rutherford have observed 
                        in his gold foil experiment?
                      </p>
                      <div className="bg-white p-3 rounded border border-blue-300">
                        <p className="text-gray-700 text-sm">
                          <strong>Answer:</strong> If Thomson's model were correct, all alpha particles 
                          would have passed through the gold foil with little or no deflection. The 
                          positive charge would be spread uniformly throughout the atom, creating only 
                          weak, distributed forces that couldn't cause large deflections or backscattering.
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800 mb-2">Question 2:</h5>
                      <p className="text-gray-700 text-sm mb-3">
                        Why was gold chosen for the foil experiment?
                      </p>
                      <div className="bg-white p-3 rounded border border-green-300">
                        <p className="text-gray-700 text-sm">
                          <strong>Answer:</strong> Gold was chosen because:
                        </p>
                        <ul className="text-gray-700 text-sm mt-2 space-y-1">
                          <li>• It can be hammered into extremely thin sheets (only a few atoms thick)</li>
                          <li>• It's malleable and doesn't tear easily</li>
                          <li>• It doesn't tarnish or react chemically</li>
                          <li>• It has a high atomic number (79), providing strong nuclear charge for deflections</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <h5 className="font-semibold text-purple-800 mb-2">Question 3:</h5>
                      <p className="text-gray-700 text-sm mb-3">
                        Calculate the approximate size ratio between the nucleus and the atom.
                      </p>
                      <div className="bg-white p-3 rounded border border-purple-300">
                        <p className="text-gray-700 text-sm mb-2">
                          <strong>Given:</strong>
                        </p>
                        <ul className="text-gray-700 text-sm space-y-1 mb-3">
                          <li>• Nucleus diameter ≈ 10⁻¹⁵ m</li>
                          <li>• Atom diameter ≈ 10⁻¹⁰ m</li>
                        </ul>
                        <div className="bg-gray-100 p-2 rounded">
                          <p className="text-center">
                            <InlineMath math="\\text{Ratio} = \\frac{\\text{Atom diameter}}{\\text{Nucleus diameter}} = \\frac{10^{-10}}{10^{-15}} = 10^5 = 100,000" />
                          </p>
                        </div>
                        <p className="text-gray-700 text-sm mt-2">
                          The atom is 100,000 times larger than its nucleus!
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800 mb-2">Question 4:</h5>
                      <p className="text-gray-700 text-sm mb-3">
                        What problems existed with Rutherford's model that led to the development 
                        of Bohr's model?
                      </p>
                      <div className="bg-white p-3 rounded border border-red-300">
                        <p className="text-gray-700 text-sm mb-2">
                          <strong>Answer:</strong> Classical physics predicted that accelerating electrons 
                          (orbiting the nucleus) should:
                        </p>
                        <ul className="text-gray-700 text-sm space-y-1">
                          <li>• Continuously emit electromagnetic radiation</li>
                          <li>• Lose energy and spiral into the nucleus</li>
                          <li>• Cause the atom to collapse in about 10⁻¹⁰ seconds</li>
                          <li>• Emit a continuous spectrum rather than discrete lines</li>
                        </ul>
                        <p className="text-gray-700 text-sm mt-2">
                          Since atoms are stable and emit discrete spectral lines, Bohr proposed 
                          that electrons can only occupy specific energy levels.
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
        lessonPath="51-rutherford-atom"
        course={course}
        onAIAccordionContent={onAIAccordionContent}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question1',
            title: 'Question 1: Alpha Particles'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question2',
            title: 'Question 2: Gold Foil'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question3',
            title: 'Question 3: Why Gold?'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question4',
            title: 'Question 4: Alpha Particle Behavior'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question5',
            title: 'Question 5: Head-on Deflection'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question6',
            title: 'Question 6: Zinc Sulfide Screen'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question7',
            title: 'Question 7: Empty Space'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question8',
            title: 'Question 8: Nuclear Model'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question9',
            title: 'Question 9: Nuclear Size'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_51_question10',
            title: 'Question 10: Model Limitations'
          }
        ]}
        theme="indigo"
      />

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Thomson's 'plum pudding' model proposed that atoms were uniform spheres of positive charge with electrons embedded throughout",
            "Rutherford's gold foil experiment (1909) fired alpha particles at thin gold foil to test atomic structure",
            "Unexpected results showed 95% of alpha particles passed through, 4% deflected slightly, and 1% bounced straight back",
            "These results could not be explained by Thomson's model, which predicted minimal deflection",
            "Rutherford proposed a nuclear model: atoms have a tiny, dense, positively charged nucleus at the center",
            "The atom is mostly empty space (99.9%) with electrons orbiting the nucleus like planets around the sun",
            "The nucleus is 100,000 times smaller than the atom but contains nearly all the mass",
            "Rutherford's model successfully explained all gold foil experiment observations through electrical forces and nuclear structure"
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