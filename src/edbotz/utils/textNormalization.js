/**
 * Text Normalization Utility for TTS
 * Converts text into more speakable forms for Text-to-Speech systems
 */

// Abbreviations and their spoken forms
const ABBREVIATIONS = {
    // Titles
    'Dr.': 'Doctor',
    'Mr.': 'Mister',
    'Mrs.': 'Misses',
    'Ms.': 'Miz',
    'Prof.': 'Professor',
    'Rev.': 'Reverend',
    'Hon.': 'Honorable',
    'St.': 'Saint',
    'Jr.': 'Junior',
    'Sr.': 'Senior',
    'Capt.': 'Captain',
    'Lt.': 'Lieutenant',
    'Col.': 'Colonel',
    'Gen.': 'General',
    
    // Common abbreviations
    'i.e.': 'that is',
    'e.g.': 'for example',
    'etc.': 'etcetera',
    'vs.': 'versus',
    'viz.': 'namely',
    'approx.': 'approximately',
    'appt.': 'appointment',
    'dept.': 'department',
    'est.': 'established',
    'min.': 'minutes',
    'max.': 'maximum',
    'vol.': 'volume',
    'seq.': 'sequence',
    'temp.': 'temperature',
    'orig.': 'original',
    'est.': 'estimate',
    'cont.': 'continued',
    
    // Academic
    'Fig.': 'Figure',
    'Tab.': 'Table',
    'Ex.': 'Example',
    'Ch.': 'Chapter',
    'p.': 'page',
    'pp.': 'pages',
    'eq.': 'equation',
    'ref.': 'reference',
    'refs.': 'references',
    'def.': 'definition',
    'sec.': 'section',
    
    // Units
    'km': 'kilometers',
    'cm': 'centimeters',
    'mm': 'millimeters',
    'mi': 'miles',
    'ft': 'feet',
    'in': 'inches',
    'kg': 'kilograms',
    'g': 'grams',
    'mg': 'milligrams',
    'lb': 'pounds',
    'oz': 'ounces',
    'L': 'liters',
    'mL': 'milliliters',
    'hr': 'hours',
    'min': 'minutes',
    'sec': 'seconds',
  };
  
  // Acronyms that should be spoken as individual letters
  const SPELLED_ACRONYMS = [
    'HTML', 'CSS', 'XML', 'JSON', 'API', 
    'HTTP', 'HTTPS', 'FTP', 'SQL', 'PHP',
    'URL', 'URI', 'DNS', 'TCP', 'IP',
    'UI', 'UX', 'CPU', 'GPU', 'RAM',
    'ROM', 'SSD', 'HDD', 'USB', 'PDF',
    'JPEG', 'PNG', 'GIF', 'MP3', 'MP4',
    'IBM', 'AWS', 'CEO', 'CFO', 'CTO',
    'DIY', 'FAQ', 'CDC', 'FDA', 'NASA',
    'CIA', 'FBI', 'IRS', 'ATM', 'PIN',
    'ASAP', 'RSVP', 'ID', 'TV',
  ];
  
  // Acronyms that should be spoken as words
  const WORD_ACRONYMS = {
    'NASA': 'NASA',
    'NATO': 'NATO',
    'NAFTA': 'NAFTA',
    'OPEC': 'OPEC',
    'DARPA': 'DARPA',
    'UNICEF': 'UNICEF',
    'UNESCO': 'UNESCO',
    'LASER': 'laser',
    'RADAR': 'radar',
    'SONAR': 'sonar',
    'SCUBA': 'scuba',
    'GIF': 'gif',
    'JPEG': 'jay peg',
    'CAPTCHA': 'captcha',
    'COVID': 'covid',
    'SaaS': 'saas',
    'STEM': 'stem',
    'STEAM': 'steam',
    'POTUS': 'POTUS',
    'SCOTUS': 'SCOTUS',
  };
  
  // Mathematical symbols and their verbal equivalents
  const MATH_SYMBOLS = {
    '+': ' plus ',
    '-': ' minus ',
    '−': ' minus ',
    '×': ' times ',
    '÷': ' divided by ',
    '*': ' times ',
    '/': ' divided by ',
    '=': ' equals ',
    '≠': ' not equal to ',
    '>': ' greater than ',
    '<': ' less than ',
    '≥': ' greater than or equal to ',
    '≤': ' less than or equal to ',
    '≈': ' approximately equal to ',
    '∞': ' infinity ',
    'π': ' pi ',
    '√': ' square root of ',
    '∑': ' sum of ',
    '∫': ' integral of ',
    '∂': ' partial derivative of ',
    '∆': ' delta ',
    '∇': ' nabla ',
    '∈': ' element of ',
    '∉': ' not an element of ',
    '∩': ' intersection ',
    '∪': ' union ',
    '⊂': ' subset of ',
    '⊃': ' superset of ',
    '∧': ' and ',
    '∨': ' or ',
    '¬': ' not ',
    '⇒': ' implies ',
    '⇔': ' if and only if ',
    '∀': ' for all ',
    '∃': ' there exists ',
    '∄': ' there does not exist ',
    '∴': ' therefore ',
    '∵': ' because ',
    '∎': ' end of proof ',
    '°': ' degrees ',
    '%': ' percent ',
    '±': ' plus or minus ',
  };
  
  // Currency symbols and their verbal equivalents
  const CURRENCY_SYMBOLS = {
    '$': 'dollars',
    '€': 'euros',
    '£': 'pounds',
    '¥': 'yen',
    '₹': 'rupees',
    '₽': 'rubles',
    '₩': 'won',
    '₿': 'bitcoin',
  };
  
  // Common programming symbols and their verbal equivalents
  const CODE_SYMBOLS = {
    '{': ' open brace ',
    '}': ' close brace ',
    '[': ' open bracket ',
    ']': ' close bracket ',
    '(': ' open parenthesis ',
    ')': ' close parenthesis ',
    '<': ' open angle bracket ',
    '>': ' close angle bracket ',
    '&&': ' and ',
    '||': ' or ',
    '!': ' not ',
    '!=': ' not equal to ',
    '==': ' equals ',
    '===': ' strictly equals ',
    '++': ' increment ',
    '--': ' decrement ',
    '+=': ' plus equals ',
    '-=': ' minus equals ',
    '*=': ' times equals ',
    '/=': ' divide equals ',
    '=>': ' arrow function ',
    '->': ' arrow ',
    '...': ' spread ',
    '.': ' dot ',
    ',': ' comma ',
    ':': ' colon ',
    ';': ' semicolon ',
    '?': ' question mark ',
    '`': ' backtick ',
    '\\': ' backslash ',
    '/': ' forward slash ',
    '|': ' pipe ',
    '@': ' at ',
    '#': ' hash ',
    '$': ' dollar ',
    '%': ' percent ',
    '^': ' caret ',
    '&': ' ampersand ',
    '*': ' asterisk ',
    '_': ' underscore ',
    '~': ' tilde ',
  };
  
  /**
   * Expands abbreviations in text
   * @param {string} text - Input text
   * @returns {string} - Text with abbreviations expanded
   */
  export function expandAbbreviations(text) {
    let result = text;
    
    // Replace each abbreviation with its expanded form
    Object.entries(ABBREVIATIONS).forEach(([abbr, expanded]) => {
      // Use word boundary for whole word matching
      const regex = new RegExp(`\\b${abbr.replace('.', '\\.')}\\b`, 'g');
      result = result.replace(regex, expanded);
      
      // Also match abbreviations without trailing dots where applicable
      if (abbr.endsWith('.')) {
        const abbrWithoutDot = abbr.slice(0, -1);
        const regexWithoutDot = new RegExp(`\\b${abbrWithoutDot}\\b(?!\\.)`, 'g');
        result = result.replace(regexWithoutDot, expanded);
      }
    });
    
    return result;
  }
  
  /**
   * Formats acronyms for speech by adding spaces between letters when appropriate
   * @param {string} text - Input text
   * @returns {string} - Text with formatted acronyms
   */
  export function formatAcronyms(text) {
    let result = text;
    
    // Format acronyms that should be spelled out
    SPELLED_ACRONYMS.forEach(acronym => {
      const regex = new RegExp(`\\b${acronym}\\b`, 'g');
      result = result.replace(regex, acronym.split('').join(' '));
    });
    
    // Replace acronyms that should be pronounced as words
    Object.entries(WORD_ACRONYMS).forEach(([acronym, pronunciation]) => {
      const regex = new RegExp(`\\b${acronym}\\b`, 'g');
      result = result.replace(regex, pronunciation);
    });
    
    return result;
  }
  
  /**
   * Converts numeric ordinals to their spoken form
   * @param {string} text - Input text
   * @returns {string} - Text with ordinals converted
   */
  export function formatOrdinals(text) {
    // Convert patterns like 1st, 2nd, 3rd, 4th to first, second, third, fourth
    return text
      .replace(/\b1st\b/g, 'first')
      .replace(/\b2nd\b/g, 'second')
      .replace(/\b3rd\b/g, 'third')
      .replace(/\b(\d+)th\b/g, '$1th'); // Keep others as-is for simplicity
  }
  
  /**
   * Formats dates for better speech
   * @param {string} text - Input text
   * @returns {string} - Text with formatted dates
   */
  export function formatDates(text) {
    // Format MM/DD/YYYY
    const dateRegex = /\b(\d{1,2})\/(\d{1,2})\/(\d{4})\b/g;
    return text.replace(dateRegex, (match, month, day, year) => {
      return `${month}/${day}/${year.split('').join(' ')}`;
    });
  }
  
  /**
   * Formats phone numbers for better speech
   * @param {string} text - Input text
   * @returns {string} - Text with formatted phone numbers
   */
  export function formatPhoneNumbers(text) {
    // Format (XXX) XXX-XXXX or XXX-XXX-XXXX
    const phoneRegex = /\(?\b(\d{3})\)?[-. ]?(\d{3})[-. ]?(\d{4})\b/g;
    return text.replace(phoneRegex, '$1 $2 $3');
  }
  
  /**
   * Converts mathematical expressions to spoken form
   * @param {string} text - Input text
   * @returns {string} - Text with math expressions converted
   */
  export function formatMathExpressions(text) {
    let result = text;
    
    // Replace common math symbols
    Object.entries(MATH_SYMBOLS).forEach(([symbol, replacement]) => {
      // Use a regex that ensures the symbol is not part of a word
      const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?<!\\w)${escapedSymbol}(?!\\w)`, 'g');
      result = result.replace(regex, replacement);
    });
    
    // Format fractions (1/2, 2/3, etc.)
    result = result.replace(/(\d+)\/(\d+)/g, (match, numerator, denominator) => {
      // Special cases for common fractions
      if (numerator === '1' && denominator === '2') return 'one half';
      if (numerator === '1' && denominator === '3') return 'one third';
      if (numerator === '2' && denominator === '3') return 'two thirds';
      if (numerator === '1' && denominator === '4') return 'one quarter';
      if (numerator === '3' && denominator === '4') return 'three quarters';
      return `${numerator} over ${denominator}`;
    });
    
    // Format exponents (x^2, 10^3, etc.)
    result = result.replace(/(\w+)\^(\d+)/g, (match, base, exponent) => {
      if (exponent === '2') return `${base} squared`;
      if (exponent === '3') return `${base} cubed`;
      return `${base} to the power of ${exponent}`;
    });
    
    return result;
  }
  
  /**
   * Formats currency expressions for better speech
   * @param {string} text - Input text
   * @returns {string} - Text with currency expressions formatted
   */
  export function formatCurrency(text) {
    let result = text;
    
    // Replace currency symbols
    Object.entries(CURRENCY_SYMBOLS).forEach(([symbol, name]) => {
      const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      
      // Format $X.XX
      result = result.replace(
        new RegExp(`${escapedSymbol}(\\d+)\\.(\\d{2})\\b`, 'g'),
        (match, dollars, cents) => {
          return `${dollars} ${name} and ${cents} cents`;
        }
      );
      
      // Format $X
      result = result.replace(
        new RegExp(`${escapedSymbol}(\\d+)(?!\\.\\d)\\b`, 'g'),
        `$1 ${name}`
      );
    });
    
    return result;
  }
  
  /**
   * Formats programming code snippets for better speech
   * @param {string} text - Input text
   * @returns {string} - Text with code snippets formatted
   */
  export function formatCodeSnippets(text) {
    // Detect code blocks delimited by backticks
    let result = text.replace(/```([^`]+)```/g, (match, code) => {
      let formattedCode = code;
      
      // Replace code symbols
      Object.entries(CODE_SYMBOLS).forEach(([symbol, replacement]) => {
        const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSymbol, 'g');
        formattedCode = formattedCode.replace(regex, replacement);
      });
      
      return `Code example: ${formattedCode}. End of code.`;
    });
    
    // Format inline code
    result = result.replace(/`([^`]+)`/g, (match, code) => {
      let formattedCode = code;
      
      // Replace code symbols
      Object.entries(CODE_SYMBOLS).forEach(([symbol, replacement]) => {
        const escapedSymbol = symbol.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedSymbol, 'g');
        formattedCode = formattedCode.replace(regex, replacement);
      });
      
      return `code: ${formattedCode}`;
    });
    
    return result;
  }
  
  /**
   * Improves rhythm and pacing for TTS by adding appropriate pauses
   * @param {string} text - Input text
   * @returns {string} - Text with improved rhythm
   */
  export function improveRhythm(text) {
    return text
      // Add pauses after end of sentences
      .replace(/([.!?])\s+/g, '$1\n\n')
      // Add minor pauses for commas, semicolons, and colons
      .replace(/([;:])\s+/g, '$1\n');
  }
  
  /**
   * Main normalization function that applies all transformations
   * @param {string} text - Input text to normalize
   * @returns {string} - Normalized text optimized for TTS
   */
  export function normalizeTextForTTS(text) {
    if (!text) return text;
    
    let result = text;
    
    // Apply each transformation in sequence
    result = expandAbbreviations(result);
    result = formatAcronyms(result);
    result = formatOrdinals(result);
    result = formatDates(result);
    result = formatPhoneNumbers(result);
    result = formatMathExpressions(result);
    result = formatCurrency(result);
    result = formatCodeSnippets(result);
    result = improveRhythm(result);
    
    return result;
  }
  
  // Export individual functions to allow selective application
  export default normalizeTextForTTS;