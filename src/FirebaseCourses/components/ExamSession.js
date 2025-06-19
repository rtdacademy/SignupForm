import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getDatabase, ref, onValue, off } from 'firebase/database';
import { useAuth } from '../../context/AuthContext';
import { sanitizeEmail } from '../../utils/sanitizeEmail';
import { Button } from '../../components/ui/button';
import { StandardMultipleChoiceQuestion, AIShortAnswerQuestion, AILongAnswerQuestion } from './assessments';
import { Clock, AlertCircle, CheckCircle, FileText, ArrowRight, ArrowLeft } from 'lucide-react';

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
  
  const functions = getFunctions();
  const db = getDatabase();
  const sessionListenerRef = useRef(null);
  const timeIntervalRef = useRef(null);

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
          if (data.status === 'completed' && data.results) {
            setExamResults(data.results);
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

  // Pre-generate exam questions by calling cloud functions
  const generateExamQuestions = async () => {
    if (!currentUser?.email || !examConfig?.questions?.length) return [];
    
    setIsGeneratingQuestions(true);
    const generatedQuestions = [];
    
    try {
      console.log('🎯 Pre-generating exam questions...');
      
      for (const questionConfig of examConfig.questions) {
        try {
          const questionFunction = httpsCallable(functions, questionConfig.questionId);
          
          const result = await questionFunction({
            operation: 'generate',
            courseId: courseId,
            assessmentId: questionConfig.questionId,
            studentEmail: currentUser.email,
            topic: 'exam',
            difficulty: 'intermediate'
          });
          
          if (result.data?.success) {
            // Question data is stored in database, just track that it was generated
            generatedQuestions.push({
              ...questionConfig,
              generated: true,
              cloudFunctionId: questionConfig.questionId
            });
            console.log(`✅ Generated question: ${questionConfig.questionId}`);
          } else {
            throw new Error(`Cloud function failed for ${questionConfig.questionId}: ${result.data?.error || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`❌ Error generating question ${questionConfig.questionId}:`, error);
          throw error;
        }
      }
      
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
      
    } catch (error) {
      console.error('Error starting exam:', error);
      alert('Failed to start exam: ' + error.message);
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
      const submitExamFunction = httpsCallable(functions, 'submitExamSession');
      
      const result = await submitExamFunction({
        courseId: courseId,
        sessionId: examSession.sessionId,
        responses: savedAnswers,
        studentEmail: currentUser.email,
        autoSubmit: autoSubmit
      });
      
      console.log('Exam submitted:', result.data);
      setExamResults(result.data.results);
      onExamComplete(result.data);
      
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Failed to submit exam: ' + error.message);
    } finally {
      setIsSubmittingExam(false);
    }
  };

  // Handle exit exam (with warning)
  const handleExitExam = () => {
    setShowExitWarning(true);
  };

  const confirmExitExam = () => {
    setShowExitWarning(false);
    onExamExit();
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
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border p-8 text-center">
          <div className="mb-6">
            <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Ready to Start Your Exam?</h1>
            <p className="text-gray-600">
              This exam contains {examConfig?.questions?.length || 0} questions.
              {examConfig?.timeLimit && (
                <span className="block mt-2 text-orange-600 font-medium">
                  Time Limit: {examConfig.timeLimit} minutes
                </span>
              )}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-yellow-800 mb-2">Exam Instructions:</h3>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• You can navigate between questions and change your answers</li>
              <li>• Your answers are saved automatically</li>
              <li>• You will see your results only after submitting the entire exam</li>
              {examConfig?.timeLimit && <li>• The exam will auto-submit when time expires</li>}
              <li>• Make sure you have a stable internet connection</li>
            </ul>
          </div>
          
          <Button
            onClick={handleStartExam}
            disabled={isStartingExam || isGeneratingQuestions}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            {isStartingExam 
              ? (isGeneratingQuestions ? 'Preparing Questions...' : 'Starting Exam...') 
              : 'Start Exam'}
          </Button>
        </div>
      </div>
    );
  }

  // If exam is completed, show results
  if (examResults) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg border p-8">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Exam Completed!</h1>
            <p className="text-gray-600">Here are your results:</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">{examResults.score}</div>
              <div className="text-sm text-blue-800">Score</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{examResults.percentage}%</div>
              <div className="text-sm text-green-800">Percentage</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {examResults.correctAnswers}/{examResults.totalQuestions}
              </div>
              <div className="text-sm text-purple-800">Correct</div>
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
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
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
    );
  }

  // Main exam interface
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Exam Header */}
      <div className="bg-white rounded-lg shadow border p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="h-6 w-6 text-red-600" />
            <div>
              <h1 className="text-lg font-bold text-gray-900">Exam in Progress</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {generatedQuestions.length} • 
                {answeredCount} answered
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {timeRemaining !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <span className={`font-mono text-lg font-medium ${
                  timeRemaining < 300000 ? 'text-red-600' : 'text-orange-600'
                }`}>
                  {formatTimeRemaining(timeRemaining)}
                </span>
              </div>
            )}
            
            <Button
              onClick={handleExitExam}
              variant="outline"
              className="text-red-600 border-red-600 hover:bg-red-50"
            >
              Exit Exam
            </Button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question Navigation Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow border p-4 sticky top-4">
            <h3 className="font-medium mb-4">Questions</h3>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              {generatedQuestions.map((question, index) => (
                <button
                  key={question.questionId}
                  onClick={() => handleNavigateToQuestion(index)}
                  className={`p-2 text-sm rounded transition-colors ${
                    index === currentQuestionIndex
                      ? 'bg-blue-600 text-white'
                      : savedAnswers[question.questionId]
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                  {savedAnswers[question.questionId] && (
                    <CheckCircle className="h-3 w-3 inline ml-1" />
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t">
              <Button
                onClick={() => handleSubmitExam(false)}
                disabled={isSubmittingExam}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                {isSubmittingExam ? 'Submitting...' : 'Submit Exam'}
              </Button>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {answeredCount} of {generatedQuestions.length} questions answered
              </p>
            </div>
          </div>
        </div>

        {/* Current Question */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentQuestion && (
                <>
                  {(currentQuestion.type === 'standard-multiple-choice' || currentQuestion.type === 'multiple-choice') && (
                    <StandardMultipleChoiceQuestion
                      courseId={courseId}
                      cloudFunctionName={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={examSession.sessionId}
                      onExamAnswerSave={handleAnswerSave}
                      theme="red"
                    />
                  )}
                  {currentQuestion.type === 'ai-short-answer' && (
                    <AIShortAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={examSession.sessionId}
                      onExamAnswerSave={handleAnswerSave}
                      theme="red"
                    />
                  )}
                  {currentQuestion.type === 'ai-long-answer' && (
                    <AILongAnswerQuestion
                      courseId={courseId}
                      cloudFunctionName={currentQuestion.questionId}
                      examMode={true}
                      examSessionId={examSession.sessionId}
                      onExamAnswerSave={handleAnswerSave}
                      theme="red"
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
        </div>
      </div>

      {/* Exit Warning Modal */}
      {showExitWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
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
  );
};

export default ExamSession;