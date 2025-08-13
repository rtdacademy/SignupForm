import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 6 - Reflection of Light
 * Covers the laws of reflection and types of reflection
 */
const ReflectionOfLight = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  // Animation states
  const [incidenceAngle, setIncidenceAngle] = useState(45);
  const [surfaceType, setSurfaceType] = useState('smooth'); // 'smooth' or 'rough'
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  // Get effective courseId
  const effectiveCourseId = courseId || 
    course?.courseDetails?.courseId || 
    course?.courseId || 
    course?.id || 
    '2';
  
  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Animation effect for specular/diffuse reflection
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            setIsAnimating(false);
            return 100; // Keep at 100 instead of resetting to 0
          }
          return prev + 2;
        });
      }, 30);
    }
    return () => clearInterval(interval);
  }, [isAnimating]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LessonContent
      lessonId="lesson_1747281791046_101"
      title="Lesson 6 - Reflection of Light"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            <em>Refer to Pearson pages 653 to 656.</em>
          </p>
        </div>

        {/* Laws of Reflection Section */}
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Laws of Reflection" 
            value="laws-of-reflection" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  When we studied waves in Physics 20, we learned about the law of reflection. In terms
                  of light rays, the Laws of Reflection are:
                </p>
                
                <ol className="list-decimal pl-6 space-y-4 mb-6">
                  <li>
                    <strong>The angle of incidence (<InlineMath>{"\\theta_i"}</InlineMath>) equals the angle of reflection (<InlineMath>{"\\theta_r"}</InlineMath>).</strong>
                    <div className="mt-2 ml-4">
                      <InlineMath>{"\\theta_i = \\theta_r"}</InlineMath>
                    </div>
                    <p className="mt-2 ml-4 text-gray-700">
                      <InlineMath>{"\\theta_i"}</InlineMath> and <InlineMath>{"\\theta_r"}</InlineMath> are always measured from the normal to the surface of reflection.
                    </p>
                  </li>
                  <li>
                    <strong>The incident ray, normal, and reflected ray all lie in the same plane.</strong>
                  </li>
                </ol>

                {/* Interactive Reflection Animation */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Interactive Law of Reflection</h4>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-md mb-4">
                      <svg width="100%" height="300" viewBox="0 0 400 300" className="border border-gray-400 bg-white rounded">
                        {/* Mirror surface */}
                        <line x1="50" y1="200" x2="350" y2="200" stroke="#4A4A4A" strokeWidth="4" />
                        <text x="200" y="220" fontSize="12" fill="#666" textAnchor="middle">Mirror Surface</text>
                        
                        {/* Normal line */}
                        <line x1="200" y1="200" x2="200" y2="50" stroke="#666" strokeWidth="2" strokeDasharray="5,5" />
                        <text x="210" y="45" fontSize="12" fill="#666" textAnchor="start">Normal</text>
                        
                        {/* Calculate ray positions based on angle */}
                        {(() => {
                          const angleRad = (incidenceAngle * Math.PI) / 180;
                          const rayLength = 120;
                          
                          // Incident ray: comes from upper left
                          const incidentStartX = 200 - rayLength * Math.sin(angleRad);
                          const incidentStartY = 200 - rayLength * Math.cos(angleRad);
                          
                          // Reflected ray: goes to upper right
                          const reflectedEndX = 200 + rayLength * Math.sin(angleRad);
                          const reflectedEndY = 200 - rayLength * Math.cos(angleRad);
                          
                          // Arrow head calculations
                          const arrowSize = 8;
                          const incidentAngle = Math.atan2(200 - incidentStartY, 200 - incidentStartX);
                          const reflectedAngle = Math.atan2(reflectedEndY - 200, reflectedEndX - 200);
                          
                          return (
                            <>
                              {/* Incident ray */}
                              <line 
                                x1={incidentStartX} 
                                y1={incidentStartY} 
                                x2="200" 
                                y2="200" 
                                stroke="#FF6B6B" 
                                strokeWidth="3" 
                              />
                              {/* Incident ray arrow */}
                              <polygon 
                                points={`${200 - arrowSize * Math.cos(incidentAngle - Math.PI/6)},${200 - arrowSize * Math.sin(incidentAngle - Math.PI/6)} 200,200 ${200 - arrowSize * Math.cos(incidentAngle + Math.PI/6)},${200 - arrowSize * Math.sin(incidentAngle + Math.PI/6)}`}
                                fill="#FF6B6B" 
                              />
                              <text 
                                x={incidentStartX - 20} 
                                y={incidentStartY - 10} 
                                fontSize="12" 
                                fill="#FF6B6B" 
                                textAnchor="middle" 
                                fontWeight="bold"
                              >
                                Incident ray
                              </text>
                              
                              {/* Reflected ray */}
                              <line 
                                x1="200" 
                                y1="200" 
                                x2={reflectedEndX} 
                                y2={reflectedEndY} 
                                stroke="#4ECDC4" 
                                strokeWidth="3" 
                              />
                              {/* Reflected ray arrow */}
                              <polygon 
                                points={`${reflectedEndX - arrowSize * Math.cos(reflectedAngle - Math.PI/6)},${reflectedEndY - arrowSize * Math.sin(reflectedAngle - Math.PI/6)} ${reflectedEndX},${reflectedEndY} ${reflectedEndX - arrowSize * Math.cos(reflectedAngle + Math.PI/6)},${reflectedEndY - arrowSize * Math.sin(reflectedAngle + Math.PI/6)}`}
                                fill="#4ECDC4" 
                              />
                              <text 
                                x={reflectedEndX + 20} 
                                y={reflectedEndY - 10} 
                                fontSize="12" 
                                fill="#4ECDC4" 
                                textAnchor="middle" 
                                fontWeight="bold"
                              >
                                Reflected ray
                              </text>
                              
                              {/* Angle arcs */}
                              <path 
                                d={`M 200 170 A 30 30 0 0 0 ${200 - 30 * Math.sin(angleRad)} ${200 - 30 * Math.cos(angleRad)}`} 
                                stroke="#FF6B6B" 
                                strokeWidth="2" 
                                fill="none" 
                              />
                              <text 
                                x={200 - 35 * Math.sin(angleRad/2)} 
                                y={200 - 35 * Math.cos(angleRad/2)} 
                                fontSize="14" 
                                fill="#FF6B6B" 
                                textAnchor="middle"
                              >
                                <tspan>θ</tspan><tspan dy="3" fontSize="10">i</tspan>
                              </text>
                              
                              <path 
                                d={`M ${200 + 30 * Math.sin(angleRad)} ${200 - 30 * Math.cos(angleRad)} A 30 30 0 0 0 200 170`} 
                                stroke="#4ECDC4" 
                                strokeWidth="2" 
                                fill="none" 
                              />
                              <text 
                                x={200 + 35 * Math.sin(angleRad/2)} 
                                y={200 - 35 * Math.cos(angleRad/2)} 
                                fontSize="14" 
                                fill="#4ECDC4" 
                                textAnchor="middle"
                              >
                                <tspan>θ</tspan><tspan dy="3" fontSize="10">r</tspan>
                              </text>
                              
                              {/* Angle values */}
                              <text x="200" y="260" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">
                                θ<tspan dy="3" fontSize="10">i</tspan> = θ<tspan dy="-3" fontSize="10">r</tspan> = {incidenceAngle}°
                              </text>
                            </>
                          );
                        })()}
                      </svg>
                    </div>
                    
                    {/* Angle slider */}
                    <div className="w-full max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Angle of Incidence: {incidenceAngle}°
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="85"
                        value={incidenceAngle}
                        onChange={(e) => setIncidenceAngle(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(incidenceAngle - 5) / 80 * 100}%, #E5E7EB ${(incidenceAngle - 5) / 80 * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>5°</span>
                        <span>45°</span>
                        <span>85°</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 w-full max-w-md">
                      <p className="text-sm text-blue-800">
                        <strong>Try it:</strong> Move the slider to change the angle of incidence. Notice how the 
                        angle of reflection always equals the angle of incidence, demonstrating the law of reflection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Laws of Reflection</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Types of Reflection Section */}
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Types of Reflection" 
            value="types-of-reflection" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <div className="space-y-4 mb-6">
                  <div>
                    <h5 className="font-semibold text-gray-700">Specular Reflection</h5>
                    <p className="mt-2">
                      When parallel light rays strike a smooth surface (plane mirror), they all obey the law of reflection and
                      emerge as reflected parallel rays. This is an example of <strong>specular reflection</strong>.
                    </p>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-700">Diffuse Reflection</h5>
                    <p className="mt-2">
                      When parallel light rays strike an irregular or rough surface they will not be reflected as parallel rays. In
                      each case, the ray obeys the law of reflection, but the rays are reflected in a multitude of directions.
                      The surface is said to produce <strong>diffuse reflection</strong>.
                    </p>
                  </div>
                </div>

                {/* Interactive Animation for Types of Reflection */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Interactive Comparison: Specular vs Diffuse Reflection</h4>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl mb-4">
                      <svg width="100%" height="350" viewBox="0 0 700 350" className="border border-gray-400 bg-white rounded">
                        {/* Surface */}
                        {surfaceType === 'smooth' ? (
                          <>
                            {/* Smooth surface */}
                            <line x1="50" y1="250" x2="650" y2="250" stroke="#4A4A4A" strokeWidth="4" />
                            <text x="350" y="270" fontSize="14" fill="#666" textAnchor="middle" fontWeight="bold">Smooth Surface (Mirror)</text>
                          </>
                        ) : (
                          <>
                            {/* Rough surface */}
                            <path d="M 50 250 Q 100 240, 150 250 T 250 250 Q 300 240, 350 250 T 450 250 Q 500 240, 550 250 T 650 250" 
                                  stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            <text x="350" y="270" fontSize="14" fill="#666" textAnchor="middle" fontWeight="bold">Rough Surface</text>
                          </>
                        )}

                        {/* Multiple parallel incident rays */}
                        {[150, 250, 350, 450, 550].map((xPos, index) => {
                          const progress = animationProgress / 100;
                          
                          // Incident rays coming in at 30 degrees from vertical
                          const incidentAngle = 30 * Math.PI / 180;
                          const rayLength = 200;
                          
                          // Calculate start position (upper left)
                          const incidentStartX = xPos - rayLength * Math.sin(incidentAngle);
                          const incidentStartY = 50;
                          
                          // End position on surface
                          const incidentEndX = xPos;
                          const incidentEndY = 250;
                          
                          // Current position based on progress
                          const currentProgress = Math.min(progress * 2, 1);
                          const currentIncidentX = incidentStartX + (incidentEndX - incidentStartX) * currentProgress;
                          const currentIncidentY = incidentStartY + (incidentEndY - incidentStartY) * currentProgress;
                          
                          // Calculate local surface normal for rough surface
                          let localNormalAngle = 0;
                          if (surfaceType === 'rough') {
                            // Create different angles for different positions on rough surface
                            const variations = [-15, 10, -20, 15, -10];
                            localNormalAngle = variations[index] * Math.PI / 180;
                          }
                          
                          // Reflected rays (start animating after incident rays reach surface)
                          const reflectionProgress = Math.max(0, (progress - 0.5) * 2);
                          let reflectedEndX, reflectedEndY;
                          
                          if (surfaceType === 'smooth') {
                            // Specular reflection - all rays reflect at same angle (30 degrees to the right)
                            reflectedEndX = xPos + rayLength * Math.sin(incidentAngle) * reflectionProgress;
                            reflectedEndY = 250 - rayLength * Math.cos(incidentAngle) * reflectionProgress;
                          } else {
                            // Diffuse reflection - rays scatter in different directions
                            const baseReflectionAngle = incidentAngle; // Base reflection angle
                            const scatterAngle = baseReflectionAngle + localNormalAngle * 2;
                            reflectedEndX = xPos + 150 * Math.sin(scatterAngle) * reflectionProgress;
                            reflectedEndY = 250 - 150 * Math.cos(scatterAngle) * reflectionProgress;
                          }
                          
                          return (
                            <g key={index}>
                              {/* Incident ray */}
                              {progress > 0 && (
                                <>
                                  <line
                                    x1={incidentStartX}
                                    y1={incidentStartY}
                                    x2={currentIncidentX}
                                    y2={currentIncidentY}
                                    stroke="#FF6B6B"
                                    strokeWidth="3"
                                  />
                                  {/* Arrow head */}
                                  {currentProgress < 0.95 && (
                                    <polygon
                                      points={`${currentIncidentX-6},${currentIncidentY-2} ${currentIncidentX},${currentIncidentY} ${currentIncidentX-2},${currentIncidentY-6}`}
                                      fill="#FF6B6B"
                                    />
                                  )}
                                </>
                              )}
                              
                              {/* Reflected ray */}
                              {progress > 0.5 && (
                                <>
                                  <line
                                    x1={xPos}
                                    y1={250}
                                    x2={reflectedEndX}
                                    y2={reflectedEndY}
                                    stroke="#4ECDC4"
                                    strokeWidth="3"
                                  />
                                  {/* Arrow head */}
                                  {reflectionProgress > 0.1 && (
                                    <polygon
                                      points={`${reflectedEndX-6},${reflectedEndY+2} ${reflectedEndX},${reflectedEndY} ${reflectedEndX+2},${reflectedEndY-6}`}
                                      fill="#4ECDC4"
                                      transform={surfaceType === 'rough' ? 
                                        `rotate(${Math.atan2(reflectedEndY - 250, reflectedEndX - xPos) * 180 / Math.PI} ${reflectedEndX} ${reflectedEndY})` : 
                                        ''}
                                    />
                                  )}
                                </>
                              )}
                            </g>
                          );
                        })}
                        
                        {/* Labels */}
                        <text x="350" y="30" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Parallel Incident Rays</text>
                        
                        {animationProgress > 50 && (
                          <text x="350" y="320" fontSize="12" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">
                            {surfaceType === 'smooth' ? 'Parallel Reflected Rays' : 'Scattered Reflected Rays'}
                          </text>
                        )}
                      </svg>
                    </div>
                    
                    {/* Controls */}
                    <div className="w-full max-w-md space-y-4">
                      {/* Surface type toggle */}
                      <div className="flex items-center justify-center space-x-4">
                        <button
                          onClick={() => {
                            setSurfaceType('smooth');
                            setAnimationProgress(0);
                            setIsAnimating(false);
                          }}
                          className={`px-4 py-2 rounded ${
                            surfaceType === 'smooth' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Smooth Surface
                        </button>
                        <button
                          onClick={() => {
                            setSurfaceType('rough');
                            setAnimationProgress(0);
                            setIsAnimating(false);
                          }}
                          className={`px-4 py-2 rounded ${
                            surfaceType === 'rough' 
                              ? 'bg-blue-600 text-white' 
                              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          }`}
                        >
                          Rough Surface
                        </button>
                      </div>
                      
                      {/* Play/Reset button */}
                      <div className="flex justify-center">
                        <button
                          onClick={() => {
                            if (animationProgress === 100) {
                              // Reset the animation
                              setAnimationProgress(0);
                              setIsAnimating(false);
                            } else {
                              // Play the animation
                              setAnimationProgress(0);
                              setIsAnimating(true);
                            }
                          }}
                          className={`px-6 py-2 rounded transition-colors ${
                            animationProgress === 100 
                              ? 'bg-orange-600 hover:bg-orange-700 text-white' 
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {isAnimating ? 'Playing...' : animationProgress === 100 ? 'Reset Animation' : 'Play Animation'}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 w-full max-w-md">
                      <p className="text-sm text-blue-800">
                        <strong>Observe:</strong> Toggle between smooth and rough surfaces, then play the animation. 
                        Notice how smooth surfaces produce specular reflection (parallel rays remain parallel) while 
                        rough surfaces produce diffuse reflection (rays scatter in many directions).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Types of Reflection</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 1 Section */}
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 1 - Finding the Angle of Reflection" 
            value="example-1-finding-angle-of-reflection" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the angle of reflection for the light ray in the diagram below?
                </p>

                {/* Diagram showing the problem */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Ray Diagram</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-md mb-4">
                      <svg width="100%" height="300" viewBox="0 0 400 300" className="border border-gray-400 bg-white rounded">
                        {/* Mirror surface */}
                        <line x1="50" y1="200" x2="350" y2="200" stroke="#4A4A4A" strokeWidth="4" />
                        <text x="200" y="220" fontSize="12" fill="#666" textAnchor="middle">Mirror</text>
                        
                        {/* Normal line */}
                        <line x1="200" y1="200" x2="200" y2="50" stroke="#666" strokeWidth="2" strokeDasharray="5,5" />
                        <text x="210" y="45" fontSize="12" fill="#666" textAnchor="start">Normal</text>
                        
                        {/* Incident ray at 70° from normal */}
                        <line x1="80" y1="80" x2="200" y2="200" stroke="#FF6B6B" strokeWidth="3" />
                        <polygon points="195,195 200,200 195,205" fill="#FF6B6B" transform="rotate(-50 200 200)" />
                        <text x="100" y="70" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Incident ray</text>
                        
                        {/* Reflected ray at 70° from normal */}
                        <line x1="200" y1="200" x2="320" y2="80" stroke="#4ECDC4" strokeWidth="3" strokeDasharray="5,5" opacity="0.5" />
                        <polygon points="315,75 320,80 315,85" fill="#4ECDC4" opacity="0.5" transform="rotate(50 320 80)" />
                        <text x="300" y="70" fontSize="12" fill="#4ECDC4" textAnchor="middle" fontWeight="bold" opacity="0.5">Reflected ray (to find)</text>
                        
                        {/* Angle measurements */}
                        {/* 20° angle label */}
                        <text x="165" y="190" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">20°</text>
                        
                        {/* Right angle indicator */}
                        <rect x="185" y="185" width="15" height="15" fill="none" stroke="#333" strokeWidth="2" />
                        <circle cx="192.5" cy="192.5" r="1.5" fill="#333" />
                        
                        {/* θi angle label */}
                        <text x="175" y="155" fontSize="14" fill="#FF6B6B" textAnchor="middle" opacity="0.7">
                          <tspan>θ</tspan><tspan dy="3" fontSize="10">i</tspan><tspan dy="-3"> = ?</tspan>
                        </text>
                        
                        {/* θr angle label */}
                        <text x="225" y="155" fontSize="14" fill="#4ECDC4" textAnchor="middle" opacity="0.5">
                          <tspan>θ</tspan><tspan dy="3" fontSize="10">r</tspan><tspan dy="-3"> = ?</tspan>
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Identify the given angle:</strong>
                      <div className="mt-2 ml-4">
                        <p>The angle between the incident ray and the mirror surface is 20°</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find the angle of incidence:</strong>
                      <div className="mt-2 ml-4">
                        <p>Since angles are measured from the normal:</p>
                        <div className="text-center mt-2">
                          <BlockMath>{'\\theta_i = 90° - 20° = 70°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply the law of reflection:</strong>
                      <div className="mt-2 ml-4">
                        <div className="text-center">
                          <BlockMath>{'\\theta_r = \\theta_i = 70°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The angle of reflection is <InlineMath>{'70°'}</InlineMath>
                    </p>
                    
                    <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Remember:</strong> Angles of incidence and reflection are always measured from 
                        the normal (the perpendicular line to the surface), not from the surface itself.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 1 - Finding the Angle of Reflection</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 2 Section */}
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 2 - Angle Between Reflected Ray and Mirror" 
            value="example-2-angle-between-reflected-ray-and-mirror" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the angle between the reflected ray and the mirror surface for the diagram below?
                </p>

                {/* Diagram showing rays with 150° angle between them */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Ray Diagram</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-md mb-4">
                      <svg width="100%" height="350" viewBox="0 0 400 350" className="border border-gray-400 bg-white rounded">
                        {/* Mirror surface */}
                        <line x1="50" y1="250" x2="350" y2="250" stroke="#4A4A4A" strokeWidth="4" />
                        <text x="200" y="270" fontSize="12" fill="#666" textAnchor="middle">Mirror</text>
                        
                        {/* Normal line (to be drawn) */}
                        <line x1="200" y1="250" x2="200" y2="100" stroke="#666" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                        <text x="210" y="95" fontSize="12" fill="#666" textAnchor="start" opacity="0.3">Normal (to be drawn)</text>
                        
                        {/* Incident ray - comes in at 75° from normal (15° from surface) */}
                        <line x1="80" y1="130" x2="200" y2="250" stroke="#FF6B6B" strokeWidth="3" />
                        <polygon points="195,245 200,250 195,255" fill="#FF6B6B" transform="rotate(-45 200 250)" />
                        <text x="90" y="120" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Incident ray</text>
                        
                        {/* Reflected ray - goes out at 75° from normal (15° from surface) */}
                        <line x1="200" y1="250" x2="320" y2="130" stroke="#4ECDC4" strokeWidth="3" />
                        <polygon points="315,125 320,130 315,135" fill="#4ECDC4" transform="rotate(45 320 130)" />
                        <text x="310" y="120" fontSize="12" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">Reflected ray</text>
                        
                        {/* 150° angle between rays */}
                        <text x="200" y="230" fontSize="16" fill="#333" textAnchor="middle" fontWeight="bold">150°</text>
                        
                        {/* Angle to find - between reflected ray and surface */}
                        <text x="260" y="240" fontSize="14" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">?</text>
                        
                        {/* Note about normal bisecting the angle */}
                        <text x="200" y="320" fontSize="11" fill="#666" textAnchor="middle" fontStyle="italic">
                          The normal bisects the angle between incident and reflected rays
                        </text>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Understanding the key principle:</strong>
                      <div className="mt-2 ml-4">
                        <p>The normal bisects the angle between the incident and reflected rays.</p>
                        <p className="mt-1">Given: The angle between the incident and reflected rays is 150°</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find the angle of incidence (and reflection):</strong>
                      <div className="mt-2 ml-4">
                        <p>Since the normal bisects the 150° angle:</p>
                        <div className="text-center mt-2">
                          <BlockMath>{'\\theta_i = \\frac{150°}{2} = 75°'}</BlockMath>
                        </div>
                        <div className="text-center mt-2">
                          <BlockMath>{'\\theta_r = \\theta_i = 75°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find the angle between the reflected ray and the mirror:</strong>
                      <div className="mt-2 ml-4">
                        <p>Since the angle of reflection is measured from the normal:</p>
                        <div className="text-center mt-2">
                          <BlockMath>{'\\text{Angle from mirror} = 90° - 75° = 15°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The angle between the reflected ray and the mirror surface is <InlineMath>{'15°'}</InlineMath>
                    </p>
                    
                    <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Key insight:</strong> When you know the total angle between incident and reflected rays, 
                        the normal always bisects this angle. This is a direct consequence of the law of reflection 
                        (θᵢ = θᵣ).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 2 - Angle Between Reflected Ray and Mirror</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 3 Section */}
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 3 - Multiple Reflections Between Two Mirrors" 
            value="example-3-multiple-reflections-between-two-mirrors" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the angle of reflection for the light ray bouncing off of mirror II in the diagram below?
                </p>

                {/* Diagram showing two mirrors at angles */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Two-Mirror System</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl mb-4">
                      <svg width="100%" height="400" viewBox="0 0 600 400" className="border border-gray-400 bg-white rounded">
                        {/* Mirror I - at 30° angle */}
                        <line x1="100" y1="300" x2="300" y2="200" stroke="#4A4A4A" strokeWidth="4" />
                        <text x="220" y="280" fontSize="12" fill="#666" textAnchor="middle" fontWeight="bold">Mirror I</text>
                        
                        {/* Mirror II - positioned to create 100° angle with Mirror I */}
                        <line x1="300" y1="200" x2="340" y2="50" stroke="#4A4A4A" strokeWidth="4" />
                        <text x="370" y="90" fontSize="12" fill="#666" textAnchor="middle" fontWeight="bold">Mirror II</text>
                        
                        {/* Angle labels */}
                        <text x="120" y="280" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">30°</text>
                        <text x="285" y="200" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">100°</text>
                        
                        {/* Incident ray - at 30° from Mirror I surface */}
                        <line x1="100" y1="270" x2="200" y2="250" stroke="#FF6B6B" strokeWidth="3" />
                        <polygon points="195,249 200,250 198,256" fill="#FF6B6B" />
                        <text x="120" y="255" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Incident ray</text>
                        
                        {/* Ray from Mirror I to Mirror II */}
                        <line x1="200" y1="250" x2="320" y2="125" stroke="#FFA500" strokeWidth="3" />
                        <polygon points="316,122 320,125 317,129" fill="#FFA500" />
                        
                        {/* Reflected ray from Mirror II - going above the normal with matching angle */}
                        <line x1="320" y1="125" x2="270" y2="30" stroke="#4ECDC4" strokeWidth="3" strokeDasharray="5,5" opacity="0.7" />
                        <polygon points="272,27 270,30 274,32" fill="#4ECDC4" opacity="0.7" />
                        <text x="270" y="20" fontSize="12" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">Reflected ray</text>
                        
                        {/* Normal lines (to be drawn) */}
                        {/* Normal I - perpendicular to Mirror I (30° slope) */}
                        <line x1="200" y1="250" x2="150" y2="170" stroke="#999" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                        <text x="135" y="165" fontSize="11" fill="#999" textAnchor="end" opacity="0.5">Normal I</text>
                        
                        {/* Normal II - perpendicular to Mirror II */}
                        <line x1="320" y1="125" x2="195" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" opacity="0.3" />
                        <text x="185" y="95" fontSize="11" fill="#999" textAnchor="end" opacity="0.5">Normal II</text>
                        
                        {/* Angle markers */}
                        <text x="235" y="230" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">A</text>
                        <text x="300" y="165" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">B</text>
                        <text x="295" y="140" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                        <text x="295" y="110" fontSize="14" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">D</text>
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-4">
                    <li>
                      <strong>Given angles:</strong>
                      <div className="mt-2 ml-4">
                        <p>A = 30° (angle of Mirror I from horizontal)</p>
                        <p>Angle between mirrors at intersection = 100°</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find angle B (the exterior angle):</strong>
                      <div className="mt-2 ml-4">
                        <p>The sum of angles around the intersection point equals 360°:</p>
                        <div className="text-center mt-2">
                          <BlockMath>{'B = 180° - (100° + 30°) = 180° - 130° = 50°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find angle C (angle from the normal to Mirror II):</strong>
                      <div className="mt-2 ml-4">
                        <p>Since B and C are complementary (they form a right angle with the normal):</p>
                        <div className="text-center mt-2">
                          <BlockMath>{'C = 90° - B = 90° - 50° = 40°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find angle D (angle of reflection from Mirror II):</strong>
                      <div className="mt-2 ml-4">
                        <p>By the law of reflection:</p>
                        <div className="text-center mt-2">
                          <BlockMath>{'D = C = 40°'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The angle of reflection for the light ray bouncing off Mirror II is <InlineMath>{'40°'}</InlineMath>
                    </p>
                    
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 3 - Multiple Reflections Between Two Mirrors</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      {/* Reflection of Light Practice Questions */}
      <SlideshowKnowledgeCheck
        course={course}
      onAIAccordionContent={onAIAccordionContent}
        courseId={effectiveCourseId}
        lessonPath="10-reflection-of-light"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_10_angle_of_incidence_basic',
            title: 'Question 1: Basic Law of Reflection'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_10_surface_to_normal_angle',
            title: 'Question 2: Surface vs Normal Angles'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_10_total_angle_between_rays',
            title: 'Question 3: Angle Between Rays'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_10_two_mirrors_scenario_a',
            title: 'Question 4: Two Mirrors - Scenario A'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_10_two_mirrors_scenario_b',
            title: 'Question 5: Two Mirrors - Scenario B'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_10_mirror_image_description',
            title: 'Question 6: Mirror Image Properties'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_10_mirror_time_reading',
            title: 'Question 7: Mirror Time Reading'
          }
        ]}
        onComplete={(score, results) => console.log(`Reflection of Light Knowledge Check completed with ${score}%`)}
        theme="blue"
      />

      <LessonSummary
        points={[
          "The angle of incidence equals the angle of reflection (θᵢ = θᵣ)",
          "Angles are always measured from the normal to the surface",
          "The incident ray, normal, and reflected ray all lie in the same plane",
          "Specular reflection occurs on smooth surfaces with parallel rays reflecting as parallel rays",
          "Diffuse reflection occurs on rough surfaces with rays reflecting in multiple directions"
        ]}
      />
    </LessonContent>
  );
};

export default ReflectionOfLight;
