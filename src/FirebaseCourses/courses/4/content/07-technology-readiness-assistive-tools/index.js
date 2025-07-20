import React, { useState, useEffect } from 'react';
import { AIMultipleChoiceQuestion, StandardMultipleChoiceQuestion } from '../../../../components/assessments';

const TechnologyReadinessAssistiveTools = ({ courseId, itemId, activeItem }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [techChecklist, setTechChecklist] = useState({});
  const [assistiveTools, setAssistiveTools] = useState(['', '', '']);
  const [showChecklistResults, setShowChecklistResults] = useState(false);
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

  // Tech requirements checklist data
  const techRequirements = [
    {
      id: 'browser',
      category: 'Software',
      requirement: 'Updated web browser (Chrome, Firefox, Safari, or Edge)',
      critical: true,
      explanation: 'An updated browser ensures compatibility with course content and security features'
    },
    {
      id: 'internet',
      category: 'Network',
      requirement: 'Stable internet connection (minimum 5 Mbps download)',
      critical: true,
      explanation: 'Reliable internet prevents disconnections during virtual meetings and assessments'
    },
    {
      id: 'webcam',
      category: 'Hardware',
      requirement: 'Working webcam for exam proctoring',
      critical: true,
      explanation: 'Required for identity verification during proctored exams'
    },
    {
      id: 'microphone',
      category: 'Hardware',
      requirement: 'Built-in or external microphone',
      critical: true,
      explanation: 'Needed for virtual office hours and group discussions'
    },
    {
      id: 'speakers',
      category: 'Hardware',
      requirement: 'Speakers or headphones for audio content',
      critical: true,
      explanation: 'Essential for accessing lecture recordings and video content'
    },
    {
      id: 'storage',
      category: 'Hardware',
      requirement: 'At least 2GB free storage space',
      critical: false,
      explanation: 'For downloading course materials and saving assignments'
    },
    {
      id: 'backup',
      category: 'System',
      requirement: 'Backup device or cloud storage access',
      critical: false,
      explanation: 'Protects your work from technical failures'
    },
    {
      id: 'antivirus',
      category: 'Software',
      requirement: 'Updated antivirus software',
      critical: false,
      explanation: 'Protects your system and maintains security standards'
    }
  ];


  const handleChecklistChange = (itemId, checked) => {
    setTechChecklist(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };


  const handleAssistiveToolChange = (index, value) => {
    const newTools = [...assistiveTools];
    newTools[index] = value;
    setAssistiveTools(newTools);
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


  const checkTechReadiness = () => {
    const criticalItems = techRequirements.filter(item => item.critical);
    const completedCritical = criticalItems.filter(item => techChecklist[item.id]).length;
    const totalCompleted = Object.values(techChecklist).filter(Boolean).length;
    
    setShowChecklistResults(true);
    return { criticalItems: criticalItems.length, completedCritical, totalCompleted, totalItems: techRequirements.length };
  };


  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg p-8">
        <h1 className="text-4xl font-bold mb-4">Technology Readiness & Assistive Tools</h1>
        <p className="text-xl mb-6">Set up your technology for success at RTD Academy</p>
        <div className="bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg">
            🎯 <strong>Learning Objectives:</strong> Understand minimum hardware and software requirements, 
            set up an ergonomic workspace, organize files effectively, and explore accessibility features and assistive tools.
          </p>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Tech Overview' },
            { id: 'requirements', label: 'System Requirements' },
            { id: 'ergonomics', label: 'Ergonomics & Setup' },
            { id: 'accessibility', label: 'Accessibility Tools' },
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

      {/* Technology Overview Section */}
      {activeSection === 'overview' && (
        <section className="space-y-6">
          <div className="bg-cyan-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-cyan-900">💻 Technology Success at RTD Academy</h2>
            <p className="text-gray-700 mb-4">
              Your technology setup directly impacts your learning experience. RTD Academy's online environment 
              requires specific technical capabilities to ensure you can access all course features and participate fully.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-green-700">✅ Why Technology Readiness Matters</h3>
              
              <div className="space-y-4">
                <div className="border-l-4 border-green-400 pl-4">
                  <h4 className="font-semibold text-green-800">Exam Integrity</h4>
                  <p className="text-sm text-gray-600">Proctored exams require specific camera and audio setups for identity verification</p>
                </div>
                
                <div className="border-l-4 border-blue-400 pl-4">
                  <h4 className="font-semibold text-blue-800">Virtual Participation</h4>
                  <p className="text-sm text-gray-600">Office hours and group sessions need reliable audio/video capabilities</p>
                </div>
                
                <div className="border-l-4 border-purple-400 pl-4">
                  <h4 className="font-semibold text-purple-800">Content Access</h4>
                  <p className="text-sm text-gray-600">Interactive lessons and multimedia content require modern browser capabilities</p>
                </div>
                
                <div className="border-l-4 border-orange-400 pl-4">
                  <h4 className="font-semibold text-orange-800">Assignment Submission</h4>
                  <p className="text-sm text-gray-600">File uploads and online submissions need stable internet and storage</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-orange-700">⚠️ Common Technical Challenges</h3>
              
              <div className="space-y-4">
                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">Connectivity Issues</h4>
                  <p className="text-sm text-gray-700">
                    Slow or unstable internet can cause disconnections during exams or important meetings.
                  </p>
                  <p className="text-xs text-red-600 mt-1">Solution: Test your connection and have backup options ready</p>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-2">Browser Compatibility</h4>
                  <p className="text-sm text-gray-700">
                    Outdated browsers may not support all course features or security requirements.
                  </p>
                  <p className="text-xs text-orange-600 mt-1">Solution: Keep your browser updated and use supported versions</p>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2">Hardware Limitations</h4>
                  <p className="text-sm text-gray-700">
                    Missing webcam or microphone can prevent exam participation.
                  </p>
                  <p className="text-xs text-yellow-600 mt-1">Solution: Invest in basic hardware early in your studies</p>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Poor Workspace</h4>
                  <p className="text-sm text-gray-700">
                    Uncomfortable or distracting environments reduce learning effectiveness.
                  </p>
                  <p className="text-xs text-purple-600 mt-1">Solution: Design a dedicated, ergonomic study space</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3">🎯 Your Technology Success Plan</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">🔧</div>
                <h4 className="font-semibold mb-1">Assess Requirements</h4>
                <p className="text-gray-600">Check all minimum hardware and software needs</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">🪑</div>
                <h4 className="font-semibold mb-1">Setup Workspace</h4>
                <p className="text-gray-600">Create ergonomic and distraction-free environment</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">📁</div>
                <h4 className="font-semibold mb-1">Organize Files</h4>
                <p className="text-gray-600">Establish clear file management system</p>
              </div>
              <div className="bg-white rounded p-3 text-center">
                <div className="text-2xl mb-2">♿</div>
                <h4 className="font-semibold mb-1">Enable Accessibility</h4>
                <p className="text-gray-600">Configure assistive tools as needed</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* System Requirements Section */}
      {activeSection === 'requirements' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🖥️ Minimum System Requirements</h2>
            <p className="text-gray-600 mb-6">
              Ensure your computer and internet setup meet these minimum requirements for RTD Academy courses.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">💾 Hardware Requirements</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🖱️ Computer Specifications</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Processor:</span>
                        <span className="text-sm text-gray-600">Dual-core 2.0 GHz or better</span>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">RAM:</span>
                        <span className="text-sm text-gray-600">4 GB minimum, 8 GB recommended</span>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Storage:</span>
                        <span className="text-sm text-gray-600">2 GB free space minimum</span>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">Display:</span>
                        <span className="text-sm text-gray-600">1024x768 resolution minimum</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">📷 Audio/Video Hardware</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span><strong>Webcam:</strong> 720p minimum for exam proctoring</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span><strong>Microphone:</strong> Built-in or external with noise cancellation</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span><strong>Speakers/Headphones:</strong> Clear audio output for lectures</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      <span><strong>Secondary Camera:</strong> Phone/tablet for workspace monitoring during exams</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">🌐 Internet Requirements</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">5 Mbps</div>
                        <div className="text-sm text-gray-600">Minimum Download Speed</div>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">1 Mbps</div>
                        <div className="text-sm text-gray-600">Minimum Upload Speed</div>
                      </div>
                    </div>
                    <div className="bg-white rounded p-3">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-700">&lt; 100ms</div>
                        <div className="text-sm text-gray-600">Latency for Real-time Sessions</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-purple-700">
                      <strong>💡 Tip:</strong> Test your speed at speedtest.net before starting courses
                    </p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">🔌 Power & Connectivity</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span><strong>Wired Connection:</strong> Ethernet preferred for exams</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span><strong>Backup Power:</strong> UPS or laptop battery for outage protection</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span><strong>Mobile Hotspot:</strong> Backup internet connection option</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span><strong>Multiple Devices:</strong> Phone/tablet as backup for critical sessions</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-indigo-700">🔧 Software Requirements</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">🌐 Supported Web Browsers</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-sm">Google Chrome</span>
                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Recommended</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-sm">Mozilla Firefox</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Supported</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-sm">Microsoft Edge</span>
                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Supported</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-white rounded">
                    <span className="font-medium text-sm">Safari (macOS)</span>
                    <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-1 rounded">Limited</span>
                  </div>
                </div>
                
                <div className="mt-3 p-2 bg-white rounded">
                  <p className="text-xs text-indigo-700">
                    <strong>Important:</strong> Keep your browser updated to the latest version
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">📦 Required Browser Features</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>JavaScript enabled</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Cookies enabled</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Pop-up blockers configured</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Camera and microphone permissions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Download permissions for course materials</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <h5 className="font-semibold text-sm mb-2">Browser Security Settings:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Allow rtdacademy.com in security settings</li>
                    <li>• Enable camera/microphone for exam platform</li>
                    <li>• Disable browser extensions during exams</li>
                    <li>• Clear cache if experiencing loading issues</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">🛠️ Additional Software Recommendations</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Productivity Tools:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• PDF reader (Adobe Reader, Preview)</li>
                  <li>• Word processor (Word, Google Docs)</li>
                  <li>• Spreadsheet application</li>
                  <li>• Note-taking app (OneNote, Notion)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Security Software:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Updated antivirus protection</li>
                  <li>• Windows Defender (Windows)</li>
                  <li>• Regular system updates</li>
                  <li>• Firewall enabled</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Communication Tools:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Microsoft Teams (pre-installed)</li>
                  <li>• Email client or web access</li>
                  <li>• Calendar application</li>
                  <li>• File compression utility</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Ergonomics & Setup Section */}
      {activeSection === 'ergonomics' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🪑 Ergonomic Workspace Setup</h2>
            <p className="text-gray-600 mb-6">
              Create a comfortable, healthy workspace that supports long study sessions and improves focus.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">💺 Proper Seating and Posture</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">✅ Ideal Chair Setup</h4>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <div>
                        <p className="font-medium text-sm">Feet Flat on Floor</p>
                        <p className="text-xs text-gray-600">Knees at 90-degree angle, thighs parallel to floor</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <div>
                        <p className="font-medium text-sm">Back Against Chair</p>
                        <p className="text-xs text-gray-600">Lumbar support maintains natural spine curve</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <div>
                        <p className="font-medium text-sm">Arms Relaxed</p>
                        <p className="text-xs text-gray-600">Shoulders down, elbows close to body at 90 degrees</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                      <div>
                        <p className="font-medium text-sm">Head Upright</p>
                        <p className="text-xs text-gray-600">Ears over shoulders, eyes level with top of monitor</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-red-50 rounded-lg p-4">
                  <h4 className="font-semibold text-red-800 mb-2">❌ Common Posture Mistakes</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Slouching or leaning forward</li>
                    <li>• Feet dangling or crossed for long periods</li>
                    <li>• Hunching shoulders or tensing neck</li>
                    <li>• Sitting too close or too far from monitor</li>
                    <li>• Looking down at laptop screen</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🖥️ Monitor and Screen Position</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Distance:</strong> 20-26 inches (arm's length) from your eyes</p>
                    <p><strong>Height:</strong> Top of screen at or slightly below eye level</p>
                    <p><strong>Angle:</strong> Screen tilted back 10-20 degrees</p>
                    <p><strong>Brightness:</strong> Match surrounding environment, no glare</p>
                    <p><strong>Multiple Monitors:</strong> Primary screen directly in front</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-blue-700">
                      <strong>💡 Laptop Users:</strong> Use external keyboard/mouse with elevated screen or external monitor
                    </p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">⌨️ Keyboard and Mouse Setup</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Keyboard Height:</strong> Elbows at 90 degrees, wrists straight</p>
                    <p><strong>Wrist Position:</strong> Floating, not resting on surface</p>
                    <p><strong>Mouse Placement:</strong> Same level as keyboard, close to body</p>
                    <p><strong>Mouse Grip:</strong> Light grip, whole arm movement</p>
                    <p><strong>Keyboard Tilt:</strong> Flat or slightly negative tilt</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-purple-700">
                      <strong>⚠️ Warning:</strong> Avoid bending wrists up or down while typing
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">💡 Lighting and Environment</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">🌞 Optimal Lighting Setup</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Natural Light</h5>
                    <p className="text-xs text-gray-600">Position monitor perpendicular to windows to avoid glare</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Task Lighting</h5>
                    <p className="text-xs text-gray-600">Use desk lamp for reading, positioned to avoid screen reflection</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Ambient Lighting</h5>
                    <p className="text-xs text-gray-600">Soft overhead or indirect lighting to reduce eye strain</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Color Temperature</h5>
                    <p className="text-xs text-gray-600">Warm light (3000K) in evening, cool light (5000K) during day</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">🎧 Audio Environment</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span><strong>Noise Control:</strong> Minimize background noise and distractions</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span><strong>Headphones:</strong> Use for virtual meetings to prevent echo</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span><strong>Microphone:</strong> Position close to mouth, away from keyboard</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span><strong>Room Acoustics:</strong> Soft furnishings reduce echo and noise</span>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-blue-50 rounded">
                  <h5 className="font-semibold text-sm mb-2">Camera Considerations:</h5>
                  <ul className="text-xs text-gray-600 space-y-1">
                    <li>• Camera at eye level for natural appearance</li>
                    <li>• Face well-lit from front or side</li>
                    <li>• Neutral, professional background</li>
                    <li>• Stable mount to prevent movement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">🏃 Health and Movement Tips</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Regular Breaks:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• 20-20-20 rule: Every 20 minutes, look at something 20 feet away for 20 seconds</li>
                  <li>• Stand and stretch every hour</li>
                  <li>• Take 5-10 minute breaks between study sessions</li>
                  <li>• Walk around during longer breaks</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Eye Care:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Blink frequently to keep eyes moist</li>
                  <li>• Adjust screen brightness and contrast</li>
                  <li>• Use blue light filters in evening</li>
                  <li>• Keep artificial tears nearby if needed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Physical Wellness:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Neck and shoulder stretches</li>
                  <li>• Wrist and finger exercises</li>
                  <li>• Back strengthening exercises</li>
                  <li>• Proper hydration and nutrition</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}


      {/* Accessibility Tools Section */}
      {activeSection === 'accessibility' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">♿ Accessibility Features & Assistive Tools</h2>
            <p className="text-gray-600 mb-6">
              Learn about built-in accessibility features and assistive technologies that can enhance your learning experience.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">🖥️ Built-in Operating System Features</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">🪟 Windows Accessibility</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm mb-1">Narrator (Screen Reader)</h5>
                      <p className="text-xs text-gray-600 mb-1">Built-in screen reader that reads text aloud</p>
                      <p className="text-xs text-blue-700 font-mono">Windows + Ctrl + Enter to activate</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm mb-1">Magnifier</h5>
                      <p className="text-xs text-gray-600 mb-1">Enlarges part or all of your screen</p>
                      <p className="text-xs text-blue-700 font-mono">Windows + Plus sign to activate</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm mb-1">High Contrast</h5>
                      <p className="text-xs text-gray-600 mb-1">Improves visibility with high-contrast colors</p>
                      <p className="text-xs text-blue-700 font-mono">Alt + Left Shift + Print Screen</p>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm mb-1">Speech Recognition</h5>
                      <p className="text-xs text-gray-600 mb-1">Control computer with voice commands</p>
                      <p className="text-xs text-blue-700 font-mono">Windows + Ctrl + S to activate</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3">🍎 macOS Accessibility</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      <span><strong>VoiceOver:</strong> Advanced screen reader (Cmd + F5)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      <span><strong>Zoom:</strong> Screen magnification (Cmd + Option + 8)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      <span><strong>Dictation:</strong> Speech to text (Press Fn twice)</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-gray-500 rounded-full mr-2"></span>
                      <span><strong>Switch Control:</strong> Navigate with external switches</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">🌐 Browser Accessibility</h4>
                  <div className="space-y-3">
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm mb-1">Chrome Accessibility</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• ChromeVox screen reader extension</li>
                        <li>• Zoom controls (Ctrl + Plus/Minus)</li>
                        <li>• High contrast extension</li>
                        <li>• Voice typing in supported fields</li>
                      </ul>
                    </div>
                    <div className="bg-white rounded p-3">
                      <h5 className="font-semibold text-sm mb-1">Firefox Accessibility</h5>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Compatible with screen readers</li>
                        <li>• Text zoom without image scaling</li>
                        <li>• Keyboard navigation shortcuts</li>
                        <li>• Color and contrast extensions</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-800 mb-3">⌨️ Keyboard Accessibility</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>Tab Navigation:</strong> Move between interactive elements</p>
                    <p><strong>Enter/Space:</strong> Activate buttons and links</p>
                    <p><strong>Arrow Keys:</strong> Navigate within components</p>
                    <p><strong>Escape:</strong> Close dialogs and menus</p>
                    <p><strong>Shift + Tab:</strong> Navigate backwards</p>
                  </div>
                  
                  <div className="mt-3 p-2 bg-white rounded">
                    <p className="text-xs text-purple-700">
                      <strong>💡 Tip:</strong> Press F6 to cycle through page sections in most browsers
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">🛠️ Third-Party Assistive Technologies</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">👁️ Vision Assistance Tools</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">JAWS (Job Access With Speech)</h5>
                    <p className="text-xs text-gray-600">Professional screen reader, widely used in education and workplace</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">NVDA (NonVisual Desktop Access)</h5>
                    <p className="text-xs text-gray-600">Free, open-source screen reader for Windows</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">ZoomText</h5>
                    <p className="text-xs text-gray-600">Screen magnification with speech and reading tools</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Read&Write</h5>
                    <p className="text-xs text-gray-600">Literacy support toolbar with text-to-speech and more</p>
                  </div>
                </div>
              </div>

              <div className="bg-indigo-50 rounded-lg p-4">
                <h4 className="font-semibold text-indigo-800 mb-3">🎤 Hearing and Motor Assistance</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Dragon NaturallySpeaking</h5>
                    <p className="text-xs text-gray-600">Professional speech recognition software</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Otter.ai</h5>
                    <p className="text-xs text-gray-600">Real-time transcription for meetings and lectures</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Head Mouse</h5>
                    <p className="text-xs text-gray-600">Control mouse cursor with head movements</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">On-Screen Keyboard</h5>
                    <p className="text-xs text-gray-600">Virtual keyboard for users who cannot use physical keyboard</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📚 Learning Support Tools</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">📖 Reading Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Immersive Reader:</strong> Microsoft's built-in reading tool with highlighting and dictation
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Natural Reader:</strong> Text-to-speech with multiple voices and speeds
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>OpenDyslexic Font:</strong> Specialized font designed for dyslexic readers
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">✍️ Writing Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Grammarly:</strong> Grammar, spelling, and writing enhancement
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Ginger:</strong> Grammar checking with sentence rephrasing
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Word Prediction:</strong> Built into many word processors and browsers
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">🧠 Focus & Organization</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Cold Turkey:</strong> Website and application blocker for focus
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Brain.fm:</strong> Background music designed to improve focus
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>MindMeister:</strong> Visual mind mapping for organizing ideas
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
            <h2 className="text-3xl font-bold mb-4">🎯 Knowledge Check: Technology Readiness & Assistive Tools</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of technology requirements, ergonomics, accessibility features, and best practices for learning success.
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
                {currentQuestionIndex === 0 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_07_technology_readiness_question1"
                    title="System Requirements Knowledge"
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
                    cloudFunctionName="course4_07_technology_readiness_question2"
                    title="Internet Connection Requirements"
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
                    cloudFunctionName="course4_07_technology_readiness_question3"
                    title="Ergonomic Setup Best Practices"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(3);
                      setQuestionResults(prev => ({...prev, question3: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 3 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_07_technology_readiness_question4"
                    title="Accessibility Features Understanding"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(4);
                      setQuestionResults(prev => ({...prev, question4: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 4 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_07_technology_readiness_question5"
                    title="Proctored Exam Technology"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(5);
                      setQuestionResults(prev => ({...prev, question5: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 5 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_07_technology_readiness_question6"
                    title="Scenario: Technical Difficulties During Exam"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(6);
                      setQuestionResults(prev => ({...prev, question6: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 6 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_07_technology_readiness_question7"
                    title="Scenario: Student with Vision Impairment"
                    theme="indigo"
                    onAttempt={(isCorrect) => {
                      handleQuestionComplete(7);
                      setQuestionResults(prev => ({...prev, question7: isCorrect ? 'correct' : 'incorrect'}));
                    }}
                  />
                )}
                
                {currentQuestionIndex === 7 && (
                  <StandardMultipleChoiceQuestion
                    courseId={courseId}
                    cloudFunctionName="course4_07_technology_readiness_question8"
                    title="Scenario: Ergonomic Setup Problems"
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

      {/* Summary Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">🎉 You're Now Technology Ready for Success!</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-xl font-semibold mb-3">Technology Skills Mastered:</h3>
            <ul className="space-y-2 text-cyan-100">
              <li>✅ Understanding minimum hardware and software requirements</li>
              <li>✅ Setting up an ergonomic and productive workspace</li>
              <li>✅ Organizing digital files and implementing backup strategies</li>
              <li>✅ Utilizing accessibility features and assistive technologies</li>
              <li>✅ Knowing how to get technical support when needed</li>
              <li>✅ Following RTD Academy technology policies and best practices</li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-semibold mb-3">Your Technology Toolkit:</h3>
            <div className="space-y-2 text-cyan-100">
              <p>1. 🖥️ Properly configured computer and internet setup</p>
              <p>2. 🪑 Ergonomic workspace designed for long study sessions</p>
              <p>3. 📁 Organized file system with backup strategy</p>
              <p>4. ♿ Knowledge of accessibility features and assistive tools</p>
              <p>5. 🎧 RTD support contacts and self-help resources</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-white/10 backdrop-blur rounded-lg p-4">
          <p className="text-lg font-medium">
            🚀 Remember: Technology is your gateway to success at RTD Academy. With the right setup, 
            tools, and support, you're equipped to focus on learning and achieving your educational goals!
          </p>
        </div>
      </section>
    </div>
  );
};

export default TechnologyReadinessAssistiveTools;