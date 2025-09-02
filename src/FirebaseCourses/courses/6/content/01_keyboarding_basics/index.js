import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, 
  ChevronRight,
  ChevronLeft,
  Info,
  Hand,
  Monitor,
  User,
  Eye,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Trophy,
  Target,
  Zap,
  Star,
  Type,
  RotateCcw,
  MousePointer,
  Hash
} from 'lucide-react';
import { StandardTrueFalseQuestion } from '../../../../components/assessments';

// Keyboard layout for reference
const KEYBOARD_LAYOUT = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['LShift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'RShift'],
  ['LCtrl', 'LWin', 'LAlt', 'Space', 'RAlt', 'RWin', 'Menu', 'RCtrl']
];

// Finger mapping for proper typing
const FINGER_MAPPING = {
  // Left hand
  '`': 'L-pinky', '1': 'L-pinky', '2': 'L-ring', '3': 'L-middle', '4': 'L-index', '5': 'L-index',
  'Tab': 'L-pinky', 'q': 'L-pinky', 'w': 'L-ring', 'e': 'L-middle', 'r': 'L-index', 't': 'L-index',
  'CapsLock': 'L-pinky', 'a': 'L-pinky', 's': 'L-ring', 'd': 'L-middle', 'f': 'L-index', 'g': 'L-index',
  'LShift': 'L-pinky', 'z': 'L-pinky', 'x': 'L-ring', 'c': 'L-middle', 'v': 'L-index', 'b': 'L-index',
  
  // Right hand
  '6': 'R-index', '7': 'R-index', '8': 'R-middle', '9': 'R-ring', '0': 'R-pinky', '-': 'R-pinky', '=': 'R-pinky',
  'y': 'R-index', 'u': 'R-index', 'i': 'R-middle', 'o': 'R-ring', 'p': 'R-pinky', '[': 'R-pinky', ']': 'R-pinky', '\\': 'R-pinky',
  'h': 'R-index', 'j': 'R-index', 'k': 'R-middle', 'l': 'R-ring', ';': 'R-pinky', "'": 'R-pinky', 'Enter': 'R-pinky',
  'n': 'R-index', 'm': 'R-index', ',': 'R-middle', '.': 'R-ring', '/': 'R-pinky', 'RShift': 'R-pinky',
  
  // Thumbs
  'Space': 'thumb', 'LAlt': 'thumb', 'RAlt': 'thumb',
  
  // Special keys
  'Backspace': 'R-pinky', 'LCtrl': 'L-pinky', 'RCtrl': 'R-pinky', 'LWin': 'thumb', 'RWin': 'thumb', 'Menu': 'R-pinky'
};

// Finger colors for visual learning
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

// Tutorial steps with typing exercises
const TUTORIAL_STEPS = [
  {
    id: 'intro',
    title: 'Welcome to Touch Typing',
    description: 'Learn to type without looking at the keyboard! Start typing below to explore the keyboard.',
    focusKeys: [],
    practiceKeys: [],
    typingPrompt: 'Type anything you want to get started!',
    explorationMode: true
  },
  {
    id: 'posture',
    title: 'Proper Typing Posture',
    description: 'Before we begin, ensure you\'re sitting correctly with good posture.',
    focusKeys: [],
    practiceKeys: [],
    typingPrompt: '',
    explorationMode: false
  },
  {
    id: 'home-row',
    title: 'The Home Row',
    description: 'Place your fingers on the home row: ASDF for left hand, JKL; for right hand.',
    focusKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    practiceKeys: ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'],
    typingPrompt: 'Try typing: asdf jkl; asdf jkl;',
    explorationMode: true
  },
  {
    id: 'left-hand',
    title: 'Left Hand Keys',
    description: 'Practice the left hand keys. Each finger has its own column of keys.',
    focusKeys: ['q', 'a', 'z', 'w', 's', 'x', 'e', 'd', 'c', 'r', 'f', 'v', 't', 'g', 'b'],
    practiceKeys: ['q', 'w', 'e', 'r', 't', 'a', 's', 'd', 'f', 'g'],
    typingPrompt: 'Try typing: qwert asdfg zxcvb',
    explorationMode: true
  },
  {
    id: 'right-hand',
    title: 'Right Hand Keys',
    description: 'Now practice the right hand keys. Mirror the left hand pattern.',
    focusKeys: ['y', 'h', 'n', 'u', 'j', 'm', 'i', 'k', ',', 'o', 'l', '.', 'p', ';', '/'],
    practiceKeys: ['y', 'u', 'i', 'o', 'p', 'h', 'j', 'k', 'l', ';'],
    typingPrompt: 'Try typing: yuiop hjkl; nm,.',
    explorationMode: true
  },
  {
    id: 'thumbs',
    title: 'Space Bar',
    description: 'Both thumbs rest on the space bar. Practice pressing it!',
    focusKeys: ['Space'],
    practiceKeys: ['Space'],
    typingPrompt: 'Try typing: the quick brown fox',
    explorationMode: true
  },
  {
    id: 'numbers',
    title: 'Number Row',
    description: 'Reach up from the home row to type numbers.',
    focusKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    practiceKeys: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    typingPrompt: 'Try typing: 1234567890',
    explorationMode: true
  },
  {
    id: 'special',
    title: 'Special Keys',
    description: 'Practice the special keys: Shift, Enter, Backspace, and Tab.',
    focusKeys: ['LShift', 'RShift', 'Enter', 'Backspace', 'Tab'],
    practiceKeys: ['Tab', 'Enter', 'Backspace'],
    typingPrompt: 'Try typing a sentence with capital letters!',
    explorationMode: true
  },
  {
    id: 'completion',
    title: 'Lesson Complete',
    description: 'Congratulations! You\'ve learned the fundamentals of touch typing.',
    focusKeys: [],
    practiceKeys: [],
    typingPrompt: '',
    explorationMode: false,
    isCompletionStep: true
  }
];

