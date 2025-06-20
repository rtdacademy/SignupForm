import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive Half-Life Visualization Component
const HalfLifeComponent = () => {
  const [selectedIsotope, setSelectedIsotope] = useState('carbon14');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [timeUnit, setTimeUnit] = useState('years');
  
  const isotopes = {
    carbon14: { name: 'Carbon-14', halfLife: 5730, unit: 'years', symbol: '¹⁴C' },
    iodine131: { name: 'Iodine-131', halfLife: 8.02, unit: 'days', symbol: '¹³¹I' },
    uranium238: { name: 'Uranium-238', halfLife: 4.468e9, unit: 'years', symbol: '²³⁸U' },
    radon222: { name: 'Radon-222', halfLife: 3.82, unit: 'days', symbol: '²²²Rn' },
    polonium214: { name: 'Polonium-214', halfLife: 164.3, unit: 'microseconds', symbol: '²¹⁴Po' }
  };
  
  const currentIsotope = isotopes[selectedIsotope];
  
  // Convert time to half-lives
  const convertToHalfLives = () => {
    let elapsedInHalfLifeUnits = timeElapsed;
    
    // Convert to the isotope's time unit if different
    if (timeUnit !== currentIsotope.unit) {
      // Simple conversion for demonstration
      if (timeUnit === 'years' && currentIsotope.unit === 'days') {
        elapsedInHalfLifeUnits = timeElapsed * 365.25;
      } else if (timeUnit === 'days' && currentIsotope.unit === 'years') {
        elapsedInHalfLifeUnits = timeElapsed / 365.25;
      }
    }
    
    return elapsedInHalfLifeUnits / currentIsotope.halfLife;
  };
  
  const halfLives = convertToHalfLives();
  const remaining = Math.pow(0.5, halfLives) * 100;
  const decayed = 100 - remaining;
  
  // Create visual representation of atoms
  const totalAtoms = 64;
  const remainingAtoms = Math.round(totalAtoms * remaining / 100);
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Interactive Half-Life Calculator</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="text-white font-medium mb-2 block">Select Isotope:</label>
          <select
            value={selectedIsotope}
            onChange={(e) => setSelectedIsotope(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
          >
            {Object.entries(isotopes).map(([key, isotope]) => (
              <option key={key} value={key}>
                {isotope.name} (t½ = {isotope.halfLife} {isotope.unit})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-white font-medium mb-2 block">Time Elapsed:</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={timeElapsed}
              onChange={(e) => setTimeElapsed(Number(e.target.value))}
              className="flex-1 p-2 rounded bg-gray-700 text-white border border-gray-600"
              min="0"
              step="0.1"
            />
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="p-2 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option value="years">years</option>
              <option value="days">days</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Visual representation */}
      <div className="bg-black rounded p-4 mb-4">
        <div className="grid grid-cols-8 gap-1 mb-4">
          {Array.from({ length: totalAtoms }).map((_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full ${
                i < remainingAtoms ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            />
          ))}
        </div>
        
        <div className="text-white text-center">
          <p className="text-sm mb-2">
            <span className="text-blue-400">● Remaining atoms</span> | 
            <span className="text-gray-400"> ● Decayed atoms</span>
          </p>
        </div>
      </div>
      
      {/* Calculations */}
      <div className="bg-gray-800 p-4 rounded">
        <div className="text-white space-y-2">
          <p><strong>Number of half-lives:</strong> {halfLives.toFixed(2)}</p>
          <p><strong>Fraction remaining:</strong> <InlineMath math={`(\\frac{1}{2})^{${halfLives.toFixed(2)}} = ${(remaining/100).toFixed(4)}`} /></p>
          <p><strong>Percentage remaining:</strong> {remaining.toFixed(2)}%</p>
          <p><strong>Percentage decayed:</strong> {decayed.toFixed(2)}%</p>
        </div>
        
        <div className="mt-4 p-3 bg-gray-700 rounded">
          <p className="text-white text-sm">
            <strong>Formula:</strong> <InlineMath math="N = N_0 \\times (\\frac{1}{2})^n" />
          </p>
          <p className="text-white text-sm mt-1">
            where <InlineMath math="n = \\frac{t}{t_{1/2}}" />
          </p>
        </div>
      </div>
    </div>
  );
};

// Interactive Decay Graph Component
const DecayGraphComponent = () => {
  const [showActivity, setShowActivity] = useState(true);
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Radioactive Decay Curves</h4>
      
      <div className="mb-4 flex justify-center">
        <button
          onClick={() => setShowActivity(!showActivity)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Show {showActivity ? 'Mass' : 'Activity'} Decay
        </button>
      </div>
      
      <div className="bg-black rounded p-4">
        <svg width="600" height="400">
          {/* Axes */}
          <line x1="50" y1="350" x2="550" y2="350" stroke="#FFF" strokeWidth="2" />
          <line x1="50" y1="350" x2="50" y2="50" stroke="#FFF" strokeWidth="2" />
          
          {/* X-axis labels */}
          <text x="300" y="390" fill="#FFF" fontSize="14" textAnchor="middle">Time (half-lives)</text>
          {[0, 1, 2, 3, 4, 5].map(i => (
            <g key={i}>
              <line x1={50 + i * 100} y1="350" x2={50 + i * 100} y2="355" stroke="#FFF" />
              <text x={50 + i * 100} y="370" fill="#FFF" fontSize="12" textAnchor="middle">{i}</text>
            </g>
          ))}
          
          {/* Y-axis labels */}
          <text x="20" y="200" fill="#FFF" fontSize="14" textAnchor="middle" transform="rotate(-90 20 200)">
            {showActivity ? 'Activity (%)' : 'Mass (%)'}
          </text>
          {[0, 25, 50, 75, 100].map(i => (
            <g key={i}>
              <line x1="45" y1={350 - i * 3} y2={350 - i * 3} x2="50" stroke="#FFF" />
              <text x="35" y={355 - i * 3} fill="#FFF" fontSize="12" textAnchor="end">{i}</text>
            </g>
          ))}
          
          {/* Decay curve */}
          <path
            d={`M 50 50 ${Array.from({ length: 100 }, (_, i) => {
              const x = 50 + i * 5;
              const t = i / 20;
              const y = 350 - 300 * Math.pow(0.5, t);
              return `L ${x} ${y}`;
            }).join(' ')}`}
            fill="none"
            stroke="#4ECDC4"
            strokeWidth="3"
          />
          
          {/* Half-life markers */}
          {[1, 2, 3, 4, 5].map(n => {
            const x = 50 + n * 100;
            const y = 350 - 300 * Math.pow(0.5, n);
            return (
              <g key={n}>
                <line x1={x} y1="350" x2={x} y2={y} stroke="#FF6B6B" strokeWidth="1" strokeDasharray="5,5" />
                <line x1="50" y1={y} x2={x} y2={y} stroke="#FF6B6B" strokeWidth="1" strokeDasharray="5,5" />
                <circle cx={x} cy={y} r="4" fill="#FF6B6B" />
                <text x={x + 10} y={y - 10} fill="#FF6B6B" fontSize="12">
                  {Math.pow(0.5, n) * 100}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="mt-4 bg-gray-800 p-3 rounded">
        <p className="text-white text-sm">
          After each half-life, the amount of radioactive material is reduced by half. 
          This exponential decay continues indefinitely.
        </p>
      </div>
    </div>
  );
};

const ManualContent = () => {
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showAlphaBeta, setShowAlphaBeta] = useState(false);
  const [showGamma, setShowGamma] = useState(false);
  const [showConservationAlpha, setShowConservationAlpha] = useState(false);
  const [showConservationBeta, setShowConservationBeta] = useState(false);
  const [showBiological, setShowBiological] = useState(false);
  const [showDecayRate, setShowDecayRate] = useState(false);
  const [showExample1, setShowExample1] = useState(false);
  const [showExample2, setShowExample2] = useState(false);
  const [showExample3, setShowExample3] = useState(false);
  const [showExample4, setShowExample4] = useState(false);
  const [showExample5, setShowExample5] = useState(false);
  const [showKeyTakeaways, setShowKeyTakeaways] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Lesson 36: Radioactivity</h2>

      {/* Discovery of Radioactivity */}
      <div className="mb-6">
        <button
          onClick={() => setShowDiscovery(!showDiscovery)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Discovery of Radioactivity</span>
          <span>{showDiscovery ? '−' : '+'}</span>
        </button>
        {showDiscovery && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              Recall from Lesson 25 that one of Dalton's postulates was that atoms are permanent and unchangeable. 
              In 1896, Henri Becquerel was doing experiments to find x-ray emissions from phosphorescent crystals 
              by placing them on top of photographic plates wrapped in black paper.
            </p>
            
            <p className="mb-4">
              One day he placed a uranium compound on a photographic plate. Since there was not enough sunlight 
              on that day he placed the apparatus in a drawer for a few days. When he developed the plates he 
              discovered that they had been strongly exposed to something emitted by the uranium compound. 
              Becquerel had accidentally discovered <strong>radioactivity</strong> (initially called Becquerel rays).
            </p>
            
            <p className="mb-4">
              Marie and Pierre Curie studied the radioactive elements found in pitchblende. They discovered that 
              the radioactivity of an element is determined by something inside the atoms which is unchanged by 
              any external factors. Some elements are unstable and decay spontaneously, releasing particles. 
              This is referred to as <strong>radioactive decay</strong>.
            </p>
            
            <p className="mb-4">
              In 1898, Ernest Rutherford studied radioactive decay and discovered two particles emitted in 
              radioactive emission: alpha (α) and beta (β) particles. A year later, Paul Villard discovered 
              a third type of emission, gamma (γ) rays.
            </p>
          </div>
        )}
      </div>

      {/* Alpha and Beta Particles */}
      <div className="mb-6">
        <button
          onClick={() => setShowAlphaBeta(!showAlphaBeta)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Alpha and Beta Particles</span>
          <span>{showAlphaBeta ? '−' : '+'}</span>
        </button>
        {showAlphaBeta && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <h3 className="text-xl font-semibold mb-3">Alpha (α) particles</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>They are positively charged particles ejected from a nucleus (actually <InlineMath math="^4_2He" /> nuclei)</li>
              <li>They are ejected at high speed, but have a range of only a few centimetres in air</li>
              <li>They are stopped by an ordinary sheet of aluminium foil</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Beta (β) particles</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>These are high energy electrons (<InlineMath math="^0_{-1}e" />) ejected from a nucleus</li>
              <li>They are ejected at varying speeds, sometimes close to the speed of light</li>
              <li>High energy β particles are able to penetrate several centimetres of aluminium</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Gamma (γ) rays</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Gamma rays are photons (<InlineMath math="^0_0\\gamma" />) with very short wavelengths</li>
              <li>Their wavelengths and energies can vary</li>
              <li>High energy γ rays can penetrate at least 30 cm of lead and 2 km of air</li>
            </ul>
          </div>
        )}
      </div>

      {/* Example 1 */}
      <div className="mb-6">
        <button
          onClick={() => setShowExample1(!showExample1)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Example 1: Nuclear Equations</span>
          <span>{showExample1 ? '−' : '+'}</span>
        </button>
        {showExample1 && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg shadow-inner">
            <p className="font-semibold mb-3">Write complete nuclear equations for the following:</p>
            
            <div className="mb-4">
              <p className="font-semibold">A. The beta decay of thorium-234</p>
              <BlockMath math="^{234}_{90}Th \\rightarrow ^0_{-1}e + ^?_??" />
              
              <div className="bg-gray-100 p-3 rounded mt-2">
                <p className="mb-2">Atomic mass: 234 = 0 + A → A = 234</p>
                <p className="mb-2">Atomic number: 90 = Z + (-1) → Z = 91</p>
                <p>Element 91 is Pa - protactinium</p>
              </div>
              
              <p className="mt-3"><strong>Answer:</strong></p>
              <BlockMath math="^{234}_{90}Th \\rightarrow ^0_{-1}e + ^{234}_{91}Pa" />
            </div>
            
            <div>
              <p className="font-semibold">B. The alpha decay of radium-226</p>
              <BlockMath math="^{226}_{88}Ra \\rightarrow ^4_2He + ^?_??" />
              
              <div className="bg-gray-100 p-3 rounded mt-2">
                <p className="mb-2">Atomic mass: 226 = 4 + A → A = 222</p>
                <p className="mb-2">Atomic number: 88 = Z + 2 → Z = 86</p>
                <p>Element 86 is Rn - radon</p>
              </div>
              
              <p className="mt-3"><strong>Answer:</strong></p>
              <BlockMath math="^{226}_{88}Ra \\rightarrow ^4_2He + ^{222}_{86}Rn" />
            </div>
          </div>
        )}
      </div>

      {/* Conservation Laws - Alpha Decay */}
      <div className="mb-6">
        <button
          onClick={() => setShowConservationAlpha(!showConservationAlpha)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Conservation Laws Applied to Alpha Decay</span>
          <span>{showConservationAlpha ? '−' : '+'}</span>
        </button>
        {showConservationAlpha && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              As we saw in Lesson 35, the law of conservation of energy includes Einstein's mass-energy 
              relationship (E = mc²). We will now apply this to radioactive decay.
            </p>
            
            <p className="mb-4">
              The energy of an alpha particle can be determined from the mass of the parent radioactive nucleus, 
              the mass of the alpha particle, and the mass of the daughter nucleus. The alpha particle and 
              daughter nucleus together have a mass slightly smaller than that of the parent nucleus.
            </p>
            
            <BlockMath math="\\Delta mc^2 = E_k^\\alpha" />
            
            <p className="mb-4">
              In theory, all alpha particles emitted by a specific isotope should have the same kinetic energy, 
              and this was verified in the 1920s. For example:
            </p>
            
            <ul className="list-disc list-inside space-y-2">
              <li>Alpha particles from thorium-232 penetrate 2.8 cm of air</li>
              <li>Alpha particles from polonium-212 penetrate 8.6 cm of air</li>
              <li>Alpha particles from radium-222 penetrate 3.3 cm of air</li>
            </ul>
            
            <p className="mt-4">
              Since penetration is directly related to energy, alpha particles from a specific source 
              all have the same energy.
            </p>
          </div>
        )}
      </div>

      {/* Conservation Laws - Beta Decay */}
      <div className="mb-6">
        <button
          onClick={() => setShowConservationBeta(!showConservationBeta)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Conservation Laws Applied to Beta Decay</span>
          <span>{showConservationBeta ? '−' : '+'}</span>
        </button>
        {showConservationBeta && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              For alpha particles, conservation of mass-energy worked well, but this was not so for beta particles. 
              Beta particles were found to have a range of kinetic energies, not a single value.
            </p>
            
            <p className="mb-4">
              In 1931, Wolfgang Pauli proposed that a second particle was emitted during beta decay - 
              the <strong>neutrino</strong> (symbol ν, "little neutral one"). This particle:
            </p>
            
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Is electrically neutral</li>
              <li>Has zero (or near-zero) rest mass</li>
              <li>Travels at the speed of light</li>
              <li>Has spin of 1/2</li>
            </ul>
            
            <p className="mb-4">The equation for neutron decay becomes:</p>
            <BlockMath math="^1_0n \\rightarrow ^1_1p + ^0_{-1}e + \\bar{\\nu}" />
            
            <p className="mb-4">
              The neutrino saves three conservation laws: mass-energy, linear momentum, and angular momentum.
            </p>
            
            <div className="bg-yellow-50 p-4 rounded mt-4">
              <p className="font-semibold mb-2">Two types of beta decay:</p>
              <p className="mb-2"><strong>β⁻ decay:</strong> <InlineMath math="^A_ZX \\rightarrow ^A_{Z+1}Y + ^0_{-1}e + \\bar{\\nu}" /></p>
              <p><strong>β⁺ decay:</strong> <InlineMath math="^A_ZX \\rightarrow ^A_{Z-1}Y + ^0_{+1}e + \\nu" /></p>
            </div>
          </div>
        )}
      </div>

      {/* Example 2 */}
      <div className="mb-6">
        <button
          onClick={() => setShowExample2(!showExample2)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Example 2: Beta Decay Equations</span>
          <span>{showExample2 ? '−' : '+'}</span>
        </button>
        {showExample2 && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg shadow-inner">
            <p className="font-semibold mb-3">Write complete nuclear equations for the following:</p>
            
            <div className="mb-4">
              <p className="font-semibold">A. The β⁻ decay of actinium-230</p>
              <BlockMath math="^{230}_{89}Ac \\rightarrow ^0_{-1}e + \\bar{\\nu} + ^?_??" />
              
              <div className="bg-gray-100 p-3 rounded mt-2">
                <p className="mb-2">Atomic mass: 230 = 0 + A → A = 230</p>
                <p className="mb-2">Atomic number: 89 = Z + (-1) → Z = 90</p>
                <p>Element 90 is Th - thorium</p>
              </div>
              
              <p className="mt-3"><strong>Answer:</strong></p>
              <BlockMath math="^{230}_{89}Ac \\rightarrow ^0_{-1}e + \\bar{\\nu} + ^{230}_{90}Th" />
            </div>
            
            <div>
              <p className="font-semibold">B. The β⁺ decay of neptunium-234</p>
              <BlockMath math="^{234}_{93}Np \\rightarrow ^0_{+1}e + \\nu + ^?_??" />
              
              <div className="bg-gray-100 p-3 rounded mt-2">
                <p className="mb-2">Atomic mass: 234 = 0 + A → A = 234</p>
                <p className="mb-2">Atomic number: 93 = Z + (+1) → Z = 92</p>
                <p>Element 92 is U - uranium</p>
              </div>
              
              <p className="mt-3"><strong>Answer:</strong></p>
              <BlockMath math="^{234}_{93}Np \\rightarrow ^0_{+1}e + \\nu + ^{234}_{92}U" />
            </div>
          </div>
        )}
      </div>

      {/* Gamma Radiation */}
      <div className="mb-6">
        <button
          onClick={() => setShowGamma(!showGamma)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Gamma Radiation</span>
          <span>{showGamma ? '−' : '+'}</span>
        </button>
        {showGamma && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              Like atoms, nuclei also have excitation energy levels. When making a transition to a lower-energy 
              state, a nucleus emits a gamma-ray photon.
            </p>
            
            <p className="mb-4">
              Gamma decay does not change either the atomic number or the atomic mass. Often, an alpha or beta 
              decay leaves the daughter nucleus in a highly excited state. The excited nucleus then makes a 
              transition to its ground state and emits a gamma ray.
            </p>
            
            <p className="mb-4">For example, when the β⁻ decay of boron-12 produces carbon-12:</p>
            <BlockMath math="^{12}_5B \\rightarrow ^{12}_6C^* + ^0_{-1}\\beta + \\bar{\\nu}" />
            <BlockMath math="^{12}_6C^* \\rightarrow ^{12}_6C + \\gamma" />
            
            <p className="mt-4">
              The energy of a gamma ray depends on the energy levels and degree of excitation of the particular 
              nucleus. Gamma rays can have energies ranging from thousands to millions of electron volts.
            </p>
          </div>
        )}
      </div>

      {/* Biological Effects */}
      <div className="mb-6">
        <button
          onClick={() => setShowBiological(!showBiological)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Biological Effects of Ionizing Radiation</span>
          <span>{showBiological ? '−' : '+'}</span>
        </button>
        {showBiological && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              Ionizing radiation consists of photons and/or moving particles that have sufficient energy to 
              knock an electron out of an atom or molecule, thus forming an ion.
            </p>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 px-4 py-2">Type</th>
                    <th className="border border-gray-400 px-4 py-2">Penetration</th>
                    <th className="border border-gray-400 px-4 py-2">Ionization Hazard</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2">Alpha</td>
                    <td className="border border-gray-400 px-4 py-2">~5 cm in air, cannot penetrate skin</td>
                    <td className="border border-gray-400 px-4 py-2">Low (outside body), High (inside body)</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-400 px-4 py-2">Beta</td>
                    <td className="border border-gray-400 px-4 py-2">30-50 cm in air, ~1 cm into body</td>
                    <td className="border border-gray-400 px-4 py-2">Moderate</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-4 py-2">Gamma</td>
                    <td className="border border-gray-400 px-4 py-2">Great distances, through body</td>
                    <td className="border border-gray-400 px-4 py-2">Low to High</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <p className="mb-4">
              The effects of radiation on humans can be grouped into two categories:
            </p>
            
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Short-term or acute effects:</strong> appear within minutes, days, or weeks</li>
              <li><strong>Long-term or latent effects:</strong> appear years, decades, or generations later</li>
            </ol>
            
            <p className="mt-4">
              Radiation sickness symptoms include nausea, vomiting, fever, diarrhea, and loss of hair. 
              The severity depends on the dose received.
            </p>
          </div>
        )}
      </div>

      {/* Decay Rate and Half-Life */}
      <div className="mb-6">
        <button
          onClick={() => setShowDecayRate(!showDecayRate)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Decay Rate and Half-Life</span>
          <span>{showDecayRate ? '−' : '+'}</span>
        </button>
        {showDecayRate && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              Radioactive elements do not decay all at once. Their decay rate is governed by an exponential equation:
            </p>
            
            <BlockMath math="N = N_0 \\times (\\frac{1}{2})^n" />
            
            <p className="mb-4">where:</p>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>N = number of radioactive nuclei remaining (or mass remaining, or activity)</li>
              <li>N₀ = original number of radioactive nuclei (or original mass, or original activity)</li>
              <li>n = number of half-lives = t/t₁/₂</li>
            </ul>
            
            <p className="mb-4">
              A <strong>half-life (t₁/₂)</strong> is the time it takes for half of the parent isotope to decay 
              into the daughter isotope. Half-lives can range from fractions of a second to billions of years.
            </p>
            
            <div className="mt-4">
              <HalfLifeComponent />
            </div>
            
            <div className="mt-4">
              <DecayGraphComponent />
            </div>
          </div>
        )}
      </div>

      {/* Example 3 */}
      <div className="mb-6">
        <button
          onClick={() => setShowExample3(!showExample3)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Example 3: Activity After Time</span>
          <span>{showExample3 ? '−' : '+'}</span>
        </button>
        {showExample3 && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg shadow-inner">
            <p className="font-semibold mb-3">
              The half-life of a radioactive isotope is 2.5 years. If the activity of the original sample 
              of this isotope was 3.2 × 10³ Bq, what is its activity after 5 years?
            </p>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-2"><strong>Step 1:</strong> Calculate number of half-lives</p>
              <BlockMath math="n = \\frac{t}{t_{1/2}} = \\frac{5.0\\text{ y}}{2.5\\text{ y}} = 2" />
              
              <p className="mb-2 mt-4"><strong>Step 2:</strong> Apply decay equation</p>
              <BlockMath math="N = N_0 \\times (\\frac{1}{2})^n" />
              <BlockMath math="N = 3.2 \\times 10^3\\text{ Bq} \\times (\\frac{1}{2})^2" />
              <BlockMath math="N = 3.2 \\times 10^3\\text{ Bq} \\times \\frac{1}{4}" />
              <BlockMath math="N = 8.0 \\times 10^2\\text{ Bq}" />
            </div>
          </div>
        )}
      </div>

      {/* Example 4 */}
      <div className="mb-6">
        <button
          onClick={() => setShowExample4(!showExample4)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Example 4: Mass Remaining</span>
          <span>{showExample4 ? '−' : '+'}</span>
        </button>
        {showExample4 && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg shadow-inner">
            <p className="font-semibold mb-3">
              A 2.0 gram sample of a radioactive isotope undergoes radioactive decay. If the half-life 
              of the isotope is 45 minutes, how much of this isotope remains after 5.0 hours?
            </p>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-2"><strong>Step 1:</strong> Convert time to same units and calculate half-lives</p>
              <BlockMath math="n = \\frac{t}{t_{1/2}} = \\frac{5.0\\text{ h}}{0.75\\text{ h}} = 6.67" />
              
              <p className="mb-2 mt-4"><strong>Step 2:</strong> Apply decay equation</p>
              <BlockMath math="N = N_0 \\times (\\frac{1}{2})^n" />
              <BlockMath math="N = 2.0\\text{ g} \\times (\\frac{1}{2})^{6.67}" />
              <BlockMath math="N = 0.020\\text{ g}" />
            </div>
          </div>
        )}
      </div>

      {/* Example 5 */}
      <div className="mb-6">
        <button
          onClick={() => setShowExample5(!showExample5)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Example 5: Finding Half-Life</span>
          <span>{showExample5 ? '−' : '+'}</span>
        </button>
        {showExample5 && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg shadow-inner">
            <p className="font-semibold mb-3">
              If the activity of a radioactive sample of Q is 28 Bq and 8.0 hours later its activity is 7 Bq, 
              what is the half-life of Q?
            </p>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-2"><strong>Step 1:</strong> Set up the equation</p>
              <BlockMath math="N = N_0 \\times (\\frac{1}{2})^n" />
              <BlockMath math="7\\text{ Bq} = 28\\text{ Bq} \\times (\\frac{1}{2})^n" />
              
              <p className="mb-2 mt-4"><strong>Step 2:</strong> Solve for n</p>
              <BlockMath math="\\frac{7}{28} = (\\frac{1}{2})^n" />
              <BlockMath math="\\frac{1}{4} = (\\frac{1}{2})^n" />
              <BlockMath math="n = 2" />
              
              <p className="mb-2 mt-4"><strong>Step 3:</strong> Calculate half-life</p>
              <BlockMath math="n = \\frac{t}{t_{1/2}}" />
              <BlockMath math="2 = \\frac{8.0\\text{ h}}{t_{1/2}}" />
              <BlockMath math="t_{1/2} = 4.0\\text{ h}" />
            </div>
          </div>
        )}
      </div>

      {/* Key Takeaways */}
      <div className="mb-6">
        <button
          onClick={() => setShowKeyTakeaways(!showKeyTakeaways)}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Key Takeaways</span>
          <span>{showKeyTakeaways ? '−' : '+'}</span>
        </button>
        {showKeyTakeaways && (
          <div className="mt-4 p-6 bg-purple-50 rounded-lg shadow-inner">
            <ol className="list-decimal list-inside space-y-3">
              <li>Radioactivity was discovered accidentally by Henri Becquerel in 1896 using uranium compounds</li>
              <li>Three types of radiation: alpha (⁴₂He nuclei), beta (electrons), and gamma (high-energy photons)</li>
              <li>Alpha particles have +2 charge, limited penetration (~5 cm air), stopped by aluminum foil</li>
              <li>Beta particles have -1 charge, moderate penetration (~50 cm air), stopped by aluminum</li>
              <li>Gamma rays have no charge, great penetration (through lead and body), electromagnetic radiation</li>
              <li>Conservation laws apply to all nuclear reactions: mass-energy, charge, nucleon number</li>
              <li>Alpha decay: <InlineMath math="^A_ZX \\rightarrow ^{A-4}_{Z-2}Y + ^4_2He" /></li>
              <li>Beta-minus decay: <InlineMath math="^A_ZX \\rightarrow ^A_{Z+1}Y + ^0_{-1}e + \\bar{\\nu}" /></li>
              <li>Beta-plus decay: <InlineMath math="^A_ZX \\rightarrow ^A_{Z-1}Y + ^0_{+1}e + \\nu" /></li>
              <li>Neutrinos were proposed to save conservation of energy, momentum, and angular momentum in beta decay</li>
              <li>Gamma emission occurs when excited nuclei transition to lower energy states</li>
              <li>Radioactive decay follows exponential law: <InlineMath math="N = N_0(\\frac{1}{2})^{t/t_{1/2}}" /></li>
              <li>Half-life is time for half of radioactive sample to decay, ranges from microseconds to billions of years</li>
              <li>Ionizing radiation can damage living tissue; effects depend on type, energy, and exposure time</li>
              <li>Natural background radiation comes from cosmic rays, radon, and radioactive elements in our bodies</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualContent;