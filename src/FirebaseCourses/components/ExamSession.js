import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { sanitizeEmail } from '../../utils/sanitizeEmail';
import { Button } from '../../components/ui/button';
import { StandardMultipleChoiceQuestion, AIShortAnswerQuestion, AILongAnswerQuestion } from './assessments';
import { Clock, AlertCircle, CheckCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader } from '../../components/ui/card';
import { Sheet, SheetContent } from '../../components/ui/sheet';
import { ScrollArea } from '../../components/ui/scroll-area';

/**
 * ExamSession Component
 * 
 * Manages an exam session where students:
 * 1. Pre-generate exam questions by calling cloud functions
 * 2. Start an exam and get a session ID
 * 3. Answer questions with saves but no immediate feedback
 * 4. Navigate between questions
 * 5. Complete the exam to see all results
 * 
 * Props:
 * - courseId: Course identifier
 * - studentEmail: Student email address
 * - examConfig: Exam configuration object with questions, timeLimit, etc.
 * - onExamComplete: Callback when exam is completed
 * - onExamExit: Callback when student exits without completing
 */
const ExamSession = ({
  courseId,
  studentEmail,
  examConfig,
  onExamComplete = () => {},
  onExamExit = () => {},
}) => {
  const { currentUser } = useAuth();
  const [examSession, setExamSession] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [savedAnswers, setSavedAnswers] = useState({});
  const [isStartingExam, setIsStartingExam] = useState(false);
  const [isSubmittingExam, setIsSubmittingExam] = useState(false);
  const [examResults, setExamResults] = useState(null);
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
    if (examResults) {
      // Exam completed state
      updateExamURLParams('completed', examSession?.sessionId);
    } else if (examSession && examSession.status === 'in_progress') {
      // Exam in progress state
      updateExamURLParams('in-progress', examSession.sessionId);
    } else {
      // Pre-exam state
      updateExamURLParams('pre-exam');
    }
  }, [examSession, examResults, updateExamURLParams]);

  // Detect existing exam sessions when component mounts
  useEffect(() => {
    if (currentUser?.email && examConfig?.examId) {
      detectExamSessions();
    }
  }, [currentUser?.email, examConfig?.examId]);

  // Detect existing exam sessions
  const detectExamSessions = async () => {
    if (!currentUser?.email || !examConfig?.examId) return;
    
    setIsDetectingSessions(true);
    try {
      const detectSessionFunction = httpsCallable(functions, 'detectActiveExamSession');
      
      const result = await detectSessionFunction({
        courseId: courseId,
        examItemId: examConfig.examId,
        studentEmail: currentUser.email
      });
      
      const detection = result.data;
      setSessionDetection(detection);
      
      // If there's an active session, automatically resume it
      if (detection.activeSession) {
        console.log('🔄 Resuming active exam session:', detection.activeSession.sessionId);
        setExamSession(detection.activeSession);
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
    if (examSession && examConfig?.timeLimit && examSession.startTime) {
      const updateTimeRemaining = () => {
        const now = Date.now();
        const startTime = new Date(examSession.startTime).getTime();
        const endTime = startTime + (examConfig.timeLimit * 60 * 1000);
        const remaining = Math.max(0, endTime - now);
        
        setTimeRemaining(remaining);
        
        // Auto-submit if time is up
        if (remaining === 0 && examSession.status === 'in_progress') {
          handleSubmitExam(true); // true = auto-submit
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
  }, [examSession, examConfig?.timeLimit]);

  // Listen for exam session updates
  useEffect(() => {
    if (examSession?.sessionId && currentUser?.email) {
      const studentKey = sanitizeEmail(currentUser.email);
      const sessionPath = `students/${studentKey}/courses/${courseId}/ExamSessions/${examSession.sessionId}`;
      const sessionRef = ref(db, sessionPath);
      
      const handleSessionUpdate = (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setExamSession(prev => ({...prev, ...data}));
          setSavedAnswers(data.responses || {});
          
          // If exam was completed, load results
          if (data.status === 'completed' && data.finalResults) {
            setExamResults(data.finalResults);
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
  }, [examSession?.sessionId, currentUser, courseId, db]);

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

  // Pre-generate exam questions by calling cloud functions
  const generateExamQuestions = async () => {
    if (!currentUser?.email || !examConfig?.questions?.length) return [];
    
    setIsGeneratingQuestions(true);
    
    try {
      console.log('🎯 Pre-generating exam questions...');
      
      // Create all promises for parallel execution
      const questionPromises = examConfig.questions.map(async (questionConfig) => {
        const questionFunction = httpsCallable(functions, questionConfig.questionId);
        
        try {
          const result = await questionFunction({
            operation: 'generate',
            courseId: courseId,
            assessmentId: questionConfig.questionId,
            studentEmail: currentUser.email,
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
      console.log(`🎯 Successfully generated ${generatedQuestions.length} exam questions`);
      return generatedQuestions;
      
    } catch (error) {
      console.error('❌ Error generating exam questions:', error);
      alert('Failed to generate exam questions: ' + error.message);
      return [];
    } finally {
      setIsGeneratingQuestions(false);
    }
  };

  // Start exam session
  const handleStartExam = async () => {
    if (!currentUser?.email) return;
    
    setIsStartingExam(true);
    try {
      // First, generate all the questions
      const questions = await generateExamQuestions();
      if (questions.length === 0) {
        throw new Error('No questions were generated for the exam');
      }
      
      const startExamFunction = httpsCallable(functions, 'startExamSession');
      
      const result = await startExamFunction({
        courseId: courseId,
        examItemId: examConfig.examId,
        questions: questions,
        timeLimit: examConfig.timeLimit,
        studentEmail: currentUser.email,
        userId: currentUser.uid
      });
      
      console.log('Exam session started:', result.data);
      setExamSession(result.data.session);
      
      // Update URL to show exam in progress
      updateExamURLParams('in-progress', result.data.session.sessionId);
      
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam: ' + error.message);
      // Keep URL in pre-exam state on error
      updateExamURLParams('pre-exam');
    } finally {
      setIsStartingExam(false);
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
  const handleSubmitExam = async (autoSubmit = false) => {
    if (!examSession) return;
    
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
    
    setIsSubmittingExam(true);
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
          const questionFunction = httpsCallable(functions, question.questionId);
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
            sessionId: examSession.sessionId,
            responses: savedAnswers,
            studentEmail: currentUser.email,
            autoSubmit: autoSubmit
          })
        )
      ]);
      
      console.log('📊 Question evaluation results:', questionResults);
      console.log('🎯 Exam session completed:', examResult.data);
      
      setExamResults(examResult.data.results);
      
      // Update URL to show exam completed
      updateExamURLParams('completed', examSession.sessionId);
      
      onExamComplete(examResult.data);
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam: ' + error.message);
      // Keep URL in in-progress state on error
      updateExamURLParams('in-progress', examSession?.sessionId);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // Handle exit exam (with warning)
  const handleExitExam = () => {
    setShowExitWarning(true);
  };

  const confirmExitExam = async () => {
    if (!examSession) return;
    
    setShowExitWarning(false);
    
    try {
      const exitExamFunction = httpsCallable(functions, 'exitExamSession');
      
      const result = await exitExamFunction({
        courseId: courseId,
        sessionId: examSession.sessionId,
        studentEmail: currentUser.email
      });
      
      console.log('Exam session exited:', result.data);
      
      // Update URL back to pre-exam state
      updateExamURLParams('pre-exam');
      
      onExamExit();
      
    } catch (error) {
      console.error('Error exiting exam:', error);
      // Still call onExamExit even if the cloud function fails
      updateExamURLParams('pre-exam');
      onExamExit();
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
  if (!examSession) {
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
                onClick={() => onExamExit()}
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
              This exam contains {examConfig?.questions?.length || 0} questions.
              {examConfig?.timeLimit && (
                <span className="block mt-2 text-gray-700 font-medium">
                  Time Limit: {examConfig.timeLimit} minutes
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
              {examConfig?.timeLimit && <li>• The exam will auto-submit when time expires</li>}
              <li>• Make sure you have a stable internet connection</li>
              <li>• Do not refresh the page or navigate away during the exam</li>
            </ul>
          </div>
          
          <Button
            onClick={handleStartExam}
            disabled={isStartingExam || isGeneratingQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isStartingExam 
              ? (isGeneratingQuestions ? 'Preparing Questions...' : 'Starting Exam...') 
              : sessionDetection?.attemptsSummary?.attemptsUsed > 0 ? 'Start New Attempt' : 'Start Exam'}
          </Button>
        </div>
        </div>
      </div>
    );
  }

  // If exam is completed, show results
  if (examResults) {
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
              <div className="text-2xl font-bold text-blue-700">{examResults.score}</div>
              <div className="text-sm text-blue-600">Score</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-emerald-700">{examResults.percentage}%</div>
              <div className="text-sm text-emerald-600">Percentage</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-slate-700">
                {examResults.correctAnswers}/{examResults.totalQuestions}
              </div>
              <div className="text-sm text-slate-600">Correct</div>
            </div>
          </div>
          
          {/* Question-by-question results */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Question Details:</h3>
            {examResults.questionResults?.map((result, index) => (
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
              onClick={() => onExamComplete(examResults)}
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
    <Sheet open={examSession && examSession.status === 'in_progress' && !examResults} onOpenChange={() => {}}>
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
                  <h1 className="text-lg font-bold text-gray-900">Exam in Progress</h1>
                  <span className="text-xs py-1 px-2 rounded bg-blue-100 text-blue-800 font-medium">
                    SECURE MODE
                  </span>
                  {examSession?.attemptNumber && (
                    <span className="text-xs py-1 px-2 rounded bg-gray-100 text-gray-700 font-medium">
                      Attempt {examSession.attemptNumber}/{examSession.maxAttempts}
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
                  onClick={() => handleSubmitExam(false)}
                  disabled={isSubmittingExam}
                  size="sm"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-2"
                >
                  {isSubmittingExam ? 'Submitting...' : 'Finish Exam'}
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
                      cloudFunctionName={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={examSession.sessionId}
                      onExamAnswerSave={handleAnswerSave}
                      theme="slate"
                      hasExistingAnswer={!!savedAnswers[currentQuestion.questionId]}
                      currentSavedAnswer={savedAnswers[currentQuestion.questionId]}
                    />
                  )}
                  {currentQuestion.type === 'ai-short-answer' && (
                    <AIShortAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={examSession.sessionId}
                      onExamAnswerSave={handleAnswerSave}
                      theme="slate"
                      hasExistingAnswer={!!savedAnswers[currentQuestion.questionId]}
                      currentSavedAnswer={savedAnswers[currentQuestion.questionId]}
                    />
                  )}
                  {currentQuestion.type === 'ai-long-answer' && (
                    <AILongAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={examSession.sessionId}
                      onExamAnswerSave={handleAnswerSave}
                      theme="slate"
                      hasExistingAnswer={!!savedAnswers[currentQuestion.questionId]}
                      currentSavedAnswer={savedAnswers[currentQuestion.questionId]}
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

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-gray-600" />
              <h3 className="text-lg font-semibold">Exit Exam?</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to exit the exam? Your answers will be lost and you may not be able to restart.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                onClick={() => setShowExitWarning(false)}
                variant="outline"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmExitExam}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Exit Exam
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

export default ExamSession;