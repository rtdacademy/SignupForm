import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Infinity, MessageCircle } from 'lucide-react';
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
  lessonPath,              // Lesson path (required for database assessments)
  course,                  // Course object (optional - not used for database access anymore)
  topic,                   // Topic for question generation (optional)

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
  console.log("Component render - loading state:", loading);
  const [error, setError] = useState(null);
  const [question, setQuestion] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [regenerating, setRegenerating] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [chatSheetOpen, setChatSheetOpen] = useState(false);
  
  // Refs for debouncing and preventing multiple calls
  const isGeneratingRef = useRef(false);
  const lastGeneratedTimeRef = useRef(0);
  const regenerationTimeoutRef = useRef(null);

  // Firebase references
  const functions = getFunctions();
  const db = getDatabase();

  // Get theme colors - use theme from question settings if available, otherwise use prop
  const activeTheme = question?.settings?.theme || theme;
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
    
    // Check if user is staff (has @rtdacademy.com email)
    const isStaff = studentEmail && studentEmail.toLowerCase().endsWith('@rtdacademy.com');

    // Listen for assessment data in the database
    let unsubscribeRef = null;
    
    const loadAssessment = () => {
      setLoading(true);
      try {
        // Use appropriate path based on whether user is staff or student
        const basePath = isStaff ? 'staff_testing' : 'students';
        const dbPath = `${basePath}/${studentKey}/courses/${courseId}/Assessments/${assessmentId}`;
        console.log(`Creating database ref for question: ${dbPath}`);

        // Setup firebase database listener
        const assessmentRef = ref(db, dbPath);

        unsubscribeRef = onValue(assessmentRef, (snapshot) => {
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
            console.log("No AI question data found in database, generating new question");
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
  }, [currentUser, courseId, assessmentId, db]);

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
        assessmentId: assessmentId,
        operation: 'generate',
        studentEmail: currentUser.email,
        userId: currentUser.uid,
        topic: topicFromData,
        difficulty: difficultyFromData
      };
      
      // Add lessonPath for database assessments
      if (cloudFunctionName === 'generateDatabaseAssessment' && lessonPath) {
        functionParams.lessonPath = lessonPath;
      }

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
      // Use current difficulty from question data for evaluation
      const topicFromData = topic || question?.topic || 'general';
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
      
      // Add lessonPath for database assessments
      if (cloudFunctionName === 'generateDatabaseAssessment' && lessonPath) {
        functionParams.lessonPath = lessonPath;
      }

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
        
        // Send automatic context update to AI chat if chat sheet is open
        if (chatSheetOpen) {
          await sendContextUpdateToAI(result.data.result);
        }
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

  // Send automatic context update to AI chat when question is answered
  const sendContextUpdateToAI = async (submissionResult) => {
    if (!question || !submissionResult) return;
    
    try {
      console.log('Sending context update to AI chat:', submissionResult);
      console.log('Current selectedAnswer state:', selectedAnswer);
      
      // Import Firebase functions if needed
      const functions = getFunctions();
      const sendChatMessage = httpsCallable(functions, 'sendChatMessage');
      
      // Get the current session ID from localStorage (matching GoogleAIChatApp pattern)
      const sessionIdentifier = `${courseId}_${assessmentId}`;
      const STORAGE_KEY_SESSION_ID = `google_ai_chat_session_id_${sessionIdentifier}`;
      let currentSessionId = null;
      
      try {
        currentSessionId = localStorage.getItem(STORAGE_KEY_SESSION_ID);
      } catch (e) {
        console.warn("Could not access localStorage for session ID:", e);
      }
      
      // Create context update message based on result
      const isCorrect = submissionResult.isCorrect;
      // Use the component's selectedAnswer state if submissionResult.answer is null
      const actualSelectedAnswer = submissionResult.answer || selectedAnswer;
      const correctAnswer = submissionResult.correctOptionId;
      const feedback = submissionResult.feedback;
      
      console.log('Using actualSelectedAnswer:', actualSelectedAnswer);
      
      // Find the actual answer text
      const selectedOption = question.options.find(opt => opt.id === actualSelectedAnswer);
      const correctOption = question.options.find(opt => opt.id === correctAnswer);
      
      const contextUpdateMessage = isCorrect 
        ? `I just answered this question and selected option ${actualSelectedAnswer?.toUpperCase()}: "${selectedOption?.text}" which was correct!`
        : `I just answered this question and selected option ${actualSelectedAnswer?.toUpperCase()}: "${selectedOption?.text}", but the correct answer was option ${correctAnswer?.toUpperCase()}: "${correctOption?.text}". The feedback said: "${feedback}"`;
      
      // Create updated context with the new submission (following Genkit patterns)
      const baseContext = getAIChatContext();
      const updatedContext = {
        ...baseContext,
        // Update question state for transition
        questionState: {
          ...baseContext.questionState,
          status: 'attempted',
          hasAttempted: true,
          // Add transition flags
          isContextUpdate: true,
          previousStatus: 'active',
          newStatus: 'attempted',
          // Include the fresh submission data
          lastSubmission: {
            selectedAnswer: actualSelectedAnswer,
            isCorrect: isCorrect,
            feedback: feedback,
            correctOptionId: correctAnswer,
            timestamp: Date.now()
          },
          // Add answer details for the AI
          answerDetails: {
            studentAnswerText: selectedOption?.text,
            correctAnswerText: correctOption?.text,
            studentSelectedOption: actualSelectedAnswer?.toUpperCase(),
            correctOption: correctAnswer?.toUpperCase()
          }
        }
      };
      
      console.log('Sending context update with:', {
        message: contextUpdateMessage,
        sessionId: currentSessionId,
        context: updatedContext
      });
      
      // Send the context update message
      await sendChatMessage({
        message: contextUpdateMessage,
        sessionId: currentSessionId, // Use existing session if available
        context: updatedContext,
        model: 'gemini-2.0-flash-exp' // Use the same model as the chat
      });
      
      console.log('Context update sent successfully');
    } catch (error) {
      console.error('Failed to send context update to AI:', error);
      // Don't throw - this is optional functionality that shouldn't break the main flow
    }
  };

  // Generate AI chat instructions based on question status
  const getAIChatInstructions = () => {
    if (!question) return "";
    
    const baseInstructions = `You are an educational AI tutor helping a student with a physics question about ${topic || 'this topic'}.`;
    
    if (question.status === 'active') {
      // Student hasn't answered yet - use Socratic method, never give away answer
      return `${baseInstructions}
      
IMPORTANT: The student has NOT yet answered this question. You must:
1. NEVER directly provide the answer or indicate which option is correct
2. Use the Socratic method - ask guiding questions to help them think
3. Help them understand the concepts needed to solve the problem
4. Encourage them to work through the problem step by step
5. If they ask for the answer directly, politely remind them that you're here to help them learn by guiding their thinking

The question asks: "${question.questionText}"

Remember: Your goal is to help them learn and understand, not to give them the answer.`;
    } else if (question.status === 'attempted' || question.status === 'completed' || question.lastSubmission) {
      // Student has attempted - can discuss answer more freely
      const isCorrect = question.lastSubmission?.isCorrect;
      return `${baseInstructions}
      
The student has already attempted this question. They selected option ${question.lastSubmission?.answer?.toUpperCase()} and their answer was ${isCorrect ? 'CORRECT' : 'INCORRECT'}.

${isCorrect ? 
  'Since they got it right, help reinforce their understanding and explore related concepts.' : 
  'Since they got it wrong, you can now freely discuss why their answer was incorrect and explain the correct answer.'}

The correct answer was option ${question.lastSubmission?.correctOptionId?.toUpperCase()}.

You can now:
1. Explain why the correct answer is right
2. Discuss common misconceptions
3. Provide additional examples
4. Help them understand the underlying concepts more deeply`;
    }
    
    return baseInstructions;
  };

  // Generate initial AI chat message based on status
  const getAIChatFirstMessage = () => {
    if (!question) return "Hello! I'm here to help you with this question.";
    
    if (question.status === 'active') {
      return "Hello! I see you're working on a momentum question. I'm here to help guide your thinking. What part of the problem would you like to explore first?";
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
        assessmentId: assessmentId,
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

  // Render the question content (extracted for reuse in Sheet)
  const renderQuestionContent = () => {
    if (!question) return null;

    return (
      <div className="space-y-4">
        {/* Error display */}
        {error && (
          <div className="p-3 rounded bg-red-100 text-red-700 border border-red-300">
            {error}
          </div>
        )}

        {/* Loading state */}
        {(loading || regenerating) ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-10 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Difficulty Selection for Assignments */}
            {question.settings?.allowDifficultySelection && (
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Choose Difficulty Level:</h4>
                <div className="flex gap-2">
                  {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                    <button
                      key={difficulty}
                      onClick={() => {
                        setSelectedDifficulty(difficulty);
                        // If this is a free regeneration on difficulty change, trigger regeneration
                        if (question.settings?.freeRegenerationOnDifficultyChange && question.difficulty !== difficulty) {
                          handleRegenerate();
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
                {selectedDifficulty && selectedDifficulty !== question.difficulty && (
                  <p className="text-xs text-blue-600 mt-1">
                    Click "Generate New AI Question" to apply difficulty change
                  </p>
                )}
              </div>
            )}

            {/* Question Text */}
            <div className="text-gray-800 text-lg font-medium">
              {renderEnhancedText(question.questionText)}
            </div>

            {/* Options */}
            <div className="space-y-2.5">
              {question.options?.map((option, index) => (
                <motion.div
                  key={option.id}
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
                  <div className="text-gray-700 flex-grow cursor-pointer" onClick={() => !result && setSelectedAnswer(option.id)}>
                    {renderEnhancedText(option.text)}
                  </div>

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
                className="w-full text-white font-medium py-2 px-4 rounded transition-all duration-200 hover:opacity-90 hover:shadow-md"
              >
                {submitting ? 'Submitting...' : 'Submit Answer'}
              </Button>
            )}

            {/* Result feedback */}
            {result && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className={`p-4 rounded-md shadow-sm ${
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

                {/* For generating a new AI question */}
                <div className="mt-4">
                  {result && !question.maxAttemptsReached && !question.attemptsExhausted && 
                   question.attempts < question.maxAttempts && (
                    <>
                      {/* Show difficulty selection for lesson type activities */}
                      {question.activityType === 'lesson' ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                              <Button
                                key={difficulty}
                                onClick={() => handleRegenerate(difficulty)}
                                style={{
                                  backgroundColor: difficulty === question.difficulty ? themeColors.accent : 'white',
                                  color: difficulty === question.difficulty ? 'white' : themeColors.accent,
                                  borderColor: themeColors.accent,
                                }}
                                className="text-sm font-medium py-2 px-3 rounded border transition-all duration-200 hover:shadow-md"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* Regular regenerate button for non-lesson activities */
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
                          Generate New AI Question
                        </Button>
                      )}
                    </>
                  )}
                  
                  {/* Display message when max attempts reached */}
                  {(question.maxAttemptsReached || question.attemptsExhausted || 
                    question.attempts >= question.maxAttempts) && (
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
          </>
        )}
      </div>
    );
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
            {question?.title || 'Multiple Choice Question'}
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
              {/* Difficulty Selection for Assignments */}
              {question.settings?.allowDifficultySelection && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Choose Difficulty Level:</h4>
                  <div className="flex gap-2">
                    {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                      <button
                        key={difficulty}
                        onClick={() => {
                          setSelectedDifficulty(difficulty);
                          // If this is a free regeneration on difficulty change, trigger regeneration
                          if (question.settings?.freeRegenerationOnDifficultyChange && question.difficulty !== difficulty) {
                            handleRegenerate();
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
                  {selectedDifficulty && selectedDifficulty !== question.difficulty && (
                    <p className="text-xs text-blue-600 mt-1">
                      Click "Generate New AI Question" to apply difficulty change
                    </p>
                  )}
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
                    <div className="text-gray-700 flex-grow cursor-pointer" onClick={() => !result && setSelectedAnswer(option.id)}>
                      {renderEnhancedText(option.text)}
                    </div>

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

                  {/* For generating a new AI question */}
                  <div className="mt-4">
                    {result && !question.maxAttemptsReached && !question.attemptsExhausted && 
                     question.attempts < question.maxAttempts && (
                      <>
                        {/* Show difficulty selection for lesson type activities */}
                        {question.activityType === 'lesson' ? (
                          <div className="space-y-3">
                          
                            <div className="grid grid-cols-3 gap-2">
                              {['beginner', 'intermediate', 'advanced'].map(difficulty => (
                                <Button
                                  key={difficulty}
                                  onClick={() => handleRegenerate(difficulty)}
                                  style={{
                                    backgroundColor: difficulty === question.difficulty ? themeColors.accent : 'white',
                                    color: difficulty === question.difficulty ? 'white' : themeColors.accent,
                                    borderColor: themeColors.accent,
                                  }}
                                  className="text-sm font-medium py-2 px-3 rounded border transition-all duration-200 hover:shadow-md"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                  </svg>
                                  {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                </Button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* Regular regenerate button for non-lesson activities */
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
                            Generate New AI Question
                          </Button>
                        )}
                      </>
                    )}
                    
                    {/* Display message when max attempts reached */}
                    {(question.maxAttemptsReached || question.attemptsExhausted || 
                      question.attempts >= question.maxAttempts) && (
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
              {renderQuestionContent()}
            </div>
          </div>
          
          {/* Right side - Chat (full width on mobile, half width on desktop) */}
          <div className="w-full md:w-1/2 h-full">
            {question && (
              <GoogleAIChatApp
                sessionIdentifier={`${courseId}_${assessmentId}`}
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
    }
  };

  return themes[theme] || themes.purple;
}

export default AIMultipleChoiceQuestion;