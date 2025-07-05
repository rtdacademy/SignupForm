import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 7 - Curved Mirrors
 * Covers plane mirrors and spherical mirrors
 */
const CurvedMirrors = ({ course, courseId = '2', AIAccordion, onAIAccordionContent }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  // Animation states
  const [objectDistance, setObjectDistance] = useState(100); // Distance from mirror
  const [rayHeight, setRayHeight] = useState(175); // Height of the single ray (y-position)
  const [convexRayHeight, setConvexRayHeight] = useState(175); // Height of the ray for convex mirror
  
  // Ray diagram animation states
  const [rayDiagramStep, setRayDiagramStep] = useState(0); // Current step in animation (0-4)
  const [isRayAnimationPlaying, setIsRayAnimationPlaying] = useState(false);
  const [selectedDiagram, setSelectedDiagram] = useState(1); // Which diagram case to show (1-6)
  
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

  // Auto-play animation effect
  useEffect(() => {
    let interval;
    if (isRayAnimationPlaying && rayDiagramStep < 4) {
      interval = setInterval(() => {
        setRayDiagramStep(prev => {
          if (prev >= 4) {
            setIsRayAnimationPlaying(false);
            return 4;
          }
          return prev + 1;
        });
      }, 2000); // 2 seconds per step
    }
    return () => clearInterval(interval);
  }, [isRayAnimationPlaying, rayDiagramStep]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LessonContent
      lessonId="lesson_1747281791046_107"
      title="Lesson 7 - Curved Mirrors"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            <em>Refer to Pearson pages 656 to 665.</em>
          </p>
        </div>

        {/* Plane Mirrors Section */}
        {AIAccordion ? (
        <AIAccordion theme="green">
          <AIAccordion.Item 
            title="Plane Mirrors – Revisited" 
            value="plane-mirrors-revisited" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  In our previous work on Reflection, we saw that for plane mirrors the image of an object
                  always exists within the mirror – we can never touch or project the image since it does
                  not exist as something outside of the mirror. Images which exist "inside" the mirror are
                  referred to as <strong>virtual images</strong>.
                </p>
                
                <p className="mb-4">
                  Images that can be projected onto a screen outside of the
                  mirror are referred to as <strong>real images</strong>. (A quick example of a real image is the image
                  made by an overhead projector. The image of the transparency is easily projected onto
                  a screen.)
                </p>

                {/* Interactive Plane Mirror Animation */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-3 text-center">Virtual Image Formation in a Plane Mirror</h4>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl mb-4">
                      <svg width="100%" height="400" viewBox="0 0 700 400" className="border border-gray-400 bg-white rounded">
                        {/* Mirror (vertical line in center) */}
                        <line x1="350" y1="50" x2="350" y2="350" stroke="#4A4A4A" strokeWidth="4" />
                        <text x="360" y="370" fontSize="12" fill="#666" textAnchor="start">Plane Mirror</text>
                        
                        {/* Object side label */}
                        <text x="175" y="30" fontSize="14" fill="#333" textAnchor="middle" fontWeight="bold">Object Side (Real)</text>
                        
                        {/* Image side label */}
                        <text x="525" y="30" fontSize="14" fill="#999" textAnchor="middle" fontWeight="bold">Image Side (Virtual)</text>
                        
                        {/* Object (arrow) */}
                        <g>
                          {/* Object arrow */}
                          <line 
                            x1={350 - objectDistance} 
                            y1="250" 
                            x2={350 - objectDistance} 
                            y2="150" 
                            stroke="#FF6B6B" 
                            strokeWidth="3" 
                          />
                          {/* Arrow head */}
                          <polygon 
                            points={`${350 - objectDistance - 5},155 ${350 - objectDistance},150 ${350 - objectDistance + 5},155`} 
                            fill="#FF6B6B" 
                          />
                          <text x={350 - objectDistance} y="270" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Object</text>
                        </g>
                        
                        {/* Virtual image (dashed arrow) */}
                        <g>
                          {/* Image arrow (dashed) */}
                          <line 
                            x1={350 + objectDistance} 
                            y1="250" 
                            x2={350 + objectDistance} 
                            y2="150" 
                            stroke="#4ECDC4" 
                            strokeWidth="3" 
                            strokeDasharray="5,5"
                            opacity="0.7"
                          />
                          {/* Arrow head */}
                          <polygon 
                            points={`${350 + objectDistance - 5},155 ${350 + objectDistance},150 ${350 + objectDistance + 5},155`} 
                            fill="#4ECDC4" 
                            opacity="0.7"
                          />
                          <text x={350 + objectDistance} y="270" fontSize="12" fill="#4ECDC4" textAnchor="middle" fontWeight="bold" opacity="0.7">Virtual Image</text>
                        </g>
                        
                        {/* Calculate observer position at intersection of reflected rays */}
                        {(() => {
                          // Calculate where the two reflected rays intersect
                          // Top ray hits mirror at y=180, bottom ray hits mirror at y=220
                          const mirrorHitY1 = 180; // top ray
                          const mirrorHitY2 = 220; // bottom ray
                          const mirrorX = 350;
                          
                          // Virtual image positions
                          const virtualTopX = 350 + objectDistance;
                          const virtualTopY = 150;
                          const virtualBottomX = 350 + objectDistance;
                          const virtualBottomY = 250;
                          
                          // Calculate slopes of virtual rays (these determine reflected ray directions)
                          const topVirtualSlope = (virtualTopY - mirrorHitY1) / (virtualTopX - mirrorX);
                          const bottomVirtualSlope = (virtualBottomY - mirrorHitY2) / (virtualBottomX - mirrorX);
                          
                          // Find intersection of the two reflected rays
                          // Top ray: y - mirrorHitY1 = topVirtualSlope * (x - mirrorX)
                          // Bottom ray: y - mirrorHitY2 = bottomVirtualSlope * (x - mirrorX)
                          // Setting equal: mirrorHitY1 + topVirtualSlope * (x - mirrorX) = mirrorHitY2 + bottomVirtualSlope * (x - mirrorX)
                          
                          const observerX = mirrorX + (mirrorHitY2 - mirrorHitY1) / (topVirtualSlope - bottomVirtualSlope);
                          const observerY = mirrorHitY1 + topVirtualSlope * (observerX - mirrorX);
                          
                          return (
                            <g transform={`translate(${observerX}, ${observerY})`}>
                              <ellipse cx="0" cy="0" rx="20" ry="15" fill="#fff" stroke="#666" strokeWidth="2" />
                              <circle cx="0" cy="0" r="8" fill="#4a90e2" />
                              <circle cx="0" cy="0" r="4" fill="#000" />
                              <text x="0" y="-25" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">Observer</text>
                            </g>
                          );
                        })()}
                        
                        {/* Light rays */}
                        {/* Ray from top of object */}
                        <g>
                          {/* Calculate intersection points */}
                          {(() => {
                            // Top ray hits mirror at y=180 (angled down toward observer)
                            const mirrorHitY1 = 180;
                            const mirrorX = 350;
                            
                            // Virtual image top is at same position as object top
                            const virtualTopX = 350 + objectDistance;
                            const virtualTopY = 150;
                            
                            // Calculate observer position (same calculation as above)
                            const mirrorHitY2 = 220; // bottom ray
                            const virtualBottomX = 350 + objectDistance;
                            const virtualBottomY = 250;
                            
                            const topVirtualSlope = (virtualTopY - mirrorHitY1) / (virtualTopX - mirrorX);
                            const bottomVirtualSlope = (virtualBottomY - mirrorHitY2) / (virtualBottomX - mirrorX);
                            
                            const observerX = mirrorX + (mirrorHitY2 - mirrorHitY1) / (topVirtualSlope - bottomVirtualSlope);
                            const observerY = mirrorHitY1 + topVirtualSlope * (observerX - mirrorX);
                            
                            return (
                              <>
                                {/* Incident ray from object top to mirror */}
                                <line 
                                  x1={350 - objectDistance} 
                                  y1="150" 
                                  x2="350" 
                                  y2={mirrorHitY1} 
                                  stroke="#FFD700" 
                                  strokeWidth="2" 
                                />
                                {/* Reflected ray from mirror to eye */}
                                <line 
                                  x1="350" 
                                  y1={mirrorHitY1} 
                                  x2={observerX} 
                                  y2={observerY} 
                                  stroke="#FFD700" 
                                  strokeWidth="2" 
                                />
                                {/* Virtual ray extension behind mirror (dashed) - from virtual image through mirror hit point */}
                                <line 
                                  x1={virtualTopX} 
                                  y1={virtualTopY} 
                                  x2="350" 
                                  y2={mirrorHitY1} 
                                  stroke="#FFD700" 
                                  strokeWidth="2" 
                                  strokeDasharray="5,5"
                                  opacity="0.5"
                                />
                              </>
                            );
                          })()}
                        </g>
                        
                        {/* Ray from bottom of object */}
                        <g>
                          {/* Calculate intersection points */}
                          {(() => {
                            // Bottom ray hits mirror at y=220 (angled up with positive slope from object bottom at y=250)
                            const mirrorHitY2 = 220;
                            const mirrorX = 350;
                            
                            // Virtual image bottom is at same position as object bottom
                            const virtualBottomX = 350 + objectDistance;
                            const virtualBottomY = 250;
                            
                            // Calculate observer position (same calculation as above)
                            const mirrorHitY1 = 180; // top ray
                            const virtualTopX = 350 + objectDistance;
                            const virtualTopY = 150;
                            
                            const topVirtualSlope = (virtualTopY - mirrorHitY1) / (virtualTopX - mirrorX);
                            const bottomVirtualSlope = (virtualBottomY - mirrorHitY2) / (virtualBottomX - mirrorX);
                            
                            const observerX = mirrorX + (mirrorHitY2 - mirrorHitY1) / (topVirtualSlope - bottomVirtualSlope);
                            const observerY = mirrorHitY1 + topVirtualSlope * (observerX - mirrorX);
                            
                            return (
                              <>
                                {/* Incident ray from object bottom to mirror */}
                                <line 
                                  x1={350 - objectDistance} 
                                  y1="250" 
                                  x2="350" 
                                  y2={mirrorHitY2} 
                                  stroke="#FFA500" 
                                  strokeWidth="2" 
                                />
                                {/* Reflected ray from mirror to eye */}
                                <line 
                                  x1="350" 
                                  y1={mirrorHitY2} 
                                  x2={observerX} 
                                  y2={observerY} 
                                  stroke="#FFA500" 
                                  strokeWidth="2" 
                                />
                                {/* Virtual ray extension behind mirror (dashed) - from virtual image through mirror hit point */}
                                <line 
                                  x1={virtualBottomX} 
                                  y1={virtualBottomY} 
                                  x2="350" 
                                  y2={mirrorHitY2} 
                                  stroke="#FFA500" 
                                  strokeWidth="2" 
                                  strokeDasharray="5,5"
                                  opacity="0.5"
                                />
                              </>
                            );
                          })()}
                        </g>
                        
                        {/* Distance labels */}
                        <g>
                          {/* Object distance */}
                          <line x1={350 - objectDistance} y1="300" x2="350" y2="300" stroke="#666" strokeWidth="1" />
                          <text x={350 - objectDistance/2} y="315" fontSize="11" fill="#666" textAnchor="middle">
                            d = {objectDistance} units
                          </text>
                          
                          {/* Image distance */}
                          <line x1="350" y1="320" x2={350 + objectDistance} y2="320" stroke="#666" strokeWidth="1" strokeDasharray="3,3" />
                          <text x={350 + objectDistance/2} y="335" fontSize="11" fill="#666" textAnchor="middle">
                            d = {objectDistance} units
                          </text>
                        </g>
                      </svg>
                    </div>
                    
                    {/* Distance slider */}
                    <div className="w-full max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Object Distance from Mirror: {objectDistance} units
                      </label>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        value={objectDistance}
                        onChange={(e) => setObjectDistance(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(objectDistance - 50) / 100 * 100}%, #E5E7EB ${(objectDistance - 50) / 100 * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>Close</span>
                        <span>Far</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 w-full max-w-md">
                      <p className="text-sm text-blue-800">
                        <strong>Observe:</strong> As you move the object closer or farther from the mirror:
                        <br />• The virtual image is always the same distance behind the mirror as the object is in front
                        <br />• The image is upright and the same size as the object
                        <br />• Light rays appear to come from the virtual image location
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Plane Mirrors – Revisited</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Spherical Mirrors Section */}
        {AIAccordion ? (
        <AIAccordion theme="green">
          <AIAccordion.Item 
            title="Spherical Mirrors" 
            value="spherical-mirrors" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  Spherical mirrors, like plane mirrors, obey the law of reflection (<InlineMath>{"\\theta_i = \\theta_r"}</InlineMath>), but for spherical
                  mirrors the normal is always the radius of the sphere. Spherical mirrors come in two
                  types: <strong>converging (concave)</strong> and <strong>diverging (convex)</strong>.
                </p>
                
                <h4 className="font-semibold text-gray-800 mb-3 mt-6">Converging (Concave) Mirrors</h4>
                <p className="mb-4">
                  For a converging mirror, light rays reflect toward the focal point. For a converging mirror, incident light rays which are parallel to the principal axis are
                  reflected toward a real focal point.
                </p>

                {/* Interactive Concave Mirror Demonstration */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Concave Mirror: Single Ray Reflection</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl mb-4">
                      <svg width="100%" height="350" viewBox="0 0 700 350" className="border border-gray-400 bg-white rounded">
                        {/* Principal axis */}
                        <line x1="50" y1="175" x2="650" y2="175" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                        <text x="580" y="165" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                        
                        {/* Mirror surface - arc with center at C (350, 175) and radius 150 */}
                        {(() => {
                          const centerX = 350;
                          const centerY = 175;
                          const radius = 150;
                          
                          // Calculate arc endpoints for a concave mirror
                          const arcHeight = 100; // Half the arc height
                          const startY = centerY - arcHeight;
                          const endY = centerY + arcHeight;
                          
                          // Calculate x positions on the circle
                          const startX = centerX + Math.sqrt(radius * radius - (startY - centerY) * (startY - centerY));
                          const endX = centerX + Math.sqrt(radius * radius - (endY - centerY) * (endY - centerY));
                          
                          return (
                            <path 
                              d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 1 ${endX} ${endY}`} 
                              stroke="#4A4A4A" 
                              strokeWidth="5" 
                              fill="none" 
                            />
                          );
                        })()}
                        
                        {/* Center of curvature */}
                        <circle cx="350" cy="175" r="3" fill="#333" />
                        <text x="350" y="165" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                        
                        {/* Focal point */}
                        <circle cx="425" cy="175" r="3" fill="#FF6B6B" />
                        <text x="425" y="165" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                        
                        {/* Single incident ray */}
                        {(() => {
                          // Use the same circle parameters as the mirror surface
                          const centerX = 350;
                          const centerY = 175;
                          const radius = 150;
                          
                          // For a horizontal ray at rayHeight, find intersection with circle
                          // Circle equation: (x - centerX)² + (y - centerY)² = radius²
                          // For horizontal ray: y = rayHeight, solve for x
                          const deltaY = rayHeight - centerY;
                          
                          // Check if ray is within the mirror's vertical range (same as mirror arc)
                          const arcHeight = 100; // Same as mirror arc
                          if (Math.abs(deltaY) > arcHeight) {
                            return null; // Ray doesn't hit the mirror
                          }
                          
                          // Find intersection with circle - use the right side for concave mirror
                          const mirrorHitX = centerX + Math.sqrt(radius * radius - deltaY * deltaY);
                          const mirrorHitY = rayHeight;
                          
                          return (
                            <g>
                              {/* Incident ray (parallel to principal axis) */}
                              <line 
                                x1="100" 
                                y1={rayHeight} 
                                x2={mirrorHitX} 
                                y2={mirrorHitY} 
                                stroke="#FFD700" 
                                strokeWidth="3" 
                              />
                              <polygon 
                                points={`${mirrorHitX-8},${mirrorHitY-3} ${mirrorHitX},${mirrorHitY} ${mirrorHitX-8},${mirrorHitY+3}`} 
                                fill="#FFD700" 
                              />
                              
                              {/* Reflected ray (toward focal point) */}
                              <line 
                                x1={mirrorHitX} 
                                y1={mirrorHitY} 
                                x2="425" 
                                y2="175" 
                                stroke="#4ECDC4" 
                                strokeWidth="3" 
                              />
                              
                              {/* Normal line - extended through the circle */}
                              {(() => {
                                // Calculate the full normal line from one side of the circle to the other
                                const normalDirection = {
                                  x: centerX - mirrorHitX,
                                  y: centerY - mirrorHitY
                                };
                                const normalLength = Math.sqrt(normalDirection.x * normalDirection.x + normalDirection.y * normalDirection.y);
                                const normalUnit = {
                                  x: normalDirection.x / normalLength,
                                  y: normalDirection.y / normalLength
                                };
                                
                                // Extend normal line beyond the circle on both sides
                                const extensionLength = 50;
                                const normalStart = {
                                  x: mirrorHitX - normalUnit.x * extensionLength,
                                  y: mirrorHitY - normalUnit.y * extensionLength
                                };
                                const normalEnd = {
                                  x: centerX + normalUnit.x * extensionLength,
                                  y: centerY + normalUnit.y * extensionLength
                                };
                                
                                return (
                                  <line 
                                    x1={normalStart.x} 
                                    y1={normalStart.y} 
                                    x2={normalEnd.x} 
                                    y2={normalEnd.y} 
                                    stroke="#666" 
                                    strokeWidth="2" 
                                    strokeDasharray="4,4" 
                                  />
                                );
                              })()}
                              
                              {/* Labels */}
                              <text 
                                x="200" 
                                y={rayHeight - 15} 
                                fontSize="12" 
                                fill="#FFD700" 
                                textAnchor="middle" 
                                fontWeight="bold"
                              >
                                Incident ray
                              </text>
                              
                              <text 
                                x={mirrorHitX - 50} 
                                y={mirrorHitY + (175 - mirrorHitY) / 2} 
                                fontSize="12" 
                                fill="#4ECDC4" 
                                textAnchor="middle" 
                                fontWeight="bold"
                              >
                                Reflected ray
                              </text>
                              
                              <text 
                                x={centerX + 20} 
                                y={centerY + (mirrorHitY - centerY) / 2} 
                                fontSize="10" 
                                fill="#666" 
                                textAnchor="start"
                              >
                                Normal
                              </text>
                            </g>
                          );
                        })()}
                        
                        {/* Focal point highlight */}
                        <circle cx="425" cy="175" r="8" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeDasharray="4,4" />
                      </svg>
                    </div>
                    
                    {/* Ray height slider */}
                    <div className="w-full max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adjust ray height
                      </label>
                      <input
                        type="range"
                        min="75"
                        max="275"
                        value={rayHeight}
                        onChange={(e) => setRayHeight(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(rayHeight - 75) / 200 * 100}%, #E5E7EB ${(rayHeight - 75) / 200 * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>High</span>
                        <span>Center</span>
                        <span>Low</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 w-full max-w-md">
                      <p className="text-sm text-blue-800">
                        <strong>Observe:</strong> Move the slider to change the ray height. Notice how:
                        <br />• All rays parallel to the principal axis reflect through the focal point (F)
                        <br />• The normal is always the radius from center of curvature (C) to the hit point
                        <br />• The ray path changes, but it always passes through F after reflection
                      </p>
                    </div>
                  </div>
                </div>

                
                <h4 className="font-semibold text-gray-800 mb-3 mt-6">Diverging (Convex) Mirrors</h4>
                <p className="mb-4">
                  For a diverging mirror, incident light rays which are parallel to the principal axis are
                  reflected as if they had originated from a virtual focal point behind the mirror. Diverging
                  mirrors always produce virtual images.
                </p>

                {/* Interactive Convex Mirror Demonstration */}
                <div className="mt-6 p-4 bg-gray-100 rounded-lg border border-gray-300">
                  <h5 className="font-semibold text-gray-800 mb-3 text-center">Convex Mirror: Single Ray Reflection</h5>
                  
                  <div className="flex flex-col items-center">
                    <div className="relative w-full max-w-2xl mb-4">
                      <svg width="100%" height="350" viewBox="0 0 700 350" className="border border-gray-400 bg-white rounded">
                        {/* Principal axis */}
                        <line x1="50" y1="175" x2="650" y2="175" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                        <text x="580" y="165" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                        
                        {/* Mirror surface - arc with center at C (550, 175) and radius 150 */}
                        {(() => {
                          const centerX = 550;
                          const centerY = 175;
                          const radius = 150;
                          
                          // Calculate arc endpoints for a convex mirror
                          const arcHeight = 100; // Half the arc height
                          const startY = centerY - arcHeight;
                          const endY = centerY + arcHeight;
                          
                          // Calculate x positions on the circle (left side for convex)
                          const startX = centerX - Math.sqrt(radius * radius - (startY - centerY) * (startY - centerY));
                          const endX = centerX - Math.sqrt(radius * radius - (endY - centerY) * (endY - centerY));
                          
                          return (
                            <path 
                              d={`M ${startX} ${startY} A ${radius} ${radius} 0 0 0 ${endX} ${endY}`} 
                              stroke="#4A4A4A" 
                              strokeWidth="5" 
                              fill="none" 
                            />
                          );
                        })()}
                        
                        {/* Virtual center of curvature (behind mirror) */}
                        <circle cx="550" cy="175" r="3" fill="#333" strokeDasharray="3,3" />
                        <text x="550" y="165" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C (virtual)</text>
                        
                        {/* Virtual focal point (behind mirror) */}
                        <circle cx="475" cy="175" r="3" fill="#FF6B6B" strokeDasharray="3,3" />
                        <text x="475" y="165" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F (virtual)</text>
                        
                        {/* Single incident ray */}
                        {(() => {
                          // Use the same circle parameters as the mirror surface
                          const centerX = 550;
                          const centerY = 175;
                          const radius = 150;
                          
                          // For a horizontal ray at convexRayHeight, find intersection with circle
                          const deltaY = convexRayHeight - centerY;
                          
                          // Check if ray is within the mirror's vertical range
                          const arcHeight = 100;
                          if (Math.abs(deltaY) > arcHeight) {
                            return null;
                          }
                          
                          // Find intersection with circle - use the left side for convex mirror
                          const mirrorHitX = centerX - Math.sqrt(radius * radius - deltaY * deltaY);
                          const mirrorHitY = convexRayHeight;
                          
                          // Calculate reflected ray (appears to come from virtual focal point)
                          const virtualFocalX = 475;
                          const virtualFocalY = 175;
                          
                          // Calculate direction from virtual focal point to mirror hit point
                          const rayDirection = {
                            x: mirrorHitX - virtualFocalX,
                            y: mirrorHitY - virtualFocalY
                          };
                          
                          // Extend this direction beyond the mirror
                          const rayLength = 200;
                          const magnitude = Math.sqrt(rayDirection.x * rayDirection.x + rayDirection.y * rayDirection.y);
                          const reflectedEndX = mirrorHitX + (rayDirection.x / magnitude) * rayLength;
                          const reflectedEndY = mirrorHitY + (rayDirection.y / magnitude) * rayLength;
                          
                          return (
                            <g>
                              {/* Incident ray (parallel to principal axis) */}
                              <line 
                                x1="100" 
                                y1={convexRayHeight} 
                                x2={mirrorHitX} 
                                y2={mirrorHitY} 
                                stroke="#FFD700" 
                                strokeWidth="3" 
                              />
                              <polygon 
                                points={`${mirrorHitX-8},${mirrorHitY-3} ${mirrorHitX},${mirrorHitY} ${mirrorHitX-8},${mirrorHitY+3}`} 
                                fill="#FFD700" 
                              />
                              
                              {/* Reflected ray (diverging) */}
                              <line 
                                x1={mirrorHitX} 
                                y1={mirrorHitY} 
                                x2={reflectedEndX} 
                                y2={reflectedEndY} 
                                stroke="#4ECDC4" 
                                strokeWidth="3" 
                              />
                              
                              {/* Virtual ray extension (dashed) - from virtual focal point to mirror */}
                              <line 
                                x1={virtualFocalX} 
                                y1={virtualFocalY} 
                                x2={mirrorHitX} 
                                y2={mirrorHitY} 
                                stroke="#4ECDC4" 
                                strokeWidth="2" 
                                strokeDasharray="4,4" 
                                opacity="0.5"
                              />
                              
                              {/* Normal line - extended through the circle */}
                              {(() => {
                                // Calculate the full normal line from one side of the circle to the other
                                const normalDirection = {
                                  x: centerX - mirrorHitX,
                                  y: centerY - mirrorHitY
                                };
                                const normalLength = Math.sqrt(normalDirection.x * normalDirection.x + normalDirection.y * normalDirection.y);
                                const normalUnit = {
                                  x: normalDirection.x / normalLength,
                                  y: normalDirection.y / normalLength
                                };
                                
                                // Extend normal line beyond the circle on both sides
                                const extensionLength = 50;
                                const normalStart = {
                                  x: mirrorHitX - normalUnit.x * extensionLength,
                                  y: mirrorHitY - normalUnit.y * extensionLength
                                };
                                const normalEnd = {
                                  x: centerX + normalUnit.x * extensionLength,
                                  y: centerY + normalUnit.y * extensionLength
                                };
                                
                                return (
                                  <line 
                                    x1={normalStart.x} 
                                    y1={normalStart.y} 
                                    x2={normalEnd.x} 
                                    y2={normalEnd.y} 
                                    stroke="#666" 
                                    strokeWidth="2" 
                                    strokeDasharray="4,4" 
                                  />
                                );
                              })()}
                              
                              {/* Labels */}
                              <text 
                                x="200" 
                                y={convexRayHeight - 15} 
                                fontSize="12" 
                                fill="#FFD700" 
                                textAnchor="middle" 
                                fontWeight="bold"
                              >
                                Incident ray
                              </text>
                              
                              <text 
                                x={mirrorHitX + 50} 
                                y={mirrorHitY + (reflectedEndY - mirrorHitY) / 3} 
                                fontSize="12" 
                                fill="#4ECDC4" 
                                textAnchor="middle" 
                                fontWeight="bold"
                              >
                                Reflected ray
                              </text>
                              
                              <text 
                                x={centerX - 20} 
                                y={centerY + (mirrorHitY - centerY) / 2} 
                                fontSize="10" 
                                fill="#666" 
                                textAnchor="end"
                              >
                                Normal
                              </text>
                            </g>
                          );
                        })()}
                        
                        {/* Focal point highlight */}
                        <circle cx="475" cy="175" r="8" fill="none" stroke="#FF6B6B" strokeWidth="2" strokeDasharray="4,4" />
                      </svg>
                    </div>
                    
                    {/* Ray height slider */}
                    <div className="w-full max-w-md">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Adjust ray height
                      </label>
                      <input
                        type="range"
                        min="75"
                        max="275"
                        value={convexRayHeight}
                        onChange={(e) => setConvexRayHeight(Number(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                        style={{
                          background: `linear-gradient(to right, #3B82F6 0%, #3B82F6 ${(convexRayHeight - 75) / 200 * 100}%, #E5E7EB ${(convexRayHeight - 75) / 200 * 100}%, #E5E7EB 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>High</span>
                        <span>Center</span>
                        <span>Low</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200 w-full max-w-md">
                      <p className="text-sm text-blue-800">
                        <strong>Observe:</strong> Move the slider to change the ray height. Notice how:
                        <br />• All rays appear to diverge from the virtual focal point (F) behind the mirror
                        <br />• The normal is always the radius from virtual center of curvature (C)
                        <br />• Reflected rays spread out - this is why convex mirrors are called "diverging"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Spherical Mirrors</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Image Formation Section */}
        {AIAccordion ? (
        <AIAccordion theme="green">
          <AIAccordion.Item 
            title="Image Formation" 
            value="image-formation" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h5 className="font-semibold text-gray-700 mb-3">Ray Diagrams</h5>
                
                <p className="mb-4">
                  There are literally billions of light rays striking a mirror from an object such as a light
                  bulb. Fortunately, in order to determine if an image is formed it is not necessary to draw
                  hundreds of rays reflecting off of a mirror. In fact, there are three very useful rays which
                  may be used to determine the position, orientation and nature of an image being
                  formed. The point where the three rays cross is the location of the image.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100 mt-4">
                  <h6 className="font-semibold text-gray-700 mb-3">The Three Key Rays:</h6>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <span className="text-blue-800 font-bold">Ray 1</span>
                      </div>
                      <div>
                        <p><strong>The incident ray which is parallel to the principal axis</strong> will reflect through (or away from) the focal point.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-8 bg-green-100 rounded flex items-center justify-center">
                        <span className="text-green-800 font-bold">Ray 2</span>
                      </div>
                      <div>
                        <p><strong>The incident ray through the focal point</strong> is reflected parallel to the principal axis.</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-12 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-800 font-bold">Ray 3</span>
                      </div>
                      <div>
                        <p><strong>The incident ray travels along a line that passes through the centre of curvature</strong> and reflects straight back.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> Whether or not an image is formed depends on a number of factors:
                    <br />• Type of mirror (concave or convex)
                    <br />• The focal length (f)
                    <br />• The distance from the mirror to the object (d<sub>o</sub>)
                  </p>
                </div>

                {/* Ray Diagram Slideshow */}
                <div className="mt-6">
                  <h6 className="font-semibold text-gray-700 mb-4">Interactive Ray Diagram Cases</h6>
                  
                  {/* Case Selector */}
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {[
                      { id: 1, title: "Object Beyond C (Concave)" },
                      { id: 2, title: "Object at C (Concave)" },
                      { id: 3, title: "Object Between F and C (Concave)" },
                      { id: 4, title: "Object at F (Concave)" },
                      { id: 5, title: "Object Inside F (Concave)" },
                      { id: 6, title: "Any Position (Convex)" }
                    ].map(case_ => (
                      <button
                        key={case_.id}
                        onClick={() => {
                          setSelectedDiagram(case_.id);
                          setRayDiagramStep(0);
                          setIsRayAnimationPlaying(false);
                        }}
                        className={`px-3 py-2 rounded text-sm transition-colors ${
                          selectedDiagram === case_.id
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                        }`}
                      >
                        {case_.id}. {case_.title}
                      </button>
                    ))}
                  </div>
                  
                  {/* Full-Width Animation Display */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    {selectedDiagram === 1 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 1: Object Beyond C (Concave)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="650" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="580" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Mirror surface - concave */}
                            <path d="M 490 40 A 150 150 0 0 1 490 160" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            
                            {/* Center of curvature */}
                            <circle cx="350" cy="100" r="3" fill="#333" />
                            <text x="350" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                            
                            {/* Focal point */}
                            <circle cx="425" cy="100" r="3" fill="#FF6B6B" />
                            <text x="425" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) beyond C */}
                            <g>
                              <line x1="200" y1="100" x2="200" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="197,53 200,50 203,53" fill="#000" />
                              <text x="200" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="200" y1="50" x2="495" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                
                                {/* Reflected through focal point and beyond */}
                                <line x1="495" y1="50" x2="300" y2="190" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                                 </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through focal point (Green) */}
                                <line x1="200" y1="50" x2="505" y2="118" stroke="#22C55E" strokeWidth="3" />
                                
                                {/* Reflected parallel to axis */}
                                <line x1="505" y1="118" x2="50" y2="118" stroke="#22C55E" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of curvature (Purple) */}
                                <line x1="200" y1="50" x2="495" y2="150" stroke="#A855F7" strokeWidth="3" />
                                
                                {/* Reflected straight back */}
                                <line x1="495" y1="150" x2="200" y2="50" stroke="#A855F7" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Image formation - between F and C, inverted and smaller */}
                                <g>
                                  <line x1="400" y1="100" x2="400" y2="115" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="3,3" />
                                  <polygon points="397,115 400,118 403,115" fill="#FF6B6B" />
                                  <text x="400" y="160" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Image</text>
                                  </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Step explanation */}
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed beyond center of curvature (C). The object is farther from the mirror than C.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong>Ray 1 (Blue):</strong> The ray parallel to the principal axis reflects through the focal point (F).</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong>Ray 2 (Green):</strong> The ray through the focal point reflects parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>Ray 3 (Purple):</strong> The ray through the center of curvature reflects straight back along the same path.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The rays converge between F and C, forming a <strong>real</strong>, <strong>inverted</strong> image that is <strong>smaller</strong> than the object.</span>
                            )}
                          </div>
                          

                          {/* Controls */}
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                              disabled={rayDiagramStep === 0}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setRayDiagramStep(Math.min(4, rayDiagramStep + 1))}
                              disabled={rayDiagramStep === 4}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDiagram === 2 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 2: Object at C (Concave)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="650" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="580" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Mirror surface - concave */}
                            <path d="M 490 40 A 150 150 0 0 1 490 160" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            
                            {/* Center of curvature */}
                            <circle cx="350" cy="100" r="3" fill="#333" />
                            <text x="350" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                            
                            {/* Focal point */}
                            <circle cx="425" cy="100" r="3" fill="#FF6B6B" />
                            <text x="425" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) at C */}
                            <g>
                              <line x1="350" y1="100" x2="350" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="347,53 350,50 353,53" fill="#000" />
                              <text x="350" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="350" y1="50" x2="495" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                
                                {/* Reflected through focal point and beyond */}
                                <line x1="495" y1="50" x2="425" y2="100" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                                <line x1="425" y1="100" x2="350" y2="150" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through focal point (Green) */}
                                <line x1="350" y1="50" x2="497" y2="147" stroke="#22C55E" strokeWidth="3" />
                                
                                {/* Reflected parallel to axis */}
                                <line x1="497" y1="147" x2="350" y2="147" stroke="#22C55E" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Image formation - at C, inverted and same size */}
                                <g>
                                  <line x1="350" y1="100" x2="350" y2="150" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="3,3" />
                                  <polygon points="347,147 350,150 353,147" fill="#FF6B6B" />
                                  <text x="350" y="170" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Image</text>
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Step explanation */}
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed at center of curvature (C). The object is exactly at the center of the mirror's curvature.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong>Ray 1 (Blue):</strong> The ray parallel to the principal axis reflects through the focal point (F).</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong>Ray 2 (Green):</strong> The ray through the focal point reflects parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>Image Formation:</strong> The rays converge at C, forming a <strong>real</strong>, <strong>inverted</strong> image that is the <strong>same size</strong> as the object.</span>
                            )}
                          </div>
                          
                          {/* Controls */}
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                              disabled={rayDiagramStep === 0}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setRayDiagramStep(Math.min(3, rayDiagramStep + 1))}
                              disabled={rayDiagramStep === 3}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDiagram === 3 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 3: Object Between F and C (Concave)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="650" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="580" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Mirror surface - concave */}
                            <path d="M 490 20 A 150 150 0 0 1 490 180" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            
                            {/* Center of curvature */}
                            <circle cx="350" cy="100" r="3" fill="#333" />
                            <text x="350" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                            
                            {/* Focal point */}
                            <circle cx="425" cy="100" r="3" fill="#FF6B6B" />
                            <text x="425" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) between C and F */}
                            <g>
                              <line x1="385" y1="100" x2="385" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="382,53 385,50 388,53" fill="#000" />
                              <text x="385" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="385" y1="50" x2="505" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                
                                {/* Reflected through focal point and beyond */}
                                <line x1="505" y1="50" x2="270" y2="200" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through focal point (Green) */}
                                <line x1="385" y1="50" x2="490" y2="175" stroke="#22C55E" strokeWidth="3" />
                                
                                {/* Reflected parallel to axis */}
                                <line x1="490" y1="175" x2="50" y2="175" stroke="#22C55E" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of curvature (Purple) */}
                                <line x1="385" y1="50" x2="290" y2="200" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Image formation - beyond C, inverted and larger */}
                                <g>
                                  <line x1="305" y1="100" x2="305" y2="175" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="3,3" />
                                  <polygon points="302,172 305,175 308,172" fill="#FF6B6B" />
                                  <text x="325" y="190" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Image</text>
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Step explanation */}
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed between F and C. The object is closer to the mirror than the center of curvature but farther than the focal point.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong>Ray 1 (Blue):</strong> The ray parallel to the principal axis reflects through the focal point (F).</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong>Ray 2 (Green):</strong> The ray through the focal point reflects parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>Ray 3 (Purple):</strong> The ray through the center of curvature reflects straight back along the same path.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The rays converge beyond C, forming a <strong>real</strong>, <strong>inverted</strong> image that is <strong>larger</strong> than the object.</span>
                            )}
                          </div>
                          
                          {/* Controls */}
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                              disabled={rayDiagramStep === 0}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setRayDiagramStep(Math.min(4, rayDiagramStep + 1))}
                              disabled={rayDiagramStep === 4}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDiagram === 4 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 4: Object at F (Concave)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="650" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="580" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Mirror surface - concave */}
                            <path d="M 490 20 A 150 150 0 0 1 490 180" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            
                            {/* Center of curvature */}
                            <circle cx="350" cy="100" r="3" fill="#333" />
                            <text x="350" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                            
                            {/* Focal point */}
                            <circle cx="425" cy="100" r="3" fill="#FF6B6B" />
                            <text x="425" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) at F */}
                            <g>
                              <line x1="425" y1="100" x2="425" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="422,53 425,50 428,53" fill="#000" />
                              <text x="425" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="425" y1="50" x2="505" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                
                                {/* Reflected through focal point */}
                                <line x1="505" y1="50" x2="285" y2="200" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through center of curvature (Purple) */}
                                <line x1="425" y1="50" x2="200" y2="200" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* No image formation */}
                                <text x="350" y="225" fontSize="14" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">
                                  No image forms
                                </text>
                              </>
                            )}
                          </svg>
                          
                          {/* Step explanation */}
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed at the focal point (F). This is a special case where no image forms.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong>Ray 1 (Blue):</strong> The ray parallel to the principal axis reflects through F, resulting in a ray parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong>Ray 2 (Purple):</strong> The ray through the center of curvature reflects back through C.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>No Image Formation:</strong> The reflected rays are parallel and never converge. No real or virtual image is formed.</span>
                            )}
                          </div>
                          
                          {/* Controls */}
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                              disabled={rayDiagramStep === 0}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setRayDiagramStep(Math.min(3, rayDiagramStep + 1))}
                              disabled={rayDiagramStep === 3}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDiagram === 5 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 5: Object Inside F (Concave)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="650" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="580" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Mirror surface - concave */}
                            <path d="M 490 20 A 150 150 0 0 1 490 180" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            
                            {/* Center of curvature */}
                            <circle cx="350" cy="100" r="3" fill="#333" />
                            <text x="350" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                            
                            {/* Focal point */}
                            <circle cx="425" cy="100" r="3" fill="#FF6B6B" />
                            <text x="425" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) inside F */}
                            <g>
                              <line x1="460" y1="100" x2="460" y2="70" stroke="#000" strokeWidth="3" />
                              <polygon points="457,73 460,70 463,73" fill="#000" />
                              <text x="460" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="460" y1="70" x2="505" y2="70" stroke="#3B82F6" strokeWidth="3" />
                                
                                {/* Reflected through focal point - diverging */}
                                <line x1="505" y1="70" x2="350" y2="125" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                                
                                {/* Virtual extension behind mirror */}
                                <line x1="505" y1="70" x2="660" y2="-0" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Toward focal point (Green) */}
                                <line x1="460" y1="70" x2="494" y2="40" stroke="#22C55E" strokeWidth="3" />
                                {/* Extension showing ray passes through F */}
                                <line x1="460" y1="70" x2="355" y2="160" stroke="#22C55E" strokeWidth="3" />
                                
                                {/* Reflected parallel to axis */}
                                <line x1="494" y1="40" x2="50" y2="40" stroke="#22C55E" strokeWidth="3" strokeDasharray="5,5" />
                                
                                {/* Virtual extension behind mirror */}
                                <line x1="494" y1="40" x2="600" y2="40" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of curvature (Purple) */}
                                <line x1="505" y1="58" x2="50" y2="180" stroke="#A855F7" strokeWidth="3" />
                                
                                {/* Virtual extension behind mirror */}
                                <line x1="500" y1="60" x2="600" y2="30" stroke="#A855F7" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Virtual image formation - behind mirror, upright and larger */}
                                <g>
                                  <line x1="570" y1="100" x2="570" y2="40" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="3,3" opacity="0.7" />
                                  <polygon points="567,43 570,40 573,43" fill="#FF6B6B" opacity="0.7" />
                                  <text x="580" y="140" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Virtual Image</text>
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Step explanation */}
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed inside the focal point. This creates a virtual, upright, magnified image.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong>Ray 1 (Blue):</strong> The ray parallel to the principal axis reflects through the focal point and diverges.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong>Ray 2 (Green):</strong> The ray aimed toward the focal point reflects parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>Ray 3 (Purple):</strong> The ray through the center of curvature reflects back along the same path.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The reflected rays diverge. Extending them backward shows they appear to come from a <strong>virtual</strong>, <strong>upright</strong>, <strong>magnified</strong> image behind the mirror.</span>
                            )}
                          </div>
                          
                          {/* Controls */}
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                              disabled={rayDiagramStep === 0}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setRayDiagramStep(Math.min(4, rayDiagramStep + 1))}
                              disabled={rayDiagramStep === 4}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                    
                    {selectedDiagram === 6 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 6: Any Position (Convex)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 700 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="650" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="580" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Mirror surface - convex */}
                            <path d="M 400 20 A 150 150 0 0 0 400 180" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            
                            {/* Center of curvature (virtual, behind mirror) */}
                            <circle cx="550" cy="100" r="3" fill="#333" strokeDasharray="3,3" />
                            <text x="550" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">C</text>
                            
                            {/* Focal point (virtual, behind mirror) */}
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" strokeDasharray="3,3" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) on left side */}
                            <g>
                              <line x1="200" y1="100" x2="200" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="197,53 200,50 203,53" fill="#000" />
                              <text x="200" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="200" y1="50" x2="385" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                
                                {/* Reflected - appears to come from F */}
                                <line x1="385" y1="50" x2="50" y2="-150" stroke="#3B82F6" strokeWidth="3" strokeDasharray="5,5" />
                                
                                {/* Virtual extension from F to mirror */}
                                <line x1="475" y1="100" x2="385" y2="50" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Toward focal point (Green) */}
                                <line x1="200" y1="50" x2="380" y2="83" stroke="#22C55E" strokeWidth="3" />
                              
                                {/* Reflected parallel to axis */}
                                <line x1="380" y1="83" x2="50" y2="83" stroke="#22C55E" strokeWidth="3" strokeDasharray="5,5" />
                                
                                {/* Virtual extension showing path to F */}
                                <line x1="380" y1="83" x2="475" y2="100" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                                {/* Virtual extension showing path to F */}
                                <line x1="510" y1="83" x2="380" y2="83" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                              
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Toward center of curvature (Purple) */}
                                <line x1="200" y1="50" x2="383" y2="73" stroke="#A855F7" strokeWidth="3" />
                                
                                {/* Reflected back */}
                                <line x1="100" y1="38" x2="383" y2="73" stroke="#A855F7" strokeWidth="3" strokeDasharray="5,5" />
                                
                                {/* Virtual extension through C */}
                                <line x1="383" y1="73" x2="550" y2="100" stroke="#A855F7" strokeWidth="2" strokeDasharray="3,3" opacity="0.5" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Virtual image formation - behind mirror, upright and smaller */}
                                <g>
                                  <line x1="445" y1="100" x2="445" y2="85" stroke="#FF6B6B" strokeWidth="3" strokeDasharray="3,3" opacity="0.7" />
                                  <polygon points="442,85 445,80 448,85" fill="#FF6B6B" opacity="0.7" />
                                  <text x="430" y="115" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">Virtual Image</text>
                                
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Step explanation */}
                          <div className="bg-gray-50 p-4 rounded text-sm">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed in front of a convex mirror. The image will always be virtual, upright, and diminished.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong>Ray 1 (Blue):</strong> The ray parallel to the principal axis reflects as if coming from the virtual focal point F.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong>Ray 2 (Green):</strong> The ray aimed toward the virtual focal point reflects parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>Ray 3 (Purple):</strong> The ray aimed toward the virtual center of curvature reflects back along the same angle.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The reflected rays diverge. Extending them backward shows a <strong>virtual</strong>, <strong>upright</strong>, <strong>diminished</strong> image behind the mirror.</span>
                            )}
                          </div>
                          
                          {/* Controls */}
                          <div className="flex justify-center space-x-3">
                            <button
                              onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                              disabled={rayDiagramStep === 0}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Previous
                            </button>
                            <button
                              onClick={() => setRayDiagramStep(Math.min(4, rayDiagramStep + 1))}
                              disabled={rayDiagramStep === 4}
                              className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                            >
                              Next
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Drawing Tips Section */}
                <div className="mt-6 bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h5 className="font-semibold text-gray-700 mb-3">✏️ Quick Drawing Tips</h5>
                  
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <strong>Always use a ruler</strong> for drawing light rays - even small inaccuracies can lead to the wrong image location</li>
                    <li>• <strong>Make your diagrams large</strong> - it's much easier to be accurate with bigger drawings</li>
                    <li>• <strong>Use dashed lines for virtual rays</strong> - any ray or image behind the mirror should be dashed to show it's virtual</li>
                  </ul>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Image Formation</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Sign Conventions and Calculations Section */}
        {AIAccordion ? (
        <AIAccordion theme="green">
          <AIAccordion.Item 
            title="Sign Conventions and Mirror Calculations" 
            value="sign-conventions-and-mirror-calculations" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="mb-4">
                  As we saw above, real images exist in real space and are always inverted, while virtual
                  images exist as images "within" the mirror and are always erect. In order to use the
                  equations properly it is necessary to have the proper signs for each variable. The
                  proper signs for each kind of image, object and mirror is given below.
                </p>

                {/* Sign Convention Table */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="font-semibold text-gray-700 mb-3">Sign Conventions</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="mb-3">
                        <span className="font-semibold text-gray-700">f (focal length):</span>
                        <ul className="ml-4 mt-1 text-sm">
                          <li>• (+) for concave mirror</li>
                          <li>• (−) for convex mirror</li>
                        </ul>
                      </div>
                      <div className="mb-3">
                        <span className="font-semibold text-gray-700">d<sub>o</sub> (object distance):</span>
                        <ul className="ml-4 mt-1 text-sm">
                          <li>• always (+)</li>
                        </ul>
                      </div>
                      <div className="mb-3">
                        <span className="font-semibold text-gray-700">d<sub>i</sub> (image distance):</span>
                        <ul className="ml-4 mt-1 text-sm">
                          <li>• (+) for a real image</li>
                          <li>• (−) for a virtual image</li>
                        </ul>
                      </div>
                    </div>
                    <div>
                      <div className="mb-3">
                        <span className="font-semibold text-gray-700">h<sub>o</sub> (object height):</span>
                        <ul className="ml-4 mt-1 text-sm">
                          <li>• always (+)</li>
                        </ul>
                      </div>
                      <div className="mb-3">
                        <span className="font-semibold text-gray-700">h<sub>i</sub> (image height):</span>
                        <ul className="ml-4 mt-1 text-sm">
                          <li>• (+) for a virtual image</li>
                          <li>• (−) for a real image</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Reference Box */}
                <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong className="text-blue-800">Virtual image:</strong>
                      <ul className="ml-4 mt-1">
                        <li>⇒ d<sub>i</sub> is negative</li>
                        <li>⇒ always erect</li>
                      </ul>
                    </div>
                    <div>
                      <strong className="text-blue-800">Real image:</strong>
                      <ul className="ml-4 mt-1">
                        <li>⇒ d<sub>i</sub> is positive</li>
                        <li>⇒ always inverted</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Sign Conventions and Mirror Calculations</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example Problem Section */}
        {AIAccordion ? (
        <AIAccordion theme="green">
          <AIAccordion.Item 
            title="Example 1: Converging Mirror Problem" 
            value="example-1-converging-mirror-problem" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 5.0 cm tall object is placed 60 cm away from a converging mirror that has an 80 cm
                  radius of curvature. Describe the image formed.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given information:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Object height: h<sub>o</sub> = 5.0 cm</li>
                        <li>Object distance: d<sub>o</sub> = 60 cm</li>
                        <li>Radius of curvature: R = 80 cm</li>
                        <li>Mirror type: converging (concave)</li>
                      </ul>
                    </li>
                    
                    <li>
                      <strong>Find the focal length:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"f = \\frac{R}{2} = \\frac{80\\text{ cm}}{2} = +40\\text{ cm}"}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">The focal length is positive for a converging mirror.</p>
                    </li>
                    
                    <li>
                      <strong>Apply the mirror equation:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Substituting known values:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{40} = \\frac{1}{60} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Solving for d<sub>i</sub>:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{d_i} = \\frac{1}{40} - \\frac{1}{60} = \\frac{3-2}{120} = \\frac{1}{120}"}</BlockMath>
                        <BlockMath>{"d_i = +120\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate magnification:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"m = -\\frac{d_i}{d_o} = -\\frac{120}{60} = -2"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find image height:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"h_i = m \\times h_o = (-2) \\times (5.0\\text{ cm}) = -10\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 mb-2">Answer:</p>
                    <p className="text-gray-700">
                      The image is <strong>real</strong> (d<sub>i</sub> = +120 cm), <strong>inverted</strong> (h<sub>i</sub> = -10 cm), 
                      and <strong>magnified</strong> (2× larger than the object). The image is located 120 cm from the mirror.
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 1: Converging Mirror Problem</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Example 2 Problem Section */}
        {AIAccordion ? (
        <AIAccordion theme="green">
          <AIAccordion.Item 
            title="Example 2: Diverging Mirror Problem" 
            value="example-2-diverging-mirror-problem" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 5.0 cm tall object is placed 60 cm away from a diverging mirror that has an 80 cm
                  radius of curvature. Describe the image formed.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given information:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Object height: h<sub>o</sub> = 5.0 cm</li>
                        <li>Object distance: d<sub>o</sub> = 60 cm</li>
                        <li>Radius of curvature: R = 80 cm</li>
                        <li>Mirror type: diverging (convex)</li>
                      </ul>
                    </li>
                    
                    <li>
                      <strong>Find the focal length:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"f = \\frac{R}{2} = \\frac{80\\text{ cm}}{2} = 40\\text{ cm}"}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">For a diverging mirror, the focal length is negative:</p>
                      <div className="text-center">
                        <BlockMath>{"f = -40\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Apply the mirror equation:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Substituting known values:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{-40} = \\frac{1}{60} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Solving for d<sub>i</sub>:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{d_i} = \\frac{1}{-40} - \\frac{1}{60} = \\frac{-3-2}{120} = \\frac{-5}{120} = \\frac{-1}{24}"}</BlockMath>
                        <BlockMath>{"d_i = -24\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate magnification:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"m = -\\frac{d_i}{d_o} = -\\frac{(-24)}{60} = +0.4"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find image height:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"h_i = m \\times h_o = (0.4) \\times (5.0\\text{ cm}) = 2.0\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 mb-2">Answer:</p>
                    <p className="text-gray-700">
                      The negative d<sub>i</sub> means that the image is <strong>virtual</strong> and <strong>erect</strong>. 
                      (All virtual images are erect.) The image is 2.0 cm tall, i.e., <strong>diminished</strong> (0.4× the size of the object). 
                      The virtual image is located 24 cm behind the mirror.
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 2: Diverging Mirror Problem</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Curved Mirrors Practice Questions */}
        <SlideshowKnowledgeCheck
          courseId={effectiveCourseId}
          lessonPath="11-curved-mirrors"
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_11_concave_mirror_image_distance',
              title: 'Question 1: Concave Mirror - Image Distance'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_concave_mirror_image_size',
              title: 'Question 2: Concave Mirror - Image Size'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_concave_mirror_image_description',
              title: 'Question 3: Concave Mirror - Image Properties'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_convex_mirror_image_distance',
              title: 'Question 4: Convex Mirror - Image Distance'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_convex_mirror_image_size',
              title: 'Question 5: Convex Mirror - Image Size'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_convex_mirror_image_description',
              title: 'Question 6: Convex Mirror - Image Properties'
            }
          ]}
          onComplete={(score, results) => console.log(`Curved Mirrors Knowledge Check completed with ${score}%`)}
          theme="green"
        />

        {/* Example 3 Problem Section */}
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 3: Finding Mirror Type and Focal Length" 
            value="example-3-finding-mirror-type-and-focal-length" 
            onAskAI={onAIAccordionContent}
          >
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  The erect image of an object is one-third the size of the object. If the object is 20 cm
                  from the mirror, what kind of mirror is it and what is the focal length?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given information:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Image is erect (upright)</li>
                        <li>Image size is 1/3 of object size</li>
                        <li>Object distance: d<sub>o</sub> = 20 cm</li>
                      </ul>
                    </li>
                    
                    <li>
                      <strong>Determine mirror type:</strong>
                      <p className="mt-2">The image is erect (i.e., virtual) and smaller (i.e., d<sub>i</sub> is less than d<sub>o</sub>). 
                      The only way this can happen is with a <strong>convex (diverging) mirror</strong>.</p>
                      <p className="text-sm text-gray-600 mt-1">Note: A virtual image is always larger for a concave 
                      (converging) mirror and is always smaller for a convex (diverging) mirror.</p>
                    </li>
                    
                    <li>
                      <strong>Find magnification:</strong>
                      <p className="mt-2">Since the image is 1/3 the size of the object and erect:</p>
                      <div className="mt-2 text-center">
                        <BlockMath>{"m = +\\frac{1}{3}"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate image distance:</strong>
                      <p className="mt-2">Using the magnification formula:</p>
                      <div className="mt-2 text-center">
                        <BlockMath>{"m = -\\frac{d_i}{d_o}"}</BlockMath>
                      </div>
                      <p className="mt-2">Substituting known values:</p>
                      <div className="text-center">
                        <BlockMath>{"+\\frac{1}{3} = -\\frac{d_i}{20}"}</BlockMath>
                      </div>
                      <p className="mt-2">Solving for d<sub>i</sub>:</p>
                      <div className="text-center">
                        <BlockMath>{"d_i = -\\frac{20}{3} = -6.67\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate focal length:</strong>
                      <p className="mt-2">Using the mirror equation:</p>
                      <div className="mt-2 text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Substituting known values:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{20} + \\frac{1}{-6.67} = \\frac{1}{20} - \\frac{3}{20} = \\frac{1-3}{20} = \\frac{-2}{20}"}</BlockMath>
                      </div>
                      <p className="mt-2">Therefore:</p>
                      <div className="text-center">
                        <BlockMath>{"f = -10\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 mb-2">Answer:</p>
                    <p className="text-gray-700">
                      The mirror is a <strong>diverging (convex) mirror</strong> with a focal length of <strong>f = -10 cm</strong>.
                    </p>
                  </div>
                </div>
              </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 3: Finding Mirror Type and Focal Length</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete problem solution and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}

        {/* Slideshow Knowledge Check - Additional Practice Questions */}
        <SlideshowKnowledgeCheck
          courseId={effectiveCourseId}
          lessonPath="11-curved-mirrors"
          title="Curved Mirrors Practice - Questions 7-17"
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_11_mirror_type_erect_80cm',
              title: 'Question 7: Mirror Type Identification'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_mirror_type_identification_erect',
              title: 'Question 8: Mirror Type Properties'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_mirror_radius_inverted_120cm',
              title: 'Question 9: Mirror Radius Calculation'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_mirror_type_inverted_120cm',
              title: 'Question 10: Mirror Type from Image'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_convex_mirror_radius_20cm',
              title: 'Question 11: Convex Mirror Distance'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_convex_mirror_type_identification',
              title: 'Question 12: Mirror Type Characteristics'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_object_movement_image_size',
              title: 'Question 13: Object Movement Effects'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_object_movement_image_size_change',
              title: 'Question 14: Object Movement - Size Change'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_concave_mirror_3x_inverted_distance',
              title: 'Question 15: Concave Mirror - 3x Inverted Image'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_concave_mirror_2x_erect_distance',
              title: 'Question 16: Concave Mirror - 2x Erect Image'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_11_convex_mirror_one_sixth_distance',
              title: 'Question 17: Convex Mirror - 1/6 Size Image'
            }
          ]}
          onComplete={(score, results) => console.log(`Curved Mirrors Extended Practice completed with ${score}%`)}
          theme="blue"
        />
      </TextSection>

      <LessonSummary
        points={[
          "Plane mirrors always produce virtual images that exist 'inside' the mirror",
          "Virtual images cannot be projected onto a screen",
          "Real images can be projected onto a screen outside the mirror",
          "Spherical mirrors obey the law of reflection with the normal being the radius",
          "Spherical mirrors come in two types: converging (concave) and diverging (convex)",
          "Concave mirrors can produce both real and virtual images and are used in telescopes, headlights, and shaving mirrors",
          "Convex mirrors always produce virtual, upright, diminished images and are used in vehicle side mirrors and security mirrors",
          "Three key rays are used for ray diagrams: parallel ray, focal ray, and center ray",
          "Image formation depends on mirror type, focal length, and object distance"
        ]}
      />
    </LessonContent>
  );
};

export default CurvedMirrors;
