import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { MessageSquare, Link, List, Lightbulb, BookOpen, CheckSquare } from 'lucide-react';
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

const MessageToStudentsSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'messageToStudents') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Message to Students
          </SheetTitle>
          <SheetDescription>
            Learn how to write effective messages that help students get the most out of their AI assistant
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                The Message to Students is your opportunity to provide clear guidance on how students 
                should interact with the AI assistant. This message appears before students start 
                their conversation, setting expectations and providing important context.
              </p>
            </div>

            <FeatureCard icon={MessageSquare} title="Key Message Components">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Purpose of the assistant and how it can help</li>
                <li>Guidelines for effective interaction</li>
                <li>What types of questions to ask</li>
                <li>Any specific rules or limitations</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={BookOpen} title="Example Messages">
              <div className="space-y-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800 font-medium mb-2">Math Assistant:</p>
                  <p className="text-blue-700">
                    "Welcome to your Math Helper! This assistant can help you work through math problems 
                    step-by-step. For best results:<br/>
                    • Share your complete problem<br/>
                    • Show any work you've already done<br/>
                    • Ask for explanations when needed<br/>
                    Remember: The assistant is here to help you learn, not just give answers."
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <p className="text-purple-800 font-medium mb-2">Writing Assistant:</p>
                  <p className="text-purple-700">
                    "This writing assistant can help you improve your essays and writing skills. 
                    Feel free to:<br/>
                    • Share drafts for feedback<br/>
                    • Ask for help with structure and flow<br/>
                    • Get suggestions for stronger vocabulary<br/>
                    • Review grammar and punctuation"
                  </p>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard icon={Link} title="Using Rich Content Features">
              <p>Make your message more effective with advanced formatting:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Use <strong>bold text</strong> for important points</li>
                <li>Create bulleted lists for clear steps</li>
                <li>Add links to resources or examples</li>
                <li>Structure content with headings</li>
                <li>Embed images to illustrate concepts</li>
                <li>Include YouTube videos for demonstrations</li>
              </ul>
              <div className="bg-purple-50 p-4 rounded-lg mt-3 border border-purple-200">
                <h4 className="text-purple-700 font-semibold mb-2">Rich Content Example:</h4>
                <pre className="text-xs bg-white p-3 rounded overflow-x-auto border border-purple-100">
{`<div>
  <h3 style="font-weight: bold">How to Use This Chemistry Assistant</h3>
  <p>This assistant can help with:</p>
  <ul style="margin-left: 20px">
    <li>Chemical equations</li>
    <li>Understanding molecular structures</li>
    <li>Lab safety procedures</li>
  </ul>
  <p>Visit our <a href="https://example.com/lab-safety">safety guidelines</a> before conducting any experiments.</p>
  <p>You can upload images of your work or chemical structures for specific feedback.</p>
</div>`}
                </pre>
              </div>
            </FeatureCard>

            <FeatureCard icon={CheckSquare} title="Best Practices">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Keep instructions clear and concise</li>
                <li>Highlight specific examples of good questions</li>
                <li>Include any relevant links to course materials</li>
                <li>Set clear expectations about response times</li>
                <li>Explain any subject-specific requirements</li>
              </ul>
            </FeatureCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tips</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• Update your message based on common student questions</li>
                <li>• Include examples of both good and less effective ways to interact</li>
                <li>• Consider adding a brief troubleshooting section</li>
                <li>• Mention any specific limitations or boundaries</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default MessageToStudentsSheet;