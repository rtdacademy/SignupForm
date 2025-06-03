import React, { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../../../components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Search, Copy, Eye, Edit, Code, Loader2 } from 'lucide-react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useToast } from '../../../components/hooks/use-toast';
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
  const [copying, setCopying] = useState(false);
  
  const { toast } = useToast();

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
        setFilteredExamples(result.data.examples);
      } else {
        console.error('Failed to load examples:', result.data.error);
        toast({
          title: "Error",
          description: "Failed to load code examples",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading examples:', error);
      toast({
        title: "Error",
        description: "Failed to load code examples",
        variant: "destructive"
      });
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

    // Clear the selected example and close the sheet
    setSelectedExample(null);
    setEditableCode('');
    onOpenChange(false);
    
    toast({
      title: "Success",
      description: `Inserted "${selectedExample.title}" into your editor`
    });
  };

  const copyToClipboard = async (text) => {
    try {
      setCopying(true);
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Code copied to clipboard"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy code",
        variant: "destructive"
      });
    } finally {
      setCopying(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-5xl p-0">
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
                placeholder="Search examples by title, description, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </SheetHeader>

          <div className="flex-1 flex min-h-0">
            {/* Examples List */}
            <div className="w-2/5 border-r overflow-hidden">
              <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="h-full flex flex-col">
                <TabsList className="grid grid-cols-4 m-2">
                  {categories.map(category => (
                    <TabsTrigger key={category.id} value={category.id} className="text-xs">
                      <span className="mr-1">{category.icon}</span>
                      <span className="hidden sm:inline">{category.name}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>

                {loading ? (
                  <div className="flex-1 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                  </div>
                ) : (
                  categories.map(category => (
                    <TabsContent key={category.id} value={category.id} className="flex-1 overflow-auto p-2 m-0">
                      <div className="space-y-2">
                        {Object.values(filteredExamples[category.id] || {}).length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p>No examples found</p>
                            {searchTerm && (
                              <p className="text-sm mt-1">Try a different search term</p>
                            )}
                          </div>
                        ) : (
                          Object.values(filteredExamples[category.id] || {}).map(example => (
                            <Card 
                              key={example.id}
                              className={`cursor-pointer transition-all ${
                                selectedExample?.id === example.id 
                                  ? 'ring-2 ring-blue-500 bg-blue-50' 
                                  : 'hover:bg-gray-50 hover:shadow-sm'
                              }`}
                              onClick={() => handleExampleSelect(example)}
                            >
                              <CardHeader className="p-3">
                                <CardTitle className="text-sm font-medium">{example.title}</CardTitle>
                                <p className="text-xs text-gray-600 mt-1">{example.description}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {example.tags?.map(tag => (
                                    <Badge key={tag} variant="secondary" className="text-xs py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {example.difficulty && (
                                    <Badge 
                                      variant="outline" 
                                      className={`text-xs py-0 ${getDifficultyColor(example.difficulty)}`}
                                    >
                                      {example.difficulty}
                                    </Badge>
                                  )}
                                </div>
                              </CardHeader>
                            </Card>
                          ))
                        )}
                      </div>
                    </TabsContent>
                  ))
                )}
              </Tabs>
            </div>

            {/* Code Editor/Preview */}
            <div className="flex-1 flex flex-col">
              {selectedExample ? (
                <>
                  {/* Header */}
                  <div className="p-4 border-b bg-gray-50">
                    <h3 className="font-medium text-lg">{selectedExample.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{selectedExample.description}</p>
                    
                    {/* Mode Toggle */}
                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        variant={previewMode === 'code' ? 'default' : 'outline'}
                        onClick={() => setPreviewMode('code')}
                      >
                        <Edit className="h-4 w-4 mr-1" />
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
                      <div className="h-full">
                        <EnhancedCodeEditor
                          value={editableCode}
                          onChange={setEditableCode}
                          height="100%"
                          placeholder="Edit the example code..."
                          language="javascript"
                          theme="vs-light"
                        />
                      </div>
                    ) : (
                      <div className="h-full overflow-auto">
                        <CodeExamplesPreview
                          code={editableCode}
                          imports={selectedExample.imports}
                          props={selectedExample.props}
                          metadata={selectedExample}
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="p-4 border-t bg-gray-50">
                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        onClick={() => copyToClipboard(editableCode)}
                        disabled={copying}
                      >
                        {copying ? (
                          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy Code
                      </Button>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setEditableCode(selectedExample.code)}
                        >
                          Reset
                        </Button>
                        <Button onClick={handleInsertCode}>
                          Insert into Editor
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <Code className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">Select an example to get started</p>
                    <p className="text-sm mt-2">Browse through categories or search for specific examples</p>
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