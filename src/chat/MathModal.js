import React, { useState, useRef } from 'react';
import { addStyles, EditableMathField } from 'react-mathquill';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardContent } from "../components/ui/card";
import Math30_1Formulas from './Math30_1Formulas';
import Math30_2Formulas from './Math30_2Formulas';
import Math30_3Formulas from './Math30_3Formulas';
import Math20_1Formulas from './Math20_1Formulas';
import Math20_2Formulas from './Math20_2Formulas';
import Math20_3Formulas from './Math20_3Formulas';
import Math10CFormulas from './Math10CFormulas';
import Math10_3Formulas from './Math10_3Formulas';
import CalculusFormulas from './CalculusFormulas';
import {
  basicButtons,
  logicalReasoningButtons,
  inequalityButtons,
  probabilityButtons,
  calculusButtons
} from './mathSymbols';

// Add MathQuill styles
addStyles();

const MathModal = ({ isOpen, onClose, onInsert, initialLatex }) => {
  const [mathLatex, setMathLatex] = useState(initialLatex);
  const [selectedCourse, setSelectedCourse] = useState('30-1');
  const mathFieldRef = useRef(null);

  if (!isOpen) return null;

  const handleInsert = () => {
    onInsert(mathLatex);
    onClose();
  };

  const insertLatex = (latex) => {
    if (mathFieldRef.current) {
      mathFieldRef.current.write(latex);
      mathFieldRef.current.focus();
    }
  };

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

  const renderLabel = (label) => {
    if (typeof label === 'string' && label.includes('\\')) {
      return renderLatex(label);
    }
    return <span className="text-xl text-gray-700">{label}</span>;
  };

  const courses = [
    { value: '10-3', label: '10-3' },
    { value: '10C', label: '10C' },
    { value: '20-3', label: '20-3' },
    { value: '20-2', label: '20-2' },
    { value: '20-1', label: '20-1' },
    { value: '30-3', label: '30-3' },
    { value: '30-2', label: '30-2' },
    { value: '30-1', label: '30-1' },
    { value: 'Calc', label: 'Calc' },
  ];

  const renderButtons = (buttons) => (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
      {buttons.map((button) => (
        <Button
          key={button.tooltip}
          onClick={() => insertLatex(button.write)}
          variant="ghost"
          className="h-auto py-2 hover:bg-gray-100 transition-colors duration-200"
          title={button.tooltip}
        >
          {renderLabel(button.label)}
        </Button>
      ))}
    </div>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <h2 className="text-lg font-bold">Insert Math Equation</h2>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="symbols" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="symbols">Symbols</TabsTrigger>
              <TabsTrigger value="equations">Equations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="symbols">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                  <TabsTrigger value="basic">Basic Math</TabsTrigger>
                  <TabsTrigger value="logical">Logical</TabsTrigger>
                  <TabsTrigger value="inequality">Inequalities</TabsTrigger>
                  <TabsTrigger value="probability">Probability</TabsTrigger>
                  <TabsTrigger value="calculus">Calculus</TabsTrigger>
                </TabsList>
                <TabsContent value="basic">{renderButtons(basicButtons)}</TabsContent>
                <TabsContent value="logical">{renderButtons(logicalReasoningButtons)}</TabsContent>
                <TabsContent value="inequality">{renderButtons(inequalityButtons)}</TabsContent>
                <TabsContent value="probability">{renderButtons(probabilityButtons)}</TabsContent>
                <TabsContent value="calculus">{renderButtons(calculusButtons)}</TabsContent>
              </Tabs>
            </TabsContent>
            
            <TabsContent value="equations">
              <Tabs value={selectedCourse} onValueChange={setSelectedCourse} className="w-full">
                <TabsList className="flex flex-wrap justify-start mb-4">
                  {courses.map((course) => (
                    <TabsTrigger 
                      key={course.value} 
                      value={course.value}
                      className="mr-1 mb-1 px-2 py-1 text-sm"
                    >
                      {course.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
             <TabsContent value="10-3">
                  <Math10_3Formulas onInsert={insertLatex} />
                </TabsContent>
                <TabsContent value="10C">
                  <Math10CFormulas onInsert={insertLatex} />
                </TabsContent>
                <TabsContent value="20-3">
                  <Math20_3Formulas onInsert={insertLatex} />
                </TabsContent>
                <TabsContent value="20-2">
                  <Math20_2Formulas onInsert={insertLatex} />
                </TabsContent> 
                <TabsContent value="20-1">
                  <Math20_1Formulas onInsert={insertLatex} />
                </TabsContent>
               <TabsContent value="30-3">
                  <Math30_3Formulas onInsert={insertLatex} />
                </TabsContent> 
                <TabsContent value="30-2">
                  <Math30_2Formulas onInsert={insertLatex} />
                </TabsContent>
                <TabsContent value="30-1">
                  <Math30_1Formulas onInsert={insertLatex} />
                </TabsContent>
                <TabsContent value="Calc">
                  <CalculusFormulas onInsert={insertLatex} />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>
          
          <div className="border border-gray-300 rounded p-2 mb-4 mt-4">
            <EditableMathField
              latex={mathLatex}
              onChange={(mathField) => {
                setMathLatex(mathField.latex());
              }}
              mathquillDidMount={(mathField) => {
                mathFieldRef.current = mathField;
              }}
              config={{
                spaceBehavesLikeTab: true,
                leftRightIntoCmdGoes: 'up',
                restrictMismatchedBrackets: true,
                supSubsRequireOperand: true,
                autoSubscriptNumerals: true,
                autoCommands: 'pi theta sqrt sum prod alpha beta gamma rho',
                autoOperatorNames: 'sin cos tan',
              }}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button onClick={onClose} variant="ghost" className="hover:bg-gray-100 transition-colors duration-200">
              Cancel
            </Button>
            <Button onClick={handleInsert} className="hover:bg-blue-600 transition-colors duration-200">
              Insert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MathModal;