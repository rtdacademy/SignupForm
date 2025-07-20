import React, { useState } from 'react';

/**
 * L1-3 Assignment for Physics 30
 * Item ID: assignment_1747281808385_436
 * Unit: Momentum and Energy
 */
const L1_3_Assignment = () => {
  // Track completion status for each question
  const [questionStatus, setQuestionStatus] = useState({
    1: 'not-started', // 'not-started', 'in-progress', 'completed'
    2: 'not-started',
    3: 'not-started',
    4: 'not-started',
    5: 'not-started',
    6: 'not-started',
    7: 'not-started',
    8: 'not-started',
    9: 'not-started',
    10: 'not-started'
  });

  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [quizStarted, setQuizStarted] = useState(false);

  const startQuiz = () => {
    setQuizStarted(true);
  };

  const saveAndEnd = () => {
    setQuizStarted(false);
    // Here you could also save progress to database
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <span className="text-green-500">✓</span>;
      case 'in-progress':
        return <span className="text-yellow-500">⚠</span>;
      default:
        return <span className="text-gray-300">○</span>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };  const scrollToQuestion = (questionNumber) => {
    setCurrentQuestion(questionNumber);
    const element = document.getElementById(`question-${questionNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  const completedCount = Object.values(questionStatus).filter(status => status === 'completed').length;
  const inProgressCount = Object.values(questionStatus).filter(status => status === 'in-progress').length;

  // Show start quiz screen if quiz hasn't started
  if (!quizStarted) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">L1-3 Assignment</h1>
        
        {/* Start Quiz Box */}
        <div className="max-w-md mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-md text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ready to Begin?</h2>
            <p className="text-gray-600 mb-6">
              This assignment contains 10 questions. You can save your progress and return later if needed.
            </p>
            <button 
              onClick={startQuiz}
              className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg border border-blue-600 hover:bg-blue-700 transition-all duration-200 text-lg"
            >
              Start Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">L1-3 Assignment</h1>      {/* Combined Navigation & Progress */}
      <div className="sticky top-0 z-10 bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <h3 className="text-md font-semibold text-gray-800">Assignment Progress</h3>
          
          <div className="flex items-center gap-4">
            {/* Navigation Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                <button
                  key={num}
                  onClick={() => scrollToQuestion(num)}
                  className={`p-2 text-sm font-medium rounded border transition-all duration-200 flex items-center justify-center space-x-1 ${
                    questionStatus[num] === 'completed'
                      ? 'bg-green-100 border-green-300 text-green-700'
                      : questionStatus[num] === 'in-progress'
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                      : currentQuestion === num 
                      ? 'bg-blue-100 border-blue-300 text-blue-700' 
                      : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span>Q{num}</span>
                  {questionStatus[num] === 'completed' && <span className="text-green-600">✓</span>}
                </button>
              ))}
            </div>
              {/* Save and End Button */}
            <button 
              onClick={saveAndEnd}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded border border-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              Save and End
            </button>
          </div>
        </div>
      </div>      {/* Question 1 */}
      <div id="question-1" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[1])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 1</span>
          {getStatusIcon(questionStatus[1])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>      {/* Question 2 */}
      <div id="question-2" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[2])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 2</span>
          {getStatusIcon(questionStatus[2])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 3 */}
      <div id="question-3" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[3])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 3</span>
          {getStatusIcon(questionStatus[3])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 4 */}
      <div id="question-4" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[4])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 4</span>
          {getStatusIcon(questionStatus[4])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 5 */}
      <div id="question-5" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[5])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 5</span>
          {getStatusIcon(questionStatus[5])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 6 */}
      <div id="question-6" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[6])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 6</span>
          {getStatusIcon(questionStatus[6])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 7 */}
      <div id="question-7" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[7])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 7</span>
          {getStatusIcon(questionStatus[7])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 8 */}
      <div id="question-8" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[8])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 8</span>
          {getStatusIcon(questionStatus[8])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 9 */}
      <div id="question-9" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[9])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 9</span>
          {getStatusIcon(questionStatus[9])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>

      {/* Question 10 */}
      <div id="question-10" className={`border rounded-lg shadow-sm p-6 scroll-mt-32 ${getStatusColor(questionStatus[10])}`}>
        <h2 className="text-lg font-semibold mb-4 text-blue-700 flex items-center justify-between">
          <span>Question 10</span>
          {getStatusIcon(questionStatus[10])}
        </h2>
        <div className="space-y-3">
          {/* Question content to be added */}
        </div>
      </div>
    </div>
  );
};

export default L1_3_Assignment;
