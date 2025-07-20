/**
 * AI Prompt Configuration for Lab 9 - Marshmallow Speed of Light
 * Course: Physics 30
 * Unit: Modern Physics / The Nature of the Atom
 */

export const aiPrompt = {
  courseId: "2",
  unitId: "58-lab-marshmallow-speed-light",
  title: "Lab 9 - Marshmallow Speed of Light",
  
  // Core physics concepts for this lab
  concepts: [
    "electromagnetic waves",
    "standing waves", 
    "wavelength and frequency relationship",
    "speed of light measurement",
    "microwave physics",
    "wave interference patterns",
    "experimental error analysis"
  ],
  
  // Lab-specific context
  context: `
    This lab uses microwave standing wave patterns to measure the speed of light.
    Students observe melting patterns in marshmallows placed in a microwave with the
    turntable removed. The distance between melted spots corresponds to half the
    wavelength of the microwaves. Using the relationship c = λf, students can
    calculate the speed of light.
    
    Key physics principles:
    - Standing waves form when microwaves reflect off the back wall
    - Antinodes (maximum amplitude) occur where marshmallows melt
    - Distance between antinodes = λ/2, so λ = 2d
    - Microwave frequency is typically 2.45 GHz
    - Speed of light c = λf
  `,
  
  // Assessment guidelines
  assessmentGuidance: `
    When helping students with this lab:
    
    1. Emphasize safety - microwave experiments require careful monitoring
    2. Help students understand why wavelength = 2 × distance between melted spots
    3. Guide calculation of speed of light using c = λf formula
    4. Assist with unit conversions (GHz to Hz, cm to m)
    5. Help identify sources of experimental error
    6. Support analysis of percent error calculations
    
    Do not provide direct answers to calculations - guide students to work
    through the mathematics themselves.
  `,
  
  // Common student misconceptions
  misconceptions: [
    "Distance between spots equals wavelength (should be λ/2)",
    "Confusing frequency units (GHz vs Hz)", 
    "Not understanding why standing waves form",
    "Thinking melting occurs at nodes instead of antinodes"
  ],
  
  // Suggested help topics
  helpTopics: [
    "Standing wave formation in microwaves",
    "Relationship between antinode spacing and wavelength", 
    "Unit conversion for frequency and distance",
    "Percent error calculation methods",
    "Sources of experimental uncertainty",
    "Safety considerations with microwave experiments"
  ]
};