import React, { useRef, useEffect, useCallback } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { autocompletion } from '@codemirror/autocomplete';
import { searchKeymap } from '@codemirror/search';
import { keymap, EditorView } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';
import { oneDark } from '@codemirror/theme-one-dark';

// This wrapper properly handles CodeMirror state updates to prevent reverting
const CodeMirrorWrapper = ({ 
  value, 
  onChange, 
  onSave,
  readOnly = false,
  placeholder = "// Start writing your JSX component here...",
  height = "600px",
  editorKey // Force re-mount when switching sections
}) => {
  const editorRef = useRef(null);
  const viewRef = useRef(null);
  const skipNextUpdate = useRef(false);
  
  // Extensions configuration
  const extensions = [
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
    }),
    // Add view update listener to prevent external updates when typing
    EditorView.updateListener.of((update) => {
      if (update.docChanged && !skipNextUpdate.current) {
        const newDoc = update.state.doc.toString();
        onChange?.(newDoc);
      }
      skipNextUpdate.current = false;
    })
  ];
  
  const handleChange = useCallback((val, viewUpdate) => {
    // Mark that this change came from user input
    skipNextUpdate.current = false;
    onChange?.(val);
  }, [onChange]);
  
  // Handle external value updates (e.g., from inserting examples)
  useEffect(() => {
    if (viewRef.current && value !== undefined) {
      const currentDoc = viewRef.current.state.doc.toString();
      
      // Only update if the content is actually different
      if (currentDoc !== value) {
        skipNextUpdate.current = true;
        
        // Use a transaction to update the document
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: currentDoc.length,
            insert: value
          },
          // Preserve selection if possible
          selection: viewRef.current.state.selection
        });
      }
    }
  }, [value]);
  
  // Capture the editor view reference
  const onCreateEditor = useCallback((view) => {
    viewRef.current = view;
    editorRef.current = view;
  }, []);

  return (
    <div className="h-full flex flex-col border border-gray-600 rounded-md">
      <div className="flex-1 min-h-0 relative">
        <CodeMirror
          key={editorKey} // Force remount on section change
          value={value}
          onChange={handleChange}
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

export default CodeMirrorWrapper;
