import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';
import SimpleQuillEditor from '../../../../components/SimpleQuillEditor';
import { Save, Send, FileText, BookOpen } from 'lucide-react';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

/**
 * Helper function to detect if text contains markdown patterns
 */
const containsMarkdown = (text) => {
  if (!text) return false;
  
  const markdownPatterns = [
    /^#+\s+.+$/m,                  // Headers
    /\*\*.+\*\*/,                  // Bold
    /\*.+\*/,                      // Italic
    /```[\s\S]*```/,               // Code block
    /`[^`]+`/,                     // Inline code
    /\[.+\]\(.+\)/,                // Links
    /\$\$.+\$\$/,                  // Math blocks
    /\$.+\$/,                      // Inline math
    /\\[a-zA-Z]+/,                 // LaTeX commands
  ];
  
  return markdownPatterns.some(pattern => pattern.test(text));
};

/**
 * Enhanced text rendering that handles both markdown and LaTeX math
 */
const renderEnhancedText = (text) => {
  if (!text) return text;
  
  if (containsMarkdown(text)) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }
  
  return <div style={{ whiteSpace: 'pre-wrap' }}>{text}</div>;
};

/**
 * A Standard Long Answer Question component that selects questions from a predefined pool.
 * This component handles:
 * - Random question selection from configured pool
 * - Rich text answer editing via SimpleQuillEditor
 * - Answer saving and submission for manual grading
 * - Tracking of attempts
 * - Displaying rubrics
 * - Real-time updates via Firebase database listener
 */
const StandardLongAnswerQuestion = ({
  // Required props
  courseId,                // Course identifier
  cloudFunctionName,       // Name of the cloud function to call
  assessmentId,            // Assessment identifier
  topic,                   // Topic for question context (optional)

  // Styling props
  theme = 'purple',        // Color theme
  title,                   // Custom title for the question
  questionClassName = '',  // Additional class name for question container
  
  // Exam mode props
  examMode = false,        // Whether this question is part of an exam
  examSessionId = null,    // Exam session ID if in exam mode
  onExamAnswerSave = () => {}, // Callback when answer is saved in exam mode
  
  // Callback functions
  onSave = () => {},       // Callback when answer is saved
  onSubmit = () => {},     // Callback when answer is submitted
  onComplete = () => {},   // Callback when assessment is completed
}) => {
  // Use cloudFunctionName as assessmentId if not provided
  const finalAssessmentId = assessmentId || cloudFunctionName;
  
  if (!cloudFunctionName || !finalAssessmentId) {
    console.error('StandardLongAnswerQuestion: cloudFunctionName is required');
    return <div className="p-4 bg-red-50 text-red-600 rounded">Error: cloudFunctionName is required</div>;
  }
  
  // Authentication and state
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lastSavedAnswer, setLastSavedAnswer] = useState('');
  const [showRubric, setShowRubric] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  
  // Refs for the editor
  const editorRef = useRef(null);
  
  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Get theme colors
  const themeColors = getThemeColors(theme);

  // Calculate word count
  const getWordCount = (text) => {
    if (!text) return 0;
    // Strip HTML tags for accurate word count
    const strippedText = text.replace(/<[^>]*>/g, '');
    return strippedText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const wordCount = getWordCount(answer);

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
    let unsubscribeRef = null;
    
    const loadAssessment = () => {
      setLoading(true);
      try {
        const basePath = 'students';
        const dbPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${finalAssessmentId}`;
        console.log(`Creating database ref for long answer question: ${dbPath}`);

        // Setup firebase database listener
        const assessmentRef = ref(db, dbPath);

        unsubscribeRef = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            console.log("Standard long answer data received from database:", data);
            
            // Check if max attempts has been reached
            const maxAttemptsReached = data.attempts >= data.maxAttempts;
            
            // Enhance the data with our UI flags
            const enhancedData = {
              ...data,
              maxAttemptsReached
            };
            
            setQuestion(enhancedData);
            
            // Set showRubric based on question settings
            if (data.settings?.showRubric !== undefined) {
              setShowRubric(data.settings.showRubric);
            }
            
            // If there's a last submission, set the answer
            if (data.lastSubmission?.answer) {
              setAnswer(data.lastSubmission.answer);
              setLastSavedAnswer(data.lastSubmission.answer);
            }
            
            // If submitted, show appropriate message
            if (data.status === 'submitted') {
              console.log("Answer already submitted for this assessment");
            }
          } else {
            console.log("No standard long answer data found in database, generating new question");
            generateQuestion();
          }
          setLoading(false);
        }, (error) => {
          console.error("Error in database listener:", error);
          setError("Failed to load question data");
          setLoading(false);
        });
      } catch (err) {
        console.error("Error loading assessment:", err);
        setError("Failed to load assessment. Please try refreshing the page.");
        setLoading(false);
      }
    };

    // Start the database listener
    loadAssessment();
    
    // Cleanup function to unsubscribe when component unmounts
    return () => {
      if (unsubscribeRef) {
        unsubscribeRef();
      }
    };
  }, [currentUser, courseId, finalAssessmentId, db]);

  // Generate a new question using cloud function
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    setRegenerating(true);
    setAnswer('');
    setLastSavedAnswer('');

    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic || 'general',
        difficulty: 'intermediate'
      };

      console.log(`Calling cloud function ${cloudFunctionName} to generate standard long answer question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Standard long answer generation successful:", result);

      // The cloud function will update the assessment in the database
      // Our database listener will pick up the changes automatically
      setRegenerating(false);
    } catch (err) {
      console.error("Error generating standard long answer question:", err);
      setError("Failed to generate question: " + (err.message || err));
      setLoading(false);
      setRegenerating(false);
    }
  };

  // Handle saving the answer (draft)
  const handleSave = async () => {
    if (!answer || answer.trim().length === 0) {
      alert("Please write an answer before saving");
      return;
    }

    setSaving(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'save',
        answer: answer,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      };

      console.log(`Calling cloud function ${cloudFunctionName} to save draft answer`);

      const result = await assessmentFunction(functionParams);
      console.log("Answer saved successfully:", result);

      setLastSavedAnswer(answer);
      onSave(result);
      
    } catch (err) {
      console.error("Error saving answer:", err);
      setError("Failed to save your answer: " + (err.message || err));
    } finally {
      setSaving(false);
    }
  };

  // Handle submission of the answer (final)
  const handleSubmit = async () => {
    if (!answer || answer.trim().length === 0) {
      alert("Please write an answer before submitting");
      return;
    }

    // Check word count requirements
    const currentWordCount = getWordCount(answer);
    const wordLimit = question?.wordLimit || { min: 100, max: 500 };
    
    if (currentWordCount < wordLimit.min) {
      alert(`Your answer is too short. Minimum ${wordLimit.min} words required, you have ${currentWordCount} words.`);
      return;
    }
    
    if (currentWordCount > wordLimit.max) {
      alert(`Your answer is too long. Maximum ${wordLimit.max} words allowed, you have ${currentWordCount} words.`);
      return;
    }

    // Confirm submission
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your answer? This action cannot be undone and will use one of your attempts."
    );
    
    if (!confirmSubmit) {
      return;
    }

    // Check if this is exam mode
    if (examMode) {
      await handleExamAnswerSave();
      return;
    }

    setSubmitting(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'submit',
        answer: answer,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      };

      console.log(`Calling cloud function ${cloudFunctionName} to submit answer for grading`);

      const result = await assessmentFunction(functionParams);
      console.log("Answer submitted successfully:", result);

      onSubmit(result);
      
      if (result.attemptsRemaining === 0 || result.submitted) {
        onComplete();
      }
      
    } catch (err) {
      console.error("Error submitting answer:", err);
      setError("Failed to submit your answer: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle saving answer in exam mode
  const handleExamAnswerSave = async () => {
    if (!answer || answer.trim().length === 0) {
      alert("Please write an answer before saving");
      return;
    }

    setSubmitting(true);
    try {
      // In exam mode, save the answer without evaluation
      const saveExamAnswerFunction = httpsCallable(functions, 'saveExamAnswer');
      
      const saveParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        answer: answer,
        examSessionId: examSessionId,
        studentEmail: currentUser.email,
        isLongAnswer: true
      };

      console.log(`Saving exam answer: ${finalAssessmentId}`);
      await saveExamAnswerFunction(saveParams);

      onExamAnswerSave(answer, finalAssessmentId);
      
    } catch (err) {
      console.error("Error saving exam answer:", err);
      setError("Failed to save your answer: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle regeneration of the question
  const handleRegenerate = () => {
    if (question && question.attempts >= question.maxAttempts) {
      console.log(`Cannot regenerate - max attempts reached (${question.attempts}/${question.maxAttempts})`);
      setError(`You have reached the maximum number of attempts (${question.maxAttempts}).`);
      return;
    }
    
    // Confirm regeneration if there's unsaved work
    if (answer && answer !== lastSavedAnswer) {
      const confirmRegenerate = window.confirm(
        "You have unsaved changes. Regenerating will lose your current answer. Are you sure?"
      );
      if (!confirmRegenerate) {
        return;
      }
    }
    
    generateQuestion();
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
            {question?.title || title || 'Long Answer Question'}
          </h3>
          <div className="flex items-center gap-2">
            {examMode && (
              <span className="text-xs py-1 px-2 rounded bg-red-100 text-red-800 font-medium">
                EXAM MODE
              </span>
            )}
            <span className="text-xs py-1 px-2 rounded bg-blue-100 text-blue-800 font-medium">
              Standard
            </span>
          </div>
        </div>
        
        {/* Display attempts counter and word count */}
        {question && (
          <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
            <span className="flex items-center">
              <FileText className="h-3.5 w-3.5 mr-1" />
              Attempts: <span className="font-medium ml-1">{question.attempts || 0} / {question.maxAttempts}</span>
            </span>
            {question.settings?.showWordCount !== false && (
              <span className="flex items-center">
                Words: <span className={`font-medium ml-1 ${
                  wordCount < (question.wordLimit?.min || 100) ? 'text-red-600' :
                  wordCount > (question.wordLimit?.max || 500) ? 'text-red-600' :
                  'text-green-600'
                }`}>
                  {wordCount} / {question.wordLimit?.min || 100}-{question.wordLimit?.max || 500}
                </span>
              </span>
            )}
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
                <div className="h-32 bg-gray-200 rounded"></div>
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
              {/* Question Text */}
              <div className="text-gray-800 mb-5 text-lg font-medium">
                {renderEnhancedText(question.questionText)}
              </div>

              {/* Rubric */}
              {question.settings?.showRubric !== false && question.rubric && (
                <motion.div
                  variants={animations.slideUp}
                  initial="hidden"
                  animate="show"
                  className="mb-5"
                >
                  <button
                    onClick={() => setShowRubric(!showRubric)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-3 hover:text-gray-900"
                  >
                    <BookOpen className="h-4 w-4" />
                    {showRubric ? 'Hide' : 'Show'} Rubric ({question.maxPoints} points)
                  </button>
                  
                  {showRubric && (
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-300">
                            <th className="text-left py-2 px-3 font-medium">Criterion</th>
                            <th className="text-center py-2 px-3 font-medium w-20">Points</th>
                            <th className="text-left py-2 px-3 font-medium">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {question.rubric.map((criterion, index) => (
                            <tr key={index} className="border-b border-gray-200">
                              <td className="py-2 px-3 font-medium">{criterion.criterion}</td>
                              <td className="py-2 px-3 text-center">{criterion.points}</td>
                              <td className="py-2 px-3 text-gray-600">{criterion.description}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td className="py-2 px-3 font-bold">Total</td>
                            <td className="py-2 px-3 text-center font-bold">{question.maxPoints}</td>
                            <td></td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Answer Editor */}
              {question.status !== 'submitted' ? (
                <div className="mb-5">
                  <div className="border rounded-lg overflow-hidden" style={{ borderColor: themeColors.border }}>
                    <SimpleQuillEditor
                      ref={editorRef}
                      courseId={courseId}
                      unitId="assessment"
                      itemId={finalAssessmentId}
                      initialContent={answer}
                      onSave={(content) => setAnswer(content)}
                      onError={(error) => setError(error)}
                    />
                  </div>
                </div>
              ) : (
                <div className="mb-5 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800 mb-2">
                    ✓ Your answer has been submitted
                  </p>
                  <p className="text-sm text-green-700">
                    Your answer has been submitted for grading. You will receive feedback once your instructor reviews it.
                  </p>
                  {question.lastSubmission?.wordCount && (
                    <p className="text-sm text-green-700 mt-1">
                      Word count: {question.lastSubmission.wordCount}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              {question.status !== 'submitted' && !question.maxAttemptsReached && (
                <div className="flex gap-3">
                  {!examMode && (
                    <Button
                      onClick={handleSave}
                      disabled={saving || submitting || !answer}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {saving ? 'Saving...' : lastSavedAnswer === answer ? 'Saved' : 'Save Draft'}
                    </Button>
                  )}
                  
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || saving || !answer}
                    style={{
                      backgroundColor: examMode ? '#ef4444' : themeColors.accent,
                      color: 'white',
                    }}
                    className="flex items-center gap-2 text-white"
                  >
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : examMode ? 'Save Answer' : 'Submit for Grading'}
                  </Button>

                  {!examMode && question.attempts < question.maxAttempts - 1 && (
                    <Button
                      onClick={handleRegenerate}
                      disabled={regenerating}
                      variant="outline"
                      className="ml-auto"
                    >
                      Try Different Question
                    </Button>
                  )}
                </div>
              )}

              {/* Max attempts reached message */}
              {question.maxAttemptsReached && question.status !== 'submitted' && (
                <div className="mt-4 text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                  <p className="font-medium">Maximum attempts reached</p>
                  <p>You have used all {question.maxAttempts} available attempts for this question.</p>
                </div>
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

export default StandardLongAnswerQuestion;