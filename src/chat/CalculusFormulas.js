import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import Math30_1Formulas from './Math30_1Formulas';

const CalculusFormulas = ({ onInsert }) => {
  const sections = {
    'Basics': [
      { latex: 'a^3 + b^3 = (a + b)(a^2 - ab + b^2)', tooltip: 'Sum of Cubes' },
      { latex: 'a^3 - b^3 = (a - b)(a^2 + ab + b^2)', tooltip: 'Difference of Cubes' },
      { latex: 'y = mx + b', tooltip: 'Slope-Intercept Form' },
      { latex: 'y - y_1 = m(x - x_1)', tooltip: 'Point-Slope Form' },
      { latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}', tooltip: 'Slope Formula' },
      { latex: 'd = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}', tooltip: 'Distance Formula' },
    ],
    'Limits': [
      { latex: 'm = \\lim_{x \\to a} \\frac{f(x) - f(a)}{x - a}', tooltip: 'Definition of Derivative' },
      { latex: 'm = \\lim_{h \\to 0} \\frac{f(a + h) - f(a)}{h}', tooltip: 'Alternative Definition of Derivative' },
      { latex: '\\lim_{x \\to 0} \\frac{\\sin x}{x} = 1', tooltip: 'Limit of sin(x)/x' },
      { latex: '\\lim_{x \\to 0} \\frac{x}{\\sin x} = 1', tooltip: 'Limit of x/sin(x)' },
      { latex: '\\lim_{x \\to 0} \\frac{\\cos x - 1}{x} = 0', tooltip: 'Limit involving cos(x)' },
    ],
    'Derivatives': [
      { latex: '\\frac{d}{dx}[x^n] = nx^{n-1}', tooltip: 'Power Rule' },
      { latex: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)', tooltip: 'Chain Rule' },
      { latex: '\\frac{d}{dx}[f(x) \\cdot g(x)] = f\'(x)g(x) + f(x)g\'(x)', tooltip: 'Product Rule' },
      { latex: '\\frac{d}{dx}[\\frac{f(x)}{g(x)}] = \\frac{f\'(x)g(x) - f(x)g\'(x)}{[g(x)]^2}', tooltip: 'Quotient Rule' },
      { latex: '\\frac{d}{dx}[\\sin x] = \\cos x', tooltip: 'Derivative of sin(x)' },
      { latex: '\\frac{d}{dx}[\\cos x] = -\\sin x', tooltip: 'Derivative of cos(x)' },
      { latex: '\\frac{d}{dx}[\\tan x] = \\sec^2 x', tooltip: 'Derivative of tan(x)' },
      { latex: '\\frac{d}{dx}[e^x] = e^x', tooltip: 'Derivative of e^x' },
      { latex: '\\frac{d}{dx}[\\ln x] = \\frac{1}{x}', tooltip: 'Derivative of ln(x)' },
    ],
    'Integrals': [
      { latex: '\\int x^n dx = \\frac{1}{n+1}x^{n+1} + C', tooltip: 'Power Rule for Integration' },
      { latex: '\\int \\sin x dx = -\\cos x + C', tooltip: 'Integral of sin(x)' },
      { latex: '\\int \\cos x dx = \\sin x + C', tooltip: 'Integral of cos(x)' },
      { latex: '\\int e^x dx = e^x + C', tooltip: 'Integral of e^x' },
      { latex: '\\int \\frac{1}{x} dx = \\ln |x| + C', tooltip: 'Integral of 1/x' },
      { latex: '\\int f(g(x))g\'(x)dx = \\int f(u)du', tooltip: 'U-Substitution Rule' },
    ],
    'Applications': [
      { latex: 'A = \\int_a^b f(x) dx', tooltip: 'Area Under a Curve' },
      { latex: 'V = \\pi \\int_a^b [f(x)]^2 dx', tooltip: 'Volume of Revolution (Disk Method)' },
      { latex: 'L = \\int_a^b \\sqrt{1 + [f\'(x)]^2} dx', tooltip: 'Arc Length' },
      { latex: 'y = y_0 + \\int_a^x f(t) dt', tooltip: 'Fundamental Theorem of Calculus' },
    ],
    'Math 30-1': {
      component: Math30_1Formulas,
    },
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
    <Tabs defaultValue="Basics" className="w-full">
      <TabsList className="flex flex-wrap justify-start mb-4">
        {Object.keys(sections).map((section) => (
          <TabsTrigger key={section} value={section} className="mr-1 mb-1 px-2 py-1 text-sm">
            {section}
          </TabsTrigger>
        ))}
      </TabsList>
      {Object.entries(sections).map(([section, content]) => (
        <TabsContent key={section} value={section}>
          {content.component ? (
            <content.component onInsert={onInsert} />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {content.map((formula, index) => (
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
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CalculusFormulas;