import React, { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '../../../components/ui/radio-group';
import { Label } from '../../../components/ui/label';
import { Button } from '../../../components/ui/button';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

/**
 * A reusable multiple-choice question component
 * 
 * @param {Object} props
 * @param {String} props.questionId - Unique identifier for the question
 * @param {String} props.questionText - The text of the question
 * @param {Array} props.options - Array of options [{id, text}]
 * @param {String} props.correctOptionId - ID of the correct option
 * @param {Function} props.onAnswer - Callback when user submits an answer (optionId, isCorrect)
 * @param {Boolean} props.showFeedback - Whether to show correct/incorrect feedback
 * @param {String} props.explanation - Explanation of the correct answer
 * @param {Boolean} props.disabled - Whether the question is disabled
 */
const MultipleChoiceQuestion = ({
  questionId,
  questionText,
  options = [],
  correctOptionId,
  onAnswer,
  showFeedback = true,
  explanation = '',
  disabled = false
}) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  
  const handleOptionChange = (value) => {
    if (hasSubmitted || disabled) return;
    setSelectedOption(value);
  };
  
  const handleSubmit = () => {
    if (!selectedOption || hasSubmitted || disabled) return;
    
    const correct = selectedOption === correctOptionId;
    setIsCorrect(correct);
    setHasSubmitted(true);
    
    if (onAnswer) {
      onAnswer(selectedOption, correct);
    }
  };
  
  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900">{questionText}</h3>
      </div>
      
      <RadioGroup
        value={selectedOption}
        onValueChange={handleOptionChange}
        disabled={hasSubmitted || disabled}
        className="space-y-3"
      >
        {options.map((option) => (
          <div 
            key={option.id}
            className={`
              flex items-start p-3 rounded-md transition-colors
              ${hasSubmitted && option.id === correctOptionId ? 'bg-green-50' : ''}
              ${hasSubmitted && selectedOption === option.id && option.id !== correctOptionId ? 'bg-red-50' : ''}
              ${!hasSubmitted ? 'hover:bg-gray-50' : ''}
            `}
          >
            <RadioGroupItem
              value={option.id}
              id={`${questionId}-option-${option.id}`}
              disabled={hasSubmitted || disabled}
              className="mt-1"
            />
            <Label
              htmlFor={`${questionId}-option-${option.id}`}
              className="flex-1 ml-3 text-base cursor-pointer"
            >
              {option.text}
            </Label>
            
            {hasSubmitted && option.id === correctOptionId && (
              <FaCheckCircle className="text-green-500 ml-2 mt-1" />
            )}
            
            {hasSubmitted && selectedOption === option.id && option.id !== correctOptionId && (
              <FaTimesCircle className="text-red-500 ml-2 mt-1" />
            )}
          </div>
        ))}
      </RadioGroup>
      
      {!hasSubmitted && (
        <Button 
          onClick={handleSubmit}
          disabled={!selectedOption || disabled}
          className="mt-6"
        >
          Submit Answer
        </Button>
      )}
      
      {hasSubmitted && showFeedback && (
        <Alert className={`mt-6 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
          <AlertDescription>
            <div className="flex items-start">
              {isCorrect ? (
                <FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" />
              ) : (
                <FaTimesCircle className="text-red-500 mt-1 mr-2 flex-shrink-0" />
              )}
              <div>
                <p className="font-medium mb-1">
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </p>
                {explanation && (
                  <p className="text-sm">
                    {explanation}
                  </p>
                )}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default MultipleChoiceQuestion;