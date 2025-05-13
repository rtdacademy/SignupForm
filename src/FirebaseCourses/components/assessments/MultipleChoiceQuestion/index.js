import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';
import { getThemeColors, animations } from './styles';

/**
 * A reusable Multiple Choice Question component that interacts with Firebase Cloud Functions
 * for secure assessment handling. Supports randomization, regeneration, and tracks attempts.
 * Provides different question variants on retry attempts.
 *
 * Settings are loaded in the following priority order:
 * 1. Component props (e.g., maxAttempts, showRegenerate) - highest priority
 * 2. Database settings in /courses/{courseId}/courseDetails/courseStructure
 * 3. Database settings in /courses/{courseId}/assessmentSettings
 * 4. Default values - lowest priority
 */
const MultipleChoiceQuestion = ({
  // Required props
  courseId,                // Course identifier
  assessmentId,            // Unique identifier for this assessment
  cloudFunctionName,       // Name of the cloud function to call
  course,                  // Course object (optional, used to find assessment settings)

  // Optional props
  theme = 'blue',          // Color theme: 'blue', 'green', 'purple', etc.
  maxAttempts = 9999,      // For homework-style questions, use a very large number (Firebase doesn't support Infinity)
  showRegenerate = true,   // Whether to show regenerate button after correct answer
  title = 'Practice Question', // Question title/header for homework-style questions
  questionClassName = '',  // Additional class name for question container
  optionsClassName = '',   // Additional class name for options container
  allowRetry = true,       // Allow retry if the answer is wrong
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
  const [previousVariantIds, setPreviousVariantIds] = useState([]);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Get theme colors
  const themeColors = getThemeColors(theme);

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
            console.log("Question data received:", data);
            setQuestion(data);

            // If we have a variant ID, add it to our tracking array
            if (data.variantId && !previousVariantIds.includes(data.variantId)) {
              setPreviousVariantIds(prev => [...prev, data.variantId]);
            }

            // If there's a last submission, set the result
            if (data.lastSubmission) {
              setResult(data.lastSubmission);
              // No longer automatically setting selectedAnswer to allow clean retry attempts
            }
          } else {
            console.log("No question data found, generating new question");
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
  }, [currentUser, courseId, assessmentId, db]);

  // Generate a new question using cloud function
  const generateQuestion = async (forceNewVariant = false) => {
    if (!currentUser || !currentUser.email) return;

    setRegenerating(true);
    setSelectedAnswer('');
    setResult(null);

    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      // For homework-style questions, always generate a new variant with a unique seed
      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        // Use current timestamp as seed to ensure uniqueness
        seed: Date.now()
      };

      // Always send previously seen variants to avoid repeats
      if (previousVariantIds.length > 0) {
        functionParams.previousVariantIds = previousVariantIds;
      }

      console.log(`Calling cloud function ${cloudFunctionName} to generate question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Question generation successful:", result);

      // The database listener will pick up the new question data
    } catch (err) {
      console.error("Error generating question:", err);
      setError("Failed to generate question: " + (err.message || err));
      setLoading(false);
    } finally {
      setRegenerating(false);
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
        // Include previously seen variants to avoid repeats
        previousVariantIds: previousVariantIds
      };

      console.log(`Calling cloud function ${cloudFunctionName} to evaluate answer`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Answer evaluation successful:", result);

      // Trigger callback
      onAttempt(result.data?.result?.isCorrect || false);

      if (result.data?.result?.isCorrect) {
        onCorrectAnswer();
      }
      // Removed automatic generation of new variant - will use button instead

      // The database listener will pick up the result
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit your answer. Please try again: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle regeneration of the question
  const handleRegenerate = () => {
    setSelectedAnswer('');
    setResult(null);
    // Always force a new variant when explicitly regenerating
    generateQuestion(true);
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
        {/* No variant counter needed */}
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
                      <p className="font-medium">You have {(question.maxAttempts || maxAttempts) - question.attempts} attempts remaining.</p>
                      <p>Review your answer and try again, or try a different question.</p>
                    </div>
                  )}

                  {/* Regenerate button - only show if answered correctly and regeneration is allowed */}
                  {result.isCorrect && showRegenerate && (
                    <Button
                      onClick={handleRegenerate}
                      style={{
                        backgroundColor: themeColors.accent,
                        color: 'white',
                      }}
                      className="mt-2 w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90"
                    >
                      Try a New Question
                    </Button>
                  )}

                  {/* For homework-style questions with infinite variants */}
                  <div className="mt-4">
                    {/* Generate New Question button - always shown after submission */}
                    {result && (
                      <Button
                        onClick={() => generateQuestion(true)}
                        style={{
                          backgroundColor: themeColors.accent,
                          color: 'white',
                        }}
                        className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generate New Question
                      </Button>
                    )}
                  </div>

                  {/* We no longer need a "no more attempts" message since we have infinite attempts */}
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
                onClick={() => generateQuestion(false)}
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

export default MultipleChoiceQuestion;