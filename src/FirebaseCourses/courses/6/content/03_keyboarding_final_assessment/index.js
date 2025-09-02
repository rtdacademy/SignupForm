import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  Trophy, 
  Target, 
  Timer, 
  Gauge,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Play,
  Lock
} from 'lucide-react';
import { getDatabase, ref, set, serverTimestamp, onValue, push } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';
import { sanitizeEmail } from '../../../../../utils/sanitizeEmail';

// Assessment ID for this final test
const ASSESSMENT_ID = 'course6_03_final_typing_assessment';

// Passing criteria for final assessment (higher than practice)
const PASSING_CRITERIA = {
  minWpm: 18,
  minAccuracy: 80
};

// Multiple test texts for variety (shortened for testing, no math equations)
const FINAL_TEST_TEXTS = [
  `The quick fox jumps. Type 123 and 456. Use asdf jkl; keys for typing!`,
  `Hello world! Practice 789 and 321. Home row keys: asdf jkl; are important.`,
  `Type fast and accurate. Numbers: 246, 135, 789. Ready? Start typing now!`,
  `Good typing skills matter. Type 100, 50, and 150. Use all fingers on asdf jkl; row.`,
  `Test your speed now! Count: 111, 222, 333. Keep hands steady on home keys.`
];

/**
 * Keyboarding Final Assessment
 * Type: quiz
 * Estimated Time: 30 minutes
 */
