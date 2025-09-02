import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Infinity, Bot, Clipboard, CheckCircle, XCircle } from 'lucide-react';
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
    /\|[^|]+\|[^|]+\|/,            // Tables
    /^\s*>\s+.+$/m,                // Blockquotes
    /^\s*-\s+.+$/m,                // Unordered lists
    /^\s*\d+\.\s+.+$/m,            // Ordered lists
    /!\[.+\]\(.+\)/,               // Images
    /~~.+~~/,                      // Strikethrough
    /\$\$.+\$\$/,                  // Math blocks
    /\$.+\$/,                      // Inline math
    /\\[a-zA-Z]+/,                 // LaTeX commands
  ];
  
  const quickCheck = (
    text.includes('#') || text.includes('**') || text.includes('*') ||
    text.includes('```') || text.includes('`') || text.includes('[') ||
    text.includes('|') || text.includes('> ') || text.includes('- ') ||
    text.includes('1. ') || text.includes('$') || text.includes('\\')
  );
  
  if (quickCheck) {
    for (const pattern of markdownPatterns) {
      if (pattern.test(text)) {
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
  
  const scientificPattern = /(\d+\.?\d*)[eE]([+-]?\d+)/g;
  
  return text.replace(scientificPattern, (match, coefficient, exponent) => {
    const cleanExponent = exponent.replace(/^\+/, '');
    return `${coefficient} × 10<sup>${cleanExponent}</sup>`;
  });
};

/**
 * Enhanced text rendering that handles both markdown and LaTeX math
 */
const renderEnhancedText = (text) => {
  if (!text) return text;
  
  text = formatScientificNotation(text);
  
  if (containsMarkdown(text)) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm, remarkEmoji, remarkDeflist]}
          rehypePlugins={[
            [rehypeSanitize, {
              allowedElements: [
                'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'li', 'blockquote', 
                'pre', 'code', 'em', 'strong', 'del', 'table', 'thead', 'tbody', 'tr', 
                'th', 'td', 'a', 'img', 'hr', 'br', 'div', 'span',
                'details', 'summary', 'dl', 'dt', 'dd',
                'sup', 'sub'
              ],
              allowedAttributes: {
                a: ['href', 'target', 'rel'],
                img: ['src', 'alt', 'title'],
                div: ['className', 'class', 'style'],
                span: ['className', 'class', 'style'],
                code: ['className', 'class', 'language'],
                pre: ['className', 'class'],
                details: ['open']
              }
            }],
            rehypeKatex,
            rehypeRaw
          ]}
          components={{
            img: ({node, ...props}) => (
              <div className="my-4 text-center">
                <img 
                  {...props} 
                  className="max-w-full h-auto mx-auto rounded-lg shadow-md border border-gray-200"
                  style={{ maxHeight: '400px' }}
                />
              </div>
            ),
            h1: ({node, ...props}) => <h2 className="text-xl font-bold mt-1 mb-2" {...props} />,
            h2: ({node, ...props}) => <h3 className="text-lg font-bold mt-1 mb-2" {...props} />,
            h3: ({node, ...props}) => <h4 className="text-base font-bold mt-1 mb-1" {...props} />,
            code: ({node, inline, className, children, ...props}) => {
              if (inline) {
                return <code className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-800" {...props}>{children}</code>
              }
              return <code {...props}>{children}</code>
            },
            ul: ({node, ...props}) => <ul className="my-1 pl-5" {...props} />,
            ol: ({node, ...props}) => <ol className="my-1 pl-5" {...props} />,
            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
            p: ({node, ...props}) => <p className="mb-2" {...props} />,
            a: ({node, ...props}) => <a target="_blank" rel="noopener noreferrer" className="font-medium underline" {...props} />,
            table: ({node, ...props}) => (
              <div className="overflow-x-auto my-2">
                <table className="border-collapse border border-gray-300 text-sm" {...props} />
              </div>
            ),
            th: ({node, ...props}) => <th className="border border-gray-300 px-2 py-1 bg-gray-100" {...props} />,
            td: ({node, ...props}) => <td className="border border-gray-300 px-2 py-1" {...props} />,
            details: ({node, ...props}) => <details className="border rounded-md p-2 my-2" {...props} />,
            summary: ({node, ...props}) => <summary className="font-medium cursor-pointer" {...props} />,
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
  
  return (
    <div 
      style={{ whiteSpace: 'pre-wrap' }}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

/**
 * A Standard True/False Question component that works with Firebase backend
 * Simplified version of StandardMultipleChoiceQuestion optimized for binary choices
 * 
 * This component handles:
 * - True/False question generation and display
 * - Submission of answers and feedback
 * - Exam mode support
 * - Tracking of attempts
 * - Real-time updates via Firebase database listener
 * - AI assistant integration
 */
const StandardTrueFalseQuestion = ({
  // Required props
  courseId,
  cloudFunctionName,
  assessmentId,
  course,
  topic,

  // Styling props
  theme = 'purple',
  title,
  questionClassName = '',
  optionsClassName = '',
  displayStyle = 'buttons', // 'buttons' | 'dropdown' | 'checkbox' | 'toggle' | 'cards'
  
  // Exam mode props
  examMode = false,
  examSessionId = null,
  onExamAnswerSave = () => {},
  hasExistingAnswer = false,
  currentSavedAnswer = null,
  
  // Pre-loading optimization props
  skipInitialGeneration = false,
  isWaitingForQuestions = false,
  
  // Callback functions
  onCorrectAnswer = () => {},
  onAttempt = () => {},
  onComplete = () => {},
  
  // AI Assistant props
  onAIAccordionContent = null,
  
  // Manual grading props
  manualGradeData = null,
  manualGradeMetadata = null,
}) => {
  const finalAssessmentId = assessmentId || cloudFunctionName;
  
  if (!finalAssessmentId) {
    console.error('StandardTrueFalseQuestion: cloudFunctionName is required');
    return <div className="p-4 bg-red-50 text-red-600 rounded">Error: cloudFunctionName is required</div>;
  }
  
  // Generate a unique instance ID for this question component
  const instanceId = useRef(`tf_${finalAssessmentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`).current;
  
  // Authentication and state
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  
  // Refs for debouncing and preventing multiple calls
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);
  const regenerationTimeoutRef = useRef(null);
  const contentRef = useRef(null);
  const componentRef = useRef(null);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Detect exam mode from course configuration or explicit prop
  const isExamMode = examMode || question?.activityType === 'exam';
  
  // Check if current selection differs from saved answer
  const hasUnsavedChanges = isExamMode && currentSavedAnswer !== null && selectedAnswer !== null && selectedAnswer !== currentSavedAnswer;
  
  // Check if answer is saved
  const isAnswerSaved = isExamMode && currentSavedAnswer !== null && selectedAnswer !== null && selectedAnswer === currentSavedAnswer;
  
  // Get theme configuration
  const activeTheme = (isExamMode ? 'purple' : theme) || question?.settings?.theme || 'purple';
  const themeConfig = getThemeConfig(activeTheme);

  // Track the last question timestamp
  const [lastQuestionTimestamp, setLastQuestionTimestamp] = useState(null);
  const safetyTimeoutRef = useRef(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
      if (safetyTimeoutRef.current) {
        clearTimeout(safetyTimeoutRef.current);
      }
    };
  }, []);

  // Main data loading effect
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      setError("User authentication required");
      setLoading(false);
      return;
    }

    const studentEmail = currentUser.email;
    const studentKey = sanitizeEmail(studentEmail);
    
    let unsubscribeRef = null;
    
    const loadAssessment = () => {
      setLoading(true);
      try {
        const basePath = 'students';
        const dbPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${finalAssessmentId}`;

        const assessmentRef = ref(db, dbPath);

        unsubscribeRef = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          const validStatuses = ['active', 'exam_in_progress', 'completed', 'attempted', 'failed', 'manually_graded'];
          
          if (data) {
            const hasValidStatus = validStatuses.includes(data.status);
            
            if (!hasValidStatus) {
              console.log(`Assessment ${finalAssessmentId} has invalid status: ${data.status}. Waiting for valid status...`);
              return;
            }
            
            const maxAttemptsFromData = data.maxAttempts;
            const attemptsExhausted = data.attempts >= maxAttemptsFromData;
            const maxAttemptsReached = data.status === 'maxAttemptsReached' || attemptsExhausted;
            
            const enhancedData = {
              ...data,
              maxAttemptsReached,
              attemptsExhausted
            };
            
            setQuestion(enhancedData);
            setLastQuestionTimestamp(data.timestamp || 0);
            
            if (data.lastSubmission) {
              setResult(data.lastSubmission);
              if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
                setSelectedAnswer(currentSavedAnswer);
              } else {
                setSelectedAnswer(data.lastSubmission.answer || null);
              }
            } else if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
              setSelectedAnswer(currentSavedAnswer);
            }
            
            if (maxAttemptsReached && !isExamMode) {
              if (!data.lastSubmission) {
                setError("You've reached the maximum number of attempts for this question.");
              }
            }
          } else {
            if (isExamMode || examMode) {
              console.log(`Waiting for exam session to create question ${finalAssessmentId}...`);
              return;
            }
            
            if (!skipInitialGeneration && !isGeneratingRef.current) {
              setTimeout(() => {
                if (!question && !isGeneratingRef.current) {
                  generateQuestion();
                }
              }, 500);
            } else {
              setLoading(false);
            }
          }
          
          if (data && validStatuses.includes(data.status)) {
            setLoading(false);
          } else if (!data && !isExamMode && !examMode && skipInitialGeneration) {
            setLoading(false);
          }
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

    loadAssessment();
    
    return () => {
      if (unsubscribeRef) {
        unsubscribeRef();
      }
    };
  }, [currentUser, courseId, finalAssessmentId, db, skipInitialGeneration]);

  // Effect to handle currentSavedAnswer prop changes in exam mode
  useEffect(() => {
    if (isExamMode && currentSavedAnswer !== null && currentSavedAnswer !== undefined) {
      if (selectedAnswer !== currentSavedAnswer) {
        console.log(`🔄 Updating selected answer from prop: ${currentSavedAnswer} (was: ${selectedAnswer})`);
        setSelectedAnswer(currentSavedAnswer);
      }
    }
  }, [currentSavedAnswer, isExamMode, selectedAnswer]);

  // Generate a new question using cloud function
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    if (isGeneratingRef.current) {
      return;
    }
    
    isGeneratingRef.current = true;
    
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGeneratedTimeRef.current;
    if (timeSinceLastGeneration < 2000) {
      if (regenerationTimeoutRef.current) {
        clearTimeout(regenerationTimeoutRef.current);
      }
      
      const timeToWait = 2000 - timeSinceLastGeneration;
      regenerationTimeoutRef.current = setTimeout(() => {
        lastGeneratedTimeRef.current = Date.now();
        generateQuestionNow();
      }, timeToWait);
      
      return;
    }

    lastGeneratedTimeRef.current = now;
    await generateQuestionNow();
  };
  
  const generateQuestionNow = async () => {
    if (!regenerating) {
      setRegenerating(true);
    }
    
    setSelectedAnswer(null);
    setResult(null);

    try {
      const cloudFunctionToUse = (String(courseId) === '2' && cloudFunctionName.startsWith('course2_')) 
        ? 'course2_assessments' 
        : 'universal_assessments';
      
      const assessmentFunction = httpsCallable(functions, cloudFunctionToUse);

      const topicFromData = topic || question?.topic || 'general';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        questionType: 'true-false'
      };

      const result = await assessmentFunction(functionParams);

      if (result.data?.questionData) {
        const questionData = result.data.questionData;
        
        setQuestion({
          ...questionData,
          maxAttemptsReached: false,
          attemptsExhausted: false
        });
        
        setLastQuestionTimestamp(questionData.timestamp || Date.now());
        setRegenerating(false);
        setResult(null);
        setSelectedAnswer(null);
        
        if (safetyTimeoutRef.current) {
          clearTimeout(safetyTimeoutRef.current);
          safetyTimeoutRef.current = null;
        }
      } else {
        console.warn("Backend didn't return questionData - falling back to database listener");
      }
    } catch (err) {
      console.error("Error generating true/false question:", err);
      
      if (err.message && err.message.includes("Maximum attempts")) {
        if (question) {
          setQuestion({
            ...question,
            maxAttemptsReached: true,
            status: 'maxAttemptsReached',
            attemptsExhausted: true
          });
        }
        if (!isExamMode) {
          setError("You've reached the maximum number of attempts for this question.");
        }
      } else {
        setError("Failed to generate question: " + (err.message || err));
      }
      
      setLoading(false);
      setRegenerating(false);
    } finally {
      isGeneratingRef.current = false;
    }
  };

  // Handle submission of the answer
  const handleSubmit = async () => {
    if (selectedAnswer === null) {
      alert("Please select an answer");
      return;
    }

    if (isExamMode) {
      await handleExamAnswerSave();
      return;
    }

    setSubmitting(true);
    try {
      const cloudFunctionToUse = (String(courseId) === '2' && cloudFunctionName.startsWith('course2_')) 
        ? 'course2_assessments' 
        : 'universal_assessments';
      
      const assessmentFunction = httpsCallable(functions, cloudFunctionToUse);

      const topicFromData = topic || question?.topic || 'general';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        operation: 'evaluate',
        answer: selectedAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        questionType: 'true-false'
      };

      const response = await assessmentFunction(functionParams);

      if (response.data?.result) {
        setResult(response.data.result);
        
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

      onAttempt(response.data?.result?.isCorrect || false);

      if (response.data?.result?.isCorrect) {
        onCorrectAnswer();
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      
      if (err.message && err.message.includes("Maximum attempts")) {
        if (question) {
          setQuestion({
            ...question,
            maxAttemptsReached: true,
            status: 'maxAttemptsReached',
            attemptsExhausted: true
          });
        }
        if (!isExamMode) {
          setError("You've reached the maximum number of attempts for this question.");
        }
      } else {
        setError("Failed to submit your answer. Please try again: " + (err.message || err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle saving answer in exam mode (NO EVALUATION)
  const handleExamAnswerSave = async () => {
    if (selectedAnswer === null) {
      alert("Please select an answer");
      return;
    }

    setSubmitting(true);
    try {
      const saveExamAnswerFunction = httpsCallable(functions, 'saveExamAnswer');
      
      const saveParams = {
        courseId: courseId,
        assessmentId: finalAssessmentId,
        answer: selectedAnswer,
        examSessionId: examSessionId,
        studentEmail: currentUser.email
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

  // Handle regeneration of the question
  const handleRegenerate = () => {
    if (componentRef.current) {
      const elementPosition = componentRef.current.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - 100;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    
    if (isGeneratingRef.current || regenerating) {
      return;
    }
    
    if (question && question.attempts >= question.maxAttempts && !isExamMode) {
      setError(`You have reached the maximum number of attempts (${question.maxAttempts}).`);
      return;
    }
    
    lastGeneratedTimeRef.current = Date.now();
    
    setSelectedAnswer(null);
    setResult(null);
    setRegenerating(true);
    setError(null);

    try {
      console.log("Requesting question regeneration while preserving attempt count");
      generateQuestion().catch(error => {
        console.error("Error during question regeneration:", error);
        setRegenerating(false);
        isGeneratingRef.current = false;
        setError("Failed to regenerate question: " + (error.message || error));
      });
    } catch (error) {
      console.error("Error during regeneration:", error);
      setRegenerating(false);
      isGeneratingRef.current = false;
      setError("Failed to regenerate question: " + (error.message || error));
    }
  };

  // Handle AI assistant integration
  const handleAskAI = () => {
    if (!onAIAccordionContent) {
      console.warn('onAIAccordionContent callback not provided. AI assistance not available.');
      return;
    }

    try {
      const contentElement = contentRef.current;
      if (!contentElement) {
        console.warn('Content element not found');
        return;
      }

      let htmlContent = contentElement.innerHTML || '';
      
      htmlContent = htmlContent
        .replace(/\u200B/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/\u2060/g, '')
        .replace(/\uFEFF/g, '');

      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      let textContent = tempDiv.textContent || tempDiv.innerText || '';
      
      textContent = textContent
        .replace(/\s+/g, ' ')
        .replace(/^\\s*True False Question\\s*/i, '')
        .replace(/^\\s*Question\\s*\\d*\\s*/i, '')
        .trim();

      const hasAttempted = result !== null || question?.attempts > 0;
      const isCorrect = result?.isCorrect || false;
      
      let aiGuidance = '';
      if (!hasAttempted) {
        aiGuidance = `
**IMPORTANT AI GUIDANCE:** 
This student has NOT yet attempted this true/false question. Guide their thinking without giving the answer.

**DO:**
- Ask probing questions to help them evaluate the statement
- Help them identify key facts or concepts
- Guide them to think critically about the claim
- Encourage them to consider evidence for and against

**DO NOT:**
- Tell them if the statement is true or false
- Give them the correct answer
- Solve it for them

`;
      } else if (!isCorrect) {
        aiGuidance = `
**AI GUIDANCE:** 
The student answered incorrectly. Help them understand why.

**Student's Answer:** ${selectedAnswer ? 'True' : 'False'}
**Correct Answer:** ${result?.correctAnswer ? 'True' : 'False'}
**Feedback:** ${result?.feedback || 'None'}

`;
      } else {
        aiGuidance = `
**AI GUIDANCE:** 
The student answered correctly! Reinforce their understanding.

`;
      }

      let markdownContent = aiGuidance;
      
      if (question?.questionText) {
        markdownContent += `**Statement:**\n${question.questionText}\n\n`;
      }
      
      markdownContent += `**Answer Options:**\n`;
      markdownContent += `- True${selectedAnswer === true ? ' **(Selected)**' : ''}\n`;
      markdownContent += `- False${selectedAnswer === false ? ' **(Selected)**' : ''}\n\n`;
      
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
      
      if (result?.feedback && !isExamMode) {
        markdownContent += `**Feedback:**\n${result.feedback}\n\n`;
      }

      const createQuestionDisplayJSX = () => {
        return (
          <div className="question-context-display bg-gray-50 border border-gray-200 rounded-lg p-4 max-w-none">
            <div className="mb-3">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">True/False Question</h4>
              <div className="text-gray-700">
                {renderEnhancedText(question?.questionText || 'Question text not available')}
              </div>
            </div>
            
            <div className="mb-3">
              <h5 className="font-medium text-gray-700 mb-2">Your Answer:</h5>
              <div className="space-y-1">
                <div className={`p-2 rounded ${selectedAnswer === true ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}>
                  <span className="font-medium">True</span>
                  {result && !isExamMode && result.correctAnswer === true && (
                    <span className="text-green-600 ml-2">✓ Correct</span>
                  )}
                  {result && !isExamMode && selectedAnswer === true && result.correctAnswer !== true && (
                    <span className="text-red-600 ml-2">✗ Your Answer</span>
                  )}
                </div>
                <div className={`p-2 rounded ${selectedAnswer === false ? 'bg-blue-100 border border-blue-300' : 'bg-white border border-gray-200'}`}>
                  <span className="font-medium">False</span>
                  {result && !isExamMode && result.correctAnswer === false && (
                    <span className="text-green-600 ml-2">✓ Correct</span>
                  )}
                  {result && !isExamMode && selectedAnswer === false && result.correctAnswer !== false && (
                    <span className="text-red-600 ml-2">✗ Your Answer</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              <div>
                <strong>Status:</strong> {
                  question?.attempts > 0 
                    ? `${question.attempts} attempt(s) made`
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

      const cleanPreview = question?.questionText?.substring(0, 200) || 'True/False Question';

      const extractedContent = {
        title: question?.questionText ? `Question: ${question.questionText.substring(0, 50)}...` : 'True/False Question',
        content: markdownContent,
        originalJSX: createQuestionDisplayJSX(),
        type: 'true-false-question',
        wordCount: markdownContent.split(' ').filter(word => word.length > 0).length,
        preview: cleanPreview + (cleanPreview.length >= 200 ? '...' : ''),
        questionData: {
          questionId: finalAssessmentId,
          courseId: courseId,
          questionText: question?.questionText,
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

      onAIAccordionContent(extractedContent);
      
    } catch (error) {
      console.error('Error extracting content from question:', error);
      
      onAIAccordionContent({
        title: 'True/False Question',
        content: `Can you help me understand this true/false question?`,
        type: 'fallback',
        wordCount: 0,
        preview: `Can you help me understand this true/false question?`
      });
    }
  };

  // Render different styles based on displayStyle prop
  const renderAnswerOptions = () => {
    switch (displayStyle) {
      case 'dropdown':
        return (
          <div className="mb-5">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your answer:
            </label>
            <select
              value={selectedAnswer === null ? '' : selectedAnswer.toString()}
              onChange={(e) => {
                if (!result && question?.status !== 'manually_graded') {
                  const value = e.target.value;
                  setSelectedAnswer(value === 'true' ? true : value === 'false' ? false : null);
                }
              }}
              disabled={result !== null || question?.status === 'manually_graded'}
              className={`w-full px-4 py-3 border-2 rounded-lg text-lg font-medium transition-all ${
                selectedAnswer !== null
                  ? `border-${themeConfig.accent} bg-${themeConfig.light}`
                  : 'border-gray-300 bg-white'
              } ${result !== null || question?.status === 'manually_graded' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400'}`}
            >
              <option value="">Choose an answer...</option>
              <option value="true">✓ True</option>
              <option value="false">✗ False</option>
            </select>
            {!isExamMode && result && (
              <div className="mt-2 text-sm">
                {result.isCorrect ? (
                  <span className="text-green-600 font-medium">✓ Correct answer: {result.correctAnswer ? 'True' : 'False'}</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Correct answer: {result.correctAnswer ? 'True' : 'False'}</span>
                )}
              </div>
            )}
          </div>
        );

      case 'checkbox':
        return (
          <div className="flex flex-col items-center">
            <div className={`relative ${!result && !question?.status ? 'animate-gentleBounce' : ''}`}>
              <label className="cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedAnswer === true}
                  onChange={(e) => {
                    if (!result && question?.status !== 'manually_graded') {
                      setSelectedAnswer(e.target.checked);
                    }
                  }}
                  disabled={result !== null || question?.status === 'manually_graded'}
                  className={`h-8 w-8 rounded-md cursor-pointer transition-all duration-200 
                    ${selectedAnswer === true 
                      ? `text-${themeConfig.accent} ring-4 ${themeConfig.ring} ring-opacity-50` 
                      : 'text-gray-400 hover:text-gray-500'
                    } 
                    focus:ring-4 focus:${themeConfig.ring} focus:ring-opacity-50
                    ${result !== null || question?.status === 'manually_graded' ? 'opacity-60 cursor-not-allowed' : ''}
                  `}
                />
              </label>
              {/* Pulse effect when not answered */}
              {!result && selectedAnswer === null && (
                <div className={`absolute inset-0 rounded-md bg-${themeConfig.accent} animate-ping opacity-25 pointer-events-none`}></div>
              )}
            </div>
            {/* Result feedback */}
            {!isExamMode && result && (
              <div className="mt-2 text-sm text-center">
                {result.isCorrect ? (
                  <span className="text-green-600 font-medium">✓ Correct!</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Answer: {result.correctAnswer ? 'true' : 'false'}</span>
                )}
              </div>
            )}
          </div>
        );

      case 'toggle':
        return (
          <div>
            <div className="flex items-center space-x-3">
              <span className={`text-sm font-medium ${selectedAnswer === false ? 'text-gray-900' : 'text-gray-400'}`}>
                False
              </span>
              <button
                type="button"
                onClick={() => {
                  if (!result && question?.status !== 'manually_graded') {
                    setSelectedAnswer(selectedAnswer === true ? false : true);
                  }
                }}
                disabled={result !== null || question?.status === 'manually_graded'}
                className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-${themeConfig.accent} focus:ring-offset-2 ${
                  selectedAnswer === true ? `bg-gradient-to-r ${themeConfig.gradient}` : 'bg-gray-300'
                } ${result !== null || question?.status === 'manually_graded' ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    selectedAnswer === true ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className={`text-sm font-medium ${selectedAnswer === true ? 'text-gray-900' : 'text-gray-400'}`}>
                True
              </span>
            </div>
            {!isExamMode && result && (
              <div className="mt-2 text-sm">
                {result.isCorrect ? (
                  <span className="text-green-600 font-medium">✓ Correct!</span>
                ) : (
                  <span className="text-red-600 font-medium">✗ Answer: {result.correctAnswer ? 'True' : 'False'}</span>
                )}
              </div>
            )}
          </div>
        );

      case 'cards':
        return (
          <div className="grid grid-cols-2 gap-4 mb-5">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!result && question?.status !== 'manually_graded') {
                  setSelectedAnswer(true);
                }
              }}
              disabled={result !== null || question?.status === 'manually_graded'}
              className={`p-6 rounded-xl border-3 transition-all ${
                selectedAnswer === true
                  ? `bg-gradient-to-br from-green-50 to-green-100 border-green-500 shadow-lg ring-2 ring-green-300`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              } ${result !== null || question?.status === 'manually_graded' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <CheckCircle className={`w-12 h-12 mx-auto mb-2 ${selectedAnswer === true ? 'text-green-600' : 'text-gray-400'}`} />
              <p className={`text-xl font-bold ${selectedAnswer === true ? 'text-green-700' : 'text-gray-700'}`}>TRUE</p>
              {!isExamMode && result && result.correctAnswer === true && (
                <p className="text-sm text-green-600 mt-2">✓ Correct</p>
              )}
              {!isExamMode && result && selectedAnswer === true && !result.isCorrect && (
                <p className="text-sm text-red-600 mt-2">✗ Incorrect</p>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!result && question?.status !== 'manually_graded') {
                  setSelectedAnswer(false);
                }
              }}
              disabled={result !== null || question?.status === 'manually_graded'}
              className={`p-6 rounded-xl border-3 transition-all ${
                selectedAnswer === false
                  ? `bg-gradient-to-br from-red-50 to-red-100 border-red-500 shadow-lg ring-2 ring-red-300`
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-md'
              } ${result !== null || question?.status === 'manually_graded' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <XCircle className={`w-12 h-12 mx-auto mb-2 ${selectedAnswer === false ? 'text-red-600' : 'text-gray-400'}`} />
              <p className={`text-xl font-bold ${selectedAnswer === false ? 'text-red-700' : 'text-gray-700'}`}>FALSE</p>
              {!isExamMode && result && result.correctAnswer === false && (
                <p className="text-sm text-green-600 mt-2">✓ Correct</p>
              )}
              {!isExamMode && result && selectedAnswer === false && !result.isCorrect && (
                <p className="text-sm text-red-600 mt-2">✗ Incorrect</p>
              )}
            </motion.button>
          </div>
        );

      case 'buttons':
      default:
        return (
          <div className={`space-y-2.5 mb-5 ${optionsClassName}`}>
            <motion.div
              variants={animations.item}
              custom={0}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex items-center p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                selectedAnswer === true
                  ? `bg-${themeConfig.light} border-${themeConfig.accent} ring-2 ${themeConfig.ring}`
                  : question?.status === 'manually_graded' && question?.lastSubmission?.answer === true
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                if (!result && question?.status !== 'manually_graded') {
                  setSelectedAnswer(true);
                }
              }}
            >
              <input
                type="radio"
                id={`${instanceId}_true`}
                name={instanceId}
                value="true"
                checked={selectedAnswer === true}
                onChange={() => !result && question?.status !== 'manually_graded' && setSelectedAnswer(true)}
                disabled={result !== null || question?.status === 'manually_graded'}
                className={`mr-3 h-5 w-5 cursor-pointer text-${themeConfig.accent} focus:ring-${themeConfig.accent}`}
              />
              <label 
                htmlFor={`${instanceId}_true`} 
                className="flex-grow text-gray-700 cursor-pointer font-medium text-lg flex items-center"
              >
                <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                True
              </label>

              {/* Show result icons */}
              {!isExamMode && result && (
                <>
                  {result.correctAnswer === true && (
                    <span className="text-green-600 ml-2 font-bold">✓ Correct</span>
                  )}
                  {!result.isCorrect && selectedAnswer === true && (
                    <span className="text-red-600 ml-2 font-bold">✗ Incorrect</span>
                  )}
                </>
              )}
            </motion.div>

            <motion.div
              variants={animations.item}
              custom={1}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`flex items-center p-4 border-2 rounded-lg transition-all duration-200 cursor-pointer ${
                selectedAnswer === false
                  ? `bg-${themeConfig.light} border-${themeConfig.accent} ring-2 ${themeConfig.ring}`
                  : question?.status === 'manually_graded' && question?.lastSubmission?.answer === false
                  ? 'bg-indigo-50 border-indigo-300'
                  : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => {
                if (!result && question?.status !== 'manually_graded') {
                  setSelectedAnswer(false);
                }
              }}
            >
              <input
                type="radio"
                id={`${instanceId}_false`}
                name={instanceId}
                value="false"
                checked={selectedAnswer === false}
                onChange={() => !result && question?.status !== 'manually_graded' && setSelectedAnswer(false)}
                disabled={result !== null || question?.status === 'manually_graded'}
                className={`mr-3 h-5 w-5 cursor-pointer text-${themeConfig.accent} focus:ring-${themeConfig.accent}`}
              />
              <label 
                htmlFor={`${instanceId}_false`} 
                className="flex-grow text-gray-700 cursor-pointer font-medium text-lg flex items-center"
              >
                <XCircle className="w-5 h-5 mr-2 text-red-600" />
                False
              </label>

              {/* Show result icons */}
              {!isExamMode && result && (
                <>
                  {result.correctAnswer === false && (
                    <span className="text-green-600 ml-2 font-bold">✓ Correct</span>
                  )}
                  {!result.isCorrect && selectedAnswer === false && (
                    <span className="text-red-600 ml-2 font-bold">✗ Incorrect</span>
                  )}
                </>
              )}
            </motion.div>
          </div>
        );
    }
  };

  // Animations
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
    <div ref={componentRef} className={`rounded-lg overflow-hidden shadow-lg border ${questionClassName} bg-white/75 backdrop-blur-sm border-${themeConfig.border}`}>
      {/* Header */}
      <div className={`px-4 py-3 border-b bg-gradient-to-r ${themeConfig.gradient} bg-opacity-75 border-${themeConfig.border}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium text-white">
            {question?.title || title || 'True/False Question'}
          </h3>
          <div className="flex items-center gap-2">
            {isExamMode && (
              <Clipboard className="w-6 h-6 text-white" title="Assessment Session" />
            )}
            {question && question.enableAIChat !== false && !isExamMode && 
             course?.courseDetails?.['course-config']?.aiFeatures?.enabled === true && (
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
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
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

              {/* For checkbox and toggle styles, display side by side */}
              {(displayStyle === 'checkbox' || displayStyle === 'toggle') ? (
                <div className="flex items-start gap-6 mb-5">
                  <div className="flex-1 text-gray-800 text-lg font-medium">
                    {renderEnhancedText(question.questionText)}
                  </div>
                  <div className="flex-shrink-0">
                    {renderAnswerOptions()}
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-gray-800 mb-5 text-lg font-medium">
                    {renderEnhancedText(question.questionText)}
                  </div>
                  {/* True/False Options - Different Styles */}
                  {renderAnswerOptions()}
                </>
              )}

              {/* Submit/Save button */}
              {!result && question?.status !== 'manually_graded' && (
                <Button
                  onClick={handleSubmit}
                  disabled={submitting || selectedAnswer === null}
                  className={`mt-3 w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md ${
                    hasUnsavedChanges 
                      ? 'bg-amber-500 ring-2 ring-amber-300 ring-opacity-50' 
                      : isAnswerSaved
                      ? 'bg-green-500 hover:bg-green-600'
                      : `bg-gradient-to-r ${themeConfig.gradient}`
                  }`}
                >
                  {submitting ? 
                    (isExamMode ? 'Saving...' : 'Confirming...') : 
                    isExamMode ? 
                      (hasUnsavedChanges ? 'Save Changes' : hasExistingAnswer ? 'Update Answer' : isAnswerSaved ? 'Answer Saved ✓' : 'Save Answer') : 
                      'Confirm'
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

              {/* Result feedback */}
              {(result && (!isExamMode || question?.showExamFeedback)) && (
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

                  {/* Show explanation if provided */}
                  {result.explanation && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="font-medium mb-1">Explanation:</p>
                      <div className="text-sm">
                        {renderEnhancedText(result.explanation)}
                      </div>
                    </div>
                  )}

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

                  {/* For generating a new question */}
                  <div className="mt-4">
                    {result && !isExamMode && !question.maxAttemptsReached && !question.attemptsExhausted && 
                     question.attempts < question.maxAttempts && (
                      <Button
                        onClick={handleRegenerate}
                        className={`w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md bg-gradient-to-r ${themeConfig.gradient}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Try Another Question
                      </Button>
                    )}
                    
                    {/* Exam mode specific messaging */}
                    {isExamMode && result && (
                      <div className="text-sm text-gray-600 mt-2">
                        <p className="font-medium">Exam Mode</p>
                        <p>Results will be available when you complete the entire exam.</p>
                      </div>
                    )}
                    
                    {/* Display message when max attempts reached */}
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
  );
};

export default StandardTrueFalseQuestion;