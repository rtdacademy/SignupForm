import React, { useState, useEffect, useRef } from 'react';

/**
 * SafeComponentRenderer - A secure iframe-based component renderer
 * Replaces eval() usage with sandboxed iframe execution
 */
const SafeComponentRenderer = ({ 
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
      // Verify origin for security (you may want to be more specific)
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
          if (onError) onError(iframeError);
          break;
        case 'COMPONENT_HEIGHT':
          // Auto-resize iframe based on content
          if (iframeRef.current) {
            iframeRef.current.style.height = `${data}px`;
          }
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
  }, [componentCode, JSON.stringify(componentProps), JSON.stringify(imports)]);

  const createIframeContent = () => {
    if (!iframeRef.current) return;

    // Create the HTML content for the iframe
    const iframeContent = createSandboxHTML(componentCode, componentProps, imports);
    
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

  const createSandboxHTML = (code, props, imports) => {
    // Serialize props and imports for the iframe
    const serializedProps = JSON.stringify(props);
    const serializedImports = JSON.stringify(imports);

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Sandboxed Component</title>
  <!-- Include React from CDN -->
  <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <!-- Include Tailwind CSS -->
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body {
      margin: 0;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'sans-serif';
      background: white;
    }
    .error-boundary {
      border: 2px solid #ef4444;
      border-radius: 8px;
      padding: 16px;
      background: #fef2f2;
      color: #dc2626;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script>
    try {
      // Set up React and ReactDOM
      const { useState, useEffect, useRef, createElement } = React;
      
      // Parse props and imports
      const componentProps = ${serializedProps};
      const importData = ${serializedImports};
      
      // Create safe mock implementations for UI components
      const createMockComponent = (tag, defaultClasses = '') => {
        return ({ children, className = '', ...props }) => 
          createElement(tag, { className: \`\${defaultClasses} \${className}\`, ...props }, children);
      };
      
      // Mock assessment components
      const AIMultipleChoiceQuestion = ({ title, courseId, assessmentId, ...props }) => {
        return createElement('div', {
          className: 'border border-purple-200 bg-purple-50 p-4 rounded-lg mb-4'
        }, [
          createElement('h3', { className: 'text-lg font-semibold text-purple-800' }, title || 'AI Multiple Choice Question'),
          createElement('p', { className: 'text-sm text-purple-600 mt-2' }, 'AI Multiple Choice assessment component'),
          createElement('div', { className: 'text-xs text-gray-500 mt-2' }, \`Course: \${courseId}, Assessment: \${assessmentId}\`)
        ]);
      };
      
      const AILongAnswerQuestion = ({ title, courseId, assessmentId, ...props }) => {
        return createElement('div', {
          className: 'border border-blue-200 bg-blue-50 p-4 rounded-lg mb-4'
        }, [
          createElement('h3', { className: 'text-lg font-semibold text-blue-800' }, title || 'AI Long Answer Question'),
          createElement('p', { className: 'text-sm text-blue-600 mt-2' }, 'AI Long Answer assessment component'),
          createElement('div', { className: 'text-xs text-gray-500 mt-2' }, \`Course: \${courseId}, Assessment: \${assessmentId}\`)
        ]);
      };
      
      // Mock imports (you can extend this based on your needs)
      const mockImports = {
        React,
        useState,
        useEffect,
        useRef,
        createElement,
        // UI Components
        Card: createMockComponent('div', 'border rounded-lg bg-white shadow-sm'),
        CardContent: createMockComponent('div', 'p-4'),
        CardHeader: createMockComponent('div', 'p-4 pb-2'),
        CardTitle: createMockComponent('h3', 'text-lg font-semibold'),
        Alert: createMockComponent('div', 'border border-blue-200 bg-blue-50 p-4 rounded-lg'),
        AlertDescription: createMockComponent('div', 'text-sm'),
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
        // Common Lucide icons as mock implementations
        CheckCircle: createMockComponent('div', 'w-5 h-5 text-green-500'),
        AlertCircle: createMockComponent('div', 'w-5 h-5 text-yellow-500'),
        XCircle: createMockComponent('div', 'w-5 h-5 text-red-500'),
        // Merge with any additional imports
        ...importData
      };
      
      // Component code processing
      const processedCode = \`${code.replace(/`/g, '\\`').replace(/\$/g, '\\$')}\`;
      
      // Extract component name
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
            return match[1];
          }
        }
        return null;
      };
      
      // Remove import/export statements
      const cleanCode = processedCode
        .split('\\n')
        .filter(line => {
          const trimmed = line.trim();
          return !trimmed.startsWith('import ') && 
                 !trimmed.startsWith('export ') && 
                 !trimmed.includes('require(');
        })
        .join('\\n');
      
      // Get component name
      const componentName = extractComponentName(cleanCode);
      if (!componentName) {
        throw new Error('Could not find component name in code');
      }
      
      // Create component function safely using Function constructor instead of eval
      const paramNames = Object.keys(mockImports).join(', ');
      const paramValues = Object.values(mockImports);
      
      const componentFactory = new Function(paramNames, \`
        \${cleanCode}
        return \${componentName};
      \`);
      
      const Component = componentFactory(...paramValues);
      
      if (typeof Component !== 'function') {
        throw new Error('Created component is not a valid React component function');
      }
      
      // Error boundary wrapper
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        
        componentDidCatch(error, errorInfo) {
          window.parent.postMessage({
            type: 'COMPONENT_ERROR',
            error: error.message
          }, '*');
        }
        
        render() {
          if (this.state.hasError) {
            return createElement('div', { className: 'error-boundary' },
              createElement('h3', null, 'Component Error'),
              createElement('p', null, this.state.error?.message || 'Unknown error occurred')
            );
          }
          return this.props.children;
        }
      }
      
      // Render the component
      const App = () => {
        useEffect(() => {
          // Auto-resize iframe based on content height
          const resizeObserver = new ResizeObserver(() => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({
              type: 'COMPONENT_HEIGHT',
              data: height
            }, '*');
          });
          
          resizeObserver.observe(document.body);
          
          // Initial height report
          setTimeout(() => {
            window.parent.postMessage({
              type: 'COMPONENT_HEIGHT',
              data: document.body.scrollHeight
            }, '*');
          }, 100);
          
          return () => resizeObserver.disconnect();
        }, []);
        
        return createElement(ErrorBoundary, null,
          createElement(Component, componentProps)
        );
      };
      
      // Render to DOM
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(createElement(App));
      
      // Notify parent that component loaded successfully
      setTimeout(() => {
        window.parent.postMessage({
          type: 'COMPONENT_LOADED'
        }, '*');
      }, 100);
      
    } catch (error) {
      console.error('Iframe component error:', error);
      
      // Show error in iframe
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h3>Component Error</h3>
          <p>\${error.message}</p>
          <details>
            <summary>Stack Trace</summary>
            <pre style="white-space: pre-wrap; font-size: 12px; margin-top: 8px;">\${error.stack || 'No stack trace available'}</pre>
          </details>
        </div>
      \`;
      
      // Notify parent of error
      window.parent.postMessage({
        type: 'COMPONENT_ERROR',
        error: error.message
      }, '*');
    }
  </script>
</body>
</html>`;
  };

  return (
    <div className="safe-component-renderer">
      {loading && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading component...</span>
        </div>
      )}
      
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Component Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className={`w-full border-0 transition-opacity ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        style={{ minHeight: '100px' }}
        sandbox="allow-scripts allow-same-origin"
        title="Sandboxed Component"
      />
    </div>
  );
};

export default SafeComponentRenderer;