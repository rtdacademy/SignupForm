import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Progress } from '../../../../components/ui/progress';
import { 
  MessageCircle, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Infinity
} from 'lucide-react';
import { sanitizeEmail } from '../../../../utils/sanitizeEmail';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
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
 */
const containsMarkdown = (text) => {
  if (!text) return false;
  
  // Look for common markdown patterns including newlines
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
    /\n/,                          // Newlines - important for preserving line breaks
  ];
  
  // Check for newlines or other markdown patterns
  return markdownPatterns.some(pattern => pattern.test(text));
};

/**
 * Enhanced text rendering that handles both markdown and LaTeX math
 * Preserves newlines and formats text properly
 */
const renderEnhancedText = (text) => {
  if (!text) return text;
  
  // If text contains markdown patterns or newlines, use ReactMarkdown
  if (containsMarkdown(text)) {
    return (
      <div className="prose prose-sm max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkMath, remarkGfm]}
          rehypePlugins={[rehypeKatex, rehypeRaw]}
          components={{
            // Handle inline code
            code: ({node, inline, className, children, ...props}) => {
              if (inline) {
                return <code className="px-1 py-0.5 rounded text-sm font-mono bg-gray-100 text-gray-800" {...props}>{children}</code>
              }
              return <code {...props}>{children}</code>
            },
            // Make sure paragraphs preserve spacing
            p: ({node, ...props}) => <p className="mb-2" {...props} />,
            // Handle lists
            ul: ({node, ...props}) => <ul className="my-1 pl-5" {...props} />,
            ol: ({node, ...props}) => <ol className="my-1 pl-5" {...props} />,
            li: ({node, ...props}) => <li className="my-0.5" {...props} />,
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
 * Word count helper
 */
const getWordCount = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
};


/**
 * AI Short Answer Question Component
 * Handles AI-powered short answer questions with automatic evaluation
 */
const AIShortAnswerQuestion = ({ 
  // Required props
  courseId,
  assessmentId,
  cloudFunctionName,
  topic,
  
  // Styling props
  theme = 'purple',
  className = '',
  
  // Exam mode props
  examMode = false,        // Whether this is being used in exam mode
  examSessionId = null,    // Exam session ID for saving answers
  onExamAnswerSave = () => {}, // Callback for saving exam answers
  
  // Callback functions
  onComplete = () => {},
  onAttempt = () => {},
}) => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [questionData, setQuestionData] = useState(null);
  
  // Use cloudFunctionName as fallback for assessmentId if not provided
  const effectiveAssessmentId = assessmentId || cloudFunctionName;
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  const [attemptsMade, setAttemptsMade] = useState(0);
  const [examAnswerSaved, setExamAnswerSaved] = useState(false);
  
  // Refs
  const textareaRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);

  const functions = getFunctions();
  const db = getDatabase();
  
  // Get theme colors
  const activeTheme = questionData?.settings?.theme || theme;
  const themeColors = getThemeColors(activeTheme);
  
  // Detect exam mode from course config or prop
  const isExamMode = examMode || questionData?.activityType === 'exam';

  // Calculate word count
  useEffect(() => {
    const words = currentAnswer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [currentAnswer]);

  // Load assessment data
  useEffect(() => {
    if (!currentUser || !currentUser.email) {
      setError("User authentication required");
      setLoading(false);
      return;
    }

    const studentEmail = currentUser.email;
    const studentKey = sanitizeEmail(studentEmail);
    
    // Check if user is staff (has @rtdacademy.com email)
    const isStaff = studentEmail && studentEmail.toLowerCase().endsWith('@rtdacademy.com');

    const loadAssessment = async () => {
      setLoading(true);
      try {
        console.log(`Loading short answer assessment: ${effectiveAssessmentId}`);

        // Use appropriate path based on whether user is staff or student
        const basePath = isStaff ? 'staff_testing' : 'students';
        const dbPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${effectiveAssessmentId}`;
        const assessmentRef = ref(db, dbPath);

        const unsubscribe = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          const validStatuses = ['active', 'exam_in_progress', 'completed', 'attempted', 'failed'];
          
          if (data) {
            // Check if the assessment has a valid status for display
            const hasValidStatus = validStatuses.includes(data.status);
            
            // If status is not valid, don't load the question (prevents loading stale data)
            if (!hasValidStatus) {
              console.log(`Assessment ${effectiveAssessmentId} has invalid status: ${data.status}. Waiting for valid status...`);
              // Don't set loading to false yet - wait for valid status
              return;
            }
            
            console.log("Short answer question data received:", data);
            
            const maxAttemptsReached = data.attempts >= data.maxAttempts;
            
            const enhancedData = {
              ...data,
              maxAttemptsReached
            };
            
            setQuestionData(enhancedData);
            setAttemptsMade(data.attempts || 0);
            
            if (data.lastSubmission) {
              setIsSubmitted(true);
              setEvaluation(data.lastSubmission.evaluation || {
                isCorrect: data.lastSubmission.isCorrect,
                score: data.lastSubmission.score,
                maxScore: data.maxPoints || data.lastSubmission.maxScore,
                percentage: data.lastSubmission.percentage,
                feedback: data.lastSubmission.feedback || 'Evaluation completed.'
              });
              setCurrentAnswer(data.lastSubmission.answer || '');
            }
          } else {
            // No data exists yet
            // In exam mode, wait for exam session to create the question
            if (isExamMode || examMode) {
              console.log(`Waiting for exam session to create question ${effectiveAssessmentId}...`);
              // Don't generate - exam session manager will create it
              // Keep loading state until exam creates the question
              return;
            }
            
            console.log("No short answer data found, generating new question");
            generateQuestion();
          }
          // Only set loading to false if we have valid data or are generating
          if ((data && validStatuses.includes(data.status)) || (!data && !isExamMode && !examMode)) {
            setLoading(false);
          }
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

    const unsubscribePromise = loadAssessment();
    
    return () => {
      unsubscribePromise?.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [currentUser, courseId, effectiveAssessmentId, db]);

  // Generate a new question
  const generateQuestion = async () => {
    if (!currentUser || !currentUser.email) return;
    
    if (isGeneratingRef.current) {
      console.log("Question generation already in progress");
      return;
    }
    
    isGeneratingRef.current = true;
    
    const now = Date.now();
    const timeSinceLastGeneration = now - lastGeneratedTimeRef.current;
    if (timeSinceLastGeneration < 2000) {
      console.log(`Debouncing question generation`);
      setTimeout(() => {
        lastGeneratedTimeRef.current = Date.now();
        generateQuestionNow();
      }, 2000 - timeSinceLastGeneration);
      return;
    }

    lastGeneratedTimeRef.current = now;
    await generateQuestionNow();
  };
  
  const generateQuestionNow = async () => {
    setRegenerating(true);
    setCurrentAnswer('');
    setEvaluation(null);
    setIsSubmitted(false);

    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const topicFromData = topic || questionData?.topic || 'general';
      const difficultyFromData = questionData?.difficulty || 'intermediate';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: effectiveAssessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };

      console.log(`Generating AI short answer question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("AI short answer question generation successful:", result);

      setRegenerating(false);
    } catch (err) {
      console.error("Error generating AI short answer question:", err);
      
      if (err.message && err.message.includes("Maximum attempts")) {
        setError("You've reached the maximum number of attempts for this question.");
      } else {
        setError("Failed to generate question: " + (err.message || err));
      }
      
      setLoading(false);
      setRegenerating(false);
    } finally {
      isGeneratingRef.current = false;
    }
  };

  // Handle exam answer save with evaluation
  const handleExamAnswerSave = async () => {
    if (!currentAnswer.trim()) {
      alert("Please write an answer before submitting");
      return;
    }

    const wordLimit = questionData?.wordLimit || { min: 5, max: 100 };
    const currentWordCount = getWordCount(currentAnswer);
    
    if (currentWordCount < (wordLimit.min || 0)) {
      alert(`Your answer is too short. Please write at least ${wordLimit.min} words.`);
      return;
    }
    
    if (currentWordCount > (wordLimit.max || 100)) {
      alert(`Your answer is too long. Please limit your response to ${wordLimit.max} words.`);
      return;
    }
    
    setSubmitting(true);
    try {
      // First evaluate the answer using the normal evaluation logic
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const evaluateParams = {
        courseId: courseId,
        assessmentId: effectiveAssessmentId,
        operation: 'evaluate',
        answer: currentAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic || questionData?.topic || 'general',
        difficulty: questionData?.difficulty || 'intermediate',
        examMode: true,
        examSessionId: examSessionId
      };

      console.log(`Evaluating exam answer for ${effectiveAssessmentId}`, evaluateParams);

      // Evaluate the answer - this will update grades in real-time
      const evaluateResult = await assessmentFunction(evaluateParams);
      console.log("Answer evaluated successfully:", evaluateResult);

      // Store the evaluation result for later display (but don't show it now)
      if (evaluateResult.data?.result) {
        // Store result locally but don't display it
        setEvaluation(evaluateResult.data.result);
        
        // Also save to exam session for tracking
        const saveExamAnswerFunction = httpsCallable(functions, 'saveExamAnswer');
        
        const saveParams = {
          courseId: courseId,
          assessmentId: effectiveAssessmentId,
          answer: currentAnswer,
          examSessionId: examSessionId,
          studentEmail: currentUser.email,
          // Include evaluation result for exam session tracking
          isCorrect: evaluateResult.data.result.isCorrect || evaluateResult.data.result.percentage >= 70,
          points: (evaluateResult.data.result.isCorrect || evaluateResult.data.result.percentage >= 70) ? (questionData?.pointsValue || 1) : 0,
          correctAnswer: 'See feedback', // AI questions don't have simple correct answers
          feedback: evaluateResult.data.result.feedback || ''
        };

        await saveExamAnswerFunction(saveParams);
      }
      
      // Notify parent component
      onExamAnswerSave(currentAnswer, effectiveAssessmentId);
      
      // Mark as saved in exam mode
      setExamAnswerSaved(true);
      
    } catch (error) {
      console.error('Error saving exam answer:', error);
      alert('Failed to save answer: ' + (error.message || error));
    } finally {
      setSubmitting(false);
    }
  };


  // Handle answer submission
  const handleSubmit = async () => {
    // In exam mode, save answer without evaluation
    if (isExamMode) {
      return handleExamAnswerSave();
    }
    
    if (!currentAnswer.trim()) {
      alert("Please write an answer before submitting");
      return;
    }

    const wordLimit = questionData?.wordLimit || { min: 5, max: 100 };
    
    if (wordCount < (wordLimit.min || 0)) {
      alert(`Your answer is too short. Please write at least ${wordLimit.min} words.`);
      return;
    }
    
    if (wordCount > (wordLimit.max || 100)) {
      alert(`Your answer is too long. Please limit your response to ${wordLimit.max} words.`);
      return;
    }

    setSubmitting(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: effectiveAssessmentId,
        operation: 'evaluate',
        answer: currentAnswer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic || questionData?.topic || 'general',
        difficulty: questionData?.difficulty || 'intermediate'
      };

      console.log(`Evaluating short answer`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Answer evaluation successful:", result);

      onAttempt(result.data?.result?.isCorrect || result.data?.result?.percentage >= 70);

      if (result.data?.result) {
        setEvaluation(result.data.result);
        setIsSubmitted(true);
        
        if (chatSheetOpen && !isExamMode) {
          await sendContextUpdateToAI(result.data.result);
        }
        
        if (result.data.result.isCorrect || result.data.result.percentage >= 70) {
          onComplete();
        }
      }
    } catch (err) {
      console.error("Error submitting answer:", err);
      
      if (err.message && err.message.includes("Maximum attempts")) {
        setError("You've reached the maximum number of attempts for this question.");
      } else {
        setError("Failed to submit your answer: " + (err.message || err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Handle question regeneration
  const handleRegenerate = () => {
    if (isGeneratingRef.current || regenerating) {
      console.log("Already regenerating a question");
      return;
    }
    
    if (questionData && questionData.attempts >= questionData.maxAttempts) {
      console.log(`Cannot regenerate - max attempts reached`);
      setError(`You have reached the maximum number of attempts.`);
      return;
    }
    
    lastGeneratedTimeRef.current = Date.now();
    
    setCurrentAnswer('');
    setEvaluation(null);
    setIsSubmitted(false);
    setRegenerating(true);
    setError(null);

    generateQuestion().catch(error => {
      console.error("Error during question regeneration:", error);
      setRegenerating(false);
      isGeneratingRef.current = false;
      setError("Failed to regenerate question: " + (error.message || error));
    });
  };

  const tryAgain = () => {
    setIsSubmitted(false);
    setEvaluation(null);
    setCurrentAnswer('');
    setError(null);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Send context update to AI chat
  const sendContextUpdateToAI = async (evaluationResult) => {
    if (!questionData || !evaluationResult) return;
    
    try {
      const functions = getFunctions();
      const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
      
      const sessionIdentifier = `ai-short-answer-${courseId}-${effectiveAssessmentId}-${questionData.timestamp || Date.now()}`;
      const STORAGE_KEY_SESSION_ID = `google_ai_chat_session_id_${sessionIdentifier}`;
      let currentSessionId = null;
      
      try {
        currentSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
      } catch (e) {
        console.warn("Could not access localStorage for session ID:", e);
      }
      
      // Create a detailed context update message
      const contextUpdateMessage = `I just submitted my short answer response and received a score of ${evaluationResult.score}/${evaluationResult.maxScore} (${evaluationResult.percentage}%). 

Feedback: "${evaluationResult.feedback}"

My answer was:
"${currentAnswer}"`;
      
      // Build complete context with transition information
      const baseContext = getAIChatContext();
      const updatedContext = {
        ...baseContext,
        questionState: {
          ...baseContext.questionState,
          isContextUpdate: true,
          previousStatus: baseContext.questionState.status,
          newStatus: 'attempted',
          status: 'attempted',
          hasAttempted: true,
          lastSubmission: {
            answer: currentAnswer,
            wordCount: wordCount,
            evaluation: evaluationResult,
            timestamp: Date.now()
          },
          answerDetails: {
            studentAnswer: currentAnswer,
            wordCount: wordCount,
            keyPointsFound: evaluationResult.keyPointsFound,
            keyPointsMissing: evaluationResult.keyPointsMissing
          }
        }
      };
      
      await sendChatMessage({
        message: contextUpdateMessage,
        sessionId: currentSessionId,
        context: updatedContext,
        model: 'gemini-2.0-flash-exp'
      });
      
      console.log('Context update sent successfully');
    } catch (error) {
      console.error('Failed to send context update to AI:', error);
    }
  };

  // Get AI chat context
  const getAIChatContext = () => {
    if (!questionData) return null;
    
    const hasAttempted = !!questionData.lastSubmission || isSubmitted;
    
    // Build the context object
    const context = {
      auth: {
        uid: currentUser?.uid,
        email: currentUser?.email
      },
      sessionInfo: {
        courseId: courseId,
        assessmentId: assessmentId,
        topic: topic || questionData.topic,
        questionType: 'shortAnswer'
      },
      questionState: {
        status: questionData.status || (hasAttempted ? 'attempted' : 'active'),
        hasAttempted: hasAttempted,
        attempts: questionData.attempts || attemptsMade,
        maxAttempts: questionData.maxAttempts,
        difficulty: questionData.difficulty,
        wordLimit: questionData.wordLimit,
        questionText: questionData.questionText
      }
    };
    
    // If student has submitted an answer, include full submission details
    if (hasAttempted && (questionData.lastSubmission || evaluation)) {
      const submission = questionData.lastSubmission || { answer: currentAnswer, evaluation: evaluation };
      const evalResult = submission.evaluation || evaluation;
      
      context.questionState.lastSubmission = {
        answer: submission.answer || currentAnswer,
        wordCount: getWordCount(submission.answer || currentAnswer),
        timestamp: submission.timestamp || Date.now(),
        isCorrect: evalResult?.isCorrect,
        score: evalResult?.score,
        maxScore: evalResult?.maxScore,
        percentage: evalResult?.percentage,
        feedback: evalResult?.feedback,
        keyPointsFound: evalResult?.keyPointsFound,
        keyPointsMissing: evalResult?.keyPointsMissing
      };
      
      // Add answer details for easier reference
      context.questionState.answerDetails = {
        studentAnswer: submission.answer || currentAnswer,
        wordCount: getWordCount(submission.answer || currentAnswer),
        keyPointsFound: evalResult?.keyPointsFound,
        keyPointsMissing: evalResult?.keyPointsMissing
      };
    }
    
    return context;
  };

  // Get AI chat instructions
  const getAIChatInstructions = () => {
    if (!questionData) return "";
    
    const baseInstructions = `You are an educational AI tutor helping a student with a short answer physics question about ${topic || 'this topic'}.`;
    
    if (questionData.status === 'active' && !questionData.lastSubmission && !isSubmitted) {
      return `${baseInstructions}
      
The student is working on a short answer question. You must:
1. NEVER write the answer for them or provide complete solutions
2. Use the Socratic method to guide their thinking
3. Help them understand what the question is asking
4. Remind them about the word limit (${questionData.wordLimit?.min || 5}-${questionData.wordLimit?.max || 100} words)

The question asks: "${questionData.questionText}"

Guide them to think about the key physics concepts without giving away the answer.`;
    } else if (questionData.lastSubmission || evaluation) {
      const evalData = evaluation || questionData.lastSubmission.evaluation;
      return `${baseInstructions}
      
The student has submitted their answer and received ${evalData.score}/${evalData.maxScore} points (${evalData.percentage}%).

Their submitted answer was:
"${questionData.lastSubmission?.answer || currentAnswer}"
(Word count: ${getWordCount(questionData.lastSubmission?.answer || currentAnswer)})

Feedback: "${evalData.feedback}"

${evalData.keyPointsFound?.length > 0 ? `Key points found: ${evalData.keyPointsFound.join(', ')}` : ''}
${evalData.keyPointsMissing?.length > 0 ? `Key points missing: ${evalData.keyPointsMissing.join(', ')}` : ''}

You can now:
1. Reference their SPECIFIC answer when discussing their performance
2. Explain why certain key points were missing
3. Help them understand the physics concepts they may have missed
4. Suggest improvements to their answer`;
    }
    
    return baseInstructions;
  };

  // Get first message for AI chat
  const getAIChatFirstMessage = () => {
    if (!questionData) return "Hello! I'm here to help you with this short answer question.";
    
    if (questionData.status === 'active' && !questionData.lastSubmission && !isSubmitted) {
      return `Hello! I see you're working on a short answer question about ${topic || 'physics'}. This question requires a ${questionData.wordLimit?.min || 5}-${questionData.wordLimit?.max || 100} word response. What would you like help understanding?`;
    } else if (questionData.lastSubmission || evaluation) {
      const evalData = evaluation || questionData.lastSubmission.evaluation;
      if (evalData && evalData.percentage !== undefined) {
        if (evalData.isCorrect || evalData.percentage >= 80) {
          return `Great job on your answer! You scored ${evalData.score}/${evalData.maxScore} points (${evalData.percentage}%). Would you like to discuss any specific parts of the question or explore the concepts further?`;
        } else if (evalData.percentage >= 60) {
          return `You scored ${evalData.score}/${evalData.maxScore} points (${evalData.percentage}%), which shows good understanding. Let's look at where you can improve. What would you like to discuss first?`;
        } else {
          return `I see you scored ${evalData.score}/${evalData.maxScore} points (${evalData.percentage}%). Let's work through the feedback together to help you understand the concepts better. What part would you like to focus on?`;
        }
      } else {
        return `I see you've submitted an answer. Let me help you understand the concepts better while your answer is being evaluated.`;
      }
    }
    
    return "Hello! I'm here to help you understand this question better.";
  };


  return (
    <>
    <div className={`rounded-lg overflow-hidden shadow-lg border ${className}`} style={{
      backgroundColor: themeColors.bgLight,
      borderColor: themeColors.border
    }}>
      {/* Header */}
      <div className="px-4 py-3 border-b"
           style={{ backgroundColor: themeColors.bgDark, borderColor: themeColors.border }}>
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-lg font-medium" style={{ color: themeColors.textDark }}>
            {questionData?.title || 'Short Answer Question'}
          </h3>
          <div className="flex items-center gap-2">
            {questionData?.generatedBy === 'ai' && (
              <span className="text-xs py-1 px-2 rounded bg-purple-100 text-purple-800 font-medium">
                AI-powered
              </span>
            )}
            {questionData && questionData.enableAIChat !== false && !isExamMode && (
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
        
        {questionData && (
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <span className="flex items-center">
              Attempts: <span className="font-medium ml-1">{questionData.attempts || 0}</span> 
              <span className="mx-1">/</span>
              {questionData.maxAttempts && questionData.maxAttempts > 500 ? (
                <Infinity className="h-3.5 w-3.5 inline-block text-gray-600" />
              ) : (
                <span className="font-medium">{questionData.maxAttempts}</span>
              )}
            </span>
            <span className="mx-3">•</span>
            <span>
              Max Points: <span className="font-medium">{questionData.maxPoints}</span>
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-100 text-red-700 border border-red-300 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <AnimatePresence mode="wait">
          {loading || regenerating ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-4"
            >
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </motion.div>
          ) : questionData ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Question Text */}
              <div className="text-gray-800 text-lg font-medium">
                {renderEnhancedText(questionData.questionText)}
              </div>

              {/* Word limit info */}
              {questionData.settings?.showWordCount !== false && (
                <div className="text-sm text-gray-600">
                  Answer length: {questionData.wordLimit?.min || 5}-{questionData.wordLimit?.max || 100} words
                </div>
              )}

              {/* Answer Input */}
              {!isSubmitted && (
                <>
                  <div className={`space-y-2 ${isExamMode && examAnswerSaved ? 'opacity-60 pointer-events-none' : ''}`}>
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Your Answer
                      </label>
                      {questionData.settings?.showWordCount !== false && (
                        <span className={`text-xs ${
                          wordCount < (questionData.wordLimit?.min || 0) 
                            ? 'text-red-600' 
                            : wordCount > (questionData.wordLimit?.max || 100)
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}>
                          {wordCount} / {questionData.wordLimit?.min || 5}-{questionData.wordLimit?.max || 100} words
                        </span>
                      )}
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      className={`min-h-[120px] resize-y ${isExamMode && examAnswerSaved ? 'cursor-not-allowed' : ''}`}
                      disabled={submitting || !!evaluation || (isExamMode && examAnswerSaved)}
                    />
                    {wordCount < (questionData.wordLimit?.min || 0) && wordCount > 0 && (
                      <p className="text-xs text-red-600">
                        Minimum {questionData.wordLimit?.min} words required
                      </p>
                    )}
                    {wordCount > (questionData.wordLimit?.max || 100) && (
                      <p className="text-xs text-red-600">
                        Maximum {questionData.wordLimit?.max} words allowed
                      </p>
                    )}
                  </div>

                  {/* Submit Button or Saved State */}
                  {isExamMode && examAnswerSaved ? (
                    <div className="flex items-center justify-center p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Saved</span>
                    </div>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || !currentAnswer.trim() || wordCount < (questionData.wordLimit?.min || 0) || wordCount > (questionData.wordLimit?.max || 100)}
                      style={{
                        backgroundColor: themeColors.accent,
                        color: 'white',
                      }}
                      className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md"
                    >
                      {submitting ? (isExamMode ? 'Saving...' : 'Evaluating...') : (isExamMode ? 'Save Answer' : 'Submit Answer')}
                    </Button>
                  )}
                </>
              )}

              {/* Result Display - hidden in exam mode unless exam is completed */}
              {evaluation && (!isExamMode || false) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Overall Score */}
                  <Card className={`${
                    evaluation.percentage >= 80 
                      ? 'border-green-200 bg-green-50' 
                      : evaluation.percentage >= 60 
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">
                            {evaluation.score} / {evaluation.maxScore}
                          </h3>
                          <p className="text-sm text-gray-600">Total Score</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {evaluation.percentage}%
                          </div>
                          <Badge 
                            variant={evaluation.percentage >= 80 ? 'default' : evaluation.percentage >= 60 ? 'secondary' : 'destructive'}
                          >
                            {evaluation.isCorrect ? 'Correct' : evaluation.percentage >= 80 ? 'Excellent' : evaluation.percentage >= 60 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <Progress value={evaluation.percentage} className="h-2 mb-4" />
                      
                      {/* Feedback */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Feedback</h4>
                        <div className="text-sm text-gray-700">{renderEnhancedText(evaluation.feedback)}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Key points found/missing */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {evaluation.keyPointsFound && evaluation.keyPointsFound.length > 0 && (
                      <Card className="border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Key Points Identified
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            {evaluation.keyPointsFound.map((point, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-600 mt-0.5">•</span>
                                <div>{renderEnhancedText(point)}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    
                    {evaluation.keyPointsMissing && evaluation.keyPointsMissing.length > 0 && (
                      <Card className="border-amber-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Key Points Missing
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            {evaluation.keyPointsMissing.map((point, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <div>{renderEnhancedText(point)}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Student's Answer Display */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      View Your Answer
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentAnswer}</p>
                      <p className="text-xs text-gray-500 mt-2">Word count: {wordCount}</p>
                    </div>
                  </details>

                  {/* Action Buttons - hide regenerate in exam mode */}
                  <div className="mt-4">
                    {!isExamMode && !questionData.maxAttemptsReached && questionData.attempts < questionData.maxAttempts && (
                      <div className="flex gap-2">
                        {!evaluation.isCorrect && (
                          <Button
                            onClick={tryAgain}
                            variant="outline"
                            className="flex-1"
                          >
                            Try Again
                          </Button>
                        )}
                        <Button
                          onClick={() => handleRegenerate()}
                          style={{
                            backgroundColor: themeColors.accent,
                            color: 'white',
                          }}
                          className="flex-1 text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
                        >
                          <RefreshCw className="w-4 h-4 mr-1.5" />
                          New Question
                        </Button>
                      </div>
                    )}
                    
                    {questionData.maxAttemptsReached && (
                      <div className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Maximum attempts reached</p>
                        <p>You have used all {questionData.maxAttempts} attempts for this assessment.</p>
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
        <div className="flex h-screen">
          {/* Left side - Question and Answer (hidden on mobile) */}
          <div className="hidden md:block md:w-1/2 border-r overflow-y-auto p-6 bg-gray-50">
            <div className="max-w-2xl mx-auto space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Question</h3>
                <div className="text-gray-700">{renderEnhancedText(questionData?.questionText)}</div>
              </div>
              
              {currentAnswer && (
                <div>
                  <h4 className="font-medium mb-2">Your Answer</h4>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{currentAnswer}</p>
                  </div>
                </div>
              )}
              
              {evaluation && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium mb-2">Your Score</h4>
                  <p className="text-2xl font-bold">{evaluation.score} / {evaluation.maxScore} ({evaluation.percentage}%)</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Chat (full width on mobile, half width on desktop) */}
          <div className="w-full md:w-1/2 h-full">
            {questionData && (
              <GoogleAIChatApp
                sessionIdentifier={`ai-short-answer-${courseId}-${effectiveAssessmentId}-${questionData.timestamp || Date.now()}`}
                instructions={getAIChatInstructions()}
                firstMessage={getAIChatFirstMessage()}
                showYouTube={false}
                showUpload={false}
                allowContentRemoval={false}
                showResourcesAtTop={false}
                context={getAIChatContext()}
                aiChatContext={questionData.aiChatContext}
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
    }
  };

  return themes[theme] || themes.purple;
}

export default AIShortAnswerQuestion;