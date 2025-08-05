import React, { useState, useRef } from 'react';
import { 
  FaUpload, 
  FaPaste, 
  FaTimes, 
  FaCheck, 
  FaExclamationTriangle,
  FaFileUpload,
  FaClipboard,
  FaCog
} from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import QuestionPreviewTable from './QuestionPreviewTable';
import {
  parseQuestionJson,
  normalizeQuestions,
  validateQuestionData,
  generateImportPreview,
  finalizeImportQuestions,
  validateImportFile,
  readFileAsText,
  generateImportSummary
} from '../../utils/questionImportUtils';

const QuestionImportModal = ({ 
  isOpen, 
  onClose, 
  onImport, 
  courseId, 
  itemNumber, 
  existingQuestions = [] 
}) => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'paste'
  const [jsonInput, setJsonInput] = useState('');
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);
  const [importMode, setImportMode] = useState('add'); // 'add' or 'replace'
  const fileInputRef = useRef(null);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setJsonInput('');
      setPreview(null);
      setErrors([]);
      setImportMode('add');
    }
  }, [isOpen]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setErrors([]);

    try {
      // Validate file
      const fileValidation = validateImportFile(file);
      if (!fileValidation.isValid) {
        setErrors(fileValidation.errors);
        return;
      }

      // Read file content
      const content = await readFileAsText(file);
      setJsonInput(content);
      
      // Process the content
      await processJsonInput(content);
    } catch (error) {
      setErrors([`Error reading file: ${error.message}`]);
    } finally {
      setLoading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const processJsonInput = async (input) => {
    if (!input.trim()) {
      setPreview(null);
      setErrors([]);
      return;
    }

    setLoading(true);
    setErrors([]);

    try {
      // Parse JSON
      const parseResult = parseQuestionJson(input);
      if (!parseResult.success) {
        setErrors(parseResult.errors);
        setPreview(null);
        return;
      }

      // Normalize questions
      const normalizedQuestions = normalizeQuestions(parseResult.questions);
      
      // Validate question data
      const validationResult = validateQuestionData(normalizedQuestions);
      if (!validationResult.isValid) {
        setErrors(validationResult.errors);
        setPreview(null);
        return;
      }

      // Generate preview
      const previewResult = generateImportPreview(
        validationResult.validQuestions, 
        courseId, 
        itemNumber, 
        existingQuestions
      );
      
      if (!previewResult.success) {
        setErrors(previewResult.errors);
        setPreview(null);
        return;
      }

      setPreview(previewResult);
      setErrors([]);
    } catch (error) {
      setErrors([`Error processing questions: ${error.message}`]);
      setPreview(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJsonInputChange = (value) => {
    setJsonInput(value);
    
    // Debounce processing
    setTimeout(() => {
      if (value === jsonInput) {
        processJsonInput(value);
      }
    }, 500);
  };

  const handleImport = () => {
    if (!preview || preview.summary.validQuestions === 0) return;

    const finalQuestions = finalizeImportQuestions(preview.previewItems);
    onImport(finalQuestions, importMode);
    onClose();
  };

  const canImport = preview && preview.summary.validQuestions > 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Import Questions</h3>
            <p className="text-sm text-gray-600">
              Upload a JSON file or paste JSON data to bulk import questions
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <FaTimes className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* Input Method Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'upload'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaFileUpload className="inline mr-2 h-4 w-4" />
              Upload File
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'paste'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaClipboard className="inline mr-2 h-4 w-4" />
              Paste JSON
            </button>
          </div>

          {/* Upload Tab */}
          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FaUpload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium text-gray-900">Upload JSON File</p>
                  <p className="text-gray-600">Select a .json file containing your questions</p>
                  <Button onClick={() => fileInputRef.current?.click()} disabled={loading}>
                    {loading ? 'Processing...' : 'Choose File'}
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
              
              {/* Show file content if uploaded */}
              {jsonInput && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    File Contents
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                    <pre className="text-xs text-gray-800 whitespace-pre-wrap">
                      {jsonInput}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Paste Tab */}
          {activeTab === 'paste' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Paste JSON Data
                </label>
                <textarea
                  value={jsonInput}
                  onChange={(e) => handleJsonInputChange(e.target.value)}
                  placeholder={`Paste your JSON here, for example:
[
  {"title": "What is physics?", "points": 1},
  {"title": "Define velocity", "points": 2}
]`}
                  className="w-full h-40 p-3 border border-gray-300 rounded-lg text-sm font-mono resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              {loading && (
                <div className="text-center py-2">
                  <div className="text-sm text-gray-600">Processing JSON...</div>
                </div>
              )}
            </div>
          )}

          {/* Error Messages */}
          {errors.length > 0 && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <FaExclamationTriangle className="h-4 w-4 text-red-500 mr-2" />
                <span className="font-medium text-red-800">Import Errors</span>
              </div>
              <ul className="list-disc list-inside space-y-1">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm text-red-700">{error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview && (
            <div className="mt-6 space-y-4">
              <QuestionPreviewTable 
                previewItems={preview.previewItems} 
                summary={preview.summary}
              />
              
              {/* Import Options */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <FaCog className="h-4 w-4 text-gray-500 mr-2" />
                  <span className="font-medium text-gray-900">Import Options</span>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="add"
                      checked={importMode === 'add'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Add to existing questions</strong> ({existingQuestions.length} current)
                    </span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="importMode"
                      value="replace"
                      checked={importMode === 'replace'}
                      onChange={(e) => setImportMode(e.target.value)}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      <strong>Replace all questions</strong> (will remove {existingQuestions.length} existing)
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <div className="text-sm text-gray-600">
            {preview && generateImportSummary(preview)}
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleImport} 
              disabled={!canImport}
              className="min-w-32"
            >
              <FaCheck className="mr-2 h-4 w-4" />
              Import {preview?.summary.validQuestions || 0} Questions
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionImportModal;