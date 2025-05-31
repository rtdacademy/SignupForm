import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Button } from '../../../components/ui/button';
import { RefreshCw, Maximize2, Minimize2 } from 'lucide-react';

// Import components that will be available to the dynamic components
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../assessments/AIMultipleChoiceQuestion';
import AILongAnswerQuestion from '../assessments/AILongAnswerQuestion';

const LivePreviewPanel = ({ 
  jsxCode, 
  courseProps = {},
  autoRefresh = true,
  refreshDelay = 800,
  onError,
  onSuccess 
}) => {
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(Date.now());
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  // Transform JSX code to executable React component
  const transformAndCreateComponent = useCallback(async (code) => {
    if (!code || !code.trim()) {
      setDynamicComponent(null);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Check if Babel is available (loaded by uiGenerated.js)
      if (!window.Babel) {
        throw new Error('Babel not loaded. Please ensure the page has fully loaded.');
      }

      // Transform JSX to React.createElement
      const transformed = window.Babel.transform(code, {
        presets: [
          ['react', { 
            runtime: 'classic',
            pragma: 'React.createElement'
          }]
        ],
        plugins: []
      });

      let processedCode = transformed.code;

      // Remove import/export statements
      const lines = processedCode.split('\n');
      const cleanLines = lines.filter(line => {
        const trimmed = line.trim();
        return !trimmed.startsWith('import ') && 
               !trimmed.startsWith('export ') && 
               !trimmed.startsWith('//');
      });
      processedCode = cleanLines.join('\n');

      // Extract component name
      const componentNameMatch = processedCode.match(/const\s+(\w+)\s*=|function\s+(\w+)\s*\(/);
      const componentName = componentNameMatch?.[1] || componentNameMatch?.[2];
      
      if (!componentName) {
        throw new Error('Could not find component name. Make sure you define a component like: const MyComponent = ({ props }) => { ... }');
      }

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
      onSuccess?.();
      
    } catch (err) {
      console.error('Preview transformation error:', err);
      setError(err.message);
      setDynamicComponent(null);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  }, [onError, onSuccess]);

  // Auto-refresh with debounce
  useEffect(() => {
    if (!autoRefresh) return;

    const timeoutId = setTimeout(() => {
      transformAndCreateComponent(jsxCode);
    }, refreshDelay);

    return () => clearTimeout(timeoutId);
  }, [jsxCode, autoRefresh, refreshDelay, transformAndCreateComponent]);

  // Manual refresh
  const handleManualRefresh = useCallback(() => {
    transformAndCreateComponent(jsxCode);
  }, [jsxCode, transformAndCreateComponent]);

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
            variant="outline"
            size="sm"
            onClick={handleManualRefresh}
            disabled={loading}
            className="h-8"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
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
                Fix the JSX syntax and the preview will update automatically.
              </small>
            </AlertDescription>
          </Alert>
        )}

        {!jsxCode?.trim() && !loading && (
          <div className="flex items-center justify-center h-full text-center">
            <div className="text-gray-500">
              <div className="text-4xl mb-2">👨‍💻</div>
              <p className="text-lg font-medium">Start Writing JSX</p>
              <p className="text-sm">Your component will appear here in real-time</p>
            </div>
          </div>
        )}

        {DynamicComponent && !error && (
          <ErrorBoundary>
            <div className="min-h-full">
              <DynamicComponent {...defaultProps} />
            </div>
          </ErrorBoundary>
        )}

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
        {autoRefresh ? (
          <span>🔄 Auto-refresh enabled ({refreshDelay}ms delay)</span>
        ) : (
          <span>🔄 Manual refresh mode</span>
        )}
        {lastUpdate && (
          <span className="ml-4">Last updated: {new Date(lastUpdate).toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
};

export default LivePreviewPanel;