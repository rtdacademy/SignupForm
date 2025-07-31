const { genkit, z } = require('genkit');
const { googleAI } = require('@genkit-ai/googleai');
const AI_MODELS = require('./aiSettings');

// Initialize AI instance for JSXGraph agent
let jsxGraphAI = null;

function initializeJSXGraphAI() {
  if (!jsxGraphAI) {
    jsxGraphAI = genkit({
      plugins: [googleAI()]
    });
  }
  return jsxGraphAI;
}

// Comprehensive JSXGraph documentation for the agent
const JSXGRAPH_DOCUMENTATION = `
# JSXGraph Visualization Expert

You are a specialist in creating interactive visualizations using JSXGraph. Your role is to convert visualization requests into proper JSXGraph code.

## BOARD CREATION

### Basic Board Initialization
\`\`\`javascript
var board = JXG.JSXGraph.initBoard('boardId', {
    boundingBox: [-5, 5, 5, -5],  // [x1, y1, x2, y2] - defines visible area
    axis: true,                    // Show coordinate axes
    grid: true,                    // Show grid
    showCopyright: false,          // Hide JSXGraph copyright
    showNavigation: false,         // Hide navigation buttons
    keepAspectRatio: false,        // Allow non-square grids
    zoom: {
        factorX: 1.25,            // Zoom factor for X
        factorY: 1.25,            // Zoom factor for Y  
        wheel: true               // Enable mouse wheel zoom
    },
    pan: {
        enabled: true,            // Enable panning
        needTwoFingers: false     // Allow single finger pan on mobile
    }
});
\`\`\`

### Common Board Options
- \`boundingBox: [left, top, right, bottom]\` - Defines visible coordinate range
- \`axis: true/false\` - Show/hide coordinate axes
- \`grid: true/false\` - Show/hide background grid
- \`showCopyright: false\` - Remove JSXGraph branding
- \`showNavigation: false\` - Remove zoom/pan controls

## CORE ELEMENTS

### Points
\`\`\`javascript
// Basic point
board.create('point', [x, y]);

// Named point with styling
board.create('point', [2, 3], {
    name: 'A',
    size: 4,
    color: 'red',
    face: 'o',                    // 'o', '[]', 'x', '+', '<>', '^', 'v'
    fixed: false,                 // Allow dragging
    showInfoBox: true            // Show coordinates on hover
});

// Point with custom label
board.create('point', [1, 1], {
    name: 'P_1',
    label: {offset: [5, 5]}      // Label offset from point
});
\`\`\`

### Lines
\`\`\`javascript
// Line through two points
var p1 = board.create('point', [0, 0]);
var p2 = board.create('point', [2, 1]);
board.create('line', [p1, p2]);

// Line through coordinate pairs
board.create('line', [[0, 1], [2, 3]], {
    color: 'blue',
    strokeWidth: 2,
    dash: 0                      // 0=solid, 1=dashed, 2=dotted
});

// Line segments (finite lines)
board.create('segment', [p1, p2], {color: 'green'});

// Rays (semi-infinite lines)
board.create('ray', [p1, p2], {color: 'purple'});

// Arrows/Vectors
board.create('arrow', [p1, p2], {
    lastArrow: true,             // Arrowhead at end
    strokeWidth: 3
});
\`\`\`

### Circles
\`\`\`javascript
// Circle with center and radius point
var center = board.create('point', [1, 1]);
var radiusPoint = board.create('point', [3, 1]); 
board.create('circle', [center, radiusPoint]);

// Circle with center and numeric radius
board.create('circle', [center, 2], {
    color: 'red',
    fillColor: 'yellow',
    fillOpacity: 0.3
});

// Circle through three points
var p1 = board.create('point', [0, 0]);
var p2 = board.create('point', [2, 0]); 
var p3 = board.create('point', [1, 2]);
board.create('circumcircle', [p1, p2, p3]);
\`\`\`

### Function Graphs
\`\`\`javascript
// Basic function
board.create('functiongraph', [
    function(x) { return x * x; },  // Function definition
    -3, 3                           // Domain [left, right]
], {
    color: 'blue',
    strokeWidth: 2
});

// Parametric curves
board.create('curve', [
    function(t) { return Math.cos(t); },    // x(t)
    function(t) { return Math.sin(t); },    // y(t)  
    0, 2 * Math.PI                          // Parameter range
], {
    color: 'green',
    strokeWidth: 3
});

// Implicit curves (f(x,y) = 0)
board.create('implicitcurve', [
    function(x, y) { return x*x + y*y - 4; }  // x² + y² = 4 (circle)
]);
\`\`\`

### Polygons
\`\`\`javascript
// Triangle
var A = board.create('point', [0, 0]);
var B = board.create('point', [3, 0]);
var C = board.create('point', [1.5, 2]);
board.create('polygon', [A, B, C], {
    fillColor: 'yellow',
    fillOpacity: 0.3,
    borders: {strokeColor: 'black', strokeWidth: 2}
});

// Rectangle  
board.create('polygon', [
    [0, 0], [4, 0], [4, 2], [0, 2]
], {fillColor: 'lightblue'});
\`\`\`

### Text and Labels
\`\`\`javascript
// Static text
board.create('text', [1, 3, 'Hello JSXGraph!'], {
    fontSize: 16,
    color: 'red'
});

// Dynamic text (updates with point position)
var p = board.create('point', [2, 1]);
board.create('text', [
    function() { return p.X() + 0.5; },     // Dynamic x position  
    function() { return p.Y() + 0.5; },     // Dynamic y position
    function() { return 'P = (' + p.X().toFixed(2) + ', ' + p.Y().toFixed(2) + ')'; }
]);
\`\`\`

### Interactive Elements

#### Sliders
\`\`\`javascript
var slider = board.create('slider', [
    [1, 4], [3, 4],              // Start and end points of slider
    [0, 1, 2]                    // [min, initial, max] values
], {
    name: 'a',
    snapWidth: 0.1               // Snap to increments
});

// Use slider value in other elements
board.create('functiongraph', [
    function(x) { return slider.Value() * x * x; }
]);
\`\`\`

#### Buttons
\`\`\`javascript
board.create('button', [1, 6, 'Reset', function() {
    // Button click handler
    board.update();
}]);
\`\`\`

## STYLING AND ATTRIBUTES

### Colors
- Named colors: \`'red'\`, \`'blue'\`, \`'green'\`, \`'black'\`, \`'white'\`, \`'yellow'\`, \`'orange'\`, \`'purple'\`, \`'gray'\`
- Hex colors: \`'#FF0000'\`, \`'#00FF00'\`, \`'#0000FF'\`
- RGB: \`'rgb(255, 0, 0)'\`

### Common Styling Options
\`\`\`javascript
{
    color: 'blue',               // Stroke color
    fillColor: 'yellow',         // Fill color
    fillOpacity: 0.3,           // Fill transparency (0-1)
    strokeWidth: 2,              // Line thickness
    strokeOpacity: 0.8,         // Line transparency
    dash: 2,                     // Line style (0=solid, 1=dashed, 2=dotted)
    shadow: true,                // Drop shadow
    highlight: true,             // Highlight on hover
    fixed: false,                // Allow/prevent dragging
    visible: true,               // Show/hide element
    withLabel: true,             // Show element name
    name: 'ElementName'          // Element identifier
}
\`\`\`

### Point-Specific Attributes
\`\`\`javascript
{
    size: 4,                     // Point size (1-10)
    face: 'o',                   // Point shape: 'o', '[]', 'x', '+', '<>', '^', 'v'
    showInfoBox: true           // Show coordinates on hover
}
\`\`\`

## MATHEMATICAL FUNCTIONS

### Built-in Math Functions Available
- \`Math.sin(x)\`, \`Math.cos(x)\`, \`Math.tan(x)\`
- \`Math.log(x)\`, \`Math.exp(x)\`, \`Math.sqrt(x)\`
- \`Math.abs(x)\`, \`Math.floor(x)\`, \`Math.ceil(x)\`
- \`Math.PI\`, \`Math.E\`

### Examples of Mathematical Visualizations
\`\`\`javascript
// Sine wave
board.create('functiongraph', [
    function(x) { return Math.sin(x); },
    -2*Math.PI, 2*Math.PI
]);

// Parabola
board.create('functiongraph', [
    function(x) { return 0.5 * x * x - 2; }
]);

// Circle (parametric)
board.create('curve', [
    function(t) { return 2 * Math.cos(t); },
    function(t) { return 2 * Math.sin(t); },
    0, 2*Math.PI
]);
\`\`\`

## RESPONSE FORMAT

CRITICAL: You MUST return ONLY a valid JSON object. Do not include any text before or after the JSON.

Always return a JSON object with this exact structure:
\`\`\`json
{
  "title": "Brief description of the visualization",
  "description": "Detailed explanation of what the visualization shows and how to interact with it",
  "boardConfig": {
    "boundingBox": [-5, 5, 5, -5],
    "axis": true,
    "grid": true,
    "showCopyright": false
  },
  "elements": [
    {
      "type": "point",
      "coords": [1, 2],
      "attributes": {
        "name": "$A$",
        "color": "red",
        "size": 4
      }
    },
    {
      "type": "functiongraph", 
      "coords": [
        "function(x) { return Math.sin(x); }",
        -6.28, 6.28
      ],
      "attributes": {
        "color": "blue",
        "strokeWidth": 2,
        "name": "$y = \\sin(x)$"
      }
    }
  ],
  "jsxCode": "// Complete JSXGraph code for reference\\nvar board = JXG.JSXGraph.initBoard('board', {...});\\nboard.create('functiongraph', [function(x) { return Math.sin(x); }]);"
}
\`\`\`

EXAMPLE FOR SIMPLE SINE WAVE:
\`\`\`json
{
  "title": "Sine Wave Function",
  "description": "Basic sine wave showing $y = \\sin(x)$. The wave oscillates between $-1$ and $1$ with period $2\\pi$.",
  "boardConfig": {
    "boundingBox": [-7, 2, 7, -2],
    "axis": true,
    "grid": true,
    "showCopyright": false
  },
  "elements": [
    {
      "type": "functiongraph",
      "coords": [
        "function(x) { return Math.sin(x); }",
        -6.28, 6.28
      ],
      "attributes": {
        "color": "blue",
        "strokeWidth": 3,
        "name": "$y = \\sin(x)$"
      }
    }
  ],
  "jsxCode": "// JSXGraph code for Sine Wave Function"
}
\`\`\`

EXAMPLE FOR INTERACTIVE SINE WAVE WITH SLIDERS:
\`\`\`json
{
  "title": "Interactive Sine Wave",
  "description": "Adjustable sine wave $y = A \\cdot \\sin(B \\cdot x)$. Use sliders to change amplitude ($A$) and frequency ($B$).",
  "boardConfig": {
    "boundingBox": [-7, 4, 7, -3],
    "axis": true,
    "grid": true,
    "showCopyright": false
  },
  "elements": [
    {
      "type": "slider",
      "coords": [[-6, 3], [-3, 3], [0.5, 1, 3]],
      "attributes": {
        "name": "$A$",
        "snapWidth": 0.1,
        "withLabel": true
      }
    },
    {
      "type": "slider",
      "coords": [[-6, 2.5], [-3, 2.5], [0.1, 1, 2]],
      "attributes": {
        "name": "$B$", 
        "snapWidth": 0.1,
        "withLabel": true
      }
    },
    {
      "type": "functiongraph",
      "coords": [
        "function(x) { return A.Value() * Math.sin(B.Value() * x); }",
        -6.28, 6.28
      ],
      "attributes": {
        "color": "blue",
        "strokeWidth": 3,
        "name": "$y = A \\cdot \\sin(B \\cdot x)$"
      }
    }
  ],
  "jsxCode": "// JSXGraph code for Interactive Sine Wave"
}
\`\`\`

## BEST PRACTICES

1. **Always set appropriate boundingBox** to show all important elements
2. **Use meaningful names** for points and elements
3. **Choose contrasting colors** for visibility
4. **Add labels and descriptions** to make visualizations educational
5. **Keep interactions simple** - drag points, move sliders
6. **Test coordinate ranges** to ensure everything fits in view
7. **Use consistent styling** throughout the visualization

## COMMON VISUALIZATION TYPES

### Geometry
- Triangles, polygons, circles
- Angle measurements
- Geometric constructions
- Transformations

### Algebra  
- Function graphs (linear, quadratic, exponential, trigonometric)
- Systems of equations
- Parametric curves
- Implicit functions

### Calculus
- Tangent lines and derivatives
- Area under curves (Riemann sums)
- Animation of limits

### Physics
- Vector fields
- Particle motion
- Wave functions
- Force diagrams

### Statistics
- Data plots
- Regression lines
- Probability distributions

Remember: You are creating educational visualizations that should enhance understanding. Always include clear labels, appropriate scales, and interactive elements when helpful.
`;

