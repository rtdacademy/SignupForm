import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Infinity } from 'lucide-react';
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
 * - Real-time updates via Firebase database listener
 */
const AIMultipleChoiceQuestion = ({
  // Required props
  courseId,                // Course identifier
  assessmentId,            // Unique identifier for this assessment
  cloudFunctionName,       // Name of the cloud function to call
  course,                  // Course object (optional - not used for database access anymore)

  // Styling props only - all other configuration comes from the database
  theme = 'purple',        // Color theme: 'blue', 'green', 'purple', etc.
  questionClassName = '',  // Additional class name for question container
  optionsClassName = '',   // Additional class name for options container
  
  // Callback functions
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
  // Add a safety timeout ref to exit loading state if stuck
  const safetyTimeoutRef = useRef(null);

  // Add cleanup effect
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);
  
  // Effect to handle safety timeouts for loading state
  useEffect(() => {
    // Define loadAssessment function here to avoid dependency issues
    const attemptReload = async () => {
      try {
        console.log("Attempting to reload assessment after safety timeout");
        setLoading(true);
        
        // After a safety timeout, we rely on the database listener to refresh data
        // Just reset the component state and allow the database listener to update
        console.log("Safety timeout triggered - resetting state and waiting for database update");
        
        // Reset state but don't clear the question to avoid UI flicker
        if (question) {
          setLastQuestionTimestamp(question.timestamp || 0);
        }
        
        setLoading(false);
      } catch (err) {
        console.error("Error in safety reload:", err);
        setLoading(false);
      }
    };
    
    // If we're regenerating and expecting a new question, set a safety timeout
    if (regenerating && expectingNewQuestion) {
      // Clear any existing safety timeout
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      
      // Set a new safety timeout (30 seconds)
      safetyTimeoutRef.current = setTimeout(() => {
        console.log("🚨 Safety timeout triggered after 30 seconds - force exiting loading state");
        setRegenerating(false);
        setExpectingNewQuestion(false);
        // Try to reload with current data
        attemptReload();
      }, 30000);
    } else if (!regenerating || !expectingNewQuestion) {
      // Clear the safety timeout if we're no longer in regeneration state
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
        safetyTimeoutRef.current = null;
      }
    }
    
    return () => {
      // Clean up the safety timeout if the effect re-runs
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, [regenerating, expectingNewQuestion, course, assessmentId]);
  
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
            console.log("AI question data received from database:", data);
            
            // Check if maxAttempts has been reached - use value from data rather than default
            const maxAttemptsFromData = data.maxAttempts; // No fallback needed, we want to use what's in the data
            const attemptsExhausted = data.attempts >= maxAttemptsFromData;
            const maxAttemptsReached = data.status === 'maxAttemptsReached' || attemptsExhausted;
            
            // Enhance the data with our UI flags
            const enhancedData = {
              ...data,
              maxAttemptsReached,
              attemptsExhausted
            };
            
            // If we're expecting a new question during regeneration
            if (expectingNewQuestion) {
              // Check if this is a new question using more relaxed criteria
              const newTimestamp = data.timestamp || 0;
              const oldTimestamp = lastQuestionTimestamp || 0;
              const newQuestionText = data.questionText || '';
              const oldQuestionText = question?.questionText || '';
              
              // Log what we're comparing
              console.log(`Timestamp comparison - New: ${newTimestamp}, Old: ${oldTimestamp}`);
              console.log(`Text comparison - New question starts with: "${newQuestionText.substring(0, 20)}...", Old question starts with: "${oldQuestionText.substring(0, 20)}..."`);
              
              // Check various conditions that might indicate a new question
              const isNewTimestamp = newTimestamp > oldTimestamp;
              const isNewQuestionText = newQuestionText !== oldQuestionText && newQuestionText.length > 0;
              
              // Also check if options have changed, which is a strong indicator of a new question
              const hasNewOptions = data.options && question?.options && 
                JSON.stringify(data.options) !== JSON.stringify(question.options);
              
              // Add a timeout to prevent infinite loading
              const regenerationTimeoutExpired = Date.now() - lastGeneratedTimeRef.current > 10000; // 10 seconds
              
              // Accept if EITHER timestamp is newer OR question text has changed OR options have changed
              // OR if we've been waiting too long (safety timeout)
              if (isNewTimestamp || isNewQuestionText || hasNewOptions || regenerationTimeoutExpired) {
                // This is a new question, update the UI
                console.log(`✅ New question detected! Criteria matched: ${
                  [
                    isNewTimestamp ? 'new timestamp' : '',
                    isNewQuestionText ? 'different text' : '',
                    hasNewOptions ? 'different options' : '',
                    regenerationTimeoutExpired ? 'timeout expired' : ''
                  ].filter(Boolean).join(', ')
                }`);
                
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
                // Log that we're still waiting for a truly new question
                console.log("⚠️ Received update but doesn't match new question criteria yet, waiting for complete update");
                setLastQuestionTimestamp(newTimestamp); // Still update timestamp for future comparisons
                
                // Safety measure: If we've been waiting for more than 15 seconds, force-accept this as a new question
                if (Date.now() - lastGeneratedTimeRef.current > 15000) {
                  console.log("⚠️ Safety timeout triggered - accepting update as new question despite not meeting criteria");
                  setQuestion(enhancedData);
                  setExpectingNewQuestion(false);
                  setRegenerating(false);
                  setResult(null);
                  setSelectedAnswer('');
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
            console.log("No AI question data found in database, generating new question");
            generateQuestion();
          }
          setLoading(false);
        }, (error) => {
          console.error("Error in database listener:", error);
          setError("Failed to load question data");
          setLoading(false);
        });

        // Return cleanup function to unsubscribe from database listener
        return () => unsubscribe();
      } catch (err) {
        console.error("Error loading assessment:", err);
        setError("Failed to load assessment. Please try refreshing the page.");
        setLoading(false);
      }
    };

    // Start the database listener
    const unsubscribePromise = loadAssessment();
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      unsubscribePromise?.then(unsubscribe => unsubscribe && unsubscribe());
    };
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

      // Extract topic and difficulty from question data if available
      const topicFromData = question?.topic || 'elearning_benefits_challenges';
      const difficultyFromData = question?.difficulty || 'intermediate';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };

      console.log(`Calling cloud function ${cloudFunctionName} to generate AI question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("AI question generation successful:", result);

      // The cloud function will update the assessment in the database
      // Our database listener will pick up the changes automatically
      // We should NOT reset regenerating flag here - wait for the listener to update
      
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

      // Extract topic and difficulty from question data if available
      const topicFromData = question?.topic || 'elearning_benefits_challenges';
      const difficultyFromData = question?.difficulty || 'intermediate';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'evaluate',
        answer: selectedAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };

      console.log(`Calling cloud function ${cloudFunctionName} to evaluate AI question answer`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Answer evaluation successful:", result);

      // Trigger callback
      onAttempt(result.data?.result?.isCorrect || false);

      if (result.data?.result?.isCorrect) {
        onCorrectAnswer();
      }

      // The database listener will pick up the submitted answer and update the UI
      // But we can also handle the result directly from the response for immediate feedback
      if (result.data?.result) {
        setResult(result.data.result);
      }
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
    if (question && question.attempts >= question.maxAttempts) {
      console.log(`Cannot regenerate - max attempts reached (${question.attempts}/${question.maxAttempts})`);
      setError(`You have reached the maximum number of attempts (${question.maxAttempts}).`);
      return;
    }
    
    // Record the regeneration start time for timeout handling
    lastGeneratedTimeRef.current = Date.now();
    
    // Update UI state immediately
    setSelectedAnswer('');
    setResult(null);
    setRegenerating(true);
    setError(null); // Clear any previous errors
    
    // Mark that we're expecting a new question to arrive via database listener
    setExpectingNewQuestion(true);

    // Call the cloud function directly, which will handle incrementing the attempts
    // and update the database, which will trigger our database listener
    try {
      console.log("Requesting question regeneration while preserving attempt count");
      generateQuestion().catch(error => {
        // Handle async errors
        console.error("Error during question regeneration:", error);
        setExpectingNewQuestion(false);
        setRegenerating(false);
        isGeneratingRef.current = false;
        setError("Failed to regenerate question: " + (error.message || error));
      });
    } catch (error) {
      // Handle immediate errors
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
          <h3 className="text-lg font-medium" style={{ color: themeColors.textDark }}>
            {question?.title || 'AI-Generated Question'}
          </h3>
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
              <span className="mx-1">/</span>
              {question.maxAttempts && question.maxAttempts > 1000 ? (
                <Infinity className="h-3.5 w-3.5 inline-block text-gray-600" />
              ) : (
                <span className="font-medium">{question.maxAttempts}</span>
              )}
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
                  {!result.isCorrect && question.attempts < question.maxAttempts && (
                    <div className="text-sm mb-2 border-t border-b py-2 mt-2">
                      <p className="font-medium flex items-center">
                        {question.maxAttempts > 1000 ? 
                          <>Attempt {question.attempts}</> : 
                          <>Attempt {question.attempts} of {question.maxAttempts}</>
                        }
                        {(question.maxAttempts - question.attempts) > 0 && question.maxAttempts <= 1000 && 
                          <> ({question.maxAttempts - question.attempts} remaining)</>
                        }
                        {question.maxAttempts > 1000 && 
                          <> (unlimited <Infinity className="h-3.5 w-3.5 inline-block ml-0.5" />)</>
                        }
                      </p>
                      <p>Review your answer and try again.</p>
                    </div>
                  )}

                  {/* For generating a new AI question */}
                  <div className="mt-4">
                    {result && !question.maxAttemptsReached && !question.attemptsExhausted && 
                     question.attempts < question.maxAttempts && (
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
                      question.attempts >= question.maxAttempts) && (
                      <div className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Maximum attempts reached</p>
                        <p className="flex items-center">
                          {question.maxAttempts > 1000 ?
                            <>You have made {question.attempts} attempts for this question and cannot make more.</>
                           :
                            <>You have used all {question.attempts} of your {question.maxAttempts} available attempts for this question.</>
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