import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';

/**
 * Typing Basics and Hand Position
 * Type: lesson
 * Estimated Time: 30 minutes
 */
const TypingBasicsandHandPosition = ({ 
  course, 
  courseId, 
  itemId, 
  activeItem, 
  onNavigateToLesson, 
  onNavigateToNext, 
  onAIAccordionContent 
}) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [questionsCompleted, setQuestionsCompleted] = useState({});

  // Check if all questions are completed
  const allQuestionsCompleted = Object.keys(questionsCompleted).length === 2 && 
    Object.values(questionsCompleted).every(completed => completed === true);

  const handleQuestionComplete = (questionId) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [questionId]: true
    }));
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Typing Basics and Hand Position
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
              [Add a brief description of this lesson]
            </p>
            <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
              <p className="text-sm sm:text-base md:text-lg">
                🎯 <strong>Learning Objective:</strong> [Add the main learning objective here]
              </p>
            </div>
          </section>

          {/* Navigation Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto pb-1">
              <button
                onClick={() => setActiveSection('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeSection === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveSection('content')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeSection === 'content'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Main Content
              </button>
              
              <button
                onClick={() => setActiveSection('assessment')}
                className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                  activeSection === 'assessment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Knowledge Check
              </button>
            </nav>
          </div>

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">📚 Lesson Overview</h2>
                <p className="text-gray-700 mb-4">
                  [Add an overview of what this lesson covers]
                </p>
                
                <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">Key Topics:</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Topic 1]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Topic 2]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Topic 3]
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                    <h4 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">Learning Outcomes:</h4>
                    <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Outcome 1]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Outcome 2]
                      </li>
                      <li className="flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                        [Outcome 3]
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Main Content Section */}
          {activeSection === 'content' && (
            <section className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-2xl font-bold mb-4">📖 Main Content</h2>
                
                {/* Add your main content here */}
                <div className="prose max-w-none">
                  <p className="text-gray-700">
                    [Add the main content for this lesson. You can include:]
                  </p>
                  <ul className="mt-4 space-y-2">
                    <li>Text explanations</li>
                    <li>Images and diagrams</li>
                    <li>Videos</li>
                    <li>Interactive elements</li>
                    <li>Examples and practice problems</li>
                  </ul>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
                    <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                      💡 Key Concept
                    </h3>
                    <p className="text-gray-700">
                      [Highlight important concepts or tips here]
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          
          {/* Knowledge Check Section */}
          {activeSection === 'assessment' && (
            <section className="space-y-6">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check</h2>
                <p className="text-gray-600 max-w-2xl mx-auto mb-6">
                  Test your understanding of the key concepts from this lesson.
                </p>
              </div>

              <SlideshowKnowledgeCheck
                courseId={courseId}
                lessonPath="01_keyboarding_basics"
                course={course}
                questions={[
                  {
                    type: 'multiple-choice',
                    questionId: 'inf2020_01_hand_position',
                    title: 'Hand Position Knowledge Check'
                  },
                  {
                    type: 'multiple-choice',
                    questionId: 'inf2020_01_typing_technique',
                    title: 'Typing Technique Assessment'
                  }
                ]}
                onComplete={(score, results) => {
                  console.log(`Knowledge Check completed with ${score}%`);
                  const allCorrect = Object.values(results).every(result => result === 'correct');
                  if (allCorrect || score >= 80) {
                    handleQuestionComplete('inf2020_01_hand_position');
                    handleQuestionComplete('inf2020_01_typing_technique');
                  }
                }}
                theme="purple"
              />
            </section>
          )}

          {/* Completion Section */}
          {allQuestionsCompleted && (
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Lesson Complete! 🎉
              </h2>
              
              <div className="text-center mb-6">
                <p className="text-lg mb-4">
                  Great job completing this lesson!
                </p>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
                  <p className="text-base">
                    You're ready to move on to the next lesson.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => onNavigateToNext()}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Continue to Next Lesson →
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default TypingBasicsandHandPosition;
