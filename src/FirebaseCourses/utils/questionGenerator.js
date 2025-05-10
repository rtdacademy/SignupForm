/**
 * Question Generator Utility
 * 
 * This utility helps create parameterized question templates that can generate
 * different versions of questions with the same structure but different values.
 * 
 * Each template contains:
 * - A stem template with parameter placeholders
 * - Parameter definitions with constraints
 * - Answer computation logic
 * - Option generation for multiple choice questions
 */

/**
 * Generate a specific instance of a parameterized question
 * @param {Object} template - Question template 
 * @param {Object} seedData - Data to seed the random generator (e.g., {studentId, questionId})
 * @returns {Object} Question instance with specific parameters and correct answer
 */
export const generateQuestionInstance = (template, seedData) => {
  // Create a seeded random number generator
  const randomGenerator = createSeededRandom(seedString(seedData));
  
  // Generate parameter values based on template constraints
  const parameters = {};
  
  Object.entries(template.parameters).forEach(([paramName, constraints]) => {
    if (constraints.type === 'integer') {
      parameters[paramName] = generateInteger(
        constraints.min, 
        constraints.max,
        constraints.exclude || [],
        randomGenerator
      );
    } else if (constraints.type === 'decimal') {
      parameters[paramName] = generateDecimal(
        constraints.min, 
        constraints.max,
        constraints.precision || 2,
        randomGenerator
      );
    } else if (constraints.type === 'list') {
      parameters[paramName] = generateFromList(
        constraints.values,
        randomGenerator
      );
    }
  });
  
  // Generate question text by replacing placeholders
  const questionText = replacePlaceholders(template.stem, parameters);
  
  // Compute correct answer using the template's answer function
  const correctAnswer = computeAnswer(template.answerLogic, parameters);
  
  // For multiple choice, generate options
  let options = [];
  if (template.type === 'multipleChoice') {
    options = generateOptions(
      correctAnswer,
      template.optionConfig,
      parameters,
      randomGenerator
    );
  }
  
  // Create final question instance
  const questionInstance = {
    id: template.id,
    type: template.type,
    stem: questionText,
    parameters,
    correctAnswer,
    difficulty: template.difficulty,
    tags: template.tags || []
  };
  
  // Add options for multiple choice questions
  if (template.type === 'multipleChoice') {
    questionInstance.options = options;
    questionInstance.correctOptionId = options.find(opt => 
      opt.value === correctAnswer
    )?.id;
  }
  
  return questionInstance;
};

/**
 * Create a seeded random number generator
 * @param {String} seed - Seed string
 * @returns {Function} Seeded random function that returns values between 0 and 1
 */
