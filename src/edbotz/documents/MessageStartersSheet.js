import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { MessageSquare, Target, List, Lightbulb, BookOpen, PenTool } from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";

const FeatureCard = ({ icon: Icon, title, children }) => (
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

const ExampleStartersCard = ({ subject, starters }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
    <h4 className="font-semibold text-blue-800 mb-2">{subject}</h4>
    <ul className="text-blue-700 space-y-2">
      {starters.map((starter, index) => (
        <li key={index}>• {starter}</li>
      ))}
    </ul>
  </div>
);

const MessageStartersSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'messageStarters') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Message Starters
          </SheetTitle>
          <SheetDescription>
            Learn how to create effective message starters that help students begin productive conversations
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Message starters are pre-written prompts that help students begin their conversation 
                with the AI assistant. They guide students toward productive interactions and demonstrate 
                effective ways to ask for help.
              </p>
            </div>

            <FeatureCard icon={Target} title="Purpose of Message Starters">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Help students overcome initial hesitation</li>
                <li>Model effective ways to ask questions</li>
                <li>Guide students toward productive interactions</li>
                <li>Save time by providing common starting points</li>
                <li>Ensure clear communication from the start</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={MessageSquare} title="Example Message Starters">
              <div className="space-y-4">
                <ExampleStartersCard 
                  subject="Math Assistant"
                  starters={[
                    "Can you help me solve this math problem? I'll share it with you.",
                    "I need help understanding the concept of [topic]. Can you explain it?",
                    "Can you check my work and tell me if I made any mistakes?",
                    "I'm stuck on this problem. Can you give me a hint to get started?"
                  ]}
                />
                
                <ExampleStartersCard 
                  subject="Writing Assistant"
                  starters={[
                    "Can you review my essay introduction and provide feedback?",
                    "I need help organizing my ideas for a paper about [topic].",
                    "Can you help me make my writing more engaging?",
                    "I'd like help with proper citation format for my sources."
                  ]}
                />

                <ExampleStartersCard 
                  subject="Science Assistant"
                  starters={[
                    "Can you explain how [scientific process] works?",
                    "I need help understanding this lab experiment.",
                    "Can you help me review key concepts for my upcoming test?",
                    "I'd like to explore real-world applications of [topic]."
                  ]}
                />
              </div>
            </FeatureCard>

            <FeatureCard icon={PenTool} title="Writing Effective Starters">
              <p>Good message starters should:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Be specific but adaptable</li>
                <li>Encourage detailed responses</li>
                <li>Focus on common student needs</li>
                <li>Use clear, straightforward language</li>
                <li>Promote active learning</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={List} title="Categories to Consider">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Concept explanation requests</li>
                <li>Problem-solving help</li>
                <li>Work verification and feedback</li>
                <li>Study guidance and review</li>
                <li>Real-world applications</li>
                <li>Step-by-step walkthrough requests</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={Lightbulb} title="Things to Avoid">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Yes/no questions</li>
                <li>Overly complex or lengthy prompts</li>
                <li>Vague or unclear requests</li>
                <li>Prompts that encourage passive learning</li>
                <li>Questions that might confuse the AI</li>
              </ul>
            </FeatureCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tips</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• Create 4-6 diverse starters to cover different needs</li>
                <li>• Update starters based on common student questions</li>
                <li>• Include both basic and advanced interaction examples</li>
                <li>• Test starters to ensure they generate helpful responses</li>
                <li>• Consider adding subject-specific vocabulary</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MessageStartersSheet;