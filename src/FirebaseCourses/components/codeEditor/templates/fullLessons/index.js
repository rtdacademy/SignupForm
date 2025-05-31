// Full lesson templates
export const physicsTemplate = `import React, { useState } from 'react';

const PhysicsLesson = ({ course, courseId, itemConfig, isStaffView, devMode }) => {
  const [showSolution, setShowSolution] = useState(false);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Lesson Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Physics Lesson: Momentum Conservation
        </h1>
        <p className="text-lg text-gray-600">
          Understanding how momentum is conserved in collisions and interactions
        </p>
        <div className="flex gap-2 mt-4">
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Physics 30</span>
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Core Concept</span>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
        <h2 className="text-xl font-semibold text-amber-900 mb-4">📚 Learning Objectives</h2>
        <ul className="space-y-2 text-amber-800">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Define momentum and understand its vector nature
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Apply the law of conservation of momentum
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Solve collision problems using momentum principles
          </li>
        </ul>
      </div>

      {/* Theory Section */}
      <div className="mb-8 bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🔬 Theory</h2>
        
        <div className="prose max-w-none">
          <p className="text-gray-700 mb-4">
            Momentum is a fundamental concept in physics that describes the motion of objects. 
            It's defined as the product of an object's mass and velocity.
          </p>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 my-6">
            <h3 className="font-semibold text-blue-900 mb-2">Key Formula</h3>
            <div className="text-center">
              <span className="text-xl font-mono bg-white px-4 py-2 rounded border">
                p = mv
              </span>
            </div>
            <p className="text-sm text-blue-700 mt-2 text-center">
              where p = momentum (kg⋅m/s), m = mass (kg), v = velocity (m/s)
            </p>
          </div>
          
          <p className="text-gray-700">
            The law of conservation of momentum states that in a closed system, 
            the total momentum before an interaction equals the total momentum after the interaction.
          </p>
        </div>
      </div>

      {/* Examples Section */}
      <div className="mb-8 bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">💡 Example Problem</h2>
        
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="font-semibold text-gray-800 mb-2">Collision Problem</h3>
          <p className="text-gray-700 mb-4">
            A 1200 kg car traveling at 25 m/s collides with a stationary 1000 kg car. 
            After the collision, both cars move together. Find their final velocity.
          </p>
          
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
          
          {showSolution && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <h4 className="font-semibold text-green-900 mb-2">Solution Steps:</h4>
              <ol className="list-decimal list-inside space-y-2 text-green-800">
                <li>Initial momentum: p₁ = (1200 kg)(25 m/s) + (1000 kg)(0) = 30,000 kg⋅m/s</li>
                <li>Final momentum: p₂ = (1200 + 1000 kg)(v) = 2200v kg⋅m/s</li>
                <li>Conservation: 30,000 = 2200v</li>
                <li>Final velocity: v = 13.6 m/s</li>
              </ol>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Assessment */}
      <div className="mb-8 bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h2 className="text-2xl font-semibold text-purple-900 mb-4">🤖 AI Assessment</h2>
        <p className="text-purple-700 mb-4">
          Test your understanding with this AI-generated question:
        </p>
        
        {/* Placeholder for AI assessment component */}
        <div className="bg-white p-6 border border-purple-200 rounded-lg">
          <p className="text-center text-gray-600 italic">
            AI Assessment Component will be loaded here
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            {devMode && "Dev Mode: Use AIMultipleChoiceQuestion component here"}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">📝 Lesson Summary</h2>
        <ul className="space-y-2 text-indigo-800">
          <li>• Momentum (p = mv) is conserved in closed systems</li>
          <li>• Total momentum before = Total momentum after</li>
          <li>• This principle applies to all types of collisions</li>
          <li>• Vector nature of momentum must be considered in 2D/3D problems</li>
        </ul>
      </div>
    </div>
  );
};

export default PhysicsLesson;`;

