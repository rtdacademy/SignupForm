import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, remove } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';

/**
 * A Multiple Choice Question component powered by AI that interacts with Firebase Cloud Functions.
 * The question content is dynamically generated using Google's Gemini AI.
 * 
 * This component handles:
 * - AI-generated questions based on topic and difficulty
 * - Submission of answers and feedback
 * - Tracking of attempts
 * - Displaying explanation of correct answers
 */
const AIMultipleChoiceQuestion = ({
  // Required props
  courseId,                // Course identifier
  assessmentId,            // Unique identifier for this assessment
  cloudFunctionName,       // Name of the cloud function to call
  course,                  // Course object (optional, used to find assessment settings)

  // Optional props
  topic = 'elearning_benefits_challenges', // Topic for the AI to generate a question about
  difficulty = 'intermediate', // Difficulty level: beginner, intermediate, advanced
  theme = 'purple',        // Color theme: 'blue', 'green', 'purple', etc.
  maxAttempts = 3,         // Maximum number of attempts allowed
  title = 'AI-Generated Question', // Question title/header
  questionClassName = '',  // Additional class name for question container
  optionsClassName = '',   // Additional class name for options container
  onCorrectAnswer = () => {}, // Callback when answer is correct
  onAttempt = () => {},    // Callback on each attempt
  onComplete = () => {},   // Callback when all attempts are used
}) => {
  // Authentication and state
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  
  // Refs for debouncing and preventing multiple calls
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);
  const regenerationTimeoutRef = useRef(null);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Get theme colors
  const themeColors = getThemeColors(theme);

  // Track if we're currently waiting for a new question during regeneration
  const [expectingNewQuestion, setExpectingNewQuestion] = useState(false);
  // Track the last question ID to detect when a new question arrives
  const [lastQuestionTimestamp, setLastQuestionTimestamp] = useState(null);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      setError("User authentication required");
      setLoading(false);
      return;
    }

    // Get sanitized email for database path
    const studentEmail = currentUser.email;
    const studentKey = sanitizeEmail(studentEmail);

    // Listen for assessment data in the database
    const loadAssessment = async () => {
      setLoading(true);
      try {
        console.log(`Creating database ref for question: students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`);

        // Setup firebase database listener
        const assessmentRef = ref(db, `students/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`);

        const unsubscribe = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            console.log("AI question data received:", data);
            
            // If we're expecting a new question during regeneration
            if (expectingNewQuestion) {
              // Check if this is truly a new question (by timestamp)
              const newTimestamp = data.timestamp || 0;
              const oldTimestamp = lastQuestionTimestamp || 0;
              
              console.log(`Comparing timestamps - New: ${newTimestamp}, Old: ${oldTimestamp}`);
              
              if (newTimestamp > oldTimestamp) {
                // This is a new question, update the UI
                console.log("New question detected with newer timestamp");
                setQuestion(data);
                setLastQuestionTimestamp(newTimestamp);
                setExpectingNewQuestion(false);
                setRegenerating(false);
                
                // Reset result if present
                if (data.lastSubmission) {
                  setResult(data.lastSubmission);
                  // Preselect the last submitted answer
                  setSelectedAnswer(data.lastSubmission.answer || '');
                } else {
                  setResult(null);
                  setSelectedAnswer('');
                }
              } else {
                // This is still the old question data, don't update UI
                console.log("Received same question or older question, ignoring update");
              }
            } else {
              // Normal case, update question data
              setQuestion(data);
              setLastQuestionTimestamp(data.timestamp || 0);
              
              // If there's a last submission, set the result and preselect the answer
              if (data.lastSubmission) {
                setResult(data.lastSubmission);
                // Preselect the last submitted answer
                setSelectedAnswer(data.lastSubmission.answer || '');
                console.log(`Preselecting last submitted answer: ${data.lastSubmission.answer}`);
              }
            }
          } else {
            console.log("No AI question data found, generating new question");
            generateQuestion();
          }
          setLoading(false);
        }, (error) => {
          console.error("Error in database listener:", error);
          setError("Failed to load question data");
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error loading assessment:", err);
        setError("Failed to load assessment. Please try refreshing the page.");
        setLoading(false);
      }
    };

    loadAssessment();
  }, [currentUser, courseId, assessmentId, db, expectingNewQuestion, lastQuestionTimestamp]);

  // Generate a new question using cloud function with debouncing
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    // Prevent multiple calls if we're already generating
    if (isGeneratingRef.current) {
      console.log("Question generation already in progress, ignoring duplicate call");
      return;
    }
    
    // Set generating flag
    isGeneratingRef.current = true;
    
    // Debounce: prevent too frequent generation (minimum 2 seconds between generations)
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGeneratedTimeRef.current;
    if (timeSinceLastGeneration < 2000) {
      console.log(`Debouncing question generation (${timeSinceLastGeneration}ms since last call)`);
      
      // Clear any existing timeout
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
      
      // Set a timeout to generate after the debounce period
      const timeToWait = 2000 - timeSinceLastGeneration;
      regenerationTimeoutRef.current = setTimeout(() => {
        console.log(`Debounce period complete, proceeding with generation`);
        lastGeneratedTimeRef.current = Date.now();
        generateQuestionNow();
      }, timeToWait);
      
      return;
    }

    // If we're not debouncing, generate right away
    lastGeneratedTimeRef.current = now;
    await generateQuestionNow();
  };
  
  // The actual generation function (after debounce handling)
  const generateQuestionNow = async () => {
    // Only set regenerating if not already set (avoid double setting in handleRegenerate)
    if (!regenerating) {
      setRegenerating(true);
    }
    
    setSelectedAnswer('');
    setResult(null);

    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic,
        difficulty: difficulty
      };

      console.log(`Calling cloud function ${cloudFunctionName} to generate AI question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("AI question generation successful:", result);

      // The database listener will pick up the new question data
      // but we should NOT reset regenerating flag here - wait for new data
      
      // If we're not in regeneration mode, we can clear the regenerating flag
      if (!expectingNewQuestion) {
        setRegenerating(false);
      }
    } catch (err) {
      console.error("Error generating AI question:", err);
      setError("Failed to generate question: " + (err.message || err));
      setLoading(false);
      
      // Reset all state flags on error
      setRegenerating(false);
      setExpectingNewQuestion(false);
    } finally {
      // Reset generating flag
      isGeneratingRef.current = false;
    }
  };

  // Handle submission of the answer
  const handleSubmit = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer");
      return;
    }

    setSubmitting(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'evaluate',
        answer: selectedAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic,
        difficulty: difficulty
      };

      console.log(`Calling cloud function ${cloudFunctionName} to evaluate AI question answer`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Answer evaluation successful:", result);

      // Trigger callback
      onAttempt(result.data?.result?.isCorrect || false);

      if (result.data?.result?.isCorrect) {
        onCorrectAnswer();
      }

      // The database listener will pick up the result
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit your answer. Please try again: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle regeneration of the question with debounce protection
  const handleRegenerate = () => {
    // If we're already generating, don't trigger again
    if (isGeneratingRef.current || regenerating) {
      console.log("Already regenerating a question, ignoring duplicate request");
      return;
    }
    
    // Check if we've exceeded or reached max attempts allowed
    // Note: This only applies to the regenerate button; the server will enforce this too
    if (question && question.attempts >= (question.maxAttempts || maxAttempts)) {
      console.log(`Cannot regenerate - max attempts reached (${question.attempts}/${question.maxAttempts || maxAttempts})`);
      setError(`You have reached the maximum number of attempts (${question.maxAttempts || maxAttempts}).`);
      return;
    }
    
    // Delay UI updates until after database operations to prevent flickering
    setTimeout(() => {
      setSelectedAnswer('');
      setResult(null);
      setRegenerating(true);
      // Mark that we're expecting a new question to arrive
      setExpectingNewQuestion(true);
    }, 0);

    // Force a database delete to get a fresh AI-generated question
    const assessmentRef = ref(db, `students/${sanitizeEmail(currentUser.email)}/courses/${courseId}/Assessments/${assessmentId}`);

    // Also remove the secure assessment data on server
    const secureRef = ref(db, `courses/${courseId}/secureAssessments/${assessmentId}`);

    try {
      // First remove both assessment references
      Promise.all([
        remove(assessmentRef),
        remove(secureRef)
      ]).then(() => {
        console.log("Removed existing assessment for regeneration");
        // Generate a new question from scratch with some delay to ensure
        // database operations complete first
        setTimeout(() => {
          generateQuestion();
        }, 500);
      });
    } catch (error) {
      console.error("Error during regeneration:", error);
      // Still try to generate a new question but make sure to reset expectation if it fails
      setTimeout(() => {
        generateQuestion().catch(() => {
          setExpectingNewQuestion(false);
          setRegenerating(false);
          isGeneratingRef.current = false;
        });
      }, 500);
    }
  };

  // Animations for components
  const animations = {
    container: {
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1
        }
      }
    },
    item: {
      hidden: { opacity: 0, x: -20 },
      show: (i) => ({
        opacity: 1,
        x: 0,
        transition: {
          delay: i * 0.1
        }
      })
    },
    fadeIn: {
      hidden: { opacity: 0 },
      show: { opacity: 1 }
    },
    slideUp: {
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg border ${questionClassName}`} style={{
      backgroundColor: themeColors.bgLight,
      borderColor: themeColors.border
    }}>
      {/* Header */}
      <div className="px-4 py-3 border-b flex items-center justify-between"
           style={{ backgroundColor: themeColors.bgDark, borderColor: themeColors.border }}>
        <h3 className="text-lg font-medium" style={{ color: themeColors.textDark }}>{title}</h3>
        {question?.generatedBy === 'ai' && (
          <span className="text-xs py-1 px-2 rounded bg-purple-100 text-purple-800 font-medium">
            AI-powered
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading || regenerating ? (
            <motion.div
              key="loading"
              variants={animations.fadeIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="space-y-2">
                  {[1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={i}
                      className="h-10 bg-gray-200 rounded"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    ></motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : question ? (
            <motion.div
              key="question"
              variants={animations.container}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-gray-800 mb-5 text-lg font-medium">{question.questionText}</p>

              <div className={`space-y-2.5 mb-5 ${optionsClassName}`}>
                {question.options?.map((option, index) => (
                  <motion.div
                    key={option.id}
                    variants={animations.item}
                    custom={index}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    style={{
                      ...(selectedAnswer === option.id ? {
                        backgroundColor: `${themeColors.bgLight}`,
                        borderColor: themeColors.accent,
                        boxShadow: `0 0 0 1px ${themeColors.accent}`,
                      } : {}),
                      borderWidth: '1px',
                      transition: 'all 0.2s'
                    }}
                    className={`flex items-center p-3.5 border rounded-md cursor-pointer ${
                      selectedAnswer === option.id
                        ? ``
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    }`}
                    onClick={() => {
                      // Only allow selection if there's no result yet (prevent resubmitting the same question)
                      if (!result) {
                        setSelectedAnswer(option.id);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      id={option.id}
                      name="multipleChoice"
                      value={option.id}
                      checked={selectedAnswer === option.id}
                      onChange={() => !result && setSelectedAnswer(option.id)}
                      disabled={result !== null} // Disable after any submission (prevent resubmitting)
                      className={`mr-3 h-4 w-4 text-${themeColors.name}-600 focus:ring-${themeColors.name}-500`}
                    />
                    <label htmlFor={option.id} className="text-gray-700 flex-grow cursor-pointer">{option.text}</label>

                    {/* Show the correct/incorrect icon if there's a result */}
                    {result?.isCorrect && selectedAnswer === option.id && (
                      <span className="text-green-600 ml-2">✓</span>
                    )}
                    {result?.correctOptionId === option.id && !result.isCorrect && (
                      <span className="text-green-600 ml-2">✓</span>
                    )}
                    {!result?.isCorrect && result?.answer === option.id && result?.answer !== result?.correctOptionId && (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Submit button - only show if not already submitted */}
              {!result && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedAnswer}
                  style={{
                    backgroundColor: themeColors.accent,
                    color: 'white',
                  }}
                  className="mt-3 w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md"
                >
                  {submitting ? 'Submitting...' : 'Submit Answer'}
                </Button>
              )}

              {/* Result feedback */}
              {result && (
                <motion.div
                  variants={animations.slideUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className={`mt-5 p-4 rounded-md shadow-sm ${
                    result.isCorrect
                      ? 'bg-green-50 border border-green-100 text-green-800'
                      : 'bg-red-50 border border-red-100 text-red-800'
                  }`}
                >
                  <p className="font-medium text-base mb-1">
                    {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <p className="mb-3 text-sm">{result.feedback}</p>

                  {/* Additional guidance based on result */}
                  {!result.isCorrect && question.attempts < (question.maxAttempts || maxAttempts) && (
                    <div className="text-sm mb-2 border-t border-b py-2 mt-2">
                      {/* Only show attempts remaining if it's 5 or fewer */}
                      {((question.maxAttempts || maxAttempts) - question.attempts) <= 5 && 
                        <p className="font-medium">You have {(question.maxAttempts || maxAttempts) - question.attempts} attempts remaining.</p>
                      }
                      <p>Review your answer and try again.</p>
                    </div>
                  )}

                  {/* For generating a new AI question */}
                  <div className="mt-4">
                    {result && (
                      <Button
                        onClick={handleRegenerate}
                        style={{
                          backgroundColor: themeColors.accent,
                          color: 'white',
                        }}
                        className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generate New AI Question
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <p className="text-red-600">Failed to load question. Please refresh the page.</p>
              <Button
                onClick={() => generateQuestion()}
                className="mt-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Theme color definitions
function getThemeColors(theme) {
  const themes = {
    blue: {
      name: 'blue',
      accent: '#3b82f6',
      bgLight: '#f0f9ff',
      bgDark: '#dbeafe',
      border: '#bfdbfe',
      textDark: '#1e40af'
    },
    green: {
      name: 'green',
      accent: '#10b981',
      bgLight: '#ecfdf5',
      bgDark: '#d1fae5',
      border: '#a7f3d0',
      textDark: '#047857'
    },
    purple: {
      name: 'purple',
      accent: '#8b5cf6',
      bgLight: '#f5f3ff',
      bgDark: '#ede9fe',
      border: '#ddd6fe',
      textDark: '#6d28d9'
    },
    amber: {
      name: 'amber',
      accent: '#f59e0b',
      bgLight: '#fffbeb',
      bgDark: '#fef3c7',
      border: '#fde68a',
      textDark: '#b45309'
    }
  };

  return themes[theme] || themes.purple;
}

export default AIMultipleChoiceQuestion;