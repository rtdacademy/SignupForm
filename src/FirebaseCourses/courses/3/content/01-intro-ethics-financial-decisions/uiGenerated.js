import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Import all the components that teachers might need
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Alert, AlertDescription } from '../../../../../components/ui/alert';
import { Badge } from '../../../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../../../../components/assessments/AIMultipleChoiceQuestion';

const UiGeneratedContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeData, setCodeData] = useState(null);

  useEffect(() => {
    const loadDynamicComponent = async () => {
      try {
        setLoading(true);
        
        // Load metadata from database
        const db = getDatabase();
        const lessonPath = itemConfig?.contentPath || '01-intro-ethics-financial-decisions';
        const metadataRef = ref(db, `courseDevelopment/${courseId}/${lessonPath}`);
        const snapshot = await get(metadataRef);
        
        if (!snapshot.exists()) {
          throw new Error('No UI-generated content found in database');
        }
        
        const data = snapshot.val();
        setCodeData(data);
        
        if (!data.enabled) {
          throw new Error('UI-generated content is disabled');
        }
        
        // Load the code using Firebase Function (bypasses CORS)
        let reactCode;
        if (data.currentFile) {
          console.log('Loading code via function:', data.currentFile);
          const functions = getFunctions();
          const loadCourseCode = httpsCallable(functions, 'loadCourseCode');
          
          try {
            const result = await loadCourseCode({
              courseId: courseId,
              lessonPath: lessonPath,
              fileName: data.currentFile
            });
            
            if (result.data.success) {
              reactCode = result.data.code;
            } else {
              throw new Error('Function returned error');
            }
          } catch (functionError) {
            console.error('Error loading from function:', functionError);
            throw new Error('Failed to load code via function');
          }
        } else {
          // Fallback for old format (if reactCode is still stored in database)
          reactCode = data.reactCode;
          if (!reactCode) {
            throw new Error('No code found in storage or database');
          }
        }
        
        // Create the dynamic component
        const component = await createDynamicComponent(reactCode);
        setDynamicComponent(() => component);
        
      } catch (err) {
        console.error('Error loading dynamic component:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadDynamicComponent();
  }, [courseId, itemConfig]);

  // Function to safely create a React component from code string
  const createDynamicComponent = async (codeString) => {
    try {
      console.log('=== Starting component creation ===');
      console.log('Code length:', codeString?.length);
      console.log('First 200 chars:', codeString?.substring(0, 200));
      
      // Check if codeString is valid
      if (!codeString || typeof codeString !== 'string') {
        console.error('Invalid code string provided:', codeString);
        throw new Error('Invalid code string provided');
      }
      
      let processedCode = codeString;
      
      // Always load Babel first to check if it works
      console.log('Loading Babel...');
      try {
        // Check if Babel is already loaded
        if (!window.Babel) {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/@babel/standalone@7/babel.min.js';
          document.head.appendChild(script);
          
          await new Promise((resolve, reject) => {
            script.onload = resolve;
            script.onerror = reject;
            // Timeout after 10 seconds
            setTimeout(() => reject(new Error('Babel load timeout')), 10000);
          });
        }
        
        if (!window.Babel) {
          throw new Error('Babel not available after loading');
        }
        
        console.log('Babel loaded successfully');
        console.log('Babel version:', window.Babel.version);
        console.log('Available presets:', Object.keys(window.Babel.availablePresets || {}));
      } catch (babelError) {
        console.error('Failed to load Babel:', babelError);
        throw new Error(`Babel loading failed: ${babelError.message}`);
      }
      
      // Transform JSX to React.createElement format
      try {
        console.log('Attempting to transform JSX with Babel...');
        console.log('Input code preview:', processedCode.substring(0, 300));
        
        const transformed = window.Babel.transform(processedCode, {
          presets: [
            ['react', { 
              runtime: 'classic',
              pragma: 'React.createElement'
            }]
          ],
          plugins: [
            ['transform-react-jsx', {
              pragma: 'React.createElement'
            }]
          ]
        });
        
        processedCode = transformed.code;
        console.log('JSX transformed successfully');
        console.log('Transformed code preview:', processedCode.substring(0, 500));
      } catch (transformError) {
        console.error('Babel JSX transformation failed:', transformError);
        console.log('Original code that failed:', processedCode.substring(0, 500));
        throw new Error(`JSX transformation failed: ${transformError.message}`);
      }
      
      // Strip out import/export statements
      processedCode = preprocessCode(processedCode);
      
      // Extract component name
      const componentName = extractComponentName(processedCode);
      if (!componentName) {
        throw new Error('Could not find component name in code');
      }
      console.log('Component name:', componentName);
      
      // Create a function that returns the component
      console.log('Creating component function...');
      let Component;
      
      try {
        // Use eval instead of Function constructor for better error messages
        const componentCode = `
          (function(React, useState, useEffect, Card, CardContent, CardHeader, CardTitle, Alert, AlertDescription, Badge, AIMultipleChoiceQuestion) {
            ${processedCode}
            return ${componentName};
          })
        `;
        
        console.log('Evaluating component code...');
        const createComponent = eval(componentCode);
        
        Component = createComponent(
          React,
          React.useState,
          React.useEffect,
          Card,
          CardContent,
          CardHeader,
          CardTitle,
          Alert,
          AlertDescription,
          Badge,
          AIMultipleChoiceQuestion
        );
      } catch (evalError) {
        console.error('Component creation failed:', evalError);
        console.error('Processed code that failed:', processedCode);
        throw new Error(`Component creation failed: ${evalError.message}`);
      }

      if (!Component || typeof Component !== 'function') {
        throw new Error('Created component is not a valid React component function');
      }

      console.log('=== Component created successfully ===');
      return Component;
    } catch (err) {
      console.error('Error in createDynamicComponent:', err);
      throw err;
    }
  };

  // Function to preprocess code by removing import statements and export statements
  const preprocessCode = (codeString) => {
    console.log('Preprocessing code...');
    const lines = codeString.split('\n');
    const processedLines = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip import statements
      if (trimmedLine.startsWith('import ') || trimmedLine.includes('require(')) {
        console.log('Skipping:', trimmedLine);
        continue;
      }
      
      // Skip export statements
      if (trimmedLine.startsWith('export default ') || trimmedLine.startsWith('export ')) {
        console.log('Skipping:', trimmedLine);
        continue;
      }
      
      // Skip comments
      if (trimmedLine.startsWith('//')) {
        console.log('Skipping comment:', trimmedLine);
        continue;
      }
      
      processedLines.push(line);
    }
    
    let result = processedLines.join('\n');
    
    // Don't replace React hooks since they're already provided as parameters
    
    console.log('Preprocessing complete. Result length:', result.length);
    return result;
  };

  // Helper to extract component name from code
  const extractComponentName = (code) => {
    console.log('Extracting component name...');
    console.log('First 500 chars of code for name extraction:', code.substring(0, 500));
    
    const patterns = [
      /const\s+(\w+)\s*=\s*\([^)]*\)\s*=>/m,
      /const\s+(\w+)\s*=\s*\({[^}]*}\)\s*=>/m,
      /function\s+(\w+)\s*\(/m,
      /const\s+(\w+)\s*=\s*function/m,
      /var\s+(\w+)\s*=\s*function/m,
      /const\s+([A-Z]\w*)\s*=/m,
      /var\s+([A-Z]\w*)\s*=/m,
      /let\s+([A-Z]\w*)\s*=/m
    ];
    
    for (const pattern of patterns) {
      const match = code.match(pattern);
      if (match && match[1]) {
        console.log('Found component name:', match[1]);
        return match[1];
      }
    }
    
    console.error('No component name found in code');
    console.error('Available patterns tested:', patterns.map(p => p.toString()));
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="ml-3">Loading UI-generated content...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            <strong>UI Generation Error:</strong> {error}
          </AlertDescription>
        </Alert>
        {devMode && codeData && (
          <div className="mt-4 p-4 bg-gray-100 rounded-md">
            <p className="text-sm text-gray-600 mb-2">
              Last modified: {new Date(codeData.metadata?.lastModified).toLocaleString()}
            </p>
            <p className="text-sm text-gray-600">
              Modified by: {codeData.metadata?.modifiedBy}
            </p>
            <details className="mt-2">
              <summary className="cursor-pointer text-sm text-blue-600">Debug Info</summary>
              <pre className="mt-2 text-xs bg-white p-2 rounded overflow-auto">
                {JSON.stringify({
                  hasReactCode: !!codeData.reactCode,
                  hasCurrentFile: !!codeData.currentFile,
                  enabled: codeData.enabled
                }, null, 2)}
              </pre>
            </details>
          </div>
        )}
      </div>
    );
  }

  if (!DynamicComponent) {
    return (
      <div className="p-6">
        <Alert>
          <AlertDescription>
            No dynamic component available. Please check the database content.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Render the dynamic component with error boundary
  return (
    <ErrorBoundary>
      <DynamicComponent 
        course={course}
        courseId={courseId}
        courseDisplay={courseDisplay}
        itemConfig={itemConfig}
        isStaffView={isStaffView}
        devMode={devMode}
      />
      {devMode && codeData && (
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-sm text-blue-800">
            🚧 <strong>UI-Generated Content</strong> | 
            Last modified: {new Date(codeData.metadata?.lastModified).toLocaleString()} by {codeData.metadata?.modifiedBy}
          </p>
        </div>
      )}
    </ErrorBoundary>
  );
};

// Simple error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dynamic component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert>
          <AlertDescription>
            <strong>Component Render Error:</strong> {this.state.error?.message}
            <br />
            <small>Check the browser console for details.</small>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default UiGeneratedContent;