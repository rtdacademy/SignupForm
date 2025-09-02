import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  Trophy, 
  Zap, 
  Target, 
  Timer, 
  TrendingUp,
  Award,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RefreshCw,
  Star,
  Flame,
  CheckCircle,
  Gauge,
  Settings,
  BookOpen,
  Home,
  Hash,
  Code,
  FileText,
  Medal,
  ChevronLeft
} from 'lucide-react';
import { getDatabase, ref, onValue, set, serverTimestamp, push } from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '../../../../../context/AuthContext';

// Assessment ID mapping for each category
const CATEGORY_ASSESSMENT_IDS = {
  homeRow: 'course6_02_keyboarding_homerow',
  beginner: 'course6_02_keyboarding_beginner',
  numbers: 'course6_02_keyboarding_numbers',
  math: 'course6_02_keyboarding_math',
  sentences: 'course6_02_keyboarding_sentences'
};

// Passing criteria for each category (must match backend config)
const PASSING_CRITERIA = {
  homeRow: { minWpm: 20, minAccuracy: 75 },
  beginner: { minWpm: 15, minAccuracy: 70 },
  numbers: { minWpm: 15, minAccuracy: 70 },
  math: { minWpm: 10, minAccuracy: 65 },
  sentences: { minWpm: 18, minAccuracy: 72 }
};

// Practice text collections
const PRACTICE_TEXTS = {
  homeRow: {
    icon: Home,
    color: 'green',
    texts: [
      "asdf jkl; asdf jkl; sad dad asks all. flask falls; dad had salad.",
      "ask dad; all fall; sad lad had a flask. Jack asks dad; sad fall.",
      "flask falls; dad asks all lads. sad jack; all dads ask; fall flask."
    ]
  },
  beginner: {
    icon: BookOpen,
    color: 'blue',
    texts: [
      "The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.",
      "How vexingly quick daft zebras jump. The five boxing wizards jump quickly.",
      "Sphinx of black quartz, judge my vow. Waltz, bad nymph, for quick jigs vex."
    ]
  },
  numbers: {
    icon: Hash,
    color: 'purple',
    texts: [
      "The year 2024 had 365 days and 12 months with 52 weeks. Each week contains exactly 7 days and 168 hours total.",
      "Phone numbers have 10 digits like 555-123-4567. Area codes range from 201 to 999 across regions.",
      "Pi equals 3.14159 and continues infinitely. The golden ratio is approximately 1.618 in mathematics."
    ]
  },
  math: {
    icon: Hash,
    color: 'orange',
    texts: [
      "The formula is x = 2 + 3 * 4 - 5 / 2 = 11.5 when calculated.",
      "Calculate: (10 + 5) * 2 - 8 / 4 = 28 using proper order.",
      "Solve for x: 3x + 7 = 22, so x = 5 after simplification."
    ]
  },
  sentences: {
    icon: FileText,
    color: 'indigo',
    texts: [
      "Practice makes perfect when you work hard every day. Consistency is the key to mastering any skill in life.",
      "The early bird catches the worm, but the second mouse gets the cheese. Sometimes patience pays off more than rushing ahead.",
      "Success comes to those who never give up on their dreams. Every failure is just another step toward your ultimate goal."
    ]
  }
};

