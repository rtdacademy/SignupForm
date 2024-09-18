import React from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

const Math30_3Formulas = ({ onInsert }) => {
  const sections = {
    'Cylinder': [
      { latex: 'A_{top} = \\pi r^2', tooltip: 'Top area of cylinder' },
      { latex: 'A_{base} = \\pi r^2', tooltip: 'Base area of cylinder' },
      { latex: 'A_{side} = 2\\pi rh', tooltip: 'Side area of cylinder' },
      { latex: 'SA = 2\\pi r^2 + 2\\pi rh', tooltip: 'Surface area of cylinder' },
      { latex: 'V = (\\text{area of base}) \\times h', tooltip: 'Volume of cylinder' },
    ],
    'Sphere': [
      { latex: 'SA = 4\\pi r^2', tooltip: 'Surface area of sphere (using radius)' },
      { latex: 'SA = \\pi d^2', tooltip: 'Surface area of sphere (using diameter)' },
      { latex: 'V = \\frac{4}{3}\\pi r^3', tooltip: 'Volume of sphere' },
    ],
    'Cone': [
      { latex: 'A_{side} = \\pi rs', tooltip: 'Side area of cone' },
      { latex: 'A_{base} = \\pi r^2', tooltip: 'Base area of cone' },
      { latex: 'SA = \\pi r^2 + \\pi rs', tooltip: 'Surface area of cone' },
      { latex: 'V = \\frac{1}{3} \\times (\\text{area of base}) \\times h', tooltip: 'Volume of cone' },
    ],
    'Square-Based Pyramid': [
      { latex: 'A_{triangle} = \\frac{1}{2}bs \\text{ (for each triangle)}', tooltip: 'Area of each triangular face' },
      { latex: 'A_{base} = b^2', tooltip: 'Base area of square pyramid' },
      { latex: 'SA = 2bs + b^2', tooltip: 'Surface area of square pyramid' },
      { latex: 'V = \\frac{1}{3} \\times (\\text{area of base}) \\times h', tooltip: 'Volume of square pyramid' },
    ],
    'Rectangular Prism': [
      { latex: 'SA = wh + wh + lw + lw + lh + lh', tooltip: 'Surface area of rectangular prism (expanded)' },
      { latex: 'SA = 2(wh + lw + lh)', tooltip: 'Surface area of rectangular prism (factored)' },
      { latex: 'V = (\\text{area of base}) \\times h', tooltip: 'Volume of rectangular prism' },
    ],
    'General Right Prism': [
      { latex: 'SA = \\text{sum of the areas of all the faces}', tooltip: 'Surface area of general right prism' },
      { latex: 'V = (\\text{area of base}) \\times h', tooltip: 'Volume of general right prism' },
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
    <Tabs defaultValue="Cylinder" className="w-full">
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

export default Math30_3Formulas;