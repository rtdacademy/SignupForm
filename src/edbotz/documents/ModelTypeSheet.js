import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Zap, Sparkles, Shield, Scale, Gauge, Clock } from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";
import { AI_MODEL_MAPPING } from '../utils/settings';

const ModelFeatureCard = ({ icon: Icon, title, children }) => (
  <Card className="bg-gradient-to-br from-white to-gray-50">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
          <Icon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
          <div className="text-gray-600 space-y-2">
            {children}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const ModelComparisonCard = ({ modelType, icon: Icon }) => {
  const model = AI_MODEL_MAPPING[modelType];
  return (
    <Card className="bg-gradient-to-br from-white to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="mt-1 p-2 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50">
            <Icon className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2 text-gray-900">
              {model.label}
              <span className="text-sm font-normal text-gray-500 ml-2">({model.name})</span>
            </h3>
            <p className="text-gray-600">{model.description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ModelTypeSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'modelSelection') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Understanding AI Model Selection
          </SheetTitle>
          <SheetDescription>
            Learn about the different AI models available and how to choose the right one for your needs
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Choosing the right AI model is crucial for creating effective teaching assistants. 
                Each model offers different capabilities and performance characteristics to suit various educational needs.
              </p>
            </div>

            <div className="space-y-4">
              <ModelComparisonCard modelType="standard" icon={Zap} />
              <ModelComparisonCard modelType="advanced" icon={Sparkles} />
            </div>

            <ModelFeatureCard icon={Scale} title="When to Choose Standard Model">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Quick responses for common educational queries</li>
                <li>Efficient handling of multiple student interactions</li>
                <li>Basic explanations and problem-solving</li>
                <li>Cost-effective for regular classroom use</li>
              </ul>
            </ModelFeatureCard>

            <ModelFeatureCard icon={Gauge} title="When to Choose Advanced Model">
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Complex subject matter requiring in-depth analysis</li>
                <li>Advanced problem-solving with detailed explanations</li>
                <li>Specialized technical or academic discussions</li>
                <li>Projects requiring highest quality responses</li>
              </ul>
            </ModelFeatureCard>

            <ModelFeatureCard icon={Clock} title="Performance Considerations">
              <p>Key factors to consider when selecting a model:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Complexity of your subject matter</li>
                <li>Expected response time needs</li>
                <li>Number of simultaneous users</li>
                <li>Resource allocation and budget</li>
              </ul>
            </ModelFeatureCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tip</h3>
              <p className="text-blue-700">
                Start with Gemini 2.0 Flash-Lite for most teaching scenarios. If you find your students need more 
                sophisticated responses or deeper analysis, consider upgrading to Gemini 2.0 Flash.
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ModelTypeSheet;