export const richContentExamples = {
  'quill-editor-basic': {
    id: 'quill-editor-basic',
    title: 'Rich Text Editor with Media',
    category: 'Rich Content',
    description: 'Full-featured text editor with image and video support',
    tags: ['editor', 'rich-text', 'images', 'video', 'wysiwyg'],
    difficulty: 'intermediate',
    imports: [
      "import React, { useState } from 'react';",
      "import ReactQuill from 'react-quill';",
      "import 'react-quill/dist/quill.snow.css';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Button } from '../../../../components/ui/button';"
    ],
    code: `const RichTextEditorSection = ({ course, courseId, isStaffView, devMode }) => {
  const [content, setContent] = useState('<p>Start writing your content here...</p>');
  const [isEditing, setIsEditing] = useState(false);

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background',
    'link', 'image', 'video'
  ];

  return (
    <div className="rich-text-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            📝 Interactive Content Editor
            {isStaffView && (
              <Button 
                size="sm" 
                onClick={() => setIsEditing(!isEditing)}
                variant={isEditing ? "destructive" : "default"}
              >
                {isEditing ? 'Stop Editing' : 'Edit Content'}
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={modules}
                formats={formats}
                className="min-h-[200px]"
              />
              <div className="flex gap-2">
                <Button onClick={() => setIsEditing(false)}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RichTextEditorSection;`,
    props: {
      modules: {
        toolbar: ["headers", "formatting", "lists", "colors", "media", "clean"],
        clipboard: { matchVisual: false }
      },
      formats: ["header", "bold", "italic", "underline", "strike", "list", "bullet", "color", "background", "link", "image", "video"]
    }
  },

  'markdown-viewer': {
    id: 'markdown-viewer',
    title: 'Markdown Content Viewer',
    category: 'Rich Content',
    description: 'Display markdown content with syntax highlighting and formatting',
    tags: ['markdown', 'viewer', 'content', 'formatting'],
    difficulty: 'beginner',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';"
    ],
    code: `const MarkdownViewerSection = ({ course, courseId, isStaffView, devMode }) => {
  const [markdownContent, setMarkdownContent] = useState(\`
# Welcome to the Lesson

This is a **markdown** viewer that supports:

- Lists
- **Bold** and *italic* text
- [Links](https://example.com)
- Code blocks

\\\`\\\`\\\`javascript
const greeting = "Hello, World!";
console.log(greeting);
\\\`\\\`\\\`

> Blockquotes for important notes

## Mathematical Expressions

You can include math expressions: $E = mc^2$
\`);

  // Simple markdown to HTML converter (in production, use a proper library like marked)
  const convertMarkdownToHtml = (markdown) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br />');
  };

  return (
    <div className="markdown-viewer-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>📄 Lesson Content</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="view">
            <TabsList>
              <TabsTrigger value="view">View</TabsTrigger>
              {isStaffView && <TabsTrigger value="edit">Edit</TabsTrigger>}
            </TabsList>
            
            <TabsContent value="view" className="mt-4">
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ 
                  __html: convertMarkdownToHtml(markdownContent) 
                }}
              />
            </TabsContent>
            
            {isStaffView && (
              <TabsContent value="edit" className="mt-4">
                <textarea
                  value={markdownContent}
                  onChange={(e) => setMarkdownContent(e.target.value)}
                  className="w-full h-64 p-4 border rounded font-mono text-sm"
                  placeholder="Enter markdown content..."
                />
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default MarkdownViewerSection;`,
    props: {
      defaultContent: "# Welcome to the Lesson\n\nThis is a **markdown** viewer...",
      showEditTab: true
    }
  },

  'media-gallery': {
    id: 'media-gallery',
    title: 'Interactive Media Gallery',
    category: 'Rich Content',
    description: 'Display images and videos in an interactive gallery format',
    tags: ['gallery', 'images', 'videos', 'media', 'carousel'],
    difficulty: 'intermediate',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Button } from '../../../../components/ui/button';"
      // Note: Lucide React icons (ChevronLeft, ChevronRight, Play, Maximize2) are available globally in UiGeneratedContent
    ],
    code: `const MediaGallerySection = ({ course, courseId, isStaffView, devMode }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Example media items - in production, these would come from your database
  const mediaItems = [
    {
      type: 'image',
      url: 'https://via.placeholder.com/800x400/4F46E5/ffffff?text=Physics+Diagram+1',
      caption: 'Force and Motion Diagram',
      alt: 'Physics diagram showing force vectors'
    },
    {
      type: 'video',
      url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
      caption: 'Introduction to Quantum Mechanics',
      thumbnail: 'https://via.placeholder.com/800x400/10B981/ffffff?text=Video+Thumbnail'
    },
    {
      type: 'image',
      url: 'https://via.placeholder.com/800x400/F59E0B/ffffff?text=Chemistry+Diagram',
      caption: 'Molecular Structure',
      alt: 'Chemistry molecular structure diagram'
    }
  ];

  const currentItem = mediaItems[currentIndex];
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1));
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="media-gallery-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>🖼️ Media Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Main Display */}
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              {currentItem.type === 'image' ? (
                <img
                  src={currentItem.url}
                  alt={currentItem.alt}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="relative w-full h-full">
                  <img
                    src={currentItem.thumbnail}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Button
                      size="lg"
                      className="rounded-full w-16 h-16"
                      onClick={() => {
                        // In production, this would open the video player
                        console.log('Play video:', currentItem.url);
                      }}
                    >
                      <Play className="h-6 w-6 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
              
              {/* Navigation Buttons */}
              <Button
                variant="secondary"
                size="icon"
                className="absolute left-2 top-1/2 -translate-y-1/2"
                onClick={goToPrevious}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button
                variant="secondary"
                size="icon"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                onClick={goToNext}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Caption */}
            <div className="mt-4 text-center">
              <p className="text-sm font-medium">{currentItem.caption}</p>
              <p className="text-xs text-gray-500 mt-1">
                {currentIndex + 1} of {mediaItems.length}
              </p>
            </div>
            
            {/* Thumbnail Strip */}
            <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
              {mediaItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={\`flex-shrink-0 w-24 h-16 rounded border-2 overflow-hidden \${
                    index === currentIndex ? 'border-blue-500' : 'border-gray-200'
                  }\`}
                >
                  <img
                    src={item.type === 'image' ? item.url : item.thumbnail}
                    alt={\`Thumbnail \${index + 1}\`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MediaGallerySection;`,
    props: {
      mediaItems: "Array of media objects with type, url, caption",
      autoPlay: false,
      showThumbnails: true
    }
  },

  'collapsible-content': {
    id: 'collapsible-content',
    title: 'Collapsible Content Sections',
    category: 'Rich Content',
    description: 'Organize content in collapsible accordion-style sections',
    tags: ['accordion', 'collapsible', 'organization', 'content'],
    difficulty: 'beginner',
    imports: [
      "import React from 'react';",
      "import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../../../components/ui/accordion';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';"
    ],
    code: `const CollapsibleContentSection = ({ course, courseId, isStaffView, devMode }) => {
  const sections = [
    {
      id: 'intro',
      title: '1. Introduction to the Topic',
      content: 'This section provides an overview of the key concepts we\\'ll be covering in this lesson. Understanding these fundamentals is crucial for mastering the material.'
    },
    {
      id: 'concepts',
      title: '2. Core Concepts',
      content: 'Here we dive deep into the main concepts. Each concept builds upon the previous one, creating a comprehensive understanding of the subject matter.'
    },
    {
      id: 'examples',
      title: '3. Practical Examples',
      content: 'Real-world applications and examples help solidify your understanding. We\\'ll work through several scenarios that demonstrate these concepts in action.'
    },
    {
      id: 'practice',
      title: '4. Practice Problems',
      content: 'Test your knowledge with these practice problems. Each problem is designed to reinforce specific concepts from the lesson.'
    },
    {
      id: 'summary',
      title: '5. Summary and Key Takeaways',
      content: 'A quick recap of the most important points from this lesson. Use this section for review and quick reference.'
    }
  ];

  return (
    <div className="collapsible-content-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle>📚 Lesson Outline</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionTrigger className="text-left">
                  {section.title}
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pt-2 pb-4 px-4 bg-gray-50 rounded">
                    {section.content}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default CollapsibleContentSection;`,
    props: {
      sections: "Array of section objects with id, title, and content",
      defaultOpen: "ID of section to open by default",
      allowMultiple: false
    }
  }
};