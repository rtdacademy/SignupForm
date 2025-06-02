# Code Examples Garden Implementation Plan

## Overview
Create a comprehensive code examples system that allows teachers to quickly insert pre-built, working code examples into their lesson sections. The system will include live editing, preview functionality, and database storage.

## File Structure
```
src/FirebaseCourses/components/codeEditor/
├── CodeExamplesSheet.js              # Main sheet component
├── CodeExamplesPreview.js            # Live preview component
├── examples/
│   ├── exampleDatabase.js            # Database CRUD operations
│   ├── basicUIExamples.js            # UI component examples data
│   ├── richContentExamples.js        # QuillEditor/media examples data
│   ├── aiChatExamples.js             # GoogleAIChatApp examples data
│   └── interactiveExamples.js        # Learning-specific examples data

functions/
├── manageCodeExamples.js             # Cloud function for examples CRUD
```

## 1. Database Structure

### Firebase Realtime Database Schema
```json
{
  "codeExamples": {
    "basic-ui": {
      "card-with-tabs": {
        "id": "card-with-tabs",
        "title": "Card with Tabs Layout",
        "category": "Basic UI",
        "description": "A card component with tabbed content sections",
        "tags": ["card", "tabs", "layout"],
        "difficulty": "beginner",
        "imports": [
          "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
          "import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../../components/ui/tabs';"
        ],
        "code": "// Component code here...",
        "createdAt": "2025-01-06T10:00:00Z",
        "updatedAt": "2025-01-06T10:00:00Z",
        "createdBy": "system",
        "isPublic": true
      }
    },
    "rich-content": {
      "quill-editor-basic": {
        "id": "quill-editor-basic",
        "title": "Rich Text Editor with Image Upload",
        "category": "Rich Content",
        "description": "QuillEditor with image and video resize capabilities",
        "tags": ["editor", "rich-text", "images", "video"],
        "difficulty": "intermediate",
        "imports": [
          "import ReactQuill from 'react-quill';",
          "import 'react-quill/dist/quill.snow.css';",
          "import { ImageResize } from '../../../courses/CourseEditor/ImageResize';",
          "import { VideoResize } from '../../../courses/CourseEditor/VideoResize';"
        ],
        "code": "// QuillEditor component code...",
        "props": {
          "modules": {
            "toolbar": ["bold", "italic", "underline", "image", "video"],
            "imageResize": "true",
            "videoResize": "true"
          }
        }
      }
    },
    "ai-chat": {
      "physics-tutor": {
        "id": "physics-tutor",
        "title": "Physics AI Tutor",
        "category": "AI Chat",
        "description": "Subject-specific AI tutor for physics lessons with predefined context",
        "tags": ["ai", "chat", "physics", "tutor"],
        "difficulty": "advanced",
        "imports": [
          "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';"
        ],
        "code": "// AI Chat component code...",
        "props": {
          "instructions": "You are a physics tutor specialized in helping students understand physics concepts...",
          "firstMessage": "Hello! I'm your physics tutor. I can help you with mechanics, electricity, waves, and more!",
          "showYouTube": true,
          "showUpload": true,
          "allowContentRemoval": false,
          "showResourcesAtTop": true,
          "aiChatContext": "This is a physics lesson context..."
        }
      }
    }
  }
}
```

## 2. Cloud Function Implementation

