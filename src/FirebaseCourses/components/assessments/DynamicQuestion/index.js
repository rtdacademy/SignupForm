import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';

// Common styling utils
const getThemeColors = (theme) => {
  const themes = {
    blue: {
      name: 'blue',
      bgLight: '#f0f7ff',
      bgDark: '#dbeafe',
      border: '#93c5fd',
      accent: '#2563eb',
      textDark: '#1e3a8a'
    },
    green: {
      name: 'green',
      bgLight: '#ecfdf5',
      bgDark: '#d1fae5',
      border: '#6ee7b7',
      accent: '#059669',
      textDark: '#065f46'
    },
    purple: {
      name: 'purple',
      bgLight: '#f5f3ff',
      bgDark: '#ede9fe',
      border: '#c4b5fd',
      accent: '#7c3aed',
      textDark: '#4c1d95'
    },
    amber: {
      name: 'amber',
      bgLight: '#fffbeb',
      bgDark: '#fef3c7',
      border: '#fcd34d',
      accent: '#d97706',
      textDark: '#92400e'
    }
  };
  
  return themes[theme] || themes.blue;
};

// Animation variants
const animations = {
  fadeIn: {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  },
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
    hidden: { opacity: 0, y: 20 },
    show: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05
      }
    })
  },
  slideUp: {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }
};

/**
 * A reusable Dynamic Question component that interacts with Firebase Cloud Functions
 * for questions that can have multiple forms or types.
 *
 * Settings are loaded in the following priority order:
 * 1. Component props (e.g., maxAttempts, showRegenerate) - highest priority
 * 2. Database settings in /courses/{courseId}/courseDetails/courseStructure
 * 3. Database settings in /courses/{courseId}/assessmentSettings
 * 4. Default values - lowest priority
 */
const DynamicQuestion = ({
  // Required props
  courseId,                // Course identifier
  assessmentId,            // Unique identifier for this assessment
  cloudFunctionName,       // Name of the cloud function to call
  course,                  // Course object (optional, used to find assessment settings)

  // Optional props
  theme = 'green',         // Color theme: 'blue', 'green', 'purple', etc.
  maxAttempts = 5,         // Maximum number of attempts allowed (server can override)
  showRegenerate = true,   // Whether to show regenerate button after correct answer
  title = 'Dynamic Question', // Question title/header
  questionClassName = '',  // Additional class name for question container
  inputClassName = '',     // Additional class name for input container
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
  const [inputAnswer, setInputAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);

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
            
            // If there's a last submission, set the result and input answer
            if (data.lastSubmission) {
              setResult(data.lastSubmission);
              
              // Only set the input answer if it was incorrect (to allow retrying)
              if (data.lastSubmission.answer && !data.lastSubmission.isCorrect) {
                setInputAnswer(data.lastSubmission.answer);
              }
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
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    setRegenerating(true);
    setInputAnswer('');
    setResult(null);
    
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);
      
      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid
      };
      
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
    if (!inputAnswer) {
      alert("Please enter an answer");
      return;
    }

    setSubmitting(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);
      
      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'evaluate',
        answer: inputAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      };
      
      console.log(`Calling cloud function ${cloudFunctionName} to evaluate answer`, functionParams);
      
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

  // Handle regeneration of the question
  const handleRegenerate = () => {
    setInputAnswer('');
    setResult(null);
    generateQuestion();
  };

  return (
    <div className={`rounded-lg overflow-hidden shadow-md ${questionClassName}`} style={{
      backgroundColor: themeColors.bgLight,
      borderColor: themeColors.border
    }}>
      {/* Header */}
      <div className="p-4 border-b" style={{ backgroundColor: themeColors.bgDark, borderColor: themeColors.border }}>
        <h3 className="text-lg font-semibold" style={{ color: themeColors.textDark }}>{title}</h3>
        {question?.difficulty && (
          <span className="inline-block px-2 py-0.5 rounded text-xs font-medium mt-1" style={{
            backgroundColor: themeColors.accent,
            color: 'white'
          }}>
            {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
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
                <div className="h-10 bg-gray-200 rounded mt-4"></div>
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
              <p className="text-gray-800 mb-5 text-lg" dangerouslySetInnerHTML={{ __html: question.questionText }}></p>
              
              <div className={`mb-5 ${inputClassName}`}>
                <input
                  type="text"
                  value={inputAnswer}
                  onChange={(e) => setInputAnswer(e.target.value)}
                  disabled={result?.isCorrect || question.status === 'completed'}
                  placeholder="Enter your answer here"
                  className="w-full p-3 border rounded-lg"
                  style={{ borderColor: themeColors.border }}
                />
              </div>
              
              {/* Submit button - only show if not already answered correctly */}
              {!result?.isCorrect && question.status !== 'completed' && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !inputAnswer}
                  style={{
                    backgroundColor: themeColors.accent,
                    color: 'white',
                  }}
                  className="mt-2 text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
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
                  className={`mt-4 p-4 rounded shadow-sm ${
                    result.isCorrect ? 'bg-green-100 border border-green-200 text-green-800' : 'bg-red-100 border border-red-200 text-red-800'
                  }`}
                >
                  <p className="font-medium text-lg mb-1">
                    {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                  </p>
                  <p className="mb-3">{result.feedback}</p>
                  
                  {/* Correct answer display if incorrect */}
                  {!result.isCorrect && result.correctAnswer && (
                    <p className="mb-3">
                      <span className="font-medium">Correct answer:</span> {result.correctAnswer}
                    </p>
                  )}
                  
                  {/* Regenerate button - only show if answered correctly and regeneration is allowed */}
                  {result.isCorrect && showRegenerate && (
                    <Button
                      onClick={handleRegenerate}
                      style={{
                        backgroundColor: themeColors.accent,
                        color: 'white',
                      }}
                      className="mt-2 text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
                    >
                      Try a New Question
                    </Button>
                  )}
                  
                  {/* Try again message - only if incorrect and attempts remaining */}
                  {!result.isCorrect && question.attempts < (question.maxAttempts || maxAttempts) && allowRetry && (
                    <p className="mt-2 font-medium">
                      You can try again! Attempts remaining: {(question.maxAttempts || maxAttempts) - question.attempts}
                    </p>
                  )}
                  
                  {/* No more attempts message */}
                  {!result.isCorrect && question.attempts >= (question.maxAttempts || maxAttempts) && (
                    <p className="mt-2 font-medium">
                      You've used all your attempts. Review the explanation carefully.
                    </p>
                  )}
                </motion.div>
              )}
              
              {/* Attempts info */}
              <div className="flex justify-between mt-4">
                <span className="text-sm text-gray-500">
                  Difficulty: {question.difficulty || 'Standard'}
                </span>
                <span className="text-sm text-gray-500">
                  Attempts: {question.attempts || 0}/{question.maxAttempts || maxAttempts}
                </span>
              </div>
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
                onClick={generateQuestion}
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

export default DynamicQuestion;