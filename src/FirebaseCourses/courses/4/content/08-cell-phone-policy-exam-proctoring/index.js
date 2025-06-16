import React, { useState, useEffect } from 'react';
import { AIMultipleChoiceQuestion, StandardMultipleChoiceQuestion } from '../../../../components/assessments';
import { useProgress } from '../../../../context/CourseProgressContext';

const CellPhonePolicyExamProctoring = ({ courseId, itemId, activeItem, onNavigateToNext }) => {
  const { markCompleted } = useProgress();
  const [activeSection, setActiveSection] = useState('general');
  const [setupProgress, setSetupProgress] = useState({
    step1: false,
    step2: false,
    step3: false,
    step4: false,
    step5: false,
    step6: false
  });

  // Room diagram interactive state
  const [roomSetup, setRoomSetup] = useState({
    phonePosition: null,
    cameraAngle: null,
    studentPosition: null,
    workspaceView: null
  });

  const [diagramAnswers, setDiagramAnswers] = useState({});
  const [showDiagramFeedback, setShowDiagramFeedback] = useState(false);

  // Behavior quiz state
  const [behaviorQuiz, setBehaviorQuiz] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // Academic integrity state (from lesson 09)
  const [scenarioAnswers, setScenarioAnswers] = useState({});
  const [showScenarioFeedback, setShowScenarioFeedback] = useState(false);
  
  // Drag and Drop State for ethics sorting
  const [dragItems, setDragItems] = useState({
    available: [
      { id: 'citing-sources', text: 'Citing sources in your assignment', category: 'ethical' },
      { id: 'using-chatgpt-exam', text: 'Using ChatGPT to answer exam questions', category: 'unethical' },
      { id: 'asking-clarification', text: 'Asking instructor for clarification during exam', category: 'ethical' },
      { id: 'sharing-answers', text: 'Sharing quiz answers with classmates', category: 'unethical' },
      { id: 'study-group', text: 'Forming a study group to review material', category: 'ethical' },
      { id: 'copying-assignment', text: 'Copying another student\'s assignment', category: 'unethical' },
      { id: 'using-calculator', text: 'Using approved calculator during math exam', category: 'ethical' },
      { id: 'impersonation', text: 'Having someone else take your exam', category: 'unethical' },
      { id: 'referencing-notes', text: 'Referencing course notes during open-book test', category: 'ethical' },
      { id: 'accessing-internet', text: 'Searching Google during closed-book exam', category: 'unethical' }
    ],
    ethical: [],
    unethical: []
  });
  
  const [draggedItem, setDraggedItem] = useState(null);
  const [sortingComplete, setSortingComplete] = useState(false);

  // Standard multiple choice questions state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questionsCompleted, setQuestionsCompleted] = useState({
    question1: false,
    question2: false,
    question3: false,
    question4: false,
    question5: false,
    question6: false,
    question7: false,
    question8: false
  });
  const [questionResults, setQuestionResults] = useState({
    question1: null,
    question2: null,
    question3: null,
    question4: null,
    question5: null,
    question6: null,
    question7: null,
    question8: null
  });

  const handleSetupStep = (step) => {
    setSetupProgress(prev => ({
      ...prev,
      [step]: !prev[step]
    }));
  };

  const handleRoomSetup = (element, position) => {
    setRoomSetup(prev => ({
      ...prev,
      [element]: position
    }));
  };

  const handleDiagramAnswer = (questionId, answer) => {
    setDiagramAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const checkDiagramAnswers = () => {
    const correctAnswers = {
      phone_position: 'behind_student',
      camera_view: 'hands_keyboard_desk',
      student_seat: 'facing_camera',
      workspace: 'clear_visible'
    };
    
    let score = 0;
    Object.keys(correctAnswers).forEach(key => {
      if (diagramAnswers[key] === correctAnswers[key]) {
        score++;
      }
    });
    
    setShowDiagramFeedback(true);
    return { score, total: Object.keys(correctAnswers).length };
  };

  const handleBehaviorQuiz = (questionId, answer) => {
    setBehaviorQuiz(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitBehaviorQuiz = () => {
    setQuizSubmitted(true);
    const correctAnswers = {
      q1: 'immediately_stop',
      q2: 'ask_permission', 
      q3: 'call_proctor',
      q4: 'void_exam'
    };
    
    let score = 0;
    Object.keys(correctAnswers).forEach(key => {
      if (behaviorQuiz[key] === correctAnswers[key]) {
        score++;
      }
    });
    
    return { score, total: Object.keys(correctAnswers).length };
  };

  // Academic integrity handlers (from lesson 09)
  const handleScenarioAnswer = (scenarioId, answer) => {
    setScenarioAnswers(prev => ({
      ...prev,
      [scenarioId]: answer
    }));
  };

  const checkScenarioAnswers = () => {
    const correctAnswers = {
      scenario1: 'violation',
      scenario2: 'not_violation',
      scenario3: 'violation',
      scenario4: 'violation'
    };
    
    let score = 0;
    Object.keys(correctAnswers).forEach(key => {
      if (scenarioAnswers[key] === correctAnswers[key]) {
        score++;
      }
    });
    
    setShowScenarioFeedback(true);
    return { score, total: Object.keys(correctAnswers).length };
  };

  // Drag and drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, category) => {
    e.preventDefault();
    if (!draggedItem) return;

    setDragItems(prev => {
      const newItems = { ...prev };
      
      // Remove from current location
      Object.keys(newItems).forEach(key => {
        newItems[key] = newItems[key].filter(item => item.id !== draggedItem.id);
      });
      
      // Add to new location
      newItems[category] = [...newItems[category], draggedItem];
      
      return newItems;
    });
    
    setDraggedItem(null);
  };

  const checkSorting = () => {
    const allCorrect = dragItems.ethical.every(item => item.category === 'ethical') &&
                      dragItems.unethical.every(item => item.category === 'unethical') &&
                      dragItems.available.length === 0;
    setSortingComplete(allCorrect);
  };

  const handleQuestionComplete = (questionNumber) => {
    setQuestionsCompleted(prev => ({
      ...prev,
      [`question${questionNumber}`]: true
    }));
  };

  const allQuestionsCompleted = questionsCompleted.question1 && questionsCompleted.question2 && questionsCompleted.question3 && 
    questionsCompleted.question4 && questionsCompleted.question5 && questionsCompleted.question6 && 
    questionsCompleted.question7 && questionsCompleted.question8;

  // Track completion when all questions are answered
  useEffect(() => {
    if (allQuestionsCompleted) {
      const lessonItemId = itemId || activeItem?.itemId;
      if (lessonItemId) {
        markCompleted(lessonItemId);
      }
    }
  }, [allQuestionsCompleted, markCompleted, itemId, activeItem?.itemId]);

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Cell Phones, Exams, and Academic Integrity</h1>
        <p className="text-xl mb-6">Master RTD Academy's policies for maintaining academic integrity during exams and assessments</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand cell phone policies, exam day behaviors, academic integrity standards, 
            types of violations, and the disciplinary process while maintaining ethical academic practices.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'general', label: 'General Expectations' },
            { id: 'behavior', label: 'Exam Day Behaviours' },
            { id: 'policy', label: 'Policy Overview' },
            { id: 'violations', label: 'Types of Violations' },
            { id: 'discipline', label: 'Disciplinary Process' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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

      {/* Policy Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-red-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-900">📱 RTD Academy Cell Phone Policy</h2>
            <p className="text-gray-700 mb-4">
              RTD Academy's cell phone policy is designed to maintain academic integrity, ensure fair assessment conditions, 
              and support student success in online learning environments.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🎯 Policy Purpose & Goals</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Academic Integrity</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Prevent unauthorized communication during exams</li>
                    <li>• Eliminate access to prohibited resources</li>
                    <li>• Ensure fair testing conditions for all students</li>
                    <li>• Maintain the validity of assessment results</li>
                  </ul>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Exam Security</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Monitor student workspace and behavior</li>
                    <li>• Verify student identity and environment</li>
                    <li>• Document compliance with exam protocols</li>
                    <li>• Enable instructor oversight and support</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Digital Citizenship</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Foster responsible technology use</li>
                    <li>• Build respect for academic protocols</li>
                    <li>• Develop professional digital habits</li>
                    <li>• Support ethical online behavior</li>
                  </ul>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Student Support</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li>• Clear expectations and procedures</li>
                    <li>• Accessibility accommodations available</li>
                    <li>• Technical support and troubleshooting</li>
                    <li>• Fair and consistent policy application</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">📋 Policy Application</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">When Policy Applies:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• All quizzes and section exams</li>
                  <li>• Diploma examinations</li>
                  <li>• Proctored assessments</li>
                  <li>• Final course evaluations</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Where Policy Applies:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Home testing environments</li>
                  <li>• RTD Academy testing centers</li>
                  <li>• Approved external testing locations</li>
                  <li>• Virtual proctoring sessions</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* General Expectations Section */}
      {activeSection === 'general' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📋 General Cell Phone Expectations</h2>
            <p className="text-gray-600 mb-6">
              Understanding basic cell phone expectations helps create a focused learning environment during all RTD Academy activities.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚫 General Usage Restrictions</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
                    Phones Off & Out of Reach
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    During instructional time, personal mobile devices (PMDs) must be silenced and kept out of view.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">This means:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Phone set to silent or do not disturb mode</li>
                      <li>• Device placed in bag, drawer, or other location</li>
                      <li>• Not on desk, lap, or within easy reach</li>
                      <li>• Screen not visible during learning activities</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    No Social Media Access
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    RTD platforms block social media domains for students, and students may not bypass these controls.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Blocked platforms include:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Facebook, Instagram, Twitter/X</li>
                      <li>• TikTok, Snapchat, YouTube (non-educational)</li>
                      <li>• Gaming and entertainment sites</li>
                      <li>• Personal messaging apps during class time</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    No Recording Without Permission
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Audio or video recording of live sessions on PMDs is forbidden unless the teacher grants prior permission.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Recording restrictions:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• No screenshots of course content</li>
                      <li>• No audio recording of lectures or discussions</li>
                      <li>• No video recording of virtual sessions</li>
                      <li>• Must ask permission for accessibility recording</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Professional Digital Behavior
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    When phones are used for educational purposes, maintain professional standards and respect.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Professional use includes:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Educational research and note-taking</li>
                      <li>• Accessing course-related resources</li>
                      <li>• Emergency communication (with permission)</li>
                      <li>• Assistive technology and accessibility tools</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-green-800">✅ Acceptable Phone Use</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Emergency Situations:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Medical emergencies</li>
                  <li>• Family crises</li>
                  <li>• Safety concerns</li>
                  <li>• Technical failures</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Educational Use:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Calculator for math courses</li>
                  <li>• Timer for study sessions</li>
                  <li>• Educational apps (approved)</li>
                  <li>• Research and references</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Accessibility Support:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Text-to-speech apps</li>
                  <li>• Visual magnification</li>
                  <li>• Voice recording (permitted)</li>
                  <li>• Communication aids</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Secondary Camera Setup Section */}
      {activeSection === 'setup' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📹 Secondary Camera Setup for Exams</h2>
            <p className="text-gray-600 mb-6">
              Learn the step-by-step process for setting up your phone as a secondary camera during proctored exams.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🔧 Required Setup Overview</h3>
            
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-blue-800 mb-2">When Secondary Camera is Required</h4>
              <p className="text-sm text-gray-700 mb-3">
                During certain quizzes and section exams, teachers will require students to place their PMD in secondary-camera mode. 
                This provides additional monitoring of your workspace and ensures exam integrity.
              </p>
              <div className="bg-white rounded p-3">
                <p className="text-xs font-medium mb-2">Required for:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                  <div>• Section exams</div>
                  <div>• Final assessments</div>
                  <div>• Diploma examinations</div>
                  <div>• High-stakes quizzes</div>
                </div>
              </div>
            </div>

            <h4 className="font-semibold mb-4">📱 Step-by-Step Setup Instructions</h4>
            
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                    Device Preparation
                  </h5>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={setupProgress.step1}
                      onChange={() => handleSetupStep('step1')}
                    />
                    <span className="text-sm text-green-600">Completed</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-medium mb-2">Before the exam:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Charge your phone to at least 80% battery</li>
                    <li>• Close all apps except the one needed for proctoring</li>
                    <li>• Set device to "Do Not Disturb" mode</li>
                    <li>• Ensure stable WiFi connection</li>
                    <li>• Test camera and microphone functionality</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    📷 <strong>Screenshot Placeholder:</strong> Phone preparation checklist screen
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                    Join Proctoring Platform
                  </h5>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={setupProgress.step2}
                      onChange={() => handleSetupStep('step2')}
                    />
                    <span className="text-sm text-green-600">Completed</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-medium mb-2">Joining the session:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Open Microsoft Teams or approved platform</li>
                    <li>• Join as "Second Device" or "Phone Camera"</li>
                    <li>• Use your name + "Phone" (e.g., "Sarah Smith Phone")</li>
                    <li>• Wait for instructor permission to proceed</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    📷 <strong>Screenshot Placeholder:</strong> Teams join screen with naming convention
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                    Camera Positioning
                  </h5>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={setupProgress.step3}
                      onChange={() => handleSetupStep('step3')}
                    />
                    <span className="text-sm text-green-600">Completed</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-medium mb-2">Position your phone to show:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Your hands while typing</li>
                    <li>• Your keyboard and mouse</li>
                    <li>• Your immediate workspace/desk</li>
                    <li>• Any notes or materials you're using</li>
                  </ul>
                  
                  <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                    <p className="text-xs text-red-800">
                      <strong>Critical:</strong> The camera must NOT show your main computer screen to prevent screen recording.
                    </p>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    📷 <strong>Screenshot Placeholder:</strong> Correct camera angle diagram showing hands and workspace
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">4</span>
                    Device Settings Configuration
                  </h5>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={setupProgress.step4}
                      onChange={() => handleSetupStep('step4')}
                    />
                    <span className="text-sm text-green-600">Completed</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-medium mb-2">Required settings:</p>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs font-medium text-gray-800 mb-1">Do Not Disturb:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Enable Do Not Disturb mode</li>
                        <li>• Block all notifications</li>
                        <li>• Disable call alerts</li>
                      </ul>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-800 mb-1">App Management:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Close all other apps</li>
                        <li>• Keep only proctoring app open</li>
                        <li>• Clear recent app history</li>
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    📷 <strong>Screenshot Placeholder:</strong> Do Not Disturb settings screen
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">5</span>
                    Test & Verify Setup
                  </h5>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={setupProgress.step5}
                      onChange={() => handleSetupStep('step5')}
                    />
                    <span className="text-sm text-green-600">Completed</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-medium mb-2">Pre-exam verification:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Confirm instructor can see your workspace clearly</li>
                    <li>• Test that your hands and keyboard are visible</li>
                    <li>• Verify audio is working (if required)</li>
                    <li>• Check that phone is stable and won't move</li>
                    <li>• Ensure no glare or lighting issues</li>
                  </ul>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <p className="text-xs text-yellow-800">
                    📷 <strong>Screenshot Placeholder:</strong> Instructor view of proper secondary camera setup
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-semibold text-gray-800 flex items-center">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm mr-3">6</span>
                    Maintain Setup During Exam
                  </h5>
                  <label className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="text-blue-600"
                      checked={setupProgress.step6}
                      onChange={() => handleSetupStep('step6')}
                    />
                    <span className="text-sm text-green-600">Completed</span>
                  </label>
                </div>
                
                <div className="bg-gray-50 rounded p-3 mb-3">
                  <p className="text-sm font-medium mb-2">During the exam:</p>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Keep phone in exact same position</li>
                    <li>• Do not touch, move, or adjust device</li>
                    <li>• Do not switch apps or check notifications</li>
                    <li>• Maintain clear workspace view at all times</li>
                    <li>• Alert instructor immediately if technical issues occur</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded p-3">
                  <p className="text-xs text-red-800">
                    <strong>Warning:</strong> Any deviation from setup requirements may result in exam invalidation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Setup Progress Summary */}
          {Object.values(setupProgress).some(step => step) && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-3 text-green-800">📊 Your Setup Progress</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <h4 className="font-semibold mb-2">Completed Steps:</h4>
                  <p className="text-gray-700">
                    {Object.values(setupProgress).filter(step => step).length} of {Object.keys(setupProgress).length} steps
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Progress:</h4>
                  <div className="w-full bg-gray-200 rounded-full h-4">
                    <div 
                      className="bg-green-500 h-4 rounded-full transition-all"
                      style={{ width: `${(Object.values(setupProgress).filter(step => step).length / Object.keys(setupProgress).length) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Status:</h4>
                  <p className="text-gray-700">
                    {Object.values(setupProgress).every(step => step) ? 'Ready for Exam! ✅' : 'Setup In Progress ⏳'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Exam Day Behaviors Section */}
      {activeSection === 'behavior' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⚖️ Exam Day Behaviors & Restrictions</h2>
            <p className="text-gray-600 mb-6">
              Learn exactly what behaviors are permitted and prohibited during proctored exams to ensure your success.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Permitted Behaviors</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Normal Exam Activities</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Reading questions and exam instructions carefully
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Typing answers on your computer
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using authorized materials (calculator, formula sheet)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Taking brief breaks to stretch or adjust posture
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Writing notes or calculations on approved paper
                    </li>
                  </ul>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Communication with Proctor</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Asking questions about technical issues
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Reporting problems with the exam platform
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Requesting clarification on instructions
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Alerting proctor to emergencies
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Workspace Management</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Maintaining clean, organized workspace
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Keeping hands visible in secondary camera
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using only pre-approved materials
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Sitting in your designated exam location
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Accessibility Accommodations</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using approved assistive technology
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Taking scheduled breaks (if documented)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using alternative input methods
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Accessing accommodation resources
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">❌ Prohibited Behaviors</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Phone/Device Violations</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Unlocking or touching your phone during the exam
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Switching apps or checking notifications
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Muting or turning off the secondary camera
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Moving or adjusting phone position
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using phone for any purpose other than proctoring
                    </li>
                  </ul>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Communication Violations</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Talking to others during the exam
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Receiving help or coaching from anyone
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using messaging apps or social media
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Making or receiving calls/texts
                    </li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Academic Integrity Violations</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Accessing unauthorized resources or websites
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using AI tools or online calculators (unless permitted)
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Looking at hidden notes or materials
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Sharing exam content with others
                    </li>
                  </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Workspace Violations</h4>
                  <ul className="text-sm text-gray-700 space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Leaving your designated exam area
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Having unauthorized people in the room
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Covering or blocking camera views
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                      Using multiple monitors or screens (unless approved)
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Violations & Consequences Section */}
      {activeSection === 'violations' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⚠️ Violations & Consequences</h2>
            <p className="text-gray-600 mb-6">
              Understand what constitutes a policy violation and the consequences for different types of infractions.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Major Violations (Immediate Exam Termination)</h3>
            
            <div className="space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-800 mb-3">Critical Security Breaches</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Device Misuse:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Unlocking phone during exam</li>
                      <li>• Switching to other apps</li>
                      <li>• Turning off or muting camera</li>
                      <li>• Using phone for communication</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Academic Dishonesty:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Accessing prohibited resources</li>
                      <li>• Receiving external assistance</li>
                      <li>• Using unauthorized materials</li>
                      <li>• Sharing exam content</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border-l-4 border-red-500">
                  <p className="text-sm font-medium text-red-800">Immediate Consequences:</p>
                  <ul className="text-sm text-gray-700 mt-1 space-y-1">
                    <li>• Exam session immediately terminated</li>
                    <li>• Score of 0% recorded for the assessment</li>
                    <li>• Academic integrity investigation initiated</li>
                    <li>• May require meeting with administration</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">⚠️ Minor Violations (Warning System)</h3>
            
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">First Warning Behaviors</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Setup Issues:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Camera angle blocking view of hands</li>
                      <li>• Poor lighting affecting visibility</li>
                      <li>• Phone positioned incorrectly</li>
                      <li>• Workspace cluttered with unauthorized items</li>
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-2">Behavioral Concerns:</p>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Looking away from screen frequently</li>
                      <li>• Moving outside camera range</li>
                      <li>• Appearing to read from hidden materials</li>
                      <li>• Excessive movement or fidgeting</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-white rounded border-l-4 border-orange-500">
                  <p className="text-sm font-medium text-orange-800">Warning Process:</p>
                  <ol className="text-sm text-gray-700 mt-1 space-y-1 list-decimal list-inside">
                    <li>Verbal warning from proctor</li>
                    <li>Opportunity to correct behavior</li>
                    <li>Continued monitoring</li>
                    <li>Escalation if behavior persists</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Accessibility Exceptions Section */}
      {activeSection === 'exceptions' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">♿ Accessibility Exceptions & Accommodations</h2>
            <p className="text-gray-600 mb-6">
              Learn about available accommodations and exceptions for students with documented accessibility needs.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Documented Accommodations</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Assistive Technology Use</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Students with documented needs may use approved assistive technology during exams, including specialized phone apps.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Approved assistive technology:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Screen readers and text-to-speech apps</li>
                      <li>• Voice recognition and dictation software</li>
                      <li>• Visual magnification tools</li>
                      <li>• Communication aids and augmentative devices</li>
                      <li>• Alternative input methods and adaptive keyboards</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">Communication Accommodations</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Students may receive accommodations for communication-related disabilities that affect exam procedures.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Communication supports:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Sign language interpretation during instructions</li>
                      <li>• Written instructions instead of verbal</li>
                      <li>• Alternative communication methods with proctor</li>
                      <li>• Captioning for audio components</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">Modified Setup Requirements</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Camera and monitoring requirements may be modified for students with specific accessibility needs.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Possible modifications:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Alternative camera positioning for mobility aids</li>
                      <li>• Modified workspace monitoring for medical equipment</li>
                      <li>• Adjusted lighting requirements for visual needs</li>
                      <li>• Flexible break schedules for medical conditions</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">Medical Exception Protocols</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Students with documented medical conditions may receive specific accommodations for exam monitoring.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Medical accommodations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Scheduled medication or treatment breaks</li>
                      <li>• Access to medical devices during exams</li>
                      <li>• Modified duration or timing requirements</li>
                      <li>• Emergency contact protocols</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Room Setup Activity Section */}
      {activeSection === 'diagram' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🏠 Interactive Room Setup Activity</h2>
            <p className="text-gray-600 mb-6">
              Practice identifying the correct secondary camera setup using this interactive room diagram.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">📐 Room Diagram Labeling</h3>
            
            <div className="bg-purple-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-purple-800 mb-2">Instructions</h4>
              <p className="text-sm text-gray-700">
                Study the room diagram below and answer the questions about proper secondary camera setup. 
                Consider the requirements for showing hands, keyboard, workspace, and maintaining exam security.
              </p>
            </div>

            {/* Room Diagram */}
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              <div className="relative">
                <div className="bg-white rounded-lg border-2 border-gray-300 p-8" style={{ minHeight: '400px' }}>
                  {/* Room Layout */}
                  <div className="text-center mb-4">
                    <h4 className="font-semibold text-gray-800">Student Exam Room Layout</h4>
                  </div>
                  
                  {/* Desk */}
                  <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
                    <div className="bg-yellow-200 border-2 border-yellow-400 rounded-lg w-32 h-16 flex items-center justify-center">
                      <span className="text-xs font-medium">DESK</span>
                    </div>
                  </div>
                  
                  {/* Chair */}
                  <div className="absolute top-40 left-1/2 transform -translate-x-1/2">
                    <div className="bg-green-200 border-2 border-green-400 rounded-lg w-16 h-12 flex items-center justify-center">
                      <span className="text-xs font-medium">CHAIR</span>
                    </div>
                  </div>
                  
                  {/* Laptop */}
                  <div className="absolute top-24 left-1/2 transform -translate-x-1/2 -translate-y-2">
                    <div className="bg-gray-300 border border-gray-500 rounded w-12 h-8 flex items-center justify-center">
                      <span className="text-xs">💻</span>
                    </div>
                  </div>
                  
                  {/* Potential Phone Positions */}
                  <div className="absolute top-20 right-20">
                    <div className="bg-blue-200 border border-blue-400 rounded w-8 h-12 flex items-center justify-center cursor-pointer hover:bg-blue-300"
                         onClick={() => handleRoomSetup('phonePosition', 'right_side')}>
                      <span className="text-xs">📱A</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-60 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-200 border border-blue-400 rounded w-8 h-12 flex items-center justify-center cursor-pointer hover:bg-blue-300"
                         onClick={() => handleRoomSetup('phonePosition', 'behind_student')}>
                      <span className="text-xs">📱B</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-20 left-20">
                    <div className="bg-blue-200 border border-blue-400 rounded w-8 h-12 flex items-center justify-center cursor-pointer hover:bg-blue-300"
                         onClick={() => handleRoomSetup('phonePosition', 'left_side')}>
                      <span className="text-xs">📱C</span>
                    </div>
                  </div>
                  
                  <div className="absolute top-12 left-1/2 transform -translate-x-1/2">
                    <div className="bg-blue-200 border border-blue-400 rounded w-8 h-12 flex items-center justify-center cursor-pointer hover:bg-blue-300"
                         onClick={() => handleRoomSetup('phonePosition', 'above_monitor')}>
                      <span className="text-xs">📱D</span>
                    </div>
                  </div>
                  
                  {/* Selection indicators */}
                  {roomSetup.phonePosition && (
                    <div className="absolute bottom-4 left-4 text-sm text-green-600">
                      Selected: Phone Position {roomSetup.phonePosition === 'behind_student' ? 'B' : 
                                               roomSetup.phonePosition === 'right_side' ? 'A' :
                                               roomSetup.phonePosition === 'left_side' ? 'C' : 'D'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Question 1: Where should the phone be positioned?</h4>
                <div className="space-y-2">
                  {[
                    { id: 'above_monitor', text: 'Position D - Above the monitor' },
                    { id: 'behind_student', text: 'Position B - Behind the student' },
                    { id: 'right_side', text: 'Position A - To the right side of desk' },
                    { id: 'left_side', text: 'Position C - To the left side of desk' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="phone_position"
                        className="text-purple-600"
                        onChange={() => handleDiagramAnswer('phone_position', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Question 2: What should the secondary camera show?</h4>
                <div className="space-y-2">
                  {[
                    { id: 'computer_screen', text: 'The computer screen and exam content' },
                    { id: 'hands_keyboard_desk', text: 'Hands, keyboard, and workspace area' },
                    { id: 'full_room_view', text: 'Full room overview from above' },
                    { id: 'student_face_only', text: 'Only the student\'s face' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="camera_view"
                        className="text-purple-600"
                        onChange={() => handleDiagramAnswer('camera_view', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Question 3: How should the student be positioned?</h4>
                <div className="space-y-2">
                  {[
                    { id: 'back_to_camera', text: 'With back to the secondary camera' },
                    { id: 'facing_camera', text: 'Facing toward the secondary camera' },
                    { id: 'side_profile', text: 'In side profile to the camera' },
                    { id: 'constantly_moving', text: 'Moving freely around the room' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="student_seat"
                        className="text-purple-600"
                        onChange={() => handleDiagramAnswer('student_seat', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Question 4: What should the workspace look like?</h4>
                <div className="space-y-2">
                  {[
                    { id: 'cluttered_materials', text: 'Cluttered with study materials and notes' },
                    { id: 'multiple_devices', text: 'Multiple phones and devices visible' },
                    { id: 'clear_visible', text: 'Clear, organized, with only approved materials visible' },
                    { id: 'covered_items', text: 'Items covered or hidden from camera view' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="workspace"
                        className="text-purple-600"
                        onChange={() => handleDiagramAnswer('workspace', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={checkDiagramAnswers}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  Check My Answers
                </button>
              </div>

              {showDiagramFeedback && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Answer Feedback</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Correct Setup:</strong></p>
                    <ul className="text-gray-700 space-y-1">
                      <li>• Phone should be positioned <strong>behind the student</strong> (Position B)</li>
                      <li>• Camera should show <strong>hands, keyboard, and workspace</strong></li>
                      <li>• Student should be <strong>facing toward the camera</strong></li>
                      <li>• Workspace should be <strong>clear and organized</strong></li>
                    </ul>
                    <p className="mt-3 text-green-700">
                      This setup ensures proper monitoring while maintaining exam security and student privacy.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Behavior Quiz Section */}
      {activeSection === 'quiz' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📝 Exam Day Behavior Quiz</h2>
            <p className="text-gray-600 mb-6">
              Test your knowledge of appropriate exam day behaviors and responses to common situations.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🎯 Scenario-Based Questions</h3>
            
            <div className="space-y-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 1: Technical Emergency</h4>
                <p className="text-sm text-gray-700 mb-3">
                  During your exam, your phone's secondary camera suddenly shuts off due to a technical issue. 
                  What should you do immediately?
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'continue_exam', text: 'Continue with the exam and address it later' },
                    { id: 'restart_phone', text: 'Pick up your phone and restart it' },
                    { id: 'immediately_stop', text: 'Stop the exam and immediately notify the proctor' },
                    { id: 'use_backup', text: 'Switch to a backup device without asking' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="q1"
                        className="text-orange-600"
                        onChange={() => handleBehaviorQuiz('q1', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 2: Bathroom Break</h4>
                <p className="text-sm text-gray-700 mb-3">
                  You really need to use the bathroom during a long exam. The exam platform doesn't have 
                  a break feature built in. What's the appropriate action?
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'just_go', text: 'Quickly leave and return, keeping cameras on' },
                    { id: 'turn_off_camera', text: 'Turn off your camera and go' },
                    { id: 'ask_permission', text: 'Ask the proctor for permission and follow their instructions' },
                    { id: 'hold_it', text: 'Wait until the exam is completely finished' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="q2"
                        className="text-blue-600"
                        onChange={() => handleBehaviorQuiz('q2', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 3: Family Emergency</h4>
                <p className="text-sm text-gray-700 mb-3">
                  During your exam, someone is urgently knocking at your door saying there's a family emergency. 
                  What should you do?
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'ignore_knocking', text: 'Ignore the knocking and continue the exam' },
                    { id: 'answer_door', text: 'Immediately answer the door without notifying anyone' },
                    { id: 'call_proctor', text: 'Alert the proctor to the emergency and ask for guidance' },
                    { id: 'pause_exam', text: 'Try to pause the exam yourself and handle the emergency' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="q3"
                        className="text-purple-600"
                        onChange={() => handleBehaviorQuiz('q3', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="bg-red-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Scenario 4: Notification Distraction</h4>
                <p className="text-sm text-gray-700 mb-3">
                  Despite setting Do Not Disturb mode, your phone starts buzzing with notifications during the exam. 
                  What happens to your exam?
                </p>
                <div className="space-y-2">
                  {[
                    { id: 'warning_only', text: 'You get a warning but can continue' },
                    { id: 'second_chance', text: 'You can turn off the phone and continue' },
                    { id: 'depends_proctor', text: 'It depends on how the proctor feels' },
                    { id: 'void_exam', text: 'Your exam may be voided for not following setup requirements' }
                  ].map((option) => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="q4"
                        className="text-red-600"
                        onChange={() => handleBehaviorQuiz('q4', option.id)}
                      />
                      <span className="text-sm">{option.text}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <button
                  onClick={submitBehaviorQuiz}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Submit Quiz
                </button>
              </div>

              {quizSubmitted && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">Quiz Results & Explanations</h4>
                  <div className="space-y-3 text-sm">
                    <div>
                      <p><strong>Scenario 1:</strong> Correct answer is "Stop the exam and immediately notify the proctor"</p>
                      <p className="text-gray-600">Technical issues must be addressed immediately with proctor guidance to maintain exam integrity.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 2:</strong> Correct answer is "Ask the proctor for permission and follow their instructions"</p>
                      <p className="text-gray-600">All breaks must be approved and monitored to ensure exam security.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 3:</strong> Correct answer is "Alert the proctor to the emergency and ask for guidance"</p>
                      <p className="text-gray-600">True emergencies require proctor notification for proper documentation and response.</p>
                    </div>
                    <div>
                      <p><strong>Scenario 4:</strong> Correct answer is "Your exam may be voided for not following setup requirements"</p>
                      <p className="text-gray-600">Proper device setup is mandatory; violations can result in exam invalidation.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Policy Overview Section */}
      {activeSection === 'policy' && (
        <section className="space-y-6">
          <div className="bg-red-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-900">📜 RTD Academy Academic Integrity Policy</h2>
            <p className="text-gray-700 mb-4">
              Academic integrity is fundamental to your success and the integrity of RTD Academy. Our policy ensures 
              that all students are evaluated fairly and that academic achievements reflect genuine knowledge and skills.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🎯 Core Principles</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                    Honesty in All Work
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    All assignments, quizzes, and exams must be your own original work.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">This means:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Completing all assessments independently</li>
                      <li>• Not copying from other sources without citation</li>
                      <li>• Using only authorized resources during exams</li>
                      <li>• Representing your true understanding</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Respect for Learning Process
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Honor the educational process and the efforts of your peers and instructors.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Examples include:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Not sharing exam content with others</li>
                      <li>• Respecting intellectual property</li>
                      <li>• Maintaining confidentiality of assessments</li>
                      <li>• Supporting fair evaluation for everyone</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                    Accountability & Responsibility
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Take responsibility for understanding and following academic integrity standards.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Your responsibilities:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Know what constitutes academic dishonesty</li>
                      <li>• Ask questions when policies are unclear</li>
                      <li>• Report suspected violations</li>
                      <li>• Accept consequences if violations occur</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Ethical Use of Technology
                  </h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Use technology appropriately and within the guidelines of each assessment.
                  </p>
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Technology guidelines:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• No unauthorized AI tool usage during exams</li>
                      <li>• Respect software and platform restrictions</li>
                      <li>• Use assistive technology only when approved</li>
                      <li>• Maintain security of login credentials</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">⚖️ Why Academic Integrity Matters</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">For You:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Develops genuine skills and knowledge</li>
                  <li>• Builds confidence in your abilities</li>
                  <li>• Prepares you for future challenges</li>
                  <li>• Maintains the value of your credentials</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Your Peers:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Ensures fair competition and evaluation</li>
                  <li>• Protects the integrity of grades</li>
                  <li>• Maintains trust in the system</li>
                  <li>• Supports collaborative learning</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">For Society:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Maintains trust in educational credentials</li>
                  <li>• Ensures competent professionals</li>
                  <li>• Upholds ethical standards</li>
                  <li>• Protects academic reputation</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Types of Violations Section */}
      {activeSection === 'violations' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🚫 Types of Academic Integrity Violations</h2>
            <p className="text-gray-600 mb-6">
              Understanding what constitutes academic dishonesty helps you avoid violations and maintain integrity.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-700">📝 Plagiarism</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">What is Plagiarism?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Using someone else's work, ideas, or words without proper citation or attribution.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Common forms:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Copying text from websites without quotation marks</li>
                      <li>• Submitting someone else's assignment as your own</li>
                      <li>• Paraphrasing without crediting the source</li>
                      <li>• Using images or media without permission</li>
                      <li>• Self-plagiarism (reusing your own previous work)</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">How to Avoid Plagiarism</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Always cite sources:</strong> Include author, title, date, and URL</p>
                    <p>• <strong>Use quotation marks:</strong> For direct quotes from any source</p>
                    <p>• <strong>Paraphrase properly:</strong> Rewrite in your own words AND cite</p>
                    <p>• <strong>Ask for help:</strong> When unsure about citation requirements</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-700">🤖 AI Tool Misuse</h3>
              
              <div className="space-y-4">
                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Prohibited AI Usage</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Using artificial intelligence tools like ChatGPT, Claude, or Bard to complete assessments 
                    that should demonstrate your own knowledge.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Examples of violations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Using ChatGPT to answer exam questions</li>
                      <li>• Having AI write your essays or assignments</li>
                      <li>• Using AI to solve math problems during tests</li>
                      <li>• Getting AI to explain concepts during closed-book exams</li>
                      <li>• Using AI translation tools during language assessments</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-2">Appropriate AI Use</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Study preparation:</strong> Use AI to create practice questions</p>
                    <p>• <strong>Concept review:</strong> Get explanations for learning (not during exams)</p>
                    <p>• <strong>Writing assistance:</strong> Only when explicitly permitted by instructor</p>
                    <p>• <strong>Research help:</strong> Generate ideas for topics (not final content)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-purple-700">🤝 Unauthorized Collaboration</h3>
              
              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">What Counts as Cheating?</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Working with others on assignments or exams that are meant to be completed individually.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Violation examples:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Sharing quiz or exam answers with classmates</li>
                      <li>• Working together on individual assignments</li>
                      <li>• Getting help from tutors during exams</li>
                      <li>• Looking at another student's work during tests</li>
                      <li>• Using unauthorized online help forums</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">Allowed Collaboration</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Study groups:</strong> Reviewing material together before exams</p>
                    <p>• <strong>Seeking help:</strong> Asking instructors for clarification on concepts</p>
                    <p>• <strong>Academic support:</strong> Using RTD Academy tutoring and support services</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-indigo-700">👤 Impersonation & Identity Fraud</h3>
              
              <div className="space-y-4">
                <div className="bg-indigo-50 rounded-lg p-4">
                  <h4 className="font-semibold text-indigo-800 mb-2">Identity Violations</h4>
                  <p className="text-sm text-gray-700 mb-3">
                    Having someone else complete assignments or exams on your behalf, or misrepresenting your identity.
                  </p>
                  
                  <div className="bg-white rounded p-3">
                    <p className="text-xs font-medium mb-2">Serious violations:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Having someone else take your exam</li>
                      <li>• Sharing login credentials with others</li>
                      <li>• Taking an exam for another student</li>
                      <li>• Using fake identification during assessments</li>
                      <li>• Submitting work completed by someone else</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Severe Consequences</h4>
                  <div className="text-sm text-gray-700 space-y-2">
                    <p>• <strong>Immediate withdrawal</strong> from the course</p>
                    <p>• <strong>Permanent record</strong> of academic dishonesty</p>
                    <p>• <strong>Prohibition</strong> from future RTD Academy enrollment</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Disciplinary Process Section */}
      {activeSection === 'discipline' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">⚖️ RTD Academy Disciplinary Process</h2>
            <p className="text-gray-600 mb-6">
              Understand the clear, fair process used to address academic integrity violations.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">📋 Investigation Process</h3>
            
            <div className="space-y-4">
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-300"></div>
                
                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                  <div className="flex-grow">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-800 mb-2">Initial Detection</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Potential violation is identified through automated systems, instructor observation, or student reports.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Detection methods:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Plagiarism detection software</li>
                          <li>• Proctoring system alerts</li>
                          <li>• Unusual pattern recognition</li>
                          <li>• Instructor review of submissions</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                  <div className="flex-grow">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-800 mb-2">Preliminary Investigation</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Course instructor conducts initial review of evidence and documentation.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Investigation includes:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Review of submission timestamps</li>
                          <li>• Analysis of work patterns</li>
                          <li>• Comparison with other submissions</li>
                          <li>• Examination of technical evidence</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4 pb-6">
                  <div className="flex-shrink-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                  <div className="flex-grow">
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <h4 className="font-semibold text-orange-800 mb-2">Student Notification</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Student is informed of the suspected violation and given opportunity to respond.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Notification process:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Formal email with specific allegations</li>
                          <li>• Evidence summary provided</li>
                          <li>• 48-hour response period given</li>
                          <li>• Right to explanation acknowledged</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="relative flex items-start space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">4</div>
                  <div className="flex-grow">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-semibold text-red-800 mb-2">Final Decision</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        Based on investigation and student response, final decision and consequences are determined.
                      </p>
                      <div className="bg-white rounded p-3">
                        <p className="text-xs font-medium mb-1">Decision factors:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          <li>• Strength of evidence</li>
                          <li>• Student's explanation and response</li>
                          <li>• Previous violation history</li>
                          <li>• Severity of the violation</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-yellow-700">⚠️ First Offense Consequences</h3>
              
              <div className="space-y-4">
                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-3">Standard First Offense Process</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-2">1. Assessment Scored at 0%</h5>
                      <p className="text-xs text-gray-600">
                        The violated assessment receives a grade of zero percent, regardless of the content submitted.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-blue-700 mb-2">2. Academic Integrity Module Required</h5>
                      <p className="text-xs text-gray-600">
                        Student must complete a comprehensive online module covering academic integrity principles 
                        before continuing with coursework.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-green-700 mb-2">3. Re-write Opportunity Available</h5>
                      <p className="text-xs text-gray-600">
                        After completing the integrity module, student may use their course re-write opportunity 
                        to replace the zero grade.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-red-700">🚨 Second Offense Consequences</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-3">Immediate Course Withdrawal</h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-red-700 mb-2">Automatic Withdrawal</h5>
                      <p className="text-xs text-gray-600">
                        Student is immediately withdrawn from the course with no opportunity for completion or re-write.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-orange-700 mb-2">Current Grade Submitted</h5>
                      <p className="text-xs text-gray-600">
                        The student's grade at the time of violation is calculated and submitted to PASI as the final mark.
                      </p>
                    </div>
                    
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm text-purple-700 mb-2">Future Enrollment Prohibited</h5>
                      <p className="text-xs text-gray-600">
                        Student becomes ineligible to register for any future RTD Academy courses.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </section>
      )}

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Cell Phones, Exams, and Academic Integrity Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of cell phone policies, exam procedures, and academic integrity standards.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
              {/* Question Progress Indicator */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-2">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
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

            {/* Question 1 - Cell Phone Setup Knowledge */}
            {currentQuestionIndex === 0 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question1"
                cloudFunctionName="course4_08_cell_phone_policy_question1"
                title="Secondary Camera Setup"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(1);
                  setQuestionResults(prev => ({...prev, question1: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 2 - Do Not Disturb Settings Knowledge */}
            {currentQuestionIndex === 1 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question2"
                cloudFunctionName="course4_08_cell_phone_policy_question2"
                title="Phone Configuration Requirements"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(2);
                  setQuestionResults(prev => ({...prev, question2: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 3 - Prohibited Behaviors Knowledge */}
            {currentQuestionIndex === 2 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question3"
                cloudFunctionName="course4_08_cell_phone_policy_question3"
                title="Exam Day Restrictions"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(3);
                  setQuestionResults(prev => ({...prev, question3: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 4 - Academic Integrity Policy Knowledge */}
            {currentQuestionIndex === 3 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question4"
                cloudFunctionName="course4_08_cell_phone_policy_question4"
                title="Academic Integrity Principles"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(4);
                  setQuestionResults(prev => ({...prev, question4: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 5 - Violation Consequences Knowledge */}
            {currentQuestionIndex === 4 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question5"
                cloudFunctionName="course4_08_cell_phone_policy_question5"
                title="Violation Consequences"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(5);
                  setQuestionResults(prev => ({...prev, question5: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 6 - Technical Issue Scenario */}
            {currentQuestionIndex === 5 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question6"
                cloudFunctionName="course4_08_cell_phone_policy_question6"
                title="Technical Difficulties During Exam"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(6);
                  setQuestionResults(prev => ({...prev, question6: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 7 - Academic Integrity Violation Scenario */}
            {currentQuestionIndex === 6 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question7"
                cloudFunctionName="course4_08_cell_phone_policy_question7"
                title="Academic Integrity Scenario"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(7);
                  setQuestionResults(prev => ({...prev, question7: isCorrect ? 'correct' : 'incorrect'}));
                }}
              />
            )}

            {/* Question 8 - Phone Policy Violation Scenario */}
            {currentQuestionIndex === 7 && (
              <StandardMultipleChoiceQuestion
                courseId={courseId}
                assessmentId="08_cell_phone_policy_question8"
                cloudFunctionName="course4_08_cell_phone_policy_question8"
                title="Cell Phone Policy Scenario"
                theme="indigo"
                onAttempt={(isCorrect) => {
                  handleQuestionComplete(8);
                  setQuestionResults(prev => ({...prev, question8: isCorrect ? 'correct' : 'incorrect'}));
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
                  Question {currentQuestionIndex + 1} of 8
                </div>

                <button
                  onClick={() => setCurrentQuestionIndex(Math.min(7, currentQuestionIndex + 1))}
                  disabled={currentQuestionIndex === 7}
                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    currentQuestionIndex === 7
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
      <section className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 You're Ready for Proctored Exams!</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">What You've Mastered:</h3>
            <ul className="space-y-2 text-red-100">
              <li>✅ RTD Academy's comprehensive cell phone policy</li>
              <li>✅ Step-by-step secondary camera setup procedures</li>
              <li>✅ Exam day behaviors and restrictions</li>
              <li>✅ Violation consequences and documentation process</li>
              <li>✅ Accessibility accommodations and exceptions</li>
              <li>✅ Emergency protocols and communication procedures</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Exam Success Checklist:</h3>
            <div className="space-y-2 text-red-100">
              <p>1. 📱 Practice secondary camera setup before exam day</p>
              <p>2. 🔇 Master Do Not Disturb settings and app management</p>
              <p>3. 🏠 Prepare your exam workspace according to requirements</p>
              <p>4. 📞 Know how to contact proctors for technical issues</p>
              <p>5. 📋 Understand consequences and follow all procedures</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 Remember: Following the cell phone policy protects your academic integrity and ensures fair 
            testing conditions for all students. When in doubt, always ask your proctor for guidance!
          </p>
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              if (onNavigateToNext) {
                onNavigateToNext();
              }
            }}
            className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
          >
            Continue to Next Lesson →
          </button>
        </div>
      </section>
      )}
    </div>
  );
};

export default CellPhonePolicyExamProctoring;