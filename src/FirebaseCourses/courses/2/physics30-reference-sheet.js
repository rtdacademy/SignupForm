/**
 * Physics 30 Reference Sheet - Complete Data Booklet
 * 
 * This file contains the complete Physics 30 reference sheet that students
 * have access to during all lessons and exams. Individual lessons can import
 * specific sections as needed.
 * 
 * All formatting is preserved to ensure proper markdown/LaTeX rendering in chat.
 * 
 * ========================================================================
 * HOW TO USE THIS IN YOUR LESSON'S ai-prompt.js FILE:
 * ========================================================================
 * 
 * 1. IMPORT THE SECTIONS YOU NEED:
 * 
 *    // For Physics 20 review lessons:
 *    import { physics20Level } from '../../physics30-reference-sheet.js';
 *    
 *    // For specific topics:
 *    import { constants, kinematics, dynamics } from '../../physics30-reference-sheet.js';
 *    
 *    // For electricity lessons:
 *    import { constants, electricityMagnetism } from '../../physics30-reference-sheet.js';
 *    
 *    // For nuclear physics:
 *    import { atomicPhysics, quantumNuclear, radioactiveElements, isotopes } from '../../physics30-reference-sheet.js';
 *    
 *    // For the complete reference sheet:
 *    import { completeReferenceSheet } from '../../physics30-reference-sheet.js';
 * 
 * 2. ADD TO YOUR referenceData FIELD:
 * 
 *    // Option A - Use pre-grouped sections:
 *    referenceData: `${physics20Level.constants}
 *    ${physics20Level.equations}
 *    ${physics20Level.principles}`,
 *    
 *    // Option B - Combine specific sections:
 *    referenceData: `${constants}
 *    ${kinematics}
 *    ${dynamics}`,
 *    
 *    // Option C - Use complete reference sheet:
 *    referenceData: completeReferenceSheet,
 * 
 * 3. AVAILABLE EXPORTS:
 * 
 *    CONSTANTS & PRINCIPLES:
 *    - constants          // All fundamental constants
 *    - physicsPrinciples  // 10 physics principles
 *    - particles          // Common particles and fermions
 *    - siPrefixes         // SI unit prefixes
 *    
 *    EQUATIONS BY TOPIC:
 *    - kinematics         // Motion equations
 *    - dynamics           // Forces and Newton's laws
 *    - momentumEnergy     // Momentum, work, energy
 *    - waves              // Wave properties, optics
 *    - electricityMagnetism // E&M equations
 *    - atomicPhysics      // Photoelectric, photon energy
 *    - quantumNuclear     // Mass-energy, de Broglie
 *    
 *    MATHEMATICS:
 *    - trigonometry       // Trig functions and theorems
 *    - linearEquations    // Linear equation forms
 *    - areaFormulas       // Area and circumference
 *    
 *    PERIODIC TABLE DATA:
 *    - periodicTableCommon    // Common elements (H to Ne)
 *    - periodicTableNuclear   // Elements for nuclear physics
 *    - radioactiveElements    // Radioactive elements
 *    - isotopes               // Important isotopes
 *    
 *    PRE-GROUPED SECTIONS:
 *    - physics20Level     // Combined constants, equations, principles for Physics 20
 *    - completeReferenceSheet // Everything in one string
 * 
 * 4. EXAMPLE FOR A MOMENTUM LESSON:
 * 
 *    import { constants, kinematics, dynamics, momentumEnergy } from '../../physics30-reference-sheet.js';
 *    
 *    export const aiPrompt = {
 *      // ... other fields ...
 *      
 *      referenceData: `## Reference Data for Momentum
 *      
 *      ${constants}
 *      
 *      ${kinematics}
 *      
 *      ${dynamics}
 *      
 *      ${momentumEnergy}
 *      
 *      **Note:** Students have access to their complete Physics 30 Reference Sheet.`
 *    };
 * 
 * ========================================================================
 */