const createSeededRandom = (seed) => {
  // Simple seeded random implementation
  // For production, consider using a more robust seeded PRNG
  const hash = stringToHash(seed);
  
  return () => {
    // Mulberry32 algorithm
    let t = hash + 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

/**
 * Convert a string to a numeric hash
 * @param {String} str - Input string
 * @returns {Number} Hash value
 */
const stringToHash = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

/**
 * Convert seed data object to string
 * @param {Object} seedData - Seed data 
 * @returns {String} Seed string
 */
const seedString = (seedData) => {
  return Object.values(seedData).join('_');
};

/**
 * Generate a random integer within constraints
 * @param {Number} min - Minimum value (inclusive)
 * @param {Number} max - Maximum value (inclusive)
 * @param {Array} exclude - Values to exclude
 * @param {Function} random - Random number generator
 * @returns {Number} Random integer
 */
const generateInteger = (min, max, exclude, random) => {
  // First try a limited number of times to get a non-excluded value
  const range = max - min + 1;
  let attempts = 0;
  
  while (attempts < 10) {
    const value = min + Math.floor(random() * range);
    if (!exclude.includes(value)) {
      return value;
    }
    attempts++;
  }
  
  // If too many attempts, generate all possible values and filter
  const allValues = Array.from({ length: range }, (_, i) => min + i)
    .filter(v => !exclude.includes(v));
    
  if (allValues.length === 0) {
    throw new Error(`No valid values between ${min} and ${max} after exclusions`);
  }
  
  return allValues[Math.floor(random() * allValues.length)];
};

/**
 * Generate a random decimal within constraints
 * @param {Number} min - Minimum value (inclusive)
 * @param {Number} max - Maximum value (inclusive)
 * @param {Number} precision - Decimal precision
 * @param {Function} random - Random number generator
 * @returns {Number} Random decimal
 */
const generateDecimal = (min, max, precision, random) => {
  const value = min + random() * (max - min);
  return Number(value.toFixed(precision));
};

/**
 * Select a random item from a list
 * @param {Array} list - List of items
 * @param {Function} random - Random number generator
 * @returns {*} Selected item
 */
const generateFromList = (list, random) => {
  return list[Math.floor(random() * list.length)];
};

/**
 * Replace parameter placeholders in template string
 * @param {String} template - String with placeholders like {param}
 * @param {Object} parameters - Parameter values
 * @returns {String} Processed string
 */
const replacePlaceholders = (template, parameters) => {
  let result = template;
  for (const [key, value] of Object.entries(parameters)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  }
  return result;
};

/**
 * Compute the answer based on parameters
 * @param {String} logicType - Type of answer logic
 * @param {Object} parameters - Parameter values
 * @returns {*} Computed answer
 */
const computeAnswer = (logicType, parameters) => {
  // Use a function lookup or switch statement to handle different logic types
  switch (logicType.type) {
    case 'arithmetic':
      return evalArithmetic(logicType.formula, parameters);
    case 'function':
      return evalFunction(logicType.formula, parameters);
    case 'lookup':
      return parameters[logicType.paramName];
    default:
      throw new Error(`Unknown answer logic type: ${logicType.type}`);
  }
};

/**
 * Evaluate an arithmetic formula
 * @param {String} formula - Formula string with parameter placeholders
 * @param {Object} parameters - Parameter values
 * @returns {Number} Computed result
 */
const evalArithmetic = (formula, parameters) => {
  // Replace parameters in formula
  let processedFormula = replacePlaceholders(formula, parameters);
  
  // For security, only allow simple arithmetic
  // This is a simple implementation - in production, use a proper math parser
  const sanitizedFormula = processedFormula.replace(/[^0-9+\-*/().]/g, '');
  
  try {
    // Using eval is generally not recommended, but for this limited case it's controlled
    // In production, use a proper math expression evaluator library
    return eval(sanitizedFormula);
  } catch (error) {
    console.error('Error evaluating formula:', error);
    throw new Error('Invalid arithmetic formula');
  }
};

/**
 * Evaluate a custom function
 * @param {String} functionName - Name of the function to call
 * @param {Object} parameters - Parameter values
 * @returns {*} Function result
 */
const evalFunction = (functionName, parameters) => {
  // Function registry - add specialized calculation functions here
  const functions = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => a / b,
    power: (a, b) => Math.pow(a, b),
    gcd: (a, b) => {
      // Greatest common divisor
      while (b) {
        const t = b;
        b = a % b;
        a = t;
      }
      return a;
    },
    lcm: (a, b) => {
      // Least common multiple
      return Math.abs(a * b) / evalFunction('gcd', { a, b });
    },
    // Add more functions as needed
  };

  if (!functions[functionName]) {
    throw new Error(`Unknown function: ${functionName}`);
  }
  
  return functions[functionName](parameters.a, parameters.b);
};

/**
 * Generate answer options for multiple choice questions
 * @param {*} correctAnswer - The correct answer
 * @param {Object} optionConfig - Configuration for generating options
 * @param {Object} parameters - Question parameters
 * @param {Function} random - Random number generator
 * @returns {Array} Answer options
 */
const generateOptions = (correctAnswer, optionConfig, parameters, random) => {
  const { count, type } = optionConfig;
  const options = [];
  
  // Add correct answer to options
  options.push({
    id: 'a', // Will be assigned proper IDs later
    text: formatAnswerText(correctAnswer, optionConfig.format),
    value: correctAnswer
  });
  
  // Generate incorrect options
  const incorrectOptions = generateIncorrectOptions(
    correctAnswer,
    count - 1, // Subtract 1 for the correct answer
    type,
    parameters,
    optionConfig,
    random
  );
  
  // Add incorrect options to the list
  options.push(...incorrectOptions);
  
  // Shuffle and assign IDs
  const shuffled = shuffleArray(options, random);
  
  return shuffled.map((option, index) => ({
    ...option,
    id: String.fromCharCode(97 + index) // a, b, c, d, etc.
  }));
};

/**
 * Generate plausible incorrect options
 * @param {*} correctAnswer - The correct answer
 * @param {Number} count - Number of incorrect options to generate
 * @param {String} type - Type of incorrect options to generate
 * @param {Object} parameters - Question parameters
 * @param {Object} config - Configuration for option generation
 * @param {Function} random - Random number generator
 * @returns {Array} Incorrect options
 */
const generateIncorrectOptions = (correctAnswer, count, type, parameters, config, random) => {
  switch (type) {
    case 'arithmetic':
      return generateArithmeticOptions(correctAnswer, count, parameters, config, random);
    case 'lookup':
      return generateLookupOptions(correctAnswer, count, config.values, random);
    case 'increment':
      return generateIncrementOptions(correctAnswer, count, config.step, config.direction, random);
    default:
      throw new Error(`Unknown option generation type: ${type}`);
  }
};

/**
 * Generate incorrect options for arithmetic questions
 * @param {Number} correctAnswer - The correct answer
 * @param {Number} count - Number of incorrect options to generate
 * @param {Object} parameters - Question parameters
 * @param {Object} config - Configuration for option generation
 * @param {Function} random - Random number generator
 * @returns {Array} Incorrect options
 */
const generateArithmeticOptions = (correctAnswer, count, parameters, config, random) => {
  const options = [];
  const { commonMistakes, range } = config;
  
  // Try to use common mistakes first
  if (commonMistakes) {
    for (const mistake of commonMistakes) {
      if (options.length >= count) break;
      
      let value;
      
      if (mistake.type === 'operation') {
        // Simulate wrong operation, e.g., adding instead of multiplying
        value = evalArithmetic(mistake.formula, parameters);
      } else if (mistake.type === 'sign') {
        // Change the sign
        value = -correctAnswer;
      } else if (mistake.type === 'value') {
        // Use a fixed wrong value
        value = mistake.value;
      }
      
      // Make sure the generated value isn't the correct answer
      if (value !== undefined && value !== correctAnswer) {
        options.push({
          text: formatAnswerText(value, config.format),
          value
        });
      }
    }
  }
  
  // Fill remaining options with random values within range of correct answer
  const min = range?.min !== undefined ? correctAnswer + range.min : correctAnswer * 0.5;
  const max = range?.max !== undefined ? correctAnswer + range.max : correctAnswer * 1.5;
  
  // Generate unique incorrect options
  while (options.length < count) {
    const isInteger = Number.isInteger(correctAnswer);
    
    let value;
    if (isInteger) {
      value = generateInteger(
        Math.floor(min),
        Math.ceil(max),
        [correctAnswer, ...options.map(o => o.value)],
        random
      );
    } else {
      value = generateDecimal(min, max, 2, random);
      // Make sure it's not too close to correct answer or existing options
      if (Math.abs(value - correctAnswer) < 0.1) continue;
      if (options.some(o => Math.abs(o.value - value) < 0.1)) continue;
    }
    
    options.push({
      text: formatAnswerText(value, config.format),
      value
    });
  }
  
  return options;
};

/**
 * Generate incorrect options by selecting from a list
 * @param {*} correctAnswer - The correct answer
 * @param {Number} count - Number of incorrect options to generate
 * @param {Array} valueList - List of possible values
 * @param {Function} random - Random number generator
 * @returns {Array} Incorrect options
 */
const generateLookupOptions = (correctAnswer, count, valueList, random) => {
  // Filter out the correct answer
  const availableOptions = valueList.filter(v => v !== correctAnswer);
  
  if (availableOptions.length < count) {
    throw new Error('Not enough values to generate options');
  }
  
  // Shuffle and take the first count items
  return shuffleArray(availableOptions, random)
    .slice(0, count)
    .map(value => ({
      text: value.toString(),
      value
    }));
};

/**
 * Generate incorrect options by incrementing/decrementing the correct answer
 * @param {Number} correctAnswer - The correct answer
 * @param {Number} count - Number of incorrect options to generate
 * @param {Number} step - Increment/decrement step
 * @param {String} direction - 'both', 'up', or 'down'
 * @param {Function} random - Random number generator
 * @returns {Array} Incorrect options
 */
const generateIncrementOptions = (correctAnswer, count, step, direction, random) => {
  const options = [];
  const usedValues = new Set([correctAnswer]);
  
  while (options.length < count) {
    let value;
    
    if (direction === 'up' || (direction === 'both' && random() > 0.5)) {
      value = correctAnswer + step * (options.length + 1);
    } else {
      value = correctAnswer - step * (options.length + 1);
    }
    
    if (!usedValues.has(value)) {
      usedValues.add(value);
      options.push({
        text: formatAnswerText(value),
        value
      });
    }
  }
  
  return options;
};

/**
 * Format answer text based on format specification
 * @param {*} value - Answer value
 * @param {String} format - Format specification
 * @returns {String} Formatted text
 */
const formatAnswerText = (value, format) => {
  if (!format) return value.toString();
  
  switch (format) {
    case 'integer':
      return Math.round(value).toString();
    case 'decimal':
      return Number(value).toFixed(2);
    case 'currency':
      return `$${Number(value).toFixed(2)}`;
    case 'percent':
      return `${value}%`;
    default:
      return value.toString();
  }
};

/**
 * Shuffle an array using seeded random generator
 * @param {Array} array - Array to shuffle
 * @param {Function} random - Random number generator
 * @returns {Array} Shuffled array
 */
const shuffleArray = (array, random) => {
  const result = [...array];
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};

/**
 * Question template examples
 */
export const questionTemplates = {
  addition: {
    id: 'addition',
    type: 'multipleChoice',
    stem: 'What is {a} + {b}?',
    parameters: {
      a: { type: 'integer', min: 1, max: 100 },
      b: { type: 'integer', min: 1, max: 100 }
    },
    answerLogic: {
      type: 'arithmetic',
      formula: '{a} + {b}'
    },
    optionConfig: {
      count: 4,
      type: 'arithmetic',
      format: 'integer',
      commonMistakes: [
        { type: 'operation', formula: '{a} - {b}' },
        { type: 'operation', formula: '{a} * {b}' }
      ]
    },
    difficulty: 1,
    tags: ['math', 'addition']
  },
  
  subtraction: {
    id: 'subtraction',
    type: 'multipleChoice',
    stem: 'What is {a} - {b}?',
    parameters: {
      a: { type: 'integer', min: 10, max: 100 },
      b: { type: 'integer', min: 1, max: 50 }
    },
    answerLogic: {
      type: 'arithmetic',
      formula: '{a} - {b}'
    },
    optionConfig: {
      count: 4,
      type: 'arithmetic',
      format: 'integer',
      commonMistakes: [
        { type: 'operation', formula: '{a} + {b}' },
        { type: 'sign', formula: '{b} - {a}' }
      ]
    },
    difficulty: 1,
    tags: ['math', 'subtraction']
  },
  
  multiplication: {
    id: 'multiplication',
    type: 'multipleChoice',
    stem: 'What is {a} × {b}?',
    parameters: {
      a: { type: 'integer', min: 2, max: 12 },
      b: { type: 'integer', min: 2, max: 12 }
    },
    answerLogic: {
      type: 'arithmetic',
      formula: '{a} * {b}'
    },
    optionConfig: {
      count: 4,
      type: 'arithmetic',
      format: 'integer',
      commonMistakes: [
        { type: 'operation', formula: '{a} + {b}' }
      ]
    },
    difficulty: 2,
    tags: ['math', 'multiplication']
  },
  
  division: {
    id: 'division',
    type: 'multipleChoice',
    stem: 'What is {a} ÷ {b}?',
    parameters: {
      b: { type: 'integer', min: 2, max: 10 },
      a: { type: 'integer', min: 1, max: 10 },
      _multiply: { type: 'function', function: 'multiply' }
    },
    answerLogic: {
      type: 'arithmetic',
      formula: '{_multiply} / {b}'
    },
    optionConfig: {
      count: 4,
      type: 'arithmetic',
      format: 'decimal',
      commonMistakes: [
        { type: 'operation', formula: '{b} / {a}' }
      ]
    },
    difficulty: 2,
    tags: ['math', 'division']
  }
};

export default {
  generateQuestionInstance,
  questionTemplates
};