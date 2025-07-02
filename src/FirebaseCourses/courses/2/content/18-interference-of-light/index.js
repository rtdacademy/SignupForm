import React, { useState, useEffect } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const InterferenceOfLight = ({ course, courseId = 'default', onPrepopulateMessage, createAskAIButton, createAskAIButtonFromElement,
AIAccordion, onAIAccordionContent }) => {
  
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

  // Note: Manual dropdown states removed - now using AIAccordion

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
        {/* AI-Enhanced Content Sections */}
        {AIAccordion ? (
          <div className="my-8">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item
                value="light-nature"
                title="Light – Wave or Particle?"
                theme="purple"
                onAskAI={onAIAccordionContent}
              >
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
              </AIAccordion.Item>

              <AIAccordion.Item
                value="wave-theory"
                title="The Wave Theory of Light"
                theme="purple"
                onAskAI={onAIAccordionContent}
              >
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
                  
                  {/* Huygens' Principle Video Demonstrations */}
                  <div className="bg-white p-6 rounded border border-gray-300 mt-6">
                    <h4 className="text-center font-semibold text-gray-800 mb-4">Huygens' Principle Video Demonstrations</h4>
                    <p className="text-center text-sm text-gray-600 mb-6">
                      Explore how Huygens' principle works through these detailed video explanations
                    </p>
                    
                    {/* Video Selection Tabs */}
                    <div className="mb-6">
                      <div className="flex justify-center space-x-2 mb-4">
                        <button
                          onClick={() => setWavefrontType('video1')}
                          className={`px-4 py-2 rounded-t font-medium text-sm transition-colors ${
                            wavefrontType === 'video1' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Introduction to Huygens' Principle
                        </button>
                        <button
                          onClick={() => setWavefrontType('video2')}
                          className={`px-4 py-2 rounded-t font-medium text-sm transition-colors ${
                            wavefrontType === 'video2' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Wave Propagation Explained
                        </button>
                        <button
                          onClick={() => setWavefrontType('video3')}
                          className={`px-4 py-2 rounded-t font-medium text-sm transition-colors ${
                            wavefrontType === 'video3' 
                              ? 'bg-purple-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Applications & Examples
                        </button>
                      </div>
                      
                      {/* Video Display Area */}
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        {wavefrontType === 'video1' && (
                          <div>
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe 
                                width="560" 
                                height="315" 
                                src="https://www.youtube.com/embed/jUKA922vO6o?si=TL5QlmCmzUR4vTRP" 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                className="w-full h-full rounded"
                              ></iframe>
                            </div>
                            <p className="mt-4 text-sm text-gray-700">
                              This video provides a comprehensive introduction to Huygens' principle, showing how every point 
                              on a wavefront acts as a source of secondary wavelets.
                            </p>
                          </div>
                        )}
                        
                        {wavefrontType === 'video2' && (
                          <div>
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe 
                                width="560" 
                                height="315" 
                                src="https://www.youtube.com/embed/sbWQJkKHJy4?si=VhQGOLHMb5RqISN_" 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                className="w-full h-full rounded"
                              ></iframe>
                            </div>
                            <p className="mt-4 text-sm text-gray-700">
                              Learn how waves propagate using Huygens' principle, including detailed explanations of 
                              wavefront construction and the envelope method.
                            </p>
                          </div>
                        )}
                        
                        {wavefrontType === 'video3' && (
                          <div>
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe 
                                width="560" 
                                height="315" 
                                src="https://www.youtube.com/embed/KAXpihrVO18?si=NatBGWxD5nK5GZWj" 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                className="w-full h-full rounded"
                              ></iframe>
                            </div>
                            <p className="mt-4 text-sm text-gray-700">
                              Explore practical applications and examples of Huygens' principle, including how it explains 
                              diffraction, refraction, and other wave phenomena.
                            </p>
                          </div>
                        )}
                        
                        {/* Default state when none selected - show first video */}
                        {wavefrontType !== 'video1' && wavefrontType !== 'video2' && wavefrontType !== 'video3' && (
                          <div>
                            <div className="aspect-w-16 aspect-h-9">
                              <iframe 
                                width="560" 
                                height="315" 
                                src="https://www.youtube.com/embed/jUKA922vO6o?si=TL5QlmCmzUR4vTRP" 
                                title="YouTube video player" 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                className="w-full h-full rounded"
                              ></iframe>
                            </div>
                            <p className="mt-4 text-sm text-gray-700">
                              Click the tabs above to navigate between different video explanations of Huygens' principle.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-semibold text-blue-800 mb-2">Key Points from Videos:</h5>
                      <ul className="text-blue-900 text-sm space-y-1">
                        <li>• Every point on a wavefront acts as a source of secondary wavelets</li>
                        <li>• The envelope of these wavelets forms the new wavefront</li>
                        <li>• This principle explains diffraction, refraction, and reflection</li>
                        <li>• Works for all types of waves - sound, light, water waves, etc.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="diffraction"
                title="Diffraction and Young's Double Slit Experiment"
                theme="blue"
                onAskAI={onAIAccordionContent}
              >
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
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <h5 className="font-semibold text-green-800 mb-2">Significance:</h5>
                    <p className="text-green-900 text-sm">
                      Young's double slit experiment was crucial in establishing the wave theory of light. 
                      The interference pattern could only be explained if light behaved as a wave, providing 
                      compelling evidence against the particle theory that Newton had favoured.
                    </p>
                  </div>
                  
                  {/* Young's Double Slit Experiment Video */}
                  <div className="bg-white p-6 rounded border border-gray-300">
                    <h5 className="text-center font-semibold text-gray-800 mb-4">Young's Double Slit Experiment Demonstration</h5>
                    <div className="aspect-w-16 aspect-h-9 mb-4">
                      <iframe 
                        width="560" 
                        height="315" 
                        src="https://www.youtube.com/embed/PVyJFzx7zig?si=YyOaniM-Ds15rF-s" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                        className="w-full h-full rounded"
                      ></iframe>
                    </div>
                    <p className="text-sm text-gray-700 text-center">
                      Watch this detailed demonstration of Young's double slit experiment, showing how the interference 
                      pattern forms and providing visual evidence of the wave nature of light.
                    </p>
                  </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="interference"
                title="Interference of Light"
                theme="blue"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 mb-4">
                    Young's double-slit experiment clearly showed that light exhibits wave properties through 
                    interference. But what exactly is interference, and how does it create the pattern of 
                    bright and dark fringes observed in the experiment?
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Wave Interference:</h4>
                    <p className="text-blue-900 text-sm">
                      When two or more waves meet at the same point, they combine according to the 
                      principle of superposition. The resulting wave amplitude is the algebraic sum of 
                      the individual wave amplitudes at that point.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-semibold text-green-800 mb-2">Constructive Interference</h4>
                      <ul className="text-green-900 text-sm space-y-1">
                        <li>• Waves arrive in phase</li>
                        <li>• Amplitudes add together</li>
                        <li>• Results in bright fringes</li>
                        <li>• Maximum intensity</li>
                      </ul>
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Destructive Interference</h4>
                      <ul className="text-red-900 text-sm space-y-1">
                        <li>• Waves arrive out of phase</li>
                        <li>• Amplitudes cancel out</li>
                        <li>• Results in dark fringes</li>
                        <li>• Minimum intensity</li>
                      </ul>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    In Young's experiment, light from the two slits travels different distances to reach 
                    any given point on the screen. This path difference determines whether the waves 
                    arrive in phase (constructive interference) or out of phase (destructive interference).
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Path Difference and Interference:</h4>
                    <p className="text-yellow-900 text-sm mb-2">
                      <strong>Constructive:</strong> Path difference = nλ (where n = 0, 1, 2, ...)
                    </p>
                    <p className="text-yellow-900 text-sm">
                      <strong>Destructive:</strong> Path difference = (n + ½)λ (where n = 0, 1, 2, ...)
                    </p>
                  </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="derivation"
                title="Derivation of Double Source Interference Equations"
                theme="blue"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="text-gray-700 mb-4">
                    To understand the mathematical relationships in Young's double slit experiment, 
                    we need to derive the equations that describe the interference pattern.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Experimental Setup:</h4>
                    <ul className="text-blue-900 text-sm space-y-1">
                      <li>• Distance between slits: d</li>
                      <li>• Distance to screen: L</li>
                      <li>• Wavelength of light: λ</li>
                      <li>• Distance from center to fringe: y</li>
                    </ul>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    The key insight is that the path difference between light from the two slits 
                    to any point on the screen determines the type of interference that occurs.
                  </p>
                  
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Key Equations:</h4>
                    <div className="space-y-2 text-sm">
                      <p><strong>Path difference:</strong> Δd = d sin θ ≈ dy/L (for small angles)</p>
                      <p><strong>Bright fringes:</strong> y = nλL/d (where n = 0, ±1, ±2, ...)</p>
                      <p><strong>Dark fringes:</strong> y = (n + ½)λL/d (where n = 0, ±1, ±2, ...)</p>
                      <p><strong>Fringe spacing:</strong> Δy = λL/d</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700">
                    These equations allow us to predict the exact locations of bright and dark fringes 
                    in the interference pattern, confirming the wave nature of light.
                  </p>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="notes"
                title="Double-Source Interference Equations - Notes"
                theme="green"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Important Notes for Problem Solving:</h4>
                    <ul className="text-blue-900 text-sm space-y-2">
                      <li>• Always identify what type of fringe you're dealing with (bright or dark)</li>
                      <li>• Remember that n = 0 corresponds to the central bright fringe</li>
                      <li>• For dark fringes, use n = 0, ±1, ±2, ... in the formula y = (n + ½)λL/d</li>
                      <li>• The small angle approximation sin θ ≈ tan θ ≈ θ is valid when L >> d</li>
                      <li>• Fringe spacing is constant and equal to λL/d</li>
                    </ul>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Common Problem Types:</h4>
                    <ul className="text-yellow-900 text-sm space-y-1">
                      <li>• Finding wavelength from fringe positions</li>
                      <li>• Calculating angles to specific fringes</li>
                      <li>• Determining fringe spacing</li>
                      <li>• Finding slit separation or screen distance</li>
                    </ul>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="font-semibold text-red-800 mb-2">Common Mistakes to Avoid:</h4>
                    <ul className="text-red-900 text-sm space-y-1">
                      <li>• Confusing bright and dark fringe formulas</li>
                      <li>• Forgetting to use the small angle approximation</li>
                      <li>• Mixing up the numbering convention for fringes</li>
                      <li>• Not paying attention to units (nm vs m for wavelength)</li>
                    </ul>
                  </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="example1"
                title="Example 1 - Finding Wavelength from Nodal Line"
                theme="green"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Problem:</h4>
                    <p className="text-blue-900 text-sm">
                      In a Young's double slit experiment, two slits are separated by 0.50 mm. 
                      A screen is placed 2.0 m away. The second dark fringe appears 2.4 mm from 
                      the central maximum. Find the wavelength of the light used.
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Given:</h4>
                    <ul className="text-gray-900 text-sm space-y-1">
                      <li>• d = 0.50 mm = 5.0 × 10⁻⁴ m</li>
                      <li>• L = 2.0 m</li>
                      <li>• y = 2.4 mm = 2.4 × 10⁻³ m (second dark fringe, n = 1)</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Solution:</h4>
                    <div className="text-green-900 text-sm space-y-2">
                      <p>For dark fringes: y = (n + ½)λL/d</p>
                      <p>For the second dark fringe, n = 1:</p>
                      <p>y = (1 + ½)λL/d = 1.5λL/d</p>
                      <p>Solving for λ:</p>
                      <p>λ = yd/(1.5L)</p>
                      <p>λ = (2.4 × 10⁻³)(5.0 × 10⁻⁴)/(1.5 × 2.0)</p>
                      <p>λ = 4.0 × 10⁻⁷ m = 400 nm</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Answer:</h4>
                    <p className="text-yellow-900 text-sm">
                      The wavelength of the light is 400 nm, which corresponds to violet light.
                    </p>
                  </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="example2"
                title="Example 2 - Finding Angle to Bright Fringe"
                theme="green"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Problem:</h4>
                    <p className="text-blue-900 text-sm">
                      Laser light with wavelength 630 nm passes through two slits separated by 0.20 mm. 
                      Find the angle to the third bright fringe from the central maximum.
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Given:</h4>
                    <ul className="text-gray-900 text-sm space-y-1">
                      <li>• λ = 630 nm = 6.30 × 10⁻⁷ m</li>
                      <li>• d = 0.20 mm = 2.0 × 10⁻⁴ m</li>
                      <li>• Third bright fringe: n = 3</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Solution:</h4>
                    <div className="text-green-900 text-sm space-y-2">
                      <p>For bright fringes: d sin θ = nλ</p>
                      <p>For the third bright fringe, n = 3:</p>
                      <p>sin θ = nλ/d = (3)(6.30 × 10⁻⁷)/(2.0 × 10⁻⁴)</p>
                      <p>sin θ = 1.89 × 10⁻⁶/2.0 × 10⁻⁴ = 0.00945</p>
                      <p>θ = arcsin(0.00945) = 0.54°</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Answer:</h4>
                    <p className="text-yellow-900 text-sm">
                      The angle to the third bright fringe is 0.54° from the central axis.
                    </p>
                  </div>
                </div>
              </AIAccordion.Item>

              <AIAccordion.Item
                value="example3"
                title="Example 3 - Finding Separation Between Nodal Lines"
                theme="green"
                onAskAI={onAIAccordionContent}
              >
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-800 mb-2">Problem:</h4>
                    <p className="text-blue-900 text-sm">
                      In a double slit experiment using light of wavelength 550 nm, the slits are 
                      0.30 mm apart and the screen is 1.5 m away. Find the separation between 
                      adjacent dark fringes (nodal lines).
                    </p>
                  </div>
                  
                  <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">Given:</h4>
                    <ul className="text-gray-900 text-sm space-y-1">
                      <li>• λ = 550 nm = 5.50 × 10⁻⁷ m</li>
                      <li>• d = 0.30 mm = 3.0 × 10⁻⁴ m</li>
                      <li>• L = 1.5 m</li>
                    </ul>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2">Solution:</h4>
                    <div className="text-green-900 text-sm space-y-2">
                      <p>The separation between adjacent fringes (bright or dark) is:</p>
                      <p>Δy = λL/d</p>
                      <p>Δy = (5.50 × 10⁻⁷)(1.5)/(3.0 × 10⁻⁴)</p>
                      <p>Δy = 8.25 × 10⁻⁷/3.0 × 10⁻⁴</p>
                      <p>Δy = 2.75 × 10⁻³ m = 2.75 mm</p>
                    </div>
                  </div>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-800 mb-2">Answer:</h4>
                    <p className="text-yellow-900 text-sm">
                      The separation between adjacent dark fringes is 2.75 mm.
                    </p>
                  </div>
                </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          // Fallback to manual accordion if AIAccordion not available
          <div className="my-8 p-4 bg-gray-100 rounded-lg">
            <p className="text-gray-600">AIAccordion component not available. Please check the implementation.</p>
          </div>
        )}
      </TextSection>

      {/* Knowledge Check and other content sections remain outside AIAccordion */}
      <TextSection>
        <div className="my-8">
          <SlideshowKnowledgeCheck
            courseId={courseId}
            lessonPath="18-interference-of-light"
            course={course}
            onAIAccordionContent={onAIAccordionContent}
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_18_interference_light_wave_theory_q1',
                title: 'Question 1: Wave Theory and Interference'
              }
            ]}
            theme="purple"
          />
        </div>
      </TextSection>

      <LessonSummary
        title="Key Concepts"
        points={[
          "Light exhibits wave properties through interference and diffraction",
          "Huygens' principle explains wave propagation using secondary wavelets", 
          "Young's double slit experiment provided crucial evidence for wave theory",
          "Constructive interference creates bright fringes, destructive creates dark fringes",
          "Path difference determines the type of interference pattern observed",
          "Mathematical equations predict exact fringe locations and spacing"
        ]}
      />
    </LessonContent>
  );
};

export default InterferenceOfLight;