// Constants section
export const constants = `## Constants

### Fundamental Constants
- Acceleration Due to Gravity Near Earth: $|\\vec{g}| = 9.81 \\text{ m/s}^2$
- Gravitational Constant: $G = 6.67 \\times 10^{-11} \\text{ N·m}^2/\\text{kg}^2$
- Radius of Earth: $r_e = 6.37 \\times 10^6 \\text{ m}$
- Mass of Earth: $M_e = 5.97 \\times 10^{24} \\text{ kg}$
- Elementary Charge: $e = 1.60 \\times 10^{-19} \\text{ C}$
- Coulomb's Law Constant: $k = 8.99 \\times 10^9 \\text{ N·m}^2/\\text{C}^2$
- Electron Volt: $1 \\text{ eV} = 1.60 \\times 10^{-19} \\text{ J}$
- Index of Refraction of Air: $n = 1.00$
- Speed of Light in Vacuum: $c = 3.00 \\times 10^8 \\text{ m/s}$
- Planck's Constant: 
  - $h = 6.63 \\times 10^{-34} \\text{ J·s}$
  - $h = 4.14 \\times 10^{-15} \\text{ eV·s}$
- Atomic Mass Unit: $u = 1.66 \\times 10^{-27} \\text{ kg}$`;

// Physics principles
export const physicsPrinciples = `## Physics Principles
0. Uniform motion ($\\vec{F}_{\\text{net}} = 0$)
1. Accelerated motion ($\\vec{F}_{\\text{net}} \\neq 0$)
2. Uniform circular motion ($\\vec{F}_{\\text{net}}$ is radially inward)
3. Work-energy theorem
4. Conservation of momentum
5. Conservation of energy
6. Conservation of mass-energy
7. Conservation of charge
8. Conservation of nucleons
9. Wave-particle duality`;

// Particle data
export const particles = `## Particles

### Common Particles
| Particle | Charge | Mass |
|----------|--------|------|
| Alpha Particle | $+2e$ | $6.65 \\times 10^{-27} \\text{ kg}$ |
| Electron | $-1e$ | $9.11 \\times 10^{-31} \\text{ kg}$ |
| Proton | $+1e$ | $1.67 \\times 10^{-27} \\text{ kg}$ |
| Neutron | $0$ | $1.67 \\times 10^{-27} \\text{ kg}$ |

### First-Generation Fermions
| Particle | Charge | Mass |
|----------|--------|------|
| Electron | $-1e$ | $\\sim 0.511 \\text{ MeV}/c^2$ |
| Positron | $+1e$ | $\\sim 0.511 \\text{ MeV}/c^2$ |
| Electron neutrino, $\\nu$ | $0$ | $< 2.2 \\text{ eV}/c^2$ |
| Electron antineutrino, $\\bar{\\nu}$ | $0$ | $< 2.2 \\text{ eV}/c^2$ |
| Up quark, $u$ | $+\\frac{2}{3}e$ | $\\sim 2.4 \\text{ MeV}/c^2$ |
| Anti-up antiquark, $\\bar{u}$ | $-\\frac{2}{3}e$ | $\\sim 2.4 \\text{ MeV}/c^2$ |
| Down quark, $d$ | $-\\frac{1}{3}e$ | $\\sim 4.8 \\text{ MeV}/c^2$ |
| Anti-down antiquark, $\\bar{d}$ | $+\\frac{1}{3}e$ | $\\sim 4.8 \\text{ MeV}/c^2$ |`;

// SI Unit Prefixes
export const siPrefixes = `## SI Unit Prefixes
| Prefix | Symbol | Value |
|--------|--------|-------|
| atto | a | $10^{-18}$ |
| femto | f | $10^{-15}$ |
| pico | p | $10^{-12}$ |
| nano | n | $10^{-9}$ |
| micro | μ | $10^{-6}$ |
| milli | m | $10^{-3}$ |
| centi | c | $10^{-2}$ |
| deci | d | $10^{-1}$ |
| deka | da | $10^1$ |
| hecto | h | $10^2$ |
| kilo | k | $10^3$ |
| mega | M | $10^6$ |
| giga | G | $10^9$ |
| tera | T | $10^{12}$ |`;

