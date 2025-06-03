import React, { useCallback, useMemo, memo, useRef, useEffect } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { searchKeymap } from '@codemirror/search';
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

const EnhancedCodeEditor = ({ 
  value, 
  onChange, 
  onSave,
  readOnly = false,
  placeholder = "// Start writing your JSX component here...",
  height = "600px",
  editorKey // Add this prop to force re-initialization when switching sections
}) => {
  // Use key-based re-rendering to avoid cursor jumping
  // This completely re-mounts the component when editorKey changes
  
  // React/JSX autocompletion suggestions - moved outside component for stability
  const reactCompletions = useMemo(() => {
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
      
      // UI Components (available in templates)
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
      { label: 'devMode', type: 'variable', info: 'Development mode flag prop' },
      { label: 'itemConfig', type: 'variable', info: 'Item configuration prop' },
    ];
    
    return autocompletion({
      override: [
        (context) => {
          const word = context.matchBefore(/\w*/);

          
          if (!word || (word.from === word.to && !context.explicit)) return null;
          
          return {
            from: word.from,
            options: suggestions.filter(s => 
              s.label.toLowerCase().includes(word.text.toLowerCase())
            )
          };
        }
      ]
    });
  }, []);

  // Custom keymap with save shortcut
  const customKeymap = useMemo(() => 
    keymap.of([
      indentWithTab,
      ...searchKeymap,
      {
        key: 'Ctrl-s',
        mac: 'Cmd-s',
        run: () => {
          // On save, trigger save immediately (content already synced via onChange)
          onSave?.();
          return true;
        }
      }
    ]), [onSave, onChange]
  );

  // Extensions for CodeMirror - stable references for better performance
  const extensions = useMemo(() => [
    javascript({ jsx: true, typescript: false }),
    reactCompletions,
    customKeymap,
  ], [reactCompletions, customKeymap]);

  // Store current value in ref for save functionality
  const currentValueRef = useRef(value || '');
  
  // Handle code changes - update ref and notify parent without causing re-renders
  const handleChange = useCallback((val) => {
    currentValueRef.current = val;
    // Call onChange immediately but parent won't re-render editor due to key-based mounting
    onChange?.(val);
  }, [onChange]);

  return (
    <div className="h-full flex flex-col border border-gray-600 rounded-md">
      <div className="flex-1 min-h-0 relative">
        <CodeMirror
          key={editorKey} // Re-mount component when section changes
          value={value || ''} // Use controlled pattern but only re-render on section switch
          onChange={handleChange}
          extensions={extensions}
          theme={oneDark}
          readOnly={readOnly}
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

// Memoize the component to prevent unnecessary re-renders
export default memo(EnhancedCodeEditor);
