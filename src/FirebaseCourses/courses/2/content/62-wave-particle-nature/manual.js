import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive Wave-Particle Spectrum Component
const WaveParticleSpectrumComponent = () => {
  const [selectedRegion, setSelectedRegion] = useState('visible');
  
  const spectrumRegions = {
    radio: {
      name: 'Radio Waves',
      frequency: '10⁶ Hz',
      wavelength: '300 m',
      energy: 'Very Low',
      behavior: 'Strongly Wave-like',
      color: '#FF6B6B',
      description: 'Long wavelength, low energy radiation behaves almost entirely as a wave'
    },
    infrared: {
      name: 'Infrared',
      frequency: '10¹² Hz',
      wavelength: '10⁻⁴ m',
      energy: 'Low',
      behavior: 'Mostly Wave-like',
      color: '#FF8E53',
      description: 'Heat radiation still exhibits primarily wave characteristics'
    },
    visible: {
      name: 'Visible Light',
      frequency: '10¹⁴ Hz',
      wavelength: '500 nm',
      energy: 'Medium',
      behavior: 'Both Wave & Particle',
      color: '#4ECDC4',
      description: 'The overlap region where both wave and particle nature are observable'
    },
    ultraviolet: {
      name: 'Ultraviolet',
      frequency: '10¹⁶ Hz',
      wavelength: '10 nm',
      energy: 'High',
      behavior: 'Mostly Particle-like',
      color: '#45B7D1',
      description: 'Higher energy photons show increased particle behavior'
    },
    xray: {
      name: 'X-rays',
      frequency: '10¹⁸ Hz',
      wavelength: '0.1 nm',
      energy: 'Very High',
      behavior: 'Strongly Particle-like',
      color: '#9B59B6',
      description: 'High energy radiation behaves predominantly as particles (photons)'
    },
    gamma: {
      name: 'Gamma Rays',
      frequency: '10²² Hz',
      wavelength: '10⁻¹² m',
      energy: 'Extreme',
      behavior: 'Particle-like',
      color: '#8E44AD',
      description: 'Highest energy photons exhibit almost purely particle characteristics'
    }
  };
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Electromagnetic Spectrum: Wave vs. Particle Behavior</h4>
      
      {/* Spectrum Visualization */}
      <div className="bg-black rounded p-4 mb-4">
        <svg width="700" height="200">
          {/* Spectrum bar */}
          <defs>
            <linearGradient id="spectrum" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style={{stopColor: "#FF6B6B", stopOpacity: 1}} />
              <stop offset="16.67%" style={{stopColor: "#FF8E53", stopOpacity: 1}} />
              <stop offset="33.33%" style={{stopColor: "#4ECDC4", stopOpacity: 1}} />
              <stop offset="50%" style={{stopColor: "#45B7D1", stopOpacity: 1}} />
              <stop offset="66.67%" style={{stopColor: "#9B59B6", stopOpacity: 1}} />
              <stop offset="100%" style={{stopColor: "#8E44AD", stopOpacity: 1}} />
            </linearGradient>
          </defs>
          
          <rect x="50" y="80" width="600" height="40" fill="url(#spectrum)" stroke="#FFF" strokeWidth="2" />
          
          {/* Frequency labels */}
          <text x="50" y="75" fill="#FFF" fontSize="10" textAnchor="start">10⁶ Hz</text>
          <text x="650" y="75" fill="#FFF" fontSize="10" textAnchor="end">10²² Hz</text>
          <text x="350" y="75" fill="#FFF" fontSize="10" textAnchor="middle">Frequency</text>
          
          {/* Wave/Particle indicators */}
          <text x="125" y="140" fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="bold">WAVE</text>
          <text x="125" y="155" fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="bold">NATURE</text>
          
          <text x="575" y="140" fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="bold">PARTICLE</text>
          <text x="575" y="155" fill="#FFF" fontSize="12" textAnchor="middle" fontWeight="bold">NATURE</text>
          
          {/* Energy arrow */}
          <path d="M 50 170 L 650 170" stroke="#FFF" strokeWidth="2" markerEnd="url(#arrowhead)" />
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill="#FFF" />
            </marker>
          </defs>
          <text x="350" y="185" fill="#FFF" fontSize="12" textAnchor="middle">Increasing Energy (E = hf)</text>
          
          {/* Clickable regions */}
          {Object.entries(spectrumRegions).map(([ key, region], index) => (
            <rect
              key={key}
              x={50 + index * 100}
              y={80}
              width={100}
              height={40}
              fill="transparent"
              stroke={selectedRegion === key ? '#FFD700' : 'transparent'}
              strokeWidth="3"
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedRegion(key)}
            />
          ))}
        </svg>
      </div>
      
      {/* Region Selector */}
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Spectrum Region:</label>
        <select
          value={selectedRegion}
          onChange={(e) => setSelectedRegion(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.entries(spectrumRegions).map(([key, region]) => (
            <option key={key} value={key}>
              {region.name}
            </option>
          ))}
        </select>
      </div>
      
      {/* Selected Region Info */}
      <div className="bg-gray-800 p-4 rounded">
        <h5 className="font-semibold mb-2" style={{color: spectrumRegions[selectedRegion].color}}>
          {spectrumRegions[selectedRegion].name}
        </h5>
        <div className="grid grid-cols-2 gap-4 text-white text-sm">
          <div>
            <p><strong>Frequency:</strong> {spectrumRegions[selectedRegion].frequency}</p>
            <p><strong>Wavelength:</strong> {spectrumRegions[selectedRegion].wavelength}</p>
          </div>
          <div>
            <p><strong>Energy:</strong> {spectrumRegions[selectedRegion].energy}</p>
            <p><strong>Behavior:</strong> {spectrumRegions[selectedRegion].behavior}</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm mt-2">{spectrumRegions[selectedRegion].description}</p>
      </div>
    </div>
  );
};

