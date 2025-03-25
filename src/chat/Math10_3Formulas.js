import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math10_3Formulas = ({ onInsert }) => {
  const sections = {
    'Linear Relations': [
      { latex: 'm = \\frac{rise}{run}', tooltip: 'Slope formula (rise over run)' },
      { latex: 'm = \\frac{y_2 - y_1}{x_2 - x_1}', tooltip: 'Slope formula (using coordinates)' },
    ],
    'Temperature': [
      { latex: '°F = \\frac{9}{5}°C + 32', tooltip: 'Celsius to Fahrenheit conversion' },
      { latex: '°C = \\frac{5}{9}(°F - 32)', tooltip: 'Fahrenheit to Celsius conversion' },
    ],
    'Pythagorean Theorem': [
      { latex: 'a^2 + b^2 = c^2', tooltip: 'Pythagorean theorem' },
    ],
    'Trigonometry': [
      { latex: '\\sin(\\theta) = \\frac{opp}{hyp}', tooltip: 'Sine ratio' },
      { latex: '\\cos(\\theta) = \\frac{adj}{hyp}', tooltip: 'Cosine ratio' },
      { latex: '\\tan(\\theta) = \\frac{opp}{adj}', tooltip: 'Tangent ratio' },
      { latex: '\\theta = \\sin^{-1}\\left(\\frac{opp}{hyp}\\right)', tooltip: 'Inverse sine' },
      { latex: '\\theta = \\cos^{-1}\\left(\\frac{adj}{hyp}\\right)', tooltip: 'Inverse cosine' },
      { latex: '\\theta = \\tan^{-1}\\left(\\frac{opp}{adj}\\right)', tooltip: 'Inverse tangent' },
    ],
    '2D Shapes': [
      { latex: 'A = l^2', tooltip: 'Area of a square' },
      { latex: 'P = 4l', tooltip: 'Perimeter of a square' },
      { latex: 'A = lw', tooltip: 'Area of a rectangle' },
      { latex: 'P = 2l + 2w', tooltip: 'Perimeter of a rectangle' },
      { latex: 'A = \\frac{1}{2}bh', tooltip: 'Area of a triangle' },
      { latex: 'A = \\pi r^2', tooltip: 'Area of a circle' },
      { latex: 'C = 2\\pi r', tooltip: 'Circumference of a circle' },
      { latex: 'A = bh', tooltip: 'Area of a rhombus or parallelogram' },
      { latex: 'P = 4b', tooltip: 'Perimeter of a rhombus' },
      { latex: 'P = 2b + 2s', tooltip: 'Perimeter of a parallelogram' },
    ],
    '3D Shapes': [
      { latex: 'SA = 2lw + 2lh + 2wh', tooltip: 'Surface area of a rectangular prism' },
      { latex: 'SA = A_{base} + A_{side1} + A_{side2} + A_{side3} + A_{side4}', tooltip: 'Surface area of a rectangular pyramid' },
      { latex: 'SA = 2\\pi r^2 + 2\\pi rh', tooltip: 'Surface area of a cylinder' },
      { latex: 'SA = 4\\pi r^2', tooltip: 'Surface area of a sphere' },
      { latex: 'SA = \\pi r^2 + \\pi rs', tooltip: 'Surface area of a cone' },
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
    <Tabs defaultValue="Linear Relations" className="w-full">
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

export default Math10_3Formulas;