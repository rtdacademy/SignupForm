import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const CellPhonePolicyExamProctoring = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
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

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Cell Phone Policy & Exam Proctoring</h1>
        <p className="text-xl mb-6">Master RTD Academy's cell phone requirements for academic integrity and exam success</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand RTD's cell phone policy, master secondary-camera setup procedures, 
            learn exam day behaviors and restrictions, and identify accessibility exceptions and accommodations.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Policy Overview' },
            { id: 'general', label: 'General Expectations' },
            { id: 'setup', label: 'Secondary Camera Setup' },
            { id: 'behavior', label: 'Exam Day Behaviors' },
            { id: 'violations', label: 'Violations & Consequences' },
            { id: 'exceptions', label: 'Accessibility Exceptions' },
            { id: 'diagram', label: 'Room Setup Activity' },
            { id: 'quiz', label: 'Behavior Quiz' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-red-500 text-red-600'
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

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Cell Phone Policy Knowledge Check</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Demonstrate your comprehensive understanding of RTD Academy's cell phone policy and exam procedures.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="08_cell_phone_policy_exam_proctoring_practice"
            cloudFunctionName="course4_08_cell_phone_policy_exam_proctoring_aiQuestion"
            title="Cell Phone Policy & Proctoring Procedures"
            theme="red"
          />
        </section>
      )}

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-red-600 to-orange-700 text-white rounded-lg p-8">
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
      </section>
    </div>
  );
};

export default CellPhonePolicyExamProctoring;