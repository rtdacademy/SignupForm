// Advanced JSX example with animations and interactions
// Teachers can copy this and customize for their lessons

const AnimatedFinanceLessonExample = ({ course, courseId, itemConfig, isStaffView, devMode }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [balance, setBalance] = useState(1000);
  const [isCalculating, setIsCalculating] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const steps = [
    { title: "Starting Balance", description: "Your initial investment" },
    { title: "Monthly Contributions", description: "Add $100 each month" },
    { title: "Interest Growth", description: "5% annual interest" },
    { title: "Final Results", description: "See your wealth grow!" }
  ];

  const simulateGrowth = async () => {
    setIsCalculating(true);
    let currentBalance = balance;
    
    // Animate balance growth over 12 months
    for (let month = 1; month <= 12; month++) {
      await new Promise(resolve => setTimeout(resolve, 200));
      currentBalance += 100; // Monthly contribution
      currentBalance *= 1.004167; // Monthly interest (5% annual)
      setBalance(Math.round(currentBalance));
    }
    
    setIsCalculating(false);
    setShowResults(true);
  };

  const resetSimulation = () => {
    setBalance(1000);
    setCurrentStep(0);
    setShowResults(false);
    setIsCalculating(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Animated Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-blue-900 mb-4 animate-fade-in">
          💰 Interactive Investment Simulator
        </h1>
        <p className="text-lg text-gray-600 animate-slide-up">
          Watch your money grow with compound interest!
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div 
            key={index}
            className={`flex flex-col items-center transition-all duration-500 ${
              index <= currentStep ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
            }`}
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 ${
              index < currentStep ? 'bg-green-500 animate-pulse' : 
              index === currentStep ? 'bg-blue-500 animate-bounce' : 'bg-gray-400'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            <p className="text-sm mt-2 text-center max-w-20">{step.title}</p>
          </div>
        ))}
      </div>

      {/* Main Simulation Area */}
      <Card className="relative overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Investment Simulator</span>
            <Badge variant={isCalculating ? "secondary" : "outline"}>
              {isCalculating ? "🔄 Calculating..." : "💡 Ready"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Display */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Balance</p>
            <div className={`text-6xl font-bold transition-all duration-300 ${
              isCalculating ? 'text-orange-500 animate-pulse' : 
              showResults ? 'text-green-600' : 'text-blue-600'
            }`}>
              ${balance.toLocaleString()}
            </div>
            {showResults && (
              <div className="mt-4 p-4 bg-green-50 rounded-lg animate-fade-in">
                <p className="text-green-800 font-semibold">
                  🎉 Congratulations! You earned ${(balance - 1000 - 1200).toLocaleString()} in interest!
                </p>
              </div>
            )}
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Investment Progress</span>
              <span>{Math.min(currentStep * 25, 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className="bg-gradient-to-r from-blue-500 to-green-500 h-4 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(currentStep * 25, 100)}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex gap-4 justify-center">
            {!showResults && (
              <button
                onClick={() => setCurrentStep(Math.min(currentStep + 1, 3))}
                disabled={currentStep >= 3 || isCalculating}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105"
              >
                {currentStep < 3 ? 'Next Step' : 'Ready to Calculate'}
              </button>
            )}
            
            {currentStep >= 3 && !showResults && (
              <button
                onClick={simulateGrowth}
                disabled={isCalculating}
                className="px-8 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-all duration-200 hover:scale-105 font-semibold"
              >
                {isCalculating ? 'Calculating...' : '🚀 Start Simulation'}
              </button>
            )}
            
            {showResults && (
              <button
                onClick={resetSimulation}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-all duration-200 hover:scale-105"
              >
                🔄 Try Again
              </button>
            )}
          </div>

          {/* Educational Content */}
          <div className="grid md:grid-cols-3 gap-4 mt-8">
            {[
              { icon: "💵", title: "Principal", value: "$1,000", desc: "Initial investment" },
              { icon: "📈", title: "Contributions", value: "$1,200", desc: "$100 × 12 months" },
              { icon: "⚡", title: "Interest", value: `$${showResults ? (balance - 2200).toLocaleString() : '???'}`, desc: "Compound growth" }
            ].map((item, index) => (
              <div 
                key={index}
                className={`text-center p-4 border rounded-lg transition-all duration-500 hover:shadow-lg ${
                  showResults ? 'animate-fade-in' : ''
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="text-3xl mb-2">{item.icon}</div>
                <h3 className="font-semibold text-gray-800">{item.title}</h3>
                <p className="text-2xl font-bold text-blue-600">{item.value}</p>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Objectives */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 What You Learned</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {[
              "How compound interest accelerates wealth building",
              "The importance of regular monthly contributions", 
              "Why starting early makes a huge difference",
              "How small percentages create big results over time"
            ].map((objective, index) => (
              <li 
                key={index}
                className={`flex items-start gap-2 transition-all duration-300 ${
                  showResults ? 'animate-slide-in' : ''
                }`}
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <span className="text-green-600 mt-1">✓</span>
                <span>{objective}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Developer Info */}
      {devMode && (
        <Alert>
          <AlertDescription>
            <strong>🔧 Dev Mode:</strong> This interactive lesson uses useState for state management, 
            useEffect for animations, async/await for timing, and Tailwind CSS for animations. 
            All working perfectly with JSX transformation!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

// Add some custom CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes fade-in {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
  }
  
  @keyframes slide-in {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }
  
  .animate-fade-in { animation: fade-in 0.6s ease-out; }
  .animate-slide-up { animation: slide-up 0.8s ease-out 0.2s both; }
  .animate-slide-in { animation: slide-in 0.4s ease-out both; }
`;
document.head.appendChild(style);