import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { UserCheck, Sparkles, MessageCircle, Target, Brain, Shield } from 'lucide-react';
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

const ExampleCard = ({ title, content }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
    <h4 className="font-semibold text-blue-800 mb-2">{title}</h4>
    <div className="text-blue-700 whitespace-pre-line">
      {content}
    </div>
  </div>
);

const InstructionsSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'instructions') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Assistant Personality & Instructions
          </SheetTitle>
          <SheetDescription>
            Learn how to shape your assistant's personality and behavior through effective instructions
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                The personality and instructions you provide shape how your assistant interacts with students. 
                These instructions act as a core framework for the assistant's behavior, teaching approach, 
                and communication style.
              </p>
            </div>

            <FeatureCard icon={UserCheck} title="Key Personality Components">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Teaching style and approach</li>
                <li>Communication tone and manner</li>
                <li>Level of formality</li>
                <li>Response structure preferences</li>
                <li>Subject-specific expertise and focus</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={Target} title="Essential Instructions Elements">
              <p className="mb-3">Effective instructions should include:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Clear definition of the assistant's role</li>
                <li>Specific teaching methodologies to use</li>
                <li>How to handle different types of questions</li>
                <li>Level of detail in explanations</li>
                <li>When to provide hints vs. complete solutions</li>
                <li>How to encourage critical thinking</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={Brain} title="Comprehensive Example">
              <ExampleCard
                title="Math Teaching Assistant Instructions"
                content={`You are a supportive and patient math teaching assistant specializing in high school algebra and calculus. Your primary role is to guide students through problem-solving while promoting understanding, not just providing answers.

Key Characteristics:
• Encouraging and positive, especially when students struggle
• Patient and willing to explain concepts multiple ways
• Focused on building problem-solving skills
• Clear and precise in mathematical explanations

Teaching Approach:
1. Always ask students to share their current understanding
2. Break complex problems into smaller steps
3. Use analogies and real-world examples when helpful
4. Provide guided hints before full solutions
5. Encourage students to verify their own answers

When students are stuck:
• Ask guiding questions to help them identify the issue
• Reference relevant formulas or concepts
• Show similar examples when appropriate
• Celebrate progress and breakthrough moments

Response Structure:
• Start with acknowledgment of the student's question
• Provide clear, step-by-step explanations
• Include visual aids or diagrams when helpful
• End with verification questions to check understanding

Remember to:
• Maintain a positive, encouraging tone
• Focus on building confidence
• Praise good thinking and effort
• Correct misconceptions gently
• Keep explanations age-appropriate`}
              />
            </FeatureCard>

            <FeatureCard icon={MessageCircle} title="Impact on Student Interaction">
              <p>Well-crafted instructions ensure your assistant:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Maintains consistent behavior across conversations</li>
                <li>Adapts responses to student needs</li>
                <li>Promotes active learning and engagement</li>
                <li>Builds student confidence and understanding</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={Shield} title="Important Boundaries">
              <p>Include clear guidelines about:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>What types of help the assistant can/cannot provide</li>
                <li>How to handle inappropriate requests</li>
                <li>When to refer students to human teachers</li>
                <li>Maintaining academic integrity</li>
              </ul>
            </FeatureCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tips</h3>
              <ul className="text-blue-700 space-y-2">
                <li>Be as specific as possible in your instructions</li>
                <li>Include examples of ideal responses</li>
                <li>Update instructions based on actual student interactions</li>
                <li>Consider different learning styles in your approach</li>
                <li>Test the assistant's responses to various scenarios</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default InstructionsSheet;