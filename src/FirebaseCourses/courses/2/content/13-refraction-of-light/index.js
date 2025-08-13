import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

const RefractionOfLight = ({ course, courseId = 'default', AIAccordion, onAIAccordionContent }) => {
  const [tirStep, setTirStep] = useState(1); // 1: small angle, 2: critical angle, 3: total internal reflection
  const [isExample1Open, setIsExample1Open] = useState(false);

  return (
    <LessonContent
      lessonId="lesson_13_refraction_of_light"
      title="Lesson 8 - Refraction of Light"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Reflection and Refraction of Light" 
            value="reflection-and-refraction-of-light" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  At any interface between two different mediums, some light will be reflected and some
                  will be refracted, except in certain cases which we will soon discover. When problem
                  solving for refraction, we usually ignore the reflected ray.
                </p>
                
                {/* Animated Refraction Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Light Refraction Through a Prism</h4>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="300" viewBox="0 0 400 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        {/* Arrow marker for light rays - reduced size */}
                        <marker id="arrowhead" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                          <polygon points="0 0, 6 2.5, 0 5" fill="#dc2626" />
                        </marker>
                        <marker id="arrowheadReflected" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                          <polygon points="0 0, 6 2.5, 0 5" fill="#3b82f6" />
                        </marker>
                      </defs>
                      
                      {/* Background grid */}
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="0.5"/>
                      </pattern>
                      <rect width="400" height="300" fill="url(#grid)" />
                      
                      {/* Rectangular prism */}
                      <rect x="150" y="100" width="100" height="100" 
                        fill="rgba(147, 197, 253, 0.3)" 
                        stroke="#2563eb" 
                        strokeWidth="2" />
                      
                      {/* Labels */}
                      <text x="200" y="90" textAnchor="middle" className="text-sm font-medium fill-blue-700">Glass Prism</text>
                      <text x="60" y="140" textAnchor="middle" className="text-sm fill-gray-600">Air</text>
                      <text x="340" y="140" textAnchor="middle" className="text-sm fill-gray-600">Air</text>
                      
                      {/* Incident ray */}
                      <line x1="50" y1="110" x2="150" y2="130" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead)" />
                      <text x="100" y="105" textAnchor="middle" className="text-sm fill-red-700">Incident Ray</text>
                      
                      {/* Reflected ray at first interface */}
                      <line x1="150" y1="130" x2="50" y2="150" 
                        stroke="#3b82f6" 
                        strokeWidth="2" 
                        markerEnd="url(#arrowheadReflected)"
                        strokeDasharray="5,5"
                        opacity="0.7">
                        <animate attributeName="stroke-dashoffset" 
                          values="0;10" 
                          dur="1s" 
                          repeatCount="indefinite"/>
                      </line>
                      <text x="80" y="160" textAnchor="middle" className="text-xs fill-blue-700">Reflected</text>
                      
                      {/* Refracted ray inside prism */}
                      <line x1="150" y1="130" x2="250" y2="170" 
                        stroke="#dc2626" 
                        strokeWidth="3" />
                      
                      {/* Normal line at first interface */}
                      <line x1="150" y1="110" x2="150" y2="150" 
                        stroke="#6b7280" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" />
                      
                      {/* Reflected ray at second interface (internal) */}
                      <line x1="250" y1="170" x2="200" y2="190" 
                        stroke="#3b82f6" 
                        strokeWidth="1.5" 
                        markerEnd="url(#arrowheadReflected)"
                        strokeDasharray="5,5"
                        opacity="0.5">
                        <animate attributeName="stroke-dashoffset" 
                          values="0;10" 
                          dur="1s" 
                          repeatCount="indefinite"/>
                      </line>
                      
                      {/* Emergent ray */}
                      <line x1="250" y1="170" x2="350" y2="190" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead)" />
                      <text x="300" y="205" textAnchor="middle" className="text-sm fill-red-700">Emergent Ray</text>
                      
                      {/* Normal line at second interface */}
                      <line x1="250" y1="150" x2="250" y2="190" 
                        stroke="#6b7280" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" />
                      
                      {/* Angle labels */}
                      <text x="135" y="125" className="text-xs fill-gray-600">θ₁</text>
                      <text x="155" y="145" className="text-xs fill-gray-600">θ₂</text>
                      <text x="240" y="165" className="text-xs fill-gray-600">θ₃</text>
                      <text x="255" y="185" className="text-xs fill-gray-600">θ₄</text>
                    </svg>
                  </div>
                  <p className="text-center text-sm text-gray-600 mt-2 italic">
                    Diagram shows light refracting as it enters and exits the glass prism, with partial reflection at each interface
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Reflection and Refraction of Light</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Index of Refraction" 
            value="index-of-refraction" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  The fastest that light can travel is in a vacuum (<InlineMath>{'c = 3.00 \\times 10^8 \\text{ m/s}'}</InlineMath>). In other
                  substances, the speed of light is always slower. The index of refraction is a ratio of the
                  speed of light in vacuum with the speed of light in the medium:
                </p>
                
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                  <p className="text-center font-semibold text-purple-800 mb-2">Index of Refraction Formula:</p>
                  <div className="text-center">
                    <BlockMath>{'n = \\frac{c}{v}'}</BlockMath>
                  </div>
                  <p className="text-center text-sm text-purple-700 mt-2">
                    where: <InlineMath>{'n'}</InlineMath> = index of refraction, <InlineMath>{'c'}</InlineMath> = speed in vacuum, <InlineMath>{'v'}</InlineMath> = speed in medium
                  </p>
                </div>

                <h4 className="font-semibold text-gray-800 mb-3">Common Indices of Refraction:</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-gray-300 rounded-lg">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="px-4 py-2 text-left border-b border-gray-300">Substance</th>
                        <th className="px-4 py-2 text-left border-b border-gray-300">Index of refraction (n)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">vacuum</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.0000</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">air</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.0003</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">water</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.33</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">ethyl alcohol</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.36</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">quartz (fused)</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.46</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">glycerine</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.47</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">Lucite or Plexiglas</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.51</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">glass (crown)</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.52</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">sodium chloride</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.53</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">glass (crystal)</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.54</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">ruby</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.54</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">glass (flint)</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.65</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">zircon</td>
                        <td className="px-4 py-2 border-b border-gray-200">1.92</td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b border-gray-200">diamond</td>
                        <td className="px-4 py-2 border-b border-gray-200">2.42</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                  <h4 className="font-semibold text-yellow-800 mb-2">Key Insight:</h4>
                  <p className="text-yellow-900">
                    Notice that the index of refraction (n) is always greater than or equal to 1
                    and that it has no units.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Index of Refraction</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 1 - Speed of Light in Crown Glass" 
            value="example-1-speed-light" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
              <p className="mb-4">
                The index of refraction for crown glass was measured to be 1.52. What is the speed of
                light in crown glass?
              </p>
              
              <div className="bg-white p-4 rounded border border-gray-100">
                <p className="font-medium text-gray-700 mb-4">Solution:</p>
                
                <ol className="list-decimal pl-6 space-y-3">
                  <li>
                    <span className="font-medium">Given information:</span>
                    <ul className="list-disc pl-6 mt-1">
                      <li>Index of refraction for crown glass: <InlineMath>{'n = 1.52'}</InlineMath></li>
                      <li>Speed of light in vacuum: <InlineMath>{'c = 3.00 \\times 10^8 \\text{ m/s}'}</InlineMath></li>
                    </ul>
                  </li>
                  
                  <li>
                    <span className="font-medium">Use the index of refraction formula:</span>
                    <div className="my-3">
                      <BlockMath>{'n = \\frac{c}{v}'}</BlockMath>
                    </div>
                  </li>
                  
                  <li>
                    <span className="font-medium">Solve for v (speed in crown glass):</span>
                    <div className="my-3">
                      <BlockMath>{'v = \\frac{c}{n}'}</BlockMath>
                    </div>
                  </li>
                  
                  <li>
                    <span className="font-medium">Substitute the values:</span>
                    <div className="my-3">
                      <BlockMath>{'v = \\frac{3.00 \\times 10^8 \\text{ m/s}}{1.52}'}</BlockMath>
                    </div>
                  </li>
                  
                  <li>
                    <span className="font-medium">Calculate the result:</span>
                    <div className="my-3">
                      <BlockMath>{'v = 1.97 \\times 10^8 \\text{ m/s}'}</BlockMath>
                    </div>
                  </li>
                </ol>
                
                <p className="mt-6">
                  <span className="font-semibold">Answer:</span> The speed of light in crown glass is <InlineMath>{'1.97 \\times 10^8 \\text{ m/s}'}</InlineMath>
                </p>
              </div>
            </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 1 - Speed of Light in Crown Glass</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Law of Refraction (Snell's Law)" 
            value="law-refraction-snells-law" 
            onAskAI={onAIAccordionContent}
          >
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  Refraction is the change in speed, wavelength and direction of light caused by a change
                  in medium. For example, when light passes from air into water, the speed decreases,
                  the wavelength decreases, and the light ray bends in toward the normal.
                </p>
                
                <p className="text-gray-700 mb-4">
                  In 1621, Willebrord Snell, a Dutch mathematician, determined the relationship between
                  the angles, wavelengths and speeds of refracted waves. These relationships are
                  referred to as Snell's law or the Law of Refraction. We will now derive Snell's law.
                </p>
                
                <p className="text-gray-700 mb-4">
                  The diagram represents a wave travelling from a fast medium into a slow medium.
                </p>
                
                {/* Snell's Law Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Wave Refraction: Fast to Slow Medium</h4>
                  <div className="flex justify-center">
                    <svg width="400" height="350" viewBox="0 0 400 350" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        {/* Arrow marker for rays */}
                        <marker id="arrowhead-snell" markerWidth="6" markerHeight="5" refX="6" refY="2.5" orient="auto">
                          <polygon points="0 0, 6 2.5, 0 5" fill="#dc2626" />
                        </marker>
                        {/* Pattern for wave fronts */}
                        <pattern id="wave-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
                          <line x1="0" y1="0" x2="30" y2="0" stroke="#3b82f6" strokeWidth="2" opacity="0.3"/>
                        </pattern>
                      </defs>
                      
                      {/* Background regions */}
                      <rect x="0" y="0" width="400" height="175" fill="#e0f2fe" opacity="0.3" />
                      <rect x="0" y="175" width="400" height="175" fill="#93c5fd" opacity="0.3" />
                      
                      {/* Interface line */}
                      <line x1="0" y1="175" x2="400" y2="175" stroke="#1e40af" strokeWidth="2" />
                      
                      {/* Labels for media */}
                      <text x="200" y="30" textAnchor="middle" className="text-lg font-semibold fill-blue-800">Fast Medium (e.g., Air)</text>
                      <text x="200" y="320" textAnchor="middle" className="text-lg font-semibold fill-blue-900">Slow Medium (e.g., Water)</text>
                      
                      {/* Incident ray */}
                      <line x1="100" y1="50" x2="200" y2="175" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-snell)" />
                      <text x="140" y="80" className="text-sm fill-red-700">Incident Ray</text>
                      
                      {/* Refracted ray */}
                      <line x1="200" y1="175" x2="250" y2="300" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-snell)" />
                      <text x="240" y="240" className="text-sm fill-red-700">Refracted Ray</text>
                      
                      {/* Normal line */}
                      <line x1="200" y1="125" x2="200" y2="225" 
                        stroke="#6b7280" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" />
                      <text x="205" y="120" className="text-xs fill-gray-600">Normal</text>
                      
                      {/* Angle labels */}
                      <text x="185" y="150" className="text-sm fill-green-700">θ₁</text>
                      <text x="215" y="195" className="text-sm fill-green-700">θ₂</text>
                      
                      {/* Wavelength indicators */}
                      <text x="50" y="130" className="text-xs fill-blue-700">λ₁ (larger)</text>
                      <text x="280" y="270" className="text-xs fill-blue-700">λ₂ (smaller)</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-300 rounded-lg p-6 mt-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Derivation of Snell's Law:</h4>
                  
                  <p className="text-gray-700 mb-4">
                    Watch this video explanation for a clear understanding of how Snell's Law is derived from the wave nature of light:
                  </p>
                  
                  <div className="flex justify-center mb-6">
                    <div className="w-full max-w-2xl">
                      <div className="relative" style={{paddingBottom: '56.25%', height: 0}}>
                        <iframe 
                          className="absolute top-0 left-0 w-full h-full rounded-lg"
                          src="https://www.youtube.com/embed/Iq1a_KJTWJ8?si=KsoaRSveS92RIFC9" 
                          title="YouTube video player" 
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                          referrerPolicy="strict-origin-when-cross-origin" 
                          allowFullScreen
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                    <p className="text-center font-semibold text-green-800 mb-2">Snell's Law (The Law of Refraction):</p>
                    <div className="text-center">
                      <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{\\lambda_1}{\\lambda_2} = \\frac{v_1}{v_2} = \\frac{n_2}{n_1}'}</BlockMath>
                    </div>
                    <p className="text-center text-sm text-green-700 mt-2">
                      and we can use any pairing that we desire.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Law of Refraction (Snell's Law)</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 2 - Refraction from Air to Water" 
            value="example-2-refraction" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If light has an angle of incidence of 30° when travelling from air into water, what is the angle of refraction?
                </p>
                
                {/* Simple Refraction Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Refraction Diagram: Air to Water</h5>
                  
                  <div className="flex justify-center">
                    <svg width="350" height="300" viewBox="0 0 350 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        {/* Arrow marker for light rays - smaller */}
                        <marker id="arrowhead-ex2" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Background regions */}
                      <rect x="0" y="0" width="350" height="150" fill="#e0f7fa" opacity="0.4" />
                      <rect x="0" y="150" width="350" height="150" fill="#0288d1" opacity="0.3" />
                      
                      {/* Interface line */}
                      <line x1="0" y1="150" x2="350" y2="150" stroke="#01579b" strokeWidth="3" />
                      
                      {/* Medium labels */}
                      <text x="175" y="30" textAnchor="middle" className="text-lg font-semibold fill-gray-700">Air</text>
                      <text x="175" y="280" textAnchor="middle" className="text-lg font-semibold fill-blue-900">Water</text>
                      
                      {/* Normal line */}
                      <line x1="175" y1="100" x2="175" y2="200" 
                        stroke="#6b7280" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" />
                      
                      {/* Incident ray - 30 degrees from normal */}
                      <line x1="125" y1="80" x2="175" y2="150" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-ex2)" />
                      
                      {/* Refracted ray - calculated angle */}
                      <line x1="175" y1="150" x2="205" y2="230" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-ex2)" />
                      
                      {/* Angle labels */}
                      <text x="150" y="110" className="text-sm fill-gray-700 font-bold">30°</text>
                      <text x="180" y="210" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₂</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Angle of incidence: <InlineMath>{'\\theta_1 = 30°'}</InlineMath></li>
                        <li>Medium 1 (air): <InlineMath>{'n_1 = 1.00'}</InlineMath></li>
                        <li>Medium 2 (water): <InlineMath>{'n_2 = 1.33'}</InlineMath></li>
                        <li>Find: angle of refraction <InlineMath>{'\\theta_2'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use Snell's Law:</span>
                      <div className="my-3">
                        <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600">Rearranging to solve for <InlineMath>{'\\sin \\theta_2'}</InlineMath>:</p>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{n_1 \\sin \\theta_1}{n_2}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{1.00 \\times \\sin(30°)}{1.33}'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600">Since <InlineMath>{'\\sin(30°) = 0.500'}</InlineMath>:</p>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{1.00 \\times 0.500}{1.33} = \\frac{0.500}{1.33}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate:</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = 0.376'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600">Taking the inverse sine:</p>
                      <div className="my-3">
                        <BlockMath>{'\\theta_2 = \\sin^{-1}(0.376) = 22.1°'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The angle of refraction is <span className="font-bold">22.1°</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: The refracted ray bends toward the normal because light is entering a denser medium (water has a higher refractive index than air).
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 2 - Refraction from Air to Water</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 3 - Refraction from Water to Air" 
            value="example-3-refraction" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If light has an angle of incidence of 30° when travelling from water into air, what is the angle of refraction?
                </p>
                
                {/* Simple Refraction Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Refraction Diagram: Water to Air</h5>
                  
                  <div className="flex justify-center">
                    <svg width="350" height="300" viewBox="0 0 350 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        {/* Arrow marker for light rays - smaller */}
                        <marker id="arrowhead-ex3" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Background regions */}
                      <rect x="0" y="0" width="350" height="150" fill="#0288d1" opacity="0.3" />
                      <rect x="0" y="150" width="350" height="150" fill="#e0f7fa" opacity="0.4" />
                      
                      {/* Interface line */}
                      <line x1="0" y1="150" x2="350" y2="150" stroke="#01579b" strokeWidth="3" />
                      
                      {/* Medium labels */}
                      <text x="175" y="30" textAnchor="middle" className="text-lg font-semibold fill-blue-900">Water</text>
                      <text x="175" y="280" textAnchor="middle" className="text-lg font-semibold fill-gray-700">Air</text>
                      
                      {/* Normal line */}
                      <line x1="175" y1="100" x2="175" y2="200" 
                        stroke="#6b7280" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" />
                      
                      {/* Incident ray - 30 degrees from normal */}
                      <line x1="125" y1="80" x2="175" y2="150" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-ex3)" />
                      
                      {/* Refracted ray - bends away from normal */}
                      <line x1="175" y1="150" x2="235" y2="230" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-ex3)" />
                      
                      {/* Angle labels */}
                      <text x="150" y="110" className="text-sm fill-gray-700 font-bold">30°</text>
                      <text x="180" y="210" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₂</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Angle of incidence: <InlineMath>{'\\theta_1 = 30°'}</InlineMath></li>
                        <li>Medium 1 (water): <InlineMath>{'n_1 = 1.33'}</InlineMath></li>
                        <li>Medium 2 (air): <InlineMath>{'n_2 = 1.00'}</InlineMath></li>
                        <li>Find: angle of refraction <InlineMath>{'\\theta_2'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use Snell's Law:</span>
                      <div className="my-3">
                        <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{n_1 \\sin \\theta_1}{n_2}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{1.33 \\times \\sin(30°)}{1.00}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{1.33 \\times 0.500}{1.00} = 0.665'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate:</span>
                      <div className="my-3">
                        <BlockMath>{'\\theta_2 = \\sin^{-1}(0.665) = 41.9°'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The angle of refraction is <span className="font-bold">41.9°</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: The refracted ray bends away from the normal because light is entering a less dense medium (air has a lower refractive index than water).
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 3 - Refraction from Water to Air</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 4 - Finding Index of Refraction" 
            value="example-4-finding-index" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If light has an angle of incidence of 30° and an angle of refraction of 26° when travelling from water into substance X, what is the index of refraction for X?
                </p>
                
                {/* Simple Refraction Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Refraction Diagram: Water to Substance X</h5>
                  
                  <div className="flex justify-center">
                    <svg width="350" height="300" viewBox="0 0 350 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        {/* Arrow marker for light rays - smaller */}
                        <marker id="arrowhead-ex4" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Background regions */}
                      <rect x="0" y="0" width="350" height="150" fill="#0288d1" opacity="0.3" />
                      <rect x="0" y="150" width="350" height="150" fill="#94a3b8" opacity="0.3" />
                      
                      {/* Interface line */}
                      <line x1="0" y1="150" x2="350" y2="150" stroke="#01579b" strokeWidth="3" />
                      
                      {/* Medium labels */}
                      <text x="175" y="30" textAnchor="middle" className="text-lg font-semibold fill-blue-900">Water</text>
                      <text x="175" y="280" textAnchor="middle" className="text-lg font-semibold fill-gray-700">X</text>
                      
                      {/* Normal line */}
                      <line x1="175" y1="100" x2="175" y2="200" 
                        stroke="#6b7280" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" />
                      
                      {/* Incident ray - 30 degrees from normal */}
                      <line x1="125" y1="80" x2="175" y2="150" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-ex4)" />
                      
                      {/* Refracted ray - 26 degrees from normal */}
                      <line x1="175" y1="150" x2="210" y2="230" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-ex4)" />
                      
                      {/* Angle labels */}
                      <text x="150" y="110" className="text-sm fill-gray-700 font-bold">30°</text>
                      <text x="180" y="210" className="text-sm fill-gray-700 font-bold">26°</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Angle of incidence: <InlineMath>{'\\theta_1 = 30°'}</InlineMath></li>
                        <li>Angle of refraction: <InlineMath>{'\\theta_2 = 26°'}</InlineMath></li>
                        <li>Medium 1 (water): <InlineMath>{'n_1 = 1.33'}</InlineMath></li>
                        <li>Find: index of refraction for substance X <InlineMath>{'n_2'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use Snell's Law:</span>
                      <div className="my-3">
                        <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'n_2 = n_1 \\times \\frac{\\sin \\theta_1}{\\sin \\theta_2}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'n_2 = 1.33 \\times \\frac{\\sin(30°)}{\\sin(26°)}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'n_2 = 1.33 \\times \\frac{0.500}{0.438} = 1.33 \\times 1.142'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate:</span>
                      <div className="my-3">
                        <BlockMath>{'n_2 = 1.52'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The index of refraction for substance X is <span className="font-bold">1.52</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: This index of refraction corresponds to crown glass (see the table in the Index of Refraction section).
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 4 - Finding Index of Refraction</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 5 - Speed of Light in Glass" 
            value="example-5-speed-light-glass" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If the speed of light in air is <InlineMath>{'3.00 \\times 10^8'}</InlineMath> m/s, what is the speed of light in glass (<InlineMath>{'n_{glass} = 1.50'}</InlineMath>)?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Speed of light in air: <InlineMath>{'c = 3.00 \\times 10^8 \\text{ m/s}'}</InlineMath></li>
                        <li>Index of refraction for glass: <InlineMath>{'n_{glass} = 1.50'}</InlineMath></li>
                        <li>Find: speed of light in glass <InlineMath>{'v_{glass}'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use the index of refraction formula:</span>
                      <div className="my-3">
                        <BlockMath>{'n = \\frac{c}{v}'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600">Rearranging to solve for v:</p>
                      <div className="my-3">
                        <BlockMath>{'v = \\frac{c}{n}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'v_{glass} = \\frac{3.00 \\times 10^8 \\text{ m/s}}{1.50}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate:</span>
                      <div className="my-3">
                        <BlockMath>{'v_{glass} = 2.00 \\times 10^8 \\text{ m/s}'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The speed of light in glass is <span className="font-bold"><InlineMath>{'2.00 \\times 10^8'}</InlineMath> m/s</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: Light travels slower in glass than in air because glass has a higher index of refraction.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 5 - Speed of Light in Glass</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      {/* Refraction Knowledge Check */}
      <SlideshowKnowledgeCheck
        course={course}
        courseId={courseId}
        lessonPath="13-refraction-of-light"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q1',
            title: 'Question 1: Refractive Index of Plastic'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q2',
            title: 'Question 2: Speed of Light in Crown Glass'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q3',
            title: 'Question 3: Angles of Reflection and Refraction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q4',
            title: 'Question 4: Air to Glass Refraction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q5',
            title: 'Question 5: Finding Index of Refraction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q6',
            title: 'Question 6: Wavelength in Water'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_refraction_kc_q7',
            title: 'Question 7: Multi-layer Refraction'
          }
        ]}
        metadata={{
          title: 'Refraction Practice Problems',
          subject: 'Physics',
          gradeLevel: '30',
          totalQuestions: 7,
          estimatedTime: '15 minutes',
          description: 'Test your understanding of refraction concepts and calculations.'
        }}
        theme="purple"
      />

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 6 - Wavelength of Light in Diamond" 
            value="example-6-wavelength-diamond" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If light has a wavelength of 750 nm in air, what is the wavelength of light in diamond (<InlineMath>{'n_{diamond} = 2.42'}</InlineMath>)?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Wavelength in air: <InlineMath>{'\\lambda_1 = 750 \\text{ nm}'}</InlineMath></li>
                        <li>Index of refraction for air: <InlineMath>{'n_1 = 1.00'}</InlineMath></li>
                        <li>Index of refraction for diamond: <InlineMath>{'n_2 = 2.42'}</InlineMath></li>
                        <li>Find: wavelength in diamond <InlineMath>{'\\lambda_2'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use the wavelength relationship from Snell's Law:</span>
                      <div className="my-3">
                        <BlockMath>{'\\frac{\\lambda_1}{\\lambda_2} = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600">Rearranging to solve for <InlineMath>{'\\lambda_2'}</InlineMath>:</p>
                      <div className="my-3">
                        <BlockMath>{'\\lambda_2 = \\frac{n_1 \\lambda_1}{n_2}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'\\lambda_2 = \\frac{1.00 \\times 750 \\text{ nm}}{2.42}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate:</span>
                      <div className="my-3">
                        <BlockMath>{'\\lambda_2 = 310 \\text{ nm}'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The wavelength of light in diamond is <span className="font-bold">310 nm</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: Light has a shorter wavelength in diamond because it travels slower in materials with higher refractive indices.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 6 - Wavelength of Light in Diamond</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Special Problems" 
            value="special-problems" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4">A. Parallel Sides</h4>
                
                <p className="text-gray-700 mb-4">
                  When light passes through a medium with parallel sides, the original angle of incidence always equals the final angle of refraction. The internal angles are also the same. Note that the original ray is parallel with the emerging ray.
                </p>
                
                {/* Parallel Sides Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Light Through Parallel Sides</h5>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="250" viewBox="0 0 400 250" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-parallel" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Glass block */}
                      <rect x="150" y="50" width="100" height="150" 
                        fill="#93c5fd" 
                        opacity="0.3" 
                        stroke="#2563eb" 
                        strokeWidth="2" />
                      
                      {/* Medium labels */}
                      <text x="75" y="125" className="text-sm fill-gray-700">Air</text>
                      <text x="200" y="125" className="text-sm fill-blue-900">Glass</text>
                      <text x="325" y="125" className="text-sm fill-gray-700">Air</text>
                      
                      {/* Normal at first interface */}
                      <line x1="120" y1="100" x2="180" y2="100" 
                        stroke="#6b7280" 
                        strokeWidth="1.5" 
                        strokeDasharray="3,3" />
                      
                      {/* Normal at second interface */}
                      <line x1="220" y1="150" x2="280" y2="150" 
                        stroke="#6b7280" 
                        strokeWidth="1.5" 
                        strokeDasharray="3,3" />
                      
                      {/* Incident ray */}
                      <line x1="50" y1="80" x2="150" y2="100" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-parallel)" />
                      
                      {/* Ray inside glass */}
                      <line x1="150" y1="100" x2="250" y2="150" 
                        stroke="#dc2626" 
                        strokeWidth="3" />
                      
                      {/* Emergent ray - parallel to incident */}
                      <line x1="250" y1="150" x2="350" y2="170" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-parallel)" />
                      
                      <text x="200" y="220" textAnchor="middle" className="text-xs fill-gray-600">
                        Incident and emergent rays are parallel
                      </text>
                    </svg>
                  </div>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-4 mt-6">B. Triangular Prisms</h4>
                
                <p className="text-gray-700 mb-4">
                  A classic problem is when light refracts through a triangular prism. Since the sides are not parallel, the internal angles of refraction and incidence will not be the same.
                </p>
                
                {/* Triangular Prism Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Light Through Triangular Prism</h5>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="300" viewBox="0 0 400 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-prism" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Triangular prism */}
                      <polygon points="200,50 120,200 280,200" 
                        fill="#93c5fd" 
                        opacity="0.3" 
                        stroke="#2563eb" 
                        strokeWidth="2" />
                      
                      {/* Incident ray - steeper angle */}
                      <line x1="50" y1="80" x2="160" y2="125" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-prism)" />
                      
                      {/* Ray inside prism */}
                      <line x1="160" y1="125" x2="240" y2="125" 
                        stroke="#dc2626" 
                        strokeWidth="3" />
                      
                      {/* Emergent ray - not parallel */}
                      <line x1="240" y1="125" x2="350" y2="80" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-prism)" />
                      
                      <text x="200" y="270" textAnchor="middle" className="text-xs fill-gray-600">
                        Sides are not parallel - rays emerge at different angles
                      </text>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Special Problems</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 7 - Light Through an Equilateral Prism" 
            value="example-7-prism" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If light enters an equilateral glass prism (n = 1.50) with an angle of incidence of 45°, what is the angle of refraction as the beam emerges from the prism? Note that an equilateral triangle has three 60° angles.
                </p>
                
                {/* Prism Diagram with Angles */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Equilateral Prism Refraction</h5>
                  
                  <div className="flex justify-center">
                    <svg width="450" height="350" viewBox="0 0 450 350" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-ex7" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* Equilateral triangle prism */}
                      <polygon points="225,80 125,250 325,250" 
                        fill="#93c5fd" 
                        opacity="0.3" 
                        stroke="#2563eb" 
                        strokeWidth="2" />
                      
                      {/* 60° angle labels */}
                      <text x="225" y="100" textAnchor="middle" className="text-xs fill-blue-700">60°</text>
                      <text x="140" y="240" className="text-xs fill-blue-700">60°</text>
                      <text x="290" y="240" className="text-xs fill-blue-700">60°</text>
                      
                      {/* Normal lines */}
                      {/* Left normal - perpendicular to left face (60° from vertical) */}
                      <line x1="145" y1="145" x2="205" y2="185" 
                        stroke="#6b7280" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" />
                      {/* Right normal - perpendicular to right face (60° from vertical opposite direction) */}
                      <line x1="305" y1="145" x2="245" y2="185" 
                        stroke="#6b7280" 
                        strokeWidth="1" 
                        strokeDasharray="3,3" />
                      
                      {/* Incident ray at 45° - pointing upward */}
                      <line x1="50" y1="215" x2="175" y2="165" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-ex7)" />
                      
                      {/* Ray inside prism */}
                      <line x1="175" y1="165" x2="275" y2="165" 
                        stroke="#dc2626" 
                        strokeWidth="3" />
                      
                      {/* Emergent ray - pointing downward */}
                      <line x1="275" y1="165" x2="400" y2="230" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-ex7)" />
                      
                      {/* Angle labels */}
                      <text x="205" y="180" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₁</text>
                      <text x="190" y="160" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₂</text>
                      <text x="250" y="160" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₃</text>
                      <text x="240" y="180" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₄</text>
                      <text x="290" y="170" className="text-sm fill-gray-700" style={{fontStyle: 'italic'}}>θ₅</text>
                      
                      {/* Given angle */}
                      <text x="130" y="165" className="text-sm fill-red-700 font-bold">45°</text>
                    </svg>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Find θ₁ (refraction angle at first surface):</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_1 = \\frac{n_1 \\sin(45°)}{n_2} = \\frac{1.00 \\times \\sin(45°)}{1.50}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\theta_1 = 28.12°'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Find θ₂ (angle to the second surface normal):</span>
                      <p className="text-sm text-gray-600 mt-1">Using geometry of the prism:</p>
                      <div className="my-3">
                        <BlockMath>{'\\theta_2 = 90° - \\theta_1 = 90° - 28.12° = 61.88°'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Find θ₃ (angle from the second surface normal):</span>
                      <p className="text-sm text-gray-600 mt-1">Using the triangle's internal angles:</p>
                      <div className="my-3">
                        <BlockMath>{'\\theta_3 = 180° - (60° + \\theta_2) = 180° - 121.88° = 58.12°'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Find θ₄ (incident angle at second surface):</span>
                      <div className="my-3">
                        <BlockMath>{'\\theta_4 = 90° - \\theta_3 = 90° - 58.12° = 31.88°'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Find θ₅ (final refraction angle):</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_5 = \\frac{n_2 \\sin \\theta_4}{n_1} = \\frac{1.50 \\times \\sin(31.88°)}{1.00}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\theta_5 = 52.4°'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The angle of refraction as the beam emerges from the prism is <span className="font-bold">52.4°</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: The light ray is deviated significantly from its original path due to the non-parallel surfaces of the prism.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 7 - Light Through an Equilateral Prism</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      {/* Slideshow Knowledge Check after Example 7 */}
      <SlideshowKnowledgeCheck
        course={course}
        courseId={courseId}
        lessonPath="13-refraction-of-light"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_13_slideshow_q1',
            title: 'Question 1: Light Refraction Behavior'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_slideshow_q2',
            title: 'Question 2: Prism Dispersion'
          }
        ]}
        theme="indigo"
      />

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Total Internal Reflection" 
            value="total-internal-reflection" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  When a light ray passes from a more optically dense medium (high n, low v) to a less optically 
                  dense medium (low n, high v), the angle of refraction (θᵣ) is greater than the angle of 
                  incidence (θᵢ).
                </p>
                
                <p className="text-gray-700 mb-4">
                  As the angle of incidence is increased, the angle of refraction becomes larger until finally 
                  θᵣ approaches 90°.
                </p>
                
                {/* Interactive Total Internal Reflection Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Total Internal Reflection - Interactive</h4>
                  
                  <div className="flex justify-center mb-4">
                    <svg width="500" height="400" viewBox="0 0 500 400" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-tir" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                        <marker id="arrowhead-reflected" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#3b82f6" />
                        </marker>
                      </defs>
                      
                      {/* Background regions */}
                      <rect x="0" y="0" width="500" height="200" fill="#e0f7fa" opacity="0.4" />
                      <rect x="0" y="200" width="500" height="200" fill="#0288d1" opacity="0.3" />
                      
                      {/* Interface line */}
                      <line x1="0" y1="200" x2="500" y2="200" stroke="#01579b" strokeWidth="3" />
                      
                      {/* Medium labels */}
                      <text x="250" y="30" textAnchor="middle" className="text-lg font-semibold fill-gray-700">
                        Air (n = 1.00)
                      </text>
                      <text x="90" y="50" className="text-sm fill-gray-600">Low n, high speed</text>
                      
                      <text x="250" y="370" textAnchor="middle" className="text-lg font-semibold fill-blue-900">
                        Water (n = 1.33)
                      </text>
                      <text x="90" y="350" className="text-sm fill-blue-700">High n, low speed</text>
                      
                      {/* Normal line */}
                      <line x1="250" y1="150" x2="250" y2="250" 
                        stroke="#6b7280" 
                        strokeWidth="2" 
                        strokeDasharray="5,5" />
                      <text x="255" y="145" className="text-sm fill-gray-600">Normal</text>
                      
                      {/* Case 1: Small angle */}
                      {tirStep === 1 && (
                        <g>
                          <line x1="150" y1="300" x2="250" y2="200" 
                            stroke="#dc2626" 
                            strokeWidth="3" 
                            markerEnd="url(#arrowhead-tir)" />
                          <line x1="250" y1="200" x2="310" y2="100" 
                            stroke="#dc2626" 
                            strokeWidth="3" 
                            markerEnd="url(#arrowhead-tir)" />
                          <text x="230" y="240" className="text-xs fill-gray-700">θᵢ</text>
                          <text x="260" y="170" className="text-xs fill-gray-700">θᵣ</text>
                          <text x="50" y="300" className="text-sm fill-gray-700">θᵢ &lt; θc</text>
                          <text x="250" y="90" textAnchor="middle" className="text-sm fill-purple-700 font-semibold">
                            Normal Refraction
                          </text>
                        </g>
                      )}
                      
                      {/* Case 2: Critical angle */}
                      {tirStep === 2 && (
                        <g>
                          <line x1="100" y1="250" x2="250" y2="200" 
                            stroke="#dc2626" 
                            strokeWidth="3" 
                            markerEnd="url(#arrowhead-tir)" />
                          <line x1="250" y1="200" x2="400" y2="200" 
                            stroke="#dc2626" 
                            strokeWidth="3" 
                            markerEnd="url(#arrowhead-tir)"
                            strokeDasharray="5,5" />
                          <text x="230" y="230" className="text-xs fill-gray-700">θc</text>
                          <text x="320" y="190" className="text-xs fill-gray-700">θᵣ = 90°</text>
                          <text x="50" y="250" className="text-sm fill-red-700 font-bold">θᵢ = θc</text>
                          <text x="250" y="90" textAnchor="middle" className="text-sm fill-red-700 font-semibold">
                            Critical Angle
                          </text>
                        </g>
                      )}
                      
                      {/* Case 3: Total internal reflection */}
                      {tirStep === 3 && (
                        <g>
                          <line x1="100" y1="220" x2="250" y2="200" 
                            stroke="#dc2626" 
                            strokeWidth="3" 
                            markerEnd="url(#arrowhead-tir)" />
                          <line x1="250" y1="200" x2="400" y2="220" 
                            stroke="#3b82f6" 
                            strokeWidth="3" 
                            markerEnd="url(#arrowhead-reflected)" />
                          <text x="220" y="215" className="text-xs fill-gray-700">θᵢ</text>
                          <text x="280" y="215" className="text-xs fill-blue-700">θᵣ = θᵢ</text>
                          <text x="50" y="220" className="text-sm fill-blue-700 font-bold">θᵢ &gt; θc</text>
                          <text x="250" y="90" textAnchor="middle" className="text-sm fill-blue-700 font-semibold">
                            Total Internal Reflection
                          </text>
                        </g>
                      )}
                    </svg>
                  </div>
                  
                  {/* Control buttons */}
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setTirStep(1)}
                      className={`px-4 py-2 rounded transition-colors ${
                        tirStep === 1 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Small Angle
                    </button>
                    <button
                      onClick={() => setTirStep(2)}
                      className={`px-4 py-2 rounded transition-colors ${
                        tirStep === 2 
                          ? 'bg-red-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Critical Angle
                    </button>
                    <button
                      onClick={() => setTirStep(3)}
                      className={`px-4 py-2 rounded transition-colors ${
                        tirStep === 3 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Total Internal Reflection
                    </button>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Click the buttons to explore different angles of incidence
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Critical Angle</h4>
                  <p className="text-yellow-900 mb-2">
                    At the angle of incidence called the <span className="font-bold">critical angle (θc)</span>, 
                    the angle of refraction = 90°.
                  </p>
                  <p className="text-yellow-900">
                    At angles beyond the critical angle, refraction can no longer occur – the result is 
                    <span className="font-bold"> total internal reflection</span>, which obeys the law of reflection. 
                    In other words, at angles beyond the critical angle the boundary between the media acts as a 
                    mirror surface.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100 mb-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Finding the Critical Angle</h4>
                  <p className="text-gray-700 mb-2">
                    The critical angle can be found using Snell's Law when θ₂ = 90°:
                  </p>
                  <div className="text-center my-3">
                    <BlockMath>{'\\sin \\theta_c = \\frac{n_2}{n_1}'}</BlockMath>
                  </div>
                  <p className="text-sm text-gray-600">
                    where n₁ is the denser medium and n₂ is the less dense medium
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Applications</h4>
                  <p className="text-green-900 mb-2">
                    The properties of internal reflection are used in:
                  </p>
                  <ul className="list-disc pl-6 text-green-900">
                    <li>Fiber optic technologies</li>
                    <li>Optical instruments like cameras</li>
                    <li>Microscopes</li>
                    <li>Binoculars</li>
                    <li>Prisms in periscopes</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <h4 className="font-semibold text-red-800 mb-2">Important Note</h4>
                  <p className="text-red-900">
                    Total internal reflection occurs <span className="font-bold">only</span> when light travels 
                    from low to high speed media (high n to low n). It does <span className="font-bold">not</span> occur 
                    when light travels from high to low speed media (low n to high n).
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Total Internal Reflection</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 8 - Critical Angle for Water-Air Interface" 
            value="example-8-critical-angle" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  What is the critical angle for a water and air interface?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Medium 1 (water): <InlineMath>{'n_1 = 1.33'}</InlineMath></li>
                        <li>Medium 2 (air): <InlineMath>{'n_2 = 1.00'}</InlineMath></li>
                        <li>For the critical angle: <InlineMath>{'\\theta_2 = 90°'}</InlineMath></li>
                        <li>Find: critical angle <InlineMath>{'\\theta_c'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use the critical angle formula:</span>
                      <div className="my-3">
                        <BlockMath>{'\\frac{\\sin \\theta_c}{\\sin \\theta_2} = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                      <p className="text-sm text-gray-600">Since <InlineMath>{'\\theta_2 = 90°'}</InlineMath> and <InlineMath>{'\\sin(90°) = 1'}</InlineMath>:</p>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_c = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_c = \\frac{1.00}{1.33}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_c = 0.752'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate the critical angle:</span>
                      <div className="my-3">
                        <BlockMath>{'\\theta_c = \\sin^{-1}(0.752) = 48.8°'}</BlockMath>
                      </div>
                    </li>
                  </ol>
                  
                  <p className="mt-6">
                    <span className="font-semibold">Answer:</span> The critical angle for the water-air interface is <span className="font-bold">48.8°</span>
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Note: Light rays hitting the interface at angles greater than 48.8° will undergo total internal reflection.
                  </p>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 8 - Critical Angle for Water-Air Interface</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      <TextSection>
        {AIAccordion ? (
        <AIAccordion theme="blue">
          <AIAccordion.Item 
            title="Example 9 - Diamond to Water Refraction" 
            value="example-9-diamond-water" 
            onAskAI={onAIAccordionContent}
          >
            <div>
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-3">Problem:</h4>
                <p className="mb-4">
                  If light makes an angle of incidence of 60° when travelling from diamond into water, what is the angle of refraction produced?
                </p>
                
                <div className="bg-white p-4 rounded border border-gray-100">
                  <p className="font-medium text-gray-700 mb-4">Solution:</p>
                  
                  <ol className="list-decimal pl-6 space-y-3">
                    <li>
                      <span className="font-medium">Given information:</span>
                      <ul className="list-disc pl-6 mt-1">
                        <li>Angle of incidence: <InlineMath>{'\\theta_1 = 60°'}</InlineMath></li>
                        <li>Medium 1 (diamond): <InlineMath>{'n_1 = 2.42'}</InlineMath></li>
                        <li>Medium 2 (water): <InlineMath>{'n_2 = 1.33'}</InlineMath></li>
                        <li>Find: angle of refraction <InlineMath>{'\\theta_2'}</InlineMath></li>
                      </ul>
                    </li>
                    
                    <li>
                      <span className="font-medium">Use Snell's Law:</span>
                      <div className="my-3">
                        <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{n_2}{n_1}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{n_1 \\sin \\theta_1}{n_2}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Substitute the values:</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{2.42 \\times \\sin(60°)}{1.33}'}</BlockMath>
                      </div>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = \\frac{2.42 \\times 0.866}{1.33} = \\frac{2.096}{1.33}'}</BlockMath>
                      </div>
                    </li>
                    
                    <li>
                      <span className="font-medium">Calculate:</span>
                      <div className="my-3">
                        <BlockMath>{'\\sin \\theta_2 = 1.576'}</BlockMath>
                      </div>
                      <p className="text-sm text-red-600 mt-2">
                        Since the sine function cannot have a value greater than 1, this result indicates an <span className="font-bold">error</span>.
                      </p>
                    </li>
                  </ol>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-6">
                    <p className="font-semibold text-red-800 mb-2">Result:</p>
                    <p className="text-red-900 mb-2">
                      <span className="font-bold">No refraction is possible</span> - Total internal reflection occurs.
                    </p>
                    <p className="text-sm text-red-700">
                      Note: This error result does not indicate that you have made a mistake in calculation. 
                      The result means that no refraction is possible, resulting in total internal reflection.
                    </p>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <h5 className="font-semibold text-blue-800 mb-2">Explanation:</h5>
                    <p className="text-blue-900 text-sm">
                      The angle of incidence (60°) exceeds the critical angle for the diamond-water interface. 
                      At this angle, all light is reflected back into the diamond rather than being refracted into the water.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </AIAccordion.Item>
        </AIAccordion>
        ) : (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-4">Example 9 - Diamond to Water Refraction</h3>
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                [Complete content and interactive elements available when AI features are enabled]
              </p>
            </div>
          </div>
        )}
      </TextSection>

      {/* Critical Angle Slideshow Knowledge Check after Example 9 */}
      <SlideshowKnowledgeCheck
        course={course}
        courseId={courseId}
        lessonPath="13-refraction-of-light"
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_13_critical_q1',
            title: 'Question 1: Rock Salt Critical Angle'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_critical_q2',
            title: 'Question 2: Liquid Critical Angle'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_13_critical_q3',
            title: 'Question 3: Diamond to Glass Critical Angle'
          }
        ]}
        theme="purple"
      />

      <LessonSummary
        points={[
          "Index of refraction (n = c/v) measures how much light slows down in a medium; always ≥ 1",
          "Snell's Law relates angles and indices: sin θ₁/sin θ₂ = n₂/n₁ = λ₁/λ₂ = v₁/v₂",
          "Light bends toward the normal when entering a denser medium (higher n)",
          "Light bends away from the normal when entering a less dense medium (lower n)",
          "Wavelength changes when light refracts, but frequency remains constant",
          "Critical angle occurs when θᵣ = 90°; found using sin θc = n₂/n₁ (when n₁ > n₂)",
          "Total internal reflection occurs when θᵢ > θc, but only from dense to less dense media",
          "Parallel-sided objects produce emergent rays parallel to incident rays",
          "Triangular prisms cause ray deviation due to non-parallel surfaces",
          "When sin θ > 1 in calculations, total internal reflection occurs instead of refraction",
          "Applications include fiber optics, eyeglasses, cameras, telescopes, and diamond cutting"
        ]}
      />
    </LessonContent>
  );
};

export default RefractionOfLight;
