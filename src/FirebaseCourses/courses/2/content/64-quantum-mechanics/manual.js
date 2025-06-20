import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive Orbital Visualization Component
const OrbitalVisualizationComponent = () => {
  const [selectedOrbital, setSelectedOrbital] = useState('1s');
  const [showProbability, setShowProbability] = useState(true);
  
  const orbitals = {
    '1s': {
      name: '1s Orbital',
      shape: 'spherical',
      n: 1, l: 0, ml: 0,
      description: 'Spherical probability distribution around nucleus',
      color: '#4ECDC4'
    },
    '2s': {
      name: '2s Orbital', 
      shape: 'spherical',
      n: 2, l: 0, ml: 0,
      description: 'Larger spherical distribution with radial node',
      color: '#45B7D1'
    },
    '2px': {
      name: '2px Orbital',
      shape: 'dumbbell',
      n: 2, l: 1, ml: -1,
      description: 'Dumbbell shape along x-axis',
      color: '#FF6B6B'
    },
    '2py': {
      name: '2py Orbital',
      shape: 'dumbbell',
      n: 2, l: 1, ml: 0,
      description: 'Dumbbell shape along y-axis',
      color: '#FF8E53'
    },
    '2pz': {
      name: '2pz Orbital',
      shape: 'dumbbell',
      n: 2, l: 1, ml: 1,
      description: 'Dumbbell shape along z-axis',
      color: '#9B59B6'
    },
    '3dxy': {
      name: '3dxy Orbital',
      shape: 'cloverleaf',
      n: 3, l: 2, ml: -2,
      description: 'Four-lobed shape in xy plane',
      color: '#F39C12'
    }
  };
  
  const renderOrbitalShape = (orbital) => {
    const centerX = 150;
    const centerY = 150;
    
    switch (orbital.shape) {
      case 'spherical':
        return (
          <circle
            cx={centerX}
            cy={centerY}
            r={orbital.name === '1s' ? 40 : 60}
            fill={orbital.color}
            fillOpacity={showProbability ? 0.3 : 0.6}
            stroke={orbital.color}
            strokeWidth="2"
          />
        );
      case 'dumbbell':
        return (
          <g>
            <ellipse
              cx={centerX + (orbital.name.includes('x') ? 30 : 0)}
              cy={centerY + (orbital.name.includes('y') ? -30 : 0)}
              rx="25"
              ry="15"
              fill={orbital.color}
              fillOpacity={showProbability ? 0.3 : 0.6}
              stroke={orbital.color}
              strokeWidth="2"
            />
            <ellipse
              cx={centerX + (orbital.name.includes('x') ? -30 : 0)}
              cy={centerY + (orbital.name.includes('y') ? 30 : 0)}
              rx="25"
              ry="15"
              fill={orbital.color}
              fillOpacity={showProbability ? 0.3 : 0.6}
              stroke={orbital.color}
              strokeWidth="2"
            />
          </g>
        );
      case 'cloverleaf':
        return (
          <g>
            {[0, 90, 180, 270].map((angle, i) => (
              <ellipse
                key={i}
                cx={centerX + 35 * Math.cos((angle * Math.PI) / 180)}
                cy={centerY + 35 * Math.sin((angle * Math.PI) / 180)}
                rx="20"
                ry="12"
                fill={orbital.color}
                fillOpacity={showProbability ? 0.3 : 0.6}
                stroke={orbital.color}
                strokeWidth="2"
                transform={`rotate(${angle + 45} ${centerX + 35 * Math.cos((angle * Math.PI) / 180)} ${centerY + 35 * Math.sin((angle * Math.PI) / 180)})`}
              />
            ))}
          </g>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Interactive Orbital Shapes</h4>
      
      {/* Controls */}
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Orbital:</label>
        <select
          value={selectedOrbital}
          onChange={(e) => setSelectedOrbital(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 mb-4"
        >
          {Object.entries(orbitals).map(([key, orbital]) => (
            <option key={key} value={key}>
              {orbital.name} (n={orbital.n}, l={orbital.l}, ml={orbital.ml})
            </option>
          ))}
        </select>
        
        <label className="flex items-center gap-2 text-white">
          <input
            type="checkbox"
            checked={showProbability}
            onChange={(e) => setShowProbability(e.target.checked)}
            className="rounded"
          />
          Show Probability Density
        </label>
      </div>
      
      {/* Orbital Visualization */}
      <div className="bg-black rounded p-4 mb-4 flex justify-center">
        <svg width="300" height="300">
          {/* Nucleus */}
          <circle cx="150" cy="150" r="4" fill="#FFD700" />
          <text x="150" y="165" fill="#FFD700" fontSize="10" textAnchor="middle">
            Nucleus
          </text>
          
          {/* Orbital shape */}
          {renderOrbitalShape(orbitals[selectedOrbital])}
          
          {/* Axes */}
          <line x1="0" y1="150" x2="300" y2="150" stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
          <line x1="150" y1="0" x2="150" y2="300" stroke="#666" strokeWidth="1" strokeDasharray="2,2" />
          
          {/* Axis labels */}
          <text x="290" y="145" fill="#AAA" fontSize="12">x</text>
          <text x="155" y="15" fill="#AAA" fontSize="12">y</text>
        </svg>
      </div>
      
      {/* Orbital Info */}
      <div className="bg-gray-800 p-4 rounded text-white">
        <h5 className="font-semibold mb-2" style={{color: orbitals[selectedOrbital].color}}>
          {orbitals[selectedOrbital].name}
        </h5>
        <div className="grid grid-cols-2 gap-4 text-sm mb-2">
          <div>
            <p><strong>Principal (n):</strong> {orbitals[selectedOrbital].n}</p>
            <p><strong>Angular (l):</strong> {orbitals[selectedOrbital].l}</p>
          </div>
          <div>
            <p><strong>Magnetic (ml):</strong> {orbitals[selectedOrbital].ml}</p>
            <p><strong>Max electrons:</strong> 2</p>
          </div>
        </div>
        <p className="text-gray-300 text-sm">{orbitals[selectedOrbital].description}</p>
      </div>
    </div>
  );
};

// Quantum Numbers Table Component
const QuantumNumbersTable = () => {
  const [selectedShell, setSelectedShell] = useState(3);
  
  const generateSubshells = (n) => {
    const subshells = [];
    for (let l = 0; l < n; l++) {
      const subshellSymbols = ['s', 'p', 'd', 'f', 'g', 'h'];
      const symbol = subshellSymbols[l] || 'unknown';
      const numOrbitals = 2 * l + 1;
      const maxElectrons = 2 * numOrbitals;
      
      subshells.push({
        n,
        l,
        symbol,
        name: `${n}${symbol}`,
        numOrbitals,
        maxElectrons
      });
    }
    return subshells;
  };
  
  const subshells = generateSubshells(selectedShell);
  const totalElectrons = subshells.reduce((sum, sub) => sum + sub.maxElectrons, 0);
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Quantum Numbers and Electron Capacity</h4>
      
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Shell (n = ):</label>
        <input
          type="range"
          min="1"
          max="7"
          value={selectedShell}
          onChange={(e) => setSelectedShell(parseInt(e.target.value))}
          className="w-full"
        />
        <span className="text-white text-sm">n = {selectedShell}</span>
      </div>
      
      <div className="bg-black rounded p-4 overflow-x-auto">
        <table className="w-full text-white text-sm">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-2">Subshell</th>
              <th className="text-left p-2">n</th>
              <th className="text-left p-2">l</th>
              <th className="text-left p-2">ml values</th>
              <th className="text-left p-2">Orbitals</th>
              <th className="text-left p-2">Max e⁻</th>
            </tr>
          </thead>
          <tbody>
            {subshells.map((sub, index) => (
              <tr key={index} className="border-b border-gray-700">
                <td className="p-2 font-semibold text-blue-300">{sub.name}</td>
                <td className="p-2">{sub.n}</td>
                <td className="p-2">{sub.l}</td>
                <td className="p-2">
                  {Array.from({length: sub.numOrbitals}, (_, i) => i - sub.l).join(', ')}
                </td>
                <td className="p-2">{sub.numOrbitals}</td>
                <td className="p-2">{sub.maxElectrons}</td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="mt-4 p-3 bg-gray-800 rounded">
          <p className="text-white">
            <strong>Total electrons in shell {selectedShell}:</strong> {totalElectrons}
          </p>
          <p className="text-gray-300 text-sm mt-1">
            Formula: 2n² = 2({selectedShell})² = {totalElectrons}
          </p>
        </div>
      </div>
    </div>
  );
};

const ManualContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [isIntroOpen, setIsIntroOpen] = useState(false);
  const [isQuantumNumbersOpen, setIsQuantumNumbersOpen] = useState(false);
  const [isPauliOpen, setIsPauliOpen] = useState(false);
  const [isElectronStructureOpen, setIsElectronStructureOpen] = useState(false);
  const [isOrbitalPatternsOpen, setIsOrbitalPatternsOpen] = useState(false);
  const [isMolecularShapesOpen, setIsMolecularShapesOpen] = useState(false);

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Lesson 64: Quantum Mechanics (Optional Reading)
        </h1>
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
        
        <div className="mt-4 bg-orange-50 p-4 rounded-lg border border-orange-200">
          <p className="text-orange-800 text-sm">
            <strong>Note:</strong> This lesson is not a part of the Physics 30 curriculum. However, this lesson 
            completes the story of our current understanding of the electron structure of the atom. In addition, 
            this lesson may be of benefit to those who are moving on to more advanced studies in physics and chemistry.
          </p>
        </div>
      </div>

      {/* Introduction Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsIntroOpen(!isIntroOpen)}
          className="w-full text-left p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">I. The Quantum Model of the Atom</h3>
          <span className="text-blue-600">{isIntroOpen ? '▼' : '▶'}</span>
        </button>
        
        {isIntroOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                Ernest Rutherford's model of the atom was quite easy to visualize and understand conceptually, 
                but, as we have seen, it had severe flaws when it was scrutinized. Neils Bohr's quantum model 
                of the atom was quite successful at describing the basic properties of hydrogen and it could 
                also be easily visualized.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                It was successful at predicting the emission and absorption spectra for hydrogen, but it could 
                not account for the effect of magnetic fields on the emission of light along with other observed 
                phenomena. However, by adding several other quantum numbers to describe fine differences in 
                energy and the effects of magnetic fields, Bohr's model was modified to fit what had been 
                observed. But in the end a different approach to the problem was required.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold text-blue-800 mb-2">🧠 New Approach Required</h4>
                <p className="text-gray-700 text-sm">
                  Two people attempted to solve the problem, but from different starting points. In 1926, 
                  Erwin Schrödinger (1887-1961) sought to express the dual wave-particle nature of matter 
                  in mathematical equations.
                </p>
              </div>
              
              <OrbitalVisualizationComponent />
              
              <div className="mt-6 bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">📊 Wave Functions and Probability</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Schrödinger's wave mechanical model is almost entirely mathematical in form and function. 
                  While quantum mechanics is a highly successful mathematical model, it is not easily 
                  visualized as a physical model.
                </p>
                <p className="text-gray-700 text-sm mb-2">
                  Schrödinger's model describes the electrons belonging to an atom in terms of four quantum 
                  numbers from which the wave function for each electron can be calculated. Instead of 
                  electrons orbiting a nucleus in an assigned place at a given time, the wave mechanical 
                  model provides a probability of where an electron may be found.
                </p>
                <p className="text-gray-700 text-sm">
                  The probability distribution curve indicates that while the electron is found on average at 
                  the Bohr radius (r₁), its position may be further from or closer to the nucleus at any given time.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quantum Numbers Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsQuantumNumbersOpen(!isQuantumNumbersOpen)}
          className="w-full text-left p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">II. Quantum Numbers</h3>
          <span className="text-green-600">{isQuantumNumbersOpen ? '▼' : '▶'}</span>
        </button>
        
        {isQuantumNumbersOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                Originally, Bohr's model of the atom required just one quantum number to describe the energy 
                of the electron. The first quantum number (n) is called the principal quantum number or the 
                Bohr quantum number, and as we saw in Lesson 31, it can have any integer value: 1, 2, 3 ... ∞.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">1️⃣ Principal Quantum Number (n)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Describes the energy level or shell of the electron</li>
                    <li>• Values: 1, 2, 3, 4, 5, 6, 7...</li>
                    <li>• Associated with absorption and emission spectra</li>
                    <li>• Higher n = higher energy, farther from nucleus</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">2️⃣ Angular Momentum Quantum Number (l)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Describes the shape of the orbital</li>
                    <li>• Values: 0 to n-1</li>
                    <li>• l = 0 (s), l = 1 (p), l = 2 (d), l = 3 (f)</li>
                    <li>• Determines sub-energy levels or subshells</li>
                  </ul>
                </div>
              </div>
              
              <QuantumNumbersTable />
              
              <div className="mt-6 grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <h4 className="font-semibold text-orange-800 mb-2">3️⃣ Orbital Magnetic Quantum Number (ml)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Describes the orientation of the orbital in space</li>
                    <li>• Values: -l to +l (including 0)</li>
                    <li>• Related to Zeeman effect (magnetic field splitting)</li>
                    <li>• For p orbitals: ml = -1, 0, +1 (px, py, pz)</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-2">4️⃣ Spin Quantum Number (ms)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Describes the direction of electron spin</li>
                    <li>• Values: +½ or -½</li>
                    <li>• Related to magnetic properties of electrons</li>
                    <li>• Each orbital holds maximum 2 electrons (opposite spins)</li>
                  </ul>
                </div>
              </div>
              
              <div className="mt-6 bg-indigo-100 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">🧲 The Zeeman Effect</h4>
                <p className="text-gray-700 text-sm mb-2">
                  In 1896, Pieter Zeeman placed a sodium flame, with its characteristic double yellow spectral 
                  lines, within a powerful electromagnet. Whenever the current was turned on the two lines were 
                  distinctly widened. Thus, an applied magnetic field influences the way atoms emit light.
                </p>
                <p className="text-gray-700 text-sm">
                  The application of a magnetic field causes the atom to have three close together excited states. 
                  The result is three emission lines where ordinarily there is only one. An applied magnetic field 
                  will split the energy levels into 3, 5, etc. sublevels whose separation depends on the strength 
                  of the applied magnetic field.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Pauli Exclusion Principle Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsPauliOpen(!isPauliOpen)}
          className="w-full text-left p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">III. Pauli Exclusion Principle</h3>
          <span className="text-purple-600">{isPauliOpen ? '▼' : '▶'}</span>
        </button>
        
        {isPauliOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">👨‍🔬 Wolfgang Pauli (1900-1958)</h4>
                <p className="text-gray-700 text-sm">
                  A solution to the problems was formulated in 1926 by Wolfgang Pauli, which would eventually 
                  earn him the Nobel prize for physics in 1945. Pauli formulated what would later be called 
                  the Pauli Exclusion Principle.
                </p>
              </div>
              
              <div className="bg-red-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-red-800 mb-3">⚛️ The Pauli Exclusion Principle</h4>
                <p className="text-center text-lg font-bold mb-4 text-red-700">
                  "No two electrons in the same atom may be described by the same set of four quantum numbers."
                </p>
                <p className="text-gray-700 text-sm">
                  It is this principle which keeps electrons in order. If this principle did not hold, atoms, 
                  chemistry, life would not exist.
                </p>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">🔄 Electron Filling Rules</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>Each orbital can hold a maximum of 2 electrons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>The two electrons must have opposite spins (+½ and -½)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>No two electrons can have identical quantum numbers (n, l, ml, ms)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-600">•</span>
                    <span>This principle explains the structure of the periodic table</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">📋 Orbital Notation Example</h4>
                <p className="text-gray-700 text-sm mb-2">
                  An orbital is specified by three quantum numbers n, l, and ml, and can contain two electrons 
                  (one spin-up, one spin-down). A state is specified by all four quantum numbers and contains 
                  one electron, as per the Exclusion Principle.
                </p>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  1s↑↓  2s↑↓  2p↑↓ ↑↓ ↑↓  3s↑
                </div>
                <p className="text-gray-700 text-xs mt-1">Example: Sodium (11 electrons)</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Electron Structure Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsElectronStructureOpen(!isElectronStructureOpen)}
          className="w-full text-left p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">IV. Electron Structure</h3>
          <span className="text-orange-600">{isElectronStructureOpen ? '▼' : '▶'}</span>
        </button>
        
        {isElectronStructureOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                It's no simple matter to sort out electron structure. For that analysis, chemical behaviour 
                and atomic spectra were required as guides. As stated above, electrons are ordered in shells 
                and subshells about the various nuclei according to rules associated with their quantum numbers.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">📚 Electron Configuration Notation</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Each shell corresponds to a specific value of n, and they are traditionally given letter names:
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Shell:</strong> K L M N O P Q...</p>
                    <p><strong>n:</strong> 1 2 3 4 5 6 7...</p>
                  </div>
                  <div>
                    <p><strong>Subshell:</strong> s p d f g h...</p>
                    <p><strong>l:</strong> 0 1 2 3 4 5...</p>
                  </div>
                </div>
              </div>
              
              <div className="overflow-x-auto mb-6">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-2">n</th>
                      <th className="border border-gray-300 p-2">l</th>
                      <th className="border border-gray-300 p-2">ml</th>
                      <th className="border border-gray-300 p-2">Subshell</th>
                      <th className="border border-gray-300 p-2">Number of Orbitals</th>
                      <th className="border border-gray-300 p-2">Max Electrons</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">1s</td><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">2</td></tr>
                    <tr><td className="border border-gray-300 p-2">2</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">2s</td><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">2</td></tr>
                    <tr><td className="border border-gray-300 p-2">2</td><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">+1,0,-1</td><td className="border border-gray-300 p-2">2p</td><td className="border border-gray-300 p-2">3</td><td className="border border-gray-300 p-2">6</td></tr>
                    <tr><td className="border border-gray-300 p-2">3</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">3s</td><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">2</td></tr>
                    <tr><td className="border border-gray-300 p-2">3</td><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">+1,0,-1</td><td className="border border-gray-300 p-2">3p</td><td className="border border-gray-300 p-2">3</td><td className="border border-gray-300 p-2">6</td></tr>
                    <tr><td className="border border-gray-300 p-2">3</td><td className="border border-gray-300 p-2">2</td><td className="border border-gray-300 p-2">+2,+1,0,-1,-2</td><td className="border border-gray-300 p-2">3d</td><td className="border border-gray-300 p-2">5</td><td className="border border-gray-300 p-2">10</td></tr>
                    <tr><td className="border border-gray-300 p-2">4</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">0</td><td className="border border-gray-300 p-2">4s</td><td className="border border-gray-300 p-2">1</td><td className="border border-gray-300 p-2">2</td></tr>
                    <tr><td className="border border-gray-300 p-2">4</td><td className="border border-gray-300 p-2">3</td><td className="border border-gray-300 p-2">+3 to -3</td><td className="border border-gray-300 p-2">4f</td><td className="border border-gray-300 p-2">7</td><td className="border border-gray-300 p-2">14</td></tr>
                  </tbody>
                </table>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🧪 Example: Sodium (Na, 11 electrons)</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-green-300 text-xs">
                    <thead>
                      <tr className="bg-green-200">
                        <th className="border border-green-300 p-1">n</th>
                        <th className="border border-green-300 p-1">l</th>
                        <th className="border border-green-300 p-1">ml</th>
                        <th className="border border-green-300 p-1">ms</th>
                        <th className="border border-green-300 p-1">Electron Location</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">+½</td><td className="border border-green-300 p-1">1s¹</td></tr>
                      <tr><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">-½</td><td className="border border-green-300 p-1">1s²</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">+½</td><td className="border border-green-300 p-1">2s¹</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">-½</td><td className="border border-green-300 p-1">2s²</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">-1</td><td className="border border-green-300 p-1">+½</td><td className="border border-green-300 p-1">2px¹</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">+½</td><td className="border border-green-300 p-1">2py¹</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">+1</td><td className="border border-green-300 p-1">+½</td><td className="border border-green-300 p-1">2pz¹</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">-1</td><td className="border border-green-300 p-1">-½</td><td className="border border-green-300 p-1">2px²</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">-½</td><td className="border border-green-300 p-1">2py²</td></tr>
                      <tr><td className="border border-green-300 p-1">2</td><td className="border border-green-300 p-1">1</td><td className="border border-green-300 p-1">+1</td><td className="border border-green-300 p-1">-½</td><td className="border border-green-300 p-1">2pz²</td></tr>
                      <tr><td className="border border-green-300 p-1">3</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">0</td><td className="border border-green-300 p-1">+½</td><td className="border border-green-300 p-1">3s¹</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="mt-2 text-sm font-mono">
                  Overall electron structure: 1s² 2s² 2p⁶ 3s¹
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Orbital Patterns and Periodicity Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsOrbitalPatternsOpen(!isOrbitalPatternsOpen)}
          className="w-full text-left p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">V. Electron Orbital Patterns and Chemical Periodicity</h3>
          <span className="text-indigo-600">{isOrbitalPatternsOpen ? '▼' : '▶'}</span>
        </button>
        
        {isOrbitalPatternsOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                The relatively simple emission spectrum of hydrogen, and the excellent agreement of the 
                calculated energy levels with that spectrum, are due to the electrical simplicity of this 
                system with one electron and one proton. As soon as more than one electron is present in 
                an atom, the observed emission spectrum becomes more complex.
              </p>
              
              <div className="bg-yellow-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">🔬 Multi-electron Complexity</h4>
                <p className="text-gray-700 text-sm mb-2">
                  As we proceed through the periodic table, we find that the complexity of atomic emission 
                  spectra increases as the number of electrons increases. With many electrons being excited 
                  to emit energy, there results a very intricate and difficult-to-interpret overlapping of 
                  spectral emission lines.
                </p>
                <p className="text-gray-700 text-sm">
                  Theoretical considerations of many-electron atoms become greatly more complicated. The 
                  electrical potential energy term in Schrödinger's wave equation can only be approximated 
                  for multi-electron atoms.
                </p>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-gray-300 mb-6">
                <h4 className="font-semibold mb-4 text-center">Electron Capacity by Shell</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-center text-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Shell (n)</th>
                        <th className="border border-gray-300 p-2">Subshells</th>
                        <th className="border border-gray-300 p-2">Max Electrons</th>
                        <th className="border border-gray-300 p-2">Period Elements</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold">n = 1</td>
                        <td className="border border-gray-300 p-2">1s</td>
                        <td className="border border-gray-300 p-2">2</td>
                        <td className="border border-gray-300 p-2">2 (H, He)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold">n = 2</td>
                        <td className="border border-gray-300 p-2">2s, 2p</td>
                        <td className="border border-gray-300 p-2">8</td>
                        <td className="border border-gray-300 p-2">8 (Li → Ne)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold">n = 3</td>
                        <td className="border border-gray-300 p-2">3s, 3p, 3d</td>
                        <td className="border border-gray-300 p-2">18</td>
                        <td className="border border-gray-300 p-2">18 (Na → Ar)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-2 font-semibold">n = 4</td>
                        <td className="border border-gray-300 p-2">4s, 4p, 4d, 4f</td>
                        <td className="border border-gray-300 p-2">32</td>
                        <td className="border border-gray-300 p-2">32 (K → Kr)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🏆 Triumph of Quantum Mechanics</h4>
                <p className="text-gray-700 text-sm">
                  We find the same pattern of the number of electrons per shell matching the number of 
                  elements in each period of the periodic table. This is one of the triumphs of modern 
                  atomic theory - the theoretical justification for the periodic classification of the elements.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Molecular Shapes Section */}
      <div className="mb-6">
        <button
          onClick={() => setIsMolecularShapesOpen(!isMolecularShapesOpen)}
          className="w-full text-left p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors duration-200 flex items-center justify-between"
        >
          <h3 className="text-xl font-semibold">VI. Molecular Shapes - Covalent Bonding</h3>
          <span className="text-teal-600">{isMolecularShapesOpen ? '▼' : '▶'}</span>
        </button>
        
        {isMolecularShapesOpen && (
          <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                Schrödinger's wave mechanical model was also able to explain the bonding and shapes 
                characteristics of molecules. For example, water is composed of two hydrogen atoms with 
                1s orbitals and an oxygen atom with 1s, 2s, and 2p orbitals.
              </p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2">💧 Water Molecule (H₂O)</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• 2 hydrogen atoms (1s¹ orbitals)</li>
                    <li>• 1 oxygen atom (1s² 2s² 2p⁴ orbitals)</li>
                    <li>• Hybrid orbitals form through orbital mixing</li>
                    <li>• Results in characteristic V-shape</li>
                    <li>• Bond angle: ~104.5°</li>
                  </ul>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2">🔗 Hybridization Process</h4>
                  <ul className="space-y-1 text-sm text-gray-700">
                    <li>• Orbitals combine through hybridization</li>
                    <li>• Creates new hybrid orbitals</li>
                    <li>• Enables optimal bonding arrangements</li>
                    <li>• Explains molecular geometries</li>
                    <li>• Foundation of chemical bonding theory</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <h4 className="font-semibold mb-2">🧪 Other Examples:</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span><strong>Ammonia (NH₃):</strong> Pyramidal shape due to lone pairs of electrons</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span><strong>Beryllium fluoride (BeF₂):</strong> Linear molecular geometry</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-teal-600">•</span>
                    <span><strong>Methane (CH₄):</strong> Tetrahedral arrangement</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-indigo-100 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">🔮 Future Studies</h4>
                <p className="text-gray-700 text-sm">
                  You will learn far more about chemical bonding in future studies. Quantum mechanics 
                  provides the theoretical foundation for understanding how atoms combine to form molecules 
                  and the three-dimensional shapes they adopt.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Key Takeaways Section */}
      <div className="mt-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h3 className="text-xl font-bold text-blue-900 mb-4">📝 Key Takeaways</h3>
        <div className="space-y-3">
          {[
            "Schrödinger's wave mechanical model describes electrons as probability distributions rather than fixed orbits",
            "Four quantum numbers (n, l, ml, ms) completely specify each electron's state in an atom",
            "Principal quantum number (n) determines energy level and distance from nucleus (1, 2, 3...)",
            "Angular momentum quantum number (l) determines orbital shape: s(0), p(1), d(2), f(3)",
            "Magnetic quantum number (ml) determines orbital orientation in space (-l to +l)",
            "Spin quantum number (ms) describes electron spin direction (+½ or -½)",
            "Pauli Exclusion Principle: no two electrons can have identical quantum numbers",
            "Each orbital holds maximum 2 electrons with opposite spins",
            "Zeeman effect demonstrates magnetic field splitting of energy levels into sublevels",
            "Electron configuration notation (1s² 2s² 2p⁶...) describes arrangement of electrons in atoms",
            "Quantum mechanics explains periodic table structure: electron capacity per shell matches period lengths",
            "Wave mechanical model successfully explains molecular shapes through orbital hybridization",
            "Multi-electron atoms require approximations in Schrödinger's equation due to electron-electron interactions",
            "Quantum mechanics provides theoretical foundation for chemical bonding and molecular geometry"
          ].map((point, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualContent;