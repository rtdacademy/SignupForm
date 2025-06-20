import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [isThomsonModelOpen, setIsThomsonModelOpen] = useState(false);
  const [isGoldFoilOpen, setIsGoldFoilOpen] = useState(false);
  const [isRutherfordModelOpen, setIsRutherfordModelOpen] = useState(false);
  const [isQuestionsOpen, setIsQuestionsOpen] = useState(false);

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
            className="px-3 py-1 rounded text-sm bg-purple-500 text-white"
          >
            Speed: {animationSpeed === 0.5 ? 'Slow' : animationSpeed === 1 ? 'Normal' : 'Fast'}
          </button>
          <button
            onClick={() => setShowChargeLabels(!showChargeLabels)}
            className={`px-3 py-1 rounded text-sm ${showChargeLabels ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
          >
            Charges {showChargeLabels ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <div className="relative bg-gray-800 rounded" style={{ height: '350px', overflow: 'hidden' }}>
          {/* SVG for static elements */}
          <svg width="100%" height="100%" viewBox="0 0 400 350" className="absolute inset-0">
            {/* Central nucleus */}
            <circle cx="200" cy="175" r="12" fill="#FF6B6B" stroke="#FF8888" strokeWidth="2">
              <animate attributeName="r" values="12;14;12" dur="3s" repeatCount="indefinite" />
            </circle>
            <text x="200" y="155" fill="#FF6B6B" fontSize="12" textAnchor="middle" fontWeight="bold">Nucleus</text>
            {showChargeLabels && <text x="200" y="145" fill="#FF6B6B" fontSize="10" textAnchor="middle">(+) Protons</text>}
            
            {/* Scale indicator */}
            <g transform="translate(20, 20)">
              <text x="0" y="0" fill="#FFFFFF" fontSize="11" fontWeight="bold">Scale (greatly exaggerated):</text>
              <text x="0" y="15" fill="#FF6B6B" fontSize="9">Nucleus: ~10⁻¹⁴ m</text>
              <text x="0" y="28" fill="#4ECDC4" fontSize="9">Atom: ~10⁻¹⁰ m</text>
              <text x="0" y="41" fill="#8B5CF6" fontSize="9">99.98% empty space!</text>
            </g>
            
            {/* Electron label */}
            <circle cx="350" cy="30" r="4" fill="#FFD93D" stroke="#FFB000" strokeWidth="1" />
            <text x="365" y="35" fill="#FFD93D" fontSize="12">Electrons</text>
            {showChargeLabels && <text x="365" y="25" fill="#FFD93D" fontSize="10">(-)</text>}
            
            {/* Key discoveries */}
            <text x="200" y="320" fill="#4ECDC4" fontSize="12" textAnchor="middle" fontWeight="bold">
              Revolutionary Discovery: Dense nucleus + mostly empty space
            </text>
            <text x="200" y="335" fill="#8B5CF6" fontSize="10" textAnchor="middle">
              Replaced Thomson's "plum pudding" with nuclear model
            </text>
          </svg>
          
          {/* CSS Animated electrons */}
          <div className="absolute inset-0">
            {/* Electron 1 - Inner orbit (50px radius) */}
            <div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-600"
              style={{
                left: '420px', // 200 + 50 - 1
                top: '174px',  
                transformOrigin: '-49px 1px',
                animation: `simple-orbit ${3/animationSpeed}s linear infinite`
              }}
            />
            
            {/* Electron 2 - Middle orbit (80px radius) */}
            <div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-600"
              style={{
                left: '450px', // 200 + 80 - 1
                top: '174px',  
                transformOrigin: '-79px 1px',
                animation: `simple-orbit ${4/animationSpeed}s linear infinite`
              }}
            />
            
            {/* Electron 3 - Middle orbit offset (80px radius) */}
            <div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-600"
              style={{
                left: '460px', // 200 + 80 - 1
                top: '174px',  
                transformOrigin: '-89px 1px',
                animation: `simple-orbit ${4/animationSpeed}s linear infinite`,
                animationDelay: `${2/animationSpeed}s`
              }}
            />
            
            {/* Electron 4 - Outer orbit (120px radius) */}
            <div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-600"
              style={{
                left: '490px', // 200 + 120 - 1
                top: '174px',  
                transformOrigin: '-119px 1px',
                animation: `simple-orbit ${5/animationSpeed}s linear infinite`
              }}
            />
            
            {/* Electron 5 - Outer orbit offset (120px radius) */}
            <div
              className="absolute w-2 h-2 bg-yellow-400 rounded-full border border-yellow-600"
              style={{
                left: '500px', // 200 + 120 - 1
                top: '174px',  
                transformOrigin: '-129px 1px',
                animation: `simple-orbit ${5/animationSpeed}s linear infinite`,
                animationDelay: `${2.5/animationSpeed}s`
              }}
            />
          </div>
        </div>
        
        <style jsx>{`
          @keyframes simple-orbit {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  };

  // Gold Foil Experiment Animation Component
  const GoldFoilExperimentAnimation = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [showDeflections, setShowDeflections] = useState(true);
    const [animationKey, setAnimationKey] = useState(0);
    
    // Reset animation when toggling
    const toggleAnimation = () => {
      setIsPlaying(!isPlaying);
      setAnimationKey(prev => prev + 1);
    };
    
    const toggleDeflections = () => {
      setShowDeflections(!showDeflections);
      setAnimationKey(prev => prev + 1);
    };
    
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Interactive Gold Foil Scattering Experiment</h4>
        
        {/* Control buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={toggleAnimation}
            className={`px-3 py-1 rounded text-sm ${isPlaying ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
          >
            {isPlaying ? 'Pause' : 'Play'} Animation
          </button>
          <button
            onClick={toggleDeflections}
            className={`px-3 py-1 rounded text-sm ${showDeflections ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
          >
            Deflections {showDeflections ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <div className="relative bg-gray-800 rounded" style={{ height: '400px', overflow: 'hidden' }}>
          {/* Static elements */}
          <div className="absolute inset-0">
            <svg width="100%" height="100%" viewBox="0 0 600 400">
              {/* Alpha particle source */}
              <rect x="20" y="180" width="40" height="40" fill="#FF6B6B" rx="5" />
              <text x="40" y="175" fill="#FF6B6B" fontSize="10" textAnchor="middle">Radium</text>
              <text x="40" y="165" fill="#FF6B6B" fontSize="10" textAnchor="middle">Source</text>
              
              {/* Gold foil */}
              <rect x="280" y="50" width="8" height="300" fill="#FFD700" />
              <text x="284" y="40" fill="#FFD700" fontSize="12" textAnchor="middle">Gold Foil</text>
              <text x="284" y="25" fill="#FFD700" fontSize="10" textAnchor="middle">(few atoms thick)</text>
              
              {/* Zinc sulfide screen */}
              <path d="M 450 80 A 150 150 0 0 1 450 320" stroke="#4ECDC4" strokeWidth="8" fill="none" />
              <text x="550" y="200" fill="#4ECDC4" fontSize="12" textAnchor="middle">Zinc Sulfide</text>
              <text x="550" y="215" fill="#4ECDC4" fontSize="12" textAnchor="middle">Screen</text>
              
              {/* Atomic nuclei in gold foil (greatly exaggerated) */}
              <circle cx="284" cy="120" r="2" fill="#8B0000" opacity="0.8" />
              <circle cx="284" cy="180" r="2" fill="#8B0000" opacity="0.8" />
              <circle cx="284" cy="240" r="2" fill="#8B0000" opacity="0.8" />
              <circle cx="284" cy="280" r="2" fill="#8B0000" opacity="0.8" />
              
              {/* Legend */}
              <g transform="translate(20, 300)">
                <text x="0" y="0" fill="#FFFFFF" fontSize="12" fontWeight="bold">Particle Paths:</text>
                <circle cx="10" cy="15" r="2" fill="#00FF88" />
                <text x="20" y="20" fill="#00FF88" fontSize="10">Straight through (most)</text>
                <circle cx="10" cy="30" r="2" fill="#FFD93D" />
                <text x="20" y="35" fill="#FFD93D" fontSize="10">Small deflection (few)</text>
                <circle cx="10" cy="45" r="2" fill="#FF8C00" />
                <text x="20" y="50" fill="#FF8C00" fontSize="10">Large deflection (very few)</text>
                <circle cx="10" cy="60" r="2" fill="#FF0000" />
                <text x="20" y="65" fill="#FF0000" fontSize="10">Back-scattered (extremely rare)</text>
              </g>
              
              {/* Results */}
              <text x="300" y="380" fill="#FFFFFF" fontSize="12" textAnchor="middle">
                Results: Most particles pass through, but some deflect at large angles!
              </text>
            </svg>
          </div>
          
          {/* Animated particles using CSS */}
          {isPlaying && (
            <div key={animationKey}>
              {/* Straight through particles */}
              <div
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  left: '65px',
                  top: '190px',
                  animation: 'straightThrough1 3s linear infinite'
                }}
              />
              <div
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  left: '65px',
                  top: '200px',
                  animation: 'straightThrough2 3s linear infinite 0.5s'
                }}
              />
              <div
                className="absolute w-1 h-1 bg-green-400 rounded-full"
                style={{
                  left: '65px',
                  top: '210px',
                  animation: 'straightThrough3 3s linear infinite 1s'
                }}
              />
              
              {showDeflections && (
                <>
                  {/* Small deflections */}
                  <div
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: '65px',
                      top: '170px',
                      animation: 'smallDeflection1 4s linear infinite 0.2s'
                    }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    style={{
                      left: '65px',
                      top: '230px',
                      animation: 'smallDeflection2 4s linear infinite 1.2s'
                    }}
                  />
                  
                  {/* Large deflections */}
                  <div
                    className="absolute w-1 h-1 bg-orange-500 rounded-full"
                    style={{
                      left: '65px',
                      top: '160px',
                      animation: 'largeDeflection1 5s linear infinite 0.8s'
                    }}
                  />
                  <div
                    className="absolute w-1 h-1 bg-orange-500 rounded-full"
                    style={{
                      left: '65px',
                      top: '240px',
                      animation: 'largeDeflection2 5s linear infinite 2.3s'
                    }}
                  />
                  
                  {/* Back scattered */}
                  <div
                    className="absolute w-1 h-1 bg-red-500 rounded-full"
                    style={{
                      left: '65px',
                      top: '180px',
                      animation: 'backScatter 6s linear infinite 1.5s'
                    }}
                  />
                </>
              )}
            </div>
          )}
        </div>
        
        <style jsx>{`
          @keyframes straightThrough1 {
            0% { transform: translateX(0px); }
            100% { transform: translateX(515px); }
          }
          @keyframes straightThrough2 {
            0% { transform: translateX(0px); }
            100% { transform: translateX(515px); }
          }
          @keyframes straightThrough3 {
            0% { transform: translateX(0px); }
            100% { transform: translateX(515px); }
          }
          @keyframes smallDeflection1 {
            0% { transform: translate(0px, 0px); }
            50% { transform: translate(215px, 0px); }
            100% { transform: translate(395px, 50px); }
          }
          @keyframes smallDeflection2 {
            0% { transform: translate(0px, 0px); }
            50% { transform: translate(215px, 0px); }
            100% { transform: translate(395px, -50px); }
          }
          @keyframes largeDeflection1 {
            0% { transform: translate(0px, 0px); }
            45% { transform: translate(215px, 0px); }
            100% { transform: translate(405px, -60px); }
          }
          @keyframes largeDeflection2 {
            0% { transform: translate(0px, 0px); }
            45% { transform: translate(215px, 0px); }
            100% { transform: translate(405px, 60px); }
          }
          @keyframes backScatter {
            0% { transform: translate(0px, 0px); }
            40% { transform: translate(215px, 0px); }
            45% { transform: translate(220px, -10px); }
            100% { transform: translate(-65px, -20px); }
          }
        `}</style>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          🏛️ Rutherford's Model of the Atom
        </h1>
        <p className="text-lg text-gray-600">
          The revolutionary discovery of the atomic nucleus
        </p>
      </div>

      {/* Thomson's Model Section */}
      <div>
        <button
          onClick={() => setIsThomsonModelOpen(!isThomsonModelOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Thomson's Model of the Atom</h3>
          <span className="text-blue-600">{isThomsonModelOpen ? '▼' : '▶'}</span>
        </button>
        
        {isThomsonModelOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                Refer to Pearson pages 766 to 770 for a discussion of Rutherford's scattering experiment.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                John Dalton had designed a model using the atom as the smallest possible particle. 
                That model was now shown to be incorrect thanks to the work of Thomson, Millikan, 
                Goldstein and others. However, it is interesting to note that for the majority of the 
                chemistry done at the high school level the Dalton model of the atom provides an 
                acceptable way to visualize what is happening in chemical reactions.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                Dalton had thought of atoms as indivisible particles, but Thomson's discovery of 
                electrons indicated that atoms were themselves made of smaller particles called 
                subatomic particles. In 1904, Thomson proposed a model of the atom that was based 
                on the existence of subatomic particles.
              </p>

              {/* Thomson's Model Visualization */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-3">🍞 Thomson's "Plum Pudding" Model</h4>
                
                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-white p-4 rounded border border-yellow-300">
                    <h5 className="font-semibold text-yellow-700 mb-2">Model Description:</h5>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Atom was a sphere of positive charge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Electrons embedded within the positive sphere</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Equal amounts of positive and negative charge</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Overall neutral atom</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-4 rounded border border-yellow-300">
                    <h5 className="font-semibold text-yellow-700 mb-2">Analogy:</h5>
                    <div className="text-center mb-3">
                      <svg width="120" height="120" viewBox="0 0 120 120">
                        {/* Pudding/bun */}
                        <circle cx="60" cy="60" r="50" fill="#DEB887" stroke="#CD853F" strokeWidth="2" />
                        
                        {/* Raisins/electrons */}
                        <circle cx="40" cy="40" r="4" fill="#8B4513" />
                        <circle cx="75" cy="35" r="4" fill="#8B4513" />
                        <circle cx="45" cy="70" r="4" fill="#8B4513" />
                        <circle cx="80" cy="75" r="4" fill="#8B4513" />
                        <circle cx="60" cy="55" r="4" fill="#8B4513" />
                        <circle cx="30" cy="60" r="4" fill="#8B4513" />
                        <circle cx="85" cy="50" r="4" fill="#8B4513" />
                        
                        <text x="60" y="130" fontSize="10" textAnchor="middle" fill="#CD853F">
                          Raisins in a Bun
                        </text>
                      </svg>
                    </div>
                    <p className="text-gray-700 text-sm">
                      <strong>Raisins</strong> = Negative electrons<br/>
                      <strong>Bun</strong> = Positive sphere
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 text-sm">
                  Thomson's model gave life to a large number of designs that would allow the electrons 
                  to exist within the positive. The elaborate designs allowed for the known principles of 
                  electrostatics to be explained. Electrons could be rubbed off or added to the atoms 
                  depending on the circumstances. Thomson argued that the chemical properties of the 
                  element might be associated with particular groupings of the electrons.
                </p>
              </div>

              {/* Model Comparison Preview */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">🔬 What Rutherford Would Discover</h4>
                <p className="text-gray-700 text-sm">
                  Thomson's model suggested that positive charge was spread throughout the atom. 
                  However, Rutherford's upcoming experiments would prove this model completely wrong, 
                  leading to a revolutionary new understanding of atomic structure.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gold Foil Experiment Section */}
      <div>
        <button
          onClick={() => setIsGoldFoilOpen(!isGoldFoilOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">The Gold Foil Experiment</h3>
          <span className="text-blue-600">{isGoldFoilOpen ? '▼' : '▶'}</span>
        </button>
        
        {isGoldFoilOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                Ernest Rutherford (1871-1937) was a graduate student under J.J. Thomson and thus 
                was strongly influenced by Thomson's work. In 1910, Rutherford spent a year lecturing 
                at McGill University in Montreal. In 1911, he returned to England to work at Manchester 
                University.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                In the same year, he began a series of experiments to verify the atomic 
                model proposed by Thomson. The experiments are known as the <strong>Gold Foil Scattering 
                Experiments</strong> and they would have a tremendous influence on all atomic models from 
                that point on.
              </p>

              {/* Interactive Animation */}
              <GoldFoilExperimentAnimation />

              {/* Experimental Setup */}
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                <h4 className="font-semibold text-yellow-800 mb-3">🔬 Experimental Setup</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-yellow-300">
                    <h5 className="font-semibold text-yellow-700 mb-2">Materials Used:</h5>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700"><strong>Gold foil</strong> - only a few atoms thick</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700"><strong>Alpha particles</strong> (helium ions) from radioactive radium source</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700"><strong>Zinc sulfide screen</strong> - glowed when hit by particles</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-white p-3 rounded border border-yellow-300">
                    <h5 className="font-semibold text-yellow-700 mb-2">Team Members:</h5>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700"><strong>Hans Geiger</strong> - tracked collision locations</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Later invented the <strong>Geiger counter</strong></span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Expected vs Actual Results */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">📋 Expected Results (Thomson Model)</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    According to Thomson's model, no appreciable deflection of the α particles should occur:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-gray-700">Most α particles expected to travel straight through</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-gray-700">Only slight deflection from electrostatic forces</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-blue-600">•</span>
                      <span className="text-gray-700">Only 1 of 800 particles slightly deflected</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">🤯 Actual Results</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    The results were completely unexpected and revolutionary:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span className="text-gray-700">Many α particles went straight through</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span className="text-gray-700">Some were deflected at large angles (around 90°)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span className="text-gray-700">Some particles were deflected straight back!</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Rutherford's Famous Quote */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">💬 Rutherford's Famous Reaction</h4>
                <blockquote className="text-gray-700 text-sm italic mb-2">
                  "The result is as incredible as if you fire a 15 inch shell from a battleship at a strip of tissue paper and it reflects back at you."
                </blockquote>
                <p className="text-gray-700 text-sm">
                  <strong>The Problem:</strong> Thomson's model could not account for this result. The distributed positive charge 
                  could never provide enough concentrated force to deflect heavy, fast-moving alpha particles at such large angles.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Rutherford's Nuclear Model Section */}
      <div>
        <button
          onClick={() => setIsRutherfordModelOpen(!isRutherfordModelOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Rutherford's Nuclear Model</h3>
          <span className="text-blue-600">{isRutherfordModelOpen ? '▼' : '▶'}</span>
        </button>
        
        {isRutherfordModelOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                Ernest Rutherford now proposed a model of the atom to try to account for the surprising 
                results. He proposed a nuclear atom, one in which most of the mass and all of the 
                positive charge was concentrated in the center of the atom.
              </p>

              {/* Interactive Animation */}
              <RutherfordModelAnimation />

              {/* Key Features */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                <h4 className="font-semibold text-green-800 mb-3">🎯 Key Features of Rutherford's Model</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded border border-green-300">
                    <h5 className="font-semibold text-green-700 mb-2">Nuclear Structure:</h5>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Dense, positively charged nucleus at center</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Contains <InlineMath math="99.98\%" /> of atom's mass</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Nucleus diameter ≈ <InlineMath math="10^{-14}" /> m</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Nucleus made up of protons (76 for gold)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-white p-3 rounded border border-green-300">
                    <h5 className="font-semibold text-green-700 mb-2">Electron Arrangement:</h5>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Electrons orbit the nucleus in circular paths</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Atom diameter ≈ <InlineMath math="10^{-10}" /> m</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Mostly empty space between nucleus and electrons</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600">•</span>
                        <span className="text-gray-700">Like a "mini-solar system"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Experimental Validation */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">🧪 How the Model Explained the Results</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white p-3 rounded border border-blue-300">
                    <h5 className="font-semibold text-blue-700 mb-1">Straight Through:</h5>
                    <p className="text-gray-700">Alpha particles pass through the mostly empty space without hitting anything dense.</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-300">
                    <h5 className="font-semibold text-blue-700 mb-1">Large Deflections:</h5>
                    <p className="text-gray-700">Particles passing close to the dense, positive nucleus experience strong electrostatic repulsion.</p>
                  </div>
                  <div className="bg-white p-3 rounded border border-blue-300">
                    <h5 className="font-semibold text-blue-700 mb-1">Back-Scattering:</h5>
                    <p className="text-gray-700">Direct hits with the nucleus cause particles to bounce straight back.</p>
                  </div>
                </div>
              </div>

              {/* Historical Impact */}
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">🏆 Historical Impact</h4>
                <p className="text-gray-700 text-sm mb-3">
                  Rutherford's nuclear atom became the foundational idea for all future models of the atom. 
                  Rutherford eventually replaced his mentor as head of the Cavendish labs. He was 
                  knighted and eventually received the Nobel Prize for his outstanding discovery.
                </p>
                <p className="text-gray-700 text-sm">
                  The study of the atom broke into two disciplines: <strong>Atomic physics</strong> – 
                  the study of the electron structure around the nucleus, and <strong>Nuclear physics</strong> – 
                  the study of the particles within the nucleus.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Questions about Rutherford's Model Section */}
      <div>
        <button
          onClick={() => setIsQuestionsOpen(!isQuestionsOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">Questions about Rutherford's Model</h3>
          <span className="text-blue-600">{isQuestionsOpen ? '▼' : '▶'}</span>
        </button>
        
        {isQuestionsOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                Although Rutherford's model was easy to visualize and understand, it had some serious flaws:
              </p>

              {/* Major Flaws */}
              <div className="space-y-4 mb-6">
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">❓ Question 1: Electron Stability</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Problem:</strong> Did all of the electrons travel in the same orbit? If they did, why did they not bump into one another? What was the structure of the orbiting electrons?
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Issue:</strong> The model didn't explain how electrons could maintain stable, separate orbits.
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">❓ Question 2: Chemical Bonding</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Problem:</strong> From the known bonding characteristics of different chemical compounds, how are the electrons involved in the bonding process?
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Issue:</strong> The model couldn't explain the variety of chemical behaviors and bonding patterns.
                  </p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">❓ Question 3: Nuclear Stability</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    <strong>Problem:</strong> Why do the positive protons stay together in the nucleus? Their strong mutual repulsion should tear the nucleus apart.
                  </p>
                  <p className="text-gray-700 text-sm">
                    <strong>Issue:</strong> Electrostatic repulsion between protons should make nuclei unstable.
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">❓ Question 4: Accelerating Charges (Maxwell's Problem)</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    <strong>The Fatal Flaw:</strong> This was the final, and most important flaw, concerned the nature of accelerating charges.
                  </p>
                  
                  <div className="bg-white p-3 rounded border border-purple-300">
                    <p className="text-gray-700 text-sm mb-2">
                      <strong>James Maxwell had shown that:</strong>
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">Accelerating electric charges radiate electromagnetic energy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">Electrons in circular orbits experience centripetal acceleration</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">Therefore electrons should continuously radiate energy</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">As kinetic energy converts to radiant energy, electrons should spiral into the nucleus</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* The Fundamental Problem */}
              <div className="bg-gray-800 text-white p-4 rounded-lg border border-gray-600">
                <h4 className="font-semibold mb-2 text-center">⚠️ The Fundamental Contradiction</h4>
                <p className="text-center text-sm">
                  According to Maxwell's equations, Rutherford's atomic model predicted that 
                  <strong className="text-red-300"> atoms should be completely unstable</strong> and 
                  <strong className="text-red-300"> collapse within nanoseconds</strong>!
                </p>
                <p className="text-center text-sm mt-2">
                  But we know that atoms have <strong className="text-green-300">stable structures for long periods of time</strong>. 
                  Something was clearly wrong with Rutherford's explanation.
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
                <h4 className="font-semibold text-blue-800 mb-2">🔬 What This Led To</h4>
                <p className="text-gray-700 text-sm">
                  These fundamental problems with Rutherford's model would soon lead to revolutionary 
                  developments in quantum mechanics and atomic theory, including the work of Niels Bohr 
                  and the development of quantum energy levels.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Thomson's 'plum pudding' model proposed electrons embedded in a distributed positive sphere",
            "Rutherford's gold foil experiment fired alpha particles at thin gold foil to test atomic structure",
            "Expected results: slight deflections based on Thomson's distributed positive charge model",
            "Actual results: most particles passed through, but some deflected at large angles and even bounced back",
            "Rutherford's revolutionary conclusion: atoms have a dense, positively charged nucleus at the center",
            "The nuclear model explained the experimental results: mostly empty space with concentrated mass and charge",
            "Rutherford's model replaced Thomson's and became the foundation for all future atomic models",
            "The nuclear model divided atomic physics into two fields: electron structure and nuclear physics",
            "Major problems with Rutherford's model: electron stability, chemical bonding, and nuclear stability",
            "Maxwell's electromagnetic theory predicted that orbiting electrons should radiate energy and spiral into the nucleus",
            "The fundamental contradiction: Rutherford's model predicted atomic collapse, but atoms are stable",
            "These problems led to the development of quantum mechanics and Bohr's quantized energy levels"
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