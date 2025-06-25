import React, { useState, useEffect } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const InterferenceOfLight = ({ course, courseId = 'default' }) => {
  const [isLightNatureOpen, setIsLightNatureOpen] = useState(false);
  const [isWaveTheoryOpen, setIsWaveTheoryOpen] = useState(false);
  const [isDiffractionOpen, setIsDiffractionOpen] = useState(false);
  const [isInterferenceOpen, setIsInterferenceOpen] = useState(false);
  const [isDerivationOpen, setIsDerivationOpen] = useState(false);
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  const [isExample3Open, setIsExample3Open] = useState(false);
  
  // Animation states for Huygens' Principle
  const [animationTime, setAnimationTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [wavefrontType, setWavefrontType] = useState('circular'); // 'circular' or 'straight'
  const [showWavelets, setShowWavelets] = useState(true);
  
  // Double slit animation states
  const [doubleSlitAnimating, setDoubleSlitAnimating] = useState(false);
  const [doubleSlitTime, setDoubleSlitTime] = useState(0);
  const [showInterference, setShowInterference] = useState(true);
  const [slitSeparation, setSlitSeparation] = useState(40);
  const [slitWidth, setSlitWidth] = useState(10);
  
  // Interference pattern animation states
  const [interferenceAnimating, setInterferenceAnimating] = useState(false);
  const [interferenceTime, setInterferenceTime] = useState(0);
  const [pathDifference, setPathDifference] = useState(0); // in wavelengths

  // Animation effect for Huygens
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationTime(prev => (prev + 0.1) % (Math.PI * 4));
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  // Animation effect for double slit
  useEffect(() => {
    let interval;
    if (doubleSlitAnimating) {
      interval = setInterval(() => {
        setDoubleSlitTime(prev => prev + 0.1);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [doubleSlitAnimating]);

  // Animation effect for interference pattern
  useEffect(() => {
    let interval;
    if (interferenceAnimating) {
      interval = setInterval(() => {
        setInterferenceTime(prev => prev + 0.1);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [interferenceAnimating]);

  // Function to generate wavelet positions for circular wavefront
  const generateCircularWavelets = (centerX, centerY, radius, numPoints = 12) => {
    const wavelets = [];
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      wavelets.push({ x, y, angle });
    }
    return wavelets;
  };

  // Function to generate wavelet positions for straight wavefront
  const generateStraightWavelets = (startX, startY, endX, endY, numPoints = 12) => {
    const wavelets = [];
    for (let i = 0; i < numPoints; i++) {
      const t = i / (numPoints - 1);
      const x = startX + t * (endX - startX);
      const y = startY + t * (endY - startY);
      wavelets.push({ x, y, angle: Math.PI / 2 }); // perpendicular to wavefront
    }
    return wavelets;
  };

  // Calculate wave intensity at a point for double slit
  const calculateIntensity = (x, y, slit1Y, slit2Y, time) => {
    const wavelength = 20; // arbitrary units
    const k = 2 * Math.PI / wavelength;
    
    // Calculate distances from each slit
    const r1 = Math.sqrt((x - 150) ** 2 + (y - slit1Y) ** 2);
    const r2 = Math.sqrt((x - 150) ** 2 + (y - slit2Y) ** 2);
    
    // Calculate angles from each slit center to the point
    const angle1 = Math.atan2(y - slit1Y, x - 150);
    const angle2 = Math.atan2(y - slit2Y, x - 150);
    
    // Single-slit diffraction envelope for each slit
    // sinc function: sin(β)/β where β = (π * a * sin(θ)) / λ
    const calculateSinc = (angle, slitCenter) => {
      const theta = Math.atan2(y - slitCenter, x - 150);
      // Scale the slit width effect to make it more visible
      const effectiveSlitWidth = slitWidth * 2; // Amplify the effect
      const beta = (Math.PI * effectiveSlitWidth * Math.sin(theta)) / (wavelength * 3);
      
      if (Math.abs(beta) < 0.001) return 1; // sinc(0) = 1
      const sinc = Math.sin(beta) / beta;
      return Math.abs(sinc);
    };
    
    const sinc1 = calculateSinc(angle1, slit1Y);
    const sinc2 = calculateSinc(angle2, slit2Y);
    
    // Calculate phase difference
    const phase1 = k * r1 - time;
    const phase2 = k * r2 - time;
    
    // Calculate amplitudes with single-slit diffraction envelope
    const baseAmp = 1 / Math.sqrt(Math.max(r1, r2) + 1);
    const amp1 = baseAmp * Math.abs(sinc1);
    const amp2 = baseAmp * Math.abs(sinc2);
    
    // Calculate interference
    const wave1 = amp1 * Math.cos(phase1);
    const wave2 = amp2 * Math.cos(phase2);
    
    return Math.abs(wave1 + wave2);
  };

  return (
    <LessonContent
      lessonId="lesson_18_interference_of_light"
      title="Lesson 11 - Interference of Light"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsLightNatureOpen(!isLightNatureOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Light – Wave or Particle?</h3>
            <span className="text-blue-600">{isLightNatureOpen ? '▼' : '▶'}</span>
          </button>

          {isLightNatureOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  That light carries energy is obvious to anyone who has focused the sun's rays with a 
                  magnifying glass on a piece of paper and burned a hole in it. But how does light travel, 
                  and in what form is this energy carried?
                </p>
                
                <p className="text-gray-700 mb-4">
                  Energy can be carried from place to place in basically two ways: by particles or by waves. 
                  In the first case, material bodies or particles can carry energy, such as a thrown baseball 
                  or the particles in rushing water. In the second case, water waves and sound waves, for 
                  example, can carry energy over long distances.
                </p>
                
                <p className="text-gray-700 mb-4">
                  In view of this, what can we say about the nature of light? Does light travel as a stream 
                  of particles away from its source; or does it travel in the form of waves that spread 
                  outward from the source? Historically, this question has turned out to be a difficult one. 
                  For one thing, light does not reveal itself in any obvious way as being made up of tiny 
                  particles nor do we see tiny light waves passing by as we do water waves.
                </p>
                
                <p className="text-gray-700 mb-4">
                  The evidence seemed to favour first one side and then the other until about 1830 when 
                  most physicists had accepted the wave theory. By the end of the nineteenth century, light 
                  was considered to be an electromagnetic wave (see Lessons 22 to 24). Although 
                  modifications had to be made in the twentieth century (Lessons 28 to 30), the wave 
                  theory of light has proved very successful. We now investigate the evidence for the wave 
                  theory and how it has explained a wide range of phenomena.
                </p>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsWaveTheoryOpen(!isWaveTheoryOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">The Wave Theory of Light</h3>
            <span className="text-blue-600">{isWaveTheoryOpen ? '▼' : '▶'}</span>
          </button>

          {isWaveTheoryOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  The Dutch scientist Christian Huygens (1629-1695), a contemporary of Newton, 
                  proposed a wave theory of light that had much merit. (Refer to Pearson pages 684 
                  to 685.) Still useful today is a technique he developed for predicting the future position 
                  of a wave front when an earlier position is known. This is known as Huygens' principle 
                  and can be stated as follows:
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Huygens' Principle:</h4>
                  <p className="text-blue-900 text-sm">
                    <strong>Every point on a wave front can be considered as a point source of tiny 
                    secondary wavelets that spread out in front of the wave at the same speed as the 
                    wave itself. The surface envelope, tangent to all the wavelets, constitutes the 
                    new wave front.</strong>
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">
                  As a simple example of the use of Huygens' Principle, consider the circular and straight 
                  wave fronts AB at some instant in time as shown to the right. The points on the wave front 
                  represent the centres of the new wavelets, seen as a series of small semi-circles. The 
                  common tangent to all these wavelets, the line A'B', is the new position of the wave front 
                  a short time later.
                </p>
                
                <p className="text-gray-700 mb-4">
                  Huygens' principle is particularly useful when waves impinge on an obstacle and the 
                  wave fronts are partially interrupted. Huygens' principle predicts that waves bend in 
                  behind an obstacle into the "shadow region" is known as <span className="font-bold">diffraction</span>. 
                  Since diffraction occurs for waves, but not for particles, it can serve as one means for 
                  distinguishing the nature of light.
                </p>
                
                {/* Interactive Huygens' Principle Animation */}
                <div className="bg-white p-6 rounded border border-gray-300 mt-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Huygens' Principle Demonstration</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Explore how Huygens' principle works with different wavefront shapes
                  </p>
                  
                  {/* Controls */}
                  <div className="flex justify-center items-center space-x-6 mb-6">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Wavefront Type:</label>
                      <select 
                        value={wavefrontType}
                        onChange={(e) => setWavefrontType(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="circular">Circular</option>
                        <option value="straight">Straight</option>
                      </select>
                    </div>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showWavelets}
                        onChange={(e) => setShowWavelets(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Show Wavelets</span>
                    </label>
                    
                    <button
                      onClick={() => setIsAnimating(!isAnimating)}
                      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                        isAnimating 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {isAnimating ? 'Stop' : 'Start'} Animation
                    </button>
                  </div>
                  
                  {/* Animation Canvas */}
                  <div className="flex justify-center">
                    <svg width="600" height="300" viewBox="0 0 600 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-wave" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#1e40af" />
                        </marker>
                      </defs>
                      
                      {wavefrontType === 'circular' ? (
                        <>
                          {/* Point source */}
                          <circle cx="150" cy="150" r="4" fill="#f59e0b" stroke="#d97706" strokeWidth="2" />
                          <text x="150" y="140" textAnchor="middle" className="text-xs fill-gray-700">Point Source</text>
                          
                          {/* Original circular wavefront */}
                          <circle 
                            cx="150" 
                            cy="150" 
                            r={60 + 10 * Math.sin(animationTime)} 
                            fill="none" 
                            stroke="#3b82f6" 
                            strokeWidth="2"
                            opacity="0.8"
                          />
                          
                          {/* Wavelets and new wavefront */}
                          {(() => {
                            const currentRadius = 60 + 10 * Math.sin(animationTime);
                            const wavelets = generateCircularWavelets(150, 150, currentRadius);
                            const newRadius = currentRadius + 20;
                            
                            return (
                              <>
                                {/* Show individual wavelets */}
                                {showWavelets && wavelets.map((wavelet, index) => (
                                  <circle 
                                    key={index}
                                    cx={wavelet.x} 
                                    cy={wavelet.y} 
                                    r={15} 
                                    fill="none" 
                                    stroke="#ef4444" 
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                    opacity="0.6"
                                  />
                                ))}
                                
                                {/* New wavefront (envelope) */}
                                <circle 
                                  cx="150" 
                                  cy="150" 
                                  r={newRadius} 
                                  fill="none" 
                                  stroke="#10b981" 
                                  strokeWidth="3"
                                  opacity="0.9"
                                />
                                
                                {/* Source points on original wavefront */}
                                {wavelets.map((wavelet, index) => (
                                  <circle 
                                    key={`point-${index}`}
                                    cx={wavelet.x} 
                                    cy={wavelet.y} 
                                    r="2" 
                                    fill="#3b82f6"
                                  />
                                ))}
                              </>
                            );
                          })()}
                          
                          {/* Labels */}
                          <text x="300" y="80" className="text-sm fill-blue-700 font-semibold">Original Wavefront</text>
                          <text x="300" y="100" className="text-sm fill-green-700 font-semibold">New Wavefront (Envelope)</text>
                          {showWavelets && <text x="300" y="120" className="text-sm fill-red-700 font-semibold">Individual Wavelets</text>}
                        </>
                      ) : (
                        <>
                          {/* Straight wavefront source */}
                          <text x="100" y="30" className="text-xs fill-gray-700">Plane Wave Source</text>
                          
                          {/* Original straight wavefront */}
                          <line 
                            x1="100" 
                            y1={80 + 5 * Math.sin(animationTime)} 
                            x2="100" 
                            y2={220 + 5 * Math.sin(animationTime)} 
                            stroke="#3b82f6" 
                            strokeWidth="3"
                            opacity="0.8"
                          />
                          
                          {/* Wavelets and new wavefront */}
                          {(() => {
                            const currentX = 100 + 5 * Math.sin(animationTime);
                            const wavelets = generateStraightWavelets(currentX, 80, currentX, 220);
                            const newX = currentX + 40;
                            
                            return (
                              <>
                                {/* Show individual wavelets */}
                                {showWavelets && wavelets.map((wavelet, index) => (
                                  <circle 
                                    key={index}
                                    cx={wavelet.x} 
                                    cy={wavelet.y} 
                                    r={20} 
                                    fill="none" 
                                    stroke="#ef4444" 
                                    strokeWidth="1"
                                    strokeDasharray="2,2"
                                    opacity="0.6"
                                  />
                                ))}
                                
                                {/* New wavefront (envelope) - straight line tangent to wavelets */}
                                <line 
                                  x1={newX} 
                                  y1="80" 
                                  x2={newX} 
                                  y2="220" 
                                  stroke="#10b981" 
                                  strokeWidth="3"
                                  opacity="0.9"
                                />
                                
                                {/* Source points on original wavefront */}
                                {wavelets.map((wavelet, index) => (
                                  <circle 
                                    key={`point-${index}`}
                                    cx={wavelet.x} 
                                    cy={wavelet.y} 
                                    r="2" 
                                    fill="#3b82f6"
                                  />
                                ))}
                                
                                {/* Direction arrow */}
                                <line 
                                  x1={currentX + 20} 
                                  y1="150" 
                                  x2={newX - 5} 
                                  y2="150" 
                                  stroke="#374151" 
                                  strokeWidth="2"
                                  markerEnd="url(#arrowhead-wave)"
                                />
                                <text x={currentX + 30} y="140" className="text-xs fill-gray-700">Wave Direction</text>
                              </>
                            );
                          })()}
                          
                          {/* Labels */}
                          <text x="300" y="80" className="text-sm fill-blue-700 font-semibold">Original Wavefront</text>
                          <text x="300" y="100" className="text-sm fill-green-700 font-semibold">New Wavefront (Envelope)</text>
                          {showWavelets && <text x="300" y="120" className="text-sm fill-red-700 font-semibold">Individual Wavelets</text>}
                        </>
                      )}
                      
                      {/* Legend */}
                      <g transform="translate(350, 200)">
                        <rect x="0" y="0" width="200" height="80" fill="white" stroke="#d1d5db" strokeWidth="1" rx="5" opacity="0.9" />
                        <text x="10" y="20" className="text-sm font-semibold fill-gray-800">Huygens' Principle:</text>
                        <text x="10" y="40" className="text-xs fill-gray-700">• Each point acts as a source</text>
                        <text x="10" y="55" className="text-xs fill-gray-700">• Wavelets spread outward</text>
                        <text x="10" y="70" className="text-xs fill-gray-700">• Envelope forms new wavefront</text>
                      </g>
                    </svg>
                  </div>
                  
                  <div className="mt-4 text-center text-sm text-gray-600">
                    <p><strong>Observation:</strong> {wavefrontType === 'circular' ? 
                      'Circular wavefronts maintain their circular shape as they expand outward from a point source.' :
                      'Straight wavefronts remain straight and parallel as they propagate forward.'
                    }</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsDiffractionOpen(!isDiffractionOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Diffraction and Young's Double Slit Experiment</h3>
            <span className="text-blue-600">{isDiffractionOpen ? '▼' : '▶'}</span>
          </button>

          {isDiffractionOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Early Observations of Diffraction</h4>
                <p className="text-gray-700 mb-4">
                  Does light exhibit diffraction? In the mid-seventeenth century, a Jesuit priest, 
                  Francesco Grimaldi (1618-1663), had observed that when sunlight entered a darkened 
                  room through a tiny hole in a screen, the spot on the opposite wall was larger than 
                  would be expected from geometric rays. He also observed that the border of the image 
                  was not clear but was surrounded by coloured fringes. Grimaldi attributed this to the 
                  diffraction of light.
                </p>
                
                <p className="text-gray-700 mb-4">
                  Newton, who favoured a particle theory, was aware of Grimaldi's result. He felt that 
                  Grimaldi's result was due to the interaction of light corpuscles (ie. "little bodies") with 
                  the edges of the hole. If light were a wave, he argued, the light waves should bend 
                  more than that observed. Newton's argument seemed reasonable, yet diffraction is 
                  noticeable only when the size of the obstacle or the hole is on the order of the 
                  wavelength of the wave.
                </p>
                
                <p className="text-gray-700 mb-4">
                  Newton did not know that the wavelengths of visible light were incredibly tiny, and 
                  thus diffraction effects were very small. Indeed this is why geometric optics using rays 
                  is so successful – normal openings and obstacles are much larger than the wavelength 
                  of the light, so relatively little diffraction or bending occurs.
                </p>
                
                <h4 className="font-semibold text-gray-800 mb-3 mt-6">Young's Double Slit Experiment</h4>
                <p className="text-gray-700 mb-4">
                  In 1801, a key experiment was performed by the brilliant Thomas Young (1773 – 1829). 
                  (Refer to Pearson pages 685 to 690.) Young directed light through two parallel narrow 
                  slits a small distance apart. The light was then seen on a screen a few meters away. 
                  If light consisted of particles the result would be two bright fringes on the screen, 
                  but the actual results were quite different. Instead of two bright fringes, there were 
                  a series of alternating bright and dark fringes.
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-yellow-800 mb-2">Young's Explanation:</h5>
                  <p className="text-yellow-900 text-sm mb-2">
                    Young reasoned that he was seeing a wave interference pattern caused by the 
                    diffraction of light through each of the slits. Light diffracting through one of the 
                    slits interfered with the diffracted light from the other slit.
                  </p>
                  <p className="text-yellow-900 text-sm">
                    This experiment provided strong evidence that light behaves as a wave, since 
                    interference patterns are characteristic of wave phenomena, not particle behavior.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">Significance:</h5>
                  <p className="text-green-900 text-sm">
                    Young's double slit experiment was crucial in establishing the wave theory of light. 
                    The interference pattern could only be explained if light behaved as a wave, providing 
                    compelling evidence against the particle theory that Newton had favoured.
                  </p>
                </div>
                
                {/* Interactive Double Slit Animation */}
                <div className="bg-white p-6 rounded border border-gray-300 mt-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Double Slit Experiment</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Observe how waves from two slits create an interference pattern
                  </p>
                  
                  {/* Controls */}
                  <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Slit Separation:</label>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        value={slitSeparation}
                        onChange={(e) => setSlitSeparation(parseInt(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">{slitSeparation}px</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Slit Width:</label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={slitWidth}
                        onChange={(e) => setSlitWidth(parseInt(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">{slitWidth}px</span>
                    </div>
                    
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showInterference}
                        onChange={(e) => setShowInterference(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Show Pattern</span>
                    </label>
                    
                    <button
                      onClick={() => {
                        setDoubleSlitAnimating(!doubleSlitAnimating);
                        if (!doubleSlitAnimating) setDoubleSlitTime(0);
                      }}
                      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                        doubleSlitAnimating 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {doubleSlitAnimating ? 'Stop' : 'Start'} Animation
                    </button>
                  </div>
                  
                  {/* Animation Canvas */}
                  <div className="flex justify-center">
                    <svg width="700" height="400" viewBox="0 0 700 400" className="border border-blue-300 bg-gray-50 rounded">
                      
                      {/* Circular waves from slits */}
                        <>
                          {/* Waves from slit 1 */}
                          {Array.from({length: 8}, (_, i) => {
                            const radius = i * 30 + (doubleSlitTime * 20) % 30;
                            return radius < 400 ? (
                              <circle
                                key={`slit1-${i}`}
                                cx="150"
                                cy={150 - slitSeparation/2}
                                r={radius}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1.5"
                                opacity={0.3 - radius / 1200}
                              />
                            ) : null;
                          })}
                          
                          {/* Waves from slit 2 */}
                          {Array.from({length: 8}, (_, i) => {
                            const radius = i * 30 + (doubleSlitTime * 20) % 30;
                            return radius < 400 ? (
                              <circle
                                key={`slit2-${i}`}
                                cx="150"
                                cy={150 + slitSeparation/2}
                                r={radius}
                                fill="none"
                                stroke="#10b981"
                                strokeWidth="1.5"
                                opacity={0.3 - radius / 1200}
                              />
                            ) : null;
                          })}
                        </>
                      
                      {/* Masking rectangle to hide circular waves on left side */}
                      <>
                          <rect x="0" y="0" width="160" height="400" fill="#f3f4f6" />
                          
                          {/* Vertical plane waves approaching from left */}
                          {Array.from({length: 12}, (_, i) => {
                            const baseX = i * 15;
                            const animationOffset = (doubleSlitTime * 15) % 15;
                            const x = baseX + animationOffset;
                            
                            // Show wave if it's in the visible area before the barrier
                            return x < 140 ? (
                              <line 
                                key={`plane-wave-${i}`}
                                x1={x} 
                                y1="0" 
                                x2={x} 
                                y2="400" 
                                stroke="#3b82f6" 
                                strokeWidth="2"
                                opacity={0.6}
                              />
                            ) : null;
                          })}
                          
                          {/* Re-draw barrier on top to ensure it's visible */}
                          <rect x="140" y="0" width="20" height={150 - slitSeparation/2 - slitWidth/2} fill="#374151" />
                          <rect x="140" y={150 - slitSeparation/2 + slitWidth/2} width="20" height={slitSeparation - slitWidth} fill="#374151" />
                          <rect x="140" y={150 + slitSeparation/2 + slitWidth/2} width="20" height={250 - slitSeparation/2 - slitWidth/2} fill="#374151" />
                          
                          
                          {/* Redraw slit labels on top */}
                          <text x="170" y={150 - slitSeparation/2 + 3} className="text-xs fill-gray-700">Slit 1</text>
                          <text x="170" y={150 + slitSeparation/2 + 3} className="text-xs fill-gray-700">Slit 2</text>
                        </>
                      
                      {/* Screen */}
                      <rect x="550" y="50" width="10" height="200" fill="#6b7280" />
                      <text x="570" y="150" textAnchor="start" className="text-sm fill-gray-700">Screen</text>
                      
                      {/* Interference pattern on screen */}
                      {showInterference && (
                        <>
                          {/* Dark background for screen */}
                          <rect x="550" y="50" width="10" height="200" fill="#1f2937" />
                          
                          {/* Bright fringes only */}
                          {Array.from({length: 100}, (_, i) => {
                            const y = 50 + i * 2;
                            const intensity = calculateIntensity(
                              550, 
                              y, 
                              150 - slitSeparation/2, 
                              150 + slitSeparation/2, 
                              doubleSlitTime
                            );
                            
                            // Only show bright fringes (intensity above threshold)
                            // Adjust threshold based on slit width to show diffraction effects
                            const threshold = 0.3 + (slitWidth / 20) * 0.4; // wider slits = higher threshold
                            if (intensity > threshold) {
                              const opacity = Math.min(1, intensity);
                              return (
                                <rect
                                  key={`pattern-${i}`}
                                  x="550"
                                  y={y}
                                  width="10"
                                  height="2"
                                  fill="#ffffff"
                                  opacity={opacity}
                                />
                              );
                            }
                            return null;
                          })}
                          
                          {/* Pattern intensity graph */}
                          <g transform="translate(580, 50)">
                            <rect x="0" y="0" width="100" height="200" fill="white" stroke="#d1d5db" strokeWidth="1" opacity="0.9" />
                            <text x="50" y="15" textAnchor="middle" className="text-xs font-semibold fill-gray-800">Intensity</text>
                            
                            {/* Draw intensity curve */}
                            <path 
                              d={Array.from({length: 100}, (_, i) => {
                                const y = i * 2;
                                const intensity = calculateIntensity(
                                  550, 
                                  50 + y, 
                                  150 - slitSeparation/2, 
                                  150 + slitSeparation/2, 
                                  doubleSlitTime
                                );
                                const x = 10 + intensity * 40;
                                return `${i === 0 ? 'M' : 'L'} ${x} ${20 + y * 0.8}`;
                              }).join(' ')}
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                            />
                            
                            {/* Visual bright/dark fringe indicators */}
                            <rect x="70" y="50" width="25" height="15" fill="#ffffff" stroke="#d1d5db" strokeWidth="1" />
                            <text x="83" y="60" textAnchor="middle" className="text-xs fill-gray-700">Bright</text>
                            
                            <rect x="70" y="90" width="25" height="15" fill="#1f2937" stroke="#d1d5db" strokeWidth="1" />
                            <text x="83" y="100" textAnchor="middle" className="text-xs fill-white">Dark</text>
                            
                            <rect x="70" y="130" width="25" height="15" fill="#ffffff" stroke="#d1d5db" strokeWidth="1" />
                            <text x="83" y="140" textAnchor="middle" className="text-xs fill-gray-700">Bright</text>
                            
                            <rect x="70" y="170" width="25" height="15" fill="#1f2937" stroke="#d1d5db" strokeWidth="1" />
                            <text x="83" y="180" textAnchor="middle" className="text-xs fill-white">Dark</text>
                          </g>
                        </>
                      )}
                      
                      {/* Legend */}
                      <g transform="translate(20, 300)">
                        <rect x="0" y="0" width="660" height="80" fill="white" stroke="#d1d5db" strokeWidth="1" rx="5" opacity="0.9" />
                        <text x="10" y="20" className="text-sm font-semibold fill-gray-800">What's Happening:</text>
                        <text x="10" y="40" className="text-xs fill-gray-700">• Light diffracts through both slits, creating two coherent sources</text>
                        <text x="10" y="55" className="text-xs fill-gray-700">• Waves from each slit overlap and interfere (constructive and destructive)</text>
                        <text x="10" y="70" className="text-xs fill-gray-700">• Result: Alternating bright and dark fringes on the screen (interference pattern)</text>
                        
                      </g>
                    </svg>
                  </div>
                  
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Key Observations:</h5>
                    <ul className="text-sm text-blue-900 space-y-1">
                      <li>• <strong>Bright fringes:</strong> Where waves from both slits arrive in phase (constructive interference)</li>
                      <li>• <strong>Dark fringes:</strong> Where waves arrive out of phase (destructive interference)</li>
                      <li>• <strong>Pattern spacing:</strong> Depends on wavelength and slit separation - closer slits = wider fringes</li>
                      <li>• <strong>Slit width effect:</strong> Narrower slits produce sharper, more defined fringes; wider slits reduce pattern clarity</li>
                      <li>• This pattern <strong>cannot</strong> be explained by particle theory - only by wave theory!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsInterferenceOpen(!isInterferenceOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Interference of Light</h3>
            <span className="text-blue-600">{isInterferenceOpen ? '▼' : '▶'}</span>
          </button>

          {isInterferenceOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Recall from Physics 20 that when two waves meet they interfere with each other in an 
                  additive fashion. The waves combine either constructively or destructively depending 
                  on the situation. For two-dimensional mechanical waves consider the situation where 
                  two sets of waves are being generated at the same time and in the same distance (d) 
                  from each other.
                </p>
                
                <p className="text-gray-700 mb-4">
                  When crests meet crests and troughs meet troughs, constructive interference occurs 
                  and these are called antinodes or maxima. When crests meet troughs, complete 
                  destructive interference occurs and these are called nodes or minima. Notice the 
                  pattern of antinodes with nodes in between them.
                </p>
                
                <h4 className="font-semibold text-gray-800 mb-3">Path Difference and Interference</h4>
                <p className="text-gray-700 mb-4">
                  To understand how an interference pattern is produced, consider the diagrams below. 
                  Two waves of wavelength λ are shown to originate from two vibrating sources (S₁ and S₂) 
                  a distance d apart. While waves spread out in all directions, we will focus our attention 
                  on the two wave trains shown in each of the following diagrams.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h5 className="font-semibold text-blue-800 mb-2">Key Principle:</h5>
                  <p className="text-blue-900 text-sm mb-2">
                    <strong>Constructive Interference:</strong> When waves travel the same path length – 
                    when they meet they are in phase and constructive interference occurs resulting in 
                    a maximum or antinode.
                  </p>
                  <p className="text-blue-900 text-sm">
                    <strong>Destructive Interference:</strong> There will also be constructive interference 
                    if the path difference is one wavelength or a whole number multiple of wavelengths 
                    (1λ, 2λ, 3λ, nλ).
                  </p>
                </div>
                
                {/* Interactive Interference Demonstration */}
                <div className="bg-white p-6 rounded border border-gray-300 mt-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Interference Pattern</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Adjust the path difference to see constructive and destructive interference
                  </p>
                  
                  {/* Controls */}
                  <div className="flex justify-center items-center space-x-6 mb-6">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Path Difference:</label>
                      <input
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={pathDifference}
                        onChange={(e) => setPathDifference(parseFloat(e.target.value))}
                        className="w-32"
                      />
                      <span className="text-sm text-gray-600">{pathDifference.toFixed(1)}λ</span>
                    </div>
                    
                    <button
                      onClick={() => setInterferenceAnimating(!interferenceAnimating)}
                      className={`px-4 py-2 rounded font-medium text-sm transition-colors ${
                        interferenceAnimating 
                          ? 'bg-red-500 text-white hover:bg-red-600' 
                          : 'bg-green-500 text-white hover:bg-green-600'
                      }`}
                    >
                      {interferenceAnimating ? 'Stop' : 'Start'} Animation
                    </button>
                  </div>
                  
                  {/* Animation Canvas */}
                  <div className="flex justify-center">
                    <svg width="600" height="350" viewBox="0 0 600 350" className="border border-blue-300 bg-gray-50 rounded">
                      {/* Source S1 */}
                      <circle cx="100" cy="150" r="8" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                      <text x="100" y="135" textAnchor="middle" className="text-sm font-semibold fill-gray-700">S₁</text>
                      
                      {/* Source S2 */}
                      <circle cx="100" cy="200" r="8" fill="#10b981" stroke="#059669" strokeWidth="2" />
                      <text x="100" y="220" textAnchor="middle" className="text-sm font-semibold fill-gray-700">S₂</text>
                      
                      {/* Distance indicator */}
                      <line x1="90" y1="150" x2="90" y2="200" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="80" y="175" textAnchor="middle" className="text-xs fill-gray-600">d</text>
                      
                      {/* Wave from S1 */}
                      {Array.from({length: 5}, (_, i) => {
                        const radius = 40 + i * 60 + (interferenceTime * 30) % 60;
                        return radius < 300 ? (
                          <circle
                            key={`s1-${i}`}
                            cx="100"
                            cy="150"
                            r={radius}
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2"
                            opacity={0.4 - radius / 600}
                          />
                        ) : null;
                      })}
                      
                      {/* Wave from S2 with path difference */}
                      {Array.from({length: 5}, (_, i) => {
                        const baseRadius = 40 + i * 60 + (interferenceTime * 30) % 60;
                        const phaseShift = pathDifference * 60; // Convert wavelengths to pixels
                        const radius = baseRadius - phaseShift;
                        return radius > 0 && radius < 300 ? (
                          <circle
                            key={`s2-${i}`}
                            cx="100"
                            cy="200"
                            r={radius}
                            fill="none"
                            stroke="#10b981"
                            strokeWidth="2"
                            opacity={0.4 - radius / 600}
                          />
                        ) : null;
                      })}
                      
                      {/* Observation point - moved closer */}
                      <circle cx="300" cy="175" r="6" fill="#1e40af" stroke="#1e3a8a" strokeWidth="2" />
                      <text x="300" y="195" textAnchor="middle" className="text-sm font-semibold fill-gray-700">P</text>
                      
                      {/* Path lines */}
                      <line x1="108" y1="150" x2="292" y2="175" stroke="#ef4444" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
                      <line x1="108" y1="200" x2="292" y2="175" stroke="#10b981" strokeWidth="1" strokeDasharray="3,3" opacity="0.7" />
                      
                      {/* Path difference visualization - enlarged and repositioned */}
                      <g transform="translate(350, 30)">
                        <rect x="0" y="0" width="220" height="180" fill="white" stroke="#d1d5db" strokeWidth="2" rx="8" />
                        <text x="110" y="25" textAnchor="middle" className="text-lg font-semibold fill-gray-800">Wave Interference</text>
                        
                        {/* Wave 1 - enlarged */}
                        <path 
                          d={`M 15 70 ${Array.from({length: 30}, (_, i) => {
                            const x = 15 + i * 6.5;
                            const y = 70 + 25 * Math.sin((i * 0.4) + interferenceTime);
                            return `L ${x} ${y}`;
                          }).join(' ')}`}
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="3"
                        />
                        
                        {/* Wave 2 with phase shift - enlarged */}
                        <path 
                          d={`M 15 120 ${Array.from({length: 30}, (_, i) => {
                            const x = 15 + i * 6.5;
                            const phaseShift = pathDifference * 2 * Math.PI;
                            const y = 120 + 25 * Math.sin((i * 0.4) + interferenceTime + phaseShift);
                            return `L ${x} ${y}`;
                          }).join(' ')}`}
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                        />
                        
                        {/* Resultant wave - enlarged */}
                        <path 
                          d={`M 15 160 ${Array.from({length: 30}, (_, i) => {
                            const x = 15 + i * 6.5;
                            const wave1 = Math.sin((i * 0.4) + interferenceTime);
                            const phaseShift = pathDifference * 2 * Math.PI;
                            const wave2 = Math.sin((i * 0.4) + interferenceTime + phaseShift);
                            const resultant = wave1 + wave2;
                            const y = 160 + 12 * resultant;
                            return `L ${x} ${y}`;
                          }).join(' ')}`}
                          fill="none"
                          stroke="#1e40af"
                          strokeWidth="4"
                        />
                        
                        <text x="8" y="65" className="text-sm fill-red-600 font-semibold">S₁</text>
                        <text x="8" y="115" className="text-sm fill-green-600 font-semibold">S₂</text>
                        <text x="8" y="155" className="text-sm fill-blue-600 font-semibold">Result</text>
                      </g>
                      
                      {/* Interference type indicator - repositioned */}
                      <g transform="translate(150, 280)">
                        <rect x="0" y="0" width="300" height="60" fill="white" stroke="#d1d5db" strokeWidth="2" rx="8" />
                        {(() => {
                          const phaseDiff = (pathDifference % 1) * 2 * Math.PI;
                          const amplitude = 2 * Math.abs(Math.cos(phaseDiff / 2));
                          const isConstructive = Math.abs(pathDifference % 1) < 0.1 || Math.abs(pathDifference % 1) > 0.9;
                          const isDestructive = Math.abs((pathDifference + 0.5) % 1) < 0.1 || Math.abs((pathDifference - 0.5) % 1) < 0.1;
                          
                          return (
                            <>
                              <text x="150" y="25" textAnchor="middle" className="text-lg font-semibold fill-gray-800">
                                {isConstructive ? 'Constructive Interference' : 
                                 isDestructive ? 'Destructive Interference' : 
                                 'Partial Interference'}
                              </text>
                              <text x="150" y="45" textAnchor="middle" className="text-sm fill-gray-600">
                                Amplitude: {amplitude.toFixed(2)} (Max = 2.0)
                              </text>
                              <rect 
                                x="20" 
                                y="50" 
                                width={260 * (amplitude / 2)} 
                                height="8" 
                                fill={isConstructive ? '#10b981' : isDestructive ? '#ef4444' : '#f59e0b'}
                                rx="4"
                              />
                            </>
                          );
                        })()}
                      </g>
                    </svg>
                  </div>
                  
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">Observe the Effects:</h5>
                    <ul className="text-sm text-yellow-900 space-y-1">
                      <li>• <strong>Path difference = 0λ, 1λ, 2λ:</strong> Waves arrive in phase → Constructive interference → Maximum amplitude</li>
                      <li>• <strong>Path difference = 0.5λ, 1.5λ:</strong> Waves arrive out of phase → Destructive interference → Minimum amplitude</li>
                      <li>• <strong>Other values:</strong> Partial interference with intermediate amplitudes</li>
                      <li>• Watch how the resultant wave (blue) changes as you adjust the path difference!</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsDerivationOpen(!isDerivationOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Derivation of Double Source Interference Equations</h3>
            <span className="text-blue-600">{isDerivationOpen ? '▼' : '▶'}</span>
          </button>

          {isDerivationOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">Variables and Setup</h4>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-blue-800 mb-3">Key Variables:</h5>
                  <div className="grid grid-cols-2 gap-4 text-sm text-blue-900">
                    <div>
                      <p><strong>d</strong> – distance between two coherent wave sources</p>
                      <p><strong>L</strong> – distance from wave sources to viewing screen</p>
                    </div>
                    <div>
                      <p><strong>x</strong> – distance from central maximum to node/antinode of interest</p>
                      <p><strong>λ</strong> – wavelength</p>
                    </div>
                    <div className="col-span-2">
                      <p><strong>θ</strong> – angle from centre line to the node or antinode of interest</p>
                    </div>
                  </div>
                </div>
                
                {/* Geometric diagram for derivation */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Geometric Setup for Derivation</h4>
                  
                  <div className="flex justify-center">
                    <svg width="700" height="450" viewBox="0 0 700 450" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-deriv" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#333" />
                        </marker>
                      </defs>
                      
                      {/* Source A */}
                      <circle cx="100" cy="175" r="6" fill="#ef4444" stroke="#dc2626" strokeWidth="2" />
                      <text x="85" y="170" className="text-sm font-semibold fill-gray-700">A</text>
                      
                      {/* Source C */}
                      <circle cx="100" cy="275" r="6" fill="#10b981" stroke="#059669" strokeWidth="2" />
                      <text x="85" y="280" className="text-sm font-semibold fill-gray-700">C</text>
                      
                      {/* Distance d between sources */}
                      <line x1="90" y1="175" x2="90" y2="275" stroke="#6b7280" strokeWidth="2" />
                      <text x="75" y="225" textAnchor="middle" className="text-sm font-semibold fill-gray-700">d</text>
                      
                      {/* Screen */}
                      <line x1="550" y1="100" x2="550" y2="350" stroke="#374151" strokeWidth="4" />
                      <text x="560" y="225" className="text-sm fill-gray-700">Screen</text>
                      
                      {/* Point S (central maximum) */}
                      <circle cx="550" cy="225" r="4" fill="#1e40af" />
                      <text x="565" y="230" className="text-sm font-semibold fill-gray-700">S</text>
                      
                      {/* Point Q (on screen, directly across from midpoint) */}
                      <circle cx="550" cy="225" r="2" fill="#6b7280" />
                      <text x="565" y="245" className="text-xs fill-gray-600">Q</text>
                      
                      {/* Point R (observation point) */}
                      <circle cx="550" cy="160" r="4" fill="#7c3aed" />
                      <text x="565" y="165" className="text-sm font-semibold fill-gray-700">R</text>
                      
                      {/* Path from A to R */}
                      <line x1="106" y1="175" x2="544" y2="160" stroke="#ef4444" strokeWidth="2" strokeDasharray="3,3" />
                      <text x="320" y="155" className="text-xs fill-red-600">AR</text>
                      
                      {/* Path from C to R */}
                      <line x1="106" y1="275" x2="544" y2="160" stroke="#10b981" strokeWidth="2" strokeDasharray="3,3" />
                      <text x="320" y="195" className="text-xs fill-green-600">CR</text>
                      
                      {/* Distance L */}
                      <line x1="100" y1="315" x2="550" y2="315" stroke="#6b7280" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="325" y="330" textAnchor="middle" className="text-sm font-semibold fill-gray-700">L</text>
                      
                      {/* Distance x */}
                      <line x1="550" y1="235" x2="550" y2="160" stroke="#7c3aed" strokeWidth="2" />
                      <text x="570" y="197" className="text-sm font-semibold fill-purple-700">x</text>
                      
                      {/* Angle θ */}
                      <path d="M 120 225 A 20 20 0 0 0 135 215" fill="none" stroke="#f59e0b" strokeWidth="2" />
                      <text x="145" y="220" className="text-sm font-semibold fill-yellow-700">θ</text>
                      
                      {/* Triangle ABC construction */}
                      {/* Point B (perpendicular from C to AR) */}
                      <circle cx="380" cy="220" r="2" fill="#f59e0b" />
                      <text x="385" y="225" className="text-xs fill-yellow-700">B</text>
                      
                      {/* Line CB (perpendicular to AR) */}
                      <line x1="106" y1="275" x2="380" y2="220" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2,2" />
                      
                      {/* Path difference BC */}
                      <line x1="380" y1="220" x2="380" y2="204" stroke="#f59e0b" strokeWidth="3" />
                      <text x="390" y="212" className="text-xs font-semibold fill-yellow-700">BC = nλ</text>
                      
                      {/* Similar triangles indicators */}
                      <rect x="375" y="215" width="10" height="10" fill="none" stroke="#f59e0b" strokeWidth="1" />
                      <rect x="545" y="220" width="10" height="10" fill="none" stroke="#7c3aed" strokeWidth="1" />
                      
                      {/* Labels for similar triangles */}
                      <text x="300" y="400" className="text-sm font-semibold fill-gray-800">△ABC ~ △QRS</text>
                      <text x="300" y="420" className="text-xs fill-gray-600">∠B = ∠S = 90°</text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-4">
                    Geometric setup showing the path difference and similar triangles used in the derivation
                  </p>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-4">Mathematical Derivation</h4>
                
                <div className="space-y-6">
                  {/* Step 1: Condition for constructive interference */}
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2">Step 1: Condition for Constructive Interference</h5>
                    <p className="text-gray-700 mb-3">
                      For constructive interference to occur at point R, the path difference (BC) between paths 
                      AR and CR must be a whole number multiple of wavelengths:
                    </p>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <BlockMath math="BC = n\lambda \quad \text{where } n = 0, 1, 2, 3, ..." />
                    </div>
                  </div>
                  
                  {/* Step 2: Similar triangles */}
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2">Step 2: Similar Triangles Relationship</h5>
                    <p className="text-gray-700 mb-3">
                      Triangle ABC is similar to triangle QRS, with both having right angles at B and S respectively:
                    </p>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
                      <BlockMath math="\tan \theta = \frac{RS}{QS} = \frac{x}{L} \quad \text{...(1)}" />
                      <BlockMath math="\sin \theta = \frac{BC}{AC} = \frac{n\lambda}{d} \quad \text{...(2)}" />
                    </div>
                  </div>
                  
                  {/* Step 3: First useful formula */}
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2">Step 3: First Useful Formula</h5>
                    <p className="text-gray-700 mb-3">
                      Rearranging equation (2) gives us our first useful formula:
                    </p>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <BlockMath math="\sin \theta = \frac{n\lambda}{d}" />
                    </div>
                  </div>
                  
                  {/* Step 4: Small angle approximation */}
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2">Step 4: Small Angle Approximation</h5>
                    <p className="text-gray-700 mb-3">
                      For small angles (0° to 20°), we can use the approximation:
                    </p>
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <BlockMath math="\sin \theta \approx \tan \theta \quad \text{for small angles}" />
                    </div>
                  </div>
                  
                  {/* Step 5: Combining equations */}
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2">Step 5: Combining Equations</h5>
                    <p className="text-gray-700 mb-3">
                      Combining equations (1) and (2) using the small angle approximation:
                    </p>
                    <div className="bg-blue-50 p-3 rounded border border-blue-200 space-y-2">
                      <BlockMath math="\frac{x}{L} = \frac{n\lambda}{d}" />
                    </div>
                  </div>
                  
                  {/* Step 6: Final formula */}
                  <div className="bg-white p-4 rounded border border-gray-200">
                    <h5 className="font-semibold text-gray-800 mb-2">Step 6: Second Useful Formula</h5>
                    <p className="text-gray-700 mb-3">
                      Rearranging to solve for x gives us our second useful formula:
                    </p>
                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <BlockMath math="x = \frac{n\lambda L}{d}" />
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      This equation tells us the position of bright fringes (constructive interference) on the screen.
                    </p>
                  </div>
                </div>
                
                {/* Summary box */}
                <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Key Formulas for Double Source Interference:</h4>
                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-sm text-purple-900 mb-1"><strong>Angular position:</strong></p>
                      <InlineMath math="\sin \theta = \frac{n\lambda}{d}" />
                    </div>
                    <div className="bg-white p-3 rounded border border-purple-300">
                      <p className="text-sm text-purple-900 mb-1"><strong>Linear position on screen:</strong></p>
                      <InlineMath math="x = \frac{n\lambda L}{d}" />
                    </div>
                    <p className="text-xs text-purple-700 mt-2">
                      Where n = 0, 1, 2, 3, ... for bright fringes (constructive interference)
                    </p>
                  </div>
                </div>
                
                {/* Applications note */}
                <div className="mt-4 bg-gray-100 border border-gray-300 rounded-lg p-4">
                  <h5 className="font-semibold text-gray-800 mb-2">Applications:</h5>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• These equations predict the exact positions of bright and dark fringes in Young's double slit experiment</li>
                    <li>• They show that fringe spacing is proportional to wavelength (λ) and distance to screen (L)</li>
                    <li>• They demonstrate that closer slits (smaller d) produce wider fringe patterns</li>
                    <li>• These principles are used in precision measurement techniques and interferometry</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Double-Source Interference Equations - Notes</h3>
            <span className="text-blue-600">{isNotesOpen ? '▼' : '▶'}</span>
          </button>

          {isNotesOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
            <p className="text-gray-700 mb-4">
              The equations that were derived in the previous section are:
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="space-y-3">
                <div className="text-center">
                  <BlockMath math="d\sin \theta = n\lambda \quad \text{(constructive interference, } n = 1, 2, 3, \text{...)}" />
                </div>
                <div className="text-center">
                  <BlockMath math="d\sin \theta = (n - \frac{1}{2})\lambda \quad \text{(destructive interference, } n = 1, 2, 3, \text{...)}" />
                </div>
                <div className="text-center">
                  <BlockMath math="x = \frac{n\lambda L}{d} \quad \text{(constructive interference, } n = 1, 2, 3, \text{...)}" />
                </div>
                <div className="text-center">
                  <BlockMath math="x = \frac{(n - \frac{1}{2})\lambda L}{d} \quad \text{(destructive interference, } n = 1, 2, 3, \text{...)}" />
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-semibold text-gray-800 mb-2">where:</h4>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                <li><strong>λ</strong> = wavelength (m)</li>
                <li><strong>θ</strong> = angle from central line to fringe</li>
                <li><strong>n</strong> = order of fringe</li>
                <li><strong>L</strong> = distance from slits to screen (m)</li>
                <li><strong>x</strong> = distance from central bright fringe to nth fringe (m)</li>
                <li><strong>d</strong> = distance between slits (m)</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> These equations are on your formula sheet.
              </p>
            </div>
            
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> These equations may be made from the formula sheet by subtracting ½ from n.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1 - Finding Wavelength from Nodal Line</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>

          {isExample1Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A student doing Young's experiment finds that the distance between the central bright
                  fringe and the seventh nodal line is 6.0 cm. If the screen is located 3.0 m from the two
                  slits, whose separation is 220 μm, what is the wavelength of the light?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>x = 0.060 m</li>
                        <li>L = 3.0 m</li>
                        <li>d = 220 × 10⁻⁶ m</li>
                        <li>n = 7</li>
                        <li>λ = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">For destructive interference (nodal line):</span>
                      <div className="my-3">
                        <BlockMath math="x = \frac{(n - \frac{1}{2})\lambda L}{d}" />
                      </div>
                      
                      <p className="text-sm text-gray-600">Rearranging to solve for λ:</p>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{dx}{(n - \frac{1}{2})L}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substituting values:</span>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{220 \times 10^{-6} \text{ m} \times 0.060 \text{ m}}{(7 - \frac{1}{2}) \times 3.0 \text{ m}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{220 \times 10^{-6} \times 0.060}{6.5 \times 3.0}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{1.32 \times 10^{-5}}{19.5}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\lambda = 6.76 \times 10^{-7} \text{ m}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\lambda = 676 \text{ nm}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The wavelength is <span className="font-bold">676 nm</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample2Open(!isExample2Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 2 - Finding Angle to Bright Fringe</h3>
            <span className="text-blue-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>

          {isExample2Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An interference pattern is produced through two slits which are 0.045 mm apart using
                  550 nm light. What is the angle to the 4th bright fringe from the central line?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>d = 0.045 × 10⁻³ m</li>
                        <li>n = 4</li>
                        <li>λ = 550 × 10⁻⁹ m</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">For constructive interference (bright fringe):</span>
                      <div className="my-3">
                        <BlockMath math="d\sin \theta = n\lambda" />
                      </div>
                      
                      <p className="text-sm text-gray-600">Rearranging to solve for θ:</p>
                      <div className="my-3">
                        <BlockMath math="\sin \theta = \frac{n\lambda}{d}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substituting values:</span>
                      <div className="my-3">
                        <BlockMath math="\sin \theta = \frac{4 \times 550 \times 10^{-9}}{0.045 \times 10^{-3}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\sin \theta = \frac{2200 \times 10^{-9}}{0.045 \times 10^{-3}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\sin \theta = \frac{2.2 \times 10^{-6}}{4.5 \times 10^{-5}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\sin \theta = 0.0489" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="\theta = \sin^{-1}(0.0489) = 2.8°" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The angle to the 4th bright fringe is <span className="font-bold">2.8°</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample3Open(!isExample3Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 3 - Finding Separation Between Nodal Lines</h3>
            <span className="text-blue-600">{isExample3Open ? '▼' : '▶'}</span>
          </button>

          {isExample3Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An interference pattern is formed on a screen when a helium-neon laser light (λ = 632.8
                  nm) is directed through two slits. If the slits are 43 μm apart and the screen is 2.5 m
                  away, what will be the separation between adjacent nodal lines?
                </p>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> When a question asks for the separation between nodes or antinodes, set n = 1 and use
                    the constructive interference equation. The fringes are all the same distance apart,
                    whether they are bright or dark.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>x = ?</li>
                        <li>L = 2.5 m</li>
                        <li>d = 43 × 10⁻⁶ m</li>
                        <li>n = 1</li>
                        <li>λ = 632.8 × 10⁻⁹ m</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">For fringe separation (use constructive interference):</span>
                      <div className="my-3">
                        <BlockMath math="x = \frac{n\lambda L}{d}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Substituting values:</span>
                      <div className="my-3">
                        <BlockMath math="x = \frac{1 \times 632.8 \times 10^{-9} \text{ m} \times 2.5 \text{ m}}{43 \times 10^{-6} \text{ m}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="x = \frac{632.8 \times 10^{-9} \times 2.5}{43 \times 10^{-6}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="x = \frac{1.582 \times 10^{-6}}{43 \times 10^{-6}}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="x = 0.0368 \text{ m}" />
                      </div>
                      
                      <div className="my-3">
                        <BlockMath math="x = 3.68 \text{ cm}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The separation between adjacent nodal lines is <span className="font-bold">3.68 cm</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <SlideshowKnowledgeCheck
        title="Interference of Light - Knowledge Check"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_18_constructive_amplitude'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_destructive_amplitude'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_dark_fringes_cause'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_wavelength_fringe_spacing'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_path_difference_interference'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_coherence_requirement'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_single_slit_blocking'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_lightbulb_incoherence'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_fringe_count_factors'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_18_sound_dead_spots'
          }
        ]}
        courseId={courseId}
        lessonPath="lesson_18_interference_of_light"
      />

      <LessonSummary
        points={[
          "Light behaves as a wave, demonstrated by Young's double slit experiment showing interference patterns",
          "Huygens' principle: every point on a wavefront acts as a source of secondary wavelets",
          "Constructive interference occurs when waves meet in phase (path difference = nλ), creating bright fringes",
          "Destructive interference occurs when waves meet out of phase (path difference = (n-½)λ), creating dark fringes",
          "Double slit equations: d sin θ = nλ for bright fringes, x = nλL/d for fringe positions",
          "Fringe spacing depends on wavelength (λ), slit separation (d), and screen distance (L)",
          "Closer slits produce wider interference patterns; longer wavelengths create wider fringes",
          "Interference patterns provide strong evidence against Newton's particle theory of light"
        ]}
      />
    </LessonContent>
  );
};

export default InterferenceOfLight;
