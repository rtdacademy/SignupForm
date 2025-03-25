import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math20_2Formulas = ({ onInsert }) => {
  const sections = {
    'Perimeter and Area': [
      { latex: 'C = 2\\pi r', tooltip: 'Circumference of a circle' },
      { latex: 'A = \\pi r^2', tooltip: 'Area of a circle' },
      { latex: 'A = \\frac{b \\times h}{2}', tooltip: 'Area of a triangle' },
      { latex: 'A = b \\times h', tooltip: 'Area of a parallelogram' },
      { latex: 'A = h \\left( \\frac{b_1 + b_2}{2} \\right)', tooltip: 'Area of a trapezoid' },
    ],
    'Surface Area': [
      { latex: 'SA = 4\\pi r^2', tooltip: 'Surface area of a sphere' },
      { latex: 'SA = 2\\pi r^2 + 2\\pi rh', tooltip: 'Surface area of a cylinder' },
      { latex: 'SA = \\pi r^2 + \\pi rs', tooltip: 'Surface area of a cone' },
    ],
    'Volume': [
      { latex: 'V = \\pi r^2 h', tooltip: 'Volume of a cylinder' },
      { latex: 'V = L \\times W \\times H', tooltip: 'Volume of a rectangular prism' },
    ],
    'Trigonometry': [
      { latex: '\\sin A = \\frac{a}{c}', tooltip: 'Sine ratio' },
      { latex: '\\cos A = \\frac{b}{c}', tooltip: 'Cosine ratio' },
      { latex: '\\tan A = \\frac{a}{b}', tooltip: 'Tangent ratio' },
      { latex: '\\frac{\\sin A}{a} = \\frac{\\sin B}{b} = \\frac{\\sin C}{c}', tooltip: 'Sine Law' },
      { latex: 'a^2 = b^2 + c^2 - 2bc(\\cos A)', tooltip: 'Cosine Law' },
      { latex: '\\cos A = \\frac{b^2 + c^2 - a^2}{2bc}', tooltip: 'Cosine Law (angle form)' },
    ],
    'Conversions': [
      { latex: '2.2 \\text{ lbs} = 1 \\text{ kg}', tooltip: 'Pounds to kilograms' },
      { latex: '4.54 \\text{ L} = 1 \\text{ gallon}', tooltip: 'Liters to gallons' },
      { latex: '1.609 \\text{ km} = 1 \\text{ mile}', tooltip: 'Kilometers to miles' },
      { latex: '2.54 \\text{ cm} = 1 \\text{ inch}', tooltip: 'Centimeters to inches' },
    ],
    'Geometry': [
      { latex: '\\text{Sum of angles} = 180n - 360', tooltip: 'Sum of angles in a polygon' },
      { latex: '\\text{Each angle} = \\frac{180n - 360}{n}', tooltip: 'Measure of each angle in a regular polygon' },
    ],
    'Quadratics': [
      { latex: 'ax^2 + bx + c = 0', tooltip: 'General form of a quadratic equation' },
      { latex: 'y = a(x - p)^2 + q', tooltip: 'Vertex form of a quadratic function' },
      { latex: 'y = a(x - r)(x - s)', tooltip: 'Factored form of a quadratic function' },
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
    <Tabs defaultValue="Perimeter and Area" className="w-full">
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

export default Math20_2Formulas;