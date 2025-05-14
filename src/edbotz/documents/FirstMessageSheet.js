import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { MessageSquare, Sparkles, Heart, Target, Lightbulb, CheckSquare } from 'lucide-react';
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

const ExampleMessage = ({ title, message }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
    <h4 className="font-semibold text-blue-800 mb-2">{title}</h4>
    <p className="text-blue-700">{message}</p>
  </div>
);

const FirstMessageSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'firstMessage') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            First Message
          </SheetTitle>
          <SheetDescription>
            Learn how to create an engaging first message that welcomes students and sets the right tone
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                The first message is your assistant's opening line in every new chat. It sets the tone 
                for the interaction and helps students feel comfortable and ready to engage.
              </p>
              <p className="text-blue-600 mt-2 font-medium bg-blue-50 p-3 rounded-lg">
                You can now use rich text formatting in your first message! Use bold, italics, lists, images, YouTube videos 
                and other formatting options to create an engaging and visually appealing welcome message for your students.
              </p>
              <div className="bg-purple-50 p-4 rounded-lg mt-3 border border-purple-200">
                <h4 className="text-purple-700 font-semibold mb-2">Rich Content Example:</h4>
                <pre className="text-xs bg-white p-3 rounded overflow-x-auto border border-purple-100">
{`<div>
  <h3 style="font-weight: bold">Welcome to Science Lab!</h3>
  <p>I can help with:</p>
  <ul style="margin-left: 20px">
    <li>Understanding scientific concepts</li>
    <li>Explaining experimental procedures</li>
    <li>Solving physics and chemistry problems</li>
  </ul>
  <p>Check out this <a href="https://example.com/resources">resource page</a> for additional materials.</p>
  <p>What would you like to explore today?</p>
</div>`}
                </pre>
              </div>
            </div>

            <FeatureCard icon={Target} title="Key Elements">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Warm and welcoming tone</li>
                <li>Clear introduction of the assistant's role</li>
                <li>Brief mention of how the assistant can help</li>
                <li>Invitation to start the conversation</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={MessageSquare} title="Example Messages">
              <div className="space-y-4">
                <ExampleMessage 
                  title="Math Assistant"
                  message="Hi there! I'm your Math Helper, and I'm here to assist you with algebra, geometry, and calculus. Whether you need help solving problems, understanding concepts, or checking your work, I'm happy to help! What would you like to work on today?"
                />
                
                <ExampleMessage 
                  title="Writing Coach"
                  message="Hello! I'm your Writing Coach, ready to help you improve your writing skills. I can assist with essays, creative writing, grammar, and more. Feel free to share your work or ask questions about any writing topic. What would you like to focus on?"
                />

                <ExampleMessage 
                  title="Science Tutor"
                  message="Welcome! I'm your Science Assistant, here to help you explore and understand scientific concepts. Whether you're studying biology, chemistry, or physics, I can help explain ideas, work through problems, or discuss experiments. What scientific topic shall we explore today?"
                />

                <ExampleMessage 
                  title="Resource Guide (with Link Example)"
                  message="Hello! I'm your Resource Guide. I can help you find the right study materials and references for your coursework. Check out our learning portal for additional resources. Feel free to ask me about any specific materials you need for your studies!"
                />
              </div>
            </FeatureCard>

            <FeatureCard icon={CheckSquare} title="Best Practices">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Keep it concise (2-3 sentences is ideal)</li>
                <li>Use friendly, approachable language</li>
                <li>Clearly state the assistant's capabilities</li>
                <li>End with an open-ended question</li>
                <li>Match the tone to your subject matter</li>
                <li>Use text formatting for emphasis when needed</li>
                <li>Organize content with lists for greater clarity</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={Heart} title="Elements of a Great First Message">
              <div className="space-y-2">
                <p className="font-medium">A strong first message includes:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Personalized greeting</li>
                  <li>Clear introduction of the assistant's role</li>
                  <li>Brief overview of how they can help</li>
                  <li>Encouraging tone</li>
                  <li>Invitation to engage</li>
                  <li>Links to relevant resources (optional)</li>
                </ul>
                <p className="text-blue-600 text-sm mt-2">
                  You can add clickable links using the link button in the rich text editor.
                </p>
              </div>
            </FeatureCard>

            <FeatureCard icon={Lightbulb} title="Things to Avoid">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Overly long or complex introductions</li>
                <li>Technical jargon in the opening message</li>
                <li>Overwhelming students with too many options</li>
                <li>Rigid or formal language</li>
                <li>Closed-ended questions</li>
              </ul>
            </FeatureCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tips</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• Test your message with different types of students</li>
                <li>• Adjust based on actual student responses</li>
                <li>• Consider your student age group when setting the tone</li>
                <li>• Include a specific example of how to start</li>
                <li>• Keep it positive and encouraging</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FirstMessageSheet;