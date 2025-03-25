import React from 'react';
import { 
  Bot, 
  Layers, 
  Shield, 
  MessageSquare, 
  Settings, 
  Share2, 
  Blocks,
  BookOpen,
  ScrollText,
  Lock,
  FolderTree
} from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";

const FeatureCard = ({ icon: Icon, title, children }) => (
  <Card className="group hover:shadow-lg transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-start gap-4">
        <div className="mt-1 p-2 rounded-lg bg-gradient-to-br from-purple-50 to-blue-50 group-hover:from-purple-100 group-hover:to-blue-100 transition-colors duration-300">
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

const StepCard = ({ number, icon: Icon, title, description, subtitle }) => (
  <div className="relative flex items-start gap-4 p-4">
    <div className="absolute top-0 left-8 w-px h-full bg-gradient-to-b from-blue-100 to-transparent -z-10" />
    <div className="shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
      <Icon className="w-8 h-8 text-blue-600" />
    </div>
    <div className="pt-2">
      <div className="text-sm font-medium text-blue-600 mb-1">Step {number}</div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-blue-600 mb-2">{subtitle}</p>}
      <p className="text-gray-600">{description}</p>
    </div>
  </div>
);

const HowItWorksSheet = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[90vw] max-w-[1200px] overflow-y-auto bg-gradient-to-br from-white to-gray-50">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            How EdBotz Works
          </SheetTitle>
          <SheetDescription>
            Learn how to use EdBotz to enhance your teaching with AI assistants
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4">
            {/* Getting Started */}
            <div className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Getting Started with EdBotz</h2>
              <div className="space-y-6">
                <StepCard
                  number="1"
                  icon={Bot}
                  title="Create an AI Assistant"
                  description="Create and customize an AI teaching assistant with specific personalities, instructions, and conversation starters."
                />
                <StepCard
                  number="2"
                  icon={MessageSquare}
                  title="Test Your Assistant"
                  description="Preview how your AI assistant will interact with students and refine its responses."
                />
                <StepCard
                  number="3"
                  icon={Share2}
                  title="Share with Students"
                  description="Generate a direct access link or embed code to share your AI assistant with your students."
                />
                <StepCard
                  number="4"
                  icon={FolderTree}
                  title="Optional: Organize Your Assistants"
                  subtitle="For teachers with multiple assistants"
                  description="Create a course structure to organize your assistants by courses, units, and lessons. This makes it easier for students to access all related assistants in one place."
                />
              </div>
            </div>

            {/* Core Features */}
            <div className="grid md:grid-cols-2 gap-6 mb-16">
              <FeatureCard icon={Bot} title="Customizable AI Assistants">
                <p>Create AI teaching assistants tailored to your needs:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Stand-alone assistants for specific subjects</li>
                  <li>Course-wide for general subject support</li>
                  <li>Unit-specific for focused topics</li>
                  <li>Lesson-specific for particular concepts</li>
                </ul>
              </FeatureCard>

              <FeatureCard icon={Settings} title="Full Configuration Control">
                <p>Customize every aspect of your AI assistants:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Personality and teaching style</li>
                  <li>Custom welcome messages</li>
                  <li>Pre-written conversation starters</li>
                  <li>Choose between standard or advanced AI models</li>
                </ul>
              </FeatureCard>

              <FeatureCard icon={Shield} title="Privacy & Security">
                <p>Built with data protection in mind:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>No student accounts required</li>
                  <li>No conversation data stored</li>
                  <li>Encrypted data transmission</li>
                  <li>Secure authentication</li>
                </ul>
              </FeatureCard>

              <FeatureCard icon={Share2} title="Easy Integration">
                <p>Multiple ways to share with students:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Generate direct access links</li>
                  <li>Embed in your LMS or website</li>
                  <li>Add to course materials</li>
                  <li>Share in assignments</li>
                </ul>
              </FeatureCard>
            </div>

            {/* Teaching Enhancement */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 mb-16">
              <h2 className="text-2xl font-bold mb-6 text-center">Enhance Your Teaching</h2>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4">
                  <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">24/7 Learning Support</h3>
                  <p className="text-gray-600">Provide continuous help for students outside of class hours.</p>
                </div>
                <div className="p-4">
                  <ScrollText className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Instant Feedback</h3>
                  <p className="text-gray-600">Help students get immediate responses to their questions.</p>
                </div>
                <div className="p-4">
                  <Layers className="w-8 h-8 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">Differentiated Learning</h3>
                  <p className="text-gray-600">Support various learning styles and paces.</p>
                </div>
              </div>
            </div>

            {/* Privacy Commitment */}
            <div className="text-center pb-8">
              <div className="inline-flex items-center justify-center p-3 rounded-full bg-green-50 mb-4">
                <Lock className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Our Privacy Commitment</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                EdBotz is designed with privacy at its core. We don't store student conversations, 
                require student accounts, or use data for training. All interactions are encrypted 
                and protected following the highest security standards.
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default HowItWorksSheet;