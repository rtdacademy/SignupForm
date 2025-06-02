import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Code, Copy, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../../../components/hooks/use-toast';

const CodeExamplesPreview = ({ code, imports = [], props = {}, metadata = {} }) => {
  const [copiedSection, setCopiedSection] = useState(null);
  const { toast } = useToast();

  const handleCopy = async (text, section) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
      toast({
        title: "Copied!",
        description: `${section} copied to clipboard`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    }
  };

  // Format the code for better readability
  const formattedCode = useMemo(() => {
    try {
      // Basic formatting - in production you might use a proper formatter
      return code
        .replace(/;\s*\n/g, ';\n')
        .replace(/{\s*\n/g, '{\n')
        .replace(/}\s*\n/g, '}\n')
        .trim();
    } catch (error) {
      return code;
    }
  }, [code]);

  // Extract component info from code
  const componentInfo = useMemo(() => {
    const componentMatch = code.match(/const\s+(\w+)\s*=\s*\(/);
    const propsMatch = code.match(/\({\s*([^}]+)\s*}\)/);
    
    return {
      name: componentMatch ? componentMatch[1] : 'Component',
      props: propsMatch ? propsMatch[1].split(',').map(p => p.trim()) : []
    };
  }, [code]);

  return (
    <div className="h-full overflow-auto p-4 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Metadata Card */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              Example Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-1">Component Name</p>
                <p className="font-medium">{componentInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Category</p>
                <Badge variant="outline">{metadata.category || 'Uncategorized'}</Badge>
              </div>
              {metadata.difficulty && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Difficulty</p>
                  <Badge 
                    variant="outline"
                    className={
                      metadata.difficulty === 'beginner' ? 'bg-green-100 text-green-800' :
                      metadata.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }
                  >
                    {metadata.difficulty}
                  </Badge>
                </div>
              )}
              {metadata.tags && metadata.tags.length > 0 && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {metadata.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Preview Tabs */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Code className="h-5 w-5" />
              Code Structure
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="imports" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="imports">Imports</TabsTrigger>
                <TabsTrigger value="component">Component</TabsTrigger>
                <TabsTrigger value="props">Props</TabsTrigger>
              </TabsList>
              
              <TabsContent value="imports" className="mt-4">
                {imports.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600">Required imports for this component:</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(imports.join('\n'), 'Imports')}
                      >
                        {copiedSection === 'Imports' ? (
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy All
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{imports.join('\n')}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No imports required for this component
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
              
              <TabsContent value="component" className="mt-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-gray-600">Full component code:</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopy(formattedCode, 'Component')}
                    >
                      {copiedSection === 'Component' ? (
                        <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4 mr-1" />
                      )}
                      Copy Code
                    </Button>
                  </div>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                    <pre className="text-sm">
                      <code>{formattedCode}</code>
                    </pre>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="props" className="mt-4">
                {Object.keys(props).length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm text-gray-600">Component configuration:</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleCopy(JSON.stringify(props, null, 2), 'Props')}
                      >
                        {copiedSection === 'Props' ? (
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                        ) : (
                          <Copy className="h-4 w-4 mr-1" />
                        )}
                        Copy Props
                      </Button>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                      <pre className="text-sm">
                        <code>{JSON.stringify(props, null, 2)}</code>
                      </pre>
                    </div>
                  </div>
                ) : (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      This component doesn't require any special props configuration
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Usage Example */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Usage Example</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800 mb-2">To use this component in your section:</p>
              <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                <li>Copy the imports and add them to the top of your section file</li>
                <li>Copy the component code and paste it into your section</li>
                <li>Customize the props and content as needed</li>
                <li>Save your changes to see the component in action</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Component Props Documentation */}
        {componentInfo.props.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Component Props</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  This component accepts the following props:
                </p>
                <div className="bg-gray-100 rounded-lg p-3">
                  {componentInfo.props.map((prop, index) => (
                    <div key={index} className="flex items-center gap-2 py-1">
                      <Badge variant="outline" className="font-mono text-xs">
                        {prop}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CodeExamplesPreview;