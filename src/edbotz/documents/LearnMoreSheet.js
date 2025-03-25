import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { FolderTree, Bot, Library, BookOpen, Layout } from 'lucide-react';
import { Card, CardContent } from "../../components/ui/card";

const InfoCard = ({ icon: Icon, title, children }) => (
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

const LearnMoreSheet = ({ open, onOpenChange, topic }) => {
  if (topic !== 'location') return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Understanding Assistant Location
          </SheetTitle>
          <SheetDescription>
            Learn how to organize your AI assistants effectively within your courses
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Assistant Location helps you organize your AI assistants within your course structure. 
                While you can start using assistants immediately without setting up a course structure, 
                organizing them can make management easier as you create more assistants.
              </p>
            </div>

            <InfoCard icon={Bot} title="Standalone Assistants">
              <p>The simplest way to get started:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Create assistants without setting up any courses</li>
                <li>Perfect for trying out the platform</li>
                <li>Great for single-purpose assistants</li>
                <li>Can be shared individually with students</li>
              </ul>
            </InfoCard>

            <InfoCard icon={FolderTree} title="Course Structure Benefits">
              <p>Organizing assistants in courses provides several advantages:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Students can access all course assistants in one place</li>
                <li>Easier to manage multiple assistants</li>
                <li>Better organization for different subjects</li>
                <li>Can share entire courses with student groups</li>
              </ul>
            </InfoCard>

            <InfoCard icon={Layout} title="Organization Levels">
              <p>Three levels of organization available:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li><span className="font-medium">Course Level:</span> General assistants available throughout the entire course</li>
                <li><span className="font-medium">Unit Level:</span> Specialized assistants for specific units or topics</li>
                <li><span className="font-medium">Lesson Level:</span> Highly focused assistants for individual lessons</li>
              </ul>
            </InfoCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Pro Tip</h3>
              <p className="text-blue-700">
                Start with standalone assistants to get familiar with the platform. 
                You can always organize them into courses later as your needs grow.
              </p>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default LearnMoreSheet;