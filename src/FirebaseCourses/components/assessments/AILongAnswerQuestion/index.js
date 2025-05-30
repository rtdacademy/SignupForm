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
  ChevronDown, 
  ChevronUp, 
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
 * Component to display a single criterion with expandable levels
 */
const RubricCriterion = ({ criterion, index, score, hasScore }) => {
  const [isLevelsExpanded, setIsLevelsExpanded] = useState(false);
  const percentage = hasScore ? (score.score / criterion.points) * 100 : 0;
  
  // Convert levels from array or object format to a consistent format
  const getLevels = () => {
    if (!criterion.levels) return null;
    
    // If levels is an array, convert to object format
    if (Array.isArray(criterion.levels)) {
      const levelsObj = {};
      criterion.levels.forEach((level, index) => {
        levelsObj[index] = level;
      });
      return levelsObj;
    }
    
    // If it's already an object, return as is
    return criterion.levels;
  };
  
  const levels = getLevels();
  
  return (
    <div 
      key={index} 
      className={`rounded-lg border transition-all ${
        hasScore 
          ? percentage >= 80 
            ? 'border-green-200 bg-green-50' 
            : percentage >= 50 
              ? 'border-yellow-200 bg-yellow-50'
              : 'border-red-200 bg-red-50'
          : 'border-gray-200 bg-gray-50'
      }`}
    >
      {/* Main criterion header */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm flex-1">{criterion.criterion}</h4>
          <div className="flex items-center gap-2">
            {hasScore ? (
              <>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {score.score} / {criterion.points}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(percentage)}%
                  </div>
                </div>
                {percentage >= 80 && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                {percentage < 50 && percentage >= 0 && <XCircle className="w-4 h-4 text-red-600" />}
              </>
            ) : (
              <Badge variant="outline" className="text-xs">
                {criterion.points} points
              </Badge>
            )}
          </div>
        </div>
        
        <div className="text-xs text-gray-600">{renderEnhancedText(criterion.description)}</div>
        
        {/* Show levels toggle if levels exist */}
        {levels && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLevelsExpanded(!isLevelsExpanded);
            }}
            className="mt-2 text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            {isLevelsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {isLevelsExpanded ? 'Hide' : 'Show'} scoring levels
          </button>
        )}
        
        {hasScore && score.feedback && (
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs text-gray-700">
              <span className="font-medium">Feedback:</span> {renderEnhancedText(score.feedback)}
            </div>
          </div>
        )}
        
        {hasScore && (
          <div className="mt-2">
            <Progress value={percentage} className="h-1.5" />
          </div>
        )}
      </div>
      
      {/* Expandable levels section */}
      <AnimatePresence>
        {isLevelsExpanded && levels && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5">
              {Object.keys(levels)
                .map(Number)
                .sort((a, b) => b - a) // Sort descending (highest score first)
                .map((levelScore) => (
                <div 
                  key={levelScore}
                  className={`p-2 rounded text-xs border ${
                    hasScore && score.score === levelScore
                      ? 'border-blue-400 bg-blue-50 font-medium'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`font-medium ${
                      hasScore && score.score === levelScore ? 'text-blue-700' : 'text-gray-600'
                    }`}>
                      {levelScore} {levelScore === 1 ? 'point' : 'points'}:
                    </span>
                    <span className={
                      hasScore && score.score === levelScore ? 'text-blue-900' : 'text-gray-700'
                    }>
                      {levels[levelScore] || `Level ${levelScore} description not available`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Component to display the scoring rubric
 */
const RubricDisplay = ({ rubric, showScores = false, rubricScores = [] }) => {
  const [isExpanded, setIsExpanded] = useState(showScores);
  
  const getScoreForCriterion = (criterionName) => {
    return rubricScores.find(score => score.criterion === criterionName);
  };
  
  return (
    <Card className="mb-4">
      <CardHeader 
        className="cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">
            {showScores ? 'Scoring Breakdown' : 'Scoring Rubric'}
          </CardTitle>
          <div className="flex items-center gap-2">
            {showScores && (
              <Badge variant="secondary">
                Total: {rubricScores.reduce((sum, s) => sum + s.score, 0)} / {rubric.reduce((sum, r) => sum + r.points, 0)}
              </Badge>
            )}
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </CardHeader>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <CardContent>
              <div className="space-y-3">
                {rubric.map((criterion, index) => {
                  const score = getScoreForCriterion(criterion.criterion);
                  const hasScore = showScores && score;
                  
                  return (
                    <RubricCriterion
                      key={index}
                      criterion={criterion}
                      index={index}
                      score={score}
                      hasScore={hasScore}
                    />
                  );
                })}
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

/**
 * AI Long Answer Question Component
 * Handles generation, display, and evaluation of long answer questions with AI-powered rubric scoring
 */
const AILongAnswerQuestion = ({
  // Required props
  courseId,
  assessmentId,
  cloudFunctionName,
  topic,

  // Styling props
  theme = 'purple',
  className = '',
  
  // Callback functions
  onComplete = () => {},
  onAttempt = () => {},
}) => {
  // Authentication and state
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [answer, setAnswer] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  
  // Refs
  const textareaRef = useRef(null);
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Get theme colors
  const activeTheme = question?.settings?.theme || theme;
  const themeColors = getThemeColors(activeTheme);

  // Calculate word count
  useEffect(() => {
    const words = answer.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(words.length);
  }, [answer]);

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
        console.log(`Loading long answer assessment: ${assessmentId}`);

        // Use appropriate path based on whether user is staff or student
        const basePath = isStaff ? 'staff_testing' : 'students';
        const dbPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`;
        const assessmentRef = ref(db, dbPath);

        const unsubscribe = onValue(assessmentRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            console.log("Long answer question data received:", data);
            
            const maxAttemptsReached = data.attempts >= data.maxAttempts;
            
            const enhancedData = {
              ...data,
              maxAttemptsReached
            };
            
            setQuestion(enhancedData);
            
            if (data.difficulty && !selectedDifficulty) {
              setSelectedDifficulty(data.difficulty);
            }
            
            if (data.lastSubmission) {
              setResult(data.lastSubmission.evaluation);
              setAnswer(data.lastSubmission.answer || '');
            }
          } else {
            console.log("No long answer data found, generating new question");
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

    const unsubscribePromise = loadAssessment();
    
    return () => {
      unsubscribePromise?.then(unsubscribe => unsubscribe && unsubscribe());
    };
  }, [currentUser, courseId, assessmentId, db]);

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
    setAnswer('');
    setResult(null);

    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const topicFromData = topic || question?.topic || 'general';
      const difficultyFromData = selectedDifficulty || question?.difficulty || 'intermediate';
      
      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };

      console.log(`Generating AI long answer question`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("AI long answer question generation successful:", result);

      setRegenerating(false);
    } catch (err) {
      console.error("Error generating AI long answer question:", err);
      
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

  // Handle answer submission
  const handleSubmit = async () => {
    if (!answer.trim()) {
      alert("Please write an answer before submitting");
      return;
    }

    const wordLimit = question?.wordLimit || { min: 50, max: 500 };
    
    if (wordCount < (wordLimit.min || 0)) {
      alert(`Your answer is too short. Please write at least ${wordLimit.min} words.`);
      return;
    }
    
    if (wordCount > (wordLimit.max || 5000)) {
      alert(`Your answer is too long. Please limit your response to ${wordLimit.max} words.`);
      return;
    }

    setSubmitting(true);
    try {
      const assessmentFunction = httpsCallable(functions, cloudFunctionName);

      const functionParams = {
        courseId: courseId,
        assessmentId: assessmentId,
        operation: 'evaluate',
        answer: answer,
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topic || question?.topic || 'general',
        difficulty: question?.difficulty || 'intermediate'
      };

      console.log(`Evaluating long answer`, functionParams);

      const result = await assessmentFunction(functionParams);
      console.log("Answer evaluation successful:", result);

      onAttempt(result.data?.result?.percentage >= 70);

      if (result.data?.result) {
        setResult(result.data.result);
        
        if (chatSheetOpen) {
          await sendContextUpdateToAI(result.data.result);
        }
        
        if (result.data.result.percentage >= 70) {
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
  const handleRegenerate = (customDifficulty = null) => {
    if (isGeneratingRef.current || regenerating) {
      console.log("Already regenerating a question");
      return;
    }
    
    if (question && question.attempts >= question.maxAttempts) {
      console.log(`Cannot regenerate - max attempts reached`);
      setError(`You have reached the maximum number of attempts.`);
      return;
    }
    
    lastGeneratedTimeRef.current = Date.now();
    
    setAnswer('');
    setResult(null);
    setRegenerating(true);
    setError(null);

    if (customDifficulty) {
      setSelectedDifficulty(customDifficulty);
    }

    generateQuestion().catch(error => {
      console.error("Error during question regeneration:", error);
      setRegenerating(false);
      isGeneratingRef.current = false;
      setError("Failed to regenerate question: " + (error.message || error));
    });
  };

  // Send context update to AI chat
  const sendContextUpdateToAI = async (evaluationResult) => {
    if (!question || !evaluationResult) return;
    
    try {
      const functions = getFunctions();
      const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
      
      const sessionIdentifier = `${courseId}_${assessmentId}`;
      const STORAGE_KEY_SESSION_ID = `google_ai_chat_session_id_${sessionIdentifier}`;
      let currentSessionId = null;
      
      try {
        currentSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
      } catch (e) {
        console.warn("Could not access localStorage for session ID:", e);
      }
      
      // Create a detailed context update message
      const rubricDetails = evaluationResult.rubricScores.map(score => 
        `${score.criterion}: ${score.score}/${score.maxPoints}`
      ).join(', ');
      
      const contextUpdateMessage = `I just submitted my long answer response and received a score of ${evaluationResult.totalScore}/${evaluationResult.maxScore} (${evaluationResult.percentage}%). 

Rubric breakdown: ${rubricDetails}

Overall feedback: "${evaluationResult.overallFeedback}"

My answer was:
"${answer}"`;
      
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
            answer: answer, // Full answer text
            wordCount: wordCount,
            evaluation: evaluationResult,
            timestamp: Date.now()
          },
          answerDetails: {
            studentAnswer: answer,
            wordCount: wordCount,
            rubricBreakdown: evaluationResult.rubricScores?.map(score => ({
              criterion: score.criterion,
              score: score.score,
              maxPoints: score.maxPoints,
              feedback: score.feedback
            }))
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
    if (!question) return null;
    
    const hasAttempted = !!question.lastSubmission;
    
    // Build the context object
    const context = {
      auth: {
        uid: currentUser?.uid,
        email: currentUser?.email
      },
      sessionInfo: {
        courseId: courseId,
        assessmentId: assessmentId,
        topic: topic || question.topic,
        questionType: 'longAnswer'
      },
      questionState: {
        status: question.status,
        hasAttempted: hasAttempted,
        attempts: question.attempts,
        maxAttempts: question.maxAttempts,
        difficulty: question.difficulty,
        rubric: question.rubric,
        wordLimit: question.wordLimit,
        questionText: question.questionText
      }
    };
    
    // If student has submitted an answer, include full submission details
    if (hasAttempted && question.lastSubmission) {
      const submission = question.lastSubmission;
      const evaluation = submission.evaluation || submission;
      
      context.questionState.lastSubmission = {
        answer: submission.answer || answer, // Full answer text
        wordCount: submission.wordCount,
        timestamp: submission.timestamp,
        totalScore: evaluation.totalScore,
        maxScore: evaluation.maxScore,
        percentage: evaluation.percentage,
        overallFeedback: evaluation.overallFeedback,
        rubricScores: evaluation.rubricScores, // Detailed rubric scores
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
        suggestions: evaluation.suggestions
      };
      
      // Add answer details for easier reference
      context.questionState.answerDetails = {
        studentAnswer: submission.answer || answer,
        wordCount: submission.wordCount,
        // Map rubric scores for easy access
        rubricBreakdown: evaluation.rubricScores?.map(score => ({
          criterion: score.criterion,
          score: score.score,
          maxPoints: score.maxPoints,
          feedback: score.feedback
        }))
      };
    }
    
    return context;
  };

  // Get AI chat instructions
  const getAIChatInstructions = () => {
    if (!question) return "";
    
    const baseInstructions = `You are an educational AI tutor helping a student with a long answer physics question about ${topic || 'this topic'}.`;
    
    if (question.status === 'active' && !question.lastSubmission) {
      return `${baseInstructions}
      
The student is working on a long answer question that will be graded according to a specific rubric. You must:
1. NEVER write the answer for them or provide complete solutions
2. Use the Socratic method to guide their thinking
3. Help them understand what each rubric criterion is asking for
4. Encourage them to organize their thoughts before writing
5. Remind them about the word limit (${question.wordLimit?.min || 50}-${question.wordLimit?.max || 500} words)

The question asks: "${question.questionText}"

The rubric criteria are:
${question.rubric.map(r => `- ${r.criterion} (${r.points} points): ${r.description}`).join('\n')}

Guide them to address each criterion in their answer without giving away the content.`;
    } else if (question.lastSubmission) {
      const evaluation = question.lastSubmission.evaluation || question.lastSubmission;
      return `${baseInstructions}
      
The student has submitted their answer and received ${evaluation.totalScore}/${evaluation.maxScore} points (${evaluation.percentage}%).

Their submitted answer was:
"${question.lastSubmission.answer}"
(Word count: ${question.lastSubmission.wordCount})

Their detailed rubric scores were:
${evaluation.rubricScores.map(s => `- ${s.criterion}: ${s.score}/${s.maxPoints} - ${s.feedback}`).join('\n')}

Overall feedback: "${evaluation.overallFeedback}"

Strengths identified: ${evaluation.strengths?.join(', ') || 'None specified'}
Areas for improvement: ${evaluation.improvements?.join(', ') || 'None specified'}

You can now:
1. Reference their SPECIFIC answer when discussing their performance
2. Point to exact parts of their response that earned or lost points
3. Explain why specific rubric criteria were not fully met
4. Suggest concrete improvements to their actual answer
5. Help them understand the physics concepts they may have missed`;
    }
    
    return baseInstructions;
  };

  // Get first message for AI chat
  const getAIChatFirstMessage = () => {
    if (!question) return "Hello! I'm here to help you with this long answer question.";
    
    if (question.status === 'active' && !question.lastSubmission) {
      return `Hello! I see you're working on a long answer question about ${topic || 'physics'}. This question has ${question.rubric.length} scoring criteria worth ${question.maxPoints} total points. Would you like help organizing your thoughts or understanding what the rubric is looking for?`;
    } else if (question.lastSubmission) {
      const evaluation = question.lastSubmission.evaluation;
      if (evaluation.percentage >= 80) {
        return `Great job on your answer! You scored ${evaluation.totalScore}/${evaluation.maxScore} points (${evaluation.percentage}%). Would you like to discuss any specific parts of the rubric or explore the concepts further?`;
      } else if (evaluation.percentage >= 60) {
        return `You scored ${evaluation.totalScore}/${evaluation.maxScore} points (${evaluation.percentage}%), which shows good understanding. Let's look at where you can improve. Which rubric criterion would you like to discuss first?`;
      } else {
        return `I see you scored ${evaluation.totalScore}/${evaluation.maxScore} points (${evaluation.percentage}%). Let's work through the feedback together to help you understand the concepts better. What part of the question or rubric would you like to focus on?`;
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
            {question?.title || 'Long Answer Question'}
          </h3>
          <div className="flex items-center gap-2">
            {question?.generatedBy === 'ai' && (
              <span className="text-xs py-1 px-2 rounded bg-purple-100 text-purple-800 font-medium">
                AI-powered
              </span>
            )}
            {question && question.enableAIChat !== false && (
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
        
        {question && (
          <div className="flex items-center text-xs text-gray-600 mt-1">
            <span className="flex items-center">
              Attempts: <span className="font-medium ml-1">{question.attempts || 0}</span> 
              <span className="mx-1">/</span>
              {question.maxAttempts && question.maxAttempts > 500 ? (
                <Infinity className="h-3.5 w-3.5 inline-block text-gray-600" />
              ) : (
                <span className="font-medium">{question.maxAttempts}</span>
              )}
            </span>
            <span className="mx-3">•</span>
            <span>
              Max Points: <span className="font-medium">{question.maxPoints}</span>
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
                <div className="h-32 bg-gray-200 rounded"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : question ? (
            <motion.div
              key="question"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {/* Difficulty Selection - only show after first attempt */}
              {question.settings?.allowDifficultySelection && !result && question.attempts > 0 && (
                <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Choose Difficulty Level:</h4>
                  <div className="flex gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => {
                          setSelectedDifficulty(difficulty);
                          if (question.difficulty !== difficulty) {
                            handleRegenerate(difficulty);
                          }
                        }}
                        className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                          (selectedDifficulty || question.difficulty) === difficulty
                            ? 'bg-blue-100 border-blue-300 text-blue-800'
                            : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Question Text */}
              <div className="text-gray-800 text-lg font-medium">
                {renderEnhancedText(question.questionText)}
              </div>

              {/* Rubric Display */}
              {question.settings?.showRubric !== false && (
                <RubricDisplay 
                  rubric={question.rubric} 
                  showScores={!!result}
                  rubricScores={result?.rubricScores || []}
                />
              )}

              {/* Answer Input */}
              {!result && (
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        Your Answer
                      </label>
                      {question.settings?.showWordCount !== false && (
                        <span className={`text-xs ${
                          wordCount < (question.wordLimit?.min || 0) 
                            ? 'text-red-600' 
                            : wordCount > (question.wordLimit?.max || 500)
                              ? 'text-red-600'
                              : 'text-gray-600'
                        }`}>
                          {wordCount} / {question.wordLimit?.min || 50}-{question.wordLimit?.max || 500} words
                        </span>
                      )}
                    </div>
                    <Textarea
                      ref={textareaRef}
                      value={answer}
                      onChange={(e) => setAnswer(e.target.value)}
                      placeholder="Write your answer here..."
                      className="min-h-[200px] resize-y"
                      disabled={submitting || !!result}
                    />
                    {wordCount < (question.wordLimit?.min || 0) && wordCount > 0 && (
                      <p className="text-xs text-red-600">
                        Minimum {question.wordLimit?.min} words required
                      </p>
                    )}
                    {wordCount > (question.wordLimit?.max || 500) && (
                      <p className="text-xs text-red-600">
                        Maximum {question.wordLimit?.max} words allowed
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim() || wordCount < (question.wordLimit?.min || 0) || wordCount > (question.wordLimit?.max || 500)}
                    style={{
                      backgroundColor: themeColors.accent,
                      color: 'white',
                    }}
                    className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md"
                  >
                    {submitting ? 'Evaluating...' : 'Submit Answer'}
                  </Button>
                </>
              )}

              {/* Result Display */}
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="space-y-4"
                >
                  {/* Overall Score */}
                  <Card className={`${
                    result.percentage >= 80 
                      ? 'border-green-200 bg-green-50' 
                      : result.percentage >= 60 
                        ? 'border-yellow-200 bg-yellow-50'
                        : 'border-red-200 bg-red-50'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h3 className="text-2xl font-bold">
                            {result.totalScore} / {result.maxScore}
                          </h3>
                          <p className="text-sm text-gray-600">Total Score</p>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold">
                            {result.percentage}%
                          </div>
                          <Badge 
                            variant={result.percentage >= 80 ? 'default' : result.percentage >= 60 ? 'secondary' : 'destructive'}
                          >
                            {result.percentage >= 80 ? 'Excellent' : result.percentage >= 60 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <Progress value={result.percentage} className="h-2 mb-4" />
                      
                      {/* Overall Feedback */}
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm">Overall Feedback</h4>
                        <div className="text-sm text-gray-700">{renderEnhancedText(result.overallFeedback)}</div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Strengths and Improvements */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {result.strengths && result.strengths.length > 0 && (
                      <Card className="border-green-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            Strengths
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            {result.strengths.map((strength, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-green-600 mt-0.5">•</span>
                                <div>{renderEnhancedText(strength)}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                    
                    {result.improvements && result.improvements.length > 0 && (
                      <Card className="border-amber-200">
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-amber-600" />
                            Areas for Improvement
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs space-y-1">
                            {result.improvements.map((improvement, index) => (
                              <li key={index} className="flex items-start gap-1">
                                <span className="text-amber-600 mt-0.5">•</span>
                                <div>{renderEnhancedText(improvement)}</div>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Suggestions */}
                  {result.suggestions && (
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Suggestions for Next Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-sm text-gray-700">{renderEnhancedText(result.suggestions)}</div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Student's Answer Display */}
                  <details className="group">
                    <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                      View Your Answer
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
                      <p className="text-xs text-gray-500 mt-2">Word count: {wordCount}</p>
                    </div>
                  </details>

                  {/* Action Buttons */}
                  <div className="mt-4">
                    {!question.maxAttemptsReached && question.attempts < question.maxAttempts && (
                      <Button
                        onClick={() => handleRegenerate()}
                        style={{
                          backgroundColor: themeColors.accent,
                          color: 'white',
                        }}
                        className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:shadow-md"
                      >
                        <RefreshCw className="w-4 h-4 mr-1.5" />
                        Try a New Question
                      </Button>
                    )}
                    
                    {question.maxAttemptsReached && (
                      <div className="text-amber-700 bg-amber-50 border border-amber-200 p-3 rounded-md text-sm">
                        <p className="font-medium mb-1">Maximum attempts reached</p>
                        <p>You have used all {question.maxAttempts} attempts for this assessment.</p>
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
                <div className="text-gray-700">{renderEnhancedText(question?.questionText)}</div>
              </div>
              
              {question && (
                <RubricDisplay 
                  rubric={question.rubric} 
                  showScores={!!result}
                  rubricScores={result?.rubricScores || []}
                />
              )}
              
              {answer && (
                <div>
                  <h4 className="font-medium mb-2">Your Answer</h4>
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{answer}</p>
                  </div>
                </div>
              )}
              
              {result && (
                <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                  <h4 className="font-medium mb-2">Your Score</h4>
                  <p className="text-2xl font-bold">{result.totalScore} / {result.maxScore} ({result.percentage}%)</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Right side - Chat (full width on mobile, half width on desktop) */}
          <div className="w-full md:w-1/2 h-full">
            {question && (
              <GoogleAIChatApp
                sessionIdentifier={`${courseId}_${assessmentId}`}
                instructions={getAIChatInstructions()}
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
    }
  };

  return themes[theme] || themes.purple;
}

export default AILongAnswerQuestion;