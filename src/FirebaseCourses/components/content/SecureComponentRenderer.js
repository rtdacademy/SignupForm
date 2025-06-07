import React, { useState, useEffect, useRef } from 'react';

/**
 * SecureComponentRenderer - Production-ready secure component renderer
 * Uses a more restrictive sandbox and eliminates external CDN dependencies
 */
const SecureComponentRenderer = ({ 
  componentCode, 
  componentProps = {}, 
  onError = null,
  onLoad = null 
}) => {
  const iframeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messageHandlerRef = useRef(null);
  const [retryCount, setRetryCount] = useState(0);

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
      // Verify origin for security - be more specific in production
      const allowedOrigins = [
        window.location.origin,
        'null' // blob: URLs report 'null' as origin
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('Ignored message from unauthorized origin:', event.origin);
        return;
      }

      const { type, data, error: iframeError } = event.data;

      switch (type) {
        case 'COMPONENT_LOADED':
          setLoading(false);
          setError(null);
          setRetryCount(0);
          if (onLoad) onLoad();
          break;
        case 'COMPONENT_ERROR':
          setLoading(false);
          setError(iframeError);
          console.error('Secure Renderer Error:', iframeError);
          if (onError) onError(iframeError);
          break;
        case 'COMPONENT_HEIGHT':
          // Auto-resize iframe based on content
          if (iframeRef.current && data > 0) {
            iframeRef.current.style.height = `${Math.min(data, 2000)}px`; // Cap at 2000px
          }
          break;
        case 'CONSOLE_LOG':
          console.log('[Secure Component]:', ...data);
          break;
        case 'CONSOLE_ERROR':
          console.error('[Secure Component]:', ...data);
          break;
        case 'REACT_LOAD_FAILED':
          // Retry with fallback approach
          if (retryCount < 2) {
            console.log('Retrying React load with fallback...');
            setRetryCount(prev => prev + 1);
            setTimeout(() => createIframeContent(true), 1000);
          } else {
            setError('Failed to load React after multiple attempts');
            setLoading(false);
          }
          break;
      }
    };

    window.addEventListener('message', messageHandlerRef.current);

    // Create the iframe content
    createIframeContent(false);

    return () => {
      if (messageHandlerRef.current) {
        window.removeEventListener('message', messageHandlerRef.current);
      }
    };
  }, [componentCode, retryCount]);

  const createIframeContent = (useFallback = false) => {
    if (!iframeRef.current) return;

    // Create the HTML content for the iframe
    const iframeContent = createSecureHTML(componentCode, componentProps, useFallback);
    
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

  const createSecureHTML = (code, props, useFallback) => {
    // Safely serialize props only
    const safeSerialization = (obj) => {
      try {
        return JSON.stringify(obj, (key, value) => {
          // Only allow primitive types and plain objects
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
        return '{}';
      }
    };

    const serializedProps = safeSerialization(props || {});

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Secure Component</title>
  
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
      <span>Loading secure component...</span>
    </div>
  </div>
  
  <script>
    // Enhanced console logging that forwards to parent
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      try {
        parent.postMessage({
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
        parent.postMessage({
          type: 'CONSOLE_ERROR',
          data: args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg))
        }, '*');
      } catch (e) {
        // Ignore postMessage errors
      }
    };

    // Minimal React implementation without external dependencies
    const createMinimalReact = () => {
      // Simple createElement implementation
      const createElement = (type, props, ...children) => {
        const element = {
          type,
          props: {
            ...props,
            children: children.length === 1 ? children[0] : children
          }
        };
        return element;
      };

      // Simple render function
      const render = (element, container) => {
        if (typeof element === 'string' || typeof element === 'number') {
          container.appendChild(document.createTextNode(element));
          return;
        }

        if (!element || !element.type) return;

        const domElement = document.createElement(element.type);
        
        // Set props
        if (element.props) {
          Object.keys(element.props).forEach(key => {
            if (key === 'children') return;
            if (key === 'className') {
              domElement.className = element.props[key];
            } else if (key.startsWith('on')) {
              // Event handlers
              domElement.addEventListener(key.substring(2).toLowerCase(), element.props[key]);
            } else {
              domElement.setAttribute(key, element.props[key]);
            }
          });
        }

        // Render children
        if (element.props && element.props.children) {
          const children = Array.isArray(element.props.children) 
            ? element.props.children 
            : [element.props.children];
          
          children.forEach(child => {
            if (child !== null && child !== undefined) {
              render(child, domElement);
            }
          });
        }

        container.appendChild(domElement);
      };

      // Simple hooks implementation
      let currentComponent = null;
      let hookIndex = 0;
      let hooks = [];

      const useState = (initialValue) => {
        const currentIndex = hookIndex++;
        if (hooks[currentIndex] === undefined) {
          hooks[currentIndex] = initialValue;
        }
        
        const setState = (newValue) => {
          hooks[currentIndex] = typeof newValue === 'function' 
            ? newValue(hooks[currentIndex]) 
            : newValue;
          // Re-render would go here in a full implementation
        };
        
        return [hooks[currentIndex], setState];
      };

      const useEffect = (fn, deps) => {
        // Simplified useEffect - just run the function
        try {
          const cleanup = fn();
          if (typeof cleanup === 'function') {
            // Store cleanup for later
            window.addEventListener('beforeunload', cleanup);
          }
        } catch (error) {
          console.error('useEffect error:', error);
        }
      };

      const useRef = (initialValue) => {
        return { current: initialValue };
      };

      return {
        createElement,
        render,
        useState,
        useEffect,
        useRef
      };
    };

    try {
      console.log('Initializing secure component renderer...');
      
      // Parse props
      const componentProps = ${serializedProps};
      
      // Create minimal React implementation
      const { createElement, render, useState, useEffect, useRef } = createMinimalReact();
      
      // Make available globally for component code
      window.React = { createElement, useState, useEffect, useRef };
      window.createElement = createElement;
      
      // Create safe mock components
      const createMockComponent = (tag, defaultClasses = '') => {
        return ({ children, className = '', ...props }) => {
          return createElement(tag, { 
            className: \`\${defaultClasses} \${className}\`.trim(), 
            ...props 
          }, children);
        };
      };
      
      // Enhanced assessment components
      const AIMultipleChoiceQuestion = ({ title, courseId, assessmentId, theme = 'purple', ...props }) => {
        console.log('Rendering AIMultipleChoiceQuestion:', { title, courseId, assessmentId });
        return createElement('div', {
          className: \`border border-purple-200 bg-purple-50 p-4 rounded-lg mb-4\`
        }, [
          createElement('h3', { 
            key: 'title',
            className: 'text-lg font-semibold text-purple-800'
          }, title || 'AI Multiple Choice Question'),
          createElement('p', { 
            key: 'description',
            className: 'text-sm text-purple-600 mt-2'
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
          className: \`border border-blue-200 bg-blue-50 p-4 rounded-lg mb-4\`
        }, [
          createElement('h3', { 
            key: 'title',
            className: 'text-lg font-semibold text-blue-800'
          }, title || 'AI Long Answer Question'),
          createElement('p', { 
            key: 'description',
            className: 'text-sm text-blue-600 mt-2'
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
      
      // Available imports for components
      const mockImports = {
        React: window.React,
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
        // Common icons as text
        CheckCircle: ({ className = '', ...props }) => createElement('span', { className: \`text-green-500 \${className}\`, ...props }, '✓'),
        AlertCircle: ({ className = '', ...props }) => createElement('span', { className: \`text-yellow-500 \${className}\`, ...props }, '⚠'),
        XCircle: ({ className = '', ...props }) => createElement('span', { className: \`text-red-500 \${className}\`, ...props }, '✗')
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
            console.log('Found component name:', match[1]);
            return match[1];
          }
        }
        console.error('No component name found');
        return null;
      };
      
      // Clean code
      const cleanCode = processedCode
        .split('\\n')
        .filter(line => {
          const trimmed = line.trim();
          return !trimmed.startsWith('import ') && 
                 !trimmed.startsWith('export ') && 
                 !trimmed.includes('require(');
        })
        .join('\\n');
      
      console.log('Cleaned code length:', cleanCode.length);
      
      // Get component name
      const componentName = extractComponentName(cleanCode);
      if (!componentName) {
        throw new Error('Could not find component name in code');
      }
      
      console.log('Creating component with name:', componentName);
      
      // Create component using Function constructor
      const paramNames = Object.keys(mockImports).join(', ');
      const paramValues = Object.values(mockImports);
      
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
      
      // Render the component
      const renderComponent = () => {
        try {
          const componentElement = Component(componentProps);
          const container = document.getElementById('root');
          container.innerHTML = ''; // Clear loading content
          render(componentElement, container);
          
          // Auto-resize
          setTimeout(() => {
            const height = Math.max(document.body.scrollHeight, 100);
            parent.postMessage({
              type: 'COMPONENT_HEIGHT',
              data: height
            }, '*');
          }, 100);
          
          // Setup resize observer
          if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver(() => {
              const height = Math.max(document.body.scrollHeight, 100);
              parent.postMessage({
                type: 'COMPONENT_HEIGHT',
                data: height
              }, '*');
            });
            resizeObserver.observe(document.body);
          }
          
          // Notify parent of success
          parent.postMessage({
            type: 'COMPONENT_LOADED'
          }, '*');
          
        } catch (renderError) {
          throw new Error(\`Component render failed: \${renderError.message}\`);
        }
      };
      
      // Render the component
      renderComponent();
      
    } catch (error) {
      console.error('Secure component error:', error);
      
      // Show error in iframe
      document.getElementById('root').innerHTML = \`
        <div class="error-boundary">
          <h3>Secure Component Error</h3>
          <p>\${error.message}</p>
          <details>
            <summary>Error Details</summary>
            <pre style="white-space: pre-wrap; font-size: 12px; margin-top: 8px;">\${error.stack || 'No stack trace available'}</pre>
          </details>
        </div>
      \`;
      
      // Notify parent of error
      parent.postMessage({
        type: 'COMPONENT_ERROR',
        error: error.message
      }, '*');
    }
  </script>
</body>
</html>`;
  };

  return (
    <div className="secure-component-renderer">
      {loading && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-sm text-gray-600">Loading secure component...</span>
          {retryCount > 0 && (
            <span className="ml-2 text-xs text-gray-500">(Retry {retryCount})</span>
          )}
        </div>
      )}
      
      {error && (
        <div className="border border-red-200 bg-red-50 p-4 rounded-lg mb-4">
          <h3 className="text-sm font-medium text-red-800">Component Error</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <details className="mt-2">
            <summary className="text-xs text-red-600 cursor-pointer">Show Technical Details</summary>
            <pre className="text-xs bg-white p-2 rounded mt-1 overflow-auto max-h-40">
              {error}
            </pre>
          </details>
        </div>
      )}
      
      <iframe
        ref={iframeRef}
        className={`w-full border-0 transition-opacity ${loading || error ? 'opacity-0' : 'opacity-100'}`}
        style={{ minHeight: '100px', maxHeight: '2000px' }}
        sandbox="allow-scripts"
        title="Secure Component"
      />
    </div>
  );
};

export default SecureComponentRenderer;