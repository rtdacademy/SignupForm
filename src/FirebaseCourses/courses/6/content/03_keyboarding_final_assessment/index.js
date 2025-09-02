import React, { useState, useEffect } from 'react';
import { StandardMultipleChoiceQuestion } from '../../../../components/assessments';
import SlideshowKnowledgeCheck from '../../../../components/assessments/SlideshowKnowledgeCheck';
import { getDatabase, ref, onValue } from 'firebase/database';
import { useAuth } from '../../../../../context/AuthContext';
import { motion } from 'framer-motion';
import { Lock, AlertCircle } from 'lucide-react';

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
  const [activeSection, setActiveSection] = useState('overview');
  const [questionsCompleted, setQuestionsCompleted] = useState({});

  // Check if all questions are completed
  const allQuestionsCompleted = Object.keys(questionsCompleted).length === 2 && 
    Object.values(questionsCompleted).every(completed => completed === true);

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

  const handleQuestionComplete = (questionId) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [questionId]: true
    }));
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
                  You need to complete the <strong>Typing Practice Arena</strong> lesson before accessing the Final Assessment.
                </p>
                <p className="text-sm text-gray-600">
                  Please go back and complete the practice exercises. Look for the "Complete Lesson" button to acknowledge your completion.
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

  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
          
          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4 sm:p-6 md:p-8">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Keyboarding Final Assessment
            </h1>
            <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">
              [Add a brief description of this quiz]
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
                <h2 className="text-2xl font-bold mb-4">📚 Quiz Overview</h2>
                <p className="text-gray-700 mb-4">
                  [Add an overview of what this quiz covers]
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
                    [Add the main content for this quiz. You can include:]
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
                  Test your understanding of the key concepts from this quiz.
                </p>
              </div>

              <SlideshowKnowledgeCheck
                courseId={courseId}
                lessonPath="03_keyboarding_final_assessment"
                course={course}
                questions={[
                  {
                    type: 'multiple-choice',
                    questionId: 'inf2020_03_final_speed',
                    title: 'Final Speed Test'
                  },
                  {
                    type: 'multiple-choice',
                    questionId: 'inf2020_03_final_accuracy',
                    title: 'Final Accuracy Test'
                  }
                ]}
                onComplete={(score, results) => {
                  console.log(`Knowledge Check completed with ${score}%`);
                  const allCorrect = Object.values(results).every(result => result === 'correct');
                  if (allCorrect || score >= 80) {
                    handleQuestionComplete('inf2020_03_final_speed');
                    handleQuestionComplete('inf2020_03_final_accuracy');
                  }
                }}
                theme="amber"
              />
            </section>
          )}

          {/* Completion Section */}
          {allQuestionsCompleted && (
            <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold mb-4 text-center">
                Quiz Complete! 🎉
              </h2>
              
              <div className="text-center mb-6">
                <p className="text-lg mb-4">
                  Great job completing this quiz!
                </p>
                
                <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
                  <p className="text-base">
                    You're ready to move on to the next section.
                  </p>
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={() => onNavigateToNext()}
                  className="bg-white text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  Continue to Next Section →
                </button>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default KeyboardingFinalAssessment;
