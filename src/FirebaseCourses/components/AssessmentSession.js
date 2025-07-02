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
 * - activityType: 'assignment' | 'quiz' | 'exam' (auto-detected from config if not provided)
 * - onAssessmentComplete: Callback when assessment is completed
 * - onAssessmentExit: Callback when student exits without completing
 */
const AssessmentSession = ({
  courseId,
  studentEmail,
  assessmentConfig,
  activityType = null, // Auto-detect from config if not provided
  onAssessmentComplete = () => {},
  onAssessmentExit = () => {},
}) => {
  const { currentUser } = useAuth();

  // Activity configuration system
  const getActivityConfig = (type) => {
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
        useSession: false,
        allowImmediateFeedback: true,
        secureModeIntensity: "low" // Still secure but more relaxed
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
        useSession: true, // Optional - can be overridden
        allowImmediateFeedback: false, // Usually delayed
        secureModeIntensity: "medium"
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
        secureModeIntensity: "high"
      }
    };
    return configs[type] || configs.exam; // Default to exam if unknown
  };

  // Auto-detect activity type from config if not provided
  const detectActivityType = () => {
    if (activityType) return activityType;
    
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
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isStartingAssessment, setIsStartingAssessment] = useState(false);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState(false);
  const [assessmentResults, setAssessmentResults] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [isTimerHidden, setIsTimerHidden] = useState(false);
  
  // Session detection states
  const [sessionDetection, setSessionDetection] = useState(null);
  const [isDetectingSessions, setIsDetectingSessions] = useState(false);
  const [showSessionOptions, setShowSessionOptions] = useState(false);
  
  const functions = getFunctions();
  const db = getDatabase();
  const sessionListenerRef = useRef(null);
  const timeIntervalRef = useRef(null);

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
        setSavedAnswers(detection.activeSession.responses || {});
        
        // Set generated questions from the session
        if (detection.activeSession.questions) {
          setGeneratedQuestions(detection.activeSession.questions);
        }
        
        // Update URL to show exam in progress
        updateExamURLParams('in-progress', detection.activeSession.sessionId);
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
    if (assessmentSession && assessmentConfig?.timeLimit && assessmentSession.startTime) {
      const updateTimeRemaining = () => {
        const now = Date.now();
        const startTime = new Date(assessmentSession.startTime).getTime();
        const endTime = startTime + (assessmentConfig.timeLimit * 60 * 1000);
        const remaining = Math.max(0, endTime - now);
        
        setTimeRemaining(remaining);
        
        // Auto-submit if time is up
        if (remaining === 0 && assessmentSession.status === 'in_progress') {
          handleSubmitAssessment(true); // true = auto-submit
        }
      };

      updateTimeRemaining();
      timeIntervalRef.current = setInterval(updateTimeRemaining, 1000);
      
      return () => {
        if (timeIntervalRef.current) {
          clearInterval(timeIntervalRef.current);
        }
      };
    }
  }, [assessmentSession, assessmentConfig?.timeLimit]);

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
          setSavedAnswers(data.responses || {});
          
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

  // Clean up URL parameters when component unmounts
  useEffect(() => {
    return () => {
      // Clear exam-related URL parameters on cleanup
      const url = new URL(window.location);
      url.searchParams.delete('examState');
      url.searchParams.delete('sessionId');
      window.history.replaceState({}, '', url);
    };
  }, []);

  // Pre-generate assessment questions by calling cloud functions
  const generateAssessmentQuestions = async () => {
    if (!currentUser?.email || !assessmentConfig?.questions?.length) return [];
    
    setIsGeneratingQuestions(true);
    
    try {
      console.log('🎯 Pre-generating assessment questions...');
      
      // Create all promises for parallel execution
      const questionPromises = assessmentConfig.questions.map(async (questionConfig) => {
        const questionFunction = httpsCallable(functions, 'course2_assessments');
        
        try {
          const result = await questionFunction({
            operation: 'generate',
            courseId: courseId,
            assessmentId: questionConfig.questionId,
            studentEmail: currentUser.email,
            userId: currentUser.uid,
            topic: 'exam',
            difficulty: 'intermediate'
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
      return generatedQuestions;
      
    } catch (error) {
      console.error('❌ Error generating assessment questions:', error);
      alert('Failed to generate assessment questions: ' + error.message);
      return [];
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Start assessment session
  const handleStartAssessment = async () => {
    if (!currentUser?.email) return;
    
    setIsStartingAssessment(true);
    try {
      // First, generate all the questions
      const questions = await generateAssessmentQuestions();
      if (questions.length === 0) {
        throw new Error('No questions were generated for the assessment');
      }
      
      const startExamFunction = httpsCallable(functions, 'startExamSession');
      
      const result = await startExamFunction({
        courseId: courseId,
        assessmentItemId: assessmentConfig.assessmentId,
        questions: questions,
        timeLimit: assessmentConfig.timeLimit,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      });
      
      console.log('Exam session started:', result.data);
      setAssessmentSession(result.data.session);
      
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

  // Save answer for current question
  const handleAnswerSave = useCallback((answer, questionId) => {
    setSavedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
    
    console.log(`Answer saved for ${questionId}: ${answer}`);
  }, []);

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
      if (unansweredQuestions.length > 0) {
        const proceed = window.confirm(
          `You have ${unansweredQuestions.length} unanswered question(s). Are you sure you want to submit your exam?`
        );
        if (!proceed) return;
      }
    }
    
    setIsSubmittingAssessment(true);
    try {
      console.log('🎯 Starting parallel exam submission...');
      
      // Step 1: Submit all questions in parallel for evaluation
      const questionSubmissionPromises = generatedQuestions.map(async (question) => {
        const answer = savedAnswers[question.questionId];
        if (!answer) {
          console.log(`⚠️ Skipping ${question.questionId} - no answer provided`);
          return { questionId: question.questionId, skipped: true };
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Checking Exam Status...</h1>
                <p className="text-gray-600">Please wait while we check for existing exam sessions.</p>
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
            <div className="bg-red-50 rounded-lg shadow-md border border-red-200 p-8 text-center">
              <div className="mb-6">
                <AlertCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-red-900 mb-2">No More Attempts Available</h1>
                <p className="text-red-700">
                  You have used all {sessionDetection.attemptsSummary.maxAttempts} available attempt(s) for this exam.
                </p>
              </div>
              
              {sessionDetection?.completedSessions?.length > 0 && (
                <div className="bg-white border border-red-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-red-800 mb-3">Previous Attempts:</h3>
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
              
              <Button
                onClick={() => onAssessmentExit()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Return to Course
              </Button>
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start Your Exam?</h1>
            <p className="text-gray-600">
              This exam contains {assessmentConfig?.questions?.length || 0} questions.
              {assessmentConfig?.timeLimit && (
                <span className="block mt-2 text-gray-700 font-medium">
                  Time Limit: {assessmentConfig.timeLimit} minutes
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
            <h3 className="font-medium text-gray-700 mb-2">Exam Instructions:</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• The exam will open in a dedicated full-screen interface</li>
              <li>• You can navigate between questions and change your answers</li>
              <li>• Your answers are saved automatically</li>
              <li>• You will see your results only after submitting the entire exam</li>
              {assessmentConfig?.timeLimit && <li>• The exam will auto-submit when time expires</li>}
              <li>• Make sure you have a stable internet connection</li>
              <li>• Do not refresh the page or navigate away during the exam</li>
            </ul>
          </div>
          
          <Button
            onClick={handleStartAssessment}
            disabled={isStartingAssessment || isGeneratingQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isStartingAssessment 
              ? (isGeneratingQuestions ? 'Preparing Questions...' : 'Starting Assessment...') 
              : sessionDetection?.attemptsSummary?.attemptsUsed > 0 ? 'Start New Attempt' : 'Start Assessment'}
          </Button>
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
          
          <div className="text-center mt-8">
            <Button
              onClick={() => onAssessmentComplete(assessmentResults)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Continue to Course
            </Button>
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
            {timeRemaining !== null && (!isTimerHidden || timeRemaining <= 600000) && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
                <Clock className="h-4 w-4 text-gray-600" />
                <span className={`font-mono text-base font-medium ${
                  timeRemaining < 300000 ? 'text-amber-700' : 'text-gray-700'
                }`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
                {timeRemaining > 600000 && (
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
            {timeRemaining !== null && isTimerHidden && timeRemaining > 600000 && (
              <button
                onClick={() => setIsTimerHidden(false)}
                className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 text-gray-600 hover:text-gray-700"
                title="Show timer"
              >
                <Clock className="h-4 w-4" />
                <span className="text-sm">Show Timer</span>
              </button>
            )}
            
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

      <div className="flex gap-4">
        {/* Question Navigation Sidebar - Minimal Width */}
        <div className="w-24 flex-shrink-0">
          <Card className="sticky top-4 bg-gray-50 shadow-md">
            <CardContent className="p-4">
              <div className="text-xs font-medium text-gray-600 mb-4 text-center">Questions</div>
              <ScrollArea className="h-80">
                <div className="space-y-2">
                  {generatedQuestions.map((question, index) => (
                    <button
                      key={question.questionId}
                      onClick={() => handleNavigateToQuestion(index)}
                      className={`w-14 h-12 text-sm font-medium rounded transition-all duration-200 relative flex items-center justify-center mx-auto ${
                        index === currentQuestionIndex
                          ? 'bg-blue-600 text-white shadow-sm'
                          : savedAnswers[question.questionId]
                          ? 'bg-green-100 text-green-800 border border-green-300'
                          : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                      }`}
                      title={`Question ${index + 1}${savedAnswers[question.questionId] ? ' (Saved)' : ''}`}
                    >
                      {index + 1}
                      {savedAnswers[question.questionId] && (
                        <CheckCircle className="h-4 w-4 absolute -top-1 -right-1 text-green-600 bg-white rounded-full border border-green-300" />
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Button
                  onClick={() => handleSubmitAssessment(false)}
                  disabled={isSubmittingAssessment}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                >
                  {isSubmittingAssessment ? 'Submitting...' : 'Finish Assessment'}
                </Button>
                <div className="text-xs text-gray-500 mt-2 text-center">
                  {answeredCount} of {generatedQuestions.length}
                </div>
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
                      hasExistingAnswer={!!savedAnswers[currentQuestion.questionId]}
                      currentSavedAnswer={savedAnswers[currentQuestion.questionId]}
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
                      hasExistingAnswer={!!savedAnswers[currentQuestion.questionId]}
                      currentSavedAnswer={savedAnswers[currentQuestion.questionId]}
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
                      hasExistingAnswer={!!savedAnswers[currentQuestion.questionId]}
                      currentSavedAnswer={savedAnswers[currentQuestion.questionId]}
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
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
          
          {/* Navigation Controls */}
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
          
          {/* Saved answer notification */}
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
              <p className="text-sm text-green-600 mt-1">
                Your answer "{savedAnswers[currentQuestion.questionId]?.toUpperCase()}" has been saved. You can select a different answer and click "Update Answer" to change your response anytime before submitting the exam.
              </p>
            </motion.div>
          )}
        </div>
      </div>

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
          </div>
        </div>
      </SheetContent>
    </Sheet>
    </>
  );
};

export default AssessmentSession;