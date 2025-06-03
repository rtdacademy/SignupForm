import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { searchKeymap } from '@codemirror/search';
import { keymap, EditorView } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

// This wrapper properly handles CodeMirror state updates to prevent focus loss
const CodeMirrorWrapper = ({ 
  value, 
  onChange, 
  onSave,
  readOnly = false,
  placeholder = "// Start writing your JSX component here...",
  height = "600px",
  sectionId // Only remount when switching sections, not for content updates
}) => {
  const viewRef = useRef(null);
  const [localValue, setLocalValue] = useState(value || '');
  const timeoutRef = useRef(null);
  const isExternalUpdate = useRef(false);
  
  // Extensions configuration - memoized for performance
  const extensions = useMemo(() => [
    javascript({ jsx: true }),
    keymap.of([
      indentWithTab,
      { key: 'Mod-s', run: () => { onSave?.(); return true; } },
      ...searchKeymap
    ]),
    autocompletion({
      override: [(context) => {
        const suggestions = [
          // React hooks
          { label: 'useState', type: 'function', info: 'React.useState hook for state management' },
          { label: 'useEffect', type: 'function', info: 'React.useEffect hook for side effects' },
          { label: 'useCallback', type: 'function', info: 'React.useCallback hook for memoized callbacks' },
          { label: 'useMemo', type: 'function', info: 'React.useMemo hook for memoized values' },
          
          // Common JSX patterns
          { label: 'className', type: 'property', info: 'CSS class attribute for JSX elements' },
          { label: 'onClick', type: 'property', info: 'Click event handler' },
          { label: 'onChange', type: 'property', info: 'Change event handler' },
          
          // UI Components
          { label: 'Card', type: 'class', info: 'UI Card component' },
          { label: 'CardHeader', type: 'class', info: 'Card header component' },
          { label: 'CardTitle', type: 'class', info: 'Card title component' },
          { label: 'CardContent', type: 'class', info: 'Card content component' },
          { label: 'Alert', type: 'class', info: 'Alert component' },
          { label: 'AlertDescription', type: 'class', info: 'Alert description component' },
          { label: 'Badge', type: 'class', info: 'Badge component' },
          { label: 'AIMultipleChoiceQuestion', type: 'class', info: 'AI-powered multiple choice question' },
          { label: 'AILongAnswerQuestion', type: 'class', info: 'AI-powered long answer question' },
          
          // Common props
          { label: 'course', type: 'variable', info: 'Course data prop' },
          { label: 'courseId', type: 'variable', info: 'Course ID prop' },
          { label: 'isStaffView', type: 'variable', info: 'Staff view flag prop' },
          { label: 'devMode', type: 'variable', info: 'Development mode flag prop' }
        ];
        
        return {
          from: context.pos,
          options: suggestions,
          validFor: /^[\w$]*$/
        };
      }]
    })
  ], [onSave]);

  // Debounced onChange to prevent race conditions
  const debouncedOnChange = useCallback((val) => {
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Update local value immediately for responsive UI
    setLocalValue(val);
    
    // Debounce the parent callback to prevent race conditions
    timeoutRef.current = setTimeout(() => {
      onChange?.(val);
    }, 16); // ~1 frame delay
  }, [onChange]);

  // Handle external value updates (switching sections, inserting examples)
  useEffect(() => {
    if (value !== localValue && !isExternalUpdate.current) {
      isExternalUpdate.current = true;
      setLocalValue(value || '');
      
      // Reset flag after update
      setTimeout(() => {
        isExternalUpdate.current = false;
      }, 0);
    }
  }, [value, localValue]);
  
  // Capture the editor view reference  
  const onCreateEditor = useCallback((view) => {
    viewRef.current = view;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="h-full flex flex-col border border-gray-600 rounded-md">
      <div className="flex-1 min-h-0 relative">
        <CodeMirror
          key={sectionId} // Only remount when section changes
          value={localValue}
          onChange={debouncedOnChange}
          onCreateEditor={onCreateEditor}
          extensions={extensions}
          theme={oneDark}
          editable={!readOnly}
          placeholder={placeholder}
          basicSetup={{
            lineNumbers: true,
            foldGutter: true,
            dropCursor: false,
            allowMultipleSelections: false,
            indentOnInput: true,
            bracketMatching: true,
            closeBrackets: true,
            autocompletion: true,
            highlightSelectionMatches: true,
            searchKeymap: true
          }}
          height="100%"
          style={{
            fontSize: '14px',
            fontFamily: '"JetBrains Mono", "Fira Code", "Monaco", "Consolas", monospace',
            height: '100%'
          }}
        />
      </div>
    </div>
  );
};

export default React.memo(CodeMirrorWrapper);