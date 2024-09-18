import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math30_1Formulas = ({ onInsert }) => {
  const sections = {
    'Relations': [
      { latex: 'y = ax^2 + bx + c', tooltip: 'Quadratic Function' },
      { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', tooltip: 'Quadratic Formula' },
      { latex: 'y = af[b(x - h)] + k', tooltip: 'General Form of a Transformed Function' },
      { latex: 'y = ab^{\\frac{t}{p}}', tooltip: 'Growth/Decay Formula' },
    ],
    'Log Laws': [
      { latex: '\\log_b(M \\times N) = \\log_b M + \\log_b N', tooltip: 'Log Product Rule' },
      { latex: '\\log_b(\\frac{M}{N}) = \\log_b M - \\log_b N', tooltip: 'Log Quotient Rule' },
      { latex: '\\log_b(M^n) = n \\log_b M', tooltip: 'Log Power Rule' },
      { latex: '\\log_b c = \\frac{\\log_a c}{\\log_a b}', tooltip: 'Log Change of Base' },
    ],
    'Perm/Comb': [
      { latex: 'n! = n(n-1)(n-2)...3 \\times 2 \\times 1', tooltip: 'Factorial' },
      { latex: '_{n}P_r = \\frac{n!}{(n-r)!}', tooltip: 'Permutation' },
      { latex: '_{n}C_r = \\frac{n!}{(n-r)!r!} = \\binom{n}{r}', tooltip: 'Combination' },
      { latex: 't_{k+1} = _{n}C_k x^{n-k} y^k', tooltip: 'General Term of (x + y)^n' },
    ],
    'Trig': [
      { latex: '\\theta = \\frac{s}{r}', tooltip: 'Radian Measure' },
      { latex: '\\tan \\theta = \\frac{\\sin \\theta}{\\cos \\theta}', tooltip: 'Tangent' },
      { latex: '\\cot \\theta = \\frac{\\cos \\theta}{\\sin \\theta}', tooltip: 'Cotangent' },
      { latex: '\\csc \\theta = \\frac{1}{\\sin \\theta}', tooltip: 'Cosecant' },
      { latex: '\\sec \\theta = \\frac{1}{\\cos \\theta}', tooltip: 'Secant' },
      { latex: '\\sin^2 \\theta + \\cos^2 \\theta = 1', tooltip: 'Pythagorean Identity' },
      { latex: '1 + \\tan^2 \\theta = \\sec^2 \\theta', tooltip: 'Tangent Identity' },
      { latex: '1 + \\cot^2 \\theta = \\csc^2 \\theta', tooltip: 'Cotangent Identity' },
      { latex: '\\sin(\\alpha + \\beta) = \\sin \\alpha \\cos \\beta + \\cos \\alpha \\sin \\beta', tooltip: 'Sine Addition' },
      { latex: '\\cos(\\alpha + \\beta) = \\cos \\alpha \\cos \\beta - \\sin \\alpha \\sin \\beta', tooltip: 'Cosine Addition' },
      { latex: '\\tan(\\alpha + \\beta) = \\frac{\\tan \\alpha + \\tan \\beta}{1 - \\tan \\alpha \\tan \\beta}', tooltip: 'Tangent Addition' },
      { latex: '\\sin(2\\alpha) = 2 \\sin \\alpha \\cos \\alpha', tooltip: 'Double Angle Sine' },
      { latex: '\\cos(2\\alpha) = \\cos^2 \\alpha - \\sin^2 \\alpha', tooltip: 'Double Angle Cosine' },
      { latex: '\\tan(2\\alpha) = \\frac{2 \\tan \\alpha}{1 - \\tan^2 \\alpha}', tooltip: 'Double Angle Tangent' },
      { latex: 'y = a \\sin[b(x - c)] + d', tooltip: 'Transformed Sine Function' },
      { latex: 'y = a \\cos[b(x - c)] + d', tooltip: 'Transformed Cosine Function' },
    ],
  };

  const renderLatex = (latex) => {
    return (
      <span
        dangerouslySetInnerHTML={{
          __html: katex.renderToString(latex, {
            throwOnError: false,
            displayMode: false,
            strict: false,
          })
        }}
      />
    );
  };

  return (
    <Tabs defaultValue="Relations" className="w-full">
      <TabsList className="flex flex-wrap justify-start mb-4">
        {Object.keys(sections).map((section) => (
          <TabsTrigger key={section} value={section} className="mr-1 mb-1 px-2 py-1 text-sm">
            {section}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(sections).map(([section, formulas]) => (
        <TabsContent key={section} value={section}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {formulas.map((formula, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-2">
                  <Button
                    onClick={() => onInsert(formula.latex)}
                    variant="ghost"
                    className="w-full h-auto py-1 px-1 text-sm"
                    title={formula.tooltip}
                  >
                    {renderLatex(formula.latex)}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default Math30_1Formulas;