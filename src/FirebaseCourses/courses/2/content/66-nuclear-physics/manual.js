import React, { useState } from 'react';
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

// Interactive Nuclear Notation Component
const NuclearNotationComponent = () => {
  const [element, setElement] = useState('tungsten');
  
  const elements = {
    tungsten: { symbol: 'W', Z: 74, A: 186, name: 'Tungsten' },
    carbon12: { symbol: 'C', Z: 6, A: 12, name: 'Carbon-12' },
    carbon13: { symbol: 'C', Z: 6, A: 13, name: 'Carbon-13' },
    carbon14: { symbol: 'C', Z: 6, A: 14, name: 'Carbon-14' },
    oxygen16: { symbol: 'O', Z: 8, A: 16, name: 'Oxygen-16' },
    tin122: { symbol: 'Sn', Z: 50, A: 122, name: 'Tin-122' },
    uranium235: { symbol: 'U', Z: 92, A: 235, name: 'Uranium-235' },
    uranium238: { symbol: 'U', Z: 92, A: 238, name: 'Uranium-238' }
  };
  
  const selectedElement = elements[element];
  const neutrons = selectedElement.A - selectedElement.Z;
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Nuclear Notation Interactive</h4>
      
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Element:</label>
        <select
          value={element}
          onChange={(e) => setElement(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.entries(elements).map(([key, elem]) => (
            <option key={key} value={key}>
              {elem.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="bg-black rounded p-6 mb-4">
        <div className="text-center text-white">
          <div className="text-6xl font-mono mb-4">
            <span className="text-blue-300 text-3xl align-top">{selectedElement.A}</span>
            <span className="text-green-300 text-3xl align-bottom">{selectedElement.Z}</span>
            <span className="text-yellow-300">{selectedElement.symbol}</span>
          </div>
          
          <div className="text-lg mb-4">{selectedElement.name}</div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-900 p-3 rounded">
              <div className="text-blue-300 font-semibold">Mass Number (A)</div>
              <div className="text-2xl">{selectedElement.A}</div>
              <div className="text-xs">Total nucleons</div>
            </div>
            <div className="bg-green-900 p-3 rounded">
              <div className="text-green-300 font-semibold">Atomic Number (Z)</div>
              <div className="text-2xl">{selectedElement.Z}</div>
              <div className="text-xs">Protons</div>
            </div>
            <div className="bg-purple-900 p-3 rounded">
              <div className="text-purple-300 font-semibold">Neutrons (N)</div>
              <div className="text-2xl">{neutrons}</div>
              <div className="text-xs">A - Z</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-800 p-4 rounded text-white text-sm">
        <p><strong>Nuclear Notation Formula:</strong> <InlineMath math="^A_ZX" /></p>
        <p className="mt-2">
          <span className="text-yellow-300">X</span> = element symbol, 
          <span className="text-green-300"> Z</span> = atomic number (protons), 
          <span className="text-blue-300"> A</span> = mass number (nucleons)
        </p>
      </div>
    </div>
  );
};

// Interactive Mass Defect Calculator
const MassDefectCalculator = () => {
  const [selectedIsotope, setSelectedIsotope] = useState('helium4');
  
  const isotopes = {
    helium4: {
      name: 'Helium-4',
      symbol: '⁴₂He',
      protons: 2,
      neutrons: 2,
      measuredMass: 4.00260,
      bindingEnergy: 28.3
    },
    potassium40: {
      name: 'Potassium-40',
      symbol: '⁴⁰₁₉K',
      protons: 19,
      neutrons: 21,
      measuredMass: 39.9687,
      bindingEnergy: 328.3
    },
    carbon12: {
      name: 'Carbon-12',
      symbol: '¹²₆C',
      protons: 6,
      neutrons: 6,
      measuredMass: 12.0000,
      bindingEnergy: 92.2
    }
  };
  
  const protonMass = 1.007276;
  const neutronMass = 1.008665;
  
  const isotope = isotopes[selectedIsotope];
  const theoreticalMass = (isotope.protons * protonMass) + (isotope.neutrons * neutronMass);
  const massDefect = isotope.measuredMass - theoreticalMass;
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Mass Defect & Binding Energy Calculator</h4>
      
      <div className="mb-4">
        <label className="text-white font-medium mb-2 block">Select Isotope:</label>
        <select
          value={selectedIsotope}
          onChange={(e) => setSelectedIsotope(e.target.value)}
          className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600"
        >
          {Object.entries(isotopes).map(([key, iso]) => (
            <option key={key} value={key}>
              {iso.name} ({iso.symbol})
            </option>
          ))}
        </select>
      </div>
      
      <div className="bg-black rounded p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white text-sm">
          <div>
            <h5 className="font-semibold text-blue-300 mb-2">Nuclear Composition</h5>
            <p>Protons: {isotope.protons}</p>
            <p>Neutrons: {isotope.neutrons}</p>
            <p>Measured Mass: {isotope.measuredMass.toFixed(5)} u</p>
          </div>
          <div>
            <h5 className="font-semibold text-green-300 mb-2">Calculations</h5>
            <p>Theoretical Mass: {theoreticalMass.toFixed(5)} u</p>
            <p>Mass Defect: {massDefect.toFixed(5)} u</p>
            <p>Binding Energy: {isotope.bindingEnergy} MeV</p>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-red-900 rounded">
          <p className="text-red-300 text-sm">
            <strong>Einstein's Equation:</strong> E = mc² 
            <br />The "missing" mass has been converted to binding energy that holds the nucleus together.
          </p>
        </div>
      </div>
    </div>
  );
};

// Chain Reaction Visualization
const ChainReactionComponent = () => {
  const [step, setStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const steps = [
    { step: 0, description: "Initial neutron approaches U-235 nucleus" },
    { step: 1, description: "Neutron absorbed, nucleus becomes unstable" },
    { step: 2, description: "Nucleus splits, releasing 2-3 neutrons + fission fragments" },
    { step: 3, description: "New neutrons strike other U-235 nuclei" },
    { step: 4, description: "Chain reaction continues exponentially" }
  ];
  
  const startAnimation = () => {
    setIsAnimating(true);
    setStep(0);
    const interval = setInterval(() => {
      setStep(prev => {
        if (prev >= 4) {
          clearInterval(interval);
          setIsAnimating(false);
          return 4;
        }
        return prev + 1;
      });
    }, 1500);
  };
  
  return (
    <div className="bg-gray-900 p-6 rounded-lg border border-gray-300">
      <h4 className="text-white font-semibold mb-4 text-center">Nuclear Fission Chain Reaction</h4>
      
      <div className="bg-black rounded p-4 mb-4 h-64 flex items-center justify-center relative overflow-hidden">
        {/* Step 0: Initial neutron */}
        {step >= 0 && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="text-blue-400 text-xs mt-1">neutron</div>
          </div>
        )}
        
        {/* Step 1: U-235 nucleus */}
        {step >= 0 && (
          <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className={`w-8 h-8 bg-green-500 rounded-full ${step >= 1 ? 'animate-bounce' : ''}`}>
              <div className="text-white text-xs text-center leading-8">U-235</div>
            </div>
          </div>
        )}
        
        {/* Step 2: Fission products */}
        {step >= 2 && (
          <>
            <div className="absolute left-1/3 top-1/3 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-6 h-6 bg-orange-500 rounded-full">
                <div className="text-white text-xs text-center leading-6">Ba</div>
              </div>
            </div>
            <div className="absolute right-1/3 bottom-1/3 transform translate-x-1/2 translate-y-1/2">
              <div className="w-6 h-6 bg-purple-500 rounded-full">
                <div className="text-white text-xs text-center leading-6">Kr</div>
              </div>
            </div>
            {/* New neutrons */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`absolute w-3 h-3 bg-blue-400 rounded-full ${step >= 3 ? 'animate-ping' : ''}`}
                   style={{
                     left: `${45 + i * 15}%`,
                     top: `${40 + i * 10}%`
                   }}>
              </div>
            ))}
          </>
        )}
        
        {/* Step 4: Multiple fissions */}
        {step >= 4 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-yellow-400 text-lg font-bold animate-pulse">
              CHAIN REACTION
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-4">
        <button
          onClick={startAnimation}
          disabled={isAnimating}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isAnimating ? 'Animating...' : 'Start Chain Reaction'}
        </button>
      </div>
      
      <div className="bg-gray-800 p-4 rounded">
        <p className="text-white text-sm">
          <strong>Current Step:</strong> {steps[step]?.description}
        </p>
        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
          <div className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
               style={{width: `${(step / 4) * 100}%`}}></div>
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
          Nuclear Physics
        </h1>
        <p className="text-lg text-gray-600">
          From atomic structure to stellar nucleosynthesis
        </p>
        
        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm">
            Up to this point in our discussion of the nature of the atom we have been studying how 
            the electrons behave around the nucleus. The study of the electrons around the nucleus is 
            referred to as <strong>atomic physics</strong>. Now we turn our attention to the nucleus 
            (<strong>nuclear physics</strong>) and the fundamental particles that atoms are composed of 
            (<strong>particle physics</strong>).
          </p>
        </div>
      </div>

      {AIAccordion ? (
        <div className="my-8">
          <AIAccordion className="space-y-0">

            <AIAccordion.Item value="notation" title="Nuclear Notation" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                In order to discuss nuclear physics we must first understand the "short-hand" language 
                that nuclear physicists use – i.e. nuclear physlish. Symbols for atoms and particles may 
                be written as <InlineMath math="^A_ZX" />
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Nuclear Notation Components</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>X</strong> is the atom's or particle's symbol</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>Z</strong> is the atomic number (# of protons) or, more generally, its charge</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">•</span>
                    <span><strong>A</strong> is the atomic mass number (# of protons + # of neutrons = # of nucleons)</span>
                  </li>
                </ul>
              </div>
              
              <NuclearNotationComponent />
              
              <div className="mt-6 bg-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Example</h4>
                <p className="text-gray-700 text-sm">
                  The element tungsten-186, for example, is written as <InlineMath math="^{186}_{74}W" /> which 
                  means that it has 74 protons and 186 – 74 = 112 neutrons.
                </p>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="isotopes" title="Isotopes" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-4">
                Recall from Lesson 27 that in 1911 Rutherford discovered the nucleus and was also able to 
                determine the approximate radius of the nucleus of an element. Rutherford determined that 
                the nucleus contained protons because of its repulsive effect on alpha particles (α²⁺) in 
                the gold foil scattering experiments.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Two years later, Henry Moseley, an assistant of Rutherford, determined that the charge on 
                the nucleus was always a multiple of the charge on an electron but was positive in nature. 
                Recall from Lesson 25 that Moseley's work led to the modern periodic table where elements 
                are listed according to their atomic number.
              </p>
              
              <div className="bg-yellow-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-yellow-800 mb-2">Frederick Soddy's Discovery</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Frederick Soddy discovered isotopes while studying the nature of radioactivity. 
                  <strong>Isotopes of an element have the same atomic number but a different atomic mass.</strong>
                </p>
                <p className="text-gray-700 text-sm">
                  For example, three isotopes of carbon are:
                </p>
                <div className="flex gap-4 mt-2 font-mono text-center">
                  <div className="bg-white p-2 rounded border">
                    <div><InlineMath math="^{12}_6C" /></div>
                    <div className="text-xs">carbon-12</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div><InlineMath math="^{13}_6C" /></div>
                    <div className="text-xs">carbon-13</div>
                  </div>
                  <div className="bg-white p-2 rounded border">
                    <div><InlineMath math="^{14}_6C" /></div>
                    <div className="text-xs">carbon-14</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-indigo-100 p-4 rounded-lg">
                <h4 className="font-semibold text-indigo-800 mb-2">James Chadwick's Discovery (1932)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  In order to explain the existence of isotopes, it was suggested by Rutherford that the 
                  nucleus must contain some neutral particle as well as the protons. It was not until 1932 
                  that James Chadwick confirmed the existence of the <strong>neutron</strong> for which he 
                  was awarded the 1935 Nobel prize for physics.
                </p>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• The general term <strong>nucleon</strong> refers to both protons and neutrons in the nucleus</li>
                  <li>• The <strong>atomic mass</strong> is the total number of nucleons</li>
                </ul>
              </div>
              
              {/* Example 1 */}
              <div className="mt-6 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Example 1</h4>
                <p className="mb-4 text-gray-700">
                  Write the following isotopes in symbolic notation and state the number of protons, 
                  neutrons and electrons for each atom.
                </p>
                <p className="mb-4 text-sm text-gray-600">
                  <em>Note: An atom has the same number of electrons as protons – i.e. it is electrically neutral.</em>
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Oxygen-16</h5>
                    <p className="mb-2"><InlineMath math="^{16}_8O" /></p>
                    <ul className="text-sm space-y-1">
                      <li>• 8 protons</li>
                      <li>• 16 - 8 = 8 neutrons</li>
                      <li>• 8 electrons</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h5 className="font-semibold mb-2">Tin-122</h5>
                    <p className="mb-2"><InlineMath math="^{122}_{50}Sn" /></p>
                    <ul className="text-sm space-y-1">
                      <li>• 50 protons</li>
                      <li>• 122 - 50 = 72 neutrons</li>
                      <li>• 50 electrons</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="equations" title="Nuclear Equations - Conservation of Charge & Nucleons" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                Nuclear interactions are represented by nuclear equations. Nuclear interactions can involve 
                the disintegration of a nucleus, the transmutation of a nucleus and a host of other interactions 
                which we will be learning about. In nuclear equations, the original isotope(s) is/are often 
                referred to as the <strong>parent isotope(s)</strong>, while the final isotope(s) is/are called 
                the <strong>daughter isotope(s)</strong>.
              </p>
              
              <div className="bg-red-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-red-800 mb-2">Conservation Laws</h4>
                <p className="text-gray-700 text-sm mb-2">
                  When writing nuclear equations it is important to conserve electric charge and to conserve 
                  the number of nucleons. In other words:
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">⇒</span>
                    <span>The sum of the atomic numbers on the parent side equals the sum of the atomic numbers on the daughter side.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600">⇒</span>
                    <span>The sum of the atomic masses on the parent side equals the sum of the atomic masses on the daughter side.</span>
                  </li>
                </ul>
              </div>
              
              {/* Example 2 */}
              <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Example 2</h4>
                <p className="mb-4 text-gray-700">
                  When a boron-10 nucleus captures a neutron (<InlineMath math="^1_0n" />), a new element and 
                  an alpha particle (<InlineMath math="^4_2He" />) are produced. Write a complete nuclear equation 
                  for this interaction.
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">Solution:</h5>
                  <p className="mb-2">The described reaction is written as:</p>
                  <BlockMath math="^1_0n + ^{10}_5B \rightarrow ^A_Z? + ^4_2He" />
                  
                  <p className="mb-2 mt-4">Using conservation of charge and conservation of nucleons:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Atomic mass:</strong></p>
                      <p>1 + 10 = A + 4</p>
                      <p>A = 7</p>
                    </div>
                    <div>
                      <p><strong>Atomic number:</strong></p>
                      <p>0 + 5 = Z + 2</p>
                      <p>Z = 3</p>
                    </div>
                  </div>
                  
                  <p className="mt-4">From the periodic table, element 3 is Li (lithium)</p>
                  
                  <div className="mt-4 p-3 bg-blue-100 rounded">
                    <p><strong>Complete equation:</strong></p>
                    <BlockMath math="^1_0n + ^{10}_5B \rightarrow ^7_3Li + ^4_2He" />
                  </div>
                </div>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="massUnits" title="Atomic Mass Units" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                In previous lessons, when precision was less of an issue, we used 1.67 × 10⁻²⁷ kg for the mass 
                of a proton and a neutron when we converted from the number of nucleons to the mass in kilograms. 
                In the context of nuclear masses and energies we need to be much more precise.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Unified Atomic Mass Unit (u)</h4>
                <p className="text-gray-700 text-sm mb-2">
                  In nuclear physics we often use the <strong>unified atomic mass unit (u)</strong> rather than 
                  the actual kilogram value for different nucleons and subatomic particles. The unified atomic 
                  mass unit is defined as being exactly <sup>1</sup>/<sub>12</sub> the mass of a carbon-12 nucleus.
                </p>
                <div className="bg-white p-3 rounded border">
                  <BlockMath math="1 \text{ u} = 1.660539 \times 10^{-27} \text{ kg}" />
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 p-3">Particle</th>
                      <th className="border border-gray-300 p-3">Charge (C)</th>
                      <th className="border border-gray-300 p-3">Mass (kg)</th>
                      <th className="border border-gray-300 p-3">Mass (u)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Electron</td>
                      <td className="border border-gray-300 p-3">-1.602177 × 10⁻¹⁹</td>
                      <td className="border border-gray-300 p-3">9.109383 × 10⁻³¹</td>
                      <td className="border border-gray-300 p-3">5.485799 × 10⁻⁴</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Proton</td>
                      <td className="border border-gray-300 p-3">+1.602177 × 10⁻¹⁹</td>
                      <td className="border border-gray-300 p-3">1.672622 × 10⁻²⁷</td>
                      <td className="border border-gray-300 p-3">1.007276</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 p-3 font-semibold">Neutron</td>
                      <td className="border border-gray-300 p-3">0</td>
                      <td className="border border-gray-300 p-3">1.674927 × 10⁻²⁷</td>
                      <td className="border border-gray-300 p-3">1.008665</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 bg-yellow-100 p-4 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>Note:</strong> The atomic mass unit is merely an alternate mass unit to the kilogram, 
                  designed for convenience when dealing with atomic-scale masses.
                </p>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="massDefect" title="Mass Defect and Mass-Energy Equivalence" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                After scientists discovered that the nucleus contained protons and neutrons, they were able 
                to calculate the theoretical mass for a particular isotope by adding together the masses of 
                protons and neutrons:
              </p>
              
              <div className="bg-white p-4 rounded border mb-6">
                <BlockMath math="m_{\text{theoretical}} = m_{\text{protons}} + m_{\text{neutrons}}" />
              </div>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Using a mass spectrometer (see Lesson 20), scientists were able to find the measured mass. 
                They were expecting the values to be identical, but, except for hydrogen, the measured value 
                is always less than the theoretical value.
              </p>
              
              <MassDefectCalculator />
              
              <div className="mt-6 bg-red-100 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Helium-4 Example</h4>
                <p className="text-gray-700 text-sm mb-2">
                  The theoretical mass of helium-4 is calculated by adding the masses of 2 protons and 2 neutrons:
                </p>
                <BlockMath math="m_{\text{theoretical}} = 2 \times 1.007276 \text{ u} + 2 \times 1.008665 \text{ u} = 4.031882 \text{ u}" />
                <p className="text-gray-700 text-sm mt-2">
                  Using a mass spectrometer, the measured mass of a helium-4 nucleus is 4.00260 u.
                </p>
              </div>
              
              <div className="mt-6 bg-purple-100 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">Einstein's Mass-Energy Equivalence</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Since the measured mass is less than the theoretical mass, physicists call the difference 
                  in mass the <strong>mass defect (Δm)</strong>. In general:
                </p>
                <BlockMath math="\Delta m = m_{\text{measured}} - m_{\text{theoretical}}" />
                <p className="text-gray-700 text-sm mb-2">
                  A clue to the problem was provided by Albert Einstein who demonstrated, in a paper written 
                  in 1905, that mass and energy are equivalent:
                </p>
                <div className="bg-white p-3 rounded border">
                  <BlockMath math="E = mc^2" />
                  <p className="text-xs text-gray-600 mt-1">Note: to use this equation the mass must be in kilograms</p>
                </div>
              </div>
              
              {/* Example 3 */}
              <div className="mt-6 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Example 3</h4>
                <p className="mb-4 text-gray-700">
                  A nuclear reaction produces 9.0 × 10¹¹ J of heat energy because of a conversion of mass 
                  into energy. What mass was converted?
                </p>
                
                <div className="space-y-3">
                  <p><strong>Solution:</strong></p>
                  <BlockMath math="E = mc^2" />
                  <BlockMath math="m = \frac{E}{c^2}" />
                  <BlockMath math="m = \frac{9.0 \times 10^{11} \text{ J}}{(3.00 \times 10^8 \text{ m/s})^2}" />
                  <div className="bg-blue-100 p-3 rounded">
                    <BlockMath math="m = 1.0 \times 10^{-5} \text{ kg}" />
                  </div>
                </div>
              </div>
              
              {/* Example 4 */}
              <div className="mt-6 p-6 bg-white rounded-lg border border-gray-300 shadow-sm">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Example 4</h4>
                <p className="mb-4 text-gray-700">
                  The mass of one nucleus of potassium-40 was measured to be 39.9687 u. What is the mass 
                  defect and the binding energy for potassium-40?
                </p>
                
                <div className="bg-gray-100 p-4 rounded-lg mb-4">
                  <h5 className="font-semibold mb-2">Given:</h5>
                  <p>Measured mass = 39.9687 u</p>
                  <p>Potassium-40 has 19 p⁺ and 21 n</p>
                </div>
                
                <div className="space-y-3">
                  <p><strong>Solution:</strong></p>
                  <p>First calculate the theoretical mass:</p>
                  <BlockMath math="m_{\text{theoretical}} = 19 \times 1.007276 + 21 \times 1.008665 = 40.320209 \text{ u}" />
                  
                  <p>Calculate the mass defect:</p>
                  <BlockMath math="\Delta m = m_{\text{measured}} - m_{\text{theoretical}}" />
                  <BlockMath math="\Delta m = 39.9687 \text{ u} - 40.320209 \text{ u} = -0.35151 \text{ u}" />
                  <BlockMath math="\Delta m = -0.35151 \text{ u} \times 1.660540 \times 10^{-27} \text{ kg/u} = -5.83695 \times 10^{-28} \text{ kg}" />
                  
                  <p>Calculate the binding energy:</p>
                  <BlockMath math="E = \Delta mc^2" />
                  <BlockMath math="E = -5.83695 \times 10^{-28} \text{ kg} \times (3.00 \times 10^8 \text{ m/s})^2" />
                  <BlockMath math="E = -5.253 \times 10^{-11} \text{ J}" />
                  <BlockMath math="E = -5.253 \times 10^{-11} \text{ J} \times \frac{1 \text{ eV}}{1.60 \times 10^{-19} \text{ J}}" />
                  <div className="bg-blue-100 p-3 rounded">
                    <BlockMath math="E = -328.3 \text{ MeV}" />
                  </div>
                </div>
              </div>
              
              <div className="mt-6 bg-green-100 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Binding Energy Interpretation</h4>
                <p className="text-gray-700 text-sm">
                  Based on the idea of mass-energy equivalence, physicists interpreted the mass defect as the 
                  <strong>binding energy</strong> that holds the protons and neutrons together in the nucleus. 
                  Due to the large repulsive electrostatic forces between protons, a large amount of energy and 
                  large forces are required to hold the nucleus together. The binding energy, resulting from 
                  what was later called the <strong>strong nuclear force</strong> (see Lesson 37), is equivalent 
                  to the mass defect using Einstein's equation.
                </p>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="conservation" title="Conservation of Mass-Energy" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                After Einstein demonstrated that energy and mass are inter-convertible it became apparent 
                that the laws of conservation of mass and conservation of energy were actually aspects of 
                one law – the <strong>conservation of mass-energy</strong>. This idea allows us to imagine 
                the creation of particles from kinetic or radiant energy and to imagine the annihilation 
                of particles into radiant energy.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Electron Rest Mass Energy</h4>
                <p className="text-gray-700 text-sm mb-2">
                  In this conception we can think of an electron, for example, as having a mass of 
                  9.109383 × 10⁻³¹ kg or as an equivalent energy:
                </p>
                <BlockMath math="E_e = m_e c^2" />
                <BlockMath math="E_e = 9.109383 \times 10^{-31} \text{ kg} \times (2.997925 \times 10^8 \text{ m/s})^2" />
                <BlockMath math="E_e = 8.187107 \times 10^{-14} \text{ J} \times \frac{1 \text{ eV}}{1.602177 \times 10^{-19} \text{ J}}" />
                <div className="bg-white p-3 rounded border">
                  <BlockMath math="E_e = 0.510999 \text{ MeV}" />
                </div>
              </div>
              
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Particle Physics Convention</h4>
                <p className="text-gray-700 text-sm mb-2">
                  On your Physics Data Sheet, the masses for some first generation fermions (see Lesson 37) 
                  are given as an energy in eV or MeV over c². For example, an electron has a mass of:
                </p>
                <BlockMath math="m_e = 0.510999 \frac{\text{MeV}}{c^2}" />
                <p className="text-gray-700 text-sm">
                  This is a useful way of stating the mass of a particle because it is the amount of kinetic 
                  energy that must be generated in a particle accelerator in order to create that particular particle.
                </p>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="reactions" title="Nuclear Reactions" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                The presence of such huge quantities of energy within nuclei explains why nuclear reactions 
                are so energetic. While the electron of a hydrogen atom can be ionized with a mere 13.6 eV, 
                it takes about 8 MeV of energy to remove a nucleon from a nucleus. For this reason, gram for 
                gram, a nuclear reaction can liberate millions of times more energy than a chemical reaction.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Four Basic Types of Nuclear Reactions</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">1.</span>
                    <span><strong>Radioactivity</strong> (discussed in Lesson 36)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">2.</span>
                    <span><strong>Induced nuclear transmutations</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">3.</span>
                    <span><strong>Fission</strong></span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600">4.</span>
                    <span><strong>Fusion</strong></span>
                  </li>
                </ul>
              </div>
              
              {/* Induced Nuclear Reactions */}
              <div className="bg-green-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-green-800 mb-2">Induced Nuclear Reactions</h4>
                <p className="text-gray-700 text-sm mb-2">
                  It is possible to bring about or "induce" the disintegration of a stable nucleus by 
                  striking it with another nucleus, an atomic or subatomic particle, or a γ-ray photon. 
                  A nuclear reaction is said to occur whenever the incident nucleus, particle, or photon 
                  causes a change to occur in a target nucleus.
                </p>
                <p className="text-gray-700 text-sm mb-2">
                  In 1919, for example, Ernest Rutherford observed that when an α particle (<InlineMath math="^4_2He" />) 
                  strikes a nitrogen nucleus (<InlineMath math="^{14}_7N" />), an oxygen nucleus (<InlineMath math="^{17}_8O" />) 
                  and a proton (<InlineMath math="^1_1H" />) are produced:
                </p>
                <div className="bg-white p-3 rounded border">
                  <BlockMath math="^4_2He + ^{14}_7N \rightarrow ^{17}_8O + ^1_1H" />
                </div>
              </div>
              
              {/* Example 5 */}
              <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-sm mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Example 5</h4>
                <p className="mb-4 text-gray-700">
                  An alpha particle strikes an aluminum-27 nucleus. As a result, a new nucleus and a 
                  neutron are produced. Identify the nucleus produced.
                </p>
                
                <div className="space-y-3">
                  <p><strong>Solution:</strong></p>
                  <p>The described reaction is written as:</p>
                  <BlockMath math="^4_2He + ^{27}_{13}Al \rightarrow ^A_Z? + ^1_0n" />
                  
                  <p>Using conservation of charge and conservation of nucleons:</p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Atomic mass:</strong></p>
                      <p>4 + 27 = A + 1</p>
                      <p>A = 30</p>
                    </div>
                    <div>
                      <p><strong>Atomic number:</strong></p>
                      <p>2 + 13 = Z + 0</p>
                      <p>Z = 15</p>
                    </div>
                  </div>
                  
                  <p>Element 15 is P (phosphorous)</p>
                  
                  <div className="bg-blue-100 p-3 rounded">
                    <p><strong>Complete equation:</strong></p>
                    <BlockMath math="^4_2He + ^{27}_{13}Al \rightarrow ^{30}_{15}P + ^1_0n" />
                  </div>
                </div>
              </div>
              
              {/* Transuranium Elements */}
              <div className="bg-purple-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-purple-800 mb-2">Transuranium Elements</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Induced nuclear transmutations can be used to produce isotopes that are not found naturally. 
                  In 1934, Enrico Fermi suggested a method for producing elements with a higher atomic number 
                  than uranium (Z = 92). These elements – neptunium (Z = 93), plutonium (Z = 94), americium (Z = 95), 
                  and so on – are known as <strong>transuranium elements</strong>.
                </p>
                <p className="text-gray-700 text-sm mb-3">
                  For example, a reaction that produces plutonium from uranium involves a neutron capture 
                  followed by several radioactive disintegrations:
                </p>
                <div className="space-y-2 text-sm">
                  <div className="bg-white p-2 rounded">
                    <BlockMath math="^{238}_{92}U + ^1_0n \rightarrow ^{239}_{92}U + \gamma \quad (1)" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <BlockMath math="^{239}_{92}U \rightarrow ^{239}_{93}Np + ^0_{-1}e + \gamma \quad (2)" />
                  </div>
                  <div className="bg-white p-2 rounded">
                    <BlockMath math="^{239}_{93}Np \rightarrow ^{239}_{94}Pu + ^0_{-1}e + \gamma \quad (3)" />
                  </div>
                </div>
              </div>
              
              {/* Fission Reactions */}
              <div className="bg-orange-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-orange-800 mb-2">Fission Reactions</h4>
                <p className="text-gray-700 text-sm mb-2">
                  In nuclear fission we take heavy elements and break them apart to produce smaller nuclei. 
                  The process involves bombarding particular nuclei with neutrons. A neutron captured by a 
                  fissionable nucleus results in an unstable nucleus which splits.
                </p>
                <div className="bg-white p-3 rounded border mb-3">
                  <BlockMath math="^{235}_{92}U + ^1_0n \rightarrow ^{141}_{56}Ba + ^{92}_{36}Kr + 3^1_0n + \text{energy}" />
                </div>
                <ChainReactionComponent />
              </div>
              
              {/* Example 6 */}
              <div className="p-6 bg-white rounded-lg border border-gray-300 shadow-sm mb-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Example 6</h4>
                <p className="mb-4 text-gray-700">
                  For the given reaction, calculate the energy released from the fission of one atom of 
                  uranium-235. The measured masses are: uranium-235 = 234.9934 u, barium-141 = 140.88340 u, 
                  and krypton-92 = 91.90601 u.
                </p>
                
                <div className="bg-gray-100 p-3 rounded mb-4">
                  <BlockMath math="^{235}_{92}U + ^1_0n \rightarrow ^{141}_{56}Ba + ^{92}_{36}Kr + 3^1_0n + \text{energy}" />
                </div>
                
                <div className="space-y-3">
                  <p><strong>Solution:</strong></p>
                  <p>The energy released is due to the difference in mass (Δm) between products and reactants:</p>
                  <BlockMath math="\Delta m = \Sigma m_{\text{products}} - \Sigma m_{\text{reactants}}" />
                  <BlockMath math="\Delta m = (140.88340 + 91.90601 + 3(1.008665)) - (1.008665 + 234.9934)" />
                  <BlockMath math="\Delta m = -0.18666 \text{ u}" />
                  <BlockMath math="\Delta m = -0.18666 \text{ u} \times 1.660540 \times 10^{-27} \text{ kg/u} = -3.099560 \times 10^{-28} \text{ kg}" />
                  
                  <p>Calculate the energy released:</p>
                  <BlockMath math="E = \Delta mc^2" />
                  <BlockMath math="E = -3.099560 \times 10^{-28} \text{ kg} \times (3.00 \times 10^8 \text{ m/s})^2" />
                  <BlockMath math="E = -2.790 \times 10^{-11} \text{ J}" />
                  <div className="bg-blue-100 p-3 rounded">
                    <BlockMath math="E = -174.4 \text{ MeV}" />
                  </div>
                </div>
              </div>
              
              {/* Fusion Reactions */}
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h4 className="font-semibold text-yellow-800 mb-2">Fusion Reactions</h4>
                <p className="text-gray-700 text-sm mb-2">
                  In nuclear fusion we take light elements and force them together to form larger sized atoms. 
                  Examples include:
                </p>
                <div className="space-y-2 mb-3">
                  <div className="bg-white p-2 rounded text-sm">
                    <BlockMath math="^2_1H + ^2_1H \rightarrow ^3_2He + ^1_0n + \text{heat}" />
                    <p className="text-center text-xs">Deuterium fusion</p>
                  </div>
                  <div className="bg-white p-2 rounded text-sm">
                    <BlockMath math="^3_1H + ^2_1H \rightarrow ^4_2He + ^1_0n + \text{heat}" />
                    <p className="text-center text-xs">Tritium-deuterium fusion</p>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">
                  The problem to overcome in fusion reactions is to bring the parent nuclei together so that 
                  the electrostatic repulsion is overcome and the strong nuclear force can take over. Nuclear 
                  fusion reactions require extremely high pressures and temperatures to get them started. 
                  Such conditions are found within the core of stars like our Sun.
                </p>
              </div>
            </div>
            </div>
            </AIAccordion.Item>

            <AIAccordion.Item value="elementFormation" title="Element Formation" onAskAI={onAIAccordionContent}>
              <div className="mt-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed mb-6">
                75% of the matter in the universe is in the form of hydrogen. In fact, it is from hydrogen 
                that all elements are eventually synthesized. This process occurs through a series of fusion 
                reactions within stars. Our Sun, for example, is an average star with an expected lifespan 
                of between 10 to 11 billion years. It is currently half way through its life cycle.
              </p>
              
              <div className="bg-blue-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-blue-800 mb-2">Stellar Fusion Reactions</h4>
                <p className="text-gray-700 text-sm mb-3">
                  The main reaction that powers the Sun's energy is a series of reactions leading to the 
                  formation of helium from hydrogen:
                </p>
                <div className="space-y-2">
                  <div className="bg-white p-2 rounded text-sm">
                    <BlockMath math="^1_1H + ^1_1H \rightarrow ^2_1H + ^0_1e + \nu" />
                  </div>
                  <div className="bg-white p-2 rounded text-sm">
                    <BlockMath math="^3_2He + ^3_2He \rightarrow ^4_2He + 2^1_1H + \gamma" />
                  </div>
                </div>
              </div>
              
              <div className="bg-green-100 p-4 rounded-lg mb-6">
                <h4 className="font-semibold text-green-800 mb-2">Stellar Evolution & Element Synthesis</h4>
                <p className="text-gray-700 text-sm mb-2">
                  These reactions will continue until the hydrogen fuel has been mostly exhausted. As the 
                  reaction rate decreases the gravitational pressure will partially collapse the Sun which 
                  will lead to increased pressure in the core. When the pressure and temperature reach a 
                  critical point helium nuclei will begin to fuse to produce larger elements.
                </p>
                <p className="text-gray-700 text-sm">
                  Due to the more energetic helium fusion reactions, the increased fusion pressure will 
                  cause the Sun to expand in size into a red giant, swallowing the Earth in the process. 
                  The upper limit of this process is <strong>iron (Z = 26)</strong>.
                </p>
              </div>
              
              <div className="bg-red-100 p-4 rounded-lg">
                <h4 className="font-semibold text-red-800 mb-2">Supernovae & Heavy Element Formation</h4>
                <p className="text-gray-700 text-sm mb-2">
                  Elements beyond iron are formed in truly spectacular explosions called <strong>supernovae</strong>. 
                  It is interesting to note that since the Earth has all elements within its crust, from hydrogen 
                  to uranium, the Earth and the solar system must have formed from the ashes of a star that went 
                  supernova many billions of years ago in this region of space.
                </p>
                <p className="text-gray-700 text-sm">
                  Smaller nuclei tend to undergo fusion reactions until the stability region is reached. 
                  In like manner, heavier elements will tend to undergo fission reactions where they may 
                  become the smaller, more stable isotopes like iron and bromine.
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-blue-800 mb-3">Nuclear Structure & Notation</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Nuclear notation ᴬ𝒁X specifies atomic mass number (A), atomic number (Z), and element symbol (X)</li>
              <li>Isotopes have the same atomic number but different mass numbers (same protons, different neutrons)</li>
              <li>Nuclear equations must conserve both charge (atomic numbers) and nucleons (mass numbers)</li>
              <li>The unified atomic mass unit (u) is defined as 1/12 the mass of a carbon-12 nucleus</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-green-800 mb-3">Mass-Energy & Binding Energy</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Mass defect (Δm) is the difference between theoretical and measured nuclear masses</li>
              <li>Einstein's E = mc² explains that mass defect converts to binding energy holding nuclei together</li>
              <li>Conservation of mass-energy unifies the laws of conservation of mass and conservation of energy</li>
              <li>Nuclear reactions release millions of times more energy per gram than chemical reactions</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-purple-800 mb-3">Nuclear Reactions</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>Four types of nuclear reactions: radioactivity, induced transmutations, fission, and fusion</li>
              <li>Transuranium elements (Z > 92) are artificially created through induced nuclear reactions</li>
              <li>Nuclear fission splits heavy nuclei, releasing energy through chain reactions</li>
              <li>Nuclear fusion combines light nuclei, requiring extreme temperatures and pressures</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-orange-800 mb-3">Stellar Nucleosynthesis</h4>
            <ul className="list-disc list-inside space-y-2 text-sm">
              <li>75% of universe matter is hydrogen; all heavier elements form through stellar fusion processes</li>
              <li>Elements up to iron form in stellar cores; elements heavier than iron form in supernova explosions</li>
              <li>Earth's elements indicate our solar system formed from supernova remnants billions of years ago</li>
              <li>Stars are nuclear fusion reactors that synthesize heavy elements from hydrogen and helium</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualContent;