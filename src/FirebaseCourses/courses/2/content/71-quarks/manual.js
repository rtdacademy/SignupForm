import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive Quark Composition Component
const QuarkCompositionComponent = () => {
  const [selectedParticle, setSelectedParticle] = useState('proton');
  
  const particles = {
    proton: {
      name: 'Proton',
      symbol: 'p',
      composition: ['u', 'u', 'd'],
      charge: '+1',
      baryon: '+1',
      type: 'baryon',
      color: '#FF6B6B'
    },
    neutron: {
      name: 'Neutron',
      symbol: 'n',
      composition: ['u', 'd', 'd'],
      charge: '0',
      baryon: '+1',
      type: 'baryon',
      color: '#4ECDC4'
    },
    piPlus: {
      name: 'Pion⁺',
      symbol: 'π⁺',
      composition: ['u', 'd̄'],
      charge: '+1',
      baryon: '0',
      type: 'meson',
      color: '#9B59B6'
    },
    piMinus: {
      name: 'Pion⁻',
      symbol: 'π⁻',
      composition: ['ū', 'd'],
      charge: '-1',
      baryon: '0',
      type: 'meson',
      color: '#F39C12'
    },
    kaonPlus: {
      name: 'Kaon⁺',
      symbol: 'K⁺',
      composition: ['u', 's̄'],
      charge: '+1',
      baryon: '0',
      type: 'meson',
      color: '#E74C3C'
    },
    lambda: {
      name: 'Lambda',
      symbol: 'Λ⁰',
      composition: ['u', 'd', 's'],
      charge: '0',
      baryon: '+1',
      type: 'baryon',
      color: '#3498DB'
    }
  };
  
  const quarks = {
    u: { name: 'Up', charge: '+2/3', color: '#FF6B6B' },
    d: { name: 'Down', charge: '-1/3', color: '#4ECDC4' },
    s: { name: 'Strange', charge: '-1/3', color: '#9B59B6' },
    'ū': { name: 'Anti-up', charge: '-2/3', color: '#FF6B6B' },
    'd̄': { name: 'Anti-down', charge: '+1/3', color: '#4ECDC4' },
    's̄': { name: 'Anti-strange', charge: '+1/3', color: '#9B59B6' }
  };
  
  const calculateTotalCharge = (composition) => {
    return composition.reduce((total, quark) => {
      const charge = quarks[quark].charge;
      if (charge.includes('/')) {
        const [num, den] = charge.replace('+', '').replace('-', '').split('/');
        const value = parseInt(num) / parseInt(den);
        return total + (charge.includes('-') ? -value : value);
      }
      return total + parseInt(charge);
    }, 0);
  };
  
  const selectedParticleData = particles[selectedParticle];
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Quark Composition Explorer</h4>
      
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Particle:</label>
        <select
          value={selectedParticle}
          onChange={(e) => setSelectedParticle(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.entries(particles).map(([key, particle]) => (
            <option key={key} value={key}>
              {particle.name} ({particle.symbol})
            </option>
          ))}
        </select>
      </div>
      
      <div className="bg-black rounded p-6 mb-4">
        <div className="text-center text-white">
          <h3 className="text-2xl font-bold mb-4" style={{ color: selectedParticleData.color }}>
            {selectedParticleData.name} ({selectedParticleData.symbol})
          </h3>
          
          <div className="flex justify-center items-center mb-6">
            {selectedParticleData.composition.map((quark, index) => (
              <div key={index} className="mx-2">
                <div
                  className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center text-white font-bold text-lg"
                  style={{ backgroundColor: quarks[quark].color }}
                >
                  {quark}
                </div>
                <div className="text-xs mt-2">
                  <div>{quarks[quark].name}</div>
                  <div>Charge: {quarks[quark].charge}</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-900 p-3 rounded">
              <div className="text-blue-300 font-semibold">Type</div>
              <div className="text-lg capitalize">{selectedParticleData.type}</div>
            </div>
            <div className="bg-green-900 p-3 rounded">
              <div className="text-green-300 font-semibold">Total Charge</div>
              <div className="text-lg">{selectedParticleData.charge}</div>
              <div className="text-xs">({calculateTotalCharge(selectedParticleData.composition)})</div>
            </div>
            <div className="bg-purple-900 p-3 rounded">
              <div className="text-purple-300 font-semibold">Baryon Number</div>
              <div className="text-lg">{selectedParticleData.baryon}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        <p><strong>Composition Rules:</strong></p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li><strong>Baryons:</strong> Made of 3 quarks (qqq)</li>
          <li><strong>Mesons:</strong> Made of quark-antiquark pair (qq̄)</li>
          <li><strong>Charge:</strong> Sum of individual quark charges</li>
          <li><strong>Baryon number:</strong> +1/3 per quark, -1/3 per antiquark</li>
        </ul>
      </div>
    </div>
  );
};

// Interactive Color Charge Component
const ColorChargeComponent = () => {
  const [showColorNeutral, setShowColorNeutral] = useState(true);
  
  const colorCombinations = {
    baryon: {
      name: 'Baryon (3 quarks)',
      quarks: [
        { type: 'u', color: 'red', x: 150, y: 80 },
        { type: 'u', color: 'green', x: 120, y: 120 },
        { type: 'd', color: 'blue', x: 180, y: 120 }
      ],
      result: 'Color Neutral (White)',
      description: 'Red + Green + Blue = White (neutral)'
    },
    meson: {
      name: 'Meson (quark-antiquark)',
      quarks: [
        { type: 'u', color: 'red', x: 120, y: 100 },
        { type: 'd̄', color: 'anti-red', x: 180, y: 100 }
      ],
      result: 'Color Neutral (White)',
      description: 'Red + Anti-red = White (neutral)'
    }
  };
  
  const colorMap = {
    red: '#FF0000',
    green: '#00FF00',
    blue: '#0000FF',
    'anti-red': '#00FFFF',
    'anti-green': '#FF00FF',
    'anti-blue': '#FFFF00'
  };
  
  const currentType = showColorNeutral ? 'baryon' : 'meson';
  const combination = colorCombinations[currentType];
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Color Charge in Quarks</h4>
      
      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setShowColorNeutral(true)}
          className={`px-4 py-2 rounded ${
            showColorNeutral ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Baryon Colors
        </button>
        <button
          onClick={() => setShowColorNeutral(false)}
          className={`px-4 py-2 rounded ${
            !showColorNeutral ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Meson Colors
        </button>
      </div>
      
      <div className="bg-black rounded p-4 mb-4">
        <h5 className="text-white text-center mb-4 font-semibold">{combination.name}</h5>
        <svg width="300" height="200">
          {/* Draw quarks */}
          {combination.quarks.map((quark, index) => (
            <g key={index}>
              <circle
                cx={quark.x}
                cy={quark.y}
                r="20"
                fill={colorMap[quark.color]}
                stroke="#FFF"
                strokeWidth="2"
              />
              <text
                x={quark.x}
                y={quark.y + 5}
                fill="#000"
                fontSize="14"
                fontWeight="bold"
                textAnchor="middle"
              >
                {quark.type}
              </text>
              <text
                x={quark.x}
                y={quark.y + 40}
                fill="#FFF"
                fontSize="10"
                textAnchor="middle"
              >
                {quark.color}
              </text>
            </g>
          ))}
          
          {/* Draw binding lines */}
          {currentType === 'baryon' && (
            <g>
              <line x1="150" y1="80" x2="120" y2="120" stroke="#FFF" strokeWidth="2" />
              <line x1="150" y1="80" x2="180" y2="120" stroke="#FFF" strokeWidth="2" />
              <line x1="120" y1="120" x2="180" y2="120" stroke="#FFF" strokeWidth="2" />
            </g>
          )}
          
          {currentType === 'meson' && (
            <line x1="120" y1="100" x2="180" y2="100" stroke="#FFF" strokeWidth="2" />
          )}
          
          {/* Result */}
          <text x="150" y="170" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">
            {combination.result}
          </text>
        </svg>
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        <p className="mb-2"><strong>{combination.description}</strong></p>
        <div className="space-y-2">
          <p><strong>Key Points:</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li>Color charge is analogous to electromagnetic charge but for strong force</li>
            <li>All observable particles must be "color neutral"</li>
            <li>Quarks exchange gluons to maintain color neutrality</li>
            <li>Free quarks cannot exist because they would have net color charge</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

// Interactive Standard Model Component
const StandardModelComponent = () => {
  const [selectedCategory, setSelectedCategory] = useState('quarks');
  
  const particles = {
    quarks: {
      name: 'Quarks',
      color: '#FF6B6B',
      particles: [
        { name: 'Up', symbol: 'u', charge: '+2/3', generation: 1 },
        { name: 'Down', symbol: 'd', charge: '-1/3', generation: 1 },
        { name: 'Charm', symbol: 'c', charge: '+2/3', generation: 2 },
        { name: 'Strange', symbol: 's', charge: '-1/3', generation: 2 },
        { name: 'Top', symbol: 't', charge: '+2/3', generation: 3 },
        { name: 'Bottom', symbol: 'b', charge: '-1/3', generation: 3 }
      ]
    },
    leptons: {
      name: 'Leptons',
      color: '#4ECDC4',
      particles: [
        { name: 'Electron', symbol: 'e⁻', charge: '-1', generation: 1 },
        { name: 'Electron neutrino', symbol: 'νₑ', charge: '0', generation: 1 },
        { name: 'Muon', symbol: 'μ⁻', charge: '-1', generation: 2 },
        { name: 'Muon neutrino', symbol: 'νμ', charge: '0', generation: 2 },
        { name: 'Tau', symbol: 'τ⁻', charge: '-1', generation: 3 },
        { name: 'Tau neutrino', symbol: 'ντ', charge: '0', generation: 3 }
      ]
    },
    bosons: {
      name: 'Force Carriers',
      color: '#9B59B6',
      particles: [
        { name: 'Photon', symbol: 'γ', force: 'Electromagnetic', mass: '0' },
        { name: 'W boson', symbol: 'W±', force: 'Weak', mass: '80.4 GeV' },
        { name: 'Z boson', symbol: 'Z⁰', force: 'Weak', mass: '91.2 GeV' },
        { name: 'Gluon', symbol: 'g', force: 'Strong', mass: '0' },
        { name: 'Higgs', symbol: 'H', force: 'Mass generation', mass: '125 GeV' }
      ]
    }
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Standard Model of Particle Physics</h4>
      
      <div className="mb-4 flex justify-center gap-2">
        {Object.entries(particles).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`px-3 py-2 rounded text-sm font-medium ${
              selectedCategory === key 
                ? 'text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            style={selectedCategory === key ? { backgroundColor: category.color } : {}}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <div className="bg-black rounded p-4 mb-4">
        <h5 className="text-white text-center mb-4 font-semibold" style={{ color: particles[selectedCategory].color }}>
          {particles[selectedCategory].name}
        </h5>
        
        {selectedCategory === 'bosons' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {particles[selectedCategory].particles.map((particle, index) => (
              <div key={index} className="bg-gray-800 p-3 rounded">
                <div className="text-center">
                  <div className="text-lg font-bold text-white mb-1">{particle.symbol}</div>
                  <div className="text-sm text-gray-300 mb-2">{particle.name}</div>
                  <div className="text-xs text-gray-400">
                    <div>Force: {particle.force}</div>
                    <div>Mass: {particle.mass}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <div className="text-white text-center mb-4">
              <div className="grid grid-cols-3 gap-4 mb-2">
                <div className="text-sm font-semibold">Generation 1</div>
                <div className="text-sm font-semibold">Generation 2</div>
                <div className="text-sm font-semibold">Generation 3</div>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map(generation => (
                <div key={generation} className="space-y-2">
                  {particles[selectedCategory].particles
                    .filter(p => p.generation === generation)
                    .map((particle, index) => (
                      <div key={index} className="bg-gray-800 p-3 rounded text-center">
                        <div className="text-lg font-bold text-white">{particle.symbol}</div>
                        <div className="text-xs text-gray-300">{particle.name}</div>
                        <div className="text-xs text-gray-400">Charge: {particle.charge}</div>
                      </div>
                    ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        <p className="mb-2"><strong>Standard Model Facts:</strong></p>
        <ul className="list-disc list-inside space-y-1">
          <li><strong>Quarks:</strong> Building blocks of protons and neutrons</li>
          <li><strong>Leptons:</strong> Include electrons and neutrinos</li>
          <li><strong>Force Carriers:</strong> Bosons that mediate fundamental forces</li>
          <li><strong>Three Generations:</strong> Only first generation needed for ordinary matter</li>
          <li><strong>Everyday Matter:</strong> Made mostly from up quarks, down quarks, and electrons</li>
        </ul>
      </div>
    </div>
  );
};

const ManualContent = () => {
  const [showQuarkTheory, setShowQuarkTheory] = useState(false);
  const [showExample1, setShowExample1] = useState(false);
  const [showColorCharge, setShowColorCharge] = useState(false);
  const [showConfinement, setShowConfinement] = useState(false);
  const [showNeutronDecay, setShowNeutronDecay] = useState(false);
  const [showToQuark, setShowToQuark] = useState(false);
  const [showStandardModel, setShowStandardModel] = useState(false);
  const [showKeyTakeaways, setShowKeyTakeaways] = useState(false);

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">Lesson 38: Quarks</h2>

      {/* Development of Quark Theory (Mostly Optional) */}
      <div className="mb-6">
        <button
          onClick={() => setShowQuarkTheory(!showQuarkTheory)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Development of Quark Theory <span className="text-amber-200 font-normal">(Mostly Optional)</span></span>
          <span>{showQuarkTheory ? '−' : '+'}</span>
        </button>
        {showQuarkTheory && (
          <div className="mt-4 p-6 bg-amber-50 rounded-lg shadow-inner border-l-4 border-amber-500">
            <div className="bg-amber-100 p-3 rounded mb-4">
              <p className="text-amber-800 font-medium">⚠️ This section is mostly optional content</p>
            </div>
            
            <p className="mb-4">
              As more and more hadrons were discovered it became clear that they were not all 
              elementary particles. This theoretical quandary was addressed independently in 1963 
              by two American physicists, <strong>Murray Gell-Mann</strong> and <strong>George Zweig</strong>.
            </p>
            
            <p className="mb-4">
              They proposed that all known hadrons were <strong>composite particles</strong> – i.e. hadrons 
              were each made up of a cluster of two or more particles. While Zweig called the particles "aces", 
              Gell-Mann light-heartedly called them <strong>quarks</strong> from the phrase "Three quarks for 
              Muster Mark" in James Joyce's novel <em>Finnegans Wake</em>.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Proposed Quark Properties</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Quarks interact primarily via the strong nuclear force</li>
              <li>Three varieties, or flavours: <strong>up (u)</strong>, <strong>down (d)</strong>, and <strong>strange (s)</strong></li>
              <li>Each quark has baryon number of +1/3, each antiquark has -1/3</li>
              <li>All baryons are composed of three quarks (baryon number = +1)</li>
              <li>All mesons are composed of one quark and one antiquark (baryon number = 0)</li>
              <li>Each quark and antiquark has spin of 1/2</li>
              <li><strong>Fractional charges:</strong> either -1/3 or +2/3 of the fundamental electron charge</li>
            </ul>
            
            <div className="overflow-x-auto mb-4">
              <table className="w-full border-collapse bg-white rounded">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-400 px-3 py-2">Generation</th>
                    <th className="border border-gray-400 px-3 py-2">Quark</th>
                    <th className="border border-gray-400 px-3 py-2">Symbol</th>
                    <th className="border border-gray-400 px-3 py-2">Charge</th>
                    <th className="border border-gray-400 px-3 py-2">Antiquark</th>
                    <th className="border border-gray-400 px-3 py-2">Symbol</th>
                    <th className="border border-gray-400 px-3 py-2">Charge</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td rowSpan="2" className="border border-gray-400 px-3 py-2 font-semibold">1st</td>
                    <td className="border border-gray-400 px-3 py-2">Up</td>
                    <td className="border border-gray-400 px-3 py-2">u</td>
                    <td className="border border-gray-400 px-3 py-2">+2/3</td>
                    <td className="border border-gray-400 px-3 py-2">Anti-up</td>
                    <td className="border border-gray-400 px-3 py-2">ū</td>
                    <td className="border border-gray-400 px-3 py-2">-2/3</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Down</td>
                    <td className="border border-gray-400 px-3 py-2">d</td>
                    <td className="border border-gray-400 px-3 py-2">-1/3</td>
                    <td className="border border-gray-400 px-3 py-2">Anti-down</td>
                    <td className="border border-gray-400 px-3 py-2">d̄</td>
                    <td className="border border-gray-400 px-3 py-2">+1/3</td>
                  </tr>
                  <tr>
                    <td rowSpan="2" className="border border-gray-400 px-3 py-2 font-semibold">2nd</td>
                    <td className="border border-gray-400 px-3 py-2">Charm</td>
                    <td className="border border-gray-400 px-3 py-2">c</td>
                    <td className="border border-gray-400 px-3 py-2">+2/3</td>
                    <td className="border border-gray-400 px-3 py-2">Anti-charm</td>
                    <td className="border border-gray-400 px-3 py-2">c̄</td>
                    <td className="border border-gray-400 px-3 py-2">-2/3</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Strange</td>
                    <td className="border border-gray-400 px-3 py-2">s</td>
                    <td className="border border-gray-400 px-3 py-2">-1/3</td>
                    <td className="border border-gray-400 px-3 py-2">Anti-strange</td>
                    <td className="border border-gray-400 px-3 py-2">s̄</td>
                    <td className="border border-gray-400 px-3 py-2">+1/3</td>
                  </tr>
                  <tr>
                    <td rowSpan="2" className="border border-gray-400 px-3 py-2 font-semibold">3rd</td>
                    <td className="border border-gray-400 px-3 py-2">Top</td>
                    <td className="border border-gray-400 px-3 py-2">t</td>
                    <td className="border border-gray-400 px-3 py-2">+2/3</td>
                    <td className="border border-gray-400 px-3 py-2">Anti-top</td>
                    <td className="border border-gray-400 px-3 py-2">t̄</td>
                    <td className="border border-gray-400 px-3 py-2">-2/3</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-400 px-3 py-2">Bottom</td>
                    <td className="border border-gray-400 px-3 py-2">b</td>
                    <td className="border border-gray-400 px-3 py-2">-1/3</td>
                    <td className="border border-gray-400 px-3 py-2">Anti-bottom</td>
                    <td className="border border-gray-400 px-3 py-2">b̄</td>
                    <td className="border border-gray-400 px-3 py-2">+1/3</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div className="mb-4">
              <QuarkCompositionComponent />
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Experimental Evidence</h3>
            <p className="mb-4">
              In 1969, Friedman, Kendall, and Taylor at SLAC determined a way to "see" the quarks 
              within the nucleus. Their experiment was similar to Rutherford's, but used electrons 
              accelerated to energies a thousand times higher. They found physical evidence of 
              three point-like charges inside protons and neutrons.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Discovery of Additional Quarks</h3>
            <p className="mb-4">
              The discovery of the J/ψ meson in 1974 required a fourth quark - <strong>charm (c)</strong>. 
              The discovery of the tau lepton in 1975 led to the prediction of two more quarks: 
              <strong>bottom (b)</strong> discovered in 1977, and <strong>top (t)</strong> confirmed in 1995.
            </p>
            
            <p className="text-sm text-gray-600">
              Experiments in 1990 strongly suggest that nature cannot accommodate more than three 
              kinds of neutrinos, limiting us to six leptons and six quark flavours in three generations.
            </p>
          </div>
        )}
      </div>

      {/* Example 1 */}
      <div className="mb-6">
        <button
          onClick={() => setShowExample1(!showExample1)}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Example 1: Quark Composition Verification</span>
          <span>{showExample1 ? '−' : '+'}</span>
        </button>
        {showExample1 && (
          <div className="mt-4 p-6 bg-green-50 rounded-lg shadow-inner">
            <p className="font-semibold mb-3">
              The proton consists of two up quarks and one down quark (uud). The neutron consists 
              of one up quark and two down quarks (udd). For both baryons show that the sum of 
              their baryon numbers, charges and spins add up to their observed properties.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-3">Proton (uud)</h4>
                
                <div className="mb-3">
                  <p className="font-medium">Baryon Number:</p>
                  <BlockMath math="\\frac{1}{3} + \\frac{1}{3} + \\frac{1}{3} = 1" />
                </div>
                
                <div className="mb-3">
                  <p className="font-medium">Charge:</p>
                  <BlockMath math="\\left(+\\frac{2}{3}\\right) + \\left(+\\frac{2}{3}\\right) + \\left(-\\frac{1}{3}\\right) = +1" />
                </div>
                
                <div>
                  <p className="font-medium">Spin:</p>
                  <p className="text-sm">Each quark has spin 1/2. The total spin depends on alignment.</p>
                  <p className="text-sm">For proton: net spin = 1/2</p>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded">
                <h4 className="font-semibold mb-3">Neutron (udd)</h4>
                
                <div className="mb-3">
                  <p className="font-medium">Baryon Number:</p>
                  <BlockMath math="\\frac{1}{3} + \\frac{1}{3} + \\frac{1}{3} = 1" />
                </div>
                
                <div className="mb-3">
                  <p className="font-medium">Charge:</p>
                  <BlockMath math="\\left(+\\frac{2}{3}\\right) + \\left(-\\frac{1}{3}\\right) + \\left(-\\frac{1}{3}\\right) = 0" />
                </div>
                
                <div>
                  <p className="font-medium">Spin:</p>
                  <p className="text-sm">Each quark has spin 1/2. The total spin depends on alignment.</p>
                  <p className="text-sm">For neutron: net spin = 1/2</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-800">
                <strong>Result:</strong> Both the proton and neutron have baryon number = +1, 
                spin = 1/2, and the correct charges (+1 for proton, 0 for neutron), 
                confirming the quark model predictions.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Color Charge and Strong Force (Optional) */}
      <div className="mb-6">
        <button
          onClick={() => setShowColorCharge(!showColorCharge)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>"Color" Charge and the Strong Force <span className="text-amber-200 font-normal">(Optional)</span></span>
          <span>{showColorCharge ? '−' : '+'}</span>
        </button>
        {showColorCharge && (
          <div className="mt-4 p-6 bg-amber-50 rounded-lg shadow-inner border-l-4 border-amber-500">
            <div className="bg-amber-100 p-3 rounded mb-4">
              <p className="text-amber-800 font-medium">⚠️ This section is optional content</p>
            </div>
            
            <p className="mb-4">
              A theoretical objection to the quark model was raised regarding the <strong>Pauli Exclusion Principle</strong>. 
              For example, the Δ⁺⁺ baryon corresponds to uuu, three u-quarks in the same quantum state, 
              which violates the exclusion principle.
            </p>
            
            <p className="mb-4">
              <strong>Glashow proposed</strong> that each flavour of quark actually came in three varieties, 
              or "colors": <span className="text-red-600 font-semibold">red</span>, 
              <span className="text-green-600 font-semibold">green</span>, and 
              <span className="text-blue-600 font-semibold">blue</span>. The three quarks that make up 
              baryons all have different "colors", so they are not identical particles.
            </p>
            
            <div className="mb-4">
              <ColorChargeComponent />
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Properties of Color Charge</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li><strong>Color Neutrality:</strong> All observable particles must be "color neutral"</li>
              <li><strong>Baryons:</strong> Contain all three colors (red + green + blue = white)</li>
              <li><strong>Mesons:</strong> Contain color-anticolor pairs (e.g., red + anti-red = white)</li>
              <li><strong>Gluons:</strong> Exchange particles that carry color charge and mediate strong force</li>
              <li><strong>Confinement:</strong> Free quarks cannot exist because they would have net color charge</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Two Categories of Strong Force</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li><strong>Fundamental strong force:</strong> Acts within hadrons to hold quarks together</li>
              <li><strong>Residual strong force:</strong> Exchange of gluons between quarks in different nucleons, "glues" nucleus together</li>
            </ol>
            
            <div className="mt-4 bg-blue-50 p-4 rounded">
              <p className="text-sm text-blue-800">
                <strong>Three Types of Charge:</strong>
              </p>
              <ul className="text-sm text-blue-800 list-disc list-inside mt-2">
                <li><strong>Electromagnetic charge:</strong> (+) and (-), mediated by photons</li>
                <li><strong>Color charge:</strong> Eight types of gluons mediate strong force</li>
                <li><strong>Weak charge:</strong> Mediated by W⁺, W⁻, and Z⁰ bosons</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* No Individual Quarks (Optional) */}
      <div className="mb-6">
        <button
          onClick={() => setShowConfinement(!showConfinement)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>No Individual Quarks <span className="text-amber-200 font-normal">(Optional)</span></span>
          <span>{showConfinement ? '−' : '+'}</span>
        </button>
        {showConfinement && (
          <div className="mt-4 p-6 bg-amber-50 rounded-lg shadow-inner border-l-4 border-amber-500">
            <div className="bg-amber-100 p-3 rounded mb-4">
              <p className="text-amber-800 font-medium">⚠️ This section is optional content</p>
            </div>
            
            <p className="mb-4">
              One might expect that blasting two protons together would produce a shower of quarks, 
              yet no free quark has ever been observed. Theoreticians have made a case for <strong>quark confinement</strong>.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Quark Confinement Mechanism</h3>
            <p className="mb-4">
              If a quark is pulled away from its neighbors, the field of the strong force "stretches" 
              between the quarks. Like a rubber band being stretched, more energy goes into the field 
              as the quarks are pulled apart.
            </p>
            
            <p className="mb-4">
              When there is enough energy in the field, the energy is converted into a new quark-antiquark 
              pair – a meson emerges. Energy is conserved because the energy in the field was converted 
              into the mass of the new quarks, and the field returns to its ground state.
            </p>
            
            <div className="bg-black rounded p-4 mb-4">
              <svg width="500" height="200">
                <text x="250" y="20" fill="#FFF" fontSize="14" textAnchor="middle" fontWeight="bold">
                  Force vs. Distance Comparison
                </text>
                
                {/* Electromagnetic/Gravity force */}
                <g>
                  <text x="125" y="50" fill="#4ECDC4" fontSize="12" textAnchor="middle">
                    Electromagnetic/Gravity
                  </text>
                  <path
                    d="M 50 70 Q 150 70 200 150"
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="2"
                  />
                  <text x="125" y="170" fill="#4ECDC4" fontSize="10" textAnchor="middle">
                    Force decreases with distance²
                  </text>
                </g>
                
                {/* Strong force */}
                <g>
                  <text x="375" y="50" fill="#FF6B6B" fontSize="12" textAnchor="middle">
                    Strong Force
                  </text>
                  <line
                    x1="300"
                    y1="70"
                    x2="450"
                    y2="70"
                    stroke="#FF6B6B"
                    strokeWidth="2"
                  />
                  <text x="375" y="170" fill="#FF6B6B" fontSize="10" textAnchor="middle">
                    Force remains constant
                  </text>
                </g>
                
                {/* Axes */}
                <line x1="50" y1="150" x2="200" y2="150" stroke="#666" strokeWidth="1" />
                <line x1="50" y1="70" x2="50" y2="150" stroke="#666" strokeWidth="1" />
                <text x="125" y="190" fill="#666" fontSize="10" textAnchor="middle">Distance</text>
                <text x="30" y="110" fill="#666" fontSize="10" textAnchor="middle" transform="rotate(-90 30 110)">Force</text>
                
                <line x1="300" y1="150" x2="450" y2="150" stroke="#666" strokeWidth="1" />
                <line x1="300" y1="70" x2="300" y2="150" stroke="#666" strokeWidth="1" />
                <text x="375" y="190" fill="#666" fontSize="10" textAnchor="middle">Distance</text>
                <text x="280" y="110" fill="#666" fontSize="10" textAnchor="middle" transform="rotate(-90 280 110)">Force</text>
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Mass-Energy Equivalence in Protons</h3>
            <p className="mb-4">
              Quark confinement demonstrates Einstein's mass-energy equivalence. The mass of a particle 
              made of quarks comes not only from the quark masses, but also from their kinetic energy. 
              In a proton, only 1.3% of its mass comes from the mass of the three quarks.
            </p>
            
            <div className="bg-red-50 p-4 rounded">
              <p className="text-red-800 text-sm">
                <strong>Key Point:</strong> Since the strong force remains constant as quarks separate 
                (unlike gravity and electromagnetism which decrease with distance), more and more work 
                must be done to separate quarks. Thus, a quark can never get free.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Neutron Decay Revisited */}
      <div className="mb-6">
        <button
          onClick={() => setShowNeutronDecay(!showNeutronDecay)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>Neutron Decay Revisited</span>
          <span>{showNeutronDecay ? '−' : '+'}</span>
        </button>
        {showNeutronDecay && (
          <div className="mt-4 p-6 bg-gray-50 rounded-lg shadow-inner">
            <p className="mb-4">
              When physicists determined that the neutron is composed of quarks (one up quark and two down quarks), 
              they realized that the neutron itself was not decaying, but rather one of the quarks was decaying.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Quark-Level Description</h3>
            <p className="mb-4">
              Neutron beta decay occurs when a neutron (udd) decays into a proton (uud), an electron, 
              and an electron antineutrino. At the quark level, this is the decay of a down quark into an up quark.
            </p>
            
            <div className="bg-black rounded p-6 mb-4">
              <svg width="600" height="300">
                <text x="300" y="25" fill="#FFF" fontSize="16" textAnchor="middle" fontWeight="bold">
                  Neutron Decay at Quark Level
                </text>
                
                {/* Before decay */}
                <g>
                  <text x="150" y="60" fill="#FFF" fontSize="14" textAnchor="middle">Before: Neutron (udd)</text>
                  
                  {/* Quarks */}
                  <circle cx="100" cy="100" r="15" fill="#FF6B6B" />
                  <text x="100" y="105" fill="#FFF" fontSize="12" textAnchor="middle">u</text>
                  
                  <circle cx="150" cy="100" r="15" fill="#4ECDC4" />
                  <text x="150" y="105" fill="#FFF" fontSize="12" textAnchor="middle">d</text>
                  
                  <circle cx="200" cy="100" r="15" fill="#4ECDC4" />
                  <text x="200" y="105" fill="#FFF" fontSize="12" textAnchor="middle">d</text>
                  
                  <text x="150" y="130" fill="#FFF" fontSize="12" textAnchor="middle">Charge: 0</text>
                </g>
                
                {/* Arrow */}
                <path d="M 250 100 L 350 100" stroke="#FFF" strokeWidth="2" markerEnd="url(#arrowhead)" />
                <defs>
                  <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                    <polygon points="0 0, 10 3.5, 0 7" fill="#FFF" />
                  </marker>
                </defs>
                
                {/* After decay */}
                <g>
                  <text x="450" y="60" fill="#FFF" fontSize="14" textAnchor="middle">After: Proton + e⁻ + ν̄ₑ</text>
                  
                  {/* Proton quarks */}
                  <circle cx="400" cy="100" r="15" fill="#FF6B6B" />
                  <text x="400" y="105" fill="#FFF" fontSize="12" textAnchor="middle">u</text>
                  
                  <circle cx="450" cy="100" r="15" fill="#FF6B6B" />
                  <text x="450" y="105" fill="#FFF" fontSize="12" textAnchor="middle">u</text>
                  
                  <circle cx="500" cy="100" r="15" fill="#4ECDC4" />
                  <text x="500" y="105" fill="#FFF" fontSize="12" textAnchor="middle">d</text>
                  
                  <text x="450" y="130" fill="#FFF" fontSize="12" textAnchor="middle">Proton (Charge: +1)</text>
                  
                  {/* Electron and neutrino */}
                  <circle cx="520" cy="160" r="8" fill="#9B59B6" />
                  <text x="520" y="165" fill="#FFF" fontSize="10" textAnchor="middle">e⁻</text>
                  
                  <circle cx="550" cy="160" r="8" fill="#F39C12" />
                  <text x="550" y="165" fill="#FFF" fontSize="8" textAnchor="middle">ν̄ₑ</text>
                </g>
                
                {/* W boson */}
                <g>
                  <text x="300" y="180" fill="#FFD700" fontSize="12" textAnchor="middle">W⁻ boson mediates decay</text>
                  <circle cx="300" cy="200" r="10" fill="#FFD700" />
                  <text x="300" y="205" fill="#000" fontSize="10" textAnchor="middle">W⁻</text>
                </g>
                
                {/* Decay equation */}
                <text x="300" y="250" fill="#FFF" fontSize="14" textAnchor="middle">
                  d → u + W⁻ → u + e⁻ + ν̄ₑ
                </text>
              </svg>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">The Process</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>One down quark (charge -1/3) transforms into an up quark (charge +2/3)</li>
              <li>To conserve charge, a virtual W⁻ boson is released</li>
              <li>The neutron becomes a proton (uud)</li>
              <li>The W⁻ boson decays into an electron and electron antineutrino</li>
              <li>The entire process takes about 10⁻¹⁸ seconds</li>
            </ol>
            
            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-blue-800 text-sm">
                <strong>Modern Understanding:</strong> In scientific progress, old ideas are seldom completely 
                replaced, but their range of applicability is restricted. The quark model provides a more 
                fundamental understanding of neutron decay.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* To Quark or Not to Quark (Optional) */}
      <div className="mb-6">
        <button
          onClick={() => setShowToQuark(!showToQuark)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>To Quark or Not to Quark? <span className="text-amber-200 font-normal">(Optional)</span></span>
          <span>{showToQuark ? '−' : '+'}</span>
        </button>
        {showToQuark && (
          <div className="mt-4 p-6 bg-amber-50 rounded-lg shadow-inner border-l-4 border-amber-500">
            <div className="bg-amber-100 p-3 rounded mb-4">
              <p className="text-amber-800 font-medium">⚠️ This section is optional content</p>
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Are Quarks Fundamental?</h3>
            <p className="mb-4">
              With current generation accelerators, we have found no evidence for structure or constituents 
              within quarks. Studies establish that the quark is fundamental to a tiny scale, 10⁻¹⁹ m. 
              But one does not know if quarks are fundamental.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Only First Generation Matters</h3>
            <p className="mb-4">
              In the 1970s and early 1980s, scientists found that the fundamental particles are the quarks 
              and the leptons. Of the former fundamental triad – proton, neutron, and electron – only the 
              electron survives as fundamental.
            </p>
            
            <p className="mb-4">
              The question arises, "What importance do quarks have to the materials we use in the everyday world?" 
              The only leptons we need are the electron and its companion neutrino, to explain the weak interactions. 
              The up and down quarks are needed to form the protons and neutrons in atomic nuclei.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Higher Generation Quarks</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li><strong>Strange quarks:</strong> Only appear in high-energy cosmic rays above Earth's surface</li>
              <li><strong>Charm, top, and bottom quarks:</strong> Only appear in particle accelerator explorations</li>
              <li><strong>Relevance:</strong> The quarks do not have much relevance for ordinary matter on Earth</li>
            </ul>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="text-gray-800 text-sm">
                <strong>Future Research:</strong> Only future investigations through experiments at new, more 
                energetic colliders like the Large Hadron Collider will reveal this secret of nature. The study 
                of quarks at tiny scales continues to push the boundaries of our understanding of matter.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* The Standard Model (Optional) */}
      <div className="mb-6">
        <button
          onClick={() => setShowStandardModel(!showStandardModel)}
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-colors flex justify-between items-center"
        >
          <span>The Standard Model <span className="text-amber-200 font-normal">(Optional)</span></span>
          <span>{showStandardModel ? '−' : '+'}</span>
        </button>
        {showStandardModel && (
          <div className="mt-4 p-6 bg-amber-50 rounded-lg shadow-inner border-l-4 border-amber-500">
            <div className="bg-amber-100 p-3 rounded mb-4">
              <p className="text-amber-800 font-medium">⚠️ This section is optional content</p>
            </div>
            
            <p className="mb-4">
              The various elementary particles that have been discovered can interact via one or more of the 
              four fundamental forces: the gravitational force, the strong nuclear force, the weak nuclear force, 
              and the electromagnetic force. In particle physics, the phrase "standard model" refers to the 
              currently accepted explanation for the strong nuclear force, the weak nuclear force, and the 
              electromagnetic force.
            </p>
            
            <div className="mb-4">
              <StandardModelComponent />
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Force Unification</h3>
            <p className="mb-4">
              In the standard model, the weak nuclear force and the electromagnetic force are separate 
              manifestations of a single even more fundamental interaction, referred to as the electroweak interaction.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Building Blocks of Matter</h3>
            <p className="mb-4">
              Our understanding of the building blocks of matter follows the pattern illustrated below. 
              Molecules, such as water (H₂O) and glucose (C₆H₁₂O₆), are composed of atoms. Each atom 
              consists of a nucleus that is surrounded by a cloud of electrons. The nucleus, in turn, 
              is made up of protons and neutrons, which are composed of quarks.
            </p>
            
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold mb-2">Hierarchy of Matter:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                <li><strong>Molecules</strong> → made of atoms</li>
                <li><strong>Atoms</strong> → nucleus + electrons</li>
                <li><strong>Nucleus</strong> → protons + neutrons</li>
                <li><strong>Protons/Neutrons</strong> → quarks</li>
                <li><strong>Quarks</strong> → fundamental particles (as far as we know)</li>
              </ol>
            </div>
            
            <div className="mt-4 bg-green-50 p-4 rounded">
              <p className="text-green-800 text-sm">
                <strong>Everyday Matter:</strong> Remarkably, the enormous complexity of our everyday world 
                emerges from just a few fundamental particles: up quarks, down quarks, electrons, and 
                electron neutrinos (plus the force-carrying photons and gluons).
              </p>
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
              <li>Quarks are the fundamental building blocks of protons and neutrons</li>
              <li>Six quark flavors exist in three generations: (u,d), (c,s), (t,b)</li>
              <li>Quarks have fractional electric charges: +2/3 or -1/3</li>
              <li>Baryons are made of three quarks (qqq), mesons of quark-antiquark pairs (qq̄)</li>
              <li>Proton = uud (charge +1), Neutron = udd (charge 0)</li>
              <li>Color charge is the quark property that responds to strong force</li>
              <li>All observable particles must be color neutral (colorless)</li>
              <li>Gluons carry color charge and mediate the strong force between quarks</li>
              <li>Quark confinement: free quarks cannot exist due to constant strong force</li>
              <li>Neutron decay occurs at quark level: d → u + W⁻ → u + e⁻ + ν̄ₑ</li>
              <li>Only first generation quarks (u,d) needed for ordinary matter</li>
              <li>Higher generation quarks appear only in high-energy environments</li>
              <li>Standard Model describes electromagnetic, weak, and strong forces</li>
              <li>Electroweak force unifies electromagnetic and weak interactions</li>
              <li>Everyday matter requires only: up quarks, down quarks, electrons, electron neutrinos</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualContent;