import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Infinity, MessageCircle } from 'lucide-react';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkDeflist from 'remark-deflist';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../../../components/ui/sheet';
import GoogleAIChatApp from '../../../../edbotz/GoogleAIChat/GoogleAIChatApp';

/**
 * Helper function to detect if text contains markdown patterns
 * Based on GoogleAIChatApp's enhanced detection
 */
const containsMarkdown = (text) => {
  if (!text) return false;
  
  // Look for more precise patterns to reduce false positives
  const markdownPatterns = [
    /^#+\s+.+$/m,                  // Headers: # Header
    /\*\*.+\*\*/,                  // Bold: **bold**
    /\*.+\*/,                      // Italic: *italic*
    /```[\s\S]*```/,               // Code block: ```code```
    /`[^`]+`/,                     // Inline code: `code`
    /\[.+\]\(.+\)/,                // Links: [text](url)
    /\|[^|]+\|[^|]+\|/,            // Tables: |cell|cell|
    /^\s*>\s+.+$/m,                // Blockquotes: > quote
    /^\s*-\s+.+$/m,                // Unordered lists: - item
    /^\s*\d+\.\s+.+$/m,            // Ordered lists: 1. item
    /!\[.+\]\(.+\)/,               // Images: ![alt](url)
    /~~.+~~/,                      // Strikethrough: ~~text~~
    /\$\$.+\$\$/,                  // Math blocks: $$math$$
    /\$.+\$/,                      // Inline math: $math$
    /\\[a-zA-Z]+/,                 // LaTeX commands: \alpha, \beta, etc.
    /\\begin\{/,                   // LaTeX environments: \begin{...}
    /\\end\{/,                     // LaTeX environments: \end{...}
    /\\frac\{/,                    // LaTeX fractions: \frac{...}
    /\\sqrt/,                      // LaTeX square roots: \sqrt{...}
    /\\left/,                      // LaTeX brackets: \left(...
    /\\right/,                     // LaTeX brackets: \right)...
  ];
  
  // Check for simple text indicators first for better performance
  const quickCheck = (
    text.includes('#') || 
    text.includes('**') || 
    text.includes('*') ||
    text.includes('```') ||
    text.includes('`') ||
    text.includes('[') ||
    text.includes('|') ||
    text.includes('> ') ||
    text.includes('- ') ||
    text.includes('1. ') ||
    text.includes('$') ||  // Math delimiters
    text.includes('\\')    // LaTeX commands
  );
  
  // If quick check passes, do more precise checking
  if (quickCheck) {
    // Check for common markdown patterns
    for (const pattern of markdownPatterns) {
      if (pattern.test(text)) {
        return true;
      }
    }
    
    // Special case for tables which can be tricky to detect
    if (text.includes('|')) {
      // Count pipe characters in the text
      const pipeCount = (text.match(/\|/g) || []).length;
      // If there are multiple pipe characters, it's likely a table
      if (pipeCount >= 4) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Enhanced text rendering that handles both markdown and LaTeX math
 * Based on GoogleAIChatApp's comprehensive rendering approach
 */
const renderEnhancedText = (text) => {
  if (!text) return text;
  
  // If text contains markdown patterns, use ReactMarkdown with enhanced configuration
  if (containsMarkdown(text)) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkDeflist]}
          rehypePlugins={[
            [rehypeSanitize, {
              // Standard HTML elements plus additional elements for enhanced content
              allowedElements: [
                // Standard markdown elements
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 
                'pre', 'code', 'em', 'strong', 'del', 'table', 'thead', 'tbody', 'tr', 
                'th', 'td', 'a', 'img', 'hr', 'br', 'div', 'span',
                // Additional elements we want to allow
                'details', 'summary', 'dl', 'dt', 'dd'
              ],
              // Allow certain attributes
              allowedAttributes: {
                // Allow href and target for links
                a: ['href', 'target', 'rel'],
                // Allow src and alt for images
                img: ['src', 'alt', 'title'],
                // Allow class and style for common elements
                div: ['className', 'class', 'style'],
                span: ['className', 'class', 'style'],
                code: ['className', 'class', 'language'],
                pre: ['className', 'class'],
                // Allow open attribute for details
                details: ['open']
              }
            }],
            rehypeKatex,
            rehypeRaw
          ]}
          components={{
            // Make headings slightly smaller in question contexts
            h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-1 mb-2" {...props} />,
            h2: ({node, ...props}) => <h3 className="text-lg font-bold mt-1 mb-2" {...props} />,
            h3: ({node, ...props}) => <h4 className="text-base font-bold mt-1 mb-1" {...props} />,
            
            // Enhanced code handling
            code: ({node, inline, className, children, ...props}) => {
              if (inline) {
                return <code className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-800" {...props}>{children}</code>
              }
              return <code {...props}>{children}</code>
            },
            
            // Make lists more compact
            ul: ({node, ...props}) => <ul className="my-1 pl-5" {...props} />,
            ol: ({node, ...props}) => <ol className="my-1 pl-5" {...props} />,
            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
            
            // Make sure paragraphs preserve spacing
            p: ({node, ...props}) => <p className="mb-2" {...props} />,
            
            // Make links open in new tab and have proper styling
            a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="font-medium underline" {...props} />,
            
            // Style tables to fit in content areas
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-2">
                <table className="border-collapse border border-gray-300 text-sm" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
            
            // Handle details/summary elements
            details: ({node, ...props}) => <details className="border rounded-md p-2 my-2" {...props} />,
            summary: ({node, ...props}) => <summary className="font-medium cursor-pointer" {...props} />,
            
            // Definition lists
            dl: ({node, ...props}) => <dl className="my-2" {...props} />,
            dt: ({node, ...props}) => <dt className="font-bold mt-2" {...props} />,
            dd: ({node, ...props}) => <dd className="ml-4 mt-1" {...props} />,
          }}
        >
          {text}
        </ReactMarkdown>
      </div>
    );
  }
  
  // For simple text without markdown, just preserve line breaks
  return (
    <div style={{ whiteSpace: 'pre-wrap' }}>
      {text}
    </div>
  );
};

