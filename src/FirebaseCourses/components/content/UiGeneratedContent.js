import React, { useState, useEffect } from 'react';
import { getDatabase, ref, get } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Import all the components that teachers might need
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Badge } from '../../../components/ui/badge';
import AIMultipleChoiceQuestion from '../assessments/AIMultipleChoiceQuestion';

/**
 * Generic UiGeneratedContent component for displaying dynamically generated course content
 * Can be used across any course and lesson by providing the appropriate props
 */
const UiGeneratedContent = ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
  const [DynamicComponent, setDynamicComponent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [codeData, setCodeData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Function to create a wrapper component that renders all sections individually
  const createMultiSectionWrapper = (lessonData, lessonInfo) => {
    const sections = lessonData.sections || {};
    const sectionOrder = lessonData.sectionOrder || Object.keys(sections);
    const orderedSections = sectionOrder.map(id => sections[id]).filter(Boolean);
    
    console.log(`🏗️ Creating multi-section wrapper for ${orderedSections.length} sections`);
    
    return ({ course, courseId, courseDisplay, itemConfig, isStaffView, devMode }) => {
      const [sectionComponents, setSectionComponents] = React.useState([]);
      const [sectionsLoading, setSectionsLoading] = React.useState(true);
      const [sectionErrors, setSectionErrors] = React.useState({});

      React.useEffect(() => {
        const loadAllSections = async () => {
          console.log(`📚 Loading ${orderedSections.length} individual sections...`);
          const loadedComponents = [];
          const errors = {};

          for (let i = 0; i < orderedSections.length; i++) {
            const section = orderedSections[i];
            try {
              console.log(`📝 Processing section ${i + 1}/${orderedSections.length}: "${section.title}"`);
              
              // Use transformed code if available, fallback to original
              const sectionCode = section.code || section.originalCode || '';
              
              if (!sectionCode.trim()) {
                console.warn(`⚠️ Section "${section.title}" has no code, creating placeholder`);
                // Create a placeholder component
                const PlaceholderComponent = ({ course, courseId, isStaffView, devMode }) => 
                  React.createElement('div', { className: 'section-container mb-6' },
                    React.createElement(Card, { className: 'mb-6' },
                      React.createElement(CardHeader, null,
                        React.createElement(CardTitle, null, section.title)
                      ),
                      React.createElement(CardContent, null,
                        React.createElement('p', { className: 'text-gray-500 italic' }, 
                          isStaffView ? 'Section content not yet created. Use the editor to add content.' : 'Content coming soon...'
                        )
                      )
                    )
                  );
                
                loadedComponents.push({
                  id: section.id,
                  title: section.title,
                  component: PlaceholderComponent,
                  order: i
                });
                continue;
              }

              // Create individual section component
              const SectionComponent = await createDynamicComponent(sectionCode);
              loadedComponents.push({
                id: section.id,
                title: section.title,
                component: SectionComponent,
                order: i
              });
              
              console.log(`✅ Section "${section.title}" loaded successfully`);
            } catch (sectionError) {
              console.error(`❌ Error loading section "${section.title}":`, sectionError);
              errors[section.id] = sectionError.message;
              
              // Create error component for this section
              const ErrorComponent = () => 
                React.createElement('div', { className: 'section-container mb-6' },
                  React.createElement(Alert, { className: 'mb-6' },
                    React.createElement(AlertDescription, null,
                      React.createElement('strong', null, `Error in section "${section.title}": `),
                      sectionError.message
                    )
                  )
                );
              
              loadedComponents.push({
                id: section.id,
                title: section.title,
                component: ErrorComponent,
                order: i,
                hasError: true
              });
            }
          }

          setSectionComponents(loadedComponents);
          setSectionErrors(errors);
          setSectionsLoading(false);
          
          console.log(`🎉 Multi-section loading complete: ${loadedComponents.length} sections loaded`);
        };

        loadAllSections();
      }, []);

      if (sectionsLoading) {
        return React.createElement('div', { className: 'flex items-center justify-center p-8' },
          React.createElement('div', { className: 'animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600' }),
          React.createElement('p', { className: 'ml-3' }, `Loading ${orderedSections.length} sections...`)
        );
      }

      // Render all sections in a lesson container
      return React.createElement('div', { className: 'lesson-container' },
        // Lesson header
        React.createElement('div', { className: 'lesson-header mb-8' },
          React.createElement('h1', { className: 'text-3xl font-bold text-gray-900' }, 
            lessonInfo?.title || 'Multi-Section Lesson'
          ),
          devMode && React.createElement(Badge, { variant: 'outline', className: 'mt-2' },
            `Multi-Section Lesson • ${sectionComponents.length} sections`
          )
        ),
        
        // Sections container
        React.createElement('div', { className: 'lesson-sections space-y-6' },
          ...sectionComponents.map(({ id, component: SectionComponent, hasError }) =>
            React.createElement('div', { 
              key: id, 
              className: `section-wrapper ${hasError ? 'section-error' : ''}` 
            },
              React.createElement(SectionComponent, {
                course: course,
                courseId: courseId,
                courseDisplay: courseDisplay,
                itemConfig: itemConfig,
                isStaffView: isStaffView,
                devMode: devMode
              })
            )
          )
        ),
        
        // Debug info for staff
        devMode && React.createElement('div', { className: 'mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md' },
          React.createElement('p', { className: 'text-sm text-blue-800' },
            React.createElement('strong', null, '🔧 Multi-Section Debug: '),
            `${sectionComponents.length} sections rendered individually • `,
            `${Object.keys(sectionErrors).length} errors`
          ),
          Object.keys(sectionErrors).length > 0 && React.createElement('details', { className: 'mt-2' },
            React.createElement('summary', { className: 'cursor-pointer text-sm text-red-600' }, 'Section Errors'),
            React.createElement('pre', { className: 'mt-2 text-xs bg-white p-2 rounded overflow-auto' },
              JSON.stringify(sectionErrors, null, 2)
            )
          )
        )
      );
    };
  };

  useEffect(() => {
    const loadDynamicComponent = async () => {
      try {
        setLoading(true);
        
        // Load metadata from database
        const db = getDatabase();
        const lessonPath = itemConfig?.contentPath;
        
        if (!lessonPath) {
          throw new Error('No contentPath provided in itemConfig');
        }
        
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
        
        // Handle multi-section structure - use direct section rendering instead of combined code
        if (data.sections && Object.keys(data.sections).length > 0) {
          console.log('🔄 Loading multi-section lesson with direct section rendering');
          console.log(`📊 Found ${Object.keys(data.sections).length} sections`);
          
          // Create a wrapper component that renders all sections
          const MultiSectionWrapper = createMultiSectionWrapper(data, itemConfig);
          setDynamicComponent(() => MultiSectionWrapper);
          return; // Skip the single component creation
        }
        
        // Handle single component or legacy structure
        let reactCode;
        if (data.mainComponent?.code) {
          console.log('Loading single combined component');
          reactCode = data.mainComponent.code;
        } else if (data.code) {
          console.log('Loading transformed code from database structure');
          reactCode = data.code;
        } else if (data.currentFile) {
          // Fallback to old system if needed
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
        
        // Check if code contains JSX and transform if needed
        const containsJSX = reactCode.includes('<') && reactCode.includes('>') && !reactCode.includes('React.createElement');
        if (containsJSX) {
          console.warn('⚠️ JSX detected in code, attempting transformation...');
          try {
            const functions = getFunctions();
            const transformJSX = httpsCallable(functions, 'transformJSXCode');
            const result = await transformJSX({ jsxCode: reactCode });
            
            if (result.data.success) {
              console.log('✅ Fallback JSX transformation successful');
              reactCode = result.data.transformedCode;
            } else {
              console.error('❌ Fallback JSX transformation failed:', result.data.error);
              throw new Error(`JSX transformation failed: ${result.data.error}`);
            }
          } catch (transformError) {
            console.error('❌ Fallback transformation error:', transformError);
            throw new Error(`Failed to transform JSX in UiGeneratedContent: ${transformError.message}`);
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
  }, [courseId, itemConfig, refreshKey]);

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
      
      // Code is already transformed, no need for Babel transformation
      console.log('Code is already transformed to React.createElement format');
      console.log('Processed code preview:', processedCode.substring(0, 500));
      
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
                  isMultiSection: !!codeData.sections,
                  sectionCount: codeData.sections ? Object.keys(codeData.sections).length : 0,
                  hasMainComponent: !!codeData.mainComponent?.code,
                  hasLegacyCode: !!codeData.reactCode || !!codeData.code,
                  hasCurrentFile: !!codeData.currentFile,
                  enabled: codeData.enabled,
                  contentPath: itemConfig?.contentPath,
                  courseId: courseId
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
            🚧 <strong>{codeData.sections ? 'Multi-Section Lesson' : 'UI-Generated Content'}</strong> | 
            Last modified: {new Date(codeData.lastModified || codeData.metadata?.lastModified).toLocaleString()} by {codeData.modifiedBy || codeData.metadata?.modifiedBy}
          </p>
          {codeData.sections && (
            <p className="text-xs text-blue-600 mt-1">
              Contains {Object.keys(codeData.sections).length} sections • Generated: {new Date(codeData.mainComponent?.lastGenerated).toLocaleString()}
            </p>
          )}
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