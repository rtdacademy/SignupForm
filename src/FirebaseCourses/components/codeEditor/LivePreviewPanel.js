import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';

// Import components that will be available to the dynamic components
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../assessments/AIMultipleChoiceQuestion';
import AILongAnswerQuestion from '../assessments/AILongAnswerQuestion';

const LivePreviewPanel = ({ 
  jsxCode, 
  courseProps = {},
  courseId,
  currentLessonInfo,
  onError,
  onSuccess 
}) => {
  console.log('🔄 LivePreviewPanel mounting/re-mounting');
  
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasRun, setHasRun] = useState(false);
  const [renderKey, setRenderKey] = useState(0);
  
  useEffect(() => {
    console.log('🎯 LivePreviewPanel mounted');
    return () => {
      console.log('💀 LivePreviewPanel unmounting');
    };
  }, []);

  // Default course props for preview
  const defaultProps = useMemo(() => ({
    course: { title: 'Preview Course' },
    courseId: 'preview',
    courseDisplay: { title: 'Preview' },
    itemConfig: { title: 'Preview Item' },
    isStaffView: true,
    devMode: true,
    ...courseProps
  }), [courseProps]);

  // Create React component directly from code (no Babel needed)
  const transformAndCreateComponent = useCallback(async (code) => {
    if (!code || !code.trim()) {
      setDynamicComponent(null);
      setError(null);
      setHasRun(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Creating component directly from code (no transformation needed)');

      // Clean up the code - remove import/export statements
      const lines = code.split('\n');
      const cleanLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('import ') && 
               !trimmed.startsWith('export ') && 
               !trimmed.startsWith('//');
      });
      const processedCode = cleanLines.join('\n');

      // Extract component name - try multiple patterns
      let componentName = null;
      
      // Try different patterns to find component name
      const patterns = [
        /const\s+(\w+)\s*=/, // const MyComponent = 
        /function\s+(\w+)\s*\(/, // function MyComponent(
        /(\w+)\s*=\s*\({/, // MyComponent = ({  (arrow function)
        /(\w+)\s*=\s*\(\s*{/, // MyComponent = ( {  (with spaces)
      ];
      
      for (const pattern of patterns) {
        const match = processedCode.match(pattern);
        if (match && match[1]) {
          componentName = match[1];
          break;
        }
      }
      
      // If still no component name found, try to extract from original code before transformation
      if (!componentName) {
        const originalMatch = code.match(/const\s+(\w+)\s*=|function\s+(\w+)\s*\(/);
        componentName = originalMatch?.[1] || originalMatch?.[2];
      }
      
      if (!componentName) {
        console.log('Could not find component name in:', processedCode.substring(0, 500));
        throw new Error('Could not find component name. Make sure you define a component like: const MyComponent = ({ props }) => { ... }');
      }
      
      console.log('Found component name:', componentName);

      // Create the component function
      const componentCode = `
        (function(React, useState, useEffect, useCallback, useMemo, Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, Badge, AIMultipleChoiceQuestion, AILongAnswerQuestion) {
          ${processedCode}
          return ${componentName};
        })
      `;

      const createComponent = eval(componentCode);
      
      const Component = createComponent(
        React,
        React.useState,
        React.useEffect,
        React.useCallback,
        React.useMemo,
        Card,
        CardContent,
        CardHeader,
        CardTitle,
        Alert,
        AlertDescription,
        Badge,
        AIMultipleChoiceQuestion,
        AILongAnswerQuestion
      );

      if (!Component || typeof Component !== 'function') {
        throw new Error('Created component is not a valid React component function');
      }

      setDynamicComponent(() => Component);
      setLastUpdate(Date.now());
      setHasRun(true);
      setRenderKey(prev => prev + 1); // Force re-render
      console.log('✅ Component set successfully, hasRun=true, Component=', Component);
      console.log('🎯 Render state:', { DynamicComponent: !!Component, error: null, hasRun: true });
      onSuccess?.();
      
    } catch (err) {
      console.error('Preview transformation error:', err);
      setError(err.message);
      setDynamicComponent(null);
      setHasRun(true);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  // Manual run/refresh - loads transformed code from database
  const handleRunCode = useCallback(async () => {
    if (!courseId || !currentLessonInfo?.contentPath) {
      setError('No lesson selected');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Load the transformed code from database
      const db = getDatabase();
      const codeRef = ref(db, `courseDevelopment/${courseId}/${currentLessonInfo.contentPath}`);
      const snapshot = await get(codeRef);
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        const transformedCode = data.code; // Use the pre-transformed code
        
        if (transformedCode) {
          console.log('Loading transformed code from database for preview');
          await transformAndCreateComponent(transformedCode);
        } else {
          throw new Error('No transformed code found in database. Please save your code first.');
        }
      } else {
        throw new Error('No code found in database. Please save your code first.');
      }
    } catch (err) {
      console.error('Error loading code for preview:', err);
      setError(err.message);
      setLoading(false);
    }
  }, [courseId, currentLessonInfo, transformAndCreateComponent]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  // Error Boundary Component
  const ErrorBoundary = ({ children }) => {
    const [hasError, setHasError] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      const handleError = (error) => {
        setHasError(true);
        setError(error.error || error);
      };

      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }, []);

    if (hasError) {
      return (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">
            <strong>Component Error:</strong> {error?.message || 'An error occurred while rendering the component'}
            <br />
            <small className="text-red-600">Check your JSX syntax and component logic.</small>
          </AlertDescription>
        </Alert>
      );
    }

    return children;
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-gray-700">Live Preview</h3>
          {loading && (
            <div className="flex items-center gap-1 text-blue-600 text-sm">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
              <span>Updating...</span>
            </div>
          )}
          {!loading && DynamicComponent && (
            <span className="text-green-600 text-sm">✓ Ready</span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleRunCode}
            disabled={loading || !jsxCode?.trim()}
            className="h-8 bg-green-600 hover:bg-green-700"
          >
            <RefreshCw className={`h-3 w-3 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Run
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8"
          >
            {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-auto p-4 bg-white">
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-4">
            <AlertDescription className="text-red-800">
              <strong>Preview Error:</strong> {error}
              <br />
              <small className="text-red-600">
                Fix the JSX syntax and click 'Run' to try again.
              </small>
            </AlertDescription>
          </Alert>
        )}

        {!hasRun && !loading && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-2">👨‍💻</div>
              <p className="text-lg font-medium">Write Your JSX Code</p>
              <p className="text-sm">Click the "Run" button to see your component preview</p>
            </div>
          </div>
        )}

        {(() => {
          console.log('🔍 Render check:', { DynamicComponent: !!DynamicComponent, error, hasRun, renderKey });
          return DynamicComponent && !error && hasRun && (
            <ErrorBoundary key={renderKey}>
              <div className="min-h-full">
                {console.log('🎨 About to render component with props:', defaultProps)}
                <DynamicComponent {...defaultProps} />
              </div>
            </ErrorBoundary>
          );
        })()}

        {loading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600">Rendering component...</p>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-2 bg-gray-50 text-xs text-gray-500">
        <span>⚡ Manual run mode - Click "Run" to preview</span>
        {lastUpdate && (
          <span className="ml-4">Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};

export default LivePreviewPanel;