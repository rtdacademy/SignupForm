import React, { useState, useEffect } from 'react';
import { FaSave, FaTimes, FaEdit, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { 
  generateQuestionIdPreview, 
  validateQuestionId, 
  getNextQuestionNumber 
} from '../../utils/firebaseCourseConfigUtils';

const QuestionForm = ({ 
  courseId, 
  itemNumber, 
  existingQuestions = [], 
  question = null, 
  onSave, 
  onCancel,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    points: 1,
    questionId: ''
  });
  const [customIdMode, setCustomIdMode] = useState(false);
  const [previewId, setPreviewId] = useState('');
  const [validation, setValidation] = useState({ isValid: true, errors: [] });

  // Initialize form data
  useEffect(() => {
    if (question) {
      // Editing existing question
      setFormData({
        title: question.title || '',
        points: question.points || 1,
        questionId: question.questionId || ''
      });
      setCustomIdMode(true);
      setPreviewId(question.questionId || '');
    } else {
      // Adding new question
      const nextNumber = getNextQuestionNumber(existingQuestions);
      const generatedId = generateQuestionIdPreview(courseId, itemNumber, nextNumber, '');
      setFormData({
        title: '',
        points: 1,
        questionId: generatedId
      });
      setPreviewId(generatedId);
      setCustomIdMode(false);
    }
  }, [question, courseId, itemNumber, existingQuestions]);

  // Update preview ID when title changes (only in auto mode)
  useEffect(() => {
    if (!customIdMode && formData.title) {
      const nextNumber = getNextQuestionNumber(existingQuestions);
      const newPreviewId = generateQuestionIdPreview(courseId, itemNumber, nextNumber, formData.title);
      setPreviewId(newPreviewId);
      setFormData(prev => ({ ...prev, questionId: newPreviewId }));
    }
  }, [formData.title, courseId, itemNumber, existingQuestions, customIdMode]);

  // Validate question ID
  useEffect(() => {
    const currentQuestions = question 
      ? existingQuestions.filter(q => q.questionId !== question.questionId)
      : existingQuestions;
    
    const validation = validateQuestionId(formData.questionId, currentQuestions, true);
    setValidation(validation);
  }, [formData.questionId, existingQuestions, question]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCustomIdToggle = () => {
    if (!customIdMode) {
      // Switching to custom mode - keep current preview as starting point
      setCustomIdMode(true);
    } else {
      // Switching back to auto mode - regenerate from title
      setCustomIdMode(false);
      const nextNumber = getNextQuestionNumber(existingQuestions);
      const newPreviewId = generateQuestionIdPreview(courseId, itemNumber, nextNumber, formData.title);
      setPreviewId(newPreviewId);
      setFormData(prev => ({ ...prev, questionId: newPreviewId }));
    }
  };

  const handleCustomIdChange = (value) => {
    setPreviewId(value);
    setFormData(prev => ({ ...prev, questionId: value }));
  };

  const handleSave = () => {
    if (!validation.isValid) return;
    
    const questionData = {
      title: formData.title.trim(),
      points: parseInt(formData.points) || 1,
      questionId: formData.questionId.trim()
    };
    
    onSave(questionData);
  };

  const getValidationIcon = () => {
    if (!formData.questionId) return null;
    
    if (validation.isValid) {
      return <FaCheck className="h-3 w-3 text-green-500" />;
    } else {
      return <FaExclamationTriangle className="h-3 w-3 text-red-500" />;
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-gray-50 space-y-4">
      <div className="flex items-center justify-between">
        <h5 className="font-medium text-gray-900">
          {isEditing ? 'Edit Question' : 'Add New Question'}
        </h5>
      </div>

      <div className="space-y-3">
        {/* Question Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Question Title
          </label>
          <Input
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter question title..."
            className="w-full"
          />
        </div>

        {/* Question ID Preview/Editor */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700">
              Question ID
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCustomIdToggle}
              className="text-xs h-6 px-2"
            >
              <FaEdit className="h-3 w-3 mr-1" />
              {customIdMode ? 'Auto' : 'Custom'}
            </Button>
          </div>
          
          {customIdMode ? (
            <div className="relative">
              <Input
                value={previewId}
                onChange={(e) => handleCustomIdChange(e.target.value)}
                className={`w-full pr-8 ${validation.isValid ? 'border-green-300' : 'border-red-300'}`}
                placeholder="Enter custom question ID..."
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
            </div>
          ) : (
            <div className="relative">
              <div className={`p-2 bg-gray-100 border rounded-md text-sm font-mono text-gray-600 pr-8 ${
                validation.isValid ? 'border-green-300' : 'border-red-300'
              }`}>
                {previewId || 'ID will be generated...'}
              </div>
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                {getValidationIcon()}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                ID updates automatically as you type the title
              </div>
            </div>
          )}
          
          {/* Validation Errors */}
          {!validation.isValid && (
            <div className="mt-1 text-xs text-red-600">
              {validation.errors.map((error, index) => (
                <div key={index}>• {error}</div>
              ))}
            </div>
          )}
        </div>

        {/* Points */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points
          </label>
          <Input
            type="number"
            min="0"
            step="1"
            value={formData.points}
            onChange={(e) => handleInputChange('points', e.target.value)}
            className="w-20"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onCancel}
        >
          <FaTimes className="mr-1 h-3 w-3" />
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!validation.isValid || !formData.title.trim()}
        >
          <FaSave className="mr-1 h-3 w-3" />
          {isEditing ? 'Update' : 'Add'} Question
        </Button>
      </div>

      {/* Preview Information */}
      <div className="text-xs text-gray-500 pt-2 border-t bg-gray-50 -mx-4 -mb-4 px-4 py-2 rounded-b-lg">
        <div className="flex items-center justify-between">
          <span>Course: {courseId} | Item: {itemNumber}</span>
          <span>Questions in item: {existingQuestions.length}</span>
        </div>
      </div>
    </div>
  );
};

export default QuestionForm;