### `functions/manageCodeExamples.js`
```javascript
const { onCall } = require('firebase-functions/v2/https');
const { logger } = require('firebase-functions');
const { getDatabase } = require('firebase-admin/database');

exports.manageCodeExamples = onCall(async (request) => {
  try {
    const { action, exampleId, categoryId, exampleData } = request.data;
    const db = getDatabase();
    const examplesRef = db.ref('codeExamples');

    switch (action) {
      case 'loadAll':
        // Load all examples grouped by category
        const snapshot = await examplesRef.get();
        return {
          success: true,
          examples: snapshot.exists() ? snapshot.val() : {}
        };

      case 'loadCategory':
        // Load examples from specific category
        const categorySnapshot = await examplesRef.child(categoryId).get();
        return {
          success: true,
          examples: categorySnapshot.exists() ? categorySnapshot.val() : {}
        };

      case 'create':
        // Create new example
        const newRef = examplesRef.child(categoryId).child(exampleId);
        await newRef.set({
          ...exampleData,
          id: exampleId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        return { success: true, message: 'Example created successfully' };

      case 'update':
        // Update existing example
        const updateRef = examplesRef.child(categoryId).child(exampleId);
        await updateRef.update({
          ...exampleData,
          updatedAt: new Date().toISOString()
        });
        return { success: true, message: 'Example updated successfully' };

      case 'delete':
        // Delete example
        await examplesRef.child(categoryId).child(exampleId).remove();
        return { success: true, message: 'Example deleted successfully' };

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    logger.error('Error in manageCodeExamples:', error);
    return { success: false, error: error.message };
  }
});
```

## 3. Frontend Components

