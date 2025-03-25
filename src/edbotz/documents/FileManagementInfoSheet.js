import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "../../components/ui/sheet";
import { ScrollArea } from "../../components/ui/scroll-area";
import { 
  FileText, 
  Brain, 
  GraduationCap, 
  Lock,
  Upload,
  BookOpen,
  FileQuestion
} from 'lucide-react';
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

const SupportedFileCard = ({ type, description, formats }) => (
  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
    <h4 className="font-semibold text-blue-800 mb-2">{type}</h4>
    <p className="text-blue-700 mb-2">{description}</p>
    <div className="flex flex-wrap gap-2">
      {formats.map((format, index) => (
        <span key={index} className="px-2 py-1 bg-white/50 rounded-md text-blue-600 text-sm">
          {format}
        </span>
      ))}
    </div>
  </div>
);

const FileManagementInfoSheet = ({ open, onOpenChange }) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[95vw] sm:w-[800px] max-w-[95vw] overflow-y-auto">
        <SheetHeader className="pb-6">
          <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            File Management & Custom Knowledge Base
          </SheetTitle>
          <SheetDescription>
            Learn how to enhance your AI assistant with custom files and create a personalized knowledge base
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-8rem)]">
          <div className="pr-4 space-y-6">
            <div className="prose max-w-none">
              <p className="text-gray-600">
                Upload course materials, lecture notes, and other educational resources to create 
                a custom knowledge base for your AI assistant. This allows the assistant to provide 
                more relevant and personalized help based on your specific course content.
              </p>
            </div>

            <FeatureCard icon={Brain} title="Smart Learning From Your Files">
              <p>Your AI assistant becomes an expert on your uploaded content by:</p>
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Analyzing and understanding your course materials</li>
                <li>Learning specific terminology and concepts</li>
                <li>Referencing exact content from your materials</li>
                <li>Providing context-aware responses based on your content</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={GraduationCap} title="Benefits for Students">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Access to course-specific materials during conversations</li>
                <li>Receive answers aligned with your teaching approach</li>
                <li>Get help with assignments using relevant examples</li>
                <li>Reference course materials in real-time</li>
              </ul>
            </FeatureCard>

            <FeatureCard icon={FileText} title="Supported File Types">
              <div className="space-y-4 mt-2">
                <SupportedFileCard 
                  type="Documents"
                  description="Course materials, lecture notes, and reading materials"
                  formats={['.pdf', '.doc', '.docx', '.txt']}
                />
                
                <SupportedFileCard 
                  type="Presentations"
                  description="Lecture slides and educational presentations"
                  formats={['.ppt', '.pptx', '.pdf']}
                />

                <SupportedFileCard 
                  type="Educational Resources"
                  description="Additional learning materials and references"
                  formats={['.pdf', '.epub', '.html']}
                />
              </div>
            </FeatureCard>

            <FeatureCard icon={Lock} title="Security & Privacy">
              <ul className="list-disc list-inside mt-2 space-y-2">
                <li>Files are securely stored and encrypted</li>
                <li>Access is limited to enrolled students</li>
                <li>Content is only used for your specific assistant</li>
                <li>You maintain full control over shared materials</li>
              </ul>
            </FeatureCard>

            <div className="bg-blue-50 rounded-lg p-6 mt-6">
              <h3 className="text-lg font-semibold mb-2 text-blue-800">Best Practices</h3>
              <ul className="text-blue-700 space-y-2">
                <li>• Upload core course materials first</li>
                <li>• Include a variety of content types</li>
                <li>• Keep files organized by topic or unit</li>
                <li>• Update materials as needed throughout the course</li>
                <li>• Test the assistant's knowledge of uploaded content</li>
              </ul>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default FileManagementInfoSheet;