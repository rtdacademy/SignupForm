const { createStandardMultipleChoice } = require('../../../shared/assessment-types/standard-multiple-choice');

// Dispersion and Scattering Knowledge Check Questions
const questions = [
  {
    questionText: 'Sunlight is made up of most of the colours of the spectrum. Although it is refracted by our atmosphere it is not dispersed into its colours as it travels through air. What does this tell you about the relative speeds of the various colours/wavelengths of the spectrum through air?',
    options: [
      { id: 'a', text: 'All colors travel at the same speed through air', feedback: 'Correct! Since there is no dispersion in air, all wavelengths must travel at essentially the same speed, indicating that air has virtually the same refractive index for all visible wavelengths.' },
      { id: 'b', text: 'Red light travels faster than blue light through air', feedback: 'Incorrect. If different colors had different speeds in air, we would see dispersion like we do with glass prisms.' },
      { id: 'c', text: 'Blue light travels faster than red light through air', feedback: 'Incorrect. If different colors had different speeds in air, we would see dispersion like we do with glass prisms.' },
      { id: 'd', text: 'The speeds vary randomly for different colors', feedback: 'Incorrect. The lack of dispersion indicates that all colors travel at essentially the same speed in air.' }
    ],
    correctOptionId: 'a',
    explanation: 'The absence of dispersion in air tells us that the refractive index of air is essentially the same for all visible wavelengths, meaning all colors travel at the same speed through air.',
    difficulty: 'intermediate',
    tags: ['dispersion', 'air', 'wavelength', 'speed']
  },
  {
    questionText: 'What observation indicates that diamond has slightly different refractive indices for each of the colours of the spectrum?',
    options: [
      { id: 'a', text: 'Diamonds appear transparent', feedback: 'Incorrect. Transparency doesn\'t indicate wavelength-dependent refraction.' },
      { id: 'b', text: 'Diamonds create colorful sparkles and fire when light passes through them', feedback: 'Correct! The brilliant colors and "fire" seen in cut diamonds result from dispersion - white light being separated into its component colors due to different refractive indices for different wavelengths.' },
      { id: 'c', text: 'Diamonds are very hard', feedback: 'Incorrect. Hardness is a mechanical property, not related to optical dispersion.' },
      { id: 'd', text: 'Diamonds reflect light well', feedback: 'Incorrect. While diamonds do reflect light well, this doesn\'t specifically indicate wavelength-dependent refraction.' }
    ],
    correctOptionId: 'b',
    explanation: 'The beautiful colors and "fire" displayed by cut diamonds are direct evidence of dispersion - the separation of white light into its component colors due to wavelength-dependent refractive indices.',
    difficulty: 'intermediate',
    tags: ['diamond', 'dispersion', 'refractive-index', 'fire']
  },
  {
    questionText: 'Considering the relationship between particle size and the scattering of light, is it better to use red light or blue light when photographing a tiny object through a microscope when you want to obtain maximum definition? Explain.',
    options: [
      { id: 'a', text: 'Blue light, because it scatters more and provides better contrast', feedback: 'Incorrect. More scattering would actually reduce definition by creating more background interference.' },
      { id: 'b', text: 'Red light, because it scatters less when interacting with small particles', feedback: 'Correct! Red light has a longer wavelength and scatters much less than blue light when interacting with small particles. Less scattering means clearer images with better definition and less background interference.' },
      { id: 'c', text: 'Blue light, because it has higher energy', feedback: 'Incorrect. While blue light does have higher energy, this doesn\'t improve definition - the scattering properties are more important.' },
      { id: 'd', text: 'It doesn\'t matter which color is used', feedback: 'Incorrect. The wavelength significantly affects scattering, which directly impacts image clarity.' }
    ],
    correctOptionId: 'b',
    explanation: 'Red light is better for microscopy of tiny objects because scattering is proportional to λ⁻⁴ (shorter wavelengths scatter more). Red light\'s longer wavelength results in much less scattering, producing clearer images with better definition.',
    difficulty: 'advanced',
    tags: ['scattering', 'microscopy', 'wavelength', 'definition']
  },
  {
    questionText: 'Why are you more comfortable on a hot sunny day in light-coloured clothes than in dark clothes?',
    options: [
      { id: 'a', text: 'Light colors absorb more heat from the sun', feedback: 'Incorrect. This would make you less comfortable, not more comfortable.' },
      { id: 'b', text: 'Light colors reflect more sunlight and absorb less heat than dark colors', feedback: 'Correct! Light-colored clothing reflects most of the incident sunlight, while dark-colored clothing absorbs most wavelengths and converts the light energy to heat, making you warmer.' },
      { id: 'c', text: 'Dark colors reflect more heat away from your body', feedback: 'Incorrect. Dark colors actually absorb more light and heat.' },
      { id: 'd', text: 'The color doesn\'t affect temperature', feedback: 'Incorrect. Color significantly affects how much light and heat are absorbed versus reflected.' }
    ],
    correctOptionId: 'b',
    explanation: 'Light colors reflect most incident light, while dark colors absorb most wavelengths and convert them to heat. This is why light-colored clothing keeps you cooler on sunny days.',
    difficulty: 'beginner',
    tags: ['absorption', 'reflection', 'heat', 'color']
  },
  {
    questionText: 'What is the physical difference between red and orange light?',
    options: [
      { id: 'a', text: 'Red light has higher energy than orange light', feedback: 'Incorrect. Red light actually has lower energy than orange light because it has a lower frequency.' },
      { id: 'b', text: 'Red light has a longer wavelength and lower frequency than orange light', feedback: 'Correct! Red light has a wavelength around 650-750 nm while orange is around 590-620 nm. Since c = fλ, longer wavelength means lower frequency, and lower frequency means lower energy.' },
      { id: 'c', text: 'Red light travels faster than orange light', feedback: 'Incorrect. All colors of light travel at the same speed in vacuum (and essentially the same speed in air).' },
      { id: 'd', text: 'There is no physical difference - only how we perceive them', feedback: 'Incorrect. There are real physical differences in wavelength, frequency, and energy between different colors.' }
    ],
    correctOptionId: 'b',
    explanation: 'Different colors correspond to different wavelengths and frequencies of electromagnetic radiation. Red has longer wavelengths (lower frequency, lower energy) than orange.',
    difficulty: 'intermediate',
    tags: ['wavelength', 'frequency', 'electromagnetic-spectrum', 'color']
  },
  {
    questionText: 'A performer wears blue clothes on stage. How could you use spotlights to make them appear black? Is it possible to make them appear red?',
    options: [
      { id: 'a', text: 'Use red light to make them black; use blue light to make them red', feedback: 'Incorrect. Red light would make blue clothes appear black, but blue light cannot make blue clothes appear red.' },
      { id: 'b', text: 'Use red light to make them black; it is not possible to make them appear red', feedback: 'Correct! Blue clothes reflect blue light and absorb other colors. Red spotlights would be absorbed, making the clothes appear black. Since the clothes can only reflect blue light, they cannot appear red under any lighting.' },
      { id: 'c', text: 'Use blue light for both effects', feedback: 'Incorrect. Blue light would make blue clothes appear blue, not black or red.' },
      { id: 'd', text: 'Both effects are impossible with just lighting', feedback: 'Incorrect. You can make blue clothes appear black using red light, though you cannot make them appear red.' }
    ],
    correctOptionId: 'b',
    explanation: 'Blue clothes reflect blue wavelengths and absorb others. Red light would be absorbed (making clothes appear black), but since the material can only reflect blue, it cannot appear red under any lighting.',
    difficulty: 'intermediate',
    tags: ['absorption', 'reflection', 'color-perception', 'lighting']
  },
  {
    questionText: 'When white light passes through a flat piece of window glass, it is not dispersed into its colour spectrum. Why not?',
    options: [
      { id: 'a', text: 'Window glass has the same refractive index for all colors', feedback: 'Incorrect. Window glass does have slightly different refractive indices for different colors, just like other glass.' },
      { id: 'b', text: 'The glass surfaces are parallel, so any dispersion at the first surface is cancelled by opposite dispersion at the second surface', feedback: 'Correct! While dispersion occurs at the first surface, the parallel second surface causes equal and opposite dispersion, recombining the colors back into white light.' },
      { id: 'c', text: 'Window glass is too thin to cause dispersion', feedback: 'Incorrect. The thickness doesn\'t prevent dispersion - it\'s the parallel surfaces that cancel the effect.' },
      { id: 'd', text: 'Only prisms can cause dispersion, not flat glass', feedback: 'Incorrect. Any glass can cause dispersion if the geometry allows the separated colors to continue diverging.' }
    ],
    correctOptionId: 'b',
    explanation: 'Flat window glass has parallel surfaces. While the first surface disperses white light into colors, the parallel exit surface causes equal and opposite dispersion, recombining the colors back into white light.',
    difficulty: 'advanced',
    tags: ['dispersion', 'parallel-surfaces', 'window-glass', 'geometry']
  },
  {
    questionText: 'An object appears green in white light. What colour will it appear to be if it is illuminated by (a) magenta light, (b) cyan light, and (c) pure blue light?',
    options: [
      { id: 'a', text: '(a) Green, (b) Green, (c) Blue', feedback: 'Incorrect. The object can only reflect green light, so it cannot appear blue under blue illumination.' },
      { id: 'b', text: '(a) Black, (b) Green, (c) Black', feedback: 'Correct! A green object only reflects green light. (a) Magenta contains no green, so it appears black. (b) Cyan contains green, so it appears green. (c) Pure blue contains no green, so it appears black.' },
      { id: 'c', text: '(a) Magenta, (b) Cyan, (c) Blue', feedback: 'Incorrect. The object can only reflect the green wavelengths it contains - it cannot create new colors.' },
      { id: 'd', text: '(a) Red, (b) Blue, (c) Green', feedback: 'Incorrect. A green object cannot reflect red or blue light - it only reflects green wavelengths.' }
    ],
    correctOptionId: 'b',
    explanation: 'A green object only reflects green wavelengths and absorbs all others. Under magenta light (red + blue, no green) it appears black. Under cyan light (blue + green) it appears green. Under pure blue light (no green) it appears black.',
    difficulty: 'intermediate',
    tags: ['color-perception', 'reflection', 'absorption', 'subtraction-theory']
  },
  {
    questionText: 'Cats do not see in colour, only black, white and grey. How do cat\'s eyes differ from human eyes?',
    options: [
      { id: 'a', text: 'Cats have fewer rod cells in their retinas', feedback: 'Incorrect. Cats actually have more rod cells than humans, which helps with night vision.' },
      { id: 'b', text: 'Cats have fewer cone cells in their retinas', feedback: 'Correct! Cats have far fewer cone cells (color receptors) compared to humans. Humans have three types of cones for color vision, while cats have very few cone cells, making them essentially colorblind.' },
      { id: 'c', text: 'Cats have differently shaped pupils', feedback: 'Incorrect. While cats do have vertical pupils, this affects light control, not color perception.' },
      { id: 'd', text: 'Cats\' eyes are larger than human eyes', feedback: 'Incorrect. Eye size doesn\'t determine color vision - it\'s the types and numbers of photoreceptor cells that matter.' }
    ],
    correctOptionId: 'b',
    explanation: 'Color vision depends on cone cells in the retina. Humans have three types of cone cells (for red, green, blue perception), while cats have very few cone cells, resulting in poor color discrimination.',
    difficulty: 'intermediate',
    tags: ['color-vision', 'cone-cells', 'retina', 'biology']
  },
  {
    questionText: 'Why do objects seen in moonlight appear so colourless?',
    options: [
      { id: 'a', text: 'Moonlight contains no color information', feedback: 'Incorrect. Moonlight is reflected sunlight and contains all colors, just at very low intensity.' },
      { id: 'b', text: 'At low light levels, our cone cells (color receptors) don\'t function well, and we rely mainly on rod cells which only detect brightness', feedback: 'Correct! At low light levels, our cone cells (responsible for color vision) become non-functional. We rely on rod cells, which are very sensitive but only detect light intensity, not color, resulting in black and white vision.' },
      { id: 'c', text: 'The moon filters out all colors except white', feedback: 'Incorrect. The moon reflects sunlight without significantly filtering colors.' },
      { id: 'd', text: 'Our pupils are too small in moonlight to see colors', feedback: 'Incorrect. Actually, our pupils dilate in low light. The issue is with which type of photoreceptor cells are active.' }
    ],
    correctOptionId: 'b',
    explanation: 'Color vision requires cone cells, which need higher light levels to function. In moonlight, only our highly sensitive rod cells work effectively, providing only brightness information without color discrimination.',
    difficulty: 'intermediate',
    tags: ['night-vision', 'rod-cells', 'cone-cells', 'low-light', 'vision']
  }
];

// Export individual question handlers
exports.course2_17_dispersion_air_speeds = createStandardMultipleChoice({
  questions: [questions[0]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_diamond_dispersion = createStandardMultipleChoice({
  questions: [questions[1]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_microscopy_scattering = createStandardMultipleChoice({
  questions: [questions[2]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_clothing_color_heat = createStandardMultipleChoice({
  questions: [questions[3]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_red_orange_difference = createStandardMultipleChoice({
  questions: [questions[4]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_stage_lighting_color = createStandardMultipleChoice({
  questions: [questions[5]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_window_glass_dispersion = createStandardMultipleChoice({
  questions: [questions[6]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_green_object_lighting = createStandardMultipleChoice({
  questions: [questions[7]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_cat_color_vision = createStandardMultipleChoice({
  questions: [questions[8]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});

exports.course2_17_moonlight_colorless = createStandardMultipleChoice({
  questions: [questions[9]],
  randomizeOptions: true,
  activityType: 'lesson',
  maxAttempts: 9999,
  pointsValue: 1
});