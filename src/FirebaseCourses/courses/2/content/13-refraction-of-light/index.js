import React, { useState } from 'react';
import LessonContent, { TextSection } from '../../../../components/content/LessonContent';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const RefractionOfLight = ({ course, courseId = 'default' }) => {
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isIndexOpen, setIsIndexOpen] = useState(false);
  const [isExample1Open, setIsExample1Open] = useState(false);
  const [isSnellOpen, setIsSnellOpen] = useState(false);

  return (
    <LessonContent
      lessonId="lesson_13_refraction_of_light"
      title="Lesson 8 - Refraction of Light"
      metadata={{ estimated_time: '45 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsNotesOpen(!isNotesOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Reflection and Refraction of Light</h3>
            <span className="text-blue-600">{isNotesOpen ? '▼' : '▶'}</span>
          </button>

          {isNotesOpen && (
            <div className="mt-4">
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
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsIndexOpen(!isIndexOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Index of Refraction</h3>
            <span className="text-blue-600">{isIndexOpen ? '▼' : '▶'}</span>
          </button>

          {isIndexOpen && (
            <div className="mt-4">
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
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsExample1Open(!isExample1Open)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Example 1 - Speed of Light in Crown Glass</h3>
            <span className="text-blue-600">{isExample1Open ? '▼' : '▶'}</span>
          </button>

          {isExample1Open && (
            <div className="mt-4">
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
          )}
        </div>
      </TextSection>

      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsSnellOpen(!isSnellOpen)}


            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Law of Refraction (Snell's Law)</h3>
            <span className="text-blue-600">{isSnellOpen ? '▼' : '▶'}</span>
          </button>

          {isSnellOpen && (
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
                  
                  {/* Refraction Triangle Diagram */}
                  <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-6">
                    <h5 className="text-center font-semibold text-gray-800 mb-3">Refraction Triangle Analysis</h5>
                    
                    <div className="flex justify-center">
                      <svg width="500" height="350" viewBox="0 0 500 350" className="border border-blue-300 bg-white rounded">
                        <defs>
                          {/* Arrow marker for rays */}
                          <marker id="arrowhead-triangle" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                            <polygon points="0 0, 8 3, 0 6" fill="#2563eb" />
                          </marker>
                          {/* Dashed line pattern */}
                          <pattern id="dash" patternUnits="userSpaceOnUse" width="8" height="1">
                            <rect width="4" height="1" fill="#6b7280"/>
                            <rect x="4" width="4" height="1" fill="transparent"/>
                          </pattern>
                        </defs>
                        
                        {/* Background regions */}
                        <text x="50" y="30" className="text-sm fill-gray-700">λ₁, v₁, f</text>
                        <text x="50" y="320" className="text-sm fill-gray-700">λ₂, v₂, f</text>
                        
                        {/* Interface line */}
                        <line x1="0" y1="175" x2="500" y2="175" stroke="#000" strokeWidth="2" />
                        
                        {/* Two parallel incident rays - reaching the interface */}
                        <line x1="100" y1="60" x2="200" y2="175" 
                          stroke="#2563eb" 
                          strokeWidth="3" />
                        <line x1="140" y1="40" x2="240" y2="175" 
                          stroke="#2563eb" 
                          strokeWidth="3" />
                        
                        {/* Two parallel refracted rays - leaving from the interface */}
                        <line x1="200" y1="175" x2="280" y2="280" 
                          stroke="#2563eb" 
                          strokeWidth="3" />
                        <line x1="240" y1="175" x2="320" y2="280" 
                          stroke="#2563eb" 
                          strokeWidth="3" />
                        
                        {/* Wave fronts connecting the parallel rays */}
                        <line x1="100" y1="60" x2="140" y2="40" stroke="#2563eb" strokeWidth="2" />
                        <line x1="120" y1="80" x2="160" y2="60" stroke="#2563eb" strokeWidth="2" />
                        <line x1="140" y1="100" x2="180" y2="80" stroke="#2563eb" strokeWidth="2" />
                        <line x1="160" y1="120" x2="200" y2="100" stroke="#2563eb" strokeWidth="2" />
                        <line x1="180" y1="140" x2="220" y2="120" stroke="#2563eb" strokeWidth="2" />
                        
                        {/* Wave fronts in medium 2 - closer together */}
                        <line x1="200" y1="195" x2="240" y2="215" stroke="#2563eb" strokeWidth="2" />
                        <line x1="220" y1="215" x2="260" y2="235" stroke="#2563eb" strokeWidth="2" />
                        <line x1="240" y1="235" x2="280" y2="255" stroke="#2563eb" strokeWidth="2" />
                        <line x1="260" y1="255" x2="300" y2="275" stroke="#2563eb" strokeWidth="2" />
                        
                        {/* Normal lines at intersection points */}
                        <line x1="200" y1="125" x2="200" y2="225" 
                          stroke="#6b7280" 
                          strokeWidth="1" 
                          strokeDasharray="5,5" />
                        <line x1="240" y1="125" x2="240" y2="225" 
                          stroke="#6b7280" 
                          strokeWidth="1" 
                          strokeDasharray="5,5" />
                        
                        {/* Right angle indicators */}
                        <text x="255" y="120" className="text-xs fill-gray-600">90° angle</text>
                        <text x="255" y="240" className="text-xs fill-gray-600">90° angle</text>
                        
                        {/* Triangle construction lines */}
                        {/* Upper triangle - from wave front intersection */}
                        <line x1="180" y1="140" x2="220" y2="120" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="200" y1="175" x2="220" y2="120" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="200" y1="175" x2="200" y2="135" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                        
                        {/* Lower triangle - from wave front intersection */}
                        <line x1="200" y1="195" x2="240" y2="215" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="200" y1="175" x2="240" y2="215" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                        <line x1="200" y1="175" x2="200" y2="195" stroke="#dc2626" strokeWidth="2" strokeDasharray="3,3" />
                        
                        {/* Wavelength labels */}
                        <text x="200" y="130" className="text-sm fill-blue-700 font-semibold">λ₁</text>
                        <text x="220" y="205" className="text-sm fill-blue-700 font-semibold">λ₂</text>
                        
                        {/* Angle labels */}
                        <text x="190" y="155" className="text-sm fill-black">θ₁</text>
                        <text x="210" y="185" className="text-sm fill-black">θ₂</text>
                        
                        {/* Hypotenuse label */}
                        <text x="280" y="155" className="text-sm fill-gray-700">common</text>
                        <text x="280" y="170" className="text-sm fill-gray-700">hypotenuse</text>
                        
                        {/* Mathematical relationships */}
                        <text x="320" y="80" className="text-sm fill-black">From the incident triangle we get</text>
                        <text x="320" y="100" className="text-sm fill-black">sin θ₁ = λ₁/hypotenuse</text>
                        
                        <text x="50" y="270" className="text-sm fill-black">From the refraction triangle we get</text>
                        <text x="50" y="290" className="text-sm fill-black">sin θ₂ = λ₂/hypotenuse</text>
                      </svg>
                    </div>
                    
                    <p className="text-center text-sm text-gray-600 mt-3">
                      The wave fronts form right triangles with a common hypotenuse, showing the geometric basis for Snell's Law
                    </p>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    From the refraction triangles above, we can see that:
                  </p>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'\\sin \\theta_1 = \\frac{\\lambda_1}{h} \\text{ and } \\sin \\theta_2 = \\frac{\\lambda_2}{h}'}</BlockMath>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Dividing these equations we get:
                  </p>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{\\text{hypotenuse}_1}{\\text{hypotenuse}_2} = \\frac{\\lambda_1}{\\lambda_2}'}</BlockMath>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    We have:
                  </p>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{\\lambda_1}{\\lambda_2}'}</BlockMath>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Using the universal wave equation <InlineMath>{'v = f\\lambda \\rightarrow \\lambda = \\frac{v}{f}'}</InlineMath> we can derive another relationship:
                  </p>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{\\lambda_1}{\\lambda_2} = \\frac{\\frac{v_1}{f}}{\\frac{v_2}{f}} = \\frac{v_1}{v_2}'}</BlockMath>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    For light we also have another relationship that we can include. Since <InlineMath>{'v = \\frac{c}{n}'}</InlineMath>:
                  </p>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'v_1 = \\frac{c}{n_1} \\text{ and } v_2 = \\frac{c}{n_2}'}</BlockMath>
                  </div>
                  
                  <p className="text-gray-700 mb-4">
                    Then:
                  </p>
                  
                  <div className="text-center mb-4">
                    <BlockMath>{'\\frac{\\sin \\theta_1}{\\sin \\theta_2} = \\frac{v_1}{v_2} = \\frac{\\frac{c}{n_1}}{\\frac{c}{n_2}} = \\frac{n_2}{n_1}'}</BlockMath>
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
          )}
        </div>
      </TextSection>

      <TextSection>
        <p>This is the lesson content for Lesson 8 - Refraction of Light in Optics & Diffraction Gratings.</p>
        <p>Content will be added here.</p>
      </TextSection>
    </LessonContent>
  );
};

export default RefractionOfLight;