/**
 * Create JSXGraph visualization using the AI agent
 * This is a helper function that can be called by the Genkit tool
 */
const createJSXGraphVisualization = async (input) => {
  try {
    const ai = initializeJSXGraphAI();
    
    console.log("🎨 JSXGraph Agent received request:", input.description);
    
    const { description, context = '', subject = 'general' } = input;

    if (!description) {
      throw new Error('Description is required for JSXGraph visualization');
    }

    // Create the specialized prompt for JSXGraph visualization
    const visualizationPrompt = `
${JSXGRAPH_DOCUMENTATION}

## REQUEST
Create a JSXGraph visualization for: "${description}"

${context ? `## ADDITIONAL CONTEXT\n${context}\n` : ''}

${subject ? `## SUBJECT AREA\n${subject}\n` : ''}

## REQUIREMENTS
1. Create a simple, educational visualization
2. Use basic colors and minimal styling
3. Include essential labels only
4. Set boundingBox to [-5, 5, 5, -5] unless specified otherwise
5. **ALWAYS use LaTeX formatting for mathematical expressions**: Wrap all math in single $ or double $$ symbols
6. Return ONLY valid JSON in the exact format specified above

### LaTeX Formatting Rules:
- Single variables: $x$, $y$, $A$, $B$
- Functions: $\\sin(x)$, $\\cos(x)$, $\\tan(x)$, $\\log(x)$
- Equations: $y = \\sin(x)$, $f(x) = ax^2 + bx + c$
- Constants: $\\pi$, $e$, numbers can be plain or in math: $2\\pi$
- Operations: $\\cdot$ for multiplication, $\\frac{a}{b}$ for fractions
- Exponents: $x^2$, $e^{-x}$
- Greek letters: $\\alpha$, $\\beta$, $\\gamma$, $\\theta$, $\\phi$

CRITICAL: Your response must be ONLY the JSON object. Do not include any explanatory text, markdown formatting, or anything else. Just the raw JSON object that can be parsed directly.

IMPORTANT: Keep the jsxCode field VERY SHORT - just a comment like "// JSXGraph code for [visualization name]" to avoid truncation.

Keep the visualization FOCUSED and EDUCATIONAL:
- Maximum 5 elements total for complex interactive visualizations
- For simple requests, use basic functiongraph or points
- For interactive requests, sliders are encouraged for educational value
- Common element types: functiongraph, point, line, circle, slider
- Keep descriptions clear and educational

Focus on creating visualizations that help students understand concepts.
`;

    // Use text generation without structured output to avoid schema issues
    console.log('🔧 About to call AI.generate with prompt length:', visualizationPrompt.length);
    
    let response;
    try {
      const { text } = await ai.generate({
        model: googleAI.model(AI_MODELS.GEMINI.FLASH),
        prompt: visualizationPrompt,
        config: {
          temperature: AI_MODELS.TEMPERATURE.FOCUSED, // Use focused temperature for consistent JSON output
          maxOutputTokens: 8000 // Increased token limit to prevent truncation of complex JSON
        }
      });
      
      response = { text }; // Store text in response object for compatibility
      
      console.log('🔧 AI.generate call completed successfully');
      console.log('🔧 Response object keys:', Object.keys(response || {}));
      console.log('🔧 Response text:', response.text);
      console.log('🔧 Response text length:', response.text?.length || 0);
    } catch (generateError) {
      console.error('❌ AI.generate failed with error:', generateError);
      console.error('❌ Error message:', generateError.message);
      console.error('❌ Error stack:', generateError.stack);
      
      return {
        success: false,
        visualization: {
          title: "Visualization Error",
          description: `AI generation failed: ${generateError.message}`,
          boardConfig: {
            boundingBox: [-5, 5, 5, -5],
            axis: true,
            grid: false,
            showCopyright: false
          },
          elements: [],
          jsxCode: "// AI generation failed"
        },
        generatedBy: 'jsxGraphAgent',
        error: `AI generation failed: ${generateError.message}`
      };
    }

    console.log("🎨 JSXGraph Agent generated visualization");
    console.log("🔍 Response object:", response);
    console.log("🔍 Raw response text:", response.text);
    
    // Parse the text response for JSON
    let visualizationData;
    
    if (!response || !response.text) {
      return {
        success: false,
        visualization: {
          title: "Visualization Error",
          description: "No response text received from AI model. Response object: " + JSON.stringify(response),
          boardConfig: {
            boundingBox: [-5, 5, 5, -5],
            axis: true,
            grid: false,
            showCopyright: false
          },
          elements: [],
          jsxCode: "// No response from AI model"
        },
        generatedBy: 'jsxGraphAgent',
        error: 'No response text received from AI model'
      };
    }
    
    try {
      // Multiple strategies to extract JSON from response
      let jsonText = response.text.trim();
      
      // Strategy 1: Extract from ```json markdown blocks
      const jsonMarkdownMatch = jsonText.match(/```json\s*\n([\s\S]*?)\n```/);
      if (jsonMarkdownMatch) {
        jsonText = jsonMarkdownMatch[1].trim();
        console.log("🔍 Extracted JSON from markdown block");
      }
      // Strategy 2: Extract from generic ``` blocks
      else {
        const genericMarkdownMatch = jsonText.match(/```\s*\n([\s\S]*?)\n```/);
        if (genericMarkdownMatch) {
          jsonText = genericMarkdownMatch[1].trim();
          console.log("🔍 Extracted JSON from generic markdown block");
        }
      }
      
      // Strategy 3: Find JSON object boundaries if no markdown
      if (!jsonText.startsWith('{')) {
        const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
        if (jsonObjectMatch) {
          jsonText = jsonObjectMatch[0];
          console.log("🔍 Extracted JSON object from text");
        }
      }
      
      console.log("🔍 Attempting to parse JSON (length:", jsonText.length, ")");
      console.log("🔍 JSON preview:", jsonText.substring(0, 200) + "...");
      
      // Check if JSON appears to be truncated
      if (!jsonText.trim().endsWith('}')) {
        console.warn("⚠️ JSON appears to be truncated (doesn't end with })");
      }
      
      visualizationData = JSON.parse(jsonText);
      console.log("✅ Successfully parsed visualization JSON");
    } catch (parseError) {
      console.warn("❌ Failed to parse JSXGraph response as JSON:", parseError.message);
      console.warn("📝 Raw response that failed to parse:", response.text);
      
      // Return an error result with a dummy visualization to satisfy schema
      return {
        success: false,
        visualization: {
          title: "Visualization Error",
          description: `Failed to generate visualization: ${parseError.message}`,
          boardConfig: {
            boundingBox: [-5, 5, 5, -5],
            axis: true,
            grid: false,
            showCopyright: false
          },
          elements: [],
          jsxCode: "// Error generating visualization"
        },
        generatedBy: 'jsxGraphAgent',
        error: `Failed to parse visualization JSON: ${parseError.message}`,
        rawResponse: response.text
      };
    }

    return {
      success: true,
      visualization: visualizationData,
      generatedBy: 'jsxGraphAgent'
    };

  } catch (error) {
    console.error('Error in JSXGraph agent:', error);
    throw new Error(`JSXGraph visualization failed: ${error.message}`);
  }
};

module.exports = {
  createJSXGraphVisualization
};