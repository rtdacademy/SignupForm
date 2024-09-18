import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math30_2Formulas = ({ onInsert }) => {
  const sections = {
    'Relations': [
      { latex: 'y = a^x \\Leftrightarrow x = \\log_a y', tooltip: 'Exponential and Logarithmic Relation' },
      { latex: '\\log_b c = \\frac{\\log_a c}{\\log_a b}', tooltip: 'Change of Base Formula' },
    ],
    'Log Laws': [
      { latex: '\\log_b(M \\cdot N) = \\log_b M + \\log_b N', tooltip: 'Product Rule' },
      { latex: '\\log_b(\\frac{M}{N}) = \\log_b M - \\log_b N', tooltip: 'Quotient Rule' },
      { latex: '\\log_b(M^n) = n \\log_b M', tooltip: 'Power Rule' },
    ],
    'Exponent': [
      { latex: 'y = a \\cdot b^x', tooltip: 'Exponential Function' },
    ],
    'Sine': [
      { latex: 'y = a \\cdot \\sin(bx + c) + d', tooltip: 'Sinusoidal Function' },
      { latex: '\\text{Period} = \\frac{2\\pi}{b}', tooltip: 'Period of Sinusoidal Function' },
    ],
    'Probability': [
      { latex: 'n! = n(n - 1)(n - 2)...3 \\cdot 2 \\cdot 1', tooltip: 'Factorial' },
      { latex: '_{n}P_r = \\frac{n!}{(n - r)!}', tooltip: 'Permutation' },
      { latex: '_{n}C_r = \\frac{n!}{(n - r)!r!}', tooltip: 'Combination' },
      { latex: '_{n}C_r = \\binom{n}{r}', tooltip: 'Combination (Binomial Coefficient)' },
      { latex: 'P(A \\cup B) = P(A) + P(B)', tooltip: 'Probability of A or B (Mutually Exclusive)' },
      { latex: 'P(A \\cup B) = P(A) + P(B) - P(A \\cap B)', tooltip: 'Probability of A or B (Not Mutually Exclusive)' },
      { latex: 'P(A \\cap B) = P(A) \\cdot P(B)', tooltip: 'Probability of A and B (Independent)' },
      { latex: 'P(A \\cap B) = P(A) \\cdot P(B|A)', tooltip: 'Probability of A and B (Dependent)' },
    ],
    'Logic': [
      { latex: 'A\'', tooltip: 'Complement' },
      { latex: '\\emptyset', tooltip: 'Empty set' },
      { latex: '\\cap', tooltip: 'Intersection' },
      { latex: '\\subset', tooltip: 'Subset' },
      { latex: '\\cup', tooltip: 'Union' },
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

export default Math30_2Formulas;