// Posture Guide Component
const PostureGuide = ({ isActive }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isActive ? 1 : 0.5, scale: isActive ? 1 : 0.9 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <User className="text-blue-600" />
        Proper Typing Posture
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          <motion.div 
            className="flex items-start gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Monitor className="text-green-500 mt-1" size={20} />
            <div>
              <p className="font-semibold">Screen Position</p>
              <p className="text-sm text-gray-600">Eye level, arm's length away</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Hand className="text-purple-500 mt-1" size={20} />
            <div>
              <p className="font-semibold">Hand Position</p>
              <p className="text-sm text-gray-600">Wrists floating, not resting</p>
            </div>
          </motion.div>
        </div>
        
        <div className="space-y-3">
          <motion.div 
            className="flex items-start gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <User className="text-blue-500 mt-1" size={20} />
            <div>
              <p className="font-semibold">Body Position</p>
              <p className="text-sm text-gray-600">Sit straight, feet flat on floor</p>
            </div>
          </motion.div>
          
          <motion.div 
            className="flex items-start gap-3"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <Eye className="text-orange-500 mt-1" size={20} />
            <div>
              <p className="font-semibold">Eyes</p>
              <p className="text-sm text-gray-600">Look at screen, not keyboard</p>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Typing Display Component
const TypingDisplay = ({ typedText, keyHistory, onClear, typingPrompt, charCount }) => {
  return (
    <motion.div 
      className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          <Type className="text-indigo-600" />
          Typing Explorer
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Characters: <span className="font-bold">{charCount}</span>
          </span>
          <button
            onClick={onClear}
            className="px-3 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 shadow-sm"
          >
            <RotateCcw size={16} />
            Clear
          </button>
        </div>
      </div>

      {/* Typing Prompt */}
      {typingPrompt && (
        <div className="mb-4 p-3 bg-yellow-100 rounded-lg border border-yellow-300">
          <p className="text-sm font-medium text-yellow-800 flex items-center gap-2">
            <MousePointer className="animate-gentleBounce" size={16} />
            {typingPrompt}
          </p>
        </div>
      )}

      {/* Main Typing Display */}
      <div className="bg-white rounded-lg p-6 min-h-[120px] mb-4 border-2 border-indigo-200">
        <div className="text-2xl font-mono leading-relaxed whitespace-pre-wrap break-all">
          {typedText || (
            <span className="text-gray-400 italic">Start typing to see your text here...</span>
          )}
          <span className="animate-pulse">|</span>
        </div>
      </div>

    </motion.div>
  );
};

// Main Component
const KeyboardingBasics = ({ courseId, onNavigateToLesson }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [lessonCompleted, setLessonCompleted] = useState(false);
  const [highlightedKeys, setHighlightedKeys] = useState([]);
  const [targetKey, setTargetKey] = useState(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [completedKeys, setCompletedKeys] = useState([]);
  const [gameMode, setGameMode] = useState(false);
  
  // New states for typing display
  const [typedText, setTypedText] = useState('');
  const [keyHistory, setKeyHistory] = useState([]);
  const [currentPressedKey, setCurrentPressedKey] = useState(null);
  
  const typingAreaRef = useRef(null);

  useEffect(() => {
    // Update highlighted keys based on current step
    const step = TUTORIAL_STEPS[currentStep];
    setHighlightedKeys(step.focusKeys || []);
    
    // Start game mode for practice steps (only if not in exploration mode)
    if (step.practiceKeys && step.practiceKeys.length > 0 && !step.explorationMode) {
      setGameMode(true);
      setCompletedKeys([]);
      selectRandomTargetKey(step.practiceKeys);
    } else {
      setGameMode(false);
      setTargetKey(null);
    }
    
    // Clear typing when leaving this step
    return () => {
      setTypedText('');
      setKeyHistory([]);
    };
  }, [currentStep]);

  // Keyboard event listener for both game and exploration
  useEffect(() => {
    const handleKeyDown = (e) => {
      const step = TUTORIAL_STEPS[currentStep];
      
      // Handle exploration mode typing
      if (step.explorationMode) {
        // Prevent default for special keys that cause unwanted behavior
        if (e.key === 'Tab' || e.key === ' ') {
          e.preventDefault();
        }
        
        // Update typed text
        if (e.key === 'Backspace') {
          setTypedText(prev => prev.slice(0, -1));
        } else if (e.key === 'Enter') {
          setTypedText(prev => prev + '\n');
          updateKeyHistory('Enter');
        } else if (e.key === 'Tab') {
          setTypedText(prev => prev + '    ');
          updateKeyHistory('Tab');
        } else if (e.key.length === 1) {
          setTypedText(prev => prev + e.key);
          updateKeyHistory(e.key);
          // Award points for typing practice in exploration mode
          setScore(prev => prev + 1);
        }
        
        // Show pressed key on keyboard
        const normalizedKey = normalizeKey(e.key);
        setCurrentPressedKey(normalizedKey);
      }
      
      // Handle game mode
      if (gameMode && targetKey) {
        // Prevent space from scrolling in game mode
        if (e.key === ' ') {
          e.preventDefault();
        }
        let pressedKey = normalizeKey(e.key);
        handleKeyClick(pressedKey);
      }
    };

    const handleKeyUp = () => {
      setCurrentPressedKey(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentStep, gameMode, targetKey, typedText]);

  const normalizeKey = (key) => {
    if (key === ' ') return 'Space';
    if (key === 'Enter') return 'Enter';
    if (key === 'Backspace') return 'Backspace';
    if (key === 'Tab') return 'Tab';
    return key.toLowerCase();
  };

  const updateKeyHistory = (key) => {
    setKeyHistory(prev => {
      const newHistory = [...prev, key];
      // Keep only last 20 keys
      return newHistory.slice(-20);
    });
  };

  const clearTyping = () => {
    setTypedText('');
    setKeyHistory([]);
  };

  const selectRandomTargetKey = (keys) => {
    const availableKeys = keys.filter(k => !completedKeys.includes(k));
    if (availableKeys.length === 0) {
      // All keys completed!
      setTargetKey(null);
      setFeedback({ type: 'complete', message: '🎉 Level Complete!' });
      return;
    }
    const randomKey = availableKeys[Math.floor(Math.random() * availableKeys.length)];
    setTargetKey(randomKey);
    setFeedback(null);
  };


  const handleKeyClick = (key) => {
    const step = TUTORIAL_STEPS[currentStep];
    
    // Handle exploration mode
    if (step.explorationMode) {
      if (key === 'Backspace') {
        setTypedText(prev => prev.slice(0, -1));
      } else if (key === 'Enter') {
        setTypedText(prev => prev + '\n');
        updateKeyHistory('Enter');
      } else if (key === 'Tab') {
        setTypedText(prev => prev + '    ');
        updateKeyHistory('Tab');
      } else if (key === 'Space') {
        setTypedText(prev => prev + ' ');
        updateKeyHistory('Space');
      } else if (key.length === 1 || (key.length > 1 && key.includes('Shift'))) {
        // Don't add shift keys to text
        if (!key.includes('Shift') && !key.includes('Ctrl') && !key.includes('Alt') && !key.includes('Win')) {
          setTypedText(prev => prev + key);
          updateKeyHistory(key);
        }
      }
      return;
    }
    
    // Handle game mode
    if (!gameMode) return;
    
    setAttempts(prev => prev + 1);
    
    if (key === targetKey || key.toLowerCase() === targetKey) {
      // Correct!
      setScore(prev => prev + 10);
      setCompletedKeys(prev => [...prev, targetKey]);
      setFeedback({ type: 'success', message: '✓ Correct!' });
      
      // Select next key after delay
      setTimeout(() => {
        selectRandomTargetKey(step.practiceKeys);
      }, 1000);
    } else {
      // Wrong key
      setFeedback({ type: 'error', message: '✗ Try again!' });
      
      // Clear feedback after delay
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const handleNextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      setCompletedKeys([]);
      setFeedback(null);
      // Typing is cleared automatically by useEffect
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setCompletedKeys([]);
      setFeedback(null);
      // Typing is cleared automatically by useEffect
    }
  };

  const getKeyStyle = (key) => {
    const step = TUTORIAL_STEPS[currentStep];
    const isHighlighted = highlightedKeys.includes(key) || highlightedKeys.includes(key.toLowerCase());
    const isTarget = targetKey === key || targetKey === key.toLowerCase();
    const isCompleted = completedKeys.includes(key) || completedKeys.includes(key.toLowerCase());
    const isPressed = currentPressedKey === key.toLowerCase() || currentPressedKey === key;
    const finger = FINGER_MAPPING[key];
    const fingerColor = finger ? FINGER_COLORS[finger] : '#94a3b8';
    
    let sizeStyle = 'h-12 min-w-[48px] px-2';
    if (key === 'Space') sizeStyle = 'h-12 w-64';
    else if (key === 'Backspace' || key === 'Tab' || key === 'CapsLock' || key === 'Enter') sizeStyle = 'h-12 min-w-[80px] px-3';
    else if (key.includes('Shift')) sizeStyle = 'h-12 min-w-[100px] px-3';
    else if (key.includes('Ctrl') || key.includes('Alt') || key.includes('Win')) sizeStyle = 'h-12 min-w-[60px] px-2';
    
    let animationClass = '';
    if (isTarget && gameMode) {
      animationClass = 'animate-gentleBounce';
    } else if (isHighlighted && !isCompleted && !isPressed && !step.explorationMode) {
      animationClass = 'animate-subtlePulse';
    }
    
    let bgColor = 'bg-white hover:bg-gray-50';
    if (isPressed) {
      bgColor = 'bg-blue-300';
    } else if (isTarget) {
      bgColor = 'bg-yellow-200';
    } else if (isCompleted) {
      bgColor = 'bg-green-100';
    } else if (isHighlighted) {
      bgColor = 'bg-blue-50';
    }
    
    return `
      relative transition-all duration-100 transform cursor-pointer
      ${sizeStyle}
      ${bgColor}
      ${animationClass}
      border-2 rounded-lg font-mono text-sm flex items-center justify-center shadow-sm hover:shadow-md
      ${isTarget ? 'ring-4 ring-yellow-300 ring-opacity-50 z-20' : ''}
      ${isCompleted ? 'opacity-60' : ''}
      ${isPressed ? 'scale-95 shadow-inner' : ''}
    `;
  };
  
  const getKeyDisplayName = (key) => {
    const displayNames = {
      'LShift': 'Shift',
      'RShift': 'Shift',
      'LCtrl': 'Ctrl',
      'RCtrl': 'Ctrl',
      'LAlt': 'Alt',
      'RAlt': 'Alt',
      'LWin': 'Win',
      'RWin': 'Win'
    };
    return displayNames[key] || key;
  };

  const currentStepData = TUTORIAL_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.h1 
            className="text-4xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <Keyboard className="text-blue-600" size={40} />
            Touch Typing Fundamentals
          </motion.h1>
          <motion.p 
            className="text-gray-600"
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Learn proper typing technique through interactive exploration
          </motion.p>
        </div>

        {/* Score and Progress (only in game mode) */}
        {gameMode && (
          <motion.div 
            className="mb-4 flex justify-center gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              <span className="font-semibold">Score: {score}</span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
              <Target className="text-blue-500" size={20} />
              <span className="font-semibold">
                Progress: {completedKeys.length}/{TUTORIAL_STEPS[currentStep].practiceKeys?.length || 0}
              </span>
            </div>
            <div className="bg-white px-4 py-2 rounded-lg shadow-md flex items-center gap-2">
              <Zap className="text-purple-500" size={20} />
              <span className="font-semibold">
                Accuracy: {attempts > 0 ? Math.round((completedKeys.length / attempts) * 100) : 0}%
              </span>
            </div>
          </motion.div>
        )}

        {/* Progress Bar */}
        <div className="mb-6 bg-white rounded-full p-1 shadow-md">
          <div className="flex items-center justify-center gap-2">
            {TUTORIAL_STEPS.map((step, index) => (
              <div
                key={step.id}
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-all cursor-pointer
                  ${index === currentStep ? 'bg-blue-600 text-white shadow-lg scale-110' : 
                    index < currentStep ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}
                onClick={() => {
                  setCurrentStep(index);
                  setCompletedKeys([]);
                  setFeedback(null);
                }}
              >
                <div className="text-sm font-bold">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Info */}
        <motion.div 
          className="mb-6 bg-white rounded-xl p-6 shadow-lg"
          key={currentStep}
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BookOpen className="text-blue-600" />
              {currentStepData.title}
            </h2>
            {gameMode && targetKey && (
              <motion.div 
                className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-lg"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <Target className="text-yellow-600" />
                <span className="font-bold text-lg">Find: "{getKeyDisplayName(targetKey)}"</span>
              </motion.div>
            )}
          </div>
          
          <p className="text-gray-600 text-lg mb-6">
            {currentStepData.description}
          </p>

          {/* Feedback Message */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-center text-2xl font-bold mb-4 ${
                  feedback.type === 'success' ? 'text-green-600' :
                  feedback.type === 'error' ? 'text-red-600' :
                  'text-blue-600'
                }`}
              >
                {feedback.message}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show Posture Guide on step 1 */}
          {currentStep === 1 && (
            <PostureGuide isActive={true} />
          )}

          {/* Show Typing Display for exploration steps */}
          {currentStepData.explorationMode && (
            <TypingDisplay
              typedText={typedText}
              keyHistory={keyHistory}
              onClear={clearTyping}
              typingPrompt={currentStepData.typingPrompt}
              charCount={typedText.length}
            />
          )}
          
          {/* Show Completion Content for final step */}
          {currentStepData.isCompletionStep && (
            <div className="space-y-6">
              {/* True/False Question for Lesson Completion */}
              <StandardTrueFalseQuestion
                courseId={courseId || '6'}
                cloudFunctionName="course6_01_keyboarding_basics"
                theme="blue"
                title="Lesson Completion"
                displayStyle="checkbox"
                onCorrectAnswer={() => {
                  setLessonCompleted(true);
                }}
                onAttempt={(isCorrect) => {
                  if (isCorrect) {
                    setLessonCompleted(true);
                  }
                }}
              />
              
              {lessonCompleted && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  <div className="p-4 bg-green-50 border border-green-300 rounded-lg">
                    <p className="text-green-800 font-medium flex items-center gap-2">
                      <CheckCircle className="text-green-600" size={20} />
                      Great! You've completed the Touch Typing Fundamentals lesson.
                    </p>
                  </div>
                  
                  <div className="p-6 bg-blue-50 border-2 border-blue-300 rounded-xl">
                    <h4 className="text-lg font-bold text-blue-900 mb-3 flex items-center gap-2">
                      <ChevronRight className="text-blue-600" size={24} />
                      Ready to Continue?
                    </h4>
                    <p className="text-blue-800 mb-4">
                      You have more lessons to complete in this course! Continue your journey to master touch typing.
                    </p>
                    <div className="space-y-3">
                      <button 
                        onClick={() => {
                          // Navigate to lesson 2 (keyboarding practice)
                          if (onNavigateToLesson) {
                            onNavigateToLesson('02_keyboarding_practice');
                          } else {
                            console.log('Navigation handler not available - please check course configuration');
                          }
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-semibold transition-colors shadow-lg inline-flex items-center justify-center gap-2"
                      >
                        Continue to Practice Arena
                        <ChevronRight size={20} />
                      </button>
                      
                      <div className="text-center text-sm text-gray-600">
                        
                        <p>You can also open the <span className="font-semibold">navigation menu</span> to see all lessons</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          )}
        </motion.div>

        {/* Interactive Keyboard - Hide on completion step */}
        {!currentStepData.isCompletionStep && (
        <motion.div 
          className="p-6 bg-white rounded-2xl shadow-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Keyboard className="text-purple-600" />
            Interactive Keyboard
            {currentStepData.explorationMode && (
              <span className="ml-auto text-sm font-normal text-gray-600">
                Type on your keyboard to see keys light up!
              </span>
            )}
            {gameMode && (
              <span className="ml-auto text-sm font-normal text-gray-600">
                Click the highlighted key or press it on your keyboard!
              </span>
            )}
          </h3>
          
          <div className="space-y-2">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 justify-center">
                {row.map((key, keyIndex) => (
                  <motion.div
                    key={`${rowIndex}-${keyIndex}-${key}`}
                    className={getKeyStyle(key)}
                    style={{
                      borderColor: (targetKey === key || targetKey === key.toLowerCase()) 
                        ? '#fbbf24' 
                        : (currentPressedKey === key.toLowerCase() || currentPressedKey === key)
                        ? '#3b82f6'
                        : FINGER_MAPPING[key] ? FINGER_COLORS[FINGER_MAPPING[key]] : '#94a3b8'
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleKeyClick(key)}
                  >
                    <span className="select-none">
                      {key === 'Space' ? '━━━━━' : getKeyDisplayName(key)}
                    </span>
                    {FINGER_MAPPING[key] && (
                      <div 
                        className="absolute -top-1 -right-1 w-2 h-2 rounded-full"
                        style={{ backgroundColor: FINGER_COLORS[FINGER_MAPPING[key]] }}
                      />
                    )}
                    {(completedKeys.includes(key) || completedKeys.includes(key.toLowerCase())) && (
                      <Star className="absolute -top-2 -left-2 text-yellow-500" size={16} fill="currentColor" />
                    )}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
          
          {/* Key History - moved from TypingDisplay */}
          {currentStepData.explorationMode && (
            <div className="mt-6 bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <Hash size={14} />
                Recent Keys (Last 20)
              </h4>
              <div className="flex flex-wrap gap-2">
                {keyHistory.length > 0 ? (
                  keyHistory.map((key, index) => (
                    <motion.span
                      key={`history-${index}-${key}-${Date.now()}`}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full text-sm font-mono border border-blue-200"
                      style={{
                        borderColor: FINGER_MAPPING[key.toLowerCase()] 
                          ? FINGER_COLORS[FINGER_MAPPING[key.toLowerCase()]] 
                          : '#94a3b8'
                      }}
                    >
                      {key === ' ' ? '␣' : key}
                    </motion.span>
                  ))
                ) : (
                  <span className="text-gray-400 text-sm italic">Press keys to see history...</span>
                )}
              </div>
            </div>
          )}
          
          {/* Finger Color Legend */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-3 text-gray-700">Finger Assignment Guide</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-600">Left Hand</h5>
                {['L-pinky', 'L-ring', 'L-middle', 'L-index'].map((finger) => (
                  <div key={finger} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[finger] }} />
                    <span className="text-xs text-gray-600">
                      {finger.replace('L-', '').charAt(0).toUpperCase() + finger.replace('L-', '').slice(1)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-semibold text-gray-600">Right Hand</h5>
                {['R-index', 'R-middle', 'R-ring', 'R-pinky'].map((finger) => (
                  <div key={finger} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded" style={{ backgroundColor: FINGER_COLORS[finger] }} />
                    <span className="text-xs text-gray-600">
                      {finger.replace('R-', '').charAt(0).toUpperCase() + finger.replace('R-', '').slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Tips Section - Hide on completion step */}
        {!currentStepData.isCompletionStep && (
        <motion.div 
          className="mt-6 grid grid-cols-2 gap-4"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-green-800">Remember</h4>
                <p className="text-sm text-green-700 mt-1">
                  Keep your fingers on the home row. Feel for the bumps on F and J keys.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-yellow-600 mt-1" size={20} />
              <div>
                <h4 className="font-semibold text-yellow-800">Pro Tip</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Start slowly and focus on accuracy. Speed will develop naturally with practice.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
              ${currentStep === 0 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md hover:shadow-lg'}`}
          >
            <ChevronLeft size={20} />
            Previous
          </button>
          
          <div className="text-center">
            <p className="text-sm text-gray-600">Step {currentStep + 1} of {TUTORIAL_STEPS.length}</p>
            <p className="text-xs text-gray-500 mt-1">{currentStepData.title}</p>
          </div>
          
          <button
            onClick={handleNextStep}
            disabled={currentStep === TUTORIAL_STEPS.length - 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2
              ${currentStep === TUTORIAL_STEPS.length - 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'}`}
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>

      </div>
    </div>
  );
};

export default KeyboardingBasics;