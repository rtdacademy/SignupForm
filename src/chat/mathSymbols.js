import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

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

export const basicButtons = [
  { label: renderLatex('\\frac{a}{b}'), write: '\\frac', tooltip: 'Fraction' },
  { label: renderLatex('a^b'), write: '^', tooltip: 'Exponent' },
  { label: renderLatex('a_b'), write: '_', tooltip: 'Subscript' },
  { label: renderLatex('\\sqrt{x}'), write: '\\sqrt', tooltip: 'Square Root' },
  { label: renderLatex('\\sqrt[n]{x}'), write: '\\sqrt[ ]{ }', tooltip: 'Nth Root' },
  { label: renderLatex('\\infty'), write: '\\infty', tooltip: 'Infinity' },
  { label: renderLatex('\\left| x \\right|'), write: '\\left|  \\right|', tooltip: 'Absolute Value' },
  { label: renderLatex('\\left\\{ x \\right\\}'), write: '\\left\\{  \\right\\}', tooltip: 'Braces' },
  { label: renderLatex('\\left( x \\right)'), write: '\\left(  \\right)', tooltip: 'Parentheses' },
  { label: renderLatex('\\log(x)'), write: '\\log( )', tooltip: 'Log' },
  { label: renderLatex('\\log_n(x)'), write: '\\log_{ }( )', tooltip: 'Log Base n' },
  { label: renderLatex('\\pi'), write: '\\pi', tooltip: 'Pi' },
  { label: renderLatex('\\theta'), write: '\\theta', tooltip: 'Theta' },
  { label: renderLatex('\\to'), write: '\\to', tooltip: 'Arrow' },
  { label: renderLatex('\\times'), write: '\\times', tooltip: 'Multiplication' },
  { label: renderLatex('\\div'), write: '\\div', tooltip: 'Division' },
];

export const logicalReasoningButtons = [
  { label: renderLatex('A^{\\prime}'), write: 'A^{\\prime}', tooltip: 'Complement' },
  { label: renderLatex('\\emptyset'), write: '\\emptyset', tooltip: 'Empty set' },
  { label: renderLatex('\\cap'), write: '\\cap', tooltip: 'Intersection' },
  { label: renderLatex('\\subset'), write: '\\subset', tooltip: 'Subset' },
  { label: renderLatex('\\cup'), write: '\\cup', tooltip: 'Union' },
  { label: renderLatex('\\in'), write: '\\in', tooltip: 'Element of' },
  { label: renderLatex('\\notin'), write: '\\notin', tooltip: 'Not an element of' },
  { label: renderLatex('\\not\\subset'), write: '\\not\\subset', tooltip: 'Not a subset' },
];

export const inequalityButtons = [
  { label: renderLatex('\\geq'), write: '\\geq', tooltip: 'Greater than or equal to' },
  { label: renderLatex('>'), write: '>', tooltip: 'Greater than' },
  { label: renderLatex('\\leq'), write: '\\leq', tooltip: 'Less than or equal to' },
  { label: renderLatex('<'), write: '<', tooltip: 'Less than' },
  { label: renderLatex('\\neq'), write: '\\neq', tooltip: 'Not equal to' },
];

export const probabilityButtons = [
  { label: renderLatex('n!'), write: 'n!', tooltip: 'Factorial' },
  { label: renderLatex('\\in'), write: '\\in', tooltip: 'Element of' },
  { label: renderLatex('_{n}P_{r}'), write: '_{n}P_{r}', tooltip: 'Permutation' },
  { label: renderLatex('_{n}C_{r}'), write: '_{n}C_{r}', tooltip: 'Combination' },
  { label: renderLatex('\\binom{n}{r}'), write: '\\binom{n}{r}', tooltip: 'Binomial Coefficient' },
  { label: renderLatex('P(A \\cup B)'), write: 'P(A \\cup B)', tooltip: 'Probability of A union B' },
  { label: renderLatex('P(A \\cap B)'), write: 'P(A \\cap B)', tooltip: 'Probability of A intersection B' },
  { label: renderLatex('P(B|A)'), write: 'P(B|A)', tooltip: 'Conditional Probability' },
];

export const calculusButtons = [
  { label: renderLatex('\\lim_{x \\to a}'), write: '\\lim_{x \\to a}', tooltip: 'Limit as x approaches a' },
  { label: renderLatex('\\lim_{x \\to a^+}'), write: '\\lim_{x \\to a^+}', tooltip: 'Limit as x approaches a from the right' },
  { label: renderLatex('\\lim_{x \\to a^-}'), write: '\\lim_{x \\to a^-}', tooltip: 'Limit as x approaches a from the left' },
  { label: renderLatex('\\int'), write: '\\int', tooltip: 'Integral' },
  { label: renderLatex('\\int_a^b'), write: '\\int_a^b', tooltip: 'Definite Integral' },
  { label: renderLatex('\\frac{d}{dx}'), write: '\\frac{d}{dx}', tooltip: 'Derivative with respect to x' },
  { label: renderLatex('\\frac{d}{d\\theta}'), write: '\\frac{d}{d\\theta}', tooltip: 'Derivative with respect to theta' },
  { label: renderLatex('\\sum'), write: '\\sum', tooltip: 'Summation' },
];