// Kinematics equations
export const kinematics = `### Kinematics
- Average velocity: $\\vec{v}_{\\text{ave}} = \\frac{\\Delta\\vec{d}}{\\Delta t}$
- Average acceleration: $\\vec{a}_{\\text{ave}} = \\frac{\\Delta\\vec{v}}{\\Delta t}$
- Displacement (constant acceleration):
  - $\\vec{d} = \\vec{v}_i t + \\frac{1}{2}\\vec{a}t^2$
  - $\\vec{d} = \\vec{v}_f t - \\frac{1}{2}\\vec{a}t^2$
  - $\\vec{d} = \\left(\\frac{\\vec{v}_f + \\vec{v}_i}{2}\\right)t$
- Final velocity squared: $v_f^2 = v_i^2 + 2ad$
- Circular motion speed: $|\\vec{v}_c| = \\frac{2\\pi r}{T}$
- Centripetal acceleration: $|\\vec{a}_c| = \\frac{v^2}{r} = \\frac{4\\pi^2 r}{T^2}$`;

// Dynamics equations
export const dynamics = `### Dynamics
- Newton's second law: $\\vec{a} = \\frac{\\vec{F}_{\\text{net}}}{m}$
- Gravitational force: $|\\vec{F}_g| = \\frac{Gm_1m_2}{r^2}$
- Friction force: $|\\vec{F}_f| = \\mu|\\vec{F}_N|$
- Spring force: $\\vec{F}_s = -k\\vec{x}$
- Gravitational field strength: $|\\vec{g}| = \\frac{GM}{r^2}$
- Weight relation: $\\vec{g} = \\frac{\\vec{F}_g}{m}$`;

// Momentum and Energy equations
export const momentumEnergy = `### Momentum and Energy
- Momentum: $\\vec{p} = m\\vec{v}$
- Impulse: $\\vec{F}\\Delta t = m\\Delta\\vec{v}$
- Work: $W = |\\vec{F}||\\vec{d}|\\cos\\theta$
- Work-energy theorem: $W = \\Delta E$
- Power: $P = \\frac{W}{t}$
- Kinetic energy: $E_k = \\frac{1}{2}mv^2$
- Gravitational potential energy: $E_p = mgh$
- Elastic potential energy: $E_p = \\frac{1}{2}kx^2$`;

// Waves equations
export const waves = `### Waves
- Period of mass-spring system: $T = 2\\pi\\sqrt{\\frac{m}{k}}$
- Period of pendulum: $T = 2\\pi\\sqrt{\\frac{l}{g}}$
- Period-frequency relation: $T = \\frac{1}{f}$
- Wave equation: $v = f\\lambda$
- Doppler effect: $f = \\left(\\frac{v}{v \\pm v_s}\\right)f_s$
- Magnification: $m = \\frac{h_i}{h_o} = -\\frac{d_i}{d_o}$
- Thin lens equation: $\\frac{1}{f} = \\frac{1}{d_o} + \\frac{1}{d_i}$
- Snell's law: $\\frac{n_2}{n_1} = \\frac{\\sin\\theta_1}{\\sin\\theta_2}$
- Index of refraction relations: $\\frac{n_2}{n_1} = \\frac{v_1}{v_2} = \\frac{\\lambda_1}{\\lambda_2}$
- Single-slit diffraction: $\\lambda = \\frac{d\\sin\\theta}{n}$
- Double-slit interference: $\\lambda = \\frac{xd}{nl}$`;

