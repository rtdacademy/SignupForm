import React, { useState, useEffect, useRef } from 'react';

/**
 * ProductionSafeRenderer - Production-optimized iframe renderer
 * Uses local React build in production to avoid CDN dependencies
 */
const ProductionSafeRenderer = ({ 
  componentCode, 
  componentProps = {}, 
  imports = {},
  onError = null,
  onLoad = null 
}) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messageHandlerRef = useRef(null);

  useEffect(() => {
    if (!componentCode) {
      setError('No component code provided');
      setLoading(false);
      return;
    }

    // Clean up previous message handler
    if (messageHandlerRef.current) {
      window.removeEventListener('message', messageHandlerRef.current);
    }

    // Create message handler for iframe communication
    messageHandlerRef.current = (event) => {
      // Verify origin for security
      if (event.origin !== window.location.origin) {
        return;
      }

      const { type, data, error: iframeError } = event.data;

      switch (type) {
        case 'COMPONENT_LOADED':
          setLoading(false);
          setError(null);
          if (onLoad) onLoad();
          break;
        case 'COMPONENT_ERROR':
          setLoading(false);
          setError(iframeError);
          console.error('Production Safe Renderer Error:', iframeError);
          if (onError) onError(iframeError);
          break;
        case 'COMPONENT_HEIGHT':
          // Auto-resize iframe based on content
          if (iframeRef.current) {
            iframeRef.current.style.height = `${data}px`;
          }
          break;
        case 'CONSOLE_LOG':
          console.log('[Sandboxed Component]:', ...data);
          break;
        case 'CONSOLE_ERROR':
          console.error('[Sandboxed Component]:', ...data);
          break;
      }
    };

    window.addEventListener('message', messageHandlerRef.current);

    // Create the iframe content
    createIframeContent();

    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, [componentCode]);

  const createIframeContent = () => {
    if (!iframeRef.current) return;

    // Create the HTML content for the iframe
    const iframeContent = createProductionHTML(componentCode, componentProps, imports);
    
    // Create a blob URL for the iframe content
    const blob = new Blob([iframeContent], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    
    // Set iframe source
    iframeRef.current.src = blobUrl;
    
    // Clean up blob URL after iframe loads
    iframeRef.current.onload = () => {
      URL.revokeObjectURL(blobUrl);
    };
  };

  const createProductionHTML = (code, props, imports) => {
    // Safely serialize props and imports for the iframe
    const safeSerialization = (obj) => {
      try {
        const seen = new WeakSet();
        return JSON.stringify(obj, (key, value) => {
          if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
              return '[Circular]';
            }
            seen.add(value);
          }
          // Skip functions, DOM elements, and React-specific properties
          if (typeof value === 'function' || 
              (value && value.nodeType) || 
              key.startsWith('__react') ||
              key.startsWith('_react') ||
              key.startsWith('$$typeof')) {
            return undefined;
          }
          return value;
        });
      } catch (error) {
        console.error('Serialization error:', error);
        return JSON.stringify({});
      }
    };
    
    // Clean props and imports before serialization
    const cleanProps = Object.keys(props || {}).reduce((clean, key) => {
      const value = props[key];
      if (typeof value !== 'function' && !key.startsWith('__react') && !key.startsWith('_react')) {
        clean[key] = value;
      }
      return clean;
    }, {});
    
    const cleanImports = Object.keys(imports || {}).reduce((clean, key) => {
      const value = imports[key];
      if (typeof value !== 'function' && !key.startsWith('__react') && !key.startsWith('_react')) {
        clean[key] = value;
      }
      return clean;
    }, {});
    
    const serializedProps = safeSerialization(cleanProps);
    // Don't serialize imports - they contain functions and React components
    const serializedImports = '{}';

    // Determine if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Safe Component Renderer</title>
  
  <!-- React Scripts - Use CDN for development, assume bundled for production -->
  ${isDevelopment ? `
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  ` : `
  <!-- In production, React should be available from the parent window -->
  <script>
    // Try to get React from parent window first, fallback to CDN
    window.React = window.React || parent.React;
    window.ReactDOM = window.ReactDOM || parent.ReactDOM;
    
    if (!window.React || !window.ReactDOM) {
      // Fallback to CDN if not available from parent
      document.write('<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>');
      document.write('<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>');
    }
  </script>
  `}
  
  <!-- Include Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif';
      background: white;
      min-height: 50px;
    }
    .error-boundary {
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      background: #fef2f2;
      color: #dc2626;
      margin: 8px 0;
    }
    .loading-spinner {
      border: 2px solid #f3f4f6;
      border-top: 2px solid #3b82f6;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      animation: spin 1s linear infinite;
      display: inline-block;
      margin-right: 8px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div id="root">
    <div style="display: flex; align-items: center; justify-content: center; padding: 20px;">
      <div class="loading-spinner"></div>
      <span>Loading component...</span>
    </div>
  </div>
  
  <script>
    // Wait for React to be available
    const waitForReact = () => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        const checkReact = () => {
          if (window.React && window.ReactDOM) {
            resolve();
          } else if (attempts >= maxAttempts) {
            reject(new Error('React not available after timeout'));
          } else {
            attempts++;
            setTimeout(checkReact, 100);
          }
        };
        
        checkReact();
      });
    };
    
    // Enhanced console logging that forwards to parent
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      try {
        window.parent.postMessage({
          type: 'CONSOLE_LOG',
          data: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
        }, '*');
      } catch (e) {
        // Ignore postMessage errors
      }
    };
    
    console.error = (...args) => {
      originalError(...args);
      try {
        window.parent.postMessage({
          type: 'CONSOLE_ERROR',
          data: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
        }, '*');
      } catch (e) {
        // Ignore postMessage errors
      }
    };
    
    waitForReact().then(() => {
      try {
        console.log('React loaded, initializing component...');
        
        // Set up React and ReactDOM
        const { useState, useEffect, useRef, createElement } = React;
        
        // Parse props (imports are recreated below)
        const componentProps = ${serializedProps};
        const importData = {}; // We recreate all imports below
        
        // Create enhanced mock components with better error handling
        const createSafeMockComponent = (tag, defaultClasses = '') => {
          return ({ children, className = '', ...props }) => {
            try {
              return createElement(tag, { 
                className: \`\${defaultClasses} \${className}\`.trim(), 
                ...props 
              }, children);
            } catch (error) {
              console.error('Mock component error:', error);
              return createElement('div', { 
                className: 'error-boundary' 
              }, 'Component render error');
            }
          };
        };
        
        // Enhanced assessment components
        const AIMultipleChoiceQuestion = ({ title, courseId, assessmentId, theme = 'purple', ...props }) => {
          console.log('Rendering AIMultipleChoiceQuestion:', { title, courseId, assessmentId });
          return createElement('div', {
            className: \`border border-\${theme}-200 bg-\${theme}-50 p-4 rounded-lg mb-4\`
          }, [
            createElement('h3', { 
              key: 'title',
              className: \`text-lg font-semibold text-\${theme}-800\` 
            }, title || 'AI Multiple Choice Question'),
            createElement('p', { 
              key: 'description',
              className: \`text-sm text-\${theme}-600 mt-2\` 
            }, 'AI Multiple Choice assessment component (Preview Mode)'),
            createElement('div', { 
              key: 'meta',
              className: 'text-xs text-gray-500 mt-2 bg-white p-2 rounded border' 
            }, [
              createElement('div', { key: 'course' }, \`Course ID: \${courseId || 'N/A'}\`),
              createElement('div', { key: 'assessment' }, \`Assessment ID: \${assessmentId || 'N/A'}\`),
              createElement('div', { key: 'theme' }, \`Theme: \${theme}\`)
            ])
          ]);
        };
        
        const AILongAnswerQuestion = ({ title, courseId, assessmentId, theme = 'blue', ...props }) => {
          console.log('Rendering AILongAnswerQuestion:', { title, courseId, assessmentId });
          return createElement('div', {
            className: \`border border-\${theme}-200 bg-\${theme}-50 p-4 rounded-lg mb-4\`
          }, [
            createElement('h3', { 
              key: 'title',
              className: \`text-lg font-semibold text-\${theme}-800\` 
            }, title || 'AI Long Answer Question'),
            createElement('p', { 
              key: 'description',
              className: \`text-sm text-\${theme}-600 mt-2\` 
            }, 'AI Long Answer assessment component (Preview Mode)'),
            createElement('div', { 
              key: 'meta',
              className: 'text-xs text-gray-500 mt-2 bg-white p-2 rounded border' 
            }, [
              createElement('div', { key: 'course' }, \`Course ID: \${courseId || 'N/A'}\`),
              createElement('div', { key: 'assessment' }, \`Assessment ID: \${assessmentId || 'N/A'}\`),
              createElement('div', { key: 'theme' }, \`Theme: \${theme}\`)
            ])
          ]);
        };
        
        // Comprehensive mock imports
        const mockImports = {
          React,
          useState,
          useEffect,
          useRef,
          createElement,
          // UI Components
          Card: createSafeMockComponent('div', 'border rounded-lg bg-white shadow-sm'),
          CardContent: createSafeMockComponent('div', 'p-4'),
          CardHeader: createSafeMockComponent('div', 'p-4 pb-2'),
          CardTitle: createSafeMockComponent('h3', 'text-lg font-semibold'),
          Alert: createSafeMockComponent('div', 'border border-blue-200 bg-blue-50 p-4 rounded-lg'),
          AlertDescription: createSafeMockComponent('div', 'text-sm'),
          Badge: ({ children, className = '', variant = 'default', ...props }) => {
            const variantClasses = {
              default: 'bg-gray-100 text-gray-800',
              secondary: 'bg-gray-200 text-gray-800',
              outline: 'border border-gray-300 bg-white text-gray-800'
            };
            return createElement('span', { 
              className: \`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium \${variantClasses[variant] || variantClasses.default} \${className}\`, 
              ...props 
            }, children);
          },
          // Assessment Components
          AIMultipleChoiceQuestion,
          AILongAnswerQuestion,
          // Common icons as simple text/divs
          CheckCircle: ({ className = '', ...props }) => createElement('span', { className: \`text-green-500 \${className}\`, ...props }, '✓'),
          AlertCircle: ({ className = '', ...props }) => createElement('span', { className: \`text-yellow-500 \${className}\`, ...props }, '⚠'),
          XCircle: ({ className = '', ...props }) => createElement('span', { className: \`text-red-500 \${className}\`, ...props }, '✗'),
          // Merge with any additional imports
          ...importData
        };
        
        // Component code processing
        const processedCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
        
        // Extract component name with better error handling
        const extractComponentName = (code) => {
          const patterns = [
            /const\\s+(\\w+)\\s*=\\s*\\([^)]*\\)\\s*=>/m,
            /const\\s+(\\w+)\\s*=\\s*\\({[^}]*}\\)\\s*=>/m,
            /function\\s+(\\w+)\\s*\\(/m,
            /const\\s+(\\w+)\\s*=\\s*function/m,
            /const\\s+([A-Z]\\w*)\\s*=/m
          ];
          
          for (const pattern of patterns) {
            const match = code.match(pattern);
            if (match && match[1]) {
              console.log('Found component name:', match[1]);
              return match[1];
            }
          }
          console.error('No component name found, patterns tried:', patterns.length);
          return null;
        };
        
        // Remove import/export statements more carefully
        const cleanCode = processedCode
          .split('\\n')
          .filter(line => {
            const trimmed = line.trim();
            return !trimmed.startsWith('import ') && 
                   !trimmed.startsWith('export ') && 
                   !trimmed.includes('require(') &&
                   !trimmed.startsWith('//') || 
                   trimmed.includes('React.createElement'); // Keep createElement lines even if they start with //
          })
          .join('\\n');
        
        console.log('Cleaned code length:', cleanCode.length);
        console.log('Cleaned code preview:', cleanCode.substring(0, 300));
        
        // Get component name
        const componentName = extractComponentName(cleanCode);
        if (!componentName) {
          throw new Error('Could not find component name in code. Make sure your component is properly declared.');
        }
        
        console.log('Creating component with name:', componentName);
        
        // Create component function safely using Function constructor
        const paramNames = Object.keys(mockImports).join(', ');
        const paramValues = Object.values(mockImports);
        
        console.log('Available imports:', Object.keys(mockImports).length);
        
        const componentFactory = new Function(paramNames, \`
          try {
            \${cleanCode}
            return \${componentName};
          } catch (error) {
            console.error('Component factory error:', error);
            throw error;
          }
        \`);
        
        const Component = componentFactory(...paramValues);
        
        if (typeof Component !== 'function') {
          throw new Error('Created component is not a valid React component function');
        }
        
        console.log('Component created successfully');
        
        // Enhanced error boundary
        class ErrorBoundary extends React.Component {
          constructor(props) {
            super(props);
            this.state = { hasError: false, error: null, errorInfo: null };
          }
          
          static getDerivedStateFromError(error) {
            return { hasError: true, error };
          }
          
          componentDidCatch(error, errorInfo) {
            console.error('Component boundary caught error:', error, errorInfo);
            this.setState({ errorInfo });
            window.parent.postMessage({
              type: 'COMPONENT_ERROR',
              error: \`\${error.message}\\n\\nStack: \${error.stack}\`
            }, '*');
          }
          
          render() {
            if (this.state.hasError) {
              return createElement('div', { className: 'error-boundary' }, [
                createElement('h3', { key: 'title' }, 'Component Error'),
                createElement('p', { key: 'message' }, this.state.error?.message || 'Unknown error occurred'),
                createElement('details', { key: 'details' }, [
                  createElement('summary', { key: 'summary' }, 'Error Details'),
                  createElement('pre', { 
                    key: 'stack',
                    style: { fontSize: '12px', marginTop: '8px', whiteSpace: 'pre-wrap' } 
                  }, this.state.error?.stack || 'No stack trace available')
                ])
              ]);
            }
            return this.props.children;
          }
        }
        
        // Main app component with auto-resize
        const App = () => {
          useEffect(() => {
            console.log('App component mounted');
            
            // Auto-resize iframe based on content height
            const resizeObserver = new ResizeObserver(() => {
              const height = Math.max(document.body.scrollHeight, 100);
              window.parent.postMessage({
                type: 'COMPONENT_HEIGHT',
                data: height
              }, '*');
            });
            
            resizeObserver.observe(document.body);
            
            // Initial height report
            setTimeout(() => {
              const height = Math.max(document.body.scrollHeight, 100);
              window.parent.postMessage({
                type: 'COMPONENT_HEIGHT',
                data: height
              }, '*');
            }, 200);
            
            return () => resizeObserver.disconnect();
          }, []);
          
          return createElement(ErrorBoundary, null,
            createElement(Component, componentProps)
          );
        };
        
        // Render to DOM
        console.log('Rendering app to DOM...');
        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(createElement(App));
        
        // Notify parent that component loaded successfully
        setTimeout(() => {
          console.log('Notifying parent of successful load');
          window.parent.postMessage({
            type: 'COMPONENT_LOADED'
          }, '*');
        }, 150);
        
      } catch (error) {
        console.error('Component initialization error:', error);
        
        // Show error in iframe
        document.getElementById('root').innerHTML = \`
          <div class="error-boundary">
            <h3>Component Initialization Error</h3>
            <p>\${error.message}</p>
            <details>
              <summary>Stack Trace</summary>
              <pre style="white-space: pre-wrap; font-size: 12px; margin-top: 8px;">\${error.stack || 'No stack trace available'}</pre>
            </details>
            <div style="margin-top: 12px; padding: 8px; background: #f3f4f6; border-radius: 4px; font-size: 12px;">
              <strong>Debugging Info:</strong><br>
              React available: \${!!window.React}<br>
              ReactDOM available: \${!!window.ReactDOM}<br>
              Component props: \${Object.keys(componentProps || {}).length} keys<br>
              Import data: \${Object.keys(importData || {}).length} keys
            </div>
          </div>
        \`;
        
        // Notify parent of error
        window.parent.postMessage({
          type: 'COMPONENT_ERROR',
          error: error.message
        }, '*');
      }
    }).catch(error => {
      console.error('React loading error:', error);
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h3>React Loading Error</h3>
          <p>Failed to load React: \${error.message}</p>
          <p>This might be due to network issues or CSP restrictions.</p>
        </div>
      \`;
      
      window.parent.postMessage({
        type: 'COMPONENT_ERROR',
        error: \`React loading failed: \${error.message}\`
      }, '*');
    });
  </script>
</body>
</html>`;
  };

  return (
    <div className="production-safe-renderer">
      {loading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading component safely...</span>
        </div>
      )}
      
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-red-800">Component Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <details className="mt-2">
            <summary className="text-xs text-red-600 cursor-pointer">Show Technical Details</summary>
            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto">
              {error}
            </pre>
          </details>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className={`w-full border-0 transition-opacity ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        style={{ minHeight: '100px' }}
        sandbox="allow-scripts allow-same-origin"
        title="Production Safe Component"
      />
    </div>
  );
};

export default ProductionSafeRenderer;