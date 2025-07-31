import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, RotateCcw, Maximize2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';

/**
 * JSXGraphVisualization Component
 * 
 * Renders interactive JSXGraph visualizations from AI-generated configurations
 */
const JSXGraphVisualization = ({ 
  visualization, 
  width = 400, 
  height = 300, 
  className = '',
  showTitle = true,
  showDescription = true,
  showControls = true
}) => {
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Use the JSXGraph hook to ensure the library is loaded
  const { isLoaded: jsxGraphLoaded, error: jsxGraphError } = useJSXGraph();

  // Helper function to create an element on the board
  const createElementOnBoard = (element, index, elementMap, board) => {
    try {
      const { type, coords, attributes = {}, name } = element;
      
      if (!type) {
        console.warn(`Element ${index} missing type, skipping`);
        return;
      }

      // Process coordinates to handle function strings and references
      const processedCoords = coords ? coords.map((coord, coordIndex) => {
        if (typeof coord === 'string') {
          // Handle function strings - convert to actual functions like the working example
          if (coord.startsWith('function(x)')) {
            try {
              // Extract the function body - everything between the braces
              const match = coord.match(/function\(x\)\s*{\s*return\s+(.*?);\s*}/);
              if (match) {
                const functionBody = match[1].trim();
                
                // Create the actual function like in the working example
                if (functionBody === 'Math.sin(x)') {
                  return function(x) { return Math.sin(x); };
                } else if (functionBody === 'Math.cos(x)') {
                  return function(x) { return Math.cos(x); };
                } else {
                  // For functions with slider references, create a function that can access the elementMap
                  return function(x) {
                    try {
                      // Replace slider references in the function body
                      let processedBody = functionBody;
                      
                      // Replace slider references like "m.Value()" with actual values
                      elementMap.forEach((el, elName) => {
                        if (el && typeof el.Value === 'function') {
                          const regex = new RegExp(`\\b${elName}\\.Value\\(\\)`, 'g');
                          processedBody = processedBody.replace(regex, el.Value());
                        }
                      });
                      
                      // Replace x with actual parameter
                      processedBody = processedBody.replace(/\bx\b/g, x);
                      
                      return eval(processedBody);
                    } catch (e) {
                      console.warn('Function eval failed:', e);
                      return 0;
                    }
                  };
                }
              }
              
              // Fallback parsing
              if (coord.includes('Math.sin')) return function(x) { return Math.sin(x); };
              if (coord.includes('Math.cos')) return function(x) { return Math.cos(x); };
              
            } catch (err) {
              // Final fallback
              return function(x) { return Math.sin(x); };
            }
          }
          
          // Handle simple string functions like 'sin(x)' as in the working example
          if (coord === 'sin(x)') return 'sin(x)';
          if (coord === 'cos(x)') return 'cos(x)';
          
          // Handle element name references - try different variations
          if (elementMap.has(coord)) {
            return elementMap.get(coord);
          }
          
          // Try with cleaned name (remove LaTeX formatting)
          const cleanCoord = coord.replace(/\$/g, '');
          if (elementMap.has(cleanCoord)) {
            return elementMap.get(cleanCoord);
          }
          
          // Try common variations like P1 -> P_1, P2 -> P_2
          const coordWithUnderscore = coord.replace(/(\w)(\d+)/, '$1_$2');
          if (elementMap.has(coordWithUnderscore)) {
            return elementMap.get(coordWithUnderscore);
          }
          
          // Try the reverse: P_1 -> P1, P_2 -> P2
          const coordWithoutUnderscore = coord.replace(/(\w)_(\d+)/, '$1$2');
          if (elementMap.has(coordWithoutUnderscore)) {
            return elementMap.get(coordWithoutUnderscore);
          }
        }
        return coord;
      }) : [];

      console.log(`Creating ${type} with coords:`, processedCoords);
      console.log('Current elementMap keys:', Array.from(elementMap.keys()));

      // Create the element
      const createdElement = board.create(type, processedCoords, attributes);
      
      // Store element in map for cross-referencing
      if (name || attributes.name) {
        const elementName = name || attributes.name;
        // Remove LaTeX formatting from the name for referencing ($ symbols)
        const cleanName = elementName.replace(/\$/g, '');
        elementMap.set(cleanName, createdElement);
      }
      
    } catch (elementError) {
      console.error(`Error creating element ${index}:`, elementError);
      // Continue with other elements
    }
  };

  // Cleanup function to properly dispose of JSXGraph board
  const cleanupBoard = () => {
    if (boardRef.current) {
      try {
        // JSXGraph cleanup
        if (window.JXG && window.JXG.JSXGraph && typeof window.JXG.JSXGraph.freeBoard === 'function') {
          window.JXG.JSXGraph.freeBoard(boardRef.current);
        }
        boardRef.current = null;
      } catch (cleanupError) {
        console.warn('Error cleaning up JSXGraph board:', cleanupError);
      }
    }
  };

  // Initialize JSXGraph board and elements
  const initializeBoard = () => {
    if (!containerRef.current || !visualization) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Clean up any existing board
      cleanupBoard();

      // Check if JSXGraph is loaded
      if (!window.JXG || !window.JXG.JSXGraph) {
        throw new Error('JSXGraph library not loaded');
      }

      // Merge default and custom board configuration
      const defaultBoardConfig = {
        boundingBox: [-5, 5, 5, -5],
        axis: true,
        grid: false,
        showCopyright: false,
        showNavigation: false,
        keepAspectRatio: false,
        zoom: {
          factorX: 1.25,
          factorY: 1.25,
          wheel: true
        },
        pan: {
          enabled: true,
          needTwoFingers: false
        }
      };

      const boardConfig = {
        ...defaultBoardConfig,
        ...visualization.boardConfig
      };

      // Create the board with a unique ID
      const containerId = `jsxgraph-${Math.random().toString(36).substr(2, 9)}`;
      containerRef.current.id = containerId;
      
      boardRef.current = window.JXG.JSXGraph.initBoard(containerId, boardConfig);

      // Add elements to the board
      const elementMap = new Map(); // Store created elements for cross-referencing
      
      if (visualization.elements && Array.isArray(visualization.elements)) {
        // First pass: create all sliders and simple elements (not functions)
        visualization.elements.forEach((element, index) => {
          if (element.type !== 'functiongraph') {
            createElementOnBoard(element, index, elementMap, boardRef.current);
          }
        });
        
        // Second pass: create function graphs that can reference sliders
        visualization.elements.forEach((element, index) => {
          if (element.type === 'functiongraph') {
            createElementOnBoard(element, index, elementMap, boardRef.current);
          }
        });
      }

      // Update the board to ensure everything is rendered
      boardRef.current.update();
      setIsLoading(false);

    } catch (initError) {
      console.error('❌ Failed to initialize JSXGraph:', initError);
      setError(initError.message);
      setIsLoading(false);
    }
  };

  // Reset the board to its initial state
  const resetBoard = () => {
    initializeBoard();
  };

  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Initialize board when component mounts or visualization changes
  useEffect(() => {
    if (visualization && !isFullscreen && jsxGraphLoaded) {
      // Retry logic to wait for DOM to be ready
      const tryInitialize = (attempt = 1, maxAttempts = 10) => {
        if (containerRef.current) {
          initializeBoard();
        } else if (attempt < maxAttempts) {
          setTimeout(() => tryInitialize(attempt + 1, maxAttempts), 100);
        } else {
          setError('Failed to initialize visualization container');
          setIsLoading(false);
        }
      };
      
      // Start trying after initial delay
      const timer = setTimeout(() => {
        tryInitialize();
      }, 300);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [visualization, jsxGraphLoaded]); // Include jsxGraphLoaded in dependencies

  // Handle fullscreen changes separately
  useEffect(() => {
    if (isFullscreen && visualization) {
      // Reinitialize board for fullscreen
      const timer = setTimeout(initializeBoard, 100);
      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanupBoard();
    };
  }, []);

  // JSXGraph loading error state
  if (jsxGraphError) {
    return (
      <div className={`border border-red-200 rounded-lg p-4 bg-red-50 ${className}`}>
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">JSXGraph Loading Error</span>
        </div>
        <p className="text-red-600 text-sm">{jsxGraphError}</p>
      </div>
    );
  }

  // Visualization error state
  if (error) {
    return (
      <div className={`border border-red-200 rounded-lg p-4 bg-red-50 ${className}`}>
        <div className="flex items-center gap-2 text-red-700 mb-2">
          <AlertCircle className="w-5 h-5" />
          <span className="font-medium">Visualization Error</span>
        </div>
        <p className="text-red-600 text-sm mb-3">{error}</p>
        {showControls && (
          <button
            onClick={resetBoard}
            className="flex items-center gap-1 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    );
  }

  // JSXGraph library loading state - show loading spinner
  if (!jsxGraphLoaded) {
    return (
      <div className={`border border-gray-200 rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center h-48">
          <div className="flex items-center gap-2 text-gray-600">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            <span>Loading JSXGraph library...</span>
          </div>
        </div>
      </div>
    );
  }

  const containerClasses = isFullscreen 
    ? "fixed inset-0 z-50 bg-white p-4 overflow-auto"
    : `border border-gray-200 rounded-lg bg-white ${className}`;

  const boardWidth = isFullscreen ? '100%' : width;
  const boardHeight = isFullscreen ? '80vh' : height;

  return (
    <div className={containerClasses}>
      {/* Header */}
      {(showTitle || showControls) && (
        <div className="flex items-center justify-between p-3 border-b border-gray-200">
          <div className="flex-1">
            {showTitle && visualization.title && (
              <div className="text-lg font-semibold text-gray-900 prose prose-sm max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkMath]}
                  rehypePlugins={[rehypeKatex]}
                  components={{
                    // Render paragraphs as inline spans for title
                    p: ({ children }) => <span>{children}</span>
                  }}
                >
                  {visualization.title}
                </ReactMarkdown>
              </div>
            )}
          </div>
          
          {showControls && (
            <div className="flex items-center gap-2">
              <button
                onClick={resetBoard}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title="Reset visualization"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              <button
                onClick={toggleFullscreen}
                className="flex items-center gap-1 px-2 py-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              
              {isFullscreen && (
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-sm transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSXGraph Container */}
      <div className="p-3 relative">
        <div 
          ref={containerRef}
          style={{ 
            width: boardWidth, 
            height: boardHeight,
            border: '1px solid #e5e7eb',
            borderRadius: '4px'
          }}
          className="jsxgraph-board"
        />
        
        {/* Loading overlay while board is initializing */}
        {isLoading && (
          <div className="absolute inset-3 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded">
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
              <span>Loading visualization...</span>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {showDescription && visualization.description && (
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-700 prose prose-sm max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {visualization.description}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* Debug info (development only) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="p-3 border-t border-gray-200 bg-gray-50">
          <summary className="text-xs text-gray-500 cursor-pointer">
            Debug Information
          </summary>
          <div className="mt-2 text-xs text-gray-600">
            <div>Elements: {visualization.elements?.length || 0}</div>
            <div>Board Config: {JSON.stringify(visualization.boardConfig, null, 2)}</div>
          </div>
        </details>
      )}
    </div>
  );
};

// Hook to load JSXGraph dynamically
export const useJSXGraph = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if JSXGraph is already loaded
    if (window.JXG && window.JXG.JSXGraph) {
      setIsLoaded(true);
      return;
    }

    // Load JSXGraph from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js';
    script.async = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      setError('Failed to load JSXGraph library');
    };

    document.head.appendChild(script);

    // Load CSS
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraph.css';
    document.head.appendChild(css);

    return () => {
      // Cleanup: remove script and CSS if component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      if (css.parentNode) {
        css.parentNode.removeChild(css);
      }
    };
  }, []);

  return { isLoaded, error };
};

export default JSXGraphVisualization;