// Electricity and Magnetism equations
export const electricityMagnetism = `### Electricity and Magnetism
- Coulomb's law: $|\\vec{F}_e| = \\frac{kq_1q_2}{r^2}$
- Electric field: $|\\vec{E}| = \\frac{kq}{r^2}$
- Electric field definition: $\\vec{E} = \\frac{\\vec{F}_e}{q}$
- Electric field in uniform field: $|\\vec{E}| = \\frac{\\Delta V}{\\Delta d}$
- Electric potential difference: $\\Delta V = \\frac{\\Delta E}{q}$
- Current: $I = \\frac{q}{t}$
- Magnetic force on current: $|\\vec{F}_m| = Il_\\perp|\\vec{B}|$
- Magnetic force on charge: $|\\vec{F}_m| = qv_\\perp|\\vec{B}|$`;

// Atomic Physics equations
export const atomicPhysics = `### Atomic Physics
- Work function: $W = hf_0$
- Photon energy: $E = hf = \\frac{hc}{\\lambda}$
- Maximum kinetic energy (photoelectric): $E_{k\\text{max}} = qV_{\\text{stop}}$
- Radioactive decay: $N = N_0\\left(\\frac{1}{2}\\right)^n$`;

// Quantum Mechanics and Nuclear Physics equations
export const quantumNuclear = `### Quantum Mechanics and Nuclear Physics
- Mass-energy equivalence: $\\Delta E = \\Delta mc^2$
- Energy-momentum relation: $E = pc$
- de Broglie wavelength: $p = \\frac{h}{\\lambda}$
- Compton scattering: $\\Delta\\lambda = \\frac{h}{mc}(1 - \\cos\\theta)$`;

// Mathematics sections
export const trigonometry = `### Trigonometry and Geometry
- Sine: $\\sin\\theta = \\frac{\\text{opposite}}{\\text{hypotenuse}}$
- Cosine: $\\cos\\theta = \\frac{\\text{adjacent}}{\\text{hypotenuse}}$
- Tangent: $\\tan\\theta = \\frac{\\text{opposite}}{\\text{adjacent}}$
- Pythagorean theorem: $c^2 = a^2 + b^2$
- Law of sines: $\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}$
- Law of cosines: $c^2 = a^2 + b^2 - 2ab\\cos C$`;

export const linearEquations = `### Linear Equations
- Slope: $m = \\frac{\\Delta y}{\\Delta x}$
- Slope-intercept form: $y = mx + b$`;

export const areaFormulas = `### Area Formulas
- Rectangle: $A = lw$
- Triangle: $A = \\frac{1}{2}ab$
- Circle: $A = \\pi r^2$

### Circumference
- Circle: $C = 2\\pi r$`;

// Periodic table data
export const periodicTableCommon = `## Periodic Table Data (Key Elements for Physics)

### Common Elements in Physics Problems

| Element | Symbol | Atomic Number (Z) | Atomic Mass (u) |
|---------|--------|------------------|-----------------|
| Hydrogen | H | 1 | 1.01 |
| Helium | He | 2 | 4.00 |
| Lithium | Li | 3 | 6.94 |
| Beryllium | Be | 4 | 9.01 |
| Boron | B | 5 | 10.81 |
| Carbon | C | 6 | 12.01 |
| Nitrogen | N | 7 | 14.01 |
| Oxygen | O | 8 | 16.00 |
| Fluorine | F | 9 | 19.00 |
| Neon | Ne | 10 | 20.18 |`;

export const periodicTableNuclear = `### Elements for Nuclear Physics

| Element | Symbol | Atomic Number (Z) | Atomic Mass (u) |
|---------|--------|------------------|-----------------|
| Aluminum | Al | 13 | 26.98 |
| Silicon | Si | 14 | 28.09 |
| Iron | Fe | 26 | 55.85 |
| Cobalt | Co | 27 | 58.93 |
| Nickel | Ni | 28 | 58.69 |
| Copper | Cu | 29 | 63.55 |
| Zinc | Zn | 30 | 65.39 |
| Silver | Ag | 47 | 107.87 |
| Gold | Au | 79 | 196.97 |
| Lead | Pb | 82 | 207.21 |`;

