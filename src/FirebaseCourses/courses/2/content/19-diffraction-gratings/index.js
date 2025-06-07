import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const DiffractionGratings = ({ course, courseId = 'default' }) => {
  const [isPoissonOpen, setIsPoissonOpen] = useState(false);
  const [isGratingsOpen, setIsGratingsOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isExample2Open, setIsExample2Open] = useState(false);
  
  // Animation states for Poisson's bright spot
  const [showWaves, setShowWaves] = useState(true);
  const [showInterference, setShowInterference] = useState(true);
  const [animationTime, setAnimationTime] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [diskSize, setDiskSize] = useState(30); // radius of disk
  
  // Animation effect
  React.useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationTime(prev => prev + 0.1);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  return (
    <LessonContent
      lessonId="lesson_19_diffraction_gratings"
      title="Lesson 12 - Diffraction Gratings"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsPoissonOpen(!isPoissonOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Poisson's Bright Spot</h3>
            <span className="text-blue-600">{isPoissonOpen ? '▼' : '▶'}</span>
          </button>

          {isPoissonOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Thomas Young published the results from his double-slit experiment in 
                  1807 which put the wave theory of light on a firm footing. However, 
                  Newton's reputation and his corpuscular theory of light that Young had 
                  challenged was accepted until more than ten years later when, in 1819, 
                  Augustin Fresnel presented to the French Academy a wave theory of light 
                  that predicted interference and diffraction effects. (Refer to Pearson pages 691 to 692.)
                </p>
                
                <p className="text-gray-700 mb-4">
                  Almost immediately after Fresnel introduced his wave theory, Simeon 
                  Poisson (1781–1840) pointed out what appeared as a counter-intuitive 
                  inference: that according to Fresnel's wave theory, if light from a point 
                  source were to fall on a solid disk, then light diffracted around the edges 
                  should constructively interfere at the center of the shadow. In other words, 
                  a bright spot should appear in the center of the shadow. That prediction 
                  seemed very unlikely. After attempting the experiment and failing to 
                  demonstrate the existence of a bright spot, Poisson claimed that he had 
                  refuted Fresnel's theory.
                </p>
                
                <p className="text-gray-700 mb-4">
                  But when the experiment was redone by François Arago in 1818, the bright 
                  spot was seen at the very center of the shadow! This was strong evidence 
                  for the wave theory and it was ironically referred to as Poisson's Bright Spot. 
                  To the right is a photograph of the shadow cast by a coin using a (nearly) 
                  point source of light (a laser in this case). The bright spot is clearly visible 
                  at the center. Note that there are also bright and dark fringes beyond the 
                  shadow. These resemble the interference fringes of a double slit. Indeed, 
                  they are due to interference of waves diffracted around different parts of 
                  the disk, and the whole is referred to as a diffraction pattern.
                </p>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-green-800 mb-2">Historical Significance:</h4>
                  <p className="text-green-900 text-sm">
                    Poisson's bright spot provided crucial evidence for the wave theory of light. 
                    What was intended as a criticism of Fresnel's theory became one of its strongest 
                    confirmations, demonstrating the power of wave interference and diffraction effects.
                  </p>
                </div>
                
                {/* Interactive Poisson's Bright Spot Animation */}
                <div className="bg-white p-6 rounded border border-gray-300 mt-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-4">Interactive Poisson's Bright Spot Demonstration</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Observe how light diffracts around a circular disk and creates a bright spot in the center of its shadow
                  </p>
                  
                  {/* Controls */}
                  <div className="flex flex-wrap justify-center items-center gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <label className="text-sm font-medium text-gray-700">Disk Size:</label>
                      <input
                        type="range"
                        min="20"
                        max="50"
                        value={diskSize}
                        onChange={(e) => setDiskSize(parseInt(e.target.value))}
                        className="w-24"
                      />
                      <span className="text-sm text-gray-600">{diskSize}px</span>
                    </div>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showWaves}
                        onChange={(e) => setShowWaves(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Show Waves</span>
                    </label>
                    
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showInterference}
                        onChange={(e) => setShowInterference(e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-sm text-gray-700">Show Shadow Pattern</span>
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
                    <svg width="700" height="400" viewBox="0 0 700 400" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <radialGradient id="shadowGradient" cx="50%" cy="50%">
                          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                          <stop offset="5%" stopColor="#e0e0e0" stopOpacity="0.6" />
                          <stop offset="20%" stopColor="#808080" stopOpacity="0.3" />
                          <stop offset="50%" stopColor="#404040" stopOpacity="0.2" />
                          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                        </radialGradient>
                        
                        <filter id="brightSpot">
                          <feGaussianBlur stdDeviation="2" />
                        </filter>
                      </defs>
                      
                      {/* Light source */}
                      <circle cx="100" cy="200" r="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2">
                        <animate attributeName="r" values="8;10;8" dur="2s" repeatCount="indefinite" />
                      </circle>
                      <text x="100" y="230" textAnchor="middle" className="text-sm font-semibold fill-gray-700">Point Source</text>
                      
                      {/* Incident waves */}
                      {showWaves && Array.from({length: 6}, (_, i) => {
                        const radius = 30 + i * 40 + (animationTime * 20) % 40;
                        return radius < 300 ? (
                          <circle
                            key={`wave-${i}`}
                            cx="100"
                            cy="200"
                            r={radius}
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="1.5"
                            opacity={0.5 - radius / 600}
                          />
                        ) : null;
                      })}
                      
                      {/* Disk obstacle */}
                      <circle 
                        cx="350" 
                        cy="200" 
                        r={diskSize} 
                        fill="#374151" 
                        stroke="#1f2937" 
                        strokeWidth="2"
                      />
                      <text x="350" y={200 + diskSize + 20} textAnchor="middle" className="text-sm font-semibold fill-gray-700">Circular Disk</text>
                      
                      {/* Screen */}
                      <rect x="550" y="50" width="10" height="300" fill="#6b7280" />
                      <text x="570" y="200" textAnchor="start" className="text-sm fill-gray-700">Screen</text>
                      
                      {/* Shadow region with interference pattern */}
                      {showInterference && (
                        <>
                          {/* Main shadow */}
                          <rect x="560" y={200 - diskSize * 1.5} width="10" height={diskSize * 3} fill="#2d3748" opacity="0.7" />
                          
                          {/* Bright spot in center */}
                          <circle 
                            cx="565" 
                            cy="200" 
                            r="3" 
                            fill="#ffffff" 
                            filter="url(#brightSpot)"
                          >
                            <animate attributeName="opacity" values="0.8;1;0.8" dur="2s" repeatCount="indefinite" />
                          </circle>
                          
                          {/* Diffraction fringes around shadow */}
                          {Array.from({length: 8}, (_, i) => {
                            const y = 200 + (i - 4) * (diskSize / 2);
                            const intensity = Math.cos((i - 4) * Math.PI / 2) ** 2;
                            return (
                              <rect
                                key={`fringe-${i}`}
                                x="560"
                                y={y - 2}
                                width="10"
                                height="4"
                                fill={i % 2 === 0 ? "#ffffff" : "#000000"}
                                opacity={intensity * 0.3}
                              />
                            );
                          })}
                        </>
                      )}
                      
                      {/* Diffracted waves around disk edges */}
                      {showWaves && (
                        <>
                          {/* Top edge diffraction */}
                          {Array.from({length: 3}, (_, i) => {
                            const radius = 10 + i * 20 + (animationTime * 15) % 20;
                            return (
                              <circle
                                key={`top-diff-${i}`}
                                cx="350"
                                cy={200 - diskSize}
                                r={radius}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1"
                                opacity={0.4 - radius / 100}
                                clipPath="url(#rightSide)"
                              />
                            );
                          })}
                          
                          {/* Bottom edge diffraction */}
                          {Array.from({length: 3}, (_, i) => {
                            const radius = 10 + i * 20 + (animationTime * 15) % 20;
                            return (
                              <circle
                                key={`bottom-diff-${i}`}
                                cx="350"
                                cy={200 + diskSize}
                                r={radius}
                                fill="none"
                                stroke="#ef4444"
                                strokeWidth="1"
                                opacity={0.4 - radius / 100}
                                clipPath="url(#rightSide)"
                              />
                            );
                          })}
                        </>
                      )}
                      
                      {/* Clip path to show only right side of diffracted waves */}
                      <defs>
                        <clipPath id="rightSide">
                          <rect x="350" y="0" width="350" height="400" />
                        </clipPath>
                      </defs>
                      
                      {/* Labels and annotations */}
                      <g transform="translate(20, 300)">
                        <rect x="0" y="0" width="660" height="90" fill="white" stroke="#d1d5db" strokeWidth="1" rx="5" opacity="0.9" />
                        <text x="10" y="20" className="text-sm font-semibold fill-gray-800">What's Happening:</text>
                        <text x="10" y="38" className="text-xs fill-gray-700">• Light from point source encounters circular disk obstacle</text>
                        <text x="10" y="53" className="text-xs fill-gray-700">• Waves diffract around edges and interfere constructively at shadow center → Poisson's bright spot!</text>
                        <text x="10" y="68" className="text-xs fill-gray-700">• Fresnel predicted this; Poisson thought it was absurd</text>
                        <text x="10" y="83" className="text-xs fill-gray-700">• Arago's experiment confirmed it, proving wave theory</text>
                      </g>
                    </svg>
                  </div>
                  
                  <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h5 className="font-semibold text-yellow-800 mb-2">Key Observations:</h5>
                    <ul className="text-sm text-yellow-900 space-y-1">
                      <li>• <strong>Bright spot:</strong> Appears at the exact center of the circular shadow</li>
                      <li>• <strong>Mechanism:</strong> Waves diffracted from all points around the disk's edge travel equal distances to the center</li>
                      <li>• <strong>Equal path lengths:</strong> All diffracted waves arrive in phase, creating constructive interference</li>
                      <li>• <strong>Diffraction fringes:</strong> Additional bright and dark bands appear around the shadow edge</li>
                      <li>• <strong>Disk size effect:</strong> Larger disks produce dimmer central spots; smaller disks produce brighter ones</li>
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
            onClick={() => setIsGratingsOpen(!isGratingsOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Diffraction Gratings</h3>
            <span className="text-blue-600">{isGratingsOpen ? '▼' : '▶'}</span>
          </button>

          {isGratingsOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  A large number of equally spaced parallel slits is called a diffraction grating. (Refer to 
                  Pearson pages 692 to 694.) Gratings are often made by ruling very fine lines on glass 
                  with a diamond tip. The spaces in between the lines serve as slits. Gratings containing 
                  more than 10,000 slits per centimetre are common today.
                </p>
                
                <p className="text-gray-700 mb-4">
                  A double slit apparatus produces an interference pattern where the fringes tend to be 
                  broad and relatively undefined. Diffraction gratings produce very sharp and well defined 
                  bright fringes and dark fringes. Check out the video clip called P30 L12 Diffraction 
                  interference in D2L. The video shows how different colours (i.e. wavelengths) of light 
                  are diffracted by different amounts.
                </p>
                
                <p className="text-gray-700 mb-4">
                  A similar derivation like the one demonstrated for the double slit apparatus in Lesson 11 
                  produces the same equations for finding the angle and location of nodes and anti-nodes.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Diffraction Grating Equations:</h4>
                  <div className="space-y-2">
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
                  
                  <div className="mt-4">
                    <p className="text-sm text-blue-900 font-medium">where:</p>
                    <ul className="list-disc pl-6 text-sm text-blue-900 space-y-1 mt-2">
                      <li>λ = wavelength (m)</li>
                      <li>θ = angle from central line to fringe</li>
                      <li>n = order of fringe</li>
                      <li>L = distance from slits to screen (m)</li>
                      <li>x = distance from central bright fringe to nth fringe (m)</li>
                      <li>d = distance between slits (m)</li>
                    </ul>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Important Note on Slit Separation:</h4>
                  <p className="text-yellow-900 text-sm mb-3">
                    The main difference in calculating variables between double slit problems and diffraction 
                    gratings is the way that slit separation is reported for diffraction gratings. Say, for 
                    example, a diffraction grating has 5000 lines/cm. To find the distance d between the 
                    lines requires two steps:
                  </p>
                  
                  <ol className="list-decimal pl-6 space-y-3 text-sm text-yellow-900">
                    <li>
                      <span className="font-medium">Calculate the number of lines per metre:</span>
                      <div className="mt-2">
                        <BlockMath math="\frac{5000 \text{ lines}}{\text{cm}} \times \frac{100 \text{ cm}}{\text{m}} = 500,000 \frac{\text{lines}}{\text{m}}" />
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">To find d, simply invert lines/m to obtain m/line:</span>
                      <div className="mt-2">
                        <BlockMath math="d = \frac{1}{500,000 \frac{\text{lines}}{\text{m}}} = 2.0 \times 10^{-6} \text{ m}" />
                      </div>
                    </li>
                  </ol>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-green-800 mb-2">Key Advantages of Diffraction Gratings:</h4>
                  <ul className="text-sm text-green-900 space-y-1">
                    <li>• Produce very sharp and well-defined bright fringes</li>
                    <li>• Create distinct separation of different wavelengths (colors)</li>
                    <li>• More precise than double slit apparatus for spectral analysis</li>
                    <li>• Can contain thousands of slits per centimeter for high resolution</li>
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
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1 - Finding Wavelength from Angle</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>

          {isExample1Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A monochromatic light source shines on a diffraction grating of 10,000 lines/cm and
                  produces a first order antinode 40.5° off the centre line. What is the wavelength of the
                  light?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>θ = 40.5°</li>
                        <li>n = 1</li>
                        <li>Grating: 10,000 lines/cm</li>
                        <li>λ = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 1: Calculate d</span>
                      <p className="text-sm text-gray-600 mt-1">Convert lines/cm to lines/m:</p>
                      <div className="my-3">
                        <BlockMath math="\frac{10,000 \text{ lines}}{\text{cm}} \times \frac{100 \text{ cm}}{\text{m}} = 1,000,000 \frac{\text{lines}}{\text{m}}" />
                      </div>
                      <p className="text-sm text-gray-600">Find the spacing:</p>
                      <div className="my-3">
                        <BlockMath math="d = \frac{1}{1,000,000 \frac{\text{lines}}{\text{m}}} = 1.0 \times 10^{-6} \text{ m}" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Use the diffraction grating equation</span>
                      <div className="my-3">
                        <BlockMath math="d\sin \theta = n\lambda" />
                      </div>
                      <p className="text-sm text-gray-600">Solving for λ:</p>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{d\sin \theta}{n}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{1.0 \times 10^{-6} \text{ m} \times \sin(40.5°)}{1}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 1.0 \times 10^{-6} \text{ m} \times 0.649" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 6.49 \times 10^{-7} \text{ m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 649 \text{ nm}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The wavelength is <span className="font-bold">649 nm</span>
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
            <h3 className="text-xl font-semibold">Example 2 - Finding Wavelength from Screen Position</h3>
            <span className="text-blue-600">{isExample2Open ? '▼' : '▶'}</span>
          </button>

          {isExample2Open && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A monochromatic light source shines on a diffraction grating of 10,000 lines/cm and
                  produces a first order antinode 65 cm off the centre line on a screen 100 cm away.
                  What is the wavelength of the light?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="font-medium">Given:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>x = 0.65 m</li>
                        <li>L = 1.00 m</li>
                        <li>n = 1</li>
                        <li>Grating: 10,000 lines/cm</li>
                        <li>λ = ?</li>
                      </ul>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 1: Calculate d</span>
                      <div className="my-3">
                        <BlockMath math="d = \frac{1}{1,000,000 \frac{\text{lines}}{\text{m}}} = 1.0 \times 10^{-6} \text{ m}" />
                      </div>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                      <p className="text-sm text-yellow-800">
                        <strong>Note:</strong> The requirement to use x = nλL/d requires that either θ &lt; 10° 
                        or x &lt;&lt; L. In this case x is quite large compared to L, so we must first calculate θ 
                        from the geometry and then use d sin θ = nλ.
                      </p>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 2: Calculate the angle from geometry</span>
                      <div className="my-3">
                        <BlockMath math="\tan \theta = \frac{x}{L} = \frac{65 \text{ cm}}{100 \text{ cm}} = 0.65" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\theta = \tan^{-1}(0.65) = 33.0°" />
                      </div>
                    </div>
                    
                    <div>
                      <span className="font-medium">Step 3: Use the diffraction grating equation</span>
                      <div className="my-3">
                        <BlockMath math="d\sin \theta = n\lambda" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{d\sin \theta}{n}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = \frac{1.0 \times 10^{-6} \text{ m} \times \sin(33.0°)}{1}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 1.0 \times 10^{-6} \text{ m} \times 0.544" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 5.44 \times 10^{-7} \text{ m}" />
                      </div>
                      <div className="my-3">
                        <BlockMath math="\lambda = 544 \text{ nm}" />
                      </div>
                    </div>
                    
                    <p className="mt-6">
                      <span className="font-semibold">Answer:</span> The wavelength is <span className="font-bold">544 nm</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <LessonSummary
        points={[
          "Poisson's bright spot appears at the center of a circular shadow, confirming wave theory of light",
          "Diffraction gratings contain thousands of equally spaced slits, producing sharp interference patterns",
          "Same equations as double slit: d sin θ = nλ for maxima, but with much sharper, brighter fringes",
          "Grating spacing d is calculated by inverting lines per unit length (e.g., 5000 lines/cm = d = 2.0 × 10⁻⁶ m)",
          "Different wavelengths diffract at different angles, allowing gratings to separate white light into colors",
          "For large angles or when x is comparable to L, use geometry to find θ first, then apply d sin θ = nλ",
          "Diffraction gratings are more precise than double slits for spectral analysis and wavelength measurement",
          "Higher line density (more lines/cm) produces greater angular separation between wavelengths"
        ]}
      />
    </LessonContent>
  );
};

export default DiffractionGratings;