### `CodeExamplesSheet.js` - Main Component
```javascript
import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Search, Copy, Eye, Edit, Code } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import CodeExamplesPreview from './CodeExamplesPreview';
import EnhancedCodeEditor from './EnhancedCodeEditor';

const CodeExamplesSheet = ({ 
  isOpen, 
  onOpenChange, 
  onInsertCode,
  currentSectionCode = '' 
}) => {
  const [examples, setExamples] = useState({});
  const [filteredExamples, setFilteredExamples] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('basic-ui');
  const [selectedExample, setSelectedExample] = useState(null);
  const [previewMode, setPreviewMode] = useState('code'); // 'code' | 'preview'
  const [editableCode, setEditableCode] = useState('');
  const [loading, setLoading] = useState(false);

  // Initialize cloud function
  const functions = getFunctions();
  const manageCodeExamples = httpsCallable(functions, 'manageCodeExamples');

  // Categories configuration
  const categories = [
    { id: 'basic-ui', name: 'Basic UI', icon: '🎨' },
    { id: 'rich-content', name: 'Rich Content', icon: '📝' },
    { id: 'ai-chat', name: 'AI Chat', icon: '🤖' },
    { id: 'interactive', name: 'Interactive', icon: '⚡' }
  ];

  // Load examples when sheet opens
  useEffect(() => {
    if (isOpen) {
      loadExamples();
    }
  }, [isOpen]);

  // Filter examples based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredExamples(examples);
      return;
    }

    const filtered = {};
    Object.keys(examples).forEach(categoryId => {
      const categoryExamples = examples[categoryId] || {};
      const filteredCategoryExamples = {};
      
      Object.keys(categoryExamples).forEach(exampleId => {
        const example = categoryExamples[exampleId];
        const searchLower = searchTerm.toLowerCase();
        
        if (
          example.title?.toLowerCase().includes(searchLower) ||
          example.description?.toLowerCase().includes(searchLower) ||
          example.tags?.some(tag => tag.toLowerCase().includes(searchLower))
        ) {
          filteredCategoryExamples[exampleId] = example;
        }
      });
      
      if (Object.keys(filteredCategoryExamples).length > 0) {
        filtered[categoryId] = filteredCategoryExamples;
      }
    });

    setFilteredExamples(filtered);
  }, [searchTerm, examples]);

  const loadExamples = async () => {
    try {
      setLoading(true);
      const result = await manageCodeExamples({ action: 'loadAll' });
      
      if (result.data.success) {
        setExamples(result.data.examples);
      } else {
        console.error('Failed to load examples:', result.data.error);
      }
    } catch (error) {
      console.error('Error loading examples:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExampleSelect = (example) => {
    setSelectedExample(example);
    setEditableCode(example.code);
    setPreviewMode('code');
  };

  const handleInsertCode = () => {
    if (!selectedExample) return;

    const codeToInsert = editableCode || selectedExample.code;
    const importsToAdd = selectedExample.imports || [];

    onInsertCode({
      code: codeToInsert,
      imports: importsToAdd,
      title: selectedExample.title
    });

    onOpenChange(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-6 border-b">
            <SheetTitle className="flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Examples Garden
            </SheetTitle>
            
            {/* Search */}
            <div className="relative mt-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search examples..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </SheetHeader>

          <div className="flex-1 flex min-h-0">
            {/* Examples List */}
            <div className="w-1/2 border-r overflow-hidden">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
                <TabsList className="grid grid-cols-4 m-2">
                  {categories.map(category => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                      {category.icon} {category.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {categories.map(category => (
                  <TabsContent key={category.id} value={category.id} className="flex-1 overflow-auto p-2 m-0">
                    <div className="space-y-2">
                      {Object.values(filteredExamples[category.id] || {}).map(example => (
                        <Card 
                          key={example.id}
                          className={`cursor-pointer transition-colors ${
                            selectedExample?.id === example.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleExampleSelect(example)}
                        >
                          <CardHeader className="p-3">
                            <CardTitle className="text-sm">{example.title}</CardTitle>
                            <p className="text-xs text-gray-600">{example.description}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {example.tags?.map(tag => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                              <Badge variant="outline" className="text-xs">
                                {example.difficulty}
                              </Badge>
                            </div>
                          </CardHeader>
                        </Card>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {/* Code Editor/Preview */}
            <div className="w-1/2 flex flex-col">
              {selectedExample ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b">
                    <h3 className="font-medium">{selectedExample.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedExample.description}</p>
                    
                    {/* Mode Toggle */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant={previewMode === 'code' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('code')}
                      >
                        <Code className="h-4 w-4 mr-1" />
                        Edit Code
                      </Button>
                      <Button
                        size="sm"
                        variant={previewMode === 'preview' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('preview')}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Preview
                      </Button>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-hidden">
                    {previewMode === 'code' ? (
                      <EnhancedCodeEditor
                        value={editableCode}
                        onChange={setEditableCode}
                        height="100%"
                        placeholder="Edit the example code..."
                      />
                    ) : (
                      <CodeExamplesPreview
                        code={editableCode}
                        imports={selectedExample.imports}
                        props={selectedExample.props}
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(editableCode)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Code
                      </Button>
                      
                      <Button onClick={handleInsertCode}>
                        Insert into Editor
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Select an example to get started</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CodeExamplesSheet;
```

### `CodeExamplesPreview.js` - Live Preview Component
```javascript
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';

const CodeExamplesPreview = ({ code, imports = [], props = {} }) => {
  const PreviewComponent = useMemo(() => {
    try {
      // This is a simplified preview - in production you'd want a more robust
      // code execution environment, possibly using a sandboxed iframe
      
      // For now, we'll show a static preview message
      return () => (
        <Card className="m-4">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertDescription>
                Live preview functionality would be implemented here. 
                The component would safely execute the provided code in a sandboxed environment.
              </AlertDescription>
            </Alert>
            
            <div className="mt-4 p-4 bg-gray-50 rounded">
              <h4 className="font-medium mb-2">Code to Preview:</h4>
              <pre className="text-sm overflow-auto max-h-40">
                {code}
              </pre>
            </div>
            
            {imports.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h4 className="font-medium mb-2">Required Imports:</h4>
                <pre className="text-sm">
                  {imports.join('\n')}
                </pre>
              </div>
            )}
            
            {Object.keys(props).length > 0 && (
              <div className="mt-4 p-4 bg-green-50 rounded">
                <h4 className="font-medium mb-2">Props Configuration:</h4>
                <pre className="text-sm">
                  {JSON.stringify(props, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      );
    } catch (error) {
      return () => (
        <Card className="m-4">
          <CardContent>
            <Alert variant="destructive">
              <AlertDescription>
                Error rendering preview: {error.message}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      );
    }
  }, [code, imports, props]);

  return <PreviewComponent />;
};

export default CodeExamplesPreview;
```

## 4. Example Data Files

### `examples/aiChatExamples.js`
```javascript
export const aiChatExamples = {
  'physics-tutor': {
    id: 'physics-tutor',
    title: 'Physics AI Tutor',
    category: 'AI Chat',
    description: 'Subject-specific AI tutor for physics lessons with comprehensive configuration',
    tags: ['ai', 'chat', 'physics', 'tutor', 'education'],
    difficulty: 'advanced',
    imports: [
      "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';"
    ],
    code: `const PhysicsTutorSection = ({ course, courseId, isStaffView, devMode }) => {
  const instructions = "You are a physics tutor specialized in helping students understand physics concepts. Focus on clear explanations, real-world examples, and step-by-step problem solving. Encourage questions and provide supportive feedback.";
  
  const firstMessage = "Hello! I'm your physics tutor. I can help you with mechanics, electricity, magnetism, waves, thermodynamics, and modern physics. What physics topic would you like to explore today?";
  
  const context = {
    subject: "Physics",
    gradeLevel: "High School",
    currentTopic: "Mechanics",
    courseId: courseId
  };

  const aiChatContext = "This is a physics lesson. The student is learning about fundamental physics concepts and may need help with problem-solving, understanding theory, or connecting concepts to real-world applications.";

  return (
    <div className="physics-tutor-section mb-6">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔬 Physics AI Tutor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Get personalized help with physics concepts, problem-solving, and homework questions.
          </p>
          
          <GoogleAIChatApp 
            instructions={instructions}
            firstMessage={firstMessage}
            showYouTube={true}
            showUpload={true}
            YouTubeURL="https://www.youtube.com/watch?v=ZM8ECpBuQYE"
            YouTubeDisplayName="Physics Fundamentals Overview"
            predefinedFiles={[
              "gs://your-bucket/physics-formulas.pdf",
              "gs://your-bucket/physics-reference-sheet.pdf"
            ]}
            predefinedFilesDisplayNames={{
              "gs://your-bucket/physics-formulas.pdf": "Physics Formula Reference",
              "gs://your-bucket/physics-reference-sheet.pdf": "Quick Reference Guide"
            }}
            allowContentRemoval={false}
            showResourcesAtTop={true}
            context={context}
            sessionIdentifier={\`physics-tutor-\${courseId}\`}
            aiChatContext={aiChatContext}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default PhysicsTutorSection;`,
    props: {
      instructions: "You are a physics tutor specialized in helping students understand physics concepts...",
      firstMessage: "Hello! I'm your physics tutor. I can help you with mechanics, electricity, magnetism...",
      showYouTube: true,
      showUpload: true,
      allowContentRemoval: false,
      showResourcesAtTop: true,
      aiChatContext: "This is a physics lesson context..."
    }
  },
  
  'math-helper': {
    id: 'math-helper',
    title: 'Math Problem Solver',
    category: 'AI Chat',
    description: 'AI assistant specialized in mathematics with step-by-step problem solving',
    tags: ['ai', 'chat', 'math', 'problem-solving', 'step-by-step'],
    difficulty: 'intermediate',
    imports: [
      "import { GoogleAIChatApp } from '../../../edbotz/GoogleAIChat/GoogleAIChatApp';"
    ],
    code: `const MathHelperSection = ({ course, courseId, isStaffView, devMode }) => {
  const instructions = "You are a mathematics tutor that excels at breaking down complex problems into manageable steps. Always show your work, explain reasoning, and help students understand the 'why' behind mathematical concepts.";
  
  const firstMessage = "Hi! I'm your math assistant. I can help you solve problems step-by-step, explain concepts, and practice different types of mathematical problems. What math topic can I help you with?";

  return (
    <div className="math-helper-section mb-6">
      <GoogleAIChatApp 
        instructions={instructions}
        firstMessage={firstMessage}
        showYouTube={true}
        showUpload={true}
        allowContentRemoval={true}
        showResourcesAtTop={false}
        sessionIdentifier={\`math-helper-\${courseId}\`}
        aiChatContext="Mathematics lesson - focus on problem-solving and conceptual understanding"
      />
    </div>
  );
};

export default MathHelperSection;`
  }
};
```

### `examples/richContentExamples.js`
```javascript
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

export default RichTextEditorSection;`
  }
};
```

## 5. Integration with ModernSectionEditor

### Add to ModernSectionEditor.js
```javascript
// Import the new component
import CodeExamplesSheet from './CodeExamplesSheet';

// Add state
const [showExamplesSheet, setShowExamplesSheet] = useState(false);

// Add button next to Save button (only for content sections)
{!showAssessmentConfig && selectedSectionId && (
  <div className="flex gap-2">
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowExamplesSheet(true)}
      className="h-8"
    >
      📚 Examples
    </Button>
    <Button
      onClick={handleSaveSection}
      disabled={loading || !selectedSectionId}
      size="sm"
    >
      <Save className="h-3 w-3 mr-1" />
      {loading ? 'Saving...' : 'Save'}
    </Button>
  </div>
)}

// Add the sheet component
<CodeExamplesSheet
  isOpen={showExamplesSheet}
  onOpenChange={setShowExamplesSheet}
  currentSectionCode={sectionCode}
  onInsertCode={({ code, imports, title }) => {
    // Handle code insertion
    setSectionCode(prevCode => {
      // Add imports at the top if they don't exist
      const existingImports = extractImports(prevCode);
      const newImports = imports.filter(imp => !existingImports.includes(imp));
      
      if (newImports.length > 0) {
        return newImports.join('\n') + '\n\n' + prevCode + '\n\n' + code;
      } else {
        return prevCode + '\n\n' + code;
      }
    });
    
    // Optionally update the section title if it's empty
    if (!sectionTitle.trim()) {
      setSectionTitle(title);
    }
  }}
/>
```

## 6. Seeding Initial Data

### Create a script to populate the database with initial examples
```javascript
// scripts/seedCodeExamples.js
const { initializeApp } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const { aiChatExamples } = require('../src/FirebaseCourses/components/codeEditor/examples/aiChatExamples');
const { richContentExamples } = require('../src/FirebaseCourses/components/codeEditor/examples/richContentExamples');
// Import other example files...

// Initialize Firebase Admin
initializeApp();
const db = getDatabase();

async function seedExamples() {
  try {
    const examplesRef = db.ref('codeExamples');
    
    // Seed AI Chat examples
    await examplesRef.child('ai-chat').set(aiChatExamples);
    
    // Seed Rich Content examples
    await examplesRef.child('rich-content').set(richContentExamples);
    
    // Add other categories...
    
    console.log('✅ Code examples seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding examples:', error);
    process.exit(1);
  }
}

seedExamples();
```

## 7. Next Steps for Implementation

1. **Create the cloud function** (`manageCodeExamples.js`)
2. **Implement the main sheet component** (`CodeExamplesSheet.js`)
3. **Create the preview component** with safe code execution
4. **Build example data files** for each category
5. **Integrate with ModernSectionEditor** 
6. **Seed initial examples** in the database
7. **Add advanced features** like favorites, custom categories, etc.

## 8. Future Enhancements

- **User-created examples**: Allow teachers to save their own examples
- **Sharing system**: Share examples between teachers
- **Version control**: Track changes to examples
- **Analytics**: Track which examples are most popular
- **AI-generated examples**: Use AI to create examples based on prompts
- **Export/Import**: Backup and restore example collections

This implementation provides a comprehensive, database-driven code examples system that will significantly speed up lesson development for teachers while showcasing the full capabilities of your project's technology stack.