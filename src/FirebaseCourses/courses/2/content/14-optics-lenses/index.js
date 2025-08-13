import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../../context/AuthContext';
import { getFunctions } from 'firebase/functions';
import { getDatabase } from 'firebase/database';
import LessonContent, { TextSection, MediaSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

/**
 * Lesson 9 - Optics: Lenses
 * Covers converging and diverging lenses, refraction in lenses, and lens equations
 */
const OpticsLenses = ({ course, courseId = '2', onPrepopulateMessage, createAskAIButton, createAskAIButtonFromElement,
AIAccordion, onAIAccordionContent }) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  // Ray diagram animation states
  const [rayDiagramStep, setRayDiagramStep] = useState(0); // Current step in animation (0-4)
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


  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <LessonContent
      lessonId="lesson_1747281791046_109"
      title="Lesson 9 - Optics: Lenses"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            <em>Refer to Pearson pages 677 to 681.</em>
          </p>
        </div>

        {/* Lens Basics and Refraction Section */}
        {AIAccordion ? (
          <div className="mb-6">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="lens-basics" title="Lens Basics and Refraction" theme="blue" onAskAI={onAIAccordionContent}>
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                  <p className="mb-4">
                    A study of lenses is very similar to that of curved mirrors. However, while mirrors 
                    involve reflection, lenses involve refraction. In fact, for lenses there are two refractions 
                    – one when the light ray enters the lens and one when the light ray exits the lens.
                  </p>

                  {/* Convex Lens Section */}
                  <div className="mt-6 bg-white p-4 rounded border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-3">Converging (Convex) Lenses</h4>
                    
                    <div className="mb-4">
                      <p className="mb-3">
                        Note that for a convex lens like the one depicted below, the light ray is bent toward the 
                        principle axis twice, while for a concave lens the light ray is bent away from the principle 
                        axis.
                      </p>
                      
                      <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Key Points about Convex Lenses:</strong>
                          <br />• Light passes through two surfaces, getting refracted at each
                          <br />• The shape causes light rays to converge (come together)
                          <br />• Thicker in the middle than at the edges
                          <br />• Creates real focal points where light actually converges
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-2">Understanding the Two Refractions:</p>
                      <p className="text-sm text-gray-600">
                        Using the law of refraction, can you explain refraction 1 and refraction 2?
                      </p>
                    </div>
                  </div>

                  {/* Concave Lens Section */}
                  <div className="mt-6 bg-white p-4 rounded border border-gray-300">
                    <h4 className="font-semibold text-gray-800 mb-3">Diverging (Concave) Lenses</h4>
                    
                    <div className="mb-4">
                      <p className="mb-3">
                        Convex lenses are converging lenses, and concave lenses are diverging lenses.
                      </p>
                      
                      <div className="bg-blue-50 p-4 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>Key Points about Concave Lenses:</strong>
                          <br />• Light rays diverge (spread apart) after passing through
                          <br />• Thinner in the middle than at the edges
                          <br />• Creates virtual focal points (light appears to come from these points)
                          <br />• Always produces virtual, upright, diminished images
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-gray-100 rounded">
                      <p className="text-sm font-medium text-gray-700 mb-2">Critical Thinking:</p>
                      <p className="text-sm text-gray-600">
                        Using the law of refraction, can you explain the refractions for a diverging lens?
                      </p>
                    </div>
                  </div>

                  {/* Summary Box */}
                  <div className="mt-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
                    <h5 className="font-semibold text-gray-700 mb-2">Quick Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong className="text-gray-800">Converging Lens (Convex):</strong>
                        <ul className="ml-4 mt-1">
                          <li>• Brings light rays together</li>
                          <li>• Can form real or virtual images</li>
                          <li>• Used in magnifying glasses, cameras</li>
                        </ul>
                      </div>
                      <div>
                        <strong className="text-gray-800">Diverging Lens (Concave):</strong>
                        <ul className="ml-4 mt-1">
                          <li>• Spreads light rays apart</li>
                          <li>• Only forms virtual images</li>
                          <li>• Used in eyeglasses for nearsightedness</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">AI Accordion component not available. Content hidden.</p>
          </div>
        )}

        {/* Ray Diagrams and Lens Equations Section */}
        {AIAccordion ? (
          <div className="mb-6">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="ray-diagrams" title="Ray Diagrams and Lens Equations" theme="blue" onAskAI={onAIAccordionContent}>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                
                {/* Ray Diagram Rules for Converging Lenses */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Ray Diagram Rules - Converging Lenses</h4>
                  
                  <div className="bg-white p-4 rounded border border-gray-300">
                    <ol className="list-decimal pl-6 space-y-3 text-sm">
                      <li>
                        <strong className="text-blue-600">Ray 1:</strong> travels from the object parallel to the principal axis. In passing 
                        through the lens, the ray is refracted to the real focal point on the other side of the lens.
                      </li>
                      <li>
                        <strong className="text-green-600">Ray 2:</strong> travels through the virtual focal point and is then refracted by the 
                        lens to emerge parallel to the principal axis.
                      </li>
                      <li>
                        <strong className="text-purple-600">Ray 3:</strong> travels through the centre of the thin lens straight through.
                      </li>
                    </ol>
                    
                    <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> These three rays are sufficient to locate the image. The intersection 
                        point of any two rays determines the image location.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ray Diagram Rules for Diverging Lenses */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Ray Diagram Rules - Diverging Lenses</h4>
                  
                  <div className="bg-white p-4 rounded border border-gray-300">
                    <ol className="list-decimal pl-6 space-y-3 text-sm">
                      <li>
                        <strong className="text-blue-600">Ray 1:</strong> travels from the object parallel to the principal axis. In 
                        passing through the lens, the ray is refracted away from the virtual focal point of the lens.
                      </li>
                      <li>
                        <strong className="text-green-600">Ray 2:</strong> travels from the object toward the real focal point. It 
                        then emerges parallel to the principal axis.
                      </li>
                      <li>
                        <strong className="text-purple-600">Ray 3:</strong> travels through the centre of the thin lens straight through.
                      </li>
                    </ol>
                  </div>
                </div>

                {/* Lens Equations */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Lens Equations</h4>
                  
                  <div className="bg-white p-4 rounded border border-gray-300">
                    <p className="mb-4">
                      The equations used for calculating the position of an image from a lens are identical to 
                      the equations for mirrors.
                    </p>
                    
                    <div className="bg-gray-100 p-4 rounded">
                      <div className="text-center mb-4">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      
                      <div className="text-center mb-4">
                        <BlockMath>{"m = -\\frac{d_i}{d_o} = \\frac{h_i}{h_o}"}</BlockMath>
                      </div>
                      
                      <div className="mt-4 text-sm">
                        <p className="font-medium mb-2">Where:</p>
                        <ul className="space-y-1">
                          <li>• <InlineMath>{"f"}</InlineMath> = focal length – real (+), virtual (–)</li>
                          <li>• <InlineMath>{"d_o"}</InlineMath> = distance from lens to the object</li>
                          <li>• <InlineMath>{"d_i"}</InlineMath> = distance from the lens to the image – real (–), virtual (+)</li>
                          <li>• <InlineMath>{"h_o"}</InlineMath> = height of object</li>
                          <li>• <InlineMath>{"h_i"}</InlineMath> = height of image – real, inverted (–), virtual, upright (+)</li>
                          <li>• <InlineMath>{"m"}</InlineMath> = magnification</li>
                        </ul>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-sm text-yellow-800">
                        <strong>Important Note:</strong> While the equations for curved mirrors and thin lenses are 
                        the same, it is important to note that real images form in front of a mirror and real images 
                        form behind a lens. This is due to the fact that mirrors reflect light back while lenses 
                        refract light through to the other side of the lens.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Ray Diagrams */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-800 mb-3">Interactive Ray Diagrams for Lenses</h4>
                  
                  {/* Diagram Selector Buttons */}
                  <div className="flex flex-wrap gap-2 mb-6 justify-center">
                    {[
                      { id: 1, title: "Object Beyond 2F' (Converging)" },
                      { id: 2, title: "Object at 2F' (Converging)" },
                      { id: 3, title: "Object Between F' and 2F' (Converging)" },
                      { id: 4, title: "Object at F' (Converging)" },
                      { id: 5, title: "Object Between Lens and F' (Converging)" },
                      { id: 6, title: "Object Beyond F (Diverging)" }
                    ].map(case_ => (
                      <button
                        key={case_.id}
                        onClick={() => {
                          setSelectedDiagram(case_.id);
                          setRayDiagramStep(0);
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

                  {/* Key Ray Information */}
                  <div className="mb-4 p-3 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-blue-800 font-medium mb-2">Key Ray Information:</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                      <div><span className="text-blue-600 font-semibold">Blue Ray:</span> Parallel to principal axis</div>
                      <div><span className="text-green-600 font-semibold">Green Ray:</span> Through focal point</div>
                      <div><span className="text-purple-600 font-semibold">Purple Ray:</span> Through center of lens</div>
                    </div>
                  </div>

                  {/* Interactive SVG Ray Diagram */}
                  <div className="bg-white p-6 rounded-lg border border-gray-200">
                    {selectedDiagram === 1 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 1: Object Beyond 2F' (Converging Lens)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 800 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="750" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="680" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Lens - converging (convex) */}
                            <ellipse cx="400" cy="100" rx="8" ry="60" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            <polygon points="392,40 392,44 408,44 408,40" fill="#4A4A4A" />
                            <polygon points="392,156 392,160 408,160 408,156" fill="#4A4A4A" />
                            
                            {/* 2F' points */}
                            <circle cx="250" cy="100" r="3" fill="#333" />
                            <text x="250" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F'</text>
                            <circle cx="550" cy="100" r="3" fill="#333" />
                            <text x="550" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F</text>
                            
                            {/* Focal points */}
                            <circle cx="325" cy="100" r="3" fill="#FF6B6B" />
                            <text x="325" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F'</text>
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) beyond 2F' */}
                            <g>
                              <line x1="150" y1="100" x2="150" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="147,53 150,50 153,53" fill="#000" />
                              <text x="150" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {/* Step-by-step ray drawing */}
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="150" y1="50" x2="400" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                {/* Refracted through focal point */}
                                <line x1="400" y1="50" x2="475" y2="100" stroke="#3B82F6" strokeWidth="3" />
                                <line x1="475" y1="100" x2="600" y2="175" stroke="#3B82F6" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through focal point F' (Green) */}
                                <line x1="150" y1="50" x2="325" y2="100" stroke="#22C55E" strokeWidth="3" />
                                <line x1="325" y1="100" x2="400" y2="125" stroke="#22C55E" strokeWidth="3" />
                                {/* Emerges parallel to axis */}
                                <line x1="400" y1="125" x2="750" y2="125" stroke="#22C55E" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of lens (Purple) */}
                                <line x1="150" y1="50" x2="400" y2="100" stroke="#A855F7" strokeWidth="3" />
                                <line x1="400" y1="100" x2="650" y2="150" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Image formation */}
                                <g>
                                  <line x1="520" y1="100" x2="520" y2="125" stroke="#FF0000" strokeWidth="3" />
                                  <polygon points="517,122 520,125 523,122" fill="#FF0000" />
                                  <text x="520" y="140" fontSize="12" fill="#FF0000" textAnchor="middle" fontWeight="bold">Image</text>
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Dynamic description based on step */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed beyond 2F' (two focal lengths from the lens). The object is farther from the lens than 2F'.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong className="text-blue-600">Ray 1 (Blue):</strong> The ray parallel to the principal axis refracts through the focal point F on the opposite side.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong className="text-green-600">Ray 2 (Green):</strong> The ray through focal point F' refracts to emerge parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong className="text-purple-600">Ray 3 (Purple):</strong> The ray through the center of the lens passes straight through without deviation.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The rays converge between F and 2F, forming a <strong>real</strong>, <strong>inverted</strong> image that is <strong>smaller</strong> than the object.</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedDiagram === 2 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 2: Object at 2F' (Converging Lens)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 800 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="750" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="680" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Lens - converging (convex) */}
                            <ellipse cx="400" cy="100" rx="8" ry="60" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            <polygon points="392,40 392,44 408,44 408,40" fill="#4A4A4A" />
                            <polygon points="392,156 392,160 408,160 408,156" fill="#4A4A4A" />
                            
                            {/* 2F' points */}
                            <circle cx="250" cy="100" r="3" fill="#333" />
                            <text x="250" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F'</text>
                            <circle cx="550" cy="100" r="3" fill="#333" />
                            <text x="550" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F</text>
                            
                            {/* Focal points */}
                            <circle cx="325" cy="100" r="3" fill="#FF6B6B" />
                            <text x="325" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F'</text>
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) at 2F' */}
                            <g>
                              <line x1="250" y1="100" x2="250" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="247,53 250,50 253,53" fill="#000" />
                              <text x="250" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {/* Step-by-step ray drawing */}
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="250" y1="50" x2="400" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                {/* Refracted through focal point */}
                                <line x1="400" y1="50" x2="475" y2="100" stroke="#3B82F6" strokeWidth="3" />
                                <line x1="475" y1="100" x2="550" y2="150" stroke="#3B82F6" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through focal point F' (Green) */}
                                <line x1="250" y1="50" x2="325" y2="100" stroke="#22C55E" strokeWidth="3" />
                                <line x1="325" y1="100" x2="400" y2="150" stroke="#22C55E" strokeWidth="3" />
                                {/* Emerges parallel to axis */}
                                <line x1="400" y1="150" x2="750" y2="150" stroke="#22C55E" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of lens (Purple) */}
                                <line x1="250" y1="50" x2="400" y2="100" stroke="#A855F7" strokeWidth="3" />
                                <line x1="400" y1="100" x2="550" y2="150" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Image formation - same size as object, at 2F */}
                                <g>
                                  <line x1="550" y1="100" x2="550" y2="150" stroke="#FF0000" strokeWidth="3" />
                                  <polygon points="547,147 550,150 553,147" fill="#FF0000" />
                                  <text x="550" y="165" fontSize="12" fill="#FF0000" textAnchor="middle" fontWeight="bold">Image</text>
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Dynamic description based on step */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed exactly at 2F' (two focal lengths from the lens). This is a special case that produces a same-size image.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong className="text-blue-600">Ray 1 (Blue):</strong> The ray parallel to the principal axis refracts through the focal point F on the opposite side.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong className="text-green-600">Ray 2 (Green):</strong> The ray through focal point F' refracts to emerge parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong className="text-purple-600">Ray 3 (Purple):</strong> The ray through the center of the lens passes straight through without deviation.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The rays converge exactly at 2F, forming a <strong>real</strong>, <strong>inverted</strong> image that is the <strong>same size</strong> as the object.</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedDiagram === 3 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 3: Object Between F' and 2F' (Converging Lens)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 800 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="750" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="680" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Lens - converging (convex) */}
                            <ellipse cx="400" cy="100" rx="8" ry="60" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            <polygon points="392,40 392,44 408,44 408,40" fill="#4A4A4A" />
                            <polygon points="392,156 392,160 408,160 408,156" fill="#4A4A4A" />
                            
                            {/* 2F' points */}
                            <circle cx="250" cy="100" r="3" fill="#333" />
                            <text x="250" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F'</text>
                            <circle cx="550" cy="100" r="3" fill="#333" />
                            <text x="550" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F</text>
                            
                            {/* Focal points */}
                            <circle cx="325" cy="100" r="3" fill="#FF6B6B" />
                            <text x="325" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F'</text>
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) between F' and 2F' */}
                            <g>
                              <line x1="290" y1="100" x2="290" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="287,53 290,50 293,53" fill="#000" />
                              <text x="290" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {/* Step-by-step ray drawing */}
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="290" y1="50" x2="400" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                {/* Refracted through focal point */}
                                <line x1="400" y1="50" x2="475" y2="100" stroke="#3B82F6" strokeWidth="3" />
                                <line x1="475" y1="100" x2="650" y2="225" stroke="#3B82F6" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Through focal point F' (Green) */}
                                <line x1="290" y1="50" x2="325" y2="100" stroke="#22C55E" strokeWidth="3" />
                                <line x1="325" y1="100" x2="400" y2="185" stroke="#22C55E" strokeWidth="3" />
                                {/* Emerges parallel to axis */}
                                <line x1="400" y1="185" x2="750" y2="185" stroke="#22C55E" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of lens (Purple) */}
                                <line x1="290" y1="50" x2="400" y2="100" stroke="#A855F7" strokeWidth="3" />
                                <line x1="400" y1="100" x2="625" y2="197" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Image formation - magnified, beyond 2F */}
                                <g>
                                  <line x1="595" y1="100" x2="595" y2="185" stroke="#FF0000" strokeWidth="3" />
                                  <polygon points="592,182 595,185 598,182" fill="#FF0000" />
                                  <text x="595" y="200" fontSize="12" fill="#FF0000" textAnchor="middle" fontWeight="bold">Image</text>
                                </g>
                              </>
                            )}
                          </svg>
                          
                          {/* Dynamic description based on step */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed between F' and 2F' (closer to the lens than 2F' but farther than F'). This creates a magnified real image.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong className="text-blue-600">Ray 1 (Blue):</strong> The ray parallel to the principal axis refracts through the focal point F on the opposite side.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong className="text-green-600">Ray 2 (Green):</strong> The ray through focal point F' refracts to emerge parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong className="text-purple-600">Ray 3 (Purple):</strong> The ray through the center of the lens passes straight through without deviation.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The rays converge beyond 2F, forming a <strong>real</strong>, <strong>inverted</strong> image that is <strong>larger</strong> than the object (magnified).</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedDiagram === 4 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 4: Object at F' (Converging Lens)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 800 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="750" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="680" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Lens - converging (convex) */}
                            <ellipse cx="400" cy="100" rx="8" ry="60" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            <polygon points="392,40 392,44 408,44 408,40" fill="#4A4A4A" />
                            <polygon points="392,156 392,160 408,160 408,156" fill="#4A4A4A" />
                            
                            {/* 2F' points */}
                            <circle cx="250" cy="100" r="3" fill="#333" />
                            <text x="250" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F'</text>
                            <circle cx="550" cy="100" r="3" fill="#333" />
                            <text x="550" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F</text>
                            
                            {/* Focal points */}
                            <circle cx="325" cy="100" r="3" fill="#FF6B6B" />
                            <text x="325" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F'</text>
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) at F' */}
                            <g>
                              <line x1="325" y1="100" x2="325" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="322,53 325,50 328,53" fill="#000" />
                              <text x="325" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {/* Step-by-step ray drawing */}
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="325" y1="50" x2="400" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                {/* Refracted through focal point - but continues parallel since object is at F' */}
                                <line x1="400" y1="50" x2="475" y2="100" stroke="#3B82F6" strokeWidth="3" />
                                <line x1="475" y1="100" x2="750" y2="270" stroke="#3B82F6" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 3: Through center of lens (Purple) */}
                                <line x1="325" y1="50" x2="400" y2="100" stroke="#A855F7" strokeWidth="3" />
                                <line x1="400" y1="100" x2="750" y2="350" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* No image formation - rays are parallel */}
                                <text x="600" y="60" fontSize="14" fill="#FF0000" textAnchor="middle" fontWeight="bold">No Image</text>
                                <text x="600" y="75" fontSize="12" fill="#FF0000" textAnchor="middle">(Rays are parallel)</text>
                              </>
                            )}
                          </svg>
                          
                          {/* Dynamic description based on step */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed exactly at the focal point F'. This is a special case where no real image is formed.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong className="text-blue-600">Ray 1 (Blue):</strong> The ray parallel to the principal axis refracts through focal point F, then continues in the same direction.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong className="text-purple-600">Ray 2 (Purple):</strong> The ray through the center of the lens passes straight through and diverges from the blue ray.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong>No Image Formation:</strong> When the object is at the focal point, the refracted rays emerge <strong>parallel</strong> and never converge. <strong>No real image</strong> is formed.</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedDiagram === 5 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 5: Object Between Lens and F' (Converging Lens)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 800 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="750" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="680" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Lens - converging (convex) */}
                            <ellipse cx="400" cy="100" rx="8" ry="60" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            <polygon points="392,40 392,44 408,44 408,40" fill="#4A4A4A" />
                            <polygon points="392,156 392,160 408,160 408,156" fill="#4A4A4A" />
                            
                            {/* 2F' points */}
                            <circle cx="250" cy="100" r="3" fill="#333" />
                            <text x="250" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F'</text>
                            <circle cx="550" cy="100" r="3" fill="#333" />
                            <text x="550" y="88" fontSize="12" fill="#333" textAnchor="middle" fontWeight="bold">2F</text>
                            
                            {/* Focal points */}
                            <circle cx="325" cy="100" r="3" fill="#FF6B6B" />
                            <text x="325" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F'</text>
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) between lens and F' - smaller object */}
                            <g>
                              <line x1="360" y1="100" x2="360" y2="70" stroke="#000" strokeWidth="3" />
                              <polygon points="357,73 360,70 363,73" fill="#000" />
                              <text x="360" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {/* Step-by-step ray drawing */}
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="360" y1="70" x2="400" y2="70" stroke="#3B82F6" strokeWidth="3" />
                                {/* Refracted through focal point */}
                                <line x1="400" y1="70" x2="475" y2="100" stroke="#3B82F6" strokeWidth="3" />
                                <line x1="475" y1="100" x2="600" y2="150" stroke="#3B82F6" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Toward focal point F' (Green) - but diverges */}
                                <line x1="360" y1="70" x2="400" y2="45" stroke="#22C55E" strokeWidth="3" />
                                {/* Emerges parallel to axis */}
                                <line x1="400" y1="45" x2="750" y2="45" stroke="#22C55E" strokeWidth="3" />
                                {/* Virtual ray extension toward F' */}
                                <line x1="360" y1="70" x2="325" y2="100" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center of lens (Purple) */}
                                <line x1="360" y1="70" x2="400" y2="100" stroke="#A855F7" strokeWidth="3" />
                                <line x1="400" y1="100" x2="520" y2="175" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Virtual image formation - magnified, upright, on same side */}
                                <g>
                                  <line x1="325" y1="100" x2="325" y2="40" stroke="#FF0000" strokeWidth="3" strokeDasharray="3,3" opacity="0.7" />
                                  <polygon points="322,43 325,40 328,43" fill="#FF0000" opacity="0.7" />
                                  <text x="290" y="30" fontSize="12" fill="#FF0000" textAnchor="middle" fontWeight="bold">Virtual Image</text>
                                </g>
                                {/* Virtual ray extensions */}
                                <line x1="400" y1="70" x2="290" y2="33" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                                <line x1="400" y1="45" x2="290" y2="45" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                                <line x1="400" y1="100" x2="290" y2="20" stroke="#A855F7" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                              </>
                            )}
                          </svg>
                          
                          {/* Dynamic description based on step */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed between the lens and focal point F' (closer to lens than F'). This creates a virtual, upright, magnified image.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong className="text-blue-600">Ray 1 (Blue):</strong> The ray parallel to the principal axis refracts through the focal point F on the opposite side.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong className="text-green-600">Ray 2 (Green):</strong> The ray aimed toward focal point F' emerges parallel to the principal axis after refraction.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong className="text-purple-600">Ray 3 (Purple):</strong> The ray through the center of the lens passes straight through without deviation.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Virtual Image Formation:</strong> The diverging rays appear to come from a point on the same side as the object, forming a <strong>virtual</strong>, <strong>upright</strong>, <strong>magnified</strong> image. This is how magnifying glasses work!</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {selectedDiagram === 6 && (
                      <>
                        <h4 className="font-semibold text-gray-800 mb-4 text-center">Case 6: Object Beyond F (Diverging Lens)</h4>
                        
                        <div className="space-y-4">
                          <svg width="100%" height="300" viewBox="0 0 800 200" className="border border-gray-300 bg-white rounded">
                            {/* Principal axis */}
                            <line x1="50" y1="100" x2="750" y2="100" stroke="#999" strokeWidth="2" strokeDasharray="5,5" />
                            <text x="680" y="85" fontSize="12" fill="#666" textAnchor="start">Principal axis</text>
                            
                            {/* Lens - diverging (concave) - same size as converging lens */}
                          
                            <path d="M 390 40 A 5 40 0 0 1 390 160" stroke="#4A4A4A" strokeWidth="4" fill="none" />
  
                            <path d="M 410 40 A 5 40 0 0 0 410 160" stroke="#4A4A4A" strokeWidth="4" fill="none" />
                            {/*<ellipse cx="400" cy="100" rx="8" ry="60" stroke="#4A4A4A" strokeWidth="4" fill="none" />*/}
                            <polygon points="392,40 392,44 408,44 408,40" fill="#4A4A4A" />
                            <polygon points="392,156 392,160 408,160 408,156" fill="#4A4A4A" />
                            
                            {/* Virtual focal points (diverging lens) */}
                            <circle cx="325" cy="100" r="3" fill="#FF6B6B" fillOpacity="0.5" />
                            <text x="325" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F'</text>
                            <circle cx="475" cy="100" r="3" fill="#FF6B6B" fillOpacity="0.5" />
                            <text x="475" y="88" fontSize="12" fill="#FF6B6B" textAnchor="middle" fontWeight="bold">F</text>
                            
                            {/* Object (arrow) */}
                            <g>
                              <line x1="200" y1="100" x2="200" y2="50" stroke="#000" strokeWidth="3" />
                              <polygon points="197,53 200,50 203,53" fill="#000" />
                              <text x="200" y="120" fontSize="12" fill="#000" textAnchor="middle" fontWeight="bold">Object</text>
                            </g>
                            
                            {/* Step-by-step ray drawing */}
                            {rayDiagramStep >= 1 && (
                              <>
                                {/* Ray 1: Parallel to principal axis (Blue) */}
                                <line x1="200" y1="50" x2="400" y2="50" stroke="#3B82F6" strokeWidth="3" />
                                {/* Diverges as if from F' */}
                                <line x1="400" y1="50" x2="550" y2="-30" stroke="#3B82F6" strokeWidth="3" />
                                {/* Virtual ray extension */}
                                <line x1="400" y1="50" x2="325" y2="100" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 2 && (
                              <>
                                {/* Ray 2: Toward F (Green) */}
                                <line x1="200" y1="50" x2="400" y2="87" stroke="#22C55E" strokeWidth="3" />
                                {/* Emerges parallel to axis */}
                                <line x1="400" y1="87" x2="750" y2="87" stroke="#22C55E" strokeWidth="3" />
                                {/* Virtual ray extension to F */}
                                <line x1="400" y1="87" x2="475" y2="100" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 3 && (
                              <>
                                {/* Ray 3: Through center (Purple) */}
                                <line x1="200" y1="50" x2="400" y2="100" stroke="#A855F7" strokeWidth="3" />
                                <line x1="400" y1="100" x2="600" y2="150" stroke="#A855F7" strokeWidth="3" />
                              </>
                            )}
                            
                            {rayDiagramStep >= 4 && (
                              <>
                                {/* Virtual image formation */}
                                <g>
                                  <line x1="345" y1="100" x2="345" y2="90" stroke="#FF0000" strokeWidth="3" strokeDasharray="3,3" opacity="0.7" />
                                  <polygon points="342,90 345,87 348,90" fill="#FF0000" opacity="0.7" />
                                  <text x="160" y="70" fontSize="12" fill="#FF0000" textAnchor="middle" fontWeight="bold">Virtual Image</text>
                                </g>
                                {/* Virtual ray extensions */}
                                {/*<line x1="400" y1="50" x2="160" y2="80" stroke="#3B82F6" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />*/}
                                <line x1="400" y1="87" x2="160" y2="87" stroke="#22C55E" strokeWidth="2" strokeDasharray="3,3" opacity="0.7" />
                              </>
                            )}
                          </svg>
                          
                          {/* Dynamic description based on step */}
                          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {rayDiagramStep === 0 && (
                              <span><strong>Setup:</strong> Object placed in front of a diverging lens. Diverging lenses always produce virtual images.</span>
                            )}
                            {rayDiagramStep === 1 && (
                              <span><strong className="text-blue-600">Ray 1 (Blue):</strong> The ray parallel to the principal axis diverges as if coming from the virtual focal point F'.</span>
                            )}
                            {rayDiagramStep === 2 && (
                              <span><strong className="text-green-600">Ray 2 (Green):</strong> The ray aimed toward focal point F emerges parallel to the principal axis.</span>
                            )}
                            {rayDiagramStep === 3 && (
                              <span><strong className="text-purple-600">Ray 3 (Purple):</strong> The ray through the center of the lens passes straight through without deviation.</span>
                            )}
                            {rayDiagramStep === 4 && (
                              <span><strong>Image Formation:</strong> The diverging rays appear to come from a point on the same side as the object, forming a <strong>virtual</strong>, <strong>upright</strong>, <strong>diminished</strong> image.</span>
                            )}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Placeholder message for other cases */}
                    {[].includes(selectedDiagram) && (
                      <div className="text-center p-8">
                        <p className="text-gray-600">Interactive diagram for Case {selectedDiagram} will be implemented next.</p>
                        <p className="text-sm text-gray-500 mt-2">This will show the ray diagram for the selected lens scenario.</p>
                      </div>
                    )}
                  </div>

                  {/* Controls */}
                  <div className="flex justify-center space-x-3 mt-4">
                    <button
                      onClick={() => setRayDiagramStep(Math.max(0, rayDiagramStep - 1))}
                      disabled={rayDiagramStep === 0}
                      className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                    >
                      Previous Step
                    </button>
                    <button
                      onClick={() => setRayDiagramStep(Math.min(selectedDiagram === 4 ? 3 : 4, rayDiagramStep + 1))}
                      disabled={selectedDiagram === 4 ? rayDiagramStep === 3 : rayDiagramStep === 4}
                      className="px-4 py-2 bg-blue-200 hover:bg-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed rounded text-sm font-medium"
                    >
                      Next Step
                    </button>
                  </div>
                </div>
              </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">AI Accordion component not available. Content hidden.</p>
          </div>
        )}

        {/* Example 1: Converging Lens Problem */}
        {AIAccordion ? (
          <div className="mb-6">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="example1" title="Example 1: Converging Lens Problem" theme="blue" onAskAI={onAIAccordionContent}>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 4.0 cm tall object is placed 50 cm away from a convex lens that has a focal length 
                  of 20 cm. Describe the image formed.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given information:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Object height: h<sub>o</sub> = 4.0 cm</li>
                        <li>Object distance: d<sub>o</sub> = 50 cm</li>
                        <li>Focal length: f = +20 cm (positive for converging lens)</li>
                      </ul>
                    </li>
                    
                    <li>
                      <strong>Apply the lens equation:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Substituting known values:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{20} = \\frac{1}{50} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Solving for d<sub>i</sub>:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{d_i} = \\frac{1}{20} - \\frac{1}{50} = \\frac{5-2}{100} = \\frac{3}{100}"}</BlockMath>
                        <BlockMath>{"d_i = +33.3\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate magnification:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"m = -\\frac{d_i}{d_o} = -\\frac{33.3}{50} = -0.67"}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Find image height:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"h_i = m \\times h_o = (-0.67) \\times (4.0\\text{ cm}) = -2.67\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 mb-2">Answer:</p>
                    <p className="text-gray-700">
                      The (+) d<sub>i</sub> means that the image is <strong>real</strong> and <strong>inverted</strong>. 
                      The image is 2.67 cm tall, i.e., <strong>diminished</strong> (smaller than the object). 
                      The image is located 33.3 cm on the opposite side of the lens from the object.
                    </p>
                  </div>
                </div>
              </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">AI Accordion component not available. Content hidden.</p>
          </div>
        )}

        {/* Example 2: Diverging Lens Problem */}
        {AIAccordion ? (
          <div className="mb-6">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="example2" title="Example 2: Diverging Lens Problem" theme="blue" onAskAI={onAIAccordionContent}>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  A 5.0 cm tall object is placed 60 cm away from a diverging lens that has a focal length 
                  of 40 cm. Describe the image formed.
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Given information:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Object height: h<sub>o</sub> = 5.0 cm</li>
                        <li>Object distance: d<sub>o</sub> = 60 cm</li>
                        <li>Focal length: f = -40 cm (negative for diverging lens)</li>
                      </ul>
                    </li>
                    
                    <li>
                      <strong>Apply the lens equation:</strong>
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
                        <BlockMath>{"h_i = m \\times h_o = (0.4) \\times (5.0\\text{ cm}) = +2.0\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 mb-2">Answer:</p>
                    <p className="text-gray-700">
                      The (-) d<sub>i</sub> means that the image is <strong>virtual</strong>, <strong>erect</strong> (upright), 
                      and <strong>diminished</strong>. The image is 2.0 cm tall and is located 24 cm on the same side 
                      of the lens as the object.
                    </p>
                  </div>
                </div>
              </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">AI Accordion component not available. Content hidden.</p>
          </div>
        )}

        {/* Example 3: Mystery Optical Device */}
        {AIAccordion ? (
          <div className="mb-6">
            <AIAccordion className="space-y-0">
              <AIAccordion.Item value="example3" title="Example 3: Mystery Optical Device" theme="blue" onAskAI={onAIAccordionContent}>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  An experiment is done where an optical device, either a mirror or a lens, is used. 
                  When the object is placed 20 cm from the optical device, an erect image of the object is 
                  found on the opposite side of the optical device. The image is one-quarter the size of 
                  the object. What kind of optical device is it and what is its focal length?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <strong>Analyze the given information:</strong>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Object distance: d<sub>o</sub> = 20 cm</li>
                        <li>Image is erect (upright) → virtual image</li>
                        <li>Image is on opposite side → this only happens with mirrors for virtual images</li>
                        <li>Image is 1/4 the size: m = +1/4 = +0.25 (positive for erect image)</li>
                      </ul>
                    </li>
                    
                    <li>
                      <strong>Identify the device type:</strong>
                      <div className="mt-2 p-3 bg-blue-50 rounded border border-blue-200">
                        <p className="text-sm text-blue-800">
                          The image is erect (i.e., virtual), smaller (i.e., d<sub>i</sub> is less than d<sub>o</sub>), 
                          and it is on the opposite side from the object. For lenses, virtual images are on the same side 
                          as the object. Therefore, this must be a <strong>convex (diverging) mirror</strong>.
                        </p>
                      </div>
                    </li>
                    
                    <li>
                      <strong>Calculate image distance using magnification:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"m = -\\frac{d_i}{d_o}"}</BlockMath>
                      </div>
                      <p className="mt-2">Since m = +0.25 and d<sub>o</sub> = 20 cm:</p>
                      <div className="text-center">
                        <BlockMath>{"0.25 = -\\frac{d_i}{20}"}</BlockMath>
                        <BlockMath>{"d_i = -5.0\\text{ cm}"}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">The negative d<sub>i</sub> confirms a virtual image.</p>
                    </li>
                    
                    <li>
                      <strong>Calculate focal length using mirror equation:</strong>
                      <div className="mt-2 text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}"}</BlockMath>
                      </div>
                      <p className="mt-2">Substituting values:</p>
                      <div className="text-center">
                        <BlockMath>{"\\frac{1}{f} = \\frac{1}{20} + \\frac{1}{-5} = \\frac{1}{20} - \\frac{4}{20} = \\frac{-3}{20}"}</BlockMath>
                        <BlockMath>{"f = -6.67\\text{ cm}"}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <div className="mt-6">
                    <p className="font-semibold text-gray-700 mb-2">Answer:</p>
                    <p className="text-gray-700">
                      The optical device is a <strong>convex (diverging) mirror</strong> with a focal length of 
                      <strong>-6.67 cm</strong>. The negative focal length confirms it is a diverging mirror.
                    </p>
                  </div>
                </div>
              </div>
              </AIAccordion.Item>
            </AIAccordion>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">AI Accordion component not available. Content hidden.</p>
          </div>
        )}

      </TextSection>

      {/* Practice Questions Slideshow */}
      <SlideshowKnowledgeCheck
        course={course}
        courseId={effectiveCourseId}
        lessonPath="14-optics-lenses"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_14_converging_lens_position',
            title: 'Question 1: Converging Lens - Image Position'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_converging_lens_height',
            title: 'Question 2: Converging Lens - Image Height'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_diverging_lens_position',
            title: 'Question 3: Diverging Lens - Image Position'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_diverging_lens_height',
            title: 'Question 4: Diverging Lens - Image Height'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_camera_lens_calculation',
            title: 'Question 5: Camera Lens Calculations'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_camera_image_size',
            title: 'Question 6: Camera Image Size'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_infinity_focus',
            title: 'Question 7: Infinity Focus'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_slide_projector_screen',
            title: 'Question 8a: Slide Projector - Screen Distance'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_slide_projector_image_size',
            title: 'Question 8b: Slide Projector - Image Size'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_slide_projector_adjustment',
            title: 'Question 8c: Slide Projector - Position Adjustment'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_object_image_separation',
            title: 'Question 9: Object-Image Separation'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_projector_focal_length',
            title: 'Question 10: Projector Focal Length'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_optical_bench_problem',
            title: 'Question 11: Optical Bench - Image Position'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_optical_bench_image_size',
            title: 'Question 12: Optical Bench - Image Size'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_14_camera_film_distance',
            title: 'Question 13: Camera Film Distance'
          }
        ]}
      />
      
    </LessonContent>
  );
};

export default OpticsLenses;