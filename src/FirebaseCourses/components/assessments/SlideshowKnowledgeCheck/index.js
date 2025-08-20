import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, AlertCircle, Expand, RotateCcw } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import StandardMultipleChoiceQuestion from '../StandardMultipleChoiceQuestion';
import AIShortAnswerQuestion from '../AIShortAnswerQuestion';
import AILongAnswerQuestion from '../AILongAnswerQuestion';
import { Sheet, SheetContent, SheetTrigger } from '../../../../components/ui/sheet';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
      blue: { 
        bg: 'bg-blue-50', 
        border: 'border-blue-300', 
        button: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800', 
        text: 'text-blue-800',
        accent: 'blue-600'
      },
      green: { 
        bg: 'bg-green-50', 
        border: 'border-green-300', 
        button: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800', 
        text: 'text-green-800',
        accent: 'green-600'
      },
      purple: { 
        bg: 'bg-purple-50', 
        border: 'border-purple-300', 
        button: 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700', 
        text: 'text-purple-800',
        accent: 'purple-600'
      },
      indigo: { 
        bg: 'bg-indigo-50', 
        border: 'border-indigo-300', 
        button: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700', 
        text: 'text-indigo-800',
        accent: 'indigo-600'
      }
    };
    return themes[theme] || themes.purple;
  };

  const colors = getThemeColors();

  return (
    <div className={`p-6 rounded-lg border ${colors.bg} ${colors.border} shadow-md`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Question {questionNumber}</h3>
      
      {/* Display image if available */}
      {question.image && (
        <div className="mb-6">
          <div className="relative max-w-2xl mx-auto">
            <img 
              src={question.image.url} 
              alt={question.image.alt || 'Question diagram'}
              className="w-full h-auto rounded-lg shadow-md border border-gray-200"
              style={{ maxHeight: '400px', objectFit: 'contain' }}
            />
            {question.image.caption && (
              <p className="text-sm text-gray-600 text-center mt-2 italic">
                {question.image.caption}
              </p>
            )}
          </div>
        </div>
      )}
      
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
          className={`px-6 py-3 text-white rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg font-medium ${
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

// Theme configuration with gradient colors
const getThemeConfig = (theme) => {
  const themes = {
    purple: {
      gradient: 'from-purple-600 to-indigo-600',
      gradientHover: 'from-purple-700 to-indigo-700',
      accent: 'purple-600',
      light: 'purple-100',
      border: 'purple-200',
      ring: 'ring-purple-200',
      name: 'purple'
    },
    blue: {
      gradient: 'from-blue-600 to-cyan-600',
      gradientHover: 'from-blue-700 to-cyan-700',
      accent: 'blue-600',
      light: 'blue-100',
      border: 'blue-200',
      ring: 'ring-blue-200',
      name: 'blue'
    },
    green: {
      gradient: 'from-emerald-600 to-teal-600',
      gradientHover: 'from-emerald-700 to-teal-700',
      accent: 'emerald-600',
      light: 'emerald-100',
      border: 'emerald-200',
      ring: 'ring-emerald-200',
      name: 'green'
    }
  };
  
  return themes[theme] || themes.purple;
};

const SlideshowKnowledgeCheck = ({ 
  courseId, 
  lessonPath,
  questions,
  onComplete,
  theme = 'purple',
  questionIdPrefix = null,
  // AI Assistant props (following AIAccordion pattern)
  course = null,
  onAIAccordionContent = null
}) => {
  const { currentUser } = useAuth();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState({});
  const [questionResults, setQuestionResults] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(true);
  // Disable preloading entirely - questions will load on demand
  const [preloadingQuestions, setPreloadingQuestions] = useState(false);
  const [preloadingErrors, setPreloadingErrors] = useState([]);

  // Get theme configuration
  const themeConfig = getThemeConfig(theme);
  

  // Helper function to get assessment data from course prop
  const getQuestionAssessmentData = (questionId) => {
    
    if (!course?.Assessments || !questionId) {
      console.log(`⚠️ Missing course.Assessments or questionId`);
      return null;
    }
    
    const data = course.Assessments[questionId];
    return data || null;
  };

  // Helper function to check if student has full score for a question using reliable data
  const hasFullScore = (questionId) => {
    if (!course) {
      return false;
    }

    // Find the question in the course structure to get the points
    let questionPoints = null;
    const courseStructure = course.courseDetails['course-config'].courseStructure;
    
    // Search through units and lessons for the question
    if (courseStructure.units) {
      for (const unit of courseStructure.units) {
        if (unit.lessons) {
          for (const lesson of unit.lessons) {
            if (lesson.questions) {
              const question = lesson.questions.find(q => q.questionId === questionId);
              if (question) {
                questionPoints = question.points || 1; // Default to 1 point if not specified
                break;
              }
            }
          }
        }
        if (questionPoints !== null) break;
      }
    }

    if (questionPoints === null) {
      return false;
    }

    // Get assessment data
    const assessmentData = course?.Assessments?.[questionId];
    
    // Get the student's actual score from Grades or assessment data
    const studentScore = course?.Grades?.assessments?.[questionId] !== undefined 
                        ? course.Grades.assessments[questionId]
                        : (assessmentData?.correctOverall ? questionPoints : 0);
    
    // Check if student has full score or has correctOverall flag
    return studentScore >= questionPoints || assessmentData?.correctOverall === true;
  };

  // Helper function to determine question attempt status using reliable data sources
  const getQuestionStatus = (questionId) => {
    // We need either Assessments data OR Grades data to determine status
    if (!course) {
      console.log(`❌ No course object for ${questionId}`);
      return { 
        attempted: false, 
        correct: null, 
        attempts: 0, 
        hasFullScore: false,
        score: 0,
        maxPoints: 1
      };
    }

    // Get assessment data first (contains attempt info)
    const assessmentData = getQuestionAssessmentData(questionId);
    
    
    // Get actual grade from Grades if available
    const actualGrade = course?.Grades?.assessments?.[questionId];
    
    // Determine attempt status from EITHER source:
    // 1. If assessmentData exists and has attempts > 0: student has attempted
    // 2. If actualGrade exists: student has attempted
    const attempted = (assessmentData?.attempts > 0) || (actualGrade !== undefined);
    
    // Get the number of attempts
    const attempts = assessmentData?.attempts || 0;
    
    
    // For points, just use what's in the assessment data or default to 1
    const questionPoints = assessmentData?.pointsValue || assessmentData?.points || 1;
    
    // Get score from Grades (more reliable) or from assessment status
    const score = actualGrade !== undefined ? actualGrade : 
                  (assessmentData?.correctOverall ? questionPoints : 0);
    
    // Determine if correct based on available data
    const correct = attempted ? 
                   (assessmentData?.correctOverall === true || 
                    assessmentData?.status === 'completed' ||
                    actualGrade > 0) : null;
    
    const hasFullScoreForQuestion = (assessmentData?.correctOverall === true) || (score >= questionPoints);
    
    return {
      attempted,
      correct,
      attempts,
      hasFullScore: hasFullScoreForQuestion,
      score,
      maxPoints: questionPoints,
      // Legacy compatibility
      lastSubmission: assessmentData?.lastSubmission
    };
  };

  // Generate unique question IDs based on lesson path or custom prefix
  const generateQuestionId = (index) => {
    if (questionIdPrefix) {
      return `${questionIdPrefix}${index + 1}`;
    }
    const coursePrefix = `course${courseId}`;
    const lessonPrefix = lessonPath.replace(/[^a-zA-Z0-9]/g, '_');
    return `${coursePrefix}_${lessonPrefix}_question${index + 1}`;
  };

  // Load progress from course.Assessments data
  useEffect(() => {
    const loadProgressFromCourse = () => {
      setLoadingProgress(true);
      
      
      try {
        if (!course || !questions || questions.length === 0) {
          setLoadingProgress(false);
          return;
        }

        const newQuestionResults = {};
        const newQuestionsCompleted = {};
        
        questions.forEach((question, index) => {
          const questionNumber = index + 1;
          const questionId = question.questionId || generateQuestionId(index);
          const status = getQuestionStatus(questionId);
          
          
          if (status.attempted) {
            newQuestionsCompleted[`question${questionNumber}`] = true;
            if (status.correct !== null) {
              newQuestionResults[`question${questionNumber}`] = status.correct ? 'correct' : 'incorrect';
            }
          }
        });
        
        setQuestionsCompleted(newQuestionsCompleted);
        setQuestionResults(newQuestionResults);
        
        
      } catch (error) {
        console.error('🚨 SlideshowKnowledgeCheck: Failed to load progress from course data:', error);
      } finally {
        setLoadingProgress(false);
      }
    };

    loadProgressFromCourse();
  }, [course?.Assessments, course?.Gradebook, course?.Grades, questions?.length, lessonPath]);

  // DISABLED: Pre-loading removed to prevent infinite loops and loading issues
  // Questions will now load on-demand when navigated to
  useEffect(() => {
    // Simply mark preloading as complete since we're not doing it
    setPreloadingQuestions(false);
  }, []);

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

  const allQuestionsCompleted = questions?.every((_, index) => 
    questionsCompleted[`question${index + 1}`]
  ) || false;

  useEffect(() => {
    if (allQuestionsCompleted && onComplete) {
      const correctCount = Object.values(questionResults).filter(result => result === 'correct').length;
      const totalScore = (correctCount / questions.length) * 100;
      onComplete(totalScore, questionResults);
    }
  }, [allQuestionsCompleted, questionResults, questions?.length, onComplete]);

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
          // Cloud function question - load on demand (no preloading)
          const originalQuestionId = question.questionId || questionId;
          // For course 2, use course2_assessments; for course 4 and others, pass the questionId
          // StandardMultipleChoiceQuestion will determine the correct cloud function
          const cloudFunctionName = originalQuestionId;
          
          return (
            <StandardMultipleChoiceQuestion
              key={questionId}
              courseId={courseId}
              cloudFunctionName={cloudFunctionName}
              assessmentId={originalQuestionId}
              title={question.title || `Question ${questionNumber}`}
              theme={themeConfig.name}
              maxAttempts={9999}
              course={course}
              onAIAccordionContent={onAIAccordionContent}
              skipInitialGeneration={false}
              onAttempt={(isCorrect) => {
                handleQuestionComplete(questionNumber);
                handleQuestionResult(questionNumber, isCorrect);
              }}
            />
          );
        }
      
      case 'ai-short-answer':
        const originalAIQuestionId = question.questionId || questionId;
        // StandardMultipleChoiceQuestion/AIShortAnswerQuestion will determine the correct cloud function
        const aiCloudFunctionName = originalAIQuestionId;
        
        return (
          <AIShortAnswerQuestion
            key={questionId}
            courseId={courseId}
            cloudFunctionName={aiCloudFunctionName}
            assessmentId={originalAIQuestionId}
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
      
      case 'ai-long-answer':
        const originalAILongQuestionId = question.questionId || questionId;
        // AI Long Answer questions use their direct function name (not the master function)
        const aiLongCloudFunctionName = originalAILongQuestionId;
        
        return (
          <AILongAnswerQuestion
            key={questionId}
            courseId={courseId}
            cloudFunctionName={aiLongCloudFunctionName}
            assessmentId={originalAILongQuestionId}
            title={question.title || `Question ${questionNumber}`}
            theme={theme}
            maxAttempts={3}
            onComplete={(result) => {
              handleQuestionComplete(questionNumber);
              // For AI Long Answer questions, consider them correct if they receive any score
              handleQuestionResult(questionNumber, result.score > 0);
            }}
          />
        );
      
      default:
        console.error(`Unknown question type: ${question.type}`);
        return null;
    }
  };

  // Show loading spinner while loading progress or pre-loading questions
  if (loadingProgress || preloadingQuestions) {
    const loadingText = loadingProgress ? 'Loading progress...' : 'Pre-loading questions...';
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className={`bg-gradient-to-r ${themeConfig.gradient} rounded-lg p-8`}>
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <span className="ml-3 text-white font-medium">{loadingText}</span>
          </div>
          {preloadingQuestions && (
            <div className="mt-3 text-center text-purple-200 text-sm">
              Preparing all questions for faster navigation...
            </div>
          )}
        </div>
      </div>
    );
  }

  // Validate questions array
  if (!questions || questions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className={`bg-gradient-to-r ${themeConfig.gradient} rounded-lg p-8`}>
          <div className="text-center text-white">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-75" />
            <p className="text-lg font-medium">No questions available for this slideshow.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Pre-loading error notification */}
      {preloadingErrors.length > 0 && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-center">
            <AlertCircle className="w-4 h-4 text-yellow-600 mr-2" />
            <div className="text-yellow-800 text-sm">
              <span className="font-medium">Notice:</span> {preloadingErrors.length} question{preloadingErrors.length > 1 ? 's' : ''} will load individually when accessed.
            </div>
          </div>
        </div>
      )}
      
      {/* Main Card Container */}
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
        {/* Header with Gradient Background */}
        <div className={`bg-gradient-to-r ${themeConfig.gradient} px-6 py-2`}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-lg font-bold text-white text-center">
                Knowledge Check
              </h2>
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <button 
                  className="text-white hover:text-purple-200 transition-colors p-1 rounded hover:bg-white/10"
                  title="Expand to fullscreen"
                >
                  <Expand className="w-5 h-5" />
                </button>
              </SheetTrigger>
              <SheetContent 
                side="top" 
                className="w-full h-full max-w-none max-h-none p-0 border-0"
              >
                <div className="h-full flex flex-col">
                  {/* Fullscreen Header */}
                  <div className={`bg-gradient-to-r ${themeConfig.gradient} px-6 py-4 border-b`}>
                    <h2 className="text-xl font-bold text-white text-center">
                      Knowledge Check - Fullscreen Mode
                    </h2>
                  </div>
                  
                  {/* Fullscreen Content - Scrollable */}
                  <div className="flex-1 overflow-auto bg-gray-50">
                    <div className="max-w-4xl mx-auto p-6">
                      <div className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
                        {/* Progress Navigation */}
                        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
                          <div className="flex justify-center items-center space-x-3">
                            {questions.map((_, index) => {
                              const questionNumber = index + 1;
                              const questionId = questions[index].questionId || generateQuestionId(index);
                              const isCurrent = currentQuestionIndex === index;
                              const result = questionResults[`question${questionNumber}`];
                              const status = getQuestionStatus(questionId);
                              const isAttempted = questionsCompleted[`question${questionNumber}`] || status.attempted;
                              
                              // Determine button styling based on full score status
                              let buttonClass, iconElement;
                              
                              if (isCurrent) {
                                buttonClass = `relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-gradient-to-r ${themeConfig.gradient} text-white ring-4 ${themeConfig.ring}`;
                              } else if (status.hasFullScore) {
                                // Student has full score - show green with retry indicator if being attempted again
                                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-green-500 text-white';
                                iconElement = isAttempted && result !== 'correct' ? (
                                  <div className="absolute -top-1 -right-1">
                                    <RotateCcw className="w-4 h-4 text-green-600 bg-white rounded-full p-0.5" />
                                  </div>
                                ) : (
                                  <div className="absolute -top-1 -right-1">
                                    <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />
                                  </div>
                                );
                              } else if (result === 'correct') {
                                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-green-500 text-white';
                                iconElement = (
                                  <div className="absolute -top-1 -right-1">
                                    <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />
                                  </div>
                                );
                              } else if (result === 'incorrect') {
                                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-red-500 text-white';
                                iconElement = (
                                  <div className="absolute -top-1 -right-1">
                                    <XCircle className="w-4 h-4 text-red-600 bg-white rounded-full" />
                                  </div>
                                );
                              } else if (isAttempted) {
                                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-blue-100 border-2 border-blue-300 text-blue-700 hover:border-blue-400';
                              } else {
                                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-white border-2 border-gray-300 text-gray-700';
                              }
                              
                              return (
                                <button
                                  key={index}
                                  onClick={() => navigateToQuestion(index)}
                                  className={buttonClass}
                                  title={`Question ${questionNumber}${status.hasFullScore ? ' (Full Score)' : ''}${isAttempted ? ` (${status.attempts} attempts)` : ''}`}
                                  aria-label={`Go to question ${questionNumber}`}
                                >
                                  <span>{questionNumber}</span>
                                  
                                  {/* Status icons */}
                                  {iconElement}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        {/* Question Content */}
                        <div className="p-8">
                          {questions && questions.length > 0 && questions[currentQuestionIndex] 
                            ? renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)
                            : <div className="text-center py-8 text-gray-500">No questions available</div>
                          }
                        </div>

                        {/* Navigation Footer */}
                        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
                          <div className="flex justify-between items-center">
                            <button
                              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
                              disabled={currentQuestionIndex === 0}
                              className={
                                currentQuestionIndex === 0
                                  ? 'flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : `flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r ${themeConfig.gradient} text-white`
                              }
                            >
                              <ChevronLeft className="w-5 h-5 mr-1" />
                              Previous
                            </button>

                            <button
                              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
                              disabled={currentQuestionIndex === questions.length - 1}
                              className={
                                currentQuestionIndex === questions.length - 1
                                  ? 'flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : `flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r ${themeConfig.gradient} text-white`
                              }
                            >
                              Next
                              <ChevronRight className="w-5 h-5 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Completion Summary in Fullscreen - Only show for perfect scores */}
                      {allQuestionsCompleted && (() => {
                        const correctCount = Object.values(questionResults).filter(r => r === 'correct').length;
                        const totalQuestions = questions.length;
                        const allCorrect = correctCount === totalQuestions;
                        
                        if (allCorrect) {
                          // Celebratory message for perfect score only
                          return (
                            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 shadow-lg">
                              <div className="flex items-center justify-center mb-3">
                                <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                                <h3 className="text-xl font-bold text-green-800">
                                  Perfect Score!
                                </h3>
                              </div>
                              <div className="text-center">
                                <p className="text-green-700 text-lg mb-3">
                                  You got all {totalQuestions} questions correct!
                                </p>
                                <div className="bg-white rounded-lg p-4 inline-block shadow-md">
                                  <div className="text-2xl font-bold text-green-600">
                                    {correctCount} / {totalQuestions} (100%)
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        // Don't show anything for partial scores - info is already visible in the component
                        return null;
                      })()}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        
        {/* Progress Navigation */}
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
          <div className="flex justify-center items-center space-x-3">
            {questions.map((_, index) => {
              const questionNumber = index + 1;
              const questionId = questions[index].questionId || generateQuestionId(index);
              const isCurrent = currentQuestionIndex === index;
              const result = questionResults[`question${questionNumber}`];
              const status = getQuestionStatus(questionId);
              const isAttempted = questionsCompleted[`question${questionNumber}`] || status.attempted;
              
              // Determine button styling based on full score status
              let buttonClass, iconElement;
              
              if (isCurrent) {
                buttonClass = `relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-gradient-to-r ${themeConfig.gradient} text-white ring-4 ${themeConfig.ring}`;
              } else if (status.hasFullScore) {
                // Student has full score - show green with retry indicator if being attempted again
                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-green-500 text-white';
                iconElement = isAttempted && result !== 'correct' ? (
                  <div className="absolute -top-1 -right-1">
                    <RotateCcw className="w-4 h-4 text-green-600 bg-white rounded-full p-0.5" />
                  </div>
                ) : (
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />
                  </div>
                );
              } else if (result === 'correct') {
                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-green-500 text-white';
                iconElement = (
                  <div className="absolute -top-1 -right-1">
                    <CheckCircle className="w-4 h-4 text-green-600 bg-white rounded-full" />
                  </div>
                );
              } else if (result === 'incorrect') {
                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-red-500 text-white';
                iconElement = (
                  <div className="absolute -top-1 -right-1">
                    <XCircle className="w-4 h-4 text-red-600 bg-white rounded-full" />
                  </div>
                );
              } else if (isAttempted) {
                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-blue-100 border-2 border-blue-300 text-blue-700 hover:border-blue-400';
              } else {
                buttonClass = 'relative w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200 transform hover:scale-110 shadow-md hover:shadow-lg bg-white border-2 border-gray-300 text-gray-700';
              }
              
              return (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={buttonClass}
                  title={`Question ${questionNumber}${status.hasFullScore ? ' (Full Score)' : ''}${isAttempted ? ` (${status.attempts} attempts)` : ''}`}
                  aria-label={`Go to question ${questionNumber}`}
                >
                  <span>{questionNumber}</span>
                  
                  {/* Status icons */}
                  {iconElement}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Content */}
        <div className="p-6">
          {questions && questions.length > 0 && questions[currentQuestionIndex] 
            ? renderQuestion(questions[currentQuestionIndex], currentQuestionIndex)
            : <div className="text-center py-8 text-gray-500">No questions available</div>
          }
        </div>

        {/* Navigation Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center">
            <button
              onClick={() => navigateToQuestion(currentQuestionIndex - 1)}
              disabled={currentQuestionIndex === 0}
              className={
                currentQuestionIndex === 0
                  ? 'flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gray-200 text-gray-400 cursor-not-allowed'
                  : `flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r ${themeConfig.gradient} text-white`
              }
            >
              <ChevronLeft className="w-5 h-5 mr-1" />
              Previous
            </button>

            <button
              onClick={() => navigateToQuestion(currentQuestionIndex + 1)}
              disabled={currentQuestionIndex === questions.length - 1}
              className={
                currentQuestionIndex === questions.length - 1
                  ? 'flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gray-200 text-gray-400 cursor-not-allowed'
                  : `flex items-center px-6 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg bg-gradient-to-r ${themeConfig.gradient} text-white`
              }
            >
              Next
              <ChevronRight className="w-5 h-5 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Completion Summary - Only show for perfect scores */}
      {allQuestionsCompleted && (() => {
        let correctCount = 0;
        questions.forEach((question, index) => {
          const questionId = question.questionId || generateQuestionId(index);
          const status = getQuestionStatus(questionId);
          if (status.correct === true) correctCount++;
        });
        const totalQuestions = questions.length;
        const allCorrect = correctCount === totalQuestions;
        
        if (allCorrect) {
          // Celebratory message for perfect score only
          return (
            <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4 shadow-md">
              <div className="flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-bold text-green-800">
                  Perfect Score!
                </h3>
              </div>
              <div className="text-center">
                <p className="text-green-700 text-sm mb-2">
                  You got all {totalQuestions} questions correct!
                </p>
                <div className="bg-white rounded-lg p-3 inline-block shadow-sm">
                  <div className="text-xl font-bold text-green-600">
                    {correctCount} / {totalQuestions} (100%)
                  </div>
                </div>
              </div>
            </div>
          );
        }
        // Don't show anything for partial scores - info is already visible in the component
        return null;
      })()}
    </div>
  );
};

export default SlideshowKnowledgeCheck;