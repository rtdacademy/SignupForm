import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [isCathodeRayOpen, setIsCathodeRayOpen] = useState(false);
  const [isGoldsteinOpen, setIsGoldsteinOpen] = useState(false);
  const [isCrookesOpen, setIsCrookesOpen] = useState(false);
  const [isThomsonOpen, setIsThomsonOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isMillikanOpen, setIsMillikanOpen] = useState(false);
  const [isExample3Open, setIsExample3Open] = useState(false);

  // Interactive Thomson Experiment Animation
  const ThomsonExperimentAnimation = () => {
    const [showElectricField, setShowElectricField] = useState(true);
    const [showMagneticField, setShowMagneticField] = useState(false);
    
    return (
      <div className="bg-gray-900 p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Interactive Thomson Experiment</h4>
        
        {/* Control buttons */}
        <div className="flex justify-center gap-4 mb-4">
          <button
            onClick={() => {setShowElectricField(!showElectricField)}}
            className={`px-3 py-1 rounded text-sm ${showElectricField ? 'bg-yellow-500 text-black' : 'bg-gray-600 text-white'}`}
          >
            Electric Field {showElectricField ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={() => {setShowMagneticField(!showMagneticField)}}
            className={`px-3 py-1 rounded text-sm ${showMagneticField ? 'bg-purple-500 text-white' : 'bg-gray-600 text-white'}`}
          >
            Magnetic Field {showMagneticField ? 'ON' : 'OFF'}
          </button>
        </div>
        
        <svg width="100%" height="250" viewBox="0 0 600 250" className="bg-gray-800 rounded">
          {/* Thomson's apparatus outline */}
          <rect x="20" y="80" width="560" height="90" fill="none" stroke="#4A90E2" strokeWidth="3" rx="10" />
          
          {/* Cathode */}
          <rect x="30" y="110" width="8" height="30" fill="#FF6B6B" />
          <text x="25" y="105" fill="#FF6B6B" fontSize="10" textAnchor="middle">Cathode</text>
          
          {/* Anode with hole */}
          <rect x="150" y="110" width="8" height="30" fill="#4ECDC4" />
          <rect x="155" y="123" width="6" height="4" fill="#000" />
          <text x="155" y="105" fill="#4ECDC4" fontSize="10" textAnchor="middle">Anode</text>
          
          {/* Parallel plates for electric field */}
          <rect x="250" y="100" width="100" height="4" fill="#FFD93D" />
          <rect x="250" y="146" width="100" height="4" fill="#FFD93D" />
          <text x="300" y="95" fill="#FFD93D" fontSize="10" textAnchor="middle">+ Plate</text>
          <text x="300" y="165" fill="#FFD93D" fontSize="10" textAnchor="middle">- Plate</text>
          
          {/* Electric field lines (when ON) */}
          {showElectricField && (
            <>
              {[...Array(5)].map((_, i) => (
                <line
                  key={`e-field-${i}`}
                  x1={260 + i * 20}
                  y1={104}
                  x2={260 + i * 20}
                  y2={146}
                  stroke="#FFD93D"
                  strokeWidth="1"
                  opacity="0.7"
                />
              ))}
              <text x="375" y="125" fill="#FFD93D" fontSize="10">E field ↓</text>
            </>
          )}
          
          {/* Magnetic field indicators (when ON) */}
          {showMagneticField && (
            <>
              {[...Array(6)].map((_, i) => (
                <circle
                  key={`b-field-${i}`}
                  cx={270 + i * 15}
                  cy={125}
                  r="3"
                  fill="none"
                  stroke="#8B5CF6"
                  strokeWidth="2"
                />
              ))}
              {[...Array(6)].map((_, i) => (
                <circle
                  key={`b-dot-${i}`}
                  cx={270 + i * 15}
                  cy={125}
                  r="1"
                  fill="#8B5CF6"
                />
              ))}
              <text x="380" y="140" fill="#8B5CF6" fontSize="10">B field ⊗</text>
            </>
          )}
          
          {/* Fluorescent screen */}
          <rect x="500" y="90" width="15" height="70" fill="#95E1D3" opacity="0.7" />
          <text x="508" y="85" fill="#95E1D3" fontSize="10" textAnchor="middle">Screen</text>
          
          {/* Cathode ray path - changes based on fields */}
          <g>
            {/* Base path */}
            <line x1="45" y1="125" x2="250" y2="125" stroke="#00FF88" strokeWidth="2" />
            
            {/* Path through fields */}
            {!showElectricField && !showMagneticField && (
              <line x1="250" y1="125" x2="500" y2="125" stroke="#00FF88" strokeWidth="2" />
            )}
            
            {showElectricField && !showMagneticField && (
              <path d="M 250 125 Q 350 140 500 155" stroke="#00FF88" strokeWidth="2" fill="none" />
            )}
            
            {!showElectricField && showMagneticField && (
              <path d="M 250 125 Q 350 110 500 95" stroke="#00FF88" strokeWidth="2" fill="none" />
            )}
            
            {showElectricField && showMagneticField && (
              <line x1="250" y1="125" x2="500" y2="125" stroke="#00FF88" strokeWidth="2" />
            )}
          </g>
          
          {/* Animated particles */}
          {[0, 1, 2].map((i) => (
            <circle
              key={i}
              r="2"
              fill="#00FF88"
              className="animate-pulse"
            >
              <animateMotion
                dur="4s"
                repeatCount="indefinite"
                begin={`${i * 1}s`}
              >
                <mpath href={
                  !showElectricField && !showMagneticField ? "#straightPath" :
                  showElectricField && !showMagneticField ? "#electricPath" :
                  !showElectricField && showMagneticField ? "#magneticPath" :
                  "#balancedPath"
                } />
              </animateMotion>
            </circle>
          ))}
          
          {/* Define paths for different conditions */}
          <defs>
            <path id="straightPath" d="M 45 125 L 500 125" />
            <path id="electricPath" d="M 45 125 L 250 125 Q 350 140 500 155" />
            <path id="magneticPath" d="M 45 125 L 250 125 Q 350 110 500 95" />
            <path id="balancedPath" d="M 45 125 L 500 125" />
          </defs>
          
          {/* Status indicator */}
          <text x="300" y="230" fill="#FFF" fontSize="12" textAnchor="middle">
            {!showElectricField && !showMagneticField && "Straight path - no fields"}
            {showElectricField && !showMagneticField && "Deflected down by electric field"}
            {!showElectricField && showMagneticField && "Deflected up by magnetic field"}
            {showElectricField && showMagneticField && "Balanced forces - straight path"}
          </text>
        </svg>
      </div>
    );
  };

  // Animated Cathode Ray Tube Component
  const CathodeRayTubeAnimation = () => {
    return (
      <div className="bg-black p-6 rounded-lg border border-gray-300 mb-6">
        <h4 className="text-white font-semibold mb-4 text-center">Cathode Ray Tube Animation</h4>
        <svg
          width="100%"
          height="200"
          viewBox="0 0 500 200"
          className="bg-gray-900 rounded"
        >
          {/* Glass tube outline */}
          <rect
            x="10"
            y="60"
            width="480"
            height="80"
            fill="none"
            stroke="#4A90E2"
            strokeWidth="3"
            rx="10"
          />
          
          {/* Cathode (negative electrode) */}
          <rect
            x="20"
            y="80"
            width="8"
            height="40"
            fill="#FF6B6B"
          />
          <text x="15" y="55" fill="#FF6B6B" fontSize="12" textAnchor="middle">
            Cathode (-)
          </text>
          
          {/* Anode (positive electrode) */}
          <rect
            x="470"
            y="80"
            width="8"
            height="40"
            fill="#4ECDC4"
          />
          <text x="475" y="55" fill="#4ECDC4" fontSize="12" textAnchor="middle">
            Anode (+)
          </text>
          
          {/* Metal foil (for Goldstein's experiment) */}
          <rect
            x="200"
            y="85"
            width="2"
            height="30"
            fill="#FFD93D"
          />
          <text x="205" y="80" fill="#FFD93D" fontSize="10">
            Metal Foil
          </text>
          
          {/* Fluorescent screen */}
          <rect
            x="450"
            y="70"
            width="15"
            height="60"
            fill="#95E1D3"
            opacity="0.7"
          />
          <text x="458" y="165" fill="#95E1D3" fontSize="10" textAnchor="middle">
            Screen
          </text>
          
          {/* Animated cathode ray particles */}
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              r="3"
              fill="#00FF88"
              className="animate-pulse"
            >
              <animateMotion
                dur="3s"
                repeatCount="indefinite"
                begin={`${i * 0.5}s`}
              >
                <mpath href="#rayPath" />
              </animateMotion>
            </circle>
          ))}
          
          {/* Path for the cathode ray */}
          <defs>
            <path
              id="rayPath"
              d="M 35 100 L 450 100"
              stroke="none"
              fill="none"
            />
          </defs>
          
          {/* Visible ray beam */}
          <line
            x1="35"
            y1="100"
            x2="450"
            y2="100"
            stroke="#00FF88"
            strokeWidth="2"
            opacity="0.6"
          />
          
          {/* Voltage indicators */}
          <text x="250" y="40" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">
            High Voltage Applied
          </text>
          
          {/* Gas molecules (very few in evacuated tube) */}
          {[...Array(3)].map((_, i) => (
            <circle
              key={`gas-${i}`}
              cx={100 + i * 100}
              cy={90 + Math.random() * 20}
              r="1.5"
              fill="#999"
              opacity="0.5"
            />
          ))}
          
          {/* Labels for ray behavior */}
          <text x="250" y="180" fill="#00FF88" fontSize="12" textAnchor="middle">
            Cathode Rays Travel in Straight Lines
          </text>
        </svg>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Cathode Rays</h1>
      
      <div className="space-y-6">
        {/* Cathode Ray Tube Research Section */}
        <div>
          <button
            onClick={() => setIsCathodeRayOpen(!isCathodeRayOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Cathode Ray Tube Research</h3>
            <span className="text-blue-600">{isCathodeRayOpen ? '▼' : '▶'}</span>
          </button>
          
          {isCathodeRayOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Many people experimented with various gas-discharge tubes which were attached to 
                  high voltage induction coils. A major difficulty was that air in the tubes effectively 
                  stopped particles from reaching the anode from the cathode.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  When the technology had improved to the point where most of the air could be 
                  evacuated from the tube, they discovered some interesting things.
                </p>

                {/* Insert the animated cathode ray tube */}
                <CathodeRayTubeAnimation />
                
                {/* Key Features of Cathode Ray Tubes */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                  <h4 className="font-semibold text-indigo-800 mb-2">🔬 Key Features of the Cathode Ray Tube</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700"><strong>Glass tube</strong> with most air evacuated (creating a vacuum)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700"><strong>Cathode (negative electrode)</strong> - where the ray originates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700"><strong>Anode (positive electrode)</strong> - attracts the cathode ray</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700"><strong>High voltage</strong> applied between electrodes (thousands of volts)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700"><strong>Fluorescent screen</strong> glows when hit by cathode rays</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Goldstein's Experiments Section */}
        <div>
          <button
            onClick={() => setIsGoldsteinOpen(!isGoldsteinOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Eugene Goldstein's Experiments</h3>
            <span className="text-blue-600">{isGoldsteinOpen ? '▼' : '▶'}</span>
          </button>
          
          {isGoldsteinOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Eugene Goldstein conducted a series of experiments on what was called the 
                  Geissler beam. He gave the name cathode ray to the beam because it originated at the cathode.
                </p>
                
                {/* Goldstein's Key Discoveries */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">🔍 Goldstein's Key Discoveries</h4>
                  <div className="space-y-3 text-sm">
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <p className="font-semibold text-yellow-700 mb-1">Metal Foil Experiment</p>
                      <p className="text-gray-700">He found that the cathode rays travelled through thin metal foils and travel much further through air than atoms. This indicated they were very small in mass.</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <p className="font-semibold text-yellow-700 mb-1">Hydrogen Gas Discovery</p>
                      <p className="text-gray-700">In another experiment, Goldstein placed a small amount of hydrogen in the tube. The cathode ray was still there, but Goldstein also found a bluish tinge around the back end of the cathode that was not present in the normal vacuum tube.</p>
                    </div>
                    
                    <div className="bg-white p-3 rounded border border-yellow-300">
                      <p className="font-semibold text-yellow-700 mb-1">New Particle Discovery</p>
                      <p className="text-gray-700">Goldstein had found a particle that traveled toward the cathode. We will refer to this discovery later.</p>
                    </div>
                  </div>
                </div>
                
                {/* Scientific Impact */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-800 mb-2">📊 Scientific Impact</h4>
                  <p className="text-gray-700 text-sm">
                    Goldstein's experiments were crucial because they showed that cathode rays:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Could penetrate thin materials</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Were much smaller than atoms</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      <span className="text-gray-700">Were distinct from other particles in the tube</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* William Crookes' Experiments Section */}
        <div>
          <button
            onClick={() => setIsCrookesOpen(!isCrookesOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">William Crookes' Experiments</h3>
            <span className="text-blue-600">{isCrookesOpen ? '▼' : '▶'}</span>
          </button>
          
          {isCrookesOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  William Crookes did an experiment called the bent tube experiment. Crookes used 
                  a discharge tube similar to the one diagrammed and found that the cathode ray beam was 
                  most intense at the elbow of the tube.
                </p>
                
                {/* Bent Tube Experiment Visualization */}
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 mb-6">
                  <h4 className="font-semibold text-purple-800 mb-3">🔄 The Bent Tube Experiment</h4>
                  <div className="bg-white p-4 rounded border border-purple-300">
                    <svg width="100%" height="150" viewBox="0 0 400 150">
                      {/* Bent tube shape */}
                      <path
                        d="M 20 75 L 150 75 L 150 50 L 380 50"
                        stroke="#8B5CF6"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        d="M 20 85 L 150 85 L 150 60 L 380 60"
                        stroke="#8B5CF6"
                        strokeWidth="4"
                        fill="none"
                      />
                      
                      {/* Cathode */}
                      <rect x="10" y="70" width="8" height="20" fill="#FF6B6B" />
                      <text x="15" y="105" fill="#FF6B6B" fontSize="10" textAnchor="middle">Cathode</text>
                      
                      {/* Ray path showing straight line travel */}
                      <line x1="25" y1="80" x2="150" y2="80" stroke="#00FF88" strokeWidth="2" />
                      <line x1="150" y1="55" x2="370" y2="55" stroke="#00FF88" strokeWidth="2" />
                      
                      {/* Elbow impact point */}
                      <circle cx="150" cy="75" r="8" fill="#FFD93D" opacity="0.8" />
                      <text x="150" y="95" fill="#FFD93D" fontSize="10" textAnchor="middle">Intense Glow</text>
                      
                      {/* Anode */}
                      <rect x="370" y="45" width="8" height="20" fill="#4ECDC4" />
                      <text x="375" y="35" fill="#4ECDC4" fontSize="10" textAnchor="middle">Anode</text>
                      
                      {/* Direction arrows */}
                      <polygon points="140,77 145,80 140,83" fill="#00FF88" />
                      <polygon points="145,52 150,55 145,58" fill="#00FF88" />
                      
                      <text x="200" y="130" fill="#8B5CF6" fontSize="12" textAnchor="middle">
                        Cathode rays travel in straight lines, hitting the elbow
                      </text>
                    </svg>
                  </div>
                </div>
                
                {/* Crookes' Discoveries */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h4 className="font-semibold text-blue-800 mb-2">🎯 Key Finding #1</h4>
                    <p className="text-gray-700 text-sm">
                      <strong>Straight Line Travel:</strong> This experiment confirmed that cathode rays 
                      traveled in straight lines, as evidenced by the intense glow at the elbow where 
                      they struck the tube wall.
                    </p>
                  </div>
                  
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h4 className="font-semibold text-orange-800 mb-2">🧲 Key Finding #2</h4>
                    <p className="text-gray-700 text-sm">
                      <strong>Magnetic Deflection:</strong> Crookes also found that when a magnet was 
                      introduced near the beam of cathode rays, they bent in a direction that 
                      indicated they were negatively charged particles.
                    </p>
                  </div>
                </div>
                
                {/* Summary Box */}
                <div className="mt-6 bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">💡 Crookes' Conclusions</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    William Crookes' experiments provided crucial evidence that cathode rays were:
                  </p>
                  <ul className="space-y-1 text-sm">
                    <li className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span className="text-gray-700">Negatively charged particles (not just energy or waves)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span className="text-gray-700">Particles that traveled in straight lines</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-red-600">•</span>
                      <span className="text-gray-700">Could be deflected by magnetic fields</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Thomson Experiment Section */}
        <div>
          <button
            onClick={() => setIsThomsonOpen(!isThomsonOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">The Thomson Experiment</h3>
            <span className="text-blue-600">{isThomsonOpen ? '▼' : '▶'}</span>
          </button>
          
          {isThomsonOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  Sir Joseph John Thomson (1856-1940) attended Owen's College in Manchester England and then 
                  went on to Cambridge University. He eventually became the head of the Cavendish Laboratories 
                  at Cambridge University. In 1897, Thomson conducted a series of experiments that would make 
                  him famous.
                </p>

                <p className="text-gray-700 leading-relaxed mb-6">
                  He designed a special cathode ray tube that allowed the beam to be exposed to magnetic 
                  and/or electric fields. The following discussion of Thomson's experiment is an application 
                  of the ideas that we learned in Lesson 20.
                </p>

                {/* Interactive Thomson Animation */}
                <ThomsonExperimentAnimation />

                {/* Thomson's Apparatus Description */}
                <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200 mb-6">
                  <h4 className="font-semibold text-indigo-800 mb-2">🔬 Thomson's Apparatus</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    The apparatus involved a vacuum tube with a high voltage induction coil. The anode ring 
                    had a hole in it to allow the high speed cathode rays through. A phosphor coating was 
                    painted on the end of the tube that glows when struck by cathode rays.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700">The path of the cathode rays is straight and horizontal, which indicates that gravity has very little effect. Therefore the cathode rays must have a very small mass.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-indigo-600">•</span>
                      <span className="text-gray-700">Thomson installed a set of parallel plates attached to a variable voltage supply. When exposed to an electric field the cathode ray is bent upward due to the attractive pull of the positive plate and the repulsive push from the negative plate (i.e. cathode rays have a negative charge).</span>
                    </li>
                  </ul>
                </div>

                {/* Electric and Magnetic Field Effects */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 className="font-semibold text-yellow-800 mb-2">⚡ Electric Field Effect</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      When electric field is applied:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Cathode rays bend toward positive plate</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Confirms negative charge</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-yellow-600">•</span>
                        <span className="text-gray-700">Force: <InlineMath math="F_E = qE" /></span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-800 mb-2">🧲 Magnetic Field Effect</h4>
                    <p className="text-gray-700 text-sm mb-2">
                      When magnetic field is applied:
                    </p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">Cathode rays bend downward</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">Confirms particle motion</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-purple-600">•</span>
                        <span className="text-gray-700">Force: <InlineMath math="F_M = qvB" /></span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Balance of Forces */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">⚖️ Balanced Forces Method</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    When Thomson applied both an electric field and a magnetic field at the same time, the upward 
                    electric force could be set to balance the downward magnetic force, resulting in a straight, 
                    horizontal path. He could then determine the speed of the cathode rays.
                  </p>
                  <div className="bg-white p-3 rounded border border-green-300">
                    <div className="text-center">
                      <BlockMath math="F_E = F_M" />
                      <BlockMath math="qE = qvB" />
                      <BlockMath math="v = \frac{E}{B}" />
                    </div>
                  </div>
                </div>

                {/* Charge-to-Mass Ratio Discovery */}
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">🎯 Thomson's Historic Discovery</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Once Thomson had determined the speed, he turned off the electric field and measured the radius 
                    of curvature for the cathode rays through the magnetic field. At the time (1897) Thomson did not 
                    know the mass nor the charge of the cathode rays. The only thing he could calculate was the 
                    charge to mass ratio.
                  </p>
                  <div className="bg-white p-3 rounded border border-red-300">
                    <p className="font-semibold text-red-700 mb-2">Key Results:</p>
                    <ul className="space-y-1 text-sm">
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-gray-700">Thomson found <InlineMath math="\frac{q}{m} = 1.76 \times 10^{11}" /> C/kg for all cathode ray particles</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-gray-700">This value was the same regardless of cathode material</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-gray-700">In 1891, George Johnstone Stoney had proposed the term "electron"</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-red-600">•</span>
                        <span className="text-gray-700">Thomson renamed cathode rays "electrons"</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Example 1 */}
        <div>
          <button
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1: Thomson Experiment Calculation</h3>
            <span className="text-green-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>
          
          {isExample1Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A student performs a cathode ray tube experiment. The magnetic field strength from the coils 
                  was 0.040 T. The parallel plates were set 3.0 mm apart. In order to produce a straight cathode 
                  ray beam a 3600 V potential was applied across the plates. When the electric field is turned off, 
                  the cathode rays are bent into a curve of radius 4.26 mm by the magnetic field. What is the 
                  charge to mass ratio for the cathode ray particles?
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Magnetic field: <InlineMath math="B = 0.040 \text{ T}" /></p>
                        <p>Plate separation: <InlineMath math="d = 3.0 \text{ mm} = 3.0 \times 10^{-3} \text{ m}" /></p>
                        <p>Voltage: <InlineMath math="V = 3600 \text{ V}" /></p>
                        <p>Radius of curvature: <InlineMath math="r = 4.26 \text{ mm} = 4.26 \times 10^{-3} \text{ m}" /></p>
                        <p>Find: Charge to mass ratio <InlineMath math="\left(\frac{q}{m}\right)" /></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Equation:</strong>
                      <div className="text-center mt-2">
                        <p>For balanced forces: <BlockMath math="v = \frac{E}{B} = \frac{V}{d \times B}" /></p>
                        <p>For circular motion: <BlockMath math="\frac{q}{m} = \frac{v}{Br}" /></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Substitute and solve:</strong>
                      <div className="mt-2 ml-4">
                        <p>Step 1: Calculate the speed</p>
                        <div className="text-center">
                          <BlockMath math="v = \frac{3600 \text{ V}}{(3.0 \times 10^{-3} \text{ m})(0.040 \text{ T})} = \frac{3600}{1.2 \times 10^{-4}} = 3.0 \times 10^{7} \text{ m/s}" />
                        </div>
                        <p className="mt-3">Step 2: Calculate charge to mass ratio</p>
                        <div className="text-center">
                          <BlockMath math="\frac{q}{m} = \frac{3.0 \times 10^{7} \text{ m/s}}{(0.040 \text{ T})(4.26 \times 10^{-3} \text{ m})} = \frac{3.0 \times 10^{7}}{1.704 \times 10^{-4}} = 1.76 \times 10^{11} \text{ C/kg}" />
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The charge to mass ratio for the cathode ray particles is <InlineMath math="1.76 \times 10^{11} \text{ C/kg}" />.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Example 2 */}
        <div>
          <button
            onClick={() => setIsExample2Open(!isExample2Open)}
            className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 2: Modified Thomson Experiment with Hydrogen Ions</h3>
            <span className="text-purple-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>
          
          {isExample2Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  In a modified Thomson experiment, when a hydrogen atom beam is exposed to a magnetic field of 
                  0.0400 T and an electric field produced by 3600 V applied across parallel plates which are 
                  3.00 mm apart, the particles go straight. When the electric field is turned off, the particles 
                  were observed to move through a radius of curvature of 7.828 m. What is the charge-to-mass 
                  ratio for the hydrogen ions?
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Magnetic field: <InlineMath math="B = 0.0400 \text{ T}" /></p>
                        <p>Plate separation: <InlineMath math="d = 3.00 \text{ mm} = 3.00 \times 10^{-3} \text{ m}" /></p>
                        <p>Voltage: <InlineMath math="V = 3600 \text{ V}" /></p>
                        <p>Radius of curvature: <InlineMath math="r = 7.828 \text{ m}" /></p>
                        <p>Find: Charge to mass ratio <InlineMath math="\left(\frac{q}{m}\right)" /></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Equation:</strong>
                      <div className="text-center mt-2">
                        <p>For balanced forces: <BlockMath math="v = \frac{E}{B} = \frac{V}{d \times B}" /></p>
                        <p>For circular motion: <BlockMath math="\frac{q}{m} = \frac{v}{Br}" /></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Substitute and solve:</strong>
                      <div className="mt-2 ml-4">
                        <p>Step 1: Calculate the speed</p>
                        <div className="text-center">
                          <BlockMath math="v = \frac{3600 \text{ V}}{(3.00 \times 10^{-3} \text{ m})(0.0400 \text{ T})} = \frac{3600}{1.20 \times 10^{-4}} = 3.0 \times 10^{7} \text{ m/s}" />
                        </div>
                        <p className="mt-3">Step 2: Calculate charge to mass ratio</p>
                        <div className="text-center">
                          <BlockMath math="\frac{q}{m} = \frac{3.0 \times 10^{7} \text{ m/s}}{(0.0400 \text{ T})(7.828 \text{ m})} = \frac{3.0 \times 10^{7}}{0.3131} = 9.58 \times 10^{7} \text{ C/kg}" />
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The charge to mass ratio for the hydrogen ions is <InlineMath math="9.58 \times 10^{7} \text{ C/kg}" />.
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-4">
                  <p className="text-sm text-gray-700">
                    <strong>Historical Significance:</strong> Thomson checked this charge to mass ratio and found it corresponded to the value for a hydrogen ion. 
                    Goldstein had discovered the proton! Further tests revealed that electrons and protons had the same 
                    quantity of charge, but opposite signs. From the difference in their charge to mass ratios, Thomson 
                    concluded that a proton was more than 1700 times more massive than an electron.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Millikan Section */}
        <div>
          <button
            onClick={() => setIsMillikanOpen(!isMillikanOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">The Value of the Elementary Charge</h3>
            <span className="text-blue-600">{isMillikanOpen ? '▼' : '▶'}</span>
          </button>
          
          {isMillikanOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 leading-relaxed mb-4">
                  As you recall from Lesson 17, R. A. Millikan conducted a series of experiments known 
                  as the oil drop experiments in 1909. His work, combined with J. J. Thomson's work, 
                  would give a great deal of knowledge concerning the electron.
                </p>
                
                <p className="text-gray-700 leading-relaxed mb-6">
                  In Millikan's apparatus, a negatively charged oil drop is introduced between two charged plates. 
                  The electric field was manipulated in such a way as to freeze individual oil drops so that the 
                  force of gravity downward would be matched by the electric upward force.
                </p>

                {/* Millikan's Discovery */}
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200 mb-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">🔬 Millikan's Historic Discovery</h4>
                  <p className="text-gray-700 text-sm mb-3">
                    Millikan did several hundred runs of this experiment and he found results of:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm mb-3">
                    <div className="bg-white p-2 rounded border border-yellow-300 text-center">
                      <InlineMath math="3.20 \times 10^{-19} \text{ C}" />
                    </div>
                    <div className="bg-white p-2 rounded border border-yellow-300 text-center">
                      <InlineMath math="9.60 \times 10^{-19} \text{ C}" />
                    </div>
                    <div className="bg-white p-2 rounded border border-yellow-300 text-center">
                      <InlineMath math="4.80 \times 10^{-19} \text{ C}" />
                    </div>
                    <div className="bg-white p-2 rounded border border-yellow-300 text-center">
                      <InlineMath math="1.60 \times 10^{-19} \text{ C}" />
                    </div>
                    <div className="bg-white p-2 rounded border border-yellow-300 text-center">
                      <InlineMath math="8.00 \times 10^{-19} \text{ C}" />
                    </div>
                    <div className="bg-white p-2 rounded border border-yellow-300 text-center">
                      <InlineMath math="6.40 \times 10^{-19} \text{ C}" />
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm">
                    <strong>Key Insight:</strong> Millikan quickly determined that all his values were multiples of <InlineMath math="1.60 \times 10^{-19} \text{ C}" />. 
                    Millikan had discovered the smallest possible unit of charge – the elementary charge.
                  </p>
                </div>

                {/* Elementary Charge Explanation */}
                <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-6">
                  <h4 className="font-semibold text-green-800 mb-2">⚡ The Elementary Charge</h4>
                  <p className="text-gray-700 text-sm mb-2">
                    The value he discovered was the charge of the electron, and the charge on an oil 
                    droplet was always an integer number multiple of the elementary charge.
                  </p>
                  <div className="bg-white p-3 rounded border border-green-300 text-center">
                    <BlockMath math="e = 1.60 \times 10^{-19} \text{ C}" />
                    <p className="text-sm text-gray-600 mt-2">(Elementary charge)</p>
                  </div>
                </div>

                {/* Mass Calculations */}
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">🧮 Determining Electron and Proton Masses</h4>
                  <p className="text-gray-700 text-sm mb-4">
                    Combining Millikan's work with J.J. Thomson's work, we can finally determine the mass 
                    of the electron and the proton:
                  </p>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Electron Mass */}
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <h5 className="font-semibold text-blue-700 mb-2">Electron Mass:</h5>
                      <div className="text-center space-y-1 text-sm">
                        <BlockMath math="\frac{q_e}{m_e} = 1.76 \times 10^{11} \text{ C/kg}" />
                        <BlockMath math="m_e = \frac{q_e}{\frac{q_e}{m_e}} = \frac{1.60 \times 10^{-19}}{1.76 \times 10^{11}}" />
                        <BlockMath math="m_e = 9.11 \times 10^{-31} \text{ kg}" />
                      </div>
                    </div>

                    {/* Proton Mass */}
                    <div className="bg-white p-3 rounded border border-blue-300">
                      <h5 className="font-semibold text-red-700 mb-2">Proton Mass:</h5>
                      <div className="text-center space-y-1 text-sm">
                        <BlockMath math="\frac{q_p}{m_p} = 9.58 \times 10^{7} \text{ C/kg}" />
                        <BlockMath math="m_p = \frac{q_p}{\frac{q_p}{m_p}} = \frac{1.60 \times 10^{-19}}{9.58 \times 10^{7}}" />
                        <BlockMath math="m_p = 1.67 \times 10^{-27} \text{ kg}" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 bg-orange-100 p-3 rounded border border-orange-300">
                    <p className="text-orange-800 font-semibold text-sm text-center">
                      The proton is 1836 times more massive than the electron, but its charge is equal in 
                      magnitude to that of the electron.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Example 3 */}
        <div>
          <button
            onClick={() => setIsExample3Open(!isExample3Open)}
            className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 3: Millikan's Oil Drop Experiment</h3>
            <span className="text-green-600">{isExample3Open ? '▼' : '▶'}</span>
          </button>
          
          {isExample3Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An oil drop with a mass of <InlineMath math="8.0 \times 10^{-15} \text{ kg}" /> is introduced between two parallel plates set 
                  5.0 mm apart with a potential difference of 1.225 kV across the plates. If the oil drop is 
                  suspended between the plates, what is the charge on the oil drop?
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Mass of oil drop: <InlineMath math="m = 8.0 \times 10^{-15} \text{ kg}" /></p>
                        <p>Plate separation: <InlineMath math="d = 5.0 \text{ mm} = 5.0 \times 10^{-3} \text{ m}" /></p>
                        <p>Potential difference: <InlineMath math="V = 1.225 \text{ kV} = 1225 \text{ V}" /></p>
                        <p>Oil drop is suspended (equilibrium)</p>
                        <p>Find: Charge on the oil drop <InlineMath math="(q)" /></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Equation:</strong>
                      <div className="text-center mt-2">
                        <p>For equilibrium: <BlockMath math="F_E = F_g" /></p>
                        <p>Electric force: <BlockMath math="F_E = qE = q \cdot \frac{V}{d}" /></p>
                        <p>Gravitational force: <BlockMath math="F_g = mg" /></p>
                        <p>Therefore: <BlockMath math="q \cdot \frac{V}{d} = mg" /></p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Substitute and solve:</strong>
                      <div className="mt-2 ml-4">
                        <p>Solve for charge:</p>
                        <div className="text-center">
                          <BlockMath math="q = \frac{mgd}{V}" />
                        </div>
                        <p className="mt-3">Substitute values:</p>
                        <div className="text-center">
                          <BlockMath math="q = \frac{(8.0 \times 10^{-15} \text{ kg})(9.8 \text{ m/s}^2)(5.0 \times 10^{-3} \text{ m})}{1225 \text{ V}}" />
                        </div>
                        <div className="text-center">
                          <BlockMath math="q = \frac{3.92 \times 10^{-16}}{1225} = 3.2 \times 10^{-19} \text{ C}" />
                        </div>
                      </div>
                    </li>
                  </ol>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The charge on the oil drop is <InlineMath math="3.2 \times 10^{-19} \text{ C}" />.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Note: This is exactly 2 times the elementary charge (<InlineMath math="2 \times 1.60 \times 10^{-19} \text{ C}" />), 
                      confirming Millikan's discovery that charge comes in discrete multiples of the elementary charge.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Cathode ray tubes were developed by improving vacuum technology to remove air that blocked particle movement",
            "Eugene Goldstein named cathode rays and discovered they could penetrate thin metal foils, indicating very small mass",
            "Goldstein's hydrogen gas experiment revealed the existence of positively charged particles moving toward the cathode (protons)",
            "William Crookes' bent tube experiment proved that cathode rays travel in straight lines and are deflected by magnetic fields",
            "J.J. Thomson designed an apparatus that could expose cathode rays to both electric and magnetic fields simultaneously",
            "Thomson's balanced forces method (F_E = F_M) allowed him to calculate the speed of cathode rays using v = E/B",
            "Thomson measured the charge-to-mass ratio for cathode ray particles, discovering the electron",
            "Thomson found the same q/m ratio regardless of cathode material, proving electrons are fundamental particles",
            "Thomson's work with hydrogen ions confirmed Goldstein's discovery of the proton and showed electrons and protons have equal but opposite charges",
            "Thomson concluded that protons are more than 1700 times more massive than electrons, revolutionizing atomic theory"
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