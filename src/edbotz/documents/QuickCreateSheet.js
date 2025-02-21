import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Sparkles, MessageSquare, Wand2, PenTool, Bot, Lightbulb } from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";

const ExampleCard = ({ icon: Icon, title, children }) => (
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

const QuickCreateSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'aiDescription') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Quick Create with AI
          </SheetTitle>
          <SheetDescription>
            Learn how to use AI to quickly create customized teaching assistants
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Quick Create with AI helps you build teaching assistants by describing what you want in plain language. 
                Instead of manually configuring each setting, AI will generate a complete assistant configuration based 
                on your description.
              </p>
            </div>

            <ExampleCard icon={Wand2} title="How It Works">
              <ol className="list-decimal list-inside space-y-2">
                <li>You provide a description of the teaching assistant you want to create</li>
                <li>AI analyzes your description and generates appropriate configurations</li>
                <li>The generated settings are automatically filled into the form</li>
                <li>You can review and edit any of the generated content before saving</li>
              </ol>
            </ExampleCard>

            <ExampleCard icon={PenTool} title="Writing Good Descriptions">
              <p className="mb-3">Include these elements in your description:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Subject or topic area (e.g., math, writing, science)</li>
                <li>Teaching level (e.g., elementary, high school, college)</li>
                <li>Personality traits (e.g., patient, encouraging, analytical)</li>
                <li>Special focus areas or teaching approaches</li>
              </ul>
            </ExampleCard>

            <ExampleCard icon={MessageSquare} title="Example Descriptions">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">Math Tutor Example:</p>
                  <p className="text-blue-700">
                    "I need a friendly math tutor assistant for high school algebra. 
                    It should be patient, good at breaking down complex problems into simple steps, 
                    and encourage students to think through solutions. The assistant should use 
                    real-world examples and provide positive reinforcement."
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 font-medium mb-2">Writing Coach Example:</p>
                  <p className="text-purple-700">
                    "Create a writing coach assistant for college students. It should help with 
                    essay structure, provide feedback on writing style, and suggest improvements 
                    for clarity and flow. Make it encouraging but also direct in its feedback."
                  </p>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard icon={Bot} title="What Gets Generated">
              <p>The AI will create:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>A clear, descriptive assistant name</li>
                <li>Detailed personality and teaching instructions</li>
                <li>An engaging first message to students</li>
                <li>Relevant conversation starters</li>
              </ul>
            </ExampleCard>

            <ExampleCard icon={Lightbulb} title="Tips for Best Results">
              <ul className="list-disc list-inside space-y-2">
                <li>Be specific about the subject matter and teaching level</li>
                <li>Describe desired personality traits and teaching style</li>
                <li>Mention any specific approaches or methodologies</li>
                <li>Include any special requirements or considerations</li>
              </ul>
            </ExampleCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tip</h3>
              <p className="text-blue-700">
                After generating, review each field and make adjustments to fine-tune the assistant 
                to your exact needs. The AI-generated content is a starting point that you can customize 
                further.
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default QuickCreateSheet;