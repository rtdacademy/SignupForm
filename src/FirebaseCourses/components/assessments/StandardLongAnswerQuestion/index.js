import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';
import SimpleQuillEditor from '../../../../components/SimpleQuillEditor';
import { Save, Send, FileText, BookOpen, Clipboard, Infinity } from 'lucide-react';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';

// Theme configuration with gradient colors (matching StandardMultipleChoiceQuestion)
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
    /!\[.*\]\(.+\)/,               // Images: ![alt](url)
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
          components={{
            // Style images to be responsive and centered
            img: ({node, ...props}) => (
              <div className="my-4 text-center">
                <img 
                  {...props} 
                  className="max-w-full h-auto mx-auto rounded-lg shadow-md border border-gray-200"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            ),
            // Style other elements
            h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-4 mb-2" {...props} />,
            h2: ({node, ...props}) => <h3 className="text-lg font-bold mt-3 mb-2" {...props} />,
            h3: ({node, ...props}) => <h4 className="text-base font-bold mt-2 mb-1" {...props} />,
            p: ({node, ...props}) => <p className="mb-2" {...props} />,
            ul: ({node, ...props}) => <ul className="my-2 pl-5 list-disc" {...props} />,
            ol: ({node, ...props}) => <ol className="my-2 pl-5 list-decimal" {...props} />,
            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
          }}
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
  cloudFunctionName,       // Name of the cloud function to call (also used as assessmentId)
  assessmentId,            // DEPRECATED: Use cloudFunctionName instead - kept for backward compatibility
  topic,                   // Topic for question context (optional)

  // Styling props only - all other configuration comes from the database
  theme = 'purple',        // Color theme: 'blue', 'green', 'purple', etc.
  title,                   // Custom title for the question (fallback if not in database)
  questionClassName = '',  // Additional class name for question container
  
  // Exam mode props
  examMode = false,        // Whether this question is part of an exam
  examSessionId = null,    // Exam session ID if in exam mode
  onExamAnswerSave = () => {}, // Callback when answer is saved in exam mode
  hasExistingAnswer = false, // Whether this question already has a saved answer
  currentSavedAnswer = null, // The currently saved answer for this question
  
  // Pre-loading optimization props
  skipInitialGeneration = false, // Skip initial cloud function call (when question is pre-loaded)
  isWaitingForQuestions = false, // Whether parent is still waiting for questions to be ready
  
  // Callback functions
  onSave = () => {},       // Callback when answer is saved
  onSubmit = () => {},     // Callback when answer is submitted
  onComplete = () => {},   // Callback when assessment is completed
  onCorrectAnswer = () => {}, // Callback when answer is correct (for consistency with multiple choice)
  onAttempt = () => {},    // Callback on each attempt
  
  // AI Assistant props (following AIAccordion pattern)
  onAIAccordionContent = null, // Callback to send extracted content to AI chat
  
  // Manual grading props
  manualGradeData = null, // Manual grade data from Grades.assessments
  manualGradeMetadata = null, // Manual grade metadata from Grades.metadata
}) => {
  // Use assessmentId if provided, otherwise fall back to cloudFunctionName for backward compatibility
  const finalAssessmentId = assessmentId || cloudFunctionName;
  
  if (!finalAssessmentId) {
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
  const [realTimeWordCount, setRealTimeWordCount] = useState(0);
  
  // Refs for the editor
  const editorRef = useRef(null);
  
  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Detect exam mode from course configuration or explicit prop
  const isExamMode = examMode || question?.activityType === 'exam';
  
  // Check if current answer differs from saved answer
  const hasUnsavedChanges = isExamMode && currentSavedAnswer && answer && answer !== currentSavedAnswer;
  
  // Check if answer is saved (for button styling)
  const isAnswerSaved = isExamMode && currentSavedAnswer && answer && answer === currentSavedAnswer;
  
  // Get theme colors - prioritize prop theme over question settings when passed from parent component
  const activeTheme = (isExamMode ? 'purple' : theme) || question?.settings?.theme || 'purple';
  
  // Get gradient theme configuration (matching StandardMultipleChoiceQuestion)
  const themeConfig = getThemeConfig(activeTheme);
  
  // Keep legacy theme colors for backwards compatibility
  const themeColors = getThemeColors(activeTheme);

  // Calculate word count (fallback for initial content)
  const getWordCount = (text) => {
    if (!text) return 0;
    // Strip HTML tags for accurate word count
    const strippedText = text.replace(/<[^>]*>/g, '');
    return strippedText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  // Use real-time word count when available, fallback to calculated count
  const wordCount = realTimeWordCount > 0 ? realTimeWordCount : getWordCount(answer);

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
            
            // In exam mode, use currentSavedAnswer if provided
            if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
              setAnswer(currentSavedAnswer);
              // Update real-time word count for the saved answer
              setRealTimeWordCount(getWordCount(currentSavedAnswer));
            }
            
            // If submitted, show appropriate message
            if (data.status === 'submitted') {
              console.log("Answer already submitted for this assessment");
            }
          } else {
            // No data exists yet
            // In exam mode, wait for exam session to create the question
            if (isExamMode || examMode) {
              console.log(`Waiting for exam session to create question ${finalAssessmentId}...`);
              // Don't generate - exam session manager will create it
              // Keep loading state until exam creates the question
              return;
            }
            
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

  // Effect to handle currentSavedAnswer prop changes in exam mode
  useEffect(() => {
    if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
      // Set the answer to the saved answer when component mounts or currentSavedAnswer changes
      setAnswer(currentSavedAnswer);
      // Update real-time word count for the saved answer
      setRealTimeWordCount(getWordCount(currentSavedAnswer));
    }
  }, [currentSavedAnswer, isExamMode]);

  // Generate a new question using master cloud function
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    setRegenerating(true);
    setAnswer('');
    setLastSavedAnswer('');

    try {
      // Use the master cloud function for Course 2
      const assessmentFunction = httpsCallable(functions, 'course2_assessments');

      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic || 'general',
        difficulty: 'intermediate'
      };

      console.log(`Calling master cloud function course2_assessments to generate standard long answer question`, functionParams);

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
      // Use the master cloud function for Course 2
      const assessmentFunction = httpsCallable(functions, 'course2_assessments');

      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'save',
        answer: answer,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      };

      console.log(`Calling master cloud function course2_assessments to save draft answer`);

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
      alert("Please write an answer before saving");
      return;
    }

    // Check word count requirements if they exist
    if (question?.wordLimit) {
      const currentWordCount = getWordCount(answer);
      
      if (currentWordCount < question.wordLimit.min) {
        alert(`Your answer is too short. Minimum ${question.wordLimit.min} words required, you have ${currentWordCount} words.`);
        return;
      }
      
      if (currentWordCount > question.wordLimit.max) {
        alert(`Your answer is too long. Maximum ${question.wordLimit.max} words allowed, you have ${currentWordCount} words.`);
        return;
      }
    }

    // In exam mode, just save without confirmation (can be done multiple times)
    if (isExamMode) {
      await handleExamAnswerSave();
      return;
    }

    // Non-exam mode: Show confirmation and use attempts
    const confirmSubmit = window.confirm(
      "Are you sure you want to submit your answer? This action cannot be undone and will use one of your attempts."
    );
    
    if (!confirmSubmit) {
      return;
    }

    setSubmitting(true);
    try {
      // Use the master cloud function for Course 2
      const assessmentFunction = httpsCallable(functions, 'course2_assessments');

      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'submit',
        answer: answer,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      };

      console.log(`Calling master cloud function course2_assessments to submit answer for grading`);

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

      // Update the saved answer state for UI feedback
      setLastSavedAnswer(answer);
      
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
    <div className={`rounded-lg overflow-hidden shadow-lg border ${questionClassName} bg-white/75 backdrop-blur-sm border-${themeConfig.border}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b bg-gradient-to-r ${themeConfig.gradient} bg-opacity-75 border-${themeConfig.border}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium text-white">
            {question?.title || title || 'Long Answer Question'}
          </h3>
          <div className="flex items-center gap-2">
            {isExamMode && (
              <Clipboard className="w-6 h-6 text-white" title="Assessment Session" />
            )}
          </div>
        </div>
        
        {/* Display attempts counter and word count */}
        {question && (
          <div className="flex items-center justify-between text-xs text-white/90 mt-1">
            {/* Attempts counter (hidden in exam mode) */}
            {!isExamMode && (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Attempts: <span className="font-medium ml-1">{question.attempts || 0}</span> 
                <span className="mx-1">/</span>
                {question.maxAttempts && question.maxAttempts > 500 ? (
                  <Infinity className="h-3.5 w-3.5 inline-block text-white/90" />
                ) : (
                  <span className="font-medium">{question.maxAttempts}</span>
                )}
              </span>
            )}
            
            {/* Word count (always shown when enabled) */}
            {question.settings?.showWordCount !== false && question.wordLimit && (
              <span className="flex items-center">
                <FileText className="h-3.5 w-3.5 mr-1" />
                Words: <span className={`font-medium ml-1 ${
                  wordCount < (question.wordLimit?.min || 100) ? 'text-red-200' :
                  wordCount > (question.wordLimit?.max || 500) ? 'text-red-200' :
                  'text-green-200'
                }`}>
                  {wordCount} / {question.wordLimit?.min || 100}-{question.wordLimit?.max || 500}
                </span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 bg-white/80">
        {error && !isExamMode && (
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
                  {/* Word Count Requirements (moved above editor) */}
                  {question.wordLimit && question.settings?.showWordCount !== false && (
                    <div className="mb-2 text-sm text-gray-600">
                      Word count: <span className={`font-medium ${
                        wordCount < question.wordLimit.min ? 'text-red-600' :
                        wordCount > question.wordLimit.max ? 'text-red-600' :
                        'text-green-600'
                      }`}>
                        {wordCount}
                      </span> / {question.wordLimit.min}-{question.wordLimit.max} words required
                    </div>
                  )}
                  <div className={`border rounded-lg overflow-hidden border-${themeConfig.border}`}>
                    <SimpleQuillEditor
                      ref={editorRef}
                      courseId={courseId}
                      unitId="assessment"
                      itemId={finalAssessmentId}
                      initialContent={answer}
                      onSave={(content) => setAnswer(content)}
                      onError={(error) => setError(error)}
                      onWordCountChange={setRealTimeWordCount}
                      onContentChange={setAnswer}
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
              {question.status !== 'submitted' && (isExamMode || !question.maxAttemptsReached) && (
                <div className="flex gap-3">
                  {!isExamMode && (
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
                    className={`mt-3 w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md ${
                      hasUnsavedChanges 
                        ? 'bg-amber-500 ring-2 ring-amber-300 ring-opacity-50' 
                        : isAnswerSaved
                        ? 'bg-green-500 hover:bg-green-600'
                        : `bg-gradient-to-r ${themeConfig.gradient}`
                    }`}
                  >
                    {submitting ? 
                      (isExamMode ? 'Saving...' : 'Submitting...') : 
                      isExamMode ? 
                        (hasUnsavedChanges ? 'Save Changes' : hasExistingAnswer ? 'Update Answer' : isAnswerSaved ? 'Answer Saved ✓' : 'Save Answer') : 
                        'Submit for Grading'
                    }
                  </Button>

                  {!isExamMode && question && question.attempts < question.maxAttempts - 1 && (
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
              {question.maxAttemptsReached && question.status !== 'submitted' && !isExamMode && (
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