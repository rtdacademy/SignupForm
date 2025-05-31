import React, { useState } from 'react';
import { Button } from '../../../components/ui/button';
import EnhancedCodeEditor from './EnhancedCodeEditor';

const SimpleCodeEditor = ({ 
  initialCode = '', 
  onSave, 
  onCodeChange, 
  loading = false, 
  currentLessonInfo 
}) => {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const handleSave = () => {
    onSave?.(code);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-800">Code Editor</h2>
        <Button
          onClick={handleSave}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Saving...' : 'Save Code'}
        </Button>
      </div>
      
      {currentLessonInfo && (
        <div className="p-3 bg-blue-50 border-b border-blue-200">
          <p className="text-sm text-blue-800">
            📝 Editing: <strong>{currentLessonInfo.title}</strong>
          </p>
        </div>
      )}
      
      <div className="flex-1">
        <EnhancedCodeEditor
          value={code}
          onChange={handleCodeChange}
          onSave={handleSave}
          height="100%"
          placeholder="Write your JSX component here..."
        />
      </div>
    </div>
  );
};

export default SimpleCodeEditor;