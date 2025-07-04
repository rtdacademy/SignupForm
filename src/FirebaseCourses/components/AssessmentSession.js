import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { sanitizeEmail } from '../../utils/sanitizeEmail';
import { Button } from '../../components/ui/button';
import { StandardMultipleChoiceQuestion, AIShortAnswerQuestion, AILongAnswerQuestion } from './assessments';
import StandardLongAnswerQuestion from './assessments/StandardLongAnswerQuestion';
import { Clock, AlertCircle, CheckCircle, FileText, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../components/ui/dialog';

/**
 * AssessmentSession Component
 * 
 * Manages assessment sessions for different activity types:
 * - Assignments: Individual question feedback, easy exit, no sessions
 * - Quizzes: Optional timer, clear exit option
 * - Exams: Secure mode, session management, delayed feedback
 * 
 * Props:
 * - courseId: Course identifier
 * - studentEmail: Student email address  
 * - assessmentConfig: Assessment configuration object with questions, timeLimit, etc.
 * - course: Course object with Gradebook.courseConfig.gradebook.itemStructure for settings
 * - activityType: 'assignment' | 'quiz' | 'exam' (auto-detected from config if not provided)
 * - onAssessmentComplete: Callback when assessment is completed
 * - onAssessmentExit: Callback when student exits without completing
 */
const AssessmentSession = ({
  courseId,
  studentEmail,
  assessmentConfig,
  course = null, // Course object with configuration
  activityType = null, // Auto-detect from config if not provided
  onAssessmentComplete = () => {},
  onAssessmentExit = () => {},
}) => {
  const { currentUser } = useAuth();

  // Get assessment settings from course configuration or fallback to defaults
  const getAssessmentSettings = () => {
    // Try to get settings from course configuration first
    if (course?.Gradebook?.courseConfig?.gradebook?.itemStructure && assessmentConfig?.assessmentId) {
      const itemSettings = course.Gradebook.courseConfig.gradebook.itemStructure[assessmentConfig.assessmentId];
      if (itemSettings?.assessmentSettings) {
        console.log(`📋 Using course config settings for ${assessmentConfig.assessmentId}:`, itemSettings.assessmentSettings);
        return itemSettings.assessmentSettings;
      }
    }
    
    // Fallback to hardcoded defaults if no course config is available
    console.log(`⚠️ No course config found for ${assessmentConfig?.assessmentId}, using fallback defaults`);
    return null;
  };

  // Activity configuration system with course config integration
  const getActivityConfig = (type) => {
    // First try to get settings from course configuration
    const courseSettings = getAssessmentSettings();
    if (courseSettings) {
      return courseSettings;
    }
    
    // Fallback to hardcoded defaults
    const configs = {
      assignment: {
        badge: { text: "ASSIGNMENT MODE", color: "bg-green-100 text-green-800 border-green-300" },
        theme: {
          gradient: "from-green-600 to-emerald-600",
          gradientHover: "from-green-700 to-emerald-700",
          accent: "green-600",
          light: "green-100",
          border: "green-200",
          ring: "ring-green-200"
        },
        title: "Assignment in Progress",
        allowEasyExit: true,
        showExitButton: true,
        useSession: true, // Enable sessions for assignments to track answers
        allowImmediateFeedback: true,
        secureModeIntensity: "low",
        activityType: "assignment",
        timeLimit: 60,
        maxAttempts: 3
      },
      quiz: {
        badge: { text: "QUIZ MODE", color: "bg-blue-100 text-blue-800 border-blue-300" },
        theme: {
          gradient: "from-blue-600 to-cyan-600",
          gradientHover: "from-blue-700 to-cyan-700", 
          accent: "blue-600",
          light: "blue-100",
          border: "blue-200",
          ring: "ring-blue-200"
        },
        title: "Quiz in Progress",
        allowEasyExit: true,
        showExitButton: true,
        useSession: true,
        allowImmediateFeedback: false,
        secureModeIntensity: "medium",
        activityType: "quiz",
        timeLimit: 45,
        maxAttempts: 2
      },
      exam: {
        badge: { text: "EXAM MODE", color: "bg-red-100 text-red-800 border-red-300" },
        theme: {
          gradient: "from-red-600 to-rose-600",
          gradientHover: "from-red-700 to-rose-700",
          accent: "red-600", 
          light: "red-100",
          border: "red-200",
          ring: "ring-red-200"
        },
        title: "Exam in Progress",
        allowEasyExit: false,
        showExitButton: false,
        useSession: true,
        allowImmediateFeedback: false,
        secureModeIntensity: "high",
        activityType: "exam",
        timeLimit: 180,
        maxAttempts: 1
      }
    };
    return configs[type] || configs.exam; // Default to exam if unknown
  };

  // Auto-detect activity type from config if not provided
  const detectActivityType = () => {
    if (activityType) return activityType;
    
    // Try to get activity type from course configuration first
    const courseSettings = getAssessmentSettings();
    if (courseSettings?.activityType) return courseSettings.activityType;
    
    // Auto-detection logic based on config properties
    if (assessmentConfig?.activityType) return assessmentConfig.activityType;
    if (assessmentConfig?.assessmentId && assessmentConfig.assessmentId.includes('assignment')) return 'assignment';
    if (assessmentConfig?.assessmentId && assessmentConfig.assessmentId.includes('quiz')) return 'quiz';
    if (assessmentConfig?.timeLimit && assessmentConfig.timeLimit > 60) return 'exam';
    if (assessmentConfig?.questions?.length > 20) return 'exam';
    
    // Default based on other clues
    return 'exam'; // Safe default
  };

  const currentActivityType = detectActivityType();
  const activityConfig = getActivityConfig(currentActivityType);

  const [assessmentSession, setAssessmentSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState({}); // Actually saved answers
  const [pendingAnswers, setPendingAnswers] = useState({}); // Current working answers
  const [unsavedChanges, setUnsavedChanges] = useState(new Set()); // Question IDs with unsaved changes
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitDialogData, setSubmitDialogData] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [questionsReady, setQuestionsReady] = useState(false);
  const [questionReadyStates, setQuestionReadyStates] = useState({});
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  
  // Session detection states
  const [sessionDetection, setSessionDetection] = useState(null);
  const [isDetectingSessions, setIsDetectingSessions] = useState(false);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  const [resumableSession, setResumableSession] = useState(null);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  
  const functions = getFunctions();
  const db = getDatabase();
  const sessionListenerRef = useRef(null);
  const timeIntervalRef = useRef(null);
  const timeRemainingRef = useRef(null);
  const timerDisplayRef = useRef(null);
  const questionListenersRef = useRef({});

  // Helper function to update URL parameters
  const updateExamURLParams = useCallback((examState, sessionId = null) => {
    const url = new URL(window.location);
    url.searchParams.set('examState', examState);
    
    if (sessionId) {
      url.searchParams.set('sessionId', sessionId);
    } else {
      url.searchParams.delete('sessionId');
    }
    
    // Update URL without causing a page reload
    window.history.replaceState({}, '', url);
    console.log(`📍 URL updated: examState=${examState}${sessionId ? `, sessionId=${sessionId}` : ''}`);
  }, []);

  // Update URL parameters based on exam state
  useEffect(() => {
    if (assessmentResults) {
      // Exam completed state
      updateExamURLParams('completed', assessmentSession?.sessionId);
    } else if (assessmentSession && assessmentSession.status === 'in_progress') {
      // Exam in progress state
      updateExamURLParams('in-progress', assessmentSession.sessionId);
    } else {
      // Pre-exam state
      updateExamURLParams('pre-exam');
    }
  }, [assessmentSession, assessmentResults, updateExamURLParams]);

  // Detect existing assessment sessions when component mounts
  useEffect(() => {
    if (currentUser?.email && assessmentConfig?.assessmentId && activityConfig.useSession) {
      detectExamSessions();
    }
  }, [currentUser?.email, assessmentConfig?.assessmentId, activityConfig.useSession]);

  // Detect existing assessment sessions
  const detectExamSessions = async () => {
    if (!currentUser?.email || !assessmentConfig?.assessmentId) return;
    
    setIsDetectingSessions(true);
    try {
      const detectSessionFunction = httpsCallable(functions, 'detectActiveExamSession');
      
      const result = await detectSessionFunction({
        courseId: courseId,
        assessmentItemId: assessmentConfig.assessmentId,
        studentEmail: currentUser.email
      });
      
      const detection = result.data;
      setSessionDetection(detection);
      
      // If there's an active session, automatically resume it
      if (detection.activeSession) {
        console.log('🔄 Resuming active exam session:', detection.activeSession.sessionId);
        setAssessmentSession(detection.activeSession);
        const responses = detection.activeSession.responses || {};
        console.log('🔄 Resuming session with responses:', responses);
        setSavedAnswers(responses);
        // Initialize pending answers with saved answers
        setPendingAnswers(responses);
        
        // Set generated questions from the session
        if (detection.activeSession.questions) {
          setGeneratedQuestions(detection.activeSession.questions);
          // For resumed sessions, set up listeners to verify questions are ready
          setupQuestionReadyListeners(detection.activeSession.questions);
        }
        
        // Update URL to show exam in progress
        updateExamURLParams('in-progress', detection.activeSession.sessionId);
      } else if (detection.resumableSession) {
        // If there's a resumable session, store it and show resume option
        console.log('⏰ Resumable session found:', detection.resumableSession.sessionId);
        setResumableSession(detection.resumableSession);
        updateExamURLParams('pre-exam');
      } else if (detection.attemptsSummary?.canStartNewAttempt === false) {
        // Show session options if no more attempts available
        setShowSessionOptions(true);
        updateExamURLParams('pre-exam');
      } else {
        // Normal pre-exam state
        updateExamURLParams('pre-exam');
      }
      
    } catch (error) {
      console.error('Error detecting exam sessions:', error);
      // Don't block the exam if detection fails - default to pre-exam state
      updateExamURLParams('pre-exam');
    } finally {
      setIsDetectingSessions(false);
    }
  };

  // Calculate time remaining if time limit is set
  useEffect(() => {
    // Get time limit from course config or fallback to assessmentConfig
    const timeLimit = activityConfig.timeLimit || assessmentConfig?.timeLimit;
    if (assessmentSession && timeLimit && assessmentSession.startTime) {
      const updateTimeRemaining = () => {
        const now = Date.now();
        const startTime = new Date(assessmentSession.startTime).getTime();
        const endTime = startTime + (timeLimit * 60 * 1000);
        const remaining = Math.max(0, endTime - now);
        
        // Store in ref to avoid re-renders
        timeRemainingRef.current = remaining;
        
        // Update DOM directly if ref exists
        if (timerDisplayRef.current) {
          timerDisplayRef.current.textContent = formatTimeRemaining(remaining);
          
          // Update timer color based on remaining time
          if (remaining < 300000) { // Less than 5 minutes
            timerDisplayRef.current.className = 'font-mono text-base font-medium text-amber-700';
          } else {
            timerDisplayRef.current.className = 'font-mono text-base font-medium text-gray-700';
          }
        }
        
        // Only update state when timer reaches 0 (for auto-submit)
        if (remaining === 0 && assessmentSession.status === 'in_progress') {
          setTimeRemaining(0); // This will trigger necessary re-renders
          handleSubmitAssessment(true); // true = auto-submit
        }
      };

      // Initial update
      updateTimeRemaining();
      // Also set initial state for UI visibility logic
      const now = Date.now();
      const startTime = new Date(assessmentSession.startTime).getTime();
      const endTime = startTime + (timeLimit * 60 * 1000);
      const initialRemaining = Math.max(0, endTime - now);
      setTimeRemaining(initialRemaining);
      
      timeIntervalRef.current = setInterval(updateTimeRemaining, 1000);
      
      return () => {
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current);
        }
      };
    }
  }, [assessmentSession, activityConfig.timeLimit, assessmentConfig?.timeLimit]);

  // Set up database listeners to track when questions are ready
  const setupQuestionReadyListeners = useCallback((questions) => {
    if (!currentUser?.email || !questions?.length) return;
    
    console.log('🔍 Setting up question ready listeners for', questions.length, 'questions');
    const studentKey = sanitizeEmail(currentUser.email);
    
    // Clean up existing listeners first
    Object.values(questionListenersRef.current).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') unsubscribe();
    });
    questionListenersRef.current = {};
    
    // For exam mode, we need to wait a bit for the cloud functions to complete
    // before checking if questions are ready
    const checkDelay = currentActivityType === 'exam' || currentActivityType === 'quiz' ? 2000 : 0;
    
    setTimeout(() => {
      questions.forEach((question) => {
        const questionPath = `students/${studentKey}/courses/${courseId}/Assessments/${question.questionId}`;
        const questionRef = ref(db, questionPath);
        
        const unsubscribe = onValue(questionRef, (snapshot) => {
          const data = snapshot.val();
          // For exam mode, we're more lenient with what constitutes "ready"
          // since questions might be in different states during generation
          const validStatuses = ['active', 'exam_in_progress', 'completed', 'attempted', 'failed', 'pending'];
          const isReady = data && (
            // For exams/quizzes, just check if the question exists
            (currentActivityType === 'exam' || currentActivityType === 'quiz') ? 
              (data.questionText || data.question) : 
              (validStatuses.includes(data.status) && data.questionText && data.options)
          );
          
          setQuestionReadyStates(prev => {
            const newStates = { ...prev, [question.questionId]: isReady };
            
            // Check if all questions are ready
            const allReady = questions.every(q => newStates[q.questionId] === true);
            if (allReady) {
              console.log('✅ All questions are ready in database');
              setQuestionsReady(true);
            }
            
            return newStates;
          });
        });
        
        questionListenersRef.current[question.questionId] = unsubscribe;
      });
    }, checkDelay);
  }, [currentUser?.email, courseId, db, currentActivityType]);

  // Listen for exam session updates
  useEffect(() => {
    if (assessmentSession?.sessionId && currentUser?.email) {
      const studentKey = sanitizeEmail(currentUser.email);
      const sessionPath = `students/${studentKey}/courses/${courseId}/ExamSessions/${assessmentSession.sessionId}`;
      const sessionRef = ref(db, sessionPath);
      
      const handleSessionUpdate = (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setAssessmentSession(prev => ({...prev, ...data}));
          const responses = data.responses || {};
          setSavedAnswers(responses);
          // Sync pending answers with saved answers when session updates
          setPendingAnswers(prev => ({ ...prev, ...responses }));
          
          // Check if session has all questions and set questionsReady
          if (data.questions && generatedQuestions.length > 0) {
            const sessionQuestionIds = data.questions.map(q => q.questionId);
            const expectedQuestionIds = generatedQuestions.map(q => q.questionId);
            const hasAllQuestions = expectedQuestionIds.every(id => sessionQuestionIds.includes(id));
            
            if (hasAllQuestions) {
              console.log('✅ Session contains all expected questions, setting questionsReady to true');
              setQuestionsReady(true);
            }
          }
          
          // If exam was completed, load results
          if (data.status === 'completed' && data.finalResults) {
            setAssessmentResults(data.finalResults);
            // Update URL to show exam completed
            updateExamURLParams('completed', data.sessionId);
          }
        }
      };

      sessionListenerRef.current = onValue(sessionRef, handleSessionUpdate);
      
      return () => {
        if (sessionListenerRef.current) {
          off(sessionRef, 'value', sessionListenerRef.current);
        }
      };
    }
  }, [assessmentSession?.sessionId, currentUser, courseId, db]);

  // Clean up URL parameters and listeners when component unmounts
  useEffect(() => {
    return () => {
      // Clear exam-related URL parameters on cleanup
      const url = new URL(window.location);
      url.searchParams.delete('examState');
      url.searchParams.delete('sessionId');
      window.history.replaceState({}, '', url);
      
      // Clean up question listeners
      Object.values(questionListenersRef.current).forEach(unsubscribe => {
        if (typeof unsubscribe === 'function') unsubscribe();
      });
    };
  }, []);
  
  // Reset question ready states when questions change
  useEffect(() => {
    if (generatedQuestions.length === 0) {
      setQuestionsReady(false);
      setQuestionReadyStates({});
    }
  }, [generatedQuestions]);

  // Pre-generate assessment questions by calling cloud functions
  const generateAssessmentQuestions = async () => {
    if (!currentUser?.email || !assessmentConfig?.questions?.length) return [];
    
    setIsGeneratingQuestions(true);
    
    try {
      console.log('🎯 Setting up assessment questions...');
      
      // For assignments, generate questions using cloud functions (same as exams/quizzes)
      if (currentActivityType === 'assignment') {
        console.log('📝 Generating assignment questions...');
        // Assignments also need cloud function calls to create question content
      }
      
      // For exams and quizzes, generate questions using cloud functions
      console.log('🎯 Generating questions for exam/quiz...');
      const questionPromises = assessmentConfig.questions.map(async (questionConfig) => {
        const questionFunction = httpsCallable(functions, 'course2_assessments');
        
        try {
          const result = await questionFunction({
            operation: 'generate',
            courseId: courseId,
            assessmentId: questionConfig.questionId,
            studentEmail: currentUser.email,
            userId: currentUser.uid,
            topic: currentActivityType, // Use actual activity type instead of hardcoded 'exam'
            difficulty: 'intermediate',
            examMode: true // Explicitly indicate this is exam mode generation
          });
          
          if (result.data?.success) {
            console.log(`✅ Generated question: ${questionConfig.questionId}`);
            return {
              ...questionConfig,
              generated: true,
              cloudFunctionId: questionConfig.questionId
            };
          } else {
            throw new Error(`Cloud function failed for ${questionConfig.questionId}: ${result.data?.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`❌ Error generating question ${questionConfig.questionId}:`, error);
          throw error;
        }
      });
      
      // Wait for all promises to resolve
      const generatedQuestions = await Promise.all(questionPromises);
      
      setGeneratedQuestions(generatedQuestions);
      console.log(`🎯 Successfully generated ${generatedQuestions.length} assessment questions`);
      
      // Set up database listeners to wait for questions to be ready
      if (generatedQuestions.length > 0) {
        setupQuestionReadyListeners(generatedQuestions);
        
        // Fallback: If questions aren't ready after 2 seconds, force them ready
        // This prevents getting stuck on the loading screen
        setTimeout(() => {
          setQuestionsReady(prev => {
            if (!prev) {
              console.log('⚠️ Force setting questions ready after timeout');
              return true;
            }
            return prev;
          });
        }, 2000);
      }
      
      return generatedQuestions;
      
    } catch (error) {
      console.error('❌ Error setting up assessment questions:', error);
      alert(`Failed to set up assessment questions: ${error.message}`);
      return [];
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Resume existing session
  const handleResumeSession = async () => {
    if (!resumableSession) return;
    
    console.log('🔄 Resuming existing session:', resumableSession.sessionId);
    setAssessmentSession(resumableSession);
    const responses = resumableSession.responses || {};
    console.log('🔄 Resuming session with responses:', responses);
    setSavedAnswers(responses);
    setPendingAnswers(responses);
    
    // Set generated questions from the session
    if (resumableSession.questions) {
      setGeneratedQuestions(resumableSession.questions);
      setupQuestionReadyListeners(resumableSession.questions);
    }
    
    // Update URL to show exam in progress
    updateExamURLParams('in-progress', resumableSession.sessionId);
    setShowResumeDialog(false);
  };

  // Start assessment session
  const handleStartAssessment = async () => {
    if (!currentUser?.email) return;
    
    setIsStartingAssessment(true);
    try {
      // First, set up all the questions (generate for exams, use pre-defined for assignments)
      const questions = await generateAssessmentQuestions();
      if (questions.length === 0) {
        throw new Error('No questions were set up for the assessment');
      }
      
      const startExamFunction = httpsCallable(functions, 'startExamSession');
      
      const result = await startExamFunction({
        courseId: courseId,
        assessmentItemId: assessmentConfig.assessmentId,
        questions: questions,
        timeLimit: activityConfig.timeLimit || assessmentConfig.timeLimit,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      });
      
      console.log('Exam session started:', result.data);
      console.log('🆕 New session responses:', result.data.session.responses);
      setAssessmentSession(result.data.session);
      
      // If session was created with questions, set questionsReady immediately
      if (result.data.session.questions && questions.length > 0) {
        const sessionQuestionIds = result.data.session.questions.map(q => q.questionId);
        const expectedQuestionIds = questions.map(q => q.questionId);
        const hasAllQuestions = expectedQuestionIds.every(id => sessionQuestionIds.includes(id));
        
        if (hasAllQuestions) {
          console.log('✅ New session contains all expected questions, setting questionsReady to true');
          setQuestionsReady(true);
        }
      }
      
      // Update URL to show exam in progress
      updateExamURLParams('in-progress', result.data.session.sessionId);
      
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam: ' + error.message);
      // Keep URL in pre-exam state on error
      updateExamURLParams('pre-exam');
    } finally {
      setIsStartingAssessment(false);
    }
  };

  // Save answer for current question (integrates with session system)
  const handleAnswerSave = useCallback((answer, questionId) => {
    // Update saved answers immediately (this works with the session system)
    setSavedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Also update pending answers to keep them in sync
    setPendingAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Remove from unsaved changes since it's now saved
    setUnsavedChanges(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
    
    console.log(`Answer saved for ${questionId}: ${answer}`);
  }, []);

  // Track when user makes a selection but hasn't saved yet (for future use)
  const handleAnswerChange = useCallback((answer, questionId) => {
    // Update pending answers immediately
    setPendingAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    // Check if this differs from saved answer
    const currentSavedAnswer = savedAnswers[questionId];
    const hasChanged = currentSavedAnswer !== answer;
    
    // Update unsaved changes tracking
    setUnsavedChanges(prev => {
      const newSet = new Set(prev);
      if (hasChanged && answer) {
        newSet.add(questionId);
      } else {
        newSet.delete(questionId);
      }
      return newSet;
    });
    
    console.log(`Answer changed for ${questionId}: ${answer} (${hasChanged ? 'unsaved' : 'matches saved'})`);
  }, [savedAnswers]);

  // Navigate to specific question
  const handleNavigateToQuestion = (index) => {
    if (index >= 0 && index < generatedQuestions.length) {
      setCurrentQuestionIndex(index);
    }
  };

  // Submit exam for grading
  const handleSubmitAssessment = async (autoSubmit = false) => {
    if (!assessmentSession) return;
    
    // Check if all questions are answered (unless auto-submit)
    if (!autoSubmit) {
      const unansweredQuestions = generatedQuestions.filter(q => !savedAnswers[q.questionId]);
      
      // Show confirmation dialog
      const dialogData = {
        isComplete: unansweredQuestions.length === 0,
        unansweredCount: unansweredQuestions.length,
        totalQuestions: generatedQuestions.length,
        activityType: currentActivityType
      };
      
      setSubmitDialogData(dialogData);
      setShowSubmitDialog(true);
      return; // Wait for dialog confirmation
    }
    
    // Continue with actual submission (called from confirmSubmission)
    await performSubmission(autoSubmit);
  };
  
  // Handle dialog confirmation
  const confirmSubmission = async () => {
    setShowSubmitDialog(false);
    await performSubmission(false); // User confirmed, so not auto-submit
  };
  
  // Handle dialog cancellation
  const cancelSubmission = () => {
    setShowSubmitDialog(false);
    setSubmitDialogData(null);
  };
  
  // Perform the actual submission
  const performSubmission = async (autoSubmit = false) => {
    
    setIsSubmittingAssessment(true);
    try {
      console.log('🎯 Starting parallel exam submission...');
      
      // Step 1: Submit all questions in parallel for evaluation
      const questionSubmissionPromises = generatedQuestions.map(async (question) => {
        const answer = savedAnswers[question.questionId];
        if (!answer) {
          console.log(`⚠️ Skipping evaluation for ${question.questionId} - no answer provided`);
          // Don't try to evaluate, just mark as unanswered
          return { 
            questionId: question.questionId, 
            skipped: true,
            result: {
              success: true,
              result: {
                isCorrect: false,
                correctOptionId: 'unknown',
                feedback: 'No answer provided',
                explanation: 'This question was not answered.'
              }
            }
          };
        }
        
        try {
          const questionFunction = httpsCallable(functions, 'course2_assessments');
          const result = await questionFunction({
            courseId: courseId,
            assessmentId: question.questionId,
            operation: 'evaluate',
            answer: answer,
            studentEmail: currentUser.email,
            userId: currentUser.uid,
            topic: 'exam',
            difficulty: 'intermediate',
            examMode: true // This prevents immediate feedback but allows evaluation
          });
          
          console.log(`✅ Evaluated ${question.questionId}: ${result.data?.result?.isCorrect ? 'Correct' : 'Incorrect'}`);
          return { questionId: question.questionId, success: true, result: result.data };
        } catch (error) {
          console.error(`❌ Error evaluating ${question.questionId}:`, error);
          return { questionId: question.questionId, error: error.message };
        }
      });
      
      // Step 2: Submit exam session (this will read the results from database)
      const submitExamFunction = httpsCallable(functions, 'submitExamSession');
      
      // Execute both in parallel, but we want question evaluations to finish first
      const [questionResults, examResult] = await Promise.all([
        Promise.all(questionSubmissionPromises),
        // Add a small delay to ensure question evaluations complete first
        new Promise(resolve => setTimeout(resolve, 1000)).then(() => 
          submitExamFunction({
            courseId: courseId,
            sessionId: assessmentSession.sessionId,
            responses: savedAnswers,
            studentEmail: currentUser.email,
            autoSubmit: autoSubmit
          })
        )
      ]);
      
      console.log('📊 Question evaluation results:', questionResults);
      console.log('🎯 Exam session completed:', examResult.data);
      
      setAssessmentResults(examResult.data.results);
      
      // Update URL to show exam completed
      updateExamURLParams('completed', assessmentSession.sessionId);
      
      onAssessmentComplete(examResult.data);
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam: ' + error.message);
      // Keep URL in in-progress state on error
      updateExamURLParams('in-progress', assessmentSession?.sessionId);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  // Handle exit assessment (activity-specific behavior)
  const handleExitAssessment = () => {
    // For activities that allow easy exit (like assignments), exit directly
    if (activityConfig.allowEasyExit) {
      confirmExitAssessment();
    } else {
      // For other activities (like exams), show confirmation modal
      setShowExitWarning(true);
    }
  };

  const confirmExitAssessment = async () => {
    if (!assessmentSession) return;
    
    setShowExitWarning(false);
    
    try {
      const exitExamFunction = httpsCallable(functions, 'exitExamSession');
      
      const result = await exitExamFunction({
        courseId: courseId,
        sessionId: assessmentSession.sessionId,
        studentEmail: currentUser.email
      });
      
      console.log('Exam session exited:', result.data);
      
      // Update URL back to pre-exam state
      updateExamURLParams('pre-exam');
      
      onAssessmentExit();
      
    } catch (error) {
      console.error('Error exiting exam:', error);
      // Still call onAssessmentExit even if the cloud function fails
      updateExamURLParams('pre-exam');
      onAssessmentExit();
    }
  };

  // Format time remaining
  const formatTimeRemaining = (milliseconds) => {
    if (!milliseconds) return '';
    
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  // Get current question info
  const currentQuestion = generatedQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === generatedQuestions.length - 1;
  const answeredCount = Object.keys(savedAnswers).length;
  const totalAnsweredCount = Object.keys({ ...savedAnswers, ...pendingAnswers }).length;
  const unsavedCount = unsavedChanges.size;
  
  // Check if current question has unsaved changes
  const currentQuestionHasUnsavedChanges = currentQuestion && unsavedChanges.has(currentQuestion.questionId);
  const currentQuestionPendingAnswer = currentQuestion ? pendingAnswers[currentQuestion.questionId] : null;
  const currentQuestionSavedAnswer = currentQuestion ? savedAnswers[currentQuestion.questionId] : null;
  
  // Check if all questions are answered
  const allQuestionsAnswered = generatedQuestions.length > 0 && 
    generatedQuestions.every(q => savedAnswers[q.questionId] || pendingAnswers[q.questionId]);

  // Debug: Log the current question state
  React.useEffect(() => {
    if (currentQuestion) {
      console.log('🔍 Current question debug:', {
        questionId: currentQuestion.questionId,
        index: currentQuestionIndex,
        pendingAnswer: pendingAnswers[currentQuestion.questionId],
        savedAnswer: savedAnswers[currentQuestion.questionId],
        hasExistingAnswer: !!(pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId]),
        currentSavedAnswer: pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId]
      });
    }
  }, [currentQuestion, currentQuestionIndex, pendingAnswers, savedAnswers]);

  // If exam hasn't started, show start screen
  if (!assessmentSession) {
    // Show loading while detecting sessions
    if (isDetectingSessions) {
      return (
        <div className="py-8">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gray-50 rounded-lg shadow-md border p-8 text-center">
              <div className="mb-6">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4 animate-pulse" />
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Checking Assessment Status...</h1>
                <p className="text-gray-600">Please wait while we check for existing assessment sessions.</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Show attempts exhausted message
    if (showSessionOptions && sessionDetection?.attemptsSummary?.canStartNewAttempt === false) {
      return (
        <div className="py-8">
          <div className="max-w-4xl mx-auto p-6">
            <div className="bg-gray-50 rounded-lg shadow-md border p-8 text-center">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">No More Attempts Available</h1>
                <p className="text-gray-700">
                  You have used all {sessionDetection.attemptsSummary.maxAttempts} available attempt(s) for this exam.
                </p>
              </div>
              
              {sessionDetection?.completedSessions?.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-gray-800 mb-3">Previous Attempts:</h3>
                  <div className="space-y-2">
                    {sessionDetection.completedSessions.map((session, index) => (
                      <div key={session.sessionId} className="flex justify-between items-center text-sm">
                        <span>Attempt {index + 1}</span>
                        <span className="font-medium">
                          {session.finalResults?.score || 0}/{session.finalResults?.maxScore || 0} 
                          ({session.finalResults?.percentage || 0}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    // Show normal start screen
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg shadow-md border p-8 text-center">
          <div className="mb-6">
            <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start Your {currentActivityType === 'assignment' ? 'Assignment' : currentActivityType === 'quiz' ? 'Quiz' : 'Exam'}?</h1>
            <p className="text-gray-600">
              This {currentActivityType} contains {assessmentConfig?.questions?.length || 0} questions.
              {(activityConfig.timeLimit || assessmentConfig?.timeLimit) && (
                <span className="block mt-2 text-gray-700 font-medium">
                  Time Limit: {activityConfig.timeLimit || assessmentConfig.timeLimit} minutes
                </span>
              )}
            </p>
          </div>

          {/* Show attempt information */}
          {sessionDetection?.attemptsSummary && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-800 mb-2">Attempt Information:</h3>
              <p className="text-sm text-blue-700">
                This will be attempt {sessionDetection.attemptsSummary.attemptsUsed + 1} of {sessionDetection.attemptsSummary.maxAttempts}.
                {sessionDetection.attemptsSummary.attemptsRemaining > 1 && (
                  <span className="block mt-1">
                    You will have {sessionDetection.attemptsSummary.attemptsRemaining - 1} more attempt(s) after this one.
                  </span>
                )}
              </p>
            </div>
          )}

          {/* Show resumable session info if any */}
          {resumableSession && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-800 mb-3">Incomplete Session Found:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-green-700">Session Status:</span>
                  <span className="font-medium text-green-800 capitalize">{resumableSession.status}</span>
                </div>
                {resumableSession.responses && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Progress:</span>
                    <span className="font-medium text-green-800">
                      {Object.keys(resumableSession.responses).length} / {resumableSession.questions?.length || 0} questions answered
                    </span>
                  </div>
                )}
                {resumableSession.endTime && (
                  <div className="flex justify-between items-center">
                    <span className="text-green-700">Time Remaining:</span>
                    <span className="font-medium text-green-800">
                      {(() => {
                        const remaining = new Date(resumableSession.endTime).getTime() - Date.now();
                        const minutes = Math.floor(remaining / (1000 * 60));
                        return `${minutes} minutes`;
                      })()}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-3 p-3 bg-white border border-green-200 rounded text-xs text-green-600">
                💡 You can resume where you left off or start a new session (uses another attempt)
              </div>
            </div>
          )}

          {/* Show previous attempts if any */}
          {sessionDetection?.completedSessions?.length > 0 && (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-gray-800 mb-2">Previous Attempts:</h3>
              <div className="space-y-1 text-sm text-gray-700">
                {sessionDetection.completedSessions.map((session, index) => (
                  <div key={session.sessionId} className="flex justify-between">
                    <span>Attempt {index + 1}:</span>
                    <span className="font-medium">
                      {session.finalResults?.score || 0}/{session.finalResults?.maxScore || 0} 
                      ({session.finalResults?.percentage || 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-gray-700 mb-2">{currentActivityType === 'assignment' ? 'Assignment' : currentActivityType === 'quiz' ? 'Quiz' : 'Exam'} Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• The {currentActivityType} will open in a dedicated full-screen interface</li>
              <li>• You can navigate between questions and change your answers</li>
              <li>• Your answers are saved automatically</li>
              {activityConfig.allowImmediateFeedback ? 
                <li>• You will see feedback immediately after answering each question</li> :
                <li>• You will see your results only after submitting the entire {currentActivityType}</li>
              }
              {(activityConfig.timeLimit || assessmentConfig?.timeLimit) && <li>• The {currentActivityType} will auto-submit when time expires</li>}
              <li>• Make sure you have a stable internet connection</li>
              <li>• Do not refresh the page or navigate away during the {currentActivityType}</li>
            </ul>
          </div>
          
          {/* Show Resume button if there's a resumable session */}
          {resumableSession ? (
            <div className="space-y-3">
              <Button
                onClick={() => setShowResumeDialog(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg w-full"
              >
                Resume Session
              </Button>
              <Button
                onClick={handleStartAssessment}
                disabled={isStartingAssessment || isGeneratingQuestions}
                variant="outline"
                className="px-8 py-3 text-lg w-full"
              >
                {isStartingAssessment 
                  ? (isGeneratingQuestions ? 'Preparing Questions...' : 'Starting New Session...') 
                  : 'Start New Session'}
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleStartAssessment}
              disabled={isStartingAssessment || isGeneratingQuestions}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            >
              {isStartingAssessment 
                ? (isGeneratingQuestions ? 'Preparing Questions...' : 'Starting Assessment...') 
                : sessionDetection?.attemptsSummary?.attemptsUsed > 0 ? 'Start New Attempt' : 'Start Assessment'}
            </Button>
          )}
        </div>
        </div>
      </div>
    );
  }

  // If exam is completed, show results
  if (assessmentResults) {
    return (
      <div className="py-8">
        <div className="max-w-4xl mx-auto p-6">
        <div className="bg-gray-50 rounded-lg shadow-md border p-8">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Completed!</h1>
            <p className="text-gray-600">Here are your results:</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-700">{assessmentResults.score}</div>
              <div className="text-sm text-blue-600">Score</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-700">{assessmentResults.percentage}%</div>
              <div className="text-sm text-emerald-600">Percentage</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-700">
                {assessmentResults.correctAnswers}/{assessmentResults.totalQuestions}
              </div>
              <div className="text-sm text-slate-600">Correct</div>
            </div>
          </div>
          
          {/* Question-by-question results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Question Details:</h3>
            {assessmentResults.questionResults?.map((result, index) => (
              <div key={result.questionId} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Question {index + 1}</span>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    result.isCorrect 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {result.isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{result.questionText}</p>
                <div className="text-sm">
                  <p><strong>Your Answer:</strong> {result.studentAnswer}</p>
                  {!result.isCorrect && (
                    <p><strong>Correct Answer:</strong> {result.correctAnswer}</p>
                  )}
                  {result.feedback && (
                    <p className="mt-2 text-gray-700"><strong>Explanation:</strong> {result.feedback}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
        </div>
        </div>
      </div>
    );
  }

  // Main exam interface
  return (
    <>
    <Sheet open={assessmentSession && assessmentSession.status === 'in_progress' && !assessmentResults} onOpenChange={() => {}}>
      <SheetContent 
        className="w-full max-w-none p-0 [&>button]:hidden" 
        side="bottom"
      >
        <div className="h-screen overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
      {/* Exam Header */}
      <Card className="mb-6 bg-gray-50 shadow-md">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <FileText className="h-6 w-6 text-gray-600" />
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-gray-900">{activityConfig.title}</h1>
                  <span className={`text-xs py-1 px-2 rounded font-medium border ${activityConfig.badge.color}`}>
                    {activityConfig.badge.text}
                  </span>
                  {assessmentSession?.attemptNumber && (
                    <span className="text-xs py-1 px-2 rounded bg-gray-100 text-gray-700 font-medium">
                      Attempt {assessmentSession.attemptNumber}/{assessmentSession.maxAttempts}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {generatedQuestions.length} • 
                  {answeredCount} answered
                </p>
              </div>
            </div>
          
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (!isTimerHidden || (timeRemainingRef.current && timeRemainingRef.current <= 600000)) && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                <Clock className="h-4 w-4 text-gray-600" />
                <span 
                  ref={timerDisplayRef}
                  className={`font-mono text-base font-medium ${
                    timeRemaining < 300000 ? 'text-amber-700' : 'text-gray-700'
                  }`}
                >
                  {formatTimeRemaining(timeRemaining)}
                </span>
                {timeRemainingRef.current && timeRemainingRef.current > 600000 && (
                  <button
                    onClick={() => setIsTimerHidden(!isTimerHidden)}
                    className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                    title={isTimerHidden ? 'Show timer' : 'Hide timer'}
                  >
                    {isTimerHidden ? '👁️' : '🙈'}
                  </button>
                )}
              </div>
            )}
            {timeRemaining !== null && isTimerHidden && timeRemainingRef.current > 600000 && (
              <button
                onClick={() => setIsTimerHidden(false)}
                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:text-gray-700"
                title="Show timer"
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm">Show Timer</span>
              </button>
            )}
            
            {/* Finish Assessment Button */}
            <Button
              onClick={() => handleSubmitAssessment(false)}
              disabled={isSubmittingAssessment}
              size="sm"
              className={`px-4 py-2 text-white transition-all duration-300 ${
                allQuestionsAnswered && unsavedCount === 0
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg ring-2 ring-green-200'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isSubmittingAssessment ? 'Submitting...' : 
               allQuestionsAnswered && unsavedCount === 0 ? (
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Submit Assessment
                </span>
               ) : 'Finish Assessment'}
            </Button>
            
            {/* Activity-specific exit button for assignments and quizzes */}
            {activityConfig.showExitButton && (
              <button
                onClick={handleExitAssessment}
                className={`flex items-center justify-center w-8 h-8 rounded-md border-2 hover:bg-gray-100 transition-colors ${activityConfig.theme.border} text-${activityConfig.theme.accent}`}
                title={`Exit ${currentActivityType}`}
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
          </div>
        </CardContent>
      </Card>

      {/* Show loading state when questions are being prepared */}
      {generatedQuestions.length > 0 && !questionsReady && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="mb-6">
            <div className="animate-spin h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl font-medium text-blue-900 mb-3">Preparing Questions...</h3>
            <p className="text-blue-700 text-lg">
              Setting up {generatedQuestions.length} question{generatedQuestions.length !== 1 ? 's' : ''} for your assessment.
            </p>
          </div>
          <div className="bg-white border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
            <div className="text-sm text-blue-600">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Questions Ready:</span>
                <span className="font-bold text-lg">
                  {Object.values(questionReadyStates).filter(Boolean).length} / {generatedQuestions.length}
                </span>
              </div>
              <div className="w-full bg-blue-100 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${(Object.values(questionReadyStates).filter(Boolean).length / Math.max(generatedQuestions.length, 1)) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {questionsReady && (
        <div className="flex gap-4">
          {/* Question Navigation Sidebar - Minimal Width */}
        <div className="w-30 flex-shrink-0">
          <Card className="sticky top-4 bg-gray-50 shadow-md h-[calc(100vh-10.5rem)]">
            <CardContent className="p-4 h-full flex flex-col">
              <div className="text-xs font-medium text-gray-600 mb-4 text-center">Questions</div>
              <ScrollArea className="flex-1">
                <div className="space-y-2 pt-2 pb-4">
                  {generatedQuestions.map((question, index) => {
                    const hasUnsavedChanges = unsavedChanges.has(question.questionId);
                    const isSaved = savedAnswers[question.questionId];
                    const isCurrent = index === currentQuestionIndex;
                    
                    // Determine button styling based on state priority: current > unsaved > saved > default
                    let buttonClass, titleText, icon;
                    
                    if (isCurrent) {
                      buttonClass = 'bg-blue-600 text-white shadow-sm';
                      titleText = `Question ${index + 1} (Current)`;
                      icon = null;
                    } else if (hasUnsavedChanges) {
                      buttonClass = 'bg-orange-100 text-orange-800 border border-orange-300';
                      titleText = `Question ${index + 1} (Unsaved Changes)`;
                      icon = <AlertCircle className="h-4 w-4 absolute -top-1 -right-1 text-orange-600 bg-white rounded-full border border-orange-300" />;
                    } else if (isSaved) {
                      buttonClass = 'bg-green-100 text-green-800 border border-green-300';
                      titleText = `Question ${index + 1} (Saved)`;
                      icon = <CheckCircle className="h-4 w-4 absolute -top-1 -right-1 text-green-600 bg-white rounded-full border border-green-300" />;
                    } else {
                      buttonClass = 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50';
                      titleText = `Question ${index + 1}`;
                      icon = null;
                    }
                    
                    return (
                      <button
                        key={question.questionId}
                        onClick={() => handleNavigateToQuestion(index)}
                        className={`w-14 h-12 text-sm font-medium rounded transition-all duration-200 relative flex items-center justify-center mx-auto ${buttonClass}`}
                        title={titleText}
                      >
                        {index + 1}
                        {icon}
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
              
              <div className="mt-auto pt-4 border-t border-gray-200">
                {allQuestionsAnswered && unsavedCount === 0 ? (
                  <div className="text-center space-y-2">
                    <div className="flex items-center justify-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-xs font-medium">All Complete!</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Ready to submit
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-500 text-center space-y-1">
                    <div>{answeredCount} of {generatedQuestions.length} saved</div>
                    {unsavedCount > 0 && (
                      <div className="text-orange-600 font-medium">
                        {unsavedCount} unsaved change{unsavedCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Question */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="relative"
            >
              {/* Very light overlay when question is saved */}
              {currentQuestion && savedAnswers[currentQuestion.questionId] && (
                <div className="absolute inset-0 bg-green-50 bg-opacity-20 z-10 rounded-lg pointer-events-none"></div>
              )}
              
              {/* Completion Banner */}
              {allQuestionsAnswered && unsavedCount === 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-3 text-green-700">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <div>
                      <span className="font-medium text-lg">All Questions Complete!</span>
                      <p className="text-sm text-green-600 mt-1">
                        You've answered all {generatedQuestions.length} questions. You can review your answers or submit your {currentActivityType}.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Unsaved Changes Warning */}
              {currentQuestionHasUnsavedChanges && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    <span className="font-medium">Unsaved Changes</span>
                  </div>
                  <p className="text-sm text-orange-600 mt-1">
                    You have selected "{currentQuestionPendingAnswer}" but your last saved answer was "{currentQuestionSavedAnswer || 'none'}". 
                    Your changes will be lost if you navigate away without saving.
                  </p>
                </motion.div>
              )}
              
              {currentQuestion && (
                <>
                  {(currentQuestion.type === 'standard-multiple-choice' || currentQuestion.type === 'multiple-choice') && (
                    <StandardMultipleChoiceQuestion
                      courseId={courseId}
                      cloudFunctionName="course2_assessments"
                      assessmentId={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={assessmentSession.sessionId}
                      onAssessmentAnswerSave={handleAnswerSave}
                      theme="slate"
                      hasExistingAnswer={!!(pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId])}
                      currentSavedAnswer={pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId]}
                    />
                  )}
                  {currentQuestion.type === 'ai-short-answer' && (
                    <AIShortAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName="course2_assessments"
                      assessmentId={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={assessmentSession.sessionId}
                      onAssessmentAnswerSave={handleAnswerSave}
                      theme="slate"
                      hasExistingAnswer={!!(pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId])}
                      currentSavedAnswer={pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId]}
                    />
                  )}
                  {currentQuestion.type === 'ai-long-answer' && (
                    <AILongAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName="course2_assessments"
                      assessmentId={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={assessmentSession.sessionId}
                      onAssessmentAnswerSave={handleAnswerSave}
                      theme="slate"
                      hasExistingAnswer={!!(pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId])}
                      currentSavedAnswer={pendingAnswers[currentQuestion.questionId] || savedAnswers[currentQuestion.questionId]}
                    />
                  )}
                  {currentQuestion.type === 'standard-long-answer' && (
                    <StandardLongAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName="course2_assessments"
                      assessmentId={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={assessmentSession.sessionId}
                      onAssessmentAnswerSave={handleAnswerSave}
                      theme="slate"
                      isWaitingForQuestions={!questionsReady}
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Controls - only show when questions are ready */}
          {questionsReady && (
            <>
              <div className="flex justify-between items-center mt-6">
                <Button
                  onClick={() => handleNavigateToQuestion(currentQuestionIndex - 1)}
                  disabled={currentQuestionIndex === 0}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-600">
                  Question {currentQuestionIndex + 1} of {generatedQuestions.length}
                </span>
                
                <Button
                  onClick={() => handleNavigateToQuestion(currentQuestionIndex + 1)}
                  disabled={isLastQuestion}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Answer status notification */}
              {currentQuestion && savedAnswers[currentQuestion.questionId] && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">Answer Saved</span>
                  </div>
                 
                </motion.div>
              )}
            </>
          )}
          </div>
        </div>
      )}

      {/* Activity-specific Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className={`h-6 w-6 ${
                currentActivityType === 'assignment' ? 'text-green-600' :
                currentActivityType === 'quiz' ? 'text-blue-600' : 'text-red-600'
              }`} />
              <h3 className="text-lg font-semibold">Exit {currentActivityType === 'assignment' ? 'Assignment' : currentActivityType === 'quiz' ? 'Quiz' : 'Exam'}?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              {currentActivityType === 'assignment' ? (
                'Are you sure you want to exit this assignment? Your progress will be saved and you can return later to continue.'
              ) : currentActivityType === 'quiz' ? (
                'Are you sure you want to exit this quiz? Your current answers will be saved, but you may not be able to restart.'
              ) : (
                'Are you sure you want to exit the exam? Your answers will be lost and you may not be able to restart.'
              )}
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowExitWarning(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmExitAssessment}
                className={
                  currentActivityType === 'assignment' ? 'bg-green-600 hover:bg-green-700 text-white' :
                  currentActivityType === 'quiz' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                  'bg-red-600 hover:bg-red-700 text-white'
                }
              >
                {currentActivityType === 'assignment' ? 'Save & Exit' : 
                 currentActivityType === 'quiz' ? 'Exit Quiz' : 'Exit Exam'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Unsaved Changes Warning Modal */}
      {showUnsavedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-amber-600" />
              <h3 className="text-lg font-semibold">You Have Unsaved Changes</h3>
            </div>
            <p className="text-gray-600 mb-4">
              You have {unsavedCount} question(s) with unsaved changes. What would you like to do?
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-700">
                <strong>Questions with unsaved changes:</strong>
              </p>
              <ul className="text-sm text-amber-600 mt-1">
                {Array.from(unsavedChanges).map(questionId => {
                  const questionIndex = generatedQuestions.findIndex(q => q.questionId === questionId);
                  return (
                    <li key={questionId}>
                      • Question {questionIndex + 1}: "{pendingAnswers[questionId]}"
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowUnsavedWarning(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  // Save all unsaved changes before submitting
                  unsavedChanges.forEach(questionId => {
                    handleAnswerSave(questionId);
                  });
                  setShowUnsavedWarning(false);
                  // Continue with submission
                  setTimeout(() => handleSubmitAssessment(false), 100);
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Save All & Submit
              </Button>
              <Button
                onClick={() => {
                  // Submit without saving changes (discard them)
                  setShowUnsavedWarning(false);
                  handleSubmitAssessment(false);
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Discard & Submit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {submitDialogData?.isComplete ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Ready to Submit
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                  Incomplete Assessment
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-left">
              {submitDialogData?.isComplete ? (
                <>
                  <p className="mb-3">
                    Great! You've answered all {submitDialogData.totalQuestions} questions in your {submitDialogData.activityType}.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-700">
                      <strong>✓ All questions completed</strong><br/>
                      Are you ready to submit? This action cannot be undone.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <p className="mb-3">
                    You have {submitDialogData?.unansweredCount} unanswered question(s) out of {submitDialogData?.totalQuestions} total.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-700">
                      <strong>⚠ Incomplete submission</strong><br/>
                      Unanswered questions will receive zero points. You can go back and complete them, or submit as-is.
                    </p>
                  </div>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              onClick={cancelSubmission}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {submitDialogData?.isComplete ? 'Review Answers' : 'Continue Working'}
            </Button>
            <Button
              onClick={confirmSubmission}
              disabled={isSubmittingAssessment}
              className={`w-full sm:w-auto ${
                submitDialogData?.isComplete 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              } text-white`}
            >
              {isSubmittingAssessment ? 'Submitting...' : `Submit ${submitDialogData?.activityType || 'Assessment'}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resume Session Confirmation Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              Resume Previous Session
            </DialogTitle>
            <DialogDescription className="text-left">
              {resumableSession && (
                <>
                  <p className="mb-3">
                    You have an incomplete {currentActivityType} session from a previous attempt.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-green-800">Session Status:</span>
                        <span className="text-green-700 capitalize">{resumableSession.status}</span>
                      </div>
                      {resumableSession.responses && (
                        <div className="flex justify-between">
                          <span className="font-medium text-green-800">Questions Answered:</span>
                          <span className="text-green-700">
                            {Object.keys(resumableSession.responses).length} / {resumableSession.questions?.length || 0}
                          </span>
                        </div>
                      )}
                      {resumableSession.endTime && (
                        <div className="flex justify-between">
                          <span className="font-medium text-green-800">Time Remaining:</span>
                          <span className="text-green-700">
                            {(() => {
                              const remaining = new Date(resumableSession.endTime).getTime() - Date.now();
                              const minutes = Math.floor(remaining / (1000 * 60));
                              return `${minutes} minutes`;
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">
                    You can resume where you left off, or start a new session (which will use another attempt).
                  </p>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
            <Button
              onClick={() => setShowResumeDialog(false)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={handleResumeSession}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
            >
              Resume Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default AssessmentSession;