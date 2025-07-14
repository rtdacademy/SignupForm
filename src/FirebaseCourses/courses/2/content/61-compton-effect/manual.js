import React from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive X-ray Production Component
const XRayProductionComponent = () => {
  const [voltage, setVoltage] = useState(30);
  const [current, setCurrent] = useState(875);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Constants
  const h = 6.63e-34; // J·s
  const hEv = 4.14e-15; // eV·s
  const c = 3.00e8; // m/s
  const e = 1.60e-19; // C
  
  // Calculations
  const maxFreq = (voltage * 1000 * e) / h;
  const minWavelength = (hEv * c) / (voltage * 1000);
  const electronRate = (current * 1e-6) / e;
  
  const animateElectrons = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 3000);
  };
  
  return (
    <div className="w-full bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">X-ray Production in Cathode Ray Tube</h4>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-white font-medium mb-2 block">Voltage (kV):</label>
          <input
            type="range"
            min="10"
            max="100"
            value={voltage}
            onChange={(e) => setVoltage(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-white text-sm">{voltage} kV</span>
        </div>
        <div>
          <label className="text-white font-medium mb-2 block">Current (μA):</label>
          <input
            type="range"
            min="100"
            max="2000"
            value={current}
            onChange={(e) => setCurrent(parseInt(e.target.value))}
            className="w-full"
          />
          <span className="text-white text-sm">{current} μA</span>
        </div>
      </div>
      
      {/* Cathode Ray Tube Diagram */}
      <div className="bg-black rounded p-4 mb-4">
        <svg width="600" height="300">
          {/* Cathode */}
          <rect x="50" y="140" width="20" height="20" fill="#FF6B6B" stroke="#FF4444" strokeWidth="2" />
          <text x="60" y="135" fill="#FF6B6B" fontSize="10" textAnchor="middle" fontWeight="bold">
            Cathode (-)
          </text>
          
          {/* Anode/Target */}
          <rect x="450" y="100" width="30" height="100" fill="#FFD700" stroke="#FFA500" strokeWidth="2" />
          <text x="465" y="95" fill="#FFD700" fontSize="10" textAnchor="middle" fontWeight="bold">
            Tungsten Target (+)
          </text>
          
          {/* Electron beam */}
          {[...Array(5)].map((_, i) => (
            <g key={i}>
              <circle 
                cx={100 + i * 70} 
                cy={150} 
                r="4" 
                fill="#4ECDC4" 
                stroke="#2C9AA0" 
                strokeWidth="1"
              >
                {isAnimating && (
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0,0; 350,0; 350,0"
                    dur="1.5s"
                    begin={`${i * 0.2}s`}
                    repeatCount="1"
                  />
                )}
              </circle>
              <text x={100 + i * 70} y={140} fill="#4ECDC4" fontSize="8" textAnchor="middle">
                e⁻
              </text>
            </g>
          ))}
          
          {/* X-ray emission */}
          {isAnimating && (
            <>
              {[...Array(8)].map((_, i) => (
                <g key={`xray-${i}`}>
                  <line
                    x1="465"
                    y1="150"
                    x2={520 + i * 15}
                    y2={120 + i * 10}
                    stroke="#9B59B6"
                    strokeWidth="2"
                    opacity="0.8"
                  >
                    <animate attributeName="opacity" values="0;1;0" dur="0.5s" begin={`${1 + i * 0.1}s`} />
                  </line>
                  <text x={515 + i * 15} y={115 + i * 10} fill="#9B59B6" fontSize="8">
                    X-ray
                  </text>
                </g>
              ))}
            </>
          )}
          
          {/* Voltage indicator */}
          <text x="250" y="120" fill="#FFFFFF" fontSize="12" textAnchor="middle" fontWeight="bold">
            {voltage} kV
          </text>
          <line x1="70" y1="130" x2="450" y2="130" stroke="#FFFFFF" strokeWidth="1" strokeDasharray="3,3" />
        </svg>
        
        <button
          onClick={animateElectrons}
          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          disabled={isAnimating}
        >
          {isAnimating ? 'Animating...' : 'Animate Electron Beam'}
        </button>
      </div>
      
      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-white">
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-purple-300 mb-2">Maximum Frequency:</h5>
          <p className="text-sm">{(maxFreq / 1e18).toFixed(2)} × 10¹⁸ Hz</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-blue-300 mb-2">Minimum Wavelength:</h5>
          <p className="text-sm">{(minWavelength * 1e12).toFixed(2)} pm</p>
        </div>
        <div className="bg-gray-800 p-3 rounded">
          <h5 className="font-semibold text-green-300 mb-2">Electron Rate:</h5>
          <p className="text-sm">{(electronRate / 1e15).toFixed(2)} × 10¹⁵ e⁻/s</p>
        </div>
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
          The Compton Effect
        </h1>
        <p className="text-lg text-gray-600">
          Proving the particle nature of electromagnetic radiation
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">

            <AIAccordion.Item value="discovery" title="Discovery of X-rays" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              During all the research on cathode rays, several scientists missed their chance at some glory. 
              Heinrich Hertz narrowly missed discovering x-rays during his photoelectric effect research. 
              Fredrick Smith came close to the discovery, but he asked his assistant to move his photographic 
              plates into another room as his cathode ray tube seemed to ruin the plates.
            </p>
            
            <p className="mb-4">
              Wilhelm Roentgen (1845 – 1923) finally made the discovery in 1895. Barium platinocyanide 
              is a fluorescent material which will emit visible light when illuminated with ultraviolet light. 
              He noticed that a piece of barium platinocyanide glowed when in the region of an operating 
              cathode ray tube. Roentgen immediately began to investigate and discovered that the tube was 
              emitting some unknown radiation. Roentgen called the radiation an x-ray (unknown ray). 
              Roentgen discovered that x-rays passed through some materials but were stopped by other materials. 
              This discovery was immediately put to use as a medical aid.
            </p>
            
            <div className="mb-6">
              <XRayProductionComponent />
            </div>
            
            <p className="mb-4">
              The picture to the left is one of the earliest x-ray photographs made in the United States (1896). 
              The white dots are individual lead shot pellets in a man's hand who had been hit by a shotgun blast.
            </p>
            
            <p className="mb-4">
              But what were x-rays? X-rays were tested to see if electric or magnetic fields would deflect them. 
              Since x-rays were not affected by either electric or magnetic fields they were thought to be either 
              neutral particles or an electromagnetic wave. X-rays were known to penetrate objects, so it was 
              thought that it might be an electromagnetic wave with a very small wavelength – about 0.1 nm.
            </p>
            
            <p className="mb-4">
              Therefore if a 0.1 nm diffraction grating were used, its wave nature could be confirmed. 
              The atoms of crystals were thought to be separated by about 0.1 nm. In 1912, Bragg finally 
              confirmed that x-rays are a member of the electromagnetic spectrum when x-rays produced a 
              diffraction pattern. Bragg diffraction became an important tool to understand the crystal 
              structure of different minerals through x-ray crystallography.
            </p>
            
            <div className="bg-blue-100 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">X-ray Production</h4>
              <p className="mb-2">
                In the diagram to the right, a high potential difference is created between the anode and 
                cathode of a cathode-ray tube. Electrons are accelerated toward a tungsten target. 
                (Tungsten is used due to its exceptionally high melting point.)
              </p>
              <p className="mb-2">
                When electrons strike the tungsten anode the kinetic energy of the electrons is converted 
                into x-ray radiation and heat energy. The minimum wavelength (maximum frequency) of x-rays 
                is when the kinetic energy of the electron is completely converted into x-ray energy.
              </p>
              <div className="mt-4">
                <BlockMath math="E_{electric} = E_{x-ray}" />
                <BlockMath math="qV = hf" />
                <BlockMath math="\lambda = \frac{hc}{qV}" />
              </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="examples" title="X-ray Production Examples" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            
            {/* Example 1 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 1</h3>
              <p className="mb-4 text-gray-700">
                What is the maximum frequency of the x-rays produced by a cathode ray tube with an 
                applied potential difference of 30 kV?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>V = 30 kV = 30 × 10³ V</p>
                <p>h = 4.14 × 10⁻¹⁵ eV·s (or 6.63 × 10⁻³⁴ J·s)</p>
                <p>e = 1.60 × 10⁻¹⁹ C</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <BlockMath math="E_{electric} = E_{x-ray}" />
                <BlockMath math="qV = hf" />
                <BlockMath math="f = \frac{qV}{h}" />
                <BlockMath math="f = \frac{1e \times (30 \times 10^3 \text{ V})}{4.14 \times 10^{-15} \text{ eV·s}}" />
                <BlockMath math="f = \frac{1.60 \times 10^{-19} \text{ C} \times (30 \times 10^3 \text{ V})}{6.63 \times 10^{-34} \text{ J·s}}" />
                <BlockMath math="f = 7.24 \times 10^{18} \text{ Hz}" />
              </div>
            </div>
            
            {/* Example 2 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 2</h3>
              <p className="mb-4 text-gray-700">
                A cathode ray tube operates at 80 kV with a current of 875 μA. What is the intensity 
                (photons per second) and minimum wavelength of the x-rays produced by the cathode ray tube?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>V = 80 kV = 80 × 10³ V</p>
                <p>I = 875 μA = 875 × 10⁻⁶ A</p>
                <p>t = 1 s</p>
                <p>h = 4.14 × 10⁻¹⁵ eV·s</p>
                <p>c = 3.00 × 10⁸ m/s</p>
                <p>e = 1.60 × 10⁻¹⁹ C</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution for intensity:</strong></p>
                <BlockMath math="q = It" />
                <BlockMath math="q = (875 \times 10^{-6} \text{ A})(1 \text{ s})" />
                <BlockMath math="q = 8.75 \times 10^{-4} \text{ C}" />
                <BlockMath math="n_e = \frac{q}{e}" />
                <BlockMath math="n_e = \frac{8.75 \times 10^{-4} \text{ C}}{1.60 \times 10^{-19} \text{ C}} = 5.47 \times 10^{15} \text{ electrons}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\text{X-ray intensity} = 5.47 \times 10^{15} \text{ photons/s}" />
                </div>
                
                <p><strong>Solution for minimum wavelength:</strong></p>
                <BlockMath math="E_{electric} = E_{x-ray}" />
                <BlockMath math="qV = \frac{hc}{\lambda}" />
                <BlockMath math="\lambda = \frac{hc}{qV}" />
                <BlockMath math="\lambda = \frac{(4.14 \times 10^{-15} \text{ eV·s})(3.00 \times 10^8 \text{ m/s})}{1e \times (80 \times 10^3 \text{ V})}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\lambda = 1.55 \times 10^{-11} \text{ m}" />
                </div>
              </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="properties" title="Properties of X-rays" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              The properties of x-rays are rather unique because of their ability to act as a wave or 
              as a particle to a much greater extent than visible light.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-100 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">Wave Characteristics of X-rays:</h4>
                <ul className="space-y-2 text-sm">
                  <li>⇒ X-rays can penetrate opaque objects such as wood, paper, aluminum and human flesh. They will not penetrate bone.</li>
                  <li>⇒ X-rays can be diffracted by crystals.</li>
                </ul>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">Particle (Photon) Characteristics of X-rays:</h4>
                <ul className="space-y-2 text-sm">
                  <li>⇒ X-rays will ionize a gas – i.e. they collide with electrons and drive them off the molecules to produce ions.</li>
                  <li>⇒ X-rays will cause electron emission in water by the same process as described above.</li>
                  <li>⇒ X-rays will affect photographic plates.</li>
                </ul>
              </div>
            </div>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="comptonEffect" title="The Compton Effect" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-blue-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">Arthur Holly Compton (1892-1962)</h4>
              <p className="text-sm mb-2">
                Arthur Holly Compton was born at Wooster, Ohio, and was educated at the College of Wooster, 
                graduating Bachelor of Science in 1913, and he spent three years in postgraduate study at 
                Princeton University receiving his M.A. degree in 1914 and his Ph.D. in 1916.
              </p>
              <p className="text-sm mb-2">
                After spending a year as instructor of physics at the University of Minnesota, he took a 
                position as a research engineer with the Westinghouse Lamp Company at Pittsburgh until 1919 
                when he studied under Rutherford at Cambridge University as a National Research Council Fellow.
              </p>
              <p className="text-sm">
                In 1920, he was appointed Wayman Crow Professor of Physics, and Head of the Department of 
                Physics at Washington University, St. Louis and in 1923 he moved to the University of Chicago 
                as Professor of Physics. Compton returned to St. Louis as Chancellor in 1945 and from 1954 
                until his retirement in 1961 he was Distinguished Service Professor of Natural Philosophy 
                at the Washington University.
              </p>
            </div>
            
            <p className="mb-4">
              In his early days at Princeton, Compton devised an elegant method for demonstrating the Earth's 
              rotation, but he would soon begin his studies in the field of x-rays. He developed a theory of 
              the intensity of x-ray reflection from crystals as a means of studying the arrangement of electrons 
              and atoms, and in 1918 he started a study of x-ray scattering.
            </p>
            
            <p className="mb-4">
              Compton was intrigued by the idea that if photons have energy do they have momentum. He derived 
              the equation(s) that described the momentum of a photon.
            </p>
            
            <div className="bg-yellow-100 p-4 rounded-lg mb-6">
              <h4 className="font-semibold text-yellow-800 mb-3">Derivation of Photon Momentum</h4>
              <p className="mb-2">As we learned in Lesson 1, the momentum of a particle is given by:</p>
              <BlockMath math="p = mv" />
              <p className="mb-2">But from Einstein's famous equation <InlineMath math="E = mc^2" /> we know that:</p>
              <BlockMath math="m = \frac{E}{c^2}" />
              <p className="mb-2">Substituting this for m we get:</p>
              <BlockMath math="p = \frac{Ev}{c^2}" />
              <p className="mb-2">And since the speed of a photon is the speed of light <InlineMath math="(v = c)" />:</p>
              <BlockMath math="p = \frac{Ec}{c^2} = \frac{E}{c}" />
              <p className="mb-2">If <InlineMath math="p = \frac{E}{c}" /> and we know from Planck's equation that <InlineMath math="E = hf = \frac{hc}{\lambda}" /> then:</p>
              <div className="bg-white p-3 rounded border-2 border-yellow-400">
                <BlockMath math="p = \frac{hf}{c} \text{ or } p = \frac{h}{\lambda} \text{ (momentum of a photon)}" />
              </div>
            </div>
            
            <p className="mb-4">
              Compton initially experimented with x-ray photons to bombard atoms, but the effect was so small 
              that it was not measurable. Compton then began to bombard electrons rather than atoms. He measured 
              the wavelength of the incoming x-ray (λᵢ) and the wavelength of the scattered x-ray (λf) that 
              scattered through an angle θ.
            </p>
            
            <p className="mb-4">
              The collision between the x-ray photon and the electron is a purely elastic collision. (Recall from 
              Lesson 2 that for an elastic collision both momentum and kinetic energy are conserved.)
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-100 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Conservation of Energy:</h5>
                <BlockMath math="\frac{hc}{\lambda_i} = \frac{1}{2}mv^2 + \frac{hc}{\lambda_f}" />
                <p className="text-sm mt-2">incoming x-ray energy = electron's kinetic energy + scattered x-ray energy</p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg">
                <h5 className="font-semibold mb-2">Conservation of Momentum:</h5>
                <BlockMath math="\vec{p_i} = \vec{p_e} + \vec{p_f}" />
                <p className="text-sm mt-2">momentum of incoming x-ray = electron's momentum + momentum of scattered x-ray</p>
              </div>
            </div>
            
            <p className="mb-4">
              Utilizing both the conservation of energy and the conservation of momentum, along with an application 
              of Einstein's special theory of relativity, Compton derived the following relationship for the change 
              in wavelength of the x-ray photon:
            </p>
            
            <div className="bg-red-100 p-4 rounded-lg">
              <h4 className="font-semibold text-red-800 mb-3">Compton's Equation</h4>
              <BlockMath math="\Delta\lambda = \lambda_f - \lambda_i = \frac{h}{mc}(1 - \cos\theta)" />
              <p className="text-sm mt-2">
                where m is the mass of the electron and θ is the angle through which the x-ray scatters.
              </p>
            </div>
            
            <p className="mt-4">
              Compton's experiment became known as the Compton effect and he won a Nobel prize for physics 
              in 1927 for his efforts. Compton's experiments show that a photon of electromagnetic radiation 
              can be regarded as a particle with a definite momentum and energy. Photons have momentum and 
              energy (like a moving particle) but they also have a frequency and a wavelength (like a wave).
            </p>
              </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="newExamples" title="Additional Examples" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            
            {/* Example 3 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 3</h3>
              <p className="mb-4 text-gray-700">
                Calculate the momentum of a photon that has a wavelength of 455 nm.
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>λ = 455 nm = 455 × 10⁻⁹ m</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution:</strong></p>
                <BlockMath math="p = \frac{h}{\lambda}" />
                <BlockMath math="p = \frac{6.63 \times 10^{-34} \text{ J·s}}{455 \times 10^{-9} \text{ m}}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="p = 1.46 \times 10^{-27} \text{ kg·m/s}" />
                </div>
              </div>
            </div>
            
            {/* Example 4 */}
            <div className="mb-8 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Example 4</h3>
              <p className="mb-4 text-gray-700">
                A photon of light with wavelength 0.427 nm hits a stationary electron. The scattered x-ray 
                has a wavelength of 0.429 nm. What is the resulting speed of the electron and the scattering 
                angle of the x-ray?
              </p>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">Given:</h4>
                <p>λᵢ = 0.427 nm = 0.427 × 10⁻⁹ m</p>
                <p>λf = 0.429 nm = 0.429 × 10⁻⁹ m</p>
                <p>h = 6.63 × 10⁻³⁴ J·s</p>
                <p>c = 3.00 × 10⁸ m/s</p>
                <p>mₑ = 9.11 × 10⁻³¹ kg</p>
              </div>
              
              <div className="space-y-3">
                <p><strong>Solution for electron speed:</strong></p>
                <p>To find the speed of the electron we use the conservation of energy:</p>
                <BlockMath math="E_{ke} = E_i - E_f" />
                <BlockMath math="E_{ke} = \frac{hc}{\lambda_i} - \frac{hc}{\lambda_f}" />
                <BlockMath math="E_{ke} = hc\left(\frac{1}{\lambda_i} - \frac{1}{\lambda_f}\right)" />
                <BlockMath math="E_{ke} = (6.63 \times 10^{-34} \text{ J·s})(3.00 \times 10^8 \text{ m/s})\left(\frac{1}{0.427 \times 10^{-9}} - \frac{1}{0.429 \times 10^{-9}}\right)" />
                <BlockMath math="E_{ke} = 2.17 \times 10^{-16} \text{ J}" />
                
                <p className="mt-4"><strong>Finding velocity:</strong></p>
                <BlockMath math="v = \sqrt{\frac{2E_{ke}}{m_e}}" />
                <BlockMath math="v = \sqrt{\frac{2(2.17 \times 10^{-16} \text{ J})}{9.11 \times 10^{-31} \text{ kg}}}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="v = 2.18 \times 10^7 \text{ m/s}" />
                </div>
                
                <p className="mt-4"><strong>Solution for scattering angle:</strong></p>
                <p>To find the scattering angle we use Compton's equation:</p>
                <BlockMath math="\lambda_f - \lambda_i = \frac{h}{m_e c}(1 - \cos\theta)" />
                <BlockMath math="\cos\theta = 1 - \frac{m_e c(\lambda_f - \lambda_i)}{h}" />
                <BlockMath math="\cos\theta = 1 - \frac{(9.11 \times 10^{-31})(3.00 \times 10^8)(0.429 - 0.427) \times 10^{-9}}{6.63 \times 10^{-34}}" />
                <div className="bg-blue-100 p-3 rounded">
                  <BlockMath math="\theta = 79.9°" />
                </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 mb-3">X-ray Properties & Production</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>X-rays are electromagnetic radiation with wavelengths around 0.1 nm</li>
              <li>They exhibit both wave and particle characteristics</li>
              <li>X-ray production: <InlineMath math="qV = hf_{max}" /> and <InlineMath math="\lambda_{min} = \frac{hc}{qV}" /></li>
              <li>X-rays can penetrate matter but are stopped by dense materials like bone</li>
              <li>They can be diffracted by crystal structures (Bragg diffraction)</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-800 mb-3">Compton Effect & Photon Momentum</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Photons have momentum: <InlineMath math="p = \frac{h}{\lambda} = \frac{E}{c}" /></li>
              <li>Compton scattering proves particle nature of electromagnetic radiation</li>
              <li>Compton equation: <InlineMath math="\Delta\lambda = \frac{h}{mc}(1 - \cos\theta)" /></li>
              <li>Both energy and momentum are conserved in photon-electron collisions</li>
              <li>Arthur Compton won Nobel Prize in Physics (1927) for this discovery</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualContent;