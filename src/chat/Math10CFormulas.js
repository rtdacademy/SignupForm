import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math10CFormulas = ({ onInsert }) => {
  const sections = {
    'Area and Volume': [
      { latex: 'A = lw', tooltip: 'Area of a rectangle' },
      { latex: 'A = \\frac{1}{2}bh', tooltip: 'Area of a triangle' },
      { latex: 'A = \\pi r^2', tooltip: 'Area of a circle' },
      { latex: 'V = lwh', tooltip: 'Volume of a rectangular prism' },
      { latex: 'V = \\frac{1}{3}lwh', tooltip: 'Volume of a right pyramid' },
      { latex: 'V = \\pi r^2h', tooltip: 'Volume of a cylinder' },
      { latex: 'V = \\frac{1}{3}\\pi r^2h', tooltip: 'Volume of a cone' },
      { latex: 'V = \\frac{4}{3}\\pi r^3', tooltip: 'Volume of a sphere' },
    ],
    'Surface Area': [
      { latex: 'SA = 2(lw + lh + wh)', tooltip: 'Surface area of a rectangular prism' },
      { latex: 'SA = \\frac{1}{2}(slant\\ height)(perimeter\\ of\\ base) + (area\\ of\\ base)', tooltip: 'Surface area of a right pyramid' },
      { latex: 'SA = 2\\pi rh + 2\\pi r^2', tooltip: 'Surface area of a cylinder' },
      { latex: 'SA = \\pi rs + \\pi r^2', tooltip: 'Surface area of a cone' },
      { latex: 'SA = 4\\pi r^2', tooltip: 'Surface area of a sphere' },
    ],
    'Pythagorean Theorem': [
      { latex: 'c^2 = a^2 + b^2', tooltip: 'Pythagorean theorem' },
    ],
    'Trigonometric Ratios': [
      { latex: '\\sin A = \\frac{opposite}{hypotenuse}', tooltip: 'Sine ratio' },
      { latex: '\\cos A = \\frac{adjacent}{hypotenuse}', tooltip: 'Cosine ratio' },
      { latex: '\\tan A = \\frac{opposite}{adjacent}', tooltip: 'Tangent ratio' },
    ],
    'Exponent Laws': [
      { latex: 'x^m \\times x^n = x^{m+n}', tooltip: 'Product of powers' },
      { latex: '\\frac{x^m}{x^n} = x^{m-n}', tooltip: 'Quotient of powers' },
      { latex: '(x^m)^n = x^{m \\times n}', tooltip: 'Power of a power' },
      { latex: '(xy)^m = x^m y^m', tooltip: 'Power of a product' },
      { latex: '\\left(\\frac{x}{y}\\right)^m = \\frac{x^m}{y^m}', tooltip: 'Power of a quotient' },
      { latex: 'x^0 = 1', tooltip: 'Zero exponent' },
      { latex: 'x^{-m} = \\frac{1}{x^m}', tooltip: 'Negative exponent' },
      { latex: 'x^\\frac{m}{n} = \\sqrt[n]{x^m}', tooltip: 'Fractional exponent' },
    ],
    'Linear Functions': [
      { latex: 'slope = \\frac{rise}{run}', tooltip: 'Slope formula (rise over run)' },
      { latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}', tooltip: 'Slope formula (using coordinates)' },
      { latex: 'slope = \\frac{\\Delta y}{\\Delta x}', tooltip: 'Slope formula (using delta notation)' },
      { latex: 'y = mx + b', tooltip: 'Slope-intercept form' },
      { latex: 'Ax + By + C = 0', tooltip: 'General form' },
      { latex: 'Ax + By = C', tooltip: 'Standard form' },
      { latex: '(y - y_1) = m(x - x_1)', tooltip: 'Point-slope form' },
    ],
  };

  const renderLatex = (latex) => {
    try {
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
    } catch (error) {
      console.error('Error rendering LaTeX:', error);
      return <span>Error rendering formula</span>;
    }
  };

  const handleInsert = (latex) => {
    onInsert({ write: latex });
  };

  return (
    <Tabs defaultValue="Area and Volume" className="w-full">
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
            {Array.isArray(formulas) && formulas.map((formula, index) => (
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

export default Math10CFormulas;