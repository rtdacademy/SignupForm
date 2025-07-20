import React, { useState, useEffect } from 'react';
import { AIMultipleChoiceQuestion, StandardMultipleChoiceQuestion } from '../../../../components/assessments';

const WelcometoRTDAcademy = ({ courseId, itemId, activeItem, onNavigateToLesson, onNavigateToNext }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [interactiveAnswers, setInteractiveAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState({
    question1: false,
    question2: false,
    question3: false
  });
  const [questionResults, setQuestionResults] = useState({
    question1: null,
    question2: null,
    question3: null
  });
  

  const handleInteractiveAnswer = (questionId, answer) => {
    setInteractiveAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleQuestionComplete = (questionNumber) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [`question${questionNumber}`]: true
    }));
  };

  const allQuestionsCompleted = questionsCompleted.question1 && questionsCompleted.question2 && questionsCompleted.question3;

  const handleNextLesson = () => {
    console.log('🚀 Navigating to next lesson...', {
      onNavigateToNext: !!onNavigateToNext,
      onNavigateToLesson: !!onNavigateToLesson
    });
    
    // Navigate to lesson 2 - Learning Plans & Completion Policies
    // Use the proper navigation function passed down from the parent component
    
    if (onNavigateToNext) {
      // Use the automatic next lesson function (most flexible)
      console.log('✅ Using onNavigateToNext()');
      onNavigateToNext();
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else if (onNavigateToLesson) {
      // Use the specific lesson navigation function
      console.log('✅ Using onNavigateToLesson(lesson_learning_plans)');
      onNavigateToLesson('lesson_learning_plans');
      // Scroll to top after navigation
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } else {
      // Fallback: try to find and call the parent's onItemSelect function
      // Look for it in the window context or use the legacy approach
      console.warn('⚠️ Navigation functions not provided, using fallback navigation');
      
      // Try to get the navigation function from the wrapper
      if (window.courseNavigate) {
        console.log('🔄 Using window.courseNavigate fallback');
        window.courseNavigate('lesson_learning_plans');
        // Scroll to top after navigation
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // Last resort: page navigation (causes refresh)
        console.log('🔄 Using page navigation fallback (will cause refresh)');
        const currentPath = window.location.pathname;
        const newPath = currentPath.replace('01-welcome-rtd-academy', '02-learning-plans-completion-policies');
        window.location.href = newPath;
      }
    }
  };



  return (
    <div className="min-h-screen w-full bg-gray-50">
      {/* Main Content Area */}
      <div className="w-full max-w-7xl mx-auto">
        <div className="space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-4 sm:p-6 md:p-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">Welcome to RTD Math Academy</h1>
        <p className="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">Your gateway to flexible, high-quality online education in Math, Physics, and STEM</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-3 sm:p-4">
          <p className="text-sm sm:text-base md:text-lg">
            🎯 <strong>Learning Objective:</strong> Understand what RTD Math Academy is, how asynchronous learning works, 
            and what tools and expectations will guide your success.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-4 sm:space-x-6 md:space-x-8 overflow-x-auto pb-1">
          {[
            { id: 'overview', label: 'Orientation Overview' },
            { id: 'academy-intro', label: 'About RTD Academy' },
            { id: 'learning-approach', label: 'Asynchronous Learning' },
            { id: 'tools-systems', label: 'Essential Tools' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                activeSection === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Course Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-blue-900">📚 Orientation Overview</h2>
            <p className="text-gray-700 mb-4">
              This orientation course is designed to set you up for success at RTD Academy. 
              You'll learn about our unique learning environment, essential tools, and the expectations 
              that will guide your educational journey.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4">🎯 What You'll Learn in This Orientation</h3>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">Learning & Navigation:</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                    How asynchronous learning works at RTD Academy
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                    Essential tools and platforms you'll be using
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                    Academic expectations and digital citizenship
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 flex-shrink-0"></span>
                    Support resources available to you
                  </li>
                </ul>
              </div>

              <div className="bg-green-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">Key Outcomes:</h4>
                <ul className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                    Confident navigation of all RTD systems
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                    Understanding of academic policies
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                    Prepared for independent learning success
                  </li>
                  <li className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2 flex-shrink-0"></span>
                    Technical readiness for online learning
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Success Tips for This Course</h3>
            <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div>
                <h4 className="font-semibold mb-2">Get the Most Out of Each Section:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Take notes on key policies and procedures</li>
                  <li>• Complete all interactive activities</li>
                  <li>• Bookmark important resources for later</li>
                  <li>• Ask questions if anything is unclear</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Apply What You Learn:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Set up your study environment as suggested</li>
                  <li>• Test all the tools and systems we discuss</li>
                  <li>• Create your learning schedule</li>
                  <li>• Connect with support resources</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* About RTD Academy Section */}
      {activeSection === 'academy-intro' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🏫 About RTD Academy</h2>
            <p className="text-gray-600 mb-6">
              Learn about our mission, values, and what makes RTD Academy a unique learning environment.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🎯 Our Mission & Vision</h3>
            
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Our Mission</h4>
              <p className="text-gray-700 mb-4">
                RTD Academy provides flexible, high-quality online education in Math, Physics, and STEM subjects. 
                We believe every student deserves access to excellent education that fits their schedule and learning style.
              </p>
              
              <h4 className="text-lg font-semibold text-blue-800 mb-3">Our Vision</h4>
              <p className="text-gray-700">
                To be Alberta's premier destination for personalized, technology-enhanced learning that empowers 
                students to achieve their academic goals on their own terms.
              </p>
            </div>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">🎯 Flexible Learning</h4>
                <p className="text-xs sm:text-sm text-gray-600">Learn at your own pace with 24/7 access to course materials and no fixed class schedules</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">👥 Expert Support</h4>
                <p className="text-xs sm:text-sm text-gray-600">Qualified instructors and support staff available when you need guidance</p>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 sm:p-4 border border-blue-100">
                <h4 className="font-semibold text-blue-700 mb-2 text-sm sm:text-base">📱 Modern Technology</h4>
                <p className="text-xs sm:text-sm text-gray-600">Cutting-edge learning platform with AI assistance and interactive tools</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">👥 Meet Your RTD Academy Team</h3>
            
            {/* School Leadership */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">🏢 School Leadership</h4>
              <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">Principal: Kyle Brown</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">Vice Principal: Charlie Hiles</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">Technical Support: Stan Scott</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-blue-800">People Operations: Rachel Geistlinger</p>
                </div>
              </div>
            </div>
            
            {/* Instruction and Learning */}
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-green-800 mb-3">👨‍🏫 Instruction and Learning</h4>
              <div className="space-y-2">
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Pat Ang</p>
                  <p className="text-xs text-gray-600">Math 30-1, Tutoring</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Shelby Ross</p>
                  <p className="text-xs text-gray-600">Math 30-2, Physics 20</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Bev Shultz</p>
                  <p className="text-xs text-gray-600">Math 15, Math 20-2</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Rory Whitbread</p>
                  <p className="text-xs text-gray-600">Math 10C, Math 20-1, Math 31, Math 10-3, Math 20-3, Math 30-3, Math 10-4, Math 20-4</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800">Gina MacKechnie</p>
                  <p className="text-xs text-gray-600">Math 30-1</p>
                </div>
              </div>
            </div>
            
            {/* Student Services and Records */}
            <div>
              <h4 className="text-lg font-semibold text-purple-800 mb-3">📋 Student Services and Records</h4>
              <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800">Marsha Lush</p>
                  <p className="text-xs text-gray-600">Registrar</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800">Natalie Madden</p>
                  <p className="text-xs text-gray-600">Registrar</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3">
                  <p className="text-sm font-medium text-purple-800">Merel Jarvis</p>
                  <p className="text-xs text-gray-600">Diploma Coordinator</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Asynchronous Learning Section */}
      {activeSection === 'learning-approach' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⏰ Asynchronous Learning Approach</h2>
            <p className="text-gray-600 mb-6">
              Understand how RTD Academy's flexible learning model works and what it means for your education.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🔄 What is Asynchronous Learning?</h3>
            
            <div className="bg-purple-50 rounded-lg p-6 mb-6">
              <h4 className="font-semibold text-purple-800 mb-3">The Freedom to Learn on Your Schedule</h4>
              <p className="text-gray-700 mb-3">
                Asynchronous learning means you don't need to be online at the same time as your instructors or other students. 
                You can access your course materials, complete assignments, and engage with content when it works best for your schedule.
              </p>
              <p className="text-sm text-purple-700">
                💡 This approach is perfect for working students, parents, and anyone with a busy or irregular schedule.
              </p>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 bg-green-50 p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✓ Benefits for You</h4>
                  <ul className="text-green-700 space-y-1 text-sm">
                    <li>• Learn at your own pace - spend more time on challenging topics</li>
                    <li>• Flexible scheduling around work/life commitments</li>
                    <li>• Access to recorded lessons and materials 24/7</li>
                    <li>• Time to reflect and review before responding</li>
                    <li>• Pause and rewind complex explanations</li>
                    <li>• Study when you're most alert and focused</li>
                  </ul>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-blue-400 bg-blue-50 p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">📝 Your Responsibilities</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• Stay organized and manage your time effectively</li>
                    <li>• Check in regularly with course updates</li>
                    <li>• Participate actively in discussions and assignments</li>
                    <li>• Reach out for help when needed</li>
                    <li>• Maintain steady progress toward completion</li>
                    <li>• Communicate challenges early</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🕒 Making Asynchronous Learning Work for You</h3>
            
            <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">⏰ Time Management</h4>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                  <li>• Set regular study times</li>
                  <li>• Use calendar reminders</li>
                  <li>• Break work into chunks</li>
                  <li>• Plan around your energy levels</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">🎯 Stay Motivated</h4>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                  <li>• Set weekly goals</li>
                  <li>• Celebrate small wins</li>

                  <li>• Track your progress</li>
                </ul>
              </div>
              
              <div className="bg-orange-50 rounded-lg p-3 sm:p-4">
                <h4 className="font-semibold text-orange-800 mb-2 text-sm sm:text-base">💬 Stay Connected</h4>
                <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                  
                  <li>• Attend virtual office hours</li>
                  <li>• Ask questions early</li>
                  <li>• Respond to instructor communications</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Essential Tools & Systems Section */}
      {activeSection === 'tools-systems' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🛠️ Essential Tools & Systems</h2>
            <p className="text-gray-600 mb-6">
              Familiarize yourself with the key platforms and tools you'll use throughout your RTD Academy experience.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">🖥️ Your Digital Learning Environment</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">📚 Learning Management System (LMS)</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Your digital classroom where you'll access course content, submit assignments, and track your progress.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">Key Features:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Course materials and interactive lessons</li>
                    <li>• Assignment submissions and feedback</li>
                    <li>• Grade tracking and progress monitoring</li>
                    
                    
                  </ul>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">🎯 YourWay Portal</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Your personal academic dashboard for managing schedules, registration, and RTD Academy services.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">What You Can Do:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Course registration and enrollment</li>
                    <li>• Schedule management and planning</li>
                   
                    <li>• Payment information (Adult/International Students)</li>
                </ul>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">🏛️ MyPass</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Alberta's Provincial Approach to Student Information - the official student record system.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">Official Records:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Official transcripts and grades</li>
                    
                    
                    <li>• Diploma exam scores</li>
                    <li>• Diploma exam registartion</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">📹 Proctorio</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Secure exam monitoring using webcam and secondary device technology for assessment integrity.
                </p>
                <div className="bg-white rounded p-3">
                  <p className="text-sm font-medium mb-2">Security Features:</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Remote exam supervision and monitoring</li>
                    <li>• Academic integrity checks</li>
                    <li>• Flexible exam schedules</li>
             
                  </ul>
                </div>
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
              Test your understanding of key concepts from this RTD Academy orientation lesson.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
              {/* Question Progress Indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {[0, 1, 2].map((index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentQuestionIndex
                          ? 'bg-indigo-600 scale-125'
                          : questionResults[`question${index + 1}`] === 'correct'
                          ? 'bg-green-500'
                          : questionResults[`question${index + 1}`] === 'incorrect'
                          ? 'bg-red-500'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Go to question ${index + 1}`}
                    />
                  ))}
                </div>
              </div>


            {/* Question Display */}
            <div className="relative">
              {currentQuestionIndex === 0 && (
                <StandardMultipleChoiceQuestion
                  courseId={courseId}
                  cloudFunctionName="course4_01_welcome_rtd_academy_knowledge_check"
                  title="RTD Academy Knowledge Check - Question 1"
                  theme="indigo"
                  onAttempt={(isCorrect) => {
                    handleQuestionComplete(1);
                    setQuestionResults(prev => ({...prev, question1: isCorrect ? 'correct' : 'incorrect'}));
                  }}
                />
              )}
              
              {currentQuestionIndex === 1 && (
                <StandardMultipleChoiceQuestion
                  courseId={courseId}
                  cloudFunctionName="course4_01_welcome_rtd_academy_question2"
                  title="RTD Academy Knowledge Check - Question 2"
                  theme="indigo"
                  onAttempt={(isCorrect) => {
                    handleQuestionComplete(2);
                    setQuestionResults(prev => ({...prev, question2: isCorrect ? 'correct' : 'incorrect'}));
                  }}
                />
              )}
              
              {currentQuestionIndex === 2 && (
                <StandardMultipleChoiceQuestion
                  courseId={courseId}
                  cloudFunctionName="course4_01_welcome_rtd_academy_question3"
                  title="RTD Academy Knowledge Check - Question 3"
                  theme="indigo"
                  onAttempt={(isCorrect) => {
                    handleQuestionComplete(3);
                    setQuestionResults(prev => ({...prev, question3: isCorrect ? 'correct' : 'incorrect'}));
                  }}
                />
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of 3
              </div>

              <button
                onClick={() => setCurrentQuestionIndex(Math.min(2, currentQuestionIndex + 1))}
                disabled={currentQuestionIndex === 2}
                className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentQuestionIndex === 2
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                }`}
              >
                Next
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Summary Section - Only show when all questions are completed */}
      {allQuestionsCompleted && (
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Welcome Introduction Complete</h2>
          
          <div className="text-center mb-6">
            <p className="text-lg mb-4">
              You've learned about RTD Academy's mission, asynchronous learning approach, and the essential tools you'll be using.
            </p>
            
            <div className="bg-white/10 backdrop-blur rounded-lg p-4 mb-6">
              <p className="text-base">
                Next, you'll explore learning plans, completion policies, and strategies for managing your time effectively in this flexible learning environment.
              </p>
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={handleNextLesson}
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

export default WelcometoRTDAcademy;