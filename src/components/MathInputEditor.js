import React, { useRef, useState } from 'react';
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import katex from 'katex';

/**
 * MathInputEditor - A reusable component for mixed text and equation input
 * with easy-to-use formatting buttons and live preview
 */
const MathInputEditor = ({
  value = '',
  onChange,
  placeholder = 'Type your answer here. Use $ for inline math like $\\lambda = 650$ or $$ for display math like $$\\frac{a}{b}$$',
  label = 'Answer',
  rows = 4,
  showPreview = true,
  className = '',
  enabledCategories = ['greek', 'functions', 'fractions', 'powers', 'operations'], // All categories by default
  seamlessMode = false // New prop for WYSIWYG experience
}) => {
  const textareaRef = useRef(null);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [isInMathMode, setIsInMathMode] = useState(false);
  const [equationEditorOpen, setEquationEditorOpen] = useState(false);
  const [equationEditorType, setEquationEditorType] = useState('inline');
  const [equationEditorValue, setEquationEditorValue] = useState('');
  const [insertPosition, setInsertPosition] = useState(0);
  const [editingEquation, setEditingEquation] = useState(null); // {start, end, type}
  const [equationError, setEquationError] = useState(false);
  
  // Validate LaTeX equation
  const validateLatex = (latex) => {
    try {
      katex.renderToString(latex, { throwOnError: true });
      return { valid: true, error: null };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  };

  // Apply auto-replacements for common patterns
  const applyAutoReplacements = (text, cursorPos) => {
    let newText = text;
    let newCursorPos = cursorPos;
    
    // Define replacements with regex patterns
    const replacements = [
      // Fraction: a/b → \frac{a}{b}
      {
        pattern: /([a-zA-Z0-9]+)\/([a-zA-Z0-9]+)/g,
        replacement: '\\frac{$1}{$2}',
        cursorOffset: 0
      },
      // Square root: sqrt5 → \sqrt{5}, sqrtx → \sqrt{x}
      {
        pattern: /sqrt([a-zA-Z0-9]+)/g,
        replacement: '\\sqrt{$1}',
        cursorOffset: 0
      },
      // Arrows
      { pattern: /->/g, replacement: '\\rightarrow', cursorOffset: 0 },
      { pattern: /<-/g, replacement: '\\leftarrow', cursorOffset: 0 },
      { pattern: /<=>/g, replacement: '\\leftrightarrow', cursorOffset: 0 },
      // Comparisons
      { pattern: /<=/g, replacement: '\\leq', cursorOffset: 0 },
      { pattern: />=/g, replacement: '\\geq', cursorOffset: 0 },
      { pattern: /!=/g, replacement: '\\neq', cursorOffset: 0 },
      { pattern: /~=/g, replacement: '\\approx', cursorOffset: 0 },
      // Greek letters (only when not already preceded by \)
      { pattern: /(?<!\\)alpha/g, replacement: '\\alpha', cursorOffset: 0 },
      { pattern: /(?<!\\)beta/g, replacement: '\\beta', cursorOffset: 0 },
      { pattern: /(?<!\\)gamma/g, replacement: '\\gamma', cursorOffset: 0 },
      { pattern: /(?<!\\)delta/g, replacement: '\\delta', cursorOffset: 0 },
      { pattern: /(?<!\\)theta/g, replacement: '\\theta', cursorOffset: 0 },
      { pattern: /(?<!\\)lambda/g, replacement: '\\lambda', cursorOffset: 0 },
      { pattern: /(?<!\\)pi/g, replacement: '\\pi', cursorOffset: 0 },
      { pattern: /(?<!\\)omega/g, replacement: '\\omega', cursorOffset: 0 },
      // Common functions
      { pattern: /(?<!\\)sum/g, replacement: '\\sum', cursorOffset: 0 },
      { pattern: /(?<!\\)int/g, replacement: '\\int', cursorOffset: 0 },
      { pattern: /(?<!\\)lim/g, replacement: '\\lim', cursorOffset: 0 },
      // Times
      { pattern: /\*/g, replacement: '\\times', cursorOffset: 0 },
      { pattern: /\.\.\./g, replacement: '\\cdots', cursorOffset: 0 }
    ];
    
    // Apply replacements and track cursor position changes
    replacements.forEach(({ pattern, replacement }) => {
      const beforeLength = newText.length;
      newText = newText.replace(pattern, replacement);
      const afterLength = newText.length;
      
      // Adjust cursor position if text before cursor was affected
      if (afterLength !== beforeLength) {
        const lengthDiff = afterLength - beforeLength;
        // Simple adjustment - could be made more sophisticated
        if (cursorPos > text.length / 2) {
          newCursorPos += lengthDiff;
        }
      }
    });
    
    return { text: newText, cursorPos: newCursorPos };
  };

  // Get equation regions for pointer event management (inline only)
  const getEquationRegions = (text) => {
    const regions = [];
    
    // Find inline equations only
    const inlineRegex = /\$[^$]*?\$/g;
    let match;
    while ((match = inlineRegex.exec(text)) !== null) {
      regions.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'inline'
      });
    }
    
    return regions;
  };

  // Auto-resize handler for textarea
  const handleTextareaResize = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    // Reset height to auto to get the scroll height
    textarea.style.height = 'auto';
    
    // Set height to scroll height to fit content
    const newHeight = Math.max(96, textarea.scrollHeight); // Minimum 96px
    textarea.style.height = `${newHeight}px`;
    
    // Update preview height to match in seamless mode
    if (seamlessMode) {
      const preview = textarea.parentElement.querySelector('.preview-content');
      if (preview) {
        preview.style.height = `${newHeight}px`;
      }
    }
  };

  // Check if cursor is inside math delimiters
  const checkMathMode = (text, position) => {
    if (!text) return false;
    
    // Find all math regions in the text
    const mathRegions = [];
    
    // Find display math regions ($$...$$)
    const displayMathRegex = /\$\$(.*?)\$\$/g;
    let match;
    while ((match = displayMathRegex.exec(text)) !== null) {
      mathRegions.push({
        start: match.index + 2, // After opening $$
        end: match.index + match[0].length - 2, // Before closing $$
        type: 'display'
      });
    }
    
    // Find inline math regions ($...$) - but exclude display math
    const inlineMathRegex = /\$([^$]*?)\$/g;
    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Check if this is part of a display math (avoid double counting)
      const isPartOfDisplay = mathRegions.some(region => 
        match.index >= region.start - 2 && match.index < region.end + 2
      );
      
      if (!isPartOfDisplay) {
        mathRegions.push({
          start: match.index + 1, // After opening $
          end: match.index + match[0].length - 1, // Before closing $
          type: 'inline'
        });
      }
    }
    
    // Check if cursor position is within any math region
    return mathRegions.some(region => position > region.start && position < region.end);
  };

  // Update cursor position
  const updateCursorState = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const position = textarea.selectionStart;
    setCursorPosition(position);
    
    // In seamless mode, we don't use the old math mode
    if (!seamlessMode) {
      const text = textarea.value || '';
      setIsInMathMode(checkMathMode(text, position));
    }
  };

  // Insert symbol into text at cursor position
  const insertSymbol = (symbol) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    
    const newValue = currentValue.substring(0, start) + symbol + currentValue.substring(end);
    onChange(newValue);
    
    // Set cursor position after inserted symbol
    setTimeout(() => {
      if (symbol.includes('{}')) {
        // For symbols with {}, place cursor inside the braces
        const bracePosition = start + symbol.indexOf('{}') + 1;
        textarea.setSelectionRange(bracePosition, bracePosition);
      } else {
        const newPosition = start + symbol.length;
        textarea.setSelectionRange(newPosition, newPosition);
      }
      textarea.focus();
      updateCursorState(); // Update math mode status after insertion
    }, 0);
  };

  // Open equation editor (seamless mode)
  const openEquationEditor = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    setInsertPosition(textarea.selectionStart);
    setEquationEditorType(type);
    setEquationEditorValue('');
    setEditingEquation(null);
    setEquationError(false);
    setEquationEditorOpen(true);
  };

  // Open equation editor for editing existing equation
  const editEquation = (start, end, content, type) => {
    setEditingEquation({ start, end, type });
    setEquationEditorType(type);
    setEquationEditorValue(content);
    setEquationError(false);
    setEquationEditorOpen(true);
  };

  // Insert equation from editor
  const insertEquationFromEditor = () => {
    const currentValue = value || '';
    const equation = `$${equationEditorValue}$`; // Always inline
    
    let newValue;
    let focusPosition;
    
    if (editingEquation) {
      // Replace existing equation
      newValue = 
        currentValue.substring(0, editingEquation.start) + 
        equation + 
        currentValue.substring(editingEquation.end);
      focusPosition = editingEquation.start + equation.length;
    } else {
      // Insert new equation
      newValue = 
        currentValue.substring(0, insertPosition) + 
        equation + 
        currentValue.substring(insertPosition);
      focusPosition = insertPosition + equation.length;
    }
    
    onChange(newValue);
    setEquationEditorOpen(false);
    setEquationEditorValue('');
    setEditingEquation(null);
    
    // Focus back on textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.setSelectionRange(focusPosition, focusPosition);
        textareaRef.current.focus();
        updateCursorState();
      }
    }, 0);
  };

  // Insert equation wrapper (regular mode)
  const insertEquation = (type) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentValue = value || '';
    const selectedText = currentValue.substring(start, end);
    
    let wrapper;
    let cursorOffset;
    
    if (type === 'inline') {
      wrapper = selectedText ? `$${selectedText}$` : '${}$';
      cursorOffset = selectedText ? 0 : 2; // Place cursor inside $ $
    } else { // display
      wrapper = selectedText ? `$$${selectedText}$$` : '$${}$$';
      cursorOffset = selectedText ? 0 : 3; // Place cursor inside $$ $$
    }
    
    const newValue = currentValue.substring(0, start) + wrapper + currentValue.substring(end);
    onChange(newValue);
    
    // Set cursor position
    setTimeout(() => {
      if (selectedText) {
        // If text was selected, place cursor after the wrapper
        textarea.setSelectionRange(start + wrapper.length, start + wrapper.length);
      } else {
        // If no selection, place cursor inside the equation markers
        const bracePosition = start + wrapper.indexOf('{}') + 1;
        textarea.setSelectionRange(bracePosition, bracePosition);
      }
      textarea.focus();
      updateCursorState(); // Update math mode status after insertion
    }, 0);
  };

  // Render mixed text and math content (inline only)
  const renderMixedContent = (text) => {
    if (!text) return null;
    
    // Only render inline content now
    return renderInlineContent(text, 0, 0);
  };

  // Render text with inline math
  const renderInlineContent = (text, startKey = 0, globalOffset = 0) => {
    const parts = [];
    let currentIndex = 0;
    
    // Split by inline math ($...$)
    const inlineMathRegex = /\$(.*?)\$/g;
    let match;
    
    while ((match = inlineMathRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        const beforeText = text.substring(currentIndex, match.index);
        if (beforeText) {
          // Split by line breaks and render each line
          const lines = beforeText.split('\n');
          lines.forEach((line, lineIndex) => {
            if (lineIndex > 0) {
              parts.push(<br key={startKey + parts.length} />);
            }
            if (line) {
              parts.push(
                <span key={startKey + parts.length}>
                  {line}
                </span>
              );
            }
          });
        }
      }
      
      // Add inline math with visual indicators in seamless mode
      if (seamlessMode) {
        const equationStart = globalOffset + match.index;
        const equationEnd = globalOffset + match.index + match[0].length;
        const equationContent = match[1];
        
        parts.push(
          <span 
            key={startKey + parts.length} 
            className="inline-block bg-blue-50 border border-blue-200 rounded px-1 cursor-pointer hover:bg-blue-100 transition-colors"
            style={{ pointerEvents: 'none' }}
          >
            {match[1] ? (
              <InlineMath math={match[1]} />
            ) : (
              <span className="text-gray-400 italic text-sm">equation</span>
            )}
          </span>
        );
      } else {
        try {
          parts.push(
            <InlineMath key={startKey + parts.length} math={match[1]} />
          );
        } catch (e) {
          parts.push(
            <span key={startKey + parts.length} className="text-red-500">
              Error: {match[0]}
            </span>
          );
        }
      }
      
      currentIndex = inlineMathRegex.lastIndex;
    }
    
    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.substring(currentIndex);
      if (remainingText) {
        // Split by line breaks and render each line
        const lines = remainingText.split('\n');
        lines.forEach((line, lineIndex) => {
          if (lineIndex > 0) {
            parts.push(<br key={startKey + parts.length} />);
          }
          if (line) {
            parts.push(
              <span key={startKey + parts.length}>
                {line}
              </span>
            );
          }
        });
      }
    }
    
    return parts;
  };

  // All available symbol categories
  const allSymbolCategories = [
    {
      id: 'greek',
      name: 'Greek Letters',
      icon: 'λ',
      color: 'blue',
      symbols: [
        { symbol: '\\lambda', label: 'λ (lambda)' },
        { symbol: '\\theta', label: 'θ (theta)' },
        { symbol: '\\pi', label: 'π (pi)' },
        { symbol: '\\alpha', label: 'α (alpha)' },
        { symbol: '\\beta', label: 'β (beta)' },
        { symbol: '\\gamma', label: 'γ (gamma)' },
        { symbol: '\\delta', label: 'δ (delta)' },
        { symbol: '\\omega', label: 'ω (omega)' }
      ]
    },
    {
      id: 'functions',
      name: 'Functions',
      icon: 'sin',
      color: 'green',
      symbols: [
        { symbol: '\\sin', label: 'sin' },
        { symbol: '\\cos', label: 'cos' },
        { symbol: '\\tan', label: 'tan' },
        { symbol: '\\log', label: 'log' },
        { symbol: '\\ln', label: 'ln' },
        { symbol: '\\exp', label: 'exp' }
      ]
    },
    {
      id: 'fractions',
      name: 'Fractions & Roots',
      icon: '√',
      color: 'purple',
      symbols: [
        { symbol: '\\frac{}{}', label: 'Fraction' },
        { symbol: '\\sqrt{}', label: '√ (sqrt)' },
        { symbol: '\\sqrt[3]{}', label: '∛ (cube root)' },
        { symbol: '\\sqrt[n]{}', label: 'nth root' }
      ]
    },
    {
      id: 'powers',
      name: 'Powers & Subscripts',
      icon: 'x²',
      color: 'red',
      symbols: [
        { symbol: '^2', label: 'x² (square)' },
        { symbol: '^3', label: 'x³ (cube)' },
        { symbol: '^{}', label: 'x^n (power)' },
        { symbol: '_{}', label: 'x₁ (subscript)' },
        { symbol: '_{ave}', label: 'average subscript' },
        { symbol: '_{max}', label: 'max subscript' }
      ]
    },
    {
      id: 'operations',
      name: 'Operations',
      icon: '×',
      color: 'gray',
      symbols: [
        { symbol: '\\times', label: '× (times)' },
        { symbol: '\\cdot', label: '· (dot)' },
        { symbol: '\\pm', label: '± (plus-minus)' },
        { symbol: '\\approx', label: '≈ (approx)' },
        { symbol: '\\leq', label: '≤ (less equal)' },
        { symbol: '\\geq', label: '≥ (greater equal)' },
        { symbol: '\\neq', label: '≠ (not equal)' },
        { symbol: '\\propto', label: '∝ (proportional)' }
      ]
    }
  ];

  // Filter categories based on enabled categories
  const symbolCategories = allSymbolCategories.filter(category => 
    enabledCategories.includes(category.id)
  );

  // Equation wrapper buttons
  const equationButtons = [
    { type: 'inline', label: 'Insert Inline Equation ($)', color: 'indigo' },
    { type: 'display', label: 'Insert Display Equation ($$)', color: 'indigo' }
  ];

  const getButtonColor = (color) => {
    const colors = {
      indigo: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      slate: 'bg-slate-100 text-slate-700 hover:bg-slate-200',
      blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: 'bg-green-100 text-green-700 hover:bg-green-200',
      purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      red: 'bg-red-100 text-red-700 hover:bg-red-200',
      gray: 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    };
    return colors[color] || colors.gray;
  };

  if (seamlessMode) {
    return (
      <div className={`space-y-3 ${className}`}>
        {label && (
          <label className="block text-gray-700 font-semibold mb-2">
            {label}
          </label>
        )}
        

        {/* Seamless Preview/Input Area */}
        <div className="relative min-h-24">
          {/* Visible textarea with transparent background */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => {
              if (seamlessMode) {
                const textarea = e.target;
                const newValue = e.target.value;
                const oldValue = value || '';
                const cursorPos = textarea.selectionStart;
                
                // Check if user is trying to type $ or $$ directly
                if (newValue.length > oldValue.length) {
                  const addedText = newValue.substring(oldValue.length);
                  if (addedText.includes('$')) {
                    // Don't allow $ to be typed, optionally open equation editor
                    if (addedText === '$') {
                      openEquationEditor('inline');
                    } else if (addedText === '$$') {
                      openEquationEditor('display');
                    }
                    return;
                  }
                }
                
                // Prevent editing inside equations
                if (newValue.length !== oldValue.length) {
                  // Find all equations
                  const equations = [];
                  let match;
                  const equationRegex = /\$\$?[^$]*?\$\$?/g;
                  while ((match = equationRegex.exec(oldValue)) !== null) {
                    equations.push({
                      start: match.index,
                      end: match.index + match[0].length
                    });
                  }
                  
                  // Check if edit is inside an equation
                  for (const eq of equations) {
                    // Determine where the change occurred
                    let changePos = cursorPos;
                    if (newValue.length < oldValue.length) {
                      // Deletion - change position is where cursor is
                      changePos = cursorPos;
                    } else {
                      // Addition - change position is one character before cursor
                      changePos = cursorPos - 1;
                    }
                    
                    // If change is inside equation, reject it
                    if (changePos > eq.start && changePos < eq.end) {
                      // Open equation editor instead
                      const equationContent = oldValue.substring(eq.start, eq.end);
                      const isDisplay = equationContent.startsWith('$$');
                      const content = isDisplay 
                        ? equationContent.slice(2, -2)
                        : equationContent.slice(1, -1);
                      editEquation(eq.start, eq.end, content, isDisplay ? 'display' : 'inline');
                      return;
                    }
                  }
                }
              }
              
              onChange(e.target.value);
              setTimeout(updateCursorState, 0);
            }}
            onKeyDown={(e) => {
              if (seamlessMode) {
                const textarea = e.target;
                const pos = textarea.selectionStart;
                const text = value || '';
                
                // Handle backspace/delete for atomic equation deletion
                if (e.key === 'Backspace' || e.key === 'Delete') {
                  const isBackspace = e.key === 'Backspace';
                  
                  // Find all equations in the text
                  const equations = [];
                  
                  // Find display equations
                  let match;
                  const displayRegex = /\$\$.*?\$\$/g;
                  while ((match = displayRegex.exec(text)) !== null) {
                    equations.push({
                      start: match.index,
                      end: match.index + match[0].length,
                      content: match[0],
                      type: 'display'
                    });
                  }
                  
                  // Find inline equations
                  const inlineRegex = /\$[^$]*?\$/g;
                  while ((match = inlineRegex.exec(text)) !== null) {
                    // Skip if this is part of a display equation
                    const isPartOfDisplay = equations.some(eq => 
                      match.index >= eq.start && match.index < eq.end
                    );
                    if (!isPartOfDisplay) {
                      equations.push({
                        start: match.index,
                        end: match.index + match[0].length,
                        content: match[0],
                        type: 'inline'
                      });
                    }
                  }
                  
                  // Check if cursor is at equation boundary
                  for (const eq of equations) {
                    if (isBackspace && pos === eq.end) {
                      // Backspace at end of equation - delete entire equation
                      e.preventDefault();
                      const newValue = text.substring(0, eq.start) + text.substring(eq.end);
                      onChange(newValue);
                      setTimeout(() => {
                        textarea.setSelectionRange(eq.start, eq.start);
                      }, 0);
                      return;
                    } else if (!isBackspace && pos === eq.start) {
                      // Delete at start of equation - delete entire equation
                      e.preventDefault();
                      const newValue = text.substring(0, eq.start) + text.substring(eq.end);
                      onChange(newValue);
                      setTimeout(() => {
                        textarea.setSelectionRange(eq.start, eq.start);
                      }, 0);
                      return;
                    }
                  }
                }
                
                // Handle arrow keys to skip over equations
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                  const isLeft = e.key === 'ArrowLeft';
                  
                  // Find all equations
                  const equations = [];
                  let match;
                  const equationRegex = /\$\$?[^$]*?\$\$?/g;
                  while ((match = equationRegex.exec(text)) !== null) {
                    equations.push({
                      start: match.index,
                      end: match.index + match[0].length
                    });
                  }
                  
                  // Check if we're at equation boundary
                  for (const eq of equations) {
                    if (isLeft && pos === eq.end) {
                      // Skip to start of equation
                      e.preventDefault();
                      textarea.setSelectionRange(eq.start, eq.start);
                      return;
                    } else if (!isLeft && pos === eq.start) {
                      // Skip to end of equation
                      e.preventDefault();
                      textarea.setSelectionRange(eq.end, eq.end);
                      return;
                    }
                  }
                }
              }
            }}
            onKeyUp={() => seamlessMode ? null : updateCursorState()}
            onMouseUp={() => seamlessMode ? null : updateCursorState()}
            onClick={(e) => {
              if (seamlessMode) {
                const textarea = e.target;
                const pos = textarea.selectionStart;
                const text = value || '';
                
                // Check if click is on an equation
                const regions = getEquationRegions(text);
                for (const region of regions) {
                  if (pos >= region.start && pos <= region.end) {
                    // Extract equation content
                    const equationText = text.substring(region.start, region.end);
                    const isDisplay = region.type === 'display';
                    const content = isDisplay 
                      ? equationText.slice(2, -2)  // Remove $$ $$
                      : equationText.slice(1, -1); // Remove $ $
                    
                    // Open equation editor
                    editEquation(region.start, region.end, content, region.type);
                    return;
                  }
                }
              }
            }}
            onFocus={() => seamlessMode ? null : updateCursorState()}
            onInput={(e) => {
              handleTextareaResize();
            }}
            className="w-full resize-none bg-transparent text-transparent caret-black selection:bg-blue-200 selection:text-transparent border-none outline-none relative"
            rows={rows}
            placeholder=""
            style={{ 
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '20px',
              padding: '12px',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '96px',
              height: 'auto',
              overflow: 'hidden',
              zIndex: 10
            }}
          />
          
          {/* Preview content positioned behind textarea */}
          <div 
            className="preview-content absolute top-0 left-0 w-full border border-gray-300 rounded-lg bg-white"
            style={{ 
              zIndex: 1,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
              fontSize: '14px',
              lineHeight: '20px',
              padding: '12px',
              margin: 0,
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              minHeight: '96px',
              overflow: 'hidden'
            }}
          >
            {value ? (
              <div style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit', margin: 0, padding: 0 }}>
                {renderMixedContent(value)}
              </div>
            ) : (
              <div className="text-gray-400" style={{ fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' }}>
                {placeholder}
              </div>
            )}
          </div>
          
          {/* Floating equation button */}
          <div className="absolute top-2 right-2" style={{ zIndex: 20 }}>
            <button
              onClick={() => openEquationEditor('inline')}
              className="px-3 py-1.5 text-sm font-medium rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md"
              type="button"
              title="Open equation editor"
            >
              Insert Equation
            </button>
          </div>
        </div>
        
        {/* Equation Editor Modal */}
        {equationEditorOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl">
              <h3 className="text-lg font-semibold mb-4">
                Equation Editor
              </h3>
              
              {/* Symbol Toolbar */}
              <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 mb-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {symbolCategories.map((category, categoryIndex) => (
                    <div key={categoryIndex} className="relative group">
                      {/* Category Header */}
                      <div className={`px-2 py-1.5 text-xs rounded transition-colors cursor-pointer ${getButtonColor(category.color)} font-medium flex items-center gap-1 justify-center`}>
                        <span className="text-sm">{category.icon}</span>
                        <span className="truncate">{category.name}</span>
                      </div>
                      
                      {/* Symbol Buttons - Show on hover */}
                      <div className={`absolute top-full ${categoryIndex % 3 === 2 ? 'right-0' : 'left-0'} z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 mt-1 min-w-[200px]`}>
                        <div className="flex flex-wrap gap-1">
                          {category.symbols.map((symbol, symbolIndex) => (
                            <button
                              key={symbolIndex}
                              onClick={() => {
                                const textarea = document.querySelector('.equation-editor-input');
                                if (textarea) {
                                  const start = textarea.selectionStart;
                                  const end = textarea.selectionEnd;
                                  const newValue = equationEditorValue.substring(0, start) + symbol.symbol + equationEditorValue.substring(end);
                                  setEquationEditorValue(newValue);
                                  setEquationError(false); // Reset error when adding symbols
                                  
                                  setTimeout(() => {
                                    if (symbol.symbol.includes('{}')) {
                                      const bracePosition = start + symbol.symbol.indexOf('{}') + 1;
                                      textarea.setSelectionRange(bracePosition, bracePosition);
                                    } else {
                                      const newPosition = start + symbol.symbol.length;
                                      textarea.setSelectionRange(newPosition, newPosition);
                                    }
                                    textarea.focus();
                                  }, 0);
                                }
                              }}
                              className={`px-2 py-1 text-xs rounded transition-colors ${getButtonColor(category.color)} hover:opacity-80`}
                              type="button"
                              title={`Insert ${symbol.label}`}
                            >
                              {symbol.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Equation Input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LaTeX Code:
                </label>
                <textarea
                  className="equation-editor-input w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                  rows={3}
                  value={equationEditorValue}
                  onChange={(e) => {
                    const textarea = e.target;
                    const newValue = e.target.value;
                    const cursorPos = textarea.selectionStart;
                    
                    // Apply auto-replacements
                    const { text: replacedText, cursorPos: newCursorPos } = applyAutoReplacements(newValue, cursorPos);
                    
                    setEquationEditorValue(replacedText);
                    // Reset error state when typing
                    setEquationError(false);
                    
                    // Restore cursor position after replacements
                    setTimeout(() => {
                      textarea.setSelectionRange(newCursorPos, newCursorPos);
                    }, 0);
                  }}
                  placeholder="Type: a/b → fraction, sqrt5 → square root, pi → π"
                  autoFocus
                />
              </div>
              
              {/* Shortcuts Help */}
              <div className="mb-4 text-xs text-gray-600">
                <details className="cursor-pointer">
                  <summary className="font-medium hover:text-gray-800">Quick shortcuts (click to expand)</summary>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs bg-gray-50 p-2 rounded">
                    <div><code>a/b</code> → fraction</div>
                    <div><code>sqrt5</code> → √5</div>
                    <div><code>pi</code> → π</div>
                    <div><code>alpha</code> → α</div>
                    <div><code>&lt;=</code> → ≤</div>
                    <div><code>&gt;=</code> → ≥</div>
                    <div><code>!=</code> → ≠</div>
                    <div><code>-&gt;</code> → →</div>
                  </div>
                </details>
              </div>
              
              {/* Live Preview */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview:
                </label>
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 min-h-[60px] flex items-center justify-center">
                  {equationEditorValue ? (
                    <div>
                      {(() => {
                        const validation = validateLatex(equationEditorValue);
                        
                        if (validation.valid) {
                          // Reset error state if it was previously set
                          if (equationError) {
                            setTimeout(() => setEquationError(false), 0);
                          }
                          
                          // Render the equation normally (always inline)
                          return <InlineMath math={equationEditorValue} />;
                        } else {
                          // Set error state for button disable
                          if (!equationError) {
                            setTimeout(() => setEquationError(true), 0);
                          }
                          
                          // Try to render with error recovery (red color)
                          try {
                            const partialRender = katex.renderToString(equationEditorValue, { 
                              throwOnError: false,
                              errorColor: '#ef4444' // Tailwind red-500
                            });
                            
                            return (
                              <div 
                                dangerouslySetInnerHTML={{ __html: partialRender }}
                                className="inline"
                              />
                            );
                          } catch (e) {
                            // Fallback if even partial render fails
                            return (
                              <div className="text-red-500 text-sm italic">
                                Invalid equation
                              </div>
                            );
                          }
                        }
                      })()}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Your equation will appear here</span>
                  )}
                </div>
              </div>
              
              {/* Buttons */}
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => {
                    setEquationEditorOpen(false);
                    setEquationEditorValue('');
                    setEditingEquation(null);
                    setEquationError(false);
                  }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  type="button"
                >
                  Cancel
                </button>
                <button
                  onClick={insertEquationFromEditor}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${
                    !equationEditorValue || equationError
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                  type="button"
                  disabled={!equationEditorValue || equationError}
                >
                  Insert Equation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Regular mode (existing interface)
  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-gray-700 font-semibold mb-2">
          {label}
        </label>
      )}
      
      {/* Formatting Toolbar */}
      <div className="border border-gray-200 rounded-lg p-3 bg-gray-50">
        {/* Math Mode Status */}
        <div className="mb-2 flex items-center gap-2">
          <div className={`px-2 py-1 rounded text-xs font-medium ${
            isInMathMode 
              ? 'bg-green-100 text-green-700' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {isInMathMode ? '✓ Math Mode Active' : 'Text Mode - Place cursor inside equation for math'}
          </div>
        </div>
        
        {/* Equation Type Buttons - Only show in text mode */}
        {!isInMathMode && (
          <div className="flex flex-wrap gap-2 mb-3 pb-2 border-b border-gray-300">
            {equationButtons.map((btn, index) => (
              <button
                key={`eq-${index}`}
                onClick={() => insertEquation(btn.type)}
                className={`px-3 py-1 text-sm rounded transition-colors ${getButtonColor(btn.color)}`}
                type="button"
              >
                {btn.label}
              </button>
            ))}
          </div>
        )}
        
        {/* Symbol Categories - Only show in math mode */}
        {isInMathMode && (
          <div className="space-y-2 mb-2">
            {symbolCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="relative group">
                {/* Category Header */}
                <div className={`px-3 py-2 text-sm rounded transition-colors cursor-pointer ${getButtonColor(category.color)} font-medium flex items-center gap-2`}>
                  <span className="text-lg">{category.icon}</span>
                  <span>{category.name}</span>
                  <span className="text-xs opacity-70">(hover to expand)</span>
                </div>
                
                {/* Symbol Buttons - Show on hover */}
                <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="flex flex-wrap gap-1">
                    {category.symbols.map((symbol, symbolIndex) => (
                      <button
                        key={symbolIndex}
                        onClick={() => insertSymbol(symbol.symbol)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${getButtonColor(category.color)} hover:opacity-80`}
                        type="button"
                        title={`Insert ${symbol.label}`}
                      >
                        {symbol.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Mode-specific tips */}
        {!isInMathMode && (
          <div className="text-xs text-gray-500">
            Tip: Type normally, then insert an equation to access math symbols.
          </div>
        )}
        
        {isInMathMode && (
          <div className="text-xs text-gray-500">
            Tip: Click symbols to insert into equation. Move cursor outside $ $ to return to text mode.
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setTimeout(updateCursorState, 0); // Update after state change
        }}
        onKeyUp={updateCursorState}
        onMouseUp={updateCursorState}
        onFocus={updateCursorState}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
        rows={rows}
        placeholder={placeholder}
      />
      
      {/* Live Preview */}
      {showPreview && value && (
        <div className="bg-white p-3 rounded border border-gray-200">
          <div className="text-sm font-medium text-gray-700 mb-2">Preview:</div>
          <div className="prose prose-sm max-w-none">
            {renderMixedContent(value)}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathInputEditor;