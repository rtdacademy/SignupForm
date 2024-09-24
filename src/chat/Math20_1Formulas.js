import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math20_1Formulas = ({ onInsert }) => {
  const sections = {
    'Quadratic Functions': [
      { latex: 'y = ax^2 + bx + c', tooltip: 'Function (expanded form)' },
      { latex: 'y = a(x-r)(x-h)', tooltip: 'Function (factored form)' },
      { latex: 'y = a(x - h)^2 + k', tooltip: 'Function (vertex form)' },
      { latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}', tooltip: 'Quadratic Formula' },
    ],
    'Algebra and Number': [
      { latex: '|x| = \\begin{cases} x & \\text{if } x \\geq 0 \\\\ -x & \\text{if } x < 0 \\end{cases}', tooltip: 'Absolute Value' },
    ],
    'Arithmetic Sequences': [
      { latex: 't_n = t_1 + (n-1)d', tooltip: 'General term' },
      { latex: 'S_n = \\frac{n}{2}[2t_1 + (n-1)d]', tooltip: 'Arithmetic Series' },
      { latex: 'S_n = \\frac{n}{2}[t_1 + t_n]', tooltip: 'Arithmetic Series: Alternate Formula' },
    ],
    'Geometric Sequences': [
      { latex: 't_n = t_1 \\times r^{n-1}', tooltip: 'General term' },
      { latex: 'S_n = \\frac{t_1(r^n - 1)}{r - 1}, r \\neq 1', tooltip: 'Geometric Series' },
      { latex: 'S_n = \\frac{r \\times t_n - t_1}{r - 1}, r \\neq 1', tooltip: 'Geometric Series: Alternate formula' },
      { latex: 'S_\\infty = \\frac{t_1}{1-r}, |r| < 1', tooltip: 'Infinite Geometric Series' },
    ],
    'Trigonometry': [
      { latex: '\\sin \\theta = \\frac{y}{r}', tooltip: 'Sine' },
      { latex: '\\cos \\theta = \\frac{x}{r}', tooltip: 'Cosine' },
      { latex: '\\tan \\theta = \\frac{y}{x}', tooltip: 'Tangent' },
      { latex: 'x^2 + y^2 = r^2', tooltip: 'Pythagorean Identity' },
      { latex: '\\frac{a}{\\sin A} = \\frac{b}{\\sin B} = \\frac{c}{\\sin C}', tooltip: 'Sine Law' },
      { latex: 'a^2 = b^2 + c^2 - 2bc \\cos A', tooltip: 'Cosine Law' },
      { latex: '\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}', tooltip: 'Cosine Law (Angle form)' },
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

  const handleInsert = (latex) => {
    onInsert({ write: latex });
  };

  return (
    <Tabs defaultValue="Quadratic Functions" className="w-full">
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
                    onClick={() => handleInsert(formula.latex)}
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

export default Math20_1Formulas;