// Achievements configuration
const ACHIEVEMENTS = [
  { id: 'first-key', name: 'First Steps', description: 'Type your first key', icon: Star, color: 'text-yellow-500', requirement: 1 },
  { id: 'speed-10', name: 'Getting Started', description: 'Reach 10 WPM', icon: Gauge, color: 'text-blue-500', requirement: 10 },
  { id: 'speed-20', name: 'Picking Up Speed', description: 'Reach 20 WPM', icon: Zap, color: 'text-purple-500', requirement: 20 },
  { id: 'speed-40', name: 'Fast Fingers', description: 'Reach 40 WPM', icon: Flame, color: 'text-orange-500', requirement: 40 },
  { id: 'speed-60', name: 'Speed Demon', description: 'Reach 60 WPM', icon: Zap, color: 'text-red-500', requirement: 60 },
  { id: 'accuracy-80', name: 'Careful Typist', description: '80% accuracy', icon: Target, color: 'text-blue-500', requirement: 80 },
  { id: 'accuracy-90', name: 'Sharp Shooter', description: '90% accuracy', icon: Target, color: 'text-green-500', requirement: 90 },
  { id: 'accuracy-95', name: 'Precision Master', description: '95% accuracy', icon: Trophy, color: 'text-yellow-500', requirement: 95 },
  { id: 'accuracy-100', name: 'Perfect Score', description: '100% accuracy', icon: Medal, color: 'text-gold-500', requirement: 100 },
  { id: 'streak-10', name: 'On Fire', description: '10 correct keys in a row', icon: Flame, color: 'text-red-500', requirement: 10 },
  { id: 'streak-50', name: 'Unstoppable', description: '50 correct keys in a row', icon: Flame, color: 'text-red-600', requirement: 50 },
  { id: 'streak-100', name: 'Legendary Streak', description: '100 correct keys in a row', icon: Flame, color: 'text-red-700', requirement: 100 },
  { id: 'sessions-5', name: 'Regular Practice', description: 'Complete 5 sessions', icon: CheckCircle, color: 'text-green-500', requirement: 5 },
  { id: 'sessions-10', name: 'Dedicated Student', description: 'Complete 10 sessions', icon: Award, color: 'text-purple-500', requirement: 10 },
  { id: 'sessions-25', name: 'Practice Master', description: 'Complete 25 sessions', icon: Trophy, color: 'text-gold-500', requirement: 25 }
];

// Keyboard layout for visual reference
const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
  ['Ctrl', 'Win', 'Alt', 'Space', 'Alt', 'Win', 'Menu', 'Ctrl']
];

// Finger mapping
const FINGER_MAPPING = {
  // Left hand
  '`': 'L-pinky', '1': 'L-pinky', '2': 'L-ring', '3': 'L-middle', '4': 'L-index', '5': 'L-index',
  'Tab': 'L-pinky', 'q': 'L-pinky', 'w': 'L-ring', 'e': 'L-middle', 'r': 'L-index', 't': 'L-index',
  'CapsLock': 'L-pinky', 'a': 'L-pinky', 's': 'L-ring', 'd': 'L-middle', 'f': 'L-index', 'g': 'L-index',
  'Shift': 'L-pinky', 'z': 'L-pinky', 'x': 'L-ring', 'c': 'L-middle', 'v': 'L-index', 'b': 'L-index',
  
  // Right hand
  '6': 'R-index', '7': 'R-index', '8': 'R-middle', '9': 'R-ring', '0': 'R-pinky', '-': 'R-pinky', '=': 'R-pinky',
  'y': 'R-index', 'u': 'R-index', 'i': 'R-middle', 'o': 'R-ring', 'p': 'R-pinky', '[': 'R-pinky', ']': 'R-pinky', '\\': 'R-pinky',
  'h': 'R-index', 'j': 'R-index', 'k': 'R-middle', 'l': 'R-ring', ';': 'R-pinky', "'": 'R-pinky', 'Enter': 'R-pinky',
  'n': 'R-index', 'm': 'R-index', ',': 'R-middle', '.': 'R-ring', '/': 'R-pinky',
  
  // Thumbs
  'Space': 'thumb', 'Alt': 'thumb',
  
  // Special keys
  'Backspace': 'R-pinky', 'Ctrl': 'pinky', 'Win': 'thumb', 'Menu': 'pinky'
};

const FINGER_COLORS = {
  'L-pinky': '#ef4444',
  'L-ring': '#f97316',
  'L-middle': '#eab308',
  'L-index': '#84cc16',
  'R-index': '#22c55e',
  'R-middle': '#06b6d4',
  'R-ring': '#3b82f6',
  'R-pinky': '#8b5cf6',
  'thumb': '#ec4899',
  'pinky': '#64748b'
};