export const financialTemplate = `import React, { useState } from 'react';

const FinancialLiteracyLesson = ({ course, courseId, itemConfig, isStaffView, devMode }) => {
  const [selectedScenario, setSelectedScenario] = useState(null);

  const scenarios = [
    {
      id: 1,
      title: "First Time Home Buyer",
      description: "22-year-old recent graduate considering purchasing their first home",
      ethical_considerations: ["Affordability", "Long-term commitment", "Emergency fund impact"]
    },
    {
      id: 2,
      title: "Student Loan Decision",
      description: "High school student choosing between expensive university vs community college",
      ethical_considerations: ["Future earning potential", "Debt burden", "Educational quality"]
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Lesson Header */}
      <div className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Ethics in Financial Decision Making
        </h1>
        <p className="text-lg text-gray-600">
          Exploring the moral dimensions of personal finance choices
        </p>
        <div className="flex gap-2 mt-4">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Financial Literacy</span>
          <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">Ethics Module</span>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">🎯 Learning Objectives</h2>
        <ul className="space-y-2 text-blue-800">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Identify ethical considerations in financial decisions
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Analyze the impact of financial choices on stakeholders
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Apply ethical frameworks to real-world scenarios
          </li>
        </ul>
      </div>

      {/* Key Concepts */}
      <div className="mb-8 bg-white p-6 rounded-lg border shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📚 Key Ethical Principles</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2">🤝 Responsibility</h3>
            <p className="text-yellow-800 text-sm">
              Consider how your financial decisions affect yourself, family, and community
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-green-900 mb-2">⚖️ Fairness</h3>
            <p className="text-green-800 text-sm">
              Ensure financial decisions are equitable and don't exploit others
            </p>
          </div>
          
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-900 mb-2">🔮 Long-term Thinking</h3>
            <p className="text-purple-800 text-sm">
              Consider future consequences and sustainability of financial choices
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">📖 Transparency</h3>
            <p className="text-blue-800 text-sm">
              Be honest about financial capabilities and limitations
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Scenarios */}
      <div className="mb-8 bg-orange-50 p-6 rounded-lg border border-orange-200">
        <h2 className="text-2xl font-semibold text-orange-900 mb-4">🎭 Scenario Analysis</h2>
        
        <div className="space-y-4">
          {scenarios.map((scenario) => (
            <div key={scenario.id} className="bg-white p-4 border rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-gray-800">{scenario.title}</h3>
                <button
                  onClick={() => setSelectedScenario(selectedScenario === scenario.id ? null : scenario.id)}
                  className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
                >
                  {selectedScenario === scenario.id ? 'Close' : 'Analyze'}
                </button>
              </div>
              
              <p className="text-gray-700 text-sm mb-3">{scenario.description}</p>
              
              {selectedScenario === scenario.id && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                  <h4 className="font-semibold text-orange-900 mb-2">Ethical Considerations:</h4>
                  <ul className="list-disc list-inside space-y-1 text-orange-800 text-sm">
                    {scenario.ethical_considerations.map((consideration, index) => (
                      <li key={index}>{consideration}</li>
                    ))}
                  </ul>
                  
                  <div className="mt-4 p-3 bg-white border border-orange-200 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Discussion Question:</strong> What additional factors should this person consider 
                      when making their decision? How might their choice affect others?
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Assessment Section */}
      <div className="mb-8 bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">🤖 Ethical Reasoning Assessment</h2>
        
        <div className="bg-white p-6 border border-indigo-200 rounded-lg">
          <p className="text-center text-gray-600 italic mb-4">
            AI Assessment Component will analyze your ethical reasoning
          </p>
          <p className="text-center text-sm text-gray-500">
            {devMode && "Dev Mode: Use AILongAnswerQuestion component for ethical scenario analysis"}
          </p>
        </div>
      </div>

      {/* Reflection */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">🤔 Personal Reflection</h2>
        <div className="space-y-4">
          <div className="p-4 bg-white border rounded">
            <h3 className="font-medium text-gray-800 mb-2">Values Assessment</h3>
            <p className="text-gray-600 text-sm">
              What personal values guide your financial decisions? How do you balance 
              personal needs with ethical considerations?
            </p>
          </div>
          
          <div className="p-4 bg-white border rounded">
            <h3 className="font-medium text-gray-800 mb-2">Future Planning</h3>
            <p className="text-gray-600 text-sm">
              How will you integrate ethical thinking into your future financial planning?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialLiteracyLesson;`;

