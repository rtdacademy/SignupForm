// mathSymbols.js

import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

// Helper function to render LaTeX using KaTeX
const renderLatex = (latex) => {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(latex, {
          throwOnError: false,
          displayMode: false,
          strict: false,
        }),
      }}
    />
  );
};

// Basic Math Buttons
export const basicButtons = [
  {
    label: renderLatex('\\frac{a}{b}'),
    cmd: '\\frac',
    tooltip: 'Fraction',
  },
  {
    label: renderLatex('a^b'),
    cmd: '^',
    tooltip: 'Exponent',
  },
  {
    label: renderLatex('a_b'),
    cmd: '_',
    tooltip: 'Subscript',
  },
  {
    label: renderLatex('\\sqrt{x}'),
    cmd: '\\sqrt',
    tooltip: 'Square Root',
  },
  {
    label: renderLatex('\\sqrt[n]{x}'),
    cmd: '\\nthroot',
    tooltip: 'Nth Root',
  },
  {
    label: renderLatex('\\infty'),
    cmd: '\\infty',
    tooltip: 'Infinity',
  },
  {
    label: renderLatex('\\left| x \\right|'),
    write: '|',
    tooltip: 'Absolute Value',
  },
  {
    label: renderLatex('\\left\\{ x \\right\\}'),
    cmd: '{',
    tooltip: 'Braces',
  },
  {
    label: renderLatex('\\left( x \\right)'),
    cmd: '(',
    tooltip: 'Parentheses',
  },
  {
    label: renderLatex('\\log(x)'),
    cmd: '\\log',
    tooltip: 'Logarithm',
  },
  {
    label: renderLatex('\\log_n(x)'),
    write: '\\log_{}\\left(\\right)',
    tooltip: 'Logarithm with Base n',
  },
  {
    label: renderLatex('\\pi'),
    cmd: '\\pi',
    tooltip: 'Pi',
  },
  {
    label: renderLatex('\\theta'),
    cmd: '\\theta',
    tooltip: 'Theta',
  },
  {
    label: renderLatex('\\to'),
    cmd: '\\to',
    tooltip: 'Arrow',
  },
  {
    label: renderLatex('\\times'),
    cmd: '\\times',
    tooltip: 'Multiplication',
  },
  {
    label: renderLatex('\\div'),
    cmd: '\\div',
    tooltip: 'Division',
  },
];

// Inequality Buttons
export const inequalityButtons = [
  {
    label: renderLatex('\\geq'),
    cmd: '\\geq',
    tooltip: 'Greater Than or Equal To',
  },
  {
    label: renderLatex('>'),
    cmd: '>',
    tooltip: 'Greater Than',
  },
  {
    label: renderLatex('\\leq'),
    cmd: '\\leq',
    tooltip: 'Less Than or Equal To',
  },
  {
    label: renderLatex('<'),
    cmd: '<',
    tooltip: 'Less Than',
  },
  {
    label: renderLatex('\\neq'),
    cmd: '\\neq',
    tooltip: 'Not Equal To',
  },
];

// Logical Reasoning Buttons
export const logicalReasoningButtons = [
  {
    label: renderLatex('{ }^{\\prime}'),
    write: '{}^{\\prime}',
    tooltip: 'Complement',
  },
  {
    label: renderLatex('\\emptyset'),
    cmd: '\\emptyset',
    tooltip: 'Empty Set',
  },
  {
    label: renderLatex('\\cap'),
    cmd: '\\cap',
    tooltip: 'Intersection',
  },
  {
    label: renderLatex('\\subset'),
    cmd: '\\subset',
    tooltip: 'Subset',
  },
  {
    label: renderLatex('\\cup'),
    cmd: '\\cup',
    tooltip: 'Union',
  },
  {
    label: renderLatex('\\in'),
    cmd: '\\in',
    tooltip: 'Element of',
  },
  {
    label: renderLatex('\\notin'),
    cmd: '\\notin',
    tooltip: 'Not an Element of',
  },
];



// Probability Buttons
export const probabilityButtons = [

  {
    label: renderLatex('\\in'),
    cmd: '\\in',
    tooltip: 'Element of',
  },
  {
    label: renderLatex('_{n}P_{r}'),
    write: '_{}P_{}',
    tooltip: 'Permutation',
  },
  {
    label: renderLatex('_{n}C_{r}'),
    write: '_{}C_{}',
    tooltip: 'Combination',
  },
  {
    label: renderLatex('\\binom{n}{r}'),
    cmd: '\\binom',
    tooltip: 'Binomial Coefficient',
  },
  {
    label: renderLatex('\\small{P(A \\cup B)}'),
    write: 'P\\left(A\\cup B\\right)',
    tooltip: 'Probability of A Union B',
  },
  {
    label: renderLatex('\\small{P(A \\cap B)}'),
    write: 'P\\left(A\\cap B\\right)',
    tooltip: 'Probability of A Intersection B',
  },
  {
    label: renderLatex('\\small{P(B|A)}'),
    write: 'P\\left(B|A\\right)',
    tooltip: 'Conditional Probability',
  },
];

// Calculus Buttons
export const calculusButtons = [
  {
    label: renderLatex('\\lim_{x \\to a}'),
    write: '\\lim_{x\\to}',
    tooltip: 'Limit as x Approaches a',
  },
  {
    label: renderLatex('\\lim_{x \\to a^+}'),
    write: '\\lim_{x\\to{}^+}',
    tooltip: 'Limit as x Approaches a from the Right',
  },
  {
    label: renderLatex('\\lim_{x \\to a^-}'),
    write: '\\lim_{x\\to{}^-}',
    tooltip: 'Limit as x Approaches a from the Left',
  },
  {
    label: renderLatex('\\int'),
    cmd: '\\int',
    tooltip: 'Integral',
  },
  {
    label: renderLatex('\\int_a^b'),
    write: '\\int_{}^{}',
    tooltip: 'Definite Integral',
  },
  {
    label: renderLatex('\\frac{d}{dx}'),
    write: '\\frac{d}{dx}',
    tooltip: 'Derivative with Respect to x',
  },
  {
    label: renderLatex('\\frac{d}{d\\theta}'),
    write: '\\frac{d}{d\\theta}',
    tooltip: 'Derivative with Respect to θ',
  },
  {
    label: renderLatex('\\sum'),
    cmd: '\\sum',
    tooltip: 'Summation',
  },
];