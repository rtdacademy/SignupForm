
import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

// Interactive Cloud Chamber Component
const CloudChamberComponent = () => {
  const [isActive, setIsActive] = useState(false);
  const [particles, setParticles] = useState([]);
  const [particleType, setParticleType] = useState('alpha');
  
  const particleTypes = {
    alpha: { name: 'Alpha (α)', color: '#FF6B6B', thickness: 4, length: 30, charge: '+2' },
    beta: { name: 'Beta (β)', color: '#4ECDC4', thickness: 2, length: 80, charge: '-1' },
    gamma: { name: 'Gamma (γ)', color: '#9B59B6', thickness: 1, length: 150, charge: '0' }
  };
  
  const startDetection = () => {
    setIsActive(true);
    const newParticles = [];
    for (let i = 0; i < 5; i++) {
      const selectedType = particleTypes[particleType];
      newParticles.push({
        id: i,
        type: particleType,
        x1: 50 + Math.random() * 100,
        y1: 50 + Math.random() * 100,
        x2: 50 + Math.random() * 100 + selectedType.length,
        y2: 50 + Math.random() * 100 + Math.random() * 50,
        color: selectedType.color,
        thickness: selectedType.thickness
      });
    }
    setParticles(newParticles);
    
    setTimeout(() => {
      setIsActive(false);
      setParticles([]);
    }, 3000);
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Cloud Chamber Simulation</h4>
      
      <div className="mb-4 flex flex-wrap gap-4 justify-center">
        <select
          value={particleType}
          onChange={(e) => setParticleType(e.target.value)}
          className="p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.entries(particleTypes).map(([key, type]) => (
            <option key={key} value={key}>
              {type.name} particles
            </option>
          ))}
        </select>
        
        <button
          onClick={startDetection}
          disabled={isActive}
          className={`px-4 py-2 rounded font-semibold ${
            isActive 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          {isActive ? 'Detecting...' : 'Start Detection'}
        </button>
      </div>
      
      <div className="bg-black rounded p-4 mb-4">
        <svg width="400" height="300">
          {/* Chamber walls */}
          <rect x="10" y="10" width="380" height="280" fill="none" stroke="#666" strokeWidth="2" />
          
          {/* Radioactive source */}
          <circle cx="50" cy="50" r="8" fill="#FFD700" />
          <text x="65" y="55" fill="#FFD700" fontSize="12">Source</text>
          
          {/* Particle tracks */}
          {particles.map((particle) => (
            <line
              key={particle.id}
              x1={particle.x1}
              y1={particle.y1}
              x2={particle.x2}
              y2={particle.y2}
              stroke={particle.color}
              strokeWidth={particle.thickness}
              opacity={isActive ? 1 : 0}
              className="transition-opacity duration-500"
            />
          ))}
          
          {/* Vapor condensation effect */}
          {isActive && (
            <g>
              {Array.from({ length: 20 }).map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * 380 + 10}
                  cy={Math.random() * 280 + 10}
                  r="1"
                  fill="#ADD8E6"
                  opacity="0.6"
                />
              ))}
            </g>
          )}
        </svg>
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        <h5 className="font-semibold mb-2">How it works:</h5>
        <ul className="list-disc list-inside space-y-1">
          <li>Supersaturated alcohol vapor condenses around charged particles</li>
          <li>Different particles leave different track characteristics</li>
          <li>Alpha: Short, thick tracks (high ionization, low penetration)</li>
          <li>Beta: Longer, thinner tracks (moderate ionization)</li>
          <li>Gamma: Very faint tracks (low ionization, high penetration)</li>
        </ul>
      </div>
    </div>
  );
};

// Interactive Pair Production/Annihilation Component
const PairProductionComponent = () => {
  const [mode, setMode] = useState('production');
  const [showAnimation, setShowAnimation] = useState(false);
  
  const startAnimation = () => {
    setShowAnimation(true);
    setTimeout(() => setShowAnimation(false), 2000);
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Pair Production & Annihilation</h4>
      
      <div className="mb-4 flex justify-center gap-4">
        <button
          onClick={() => setMode('production')}
          className={`px-4 py-2 rounded ${
            mode === 'production' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Pair Production
        </button>
        <button
          onClick={() => setMode('annihilation')}
          className={`px-4 py-2 rounded ${
            mode === 'annihilation' ? 'bg-blue-600 text-white' : 'bg-gray-600 text-gray-300'
          }`}
        >
          Pair Annihilation
        </button>
      </div>
      
      <div className="bg-black rounded p-4 mb-4">
        <svg width="500" height="200">
          {mode === 'production' ? (
            // Pair Production
            <g>
              <text x="250" y="20" fill="#FFF" fontSize="14" textAnchor="middle">
                Pair Production: γ → e⁻ + e⁺
              </text>
              
              {/* Nucleus */}
              <circle cx="250" cy="100" r="15" fill="#FFD700" />
              <text x="250" y="130" fill="#FFD700" fontSize="12" textAnchor="middle">Nucleus</text>
              
              {/* Incoming photon */}
              <line
                x1={showAnimation ? 200 : 50}
                y1="100"
                x2={showAnimation ? 235 : 200}
                y2="100"
                stroke="#9B59B6"
                strokeWidth="3"
                className="transition-all duration-1000"
              />
              <text x="125" y="85" fill="#9B59B6" fontSize="12" textAnchor="middle">γ-ray</text>
              
              {/* Outgoing particles */}
              {showAnimation && (
                <g>
                  {/* Electron */}
                  <circle cx="300" cy="80" r="5" fill="#4ECDC4" />
                  <text x="320" y="85" fill="#4ECDC4" fontSize="12">e⁻</text>
                  
                  {/* Positron */}
                  <circle cx="300" cy="120" r="5" fill="#FF6B6B" />
                  <text x="320" y="125" fill="#FF6B6B" fontSize="12">e⁺</text>
                  
                  {/* Spiral tracks in magnetic field */}
                  <path
                    d="M 265 80 Q 280 70 295 80 Q 310 90 325 80"
                    fill="none"
                    stroke="#4ECDC4"
                    strokeWidth="2"
                  />
                  <path
                    d="M 265 120 Q 280 130 295 120 Q 310 110 325 120"
                    fill="none"
                    stroke="#FF6B6B"
                    strokeWidth="2"
                  />
                </g>
              )}
            </g>
          ) : (
            // Pair Annihilation
            <g>
              <text x="250" y="20" fill="#FFF" fontSize="14" textAnchor="middle">
                Pair Annihilation: e⁻ + e⁺ → γ + γ
              </text>
              
              {/* Incoming particles */}
              <circle
                cx={showAnimation ? 220 : 100}
                cy="80"
                r="5"
                fill="#4ECDC4"
                className="transition-all duration-1000"
              />
              <text x="80" y="85" fill="#4ECDC4" fontSize="12">e⁻</text>
              
              <circle
                cx={showAnimation ? 280 : 400}
                cy="120"
                r="5"
                fill="#FF6B6B"
                className="transition-all duration-1000"
              />
              <text x="420" y="125" fill="#FF6B6B" fontSize="12">e⁺</text>
              
              {/* Annihilation point */}
              {showAnimation && (
                <g>
                  <circle cx="250" cy="100" r="8" fill="#FFFFFF" opacity="0.8" />
                  
                  {/* Outgoing photons */}
                  <line x1="250" y1="100" x2="350" y2="60" stroke="#9B59B6" strokeWidth="3" />
                  <line x1="250" y1="100" x2="150" y2="140" stroke="#9B59B6" strokeWidth="3" />
                  
                  <text x="360" y="65" fill="#9B59B6" fontSize="12">γ</text>
                  <text x="130" y="145" fill="#9B59B6" fontSize="12">γ</text>
                </g>
              )}
            </g>
          )}
        </svg>
      </div>
      
      <div className="text-center mb-4">
        <button
          onClick={startAnimation}
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Animate {mode === 'production' ? 'Production' : 'Annihilation'}
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        {mode === 'production' ? (
          <div>
            <p className="mb-2"><strong>Pair Production Requirements:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Minimum photon energy: <InlineMath math="E = 2m_e c^2 = 1.022 \text{ MeV}" /></li>
              <li>Must occur near nucleus for momentum conservation</li>
              <li>Creates electron-positron pair simultaneously</li>
            </ul>
          </div>
        ) : (
          <div>
            <p className="mb-2"><strong>Pair Annihilation Features:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Complete conversion of mass to energy</li>
              <li>Usually produces two 511 keV photons</li>
              <li>Photons emitted in opposite directions</li>
              <li>Basis for PET scan medical imaging</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

// Forces Comparison Component
const ForcesComponent = () => {
  const [selectedForce, setSelectedForce] = useState('strong');
  
  const forces = {
    strong: {
      name: 'Strong Nuclear Force',
      strength: '10⁴',
      range: '≈ 10⁻¹⁵ m',
      mediator: 'Gluons',
      color: '#FF6B6B',
      description: 'Binds quarks into protons/neutrons and holds nucleus together'
    },
    electromagnetic: {
      name: 'Electromagnetic Force',
      strength: '10²',
      range: 'Unlimited',
      mediator: 'Photons',
      color: '#4ECDC4',
      description: 'Acts between charged particles, responsible for atoms and chemistry'
    },
    weak: {
      name: 'Weak Nuclear Force',
      strength: '10⁻²',
      range: '≈ 10⁻¹⁷ m',
      mediator: 'W⁺, W⁻, Z⁰ bosons',
      color: '#9B59B6',
      description: 'Responsible for beta decay and neutrino interactions'
    },
    gravitational: {
      name: 'Gravitational Force',
      strength: '10⁻³⁴',
      range: 'Unlimited',
      mediator: 'Gravitons (theoretical)',
      color: '#F39C12',
      description: 'Weakest force but dominates at large scales due to unlimited range'
    }
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">The Four Fundamental Forces</h4>
      
      <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
        {Object.entries(forces).map(([key, force]) => (
          <button
            key={key}
            onClick={() => setSelectedForce(key)}
            className={`p-2 rounded text-sm font-medium ${
              selectedForce === key 
                ? 'text-white' 
                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
            }`}
            style={selectedForce === key ? { backgroundColor: force.color } : {}}
          >
            {force.name.split(' ')[0]}
          </button>
        ))}
      </div>
      
      <div className="bg-black rounded p-4 mb-4">
        <svg width="600" height="300">
          {/* Force strength comparison */}
          <text x="300" y="25" fill="#FFF" fontSize="16" textAnchor="middle" fontWeight="bold">
            Relative Force Strengths
          </text>
          
          {/* Logarithmic scale */}
          <line x1="50" y1="250" x2="550" y2="250" stroke="#FFF" strokeWidth="2" />
          
          {Object.entries(forces).map(([key, force], index) => {
            const strength = parseFloat(force.strength.replace('10', ''));
            const logStrength = Math.log10(Math.pow(10, strength));
            const barHeight = Math.max(10, (logStrength + 34) * 5);
            const x = 80 + index * 120;
            const isSelected = selectedForce === key;
            
            return (
              <g key={key}>
                <rect
                  x={x}
                  y={250 - barHeight}
                  width="60"
                  height={barHeight}
                  fill={isSelected ? force.color : '#555'}
                  stroke={force.color}
                  strokeWidth={isSelected ? 3 : 1}
                />
                <text
                  x={x + 30}
                  y={270}
                  fill={isSelected ? force.color : '#AAA'}
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight={isSelected ? 'bold' : 'normal'}
                >
                  {force.name.split(' ')[0]}
                </text>
                <text
                  x={x + 30}
                  y={250 - barHeight - 10}
                  fill={force.color}
                  fontSize="12"
                  textAnchor="middle"
                >
                  {force.strength}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      
      <div className="bg-gray-800 p-4 rounded">
        <div className="text-white">
          <h5 className="font-semibold mb-2" style={{ color: forces[selectedForce].color }}>
            {forces[selectedForce].name}
          </h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
            <div>
              <strong>Relative Strength:</strong> {forces[selectedForce].strength}
            </div>
            <div>
              <strong>Range:</strong> {forces[selectedForce].range}
            </div>
            <div>
              <strong>Mediator:</strong> {forces[selectedForce].mediator}
            </div>
          </div>
          <p className="text-sm">{forces[selectedForce].description}</p>
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
          Particle Physics
        </h1>
        <p className="text-lg text-gray-600">
          Elementary particles and fundamental forces
        </p>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">

            <AIAccordion.Item value="introduction" title="Introduction to Particle Physics" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <blockquote className="italic text-gray-700 mb-4 border-l-4 border-blue-500 pl-4">
              "The stumbling way in which even the ablest of the scientists in every generation 
              have had to fight through thickets of erroneous observations, misleading generalizations, 
              inadequate formulations, and unconscious prejudice is rarely appreciated by those who 
              obtain their scientific knowledge from textbooks."
              <footer className="text-right mt-2">— James Bryant Conant</footer>
            </blockquote>
            
            <p className="mb-4">
              The concept that matter is composed of elementary building blocks originated with 
              Democritus (circa 500 BCE). By the early 1800s, with acceptance of Dalton's atomic 
              theory, the atom was considered to be elementary. Indeed, the term element is still 
              used when referring to the 103 or so different known atoms.
            </p>
            
            <p className="mb-4">
              By the early 1900s, the discovery of the electron and the basic subatomic structure 
              of the atom indicated that the electron, proton, and neutron were the elementary particles. 
              By the mid 1930s, the photon, positron, and neutrino were also considered to be elementary.
            </p>
            
            <p className="mb-4">
              Since 1970, the existence of over 300 such particles has been firmly established, and 
              several models describing the relations among them have been developed. The question 
              arises then, what particles are elementary? It is this question that challenges 
              participants in the field of physics known as <strong>elementary particle physics</strong>.
            </p>
          </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="detectors" title="Particle Detectors" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              Subatomic particles are far too small and move too fast to be observed directly. 
              Also, most elementary particles decay into smaller particles very quickly – i.e. 
              10⁻²⁴ to 10⁻⁹ s. In order for a detector to sense a particle, there must be an 
              interaction between the particle and the material of which the detector is made.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Cloud Chamber</h3>
            <p className="mb-4">
              The cloud chamber was invented in 1911 by Charles Wilson, a Scottish physicist. 
              Wilson found that in a gas supersaturated with a vapour, the vapour will condense 
              into droplets around the trajectories of charged ions as they pass through the gas. 
              The ions leave behind trails of droplets which can be photographed.
            </p>
            
            <div className="mb-4">
              <CloudChamberComponent />
            </div>
            
            <p className="mb-4">
              Carefully timed photographs record the paths of the resulting bubble trails. 
              Frequently a magnetic field is applied across the chamber, bending the paths 
              of the charged particles. Positive particles are curved in one direction, 
              negative particles in the other.
            </p>
            
            <h3 className="text-xl font-semibold mb-3">Bubble Chamber</h3>
            <p className="mb-4">
              In the bubble chamber, liquid propane, hydrogen, helium, and xenon are all used. 
              However, liquid hydrogen is used most commonly since the hydrogen nuclei provide 
              target protons for collisions. The liquid hydrogen must be kept below –252.8°C 
              to remain liquid.
            </p>
            
            <p className="mb-4">
              If the pressure in the liquid hydrogen is suddenly lowered, however, the hydrogen 
              boils. If a high-speed charged particle passes through the hydrogen at exactly 
              the same instant, hydrogen ions are formed, and the hydrogen boils a few thousandths 
              of a second sooner around these ions than in the rest of the container.
            </p>
            
            <div className="bg-yellow-50 p-4 rounded">
              <p className="text-sm">
                <strong>Note:</strong> Both cloud and bubble chambers show tracks of charged particles 
                only. Neutral particles (neutrons, neutrinos, photons) leave no visible tracks but 
                can be detected indirectly through their interactions with charged particles.
              </p>
            </div>
          </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="antiparticles" title="Antiparticles and Pair Production" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              Carl Anderson was the first to observe the positron. In his experiment, high-energy 
              cosmic rays, consisting of highly energetic gamma ray photons, passed through a cloud 
              chamber. When these photons collided with the nuclei within a thin lead plate, electrons 
              and positrons were created simultaneously in a process called <strong>pair production</strong>.
            </p>
            
            <BlockMath math="\\gamma \\rightarrow e^- + e^+" />
            
            <p className="mb-4">
              For electron-positron pair production to occur two things must happen. First, a photon 
              must collide with a nucleus causing the photon's energy to be transformed into particles 
              – i.e. a photon cannot spontaneously decay into a pair. Second, the conservation of 
              mass-energy requires that the minimum photon energy must be equal to the rest mass 
              energy of an electron plus a positron.
            </p>
            
            <div className="mb-4">
              <PairProductionComponent />
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Pair Annihilation</h3>
            <p className="mb-4">
              If positrons are formed in β⁺ decay and in pair production, why are they not normally 
              found in nature? The positron finds itself in the company of many electrons. Under 
              normal conditions, a positron will collide with an electron within a millionth of a second.
            </p>
            
            <p className="mb-4">
              When particle meets antiparticle they <strong>annihilate</strong> one another and energy 
              in the form of photons is emitted. This process is known as pair annihilation, the direct 
              conversion of mass into electromagnetic energy.
            </p>
            
            <BlockMath math="e^- + e^+ \\rightarrow \\gamma + \\gamma" />
            
            <p className="mb-4">
              The conservation laws predict that two photons are emitted in opposite directions and 
              with opposite spins. This has been verified experimentally.
            </p>
            
            <div className="bg-blue-50 p-4 rounded">
              <p className="mb-2"><strong>Antimatter:</strong></p>
              <p className="text-sm">
                Physicists began to speculate about other kinds of antiparticles. It was possible 
                to imagine a world of antimatter, where positrons moved in Bohr orbits around nuclei 
                containing negatively charged antiprotons. However, if antimatter and ordinary matter 
                came into contact, they would annihilate each other with an explosive release of energy.
              </p>
            </div>
          </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example1" title="Minimum Energy for Pair Production" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="font-semibold mb-3">
              What is the minimum frequency of a photon required to produce a stationary electron-positron pair?
            </p>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-2"><strong>Step 1:</strong> Calculate the rest energy of an electron/positron using E = mc²</p>
              <BlockMath math="E = m_e c^2 = (9.10938 \\times 10^{-31} \\text{ kg})(2.99792 \\times 10^8 \\text{ m/s})^2" />
              <BlockMath math="E = 8.18710 \\times 10^{-14} \\text{ J}" />
              
              <p className="mb-2 mt-4"><strong>Step 2:</strong> For an electron and a positron to be created, the photon must have a minimum energy of:</p>
              <BlockMath math="E_{\\text{total}} = 2 \\times 8.18710 \\times 10^{-14} \\text{ J} = 1.63742 \\times 10^{-13} \\text{ J}" />
              
              <p className="mb-2 mt-4"><strong>Step 3:</strong> Calculate the frequency of the photon using E = hf</p>
              <BlockMath math="f = \\frac{E}{h} = \\frac{2(8.18710 \\times 10^{-14} \\text{ J})}{6.62607 \\times 10^{-34} \\text{ J·s}}" />
              <BlockMath math="f = 2.471 \\times 10^{20} \\text{ Hz}" />
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              This corresponds to a gamma ray with wavelength of about 1.2 × 10⁻¹² m, 
              which is much shorter than visible light wavelengths.
            </p>
          </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="forces" title="Nuclear Forces" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="mb-4">
              Soon after the nucleus was discovered there arose an obvious question: Since a group 
              of positively charge particles must repel each other, what holds the nucleus together? 
              A simple calculation of the repulsion between two protons separated by a distance that 
              puts them just about in contact in the nucleus (≈ 10⁻¹⁵ m) yields a repulsion value 
              of around 230 N.
            </p>
            
            <p className="mb-4">
              By 1925, there was recognition that a new kind of force was needed. The <strong>strong 
              nuclear force</strong> binds neutrons and protons together to form nuclei. It has an 
              effective range of 1.0 × 10⁻¹⁵ m and can have energies of as much as 100 MeV.
            </p>
            
            <div className="mb-4">
              <ForcesComponent />
            </div>
            
            <h3 className="text-xl font-semibold mb-3">Properties of the Strong Force</h3>
            <ul className="list-disc list-inside mb-4 space-y-2">
              <li>Attractive for distances around 1.0 × 10⁻¹⁵ m</li>
              <li>Repulsive at distances less than 0.5 × 10⁻¹⁵ m (nucleons cannot occupy same space)</li>
              <li>About 100 times stronger than electromagnetic force</li>
              <li>10³⁸ times stronger than gravitational force</li>
              <li>Has very short effective range</li>
            </ul>
            
            <h3 className="text-xl font-semibold mb-3">Why Some Nuclei Are Unstable</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>
                <strong>Range limitation:</strong> The strong force has a very short effective range. 
                As nuclei get larger, the distance between furthest protons increases, eventually 
                becoming too large for the strong force to overcome electrostatic repulsion.
              </li>
              <li>
                <strong>Weak nuclear force:</strong> Some nuclei are unstable due to the action 
                of the weak nuclear force, which explains how neutrons can convert to protons 
                and vice versa (beta decay).
              </li>
            </ol>
            
            <div className="mt-4 bg-blue-50 p-4 rounded">
              <p className="text-sm">
                <strong>Note:</strong> The weak nuclear force, discovered by Enrico Fermi in 1934, 
                is responsible for beta decay processes and neutrino interactions. It is much weaker 
                than the strong and electromagnetic forces but stronger than gravity.
              </p>
            </div>
          </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="example2" title="Force Between Protons" theme="green" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <p className="font-semibold mb-3">
              Calculate the electrostatic repulsion force between two protons separated by 2.0 × 10⁻¹⁵ m 
              (typical nuclear dimension).
            </p>
            
            <div className="bg-gray-100 p-4 rounded">
              <p className="mb-2"><strong>Given:</strong></p>
              <ul className="list-disc list-inside mb-4">
                <li>Distance: r = 2.0 × 10⁻¹⁵ m</li>
                <li>Charge of proton: e = 1.602 × 10⁻¹⁹ C</li>
                <li>Coulomb's constant: k = 8.99 × 10⁹ N·m²/C²</li>
              </ul>
              
              <p className="mb-2"><strong>Using Coulomb's Law:</strong></p>
              <BlockMath math="F = k \\frac{q_1 q_2}{r^2}" />
              
              <BlockMath math="F = (8.99 \\times 10^9) \\frac{(1.602 \\times 10^{-19})^2}{(2.0 \\times 10^{-15})^2}" />
              
              <BlockMath math="F = (8.99 \\times 10^9) \\frac{2.566 \\times 10^{-38}}{4.0 \\times 10^{-30}}" />
              
              <BlockMath math="F = 57.6 \\text{ N}" />
            </div>
            
            <p className="mt-4 text-sm text-gray-600">
              This enormous repulsive force (considering the tiny mass of a proton) demonstrates 
              why the strong nuclear force must be much stronger than the electromagnetic force 
              to hold the nucleus together.
            </p>
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

      {/* Slideshow Knowledge Check */}
      <SlideshowKnowledgeCheck
        courseId={courseId}
        lessonPath="70-particle-physics"
        course={course}
        itemConfig={itemConfig}
        questions={[
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question1',
            title: 'Question 1: Bubble vs Cloud Chambers'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question2',
            title: 'Question 2: Particle Visibility in Bubble Chambers'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question3',
            title: 'Question 3: Magnetic Fields in Detection'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question4',
            title: 'Question 4: Alpha vs Proton Tracks'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question5',
            title: 'Question 5: Proton vs Electron Tracks'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question6',
            title: 'Question 6: Psi Particle Mass Conversion'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question7',
            title: 'Question 7: Neutrino Energy from Beta Decay'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question8',
            title: 'Question 8: Beta Decay Electron Energy'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question9',
            title: 'Question 9: Positron Emission Neutrino Energy'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question10',
            title: 'Question 10: Neutron-Antineutron Pair Production'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question11',
            title: 'Question 11: Electron-Positron Pair Production'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question12',
            title: 'Question 12: Annihilation Photon Wavelength'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question13',
            title: 'Question 13: Conservation Laws in Interactions'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question14',
            title: 'Question 14: Proton-Proton Attraction'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question15',
            title: 'Question 15: Fundamental Force Strengths'
          },
          {
            type: 'multiple-choice',
            questionId: 'course2_70_question16',
            title: 'Question 16: Quantum Field Theory Forces'
          }
        ]}
        title="⚛️ Particle Physics Knowledge Check"
        subtitle="Test your understanding of particle detection, decay processes, and fundamental forces"
      />

      {/* Key Takeaways Summary */}
      <div className="my-8 p-6 bg-gray-100 rounded-lg border border-gray-300">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Key Takeaways</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 mb-3">Particle Detection & Discovery</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Elementary particle physics studies the fundamental building blocks of matter</li>
              <li>Over 300 subatomic particles have been discovered since the 1930s</li>
              <li>Cloud chambers show particle tracks as vapor condensation trails around ions</li>
              <li>Bubble chambers use superheated liquids that boil around charged particle tracks</li>
              <li>Only charged particles leave visible tracks; neutral particles are detected indirectly</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-800 mb-3">Antiparticles & Pair Production</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Carl Anderson discovered the positron through cosmic ray experiments in cloud chambers</li>
              <li>Pair production: high-energy photon creates electron-positron pair near nucleus</li>
              <li>Minimum energy for pair production: <InlineMath math="E = 2m_e c^2 = 1.022 \text{ MeV}" /></li>
              <li>Pair annihilation: electron and positron destroy each other, producing two gamma rays</li>
              <li>Antiparticles have same mass but opposite charge of their corresponding particles</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-800 mb-3">Fundamental Forces</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Strong nuclear force holds nucleus together despite proton-proton repulsion</li>
              <li>Strong force: strongest force, range ≈ 10⁻¹⁵ m, attractive at nuclear distances</li>
              <li>Four fundamental forces: strong, electromagnetic, weak nuclear, gravitational</li>
              <li>Nuclear instability arises from limited range of strong force and weak force effects</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-3">Energy & Calculations</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Particle detectors use interactions between particles and detector materials to track particle paths</li>
              <li>High-energy physics requires relativistic calculations and mass-energy equivalence</li>
              <li>Electromagnetic repulsion between protons requires strong force to overcome in nucleus</li>
              <li>Particle physics calculations often involve extremely large energies and small distances</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};


export default ManualContent;