export const interactiveTemplate = `import React, { useState, useEffect } from 'react';

const InteractiveLesson = ({ course, courseId, itemConfig, isStaffView, devMode }) => {
  const [ballPosition, setBallPosition] = useState({ x: 50, y: 50 });
  const [ballVelocity, setBallVelocity] = useState({ x: 2, y: 1.5 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);

  // Bouncing ball animation
  useEffect(() => {
    let interval;
    if (isAnimating) {
      interval = setInterval(() => {
        setBallPosition(prev => {
          let newX = prev.x + ballVelocity.x;
          let newY = prev.y + ballVelocity.y;
          let newVelX = ballVelocity.x;
          let newVelY = ballVelocity.y;

          // Bounce off walls
          if (newX >= 95 || newX <= 5) {
            newVelX = -newVelX;
            newX = newX >= 95 ? 95 : 5;
          }
          if (newY >= 95 || newY <= 5) {
            newVelY = -newVelY;
            newY = newY >= 95 ? 95 : 5;
          }

          setBallVelocity({ x: newVelX, y: newVelY });
          return { x: newX, y: newY };
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isAnimating, ballVelocity]);

  // Game timer
  useEffect(() => {
    let timer;
    if (isAnimating && timeLeft > 0) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      setIsAnimating(false);
    }
    return () => clearTimeout(timer);
  }, [isAnimating, timeLeft]);

  const handleBallClick = () => {
    if (isAnimating && timeLeft > 0) {
      setScore(score + 1);
      // Add some randomness to velocity
      setBallVelocity({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 4
      });
    }
  };

  const startGame = () => {
    setIsAnimating(true);
    setScore(0);
    setTimeLeft(30);
    setBallPosition({ x: 50, y: 50 });
    setBallVelocity({ x: 2, y: 1.5 });
  };

  const resetSimulation = () => {
    setIsAnimating(false);
    setScore(0);
    setTimeLeft(30);
    setBallPosition({ x: 50, y: 50 });
    setBallVelocity({ x: 2, y: 1.5 });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Interactive Physics: Motion and Collisions
        </h1>
        <p className="text-lg text-gray-600">
          Explore physics concepts through interactive simulations and games
        </p>
        <div className="flex gap-2 mt-4">
          <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">Interactive</span>
          <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm">Simulation</span>
        </div>
      </div>

      {/* Learning Objectives */}
      <div className="mb-8 bg-cyan-50 p-6 rounded-lg border border-cyan-200">
        <h2 className="text-xl font-semibold text-cyan-900 mb-4">🎯 Learning Objectives</h2>
        <ul className="space-y-2 text-cyan-800">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Observe how objects behave in motion
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Understand collision dynamics through interaction
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✓</span>
            Apply physics concepts in real-time scenarios
          </li>
        </ul>
      </div>

      {/* Interactive Simulation */}
      <div className="mb-8 bg-white p-6 rounded-lg border shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">🎮 Bouncing Ball Simulation</h2>
          <div className="flex gap-4 text-sm">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded">Score: {score}</span>
            <span className="bg-red-100 text-red-800 px-3 py-1 rounded">Time: {timeLeft}s</span>
          </div>
        </div>
        
        {/* Game Area */}
        <div 
          className="relative w-full h-96 bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-300 rounded-lg overflow-hidden cursor-crosshair"
          style={{ userSelect: 'none' }}
        >
          {/* Bouncing Ball */}
          <div
            className="absolute w-6 h-6 bg-red-500 rounded-full cursor-pointer transform -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-110 shadow-lg"
            style={{
              left: \`\${ballPosition.x}%\`,
              top: \`\${ballPosition.y}%\`,
            }}
            onClick={handleBallClick}
          />
          
          {/* Velocity Vector Display */}
          {isAnimating && (
            <div className="absolute top-4 left-4 bg-white bg-opacity-80 p-2 rounded text-xs">
              <div>Velocity X: {ballVelocity.x.toFixed(1)}</div>
              <div>Velocity Y: {ballVelocity.y.toFixed(1)}</div>
            </div>
          )}
          
          {/* Game Over Overlay */}
          {!isAnimating && timeLeft === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white p-6 rounded-lg text-center">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Game Over!</h3>
                <p className="text-gray-700 mb-4">Final Score: {score}</p>
                <button
                  onClick={startGame}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Play Again
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex gap-4 mt-4 justify-center">
          <button
            onClick={startGame}
            disabled={isAnimating}
            className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isAnimating ? 'Game Running...' : 'Start Game'}
          </button>
          
          <button
            onClick={resetSimulation}
            className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Reset
          </button>
        </div>
        
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm text-gray-700">
          <p><strong>Instructions:</strong> Click the red ball to score points! Each click changes its direction randomly. 
          Try to score as many points as possible in 30 seconds.</p>
        </div>
      </div>

      {/* Physics Analysis */}
      <div className="mb-8 bg-emerald-50 p-6 rounded-lg border border-emerald-200">
        <h2 className="text-2xl font-semibold text-emerald-900 mb-4">🔬 Physics Analysis</h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-emerald-800 mb-2">Elastic Collisions</h3>
            <p className="text-emerald-700 text-sm">
              When the ball hits the walls, it demonstrates elastic collision principles. 
              The velocity component perpendicular to the wall reverses while the parallel component remains unchanged.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold text-emerald-800 mb-2">Vector Components</h3>
            <p className="text-emerald-700 text-sm">
              The ball's velocity has both X and Y components. Watch how these change independently 
              when collisions occur with different walls.
            </p>
          </div>
        </div>
      </div>

      {/* Assessment */}
      <div className="mb-8 bg-violet-50 p-6 rounded-lg border border-violet-200">
        <h2 className="text-2xl font-semibold text-violet-900 mb-4">🤖 Interactive Assessment</h2>
        
        <div className="bg-white p-6 border border-violet-200 rounded-lg">
          <p className="text-center text-gray-600 italic mb-4">
            AI Assessment based on your interaction patterns
          </p>
          <p className="text-center text-sm text-gray-500">
            {devMode && "Dev Mode: Track user interaction data for personalized assessment"}
          </p>
        </div>
      </div>

      {/* Reflection Questions */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">💭 Reflection</h2>
        <div className="space-y-4">
          <div className="p-4 bg-white border rounded">
            <h3 className="font-medium text-gray-800 mb-2">Observation</h3>
            <p className="text-gray-600 text-sm">
              What patterns did you notice in the ball's movement? How did clicking affect its trajectory?
            </p>
          </div>
          
          <div className="p-4 bg-white border rounded">
            <h3 className="font-medium text-gray-800 mb-2">Real-World Application</h3>
            <p className="text-gray-600 text-sm">
              How do the collision principles you observed apply to real-world scenarios like car crashes or sports?
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InteractiveLesson;`;