export const radioactiveElements = `### Radioactive Elements

| Element | Symbol | Atomic Number (Z) | Atomic Mass (u) |
|---------|--------|------------------|-----------------|
| Polonium | Po | 84 | 209 |
| Radon | Rn | 86 | 222 |
| Radium | Ra | 88 | 226 |
| Thorium | Th | 90 | 232.04 |
| Uranium | U | 92 | 238.03 |
| Neptunium | Np | 93 | 237 |
| Plutonium | Pu | 94 | 244 |
| Americium | Am | 95 | 243 |`;

export const isotopes = `### Important Isotopes for Physics

| Isotope | Symbol | Mass Number (A) | Notes |
|---------|--------|-----------------|-------|
| Deuterium | $^2_1\\text{H}$ or D | 2 | Heavy hydrogen |
| Tritium | $^3_1\\text{H}$ or T | 3 | Radioactive hydrogen |
| Carbon-12 | $^{12}_6\\text{C}$ | 12 | Standard for atomic mass |
| Carbon-14 | $^{14}_6\\text{C}$ | 14 | Radioactive, used in dating |
| Uranium-235 | $^{235}_{92}\\text{U}$ | 235 | Fissile isotope |
| Uranium-238 | $^{238}_{92}\\text{U}$ | 238 | Most common uranium |

### Useful Nuclear Physics Relationships
- Mass number: $A = Z + N$ (protons + neutrons)
- Nuclear notation: $^A_Z\\text{X}$ where X is element symbol
- Mass defect: $\\Delta m = (Z \\cdot m_p + N \\cdot m_n) - m_{\\text{nucleus}}$
- Binding energy: $BE = \\Delta mc^2$`;

// Grouped exports for easy importing
export const physics20Level = {
  constants: `## Constants (Physics 20 Level)
- Acceleration Due to Gravity Near Earth: $|\\vec{g}| = 9.81 \\text{ m/s}^2$
- Speed of Light in Vacuum: $c = 3.00 \\times 10^8 \\text{ m/s}$`,
  
  equations: `## Equations (Physics 20 Level)
${kinematics}

${dynamics}

${momentumEnergy}

${trigonometry}

${linearEquations}

${areaFormulas}`,

  principles: `## Physics Principles (Physics 20 Level)
0. Uniform motion ($\\vec{F}_{\\text{net}} = 0$)
1. Accelerated motion ($\\vec{F}_{\\text{net}} \\neq 0$)
3. Work-energy theorem
4. Conservation of momentum
5. Conservation of energy`
};

// Complete reference sheet
// AI Response Formatting Guidelines
export const aiFormattingGuidelines = `## AI Response Formatting

**Math Equations:**
- Use LaTeX with double backslashes: $v = 25 \\\\text{ m/s}$
- Units in \\\\text{}: $F = 49 \\\\text{ N}$
- Vectors: $\\\\vec{F}_{\\\\text{net}}$
- Fractions: $\\\\frac{1}{2}mv^2$

**Scientific Notation:**
- Use LaTeX format: $1.23 \\\\times 10^{5}$
- For negative exponents: $2.5 \\\\times 10^{-3}$
- With units: $6.02 \\\\times 10^{23} \\\\text{ mol}^{-1}$
- Always use \\\\times (not * or x)

**Text Formatting:**
- Use markdown headers (##, ###)
- Use bullet points and numbered lists
- Keep responses concise for chat bubbles
- Never use backticks within any of your responses
`;

export const completeReferenceSheet = `# Physics 30 Reference Sheet

${constants}

${physicsPrinciples}

${particles}

${siPrefixes}

## Equations

${kinematics}

${dynamics}

${momentumEnergy}

${waves}

${electricityMagnetism}

${atomicPhysics}

${quantumNuclear}

${trigonometry}

${linearEquations}

${areaFormulas}

${periodicTableCommon}

${periodicTableNuclear}

${radioactiveElements}

${isotopes}
`;