// Main Component
const KeyboardingPractice = ({ courseId, onNavigateToLesson }) => {
  const { currentUser } = useAuth();
  const [lessonAcknowledged, setLessonAcknowledged] = useState(false);
  const [mode, setMode] = useState('setup'); // setup, practice, results, achievements, stats
  const [practiceCategory, setPracticeCategory] = useState('beginner');
  const [currentText, setCurrentText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState([]);
  const [pressedKeys, setPressedKeys] = useState(new Set());
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [unlockedAchievements, setUnlockedAchievements] = useState(() => {
    const saved = localStorage.getItem('keyboarding-achievements');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showAchievement, setShowAchievement] = useState(null);
  const [sessionStats, setSessionStats] = useState(() => {
    const saved = localStorage.getItem('keyboarding-stats');
    return saved ? JSON.parse(saved) : {
      totalTime: 0,
      totalWords: 0,
      avgWpm: 0,
      avgAccuracy: 0,
      sessionsCompleted: 0,
      bestWpm: 0,
      bestAccuracy: 0
    };
  });
  const [completedCategories, setCompletedCategories] = useState(new Set());
  const [passedCategories, setPassedCategories] = useState(new Set());
  const [loadingCategories, setLoadingCategories] = useState(true);
  
  const audioContext = useRef(null);
  const inputRef = useRef(null);
  const statsInterval = useRef(null);
  const timerInterval = useRef(null);

  // Load completed and passed categories from Firebase
  useEffect(() => {
    if (!currentUser || !currentUser.uid) {
      setLoadingCategories(false);
      return;
    }

    const db = getDatabase();
    
    // Load completed categories (new structure with completion details)
    const categoriesPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/completedCategories`;
    const categoriesRef = ref(db, categoriesPath);
    
    // Load passed categories
    const passedPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/passedCategories`;
    const passedRef = ref(db, passedPath);

    const unsubscribeCat = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        // Handle both old format (boolean) and new format (object)
        const completed = new Set(
          Object.keys(data).filter(key => {
            const value = data[key];
            return value === true || (typeof value === 'object' && value.completed === true);
          })
        );
        setCompletedCategories(completed);
        
        // Extract passed categories from new format
        const passedFromCompleted = new Set(
          Object.keys(data).filter(key => {
            const value = data[key];
            return typeof value === 'object' && value.passed === true;
          })
        );
        setPassedCategories(passedFromCompleted);
      } else {
        setCompletedCategories(new Set());
        setPassedCategories(new Set());
      }
    }, (error) => {
      console.error("Error loading completed categories:", error);
    });

    // Also listen to the separate passed categories (for backward compatibility)
    const unsubscribePassed = onValue(passedRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const passed = new Set(Object.keys(data).filter(key => data[key] === true));
        setPassedCategories(prevPassed => new Set([...prevPassed, ...passed]));
      }
    }, (error) => {
      console.error("Error loading passed categories:", error);
    });

    // Check lesson completion based on passed categories
    const checkLessonCompletion = () => {
      const allCategories = Object.keys(PRACTICE_TEXTS);
      // Lesson is complete when all categories are passed
      if (allCategories.every(cat => passedCategories.has(cat))) {
        setLessonAcknowledged(true);
        
        // Save acknowledgment to database
        const ackPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/acknowledgments/lesson_complete_acknowledgment`;
        const ackRef = ref(db, ackPath);
        set(ackRef, {
          acknowledged: true,
          timestamp: serverTimestamp(),
          autoCompleted: true,
          completedCategories: allCategories
        }).catch(console.error);
      } else {
        setLessonAcknowledged(false);
      }
      setLoadingCategories(false);
    };

    // Use a timeout to ensure both listeners have fired
    const timeoutId = setTimeout(checkLessonCompletion, 100);

    return () => {
      unsubscribeCat();
      unsubscribePassed();
      clearTimeout(timeoutId);
    };
  }, [currentUser, courseId, passedCategories]);

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
    };
  }, []);

  // Save achievements to localStorage
  useEffect(() => {
    localStorage.setItem('keyboarding-achievements', JSON.stringify([...unlockedAchievements]));
  }, [unlockedAchievements]);

  // Save stats to localStorage
  useEffect(() => {
    localStorage.setItem('keyboarding-stats', JSON.stringify(sessionStats));
  }, [sessionStats]);

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

  const checkAchievement = useCallback((type, value) => {
    let newAchievements = [];
    
    ACHIEVEMENTS.forEach(achievement => {
      if (unlockedAchievements.has(achievement.id)) return;
      
      if (
        (type === 'wpm' && achievement.id.startsWith('speed-') && value >= achievement.requirement) ||
        (type === 'accuracy' && achievement.id.startsWith('accuracy-') && value >= achievement.requirement) ||
        (type === 'streak' && achievement.id.startsWith('streak-') && value >= achievement.requirement) ||
        (type === 'sessions' && achievement.id.startsWith('sessions-') && value >= achievement.requirement) ||
        (type === 'first-key' && achievement.id === 'first-key')
      ) {
        newAchievements.push(achievement);
      }
    });
    
    if (newAchievements.length > 0) {
      setUnlockedAchievements(prev => {
        const newSet = new Set(prev);
        newAchievements.forEach(a => newSet.add(a.id));
        return newSet;
      });
      
      // Show the first achievement notification
      setShowAchievement(newAchievements[0]);
      playSound(800, 0.3);
      setTimeout(() => setShowAchievement(null), 4000);
    }
  }, [unlockedAchievements, playSound]);

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
    
    checkAchievement('wpm', currentWpm);
    checkAchievement('accuracy', currentAccuracy);
  }, [startTime, isActive, correctKeystrokes, totalKeystrokes, checkAchievement]);

  useEffect(() => {
    if (isActive && startTime) {
      // Update stats every 500ms instead of 100ms to reduce re-renders
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

  // Separate timer interval for real-time updates
  useEffect(() => {
    if (isActive && startTime) {
      // Update immediately when starting
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      setElapsedSeconds(seconds);
      
      // Then update every second
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

  const startPractice = (category = practiceCategory) => {
    const texts = PRACTICE_TEXTS[category].texts;
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setCurrentText(randomText);
    setUserInput('');
    setCurrentIndex(0);
    setErrors([]);
    setStartTime(null);  // Don't set start time yet
    setEndTime(null);
    setIsActive(false);   // Don't activate yet
    setStreak(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setElapsedSeconds(0);
    setMode('practice');
    
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const resetPractice = () => {
    setUserInput('');
    setCurrentIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setElapsedSeconds(0);
    setMode('setup');
  };

  // Reset current text without going back to menu
  const resetCurrentText = () => {
    setUserInput('');
    setCurrentIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setElapsedSeconds(0);
    // Keep the same text and mode
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  // Reset with new random text from same category
  const resetWithNewText = () => {
    const texts = PRACTICE_TEXTS[practiceCategory].texts;
    const randomText = texts[Math.floor(Math.random() * texts.length)];
    setCurrentText(randomText);
    setUserInput('');
    setCurrentIndex(0);
    setErrors([]);
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setWpm(0);
    setAccuracy(100);
    setStreak(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setElapsedSeconds(0);
    // Stay in practice mode
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 100);
  };

  const handleKeyDown = useCallback((e) => {
    const key = e.key.toLowerCase();
    setPressedKeys(prev => new Set([...prev, key]));
  }, []);

  const handleKeyUp = useCallback((e) => {
    const key = e.key.toLowerCase();
    setPressedKeys(prev => {
      const newSet = new Set(prev);
      newSet.delete(key);
      return newSet;
    });
  }, []);

  const handleInput = (e) => {
    const value = e.target.value;
    
    if (!isActive && value.length > 0) {
      setStartTime(Date.now());
      setIsActive(true);
      checkAchievement('first-key');
    }
    
    if (value.length > userInput.length) {
      const newChar = value[value.length - 1];
      const expectedChar = currentText[currentIndex];
      
      setTotalKeystrokes(prev => prev + 1);
      
      if (newChar === expectedChar) {
        playSound(600, 0.05);
        setCorrectKeystrokes(prev => prev + 1);
        setCurrentIndex(prev => prev + 1);
        setStreak(prev => {
          const newStreak = prev + 1;
          checkAchievement('streak', newStreak);
          if (newStreak > bestStreak) {
            setBestStreak(newStreak);
          }
          return newStreak;
        });
        
        if (currentIndex + 1 === currentText.length) {
          completePractice();
        }
      } else {
        playSound(300, 0.1);
        setErrors(prev => [...prev, currentIndex]);
        setStreak(0);
      }
    }
    
    setUserInput(value);
  };

  const completePractice = async () => {
    const endTimestamp = Date.now();
    setEndTime(endTimestamp);
    setIsActive(false);
    setMode('results');
    
    const finalTime = (endTimestamp - startTime) / 60000;
    const finalWpm = Math.round((correctKeystrokes / 5) / finalTime) || 0;
    const finalAccuracy = Math.round((correctKeystrokes / totalKeystrokes) * 100) || 0;
    
    // Determine if the practice session passes the criteria
    const criteria = PASSING_CRITERIA[practiceCategory];
    const isPassing = finalWpm >= criteria.minWpm && finalAccuracy >= criteria.minAccuracy;
    const score = isPassing ? 1 : 0;
    
    // Save attempt to Firebase
    if (currentUser && currentUser.uid) {
      const db = getDatabase();
      
      // Save the attempt
      const attemptData = {
        category: practiceCategory,
        wpm: finalWpm,
        accuracy: finalAccuracy,
        duration: Math.round((endTimestamp - startTime) / 1000), // duration in seconds
        totalKeystrokes,
        correctKeystrokes,
        errors: errors.length,
        bestStreak,
        timestamp: serverTimestamp(),
        completedAt: endTimestamp,
        textLength: currentText.length
      };
      
      const attemptsPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/attempts`;
      const attemptsRef = push(ref(db, attemptsPath));
      
      try {
        await set(attemptsRef, attemptData);
        
        // Submit score to assessment system using direct score update
        const assessmentId = CATEGORY_ASSESSMENT_IDS[practiceCategory];
        if (assessmentId) {
          try {
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
              assessmentId: assessmentId,
              score: score,
              studentEmail: currentUser.email,
              userId: currentUser.uid,
              interactionData: interactionData,
              metadata: {
                category: practiceCategory,
                wpm: finalWpm,
                accuracy: finalAccuracy,
                duration: Math.round((endTimestamp - startTime) / 1000),
                totalKeystrokes: totalKeystrokes,
                correctKeystrokes: correctKeystrokes,
                errors: errors.length,
                bestStreak: bestStreak,
                passingCriteria: criteria,
                isPassing: isPassing,
                textLength: currentText.length
              }
            });
            
            console.log(`Assessment score submitted for ${practiceCategory}:`, assessmentResult.data);
          } catch (assessmentError) {
            console.error('Error submitting assessment score:', assessmentError);
            // Continue even if assessment submission fails
          }
        }
        
        // Always mark this category as completed (attempted)
        const categoryPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/completedCategories/${practiceCategory}`;
        const categoryRef = ref(db, categoryPath);
        await set(categoryRef, { completed: true, passed: isPassing, lastScore: score, timestamp: serverTimestamp() });
        
        // Update local state - always add to completed categories
        setCompletedCategories(prev => new Set([...prev, practiceCategory]));
        
        // Also track passing status separately for UI
        if (isPassing) {
          const passedPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/passedCategories/${practiceCategory}`;
          const passedRef = ref(db, passedPath);
          await set(passedRef, true);
        }
        
        // Check if all categories are now passed (not just completed)
        const allCategories = Object.keys(PRACTICE_TEXTS);
        const updatedPassed = isPassing ? new Set([...passedCategories, practiceCategory]) : passedCategories;
        
        if (isPassing && allCategories.every(cat => updatedPassed.has(cat))) {
          // All categories passed! Auto-acknowledge the lesson
          const ackPath = `users/${currentUser.uid}/firebaseCourses/${courseId || '6'}/02_keyboarding_practice/acknowledgments/lesson_complete_acknowledgment`;
          const ackRef = ref(db, ackPath);
          await set(ackRef, {
            acknowledged: true,
            timestamp: serverTimestamp(),
            autoCompleted: true,
            completedCategories: allCategories
          });
          setLessonAcknowledged(true);
          
          // Show a special achievement for passing all categories
          playSound(1200, 0.4);
          setTimeout(() => {
            setShowAchievement({
              id: 'all-categories',
              name: 'Master Typist',
              description: 'Passed all practice categories!',
              icon: Trophy,
              color: 'text-gold-500'
            });
            setTimeout(() => setShowAchievement(null), 5000);
          }, 500);
        }
      } catch (error) {
        console.error("Error saving practice attempt:", error);
      }
    }
    
    setSessionStats(prev => {
      const newSessions = prev.sessionsCompleted + 1;
      checkAchievement('sessions', newSessions);
      
      return {
        totalTime: prev.totalTime + finalTime,
        totalWords: prev.totalWords + (correctKeystrokes / 5),
        avgWpm: Math.round((prev.avgWpm * prev.sessionsCompleted + finalWpm) / newSessions),
        avgAccuracy: Math.round((prev.avgAccuracy * prev.sessionsCompleted + finalAccuracy) / newSessions),
        sessionsCompleted: newSessions,
        bestWpm: Math.max(prev.bestWpm, finalWpm),
        bestAccuracy: Math.max(prev.bestAccuracy, finalAccuracy)
      };
    });
    
    playSound(1000, 0.2);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const getKeyColor = (key) => {
    // Static keyboard - no highlighting
    return 'bg-white hover:bg-gray-50';
  };

  const getKeyStyle = (key) => {
    const finger = FINGER_MAPPING[key];
    const baseStyle = 'relative transition-all duration-75 transform';
    
    let sizeStyle = 'h-10 min-w-[40px] px-2';
    if (key === 'Space') sizeStyle = 'h-10 w-48';
    else if (key === 'Backspace' || key === 'Tab' || key === 'CapsLock' || key === 'Enter') sizeStyle = 'h-10 min-w-[70px] px-2';
    else if (key === 'Shift') sizeStyle = 'h-10 min-w-[85px] px-2';
    
    return `${baseStyle} ${sizeStyle} ${getKeyColor(key)} border-2 rounded-lg font-mono text-xs flex items-center justify-center shadow-sm hover:shadow-md cursor-pointer`;
  };

  const renderSetup = () => {
    const allCategories = Object.keys(PRACTICE_TEXTS);
    const completedCount = completedCategories.size;
    const passedCount = passedCategories.size;
    const totalCount = allCategories.length;
    const allPassed = passedCount === totalCount;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your Practice</h2>
          <p className="text-gray-600">
            {allPassed 
              ? "🎉 All categories passed! Lesson complete - ready for the final assessment."
              : `Pass all ${totalCount} categories to complete the lesson (${passedCount}/${totalCount} passed, ${completedCount}/${totalCount} attempted)`}
          </p>
          
          {/* Progress bars */}
          <div className="mt-4 max-w-md mx-auto space-y-2">
            {/* Passed progress */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Passed: {passedCount}/{totalCount}</div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-green-500 to-emerald-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(passedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
            {/* Attempted progress */}
            <div>
              <div className="text-xs text-gray-500 mb-1">Attempted: {completedCount}/{totalCount}</div>
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${(completedCount / totalCount) * 100}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(PRACTICE_TEXTS).map(([key, category]) => {
            const Icon = category.icon;
            const displayName = key === 'math' ? 'Math & Formulas' : key;
            const isCompleted = completedCategories.has(key);
            const isPassed = passedCategories.has(key);
            const criteria = PASSING_CRITERIA[key];
            
            // Determine card styling based on status
            let cardStyling = `border-transparent hover:border-${category.color}-500`;
            if (isPassed) {
              cardStyling = 'border-green-500 bg-green-50';
            } else if (isCompleted) {
              cardStyling = 'border-yellow-500 bg-yellow-50';
            }
            
            return (
              <motion.button
                key={key}
                onClick={() => {
                  setPracticeCategory(key);
                  startPractice(key);
                }}
                className={`relative p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-all border-2 ${cardStyling}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {/* Status badges */}
                <div className="absolute -top-2 -right-2 flex gap-1">
                  {isPassed && (
                    <motion.div 
                      className="bg-green-500 text-white rounded-full p-1"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <CheckCircle size={16} />
                    </motion.div>
                  )}
                  {isCompleted && !isPassed && (
                    <motion.div 
                      className="bg-yellow-500 text-white rounded-full p-1"
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                  )}
                </div>
                
                <Icon className={`text-${category.color}-500 mb-3`} size={32} />
                <h3 className="font-semibold text-lg capitalize">{displayName}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {category.texts.length} exercises
                  <span className="block text-xs mt-1">
                    Required: {criteria.minWpm} WPM, {criteria.minAccuracy}% Accuracy
                  </span>
                  {isPassed && (
                    <span className="block text-green-600 font-medium mt-1">✓ Passed</span>
                  )}
                  {isCompleted && !isPassed && (
                    <span className="block text-yellow-600 font-medium mt-1">⚠ Needs Improvement</span>
                  )}
                  {!isCompleted && (
                    <span className="block text-gray-500 font-medium mt-1">Not Attempted</span>
                  )}
                </p>
              </motion.button>
            );
          })}
        </div>
      
        <div className="flex justify-center gap-4">
          <button
            onClick={() => setMode('achievements')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold flex items-center gap-2"
          >
            <Award size={20} />
            View Achievements
          </button>
          
          <button
            onClick={() => setMode('stats')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold flex items-center gap-2"
          >
            <TrendingUp size={20} />
            View Statistics
          </button>
        </div>
      </motion.div>
    );
  };


  const renderPractice = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={resetPractice}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
          >
            <ChevronLeft size={20} />
            Menu
          </button>
          
          <button
            onClick={resetCurrentText}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Reset
          </button>
          
          <button
            onClick={resetWithNewText}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            New Text
          </button>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          <button
            onClick={() => setShowKeyboard(!showKeyboard)}
            className="p-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            <Keyboard size={20} />
          </button>
        </div>
      </div>
      
      <div className="p-6 bg-white rounded-xl shadow-lg">
        {/* Simple text display */}
        <div className="text-2xl font-mono leading-relaxed mb-4">
          {currentText.split('').map((char, index) => {
            // Simple color-only approach
            let textColor = 'text-gray-400'; // Not typed yet
            
            if (index < currentIndex) {
              // Already typed
              textColor = errors.includes(index) ? 'text-red-500' : 'text-green-600';
            } else if (index === currentIndex) {
              // Current character - just make it darker
              textColor = 'text-gray-800';
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
        
        <div className="mt-4 grid grid-cols-4 gap-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-700">
              <Gauge size={20} />
              <span className="font-semibold">{wpm} WPM</span>
            </div>
          </div>
          
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-green-700">
              <Target size={20} />
              <span className="font-semibold">{accuracy}% Accuracy</span>
            </div>
          </div>
          
          <div className="bg-orange-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-orange-700">
              <Flame size={20} />
              <span className="font-semibold">{streak} Streak</span>
            </div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-purple-700">
              <Timer size={20} />
              <span className="font-semibold">
                {!isActive && !startTime ? 'Ready' : `${elapsedSeconds}s`}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {showKeyboard && (
        <motion.div 
          className="p-4 bg-white rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-center text-sm text-gray-600 mb-3">Keyboard Reference - Color shows which finger to use</h3>
          <div className="space-y-1">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 justify-center">
                {row.map((key, keyIndex) => (
                  <div
                    key={`${rowIndex}-${keyIndex}-${key}`}
                    className={getKeyStyle(key)}
                    style={{
                      borderColor: FINGER_MAPPING[key] ? FINGER_COLORS[FINGER_MAPPING[key]] : '#94a3b8'
                    }}
                  >
                    <span className="select-none text-xs">
                      {key === 'Space' ? '' : key}
                    </span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );

  const renderResults = () => {
    const criteria = PASSING_CRITERIA[practiceCategory];
    const isPassing = wpm >= criteria.minWpm && accuracy >= criteria.minAccuracy;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="space-y-6"
      >
        <div className={`p-8 rounded-xl text-center ${
          isPassing 
            ? 'bg-gradient-to-r from-green-50 to-blue-50' 
            : 'bg-gradient-to-r from-orange-50 to-red-50'
        }`}>
          <h2 className="text-3xl font-bold text-gray-800 mb-4 flex items-center justify-center gap-2">
            <Trophy className={isPassing ? "text-yellow-500" : "text-gray-400"} />
            {isPassing ? 'Practice Complete - Passed!' : 'Practice Complete - Try Again'}
          </h2>
          
          {/* Show passing criteria */}
          <div className="mb-4 p-4 bg-white/50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Passing Requirements:</p>
            <div className="flex justify-center gap-6">
              <div className={`flex items-center gap-1 ${wpm >= criteria.minWpm ? 'text-green-600' : 'text-red-600'}`}>
                {wpm >= criteria.minWpm ? <CheckCircle size={16} /> : <span>❌</span>}
                <span className="font-medium">Min {criteria.minWpm} WPM</span>
              </div>
              <div className={`flex items-center gap-1 ${accuracy >= criteria.minAccuracy ? 'text-green-600' : 'text-red-600'}`}>
                {accuracy >= criteria.minAccuracy ? <CheckCircle size={16} /> : <span>❌</span>}
                <span className="font-medium">Min {criteria.minAccuracy}% Accuracy</span>
              </div>
            </div>
          </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 my-8">
          <div>
            <p className="text-gray-600">Final WPM</p>
            <p className="text-3xl font-bold text-blue-600">{wpm}</p>
          </div>
          <div>
            <p className="text-gray-600">Accuracy</p>
            <p className="text-3xl font-bold text-green-600">{accuracy}%</p>
          </div>
          <div>
            <p className="text-gray-600">Best Streak</p>
            <p className="text-3xl font-bold text-orange-600">{bestStreak}</p>
          </div>
          <div>
            <p className="text-gray-600">Time</p>
            <p className="text-3xl font-bold text-purple-600">
              {elapsedSeconds}s
            </p>
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <button
            onClick={() => startPractice()}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
          >
            Practice Again
          </button>
          
          <button
            onClick={resetPractice}
            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-semibold"
          >
            Try Different Category
          </button>
        </div>
      </div>
    </motion.div>
    );
  };

  const renderAchievements = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Achievements ({unlockedAchievements.size}/{ACHIEVEMENTS.length})
        </h2>
        
        <button
          onClick={() => setMode('setup')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedAchievements.has(achievement.id);
          const Icon = achievement.icon;
          
          return (
            <motion.div
              key={achievement.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isUnlocked
                  ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400'
                  : 'bg-gray-50 border-gray-200 opacity-50'
              }`}
              whileHover={isUnlocked ? { scale: 1.05 } : {}}
            >
              <div className="flex items-center gap-3">
                <Icon className={`${achievement.color} ${isUnlocked ? '' : 'grayscale'}`} size={28} />
                <div className="flex-1">
                  <p className="font-semibold">{achievement.name}</p>
                  <p className="text-sm text-gray-600">{achievement.description}</p>
                </div>
                {isUnlocked && (
                  <CheckCircle className="text-green-500" size={24} />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );

  const renderStats = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="text-indigo-600" />
          Your Statistics
        </h2>
        
        <button
          onClick={() => setMode('setup')}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Back
        </button>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 text-sm">Sessions Completed</p>
          <p className="text-3xl font-bold text-indigo-600">{sessionStats.sessionsCompleted}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 text-sm">Average WPM</p>
          <p className="text-3xl font-bold text-purple-600">{sessionStats.avgWpm}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 text-sm">Average Accuracy</p>
          <p className="text-3xl font-bold text-green-600">{sessionStats.avgAccuracy}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 text-sm">Best WPM</p>
          <p className="text-3xl font-bold text-blue-600">{sessionStats.bestWpm}</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 text-sm">Best Accuracy</p>
          <p className="text-3xl font-bold text-green-600">{sessionStats.bestAccuracy}%</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <p className="text-gray-600 text-sm">Total Practice Time</p>
          <p className="text-3xl font-bold text-orange-600">{Math.round(sessionStats.totalTime)} min</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          💡 Tip: Practice regularly for 15-20 minutes daily to see consistent improvement in your typing speed and accuracy!
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      {/* Show completion message if all categories are passed */}
      {lessonAcknowledged && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 px-6 py-3 bg-green-500 text-white rounded-full shadow-lg flex items-center gap-2"
        >
          <CheckCircle size={20} />
          <span className="font-semibold">All Categories Passed! Lesson Complete - Ready for Final Assessment</span>
        </motion.div>
      )}
      
      <AnimatePresence>
        {showAchievement && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-8 right-8 z-50 p-4 bg-white rounded-xl shadow-2xl border-2 border-yellow-400"
          >
            <div className="flex items-center gap-3">
              <Trophy className="text-yellow-500" size={32} />
              <div>
                <p className="font-bold text-lg">Achievement Unlocked!</p>
                <p className="text-gray-600">{showAchievement.name}</p>
                <p className="text-sm text-gray-500">{showAchievement.description}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3">
            <Keyboard className="text-blue-600" size={40} />
            Typing Practice Arena
          </h1>
          <p className="text-gray-600">Build speed and accuracy through focused practice</p>
        </div>
        
        {mode === 'setup' && renderSetup()}
        {mode === 'practice' && renderPractice()}
        {mode === 'results' && renderResults()}
        {mode === 'achievements' && renderAchievements()}
        {mode === 'stats' && renderStats()}
      </div>
    </div>
  );
};

export default KeyboardingPractice;