export const assessmentTemplate = `import React, { useState } from 'react';

const AssessmentHeavyLesson = ({ course, courseId, itemConfig, isStaffView, devMode }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const practiceQuestions = [
    {
      id: 1,
      type: 'multiple-choice',
      question: "What is the SI unit for momentum?",
      options: ["kg⋅m/s", "N⋅s", "Both A and B", "J/s"],
      correct: 2
    },
    {
      id: 2,
      type: 'multiple-choice',
      question: "In a perfectly elastic collision, what is conserved?",
      options: ["Only momentum", "Only kinetic energy", "Both momentum and kinetic energy", "Neither momentum nor kinetic energy"],
      correct: 2
    },
    {
      id: 3,
      type: 'short-answer',
      question: "A 500g ball moving at 10 m/s collides with a stationary 300g ball. If the collision is perfectly elastic, calculate the final velocities. Show your work.",
      points: 5
    }
  ];

  const handleAnswerSelect = (questionId, answer) => {
    setAnswers({
      ...answers,
      [questionId]: answer
    });
  };

  const calculateScore = () => {
    let score = 0;
    practiceQuestions.forEach(q => {
      if (q.type === 'multiple-choice' && answers[q.id] === q.correct) {
        score += 1;
      }
    });
    return score;
  };

  const submitAssessment = () => {
    setShowResults(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 p-6 rounded-lg border">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Momentum Assessment Center
        </h1>
        <p className="text-lg text-gray-600">
          Multiple assessment types to test your understanding of momentum concepts
        </p>
        <div className="flex gap-2 mt-4">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">Assessment</span>
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">High Stakes</span>
        </div>
      </div>

      {/* Quick Review */}
      <div className="mb-8 bg-blue-50 p-6 rounded-lg border border-blue-200">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">📖 Quick Review</h2>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <h3 className="font-semibold text-blue-800 mb-1">Momentum Formula</h3>
            <p className="text-blue-700">p = mv</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <h3 className="font-semibold text-blue-800 mb-1">Conservation Law</h3>
            <p className="text-blue-700">Σp_initial = Σp_final</p>
          </div>
          <div className="bg-white p-3 rounded border">
            <h3 className="font-semibold text-blue-800 mb-1">Impulse</h3>
            <p className="text-blue-700">J = Δp = FΔt</p>
          </div>
        </div>
      </div>

      {/* AI Assessment Section 1 */}
      <div className="mb-8 bg-purple-50 p-6 rounded-lg border border-purple-200">
        <h2 className="text-2xl font-semibold text-purple-900 mb-4">🤖 AI Assessment: Conceptual Understanding</h2>
        
        <div className="bg-white p-6 border border-purple-200 rounded-lg mb-4">
          <p className="text-center text-gray-600 italic mb-4">
            AI-generated questions will adapt to your performance level
          </p>
          <p className="text-center text-sm text-gray-500">
            {devMode && "Dev Mode: AIMultipleChoiceQuestion with adaptive difficulty"}
          </p>
        </div>
      </div>

      {/* Practice Questions */}
      <div className="mb-8 bg-green-50 p-6 rounded-lg border border-green-200">
        <h2 className="text-2xl font-semibold text-green-900 mb-4">✏️ Practice Questions</h2>
        
        {!showResults ? (
          <div className="space-y-6">
            {practiceQuestions.map((question, index) => (
              <div key={question.id} className="bg-white p-6 border border-green-200 rounded-lg">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-green-800">
                    Question {question.id}: {question.type === 'multiple-choice' ? 'Multiple Choice' : 'Short Answer'}
                  </h3>
                  {question.points && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      {question.points} points
                    </span>
                  )}
                </div>
                
                <p className="text-gray-700 mb-4">{question.question}</p>
                
                {question.type === 'multiple-choice' ? (
                  <div className="space-y-2">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="radio"
                          name={\`question-\${question.id}\`}
                          value={optionIndex}
                          onChange={() => handleAnswerSelect(question.id, optionIndex)}
                          className="text-green-600"
                        />
                        <span className="text-gray-700">{String.fromCharCode(65 + optionIndex)}. {option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <textarea
                    className="w-full h-32 p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Show your work here..."
                    onChange={(e) => handleAnswerSelect(question.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            
            <div className="text-center">
              <button
                onClick={submitAssessment}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
              >
                Submit Practice Assessment
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 border border-green-200 rounded-lg">
            <h3 className="text-xl font-semibold text-green-900 mb-4">📊 Practice Results</h3>
            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-green-700 mb-2">
                {calculateScore()}/{practiceQuestions.filter(q => q.type === 'multiple-choice').length}
              </div>
              <p className="text-green-600">Multiple Choice Questions Correct</p>
            </div>
            
            <div className="space-y-4">
              {practiceQuestions.map(question => (
                <div key={question.id} className="p-4 border rounded">
                  <h4 className="font-medium text-gray-800 mb-2">Question {question.id}</h4>
                  {question.type === 'multiple-choice' ? (
                    <div className="text-sm">
                      <p className="text-gray-600 mb-1">Your answer: {answers[question.id] !== undefined ? question.options[answers[question.id]] : 'Not answered'}</p>
                      <p className="text-gray-600">Correct answer: {question.options[question.correct]}</p>
                      <span className={\`px-2 py-1 rounded text-xs \${answers[question.id] === question.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                        {answers[question.id] === question.correct ? 'Correct' : 'Incorrect'}
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Short answer submitted for review</p>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setShowResults(false);
                  setAnswers({});
                }}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AI Assessment Section 2 */}
      <div className="mb-8 bg-indigo-50 p-6 rounded-lg border border-indigo-200">
        <h2 className="text-2xl font-semibold text-indigo-900 mb-4">🤖 AI Assessment: Problem Solving</h2>
        
        <div className="bg-white p-6 border border-indigo-200 rounded-lg">
          <p className="text-center text-gray-600 italic mb-4">
            AI-generated word problems with step-by-step evaluation
          </p>
          <p className="text-center text-sm text-gray-500">
            {devMode && "Dev Mode: AILongAnswerQuestion with problem-solving rubric"}
          </p>
        </div>
      </div>

      {/* AI Assessment Section 3 */}
      <div className="mb-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
        <h2 className="text-2xl font-semibold text-yellow-900 mb-4">🤖 AI Assessment: Application</h2>
        
        <div className="bg-white p-6 border border-yellow-200 rounded-lg">
          <p className="text-center text-gray-600 italic mb-4">
            Real-world scenario analysis with AI feedback
          </p>
          <p className="text-center text-sm text-gray-500">
            {devMode && "Dev Mode: AILongAnswerQuestion with application-focused prompts"}
          </p>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="bg-gray-50 p-6 rounded-lg border">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">📈 Performance Summary</h2>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">85%</div>
            <p className="text-sm text-gray-600">Conceptual Understanding</p>
          </div>
          
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">78%</div>
            <p className="text-sm text-gray-600">Problem Solving</p>
          </div>
          
          <div className="bg-white p-4 rounded border text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">92%</div>
            <p className="text-sm text-gray-600">Real-world Application</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-900 mb-2">🎯 Recommendations</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Review impulse-momentum theorem applications</li>
            <li>• Practice multi-step collision problems</li>
            <li>• Strong understanding of conservation principles</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssessmentHeavyLesson;`;