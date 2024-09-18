import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math20_3Formulas = ({ onInsert }) => {
  const sections = {
    'Finance': [
      { latex: 'I = Prt', tooltip: 'Simple interest' },
      { latex: 'A = P(1 + \\frac{r}{n})^{nt}', tooltip: 'Compound interest' },
    ],
    'Rate of Change and Trigonometry': [
      { latex: 'slope = \\frac{rise}{run}', tooltip: 'Slope formula' },
      { latex: 'tan \\Theta = \\frac{rise}{run}', tooltip: 'Tangent as slope' },
      { latex: 'slope = \\frac{y_2 - y_1}{x_2 - x_1}', tooltip: 'Slope formula using coordinates' },
      { latex: '\\Theta = tan^{-1}(\\frac{rise}{run})', tooltip: 'Angle from slope' },
      { latex: 'Grade = slope \\times 100\\%', tooltip: 'Grade as percentage' },
      { latex: 'a^2 + b^2 = c^2', tooltip: 'Pythagorean Theorem' },
      { latex: 'sin\\theta = \\frac{opposite}{hypotenuse}', tooltip: 'Sine ratio' },
      { latex: 'cos\\theta = \\frac{adjacent}{hypotenuse}', tooltip: 'Cosine ratio' },
      { latex: 'tan\\theta = \\frac{opposite}{adjacent}', tooltip: 'Tangent ratio' },
    ],
    '2-D Shapes': [
      { latex: 'P = 4s', tooltip: 'Perimeter of a square' },
      { latex: 'A = s^2', tooltip: 'Area of a square' },
      { latex: 'C = 2\\pi r', tooltip: 'Circumference of a circle' },
      { latex: 'C = \\pi d', tooltip: 'Circumference of a circle (using diameter)' },
      { latex: 'A = \\pi r^2', tooltip: 'Area of a circle' },
      { latex: 'P = 2l + 2w', tooltip: 'Perimeter of a rectangle' },
      { latex: 'A = lw', tooltip: 'Area of a rectangle' },
      { latex: 'P = s_1 + s_2 + s_3', tooltip: 'Perimeter of a triangle' },
      { latex: 'A = \\frac{1}{2}bh', tooltip: 'Area of a triangle' },
    ],
    '3-D Objects': [
      { latex: 'SA = 6s^2', tooltip: 'Surface area of a cube' },
      { latex: 'V = s^3', tooltip: 'Volume of a cube' },
      { latex: 'SA = 2lw + 2wh + 2lh', tooltip: 'Surface area of a rectangular prism' },
      { latex: 'V = lwh', tooltip: 'Volume of a rectangular prism' },
      { latex: 'SA = 4\\pi r^2', tooltip: 'Surface area of a sphere' },
      { latex: 'V = \\frac{4}{3}\\pi r^3', tooltip: 'Volume of a sphere' },
      { latex: 'SA = A_{base} + 4A_{side}', tooltip: 'Surface area of a square pyramid' },
      { latex: 'V = \\frac{1}{3}lwh', tooltip: 'Volume of a square pyramid' },
      { latex: 'SA = A_{base} + 2A_{side 1} + 2A_{side 2}', tooltip: 'Surface area of a rectangular pyramid' },
      { latex: 'V = \\frac{1}{3}lwh', tooltip: 'Volume of a rectangular pyramid' },
      { latex: 'SA = 2\\pi r^2 + 2\\pi rh', tooltip: 'Surface area of a right cylinder' },
      { latex: 'V = \\pi r^2h', tooltip: 'Volume of a right cylinder' },
      { latex: 'SA = \\pi r^2 + \\pi rs', tooltip: 'Surface area of a right cone' },
      { latex: 'V = \\frac{1}{3}\\pi r^2h', tooltip: 'Volume of a right cone' },
    ],
    'Conversions': [
      { latex: '1 \\text{ litre} = 1000 \\text{ cm}^3', tooltip: 'Litre to cubic centimeter' },
      { latex: '1 \\text{ km} = 1000 \\text{ m}', tooltip: 'Kilometer to meter' },
      { latex: '1 \\text{ m} = 100 \\text{ cm}', tooltip: 'Meter to centimeter' },
      { latex: '1 \\text{ ft} = 12 \\text{ in}', tooltip: 'Foot to inch' },
      { latex: '1 \\text{ yd} = 3 \\text{ ft}', tooltip: 'Yard to foot' },
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

  return (
    <Tabs defaultValue="Finance" className="w-full">
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

export default Math20_3Formulas;