/**
 * A Standard Multiple Choice Question component that selects questions from a predefined pool.
 * The questions are configured server-side and randomly selected to provide variety.
 * 
 * This component handles:
 * - Random question selection from configured pool
 * - Submission of answers and feedback (immediate mode)
 * - Exam mode: Save answers without immediate feedback
 * - Tracking of attempts
 * - Displaying explanation of correct answers
 * - Real-time updates via Firebase database listener
 */
const StandardMultipleChoiceQuestion = ({
  // Required props
  courseId,                // Course identifier
  cloudFunctionName,       // Name of the cloud function to call (also used as assessmentId)
  assessmentId,            // DEPRECATED: Use cloudFunctionName instead - kept for backward compatibility
  course,                  // Course object (optional - not used for database access anymore)
  topic,                   // Topic for question context (optional)

  // Styling props only - all other configuration comes from the database
  theme = 'purple',        // Color theme: 'blue', 'green', 'purple', etc.
  title,                   // Custom title for the question (fallback if not in database)
  questionClassName = '',  // Additional class name for question container
  optionsClassName = '',   // Additional class name for options container
  
  // Exam mode props
  examMode = false,        // Whether this question is part of an exam
  examSessionId = null,    // Exam session ID if in exam mode
  onExamAnswerSave = () => {}, // Callback when answer is saved in exam mode
  hasExistingAnswer = false, // Whether this question already has a saved answer
  currentSavedAnswer = null, // The currently saved answer for this question
  
  // Callback functions
  onCorrectAnswer = () => {}, // Callback when answer is correct
  onAttempt = () => {},    // Callback on each attempt
  onComplete = () => {},   // Callback when all attempts are used
}) => {
  // Use cloudFunctionName as assessmentId, with fallback for backward compatibility
  const finalAssessmentId = cloudFunctionName || assessmentId;
  
  if (!finalAssessmentId) {
    console.error('StandardMultipleChoiceQuestion: cloudFunctionName is required');
    return <div className="p-4 bg-red-50 text-red-600 rounded">Error: cloudFunctionName is required</div>;
  }
  
  // Generate a unique instance ID for this question component
  const instanceId = useRef(`mc_${finalAssessmentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Authentication and state
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  console.log("Component render - loading state:", loading);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [showExamFeedback, setShowExamFeedback] = useState(false);
  
  // Refs for debouncing and preventing multiple calls
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);
  const regenerationTimeoutRef = useRef(null);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Detect exam mode from course configuration or explicit prop
  const isExamMode = examMode || question?.activityType === 'exam' || 
    (course?.Gradebook?.courseConfig?.activityTypes?.exam && 
     question?.type === 'exam');
  
  // Check if current selection differs from saved answer
  const hasUnsavedChanges = isExamMode && currentSavedAnswer && selectedAnswer && selectedAnswer !== currentSavedAnswer;
  
  // Get theme colors - use theme from question settings if available, otherwise use prop
  const activeTheme = question?.settings?.theme || (isExamMode ? 'red' : theme);
  const themeColors = getThemeColors(activeTheme);

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
  }, [regenerating, expectingNewQuestion, course, finalAssessmentId]);
  
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      setError("User authentication required");
      setLoading(false);
      return;
    }

    // Get sanitized email for database path
    const studentEmail = currentUser.email;
    const studentKey = sanitizeEmail(studentEmail);
    
    // TEMPORARY FIX: Always use 'students' path to avoid permission issues
    // TODO: Restore staff detection once Firebase permissions are fixed
    // const isStaff = studentEmail && studentEmail.toLowerCase().endsWith('@rtdacademy.com');

    // Listen for assessment data in the database
    let unsubscribeRef = null;
    
    const loadAssessment = () => {
      setLoading(true);
      try {
        // TEMPORARY: Always use students path
        const basePath = 'students';
        const dbPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${finalAssessmentId}`;
        console.log(`Creating database ref for question: ${dbPath}`);

        // Setup firebase database listener
        const assessmentRef = ref(db, dbPath);

        unsubscribeRef = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            console.log("Standard question data received from database:", data);
            
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
                
                // Update selectedDifficulty to match the new question's difficulty
                // This ensures the UI shows the actual difficulty that was generated
                if (enhancedData.difficulty) {
                  setSelectedDifficulty(enhancedData.difficulty);
                }
                
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
              console.log("Setting question data (not expecting new question)");
              setQuestion(enhancedData);
              setLastQuestionTimestamp(data.timestamp || 0);
              
              // Set selectedDifficulty to match the question's difficulty
              // This ensures consistency when the component first loads
              if (enhancedData.difficulty && !selectedDifficulty) {
                setSelectedDifficulty(enhancedData.difficulty);
              }
              
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
              console.log("Question set successfully, expectingNewQuestion:", expectingNewQuestion);
            }
          } else {
            console.log("No standard question data found in database, generating new question");
            generateQuestion();
          }
          console.log("Setting loading to false after processing question data");
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
      // For assignments with difficulty selection, use selectedDifficulty, otherwise use question data
      const topicFromData = topic || question?.topic || 'general';
      const difficultyFromData = selectedDifficulty || question?.difficulty || question?.settings?.defaultDifficulty || 'intermediate';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };

      console.log(`Calling cloud function ${cloudFunctionName} to generate standard question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Standard question generation successful:", result);

      // The cloud function will update the assessment in the database
      // Our database listener will pick up the changes automatically
      // We should NOT reset regenerating flag here - wait for the listener to update
      
      // If we're not in regeneration mode, we can clear the regenerating flag
      if (!expectingNewQuestion) {
        setRegenerating(false);
      }
    } catch (err) {
      console.error("Error generating standard question:", err);
      
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

    // Check if this is exam mode
    if (isExamMode) {
      await handleExamAnswerSave();
      return;
    }

    setSubmitting(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      // Extract topic and difficulty from question data if available
      // Use current difficulty from question data for evaluation
      const topicFromData = topic || question?.topic || 'general';
      const difficultyFromData = question?.difficulty || 'intermediate';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'evaluate',
        answer: selectedAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };

      console.log(`Calling cloud function ${cloudFunctionName} to evaluate standard question answer`, functionParams);

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

  // Handle saving answer in exam mode (NO EVALUATION - just save the choice)
  const handleExamAnswerSave = async () => {
    if (!selectedAnswer) {
      alert("Please select an answer");
      return;
    }

    setSubmitting(true);
    try {
      // In exam mode, just save the answer choice without evaluation
      const saveExamAnswerFunction = httpsCallable(functions, 'saveExamAnswer');
      
      const saveParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        answer: selectedAnswer,
        examSessionId: examSessionId,
        studentEmail: currentUser.email
        // NO evaluation data - answers will be evaluated when exam is submitted
      };

      console.log(`Saving exam answer (no evaluation): ${finalAssessmentId} = ${selectedAnswer}`);
      await saveExamAnswerFunction(saveParams);

      onExamAnswerSave(selectedAnswer, finalAssessmentId);
      
    } catch (err) {
      console.error("Error saving exam answer:", err);
      setError("Failed to save your answer. Please try again: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  };

  // Handle regeneration of the question with debounce protection
  const handleRegenerate = (customDifficulty = null) => {
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

    // If a custom difficulty was provided, set it persistently
    if (customDifficulty) {
      setSelectedDifficulty(customDifficulty);
    }

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

  // Generate initial AI chat message based on status
  const getAIChatFirstMessage = () => {
    if (!question) return "Hello! I'm here to help you with this question.";
    
    if (question.status === 'active') {
      return "Hello! I see you're working on a multiple choice question. I'm here to help guide your thinking. What part of the problem would you like to explore first?";
    } else if (question.lastSubmission) {
      const isCorrect = question.lastSubmission.isCorrect;
      if (isCorrect) {
        return `Great job! You correctly answered that ${question.lastSubmission.answer?.toUpperCase()} was the right choice. Would you like me to explain why this answer is correct, or explore any related concepts?`;
      } else {
        return `I see you selected option ${question.lastSubmission.answer?.toUpperCase()}, but that wasn't quite right. The correct answer was option ${question.lastSubmission.correctOptionId?.toUpperCase()}. Would you like me to explain why, or help you understand where your thinking might have gone off track?`;
      }
    }
    
    return "Hello! I'm here to help you understand this question better. What would you like to know?";
  };

  // Generate context object for AI chat (following Genkit best practices)
  const getAIChatContext = () => {
    if (!question) return null;
    
    // Determine if the student has attempted this question
    const hasAttempted = !!question.lastSubmission || question.status === 'attempted' || question.status === 'completed';
    
    // Create proper Genkit context structure
    const context = {
      // Auth context (recommended Genkit pattern)
      auth: {
        uid: currentUser?.uid,
        email: currentUser?.email
      },
      // Session info
      sessionInfo: {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        topic: topic || question.topic
      },
      // Question state for agent selection (not question content)
      questionState: {
        status: question.status,
        hasAttempted: hasAttempted,
        attempts: question.attempts,
        maxAttempts: question.maxAttempts,
        difficulty: question.difficulty
      }
    };
    
    // If the student has submitted an answer, include submission state
    if (question.lastSubmission) {
      context.questionState.lastSubmission = {
        selectedAnswer: question.lastSubmission.answer,
        isCorrect: question.lastSubmission.isCorrect,
        feedback: question.lastSubmission.feedback,
        correctOptionId: question.lastSubmission.correctOptionId,
        timestamp: question.lastSubmission.timestamp
      };
      
      // Add human-readable information for the agents
      const studentAnswer = question.options.find(opt => opt.id === question.lastSubmission.answer);
      const correctAnswer = question.options.find(opt => opt.id === question.lastSubmission.correctOptionId);
      
      context.questionState.answerDetails = {
        studentAnswerText: studentAnswer?.text,
        correctAnswerText: correctAnswer?.text,
        studentSelectedOption: question.lastSubmission.answer?.toUpperCase(),
        correctOption: question.lastSubmission.correctOptionId?.toUpperCase()
      };
    }
    
    return context;
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
    <>
    <div className={`rounded-lg overflow-hidden shadow-lg border ${questionClassName}`} style={{
      backgroundColor: themeColors.bgLight,
      borderColor: themeColors.border
    }}>
      {/* Header */}
      <div className="px-4 py-3 border-b"
           style={{ backgroundColor: themeColors.bgDark, borderColor: themeColors.border }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium" style={{ color: themeColors.textDark }}>
            {question?.title || title || 'Multiple Choice Question'}
          </h3>
          <div className="flex items-center gap-2">
            {isExamMode && (
              <span className="text-xs py-1 px-2 rounded bg-red-100 text-red-800 font-medium">
                EXAM MODE
              </span>
            )}
            {question?.generatedBy === 'standard' && (
              <span className="text-xs py-1 px-2 rounded bg-blue-100 text-blue-800 font-medium">
                Standard
              </span>
            )}
            {question && question.enableAIChat !== false && !isExamMode && (
              <Button
                onClick={() => setChatSheetOpen(true)}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                title="Chat with AI about this question"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Chat with AI</span>
              </Button>
            )}
          </div>
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
              {question.maxAttempts && question.maxAttempts > 500 ? (
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
              <div className="text-gray-800 mb-5 text-lg font-medium">
                {renderEnhancedText(question.questionText)}
              </div>

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
                      // Only allow selection if there's no result yet
                      if (!result) {
                        setSelectedAnswer(option.id);
                      }
                    }}
                  >
                    <input
                      type="radio"
                      id={`${instanceId}_${option.id}`}
                      name={instanceId}
                      value={option.id}
                      checked={selectedAnswer === option.id}
                      onChange={() => !result && setSelectedAnswer(option.id)}
                      disabled={result !== null} // Disable after submission
                      className={`mr-3 h-4 w-4 cursor-pointer text-${themeColors.name}-600 focus:ring-${themeColors.name}-500`}
                    />
                    <label 
                      htmlFor={`${instanceId}_${option.id}`} 
                      className="flex-grow text-gray-700 cursor-pointer"
                    >
                      {renderEnhancedText(option.text)}
                    </label>

                    {/* Show the correct/incorrect icon if there's a result (but NOT in exam mode) */}
                    {!isExamMode && result?.isCorrect && selectedAnswer === option.id && (
                      <span className="text-green-600 ml-2">✓</span>
                    )}
                    {!isExamMode && result?.correctOptionId === option.id && !result.isCorrect && (
                      <span className="text-green-600 ml-2">✓</span>
                    )}
                    {!isExamMode && !result?.isCorrect && result?.answer === option.id && result?.answer !== result?.correctOptionId && (
                      <span className="text-red-600 ml-2">✗</span>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Submit/Save button - behavior depends on exam mode */}
              {!result && !showExamFeedback && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedAnswer}
                  style={{
                    backgroundColor: hasUnsavedChanges ? '#f59e0b' : themeColors.accent,
                    color: 'white',
                  }}
                  className={`mt-3 w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md ${
                    hasUnsavedChanges ? 'ring-2 ring-amber-300 ring-opacity-50' : ''
                  }`}
                >
                  {submitting ? 
                    (isExamMode ? 'Saving...' : 'Submitting...') : 
                    isExamMode ? 
                      (hasUnsavedChanges ? 'Save Changes' : hasExistingAnswer ? 'Update Answer' : 'Save Answer') : 
                      'Submit Answer'
                  }
                </Button>
              )}

              {/* Result feedback - hidden in exam mode unless exam is completed */}
              {(result && (!isExamMode || showExamFeedback)) && (
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
                  <div className="mb-3 text-sm">
                    {renderEnhancedText(result.feedback)}
                  </div>

                  {/* Additional guidance based on result */}
                  {!result.isCorrect && question.attempts < question.maxAttempts && (
                    <div className="text-sm mb-2 border-t border-b py-2 mt-2">
                      <p className="font-medium flex items-center">
                        {question.maxAttempts > 500 ? 
                          <>Attempt {question.attempts}</> : 
                          <>Attempt {question.attempts} of {question.maxAttempts}</>
                        }
                        {(question.maxAttempts - question.attempts) > 0 && question.maxAttempts <= 500 && 
                          <> ({question.maxAttempts - question.attempts} remaining)</>
                        }
                        {question.maxAttempts > 500 && 
                          <> (unlimited <Infinity className="h-3.5 w-3.5 inline-block ml-0.5" />)</>
                        }
                      </p>
                      <p>Review your answer and try again.</p>
                    </div>
                  )}

                  {/* For generating a new question - hidden in exam mode */}
                  <div className="mt-4">
                    {result && !isExamMode && !question.maxAttemptsReached && !question.attemptsExhausted && 
                     question.attempts < question.maxAttempts && (
                      <>
                        {/* Regular regenerate button */}
                        <Button
                          onClick={() => handleRegenerate()}
                          style={{
                            backgroundColor: themeColors.accent,
                            color: 'white',
                          }}
                          className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          Try Another Question
                        </Button>
                      </>
                    )}                    
                    {/* Exam mode specific messaging */}
                    {isExamMode && result && (
                      <div className="text-sm text-gray-600 mt-2">
                        <p className="font-medium">Exam Mode</p>
                        <p>Results will be available when you complete the entire exam.</p>
                      </div>
                    )}
                    
                    {/* Display message when max attempts reached - only show for multi-attempt questions */}
                    {(question.maxAttemptsReached || question.attemptsExhausted || 
                      question.attempts >= question.maxAttempts) && question.maxAttempts > 1 && (
                      <div className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Maximum attempts reached</p>
                        <p className="flex items-center">
                          {question.maxAttempts > 500 ?
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

    {/* AI Chat Sheet */}
    <Sheet open={chatSheetOpen} onOpenChange={setChatSheetOpen}>
      <SheetContent className="w-[90vw] max-w-[90vw] sm:w-[90vw] p-0" side="right">
        {/* Desktop: Side by side, Mobile: Chat only */}
        <div className="flex h-screen">
          {/* Left side - Question (hidden on mobile) */}
          <div className="hidden md:block md:w-1/2 border-r overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4">Current Question</h3>
              <div className="space-y-4">
                {/* Question Text */}
                <div className="space-y-3">
                  <div className="text-base font-medium text-gray-900">
                    {renderEnhancedText(question?.questionText)}
                  </div>
                </div>

                {/* Options */}
                <div className="space-y-2.5">
                  {question?.options?.map((option, index) => (
                    <div
                      key={option.id}
                      className={`flex items-center p-3.5 border rounded-md ${
                        selectedAnswer === option.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        checked={selectedAnswer === option.id}
                        disabled
                        className="mr-3 h-4 w-4"
                      />
                      <label className="text-gray-700 flex-grow">
                        {renderEnhancedText(option.text)}
                      </label>

                      {/* Show the correct/incorrect icon if there's a result (but NOT in exam mode) */}
                      {!isExamMode && result?.isCorrect && selectedAnswer === option.id && (
                        <span className="text-green-600 ml-2">✓</span>
                      )}
                      {!isExamMode && result?.correctOptionId === option.id && !result.isCorrect && (
                        <span className="text-green-600 ml-2">✓</span>
                      )}
                      {!isExamMode && !result?.isCorrect && result?.answer === option.id && result?.answer !== result?.correctOptionId && (
                        <span className="text-red-600 ml-2">✗</span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Show result if available */}
                {result && (
                  <div className={`p-4 rounded-md shadow-sm ${
                    result.isCorrect
                      ? 'bg-green-50 border border-green-100 text-green-800'
                      : 'bg-red-50 border border-red-100 text-red-800'
                  }`}>
                    <p className="font-medium text-base mb-1">
                      {result.isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                    </p>
                    <div className="mb-3 text-sm">
                      {renderEnhancedText(result.feedback)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Right side - Chat (full width on mobile, half width on desktop) */}
          <div className="w-full md:w-1/2 h-full">
            {question && (
              <GoogleAIChatApp
                sessionIdentifier={`standard-multiple-choice-${courseId}-${finalAssessmentId}-${question.timestamp || Date.now()}`}
                instructions={null} // Let server-side agent system handle instructions
                firstMessage={getAIChatFirstMessage()}
                showYouTube={false}
                showUpload={false}
                allowContentRemoval={false}
                showResourcesAtTop={false}
                context={getAIChatContext()}
                aiChatContext={question.aiChatContext}
              />
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
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
    },
    gray: {
      name: 'gray',
      accent: '#6b7280',
      bgLight: '#f9fafb',
      bgDark: '#f3f4f6',
      border: '#e5e7eb',
      textDark: '#374151'
    },
    slate: {
      name: 'slate',
      accent: '#64748b',
      bgLight: '#f8fafc',
      bgDark: '#f1f5f9',
      border: '#e2e8f0',
      textDark: '#334155'
    }
  };

  return themes[theme] || themes.purple;
}

export default StandardMultipleChoiceQuestion;