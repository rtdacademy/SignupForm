import React, { useEffect, useRef, useState } from 'react';

// Hook to load JSXGraph dynamically
const useJSXGraph = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔍 useJSXGraph hook starting...');
    
    // Check if JSXGraph is already loaded
    if (window.JXG && window.JXG.JSXGraph) {
      console.log('✅ JSXGraph already loaded');
      setIsLoaded(true);
      return;
    }

    console.log('🔍 JSXGraph not loaded, creating script element...');

    // Load JSXGraph from CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/jsxgraph@1.11.1/distrib/jsxgraphcore.js';
    script.async = true;
    
    script.onload = () => {
      console.log('✅ JSXGraph script loaded successfully');
      console.log('🔍 window.JXG after load:', !!window.JXG);
      console.log('🔍 window.JXG.JSXGraph after load:', !!(window.JXG && window.JXG.JSXGraph));
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      const errorMsg = 'Failed to load JSXGraph library';
      console.error('❌', errorMsg);
      setError(errorMsg);
    };

    console.log('🔍 Appending script to document head...');
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

// Simple JSXGraph Component
const SimpleJSXGraph = ({ containerId, title, initFunction, height = 400, jsxGraphLoaded }) => {
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!jsxGraphLoaded || !containerRef.current) return;

    try {
      setError(null);

      // Clean up any existing board
      if (boardRef.current && window.JXG && window.JXG.JSXGraph && window.JXG.JSXGraph.freeBoard) {
        window.JXG.JSXGraph.freeBoard(boardRef.current);
        boardRef.current = null;
      }

      // Initialize the board and store reference
      boardRef.current = initFunction(containerRef.current);
      
    } catch (err) {
      console.error('❌ Error creating JSXGraph:', err);
      setError(err.message);
    }

    // Cleanup function
    return () => {
      if (boardRef.current && window.JXG && window.JXG.JSXGraph && window.JXG.JSXGraph.freeBoard) {
        try {
          window.JXG.JSXGraph.freeBoard(boardRef.current);
        } catch (cleanupError) {
          console.warn('Warning during cleanup:', cleanupError);
        }
        boardRef.current = null;
      }
    };
  }, [jsxGraphLoaded, initFunction]);

  if (error) {
    return (
      <div className="border border-red-200 rounded-lg p-4 bg-red-50">
        <div className="text-red-700 font-medium">{title} - Error</div>
        <p className="text-red-600 text-sm mt-1">{error}</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white p-4">
      <h3 className="text-lg font-semibold mb-3">{title}</h3>
      <div 
        ref={containerRef}
        style={{ 
          width: '100%', 
          height: `${height}px`,
          border: '1px solid #e5e7eb',
          borderRadius: '4px'
        }}
      />
    </div>
  );
};

