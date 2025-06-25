import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { getDatabase, ref, get } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import StandardMultipleChoiceQuestion from '../StandardMultipleChoiceQuestion';
import AIShortAnswerQuestion from '../AIShortAnswerQuestion';

// Simple inline multiple choice component for slideshow
const InlineMultipleChoiceQuestion = ({ question, questionNumber, theme, onAttempt }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleSubmit = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === question.correctAnswer;
    setHasAnswered(true);
    setShowExplanation(true);
    onAttempt(isCorrect);
  };

  const getThemeColors = () => {
    const themes = {
      blue: { bg: 'bg-blue-50', border: 'border-blue-200', button: 'bg-blue-600 hover:bg-blue-700', text: 'text-blue-800' },
      green: { bg: 'bg-green-50', border: 'border-green-200', button: 'bg-green-600 hover:bg-green-700', text: 'text-green-800' },
      purple: { bg: 'bg-purple-50', border: 'border-purple-200', button: 'bg-purple-600 hover:bg-purple-700', text: 'text-purple-800' },
      indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', button: 'bg-indigo-600 hover:bg-indigo-700', text: 'text-indigo-800' }
    };
    return themes[theme] || themes.blue;
  };

  const colors = getThemeColors();

  return (
    <div className={`p-6 rounded-lg border-2 ${colors.bg} ${colors.border}`}>
      <h3 className="text-lg font-semibold mb-4">Question {questionNumber}</h3>
      <p className="text-gray-800 mb-4">{question.question}</p>
      
      <div className="space-y-2 mb-4">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd'
          const isSelected = selectedOption === option;
          const isCorrect = option === question.correctAnswer;
          
          let optionStyle = "p-3 border rounded-lg cursor-pointer transition-colors ";
          
          if (!hasAnswered) {
            optionStyle += isSelected ? `${colors.bg} ${colors.border} ${colors.text}` : "bg-white border-gray-200 hover:bg-gray-50";
          } else {
            if (isCorrect) {
              optionStyle += "bg-green-100 border-green-300 text-green-800";
            } else if (isSelected && !isCorrect) {
              optionStyle += "bg-red-100 border-red-300 text-red-800";
            } else {
              optionStyle += "bg-gray-100 border-gray-200 text-gray-600";
            }
          }
          
          return (
            <div
              key={index}
              className={optionStyle}
              onClick={() => !hasAnswered && setSelectedOption(option)}
            >
              <span className="font-semibold mr-2">{optionLetter})</span>
              {option}
            </div>
          );
        })}
      </div>
      
      {!hasAnswered && (
        <button
          onClick={handleSubmit}
          disabled={selectedOption === null}
          className={`px-4 py-2 text-white rounded-lg transition-colors ${
            selectedOption === null 
              ? 'bg-gray-400 cursor-not-allowed' 
              : `${colors.button}`
          }`}
        >
          Submit Answer
        </button>
      )}
      
      {showExplanation && question.explanation && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-700"><strong>Explanation:</strong> {question.explanation}</p>
        </div>
      )}
    </div>
  );
};

