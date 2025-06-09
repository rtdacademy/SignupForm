import React, { useState } from 'react';
import { AIMultipleChoiceQuestion } from '../../../../components/assessments';

const TechnologyReadinessAssistiveTools = ({ courseId }) => {
  const [activeSection, setActiveSection] = useState('overview');
  const [techChecklist, setTechChecklist] = useState({});
  const [workspaceSetup, setWorkspaceSetup] = useState({
    monitor: '',
    keyboard: '',
    mouse: '',
    chair: '',
    lighting: '',
    camera: '',
    audio: ''
  });
  const [assistiveTools, setAssistiveTools] = useState(['', '', '']);
  const [showChecklistResults, setShowChecklistResults] = useState(false);
  const [showWorkspaceResults, setShowWorkspaceResults] = useState(false);

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

  // Workspace setup options
  const workspaceOptions = {
    monitor: {
      correct: 'Eye level, arm\'s length away',
      options: [
        'Eye level, arm\'s length away',
        'Above eye level, close to face',
        'Below eye level, far away',
        'To the side, tilted'
      ]
    },
    keyboard: {
      correct: 'Level with elbows, wrists straight',
      options: [
        'Level with elbows, wrists straight',
        'Higher than elbows, wrists bent up',
        'Lower than elbows, wrists bent down',
        'Tilted at steep angle'
      ]
    },
    mouse: {
      correct: 'Same level as keyboard, close to body',
      options: [
        'Same level as keyboard, close to body',
        'Higher than keyboard, far reach',
        'On different surface, awkward angle',
        'On lap while typing'
      ]
    },
    chair: {
      correct: 'Feet flat on floor, back supported',
      options: [
        'Feet flat on floor, back supported',
        'Feet dangling, slouched posture',
        'Perched on edge, no back support',
        'Too high, leaning forward'
      ]
    },
    lighting: {
      correct: 'Soft, even lighting from side or front',
      options: [
        'Soft, even lighting from side or front',
        'Bright light directly behind monitor',
        'Only overhead fluorescent lighting',
        'Dark room with only screen light'
      ]
    },
    camera: {
      correct: 'Eye level, stable position, good lighting',
      options: [
        'Eye level, stable position, good lighting',
        'Below eye level, looking up',
        'Unstable, shaky positioning',
        'Poor lighting, hard to see'
      ]
    },
    audio: {
      correct: 'Headphones or headset to minimize echo',
      options: [
        'Headphones or headset to minimize echo',
        'Computer speakers at high volume',
        'No audio setup, rely on phone',
        'Bluetooth speakers across room'
      ]
    }
  };

  const handleChecklistChange = (itemId, checked) => {
    setTechChecklist(prev => ({
      ...prev,
      [itemId]: checked
    }));
  };

  const handleWorkspaceChange = (category, value) => {
    setWorkspaceSetup(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const handleAssistiveToolChange = (index, value) => {
    const newTools = [...assistiveTools];
    newTools[index] = value;
    setAssistiveTools(newTools);
  };

  const checkTechReadiness = () => {
    const criticalItems = techRequirements.filter(item => item.critical);
    const completedCritical = criticalItems.filter(item => techChecklist[item.id]).length;
    const totalCompleted = Object.values(techChecklist).filter(Boolean).length;
    
    setShowChecklistResults(true);
    return { criticalItems: criticalItems.length, completedCritical, totalCompleted, totalItems: techRequirements.length };
  };

  const checkWorkspaceSetup = () => {
    let correctCount = 0;
    Object.keys(workspaceOptions).forEach(category => {
      if (workspaceSetup[category] === workspaceOptions[category].correct) {
        correctCount++;
      }
    });
    setShowWorkspaceResults(true);
    return { correct: correctCount, total: Object.keys(workspaceOptions).length };
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-lg p-8">
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
            { id: 'organization', label: 'File Organization' },
            { id: 'accessibility', label: 'Accessibility Tools' },
            { id: 'checklist', label: 'Tech Checklist' },
            { id: 'workspace', label: 'Workspace Setup' },
            { id: 'support', label: 'RTD Tech Support' },
            { id: 'assessment', label: 'Knowledge Check' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeSection === tab.id
                  ? 'border-cyan-500 text-cyan-600'
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

      {/* File Organization Section */}
      {activeSection === 'organization' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">📁 File Organization & Digital Workflow</h2>
            <p className="text-gray-600 mb-6">
              Develop an organized digital filing system to manage course materials, assignments, and personal documents effectively.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🗂️ Recommended Folder Structure</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">📚 Course Organization System</h4>
                <div className="bg-white rounded p-3 font-mono text-sm">
                  <div className="space-y-1">
                    <div>📁 RTD Academy/</div>
                    <div className="ml-4">📁 2024-2025 School Year/</div>
                    <div className="ml-8">📁 Physics 30/</div>
                    <div className="ml-12">📁 01-Course Materials/</div>
                    <div className="ml-12">📁 02-Assignments/</div>
                    <div className="ml-16">📁 Completed/</div>
                    <div className="ml-16">📁 In Progress/</div>
                    <div className="ml-12">📁 03-Exams/</div>
                    <div className="ml-16">📁 Section 1/</div>
                    <div className="ml-16">📁 Section 2/</div>
                    <div className="ml-16">📁 Section 3/</div>
                    <div className="ml-12">📁 04-Notes/</div>
                    <div className="ml-12">📁 05-Resources/</div>
                    <div className="ml-8">📁 Math 30-1/</div>
                    <div className="ml-12">📁 (same structure)/</div>
                  </div>
                </div>
                <p className="text-xs text-purple-700 mt-2">
                  This structure keeps each course separate while maintaining consistent organization
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-800 mb-3">📋 File Naming Conventions</h4>
                  <div className="space-y-2 text-sm">
                    <div className="bg-white rounded p-2">
                      <strong>Assignments:</strong> CourseCode_Assignment#_YourName_Date
                      <br />
                      <span className="text-xs text-gray-600">Example: PHY30_Assignment01_JohnSmith_2024-03-15</span>
                    </div>
                    <div className="bg-white rounded p-2">
                      <strong>Notes:</strong> CourseCode_Lesson#_Topic_Date
                      <br />
                      <span className="text-xs text-gray-600">Example: PHY30_Lesson05_Momentum_2024-03-15</span>
                    </div>
                    <div className="bg-white rounded p-2">
                      <strong>Downloads:</strong> Keep original names, sort into folders
                      <br />
                      <span className="text-xs text-gray-600">Example: Move to appropriate course material folder</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-2">✅ Organization Best Practices</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Create folders before you need them</li>
                    <li>• Save files immediately in correct location</li>
                    <li>• Use consistent naming across all courses</li>
                    <li>• Include dates in YYYY-MM-DD format</li>
                    <li>• Backup important files regularly</li>
                    <li>• Clean up downloads folder weekly</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">☁️ Cloud Storage and Backup Strategy</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">🔄 Backup Options</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Google Drive</h5>
                    <p className="text-xs text-gray-600">15GB free, integrates with Google Docs, automatic sync</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">OneDrive</h5>
                    <p className="text-xs text-gray-600">5GB free, integrates with Microsoft Office, Windows built-in</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">iCloud</h5>
                    <p className="text-xs text-gray-600">5GB free, seamless Apple device integration</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">External Drive</h5>
                    <p className="text-xs text-gray-600">Physical backup, full control, no internet required</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">🛡️ Backup Strategy: 3-2-1 Rule</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div>
                      <p className="font-semibold text-sm">Keep 3 Copies</p>
                      <p className="text-xs text-gray-600">Original + 2 backups of important files</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div>
                      <p className="font-semibold text-sm">Use 2 Different Media</p>
                      <p className="text-xs text-gray-600">Cloud storage + external drive or second computer</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div>
                      <p className="font-semibold text-sm">Keep 1 Offsite</p>
                      <p className="text-xs text-gray-600">Cloud storage or external drive in different location</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-xs text-red-700">
                    <strong>⚠️ Critical:</strong> Back up assignments before submission deadlines!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">📱 Digital Workflow Tools</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">📝 Note-Taking Apps</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>OneNote:</strong> Free, syncs across devices, integrates with Office
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Notion:</strong> All-in-one workspace, great for organization
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Google Keep:</strong> Simple notes, reminders, mobile-friendly
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Obsidian:</strong> Advanced linking, great for research
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">📅 Planning Tools</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Google Calendar:</strong> Schedule classes, deadlines, reminders
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Todoist:</strong> Task management, project organization
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Trello:</strong> Visual project boards, collaboration
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Forest:</strong> Focus timer, productivity tracking
                  </div>
                </div>
              </div>

              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">🔧 Utility Apps</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>7-Zip:</strong> File compression, archive management
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Adobe Reader:</strong> PDF viewing, annotation, forms
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>f.lux:</strong> Blue light filter, eye strain reduction
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Everything:</strong> Instant file search (Windows)
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 File Management Pro Tips</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Daily Habits:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Save work every 10-15 minutes</li>
                  <li>• Name files immediately when created</li>
                  <li>• Move downloads to proper folders daily</li>
                  <li>• Use version numbers for important documents</li>
                  <li>• Delete unnecessary files weekly</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Assignment Workflow:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Create assignment folder when started</li>
                  <li>• Save drafts with version numbers</li>
                  <li>• Keep final version in separate folder</li>
                  <li>• Screenshot submission confirmations</li>
                  <li>• Archive completed work at term end</li>
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

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">🤝 Getting Support for Assistive Technology</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">RTD Academy Support:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span>Contact student services for accommodation requests</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span>Technical support available for accessibility features</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span>Alternative format materials when needed</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    <span>Extended time for assessments with documentation</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">External Resources:</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>CNIB Foundation for vision loss support</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Provincial assistive technology programs</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Post-secondary disability services</span>
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    <span>Community accessibility organizations</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-white rounded border border-blue-200">
              <h5 className="font-semibold text-sm mb-2">📝 Personal Assistive Tools Reflection:</h5>
              <p className="text-xs text-gray-600 mb-3">
                List three assistive tools or features that might benefit your learning experience:
              </p>
              <div className="space-y-2">
                {assistiveTools.map((tool, index) => (
                  <input
                    key={index}
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder={`Assistive tool ${index + 1} (e.g., screen reader, text-to-speech, magnifier)`}
                    value={tool}
                    onChange={(e) => handleAssistiveToolChange(index, e.target.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Tech Checklist Section */}
      {activeSection === 'checklist' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">✅ Interactive Technology Readiness Checklist</h2>
            <p className="text-gray-600 mb-6">
              Complete this comprehensive checklist to ensure your technology setup is ready for RTD Academy courses.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-green-700">🔍 System Requirements Check</h3>
            
            <div className="space-y-4">
              {techRequirements.map((item) => (
                <div key={item.id} className={`border rounded-lg p-4 ${
                  item.critical ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id={item.id}
                      checked={techChecklist[item.id] || false}
                      onChange={(e) => handleChecklistChange(item.id, e.target.checked)}
                      className={`mt-1 ${item.critical ? 'text-red-600' : 'text-green-600'}`}
                    />
                    <div className="flex-grow">
                      <label htmlFor={item.id} className="flex items-center space-x-2 cursor-pointer">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          item.critical 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {item.category}
                        </span>
                        {item.critical && (
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-200 text-red-900">
                            CRITICAL
                          </span>
                        )}
                      </label>
                      <p className="font-medium text-sm mt-1">{item.requirement}</p>
                      <p className="text-xs text-gray-600 mt-1">{item.explanation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={checkTechReadiness}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
              >
                🔍 Check My Tech Readiness
              </button>
            </div>

            {showChecklistResults && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">📊 Your Technology Readiness Report</h4>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {checkTechReadiness().completedCritical}/{checkTechReadiness().criticalItems}
                    </div>
                    <div className="text-xs text-gray-600">Critical Requirements Met</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {checkTechReadiness().totalCompleted}/{checkTechReadiness().totalItems}
                    </div>
                    <div className="text-xs text-gray-600">Total Requirements Met</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round((checkTechReadiness().totalCompleted / checkTechReadiness().totalItems) * 100)}%
                    </div>
                    <div className="text-xs text-gray-600">Overall Readiness</div>
                  </div>
                </div>

                <div className="mt-4">
                  {checkTechReadiness().completedCritical === checkTechReadiness().criticalItems ? (
                    <div className="p-3 bg-green-100 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        <strong>✅ Excellent!</strong> You meet all critical requirements for RTD Academy courses.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-100 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>⚠️ Action Required!</strong> You need to address the missing critical requirements before starting courses.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Workspace Setup Activity Section */}
      {activeSection === 'workspace' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🏗️ Virtual Workspace Setup Activity</h2>
            <p className="text-gray-600 mb-6">
              Test your knowledge of proper workspace ergonomics by selecting the best setup option for each workspace element.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🪑 Ergonomic Setup Quiz</h3>
            <p className="text-sm text-gray-600 mb-6">
              For each workspace element, select the option that represents the most ergonomic and professional setup.
            </p>
            
            <div className="space-y-6">
              {Object.entries(workspaceOptions).map(([category, data]) => (
                <div key={category} className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold mb-3 capitalize">{category.replace(/([A-Z])/g, ' $1')} Setup:</h4>
                  <div className="space-y-2">
                    {data.options.map((option, index) => (
                      <label key={index} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={category}
                          value={option}
                          checked={workspaceSetup[category] === option}
                          onChange={(e) => handleWorkspaceChange(category, e.target.value)}
                          className="text-purple-600"
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={checkWorkspaceSetup}
                disabled={Object.values(workspaceSetup).some(value => value === '')}
                className={`px-6 py-3 rounded-lg font-medium ${
                  Object.values(workspaceSetup).every(value => value !== '')
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                🔍 Check My Workspace Setup
              </button>
            </div>

            {showWorkspaceResults && (
              <div className="mt-6 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-3">🏆 Workspace Setup Results</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {checkWorkspaceSetup().correct}/{checkWorkspaceSetup().total}
                    </div>
                    <div className="text-sm text-gray-600">Correct Ergonomic Choices</div>
                  </div>
                  <div className="bg-white rounded p-3 text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {Math.round((checkWorkspaceSetup().correct / checkWorkspaceSetup().total) * 100)}%
                    </div>
                    <div className="text-sm text-gray-600">Ergonomic Score</div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {Object.entries(workspaceOptions).map(([category, data]) => (
                    <div key={category} className={`p-2 rounded text-sm ${
                      workspaceSetup[category] === data.correct
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <strong>{category.charAt(0).toUpperCase() + category.slice(1)}:</strong>
                      {workspaceSetup[category] === data.correct ? (
                        <span> ✅ Correct choice!</span>
                      ) : (
                        <span> ❌ Better choice: {data.correct}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  {checkWorkspaceSetup().correct >= 6 ? (
                    <div className="p-3 bg-green-100 border border-green-200 rounded">
                      <p className="text-sm text-green-800">
                        <strong>🎉 Excellent!</strong> You have a great understanding of ergonomic workspace setup.
                      </p>
                    </div>
                  ) : checkWorkspaceSetup().correct >= 4 ? (
                    <div className="p-3 bg-yellow-100 border border-yellow-200 rounded">
                      <p className="text-sm text-yellow-800">
                        <strong>👍 Good work!</strong> Review the areas you missed to optimize your workspace.
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 bg-red-100 border border-red-200 rounded">
                      <p className="text-sm text-red-800">
                        <strong>📚 Keep Learning!</strong> Consider reviewing the ergonomics section to improve your setup.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">💭 Personal Assistive Tools Assessment</h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on what you've learned about accessibility features, list three assistive tools or features 
              that might benefit your learning experience at RTD Academy:
            </p>
            
            <div className="space-y-3">
              {assistiveTools.map((tool, index) => (
                <div key={index} className="bg-white rounded-lg p-3">
                  <label className="block text-sm font-medium mb-2">
                    Assistive Tool {index + 1}:
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="e.g., Screen reader for visual content, Text-to-speech for long readings, Magnifier for small text"
                    value={tool}
                    onChange={(e) => handleAssistiveToolChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-3 bg-white rounded border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>💡 Remember:</strong> RTD Academy is committed to supporting all learners. Contact student services 
                if you need assistance with accessibility accommodations or assistive technology setup.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* RTD Tech Support Section */}
      {activeSection === 'support' && (
        <section className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold mb-4">🛠️ RTD Academy Technology Support</h2>
            <p className="text-gray-600 mb-6">
              Learn about available technical support services, policies, and resources to help you succeed.
            </p>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-blue-700">📞 Getting Technical Help</h3>
            
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">🎧 RTD Technical Support</h4>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">Contact Information</h5>
                    <div className="text-xs text-gray-600 space-y-1">
                      <p>📧 Email: support@rtdacademy.com</p>
                      <p>📞 Phone: 403.351.0896</p>
                      <p>⏰ Hours: Monday-Friday, 8:00 AM - 5:00 PM MST</p>
                      <p>🌐 Online: Submit ticket through student portal</p>
                    </div>
                  </div>
                  <div className="bg-white rounded p-3">
                    <h5 className="font-semibold text-sm mb-1">What Support Covers</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• LMS access and navigation issues</li>
                      <li>• Browser compatibility problems</li>
                      <li>• Exam platform technical difficulties</li>
                      <li>• Microsoft Teams setup and troubleshooting</li>
                      <li>• File upload and submission problems</li>
                      <li>• Password resets and account access</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-4">
                  <h4 className="font-semibold text-green-800 mb-3">🚨 Emergency Technical Support</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><strong>During Exams:</strong> Immediate support available via phone during scheduled exam times</p>
                    <p><strong>Critical Deadlines:</strong> Extended support hours during major assignment due dates</p>
                    <p><strong>After Hours:</strong> Leave voicemail with detailed issue description for next-day callback</p>
                    <p><strong>Weekend Support:</strong> Limited support available for urgent academic matters</p>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-800 mb-3">📋 Before Contacting Support</h4>
                  <div className="space-y-1 text-sm text-gray-700">
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span>Try refreshing your browser and clearing cache</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span>Check your internet connection stability</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span>Verify you're using a supported browser</span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                      <span>Check RTD Academy status page for known issues</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-purple-700">🎯 Self-Help Resources</h3>
            
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-purple-50 rounded-lg p-4">
                <h4 className="font-semibold text-purple-800 mb-3">📚 Knowledge Base</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Getting Started Guides:</strong> Step-by-step tutorials for new students
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Video Tutorials:</strong> Visual guides for common tasks and features
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>FAQs:</strong> Answers to frequently asked technical questions
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Troubleshooting Guides:</strong> Solutions for common technical issues
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-4">
                <h4 className="font-semibold text-green-800 mb-3">🛠️ System Tools</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Connection Test:</strong> Verify your internet speed and stability
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Browser Check:</strong> Test browser compatibility and settings
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Audio/Video Test:</strong> Verify camera and microphone functionality
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>System Requirements:</strong> Check if your computer meets minimum specs
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-semibold text-blue-800 mb-3">👥 Community Support</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-white rounded p-2">
                    <strong>Student Forums:</strong> Connect with other students for peer help
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Study Groups:</strong> Technical help from classmates
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Office Hours:</strong> Instructor availability for tech questions
                  </div>
                  <div className="bg-white rounded p-2">
                    <strong>Peer Tutoring:</strong> Student mentors for technology guidance
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-xl font-semibold mb-4 text-orange-700">📜 Technology Policies</h3>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-orange-50 rounded-lg p-4">
                <h4 className="font-semibold text-orange-800 mb-3">⚖️ Acceptable Use Policy</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Appropriate Use:</strong> RTD technology resources are for educational purposes only</p>
                  <p><strong>Prohibited Activities:</strong> No illegal downloads, harassment, or commercial use</p>
                  <p><strong>Security:</strong> Students must protect login credentials and report security issues</p>
                  <p><strong>Respect:</strong> Be considerate of shared resources and other users</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold mb-3">🔒 Privacy and Data Protection</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Personal Information:</strong> RTD protects student data according to privacy laws</p>
                  <p><strong>Monitoring:</strong> System logs may be reviewed for security and troubleshooting</p>
                  <p><strong>Sharing:</strong> Don't share account access or personal information online</p>
                  <p><strong>Backup:</strong> Students responsible for backing up their own work</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-3 text-yellow-800">💡 Technology Success Tips</h3>
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div>
                <h4 className="font-semibold mb-2">Proactive Preparation:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Test your setup before each new course starts</li>
                  <li>• Keep backup devices and internet options ready</li>
                  <li>• Update software and browsers regularly</li>
                  <li>• Save important phone numbers and contact info</li>
                  <li>• Practice using all required platforms early</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold mb-2">When Issues Arise:</h4>
                <ul className="space-y-1 text-gray-700">
                  <li>• Document error messages and screenshot issues</li>
                  <li>• Contact support early, don't wait until deadlines</li>
                  <li>• Have alternative plans for exam days</li>
                  <li>• Keep communication open with instructors</li>
                  <li>• Use mobile devices as backup when needed</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Assessment Section */}
      {activeSection === 'assessment' && (
        <section className="space-y-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">🎯 Technology Readiness Assessment</h2>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              Test your understanding of technology requirements, ergonomics, accessibility features, and RTD support policies.
            </p>
          </div>

          <AIMultipleChoiceQuestion
            courseId={courseId}
            assessmentId="07_technology_readiness_assistive_tools_practice"
            cloudFunctionName="course4_07_technology_readiness_assistive_tools_aiQuestion"
            title="Technology Setup & Support Mastery"
            theme="cyan"
          />
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