// Interactive de Broglie Wavelength Calculator
const DeBroglieCalculatorComponent = () => {
  const [particle, setParticle] = useState('electron');
  const [velocity, setVelocity] = useState(1000000); // m/s
  const [showCalculation, setShowCalculation] = useState(false);
  
  const particles = {
    electron: { mass: 9.11e-31, name: 'Electron', unit: 'kg' },
    proton: { mass: 1.67e-27, name: 'Proton', unit: 'kg' },
    neutron: { mass: 1.67e-27, name: 'Neutron', unit: 'kg' },
    baseball: { mass: 0.145, name: 'Baseball', unit: 'kg' },
    car: { mass: 1000, name: 'Car', unit: 'kg' }
  };
  
  const h = 6.63e-34; // Planck's constant
  const wavelength = h / (particles[particle].mass * velocity);
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">de Broglie Wavelength Calculator</h4>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-white font-medium mb-2 block">Particle Type:</label>
          <select
            value={particle}
            onChange={(e) => setParticle(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            {Object.entries(particles).map(([key, p]) => (
              <option key={key} value={key}>
                {p.name} (m = {p.mass} {p.unit})
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-white font-medium mb-2 block">Velocity (m/s):</label>
          <input
            type="range"
            min="1000"
            max="100000000"
            step="1000"
            value={velocity}
            onChange={(e) => setVelocity(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-white text-sm">{velocity.toLocaleString()} m/s</span>
        </div>
      </div>
      
      {/* Results */}
      <div className="bg-gray-800 p-4 rounded mb-4">
        <h5 className="font-semibold text-blue-300 mb-2">de Broglie Wavelength:</h5>
        <div className="text-white">
          <p className="text-2xl font-bold">{wavelength.toExponential(2)} m</p>
          <p className="text-sm text-gray-300 mt-2">
            For comparison: visible light wavelength ≈ 5 × 10⁻⁷ m
          </p>
        </div>
      </div>
      
      {/* Show calculation button */}
      <button
        onClick={() => setShowCalculation(!showCalculation)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors mb-4"
      >
        {showCalculation ? 'Hide' : 'Show'} Calculation
      </button>
      
      {/* Calculation details */}
      {showCalculation && (
        <div className="bg-black p-4 rounded text-white text-sm">
          <p className="mb-2"><strong>de Broglie equation:</strong> λ = h / (mv)</p>
          <p className="mb-2">h = {h.toExponential(2)} J·s</p>
          <p className="mb-2">m = {particles[particle].mass} kg</p>
          <p className="mb-2">v = {velocity.toLocaleString()} m/s</p>
          <p className="mt-4">λ = {h.toExponential(2)} / ({particles[particle].mass} × {velocity.toLocaleString()})</p>
          <p className="font-bold">λ = {wavelength.toExponential(2)} m</p>
        </div>
      )}
    </div>
  );
};

// Interactive Standing Wave Component
const StandingWaveComponent = () => {
  const [numWaves, setNumWaves] = useState(3);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const radius = 80;
  const centerX = 150;
  const centerY = 150;
  
  const generateWavePoints = (n) => {
    const points = [];
    const angleStep = (2 * Math.PI) / 100;
    
    for (let i = 0; i <= 100; i++) {
      const angle = i * angleStep;
      const waveAmplitude = 10 * Math.sin(n * angle);
      const x = centerX + (radius + waveAmplitude) * Math.cos(angle);
      const y = centerY + (radius + waveAmplitude) * Math.sin(angle);
      points.push(`${x},${y}`);
    }
    return points.join(' ');
  };
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Electron Standing Waves in Circular Orbits</h4>
      
      {/* Controls */}
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Number of Wavelengths (n):</label>
        <input
          type="range"
          min="1"
          max="6"
          value={numWaves}
          onChange={(e) => setNumWaves(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-white text-sm">n = {numWaves}</span>
      </div>
      
      {/* Wave visualization */}
      <div className="bg-black rounded p-4 mb-4 flex justify-center">
        <svg width="300" height="300">
          {/* Orbit circle */}
          <circle 
            cx={centerX} 
            cy={centerY} 
            r={radius} 
            fill="none" 
            stroke="#444" 
            strokeWidth="2" 
            strokeDasharray="3,3" 
          />
          
          {/* Standing wave */}
          <polyline
            points={generateWavePoints(numWaves)}
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="3"
          >
            {isAnimating && (
              <animate
                attributeName="stroke-opacity"
                values="0.3;1;0.3"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </polyline>
          
          {/* Center nucleus */}
          <circle cx={centerX} cy={centerY} r="6" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
          <text x={centerX} y={centerY + 25} fill="#FFD700" fontSize="10" textAnchor="middle">
            Nucleus
          </text>
          
          {/* Wave equation */}
          <text x={centerX} y="30" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">
            2πr = nλ
          </text>
          <text x={centerX} y="50" fill="#FFF" fontSize="12" textAnchor="middle">
            n = {numWaves} wavelengths
          </text>
        </svg>
      </div>
      
      {/* Animation control */}
      <button
        onClick={() => setIsAnimating(!isAnimating)}
        className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors mb-4"
      >
        {isAnimating ? 'Stop' : 'Start'} Animation
      </button>
      
      {/* Explanation */}
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        <p className="mb-2">
          <strong>Condition for stable orbit:</strong> The circumference must contain a whole number of wavelengths.
        </p>
        <p className="mb-2">
          When n = {numWaves}, the wave {numWaves === 1 || numWaves === 2 || numWaves === 3 ? 'constructively interferes' : 'may have interference issues'} with itself.
        </p>
        <p>
          This leads to Bohr's quantization condition: mvr = nℏ/2π
        </p>
      </div>
    </div>
  );
};

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode, AIAccordion, onAIAccordionContent }) => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Wave–Particle Nature of Light and Matter
        </h1>
        <p className="text-lg text-gray-600">
          The revolutionary discovery of quantum duality
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">

            <AIAccordion.Item value="introduction" title="Wave-Particle Duality" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              Many centuries ago, especially in the time of Isaac Newton and Christian Huygens, there was an 
              intense debate over the nature of light. Newton argued for a corpuscular (i.e. small particle) 
              theory of light, while Huygens championed the wave theory of light.
            </p>
            
            <p className="mb-4">
              Different observations of the properties of light supported different theories. The observation 
              that light rays travel in straight lines lends support to a corpuscular idea, while the spreading 
              of light from a source in all directions, like a candle, may be visualised as a wave. The debate 
              was seemingly resolved in the early 18th century when, as we saw in Lessons 11 and 12, Young 
              demonstrated that light exhibited interference properties which clearly show that light is a wave.
            </p>
            
            <p className="mb-6">
              However, a wave theory of light is not able to explain other phenomena. While a wave-like 
              description of light explains the diffraction and interference of light, the application of a 
              quantum, particle-like conception of light (i.e. photons) is required to explain such phenomena 
              as the photoelectric effect (Lesson 29), emission and absorption spectra (Lesson 30), and gamma 
              radiation (see Lesson 35).
            </p>
            
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Key Insight</h4>
              <p className="mb-2">
                <strong>Light is both wave and particle at the same time</strong> and the properties that we 
                observe depend on:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>(a) the energy <InlineMath math="(E = hf)" /> of the light</li>
                <li>(b) the kind of experiment we decide to conduct</li>
              </ul>
              <p className="mt-2 text-sm font-semibold">
                Generally speaking, the more energetic the photon, the more particle-like its behaviour will be.
              </p>
            </div>
            
            <WaveParticleSpectrumComponent />
            
            <div className="mt-6 bg-blue-100 p-4 rounded-lg">
              <p className="text-sm">
                Notice that the overlap between dominant particle and wave nature occurs for light that we as 
                humans can see. Therefore, the wave-like or particle-like behaviour of light depends on the 
                particular phenomenon that we are investigating.
              </p>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="wavelengths" title="I. Wavelengths of Matter" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-blue-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Louis de Broglie (1892-1987)</h4>
              <p className="text-sm">
                Louis de Broglie was educated in history at the Sorbonne. After serving in World War I in the 
                field of communications he returned to the Sorbonne to study science. He became interested in 
                the work of Compton and began to study the wave-particle duality of nature. His work earned 
                him the 1929 Nobel Prize for Physics.
              </p>
            </div>
            
            <p className="mb-4">
              When Compton had suggested through his x-ray scattering experiments that light photons had 
              particle-like characteristics, de Broglie wondered if the converse was true – could subatomic 
              particles like the electron behave like a wave?
            </p>
            
            <p className="mb-6">
              De Broglie sought an expression for the wavelength that might be associated with wave-like 
              behavior of an electron, the smallest known particle at the time.
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold mb-3">Derivation of de Broglie's Wavelength Formula</h4>
              <p className="mb-2">The momentum of a particle (Lesson 1) is given by:</p>
              <BlockMath math="p = mv" />
              <p className="mb-2">The momentum of a photon (Lesson 32) is given by:</p>
              <BlockMath math="p = \frac{h}{\lambda}" />
              <p className="mb-2">By equating the two relationships we get:</p>
              <BlockMath math="mv = \frac{h}{\lambda}" />
              <p className="mb-2">Re-arranging the equation we get <strong>de Broglie's wavelength formula:</strong></p>
              <div className="bg-white p-3 rounded border-2 border-blue-400">
                <BlockMath math="\lambda = \frac{h}{mv}" />
              </div>
            </div>
            
            <p className="mb-4">
              If de Broglie's wavelength formula was correct, then an electron should demonstrate some 
              wavelike characteristics. Moreover, as the speed of the electron became larger, its wavelength 
              should be shorter.
            </p>
            
            <DeBroglieCalculatorComponent />
            
            <div className="mt-6 bg-green-100 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Experimental Confirmation</h4>
              <p className="text-sm mb-2">
                Since diffraction was the easiest phenomena to demonstrate the wavelike nature of something, 
                Young had done so for light in 1804, de Broglie and his associates began to find some way to 
                demonstrate the diffraction of electrons.
              </p>
              <p className="text-sm mb-2">
                According to Fresnel's wave theory, in order to observe diffraction the wavelike electrons 
                must pass through a gap proportional to the wavelength. Such "gaps" are found between atoms 
                in a crystal structure.
              </p>
              <ul className="text-sm space-y-1">
                <li><strong>1923:</strong> C.J. Davisson and L.H. Germer successfully demonstrated the diffraction of electrons through a crystal of nickel.</li>
                <li><strong>1927:</strong> G.P. Thomson, son of J.J. Thomson, obtained diffraction of electrons through a gold foil.</li>
              </ul>
              <p className="text-sm mt-2 font-semibold">
                Both of these experiments confirmed that electrons display wave characteristics.
              </p>
            </div>
            
            <div className="mt-4 bg-yellow-100 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-2">Why Don't We See Wave Behavior in Daily Life?</h4>
              <p className="text-sm mb-2">
                If we use a 1.00 kg mass traveling at 10.0 m/s, de Broglie's equation gives us a wavelength of:
              </p>
              <BlockMath math="\lambda = \frac{h}{mv} = \frac{6.63 \times 10^{-34} \text{ J·s}}{1.0 \text{ kg} \times 10.0 \text{ m/s}} = 6.63 \times 10^{-35} \text{ m}" />
              <p className="text-sm">
                This wavelength is far too small to be seen in the everyday world of objects. Therefore, 
                we are not aware of the wave nature of everyday material objects.
              </p>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="orbiting" title="II. Orbiting Electron Waves" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              Louis de Broglie now began to apply the wave nature of the electron to the electrons orbiting 
              around hydrogen nuclei. Assuming that the electron acts like a wave in the hydrogen atom rather 
              than a particle, de Broglie began to try to fit his wavelength into a circle.
            </p>
            
            <p className="mb-6">
              The electron acts like a standing wave spread over an orbit (circle) of radius (r). Some wavelengths 
              fit and some do not. When a wave does not constructively close, it interferes with itself and rapidly 
              dies out. Only waves that constructively interfere are stable.
            </p>
            
            <StandingWaveComponent />
            
            <div className="mt-6 bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-3">Derivation of Quantization Condition</h4>
              <p className="mb-2">De Broglie found that the conditions for a proper fit can be expressed as an equation.</p>
              <p className="mb-2">Since the circumference equals <InlineMath math="2\pi r" /> and n equals whole number values of wavelengths:</p>
              <BlockMath math="2\pi r = n\lambda" />
              <p className="mb-2">Rearranging slightly:</p>
              <BlockMath math="\lambda = \frac{2\pi r}{n}" />
              <p className="mb-2">Combined with de Broglie's wavelength equation <InlineMath math="\lambda = \frac{h}{mv}" /> we get:</p>
              <BlockMath math="\frac{h}{mv} = \frac{2\pi r}{n}" />
              <p className="mb-2">Or:</p>
              <div className="bg-white p-3 rounded border-2 border-purple-400">
                <BlockMath math="mvr = \frac{nh}{2\pi}" />
              </div>
            </div>
            
            <div className="mt-6 bg-red-100 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-2">Amazing Result!</h4>
              <p className="text-sm">
                This is the mathematical form of one of <strong>Bohr's postulates</strong>: An electron can only 
                have certain discrete, stationary orbits. De Broglie's relationship for the electron acting like 
                a wave in an orbit allows us to derive Bohr's quantized equation where n is Bohr's primary 
                quantum number for the energy level of the electron.
              </p>
              <p className="text-sm mt-2">
                Further, the idea that electrons within an atom behave as waves rather than as orbiting particles 
                explains why they do not continuously radiate electromagnetic energy.
              </p>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="examples" title="Examples" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            
            {/* Example 1 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 1</h3>
              <p className="mb-4 text-gray-700">
                What is the wavelength associated with an electron moving at half the speed of light?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>v = ½c = ½(3.00 × 10⁸ m/s) = 1.50 × 10⁸ m/s</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
                <p>mₑ = 9.11 × 10⁻³¹ kg</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <BlockMath math="\lambda = \frac{h}{mv}" />
                <BlockMath math="\lambda = \frac{6.63 \times 10^{-34} \text{ J·s}}{(9.11 \times 10^{-31} \text{ kg})(1.50 \times 10^8 \text{ m/s})}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\lambda = 4.85 \times 10^{-12} \text{ m}" />
                </div>
              </div>
            </div>
            
            {/* Example 2 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 2</h3>
              <p className="mb-4 text-gray-700">
                If an electron is allowed to accelerate through a potential difference of 100 V, what is its 
                de Broglie wavelength?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>V = 100 V</p>
                <p>e = 1.60 × 10⁻¹⁹ C</p>
                <p>mₑ = 9.11 × 10⁻³¹ kg</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <p>First find the speed (v) of the electron:</p>
                <BlockMath math="E_p = E_K" />
                <BlockMath math="qV = \frac{1}{2}mv^2" />
                <BlockMath math="v = \sqrt{\frac{2qV}{m}}" />
                <BlockMath math="v = \sqrt{\frac{2(1.60 \times 10^{-19} \text{ C})(100 \text{ V})}{9.11 \times 10^{-31} \text{ kg}}}" />
                <BlockMath math="v = 5.93 \times 10^6 \text{ m/s}" />
                
                <p className="mt-4">Using the de Broglie wavelength formula:</p>
                <BlockMath math="\lambda = \frac{h}{mv}" />
                <BlockMath math="\lambda = \frac{6.63 \times 10^{-34} \text{ J·s}}{(9.11 \times 10^{-31} \text{ kg})(5.93 \times 10^6 \text{ m/s})}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\lambda = 1.23 \times 10^{-10} \text{ m}" />
                </div>
              </div>
            </div>
            
            {/* Example 3 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 3</h3>
              <p className="mb-4 text-gray-700">
                If the wavelength for an electron in an atom is 2.0 × 10⁻¹⁰ m, what is the smallest 
                allowable orbital radius for this electron?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>λ = 2.0 × 10⁻¹⁰ m</p>
                <p>n = 1 (smallest allowable orbit)</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <BlockMath math="2\pi r = n\lambda \quad (n = 1)" />
                <BlockMath math="r = \frac{n\lambda}{2\pi}" />
                <BlockMath math="r = \frac{(1)(2.0 \times 10^{-10} \text{ m})}{2\pi}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="r = 3.18 \times 10^{-11} \text{ m}" />
                </div>
              </div>
            </div>
            
            {/* Example 4 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 4</h3>
              <p className="mb-4 text-gray-700">
                Louis de Broglie checked his idea by substituting Bohr's energy of the electron in the first 
                energy level of hydrogen (13.6 eV) into his standing wave relationship.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>E₁ = 13.6 eV</p>
                <p>1 eV = 1.6 × 10⁻¹⁹ J</p>
                <p>mₑ = 9.11 × 10⁻³¹ kg</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <p>First, convert 13.6 eV to Joules:</p>
                <BlockMath math="E_1 = 13.6 \text{ eV} \times 1.6 \times 10^{-19} \text{ J/eV} = 2.176 \times 10^{-18} \text{ J}" />
                
                <p className="mt-4">Now find the speed of the electron in the first energy level orbit:</p>
                <BlockMath math="v = \sqrt{\frac{2E_k}{m}}" />
                <BlockMath math="v = \sqrt{\frac{2(2.176 \times 10^{-18} \text{ J})}{9.11 \times 10^{-31} \text{ kg}}}" />
                <BlockMath math="v = 2.187 \times 10^6 \text{ m/s}" />
                
                <p className="mt-4">Then find the associated radius for the first energy level (n = 1):</p>
                <BlockMath math="r = \frac{nh}{2\pi mv}" />
                <BlockMath math="r = \frac{(1)(6.63 \times 10^{-34} \text{ J·s})}{2\pi (9.11 \times 10^{-31} \text{ kg})(2.187 \times 10^6 \text{ m/s})}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="r = 5.3 \times 10^{-11} \text{ m}" />
                </div>
                <p className="mt-2 text-sm font-semibold text-green-700">
                  We get the same radius that Bohr calculated for his hydrogen orbit!
                </p>
              </div>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="doubleSlit" title="III. Double-slit Interference of Particle Waves" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              The de Broglie equation for particle wavelength provides no hint as to what kind of wave is 
              associated with a particle of matter. To gain some insight into the nature of this wave, an 
              electron version of Young's double-slit experiment was conducted in 1988-89 by A. Tonomura, 
              J. Endo, T. Matsuda, and T. Kawasaki.
            </p>
            
            <p className="mb-6">
              When a beam of electrons (i.e. thousands of them per second) pass through the double-slits, 
              bright fringes occur in places on the screen where particle waves coming from each slit 
              interfere constructively, while dark fringes occur in places where the particle waves 
              interfere destructively.
            </p>
            
            <div className="bg-blue-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">The Revolutionary Discovery</h4>
              <p className="text-sm mb-2">
                At this point, Tonomura and his team changed the experiment. Instead of sending thousands 
                of electrons through the slits, they sent <strong>one electron at a time</strong> through 
                one of the slits.
              </p>
              <p className="text-sm">
                When an electron passes through the double-slit arrangement and strikes a spot on the screen, 
                the screen glows at that spot. As more and more electrons strike the screen, the spots 
                eventually form the fringe pattern that is evident when a beam of electrons is sent through 
                both slits.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded border text-center">
                <div className="bg-gray-200 h-24 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs">Random dots</span>
                </div>
                <p className="text-sm font-semibold">After 100 electrons</p>
                <p className="text-xs">No clear pattern</p>
              </div>
              <div className="bg-white p-4 rounded border text-center">
                <div className="bg-gray-300 h-24 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs">Emerging pattern</span>
                </div>
                <p className="text-sm font-semibold">After 3,000 electrons</p>
                <p className="text-xs">Pattern starting to emerge</p>
              </div>
              <div className="bg-white p-4 rounded border text-center">
                <div className="bg-gray-400 h-24 rounded mb-2 flex items-center justify-center">
                  <span className="text-xs">Clear fringes</span>
                </div>
                <p className="text-sm font-semibold">After 70,000 electrons</p>
                <p className="text-xs">Clear interference pattern</p>
              </div>
            </div>
            
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">Max Born's Interpretation (1926)</h4>
              <p className="text-sm mb-2">
                Here lies the key to understanding particle waves. The German physicist Max Born suggested 
                that the wave nature of particles is best understood as a <strong>measure of the probability</strong> 
                that the particles will be found at a particular location.
              </p>
              <ul className="text-sm space-y-1">
                <li>• <strong>Bright fringes</strong> occur where there is a high probability of electrons striking the screen</li>
                <li>• <strong>Dark fringes</strong> occur where there is a low probability</li>
                <li>• <strong>Particle waves are waves of probability</strong></li>
              </ul>
            </div>
            
            <div className="bg-red-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-red-800 mb-2">The Even More Bizarre Part</h4>
              <p className="text-sm mb-2">
                When a single-slit is used for either light or electrons the interference pattern is different 
                from the pattern produced for a double-slit apparatus. When electrons are sent one at a time 
                through a single-slit, the single-slit interference pattern emerges after sufficient electrons.
              </p>
              <p className="text-sm mb-2">
                <strong>But here's the mystery:</strong> When another slit is added to the apparatus and electrons 
                are sent through only one of the slits one at a time, you would "expect" that a single-slit 
                pattern would emerge since no electrons go through the other slit.
              </p>
              <p className="text-sm font-bold text-red-600">
                But this is not the case. When the second slit is added the pattern becomes a double-slit 
                interference pattern. How do the electrons "know" that there is another slit?
              </p>
            </div>
            
            <div className="bg-purple-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-purple-800 mb-2">Quantum Indeterminacy</h4>
              <p className="text-sm mb-2">
                This measure of probability of a particle's location is called <strong>quantum indeterminacy</strong>. 
                This concept is the most profound difference between quantum physics and classical physics.
              </p>
              <p className="text-sm">
                According to quantum physics, nature does not always do exactly the same thing for the same 
                set of conditions. Instead, the future develops probabilistically, and quantum physics is 
                the science that allows us to predict the possible range of events that may occur.
              </p>
            </div>
            
            <div className="bg-green-100 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Birth of Quantum Mechanics</h4>
              <p className="text-sm mb-2">
                Thus, de Broglie's work allows us to consider the electron in the atom as a particle moving 
                in an orbit with a certain quantized value of (mvr), or as a standing de Broglie type electron 
                wave occupying a certain region around the nucleus <InlineMath math="\frac{nh}{2\pi}" />.
              </p>
              <p className="text-sm mb-2">
                In 1925, the Austrian physicist <strong>Erwin Schrödinger (1887-1961)</strong> and the German 
                physicist <strong>Werner Heisenberg (1901-1976)</strong> independently developed theoretical 
                frameworks for determining the wave functions of electrons in atoms.
              </p>
              <ul className="text-sm space-y-1">
                <li>• <strong>Schrödinger:</strong> Assumed the electron acts like a wave</li>
                <li>• <strong>Heisenberg:</strong> Assumed the electron acts like a particle</li>
                <li>• Later it was shown that both models were equivalent</li>
              </ul>
              <p className="text-sm mt-2 font-semibold">
                In doing so, they established a new branch of physics called <strong>quantum mechanics</strong>.
              </p>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="uncertainty" title="IV. The Heisenberg Uncertainty Principle" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-blue-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Werner Heisenberg (1901-1976)</h4>
              <p className="text-sm mb-2">
                Werner Heisenberg was born in Würzberg, Germany. He received a PhD in physics in 1923 and 
                worked under Max Born and Neils Bohr for a short period of time. He received the Nobel 
                prize for physics in 1932.
              </p>
              <p className="text-sm">
                During the war he worked for the German atomic bomb project. After the war he was the 
                head of the Max Planck Institute in Göttingen.
              </p>
            </div>
            
            <p className="mb-4">
              In 1927, Heisenberg formulated the uncertainty principle. In the uncertainty principle, 
              Heisenberg struggles with our inability to see or know much about the electron.
            </p>
            
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-800 mb-2">The Fundamental Problem</h4>
              <p className="text-sm mb-2">
                The study of the electron poses a problem: <strong>We cannot see what the electron is doing 
                without changing what it is doing.</strong>
              </p>
              <ul className="text-sm space-y-2">
                <li>• To accurately know the position of an electron, it must be observed with external electromagnetic radiation</li>
                <li>• But the external radiation causes the momentum of the electron to change</li>
                <li>• Thus, to accurately know the speed/momentum, we lose information about its location</li>
                <li>• Conversely, to know position accurately, we lose information about momentum</li>
              </ul>
              <p className="text-sm mt-2 font-semibold">
                In other words, we cannot look at electrons without changing what they are doing.
              </p>
            </div>
            
            <div className="bg-red-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-red-800 mb-3">The Heisenberg Uncertainty Principle</h4>
              <p className="text-center text-lg font-bold mb-4">
                "We are unable to measure both the position and the momentum of an electron to unlimited accuracy."
              </p>
              <p className="text-sm mb-4">
                Heisenberg summed his finding up in the Uncertainty Principle which is one sentence long 
                but was also supported by hundreds of pages of mathematics.
              </p>
              <div className="bg-white p-4 rounded border-2 border-red-400">
                <BlockMath math="\Delta p \cdot \Delta x \geq \frac{h}{4\pi}" />
                <p className="text-sm mt-2">
                  where Δx is the uncertainty in position, Δp is the uncertainty in momentum, and h is Planck's constant
                </p>
              </div>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">The Trade-off</h4>
              <ul className="text-sm space-y-2">
                <li>• <strong>Small wavelength EMR source:</strong> Accurate position but large momentum kick <InlineMath math="(p = \frac{h}{\lambda})" /></li>
                <li>• <strong>Long wavelength EMR source:</strong> Small momentum kick but terrible accuracy in position</li>
              </ul>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="additionalExamples" title="Additional Examples" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            
            {/* Example 5 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 5</h3>
              <p className="mb-4 text-gray-700">
                For an electron traveling at 2.0 × 10⁶ m/s, if a 10% error exists in the measurement of 
                the speed, what is the corresponding uncertainty in the position of the electron?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>v = 2.0 × 10⁶ m/s</p>
                <p>Error = 10% = 0.10</p>
                <p>mₑ = 9.11 × 10⁻³¹ kg</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <p>First, calculate the momentum:</p>
                <BlockMath math="p = mv = (9.11 \times 10^{-31} \text{ kg})(2.0 \times 10^6 \text{ m/s}) = 1.82 \times 10^{-24} \text{ kg·m/s}" />
                
                <p>Calculate the uncertainty in momentum:</p>
                <BlockMath math="\Delta p = 0.10 \times p = 0.10(1.82 \times 10^{-24} \text{ kg·m/s}) = 1.82 \times 10^{-25} \text{ kg·m/s}" />
                
                <p>Apply the uncertainty principle:</p>
                <BlockMath math="\Delta x \geq \frac{h}{4\pi \Delta p}" />
                <BlockMath math="\Delta x \geq \frac{6.63 \times 10^{-34} \text{ J·s}}{4\pi (1.82 \times 10^{-25} \text{ kg·m/s})}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\Delta x \geq 2.9 \times 10^{-10} \text{ m}" />
                </div>
                <p className="mt-2 text-sm font-semibold text-red-600">
                  This error is very large. In sub atomic terms the electron could be in the next atom!
                </p>
              </div>
            </div>
            
            {/* Example 6 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 6</h3>
              <p className="mb-4 text-gray-700">
                Why don't we see this effect for a large object such as a 1000 kg object traveling at 
                1.0 m/s assuming a 10% error in speed measurement?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>m = 1000 kg</p>
                <p>v = 1.0 m/s</p>
                <p>Error = 10% = 0.10</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <p>Calculate the momentum:</p>
                <BlockMath math="p = mv = (1000 \text{ kg})(1.0 \text{ m/s}) = 1000 \text{ kg·m/s}" />
                
                <p>Calculate the uncertainty in momentum:</p>
                <BlockMath math="\Delta p = 0.10 \times p = 0.10(1000 \text{ kg·m/s}) = 100 \text{ kg·m/s}" />
                
                <p>Apply the uncertainty principle:</p>
                <BlockMath math="\Delta x \geq \frac{h}{4\pi \Delta p}" />
                <BlockMath math="\Delta x \geq \frac{6.63 \times 10^{-34} \text{ J·s}}{4\pi (100 \text{ kg·m/s})}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\Delta x \geq 5.3 \times 10^{-37} \text{ m}" />
                </div>
                <p className="mt-2 text-sm font-semibold text-green-600">
                  Relative to such a large object moving at a slow speed, such an error is far too small to notice.
                </p>
              </div>
            </div>
              </div>
            </AIAccordion.Item>
          </AIAccordion>
        </div>
      ) : (
        <div className="my-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-center">
            This lesson content is optimized for AI interaction. Please ensure the AIAccordion component is available.
          </p>
        </div>
      )}

      {/* Key Takeaways Summary */}
      <div className="my-8 p-6 bg-gray-100 rounded-lg border border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Takeaways</h3>
        <div className="space-y-3">
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Light exhibits both wave and particle properties depending on the energy (E = hf) and the type of experiment conducted</li>
            <li>The electromagnetic spectrum shows a transition from wave-dominated behavior (radio waves) to particle-dominated behavior (gamma rays)</li>
            <li>Louis de Broglie proposed that matter has wave properties with wavelength λ = h/(mv), earning him the 1929 Nobel Prize</li>
            <li>Davisson-Germer (1923) and G.P. Thomson (1927) experimentally confirmed electron diffraction through crystal structures</li>
            <li>de Broglie's wavelength for macroscopic objects is extremely small (∼10⁻³⁵ m), explaining why we don't observe wave behavior in daily life</li>
            <li>Electrons in atoms behave as standing waves with the condition 2πr = nλ, leading to Bohr's quantization: mvr = nh/(2π)</li>
            <li>de Broglie's wave model successfully derived the same orbital radii as Bohr's hydrogen atom calculations</li>
            <li>Tonomura's electron double-slit experiment (1988-89) showed that single electrons create interference patterns over time</li>
            <li>Max Born's interpretation (1926): particle waves are waves of probability, introducing quantum indeterminacy</li>
            <li>Heisenberg's Uncertainty Principle (1927): Δp·Δx ≥ h/(4π) - we cannot measure both position and momentum with unlimited accuracy</li>
            <li>Schrödinger and Heisenberg independently developed quantum mechanics in 1925, establishing the theoretical framework for atomic structure</li>
            <li>Quantum mechanics reveals that nature operates probabilistically rather than deterministically at the atomic scale</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ManualContent;