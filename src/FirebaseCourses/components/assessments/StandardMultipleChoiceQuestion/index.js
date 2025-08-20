import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Infinity, Bot, Clipboard } from 'lucide-react';
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

// Theme configuration with gradient colors (matching SlideshowKnowledgeCheck)
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
 * Helper function to format scientific notation for display
 */
const formatScientificNotation = (text) => {
  if (!text) return text;
  
  // Pattern to match scientific notation (e.g., 3.4e+8, 1.2e-5, 6.02e23)
  const scientificPattern = /(\d+\.?\d*)[eE]([+-]?\d+)/g;
  
  return text.replace(scientificPattern, (match, coefficient, exponent) => {
    // Remove leading + from exponent if present
    const cleanExponent = exponent.replace(/^\+/, '');
    // Format as proper scientific notation with × and superscript using HTML
    return `${coefficient} × 10<sup>${cleanExponent}</sup>`;
  });
};

/**
 * Enhanced text rendering that handles both markdown and LaTeX math
 * Based on GoogleAIChatApp's comprehensive rendering approach
 */
const renderEnhancedText = (text) => {
  if (!text) return text;
  
  // First, format any scientific notation
  text = formatScientificNotation(text);
  
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
                'details', 'summary', 'dl', 'dt', 'dd',
                // Scientific notation formatting
                'sup', 'sub'
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
  
  // For simple text without markdown, preserve line breaks and handle any HTML we added (like sup tags)
  return (
    <div 
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
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
  
  // Pre-loading optimization props
  skipInitialGeneration = false, // Skip initial cloud function call (when question is pre-loaded)
  isWaitingForQuestions = false, // Whether parent is still waiting for questions to be ready
  
  // Callback functions
  onCorrectAnswer = () => {}, // Callback when answer is correct
  onAttempt = () => {},    // Callback on each attempt
  onComplete = () => {},   // Callback when all attempts are used
  
  // AI Assistant props (following AIAccordion pattern)
  onAIAccordionContent = null, // Callback to send extracted content to AI chat
  
  // Manual grading props
  manualGradeData = null, // Manual grade data from Grades.assessments
  manualGradeMetadata = null, // Manual grade metadata from Grades.metadata
}) => {
  // Use assessmentId if provided, otherwise fall back to cloudFunctionName for backward compatibility
  const finalAssessmentId = assessmentId || cloudFunctionName;
  
  if (!finalAssessmentId) {
    console.error('StandardMultipleChoiceQuestion: cloudFunctionName is required');
    return <div className="p-4 bg-red-50 text-red-600 rounded">Error: cloudFunctionName is required</div>;
  }
  
  // Generate a unique instance ID for this question component
  const instanceId = useRef(`mc_${finalAssessmentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Authentication and state
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [showExamFeedback, setShowExamFeedback] = useState(false);
  
  // Refs for debouncing and preventing multiple calls
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);
  const regenerationTimeoutRef = useRef(null);
  
  // Ref for content extraction (following AIAccordion pattern)
  const contentRef = useRef(null);
  
  // Ref for the main component container (for scrolling)
  const componentRef = useRef(null);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Detect exam mode from course configuration or explicit prop
  const isExamMode = examMode || question?.activityType === 'exam' || 
    (course?.Gradebook?.courseConfig?.activityTypes?.exam && 
     question?.type === 'exam');
  
  // Check if current selection differs from saved answer
  const hasUnsavedChanges = isExamMode && currentSavedAnswer && selectedAnswer && selectedAnswer !== currentSavedAnswer;
  
  // Check if answer is saved (for button styling)
  const isAnswerSaved = isExamMode && currentSavedAnswer && selectedAnswer && selectedAnswer === currentSavedAnswer;
  
  // Get theme colors - prioritize prop theme over question settings when passed from parent component
  const activeTheme = (isExamMode ? 'purple' : theme) || question?.settings?.theme || 'purple';
  
  
  // Get gradient theme configuration (matching SlideshowKnowledgeCheck)
  const themeConfig = getThemeConfig(activeTheme);
  
  // Keep legacy theme colors for border compatibility
  const themeColors = getThemeColors(activeTheme);

  // Track the last question timestamp for comparison
  const [lastQuestionTimestamp, setLastQuestionTimestamp] = useState(null);
  // Add a safety timeout ref to exit loading state if stuck (kept for backward compatibility)
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

  // Add fallback mechanism for pre-loaded questions that don't load
  useEffect(() => {
    if (skipInitialGeneration && loading) {
      // If we're expecting a pre-loaded question but still loading after 5 seconds,
      // fall back to generating the question normally
      const fallbackTimeout = setTimeout(() => {
        if (loading && !question) {
          generateQuestion();
        }
      }, 5000);

      return () => clearTimeout(fallbackTimeout);
    }
  }, [skipInitialGeneration, loading, question, finalAssessmentId]);
  
  // Effect to handle safety timeouts for loading state (simplified)
  useEffect(() => {
    // If we're regenerating, set a safety timeout as a fallback
    if (regenerating) {
      // Clear any existing safety timeout
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
      
      // Set a new safety timeout (10 seconds - should never be needed with direct response)
      safetyTimeoutRef.current = setTimeout(() => {
        console.warn("Safety timeout triggered - regeneration took too long");
        setRegenerating(false);
        setLoading(false);
      }, 10000);
    } else {
      // Clear the safety timeout if we're no longer regenerating
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
  }, [regenerating]);
  
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

        // Setup firebase database listener
        const assessmentRef = ref(db, dbPath);

        unsubscribeRef = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          const validStatuses = ['active', 'exam_in_progress', 'completed', 'attempted', 'failed', 'manually_graded'];
          
          if (data) {
            // Check if the assessment has a valid status for display
            const hasValidStatus = validStatuses.includes(data.status);
            
            // If status is not valid, don't load the question (prevents loading stale data)
            if (!hasValidStatus) {
              console.log(`Assessment ${finalAssessmentId} has invalid status: ${data.status}. Waiting for valid status...`);
              // Don't set loading to false yet - wait for valid status
              return;
            }
            
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
            
            // Simplified: Just update the question data from the database
            // The direct response from cloud function handles regeneration now
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
              // In exam mode, use currentSavedAnswer prop if provided, otherwise use lastSubmission
              if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
                setSelectedAnswer(currentSavedAnswer);
              } else {
                // Preselect the last submitted answer for non-exam mode
                setSelectedAnswer(data.lastSubmission.answer || '');
              }
            } else if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
              // In exam mode, even without lastSubmission, use currentSavedAnswer if provided
              setSelectedAnswer(currentSavedAnswer);
            }
            
            // If max attempts reached, show appropriate message (but not in exam mode)
            if (maxAttemptsReached && !isExamMode) {
              // Only set the error if there's not already a result showing (to avoid confusion)
              if (!data.lastSubmission) {
                setError("You've reached the maximum number of attempts for this question.");
              }
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
            
            // Only generate question if skipInitialGeneration is false and we haven't already tried
            if (!skipInitialGeneration && !isGeneratingRef.current) {
              // Add a small delay to prevent rapid-fire generation attempts
              setTimeout(() => {
                if (!question && !isGeneratingRef.current) {
                  generateQuestion();
                }
              }, 500);
            } else {
              // If we're skipping initial generation, just stop loading
              // The question should already be pre-loaded by the parent component
              setLoading(false);
            }
          }
          // Update loading state based on what happened
          if (data && validStatuses.includes(data.status)) {
            // We have valid data, stop loading
            setLoading(false);
          } else if (!data && !isExamMode && !examMode && skipInitialGeneration) {
            // No data, not exam mode, and skipping generation - stop loading
            setLoading(false);
          }
          // Otherwise keep loading (waiting for valid status or exam to create question)
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
  }, [currentUser, courseId, finalAssessmentId, db, skipInitialGeneration]);

  // Effect to scroll to top when question changes after regeneration
  useEffect(() => {
    if (question && !regenerating && !loading && componentRef.current) {
      // Only scroll if we just finished regenerating (timestamp changed)
      if (lastQuestionTimestamp && question.timestamp && question.timestamp > lastQuestionTimestamp) {
        // Small delay to ensure DOM is fully updated
        setTimeout(() => {
          if (componentRef.current) {
            // Get the position of the component
            const elementPosition = componentRef.current.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 100; // Offset by 100px to scroll higher
            
            // Custom smooth scroll for slower animation
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    }
  }, [question?.timestamp, regenerating, loading, lastQuestionTimestamp]);

  // Effect to handle currentSavedAnswer prop changes in exam mode
  useEffect(() => {
    if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
      // Only update if the current selection is different from the saved answer
      if (selectedAnswer !== currentSavedAnswer) {
        console.log(`🔄 Updating selected answer from prop: ${currentSavedAnswer} (was: ${selectedAnswer})`);
        setSelectedAnswer(currentSavedAnswer);
      }
    }
  }, [currentSavedAnswer, isExamMode, selectedAnswer]);

  // Generate a new question using cloud function with debouncing
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    // Prevent multiple calls if we're already generating
    if (isGeneratingRef.current) {
      return;
    }
    
    // Set generating flag
    isGeneratingRef.current = true;
    
    // Debounce: prevent too frequent generation (minimum 2 seconds between generations)
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGeneratedTimeRef.current;
    if (timeSinceLastGeneration < 2000) {
      
      // Clear any existing timeout
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
      
      // Set a timeout to generate after the debounce period
      const timeToWait = 2000 - timeSinceLastGeneration;
      regenerationTimeoutRef.current = setTimeout(() => {
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
      // Determine which cloud function to use based on courseId
      // Course 2 (Physics 30) uses its own master function for backward compatibility
      // All other courses use the universal assessment function
      const cloudFunctionToUse = (String(courseId) === '2' && cloudFunctionName.startsWith('course2_')) 
        ? 'course2_assessments' 
        : 'universal_assessments';
      
      const assessmentFunction = httpsCallable(functions, cloudFunctionToUse);

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



      const result = await assessmentFunction(functionParams);

      // The cloud function now returns the question data directly
      // Use it immediately instead of waiting for database listener
      if (result.data?.questionData) {
        const questionData = result.data.questionData;
        
        // Update question state immediately with the returned data
        setQuestion({
          ...questionData,
          maxAttemptsReached: false,
          attemptsExhausted: false
        });
        
        // Update other state
        setLastQuestionTimestamp(questionData.timestamp || Date.now());
        setRegenerating(false);
        setResult(null);
        setSelectedAnswer('');
        
        // Update selectedDifficulty to match the new question's difficulty
        if (questionData.difficulty) {
          setSelectedDifficulty(questionData.difficulty);
        }
        
        // Clear any safety timeouts
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
      } else {
        // Fallback: if backend doesn't return questionData, 
        // wait for database listener (backward compatibility)
        console.warn("Backend didn't return questionData - falling back to database listener");
        // Don't clear regenerating flag - let the database listener handle it
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
        // Only show error in non-exam mode
        if (!isExamMode) {
          setError("You've reached the maximum number of attempts for this question.");
        }
      } else {
        // Generic error
        setError("Failed to generate question: " + (err.message || err));
      }
      
      setLoading(false);
      
      // Reset all state flags on error
      setRegenerating(false);
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
      // Determine which cloud function to use based on courseId
      // Course 2 (Physics 30) uses its own master function for backward compatibility
      // All other courses use the universal assessment function
      const cloudFunctionToUse = (String(courseId) === '2' && cloudFunctionName.startsWith('course2_')) 
        ? 'course2_assessments' 
        : 'universal_assessments';
      
      const assessmentFunction = httpsCallable(functions, cloudFunctionToUse);

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



      const response = await assessmentFunction(functionParams);

      // Immediately update UI with the cloud function response
      if (response.data?.result) {
        // Update result state immediately for instant feedback
        setResult(response.data.result);
        
        // Also update the question state with attempts info
        if (question && response.data?.attemptsMade) {
          setQuestion(prev => ({
            ...prev,
            attempts: response.data.attemptsMade,
            lastSubmission: {
              ...response.data.result,
              answer: selectedAnswer,
              timestamp: Date.now()
            }
          }));
        }
      }

      // Trigger callbacks
      onAttempt(response.data?.result?.isCorrect || false);

      if (response.data?.result?.isCorrect) {
        onCorrectAnswer();
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
        // Only show error in non-exam mode
        if (!isExamMode) {
          setError("You've reached the maximum number of attempts for this question.");
        }
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
    // Scroll to top of component when regenerating
    if (componentRef.current) {
      // Get the position of the component
      const elementPosition = componentRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100; // Offset by 100px to scroll higher
      
      // Custom smooth scroll for slower animation
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    
    // If we're already generating, don't trigger again
    if (isGeneratingRef.current || regenerating) {
      return;
    }
    
    // Check if we've exceeded or reached max attempts allowed (not in exam mode)
    // Note: This only applies to the regenerate button; the server will enforce this too
    if (question && question.attempts >= question.maxAttempts && !isExamMode) {
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
    
    // No longer need to set expectingNewQuestion since we'll handle the response directly
    // setExpectingNewQuestion(true);

    // If a custom difficulty was provided, set it persistently
    if (customDifficulty) {
      setSelectedDifficulty(customDifficulty);
    }

    // Call the cloud function directly
    try {
      console.log("Requesting question regeneration while preserving attempt count");
      generateQuestion().catch(error => {
        // Handle async errors
        console.error("Error during question regeneration:", error);
        setRegenerating(false);
        isGeneratingRef.current = false;
        setError("Failed to regenerate question: " + (error.message || error));
      });
    } catch (error) {
      // Handle immediate errors
      console.error("Error during regeneration:", error);
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

  // Extract question content for AI chat (following AIAccordion pattern)
  const handleAskAI = () => {
    if (!onAIAccordionContent) {
      console.warn('onAIAccordionContent callback not provided to StandardMultipleChoiceQuestion. AI assistance not available for this question.');
      return;
    }

    try {
      // Extract content from the question container
      const contentElement = contentRef.current;
      if (!contentElement) {
        console.warn('Content element not found');
        return;
      }

      // Get the raw HTML content
      let htmlContent = contentElement.innerHTML || '';
      
      // Clean up zero-width spaces and other problematic Unicode characters
      htmlContent = htmlContent
        .replace(/\u200B/g, '')  // Remove zero-width space
        .replace(/\u00A0/g, ' ') // Replace non-breaking space with regular space
        .replace(/\u2060/g, '')  // Remove word joiner
        .replace(/\uFEFF/g, ''); // Remove byte order mark

      // Create a temporary div to extract clean text
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      let textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      // Clean up the text content
      textContent = textContent
        .replace(/\s+/g, ' ') // Replace multiple whitespace with single space
        .replace(/^\s*Multiple Choice Question\s*/i, '') // Remove generic title
        .replace(/^\s*Question\s*\d*\s*/i, '') // Remove question number prefix
        .trim();

      // Determine if student has attempted the question
      const hasAttempted = result !== null || question.attempts > 0;
      const isCorrect = result?.isCorrect || false;
      
      // Create educational guidance for the AI based on attempt status
      let aiGuidance = '';
      if (!hasAttempted) {
        aiGuidance = `
**IMPORTANT AI GUIDANCE:** 
This student has NOT yet attempted this question. Your role is to GUIDE their thinking, NOT provide the answer directly.

**DO:**
- Ask probing questions to help them think through the problem
- Help them identify what they know and what they need to find
- Guide them toward the correct approach or formula
- Encourage them to work through it step by step
- Help them understand concepts they're struggling with

**DO NOT:**
- Give them the correct answer choice (A, B, C, or D)
- Solve the problem completely for them
- Tell them which option to select
- Provide the final numerical answer

Your goal is to help them learn by thinking through the problem themselves.

`;
      } else if (!isCorrect) {
        // Map internal IDs to display letters
        const studentAnswerIndex = question.options.findIndex(opt => opt.id === result?.answer);
        const correctAnswerIndex = question.options.findIndex(opt => opt.id === result?.correctOptionId);
        const studentDisplayLetter = studentAnswerIndex >= 0 ? String.fromCharCode(65 + studentAnswerIndex) : 'Unknown';
        const correctDisplayLetter = correctAnswerIndex >= 0 ? String.fromCharCode(65 + correctAnswerIndex) : 'Unknown';
        
        aiGuidance = `
**AI GUIDANCE:** 
This student attempted the question but got it wrong. Help them understand their mistake and guide them toward the correct approach.

**DO:**
- Help them analyze why their chosen answer was incorrect
- Guide them through the correct reasoning
- Explain the underlying concepts they may have missed
- Help them see the correct approach step by step
- Now you CAN show them the correct answer since they've already attempted it

**Student's Performance:**
- Their answer: ${studentDisplayLetter}
- Correct answer: ${correctDisplayLetter}
- Feedback given: ${result?.feedback || 'None'}

`;
      } else {
        aiGuidance = `
**AI GUIDANCE:** 
This student answered correctly! Reinforce their understanding and help them connect concepts.

**DO:**
- Congratulate them on getting it right
- Help them understand WHY their answer was correct
- Connect this problem to broader concepts
- Ask if they want to explore related topics
- Help solidify their understanding of the underlying principles

`;
      }

      // Create structured markdown content for AI context (internal - not shown to student)
      let markdownContent = aiGuidance;
      
      // Add question context
      if (question?.questionText) {
        markdownContent += `**Question:**\n${question.questionText}\n\n`;
      }
      
      // Add answer options with current selection state
      if (question?.options) {
        markdownContent += `**Answer Options:**\n`;
        question.options.forEach((option, index) => {
          const letter = String.fromCharCode(65 + index); // A, B, C, D
          const isSelected = selectedAnswer === option.id;
          const isCorrect = result?.correctOptionId === option.id;
          const isIncorrect = result && !result.isCorrect && result.answer === option.id;
          
          let optionText = `${letter}) ${option.text}`;
          
          // Add status indicators if question has been answered
          if (result && !isExamMode) {
            if (isCorrect) {
              optionText += ' ✓ **(Correct Answer)**';
            } else if (isIncorrect) {
              optionText += ' ✗ **(Student\'s Incorrect Answer)**';
            } else if (isSelected) {
              optionText += ' **(Currently Selected)**';
            }
          } else if (isSelected) {
            optionText += ' **(Currently Selected)**';
          }
          
          markdownContent += `${optionText}\n`;
        });
        markdownContent += '\n';
      }
      
      // Add attempt information
      if (question) {
        markdownContent += `**Attempt Status:** `;
        if (question.attempts > 0) {
          markdownContent += `${question.attempts} attempt(s) made`;
          if (question.maxAttempts && question.maxAttempts <= 500) {
            markdownContent += ` (${question.maxAttempts - question.attempts} remaining)`;
          }
        } else {
          markdownContent += 'Not yet attempted';
        }
        markdownContent += '\n\n';
      }
      
      // Add feedback if available
      if (result?.feedback && !isExamMode) {
        markdownContent += `**System Feedback Given:**\n${result.feedback}\n\n`;
      }
      
      // Add exam mode note if applicable
      if (isExamMode) {
        markdownContent += `**Note:** This question is part of an exam. Detailed feedback will be available after exam completion.\n\n`;
      }

      // Create standard JSX content that will be displayed to the student in the chat
      const createQuestionDisplayJSX = () => {
        return (
          <div className="question-context-display bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-none">
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Multiple Choice Question</h4>
              <div className="text-gray-700">
                {renderEnhancedText(question?.questionText || 'Question text not available')}
              </div>
            </div>
            
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 mb-2">Answer Options:</h5>
              <div className="space-y-1">
                {question?.options?.map((option, index) => {
                  const letter = String.fromCharCode(65 + index); // A, B, C, D
                  const isSelected = selectedAnswer === option.id;
                  const isCorrect = result?.correctOptionId === option.id;
                  const isIncorrect = result && !result.isCorrect && result.answer === option.id;
                  
                  return (
                    <div 
                      key={option.id}
                      className={`flex items-start gap-2 p-2 rounded ${
                        result && !isExamMode
                          ? isCorrect
                            ? 'bg-green-100 border border-green-300'
                            : isIncorrect
                            ? 'bg-red-100 border border-red-300'
                            : isSelected
                            ? 'bg-blue-100 border border-blue-300'
                            : 'bg-white border border-gray-200'
                          : isSelected
                          ? 'bg-blue-100 border border-blue-300'
                          : 'bg-white border border-gray-200'
                      }`}
                    >
                      <span className="font-medium text-gray-700 min-w-[20px]">{letter})</span>
                      <div className="flex-1">
                        {renderEnhancedText(option.text)}
                      </div>
                      <div className="flex items-center gap-1">
                        {result && !isExamMode && isCorrect && (
                          <span className="text-green-600 font-medium">✓ Correct</span>
                        )}
                        {result && !isExamMode && isIncorrect && (
                          <span className="text-red-600 font-medium">✗ Your Answer</span>
                        )}
                        {isSelected && (!result || isExamMode) && (
                          <span className="text-blue-600 font-medium">Selected</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="text-sm text-gray-600 space-y-1">
              <div>
                <strong>Status:</strong> {
                  question?.attempts > 0 
                    ? `${question.attempts} attempt(s) made${question.maxAttempts && question.maxAttempts <= 500 ? ` (${question.maxAttempts - question.attempts} remaining)` : ''}`
                    : 'Not yet attempted'
                }
              </div>
              
              {result?.feedback && !isExamMode && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <strong>Feedback:</strong> {result.feedback}
                </div>
              )}
              
              {isExamMode && (
                <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                  <strong>Exam Mode:</strong> Detailed feedback will be available after exam completion.
                </div>
              )}
            </div>
          </div>
        );
      };

      // Create a cleaner preview (first 200 chars of question text)
      const cleanPreview = question?.questionText?.substring(0, 200) || 'Multiple Choice Question';

      // Structure the extracted content
      const extractedContent = {
        title: question?.questionText ? `Question: ${question.questionText.substring(0, 50)}...` : 'Multiple Choice Question',
        content: markdownContent, // This contains the AI guidance and context
        originalJSX: createQuestionDisplayJSX(), // This will be displayed to the student
        type: 'multiple-choice-question',
        wordCount: markdownContent.split(' ').filter(word => word.length > 0).length,
        preview: cleanPreview + (cleanPreview.length >= 200 ? '...' : ''),
        questionData: {
          questionId: finalAssessmentId,
          courseId: courseId,
          questionText: question?.questionText,
          options: question?.options,
          selectedAnswer: selectedAnswer,
          result: result,
          attempts: question?.attempts,
          maxAttempts: question?.maxAttempts,
          status: question?.status,
          isExamMode: isExamMode,
          hasAttempted: hasAttempted,
          isCorrect: isCorrect
        }
      };

      // Call the provided callback with the extracted content
      onAIAccordionContent(extractedContent);
      
    } catch (error) {
      console.error('Error extracting content from question:', error);
      
      // Fallback to simple question-based content
      onAIAccordionContent({
        title: 'Multiple Choice Question',
        content: `Can you help me understand this multiple choice question?`,
        type: 'fallback',
        wordCount: 0,
        preview: `Can you help me understand this multiple choice question?`
      });
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
    <>
    <div ref={componentRef} className={`rounded-lg overflow-hidden shadow-lg border ${questionClassName} bg-white/75 backdrop-blur-sm border-${themeConfig.border}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b bg-gradient-to-r ${themeConfig.gradient} bg-opacity-75 border-${themeConfig.border}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium text-white">
            {question?.title || title || 'Multiple Choice Question'}
          </h3>
          <div className="flex items-center gap-2">
            {isExamMode && (
              <Clipboard className="w-6 h-6 text-white" title="Assessment Session" />
            )}
            {question && question.enableAIChat !== false && !isExamMode && (
              <Button
                onClick={handleAskAI}
                size="sm"
                variant="outline"
                className="flex items-center gap-1"
                title="Ask AI about this question"
              >
                <Bot className="w-4 h-4" />
                <span className="hidden sm:inline">Ask AI</span>
              </Button>
            )}
          </div>
        </div>
        
        {/* Display attempts counter when question is loaded (hidden in exam mode) */}
        {question && !isExamMode && (
          <div className="flex items-center text-xs text-white/90 mt-1">
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
          </div>
        )}
      </div>

      {/* Content */}
      <div ref={contentRef} className="p-5 bg-white/80">
        {error && !isExamMode && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading || regenerating || isWaitingForQuestions ? (
            <motion.div
              key="loading"
              variants={animations.fadeIn}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              {isWaitingForQuestions ? (
                <div className="text-center py-8">
                  <div className="animate-spin h-6 w-6 border-3 border-blue-600 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="text-gray-600">Waiting for questions to be prepared...</p>
                </div>
              ) : (
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
              )}
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
                    className={`flex items-center p-3.5 border rounded-md transition-all duration-200 ${
                      selectedAnswer === option.id
                        ? `bg-${themeConfig.light} border-${themeConfig.accent} ring-1 ${themeConfig.ring}`
                        : question?.status === 'manually_graded' && question?.lastSubmission?.answer === option.id
                        ? 'bg-indigo-50 border-indigo-300'
                        : 'bg-white hover:bg-gray-50 border-gray-200'
                    } ${question?.status === 'manually_graded' ? '' : 'cursor-pointer'}`}
                    onClick={() => {
                      // Only allow selection if there's no result yet and not manually graded
                      if (!result && question?.status !== 'manually_graded') {
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
                      onChange={() => !result && question?.status !== 'manually_graded' && setSelectedAnswer(option.id)}
                      disabled={result !== null || question?.status === 'manually_graded'} // Disable after submission or manual grading
                      className={`mr-3 h-4 w-4 cursor-pointer text-${themeConfig.accent} focus:ring-${themeConfig.accent}`}
                    />
                    <label 
                      htmlFor={`${instanceId}_${option.id}`} 
                      className="flex-grow text-gray-700 cursor-pointer"
                    >
                      {renderEnhancedText(option.text)}
                    </label>

                    {/* Show the correct/incorrect icon if there's a result (but NOT in exam mode) */}
                    {!isExamMode && result && (
                      <>
                        {/* Show checkmark on the correct answer */}
                        {result.correctOptionId === option.id && (
                          <span className="text-green-600 ml-2">✓</span>
                        )}
                        {/* Show X on the student's incorrect answer (only if it's different from correct) */}
                        {!result.isCorrect && (
                          // Use result.answer if available, otherwise fall back to selectedAnswer for immediate display
                          ((result.answer && result.answer === option.id) || (!result.answer && selectedAnswer === option.id)) &&
                          // Make sure it's different from the correct answer
                          ((result.answer && result.answer !== result.correctOptionId) || (!result.answer && selectedAnswer !== result.correctOptionId))
                        ) && (
                          <span className="text-red-600 ml-2">✗</span>
                        )}
                      </>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Submit/Save button - behavior depends on exam mode */}
              {!result && !showExamFeedback && question?.status !== 'manually_graded' && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedAnswer}
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
                      'Submit Answer'
                  }
                </Button>
              )}

              {/* Manual Grade Display */}
              {question?.status === 'manually_graded' && (
                <motion.div
                  variants={animations.slideUp}
                  initial="hidden"
                  animate="show"
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-5 p-4 rounded-md shadow-sm bg-indigo-50 border border-indigo-200"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-indigo-900">Manually Graded</h4>
                    <div className="text-2xl font-bold text-indigo-700">
                      {manualGradeMetadata?.currentScore || question?.correctOverall ? 1 : 0} / {manualGradeMetadata?.pointsValue || question?.pointsValue || 1}
                    </div>
                  </div>
                </motion.div>
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
                          className={`w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md bg-gradient-to-r ${themeConfig.gradient}`}
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