const SlideshowKnowledgeCheck = ({ 
  courseId, 
  lessonPath,
  questions,
  onComplete,
  theme = 'indigo',
  questionIdPrefix = null
}) => {
  const { currentUser } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState({});
  const [questionResults, setQuestionResults] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Generate unique question IDs based on lesson path or custom prefix
  const generateQuestionId = (index) => {
    if (questionIdPrefix) {
      return `${questionIdPrefix}${index + 1}`;
    }
    const coursePrefix = `course${courseId}`;
    const lessonPrefix = lessonPath.replace(/[^a-zA-Z0-9]/g, '_');
    return `${coursePrefix}_${lessonPrefix}_question${index + 1}`;
  };

  // Load progress from Firebase on component mount
  useEffect(() => {
    const loadProgressFromFirebase = async () => {
      // TEMPORARY FIX: Skip Firebase loading entirely to avoid permission errors
      console.log("🚫 SlideshowKnowledgeCheck: Skipping Firebase load to avoid permission errors");
      setLoadingProgress(false);
      return;
      
      // Original code commented out:
      // if (!currentUser?.email || !courseId) {
      //   console.log("🚫 SlideshowKnowledgeCheck: No user or courseId, skipping Firebase load");
      //   setLoadingProgress(false);
      //   return;
      // }

      try {
        const db = getDatabase();
        const studentEmail = currentUser.email.replace(/\./g, ',');
        console.log("🔍 SlideshowKnowledgeCheck: Loading progress for", { studentEmail, courseId });
        
        const progressPromises = questions.map(async (_, index) => {
          const questionId = generateQuestionId(index);
          const questionNumber = index + 1;
          
          // Read from Firebase: /students/{email}/courses/{courseId}/Assessments/{questionId}/lastSubmission
          const assessmentRef = ref(db, `students/${studentEmail}/courses/${courseId}/Assessments/${questionId}/lastSubmission`);
          console.log("📖 SlideshowKnowledgeCheck: Attempting to read from:", assessmentRef.toString());
          
          try {
            const snapshot = await get(assessmentRef);
            if (snapshot.exists()) {
              const lastSubmission = snapshot.val();
              const isCorrect = lastSubmission.isCorrect;
              return {
                questionNumber,
                isCorrect,
                hasBeenAnswered: true
              };
            }
          } catch (error) {
            console.error(`🚨 SlideshowKnowledgeCheck PERMISSION ERROR for question ${questionNumber}:`, error);
            console.error("📍 Error details:", {
              code: error.code,
              message: error.message,
              path: `students/${studentEmail}/courses/${courseId}/Assessments/${questionId}/lastSubmission`
            });
          }
          
          return {
            questionNumber,
            isCorrect: null,
            hasBeenAnswered: false
          };
        });

        const progressResults = await Promise.all(progressPromises);
        
        // Update state based on loaded progress
        const newQuestionResults = {};
        const newQuestionsCompleted = {};
        
        progressResults.forEach(({ questionNumber, isCorrect, hasBeenAnswered }) => {
          if (hasBeenAnswered) {
            newQuestionsCompleted[`question${questionNumber}`] = true;
            newQuestionResults[`question${questionNumber}`] = isCorrect ? 'correct' : 'incorrect';
          }
        });
        
        setQuestionsCompleted(newQuestionsCompleted);
        setQuestionResults(newQuestionResults);
        
        console.log('📊 Loaded progress from Firebase:', {
          completed: newQuestionsCompleted,
          results: newQuestionResults
        });
        
      } catch (error) {
        console.error('🚨 SlideshowKnowledgeCheck: OUTER CATCH - Failed to load progress from Firebase:', error);
        console.error('📍 Outer error details:', {
          code: error.code,
          message: error.message,
          stack: error.stack
        });
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgressFromFirebase();
  }, [currentUser, courseId, questions.length, lessonPath]);

  const handleQuestionComplete = (questionNumber) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [`question${questionNumber}`]: true
    }));
  };

  const handleQuestionResult = (questionNumber, isCorrect) => {
    setQuestionResults(prev => ({
      ...prev,
      [`question${questionNumber}`]: isCorrect ? 'correct' : 'incorrect'
    }));
  };

  const navigateToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  const allQuestionsCompleted = questions.every((_, index) => 
    questionsCompleted[`question${index + 1}`]
  );

  useEffect(() => {
    if (allQuestionsCompleted && onComplete) {
      const correctCount = Object.values(questionResults).filter(result => result === 'correct').length;
      const totalScore = (correctCount / questions.length) * 100;
      onComplete(totalScore, questionResults);
    }
  }, [allQuestionsCompleted, questionResults, questions.length, onComplete]);

  const renderQuestion = (question, index) => {
    const questionId = generateQuestionId(index);
    const questionNumber = index + 1;

    switch (question.type) {
      case 'multiple-choice':
        // Check if this is an inline question (has options) or cloud function question (has questionId)
        if (question.options && question.correctAnswer) {
          // Inline question - render directly with simple UI
          return <InlineMultipleChoiceQuestion 
            key={questionId}
            question={question}
            questionNumber={questionNumber}
            theme={theme}
            onAttempt={(isCorrect) => {
              handleQuestionComplete(questionNumber);
              handleQuestionResult(questionNumber, isCorrect);
            }}
          />;
        } else {
          // Cloud function question - use the old method
          return (
            <StandardMultipleChoiceQuestion
              key={questionId}
              courseId={courseId}
              cloudFunctionName={question.questionId || questionId}
              title={question.title || `Question ${questionNumber}`}
              theme={theme}
              maxAttempts={9999}
              onAttempt={(isCorrect) => {
                handleQuestionComplete(questionNumber);
                handleQuestionResult(questionNumber, isCorrect);
              }}
            />
          );
        }
      
      case 'ai-short-answer':
        return (
          <AIShortAnswerQuestion
            key={questionId}
            courseId={courseId}
            cloudFunctionName={question.questionId || questionId}
            title={question.title || `Question ${questionNumber}`}
            theme={theme}
            maxAttempts={9999}
            onComplete={(result) => {
              handleQuestionComplete(questionNumber);
              // For AI questions, we'll consider them correct if they receive feedback
              handleQuestionResult(questionNumber, result.score > 0);
            }}
          />
        );
      
      default:
        console.error(`Unknown question type: ${question.type}`);
        return null;
    }
  };

  // Show loading spinner while loading progress
  if (loadingProgress) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <span className="ml-3 text-gray-600">Loading progress...</span>
        </div>
      </div>
    );
  }

  // Validate questions array
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-8 text-gray-500">
          <p>No questions available for this slideshow.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Visual Progress Navigation */}
      <div className="flex justify-center items-center space-x-2 mb-8">
        {questions.map((_, index) => {
          const questionNumber = index + 1;
          const isCurrent = currentQuestionIndex === index;
          const result = questionResults[`question${questionNumber}`];
          
          return (
            <button
              key={index}
              onClick={() => navigateToQuestion(index)}
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                transition-all duration-200 transform hover:scale-110
                ${isCurrent 
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200' 
                  : result === 'correct'
                    ? 'bg-green-500 text-white'
                    : result === 'incorrect'
                      ? 'bg-red-500 text-white'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400'
                }
              `}
              aria-label={`Go to question ${questionNumber}`}
            >
              {questionNumber}
            </button>
          );
        })}
      </div>

      {/* Question Display */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Question {currentQuestionIndex + 1} of {questions.length}
          </h3>
        </div>
        
        {questions && questions.length > 0 && questions[currentQuestionIndex] 
          ? renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)
          : <div className="text-center py-8 text-gray-500">No questions available</div>
        }
      </div>

      {/* Navigation Controls */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
          disabled={currentQuestionIndex === 0}
          className={`
            flex items-center px-4 py-2 rounded-lg font-medium transition-colors
            ${currentQuestionIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }
          `}
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Previous
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {Object.keys(questionsCompleted).length} of {questions.length} completed
          </p>
        </div>

        <button
          onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
          disabled={currentQuestionIndex === questions.length - 1}
          className={`
            flex items-center px-4 py-2 rounded-lg font-medium transition-colors
            ${currentQuestionIndex === questions.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }
          `}
        >
          Next
          <ChevronRight className="w-5 h-5 ml-1" />
        </button>
      </div>

      {/* Completion Summary */}
      {allQuestionsCompleted && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Knowledge Check Complete!
          </h3>
          <p className="text-green-700">
            You've completed all {questions.length} questions. 
            {Object.values(questionResults).filter(r => r === 'correct').length} out of {questions.length} correct.
          </p>
        </div>
      )}
    </div>
  );
};

export default SlideshowKnowledgeCheck;