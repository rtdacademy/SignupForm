export const interactiveExamples = {
  'interactive-quiz': {
    id: 'interactive-quiz',
    title: 'Interactive Quiz Component',
    category: 'Interactive',
    description: 'Multiple choice quiz with instant feedback',
    tags: ['quiz', 'interactive', 'assessment', 'feedback'],
    difficulty: 'intermediate',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Button } from '../../../../components/ui/button';",
      "import { RadioGroup, RadioGroupItem } from '../../../../components/ui/radio-group';",
      "import { Label } from '../../../../components/ui/label';",
      "import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';"
    ],
    code: `const InteractiveQuizSection = ({ course, courseId, isStaffView, devMode }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  
  const questions = [
    {
      id: 1,
      question: "What is the speed of light in a vacuum?",
      options: [
        { id: 'a', text: '299,792,458 meters per second', correct: true },
        { id: 'b', text: '300,000,000 meters per second', correct: false },
        { id: 'c', text: '299,792,458 kilometers per second', correct: false },
        { id: 'd', text: '186,282 meters per second', correct: false }
      ],
      explanation: "The speed of light in a vacuum is exactly 299,792,458 meters per second."
    },
    {
      id: 2,
      question: "Which of the following is Newton's Second Law of Motion?",
      options: [
        { id: 'a', text: 'An object at rest stays at rest', correct: false },
        { id: 'b', text: 'F = ma', correct: true },
        { id: 'c', text: 'For every action, there is an equal and opposite reaction', correct: false },
        { id: 'd', text: 'Energy cannot be created or destroyed', correct: false }
      ],
      explanation: "Newton's Second Law states that Force equals mass times acceleration (F = ma)."
    }
  ];
  
  const currentQ = questions[currentQuestion];
  const selectedOption = currentQ.options.find(opt => opt.id === selectedAnswer);
  const isCorrect = selectedOption?.correct;
  
  const handleSubmit = () => {
    if (!selectedAnswer) return;
    
    setShowFeedback(true);
    if (isCorrect) {
      setScore(score + 1);
    }
  };
  
  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer('');
      setShowFeedback(false);
    }
  };
  
  const resetQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer('');
    setShowFeedback(false);
    setScore(0);
  };
  
  const isQuizComplete = currentQuestion === questions.length - 1 && showFeedback;

  return (
    <div className="interactive-quiz-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🧪 Knowledge Check</span>
            <span className="text-sm font-normal">
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!isQuizComplete ? (
            <div className="space-y-4">
              {/* Question */}
              <div>
                <h3 className="font-medium text-lg mb-4">{currentQ.question}</h3>
                
                {/* Options */}
                <RadioGroup 
                  value={selectedAnswer} 
                  onValueChange={setSelectedAnswer}
                  disabled={showFeedback}
                >
                  <div className="space-y-2">
                    {currentQ.options.map((option) => (
                      <div
                        key={option.id}
                        className={\`flex items-center space-x-2 p-3 rounded-lg border transition-colors
                          \${showFeedback && option.correct ? 'bg-green-50 border-green-300' : ''}
                          \${showFeedback && selectedAnswer === option.id && !option.correct ? 'bg-red-50 border-red-300' : ''}
                          \${!showFeedback ? 'hover:bg-gray-50' : ''}
                        \`}
                      >
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label 
                          htmlFor={option.id} 
                          className="flex-1 cursor-pointer font-normal"
                        >
                          {option.text}
                        </Label>
                        {showFeedback && option.correct && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {showFeedback && selectedAnswer === option.id && !option.correct && (
                          <XCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>
              
              {/* Feedback */}
              {showFeedback && (
                <div className={\`p-4 rounded-lg \${
                  isCorrect ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }\`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 mt-0.5" />
                    <div>
                      <p className="font-medium mb-1">
                        {isCorrect ? 'Correct!' : 'Not quite right.'}
                      </p>
                      <p className="text-sm">{currentQ.explanation}</p>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex gap-2">
                {!showFeedback ? (
                  <Button 
                    onClick={handleSubmit}
                    disabled={!selectedAnswer}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                ) : (
                  <Button onClick={nextQuestion} className="w-full">
                    Next Question
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Quiz Complete */
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2">Quiz Complete!</h3>
                <p className="text-lg text-gray-600">
                  You scored {score} out of {questions.length}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {score === questions.length ? 'Perfect score!' : 'Keep practicing!'}
                </p>
              </div>
              <Button onClick={resetQuiz} variant="outline">
                Try Again
              </Button>
            </div>
          )}
          
          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Progress</span>
              <span>{Math.round((currentQuestion / questions.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: \`\${(currentQuestion / questions.length) * 100}%\` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveQuizSection;`,
    props: {
      questions: "Array of question objects with options and explanations",
      showProgress: true,
      showScore: true
    }
  },

  'drag-drop-matching': {
    id: 'drag-drop-matching',
    title: 'Drag and Drop Matching',
    category: 'Interactive',
    description: 'Interactive matching exercise with drag and drop',
    tags: ['drag-drop', 'matching', 'interactive', 'exercise'],
    difficulty: 'advanced',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Button } from '../../../../components/ui/button';",
      "import { Badge } from '../../../../components/ui/badge';",
      "import { RefreshCw, CheckCircle } from 'lucide-react';"
    ],
    code: `const DragDropMatchingSection = ({ course, courseId, isStaffView, devMode }) => {
  const [matches, setMatches] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  const items = [
    { id: 'newton', term: "Newton's First Law", definition: 'An object at rest stays at rest' },
    { id: 'energy', term: 'Kinetic Energy', definition: 'Energy of motion' },
    { id: 'momentum', term: 'Momentum', definition: 'Mass times velocity' },
    { id: 'force', term: 'Force', definition: 'Mass times acceleration' }
  ];
  
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (draggedItem) {
      setMatches(prev => ({
        ...prev,
        [targetId]: draggedItem.id
      }));
    }
    setDraggedItem(null);
  };
  
  const checkAnswers = () => {
    setShowResults(true);
  };
  
  const reset = () => {
    setMatches({});
    setShowResults(false);
  };
  
  const isCorrect = (termId, matchedId) => {
    return termId === matchedId;
  };
  
  const allCorrect = items.every(item => isCorrect(item.id, matches[item.id]));

  return (
    <div className="drag-drop-matching-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>🎯 Match the Terms</span>
            <Button
              variant="outline"
              size="sm"
              onClick={reset}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4">
            Drag the definitions on the right to match with the correct terms on the left.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Terms Column */}
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Terms</h4>
              {items.map((item) => (
                <div
                  key={item.id}
                  className={\`p-3 border rounded-lg bg-white \${
                    showResults && matches[item.id] 
                      ? isCorrect(item.id, matches[item.id])
                        ? 'border-green-400 bg-green-50'
                        : 'border-red-400 bg-red-50'
                      : 'border-gray-200'
                  }\`}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, item.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.term}</span>
                    {showResults && matches[item.id] && isCorrect(item.id, matches[item.id]) && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  {matches[item.id] && (
                    <div className="mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {items.find(i => i.id === matches[item.id])?.definition}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Definitions Column */}
            <div className="space-y-3">
              <h4 className="font-medium mb-2">Definitions</h4>
              {items
                .filter(item => !Object.values(matches).includes(item.id))
                .map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, item)}
                    className="p-3 border border-gray-200 rounded-lg bg-blue-50 cursor-move hover:bg-blue-100 transition-colors"
                  >
                    {item.definition}
                  </div>
                ))}
            </div>
          </div>
          
          {/* Actions */}
          <div className="mt-6 flex justify-center">
            {!showResults ? (
              <Button 
                onClick={checkAnswers}
                disabled={Object.keys(matches).length !== items.length}
              >
                Check Answers
              </Button>
            ) : (
              <div className="text-center">
                {allCorrect ? (
                  <div className="text-green-600 font-medium">
                    🎉 Perfect! All matches are correct!
                  </div>
                ) : (
                  <div className="text-orange-600 font-medium">
                    Some matches need correction. Try again!
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DragDropMatchingSection;`,
    props: {
      items: "Array of objects with id, term, and definition",
      showFeedback: true
    }
  },

  'interactive-calculator': {
    id: 'interactive-calculator',
    title: 'Interactive Calculator',
    category: 'Interactive',
    description: 'Subject-specific calculator for physics or math problems',
    tags: ['calculator', 'interactive', 'math', 'physics', 'tool'],
    difficulty: 'intermediate',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';",
      "import { Input } from '../../../../components/ui/input';",
      "import { Label } from '../../../../components/ui/label';",
      "import { Button } from '../../../../components/ui/button';",
      "import { Calculator, Info } from 'lucide-react';"
    ],
    code: `const InteractiveCalculatorSection = ({ course, courseId, isStaffView, devMode }) => {
  const [values, setValues] = useState({
    mass: '',
    acceleration: '',
    force: '',
    velocity: '',
    time: '',
    distance: ''
  });
  
  const [results, setResults] = useState({});
  const [activeCalculation, setActiveCalculation] = useState('force');
  
  const calculations = {
    force: {
      name: "Newton's Second Law (F = ma)",
      inputs: ['mass', 'acceleration'],
      calculate: (vals) => vals.mass * vals.acceleration,
      unit: 'N'
    },
    velocity: {
      name: 'Velocity (v = d/t)',
      inputs: ['distance', 'time'],
      calculate: (vals) => vals.distance / vals.time,
      unit: 'm/s'
    },
    momentum: {
      name: 'Momentum (p = mv)',
      inputs: ['mass', 'velocity'],
      calculate: (vals) => vals.mass * vals.velocity,
      unit: 'kg·m/s'
    }
  };
  
  const handleInputChange = (field, value) => {
    setValues(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const calculate = () => {
    const calc = calculations[activeCalculation];
    const inputValues = {};
    
    for (const input of calc.inputs) {
      const val = parseFloat(values[input]);
      if (isNaN(val)) {
        alert(\`Please enter a valid number for \${input}\`);
        return;
      }
      inputValues[input] = val;
    }
    
    const result = calc.calculate(inputValues);
    setResults(prev => ({
      ...prev,
      [activeCalculation]: result
    }));
  };
  
  const currentCalc = calculations[activeCalculation];

  return (
    <div className="interactive-calculator-section mb-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Physics Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Calculation Type Selector */}
          <div className="mb-6">
            <Label>Select Calculation Type</Label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {Object.entries(calculations).map(([key, calc]) => (
                <Button
                  key={key}
                  variant={activeCalculation === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setActiveCalculation(key)}
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </Button>
              ))}
            </div>
          </div>
          
          {/* Current Calculation */}
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium flex items-center gap-2 mb-2">
              <Info className="h-4 w-4" />
              {currentCalc.name}
            </h4>
            
            {/* Input Fields */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              {currentCalc.inputs.map((input) => (
                <div key={input}>
                  <Label htmlFor={input} className="capitalize">
                    {input} {input === 'mass' && '(kg)'} 
                    {input === 'acceleration' && '(m/s²)'}
                    {input === 'distance' && '(m)'}
                    {input === 'time' && '(s)'}
                    {input === 'velocity' && '(m/s)'}
                  </Label>
                  <Input
                    id={input}
                    type="number"
                    step="0.01"
                    value={values[input]}
                    onChange={(e) => handleInputChange(input, e.target.value)}
                    className="mt-1"
                    placeholder="Enter value..."
                  />
                </div>
              ))}
            </div>
            
            {/* Calculate Button */}
            <Button onClick={calculate} className="w-full mt-4">
              Calculate
            </Button>
            
            {/* Result */}
            {results[activeCalculation] !== undefined && (
              <div className="mt-4 p-4 bg-green-100 rounded-lg text-center">
                <p className="text-sm text-gray-600">Result:</p>
                <p className="text-2xl font-bold text-green-800">
                  {results[activeCalculation].toFixed(2)} {currentCalc.unit}
                </p>
              </div>
            )}
          </div>
          
          {/* Example Problems */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium mb-2">Example Problem</h4>
            <p className="text-sm text-gray-600">
              {activeCalculation === 'force' && 
                "A car with mass 1000 kg accelerates at 2 m/s². What force is required?"}
              {activeCalculation === 'velocity' && 
                "A runner covers 100 meters in 10 seconds. What is their velocity?"}
              {activeCalculation === 'momentum' && 
                "A 5 kg ball moves at 10 m/s. What is its momentum?"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InteractiveCalculatorSection;`,
    props: {
      calculations: "Object defining available calculations",
      showExamples: true
    }
  },

  'flashcards': {
    id: 'flashcards',
    title: 'Interactive Flashcards',
    category: 'Interactive',
    description: 'Flip-able flashcards for memorization and review',
    tags: ['flashcards', 'study', 'memorization', 'interactive'],
    difficulty: 'beginner',
    imports: [
      "import React, { useState } from 'react';",
      "import { Card, CardContent } from '../../../../components/ui/card';",
      "import { Button } from '../../../../components/ui/button';",
      "import { ChevronLeft, ChevronRight, RotateCw, Eye } from 'lucide-react';"
    ],
    code: `const FlashcardsSection = ({ course, courseId, isStaffView, devMode }) => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCards, setKnownCards] = useState(new Set());
  
  const flashcards = [
    {
      id: 1,
      front: "What is the formula for kinetic energy?",
      back: "KE = ½mv²\\n\\nWhere:\\nm = mass (kg)\\nv = velocity (m/s)"
    },
    {
      id: 2,
      front: "Define acceleration",
      back: "The rate of change of velocity with respect to time\\n\\na = Δv/Δt"
    },
    {
      id: 3,
      front: "What is Newton's Third Law?",
      back: "For every action, there is an equal and opposite reaction"
    },
    {
      id: 4,
      front: "What is the unit of force?",
      back: "Newton (N)\\n\\n1 N = 1 kg·m/s²"
    }
  ];
  
  const currentFlashcard = flashcards[currentCard];
  const progress = ((knownCards.size / flashcards.length) * 100).toFixed(0);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };
  
  const handleNext = () => {
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
    setIsFlipped(false);
  };
  
  const handlePrevious = () => {
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    setIsFlipped(false);
  };
  
  const toggleKnown = () => {
    const newKnownCards = new Set(knownCards);
    if (knownCards.has(currentFlashcard.id)) {
      newKnownCards.delete(currentFlashcard.id);
    } else {
      newKnownCards.add(currentFlashcard.id);
    }
    setKnownCards(newKnownCards);
  };

  return (
    <div className="flashcards-section mb-6">
      <Card>
        <CardContent className="p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Cards Mastered</span>
              <span>{knownCards.size} / {flashcards.length} ({progress}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{ width: \`\${progress}%\` }}
              />
            </div>
          </div>
          
          {/* Flashcard */}
          <div 
            className="relative h-64 cursor-pointer perspective-1000"
            onClick={handleFlip}
          >
            <div className={\`absolute inset-0 w-full h-full transition-all duration-500 transform-style-preserve-3d \${
              isFlipped ? 'rotate-y-180' : ''
            }\`}>
              {/* Front */}
              <div className="absolute inset-0 w-full h-full backface-hidden">
                <Card className="h-full border-2 border-blue-200 bg-blue-50">
                  <CardContent className="h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <p className="text-lg font-medium">{currentFlashcard.front}</p>
                      <p className="text-sm text-gray-500 mt-4">Click to reveal answer</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Back */}
              <div className="absolute inset-0 w-full h-full rotate-y-180 backface-hidden">
                <Card className="h-full border-2 border-green-200 bg-green-50">
                  <CardContent className="h-full flex items-center justify-center p-6">
                    <div className="text-center">
                      <p className="text-lg whitespace-pre-line">{currentFlashcard.back}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleFlip}
              >
                <RotateCw className="h-4 w-4 mr-1" />
                Flip
              </Button>
              
              <Button
                variant={knownCards.has(currentFlashcard.id) ? "default" : "outline"}
                onClick={toggleKnown}
              >
                <Eye className="h-4 w-4 mr-1" />
                {knownCards.has(currentFlashcard.id) ? "Known" : "Learning"}
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={handleNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Card Counter */}
          <div className="text-center mt-4 text-sm text-gray-600">
            Card {currentCard + 1} of {flashcards.length}
          </div>
        </CardContent>
      </Card>
      
      <style jsx>{\`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      \`}</style>
    </div>
  );
};

export default FlashcardsSection;`,
    props: {
      flashcards: "Array of flashcard objects with front and back text",
      trackProgress: true
    }
  }
};