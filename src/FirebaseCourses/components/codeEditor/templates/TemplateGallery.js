import React, { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle 
} from '../../../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import { ScrollArea } from '../../../../components/ui/scroll-area';
import { 
  ChevronDown, 
  ChevronRight, 
  Code, 
  Copy, 
  Check, 
  Eye,
  Palette,
  BookOpen,
  Zap
} from 'lucide-react';

// Import template collections
import * as FullLessons from './fullLessons';
import * as Components from './components';

const TemplateGallery = ({ isOpen, onOpenChange }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [copiedTemplate, setCopiedTemplate] = useState(null);
  const [previewMode, setPreviewMode] = useState('code'); // 'code' | 'preview'

  const templateCategories = [
    {
      id: 'fullLessons',
      title: 'Full Lesson Templates',
      description: 'Complete lesson structures with content and assessments',
      icon: <BookOpen className="h-4 w-4" />,
      templates: [
        {
          id: 'physics',
          name: 'Physics Lesson',
          description: 'Theory + examples + AI questions (like momentum lesson)',
          icon: '⚛️',
          code: FullLessons.physicsTemplate,
          tags: ['Physics', 'Interactive', 'AI Questions']
        },
        {
          id: 'financial',
          name: 'Financial Literacy',
          description: 'Ethics + applications + practice sections',
          icon: '💰',
          code: FullLessons.financialTemplate,
          tags: ['Finance', 'Ethics', 'Real-world']
        },
        {
          id: 'interactive',
          name: 'Interactive Demo',
          description: 'Animations + simulations + state management',
          icon: '🎮',
          code: FullLessons.interactiveTemplate,
          tags: ['Interactive', 'Animation', 'State']
        },
        {
          id: 'assessment',
          name: 'Assessment Heavy',
          description: 'Multiple AI questions and practice sections',
          icon: '📝',
          code: FullLessons.assessmentTemplate,
          tags: ['Assessment', 'AI', 'Practice']
        }
      ]
    },
    {
      id: 'components',
      title: 'Component Snippets',
      description: 'Individual components you can combine',
      icon: <Palette className="h-4 w-4" />,
      templates: [
        {
          id: 'header',
          name: 'Lesson Header',
          description: 'Title, subtitle, and badges',
          icon: '📰',
          code: Components.headerTemplate,
          tags: ['Header', 'Title', 'Layout']
        },
        {
          id: 'objectives',
          name: 'Learning Objectives',
          description: 'Checklist-style objectives card',
          icon: '🎯',
          code: Components.objectivesTemplate,
          tags: ['Objectives', 'Goals', 'Checklist']
        },
        {
          id: 'theory',
          name: 'Theory Card',
          description: 'Content card with formula box',
          icon: '📚',
          code: Components.theoryTemplate,
          tags: ['Theory', 'Content', 'Formula']
        },
        {
          id: 'examples',
          name: 'Examples Grid',
          description: '2-column examples layout',
          icon: '💡',
          code: Components.examplesTemplate,
          tags: ['Examples', 'Grid', 'Layout']
        },
        {
          id: 'interactive',
          name: 'Interactive Counter',
          description: 'useState example with buttons',
          icon: '🔢',
          code: Components.interactiveTemplate,
          tags: ['Interactive', 'State', 'Buttons']
        },
        {
          id: 'assessment',
          name: 'AI Question Slot',
          description: 'AI assessment component placeholder',
          icon: '🤖',
          code: Components.assessmentTemplate,
          tags: ['AI', 'Assessment', 'Questions']
        }
      ]
    }
  ];

  const handleCopyCode = async (template) => {
    if (!template.code) {
      console.error('No code available for this template');
      return;
    }
    
    try {
      await navigator.clipboard.writeText(template.code);
      setCopiedTemplate(template.id);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = template.code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedTemplate(template.id);
        setTimeout(() => setCopiedTemplate(null), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy also failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const TemplateCard = ({ template, category }) => (
    <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <span className="text-2xl">{template.icon}</span>
            <div>
              <CardTitle className="text-sm font-medium">{template.name}</CardTitle>
              <p className="text-xs text-gray-500 mt-1">{template.description}</p>
            </div>
          </div>
        </div>
        
        {/* Tags */}
        {template.tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.tags.map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs px-2 py-0">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setSelectedTemplate({ ...template, category })}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
          
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            onClick={() => handleCopyCode(template)}
          >
            {copiedTemplate === template.id ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1" />
                Copy
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const CodePreview = ({ code }) => {
    // Truncate very long code for preview
    const previewCode = code && code.length > 3000 
      ? code.substring(0, 3000) + '\n\n// ... (code truncated for preview)\n// Click "Copy Code" to get the full template'
      : code;
      
    return (
      <ScrollArea className="h-96 w-full border rounded-md bg-gray-900 text-gray-100">
        <pre className="p-4 text-sm font-mono">
          <code>{previewCode || 'Loading...'}</code>
        </pre>
      </ScrollArea>
    );
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="p-6 border-b">
              <SheetTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Template Gallery
              </SheetTitle>
              <p className="text-sm text-gray-600">
                Browse and copy code templates for your lessons
              </p>
            </SheetHeader>

            <div className="flex-1 overflow-hidden">
              <Tabs defaultValue="fullLessons" className="h-full">
                <div className="border-b px-6">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="fullLessons" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Full Lessons
                    </TabsTrigger>
                    <TabsTrigger value="components" className="flex items-center gap-2">
                      <Palette className="h-4 w-4" />
                      Components
                    </TabsTrigger>
                  </TabsList>
                </div>

                {templateCategories.map(category => (
                  <TabsContent 
                    key={category.id} 
                    value={category.id} 
                    className="mt-0 h-full"
                  >
                    <ScrollArea className="h-full p-6">
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          {category.icon}
                          {category.title}
                        </h3>
                        <p className="text-sm text-gray-600">{category.description}</p>
                      </div>
                      
                      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {category.templates.map(template => (
                          <TemplateCard 
                            key={template.id} 
                            template={template} 
                            category={category}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                ))}
              </Tabs>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Template Preview Modal */}
      {selectedTemplate && (
        <Sheet open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
          <SheetContent side="bottom" className="h-[80vh] p-0">
            <div className="flex flex-col h-full">
              <SheetHeader className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle className="flex items-center gap-2">
                      <span className="text-xl">{selectedTemplate.icon}</span>
                      {selectedTemplate.name}
                    </SheetTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedTemplate.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyCode(selectedTemplate)}
                    >
                      {copiedTemplate === selectedTemplate.id ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Code
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                
                {selectedTemplate.tags && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {selectedTemplate.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </SheetHeader>

              <div className="flex-1 overflow-hidden p-6">
                <CodePreview code={selectedTemplate.code} />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default TemplateGallery;