const KeyboardingFinalAssessment = ({ 
  course, 
  courseId, 
  itemId, 
  activeItem, 
  onNavigateToLesson, 
  onNavigateToNext, 
  onAIAccordionContent 
}) => {
  const { currentUser } = useAuth();
  const [previousLessonAcknowledged, setPreviousLessonAcknowledged] = useState(false);
  const [checkingAcknowledgment, setCheckingAcknowledgment] = useState(true);
  const [testStatus, setTestStatus] = useState('ready'); // ready, testing, completed
  const [currentText, setCurrentText] = useState(() => {
    // Select a random text on initial load
    return FINAL_TEST_TEXTS[Math.floor(Math.random() * FINAL_TEST_TEXTS.length)];
  });
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isPassing, setIsPassing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [showCourseCompleteMessage, setShowCourseCompleteMessage] = useState(false);
  
  const audioContext = useRef(null);
  const inputRef = useRef(null);
  const statsInterval = useRef(null);
  const timerInterval = useRef(null);

  // Check if previous lesson (practice) is acknowledged
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setCheckingAcknowledgment(false);
      return;
    }

    const db = getDatabase();
    const acknowledgmentPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/acknowledgments/lesson_complete_acknowledgment`;
    const acknowledgmentRef = ref(db, acknowledgmentPath);

    const unsubscribe = onValue(acknowledgmentRef, (snapshot) => {
      const data = snapshot.val();
      setPreviousLessonAcknowledged(data?.acknowledged === true);
      setCheckingAcknowledgment(false);
    }, (error) => {
      console.error("Error checking acknowledgment:", error);
      setCheckingAcknowledgment(false);
    });

    return () => unsubscribe();
  }, [currentUser, courseId]);

  // Initialize audio
  useEffect(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, []);

  const playSound = useCallback((frequency, duration) => {
    if (!soundEnabled || !audioContext.current) return;
    
    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.05, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);
    
    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  }, [soundEnabled]);

  const calculateStats = useCallback(() => {
    if (!startTime || !isActive) return;
    
    const currentTime = Date.now();
    const timeInMinutes = (currentTime - startTime) / 60000;
    const wordsTyped = correctKeystrokes / 5;
    const currentWpm = Math.round(wordsTyped / timeInMinutes) || 0;
    const currentAccuracy = totalKeystrokes > 0 
      ? Math.round((correctKeystrokes / totalKeystrokes) * 100)
      : 100;
    
    setWpm(currentWpm);
    setAccuracy(currentAccuracy);
  }, [startTime, isActive, correctKeystrokes, totalKeystrokes]);

  useEffect(() => {
    if (isActive && startTime) {
      statsInterval.current = setInterval(calculateStats, 500);
    } else {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }
    }
    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current);
      }
    };
  }, [isActive, startTime, calculateStats]);

  // Timer for elapsed seconds
  useEffect(() => {
    if (isActive && startTime) {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
      
      timerInterval.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        setElapsedSeconds(seconds);
      }, 1000);
    } else {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    }
    return () => {
      if (timerInterval.current) {
        clearInterval(timerInterval.current);
      }
    };
  }, [isActive, startTime]);

  const startTest = () => {
    // Select a new random text that's different from the current one
    let newText = currentText;
    while (newText === currentText && FINAL_TEST_TEXTS.length > 1) {
      newText = FINAL_TEST_TEXTS[Math.floor(Math.random() * FINAL_TEST_TEXTS.length)];
    }
    setCurrentText(newText);
    
    setTestStatus('testing');
    setUserInput('');
    setCurrentIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setElapsedSeconds(0);
    setSubmitError(null);
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const resetTest = () => {
    // Select a new random text when resetting
    let newText = currentText;
    while (newText === currentText && FINAL_TEST_TEXTS.length > 1) {
      newText = FINAL_TEST_TEXTS[Math.floor(Math.random() * FINAL_TEST_TEXTS.length)];
    }
    setCurrentText(newText);
    
    setTestStatus('ready');
    setUserInput('');
    setCurrentIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setElapsedSeconds(0);
    setIsPassing(false);
    setSubmitError(null);
  };

  const handleInput = (e) => {
    const value = e.target.value;
    
    if (!isActive && value.length > 0) {
      setStartTime(Date.now());
      setIsActive(true);
    }
    
    if (value.length > userInput.length) {
      const newChar = value[value.length - 1];
      const expectedChar = currentText[currentIndex];
      
      setTotalKeystrokes(prev => prev + 1);
      
      if (newChar === expectedChar) {
        playSound(600, 0.05);
        setCorrectKeystrokes(prev => prev + 1);
        setCurrentIndex(prev => prev + 1);
        
        if (currentIndex + 1 === currentText.length) {
          completeTest();
        }
      } else {
        playSound(300, 0.1);
        setErrors(prev => [...prev, currentIndex]);
      }
    }
    
    setUserInput(value);
  };

  const completeTest = async () => {
    const endTimestamp = Date.now();
    setEndTime(endTimestamp);
    setIsActive(false);
    
    // Clear intervals immediately to stop stats updates
    if (statsInterval.current) {
      clearInterval(statsInterval.current);
      statsInterval.current = null;
    }
    if (timerInterval.current) {
      clearInterval(timerInterval.current);
      timerInterval.current = null;
    }
    
    // Calculate final stats as a snapshot
    const finalTime = (endTimestamp - startTime) / 60000;
    const finalWpm = Math.round((correctKeystrokes / 5) / finalTime) || 0;
    const finalAccuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100) || 0;
    
    // Set final stats (these won't change anymore since intervals are cleared)
    setWpm(finalWpm);
    setAccuracy(finalAccuracy);
    
    // Check if passing
    const passing = finalWpm >= PASSING_CRITERIA.minWpm && finalAccuracy >= PASSING_CRITERIA.minAccuracy;
    setIsPassing(passing);
    const score = passing ? 1 : 0;
    
    // Save to Firebase
    if (currentUser && currentUser.uid) {
      setSubmitting(true);
      
      try {
        const db = getDatabase();
        
        // Save detailed attempt data (similar to practice mode)
        const attemptData = {
          wpm: finalWpm,
          accuracy: finalAccuracy,
          duration: Math.round((endTimestamp - startTime) / 1000), // duration in seconds
          totalKeystrokes,
          correctKeystrokes,
          errors: errors.length,
          textLength: currentText.length,
          passed: passing,
          score: score,
          timestamp: serverTimestamp(),
          completedAt: endTimestamp
        };
        
        // Save attempt with unique ID
        const attemptsPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/03_keyboarding_final_assessment/attempts`;
        const attemptsRef = push(ref(db, attemptsPath));
        await set(attemptsRef, attemptData);
        
        // Now submit to assessment system
        const functions = getFunctions();
        const universalAssessments = httpsCallable(functions, 'universal_assessments');
        
        // Prepare interaction data for security validation
        const interactionData = {
          startTime: startTime,
          endTime: endTimestamp,
          duration: endTimestamp - startTime,
          events: ['start', 'typing', 'complete'],
          interactionCount: totalKeystrokes
        };
        
        // Submit the score
        const assessmentResult = await universalAssessments({
          operation: 'directScore',
          courseId: String(courseId || '6'),
          assessmentId: ASSESSMENT_ID,
          score: score,
          studentEmail: currentUser.email,
          userId: currentUser.uid,
          interactionData: interactionData,
          metadata: {
            wpm: finalWpm,
            accuracy: finalAccuracy,
            duration: Math.round((endTimestamp - startTime) / 1000),
            totalKeystrokes: totalKeystrokes,
            correctKeystrokes: correctKeystrokes,
            errors: errors.length,
            textLength: currentText.length,
            passingCriteria: PASSING_CRITERIA,
            isPassing: passing
          }
        });
        
        console.log('Final assessment score submitted:', assessmentResult.data);
        
        // Also save completion status (db already defined above)
        const completionPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/03_keyboarding_final_assessment/completed`;
        const completionRef = ref(db, completionPath);
        await set(completionRef, {
          completed: true,
          passed: passing,
          score: score,
          wpm: finalWpm,
          accuracy: finalAccuracy,
          timestamp: serverTimestamp()
        });
        
        // Check if course was marked as completed by the cloud function
        if (assessmentResult.data?.courseCompleted) {
          console.log('🎓 Course 6 has been marked as completed!');
          setShowCourseCompleteMessage(true);
        }
        
        playSound(passing ? 1200 : 800, 0.3);
      } catch (error) {
        console.error('Error submitting assessment score:', error);
        setSubmitError('Failed to submit score. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
    
    setTestStatus('completed');
  };

  // Show loading state while checking acknowledgment
  if (checkingAcknowledgment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking lesson progress...</p>
        </div>
      </div>
    );
  }

  // Show locked state if previous lesson not acknowledged
  if (!previousLessonAcknowledged) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            className="bg-white rounded-xl p-8 shadow-lg border-2 border-yellow-400"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <div className="mb-6 inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full">
                <Lock className="w-10 h-10 text-yellow-600" />
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Assessment Locked
              </h2>
              
              <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-gray-700 mb-2">
                  You need to pass all categories in the <strong>Typing Practice Arena</strong> lesson before accessing the Final Assessment.
                </p>
                <p className="text-sm text-gray-600">
                  Please go back and complete all practice categories with the required speed and accuracy.
                </p>
              </div>
              
              <button
                onClick={() => {
                  if (onNavigateToLesson) {
                    onNavigateToLesson('02_keyboarding_practice');
                  }
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg inline-flex items-center gap-2"
              >
                Go to Typing Practice Arena
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const renderReady = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <Keyboard className="text-blue-600 mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Final Typing Assessment</h2>
          <p className="text-gray-600 mb-6">
            Complete this comprehensive typing test to demonstrate your keyboarding proficiency.
            The test includes letters, numbers, and punctuation.
          </p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-3">Assessment Requirements</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Gauge className="text-blue-600" size={20} />
              <span className="text-gray-700">Minimum Speed: <strong>{PASSING_CRITERIA.minWpm} WPM</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="text-green-600" size={20} />
              <span className="text-gray-700">Minimum Accuracy: <strong>{PASSING_CRITERIA.minAccuracy}%</strong></span>
            </div>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            <strong>Tips for Success:</strong>
          </p>
          <ul className="mt-2 ml-4 list-disc text-sm text-amber-800">
            <li>Take a deep breath and relax before starting</li>
            <li>Focus on accuracy over speed</li>
            <li>Use proper finger positioning on the home row</li>
            <li>Type at a steady, comfortable pace</li>
          </ul>
        </div>
        
        <button
          onClick={startTest}
          className="w-full px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all font-semibold text-lg flex items-center justify-center gap-2"
        >
          <Play size={24} />
          Start Final Assessment
        </button>
      </div>
    </motion.div>
  );

  const renderTesting = () => (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Final Typing Assessment</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button
            onClick={resetTest}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Reset
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-xl shadow-lg">
        <div className="text-lg font-mono leading-relaxed mb-6 p-4 bg-gray-50 rounded-lg" style={{ minHeight: '150px' }}>
          {currentText.split('').map((char, index) => {
            let textColor = 'text-gray-400';
            
            if (index < currentIndex) {
              textColor = errors.includes(index) ? 'text-red-500' : 'text-green-600';
            } else if (index === currentIndex) {
              textColor = 'text-blue-600 font-bold';
            }
            
            return (
              <span key={index} className={textColor}>
                {char}
              </span>
            );
          })}
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={userInput}
          onChange={handleInput}
          className="w-full p-4 text-xl font-mono border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
          placeholder="Start typing here..."
          autoComplete="off"
          spellCheck={false}
        />
        
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Gauge size={20} />
              <span className="font-semibold text-lg">{wpm} WPM</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Required: {PASSING_CRITERIA.minWpm} WPM
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Target size={20} />
              <span className="font-semibold text-lg">{accuracy}%</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Required: {PASSING_CRITERIA.minAccuracy}%
            </div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 text-purple-700">
              <Timer size={20} />
              <span className="font-semibold text-lg">{elapsedSeconds}s</span>
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Time Elapsed
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-4">
          <div className="text-xs text-gray-500 mb-1">Progress: {Math.round((currentIndex / currentText.length) * 100)}%</div>
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <motion.div 
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentIndex / currentText.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleted = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      <div className={`p-8 rounded-xl text-center ${
        isPassing 
          ? 'bg-gradient-to-r from-green-50 to-blue-50' 
          : 'bg-gradient-to-r from-orange-50 to-red-50'
      }`}>
        <Trophy className={`mx-auto mb-4 ${isPassing ? "text-yellow-500" : "text-gray-400"}`} size={64} />
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          {isPassing ? 'Congratulations! Assessment Passed' : 'Assessment Complete'}
        </h2>
        
        {submitError && (
          <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
            <p className="text-red-700">{submitError}</p>
          </div>
        )}
        
        {submitting && (
          <div className="mb-4 text-gray-600">
            Submitting your score...
          </div>
        )}
        
        <div className="mb-6 p-4 bg-white/70 rounded-lg">
          <p className="text-lg text-gray-600 mb-4">
            {isPassing 
              ? "Excellent work! You've successfully demonstrated proficient keyboarding skills."
              : "Keep practicing to improve your speed and accuracy. You can retake the assessment when ready."}
          </p>
          
          <div className="flex justify-center gap-8 text-sm">
            <div className={`flex items-center gap-2 ${wpm >= PASSING_CRITERIA.minWpm ? 'text-green-600' : 'text-red-600'}`}>
              {wpm >= PASSING_CRITERIA.minWpm ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">Speed: {wpm >= PASSING_CRITERIA.minWpm ? 'Pass' : 'Not Met'}</span>
            </div>
            <div className={`flex items-center gap-2 ${accuracy >= PASSING_CRITERIA.minAccuracy ? 'text-green-600' : 'text-red-600'}`}>
              {accuracy >= PASSING_CRITERIA.minAccuracy ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
              <span className="font-medium">Accuracy: {accuracy >= PASSING_CRITERIA.minAccuracy ? 'Pass' : 'Not Met'}</span>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
          <div className="bg-white/80 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Final Speed</p>
            <p className={`text-3xl font-bold ${wpm >= PASSING_CRITERIA.minWpm ? 'text-blue-600' : 'text-gray-600'}`}>
              {wpm} WPM
            </p>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Accuracy</p>
            <p className={`text-3xl font-bold ${accuracy >= PASSING_CRITERIA.minAccuracy ? 'text-green-600' : 'text-gray-600'}`}>
              {accuracy}%
            </p>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Total Keys</p>
            <p className="text-3xl font-bold text-purple-600">{totalKeystrokes}</p>
          </div>
          <div className="bg-white/80 p-4 rounded-lg">
            <p className="text-gray-600 text-sm">Time</p>
            <p className="text-3xl font-bold text-orange-600">{elapsedSeconds}s</p>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={startTest}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Try Again
          </button>
          
          {isPassing && (
            <button
              onClick={() => {
                // Navigate to dashboard
                window.location.href = '/dashboard';
              }}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold"
            >
              🎉 Complete Course & Return to Dashboard
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Keyboarding Course</h1>
          <p className="text-gray-600">Final Assessment</p>
        </div>
        
        {testStatus === 'ready' && renderReady()}
        {testStatus === 'testing' && renderTesting()}
        {testStatus === 'completed' && renderCompleted()}
      </div>
    </div>
  );
};

export default KeyboardingFinalAssessment;