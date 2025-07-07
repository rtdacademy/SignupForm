import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 5 - Introduction to Light
 * Covers the observable properties of light and its sources
 */
const IntroductionToLight = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  // Animation states
  const [animationTime, setAnimationTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reflectionAnimationTime, setReflectionAnimationTime] = useState(0);
  const [isReflectionPlaying, setIsReflectionPlaying] = useState(false);
  const [romerAnimationTime, setRomerAnimationTime] = useState(0);
  const [isRomerPlaying, setIsRomerPlaying] = useState(false);
  const [michelsonAnimationTime, setMichelsonAnimationTime] = useState(0);
  const [isMichelsonPlaying, setIsMichelsonPlaying] = useState(false);
  
  // Get effective courseId
  const effectiveCourseId = courseId || 
    course?.courseDetails?.courseId || 
    course?.courseId || 
    course?.id || 
    '2';
  
  // Debug logging
  useEffect(() => {
    console.log("🔥 Rendering IntroductionToLight component with:", {
      course,
      courseId: effectiveCourseId,
      currentUser,
      loading,
      error
    });
  }, [course, effectiveCourseId, currentUser, loading, error]);

  useEffect(() => {
    // Simulate loading completion
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  // Animation effect for emission
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setAnimationTime(prev => {
          if (prev >= 100) {
            return 0; // Reset when rays reach the edge
          }
          return prev + 2;
        });
      }, 50); // Smooth animation
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Animation effect for reflection
  useEffect(() => {
    let interval;
    if (isReflectionPlaying) {
      interval = setInterval(() => {
        setReflectionAnimationTime(prev => {
          if (prev >= 100) {
            return 0; // Reset animation
          }
          return prev + 1.5;
        });
      }, 60); // Slightly slower animation
    }
    return () => clearInterval(interval);
  }, [isReflectionPlaying]);

  // Animation effect for Römer's experiment
  useEffect(() => {
    let interval;
    if (isRomerPlaying) {
      interval = setInterval(() => {
        setRomerAnimationTime(prev => {
          if (prev >= 360) {
            return 0; // Reset after full orbit
          }
          return prev + 1;
        });
      }, 80); // Slow animation to see orbital mechanics
    }
    return () => clearInterval(interval);
  }, [isRomerPlaying]);

  // Animation effect for Michelson's experiment
  useEffect(() => {
    let interval;
    if (isMichelsonPlaying) {
      interval = setInterval(() => {
        setMichelsonAnimationTime(prev => {
          if (prev >= 200) {
            return 0; // Reset animation cycle
          }
          return prev + 1;
        });
      }, 50); // Smooth animation for light travel and mirror rotation
    }
    return () => clearInterval(interval);
  }, [isMichelsonPlaying]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LessonContent
      lessonId="lesson_1747281791046_100"
      title="Lesson 5 - Introduction to Light"
      metadata={{ estimated_time: '45 minutes' }}
    >
      {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Sources of Light" 
            value="sources-of-light" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  In the beginning of this unit on Light, we will not concern ourselves with what light is
                  (particle, wave or something else), rather we will begin by working with the observable
                  properties of light.
                </p>
                
                <p className="mb-6">
                  There are two basic ways that we see light:
                </p>
                    <ol className="list-decimal pl-6 space-y-4">
                      <li>
                        <strong>We see light that is emitted from a source of some kind</strong> (i.e. light bulb, Sun, stars,
                        television, etc.). Note that the eye receives only a small part of the light emitted
                        from the source.
                        
                        {/* Light Emission Animation */}
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                          <h4 className="font-semibold text-gray-800 mb-3 text-center">Light Emission from a Source</h4>
                  
                  <div className="flex flex-col items-center">
                    {/* Animation Display */}
                    <div className="relative w-full max-w-md mb-4">
                      <svg width="100%" height="300" viewBox="0 0 400 300" className="border border-gray-400 bg-gray-900 rounded">
                        {/* Central emission point */}
                        <g transform="translate(200, 150)">
                          {/* Central point */}
                          <circle cx="0" cy="0" r="4" fill="#ffeb3b" opacity="0.9" />
                        </g>
                        
                        {/* Light rays emanating from source */}
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, index) => {
                          const radian = (angle * Math.PI) / 180;
                          const startRadius = 30;
                          const currentRadius = startRadius + animationTime;
                          const opacity = Math.max(0, 1 - (animationTime / 100));
                          
                          // Only show rays that haven't reached the edge
                          if (currentRadius > 140) return null;
                          
                          return (
                            <g key={index}>
                              {/* Light ray segment */}
                              <line
                                x1={200 + Math.cos(radian) * startRadius}
                                y1={150 + Math.sin(radian) * startRadius}
                                x2={200 + Math.cos(radian) * currentRadius}
                                y2={150 + Math.sin(radian) * currentRadius}
                                stroke="#ffeb3b"
                                strokeWidth="3"
                                opacity={opacity}
                              />
                              
                              {/* Arrow head at the end of light ray */}
                              <polygon
                                points="0,-4 8,0 0,4"
                                fill="#ffeb3b"
                                opacity={opacity}
                                transform={`
                                  translate(${200 + Math.cos(radian) * currentRadius}, ${150 + Math.sin(radian) * currentRadius})
                                  rotate(${angle})
                                `}
                              />
                            </g>
                          );
                        })}
                        
                        {/* Outer glow effect */}
                        <circle cx="200" cy="150" r="40" fill="none" stroke="#ffeb3b" strokeWidth="2" opacity="0.3" />
                        <circle cx="200" cy="150" r="60" fill="none" stroke="#ffeb3b" strokeWidth="1" opacity="0.2" />
                        <circle cx="200" cy="150" r="80" fill="none" stroke="#ffeb3b" strokeWidth="1" opacity="0.1" />
                        
                        {/* Note about eye receiving small portion */}
                        <g transform="translate(320, 100)">
                          {/* Simple eye icon */}
                          <ellipse cx="0" cy="0" rx="15" ry="10" fill="#fff" stroke="#666" strokeWidth="2" />
                          <circle cx="0" cy="0" r="6" fill="#4a90e2" />
                          <circle cx="0" cy="0" r="3" fill="#000" />
                          
                          {/* Arrow showing small portion of light */}
                          <line x1="-50" y1="-20" x2="-20" y2="-5" stroke="#ffeb3b" strokeWidth="2" opacity="0.8" />
                          <polygon points="-20,-5 -25,-8 -25,-2" fill="#ffeb3b" opacity="0.8" />
                        </g>
                        
                        <text x="320" y="130" fontSize="11" fill="#ccc" textAnchor="middle">
                          Eye receives only
                        </text>
                        <text x="320" y="145" fontSize="11" fill="#ccc" textAnchor="middle">
                          a small portion
                        </text>

                        {/* Labels */}
                        <text x="200" y="220" fontSize="14" fill="#fff" textAnchor="middle" fontWeight="bold">
                          Light Source
                        </text>
                        <text x="200" y="240" fontSize="12" fill="#ccc" textAnchor="middle">
                          (emitting light in all directions)
                        </text>
                        
                      </svg>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {isPlaying ? 'Pause' : 'Play'} Animation
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-3 text-center max-w-md">
                      This animation shows light being emitted from a source (light bulb) in all directions. 
                      Notice how the eye only receives a small portion of the total light emitted.
                    </p>
                  </div>
                </div>
                      </li>
                      <li>
                        <strong>We also see light that is reflected from an object of some kind</strong> (i.e. pencil, paper,
                        etc.). Note that the eye receives only a small part of the light reflected by the
                        object.
                        
                        {/* Light Reflection Animation */}
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                          <h4 className="font-semibold text-gray-800 mb-3 text-center">Light Reflection from an Object</h4>
                          
                          <div className="flex flex-col items-center">
                            {/* Animation Display */}
                            <div className="relative w-full max-w-lg mb-4">
                              <svg width="100%" height="300" viewBox="0 0 500 300" className="border border-gray-400 bg-gray-900 rounded">
                                {/* Light source bottom left */}
                                <g transform="translate(120, 220)">
                                  {/* Simple light source */}
                                  <circle cx="0" cy="0" r="15" fill="#fff8dc" stroke="#ddd" strokeWidth="2" opacity="0.9" />
                                  <circle cx="0" cy="0" r="8" fill="#ffeb3b" opacity="0.8" />
                                  <circle cx="0" cy="0" r="4" fill="#fff" opacity="0.9" />
                                </g>
                                
                                {/* Object on top (paper) */}
                                <g transform="translate(250, 80)">
                                  {/* Paper/book object */}
                                  <rect x="-30" y="-40" width="60" height="80" fill="#f0f0f0" stroke="#ccc" strokeWidth="2" />
                                  <rect x="-28" y="-38" width="56" height="76" fill="#fff" />
                                  {/* Lines on paper */}
                                  <line x1="-20" y1="-25" x2="20" y2="-25" stroke="#ddd" strokeWidth="1" />
                                  <line x1="-20" y1="-10" x2="20" y2="-10" stroke="#ddd" strokeWidth="1" />
                                  <line x1="-20" y1="5" x2="20" y2="5" stroke="#ddd" strokeWidth="1" />
                                  <line x1="-20" y1="20" x2="20" y2="20" stroke="#ddd" strokeWidth="1" />
                                </g>
                                
                                {/* Eye bottom right */}
                                <g transform="translate(380, 220)">
                                  {/* Simple eye icon */}
                                  <ellipse cx="0" cy="0" rx="15" ry="10" fill="#fff" stroke="#666" strokeWidth="2" />
                                  <circle cx="0" cy="0" r="6" fill="#4a90e2" />
                                  <circle cx="0" cy="0" r="3" fill="#000" />
                                </g>
                                
                                {/* Incident light rays from source to object */}
                                {reflectionAnimationTime < 40 && (
                                  <g>
                                    {[0, 10, -10].map((offset, index) => {
                                      const progress = Math.min(reflectionAnimationTime / 40, 1);
                                      const startX = 135; // From light source bottom left
                                      const startY = 205 + offset; // Adjust for new position
                                      const endX = 235; // To paper on top
                                      const endY = 120 + offset * 0.3; // Adjust for new position
                                      const currentX = startX + (endX - startX) * progress;
                                      const currentY = startY + (endY - startY) * progress;
                                      
                                      return (
                                        <g key={`incident-${index}`}>
                                          <line
                                            x1={startX}
                                            y1={startY}
                                            x2={currentX}
                                            y2={currentY}
                                            stroke="#ffeb3b"
                                            strokeWidth="3"
                                            opacity="0.8"
                                          />
                                          <polygon
                                            points="0,-3 6,0 0,3"
                                            fill="#ffeb3b"
                                            opacity="0.8"
                                            transform={`translate(${currentX}, ${currentY}) rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI})`}
                                          />
                                        </g>
                                      );
                                    })}
                                  </g>
                                )}
                                
                                {/* Reflected light rays from object to eye and other directions */}
                                {reflectionAnimationTime >= 35 && (
                                  <g>
                                    {[
                                      { angle: 120, toEye: true, startDelay: 35 }, // To eye bottom right
                                      { angle: 45, toEye: false, startDelay: 40 },
                                      { angle: 90, toEye: false, startDelay: 45 },
                                      { angle: 150, toEye: false, startDelay: 50 },
                                      { angle: 180, toEye: false, startDelay: 55 }
                                    ].map((ray, index) => {
                                      if (reflectionAnimationTime < ray.startDelay) return null;
                                      
                                      const progress = Math.min((reflectionAnimationTime - ray.startDelay) / 30, 1);
                                      const radian = (ray.angle * Math.PI) / 180;
                                      const startX = 250; // From paper position
                                      const startY = 80; // From paper position
                                      
                                      let endX, endY;
                                      if (ray.toEye) {
                                        endX = 365; // To eye bottom right
                                        endY = 210;
                                      } else {
                                        endX = startX + Math.cos(radian) * 80;
                                        endY = startY + Math.sin(radian) * 80;
                                      }
                                      
                                      const currentX = startX + (endX - startX) * progress;
                                      const currentY = startY + (endY - startY) * progress;
                                      const opacity = ray.toEye ? 0.9 : 0.6;
                                      const strokeWidth = ray.toEye ? 4 : 2;
                                      const color = ray.toEye ? "#00ff00" : "#ffeb3b";
                                      
                                      return (
                                        <g key={`reflected-${index}`}>
                                          <line
                                            x1={startX}
                                            y1={startY}
                                            x2={currentX}
                                            y2={currentY}
                                            stroke={color}
                                            strokeWidth={strokeWidth}
                                            opacity={opacity}
                                          />
                                          <polygon
                                            points="0,-3 6,0 0,3"
                                            fill={color}
                                            opacity={opacity}
                                            transform={`translate(${currentX}, ${currentY}) rotate(${Math.atan2(endY - startY, endX - startX) * 180 / Math.PI})`}
                                          />
                                        </g>
                                      );
                                    })}
                                  </g>
                                )}
                                
                                {/* Labels */}
                                <text x="120" y="250" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="bold">
                                  Light Source
                                </text>
                                <text x="250" y="25" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="bold">
                                  Object (Paper)
                                </text>
                                <text x="380" y="250" fontSize="12" fill="#fff" textAnchor="middle" fontWeight="bold">
                                  Eye
                                </text>
                                
                                {/* Process labels */}
                                {reflectionAnimationTime < 40 && (
                                  <text x="190" y="160" fontSize="11" fill="#ffeb3b" textAnchor="middle" fontWeight="bold">
                                    Incident Light
                                  </text>
                                )}
                                
                                {reflectionAnimationTime >= 35 && (
                                  <g>
                                    <text x="350" y="150" fontSize="11" fill="#00ff00" textAnchor="middle" fontWeight="bold">
                                      Light to Eye
                                    </text>
                                    <text x="250" y="140" fontSize="11" fill="#ffeb3b" textAnchor="middle">
                                      Reflected Light
                                    </text>
                                    <text x="250" y="155" fontSize="10" fill="#ccc" textAnchor="middle">
                                      (in all directions)
                                    </text>
                                  </g>
                                )}
                              </svg>
                            </div>
                            
                            {/* Controls */}
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={() => setIsReflectionPlaying(!isReflectionPlaying)}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                              >
                                {isReflectionPlaying ? 'Pause' : 'Play'} Animation
                              </button>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-3 text-center max-w-md">
                              This animation shows light from a source hitting an object (paper) and being reflected 
                              in all directions. The eye only receives a small portion of the reflected light.
                            </p>
                          </div>
                        </div>
                      </li>
                    </ol>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Sources of Light</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Basic Properties of Light Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Basic Properties of Light" 
            value="basic-properties-of-light" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">The basic properties of light are:</p>
                
                <ol className="list-decimal pl-6 space-y-4">
                  <li>
                    <strong>Light travels in straight lines.</strong> This is also referred to as rectilinear
                    propagation. The evidence for this is that light creates shadows and it does
                    not appear to bend around corners.
                  </li>
                  <li>
                    <strong>Light rays obey the laws of geometry.</strong> By using straight lines and by
                    constructing similar triangles, we can solve many problems.
                  </li>
                  <li>
                    <strong>Light has a constant speed in a given medium.</strong> In vacuum or in air, light
                    has a speed of <InlineMath math="3.00 \times 10^8" /> m/s. In water, the speed of light is <InlineMath math="2.26 \times 10^8" /> m/s.
                  </li>
                </ol>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Basic Properties of Light</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 1 Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Example 1 - Similar Triangles" 
            value="example-1-similar-triangles" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If a metre stick casts a shadow that is 1.5 m long and a tree's shadow at the same time
                  is 18 m long, how tall is the tree?
                </p>

                {/* Similar Triangles Diagram */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Similar Triangles Diagram</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl mb-4">
                      <svg width="100%" height="350" viewBox="0 0 600 350" className="border border-gray-400 bg-sky-100 rounded">
                        {/* Ground line */}
                        <line x1="50" y1="320" x2="550" y2="320" stroke="#8B4513" strokeWidth="4" />
                        <text x="300" y="340" fontSize="12" fill="#666" textAnchor="middle">Ground</text>
                        
                        {/* Sun position indicator */}
                        <circle cx="180" cy="20" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
                        <text x="180" y="55" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Sun</text>
                        
                        {/* Single sun ray touching the top of tree and metre stick */}
                        {/* Tree top is at (300, 140), Metre stick top is at (420, 260) */}
                        {/* Calculate the line that passes through both points */}
                        {/* Slope = (260-140)/(420-300) = 120/120 = 1 */}
                        {/* Line equation through tree top: y - 140 = 1(x - 300), so y = x - 160 */}
                        {/* Start ray at sun height (y=20) and end at shadow tip */}
                        {/* At y=20: x = 20 + 160 = 180 */}
                        <line x1="180" y1="20" x2="480" y2="320" stroke="#FFD700" strokeWidth="3" opacity="0.8" />
                        
                        {/* Arrow at the end of the ray */}
                        <polygon points="475,315 480,320 475,325" fill="#FFD700" opacity="0.8" />
                        
                        {/* Tree (centered) */}
                        <g>
                          {/* Tree trunk */}
                          <rect x="295" y="170" width="10" height="150" fill="#8B4513" />
                          
                          {/* Tree foliage */}
                          <circle cx="300" cy="170" r="25" fill="#228B22" />
                          <circle cx="290" cy="150" r="20" fill="#32CD32" />
                          <circle cx="310" cy="155" r="22" fill="#90EE90" />
                          
                          <text x="300" y="130" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Tree</text>
                          
                          {/* Tree shadow */}
                          <line x1="300" y1="320" x2="480" y2="320" stroke="#666" strokeWidth="3" />
                          
                          {/* Large triangle outline */}
                          <polygon points="300,140 300,320 480,320" fill="none" stroke="#4ECDC4" strokeWidth="2" strokeDasharray="5,5" />
                          
                          {/* Measurements for tree */}
                          <text x="270" y="230" fontSize="11" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">x</text>
                          <text x="390" y="335" fontSize="11" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">18 m</text>
                        </g>
                        
                        {/* Metre stick (positioned on right side, inside large triangle - enlarged for visibility) */}
                        <g>
                          {/* Making the metre stick larger for visibility while maintaining the concept */}
                          {/* Position it further left to make it more visible */}
                          {/* Using x=420 for better visibility and longer shadow */}
                          
                          {/* Calculate where diagonal intersects at x=420 */}
                          {/* Diagonal goes from (300,140) to (480,320) */}
                          {/* At x=420: y = 140 + (320-140) * (420-300)/(480-300) = 140 + 180 * 120/180 = 140 + 120 = 260 */}
                          
                          <line x1="420" y1="260" x2="420" y2="320" stroke="#8B4513" strokeWidth="6" />
                          <text x="420" y="245" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Metre Stick</text>
                          
                          {/* Stick shadow - longer for visibility */}
                          <line x1="420" y1="320" x2="480" y2="320" stroke="#666" strokeWidth="4" />
                          
                          {/* Small triangle outline (inside the large triangle) - larger for visibility */}
                          <polygon points="420,260 420,320 480,320" fill="none" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="5,5" />
                          
                          {/* Measurements for stick */}
                          <text x="395" y="290" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">1.0 m</text>
                          <text x="450" y="335" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">1.5 m</text>
                        </g>
                        
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Metre stick height: <InlineMath>{'1.0\\text{ m}'}</InlineMath></p>
                        <p>Metre stick shadow length: <InlineMath>{'1.5\\text{ m}'}</InlineMath></p>
                        <p>Tree shadow length: <InlineMath>{'18\\text{ m}'}</InlineMath></p>
                        <p>Find: Tree height (<InlineMath>{'x'}</InlineMath>)</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Identify similar triangles:</strong>
                      <div className="mt-2 ml-4">
                        <p>Small triangle: sides of 1.0 m and 1.5 m</p>
                        <p>Large triangle: sides of x and 18 m</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Set up proportion:</strong>
                      <div className="text-center mt-2">
                        <BlockMath>{'\\frac{1.0\\text{ m}}{1.5\\text{ m}} = \\frac{x}{18\\text{ m}}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Solve for x:</strong>
                      <div className="mt-2 ml-4">
                        <div className="text-center">
                          <BlockMath>{'x = \\frac{1.0\\text{ m} \\times 18\\text{ m}}{1.5\\text{ m}}'}</BlockMath>
                        </div>
                        <div className="text-center">
                          <BlockMath>{'x = 12\\text{ m}'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The tree is <InlineMath>{'12\\text{ m}'}</InlineMath> tall.
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 1 - Similar Triangles</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 2 Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Example 2 - Pinhole Camera" 
            value="example-2-pinhole-camera" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A pinhole camera is made from a black box where a small pin-sized hole is made at one
                  end. Light rays from an object or light source travel through the pinhole to form an
                  image on the other side of the box.
                </p>
                <p className="mb-4">
                  If a pin hole camera is used to photograph a 1.5 m tall boy located 10 m from the
                  camera and the camera is 0.10 m long, what is the size of the image formed on the
                  film? What is the orientation of the image?
                </p>

                {/* Pinhole Camera Diagram */}
                <div className="mb-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Pinhole Camera Diagram</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-4xl mb-4">
                      <svg width="100%" height="400" viewBox="0 0 800 400" className="border border-gray-400 bg-white rounded">
                        {/* Ground line */}
                        <line x1="67" y1="333" x2="733" y2="333" stroke="#8B4513" strokeWidth="3" />
                        
                        {/* Boy (object) on the left */}
                        <g>
                          {/* Boy figure */}
                          <line x1="107" y1="253" x2="107" y2="333" stroke="#333" strokeWidth="5" />
                          <circle cx="107" cy="240" r="13" fill="#FFD1A9" stroke="#333" strokeWidth="2" />
                          <text x="107" y="180" fontSize="16" fill="#333" textAnchor="middle" fontWeight="bold">Boy</text>
                          <text x="107" y="200" fontSize="14" fill="#333" textAnchor="middle">1.5 m tall</text>
                          
                          {/* Height measurement */}
                          <line x1="80" y1="253" x2="80" y2="333" stroke="#FF6B6B" strokeWidth="3" />
                          <text x="60" y="293" fontSize="14" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">1.5 m</text>
                        </g>
                        
                        {/* Distance measurement */}
                        <line x1="107" y1="360" x2="400" y2="360" stroke="#666" strokeWidth="3" />
                        <text x="253" y="380" fontSize="14" fill="#666" textAnchor="middle" fontWeight="bold">10 m</text>
                        
                        {/* Pinhole camera */}
                        <g>
                          {/* Camera box */}
                          <rect x="400" y="267" width="80" height="53" fill="#333" stroke="#000" strokeWidth="3" />
                          <text x="440" y="253" fontSize="16" fill="#333" textAnchor="middle" fontWeight="bold">Pinhole Camera</text>
                          
                          {/* Pinhole */}
                          <circle cx="400" cy="293" r="3" fill="#FFF" />
                          <text x="373" y="313" fontSize="13" fill="#333" textAnchor="middle">Pinhole</text>
                          
                          {/* Camera length measurement */}
                          <line x1="400" y1="347" x2="480" y2="347" stroke="#4ECDC4" strokeWidth="3" />
                          <text x="440" y="367" fontSize="14" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">0.10 m</text>
                          
                          {/* Film label */}
                          <text x="500" y="280" fontSize="13" fill="#FFA500" textAnchor="start">Film</text>
                          
                          {/* Image on film (inverted) */}
                          <line x1="477" y1="283" x2="477" y2="304" stroke="#FF6B6B" strokeWidth="4" />
                          {/* Small circle for inverted head at bottom of image */}
                          <circle cx="475" cy="304" r="5" fill="#FFD1A9" stroke="#FF6B6B" strokeWidth="2" />
                          <text x="500" y="313" fontSize="13" fill="#FF6B6B" textAnchor="start">x (inverted)</text>
                        </g>
                        
                        {/* Light rays from top and bottom of boy through pinhole */}
                        {/* Ray from top of boy through pinhole - continuing with same slope */}
                        {/* Slope from boy top to pinhole: (293-253)/(400-107) = 40/293 = 0.136 */}
                        {/* Continue from pinhole (400,293) to film with same slope */}
                        {/* At x=477: y = 293 + 0.136*(477-400) = 293 + 10.5 = 303.5 ≈ 304 */}
                        <line x1="107" y1="253" x2="400" y2="293" stroke="#FFD700" strokeWidth="3" opacity="0.8" />
                        <line x1="400" y1="293" x2="477" y2="304" stroke="#FFD700" strokeWidth="3" opacity="0.8" />
                        
                        {/* Ray from bottom of boy through pinhole - continuing with same slope */}
                        {/* Slope from boy bottom to pinhole: (293-333)/(400-107) = -40/293 = -0.136 */}
                        {/* Continue from pinhole (400,293) to film with same slope */}
                        {/* At x=477: y = 293 + (-0.136)*(477-400) = 293 - 10.5 = 282.5 ≈ 283 */}
                        <line x1="107" y1="333" x2="400" y2="293" stroke="#FFD700" strokeWidth="3" opacity="0.8" />
                        <line x1="400" y1="293" x2="477" y2="283" stroke="#FFD700" strokeWidth="3" opacity="0.8" />
                        
                        {/* Triangle outlines */}
                        {/* Large triangle (boy and distance) */}
                        <polygon points="107,253 107,333 400,293" fill="none" stroke="#4ECDC4" strokeWidth="3" strokeDasharray="7,7" />
                        
                        {/* Small triangle (image and camera length) */}
                        <polygon points="477,283 477,304 400,293" fill="none" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="7,7" />
                        
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Boy height: <InlineMath>{'1.5\\text{ m}'}</InlineMath></p>
                        <p>Distance to camera: <InlineMath>{'10\\text{ m}'}</InlineMath></p>
                        <p>Camera length: <InlineMath>{'0.10\\text{ m}'}</InlineMath></p>
                        <p>Find: Image size (<InlineMath>{'x'}</InlineMath>) and orientation</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Identify similar triangles:</strong>
                      <div className="mt-2 ml-4">
                        <p>Large triangle: boy (1.5 m) and distance to pinhole (10 m)</p>
                        <p>Small triangle: image (x) and camera length (0.10 m)</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Set up proportion:</strong>
                      <div className="text-center mt-2">
                        <BlockMath>{'\\frac{1.5\\text{ m}}{10\\text{ m}} = \\frac{x}{0.10\\text{ m}}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Solve for x:</strong>
                      <div className="mt-2 ml-4">
                        <div className="text-center">
                          <BlockMath>{'x = \\frac{1.5\\text{ m} \\times 0.10\\text{ m}}{10\\text{ m}}'}</BlockMath>
                        </div>
                        <div className="text-center">
                          <BlockMath>{'x = 0.015\\text{ m}'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-4 mb-3">
                    <strong>Image orientation:</strong> The image is inverted because the light rays cross at the pinhole.
                  </p>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The image size is <InlineMath>{'0.015\\text{ m}'}</InlineMath> (1.5 cm) and the image is inverted.
                    </p>
                    
                    <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> Of the millions of rays which pass from the boy into the camera, it is only the
                        ones from the bottom and the top of the object that are required to define where and
                        what size the image will be.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 2 - Pinhole Camera</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Pinhole Camera Practice Problems */}
        <div className="mb-6">
          <SlideshowKnowledgeCheck
          onAIAccordionContent={onAIAccordionContent} 
            courseId={effectiveCourseId}
            lessonPath="09-introduction-to-light"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_09_pinhole_distance_calculation',
                title: 'Question 1: Pinhole Camera Distance Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_building_height_calculation',
                title: 'Question 2: Building Height Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_shadow_size_calculation',
                title: 'Question 3: Shadow Size Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_shadow_area_calculation',
                title: 'Question 4: Shadow Area Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_fence_shadow_calculation',
                title: 'Question 5: Fence Shadow Length Calculation'
              }
            ]}
            theme="indigo"
          />
        </div>

        {/* Speed of Light Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="The Speed of Light" 
            value="the-speed-of-light" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4 text-sm text-gray-600">
                  <em>Refer to Pearson pages 648 to 652.</em>
                </p>

                <h4 className="font-semibold text-gray-800 mb-3">Galileo's Attempt</h4>
                <p className="mb-4">
                  Galileo tried to measure the speed of light by measuring the time required for light to
                  travel a known distance between two hilltops. He had an assistant stand on one hilltop
                  and himself on the other and ordered the assistant to lift the shutter on his lantern when
                  he saw a flash from Galileo's lantern. Galileo intended to measure the time between
                  the flash and when he received the signal back from the assistant. The time was so
                  short that Galileo realised that the reaction time was far greater than the actual time for
                  the light to move across the distance. He concluded that the speed of light was
                  extremely fast, if not instantaneous.
                </p>

                <h4 className="font-semibold text-gray-800 mb-3">Römer's Breakthrough</h4>
                <p className="mb-4">
                  The first successful determination of the speed of light began with an observation by the
                  Danish astronomer Ole Römer (1644–1710). Römer noted that the period of one of
                  Jupiter's moons (Io) varied slightly depending on the relative motion of the Earth and
                  Jupiter. When the Earth was moving away from Jupiter the period was slightly longer,
                  and when Earth moved toward Jupiter the period was slightly shorter. The Dutch
                  scientist Christian Huygens (1629–1695) was intrigued by Römer's result. Huygens
                  reasoned that if they measured when Io appeared from behind Jupiter for different
                  positions of the Earth relative to Jupiter, there should be a time difference.
                </p>

                <p className="mb-4">
                  When the Earth was furthest away from Jupiter Io should appear later than expected.
                  Their measurements confirmed that this was indeed the case and the calculation
                </p>

                {/* Römer's Experiment Animation */}
                <div className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Römer's Observation of Io's Orbit</h4>
                  
                  <div className="flex flex-col items-center">
                    {/* Animation Display */}
                    <div className="relative w-full max-w-4xl mb-4">
                      <svg width="100%" height="400" viewBox="0 0 800 400" className="border border-gray-400 bg-black rounded">
                        
                        {/* Sun at center */}
                        <g transform="translate(400, 200)">
                          <circle cx="0" cy="0" r="20" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
                          <circle cx="0" cy="0" r="15" fill="#FFEB3B" opacity="0.8" />
                          <circle cx="0" cy="0" r="10" fill="#FFF" opacity="0.9" />
                          <text x="0" y="35" fontSize="14" fill="#FFF" textAnchor="middle" fontWeight="bold">Sun</text>
                        </g>
                        
                        {/* Earth's orbit (circular path) */}
                        <circle cx="400" cy="200" r="120" fill="none" stroke="#4A90E2" strokeWidth="2" strokeDasharray="5,5" opacity="0.6" />
                        
                        {/* Earth moving in orbit */}
                        <g>
                          {(() => {
                            const earthAngle = (romerAnimationTime * Math.PI) / 180;
                            const earthX = 400 + 120 * Math.cos(earthAngle);
                            const earthY = 200 + 120 * Math.sin(earthAngle);
                            return (
                              <g transform={`translate(${earthX}, ${earthY})`}>
                                <circle cx="0" cy="0" r="8" fill="#4A90E2" stroke="#2E7BD6" strokeWidth="2" />
                                <circle cx="0" cy="0" r="5" fill="#90CAF9" opacity="0.8" />
                                <text x="0" y="-20" fontSize="12" fill="#FFF" textAnchor="middle" fontWeight="bold">Earth</text>
                              </g>
                            );
                          })()}
                        </g>
                        
                        {/* Jupiter at fixed position (upper right) */}
                        <g transform="translate(580, 100)">
                          <circle cx="0" cy="0" r="15" fill="#D4A574" stroke="#B8956A" strokeWidth="2" />
                          <circle cx="0" cy="0" r="10" fill="#E4B584" opacity="0.8" />
                          <text x="0" y="35" fontSize="14" fill="#FFF" textAnchor="middle" fontWeight="bold">Jupiter</text>
                          
                          {/* Io's orbit around Jupiter */}
                          <circle cx="0" cy="0" r="25" fill="none" stroke="#FFA726" strokeWidth="1" strokeDasharray="3,3" opacity="0.8" />
                          
                          {/* Io moon orbiting Jupiter (faster orbit) */}
                          {(() => {
                            const ioAngle = (romerAnimationTime * 8 * Math.PI) / 180; // 8x faster than Earth
                            const ioX = 25 * Math.cos(ioAngle);
                            const ioY = 25 * Math.sin(ioAngle);
                            return (
                              <g transform={`translate(${ioX}, ${ioY})`}>
                                <circle cx="0" cy="0" r="3" fill="#FFA726" stroke="#FF9800" strokeWidth="1" />
                                <text x="0" y="-12" fontSize="10" fill="#FFF" textAnchor="middle">Io</text>
                              </g>
                            );
                          })()}
                        </g>
                        
                        {/* Distance indicators */}
                        {(() => {
                          const earthAngle = (romerAnimationTime * Math.PI) / 180;
                          const earthX = 400 + 120 * Math.cos(earthAngle);
                          const earthY = 200 + 120 * Math.sin(earthAngle);
                          const jupiterX = 580;
                          const jupiterY = 100;
                          
                          // Calculate distance from Earth to Jupiter
                          const distance = Math.sqrt((jupiterX - earthX) ** 2 + (jupiterY - earthY) ** 2);
                          
                          // Show closest and furthest positions
                          const isClosest = romerAnimationTime >= 300 && romerAnimationTime <= 360;
                          const isFurthest = romerAnimationTime >= 120 && romerAnimationTime <= 180;
                          
                          return (
                            <g>
                              {/* Distance line */}
                              <line 
                                x1={earthX} 
                                y1={earthY} 
                                x2={jupiterX} 
                                y2={jupiterY} 
                                stroke="#FF6B6B" 
                                strokeWidth="2" 
                                opacity="0.6"
                                strokeDasharray="3,3"
                              />
                              
                              {/* Distance labels */}
                              {isClosest && (
                                <g>
                                  <text x="400" y="350" fontSize="14" fill="#00FF00" textAnchor="middle" fontWeight="bold">
                                    CLOSEST: Earth closest to Jupiter
                                  </text>
                                  <text x="400" y="370" fontSize="12" fill="#00FF00" textAnchor="middle">
                                    Light from Io arrives EARLIER than expected
                                  </text>
                                </g>
                              )}
                              
                              {isFurthest && (
                                <g>
                                  <text x="400" y="350" fontSize="14" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">
                                    FURTHEST: Earth furthest from Jupiter
                                  </text>
                                  <text x="400" y="370" fontSize="12" fill="#FF6B6B" textAnchor="middle">
                                    Light from Io arrives LATER than expected
                                  </text>
                                </g>
                              )}
                              
                              {/* Show diameter difference */}
                              {(isClosest || isFurthest) && (
                                <g>
                                  <text x="400" y="390" fontSize="12" fill="#FFA726" textAnchor="middle">
                                    Distance difference = 2 × Earth's orbital radius
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        })()}
                        
                        {/* Light rays from Io to Earth (when visible) */}
                        {(() => {
                          const earthAngle = (romerAnimationTime * Math.PI) / 180;
                          const earthX = 400 + 120 * Math.cos(earthAngle);
                          const earthY = 200 + 120 * Math.sin(earthAngle);
                          const ioAngle = (romerAnimationTime * 8 * Math.PI) / 180;
                          const ioX = 580 + 25 * Math.cos(ioAngle);
                          const ioY = 100 + 25 * Math.sin(ioAngle);
                          
                          // Show light ray when Io is visible (not behind Jupiter)
                          const ioVisible = Math.cos(ioAngle) > -0.5; // Approximate visibility
                          
                          if (ioVisible) {
                            return (
                              <line 
                                x1={ioX} 
                                y1={ioY} 
                                x2={earthX} 
                                y2={earthY} 
                                stroke="#FFEB3B" 
                                strokeWidth="2" 
                                opacity="0.7"
                              />
                            );
                          }
                          return null;
                        })()}
                        
                        {/* Title and legend */}
                        <text x="400" y="30" fontSize="16" fill="#FFF" textAnchor="middle" fontWeight="bold">
                          Römer's Observation: Earth's Position Affects Io's Apparent Period
                        </text>
                        <text x="400" y="50" fontSize="12" fill="#CCC" textAnchor="middle">
                          Light takes longer to travel when Earth is further from Jupiter
                        </text>
                        
                      </svg>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => setIsRomerPlaying(!isRomerPlaying)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                      >
                        {isRomerPlaying ? 'Pause' : 'Play'} Animation
                      </button>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-3 text-center max-w-2xl">
                      This animation shows Earth orbiting the Sun while observing Jupiter's moon Io. 
                      When Earth is closest to Jupiter, light from Io has less distance to travel. 
                      When Earth is furthest, light takes longer, making Io appear to have a longer period.
                    </p>
                  </div>
                </div>

                <div className="text-center my-4">
                  <BlockMath>{'\\text{speed of light} = \\frac{\\text{distance difference}}{\\text{time difference}}'}</BlockMath>
                </div>

                <p className="mb-4">
                  yielded the result that the speed of light was very fast.
                </p>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">The Speed of Light</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 3 Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Example 3 - Römer's Calculation" 
            value="example-3-romer-calculation" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  In an early measurement Römer measured a 1250 s time difference. If the Earth's
                  mean radius of orbit is <InlineMath>{'1.49 \\times 10^{11}\\text{ m}'}</InlineMath>, what is the speed of light that Römer measured?
                </p>

                <p className="mb-4">
                  Referring to the diagram and discussion above:
                </p>

                <div className="text-center my-4">
                  <BlockMath>{'\\text{speed of light} = \\frac{\\text{distance difference}}{\\text{time difference}}'}</BlockMath>
                </div>

                {/* Simple diagram showing the concept */}
                <div className="my-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <svg width="100%" height="200" viewBox="0 0 600 200" className="border border-gray-300 bg-white rounded mb-4">
                      {/* Jupiter on right */}
                      <g transform="translate(500, 100)">
                        <circle cx="0" cy="0" r="12" fill="#D4A574" stroke="#B8956A" strokeWidth="2" />
                        <text x="0" y="25" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Jupiter</text>
                        {/* Io's orbit */}
                        <circle cx="0" cy="0" r="20" fill="none" stroke="#FFA726" strokeWidth="1" strokeDasharray="2,2" />
                        <text x="0" y="-35" fontSize="10" fill="#333" textAnchor="middle">Io's orbit</text>
                      </g>
                      
                      {/* Earth closest position */}
                      <g transform="translate(200, 100)">
                        <circle cx="0" cy="0" r="8" fill="#4A90E2" stroke="#2E7BD6" strokeWidth="2" />
                        <text x="0" y="25" fontSize="11" fill="#333" textAnchor="middle" fontWeight="bold">Earth closest</text>
                        <text x="0" y="40" fontSize="11" fill="#333" textAnchor="middle">to Jupiter</text>
                      </g>
                      
                      {/* Earth furthest position */}
                      <g transform="translate(100, 100)">
                        <circle cx="0" cy="0" r="8" fill="#4A90E2" stroke="#2E7BD6" strokeWidth="2" />
                        <text x="0" y="25" fontSize="11" fill="#333" textAnchor="middle" fontWeight="bold">Earth furthest</text>
                        <text x="0" y="40" fontSize="11" fill="#333" textAnchor="middle">from Jupiter</text>
                      </g>
                      
                      {/* Distance difference arrow */}
                      <g>
                        <line x1="100" y1="70" x2="200" y2="70" stroke="#FF6B6B" strokeWidth="3" />
                        <polygon points="195,65 200,70 195,75" fill="#FF6B6B" />
                        <polygon points="105,65 100,70 105,75" fill="#FF6B6B" />
                        <text x="150" y="60" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">
                          Distance difference = 2 × radius of Earth orbit
                        </text>
                      </g>
                    </svg>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given:</strong>
                      <div className="mt-2 ml-4">
                        <p>Time difference: <InlineMath>{'1250\\text{ s}'}</InlineMath></p>
                        <p>Earth's orbital radius: <InlineMath>{'1.49 \\times 10^{11}\\text{ m}'}</InlineMath></p>
                        <p>Find: Speed of light (<InlineMath>{'v'}</InlineMath>)</p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Distance difference:</strong>
                      <div className="mt-2 ml-4">
                        <p>Distance difference = <InlineMath>{'2 \\times \\text{radius of Earth orbit}'}</InlineMath></p>
                        <div className="text-center mt-2">
                          <BlockMath>{'\\text{Distance difference} = 2 \\times 1.49 \\times 10^{11}\\text{ m}'}</BlockMath>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply the formula:</strong>
                      <div className="text-center mt-2">
                        <BlockMath>{'v = \\frac{\\text{distance difference}}{\\text{time difference}}'}</BlockMath>
                      </div>
                      <div className="text-center mt-2">
                        <BlockMath>{'v = \\frac{2 \\times 1.49 \\times 10^{11}\\text{ m}}{1250\\text{ s}}'}</BlockMath>
                      </div>
                      <div className="text-center mt-2">
                        <BlockMath>{'v = 2.38 \\times 10^8\\text{ m/s}'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      Römer measured the speed of light to be <InlineMath>{'2.38 \\times 10^8\\text{ m/s}'}</InlineMath>.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This was remarkably close to the modern accepted value of <InlineMath>{'3.00 \\times 10^8\\text{ m/s}'}</InlineMath>!
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 3 - Römer's Calculation</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Michelson's Method Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Michelson's Rotating Mirror Method" 
            value="michelson-rotating-mirror-method" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                  Since Römer's day a number of techniques have been used to measure the speed of
                  light. Among the most important were those carried out by Albert A. Michelson (1852–
                  1931). Michelson used a rotating mirror apparatus like the one diagrammed below for a
                  series of high-precision experiments carried out from 1880 to the 1920's.
                </p>

                <p className="mb-4">
                  Light from a source was directed at one face of a rotating eight-sided mirror. The reflected light
                  travelled to a stationary mirror a large distance away and back again as shown. As the
                  light travelled away and back, the eight-sided mirror rotated. If the rotating mirror was
                  turning at just the right rate the returning beam of light would reflect from one of the
                  mirror faces into a small telescope through which the observer looked.
                </p>

                {/* Michelson's Method Video */}
                <div className="my-6 flex justify-center">
                  <div className="relative w-full max-w-4xl">
                    <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg">
                      <iframe 
                        className="absolute top-0 left-0 w-full h-full"
                        src="https://www.youtube.com/embed/NxAwkraCaf8?si=i-PadfDL4nJ-uCyY" 
                        title="YouTube video player" 
                        frameBorder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                        referrerPolicy="strict-origin-when-cross-origin" 
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>

                <p className="mb-4">
                  This only occurred if the mirror was turning at exactly the right rate. In this manner, the rotating
                  mirror acted as a time piece. By knowing the frequency of rotation and the two way
                  distance travelled by the light, one can calculate a very accurate value for the speed of
                  light.
                </p>

                <div className="bg-white p-4 rounded border border-gray-100 mt-4">
                  <h5 className="font-semibold text-gray-800 mb-3">Key Principle:</h5>
                  <p className="mb-3">
                    The rotating mirror must turn through exactly <sup>1</sup>⁄<sub>8</sub> of a revolution (45°) 
                    during the time it takes light to travel to the distant mirror and back.
                  </p>
                  <div className="text-center">
                    <BlockMath>{'\\text{Speed of light} = \\frac{2d}{t} = \\frac{2d \\times f}{1/8} = 16df'}</BlockMath>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    where d = distance, f = rotation frequency, t = time for light round trip
                  </p>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Michelson's Rotating Mirror Method</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 4 Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Example 4 - Michelson's Calculation" 
            value="example-4-michelson-calculation" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  In a Michelson-type experiment, a rotating eight-sided mirror was placed 50.0 km from
                  the reflecting mirror as diagrammed below. The observer found that in order to observe
                  the return light ray, the mirror had to rotate at 375 Hz. What is the speed of light
                  calculated from this experiment?
                </p>

                {/* Experiment Setup Diagram */}
                <div className="my-6 p-4 bg-gray-100 rounded-lg border border-gray-200">
                  <div className="flex flex-col items-center">
                    <svg width="100%" height="200" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded mb-4">
                      {/* Mountains in background */}
                      <g>
                        {/* Mt. Wilson */}
                        <polygon points="50,120 100,80 150,120" fill="#8B7355" stroke="#654321" strokeWidth="1" />
                        <text x="100" y="140" fontSize="11" fill="#333" textAnchor="middle" fontWeight="bold">Mt. Wilson</text>
                        
                        {/* Mt. Baldy */}
                        <polygon points="550,120 600,70 650,120" fill="#8B7355" stroke="#654321" strokeWidth="1" />
                        <text x="600" y="140" fontSize="11" fill="#333" textAnchor="middle" fontWeight="bold">Mt. Baldy</text>
                      </g>
                      
                      {/* Equipment on Mt. Wilson */}
                      <g transform="translate(100, 100)">
                        {/* Rotating mirror */}
                        <polygon points="0,-8 6,-6 8,0 6,6 0,8 -6,6 -8,0 -6,-6" fill="#E8E8E8" stroke="#666" strokeWidth="1" />
                        <circle cx="0" cy="0" r="2" fill="#333" />
                        <text x="0" y="-40" fontSize="9" fill="#333" textAnchor="middle" fontWeight="bold">Rotating</text>
                        <text x="0" y="-30" fontSize="9" fill="#333" textAnchor="middle" fontWeight="bold">8-sided mirror</text>
                      </g>
                      
                      {/* Stationary mirror on Mt. Baldy */}
                      <g transform="translate(600, 100)">
                        <rect x="-8" y="-15" width="16" height="30" fill="#E8E8E8" stroke="#666" strokeWidth="1" />
                        <text x="0" y="-45" fontSize="9" fill="#333" textAnchor="middle" fontWeight="bold">Stationary</text>
                        <text x="0" y="-35" fontSize="9" fill="#333" textAnchor="middle" fontWeight="bold">reflecting mirror</text>
                      </g>
                      
                      {/* Distance measurement */}
                      <g>
                        <line x1="100" y1="160" x2="600" y2="160" stroke="#4ECDC4" strokeWidth="2" />
                        <polygon points="595,155 600,160 595,165" fill="#4ECDC4" />
                        <polygon points="105,155 100,160 105,165" fill="#4ECDC4" />
                        <text x="350" y="150" fontSize="12" fill="#4ECDC4" textAnchor="middle" fontWeight="bold">
                          50.0 km
                        </text>
                      </g>
                      
                      {/* Light path */}
                      <line x1="108" y1="100" x2="592" y2="100" stroke="#FFD700" strokeWidth="2" opacity="0.6" />
                      <line x1="592" y1="95" x2="108" y2="95" stroke="#FF6B6B" strokeWidth="2" opacity="0.6" strokeDasharray="4,4" />
                    </svg>
                  </div>
                </div>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <div className="space-y-6">
                    {/* Part a */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">a. Calculate the time for one revolution – T</h5>
                      <div className="ml-4">
                        <p className="mb-2">Given: frequency <InlineMath>{'f = 375\\text{ Hz}'}</InlineMath></p>
                        <div className="text-center my-3">
                          <BlockMath>{'T = \\frac{1}{f}'}</BlockMath>
                        </div>
                        <div className="text-center my-3">
                          <BlockMath>{'T = \\frac{1}{375\\text{ Hz}}'}</BlockMath>
                        </div>
                        <div className="text-center my-3">
                          <BlockMath>{'T = 2.667 \\times 10^{-3}\\text{ s}'}</BlockMath>
                        </div>
                      </div>
                    </div>

                    {/* Part b */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">b. Calculate the time for light round trip – <sup>1</sup>⁄<sub>8</sub> T</h5>
                      <div className="ml-4">
                        <p className="mb-2">The mirror must rotate <sup>1</sup>⁄<sub>8</sub> revolution during the light's round trip:</p>
                        <div className="text-center my-3">
                          <BlockMath>{'\\Delta t = \\frac{1}{8}T = \\frac{1}{8}(2.667 \\times 10^{-3}\\text{ s})'}</BlockMath>
                        </div>
                        <div className="text-center my-3">
                          <BlockMath>{'\\Delta t = 3.333 \\times 10^{-4}\\text{ s}'}</BlockMath>
                        </div>
                      </div>
                    </div>

                    {/* Part c */}
                    <div>
                      <h5 className="font-semibold text-gray-800 mb-2">c. Calculate the speed of light</h5>
                      <div className="ml-4">
                        <p className="mb-2">Distance travelled: <InlineMath>{'d = 2 \\times 50.0\\text{ km} = 100.0\\text{ km} = 1.00 \\times 10^5\\text{ m}'}</InlineMath></p>
                        <div className="text-center my-3">
                          <BlockMath>{'v = \\frac{d}{\\Delta t}'}</BlockMath>
                        </div>
                        <div className="text-center my-3">
                          <BlockMath>{'v = \\frac{2 \\times 50.0 \\times 10^3\\text{ m}}{3.333 \\times 10^{-4}\\text{ s}}'}</BlockMath>
                        </div>
                        <div className="text-center my-3">
                          <BlockMath>{'v = 3.00 \\times 10^8\\text{ m/s}'}</BlockMath>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      The speed of light calculated from this experiment is <InlineMath>{'3.00 \\times 10^8\\text{ m/s}'}</InlineMath>.
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      This matches the modern accepted value, demonstrating the accuracy of Michelson's method!
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 4 - Michelson's Calculation</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Michelson Method Practice Problems */}
        <div className="mb-6">
          <SlideshowKnowledgeCheck
          onAIAccordionContent={onAIAccordionContent} 
            courseId={effectiveCourseId}
            lessonPath="09-introduction-to-light-michelson"
            questions={[
              {
                type: 'multiple-choice',
                questionId: 'course2_09_michelson_six_sided_calculation',
                title: 'Question 13: Six-sided Mirror Speed Calculation'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_michelson_eight_sided_frequency',
                title: 'Question 14: Eight-sided Mirror Frequency'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_michelson_pentagonal_frequency',
                title: 'Question 15: Pentagonal Mirror Frequency'
              },
              {
                type: 'multiple-choice',
                questionId: 'course2_09_michelson_twelve_sided_distance',
                title: 'Question 16: Twelve-sided Mirror Distance'
              }
            ]}
            theme="purple"
          />
        </div>

        {/* Light Year Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Light Year – A Distance" 
            value="light-year-a-distance" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="mb-4">
                  The vast majority of objects that we see in the night sky – stars, galaxies, nebulae – are
                  very far away from us. In fact, for some objects it has taken light billions of years to
                  reach us here on Earth. Therefore we are not seeing objects as they are, rather we are
                  seeing them as they were many years ago when the light started toward us. These
                  objects are so distant that it makes little sense to talk about them in terms of metres,
                  kilometres or even billions of kilometres. A more convenient measure of distance for
                  celestial objects is the light year. A light year is the distance that light travels in
                  one year.
                </p>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Light Year – A Distance</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 5 Section */}
        {AIAccordion ? (
        <AIAccordion theme="purple">
          <AIAccordion.Item 
            title="Example 5 - How Many Metres in a Light Year?" 
            value="example-5-light-year-calculation" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  How many metres are in a light year?
                </p>
                <p className="mb-6">
                  A light year is the distance that light (<InlineMath>{'v = 3.00 \\times 10^8\\text{ m/s}'}</InlineMath>) travels in one year (365.25 days).
                </p>

                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-4">
                    <li>
                      <strong>First, convert one year to seconds:</strong>
                      <div className="mt-2 ml-4">
                        <div className="text-center">
                          <BlockMath>{'t = 365.25\\text{ days} \\times \\frac{24\\text{ h}}{1\\text{ day}} \\times \\frac{3600\\text{ s}}{1\\text{ h}}'}</BlockMath>
                        </div>
                        <div className="text-center mt-2">
                          <BlockMath>{'t = 3.15576 \\times 10^7\\text{ s}'}</BlockMath>
                        </div>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate the distance using <InlineMath>{'d = v \\times t'}</InlineMath>:</strong>
                      <div className="mt-2 ml-4">
                        <div className="text-center">
                          <BlockMath>{'d = v \\times t'}</BlockMath>
                        </div>
                        <div className="text-center mt-2">
                          <BlockMath>{'d = 3.00 \\times 10^8\\text{ m/s} \\times 3.15576 \\times 10^7\\text{ s}'}</BlockMath>
                        </div>
                        <div className="text-center mt-2">
                          <BlockMath>{'d = 9.4673 \\times 10^{15}\\text{ m}'}</BlockMath>
                        </div>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <p className="font-semibold text-gray-800">Answer:</p>
                    <p className="text-lg mt-2">
                      One light year equals <InlineMath>{'9.4673 \\times 10^{15}\\text{ m}'}</InlineMath> (approximately 9.5 trillion kilometres).
                    </p>
                    
                    <div className="mt-4 p-3 bg-gray-100 rounded border border-gray-200">
                      <p className="text-sm text-gray-700">
                        <strong>Note:</strong> This enormous distance helps us understand why astronomical distances 
                        are measured in light years rather than kilometres. For example, the nearest star to our 
                        Sun (Proxima Centauri) is about 4.2 light years away!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 5 - How Many Metres in a Light Year?</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* SlideshowKnowledgeCheck: Light-Year and Space Communication Practice */}
         
        <SlideshowKnowledgeCheck
        onAIAccordionContent={onAIAccordionContent} 
          courseId={effectiveCourseId}
          lessonPath="09-introduction-to-light"
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_09_space_station_radio_signal',
              title: 'Question 17: Space Station Communication Time'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_light_travel_three_years',
              title: 'Question 18: Light Travel Distance Calculation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_star_explosion_observation',
              title: 'Question 19: Stellar Event Observation Delay'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_proxima_centauri_distance',
              title: 'Question 20: Proxima Centauri Distance Conversion'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_spacecraft_travel_time',
              title: 'Question 21: Interstellar Spacecraft Journey'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_sunlight_travel_time',
              title: 'Question 22: Sunlight Travel Time to Earth'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_galileo_light_travel',
              title: 'Question 23: Historical Jupiter Distance Calculation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_09_earth_jupiter_speed_calculation',
              title: 'Question 24: Earth-Jupiter Distance from Light Travel'
            }
          ]}
          theme="purple"
        />
       

      <LessonSummary
        points={[
          "Light can be observed without concerning ourselves with its nature (particle, wave, or something else)",
          "We see light in two ways: directly from sources and reflected from objects",
          "Light sources emit light (e.g., light bulb, Sun, stars, television)",
          "Objects reflect light (e.g., pencil, paper)",
          "The eye receives only a small portion of the light emitted or reflected",
          "Light travels in straight lines (rectilinear propagation)",
          "Light rays obey the laws of geometry and can be solved using similar triangles",
          "Light has a constant speed in a given medium (3.00 × 10⁸ m/s in air/vacuum)"
        ]}
      />
    </LessonContent>
  );
};

export default IntroductionToLight;