const JSXGraphTest = () => {
  const { isLoaded: jsxGraphLoaded, error: jsxGraphError } = useJSXGraph();
  
  // Debug the loading state
  console.log('🔍 JSXGraphTest render - jsxGraphLoaded:', jsxGraphLoaded, 'error:', jsxGraphError);
  console.log('🔍 window.JXG availability:', !!window.JXG);
  console.log('🔍 window.JXG.JSXGraph availability:', !!(window.JXG && window.JXG.JSXGraph));

  // Test 1: Simple sine wave
  const createSineWave = (container) => {
    const board = window.JXG.JSXGraph.initBoard(container, {
      boundingBox: [-7, 2, 7, -2],
      axis: true,
      grid: true,
      showCopyright: false
    });

    // Create a simple sine function
    const sineGraph = board.create('functiongraph', ['sin(x)'], {
      strokeColor: 'blue',
      strokeWidth: 3
    });

    return board;
  };

  // Test 2: Interactive sine wave with sliders
  const createInteractiveSine = (container) => {
    const board = window.JXG.JSXGraph.initBoard(container, {
      boundingBox: [-7, 3.5, 7, -3.5],
      axis: true,
      grid: true,
      showCopyright: false
    });

    // Create amplitude slider
    const amplitudeSlider = board.create('slider', [
      [-6, 3], [-3, 3], [0.5, 1, 3]
    ], {
      name: 'Amplitude',
      snapWidth: 0.1,
      withLabel: true
    });

    // Create frequency slider
    const frequencySlider = board.create('slider', [
      [-6, 2.5], [-3, 2.5], [0.1, 1, 2]
    ], {
      name: 'Frequency',
      snapWidth: 0.1,
      withLabel: true
    });

    // Create interactive function
    const interactiveGraph = board.create('functiongraph', [
      function(x) { 
        return amplitudeSlider.Value() * Math.sin(frequencySlider.Value() * x); 
      }
    ], {
      strokeColor: 'red',
      strokeWidth: 3
    });

    return board;
  };

  // Test 3: Points and lines
  const createPointsAndLines = (container) => {
    const board = window.JXG.JSXGraph.initBoard(container, {
      boundingBox: [-5, 5, 5, -5],
      axis: true,
      grid: true,
      showCopyright: false
    });

    // Create some points
    const pointA = board.create('point', [-2, 3], {
      name: 'A',
      size: 4,
      fillColor: 'red'
    });

    const pointB = board.create('point', [2, -1], {
      name: 'B',
      size: 4,
      fillColor: 'blue'
    });

    // Create a line through the points
    const line = board.create('line', [pointA, pointB], {
      strokeColor: 'green',
      strokeWidth: 2
    });

    // Create a movable point on the line
    const pointC = board.create('glider', [0, 1, line], {
      name: 'C',
      size: 4,
      fillColor: 'orange'
    });

    return board;
  };

  // Test 4: Parabola with sliders
  const createParabola = (container) => {
    const board = window.JXG.JSXGraph.initBoard(container, {
      boundingBox: [-10, 10, 10, -10],
      axis: true,
      grid: true,
      showCopyright: false
    });

    // Create sliders for parabola y = ax² + bx + c
    const sliderA = board.create('slider', [
      [2, -5], [7, -5], [-5, 1, 5]
    ], {
      name: 'a',
      snapWidth: 0.1
    });

    const sliderB = board.create('slider', [
      [2, -6], [7, -6], [-5, 0, 5]
    ], {
      name: 'b',
      snapWidth: 0.1
    });

    const sliderC = board.create('slider', [
      [2, -7], [7, -7], [-5, 0, 5]
    ], {
      name: 'c',
      snapWidth: 0.1
    });

    // Create the parabola
    const parabola = board.create('functiongraph', [
      function(x) {
        return sliderA.Value() * x * x + sliderB.Value() * x + sliderC.Value();
      }
    ], {
      strokeColor: 'purple',
      strokeWidth: 3
    });

    return board;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">JSXGraph Direct Implementation Test</h1>
        
        {/* JSXGraph Loading Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">JSXGraph Library Status</h2>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Library Loaded:</span>
              <span className={`px-2 py-1 rounded text-sm ${jsxGraphLoaded ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {jsxGraphLoaded ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">Window.JXG Available:</span>
              <span className={`px-2 py-1 rounded text-sm ${!!window.JXG ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {!!window.JXG ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="font-medium">JSXGraph Constructor:</span>
              <span className={`px-2 py-1 rounded text-sm ${!!(window.JXG && window.JXG.JSXGraph) ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {!!(window.JXG && window.JXG.JSXGraph) ? '✅ Yes' : '❌ No'}
              </span>
            </div>
            
            {jsxGraphError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                <h3 className="font-medium text-red-800">Loading Error:</h3>
                <p className="text-red-700 mt-1">{jsxGraphError}</p>
              </div>
            )}
          </div>
        </div>

        {jsxGraphLoaded ? (
          <div className="space-y-8">
            {/* Test 1: Simple Sine Wave */}
            <SimpleJSXGraph
              containerId="test1"
              title="Test 1: Simple Sine Wave"
              initFunction={createSineWave}
              height={300}
              jsxGraphLoaded={jsxGraphLoaded}
            />

            {/* Test 2: Interactive Sine Wave */}
            <SimpleJSXGraph
              containerId="test2"
              title="Test 2: Interactive Sine Wave with Sliders"
              initFunction={createInteractiveSine}
              height={400}
              jsxGraphLoaded={jsxGraphLoaded}
            />

            {/* Test 3: Points and Lines */}
            <SimpleJSXGraph
              containerId="test3"
              title="Test 3: Interactive Points and Lines"
              initFunction={createPointsAndLines}
              height={400}
              jsxGraphLoaded={jsxGraphLoaded}
            />

            {/* Test 4: Parabola with Sliders */}
            <SimpleJSXGraph
              containerId="test4"
              title="Test 4: Interactive Parabola (ax² + bx + c)"
              initFunction={createParabola}
              height={400}
              jsxGraphLoaded={jsxGraphLoaded}
            />
          </div>
        ) : jsxGraphError ? (
          <div className="text-center py-8 text-red-600">
            <p className="font-medium">JSXGraph Loading Error</p>
            <p className="text-sm mt-1">{jsxGraphError}</p>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
            Loading JSXGraph library...
          </div>
        )}

        {/* Code Examples */}
        {jsxGraphLoaded && (
          <div className="bg-white rounded-lg shadow p-6 mt-8">
            <h2 className="text-xl font-semibold mb-4">Code Examples</h2>
            <div className="space-y-4">
              
              <div>
                <h3 className="font-medium text-gray-800 mb-2">1. Simple Sine Wave:</h3>
                <pre className="text-sm p-4 bg-gray-100 rounded overflow-x-auto">
{`const board = JXG.JSXGraph.initBoard(container, {
  boundingBox: [-7, 2, 7, -2],
  axis: true,
  grid: true,
  showCopyright: false
});

const sineGraph = board.create('functiongraph', ['sin(x)'], {
  strokeColor: 'blue',
  strokeWidth: 3
});`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">2. Interactive Function with Sliders:</h3>
                <pre className="text-sm p-4 bg-gray-100 rounded overflow-x-auto">
{`// Create sliders
const amplitudeSlider = board.create('slider', [
  [-6, 3], [-3, 3], [0.5, 1, 3]
], { name: 'Amplitude', snapWidth: 0.1 });

// Create dynamic function
const interactiveGraph = board.create('functiongraph', [
  function(x) { 
    return amplitudeSlider.Value() * Math.sin(x); 
  }
], { strokeColor: 'red', strokeWidth: 3 });`}
                </pre>
              </div>

              <div>
                <h3 className="font-medium text-gray-800 mb-2">3. Points and Lines:</h3>
                <pre className="text-sm p-4 bg-gray-100 rounded overflow-x-auto">
{`// Create points
const pointA = board.create('point', [-2, 3], {
  name: 'A', size: 4, fillColor: 'red'
});

// Create line through points
const line = board.create('line', [pointA, pointB], {
  strokeColor: 'green', strokeWidth: 2
});`}
                </pre>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSXGraphTest;