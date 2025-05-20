import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';

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
  course,                  // Course object 

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

    // Load assessment from course.Assessments
    const loadAssessment = async () => {
      setLoading(true);
      try {
        console.log(`Loading assessment from course.Assessments: ${assessmentId}`);
        
        if (course && course.Assessments && course.Assessments[assessmentId]) {
          const data = course.Assessments[assessmentId];
          console.log("AI question data received from course:", data);
          
          // Check if maxAttempts has been reached
          const attemptsExhausted = data.attempts >= (data.maxAttempts || maxAttempts);
          const maxAttemptsReached = data.status === 'maxAttemptsReached' || attemptsExhausted;
          
          // Enhance the data with our UI flags
          const enhancedData = {
            ...data,
            maxAttemptsReached,
            attemptsExhausted
          };
          
          // If we're expecting a new question during regeneration
          if (expectingNewQuestion) {
            // Check if this is truly a new question (by timestamp AND question text)
            const newTimestamp = data.timestamp || 0;
            const oldTimestamp = lastQuestionTimestamp || 0;
            const newQuestionText = data.questionText || '';
            const oldQuestionText = question?.questionText || '';
            
            // Log what we're comparing
            console.log(`Timestamp comparison - New: ${newTimestamp}, Old: ${oldTimestamp}`);
            console.log(`Text comparison - New question starts with: "${newQuestionText.substring(0, 20)}...", Old question starts with: "${oldQuestionText.substring(0, 20)}..."`);
            
            // Only consider it a new question if BOTH the timestamp is newer AND the question text has changed
            // This prevents intermediate updates from being treated as new questions
            const isNewTimestamp = newTimestamp > oldTimestamp;
            const isNewQuestionText = newQuestionText !== oldQuestionText && newQuestionText.length > 0;
            
            if (isNewTimestamp && isNewQuestionText) {
              // This is truly a new question, update the UI
              console.log("✅ New question detected with new timestamp and different text");
              setQuestion(enhancedData);
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
              // Not a completely new question - might be a partial update
              // So we don't update the UI, but we do take note of new timestamp if it exists
              if (isNewTimestamp) {
                console.log("⚠️ New timestamp but same question text. Likely an intermediate update, not treating as new question.");
                setLastQuestionTimestamp(newTimestamp); // Still update timestamp for future comparisons
              } else {
                console.log("⚠️ Received same question or older question, ignoring update");
              }
            }
          } else {
            // Normal case, update question data
            setQuestion(enhancedData);
            setLastQuestionTimestamp(data.timestamp || 0);
            
            // If there's a last submission, set the result and preselect the answer
            if (data.lastSubmission) {
              setResult(data.lastSubmission);
              // Preselect the last submitted answer
              setSelectedAnswer(data.lastSubmission.answer || '');
              console.log(`Preselecting last submitted answer: ${data.lastSubmission.answer}`);
            }
            
            // If max attempts reached, show appropriate message
            if (maxAttemptsReached) {
              console.log("Maximum attempts reached for this assessment:", data.attempts);
              // Only set the error if there's not already a result showing (to avoid confusion)
              if (!data.lastSubmission) {
                setError("You've reached the maximum number of attempts for this question.");
              }
            }
          }
        } else {
          console.log("No AI question data found in course, generating new question");
          generateQuestion();
        }
        setLoading(false);
      } catch (err) {
        console.error("Error loading assessment:", err);
        setError("Failed to load assessment. Please try refreshing the page.");
        setLoading(false);
      }
    };

    loadAssessment();
  }, [currentUser, courseId, assessmentId, course, expectingNewQuestion, lastQuestionTimestamp]);

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

      // The cloud function will update the course.Assessments in the database
      // Since we don't have a listener anymore, we need to handle manually or wait for props update
      // We should NOT reset regenerating flag here - wait for course prop to update
      
      // If we're not in regeneration mode, we can clear the regenerating flag
      if (!expectingNewQuestion) {
        setRegenerating(false);
      }
    } catch (err) {
      console.error("Error generating AI question:", err);
      
      // Check if this is a max attempts error from the server
      if (err.message && err.message.includes("Maximum attempts")) {
        // This is a max attempts error - update the question state to reflect this
        if (question) {
          // Update the local question state to mark it as max attempts reached
          setQuestion({
            ...question,
            maxAttemptsReached: true,
            status: 'maxAttemptsReached',
            attemptsExhausted: true
          });
        }
        setError("You've reached the maximum number of attempts for this question.");
      } else {
        // Generic error
        setError("Failed to generate question: " + (err.message || err));
      }
      
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

      // Since we removed the database listener, we need to handle the result manually
      // If the result data is available directly in the cloud function response, use it
      if (result.data?.result) {
        setResult(result.data.result);
      }
      // Otherwise we'll rely on the updated course prop
    } catch (err) {
      console.error("Error submitting answer:", err);
      
      // Check if this is a max attempts error from the server
      if (err.message && err.message.includes("Maximum attempts")) {
        // This is a max attempts error - update the question state to reflect this
        if (question) {
          // Update the local question state to mark it as max attempts reached
          setQuestion({
            ...question,
            maxAttemptsReached: true,
            status: 'maxAttemptsReached',
            attemptsExhausted: true
          });
        }
        setError("You've reached the maximum number of attempts for this question.");
      } else {
        // Generic error
        setError("Failed to submit your answer. Please try again: " + (err.message || err));
      }
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
    
    // Delay UI updates until after operations to prevent flickering
    setTimeout(() => {
      setSelectedAnswer('');
      setResult(null);
      setRegenerating(true);
      // Mark that we're expecting a new question to arrive via course prop update
      setExpectingNewQuestion(true);
    }, 0);

    // Call the cloud function directly, which will handle incrementing the attempts
    // and update the database, which will trigger a course prop update from parent
    try {
      console.log("Requesting question regeneration while preserving attempt count");
      generateQuestion();
    } catch (error) {
      console.error("Error during regeneration:", error);
      setExpectingNewQuestion(false);
      setRegenerating(false);
      isGeneratingRef.current = false;
      setError("Failed to regenerate question: " + (error.message || error));
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
      <div className="px-4 py-3 border-b"
           style={{ backgroundColor: themeColors.bgDark, borderColor: themeColors.border }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium" style={{ color: themeColors.textDark }}>{title}</h3>
          {question?.generatedBy === 'ai' && (
            <span className="text-xs py-1 px-2 rounded bg-purple-100 text-purple-800 font-medium">
              AI-powered
            </span>
          )}
        </div>
        
        {/* Display attempts counter when question is loaded */}
        {question && (
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Attempts: <span className="font-medium ml-1">{question.attempts || 0}</span> 
              {question.maxAttempts && question.maxAttempts < 9999 && 
                <span> / {question.maxAttempts}</span>}
            </span>
          </div>
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
                      <p className="font-medium">
                        {(question.maxAttempts || maxAttempts) >= 9999 ? 
                          `Attempt ${question.attempts}` : 
                          `Attempt ${question.attempts} of ${question.maxAttempts || maxAttempts}`}
                        {((question.maxAttempts || maxAttempts) - question.attempts) > 0 && (question.maxAttempts || maxAttempts) < 9999 && 
                          ` (${(question.maxAttempts || maxAttempts) - question.attempts} remaining)`
                        }
                      </p>
                      <p>Review your answer and try again.</p>
                    </div>
                  )}

                  {/* For generating a new AI question */}
                  <div className="mt-4">
                    {result && !question.maxAttemptsReached && !question.attemptsExhausted && 
                     question.attempts < (question.maxAttempts || maxAttempts) && (
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
                    
                    {/* Display message when max attempts reached */}
                    {(question.maxAttemptsReached || question.attemptsExhausted || 
                      question.attempts >= (question.maxAttempts || maxAttempts)) && (
                      <div className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Maximum attempts reached</p>
                        <p>
                          {(question.maxAttempts || maxAttempts) >= 9999 ?
                            `You have made ${question.attempts} attempts for this question and cannot make more.` :
                            `You have used all ${question.attempts} of your ${question.maxAttempts || maxAttempts} available attempts for this question.`
                          }
                        </p>
                      </div>
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