import React, { useState } from 'react';
import LessonContent, { TextSection, LessonSummary } from '../../../../components/content/LessonContent';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

const DispersionScattering = ({ course, courseId = 'default' }) => {
  const [isDispersionOpen, setIsDispersionOpen] = useState(false);
  const [isScatteringOpen, setIsScatteringOpen] = useState(false);
  const [isColourOpen, setIsColourOpen] = useState(false);
  const [isPolarisationOpen, setIsPolarisationOpen] = useState(false);
  
  // Color toggle states
  const [redEnabled, setRedEnabled] = useState(false);
  const [greenEnabled, setGreenEnabled] = useState(false);
  const [blueEnabled, setBlueEnabled] = useState(false);
  
  // Polarization activity states
  const [filter1Angle, setFilter1Angle] = useState(0); // 0 = horizontal, 90 = vertical
  const [filter2Angle, setFilter2Angle] = useState(0);
  const [showSecondFilter, setShowSecondFilter] = useState(true);
  const [lightIntensity, setLightIntensity] = useState(100);
  
  // Calculate light transmission through polarizing filters
  const calculateTransmission = () => {
    if (!showSecondFilter) {
      // Only first filter - reduces intensity to 50% (unpolarized to polarized)
      return lightIntensity * 0.5;
    }
    
    // Malus's Law: I = I₀ * cos²(θ) where θ is angle between filter axes
    const angleDifference = Math.abs(filter2Angle - filter1Angle);
    const normalizedAngle = Math.min(angleDifference, 180 - angleDifference);
    const radians = (normalizedAngle * Math.PI) / 180;
    const transmission = Math.cos(radians) ** 2;
    
    return lightIntensity * 0.5 * transmission; // 0.5 for first filter, then Malus's law
  };

  const getFilterOrientation = (angle) => {
    if (angle >= -22.5 && angle <= 22.5) return "Horizontal";
    if (angle >= 22.5 && angle <= 67.5) return "Diagonal ↗";
    if (angle >= 67.5 && angle <= 112.5) return "Vertical";
    if (angle >= 112.5 && angle <= 157.5) return "Diagonal ↖";
    return "Horizontal";
  };

  const getTransmissionColor = (intensity) => {
    const alpha = Math.max(0.1, intensity / 100);
    return `rgba(59, 130, 246, ${alpha})`;
  };

  // Calculate resulting color and name
  const getColorResult = () => {
    if (!redEnabled && !greenEnabled && !blueEnabled) {
      return { color: '#000000', name: 'Black', description: 'No light (absence of all colors)' };
    }
    if (redEnabled && greenEnabled && blueEnabled) {
      return { color: '#ffffff', name: 'White', description: 'All primary colors combined' };
    }
    if (redEnabled && greenEnabled && !blueEnabled) {
      return { color: '#ffff00', name: 'Yellow', description: 'Red + Green' };
    }
    if (redEnabled && !greenEnabled && blueEnabled) {
      return { color: '#ff00ff', name: 'Magenta', description: 'Red + Blue' };
    }
    if (!redEnabled && greenEnabled && blueEnabled) {
      return { color: '#00ffff', name: 'Cyan', description: 'Green + Blue' };
    }
    if (redEnabled && !greenEnabled && !blueEnabled) {
      return { color: '#ff0000', name: 'Red', description: 'Red only' };
    }
    if (!redEnabled && greenEnabled && !blueEnabled) {
      return { color: '#00ff00', name: 'Green', description: 'Green only' };
    }
    if (!redEnabled && !greenEnabled && blueEnabled) {
      return { color: '#0000ff', name: 'Blue', description: 'Blue only' };
    }
  };

  return (
    <LessonContent
      lessonId="lesson_17_dispersion_scattering"
      title="Lesson 10 - Dispersion, Scattering, Colour, Polarisation"
      metadata={{ estimated_time: '50 minutes' }}
    >
      <TextSection>
        <div className="mb-6">
          <button
            onClick={() => setIsDispersionOpen(!isDispersionOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Dispersion</h3>
            <span className="text-blue-600">{isDispersionOpen ? '▼' : '▶'}</span>
          </button>

          {isDispersionOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  When light rays are refracted, the change in direction depends on the difference in 
                  speed between the two mediums.
                </p>
                
                <p className="text-gray-700 mb-4">
                  However!! The index of refraction (n) depends, to a small degree, on the wavelength of 
                  the light. Normally this effect is so small that it does not result in a noticeable 
                  difference between different wavelengths (i.e. colours) of light, but for glass triangular 
                  prisms, the difference in the index of refraction for different colours of light results in 
                  a separation of the white light into its spectrum of colours. This separation of light 
                  into its colours is called <span className="font-bold">dispersion</span>.
                </p>
                
                {/* Dispersion Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">White Light Dispersion Through a Prism</h4>
                  
                  <div className="flex justify-center">
                    <svg width="500" height="300" viewBox="0 0 500 300" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-disp" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#333" />
                        </marker>
                      </defs>
                      
                      {/* Triangular prism */}
                      <polygon points="150,50 100,200 200,200" 
                        fill="#e0f2fe" 
                        opacity="0.6" 
                        stroke="#0369a1" 
                        strokeWidth="2" />
                      
                      {/* Prism label */}
                      <text x="150" y="240" textAnchor="middle" className="text-sm fill-gray-700">Glass Prism</text>
                      
                      {/* White light incident ray */}
                      <line x1="30" y1="125" x2="130" y2="125" 
                        stroke="#333" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="80" y="115" textAnchor="middle" className="text-sm fill-gray-700">White Light</text>
                      
                      {/* Dispersed rays emerging from prism */}
                      <line x1="170" y1="125" x2="320" y2="80" 
                        stroke="#8b5cf6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="340" y="75" className="text-sm fill-purple-700 font-semibold">Violet</text>
                      
                      <line x1="170" y1="125" x2="325" y2="95" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="345" y="90" className="text-sm fill-blue-700 font-semibold">Blue</text>
                      
                      <line x1="170" y1="125" x2="330" y2="110" 
                        stroke="#10b981" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="350" y="105" className="text-sm fill-green-700 font-semibold">Green</text>
                      
                      <line x1="170" y1="125" x2="335" y2="125" 
                        stroke="#eab308" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="355" y="120" className="text-sm fill-yellow-700 font-semibold">Yellow</text>
                      
                      <line x1="170" y1="125" x2="330" y2="140" 
                        stroke="#f97316" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="350" y="135" className="text-sm fill-orange-700 font-semibold">Orange</text>
                      
                      <line x1="170" y1="125" x2="320" y2="170" 
                        stroke="#dc2626" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-disp)" />
                      <text x="340" y="175" className="text-sm fill-red-700 font-semibold">Red</text>
                      
                    
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    White light separates into its component colors due to wavelength-dependent refraction
                  </p>
                </div>
                
                <p className="text-gray-700 mb-4">
                  <span className="font-bold">Rainbows</span> are also a result of dispersion. If the sun is shining 
                  and there are water droplets in the air, either due to rain or mist from a waterfall or sprinkler, 
                  rainbows can form. Similar to the prism in the diagram above, different wavelengths of light are refracted 
                  by different amounts by water droplets. In this way, the different colours are separated, 
                  resulting in a rainbow. Note that where an observer sees the rainbow depends on the position 
                  of the observer. If the observer moves, the rainbow moves. Thus, you can never find the pot 
                  of gold that is rumoured to exist at the end of a rainbow.
                </p>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Key Point:</h4>
                  <p className="text-blue-900 text-sm">
                    The dispersion of light demonstrates that white light is actually a combination of all the 
                    colours of visible light combined together. Light is a spectrum of wavelengths and frequencies. 
                    But visible light is only a small part of the light spectrum. As you will learn in Lesson 24, 
                    radio, infra red, ultra violet and x-rays are all light waves – they have different wavelengths 
                    and frequencies, but their speeds are all the same: 3.00 × 10⁸ m/s.
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
            onClick={() => setIsScatteringOpen(!isScatteringOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Scattering – Why is the sky blue?</h3>
            <span className="text-blue-600">{isScatteringOpen ? '▼' : '▶'}</span>
          </button>

          {isScatteringOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  To understand why the sky is blue, we need to first understand how an object becomes 
                  visible to us. For example, if a white light source is turned on, the light may travel right 
                  past us without us seeing it unless it reflects off of particles like dust and lint in the air 
                  into our eyes or it is a focused light source.
                </p>
                
                <p className="text-gray-700 mb-4">
                  In order to see the light, some of the light must reflect off of particles like dust and lint in 
                  the air into our eyes. This is the basis of <span className="font-bold">scattering</span>. When light hits particles or 
                  molecules in the atmosphere, it is scattered in all directions by the particle or molecule. 
                  Some of the scattered light goes into our eyes, while the unscattered light continues 
                  without our knowing it was ever there.
                </p>
                
                {/* Scattering Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Light Scattering in the Atmosphere</h4>
                  
                  <div className="flex justify-center">
                    <svg width="500" height="250" viewBox="0 0 500 250" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-scatter" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#333" />
                        </marker>
                        <marker id="arrowhead-blue" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#3b82f6" />
                        </marker>
                      </defs>
                      
                      {/* Sun */}
                      <circle cx="50" cy="125" r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                      <text x="50" y="155" textAnchor="middle" className="text-sm fill-gray-700 font-semibold">Sun</text>
                      
                      {/* White light ray */}
                      <line x1="70" y1="125" x2="250" y2="125" 
                        stroke="#333" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-scatter)" />
                      <text x="160" y="115" textAnchor="middle" className="text-sm fill-gray-700">White Light</text>
                      
                      {/* Atmospheric particles */}
                      <circle cx="250" cy="125" r="8" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
                      <text x="250" y="145" textAnchor="middle" className="text-xs fill-gray-600">Air Molecules</text>
                      
                      {/* Scattered blue light in multiple directions */}
                      <line x1="250" y1="125" x2="320" y2="80" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-blue)" />
                      
                      <line x1="250" y1="125" x2="320" y2="170" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-blue)" />
                      
                      <line x1="250" y1="125" x2="300" y2="60" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-blue)" />
                      
                      <line x1="250" y1="125" x2="300" y2="190" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-blue)" />
                      
                      <line x1="250" y1="125" x2="180" y2="80" 
                        stroke="#3b82f6" 
                        strokeWidth="3" 
                        markerEnd="url(#arrowhead-blue)" />
                      
                      {/* Unscattered light continues */}
                      <line x1="258" y1="125" x2="450" y2="125" 
                        stroke="#333" 
                        strokeWidth="3" 
                        strokeDasharray="5,5"
                        markerEnd="url(#arrowhead-scatter)" />
                      <text x="350" y="115" textAnchor="middle" className="text-sm fill-gray-700">Unscattered Light</text>
                      
                      {/* Blue light label */}
                      <text x="350" y="50" textAnchor="middle" className="text-sm fill-blue-700 font-semibold">Scattered Blue Light</text>
                      
                      {/* Eye observing scattered light */}
                      <ellipse cx="320" cy="200" rx="8" ry="5" fill="#333" />
                      <text x="320" y="220" textAnchor="middle" className="text-xs fill-gray-600">Observer's Eye</text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    Blue light is scattered more than other colors, making the sky appear blue to observers
                  </p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Why Blue?</h4>
                  <p className="text-yellow-900 text-sm mb-2">
                    The scattering of light in the Earth's atmosphere is proportional to the fourth power of 
                    the frequency (f⁴). Therefore, the higher the frequency, the more the light will be scattered. 
                    Blue light and violet light are scattered much more than red or orange, so the sky looks blue.
                  </p>
                  <p className="text-yellow-900 text-sm">
                    The entire sky appears blue because the blue light is being scattered in all directions at 
                    the same time. Some blue light is scattered toward our eyes from every direction in the sky.
                  </p>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Sunsets</h4>
                  <p className="text-red-900 text-sm mb-2">
                    At sunset, the sun's rays have passed through a maximum length of atmosphere where 
                    much of the blue light is scattered out. Thus the light that reaches the surface of the 
                    earth and scatters off of dust particles in the sky is lacking in blue colored light.
                  </p>
                  <p className="text-red-900 text-sm">
                    The remaining light is scattered by the larger particles of dust in the lower atmosphere, 
                    making the sunset appear reddish.
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded border border-gray-100 mt-4">
                  <h4 className="font-semibold text-gray-800 mb-2">Additional Notes:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• The dependence of scattering on f⁴ is valid only if the scattering objects are much smaller than the wavelength of the light</li>
                    <li>• This is valid for oxygen and nitrogen molecules</li>
                    <li>• If the atmosphere did not contain oxygen or nitrogen, the sky would appear quite different</li>
                    <li>• Clouds contain water droplets or crystals that are much larger – they scatter all frequencies of light uniformly</li>
                    <li>• Hence clouds appear white</li>
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
            onClick={() => setIsColourOpen(!isColourOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Colour</h3>
            <span className="text-blue-600">{isColourOpen ? '▼' : '▶'}</span>
          </button>

          {isColourOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <p className="text-gray-700 mb-4">
                  As we saw with dispersion, white light is composed of different colours mixed together. 
                  Black is the absence of light.
                </p>
                
                <h4 className="font-semibold text-gray-800 mb-3">Subtraction Theory of Colour</h4>
                <p className="text-gray-700 mb-4">
                  The subtraction theory of colour attempts to explain the way that objects appear. When 
                  white light is incident on an object, the object will absorb certain colours and will reflect 
                  the remainder. For example, if white light is incident on a red object, blue and green are 
                  absorbed and red is reflected.
                </p>
                
                {/* Color Subtraction Diagram */}
                <div className="bg-white p-4 rounded border border-gray-300 mb-6">
                  <h5 className="text-center font-semibold text-gray-800 mb-3">Subtraction Theory Example</h5>
                  
                  <div className="flex justify-center">
                    <svg width="400" height="200" viewBox="0 0 400 200" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-color" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#333" />
                        </marker>
                        <marker id="arrowhead-red" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#dc2626" />
                        </marker>
                      </defs>
                      
                      {/* White light source */}
                      <circle cx="50" cy="100" r="15" fill="#fff" stroke="#333" strokeWidth="2" />
                      <text x="50" y="130" textAnchor="middle" className="text-xs fill-gray-700">White Light</text>
                      
                      {/* Incident white light */}
                      <line x1="65" y1="100" x2="150" y2="100" 
                        stroke="#333" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-color)" />
                      
                      {/* Red object */}
                      <rect x="150" y="75" width="50" height="50" 
                        fill="#dc2626" 
                        stroke="#991b1b" 
                        strokeWidth="2" />
                      <text x="175" y="150" textAnchor="middle" className="text-xs fill-gray-700">Red Object</text>
                      
                      {/* Reflected red light */}
                      <line x1="175" y1="75" x2="175" y2="20" 
                        stroke="#dc2626" 
                        strokeWidth="4" 
                        markerEnd="url(#arrowhead-red)" />
                      <text x="175" y="15" textAnchor="middle" className="text-sm fill-red-700 font-semibold">Red Reflected</text>
                      
                      {/* Absorbed light indicators */}
                      <text x="250" y="80" className="text-sm fill-blue-700">Blue Absorbed</text>
                      <text x="250" y="100" className="text-sm fill-green-700">Green Absorbed</text>
                      <text x="250" y="120" className="text-sm fill-red-700">Red Reflected</text>
                      
                      {/* Eye observing */}
                      <ellipse cx="175" cy="40" rx="8" ry="5" fill="#333" />
                      <text x="200" y="45" className="text-xs fill-gray-600">We see red</text>
                    </svg>
                  </div>
                  
                  <p className="text-center text-sm text-gray-600 mt-3">
                    A red object absorbs blue and green light, reflecting only red light to our eyes
                  </p>
                </div>
                
                <h4 className="font-semibold text-gray-800 mb-3">Addition Theory of Colour</h4>
                <p className="text-gray-700 mb-4">
                  The addition theory of light is that if different colours of light are combined, new colours 
                  will be formed. This is easily demonstrated using a colour light box.
                </p>
                
                <p className="text-gray-700 mb-4">
                  This is also the way that our eyes see colours. Specialised cells (cones) in our eyes are 
                  sensitive to colour. There are three types of cones – blue, green and red – which allow 
                  us to see all colours since every colour is a combination of these three primary colours.
                </p>
                
                {/* Interactive Color Mixer */}
                <div className="bg-white p-6 rounded border border-gray-300">
                  <h5 className="text-center font-semibold text-gray-800 mb-4">Interactive Color Mixer</h5>
                  <p className="text-center text-sm text-gray-600 mb-6">Toggle the primary colors to see how they combine</p>
                  
                  <div className="flex flex-col items-center space-y-6">
                    {/* Color Toggles */}
                    <div className="flex space-x-8">
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => setRedEnabled(!redEnabled)}
                          className={`w-16 h-16 rounded-full border-4 transition-all duration-200 ${
                            redEnabled 
                              ? 'bg-red-500 border-red-600 shadow-lg transform scale-105' 
                              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                          }`}
                        />
                        <span className="mt-2 text-sm font-semibold text-gray-700">Red</span>
                        <span className="text-xs text-gray-500">{redEnabled ? 'REFLECTED' : 'ABSORBED'}</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => setGreenEnabled(!greenEnabled)}
                          className={`w-16 h-16 rounded-full border-4 transition-all duration-200 ${
                            greenEnabled 
                              ? 'bg-green-500 border-green-600 shadow-lg transform scale-105' 
                              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                          }`}
                        />
                        <span className="mt-2 text-sm font-semibold text-gray-700">Green</span>
                        <span className="text-xs text-gray-500">{greenEnabled ? 'REFLECTED' : 'ABSORBED'}</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <button
                          onClick={() => setBlueEnabled(!blueEnabled)}
                          className={`w-16 h-16 rounded-full border-4 transition-all duration-200 ${
                            blueEnabled 
                              ? 'bg-blue-500 border-blue-600 shadow-lg transform scale-105' 
                              : 'bg-gray-200 border-gray-300 hover:bg-gray-300'
                          }`}
                        />
                        <span className="mt-2 text-sm font-semibold text-gray-700">Blue</span>
                        <span className="text-xs text-gray-500">{blueEnabled ? 'REFLECTED' : 'ABSORBED'}</span>
                      </div>
                    </div>
                    
                    {/* Resulting Color Display */}
                    <div className="flex flex-col items-center">
                      <div 
                        className="w-32 h-32 rounded-lg border-4 border-gray-400 shadow-lg transition-all duration-300"
                        style={{ backgroundColor: getColorResult().color }}
                      />
                      <div className="mt-4 text-center">
                        <h6 className="text-xl font-bold text-gray-800">{getColorResult().name}</h6>
                        <p className="text-sm text-gray-600">{getColorResult().description}</p>
                      </div>
                    </div>
                    
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
            onClick={() => setIsPolarisationOpen(!isPolarisationOpen)}
            className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
          >
            <h3 className="text-xl font-semibold">Polarisation</h3>
            <span className="text-blue-600">{isPolarisationOpen ? '▼' : '▶'}</span>
          </button>

          {isPolarisationOpen && (
            <div className="mt-4">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                {/* Interactive Polarisation Activity */}
                <div className="bg-white p-6 rounded border border-gray-300 mb-6">
                  <h4 className="text-center font-semibold text-gray-800 mb-3">Interactive Polarizing Filter Activity</h4>
                  <p className="text-center text-sm text-gray-600 mb-4">
                    Rotate the filters using the sliders to observe how polarized light behaves
                  </p>
                  
                  {/* Controls */}
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center justify-center space-x-8">
                      <div className="flex flex-col items-center">
                        <label className="text-sm font-semibold text-gray-700 mb-2">Filter 1 Angle</label>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          value={filter1Angle}
                          onChange={(e) => setFilter1Angle(parseInt(e.target.value))}
                          className="w-32"
                        />
                        <span className="text-sm text-gray-600 mt-1">{filter1Angle}° ({getFilterOrientation(filter1Angle)})</span>
                      </div>
                      
                      <div className="flex flex-col items-center">
                        <label className="text-sm font-semibold text-gray-700 mb-2">Filter 2 Angle</label>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          value={filter2Angle}
                          onChange={(e) => setFilter2Angle(parseInt(e.target.value))}
                          className="w-32"
                          disabled={!showSecondFilter}
                        />
                        <span className="text-sm text-gray-600 mt-1">{filter2Angle}° ({getFilterOrientation(filter2Angle)})</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center space-x-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showSecondFilter}
                          onChange={(e) => setShowSecondFilter(e.target.checked)}
                          className="mr-2"
                        />
                        <span className="text-sm text-gray-700">Show Second Filter</span>
                      </label>
                      
                      <div className="flex items-center space-x-2">
                        <label className="text-sm text-gray-700">Light Intensity:</label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={lightIntensity}
                          onChange={(e) => setLightIntensity(parseInt(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">{lightIntensity}%</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Interactive Visualization */}
                  <div className="flex justify-center">
                    <svg width="700" height="250" viewBox="0 0 700 250" className="border border-blue-300 bg-gray-50 rounded">
                      <defs>
                        <marker id="arrowhead-polar" markerWidth="4" markerHeight="3.5" refX="4" refY="1.75" orient="auto">
                          <polygon points="0 0, 4 1.75, 0 3.5" fill="#333" />
                        </marker>
                        <pattern id="diagonalHatch" patternUnits="userSpaceOnUse" width="4" height="4">
                          <path d="M-1,1 l2,-2 M0,4 l4,-4 M3,5 l2,-2" stroke="#475569" strokeWidth="0.5"/>
                        </pattern>
                      </defs>
                      
                      {/* Light source */}
                      <circle cx="100" cy="125" r="20" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
                      <text x="100" y="160" textAnchor="middle" className="text-sm fill-gray-700 font-semibold">Light Source</text>
                      <text x="100" y="175" textAnchor="middle" className="text-xs fill-gray-600">{lightIntensity}%</text>
                      
                      {/* Unpolarized light representation */}
                      <g>
                        <line x1="120" y1="125" x2="200" y2="125" stroke="#333" strokeWidth="3" opacity={lightIntensity/100} />
                        {/* Multiple vibration planes */}
                        {[0, 30, 60, 90, 120, 150].map((angle, i) => {
                          const rad = (angle * Math.PI) / 180;
                          const x1 = 140 + 15 * Math.cos(rad);
                          const y1 = 125 + 15 * Math.sin(rad);
                          const x2 = 140 - 15 * Math.cos(rad);
                          const y2 = 125 - 15 * Math.sin(rad);
                          return (
                            <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} 
                              stroke="#666" strokeWidth="1.5" opacity={lightIntensity/100 * 0.6} />
                          );
                        })}
                        <text x="160" y="105" textAnchor="middle" className="text-xs fill-gray-700">Unpolarized</text>
                        <text x="160" y="95" textAnchor="middle" className="text-xs fill-gray-700">Light</text>
                      </g>
                      
                      {/* First polarizing filter */}
                      <g transform={`translate(230, 125) rotate(${filter1Angle})`}>
                        <rect x="-5" y="-40" width="10" height="80" 
                          fill="url(#diagonalHatch)" stroke="#475569" strokeWidth="2" opacity="0.8" />
                        <line x1="-40" y1="0" x2="40" y2="0" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                      </g>
                      <text x="230" y="185" textAnchor="middle" className="text-sm fill-gray-700 font-semibold">Filter 1</text>
                      <text x="230" y="200" textAnchor="middle" className="text-xs fill-gray-600">{filter1Angle}°</text>
                      
                      {/* Light after first filter */}
                      <g opacity={lightIntensity/100 * 0.5}>
                        <line x1="235" y1="125" x2="330" y2="125" 
                          stroke="#3b82f6" strokeWidth="3" />
                        {/* Polarized vibration indicators */}
                        {[260, 280, 300].map((x, i) => {
                          const rad = (filter1Angle * Math.PI) / 180;
                          const dx = 12 * Math.cos(rad);
                          const dy = 12 * Math.sin(rad);
                          return (
                            <line key={i} x1={x - dx} y1={125 - dy} x2={x + dx} y2={125 + dy} 
                              stroke="#3b82f6" strokeWidth="2" />
                          );
                        })}
                        <text x="282" y="105" textAnchor="middle" className="text-xs fill-blue-700">Polarized</text>
                        <text x="282" y="95" textAnchor="middle" className="text-xs fill-blue-700">{getFilterOrientation(filter1Angle)}</text>
                      </g>
                      
                      {/* Second polarizing filter (if enabled) */}
                      {showSecondFilter && (
                        <>
                          <g transform={`translate(360, 125) rotate(${filter2Angle})`}>
                            <rect x="-5" y="-40" width="10" height="80" 
                              fill="url(#diagonalHatch)" stroke="#475569" strokeWidth="2" opacity="0.8" />
                            <line x1="-40" y1="0" x2="40" y2="0" stroke="#475569" strokeWidth="1" strokeDasharray="2,2" />
                          </g>
                          <text x="360" y="185" textAnchor="middle" className="text-sm fill-gray-700 font-semibold">Filter 2</text>
                          <text x="360" y="200" textAnchor="middle" className="text-xs fill-gray-600">{filter2Angle}°</text>
                        </>
                      )}
                      
                      {/* Final light output */}
                      {(() => {
                        const finalIntensity = calculateTransmission();
                        const finalOpacity = finalIntensity / 100;
                        const startX = showSecondFilter ? 365 : 235;
                        const endX = showSecondFilter ? 470 : 370;
                        
                        return (
                          <>
                            {/* Light beam with opacity */}
                            <g opacity={finalOpacity}>
                              <line x1={startX} y1="125" x2={endX} y2="125" 
                                stroke={getTransmissionColor(finalIntensity)} 
                                strokeWidth="4" />
                            </g>
                            
                            {/* Output intensity indicator - always fully visible */}
                            <rect x="410" y="20" width="140" height="45" 
                              fill="white" stroke="#333" strokeWidth="1.5" rx="5" />
                            <text x="480" y="38" textAnchor="middle" 
                              className="text-sm fill-gray-800 font-semibold">
                              Output Intensity
                            </text>
                            <text x="480" y="55" textAnchor="middle" 
                              className="text-lg fill-gray-800 font-bold">
                              {finalIntensity.toFixed(1)}%
                            </text>
                          </>
                        );
                      })()}
                      
                      {/* Angle difference indicator */}
                      {showSecondFilter && (
                        <g>
                          <text x="410" y="210" className="text-sm fill-gray-700">
                            Angle Difference: {Math.abs(filter2Angle - filter1Angle)}°
                          </text>
                          <text x="410" y="230" className="text-xs fill-gray-600">
                            {Math.abs(filter2Angle - filter1Angle) === 90 ? '(Perpendicular - Maximum blocking)' : 
                             Math.abs(filter2Angle - filter1Angle) === 0 ? '(Parallel - Maximum transmission)' : ''}
                          </text>
                        </g>
                      )}
                      
                      {/* Visual detector/screen */}
                      <rect x={showSecondFilter ? 480 : 390} y="85" width="80" height="80" 
                        fill={getTransmissionColor(calculateTransmission())} 
                        stroke="#333" strokeWidth="2" rx="5" />
                      <text x={showSecondFilter ? 520 : 430} y="180" textAnchor="middle" 
                        className="text-sm fill-gray-700 font-semibold">Detector</text>
                    </svg>
                  </div>
                  
                  {/* Educational Information Box */}
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h5 className="font-semibold text-blue-800 mb-2">How Polarizing Filters Work:</h5>
                    <p className="text-sm text-blue-900 mb-3">
                      Unpolarized light vibrates in all planes perpendicular to its direction of travel. When this light 
                      passes through a polarizing filter, the filter acts like a gate that only allows light waves 
                      vibrating in one specific plane to pass through. This first filter reduces the light intensity 
                      by about 50% because it blocks all the light vibrating in other planes.
                    </p>
                    
                    {showSecondFilter && (
                      <p className="text-sm text-blue-900 mb-3">
                        When the polarized light encounters a second filter, what happens depends on the angle between 
                        the two filters:
                      </p>
                    )}
                    
                    <ul className="text-sm text-blue-900 space-y-2">
                      <li>• <strong>Filters parallel (0° difference):</strong> The light passes through with minimal additional loss</li>
                      {showSecondFilter && (
                        <>
                          <li>• <strong>Filters at an angle:</strong> Some light is blocked - the greater the angle, the more light is absorbed</li>
                          <li>• <strong>Filters perpendicular (90° difference):</strong> Almost all light is blocked because the second filter only accepts light vibrating at right angles to what's coming through</li>
                        </>
                      )}
                    </ul>
                    
                    <div className="mt-3 p-2 bg-white rounded border border-blue-300">
                      <p className="text-xs text-gray-700">
                        <strong>Try it yourself:</strong> Rotate the filters using the sliders above. Notice how the light intensity 
                        changes smoothly as you adjust the angle difference. This demonstrates that light behaves as a wave 
                        that can be selectively filtered based on its vibration direction.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Evidence for Transverse Waves:</h4>
                  <p className="text-blue-900 text-sm mb-2">
                    Could these results be explained by longitudinal waves? If light travelled as a 
                    longitudinal wave, the vibrations would vibrate in only one direction, namely, the 
                    direction in which the wave was travelling. Such a wave would pass through a pair of 
                    polarising filters unaffected. In other words, a longitudinal wave cannot be polarised.
                  </p>
                  <p className="text-blue-900 text-sm">
                    Based on the polarisation evidence, we may conclude that light behaves like a 
                    <span className="font-bold"> transverse wave, not a longitudinal wave</span>.
                  </p>
                </div>
                
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Key Applications:</h4>
                  <ul className="text-green-900 text-sm space-y-1">
                    <li>• Polarising sunglasses reduce glare by blocking horizontally polarised reflected light</li>
                    <li>• LCD screens use polarising filters to control light transmission</li>
                    <li>• Polarising filters are used in photography to reduce reflections and enhance contrast</li>
                    <li>• 3D movies use polarised light to create separate images for each eye</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </TextSection>

      <TextSection>
        <SlideshowKnowledgeCheck
          courseId={courseId}
          lessonPath="17-dispersion-scattering"
          questions={[
            {
              type: 'multiple-choice',
              questionId: 'course2_17_dispersion_air_speeds',
              title: 'Question 1: Light Speed in Air'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_diamond_dispersion',
              title: 'Question 2: Diamond Dispersion'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_microscopy_scattering',
              title: 'Question 3: Microscopy and Scattering'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_clothing_color_heat',
              title: 'Question 4: Clothing Color and Heat'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_red_orange_difference',
              title: 'Question 5: Red vs Orange Light'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_stage_lighting_color',
              title: 'Question 6: Stage Lighting Effects'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_window_glass_dispersion',
              title: 'Question 7: Window Glass Dispersion'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_green_object_lighting',
              title: 'Question 8: Green Object Under Different Lights'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_cat_color_vision',
              title: 'Question 9: Cat Color Vision'
            },
            {
              type: 'multiple-choice',
              questionId: 'course2_17_moonlight_colorless',
              title: 'Question 10: Moonlight and Color'
            }
          ]}
          theme="blue"
        />
      </TextSection>

      <LessonSummary
        points={[
          "Dispersion separates white light into colors through prisms; explains rainbows and light spectra",
          "Blue light scatters more than red light, making the sky blue and sunsets red/orange",
          "Objects appear colored by reflecting certain wavelengths and absorbing others (subtraction theory)",
          "Combining red, green, and blue light creates all other colors including white (addition theory)",
          "Unpolarized light vibrates in all directions; polarizing filters allow only one direction through",
          "Parallel polarizing filters transmit light; perpendicular filters block almost all light",
          "Polarization proves light behaves as transverse waves, not longitudinal waves"
        ]}
      />
    </LessonContent>
  );
};

export default DispersionScattering;